import { NextRequest, NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

// Next.js 15 hands handlers an async params bag: `{ params: Promise<...> }`.
// We keep the type loose here so individual routes can declare their own
// param shapes via the second argument.
type RouteContext = { params: Promise<Record<string, string>> };
type Handler<C extends RouteContext = RouteContext> = (
  req: NextRequest,
  ctx: C,
) => Promise<NextResponse>;

export function withErrorHandler<C extends RouteContext = RouteContext>(
  handler: Handler<C>,
): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) {
        return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
      }
      console.error("[api]", e);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  };
}
