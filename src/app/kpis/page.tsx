export default function KPIsPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-linear-to-br from-[#065f46] to-[#10b981] rounded-full flex items-center justify-center">
              <span className="text-4xl">📈</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Community Engagement KPIs
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track ecosystem growth, community engagement, and open-source contribution metrics.
          </p>

          <div className="inline-block bg-yellow-50 border-2 border-yellow-300 rounded-lg px-6 py-4 mb-12">
            <p className="text-yellow-900 font-semibold">
              ⏳ Coming Soon - Launch Q1 2026
            </p>
            <p className="text-yellow-800 text-sm mt-1">
              Real-time dashboard tracking community growth and social engagement
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Feature Preview 1 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">👥</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Community Growth</h2>
              <p className="text-gray-600 text-sm">
                Social media presence tracking across Telegram, Discord, and Twitter
              </p>
            </div>

            {/* Feature Preview 2 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">💬</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Social Engagement</h2>
              <p className="text-gray-600 text-sm">
                Community sentiment analysis and participation metrics
              </p>
            </div>

            {/* Feature Preview 3 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">🔗</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">GitHub Activity</h2>
              <p className="text-gray-600 text-sm">
                Open-source contribution metrics and weekly commit history
              </p>
            </div>

            {/* Feature Preview 4 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">🏆</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Impact Scores</h2>
              <p className="text-gray-600 text-sm">
                Contributor rankings and engagement leaderboards
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gray-50 rounded-lg border border-green-200 p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Metrics We Track</h2>
            <div className="space-y-4 text-left">
              <div className="flex gap-4">
                <div className="text-2xl shrink-0">📊</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Growth Targets</h3>
                  <p className="text-sm text-gray-600">5000+ ADA TVL and 1000+ on-chain transactions in first 6-12 months</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl shrink-0">👤</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Active Participants</h3>
                  <p className="text-sm text-gray-600">Players, sponsors, team captains, and donors tracked in real-time</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl shrink-0">📱</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Social Media Presence</h3>
                  <p className="text-sm text-gray-600">Telegram members, Discord activity, and Twitter followers</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl shrink-0">💻</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Open-Source Metrics</h3>
                  <p className="text-sm text-gray-600">Weekly commit history, contributor count, and GitHub stars</p>
                </div>
              </div>
            </div>
          </div>

          {/* Targets Section */}
          <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">First 6 Months Targets</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-[#065f46] mb-1">5000+</div>
                <p className="text-gray-700">ADA Total Value Locked</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#10b981] mb-1">1000+</div>
                <p className="text-gray-700">On-Chain Transactions</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">200+</div>
                <p className="text-gray-700">Active Players</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">10</div>
                <p className="text-gray-700">Rugby Clubs</p>
              </div>
            </div>
          </div>

          {/* Notify Me Section */}
          <div className="mt-12">
            <p className="text-gray-600 mb-4">Want real-time KPI updates when we launch?</p>
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
