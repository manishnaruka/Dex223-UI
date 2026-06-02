import { NextRequest, NextResponse } from "next/server";

import { env } from "@/server/env";
import { ApiError, withErrorHandler } from "@/server/lib/errors";
import { prisma } from "@/server/lib/prisma";
import { finalizeEpoch } from "@/server/services/referralRewardService";
import { MockVolumeSource } from "@/server/services/volumeSource";

// POST /api/cron/finalize-epoch
//   Body: { epochId?: number }    — defaults to the most recently OPEN epoch.
//   Header: Authorization: Bearer <CRON_SECRET>
// Spec §7: closes the epoch, pulls volumes from the configured VolumeSource,
// applies caps + decay, writes ReferralReward rows, recomputes badges.
export const POST = withErrorHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    throw new ApiError(401, "Bad cron token", "BAD_CRON_TOKEN");
  }

  const body = await req.json().catch(() => ({}));
  let epochId: number | undefined = body?.epochId;
  if (!epochId) {
    const open = await prisma.epoch.findFirst({
      where: { status: "OPEN" },
      orderBy: [{ season: { index: "asc" } }, { index: "asc" }],
    });
    if (!open) throw new ApiError(404, "No open epoch to finalize", "NO_OPEN_EPOCH");
    epochId = open.id;
  }

  // TODO(real-volume-source): wire up the cross-chain subgraph adapter (spec §1).
  // Until then, finalize uses any RefereeVolumeSnapshot rows already present
  // (e.g. from prisma/seed.ts) via the MockVolumeSource backed by the DB.
  const volumeSource = await loadDbBackedVolumeSource(epochId);

  const result = await finalizeEpoch({ epochId, volumeSource });
  return NextResponse.json({ epochId, ...result });
});

// Reads any existing RefereeVolumeSnapshot rows for the epoch into an in-memory
// MockVolumeSource so finalizeEpoch is deterministic against seeded fixtures.
async function loadDbBackedVolumeSource(epochId: number) {
  const snaps = await prisma.refereeVolumeSnapshot.findMany({ where: { epochId } });
  const src = new MockVolumeSource();
  for (const s of snaps) {
    src.setVolume(s.refereeAddress, epochId, { ethereum: Number(s.volumeUsd) });
  }
  return src;
}
