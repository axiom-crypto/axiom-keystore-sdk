import { Data } from "./primitives";
import { KeystoreAccount } from "./transaction";

export interface UpdateTransactionRequest {
  nonce: bigint;
  feePerGas: bigint;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccount;
  sponsorAcct?: KeystoreAccount;
};

export type L2TransactionRequest = UpdateTransactionRequest;

export type AuthenticatedUpdateTransactionRequest = UpdateTransactionRequest & {
  userProof: Data;
  sponsorProof?: Data;
};
