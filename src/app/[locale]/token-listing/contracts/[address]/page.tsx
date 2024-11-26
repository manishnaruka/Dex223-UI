"use client";

import { isZeroAddress } from "@ethereumjs/util";
import Image from "next/image";
import React, { HTMLAttributes, ReactNode, useMemo, useState } from "react";
import { Address, formatUnits } from "viem";

import { useAutoListingContract } from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import Container from "@/components/atoms/Container";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import { SearchInput } from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge, { BadgeVariant } from "@/components/badges/Badge";
import Button from "@/components/buttons/Button";
import IconButton, { IconButtonSize, IconButtonVariant } from "@/components/buttons/IconButton";
import { useTokenPortfolioDialogStore } from "@/components/dialogs/stores/useTokenPortfolioDialogStore";
import { TokenListId } from "@/db/db";
import { clsxMerge } from "@/functions/clsxMerge";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import { filterTokens } from "@/functions/searchTokens";
import truncateMiddle from "@/functions/truncateMiddle";
import { useTokenLists } from "@/hooks/useTokenLists";
import { Link } from "@/navigation";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Token } from "@/sdk_hybrid/entities/token";

interface TokenListInfoCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: ReactNode;
}
function TokenListInfoCard({ title, value, className, ...props }: TokenListInfoCardProps) {
  return (
    <div
      {...props}
      className={clsxMerge("bg-tertiary-bg rounded-3 px-5 py-4 flex flex-col", className)}
    >
      <h3 className="text-secondary-text">{title}</h3>
      <span className="text-18">{value}</span>
    </div>
  );
}

