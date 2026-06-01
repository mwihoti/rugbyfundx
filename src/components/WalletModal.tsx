"use client";

import { useState, useRef } from "react";
import { useWalletContext } from "@/context/WalletContext";
import { decryptSeedPhrase, WalletBackup } from "@/lib/walletCrypto";
import { getNetworkLabel } from "@/lib/cardanoExplorer";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "connect" | "create" | "import";
type CreateStep = "confirm" | "done";

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const {
    installedWallets,
    connectBrowserWallet,
    createWallet,
    importWallet,
    disconnect,
    connected,
    address,
    walletName,
    walletType,
    isLoading,
    error,
    clearError,
  } = useWalletContext();

  const [tab, setTab] = useState<Tab>("connect");
  const [createStep, setCreateStep] = useState<CreateStep>("confirm");
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string[]>([]);
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [savedConfirmed, setSavedConfirmed] = useState(false);
  const [importWords, setImportWords] = useState("");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);
  const [importMode, setImportMode] = useState<"phrase" | "file">("phrase");
  const [fileBackup, setFileBackup] = useState<WalletBackup | null>(null);
  const [filePassword, setFilePassword] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleConnect = async (walletName: string) => {
    await connectBrowserWallet(walletName);
    if (!error) onClose();
  };

  const handleCreate = async () => {
    clearError();
    const result = await createWallet("");
    setGeneratedMnemonic(result.mnemonic);
    setGeneratedAddress(result.address);
    setCreateStep("done");
  };

  const handleFinishCreate = () => {
    onClose();
    setCreateStep("confirm");
    setGeneratedMnemonic([]);
    setSavedConfirmed(false);
  };

  const handleImport = async () => {
    setImportError("");
    const words = importWords.trim().split(/\s+/);
    if (words.length !== 15 && words.length !== 24) {
      setImportError("Recovery phrase must be 15 or 24 words");
      return;
    }
    try {
      await importWallet(words);
      onClose();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Invalid recovery phrase");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as WalletBackup;
        if (!parsed.ciphertext || !parsed.salt || !parsed.iv) {
          setImportError("Invalid backup file format");
          return;
        }
        setFileBackup(parsed);
      } catch {
        setImportError("Could not read backup file — make sure it is a valid .json file");
      }
    };
    reader.readAsText(file);
  };

  const handleImportFromFile = async () => {
    if (!fileBackup || !filePassword) return;
    setImportError("");
    try {
      const words = await decryptSeedPhrase(fileBackup, filePassword);
      await importWallet(words);
      onClose();
    } catch {
      setImportError("Wrong password or corrupted backup file");
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(generatedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const shortAddr = (addr: string) =>
    addr ? `${addr.slice(0, 12)}...${addr.slice(-6)}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#065f46] to-[#10b981] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Cardano Wallet</h2>
              <p className="text-green-100 text-sm mt-1">
                {connected ? "Wallet connected" : "Connect or create your wallet"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <span className="text-white font-bold">×</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Connected state */}
          {connected && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-green-800">{walletName}</span>
                  {walletType === "selfcustodial" && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Self-Custodial
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono text-gray-600 break-all">
                  {shortAddr(address || "")}
                </p>
                <p className="text-xs text-gray-500 mt-1">{getNetworkLabel()}</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full py-2 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
              >
                Disconnect Wallet
              </button>
            </div>
          )}

          {/* Tabs */}
          {!connected && (
            <>
              <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
                {(["connect", "create", "import"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); clearError(); setImportError(""); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                      tab === t
                        ? "bg-white text-[#065f46] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "connect" ? "Connect" : t === "create" ? "New Wallet" : "Import"}
                  </button>
                ))}
              </div>

              {/* Connect Tab */}
              {tab === "connect" && (
                <div>
                  {installedWallets.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-gray-600 font-medium mb-2">No wallets detected</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Install a Cardano wallet extension to connect
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="bg-gray-50 rounded-lg p-2">Nami</div>
                        <div className="bg-gray-50 rounded-lg p-2">Eternl</div>
                        <div className="bg-gray-50 rounded-lg p-2">Flint</div>
                        <div className="bg-gray-50 rounded-lg p-2">Yoroi</div>
                      </div>
                      <p className="text-xs text-gray-400 mt-4">
                        Or create a new in-browser wallet below
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {installedWallets.map((w, index) => (
                        <button
                          key={`${w.name}-${w.version}-${index}`}
                          onClick={() => handleConnect(w.name)}
                          disabled={isLoading}
                          className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-[#065f46] hover:bg-green-50 transition disabled:opacity-50"
                        >
                          {w.icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={w.icon} alt={w.name} className="w-8 h-8 rounded-lg" />
                          )}
                          <span className="font-medium text-gray-900 capitalize">{w.name}</span>
                          <span className="ml-auto text-xs text-gray-400">v{w.version}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {error && (
                    <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
                  )}
                </div>
              )}

              {/* Create Tab */}
              {tab === "create" && (
                <div>
                  {createStep === "confirm" && (
                    <div>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <p className="text-sm font-semibold text-amber-800 mb-1">
                          Security notice
                        </p>
                        <ul className="text-xs text-amber-700 space-y-1">
                          <li>• You will receive a 24-word recovery phrase</li>
                          <li>• Write it down and store it safely offline</li>
                          <li>• Anyone with your phrase can access your funds</li>
                          <li>• This wallet operates on Cardano {getNetworkLabel()}</li>
                        </ul>
                      </div>
                      <button
                        onClick={handleCreate}
                        disabled={isLoading}
                        className="w-full py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate New Wallet"
                        )}
                      </button>
                      {error && (
                        <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
                      )}
                    </div>
                  )}

                  {createStep === "done" && (
                    <div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <p className="text-sm font-semibold text-green-800 mb-2">
                          Wallet created! Save your recovery phrase:
                        </p>
                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                          {generatedMnemonic.map((word, i) => (
                            <div
                              key={i}
                              className="bg-white border border-green-200 rounded-lg p-1.5 text-xs flex gap-1"
                            >
                              <span className="text-gray-400 select-none">{i + 1}.</span>
                              <span className="font-mono font-medium text-gray-800">{word}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-xs font-mono text-gray-600 truncate flex-1">
                            {shortAddr(generatedAddress)}
                          </p>
                          <button
                            onClick={copyAddress}
                            className="text-xs text-[#065f46] font-medium hover:underline"
                          >
                            {copied ? "Copied!" : "Copy address"}
                          </button>
                        </div>
                      </div>
                      <label className="flex items-start gap-2 cursor-pointer mb-4">
                        <input
                          type="checkbox"
                          checked={savedConfirmed}
                          onChange={(e) => setSavedConfirmed(e.target.checked)}
                          className="mt-0.5 accent-[#065f46]"
                        />
                        <span className="text-sm text-gray-700">
                          I have saved my recovery phrase in a safe place
                        </span>
                      </label>
                      <button
                        onClick={handleFinishCreate}
                        disabled={!savedConfirmed}
                        className="w-full py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition disabled:opacity-50"
                      >
                        Done — Open My Wallet
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Import Tab */}
              {tab === "import" && (
                <div>
                  {/* Mode toggle */}
                  <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
                    <button
                      onClick={() => { setImportMode("phrase"); setImportError(""); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${importMode === "phrase" ? "bg-white text-[#065f46] shadow-sm" : "text-gray-500"}`}
                    >
                      Recovery Phrase
                    </button>
                    <button
                      onClick={() => { setImportMode("file"); setImportError(""); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${importMode === "file" ? "bg-white text-[#065f46] shadow-sm" : "text-gray-500"}`}
                    >
                      Backup File
                    </button>
                  </div>

                  {importMode === "phrase" && (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Enter your 15 or 24-word recovery phrase, one word per space:
                      </p>
                      <textarea
                        value={importWords}
                        onChange={(e) => { setImportWords(e.target.value); setImportError(""); }}
                        placeholder="word1 word2 word3 ..."
                        rows={4}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-[#065f46] resize-none"
                      />
                      {importError && <p className="mt-2 text-sm text-red-600">{importError}</p>}
                      <button
                        onClick={handleImport}
                        disabled={isLoading || !importWords.trim()}
                        className="w-full mt-3 py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing...</>
                        ) : "Import Wallet"}
                      </button>
                    </>
                  )}

                  {importMode === "file" && (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Upload your <code className="bg-gray-100 px-1 rounded text-xs">rfx-wallet-*.json</code> backup file and enter the password you used when creating it:
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full py-3 border-2 rounded-xl text-sm font-medium mb-3 transition ${
                          fileBackup
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {fileBackup ? `✓ ${fileName}` : "Choose backup file (.json)"}
                      </button>

                      <input
                        type="password"
                        value={filePassword}
                        onChange={(e) => { setFilePassword(e.target.value); setImportError(""); }}
                        placeholder="Backup file password"
                        className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#065f46] mb-3"
                      />

                      {importError && <p className="text-sm text-red-600 mb-2">{importError}</p>}

                      <button
                        onClick={handleImportFromFile}
                        disabled={isLoading || !fileBackup || !filePassword}
                        className="w-full py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Decrypting...</>
                        ) : "Restore from Backup"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {connected && (
            <p className="text-xs text-center text-gray-400">
              Network: Cardano {getNetworkLabel()} · Powered by Mesh SDK
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
