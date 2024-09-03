import { isZeroAddress } from "@ethereumjs/util";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { formatUnits } from "viem";

import { useAutoListingContract } from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import { useAutoListingContractStore } from "@/app/[locale]/token-listing/add/stores/useAutoListingContractStore";
import { useChoosePaymentDialogStore } from "@/app/[locale]/token-listing/add/stores/useChoosePaymentDialogStore";
import { usePaymentTokenStore } from "@/app/[locale]/token-listing/add/stores/usePaymentTokenStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { SearchInput } from "@/components/atoms/Input";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import IconButton from "@/components/buttons/IconButton";
import { formatFloat } from "@/functions/formatFloat";
import truncateMiddle from "@/functions/truncateMiddle";

export default function ChoosePaymentDialog() {
  const { isOpen: isPaymentDialogSelectOpened, setIsOpen: setPaymentDialogSelectOpened } =
    useChoosePaymentDialogStore();
  const [searchValue, setSearchValue] = useState("");

  const { autoListingContract } = useAutoListingContractStore();
  const autoListing = useAutoListingContract(autoListingContract);
  const { setPaymentToken } = usePaymentTokenStore();

  const payments = useMemo(() => {
    if (!searchValue) {
      return autoListing?.pricesDetail;
    }

    return autoListing?.pricesDetail.filter(
      (d: any) =>
        d.feeTokenAddress.name.toLowerCase().startsWith(searchValue.toLowerCase()) ||
        d.feeTokenAddress.symbol.toLowerCase().startsWith(searchValue.toLowerCase()),
    );
  }, [autoListing?.pricesDetail, searchValue]);

  return (
    <DrawerDialog isOpen={isPaymentDialogSelectOpened} setIsOpen={setPaymentDialogSelectOpened}>
      <DialogHeader
        onClose={() => setPaymentDialogSelectOpened(false)}
        title="Select a payment for listing"
      />
      <div className="pb-5 md:px-10 px-4">
        <SearchInput
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
          placeholder="Search name or paste contract"
        />
      </div>
      <div className="flex flex-col gap-2 pb-4">
        {Boolean(!searchValue || (searchValue && payments?.length)) &&
          payments?.map((a: any) => {
            return (
              <button
                onClick={() => {
                  setPaymentToken({ token: a.feeTokenAddress.id, price: BigInt(a.price) });
                  setPaymentDialogSelectOpened(false);
                }}
                key={a.id}
                className="px-4 md:px-10 md:w-full py-2.5 flex justify-between md:grid md:grid-cols-[1fr_1fr_40px] gap-2 items-center hover:bg-tertiary-bg duration-200"
              >
                <div className="flex items-center gap-2">
                  <Image src="/tokens/placeholder.svg" width={40} height={40} alt="" />
                  <span className="block w-[90px] sm:w-auto overflow-hidden overflow-ellipsis whitespace-nowrap text-left">
                    {a.feeTokenAddress.name}
                  </span>
                </div>
                <div className="flex items-center md:grid md:grid-cols-[58px_1fr] gap-1">
                  <div className="flex items-center">
                    <Badge
                      size="small"
                      variant={BadgeVariant.COLORED}
                      color="green"
                      text={isZeroAddress(a.feeTokenAddress.address) ? "Native" : "ERC-20"}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>
                      {formatUnits(a.price, a.feeTokenAddress.decimals).slice(0, 7) === "0.00000"
                        ? truncateMiddle(formatUnits(a.price, a.feeTokenAddress.decimals), {
                            charsFromStart: 3,
                            charsFromEnd: 2,
                          })
                        : formatFloat(formatUnits(a.price, a.feeTokenAddress.decimals))}
                    </span>
                    <span>{a.feeTokenAddress.symbol}</span>
                  </div>
                </div>
                <IconButton onClick={(e) => e.stopPropagation()} iconName="details" />
              </button>
            );
          })}
        {searchValue && !payments.length && (
          <div className="h-[340px] flex items-center rounded-5 bg-primary-bg justify-center flex-col">
            <EmptyStateIcon iconName="search-autolisting" />
            <span className="text-secondary-text">No tokens found</span>
          </div>
        )}
      </div>
    </DrawerDialog>
  );
}
