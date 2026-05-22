"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";

import SeasonNftDialog from "@/app/[locale]/referrals/components/SeasonNftDialog";
import { mockReferralData } from "@/app/[locale]/referrals/data/referralData";
import { useSeasonNftDialogStore } from "@/app/[locale]/referrals/stores/useSeasonNftDialogStore";
import FomoFeedSection from "@/app/[locale]/trade-to-earn/components/FomoFeedSection";
import LootBoxesSection from "@/app/[locale]/trade-to-earn/components/LootBoxesSection";
import LootUnlockedDialog, {
  type LootUnlockedVariant,
} from "@/app/[locale]/trade-to-earn/components/LootUnlockedDialog";
import StreakBrokenBanner from "@/app/[locale]/trade-to-earn/components/StreakBrokenBanner";
import StreakReminderCard from "@/app/[locale]/trade-to-earn/components/StreakReminderCard";
import StreaksSection from "@/app/[locale]/trade-to-earn/components/StreaksSection";
import TradePreferencesDialog, {
  DEFAULT_TRADE_PREFERENCES,
  type TradePreferences,
} from "@/app/[locale]/trade-to-earn/components/TradePreferencesDialog";
import TradeToEarnLoadingSkeleton from "@/app/[locale]/trade-to-earn/components/TradeToEarnLoadingSkeleton";
import {
  disconnectedStreakSnapshot,
  mockTradeToEarnData,
  type StreakState,
} from "@/app/[locale]/trade-to-earn/data/tradeToEarnData";
import Container from "@/components/atoms/Container";
import { InputSize, SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import addToast from "@/other/toast";
import { Link } from "@/i18n/routing";
import RewardProgramCard from "@/components/common/RewardProgramCard";

export function TradeToEarn() {
  const t = useTranslations("TradeToEarn");
  const { isConnected } = useAccount();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [streakState, setStreakState] = useState<StreakState>("active");
  const [showReminder, setShowReminder] = useState(true);
  const [lootVariant, setLootVariant] = useState<LootUnlockedVariant | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [tradePreferences, setTradePreferences] =
    useState<TradePreferences>(DEFAULT_TRADE_PREFERENCES);
  const { setIsOpen: setIsSeasonNftDialogOpen } = useSeasonNftDialogStore();

  const handleSavePreferences = (next: TradePreferences) => {
    setTradePreferences(next);
    addToast(t("trade_preferences_saved"));
  };

  useEffect(() => {
    const id = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (isConnected) {
      setStreakState("active");
    } else {
      setStreakState("new");
    }
  }, [isConnected]);

  const streak = isConnected
    ? streakState === "new"
      ? {
          ...mockTradeToEarnData.streak,
          currentStreakDays: 0,
          todayProgress: "$0/$1,500",
          todayProgressPercent: 0,
        }
      : streakState === "target_met"
        ? {
            ...mockTradeToEarnData.streak,
            todayProgress: "$1,700/$1,500",
            todayProgressPercent: 100,
          }
        : mockTradeToEarnData.streak
    : disconnectedStreakSnapshot;

  const showStreakBroken = isConnected && streakState === "broken";

  return (
    <Container className="max-w-[1680px] overflow-x-clip px-3 py-3 pb-4 md:px-5 md:py-6 md:pb-8 lg:px-8 lg:py-8">
      {isLoading ? (
        <TradeToEarnLoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="flex min-w-0 items-center justify-between gap-2 md:gap-3">
            <div className="min-w-0 flex-1 xl:w-[480px] xl:flex-none">
              <SearchInput
                inputSize={InputSize.LARGE}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("search_placeholder")}
                className="h-9 rounded-2 bg-primary-bg text-12 md:h-10 md:text-14"
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(true)}
                aria-label={t("trade_preferences_title")}
                className="hidden h-9 w-9 items-center justify-center rounded-2 bg-secondary-bg text-secondary-text duration-200 hocus:bg-tertiary-bg hocus:text-primary-text sm:flex md:h-10 md:w-10"
              >
                <Svg iconName="settings" size={20} />
              </button>
              <Link href="/trade-to-earn/history">
                <Button
                  variant={ButtonVariant.CONTAINED}
                  colorScheme={ButtonColor.LIGHT_GREEN}
                  size={ButtonSize.MEDIUM}
                  mobileSize={ButtonSize.SMALL}
                  className="min-w-[76px] px-3 md:min-w-[88px] md:px-4"
                >
                  {t("history")}
                </Button>
              </Link>
            </div>
          </div>

          <RewardProgramCard
            showSeasonNft={isConnected && streakState !== "new"}
            season={mockReferralData.season}
            epochCurrent={mockReferralData.epochCurrent}
            epochTotal={mockReferralData.epochTotal}
            progressPercent={mockReferralData.progressPercent}
            epochEndsAt={mockReferralData.epochEndsAt}
            seasonNftTier={mockReferralData.seasonNftTier}
            seasonNftTopPercent={mockReferralData.seasonNftTopPercent}
            onSeasonNftClick={() => setIsSeasonNftDialogOpen(true)}
          />

          {showStreakBroken ? (
            <StreakBrokenBanner
              onUseGrace={() => setStreakState("active")}
              onEarnGrace={() => undefined}
            />
          ) : null}

          <div className="grid min-w-0 grid-cols-1 gap-3 md:gap-5 2xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="flex min-w-0 flex-col gap-3 md:gap-5">
              <StreaksSection
                isConnected={isConnected}
                state={streakState}
                streak={streak}
                onMakeFirstTrade={() => setStreakState("active")}
              />
              <LootBoxesSection
                isConnected={isConnected}
                lootBox={mockTradeToEarnData.lootBox}
                onOpenLoot={() =>
                  setLootVariant(
                    isConnected
                      ? { type: "fee_credit", amount: 5 }
                      : { type: "demo_fee_credit", amount: 5 },
                  )
                }
              />
            </div>

            <div className="flex min-w-0 flex-col gap-3 md:gap-5">
              {showReminder && isConnected && streakState === "active" ? (
                <StreakReminderCard onDismiss={() => setShowReminder(false)} />
              ) : null}
              <FomoFeedSection isConnected={isConnected} events={mockTradeToEarnData.fomoFeed} />
            </div>
          </div>
        </div>
      )}
      {lootVariant ? (
        <LootUnlockedDialog
          isOpen
          onOpenChange={(open) => {
            if (!open) setLootVariant(null);
          }}
          variant={lootVariant}
        />
      ) : null}
      <TradePreferencesDialog
        isOpen={isPreferencesOpen}
        onOpenChange={setIsPreferencesOpen}
        initialPreferences={tradePreferences}
        onSave={handleSavePreferences}
      />
      <SeasonNftDialog timeline={mockReferralData.seasonNftTimeline} />
    </Container>
  );
}
