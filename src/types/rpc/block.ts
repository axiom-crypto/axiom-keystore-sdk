import { BlockTag } from "../block";
import { Byte, Hash, KeystoreAddress } from "../primitives";
import { HexQuantity } from "./primitives";
import { TransactionOrHashRpc } from "./transaction";

export type BlockTagOrNumberRpc = BlockTag | HexQuantity;

export type L1BlockRefRpc = {
  hash: Hash;
  number: HexQuantity;
  parentHash: Hash;
  timestamp: HexQuantity;
}

export type L2BlockRefRpc = {
  hash: Hash;
  number: HexQuantity;
  parentHash: Hash;
  timestamp: HexQuantity;
  sequencerKeystoreAddress: KeystoreAddress;
  stateRoot: Hash;
  withdrawalsRoot: Hash;
  transactionsRoot: Hash;
  l1Origin?: HexQuantity;
  source?: Byte;
  transactions?: TransactionOrHashRpc[];
}
