import { NextRequest, NextResponse } from "next/server";

import { env } from "@/server/env";

// apps/web (a different origin) calls a few of these routes directly to record a referral
// the moment a wallet connects there — see apps/web/hooks/useReferralBridge.ts. Credentialed
// cross-origin requests can't use a wildcard origin, so we echo the single allowed origin
// (WEB_APP_ORIGIN) and allow credentials so the SIWE session cookie round-trips.
function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.WEB_APP_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

type RouteContext = { params: Promise<Record<string, string>> };
type Handler<C extends RouteContext = RouteContext> = (
  req: NextRequest,
  ctx: C,
) => Promise<NextResponse>;

// Wraps a route handler so its response (success OR error) carries CORS headers. Compose
// outside withErrorHandler: `export const POST = withCors(withErrorHandler(async ...))`.
export function withCors<C extends RouteContext = RouteContext>(
  handler: Handler<C>,
): Handler<C> {
  return async (req, ctx) => {
    const res = await handler(req, ctx);
    for (const [key, value] of Object.entries(corsHeaders())) {
      res.headers.set(key, value);
    }
    return res;
  };
}

// Preflight responder for the OPTIONS method. Export as `export const OPTIONS = corsPreflight`.
export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
