import {
  BlockTagOrNumber,
  Data,
  EstimateGasResponse,
  EstimateL1DataFeeResponse,
  GasPriceResponse,
  GetTransactionReceiptResponse,
  Hash,
  SendRawTransactionResponse,
  SequencerClient,
  SequencerClientConfig,
  TransactionStatus,
} from "@/types";
import { Client, HTTPTransport, RequestManager } from "@open-rpc/client-js";
import {
  formatBlockTagOrNumber,
  formatEstimateGasResponse,
  formatEstimateL1DataFeeResponse,
  formatGasPriceResponse,
} from "@/types/formatters";
import { DEFAULTS } from "@/config";
import { createNodeClient } from "./nodeClient";
import { NODE_URL } from "../constants";

export function createSequencerClient(config: SequencerClientConfig): SequencerClient {
  const {
    url,
    pollingIntervalMs = DEFAULTS.POLLING_INTERVAL_MS,
    pollingRetries = DEFAULTS.POLLING_RETRIES,
  } = config;

  const transport = new HTTPTransport(url, {
    fetcher: globalThis.fetch,
  });
  const client = new Client(new RequestManager([transport]));

  const nodeClient = createNodeClient({ url, pollingIntervalMs, pollingRetries });

  const sendRawTransaction = async ({
    data,
  }: {
    data: Data;
  }): Promise<SendRawTransactionResponse> =>
    await client.request({ method: "keystore_sendRawTransaction", params: [data] });

  const gasPrice = async (): Promise<GasPriceResponse> => {
    const res = await client.request({ method: "keystore_gasPrice", params: [] });
    return formatGasPriceResponse(res);
  };

  const estimateGas = async ({ txData }: { txData: Data }): Promise<EstimateGasResponse> => {
    const res = await client.request({ method: "keystore_estimateGas", params: [txData] });
    return formatEstimateGasResponse(res);
  };

  const estimateL1DataFee = async ({
    txData,
    block,
  }: {
    txData: Data;
    block?: BlockTagOrNumber;
  }): Promise<EstimateL1DataFeeResponse> => {
    const res = await client.request({
      method: "keystore_estimateL1DataFee",
      params: [txData, formatBlockTagOrNumber(block)],
    });
    return formatEstimateL1DataFeeResponse(res);
  };

  return {
    ...nodeClient,
    sendRawTransaction,
    gasPrice,
    estimateGas,
    estimateL1DataFee,
  };
}
