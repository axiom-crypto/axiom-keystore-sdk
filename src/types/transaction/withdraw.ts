import { KeystoreAccount } from "../keystoreAccount";
import { L1Address, Data, Quantity } from "../primitives";
import { BaseTransaction } from "./base";

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
