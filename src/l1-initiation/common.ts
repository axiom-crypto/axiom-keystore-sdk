import { Address, Log, parseEventLogs } from "viem";
import { abi } from "./abi/AxiomKeystoreRollup.json";
import { Hash } from "@/types";

export type BridgeAddressParameter = {
  bridgeAddress: Address;
};

export type GetL2TransactionHashesParameters = {
  logs: Log[];
};

export function getL2TransactionHashes({ logs }: GetL2TransactionHashesParameters): Hash[] {
  const decodedEvents = parseEventLogs({
    abi,
    eventName: "L1TransactionInitiated",
    logs,
  }) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  return decodedEvents.map((event) => event.args.l2TxHash);
}
