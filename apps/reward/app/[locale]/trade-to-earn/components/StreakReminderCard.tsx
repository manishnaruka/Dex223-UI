"use client";

import { useTranslations } from "next-intl";

import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

interface Props {
  onDismiss: () => void;
}

export default function StreakReminderCard({ onDismiss }: Props) {
  const t = useTranslations("TradeToEarn");

  return (
    <div className="min-w-0 rounded-3 border border-secondary-border bg-tertiary-bg/60 p-3 md:p-4">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-14 font-medium text-primary-text">{t("dont_drop_streak_title")}</p>
          <p className="mt-1 text-12 leading-5 text-secondary-text">
            {t("dont_drop_streak_description")}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-12 text-secondary-text hocus:text-primary-text"
        >
          {t("dismiss")}
        </button>
      </div>
      <div className="mt-3 flex min-w-0 items-center gap-2">
        <Button
          variant={ButtonVariant.CONTAINED}
          colorScheme={ButtonColor.LIGHT_GREEN}
          size={ButtonSize.SMALL}
          mobileSize={ButtonSize.SMALL}
          className="flex-1"
        >
          {t("trade_now")}
        </Button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-2 text-secondary-text hocus:text-primary-text"
        >
          <Svg iconName="settings" size={20} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <button
          type="button"
          className="rounded-2 bg-secondary-bg px-3 py-1.5 text-12 text-secondary-text hocus:text-primary-text"
        >
          {t("snooze_4h")}
        </button>
        <button
          type="button"
          className="rounded-2 bg-secondary-bg px-3 py-1.5 text-12 text-secondary-text hocus:text-primary-text"
        >
          {t("snooze_24h")}
        </button>
        <button
          type="button"
          className="col-span-2 rounded-2 bg-secondary-bg px-3 py-1.5 text-12 text-secondary-text hocus:text-primary-text sm:col-span-1"
        >
          {t("use_grace")}
        </button>
      </div>
      <p className="mt-3 text-10 text-tertiary-text">{t("slippage_info")}</p>
    </div>
  );
}
