import { concat, keccak256, pad } from "viem";
import { Bytes32, Data, Hash, KeystoreAddress } from "./primitives";
import { KeystoreAccount } from "./transaction";

export type UpdateTransactionRequest = {
  nonce: bigint;
  feePerGas: bigint;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccount;
  sponsorAcct?: KeystoreAccount;
};

export type L2TransactionRequest = UpdateTransactionRequest;
