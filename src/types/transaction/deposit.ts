import { KeystoreAddress, Quantity } from "../primitives";
import { BaseTransaction, BaseTransactionAction } from "./base";

/**
 * A deposit transaction (type = "0x00").
 */
export type DepositTransaction = BaseTransaction & {
  l1InitiatedNonce: Quantity;
  amt: Quantity;
  keystoreAddress: KeystoreAddress;
};

export interface DepositTransactionInputs {
  l1InitiatedNonce?: bigint;
  amt: bigint;
  keystoreAddress: KeystoreAddress;
}

export interface DepositTransactionClient extends DepositTransactionInputs, BaseTransactionAction {}
