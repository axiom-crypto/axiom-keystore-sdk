import { generateRandomHex } from "@axiom-crypto/keystore-sdk/src/utils/random";
import { AXIOM_ACCOUNT, AXIOM_ACCOUNT_AUTH_INPUTS, AXIOM_VKEY, AuthenticationStatusEnum, BlockTag, KeystoreAccountBuilder, KeystoreNodeProvider, KeystoreSequencerProvider, KeystoreSignatureProverProvider, SAMPLE_USER_CODE_HASH, SponsorAuthInputs, TransactionStatus, UpdateTransactionBuilder, UpdateTransactionRequest, calcDataHash, ecdsaSign } from "@axiom-crypto/keystore-sdk/src";
import { Hex, stringToHex } from "viem";

export const NODE_URL = "http://keystore-rpc-node.axiom.xyz";
export const SIGNATURE_PROVER_URL = "http://keystore-rpc-signatureprover.axiom.xyz";
export const SEQUENCER_URL = "http://keystore-rpc-sequencer.axiom.xyz";

const RETRY_INTERVAL_SEC = 20;
const MAX_RETRIES = 10;

async function main() {
  // anvil keys
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const eoaAddr = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

  const salt = generateRandomHex(32);
  const dataHash = calcDataHash(SAMPLE_USER_CODE_HASH, 1n, [eoaAddr]);
  const userAcct = KeystoreAccountBuilder.initCounterfactual(salt, dataHash, AXIOM_VKEY);
  console.log("User account:", userAcct);

  const nodeProvider = new KeystoreNodeProvider(NODE_URL);
  const nonce = await nodeProvider.getTransactionCount(userAcct.keystoreAddress, BlockTag.Latest);

  const sequencerProvider = new KeystoreSequencerProvider(SEQUENCER_URL);
  const feePerGas = await sequencerProvider.gasPrice();

  const txReq: UpdateTransactionRequest = {
    nonce,
    feePerGas,
    newUserData: stringToHex("newUserData"), // placeholder
    newUserVkey: AXIOM_VKEY,
    userAcct,
    sponsorAcct: AXIOM_ACCOUNT,
  };
  console.log("Transaction request:", txReq);
  const updateTx = UpdateTransactionBuilder.fromTransactionRequest(txReq);
  const userSig: Hex = await ecdsaSign(privateKey, updateTx.userMsgHash());

  const sponsorAuthInputs: SponsorAuthInputs = {
    sponsorAuth: AXIOM_ACCOUNT_AUTH_INPUTS,
    userAuth: {
      codeHash: SAMPLE_USER_CODE_HASH,
      signatures: [userSig],
      eoaAddrs: [eoaAddr]
    }
  };

  console.log("Sending sponsor authentication request to signature prover");

  const signatureProverProvider = new KeystoreSignatureProverProvider(SIGNATURE_PROVER_URL);
  const requestHash = await signatureProverProvider.sponsorAuthenticateTransaction(updateTx.txBytes(), sponsorAuthInputs);

  console.log("Request hash:", requestHash);
  console.log("Waiting for sponsor authentication to complete. This may take several minutes...");

  // polls the request status until it's completed
  const authenticatedTx = await (async () => {
    while (true) {
      const status = await signatureProverProvider.getSponsorAuthenticationStatus(requestHash);
      console.log("Sponsor authentication status:", status.status);
      switch (status.status) {
        case AuthenticationStatusEnum.Pending:
          await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL_SEC * 1000));
          continue;
        case AuthenticationStatusEnum.Failed:
          throw new Error("Transaction authentication failed");
        case AuthenticationStatusEnum.Completed:
          if (!status.authenticatedTransaction) {
            throw new Error("No authenticated transaction found");
          }
          console.log("Sponsor authentication completed");
          return status.authenticatedTransaction;
        default:
          throw new Error("Invalid authentication status");
      }
    }
  })();

  console.log("Sending transaction to sequencer");
  const txHash = await sequencerProvider.sendRawTransaction(authenticatedTx);
  console.log("Transaction sent to sequencer", txHash);

  let currentStatus = "";

  // polls the transaction receipt until it's finalized
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const receipt = await nodeProvider.getTransactionReceipt(txHash);
      if (receipt.status !== currentStatus) {
        currentStatus = receipt.status;
        console.log("Transaction receipt:", receipt);
      }
      if (currentStatus === TransactionStatus.L2FinalizedL1Included) {
        console.log("Success: transaction finalized!");
        return;
      }
      console.log(`Checking transaction status again in ${RETRY_INTERVAL_SEC} seconds`);
    } catch (err) {
      console.log("Transaction not yet included in block");
    }
    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL_SEC * 1000));
  }
  console.log(`Transaction not finalized in ${MAX_RETRIES * RETRY_INTERVAL_SEC} seconds`);
}

main()