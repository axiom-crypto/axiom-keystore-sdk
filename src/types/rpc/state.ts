import { KeystoreAddress } from "../primitives";
import { AccountState, FromTo } from "../state";
import { HexQuantity } from "./primitives";

export type TransitionsRpc = {
  nonce?: FromTo<HexQuantity>;
  balance?: FromTo<HexQuantity>;
  state?: FromTo<AccountState>;
};

export type AccountStateTransitionsRpc = {
  keystoreAddress: KeystoreAddress;
  transitions: TransitionsRpc;
};

export type StateTransitionsRpc = {
  user: AccountStateTransitionsRpc;
  sponsor?: AccountStateTransitionsRpc;
};

/**
 * RPC version of WithdrawalTo with hex quantity for amount.
 */
export type WithdrawalToRpc = {
  address: string;
  amount: HexQuantity;
};

/**
 * RPC version of WithdrawalTransition.
 */
export type WithdrawalTransitionRpc = {
  hash: string;
  from: null;
  to: WithdrawalToRpc;
};
