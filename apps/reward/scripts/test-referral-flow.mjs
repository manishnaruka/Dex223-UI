// Manual end-to-end test of the referral signup flow against a running dev server.
// No browser wallet needed: SIWE is driven with ephemeral viem keys.
//
//   1. start the app:   corepack yarn dev      (or: node_modules/.bin/next dev -p 3003)
//   2. run the flow:    node scripts/test-referral-flow.mjs
//   3. add a referee:   node scripts/test-referral-flow.mjs add <referrerAddress> [refereeAddress]
//                       (refereeAddress defaults to 0x0000…0000 — handy for UI testing,
//                        since a fixed address has no key to sign SIWE with)
//   4. wipe test rows:  node scripts/test-referral-flow.mjs clean
//
// The flow run self-cleans by default: the random addresses it creates are deleted
// afterwards so they don't pile up in the referees list. Pass KEEP=1 to retain them
// (e.g. to inspect the UI), then remove them later with the `clean` command.
//
// It exercises: landing capture (/r/{slug}) -> SIWE sign-in -> join ->
// new-user enforcement (re-join blocked, existing-referrer blocked) -> referrer sees referee.
import fs from "node:fs";

import { PrismaClient } from "@prisma/client";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const BASE = process.env.BASE_URL ?? "http://localhost:3003";

// Load .env so the Prisma cleanup can reach the DB (this script runs under plain node,
// which — unlike Next — does not auto-load .env).
for (const line of fs.readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i > 0 && process.env[t.slice(0, i).trim()] === undefined) {
    process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

const prisma = new PrismaClient();

function cookieValue(setCookie, name) {
  if (!setCookie) return null;
  const m = new RegExp(`${name}=([^;]*)`).exec(setCookie);
  return m ? `${name}=${m[1]}` : null;
}

async function landingCapture(referrer) {
  const res = await fetch(`${BASE}/r/${referrer}`, { redirect: "manual" });
  const pending = cookieValue(res.headers.get("set-cookie"), "dex223_pending_ref");
  console.log(`  /r/${referrer.slice(0, 10)}… -> ${res.status} ${res.headers.get("location") ?? ""}`);
  console.log(`  captured cookie: ${pending}`);
}

// Full SIWE handshake; returns the session cookie string.
async function signIn(account) {
  const address = account.address.toLowerCase();
  const nonceRes = await fetch(`${BASE}/api/auth/siwe/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  const { nonce } = await nonceRes.json();
  const message = `${BASE} wants you to sign in with your Ethereum account: ${address}\nNonce: ${nonce}`;
  const signature = await account.signMessage({ message });
  const verifyRes = await fetch(`${BASE}/api/auth/siwe/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, message, signature }),
  });
  if (!verifyRes.ok) throw new Error(`SIWE verify failed: ${verifyRes.status} ${await verifyRes.text()}`);
  return cookieValue(verifyRes.headers.get("set-cookie"), "dex223_session");
}

