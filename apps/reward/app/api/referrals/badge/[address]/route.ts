import { NextRequest, NextResponse } from "next/server";

import { withErrorHandler } from "@/server/lib/errors";
import { addressSchema } from "@/server/lib/validation";
import { buildPublicBadge } from "@/server/services/refereeDetailService";

// Public per spec 7.4 — badges are permanently shown to the referee, so anyone
// can read them by address.
export const GET = withErrorHandler(async (_req: NextRequest, ctx) => {
  const { address: raw } = await ctx.params;
  const address = (await addressSchema.validate(raw)).toLowerCase();
  const payload = await buildPublicBadge(address);
  return NextResponse.json(payload);
});
