import { NextRequest, NextResponse } from "next/server";

import { getViewerAddress } from "@/server/lib/auth";
import { corsPreflight, withCors } from "@/server/lib/cors";
import { ApiError, withErrorHandler } from "@/server/lib/errors";
import { joinBodySchema } from "@/server/lib/validation";
import { joinReferrer } from "@/server/services/referralJoinService";

export const OPTIONS = corsPreflight;

export const POST = withCors(
  withErrorHandler(async (req: NextRequest) => {
    const viewer = await getViewerAddress(req);
    const body = await req.json().catch(() => {
      throw new ApiError(400, "Invalid JSON", "BAD_BODY");
    });
    const { referrerSlug } = await joinBodySchema.validate(body, { abortEarly: false });
    const relation = await joinReferrer({ referee: viewer, referrerSlug });
    return NextResponse.json({
      refereeAddress: relation.refereeAddress,
      referrerAddress: relation.referrerAddress,
      joinedAt: relation.joinedAt.getTime(),
    });
  }),
);
