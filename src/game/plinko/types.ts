export type Risk = 'low' | 'medium' | 'high';
export type Rows = 8 | 10 | 12 | 14 | 16;

export type Ball = {
  id: number;
  startX: number;
  slot: number;
  path: number[];
  startTime: number;
  duration: number;
  x: number;
  y: number;
  done: boolean;
  payout: number;
  multiplier: number;
  betAmount: number;
  rows: Rows;
  risk: Risk;
  nonce: number;
  isAuto: boolean;
};

export type RoundResult = {
  id: string;
  rows: Rows;
  risk: Risk;
  slot: number;
  multiplier: number;
  betAmount: number;
  payout: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  path: number[];
  timestamp: number;
};

export type BetRecord = {
  id: string;
  amount: number;
  multiplier: number;
  result: 'win' | 'loss';
  payout: number;
  time: string;
};

export type Seeds = {
  serverSeed: string;
  clientSeed: string;
  serverSeedHash: string;
};
