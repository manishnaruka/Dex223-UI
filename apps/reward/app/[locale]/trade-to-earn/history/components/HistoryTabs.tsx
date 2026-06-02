"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { clsxMerge } from "@/functions/clsxMerge";
import TabButton from "@/components/buttons/TabButton";

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
    <div className="mt-5 w-full flex lg:grid lg:grid-cols-4 bg-primary-bg p-1 gap-1 rounded-3 overflow-x-auto">
      {SECTION_IDS.map((id) => (
        <TabButton
          key={id}
          active={active === id}
          onClick={() => handleClick(id)}
          inactiveBackground="bg-secondary-bg"
          size={48}
        >
          {t(LABEL_KEYS[id])}
        </TabButton>
      ))}
    </div>
  );
}
