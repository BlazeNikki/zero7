import type { RoundResult } from './types';

export const initialHistory: RoundResult[] = [
  { id: 'r1', crashPoint: 2.47, serverSeed: 'a3f2...', serverSeedHash: 'b8c1...', clientSeed: 'd4e5...', timestamp: Date.now() - 60000 },
  { id: 'r2', crashPoint: 1.08, serverSeed: 'c7a1...', serverSeedHash: 'e2f3...', clientSeed: 'a1b2...', timestamp: Date.now() - 120000 },
  { id: 'r3', crashPoint: 4.12, serverSeed: 'f8d3...', serverSeedHash: 'c4a6...', clientSeed: 'b3c7...', timestamp: Date.now() - 180000 },
  { id: 'r4', crashPoint: 1.00, serverSeed: 'e2b9...', serverSeedHash: 'd7f1...', clientSeed: 'c9a3...', timestamp: Date.now() - 240000 },
  { id: 'r5', crashPoint: 7.83, serverSeed: 'b6c4...', serverSeedHash: 'a8e2...', clientSeed: 'f1d5...', timestamp: Date.now() - 300000 },
  { id: 'r6', crashPoint: 2.01, serverSeed: 'd9e7...', serverSeedHash: 'b3c8...', clientSeed: 'e6a1...', timestamp: Date.now() - 360000 },
  { id: 'r7', crashPoint: 1.34, serverSeed: 'a1f5...', serverSeedHash: 'c7d2...', clientSeed: 'b8e4...', timestamp: Date.now() - 420000 },
  { id: 'r8', crashPoint: 15.67, serverSeed: 'e4c8...', serverSeedHash: 'f2a9...', clientSeed: 'd1b6...', timestamp: Date.now() - 480000 },
  { id: 'r9', crashPoint: 3.45, serverSeed: 'c2d6...', serverSeedHash: 'a9e1...', clientSeed: 'f5b3...', timestamp: Date.now() - 540000 },
  { id: 'r10', crashPoint: 1.02, serverSeed: 'b8a3...', serverSeedHash: 'd4c7...', clientSeed: 'e2f9...', timestamp: Date.now() - 600000 },
  { id: 'r11', crashPoint: 5.67, serverSeed: 'f1e7...', serverSeedHash: 'b6a2...', clientSeed: 'c8d4...', timestamp: Date.now() - 660000 },
  { id: 'r12', crashPoint: 1.89, serverSeed: 'a7c3...', serverSeedHash: 'e9f1...', clientSeed: 'b2d8...', timestamp: Date.now() - 720000 },
  { id: 'r13', crashPoint: 8.90, serverSeed: 'd5b9...', serverSeedHash: 'c1a7...', clientSeed: 'f3e6...', timestamp: Date.now() - 780000 },
  { id: 'r14', crashPoint: 1.15, serverSeed: 'e8a4...', serverSeedHash: 'b3c9...', clientSeed: 'd7f2...', timestamp: Date.now() - 840000 },
  { id: 'r15', crashPoint: 2.78, serverSeed: 'c9d1...', serverSeedHash: 'a5e8...', clientSeed: 'b1f7...', timestamp: Date.now() - 900000 },
];

export function pillColor(point: number): string {
  if (point < 1.2) return 'text-red-400 border-red-500/30 bg-red-500/10';
  if (point < 2) return 'text-white/60 border-white/15 bg-white/5';
  return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
}
