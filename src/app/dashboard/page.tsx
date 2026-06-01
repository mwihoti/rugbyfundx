"use client";

import { useEffect, useState } from "react";
import { AssistanceRequestForm } from "@/components/AssistanceRequestForm";
import { Transaction, AssistanceRequest } from "@/types";
import Link from "next/link";
import { getCardanoscanTxUrl } from "@/lib/cardanoExplorer";

const TYPE_COLORS: Record<string, string> = {
  donation: "bg-green-100 text-green-800",
  payout: "bg-blue-100 text-blue-800",
  engagement: "bg-purple-100 text-purple-800",
  mpesa: "bg-emerald-100 text-emerald-800",
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"overview" | "request">("overview");

  useEffect(() => {
    Promise.all([
      fetch("/api/transactions").then((r) => r.json()),
      fetch("/api/requests").then((r) => r.json()),
    ]).then(([txs, reqs]) => {
      setTransactions(txs.slice(0, 10));
      setRequests(reqs);
      setLoading(false);
    });
  }, []);

  const totalDonated = transactions
    .filter((t) => t.type === "donation")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <main>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#065f46] to-[#10b981] text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Team Dashboard</h1>
          <p className="text-green-100 text-lg">
            Manage your fundraising, track donations, and request support
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveSection("overview")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === "overview"
                ? "bg-white text-[#065f46] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection("request")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === "request"
                ? "bg-white text-[#065f46] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Request Assistance
          </button>
        </div>

        {/* Overview */}
        {activeSection === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Total Donated (Platform)</div>
                <div className="text-2xl font-bold text-[#065f46]">
                  {loading ? "—" : `${totalDonated.toLocaleString()} ADA`}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Your Transactions</div>
                <div className="text-2xl font-bold text-[#10b981]">
                  {loading ? "—" : transactions.length}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Assistance Requests</div>
                <div className="text-2xl font-bold text-[#065f46]">
                  {loading ? "—" : requests.length}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href="/teams"
                className="bg-white rounded-2xl border-2 border-green-100 p-5 hover:border-[#065f46] transition group shadow-sm"
              >
                <div className="text-3xl mb-3">🏉</div>
                <h3 className="font-bold text-gray-900 group-hover:text-[#065f46] transition">Browse Teams</h3>
                <p className="text-sm text-gray-500 mt-1">Find teams to support</p>
              </Link>
              <button
                onClick={() => setActiveSection("request")}
                className="bg-white rounded-2xl border-2 border-green-100 p-5 hover:border-[#065f46] transition group shadow-sm text-left"
              >
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-bold text-gray-900 group-hover:text-[#065f46] transition">Request Funding</h3>
                <p className="text-sm text-gray-500 mt-1">Apply for team assistance</p>
              </button>
              <Link
                href="/transparency"
                className="bg-white rounded-2xl border-2 border-green-100 p-5 hover:border-[#065f46] transition group shadow-sm"
              >
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-bold text-gray-900 group-hover:text-[#065f46] transition">View Transparency</h3>
                <p className="text-sm text-gray-500 mt-1">All on-chain transactions</p>
              </Link>
            </div>

            {/* Recent transactions */}
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Recent Transactions</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-green-100 border-t-[#065f46] rounded-full animate-spin mx-auto" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No transactions yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Type</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Amount</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3 hidden sm:table-cell">Date</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Tx</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TYPE_COLORS[tx.type]}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            {tx.amount} ADA
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={getCardanoscanTxUrl(tx.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#065f46] font-mono hover:underline"
                            >
                              {tx.txHash.slice(0, 10)}...
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Assistance requests status */}
            {requests.length > 0 && (
              <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Your Assistance Requests</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <div key={req.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{req.teamName}</p>
                        <p className="text-sm text-gray-500">{req.amountRequested} ADA · {req.category}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                        req.status === "approved" ? "bg-green-100 text-green-800" :
                        req.status === "rejected" ? "bg-red-100 text-red-800" :
                        req.status === "reviewing" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Request form */}
        {activeSection === "request" && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Assistance</h2>
              <p className="text-gray-600">
                Fill out the form below and our team will review your request within 2-3 business days.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
              <AssistanceRequestForm
                onSuccess={() => {
                  fetch("/api/requests").then((r) => r.json()).then(setRequests);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
