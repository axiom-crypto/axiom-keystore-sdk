import { initAccount } from "@/account";
import { KeystoreAccount } from "../keystoreAccount";
import { KeystoreAccountRpc } from "../rpc";

export function formatKeystoreAccount(rpcObj: KeystoreAccountRpc): KeystoreAccount {
  return initAccount({
    address: rpcObj.keystoreAddress,
    salt: rpcObj.salt,
    dataHash: rpcObj.dataHash,
    vkey: rpcObj.vkey,
  });
}
