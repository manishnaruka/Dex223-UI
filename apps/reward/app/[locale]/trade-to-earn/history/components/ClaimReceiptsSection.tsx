"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  chainInfo,
  type ClaimReceipt,
} from "@/app/[locale]/trade-to-earn/history/data/historyData";
import Pagination from "@/components/common/Pagination";
import Svg from "@/components/atoms/Svg";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

interface Props {
  receipts: ClaimReceipt[];
}

const POOL_LABELS = {
  trading: "Trading pool",
  social: "Social pool",
  referral: "Referral pool",
} as const;

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

export default function ClaimReceiptsSection({ receipts }: Props) {
  const t = useTranslations("TradeToEarnHistory");
  const [page, setPage] = useState(1);

  return (
    <section id="claim-receipts" className="scroll-mt-24 rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h2 className="text-16 font-medium leading-6 text-primary-text md:text-24">
            {t("claim_receipts_title")}
          </h2>
          <p className="mt-1 text-12 text-secondary-text lg:text-14">
            {t("claim_receipts_description")}
          </p>
        </div>
        <ExportButtons />
      </div>

      <div className="mt-3 grid gap-2 md:hidden">
        {receipts.map((receipt) => {
          const chain = chainInfo[receipt.chain];
          return (
            <article className="rounded-3 bg-tertiary-bg p-3" key={receipt.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-12 text-secondary-text">{POOL_LABELS[receipt.pool]}</p>
                  <button
                    type="button"
                    className="mt-1 block max-w-full truncate text-left text-14 text-green underline decoration-green/40 underline-offset-2 hocus:text-green-hover-icon"
                  >
                    {receipt.hash}
                  </button>
                </div>
                <span className="shrink-0 text-14 font-medium text-primary-text">
                  {receipt.amount}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-12 text-secondary-text">
                <Image src={chain.logo} alt={chain.label} width={18} height={18} />
                {chain.label}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 hidden flex-col gap-1 overflow-x-auto md:flex">
        <div className="grid min-w-[640px] grid-cols-4 items-center rounded-2 bg-tertiary-bg px-4 py-3 text-12 text-secondary-text">
          <span>{t("pool")}</span>
          <span>{t("hash")}</span>
          <span>{t("amount")}</span>
          <span>{t("chain")}</span>
        </div>
        {receipts.map((receipt) => {
          const chain = chainInfo[receipt.chain];
          return (
            <div
              key={receipt.id}
              className="grid min-w-[640px] grid-cols-4 items-center px-4 py-3 text-14 text-primary-text"
            >
              <span className="text-secondary-text">{POOL_LABELS[receipt.pool]}</span>
              <button
                type="button"
                className="w-fit text-left text-green underline decoration-green/40 underline-offset-2 hocus:text-green-hover-icon"
              >
                {receipt.hash}
              </button>
              <span>{receipt.amount}</span>
              <span className="flex items-center gap-2">
                <Image src={chain.logo} alt={chain.label} width={20} height={20} />
                {chain.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={page}
          onPageChange={(p) => setPage(Number(p))}
          pageSize={10}
          totalCount={240}
        />
      </div>
    </section>
  );
}
