import { KeystoreAddress, L1Address } from "../src/types/primitives";
import { initAccountCounterfactual, initAccountFromAddress, UpdateTransactionInputs } from "../src";
import { keccak256, pad } from "viem";

// Accounts from test seed phrase `test test test test test test test test test test test junk`
export const TEST_ACCOUNTS: { pk: KeystoreAddress; addr: L1Address }[] = [
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

export const SIGNATURE_PROVER_URL = "https://keystore-rpc-signatureprover.axiom.xyz";

export const NON_EXISTING_ACCOUNT_ADDRESS =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

export const NON_SPONSORED_UPDATE_TX_HASH =
  "0x500d85b385c0ac909591e3d7da972fd44d5d10b79872c365822d8c04990cbbc7";
export const SPONSORED_UPDATE_TX_HASH =
  "0xa13fdc7c260b7feabf271c8cf3bd76a807f237e174e875890b8df3947f004006";
export const NON_EXISTENT_TX_HASH =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

export const EXISTING_BLOCK_HASH =
  "0x4f7eeafe640dfa29428f4d27aade2a1e2495f68763e754b90156b41ef798c81c";
export const NON_EXISTENT_BLOCK_HASH =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

export const EMPTY_HEX = "0x";
export const ZERO_BYTES32 = pad("0x", { size: 32 });

export const CODE_HASH = "0x595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d9";

export const AXIOM_SPONSOR_CODEHASH =
  "0xa1b20564cd6cc6410266a716c9654406a15e822d4dc89c4127288da925d5c225";
export const AXIOM_SPONSOR_DATA_HASH =
  "0xecf85bc51a8b47c545dad1a47e868276d0a92b7cf2716033ce77d385a6b67c4b";
export const AXIOM_SPONSOR_ADDRESS =
  "0xb5ce21832ca3bbf53de610c6dda13d6a735b0a8ea3422aeaab678a01e298269d";
export const AXIOM_SPONSOR_EOA = "0xD7548a3ED8c51FA30D26ff2D7Db5C33d27fd48f2";

export const M_OF_N_ECDSA_VKEY =
  "0x01010000001001000100010100000100000000000000000000000000000000009171ded76cb8d446b69cb901fe413fe380886240549feb11014fec000a7eb1280750a550988ceaef9a37f6794af0d9bf472445bc9dfacf89b9f4a6130c2b0eb42ef05dfd54c6d765973c1b3e0c15885e1307bedc893a3474103a065e7a032d04078f64fde979db4eea6692dbde7d161c3e6c3ae99f2e7cf9c58229f8d1a5bb97056fb20596873754a862cbe247b25315399d7be7a8bfe72942564c469d6a95e141a2f3c0bb526ad5ded741e9c10d6920cd28a10f108b0d1f2b22688b67a32c4055f6d42ed1d1c3eb767c513d8aa832c470b29a9dc7afb33fdcfeda198b820f724d13a24c6d1123d95b1124cf08c4aaf9531dd819011b9a13b6151d5ab83225fe4517";

export const SPONSOR_ACCOUNT = initAccountFromAddress({
  address: AXIOM_SPONSOR_ADDRESS,
  dataHash: AXIOM_SPONSOR_DATA_HASH,
  vkey: M_OF_N_ECDSA_VKEY,
});

export const TEST_TX_REQ: UpdateTransactionInputs = {
  nonce: 0n,
  feePerGas: 100n,
  newUserData: "0x12345",
  newUserVkey: "0x12345",
  userAcct: initAccountCounterfactual({
    salt: pad("0x02", { size: 32 }),
    dataHash: keccak256("0x1234"),
    vkey: "0x1234",
  }),
  sponsorAcct: SPONSOR_ACCOUNT,
};
