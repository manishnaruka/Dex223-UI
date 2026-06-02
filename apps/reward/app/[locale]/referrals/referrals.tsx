"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import ReferralLinkCard from "@/app/[locale]/referrals/components/ReferralLinkCard";
import ReferralQRCodeDialog from "@/app/[locale]/referrals/components/ReferralQRCodeDialog";
import ReferralSearchBar from "@/app/[locale]/referrals/components/ReferralSearchBar";
import ReferralsLoadingSkeleton from "@/app/[locale]/referrals/components/ReferralsLoadingSkeleton";
import ReferralsSection from "@/app/[locale]/referrals/components/ReferralsSection";
import SeasonNftDialog from "@/app/[locale]/referrals/components/SeasonNftDialog";
import { useSeasonNftDialogStore } from "@/app/[locale]/referrals/stores/useSeasonNftDialogStore";
import Container from "@/components/atoms/Container";
import RewardProgramCard from "@/components/common/RewardProgramCard";
import { usePendingReferral } from "@/hooks/usePendingReferral";
import { useReferralData } from "@/hooks/useReferralData";
import { useSiweSession } from "@/hooks/useSiweSession";

export function Referrals() {
  const { address, isConnected } = useAccount();
  const [searchValue, setSearchValue] = useState("");
  const { setIsOpen: setIsSeasonNftDialogOpen } = useSeasonNftDialogStore();

  const { sessionAddress } = useSiweSession();
  const hasSession =
    !!sessionAddress && !!address && sessionAddress === address.toLowerCase();

  // Once signed in, link any referral captured from a ?reference_address landing.
  usePendingReferral(hasSession, address);

  const { data, isLoading } = useReferralData(isConnected && hasSession);

  const filteredRows = (data?.referees ?? []).filter((row) =>
    searchValue ? row.address.toLowerCase().includes(searchValue.toLowerCase()) : true,
  );

  const totalReferees = isConnected && data ? data.totalReferees : null;
  const combinedVolume = isConnected && data ? data.combinedVolume : null;
  const totalRewards = isConnected && data ? data.totalRewards : null;
  const referralLink = isConnected && data ? data.referralLink : null;

  // Connected users see the skeleton while we sign in + load. Disconnected users
  // get the full layout immediately — the inner components handle empty/locked states.
  const showSkeleton = isConnected && (!hasSession || isLoading);

  return (
    <Container className="max-w-[1680px] overflow-x-clip px-3 py-3 pb-4 md:px-5 md:py-6 md:pb-8 lg:px-8 lg:py-8">
      {showSkeleton ? (
        <ReferralsLoadingSkeleton />
      ) : (
        <div className="flex min-w-0 flex-col gap-3 md:gap-5">
          <ReferralSearchBar value={searchValue} onChange={setSearchValue} />
          <RewardProgramCard
            showSeasonNft={isConnected}
            season={data?.season ?? 1}
            epochCurrent={data?.epochCurrent ?? 1}
            epochTotal={data?.epochTotal ?? 12}
            progressPercent={data?.progressPercent ?? 0}
            epochEndsAt={data?.epochEndsAt ?? Date.now()}
            seasonNftTier={data?.seasonNftTier ?? "bronze"}
            seasonNftTopPercent={data?.seasonNftTopPercent ?? 100}
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
      <SeasonNftDialog timeline={data?.seasonNftTimeline ?? []} />
    </Container>
  );
}
