import { useLocale } from "next-intl";
import React, { useMemo, useState } from "react";

import useAutoListing from "@/app/[locale]/token-listing/add/hooks/useAutoListing";
import useAutoListingContracts from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import { useAutoListingContractStore } from "@/app/[locale]/token-listing/add/stores/useAutoListingContractStore";
import { useChooseAutoListingDialogStore } from "@/app/[locale]/token-listing/add/stores/useChooseAutoListingDialogStore";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import { SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import IconButton from "@/components/buttons/IconButton";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import { filterAutoListings, filterTokenLists } from "@/functions/searchTokens";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";

export default function ChooseAutoListingDialog() {
  const { isOpen: isAutoListingSelectOpened, setIsOpen: setAutoListingSelectOpened } =
    useChooseAutoListingDialogStore();
  const locale = useLocale();
  const chainId = useCurrentChainId();
  const [searchValue, setSearchValue] = useState("");
  const autoListings = useAutoListingContracts();
  const { setAutoListingContract } = useAutoListingContractStore();
  const { autoListing } = useAutoListing();

  const filteredAutoListings = useMemo(() => {
    if (!autoListings) {
      return null;
    }

    if (!searchValue) {
      return autoListings;
    } else {
      return filterAutoListings(searchValue, autoListings);
    }
  }, [autoListings, searchValue]);

  return (
    <DrawerDialog isOpen={isAutoListingSelectOpened} setIsOpen={setAutoListingSelectOpened}>
      <DialogHeader
        onClose={() => setAutoListingSelectOpened(false)}
        title="Select auto-listing contract"
      />
      <div className="pb-5 px-4 md:px-10 ">
        <SearchInput
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
          placeholder="Search name or paste contract"
        />
      </div>

      {(!searchValue || (searchValue && !!filteredAutoListings?.length)) && (
        <div className="flex flex-col gap-2 pb-4">
          {filteredAutoListings?.map((a) => {
            return (
              <button
                onClick={() => {
                  setAutoListingContract(a.id);
                  setAutoListingSelectOpened(false);
                }}
                key={a.id}
                className="w-full flex items-center justify-between hocus:bg-tertiary-bg duration-200 px-4 md:px-10 py-2"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium w-[70px] overflow-ellipsis overflow-hidden md:w-[244px] whitespace-nowrap text-left">
                    {a.name}
                  </span>
                  <span className="text-14">{a.tokens.length} tokens</span>
                </div>
                <div className="flex items-center md:gap-3 gap-2">
                  {a.id === autoListing?.id && (
                    <Svg iconName="check" className="text-green" size={32} />
                  )}
                  {a.isFree ? (
                    <Badge variant={BadgeVariant.COLORED} text="Free" color="green" />
                  ) : (
                    <Badge variant={BadgeVariant.COLORED} text="Paid" color="grey" />
                  )}
                  <ExternalTextLink
                    onClick={(e) => e.stopPropagation()}
                    text={truncateMiddle(a.id, { charsFromEnd: 3, charsFromStart: 3 })}
                    href={getExplorerLink(ExplorerLinkType.ADDRESS, a.id, chainId)}
                  />
                  <a
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    href={`/${locale}/token-listing/contracts/${a.id}`}
                  >
                    <IconButton iconName="listing-details" />
                  </a>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {searchValue && !filteredAutoListings?.length && (
        <div className="h-[340px] flex items-center rounded-5 bg-primary-bg justify-center flex-col">
          <EmptyStateIcon iconName="search-autolisting" />
          <span className="text-secondary-text">No tokenlists found</span>
        </div>
      )}
    </DrawerDialog>
  );
}
