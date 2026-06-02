import { NextRequest, NextResponse } from "next/server";

import { getViewerAddress } from "@/server/lib/auth";
import { withErrorHandler } from "@/server/lib/errors";
import { buildReferralData } from "@/server/services/referralViewService";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const viewer = await getViewerAddress(req);
  const data = await buildReferralData({ viewer });
  return NextResponse.json(data);
});
