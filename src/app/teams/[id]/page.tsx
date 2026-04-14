"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Team } from "@/types";
import { DonationModal } from "@/components/DonationModal";
import { MpesaModal } from "@/components/MpesaModal";
import { WalletModal } from "@/components/WalletModal";
import { useWalletContext } from "@/context/WalletContext";

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const { connected } = useWalletContext();

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/teams/${id}`)
        .then((r) => r.json())
        .then((data) => { setTeam(data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [params]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDonationSuccess = (txHash: string, amount: number) => {
    setTeam((prev) =>
      prev ? { ...prev, totalRaised: prev.totalRaised + amount } : prev
    );
    showToast(`Donated ${amount} ADA! Tx: ${txHash.slice(0, 12)}...`, "success");
  };

  const handleMpesaSuccess = (kshAmount: number, adaEquivalent: number, mpesaRef: string) => {
    setTeam((prev) =>
      prev ? { ...prev, totalRaised: prev.totalRaised + adaEquivalent } : prev
    );
    showToast(`M-Pesa donation received! KSH ${kshAmount.toLocaleString()} (≈ ${adaEquivalent} ADA) · Ref: ${mpesaRef}`, "success");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-green-100 border-t-[#065f46] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading team...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-lg text-gray-600 mb-4">Team not found</p>
        <Link href="/teams" className="text-[#065f46] font-semibold hover:underline">
          ← Back to Teams
        </Link>
      </div>
    );
  }

  const fundingPct = Math.min((team.totalRaised / team.targetAmount) * 100, 100);
  const completedMilestones = team.milestones.filter((m) => m.completed).length;

  return (
    <main>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/teams"
          className="inline-flex items-center gap-1 text-[#065f46] font-semibold hover:text-[#10b981] mb-6 transition"
        >
          ← Back to Teams
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            <div className="relative w-full h-72 md:h-96 bg-gray-200 rounded-2xl overflow-hidden mb-6">
              <Image src={team.image} alt={team.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 inline-block mb-2">
                  Est. {team.established}
                </div>
                <h1 className="text-3xl font-bold">{team.name}</h1>
                <p className="text-white/80">{team.location}, Kenya</p>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-green-100 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">{team.description}</p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#065f46]">{team.playerCount}</div>
                  <div className="text-xs text-gray-500 mt-1">Players</div>
                </div>
                <div className="text-center border-x border-gray-100">
                  <div className="text-2xl font-bold text-[#065f46]">{completedMilestones}</div>
                  <div className="text-xs text-gray-500 mt-1">Milestones Done</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-[#065f46] truncate">{team.coach}</div>
                  <div className="text-xs text-gray-500 mt-1">Coach</div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Funding Milestones</h2>
              {team.milestones.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center text-gray-500">
                  No milestones set yet. Milestones will appear here once the team is onboarded.
                </div>
              ) : (
                <div className="space-y-3">
                  {team.milestones.map((m) => (
                    <div
                      key={m.id}
                      className={`bg-white rounded-2xl border p-5 shadow-sm transition ${
                        m.completed ? "border-green-200" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{m.title}</h3>
                        <span
                          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                            m.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {m.completed ? "✓ Completed" : "In Progress"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{m.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          Target: <strong>{m.targetAmount} ADA</strong>
                        </span>
                        {m.completedDate && (
                          <span className="text-green-700 font-medium text-xs">
                            Completed {m.completedDate}
                          </span>
                        )}
                      </div>
                      {m.proof.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {m.proof.map((p) => (
                            <span
                              key={p}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Funding sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Funding Progress</h2>

              <div className="mb-5">
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold text-[#065f46]">
                    {team.totalRaised.toLocaleString()} ADA
                  </span>
                  <span className="text-sm text-gray-500 self-end">
                    of {team.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#065f46] to-[#10b981] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${fundingPct}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {Math.round(fundingPct)}% funded
                </p>
              </div>

              <button
                onClick={() => setDonateOpen(true)}
                className="w-full py-3.5 bg-[#065f46] text-white font-bold rounded-xl hover:bg-[#10b981] transition mb-3 text-lg shadow-sm"
              >
                ₳ Donate ADA
              </button>

              <button
                onClick={() => setMpesaOpen(true)}
                className="w-full py-3.5 bg-[#00a651] text-white font-bold rounded-xl hover:bg-[#007a3d] transition mb-3 text-base shadow-sm flex items-center justify-center gap-2"
              >
                <span>📱</span> Donate via M-Pesa (KSH)
              </button>

              {!connected && (
                <button
                  onClick={() => setWalletOpen(true)}
                  className="w-full py-2.5 border-2 border-[#065f46] text-[#065f46] font-semibold rounded-xl hover:bg-green-50 transition mb-3 text-sm"
                >
                  Connect Wallet First
                </button>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Network</span>
                  <span className="font-medium text-gray-800">Cardano Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span>Fund Release</span>
                  <span className="font-medium text-gray-800">Milestone-based</span>
                </div>
                <div className="flex justify-between">
                  <span>Transparency</span>
                  <span className="font-medium text-green-700">On-chain verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Players</span>
                  <span className="font-medium text-gray-800">{team.playerCount}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Team wallet: <span className="font-mono">{team.walletAddress.slice(0, 16)}...</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DonationModal
        isOpen={donateOpen}
        onClose={() => setDonateOpen(false)}
        team={team}
        onWalletRequired={() => setWalletOpen(true)}
        onSuccess={handleDonationSuccess}
      />
      <MpesaModal
        isOpen={mpesaOpen}
        onClose={() => setMpesaOpen(false)}
        team={team}
        onSuccess={handleMpesaSuccess}
      />
      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </main>
  );
}
