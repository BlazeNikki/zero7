import { useState, useEffect } from 'react';
import { ChevronLeft, TrendingUp, BookOpen, X, Users, User, ExternalLink } from 'lucide-react';
import { useCrashGame } from './useCrashGame';
import CrashGraph from './CrashGraph';
import BetSlot from './BetSlot';
import { initialHistory, pillColor } from './data';
import { formatMultiplier, formatAmount } from './engine';
import type { RoundResult } from './types';
import { useWallet } from '@/lib/wallet';
import { fetchGameBySlug, fetchWinnersByGame, type GameWinner } from '@/game/data';

export default function CrashPage({ onHome }: { onHome: () => void }) {
  const game = useCrashGame();
  const wallet = useWallet();
  const [showRules, setShowRules] = useState(false);
  const [showVerify, setShowVerify] = useState<RoundResult | null>(null);
  const [mobileTab, setMobileTab] = useState<'players' | 'history'>('players');
  const [topWins, setTopWins] = useState<GameWinner[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchGameBySlug('crash')
      .then((g) => g ? fetchWinnersByGame(g.id, 8) : [])
      .then((wins) => { if (!cancelled) setTopWins(wins); })
      .catch(() => { if (!cancelled) setTopWins([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex justify-center w-full flex-1 px-1 pt-3 pb-6">
      <div className="w-full max-w-[1408px] flex flex-col gap-3">

        {/* Breadcrumb + back */}
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
            <span className="text-white">CRASH</span>
          </nav>
        </div>

        {/* 3-column desktop layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-3 items-start">

          {/* LEFT PANEL — desktop only */}
          <aside className="hidden lg:flex flex-col gap-3">
            {/* Top wins */}
            <div className="bg-black border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-white/40" strokeWidth={2} />
                <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Топ выигрышей Crash</p>
              </div>
              {topWins.length === 0 ? (
                <p className="text-white/30 text-[12px] text-center py-4">Нет данных о выигрышах</p>
              ) : (
              <div className="flex flex-col gap-3">
                {topWins.map((w) => {
                  const nickname = w.player?.nickname || w.name || 'Аноним';
                  return (
                  <div key={w.id} className="flex items-center gap-2.5">
                    {w.player?.avatar ? (
                      <img
                        src={w.player.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/15"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                        <User size={13} className="text-white/40" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-[12px] font-bold leading-tight truncate">{nickname}</div>
                      <div className="text-white/30 text-[10px] leading-tight truncate">{w.game}</div>
                    </div>
                    <div className="text-white font-black text-[11px] tabular-nums whitespace-nowrap">{w.amount}</div>
                    {w.tx_signature && (
                      <a
                        href={`https://explorer.solana.com/tx/${w.tx_signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-white/30 hover:text-white/60 transition-colors shrink-0"
                        title="Открыть в Solana Explorer"
                      >
                        <ExternalLink size={10} strokeWidth={2} />
                      </a>
                    )}
                  </div>
                  );
                })}
              </div>
              )}
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
                        {r.result === 'win' ? formatMultiplier(r.multiplier!) : 'CRASH'}
                      </span>
                      <span className={`font-black tabular-nums ${r.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.result === 'win' ? '+' + formatAmount(r.payout) : '-' + formatAmount(r.amount)}
                      </span>
                    </div>
                  ))}
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

          {/* CENTER — game area */}
          <div className="flex flex-col gap-3 min-w-0">

            {/* Round history pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [::-webkit-scrollbar]:hidden -mx-1 px-1">
              {game.history.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setShowVerify(r)}
                  className={`shrink-0 text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full border transition-colors ${pillColor(r.crashPoint)}`}
                >
                  {r.crashPoint.toFixed(2)}x
                </button>
              ))}
              {game.history.length === 0 && initialHistory.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setShowVerify(r)}
                  className={`shrink-0 text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full border transition-colors ${pillColor(r.crashPoint)}`}
                >
                  {r.crashPoint.toFixed(2)}x
                </button>
              ))}
            </div>

            {/* Graph */}
            <div className="relative bg-[#0a0a0a] border border-white/20 rounded-xl overflow-hidden h-[280px] sm:h-[360px] lg:h-[440px]">
              <CrashGraph
                phase={game.phase}
                multiplier={game.multiplier}
                crashPoint={game.crashPoint}
                countdown={game.countdown}
              />

              {/* Status badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                {game.phase === 'running' && (
                  <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-[10px] font-black tracking-widest">LIVE</span>
                  </span>
                )}
                {game.phase === 'betting' && (
                  <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    <span className="text-white/60 text-[10px] font-black tracking-widest">ПРИЁМ СТАВОК</span>
                  </span>
                )}
                <span className="text-white/20 text-[10px] font-bold tracking-widest">РАУНД #{game.roundNumber}</span>
              </div>

              {/* Online count */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 text-white/30 z-10">
                <Users size={13} strokeWidth={2} />
                <span className="text-[11px] font-bold tabular-nums">{384 + game.simPlayers.length}</span>
              </div>

              {/* Provably fair hash */}
              <div className="absolute bottom-3 left-3 z-10">
                <span className="text-white/15 text-[9px] font-mono tracking-tight">
                  {game.seeds.serverSeedHash.slice(0, 24)}…
                </span>
              </div>
            </div>

            {/* Bet slots — desktop side by side */}
            <div className="hidden sm:grid grid-cols-2 gap-3">
              <BetSlot
                slot={0}
                state={game.betSlots[0]}
                phase={game.phase}
                multiplier={game.multiplier}
                onPlace={() => wallet.requireWallet(() => game.placeBet(0))}
                onCashOut={() => wallet.requireWallet(() => game.cashOut(0))}
                onUpdate={(patch) => wallet.requireWallet(() => game.updateBetSlot(0, patch))}
              />
              <BetSlot
                slot={1}
                state={game.betSlots[1]}
                phase={game.phase}
                multiplier={game.multiplier}
                onPlace={() => wallet.requireWallet(() => game.placeBet(1))}
                onCashOut={() => wallet.requireWallet(() => game.cashOut(1))}
                onUpdate={(patch) => wallet.requireWallet(() => game.updateBetSlot(1, patch))}
              />
            </div>

            {/* Mobile: tabs for players/history */}
            <div className="lg:hidden">
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10 mb-2">
                <button
                  onClick={() => setMobileTab('players')}
                  className={`flex-1 text-[11px] font-bold tracking-wide py-2 rounded-md transition-colors ${
                    mobileTab === 'players' ? 'bg-white text-black' : 'text-white/40'
                  }`}
                >
                  ИГРОКИ ({game.simPlayers.length})
                </button>
                <button
                  onClick={() => setMobileTab('history')}
                  className={`flex-1 text-[11px] font-bold tracking-wide py-2 rounded-md transition-colors ${
                    mobileTab === 'history' ? 'bg-white text-black' : 'text-white/40'
                  }`}
                >
                  ИСТОРИЯ
                </button>
              </div>

              {mobileTab === 'players' ? (
                <div className="bg-black border border-white/15 rounded-xl p-3 max-h-[240px] overflow-y-auto">
                  <div className="flex flex-col gap-2">
                    {game.simPlayers.map((p) => (
                      <div key={p.id} className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white/50 text-[10px] font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-white text-[12px] font-bold truncate">{p.name}</span>
                          <span className="text-[8px] text-white/40 font-bold tracking-wider border border-white/15 rounded-[3px] px-1 py-[2px] leading-none ml-1.5">
                            VIP {p.vip}
                          </span>
                        </div>
                        <span className="text-white/50 text-[11px] font-bold tabular-nums shrink-0">{formatAmount(p.bet)}</span>
                        <span className={`text-[10px] font-bold tabular-nums shrink-0 w-14 text-right ${
                          p.cashedOut ? 'text-emerald-400' : game.phase === 'crashed' || game.phase === 'result' ? 'text-red-400' : 'text-white/30'
                        }`}>
                          {p.cashedOut ? formatMultiplier(p.cashoutMultiplier!) : game.phase === 'crashed' || game.phase === 'result' ? '—' : '...'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-black border border-white/15 rounded-xl p-3 max-h-[240px] overflow-y-auto">
                  {game.betRecords.length === 0 ? (
                    <p className="text-white/20 text-[11px] font-medium text-center py-4">Нет ставок</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {game.betRecords.map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-white/50 font-bold tabular-nums">{formatAmount(r.amount)}</span>
                          <span className={`font-bold tabular-nums ${r.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {r.result === 'win' ? formatMultiplier(r.multiplier!) : 'CRASH'}
                          </span>
                          <span className={`font-black tabular-nums ${r.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {r.result === 'win' ? '+' + formatAmount(r.payout) : '-' + formatAmount(r.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop: live players list */}
            <div className="hidden lg:block bg-black border border-white/15 rounded-xl p-4">
              <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase mb-3">Игроки раунда</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 max-h-[200px] overflow-y-auto">
                {game.simPlayers.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white/50 text-[9px] font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-white text-[11px] font-bold truncate">{p.name}</span>
                      <span className="text-[8px] text-white/40 font-bold tracking-wider border border-white/15 rounded-[3px] px-1 py-[2px] leading-none ml-1">
                        VIP {p.vip}
                      </span>
                    </div>
                    <span className="text-white/50 text-[10px] font-bold tabular-nums shrink-0">{formatAmount(p.bet)}</span>
                    <span className={`text-[10px] font-bold tabular-nums shrink-0 w-12 text-right ${
                      p.cashedOut ? 'text-emerald-400' : game.phase === 'crashed' || game.phase === 'result' ? 'text-red-400' : 'text-white/30'
                    }`}>
                      {p.cashedOut ? formatMultiplier(p.cashoutMultiplier!) : game.phase === 'crashed' || game.phase === 'result' ? '—' : '...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL — desktop only */}
          <aside className="hidden lg:flex flex-col gap-3">
            <div className="bg-black border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Информация</p>
                <div className="flex items-center gap-1.5 text-white/30">
                  <Users size={13} strokeWidth={2} />
                  <span className="text-[11px] font-bold tabular-nums">384</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-white/40">RTP</span>
                  <span className="text-white font-bold">97%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Макс. выигрыш</span>
                  <span className="text-white font-bold">x1000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Мин. ставка</span>
                  <span className="text-white font-bold">10 ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Макс. ставка</span>
                  <span className="text-white font-bold">100 000 ₽</span>
                </div>
              </div>
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
        <div className="sm:hidden sticky bottom-0 z-30 bg-black/95 backdrop-blur-md border border-white/15 rounded-xl p-3 -mx-1">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10 mb-2">
            <button
              onClick={() => setMobileTab('players' as any)}
              className="flex-1 text-[10px] font-bold tracking-wide py-1.5 rounded-md text-white/40"
            >
              ИГРОКИ
            </button>
            <button
              onClick={() => setMobileTab('history' as any)}
              className="flex-1 text-[10px] font-bold tracking-wide py-1.5 rounded-md text-white/40"
            >
              ИСТОРИЯ
            </button>
            <button
              onClick={() => setShowRules(true)}
              className="flex-1 text-[10px] font-bold tracking-wide py-1.5 rounded-md text-white/40"
            >
              ПРАВИЛА
            </button>
          </div>
          <BetSlot
            slot={0}
            state={game.betSlots[0]}
            phase={game.phase}
            multiplier={game.multiplier}
            onPlace={() => wallet.requireWallet(() => game.placeBet(0))}
            onCashOut={() => wallet.requireWallet(() => game.cashOut(0))}
            onUpdate={(patch) => wallet.requireWallet(() => game.updateBetSlot(0, patch))}
          />
        </div>
      </div>

      {/* Rules modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowRules(false)}>
          <div className="bg-black border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-[16px] tracking-[0.15em]">ПРАВИЛА — CRASH</h2>
              <button onClick={() => setShowRules(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Цель игры</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Забрать выигрыш до того, как множитель обрушится. Чем дольше ждёте — тем больше выигрыш, но и риск выше.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Множитель</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Множитель растёт от 1.00x по экспоненте. Выигрыш = ставка × множитель на момент вывода.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Два слота ставок</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Вы можете делать две независимые ставки одновременно с разными суммами и стратегиями.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Автокэшаут</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">В режиме «Авто» можно задать множитель, при котором ставка автоматически выводится без вашего участия.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">Provably Fair</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">Каждый раунд генерируется на основе серверного и клиентского сида. Хэш серверного сида публикуется до начала раунда, сам сид раскрывается после. Вы можете проверить честность любого раунда, нажав на его множитель в истории.</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">RTP и лимиты</h3>
                <p className="text-white/50 text-[12px] leading-relaxed">RTP: 97%. Мин. ставка: 10 ₽. Макс. ставка: 100 000 ₽. Макс. множитель: x1000.</p>
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
                <span className="text-white/40 text-[11px] font-bold">Множитель краша</span>
                <span className={`font-black text-[18px] tabular-nums ${showVerify.crashPoint < 1.2 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {showVerify.crashPoint.toFixed(2)}x
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-white/40">Server Seed</span><span className="text-white/70 font-mono">{showVerify.serverSeed}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Server Seed Hash</span><span className="text-white/70 font-mono">{showVerify.serverSeedHash}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Client Seed</span><span className="text-white/70 font-mono">{showVerify.clientSeed}</span></div>
              </div>
              <p className="text-white/30 text-[10px] leading-relaxed mt-1">Используйте сторонний калькулятор HMAC-SHA256 для проверки соответствия результата сида и множителя краша.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
