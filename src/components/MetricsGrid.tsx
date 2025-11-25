import { CommunityMetrics } from "@/types";

interface MetricsGridProps {
  metrics: CommunityMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg border border-green-200 p-6 hover:border-green-400 transition">
        <div className="text-sm font-semibold text-gray-600 mb-2">Total Value Locked</div>
        <div className="text-3xl font-bold text-[#065f46]">
          {metrics.totalValueLocked.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-2">ADA</div>
      </div>

      <div className="bg-white rounded-lg border border-green-200 p-6 hover:border-green-400 transition">
        <div className="text-sm font-semibold text-gray-600 mb-2">On-Chain Transactions</div>
        <div className="text-3xl font-bold text-[#10b981]">
          {metrics.transactionCount.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-2">Total</div>
      </div>

      <div className="bg-white rounded-lg border border-green-200 p-6 hover:border-green-400 transition">
        <div className="text-sm font-semibold text-gray-600 mb-2">Active Wallets</div>
        <div className="text-3xl font-bold text-[#065f46]">
          {metrics.activeWallets.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-2">Participants</div>
      </div>

      <div className="bg-white rounded-lg border border-green-200 p-6 hover:border-green-400 transition">
        <div className="text-sm font-semibold text-gray-600 mb-2">Active Teams</div>
        <div className="text-3xl font-bold text-[#10b981]">{metrics.teamsActive}</div>
        <div className="text-xs text-gray-500 mt-2">Rugby clubs</div>
      </div>

      <div className="bg-white rounded-lg border border-green-200 p-6 hover:border-green-400 transition">
        <div className="text-sm font-semibold text-gray-600 mb-2">Active Players</div>
        <div className="text-3xl font-bold text-[#065f46]">{metrics.playersActive}</div>
        <div className="text-xs text-gray-500 mt-2">In ecosystem</div>
      </div>
    </div>
  );
}
