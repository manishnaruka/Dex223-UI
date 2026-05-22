"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";

import Container from "@/components/atoms/Container";
import Svg from "@/components/atoms/Svg";
import { IconName } from "@/config/types/IconName";

type SocialIcon = Extract<IconName, "telegram" | "x" | "discord">;

type ExternalLink = {
  label: string;
  href: string;
};

type SocialLink = ExternalLink & {
  icon: SocialIcon;
};

const socialLinks: SocialLink[] = [
  { label: "discussions", href: "https://t.me/Dex223_defi", icon: "telegram" },
  { label: "announcements", href: "https://t.me/Dex_223", icon: "telegram" },
  { label: "dex223", href: "https://twitter.com/Dex_223", icon: "x" },
  { label: "discord", href: "https://discord.gg/t5bdeGC5Jk", icon: "discord" },
  { label: "dexaran", href: "https://x.com/Dexaran", icon: "x" },
];

const usefulLinks: ExternalLink[] = [
  {
    label: "useful_losses_calculator",
    href: "https://dexaran.github.io/erc20-losses/",
  },
  {
    label: "useful_converter",
    href: "https://dexaran.github.io/token-converter/",
  },
  {
    label: "useful_front_page",
    href: "https://dexaran.github.io/erc223/",
  },
  {
    label: "useful_page_source_codes",
    href: "https://github.com/Dalcor/dex-exchange",
  },
  {
    label: "useful_blog",
    href: "https://blog.dex223.io/",
  },
];

const partnerLinks: ExternalLink[] = [
  { label: "partners_eos_support", href: "https://blockzhub.io/" },
  { label: "partners_cls_global", href: "https://www.clsglobal.com/" },
  { label: "partners_beosin", href: "https://www.beosin.com/" },
  { label: "partners_roro", href: "https://rorotechnology.com/" },
];

const companyLinks: ExternalLink[] = [
  { label: "company_operating_agreement", href: "#" },
  { label: "company_token_description", href: "#" },
  { label: "company_privacy_policy", href: "#" },
  { label: "company_defi_agreement", href: "#" },
  { label: "company_trademark_policy", href: "#" },
];

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <h4 className="text-12 tracking-[0.1em] uppercase text-tertiary-text">
        {title}
      </h4>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function ExternalListItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: SocialIcon;
}) {
  const isDisabled = href === "#";

  return (
    <li>
      <a
        href={href}
        target={isDisabled ? undefined : "_blank"}
        rel="noreferrer"
        className={clsx(
          "inline-flex items-center gap-2 text-14 text-secondary-text duration-200",
          isDisabled
            ? "opacity-50 pointer-events-none"
            : "hocus:text-primary-text",
        )}
      >
        {icon ? (
          <Svg
            size={16}
            iconName={icon}
            className="text-tertiary-text shrink-0"
          />
        ) : null}
        <span>{label}</span>
      </a>
    </li>
  );
}

export default function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Navigation");

  return (
    <footer className="relative before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-to-r before:from-secondary-border/20 before:via-secondary-border before:via-50% before:to-secondary-border/20 pb-[64px] md:pb-0">
      <Container className="max-w-[1694px]">
        <div className="px-5 pt-10 pb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <FooterColumn title={t("social_media")}>
            {socialLinks.map((link) => (
              <ExternalListItem
                key={link.label}
                href={link.href}
                icon={link.icon}
                label={t(link.label as any)}
              />
            ))}
          </FooterColumn>

          <FooterColumn title={t("useful_links")}>
            {usefulLinks.map((link) => (
              <ExternalListItem
                key={link.label}
                href={link.href}
                label={tNav(link.label as any)}
              />
            ))}
          </FooterColumn>

          <FooterColumn title={t("partners")}>
            {partnerLinks.map((link) => (
              <ExternalListItem
                key={link.label}
                href={link.href}
                label={tNav(link.label as any)}
              />
            ))}
          </FooterColumn>

          <FooterColumn title={t("company")}>
            {companyLinks.map((link) => (
              <ExternalListItem
                key={link.label}
                href={link.href}
                label={tNav(link.label as any)}
              />
            ))}
          </FooterColumn>
        </div>

        <div className="mx-5 border-t border-secondary-border" />

        <div className="px-5 py-6 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <p className="text-12 text-tertiary-text max-w-[820px] leading-relaxed">
            {t("disclaimer")}
          </p>
          <div className="text-12 text-tertiary-text sm:text-right shrink-0">
            <p>{t("copyright", { year: new Date().getFullYear() })}</p>
            <p>{t("all_rights_reserved")}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
