import { NextRequest, NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/server/lib/cors";
import { ApiError, withErrorHandler } from "@/server/lib/errors";
import { issueNonce } from "@/server/lib/siwe";
import { siweNonceSchema } from "@/server/lib/validation";

export const OPTIONS = corsPreflight;

export const POST = withCors(
  withErrorHandler(async (req: NextRequest) => {
    const body = await req.json().catch(() => {
      throw new ApiError(400, "Invalid JSON", "BAD_BODY");
    });
    const { address } = await siweNonceSchema.validate(body, { abortEarly: false });
    const nonce = await issueNonce(address);
    return NextResponse.json({ nonce });
  }),
);
