import { pad } from "viem";
import {
  createDepositTransactionRequestClient,
  createNodeClient,
  DepositTransactionRequestClient,
  initAccountCounterfactual,
} from "../../src";

describe("Deposit Transaction", () => {
  let depositTx: DepositTransactionRequestClient;

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
    depositTx = await createDepositTransactionRequestClient({
      keystoreAddress: userAcct.address,
      amt: 20000n,
    });
  });

  test("Get Transaction Request Bytes", () => {
    const txRequest = depositTx.l1InitiatedTransaction();
    expect(txRequest.data).toEqual(
      "0xdafd7a698501896eefef0a3893d88ca07bc07a09888ee54ab60a4b079baa2179",
    );
  });
});
