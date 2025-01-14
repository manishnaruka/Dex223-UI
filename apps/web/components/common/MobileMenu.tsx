import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { formatGwei } from "viem";
import { useGasPrice } from "wagmi";

import Collapse from "@/components/atoms/Collapse";
import Drawer from "@/components/atoms/Drawer";
import LocaleSwitcher from "@/components/atoms/LocaleSwitcher";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import { useFeedbackDialogStore } from "@/components/dialogs/stores/useFeedbackDialogStore";
import { IconName } from "@/config/types/IconName";
import { clsxMerge } from "@/functions/clsxMerge";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useScopedBlockNumber from "@/hooks/useScopedBlockNumber";
import { Link, usePathname } from "@/i18n/routing";
export function MobileLink({
  href,
  iconName,
  title,
  handleClose,
  isActive,
  disabled = false,
  className = "",
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
  handleClick?: (e: any) => void;
  isMenu?: boolean;
  isExternal?: boolean;
}) {
  if (isExternal) {
    return (
      <a
        target="_blank"
        onClick={(e) => {
          if (handleClick) {
            handleClick(e);
          }

          handleClose();
        }}
        href={href}
        className={clsxMerge(
          "flex items-center gap-2 py-3 px-4 duration-200",
          !isActive && "hocus:bg-quaternary-bg text-secondary-text",
          isActive && !isMenu && "text-green pointer-events-none",
          isActive && isMenu && "bg-navigation-active-mobile text-green pointer-events-none",
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
    <Link
      onClick={(e) => {
        if (handleClick) {
          handleClick(e);
        }

        handleClose();
      }}
      href={href}
      className={clsxMerge(
        "flex items-center gap-2 py-3 px-4 duration-200",
        !isActive && "hocus:bg-quaternary-bg text-secondary-text",
        isActive && !isMenu && "text-green pointer-events-none",
        isActive && isMenu && "bg-navigation-active-mobile text-green pointer-events-none",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <Svg iconName={iconName} />
      {title}
    </Link>
  );
}

function NavigationExternalLink({ href, text }: { href: string; text: string }) {
  return (
    <a
      target="_blank"
      className={clsx(
        "text-green hocus:text-green-hover duration-200 inline-block py-1",
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
    <div className="text-primary-text">
      <div className="text-tertiary-text">{title}</div>
      <div className="flex flex-col">
        {links.map((link) => {
          return <NavigationExternalLink key={link.text} href={link.href} text={link.text} />;
        })}
      </div>
    </div>
  );
}

const mobileLinks: {
  href: string;
  iconName: IconName;
  title: any;
}[] = [
  {
    href: "/swap",
    iconName: "swap",
    title: "swap",
  },
  {
    href: "/margin-trading",
    iconName: "margin-trading",
    title: "margin_trading",
  },
  {
    href: "/pools",
    iconName: "pools",
    title: "pools",
  },
  {
    href: "/borrow",
    iconName: "borrow",
    title: "borrow_lend",
  },
  {
    href: "/portfolio",
    iconName: "portfolio",
    title: "portfolio",
  },
  {
    href: "/token-listing",
    iconName: "listing",
    title: "token_listing",
  },
];

type SocialLink = {
  title: any;
  href: string;
  icon: Extract<IconName, "telegram" | "x" | "discord">;
};

const socialLinks: SocialLink[] = [
  {
    title: "Announcements",
    href: "https://t.me/Dex_223",
    icon: "telegram",
  },
  {
    title: "Discussions",
    href: "https://t.me/Dex223_defi",
    icon: "telegram",
  },
  {
    title: "DEX223",
    href: "https://x.com/Dex_223",
    icon: "x",
  },
  {
    title: "Dexaran",
    href: "https://x.com/Dexaran",
    icon: "x",
  },
  {
    title: "Discord",
    href: "https://discord.gg/t5bdeGC5Jk",
    icon: "discord",
  },
];
export default function MobileMenu() {
  const t = useTranslations("Navigation");
  const tFeedback = useTranslations("Feedback");

  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const [moreOpened, setMoreOpened] = useState(false);
  const pathname = usePathname();
  const { setIsOpen: setOpenFeedbackDialog } = useFeedbackDialogStore();

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      setMobileMenuOpened(false);
    },
  });

  const tFooter = useTranslations("Footer");

  const chainId = useCurrentChainId();

  const { data: gasData, refetch } = useGasPrice({
    chainId: chainId || 1,
  });

  const { data: blockNumber } = useScopedBlockNumber();

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  return (
    <div className="xl:hidden">
      <Drawer
        handlers={handlers}
        placement="left"
        isOpen={mobileMenuOpened}
        setIsOpen={setMobileMenuOpened}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="py-6 grid gap-1">
            {[
              mobileLinks.map(({ href, iconName, title }) => {
                return (
                  <MobileLink
                    isMenu
                    key={href}
                    href={href}
                    iconName={iconName}
                    title={t(title)}
                    handleClose={() => setMobileMenuOpened(false)}
                    isActive={pathname.includes(href)}
                    disabled={!["/swap", "/pools", "/portfolio", "/token-listing"].includes(href)}
                  />
                );
              }),
            ]}
            <div>
              <button
                onClick={() => setMoreOpened(!moreOpened)}
                className={clsx(
                  "flex w-full items-center justify-between py-3 px-4 hocus:text-green duration-200 text-secondary-text",
                  moreOpened && "bg-navigation-active-mobile text-green",
                )}
              >
                <span className="flex gap-2">
                  <Svg iconName="more" />
                  {t("more")}
                </span>
                <Svg
                  className={clsx(moreOpened && "-rotate-180", "duration-200")}
                  iconName="small-expand-arrow"
                />
              </button>
              <Collapse open={moreOpened}>
                <div className="py-2 border-b border-secondary-border">
                  <MobileLink
                    href="#"
                    iconName="list"
                    title="Token lists"
                    handleClose={() => setMobileMenuOpened(false)}
                    className="pr-5"
                    disabled
                  />
                  <MobileLink
                    isExternal
                    href="https://blog.dex223.io/"
                    iconName="blog"
                    title="Blog"
                    handleClose={() => setMobileMenuOpened(false)}
                    className="pr-5"
                  />
                  <MobileLink
                    disabled
                    href="/statistics"
                    iconName="statistics"
                    title="Statistics"
                    handleClose={() => setMobileMenuOpened(false)}
                    className="pr-5"
                  />
                  <MobileLink
                    disabled
                    href="#"
                    iconName="guidelines"
                    title="Guidelines"
                    handleClose={() => setMobileMenuOpened(false)}
                    className="pr-5"
                  />
                </div>
                <div className="flex flex-col py-4 px-4 bg-primary-bg rounded-2 gap-3">
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
                <div className="flex flex-col mt-2 pt-3 px-4 border-t border-secondary-border">
                  <h4 className="text-tertiary-text">Social media</h4>

                  {socialLinks.map((link) => {
                    return (
                      <a
                        key={link.title}
                        target="_blank"
                        href={link.href}
                        className="flex gap-2 items-center text-secondary-text py-1 hocus:text-primary-text duration-200"
                      >
                        <Svg iconName={link.icon} className="text-tertiary-text" /> {link.title}
                      </a>
                    );
                  })}
                </div>
              </Collapse>
            </div>
          </div>
          <div className="flex flex-grow items-end gap-4 px-4 pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-12 text-secondary-text">
                  <Svg size={16} className="text-tertiary-text" iconName="gas" />
                  <span>
                    {tFooter("gas")}{" "}
                    <a
                      target="_blank"
                      className="text-green"
                      href={getExplorerLink(ExplorerLinkType.GAS_TRACKER, "", chainId)}
                    >
                      {gasData ? formatFloat(formatGwei(gasData)) : ""} GWEI
                    </a>
                  </span>
                </div>
                <div className="bg-primary-border w-[1px] h-3" />
                <div className="flex items-center gap-1.5 text-12 group relative">
                  {blockNumber ? (
                    <a
                      target="_blank"
                      className="text-green"
                      href={getExplorerLink(
                        ExplorerLinkType.BLOCK,
                        blockNumber.toString(),
                        chainId,
                      )}
                    >
                      {blockNumber.toString()}
                    </a>
                  ) : null}
                  <div className="w-1.5 h-1.5 rounded-full bg-green" />

                  <div className="z-[1000] whitespace-nowrap text-14 opacity-0 pointer-events-none px-5 py-4 absolute group-hocus:opacity-100 duration-200 bottom-9 rounded-3 right-0 bg-primary-bg border border-secondary-border before:w-2.5 before:h-2.5 before:-bottom-[6px] before:bg-primary-bg before:absolute before:right-9 before:rotate-45 before:border-secondary-border before:border-r before:border-b">
                    <p>{tFooter("most_recent_block")}</p>
                    <p>{tFooter("prices_update_on_every_block")}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <LocaleSwitcher isMobile={true} />
                <Button
                  size={ButtonSize.MEDIUM}
                  fullWidth
                  colorScheme={ButtonColor.LIGHT_GREEN}
                  endIcon="star"
                  onClick={() => {
                    setMobileMenuOpened(false);
                    setOpenFeedbackDialog(true);
                  }}
                >
                  {tFeedback("feedback")}
                </Button>
              </div>
            </div>
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
