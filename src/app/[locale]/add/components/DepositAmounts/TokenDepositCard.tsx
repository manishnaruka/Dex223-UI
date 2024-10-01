import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Address, formatEther, formatGwei, formatUnits, parseUnits } from "viem";
import { useAccount, useBalance, useBlockNumber } from "wagmi";

import Alert from "@/components/atoms/Alert";
import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import Preloader from "@/components/atoms/Preloader";
import Svg from "@/components/atoms/Svg";
import Tooltip from "@/components/atoms/Tooltip";
import Badge from "@/components/badges/Badge";
import Button, { ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { clsxMerge } from "@/functions/clsxMerge";
import { formatFloat } from "@/functions/formatFloat";
import { getChainSymbol } from "@/functions/getChainSymbol";
import { AllowanceStatus } from "@/hooks/useAllowance";
import useCurrentChainId from "@/hooks/useCurrentChainId";
import useRevoke from "@/hooks/useRevoke";
import useWithdraw from "@/hooks/useWithdraw";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/sdk_hybrid/addresses";
import { DexChainId } from "@/sdk_hybrid/chains";
import { Currency } from "@/sdk_hybrid/entities/currency";
import { CurrencyAmount } from "@/sdk_hybrid/entities/fractions/currencyAmount";
import { getTokenAddressForStandard, Standard } from "@/sdk_hybrid/standard";

import { RevokeDialog } from "./RevokeDialog";

export const InputRange = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: 0 | 100) => void;
}) => {
  return (
    <div className="relative h-6">
      <input
        value={value}
        max={100}
        step={100}
        min={0}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(+e.target.value as 0 | 100)}
        className={clsx(
          "w-full accent-green absolute top-2 left-0 right-0 duration-200 !bg-purple",
          value < 50 && "variant-purple",
        )}
        type="range"
      />
      <div
        className="pointer-events-none absolute bg-green h-2 rounded-1 left-0 top-2"
        style={{ width: value === 1 ? 0 : `calc(${value}% - 2px)` }}
      />
    </div>
  );
};
function InputTotalAmount({
  token,
  value,
  onChange,
  isDisabled,
}: {
  token?: Currency;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}) {
  const { address } = useAccount();

  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: token0Balance, refetch: refetchBalance0 } = useBalance({
    address: token ? address : undefined,
    token: token ? (token.wrapped.address0 as Address) : undefined,
  });
  const { data: token1Balance, refetch: refetchBalance1 } = useBalance({
    address: token ? address : undefined,
    token: token ? (token.wrapped.address1 as Address) : undefined,
  });

  useEffect(() => {
    refetchBalance0();
    refetchBalance1();
  }, [blockNumber, refetchBalance0, refetchBalance1]);

  const totalBalance = (token0Balance?.value || BigInt(0)) + (token1Balance?.value || BigInt(0));

  const maxHandler = () => {
    if (token) {
      onChange(formatFloat(formatUnits(totalBalance, token.decimals)));
    }
  };

  return (
    <div>
      <div className="bg-primary-bg px-5 pt-5 pb-4 rounded-3">
        <div className="mb-1 flex justify-between items-center">
          <NumericFormat
            decimalScale={token?.decimals}
            inputMode="decimal"
            placeholder="0.0"
            className={clsx("bg-transparent outline-0 border-0 text-20 w-full peer")}
            type="text"
            value={value}
            onValueChange={(values) => {
              onChange(values.value);
            }}
            allowNegative={false}
            disabled={isDisabled}
          />
          <div className="bg-secondary-bg rounded-5 py-1 pl-1 pr-3 flex items-center gap-2 min-w-[100px]">
            {token ? (
              <>
                <Image src={token?.logoURI || ""} alt="" width={24} height={24} />
                <span>{token.symbol}</span>
              </>
            ) : (
              <span>Select token</span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center text-14">
          <span className="text-secondary-text">—</span>
          <div className="flex gap-1">
            <span className="text-12 md:text-14">
              {token &&
                `Balance: ${formatFloat(formatUnits(totalBalance, token.decimals))} ${token.symbol}`}
            </span>
            <Button
              variant={ButtonVariant.CONTAINED}
              size={ButtonSize.EXTRA_SMALL}
              className="bg-tertiary-bg text-green xl:px-2 hover:bg-secondary-bg"
              onClick={maxHandler}
            >
              Max
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: change standard inputs for native currency, 16.09.2024
function InputStandardAmount({
  standard,
  value,
  token,
  status,
  currentAllowance,
  revokeHandler,
  estimatedGas,
  gasPrice,
}: {
  standard: Standard;
  value?: number | string;
  token?: Currency;
  currentAllowance: bigint; // currentAllowance or currentDeposit
  status: AllowanceStatus;
  revokeHandler: (customAmount?: bigint) => void; // onWithdraw or onWithdraw
  gasPrice?: bigint;
  estimatedGas: bigint | null;
}) {
  const t = useTranslations("Liquidity");
  const tSwap = useTranslations("Swap");
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address: token ? address : undefined,
    token: token ? getTokenAddressForStandard(token, standard) : undefined,
  });

  useEffect(() => {
    refetchBalance();
  }, [blockNumber, refetchBalance]);

  const [isOpenedRevokeDialog, setIsOpenedRevokeDialog] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span>{t("standard")}</span>
        <Badge color={standard === Standard.ERC20 ? "purple" : "green"} text={standard} />
        <Tooltip
          iconSize={20}
          text={standard === Standard.ERC20 ? tSwap("erc20_tooltip") : tSwap("erc223_tooltip")}
        />
      </div>
      <div className="bg-primary-bg px-4 py-2 md:p-5 w-full rounded-2">
        <div className="mb-1 flex justify-between items-center">
          <input
            className="bg-transparent outline-0 text-16 md:text-20 w-full"
            placeholder="0"
            type="text"
            value={value || ""}
            disabled
            // onChange={(e) => onChange(e.target.value)}
            onChange={() => {}}
          />
        </div>
        <div className="flex justify-end items-center text-10 md:text-14">
          <span>
            {token &&
              t("balance", {
                balance: formatFloat(formatUnits(tokenBalance?.value || BigInt(0), token.decimals)),
                symbol: token.symbol,
              })}
          </span>
        </div>
      </div>
      <div className={clsx("flex justify-between items-center h-4")}>
        {currentAllowance > 0 ? (
          <>
            {token && (
              <div className="flex items-center gap-1">
                <Tooltip
                  iconSize={16}
                  text={
                    standard === Standard.ERC20 ? t("approved_tooltip") : t("deposited_tooltip")
                  }
                />
                <span className="text-12 text-secondary-text">
                  {standard === Standard.ERC20
                    ? t("approved", {
                        approved: formatFloat(
                          formatUnits(currentAllowance || BigInt(0), token.decimals),
                        ),
                        symbol: token.symbol,
                      })
                    : t("deposited", {
                        deposited: formatFloat(
                          formatUnits(currentAllowance || BigInt(0), token.decimals),
                        ),
                        symbol: token.symbol,
                      })}
                </span>
              </div>
            )}
            {!!currentAllowance ? (
              <span
                className="text-12 px-2 pt-[1px] pb-[2px] border border-green rounded-3 h-min cursor-pointer hover:text-green duration-200"
                onClick={() => setIsOpenedRevokeDialog(true)}
              >
                {standard === Standard.ERC20 ? t("revoke") : t("withdraw")}
              </span>
            ) : null}
          </>
        ) : null}
      </div>
      {token && token.isToken && (
        <RevokeDialog
          isOpen={isOpenedRevokeDialog}
          setIsOpen={setIsOpenedRevokeDialog}
          standard={standard}
          token={token}
          status={status}
          currentAllowance={currentAllowance}
          revokeHandler={revokeHandler}
          estimatedGas={estimatedGas}
          gasPrice={gasPrice}
        />
      )}
    </div>
  );
}

