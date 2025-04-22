import { DEFAULTS } from "@/config";
import {
  BlockNumberResponse,
  BlockTagOrNumber,
  BlockTransactionsKind,
  CallResponse,
  Data,
  GetBalanceResponse,
  GetBlockByHashResponse,
  GetBlockByNumberResponse,
  GetBlockNumberByStateRootResponse,
  GetProofResponse,
  GetStateAtResponse,
  GetTransactionByHashResponse,
  GetTransactionCountResponse,
  GetTransactionReceiptResponse,
  Hash,
  KeystoreAddress,
  NodeClient,
  NodeClientConfig,
  SyncStatusResponse,
  TransactionStatus,
} from "@/types";
import {
  formatBlockNumberResponse,
  formatBlockTagOrNumber,
  formatBlockTransactionKind,
  formatCallResponse,
  formatGetBalanceResponse,
  formatGetBlockByHashResponse,
  formatGetBlockByNumberResponse,
  formatGetBlockNumberByStateRootResponse,
  formatGetTransactionByHashResponse,
  formatGetTransactionCountResponse,
  formatGetTransactionReceiptResponse,
  formatSyncStatusResponse,
} from "@/types/formatters";
import { Client, HTTPTransport, RequestManager } from "@open-rpc/client-js";

export function createNodeClient(config: NodeClientConfig): NodeClient {
  const {
    url,
    pollingIntervalMs = DEFAULTS.POLLING_INTERVAL_MS,
    pollingRetries = DEFAULTS.POLLING_RETRIES,
  } = config;

  const transport = new HTTPTransport(url, {
    fetcher: globalThis.fetch,
  });
  const client = new Client(new RequestManager([transport]));

  const syncStatus = async (): Promise<SyncStatusResponse> => {
    const res = await client.request({ method: "keystore_syncStatus", params: [] });
    return formatSyncStatusResponse(res);
  };

  const blockNumber = async (): Promise<BlockNumberResponse> => {
    const res = await client.request({ method: "keystore_blockNumber", params: [] });
    return formatBlockNumberResponse(res);
  };

  const getBalance = async ({
    address,
    block,
  }: {
    address: KeystoreAddress;
    block?: BlockTagOrNumber;
  }): Promise<GetBalanceResponse> => {
    const res = await client.request({
      method: "keystore_getBalance",
      params: [address, formatBlockTagOrNumber(block)],
    });
    return formatGetBalanceResponse(res);
  };

  const getStateAt = async ({
    address,
    block,
  }: {
    address: KeystoreAddress;
    block?: BlockTagOrNumber;
  }): Promise<GetStateAtResponse> =>
    await client.request({
      method: "keystore_getStateAt",
      params: [address, formatBlockTagOrNumber(block)],
    });

  const getTransactionCount = async ({
    address,
    block,
  }: {
    address: KeystoreAddress;
    block?: BlockTagOrNumber;
  }): Promise<GetTransactionCountResponse> => {
    const res = await client.request({
      method: "keystore_getTransactionCount",
      params: [address, formatBlockTagOrNumber(block)],
    });
    return formatGetTransactionCountResponse(res);
  };

  const getProof = async ({
    address,
    block,
  }: {
    address: KeystoreAddress;
    block?: BlockTagOrNumber;
  }): Promise<GetProofResponse> =>
    await client.request({
      method: "keystore_getProof",
      params: [address, formatBlockTagOrNumber(block)],
    });

  const call = async ({
    transaction,
    block,
  }: {
    transaction: Data;
    block?: BlockTagOrNumber;
  }): Promise<CallResponse> => {
    const res = await client.request({
      method: "keystore_call",
      params: [transaction, formatBlockTagOrNumber(block)],
    });
    return formatCallResponse(res);
  };

  const getTransactionByHash = async ({
    hash,
  }: {
    hash: Hash;
  }): Promise<GetTransactionByHashResponse> => {
    const res = await client.request({
      method: "keystore_getTransactionByHash",
      params: [hash],
    });
    return formatGetTransactionByHashResponse(res);
  };

  const getTransactionReceipt = async ({
    hash,
  }: {
    hash: Hash;
  }): Promise<GetTransactionReceiptResponse> => {
    const res = await client.request({
      method: "keystore_getTransactionReceipt",
      params: [hash],
    });
    return formatGetTransactionReceiptResponse(res);
  };

  const getBlockNumberByStateRoot = async ({
    stateRoot,
  }: {
    stateRoot: Hash;
  }): Promise<GetBlockNumberByStateRootResponse> => {
    const res = await client.request({
      method: "keystore_getBlockNumberByStateRoot",
      params: [stateRoot],
    });
    return formatGetBlockNumberByStateRootResponse(res);
  };

  const getBlockByNumber = async ({
    block,
    txKind,
  }: {
    block: BlockTagOrNumber;
    txKind: BlockTransactionsKind;
  }): Promise<GetBlockByNumberResponse> => {
    const res = await client.request({
      method: "keystore_getBlockByNumber",
      params: [formatBlockTagOrNumber(block), formatBlockTransactionKind(txKind)],
    });
    return formatGetBlockByNumberResponse(res);
  };

  const getBlockByHash = async ({
    hash,
    txKind,
  }: {
    hash: Hash;
    txKind: BlockTransactionsKind;
  }): Promise<GetBlockByHashResponse> => {
    const res = await client.request({
      method: "keystore_getBlockByHash",
      params: [hash, formatBlockTransactionKind(txKind)],
    });
    return formatGetBlockByHashResponse(res);
  };

  const waitForTransactionReceipt = async ({
    hash,
  }: {
    hash: Hash;
  }): Promise<GetTransactionReceiptResponse> => {
    let attempts = 0;
    while (attempts < pollingRetries) {
      try {
        return await getTransactionReceipt({ hash });
      } catch {
        // If getTransactionReceipt fails (transaction not yet included), continue polling
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
      }
    }
    throw new Error(`Timed out after ${(pollingRetries * pollingIntervalMs) / 1000} seconds`);
  };

  const waitForTransactionFinalization = async ({
    hash,
  }: {
    hash: Hash;
  }): Promise<GetTransactionReceiptResponse> => {
    let attempts = 0;
    while (attempts < pollingRetries) {
      try {
        const receipt = await getTransactionReceipt({ hash });
        if (
          receipt.status === TransactionStatus.L2FinalizedL1Finalized ||
          receipt.status === TransactionStatus.L2FinalizedL1Included
        ) {
          return receipt;
        } else {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
        }
      } catch {
        // If getTransactionReceipt fails (transaction not yet included), continue polling
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
      }
    }
    throw new Error(`Timed out after ${(pollingRetries * pollingIntervalMs) / 1000} seconds`);
  };

  return {
    syncStatus,
    blockNumber,
    getBalance,
    getStateAt,
    getTransactionCount,
    getProof,
    call,
    getTransactionByHash,
    getTransactionReceipt,
    getBlockNumberByStateRoot,
    getBlockByNumber,
    getBlockByHash,
    waitForTransactionReceipt,
    waitForTransactionFinalization,
  };
}
