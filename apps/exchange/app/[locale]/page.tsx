"use client";

import { useCallback, useEffect, useState } from "react";

import PickTokenDialog from "@/app/[locale]/components/PickTokenDialog";
import Container from "@/components/atoms/Container";
import Switch from "@/components/atoms/Switch";
import TextField from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";
import Button from "@/components/buttons/Button";
import SwapButton from "@/components/buttons/SwapButton";
import TokenInput from "@/components/common/TokenInput";
import Tab from "@/components/tabs/Tab";
import Tabs from "@/components/tabs/Tabs";
import { IIFE } from "@/functions/iife";

export default function ExchangePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [pickTokenContext, setPickTokenContext] = useState<"tokenA" | "tokenB">("tokenA");
  const [tokenA, setTokenA] = useState<any>();
  const [tokenB, setTokenB] = useState<any>();

  const handleChange = useCallback(
    (token: any) => {
      if (pickTokenContext === "tokenA") {
        setTokenA(token);
      } else {
        setTokenB(token);
      }
    },
    [pickTokenContext],
  );

  const [inputAmount, setInputAmount] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [outputAmount, setOutputAmount] = useState("");

  useEffect(() => {
    if (!tokenA || !tokenB || !inputAmount) {
      setOutputAmount("");
      return;
    }

    IIFE(async () => {
      const data = await fetch(
        `https://api.simpleswap.io/get_estimated?api_key=${process.env.NEXT_PUBLIC_SIMPLE_SWAP_API_KEY}&fixed=${isFixed}&currency_from=${tokenA.symbol}&currency_to=${tokenB.symbol}&amount=${inputAmount}`,
      );

      const res = await data.json();

      if (typeof res === "string") {
        setOutputAmount(res);
      }
    });
  }, [inputAmount, isFixed, tokenA, tokenB]);

  return (
    <Container className="px-4">
      <div className="mx-auto w-[600px]">
        <Tabs fullWidth>
          <Tab title="Exchange">
            <div className="mt-5 bg-primary-bg px-10 pb-10 rounded-5">
              <h1 className="py-3.5 text-20 font-bold">Crypto exchange</h1>
              <TokenInput
                handleClick={() => {
                  setIsOpen(true);
                  setPickTokenContext("tokenA");
                }}
                token={tokenA}
                value={inputAmount}
                onInputChange={(value) => {
                  setInputAmount(value);
                }}
                balance0={""}
                balance1={""}
                label="You send"
              />
              <div className="relative h-3 z-10">
                <SwapButton onClick={() => {}} />
              </div>
              <TokenInput
                handleClick={() => {
                  setIsOpen(true);
                  setPickTokenContext("tokenB");
                }}
                readOnly
                token={tokenB}
                value={outputAmount}
                onInputChange={() => {}}
                balance0={""}
                balance1={""}
                label="You send"
              />
              <div className="flex items-center gap-2 mt-3 mb-3">
                <Switch
                  checked={isFixed}
                  handleChange={() => {
                    setIsFixed(!isFixed);
                  }}
                />
                <span className="flex items-center gap-1">
                  Fixed rate
                  <Tooltip text="Tooltip text" />
                </span>
              </div>
              <div className="mb-3 ">
                <TextField label="The recepient's Ethereum wallet address" placeholder="0x..." />
              </div>

              <Button fullWidth>Create an exchange</Button>
            </div>
          </Tab>
          <Tab title="Buy/Sell Crypto">Buy/sell crypto</Tab>
        </Tabs>
      </div>
      <PickTokenDialog isOpen={isOpen} setIsOpen={setIsOpen} handlePick={handleChange} />
    </Container>
  );
}
