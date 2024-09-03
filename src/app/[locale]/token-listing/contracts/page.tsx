"use client";

import clsx from "clsx";
import React, { useMemo, useState } from "react";
import { formatUnits } from "viem";

import useAutoListingContracts from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import Container from "@/components/atoms/Container";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { clsxMerge } from "@/functions/clsxMerge";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import { Link } from "@/navigation";
import { DexChainId } from "@/sdk_hybrid/chains";

export default function TokenListingPage() {
  const [searchValue, setSearchValue] = useState("");

  const autoListings = useAutoListingContracts();

  console.log(autoListings);

  const filteredAutoListings = useMemo(() => {
    if (!autoListings.data) {
      return null;
    }

    if (!searchValue) {
      return autoListings.data.autoListings;
    } else {
      return autoListings.data.autoListings.filter(
        (l: any) =>
          l.name.toLowerCase().startsWith(searchValue.toLowerCase()) ||
          l.id.toLowerCase().startsWith(searchValue.toLowerCase()),
      );
    }
  }, [autoListings.data, searchValue]);

  if (!filteredAutoListings) {
    return <Preloader />;
  }

  return (
    <>
      <Container>
        <div className="my-10 px-4">
          <Link href="/token-listing">
            <button className="flex items-center gap-2">
              <Svg iconName="back" />
              Back to token listing
            </button>
          </Link>
        </div>
        <div className="pb-10">
          <div className="flex justify-between mb-20 flex-col xl:flex-row px-4">
            <h1 className="mb-3 text-40 font-medium">Auto-listing contracts</h1>
            <div className="w-[480px]">
              <SearchInput
                className="bg-tertiary-bg"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search name or paste contract"
              />
            </div>
          </div>
        </div>

        {(!searchValue || (searchValue && !!filteredAutoListings.length)) && (
          <>
            <div className="grid grid-cols-1 xl:hidden px-4 gap-4">
              {filteredAutoListings.map((o: any) => {
                return (
                  <Link
                    key={o.id}
                    href={`/token-listing/contracts/${o.id}`}
                    className="hover:bg-green-bg duration-200 group bg-primary-bg rounded-5 pb-4 px-4 pt-3"
                  >
                    <div className="text-18 font-medium">{o.name}</div>
                    <div className="mb-3">{o.totalTokens} tokens</div>
                    <div
                      className={clsxMerge(
                        "flex justify-between pl-4 pr-2 py-2.5 bg-tertiary-bg rounded-2 mt-2 mb-3",
                        !!o.pricesDetail.length && "flex-grow w-full flex-wrap justify-start",
                      )}
                    >
                      <span
                        className={clsx(
                          "text-secondary-text",
                          !!o.pricesDetail.length && "basis-full mb-1",
                        )}
                      >
                        Listing price
                      </span>
                      {o.pricesDetail.length
                        ? o.pricesDetail.map((c: any) => (
                            <span
                              key={c.feeTokenAddress.id}
                              className="flex items-center gap-1 bg-quaternary-bg rounded-2 px-2 py-1"
                            >
                              <span>
                                <span className="overflow-hidden ">
                                  {+formatUnits(c.price, c.feeTokenAddress.decimals) <= 0
                                    ? truncateMiddle(
                                        formatUnits(c.price, c.feeTokenAddress.decimals),
                                      )
                                    : formatUnits(c.price, c.feeTokenAddress.decimals)}
                                </span>{" "}
                                {c.feeTokenAddress.symbol}
                              </span>
                              <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                            </span>
                          ))
                        : "Free"}
                    </div>
                    <div className="flex justify-between pl-4 pr-2 py-2.5 bg-tertiary-bg rounded-2 mt-2 mb-3">
                      <span className="text-secondary-text">Contract link</span>
                      <ExternalTextLink
                        onClick={(e) => e.stopPropagation()}
                        color="white"
                        text={truncateMiddle(o.id)}
                        href={getExplorerLink(ExplorerLinkType.ADDRESS, o.id, DexChainId.SEPOLIA)}
                      />
                    </div>
                    <div className="flex-grow">
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        href={`/token-listing/add/?autoListingContract=${o.id}`}
                      >
                        <Button
                          fullWidth
                          className="hover:bg-green hover:text-black"
                          variant={ButtonVariant.OUTLINED}
                          size={ButtonSize.MEDIUM}
                        >
                          List tokens
                        </Button>
                      </Link>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="hidden xl:grid rounded-2 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,1.33fr),_minmax(77px,1.33fr),_minmax(87px,2.67fr),_minmax(55px,1.33fr),_minmax(50px,max-content)]">
              <div className="contents">
                <div className="pl-5 h-[60px] flex items-center relative">Contract name</div>
                <div className="h-[60px] flex items-center relative">Token amount</div>
                <div className="h-[60px] flex items-center relative">Listing price</div>
                <div className="h-[60px] flex items-center relative">Contact link</div>
                <div className="pr-5 h-[60px] flex items-center relative">Action</div>
              </div>

              {filteredAutoListings.map((o: any) => {
                return (
                  <Link
                    key={o.id}
                    href={`/token-listing/contracts/${o.id}`}
                    className="contents hover:bg-green-bg duration-200 group"
                  >
                    <div className="h-[56px] z-10 relative flex items-center group-hover:bg-green-bg gap-2 pl-5 duration-200 pr-2">
                      {o.name}
                    </div>

                    <div className=" h-[56px] z-10 relative flex items-center group-hover:bg-green-bg duration-200 pr-2">
                      {o.totalTokens} tokens
                    </div>
                    <div className=" h-[56px] z-10 relative flex items-center gap-2 group-hover:bg-green-bg duration-200 pr-2">
                      {o.pricesDetail.length
                        ? o.pricesDetail.map((c: any) => (
                            <span
                              key={c.feeTokenAddress.id}
                              className="flex items-center gap-1 bg-tertiary-bg rounded-2 px-2 py-1"
                            >
                              <span>
                                <span className="overflow-hidden ">
                                  {+formatUnits(c.price, c.feeTokenAddress.decimals) <= 0
                                    ? truncateMiddle(
                                        formatUnits(c.price, c.feeTokenAddress.decimals),
                                      )
                                    : formatUnits(c.price, c.feeTokenAddress.decimals)}
                                </span>{" "}
                                {c.feeTokenAddress.symbol}
                              </span>
                              <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                            </span>
                          ))
                        : "Free"}
                    </div>
                    <div className=" h-[56px] z-10 relative flex items-center group-hover:bg-green-bg duration-200 pr-2">
                      <ExternalTextLink
                        onClick={(e) => e.stopPropagation()}
                        color="white"
                        text={truncateMiddle(o.id)}
                        href={getExplorerLink(ExplorerLinkType.ADDRESS, o.id, DexChainId.SEPOLIA)}
                      />
                    </div>
                    <div className="h-[56px] z-10 relative flex items-center pr-5 group-hover:bg-green-bg duration-200">
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        href={`/token-listing/add/?autoListingContract=${o.id}`}
                      >
                        <Button
                          className="hover:bg-green hover:text-black"
                          variant={ButtonVariant.OUTLINED}
                          size={ButtonSize.MEDIUM}
                        >
                          List tokens
                        </Button>
                      </Link>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
        {searchValue && !filteredAutoListings.length && (
          <div className="h-[340px] flex items-center rounded-5 bg-primary-bg justify-center flex-col">
            <EmptyStateIcon iconName="search-autolisting" />
            <span className="text-secondary-text">No tokenlists found</span>
          </div>
        )}
      </Container>
    </>
  );
}
