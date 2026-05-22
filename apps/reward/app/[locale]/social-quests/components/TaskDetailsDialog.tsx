"use client";

import Tooltip from "@repo/ui/tooltip";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { type QuestTask } from "@/app/[locale]/social-quests/data/socialQuestsData";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";

interface Props {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  task: QuestTask | null;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-14 font-medium text-primary-text md:text-16">{children}</h3>;
}

function DetailCard({
  label,
  tooltip,
  children,
}: {
  label: string;
  tooltip: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-3 bg-tertiary-bg p-3 md:p-4">
      <span className="flex items-center gap-1 text-12 text-secondary-text">
        {label}
        <Tooltip iconSize={14} text={tooltip} />
      </span>
      <div className="mt-1 flex min-w-0 items-center gap-2 text-14 font-medium text-primary-text md:text-16">
        {children}
      </div>
    </div>
  );
}

export default function TaskDetailsDialog({ isOpen, onOpenChange, task }: Props) {
  const t = useTranslations("SocialQuests");

  if (!task) {
    return null;
  }

  const details = task.details;

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={onOpenChange} maxMobileWidth="640px">
      <div className="flex max-h-[90vh] w-[calc(100vw-24px)] max-w-[800px] flex-col rounded-5 bg-primary-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-secondary-border px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-18 font-bold text-primary-text md:text-20">
            {t("task_details_title")}
          </h2>
          <IconButton
            variant={IconButtonVariant.CLOSE}
            handleClose={() => onOpenChange(false)}
          />
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          <section className="flex flex-col gap-2">
            <SectionTitle>{t("task_details_description")}</SectionTitle>
            <div className="max-h-[240px] overflow-y-auto rounded-3 bg-tertiary-bg p-4 text-12 leading-5 text-secondary-text md:text-14 md:leading-6">
              {details.description}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle>{t("task_details_eligibility_rules")}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              <DetailCard
                label={t("task_details_wallet")}
                tooltip={t("task_details_wallet_tooltip")}
              >
                <Image
                  alt={details.walletName}
                  src={details.walletIcon}
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0"
                />
                <span className="truncate">{details.walletName}</span>
              </DetailCard>
              <DetailCard
                label={t("task_details_platform")}
                tooltip={t("task_details_platform_tooltip")}
              >
                <span className="truncate">{details.platform}</span>
              </DetailCard>
              <DetailCard
                label={t("task_details_formats")}
                tooltip={t("task_details_formats_tooltip")}
              >
                <span className="truncate">{details.formats}</span>
              </DetailCard>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle>{t("task_details_reward_breakdown")}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              <DetailCard
                label={t("task_details_points")}
                tooltip={t("task_details_points_tooltip")}
              >
                <span className="truncate">{details.pointsValue}</span>
              </DetailCard>
              <DetailCard
                label={t("task_details_confidence_rating")}
                tooltip={t("task_details_confidence_rating_tooltip")}
              >
                <span className="truncate">{details.confidenceLabel}</span>
              </DetailCard>
              <DetailCard
                label={t("task_details_bonus")}
                tooltip={t("task_details_bonus_tooltip")}
              >
                <span className="truncate">{details.bonus}</span>
              </DetailCard>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle>{t("task_details_moderation_info")}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              <DetailCard
                label={t("task_details_review_time")}
                tooltip={t("task_details_review_time_tooltip")}
              >
                <span className="truncate">{details.reviewTime}</span>
              </DetailCard>
            </div>
          </section>
        </div>
      </div>
    </DrawerDialog>
  );
}
