import { useState } from 'react';
import {
  ChevronLeft, BookOpen, X, Users, Star, TrendingUp,
  Wrench, Clock,
} from 'lucide-react';
import { gamesData, recentWins, type GameInfo } from './data';

function GameCard({ game, onPlay }: { game: GameInfo; onPlay: (g: GameInfo) => void }) {
  return (
    <button
      onClick={() => onPlay(game)}
      className="group bg-black border border-white/15 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-white/50 text-left shrink-0 w-[160px]"
    >
      <div className="relative aspect-[3/4] overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-50"
          style={{ background: `radial-gradient(circle at 50% 40%, ${game.accent}, transparent 70%)` }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(160deg, ${game.accent}22, transparent 60%)` }}
        />
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: game.accent, boxShadow: `0 0 24px ${game.accent}55` }}
        >
          <span className="text-black text-xl font-black">{game.name.charAt(0)}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black to-transparent">
          <h4 className="text-white font-black text-[11px] tracking-wider leading-tight">{game.name}</h4>
          <p className="text-white/40 text-[9px] mt-0.5 tracking-wide font-semibold">{game.provider}</p>
        </div>
      </div>
    </button>
  );
}

export default function GamePage({
  gameId,
  onHome,
  onOpenGame,
}: {
  gameId: string;
  onHome: () => void;
  onOpenGame: (id: string) => void;
  onOpenCabinet: () => void;
}) {
  const game = gamesData.find((g) => g.id === gameId) ?? gamesData[0];
  const [showRules, setShowRules] = useState(false);
  const [mobileTab, setMobileTab] = useState<'info' | 'wins'>('info');

  const recommended = gamesData.filter((g) => g.id !== game.id).slice(0, 7);

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
            <button onClick={onHome} className="text-white/40 hover:text-white transition-colors">{game.provider}</button>
            <span className="text-white/20">/</span>
            <span className="text-white">{game.name}</span>
          </nav>
        </div>

        {/* 3-column desktop layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-3 items-start">

          {/* LEFT PANEL — desktop only */}
          <aside className="hidden lg:flex flex-col gap-3">
            {/* Recent wins */}
            <div className="bg-black border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-white/40" strokeWidth={2} />
                <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Последние выигрыши</p>
              </div>
              <div className="flex flex-col gap-3">
                {recentWins.slice(0, 5).map((w) => (
                  <div key={w.id} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <Star size={11} className="text-amber-400" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-[12px] font-bold leading-tight truncate">{w.nick}</div>
                      <div className="text-white/30 text-[10px] leading-tight">{w.game}</div>
                    </div>
                    <div className="text-white font-black text-[11px] tabular-nums whitespace-nowrap">{w.amount}</div>
                  </div>
                ))}
              </div>
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

            {/* Game area — technical works message */}
            <div className="relative bg-[#0a0a0a] border border-white/20 rounded-xl overflow-hidden h-[280px] sm:h-[360px] lg:h-[440px]">
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 50% 50%, ${game.accent}11, transparent 70%)` }}
              />

              {/* Status badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                <span className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-400 text-[10px] font-black tracking-widest">ТЕХНИЧЕСКИЕ РАБОТЫ</span>
                </span>
              </div>

              {/* Online count */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 text-white/30 z-10">
                <Users size={13} strokeWidth={2} />
                <span className="text-[11px] font-bold tabular-nums">0</span>
              </div>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: `${game.accent}15`, border: `1px solid ${game.accent}33` }}
                >
                  <Wrench size={28} style={{ color: game.accent }} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-white font-black text-[22px] tracking-wide">{game.name}</p>
                  <p className="text-white/40 text-[13px] font-semibold mt-1">{game.provider}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-white/60 text-[14px] font-bold">Игра находится на техническом обслуживании</p>
                  <p className="text-white/30 text-[12px] leading-relaxed max-w-[360px]">
                    Мы работаем над тем, чтобы вернуть игру как можно скорее. Спасибо за терпение.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-white/20 text-[11px] font-bold tracking-wide">
                  <Clock size={12} strokeWidth={2} />
                  <span>Время восстановления: скоро</span>
                </div>
              </div>
            </div>

            {/* Game info bar */}
            <div className="bg-black border border-white/15 rounded-xl p-4 flex items-center gap-4 flex-wrap">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${game.accent}22`, border: `1px solid ${game.accent}44` }}
              >
                <span className="text-base font-black" style={{ color: game.accent }}>{game.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-black text-[14px] tracking-wide leading-none truncate">{game.name}</h2>
                <p className="text-white/40 text-[10px] font-semibold tracking-wide mt-1">{game.provider}</p>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-white/40 text-[9px] font-bold tracking-widest uppercase">RTP</span>
                  <span className="text-white font-bold tabular-nums">{game.rtp}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-white/40 text-[9px] font-bold tracking-widest uppercase">Макс. выигрыш</span>
                  <span className="text-white font-bold tabular-nums">{game.maxWin}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-white/40 text-[9px] font-bold tracking-widest uppercase">Волатильность</span>
                  <span className="text-white font-bold">{game.volatility}</span>
                </div>
              </div>
            </div>

            {/* Mobile: tabs for info/wins */}
            <div className="lg:hidden">
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10 mb-2">
                <button
                  onClick={() => setMobileTab('info')}
                  className={`flex-1 text-[11px] font-bold tracking-wide py-2 rounded-md transition-colors ${
                    mobileTab === 'info' ? 'bg-white text-black' : 'text-white/40'
                  }`}
                >
                  ИНФОРМАЦИЯ
                </button>
                <button
                  onClick={() => setMobileTab('wins')}
                  className={`flex-1 text-[11px] font-bold tracking-wide py-2 rounded-md transition-colors ${
                    mobileTab === 'wins' ? 'bg-white text-black' : 'text-white/40'
                  }`}
                >
                  ВЫИГРЫШИ
                </button>
                <button
                  onClick={() => setShowRules(true)}
                  className="flex-1 text-[11px] font-bold tracking-wide py-2 rounded-md text-white/40"
                >
                  ПРАВИЛА
                </button>
              </div>

              {mobileTab === 'info' ? (
                <div className="bg-black border border-white/15 rounded-xl p-4">
                  <div className="flex flex-col gap-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-white/40">RTP</span>
                      <span className="text-white font-bold">{game.rtp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Макс. выигрыш</span>
                      <span className="text-white font-bold">{game.maxWin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Мин. ставка</span>
                      <span className="text-white font-bold">{game.minBet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Макс. ставка</span>
                      <span className="text-white font-bold">{game.maxBet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Волатильность</span>
                      <span className="text-white font-bold">{game.volatility}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black border border-white/15 rounded-xl p-3 max-h-[240px] overflow-y-auto">
                  <div className="flex flex-col gap-2">
                    {recentWins.map((w) => (
                      <div key={w.id} className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                          <Star size={11} className="text-amber-400" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-white text-[12px] font-bold truncate">{w.nick}</span>
                          <span className="text-white/30 text-[10px] truncate block">{w.game}</span>
                        </div>
                        <span className="text-white font-black text-[11px] tabular-nums shrink-0">{w.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: recent wins list */}
            <div className="hidden lg:block bg-black border border-white/15 rounded-xl p-4">
              <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase mb-3">Последние выигрыши</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 max-h-[200px] overflow-y-auto">
                {recentWins.map((w) => (
                  <div key={w.id} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <Star size={11} className="text-amber-400" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-white text-[11px] font-bold truncate">{w.nick}</span>
                      <span className="text-white/30 text-[10px] truncate block">{w.game}</span>
                    </div>
                    <span className="text-white font-black text-[11px] tabular-nums shrink-0">{w.amount}</span>
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
                  <span className="text-[11px] font-bold tabular-nums">0</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-white/40">RTP</span>
                  <span className="text-white font-bold">{game.rtp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Макс. выигрыш</span>
                  <span className="text-white font-bold">{game.maxWin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Мин. ставка</span>
                  <span className="text-white font-bold">{game.minBet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Макс. ставка</span>
                  <span className="text-white font-bold">{game.maxBet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Волатильность</span>
                  <span className="text-white font-bold">{game.volatility}</span>
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

        {/* Description */}
        <div className="bg-black border border-white/15 rounded-xl p-5 md:p-6">
          <h2 className="text-white font-black text-[14px] tracking-[0.2em] mb-3">ОПИСАНИЕ</h2>
          <p className="text-white/60 text-[13px] leading-relaxed">{game.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {game.features.map((f) => (
              <span
                key={f}
                className="text-white/70 text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended games */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-black text-[14px] tracking-[0.2em]">РЕКОМЕНДУЕМЫЕ ИГРЫ</h2>
            <button className="text-white/30 hover:text-white text-[11px] font-bold tracking-wide transition-colors">
              СМОТРЕТЬ ВСЕ ›
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            {recommended.map((g) => (
              <GameCard key={g.id} game={g} onPlay={(gg) => onOpenGame(gg.id)} />
            ))}
          </div>
        </div>

        {/* Mobile sticky info panel */}
        <div className="sm:hidden sticky bottom-0 z-30 bg-black/95 backdrop-blur-md border border-white/15 rounded-xl p-3 -mx-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${game.accent}22`, border: `1px solid ${game.accent}44` }}
            >
              <Wrench size={14} style={{ color: game.accent }} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-[12px] font-bold truncate">{game.name}</p>
              <p className="text-amber-400 text-[10px] font-bold tracking-wide">Технические работы</p>
            </div>
            <button
              onClick={() => setShowRules(true)}
              className="text-white/40 hover:text-white transition-colors p-1.5"
            >
              <BookOpen size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Rules modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowRules(false)}>
          <div className="bg-black border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-[16px] tracking-[0.15em]">ПРАВИЛА — {game.name}</h2>
              <button onClick={() => setShowRules(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {game.rules.map((r) => (
                <div key={r.title}>
                  <h3 className="text-white font-bold text-[13px] tracking-wide mb-1.5">{r.title}</h3>
                  <p className="text-white/50 text-[12px] leading-relaxed">{r.body}</p>
                </div>
              ))}
              <div>
                <h3 className="text-white font-bold text-[13px] tracking-wide mb-2">Таблица выплат</h3>
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  {game.paytable.map((p, i) => (
                    <div key={p.symbol} className={`flex items-center justify-between px-4 py-2.5 ${i % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <span className="text-white/60 text-[12px] font-semibold">{p.symbol}</span>
                      <span className="text-white text-[12px] font-bold tabular-nums">{p.payout}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
