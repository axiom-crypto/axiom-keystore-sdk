import { initAccount } from "@/account";
import { Bytes32, Data, Hash, TransactionType } from "@/types";
import { DOMAIN, UPDATE_TYPES } from "@/types/eip712";
import { KeystoreAccount } from "@/types/keystoreAccount";
import { ecdsaSign } from "@/utils/ecdsa";
import { RLP } from "@ethereumjs/rlp";
import { boolToHex, bytesToHex, encodePacked, hashTypedData, keccak256, numberToHex } from "viem";

export interface BaseTransactionAction {
  toBytes: () => Data;
  txHash: () => Hash;
  userMsgHash: () => Hash;
  sign: (pk: Bytes32) => Promise<Data>;
}

export interface UpdateTransactionData {
  nonce: bigint;
  feePerGas?: bigint;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccount;
  sponsorAcct?: KeystoreAccount;
  userProof?: Data;
  sponsorProof?: Data;
  l1InitiatedNonce?: bigint;
  isL1Initiated?: boolean;
}

export interface UpdateTransactionClient extends UpdateTransactionData, BaseTransactionAction {}

export function createUpdateTransactionClient(tx: UpdateTransactionData): UpdateTransactionClient {
  const isL1Initiated = boolToHex(false, { size: 1 });
  const l1InitiatedNonce = tx.l1InitiatedNonce ?? "0x";
  const feePerGas = numberToHex(tx.feePerGas ?? 0n);
  const userAcct = initAccount({
    address: tx.userAcct.address,
    salt: tx.userAcct.salt,
    dataHash: tx.userAcct.dataHash,
    vkey: tx.userAcct.vkey,
  });
  const sponsorAcctBytes = tx.sponsorAcct
    ? initAccount({
        address: tx.sponsorAcct.address,
        salt: tx.sponsorAcct.salt,
        dataHash: tx.sponsorAcct.dataHash,
        vkey: tx.sponsorAcct.vkey,
      }).rlpEncode()
    : "0x";
  const toBytes = (): Data => {
    const rlpEncoded = RLP.encode([
      tx.nonce,
      feePerGas,
      tx.newUserData,
      tx.newUserVkey,
      userAcct.address,
      userAcct.salt,
      userAcct.dataHash,
      userAcct.vkey,
      tx.userProof,
      sponsorAcctBytes,
      tx.sponsorProof,
    ]);

    return encodePacked(
      ["bytes1", "bytes1", "bytes", "bytes"],
      [TransactionType.Update, isL1Initiated, l1InitiatedNonce, bytesToHex(rlpEncoded)],
    );
  };

  const txHash = (): Hash => keccak256(toBytes());

  const userMsgHash = (): Hash => {
    console.log("hashTypedData", {
      domain: DOMAIN,
      types: UPDATE_TYPES,
      primaryType: "Update",
      message: {
        userKeystoreAddress: userAcct.address,
        nonce: tx.nonce,
        feePerGas,
        newUserData: tx.newUserData,
        newUserVkey: tx.newUserVkey,
      },
    });
    return hashTypedData({
      domain: DOMAIN,
      types: UPDATE_TYPES,
      primaryType: "Update",
      message: {
        userKeystoreAddress: userAcct.address,
        nonce: tx.nonce,
        feePerGas,
        newUserData: tx.newUserData,
        newUserVkey: tx.newUserVkey,
      },
    });
  };

  const sign = async (pk: Bytes32): Promise<Data> => {
    const hash = userMsgHash();
    return await ecdsaSign(pk, hash);
  };

  return {
    nonce: tx.nonce,
    feePerGas: tx.feePerGas,
    newUserData: tx.newUserData,
    newUserVkey: tx.newUserVkey,
    userAcct,
    sponsorAcct: tx.sponsorAcct,
    userProof: tx.userProof,
    sponsorProof: tx.sponsorProof,
    l1InitiatedNonce: tx.l1InitiatedNonce,
    isL1Initiated: tx.isL1Initiated,
    toBytes,
    txHash,
    userMsgHash,
    sign,
  };
}
