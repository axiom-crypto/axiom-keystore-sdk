import { KEYSTORE_CHAIN_ID } from "../constants";

export const DOMAIN = {
  name: "AxiomKeystore",
  version: "1",
  chainId: KEYSTORE_CHAIN_ID,
} as const;

export const EIP712_DOMAIN_TYPES = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
] as const;

export const UPDATE_TYPES = {
  EIP712Domain: EIP712_DOMAIN_TYPES,
  Update: [
    { name: "userKeystoreAddress", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "feePerGas", type: "bytes" },
    { name: "newUserData", type: "bytes" },
    { name: "newUserVkey", type: "bytes" },
  ],
} as const;
