import { TeamCard } from "@/components/TeamCard";
import { Team } from "@/types";
import Link from "next/link";

async function getTeams(): Promise<Team[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/teams`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  } catch {
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await getTeams();

  const totalRaised = teams.reduce((sum, t) => sum + t.totalRaised, 0);
  const totalTarget = teams.reduce((sum, t) => sum + t.targetAmount, 0);
  const totalPlayers = teams.reduce((sum, t) => sum + t.playerCount, 0);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#065f46] to-[#10b981] text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">Kenyan Rugby Teams</h1>
          <p className="text-green-100 text-lg mb-6 max-w-xl">
            {teams.length} clubs across Kenya supported on-chain through transparent crowdfunding
          </p>
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-2xl font-bold">{totalRaised.toLocaleString()} ADA</div>
              <div className="text-green-200 text-sm">Total Raised</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalTarget.toLocaleString()} ADA</div>
              <div className="text-green-200 text-sm">Total Goal</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalPlayers}</div>
              <div className="text-green-200 text-sm">Active Players</div>
            </div>
          </div>
        </div>
      </section>

      {/* Teams grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              All Teams <span className="text-gray-400 font-normal text-lg">({teams.length})</span>
            </h2>
            <Link
              href="/request"
              className="px-4 py-2 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition text-sm font-semibold"
            >
              Register Your Team
            </Link>
          </div>

          {teams.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">🏉</div>
              <p className="text-lg">No teams loaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-50 border-t border-green-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Is your team not listed?</h2>
          <p className="text-gray-600 mb-6">
            Apply for funding support and get your team on-chain
          </p>
          <Link
            href="/request"
            className="inline-block px-8 py-3 bg-[#065f46] text-white font-semibold rounded-lg hover:bg-[#10b981] transition"
          >
            Request Assistance
          </Link>
        </div>
      </section>
    </main>
  );
}
