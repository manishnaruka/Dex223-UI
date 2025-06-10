import React, { useCallback, useEffect, useState } from "react";

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
}: {
  token: Currency | undefined;
  setToken: (token: Currency) => Promise<void>;
  amount: string;
  setAmount: (amount: string) => void;
  standard: Standard;
  setStandard: (standard: Standard) => Promise<void>;
  errors: string[];
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

  const { data: blockNumber } = useScopedBlockNumber();

  useEffect(() => {
    refetchBalance();
  }, [blockNumber, refetchBalance]);

  return (
    <div className="">
      <InputLabel label="Loan amount" tooltipText="Tooltip text" />
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
        otherStandard={Standard.ERC20}
        setStandard={setStandard}
        setOtherStandard={() => {}}
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
