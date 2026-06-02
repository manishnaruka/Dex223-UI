import { NextRequest, NextResponse } from "next/server";

import { sessionCookieOptions, SESSION_COOKIE, signSession } from "@/server/lib/auth";
import { corsPreflight, withCors } from "@/server/lib/cors";
import { ApiError, withErrorHandler } from "@/server/lib/errors";
import { verifySiwe } from "@/server/lib/siwe";
import { siweVerifySchema } from "@/server/lib/validation";

export const OPTIONS = corsPreflight;

export const POST = withCors(
  withErrorHandler(async (req: NextRequest) => {
    const body = await req.json().catch(() => {
      throw new ApiError(400, "Invalid JSON", "BAD_BODY");
    });
    const parsed = await siweVerifySchema.validate(body, { abortEarly: false });

    await verifySiwe({
      address: parsed.address,
      message: parsed.message,
      signature: parsed.signature as `0x${string}`,
    });

    const token = signSession(parsed.address);
    const res = NextResponse.json({ address: parsed.address.toLowerCase() });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  }),
);
