import { NextRequest, NextResponse } from "next/server";

import { PENDING_REFERRAL_COOKIE, PENDING_REFERRAL_TTL_S } from "@/hooks/pendingReferral";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

// Referral links look like `${PUBLIC_REFERRAL_BASE_URL}/${slug}` (e.g. dex223.io/r/0xabc…).
// A wallet landing here has its referrer captured into a cookie, then is redirected into
// the app. The referee→referrer relation is recorded once the wallet completes SIWE — see
// usePendingReferral, which POSTs to /api/referrals/join. New-user enforcement lives there.
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  // Build the redirect from the Host the client actually used, not req.nextUrl.origin —
  // the dev server binds to 0.0.0.0, which browsers can't navigate to.
  const host = req.headers.get("host") ?? req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const res = NextResponse.redirect(new URL("/referrals", `${proto}://${host}`));

  if (ADDRESS_RE.test(slug)) {
    res.cookies.set(PENDING_REFERRAL_COOKIE, slug.toLowerCase(), {
      httpOnly: false, // read client-side to drive the join call
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PENDING_REFERRAL_TTL_S,
    });
  }
  return res;
}
