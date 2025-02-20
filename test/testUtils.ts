import { KeystoreAddress, L1Address } from "../src/types/primitives";
import { keccak256, pad } from "viem";
import {
  AXIOM_ACCOUNT,
  UpdateTransactionRequest,
  KeystoreAccountBuilder,
} from "../src";

// Default accounts from Anvil
export const ANVIL_ACCOUNTS: { pk: KeystoreAddress; addr: L1Address }[] = [
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

export const NODE_URL = "https://keystore-rpc-node.axiom.xyz";
export const SIGNATURE_PROVER_URL =
  "https://keystore-rpc-signatureprover.axiom.xyz";
export const SEQUENCER_URL = "https://keystore-rpc-sequencer.axiom.xyz";

export const NON_EXISTING_ACCOUNT_ADDRESS =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

export const NON_SPONSORED_UPDATE_TX_HASH =
  "0xa99260e54e21d87d9be993408a07a0cd8bb6449be0a31a4823fdbff5a11b5873";
export const SPONSORED_UPDATE_TX_HASH =
  "0x50cb24d1fdfed99c6b3865309438572e0f9c9bbebcf76a0eb33be1ce94e4e1d9";
export const NON_EXISTENT_TX_HASH =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

export const EXISTING_BLOCK_HASH =
  "0x6f0234079365fb3527b65a8c4143d1b4de932750374fa9646cd6935d05efd534";
export const NON_EXISTENT_BLOCK_HASH =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

export const EMPTY_HEX = "0x";
export const ZERO_BYTES32 = pad("0x", { size: 32 });

export const CODE_HASH =
  "0x595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d9";

export const TEST_TX_REQ: UpdateTransactionRequest = {
  nonce: 0n,
  feePerGas: 100n,
  newUserData: "0x12345",
  newUserVkey: "0x12345",
  userAcct: KeystoreAccountBuilder.initCounterfactual(
    pad("0x2"),
    keccak256("0x1234"),
    "0x1234",
  ),
  sponsorAcct: AXIOM_ACCOUNT,
};
