import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getOrCreateDirectusUser, type DirectusUser } from './directus';
import { setAuthToken, getAuthToken, clearAuthToken } from './auth';

type WalletProviderType = 'solflare' | 'phantom';

type WalletState = {
  isConnected: boolean;
  isConnecting: boolean;
  isAuthed: boolean;
  isSigning: boolean;
  address: string | null;
  displayAddress: string | null;
  balance: string;
  balanceUsd: string;
  chain: 'solana' | 'ethereum';
  directusUser: DirectusUser | null;
  connect: () => Promise<void>;
  connectWith: (provider: WalletProviderType) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  requireWallet: (action?: () => void) => boolean;
};

const WalletContext = createContext<WalletState>({
  isConnected: false,
  isConnecting: false,
  isAuthed: false,
  isSigning: false,
  address: null,
  displayAddress: null,
  balance: '0.00',
  balanceUsd: '',
  chain: 'solana',
  directusUser: null,
  connect: async () => {},
  connectWith: async () => {},
  disconnect: async () => {},
  refreshBalance: async () => {},
  requireWallet: () => false,
});

export function useWallet() {
  return useContext(WalletContext);
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://arfnwjuxqidefuxgbzyw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZm53anV4cWlkZWZ1eGdienl3Iiwicm9sIjoiYW5vbiIsImlhdCI6MTc4NjUyODA1OCwiZXhwIjoyMTAyMTA0MDU4fQ.ceVL34t3fk7dU-FQVMYHG8xobknNy2sNU9Kp-oRCfDU';
const AUTH_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/auth-wallet`;
const SOL_RPC_PROXY = `${SUPABASE_URL}/functions/v1/solana-rpc`;
const SOL_CONNECTION = new Connection(SOL_RPC_PROXY, { httpHeaders: { apikey: SUPABASE_ANON_KEY }, fetch: window.fetch.bind(window) });

function shortenAddress(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function isInsideSolflareBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /solflare/i.test(navigator.userAgent) || !!window.solflare?.isSolflare;
}

const SOLFLARE_CONNECT_KEY = 'solflare_pending_connect';

function openInSolflareBrowser(): void {
  try { sessionStorage.setItem(SOLFLARE_CONNECT_KEY, '1'); } catch { /* ignore */ }
  const url = new URL(window.location.href);
  url.searchParams.set('solflare_connect', '1');
  const currentUrl = url.toString();
  const ref = window.location.origin;
  const browseUrl = `https://solflare.com/ul/v1/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(ref)}`;
  window.location.href = browseUrl;
}

function shouldAutoConnect(): boolean {
  if (hasSolflareConnectParam()) return true;
  try { return sessionStorage.getItem(SOLFLARE_CONNECT_KEY) === '1'; } catch { return false; }
}

function clearAutoConnectFlag(): void {
  try { sessionStorage.removeItem(SOLFLARE_CONNECT_KEY); } catch { /* ignore */ }
  if (hasSolflareConnectParam()) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('solflare_connect');
      window.history.replaceState({}, '', url.toString());
    } catch { /* ignore */ }
  }
}

function getSolflareProvider(): SolflareProvider | null {
  if (window.solflare?.isSolflare || (window.solflare && typeof window.solflare.connect === 'function')) {
    return window.solflare;
  }
  const solanaWin = window as unknown as { solana?: SolflareProvider & { isSolflare?: boolean } };
  if (solanaWin.solana?.isSolflare) {
    return solanaWin.solana;
  }
  return null;
}

function hasSolflareConnectParam(): boolean {
  try {
    return new URL(window.location.href).searchParams.get('solflare_connect') === '1';
  } catch {
    return false;
  }
}

type ModalListener = () => void;
const modalListeners = new Set<ModalListener>();

export function openWalletModal() {
  modalListeners.forEach((l) => l());
}

