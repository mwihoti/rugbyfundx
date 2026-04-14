import { NextResponse } from "next/server";

// In-memory cache — refreshed at most every 5 minutes
let cached: { rate: number; updatedAt: string } | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  const now = Date.now();
  if (cached && now - cacheTime < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    // CoinGecko free tier: ADA price in KES
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=kes",
      { next: { revalidate: 300 } }
    );

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json() as { cardano: { kes: number } };
    const rate = data.cardano.kes; // KES per 1 ADA

    cached = { rate, updatedAt: new Date().toISOString() };
    cacheTime = now;
    return NextResponse.json({ ...cached, cached: false });
  } catch {
    // Fallback: use a reasonable estimate if API fails
    const fallback = cached ?? { rate: 150, updatedAt: new Date().toISOString() };
    return NextResponse.json({ ...fallback, cached: true, fallback: true });
  }
}
