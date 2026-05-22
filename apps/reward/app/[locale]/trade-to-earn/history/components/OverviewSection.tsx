"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { chainInfo, type OverviewRow } from "@/app/[locale]/trade-to-earn/history/data/historyData";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

interface Props {
  rows: OverviewRow[];
}

function ExportButtons() {
  return (
    <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
      <button className="flex h-8 w-full items-center justify-center gap-2 rounded-2 bg-green-bg px-4 py-3 text-14 text-primary-text hover:bg-tertiary-hover">
        CSV
        <Svg iconName="download" size={16} />
      </button>
      <button className="flex h-8 w-full items-center justify-center gap-2 rounded-2 bg-green-bg px-4 py-3 text-14 text-primary-text hover:bg-tertiary-hover">
        JSON
        <Svg iconName="download" size={16} />
      </button>
    </div>
  );
}

function MobileOverviewCard({ row }: { row: OverviewRow }) {
  const t = useTranslations("TradeToEarnHistory");
  const chain = chainInfo[row.chain];

  return (
    <article className="rounded-3 bg-tertiary-bg p-3">
      <div className="flex items-center gap-2 text-14 font-medium text-primary-text">
        <Image src={chain.logo} alt={chain.label} width={20} height={20} />
        {chain.label}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-12">
        <div className="min-w-0 rounded-2 bg-primary-bg p-2">
          <span className="text-secondary-text">{t("volume")}</span>
          <p className="mt-1 truncate text-primary-text">{row.volume}</p>
        </div>
        <div className="min-w-0 rounded-2 bg-primary-bg p-2">
          <span className="text-secondary-text">{t("fees")}</span>
          <p className="mt-1 truncate text-primary-text">{row.fees}</p>
        </div>
      </div>
    </article>
  );
}

export default function OverviewSection({ rows }: Props) {
  const t = useTranslations("TradeToEarnHistory");

  return (
    <section id="overview" className="scroll-mt-24 rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h2 className="text-16 font-medium leading-6 text-primary-text md:text-24">
            {t("overview_title")}
          </h2>
          <p className="mt-1 text-12 text-secondary-text lg:text-14">{t("overview_description")}</p>
        </div>
        <ExportButtons />
      </div>

      <div className="mt-3 grid gap-2 md:hidden">
        {rows.map((row) => (
          <MobileOverviewCard key={row.chain} row={row} />
        ))}
      </div>

      <div className="mt-4 hidden flex-col gap-1 md:flex">
        <div className="grid grid-cols-3 items-center rounded-2 bg-tertiary-bg px-4 py-3 text-12 text-secondary-text">
          <span>{t("network")}</span>
          <span>{t("volume")}</span>
          <span>{t("fees")}</span>
        </div>
        {rows.map((row) => {
          const chain = chainInfo[row.chain];
          return (
            <div
              key={row.chain}
              className="grid grid-cols-3 items-center px-4 py-3 text-14 text-primary-text"
            >
              <span className="flex items-center gap-2">
                <Image src={chain.logo} alt={chain.label} width={20} height={20} />
                {chain.label}
              </span>
              <span>{row.volume}</span>
              <span>{row.fees}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
