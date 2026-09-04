import { useRef, useEffect, useState, useCallback } from 'react';
import {
  ChevronLeft, BookOpen, X, Hash, Sparkles, Play, Square,
  TrendingUp, Star,
} from 'lucide-react';
import { usePlinkoGame } from './usePlinkoGame';
import {
  getMultipliers, formatMultiplier, formatAmount, formatShortMult,
  slotColor, ROWS_OPTIONS, MAX_BALLS, MIN_BET, MAX_BET,
} from './engine';
import type { Risk, Rows, Ball } from './types';
import type { RoundResult } from './types';
import { useWallet } from '@/lib/wallet';
import { MIN_SOL_BET, MAX_SOL_BET } from '@/lib/sol-bet';

export default function PlinkoPage({ onHome }: { onHome: () => void }) {
  const game = usePlinkoGame();
  const wallet = useWallet();
  const [showRules, setShowRules] = useState(false);
  const [showVerify, setShowVerify] = useState<RoundResult | null>(null);
  const [autoCountInput, setAutoCountInput] = useState(10);

  const multipliers = getMultipliers(game.rows, game.risk);
  const inFlight = game.balls.length;

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
            <span className="text-white">PLINKO</span>
          </nav>
        </div>

        {/* 3-column desktop layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_280px] gap-3 items-start">

          {/* LEFT PANEL — bet controls (desktop only) */}
          <aside className="hidden lg:flex flex-col gap-3">
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
                      className="flex-1 min-w-0 w-0 bg-transparent text-white text-[16px] font-bold tabular-nums outline-none"
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
                        className="min-w-0 w-full overflow-hidden text-white/50 text-[10px] font-bold px-1 py-2 rounded-lg bg-white/5 border border-white/10 hover:text-white hover:border-white/30 transition-colors"
                      >
                        {t === 'half' ? '½' : t === 'double' ? 'x2' : t === 'min' ? 'MIN' : 'MAX'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Ряды</label>
                  <span className="text-white text-[14px] font-black tabular-nums">{game.rows}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {ROWS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => wallet.requireWallet(() => game.setRows(r))}
                      className={`text-[12px] font-bold tabular-nums py-2 rounded-lg border transition-colors ${
                        game.rows === r
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Риск</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'medium', 'high'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => wallet.requireWallet(() => game.setRisk(r))}
                      className={`text-[11px] font-bold py-2 rounded-lg border transition-colors ${
                        game.risk === r
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {r === 'low' ? 'Низкий' : r === 'medium' ? 'Средний' : 'Высокий'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Автоигра</label>
                {!game.autoMode ? (
                  <div className="flex gap-2">
                    <select
                      value={autoCountInput}
                      onChange={(e) => setAutoCountInput(Number(e.target.value))}
                      className="flex-1 min-w-0 bg-black border border-white/15 rounded-lg px-2 py-2 text-white text-[12px] font-bold outline-none focus:border-white/40"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={Infinity}>∞</option>
                    </select>
                    <button
                      onClick={() => wallet.requireWallet(() => game.startAuto(autoCountInput))}
                      className="flex items-center gap-1 bg-white/10 border border-white/20 text-white text-[11px] font-bold px-3 py-2 rounded-lg hover:bg-white/20 transition-colors whitespace-nowrap"
                    >
                      <Play size={12} fill="white" />
                      СТАРТ
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">Осталось: <span className="text-white font-bold tabular-nums">{game.autoTarget === Infinity ? '∞' : Math.max(0, game.autoTarget - game.autoCount)}</span></span>
                      <span className={`font-black tabular-nums ${game.autoProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {game.autoProfit >= 0 ? '+' : ''}{formatAmount(game.autoProfit)}
                      </span>
                    </div>
                    <button
                      onClick={() => wallet.requireWallet(() => game.stopAuto())}
                      className="flex items-center gap-1.5 justify-center bg-red-500/15 border border-red-500/40 text-red-400 text-[11px] font-bold px-3 py-2 rounded-lg hover:bg-red-500/25 transition-colors"
                    >
                      <Square size={12} fill="currentColor" />
                      СТОП
                    </button>
                  </div>
                )}
              </div>

              {/* Action button */}
              <button
                onClick={() => wallet.requireWallet(() => game.dropBall())}
                disabled={inFlight >= MAX_BALLS || !game.seedsReady}
                className={`w-full font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 transition-colors ${
                  inFlight >= MAX_BALLS || !game.seedsReady
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-white/90 active:bg-white/80'
                }`}
              >
                {inFlight >= MAX_BALLS ? 'МАКС. ШАРИКОВ' : !game.seedsReady ? 'ЗАГРУЗКА...' : 'ЗАПУСТИТЬ ШАРИК'}
              </button>

              {/* In-flight counter */}
              {inFlight > 0 && (
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  В полёте: <span className="text-white tabular-nums">{inFlight}</span>
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

          {/* CENTER — Plinko board */}
          <div className="flex flex-col gap-3 min-w-0">
            {/* Mobile compact settings panel */}
            <div className="lg:hidden bg-black border border-white/15 rounded-xl p-3 flex flex-col gap-3">
              {/* Bet + quick amounts */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-white/40 font-bold tracking-[0.2em] uppercase">Сумма ставки</label>
                <div className="flex items-center bg-black border border-white/15 rounded-lg px-3 py-2 flex-1 min-w-0">
                  <input
                    type="number"
                    value={game.betAmount}
                    onChange={(e) => wallet.requireWallet(() => game.setBetAmount(Math.max(0, Number(e.target.value))))}
                    className="flex-1 min-w-0 w-0 bg-transparent text-white text-[15px] font-bold tabular-nums outline-none"
                    placeholder="0"
                    step="0.001"
                    min={MIN_SOL_BET}
                    max={MAX_SOL_BET}
                  />
                  <span className="text-white/30 text-[11px] font-bold shrink-0 ml-1">SOL</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['half', 'double', 'min', 'max'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => wallet.requireWallet(() => game.quickAmount(t))}
                      className="text-white/50 text-[10px] font-bold px-1 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-white hover:border-white/30 transition-colors"
                    >
                      {t === 'half' ? '½' : t === 'double' ? 'x2' : t === 'min' ? 'MIN' : 'MAX'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rows + Risk in compact row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-white/40 font-bold tracking-[0.2em] uppercase">Ряды</label>
                  <div className="grid grid-cols-5 gap-1">
                    {ROWS_OPTIONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => wallet.requireWallet(() => game.setRows(r))}
                        className={`text-[11px] font-bold tabular-nums py-1.5 rounded-md border transition-colors ${
                          game.rows === r
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-white/50 border-white/10'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-white/40 font-bold tracking-[0.2em] uppercase">Риск</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['low', 'medium', 'high'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => wallet.requireWallet(() => game.setRisk(r))}
                        className={`text-[10px] font-bold py-1.5 rounded-md border transition-colors ${
                          game.risk === r
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-white/50 border-white/10'
                        }`}
                      >
                        {r === 'low' ? 'Низк.' : r === 'medium' ? 'Ср.' : 'Выс.'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auto */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-white/40 font-bold tracking-[0.2em] uppercase">Автоигра</label>
                {!game.autoMode ? (
                  <div className="flex gap-1.5">
                    <select
                      value={autoCountInput}
                      onChange={(e) => setAutoCountInput(Number(e.target.value))}
                      className="flex-1 min-w-0 bg-black border border-white/15 rounded-lg px-2 py-2 text-white text-[12px] font-bold outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={Infinity}>∞</option>
                    </select>
                    <button
                      onClick={() => wallet.requireWallet(() => game.startAuto(autoCountInput))}
                      disabled={!game.seedsReady}
                      className="flex items-center gap-1 bg-white/10 border border-white/20 text-white text-[11px] font-bold px-3 py-2 rounded-lg hover:bg-white/20 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      <Play size={12} fill="white" />
                      СТАРТ
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-[11px]">Осталось: <span className="text-white font-bold tabular-nums">{game.autoTarget === Infinity ? '∞' : Math.max(0, game.autoTarget - game.autoCount)}</span></span>
                    <span className={`font-black tabular-nums text-[11px] ${game.autoProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {game.autoProfit >= 0 ? '+' : ''}{formatAmount(game.autoProfit)}
                    </span>
                    <button
                      onClick={() => wallet.requireWallet(() => game.stopAuto())}
                      className="flex items-center gap-1.5 justify-center bg-red-500/15 border border-red-500/40 text-red-400 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-red-500/25 transition-colors ml-auto"
                    >
                      <Square size={12} fill="currentColor" />
                      СТОП
                    </button>
                  </div>
                )}
              </div>
            </div>

            <PlinkoBoard
              rows={game.rows}
              risk={game.risk}
              balls={game.balls}
              multipliers={multipliers}
              onBallDone={game.removeBall}
              lastWin={game.lastWin}
            />

            {/* Provably fair hash */}
            <div className="flex items-center gap-2 px-1">
              <Hash size={11} className="text-white/20" strokeWidth={2} />
              <span className="text-white/15 text-[9px] font-mono tracking-tight">
                {game.seeds.serverSeedHash.slice(0, 24)}…
              </span>
              <span className="text-white/20 text-[9px] font-mono">nonce: {game.nonce}</span>
            </div>

            {/* History pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [::-webkit-scrollbar]:hidden -mx-1 px-1">
              {game.history.length === 0 ? (
                <span className="text-white/20 text-[11px] font-medium px-2 py-1">История запусков пуста</span>
              ) : (
                game.history.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setShowVerify(r)}
                    className={`shrink-0 text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full border transition-colors ${
                      r.payout > r.betAmount
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
                        : 'text-red-400 border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    {formatMultiplier(r.multiplier)}
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
                <div className="flex justify-between"><span className="text-white/40">RTP</span><span className="text-white font-bold">99%</span></div>
                <div className="flex justify-between"><span className="text-white/40">Макс. выигрыш</span><span className="text-white font-bold">x1000</span></div>
                <div className="flex justify-between"><span className="text-white/40">Мин. ставка</span><span className="text-white font-bold">0.001 SOL</span></div>
                <div className="flex justify-between"><span className="text-white/40">Макс. ставка</span><span className="text-white font-bold">1 SOL</span></div>
                <div className="flex justify-between"><span className="text-white/40">Ряды</span><span className="text-white font-bold">8–16</span></div>
                <div className="flex justify-between"><span className="text-white/40">Макс. шариков</span><span className="text-white font-bold">{MAX_BALLS}</span></div>
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
                      <span className={`font-bold tabular-nums ${r.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatMultiplier(r.multiplier)}
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

        {/* Mobile sticky launch button */}
        <div className="lg:hidden sticky bottom-0 z-30 bg-black/95 backdrop-blur-md border border-white/15 rounded-xl p-3 -mx-1">
          <button
            onClick={() => wallet.requireWallet(() => game.dropBall())}
            disabled={inFlight >= MAX_BALLS || !game.seedsReady}
            className={`w-full font-black text-[14px] tracking-[0.15em] rounded-lg py-3.5 transition-colors ${
              inFlight >= MAX_BALLS || !game.seedsReady
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-white text-black hover:bg-white/90 active:bg-white/80'
            }`}
          >
            {inFlight >= MAX_BALLS ? 'МАКС. ШАРИКОВ' : !game.seedsReady ? 'ЗАГРУЗКА...' : 'ЗАПУСТИТЬ ШАРИК'}
          </button>
        </div>
      </div>

      {/* Rules modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowRules(false)}>
          <div className="bg-black border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-[16px] tracking-[0.15em]">ПРАВИЛА — PLINKO</h2>
              <button onClick={() => setShowRules(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Цель игры</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Шарик запускается в верхней точке доски с рядами штырьков. Отскакивая от пинов влево или вправо, шарик падает в один из слотов внизу. Выигрыш = ставка × множитель слота.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Ряды и риск</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">От 8 до 16 рядов штырьков. Чем больше рядов — тем больше слотов и шире разброс множителей. Уровень риска (Низкий / Средний / Высокий) определяет распределение: при высоком риске крайние слоты дают максимальный множитель, центральные — минимальный.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Мультизапуск</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Можно запускать несколько шариков одновременно — повторные нажатия создают новые независимые шарики. Максимум {MAX_BALLS} шариков на доске одновременно.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Автоигра</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Задайте количество автозапусков (10, 25, 50, 100 или бесконечно). Серия прерывается в любой момент кнопкой «Стоп».</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Provably Fair</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Каждый запуск определяется через HMAC-SHA256(server_seed, client_seed:nonce). Бит-последовательность отскоков (0=влево, 1=вправо) генерируется на сервере до анимации. Хэш серверного сида публикуется заранее, сам сид раскрывается после. Нажмите на множитель в истории для проверки.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">RTP и лимиты</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">RTP: 99%. Мин. ставка: 0.001 SOL. Макс. ставка: 1 SOL. Макс. множитель: x1000 (16 рядов, высокий риск).</p>
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
              <h2 className="text-white font-black text-[14px] tracking-[0.15em]">ПРОВЕРКА ЗАПУСКА</h2>
              <button onClick={() => setShowVerify(null)} className="text-white/40 hover:text-white transition-colors">
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                <span className="text-white/40 text-[11px] font-bold">Множитель</span>
                <span className={`font-black text-[18px] tabular-nums ${showVerify.payout > showVerify.betAmount ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatMultiplier(showVerify.multiplier)}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-white/40">Ряды</span><span className="text-white/70 font-bold tabular-nums">{showVerify.rows}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Риск</span><span className="text-white/70 font-bold">{showVerify.risk === 'low' ? 'Низкий' : showVerify.risk === 'medium' ? 'Средний' : 'Высокий'}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Слот</span><span className="text-white/70 font-bold tabular-nums">{showVerify.slot}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Ставка</span><span className="text-white/70 font-bold tabular-nums">{formatAmount(showVerify.betAmount)}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Выплата</span><span className="text-white/70 font-bold tabular-nums">{formatAmount(showVerify.payout)}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Nonce</span><span className="text-white/70 font-bold tabular-nums">{showVerify.nonce}</span></div>
              </div>
              <div className="border-t border-white/10 pt-3 flex flex-col gap-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-white/40">Server Seed</span><span className="text-white/70 font-mono break-all">{showVerify.serverSeed.slice(0, 16)}…</span></div>
                <div className="flex justify-between"><span className="text-white/40">Server Seed Hash</span><span className="text-white/70 font-mono break-all">{showVerify.serverSeedHash.slice(0, 16)}…</span></div>
                <div className="flex justify-between"><span className="text-white/40">Client Seed</span><span className="text-white/70 font-mono break-all">{showVerify.clientSeed.slice(0, 16)}…</span></div>
                <div className="flex justify-between"><span className="text-white/40">Путь</span><span className="text-white/70 font-mono text-right">{showVerify.path.join('')}</span></div>
              </div>
              <p className="text-white/30 text-[10px] leading-relaxed mt-1">Используйте сторонний калькулятор HMAC-SHA256 для проверки соответствия бит-последовательности и итогового слота.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type FloatTextEntry = { x: number; y: number; text: string; color: string; createdAt: number };

function PlinkoBoard({
  rows,
  risk,
  balls,
  multipliers,
  onBallDone,
  lastWin,
}: {
  rows: Rows;
  risk: Risk;
  balls: Ball[];
  multipliers: number[];
  onBallDone: (id: number) => void;
  lastWin: { amount: number; multiplier: number; slot: number; ballId: number } | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 400, h: 500 });
  const animFrameRef = useRef<number>(0);
  const completedBallsRef = useRef<Set<number>>(new Set());
  const pinFlashesRef = useRef<Map<string, { expiry: number; duration: number; x: number; y: number }>>(new Map());
  const floatTextsRef = useRef<Map<number, FloatTextEntry>>(new Map());
  const highlightSlotsRef = useRef<Map<number, number>>(new Map());
  const pinSpriteRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<Ball[]>(balls);
  ballsRef.current = balls;

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = entry.contentRect.width;
      const h = Math.min(w * 1.25, 560);
      setSize({ w, h });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.scale(dpr, dpr);

    const W = size.w;
    const H = size.h;
    const topPad = 30;
    const bottomPad = 50;
    const boardH = H - topPad - bottomPad;
    const boardW = W;
    const rowSpacing = boardH / (rows + 1);
    const pinRadius = Math.max(3, Math.min(5, rowSpacing * 0.14));
    const ballRadius = Math.max(5, Math.min(8, rowSpacing * 0.22));
    const slotH = 32;
    const slotW = boardW / multipliers.length;
    const colSpacing = boardW / (rows + 1);

    // Compute pin positions — standard triangle: row 0 has 1 pin, row 1 has 2, etc.
    const pins: { x: number; y: number }[] = [];
    for (let row = 0; row < rows; row++) {
      const pinCount = row + 1;
      const rowY = topPad + (row + 1) * rowSpacing;
      const rowW = (pinCount - 1) * colSpacing;
      const startX = (boardW - rowW) / 2;
      for (let p = 0; p < pinCount; p++) {
        pins.push({ x: startX + p * colSpacing, y: rowY });
      }
    }

    // Compute slot positions
    const slots: { x: number; y: number; w: number; h: number }[] = [];
    for (let s = 0; s < multipliers.length; s++) {
      slots.push({
        x: s * slotW,
        y: H - bottomPad + 4,
        w: slotW - 2,
        h: slotH,
      });
    }

    // Pre-render pin sprite to offscreen canvas (P2 #7)
    const spriteSize = Math.ceil(pinRadius * 5);
    const pinSprite = document.createElement('canvas');
    pinSprite.width = spriteSize;
    pinSprite.height = spriteSize;
    const sctx = pinSprite.getContext('2d')!;
    const cx = spriteSize / 2;
    const cy = spriteSize / 2;

    // Outer glow
    sctx.beginPath();
    sctx.arc(cx, cy, pinRadius * 2.2, 0, Math.PI * 2);
    sctx.fillStyle = 'rgba(255,255,255,0.04)';
    sctx.fill();

    // Pin body — white with subtle gradient
    const pinGrad = sctx.createRadialGradient(
      cx - pinRadius * 0.3, cy - pinRadius * 0.3, 0,
      cx, cy, pinRadius,
    );
    pinGrad.addColorStop(0, '#ffffff');
    pinGrad.addColorStop(0.6, '#e8e8e8');
    pinGrad.addColorStop(1, '#b0b0b0');
    sctx.beginPath();
    sctx.arc(cx, cy, pinRadius, 0, Math.PI * 2);
    sctx.fillStyle = pinGrad;
    sctx.fill();
    pinSpriteRef.current = pinSprite;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      // Clear — deep dark base
      ctx.fillStyle = '#0d0d0d';
      ctx.fillRect(0, 0, W, H);

      // Soft edge vignette only — darker at edges, flat center (no bright spot)
      const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.75);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Draw pins from cached sprite (P2 #7)
      const sprite = pinSpriteRef.current;
      if (sprite) {
        for (const pin of pins) {
          ctx.drawImage(sprite, pin.x - sprite.width / 2, pin.y - sprite.height / 2);
        }
      }

      // Draw slots
      const highlightedSlots = new Set(highlightSlotsRef.current.values());
      for (let s = 0; s < slots.length; s++) {
        const slot = slots[s];
        const mult = multipliers[s];
        const color = slotColor(mult);
        const isHighlighted = highlightedSlots.has(s);

        // Base fill
        ctx.fillStyle = color;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(slot.x, slot.y, slot.w, slot.h, 4);
        } else {
          ctx.rect(slot.x, slot.y, slot.w, slot.h);
        }
        ctx.fill();

        // Highlight glow on win
        if (isHighlighted) {
          ctx.strokeStyle = '#3DD68C';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Inner glow
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = '#3DD68C';
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Top border line for slot separation
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(slot.x, slot.y);
        ctx.lineTo(slot.x + slot.w, slot.y);
        ctx.stroke();

        // Multiplier text — white for dark slots, white for all muted palette
        ctx.fillStyle = mult >= 2 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)';
        ctx.font = `bold ${Math.max(8, Math.min(12, slotW * 0.3))}px ui-monospace, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatShortMult(mult), slot.x + slot.w / 2, slot.y + slot.h / 2);
      }

      // Draw & update balls
      for (const ball of ballsRef.current) {
        if (ball.done) continue;
        const elapsed = now - ball.startTime;
        const progress = elapsed / ball.duration;

        const totalRows = ball.path.length;
        const rowProgress = progress * totalRows;
        const currentRow = Math.floor(rowProgress);
        const rowFrac = rowProgress - currentRow;

        // Column at the target pin = accumulated right-bounces through previous rows
        let toCol = 0;
        for (let r = 0; r < currentRow; r++) {
          toCol += ball.path[r];
        }

        let xPos: number = ball.x ?? boardW / 2;
        let yPos: number = ball.y ?? topPad;

        if (currentRow < totalRows) {
          // "To" pin: row currentRow, column toCol
          const toPinCount = currentRow + 1;
          const toRowW = (toPinCount - 1) * colSpacing;
          const toStartX = (boardW - toRowW) / 2;
          const toX = toStartX + toCol * colSpacing;
          const toY = topPad + (currentRow + 1) * rowSpacing;

          // "From" position: previous pin or start
          let fromX: number;
          let fromY: number;
          if (currentRow === 0) {
            fromX = boardW / 2;
            fromY = topPad;
          } else {
            const fromCol = toCol - ball.path[currentRow - 1];
            const fromPinCount = currentRow;
            const fromRowW = (fromPinCount - 1) * colSpacing;
            const fromStartX = (boardW - fromRowW) / 2;
            fromX = fromStartX + fromCol * colSpacing;
            fromY = topPad + currentRow * rowSpacing;
          }

          // Ballistic arc: vertical-only sag so the path never visually
          // coincides with the pin grid diagonal during same-direction runs.
          // sin(0) = sin(pi) = 0 at contact points, peak at mid-segment.
          const arcHeight = rowSpacing * 0.18;
          const arc = Math.sin(rowFrac * Math.PI) * arcHeight;

          xPos = fromX + (toX - fromX) * rowFrac;
          yPos = fromY + (toY - fromY) * rowFrac - arc;

          // Trigger pin flash as ball reaches the pin — duration tied to
          // the actual segment length so flashes don't bleed into the next.
          if (rowFrac >= 0.9) {
            const segmentDuration = ball.duration / totalRows;
            const flashDuration = Math.min(300, segmentDuration * 0.6);
            const flashKey = `${ball.id}-${currentRow}`;
            pinFlashesRef.current.set(flashKey, { expiry: now + flashDuration, duration: flashDuration, x: toX, y: toY });
          }
        } else {
          // Ball reached bottom — animate landing in slot
          const slotIdx = ball.slot;
          const targetX = slotIdx * slotW + slotW / 2;
          const targetY = H - bottomPad + slotH * 0.4;
          const finalFrac = Math.min((progress - 1) * 5, 1);
          // Ease into slot with slight bounce
          const eased = 1 - Math.pow(1 - finalFrac, 3);
          xPos = xPos + (targetX - xPos) * eased;
          yPos = yPos + (targetY - yPos) * eased;
          // Small bounce at end
          if (finalFrac > 0.8) {
            const bounceT = (finalFrac - 0.8) / 0.2;
            yPos -= Math.sin(bounceT * Math.PI) * 4;
          }
        }

        ball.x = xPos;
        ball.y = yPos;

        // Draw ball with strong glow halo
        const glowR = ballRadius * 2;
        const glowGrad = ctx.createRadialGradient(xPos, yPos, 0, xPos, yPos, glowR);
        glowGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
        glowGrad.addColorStop(0.3, 'rgba(255,255,255,0.15)');
        glowGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(xPos, yPos, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Ball body — bright white with gradient for 3D look
        const ballGrad = ctx.createRadialGradient(xPos - ballRadius * 0.35, yPos - ballRadius * 0.35, 0, xPos, yPos, ballRadius);
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.4, '#f5f5f5');
        ballGrad.addColorStop(0.8, '#d0d0d0');
        ballGrad.addColorStop(1, '#999999');
        ctx.beginPath();
        ctx.arc(xPos, yPos, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.fill();

        // Bright outline for visibility on dark background
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Check completion — keep ball visible until landing animation finishes
        if (progress >= 1.25 && !completedBallsRef.current.has(ball.id)) {
          completedBallsRef.current.add(ball.id);
          ball.done = true;
          const slotIdx = ball.slot;
          const winColor = ball.payout > 0 && ball.multiplier >= 1 ? '#3DD68C' : '#666';
          // P1 #5: support multiple simultaneous float texts via ref Map
          floatTextsRef.current.set(ball.id, {
            x: slotIdx * slotW + slotW / 2,
            y: H - bottomPad - 10,
            text: (ball.payout > 0 ? '+' : '') + formatAmount(ball.payout),
            color: winColor,
            createdAt: now,
          });
          highlightSlotsRef.current.set(ball.id, ball.slot);
          // Auto-expire this ball's float text and highlight
          setTimeout(() => {
            floatTextsRef.current.delete(ball.id);
          }, 1500);
          setTimeout(() => {
            highlightSlotsRef.current.delete(ball.id);
          }, 1000);
          setTimeout(() => onBallDone(ball.id), 300);
        }
      }

      // Draw pin flashes (after balls, so they're visible on top)
      for (const [key, entry] of pinFlashesRef.current) {
        if (now > entry.expiry) {
          pinFlashesRef.current.delete(key);
          continue;
        }
        const flashProgress = 1 - (entry.expiry - now) / entry.duration;
        const pinX = entry.x;
        const pinY = entry.y;

        // Draw expanding glow flash
        const flashR = pinRadius + flashProgress * pinRadius * 3;
        const flashAlpha = (1 - flashProgress) * 0.8;
        const flashGrad = ctx.createRadialGradient(pinX, pinY, 0, pinX, pinY, flashR);
        flashGrad.addColorStop(0, `rgba(255,255,255,${flashAlpha * 0.6})`);
        flashGrad.addColorStop(0.5, `rgba(255,255,255,${flashAlpha * 0.2})`);
        flashGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(pinX, pinY, flashR, 0, Math.PI * 2);
        ctx.fillStyle = flashGrad;
        ctx.fill();

        // Bright expanding ring
        ctx.beginPath();
        ctx.arc(pinX, pinY, flashR * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${flashAlpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Squash & stretch: draw a brighter pin core during flash
        const squashScale = 1 + Math.sin(flashProgress * Math.PI) * 0.5;
        ctx.save();
        ctx.translate(pinX, pinY);
        ctx.scale(squashScale, 1 / squashScale);
        ctx.beginPath();
        ctx.arc(0, 0, pinRadius * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${flashAlpha * 0.7})`;
        ctx.fill();
        ctx.restore();
      }

      // Draw all active float texts (P1 #5: multiple simultaneous)
      for (const [ballId, ft] of floatTextsRef.current) {
        const age = (now - ft.createdAt) / 1000;
        if (age >= 1.5) {
          floatTextsRef.current.delete(ballId);
          continue;
        }
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, 1 - age / 1.5);
        ctx.font = 'bold 14px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y - age * 30);
        ctx.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [size, rows, risk, multipliers, onBallDone]);

  // Cleanup completed balls tracking
  useEffect(() => {
    const activeIds = new Set(balls.map((b) => b.id));
    for (const id of completedBallsRef.current) {
      if (!activeIds.has(id)) completedBallsRef.current.delete(id);
    }
  }, [balls]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl overflow-hidden relative">
        <canvas
          ref={canvasRef}
          style={{ width: size.w, height: size.h }}
          className="block w-full"
        />
      </div>
    </div>
  );
}
