"use client";

import { useTranslations } from "next-intl";

import { type StreakDay } from "@/app/[locale]/trade-to-earn/history/data/historyData";
import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props {
  days: StreakDay[];
}

function DayCell({ day }: { day: StreakDay }) {
  const baseClass =
    "flex h-10 w-full items-center justify-center rounded-2 text-secondary-text sm:h-12";

  if (day.status === "completed") {
    return (
      <div className={clsxMerge(baseClass, "bg-tertiary-bg text-primary-text")}>
        <Svg iconName="check" size={20} />
      </div>
    );
  }

  if (day.status === "broken") {
    return (
      <div className={clsxMerge(baseClass, "bg-orange-900/40 text-orange-300")}>
        <Svg iconName="check" size={20} />
      </div>
    );
  }

  if (day.status === "today") {
    return (
      <div className={clsxMerge(baseClass, "bg-green-bg text-green")}>
        <Svg iconName="check" size={20} />
      </div>
    );
  }

  if (day.status === "reset") {
    return (
      <div className={clsxMerge(baseClass, "bg-tertiary-bg text-tertiary-text")}>
        <Svg iconName="delete" size={20} />
      </div>
    );
  }

  return (
    <div className={clsxMerge(baseClass, "bg-tertiary-bg text-tertiary-text")}>
      <Svg iconName="add" size={20} />
    </div>
  );
}

export default function StreakTimelineSection({ days }: Props) {
  const t = useTranslations("TradeToEarnHistory");

  return (
    <section
      id="streak-timeline"
      className="scroll-mt-24 rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6"
    >
      <h2 className="text-16 font-medium leading-6 text-primary-text md:text-24">
        {t("streak_timeline_title")}
      </h2>
      <p className="mt-1 text-12 text-secondary-text lg:text-14">
        {t("streak_timeline_description")}
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
        {days.map((day) => (
          <div className="flex flex-col items-center gap-2" key={day.day}>
            <DayCell day={day} />
            <span
              className={clsxMerge(
                "text-[11px] sm:text-12",
                day.status === "today" ? "text-primary-text" : "text-secondary-text",
              )}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
