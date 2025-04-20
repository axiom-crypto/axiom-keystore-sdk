import { pad } from "viem";
import { createDepositTransactionClient, createNodeClient, DepositTransactionClient, initAccountCounterfactual } from "../../src";

describe("Deposit Transaction", () => {
  let depositTx: DepositTransactionClient;

  beforeEach(async () => {
    const nodeClient = createNodeClient({
      url: "https://keystore-rpc-node.axiom.xyz",
    });
    const userAcct = initAccountCounterfactual({
      salt: pad("0x1234567890ababab", { size: 32 }),
      dataHash: pad("0x1234567890", { size: 32 }),
      vkey: "0x1234abcd",
      nodeClient,
    });
    depositTx = await createDepositTransactionClient({
      keystoreAddress: userAcct.address,
      amt: 20000n,
      l1InitiatedNonce: 0n,
    });
  });

  test("Get Transaction Bytes", () => {
    const txBytes = depositTx.toBytes();
    expect(txBytes).toEqual(
      "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004e20dafd7a698501896eefef0a3893d88ca07bc07a09888ee54ab60a4b079baa2179"
    );
  });

  test("Get Transaction Hash", () => {
    const txHash = depositTx.txHash();
    expect(txHash).toEqual(
      "0x690b3dca835c2e235f44a4268f57f321b6b12777d66ecc005f52b3826e1805d4"
    );
  });
});
