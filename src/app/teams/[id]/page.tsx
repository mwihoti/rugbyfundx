import { mockTeams } from "@/data/mockData";
import Image from "next/image";
import Link from "next/link";

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const team = mockTeams.find((t) => t.id === params.id);

  if (!team) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-lg text-gray-600">Team not found</p>
        <Link href="/teams" className="text-[#065f46] font-semibold hover:underline">
          Back to Teams
        </Link>
      </div>
    );
  }

  const fundingPercentage = (team.totalRaised / team.targetAmount) * 100;

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/teams"
          className="text-[#065f46] font-semibold hover:text-[#10b981] mb-6 inline-block"
        >
          ← Back to Teams
        </Link>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-6">
              <Image
                src={team.image}
                alt={team.name}
                fill
                className="object-cover"
              />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">{team.name}</h1>
            <p className="text-lg text-gray-600 mb-4">
              {team.location} • Established {team.established}
            </p>

            <div className="bg-white rounded-lg border border-green-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 mb-4">{team.description}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Coach</div>
                  <div className="font-semibold text-gray-900">{team.coach}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Players</div>
                  <div className="font-semibold text-gray-900">{team.playerCount}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Milestones</div>
                  <div className="font-semibold text-gray-900">{team.milestones.length}</div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Milestones</h2>
            {team.milestones.length > 0 ? (
              <div className="space-y-4">
                {team.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="bg-white rounded-lg border border-green-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{milestone.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          milestone.completed
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {milestone.completed ? "✓ Completed" : "In Progress"}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{milestone.description}</p>
                    <div className="text-sm text-gray-700">
                      Target: {milestone.targetAmount} ADA
                      {milestone.completedDate && (
                        <div className="text-[#065f46] font-semibold mt-1">
                          Completed: {milestone.completedDate}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No milestones set yet.</p>
            )}
          </div>

          {/* Funding Card */}
          <div className="bg-white rounded-lg border border-green-200 p-6 h-fit sticky top-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Funding Progress</h2>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-lg font-bold text-[#065f46]">{team.totalRaised} ADA</span>
                <span className="text-sm text-gray-600">of {team.targetAmount} ADA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-linear-to-r from-[#065f46] to-[#10b981] h-3 rounded-full"
                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 font-semibold">
                {Math.round(fundingPercentage)}% funded
              </p>
            </div>

            <button className="w-full px-4 py-3 bg-[#065f46] text-white font-semibold rounded-lg hover:bg-[#10b981] transition mb-3">
              Donate Now
            </button>

            <button className="w-full px-4 py-2 border-2 border-[#065f46] text-[#065f46] font-semibold rounded-lg hover:bg-gray-50 transition">
              View Details
            </button>

            <div className="mt-6 pt-6 border-t border-green-200 text-sm text-gray-600 space-y-2">
              <p>
                <span className="font-semibold">Sponsor Visibility:</span> Full transparency
              </p>
              <p>
                <span className="font-semibold">Fund Release:</span> Milestone-based
              </p>
              <p>
                <span className="font-semibold">Network:</span> Cardano
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
