import { MetricsGrid } from "@/components/MetricsGrid";
import { TransactionsTable } from "@/components/TransactionsTable";
import { mockTransactions, communityMetrics } from "@/data/mockData";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-[#065f46] to-[#10b981] text-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Transparent Funding for Kenyan Rugby
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-green-50">
              On-chain crowdfunding providing transparent fund tracking, milestone-based fund
              release, and active sponsor-player engagement, ensuring accountability and trust.
            </p>
            <div className="flex gap-4">
              <Link
                href="/teams"
                className="inline-block px-6 py-3 bg-white text-[#065f46] font-semibold rounded-lg hover:bg-green-50 transition"
              >
                Explore Teams
              </Link>
              <Link
                href="/transparency"
                className="inline-block px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#065f46] transition"
              >
                View Transactions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 border-b border-green-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Community Impact</h2>
          <MetricsGrid metrics={communityMetrics} />
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-12 sm:py-16 border-b border-green-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Problem</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#065f46] font-bold">•</span>
                  <span>Players quit due to lack of kits and support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#065f46] font-bold">•</span>
                  <span>Traditional donations lack transparency</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#065f46] font-bold">•</span>
                  <span>Funds disappear without proof of usage</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#065f46] font-bold">•</span>
                  <span>Donors hesitant due to lack of accountability</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Solution</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] font-bold">✓</span>
                  <span>Milestone-based funding automation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] font-bold">✓</span>
                  <span>On-chain financial transparency</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] font-bold">✓</span>
                  <span>Sponsor visibility & proof-of-impact logs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#10b981] font-bold">✓</span>
                  <span>Dual value flow - players & sponsor engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Teams Coming Soon */}
      <section className="py-12 sm:py-16 border-b border-green-200 bg-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4">
            <div className="text-5xl">🏉</div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Teams & Rosters</h2>
          <p className="text-lg text-gray-600 mb-4">
            Explore all 10 rugby clubs and meet the 200+ players on RugbyFundX
          </p>
          <p className="text-sm text-gray-600">Coming Q1 2026</p>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>📋 Mock Data Preview:</strong> Below is a demonstration of what on-chain transactions will look like once the platform goes live. Each transaction will be verified on Cardano blockchain.
            </p>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Transactions</h2>
            <Link
              href="/transparency"
              className="text-[#065f46] font-semibold hover:text-[#10b981] transition"
            >
              View All →
            </Link>
          </div>
          <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
            <TransactionsTable transactions={mockTransactions} limit={5} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gray-50 border-t border-green-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Support Kenyan Rugby?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the community, connect your Cardano wallet, and help fund the next generation of
            rugby players.
          </p>
          <button className="px-8 py-3 bg-[#065f46] text-white font-semibold rounded-lg hover:bg-[#10b981] transition">
            Connect Wallet
          </button>
        </div>
      </section>
    </main>
  );
}
