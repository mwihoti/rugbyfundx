import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { Transaction, Team, CommunityMetrics } from "@/types";
import { MpesaPending } from "../initiate/route";

interface DarajaCallbackItem {
  Name: string;
  Value?: string | number;
}

interface DarajaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: DarajaCallbackItem[];
      };
    };
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as DarajaCallback;
    const cb = body.Body?.stkCallback;
    if (!cb) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = cb;

    const pending = readStore<Record<string, MpesaPending>>("mpesa-pending.json", {});
    const entry = pending[CheckoutRequestID];

    if (!entry) {
      // Unknown request — still respond 200 so Daraja doesn't retry
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (ResultCode !== 0) {
      // Payment failed or cancelled by user
      pending[CheckoutRequestID].status = "failed";
      writeStore("mpesa-pending.json", pending);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Extract M-Pesa receipt and confirmed amount from metadata
    const items = CallbackMetadata?.Item ?? [];
    const mpesaRef = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value as string | undefined;
    const confirmedAmount = items.find((i) => i.Name === "Amount")?.Value as number | undefined;

    // Record confirmed transaction
    const transactions = readStore<Transaction[]>("transactions.json", []);
    const newTx: Transaction = {
      id: `mpesa-${Date.now()}`,
      walletAddress: entry.donorPhone ?? "mpesa",
      amount: entry.adaEquivalent,
      currency: "KES",
      kshAmount: confirmedAmount ?? entry.kshAmount,
      adaEquivalent: entry.adaEquivalent,
      exchangeRate: entry.exchangeRate,
      type: "mpesa",
      teamId: entry.teamId,
      teamName: entry.teamName,
      timestamp: new Date().toISOString(),
      txHash: mpesaRef ?? CheckoutRequestID,
      donorNote: entry.donorNote,
      donorPhone: entry.donorPhone,
      status: "confirmed",
    };
    transactions.unshift(newTx);
    writeStore("transactions.json", transactions);

    // Update team totalRaised with ADA equivalent
    const teams = readStore<Team[]>("teams.json", []);
    const idx = teams.findIndex((t) => t.id === entry.teamId);
    if (idx !== -1) {
      teams[idx].totalRaised += entry.adaEquivalent;
      writeStore("teams.json", teams);
    }

    // Update platform metrics
    const metrics = readStore<CommunityMetrics>("metrics.json", {
      totalValueLocked: 0,
      transactionCount: 0,
      activeWallets: 0,
      teamsActive: 10,
      playersActive: 210,
    });
    metrics.totalValueLocked += entry.adaEquivalent;
    metrics.transactionCount += 1;
    writeStore("metrics.json", metrics);

    // Mark as confirmed in pending (keeps brief history before cleanup)
    pending[CheckoutRequestID].status = "confirmed";
    pending[CheckoutRequestID].mpesaRef = mpesaRef;
    writeStore("mpesa-pending.json", pending);

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("[mpesa/callback]", err);
    // Always 200 — Daraja retries on non-200
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
