import { Data, DepositTransactionClient, DepositTransactionInputs, Hash, TransactionType } from "@/types";
import { encodePacked, keccak256, numberToHex, pad } from "viem";

export async function createDepositTransactionClient(tx: DepositTransactionInputs): Promise<DepositTransactionClient> {
  const l1InitiatedNonce = tx.l1InitiatedNonce ? numberToHex(tx.l1InitiatedNonce, { size: 32 }) : pad("0x", { size: 32 });

  const amt = tx.amt;

  const keystoreAddress = tx.keystoreAddress;

  const toBytes = (): Data => {
    return encodePacked(
      ["bytes1", "bytes", "uint256", "bytes"],
      [TransactionType.Deposit, l1InitiatedNonce, amt, keystoreAddress],
    );
  };

  const txHash = (): Hash => keccak256(toBytes());

  return {
    l1InitiatedNonce: tx.l1InitiatedNonce,
    amt,
    keystoreAddress,
    toBytes,
    txHash
  };
}