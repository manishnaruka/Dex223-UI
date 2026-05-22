"use client";

import Tooltip from "@repo/ui/tooltip";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { useEpochCountdown } from "@/app/[locale]/referrals/hooks/useEpochCountdown";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props {
  showSeasonNft: boolean;
  season: number;
  epochCurrent: number;
  epochTotal: number;
  progressPercent: number;
  epochEndsAt: number;
  seasonNftTier: "silver" | "gold" | "bronze";
  seasonNftTopPercent: number;
  onSeasonNftClick?: () => void;
}

const InfoRow = ({
  label,
  value,
  tooltip,
  className,
}: {
  label: string;
  value: string;
  tooltip: string;
  className?: string;
}) => (
  <div
    className={clsxMerge(
      "flex flex-col gap-0.5 border-l-2 border-secondary-border pl-2.5 lg:gap-1 lg:pl-5",
      className,
    )}
  >
    <div className="flex items-center gap-1">
      <span className="text-10 text-secondary-text lg:text-14">{label}</span>
      <Tooltip iconSize={16} text={tooltip} />
    </div>
    <span className="text-12 font-medium text-primary-text lg:text-16">{value}</span>
  </div>
);

const padNum = (n: number) => n.toString().padStart(2, "0");

export default function RewardProgramCard({
  showSeasonNft,
  season,
  epochCurrent,
  epochTotal,
  progressPercent,
  epochEndsAt,
  seasonNftTier,
  seasonNftTopPercent,
  onSeasonNftClick,
}: Props) {
  const t = useTranslations("Referrals");
  const { days, hours, minutes, seconds } = useEpochCountdown(epochEndsAt);
  const seasonNftLabel =
    seasonNftTier === "gold" ? t("gold") : seasonNftTier === "silver" ? t("silver") : t("bronze");
  const seasonNftEmoji =
    seasonNftTier === "gold" ? "🥇" : seasonNftTier === "silver" ? "🥈" : "🥉";

  const countdownSegments = [
    { label: t("day"), value: padNum(days) },
    { label: t("hour"), value: padNum(hours) },
    { label: t("min"), value: padNum(minutes) },
    { label: t("sec"), value: padNum(seconds) },
  ];

  return (
    <div className="relative min-h-[156px] w-full max-w-full min-w-0 overflow-hidden rounded-3 bg-gradient-card-green-light-fill lg:h-[156px]">
      <Image
        src="/images/rewardProgramcard.svg"
        alt=""
        width={396}
        height={156}
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-auto -translate-x-1/2 object-cover opacity-10 lg:block"
      />
      <div className="relative flex min-w-0 flex-col gap-3 p-3 md:p-4 lg:h-full lg:flex-row lg:items-stretch lg:justify-between lg:gap-6 lg:px-6 lg:py-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:justify-center lg:gap-4">
          <h2 className="text-18 font-medium leading-6 text-primary-text md:text-24 lg:text-28">
            {t("reward_program_title")}
          </h2>
          <div className="grid min-w-0 grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-3 sm:gap-4 md:gap-3 lg:gap-4">
            <InfoRow
              label={t("rewards")}
              value={t("rewards_value")}
              tooltip={t("rewards_tooltip")}
            />
            <InfoRow
              label={t("budget_split")}
              value={t("budget_split_value")}
              tooltip={t("budget_split_tooltip")}
            />
            <InfoRow
              className="col-span-2 sm:col-span-1"
              label={t("supported_chains")}
              value={t("supported_chains_value")}
              tooltip={t("supported_chains_tooltip")}
            />
          </div>
        </div>

        <div className="ml-auto grid w-full min-w-0 grid-cols-[1fr_auto] gap-2 sm:flex sm:flex-row sm:flex-wrap sm:gap-3 lg:w-auto lg:flex-none lg:flex-nowrap lg:items-stretch">
          {showSeasonNft ? (
            <button
              type="button"
              onClick={onSeasonNftClick}
              disabled={!onSeasonNftClick}
              className="order-2 flex min-w-[68px] flex-shrink-0 flex-col gap-0.5 rounded-2 border border-secondary-border bg-tertiary-bg/80 px-2 py-2 text-left duration-200 enabled:cursor-pointer enabled:hocus:border-green disabled:cursor-default sm:min-w-0 sm:flex-1 lg:order-none lg:w-[118px] lg:min-w-[118px] lg:flex-none lg:justify-center lg:rounded-3 lg:px-3 lg:py-3 xl:w-[132px] xl:min-w-[132px] xl:px-4"
            >
              <span className="text-10 text-secondary-text lg:text-12">{t("season_nft")}</span>
              <div className="flex items-center gap-1">
                <span className="text-12 font-medium text-primary-text lg:text-18">
                  {seasonNftLabel}
                </span>
                <span className="text-12 lg:text-16">{seasonNftEmoji}</span>
              </div>
              <span className="text-10 text-tertiary-text lg:text-12">
                {t("top_percent", { percent: `${seasonNftTopPercent}%` })}
              </span>
            </button>
          ) : null}

          <div className="order-1 flex min-w-0 flex-1 flex-col gap-1.5 rounded-2 border border-secondary-border bg-tertiary-bg/80 px-2 py-2 sm:min-w-0 sm:flex-1 lg:order-none lg:w-[196px] lg:min-w-[196px] lg:flex-none lg:justify-center lg:rounded-3 lg:px-3 lg:py-3 xl:w-[224px] xl:min-w-[224px] xl:px-4">
            <div className="flex items-center gap-1">
              <span className="text-10 text-secondary-text lg:text-12">{t("epoch_ends_in")}</span>
              <Tooltip iconSize={16} text={t("epoch_ends_in_tooltip")} />
            </div>
            <div className="grid grid-cols-4 gap-0.5 lg:gap-1 text-center">
              {countdownSegments.map((segment, index) => (
                <div key={segment.label} className="flex flex-col items-center min-w-0">
                  <div className="flex items-center justify-center text-12 font-medium text-primary-text md:text-18 lg:text-20">
                    {index > 0 && (
                      <span className="text-secondary-text mr-0.5 lg:mr-2">:</span>
                    )}
                    <span>{segment.value}</span>
                  </div>
                  <span className="text-8 text-tertiary-text lg:text-12">
                    {segment.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-3 col-span-2 flex min-w-0 flex-col gap-2 rounded-2 border border-secondary-border bg-tertiary-bg/80 px-2 py-2 sm:min-w-0 sm:flex-1 lg:order-none lg:col-span-1 lg:w-[196px] lg:min-w-[196px] lg:flex-none lg:justify-center lg:rounded-3 lg:px-3 lg:py-3 xl:w-[224px] xl:min-w-[224px] xl:px-4">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-20 border border-secondary-border px-2 py-0.5 text-10 font-medium text-primary-text lg:px-3 lg:py-1 lg:text-12">
                {t("season_label", { n: season })}
              </span>
              <span className="text-10 text-secondary-text lg:text-12">
                {t("epoch_label", { current: epochCurrent, total: epochTotal })}
              </span>
            </div>
            <div className="rounded-20 h-2 bg-quaternary-bg w-full">
              <div
                className="rounded-20 h-2 bg-green"
                style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
              />
            </div>
            <span className="text-10 text-tertiary-text lg:text-12">
              {t("progress", { percent: progressPercent })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
