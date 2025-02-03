import { Byte, Hash, KeystoreAddress, Data, Quantity } from "./primitives";

/**
 * An Individual Merkle Tree sibling proof element.
 */
export type ImtSibling = {
  hash: Hash;
  isLeft: boolean;
}

/**
 * The leaf object of an IMT proof.
 */
export type ImtLeaf = {
  hash: Hash;
  keyPrefix: Byte;
  key: Hash;
  nextKeyPrefix: Byte;
  nextKey: Hash;
  value: Data;
}

/**
 * Represents an IMT proof, either an inclusion or exclusion proof.
 */
export type ImtProof = {
  isExclusionProof: boolean;
  siblings: ImtSibling[];
  leaf: ImtLeaf;
}

/**
 * Represents the state of an account (data and vkey).
 */
export type AccountState = {
  dataHash: Hash,
  vkeyHash: Hash,
  data: Data;
  vkey: Data;
}

/**
 * A helper for "from" => "to" transitions of a particular type.
 */
export type FromTo<T> = {
  from: T;
  to: T;
}

/**
 * The sub-structure holding transitions for nonce, balance, and state.
 */
export type Transitions = {
  nonce?: FromTo<Quantity>;
  balance?: FromTo<Quantity>;
  state?: FromTo<AccountState>;
}

/**
 * Describes the "from" => "to" transitions of nonce, balance, state, etc.
 */
export type AccountStateTransitions = {
  keystoreAddress: KeystoreAddress;
  transitions: Transitions;
}

/**
 * Aggregates user and optional sponsor state transitions in a transaction
 * simulation.
 */
export type StateTransitions = {
  user: AccountStateTransitions;
  sponsor?: AccountStateTransitions;
}