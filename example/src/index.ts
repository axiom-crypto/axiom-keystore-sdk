import {
  createNodeClient,
  createSignatureProverClient,
  initAccountCounterfactual,
  initAccountFromAddress,
  createUpdateTransactionClient,
  createSequencerClient,
  Bytes32,
  L1Address,
} from "@axiom-crypto/keystore-sdk";
import { MOfNEcdsaSignatureProver } from "@axiom-crypto/signature-prover-ecdsa";
import { pad, stringToHex } from "viem";

const NODE_URL = "https://keystore-rpc-node.axiom.xyz";
const SEQUENCER_URL = "https://keystore-rpc-sequencer.axiom.xyz";

const EXAMPLE_USER_CODEHASH = "0x595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d9";
const EXAMPLE_SPONSOR_CODEHASH =
  "0xa1b20564cd6cc6410266a716c9654406a15e822d4dc89c4127288da925d5c225";
const EXAMPLE_SPONSOR_DATA_HASH =
  "0xecf85bc51a8b47c545dad1a47e868276d0a92b7cf2716033ce77d385a6b67c4b";
const EXAMPLE_SPONSOR_KEYSTORE_ADDR =
  "0xb5ce21832ca3bbf53de610c6dda13d6a735b0a8ea3422aeaab678a01e298269d";
const EXAMPLE_SPONSOR_EOA = "0xD7548a3ED8c51FA30D26ff2D7Db5C33d27fd48f2";
const ANVIL_ACCOUNTS: { privateKey: Bytes32; address: L1Address }[] = [
  {
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  },
];

async function main() {
  const account = ANVIL_ACCOUNTS[0];

  const mOfNEcdsaClient = createSignatureProverClient(MOfNEcdsaSignatureProver);
  const dataHash = mOfNEcdsaClient.dataHash({
    codehash: EXAMPLE_USER_CODEHASH,
    m: BigInt(1),
    signersList: [account.address],
  });
  console.log("Data hash:", dataHash);

  const nodeClient = createNodeClient({ url: NODE_URL });
  const sequencerClient = createSequencerClient({ url: SEQUENCER_URL });

  // const salt = generateRandomHex(32);
  const salt = pad("0x00", { size: 32 });
  const userAcct = initAccountCounterfactual({
    salt,
    dataHash,
    vkey: MOfNEcdsaSignatureProver.vkey,
    nodeClient,
  });
  console.log("User account initialized:", userAcct);

  const sponsorAcct = initAccountFromAddress({
    address: EXAMPLE_SPONSOR_KEYSTORE_ADDR,
    dataHash: EXAMPLE_SPONSOR_DATA_HASH,
    vkey: MOfNEcdsaSignatureProver.vkey,
  });
  const updateTx = createUpdateTransactionClient({
    nonce: await userAcct.getNonce(),
    feePerGas: await sequencerClient.gasPrice(),
    newUserData: stringToHex("newUserData"), // placeholder
    newUserVkey: MOfNEcdsaSignatureProver.vkey,
    userAcct,
    sponsorAcct,
  });
  console.log("Transaction request:", updateTx);
  const signedTx = await updateTx.sign(account.privateKey);
  console.log("# Signed transaction:", signedTx);

  const userAuthInputs = mOfNEcdsaClient.makeAuthInputs({
    codehash: EXAMPLE_USER_CODEHASH,
    signatures: [signedTx],
    signersList: [account.address],
  });
  const sponsorAuthInputs = mOfNEcdsaClient.makeAuthInputs({
    codehash: EXAMPLE_SPONSOR_CODEHASH,
    signatures: [],
    signersList: [EXAMPLE_SPONSOR_EOA],
  });
  const authHash = await mOfNEcdsaClient.authenticateSponsoredTransaction({
    transaction: updateTx.toBytes(),
    sponsoredAuthInputs: {
      proveSponsored: {
        userAuthInputs,
        sponsorAuthInputs,
      },
    },
  });
  console.log("# Sponsored transaction:", authHash);
  const authenticatedTx = await mOfNEcdsaClient.waitForAuthentication({ hash: authHash });
  console.log("Authenticated transaction:", authenticatedTx);

  const txHash = await sequencerClient.sendRawTransaction({ data: authenticatedTx });
  console.log("Transaction sent to sequencer:", txHash);

  const receipt = await sequencerClient.waitForTransactionInclusion({ hash: txHash });
  console.log("Transaction receipt:", receipt);
}

main();
