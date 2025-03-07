import { KeystoreAccount } from "../keystoreAccount";
import { Data, Quantity } from "../primitives";
import { BaseTransaction, BaseTransactionAction } from "./base";

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

export interface UpdateTransactionInputs {
  nonce?: bigint;
  feePerGas?: bigint;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccount;
  sponsorAcct?: KeystoreAccount;
  userProof?: Data;
  sponsorProof?: Data;
  l1InitiatedNonce?: bigint;
  isL1Initiated?: boolean;
  nodeClientUrl?: string;
  sequencerClientUrl?: string;
}

export interface UpdateTransactionClient extends UpdateTransactionInputs, BaseTransactionAction {}
