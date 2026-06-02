// Shared between middleware (which captures `?reference_address` server-side) and
// usePendingReferral (client). The value is a referrer wallet address. It is stored in a
// browser-readable cookie so the client can POST it to /api/referrals/join once the SIWE
// session exists. Not sensitive — a referrer address is public by design.
export const PENDING_REFERRAL_COOKIE = "dex223_pending_ref";
export const PENDING_REFERRAL_TTL_S = 60 * 60 * 24; // 24h: survive connect + SIWE signing

export function readPendingReferral(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${PENDING_REFERRAL_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.slice(PENDING_REFERRAL_COOKIE.length + 1));
  return value || null;
}

export function clearPendingReferral(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${PENDING_REFERRAL_COOKIE}=; path=/; max-age=0`;
}
