"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Address, formatUnits } from "viem";

import { SearchInput } from "@/components/atoms/Input";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useDeposit from "@/hooks/useDeposit";
import { useTokens } from "@/hooks/useTokenLists";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { Token } from "@/sdk_hybrid/entities/token";

import { useActiveWalletsDeposites } from "../stores/deposites.hooks";
import { WalletDeposite } from "../stores/useWalletsDeposites";

const DepositedTokenTableItem = ({
  deposite,
  walletAddress,
}: {
  deposite: WalletDeposite;
  walletAddress: Address;
}) => {
  const chainId = useCurrentChainId();
  return (
    <>
      <div
        className={clsx(
          "h-[56px] flex items-center gap-2 pl-5 rounded-l-3",
          // index % 2 !== 0 && "bg-tertiary-bg",
        )}
      >
        <Image src="/tokens/placeholder.svg" width={24} height={24} alt="" />
        <span>{`${deposite.token.name}`}</span>
      </div>
      <div className={clsx("h-[56px] flex items-center")}>
        {`${formatFloat(formatUnits(deposite.value, deposite.token.decimals))} ${deposite.token.symbol}`}
      </div>
      <div className={clsx("h-[56px] flex items-center")}>$ —</div>
      <div className={clsx("h-[56px] flex items-center justify-end pr-8")}>
        <Svg iconName="list" />
      </div>
      <div className={clsx("h-[56px] flex pr-5 rounded-r-3 flex-col justify-center")}>
        {/* {renderShortAddress(walletAddress)} */}
        <span className="text-14 text-secondary-text">Token owner</span>
        <a
          className="flex gap-2 cursor-pointer hover:text-green-hover"
          target="_blank"
          href={getExplorerLink(ExplorerLinkType.ADDRESS, walletAddress, chainId)}
        >
          {truncateMiddle(walletAddress || "", { charsFromStart: 5, charsFromEnd: 3 })}
          <Svg iconName="forward" />
        </a>
      </div>
    </>
  );
};

export const Deposited = () => {
  const t = useTranslations("Portfolio");
  const [searchValue, setSearchValue] = useState("");

  const { isLoading, deposites } = useActiveWalletsDeposites();

  const depositesCount = deposites.reduce((acc, { deposites }) => acc + deposites.length, 0);

  return (
    <>
      <div className="mt-5 flex gap-5">
        <div className="flex items-center justify-between bg-portfolio-margin-positions-gradient rounded-3 px-5 py-6 w-[50%]">
          <div className="flex flex-col ">
            <div className="flex items-center gap-1">
              <span>Deposited to contract</span>
              <Tooltip iconSize={20} text="Info text" />
            </div>
            <span className="text-32 font-medium">$ —</span>
          </div>
        </div>
      </div>

      <div className="mt-10 flex w-full justify-between">
        <h1 className="text-32 font-medium">{t("deposited_title")}</h1>
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
        {!isLoading && depositesCount ? (
          <div>
            <div className="pr-5 pl-5 grid rounded-5 overflow-hidden bg-table-gradient grid-cols-[minmax(50px,2.67fr),_minmax(87px,1.33fr),_minmax(55px,1.33fr),_minmax(50px,1.33fr),_minmax(50px,1.33fr)] pb-2 relative">
              <div className="pl-5 h-[60px] flex items-center">Token</div>
              <div className="h-[60px] flex items-center gap-2">
                Amount <Badge color="green" text="ERC-223" />
              </div>
              <div className="h-[60px] flex items-center">Amount, $</div>
              <div className="h-[60px] flex items-center justify-end pr-6">Details</div>
              <div className="pr-5 h-[60px] flex items-center">Action / Owner</div>
              {deposites.map((walletDeposites, index: number) => {
                return (
                  <>
                    {walletDeposites.deposites.map((deposite, index) => {
                      return (
                        <DepositedTokenTableItem
                          key={`${deposite}`}
                          deposite={deposite}
                          walletAddress={walletDeposites.address}
                        />
                      );
                    })}
                  </>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full min-h-[340px] bg-primary-bg rounded-5">
            <span className="text-secondary-text">No deposited tokens yet</span>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-full min-h-[550px]">
            <Preloader type="awaiting" size={48} />
          </div>
        ) : null}
      </div>
    </>
  );
};
