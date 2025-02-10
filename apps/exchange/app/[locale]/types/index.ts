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
