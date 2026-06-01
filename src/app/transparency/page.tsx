"use client";

import { useEffect, useState } from "react";
import { Transaction, CommunityMetrics, AssistanceRequest } from "@/types";
import { getCardanoscanTxUrl } from "@/lib/cardanoExplorer";

const TYPE_COLORS: Record<string, string> = {
  donation: "bg-green-100 text-green-800",
  payout: "bg-blue-100 text-blue-800",
  engagement: "bg-purple-100 text-purple-800",
  mpesa: "bg-emerald-100 text-emerald-800",
};

const TYPE_LABELS: Record<string, string> = {
  donation: "ADA",
  payout: "Payout",
  engagement: "Engagement",
  mpesa: "M-Pesa",
};
const REQUEST_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};
const CATEGORY_LABELS: Record<string, string> = {
  kits: "Team Kits",
  training: "Training",
  medical: "Medical",
  travel: "Travel",
  facility: "Facility",
  other: "Other",
};

export default function TransparencyPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [metrics, setMetrics] = useState<CommunityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"transactions" | "requests">("transactions");
  const [teamFilter, setTeamFilter] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/transactions").then((r) => r.json()),
      fetch("/api/metrics").then((r) => r.json()),
      fetch("/api/requests").then((r) => r.json()),
    ]).then(([txs, met, reqs]) => {
      setTransactions(txs);
      setMetrics(met);
      setRequests(reqs);
      setLoading(false);
    });
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const teamNames = Array.from(
    new Set(transactions.filter((t) => t.teamName).map((t) => t.teamName))
  ).sort();

  const filteredTransactions =
    teamFilter === "all"
      ? transactions
      : transactions.filter((t) => t.teamName === teamFilter);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#065f46] to-[#10b981] text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Transparency Dashboard</h1>
          <p className="text-green-100 text-lg max-w-xl">
            Every transaction verified on Cardano blockchain. Full accountability for all stakeholders.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-10 border-b border-green-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading || !metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Value Locked", value: `${metrics.totalValueLocked.toLocaleString()} ADA`, color: "text-[#065f46]" },
                { label: "On-Chain Transactions", value: metrics.transactionCount.toLocaleString(), color: "text-[#10b981]" },
                { label: "Active Wallets", value: metrics.activeWallets.toLocaleString(), color: "text-[#065f46]" },
                { label: "Active Teams", value: metrics.teamsActive.toString(), color: "text-[#10b981]" },
                { label: "Active Players", value: metrics.playersActive.toLocaleString(), color: "text-[#065f46]" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm hover:border-green-300 transition">
                  <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tabs + Content */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "transactions"
                  ? "bg-white text-[#065f46] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "requests"
                  ? "bg-white text-[#065f46] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Assistance Requests
              {requests.length > 0 && (
                <span className="ml-2 bg-[#065f46] text-white text-xs rounded-full px-1.5 py-0.5">
                  {requests.length}
                </span>
              )}
            </button>
          </div>

          {/* Transactions */}
          {activeTab === "transactions" && (
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-gray-900">On-Chain Transactions</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {filteredTransactions.length}{teamFilter !== "all" ? ` of ${transactions.length}` : ""} total
                  </span>
                </div>
                {teamNames.length > 0 && (
                  <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#065f46] text-gray-700 bg-white"
                  >
                    <option value="all">All Teams</option>
                    {teamNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                )}
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-green-100 border-t-[#065f46] rounded-full animate-spin mx-auto" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-3">🔗</div>
                  <p>{teamFilter !== "all" ? `No transactions for ${teamFilter}.` : "No transactions yet. Be the first to donate!"}</p>
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
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 hidden md:table-cell">Wallet</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Tx Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 transition group">
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap align-top">
                            {formatDate(tx.timestamp)}
                          </td>
                          <td className="px-6 py-4 align-top">
                            {tx.teamName ? (
                              <div>
                                <span className="text-sm font-semibold text-[#065f46]">{tx.teamName}</span>
                                {tx.donorNote && (
                                  <p className="text-xs text-gray-400 italic mt-0.5 max-w-[160px] truncate" title={tx.donorNote}>
                                    &ldquo;{tx.donorNote}&rdquo;
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 align-top">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[tx.type] ?? "bg-gray-100 text-gray-700"}`}>
                              {TYPE_LABELS[tx.type] ?? tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap align-top">
                            {tx.type === "mpesa" && tx.kshAmount ? (
                              <div>
                                <span className="text-emerald-700">KSH {tx.kshAmount.toLocaleString()}</span>
                                <div className="text-xs font-normal text-gray-500">≈ {(tx.adaEquivalent ?? tx.amount).toLocaleString()} ADA</div>
                              </div>
                            ) : (
                              <>{tx.amount.toLocaleString()} ADA</>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-gray-500 hidden md:table-cell align-top">
                            {tx.type === "mpesa" && tx.donorPhone
                              ? tx.donorPhone
                              : `${tx.walletAddress.slice(0, 14)}...`}
                          </td>
                          <td className="px-6 py-4 align-top">
                            {tx.type === "mpesa" ? (
                              <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {tx.txHash}
                              </span>
                            ) : (
                              <a
                                href={getCardanoscanTxUrl(tx.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#065f46] font-mono hover:underline"
                                title="View on Cardanoscan — team metadata stored on-chain"
                              >
                                {tx.txHash.slice(0, 12)}... ↗
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Assistance Requests */}
          {activeTab === "requests" && (
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Team Assistance Requests</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {requests.length} submitted
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-green-100 border-t-[#065f46] rounded-full animate-spin mx-auto" />
                </div>
              ) : requests.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="mb-4">No assistance requests yet.</p>
                  <a
                    href="/request"
                    className="text-[#065f46] font-semibold hover:underline"
                  >
                    Submit a request →
                  </a>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <div key={req.id} className="px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{req.teamName}</span>
                            {req.location && (
                              <span className="text-xs text-gray-500">· {req.location}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{req.description}</p>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {CATEGORY_LABELS[req.category] || req.category}
                            </span>
                            <span className="text-xs font-semibold text-[#065f46]">
                              {req.amountRequested} ADA requested
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(req.submittedAt)}
                            </span>
                          </div>
                        </div>
                        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${REQUEST_COLORS[req.status]}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
