"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { useReferralQRCodeDialogStore } from "@/app/[locale]/referrals/stores/useReferralQRCodeDialogStore";
import Svg from "@/components/atoms/Svg";
import IconButton, { IconButtonSize, IconButtonVariant } from "@/components/buttons/IconButton";

interface Props {
  link: string | null;
  isConnected: boolean;
}

export default function ReferralLinkCard({ link, isConnected }: Props) {
  const t = useTranslations("Referrals");
  const { setIsOpen } = useReferralQRCodeDialogStore();

  const placeholder = isConnected ? "" : t("connect_wallet_get_link");

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-20 font-medium text-primary-text lg:text-24">{t("referral_link")}</h3>
        <p className="text-12 text-secondary-text lg:text-14">{t("referral_link_description")}</p>
      </div>
      <div className="flex w-full max-w-2xl min-w-0 items-stretch gap-2">
        <div className="relative min-w-0 flex-1">
          <div className="flex h-12 items-center rounded-3 border border-transparent bg-secondary-bg px-3 md:px-4 lg:px-5">
            <span className="min-w-0 flex-1 truncate text-12 text-secondary-text md:text-14">
              {link ?? placeholder}
            </span>
            {link ? (
              <IconButton
                variant={IconButtonVariant.COPY}
                text={link}
                buttonSize={IconButtonSize.SMALL}
              />
            ) : (
              <button
                type="button"
                disabled
                className="text-tertiary-text disabled:opacity-50"
                aria-label="copy"
              >
                <Svg iconName="copy" />
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          disabled={!link}
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-3 bg-green-bg text-secondary-text hocus:text-primary-text hocus:bg-green-bg-hover disabled:opacity-50 disabled:pointer-events-none duration-200"
          aria-label="qrcode"
        >
          <Image src="/images/qrCode.svg" alt="QR code" width={24} height={24} />
        </button>
      </div>
    </section>
  );
}
