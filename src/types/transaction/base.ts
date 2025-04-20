import { DepositTransaction, WithdrawTransaction, UpdateTransaction } from "./";
import { Bytes32, Data, Hash, Quantity } from "../primitives";
import { HashTypedDataParameters } from "viem";

/**
 * Enum representing either a transaction hash (string) or a fully populated
 * L2Transaction object.
 *
 * In Rust, this was an untagged enum. Here, if something is just a string,
 * we treat it as the transaction hash; otherwise it's an L2Transaction object.
 */
export type TransactionOrHash = Hash | L2Transaction;

/**
 * Base transaction properties shared by all L2 transaction variants.
 */
export type BaseTransaction = {
  hash: Hash;
  transactionIndex: Quantity;
  blockHash: Hash;
  blockNumber: Quantity;
};

export interface BaseTransactionAction {
  toBytes: () => Data;
  txHash: () => Hash;
}

export interface SignableTransactionAction {
  toTypedData: () => HashTypedDataParameters;
  userMsgHash: () => Hash;
  sign: (pk: Bytes32) => Promise<Data>;
}

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
