import { pad } from "viem";
import { KeystoreNodeProvider } from "../src/provider";
import { BlockTag } from "../src/types/block";
import { GetTransactionReceiptResponse } from "../src/types/response";
import { TransactionStatus } from "../src/types/transaction";

const NODE_URL = "http://keystore-node-271cd8fbf8aac2f5.elb.us-east-1.amazonaws.com:80";

const AXIOM_ACCOUNT_ADDRESS = "0xc3a9b82816196f3f5692dda37ee242839ce86357dc06a205ce04da56a3651e06";
const NON_EXISTING_ACCOUNT_ADDRESS = "0x1111111111111111111111111111111111111111111111111111111111111111";

const EXISTING_TX_HASH = "0x3e9fe5542eda9ea70da8f12141f19629f281ef92f2458188b1c206e13c2430cc";
const NON_EXISTENT_TX_HASH = "0x1111111111111111111111111111111111111111111111111111111111111111";

const EXISTING_BLOCK_HASH = "0x8e776eeb4e25cfe8d84803c37d0e9349e472d44945fe9a36b46993e423957c0c";
const NON_EXISTENT_BLOCK_HASH = "0x1111111111111111111111111111111111111111111111111111111111111111";

describe('keystore node provider', () => {
  let provider: KeystoreNodeProvider;

  beforeEach(() => {
    provider = new KeystoreNodeProvider(NODE_URL);
  });

  test('keystore_syncStatus', async () => {
    let resp = await provider.syncStatus();
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
    const emptyHex = "0x";
    const zeroBytes32 = pad("0x", { size: 32 });

    const res1 = await provider.getStateAt(AXIOM_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(res1.dataHash).not.toBe(zeroBytes32);
    expect(res1.vkeyHash).not.toBe(zeroBytes32);
    expect(res1.data).not.toBe(emptyHex);
    expect(res1.vkey).not.toBe(emptyHex);

    const res2 = await provider.getStateAt(NON_EXISTING_ACCOUNT_ADDRESS, BlockTag.Latest);
    expect(res2.dataHash).toBe(zeroBytes32);
    expect(res2.vkeyHash).toBe(zeroBytes32);
    expect(res2.data).toBe(emptyHex);
    expect(res2.vkey).toBe(emptyHex);
  });

  test('keystore_getTransactionCount', async () => {
    let nonce1 = await provider.getTransactionCount(AXIOM_ACCOUNT_ADDRESS, BlockTag.Latest);
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
    let tx = await provider.getTransactionByHash(EXISTING_TX_HASH);
    expect(tx.hash).toBe(EXISTING_TX_HASH);

    await expect(provider.getTransactionByHash(NON_EXISTENT_TX_HASH))
      .rejects.toThrow();
  });

  test('keystore_getTransactionReceipt', async () => {
    let receipt: GetTransactionReceiptResponse = await provider.getTransactionReceipt(EXISTING_TX_HASH);
    expect(receipt.status).toBe(TransactionStatus.L2FinalizedL1Included);

    await expect(provider.getTransactionReceipt(NON_EXISTENT_TX_HASH)).rejects.toThrow();
  });

  test('keystore_getBlockNumberByStateRoot', async () => {
    let block = await provider.getBlockByNumber(BlockTag.Latest, false);
    let blockNumber = await provider.getBlockNumberByStateRoot(block.stateRoot);
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
