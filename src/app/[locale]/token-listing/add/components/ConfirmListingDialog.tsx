import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { PropsWithChildren, ReactNode, useMemo } from "react";
import { Address, formatGwei } from "viem";
import { useGasPrice } from "wagmi";

import { useTrade } from "@/app/[locale]/swap/libs/trading";
import { useConfirmSwapDialogStore } from "@/app/[locale]/swap/stores/useConfirmSwapDialogOpened";
import {
  useSwapGasLimitStore,
  useSwapGasPriceStore,
} from "@/app/[locale]/swap/stores/useSwapGasSettingsStore";
import { useSwapSettingsStore } from "@/app/[locale]/swap/stores/useSwapSettingsStore";
import { useAutoListingContract } from "@/app/[locale]/token-listing/add/hooks/useAutoListingContracts";
import useListToken from "@/app/[locale]/token-listing/add/hooks/useListToken";
import { useListTokenStatus } from "@/app/[locale]/token-listing/add/hooks/useListTokenStatus";
import { useAutoListingContractStore } from "@/app/[locale]/token-listing/add/stores/useAutoListingContractStore";
import { useConfirmListTokenDialogStore } from "@/app/[locale]/token-listing/add/stores/useConfirmListTokenDialogOpened";
import { useListTokensStore } from "@/app/[locale]/token-listing/add/stores/useListTokensStore";
import {
  ListError,
  useListTokenStatusStore,
} from "@/app/[locale]/token-listing/add/stores/useListTokenStatusStore";
import Alert from "@/components/atoms/Alert";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";
import ExternalTextLink from "@/components/atoms/ExternalTextLink";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Button from "@/components/buttons/Button";
import IconButton from "@/components/buttons/IconButton";
import { clsxMerge } from "@/functions/clsxMerge";
import { formatFloat } from "@/functions/formatFloat";
import getExplorerLink, { ExplorerLinkType } from "@/functions/getExplorerLink";
import truncateMiddle from "@/functions/truncateMiddle";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { Token } from "@/sdk_hybrid/entities/token";
import { GasFeeModel } from "@/stores/useRecentTransactionsStore";

function ApproveRow({
  logoURI = "",
  isPending = false,
  isLoading = false,
  isSuccess = false,
  isReverted = false,
  hash,
}: {
  logoURI: string | undefined;
  isLoading?: boolean;
  isPending?: boolean;
  isSuccess?: boolean;
  isReverted?: boolean;
  hash?: Address | undefined;
}) {
  const t = useTranslations("Swap");

  return (
    <div
      className={clsx(
        "grid grid-cols-[32px_1fr_1fr] gap-2 h-10 before:absolute relative before:left-[15px] before:-bottom-4 before:w-0.5 before:h-3 before:rounded-1",
        isSuccess ? "before:bg-green" : "before:bg-green-bg",
      )}
    >
      <div className="flex items-center">
        <Image
          className={clsx(isSuccess && "", "rounded-full")}
          src={logoURI}
          alt=""
          width={32}
          height={32}
        />
      </div>

      <div className="flex flex-col justify-center">
        <span className={isSuccess ? "text-secondary-text text-14" : "text-14"}>
          {isSuccess && t("approved")}
          {isPending && "Confirm in your wallet"}
          {isLoading && "Approving"}
          {!isSuccess && !isPending && !isReverted && !isLoading && "Approve"}
          {isReverted && "Approve failed"}
        </span>
        {!isSuccess && <span className="text-green text-12">{t("why_do_i_have_to_approve")}</span>}
      </div>
      <div className="flex items-center gap-2 justify-end">
        {hash && (
          <a
            target="_blank"
            href={getExplorerLink(ExplorerLinkType.TRANSACTION, hash, DexChainId.SEPOLIA)}
          >
            <IconButton iconName="forward" />
          </a>
        )}
        {isPending && (
          <>
            <Preloader type="linear" />
            <span className="text-secondary-text text-14">{t("proceed_in_your_wallet")}</span>
          </>
        )}
        {isLoading && <Preloader size={20} />}
        {isSuccess && <Svg className="text-green" iconName="done" size={20} />}
        {isReverted && <Svg className="text-red-input" iconName="warning" size={20} />}
      </div>
    </div>
  );
}

