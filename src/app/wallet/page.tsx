"use client";

import { useState, useCallback, useEffect } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";
import { useWalletContext } from "@/context/WalletContext";
import { WalletModal } from "@/components/WalletModal";
import { encryptSeedPhrase, downloadBackupFile } from "@/lib/walletCrypto";
import { getNetworkLabel } from "@/lib/cardanoExplorer";

const STORAGE_KEY = "rfx_selfcustodial_wallet";
const BACKUP_KEY = "rfx_wallet_backed_up";

export default function WalletPage() {
  const {
    connected,
    address,
    balance,
    walletName,
    walletType,
    disconnect,
    refreshBalance,
  } = useWalletContext();

  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "receive" | "backup">("overview");

  // Backup state
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [backedUp, setBackedUp] = useState(false);
  const [backupPassword, setBackupPassword] = useState("");
  const [backupPasswordConfirm, setBackupPasswordConfirm] = useState("");
  const [backupDownloading, setBackupDownloading] = useState(false);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [backupError, setBackupError] = useState("");

  useEffect(() => {
    if (walletType === "selfcustodial") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { mnemonic } = JSON.parse(stored);
        if (Array.isArray(mnemonic)) setSeedPhrase(mnemonic);
      }
      setBackedUp(localStorage.getItem(BACKUP_KEY) === "true");
    }
  }, [walletType]);

  const handleRefreshBalance = useCallback(async () => {
    setRefreshingBalance(true);
    await refreshBalance();
    setRefreshingBalance(false);
  }, [refreshBalance]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmBackup = () => {
    localStorage.setItem(BACKUP_KEY, "true");
    setBackedUp(true);
  };

  const handleDownloadBackup = async () => {
    setBackupError("");
    if (backupPassword.length < 8) {
      setBackupError("Password must be at least 8 characters");
      return;
    }
    if (backupPassword !== backupPasswordConfirm) {
      setBackupError("Passwords do not match");
      return;
    }
    if (!seedPhrase.length || !address) return;
    setBackupDownloading(true);
    try {
      const backup = await encryptSeedPhrase(seedPhrase, backupPassword);
      downloadBackupFile(backup, address);
      setBackupDownloaded(true);
      setBackupPassword("");
      setBackupPasswordConfirm("");
    } catch {
      setBackupError("Failed to encrypt backup. Try again.");
    } finally {
      setBackupDownloading(false);
    }
  };

  return (
    <main>
      <section className="bg-gradient-to-br from-[#065f46] to-[#10b981] text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">My Wallet</h1>
          <p className="text-green-100 text-lg">
            Manage your Cardano wallet and donate to Kenyan rugby teams
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {connected ? (
          <div className="space-y-6">

            {/* Backup warning banner */}
            {walletType === "selfcustodial" && !backedUp && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-2xl shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-900">Back up your wallet</p>
                  <p className="text-sm text-amber-800 mt-0.5">
                    Your wallet is saved in this browser only. If you clear browser data or switch devices, you will lose access permanently unless you save your recovery phrase.
                  </p>
                  <button
                    onClick={() => setActiveTab("backup")}
                    className="mt-2 text-sm font-semibold text-amber-700 hover:underline"
                  >
                    Save recovery phrase →
                  </button>
                </div>
              </div>
            )}

            {/* Wallet card */}
            <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#065f46] to-[#10b981] rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">₳</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{walletName}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-700 font-medium">Connected · {getNetworkLabel()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {walletType === "selfcustodial" && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                      Self-Custodial
                    </span>
                  )}
                  {walletType === "selfcustodial" && backedUp && (
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                      ✓ Backed up
                    </span>
                  )}
                </div>
              </div>

              {/* Balance */}
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">Balance</p>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={refreshingBalance}
                    className="text-xs text-[#065f46] hover:underline disabled:opacity-50 font-medium"
                  >
                    {refreshingBalance ? "Refreshing..." : "↻ Refresh"}
                  </button>
                </div>
                {balance === null ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-200 border-t-[#065f46] rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Fetching balance...</p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-[#065f46]">
                    {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ADA
                  </p>
                )}
              </div>

              {walletType === "selfcustodial" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-amber-800 mb-1">Get Testnet ADA</p>
                  <p className="text-xs text-amber-700 mb-2">
                    This wallet is on Cardano {getNetworkLabel()}. Get free test ADA from the faucet:
                  </p>
                  <a
                    href="https://docs.cardano.org/cardano-testnets/tools/faucet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-700 font-semibold hover:underline"
                  >
                    Cardano Testnet Faucet →
                  </a>
                </div>
              )}

              <button
                onClick={disconnect}
                className="w-full py-2.5 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition text-sm font-medium"
              >
                Disconnect Wallet
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
              {(["overview", "receive", ...(walletType === "selfcustodial" ? ["backup"] : [])] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    activeTab === tab
                      ? "bg-white text-[#065f46] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "backup" && !backedUp ? (
                    <span className="flex items-center gap-1">Backup <span className="w-2 h-2 bg-amber-400 rounded-full inline-block" /></span>
                  ) : tab}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                  <p className="font-mono text-sm text-gray-800 break-all mb-2">{address}</p>
                  <button onClick={copyAddress} className="text-xs text-[#065f46] font-medium hover:underline">
                    {copied ? "✓ Copied!" : "Copy address"}
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("receive")}
                    className="bg-white rounded-2xl border-2 border-green-100 p-5 hover:border-[#065f46] transition group shadow-sm text-left"
                  >
                    <div className="text-3xl mb-3">📥</div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#065f46] transition">Receive ADA</h3>
                    <p className="text-sm text-gray-500 mt-1">Show QR code for your address</p>
                  </button>
                  <Link
                    href="/teams"
                    className="bg-white rounded-2xl border-2 border-green-100 p-5 hover:border-[#065f46] transition group shadow-sm block"
                  >
                    <div className="text-3xl mb-3">🏉</div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#065f46] transition">Donate to a Team</h3>
                    <p className="text-sm text-gray-500 mt-1">Browse all teams and send ADA</p>
                  </Link>
                </div>

                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">How donations work</h3>
                  <ol className="space-y-3">
                    {[
                      "Select a team and click Donate ADA",
                      "Enter the amount you want to send",
                      "Confirm the transaction in your wallet",
                      "Your donation is recorded on the Cardano blockchain",
                      "Funds are released to teams when milestones are completed",
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-[#065f46] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Receive tab */}
            {activeTab === "receive" && (
              <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-lg mb-1">Receive ADA</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Scan this QR code with any Cardano wallet to send ADA to this address.
                </p>

                {address && (
                  <div className="flex flex-col items-center gap-5">
                    <div className="p-4 bg-white border-2 border-green-100 rounded-2xl shadow-sm">
                      <QRCode
                        value={address}
                        size={200}
                        fgColor="#065f46"
                        bgColor="#ffffff"
                        level="M"
                      />
                    </div>

                    <div className="w-full bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Your address</p>
                      <p className="font-mono text-xs text-gray-800 break-all">{address}</p>
                    </div>

                    <button
                      onClick={copyAddress}
                      className="w-full py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition"
                    >
                      {copied ? "✓ Address Copied!" : "Copy Address"}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      This wallet is on Cardano {getNetworkLabel()} — only testnet ADA can be received here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Backup tab (self-custodial only) */}
            {activeTab === "backup" && walletType === "selfcustodial" && (
              <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-lg mb-1">Recovery Phrase</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Your 24-word recovery phrase is the only way to restore your wallet on a new device or browser. Write it down and keep it somewhere safe — never share it with anyone.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-red-800 mb-1">Never share this phrase</p>
                  <p className="text-xs text-red-700">
                    Anyone with your recovery phrase has full access to your wallet and funds. RugbyFundX will never ask for it.
                  </p>
                </div>

                {!showSeedPhrase ? (
                  <button
                    onClick={() => setShowSeedPhrase(true)}
                    className="w-full py-3 border-2 border-[#065f46] text-[#065f46] rounded-xl font-semibold hover:bg-green-50 transition mb-4"
                  >
                    Reveal Recovery Phrase
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {seedPhrase.map((word, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                        >
                          <span className="text-xs text-gray-400 w-4 text-right shrink-0">{i + 1}</span>
                          <span className="text-sm font-mono font-medium text-gray-900">{word}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(seedPhrase.join(" "));
                      }}
                      className="w-full py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition text-sm mb-4"
                    >
                      Copy all words
                    </button>

                    <button
                      onClick={() => setShowSeedPhrase(false)}
                      className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition mb-4"
                    >
                      Hide phrase
                    </button>
                  </>
                )}

                {/* Encrypted file download */}
                <div className="border-t border-gray-100 pt-5 mt-2">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Download encrypted backup file</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Your seed phrase is encrypted with your password before downloading — the file is safe to store in Google Drive, iCloud, or email to yourself. You need both the file AND the password to recover.
                  </p>
                  <div className="space-y-2 mb-3">
                    <input
                      type="password"
                      value={backupPassword}
                      onChange={(e) => { setBackupPassword(e.target.value); setBackupError(""); }}
                      placeholder="Create a strong password (min 8 chars)"
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#065f46]"
                    />
                    <input
                      type="password"
                      value={backupPasswordConfirm}
                      onChange={(e) => { setBackupPasswordConfirm(e.target.value); setBackupError(""); }}
                      placeholder="Confirm password"
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#065f46]"
                    />
                  </div>
                  {backupError && (
                    <p className="text-xs text-red-600 mb-2">{backupError}</p>
                  )}
                  {backupDownloaded && (
                    <p className="text-xs text-green-700 bg-green-50 rounded-lg p-2 mb-2">
                      ✓ Backup file downloaded. Store it somewhere safe.
                    </p>
                  )}
                  <button
                    onClick={handleDownloadBackup}
                    disabled={backupDownloading || !backupPassword || !backupPasswordConfirm}
                    className="w-full py-3 border-2 border-[#065f46] text-[#065f46] rounded-xl font-semibold hover:bg-green-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {backupDownloading ? (
                      <><span className="w-4 h-4 border-2 border-green-200 border-t-[#065f46] rounded-full animate-spin" /> Encrypting...</>
                    ) : (
                      "⬇ Download Encrypted Backup"
                    )}
                  </button>
                </div>

                {!backedUp && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Confirm you have saved your recovery phrase or backup file:
                    </p>
                    <button
                      onClick={handleConfirmBackup}
                      className="w-full py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition"
                    >
                      I&apos;ve saved my recovery phrase
                    </button>
                  </div>
                )}

                {backedUp && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl p-3 mt-4">
                    <span className="text-lg">✓</span>
                    <span className="text-sm font-medium">Recovery phrase confirmed backed up</span>
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#065f46] to-[#10b981] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">₳</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Wallet Connected</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your existing Cardano wallet or create a new self-custodial wallet to start donating.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm text-left">
                <div className="text-2xl mb-3">🔌</div>
                <h3 className="font-bold text-gray-900 mb-2">Connect Browser Wallet</h3>
                <p className="text-sm text-gray-600">
                  Use Nami, Eternl, Flint, Yoroi or any CIP-30 compatible wallet
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm text-left">
                <div className="text-2xl mb-3">🔑</div>
                <h3 className="font-bold text-gray-900 mb-2">Create New Wallet</h3>
                <p className="text-sm text-gray-600">
                  Generate a self-custodial Cardano wallet directly in your browser
                </p>
              </div>
            </div>

            <button
              onClick={() => setWalletOpen(true)}
              className="px-8 py-3.5 bg-[#065f46] text-white font-bold rounded-xl hover:bg-[#10b981] transition text-lg shadow-sm"
            >
              Connect or Create Wallet
            </button>

            <p className="text-xs text-gray-400 mt-4">
              Operating on Cardano {getNetworkLabel()}
            </p>
          </div>
        )}
      </div>

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </main>
  );
}
