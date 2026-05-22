"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import ReferralLinkCard from "@/app/[locale]/referrals/components/ReferralLinkCard";
import ReferralQRCodeDialog from "@/app/[locale]/referrals/components/ReferralQRCodeDialog";
import ReferralSearchBar from "@/app/[locale]/referrals/components/ReferralSearchBar";
import ReferralsLoadingSkeleton from "@/app/[locale]/referrals/components/ReferralsLoadingSkeleton";
import ReferralsSection from "@/app/[locale]/referrals/components/ReferralsSection";
import SeasonNftDialog from "@/app/[locale]/referrals/components/SeasonNftDialog";
import { mockReferralData } from "@/app/[locale]/referrals/data/referralData";
import { useSeasonNftDialogStore } from "@/app/[locale]/referrals/stores/useSeasonNftDialogStore";
import Container from "@/components/atoms/Container";
import RewardProgramCard from "@/components/common/RewardProgramCard";

export function Referrals() {
  const { isConnected } = useAccount();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { setIsOpen: setIsSeasonNftDialogOpen } = useSeasonNftDialogStore();

  useEffect(() => {
    const id = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  const filteredRows = mockReferralData.referees.filter((row) =>
    searchValue ? row.address.toLowerCase().includes(searchValue.toLowerCase()) : true,
  );

  const totalReferees = isConnected ? mockReferralData.totalReferees : null;
  const combinedVolume = isConnected ? mockReferralData.combinedVolume : null;
  const totalRewards = isConnected ? mockReferralData.totalRewards : null;
  const referralLink = isConnected ? mockReferralData.referralLink : null;

  return (
    <Container className="max-w-[1680px] overflow-x-clip px-3 py-3 pb-4 md:px-5 md:py-6 md:pb-8 lg:px-8 lg:py-8">
      {isLoading ? (
        <ReferralsLoadingSkeleton />
      ) : (
        <div className="flex min-w-0 flex-col gap-3 md:gap-5">
          <ReferralSearchBar value={searchValue} onChange={setSearchValue} />
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
          <ReferralsSection
            isConnected={isConnected}
            totalReferees={totalReferees}
            combinedVolume={combinedVolume}
            totalRewards={totalRewards}
            rows={isConnected ? filteredRows : []}
          />
          <ReferralLinkCard link={referralLink} isConnected={isConnected} />
        </div>
      )}
      <ReferralQRCodeDialog link={referralLink} />
      <SeasonNftDialog timeline={mockReferralData.seasonNftTimeline} />
    </Container>
  );
}
