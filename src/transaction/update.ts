import { initAccountFromAddress, KeystoreAccount } from "@/account";
import { Bytes32, Data, Hash, TransactionType } from "@/types";
import { DOMAIN, UPDATE_TYPES } from "@/types/eip712";
import { ecdsaSign } from "@/utils/ecdsa";
import { RLP } from "@ethereumjs/rlp";
import { boolToHex, bytesToHex, encodePacked, hashTypedData, keccak256 } from "viem";

export interface BaseTransactionAction {
  toBytes: () => Data;
  txHash: () => Hash;
  userMsgHash: () => Hash;
  sign: (pk: Bytes32) => Promise<Data>;
}

export interface UpdateTransactionData {
  nonce: bigint;
  feePerGas: bigint;
  newUserData: Data;
  newUserVkey: Data;
  userAccount: KeystoreAccount;
  sponsorAccount?: KeystoreAccount;
  userProof?: Data;
  sponsorProof?: Data;
  l1InitiatedNonce?: Data;
  isL1Initiated?: boolean;
}

export interface UpdateTransaction extends UpdateTransactionData, BaseTransactionAction {}

export function createUpdateTransaction(tx: UpdateTransactionData): UpdateTransaction {
  const isL1Initiated = boolToHex(false, { size: 1 });
  const l1InitiatedNonce = tx.l1InitiatedNonce ?? "0x";
  const userAccount = initAccountFromAddress({
    address: tx.userAccount.address,
    dataHash: tx.userAccount.dataHash,
    vkey: tx.userAccount.vkey,
  });
  const sponsorAccountBytes = tx.sponsorAccount
    ? initAccountFromAddress({
        address: tx.sponsorAccount.address,
        dataHash: tx.sponsorAccount.dataHash,
        vkey: tx.sponsorAccount.vkey,
      }).rlpEncode()
    : "0x";
  const toBytes = (): Data => {
    const rlpEncoded = RLP.encode([
      tx.nonce,
      tx.feePerGas,
      tx.newUserData,
      tx.newUserVkey,
      userAccount.address,
      userAccount.salt,
      userAccount.dataHash,
      userAccount.vkey,
      tx.userProof,
      sponsorAccountBytes,
      tx.sponsorProof,
    ]);

    return encodePacked(
      ["bytes1", "bytes1", "bytes", "bytes"],
      [TransactionType.Update, isL1Initiated, l1InitiatedNonce, bytesToHex(rlpEncoded)],
    );
  };

  const txHash = (): Hash => keccak256(toBytes());

  const userMsgHash = (): Hash => {
    return hashTypedData({
      domain: DOMAIN,
      types: UPDATE_TYPES,
      primaryType: "Update",
      message: {
        userKeystoreAddress: userAccount.address,
        nonce: tx.nonce,
        feePerGas: tx.feePerGas,
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
    userAccount,
    sponsorAccount: tx.sponsorAccount,
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
