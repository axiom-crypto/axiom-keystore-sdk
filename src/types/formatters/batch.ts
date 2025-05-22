import { numberToHex } from "viem";
import { BatchRef, BatchTag, BatchTagOrIndex } from "../batch";
import { BatchRefRpc, BatchTagOrIndexRpc } from "../rpc/batch";

export function formatBatchTagOrIndex(batch?: BatchTagOrIndex): BatchTagOrIndexRpc {
  if (!batch) {
    return BatchTag.Committed;
  }
  if (typeof batch == "bigint") {
    return numberToHex(batch);
  }
  return batch;
}

export function formatBatchRef(rpcObj: BatchRefRpc): BatchRef {
  return {
    batchIndex: BigInt(rpcObj.batchIndex),
    sequencerBatchIndex: BigInt(rpcObj.sequencerBatchIndex),
    l1InitiatedBatchIndex: BigInt(rpcObj.l1InitiatedBatchIndex),
    lastBlockNumber: BigInt(rpcObj.lastBlockNumber),
    kind: rpcObj.kind,
  };
}
