import { Byte, Hash, KeystoreAddress, Quantity, Data } from "./primitives";

/**
 * An Individual Merkle Tree sibling proof element.
 */
export interface ImtSibling {
  hash: Hash;
  isLeft: boolean;
}

/**
 * The leaf object of an IMT proof.
 */
export interface ImtLeaf {
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
export interface ImtProof {
  isExclusionProof: boolean;
  siblings: ImtSibling[];
  leaf: ImtLeaf;
}

/**
 * Represents the state of an account (data and vkey).
 */
export interface AccountState {
  dataHash: Hash,
  vkeyHash: Hash,
  data: Data;
  vkey: Data;
}

/**
 * A helper for "from" => "to" transitions of a particular type.
 */
export interface FromTo<T> {
  from: T;
  to: T;
}

/**
 * The sub-structure holding transitions for nonce, balance, and state.
 */
export interface Transitions {
  nonce?: FromTo<Quantity>;
  balance?: FromTo<Quantity>;
  state?: FromTo<AccountState>;
}

/**
 * Describes the "from" => "to" transitions of nonce, balance, state, etc.
 */
export interface AccountStateTransitions {
  keystoreAddress: KeystoreAddress;
  transitions: Transitions;
}

/**
 * Aggregates user and optional sponsor state transitions in a transaction
 * simulation.
 */
export interface StateTransitions {
  user: AccountStateTransitions;
  sponsor?: AccountStateTransitions;
}