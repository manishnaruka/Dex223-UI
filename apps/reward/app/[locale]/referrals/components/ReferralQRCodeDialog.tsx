"use client";

import { useTranslations } from "next-intl";
import { useMediaQuery } from "react-responsive";

import QRCodePlaceholder from "@/app/[locale]/referrals/components/QRCodePlaceholder";
import { useReferralQRCodeDialogStore } from "@/app/[locale]/referrals/stores/useReferralQRCodeDialogStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";

interface Props {
  link: string | null;
}

export default function ReferralQRCodeDialog({ link }: Props) {
  const t = useTranslations("Referrals");
  const { isOpen, setIsOpen } = useReferralQRCodeDialogStore();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const isCompactMobile = useMediaQuery({ query: "(max-width: 360px)" });
  const isTinyMobile = useMediaQuery({ query: "(max-width: 240px)" });
  const qrSize = isTinyMobile ? 120 : isCompactMobile ? 172 : isMobile ? 220 : 280;

  if (!link) return null;

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="mx-auto w-[calc(100vw-24px)] max-w-[600px] overflow-hidden rounded-t-3 bg-primary-bg p-3 shadow-2xl sm:rounded-5 md:p-6">
        <DialogHeader
          onClose={() => setIsOpen(false)}
          title={t("referral_qr_code")}
          className="px-1 sm:px-4 md:px-6"
        />
        <div className="flex flex-col items-center gap-4 px-1 pb-5 sm:px-4 md:px-6 md:pb-6">
          <QRCodePlaceholder value={link} size={qrSize} />
          <p className="text-center text-14 text-secondary-text">{t("scan_to_join")}</p>
        </div>
      </div>
    </DrawerDialog>
  );
}
