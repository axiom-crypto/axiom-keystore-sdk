import { numberToHex } from "viem";
import {
  BlockTag,
  BlockTagOrNumber,
  BlockTransactionsKind,
  L1BlockRef,
  L2BlockRef,
} from "../block";
import { BlockTagOrNumberRpc, L1BlockRefRpc, L2BlockRefRpc } from "../rpc";
import { formatTransactionOrHash } from "./transaction";

export function formatBlockTagOrNumber(block?: BlockTagOrNumber): BlockTagOrNumberRpc {
  if (!block) {
    return BlockTag.Latest;
  }
  if (typeof block === "bigint") {
    return numberToHex(block);
  }
  return block;
}

export function formatBlockTransactionKind(kind: BlockTransactionsKind): boolean {
  switch (kind) {
    case BlockTransactionsKind.Hashes:
      return false;
    case BlockTransactionsKind.Full:
      return true;
  }
}

export function formatL1BlockRef(rpcObj: L1BlockRefRpc): L1BlockRef {
  return {
    hash: rpcObj.hash,
    number: BigInt(rpcObj.number),
    parentHash: rpcObj.parentHash,
    timestamp: BigInt(rpcObj.timestamp),
  };
}

export function formatL2BlockRef(rpcObj: L2BlockRefRpc): L2BlockRef {
  return {
    hash: rpcObj.hash,
    number: BigInt(rpcObj.number),
    parentHash: rpcObj.parentHash,
    timestamp: BigInt(rpcObj.timestamp),
    sequencerKeystoreAddress: rpcObj.sequencerKeystoreAddress,
    stateRoot: rpcObj.stateRoot,
    withdrawalsRoot: rpcObj.withdrawalsRoot,
    transactionsRoot: rpcObj.transactionsRoot,
    l1Origin: rpcObj.l1Origin ? BigInt(rpcObj.l1Origin) : undefined,
    source: rpcObj.source,
    transactions: rpcObj.transactions?.map(formatTransactionOrHash),
  };
}
