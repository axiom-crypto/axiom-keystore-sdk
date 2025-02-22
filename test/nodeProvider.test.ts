import { describe, test, expect } from "@jest/globals";
import { KeystoreNodeProvider } from "../src/provider";
import { BlockTag, BlockTransactionsKind } from "../src/types/block";
import { GetTransactionReceiptResponse } from "../src/types/response";
import { TransactionStatus, UpdateTransaction } from "../src/types/transaction";
import {
  EMPTY_HEX,
  EXISTING_BLOCK_HASH,
  NON_SPONSORED_UPDATE_TX_HASH,
  NODE_URL,
  NON_EXISTENT_BLOCK_HASH,
  NON_EXISTENT_TX_HASH,
  NON_EXISTING_ACCOUNT_ADDRESS,
  ZERO_BYTES32,
  SPONSORED_UPDATE_TX_HASH,
  TEST_TX_REQ,
} from "./testUtils";
import { AXIOM_KEYSTORE_ADDRESS, UpdateTransactionBuilder } from "../src";

describe("keystore node provider", () => {
  let provider: KeystoreNodeProvider;

  beforeEach(() => {
    provider = new KeystoreNodeProvider(NODE_URL);
  });

  test("keystore_syncStatus", async () => {
    const resp = await provider.syncStatus();
    expect(resp.committedL2).toBeDefined();
    expect(resp.finalizedL2).toBeDefined();
  });

  test("keystore_blockNumber", async () => {
    const resp = await provider.blockNumber();
    expect(typeof resp).toBe("bigint");
  });

  test("keystore_getBalance", async () => {
    const balance1 = await provider.getBalance(
      AXIOM_KEYSTORE_ADDRESS,
      BlockTag.Latest,
    );
    expect(balance1).toBeGreaterThan(0n);

    const balance2 = await provider.getBalance(
      NON_EXISTING_ACCOUNT_ADDRESS,
      BlockTag.Latest,
    );
    expect(balance2).toBe(0n);
  });

  test("keystore_getStateAt", async () => {
    const res1 = await provider.getStateAt(
      AXIOM_KEYSTORE_ADDRESS,
      BlockTag.Latest,
    );
    expect(res1.dataHash).not.toBe(ZERO_BYTES32);
    expect(res1.vkeyHash).not.toBe(ZERO_BYTES32);
    expect(res1.data).not.toBe(EMPTY_HEX);
    expect(res1.vkey).not.toBe(EMPTY_HEX);

    const res2 = await provider.getStateAt(
      NON_EXISTING_ACCOUNT_ADDRESS,
      BlockTag.Latest,
    );
    expect(res2.dataHash).toBe(ZERO_BYTES32);
    expect(res2.vkeyHash).toBe(ZERO_BYTES32);
    expect(res2.data).toBe(EMPTY_HEX);
    expect(res2.vkey).toBe(EMPTY_HEX);
  });

  test("keystore_getTransactionCount", async () => {
    const nonce1 = await provider.getTransactionCount(
      AXIOM_KEYSTORE_ADDRESS,
      BlockTag.Latest,
    );
    expect(nonce1).toBeGreaterThan(0n);

    const nonce2 = await provider.getTransactionCount(
      NON_EXISTING_ACCOUNT_ADDRESS,
      BlockTag.Latest,
    );
    expect(nonce2).toBe(0n);
  });

  test("keystore_getProof", async () => {
    const getProofResp1 = await provider.getProof(
      AXIOM_KEYSTORE_ADDRESS,
      BlockTag.Latest,
    );
    expect(getProofResp1.proof.isExclusionProof).toBe(false);

    const getProofResp2 = await provider.getProof(
      NON_EXISTING_ACCOUNT_ADDRESS,
      BlockTag.Latest,
    );
    expect(getProofResp2.proof.isExclusionProof).toBe(true);
  });

  test("keystore_getTransactionByHash", async () => {
    const tx1 = (await provider.getTransactionByHash(
      NON_SPONSORED_UPDATE_TX_HASH,
    )) as UpdateTransaction;
    expect(tx1.hash).toBe(NON_SPONSORED_UPDATE_TX_HASH);
    expect(tx1.sponsorAcct).toBeUndefined();
    expect(tx1.sponsorProof).toBeUndefined();

    const tx2 = (await provider.getTransactionByHash(
      SPONSORED_UPDATE_TX_HASH,
    )) as UpdateTransaction;
    expect(tx2.hash).toBe(SPONSORED_UPDATE_TX_HASH);
    expect(tx2.sponsorAcct).toBeDefined();
    expect(tx2.sponsorProof).toBeDefined();

    await expect(
      provider.getTransactionByHash(NON_EXISTENT_TX_HASH),
    ).rejects.toThrow();
  });

  test("keystore_getTransactionReceipt", async () => {
    const receipt: GetTransactionReceiptResponse =
      await provider.getTransactionReceipt(NON_SPONSORED_UPDATE_TX_HASH);
    expect(receipt.status).toBe(TransactionStatus.L2FinalizedL1Included);

    await expect(
      provider.getTransactionReceipt(NON_EXISTENT_TX_HASH),
    ).rejects.toThrow();
  });

  test("keystore_getBlockNumberByStateRoot", async () => {
    const block = await provider.getBlockByNumber(
      BlockTag.Latest,
      BlockTransactionsKind.Hashes,
    );
    const blockNumber = await provider.getBlockNumberByStateRoot(
      block.stateRoot,
    );
    expect(blockNumber).toBe(block.number);
  });

  test("keystore_getBlockByNumber", async () => {
    const block1 = await provider.getBlockByNumber(
      BlockTag.Latest,
      BlockTransactionsKind.Full,
    );
    expect(typeof block1.number).toBe("bigint");
    expect(block1.transactions).toBeDefined();
    expect(block1.transactions).not.toHaveLength(0);
    expect(typeof block1.transactions![0]).not.toBe("string");

    const block2 = await provider.getBlockByNumber(
      BlockTag.Latest,
      BlockTransactionsKind.Hashes,
    );
    expect(block2.transactions).toBeDefined();
    expect(block2.transactions).not.toHaveLength(0);
    expect(typeof block2.transactions![0]).toBe("string");

    await provider.getBlockByNumber(
      BlockTag.Committed,
      BlockTransactionsKind.Hashes,
    );

    await provider.getBlockByNumber(
      BlockTag.Finalized,
      BlockTransactionsKind.Hashes,
    );

    await provider.getBlockByNumber(
      BlockTag.Earliest,
      BlockTransactionsKind.Hashes,
    );

    await provider.getBlockByNumber(1n, BlockTransactionsKind.Hashes);

    await provider.getBlockByNumber(0n, BlockTransactionsKind.Hashes);
  });

  test("keystore_getBlockByHash", async () => {
    await provider.getBlockByHash(
      EXISTING_BLOCK_HASH,
      BlockTransactionsKind.Hashes,
    );

    await provider.getBlockByHash(
      EXISTING_BLOCK_HASH,
      BlockTransactionsKind.Full,
    );

    await expect(
      provider.getBlockByHash(
        NON_EXISTENT_BLOCK_HASH,
        BlockTransactionsKind.Hashes,
      ),
    ).rejects.toThrow();
  });

  test("keystore_call", async () => {
    const tx = UpdateTransactionBuilder.fromTransactionRequest(TEST_TX_REQ);
    await provider.call(tx.txBytes(), BlockTag.Latest);
  });
});
