"use client";

import { useState } from "react";

import {
  LeaderboardView,
  leaderboardViewLabels,
} from "@/app/[locale]/leaderboard/data/leaderboardData";
import Svg from "@/components/atoms/Svg";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props {
  value: LeaderboardView;
  onChange: (value: LeaderboardView) => void;
  isConnected: boolean;
}

export default function LeaderboardSelect({ value, onChange, isConnected }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const options: LeaderboardView[] = isConnected ? ["top10", "top1000", "cluster"] : ["top10"];

  return (
    <div className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={clsxMerge(
          "flex h-9 w-full min-w-0 items-center justify-between gap-3 rounded-3 bg-secondary-bg px-4 text-14 text-primary-text duration-200 hocus:shadow hocus:shadow-green/60 hocus:text-green md:h-10 md:min-w-[116px]",
          isOpen && "shadow shadow-green/60 text-green",
        )}
      >
        <span>{leaderboardViewLabels[value]}</span>
        <Svg
          iconName="small-expand-arrow"
          className={clsxMerge("text-secondary-text duration-200", isOpen && "rotate-180")}
        />
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-full min-w-[180px] overflow-hidden rounded-3 border border-secondary-border bg-secondary-bg shadow-2xl md:w-[220px]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={clsxMerge(
                "flex w-full items-center justify-between px-4 py-3 text-left text-16 text-secondary-text duration-200 hocus:bg-green-bg hocus:text-primary-text",
                option === value && "bg-green-bg text-primary-text",
              )}
            >
              <span>{leaderboardViewLabels[option]}</span>
              {option === value ? <Svg iconName="check" className="text-green" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
