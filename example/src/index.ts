import {
  createNodeClient,
  createSignatureProverClient,
  initAccountCounterfactual,
  initAccountFromAddress,
  createUpdateTransaction,
} from "@axiom-crypto/keystore-sdk/src";
import {
  MOfNEcdsaSignatureProver,
  M_OF_N_ECDSA_VKEY,
} from "@axiom-crypto/signature-prover-ecdsa/src";
import { pad } from "viem";

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

  const salt = pad("0x00", { size: 32 });
  const userAccount = initAccountCounterfactual({
    salt,
    dataHash,
    vkey: M_OF_N_ECDSA_VKEY,
    nodeClient,
  });
  const sponsorAccount = initAccountFromAddress({
    address: ECDSA_ADDR,
    dataHash: ECDSA_DATA_HASH,
    vkey: M_OF_N_ECDSA_VKEY,
  });
  const updateTx = createUpdateTransaction({
    nonce: await userAccount.getNonce(),
    feePerGas: await nodeClient.gasPrice(),
    newUserData: "",
    newUserVkey: "",
    userAccount,
    sponsorAccount,
  });
  const signedTx = await mOfNEcdsaClient.signTransaction(updateTx);

  const userAuthInputs = "";
  const sponsoredTx = await mOfNEcdsaClient.authenticateSponsoredTransaction({
    transaction: updateTx.toBytes(),
    sponsoredAuthInputs: {
      proveSponsored: {
        userAuthInputs,
        sponsorAuthInputs,
      },
    },
  });
  const receipt = await mOfNEcdsaClient.waitForTransactionReceipt(sponsoredTx);
  console.log("Transaction receipt:", receipt);
}

main();
