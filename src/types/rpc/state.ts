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
