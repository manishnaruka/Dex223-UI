import { ONE, ZERO } from "../internalConstants";

export abstract class FullMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static mulDivRoundingUp(a: bigint, b: bigint, denominator: bigint): bigint {
    const product = a * b; // Use native BigInt multiplication
    let result = product / denominator; // Use native BigInt division
    if (product % denominator !== ZERO) result = result + ONE; // Check remainder and adjust result if necessary
    return result;
  }
}
