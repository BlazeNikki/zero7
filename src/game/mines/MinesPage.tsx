import { useState } from 'react';
import {
  ChevronLeft, BookOpen, X, Bomb, Gem, TrendingUp, Star, Wallet,
  RefreshCw, Hash, Shield, Sparkles,
} from 'lucide-react';
import { useMinesGame } from './useMinesGame';
import {
  multiplierForRevealed,
  firstSafeChance,
  formatMultiplier,
  formatAmount,
  GRID_SIZE,
  MINES_PRESETS,
} from './engine';
import type { RoundResult } from './types';
import { useWallet } from '@/lib/wallet';
import { MIN_SOL_BET, MAX_SOL_BET } from '@/lib/sol-bet';

export default function MinesPage({ onHome }: { onHome: () => void }) {
  const game = useMinesGame();
  const wallet = useWallet();
  const [showRules, setShowRules] = useState(false);
  const [showVerify, setShowVerify] = useState<RoundResult | null>(null);
  const [showTable, setShowTable] = useState(false);

  const isPlaying = game.phase === 'playing';
  const isFinished = game.phase === 'cashout' || game.phase === 'busted';
  const potentialPayout = Math.floor(game.betAmount * game.multiplier * 100) / 100;
  const safeRemaining = GRID_SIZE - game.minesCount - game.revealedCount;

  return (
    <div className="flex justify-center w-full flex-1 px-1 pt-3 pb-6">
      <div className="w-full max-w-[1408px] flex flex-col gap-3">

        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
          <button onClick={onHome} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors shrink-0">
            <ChevronLeft size={20} strokeWidth={2.5} />
            <span className="hidden sm:inline text-[11px] font-bold tracking-widest">НАЗАД</span>
          </button>
          <nav className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide">
            <button onClick={onHome} className="text-white/40 hover:text-white transition-colors">Главная</button>
            <span className="text-white/20">/</span>
            <button onClick={onHome} className="text-white/40 hover:text-white transition-colors">Оригиналы</button>
            <span className="text-white/20">/</span>
            <span className="text-white">MINES</span>
          </nav>
        </div>

        {/* 3-column desktop layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_280px] gap-3 items-start">

          {/* LEFT PANEL — bet controls */}
          <aside className="flex flex-col gap-3">
            <div className="bg-black border border-white/20 rounded-xl p-4 flex flex-col gap-4">
              {/* Bet amount */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Сумма ставки</label>
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="w-full min-w-0 flex items-center bg-black border border-white/15 rounded-lg px-3 focus-within:border-white/40 transition-colors">
                    <input
                      type="number"
                      value={game.betAmount}
                      onChange={(e) => wallet.requireWallet(() => game.setBetAmount(Math.max(0, Number(e.target.value))))}
                      disabled={isPlaying || isFinished}
                      className="flex-1 min-w-0 w-0 bg-transparent text-white text-[16px] font-bold tabular-nums outline-none disabled:opacity-50"
                      placeholder="0"
                      step="0.001"
                      min={MIN_SOL_BET}
                      max={MAX_SOL_BET}
                    />
                    <span className="text-white/30 text-[12px] font-bold shrink-0 ml-1">SOL</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 w-full min-w-0">
                    {(['half', 'double', 'min', 'max'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => wallet.requireWallet(() => game.quickAmount(t))}
                        disabled={isPlaying || isFinished}
                        className="min-w-0 w-full overflow-hidden text-white/50 text-[10px] font-bold px-1 py-2 rounded-lg bg-white/5 border border-white/10 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30"
                      >
                        {t === 'half' ? '½' : t === 'double' ? 'x2' : t === 'min' ? 'MIN' : 'MAX'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mines count */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Количество мин</label>
                  <span className="text-white text-[14px] font-black tabular-nums">{game.minesCount}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {MINES_PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => wallet.requireWallet(() => game.setMinesCount(m))}
                      disabled={isPlaying || isFinished}
                      className={`text-[12px] font-bold tabular-nums py-2 rounded-lg border transition-colors disabled:opacity-30 ${
                        game.minesCount === m
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Shield size={11} className="text-white/30" strokeWidth={2} />
                  <span className="text-white/30 text-[10px] font-medium">
                    Шанс на 1-ю безопасную ячейку: <span className="text-white/50 font-bold">{firstSafeChance(game.minesCount).toFixed(1)}%</span>
                  </span>
                </div>
              </div>

              {/* Multiplier table toggle */}
              <button
                onClick={() => setShowTable(!showTable)}
                className="flex items-center justify-between text-[11px] font-bold tracking-wide text-white/40 hover:text-white transition-colors"
              >
                <span>Таблица множителей</span>
                <span className="text-white/30">{showTable ? '▲' : '▼'}</span>
              </button>
              {showTable && (
                <div className="border border-white/10 rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
                  {Array.from({ length: Math.min(GRID_SIZE - game.minesCount, 10) }, (_, i) => i + 1).map((n) => (
                    <div key={n} className={`flex items-center justify-between px-3 py-1.5 ${n % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <span className="text-white/50 text-[11px] font-bold">{n} яч.</span>
                      <span className="text-white text-[11px] font-black tabular-nums">{formatMultiplier(multiplierForRevealed(n, game.minesCount))}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action button */}
              {game.phase === 'idle' && (
                <button
                  onClick={() => wallet.requireWallet(() => game.startRound())}
                  disabled={game.betState === 'sending'}
                  className="w-full bg-white text-black font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50"
                >
                  {game.betState === 'sending' ? 'ОБРАБОТКА...' : 'СДЕЛАТЬ СТАВКУ'}
                </button>
              )}
              {isPlaying && (
                <button
                  onClick={() => wallet.requireWallet(() => game.cashOut())}
                  disabled={game.revealedCount === 0}
                  className={`w-full font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 transition-all ${
                    game.revealedCount === 0
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-emerald-500 text-black hover:bg-emerald-400 active:bg-emerald-500 animate-pulse'
                  }`}
                >
                  {game.revealedCount === 0
                    ? 'ОТКРОЙТЕ ЯЧЕЙКУ'
                    : `ЗАБРАТЬ ${formatMultiplier(game.multiplier)} — ${formatAmount(potentialPayout)}`}
                </button>
              )}
              {isFinished && (
                <div className={`w-full text-center font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 ${
                  game.phase === 'cashout' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  {game.phase === 'cashout' ? `ВЫИГРЫШ +${formatAmount(game.lastResult?.payout ?? 0)}` : `ПРОИГРЫШ -${formatAmount(game.betAmount)}`}
                </div>
              )}
            </div>

            {/* Rules button */}
            <button
              onClick={() => setShowRules(true)}
              className="flex items-center gap-2 justify-center bg-black border border-white/20 rounded-xl px-4 py-3 text-white/60 hover:text-white hover:border-white/40 transition-colors"
            >
              <BookOpen size={15} strokeWidth={2} />
              <span className="text-[11px] font-bold tracking-widest">ПРАВИЛА ИГРЫ</span>
            </button>
          </aside>

          {/* CENTER — game field */}
          <div className="flex flex-col gap-3 min-w-0">

            {/* Multiplier display + status */}
            <div className="bg-[#0a0a0a] border border-white/20 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Множитель</span>
                <span
                  className={`font-black text-[36px] md:text-[48px] tabular-nums leading-none transition-colors ${
                    isFinished && game.phase === 'busted' ? 'text-red-400' : isFinished && game.phase === 'cashout' ? 'text-emerald-400' : 'text-white'
                  }`}
                  style={{ textShadow: isFinished ? (game.phase === 'cashout' ? '0 0 30px rgba(61,214,140,0.3)' : '0 0 30px rgba(229,72,77,0.3)') : 'none' }}
                >
                  {formatMultiplier(game.multiplier)}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Выигрыш</span>
                <span className="text-white font-black text-[20px] md:text-[24px] tabular-nums leading-none">
                  {formatAmount(potentialPayout)}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right shrink-0">
                <span className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Раунд</span>
                <span className="text-white/60 font-bold text-[14px] tabular-nums">#{game.roundNumber}</span>
              </div>
            </div>

            {/* Game grid */}
            <div className="bg-[#0d0d0d] border border-white/20 rounded-xl p-4 md:p-6 flex flex-col items-center gap-4">
              <div className="w-full max-w-[480px] aspect-square">
                <div className="grid grid-cols-5 gap-2 md:gap-2.5 w-full h-full">
                  {game.grid.map((cell, idx) => (
                    <MinesCell
                      key={idx}
                      cell={cell}
                      showAllMines={game.showAllMines}
                      disabled={!isPlaying}
                      delay={idx * 35}
                      onClick={() => wallet.requireWallet(() => game.revealCell(idx))}
                    />
                  ))}
                </div>
              </div>

              {/* Progress indicator */}
              <div className="w-full max-w-[480px] flex items-center justify-between text-[11px] font-bold tracking-wide">
                <span className="text-white/40">
                  Открыто: <span className="text-white tabular-nums">{game.revealedCount}</span> / {GRID_SIZE}
                </span>
                <span className="text-white/40">
                  Безопасных осталось: <span className="text-white tabular-nums">{Math.max(0, safeRemaining)}</span>
                </span>
              </div>
            </div>

            {/* Provably fair hash */}
            <div className="flex items-center gap-2 px-1">
              <Hash size={11} className="text-white/20" strokeWidth={2} />
              <span className="text-white/15 text-[9px] font-mono tracking-tight">
                {game.seeds.serverSeedHash.slice(0, 24)}…
              </span>
            </div>

            {/* History pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [::-webkit-scrollbar]:hidden -mx-1 px-1">
              {game.history.length === 0 ? (
                <span className="text-white/20 text-[11px] font-medium px-2 py-1">История раундов пуста</span>
              ) : (
                game.history.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setShowVerify(r)}
                    className={`shrink-0 text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full border transition-colors ${
                      r.result === 'win'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
                        : 'text-red-400 border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    {r.result === 'win' ? formatMultiplier(r.multiplier) : 'CRASH'}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANEL — info & my bets */}
          <aside className="hidden lg:flex flex-col gap-3">
            <div className="bg-black border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Информация</p>
                <Sparkles size={13} className="text-white/30" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex justify-between"><span className="text-white/40">RTP</span><span className="text-white font-bold">97%</span></div>
                <div className="flex justify-between"><span className="text-white/40">Макс. выигрыш</span><span className="text-white font-bold">x24000</span></div>
                <div className="flex justify-between"><span className="text-white/40">Мин. ставка</span><span className="text-white font-bold">0.001 SOL</span></div>
                <div className="flex justify-between"><span className="text-white/40">Макс. ставка</span><span className="text-white font-bold">1 SOL</span></div>
                <div className="flex justify-between"><span className="text-white/40">Поле</span><span className="text-white font-bold">5×5 (25)</span></div>
                <div className="flex justify-between"><span className="text-white/40">Мины</span><span className="text-white font-bold">1–24</span></div>
              </div>
            </div>

            {/* My bets */}
            <div className="bg-black border border-white/20 rounded-xl p-4">
              <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase mb-3">Мои ставки</p>
              {game.betRecords.length === 0 ? (
                <p className="text-white/20 text-[11px] font-medium">Нет ставок</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {game.betRecords.slice(0, 8).map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-white/50 font-bold tabular-nums">{formatAmount(r.amount)}</span>
                      <span className="text-white/30 text-[10px]">{r.minesCount}💣</span>
                      <span className={`font-bold tabular-nums ${r.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.result === 'win' ? formatMultiplier(r.multiplier!) : 'BUST'}
                      </span>
                      <span className={`font-black tabular-nums ${r.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.result === 'win' ? '+' + formatAmount(r.payout) : '-' + formatAmount(r.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowRules(true)}
              className="flex items-center gap-2 justify-center bg-black border border-white/20 rounded-xl px-4 py-3 text-white/60 hover:text-white hover:border-white/40 transition-colors"
            >
              <BookOpen size={15} strokeWidth={2} />
              <span className="text-[11px] font-bold tracking-widest">ПРАВИЛА</span>
            </button>
          </aside>
        </div>

        {/* Mobile sticky bet panel */}
        <div className="lg:hidden sticky bottom-0 z-30 bg-black/95 backdrop-blur-md border border-white/15 rounded-xl p-3 -mx-1">
          {game.phase === 'idle' && (
            <button
              onClick={() => wallet.requireWallet(() => game.startRound())}
              disabled={game.betState === 'sending'}
              className="w-full bg-white text-black font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50"
            >
              {game.betState === 'sending' ? 'ОБРАБОТКА...' : `СДЕЛАТЬ СТАВКУ · ${formatAmount(game.betAmount)}`}
            </button>
          )}
          {isPlaying && (
            <button
              onClick={() => wallet.requireWallet(() => game.cashOut())}
              disabled={game.revealedCount === 0}
              className={`w-full font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 transition-all ${
                game.revealedCount === 0
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 animate-pulse'
              }`}
            >
              {game.revealedCount === 0
                ? 'ОТКРОЙТЕ ЯЧЕЙКУ'
                : `ЗАБРАТЬ ${formatMultiplier(game.multiplier)} — ${formatAmount(potentialPayout)}`}
            </button>
          )}
          {isFinished && (
            <div className={`w-full text-center font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 ${
              game.phase === 'cashout' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}>
              {game.phase === 'cashout' ? `ВЫИГРЫШ +${formatAmount(game.lastResult?.payout ?? 0)}` : `ПРОИГРЫШ -${formatAmount(game.betAmount)}`}
            </div>
          )}
        </div>
      </div>

      {/* Rules modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowRules(false)}>
          <div className="bg-black border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-[16px] tracking-[0.15em]">ПРАВИЛА — MINES</h2>
              <button onClick={() => setShowRules(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Цель игры</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Открывайте ячейки на поле 5×5, избегая мин. Каждая безопасная ячейка увеличивает множитель выигрыша. Заберите выигрыш в любой момент — но если попадёте на мину, ставка сгорит.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Количество мин</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Перед стартом раунда выберите от 1 до 24 мин. Чем больше мин — тем выше множитель за каждую открытую ячейку, но тем выше риск взрыва.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Множитель</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Множитель рассчитывается по комбинаторной формуле с учётом RTP 97%. Каждая следующая ячейка даёт больший прирост, так как вероятность безопасного открытия уменьшается.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Кэшаут</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">После первого безопасного открытия вы можете забрать выигрыш в любой момент. Выигрыш = ставка × текущий множитель.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Provably Fair</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Позиции мин фиксируются до начала раунда на основе серверного и клиентского сида через алгоритм Fisher-Yates. Хэш серверного сида публикуется до ставки, сам сид раскрывается после раунда. Нажмите на множитель в истории для проверки.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">RTP и лимиты</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">RTP: 97%. Мин. ставка: 0.001 SOL. Макс. ставка: 1 SOL. Макс. множитель: x24000.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify modal */}
      {showVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowVerify(null)}>
          <div className="bg-black border border-white/20 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-[14px] tracking-[0.15em]">ПРОВЕРКА РАУНДА</h2>
              <button onClick={() => setShowVerify(null)} className="text-white/40 hover:text-white transition-colors">
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                <span className="text-white/40 text-[11px] font-bold">Результат</span>
                <span className={`font-black text-[18px] tabular-nums ${showVerify.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {showVerify.result === 'win' ? formatMultiplier(showVerify.multiplier) : 'BUST'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-white/40">Мин</span><span className="text-white/70 font-bold tabular-nums">{showVerify.minesCount}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Открыто</span><span className="text-white/70 font-bold tabular-nums">{showVerify.revealedCount}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Ставка</span><span className="text-white/70 font-bold tabular-nums">{formatAmount(showVerify.betAmount)}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Выплата</span><span className="text-white/70 font-bold tabular-nums">{formatAmount(showVerify.payout)}</span></div>
              </div>
              <div className="border-t border-white/10 pt-3 flex flex-col gap-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-white/40">Server Seed</span><span className="text-white/70 font-mono break-all">{showVerify.serverSeed.slice(0, 16)}…</span></div>
                <div className="flex justify-between"><span className="text-white/40">Server Seed Hash</span><span className="text-white/70 font-mono break-all">{showVerify.serverSeedHash.slice(0, 16)}…</span></div>
                <div className="flex justify-between"><span className="text-white/40">Client Seed</span><span className="text-white/70 font-mono break-all">{showVerify.clientSeed.slice(0, 16)}…</span></div>
              </div>
              <p className="text-white/30 text-[10px] leading-relaxed mt-1">Используйте сторонний калькулятор HMAC-SHA256 для проверки соответствия расклада мин и сида.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MinesCell({
  cell,
  showAllMines,
  disabled,
  delay,
  onClick,
}: {
  cell: { state: string; isMine: boolean };
  showAllMines: boolean;
  disabled: boolean;
  delay: number;
  onClick: () => void;
}) {
  const isRevealed = cell.state === 'revealed_safe' || cell.state === 'revealed_mine';
  const showMine = cell.state === 'revealed_mine' || (showAllMines && cell.isMine);
  const showSafe = cell.state === 'revealed_safe';

  return (
    <button
      onClick={onClick}
      disabled={disabled || isRevealed}
      className={`relative rounded-lg flex items-center justify-center transition-all duration-200 select-none ${
        isRevealed
          ? cell.state === 'revealed_mine'
            ? 'bg-red-500/15 border border-red-500/40'
            : 'bg-emerald-500/10 border border-emerald-500/25'
          : showMine
            ? 'bg-red-500/10 border border-red-500/30'
            : 'bg-gradient-to-br from-[#1e1e1e] to-[#262626] border border-white/10 hover:border-white/30 hover:from-[#252525] hover:to-[#2e2e2e] active:scale-95 cursor-pointer'
      }`}
      style={{
        animation: isRevealed ? `flip-in 0.25s ease-out ${delay}ms both` : showMine ? `fade-in 0.3s ease-out ${delay}ms both` : undefined,
      }}
    >
      {showSafe && (
        <Gem size="60%" className="text-emerald-400 drop-shadow-[0_0_8px_rgba(61,214,140,0.4)]" strokeWidth={2} />
      )}
      {showMine && (
        <Bomb size="60%" className="text-red-400 drop-shadow-[0_0_8px_rgba(229,72,77,0.4)]" strokeWidth={2} />
      )}
      {!isRevealed && !showMine && (
        <div className="w-full h-full rounded-lg" />
      )}
    </button>
  );
}
