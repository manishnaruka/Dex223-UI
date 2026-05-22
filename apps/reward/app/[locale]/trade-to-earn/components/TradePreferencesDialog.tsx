"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { InputSize, SearchInput } from "@/components/atoms/Input";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";

export interface TradePreferences {
  chainId: string;
  pairId: string;
}

interface Props {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  initialPreferences?: TradePreferences;
  onSave?: (preferences: TradePreferences) => void;
}

interface ChainOption {
  id: string;
  label: string;
  logo: string;
}

interface PairOption {
  id: string;
  label: string;
}

const CHAIN_OPTIONS: ChainOption[] = [
  { id: "ethereum", label: "Ethereum", logo: "/images/chains/ethereum.svg" },
  { id: "base", label: "Base", logo: "/images/chains/base.svg" },
  { id: "bsc", label: "BSC", logo: "/images/chains/bsc.svg" },
  { id: "arbitrum", label: "Arbitrum", logo: "/images/chains/arbitrum.svg" },
  { id: "optimism", label: "Optimism", logo: "/images/chains/optimism.svg" },
  { id: "polygon", label: "Polygon", logo: "/images/chains/polygon.svg" },
];

const PAIR_OPTIONS_BY_CHAIN: Record<string, PairOption[]> = {
  ethereum: [
    { id: "eth-usdt", label: "ETH/USDT" },
    { id: "btc-usdt", label: "BTC/USDT" },
    { id: "d23-usdt", label: "D23/USDT" },
    { id: "pepe-weth", label: "PEPE/WETH" },
    { id: "usdc-usdt", label: "USDC/USDT" },
    { id: "link-eth", label: "LINK/ETH" },
  ],
  base: [
    { id: "eth-usdc", label: "ETH/USDC" },
    { id: "cbeth-eth", label: "cbETH/ETH" },
    { id: "d23-usdc", label: "D23/USDC" },
  ],
  bsc: [
    { id: "bnb-usdt", label: "BNB/USDT" },
    { id: "cake-bnb", label: "CAKE/BNB" },
    { id: "d23-bnb", label: "D23/BNB" },
  ],
  arbitrum: [
    { id: "eth-usdc-arb", label: "ETH/USDC" },
    { id: "arb-usdc", label: "ARB/USDC" },
  ],
  optimism: [
    { id: "eth-usdc-op", label: "ETH/USDC" },
    { id: "op-usdc", label: "OP/USDC" },
  ],
  polygon: [
    { id: "matic-usdc", label: "MATIC/USDC" },
    { id: "weth-usdc-poly", label: "WETH/USDC" },
  ],
};

export const DEFAULT_TRADE_PREFERENCES: TradePreferences = {
  chainId: "ethereum",
  pairId: "eth-usdt",
};

function RadioDot({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={clsx(
        "m-0 box-border flex h-4 w-4 flex-shrink-0 rounded-full border-[3px] border-secondary-bg outline outline-1 duration-200",
        isActive
          ? "bg-green outline-green"
          : "bg-secondary-bg outline-secondary-border group-hocus:outline-green",
      )}
    />
  );
}

function ChainPill({
  chain,
  isActive,
  onSelect,
}: {
  chain: ChainOption;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "group flex h-10 items-center gap-2 rounded-3 bg-secondary-bg px-3 text-14 duration-200 hocus:bg-tertiary-bg",
        isActive ? "text-primary-text" : "text-secondary-text hocus:text-primary-text",
      )}
    >
      <RadioDot isActive={isActive} />
      <Image
        src={chain.logo}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0 rounded-full"
      />
      <span className="truncate">{chain.label}</span>
    </button>
  );
}

function PairRow({
  pair,
  isActive,
  onSelect,
}: {
  pair: PairOption;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "group flex h-11 w-full items-center gap-3 rounded-3 bg-secondary-bg px-4 text-14 duration-200 hocus:bg-tertiary-bg",
        isActive ? "text-primary-text" : "text-secondary-text hocus:text-primary-text",
      )}
    >
      <RadioDot isActive={isActive} />
      <span className="truncate">{pair.label}</span>
    </button>
  );
}

