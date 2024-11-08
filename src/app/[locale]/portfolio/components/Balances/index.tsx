"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { formatUnits } from "viem";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Tooltip from "@/components/atoms/Tooltip";
import { TokenPortfolioDialogContent } from "@/components/dialogs/TokenPortfolioDialog";
import { formatFloat } from "@/functions/formatFloat";
import { Currency } from "@/sdk_hybrid/entities/currency";

import { useActiveWalletBalances } from "../../stores/balances.hooks";
import { BalancesDesktopTable, BalancesMobileTable } from "./BalancesTable";

const filterTable = ({
  searchValue,
  value: { token },
}: {
  searchValue: string;
  value: {
    token: Currency;
    amountERC20: bigint;
    amountERC223: bigint;
    amountFiat: string;
  };
}) => {
  if (!searchValue) return true;
  if (token.wrapped.address0 === searchValue) return true;
  if (token.wrapped.address1 === searchValue) return true;
  if (token.name?.toLowerCase().includes(searchValue.toLowerCase())) return true;
  if (token.symbol?.toLowerCase().includes(searchValue.toLowerCase())) return true;

  return false;
};

export const Balances = () => {
  const t = useTranslations("Portfolio");
  const [searchValue, setSearchValue] = useState("");
  const [tokenForPortfolio, setTokenForPortfolio] = useState<Currency | null>(null);
  // const isTokenInfoOpened = Boolean(tokenForPortfolio);
  const [isTokenInfoOpened, setTokenInfoOpened] = useState(false);
  const handleClosTokenInfo = () => {
    setTokenForPortfolio(null);
  };

  useEffect(() => {
    setTokenInfoOpened(Boolean(tokenForPortfolio));
  }, [tokenForPortfolio]);

  const loading = false;

  const { tokenBalances, activeAddresses } = useActiveWalletBalances();

  const currentTableData = tokenBalances
    .filter((value) => filterTable({ searchValue, value }))
    .map(({ token, amountERC20, amountERC223, amountFiat }) => ({
      logoURI: token.logoURI,
      name: token.wrapped.name,
      amountERC20: `${formatFloat(formatUnits(amountERC20 || BigInt(0), token.decimals))} ${token.symbol}`,
      amountERC223: `${formatFloat(formatUnits(amountERC223 || BigInt(0), token.decimals))} ${token.symbol}`,
      amountFiat: amountFiat,
      token,
    })) as any[];

  return (
    <>
      <div className="mt-5 flex flex-col lg:flex-row gap-5">
        <div className="flex flex-col bg-gradient-card-green-light-fill rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span className="text-14 lg:text-16">Wallet balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>

          <span className="text-24 lg:text-32 font-medium">$ —</span>
        </div>
        {/*TODO: Extract card to separate component. 01.10.2024*/}
        <div className="flex flex-col bg-gradient-card-blue-light-fill  rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span className="text-14 lg:text-16">Margin positions balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-24 lg:text-32 font-medium">$ —</span>
        </div>
      </div>
      <div className="mt-5 flex flex-col lg:flex-row gap-5">
        <div className="flex flex-col bg-primary-bg rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span className="text-14 lg:text-16">Liquidity balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-18 lg:text-24 font-medium">$ —</span>
          <span className="px-2 py-[2px] bg-quaternary-bg text-14 rounded-1 w-max">
            — liquidity positions
          </span>
        </div>
        <div className="flex flex-col bg-primary-bg rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span className="text-14 lg:text-16">Lending order balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-18 lg:text-24 font-medium">$ —</span>
          <span className="px-2 py-[2px] bg-quaternary-bg text-14 rounded-1 w-max">
            — lending orders
          </span>
        </div>
        <div className="flex flex-col bg-primary-bg rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span className="text-14 lg:text-16">Deposited to contract</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>
          <span className="text-18 lg:text-24 font-medium">$ —</span>
          <span className="px-2 py-[2px] bg-quaternary-bg text-14 rounded-1 w-max">— tokens</span>
        </div>
      </div>

      <div className="mt-10 flex flex-col lg:flex-row w-full justify-between gap-2 lg:gap-0">
        <h1 className="text-18 lg:text-32 font-medium">{t("balances_title")}</h1>
        <div className="flex gap-3">
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("balances_search_placeholder")}
            className="bg-primary-bg lg:w-[480px]"
          />
        </div>
      </div>
      {/*  */}

      <div className="mt-5 min-h-[640px] mb-5 w-full">
        {!loading && activeAddresses.length && currentTableData.length ? (
          <>
            <BalancesDesktopTable
              tableData={currentTableData}
              setTokenForPortfolio={setTokenForPortfolio}
            />
            <BalancesMobileTable
              tableData={currentTableData}
              setTokenForPortfolio={setTokenForPortfolio}
            />
          </>
        ) : Boolean(searchValue) ? (
          <div className="flex flex-col justify-center items-center h-full min-h-[340px] bg-primary-bg rounded-5 gap-1">
            <EmptyStateIcon iconName="search" />
            <span className="text-secondary-text">Token not found</span>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full min-h-[340px] bg-primary-bg rounded-5 gap-1">
            <EmptyStateIcon iconName="assets" />
            <span className="text-secondary-text">Token will appear here</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[550px]">
            <Preloader type="awaiting" size={48} />
          </div>
        ) : null}
      </div>
      <DrawerDialog isOpen={isTokenInfoOpened} setIsOpen={handleClosTokenInfo}>
        <DialogHeader onClose={handleClosTokenInfo} title={tokenForPortfolio?.name || "Unknown"} />
        {tokenForPortfolio ? (
          <TokenPortfolioDialogContent token={tokenForPortfolio.wrapped} />
        ) : null}
      </DrawerDialog>
    </>
  );
};
