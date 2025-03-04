import { KeystoreAccount } from "./keystoreAccount";
import { Data } from "./primitives";

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
