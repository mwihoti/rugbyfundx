import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { Transaction, Team, CommunityMetrics } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const transactions = readStore<Transaction[]>("transactions.json", []);
  const result = teamId
    ? transactions.filter((t) => t.teamId === teamId)
    : transactions;
  return NextResponse.json(
    result.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const transactions = readStore<Transaction[]>("transactions.json", []);

  // Resolve teamName from teamId if not provided
  let teamName = body.teamName || "";
  if (!teamName && body.teamId) {
    const teams = readStore<Team[]>("teams.json", []);
    const team = teams.find((t) => t.id === body.teamId);
    if (team) teamName = team.name;
  }

  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    walletAddress: body.walletAddress || "unknown",
    amount: body.amount,
    type: body.type || "donation",
    teamId: body.teamId,
    teamName,
    timestamp: new Date().toISOString(),
    txHash: body.txHash,
    donorNote: body.donorNote || undefined,
  };

  transactions.unshift(newTx);
  writeStore("transactions.json", transactions);

  // Update team totalRaised and platform metrics on donations
  if (body.type === "donation" || !body.type) {
    const teams = readStore<Team[]>("teams.json", []);
    const idx = teams.findIndex((t) => t.id === body.teamId);
    if (idx !== -1) {
      teams[idx].totalRaised += body.amount;
      writeStore("teams.json", teams);
    }
    const metrics = readStore<CommunityMetrics>("metrics.json", {
      totalValueLocked: 0,
      transactionCount: 0,
      activeWallets: 0,
      teamsActive: 10,
      playersActive: 210,
    });
    metrics.totalValueLocked += body.amount;
    metrics.transactionCount += 1;
    writeStore("metrics.json", metrics);
  }

  return NextResponse.json(newTx, { status: 201 });
}
