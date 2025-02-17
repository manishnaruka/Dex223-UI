export interface ExchangeToken {
  name: string; // The name of the currency
  symbol: string; // Currency symbol
  network: string; // Network name (empty if not applicable)
  has_extra_id: boolean; // Indicates if an extra ID (e.g., memo/tag) is required
  extra_id: string; // Extra ID (if applicable)
  image: string; // URL for the currency logo
  warnings_from: string[]; // Warnings related to sending from this currency
  warnings_to: string[]; // Warnings related to sending to this currency
  validation_address: string | null; // Address validation pattern (if applicable)
  validation_extra: string | null; // Extra ID validation pattern (if applicable)
  address_explorer: string | null; // URL to explore the deposit address on the blockchain
  tx_explorer: string | null; // URL to explore the transaction on the blockchain
  confirmations_from: string; // Minimum confirmations required (if applicable)
  contract_address: string | null; // Contract address (for tokens on networks like Ethereum)
  isFiat: boolean; // Indicates if the currency is fiat
}

export interface CurrencyDetails {
  name: string;
  symbol: string;
  network: string;
  has_extra_id: boolean;
  extra_id: string;
  image: string;
  warnings_from: string[];
  warnings_to: string[];
  validation_address: string | null;
  validation_extra: string | null;
  address_explorer: string | null;
  tx_explorer: string | null;
  confirmations_from: string;
  contract_address: string | null;
  isFiat: boolean;
}

export enum ExchangeStatus {
  WAITING = "waiting",
  CONFIRMING = "confirming",
  EXCHANGING = "exchanging",
  SENDING = "sending",
  FINISHED = "finished",
  FAILED = "failed",
  EXPIRED = "expired",
  VERIFYING = "verifying",
  REFUNDED = "refunded",
}

export type TrackedExchangeStatus =
  | ExchangeStatus.WAITING
  | ExchangeStatus.SENDING
  | ExchangeStatus.CONFIRMING
  | ExchangeStatus.EXCHANGING;

export interface Currencies {
  [key: string]: CurrencyDetails;
}

export interface ExchangeData {
  id: string;
  type: string; // e.g., "floating"
  timestamp: string; // ISO date string
  updated_at: string; // ISO date string
  valid_until: string | null; // ISO date string or null
  currency_from: string; // Token symbol, e.g., "btc"
  currency_to: string; // Token symbol, e.g., "eth"
  amount_from: string; // Amount being exchanged
  expected_amount: string; // Expected amount after exchange
  amount_to: string; // Amount to receive
  address_from: string; // Deposit address
  address_to: string; // Recipient address
  extra_id_from: string | null;
  extra_id_to: string | null;
  user_refund_address: string | null;
  user_refund_extra_id: string | null;
  tx_from: string | null; // Transaction hash for input transaction
  tx_to: string | null; // Transaction hash for output transaction
  status: ExchangeStatus; // Exchange status, e.g., "waiting"
  redirect_url: string | null; // Optional URL to redirect after exchange completion
  currencies: Currencies; // Map of currencies involved in the exchange
  trace_id: string; // Unique trace identifier for debugging
}
