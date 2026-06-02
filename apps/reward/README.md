# reward

Next.js app for the Dex223 Reward Program (Referrals slice).

## Local backend setup

1. Start Postgres (`postgresql://localhost:5432` is the default; any URL works).
2. `cp .env.example .env` and fill in `DATABASE_URL`, `SESSION_SECRET`, `CRON_SECRET`.
3. From the repo root:

```bash
yarn install
cd apps/reward
yarn prisma:migrate
yarn prisma:seed     # optional — seeds 3 referees mirroring the legacy mock
yarn test            # vitest: domain + reward service
yarn dev             # http://localhost:3003
```

## Smoke-testing the API

```bash
# Public: current epoch
curl http://localhost:3003/api/referrals/epoch

# Public: contributor badge for any address
curl http://localhost:3003/api/referrals/badge/0x9e30000000000000000000000000000000000110

# Cron: close an epoch and write ReferralReward rows
curl -X POST http://localhost:3003/api/cron/finalize-epoch \
  -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json" -d '{}'
```

Viewer-scoped routes (`/api/referrals/me`, `/api/referrals/link`, `/api/referrals/join`,
`/api/referrals/[address]`) require a SIWE session — sign via `POST /api/auth/siwe/nonce`
then `POST /api/auth/siwe/verify` from a wagmi client. See [docs/reward-plan.md](docs/reward-plan.md) for the full plan.
