import invariant from "tiny-invariant";

import { BigintIsh } from "@/sdk_bi/constants";
import { TickMath } from "@/sdk_bi/utils/tickMath";

export interface TickConstructorArgs {
  index: number;
  liquidityGross: BigintIsh;
  liquidityNet: BigintIsh;
}

export class Tick {
  public readonly index: number;
  public readonly liquidityGross: bigint;
  public readonly liquidityNet: bigint;

  constructor({ index, liquidityGross, liquidityNet }: TickConstructorArgs) {
    invariant(index >= TickMath.MIN_TICK && index <= TickMath.MAX_TICK, "TICK");
    this.index = index;
    // Convert the liquidity values from BigintIsh to BigInt
    this.liquidityGross = BigInt(liquidityGross); // Native BigInt
    this.liquidityNet = BigInt(liquidityNet); // Native BigInt
  }
}
