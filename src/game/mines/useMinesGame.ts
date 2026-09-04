import { useState, useEffect, useRef, useCallback } from 'react';
import type { Cell, Phase, RoundResult, BetRecord } from './types';
import {
  genSeeds,
  generateMinePositions,
  createGrid,
  multiplierForRevealed,
  createRoundResult,
  GRID_SIZE,
} from './engine';

export function useMinesGame() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [grid, setGrid] = useState<Cell[]>(() => createGrid());
  const [betAmount, setBetAmount] = useState(0.01);
  const [minesCount, setMinesCount] = useState(3);
  const [revealedCount, setRevealedCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [seeds, setSeeds] = useState<{ serverSeed: string; clientSeed: string; serverSeedHash: string }>({ serverSeed: '', clientSeed: '', serverSeedHash: '' });
  const [revealedSeed, setRevealedSeed] = useState<string | null>(null);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [betRecords, setBetRecords] = useState<BetRecord[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [showAllMines, setShowAllMines] = useState(false);

  const minePositionsRef = useRef<number[]>([]);
  const seedsRef = useRef(seeds);
  const roundNumRef = useRef(1);
  const phaseRef = useRef<Phase>('idle');

  useEffect(() => { seedsRef.current = seeds; }, [seeds]);
  useEffect(() => { roundNumRef.current = roundNumber; }, [roundNumber]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const startRound = useCallback(async () => {
    const newSeeds = await genSeeds();
    const positions = generateMinePositions(
      newSeeds.serverSeed,
      newSeeds.clientSeed,
      roundNumRef.current,
      minesCount,
    );
    minePositionsRef.current = positions;
    seedsRef.current = newSeeds;
    setSeeds(newSeeds);
    setRevealedSeed(null);
    setGrid(() => {
      const g = createGrid();
      for (const p of positions) {
        g[p].isMine = true;
      }
      return g;
    });
    setRevealedCount(0);
    setMultiplier(1);
    setShowAllMines(false);
    setLastResult(null);
    setPhase('playing');
    phaseRef.current = 'playing';
  }, [minesCount]);

  const revealCell = useCallback((index: number) => {
    if (phaseRef.current !== 'playing') return;

    setGrid((prev) => {
      if (prev[index].state !== 'hidden') return prev;
      const next = [...prev];
      const cell = { ...next[index] };
      const positions = minePositionsRef.current;

      if (positions.includes(index)) {
        cell.state = 'revealed_mine';
        next[index] = cell;
        setShowAllMines(true);
        setPhase('busted');
        phaseRef.current = 'busted';
        const result = createRoundResult(
          `r${roundNumRef.current}`,
          minesCount,
          0,
          0,
          'loss',
          0,
          betAmount,
          seedsRef.current,
        );
        setLastResult(result);
        setHistory((h) => [result, ...h].slice(0, 20));
        setBetRecords((prevRecs) => [{
          id: `br${Date.now()}`,
          roundId: `r${roundNumRef.current}`,
          amount: betAmount,
          minesCount,
          multiplier: null,
          result: 'loss' as const,
          payout: 0,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        }, ...prevRecs].slice(0, 30));
        setTimeout(() => {
          setPhase('idle');
          phaseRef.current = 'idle';
          setRoundNumber((n) => n + 1);
        }, 2500);
        return next;
      }

      cell.state = 'revealed_safe';
      next[index] = cell;

      const newRevealed = prev.filter((c) => c.state === 'revealed_safe').length + 1;
      setRevealedCount(newRevealed);
      const m = multiplierForRevealed(newRevealed, minesCount);
      setMultiplier(m);

      const safeTotal = GRID_SIZE - minesCount;
      if (newRevealed >= safeTotal) {
        const payout = Math.floor(betAmount * m * 100) / 100;
        setShowAllMines(true);
        setPhase('cashout');
        phaseRef.current = 'cashout';
        const result = createRoundResult(
          `r${roundNumRef.current}`,
          minesCount,
          newRevealed,
          m,
          'win',
          payout,
          betAmount,
          seedsRef.current,
        );
        setLastResult(result);
        setHistory((h) => [result, ...h].slice(0, 20));
        setBetRecords((prevRecs) => [{
          id: `br${Date.now()}`,
          roundId: `r${roundNumRef.current}`,
          amount: betAmount,
          minesCount,
          multiplier: m,
          result: 'win' as const,
          payout,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        }, ...prevRecs].slice(0, 30));
        setTimeout(() => {
          setPhase('idle');
          phaseRef.current = 'idle';
          setRoundNumber((n) => n + 1);
        }, 3000);
      }

      return next;
    });
  }, [betAmount, minesCount]);

  const cashOut = useCallback(() => {
    if (phaseRef.current !== 'playing' || revealedCount === 0) return;
    const payout = Math.floor(betAmount * multiplier * 100) / 100;
    setShowAllMines(true);
    setPhase('cashout');
    phaseRef.current = 'cashout';
    setRevealedSeed(seedsRef.current.serverSeed);
    const result = createRoundResult(
      `r${roundNumRef.current}`,
      minesCount,
      revealedCount,
      multiplier,
      'win',
      payout,
      betAmount,
      seedsRef.current,
    );
    setLastResult(result);
    setHistory((h) => [result, ...h].slice(0, 20));
    setBetRecords((prevRecs) => [{
      id: `br${Date.now()}`,
      roundId: `r${roundNumRef.current}`,
      amount: betAmount,
      minesCount,
      multiplier,
      result: 'win' as const,
      payout,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    }, ...prevRecs].slice(0, 30));
    setTimeout(() => {
      setPhase('idle');
      phaseRef.current = 'idle';
      setRoundNumber((n) => n + 1);
    }, 3000);
  }, [betAmount, minesCount, multiplier, revealedCount]);

  const quickAmount = useCallback((type: 'half' | 'double' | 'min' | 'max') => {
    setBetAmount((prev) => {
      if (type === 'half') return Math.max(0.001, Math.floor(prev / 2 * 1000) / 1000);
      if (type === 'double') return Math.min(1, prev * 2);
      if (type === 'min') return 0.001;
      return 1;
    });
  }, []);

  return {
    phase,
    grid,
    betAmount,
    minesCount,
    revealedCount,
    multiplier,
    seeds,
    revealedSeed,
    history,
    betRecords,
    roundNumber,
    lastResult,
    showAllMines,
    setBetAmount,
    setMinesCount,
    startRound,
    revealCell,
    cashOut,
    quickAmount,
  };
}
