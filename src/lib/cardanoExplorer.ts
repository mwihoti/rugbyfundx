const NETWORK = process.env.NEXT_PUBLIC_NETWORK ?? "preprod";

export function getCardanoscanTxUrl(txHash: string): string {
  if (NETWORK === "mainnet") return `https://cardanoscan.io/transaction/${txHash}`;
  if (NETWORK === "preview") return `https://preview.cardanoscan.io/transaction/${txHash}`;
  return `https://preprod.cardanoscan.io/transaction/${txHash}`;
}

export function getCardanoscanBaseUrl(): string {
  if (NETWORK === "mainnet") return "https://cardanoscan.io";
  if (NETWORK === "preview") return "https://preview.cardanoscan.io";
  return "https://preprod.cardanoscan.io";
}

export function getNetworkLabel(): string {
  if (NETWORK === "mainnet") return "Mainnet";
  if (NETWORK === "preview") return "Preview Testnet";
  return "Preprod Testnet";
}
