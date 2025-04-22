import { Data } from "./primitives";
import { TransactionType } from "./transaction";

export type L1InitiatedTransactionSol = {
  txType: TransactionType;
  data: Data;
};
