"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

interface InstalledWallet {
  name: string;
  icon: string;
  version: string;
}

export interface DonationMeta {
  teamId: string;
  teamName: string;
  donorNote?: string;
}

interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: number | null;
  walletType: "browser" | "selfcustodial" | null;
  walletName: string | null;
  installedWallets: InstalledWallet[];
  connectBrowserWallet: (name: string) => Promise<void>;
  createWallet: (password: string) => Promise<{ mnemonic: string[]; address: string }>;
  importWallet: (words: string[]) => Promise<void>;
  disconnect: () => void;
  sendDonation: (adaAmount: number, meta: DonationMeta) => Promise<string>;
  refreshBalance: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

const NETWORK_ID = 0; // 0 = testnet (preprod), 1 = mainnet
const STORAGE_KEY = "rfx_selfcustodial_wallet";

function uniqueWallets(wallets: InstalledWallet[]): InstalledWallet[] {
  const seen = new Set<string>();
  return wallets.filter((wallet) => {
    const key = `${wallet.name}:${wallet.version}:${wallet.icon}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// All Koios calls from the browser are proxied through /api/koios to avoid
// CORS issues (Koios sends Access-Control-Allow-Origin only on OPTIONS,
// not on actual POST responses).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeKoiosProvider(KoiosProvider: any): any {
  const base = `${window.location.origin}/api/koios`;
  return new KoiosProvider(base, "");
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [walletType, setWalletType] = useState<"browser" | "selfcustodial" | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [installedWallets, setInstalledWallets] = useState<InstalledWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const browserWalletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meshWalletRef = useRef<any>(null);

  // Detect installed browser wallets and restore self-custodial wallet
  useEffect(() => {
    const init = async () => {
      try {
        const { BrowserWallet, MeshWallet, KoiosProvider } = await import("@meshsdk/core");
        const wallets = BrowserWallet.getInstalledWallets();
        setInstalledWallets(uniqueWallets(wallets));

        // Restore self-custodial wallet from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { mnemonic } = JSON.parse(stored);
          if (mnemonic && Array.isArray(mnemonic)) {
            const provider = makeKoiosProvider(KoiosProvider);
            const wallet = new MeshWallet({
              networkId: NETWORK_ID,
              fetcher: provider,
              submitter: provider,
              key: { type: "mnemonic", words: mnemonic },
            });
            const addr = await wallet.getChangeAddress();
            meshWalletRef.current = wallet;
            setAddress(addr);
            setConnected(true);
            setWalletType("selfcustodial");
            setWalletName("Self-Custodial Wallet");

            // Fetch actual balance in background
            wallet.getBalance().then((assets: Array<{ unit: string; quantity: string }>) => {
              const lovelace = assets.find((a) => a.unit === "lovelace");
              setBalance(lovelace ? parseInt(lovelace.quantity) / 1_000_000 : 0);
            }).catch(() => setBalance(0));
          }
        }
      } catch {
        // Silently fail on init — wallet not critical for page load
      }
    };
    init();
  }, []);

  const connectBrowserWallet = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { BrowserWallet } = await import("@meshsdk/core");
      const wallet = await BrowserWallet.enable(name);

      const usedAddresses = await wallet.getUsedAddresses();
      const unusedAddresses = await wallet.getUnusedAddresses();
      const addr = usedAddresses[0] || unusedAddresses[0] || "";

      const balanceAssets = await wallet.getBalance();
      const lovelaceAsset = balanceAssets.find(
        (b: { unit: string; quantity: string }) => b.unit === "lovelace"
      );
      const ada = lovelaceAsset ? parseInt(lovelaceAsset.quantity) / 1_000_000 : 0;

      browserWalletRef.current = wallet;
      meshWalletRef.current = null;
      setAddress(addr);
      setBalance(ada);
      setConnected(true);
      setWalletType("browser");
      setWalletName(name.charAt(0).toUpperCase() + name.slice(1));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect wallet. Make sure the extension is unlocked."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWallet = useCallback(async (): Promise<{ mnemonic: string[]; address: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const { MeshWallet, KoiosProvider } = await import("@meshsdk/core");
      const mnemonic = MeshWallet.brew() as string[];
      const provider = makeKoiosProvider(KoiosProvider);
      const wallet = new MeshWallet({
        networkId: NETWORK_ID,
        fetcher: provider,
        submitter: provider,
        key: { type: "mnemonic", words: mnemonic },
      });
      const addr = await wallet.getChangeAddress();

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mnemonic, createdAt: Date.now() }));

      browserWalletRef.current = null;
      meshWalletRef.current = wallet;
      setAddress(addr);
      setBalance(null); // will be fetched momentarily — new wallet has 0 anyway
      setConnected(true);
      setWalletType("selfcustodial");
      setWalletName("Self-Custodial Wallet");

      // New wallet starts at 0 — confirm via chain (no-op for new address)
      wallet.getBalance().then((assets: Array<{ unit: string; quantity: string }>) => {
        const lovelace = assets.find((a) => a.unit === "lovelace");
        setBalance(lovelace ? parseInt(lovelace.quantity) / 1_000_000 : 0);
      }).catch(() => setBalance(0));

      return { mnemonic, address: addr };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create wallet";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importWallet = useCallback(async (words: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const { MeshWallet, KoiosProvider } = await import("@meshsdk/core");
      const provider = makeKoiosProvider(KoiosProvider);
      const wallet = new MeshWallet({
        networkId: NETWORK_ID,
        fetcher: provider,
        submitter: provider,
        key: { type: "mnemonic", words },
      });
      const addr = await wallet.getChangeAddress();

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mnemonic: words, createdAt: Date.now() }));

      browserWalletRef.current = null;
      meshWalletRef.current = wallet;
      setAddress(addr);
      setBalance(null);
      setConnected(true);
      setWalletType("selfcustodial");
      setWalletName("Self-Custodial Wallet");

      // Fetch real balance from chain
      wallet.getBalance().then((assets: Array<{ unit: string; quantity: string }>) => {
        const lovelace = assets.find((a) => a.unit === "lovelace");
        setBalance(lovelace ? parseInt(lovelace.quantity) / 1_000_000 : 0);
      }).catch(() => setBalance(0));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid recovery phrase";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    browserWalletRef.current = null;
    meshWalletRef.current = null;
    setAddress(null);
    setBalance(null);
    setConnected(false);
    setWalletType(null);
    setWalletName(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sendDonation = useCallback(
    async (adaAmount: number, meta: DonationMeta): Promise<string> => {
      const activeWallet = browserWalletRef.current || meshWalletRef.current;
      if (!activeWallet) throw new Error("No wallet connected");

      // Use the single platform address from env
      const platformAddress = process.env.NEXT_PUBLIC_DONATION_ADDRESS;
      if (!platformAddress || platformAddress.includes("replacewith")) {
        throw new Error(
          "Platform donation address not configured. Set NEXT_PUBLIC_DONATION_ADDRESS in .env.local"
        );
      }

      const lovelace = String(Math.floor(adaAmount * 1_000_000));

      // Build CIP-20 metadata (label 674) — stored on-chain, readable on Cardanoscan
      // Each string in msg[] must be ≤ 64 bytes
      const msgLines: string[] = [
        "RugbyFundX Donation",
        `Team: ${meta.teamName}`.slice(0, 64),
        `TeamID: ${meta.teamId}`.slice(0, 64),
      ];
      if (meta.donorNote) {
        msgLines.push(meta.donorNote.slice(0, 64));
      }

      const { Transaction } = await import("@meshsdk/core");
      const tx = new Transaction({ initiator: activeWallet });

      // Send ADA to platform address
      tx.sendLovelace(platformAddress, lovelace);

      // Embed CIP-20 metadata — this writes team info permanently on-chain
      tx.setMetadata(674, { msg: msgLines });

      const unsignedTx = await tx.build();
      const signedTx = await activeWallet.signTx(unsignedTx);
      const txHash = await activeWallet.submitTx(signedTx);
      return txHash as string;
    },
    []
  );

  const refreshBalance = useCallback(async () => {
    try {
      if (browserWalletRef.current) {
        const balanceAssets = await browserWalletRef.current.getBalance();
        const lovelaceAsset = balanceAssets.find(
          (b: { unit: string; quantity: string }) => b.unit === "lovelace"
        );
        setBalance(lovelaceAsset ? parseInt(lovelaceAsset.quantity) / 1_000_000 : 0);
      } else if (meshWalletRef.current) {
        const assets: Array<{ unit: string; quantity: string }> = await meshWalletRef.current.getBalance();
        const lovelace = assets.find((a) => a.unit === "lovelace");
        setBalance(lovelace ? parseInt(lovelace.quantity) / 1_000_000 : 0);
      }
    } catch {
      // ignore refresh errors
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        balance,
        walletType,
        walletName,
        installedWallets,
        connectBrowserWallet,
        createWallet,
        importWallet,
        disconnect,
        sendDonation,
        refreshBalance,
        isLoading,
        error,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext must be used within WalletProvider");
  return ctx;
}