export default function TradePreferencesDialog({
  isOpen,
  onOpenChange,
  initialPreferences = DEFAULT_TRADE_PREFERENCES,
  onSave,
}: Props) {
  const t = useTranslations("TradeToEarn");

  const [selectedChainId, setSelectedChainId] = useState(initialPreferences.chainId);
  const [selectedPairId, setSelectedPairId] = useState(initialPreferences.pairId);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedChainId(initialPreferences.chainId);
      setSelectedPairId(initialPreferences.pairId);
      setSearchValue("");
    }
  }, [isOpen, initialPreferences.chainId, initialPreferences.pairId]);

  const filteredPairs = useMemo(() => {
    const pairsForChain = PAIR_OPTIONS_BY_CHAIN[selectedChainId] ?? [];
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return pairsForChain;
    }
    return pairsForChain.filter((pair) => pair.label.toLowerCase().includes(query));
  }, [searchValue, selectedChainId]);

  const handleChainSelect = (chainId: string) => {
    setSelectedChainId(chainId);
    const firstPair = PAIR_OPTIONS_BY_CHAIN[chainId]?.[0];
    if (firstPair) {
      setSelectedPairId(firstPair.id);
    }
    setSearchValue("");
  };

  const isValid = Boolean(selectedChainId && selectedPairId);

  const handleSave = () => {
    if (!isValid) {
      return;
    }
    onSave?.({ chainId: selectedChainId, pairId: selectedPairId });
    onOpenChange(false);
  };

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={onOpenChange} maxMobileWidth="520px">
      <div className="flex max-h-[90vh] w-[calc(100vw-24px)] max-w-[600px] flex-col rounded-5 bg-primary-bg shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-18 font-bold text-primary-text md:text-20">
            {t("trade_preferences_title")}
          </h2>
          <IconButton variant={IconButtonVariant.CLOSE} handleClose={() => onOpenChange(false)} />
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 md:px-6 md:pb-5">
          <div className="flex flex-col gap-2">
            <label className="text-14 font-medium text-primary-text">{t("select_chain")}</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CHAIN_OPTIONS.map((chain) => (
                <ChainPill
                  key={chain.id}
                  chain={chain}
                  isActive={selectedChainId === chain.id}
                  onSelect={() => handleChainSelect(chain.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-14 font-medium text-primary-text">{t("select_pair")}</label>
            <SearchInput
              inputSize={InputSize.DEFAULT}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("search_pair_placeholder")}
            />

            {filteredPairs.length > 0 ? (
              <ul className="mt-1 flex max-h-[200px] flex-col gap-1 overflow-y-auto pr-1">
                {filteredPairs.map((pair) => (
                  <li key={pair.id}>
                    <PairRow
                      pair={pair}
                      isActive={selectedPairId === pair.id}
                      onSelect={() => setSelectedPairId(pair.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 py-4">
                <EmptyStateIcon iconName="search" size={80} />
                <p className="text-12 text-secondary-text">{t("no_pairs_found")}</p>
              </div>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button
              variant={ButtonVariant.CONTAINED}
              colorScheme={ButtonColor.LIGHT_GREEN}
              size={ButtonSize.LARGE}
              mobileSize={ButtonSize.MEDIUM}
              onClick={() => onOpenChange(false)}
            >
              {t("trade_preferences_cancel")}
            </Button>
            <Button
              variant={ButtonVariant.CONTAINED}
              colorScheme={ButtonColor.GREEN}
              size={ButtonSize.LARGE}
              mobileSize={ButtonSize.MEDIUM}
              onClick={handleSave}
              disabled={!isValid}
            >
              {t("trade_preferences_save")}
            </Button>
          </div>
        </div>
      </div>
    </DrawerDialog>
  );
}
