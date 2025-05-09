import { encodePacked, keccak256 } from "viem";
import { L2BlockClient, L2BlockRef } from "./types";
import { Hash } from "./types/primitives";

export function createL2BlockClient(block: L2BlockRef): L2BlockClient {
  const outputRoot = (): Hash => {
    return keccak256(
      encodePacked(
        ["bytes32", "bytes32", "bytes32"],
        [block.stateRoot, block.withdrawalsRoot, block.hash],
      ),
    );
  };

  return {
    outputRoot,
    ...block,
  };
}
