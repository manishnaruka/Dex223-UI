import { env } from "@/server/env";
import { prisma } from "@/server/lib/prisma";

// Referral links carry the referrer address in a `reference_address` query param off the
// app root, e.g. `https://app.dex223.io/?reference_address=0xabc...`. The param is captured
// into a cookie by middleware (see middleware.ts), then linked once SIWE completes.
export function buildReferralUrl(slug: string): string {
  const base = env.PUBLIC_REFERRAL_BASE_URL.replace(/\/+$/, "");
  return `${base}/?reference_address=${slug}`;
}

// Idempotent: returns the existing link or creates one. Slug is the lowercased
// wallet address, so URLs look like `${base}/0xabc...`.
export async function getOrCreateReferralLink(address: string): Promise<{
  slug: string;
  url: string;
}> {
  const slug = address.toLowerCase();
  await prisma.referralLink.upsert({
    where: { address: slug },
    create: { address: slug, slug },
    update: {},
  });
  return { slug, url: buildReferralUrl(slug) };
}

// Slug is the lowercased wallet address. Resolution still checks the link table so a
// referee can only join through a link that was actually minted by the referrer.
export async function resolveSlug(slug: string): Promise<string | null> {
  const link = await prisma.referralLink.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { address: true },
  });
  return link?.address ?? null;
}
