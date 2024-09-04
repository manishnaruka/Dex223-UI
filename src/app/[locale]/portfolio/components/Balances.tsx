"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { formatUnits } from "viem";

import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import { formatFloat } from "@/functions/formatFloat";
import { useTokens } from "@/hooks/useTokenLists";

import { useActiveWalletBalances } from "../stores/balances.hooks";
import { useWalletsBalances } from "../stores/useWalletsBalances";

export const Balances = () => {
  const t = useTranslations("Portfolio");
  const [searchValue, setSearchValue] = useState("");
  const tokens = useTokens();

  const loading = false;

  const { balances, setWalletBalances } = useWalletsBalances();

  const { tokenBalances } = useActiveWalletBalances();

  const currentTableData = tokenBalances.map(
    ({ token, amountERC20, amountERC223, amountFiat }) => ({
      logoURI: token.logoURI,
      name: token.name,
      amountERC20: `${formatFloat(formatUnits(amountERC20 || BigInt(0), token.decimals))} ${token.symbol}`,
      amountERC223: `${formatFloat(formatUnits(amountERC223 || BigInt(0), token.decimals))} ${token.symbol}`,
      amountFiat: amountFiat,
    }),
  ) as any[];

  return (
    <>
      <div className="mt-5 flex gap-5">
        <div className="flex flex-col bg-portfolio-balance-gradient rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Wallet balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>

          <span className="text-32 font-medium">$ —</span>
        </div>
        <div className="flex flex-col bg-portfolio-margin-positions-gradient rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Margin positions balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-32 font-medium">$ —</span>
        </div>
      </div>
      <div className="mt-5 flex gap-5">
        <div className="flex flex-col bg-primary-bg rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Liquidity balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-24 font-medium">$ —</span>
          <span className="px-2 py-[2px] bg-quaternary-bg text-14 rounded-1 w-max">
            — liquidity positions
          </span>
        </div>
        <div className="flex flex-col bg-primary-bg rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Lending order balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-24 font-medium">$ —</span>
          <span className="px-2 py-[2px] bg-quaternary-bg text-14 rounded-1 w-max">
            — lending orders
          </span>
        </div>
        <div className="flex flex-col bg-primary-bg rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span>Deposited to contract</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-24 font-medium">$ —</span>
          <span className="px-2 py-[2px] bg-quaternary-bg text-14 rounded-1 w-max">— tokens</span>
        </div>
      </div>

      <div className="mt-10 flex w-full justify-between">
        <h1 className="text-32 font-medium">{t("balances_title")}</h1>
        <div className="flex gap-3">
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("balances_search_placeholder")}
            className="bg-primary-bg w-[480px]"
          />
        </div>
      </div>
      {/*  */}

      <div className="mt-5 min-h-[640px] mb-5 w-full">
        <div className="pr-5 pl-5 grid rounded-5 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,2.67fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,1.33fr),_minmax(50px,1.33fr)] pb-2 relative">
          <div className="pl-5 h-[60px] flex items-center">Token</div>
          <div className="h-[60px] flex items-center gap-2">
            Amount <Badge color="green" text="ERC-20" />
          </div>
          <div className="h-[60px] flex items-center gap-2">
            Amount <Badge color="green" text="ERC-223" />
          </div>
          <div className="h-[60px] flex items-center">Amount, $</div>
          <div className="pr-5 h-[60px] flex items-center justify-end">Details</div>

          {!loading &&
            currentTableData.map((o: any, index: number) => {
              return (
                <>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center gap-2 pl-5 rounded-l-3",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    <Image
                      src={o.logoURI || "/tokens/placeholder.svg"}
                      width={24}
                      height={24}
                      alt=""
                    />
                    <span>{`${o.name}`}</span>
                  </div>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    {o.amountERC20}
                  </div>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    {o.amountERC223}
                  </div>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    {o.amountFiat}
                  </div>
                  <div
                    className={clsx(
                      "h-[56px] flex items-center justify-end pr-5 rounded-r-3",
                      index % 2 !== 0 && "bg-tertiary-bg",
                    )}
                  >
                    <Svg iconName="list" />
                  </div>
                </>
              );
            })}
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[550px]">
            <Preloader type="awaiting" size={48} />
          </div>
        ) : null}
      </div>
    </>
  );
};