function TableRow({ children, className }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsxMerge(
        "grid grid-cols-[minmax(300px,2fr)_minmax(198px,1fr)_minmax(198px,1fr)_100px__minmax(67px,max-content)_minmax(54px,max-content)] pl-5 py-2 pr-2 gap-6 rounded-3 bg-primary-bg",
        className,
      )}
    >
      {children}
    </div>
  );
}
export default function AutoListingContractDetails({
  params,
}: {
  params: {
    address: Address;
  };
}) {
  const tokenLists = useTokenLists();

  const [searchValue, setSearchValue] = useState("");
  const { handleOpen } = useTokenPortfolioDialogStore();

  const listingContract = useAutoListingContract(params.address);

  const tokens = useMemo(() => {
    if (!listingContract) {
      return [];
    }

    return listingContract.tokens.map((token) => {
      let lists: TokenListId[] = [];

      if (tokenLists) {
        lists = tokenLists
          .filter((list) =>
            list.list.tokens.find((t) => t.address0.toLowerCase() === token.address0.toLowerCase()),
          )
          .map((t) => t.id);
      }

      return new Token(
        token.chainId,
        token.address0,
        token.address1,
        +token.decimals,
        token.symbol,
        token.name,
        "/images/tokens/placeholder.svg",
        lists,
      );
    });
  }, [listingContract, tokenLists]);

  const filteredTokens = useMemo(() => {
    return filterTokens(searchValue, tokens);
  }, [searchValue, tokens]);

  if (!listingContract) {
    return <div>Whoops, this autolisting not found.</div>;
  }

  return (
    <>
      <Container>
        <div className="my-2 md:my-10 px-4">
          <Link href="/token-listing/contracts">
            <span className="flex items-center gap-2">
              <Svg iconName="back" />
              Back to token listing
            </span>
          </Link>
        </div>
        <div className="my-2 md:my-10 px-4">
          <div className="flex justify-between mb-5">
            <h1 className="text-24 xl:text-40">Listing contract details</h1>
            <Link
              className="hidden xl:block"
              href={`/token-listing/add/?autoListingContract=${params.address}&dest=${encodeURIComponent(`/token-listing/contracts/${params.address}`)}`}
            >
              <Button>List token(s)</Button>
            </Link>
          </div>
          <div className="bg-primary-bg rounded-5 grid xl:grid-cols-6 xl:grid-areas-[first_second_third_fourth_fifth_sixth] pb-4 px-4 pt-3 xl:p-10 gap-3 mb-4 xl:mb-10 grid-cols-2 grid-areas-[first_first,second_second,third_fourth,fifth_sixth]">
            <div className="flex flex-col justify-center grid-in-[first]">
              <h3 className="text-18 md:text-20 font-medium">{listingContract.name}</h3>
              <p>{listingContract.totalTokens} tokens</p>
            </div>
            <TokenListInfoCard
              title="Chain"
              value="Sepolia"
              className="grid-in-[third] xl:grid-in-[second]"
            />
            <TokenListInfoCard
              title="Source"
              value={
                <span className="flex items-center">
                  <ExternalTextLink
                    text={truncateMiddle(params.address, { charsFromEnd: 3, charsFromStart: 3 })}
                    href="#"
                  />{" "}
                  <IconButton variant={IconButtonVariant.COPY} text={params.address} />{" "}
                </span>
              }
              className="grid-in-[second] xl:grid-in-[third] justify-between flex-row items-center xl:flex-col xl:items-start"
            />
            <TokenListInfoCard
              title="Last updated"
              value={new Date(+listingContract.lastUpdated * 1000).toLocaleString("en-us", {
                month: "short",
                year: "numeric",
                day: "numeric",
              })}
              className="grid-in-[fourth]"
            />
            <TokenListInfoCard title="Version" value="1.0.0" className="grid-in-[fifth]" />
            <TokenListInfoCard
              title="Listing type"
              value={listingContract.isFree ? "Free" : "Paid"}
              className="grid-in-[sixth]"
            />
          </div>
          <Link
            className="block w-full xl:hidden mb-6"
            href={`/token-listing/add/?autoListingContract=${params.address}`}
          >
            <Button fullWidth>List token(s)</Button>
          </Link>
          {!listingContract.isFree && (
            <>
              <div className="mb-5">
                <h1 className="text-18 xl:text-40">Listing price</h1>
              </div>
              <div className="px-5 pb-5 pt-3 bg-primary-bg rounded-5 mb-10">
                <div className="flex items-center gap-1 mb-3">
                  <h3 className="text-secondary-text ">
                    {listingContract.tokensToPay.length} tokens available to pay for listing
                  </h3>
                  <Tooltip text="Avalialbe tooltip" />
                </div>
                <div className="grid grid-cols-[minmax(284px,1fr)_minmax(284px,1fr)_minmax(284px,1fr)_minmax(284px,1fr)] gap-x-2 gap-y-3">
                  {listingContract.tokensToPay.map((tokenToPay, index) => {
                    return (
                      <div
                        key={index}
                        className="bg-tertiary-bg grid grid-cols-[1fr_91px_68px] gap-2 py-2 pr-2 pl-3 rounded-3"
                      >
                        <div className="flex items-center">
                          {formatUnits(tokenToPay.price, tokenToPay.token.decimals).slice(0, 7) ===
                          "0.00000"
                            ? truncateMiddle(
                                formatUnits(tokenToPay.price, tokenToPay.token.decimals),
                                {
                                  charsFromStart: 4,
                                  charsFromEnd: 3,
                                },
                              )
                            : formatFloat(formatUnits(tokenToPay.price, tokenToPay.token.decimals))}
                        </div>

                        <div className="rounded-2 bg-secondary-bg py-1 flex items-center justify-center">
                          {tokenToPay.token.symbol}
                        </div>
                        <div className="flex items-center">
                          <Badge
                            variant={BadgeVariant.COLORED}
                            color="green"
                            text={
                              tokenToPay.token.address && isZeroAddress(tokenToPay.token.address)
                                ? "Native"
                                : "ERC-20"
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div>
            <div>
              <div className="flex justify-between mb-5 flex-col xl:flex-row">
                <h1 className="mb-3 text-18 md:text-40 font-medium">Tokens</h1>
                {!!listingContract.tokens.length && (
                  <div className="w-full md:w-[480px]">
                    <SearchInput
                      className="bg-tertiary-bg"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search name or paste contract"
                    />
                  </div>
                )}
              </div>
            </div>
            {searchValue && !filteredTokens.length && (
              <div className="h-[340px] flex items-center rounded-5 bg-primary-bg justify-center flex-col">
                <EmptyStateIcon iconName="search-autolisting" />
                <span className="text-secondary-text">No tokens found</span>
              </div>
            )}
            {Boolean(
              !!listingContract.tokens.length &&
                (!searchValue || (searchValue && filteredTokens.length)),
            ) && (
              <>
                <div className="xl:hidden flex flex-col gap-4">
                  {filteredTokens.map((token: Token, index: number) => {
                    return (
                      <div
                        key={token.address0}
                        className="bg-primary-bg rounded-3 pt-3 pl-4 pb-4 pr-3"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Image
                              width={32}
                              height={32}
                              src="/images/tokens/placeholder.svg"
                              alt=""
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{token.name}</span>
                              <span className="text-secondary-text">{token.symbol}</span>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <Tooltip
                              text={`Token belongs to ${token.lists?.length || 1} token lists`}
                              renderTrigger={(ref, refProps) => {
                                return (
                                  <span
                                    onClick={(e) => e.stopPropagation()}
                                    ref={ref.setReference}
                                    {...refProps}
                                    className="flex gap-0.5 items-center text-secondary-text text-14 cursor-pointer"
                                  >
                                    {token.lists?.length || 1}
                                    <Svg className="text-tertiary-text" iconName="list" />
                                  </span>
                                );
                              }}
                            />
                            <div className="flex items-center justify-end p-2">
                              <Tooltip
                                text={"Token details"}
                                renderTrigger={(ref, refProps) => {
                                  return (
                                    <div
                                      ref={ref.setReference}
                                      {...refProps}
                                      className="w-10 h-10 flex items-center justify-center"
                                    >
                                      <IconButton
                                        onClick={() => handleOpen(token)}
                                        iconName="details"
                                      />
                                    </div>
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 ">
                          <div className="bg-tertiary-bg pb-1 pl-4 pt-3 rounded-2">
                            <div className="flex items-center gap-2 text-secondary-text">
                              Address
                              <Badge size="small" variant={BadgeVariant.COLORED} text="ERC-20" />
                            </div>
                            <div className="flex items-center">
                              <ExternalTextLink
                                text={truncateMiddle(token.address0, {
                                  charsFromStart: 3,
                                  charsFromEnd: 3,
                                })}
                                href={getExplorerLink(
                                  ExplorerLinkType.ADDRESS,
                                  token.address0,
                                  DexChainId.SEPOLIA,
                                )}
                              />{" "}
                              <IconButton
                                buttonSize={IconButtonSize.LARGE}
                                variant={IconButtonVariant.COPY}
                                text={token.address0}
                              />
                            </div>
                          </div>
                          <div className="bg-tertiary-bg pb-1 pl-4 pt-3 rounded-2">
                            <div className="flex items-center gap-2 text-secondary-text">
                              Address
                              <Badge size="small" variant={BadgeVariant.COLORED} text="ERC-223" />
                            </div>
                            <div className="flex items-center">
                              <ExternalTextLink
                                text={truncateMiddle(token.address1, {
                                  charsFromStart: 3,
                                  charsFromEnd: 3,
                                })}
                                href={getExplorerLink(
                                  ExplorerLinkType.ADDRESS,
                                  token.address1,
                                  DexChainId.SEPOLIA,
                                )}
                              />{" "}
                              <IconButton
                                buttonSize={IconButtonSize.LARGE}
                                variant={IconButtonVariant.COPY}
                                text={token.address1}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="hidden xl:contents">
                  <div className="grid px-5 py-[18px] bg-tertiary-bg rounded-t-5">
                    <TableRow className="bg-tertiary-bg">
                      <div>Name</div>
                      <div className="flex items-center gap-2">
                        Address
                        <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        Address
                        <Badge variant={BadgeVariant.COLORED} color="green" text="ERC-223" />
                      </div>
                      <div>Tags</div>
                      <div>Found in</div>
                      <div>Details</div>
                    </TableRow>
                  </div>

                  <div className="bg-primary-bg rounded-b-5 py-2.5 px-5">
                    {filteredTokens.map((token: Token, index: number) => {
                      return (
                        <TableRow key={index} className={index % 2 !== 0 ? "bg-tertiary-bg" : ""}>
                          <div className="flex items-center gap-2">
                            <Image
                              width={24}
                              height={24}
                              src="/images/tokens/placeholder.svg"
                              alt=""
                            />
                            <span className="font-medium">{token.name}</span>
                            <span className="text-secondary-text">{token.symbol}</span>
                          </div>
                          <div className="flex items-center">
                            <ExternalTextLink
                              text={truncateMiddle(token.address0)}
                              href={getExplorerLink(
                                ExplorerLinkType.ADDRESS,
                                token.address0,
                                DexChainId.SEPOLIA,
                              )}
                            />{" "}
                            <IconButton variant={IconButtonVariant.COPY} text={token.address0} />
                          </div>
                          <div className="flex items-center">
                            <ExternalTextLink
                              text={truncateMiddle(token.address1)}
                              href={getExplorerLink(
                                ExplorerLinkType.ADDRESS,
                                token.address1,
                                DexChainId.SEPOLIA,
                              )}
                            />{" "}
                            <IconButton variant={IconButtonVariant.COPY} text={token.address1} />
                          </div>
                          <div className="flex items-center"></div>
                          <div className="flex items-center">{token.lists?.length || 0} list</div>
                          <div className="flex items-center justify-end">
                            {" "}
                            <Tooltip
                              text={"Token details"}
                              renderTrigger={(ref, refProps) => {
                                return (
                                  <div
                                    ref={ref.setReference}
                                    {...refProps}
                                    className="w-10 h-10 flex items-center justify-center"
                                  >
                                    <IconButton
                                      onClick={() => handleOpen(token)}
                                      iconName="details"
                                    />
                                  </div>
                                );
                              }}
                            />
                          </div>
                        </TableRow>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {!listingContract.tokens.length && (
              <div className="flex items-center justify-center min-h-[340px] bg-primary-bg flex-col gap-2 rounded-5">
                <EmptyStateIcon iconName="tokens" />
                <span className="text-secondary-text">No listed tokens yet</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
