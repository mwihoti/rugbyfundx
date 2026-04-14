import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { Team } from "@/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teams = readStore<Team[]>("teams.json", []);
  const team = teams.find((t) => t.id === id);
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(team);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const teams = readStore<Team[]>("teams.json", []);
  const idx = teams.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  teams[idx] = { ...teams[idx], ...body };
  writeStore("teams.json", teams);
  return NextResponse.json(teams[idx]);
}
