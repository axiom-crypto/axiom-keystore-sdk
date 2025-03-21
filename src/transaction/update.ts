import { initAccount } from "@/account";
import { createNodeClient, createSequencerClient } from "@/client";
import { NODE_URL, SEQUENCER_URL } from "@/constants";
import {
  Bytes32,
  Data,
  Hash,
  TransactionType,
  UpdateTransactionClient,
  UpdateTransactionInputs,
} from "@/types";
import { DOMAIN, UPDATE_TYPES } from "@/types/eip712";
import { ecdsaSign } from "@/utils/ecdsa";
import { RLP } from "@ethereumjs/rlp";
import {
  boolToHex,
  bytesToHex,
  encodePacked,
  hashTypedData,
  HashTypedDataParameters,
  keccak256,
  numberToHex,
  pad,
} from "viem";

export async function createUpdateTransactionClient(
  tx: UpdateTransactionInputs,
): Promise<UpdateTransactionClient> {
  const nodeClient = createNodeClient({ url: tx.nodeClientUrl ?? NODE_URL });
  const nonce =
    tx.nonce ??
    (await (async () => {
      try {
        return await tx.userAcct.getNonce();
      } catch {
        return await nodeClient.getTransactionCount({ address: tx.userAcct.address });
      }
    })());

  const feePerGasBigInt =
    tx.feePerGas ??
    (await (async () => {
      const sequencerClient = createSequencerClient({
        url: tx.sequencerClientUrl ?? SEQUENCER_URL,
      });
      return await sequencerClient.gasPrice();
    })());
  const feePerGas = numberToHex(feePerGasBigInt);

  const isL1Initiated = boolToHex(false, { size: 1 });
  const l1InitiatedNonce = tx.l1InitiatedNonce ? numberToHex(tx.l1InitiatedNonce) : "0x";

  const userAcct = initAccount({
    address: tx.userAcct.address,
    salt: nonce > 0n ? pad("0x00", { size: 32 }) : tx.userAcct.salt,
    dataHash: tx.userAcct.dataHash,
    vkey: tx.userAcct.vkey,
  });

  const sponsorNonce =
    tx.sponsorAcct === undefined
      ? 0n
      : await nodeClient.getTransactionCount({ address: tx.sponsorAcct.address });
  const sponsorAcct =
    tx.sponsorAcct &&
    initAccount({
      address: tx.sponsorAcct.address,
      salt: sponsorNonce > 0n ? pad("0x00", { size: 32 }) : tx.sponsorAcct.salt,
      dataHash: tx.sponsorAcct.dataHash,
      vkey: tx.sponsorAcct.vkey,
    });
  const sponsorAcctBytes = sponsorAcct ? sponsorAcct.rlpEncode() : "0x";

  const toBytes = (): Data => {
    const rlpEncoded = RLP.encode([
      nonce,
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

  const toTypedData = (): HashTypedDataParameters => {
    return {
      domain: DOMAIN,
      types: UPDATE_TYPES,
      primaryType: "Update",
      message: {
        userKeystoreAddress: userAcct.address,
        nonce,
        feePerGas,
        newUserData: tx.newUserData,
        newUserVkey: tx.newUserVkey,
      },
    };
  };

  const txHash = (): Hash => keccak256(toBytes());

  const userMsgHash = (): Hash => {
    return hashTypedData(toTypedData());
  };

  const sign = async (pk: Bytes32): Promise<Data> => {
    const hash = userMsgHash();
    return await ecdsaSign(pk, hash);
  };

  return {
    nonce,
    feePerGas: feePerGasBigInt,
    newUserData: tx.newUserData,
    newUserVkey: tx.newUserVkey,
    userAcct,
    sponsorAcct,
    userProof: tx.userProof,
    sponsorProof: tx.sponsorProof,
    l1InitiatedNonce: tx.l1InitiatedNonce,
    isL1Initiated: tx.isL1Initiated,
    toBytes,
    toTypedData,
    txHash,
    userMsgHash,
    sign,
  };
}
