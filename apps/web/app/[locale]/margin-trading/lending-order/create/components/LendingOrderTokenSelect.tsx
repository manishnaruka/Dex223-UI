import React, { useCallback, useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";

import { InputSize } from "@/components/atoms/Input";
import { HelperText, InputLabel } from "@/components/atoms/TextField";
import TokenInput from "@/components/common/TokenInput";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { formatFloat } from "@/functions/formatFloat";
import useScopedBlockNumber from "@/hooks/useScopedBlockNumber";
import useTokenBalances from "@/hooks/useTokenBalances";
import { Currency } from "@/sdk_bi/entities/currency";
import { Standard } from "@/sdk_bi/standard";

export default function LendingOrderTokenSelect({
  token,
  setToken,
  amount,
  setAmount,
  standard,
  setStandard,
  errors,
  label = "Loan amount",
  setIsEnoughBalance,
}: {
  token: Currency | undefined;
  setToken: (token: Currency) => Promise<void>;
  amount: string;
  setAmount: (amount: string) => void;
  standard: Standard;
  setStandard: (standard: Standard) => Promise<void>;
  errors: string[];
  label?: string;
  setIsEnoughBalance?: (isEnoughBalance: boolean) => void;
}) {
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);

  const handlePick = useCallback(
    async (token: Currency) => {
      await setToken(token);
      await setStandard(Standard.ERC20);

      setIsOpenedTokenPick(false);
    },
    [setStandard, setToken],
  );

  const {
    balance: { erc20Balance: token0Balance, erc223Balance: token1Balance },
    refetch: refetchBalance,
  } = useTokenBalances(token);

  useEffect(() => {
    if (!token || !token0Balance || !token1Balance || !setIsEnoughBalance) {
      return;
    }

    if (
      (standard === Standard.ERC20 &&
        parseUnits(amount, token.decimals ?? 18) > token0Balance.value) ||
      (standard === Standard.ERC223 &&
        parseUnits(amount, token.decimals ?? 18) > token1Balance.value)
    ) {
      setIsEnoughBalance(false);
      return;
    } else {
      setIsEnoughBalance(true);
    }
  }, [amount, setIsEnoughBalance, standard, token, token0Balance, token1Balance]);

  const { data: blockNumber } = useScopedBlockNumber();

  useEffect(() => {
    refetchBalance();
  }, [blockNumber, refetchBalance]);

  return (
    <div className="">
      <InputLabel inputSize={InputSize.LARGE} label={label} tooltipText="Tooltip text" />
      <TokenInput
        isError={!!errors.length}
        handleClick={() => {
          setIsOpenedTokenPick(true);
        }}
        token={token}
        value={amount}
        onInputChange={(value) => {
          setAmount(value);
        }}
        balance0={
          token0Balance && Boolean(token0Balance.value) ? formatFloat(token0Balance.formatted) : "0"
        }
        balance1={
          token1Balance && Boolean(token1Balance.value) ? formatFloat(token1Balance.formatted) : "0"
        }
        standard={standard}
        setStandard={setStandard}
      />
      <PickTokenDialog
        handlePick={handlePick}
        isOpen={isOpenedTokenPick}
        setIsOpen={setIsOpenedTokenPick}
      />
      <div className="mb-4">
        <HelperText error={errors[0]} />
      </div>
    </div>
  );
}
