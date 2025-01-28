import { Byte, Hash, KeystoreAddress, Quantity } from "./primitives";
import { TransactionOrHash } from "./transaction";

/**
 * Enum representing various block tags.
 */
export enum BlockTag {
  Latest = "latest",
  Committed = "committed",
  Finalized = "finalized",
  Earliest = "earliest",
}

/**
 * A union type to represent either a known block tag or a block number.
 */
export type BlockTagOrNumber = BlockTag | Quantity;

/**
 * L1 block reference (hash, number, parentHash, timestamp).
 */
export interface L1BlockRef {
  hash: Hash;
  number: Quantity;
  parentHash: Hash;
  timestamp: Quantity;
}

/**
 * L2 block reference, containing additional fields like
 * sequencerKeystoreAddress, etc.
 */
export interface L2BlockRef {
  hash: Hash;
  number: Quantity;
  parentHash: Hash;
  timestamp: Quantity;
  sequencerKeystoreAddress: KeystoreAddress;
  stateRoot: Hash;
  withdrawalsRoot: Hash;
  transactionsRoot: Hash;
  l1Origin?: Quantity;
  source?: Byte;
  transactions?: TransactionOrHash[];
}