import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { AssistanceRequest } from "@/types";

export async function GET() {
  const requests = readStore<AssistanceRequest[]>("requests.json", []);
  return NextResponse.json(
    requests.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const requests = readStore<AssistanceRequest[]>("requests.json", []);

  const newRequest: AssistanceRequest = {
    id: `req-${Date.now()}`,
    teamName: body.teamName,
    location: body.location,
    contactName: body.contactName,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone || "",
    category: body.category,
    description: body.description,
    amountRequested: Number(body.amountRequested),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  requests.unshift(newRequest);
  writeStore("requests.json", requests);
  return NextResponse.json(newRequest, { status: 201 });
}
