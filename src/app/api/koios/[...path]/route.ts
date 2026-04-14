import { NextRequest, NextResponse } from "next/server";

// Proxy Koios API calls from the browser to avoid CORS issues.
// The KoiosProvider sends Access-Control-Allow-Origin only on OPTIONS (preflight)
// but not on actual POST responses, so browser requests are blocked.
// This proxy route sits on the same origin as the app.

const NETWORK = process.env.NEXT_PUBLIC_NETWORK ?? "preprod";
const KOIOS_BASE =
  NETWORK === "mainnet"
    ? "https://api.koios.rest/api/v1"
    : "https://preprod.koios.rest/api/v1";

async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  const endpoint = path.join("/");
  const { search } = new URL(req.url);
  const targetUrl = `${KOIOS_BASE}/${endpoint}${search}`;

  const contentType = req.headers.get("content-type") ?? "application/json";
  const isGet = req.method === "GET" || req.method === "HEAD";
  const body = isGet ? undefined : Buffer.from(await req.arrayBuffer());

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: { "Content-Type": contentType },
      body,
    });

    const responseBuffer = await upstream.arrayBuffer();
    const upstreamContentType =
      upstream.headers.get("content-type") ?? "application/json";

    return new NextResponse(responseBuffer, {
      status: upstream.status,
      headers: { "Content-Type": upstreamContentType },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Koios proxy error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path);
}
