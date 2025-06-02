import Tooltip from "@repo/ui/tooltip";
import clsx from "clsx";
import Image from "next/image";
import React from "react";
import { formatUnits, parseUnits } from "viem";

import LendingOrderDetailsRow from "@/app/[locale]/margin-trading/lending-order/create/components/LendingOrderDetailsRow";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Input from "@/components/atoms/Input";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import { Standard } from "@/sdk_bi/standard";

export default function ReviewLendingOrderDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [isEditApproveActive, setEditApproveActive] = React.useState(false);

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <DialogHeader onClose={() => setIsOpen(false)} title={"Review lending order"} />

      <div className="card-spacing-x card-spacing-b min-w-[600px]">
        <div className="bg-tertiary-bg rounded-3 py-4 px-5 mb-4">
          <p className="text-secondary-text text-14">Loan amount</p>
          <div className="flex justify-between items-center my-1">
            <span className="font-medium text-20">1000</span>
            <span className="flex items-center gap-2">
              <Image src={"/images/tokens/placeholder.svg"} alt={"USDT"} width={32} height={32} />
              <span>USDT</span>
              <Badge variant={BadgeVariant.STANDARD} standard={Standard.ERC20} />
            </span>
          </div>
          <p className="text-tertiary-text text-14">$1,000.00</p>
        </div>
        <div className="flex flex-col gap-2 mb-5">
          <LendingOrderDetailsRow
            title="Margin positions duration"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Lending order deadline"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Interest rate per month"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Interest rate for the entire period"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="You will receive for the entire period"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow title="Leverage" value={"30 days"} tooltipText="Tooltip text" />
          <LendingOrderDetailsRow title="LTV" value={"30 days"} tooltipText="Tooltip text" />
          <LendingOrderDetailsRow
            title="Accepted collateral tokens"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Tokens allowed for trading"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Minimum borrowing amount"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Order currency limit"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="May initiate liquidation"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Pays the liquidation deposit"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Liquidation fee (for liquidator)"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Liquidation fee (for lender)"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
          <LendingOrderDetailsRow
            title="Liquidation price source"
            value={"30 days"}
            tooltipText="Tooltip text"
          />
        </div>
        <div
          className={clsx(
            "bg-tertiary-bg rounded-3 flex justify-between items-center px-5 py-2 min-h-12 mt-5 gap-5 mb-5",
            // parseUnits(amountToApprove, paymentToken.token.decimals) <
            //   paymentToken.price * BigInt(tokensToList.length) && "pb-[26px]",
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
                {1000} {"USDT"}
              </span>
            ) : (
              <div className="flex-grow">
                <div className="relative w-full flex-grow">
                  <Input
                    // isError={
                    //   parseUnits(amountToApprove, paymentToken.token.decimals) <
                    //   paymentToken.price * BigInt(tokensToList.length)
                    // }
                    className="h-8 pl-3"
                    // value={amountToApprove}
                    // onChange={(e) => setAmountToApprove(e.target.value)}
                    type="text"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary-text">
                    {"USDT"}
                  </span>
                </div>
                {/*{parseUnits(amountToApprove, paymentToken.token.decimals) <*/}
                {/*  paymentToken.price * BigInt(tokensToList.length) && (*/}
                {/*  <span className="text-red-light absolute text-12 translate-y-0.5">*/}
                {/*    Must be higher or equal{" "}*/}
                {/*    {formatUnits(*/}
                {/*      paymentToken.price * BigInt(tokensToList.length),*/}
                {/*      paymentToken.token.decimals,*/}
                {/*    )}*/}
                {/*  </span>*/}
                {/*)}*/}
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
                // disabled={
                //   parseUnits(amountToApprove, paymentToken.token.decimals) <
                //   paymentToken.price * BigInt(tokensToList.length)
                // }
                size={ButtonSize.EXTRA_SMALL}
                colorScheme={ButtonColor.LIGHT_GREEN}
                onClick={() => setEditApproveActive(false)}
              >
                Save
              </Button>
            )}
          </div>
        </div>

        <Button fullWidth>Create lending order</Button>
      </div>
    </DrawerDialog>
  );
}
