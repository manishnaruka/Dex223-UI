import { NextRequest, NextResponse } from "next/server";

import { getViewerAddress } from "@/server/lib/auth";
import { withErrorHandler } from "@/server/lib/errors";
import { getOrCreateReferralLink } from "@/server/services/referralLinkService";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const viewer = await getViewerAddress(req);
  const link = await getOrCreateReferralLink(viewer);
  return NextResponse.json(link);
});
