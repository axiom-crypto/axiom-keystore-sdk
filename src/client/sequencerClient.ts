import {
  BlockTagOrNumber,
  Data,
  EstimateGasResponse,
  EstimateL1DataFeeResponse,
  GasPriceResponse,
  SendRawTransactionResponse,
} from "@/types";
import { createNodeClient, NodeClient } from "./nodeClient";
import Client, { HTTPTransport, RequestManager } from "@open-rpc/client-js";
import {
  formatBlockTagOrNumber,
  formatEstimateGasResponse,
  formatEstimateL1DataFeeResponse,
  formatGasPriceResponse,
} from "@/types/formatters";

export interface SequencerClient extends NodeClient {
  sendRawTransaction: ({
    transaction,
  }: {
    transaction: Data;
  }) => Promise<SendRawTransactionResponse>;

  gasPrice: () => Promise<GasPriceResponse>;

  estimateGas: ({ transaction }: { transaction: Data }) => Promise<EstimateGasResponse>;

  estimateL1DataFee: ({
    transaction,
    block,
  }: {
    transaction: Data;
    block?: BlockTagOrNumber;
  }) => Promise<EstimateL1DataFeeResponse>;
}

export interface SequencerClientConfig {
  url: string;
  pollingIntervalMs?: number;
  pollingRetries?: number;
}

export function createSequencerClient(config: SequencerClientConfig): SequencerClient {
  const {
    url,
    // pollingIntervalMs = DEFAULTS.POLLING_INTERVAL_MS,
    // pollingRetries = DEFAULTS.POLLING_RETRIES,
  } = config;

  const transport = new HTTPTransport(url);
  const client = new Client(new RequestManager([transport]));

  const nodeClient = createNodeClient({ url });

  return {
    ...nodeClient,
    sendRawTransaction: async ({
      transaction,
    }: {
      transaction: Data;
    }): Promise<SendRawTransactionResponse> =>
      await client.request({ method: "keystore_sendRawTransaction", params: [transaction] }),
    gasPrice: async (): Promise<GasPriceResponse> => {
      const res = await client.request({ method: "keystore_gasPrice", params: [] });
      return formatGasPriceResponse(res);
    },
    estimateGas: async ({ transaction }: { transaction: Data }): Promise<EstimateGasResponse> => {
      const res = await client.request({ method: "keystore_estimateGas", params: [transaction] });
      return formatEstimateGasResponse(res);
    },
    estimateL1DataFee: async ({
      transaction,
      block,
    }: {
      transaction: Data;
      block?: BlockTagOrNumber;
    }): Promise<EstimateL1DataFeeResponse> => {
      const res = await client.request({
        method: "keystore_estimateL1DataFee",
        params: [transaction, formatBlockTagOrNumber(block)],
      });
      return formatEstimateL1DataFeeResponse(res);
    },
  };
}
