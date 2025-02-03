import { pad } from "viem";
import { KeystoreAccount } from "./types/transaction";
import { AuthInputs } from "./types/input";

export const SAMPLE_USER_CODE_HASH = "0x595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d9";

export const KEYSTORE_CHAIN_ID = 999999999;

export const NODE_URL = "http://keystore-rpc-node.axiom.xyz";
export const SIGNATURE_PROVER_URL = "http://keystore-rpc-signatureprover.axiom.xyz";
export const SEQUENCER_URL = "http://keystore-rpc-sequencer.axiom.xyz";

export const AXIOM_EOA = "0xD7548a3ED8c51FA30D26ff2D7Db5C33d27fd48f2";
export const AXIOM_CODEHASH = "0xa1b20564cd6cc6410266a716c9654406a15e822d4dc89c4127288da925d5c225";
export const M_OF_N_ECDSA_VKEY = "0x0101000000100100010001010000010000000000000000000000000000000000c2a0d92fb31c99dfda731ea5bf75c96f0f8e6e7bdc2165eeff291278ffb4271f073d8fba654fea9aa5752d0f2965bc43822f9c4febbed9b9ff67d7bc6d7deac62185d16495dc3ecd561da02b1d9a9c528c640e9841cb49e8c587da0b398a8292093ff53be4f960cbcf9a2d054aaa950dd27481accda50c2ee8edaa312e62c3dc06c3c7f8b93a350d854985a69bb1482a241cd0406e95cca5532b60ed4f56f43d0394bcf39d9835c1ea7be421f9efb6d8dd8b4cd99282118f34f8486f2642efcd61a6f8fc09c76845b8f492074bbd3a03b8e714b36f3d678a67faad014043c3401c22db6f7f31a566211c201e1480b47b4899adc95dafda721247fc096bd80a384d16";

export const AXIOM_ACCOUNT: KeystoreAccount = {
  keystoreAddress: "0xc3a9b82816196f3f5692dda37ee242839ce86357dc06a205ce04da56a3651e06",
  salt: pad("0x", { size: 32 }),
  dataHash: "0xecf85bc51a8b47c545dad1a47e868276d0a92b7cf2716033ce77d385a6b67c4b",
  vkey: M_OF_N_ECDSA_VKEY,
}

export const AXIOM_ACCOUNT_AUTH_INPUTS: AuthInputs = {
  codeHash: AXIOM_CODEHASH,
  signatures: [],
  eoaAddrs: [AXIOM_EOA]
};