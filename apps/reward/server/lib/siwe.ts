import crypto from "node:crypto";
import { verifyMessage } from "viem";

import { ApiError } from "@/server/lib/errors";
import { prisma } from "@/server/lib/prisma";

const NONCE_TTL_MS = 10 * 60 * 1000;

export function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function issueNonce(address: string): Promise<string> {
  const nonce = generateNonce();
  await prisma.siweNonce.create({
    data: {
      nonce,
      address: address.toLowerCase(),
      expiresAt: new Date(Date.now() + NONCE_TTL_MS),
    },
  });
  return nonce;
}

export function buildSiweMessage(domain: string, address: string, nonce: string): string {
  return `${domain} wants you to sign in with your Ethereum account: ${address}\nNonce: ${nonce}`;
}

interface VerifyArgs {
  address: string;
  message: string;
  signature: `0x${string}`;
}

// Verifies that:
//   1. The signature is valid for the given address against `message`
//   2. The nonce embedded in the message is one we issued, not expired, and for this address
// On success the nonce is deleted (single-use).
export async function verifySiwe({ address, message, signature }: VerifyArgs): Promise<void> {
  const lower = address.toLowerCase();
  const nonceMatch = /Nonce:\s*([a-f0-9]+)/i.exec(message);
  if (!nonceMatch) throw new ApiError(400, "Message missing Nonce field", "BAD_MESSAGE");
  const nonce = nonceMatch[1];

  const stored = await prisma.siweNonce.findUnique({ where: { nonce } });
  if (!stored) throw new ApiError(401, "Unknown nonce", "BAD_NONCE");
  if (stored.expiresAt.getTime() < Date.now()) {
    await prisma.siweNonce.delete({ where: { nonce } });
    throw new ApiError(401, "Nonce expired", "EXPIRED_NONCE");
  }
  if (stored.address && stored.address !== lower) {
    throw new ApiError(401, "Nonce/address mismatch", "BAD_NONCE");
  }

  const valid = await verifyMessage({
    address: lower as `0x${string}`,
    message,
    signature,
  });
  if (!valid) throw new ApiError(401, "Invalid signature", "BAD_SIGNATURE");

  await prisma.siweNonce.delete({ where: { nonce } });
}
