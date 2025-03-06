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
import { DEFAULTS } from "@/constants";
import { createNodeClient } from "./nodeClient";

export function createSequencerClient(config: SequencerClientConfig): SequencerClient {
  const {
    url,
    pollingIntervalMs = DEFAULTS.POLLING_INTERVAL_MS,
    pollingRetries = DEFAULTS.POLLING_RETRIES,
  } = config;

  const transport = new HTTPTransport(url);
  const client = new Client(new RequestManager([transport]));

  const nodeClient = createNodeClient({ url });

  const sendRawTransaction = async ({
    data,
  }: {
    data: Data;
  }): Promise<SendRawTransactionResponse> =>
    await client.request({ method: "keystore_sendRawTransaction", params: [data] });

  const waitForTransactionInclusion = async ({
    hash,
  }: {
    hash: Hash;
  }): Promise<GetTransactionReceiptResponse> => {
    console.log("Waiting for transaction inclusion, this may take serveral minutes...");
    let attempts = 0;
    while (attempts < pollingRetries) {
      try {
        const receipt = await nodeClient.getTransactionReceipt({ hash });
        switch (receipt.status) {
          case TransactionStatus.L2FinalizedL1Included:
            console.log("Success: transaction finalized on L2 and included on L1.");
            return receipt;
          case TransactionStatus.Failed:
            throw new Error("Transaction failed");
          default:
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
            continue;
        }
      } catch {
        // If getTransactionReceipt fails (transaction not yet included), continue polling
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
      }
    }
    throw new Error(`Timed out after ${(pollingRetries * pollingIntervalMs) / 1000} seconds`);
  };

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
    waitForTransactionInclusion,
    gasPrice,
    estimateGas,
    estimateL1DataFee,
  };
}
