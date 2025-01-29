import { Data } from "./primitives";
import { KeystoreAccount } from "./transaction";

/**
 * The transaction request object for an update transaction.
 */
export type UpdateTransactionRequest = {
  nonce: bigint;
  feePerGas: bigint;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccount;
  sponsorAcct?: KeystoreAccount;
};

export type L2TransactionRequest = UpdateTransactionRequest;
