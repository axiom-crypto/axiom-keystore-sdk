import { Quantity } from "../primitives";
import {
  AccountStateTransitionsRpc,
  StateTransitionsRpc,
  TransitionsRpc,
} from "../rpc";
import { HexQuantity } from "../rpc/primitives";
import {
  AccountStateTransitions,
  FromTo,
  StateTransitions,
  Transitions,
} from "../state";

function formatFromTo(rpcObj: FromTo<HexQuantity>): FromTo<Quantity> {
  return {
    from: BigInt(rpcObj.from),
    to: BigInt(rpcObj.to),
  };
}

export function formatTransitions(rpcObj: TransitionsRpc): Transitions {
  return {
    nonce: rpcObj.nonce ? formatFromTo(rpcObj.nonce) : undefined,
    balance: rpcObj.balance ? formatFromTo(rpcObj.balance) : undefined,
    state: rpcObj.state,
  };
}

export function formatAccountStateTransitions(
  rpcObj: AccountStateTransitionsRpc,
): AccountStateTransitions {
  return {
    keystoreAddress: rpcObj.keystoreAddress,
    transitions: formatTransitions(rpcObj.transitions),
  };
}

export function formatStateTransitions(
  rpcObj: StateTransitionsRpc,
): StateTransitions {
  return {
    user: formatAccountStateTransitions(rpcObj.user),
    sponsor: rpcObj.sponsor
      ? formatAccountStateTransitions(rpcObj.sponsor)
      : undefined,
  };
}
