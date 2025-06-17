import {
  BaseTransactionAction,
  DepositTransactionRequestClient,
  FinalizeWithdrawalArgs,
  Hash,
  TransactionType,
} from "@/types";
import AxiomKeystoreRollupAbi from "./abi/AxiomKeystoreRollup.json";
import { BridgeAddressParameter } from "./common";
import { writeContract } from "viem/actions";

const abi = AxiomKeystoreRollupAbi.abi;

export type InitiateL1TransactionParameters = BridgeAddressParameter & {
  txRequestClient: BaseTransactionAction;
};

export type InitiateL1TransactionReturnType = Hash;

export type FinalizeWithdrawalParameters = BridgeAddressParameter & FinalizeWithdrawalArgs;

export type FinalizeWithdrawalReturnType = Hash;

export type WalletActionsL1 = {
  initiateL1Transaction: (
    parameters: InitiateL1TransactionParameters,
  ) => Promise<InitiateL1TransactionReturnType>;

  finalizeWithdrawal: (
    parameters: FinalizeWithdrawalParameters,
  ) => Promise<FinalizeWithdrawalReturnType>;
};

async function initiateL1Transaction(
  client: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  parameters: InitiateL1TransactionParameters,
): Promise<InitiateL1TransactionReturnType> {
  const { bridgeAddress, txRequestClient } = parameters;

  const value = await (async () => {
    switch (txRequestClient.txType) {
      case TransactionType.Deposit:
        return (
          (await client.l1InitiatedFee({ bridgeAddress, txType: TransactionType.Deposit })) +
          (txRequestClient as DepositTransactionRequestClient).amt
        );
      case TransactionType.Withdraw:
        return client.l1InitiatedFee({ bridgeAddress, txType: TransactionType.Withdraw });
      case TransactionType.Update:
        return client.l1InitiatedFee({ bridgeAddress, txType: TransactionType.Update });
      default:
        throw new Error(`Unsupported transaction type`);
    }
  })();

  return await writeContract(client, {
    account: client.account,
    chain: client.chain,
    address: bridgeAddress,
    abi,
    functionName: "initiateL1Transaction",
    args: [txRequestClient.l1InitiatedTransaction()],
    value,
  });
}

async function finalizeWithdrawal(
  client: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  parameters: FinalizeWithdrawalParameters,
): Promise<FinalizeWithdrawalReturnType> {
  const { bridgeAddress, batchIndex, outputRootPreimage, withdrawalArgs, proof, isLeft } =
    parameters;

  return await writeContract(client, {
    account: client.account,
    chain: client.chain,
    address: bridgeAddress,
    abi,
    functionName: "finalizeWithdrawal",
    args: [batchIndex, outputRootPreimage, withdrawalArgs, proof, isLeft],
  });
}

export function walletActionsL1() {
  return (
    client: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): WalletActionsL1 => {
    return {
      initiateL1Transaction: (parameters) => initiateL1Transaction(client, parameters),
      finalizeWithdrawal: (parameters) => finalizeWithdrawal(client, parameters),
    };
  };
}
