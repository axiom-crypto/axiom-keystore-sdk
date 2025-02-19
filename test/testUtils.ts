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

export const AXIOM_ACCOUNT_ADDRESS =
  "0x17fda3a85e8162f13219f485220d258b013438fcc0b031ef9651c610c1ef2437";
export const NON_EXISTING_ACCOUNT_ADDRESS =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

export const NON_SPONSORED_UPDATE_TX_HASH =
  "0x82dd49ba30a801b040257aa386aa319a2c5c16574930f155d0de9fcc630209f4";
export const SPONSORED_UPDATE_TX_HASH =
  "0xda26577e0d1ee77903038862c4d382b867022c6be5583599e9b7dab3a63e8f40";
export const NON_EXISTENT_TX_HASH =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

export const EXISTING_BLOCK_HASH =
  "0xceeb160c416b9a20423e0567417cb7e544d7e5847693f392a1ef9d55ba69b17d";
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
