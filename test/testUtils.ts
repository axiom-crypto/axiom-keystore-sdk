import { KeystoreAddress, L1Address } from "../src/types/primitives";
import { bytesToHex, Hex, keccak256, pad } from "viem";
import { UpdateTransactionRequest } from "../src/types/transactionRequest";
import { KeystoreAccountBuilder } from "../src/transaction";
import { AXIOM_ACCOUNT } from "../src";

// Default accounts from Anvil
export const ANVIL_ACCOUNTS: { pk: KeystoreAddress, addr: L1Address }[] = [
  {
    pk: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    addr: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  },
  {
    pk: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    addr: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  },
  {
    pk: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    addr: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
  },
];

export const NODE_URL = "http://keystore-node-271cd8fbf8aac2f5.elb.us-east-1.amazonaws.com:80";
export const SIGNATURE_PROVER_URL = "http://signature-prover-cee9f99ccd16c4ef.elb.us-east-1.amazonaws.com:80";
export const SEQUENCER_URL = "http://keystore-sequencer-524685ad227fca63.elb.us-east-1.amazonaws.com:80";

export const AXIOM_ACCOUNT_ADDRESS = "0xc3a9b82816196f3f5692dda37ee242839ce86357dc06a205ce04da56a3651e06";
export const NON_EXISTING_ACCOUNT_ADDRESS = "0x1111111111111111111111111111111111111111111111111111111111111111";

export const EXISTING_TX_HASH = "0x3e9fe5542eda9ea70da8f12141f19629f281ef92f2458188b1c206e13c2430cc";
export const NON_EXISTENT_TX_HASH = "0x1111111111111111111111111111111111111111111111111111111111111111";

export const EXISTING_BLOCK_HASH = "0x8e776eeb4e25cfe8d84803c37d0e9349e472d44945fe9a36b46993e423957c0c";
export const NON_EXISTENT_BLOCK_HASH = "0x1111111111111111111111111111111111111111111111111111111111111111";

export const EMPTY_HEX = "0x";
export const ZERO_BYTES32 = pad("0x", { size: 32 });

export const CODE_HASH = "0x595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d9";

export const TEST_TX_REQ: UpdateTransactionRequest = {
  nonce: 0n,
  feePerGas: 100n,
  newUserData: "0x12345",
  newUserVkey: "0x12345",
  userAcct: KeystoreAccountBuilder.withSalt(pad("0x2"), keccak256("0x1234"), "0x1234"),
  sponsorAcct: AXIOM_ACCOUNT,
}

export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function generateRandomHex(length: number): Hex {
  return bytesToHex(generateRandomBytes(length))
}