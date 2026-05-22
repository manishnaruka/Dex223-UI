"use client";

import { useTranslations } from "next-intl";

import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

interface Props {
  onUseGrace: () => void;
  onEarnGrace?: () => void;
}

export default function StreakBrokenBanner({ onUseGrace, onEarnGrace }: Props) {
  const t = useTranslations("TradeToEarn");

  return (
    <div className="min-w-0 rounded-3 border border-yellow-light/30 bg-yellow-bg/40 p-3 md:p-4">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-2 md:items-center md:gap-3">
          <span className="mt-0.5 flex-shrink-0 text-yellow-light md:mt-0">
            <Svg iconName="warning" size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-12 font-medium text-primary-text md:text-14">
              {t("streak_broken_title")}
            </p>
            <p className="mt-0.5 text-10 text-secondary-text md:text-12">
              {t("streak_broken_description")}
            </p>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2 md:flex md:flex-shrink-0 md:items-center md:gap-3">
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.SMALL}
            mobileSize={ButtonSize.SMALL}
            onClick={onUseGrace}
            className="min-w-0 px-2"
            fullWidth
          >
            {t("use_grace")}
          </Button>
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.SMALL}
            mobileSize={ButtonSize.SMALL}
            onClick={onEarnGrace}
            className="min-w-0 px-2"
            fullWidth
          >
            {t("earn_grace")}
          </Button>
        </div>
      </div>
    </div>
  );
}
