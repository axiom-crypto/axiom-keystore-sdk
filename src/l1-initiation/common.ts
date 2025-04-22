import { Address, Log, parseEventLogs } from "viem";
import { abi } from "./abi/AxiomKeystoreRollup.json";

export type BridgeAddressParameter = {
  bridgeAddress: Address,
}

export type GetL2TransactionHashesParameters = {
  logs: Log[]
}

export function getL2TransactionHashes({ logs }: GetL2TransactionHashesParameters) {
  const decodedEvents = parseEventLogs({
    abi,
    eventName: 'L1TransactionInitiated',
    logs
  }) as any[]; // TODO: use the correct type
  return decodedEvents.map((event) => event.args.l2TxHash);
}
