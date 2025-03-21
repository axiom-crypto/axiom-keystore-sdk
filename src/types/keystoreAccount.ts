import { AccountState, BlockTagOrNumber, Bytes32, Data, Hash, KeystoreAddress } from "@/types";

export interface KeystoreAccount extends KeystoreAccountData, KeystoreAccountActions {}

export interface KeystoreAccountData {
  address: KeystoreAddress;
  salt: Bytes32;
  dataHash: Hash;
  vkey: Data;
}

export interface KeystoreAccountActions {
  rlpEncode: () => Data;
  getNonce: (params?: { block?: BlockTagOrNumber }) => Promise<bigint>;
  getBalance: (params?: { block?: BlockTagOrNumber }) => Promise<bigint>;
  getState: (params?: { block?: BlockTagOrNumber }) => Promise<AccountState>;
}
