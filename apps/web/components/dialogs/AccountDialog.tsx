import ExternalTextLink from "@repo/ui/external-text-link";
import Tooltip from "@repo/ui/tooltip";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Address } from "viem";
import { useAccount, useDisconnect } from "wagmi";

import DialogHeader from "@/components/atoms/DialogHeader";
import Drawer from "@/components/atoms/Drawer";
import Popover from "@/components/atoms/Popover";
import ScrollbarContainer from "@/components/atoms/ScrollbarContainer";
import SelectButton from "@/components/atoms/SelectButton";
import Svg from "@/components/atoms/Svg";
import Badge from "@/components/badges/Badge";
import Button, { ButtonSize } from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";
import TabButton from "@/components/buttons/TabButton";
import RecentTransaction from "@/components/common/RecentTransaction";
import { useConnectWalletDialogStateStore } from "@/components/dialogs/stores/useConnectWalletStore";
import { wallets } from "@/config/wallets";
import { copyToClipboard } from "@/functions/copyToClipboard";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useTokenBalances from "@/hooks/useTokenBalances";
import { useTokens } from "@/hooks/useTokenLists";
import addToast from "@/other/toast";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { Standard } from "@/sdk_hybrid/standard";
import { usePinnedTokensStore } from "@/stores/usePinnedTokensStore";
import { useRecentTransactionsStore } from "@/stores/useRecentTransactionsStore";

