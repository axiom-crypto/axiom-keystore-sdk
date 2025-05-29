import {
  BlockNumberResponse,
  CallResponse,
  GetBalanceResponse,
  GetBlockByHashResponse,
  GetBlockByNumberResponse,
  GetBlockNumberByStateRootResponse,
  GetBlockNumberByOutputRootResponse,
  GetProofResponse,
  GetStateAtResponse,
  GetTransactionByHashResponse,
  GetTransactionCountResponse,
  GetTransactionReceiptResponse,
  SyncStatusResponse,
  Hash,
  KeystoreAddress,
  BlockTagOrNumber,
  Data,
  BlockTransactionsKind,
  BatchTagOrIndex,
  GetBatchByIndexResponse,
  GetWithdrawalProofResponse,
  FinalizeWithdrawalArgs,
} from "@/types";

export interface NodeClient {
  syncStatus: () => Promise<SyncStatusResponse>;

  blockNumber: () => Promise<BlockNumberResponse>;

  getBalance: ({
    address,
    block,
  }: {
    address: KeystoreAddress;
    block?: BlockTagOrNumber;
  }) => Promise<GetBalanceResponse>;

  getStateAt: ({
    address,
    block,
  }: {
    address: KeystoreAddress;
    block?: BlockTagOrNumber;
  }) => Promise<GetStateAtResponse>;

  getTransactionCount: ({
    address,
    block,
  }: {
    address: KeystoreAddress;
    block?: BlockTagOrNumber;
  }) => Promise<GetTransactionCountResponse>;

  getProof: ({
    address,
    block,
  }: {
    address: KeystoreAddress;
    block?: BlockTagOrNumber;
  }) => Promise<GetProofResponse>;

  getWithdrawalProof: ({
    withdrawalHash,
    block,
  }: {
    withdrawalHash: Hash;
    block?: BlockTagOrNumber;
  }) => Promise<GetWithdrawalProofResponse>;

  call: ({
    transaction,
    block,
  }: {
    transaction: Data;
    block?: BlockTagOrNumber;
  }) => Promise<CallResponse>;

  getTransactionByHash: ({ hash }: { hash: Hash }) => Promise<GetTransactionByHashResponse>;

  getTransactionReceipt: ({ hash }: { hash: Hash }) => Promise<GetTransactionReceiptResponse>;

  getBlockNumberByStateRoot: ({
    stateRoot,
  }: {
    stateRoot: Hash;
  }) => Promise<GetBlockNumberByStateRootResponse>;

  getBlockNumberByOutputRoot: ({
    outputRoot,
  }: {
    outputRoot: Hash;
  }) => Promise<GetBlockNumberByOutputRootResponse>;

  getBlockByNumber: ({
    block,
    txKind,
  }: {
    block: BlockTagOrNumber;
    txKind: BlockTransactionsKind;
  }) => Promise<GetBlockByNumberResponse>;

  getBlockByHash: ({
    hash,
    txKind,
  }: {
    hash: Hash;
    txKind: BlockTransactionsKind;
  }) => Promise<GetBlockByHashResponse>;

  getBatchByIndex: ({ batch }: { batch?: BatchTagOrIndex }) => Promise<GetBatchByIndexResponse>;

  waitForTransactionReceipt: ({ hash }: { hash: Hash }) => Promise<GetTransactionReceiptResponse>;

  waitForTransactionFinalization: ({
    hash,
  }: {
    hash: Hash;
  }) => Promise<GetTransactionReceiptResponse>;

  buildFinalizeWithdrawalArgs: ({
    transactionHash,
  }: {
    transactionHash: Hash;
  }) => Promise<FinalizeWithdrawalArgs>;
}

export interface NodeClientConfig {
  url: string;
  pollingIntervalMs?: number;
  pollingRetries?: number;
}
