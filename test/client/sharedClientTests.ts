import {
  BlockTag,
  BlockTransactionsKind,
  createUpdateTransactionClient,
  GetTransactionReceiptResponse,
  NodeClient,
  TransactionStatus,
  UpdateTransaction,
} from "../../src";
import {
  EMPTY_HEX,
  EXISTING_BLOCK_HASH,
  EXAMPLE_SPONSOR_ADDRESS,
  NON_EXISTENT_BLOCK_HASH,
  NON_EXISTENT_TX_HASH,
  NON_EXISTING_ACCOUNT_ADDRESS,
  NON_SPONSORED_UPDATE_TX_HASH,
  SPONSORED_UPDATE_TX_HASH,
  TEST_TX_REQ,
  ZERO_BYTES32,
} from "../testUtils";

export function runNodeClientTests(client: NodeClient) {
  test("keystore_syncStatus", async () => {
    const resp = await client.syncStatus();
    expect(resp.committedL2).toBeDefined();
    expect(resp.finalizedL2).toBeDefined();
  });

  test("keystore_blockNumber", async () => {
    const resp = await client.blockNumber();
    console.log(resp);
    expect(typeof resp).toBe("bigint");
  });

  test("keystore_getBalance", async () => {
    const balance1 = await client.getBalance({
      address: EXAMPLE_SPONSOR_ADDRESS,
      block: BlockTag.Latest,
    });
    expect(balance1).toBeGreaterThan(0n);

    const balance2 = await client.getBalance({
      address: EXAMPLE_SPONSOR_ADDRESS,
    });
    expect(balance2).toBeGreaterThan(0n);

    const balance3 = await client.getBalance({
      address: NON_EXISTING_ACCOUNT_ADDRESS,
      block: BlockTag.Latest,
    });
    expect(balance3).toBe(0n);
  });

  test("keystore_getStateAt", async () => {
    const res1 = await client.getStateAt({
      address: EXAMPLE_SPONSOR_ADDRESS,
      block: BlockTag.Latest,
    });
    expect(res1.dataHash).not.toBe(ZERO_BYTES32);
    expect(res1.vkeyHash).not.toBe(ZERO_BYTES32);
    expect(res1.data).not.toBe(EMPTY_HEX);
    expect(res1.vkey).not.toBe(EMPTY_HEX);

    const res2 = await client.getStateAt({
      address: NON_EXISTING_ACCOUNT_ADDRESS,
      block: BlockTag.Latest,
    });
    expect(res2.dataHash).toBe(ZERO_BYTES32);
    expect(res2.vkeyHash).toBe(ZERO_BYTES32);
    expect(res2.data).toBe(EMPTY_HEX);
    expect(res2.vkey).toBe(EMPTY_HEX);
  });

  test("keystore_getTransactionCount", async () => {
    const nonce1 = await client.getTransactionCount({
      address: EXAMPLE_SPONSOR_ADDRESS,
      block: BlockTag.Latest,
    });
    expect(nonce1).toBeGreaterThan(0n);

    const nonce2 = await client.getTransactionCount({
      address: NON_EXISTING_ACCOUNT_ADDRESS,
    });
    expect(nonce2).toBe(0n);
  });

  test("keystore_getProof", async () => {
    const getProofResp1 = await client.getProof({
      address: EXAMPLE_SPONSOR_ADDRESS,
      block: BlockTag.Latest,
    });
    expect(getProofResp1.proof.isExclusionProof).toBe(false);

    const getProofResp2 = await client.getProof({
      address: NON_EXISTING_ACCOUNT_ADDRESS,
      block: BlockTag.Latest,
    });
    expect(getProofResp2.proof.isExclusionProof).toBe(true);
  });

  test("keystore_call", async () => {
    const tx = await createUpdateTransactionClient(TEST_TX_REQ);
    await client.call({
      transaction: tx.toBytes(),
      block: BlockTag.Latest,
    });
  });

  test("keystore_getTransactionByHash", async () => {
    const tx1 = (await client.getTransactionByHash({
      hash: NON_SPONSORED_UPDATE_TX_HASH,
    })) as UpdateTransaction;
    expect(tx1.hash).toBe(NON_SPONSORED_UPDATE_TX_HASH);
    expect(tx1.sponsorAcct).toBeUndefined();
    expect(tx1.sponsorProof).toBeUndefined();

    const tx2 = (await client.getTransactionByHash({
      hash: SPONSORED_UPDATE_TX_HASH,
    })) as UpdateTransaction;
    expect(tx2.hash).toBe(SPONSORED_UPDATE_TX_HASH);
    expect(tx2.sponsorAcct).toBeDefined();
    expect(tx2.sponsorProof).toBeDefined();

    await expect(
      client.getTransactionByHash({
        hash: NON_EXISTENT_TX_HASH,
      }),
    ).rejects.toThrow();
  });

  test("keystore_getTransactionReceipt", async () => {
    const receipt: GetTransactionReceiptResponse = await client.getTransactionReceipt({
      hash: NON_SPONSORED_UPDATE_TX_HASH,
    });
    expect(receipt.status).toBe(TransactionStatus.L2FinalizedL1Included);

    await expect(client.getTransactionReceipt({ hash: NON_EXISTENT_TX_HASH })).rejects.toThrow();
  });

  test("keystore_getBlockNumberByStateRoot", async () => {
    const block = await client.getBlockByNumber({
      block: BlockTag.Latest,
      txKind: BlockTransactionsKind.Hashes,
    });
    const blockNumber = await client.getBlockNumberByStateRoot({ stateRoot: block.stateRoot });
    expect(blockNumber).toBe(block.number);
  });

  test("keystore_getBlockByNumber", async () => {
    const block1 = await client.getBlockByNumber({
      block: BlockTag.Latest,
      txKind: BlockTransactionsKind.Full,
    });
    expect(typeof block1.number).toBe("bigint");
    expect(block1.transactions).toBeDefined();
    expect(block1.transactions).not.toHaveLength(0);
    expect(typeof block1.transactions![0]).not.toBe("string");

    const block2 = await client.getBlockByNumber({
      block: BlockTag.Latest,
      txKind: BlockTransactionsKind.Hashes,
    });
    expect(block2.transactions).toBeDefined();
    expect(block2.transactions).not.toHaveLength(0);
    expect(typeof block2.transactions![0]).toBe("string");

    await client.getBlockByNumber({
      block: BlockTag.Committed,
      txKind: BlockTransactionsKind.Hashes,
    });

    await client.getBlockByNumber({
      block: BlockTag.Finalized,
      txKind: BlockTransactionsKind.Hashes,
    });

    await client.getBlockByNumber({
      block: BlockTag.Earliest,
      txKind: BlockTransactionsKind.Hashes,
    });

    await client.getBlockByNumber({
      block: 1n,
      txKind: BlockTransactionsKind.Hashes,
    });

    await client.getBlockByNumber({
      block: 0n,
      txKind: BlockTransactionsKind.Hashes,
    });
  });

  test("keystore_getBlockByHash", async () => {
    await client.getBlockByHash({
      hash: EXISTING_BLOCK_HASH,
      txKind: BlockTransactionsKind.Hashes,
    });

    await client.getBlockByHash({
      hash: EXISTING_BLOCK_HASH,
      txKind: BlockTransactionsKind.Full,
    });

    await expect(
      client.getBlockByHash({
        hash: NON_EXISTENT_BLOCK_HASH,
        txKind: BlockTransactionsKind.Hashes,
      }),
    ).rejects.toThrow();
  });
}