function PinnedTokenRow({ token }: { token: Currency }) {
  const {
    balance: { erc20Balance, erc223Balance },
  } = useTokenBalances(token);

  return (
    <div key={token.symbol} className="p-5 bg-tertiary-bg flex flex-col gap-3 rounded-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            width={40}
            height={40}
            src={token.logoURI || "/images/tokens/placeholder.svg"}
            alt=""
          />
          <div className="flex flex-col">
            <span>{token.name}</span>
            <span className="text-secondary-text text-12">2 {token.symbol?.toUpperCase()}</span>
          </div>
        </div>
        <span>$0.00</span>
      </div>
      {token.isToken ? (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center bg-quaternary-bg py-1 px-3 rounded-2">
            <div className="flex items-center gap-2">
              <span className="text-12 text-tertiary-text">Balance</span>
              <span className="block min-w-[58px]">
                <Badge className="w-fit" size="small" text={Standard.ERC20} />
              </span>
              <Tooltip iconSize={16} text="Tooltip text" />
            </div>

            <span className="text-secondary-text text-12">
              {formatFloat(erc20Balance?.formatted || "0.0")} {token.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center bg-quaternary-bg py-1 px-3 rounded-2">
            <div className="flex items-center gap-2">
              <span className="text-12 text-tertiary-text">Balance</span>
              <span className="block min-w-[58px]">
                <Badge className="w-fit" size="small" text={Standard.ERC223} />
              </span>
              <Tooltip iconSize={16} text="Tooltip text" />
            </div>

            <span className="text-secondary-text text-12">
              {formatFloat(erc223Balance?.formatted || "0.0")} {token.symbol}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center bg-quaternary-bg py-1 px-3 rounded-2">
          <div className="flex items-center gap-2">
            <span className="text-12 text-tertiary-text">Balance</span>
            <span className="block min-w-[58px]">
              <Badge className="w-fit" size="small" text="Native" />
            </span>
            <Tooltip iconSize={16} text="Tooltip text" />
          </div>

          <span className="text-secondary-text text-12">
            {formatFloat(erc20Balance?.formatted || "0.0")} {token.symbol}
          </span>
        </div>
      )}
    </div>
  );
}

function AccountDialogContent({ setIsOpenedAccount, activeTab, setActiveTab }: any) {
  const tToast = useTranslations("Toast");
  const tRecentTransactions = useTranslations("RecentTransactions");
  const t = useTranslations("Wallet");

  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const chainId = useCurrentChainId();

  const { transactions, clearTransactions } = useRecentTransactionsStore();

  const _transactions = useMemo(() => {
    if (address && transactions[address]) {
      return transactions[address];
    }

    return [];
  }, [address, transactions]);
  const { connector } = useAccount();

  const tokens = useTokens();
  const { tokens: pinnedTokensAddresses, toggleToken } = usePinnedTokensStore();

  const pinnedTokens = useMemo(() => {
    const lookupMap: Map<"native" | Address, Currency> = new Map(
      tokens.map((token) => [token.isNative ? "native" : token.address0, token]),
    );

    return pinnedTokensAddresses[chainId].map((id) => lookupMap.get(id));
  }, [chainId, pinnedTokensAddresses, tokens]);

  return (
    <>
      <DialogHeader onClose={() => setIsOpenedAccount(false)} title={t("my_wallet")} />
      <div className="card-spacing-x md:w-[600px] w-full">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Image src={wallets.metamask.image} alt="" width={48} height={48} />
            <div></div>

            <div className="flex gap-1">
              {address && (
                <ExternalTextLink
                  text={`${address.slice(0, 6)}...${address.slice(-4)}`}
                  href={getExplorerLink(ExplorerLinkType.ADDRESS, address, chainId)}
                />
              )}
              <IconButton variant={IconButtonVariant.COPY} text={address || ""} />
            </div>
          </div>
          <button
            onClick={() => {
              setIsOpenedAccount(false);
              disconnect({ connector });
            }}
            className="text-secondary-text flex items-center gap-2 hocus:text-green duration-200"
          >
            {t("disconnect")}
            <Svg iconName="logout" />
          </button>
        </div>
        <div className="relative bg-gradient-card-account rounded-2">
          <div className="absolute right-0 top-0 bottom-0 bg-account-card-pattern mix-blend-screen bg-no-repeat bg-right w-full h-full" />
          <div className="relative mb-5 px-5 py-6 grid gap-3 z-10">
            <div>
              <div className="text-16 text-secondary-text">{t("total_balance")}</div>
              <div className="text-32 text-primary-text font-medium">$0.00</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 bg-secondary-bg p-1 gap-1 rounded-3 mb-3">
          {[t("pinned_tokens"), t("transactions")].map((title, index) => {
            return (
              <TabButton
                key={title}
                inactiveBackground="bg-primary-bg"
                size={48}
                active={index === activeTab}
                onClick={() => setActiveTab(index)}
              >
                {title}
              </TabButton>
            );
          })}
        </div>

        {activeTab == 0 && (
          <>
            {pinnedTokens.length ? (
              <div className="h-[376px] -mt-3 pt-3">
                <button className="h-12 items-center w-full duration-200 text-secondary-text mb-3 bg-tertiary-bg flex justify-between rounded-2 border-l-4 border-green pl-4 pr-3 hocus:bg-green-bg hocus:text-primary-text group">
                  <span className="flex items-center gap-2">
                    <Svg
                      className="text-tertiary-text group-hocus:text-green duration-200 "
                      iconName="pin-fill"
                    />
                    Manage pinned tokens
                  </span>
                  <div className="relative before:opacity-0 before:duration-200 group-hocus:before:opacity-40 before:absolute before:w-4 before:h-4 before:rounded-full before:bg-green-hover-icon before:blur-[8px] before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2">
                    <Svg
                      className="text-tertiary-text group-hocus:text-green-hover-icon duration-200 "
                      iconName="forward"
                    />
                  </div>
                </button>
                <ScrollbarContainer className="pb-3 -mr-3 pr-3 md:-mr-8 md:pr-8" height={304}>
                  <div className="flex flex-col gap-2 md:gap-3">
                    {pinnedTokens.map((pinnedToken) => {
                      if (!pinnedToken) {
                        return;
                      }

                      return (
                        <PinnedTokenRow
                          key={pinnedToken.symbol + pinnedToken.wrapped.address0}
                          token={pinnedToken}
                        />
                      );
                    })}
                  </div>
                </ScrollbarContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[376px] overflow-auto gap-2 bg-empty-no-tokens bg-no-repeat bg-right-top -mx-4 card-spacing-x sm:-mx-6 lg:-mx-10 -mt-3 pt-3 max-md:bg-size-180">
                <span className="text-secondary-text">{t("assets_will_be_displayed_here")}</span>
              </div>
            )}
          </>
        )}

        {activeTab == 1 && (
          <div>
            {_transactions.length ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-tertiary-text">
                    {tRecentTransactions("total_transactions")} {_transactions.length}
                  </span>
                  <button
                    onClick={clearTransactions}
                    className="border-transparent hocus:border-primary-border text-secondary-text hocus:text-primary-text flex items-center rounded-5 border text-14 py-1.5 pl-6 gap-2 pr-[18px] hocus:bg-white/20 duration-200 bg-quaternary-bg"
                  >
                    {tRecentTransactions("clear_all")}
                    <Svg iconName="delete" />
                  </button>
                </div>
                <ScrollbarContainer className="pb-3 -mr-3 pr-3 md:-mr-8 md:pr-8" height={314}>
                  <div className="flex flex-col gap-2 md:gap-3">
                    {_transactions.map((transaction) => {
                      return <RecentTransaction transaction={transaction} key={transaction.hash} />;
                    })}
                  </div>
                </ScrollbarContainer>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 h-[376px] bg-empty-no-transactions bg-right-top bg-no-repeat -mx-4 card-spacing-x sm:-mx-6 lg:-mx-10 -mt-3 pt-3 max-md:bg-size-180">
                <span className="text-secondary-text">
                  {tRecentTransactions("transactions_will_be_displayed_here")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function AccountDialog() {
  const { isConnected, address, connector } = useAccount();

  const { setIsOpened: setOpenedWallet } = useConnectWalletDialogStateStore();

  const [activeTab, setActiveTab] = useState(0);

  const _isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  const [isOpenedAccount, setIsOpenedAccount] = useState(false);

  const trigger = useMemo(
    () => (
      <SelectButton
        className="py-1 xl:py-2 text-14 xl:text-16 w-full md:w-auto flex items-center justify-center group"
        isOpen={isOpenedAccount}
        onClick={() => setIsOpenedAccount(!isOpenedAccount)}
      >
        <span className="duration-200 flex gap-2 items-center text-secondary-text group-hover:text-primary-text">
          <Svg
            className="duration-200 text-tertiary-text group-hover:text-primary-text"
            iconName="wallet"
          />
          {truncateMiddle(address || "", { charsFromStart: 5, charsFromEnd: 3 })}
        </span>
      </SelectButton>
    ),
    [address, isOpenedAccount],
  );

  const [isInitialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <>
      {isConnected && address ? (
        <>
          {_isMobile ? (
            <>
              {trigger}
              <Drawer placement="bottom" isOpen={isOpenedAccount} setIsOpen={setIsOpenedAccount}>
                <AccountDialogContent
                  setIsOpenedAccount={setIsOpenedAccount}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </Drawer>
            </>
          ) : (
            <div>
              <Popover
                isOpened={isOpenedAccount}
                setIsOpened={setIsOpenedAccount}
                placement={"bottom-end"}
                trigger={trigger}
              >
                <div className="bg-primary-bg rounded-5 border border-secondary-border shadow-popover shadow-black/70">
                  <AccountDialogContent
                    setIsOpenedAccount={setIsOpenedAccount}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
              </Popover>
            </div>
          )}
        </>
      ) : (
        <div>
          <Button
            size={ButtonSize.MEDIUM}
            tabletSize={ButtonSize.SMALL}
            mobileSize={ButtonSize.SMALL}
            className="rounded-2 md:rounded-2 md:font-normal w-full md:w-auto"
            onClick={() => setOpenedWallet(true)}
          >
            Connect wallet
          </Button>
        </div>
      )}
    </>
  );
}
