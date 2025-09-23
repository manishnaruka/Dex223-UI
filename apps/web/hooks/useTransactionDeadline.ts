import useDeepMemo from "@/hooks/useDeepMemo";
import { useGlobalFees } from "@/shared/hooks/useGlobalFees";

export default function useTransactionDeadline(userDeadline: number): bigint {
  const ttl = userDeadline * 60;

  const { timestamp } = useGlobalFees();

  return useDeepMemo(() => {
    if (timestamp) {
      return timestamp + BigInt(ttl);
    }

    return BigInt(0);
  }, [timestamp, ttl]);
}
