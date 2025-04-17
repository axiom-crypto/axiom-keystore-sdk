# Keystore SDK

## Introduction

Keystore Typescript SDK to interact with Axiom keystore rollup.

## Installation

```sh
npm install @axiom-crypto/keystore-sdk
```

## Usage

### Selecting a Signature Prover Client

You can create your own authentication rule and signature prover infrastructure, or you can use one that's already built. The Keystore SDK can accept a custom authentication rule component that
conforms to the `CustomSignatureProver` interface.

To use a specific signature prover client (m-of-n ECDSA in this example), you can use:

```typescript
import { MOfNEcdsaSignatureProver } from "@axiom-crypto/signature-prover-ecdsa";
const mOfNEcdsaClient = createSignatureProverClient(MOfNEcdsaSignatureProver);
```

#### Creating a Custom Signature Prover Client

You can create a custom signature prover client by extending `CustomSignatureProver` with 3 generic types that correspond to the fields in your custom authentication rule for `keyData`, `authData`, and `AuthInputs`. You can see the [m-of-n ECDSA Signature Prover Keystore SDK component example here](https://github.com/axiom-crypto/signature-prover-ecdsa/).

### Keystore Account

To initialize a new keystore account, you'll need to pass in the keccak256 hashed keyData (`dataHash`) and verifying key (`vkey`) from your desired Signature Prover. In both cases, you can also pass in an optional `NodeClient` for additional functionality.

```typescript
// Create a new NodeClient for querying the keystore rollup
const nodeClient = createNodeClient({ url: NODE_URL });

// Counterfactual account initialization
const acct = initAccountCounterfactual({ salt, dataHash, vkey, nodeClient });
```

Alterntaively, you can also initialize a keystore account with a known keystore address (32 bytes). You'll pass in the address instead of salt, along with the dataHash and vkey as before.

```typescript
// Initializing an account with a known address (you still need to pass in the `dataHash` and `vkey`)
const acct = initAccountFromAddress({ address, dataHash, vkey, nodeClient });
```

You can calculate the `dataHash` with the following signature prover client method:

```typescript
// Encoding the `keyData` for m-of-n ECDSA signature prover and then hashing it to get the `dataHash`
const keyData = mOfNEcdsaClient.keyDataEncoder({
  codehash: EXAMPLE_USER_CODEHASH,
  m: BigInt(1),
  signersList: [account.address],
});
const dataHash = keccak256(keyData);
```

You can use `M_OF_N_ECDSA_VKEY` as the `vkey` and `SAMPLE_USER_CODEHASH` as the `codeHash`.

### Transaction Request

Currently, only the `Update` transaction is supported.

#### Deposit

Unsupported; coming soon.

#### Withdraw

Unsupported; coming soon.

#### Update

To create a client for the `Update` transaction type, you can use the `createUpdateTransactionClient` function. In addition to the user keystore account we created earlier, we'll be providing an optional Sponsor Account that will be sponsoring the `Update` transaction on the keystore rollup.

```typescript
const sponsorAcct = initAccountFromAddress({
  address: AXIOM_SPONSOR_KEYSTORE_ADDR,
  dataHash: AXIOM_SPONSOR_DATA_HASH,
  vkey: mOfNEcdsaClient.vkey,
  nodeClient,
});
const updateTx = await createUpdateTransactionClient({
  newUserData: keyData,
  newUserVkey: mOfNEcdsaClient.vkey,
  userAcct,
  sponsorAcct,
});
```

We'll then go ahead and sign the transaction with our account's private key:

```typescript
const txSignature = await updateTx.sign(account.privateKey);
```

### Authenticating a Transaction

Once we've signed the transaction, we'll need to use the signature prover client to generate both the user and sponsor `AuthInputs` structs that can be passed into the signature prover client's `authenticateSponsoredTransaction` function.

```typescript
// Make user and sponsor auth inputs for the m-of-n ECDSA signature prover
const userAuthInputs = mOfNEcdsaClient.makeAuthInputs({
  codehash: EXAMPLE_USER_CODEHASH,
  signatures: [txSignature],
  signersList: [account.address],
});
const sponsorAuthInputs = mOfNEcdsaClient.makeAuthInputs({
  codehash: AXIOM_SPONSOR_CODEHASH,
  signatures: [],
  signersList: [AXIOM_SPONSOR_EOA],
});

// Send authentication data to the signature prover
const authHash = await mOfNEcdsaClient.authenticateSponsoredTransaction({
  transaction: updateTx.toBytes(),
  sponsoredAuthInputs: {
    userAuthInputs,
    sponsorAuthInputs,
  },
});

// Wait for authentication (may take several minutes)
const authenticatedTx = await mOfNEcdsaClient.waitForSponsoredAuthentication({ hash: authHash });
```

### Send a Transaction

You can send an authenticated transaction to the sequencer by creating a SequencerClient and using the `sendRawTransaction` function with the authenticated transaction from the previous section. You can then call the `waitForTransactionInclusion` function to fulfill when the transaction has been finalized on L2 and included on L1.

```typescript
// Create a SequencerClient
const sequencerClient = createSequencerClient({ url: SEQUENCER_URL });

// Send the transaction to the sequencer
const txHash = await sequencerClient.sendRawTransaction({ data: authenticatedTx });

// Wait for the transaction to be finalized on L2 and included on L1
const receipt = await sequencerClient.waitForTransactionInclusion({ hash: txHash });
```

### Query the Chain

You can query the keystore rollup chain using the `KeystoreNodeProvider`. This provider enables you to retrieve various pieces of on-chain data, such as transaction details, receipts, blocks, and rollup state:

```typescript
const nodeClient = createNodeClient({ url: NODE_URL });

// get transaction by hash
const tx = await nodeClient.getTransactionByHash({ hash });

// get transaction receipt by hash
const receipt = await nodeClient.getTransactionReceipt({ hash });

// get the latest block with full transactions
const block = await nodeClient.getBlockByNumber({
  block: BlockTag.Latest,
  txKind: BlockTransactionsKind.Full,
});

// get account state
const accountState = await nodeClient.getStateAt({
  address: keystoreAddress,
  block: BlockTag.Latest,
});
```

## Examples

For a complete demonstration, take a look at our [node.js script example](./example/src/index.ts) or [React example](https://github.com/axiom-crypto/example-keystore-web).
