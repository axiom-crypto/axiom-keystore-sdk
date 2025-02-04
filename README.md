# Keystore SDK

## Introduction

Keystore Typescript SDK to interact with Axiom keystore rollup.

## Installation

```sh
npm install @axiom-crypto/keystore-sdk
```

## Usage

### Keystore Account

To create a new keystore account, follow these steps:

```typescript
// Initialize a counterfactual keystore account
const acct = KeystoreAccountBuilder.initCounterfactual(salt, dataHash, vkey);

// Initialize a keystore account with a known keystore address
const acct = KeystoreAccountBuilder.initWithKeystoreAddress(
  keystoreAddress,
  dataHash,
  vkey
);
```

If you already have the `keystoreAddress`, you can create the account as follows:

```typescript
const acct = KeystoreAccountBuilder.withKeystoreAddress(
  keystoreAddress,
  dataHash,
  vkey
);
```

You can calculate the `dataHash` with this method:

```typescript
const dataHash = calcDataHash(codeHash, 1n, [eoaAddress]);
```

You can use `M_OF_N_ECDSA_VKEY` as the `vkey` and `SAMPLE_USER_CODEHASH` as the `codeHash`.

### Transaction Request

A transaction request is defined as an `UpdateTransactionRequest` object. Currently, only the update transaction is supported.

```typescript
type UpdateTransactionRequest = {
  nonce: bigint;
  feePerGas: bigint;
  newUserData: Data;
  newUserVkey: Data;
  userAcct: KeystoreAccount;
  sponsorAcct?: KeystoreAccount;
};
```

To make a sponsored transaction, you must provide the `sponsorAcct`. The `AXIOM_ACCOUNT` defined in the SDK can serve as the sponsor account.

To create a transaction from a transaction request, use the `UpdateTransactionBuilder` as follows:

```typescript
const tx = UpdateTransactionBuilder.fromTransactionRequest(txReq);

// Transaction hash
tx.txHash();

// Transaction serialized as bytes
tx.txBytes();
```

### Authenticating a Transaction

To begin authenticating a transaction, start by creating the necessary authentication inputs:

```typescript
// user authentication inputs if the transaction is not sponsored
const authInputs: AuthInputs = {
  codeHash: SAMPLE_USER_CODE_HASH,
  signatures: [userSig],
  eoaAddrs: [eoaAddr],
};

// sponsor authentication inputs if the transaction is sponsored
const sponsorAuthInputs: SponsorAuthInputs = {
  sponsorAuth: AXIOM_ACCOUNT_AUTH_INPUTS,
  userAuth: {
    codeHash: SAMPLE_USER_CODE_HASH,
    signatures: [userSig],
    eoaAddrs: [eoaAddr],
  },
};
```

Next, submit the transaction bytes along with the authentication inputs to the signature prover:

```typescript
// instantiate the signature prover provider
const signatureProverProvider = new KeystoreSignatureProverProvider(
  SIGNATURE_PROVER_URL
);

// authenticate a non-sponsored transaction
const requestHash = await signatureProverProvider.authenticateTransaction(
  userTx.txBytes(),
  sponsorAuthInputs
);

// authenticate a sponsored transaction
const requestHash =
  await signatureProverProvider.sponsorAuthenticateTransaction(
    sponsoredTx.txBytes(),
    sponsorAuthInputs
  );
```

After you receive the request hash, check its status to monitor the progression of your authentication request:

```typescript
// check the authentication status of a non-sponsored transaction
const status = await signatureProverProvider.getAuthenticationStatus(
  requestHash
);

// check the authentication status of a sponsored transaction
const status = await signatureProverProvider.getSponsorAuthenticationStatus(
  requestHash
);
```

Finally, when the status indicates completion, you can retrieve and use the authenticated transaction:

```typescript
if (status.status == AuthenticationStatusEnum.Completed) {
  authenticatedTx = status.authenticatedTransaction;
}
```

### Send a Transaction

You can send an authenticated transaction to the sequencer by creating a new `KeystoreSequencerProvider` instance and invoking its `sendRawTransaction` method:

```typescript
const sequencerProvider = new KeystoreSequencerProvider(SEQUENCER_URL);

const txHash = await sequencerProvider.sendRawTransaction(authenticatedTx);
```

### Query the Chain

You can query the keystore rollup chain using the `KeystoreNodeProvider`. This provider enables you to retrieve various pieces of on-chain data, such as transaction details, receipts, blocks, and rollup state:

```typescript
const nodeProvider = new KeystoreNodeProvider(NODE_URL);

// get transaction by hash
const tx = await nodeProvider.getTransactionByHash(txHash);

// get transaction receipt by hash
const receipt = await nodeProvider.getTransactionReceipt(txHash);

// get the latest block with full transactions
const block = await nodeProvider.getBlockByNumber(BlockTag.Latest, BlockTransactionsKind.Full);

// get account state
const accountState = await nodeProvider.getStateAt(
  keystoreAddress,
  BlockTag.Latest
);
```

## Examples

For a complete demonstration, take a look at our [example](./example/src/index.ts).
