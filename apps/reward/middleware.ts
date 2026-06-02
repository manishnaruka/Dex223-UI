import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { PENDING_REFERRAL_COOKIE, PENDING_REFERRAL_TTL_S } from "./hooks/pendingReferral";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Derive the request type from next-intl's middleware so we stay aligned with whichever
// `next` copy it resolves (the monorepo has more than one).
type MiddlewareRequest = Parameters<typeof intlMiddleware>[0];

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

function setPendingReferralCookie(res: NextResponse, referrer: string): void {
  res.cookies.set(PENDING_REFERRAL_COOKIE, referrer, {
    httpOnly: false, // read client-side to drive the join call
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_REFERRAL_TTL_S,
  });
}

// Referral links land on the app root with `?reference_address=0xabc...`. When a valid
// referrer address is present we stash it in a browser-readable cookie and send the referee
// to the referrals page, where SIWE sign-in (useSiweSession) and the join call
// (usePendingReferral) already run — so the referee gets linked the moment they connect,
// no matter that the link pointed at the root. The cookie outlives the redirect, so the
// address survives even though the query param is dropped.
export default function middleware(req: MiddlewareRequest) {
  const ref = req.nextUrl.searchParams.get("reference_address");
  const referrer = ref && ADDRESS_RE.test(ref) ? ref.toLowerCase() : null;

  if (referrer) {
    // Build the redirect from the Host the client actually used, not req.nextUrl.origin —
    // the dev server binds to 0.0.0.0, which browsers can't navigate to.
    const host = req.headers.get("host") ?? req.nextUrl.host;
    const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
    const res = NextResponse.redirect(new URL("/referrals", `${proto}://${host}`));
    setPendingReferralCookie(res, referrer);
    return res;
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(es|en|zh)/:path*",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`). `r/` is excluded so the referral
    // landing route handler (app/r/[slug]) runs without being locale-rewritten.
    "/((?!_next|_vercel|favicon.ico|images|robots.txt|sitemap.xml|static|api|r/).*)",
  ],
};
