import React, { useCallback, useEffect, useState } from "react";

import { InputLabel } from "@/components/atoms/TextField";
import TokenInput from "@/components/common/TokenInput";
import PickTokenDialog from "@/components/dialogs/PickTokenDialog";
import { formatFloat } from "@/functions/formatFloat";
import useScopedBlockNumber from "@/hooks/useScopedBlockNumber";
import useTokenBalances from "@/hooks/useTokenBalances";
import { Currency } from "@/sdk_bi/entities/currency";
import { Standard } from "@/sdk_bi/standard";

export default function LendingOrderTokenSelect() {
  const [token, setToken] = React.useState<Currency | undefined>();
  const [tokenStandard, setTokenStandard] = React.useState<Standard>(Standard.ERC20);
  const [isOpenedTokenPick, setIsOpenedTokenPick] = useState(false);
  const [typedValue, setTypedValue] = React.useState<string>("");

  const handlePick = useCallback((token: Currency) => {
    setToken(token);
    setTokenStandard(Standard.ERC20);

    setIsOpenedTokenPick(false);
  }, []);

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
        handleClick={() => {
          setIsOpenedTokenPick(true);
        }}
        token={token}
        value={typedValue}
        onInputChange={(value) => {
          setTypedValue(value);
        }}
        balance0={
          token0Balance && Boolean(token0Balance.value) ? formatFloat(token0Balance.formatted) : "0"
        }
        balance1={
          token1Balance && Boolean(token1Balance.value) ? formatFloat(token1Balance.formatted) : "0"
        }
        standard={tokenStandard}
        otherStandard={Standard.ERC20}
        setStandard={setTokenStandard}
        setOtherStandard={() => {}}
      />
      <PickTokenDialog
        handlePick={handlePick}
        isOpen={isOpenedTokenPick}
        setIsOpen={setIsOpenedTokenPick}
      />
      <div className="h-[18px] mb-4" />
    </div>
  );
}
