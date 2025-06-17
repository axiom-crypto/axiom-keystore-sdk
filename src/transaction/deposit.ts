import {
  DepositTransactionRequestClient,
  DepositTransactionInputs,
  L1InitiatedTransactionSol,
  TransactionType,
} from "@/types";

export async function createDepositTransactionRequestClient(
  tx: DepositTransactionInputs,
): Promise<DepositTransactionRequestClient> {
  const amt = tx.amt;

  const keystoreAddress = tx.keystoreAddress;

  const l1InitiatedTransaction = (): L1InitiatedTransactionSol => {
    return {
      txType: TransactionType.Deposit,
      data: keystoreAddress,
    };
  };

  return {
    txType: TransactionType.Deposit,
    amt,
    keystoreAddress,
    l1InitiatedTransaction,
  };
}