function ListTokenRow({
  isPending = false,
  isLoading = false,
  isSuccess = false,
  isSettled = false,
  isReverted = false,
  isDisabled = false,
  hash,
}: {
  isLoading?: boolean;
  isPending?: boolean;
  isSettled?: boolean;
  isSuccess?: boolean;
  isReverted?: boolean;
  isDisabled?: boolean;
  hash?: Address | undefined;
}) {
  const t = useTranslations("Swap");

  return (
    <div className="grid grid-cols-[32px_1fr_1fr] gap-2 h-10">
      <div className="flex items-center h-full">
        <div
          className={clsxMerge(
            "p-1 rounded-full h-8 w-8",
            isDisabled ? "bg-tertiary-bg" : "bg-green",
            isReverted && "bg-red-bg",
          )}
        >
          <Svg
            className={clsxMerge(
              "rotate-90",
              isDisabled ? "text-tertiary-text" : "text-secondary-bg",
              isReverted && "text-red-input",
            )}
            iconName="swap"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className={clsx("text-14", isDisabled ? "text-tertiary-text" : "text-primary-text")}>
          {(isPending || (!isLoading && !isReverted && !isSuccess)) && "Confirm listing tokens"}
          {isLoading && "Executing list tokens"}
          {isReverted && "Failed to list tokens"}
          {isSuccess && "Tokens listed"}
        </span>
        {(isPending || isLoading) && (
          <span className="text-green text-12">Learn more about listing tokens</span>
        )}
      </div>
      <div className="flex items-center gap-2 justify-end">
        {hash && (
          <a
            target="_blank"
            href={getExplorerLink(ExplorerLinkType.TRANSACTION, hash, DexChainId.SEPOLIA)}
          >
            <IconButton iconName="forward" />
          </a>
        )}
        {isPending && (
          <>
            <Preloader type="linear" />
            <span className="text-secondary-text text-14">{t("proceed_in_your_wallet")}</span>
          </>
        )}
        {isLoading && <Preloader size={20} />}
        {isSuccess && <Svg className="text-green" iconName="done" size={20} />}
        {isReverted && <Svg className="text-red-input" iconName="warning" size={20} />}
      </div>
    </div>
  );
}

function Rows({ children }: PropsWithChildren<{}>) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

function ListActionButton() {
  const t = useTranslations("Swap");
  const { tokenA, tokenB } = useListTokensStore();
  const { isOpen, setIsOpen } = useConfirmSwapDialogStore();

  const { handleList } = useListToken();
  const { listTokenHash, approveHash, errorType } = useListTokenStatusStore();

  const {
    isPendingApprove,
    isLoadingApprove,
    isPendingList,
    isLoadingList,
    isSuccessList,
    isSettledList,
    isRevertedList,
    isRevertedApprove,
  } = useListTokenStatus();

  if (!tokenA || !tokenB) {
    return (
      <Button fullWidth disabled>
        {t("select_tokens")}
      </Button>
    );
  }

  if (isPendingApprove) {
    return (
      <Rows>
        <ApproveRow isPending logoURI={tokenA.logoURI} />
        <ListTokenRow isDisabled />
      </Rows>
    );
  }

  if (isLoadingApprove) {
    return (
      <Rows>
        <ApproveRow hash={approveHash} isLoading logoURI={tokenA.logoURI} />
        <ListTokenRow isDisabled />
      </Rows>
    );
  }

  if (isRevertedApprove) {
    return (
      <>
        <Rows>
          <ApproveRow hash={approveHash} isReverted logoURI={tokenA.logoURI} />
          <ListTokenRow isDisabled />
        </Rows>
        <div className="flex flex-col gap-5 mt-4">
          <Alert
            withIcon={false}
            type="error"
            text={
              <span>
                Transaction failed due to lack of gas or an internal contract error. Try using
                higher slippage or gas to ensure your transaction is completed. If you still have
                issues, click{" "}
                <a href="#" className="text-green hover:underline">
                  common errors
                </a>
                .
              </span>
            }
          />
          <Button
            fullWidth
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Try again
          </Button>
        </div>
      </>
    );
  }

  if (isPendingList) {
    return (
      <Rows>
        {/*{tokenAStandard === Standard.ERC20 && (*/}
        <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
        {/*)}*/}
        <ListTokenRow isPending />
      </Rows>
    );
  }

  if (isLoadingList) {
    return (
      <Rows>
        {/*{tokenAStandard === Standard.ERC20 && (*/}
        <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
        {/*)}*/}
        <ListTokenRow hash={listTokenHash} isLoading />
      </Rows>
    );
  }

  if (isSuccessList) {
    return (
      <Rows>
        {/*{tokenAStandard === Standard.ERC20 && (*/}
        <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
        {/*)}*/}
        <ListTokenRow hash={listTokenHash} isSettled isSuccess />
      </Rows>
    );
  }

  if (isRevertedList) {
    return (
      <>
        <Rows>
          {/*{tokenAStandard === Standard.ERC20 && (*/}
          <ApproveRow hash={approveHash} isSuccess logoURI={tokenA.logoURI} />
          {/*)}*/}
          <ListTokenRow hash={listTokenHash} isSettled isReverted />
        </Rows>
        <div className="flex flex-col gap-5 mt-4">
          <Alert
            withIcon={false}
            type="error"
            text={
              errorType === ListError.UNKNOWN ? (
                <span>
                  Transaction failed due to lack of gas or an internal contract error. Try using
                  higher slippage or gas to ensure your transaction is completed. If you still have
                  issues, click{" "}
                  <a href="#" className="text-green hover:underline">
                    common errors
                  </a>
                  .
                </span>
              ) : (
                <span>
                  Transaction failed due to lack of gas. Try increasing gas limit to ensure your
                  transaction is completed. If you still have issues, contact support.
                </span>
              )
            }
          />
          <Button
            fullWidth
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Try again
          </Button>
        </div>
      </>
    );
  }

  return (
    <Button onClick={handleList} fullWidth>
      Confirm
    </Button>
  );
}

