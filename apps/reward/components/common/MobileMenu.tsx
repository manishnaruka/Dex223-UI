import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";

import Drawer from "@/components/atoms/Drawer";
import LocaleSwitcher from "@/components/atoms/LocaleSwitcher";
import Svg from "@/components/atoms/Svg";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import { rewardMenuItems } from "@/components/common/Navigation";
import { IconName } from "@/config/types/IconName";
import { clsxMerge } from "@/functions/clsxMerge";
import { Link, usePathname } from "@/i18n/routing";

const menuIcons: Record<string, IconName> = {
  trade_to_earn: "spark",
  social_quests: "task",
  referrals: "referral",
  leaderboard: "leaderboard",
  claim_center: "gift",
};

export function MobileLink({
  href,
  iconName,
  title,
  handleClose,
  isActive,
  disabled = false,
  className = "",
  linkClassName = "",
  handleClick,
  isMenu = false,
  isExternal = false,
}: {
  href: string;
  iconName: IconName;
  title: string;
  handleClose: () => void;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
  linkClassName?: string;
  handleClick?: (e: any) => void;
  isMenu?: boolean;
  isExternal?: boolean;
  comingSoon?: boolean;
}) {
  if (isExternal) {
    return (
      <a
        target="_blank"
        onClick={(e) => {
          if (handleClick) handleClick(e);
          handleClose();
        }}
        href={href}
        className={clsxMerge(
          "flex items-center gap-2 py-3 px-4 duration-200",
          !isActive && "hocus:bg-quaternary-bg text-secondary-text",
          isActive && !isMenu && "text-green pointer-events-none",
          isActive &&
            isMenu &&
            "bg-navigation-active-mobile text-green pointer-events-none",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
      >
        <Svg iconName={iconName} />
        {title}
      </a>
    );
  }

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <Link
        onClick={(e) => {
          if (handleClick) handleClick(e);
          handleClose();
        }}
        href={href}
        className={clsxMerge(
          "flex items-center gap-2 py-3 px-4 duration-200 flex-grow",
          !isActive && "hocus:bg-quaternary-bg text-secondary-text",
          isActive && !isMenu && "text-green pointer-events-none",
          isActive &&
            isMenu &&
            "bg-navigation-active-mobile text-green pointer-events-none",
          disabled && "pointer-events-none opacity-50",
          linkClassName,
        )}
      >
        <Svg iconName={iconName} />
        {title}
      </Link>
    </div>
  );
}

export default function MobileMenu() {
  const t = useTranslations("Navigation");
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const pathname = usePathname();

  const handlers = useSwipeable({
    onSwipedLeft: () => setMobileMenuOpened(false),
  });

  return (
    <div className="xl:hidden">
      <Drawer
        handlers={handlers}
        placement="left"
        isOpen={mobileMenuOpened}
        setIsOpen={setMobileMenuOpened}
      >
        <div className="flex flex-col justify-between h-full min-w-[300px]">
          <div className="py-6 grid gap-1">
            {rewardMenuItems.map(({ href, label }) => (
              <MobileLink
                isMenu
                key={href}
                href={href}
                iconName={menuIcons[label]}
                title={t(label)}
                handleClose={() => setMobileMenuOpened(false)}
                isActive={pathname.startsWith(href)}
              />
            ))}
          </div>
          <div className="flex flex-grow items-end gap-4 px-4 pb-4">
            <LocaleSwitcher isMobile={true} />
          </div>
        </div>
      </Drawer>
      <IconButton
        buttonSize={IconButtonSize.LARGE}
        iconName="menu"
        onClick={() => setMobileMenuOpened(true)}
      />
    </div>
  );
}
