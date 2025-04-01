import invariant from "tiny-invariant";

import { MaxUint256 } from "../constants";
import { ZERO } from "../internalConstants";

const TWO = BigInt(2);
const POWERS_OF_2: [number, bigint][] = [128, 64, 32, 16, 8, 4, 2, 1].map((pow) => [
  pow,
  TWO ** BigInt(pow), // Exponentiation using native BigInt
]);

export function mostSignificantBit(x: bigint) {
  invariant(x > ZERO, "ZERO");
  invariant(x <= MaxUint256, "MAX");

  let msb = 0;
  for (const [power, min] of POWERS_OF_2) {
    if (x >= min) {
      x >>= BigInt(power); // Right shift using native BigInt
      msb += power;
    }
  }
  return msb;
}
