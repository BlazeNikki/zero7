import { useEffect, useState } from 'react';
import { fetchWinners, winnerImages, type Winner } from '@/data/winners';
import { fetchItems } from '@/lib/directus';

const slides = [
  {
    eyebrow: 'ПРИВЕТСТВЕННЫЙ БОНУС',
    title: '100% НА ПЕРВЫЙ ДЕПОЗИТ',
    sub: 'ДО 50 000 ₽ + 200 FS',
    cta: 'ПОЛУЧИТЬ БОНУС',
    bg: '/images/cashback/4aefdf7b-de40-4c1e-9a5d-c9f85af0fb78.jpg',
  },
  {
    eyebrow: 'ЭКСКЛЮЗИВНОЕ ПРЕДЛОЖЕНИЕ',
    title: '50 ФРИСПИНОВ ЗА РЕГИСТРАЦИЮ',
    sub: 'В ИГРЕ WILD WEST GOLD',
    cta: 'ЗАБРАТЬ ФРИСПИНЫ',
    bg: '/images/cashback/4aefdf7b-de40-4c1e-9a5d-c9f85af0fb78.jpg',
  },
  {
    eyebrow: 'КЭШБЭК КАЖДУЮ НЕДЕЛЮ',
    title: 'ВОЗВРАТ ДО 10% ОТ ПРОИГРЫША',
    sub: 'БЕЗ ОТЫГРЫША — СРАЗУ НА БАЛАНС',
    cta: 'АКТИВИРОВАТЬ',
    bg: '/images/cashback/4aefdf7b-de40-4c1e-9a5d-c9f85af0fb78.jpg',
  },
];

type GameEntry = { id: string; name: string; provider: string; accent: string };

const defaultGames: GameEntry[] = [
  { id: 'g1', name: 'COIN FLIP', provider: 'Originals', accent: '#FFD23F' },
  { id: 'g2', name: 'DICE', provider: 'Originals', accent: '#4DA8FF' },
  { id: 'g3', name: 'HI-LO', provider: 'Originals', accent: '#3DD68C' },
  { id: 'g4', name: 'WHEEL', provider: 'Originals', accent: '#FF6B9D' },
  { id: 'g5', name: 'MINES', provider: 'Originals', accent: '#FF9E2C' },
  { id: 'g6', name: 'CRASH', provider: 'Originals', accent: '#FF4D6D' },
  { id: 'g7', name: 'PLINKO', provider: 'Originals', accent: '#A78BFA' },
];

export default function CenterColumn({ onOpenGame }: { onOpenGame?: (id: string) => void }) {
  const [active, setActive] = useState(0);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [games, setGames] = useState<GameEntry[]>(defaultGames);

  useEffect(() => {
    fetchWinners().then(setWinners).catch(() => {});
    fetchItems<Record<string, unknown>>('games').then((data) => {
      if (data && data.length > 0) {
        setGames(data.map((r) => ({ id: r.id as string, name: r.name as string, provider: r.provider as string, accent: r.accent as string })));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-6 pb-4 lg:overflow-y-auto">
      {/* Promo banner */}
      <div className="relative h-[220px] md:h-[300px] rounded-xl overflow-hidden shrink-0 border border-white/20">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.bg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover brightness-[0.35] contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="relative h-full flex items-center px-5 md:px-12">
              <div className="max-w-[65%] md:max-w-[60%]">
                <p className="text-[9px] md:text-[11px] text-white/50 font-bold tracking-[0.2em] md:tracking-[0.25em]">{slide.eyebrow}</p>
                <h2 className="text-white font-black text-[22px] md:text-[40px] leading-[1.05] tracking-tight mt-2 md:mt-3">
                  {slide.title}
                </h2>
                <p className="text-white/60 text-[12px] md:text-[16px] font-bold mt-2 md:mt-3">{slide.sub}</p>
                <button className="mt-4 md:mt-7 bg-white text-black font-black text-[11px] md:text-[12px] tracking-[0.2em] rounded-md px-5 md:px-7 py-2.5 md:py-3.5 hover:bg-white/90 active:bg-white/80 transition-colors">
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`transition-all rounded-full ${
                i === active ? 'w-7 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Recent wins — horizontal scroll on mobile only */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-black text-[13px] tracking-[0.2em]">ПОСЛЕДНИЕ ПОБЕДЫ</h3>
          <span className="text-white/30 text-[11px] font-bold tracking-wide">›</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [::-webkit-scrollbar]:hidden">
          {winners.map((w, i) => (
            <div
              key={w.id}
              className="snap-start shrink-0 w-[260px] bg-black border border-white/15 rounded-xl p-3 flex items-center gap-3"
            >
              <img
                src={winnerImages[i % winnerImages.length]}
                alt=""
                className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold text-[13px] truncate">{w.name}</p>
                <p className="text-white/40 text-[11px] truncate">{w.game}</p>
                <p className="text-white font-black text-[14px] mt-0.5">{w.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular games */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-[15px] tracking-[0.2em]">ПОПУЛЯРНЫЕ ИГРЫ</h3>
          <a href="#" className="text-white/30 hover:text-white text-[12px] font-bold tracking-wide transition-colors">
            СМОТРЕТЬ ВСЕ ›
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {games.map((g, i) => (
            <button
              key={g.id}
              onClick={() => onOpenGame?.(g.id)}
              className="group bg-black border border-white/15 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-white/50 text-left animate-card-enter"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-50"
                  style={{ background: `radial-gradient(circle at 50% 40%, ${g.accent}, transparent 70%)` }}
                />
                <div
                  className="absolute inset-0 opacity-100"
                  style={{ background: `linear-gradient(160deg, ${g.accent}22, transparent 60%)` }}
                />
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${g.accent}`, boxShadow: `0 0 24px ${g.accent}55` }}
                >
                  <span className="text-black text-xl font-black">{g.name.charAt(0)}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <span className="text-black text-base ml-0.5">▶</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <h4 className="text-white font-black text-[12px] tracking-wider leading-tight">{g.name}</h4>
                  <p className="text-white/40 text-[10px] mt-0.5 tracking-wide font-semibold">{g.provider}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
