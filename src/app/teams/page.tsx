export default function TeamsPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-linear-to-br from-[#065f46] to-[#10b981] rounded-full flex items-center justify-center">
              <span className="text-4xl">🏉</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            All Teams
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Meet the 10 Kenyan rugby clubs and 200+ players powered by RugbyFundX
          </p>

          <div className="inline-block bg-yellow-50 border-2 border-yellow-300 rounded-lg px-6 py-4 mb-12">
            <p className="text-yellow-900 font-semibold">
              ⏳ Teams Page Coming Soon - Q1 2026
            </p>
            <p className="text-yellow-800 text-sm mt-1">
              Full team profiles, rosters, and player details launching soon
            </p>
          </div>

          <div className="mt-12 bg-gray-50 rounded-lg border border-green-200 p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Coming</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-semibold text-gray-900 mb-2">Team Profiles</h3>
                <p className="text-sm text-gray-600">Complete team information and statistics</p>
              </div>
              <div>
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-semibold text-gray-900 mb-2">Player Rosters</h3>
                <p className="text-sm text-gray-600">200+ players with stats and achievements</p>
              </div>
              <div>
                <div className="text-4xl mb-3">📍</div>
                <h3 className="font-semibold text-gray-900 mb-2">Team Locations</h3>
                <p className="text-sm text-gray-600">10 clubs across Kenya with local impact</p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-gray-600 mb-4">Explore teams on the home page</p>
            <a
              href="/"
              className="inline-block px-8 py-3 bg-[#065f46] text-white font-semibold rounded-lg hover:bg-[#10b981] transition"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
