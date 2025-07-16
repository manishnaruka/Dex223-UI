import GradientCard, { CardGradient } from "@repo/ui/gradient-card";
import Tooltip from "@repo/ui/tooltip";
import Image from "next/image";
import React from "react";
import { formatEther, formatGwei, formatUnits } from "viem";
import { useReadContract, useWalletClient } from "wagmi";

import { LendingOrder } from "@/app/[locale]/margin-trading/hooks/useOrder";
import SwapDetailsRow from "@/app/[locale]/swap/components/SwapDetailsRow";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import { MARGIN_MODULE_ABI } from "@/config/abis/marginModule";
import { formatFloat } from "@/functions/formatFloat";
import { MARGIN_TRADING_ADDRESS } from "@/sdk_bi/addresses";
import { DexChainId } from "@/sdk_bi/chains";

export default function OrderCloseDialog({
  isOpen,
  setIsOpen,
  orderId,
  order,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  orderId: number;
  order: LendingOrder;
}) {
  const { data: walletClient } = useWalletClient();

  const { data: isOrderOpen } = useReadContract({
    abi: MARGIN_MODULE_ABI,
    address: MARGIN_TRADING_ADDRESS[DexChainId.SEPOLIA],
    functionName: "isOrderOpen",
    args: [BigInt(orderId)],
  });

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title="Close lending order" />
      <div className="card-spacing-x card-spacing-b min-w-[600px]">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Image width={32} height={32} src="/images/tokens/placeholder.svg" alt="" />
            <span className="text-secondary-text text-18 font-bold">{order.baseAsset.name}</span>
            <div className="flex items-center gap-3 text-green">
              Active
              <div className="w-2 h-2 rounded-full bg-green"></div>
            </div>
          </div>
          <div className="text-secondary-text text-12 py-2 px-4 rounded-2 bg-tertiary-bg">
            <span className="text-tertiary-text">ID: </span>
            {orderId}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <GradientCard
            gradient={CardGradient.BLUE_LIGHT}
            className="flex px-5 py-3 justify-between "
          >
            <div className="">
              <div className="items-center flex gap-1 text-tertiary-text">
                Available balance
                <Tooltip text="Tooltip text" />
              </div>

              <p className="font-medium text-20">
                {formatUnits(order.balance, order.baseAsset.decimals ?? 18)}{" "}
                <span className="text-secondary-text">{order.baseAsset.symbol}</span>
              </p>
            </div>
          </GradientCard>

          <GradientCard className=" px-5 py-3 ">
            <div className="">
              <div className="items-center flex gap-1 text-tertiary-text">
                Total balance
                <Tooltip text="Tooltip text" />
              </div>

              <p className="font-medium text-20">
                2233.34 <span className="text-secondary-text">{order.baseAsset.symbol}</span>
              </p>
            </div>
          </GradientCard>
        </div>
        <div className="flex flex-col gap-2 my-4">
          <SwapDetailsRow
            tooltipText="Tooltip text"
            title="Max leverage"
            value={`${order.leverage}x`}
          />
          <SwapDetailsRow
            tooltipText="Tooltip text"
            title="Interest rate per month"
            value={`${order.interestRate / 100}%`}
          />
          <SwapDetailsRow tooltipText="Tooltip text" title="Deadline" value={`${order.deadline}`} />
        </div>
        <div className="bg-tertiary-bg px-5 py-2 mb-5 flex justify-between items-center rounded-3 flex-col xs:flex-row">
          <div className="text-12 xs:text-14 flex items-center gap-8 justify-between xs:justify-start max-xs:w-full">
            <p className="flex flex-col text-tertiary-text">
              <span>Gas price:</span>
              <span> {formatFloat(formatGwei(BigInt(0)))} GWEI</span>
            </p>

            <p className="flex flex-col text-tertiary-text">
              <span>Gas limit:</span>
              <span>{100000}</span>
            </p>
            <p className="flex flex-col">
              <span className="text-tertiary-text">Network fee:</span>
              <span>{formatFloat(formatEther(BigInt(0) * BigInt(0), "wei"))} ETH</span>
            </p>
          </div>
          <div className="grid grid-cols-[auto_1fr] xs:flex xs:items-center gap-2 w-full xs:w-auto mt-2 xs:mt-0">
            <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text border border-secondary-border max-xs:h-8">
              Cheaper
            </span>
            <Button
              colorScheme={ButtonColor.LIGHT_GREEN}
              size={false ? ButtonSize.SMALL : ButtonSize.EXTRA_SMALL}
              onClick={() => null}
              fullWidth={false}
              className="rounded-5"
            >
              Edit
            </Button>
          </div>
        </div>

        <Button
          onClick={async () => {
            if (!walletClient) {
              return;
            }

            await walletClient.writeContract({
              abi: MARGIN_MODULE_ABI,
              address: MARGIN_TRADING_ADDRESS[DexChainId.SEPOLIA],
              functionName: "setOrderStatus",
              args: [BigInt(orderId), !isOrderOpen],
            });
          }}
          fullWidth
        >
          {isOrderOpen ? "Close order" : "Open order"}
        </Button>
      </div>
    </DrawerDialog>
  );
}
