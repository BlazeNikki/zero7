import { useState, useEffect } from 'react';
import { Globe, Check, X } from 'lucide-react';

const languages = [
  { code: 'RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
] as const;

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<typeof languages[number]['code']>('RU');

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open]);

  const currentLang = languages.find((l) => l.code === current)!;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 text-white/40 hover:text-white transition-colors ${compact ? 'text-[12px]' : 'text-[13px]'}`}
      >
        <Globe size={compact ? 16 : 18} strokeWidth={2} />
        <span className="font-bold tracking-widest tabular-nums">{currentLang.code}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/15 rounded-2xl overflow-hidden shadow-2xl shadow-black/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Globe size={18} strokeWidth={2} className="text-white/60" />
                <h3 className="text-white font-black text-[14px] tracking-[0.2em]">ВЫБОР ЯЗЫКА</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white transition-colors"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Language list */}
            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setCurrent(lang.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all ${
                    current === lang.code
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-2xl leading-none">{lang.flag}</span>
                  <span className="flex-1 text-left">
                    <span className="block font-bold text-[14px]">{lang.label}</span>
                    <span className="block text-[10px] text-white/30 tracking-widest font-bold mt-0.5">{lang.code}</span>
                  </span>
                  {current === lang.code && (
                    <Check size={18} strokeWidth={2.5} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
