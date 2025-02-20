import { pad } from "viem";
import { KeystoreAccount } from "./types/transaction";
import { AuthInputs, makeMOfNEcdsaAuthInputs } from "./types/input";

export const SAMPLE_USER_CODE_HASH =
  "0x595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d9";

export const KEYSTORE_CHAIN_ID = 999999999n;

export const NODE_URL = "https://keystore-rpc-node.axiom.xyz";
export const SIGNATURE_PROVER_URL =
  "https://keystore-rpc-signatureprover.axiom.xyz";
export const SEQUENCER_URL = "https://keystore-rpc-sequencer.axiom.xyz";

export const AXIOM_EOA = "0xD7548a3ED8c51FA30D26ff2D7Db5C33d27fd48f2";
export const AXIOM_CODEHASH =
  "0xa1b20564cd6cc6410266a716c9654406a15e822d4dc89c4127288da925d5c225";
export const M_OF_N_ECDSA_VKEY =
  "01010000001001000100010100000100000000000000000000000000000000009171ded76cb8d446b69cb901fe413fe380886240549feb11014fec000a7eb1280750a550988ceaef9a37f6794af0d9bf472445bc9dfacf89b9f4a6130c2b0eb42ef05dfd54c6d765973c1b3e0c15885e1307bedc893a3474103a065e7a032d04078f64fde979db4eea6692dbde7d161c3e6c3ae99f2e7cf9c58229f8d1a5bb97056fb20596873754a862cbe247b25315399d7be7a8bfe72942564c469d6a95e141a2f3c0bb526ad5ded741e9c10d6920cd28a10f108b0d1f2b22688b67a32c4055f6d42ed1d1c3eb767c513d8aa832c470b29a9dc7afb33fdcfeda198b820f724d13a24c6d1123d95b1124cf08c4aaf9531dd819011b9a13b6151d5ab83225fe4517";

export const AXIOM_ACCOUNT: KeystoreAccount = {
  keystoreAddress:
    "0x17fda3a85e8162f13219f485220d258b013438fcc0b031ef9651c610c1ef2437",
  salt: pad("0x", { size: 32 }),
  dataHash:
    "0xecf85bc51a8b47c545dad1a47e868276d0a92b7cf2716033ce77d385a6b67c4b",
  vkey: M_OF_N_ECDSA_VKEY,
};

export const AXIOM_ACCOUNT_AUTH_INPUTS: AuthInputs = makeMOfNEcdsaAuthInputs(
  AXIOM_CODEHASH,
  [],
  [AXIOM_EOA],
);
