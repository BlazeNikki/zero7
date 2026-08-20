export type CellState = 'hidden' | 'revealed_safe' | 'revealed_mine';

export type Phase = 'idle' | 'playing' | 'cashout' | 'busted';

export type Cell = {
  index: number;
  state: CellState;
  isMine: boolean;
};

export type RoundResult = {
  id: string;
  minesCount: number;
  revealedCount: number;
  multiplier: number;
  result: 'win' | 'loss';
  payout: number;
  betAmount: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  timestamp: number;
};

export type BetRecord = {
  id: string;
  roundId: string;
  amount: number;
  minesCount: number;
  multiplier: number | null;
  result: 'win' | 'loss';
  payout: number;
  time: string;
};
