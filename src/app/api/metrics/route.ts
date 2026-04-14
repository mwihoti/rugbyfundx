import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import { CommunityMetrics } from "@/types";

export async function GET() {
  const metrics = readStore<CommunityMetrics>("metrics.json", {
    totalValueLocked: 8580,
    transactionCount: 142,
    activeWallets: 87,
    teamsActive: 10,
    playersActive: 210,
  });
  return NextResponse.json(metrics);
}
