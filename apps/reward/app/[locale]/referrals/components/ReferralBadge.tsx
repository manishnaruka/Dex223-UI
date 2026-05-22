import clsx from "clsx";
import { useTranslations } from "next-intl";

import { ReferralBadge as BadgeType } from "@/app/[locale]/referrals/data/referralData";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props {
  badge: BadgeType;
  className?: string;
}

const styles: Record<BadgeType, { container: string; emoji: string }> = {
  gold: {
    container: "bg-yellow-bg text-yellow-light border border-yellow-light/30",
    emoji: "🥇",
  },
  silver: {
    container: "bg-tertiary-bg text-primary-text border border-secondary-border",
    emoji: "🥈",
  },
  bronze: {
    container: "bg-red-bg text-orange border border-orange/30",
    emoji: "🥉",
  },
};

export default function ReferralBadge({ badge, className }: Props) {
  const t = useTranslations("Referrals");
  const style = styles[badge];
  const label = badge === "gold" ? t("gold") : badge === "silver" ? t("silver") : t("bronze");

  return (
    <span
      className={clsxMerge(
        "inline-flex items-center gap-1 px-3 py-1 rounded-20 text-12 font-medium leading-none",
        style.container,
        className,
      )}
    >
      <span className={clsx("text-14 leading-none")}>{style.emoji}</span>
      <span>{label}</span>
    </span>
  );
}
