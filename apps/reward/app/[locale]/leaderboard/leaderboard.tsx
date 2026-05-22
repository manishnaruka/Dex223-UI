"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import LeaderboardLoadingSkeleton from "@/app/[locale]/leaderboard/components/LeaderboardLoadingSkeleton";
import LeaderboardSection from "@/app/[locale]/leaderboard/components/LeaderboardSection";
import { LeaderboardView } from "@/app/[locale]/leaderboard/data/leaderboardData";
import ReferralLinkCard from "@/app/[locale]/referrals/components/ReferralLinkCard";
import ReferralSearchBar from "@/app/[locale]/referrals/components/ReferralSearchBar";
import SeasonNftDialog from "@/app/[locale]/referrals/components/SeasonNftDialog";
import { mockReferralData } from "@/app/[locale]/referrals/data/referralData";
import { useSeasonNftDialogStore } from "@/app/[locale]/referrals/stores/useSeasonNftDialogStore";
import Container from "@/components/atoms/Container";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import ReferralQRCodeDialog from "../referrals/components/ReferralQRCodeDialog";
import RewardProgramCard from "@/components/common/RewardProgramCard";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Leaderboard() {
  const t = useTranslations("Referrals");
  const { isConnected } = useAccount();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<LeaderboardView>("top10");
  const { setIsOpen: setIsSeasonNftDialogOpen } = useSeasonNftDialogStore();

  useEffect(() => {
    const id = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!isConnected && view !== "top10") {
      setView("top10");
    }
  }, [isConnected, view]);

  const referralLink = isConnected ? mockReferralData.referralLink : null;

  return (
    <Container className="max-w-[1680px] overflow-x-clip px-3 py-3 pb-4 md:px-5 md:py-6 md:pb-8 lg:px-8 lg:py-8">
      {isLoading ? (
        <LeaderboardLoadingSkeleton />
      ) : (
        <div className="flex min-w-0 flex-col gap-3 md:gap-5">
          <div className="xl:hidden">
            <ReferralSearchBar value={searchValue} onChange={setSearchValue} />
          </div>
          <div className="hidden justify-end xl:flex">
            <Link href="/trade-to-earn/history">
              <Button
                variant={ButtonVariant.CONTAINED}
                colorScheme={ButtonColor.LIGHT_GREEN}
                size={ButtonSize.MEDIUM}
                mobileSize={ButtonSize.SMALL}
                className="min-w-[88px] px-4"
              >
                {t("history")}
              </Button>
            </Link>
          </div>
          <RewardProgramCard
            showSeasonNft={isConnected}
            season={mockReferralData.season}
            epochCurrent={mockReferralData.epochCurrent}
            epochTotal={mockReferralData.epochTotal}
            progressPercent={mockReferralData.progressPercent}
            epochEndsAt={mockReferralData.epochEndsAt}
            seasonNftTier={mockReferralData.seasonNftTier}
            seasonNftTopPercent={mockReferralData.seasonNftTopPercent}
            onSeasonNftClick={() => setIsSeasonNftDialogOpen(true)}
          />
          <LeaderboardSection isConnected={isConnected} view={view} onViewChange={setView} />
          <ReferralLinkCard link={referralLink} isConnected={isConnected} />
        </div>
      )}
      <ReferralQRCodeDialog link={referralLink} />
      <SeasonNftDialog timeline={mockReferralData.seasonNftTimeline} />
    </Container>
  );
}
