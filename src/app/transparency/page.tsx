export default function TransparencyPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-linear-to-br from-[#065f46] to-[#10b981] rounded-full flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Live Transparency Dashboard
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Every single transaction verified on-chain. Full accountability and proof of impact for all stakeholders.
          </p>

          <div className="inline-block bg-yellow-50 border-2 border-yellow-300 rounded-lg px-6 py-4 mb-12">
            <p className="text-yellow-900 font-semibold">
              ⏳ Coming Soon - Launch Q1 2026
            </p>
            <p className="text-yellow-800 text-sm mt-1">
              Real-time blockchain transaction verification and full audit trail
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Feature Preview 1 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">🔗</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">On-Chain Verification</h2>
              <p className="text-gray-600 text-sm">
                Every transaction linked to Cardano blockchain with full audit trail
              </p>
            </div>

            {/* Feature Preview 2 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">📊</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Real-Time Analytics</h2>
              <p className="text-gray-600 text-sm">
                Live dashboards tracking all donations, payouts, and milestone progress
              </p>
            </div>

            {/* Feature Preview 3 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">🎯</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Milestone Tracking</h2>
              <p className="text-gray-600 text-sm">
                Track fund releases tied to completed milestones with proof verification
              </p>
            </div>

            {/* Feature Preview 4 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">🔐</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Full Auditability</h2>
              <p className="text-gray-600 text-sm">
                Complete transaction history and fund flow traceability for every donor
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gray-50 rounded-lg border border-green-200 p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What You&apos;ll See</h2>
            <div className="space-y-4 text-left">
              <div className="flex gap-4">
                <div className="text-2xl shrink-0">💰</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Total Value Locked (TVL)</h3>
                  <p className="text-sm text-gray-600">All ADA currently in the RugbyFundX ecosystem</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl shrink-0">📋</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Transaction History</h3>
                  <p className="text-sm text-gray-600">Every donation, payout, and engagement recorded</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl shrink-0">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Milestone Verification</h3>
                  <p className="text-sm text-gray-600">Proof of completion with receipts and photos</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl shrink-0">🎯</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Impact Metrics</h3>
                  <p className="text-sm text-gray-600">Real-time KPIs on fund utilization and outcomes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notify Me Section */}
          <div className="mt-12">
            <p className="text-gray-600 mb-4">Want to explore transparency data when we launch?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <input
                type="email"
                placeholder="your@email.com"
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#065f46]"
                disabled
              />
              <button
                disabled
                className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                Notify Me
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Feature coming soon</p>
          </div>
        </div>
      </div>
    </main>
  );
}
