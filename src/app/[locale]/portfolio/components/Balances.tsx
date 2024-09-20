"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { formatUnits } from "viem";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import { TokenPortfolioDialogContent } from "@/components/dialogs/TokenPortfolioDialog";
import { formatFloat } from "@/functions/formatFloat";
import { Token } from "@/sdk_hybrid/entities/token";

import { useActiveWalletBalances } from "../stores/balances.hooks";

const filterTable = ({
  searchValue,
  value: { token },
}: {
  searchValue: string;
  value: {
    token: Token;
    amountERC20: bigint;
    amountERC223: bigint;
    amountFiat: string;
  };
}) => {
  if (!searchValue) return true;
  if (token.address0 === searchValue) return true;
  if (token.address1 === searchValue) return true;
  if (token.name?.toLowerCase().includes(searchValue.toLowerCase())) return true;
  if (token.symbol?.toLowerCase().includes(searchValue.toLowerCase())) return true;

  return false;
};

const DesktopTable = ({
  tableData,
  setTokenForPortfolio,
}: {
  tableData: any;
  setTokenForPortfolio: any;
}) => {
  return (
    <div className="hidden lg:grid pr-5 pl-5 pb-5 rounded-5 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,2.67fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,1.33fr),_minmax(50px,1.33fr)] relative">
      <div className="text-secondary-text pl-5 h-[60px] flex items-center">Token</div>
      <div className="text-secondary-text h-[60px] flex items-center gap-2">
        Amount <Badge color="green" text="ERC-20" />
      </div>
      <div className="text-secondary-text h-[60px] flex items-center gap-2">
        Amount <Badge color="green" text="ERC-223" />
      </div>
      <div className="text-secondary-text h-[60px] flex items-center">Amount, $</div>
      <div className="text-secondary-text pr-5 h-[60px] flex items-center justify-end">Details</div>
      {tableData.map((o: any, index: number) => {
        return (
          <React.Fragment key={o.token.address0}>
            <div
              className={clsx(
                "h-[56px] flex items-center gap-2 pl-5 rounded-l-3",
                index % 2 !== 0 && "bg-tertiary-bg",
              )}
            >
              <Image src={o.logoURI || "/tokens/placeholder.svg"} width={24} height={24} alt="" />
              <span>{`${o.name}`}</span>
            </div>
            <div
              className={clsx("h-[56px] flex items-center", index % 2 !== 0 && "bg-tertiary-bg")}
            >
              {o.amountERC20}
            </div>
            <div
              className={clsx("h-[56px] flex items-center", index % 2 !== 0 && "bg-tertiary-bg")}
            >
              {o.amountERC223}
            </div>
            <div
              className={clsx("h-[56px] flex items-center", index % 2 !== 0 && "bg-tertiary-bg")}
            >
              {o.amountFiat}
            </div>
            <div
              className={clsx(
                "h-[56px] flex items-center justify-end pr-5 rounded-r-3",
                index % 2 !== 0 && "bg-tertiary-bg",
              )}
            >
              <IconButton
                iconName="details"
                variant={IconButtonVariant.DEFAULT}
                onClick={() => {
                  setTokenForPortfolio(o.token);
                }}
              />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const MobileTable = ({
  tableData,
  setTokenForPortfolio,
}: {
  tableData: any;
  setTokenForPortfolio: any;
}) => {
  return (
    <div className="flex lg:hidden flex-col gap-4">
      {tableData.map((o: any, index: number) => {
        return (
          <div className="flex flex-col bg-primary-bg p-4 rounded-3 gap-2" key={o.token.address0}>
            <div className="flex justify-start items-start gap-1">
              <div className="flex gap-2">
                <Image src={o.logoURI || "/tokens/placeholder.svg"} width={32} height={32} alt="" />
                <div className="flex flex-col">
                  <span className="text-14">{`${o.name}`}</span>
                  <span className="text-12">{`${o.amountFiat}`}</span>
                </div>
              </div>
              <div
                className="px-2 py-[2px] text-14 text-secondary-text bg-quaternary-bg rounded-1 flex justify-center items-center"
                onClick={() => {
                  setTokenForPortfolio(o.token);
                }}
              >
                {o.token.symbol}
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-1 items-center">
                <Badge color="green" text="ERC-20" />
                <span className="text-12 text-secondary-text">{o.amountERC20}</span>
              </div>
              <div className="flex gap-1 items-center">
                <Badge color="green" text="ERC-223" />
                <span className="text-12 text-secondary-text">{o.amountERC223}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Balances = () => {
  const t = useTranslations("Portfolio");
  const [searchValue, setSearchValue] = useState("");
  const [tokenForPortfolio, setTokenForPortfolio] = useState<Token | null>(null);
  const isTokenInfoOpened = Boolean(tokenForPortfolio);
  const handleClosTokenInfo = () => {
    setTokenForPortfolio(null);
  };

  const loading = false;

  const { tokenBalances, activeAddresses } = useActiveWalletBalances();

  const currentTableData = tokenBalances
    .filter((value) => filterTable({ searchValue, value }))
    .map(({ token, amountERC20, amountERC223, amountFiat }) => ({
      logoURI: token.logoURI,
      name: token.name,
      amountERC20: `${formatFloat(formatUnits(amountERC20 || BigInt(0), token.decimals))} ${token.symbol}`,
      amountERC223: `${formatFloat(formatUnits(amountERC223 || BigInt(0), token.decimals))} ${token.symbol}`,
      amountFiat: amountFiat,
      token,
    })) as any[];

  return (
    <>
      <div className="mt-5 flex flex-col lg:flex-row gap-5">
        <div className="flex flex-col bg-portfolio-balance-gradient rounded-3 px-5 py-6 w-full">
          <div className="flex items-center gap-1">
            <span className="text-14 lg:text-16">Wallet balance</span>
            <Tooltip iconSize={20} text="Info text" />
          </div>

          <span className="text-24 lg:text-32 font-medium">$ —</span>
        </div>
        <div className="flex flex-col bg-portfolio-margin-positions-gradient rounded-3 px-5 py-6 w-full">
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
            <DesktopTable
              tableData={currentTableData}
              setTokenForPortfolio={setTokenForPortfolio}
            />
            <MobileTable tableData={currentTableData} setTokenForPortfolio={setTokenForPortfolio} />
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
        {tokenForPortfolio ? <TokenPortfolioDialogContent token={tokenForPortfolio} /> : null}
      </DrawerDialog>
    </>
  );
};
