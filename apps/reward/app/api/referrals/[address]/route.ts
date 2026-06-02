import { NextRequest, NextResponse } from "next/server";

import { getViewerAddress } from "@/server/lib/auth";
import { ApiError, withErrorHandler } from "@/server/lib/errors";
import { prisma } from "@/server/lib/prisma";
import { addressSchema } from "@/server/lib/validation";
import { buildRefereeDetail } from "@/server/services/refereeDetailService";

export const GET = withErrorHandler(async (req: NextRequest, ctx) => {
  const viewer = await getViewerAddress(req);
  const { address: raw } = await ctx.params;
  const address = (await addressSchema.validate(raw)).toLowerCase();

  // Authorization: viewer must be the referrer of `address` OR `address` itself.
  if (viewer !== address) {
    const relation = await prisma.referralRelation.findUnique({
      where: { refereeAddress: address },
    });
    if (!relation || relation.referrerAddress !== viewer) {
      throw new ApiError(403, "Not authorized to view this referee", "FORBIDDEN");
    }
  }

  const detail = await buildRefereeDetail(address);
  return NextResponse.json(detail);
});
