import { NextRequest, NextResponse } from "next/server";

import { EPOCHS_PER_SEASON } from "@/server/lib/epoch";
import { withErrorHandler } from "@/server/lib/errors";
import { getCurrentEpoch } from "@/server/services/epochStateService";

export const GET = withErrorHandler(async (_req: NextRequest) => {
  const { coords } = await getCurrentEpoch();
  return NextResponse.json({
    season: coords.seasonIndex,
    epochCurrent: coords.epochIndex,
    epochTotal: EPOCHS_PER_SEASON,
    epochStartsAt: coords.epochStartsAt.getTime(),
    epochEndsAt: coords.epochEndsAt.getTime(),
    seasonStartsAt: coords.seasonStartsAt.getTime(),
    seasonEndsAt: coords.seasonEndsAt.getTime(),
  });
});
