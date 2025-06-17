import {
  createSignatureProverClient,
  initAccountCounterfactual,
  createSequencerClient,
  SignatureProverClient,
  MOfNEcdsaKeyDataFields,
  MOfNEcdsaAuthDataFields,
  MOfNEcdsaAuthInputs,
  createDepositTransactionRequestClient,
  publicActionsL1,
  walletActionsL1,
  getL2TransactionHashes,
  createWithdrawTransactionRequestClient,
  SEQUENCER_URL,
  M_OF_N_ECDSA_SIG_PROVER_URL,
  BRIDGE_ADDRESS,
  MOfNSignatureProver,
} from "@axiom-crypto/keystore-sdk";
import { generateRandomHex } from "@axiom-crypto/keystore-sdk/utils/random";
import { createWalletClient, Hex, http, keccak256, parseEther, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";

// Example codehash for the User account
const EXAMPLE_USER_CODEHASH = "0x0b2f6abb18102fa8a316ceda8a3f73b5eab33bb790d5bd92ff3995a9364adf97";

// Account from test seed phrase `test test test test test test test test test test test junk`
const TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const ANVIL_URL = "http://localhost:8545";

async function main() {
  const config = {
    privateKey: (process.env.PRIVATE_KEY ?? TEST_PRIVATE_KEY) as Hex,
    l1RpcUrl: process.env.L1_RPC_URL ?? ANVIL_URL,
    l2RpcUrl: process.env.L2_RPC_URL ?? SEQUENCER_URL,
    sigProverUrl: process.env.SIG_PROVER_URL ?? M_OF_N_ECDSA_SIG_PROVER_URL,
    bridgeAddress: process.env.BRIDGE_ADDRESS ?? BRIDGE_ADDRESS,
    userCodehash: (process.env.USER_CODEHASH ?? EXAMPLE_USER_CODEHASH) as Hex,
  };
  console.log("Using config:", config);

  const account = privateKeyToAccount(config.privateKey);

  const l1Client = createWalletClient({
    account,
    transport: http(config.l1RpcUrl),
  })
    .extend(publicActions)
    .extend(publicActionsL1())
    .extend(walletActionsL1());

  const l2Client = createSequencerClient({ url: config.l2RpcUrl });

  // Create an m-of-n ECDSA signature prover client with default config
  const mOfNEcdsaClient: SignatureProverClient<
    MOfNEcdsaKeyDataFields,
    MOfNEcdsaAuthDataFields,
    MOfNEcdsaAuthInputs
  > = createSignatureProverClient({ url: config.sigProverUrl, ...MOfNSignatureProver });

  // Get the encoded keyData and dataHash for the 1-of-1 ECDSA signature prover, with signer
  const keyData = mOfNEcdsaClient.keyDataEncoder({
    codehash: config.userCodehash,
    m: BigInt(1),
    signersList: [account.address],
  });
  const dataHash = keccak256(keyData);

  // Initialize a new user keystore account from a random salt
  const userAcct = initAccountCounterfactual({
    salt: generateRandomHex(32),
    dataHash,
    vkey: mOfNEcdsaClient.vkey,
  });
  console.log("User account initialized:", userAcct);

  // Create a deposit transaction
  const depositTx = await createDepositTransactionRequestClient({
    keystoreAddress: userAcct.address,
    amt: parseEther("0.01"),
  });

  // Send the deposit transaction to L1
  const depositL1TxHash = await l1Client.initiateL1Transaction({
    bridgeAddress: config.bridgeAddress as `0x${string}`,
    txRequestClient: depositTx,
  });
  console.log("L1 transaction hash:", depositL1TxHash);

  // Fetch deposit transaction hash and receipt
  const l1TxReceipt = await l1Client.waitForTransactionReceipt({ hash: depositL1TxHash });
  const [depositL2TxHash] = getL2TransactionHashes(l1TxReceipt);
  console.log("Deposit transaction hash:", depositL2TxHash);

  console.log("Waiting for deposit transaction receipt on Keystore (L2)");

  const l2TxReceipt = await l2Client.waitForTransactionReceipt({ hash: depositL2TxHash });
  console.log("Deposit transaction receipt:", l2TxReceipt);

  // Create a withdraw transaction
  const withdrawTx = await createWithdrawTransactionRequestClient({
    amt: parseEther("0.005"),
    to: account.address,
    userAcct,
    nodeClientUrl: config.l2RpcUrl,
    sequencerClientUrl: config.l2RpcUrl,
  });
  const txSignature = await withdrawTx.sign(config.privateKey);

  // Create the user AuthInputs to be used in authenticating a withdraw transaction
  console.log("Authenticating withdraw transaction...");
  const userAuthInputs = mOfNEcdsaClient.makeAuthInputs({
    codehash: config.userCodehash,
    signatures: [txSignature],
    signersList: [account.address],
  });

  const authHash = await mOfNEcdsaClient.authenticateTransaction({
    transaction: withdrawTx.rawSequencerTransaction(),
    authInputs: userAuthInputs,
  });
  const authenticatedTx = await mOfNEcdsaClient.waitForAuthentication({ hash: authHash });

  // Send the transaction to the sequencer
  const withdrawTxHash = await l2Client.sendRawTransaction({ data: authenticatedTx });
  console.log("Withdraw transaction authenticated. Sending to sequencer:", withdrawTxHash);

  // Wait for the transaction receipt
  const withdrawTxReceipt = await l2Client.waitForTransactionReceipt({ hash: withdrawTxHash });
  console.log("Withdraw transaction receipt:", withdrawTxReceipt);

  // Finalize the withdrawal on the L1 bridge
  await l2Client.waitForTransactionFinalization({ hash: withdrawTxHash });
  const finalizationArgs = await l2Client.buildFinalizeWithdrawalArgs({
    transactionHash: withdrawTxHash,
  });
  const finalizeWithdrawalL1TxHash = await l1Client.finalizeWithdrawal({
    bridgeAddress: config.bridgeAddress as `0x${string}`,
    ...finalizationArgs,
  });
  console.log("Withdrawal finalized on L1. L1 transaction hash:", finalizeWithdrawalL1TxHash);
}

main();
