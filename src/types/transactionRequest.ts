import { concat, keccak256, pad } from "viem";
import { Bytes32, Data, Hash, KeystoreAddress } from "./primitives";
import { KeystoreAccount } from "./transaction";

export type UpdateTransactionRequest = {
  nonce: bigint;
  feePerGas: bigint;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccount;
  sponsorAcct?: KeystoreAccount;
};

export type L2TransactionRequest = UpdateTransactionRequest;

export class KeystoreAccountBuilder {
  public static withSalt(salt: Bytes32, dataHash: Hash, vkey: Data): KeystoreAccount {
    const vkeyHash = keccak256(vkey);
    const keystoreAddress = keccak256(concat([salt, dataHash, vkeyHash]));
    const acct: KeystoreAccount = {
      keystoreAddress,
      salt,
      dataHash,
      vkey,
    };
    return acct;
  }

  public static withKeystoreAddress(keystoreAddress: KeystoreAddress, dataHash: Hash, vkey: Data): KeystoreAccount {
    const salt = pad("0x", { size: 32 });
    const acct: KeystoreAccount = {
      keystoreAddress,
      salt,
      dataHash,
      vkey,
    };
    return acct;
  }
}
