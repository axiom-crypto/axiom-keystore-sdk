import {
  AccountState,
  BlockTagOrNumber,
  Bytes32,
  Data,
  Hash,
  KeystoreAddress,
  NodeClient,
} from "@/types";
import {
  KeystoreAccount,
  KeystoreAccountActions,
  KeystoreAccountData,
} from "@/types/keystoreAccount";
import { bytesToHex, concat, hexToBytes, keccak256, pad } from "viem";
import { RLP } from "@ethereumjs/rlp";

export function initAccountCounterfactual({
  salt,
  dataHash,
  vkey,
  nodeClient,
}: {
  salt: Bytes32;
  dataHash: Hash;
  vkey: Data;
  nodeClient?: NodeClient;
}): KeystoreAccount {
  const paddedSalt = pad(salt, { size: 32 });
  const paddedDataHash = pad(dataHash, { size: 32 });
  const vkeyHash = keccak256(vkey);
  const keystoreAddress = keccak256(concat([paddedSalt, paddedDataHash, vkeyHash]));
  return initAccount({
    address: keystoreAddress,
    salt: paddedSalt,
    dataHash: paddedDataHash,
    vkey,
    nodeClient,
  });
}

export function initAccountFromAddress({
  address,
  dataHash,
  vkey,
  nodeClient,
}: {
  address: KeystoreAddress;
  dataHash: Hash;
  vkey: Data;
  nodeClient?: NodeClient;
}): KeystoreAccount {
  const paddedSalt = pad("0x00", { size: 32 });
  return initAccount({
    address,
    salt: paddedSalt,
    dataHash,
    vkey,
    nodeClient,
  });
}

export function initAccount({
  address,
  salt,
  dataHash,
  vkey,
  nodeClient,
}: {
  address: KeystoreAddress;
  salt: Bytes32;
  dataHash: Hash;
  vkey: Data;
  nodeClient?: NodeClient;
}): KeystoreAccount {
  const accountData: KeystoreAccountData = {
    address,
    salt,
    dataHash,
    vkey,
  };
  const accountActions = keystoreAccountActions({
    address,
    salt,
    dataHash,
    vkey,
    nodeClient,
  });
  return {
    ...accountData,
    ...accountActions,
  };
}

export function initFromRlpEncoded({
  rlpEncoded,
  nodeClient,
}: {
  rlpEncoded: Data;
  nodeClient?: NodeClient;
}): KeystoreAccount {
  const rlpDecoded = RLP.decode(hexToBytes(rlpEncoded));
  const address = bytesToHex(rlpDecoded[0] as Uint8Array);
  const salt = bytesToHex(rlpDecoded[1] as Uint8Array);
  const dataHash = bytesToHex(rlpDecoded[2] as Uint8Array);
  const vkey = bytesToHex(rlpDecoded[3] as Uint8Array);
  const accountData: KeystoreAccountData = {
    address,
    salt,
    dataHash,
    vkey,
  };
  const accountActions = keystoreAccountActions({ address, salt, dataHash, vkey, nodeClient });
  return {
    ...accountData,
    ...accountActions,
  };
}

function keystoreAccountActions({
  address,
  salt,
  dataHash,
  vkey,
  nodeClient,
}: {
  address: KeystoreAddress;
  salt: Bytes32;
  dataHash: Hash;
  vkey: Data;
  nodeClient?: NodeClient;
}): KeystoreAccountActions {
  return {
    rlpEncode: (): Data => {
      return bytesToHex(RLP.encode([address, salt, dataHash, vkey]));
    },
    getNonce: async ({ block }: { block?: BlockTagOrNumber } = {}): Promise<bigint> => {
      if (!nodeClient) {
        throw new Error("A NodeClient is required for `getNonce`");
      }
      return await nodeClient.getTransactionCount({ address, block });
    },
    getBalance: async ({ block }: { block?: BlockTagOrNumber } = {}): Promise<bigint> => {
      if (!nodeClient) {
        throw new Error("A NodeClient is required for `getBalance`");
      }
      return await nodeClient.getBalance({ address, block });
    },
    getState: async ({ block }: { block?: BlockTagOrNumber } = {}): Promise<AccountState> => {
      if (!nodeClient) {
        throw new Error("A NodeClient is required for `getState`");
      }
      return await nodeClient.getStateAt({ address, block });
    },
  };
}
