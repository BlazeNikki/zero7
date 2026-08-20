import { useState, useMemo } from 'react';
import {
  Gift, ChevronLeft, Search, Users, Calendar, Clock, Play, Crown,
  Target, SlidersHorizontal, X, Check, ChevronDown, Wallet, Percent,
  Gamepad2, MapPin, HelpCircle,
} from 'lucide-react';
import { promos, promoTypeLabels, promoTypeShort, promoTypes, promoCategories, promoProviders, type Promo, type PromoStatus } from './data';
import { useWallet } from '@/lib/wallet';

const statusLabels: Record<PromoStatus, string> = {
  active: 'Активна',
  upcoming: 'Скоро',
  finished: 'Завершена',
};

const statusStyles: Record<PromoStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  upcoming: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  finished: 'bg-white/10 text-white/40 border-white/20',
};

function StatusBadge({ status }: { status: PromoStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase border rounded px-2 py-1 leading-none ${statusStyles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}

function TypeBadge({ type }: { type: Promo['type'] }) {
  return (
    <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase border border-white/15 text-white/50 rounded px-2 py-1 leading-none bg-white/5">
      {promoTypeShort[type]}
    </span>
  );
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

function PromoCard({ p, onOpen }: { p: Promo; onOpen: () => void }) {
  const wallet = useWallet();
  return (
    <div className="bg-black border border-white/15 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-white/40 hover:-translate-y-0.5">
      <div className="relative h-36 overflow-hidden">
        <img src={p.banner} alt={p.name} className="w-full h-full object-cover brightness-[0.5]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute top-3 left-4 right-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-white font-black text-[17px] leading-tight tracking-tight">{p.name}</h3>
            <p className="text-white/40 text-[11px] font-semibold tracking-wide mt-0.5">{promoTypeLabels[p.type]}</p>
          </div>
          <StatusBadge status={p.status} />
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <span className="text-amber-400 font-black text-[20px] tracking-tight">{p.bonusValue}</span>
            <span className="text-white/50 text-[11px] font-semibold ml-2">{p.bonusLabel}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-white/50 text-[12px] leading-relaxed line-clamp-2">{p.shortDescription}</p>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {p.minDeposit && (
            <div className="flex items-center gap-1.5">
              <Wallet size={12} className="text-white/30 shrink-0" />
              <span className="text-white/30">Мин. депозит:</span>
              <span className="text-white/70 font-semibold">{p.minDeposit}</span>
            </div>
          )}
          {p.maxBonus && (
            <div className="flex items-center gap-1.5">
              <Crown size={12} className="text-white/30 shrink-0" />
              <span className="text-white/30">Макс. бонус:</span>
              <span className="text-white/70 font-semibold">{p.maxBonus}</span>
            </div>
          )}
          {p.wager && (
            <div className="flex items-center gap-1.5">
              <Target size={12} className="text-white/30 shrink-0" />
              <span className="text-white/30">Вейджер:</span>
              <span className="text-white/70 font-semibold">{p.wager}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-white/30 shrink-0" />
            <span className="text-white/30">До:</span>
            <span className="text-white/70 font-semibold">{p.endsAt}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <button onClick={onOpen} className="flex-1 border border-white/25 text-white font-bold text-[12px] tracking-[0.15em] rounded-md py-2.5 hover:bg-white/10 transition-colors">
            ПОДРОБНЕЕ
          </button>
          {p.status === 'active' && (
            <button onClick={() => wallet.requireWallet(() => onOpen())} className="flex-1 bg-white text-black font-black text-[12px] tracking-[0.15em] rounded-md py-2.5 hover:bg-white/90 transition-colors">
              {p.ctaLabel.toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle }: { item: { q: string; a: string }; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-3.5 text-left">
        <span className="text-white/70 text-[13px] font-semibold">{item.q}</span>
        <ChevronDown size={16} className={`text-white/30 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <p className="text-white/40 text-[12px] pb-3.5 leading-relaxed">{item.a}</p>}
    </div>
  );
}

function PromoDetail({ p, onBack }: { p: Promo; onBack: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const wallet = useWallet();

  const conditions: { label: string; value: string | null; icon: typeof Users }[] = [
    { label: 'Кто может участвовать', value: p.whoCanParticipate, icon: Users },
    { label: 'Минимальный депозит', value: p.minDeposit, icon: Wallet },
    { label: 'Максимальный бонус', value: p.maxBonus, icon: Crown },
    { label: 'Процент бонуса', value: p.bonusValue, icon: Percent },
    { label: 'Вейджер', value: p.wager, icon: Target },
    { label: 'Макс. ставка при отыгрыше', value: p.maxBet, icon: Wallet },
    { label: 'Срок действия бонуса', value: p.bonusPeriod, icon: Clock },
    { label: 'Ограничения по играм', value: p.gameRestrictions, icon: Gamepad2 },
    { label: 'Ограничения по странам', value: p.countryRestrictions, icon: MapPin },
  ];

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit">
        <ChevronLeft size={20} strokeWidth={2.5} />
        <span className="text-[12px] font-bold tracking-widest">НАЗАД К АКЦИЯМ</span>
      </button>

      {/* Banner */}
      <div className="relative h-[200px] md:h-[280px] rounded-xl overflow-hidden border border-white/20 shrink-0">
        <img src={p.banner} alt={p.name} className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-5 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={p.status} />
            <TypeBadge type={p.type} />
          </div>
          <h2 className="text-white font-black text-[24px] md:text-[36px] leading-tight tracking-tight">{p.name}</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="text-amber-400 font-black text-[20px] md:text-[26px]">{p.bonusValue}</span>
            <span className="text-white/50 text-[13px] font-semibold">{p.bonusLabel}</span>
            <span className="text-white/40 text-[12px] font-semibold">{p.startsAt} — {p.endsAt}</span>
          </div>
        </div>
      </div>

      {/* CTA bar */}
      {p.status !== 'finished' && (
        <div className="bg-black border border-white/15 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-[14px]">{p.ctaLabel}</p>
            <p className="text-white/40 text-[12px] mt-0.5">{p.status === 'active' ? 'Акция доступна для активации' : 'Акция скоро начнётся'}</p>
          </div>
          <button
            disabled={p.status === 'upcoming'}
            onClick={() => wallet.requireWallet()}
            className="bg-white text-black font-black text-[13px] tracking-[0.2em] rounded-md px-8 py-3.5 hover:bg-white/90 transition-colors flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {p.status === 'active' ? <><Gift size={16} strokeWidth={2.5} /> {p.ctaLabel.toUpperCase()}</> : 'СКОРО'}
          </button>
        </div>
      )}

      {/* Description */}
      <div className="bg-black border border-white/15 rounded-xl p-5">
        <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-3">ОПИСАНИЕ АКЦИИ</h3>
        <p className="text-white/50 text-[13px] leading-relaxed">{p.fullDescription}</p>
      </div>

      {/* Conditions */}
      <div className="bg-black border border-white/15 rounded-xl p-5">
        <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">УСЛОВИЯ УЧАСТИЯ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {conditions.filter((c) => c.value).map((c, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/10 rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
                <c.icon size={15} className="text-white/50" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <span className="text-white/30 text-[10px] font-bold tracking-wider uppercase block">{c.label}</span>
                <span className="text-white/70 text-[13px] font-semibold">{c.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to get */}
      <div className="bg-black border border-white/15 rounded-xl p-5">
        <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">КАК ПОЛУЧИТЬ</h3>
        <div className="flex flex-col gap-3">
          {p.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <span className="text-emerald-400 text-[11px] font-black">{i + 1}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Check size={14} className="text-emerald-400/50 shrink-0" strokeWidth={2.5} />
                <span className="text-white/60 text-[13px] leading-relaxed">{step}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Games */}
      {p.games.length > 0 && (
        <div className="bg-black border border-white/15 rounded-xl p-5">
          <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">ПОДДЕРЖИВАЕМЫЕ ИГРЫ</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {p.games.map((g) => (
              <GameCard key={g.id} name={g.name} accent={g.accent} />
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="bg-black border border-white/15 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle size={18} className="text-white/50" />
          <h3 className="text-white font-black text-[13px] tracking-[0.15em]">ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ</h3>
        </div>
        <div className="flex flex-col">
          {p.faq.map((f, i) => (
            <FaqItem key={i} item={f} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      {p.status === 'active' && (
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-black text-[16px]">Готовы получить бонус?</h3>
            <p className="text-white/40 text-[12px] mt-1">{p.bonusValue} {p.bonusLabel} ждёт вас</p>
          </div>
          <button onClick={() => wallet.requireWallet()} className="bg-white text-black font-black text-[13px] tracking-[0.2em] rounded-md px-8 py-3.5 hover:bg-white/90 transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
            <Gift size={16} strokeWidth={2.5} /> {p.ctaLabel.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Promotions() {
  const wallet = useWallet();
  const [tab, setTab] = useState<'active' | 'upcoming' | 'finished'>('active');
  const [selected, setSelected] = useState<Promo | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(promoTypes[0]);
  const [categoryFilter, setCategoryFilter] = useState(promoCategories[0]);
  const [providerFilter, setProviderFilter] = useState(promoProviders[0]);
  const [sort, setSort] = useState('ending');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = promos.filter((p) => p.status === tab);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q));
    }
    if (typeFilter !== promoTypes[0]) list = list.filter((p) => promoTypeShort[p.type] === typeFilter);
    if (categoryFilter !== promoCategories[0]) list = list.filter((p) => p.category === categoryFilter);
    if (providerFilter !== promoProviders[0]) list = list.filter((p) => p.provider === providerFilter);

    const sorted = [...list];
    switch (sort) {
      case 'ending':
        sorted.sort((a, b) => a.endsAt.localeCompare(b.endsAt));
        break;
      case 'newest':
        sorted.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
        break;
      case 'bonus':
        sorted.sort((a, b) => parseInt(b.bonusValue.replace(/\D/g, ''), 10) - parseInt(a.bonusValue.replace(/\D/g, ''), 10));
        break;
    }
    return sorted;
  }, [tab, search, typeFilter, categoryFilter, providerFilter, sort]);

  const featured = promos.find((p) => p.status === 'active') ?? promos[0];

  if (selected) {
    return (
      <div className="flex justify-center w-full flex-1 px-1 pt-3 pb-6">
        <div className="w-full max-w-[1100px] animate-page-enter">
          <PromoDetail p={selected} onBack={() => setSelected(null)} />
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
                    <span className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Акция недели</span>
                  </div>
                  <h2 className="text-white font-black text-[22px] md:text-[40px] leading-[1.05] tracking-tight">{featured.name}</h2>
                  <p className="text-white/60 text-[12px] md:text-[15px] font-semibold mt-2 hidden sm:block">{featured.shortDescription}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="text-amber-400 font-black text-[18px] md:text-[24px]">{featured.bonusValue}</span>
                    <span className="text-white/50 text-[12px] md:text-[14px] font-bold">{featured.bonusLabel}</span>
                  </div>
                  <div className="flex gap-3 mt-4 md:mt-6">
                    {featured.status === 'active' ? (
                      <button onClick={() => wallet.requireWallet(() => setSelected(featured))} className="bg-white text-black font-black text-[11px] md:text-[12px] tracking-[0.2em] rounded-md px-5 md:px-7 py-2.5 md:py-3.5 hover:bg-white/90 transition-colors">
                        ПОЛУЧИТЬ
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
                placeholder="Поиск акций..."
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black border border-white/15 rounded-xl p-4">
              <label className="block">
                <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Тип акции</span>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-white/40 cursor-pointer">
                  {promoTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Категория игр</span>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-white/40 cursor-pointer">
                  {promoCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Провайдер</span>
                <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-white/40 cursor-pointer">
                  {promoProviders.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Сортировка</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-white/40 cursor-pointer">
                  <option value="ending">Скоро заканчиваются</option>
                  <option value="newest">Самые новые</option>
                  <option value="bonus">Размер бонуса</option>
                </select>
              </label>
            </div>
          )}

          {/* Promo cards */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p, i) => (
                <div key={p.id} className="animate-card-enter" style={{ animationDelay: `${i * 60}ms` }}>
                  <PromoCard p={p} onOpen={() => setSelected(p)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black border border-white/15 rounded-xl p-12 text-center">
              <Gift size={40} className="text-white/15 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-white/40 text-[14px] font-semibold">На данный момент активных акций нет. Следите за обновлениями.</p>
            </div>
          )}
        </div>
    </div>
  );
}
