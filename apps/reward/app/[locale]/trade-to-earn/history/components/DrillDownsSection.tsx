"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { useTranslations } from "next-intl";

import DateRangePicker, {
  type DateRange,
} from "@/app/[locale]/trade-to-earn/history/components/DateRangePicker";
import FilterDropdown from "@/app/[locale]/trade-to-earn/history/components/FilterDropdown";
import {
  chainInfo,
  chainOptions,
  type ClaimRow,
  dexOptions,
  drillDownSummary,
  eligibilityReasonOptions,
  epochOptions,
  marketOptions,
  poolOptions,
  seasonOptions,
  sideOptions,
  statusOptions,
  type TradeRow,
} from "@/app/[locale]/trade-to-earn/history/data/historyData";
import { InputSize, SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Pagination from "@/components/common/Pagination";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { clsxMerge } from "@/functions/clsxMerge";
import TabButton from "@/components/buttons/TabButton";

interface Props {
  trades: TradeRow[];
  claims: ClaimRow[];
}

type DrillDownTab = "trades" | "claims";

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

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="flex min-w-0 items-center gap-1 text-12 text-secondary-text md:text-14">
      <Svg iconName="info" size={16} className="text-tertiary-text" />
      <span className="truncate">{label}:</span> <span className="text-primary-text">{value}</span>
    </span>
  );
}

function EligibilityDot({ kind }: { kind: TradeRow["eligibility"] }) {
  const color =
    kind === "eligible" ? "bg-green" : kind === "ineligible" ? "bg-red" : "bg-yellow-light";
  return <span className={clsxMerge("inline-block h-2 w-2 rounded-full", color)} />;
}

function StatusDot({ kind }: { kind: ClaimRow["status"] }) {
  const color =
    kind === "claimed" ? "bg-green" : kind === "unclaimed" ? "bg-red" : "bg-yellow-light";
  return <span className={clsxMerge("inline-block h-2 w-2 rounded-full", color)} />;
}

function DetailItem({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div
      className={clsxMerge(
        "min-w-0 rounded-2 bg-primary-bg p-2 text-12",
        align === "right" && "text-right",
      )}
    >
      <span className="block text-secondary-text">{label}</span>
      <span className="mt-1 block truncate text-primary-text">{value}</span>
    </div>
  );
}

function TradeCard({ row }: { row: TradeRow }) {
  const t = useTranslations("TradeToEarnHistory");
  const chain = chainInfo[row.chain];

  return (
    <article className="rounded-3 bg-tertiary-bg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-12 text-secondary-text">
            {row.date}, {row.time}
          </p>
          <div className="mt-1 flex items-center gap-2 text-14 font-medium text-primary-text">
            <Image src={chain.logo} alt={chain.label} width={18} height={18} />
            {chain.label}
          </div>
        </div>
        <span
          className={clsxMerge(
            "shrink-0 text-14 capitalize",
            row.side === "sell" ? "text-red" : "text-green",
          )}
        >
          {row.side}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <DetailItem label={t("dex_venue")} value={row.venue} />
        <DetailItem label={t("market")} value={row.market} />
        <DetailItem label={t("size_notional")} value={`${row.size} / ${row.notional}`} />
        <DetailItem label={t("fee")} value={row.fee} align="right" />
        <DetailItem
          label={t("eligibility")}
          value={
            <span className="flex items-center gap-2 capitalize">
              <EligibilityDot kind={row.eligibility} />
              {row.eligibility}
            </span>
          }
        />
        <DetailItem label={t("points_usdt")} value={row.points ?? "—"} align="right" />
      </div>
    </article>
  );
}

