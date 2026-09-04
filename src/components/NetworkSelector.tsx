import { useState, useRef, useEffect } from 'react';
import { ChevronDown, FlaskConical, Rocket } from 'lucide-react';
import { useNetwork } from '@/lib/network-context';
import { NETWORK_SELECTOR_ENABLED, NETWORK_LABELS, type SolNetwork } from '@/lib/solana-bet';

const NETWORK_ICONS: Record<SolNetwork, typeof FlaskConical> = {
  devnet: FlaskConical,
  testnet: FlaskConical,
  mainnet: Rocket,
};

const NETWORK_DOT_COLORS: Record<SolNetwork, string> = {
  devnet: 'bg-amber-400',
  testnet: 'bg-sky-400',
  mainnet: 'bg-emerald-400',
};

export default function NetworkSelector() {
  const { network, setNetwork } = useNetwork();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!NETWORK_SELECTOR_ENABLED) {
    // In production without the flag, show a static mainnet badge only
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-emerald-400 text-[10px] font-bold tracking-wider uppercase">Mainnet</span>
      </div>
    );
  }

  const options: SolNetwork[] = ['devnet', 'testnet', 'mainnet'];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${NETWORK_DOT_COLORS[network]}`} />
        <span className="text-white/80 text-[10px] font-bold tracking-wider uppercase">{NETWORK_LABELS[network]}</span>
        <ChevronDown size={12} className="text-white/40" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-44 bg-[#0a0a0a] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          {options.map((n) => {
            const OptIcon = NETWORK_ICONS[n];
            return (
              <button
                key={n}
                onClick={() => { setNetwork(n); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  network === n ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <OptIcon size={14} className={network === n ? NETWORK_DOT_COLORS[n].replace('bg-', 'text-') : 'text-white/40'} />
                <span className={`text-[12px] font-bold ${network === n ? 'text-white' : 'text-white/50'}`}>
                  {NETWORK_LABELS[n]}
                </span>
                {network === n && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </button>
            );
          })}
          <div className="px-3 py-2 border-t border-white/10">
            <p className="text-white/30 text-[9px] leading-relaxed">
              Тестовые сети используют ненастоящие SOL. Не отправляйте реальные средства на devnet/testnet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
