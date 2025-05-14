import { Address } from "viem";
import { Bytes32, Data, Hash, Quantity } from "./primitives";

export type OutputRootPreimage = {
  stateRoot: Hash;
  withdrawalsRoot: Hash;
  lastValidBlockhash: Hash;
};

export type WithdrawalArgs = {
  imtKey: Bytes32;
  nextDummyByte: Data;
  nextImtKey: Bytes32;
  withdrawalAmount: Quantity;
  to: Address;
};

export type FinalizeWithdrawalArgs = {
  batchIndex: Quantity;
  outputRootPreimage: OutputRootPreimage;
  withdrawalArgs: WithdrawalArgs;
  proof: Bytes32[];
  isLeft: Quantity;
};
