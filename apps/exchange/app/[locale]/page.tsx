"use client";

import Container from "@/components/atoms/Container";
import Switch from "@/components/atoms/Switch";
import TextField from "@/components/atoms/TextField";
import Tooltip from "@/components/atoms/Tooltip";
import Button from "@/components/buttons/Button";
import SwapButton from "@/components/buttons/SwapButton";
import TokenInput from "@/components/common/TokenInput";
import Tab from "@/components/tabs/Tab";
import Tabs from "@/components/tabs/Tabs";

export default function ExchangePage() {
  return (
    <Container className="px-4">
      <div className="mx-auto w-[600px]">
        <Tabs fullWidth>
          <Tab title="Exchange">
            <div className="mt-5 bg-primary-bg px-10 pb-10 rounded-5">
              <h1 className="py-3.5 text-20 font-bold">Crypto exchange</h1>
              <TokenInput
                handleClick={() => {}}
                token={null}
                value={""}
                onInputChange={() => {}}
                balance0={""}
                balance1={""}
                label="You send"
              />
              <div className="relative h-3 z-10">
                <SwapButton onClick={() => {}} />
              </div>
              <TokenInput
                handleClick={() => {}}
                token={null}
                value={""}
                onInputChange={() => {}}
                balance0={""}
                balance1={""}
                label="You send"
              />
              <div className="flex items-center gap-2 mt-3 mb-3">
                <Switch checked={true} handleChange={() => {}} />
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
    </Container>
  );
}