export default function TokenDepositCard({
  token,
  value,
  formattedValue,
  onChange,
  isDisabled,
  isOutOfRange,
  tokenStandardRatio,
  setTokenStandardRatio,
  gasPrice,
}: {
  token?: Currency;
  value: CurrencyAmount<Currency> | undefined;
  formattedValue: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isOutOfRange: boolean;
  tokenStandardRatio: 0 | 100;
  setTokenStandardRatio: (ratio: 0 | 100) => void;
  gasPrice?: bigint;
}) {
  const t = useTranslations("Liquidity");

  const chainId = useCurrentChainId();
  const valueBigInt = value ? BigInt(value.quotient.toString()) : BigInt(0);

  const ERC223Value = (valueBigInt * BigInt(tokenStandardRatio)) / BigInt(100);
  const ERC20Value = valueBigInt - ERC223Value;

  const {
    revokeHandler,
    currentAllowance: currentAllowance,
    revokeStatus,
    revokeEstimatedGas,
  } = useRevoke({
    token,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  const {
    withdrawHandler,
    currentDeposit: currentDeposit,
    estimatedGas: depositEstimatedGas,
    withdrawStatus,
  } = useWithdraw({
    token,
    contractAddress: NONFUNGIBLE_POSITION_MANAGER_ADDRESS[chainId as DexChainId],
  });

  if (isOutOfRange) {
    return (
      <div className="flex justify-center items-center rounded-3 bg-tertiary-bg p-5 min-h-[320px]">
        <span className="text-center text-secondary-text">{t("out_of_range")}</span>
      </div>
    );
  }
  if (!token) return;
  return (
    <div className="rounded-3 bg-secondary-bg p-5">
      <div className="flex items-center gap-2 mb-3">
        {token && <Image width={24} height={24} src={token?.logoURI || ""} alt="" />}
        <h3 className="text-16 font-bold">
          {token ? t("token_deposit_amounts", { symbol: token?.symbol }) : t("select_token")}
        </h3>
      </div>
      <div className="flex flex-col gap-5">
        <InputTotalAmount
          token={token}
          value={formattedValue}
          onChange={onChange}
          isDisabled={isDisabled}
        />
        <InputRange value={tokenStandardRatio} onChange={setTokenStandardRatio} />
        <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
          <InputStandardAmount
            standard={Standard.ERC20}
            value={formatUnits(ERC20Value, token.decimals)}
            currentAllowance={currentAllowance || BigInt(0)}
            token={token}
            revokeHandler={revokeHandler}
            status={revokeStatus}
            estimatedGas={revokeEstimatedGas}
            gasPrice={gasPrice}
          />
          <InputStandardAmount
            standard={Standard.ERC223}
            value={formatUnits(ERC223Value, token.decimals)}
            token={token}
            currentAllowance={currentDeposit || BigInt(0)}
            revokeHandler={withdrawHandler}
            estimatedGas={depositEstimatedGas}
            status={withdrawStatus}
            gasPrice={gasPrice}
          />
        </div>
      </div>
    </div>
  );
}
