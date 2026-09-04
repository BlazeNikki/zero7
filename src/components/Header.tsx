import { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, Menu, X, Wallet } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import NetworkSelector from './NetworkSelector';
import SearchModal from './SearchModal';
import { useWallet, openWalletModal } from '@/lib/wallet';

export type View = 'home' | 'cabinet' | 'tournaments' | 'promotions' | 'support' | 'game' | 'crash' | 'mines' | 'plinko';

const navItems = ['КАЗИНО', 'LIVE КАЗИНО', 'СПОРТ', 'АКЦИИ', 'ТУРНИРЫ', 'ПОДДЕРЖКА'] as const;

const itemToView: Record<string, View> = {
  'АКЦИИ': 'promotions',
  'ТУРНИРЫ': 'tournaments',
  'ПОДДЕРЖКА': 'support',
};

export default function Header({
  onHome,
  onOpenCabinet,
  onOpenTournaments,
  onOpenPromotions,
  onOpenSupport,
  onOpenGame,
  activeView = 'home',
}: {
  onHome: () => void;
  onOpenCabinet: () => void;
  onOpenTournaments: () => void;
  onOpenPromotions: () => void;
  onOpenSupport: () => void;
  onOpenGame: (id: string) => void;
  activeView?: View;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [menuOpen]);

  const handleClick = (item: string) => {
    if (item === 'КАЗИНО') onHome();
    else if (item === 'ТУРНИРЫ') onOpenTournaments();
    else if (item === 'АКЦИИ') onOpenPromotions();
    else if (item === 'ПОДДЕРЖКА') onOpenSupport();
  };

  const balanceLabel = wallet.isConnected
    ? `${wallet.balance} ${wallet.chain === 'solana' ? 'SOL' : 'ETH'}`
    : '0.00';

  return (
    <div className="pt-3 shrink-0">
      <header className="h-[64px] bg-black border border-white/20 rounded-2xl flex items-center px-4 md:px-6 shadow-[0_8px_40px_rgba(0,0,0,0.8)]">
        {/* Logo */}
        <button onClick={onHome} className="shrink-0 md:mr-10 hover:opacity-80 transition-opacity">
          <span className="text-white font-black text-xl tracking-[0.18em]">ZERO7</span>
        </button>

        {/* Mobile search — left of burger */}
        <button onClick={() => setSearchOpen(true)} className="md:hidden text-white/40 ml-auto p-1 hover:text-white transition-colors">
          <Search size={18} strokeWidth={2} />
        </button>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-7 flex-1">
          {navItems.map((item) => {
            const view = itemToView[item];
            const isActive = view ? view === activeView : (item === 'КАЗИНО' && activeView === 'home');
            return (
              <button
                key={item}
                onClick={() => handleClick(item)}
                className={`relative pb-[20px] pt-[20px] text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-white/30 hover:text-white/70'
                }`}
              >
                {item}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <NetworkSelector />
          <LanguageSwitcher />
          <button onClick={() => setSearchOpen(true)} className="text-white/30 hover:text-white transition-colors">
            <Search size={19} strokeWidth={2} />
          </button>
          <button className="text-white/30 hover:text-white transition-colors">
            <Bell size={19} strokeWidth={2} />
          </button>

          {wallet.isConnected && (
            <button onClick={onOpenCabinet} className="flex items-center gap-2.5 pl-4 ml-1 border-l border-white/15 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <User size={15} className="text-white/60" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-white text-[12px] font-bold leading-none tracking-widest">
                  {wallet.displayAddress}
                </span>
                <span className="text-[9px] text-white/40 font-bold tracking-[0.2em] border border-white/15 rounded-[3px] px-1.5 py-[3px] leading-none">
                  {wallet.chain === 'solana' ? 'SOL' : 'ETH'}
                </span>
              </div>
            </button>
          )}

          {wallet.isConnected ? (
            <div className="flex items-center gap-2 pl-4 border-l border-white/15 cursor-pointer group" onClick={() => wallet.refreshBalance()}>
              <Wallet size={14} className="text-emerald-400" strokeWidth={2} />
              <div className="flex flex-col items-start">
                <span className="text-white font-bold text-[13px] tabular-nums tracking-tight leading-none">{balanceLabel}</span>
                {wallet.balanceUsd && <span className="text-white/30 text-[9px] tabular-nums leading-none mt-0.5">{wallet.balanceUsd}</span>}
              </div>
              <ChevronDown size={14} className="text-white/30 group-hover:text-white transition-colors" />
            </div>
          ) : (
            <button
              onClick={openWalletModal}
              disabled={wallet.isConnecting}
              className="flex items-center gap-2 pl-4 border-l border-white/15 text-white hover:opacity-80 transition-opacity"
            >
              <Wallet size={16} className="text-white/60" strokeWidth={2} />
              <span className="text-[12px] font-bold tracking-widest">
                {wallet.isConnecting ? 'ПОДКЛЮЧЕНИЕ…' : 'ПОДКЛЮЧИТЬ КОШЕЛЁК'}
              </span>
            </button>
          )}
        </div>

        {/* Mobile menu button — rightmost */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white ml-3 p-1"
        >
          {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </header>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <nav className="md:hidden mt-2 bg-black border border-white/20 rounded-2xl p-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const view = itemToView[item];
            const isActive = view ? view === activeView : (item === 'КАЗИНО' && activeView === 'home');
            return (
              <button
                key={item}
                onClick={() => { setMenuOpen(false); handleClick(item); }}
                className={`text-[14px] font-bold tracking-widest py-3 px-3 rounded-lg transition-colors text-left ${
                  isActive ? 'text-white bg-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {item}
              </button>
            );
          })}
          {wallet.isConnected && (
            <button onClick={() => { setMenuOpen(false); onOpenCabinet(); }} className="flex items-center gap-3 mt-3 pt-3 border-t border-white/15 w-full hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <User size={16} className="text-white/60" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-white text-[13px] font-bold leading-none tracking-widest">
                  {wallet.displayAddress}
                </span>
                <span className="text-[9px] text-white/40 font-bold tracking-[0.2em] border border-white/15 rounded-[3px] px-1.5 py-[3px] leading-none">
                  {wallet.chain === 'solana' ? 'SOL' : 'ETH'}
                </span>
              </div>
            </button>
          )}

          <div className="mt-3 pt-3 border-t border-white/15">
            {wallet.isConnected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-emerald-400" strokeWidth={2} />
                  <span className="text-white font-bold text-[14px] tabular-nums tracking-tight">{balanceLabel}</span>
                  {wallet.balanceUsd && <span className="text-white/30 text-[10px] tabular-nums">{wallet.balanceUsd}</span>}
                </div>
                <button onClick={() => wallet.disconnect()} className="text-white/40 hover:text-white text-[11px] font-bold tracking-wide transition-colors">
                  ОТКЛЮЧИТЬ
                </button>
              </div>
            ) : (
              <button
                onClick={openWalletModal}
                disabled={wallet.isConnecting}
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold text-[12px] tracking-widest rounded-lg py-3 transition-opacity hover:opacity-90"
              >
                <Wallet size={16} strokeWidth={2} />
                {wallet.isConnecting ? 'ПОДКЛЮЧЕНИЕ…' : 'ПОДКЛЮЧИТЬ КОШЕЛЁК'}
              </button>
            )}
            <div className="mt-3 pt-3 border-t border-white/15">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={onOpenGame} />
    </div>
  );
}
