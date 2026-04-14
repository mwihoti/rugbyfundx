import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { Transaction, Team, CommunityMetrics } from "@/types";
import { MpesaPending } from "../../initiate/route";

const DARAJA_BASE =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const SHORTCODE = process.env.MPESA_BUSINESS_SHORTCODE ?? "174379";
const PASSKEY =
  process.env.MPESA_PASSKEY ??
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

function getTimestamp(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
}

async function queryDaraja(checkoutRequestId: string): Promise<"confirmed" | "failed" | "pending"> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) return "pending";

  try {
    const credentials = Buffer.from(`${key}:${secret}`).toString("base64");
    const tokenRes = await fetch(
      `${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${credentials}` } }
    );
    if (!tokenRes.ok) return "pending";
    const { access_token } = await tokenRes.json() as { access_token: string };

    const timestamp = getTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

    const queryRes = await fetch(`${DARAJA_BASE}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    });

    if (!queryRes.ok) return "pending";
    const data = await queryRes.json() as { ResultCode?: string | number };
    const code = String(data.ResultCode ?? "");
    if (code === "0") return "confirmed";
    if (code === "1032") return "failed"; // cancelled by user
    if (code === "1037") return "pending"; // still pending/timeout
    return code ? "failed" : "pending";
  } catch {
    return "pending";
  }
}

function confirmEntry(
  pending: Record<string, MpesaPending>,
  entry: MpesaPending,
  checkoutRequestId: string,
  mpesaRef?: string
) {
  const transactions = readStore<Transaction[]>("transactions.json", []);
  const alreadyRecorded = transactions.some((t) => t.txHash === (mpesaRef ?? checkoutRequestId));
  if (!alreadyRecorded) {
    const newTx: Transaction = {
      id: `mpesa-${Date.now()}`,
      walletAddress: entry.donorPhone ?? "mpesa",
      amount: entry.adaEquivalent,
      currency: "KES",
      kshAmount: entry.kshAmount,
      adaEquivalent: entry.adaEquivalent,
      exchangeRate: entry.exchangeRate,
      type: "mpesa",
      teamId: entry.teamId,
      teamName: entry.teamName,
      timestamp: new Date().toISOString(),
      txHash: mpesaRef ?? checkoutRequestId,
      donorNote: entry.donorNote,
      donorPhone: entry.donorPhone,
      status: "confirmed",
    };
    transactions.unshift(newTx);
    writeStore("transactions.json", transactions);

    const teams = readStore<Team[]>("teams.json", []);
    const idx = teams.findIndex((t) => t.id === entry.teamId);
    if (idx !== -1) { teams[idx].totalRaised += entry.adaEquivalent; writeStore("teams.json", teams); }

    const metrics = readStore<CommunityMetrics>("metrics.json", {
      totalValueLocked: 0, transactionCount: 0, activeWallets: 0, teamsActive: 10, playersActive: 210,
    });
    metrics.totalValueLocked += entry.adaEquivalent;
    metrics.transactionCount += 1;
    writeStore("metrics.json", metrics);
  }

  pending[checkoutRequestId].status = "confirmed";
  if (mpesaRef) pending[checkoutRequestId].mpesaRef = mpesaRef;
  writeStore("mpesa-pending.json", pending);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ checkoutRequestId: string }> }
) {
  const { checkoutRequestId } = await params;
  const pending = readStore<Record<string, MpesaPending>>("mpesa-pending.json", {});
  const entry = pending[checkoutRequestId];

  if (!entry) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  // If still pending and real credentials available, query Daraja directly as fallback
  if (entry.status === "pending" && !checkoutRequestId.startsWith("dev-")) {
    const darajaStatus = await queryDaraja(checkoutRequestId);
    if (darajaStatus === "confirmed") {
      confirmEntry(pending, entry, checkoutRequestId);
      return NextResponse.json({
        status: "confirmed",
        mpesaRef: entry.mpesaRef ?? checkoutRequestId,
        adaEquivalent: entry.adaEquivalent,
        kshAmount: entry.kshAmount,
        teamName: entry.teamName,
      });
    } else if (darajaStatus === "failed") {
      pending[checkoutRequestId].status = "failed";
      writeStore("mpesa-pending.json", pending);
    }
  }

  return NextResponse.json({
    status: entry.status,
    mpesaRef: entry.mpesaRef,
    adaEquivalent: entry.adaEquivalent,
    kshAmount: entry.kshAmount,
    teamName: entry.teamName,
  });
}

// Dev-only: manually confirm a pending payment (simulates Daraja callback)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ checkoutRequestId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { checkoutRequestId } = await params;
  const pending = readStore<Record<string, MpesaPending>>("mpesa-pending.json", {});
  const entry = pending[checkoutRequestId];

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.status !== "pending") {
    return NextResponse.json({ error: `Already ${entry.status}` }, { status: 400 });
  }

  const fakeRef = `SIM${Date.now().toString().slice(-8)}`;

  const transactions = readStore<Transaction[]>("transactions.json", []);
  const newTx: Transaction = {
    id: `mpesa-${Date.now()}`,
    walletAddress: entry.donorPhone ?? "mpesa",
    amount: entry.adaEquivalent,
    currency: "KES",
    kshAmount: entry.kshAmount,
    adaEquivalent: entry.adaEquivalent,
    exchangeRate: entry.exchangeRate,
    type: "mpesa",
    teamId: entry.teamId,
    teamName: entry.teamName,
    timestamp: new Date().toISOString(),
    txHash: fakeRef,
    donorNote: entry.donorNote,
    donorPhone: entry.donorPhone,
    status: "confirmed",
  };
  transactions.unshift(newTx);
  writeStore("transactions.json", transactions);

  const teams = readStore<Team[]>("teams.json", []);
  const idx = teams.findIndex((t) => t.id === entry.teamId);
  if (idx !== -1) {
    teams[idx].totalRaised += entry.adaEquivalent;
    writeStore("teams.json", teams);
  }

  const metrics = readStore<CommunityMetrics>("metrics.json", {
    totalValueLocked: 0, transactionCount: 0, activeWallets: 0, teamsActive: 10, playersActive: 210,
  });
  metrics.totalValueLocked += entry.adaEquivalent;
  metrics.transactionCount += 1;
  writeStore("metrics.json", metrics);

  pending[checkoutRequestId].status = "confirmed";
  pending[checkoutRequestId].mpesaRef = fakeRef;
  writeStore("mpesa-pending.json", pending);

  return NextResponse.json({ status: "confirmed", mpesaRef: fakeRef, adaEquivalent: entry.adaEquivalent });
}
