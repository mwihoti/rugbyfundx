"use client";

import { useEffect, useState } from "react";
import { useWalletContext } from "@/context/WalletContext";
import { WalletModal } from "@/components/WalletModal";
import { TeamCard } from "@/components/TeamCard";
import { Team, Transaction, CommunityMetrics } from "@/types";
import Link from "next/link";

const CARDANOSCAN = "https://preprod.cardanoscan.io/transaction/";
const TYPE_COLORS: Record<string, string> = {
  donation: "bg-green-100 text-green-800",
  payout: "bg-blue-100 text-blue-800",
  engagement: "bg-purple-100 text-purple-800",
  mpesa: "bg-emerald-100 text-emerald-800",
};

export default function Home() {
  const { connected } = useWalletContext();
  const [walletOpen, setWalletOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<CommunityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/transactions").then((r) => r.json()),
      fetch("/api/metrics").then((r) => r.json()),
    ]).then(([t, tx, m]) => {
      setTeams(t);
      setTransactions(tx.slice(0, 5));
      setMetrics(m);
      setLoading(false);
    });
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#065f46] via-[#047857] to-[#10b981] text-white py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-9xl">🏉</div>
          <div className="absolute bottom-10 right-10 text-8xl">🏉</div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-green-100 mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live on Cardano Preprod Testnet
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Transparent Funding for Kenyan Rugby
            </h1>
            <p className="text-lg sm:text-xl mb-10 text-green-50 max-w-2xl">
              On-chain crowdfunding with milestone-based fund release. Every donation is
              verified on the Cardano blockchain — transparent, trustless, impactful.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/teams"
                className="inline-block px-7 py-3.5 bg-white text-[#065f46] font-bold rounded-xl hover:bg-green-50 transition shadow-lg text-base"
              >
                Explore Teams
              </Link>
              {connected ? (
                <Link
                  href="/wallet"
                  className="inline-block px-7 py-3.5 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-[#065f46] transition text-base"
                >
                  My Wallet
                </Link>
              ) : (
                <button
                  onClick={() => setWalletOpen(true)}
                  className="px-7 py-3.5 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-[#065f46] transition text-base"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-12 border-b border-green-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Impact</h2>
          {loading || !metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Value Locked", value: `${metrics.totalValueLocked.toLocaleString()}`, unit: "ADA", color: "text-[#065f46]" },
                { label: "On-Chain Transactions", value: metrics.transactionCount.toLocaleString(), unit: "Total", color: "text-[#10b981]" },
                { label: "Active Wallets", value: metrics.activeWallets.toLocaleString(), unit: "Participants", color: "text-[#065f46]" },
                { label: "Active Teams", value: metrics.teamsActive.toString(), unit: "Rugby clubs", color: "text-[#10b981]" },
                { label: "Active Players", value: metrics.playersActive.toLocaleString(), unit: "In ecosystem", color: "text-[#065f46]" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-green-100 p-5 hover:border-green-300 transition shadow-sm">
                  <div className="text-xs font-medium text-gray-500 mb-1">{stat.label}</div>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.unit}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-14 border-b border-green-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">The Problem</h2>
              <ul className="space-y-3">
                {[
                  "Players quit due to lack of kits and support",
                  "Traditional donations lack transparency",
                  "Funds disappear without proof of usage",
                  "Donors hesitant due to lack of accountability",
                  "Talented players miss opportunities due to funding gaps",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <span className="text-red-400 font-bold mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">The Solution</h2>
              <ul className="space-y-3">
                {[
                  "Milestone-based funding automation on Cardano",
                  "Every transaction immutably recorded on-chain",
                  "Proof-of-impact with receipts and photos",
                  "Sponsor visibility and engagement tracking",
                  "Direct wallet-to-team donations — no middlemen",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <span className="text-[#10b981] font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Teams */}
      <section className="py-14 border-b border-green-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Teams</h2>
              <p className="text-gray-500 text-sm mt-1">Support these clubs directly with ADA</p>
            </div>
            <Link href="/teams" className="text-[#065f46] font-semibold hover:text-[#10b981] transition text-sm">
              View all teams →
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {teams.slice(0, 4).map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="py-14 border-b border-green-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent On-Chain Transactions</h2>
            <Link href="/transparency" className="text-[#065f46] font-semibold hover:text-[#10b981] transition text-sm">
              Full dashboard →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <div className="text-4xl mb-3">🔗</div>
                  No transactions yet. Be the first to donate!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Date</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Team</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Type</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Amount</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 hidden sm:table-cell">Wallet</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Tx Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3.5">
                            {tx.teamName ? (
                              <span className="text-sm font-semibold text-[#065f46]">{tx.teamName}</span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TYPE_COLORS[tx.type]}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-sm font-bold text-gray-900">
                            {tx.amount.toLocaleString()} ADA
                          </td>
                          <td className="px-6 py-3.5 text-xs font-mono text-gray-500 hidden sm:table-cell">
                            {tx.walletAddress.slice(0, 14)}...
                          </td>
                          <td className="px-6 py-3.5">
                            <a
                              href={`${CARDANOSCAN}${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#065f46] font-mono hover:underline"
                              title="View on Cardanoscan"
                            >
                              {tx.txHash.slice(0, 10)}... ↗
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#065f46] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Support Kenyan Rugby?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Connect your Cardano wallet or create one in seconds. Your donation is
            transparent, on-chain, and goes directly to teams.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {connected ? (
              <Link
                href="/teams"
                className="px-8 py-3.5 bg-white text-[#065f46] font-bold rounded-xl hover:bg-green-50 transition"
              >
                Donate to a Team
              </Link>
            ) : (
              <button
                onClick={() => setWalletOpen(true)}
                className="px-8 py-3.5 bg-white text-[#065f46] font-bold rounded-xl hover:bg-green-50 transition"
              >
                Connect Wallet
              </button>
            )}
            <Link
              href="/request"
              className="px-8 py-3.5 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-[#065f46] transition"
            >
              Register Your Team
            </Link>
          </div>
        </div>
      </section>

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </main>
  );
}
