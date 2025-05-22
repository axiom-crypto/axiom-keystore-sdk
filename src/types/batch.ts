import { Quantity } from "./primitives";

export enum BatchTag {
  Committed = "committed",
  Finalized = "finalized",
  Earliest = "earliest",
}

export type BatchTagOrIndex = BatchTag | Quantity;

export enum BatchKind {
  Genesis = "genesis",
  Sequencer = "sequencer",
  L1Initiated = "l1Initiated",
}

export type BatchRef = {
  batchIndex: Quantity;
  sequencerBatchIndex: Quantity;
  l1InitiatedBatchIndex: Quantity;
  lastBlockNumber: Quantity;
  kind: BatchKind;
};
