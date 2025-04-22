import {
  createSignatureProverClient,
  initAccountCounterfactual,
  createSequencerClient,
  SignatureProverClient,
  CustomSignatureProver,
  MOfNEcdsaKeyDataFields,
  MOfNEcdsaAuthDataFields,
  MOfNEcdsaAuthInputs,
  M_OF_N_ECDSA_VKEY,
  keyDataEncoder,
  authDataEncoder,
  makeAuthInputs,
  createDepositTransactionClient,
  publicActionsL1,
  walletActionsL1,
  getL2TransactionHashes,
  createWithdrawTransactionClient,
  SEQUENCER_URL,
  M_OF_N_ECDSA_SIG_PROVER_URL,
  BRIDGE_ADDRESS,
} from "@axiom-crypto/keystore-sdk";
import { generateRandomHex } from "@axiom-crypto/keystore-sdk/utils/random";
import { createWalletClient, Hex, http, keccak256, parseEther, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";

// Codehash for EOA
const EOA_CODEHASH = "0x595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d9";

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
    codehash: (process.env.CODE_HASH ?? EOA_CODEHASH) as Hex,
  };

  const account = privateKeyToAccount(config.privateKey);

  const l1Client = createWalletClient({
    account,
    transport: http(config.l1RpcUrl),
  })
    .extend(publicActions)
    .extend(publicActionsL1())
    .extend(walletActionsL1());

  const l2Client = createSequencerClient({ url: config.l2RpcUrl });

  const MOfNSignatureProver: CustomSignatureProver<
    MOfNEcdsaKeyDataFields,
    MOfNEcdsaAuthDataFields,
    MOfNEcdsaAuthInputs
  > = {
    url: config.sigProverUrl,
    vkey: M_OF_N_ECDSA_VKEY,
    keyDataEncoder,
    authDataEncoder,
    makeAuthInputs,
  };

  // Create an m-of-n ECDSA signature prover client with default config
  const mOfNEcdsaClient: SignatureProverClient<
    MOfNEcdsaKeyDataFields,
    MOfNEcdsaAuthDataFields,
    MOfNEcdsaAuthInputs
  > = createSignatureProverClient(MOfNSignatureProver);

  // Get the encoded keyData and dataHash for the 1-of-1 ECDSA signature prover, with signer
  const keyData = mOfNEcdsaClient.keyDataEncoder({
    codehash: config.codehash,
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
  const depositTx = await createDepositTransactionClient({
    keystoreAddress: userAcct.address,
    amt: parseEther("0.01"),
  });

  // Send the deposit transaction to L1
  const l1TxHash = await l1Client.initiateL1Transaction({
    bridgeAddress: config.bridgeAddress,
    txClient: depositTx,
  });
  console.log("L1 transaction hash:", l1TxHash);

  // Fetch deposit transaction hash and receipt
  const l1TxReceipt = await l1Client.waitForTransactionReceipt({ hash: l1TxHash });
  const [l2TxHash] = getL2TransactionHashes(l1TxReceipt);
  console.log("Deposit transaction hash:", l2TxHash);

  const l2TxReceipt = await l2Client.waitForTransactionReceipt({ hash: l2TxHash });
  console.log("Deposit transaction receipt:", l2TxReceipt);

  // Create a withdraw transaction
  const withtrawTx = await createWithdrawTransactionClient({
    amt: parseEther("0.005"),
    to: account.address,
    userAcct,
    nodeClientUrl: config.l2RpcUrl,
    sequencerClientUrl: config.l2RpcUrl,
  });
  const txSignature = await withtrawTx.sign(config.privateKey);

  // Create the user AuthInputs to be used in authenticating a withdraw transaction
  console.log("Authenticating withdraw transaction...");
  const userAuthInputs = mOfNEcdsaClient.makeAuthInputs({
    codehash: config.codehash,
    signatures: [txSignature],
    signersList: [account.address],
  });

  const authHash = await mOfNEcdsaClient.authenticateTransaction({
    transaction: withtrawTx.toBytes(),
    authInputs: userAuthInputs,
  });
  const authenticatedTx = await mOfNEcdsaClient.waitForAuthentication({ hash: authHash });

  // Send the transaction to the sequencer
  const withdrawTxHash = await l2Client.sendRawTransaction({ data: authenticatedTx });
  console.log("Withdraw transaction authenticated. Sending to sequencer:", withdrawTxHash);

  // Wait for the transaction receipt
  const withdrawTxReceipt = await l2Client.waitForTransactionReceipt({ hash: withdrawTxHash });
  console.log("Withdraw transaction receipt:", withdrawTxReceipt);
}

main();
