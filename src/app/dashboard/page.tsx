export default function DashboardPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-linear-to-br from-[#065f46] to-[#10b981] rounded-full flex items-center justify-center">
              <span className="text-4xl">🚀</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Team Dashboard
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload receipts, mark milestones as complete, and manage your team&apos;s fundraising campaign.
          </p>

          <div className="inline-block bg-yellow-50 border-2 border-yellow-300 rounded-lg px-6 py-4 mb-12">
            <p className="text-yellow-900 font-semibold">
              ⏳ Coming Soon - Launch Q1 2026
            </p>
            <p className="text-yellow-800 text-sm mt-1">
              We&apos;re building the most transparent team management interface in sports funding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Feature Preview 1 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">📤</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Upload Receipts</h2>
              <p className="text-gray-600 text-sm">
                Submit proof of expenses with photos and documentation
              </p>
            </div>

            {/* Feature Preview 2 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Mark Milestones</h2>
              <p className="text-gray-600 text-sm">
                Complete milestones to trigger fund releases automatically
              </p>
            </div>

            {/* Feature Preview 3 */}
            <div className="bg-white rounded-lg border border-green-200 p-6 opacity-75">
              <div className="text-4xl mb-3">📊</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">View Analytics</h2>
              <p className="text-gray-600 text-sm">
                Track funding progress and donor engagement in real-time
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gray-50 rounded-lg border border-green-200 p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">For Team Captains</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Upload receipts and proof of expenses</li>
                  <li>✓ Mark milestones as complete</li>
                  <li>✓ Track donation progress</li>
                  <li>✓ View sponsor engagement</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">For Donors & Sponsors</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Real-time transparency</li>
                  <li>✓ Proof of impact verification</li>
                  <li>✓ Sponsor recognition</li>
                  <li>✓ Full transaction history</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notify Me Section */}
          <div className="mt-12">
            <p className="text-gray-600 mb-4">Want to be notified when we launch?</p>
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
