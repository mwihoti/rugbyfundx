import { Team } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const fundingPercentage = (team.totalRaised / team.targetAmount) * 100;

  return (
    <Link href={`/teams/${team.id}`}>
      <div className="group cursor-pointer rounded-lg overflow-hidden border border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          <Image
            src={team.image}
            alt={team.name}
            width={500}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-[#065f46] text-white px-3 py-1 rounded-full text-xs font-semibold">
            {Math.round(fundingPercentage)}%
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#065f46] transition">
            {team.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3">{team.location}</p>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-semibold text-gray-700">
                {team.totalRaised} ADA
              </span>
              <span className="text-xs text-gray-500">
                of {team.targetAmount} ADA
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-linear-to-r from-[#065f46] to-[#10b981] h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{team.playerCount} players</span>
            <span>{team.milestones.filter((m) => m.completed).length} milestones</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
