"use client";

import Preloader from "@repo/ui/preloader";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatGwei } from "viem";

import Svg from "@/components/atoms/Svg";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import { formatFloat } from "@/functions/formatFloat";
import { getFormattedGasPrice } from "@/functions/gasSettings";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { useGlobalFees } from "@/shared/hooks/useGlobalFees";
import { GasOption } from "@/stores/factories/createGasPriceStore";

import {
  useClaimGasLimitStore,
  useClaimGasPriceStore,
} from "../stores/useClaimGasSettingsStore";

export const gasOptionLabel: Record<GasOption, string> = {
  [GasOption.CHEAP]: "Cheaper",
  [GasOption.FAST]: "Faster",
  [GasOption.CUSTOM]: "Custom",
};

export function TokenMark({
  size = "default",
  muted = false,
}: {
  size?: "small" | "default" | "large";
  muted?: boolean;
}) {
  const imageSize = size === "large" ? 56 : size === "default" ? 32 : 20;

  return (
    <Image
      src="/images/tokens/USDT.svg"
      alt=""
      width={imageSize}
      height={imageSize}
      className={clsx(
        "shrink-0 rounded-full",
        muted ? "opacity-50 grayscale" : "shadow-[0_0_18px_rgba(112,197,158,0.45)]",
        size === "small" && "h-5 w-5",
        size === "default" && "h-8 w-8",
        size === "large" && "h-14 w-14",
      )}
    />
  );
}

interface NetworkDetailsProps {
  chainLabel: string;
  chainsLabel?: string;
  onEdit: () => void;
}

export function NetworkDetails({ chainLabel, chainsLabel, onEdit }: NetworkDetailsProps) {
  const chainId = useCurrentChainId();
  const { baseFee, gasPrice } = useGlobalFees();
  const { gasPriceOption, gasPriceSettings } = useClaimGasPriceStore();
  const { customGasLimit, estimatedGas } = useClaimGasLimitStore();

  const formattedGasPrice = useMemo(
    () =>
      getFormattedGasPrice({
        baseFee,
        chainId,
        gasPrice,
        gasPriceOption,
        gasPriceSettings,
      }),
    [baseFee, chainId, gasPrice, gasPriceOption, gasPriceSettings],
  );

  const gasPriceGwei = formattedGasPrice
    ? `${formatFloat(formatGwei(formattedGasPrice))} GWEI`
    : "—";

  const gasLimitValue = customGasLimit ?? (estimatedGas > BigInt(0) ? estimatedGas : undefined);
  const gasLimitDisplay = gasLimitValue ? gasLimitValue.toString() : "—";

  return (
    <div className="flex flex-col gap-2 text-12">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-secondary-text">
          <Svg iconName="info" size={16} />
          {chainsLabel ? "Chains" : "Chain"}
        </span>
        <span className="text-primary-text">{chainsLabel ?? chainLabel}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-secondary-text">
          <Svg iconName="info" size={16} />
          Contract
        </span>
        <span className="flex items-center gap-2 text-primary-text">
          0xabf...71d0
          <IconButton
            variant={IconButtonVariant.COPY}
            text="0xabf000000000000000000000000000000071d0"
          />
        </span>
      </div>
      <div className="mt-2 grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-2 rounded-3 bg-tertiary-bg px-4 py-3 text-secondary-text max-sm:grid-cols-3 max-sm:px-3 max-sm:py-3">
        <span>
          Gas price
          <span className="block text-primary-text">{gasPriceGwei}</span>
        </span>
        <span>
          Gas limit
          <span className="block text-primary-text">{gasLimitDisplay}</span>
        </span>
        <span>
          Network fee
          <span className="block text-primary-text">
            {formattedGasPrice && gasLimitValue
              ? `${formatFloat(
                  (Number(formattedGasPrice * gasLimitValue) / 1e18).toString(),
                )} ETH`
              : "—"}
          </span>
        </span>
        <span className="rounded-5 border border-secondary-border px-2 py-0.5 text-10 font-medium text-primary-text max-sm:col-start-1 max-sm:flex max-sm:h-9 max-sm:items-center max-sm:justify-center">
          {gasOptionLabel[gasPriceOption]}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-5 bg-green-bg px-3 py-1 text-10 font-medium text-primary-text duration-200 hover:bg-green-bg-hover max-sm:col-span-2 max-sm:h-9"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

interface ProofPanelProps {
  proof: Record<string, unknown>;
  defaultOpen?: boolean;
}

export function ProofPanel({ proof, defaultOpen = false }: ProofPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const formattedProof = useMemo(() => JSON.stringify(proof, null, 2), [proof]);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <div className="rounded-3 bg-tertiary-bg">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-12 text-secondary-text"
      >
        <span className="flex items-center gap-2">
          <Svg iconName="info" size={16} />
          Merkle proof
        </span>
        <Svg
          iconName="small-expand-arrow"
          size={18}
          className={clsx("duration-200", isOpen && "rotate-180")}
        />
      </button>
      {isOpen ? (
        <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap px-4 pb-4 text-12 leading-5 text-secondary-text">
          {formattedProof}
        </pre>
      ) : null}
    </div>
  );
}

export function WalletAlert({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 z-[1000] w-full border-t border-green bg-green-bg shadow-notification">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-3 px-4 py-4 text-14 text-primary-text md:px-8">
        <div className="flex items-center gap-3">
          <Preloader type="linear" />
          <span>Please confirm action in your wallet</span>
        </div>
        <IconButton variant={IconButtonVariant.CLOSE} handleClose={onClose} />
      </div>
    </div>
  );
}
