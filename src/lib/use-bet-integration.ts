import { useState, useCallback, useRef } from 'react';
import { useWallet } from './wallet';
import { useNetwork } from './network-context';
import { placeBet, settleBet, type SolNetwork } from './solana-bet';

type BetState = 'idle' | 'sending' | 'verifying' | 'active' | 'settling' | 'done' | 'error';

type UseBetIntegrationResult = {
  betState: BetState;
  activeBetId: string | null;
  error: string | null;
  startBet: (gameSlug: string, amountSol: number) => Promise<string | null>;
  endBet: (result: 'win' | 'loss', payoutSol: number, multiplier?: number) => Promise<void>;
  reset: () => void;
};

export function useBetIntegration(): UseBetIntegrationResult {
  const wallet = useWallet();
  const { network } = useNetwork();
  const [betState, setBetState] = useState<BetState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activeBetId, setActiveBetId] = useState<string | null>(null);
  const activeBetRef = useRef<string | null>(null);

  const startBet = useCallback(async (gameSlug: string, amountSol: number): Promise<string | null> => {
    if (!wallet.address) {
      setError('Wallet not connected');
      setBetState('error');
      return null;
    }

    setBetState('sending');
    setError(null);

    try {
      const result = await placeBet(wallet.address, gameSlug, amountSol, network as SolNetwork);
      setActiveBetId(result.betId);
      activeBetRef.current = result.betId;
      setBetState('active');
      return result.betId;
    } catch (err) {
      setError((err as Error).message);
      setBetState('error');
      return null;
    }
  }, [wallet.address, network]);

  const endBet = useCallback(async (result: 'win' | 'loss', payoutSol: number, multiplier?: number) => {
    const betId = activeBetRef.current;
    if (!betId) return;

    setBetState('settling');
    try {
      await settleBet(betId, result, payoutSol, multiplier, network as SolNetwork);
      setBetState('done');
      activeBetRef.current = null;
      setActiveBetId(null);
      // Refresh internal balance after settle
      wallet.refreshInternalBalance();
    } catch (err) {
      setError((err as Error).message);
      setBetState('error');
    }
  }, [network, wallet]);

  const reset = useCallback(() => {
    setBetState('idle');
    setError(null);
    setActiveBetId(null);
    activeBetRef.current = null;
  }, []);

  return { betState, activeBetId, error, startBet, endBet, reset };
}
