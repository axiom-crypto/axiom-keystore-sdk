import { Hex, bytesToHex } from "viem";

export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function generateRandomHex(length: number): Hex {
  return bytesToHex(generateRandomBytes(length));
}
