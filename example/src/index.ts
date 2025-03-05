import {
  createNodeClient,
  createSignatureProverClient,
  initAccountCounterfactual,
  createUpdateTransactionClient,
  createSequencerClient,
  Bytes32,
  L1Address,
  initAccountFromAddress,
} from "@axiom-crypto/keystore-sdk";
import { generateRandomHex } from "@axiom-crypto/keystore-sdk/utils/random";
import { MOfNEcdsaSignatureProver } from "@axiom-crypto/signature-prover-ecdsa";
import { keccak256 } from "viem";

// Axiom Keystore Rollup RPC endpoints
const NODE_URL = "https://keystore-rpc-node.axiom.xyz";
const SEQUENCER_URL = "https://keystore-rpc-sequencer.axiom.xyz";

// Example codehash for the User account
const EXAMPLE_USER_CODEHASH = "0x595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d9";

// Example values for the Sponsor account
const EXAMPLE_SPONSOR_CODEHASH =
  "0xa1b20564cd6cc6410266a716c9654406a15e822d4dc89c4127288da925d5c225";
const EXAMPLE_SPONSOR_DATA_HASH =
  "0xecf85bc51a8b47c545dad1a47e868276d0a92b7cf2716033ce77d385a6b67c4b";
const EXAMPLE_SPONSOR_KEYSTORE_ADDR =
  "0xb5ce21832ca3bbf53de610c6dda13d6a735b0a8ea3422aeaab678a01e298269d";
const EXAMPLE_SPONSOR_EOA = "0xD7548a3ED8c51FA30D26ff2D7Db5C33d27fd48f2";

// Accounts from test seed phrase `test test test test test test test test test test test junk`
const TEST_ACCOUNTS: { privateKey: Bytes32; address: L1Address }[] = [
  {
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  },
];

async function main() {
  const account = TEST_ACCOUNTS[0];

  // Create an m-of-n ECDSA signature prover client
  const mOfNEcdsaClient = createSignatureProverClient(MOfNEcdsaSignatureProver);

  // Get the encoded keyData and dataHash for the 1-of-1 ECDSA signature prover, with signer
  // `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`
  const keyData = mOfNEcdsaClient.keyDataEncoder({
    codehash: EXAMPLE_USER_CODEHASH,
    m: BigInt(1),
    signersList: [account.address],
  });
  const dataHash = keccak256(keyData);

  // Create node and sequencer clients which we will later use to interact with the keystore rollup
  const nodeClient = createNodeClient({ url: NODE_URL });
  const sequencerClient = createSequencerClient({ url: SEQUENCER_URL });

  // Initialize a new user keystore account from a random salt
  const userAcct = initAccountCounterfactual({
    salt: generateRandomHex(32),
    dataHash,
    vkey: mOfNEcdsaClient.vkey,
    nodeClient,
  });
  console.log("User account initialized:", userAcct);

  // Load a sponsor account from the sponsor's keystore address
  const sponsorAcct = initAccountFromAddress({
    address: EXAMPLE_SPONSOR_KEYSTORE_ADDR,
    dataHash: EXAMPLE_SPONSOR_DATA_HASH,
    vkey: mOfNEcdsaClient.vkey,
    nodeClient,
  });

  // Create a client to handle the Update transaction type, which is used to update the user
  // keystore account's data and vkey.
  const updateTx = createUpdateTransactionClient({
    nonce: await userAcct.getNonce(),
    feePerGas: await sequencerClient.gasPrice(),
    newUserData: keyData,
    newUserVkey: mOfNEcdsaClient.vkey,
    userAcct,
    sponsorAcct,
  });
  const signedTx = await updateTx.sign(account.privateKey);

  // Create the user and sponsor AuthInputs to be used in authenticating a sponsored transaction
  console.log("Authenticating sponsored transaction...");
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
  const authenticatedTx = await mOfNEcdsaClient.waitForAuthentication({ hash: authHash });

  // Send the transaction to the sequencer
  const txHash = await sequencerClient.sendRawTransaction({ data: authenticatedTx });
  console.log("Transaction authenticated. Sending to sequencer:", txHash);

  // Wait for the transaction to be finalized in L2 and included in L1
  const receipt = await sequencerClient.waitForTransactionInclusion({ hash: txHash });
  console.log("Transaction finalized in L2 and included in L1. Transaction receipt:", receipt);
}

main();
