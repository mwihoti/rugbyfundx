import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { Team } from "@/types";

export async function GET() {
  const teams = readStore<Team[]>("teams.json", []);
  return NextResponse.json(teams);
}

export async function POST(req: Request) {
  const body = await req.json();
  const teams = readStore<Team[]>("teams.json", []);
  const newTeam: Team = {
    ...body,
    id: `team-${Date.now()}`,
    totalRaised: 0,
    milestones: [],
    walletAddress: body.walletAddress || "",
  };
  teams.push(newTeam);
  writeStore("teams.json", teams);
  return NextResponse.json(newTeam, { status: 201 });
}
