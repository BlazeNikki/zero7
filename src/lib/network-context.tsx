import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchNetworkConfig, type SolNetwork } from './solana-bet';

type NetworkContextValue = {
  network: SolNetwork;
  setNetwork: (n: SolNetwork) => void;
  treasuryWallet: string | null;
  rpcUrl: string | null;
  minBet: number;
  maxBet: number;
  loading: boolean;
};

const NetworkContext = createContext<NetworkContextValue>({
  network: 'devnet',
  setNetwork: () => {},
  treasuryWallet: null,
  rpcUrl: null,
  minBet: 0.001,
  maxBet: 1,
  loading: true,
});

export function useNetwork() {
  return useContext(NetworkContext);
}

const STORAGE_KEY = 'nrg_network';

function getInitialNetwork(): SolNetwork {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'devnet' || stored === 'testnet' || stored === 'mainnet') {
      return stored;
    }
  } catch { /* ignore */ }
  // Default to devnet for testing; switch to mainnet for production
  return 'devnet';
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<SolNetwork>(getInitialNetwork);
  const [treasuryWallet, setTreasuryWallet] = useState<string | null>(null);
  const [rpcUrl, setRpcUrl] = useState<string | null>(null);
  const [minBet, setMinBet] = useState(0.001);
  const [maxBet, setMaxBet] = useState(1);
  const [loading, setLoading] = useState(true);

  const setNetwork = useCallback((n: SolNetwork) => {
    setNetworkState(n);
    try { localStorage.setItem(STORAGE_KEY, n); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNetworkConfig(network)
      .then((config) => {
        if (cancelled) return;
        setTreasuryWallet(config.treasuryWallet);
        setRpcUrl(config.rpcUrl);
        setMinBet(config.minBet);
        setMaxBet(config.maxBet);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [network]);

  return (
    <NetworkContext.Provider value={{
      network,
      setNetwork,
      treasuryWallet,
      rpcUrl,
      minBet,
      maxBet,
      loading,
    }}>
      {children}
    </NetworkContext.Provider>
  );
}
