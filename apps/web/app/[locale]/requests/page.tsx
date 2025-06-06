"use client";

import React from "react";

import DateTimePicker from "@/components/atoms/DateTimePicker";
import { useUSDPrice } from "@/hooks/useUSDPrice";

export default function DebugRequestsPage() {
  const { price, isLoading, error } = useUSDPrice("0xc00592aa41d32d137dc480d9f6d0df19b860104f");

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
  return (
    <div className="w-[400px] p-5 bg-quaternary-bg">
      <DateTimePicker />
    </div>
  );

  if (error) return <div>{error.toString()}</div>;

  return <>{isLoading ? <div>Loading...</div> : <div>{price}</div>}</>;
}
