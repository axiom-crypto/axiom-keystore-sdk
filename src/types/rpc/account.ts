import { Bytes32, Data, Hash } from "../primitives";

export interface KeystoreAccountRpc {
  keystoreAddress: Bytes32;
  salt: Bytes32;
  dataHash: Hash;
  vkey: Data;
}
