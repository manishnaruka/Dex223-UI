"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  type FomoEventType,
  type FomoFeedEvent,
} from "@/app/[locale]/trade-to-earn/data/tradeToEarnData";
import { InputSize, SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { clsxMerge } from "@/functions/clsxMerge";

interface Props {
  isConnected: boolean;
  events: FomoFeedEvent[];
}

const PAGE_SIZE = 10;

const eventIconMap: Record<FomoEventType, { icon: string; tone: string }> = {
  jackpot: { icon: "🎉", tone: "text-green" },
  near_miss: { icon: "🟡", tone: "text-yellow-light" },
  nft_upgrade: { icon: "✨", tone: "text-primary-text" },
};

function FomoItem({ event, isHighlighted }: { event: FomoFeedEvent; isHighlighted: boolean }) {
  const t = useTranslations("TradeToEarn");
  const { icon } = eventIconMap[event.type];

  return (
    <div
      className={clsxMerge(
        "flex min-w-0 flex-col gap-2 rounded-3 p-3",
        isHighlighted ? "bg-quaternary-bg" : "bg-tertiary-bg",
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 shrink-0 text-14 leading-none">{icon}</span>
          <p className="min-w-0 break-words text-12 text-primary-text">{event.text}</p>
        </div>
        <span className="max-w-[84px] shrink-0 truncate text-right text-12 text-tertiary-text sm:max-w-none">
          #{event.id}
        </span>
      </div>
      {isHighlighted ? (
        <Button
          variant={ButtonVariant.CONTAINED}
          colorScheme={ButtonColor.LIGHT_GREEN}
          size={ButtonSize.SMALL}
          mobileSize={ButtonSize.SMALL}
          fullWidth
          endIcon="forward"
        >
          {t("share_win")}
        </Button>
      ) : null}
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (next: number) => void;
}) {
  if (pageCount <= 1) return null;

  const items: Array<number | "ellipsis"> = [];
  if (pageCount <= 4) {
    for (let i = 1; i <= pageCount; i += 1) items.push(i);
  } else {
    items.push(1, 2, 3, "ellipsis", pageCount);
  }

  return (
    <div className="mt-3 flex items-center justify-center gap-1 pt-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-7 w-7 items-center justify-center rounded-2 text-secondary-text hocus:text-primary-text disabled:opacity-40"
      >
        <Svg iconName="previous" size={16} />
      </button>
      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-12 text-secondary-text">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={clsxMerge(
              "flex h-7 min-w-7 items-center justify-center rounded-20 px-2 text-12",
              item === page
                ? "bg-green-bg text-green"
                : "text-secondary-text hocus:text-primary-text",
            )}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="flex h-7 w-7 items-center justify-center rounded-2 text-secondary-text hocus:text-primary-text disabled:opacity-40"
      >
        <Svg iconName="next" size={16} />
      </button>
    </div>
  );
}

export default function FomoFeedSection({ isConnected, events }: Props) {
  const t = useTranslations("TradeToEarn");
  const [searchValue, setSearchValue] = useState("");
  const [showMyWinsOnly, setShowMyWinsOnly] = useState(false);
  const [page, setPage] = useState(1);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (showMyWinsOnly && !event.isMyWin) return false;
      if (!searchValue) return true;
      return (
        event.id.toLowerCase().includes(searchValue.toLowerCase()) ||
        event.text.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
  }, [events, searchValue, showMyWinsOnly]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageEvents = filteredEvents.slice(startIdx, startIdx + PAGE_SIZE);

  const isEmpty = pageEvents.length === 0;
  const isSearchActive = searchValue.length > 0;
  const showMyWinsEmpty = showMyWinsOnly && isEmpty && !isSearchActive;
  const showSearchEmpty = isEmpty && isSearchActive;

  return (
    <section className="flex h-full min-w-0 flex-col rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-20 font-medium leading-7 text-primary-text md:text-24">
            {t("fomo_feed_title")}
          </h2>
          <p className="mt-1 text-12 leading-5 text-secondary-text">{t("fomo_feed_description")}</p>
        </div>
        <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-20 bg-green-bg px-2 text-12 text-green">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          {t("live")}
        </span>
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <SearchInput
            inputSize={InputSize.DEFAULT}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setPage(1);
            }}
            placeholder={t("fomo_search_placeholder")}
            className="h-9 rounded-2 bg-secondary-bg text-12"
          />
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-12 text-secondary-text sm:gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer accent-green"
            checked={showMyWinsOnly}
            onChange={(e) => {
              setShowMyWinsOnly(e.target.checked);
              setPage(1);
            }}
          />
          {t("my_wins")}
        </label>
      </div>

      <div className="mt-4 flex min-w-0 flex-1 flex-col gap-2.5 md:gap-3">
        {showMyWinsEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
            <Svg iconName="star" size={56} className="text-tertiary-text" />
            <p className="text-12 text-secondary-text">{t("no_wins_yet")}</p>
          </div>
        ) : showSearchEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
            <Svg iconName="search" size={56} className="text-tertiary-text" />
            <p className="text-12 text-secondary-text">{t("no_wins_found")}</p>
          </div>
        ) : (
          pageEvents.map((event, idx) => (
            <FomoItem
              key={event.id}
              event={event}
              isHighlighted={
                isConnected && idx === 0 && !showMyWinsOnly && !isSearchActive && safePage === 1
              }
            />
          ))
        )}
      </div>

      <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
    </section>
  );
}
