import { DEFAULTS } from "@/config";
import { createWithdrawTransactionClient } from "@/transaction";
import {
  BatchTag,
  BatchTagOrIndex,
  BlockNumberResponse,
  BlockTagOrNumber,
  BlockTransactionsKind,
  CallResponse,
  Data,
  FinalizeWithdrawalArgs,
  GetBalanceResponse,
  GetBatchByIndexResponse,
  GetBlockByHashResponse,
  GetBlockByNumberResponse,
  GetBlockNumberByOutputRootResponse,
  GetProofResponse,
  GetStateAtResponse,
  GetTransactionByHashResponse,
  GetTransactionCountResponse,
  GetTransactionReceiptResponse,
  GetWithdrawalProofResponse,
  Hash,
  KeystoreAddress,
  NodeClient,
  NodeClientConfig,
  SyncStatusResponse,
  TransactionStatus,
  TransactionType,
} from "@/types";
import {
  formatBlockNumberResponse,
  formatBlockTagOrNumber,
  formatBlockTransactionKind,
  formatCallResponse,
  formatGetBalanceResponse,
  formatGetBatchByIndexResponse,
  formatGetBlockByHashResponse,
  formatGetBlockByNumberResponse,
  formatGetBlockNumberByStateRootResponse,
  formatGetTransactionByHashResponse,
  formatGetTransactionCountResponse,
  formatGetTransactionReceiptResponse,
  formatGetWithdrawalProofResponse,
  formatSyncStatusResponse,
} from "@/types/formatters";
import { formatBatchTagOrIndex } from "@/types/formatters/batch";
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

  const getWithdrawalProof = async ({
    withdrawalHash,
    block,
  }: {
    withdrawalHash: Hash;
    block?: BlockTagOrNumber;
  }): Promise<GetWithdrawalProofResponse> => {
    const res = await client.request({
      method: "keystore_getWithdrawalProof",
      params: [withdrawalHash, formatBlockTagOrNumber(block)],
    });
    return formatGetWithdrawalProofResponse(res);
  };

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

  const getBlockNumberByOutputRoot = async ({
    outputRoot,
  }: {
    outputRoot: Hash;
  }): Promise<GetBlockNumberByOutputRootResponse> => {
    const res = await client.request({
      method: "keystore_getBlockNumberByOutputRoot",
      params: [outputRoot],
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

  const getBatchByIndex = async ({
    batch,
  }: {
    batch?: BatchTagOrIndex;
  }): Promise<GetBatchByIndexResponse> => {
    const res = await client.request({
      method: "keystore_getBatchByIndex",
      params: [formatBatchTagOrIndex(batch)],
    });
    return formatGetBatchByIndexResponse(res);
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

  const buildFinalizeWithdrawalArgs = async ({
    transactionHash,
  }: {
    transactionHash: Hash;
  }): Promise<FinalizeWithdrawalArgs> => {
    const receipt = await getTransactionReceipt({ hash: transactionHash });
    if (
      receipt.status != TransactionStatus.L2FinalizedL1Finalized &&
      receipt.status != TransactionStatus.L2FinalizedL1Included
    ) {
      throw new Error("Transaction not finalized. Cannot build finalize withdrawal args");
    }

    const batch = await getBatchByIndex({ batch: BatchTag.Finalized });
    const block = await getBlockByNumber({
      block: batch.lastBlockNumber,
      txKind: BlockTransactionsKind.Hashes,
    });

    const txClient = await (async () => {
      const tx = await getTransactionByHash({ hash: transactionHash });
      switch (tx.type) {
        case TransactionType.Withdraw:
          return createWithdrawTransactionClient({ ...tx });
        case TransactionType.Deposit:
        case TransactionType.Update:
          throw new Error("Cannot build finalize withdrawal args for deposit or update transactions");
      }
    })();

    const withdrawalProof = await getWithdrawalProof({
      withdrawalHash: txClient.withdrawalHash(),
      block: block.number,
    });

    return {
      batchIndex: batch.batchIndex,
      outputRootPreimage: {
        stateRoot: block.stateRoot,
        withdrawalsRoot: block.withdrawalsRoot,
        lastValidBlockhash: block.hash,
      },
      withdrawalArgs: {
        imtKey: withdrawalProof.proof.leaf.key,
        nextDummyByte: withdrawalProof.proof.leaf.nextKeyPrefix,
        nextImtKey: withdrawalProof.proof.leaf.nextKey,
        withdrawalAmount: withdrawalProof.amt!,
        to: withdrawalProof.to!,
      },
      proof: withdrawalProof.proof.siblings.map((sib) => sib.hash),
      isLeft: withdrawalProof.proof.siblings.reduce((acc, sibling, index) => {
        return acc | (BigInt(sibling.isLeft ? 1 : 0) << BigInt(index));
      }, BigInt(0)),
    };
  };

  return {
    syncStatus,
    blockNumber,
    getBalance,
    getStateAt,
    getTransactionCount,
    getProof,
    getWithdrawalProof,
    call,
    getTransactionByHash,
    getTransactionReceipt,
    getBlockNumberByOutputRoot,
    getBlockByNumber,
    getBlockByHash,
    getBatchByIndex,
    waitForTransactionReceipt,
    waitForTransactionFinalization,
    buildFinalizeWithdrawalArgs,
  };
}
