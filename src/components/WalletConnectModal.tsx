import { useState, useEffect } from 'react';
import { X, Wallet } from 'lucide-react';
import { useWallet } from '@/lib/wallet';

const SOLFLARE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#FF6A00"/>
    <path d="M12 5L14 12L12 19L10 12Z" fill="#fff"/>
    <path d="M5 12L12 10L19 12L12 14Z" fill="#fff"/>
  </svg>
);

const PHANTOM_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

export default function WalletConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const wallet = useWallet();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  useEffect(() => {
    if (open && wallet.isConnected) onClose();
  }, [open, wallet.isConnected, onClose]);

  if (!open) return null;

  const handleConnect = async (provider: 'solflare' | 'phantom') => {
    setConnecting(true);
    await wallet.connectWith(provider);
    setConnecting(false);
    onClose();
  };

  const isMobile = /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent) || window.innerWidth < 768;
  const inSolflare = /solflare/i.test(navigator.userAgent) || !!window.solflare?.isSolflare;
  const solflareSubtitle = isMobile && !inSolflare ? 'Откроется в приложении Solflare' : 'Расширение браузера';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-page-enter"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.8)] animate-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-black text-lg tracking-wide">Подключить кошелёк</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleConnect('solflare')}
            disabled={connecting}
            className="flex items-center gap-3 w-full px-4 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all text-left disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
              {SOLFLARE_ICON}
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">Solflare</span>
              <span className="text-white/40 text-xs mt-0.5">{solflareSubtitle}</span>
            </div>
          </button>

          <button
            onClick={() => handleConnect('phantom')}
            disabled={connecting}
            className="flex items-center gap-3 w-full px-4 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all text-left disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
              {PHANTOM_ICON}
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">Phantom</span>
              <span className="text-white/40 text-xs mt-0.5">Скоро будет доступно</span>
            </div>
          </button>
        </div>

        <p className="text-white/30 text-[11px] text-center mt-5 leading-relaxed">
          Подключая кошелёк, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
}
