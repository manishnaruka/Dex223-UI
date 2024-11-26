"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import React from "react";
import { Address } from "viem";

import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Tooltip from "@/components/atoms/Tooltip";
import { TokenPortfolioDialogContent } from "@/components/dialogs/TokenPortfolioDialog";
import { Token } from "@/sdk_hybrid/entities/token";

import { useActiveWalletsDeposites } from "../../stores/deposites.hooks";
import { WalletDeposite } from "../../stores/useWalletsDeposites";
import { DesktopTable, MobileTable } from "./DepositedTable";
import { WithdrawDesktopTable, WithdrawMobileTable } from "./DepositedWithdrawTable";

const filterTable = ({
  searchValue,
  value: { token },
}: {
  searchValue: string;
  value: {
    token: Token;
  };
}) => {
  if (!searchValue) return true;
  if (token.address0 === searchValue) return true;
  if (token.address1 === searchValue) return true;
  if (token.name?.toLowerCase().includes(searchValue.toLowerCase())) return true;
  if (token.symbol?.toLowerCase().includes(searchValue.toLowerCase())) return true;

  return false;
};

export const Deposited = () => {
  const t = useTranslations("Portfolio");
  const [searchValue, setSearchValue] = useState("");
  const [tokenForPortfolio, setTokenForPortfolio] = useState<Token | null>(null);
  const isTokenInfoOpened = Boolean(tokenForPortfolio);
  const handleCloseTokenInfo = () => {
    setTokenForPortfolio(null);
  };
  const [isWithdrawDetailsOpened, setIsWithdrawDetailsOpened] = useState(false);

  const { isLoading, deposites } = useActiveWalletsDeposites();

  // TODO: reduce amout of same tokens from different contracts to one item
  const currentTableData = deposites
    .reduce(
      (acc, walletDeposites) => {
        const deposites: (WalletDeposite & { walletAddress: Address })[] =
          walletDeposites.deposites.map((deposite) => ({
            walletAddress: walletDeposites.address,
            ...deposite,
          }));
        return [...acc, ...deposites];
      },
      [] as (WalletDeposite & { walletAddress: Address })[],
    )
    .filter((value) => filterTable({ searchValue, value }));

  return (
    <>
      <div className="mt-5 flex gap-5">
        <div className="flex items-center justify-between bg-gradient-card-blue-light-fill rounded-3 px-4 py-3 lg:px-5 lg:py-6 w-full lg:w-[50%] relative overflow-hidden">
          <div className="flex flex-col ">
            <div className="flex items-center gap-1">
              <span className="text-14 lg:text-16">Deposited to contract</span>
              <Tooltip iconSize={20} text="Info text" />
            </div>
            <span className="text-24 lg:text-32 font-medium">$ —</span>
            <img
              src="/images/deposited-bar.svg"
              alt="Side Icon"
              width={"62"}
              height={"171"}
              className="absolute top-[20px] right-[40px] object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col lg:flex-row w-full justify-between gap-2 lg:gap-0">
        <h1 className="text-18 lg:text-32 font-medium">{t("deposited_title")}</h1>
        <div className="flex flex-col lg:flex-row gap-3">
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
        {isLoading ? (
          <div className="flex justify-center items-center h-full min-h-[550px]">
            <Preloader type="awaiting" size={48} />
          </div>
        ) : currentTableData.length ? (
          <>
            <DesktopTable
              tableData={currentTableData}
              setTokenForPortfolio={setTokenForPortfolio}
              setIsWithdrawDetailsOpened={setIsWithdrawDetailsOpened}
            />
            <MobileTable
              tableData={currentTableData}
              setTokenForPortfolio={setTokenForPortfolio}
              setIsWithdrawDetailsOpened={setIsWithdrawDetailsOpened}
            />
          </>
        ) : Boolean(searchValue) ? (
          <div className="flex flex-col justify-center items-center h-full min-h-[340px] bg-primary-bg rounded-5 gap-1">
            <EmptyStateIcon iconName="search" />
            <span className="text-secondary-text">Deposite not found</span>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full min-h-[340px] bg-primary-bg rounded-5 gap-1">
            <EmptyStateIcon iconName="deposited-tokens" />
            <span className="text-secondary-text">No deposited tokens yet</span>
          </div>
        )}
        <DrawerDialog isOpen={isWithdrawDetailsOpened} setIsOpen={setIsWithdrawDetailsOpened}>
          <DialogHeader onClose={() => setIsWithdrawDetailsOpened(false)} title="Details" />
          <div className="px-4 lg:px-10 lg:pb-10 pb-4">
            <WithdrawDesktopTable
              tableData={currentTableData}
              setTokenForPortfolio={setTokenForPortfolio}
            />
            <WithdrawMobileTable
              tableData={currentTableData}
              setTokenForPortfolio={setTokenForPortfolio}
            />
          </div>
        </DrawerDialog>

        <DrawerDialog isOpen={isTokenInfoOpened} setIsOpen={handleCloseTokenInfo}>
          <DialogHeader
            onClose={handleCloseTokenInfo}
            title={tokenForPortfolio?.name || "Unknown"}
          />
          {tokenForPortfolio ? <TokenPortfolioDialogContent token={tokenForPortfolio} /> : null}
        </DrawerDialog>
      </div>
    </>
  );
};
