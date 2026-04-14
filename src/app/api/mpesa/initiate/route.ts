import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { Team } from "@/types";

const DARAJA_BASE =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const SHORTCODE = process.env.MPESA_BUSINESS_SHORTCODE ?? "174379";
const PASSKEY =
  process.env.MPESA_PASSKEY ??
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

export interface MpesaPending {
  checkoutRequestId: string;
  merchantRequestId: string;
  teamId: string;
  teamName: string;
  kshAmount: number;
  adaEquivalent: number;
  exchangeRate: number;
  donorPhone: string;
  donorNote?: string;
  status: "pending" | "confirmed" | "failed";
  initiatedAt: string;
  mpesaRef?: string;
}

async function getDarajaToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("M-Pesa credentials not configured");

  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(
    `${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  if (!res.ok) throw new Error(`Daraja auth failed: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
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

function maskPhone(phone: string): string {
  // 254708374149 → 2547****4149
  return phone.slice(0, 4) + "****" + phone.slice(-4);
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return "254" + digits.slice(1);
  if (digits.startsWith("7") && digits.length === 9) return "254" + digits;
  if (digits.startsWith("1") && digits.length === 9) return "254" + digits;
  if (digits.startsWith("254") && digits.length === 12) return digits;
  throw new Error("Invalid Kenyan phone number. Use format: 07XXXXXXXX or 2547XXXXXXXX");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kshAmount, phone, teamId, donorNote, exchangeRate } = body as {
      kshAmount: number;
      phone: string;
      teamId: string;
      donorNote?: string;
      exchangeRate: number;
    };

    // Validate
    if (!kshAmount || kshAmount < 10) {
      return NextResponse.json({ error: "Minimum donation is KSH 10" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    if (!exchangeRate || exchangeRate <= 0) {
      return NextResponse.json({ error: "Invalid exchange rate" }, { status: 400 });
    }

    // Resolve team name
    const teams = readStore<Team[]>("teams.json", []);
    const team = teams.find((t) => t.id === teamId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhone(phone);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }

    const adaEquivalent = Math.round((kshAmount / exchangeRate) * 100) / 100;
    const timestamp = getTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");
    const callbackUrl = `${process.env.MPESA_CALLBACK_URL ?? process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`;

    // Check if M-Pesa is configured
    const isConfigured = !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);

    if (!isConfigured) {
      // Dev mode: simulate a pending payment without hitting Daraja
      const fakeCheckoutId = `dev-${Date.now()}`;
      const pending = readStore<Record<string, MpesaPending>>("mpesa-pending.json", {});
      pending[fakeCheckoutId] = {
        checkoutRequestId: fakeCheckoutId,
        merchantRequestId: `dev-merchant-${Date.now()}`,
        teamId,
        teamName: team.name,
        kshAmount,
        adaEquivalent,
        exchangeRate,
        donorPhone: maskPhone(normalizedPhone),
        donorNote,
        status: "pending",
        initiatedAt: new Date().toISOString(),
      };
      writeStore("mpesa-pending.json", pending);
      return NextResponse.json({
        checkoutRequestId: fakeCheckoutId,
        adaEquivalent,
        exchangeRate,
        devMode: true,
        message: "Dev mode: M-Pesa credentials not set. Use /api/mpesa/simulate-confirm to confirm.",
      });
    }

    // Production / sandbox flow
    const token = await getDarajaToken();
    const stkBody = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(kshAmount),
      PartyA: normalizedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `RFX-${team.name.replace(/\s+/g, "").slice(0, 12)}`,
      TransactionDesc: `RugbyFundX: ${team.name}`.slice(0, 30),
    };

    const stkRes = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkBody),
    });

    const stkData = await stkRes.json() as {
      ResponseCode: string;
      ResponseDescription: string;
      MerchantRequestID: string;
      CheckoutRequestID: string;
    };

    if (stkData.ResponseCode !== "0") {
      return NextResponse.json(
        { error: stkData.ResponseDescription ?? "STK Push failed" },
        { status: 400 }
      );
    }

    // Store pending
    const pending = readStore<Record<string, MpesaPending>>("mpesa-pending.json", {});
    pending[stkData.CheckoutRequestID] = {
      checkoutRequestId: stkData.CheckoutRequestID,
      merchantRequestId: stkData.MerchantRequestID,
      teamId,
      teamName: team.name,
      kshAmount,
      adaEquivalent,
      exchangeRate,
      donorPhone: maskPhone(normalizedPhone),
      donorNote,
      status: "pending",
      initiatedAt: new Date().toISOString(),
    };
    writeStore("mpesa-pending.json", pending);

    return NextResponse.json({
      checkoutRequestId: stkData.CheckoutRequestID,
      adaEquivalent,
      exchangeRate,
    });
  } catch (err) {
    console.error("[mpesa/initiate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to initiate M-Pesa payment" },
      { status: 500 }
    );
  }
}