type SolflareProvider = {
  isSolflare?: boolean;
  publicKey: { toString(): string } | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signAndSendTransaction?: (tx: unknown) => Promise<{ signature: string }>;
  signTransaction?: (tx: unknown) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    solflare?: SolflareProvider;
    solana?: SolflareProvider & { isSolflare?: boolean };
    phantom?: {
      solana?: SolflareProvider;
      ethereum?: unknown;
    };
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chain, setChain] = useState<'solana' | 'ethereum'>('solana');
  const [balance, setBalance] = useState('0.00');
  const [balanceUsd, setBalanceUsd] = useState('');
  const [directusUser, setDirectusUser] = useState<DirectusUser | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const fetchBalance = useCallback(async (addr: string) => {
    try {
      const lamports = await SOL_CONNECTION.getBalance(new PublicKey(addr));
      const sol = lamports / 1e9;
      setBalance(sol.toFixed(4));
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await res.json();
        const usd = sol * (data?.solana?.usd ?? 0);
        setBalanceUsd(`${usd.toFixed(2)}`);
      } catch {
        setBalanceUsd('');
      }
    } catch {
      setBalance('0.00');
      setBalanceUsd('');
    }
  }, []);

  const authenticateWithServer = useCallback(async (addr: string, provider: 'solflare' | 'phantom'): Promise<boolean> => {
    try {
      const challengeRes = await fetch(`${AUTH_FUNCTION_URL}?action=challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ walletAddress: addr }),
      });
      if (!challengeRes.ok) return false;
      const { nonce } = await challengeRes.json();

      const message = `Sign this message to authenticate with NRG Casino. Nonce: ${nonce}`;
      setIsSigning(true);

      const wallet = provider === 'solflare' ? getSolflareProvider() : window.phantom?.solana;
      let signature: string | null = null;

      if (wallet) {
        const messageBytes = new TextEncoder().encode(message);
        const result = await wallet.signMessage(messageBytes);
        signature = result?.signature
          ? Array.from(result.signature).map((b: number) => b.toString(16).padStart(2, '0')).join('')
          : null;
      }

      setIsSigning(false);

      if (!signature) return false;

      const verifyRes = await fetch(`${AUTH_FUNCTION_URL}?action=verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ walletAddress: addr, signature, chain: 'solana' }),
      });
      if (!verifyRes.ok) return false;

      const verifyData = await verifyRes.json();
      if (!verifyData.authenticated || !verifyData.accessToken) return false;

      setAuthToken(verifyData.accessToken);
      return true;
    } catch {
      setIsSigning(false);
      return false;
    }
  }, []);

  const syncDirectus = useCallback(async (addr: string) => {
    try {
      const user = await getOrCreateDirectusUser(addr, 'solana');
      setDirectusUser(user);
    } catch {
      // Directus sync is secondary to auth
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (address) await fetchBalance(address);
  }, [address, fetchBalance]);

  const connectWith = useCallback(async (provider: WalletProviderType) => {
    const wallet = provider === 'solflare' ? getSolflareProvider() : window.phantom?.solana;

    // Mobile + Solflare: if the injected provider isn't available, open the site
    // inside Solflare's in-app browser via the browse deep link. There, window.solflare
    // is injected and the regular connect flow works.
    if (!wallet && provider === 'solflare' && isMobileDevice() && !isInsideSolflareBrowser()) {
      openInSolflareBrowser();
      return;
    }

    if (!wallet) {
      if (provider === 'solflare' && isMobileDevice()) {
        openInSolflareBrowser();
        return;
      }
      const url = provider === 'solflare'
        ? 'https://solflare.com/download'
        : 'https://phantom.app/download';
      window.open(url, '_blank');
      return;
    }

    try {
      setIsConnecting(true);
      await wallet.connect();
      if (wallet.publicKey) {
        const addr = wallet.publicKey.toString();
        setAddress(addr);
        setChain('solana');
        setIsConnected(true);
        await fetchBalance(addr);

        const authed = await authenticateWithServer(addr, provider);
        setIsAuthed(authed);

        if (authed) {
          await syncDirectus(addr);
        }
      }
    } catch {
      setIsSigning(false);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance, authenticateWithServer, syncDirectus]);

  const connect = useCallback(async () => {
    await connectWith('solflare');
  }, [connectWith]);

  const disconnect = useCallback(async () => {
    try {
      const sf = getSolflareProvider();
      const ph = window.phantom?.solana;
      const wallet = sf?.isConnected ? sf : ph?.isConnected ? ph : null;
      if (wallet) await wallet.disconnect();
    } catch {
      // ignore
    }
    setIsConnected(false);
    setIsAuthed(false);
    setAddress(null);
    setDirectusUser(null);
    setBalance('0.00');
    setBalanceUsd('');
    clearAuthToken();
  }, []);

  // Auto-detect already-connected wallet on mount + listen for disconnect
  useEffect(() => {
    let autoConnectDone = false;

    const doConnect = async (sf: SolflareProvider) => {
      if (autoConnectDone) return;
      autoConnectDone = true;
      try {
        setIsConnecting(true);
        if (!sf.isConnected) {
          await sf.connect();
        }
        if (sf.publicKey) {
          const addr = sf.publicKey.toString();
          setAddress(addr);
          setChain('solana');
          setIsConnected(true);
          await fetchBalance(addr);

          const existingToken = getAuthToken();
          if (existingToken) {
            setIsAuthed(true);
            await syncDirectus(addr);
          } else {
            const authed = await authenticateWithServer(addr, 'solflare');
            setIsAuthed(authed);
            if (authed) await syncDirectus(addr);
          }
        }
      } catch {
        // ignore
      } finally {
        setIsConnecting(false);
        clearAutoConnectFlag();
      }
    };

    const checkExisting = async () => {
      const sf = getSolflareProvider();
      if (sf?.isConnected && sf?.publicKey) {
        const addr = sf.publicKey.toString();
        setAddress(addr);
        setChain('solana');
        setIsConnected(true);
        await fetchBalance(addr);

        const existingToken = getAuthToken();
        if (existingToken) {
          setIsAuthed(true);
          await syncDirectus(addr);
        } else {
          const authed = await authenticateWithServer(addr, 'solflare');
          setIsAuthed(authed);
          if (authed) await syncDirectus(addr);
        }
      }
    };
    const timer = setTimeout(checkExisting, 500);

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsAuthed(false);
      setAddress(null);
      setDirectusUser(null);
      setBalance('0.00');
      setBalanceUsd('');
      clearAuthToken();
    };

    const handleAccountChanged = (...args: unknown[]) => {
      const newKey = args[0] as { toString(): string } | null;
      if (!newKey) {
        handleDisconnect();
      } else {
        const addr = newKey.toString();
        setAddress(addr);
        fetchBalance(addr);
      }
    };

    const sfProvider = getSolflareProvider();
    sfProvider?.on?.('disconnect', handleDisconnect);
    sfProvider?.on?.('accountChanged', handleAccountChanged);

    // Auto-connect: if we were redirected from Solflare's deep link, poll for
    // the provider to be injected and then automatically initiate connect().
    let pollAttempts = 0;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    const wantsAutoConnect = shouldAutoConnect();
    if (wantsAutoConnect) {
      if (sfProvider) {
        doConnect(sfProvider);
      } else {
        pollTimer = setInterval(() => {
          pollAttempts++;
          const polled = getSolflareProvider();
          if (polled) {
            clearInterval(pollTimer);
            polled.on?.('disconnect', handleDisconnect);
            polled.on?.('accountChanged', handleAccountChanged);
            doConnect(polled);
          } else if (pollAttempts > 40) {
            clearInterval(pollTimer);
            clearAutoConnectFlag();
          }
        }, 250);
      }
    }

    return () => {
      clearTimeout(timer);
      if (pollTimer) clearInterval(pollTimer);
      const sf = getSolflareProvider();
      sf?.removeListener?.('disconnect', handleDisconnect);
      sf?.removeListener?.('accountChanged', handleAccountChanged);
    };
  }, [fetchBalance, authenticateWithServer, syncDirectus]);

  // Refresh balance every 15 seconds when connected
  useEffect(() => {
    if (!isConnected || !address) return;
    const interval = setInterval(() => refreshBalance(), 15000);
    return () => clearInterval(interval);
  }, [isConnected, address, refreshBalance]);

  // Wallet modal trigger listener
  useEffect(() => {
    const listener: ModalListener = () => setWalletModalOpen(true);
    modalListeners.add(listener);
    return () => { modalListeners.delete(listener); };
  }, []);

  const requireWallet = useCallback((action?: () => void): boolean => {
    if (isConnected && isAuthed) {
      if (action) action();
      return true;
    }
    setGateOpen(true);
    return false;
  }, [isConnected, isAuthed]);

  const value: WalletState = {
    isConnected,
    isConnecting,
    isAuthed,
    isSigning,
    address,
    displayAddress: address ? shortenAddress(address) : null,
    balance,
    balanceUsd,
    chain,
    directusUser,
    connect,
    connectWith,
    disconnect,
    refreshBalance,
    requireWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      {gateOpen && <GateOverlay onClose={() => setGateOpen(false)} onConnect={() => { setGateOpen(false); setWalletModalOpen(true); }} />}
      {walletModalOpen && <WalletModalInline onClose={() => setWalletModalOpen(false)} />}
    </WalletContext.Provider>
  );
}

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