async function join(session, referrerSlug) {
  const res = await fetch(`${BASE}/api/referrals/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: session },
    body: JSON.stringify({ referrerSlug }),
  });
  return { status: res.status, body: await res.json() };
}

async function me(session) {
  const res = await fetch(`${BASE}/api/referrals/me`, { headers: { Cookie: session } });
  return res.json();
}

async function deleteAddresses(addrs) {
  const lower = addrs.map((a) => a.toLowerCase());
  await prisma.referralRelation.deleteMany({
    where: { OR: [{ refereeAddress: { in: lower } }, { referrerAddress: { in: lower } }] },
  });
  await prisma.referralLink.deleteMany({ where: { address: { in: lower } } });
  await prisma.siweNonce.deleteMany({ where: { address: { in: lower } } });
}

// Resolves the DB id of the epoch covering "now". Hits the epoch API first so the
// current epoch is materialized if the app hasn't created it yet.
async function currentEpochId() {
  await fetch(`${BASE}/api/referrals/epoch`).catch(() => {});
  const now = new Date();
  const epoch =
    (await prisma.epoch.findFirst({
      where: { startsAt: { lte: now }, endsAt: { gt: now } },
      orderBy: { startsAt: "desc" },
    })) ?? (await prisma.epoch.findFirst({ orderBy: { startsAt: "desc" } }));
  if (!epoch) throw new Error("No epoch found — open the app (or GET /api/referrals/epoch) first.");
  return epoch.id;
}

// Inserts a referee→referrer relation directly (bypasses SIWE/join) so the referee
// shows up in the referrer's list. Use your own connected wallet as the referrer.
async function addReferee(referrer, referee) {
  const r = referrer.toLowerCase();
  const e = referee.toLowerCase();
  const joinedEpochId = await currentEpochId();
  await prisma.referralLink.upsert({
    where: { address: r },
    create: { address: r, slug: r },
    update: {},
  });
  await prisma.referralRelation.upsert({
    where: { refereeAddress: e },
    create: { referrerAddress: r, refereeAddress: e, joinedEpochId },
    update: { referrerAddress: r, joinedEpochId },
  });
  console.log(`Linked referee ${e}\n     -> referrer ${r} (epoch ${joinedEpochId}).`);
  console.log(`Connect as ${r} on /en/referrals to see it (volume $0, decay 100%, no reward).`);
}

async function cleanAll() {
  const rel = await prisma.referralRelation.deleteMany();
  const link = await prisma.referralLink.deleteMany();
  const nonce = await prisma.siweNonce.deleteMany();
  console.log(`Wiped referral test data: ${rel.count} relations, ${link.count} links, ${nonce.count} nonces.`);
}

const newAccount = () => privateKeyToAccount(generatePrivateKey());

async function runFlow() {
  const referrer = newAccount();
  const referee = newAccount();
  const otherReferrer = newAccount();

  console.log(`referrer = ${referrer.address}`);
  console.log(`referee  = ${referee.address}\n`);

  console.log("1. New wallet lands on the referral link:");
  await landingCapture(referrer.address);

  console.log("\n2. New wallet signs in (SIWE) and joins:");
  const refereeSession = await signIn(referee);
  const j1 = await join(refereeSession, referrer.address);
  console.log(`  join -> ${j1.status}`, j1.body);

  console.log("\n3. Same wallet tries a SECOND referrer (must be blocked):");
  const j2 = await join(refereeSession, otherReferrer.address);
  console.log(`  join -> ${j2.status}`, j2.body);

  console.log("\n4. An EXISTING referrer tries to be referred (must be blocked):");
  const referrerSession = await signIn(referrer); // referrer now has 1 referee → existing user
  const j3 = await join(referrerSession, otherReferrer.address);
  console.log(`  join -> ${j3.status}`, j3.body);

  console.log("\n5. Referrer's /me now lists the referee:");
  const data = await me(referrerSession);
  console.log(`  totalReferees=${data.totalReferees}, referees=${data.referees.map((r) => r.address).join(", ")}`);

  if (process.env.KEEP === "1") {
    console.log("\nKEEP=1 set — leaving test rows in the DB. Run `node scripts/test-referral-flow.mjs clean` to remove them.");
  } else {
    await deleteAddresses([referrer.address, referee.address, otherReferrer.address]);
    console.log("\nCleaned up this run's test addresses.");
  }
}

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  const cmd = process.argv[2];
  if (cmd === "clean") {
    await cleanAll();
    return;
  }
  if (cmd === "add") {
    const referrer = process.argv[3] ?? process.env.SEED_REFERRER;
    const referee = process.argv[4] ?? ZERO_ADDRESS;
    if (!ADDRESS_RE.test(referrer ?? "") || !ADDRESS_RE.test(referee)) {
      console.error("Usage: node scripts/test-referral-flow.mjs add <referrerAddress> [refereeAddress]");
      console.error("  referrerAddress = your connected wallet (or set SEED_REFERRER)");
      process.exitCode = 1;
      return;
    }
    await addReferee(referrer, referee);
    return;
  }
  await runFlow();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
