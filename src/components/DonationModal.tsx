"use client";

import { useState } from "react";
import { useWalletContext } from "@/context/WalletContext";
import { Team } from "@/types";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onWalletRequired: () => void;
  onSuccess: (txHash: string, amount: number) => void;
}

type Step = "amount" | "confirm" | "processing" | "success" | "error";

const PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_DONATION_ADDRESS ?? "";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK ?? "preprod";
const CARDANOSCAN_BASE =
  NETWORK === "mainnet"
    ? "https://cardanoscan.io/transaction/"
    : "https://preprod.cardanoscan.io/transaction/";

export function DonationModal({
  isOpen,
  onClose,
  team,
  onWalletRequired,
  onSuccess,
}: DonationModalProps) {
  const { connected, address, walletName, sendDonation } = useWalletContext();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [donorNote, setDonorNote] = useState("");
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");

  if (!isOpen) return null;

  const fundingPct = Math.min((team.totalRaised / team.targetAmount) * 100, 100);
  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= 2;
  const platformConfigured =
    PLATFORM_ADDRESS && !PLATFORM_ADDRESS.includes("replacewith");

  const presets = [5, 10, 25, 50, 100];

  const handleProceed = () => {
    if (!connected) {
      onClose();
      onWalletRequired();
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setStep("processing");
    setTxError("");
    try {
      const hash = await sendDonation(parsedAmount, {
        teamId: team.id,
        teamName: team.name,
        donorNote: donorNote.trim() || undefined,
      });

      // Record in our database
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          amount: parsedAmount,
          type: "donation",
          teamId: team.id,
          teamName: team.name,
          txHash: hash,
          donorNote: donorNote.trim() || undefined,
        }),
      });

      setTxHash(hash);
      setStep("success");
      onSuccess(hash, parsedAmount);
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Transaction failed");
      setStep("error");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("amount");
      setAmount("");
      setDonorNote("");
      setTxHash("");
      setTxError("");
    }, 300);
  };

  const shortAddr = (addr: string) =>
    addr ? `${addr.slice(0, 10)}...${addr.slice(-6)}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#065f46] to-[#10b981] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Donate to {team.name}</h2>
              <p className="text-green-100 text-sm">{team.location} · Cardano {NETWORK === "mainnet" ? "Mainnet" : "Preprod Testnet"}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Funding progress bar */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-semibold text-[#065f46]">{team.totalRaised} ADA raised</span>
              <span className="text-gray-500">Goal: {team.targetAmount} ADA</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-[#065f46] to-[#10b981] h-2.5 rounded-full transition-all"
                style={{ width: `${fundingPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{Math.round(fundingPct)}% funded</p>
          </div>

          {/* Platform address not configured warning */}
          {!platformConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">Platform address not set</p>
              <p className="text-xs text-amber-700">
                Add <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_DONATION_ADDRESS</code> to{" "}
                <code className="bg-amber-100 px-1 rounded">.env.local</code>. Create a wallet on the Wallet page, copy the address, then restart the dev server.
              </p>
            </div>
          )}

          {/* ── Amount step ────────────────────────────────────────────────── */}
          {step === "amount" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amount (ADA)
              </label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(String(p))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition ${
                      amount === String(p)
                        ? "border-[#065f46] bg-green-50 text-[#065f46]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {p} ₳
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount"
                min="2"
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#065f46] mb-1"
              />
              <p className="text-xs text-gray-400 mb-4">Minimum 2 ADA</p>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Note for the team{" "}
                <span className="text-gray-400 font-normal">(optional — stored on-chain)</span>
              </label>
              <input
                type="text"
                value={donorNote}
                onChange={(e) => setDonorNote(e.target.value.slice(0, 64))}
                placeholder="e.g. Keep up the great work!"
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#065f46] mb-4"
              />
              <p className="text-xs text-gray-400 -mt-3 mb-4">{donorNote.length}/64 chars</p>

              {!connected && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    Connect a wallet to donate. Click below to connect or create one.
                  </p>
                </div>
              )}

              <button
                onClick={handleProceed}
                disabled={(connected && !isValidAmount) || !platformConfigured}
                className="w-full py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition disabled:opacity-50"
              >
                {connected
                  ? `Donate ${isValidAmount ? parsedAmount : "0"} ADA`
                  : "Connect Wallet to Donate"}
              </button>
            </div>
          )}

          {/* ── Confirm step ───────────────────────────────────────────────── */}
          {step === "confirm" && (
            <div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900">{parsedAmount} ADA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">For team</span>
                  <span className="font-medium text-gray-900">{team.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform address</span>
                  <span className="font-mono text-xs text-gray-600">
                    {shortAddr(PLATFORM_ADDRESS)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">From</span>
                  <span className="text-gray-700">{walletName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Network</span>
                  <span className="text-gray-700 capitalize">{NETWORK}</span>
                </div>
                {donorNote && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Your note</span>
                    <span className="text-gray-700 italic text-right max-w-[60%]">&ldquo;{donorNote}&rdquo;</span>
                  </div>
                )}
              </div>

              {/* Metadata info box */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-green-800 mb-1">On-chain metadata (CIP-20)</p>
                <div className="font-mono text-xs text-green-700 space-y-0.5">
                  <div>674: msg[0] = &quot;RugbyFundX Donation&quot;</div>
                  <div>674: msg[1] = &quot;Team: {team.name}&quot;</div>
                  <div>674: msg[2] = &quot;TeamID: {team.id}&quot;</div>
                  {donorNote && <div>674: msg[3] = &quot;{donorNote}&quot;</div>}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  This is recorded permanently on the Cardano blockchain and visible on Cardanoscan.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("amount")}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition"
                >
                  Confirm &amp; Send
                </button>
              </div>
            </div>
          )}

          {/* ── Processing ─────────────────────────────────────────────────── */}
          {step === "processing" && (
            <div className="text-center py-6">
              <div className="w-14 h-14 border-4 border-green-100 border-t-[#065f46] rounded-full animate-spin mx-auto mb-4" />
              <p className="font-semibold text-gray-900 mb-1">Broadcasting transaction...</p>
              <p className="text-sm text-gray-500">Approve in your wallet if prompted</p>
            </div>
          )}

          {/* ── Success ────────────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <p className="font-bold text-gray-900 text-lg mb-1">Donation Sent!</p>
              <p className="text-sm text-gray-600 mb-4">
                {parsedAmount} ADA sent for{" "}
                <span className="font-semibold">{team.name}</span>
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                <p className="text-xs text-gray-500 mb-1 font-medium">Transaction Hash</p>
                <p className="text-xs font-mono text-gray-700 break-all mb-2">{txHash}</p>
                <a
                  href={`${CARDANOSCAN_BASE}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#065f46] font-semibold hover:underline"
                >
                  View on Cardanoscan — see team metadata →
                </a>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-left">
                <p className="text-xs text-green-800 font-semibold mb-1">On-chain metadata written</p>
                <p className="text-xs text-green-700">
                  Team name &ldquo;{team.name}&rdquo; and ID are permanently recorded in this transaction&apos;s CIP-20 metadata. Anyone can verify which team this donation was for.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition"
              >
                Done
              </button>
            </div>
          )}

          {/* ── Error ──────────────────────────────────────────────────────── */}
          {step === "error" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">!</span>
              </div>
              <p className="font-bold text-gray-900 mb-2">Transaction Failed</p>
              <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-4">{txError}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep("amount")}
                  className="flex-1 py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