function WalletModalInline({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const wallet = useWallet();
  useEffect(() => {
    if (wallet.isConnected && wallet.isAuthed) onClose();
  }, [wallet.isConnected, wallet.isAuthed, onClose]);

  const solflareSubtitle = isMobileDevice() && !isInsideSolflareBrowser()
    ? 'Откроется в приложении Solflare'
    : 'Расширение браузера';

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-[380px] bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.8)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-black text-lg tracking-wide">Подключить кошелёк</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {wallet.isSigning && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
            <p className="text-amber-400 font-bold text-sm">Подтвердите подпись в кошельке</p>
            <p className="text-white/40 text-xs mt-1">Это необходимо для авторизации</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => wallet.connectWith('solflare')}
            disabled={wallet.isConnecting || wallet.isSigning}
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
            onClick={() => wallet.connectWith('phantom')}
            disabled={wallet.isConnecting || wallet.isSigning}
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

function GateOverlay({ onClose, onConnect }: { onClose: () => void; onConnect: () => void }) {
  const wallet = useWallet();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (wallet.isConnected && wallet.isAuthed) onClose();
  }, [wallet.isConnected, wallet.isAuthed, onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-black text-lg tracking-wide">Подключите кошелёк</h2>
            <p className="text-white/50 text-sm mt-2 leading-relaxed">
              Для выполнения этого действия необходимо подключить криптокошелёк и подписать сообщение для авторизации.
            </p>
          </div>
          <button
            onClick={onConnect}
            className="w-full bg-white text-black font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 hover:bg-white/90 transition-colors"
          >
            ПОДКЛЮЧИТЬ КОШЕЛЁК
          </button>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white text-[12px] font-bold tracking-wide transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
