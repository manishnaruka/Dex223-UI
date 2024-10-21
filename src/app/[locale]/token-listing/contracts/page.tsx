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
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { clsxMerge } from "@/functions/clsxMerge";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import { Link } from "@/navigation";
import { DexChainId } from "@/sdk_hybrid/chains";

export default function TokenListingPage() {
  const [searchValue, setSearchValue] = useState("");

  const autoListings = useAutoListingContracts();

  console.log(autoListings);

  const filteredAutoListings = useMemo(() => {
    if (!autoListings) {
      return null;
    }

    if (!searchValue) {
      return autoListings;
    } else {
      return autoListings.filter(
        (l: any) =>
          l.name.toLowerCase().startsWith(searchValue.toLowerCase()) ||
          l.id.toLowerCase().startsWith(searchValue.toLowerCase()),
      );
    }
  }, [autoListings, searchValue]);

  if (!filteredAutoListings) {
    return <Preloader />;
  }

  return (
    <>
      <Container>
        <div className="my-3 md:my-10 px-4">
          <Link href="/token-listing">
            <button className="flex items-center gap-2">
              <Svg iconName="back" />
              Back to token listing
            </button>
          </Link>
        </div>
        <div className="pb-10">
          <div className="flex justify-between mb-20 flex-col xl:flex-row px-4">
            <h1 className="mb-3 font-medium  text-24 lg:text-40">Auto-listing contracts</h1>
            <div className="w-full md:w-[480px]">
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
              {filteredAutoListings.map((autoListing) => {
                return (
                  <Link
                    key={autoListing.id}
                    href={`/token-listing/contracts/${autoListing.id}`}
                    className="hover:bg-tertiary-bg duration-200 group bg-primary-bg rounded-5 pb-4 px-4 pt-3"
                  >
                    <div className="text-18 font-medium">{autoListing.name}</div>
                    <div className="mb-3">{autoListing.totalTokens} tokens</div>
                    <div
                      className={clsxMerge(
                        "flex justify-between pl-4 pr-2 py-2.5 bg-tertiary-bg rounded-2 mt-2 mb-3",
                        !autoListing.isFree && "flex-grow w-full flex-wrap justify-start",
                      )}
                    >
                      <span
                        className={clsx(
                          "text-secondary-text",
                          !autoListing.isFree && "basis-full mb-1",
                        )}
                      >
                        Listing price
                      </span>
                      {autoListing.tokensToPay.length
                        ? autoListing.tokensToPay.map((paymentMethod) => (
                            <span
                              key={paymentMethod.token.address}
                              className="flex items-center gap-1 bg-quaternary-bg rounded-2 px-2 py-1"
                            >
                              <span>
                                <span className="overflow-hidden ">
                                  {formatUnits(
                                    paymentMethod.price,
                                    paymentMethod.token.decimals ?? 18,
                                  ).slice(0, 7) === "0.00000"
                                    ? truncateMiddle(
                                        formatUnits(
                                          paymentMethod.price,
                                          paymentMethod.token.decimals ?? 18,
                                        ),
                                        {
                                          charsFromStart: 3,
                                          charsFromEnd: 2,
                                        },
                                      )
                                    : formatFloat(
                                        formatUnits(
                                          paymentMethod.price,
                                          paymentMethod.token.decimals != null
                                            ? paymentMethod.token.decimals
                                            : 18,
                                        ),
                                      )}
                                </span>{" "}
                                {paymentMethod.token.symbol}
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
                        text={truncateMiddle(autoListing.id)}
                        href={getExplorerLink(
                          ExplorerLinkType.ADDRESS,
                          autoListing.id,
                          DexChainId.SEPOLIA,
                        )}
                      />
                    </div>
                    <div className="flex-grow">
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        href={`/token-listing/add/?autoListingContract=${autoListing.id}`}
                      >
                        <Button
                          fullWidth
                          className="hover:bg-green hover:text-black"
                          colorScheme={ButtonColor.LIGHT_GREEN}
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

            <div className="hidden xl:grid rounded-2 overflow-hidden bg-table-gradient pb-2.5 grid-cols-[minmax(50px,1.33fr),_minmax(77px,1.33fr),_minmax(87px,2.67fr),_minmax(55px,1.33fr),_minmax(50px,max-content)]">
              <div className="contents">
                <div className="pl-5 h-[60px] flex items-center relative mb-2.5">Contract name</div>
                <div className="h-[60px] flex items-center relative">Token amount</div>
                <div className="h-[60px] flex items-center relative">Listing price</div>
                <div className="h-[60px] flex items-center relative">Contact link</div>
                <div className="pr-5 h-[60px] flex items-center relative">Action</div>
              </div>

              {filteredAutoListings.map((autoListing) => {
                return (
                  <Link
                    key={autoListing.id}
                    href={`/token-listing/contracts/${autoListing.id}`}
                    className="contents hover:bg-tertiary-bg duration-200 group"
                  >
                    <div className="h-[56px] z-10 relative flex items-center group-hover:bg-tertiary-bg gap-2 pl-2.5 ml-2.5 rounded-l-3 duration-200 pr-2">
                      {autoListing.name}
                    </div>

                    <div className=" h-[56px] z-10 relative flex items-center group-hover:bg-tertiary-bg duration-200 pr-2">
                      {autoListing.totalTokens} tokens
                    </div>
                    <div className=" h-[56px] z-10 relative flex items-center gap-2 group-hover:bg-tertiary-bg duration-200 pr-2">
                      {autoListing.tokensToPay.length
                        ? autoListing.tokensToPay.map((paymentMethod) => (
                            <span
                              key={paymentMethod.token.address}
                              className="flex items-center gap-1 bg-transparent border border-secondary-border rounded-2 px-2 py-1"
                            >
                              <span>
                                <span className="overflow-hidden ">
                                  {formatUnits(
                                    paymentMethod.price,
                                    paymentMethod.token.decimals ?? 18,
                                  ).slice(0, 7) === "0.00000"
                                    ? truncateMiddle(
                                        formatUnits(
                                          paymentMethod.price,
                                          paymentMethod.token.decimals ?? 18,
                                        ),
                                        {
                                          charsFromStart: 3,
                                          charsFromEnd: 2,
                                        },
                                      )
                                    : formatFloat(
                                        formatUnits(
                                          paymentMethod.price,
                                          paymentMethod.token.decimals != null
                                            ? paymentMethod.token.decimals
                                            : 18,
                                        ),
                                      )}
                                </span>{" "}
                                {paymentMethod.token.symbol}
                              </span>
                              <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                            </span>
                          ))
                        : "Free"}
                    </div>
                    <div className=" h-[56px] z-10 relative flex items-center group-hover:bg-tertiary-bg duration-200 pr-2">
                      <ExternalTextLink
                        onClick={(e) => e.stopPropagation()}
                        color="green"
                        text={truncateMiddle(autoListing.id)}
                        href={getExplorerLink(
                          ExplorerLinkType.ADDRESS,
                          autoListing.id,
                          DexChainId.SEPOLIA,
                        )}
                      />
                    </div>
                    <div className="h-[56px] z-10 relative flex items-center pr-2.5 mr-2.5 rounded-r-3 group-hover:bg-tertiary-bg duration-200">
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        href={`/token-listing/add/?autoListingContract=${autoListing.id}`}
                      >
                        <Button
                          className="hover:bg-green hover:text-black"
                          colorScheme={ButtonColor.LIGHT_GREEN}
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
