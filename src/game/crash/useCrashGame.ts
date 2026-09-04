import { useState, useEffect, useRef, useCallback } from 'react';
import type { Phase, BetSlotState, SimPlayer, RoundResult, BetRecord } from './types';
import { genSeeds, calcCrashPoint, multiplierAt, genSimPlayers, simPlayerCashoutTarget } from './engine';

import { MIN_SOL_BET, MAX_SOL_BET, SOL_STEP } from '@/lib/sol-bet';

const BETTING_DURATION = 6000; // 6s betting phase
const RESULT_DURATION = 3000; // 3s result pause
const MAX_CAP = 1000; // max multiplier cap

type GameLoop = {
  phase: Phase;
  multiplier: number;
  countdown: number;
  crashPoint: number;
  roundNumber: number;
  history: RoundResult[];
  simPlayers: SimPlayer[];
  seeds: { serverSeed: string; serverSeedHash: string; clientSeed: string };
  revealedSeed: string | null;
  betSlots: [BetSlotState, BetSlotState];
  betRecords: BetRecord[];
  placeBet: (slot: 0 | 1) => void;
  cashOut: (slot: 0 | 1) => void;
  updateBetSlot: (slot: 0 | 1, patch: Partial<BetSlotState>) => void;
};

export function useCrashGame(): GameLoop {
  const [phase, setPhase] = useState<Phase>('betting');
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(BETTING_DURATION);
  const [roundNumber, setRoundNumber] = useState(1);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [simPlayers, setSimPlayers] = useState<SimPlayer[]>([]);
  const [seeds, setSeeds] = useState(() => genSeeds());
  const [revealedSeed, setRevealedSeed] = useState<string | null>(null);
  const [crashPoint, setCrashPoint] = useState(1);

  const [betSlots, setBetSlots] = useState<[BetSlotState, BetSlotState]>([
    { amount: 0.01, mode: 'manual', autoCashout: 2, placed: false, cashedOut: false, cashoutMultiplier: null, winAmount: null, autoNextRound: false },
    { amount: 0.01, mode: 'manual', autoCashout: 2, placed: false, cashedOut: false, cashoutMultiplier: null, winAmount: null, autoNextRound: false },
  ]);
  const [betRecords, setBetRecords] = useState<BetRecord[]>([]);

  const crashPointRef = useRef(1);
  const phaseRef = useRef<Phase>('betting');
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const simTargetsRef = useRef<Map<string, number>>(new Map());
  const slotsRef = useRef(betSlots);
  const roundNumRef = useRef(1);
  const hiddenSinceRef = useRef<number | null>(null);

  useEffect(() => { slotsRef.current = betSlots; }, [betSlots]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundNumRef.current = roundNumber; }, [roundNumber]);

  // Start a new round
  const startBetting = useCallback(() => {
    const newSeeds = genSeeds();
    const point = calcCrashPoint(newSeeds.serverSeed, newSeeds.clientSeed, roundNumRef.current);
    crashPointRef.current = Math.min(point, MAX_CAP);
    setCrashPoint(crashPointRef.current);
    setSeeds(newSeeds);
    setRevealedSeed(null);
    setMultiplier(1);
    setCountdown(BETTING_DURATION);
    setPhase('betting');
    phaseRef.current = 'betting';

    // Generate sim players
    const players = genSimPlayers(8 + Math.floor(Math.random() * 12));
    const targets = new Map<string, number>();
    for (const p of players) {
      targets.set(p.id, simPlayerCashoutTarget());
    }
    simTargetsRef.current = targets;
    setSimPlayers(players);

    // Auto-place bets for slots with autoNextRound
    setBetSlots((prev) => {
      const next = [...prev] as [BetSlotState, BetSlotState];
      for (let i = 0; i < 2; i++) {
        if (next[i].autoNextRound && next[i].mode === 'auto') {
          next[i] = { ...next[i], placed: true, cashedOut: false, cashoutMultiplier: null, winAmount: null };
        } else {
          next[i] = { ...next[i], placed: false, cashedOut: false, cashoutMultiplier: null, winAmount: null };
        }
      }
      return next;
    });
  }, []);

  // Initial start
  useEffect(() => {
    startBetting();
  }, [startBetting]);

  // Betting countdown
  useEffect(() => {
    if (phase !== 'betting') return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 100;
        if (next <= 0) {
          clearInterval(interval);
          // Start running
          startTimeRef.current = performance.now();
          setPhase('running');
          phaseRef.current = 'running';
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);

  // Running phase — RAF loop
  useEffect(() => {
    if (phase !== 'running') return;

    const loop = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const m = multiplierAt(elapsed);

      if (m >= crashPointRef.current) {
        // Crash!
        setMultiplier(crashPointRef.current);
        setPhase('crashed');
        phaseRef.current = 'crashed';
        setRevealedSeed(seeds.serverSeed);

        // Record result
        const result: RoundResult = {
          id: `r${roundNumRef.current}`,
          crashPoint: crashPointRef.current,
          serverSeed: seeds.serverSeed.slice(0, 8) + '...',
          serverSeedHash: seeds.serverSeedHash.slice(0, 8) + '...',
          clientSeed: seeds.clientSeed.slice(0, 8) + '...',
          timestamp: Date.now(),
        };
        setHistory((prev) => [result, ...prev].slice(0, 20));

        // Process lost bets
        const slots = slotsRef.current;
        const newRecords: BetRecord[] = [];
        for (let i = 0; i < 2; i++) {
          if (slots[i].placed && !slots[i].cashedOut) {
            newRecords.push({
              id: `br${Date.now()}_${i}`,
              roundId: `r${roundNumRef.current}`,
              amount: slots[i].amount,
              multiplier: null,
              result: 'loss',
              payout: 0,
              time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }
        if (newRecords.length) setBetRecords((prev) => [...newRecords, ...prev].slice(0, 30));

        // Mark non-cashed-out sim players as lost
        setSimPlayers((prev) => prev.map((p) =>
          p.cashedOut ? p : { ...p, cashoutMultiplier: null }
        ));

        return;
      }

      setMultiplier(m);

      // Auto-cashout for player slots
      const slots = slotsRef.current;
      for (let i = 0; i < 2; i++) {
        if (slots[i].placed && !slots[i].cashedOut && slots[i].mode === 'auto' && slots[i].autoCashout > 0 && m >= slots[i].autoCashout) {
          cashOutInternal(i as 0 | 1, m);
        }
      }

      // Sim player cashouts
      setSimPlayers((prev) => prev.map((p) => {
        if (p.cashedOut) return p;
        const target = simTargetsRef.current.get(p.id);
        if (target && m >= target && target < crashPointRef.current) {
          return { ...p, cashedOut: true, cashoutMultiplier: target };
        }
        return p;
      }));

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [phase, seeds]);

  // Crashed → result transition (separate from RAF effect to avoid cleanup race)
  useEffect(() => {
    if (phase !== 'crashed') return;
    const t = setTimeout(() => {
      setPhase('result');
      phaseRef.current = 'result';
    }, 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // Adjust startTime when tab was hidden so multiplier doesn't jump
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        hiddenSinceRef.current = performance.now();
      } else if (hiddenSinceRef.current !== null) {
        const hiddenFor = performance.now() - hiddenSinceRef.current;
        if (phaseRef.current === 'running') {
          startTimeRef.current += hiddenFor;
        }
        hiddenSinceRef.current = null;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Result → next round
  useEffect(() => {
    if (phase !== 'result') return;
    const timer = setTimeout(() => {
      setRoundNumber((prev) => prev + 1);
      startBetting();
    }, RESULT_DURATION);
    return () => clearTimeout(timer);
  }, [phase, startBetting]);

  const cashOutInternal = (slot: 0 | 1, m: number) => {
    let didCashOut = false;
    let winAmount = 0;
    let betAmount = 0;
    setBetSlots((prev) => {
      const next = [...prev] as [BetSlotState, BetSlotState];
      if (!next[slot].placed || next[slot].cashedOut) return prev;
      const win = Math.floor(next[slot].amount * m * 100) / 100;
      next[slot] = { ...next[slot], cashedOut: true, cashoutMultiplier: m, winAmount: win };
      didCashOut = true;
      winAmount = win;
      betAmount = next[slot].amount;
      return next;
    });

    if (didCashOut) {
      setBetRecords((prev) => [{
        id: `br${Date.now()}_${slot}`,
        roundId: `r${roundNumRef.current}`,
        amount: betAmount,
        multiplier: m,
        result: 'win' as const,
        payout: winAmount,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev].slice(0, 30));
    }
  };

  const placeBet = (slot: 0 | 1) => {
    setBetSlots((prev) => {
      const next = [...prev] as [BetSlotState, BetSlotState];
      next[slot] = { ...next[slot], placed: true, cashedOut: false, cashoutMultiplier: null, winAmount: null };
      return next;
    });
  };

  const cashOut = (slot: 0 | 1) => {
    cashOutInternal(slot, multiplier);
  };

  const updateBetSlot = (slot: 0 | 1, patch: Partial<BetSlotState>) => {
    setBetSlots((prev) => {
      const next = [...prev] as [BetSlotState, BetSlotState];
      next[slot] = { ...next[slot], ...patch };
      return next;
    });
  };

  return {
    phase,
    multiplier,
    countdown,
    crashPoint,
    roundNumber,
    history,
    simPlayers,
    seeds,
    revealedSeed,
    betSlots,
    betRecords,
    placeBet,
    cashOut,
    updateBetSlot,
  };
}
