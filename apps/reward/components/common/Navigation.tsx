import { useTranslations } from "next-intl";

import NavigationItem from "@/components/atoms/NavigationItem";
import { usePathname } from "@/i18n/routing";

type RewardLabel =
  | "trade_to_earn"
  | "social_quests"
  | "referrals"
  | "leaderboard"
  | "claim_center";

export const rewardMenuItems: Array<{ label: RewardLabel; href: string }> = [
  { label: "trade_to_earn", href: "/trade-to-earn" },
  { label: "social_quests", href: "/social-quests" },
  { label: "referrals", href: "/referrals" },
  { label: "leaderboard", href: "/leaderboard" },
  { label: "claim_center", href: "/claim-center" },
];

export default function Navigation() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  return (
    <ul className="hidden xl:flex items-center">
      {rewardMenuItems.map((menuItem) => (
        <li key={menuItem.href}>
          <NavigationItem
            id={menuItem.label}
            title={t(menuItem.label)}
            href={menuItem.href}
            active={pathname.startsWith(menuItem.href)}
          />
        </li>
      ))}
    </ul>
  );
}
