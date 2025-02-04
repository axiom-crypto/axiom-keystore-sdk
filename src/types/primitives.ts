import { Hex } from "viem";

/**
 * Represents "0x"-prefixed hexadecimal data of arbitrary length.
 */
export type Data = Hex;

/**
 * Represents "0x"-prefixed 20-byte Ethereum addresses.
 */
export type L1Address = Hex;

/**
 * Represents "0x"-prefixed 32-byte keystore addresses.
 */
export type KeystoreAddress = Hex;

/**
 * Represents "0x"-prefixed 32-byte hashes.
 */
export type Hash = Hex;

/**
 * Represents "0x"-prefixed single-byte values.
 */
export type Byte = Hex;

export type Quantity = bigint;

/**
 * Represents "0x"-prefixed 32-byte strings.
 */
export type Bytes32 = Hex;
