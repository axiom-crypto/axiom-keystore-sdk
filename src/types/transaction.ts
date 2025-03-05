import { Data, Hash, KeystoreAddress, L1Address, Quantity } from "./primitives";
import { KeystoreAccount } from "./keystoreAccount";

/**
 * Enum representing either a transaction hash (string) or a fully populated
 * L2Transaction object.
 *
 * In Rust, this was an untagged enum. Here, if something is just a string,
 * we treat it as the transaction hash; otherwise it's an L2Transaction object.
 */
export type TransactionOrHash = Hash | L2Transaction;

// /**
//  * Represents the state of a keystore account.
//  */
// export type KeystoreAccount = {
//   keystoreAddress: KeystoreAddress;
//   salt: Bytes32;
//   dataHash: Hash;
//   vkey: Data;
// };

/**
 * Base transaction properties shared by all L2 transaction variants.
 */
export type BaseTransaction = {
  hash: Hash;
  transactionIndex: Quantity;
  blockHash: Hash;
  blockNumber: Quantity;
};

/**
 * A deposit transaction (type = "0x00").
 */
export type DepositTransaction = BaseTransaction & {
  l1InitiatedNonce: Quantity;
  amt: Quantity;
  keystoreAddress: KeystoreAddress;
};

/**
 * A withdraw transaction (type = "0x01").
 */
export type WithdrawTransaction = BaseTransaction & {
  isL1Initiated: boolean;
  nonce: Quantity;
  /**
   * If the transaction is L1 initiated, this will be undefined.
   */
  feePerGas: Quantity | undefined;
  /**
   * If the transaction is NOT L1 initiated, this will be undefined.
   */
  l1InitiatedNonce: Quantity | undefined;
  to: L1Address;
  amt: Quantity;
  userAcct: KeystoreAccount;
  userProof: Data;
};

/**
 * An update transaction (type = "0x02").
 */
export type UpdateTransaction = BaseTransaction & {
  isL1Initiated: boolean;
  nonce: Quantity;
  /**
   * If the transaction is L1 initiated, this will be undefined.
   */
  feePerGas: Quantity | undefined;
  /**
   * If the transaction is NOT L1 initiated, this will be undefined.
   */
  l1InitiatedNonce: Quantity | undefined;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccount;
  userProof: Data;
  /**
   * If the transaction is NOT sponsored, this will be undefined.
   */
  sponsorAcct: KeystoreAccount | undefined;
  /**
   * If the transaction is NOT sponsored, this will be undefined.
   */
  sponsorProof: Data | undefined;
};

export enum TransactionType {
  Deposit = "0x00",
  Withdraw = "0x01",
  Update = "0x02",
}

/**
 * An enum capturing all possible L2 transaction types.
 * Uses the "type" field for discrimination (0x00, 0x01, 0x02).
 */
export type L2Transaction =
  | ({ type: TransactionType.Deposit } & DepositTransaction)
  | ({ type: TransactionType.Withdraw } & WithdrawTransaction)
  | ({ type: TransactionType.Update } & UpdateTransaction);

/**
 * The transaction status enum from the schema (receipt "status").
 */
export enum TransactionStatus {
  L2Pending = "L2Pending",
  L2IncludedL1Pending = "L2Included_L1Pending",
  L2IncludedL1Included = "L2Included_L1Included",
  L2FinalizedL1Included = "L2Finalized_L1Included",
  L2FinalizedL1Finalized = "L2Finalized_L1Finalized",
  Failed = "Failed",
}
