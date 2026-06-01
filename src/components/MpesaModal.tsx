"use client";

import { useState, useEffect, useRef } from "react";
import { Team } from "@/types";

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onSuccess: (kshAmount: number, adaEquivalent: number, mpesaRef: string) => void;
}

type Step = "amount" | "confirm" | "waiting" | "success" | "error";

const KSH_PRESETS = [100, 500, 1000, 2000, 5000];

export function MpesaModal({ isOpen, onClose, team, onSuccess }: MpesaModalProps) {
  const [step, setStep] = useState<Step>("amount");
  const [kshAmount, setKshAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [donorNote, setDonorNote] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [adaEquivalent, setAdaEquivalent] = useState(0);
  const [mpesaRef, setMpesaRef] = useState("");
  const [error, setError] = useState("");
  const [isDevMode, setIsDevMode] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  const fundingPct = Math.min((team.totalRaised / team.targetAmount) * 100, 100);
  const parsedKsh = parseFloat(kshAmount);
  const isValidAmount = !isNaN(parsedKsh) && parsedKsh >= 10;
  const isValidPhone = /^(07|01|2547|2541)\d{7,8}$/.test(phone.replace(/\s/g, ""));

  // Fetch exchange rate when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setRateLoading(true);
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d: { rate: number }) => { setExchangeRate(d.rate); setRateLoading(false); })
      .catch(() => { setExchangeRate(150); setRateLoading(false); });
  }, [isOpen]);

  // Poll for payment status while waiting
  useEffect(() => {
    if (step !== "waiting" || !checkoutRequestId) return;
    pollCount.current = 0;

    pollRef.current = setInterval(async () => {
      pollCount.current += 1;
      if (pollCount.current > 40) {
        // ~2 minutes
        clearInterval(pollRef.current!);
        setError("Payment timed out. Please try again.");
        setStep("error");
        return;
      }

      try {
        const res = await fetch(`/api/mpesa/status/${checkoutRequestId}`);
        const data = await res.json() as {
          status: string;
          mpesaRef?: string;
          adaEquivalent?: number;
          resultDesc?: string;
        };

        if (data.status === "confirmed") {
          clearInterval(pollRef.current!);
          setMpesaRef(data.mpesaRef ?? checkoutRequestId);
          setAdaEquivalent(data.adaEquivalent ?? adaEquivalent);
          setStep("success");
          onSuccess(parsedKsh, data.adaEquivalent ?? adaEquivalent, data.mpesaRef ?? "");
        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setError(data.resultDesc ?? "Payment was cancelled or failed. Please try again.");
          setStep("error");
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, checkoutRequestId]);

  if (!isOpen) return null;

  const adaPreview =
    exchangeRate && isValidAmount
      ? Math.round((parsedKsh / exchangeRate) * 100) / 100
      : null;

  const handleProceed = () => {
    if (!isValidAmount || !isValidPhone || !exchangeRate) return;
    setAdaEquivalent(adaPreview ?? 0);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setStep("waiting");
    setError("");
    try {
      const res = await fetch("/api/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kshAmount: parsedKsh,
          phone: phone.replace(/\s/g, ""),
          teamId: team.id,
          donorNote: donorNote.trim() || undefined,
          exchangeRate,
        }),
      });
      const data = await res.json() as {
        checkoutRequestId?: string;
        adaEquivalent?: number;
        error?: string;
        devMode?: boolean;
      };

      if (!res.ok || data.error) {
        setError(data.error ?? "Failed to initiate payment");
        setStep("error");
        return;
      }
      setCheckoutRequestId(data.checkoutRequestId ?? "");
      setAdaEquivalent(data.adaEquivalent ?? adaPreview ?? 0);
      setIsDevMode(data.devMode ?? false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setStep("error");
    }
  };

  const handleDevConfirm = async () => {
    try {
      const res = await fetch(`/api/mpesa/status/${checkoutRequestId}`, { method: "POST" });
      const data = await res.json() as { status: string; mpesaRef?: string; adaEquivalent?: number };
      if (data.status === "confirmed") {
        if (pollRef.current) clearInterval(pollRef.current);
        setMpesaRef(data.mpesaRef ?? checkoutRequestId);
        setAdaEquivalent(data.adaEquivalent ?? adaEquivalent);
        setStep("success");
        onSuccess(parsedKsh, data.adaEquivalent ?? adaEquivalent, data.mpesaRef ?? "");
      }
    } catch {
      // ignore
    }
  };

  const handleClose = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    onClose();
    setTimeout(() => {
      setStep("amount");
      setKshAmount("");
      setPhone("");
      setDonorNote("");
      setCheckoutRequestId("");
      setError("");
      setIsDevMode(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#00a651] to-[#007a3d] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="text-2xl">📱</span> M-Pesa Donation
              </h2>
              <p className="text-green-100 text-sm">{team.name} · Pay in KSH</p>
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
          {/* Funding progress */}
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
          </div>

          {/* Exchange rate badge */}
          {exchangeRate && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4 text-xs">
              <span className="text-green-700 font-medium">Live rate:</span>
              <span className="font-bold text-[#065f46]">1 ADA = KSH {exchangeRate.toFixed(2)}</span>
              {rateLoading && <span className="text-gray-400 animate-pulse">Updating...</span>}
            </div>
          )}

          {/* ── Amount step ── */}
          {step === "amount" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (KSH)
              </label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {KSH_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setKshAmount(String(p))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition ${
                      kshAmount === String(p)
                        ? "border-[#00a651] bg-green-50 text-[#00a651]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    KSH {p.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={kshAmount}
                onChange={(e) => setKshAmount(e.target.value)}
                placeholder="Custom amount"
                min="10"
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00a651] mb-1"
              />
              <p className="text-xs text-gray-400 mb-3">Minimum KSH 10</p>

              {adaPreview !== null && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">ADA equivalent</p>
                  <p className="text-2xl font-bold text-[#065f46]">{adaPreview} ₳</p>
                  <p className="text-xs text-gray-400">at current rate</p>
                </div>
              )}

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX or 2547XXXXXXXX"
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00a651] mb-1"
              />
              <p className="text-xs text-gray-400 mb-3">Kenyan mobile number registered with M-Pesa</p>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={donorNote}
                onChange={(e) => setDonorNote(e.target.value.slice(0, 64))}
                placeholder="e.g. Keep up the great work!"
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00a651] mb-4"
              />

              <button
                onClick={handleProceed}
                disabled={!isValidAmount || !isValidPhone || !exchangeRate}
                className="w-full py-3 bg-[#00a651] text-white rounded-xl font-semibold hover:bg-[#007a3d] transition disabled:opacity-50"
              >
                {isValidAmount && adaPreview
                  ? `Donate KSH ${parsedKsh.toLocaleString()} (≈ ${adaPreview} ADA)`
                  : "Enter amount & phone"}
              </button>
            </div>
          )}

          {/* ── Confirm step ── */}
          {step === "confirm" && (
            <div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">You pay</span>
                  <span className="font-bold text-gray-900">KSH {parsedKsh.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ADA equivalent</span>
                  <span className="font-bold text-[#065f46]">{adaPreview} ₳</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate used</span>
                  <span className="text-gray-700">1 ADA = KSH {exchangeRate?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">For team</span>
                  <span className="font-medium text-gray-900">{team.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-mono text-gray-700">{phone}</span>
                </div>
                {donorNote && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Note</span>
                    <span className="text-gray-700 italic">&ldquo;{donorNote}&rdquo;</span>
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-xs text-green-800">
                <p className="font-semibold mb-1">How it works</p>
                <p>You&apos;ll receive an M-Pesa STK Push prompt on your phone. Enter your PIN to complete the donation. The ADA equivalent is recorded in our transparency dashboard.</p>
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
                  className="flex-1 py-3 bg-[#00a651] text-white rounded-xl font-semibold hover:bg-[#007a3d] transition"
                >
                  Send M-Pesa Prompt
                </button>
              </div>
            </div>
          )}

          {/* ── Waiting step ── */}
          {step === "waiting" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📱</span>
              </div>
              <p className="font-bold text-gray-900 text-lg mb-1">Check your phone!</p>
              <p className="text-sm text-gray-600 mb-4">
                An M-Pesa STK Push has been sent to <strong>{phone}</strong>.<br />
                Enter your M-Pesa PIN to complete the donation.
              </p>

              <div className="flex justify-center mb-5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-green-200 border-t-[#00a651] rounded-full animate-spin" />
                  Waiting for confirmation...
                </div>
              </div>

              {isDevMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-amber-800 mb-2">Dev mode — M-Pesa credentials not set</p>
                  <button
                    onClick={handleDevConfirm}
                    className="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition"
                  >
                    Simulate M-Pesa Confirmation
                  </button>
                </div>
              )}

              <button
                onClick={handleClose}
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── Success step ── */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <p className="font-bold text-gray-900 text-lg mb-1">Donation Received!</p>
              <p className="text-sm text-gray-600 mb-4">
                KSH {parsedKsh.toLocaleString()} donated to <strong>{team.name}</strong>
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">M-Pesa Ref</span>
                  <span className="font-mono font-semibold text-gray-900">{mpesaRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">KSH Paid</span>
                  <span className="font-bold text-gray-900">KSH {parsedKsh.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ADA Equivalent</span>
                  <span className="font-bold text-[#065f46]">{adaEquivalent} ₳</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-left text-xs text-green-800">
                Your donation is recorded in our transparency dashboard. The platform will convert KSH to ADA and update the team&apos;s funding.
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-[#065f46] text-white rounded-xl font-semibold hover:bg-[#10b981] transition"
              >
                Done
              </button>
            </div>
          )}

          {/* ── Error step ── */}
          {step === "error" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">!</span>
              </div>
              <p className="font-bold text-gray-900 mb-2">Payment Failed</p>
              <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-4">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setStep("amount"); setError(""); }}
                  className="flex-1 py-3 bg-[#00a651] text-white rounded-xl font-semibold hover:bg-[#007a3d] transition"
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
