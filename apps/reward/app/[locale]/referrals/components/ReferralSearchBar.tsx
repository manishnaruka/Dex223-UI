"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { InputSize, SearchInput } from "@/components/atoms/Input";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onHistoryClick?: () => void;
}

export default function ReferralSearchBar({ value, onChange, onHistoryClick }: Props) {
  const t = useTranslations("Referrals");

  return (
    <div className="flex min-w-0 flex-row items-center justify-between gap-2 md:gap-3">
      <div className="min-w-0 flex-1 xl:flex-none xl:w-[480px]">
        <SearchInput
          inputSize={InputSize.LARGE}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("search_placeholder")}
          className="h-9 rounded-2 bg-primary-bg text-12 md:h-10 md:text-14"
        />
      </div>
      <Link href="/trade-to-earn/history">
        <Button
          variant={ButtonVariant.CONTAINED}
          colorScheme={ButtonColor.LIGHT_GREEN}
          size={ButtonSize.MEDIUM}
          mobileSize={ButtonSize.SMALL}
          className="min-w-[76px] px-3 md:min-w-[88px] md:px-4"
        >
          {t("history")}
        </Button>
      </Link>
    </div>
  );
}
