"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { Link } from "@/i18n/routing";
import Svg from "@/components/atoms/Svg";

export default function HistoryHeader() {
  const t = useTranslations("TradeToEarnHistory");

  return (
    <div className="flex flex-col gap-3 md:gap-5">
      <Link
        href="/trade-to-earn"
        className="flex items-center gap-1 text-12 text-secondary-text duration-200 hocus:text-primary-text md:text-14"
      >
        <Svg iconName="back" size={20} />
        {t("back_to_reward_program")}
      </Link>

      <div className="relative min-h-[104px] overflow-hidden rounded-3 bg-gradient-to-r via-[#3C4C4A] from-primary-bg to-secondary-bg sm:min-h-[88px]">
        <Image
          src="/images/rewardProgramcard.svg"
          alt=""
          width={396}
          height={156}
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[180%] w-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-15 md:block"
        />
        <div className="relative flex flex-col items-stretch justify-between gap-3 px-3 py-4 sm:flex-row sm:items-center sm:px-4 sm:py-5 md:px-6 md:py-6">
          <h1 className="text-20 font-medium leading-7 text-primary-text md:text-28">
            {t("reward_history")}
          </h1>
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.MEDIUM}
            mobileSize={ButtonSize.SMALL}
            className="w-full shrink-0 sm:w-auto"
          >
            {t("public_epoch_report")}
          </Button>
        </div>
      </div>
    </div>
  );
}
