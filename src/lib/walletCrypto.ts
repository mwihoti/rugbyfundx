// Encrypt and decrypt wallet seed phrases using AES-GCM + PBKDF2.
// Runs entirely in the browser via the Web Crypto API — no server involved.

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf instanceof ArrayBuffer ? buf : buf.buffer)));
}

function fromBase64(str: string): Uint8Array {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array, usage: KeyUsage): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    [usage]
  );
}

export interface WalletBackup {
  version: number;
  app: string;
  createdAt: string;
  salt: string;   // base64
  iv: string;     // base64
  ciphertext: string; // base64
}

export async function encryptSeedPhrase(words: string[], password: string): Promise<WalletBackup> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, "encrypt");

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(words.join(" "))
  );

  return {
    version: 1,
    app: "RugbyFundX",
    createdAt: new Date().toISOString(),
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
  };
}

export async function decryptSeedPhrase(backup: WalletBackup, password: string): Promise<string[]> {
  const dec = new TextDecoder();
  const salt = fromBase64(backup.salt);
  const iv = fromBase64(backup.iv);
  const ciphertext = fromBase64(backup.ciphertext);
  const key = await deriveKey(password, salt, "decrypt");

  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return dec.decode(plaintext).split(" ");
}

export function downloadBackupFile(backup: WalletBackup, address: string) {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const shortAddr = address.slice(-8);
  a.href = url;
  a.download = `rfx-wallet-${shortAddr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
