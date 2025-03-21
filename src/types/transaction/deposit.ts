import { KeystoreAddress, Quantity } from "../primitives";
import { BaseTransaction } from "./base";

/**
 * A deposit transaction (type = "0x00").
 */
export type DepositTransaction = BaseTransaction & {
  l1InitiatedNonce: Quantity;
  amt: Quantity;
  keystoreAddress: KeystoreAddress;
};
