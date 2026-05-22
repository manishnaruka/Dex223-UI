"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";

import SeasonNftDialog from "@/app/[locale]/referrals/components/SeasonNftDialog";
import { mockReferralData } from "@/app/[locale]/referrals/data/referralData";
import { useSeasonNftDialogStore } from "@/app/[locale]/referrals/stores/useSeasonNftDialogStore";
import SocialQuestsLoadingSkeleton from "@/app/[locale]/social-quests/components/SocialQuestsLoadingSkeleton";
import {
  Eligibility,
  Tasks,
} from "@/app/[locale]/social-quests/components/SocialQuestsSections";
import SubmitProofDialog from "@/app/[locale]/social-quests/components/SubmitProofDialog";
import TaskDetailsDialog from "@/app/[locale]/social-quests/components/TaskDetailsDialog";
import {
  mockSocialQuestsData,
  type QuestTask,
} from "@/app/[locale]/social-quests/data/socialQuestsData";
import Container from "@/components/atoms/Container";
import { InputSize, SearchInput } from "@/components/atoms/Input";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import RewardProgramCard from "@/components/common/RewardProgramCard";
import Link from "next/link";

export function SocialQuests() {
  const t = useTranslations("Referrals");
  const { isConnected } = useAccount();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<QuestTask | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSubmitProofOpen, setIsSubmitProofOpen] = useState(false);
  const { setIsOpen: setIsSeasonNftDialogOpen } = useSeasonNftDialogStore();

  const handleOpenDetails = (task: QuestTask) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleOpenSubmitProof = (task: QuestTask) => {
    setSelectedTask(task);
    setIsSubmitProofOpen(true);
  };

  useEffect(() => {
    const id = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <Container className="max-w-[1680px] overflow-x-clip px-2 py-3 pb-20 md:px-5 md:py-6 md:pb-8 lg:px-8 lg:py-8">
      {isLoading ? (
        <SocialQuestsLoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="flex items-center justify-between gap-2 md:gap-3">
            <div className="min-w-0 flex-1 xl:w-[480px] xl:flex-none">
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

          <Eligibility
            isConnected={isConnected}
            stats={mockSocialQuestsData.eligibilityStats}
          />
          <Tasks
            isConnected={isConnected}
            tasks={mockSocialQuestsData.tasks}
            searchValue={searchValue}
            onOpenDetails={handleOpenDetails}
            onSubmitProof={handleOpenSubmitProof}
          />
        </div>
      )}
      <TaskDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        task={selectedTask}
      />
      <SubmitProofDialog
        isOpen={isSubmitProofOpen}
        onOpenChange={setIsSubmitProofOpen}
      />
      <SeasonNftDialog timeline={mockReferralData.seasonNftTimeline} />
    </Container>
  );
}
