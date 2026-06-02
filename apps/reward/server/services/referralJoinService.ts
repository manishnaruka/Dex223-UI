import { ApiError } from "@/server/lib/errors";
import { prisma } from "@/server/lib/prisma";

import { getCurrentEpoch } from "./epochStateService";
import { resolveSlug } from "./referralLinkService";

interface JoinArgs {
  referee: string;
  referrerSlug: string;
}

// Records the referee → referrer relation. Referrals are for NEW users at signup only;
// existing users may not retroactively apply one. Guardrails (spec 7, anti-sybil):
//   - rejects self-referral
//   - rejects if referee already has a referrer
//   - rejects if referee already operates as a referrer (an established account)
//   - rejects if referee already has any volume snapshot (i.e. not a new wallet)
export async function joinReferrer({ referee, referrerSlug }: JoinArgs) {
  const refereeLower = referee.toLowerCase();
  const referrer = await resolveSlug(referrerSlug);
  if (!referrer) throw new ApiError(404, "Referral link not found", "BAD_SLUG");
  if (referrer === refereeLower) throw new ApiError(400, "Self-referral not allowed", "SELF_REFERRAL");

  const existing = await prisma.referralRelation.findUnique({
    where: { refereeAddress: refereeLower },
  });
  if (existing) throw new ApiError(409, "Already linked to a referrer", "ALREADY_LINKED");

  const isReferrer = await prisma.referralRelation.findFirst({
    where: { referrerAddress: refereeLower },
  });
  if (isReferrer) {
    throw new ApiError(409, "Existing users cannot apply a referral", "NOT_NEW_WALLET");
  }

  const hasPriorVolume = await prisma.refereeVolumeSnapshot.findFirst({
    where: { refereeAddress: refereeLower },
  });
  if (hasPriorVolume) {
    throw new ApiError(409, "Address has prior trade activity", "NOT_NEW_WALLET");
  }

  const { epoch } = await getCurrentEpoch();
  return prisma.referralRelation.create({
    data: {
      referrerAddress: referrer,
      refereeAddress: refereeLower,
      joinedEpochId: epoch.id,
    },
  });
}
