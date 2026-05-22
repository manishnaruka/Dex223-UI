"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import DrawerDialog from "@/components/atoms/DrawerDialog";
import Svg from "@/components/atoms/Svg";

export type LootUnlockedVariant =
  | { type: "demo_box" }
  | { type: "demo_fee_credit"; amount: number }
  | { type: "fee_credit"; amount: number }
  | { type: "jackpot"; amount: string }
  | { type: "near_miss"; percent: string };

interface Props {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  variant: LootUnlockedVariant;
}

function HeroCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex h-[160px] w-[200px] flex-col items-center justify-center gap-3 rounded-3 bg-tertiary-bg p-4 md:h-44 md:w-44">
      <div className="flex flex-1 items-center justify-center">{icon}</div>
      <span className="text-center text-14 font-medium text-primary-text">{label}</span>
    </div>
  );
}

function GiftBoxIcon() {
  return (
    <Image
      src="/images/Vector.svg"
      alt=""
      width={96}
      height={96}
      className="h-24 w-24 md:h-28 md:w-28"
    />
  );
}

function TagIcon({ label }: { label: string }) {
  return (
    <HeroCard
      icon={<Image src="/images/Vector.svg" alt="" width={60} height={60} className="h-14 w-14" />}
      label={label}
    />
  );
}

function UsdtIcon({ label }: { label: string }) {
  return (
    <HeroCard
      icon={
        <Image src="/images/tokens/USDT.svg" alt="" width={64} height={64} className="h-14 w-14" />
      }
      label={label}
    />
  );
}

function VariantHero({ variant }: { variant: LootUnlockedVariant }) {
  const t = useTranslations("TradeToEarn");

  switch (variant.type) {
    case "demo_box":
      return <GiftBoxIcon />;
    case "demo_fee_credit":
      return <TagIcon label={t("loot_demo_fee_credit_value", { amount: variant.amount })} />;
    case "fee_credit":
      return <TagIcon label={t("loot_fee_credit_value", { amount: variant.amount })} />;
    case "jackpot":
      return <UsdtIcon label={t("loot_jackpot_value", { amount: variant.amount })} />;
    case "near_miss":
      return <UsdtIcon label={t("loot_near_miss_value", { percent: variant.percent })} />;
  }
}

function getVariantCopy(variant: LootUnlockedVariant) {
  switch (variant.type) {
    case "demo_box":
      return {
        titleKey: "loot_demo_box_title" as const,
        descriptionKey: "loot_demo_box_description" as const,
      };
    case "demo_fee_credit":
      return {
        titleKey: "loot_demo_fee_credit_title" as const,
        descriptionKey: "loot_demo_fee_credit_description" as const,
      };
    case "fee_credit":
      return {
        titleKey: "loot_fee_credit_title" as const,
        descriptionKey: "loot_fee_credit_description" as const,
      };
    case "jackpot":
      return {
        titleKey: "loot_jackpot_title" as const,
        descriptionKey: "loot_jackpot_description" as const,
      };
    case "near_miss":
      return {
        titleKey: "loot_near_miss_title" as const,
        descriptionKey: "loot_near_miss_description" as const,
      };
  }
}

export default function LootUnlockedDialog({ isOpen, onOpenChange, variant }: Props) {
  const t = useTranslations("TradeToEarn");
  const { titleKey, descriptionKey } = getVariantCopy(variant);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={onOpenChange} maxMobileWidth="520px">
      <div className="w-[calc(100vw-24px)] max-w-[600px] rounded-5 bg-primary-bg p-4 shadow-2xl md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-16 font-medium text-primary-text md:text-18">{t("loot_unlocked")}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-6 w-6 items-center justify-center text-secondary-text hocus:text-primary-text"
            aria-label="Close"
          >
            <Svg iconName="close" size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 py-2 text-center md:py-3">
          <VariantHero variant={variant} />
          <div className="flex flex-col gap-1">
            <h3 className="text-16 font-medium text-primary-text md:text-18">{t(titleKey)}</h3>
            <p className="text-12 text-secondary-text md:text-14">{t(descriptionKey)}</p>
          </div>
        </div>
      </div>
    </DrawerDialog>
  );
}
