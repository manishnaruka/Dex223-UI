import { BigintIsh, Rounding } from "../../constants";
import { Fraction } from "./fraction";

const ONE_HUNDRED = new Fraction(BigInt(100));

/**
 * Converts a fraction to a percent
 * @param fraction the fraction to convert
 */
function toPercent(fraction: Fraction): Percent {
  return new Percent(fraction.numerator, fraction.denominator);
}

export class Percent extends Fraction {
  /**
   * This boolean prevents a fraction from being interpreted as a Percent
   */
  public readonly isPercent: true = true;

  // Ensure that methods return Percent instead of Fraction
  add(other: Fraction | BigintIsh): Percent {
    return toPercent(super.add(other));
  }

  subtract(other: Fraction | BigintIsh): Percent {
    return toPercent(super.subtract(other));
  }

  multiply(other: Fraction | BigintIsh): Percent {
    return toPercent(super.multiply(other));
  }

  divide(other: Fraction | BigintIsh): Percent {
    return toPercent(super.divide(other));
  }

  public toSignificant(
    significantDigits: number = 5,
    format?: object,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ): string {
    // Fixing method signature compatibility
    return super.multiply(ONE_HUNDRED).toSignificant(significantDigits, format, rounding);
  }

  public toFixed(decimalPlaces: number = 2, rounding: Rounding = Rounding.ROUND_DOWN): string {
    return super.multiply(ONE_HUNDRED).toFixed(decimalPlaces, rounding);
  }
}
