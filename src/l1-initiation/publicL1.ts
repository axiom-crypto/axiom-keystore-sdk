import { Account, Address, Chain, Client, PublicActions, PublicClient, Transport } from "viem";
import { abi } from "./abi/AxiomKeystoreRollup.json";
import { TransactionType } from "@/types";
import { BridgeAddressParameter } from "./common";

export type L1BatchCountParameters = BridgeAddressParameter;
export type L1BatchCountReturnType = bigint;

export type L1InitiatedFeeParameters = BridgeAddressParameter & { txType: TransactionType };
export type L1InitiatedFeeReturnType = bigint;

export type PublicActionsL1 = {
  l1BatchCount: (parameters: L1BatchCountParameters) => Promise<L1BatchCountReturnType>
  l1InitiatedFee: (parameters: L1InitiatedFeeParameters) => Promise<L1InitiatedFeeReturnType>
};

async function l1BatchCount<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(
  client: Client<Transport, chain, account> & PublicActions,
  parameters: L1BatchCountParameters
): Promise<L1BatchCountReturnType> {
  const { bridgeAddress } = parameters;

  return await client.readContract({
    address: bridgeAddress,
    abi,
    functionName: 'l1BatchCount',
  }) as bigint;
}

async function l1InitiatedFee<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(
  client: Client<Transport, chain, account> & PublicActions,
  parameters: L1InitiatedFeeParameters
): Promise<L1InitiatedFeeReturnType> {
  const { bridgeAddress, txType } = parameters;
  return await client.readContract({
    address: bridgeAddress,
    abi,
    functionName: 'l1InitiatedFee',
    args: [txType],
  }) as bigint;
}

export function publicActionsL1() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account> & PublicActions,
  ): PublicActionsL1 => {
    return {
      l1BatchCount: (parameters) => l1BatchCount(client, parameters),
      l1InitiatedFee: (parameters) => l1InitiatedFee(client, parameters),
    };
  }
}