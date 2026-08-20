import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { gamesData } from '@/game/data';

type SearchResult = {
  id: string;
  name: string;
  provider: string;
  accent: string;
  category: string;
};

export default function SearchModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return gamesData.slice(0, 5);
    return gamesData.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.provider.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      <div
        className="relative w-full max-w-[520px] bg-[#0A0A0A] border border-white/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 animate-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/15">
          <Search size={20} className="text-white/40 shrink-0" strokeWidth={2} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск игр…"
            className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/25 outline-none min-w-0"
          />
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors shrink-0"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-white/40 text-[14px] font-medium">
                Ничего не найдено по запросу «{query}»
              </p>
            </div>
          ) : (
            <>
              {!query.trim() && (
                <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] px-3 pt-2 pb-1">
                  ПОПУЛЯРНЫЕ
                </p>
              )}
              {results.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    onSelect(g.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-left group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${g.accent}22`, border: `1px solid ${g.accent}44` }}
                  >
                    <span className="font-black text-[14px]" style={{ color: g.accent }}>
                      {g.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-[13px] font-bold truncate">{g.name}</p>
                    <p className="text-white/30 text-[11px] truncate">
                      {g.provider} · {g.category}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-white/20 group-hover:text-white/60 transition-colors shrink-0"
                  />
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
