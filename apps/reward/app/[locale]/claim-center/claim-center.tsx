"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";

import ClaimCenterLoadingSkeleton from "@/app/[locale]/claim-center/components/ClaimCenterLoadingSkeleton";
import ClaimDialog from "@/app/[locale]/claim-center/components/ClaimDialog";
import {
  CapsAndClamps,
  MerkleProof,
  PayoutsPerChain,
} from "@/app/[locale]/claim-center/components/ClaimCenterSections";
import SmartClaimDialog from "@/app/[locale]/claim-center/components/SmartClaimDialog";
import { mockClaimCenterData } from "@/app/[locale]/claim-center/data/claimCenterData";
import SeasonNftDialog from "@/app/[locale]/referrals/components/SeasonNftDialog";
import { mockReferralData } from "@/app/[locale]/referrals/data/referralData";
import { useSeasonNftDialogStore } from "@/app/[locale]/referrals/stores/useSeasonNftDialogStore";
import { InputSize, SearchInput } from "@/components/atoms/Input";
import Container from "@/components/atoms/Container";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import RewardProgramCard from "@/components/common/RewardProgramCard";
import Link from "next/link";

export function ClaimCenter() {
  const t = useTranslations("ClaimCenter");
  const { isConnected } = useAccount();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [isSmartClaimDialogOpen, setIsSmartClaimDialogOpen] = useState(false);
  const { setIsOpen: setIsSeasonNftDialogOpen } = useSeasonNftDialogStore();

  useEffect(() => {
    const id = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  const filteredPayouts = useMemo(
    () =>
      mockClaimCenterData.payouts.filter((payout) =>
        searchValue ? payout.chain.toLowerCase().includes(searchValue.toLowerCase()) : true,
      ),
    [searchValue],
  );

  return (
    <Container className="max-w-[1680px] overflow-x-clip px-3 py-3 pb-4 md:px-5 md:py-6 md:pb-8 lg:px-8 lg:py-8">
      {isLoading ? (
        <ClaimCenterLoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="flex items-center justify-between gap-2 md:gap-3">
            <div className="min-w-0 flex-1 xl:flex-none xl:w-[480px]">
              <SearchInput
                inputSize={InputSize.LARGE}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("search_placeholder")}
                className="h-9 rounded-2 bg-primary-bg text-12 md:h-10 md:text-14"
              />
            </div>
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
          <PayoutsPerChain
            isConnected={isConnected}
            onClaim={() => setIsClaimDialogOpen(true)}
            onSmartClaim={() => setIsSmartClaimDialogOpen(true)}
            payouts={filteredPayouts}
          />
          <MerkleProof />
          <CapsAndClamps caps={mockClaimCenterData.caps} />
        </div>
      )}
      <ClaimDialog isOpen={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen} />
      <SmartClaimDialog
        isOpen={isSmartClaimDialogOpen}
        onOpenChange={setIsSmartClaimDialogOpen}
      />
      <SeasonNftDialog timeline={mockReferralData.seasonNftTimeline} />
    </Container>
  );
}
