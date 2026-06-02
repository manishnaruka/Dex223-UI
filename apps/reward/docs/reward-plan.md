# Referrals Backend for apps/reward (Next.js API Routes)

## Context

`apps/reward` is a Next.js 15 frontend with a complete Referrals UI (table, link card, QR dialog, season-NFT dialog, epoch countdown) that currently reads from a hardcoded `mockReferralData` object at [apps/reward/app/[locale]/referrals/data/referralData.ts](apps/reward/app/[locale]/referrals/data/referralData.ts). There is **no backend** for any of it.

This plan implements the Referrals slice of the D223 Reward Program spec (Section 7) as **Next.js Route Handlers inside `apps/reward`** — matching the `apps/web` reference pattern ([apps/web/app/api/simpleswap/get-exchange/route.ts](apps/web/app/api/simpleswap/get-exchange/route.ts)). The result: the existing UI swaps its mock import for a thin fetch hook, and the page renders real per-wallet data with server-authoritative epoch state, decay computation, and caps.

Scope is **Referrals only** (Section 7 of the spec): wallet-bound referral links, ≥$2,000 referee volume gate, exponential decay (100% → 50% → 25% → 12.5% …), per-referee cap ($100), per-cluster cap ($10,000), and the dual-recognition Contributor Badge system (referrer sees per-referee decay + totals; referee receives a permanent badge with total volume + seasonal tier + rank tag). Multi-chain volume aggregation (Ethereum, Base, BSC per Section 1) is handled by summing per-address volume across chains inside `VolumeSource`. Payouts support **USDT and fee-credits** per Section 3.3 via a `payoutKind` field on the reward row.

Trading-rewards (Section 4 `Rᵤᵀ`), loot boxes (5.2), social pool (6), seasons-NFT minting (5.3), leaderboard ranking, the Merkle distributor (9), and wallet-graph sybil detection (8) are explicitly **out of scope** and will reuse the patterns established here when built later. The plan reserves integration points (`TODO(merkle)`, `TODO(anti-sybil)`, `TODO(fee-clamp)`) so those drop in without refactoring.

---

## Defaults baked into this plan (swappable)

| Decision | Choice | Why |
|---|---|---|
| Backend home | Next.js Route Handlers in `apps/reward/app/api/referrals/*` | Matches `apps/web` reference, shares UI types, one deploy |
| ORM / DB | Prisma + PostgreSQL | Relational data (referrer→referee graph, cluster caps, epoch joins); type-safe end-to-end |
| Validation | Yup | Already in `apps/reward` deps; matches `apps/web` (Formik+Yup) |
| Wallet auth | SIWE (Sign-In With Ethereum) → JWT cookie | Standard wagmi-compatible pattern; verifies the viewer owns the address |
| Trade volume source | `VolumeSource` interface + `MockVolumeSource` impl | Decay/cap engine builds + tests now; real subgraph adapter is a follow-up swap |
| Tests | Vitest | Fast, ESM-native, zero ceremony for pure-function suites |

---

## API contract (consumed by existing UI)

