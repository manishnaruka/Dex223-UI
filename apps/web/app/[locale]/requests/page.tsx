"use client";

import React from "react";

import DateTimePicker from "@/components/atoms/DateTimePicker";
import { predictWrapperAddress } from "@/components/manage-tokens/scripts/convertTokenList";
import { useUSDPrice } from "@/hooks/useUSDPrice";
import { CONVERTER_ADDRESS } from "@/sdk_bi/addresses";

export default function DebugRequestsPage() {
  const { price, isLoading, error } = useUSDPrice("0xc00592aa41d32d137dc480d9f6d0df19b860104f");

  console.log(
    "Predicted address:",
    predictWrapperAddress("0xdAC17F958D2ee523a2206206994597C13D831ec7", true, CONVERTER_ADDRESS[1]),
  );
  // const { data: blockNumber } = useBlockNumber({ watch: true });
  //
  // useEffect(() => {
  //   console.log(blockNumber);
  // }, [blockNumber]);

  // useWatchBlocks({
  //   onBlock(block) {
  //     console.log("New block", block.number);
  //   },
  // });
  // return (
  //   <div className="w-[400px] p-5 bg-quaternary-bg">
  //     <DateTimePicker />
  //   </div>
  // );

  if (error) return <div>{error.toString()}</div>;

  return <>{isLoading ? <div>Loading...</div> : <div>{price}</div>}</>;
}
