import { useState, useEffect, useMemo } from 'react';
import {
  Trophy, ChevronLeft, Search, Users, Calendar, Clock, Play,
  Crown, Target, SlidersHorizontal, X,
} from 'lucide-react';
import { tournaments, providers, categories, fundRanges, entryTypes, type Tournament, type TournamentStatus } from './data';
import { useWallet } from '@/lib/wallet';

const fmt = (n: number) => String(n).padStart(2, '0');

function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

const statusLabels: Record<TournamentStatus, string> = {
  active: 'Активен',
  upcoming: 'Скоро',
  finished: 'Завершен',
};

const statusStyles: Record<TournamentStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  upcoming: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  finished: 'bg-white/10 text-white/40 border-white/20',
};

function StatusBadge({ status }: { status: TournamentStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase border rounded px-2 py-1 leading-none ${statusStyles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}

function CountdownTimer({ target, compact }: { target: number; compact?: boolean }) {
  const { d, h, m, s } = useCountdown(target);
  const units = [
    { v: d, l: 'ДНИ' },
    { v: h, l: 'ЧАС' },
    { v: m, l: 'МИН' },
    { v: s, l: 'СЕК' },
  ];
  return (
    <div className={`flex items-center gap-2 ${compact ? 'flex-wrap' : ''}`}>
      {units.map((u, i) => (
        <div key={u.l} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="text-white font-black tabular-nums tracking-tight leading-none bg-white/5 border border-white/15 rounded-md px-2.5 py-1.5 text-[18px]">
              {fmt(u.v)}
            </div>
            <div className="text-[8px] text-white/30 mt-1 tracking-widest font-bold">{u.l}</div>
          </div>
          {i < 3 && <span className="text-white/20 font-black text-[18px] -mt-3">:</span>}
        </div>
      ))}
    </div>
  );
}

function TournamentCard({ t, onOpen }: { t: Tournament; onOpen: () => void }) {
  const wallet = useWallet();
  return (
    <div className="bg-black border border-white/15 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-white/40 hover:-translate-y-0.5">
      <div className="relative h-36 overflow-hidden">
        <img src={t.banner} alt={t.name} className="w-full h-full object-cover brightness-[0.5]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute top-3 left-4 right-4 flex items-start justify-between">
          <div>
            <h3 className="text-white font-black text-[18px] leading-tight tracking-tight">{t.name}</h3>
            <p className="text-white/40 text-[11px] font-semibold tracking-wide mt-0.5">{t.provider} · {t.category}</p>
          </div>
          <StatusBadge status={t.status} />
        </div>
        <div className="absolute bottom-3 left-4">
          <span className="text-amber-400 font-black text-[20px] tracking-tight">{t.prizePool}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-white/30 shrink-0" />
            <span className="text-white/30">Мин. ставка:</span>
            <span className="text-white/70 font-semibold">{t.minBet}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-white/30 shrink-0" />
            <span className="text-white/30">Участников:</span>
            <span className="text-white/70 font-semibold tabular-nums">{t.participants.toLocaleString('ru-RU')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-white/30 shrink-0" />
            <span className="text-white/30">Старт:</span>
            <span className="text-white/70 font-semibold">{t.startsAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-white/30 shrink-0" />
            <span className="text-white/30">Финиш:</span>
            <span className="text-white/70 font-semibold">{t.endsAt}</span>
          </div>
        </div>

        {t.status === 'active' && t.myStats && (
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10">
            <div>
              <span className="text-white/30 text-[9px] uppercase tracking-wider block">Место</span>
              <span className="text-white font-black text-[16px]">#{t.myStats.place}</span>
            </div>
            <div>
              <span className="text-white/30 text-[9px] uppercase tracking-wider block">Очки</span>
              <span className="text-white font-black text-[16px] tabular-nums">{t.myStats.points.toLocaleString('ru-RU')}</span>
            </div>
            <div>
              <span className="text-white/30 text-[9px] uppercase tracking-wider block">Осталось</span>
              <span className="text-white font-black text-[16px] tabular-nums">
                <MiniCountdown target={t.endsAtTimestamp} />
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <button onClick={onOpen} className="flex-1 border border-white/25 text-white font-bold text-[12px] tracking-[0.15em] rounded-md py-2.5 hover:bg-white/10 transition-colors">
            ПОДРОБНЕЕ
          </button>
          {t.status === 'active' && (
            <button onClick={() => wallet.requireWallet(() => onOpen())} className="flex-1 bg-white text-black font-black text-[12px] tracking-[0.15em] rounded-md py-2.5 hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
              <Play size={14} strokeWidth={2.5} /> ИГРАТЬ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniCountdown({ target }: { target: number }) {
  const { d, h, m } = useCountdown(target);
  return <>{d}д {fmt(h)}ч {fmt(m)}м</>;
}

function GameCard({ name, accent }: { name: string; accent: string }) {
  return (
    <div className="group bg-black border border-white/15 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-white/50">
      <div className="relative aspect-[3/4] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 40%, ${accent}, transparent 70%)` }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${accent}22, transparent 60%)` }} />
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: accent, boxShadow: `0 0 24px ${accent}55` }}>
          <span className="text-black text-lg font-black">{name.charAt(0)}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg">
            <span className="text-black text-sm ml-0.5">▶</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black to-transparent">
          <h4 className="text-white font-black text-[11px] tracking-wider leading-tight">{name}</h4>
        </div>
      </div>
    </div>
  );
}

function TournamentDetail({ t, onBack }: { t: Tournament; onBack: () => void }) {
  const wallet = useWallet();
  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit">
        <ChevronLeft size={20} strokeWidth={2.5} />
        <span className="text-[12px] font-bold tracking-widest">НАЗАД К ТУРНИРАМ</span>
      </button>

      {/* Banner */}
      <div className="relative h-[200px] md:h-[280px] rounded-xl overflow-hidden border border-white/20 shrink-0">
        <img src={t.banner} alt={t.name} className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-5 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={t.status} />
            {t.freeEntry && <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase border border-emerald-500/30 rounded px-2 py-1">Бесплатно</span>}
          </div>
          <h2 className="text-white font-black text-[24px] md:text-[36px] leading-tight tracking-tight">{t.name}</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="text-amber-400 font-black text-[20px] md:text-[26px]">{t.prizePool}</span>
            <span className="text-white/40 text-[13px] font-semibold">{t.provider} · {t.category}</span>
          </div>
        </div>
      </div>

      {/* Timer + CTA */}
      {t.status === 'active' && (
        <div className="bg-black border border-white/15 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-3">До окончания</p>
            <CountdownTimer target={t.endsAtTimestamp} />
          </div>
          <button onClick={() => wallet.requireWallet()} className="bg-white text-black font-black text-[13px] tracking-[0.2em] rounded-md px-8 py-3.5 hover:bg-white/90 transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
            <Play size={16} strokeWidth={2.5} /> ИГРАТЬ
          </button>
        </div>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Description */}
          <div className="bg-black border border-white/15 rounded-xl p-5">
            <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-3">ОПИСАНИЕ</h3>
            <p className="text-white/50 text-[13px] leading-relaxed">{t.description}</p>
          </div>

          {/* Rules */}
          <div className="bg-black border border-white/15 rounded-xl p-5">
            <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">ПРАВИЛА</h3>
            <div className="flex flex-col gap-2.5">
              {t.rules.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/5 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white/50 text-[10px] font-black">{i + 1}</span>
                  </span>
                  <span className="text-white/60 text-[13px] leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prize table */}
          <div className="bg-black border border-white/15 rounded-xl p-5">
            <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">ТАБЛИЦА ПРИЗОВ</h3>
            <div className="flex flex-col gap-2">
              {t.prizeTable.map((row, i) => (
                <div key={i} className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${i === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/[0.02] border border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    {i === 0 && <Crown size={16} className="text-amber-400" />}
                    <span className="text-white font-bold text-[13px]">Место {row.place}</span>
                  </div>
                  <span className={`font-black text-[14px] tabular-nums ${i === 0 ? 'text-amber-400' : 'text-white/80'}`}>{row.prize}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Games */}
          <div className="bg-black border border-white/15 rounded-xl p-5">
            <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">ИГРЫ ТУРНИРА</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {t.games.map((g) => (
                <GameCard key={g.id} name={g.name} accent={g.accent} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column: stats + info */}
        <div className="flex flex-col gap-4">
          {/* Quick info */}
          <div className="bg-black border border-white/15 rounded-xl p-5">
            <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">ИНФОРМАЦИЯ</h3>
            <div className="flex flex-col gap-3 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-white/30">Призовой фонд</span>
                <span className="text-amber-400 font-black">{t.prizePool}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/30">Мин. ставка</span>
                <span className="text-white font-semibold">{t.minBet}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/30">Период</span>
                <span className="text-white/70 font-semibold text-[11px]">{t.startsAt} — {t.endsAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/30">Победителей</span>
                <span className="text-white font-semibold tabular-nums">{t.winnersCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/30">Участников</span>
                <span className="text-white font-semibold tabular-nums">{t.participants.toLocaleString('ru-RU')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/30">Участие</span>
                <span className={`font-semibold ${t.freeEntry ? 'text-emerald-400' : 'text-amber-400'}`}>{t.freeEntry ? 'Бесплатное' : 'Платное'}</span>
              </div>
            </div>
          </div>

          {/* My stats */}
          {t.myStats && (
            <div className="bg-black border border-white/15 rounded-xl p-5">
              <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">МОЯ СТАТИСТИКА</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                  <span className="text-white/30 text-[9px] uppercase tracking-wider block">Место</span>
                  <span className="text-white font-black text-[18px]">#{t.myStats.place}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                  <span className="text-white/30 text-[9px] uppercase tracking-wider block">Очки</span>
                  <span className="text-white font-black text-[18px] tabular-nums">{t.myStats.points.toLocaleString('ru-RU')}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                  <span className="text-white/30 text-[9px] uppercase tracking-wider block">Ставок</span>
                  <span className="text-white font-black text-[18px] tabular-nums">{t.myStats.bets}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                  <span className="text-white/30 text-[9px] uppercase tracking-wider block">Оборот</span>
                  <span className="text-white font-black text-[14px]">{t.myStats.turnover}</span>
                </div>
                <div className="col-span-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <span className="text-emerald-400/60 text-[9px] uppercase tracking-wider block">Предполагаемый выигрыш</span>
                  <span className="text-emerald-400 font-black text-[18px]">{t.myStats.projectedWin}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-black border border-white/15 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={18} className="text-amber-400" />
          <h3 className="text-white font-black text-[13px] tracking-[0.15em]">ТАБЛИЦА ЛИДЕРОВ</h3>
        </div>
        {t.leaderboard.length > 0 ? (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-[10px] font-bold tracking-wider uppercase py-3 px-3">Место</th>
                  <th className="text-left text-white/40 text-[10px] font-bold tracking-wider uppercase py-3 px-3">Игрок</th>
                  <th className="text-left text-white/40 text-[10px] font-bold tracking-wider uppercase py-3 px-3">Очки</th>
                  <th className="text-left text-white/40 text-[10px] font-bold tracking-wider uppercase py-3 px-3">Выигрыш</th>
                </tr>
              </thead>
              <tbody>
                {t.leaderboard.map((row, i) => (
                  <tr key={i} className={`border-b border-white/5 transition-colors ${row.isMe ? 'bg-amber-500/10 border-amber-500/20' : 'hover:bg-white/[0.02]'}`}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {row.rank <= 3 ? (
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${row.rank === 1 ? 'bg-amber-500/20 text-amber-400' : row.rank === 2 ? 'bg-white/15 text-white/70' : 'bg-orange-700/20 text-orange-400'}`}>
                            {row.rank}
                          </span>
                        ) : (
                          <span className="text-white/40 text-[13px] font-bold tabular-nums w-6 text-center">{row.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[13px] font-bold ${row.isMe ? 'text-amber-400' : 'text-white'}`}>{row.player}</span>
                      {row.isMe && <span className="text-[9px] text-amber-400/60 font-bold tracking-wider uppercase ml-2">ВЫ</span>}
                    </td>
                    <td className="py-3 px-3 text-white/70 font-bold text-[13px] tabular-nums">{row.points.toLocaleString('ru-RU')}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold text-[13px] tabular-nums">{row.win}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white/30 text-[13px] text-center py-8">Таблица лидеров будет доступна после начала турнира</p>
        )}
      </div>
    </div>
  );
}

export default function Tournaments() {
  const wallet = useWallet();
  const [tab, setTab] = useState<'active' | 'upcoming' | 'finished'>('active');
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState(providers[0]);
  const [category, setCategory] = useState(categories[0]);
  const [fundRange, setFundRange] = useState(fundRanges[0]);
  const [entry, setEntry] = useState(entryTypes[0]);
  const [sort, setSort] = useState('ending');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = tournaments.filter((t) => t.status === tab);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.provider.toLowerCase().includes(q));
    }
    if (provider !== providers[0]) list = list.filter((t) => t.provider === provider);
    if (category !== categories[0]) list = list.filter((t) => t.category === category);
    if (entry === 'Бесплатные') list = list.filter((t) => t.freeEntry);
    if (entry === 'Платные') list = list.filter((t) => !t.freeEntry);

    if (fundRange !== fundRanges[0]) {
      const parseFund = (s: string) => parseInt(s.replace(/\D/g, ''), 10);
      list = list.filter((t) => {
        const f = parseFund(t.prizePool);
        if (fundRange === 'до 250 000 ₽') return f <= 250000;
        if (fundRange === '250 000 – 500 000 ₽') return f > 250000 && f <= 500000;
        if (fundRange === '500 000 – 1 000 000 ₽') return f > 500000;
        return true;
      });
    }

    const sorted = [...list];
    switch (sort) {
      case 'ending':
        sorted.sort((a, b) => a.endsAtTimestamp - b.endsAtTimestamp);
        break;
      case 'newest':
        sorted.sort((a, b) => b.startsAtTimestamp - a.startsAtTimestamp);
        break;
      case 'fund':
        sorted.sort((a, b) => parseInt(b.prizePool.replace(/\D/g, ''), 10) - parseInt(a.prizePool.replace(/\D/g, ''), 10));
        break;
      case 'participants':
        sorted.sort((a, b) => b.participants - a.participants);
        break;
    }
    return sorted;
  }, [tab, search, provider, category, fundRange, entry, sort]);

  const featured = tournaments.find((t) => t.status === 'active') ?? tournaments[0];

  if (selected) {
    return (
      <div className="flex justify-center w-full flex-1 px-1 pt-3 pb-6">
        <div className="w-full max-w-[1100px] animate-page-enter">
          <TournamentDetail t={selected} onBack={() => setSelected(null)} />
        </div>
      </div>
    );
  }

  const tabs: { id: 'active' | 'upcoming' | 'finished'; label: string }[] = [
    { id: 'active', label: 'Активные' },
    { id: 'upcoming', label: 'Скоро' },
    { id: 'finished', label: 'Завершенные' },
  ];

  return (
    <div className="flex justify-center w-full flex-1 px-1 pt-3 pb-6">
      <div className="w-full max-w-[1408px] flex flex-col gap-4">
          {/* Featured banner */}
          {featured && (
            <div className="relative h-[200px] md:h-[300px] rounded-xl overflow-hidden border border-white/20 shrink-0">
              <img src={featured.banner} alt={featured.name} className="absolute inset-0 w-full h-full object-cover brightness-[0.35] contrast-125" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="relative h-full flex items-center px-5 md:px-12">
                <div className="max-w-[65%] md:max-w-[55%]">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={featured.status} />
                    <span className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Главный турнир</span>
                  </div>
                  <h2 className="text-white font-black text-[22px] md:text-[40px] leading-[1.05] tracking-tight">{featured.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="text-amber-400 font-black text-[18px] md:text-[24px]">{featured.prizePool}</span>
                    <span className="text-white/50 text-[12px] md:text-[14px] font-bold">до {featured.endsAt}</span>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-6">
                    {featured.status === 'active' ? (
                      <button onClick={() => wallet.requireWallet(() => setSelected(featured))} className="bg-white text-black font-black text-[11px] md:text-[12px] tracking-[0.2em] rounded-md px-5 md:px-7 py-2.5 md:py-3.5 hover:bg-white/90 transition-colors">
                        УЧАСТВОВАТЬ
                      </button>
                    ) : (
                      <button onClick={() => setSelected(featured)} className="bg-white text-black font-black text-[11px] md:text-[12px] tracking-[0.2em] rounded-md px-5 md:px-7 py-2.5 md:py-3.5 hover:bg-white/90 transition-colors">
                        ПОДРОБНЕЕ
                      </button>
                    )}
                    <button onClick={() => setSelected(featured)} className="border border-white/30 text-white font-bold text-[11px] md:text-[12px] tracking-[0.18em] rounded-md px-5 md:px-7 py-2.5 md:py-3.5 hover:bg-white/10 transition-colors">
                      ПОДРОБНЕЕ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`text-[12px] font-bold tracking-widest uppercase rounded-md px-4 py-2 transition-colors border ${
                  tab === t.id ? 'bg-white text-black border-white' : 'text-white/40 border-white/15 hover:text-white hover:border-white/30'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search + filters toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5">
              <Search size={16} className="text-white/30 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск турниров..."
                className="bg-transparent text-white text-[13px] placeholder:text-white/25 outline-none flex-1 ml-3"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-white/30 hover:text-white transition-colors">
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-bold tracking-wider transition-colors border ${
                showFilters ? 'bg-white/10 text-white border-white/30' : 'text-white/40 border-white/15 hover:text-white hover:border-white/30'
              }`}
            >
              <SlidersHorizontal size={15} />
              ФИЛЬТРЫ
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 bg-black border border-white/15 rounded-xl p-4">
              <label className="block">
                <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Провайдер</span>
                <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-white/40 cursor-pointer">
                  {providers.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Категория</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-white/40 cursor-pointer">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Призовой фонд</span>
                <select value={fundRange} onChange={(e) => setFundRange(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-white/40 cursor-pointer">
                  {fundRanges.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Участие</span>
                <select value={entry} onChange={(e) => setEntry(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-white/40 cursor-pointer">
                  {entryTypes.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Сортировка</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-white/40 cursor-pointer">
                  <option value="ending">Скоро заканчиваются</option>
                  <option value="newest">Самые новые</option>
                  <option value="fund">Больший призовой фонд</option>
                  <option value="participants">Кол-во участников</option>
                </select>
              </label>
            </div>
          )}

          {/* Tournament cards */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((t, i) => (
                <div key={t.id} className="animate-card-enter" style={{ animationDelay: `${i * 60}ms` }}>
                  <TournamentCard t={t} onOpen={() => setSelected(t)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black border border-white/15 rounded-xl p-12 text-center">
              <Trophy size={40} className="text-white/15 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-white/40 text-[14px] font-semibold">На данный момент активных турниров нет. Следите за новыми акциями.</p>
            </div>
          )}
        </div>
    </div>
  );
}