function ClaimCard({ row }: { row: ClaimRow }) {
  const t = useTranslations("TradeToEarnHistory");
  const chain = chainInfo[row.chain];

  return (
    <article className="rounded-3 bg-tertiary-bg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-12 capitalize text-secondary-text">{row.pool}</p>
          <div className="mt-1 flex items-center gap-2 text-14 font-medium text-primary-text">
            <Image src={chain.logo} alt={chain.label} width={18} height={18} />
            {chain.label}
          </div>
        </div>
        <span className="shrink-0 text-14 font-medium text-primary-text">{row.amount}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <DetailItem label={t("epoch")} value={row.epoch} />
        <DetailItem
          label={t("status")}
          value={
            <span className="flex items-center gap-2 capitalize">
              <StatusDot kind={row.status} />
              {row.status}
            </span>
          }
        />
        <DetailItem label={t("root_id")} value={row.rootId} />
        <DetailItem label={t("schema")} value={row.schema} />
        <DetailItem label={t("leaf")} value={<span className="text-green">{row.leaf}</span>} />
        <DetailItem
          label={t("transaction")}
          value={
            <span className="text-green underline decoration-green/40">{row.transaction}</span>
          }
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {row.canClaim ? (
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.SMALL}
            mobileSize={ButtonSize.SMALL}
            fullWidth
          >
            {t("claim")}
          </Button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="h-9 rounded-2 bg-primary-bg px-3 text-12 text-secondary-text duration-200 hocus:text-primary-text"
        >
          {t("view_proof")}
        </button>
      </div>
    </article>
  );
}

function TradesTable({ rows }: { rows: TradeRow[] }) {
  const t = useTranslations("TradeToEarnHistory");

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1100px]">
        <div className="grid grid-cols-[160px_120px_120px_120px_80px_minmax(220px,1fr)_120px_120px_140px_80px] items-center rounded-2 bg-tertiary-bg px-4 py-3 text-12 text-secondary-text">
          <span>{t("date_and_time")}</span>
          <span>{t("chain")}</span>
          <span>{t("dex_venue")}</span>
          <span>{t("market")}</span>
          <span>{t("side")}</span>
          <span className="text-right">{t("size_notional")}</span>
          <span className="text-right">{t("fee")}</span>
          <span>{t("eligibility")}</span>
          <span className="text-right">{t("points_usdt")}</span>
          <span>{t("epoch")}</span>
        </div>
        {rows.map((row) => {
          const chain = chainInfo[row.chain];
          return (
            <div
              key={row.id}
              className="grid grid-cols-[160px_120px_120px_120px_80px_minmax(220px,1fr)_120px_120px_140px_80px] items-center px-4 py-3 text-14 text-primary-text"
            >
              <span className="text-secondary-text">
                {row.date}, {row.time}
              </span>
              <span className="flex items-center gap-2">
                <Image src={chain.logo} alt={chain.label} width={18} height={18} />
                {chain.label}
              </span>
              <span>{row.venue}</span>
              <span>{row.market}</span>
              <span
                className={clsxMerge("capitalize", row.side === "sell" ? "text-red" : "text-green")}
              >
                {row.side}
              </span>
              <span className="text-right">
                {row.size} / {row.notional}
              </span>
              <span className="text-right">{row.fee}</span>
              <span className="flex items-center gap-2 capitalize text-secondary-text">
                <EligibilityDot kind={row.eligibility} />
                {row.eligibility}
              </span>
              <span className="text-right text-secondary-text">{row.points ?? "—"}</span>
              <span className="text-secondary-text">{row.epoch}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClaimsTable({ rows }: { rows: ClaimRow[] }) {
  const t = useTranslations("TradeToEarnHistory");

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1100px]">
        <div className="grid grid-cols-[80px_100px_80px_minmax(160px,1fr)_120px_180px_80px_120px_140px_180px] items-center rounded-2 bg-tertiary-bg px-4 py-3 text-12 text-secondary-text">
          <span>{t("pool")}</span>
          <span>{t("chain")}</span>
          <span>{t("epoch")}</span>
          <span className="text-right">{t("amount")}</span>
          <span>{t("status")}</span>
          <span>{t("root_id")}</span>
          <span>{t("schema")}</span>
          <span>{t("leaf")}</span>
          <span>{t("transaction")}</span>
          <span className="text-right">{t("actions")}</span>
        </div>
        {rows.map((row) => {
          const chain = chainInfo[row.chain];
          return (
            <div
              key={row.id}
              className="grid grid-cols-[80px_100px_80px_minmax(160px,1fr)_120px_180px_80px_120px_140px_180px] items-center px-4 py-3 text-14 text-primary-text"
            >
              <span className="text-secondary-text">{row.pool}</span>
              <span className="flex items-center gap-2">
                <Image src={chain.logo} alt={chain.label} width={18} height={18} />
                {chain.label}
              </span>
              <span className="text-secondary-text">{row.epoch}</span>
              <span className="text-right">{row.amount}</span>
              <span className="flex items-center gap-2 capitalize text-secondary-text">
                <StatusDot kind={row.status} />
                {row.status}
              </span>
              <span className="text-secondary-text">{row.rootId}</span>
              <span className="text-secondary-text">{row.schema}</span>
              <span className="text-green">{row.leaf}</span>
              <span className="text-green underline decoration-green/40">{row.transaction}</span>
              <span className="flex items-center justify-end gap-2">
                {row.canClaim ? (
                  <Button
                    variant={ButtonVariant.CONTAINED}
                    colorScheme={ButtonColor.LIGHT_GREEN}
                    size={ButtonSize.EXTRA_SMALL}
                    mobileSize={ButtonSize.EXTRA_SMALL}
                  >
                    {t("claim")}
                  </Button>
                ) : null}
                <button
                  type="button"
                  className="text-12 text-secondary-text duration-200 hocus:text-primary-text"
                >
                  {t("view_proof")}
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DrillDownsSection({ trades, claims }: Props) {
  const t = useTranslations("TradeToEarnHistory");
  const [tab, setTab] = useState<DrillDownTab>("trades");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [season, setSeason] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [chain, setChain] = useState("all");
  const [dex, setDex] = useState("all");
  const [market, setMarket] = useState("all");
  const [epoch, setEpoch] = useState("all");
  const [side, setSide] = useState("all");
  const [minNotional, setMinNotional] = useState("");
  const [eligibilityReason, setEligibilityReason] = useState("all");

  const [claimsPool, setClaimsPool] = useState("all");
  const [claimsChain, setClaimsChain] = useState("all");
  const [claimsEpoch, setClaimsEpoch] = useState("all");
  const [claimsStatus, setClaimsStatus] = useState("all");

  const total = tab === "trades" ? drillDownSummary.totalTrades : drillDownSummary.totalClaims;

  return (
    <section id="drill-downs" className="scroll-mt-24 rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
        <div className="min-w-0">
          <h2 className="text-16 font-medium leading-6 text-primary-text md:text-24">
            {t("drill_downs_title")}: {tab === "trades" ? t("trades") : t("claims")}
          </h2>
          <p className="mt-1 text-12 text-secondary-text lg:text-14">
            {t("drill_downs_description")}
          </p>
        </div>
        <div className="grid w-full shrink-0 grid-cols-1 gap-2 sm:grid-cols-[140px_1fr] md:w-auto">
          <div>
            <FilterDropdown
              value={season}
              onChange={setSeason}
              options={seasonOptions}
              searchable
              searchPlaceholder={t("search_season")}
              size="sm"
            />
          </div>
          <ExportButtons />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2 bg-tertiary-bg p-3 md:flex-row md:items-center md:justify-between">
        <span className="text-12 text-secondary-text md:text-14">{t("summary")}</span>
        <div className="grid gap-2 sm:grid-cols-3 md:flex md:flex-wrap md:items-center md:gap-x-5 md:gap-y-2">
          <SummaryItem
            label={t("total_eligible_trades")}
            value={drillDownSummary.totalEligibleTrades}
          />
          <SummaryItem label={t("total_claimed")} value={drillDownSummary.totalClaimed} />
          <SummaryItem label={t("pending_value")} value={drillDownSummary.pendingValue} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1 rounded-3 bg-tertiary-bg p-1">
        <TabButton
          active={tab === "trades"}
          onClick={() => setTab("trades")}
          inactiveBackground="bg-secondary-bg"
          size={48}
        >
          {t("trades")}
        </TabButton>
        <TabButton
          active={tab === "claims"}
          onClick={() => setTab("claims")}
          inactiveBackground="bg-secondary-bg"
          size={48}
        >
          {t("claims")}
        </TabButton>
      </div>

      <div className="mt-3">
        <SearchInput
          inputSize={InputSize.LARGE}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search_wallet")}
          className="h-10 rounded-2 bg-tertiary-bg text-12 md:text-14"
        />
      </div>

      {tab === "trades" ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <DateRangePicker
            label={t("date_range")}
            value={dateRange}
            onChange={setDateRange}
            placeholder={t("date_range_placeholder")}
          />
          <FilterDropdown
            label={t("chain")}
            value={chain}
            onChange={setChain}
            options={chainOptions}
          />
          <FilterDropdown label={t("dex")} value={dex} onChange={setDex} options={dexOptions} />
          <FilterDropdown
            label={t("market")}
            value={market}
            onChange={setMarket}
            options={marketOptions}
            searchable
            searchPlaceholder={t("search_token")}
          />
          <FilterDropdown
            label={t("epoch")}
            value={epoch}
            onChange={setEpoch}
            options={epochOptions}
            searchable
            searchPlaceholder={t("search_epoch")}
          />
          <FilterDropdown label={t("side")} value={side} onChange={setSide} options={sideOptions} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-12 text-secondary-text">{t("min_notional")}</span>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={minNotional}
                onChange={(e) => setMinNotional(e.target.value)}
                className="h-10 w-full rounded-2 border border-transparent bg-green-bg pl-3 pr-8 text-14 text-primary-text duration-200 placeholder:text-tertiary-text hocus:border-green focus:border-green focus:outline-0"
                placeholder=""
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-14 text-secondary-text">
                $
              </span>
            </div>
          </div>
          <FilterDropdown
            label={t("eligibility_reason")}
            value={eligibilityReason}
            onChange={setEligibilityReason}
            options={eligibilityReasonOptions}
          />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <FilterDropdown
            label={t("pool")}
            value={claimsPool}
            onChange={setClaimsPool}
            options={poolOptions}
          />
          <FilterDropdown
            label={t("chain")}
            value={claimsChain}
            onChange={setClaimsChain}
            options={chainOptions}
          />
          <FilterDropdown
            label={t("epoch")}
            value={claimsEpoch}
            onChange={setClaimsEpoch}
            options={epochOptions}
            searchable
            searchPlaceholder={t("search_epoch")}
          />
          <FilterDropdown
            label={t("status")}
            value={claimsStatus}
            onChange={setClaimsStatus}
            options={statusOptions}
          />
        </div>
      )}

      <p className="mt-4 text-12 text-secondary-text">
        {t("total")}: {total.toLocaleString()} {tab === "trades" ? t("trades") : t("claims")}
      </p>

      <div className="mt-2">
        <div className="grid gap-2 md:hidden">
          {tab === "trades"
            ? trades.map((row) => <TradeCard key={row.id} row={row} />)
            : claims.map((row) => <ClaimCard key={row.id} row={row} />)}
        </div>
        <div className="hidden md:block">
          {tab === "trades" ? <TradesTable rows={trades} /> : <ClaimsTable rows={claims} />}
        </div>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={page}
          onPageChange={(p) => setPage(Number(p))}
          pageSize={10}
          totalCount={total}
        />
      </div>
    </section>
  );
}
