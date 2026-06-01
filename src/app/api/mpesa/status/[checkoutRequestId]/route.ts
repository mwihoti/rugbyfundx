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

type PaymentStatus = "confirmed" | "failed" | "pending";

interface DarajaQueryStatus {
  status: PaymentStatus;
  resultCode?: string;
  resultDesc?: string;
}

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

async function queryDaraja(checkoutRequestId: string): Promise<DarajaQueryStatus> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) return { status: "pending" };

  try {
    const credentials = Buffer.from(`${key}:${secret}`).toString("base64");
    const tokenRes = await fetch(
      `${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${credentials}` } }
    );
    if (!tokenRes.ok) return { status: "pending", resultDesc: `Daraja auth failed: ${tokenRes.status}` };
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

    if (!queryRes.ok) return { status: "pending", resultDesc: `Daraja query failed: ${queryRes.status}` };
    const data = await queryRes.json() as {
      ResultCode?: string | number;
      ResultDesc?: string;
      errorCode?: string;
      errorMessage?: string;
    };
    const code = String(data.ResultCode ?? "");
    const resultDesc = data.ResultDesc ?? data.errorMessage;
    if (code === "0") return { status: "confirmed", resultCode: code, resultDesc: resultDesc ?? "Payment confirmed" };

    // These are terminal STK states. Unknown responses are left pending so the
    // callback still has a chance to settle the request instead of racing it.
    const terminalFailures = new Set(["1", "1019", "1032", "1036", "1037", "2001"]);
    if (terminalFailures.has(code)) {
      return { status: "failed", resultCode: code, resultDesc: resultDesc ?? "M-Pesa payment failed" };
    }

    return { status: "pending", resultCode: code || data.errorCode, resultDesc };
  } catch {
    return { status: "pending" };
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
  pending[checkoutRequestId].resultCode = "0";
  pending[checkoutRequestId].resultDesc = "Payment confirmed";
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

  // Query Daraja while pending. Also re-check legacy failed rows that do not
  // have a result code, because older code collapsed unknown responses to failed.
  const shouldQueryDaraja =
    !checkoutRequestId.startsWith("dev-") &&
    (entry.status === "pending" || (entry.status === "failed" && !entry.resultCode));

  if (shouldQueryDaraja) {
    const darajaStatus = await queryDaraja(checkoutRequestId);
    if (darajaStatus.status === "confirmed") {
      confirmEntry(pending, entry, checkoutRequestId);
      return NextResponse.json({
        status: "confirmed",
        mpesaRef: entry.mpesaRef ?? checkoutRequestId,
        adaEquivalent: entry.adaEquivalent,
        kshAmount: entry.kshAmount,
        teamName: entry.teamName,
        resultCode: darajaStatus.resultCode,
        resultDesc: darajaStatus.resultDesc,
      });
    } else if (darajaStatus.status === "failed") {
      pending[checkoutRequestId].status = "failed";
      pending[checkoutRequestId].resultCode = darajaStatus.resultCode;
      pending[checkoutRequestId].resultDesc = darajaStatus.resultDesc;
      writeStore("mpesa-pending.json", pending);
      entry.status = "failed";
      entry.resultCode = darajaStatus.resultCode;
      entry.resultDesc = darajaStatus.resultDesc;
    }
  }

  return NextResponse.json({
    status: entry.status,
    mpesaRef: entry.mpesaRef,
    adaEquivalent: entry.adaEquivalent,
    kshAmount: entry.kshAmount,
    teamName: entry.teamName,
    resultCode: entry.resultCode,
    resultDesc: entry.resultDesc,
  });
}

// Dev-only: manually confirm a pending payment (simulates Daraja callback)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ checkoutRequestId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { checkoutRequestId } = await params;
  const pending = readStore<Record<string, MpesaPending>>("mpesa-pending.json", {});
  const entry = pending[checkoutRequestId];

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.status !== "pending" && !(entry.status === "failed" && !entry.resultCode)) {
    return NextResponse.json({ error: `Already ${entry.status}` }, { status: 400 });
  }

  let mpesaRef = `SIM${Date.now().toString().slice(-8)}`;
  try {
    const body = await req.json() as { mpesaRef?: string };
    if (body.mpesaRef?.trim()) mpesaRef = body.mpesaRef.trim().toUpperCase();
  } catch {
    // Body is optional; no-op when absent.
  }

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
    txHash: mpesaRef,
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
  pending[checkoutRequestId].mpesaRef = mpesaRef;
  pending[checkoutRequestId].resultCode = "0";
  pending[checkoutRequestId].resultDesc = "Dev payment confirmed";
  writeStore("mpesa-pending.json", pending);

  return NextResponse.json({ status: "confirmed", mpesaRef, adaEquivalent: entry.adaEquivalent });
}
