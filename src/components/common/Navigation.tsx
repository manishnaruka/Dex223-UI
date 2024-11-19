import clsx from "clsx";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

import NavigationItem, { NavigationItemWithSubmenu } from "@/components/atoms/NavigationItem";
import { MobileLink } from "@/components/common/MobileMenu";
import { usePathname } from "@/navigation";

function NavigationExternalLink({ href, text }: { href: string; text: string }) {
  return (
    <a
      target="_blank"
      className={clsx(
        "text-green hocus:text-green-hover duration-200 inline-block py-2",
        href === "#" && "opacity-50 pointer-events-none",
      )}
      href={href}
    >
      {text}
    </a>
  );
}

function NavigationExternalLinksContainer({
  title,
  links,
}: {
  title: string;
  links: { href: string; text: string }[];
}) {
  return (
    <div className="flex flex-col text-16 text-primary-text gap-2">
      <div className="text-secondary-text">{title}</div>
      <div className="flex flex-col">
        {links.map((link) => {
          return <NavigationExternalLink key={link.text} href={link.href} text={link.text} />;
        })}
      </div>
    </div>
  );
}

const menuItems: Array<
  | {
      label: any;
      submenu: (handleClose: () => void, t: any, pathname?: string) => ReactNode;
      activeFlags: string[];
    }
  | { label: any; href: string }
> = [
  {
    label: "trade",
    submenu: (handleClose, t, pathname) => (
      <div className="flex flex-col py-1 bg-primary-bg rounded-2 shadow-popover shadow-black/70">
        <MobileLink
          isActive={pathname === "/swap"}
          href="/swap"
          iconName="swap"
          title={t("swap")}
          handleClose={handleClose}
        />
        <MobileLink
          disabled
          isActive={pathname === "/margin-trading"}
          href="/margin-trading"
          iconName="margin-trading"
          title={t("margin_trading")}
          handleClose={handleClose}
        />
      </div>
    ),
    activeFlags: ["/swap", "/margin-trading"],
  },
  {
    label: "pools",
    href: "/pools",
  },
  {
    label: "borrow_lend",
    href: "#",
  },
  {
    label: "portfolio",
    href: "/portfolio",
  },
  {
    label: "token_listing",
    href: "/token-listing",
  },
  {
    label: "",
    submenu: (handleClose, t) => (
      <div className="flex flex-col py-4 px-5 bg-primary-bg rounded-2 shadow-popover shadow-black/70 gap-4">
        <NavigationExternalLinksContainer
          title={"Help"}
          links={[
            {
              href: "#",
              text: "Blog",
            },
            {
              href: "#",
              text: "Guidelines",
            },
          ]}
        />
        <NavigationExternalLinksContainer
          title={t("token")}
          links={[
            {
              href: "#",
              text: t("token_statistics"),
            },
            {
              href: "http://localhost:3000/en/token-listing/contracts",
              text: t("token_lists"),
            },
          ]}
        />
        <NavigationExternalLinksContainer
          title={t("social_media")}
          links={[
            {
              href: "https://t.me/Dex223_Defi",
              text: t("social_telegram_discussions"),
            },
            {
              href: "https://t.me/Dex_223",
              text: t("social_telegram_announcements"),
            },
            {
              href: "https://x.com/Dex_223",
              text: t("social_x_account"),
            },
            {
              href: "https://discord.gg/t5bdeGC5Jk",
              text: t("social_discord"),
            },
            {
              href: "https://x.com/Dexaran",
              text: t("social_dex_x_account"),
            },
          ]}
        />

        <NavigationExternalLinksContainer
          title={t("useful_links")}
          links={[
            {
              href: "https://dexaran.github.io/token-converter/",
              text: t("useful_converter"),
            },
            {
              href: "https://dexaran.github.io/erc20-losses/",
              text: t("useful_losses_calculator"),
            },
            {
              href: "https://dexaran.github.io/erc223/",
              text: t("useful_front_page"),
            },
            {
              href: "https://github.com/Dalcor/dex-exchange",
              text: t("useful_page_source_codes"),
            },
          ]}
        />

        <NavigationExternalLinksContainer
          title={t("partners")}
          links={[
            {
              href: "https://eossupport.io/",
              text: t("partners_eos_support"),
            },
          ]}
        />
      </div>
    ),
    activeFlags: [],
  },
];

export default function Navigation() {
  const t = useTranslations("Navigation");

  const pathname = usePathname();

  return (
    <ul className="hidden xl:flex items-center">
      {menuItems.map((menuItem, index) => {
        if ("submenu" in menuItem) {
          return (
            <li key={menuItem.label + index}>
              <NavigationItemWithSubmenu
                title={menuItem.label ? t(menuItem.label) : ""}
                submenu={menuItem.submenu}
                active={pathname.includes(menuItem.activeFlags[0])}
              />
            </li>
          );
        }

        return (
          <li key={menuItem.label}>
            <NavigationItem
              title={t(menuItem.label)}
              href={menuItem.href}
              active={pathname.includes(menuItem.href)}
            />
          </li>
        );
      })}
    </ul>
  );
}
