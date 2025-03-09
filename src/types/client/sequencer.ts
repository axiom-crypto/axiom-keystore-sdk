import {
  Data,
  EstimateGasResponse,
  EstimateL1DataFeeResponse,
  GasPriceResponse,
  Hash,
  SendRawTransactionResponse,
  GetTransactionReceiptResponse,
  BlockTagOrNumber,
  NodeClient,
} from "@/types";

export interface SequencerClient extends NodeClient {
  sendRawTransaction: ({ data }: { data: Data }) => Promise<SendRawTransactionResponse>;

  waitForTransactionInclusion: ({ hash }: { hash: Hash }) => Promise<GetTransactionReceiptResponse>;

  gasPrice: () => Promise<GasPriceResponse>;

  estimateGas: ({ txData }: { txData: Data }) => Promise<EstimateGasResponse>;

  estimateL1DataFee: ({
    txData,
    block,
  }: {
    txData: Data;
    block?: BlockTagOrNumber;
  }) => Promise<EstimateL1DataFeeResponse>;
}

export interface SequencerClientConfig {
  url: string;
  nodeUrl?: string;
  pollingIntervalMs?: number;
  pollingRetries?: number;
}