All routes return `application/json`. Errors: `{ error: string, code?: string }` with appropriate HTTP status. The shape of `GET /api/referrals/me` matches `ReferralData` at [apps/reward/app/[locale]/referrals/data/referralData.ts:18](apps/reward/app/[locale]/referrals/data/referralData.ts#L18) exactly so the UI swap is mechanical.

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/referrals/epoch` | Current season/epoch + `epochEndsAt` (server-authoritative; replaces client guessing) | none |
| `POST` | `/api/auth/siwe/nonce` | Issue SIWE nonce for wallet sign-in | none |
| `POST` | `/api/auth/siwe/verify` | Verify SIWE signature, set HttpOnly session cookie | none |
| `POST` | `/api/referrals/link` | Idempotent: create / fetch the viewer's referral slug, returns full URL `dex223.io/r/{slug}` | viewer |
| `POST` | `/api/referrals/join` | Record `referee → referrer` relation when a new wallet lands via `/r/{slug}` and connects. Rejects self-referral, duplicate referrer, and addresses with prior trade activity (anti-sybil) | viewer |
| `GET` | `/api/referrals/me` | Returns full `ReferralData` for the viewer (referees, decay stages, rewards, season info, link) | viewer |
| `GET` | `/api/referrals/[address]` | Per-referee drilldown (already linked from [ReferralsTable.tsx:43](apps/reward/app/[locale]/referrals/components/ReferralsTable.tsx#L43)). Returns volume by epoch, decay timeline, and the referee's **Contributor Badge** (`totalVolumeContributed`, `seasonalTier`, `seasonalRankTopPercent` per spec 7.4) | viewer (must be the referrer of `[address]` OR the address itself) |
| `GET` | `/api/referrals/badge/[address]` | Public read of the permanent Contributor Badge for any address (spec 7.4 says badges are permanent and shown to referees) | none |
| `POST` | `/api/cron/finalize-epoch` | Closes the current epoch: snapshots volumes, computes rewards, applies caps, writes `ReferralReward` rows. Protected by `CRON_SECRET` header | secret |

---

## Folder structure (new files in `apps/reward/`)

```
apps/reward/
├── app/api/
│   ├── auth/siwe/
│   │   ├── nonce/route.ts
│   │   └── verify/route.ts
│   ├── referrals/
│   │   ├── epoch/route.ts
│   │   ├── link/route.ts
│   │   ├── join/route.ts
│   │   ├── me/route.ts
│   │   └── [address]/route.ts
│   └── cron/finalize-epoch/route.ts
├── server/                              # all backend code; never imported by client components
│   ├── env.ts                           # Yup-validated process.env at boot
│   ├── lib/
│   │   ├── prisma.ts                    # PrismaClient singleton (HMR-safe)
│   │   ├── auth.ts                      # getViewerAddress(req) → Address | throws 401
│   │   ├── siwe.ts                      # nonce store + signature verification (viem.verifyMessage)
│   │   ├── errors.ts                    # ApiError + withErrorHandler wrapper (mirrors apps/web try/catch)
│   │   ├── validation.ts                # Yup schemas: joinBody, addressParam
│   │   └── epoch.ts                     # currentEpoch(now) from GENESIS_TS + 7d
│   ├── services/
│   │   ├── referralLinkService.ts       # mintSlug(address), resolveSlug(slug)
│   │   ├── referralJoinService.ts       # joinReferrer(referee, referrerSlug)
│   │   ├── referralViewService.ts       # buildReferralData(viewer) → ReferralData
│   │   ├── referralRewardService.ts     # finalizeEpoch(epochId) orchestrator
│   │   ├── seasonBadgeService.ts        # tier(percentile) → bronze|silver|gold
│   │   └── volumeSource/
│   │       ├── index.ts                 # interface VolumeSource { getEpochVolumeUsd(addr, epochId): Promise<number> } — MUST sum across Ethereum + Base + BSC per spec §1
│   │       └── mockVolumeSource.ts      # fixture-backed impl (default in dev/test)
│   └── domain/                          # pure, no I/O — 100% unit-testable
│       ├── decay.ts                     # decayPercent(joinedEpochIdx, currentEpochIdx): 100,50,25,12.5...
│       ├── caps.ts                      # applyPerRefereeCap, applyClusterCap (proportional scale-down)
│       └── badges.ts                    # tierFromPercentile, percentRank
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                          # seeds fixture wallets + relations from mockReferralData
│   └── migrations/                      # generated
├── tests/server/
│   ├── decay.test.ts
│   ├── caps.test.ts
│   ├── badges.test.ts
│   └── referralRewardService.test.ts    # integration: seed → finalize → assert ReferralReward rows
└── .env.example                         # DATABASE_URL, SESSION_SECRET, CRON_SECRET, GENESIS_TS
```

**Client-side glue (existing files modified):**
- [apps/reward/app/[locale]/referrals/referrals.tsx](apps/reward/app/[locale]/referrals/referrals.tsx) — replace `mockReferralData` import with a React Query `useReferralData()` hook hitting `/api/referrals/me`. Existing skeleton state already handles loading.
- New `apps/reward/hooks/useReferralData.ts` — wraps React Query (already in deps at [apps/reward/package.json:23](apps/reward/package.json#L23)).
- The detail route `/referrals/[address]` is linked from [ReferralsTable.tsx:43](apps/reward/app/[locale]/referrals/components/ReferralsTable.tsx#L43) but no `page.tsx` exists for it yet — flag for follow-up; backend endpoint is built so UI can land later.

---

## Database schema (Prisma)

```prisma
model Season {
  id        Int      @id @default(autoincrement())
  index     Int      @unique         // 1, 2, 3...
  startsAt  DateTime
  endsAt    DateTime                  // startsAt + 12 epochs
  epochs    Epoch[]
}

model Epoch {
  id        Int      @id @default(autoincrement())
  season    Season   @relation(fields: [seasonId], references: [id])
  seasonId  Int
  index     Int                       // 1..12 within season
  startsAt  DateTime
  endsAt    DateTime                  // startsAt + 7d
  status    EpochStatus @default(OPEN)
  rewards   ReferralReward[]
  joins     ReferralRelation[]
  @@unique([seasonId, index])
}

enum EpochStatus { OPEN FINALIZING CLOSED }

model ReferralLink {
  address   String   @id              // 0x-prefixed, lowercased
  slug      String   @unique          // short opaque id used in dex223.io/r/{slug}
  createdAt DateTime @default(now())
}

model ReferralRelation {
  id              Int      @id @default(autoincrement())
  referrerAddress String                       // FK to ReferralLink.address
  refereeAddress  String   @unique             // a referee can only have one referrer
  joinedEpoch     Epoch    @relation(fields: [joinedEpochId], references: [id])
  joinedEpochId   Int
  joinedAt        DateTime @default(now())
  @@index([referrerAddress])
}

model RefereeVolumeSnapshot {
  id             Int    @id @default(autoincrement())
  refereeAddress String
  epochId        Int
  volumeUsd      Decimal @db.Decimal(20, 4)
  @@unique([refereeAddress, epochId])
}

model ReferralReward {
  id                Int    @id @default(autoincrement())
  referrerAddress   String
  refereeAddress    String
  epoch             Epoch  @relation(fields: [epochId], references: [id])
  epochId           Int
  decayStage        Int                       // 100, 50, 25, 12...
  grossUsd          Decimal @db.Decimal(20, 4)
  perRefereeCapUsd  Decimal @db.Decimal(20, 4)
  clusterCapUsd     Decimal @db.Decimal(20, 4)
  finalUsd          Decimal @db.Decimal(20, 4)
  payoutKind        PayoutKind @default(USDT) // spec §3.3 — USDT or fee credits (DEX_TOKEN reserved)
  @@unique([referrerAddress, refereeAddress, epochId])
  @@index([referrerAddress, epochId])
}

enum PayoutKind { USDT FEE_CREDIT DEX_TOKEN }

// Spec §7.4: Contributor Badges are PERMANENT — never deleted, never downgraded after award.
// One row per (address, season) preserves the full historical record shown to the referee.
// totalVolumeContributedUsd is a snapshot of the referee's cumulative valid volume that
// counted toward referral rewards at the time of award (spec §7.4 first bullet).
model SeasonBadge {
  id                          Int     @id @default(autoincrement())
  address                     String
  seasonId                    Int
  tier                        BadgeTier
  topPercent                  Int                  // 1, 5, 10 (Top 1% / 5% / 10%)
  totalVolumeContributedUsd   Decimal @db.Decimal(20, 4)
  awardedAt                   DateTime @default(now())
  @@unique([address, seasonId])
  @@index([address])
}

enum BadgeTier { BRONZE SILVER GOLD }

model SiweNonce {
  nonce     String   @id
  address   String?
  expiresAt DateTime
}
```

---

## Core algorithms (in `server/domain/`, pure)

### `decay.ts`
```ts
// Spec 7.2: Epoch 1 = 100%, then halves each subsequent epoch.
// joinedEpochIdx and currentEpochIdx are SEASON-LOCAL indices (1..12).
export function decayPercent(joinedEpochIdx: number, currentEpochIdx: number): number {
  const stagesElapsed = Math.max(0, currentEpochIdx - joinedEpochIdx);
  return 100 / Math.pow(2, stagesElapsed);   // 100, 50, 25, 12.5...
}
```

### `caps.ts`
```ts
// Spec 7.3: per-referee $100, per-cluster $10,000.
export const PER_REFEREE_CAP_USD = 100;
export const PER_CLUSTER_CAP_USD = 10_000;

export function applyPerRefereeCap(grossUsd: number): number {
  return Math.min(grossUsd, PER_REFEREE_CAP_USD);
}

// If sum exceeds cluster cap, scale every referee's reward proportionally
// so totals == cluster cap and relative shares are preserved.
export function applyClusterCap(perRefereeUsd: number[]): number[] {
  const total = perRefereeUsd.reduce((a, b) => a + b, 0);
  if (total <= PER_CLUSTER_CAP_USD) return perRefereeUsd;
  const scale = PER_CLUSTER_CAP_USD / total;
  return perRefereeUsd.map((v) => v * scale);
}
```

### `badges.ts`
```ts
// Spec 5.3 cutoffs apply seasonally; reused for referee Contributor Badges (spec 7.4).
export function tierFromPercentile(topPercent: number): BadgeTier {
  if (topPercent <= 1) return "GOLD";
  if (topPercent <= 5) return "SILVER";
  if (topPercent <= 10) return "BRONZE";
  return null;
}
```

### Reward formula (orchestrated in `referralRewardService.finalizeEpoch`)

For each `ReferralRelation` where the referee's cross-chain volume meets the **spec §7.1 gate of ≥ $2,000 valid volume** (read from `RefereeVolumeSnapshot.volumeUsd`):

1. `decay = decayPercent(rel.joinedEpoch.index, currentEpoch.index)`
2. `gross = volumeUsd * REWARD_RATE_BPS / 10_000 * decay / 100` *(REWARD_RATE_BPS is configured; spec doesn't pin a rate — set in env, default 25 bps)*
3. `perRefereeCapped = applyPerRefereeCap(gross)` *(spec §7.3 $100 cap)*
4. Group by `referrerAddress`, run `applyClusterCap` on each group *(spec §7.3 $10,000 cluster cap)*
5. Insert/update `ReferralReward` row per (referrer, referee, epoch) with `payoutKind = USDT` by default
6. After all reward rows are written, recompute each referee's cumulative `totalVolumeContributedUsd` and percentile rank within the season → upsert `SeasonBadge` (tier never downgrades, per spec §7.4 "permanent")

**Referees below $2,000:** snapshot row is still written for analytics but **no `ReferralReward` is created** and the referrer's view shows `decayStage` with `reward: 0` for that referee.

---

## Auth (SIWE) — minimal

- `POST /api/auth/siwe/nonce` → returns `{ nonce }`, stored in `SiweNonce` with 10-min expiry.
- Client (wagmi) signs `dex223.io wants you to sign in with your Ethereum account: 0x... Nonce: <nonce>`.
- `POST /api/auth/siwe/verify` → `viem.verifyMessage` against signature; on success, sets HttpOnly cookie with JWT (`{ address, exp }`), deletes the nonce.
- `server/lib/auth.ts#getViewerAddress(req)` reads cookie, verifies JWT, returns lowercased address or throws `ApiError(401)`.

---

## Error handling pattern (mirrors `apps/web`)

```ts
// server/lib/errors.ts
export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}

export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try { return await handler(req); }
    catch (e) {
      if (e instanceof ApiError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
      console.error(e);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  };
}
```

Every route is wrapped: `export const GET = withErrorHandler(async (req) => { ... })`.

---

## Anti-gaming guardrails (in scope, lightweight)

- `POST /api/referrals/join` rejects: self-referral, address that already has a referrer, address that has any `RefereeVolumeSnapshot` row in a prior epoch (i.e., not a new wallet).
- Per-referee and per-cluster caps enforced at finalize time (above).
- Fee clamp / sybil graph analysis = **out of scope** (Section 8 of spec); leave a `TODO(anti-sybil)` in `referralRewardService` for the integration point.

---

## Environment

`.env.example`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/dex223_rewards
SESSION_SECRET=change-me-32-bytes
CRON_SECRET=change-me-cron
GENESIS_TS=2026-01-01T00:00:00Z       # epoch math anchor
REWARD_RATE_BPS=25                    # 0.25% of referee volume → gross referrer reward, pre-decay
PUBLIC_REFERRAL_BASE_URL=https://dex223.io/r
```

`server/env.ts` validates with Yup at module-load (fail fast).

---

## Step-by-step implementation order

1. **Scaffold.** Add `prisma`, `@prisma/client`, `vitest`, `jsonwebtoken`, `siwe` (or hand-rolled with `viem.verifyMessage`) to `apps/reward/package.json`. Create `apps/reward/server/` and `apps/reward/prisma/` skeletons. Add `.env.example`.
2. **DB.** Write `prisma/schema.prisma`, run `pnpm prisma migrate dev --name init_referrals`. Write `prisma/seed.ts` that mirrors `mockReferralData`.
3. **Domain layer first (pure).** `decay.ts`, `caps.ts`, `badges.ts` + Vitest suites. Get these green before touching I/O.
4. **Volume source.** Define `VolumeSource` interface + `MockVolumeSource` returning seeded snapshots.
5. **Services.** `referralLinkService`, `referralJoinService`, `referralViewService`, `referralRewardService.finalizeEpoch`, `seasonBadgeService`. Integration test `finalizeEpoch` against seeded DB.
6. **Auth.** SIWE nonce + verify routes, `getViewerAddress` helper, JWT cookie.
7. **Routes.** Wire each route handler thin — parse → validate (Yup) → call service → return. Use `withErrorHandler`.
8. **Cron route.** `POST /api/cron/finalize-epoch` with `Authorization: Bearer $CRON_SECRET` check; orchestrates snapshot pull from `VolumeSource` → `finalizeEpoch` → badge recompute.
9. **UI swap.** Add `hooks/useReferralData.ts` (React Query). Replace `mockReferralData` import in [referrals.tsx](apps/reward/app/[locale]/referrals/referrals.tsx) with hook result. Loading state already exists.
10. **Docs.** Update `apps/reward/README.md` with "Local backend setup" section.

---

## Verification (how to test & run locally)

**Prereqs:** Docker or local Postgres on `:5432`.

```bash
# 1. start db
docker run -d --name dex223-pg -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres:16

# 2. install + generate
cd apps/reward
cp .env.example .env
pnpm install
pnpm prisma migrate dev
pnpm prisma db seed

# 3. unit + integration tests (must pass before manual)
pnpm vitest run server

# 4. run app
pnpm dev   # http://localhost:3003
```

**Manual smoke test:**
1. Open `http://localhost:3003/en/referrals` — connect wallet (use a seeded address from `prisma/seed.ts`).
2. SIWE prompt → sign. Cookie set.
3. Page calls `/api/referrals/me` → table populates with seeded referees and matches what `mockReferralData` used to render. **Pass criterion: visual parity with the old mock-data render.**
4. Hit `/api/referrals/epoch` directly — verify `epochEndsAt` is a real `GENESIS_TS + N*7d` boundary, not `Date.now() + 3d` like the mock.
5. Trigger a finalize:
   ```bash
   curl -X POST http://localhost:3003/api/cron/finalize-epoch \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
   Re-open `/api/referrals/me` — referee `decayStage` advances from 100→50 for the just-closed epoch, `totalRewards` reflects new `ReferralReward` rows.
6. Test caps: seed a referrer with 200 referees × $1k volume each → finalize → confirm `sum(finalUsd) == 10_000` (cluster cap), not 200 × $100.

**Unit test acceptance (each maps to a spec line):**
- `decay.test.ts` — spec §7.2: epoch 1→1 = 100, 1→2 = 50, 1→3 = 25, 1→4 = 12.5, 1→5 = 6.25.
- `caps.test.ts` — spec §7.3: gross $150 → perReferee $100; cluster `[80, 80, 80]` × 200 referees scales proportionally to sum to exactly $10,000.
- `badges.test.ts` — spec §5.3 / §7.4: percentile 0.5 → GOLD/1%, 3 → SILVER/5%, 8 → BRONZE/10%, 12 → null.
- `referralRewardService.test.ts`:
   - Seeded 3-referee fixture from `mockReferralData` produces `ReferralReward` rows matching its `reward` values within ±$1.
   - Referee with $1,500 volume produces **no** `ReferralReward` row (spec §7.1 ≥$2,000 gate).
   - Re-running `finalizeEpoch` on a previously-closed epoch is idempotent (`@@unique([referrerAddress, refereeAddress, epochId])` enforces it).
   - `MockVolumeSource` returning `{ethereum: 800, base: 800, bsc: 800}` for one address yields a single $2,400 snapshot → reward row created (spec §1 multi-chain aggregation).
   - Awarding a GOLD badge in season 3, then running finalize again with lower percentile → tier stays GOLD (spec §7.4 "permanent").

---

## Critical files

**To create:**
- `apps/reward/prisma/schema.prisma`
- `apps/reward/server/domain/{decay,caps,badges}.ts`
- `apps/reward/server/services/referralRewardService.ts`
- `apps/reward/server/services/referralViewService.ts`
- `apps/reward/server/lib/{prisma,auth,siwe,errors,validation,epoch}.ts`
- `apps/reward/app/api/referrals/{epoch,link,join,me,[address]}/route.ts`
- `apps/reward/app/api/auth/siwe/{nonce,verify}/route.ts`
- `apps/reward/app/api/cron/finalize-epoch/route.ts`
- `apps/reward/hooks/useReferralData.ts`
- `apps/reward/tests/server/*.test.ts`

**To modify:**
- `apps/reward/package.json` (deps + scripts: `prisma:*`, `test`)
- `apps/reward/app/[locale]/referrals/referrals.tsx` (swap mock for hook)
- `apps/reward/.env.example` (new)

**To reuse (do not duplicate):**
- `ReferralData`, `RefereeRow`, `ReferralBadge` types at [apps/reward/app/[locale]/referrals/data/referralData.ts](apps/reward/app/[locale]/referrals/data/referralData.ts) — backend imports and returns this shape verbatim.
- `useEpochCountdown` at [apps/reward/app/[locale]/referrals/hooks/useEpochCountdown.ts](apps/reward/app/[locale]/referrals/hooks/useEpochCountdown.ts) — keep as-is; feed it `epochEndsAt` from `/api/referrals/epoch`.
- Error-handling shape from [apps/web/app/api/simpleswap/get-exchange/route.ts](apps/web/app/api/simpleswap/get-exchange/route.ts) — `withErrorHandler` is the systematized version of its inline try/catch.