function SingleCard({
  underlineText,
  title,
  address,
  color = "tertiary",
}: {
  color?: "tertiary" | "quaternary";
  underlineText?: string;
  title: string;
  address: Address;
}) {
  return (
    <div
      className={clsx(
        "rounded-3 flex flex-col overflow-hidden",
        color === "quaternary" ? "bg-quaternary-bg" : "bg-tertiary-bg",
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-center flex-col py-3",
          color === "quaternary"
            ? "bg-quaternary-bg border-b border-b-tertiary-bg"
            : "bg-tertiary-bg",
        )}
      >
        {underlineText && <div className="text-secondary-text text-14">{underlineText}</div>}
        <div className="text-18">{title}</div>
      </div>

      <div className="bg-quaternary-bg flex items-center text-16 py-4 justify-center">
        <ExternalTextLink color="white" text={truncateMiddle(address)} href="#" />
      </div>
    </div>
  );
}

function SwapDetailsRow({
  title,
  value,
  tooltipText,
}: {
  title: string;
  value: string | ReactNode;
  tooltipText: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center text-secondary-text">
        <Tooltip iconSize={20} text={tooltipText} />
        {title}
      </div>
      <span>{value}</span>
    </div>
  );
}

export default function ConfirmListingDialog() {
  const t = useTranslations("Swap");
  const { tokenA, tokenB, reset: resetTokens } = useListTokensStore();
  const chainId = useCurrentChainId();
  const { autoListingContract, setAutoListingContract } = useAutoListingContractStore();

  const autoListing = useAutoListingContract(autoListingContract);

  const { isOpen, setIsOpen } = useConfirmListTokenDialogStore();

  const { trade } = useTrade();

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    return trade?.outputAmount;
  }, [trade?.outputAmount]);

  const output = useMemo(() => {
    if (!trade) {
      return "";
    }

    return trade.outputAmount.toSignificant();
  }, [trade]);

  const { slippage, deadline: _deadline } = useSwapSettingsStore();
  const {
    isPendingList,
    isLoadingList,
    isSuccessList,
    isLoadingApprove,
    isPendingApprove,
    isRevertedList,
    isSettledList,
    isRevertedApprove,
  } = useListTokenStatus();
  const { estimatedGas, customGasLimit } = useSwapGasLimitStore();

  const isProcessing = useMemo(() => {
    return (
      isPendingList ||
      isLoadingList ||
      isSettledList ||
      isLoadingApprove ||
      isPendingApprove ||
      isRevertedApprove
    );
  }, [
    isLoadingApprove,
    isLoadingList,
    isPendingApprove,
    isPendingList,
    isRevertedApprove,
    isSettledList,
  ]);

  const { gasPriceSettings } = useSwapGasPriceStore();
  const { data: baseFee } = useGasPrice();

  const computedGasSpending = useMemo(() => {
    if (gasPriceSettings.model === GasFeeModel.LEGACY && gasPriceSettings.gasPrice) {
      return formatFloat(formatGwei(gasPriceSettings.gasPrice));
    }

    if (
      gasPriceSettings.model === GasFeeModel.EIP1559 &&
      gasPriceSettings.maxFeePerGas &&
      gasPriceSettings.maxPriorityFeePerGas &&
      baseFee
    ) {
      const lowerFeePerGas =
        gasPriceSettings.maxFeePerGas > baseFee ? baseFee : gasPriceSettings.maxFeePerGas;

      return formatFloat(formatGwei(lowerFeePerGas + gasPriceSettings.maxPriorityFeePerGas));
    }

    return "0.00";
  }, [baseFee, gasPriceSettings]);

  console.log(autoListing);

  const tokensToList = useMemo(() => {
    if (!autoListing) {
      return [];
    }

    const isFirstTokenInList = autoListing.tokens.find((l: any) => {
      return l.token.addressERC20.toLowerCase() === tokenA?.address0.toLowerCase();
    });
    const isSecondTokenInList = autoListing.tokens.find((l: any) => {
      return l.token.addressERC20.toLowerCase() === tokenB?.address0.toLowerCase();
    });

    console.log(Boolean(isFirstTokenInList));
    console.log(!!isSecondTokenInList);

    if (isFirstTokenInList && isSecondTokenInList) {
      return [];
    }

    if (isFirstTokenInList && !isSecondTokenInList) {
      return [tokenB];
    }

    if (isSecondTokenInList && !isFirstTokenInList) {
      return [tokenA];
    }

    if (!isSecondTokenInList && !isFirstTokenInList) {
      return [tokenA, tokenB];
    }

    return [];
  }, [autoListing, tokenA, tokenB]);

  return (
    <DrawerDialog
      isOpen={isOpen}
      setIsOpen={(isOpen) => {
        setIsOpen(isOpen);
        if (isSettledList) {
          resetTokens();
        }
      }}
    >
      <div className="shadow-popup bg-primary-bg rounded-5 w-full md:w-[600px]">
        <DialogHeader
          onClose={() => {
            if (isSettledList) {
              resetTokens();
            }
            setIsOpen(false);
          }}
          title={"Review listing tokens"}
        />
        <div className="px-4 pb-4 md:px-10 md:pb-9">
          {!isSettledList && !isRevertedApprove && (
            <div className="mb-5">
              {tokensToList.length === 1 && tokensToList[0] && (
                <div className="grid grid-cols-[1fr_12px_1fr]">
                  <SingleCard
                    address={tokensToList[0].address0}
                    title={tokensToList[0].symbol!}
                    underlineText="You list token"
                  />
                  <div className="relative">
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 flex justify-center items-center w-12 h-12 rounded-full bg-primary-bg">
                      <Svg iconName="arrow-in" />
                    </div>
                  </div>
                  <SingleCard
                    address={autoListingContract!}
                    title={autoListing.name}
                    underlineText="In the auto-listing contract"
                  />
                </div>
              )}
              {tokensToList.length === 2 && tokensToList[0] && tokensToList[1] && (
                <>
                  <div className="p-5 bg-tertiary-bg rounded-3">
                    <div className="text-center text-secondary-text mb-3">You list tokens</div>
                    <div className="grid grid-cols-[1fr_12px_1fr]">
                      <SingleCard
                        color="quaternary"
                        address={tokensToList[0].address0}
                        title={tokensToList[0].symbol!}
                      />
                      <div />
                      <SingleCard
                        color="quaternary"
                        address={tokensToList[1].address0}
                        title={tokensToList[1].symbol!}
                      />
                    </div>
                  </div>

                  <div className="relative h-3">
                    <div className="absolute  -translate-x-1/2 -bottom-2 left-1/2 flex justify-center items-center w-12 h-12 rounded-full bg-primary-bg">
                      <Svg className="-rotate-90" iconName="arrow-in" />
                    </div>
                  </div>

                  <SingleCard
                    address={autoListingContract!}
                    title={autoListing.name}
                    underlineText="In the auto-listing contract"
                  />
                </>
              )}
            </div>
          )}
          {(isSettledList || isRevertedApprove) && (
            <div>
              <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
                {(isRevertedList || isRevertedApprove) && <EmptyStateIcon iconName="warning" />}

                {isSuccessList && (
                  <>
                    <div className="w-[54px] h-[54px] rounded-full border-[7px] blur-[8px] opacity-80 border-green" />
                    <Svg
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green"
                      iconName={"success"}
                      size={65}
                    />
                  </>
                )}
              </div>

              <div className="flex justify-center">
                <span className="text-20 font-bold text-primary-text mb-1">
                  {isRevertedList && t("swap_failed")}
                  {isSuccessList && t("successful_swap")}
                  {isRevertedApprove && "Approve failed"}
                </span>
              </div>

              <div className="flex justify-center gap-2 items-center">
                <Image src={tokenA?.logoURI || ""} alt="" width={24} height={24} />
                <span>{/*{tokenA?.symbol} {typedValue}*/}</span>
                <Svg iconName="next" />
                <Image src={tokenB?.logoURI || ""} alt="" width={24} height={24} />
                <span>
                  {tokenB?.symbol} {output}
                </span>
              </div>
            </div>
          )}
          {isProcessing && <div className="h-px w-full bg-secondary-border mb-4 mt-5" />}
          <ListActionButton />
        </div>
      </div>
    </DrawerDialog>
  );
}
