-- CreateEnum
CREATE TYPE "EpochStatus" AS ENUM ('OPEN', 'FINALIZING', 'CLOSED');

-- CreateEnum
CREATE TYPE "PayoutKind" AS ENUM ('USDT', 'FEE_CREDIT', 'DEX_TOKEN');

-- CreateEnum
CREATE TYPE "BadgeTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Epoch" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "EpochStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "Epoch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralLink" (
    "address" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralLink_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "ReferralRelation" (
    "id" SERIAL NOT NULL,
    "referrerAddress" TEXT NOT NULL,
    "refereeAddress" TEXT NOT NULL,
    "joinedEpochId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefereeVolumeSnapshot" (
    "id" SERIAL NOT NULL,
    "refereeAddress" TEXT NOT NULL,
    "epochId" INTEGER NOT NULL,
    "volumeUsd" DECIMAL(20,4) NOT NULL,

    CONSTRAINT "RefereeVolumeSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" SERIAL NOT NULL,
    "referrerAddress" TEXT NOT NULL,
    "refereeAddress" TEXT NOT NULL,
    "epochId" INTEGER NOT NULL,
    "decayStage" INTEGER NOT NULL,
    "grossUsd" DECIMAL(20,4) NOT NULL,
    "perRefereeCapUsd" DECIMAL(20,4) NOT NULL,
    "clusterCapUsd" DECIMAL(20,4) NOT NULL,
    "finalUsd" DECIMAL(20,4) NOT NULL,
    "payoutKind" "PayoutKind" NOT NULL DEFAULT 'USDT',

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonBadge" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "tier" "BadgeTier" NOT NULL,
    "topPercent" INTEGER NOT NULL,
    "totalVolumeContributedUsd" DECIMAL(20,4) NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeasonBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiweNonce" (
    "nonce" TEXT NOT NULL,
    "address" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiweNonce_pkey" PRIMARY KEY ("nonce")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_index_key" ON "Season"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Epoch_seasonId_index_key" ON "Epoch"("seasonId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralLink_slug_key" ON "ReferralLink"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralRelation_refereeAddress_key" ON "ReferralRelation"("refereeAddress");

-- CreateIndex
CREATE INDEX "ReferralRelation_referrerAddress_idx" ON "ReferralRelation"("referrerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "RefereeVolumeSnapshot_refereeAddress_epochId_key" ON "RefereeVolumeSnapshot"("refereeAddress", "epochId");

-- CreateIndex
CREATE INDEX "ReferralReward_referrerAddress_epochId_idx" ON "ReferralReward"("referrerAddress", "epochId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralReward_referrerAddress_refereeAddress_epochId_key" ON "ReferralReward"("referrerAddress", "refereeAddress", "epochId");

-- CreateIndex
CREATE INDEX "SeasonBadge_address_idx" ON "SeasonBadge"("address");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonBadge_address_seasonId_key" ON "SeasonBadge"("address", "seasonId");

-- AddForeignKey
ALTER TABLE "Epoch" ADD CONSTRAINT "Epoch_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralRelation" ADD CONSTRAINT "ReferralRelation_joinedEpochId_fkey" FOREIGN KEY ("joinedEpochId") REFERENCES "Epoch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefereeVolumeSnapshot" ADD CONSTRAINT "RefereeVolumeSnapshot_epochId_fkey" FOREIGN KEY ("epochId") REFERENCES "Epoch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_epochId_fkey" FOREIGN KEY ("epochId") REFERENCES "Epoch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonBadge" ADD CONSTRAINT "SeasonBadge_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
