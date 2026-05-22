"use client";

import { useTranslations } from "next-intl";

import { type LootBoxSnapshot } from "@/app/[locale]/trade-to-earn/data/tradeToEarnData";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

interface Props {
  isConnected: boolean;
  lootBox: LootBoxSnapshot;
  onOpenLoot?: () => void;
}

export default function LootBoxesSection({ isConnected, lootBox, onOpenLoot }: Props) {
  const t = useTranslations("TradeToEarn");

  return (
    <section className="min-w-0 rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <div className="flex min-w-0 flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-20 font-medium leading-7 text-primary-text md:text-24 lg:text-28">
            {t("lootboxes_title")}
          </h2>
          <p className="text-12 leading-5 text-secondary-text lg:text-14">
            {t("lootboxes_description")}
          </p>
        </div>
        <span className="inline-flex h-7 max-w-full items-center self-start rounded-20 bg-secondary-bg px-3 text-12 font-medium text-primary-text">
          {t("jackpot_odds", { odds: lootBox.jackpotOdds })}
        </span>
      </div>

      <div className="mt-4 grid min-w-0 gap-2.5 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-2 rounded-3 bg-tertiary-bg p-3 md:p-4">
          <span className="text-12 text-secondary-text">{t("next_loot_unlock")}</span>
          <span className="min-w-0 break-words text-16 font-medium text-primary-text md:text-18">
            {lootBox.nextLootProgress}
          </span>
          <div className="h-1 w-full rounded-20 bg-quaternary-bg">
            <div
              className="h-1 rounded-20 bg-green"
              style={{
                width: `${Math.max(0, Math.min(100, lootBox.nextLootProgressPercent))}%`,
              }}
            />
          </div>
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.SMALL}
            mobileSize={ButtonSize.SMALL}
            onClick={onOpenLoot}
            disabled={lootBox.nextLootProgressPercent < 100}
            fullWidth
            className="mt-1"
          >
            {isConnected ? t("open_loot") : t("open_loot_demo")}
          </Button>
        </div>

        <div className="flex min-w-0 flex-col gap-2 rounded-3 bg-tertiary-bg p-3 md:p-4">
          <span className="text-12 text-secondary-text">{t("recent_loot")}</span>
          <div className="flex min-w-0 items-center justify-between gap-2 text-14 text-primary-text md:text-16">
            <span>{t("usdt")}</span>
            <span className="font-medium">{lootBox.recentLootUsdt}</span>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2 text-14 text-primary-text md:text-16">
            <span>{t("fee_credit")}</span>
            <span className="font-medium">{lootBox.recentLootFeeCredit}</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 rounded-3 bg-tertiary-bg p-3 md:col-span-2 md:p-4 xl:col-span-1">
          <span className="text-12 text-secondary-text">{t("chain_contributions")}</span>
          {lootBox.chainContributions.map((row) => (
            <div
              key={row.chain}
              className="flex min-w-0 items-center justify-between gap-2 text-14 text-primary-text"
            >
              <span>{row.chain}</span>
              <span className="font-medium">{row.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-2 rounded-3 bg-tertiary-bg p-3 md:p-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="text-12 text-secondary-text">{t("epoch_bonus")}</span>
          <span className="shrink-0 text-right text-12 text-tertiary-text">
            {t("epoch_bonus_growth")}
          </span>
        </div>
        <span className="text-16 font-medium text-primary-text md:text-18">
          {lootBox.epochBonus}
        </span>
        <div className="h-1 w-full rounded-20 bg-tertiary-bg">
          <div
            className="h-1 rounded-20 bg-green"
            style={{
              width: `${Math.max(0, Math.min(100, lootBox.epochBonusProgressPercent))}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
