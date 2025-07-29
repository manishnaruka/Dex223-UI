import { formatFloat } from "@/functions/formatFloat";

export function calculatePeriodInterestRate(
  monthlyRateX100: number, // e.g. 2500 = 25.00%
  durationInSeconds: number, // position duration in seconds
): string {
  const SECONDS_IN_MONTH = 30 * 24 * 60 * 60; // 2592000

  // Use bigint to prevent floating point errors in division

  // Formula: monthlyRateX100 * (durationInSeconds / secondsInMonth)
  const result = (monthlyRateX100 * durationInSeconds) / 100 / SECONDS_IN_MONTH;

  return formatFloat(result, { trimZero: true }) + "%"; // still x100 format
}

export function calculatePeriodInterestRateNum(
  monthlyRateX100: number, // e.g. 2500 = 25.00%
  durationInSeconds: number, // position duration in seconds
): number {
  const SECONDS_IN_MONTH = 30 * 24 * 60 * 60; // 2592000

  // Use bigint to prevent floating point errors in division

  // Formula: monthlyRateX100 * (durationInSeconds / secondsInMonth)
  return (monthlyRateX100 * durationInSeconds) / 100 / SECONDS_IN_MONTH;
}
