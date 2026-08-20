export type Phase = 'betting' | 'running' | 'crashed' | 'result';

export type BetSlotState = {
  amount: number;
  mode: 'manual' | 'auto';
  autoCashout: number;
  placed: boolean;
  cashedOut: boolean;
  cashoutMultiplier: number | null;
  winAmount: number | null;
  autoNextRound: boolean;
};

export type SimPlayer = {
  id: string;
  name: string;
  vip: number;
  bet: number;
  cashedOut: boolean;
  cashoutMultiplier: number | null;
};

export type RoundResult = {
  id: string;
  crashPoint: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  timestamp: number;
};

export type BetRecord = {
  id: string;
  roundId: string;
  amount: number;
  multiplier: number | null;
  result: 'win' | 'loss';
  payout: number;
  time: string;
};

export type TopWin = {
  id: string;
  name: string;
  vip: number;
  multiplier: string;
  amount: string;
};
