"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { clearPendingReferral, readPendingReferral } from "./pendingReferral";

// Links a referral captured from /r/{slug} once the viewer has a SIWE session.
// "New users only" is enforced server-side in joinReferrer — existing users (already
// linked, prior trade volume, or already a referrer) get a terminal 4xx, which we treat
// as resolved: clear the pending capture without surfacing an error. Only 5xx/network
// failures keep the cookie so a later mount can retry.
export function usePendingReferral(hasSession: boolean, address?: string) {
  const queryClient = useQueryClient();
  const inFlight = useRef(false);

  useEffect(() => {
    if (!hasSession || inFlight.current) return;
    const slug = readPendingReferral();
    if (!slug) return;
    if (address && slug.toLowerCase() === address.toLowerCase()) {
      clearPendingReferral(); // self-referral — nothing to link
      return;
    }

    inFlight.current = true;
    void (async () => {
      try {
        const res = await fetch("/api/referrals/join", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referrerSlug: slug }),
        });
        if (res.ok || (res.status >= 400 && res.status < 500)) {
          clearPendingReferral();
          if (res.ok) {
            await queryClient.invalidateQueries({ queryKey: ["referrals", "me"] });
          }
        }
      } finally {
        inFlight.current = false;
      }
    })();
  }, [hasSession, address, queryClient]);
}
