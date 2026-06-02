"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import type { Address } from "viem";
import { useAccount, useSignMessage } from "wagmi";

interface SessionResponse {
  address: string | null;
}

async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  return res.json();
}

async function requestNonce(address: Address): Promise<string> {
  const res = await fetch("/api/auth/siwe/nonce", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) throw new Error(`Failed to fetch nonce (${res.status})`);
  const data = (await res.json()) as { nonce: string };
  return data.nonce;
}

async function postVerify(args: { address: Address; message: string; signature: string }) {
  const res = await fetch("/api/auth/siwe/verify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `SIWE verify failed (${res.status})`);
  }
}

function siweDomain(): string {
  return typeof window === "undefined" ? "dex223.io" : window.location.host;
}

function buildSiweMessage(address: Address, nonce: string): string {
  return `${siweDomain()} wants you to sign in with your Ethereum account: ${address}\nNonce: ${nonce}`;
}

interface UseSiweSession {
  sessionAddress: string | null;
  isLoading: boolean;
  isSigningIn: boolean;
  error: Error | null;
  signIn: () => Promise<void>;
}

// Auto-prompts SIWE the first time a wallet connects without a server session.
// Idempotent: subsequent renders with the same address don't re-prompt.
export function useSiweSession(): UseSiweSession {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchSession,
    staleTime: 60_000,
  });

  const sessionAddress = session?.address ?? null;

  // Tracks "we already asked this address to sign" so a user rejection doesn't
  // cause an infinite re-prompt loop on every re-render.
  const attemptedFor = useRef<string | null>(null);
  const inFlight = useRef(false);
  const errorRef = useRef<Error | null>(null);

  const signIn = useCallback(async () => {
    if (!address || inFlight.current) return;
    inFlight.current = true;
    errorRef.current = null;
    try {
      const lower = address.toLowerCase() as Address;
      const nonce = await requestNonce(lower);
      const message = buildSiweMessage(lower, nonce);
      const signature = await signMessageAsync({ message });
      await postVerify({ address: lower, message, signature });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["referrals", "me"] });
    } catch (e) {
      errorRef.current = e instanceof Error ? e : new Error(String(e));
    } finally {
      inFlight.current = false;
    }
  }, [address, queryClient, signMessageAsync]);

  useEffect(() => {
    if (!isConnected || !address) return;
    const lower = address.toLowerCase();
    if (sessionAddress === lower) return; // already signed in
    if (sessionLoading) return; // still checking session
    if (attemptedFor.current === lower) return; // we already prompted this address
    attemptedFor.current = lower;
    void signIn();
  }, [address, isConnected, sessionAddress, sessionLoading, signIn]);

  // If the wallet address changes, clear the attempt guard so we re-prompt.
  useEffect(() => {
    if (!address) attemptedFor.current = null;
  }, [address]);

  return {
    sessionAddress,
    isLoading: sessionLoading,
    isSigningIn: inFlight.current,
    error: errorRef.current,
    signIn,
  };
}
