"use client";

import Tooltip from "@repo/ui/tooltip";
import { useTranslations } from "next-intl";

import {
  ReferralsDesktopTable,
  ReferralsMobileTable,
} from "@/app/[locale]/referrals/components/ReferralsTable";
import { RefereeRow } from "@/app/[locale]/referrals/data/referralData";
import EmptyStateIcon from "@/components/atoms/EmptyStateIconNew";

interface Props {
  isConnected: boolean;
  totalReferees: number | null;
  combinedVolume: number | null;
  totalRewards: number | null;
  rows: RefereeRow[];
}

const formatCurrency = (value: number | null) =>
  value === null ? "—" : `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const SummaryRow = ({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string | number;
  tooltip: string;
}) => (
  <div className="flex min-w-0 items-center justify-between gap-2 lg:justify-start">
    <span className="flex min-w-0 items-center gap-1 text-12 text-secondary-text md:text-14">
      <Tooltip iconSize={16} text={tooltip} />
      <span className="min-w-0 truncate">{label}</span>
    </span>
    <span className="shrink-0 text-12 font-medium text-primary-text md:text-14">{value}</span>
  </div>
);

export default function ReferralsSection({
  isConnected,
  totalReferees,
  combinedVolume,
  totalRewards,
  rows,
}: Props) {
  const t = useTranslations("Referrals");
  const hasRows = isConnected && rows.length > 0;

  return (
    <section className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <h2 className="text-20 font-medium leading-7 text-primary-text md:text-24 lg:text-28">
            {t("section_title")}
          </h2>
          <p className="break-words text-12 leading-5 text-secondary-text lg:text-14">
            {t("decay_caps")}
          </p>
        </div>
        <span className="inline-flex max-w-full self-start rounded-20 bg-green-bg px-3 py-1 text-12 font-medium text-green sm:whitespace-nowrap">
          {t("total_reward", {
            amount: totalRewards === null ? "—" : `$${totalRewards}`,
          })}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-2 rounded-3 border border-secondary-border bg-tertiary-bg/40 px-3 py-3 md:px-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <span className="text-14 font-medium text-primary-text md:text-16">{t("summary")}</span>
        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
          <SummaryRow
            label={t("total_referees")}
            value={totalReferees === null ? "—" : totalReferees}
            tooltip={t("total_referees_tooltip")}
          />
          <SummaryRow
            label={t("combined_volume")}
            value={formatCurrency(combinedVolume)}
            tooltip={t("combined_volume_tooltip")}
          />
          <SummaryRow
            label={t("total_rewards")}
            value={formatCurrency(totalRewards)}
            tooltip={t("total_rewards_tooltip")}
          />
        </div>
      </div>

      {hasRows ? (
        <>
          <ReferralsDesktopTable rows={rows} />
          <ReferralsMobileTable rows={rows} />
        </>
      ) : (
       <div className="flex flex-col justify-center items-center h-full min-h-[340px] bg-primary-bg rounded-5 gap-1 bg-empty-reward bg-right-top bg-no-repeat max-md:bg-size-180 relative right-[-11px] md:right-[-23px]">
          <span className="text-secondary-text">
            {isConnected ? t("share_link_to_earn") : t("connect_wallet_view_referrals")}
          </span>
        </div>
      )}
    </section>
  );
}
