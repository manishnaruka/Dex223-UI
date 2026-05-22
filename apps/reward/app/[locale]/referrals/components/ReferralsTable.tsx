"use client";

import Tooltip from "@repo/ui/tooltip";
import { useTranslations } from "next-intl";

import ReferralBadge from "@/app/[locale]/referrals/components/ReferralBadge";
import { RefereeRow } from "@/app/[locale]/referrals/data/referralData";
import truncateMiddle from "@/functions/truncateMiddle";
import { Link } from "@/i18n/routing";

interface Props {
  rows: RefereeRow[];
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function ReferralsDesktopTable({ rows }: Props) {
  const t = useTranslations("Referrals");

  return (
    <div className="hidden min-w-0 overflow-hidden lg:block">
      <div className="grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 border-b border-secondary-border px-4 py-3 text-14 text-secondary-text xl:gap-4 xl:px-5">
        <span>{t("referee")}</span>
        <div className="flex items-center gap-1">
          <span>{t("volume")}</span>
          <Tooltip iconSize={16} text={t("volume_tooltip")} />
        </div>
        <div className="flex items-center gap-1">
          <span>{t("decay_stage")}</span>
          <Tooltip iconSize={16} text={t("decay_stage_tooltip")} />
        </div>
        <span>{t("reward")}</span>
        <span>{t("badge")}</span>
      </div>
      <div className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.address}
            className="grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] items-center gap-3 border-b border-secondary-border px-4 py-4 last:border-b-0 xl:gap-4 xl:px-5"
          >
            <Link
              href={`/referrals/${row.address}`}
              className="min-w-0 truncate text-14 font-medium text-green underline-offset-4 hocus:underline"
            >
              {truncateMiddle(row.address, { charsFromStart: 4, charsFromEnd: 4 })}
            </Link>
            <span className="text-14 text-primary-text">{formatCurrency(row.volume)}</span>
            <span className="text-14 text-primary-text">{row.decayStage}%</span>
            <span className="text-14 text-primary-text">{formatCurrency(row.reward)}</span>
            <span>
              <ReferralBadge badge={row.badge} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MobileRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <>
    <span className="min-w-0 text-12 text-secondary-text md:text-14">{label}</span>
    <span className="min-w-0 text-right text-12 text-primary-text md:text-14">{children}</span>
  </>
);

export function ReferralsMobileTable({ rows }: Props) {
  const t = useTranslations("Referrals");

  return (
    <div className="flex min-w-0 flex-col gap-2 md:gap-3 lg:hidden">
      {rows.map((row) => (
        <div
          key={row.address}
          className="min-w-0 rounded-3 border border-secondary-border bg-tertiary-bg/60 px-3 py-3 md:px-4"
        >
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
            <MobileRow label={t("referee")}>
              <Link
                href={`/referrals/${row.address}`}
                className="inline-block max-w-full truncate font-medium text-green underline-offset-4 hocus:underline"
              >
                {truncateMiddle(row.address, { charsFromStart: 4, charsFromEnd: 4 })}
              </Link>
            </MobileRow>
            <MobileRow label={t("volume")}>{formatCurrency(row.volume)}</MobileRow>
            <MobileRow label={t("decay_stage")}>{row.decayStage}%</MobileRow>
            <MobileRow label={t("reward")}>{formatCurrency(row.reward)}</MobileRow>
            <MobileRow label={t("badge")}>
              <ReferralBadge badge={row.badge} />
            </MobileRow>
          </div>
        </div>
      ))}
    </div>
  );
}
