export enum LendingOrderPeriodType {
  FIXED,
  PERPETUAL,
}

export enum PerpetualPeriodType {
  DAYS,
  SECONDS,
}

export type LendingOrderPeriod = {
  type: LendingOrderPeriodType;
  lendingOrderDeadline: string;
  positionDuration: string;
  borrowingPeriod: {
    type: PerpetualPeriodType;
    borrowingPeriodInDays: string;
    borrowingPeriodInSeconds: string;
  };
};
