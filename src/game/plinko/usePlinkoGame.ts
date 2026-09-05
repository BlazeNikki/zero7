import { useState, useRef, useCallback, useEffect } from 'react';
import type { Risk, Rows, Ball, RoundResult, BetRecord, Seeds } from './types';
import {
  genSeeds, generatePath, getMultiplier, MAX_BALLS, MIN_BET, MAX_BET,
} from './engine';
import { placeBet, settleBet, type SolNetwork } from '@/lib/solana-bet';
import { useWallet } from '@/lib/wallet';
import { useNetwork } from '@/lib/network-context';

let ballIdCounter = 0;

export function usePlinkoGame() {
  const wallet = useWallet();
  const { network } = useNetwork();
  const [betAmount, setBetAmount] = useState(0.01);
  const [rows, setRows] = useState<Rows>(12);
  const [risk, setRisk] = useState<Risk>('medium');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [betRecords, setBetRecords] = useState<BetRecord[]>([]);
  const [seeds, setSeeds] = useState<Seeds>({ serverSeed: '', clientSeed: '', serverSeedHash: '' });
  const [seedsReady, setSeedsReady] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const [autoTarget, setAutoTarget] = useState(0);
  const [autoProfit, setAutoProfit] = useState(0);
  const [lastWin, setLastWin] = useState<{ amount: number; multiplier: number; slot: number; ballId: number } | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const seedsRef = useRef(seeds);
  const nonceRef = useRef(0);
  const autoModeRef = useRef(false);
  const autoTargetRef = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ballsRef = useRef<Ball[]>(balls);
  const betAmountRef = useRef(betAmount);
  const rowsRef = useRef(rows);
  const riskRef = useRef(risk);

  useEffect(() => { seedsRef.current = seeds; }, [seeds]);
  useEffect(() => { nonceRef.current = nonce; }, [nonce]);
  useEffect(() => { autoModeRef.current = autoMode; }, [autoMode]);
  useEffect(() => { autoTargetRef.current = autoTarget; }, [autoTarget]);
  useEffect(() => { betAmountRef.current = betAmount; }, [betAmount]);
  useEffect(() => { ballsRef.current = balls; }, [balls]);
  useEffect(() => { rowsRef.current = rows; }, [rows]);
  useEffect(() => { riskRef.current = risk; }, [risk]);

  // Initialize seeds asynchronously (genSeeds is now async)
  useEffect(() => {
    let cancelled = false;
    genSeeds().then((s) => {
      if (cancelled) return;
      setSeeds(s);
      setSeedsReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const dropBall = useCallback(async () => {
    if (!seedsReady) return;
    if (balls.length >= MAX_BALLS) return;
    if (!wallet.address) return;

    const currentBet = betAmountRef.current;
    setIsPlacingBet(true);

    // Place on-chain bet
    let betId: string | null = null;
    try {
      const result = await placeBet(wallet.address, 'plinko', currentBet, network as SolNetwork);
      betId = result.betId;
    } catch {
      setIsPlacingBet(false);
      return;
    }
    setIsPlacingBet(false);

    const currentNonce = nonceRef.current;
    const currentRows = rowsRef.current;
    const currentRisk = riskRef.current;
    const isAuto = autoModeRef.current;

    generatePath(
      seedsRef.current.serverSeed,
      seedsRef.current.clientSeed,
      currentNonce,
      currentRows,
    ).then(({ path, slot }) => {
      const mult = getMultiplier(currentRows, currentRisk, slot);
      const payout = Math.floor(currentBet * mult * 100) / 100;
      const ball: Ball = {
        id: ballIdCounter++,
        startX: 0.5 + (Math.random() - 0.5) * 0.08,
        slot,
        path,
        startTime: performance.now(),
        duration: 3500 + Math.random() * 600,
        x: 0.5,
        y: 0,
        done: false,
        payout,
        multiplier: mult,
        betAmount: currentBet,
        rows: currentRows,
        risk: currentRisk,
        nonce: currentNonce,
        isAuto,
      };
      setNonce((n) => n + 1);
      setBalls((prev) => (prev.length >= MAX_BALLS ? prev : [...prev, ball]));
      // Store betId for settle when ball lands
      ballBetIdsRef.current.set(ball.id, betId);
    });
  }, [seedsReady, balls.length, wallet.address, network]);

  const processedBallsRef = useRef<Set<number>>(new Set());
  const ballBetIdsRef = useRef<Map<number, string | null>>(new Map());

  const removeBall = useCallback((id: number) => {
    if (processedBallsRef.current.has(id)) return;
    processedBallsRef.current.add(id);

    const ball = ballsRef.current.find((b) => b.id === id);
    setBalls((prev) => prev.filter((b) => b.id !== id));
    if (!ball) return;

    const bet = ball.betAmount;
    const result: RoundResult = {
      id: `r${id}`,
      rows: ball.rows,
      risk: ball.risk,
      slot: ball.slot,
      multiplier: ball.multiplier,
      betAmount: bet,
      payout: ball.payout,
      serverSeed: seedsRef.current.serverSeed,
      serverSeedHash: seedsRef.current.serverSeedHash,
      clientSeed: seedsRef.current.clientSeed,
      nonce: ball.nonce,
      path: ball.path,
      timestamp: Date.now(),
    };
    setHistory((h) => [result, ...h].slice(0, 20));
    setBetRecords((prevRecs) => [{
      id: `br${id}`,
      amount: bet,
      multiplier: ball.multiplier,
      result: (ball.payout > bet ? 'win' : 'loss') as 'win' | 'loss',
      payout: ball.payout,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    }, ...prevRecs].slice(0, 30));
    setLastWin({ amount: ball.payout, multiplier: ball.multiplier, slot: ball.slot, ballId: id });
    if (ball.isAuto) {
      setAutoProfit((p) => p + (ball.payout - bet));
    }
    // Settle on-chain bet
    const ballBetId = ballBetIdsRef.current.get(id);
    ballBetIdsRef.current.delete(id);
    if (ballBetId) {
      const isWin = ball.payout > bet;
      settleBet(ballBetId, isWin ? 'win' : 'loss', isWin ? ball.payout : 0, ball.multiplier, network as SolNetwork).then(() => {
        wallet.refreshInternalBalance();
      }).catch(() => {});
    }
  }, []);

  const startAuto = useCallback((count: number) => {
    setAutoMode(true);
    setAutoTarget(count);
    setAutoCount(0);
    setAutoProfit(0);
    autoModeRef.current = true;
    autoTargetRef.current = count;
  }, []);

  const stopAuto = useCallback(() => {
    setAutoMode(false);
    setAutoCount(0);
    setAutoTarget(0);
    autoModeRef.current = false;
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  // Auto-play: real 600ms interval, not triggered by balls.length changes
  useEffect(() => {
    if (!autoMode) return;
    if (autoCount >= autoTarget && autoTarget !== Infinity) {
      stopAuto();
      return;
    }
    if (autoCount >= autoTarget) return;

    autoTimerRef.current = setTimeout(() => {
      dropBall();
      setAutoCount((c) => c + 1);
    }, 600);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [autoMode, autoCount, autoTarget, dropBall, stopAuto]);

  const quickAmount = useCallback((type: 'half' | 'double' | 'min' | 'max') => {
    setBetAmount((prev) => {
      if (type === 'half') return Math.max(0.001, Math.floor(prev / 2 * 1000) / 1000);
      if (type === 'double') return Math.min(1, prev * 2);
      if (type === 'min') return 0.001;
      return 1;
    });
  }, []);

  return {
    betAmount,
    rows,
    risk,
    balls,
    history,
    betRecords,
    seeds,
    seedsReady,
    nonce,
    autoMode,
    autoCount,
    autoTarget,
    autoProfit,
    lastWin,
    isPlacingBet,
    setBetAmount,
    setRows,
    setRisk,
    dropBall,
    removeBall,
    startAuto,
    stopAuto,
    quickAmount,
  };
}
