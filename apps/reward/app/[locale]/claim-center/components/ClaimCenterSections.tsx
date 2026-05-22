"use client";

import Tooltip from "@repo/ui/tooltip";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import {
  type ClaimChainPayout,
  type ClaimLimit,
} from "@/app/[locale]/claim-center/data/claimCenterData";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

interface PayoutsProps {
  isConnected: boolean;
  onClaim: () => void;
  onSmartClaim: () => void;
  payouts: ClaimChainPayout[];
}

interface CapsProps {
  caps: ClaimLimit[];
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-20 font-medium leading-7 text-primary-text md:text-24 lg:text-28">
          {title}
        </h2>
        <p className="text-12 leading-5 text-secondary-text lg:text-14">{description}</p>
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
    </div>
  );
}

export function PayoutsPerChain({
  isConnected,
  onClaim,
  onSmartClaim,
  payouts,
}: PayoutsProps) {
  const t = useTranslations("ClaimCenter");

  return (
    <section className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <SectionHeader
        title={t("payouts_title")}
        description={t("payouts_description")}
        action={
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.MEDIUM}
            mobileSize={ButtonSize.SMALL}
            className="w-full sm:w-auto"
            disabled={!isConnected}
            onClick={onSmartClaim}
          >
            {t("smart_claim")}
          </Button>
        }
      />

      <div className="mt-3 grid gap-2.5 md:mt-4 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
        {payouts.map((payout) => {
          const isClaimed = payout.status === "claimed";

          return (
            <article
              className="flex min-w-0 flex-col gap-3 rounded-3 bg-tertiary-bg p-3 md:p-4"
              key={payout.chain}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[11px] text-secondary-text md:text-12">{payout.chain}</span>
                <span className="text-14 font-medium leading-5 text-primary-text md:text-18">
                  {usdFormatter.format(payout.amount)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-secondary-text md:text-12">
                  <Tooltip iconSize={16} text={t("fee_credits_tooltip")} />
                  {t("fee_credits", { count: payout.feeCredits })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={ButtonVariant.CONTAINED}
                  colorScheme={ButtonColor.LIGHT_GREEN}
                  size={ButtonSize.SMALL}
                  mobileSize={ButtonSize.SMALL}
                  fullWidth
                  className="px-2 text-[11px]"
                >
                  {t("view_contract")}
                </Button>
                <Button
                  variant={ButtonVariant.CONTAINED}
                  colorScheme={isClaimed ? ButtonColor.LIGHT_GREEN : ButtonColor.GREEN}
                  size={ButtonSize.SMALL}
                  mobileSize={ButtonSize.SMALL}
                  fullWidth
                  disabled={!isConnected || isClaimed}
                  onClick={onClaim}
                  className="px-2 text-[11px] disabled:bg-quaternary-bg"
                >
                  {isClaimed ? t("claimed") : t("claim")}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function MerkleProof() {
  const t = useTranslations("ClaimCenter");

  return (
    <section className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <SectionHeader
        title={t("merkle_title")}
        description={t("merkle_description")}
        action={
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.MEDIUM}
            mobileSize={ButtonSize.SMALL}
            className="w-full sm:w-auto"
          >
            {t("view_json")}
          </Button>
        }
      />
    </section>
  );
}

export function CapsAndClamps({ caps }: CapsProps) {
  const t = useTranslations("ClaimCenter");

  return (
    <section className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <SectionHeader
        title={t("caps_title")}
        description={t("caps_description")}
        action={
          <Button
            variant={ButtonVariant.CONTAINED}
            colorScheme={ButtonColor.LIGHT_GREEN}
            size={ButtonSize.MEDIUM}
            mobileSize={ButtonSize.SMALL}
            className="w-full sm:w-auto"
          >
            {t("view_contract")}
          </Button>
        }
      />
      <div className="mt-3 grid gap-2 md:mt-4 md:grid-cols-3 md:gap-3">
        {caps.map((cap) => (
          <article className="rounded-3 bg-tertiary-bg p-3 md:p-4" key={cap.label}>
            <span className="flex items-center gap-1 text-10 text-secondary-text md:text-12">
              {t(cap.label)}
              <Tooltip iconSize={16} text={t(`${cap.label}_tooltip`)} />
            </span>
            <p className="mt-1 text-12 font-medium text-primary-text md:mt-2 md:text-16">
              {cap.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
