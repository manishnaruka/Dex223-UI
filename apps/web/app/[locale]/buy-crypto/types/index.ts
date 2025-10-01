export interface ExchangeToken {
  symbol: string;
  name: string;
  image: string;
  network: string;
  has_extra_id: boolean;
  extra_id_name: string;
  validation_address: string;
  validation_extra_id: string;
  addressRegex: string;
  memoRegex: string;
  color: string;
  tx_explorer: string;
  address_explorer: string;
  sample_address: string;
  sample_extra_id: string;
  warnings_from: string[];
  warnings_to: string[];
  is_popular: boolean;
  is_available: boolean;
  is_stable: boolean;
  is_fiat: boolean;
  confirmations: string;
}

export enum ExchangeStatus {
  WAITING = "waiting",
  CONFIRMING = "confirming",
  EXCHANGING = "exchanging",
  SENDING = "sending",
  FINISHED = "finished",
  FAILED = "failed",
  REFUNDED = "refunded",
  VERIFYING = "verifying",
  EXPIRED = "expired",
}

export type TrackedExchangeStatus =
  | ExchangeStatus.WAITING
  | ExchangeStatus.CONFIRMING
  | ExchangeStatus.EXCHANGING
  | ExchangeStatus.SENDING;

export interface ExchangeData {
  id: string;
  type: string;
  timestamp: string;
  updated_at: string;
  currency_from: string;
  currency_to: string;
  amount_from: string;
  expected_amount: string;
  amount_to: string;
  address_from: string;
  address_to: string;
  extra_id_from: string;
  extra_id_to: string;
  tx_from: string;
  tx_to: string;
  status: ExchangeStatus;
  currencies: Record<string, ExchangeToken>;
  redirect_url?: string;
  valid_until?: string;
}