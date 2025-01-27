import { keccak_256 } from "@noble/hashes/sha3";

/// @dev Keccak256 hash of a string
/// @param data The string to hash
/// @returns The keccak256 hash as a hex string
export const keccak256 = (data: string): string => {
  return Buffer.from(keccak_256(data)).toString('hex');
}