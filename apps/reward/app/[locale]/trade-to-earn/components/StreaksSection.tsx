"use client";

import Tooltip from "@repo/ui/tooltip";
import { useTranslations } from "next-intl";

import {
  type StreakSnapshot,
  type StreakState,
} from "@/app/[locale]/trade-to-earn/data/tradeToEarnData";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

interface Props {
  isConnected: boolean;
  state: StreakState;
  streak: StreakSnapshot;
  onMakeFirstTrade?: () => void;
}

function MetricCard({ label, tooltip, value }: { label: string; tooltip?: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-3 bg-tertiary-bg p-3 md:p-4">
      <span className="flex min-w-0 items-center gap-1 text-12 text-secondary-text">
        {label}
        {tooltip ? <Tooltip iconSize={16} text={tooltip} /> : null}
      </span>
      <span className="min-w-0 break-words text-16 font-medium text-primary-text md:text-18">
        {value}
      </span>
    </div>
  );
}

function Header({
  isConnected,
  state,
  multiplierBoost,
}: {
  isConnected: boolean;
  state: StreakState;
  multiplierBoost: string;
}) {
  const t = useTranslations("TradeToEarn");

  const titleKey =
    state === "target_met"
      ? "target_met_title"
      : state === "new"
        ? "start_first_streak_title"
        : "streaks_title";
  const descriptionKey =
    state === "target_met"
      ? "target_met_description"
      : state === "new"
        ? "start_first_streak_description"
        : "streaks_description";

  return (
    <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-20 font-medium leading-7 text-primary-text md:text-24 lg:text-28">
          {t(titleKey)}
        </h2>
        <p className="text-12 leading-5 text-secondary-text lg:text-14">{t(descriptionKey)}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 sm:self-start">
        {isConnected && (state === "active" || state === "target_met") ? (
          <span className="inline-flex h-7 items-center rounded-20 bg-green-bg px-3 text-12 font-medium text-green">
            {multiplierBoost}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function StreaksSection({ isConnected, state, streak, onMakeFirstTrade }: Props) {
  const t = useTranslations("TradeToEarn");

  const showFirstTradeRow = state === "new";

  return (
    <section className="min-w-0 rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <Header isConnected={isConnected} state={state} multiplierBoost={streak.multiplierBoost} />

      {showFirstTradeRow ? (
        <div className="mt-4 flex min-w-0 flex-col gap-3 rounded-3 bg-tertiary-bg p-3 md:flex-row md:items-center md:justify-between md:p-4">
          <p className="text-12 text-secondary-text md:text-14">
            {t("eligible_pairs")}{" "}
            <span>
              {t("check_supported_chains")}{" "}
              <button
                type="button"
                className="text-green underline decoration-green/40 underline-offset-2 hocus:text-green-hover-icon"
              >
                {t("supported_chains_link")}
              </button>{" "}
              {t("for_details")}
            </span>
          </p>
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.SMALL}
            mobileSize={ButtonSize.SMALL}
            onClick={onMakeFirstTrade}
            className="w-full shrink-0 md:w-auto"
          >
            {t("make_first_trade")}
          </Button>
        </div>
      ) : null}

      <div className="mt-4 grid min-w-0 gap-2.5 sm:grid-cols-2 md:gap-3">
        <div className="flex min-w-0 flex-col gap-1 rounded-3 bg-tertiary-bg p-3 md:p-4">
          <span className="flex min-w-0 items-center gap-1 text-12 text-secondary-text">
            {t("daily_requirement")}
            <Tooltip iconSize={16} text={t("daily_requirement_tooltip")} />
          </span>
          <span className="min-w-0 break-words text-16 font-medium text-primary-text md:text-18">
            {streak.dailyRequirement}
          </span>
          <span className="flex min-w-0 items-center gap-1 text-12 text-tertiary-text">
            {streak.counterpartiesRequirement}
            <Tooltip iconSize={16} text={t("counterparties_requirement_tooltip")} />
          </span>
        </div>

        <MetricCard
          label={t("valid_volume_for_epoch")}
          tooltip={t("valid_volume_for_epoch_tooltip")}
          value={streak.validVolume}
        />

        <div className="flex min-w-0 flex-col gap-2 rounded-3 bg-tertiary-bg p-3 md:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1 text-12 text-secondary-text">
              {t("today")}
              <Tooltip iconSize={16} text={t("today_tooltip")} />
            </span>
            <span className="flex shrink-0 items-center gap-1 text-12 text-tertiary-text">
              <Svg iconName="date" size={14} />
              {streak.todayTimeLeft}
            </span>
          </div>
          <span className="min-w-0 break-words text-16 font-medium text-primary-text md:text-18">
            {streak.todayProgress}
          </span>
          <div className="h-1 w-full rounded-20 bg-quaternary-bg">
            <div
              className="h-1 rounded-20 bg-green"
              style={{
                width: `${Math.max(0, Math.min(100, streak.todayProgressPercent))}%`,
              }}
            />
          </div>
        </div>

        <MetricCard
          label={t("fees_paid")}
          tooltip={t("fees_paid_tooltip")}
          value={streak.feesPaid}
        />

        <div className="flex min-w-0 flex-col gap-2 rounded-3 bg-tertiary-bg p-3 md:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1 text-12 text-secondary-text">
              {t("current_streak")}
              <Tooltip iconSize={16} text={t("current_streak_tooltip")} />
            </span>
            {isConnected && state !== "broken" ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-20 bg-green-bg px-2 py-0.5 text-12 text-green">
                <Svg iconName="check" size={12} />
                {t("active")}
              </span>
            ) : null}
          </div>
          <span className="min-w-0 break-words text-16 font-medium text-primary-text md:text-18">
            {streak.currentStreakDays} {t("days")}
          </span>
          {streak.currentStreakDays > 0 ? (
            <div className="h-1 w-full rounded-20 bg-quaternary-bg">
              <div
                className="h-1 rounded-20 bg-green"
                style={{
                  width: `${Math.min(100, streak.currentStreakDays * 20)}%`,
                }}
              />
            </div>
          ) : null}
        </div>

        <MetricCard
          label={t("counterparties")}
          tooltip={t("counterparties_tooltip")}
          value={streak.counterparties}
        />

        <MetricCard label={t("clamp")} tooltip={t("clamp_tooltip")} value={streak.clamp} />
      </div>
    </section>
  );
}
