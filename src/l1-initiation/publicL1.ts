import AxiomKeystoreRollupAbi from "./abi/AxiomKeystoreRollup.json";
import { TransactionType } from "@/types";
import { BridgeAddressParameter } from "./common";
import { readContract } from "viem/actions";

const abi = AxiomKeystoreRollupAbi.abi;

export type L1BatchCountParameters = BridgeAddressParameter;
export type L1BatchCountReturnType = bigint;

export type L1InitiatedFeeParameters = BridgeAddressParameter & { txType: TransactionType };
export type L1InitiatedFeeReturnType = bigint;

export type PublicActionsL1 = {
  l1BatchCount: (parameters: L1BatchCountParameters) => Promise<L1BatchCountReturnType>;
  l1InitiatedFee: (parameters: L1InitiatedFeeParameters) => Promise<L1InitiatedFeeReturnType>;
};

async function l1BatchCount(
  client: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  parameters: L1BatchCountParameters,
): Promise<L1BatchCountReturnType> {
  const { bridgeAddress } = parameters;

  return (await readContract(client, {
    address: bridgeAddress,
    abi,
    functionName: "l1BatchCount",
  })) as bigint;
}

async function l1InitiatedFee(
  client: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  parameters: L1InitiatedFeeParameters,
): Promise<L1InitiatedFeeReturnType> {
  const { bridgeAddress, txType } = parameters;
  return (await readContract(client, {
    address: bridgeAddress,
    abi,
    functionName: "l1InitiatedFee",
    args: [txType],
  })) as bigint;
}

export function publicActionsL1() {
  return (
    client: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): PublicActionsL1 => {
    return {
      l1BatchCount: (parameters) => l1BatchCount(client, parameters),
      l1InitiatedFee: (parameters) => l1InitiatedFee(client, parameters),
    };
  };
}
