import { BatchKind, BatchTag } from "../batch";
import { HexQuantity } from "./primitives";

export type BatchTagOrIndexRpc = BatchTag | HexQuantity;

export type BatchRefRpc = {
  batchIndex: HexQuantity;
  sequencerBatchIndex: HexQuantity;
  l1InitiatedBatchIndex: HexQuantity;
  lastBlockNumber: HexQuantity;
  kind: BatchKind;
};
