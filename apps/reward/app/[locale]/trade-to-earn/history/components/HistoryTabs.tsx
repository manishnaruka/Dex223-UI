"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { clsxMerge } from "@/functions/clsxMerge";

const SECTION_IDS = ["overview", "streak-timeline", "claim-receipts", "drill-downs"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const LABEL_KEYS = {
  overview: "overview_title",
  "streak-timeline": "streak_timeline_title",
  "claim-receipts": "claim_receipts_title",
  "drill-downs": "drill_downs_title",
} as const;

export default function HistoryTabs() {
  const t = useTranslations("TradeToEarnHistory");
  const [active, setActive] = useState<SectionId>("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActive(visible[0].target.id as SectionId);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid grid-cols-2 gap-1 rounded-3 bg-primary-bg p-1 sm:grid-cols-4">
      {SECTION_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => handleClick(id)}
          className={clsxMerge(
            "flex min-h-10 items-center justify-center rounded-2 px-2 py-2 text-center text-12 leading-4 duration-200 md:px-4 md:py-2.5 md:text-14",
            active === id
              ? "bg-green-bg text-primary-text border border-green"
              : "border border-transparent text-secondary-text hocus:bg-secondary-bg hocus:text-primary-text",
          )}
        >
          {t(LABEL_KEYS[id])}
        </button>
      ))}
    </div>
  );
}
