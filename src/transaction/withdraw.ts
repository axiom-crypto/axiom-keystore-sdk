import { initAccount } from "@/account";
import { createNodeClient, createSequencerClient } from "@/client";
import { NODE_URL, SEQUENCER_URL } from "@/constants";
import {
  Bytes32,
  Data,
  Hash,
  L1InitiatedTransactionSol,
  TransactionType,
  WithdrawTransactionClient,
  WithdrawTransactionInputs,
} from "@/types";
import { DOMAIN, WITHDRAW_TYPES } from "@/types/eip712";
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

export async function createWithdrawTransactionClient(
  tx: WithdrawTransactionInputs,
): Promise<WithdrawTransactionClient> {
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

  const isL1Initiated = boolToHex(tx.isL1Initiated ?? false, { size: 1 });
  const l1InitiatedNonce = tx.l1InitiatedNonce ? numberToHex(tx.l1InitiatedNonce) : "0x";

  const userAcct = initAccount({
    address: tx.userAcct.address,
    salt: nonce > 0n ? pad("0x00", { size: 32 }) : tx.userAcct.salt, // FIXME
    dataHash: tx.userAcct.dataHash,
    vkey: tx.userAcct.vkey,
  });

  const rlpEncodedPortion = bytesToHex(
    RLP.encode([
      nonce,
      feePerGas,
      tx.to,
      tx.amt,
      userAcct.address,
      userAcct.salt,
      userAcct.dataHash,
      userAcct.vkey,
      tx.userProof,
    ]),
  );

  const toBytes = (): Data => {
    return encodePacked(
      ["bytes1", "bytes1", "bytes", "bytes"],
      [TransactionType.Withdraw, isL1Initiated, l1InitiatedNonce, rlpEncodedPortion],
    );
  };

  const l1InitiatedTransaction = (): L1InitiatedTransactionSol => {
    return {
      txType: TransactionType.Withdraw,
      data: rlpEncodedPortion,
    };
  };

  const toTypedData = (): HashTypedDataParameters => {
    return {
      domain: DOMAIN,
      types: WITHDRAW_TYPES,
      primaryType: "Withdraw",
      message: {
        userKeystoreAddress: userAcct.address,
        nonce,
        feePerGas,
        to: tx.to,
        amt: tx.amt,
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

  const withdrawalHash = (): Hash => {
    return keccak256(encodePacked(["bytes32", "uint256"], [userAcct.address, nonce]));
  };

  return {
    txType: TransactionType.Withdraw,
    nonce,
    feePerGas: feePerGasBigInt,
    to: tx.to,
    amt: tx.amt,
    userAcct,
    userProof: tx.userProof,
    isL1Initiated: tx.isL1Initiated,
    l1InitiatedNonce: tx.l1InitiatedNonce,
    nodeClientUrl: tx.nodeClientUrl,
    sequencerClientUrl: tx.sequencerClientUrl,
    toBytes,
    l1InitiatedTransaction,
    toTypedData,
    txHash,
    userMsgHash,
    sign,
    withdrawalHash,
  };
}
