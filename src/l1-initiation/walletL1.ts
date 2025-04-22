import { BaseTransactionAction, DepositTransactionClient, Hash, TransactionType } from "@/types";
import { Account, Address, Chain, Transport, WalletClient } from "viem";
import { PublicActionsL1 } from "./publicL1";
import { abi } from './abi/AxiomKeystoreRollup.json';
import { BridgeAddressParameter } from "./common";

export type Client = WalletClient<Transport, Chain, Account> & PublicActionsL1;

export type InitiateL1TransactionParameters = BridgeAddressParameter & { txClient: BaseTransactionAction };

export type InitiateL1TransactionReturnType = Hash;

export type WalletActionsL1 = {
  initiateL1Transaction: (parameters: InitiateL1TransactionParameters) => Promise<InitiateL1TransactionReturnType>
}

export async function initiateL1Transaction(
  client: Client,
  parameters: InitiateL1TransactionParameters
): Promise<InitiateL1TransactionReturnType> {
  const { bridgeAddress, txClient } = parameters;

  const value = await (async () => {
    switch (txClient.txType) {
      case TransactionType.Deposit:
        return await client.l1InitiatedFee({ bridgeAddress, txType: TransactionType.Deposit }) + (txClient as DepositTransactionClient).amt;
      case TransactionType.Withdraw:
        return client.l1InitiatedFee({ bridgeAddress, txType: TransactionType.Withdraw });
      case TransactionType.Update:
        return client.l1InitiatedFee({ bridgeAddress, txType: TransactionType.Update });
      default:
        throw new Error(`Unsupported transaction type`);
    }
  })();

  return await client.writeContract({
    chain: client.chain!,
    account: client.account!,
    address: bridgeAddress,
    abi,
    functionName: 'initiateL1Transaction',
    args: [txClient.l1InitiatedTransaction()],
    value,
  });
}

export function walletActionsL1() {
  return (
    client: Client
  ): WalletActionsL1 => {
    return {
      initiateL1Transaction: (parameters) => initiateL1Transaction(client, parameters),
    }
  }
}