"use client";

import Tooltip from "@repo/ui/tooltip";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { SeasonNftTierEntry } from "@/app/[locale]/referrals/data/referralData";
import { useSeasonNftDialogStore } from "@/app/[locale]/referrals/stores/useSeasonNftDialogStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import { ReferralBadge } from "@/app/[locale]/referrals/data/referralData";

interface Props {
  timeline: SeasonNftTierEntry[];
}

const TIER_EMOJI: Record<ReferralBadge, string> = {
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatTimelineDate(timestamp: number) {
  const d = new Date(timestamp);
  return `${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function SeasonNftDialog({ timeline }: Props) {
  const t = useTranslations("Referrals");
  const { isOpen, setIsOpen } = useSeasonNftDialogStore();

  const tierLabel = useMemo(
    () => ({
      gold: t("gold"),
      silver: t("silver"),
      bronze: t("bronze"),
    }),
    [t],
  );

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="w-full max-w-[600px] rounded-5 bg-primary-bg p-4 shadow-2xl md:p-6">
        <DialogHeader
          onClose={() => setIsOpen(false)}
          title={t("season_nft_tier_timeline_title")}
        />
        <div className="flex flex-col gap-2 px-4 pb-5 md:px-6 md:pb-6">
          {timeline.map((entry) => (
            <div
              key={`${entry.date}-${entry.tier}`}
              className="flex items-center justify-between rounded-3 border border-secondary-border bg-tertiary-bg/80 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-14 lg:text-16 text-primary-text">
                  {formatTimelineDate(entry.date)}
                </span>
                <Tooltip
                  iconSize={16}
                  text={t("tier_entry_tooltip", {
                    tier: tierLabel[entry.tier],
                    date: formatTimelineDate(entry.date),
                  })}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-14 lg:text-16 font-medium text-primary-text">
                  {tierLabel[entry.tier]}
                </span>
                <span className="text-16">{TIER_EMOJI[entry.tier]}</span>
              </div>
            </div>
          ))}
          <p className="mt-1 text-center text-12 lg:text-14 text-secondary-text">
            {t("tier_timeline_footer")}
          </p>
        </div>
      </div>
    </DrawerDialog>
  );
}
