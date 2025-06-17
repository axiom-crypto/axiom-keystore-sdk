import { initAccount } from "@/account";
import { createNodeClient, createSequencerClient } from "@/client";
import { NODE_URL, SEQUENCER_URL } from "@/constants";
import {
  Bytes32,
  Data,
  Hash,
  L1InitiatedTransactionSol,
  TransactionType,
  UpdateTransactionRequestClient,
  UpdateTransactionInputs,
} from "@/types";
import { DOMAIN, UPDATE_TYPES } from "@/types/eip712";
import { ecdsaSign } from "@/utils/ecdsa";
import { RLP } from "@ethereumjs/rlp";
import {
  bytesToHex,
  encodePacked,
  hashTypedData,
  HashTypedDataParameters,
  numberToHex,
  pad,
} from "viem";

export async function createUpdateTransactionRequestClient(
  tx: UpdateTransactionInputs,
): Promise<UpdateTransactionRequestClient> {
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
  const feePerGas = numberToHex(feePerGasBigInt, { size: 32 });

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

  const rlpEncodedPortion = bytesToHex(
    RLP.encode([
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
    ]),
  );

  const rawSequencerTransaction = (): Data => {
    return encodePacked(
      ["bytes1", "bool", "bytes", "bytes"],
      [TransactionType.Update, false, "0x", rlpEncodedPortion],
    );
  };

  const l1InitiatedTransaction = (): L1InitiatedTransactionSol => {
    return {
      txType: TransactionType.Update,
      data: rlpEncodedPortion,
    };
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

  const userMsgHash = (): Hash => {
    return hashTypedData(toTypedData());
  };

  const sign = async (pk: Bytes32): Promise<Data> => {
    const hash = userMsgHash();
    return await ecdsaSign(pk, hash);
  };

  return {
    txType: TransactionType.Update,
    nonce,
    feePerGas: feePerGasBigInt,
    newUserData: tx.newUserData,
    newUserVkey: tx.newUserVkey,
    userAcct,
    sponsorAcct,
    userProof: tx.userProof,
    sponsorProof: tx.sponsorProof,
    rawSequencerTransaction,
    l1InitiatedTransaction,
    toTypedData,
    userMsgHash,
    sign,
  };
}
