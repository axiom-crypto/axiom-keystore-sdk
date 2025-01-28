import { describe, test, expect } from '@jest/globals';
import { KeystoreNodeProvider } from "../src/provider";
import { BlockTag } from "../src/types/block";
import { GetTransactionReceiptResponse } from "../src/types/response";
import { TransactionStatus } from "../src/types/transaction";
import { AXIOM_ACCOUNT_ADDRESS, EMPTY_HEX, EXISTING_BLOCK_HASH, EXISTING_TX_HASH, NODE_URL, NON_EXISTENT_BLOCK_HASH, NON_EXISTENT_TX_HASH, NON_EXISTING_ACCOUNT_ADDRESS, ZERO_BYTES32 } from './testUtils';

describe('keystore node provider', () => {
  let provider: KeystoreNodeProvider;

  beforeEach(() => {
    provider = new KeystoreNodeProvider(NODE_URL);
  });

  test('keystore_syncStatus', async () => {
    const resp = await provider.syncStatus();
    expect(resp.committedL2).toBeDefined();
    expect(resp.finalizedL2).toBeDefined();
  });

  test('keystore_blockNumber', async () => {
    await provider.getBlockNumber();
  });

  test('keystore_getBalance', async () => {
    const balance1 = await provider.getBalance(AXIOM_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(BigInt(balance1)).toBeGreaterThan(0n);

    const balance2 = await provider.getBalance(NON_EXISTING_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(BigInt(balance2)).toBe(0n);
  });

  test('keystore_getStateAt', async () => {
    const res1 = await provider.getStateAt(AXIOM_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(res1.dataHash).not.toBe(ZERO_BYTES32);
    expect(res1.vkeyHash).not.toBe(ZERO_BYTES32);
    expect(res1.data).not.toBe(EMPTY_HEX);
    expect(res1.vkey).not.toBe(EMPTY_HEX);

    const res2 = await provider.getStateAt(NON_EXISTING_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(res2.dataHash).toBe(ZERO_BYTES32);
    expect(res2.vkeyHash).toBe(ZERO_BYTES32);
    expect(res2.data).toBe(EMPTY_HEX);
    expect(res2.vkey).toBe(EMPTY_HEX);
  });

  test('keystore_getTransactionCount', async () => {
    const nonce1 = await provider.getTransactionCount(AXIOM_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(BigInt(nonce1)).toBeGreaterThan(0n);

    const nonce2 = await provider.getTransactionCount(NON_EXISTING_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(BigInt(nonce2)).toBe(0n);
  });

  test('keystore_getProof', async () => {
    const getProofResp1 = await provider.getProof(AXIOM_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(getProofResp1.proof.isExclusionProof).toBe(false);

    const getProofResp2 = await provider.getProof(NON_EXISTING_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(getProofResp2.proof.isExclusionProof).toBe(true);
  });

  test('keystore_getTransactionByHash', async () => {
    const tx = await provider.getTransactionByHash(EXISTING_TX_HASH);
    expect(tx.hash).toBe(EXISTING_TX_HASH);

    await expect(provider.getTransactionByHash(NON_EXISTENT_TX_HASH))
      .rejects.toThrow();
  });

  test('keystore_getTransactionReceipt', async () => {
    const receipt: GetTransactionReceiptResponse = await provider.getTransactionReceipt(EXISTING_TX_HASH);
    expect(receipt.status).toBe(TransactionStatus.L2FinalizedL1Included);

    await expect(provider.getTransactionReceipt(NON_EXISTENT_TX_HASH)).rejects.toThrow();
  });

  test('keystore_getBlockNumberByStateRoot', async () => {
    const block = await provider.getBlockByNumber(BlockTag.Latest, false);
    const blockNumber = await provider.getBlockNumberByStateRoot(block.stateRoot);
    expect(blockNumber).toBe(block.number);
  });

  test('keystore_getBlockByNumber', async () => {
    await provider.getBlockByNumber(BlockTag.Latest, false);
    await provider.getBlockByNumber(BlockTag.Latest, true);

    await provider.getBlockByNumber(BlockTag.Committed, false);

    await provider.getBlockByNumber(BlockTag.Finalized, false);

    await provider.getBlockByNumber(BlockTag.Earliest, false);
  });

  test('keystore_getBlockByHash', async () => {
    await provider.getBlockByHash(EXISTING_BLOCK_HASH, false);

    await provider.getBlockByHash(EXISTING_BLOCK_HASH, true);

    await expect(provider.getBlockByHash(NON_EXISTENT_BLOCK_HASH, false))
      .rejects.toThrow();
  });
});
