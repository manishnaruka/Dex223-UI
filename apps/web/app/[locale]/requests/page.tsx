"use client";

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
  if (error) return <div>{error.toString()}</div>;

  return <>{isLoading ? <div>Loading...</div> : <div>{price}</div>}</>;
}
