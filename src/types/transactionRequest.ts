import { Data } from "./primitives";
import { KeystoreAccount } from "./transaction";

export interface UpdateTransactionRequest {
  nonce: bigint;
  feePerGas: bigint;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccount;
  userProof: Data;
  sponsorAcctBytes?: KeystoreAccount;
  sponsorProof?: Data;
};

export type L2TransactionRequest = UpdateTransactionRequest;