import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { env } from "@/server/env";
import { ApiError } from "@/server/lib/errors";

export const SESSION_COOKIE = "dex223_session";
const SESSION_TTL_S = 7 * 24 * 60 * 60;

interface SessionPayload {
  address: string;
  exp: number;
}

export function signSession(address: string): string {
  return jwt.sign({ address: address.toLowerCase() }, env.SESSION_SECRET, {
    expiresIn: SESSION_TTL_S,
  });
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_S,
  };
}

export async function getViewerAddress(req?: NextRequest): Promise<string> {
  const token =
    req?.cookies.get(SESSION_COOKIE)?.value ?? (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) throw new ApiError(401, "Not authenticated", "NO_SESSION");
  try {
    const decoded = jwt.verify(token, env.SESSION_SECRET) as SessionPayload;
    if (!decoded.address) throw new Error("missing address");
    return decoded.address.toLowerCase();
  } catch {
    throw new ApiError(401, "Invalid session", "BAD_SESSION");
  }
}
