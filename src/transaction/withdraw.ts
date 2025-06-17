import { initAccount } from "@/account";
import { createNodeClient, createSequencerClient } from "@/client";
import { NODE_URL, SEQUENCER_URL } from "@/constants";
import {
  Bytes32,
  Data,
  Hash,
  L1InitiatedTransactionSol,
  TransactionType,
  WithdrawTransactionRequestClient,
  WithdrawTransactionInputs,
} from "@/types";
import { DOMAIN, WITHDRAW_TYPES } from "@/types/eip712";
import { ecdsaSign } from "@/utils/ecdsa";
import { RLP } from "@ethereumjs/rlp";
import {
  bytesToHex,
  encodePacked,
  hashTypedData,
  HashTypedDataParameters,
  keccak256,
  numberToHex,
  pad,
} from "viem";

export async function createWithdrawTransactionRequestClient(
  tx: WithdrawTransactionInputs,
): Promise<WithdrawTransactionRequestClient> {
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

  const rawSequencerTransaction = (): Data => {
    return encodePacked(
      ["bytes1", "bool", "bytes", "bytes"],
      [TransactionType.Withdraw, false, "0x", rlpEncodedPortion],
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
    nodeClientUrl: tx.nodeClientUrl,
    sequencerClientUrl: tx.sequencerClientUrl,
    rawSequencerTransaction,
    l1InitiatedTransaction,
    toTypedData,
    userMsgHash,
    sign,
    withdrawalHash,
  };
}
