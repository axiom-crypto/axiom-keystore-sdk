import {
  createNodeClient,
  createSignatureProverClient,
  initAccountCounterfactual,
  initAccountFromAddress,
  createUpdateTransaction,
  createSequencerClient,
} from "@axiom-crypto/keystore-sdk/src";
import { generateRandomHex } from "@axiom-crypto/keystore-sdk/src/utils/random";
import {
  MOfNEcdsaSignatureProver,
  M_OF_N_ECDSA_VKEY,
} from "@axiom-crypto/signature-prover-ecdsa/src";

const NODE_URL = "https://keystore-rpc-node.axiom.xyz";
const SEQUENCER_URL = "https://keystore-rpc-sequencer.axiom.xyz";
const ANVIL_ACCOUNTS = [
  {
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    addr: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  },
];

async function main() {
  const account = ANVIL_ACCOUNTS[0];

  const mOfNEcdsaClient = createSignatureProverClient(MOfNEcdsaSignatureProver);
  const dataHash = mOfNEcdsaClient.dataHash();

  const nodeClient = createNodeClient({ url: NODE_URL });
  const sequencerClient = createSequencerClient({ url: SEQUENCER_URL });

  const salt = generateRandomHex(32);
  const userAccount = initAccountCounterfactual({
    salt,
    dataHash,
    vkey: M_OF_N_ECDSA_VKEY,
    nodeClient,
  });
  console.log("User account initialized:", userAccount);

  const sponsorAccount = initAccountFromAddress({
    address: M_OF_N_ECDSA_ADDR,
    dataHash: M_OF_N_ECDSA_DATA_HASH,
    vkey: M_OF_N_ECDSA_VKEY,
  });
  const updateTx = createUpdateTransaction({
    nonce: await userAccount.getNonce(),
    feePerGas: await sequencerClient.gasPrice(),
    newUserData: "",
    newUserVkey: "",
    userAccount,
    sponsorAccount,
  });
  console.log("Transaction request:", updateTx);
  const signedTx = await updateTx.sign(account.privateKey);

  const userAuthInputs = "";
  const sponsorAuthInputs = "";
  const sponsoredTx = await mOfNEcdsaClient.authenticateSponsoredTransaction({
    transaction: updateTx.toBytes(),
    sponsoredAuthInputs: {
      proveSponsored: {
        userAuthInputs,
        sponsorAuthInputs,
      },
    },
  });
  const authenticatedTx = await mOfNEcdsaClient.waitForAuthentication(sponsoredTx);
  console.log("Authenticated transaction:", authenticatedTx);

  const txHash = await sequencerClient.sendRawTransaction({ transactionData: authenticatedTx });
  console.log("Transaction sent to sequencer:", txHash);

  const receipt = await sequencerClient.waitForTransactionInclusion(txHash);
  console.log("Transaction receipt:", receipt);
}

main();
