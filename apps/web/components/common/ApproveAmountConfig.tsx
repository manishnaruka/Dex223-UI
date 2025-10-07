import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import React from "react";
import { formatUnits, parseUnits } from "viem";

import { SingleAddressToken } from "@/app/[locale]/token-listing/add/hooks/useAutoListing";
import Input from "@/components/atoms/Input";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import { formatFloat } from "@/functions/formatFloat";
import { Currency } from "@/sdk_bi/entities/currency";

export default function ApproveAmountConfig({
  asset,
  isEditApproveActive,
  setEditApproveActive,
  amountToApprove,
  setAmountToApprove,
  minAmount,
}: {
  asset: Currency | SingleAddressToken;
  isEditApproveActive: boolean;
  setEditApproveActive: (value: boolean) => void;
  amountToApprove: string;
  setAmountToApprove: (value: string) => void;
  minAmount: bigint;
}) {
  return (
    <div
      className={clsx(
        "bg-tertiary-bg rounded-3 flex justify-between items-center px-5 py-2 min-h-12 mt-5 gap-5 mb-5",
        parseUnits(amountToApprove, asset.decimals ?? 18) < minAmount && "pb-[26px]",
      )}
    >
      <div className="flex items-center gap-1 text-secondary-text whitespace-nowrap">
        <Tooltip
          iconSize={20}
          text={
            " In order to make a swap with ERC-20 token you need to give the DEX contract permission to withdraw your tokens. All DEX'es require this operation. Here you are specifying the amount of tokens that you allow the contract to transfer on your behalf. Note that this amount never expires."
          }
        />
        <span className="text-14">Approve amount</span>
      </div>
      <div className="flex items-center gap-2 flex-grow justify-end">
        {!isEditApproveActive ? (
          <span className="text-14">
            {formatFloat(amountToApprove)} {asset.symbol}
          </span>
        ) : (
          <div className="flex-grow">
            <div className="relative w-full flex-grow">
              <Input
                isError={parseUnits(amountToApprove, asset.decimals ?? 18) < minAmount}
                className="h-8 pl-3"
                value={amountToApprove}
                onChange={(e) => setAmountToApprove(e.target.value)}
                type="text"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary-text">
                {asset.symbol}
              </span>
            </div>
            {parseUnits(amountToApprove, asset.decimals ?? 18) < minAmount && (
              <span className="text-red-light absolute text-12 translate-y-0.5">
                Must be higher or equal {formatUnits(minAmount, asset.decimals)}
              </span>
            )}
          </div>
        )}
        {!isEditApproveActive ? (
          <Button
            size={ButtonSize.EXTRA_SMALL}
            colorScheme={ButtonColor.LIGHT_GREEN}
            onClick={() => setEditApproveActive(true)}
          >
            Edit
          </Button>
        ) : (
          <Button
            disabled={parseUnits(amountToApprove, asset.decimals ?? 18) < minAmount}
            size={ButtonSize.EXTRA_SMALL}
            colorScheme={ButtonColor.LIGHT_GREEN}
            onClick={() => setEditApproveActive(false)}
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
