"use client";
import ExternalTextLink from "@repo/ui/external-text-link";
import Image from "next/image";
import React from "react";
import { formatEther, formatGwei } from "viem";

import { useBorrowRecentTransactionsStore } from "@/app/[locale]/margin-trading/stores/useBorrowRecentTransactionsStore";
import Collapse from "@/components/atoms/Collapse";
import Svg from "@/components/atoms/Svg";
import TextField, { HelperText, InputLabel } from "@/components/atoms/TextField";
import Button, { ButtonColor, ButtonSize } from "@/components/buttons/Button";
import IconButton, { IconButtonSize } from "@/components/buttons/IconButton";
import TokenInput from "@/components/common/TokenInput";
import { clsxMerge } from "@/functions/clsxMerge";
import { formatFloat } from "@/functions/formatFloat";
import { Standard } from "@/sdk_bi/standard";

export default function BorrowPage() {
  const { isOpened: showRecentTransactions, setIsOpened: setShowRecentTransactions } =
    useBorrowRecentTransactionsStore();

  return (
    <div className="mx-auto w-[600px]">
      <div className="card-spacing pt-2.5 bg-primary-bg rounded-5 grid gap-3">
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="font-bold text-20">Borrow</h3>
          <div className="flex items-center relative left-3">
            <IconButton
              buttonSize={IconButtonSize.LARGE}
              active={showRecentTransactions}
              iconName="recent-transactions"
              onClick={() => setShowRecentTransactions(!showRecentTransactions)}
            />
          </div>
        </div>

        <TextField
          label="I want to borrow"
          helperText="Min/max available: 900/4000 USDT"
          internalText="USDT"
        />

        <TokenInput
          handleClick={() => null}
          token={undefined}
          value={"0.1"}
          onInputChange={() => null}
          balance0={"12"}
          balance1={"12"}
          label="Collateral amount"
          standard={Standard.ERC20}
          otherStandard={Standard.ERC223}
          setStandard={() => null}
          setOtherStandard={() => null}
        />

        <TextField
          label="Leverage"
          helperText="Max leverage: 100x"
          internalText="x"
          tooltipText="Tooltip text"
        />

        <div>
          <InputLabel label="Total liquidation fee" tooltipText="Tooltip text" />
          <div className="flex justify-between items-center bg-tertiary-bg py-2 px-5 rounded-3">
            <div className="flex items-center gap-2">
              <Image src="/images/tokens/placeholder.svg" alt="" width={24} height={24} />
              0.3 DAI
            </div>

            <div
              className={clsxMerge(
                "relative z-10 text-10 h-[32px] rounded-20 border-green border p-1 flex gap-1 items-center",
              )}
            >
              {[Standard.ERC20, Standard.ERC223].map((st) => {
                return (
                  <button
                    key={st}
                    className={clsxMerge(
                      "h-6 rounded-3 duration-200 px-2 min-w-[58px] text-secondary-text",
                      Standard.ERC20 === st
                        ? "bg-green text-black shadow shadow-green/60"
                        : "hocus:bg-green-bg hocus:text-primary-text",
                      // !token && st === Standard.ERC20 && "bg-primary-bg shadow-none",
                      // !token && "text-tertiary-text pointer-events-none",
                    )}
                    onClick={() => {
                      // setStandard(st);
                      //
                      // if (otherStandard === st && isEqualTokens) {
                      //   if (st === Standard.ERC20) {
                      //     setOtherStandard(Standard.ERC223);
                      //   } else {
                      //     setOtherStandard(Standard.ERC20);
                      //   }
                      // }
                    }}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
          <HelperText helperText="Liquidation fee (Borrower + Lender)" />
        </div>

        <div className="rounded-3 bg-tertiary-bg justify-between flex px-5 py-3">
          <span className="text-tertiary-text">
            Lending order id: <span className="text-secondary-text">12341234</span>
          </span>
          <ExternalTextLink text="View details" href={"#"} />
        </div>

        <div className="bg-tertiary-bg px-5 py-2 mb-5 flex justify-between items-center rounded-3 flex-col xs:flex-row">
          <div className="text-12 xs:text-14 flex items-center gap-8 justify-between xs:justify-start max-xs:w-full">
            <p className="flex flex-col text-tertiary-text">
              <span>Gas price:</span>
              <span> {formatFloat(formatGwei(BigInt(0)))} GWEI</span>
            </p>

            <p className="flex flex-col text-tertiary-text">
              <span>Gas limit:</span>
              <span>{100000}</span>
            </p>
            <p className="flex flex-col">
              <span className="text-tertiary-text">Network fee:</span>
              <span>{formatFloat(formatEther(BigInt(0) * BigInt(0), "wei"))} ETH</span>
            </p>
          </div>
          <div className="grid grid-cols-[auto_1fr] xs:flex xs:items-center gap-2 w-full xs:w-auto mt-2 xs:mt-0">
            <span className="flex items-center justify-center px-2 text-14 rounded-20 font-500 text-secondary-text border border-secondary-border max-xs:h-8">
              Cheaper
            </span>
            <Button
              colorScheme={ButtonColor.LIGHT_GREEN}
              size={false ? ButtonSize.SMALL : ButtonSize.EXTRA_SMALL}
              onClick={() => null}
              fullWidth={false}
              className="rounded-5"
            >
              Edit
            </Button>
          </div>
        </div>

        <Button fullWidth>Start borrowing now</Button>

        <div className="rounded-3 bg-tertiary-bg">
          <div className="flex justify-between px-5 py-3 text-secondary-text">
            Borrow details
            <Svg iconName="small-expand-arrow" />
          </div>
          <Collapse open={true} />
        </div>
        {/*{tokenA && tokenB && typedValue ? (*/}
        {/*    <div*/}
        {/*        className={clsx(*/}
        {/*            "rounded-3 py-3.5 flex justify-between duration-200 px-5 bg-tertiary-bg my-5 md:items-center flex-wrap",*/}
        {/*        )}*/}
        {/*        role="button"*/}
        {/*    >*/}
        {/*        {computedGasSpending ? (*/}
        {/*            <>*/}
        {/*                <div className="flex flex-col justify-center">*/}
        {/*                    <div className="flex items-center gap-1">*/}
        {/*                        <Tooltip*/}
        {/*                            iconSize={_isMobile ? 16 : 24}*/}
        {/*                            text={t("network_fee_tooltip", {*/}
        {/*                                networkName: networks.find((n) => n.chainId === chainId)?.name,*/}
        {/*                            })}*/}
        {/*                        />*/}
        {/*                        <div className="text-secondary-text text-12 md:text-14 flex items-center ">*/}
        {/*                            {t("network_fee")}*/}
        {/*                        </div>*/}
        {/*                        <span className="mr-1 text-12 md:hidden">*/}
        {/*        {price && computedGasSpendingETH*/}
        {/*            ? `$${formatFloat(+computedGasSpendingETH * price)}`*/}
        {/*            : ""}*/}
        {/*      </span>*/}
        {/*                    </div>*/}
        {/*                    <div className="flex items-center gap-2 max-sm:hidden">*/}
        {/*      <span className="text-secondary-text text-12 md:text-14 ">*/}
        {/*        {computedGasSpendingETH} {nativeCurrency.symbol}*/}
        {/*      </span>*/}
        {/*                        <span className="block h-4 w-px bg-primary-border"/>*/}
        {/*                        <span className="text-tertiary-text mr-1 text-12 md:text-14 ">*/}
        {/*        {computedGasSpending} GWEI*/}
        {/*      </span>*/}
        {/*                    </div>*/}
        {/*                </div>*/}

        {/*                <div className="flex items-center gap-2 justify-between md:justify-end">*/}
        {/*    <span className="mr-1 text-14 max-md:hidden">*/}
        {/*      {price && computedGasSpendingETH*/}
        {/*          ? `$${formatFloat(+computedGasSpendingETH * price)}`*/}
        {/*          : ""}*/}
        {/*    </span>*/}
        {/*                    <span*/}
        {/*                        className="flex items-center justify-center px-2 text-12 md:text-14 h-5 rounded-20 font-500 text-tertiary-text border border-secondary-border">*/}
        {/*      {t(gasOptionTitle[gasPriceOption])}*/}
        {/*    </span>*/}
        {/*                    <Button*/}
        {/*                        size={ButtonSize.EXTRA_SMALL}*/}
        {/*                        colorScheme={ButtonColor.LIGHT_GREEN}*/}
        {/*                        onClick={(e) => {*/}
        {/*                            e.stopPropagation();*/}
        {/*                            setIsOpenedFee(true);*/}
        {/*                        }}*/}
        {/*                    >*/}
        {/*                        {t("edit")}*/}
        {/*                    </Button>*/}
        {/*                </div>*/}

        {/*                <div className="flex items-center gap-2 sm:hidden w-full mt-0.5">*/}
        {/*    <span className="text-secondary-text text-12 md:text-14 ">*/}
        {/*      {computedGasSpendingETH} {nativeCurrency.symbol}*/}
        {/*    </span>*/}
        {/*                    <span className="block h-4 w-px bg-primary-border"/>*/}
        {/*                    <span className="text-tertiary-text mr-1 text-12 md:text-14 ">*/}
        {/*      {computedGasSpending} GWEI*/}
        {/*    </span>*/}
        {/*                </div>*/}
        {/*            </>*/}
        {/*        ) : (*/}
        {/*            <span className="text-secondary-text text-14 flex items-center min-h-[26px]">*/}
        {/*  Fetching best price...*/}
        {/*</span>*/}
        {/*        )}*/}
        {/*    </div>*/}
        {/*) : (*/}
        {/*    <div className="h-4 md:h-5"/>*/}
        {/*)}*/}

        {/*{(isLoadingSwap || isPendingSwap || isPendingApprove || isLoadingApprove) && (*/}
        {/*    <div className="flex justify-between px-5 py-3 rounded-2 bg-tertiary-bg mb-5">*/}
        {/*        <div className="flex items-center gap-2 text-14">*/}
        {/*            <Preloader size={20}/>*/}

        {/*            {isLoadingSwap && <span>{t("processing_swap")}</span>}*/}
        {/*            {isPendingSwap && <span>{t("waiting_for_confirmation")}</span>}*/}
        {/*            {isLoadingApprove && <span>{t("approving_in_progress")}</span>}*/}
        {/*            {isPendingApprove && <span>{t("waiting_for_confirmation")}</span>}*/}
        {/*        </div>*/}

        {/*        <Button*/}
        {/*            onClick={() => {*/}
        {/*                if (tokenB && tokenA?.equals(tokenB)) {*/}
        {/*                    setConfirmConvertDialogOpen(true);*/}
        {/*                } else {*/}
        {/*                    setConfirmSwapDialogOpen(true);*/}
        {/*                }*/}
        {/*            }}*/}
        {/*            size={ButtonSize.EXTRA_SMALL}*/}
        {/*        >*/}
        {/*            {tokenB && tokenA?.equals(tokenB) ? "Review conversion" : t("review_swap")}*/}
        {/*        </Button>*/}
        {/*    </div>*/}
        {/*)}*/}

        {/*<OpenConfirmDialogButton*/}
        {/*    isSufficientBalance={*/}
        {/*        (tokenAStandard === Standard.ERC20 &&*/}
        {/*            (tokenA0Balance && tokenA*/}
        {/*                ? tokenA0Balance?.value >= parseUnits(typedValue, tokenA.decimals)*/}
        {/*                : false)) ||*/}
        {/*        (tokenAStandard === Standard.ERC223 &&*/}
        {/*            (tokenA1Balance && tokenA*/}
        {/*                ? tokenA1Balance?.value >= parseUnits(typedValue, tokenA.decimals)*/}
        {/*                : false))*/}
        {/*    }*/}
        {/*    isTradeReady={Boolean(trade)}*/}
        {/*    isTradeLoading={isLoadingTrade}*/}
        {/*/>*/}

        {/*{trade && tokenA && tokenB && (*/}
        {/*    <SwapDetails*/}
        {/*        trade={trade}*/}
        {/*        tokenA={tokenA}*/}
        {/*        tokenB={tokenB}*/}
        {/*        networkFee={computedGasSpendingETH}*/}
        {/*        gasPrice={computedGasSpending}*/}
        {/*    />*/}
        {/*)}*/}

        {/*<NetworkFeeConfigDialog*/}
        {/*  isAdvanced={isAdvanced}*/}
        {/*  setIsAdvanced={setIsAdvanced}*/}
        {/*  estimatedGas={estimatedGas}*/}
        {/*  setEstimatedGas={setEstimatedGas}*/}
        {/*  gasPriceSettings={gasPriceSettings}*/}
        {/*  gasPriceOption={gasPriceOption}*/}
        {/*  customGasLimit={customGasLimit}*/}
        {/*  setCustomGasLimit={setCustomGasLimit}*/}
        {/*  setGasPriceOption={setGasPriceOption}*/}
        {/*  setGasPriceSettings={setGasPriceSettings}*/}
        {/*  isOpen={isOpenedFee}*/}
        {/*  setIsOpen={setIsOpenedFee}*/}
        {/*/>*/}
      </div>
    </div>
  );
}
