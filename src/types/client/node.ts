import {
  BlockNumberResponse,
  CallResponse,
  GetBalanceResponse,
  GetBlockByHashResponse,
  GetBlockByNumberResponse,
  GetBlockNumberByStateRootResponse,
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
  TransactionStatus,
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

  waitForTransactionReceipt: ({ hash }: { hash: Hash }) => Promise<GetTransactionReceiptResponse>;

  waitForTransactionStatus: ({
    hash,
    status,
  }: {
    hash: Hash;
    status: TransactionStatus;
  }) => Promise<GetTransactionReceiptResponse>;
}

export interface NodeClientConfig {
  url: string;
  pollingIntervalMs?: number;
  pollingRetries?: number;
}
