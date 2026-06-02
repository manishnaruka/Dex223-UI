import { NextRequest, NextResponse } from "next/server";

import { getViewerAddress } from "@/server/lib/auth";

// Cheap session probe used by the client to decide whether to start SIWE.
// Returns { address } on a valid session, or { address: null } when there
// isn't one (never 401 — the client checks the JSON, not the HTTP code).
export async function GET(req: NextRequest) {
  try {
    const address = await getViewerAddress(req);
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ address: null });
  }
}
