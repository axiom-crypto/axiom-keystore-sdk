import { Data, Hash, KeystoreAddress, L1Address } from "../primitives";
import { TransactionType } from "../transaction";
import { KeystoreAccountRpc } from "./account";
import { HexQuantity } from "./primitives";

export type TransactionOrHashRpc = Hash | L2TransactionRpc;

export type BaseTransactionRpc = {
  hash: Hash;
  transactionIndex: HexQuantity;
  blockHash: Hash;
  blockNumber: HexQuantity;
};

export type DepositTransactionRpc = BaseTransactionRpc & {
  l1InitiatedNonce: HexQuantity;
  amt: HexQuantity;
  keystoreAddress: KeystoreAddress;
};

export type WithdrawTransactionRpc = BaseTransactionRpc & {
  isL1Initiated: boolean;
  nonce: HexQuantity;
  feePerGas: Data;
  l1InitiatedNonce: Data;
  to: L1Address;
  amt: HexQuantity;
  userAcct: KeystoreAccountRpc;
  userProof: Data;
};

export type UpdateTransactionRpc = BaseTransactionRpc & {
  isL1Initiated: boolean;
  nonce: HexQuantity;
  feePerGas: Data;
  l1InitiatedNonce: Data;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccountRpc;
  userProof: Data;
  sponsorAcctBytes: Data;
  sponsorProof: Data;
};

export type L2TransactionRpc =
  | ({ type: TransactionType.Deposit } & DepositTransactionRpc)
  | ({ type: TransactionType.Withdraw } & WithdrawTransactionRpc)
  | ({ type: TransactionType.Update } & UpdateTransactionRpc);
