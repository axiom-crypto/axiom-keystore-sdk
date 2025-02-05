import {
  BaseTransaction,
  DepositTransaction,
  L2Transaction,
  TransactionOrHash,
  TransactionType,
  UpdateTransaction,
  WithdrawTransaction,
} from "../transaction";
import {
  BaseTransactionRpc,
  DepositTransactionRpc,
  L2TransactionRpc,
  TransactionOrHashRpc,
  UpdateTransactionRpc,
  WithdrawTransactionRpc,
} from "../rpc/transaction";
import { KeystoreAccountBuilder } from "../../account";

export function formatTransactionOrHash(
  rpcObj: TransactionOrHashRpc,
): TransactionOrHash {
  if (typeof rpcObj === "string") {
    return rpcObj;
  }
  return formatL2Transaction(rpcObj);
}

function formatBaseTransaction(rpcObj: BaseTransactionRpc): BaseTransaction {
  return {
    hash: rpcObj.hash,
    transactionIndex: BigInt(rpcObj.transactionIndex),
    blockHash: rpcObj.blockHash,
    blockNumber: BigInt(rpcObj.blockNumber),
  };
}

export function formatDepositTransaction(
  rpcObj: DepositTransactionRpc,
): DepositTransaction {
  return {
    ...formatBaseTransaction(rpcObj),
    l1InitiatedNonce: BigInt(rpcObj.l1InitiatedNonce),
    amt: BigInt(rpcObj.amt),
    keystoreAddress: rpcObj.keystoreAddress,
  };
}

export function formatWithdrawTransaction(
  rpcObj: WithdrawTransactionRpc,
): WithdrawTransaction {
  return {
    ...formatBaseTransaction(rpcObj),
    isL1Initiated: rpcObj.isL1Initiated,
    nonce: BigInt(rpcObj.nonce),
    feePerGas: rpcObj.feePerGas == "0x" ? undefined : BigInt(rpcObj.feePerGas),
    l1InitiatedNonce:
      rpcObj.l1InitiatedNonce == "0x"
        ? undefined
        : BigInt(rpcObj.l1InitiatedNonce),
    to: rpcObj.to,
    amt: BigInt(rpcObj.amt),
    userAcct: rpcObj.userAcct,
    userProof: rpcObj.userProof,
  };
}

function formatUpdateTransaction(
  rpcObj: UpdateTransactionRpc,
): UpdateTransaction {
  return {
    ...formatBaseTransaction(rpcObj),
    isL1Initiated: rpcObj.isL1Initiated,
    nonce: BigInt(rpcObj.nonce),
    feePerGas: rpcObj.feePerGas == "0x" ? undefined : BigInt(rpcObj.feePerGas),
    l1InitiatedNonce:
      rpcObj.l1InitiatedNonce == "0x"
        ? undefined
        : BigInt(rpcObj.l1InitiatedNonce),
    newUserData: rpcObj.newUserData,
    newUserVkey: rpcObj.newUserVkey,
    userAcct: rpcObj.userAcct,
    userProof: rpcObj.userProof,
    sponsorAcct:
      rpcObj.sponsorAcctBytes == "0x"
        ? undefined
        : KeystoreAccountBuilder.rlpDecode(rpcObj.sponsorAcctBytes),
    sponsorProof: rpcObj.sponsorProof == "0x" ? undefined : rpcObj.sponsorProof,
  };
}

export function formatL2Transaction(rpcObj: L2TransactionRpc): L2Transaction {
  switch (rpcObj.type) {
    case TransactionType.Deposit:
      return {
        type: TransactionType.Deposit,
        ...formatDepositTransaction(rpcObj),
      };
    case TransactionType.Withdraw:
      return {
        type: TransactionType.Withdraw,
        ...formatWithdrawTransaction(rpcObj),
      };
    case TransactionType.Update:
      return {
        type: TransactionType.Update,
        ...formatUpdateTransaction(rpcObj),
      };
  }
}
