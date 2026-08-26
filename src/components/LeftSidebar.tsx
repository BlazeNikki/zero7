import { useEffect, useState } from 'react';
import { fetchWinners, type Winner } from '@/data/winners';
import { User } from 'lucide-react';

function useCountdown(target: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

const fmt = (n: number) => String(n).padStart(2, '0');

export default function LeftSidebar() {
  const target = new Date(Date.now() + 2 * 86400000 + 14 * 3600000 + 37 * 60000 + 49 * 1000);
  const { d, h, m, s } = useCountdown(target);
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    fetchWinners().then(setWinners).catch(() => {});
  }, []);

  return (
    <aside className="flex flex-col gap-3">
      {/* Tournament — matches slider height */}
      <div className="relative bg-black border border-white/20 rounded-xl overflow-hidden h-[220px] md:h-[300px] flex flex-col">
        <div className="relative flex-1 overflow-hidden">
          <img
            src="/images/slider/5abbd92b-d14e-448f-a31b-9743c7913778.jpg"
            alt="Tournament"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="p-3 md:p-4 shrink-0">
          <div className="grid grid-cols-4 gap-2">
            {[
              { v: d, l: 'ДНЕЙ' },
              { v: h, l: 'ЧАСОВ' },
              { v: m, l: 'МИНУТ' },
              { v: s, l: 'СЕК' },
            ].map((u) => (
              <div key={u.l} className="flex flex-col items-center">
                <div className="text-white font-black text-[20px] md:text-[22px] leading-none tabular-nums tracking-tight">
                  {fmt(u.v)}
                </div>
                <div className="text-[9px] text-white/30 mt-1 tracking-widest font-bold">{u.l}</div>
              </div>
            ))}
          </div>

          <button className="w-full mt-3 md:mt-4 bg-white text-black font-black text-[12px] tracking-[0.2em] rounded-md py-2.5 hover:bg-white/90 active:bg-white/80 transition-colors">
            УЧАСТВОВАТЬ
          </button>
        </div>
      </div>

      {/* Cashback */}
      <div className="relative bg-black border border-white/20 rounded-xl overflow-hidden">
        <div className="relative h-28 overflow-hidden">
          <img
            src="/images/tournament/bad4b643-53dc-4e7c-bd66-cea63b4253e2.jpg"
            alt="Cashback"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="p-4">
          <button className="w-full border border-white/30 text-white font-bold text-[12px] tracking-[0.18em] rounded-md py-2.5 hover:bg-white/10 transition-colors">
            ПОДРОБНЕЕ
          </button>
        </div>
      </div>

      {/* Recent wins — hidden on mobile, shown under slider instead */}
      {winners.length > 0 && (
      <div className="hidden lg:block bg-black border border-white/20 rounded-xl p-5">
        <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase mb-4">Последние Победы</p>
        <div className="flex flex-col gap-3.5">
          {winners.map((w) => {
            const nickname = w.player?.nickname || w.name || 'Аноним';
            return (
            <div key={w.id} className="flex items-center gap-3">
              {w.player?.avatar ? (
                <img
                  src={w.player.avatar}
                  alt={nickname}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <User size={16} className="text-white/40" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-white text-[13px] font-bold leading-tight truncate">{nickname}</div>
                <div className="text-white/30 text-[11px] leading-tight truncate">{w.game}</div>
              </div>
              <div className="text-white font-black text-[12px] tabular-nums whitespace-nowrap">
                {w.amount}
              </div>
            </div>
            );
          })}
        </div>
      </div>
      )}
    </aside>
  );
}
