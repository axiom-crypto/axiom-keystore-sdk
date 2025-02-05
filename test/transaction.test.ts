import { describe, test, expect } from "@jest/globals";
import { UpdateTransactionRequest } from "../src/types/transactionRequest";
import { UpdateTransactionBuilder } from "../src/transaction";

describe("transaction encoding", () => {
  test("UpdateTransactionBytes", () => {
    const txReq: UpdateTransactionRequest = {
      nonce: 1n,
      feePerGas: 100n,
      newUserData: "0x1234",
      newUserVkey: "0x5678",
      userAcct: {
        keystoreAddress:
          "0xc3a9b82816196f3f5692dda37ee242839ce86357dc06a205ce04da56a3651e06",
        salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
        dataHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        vkey: "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    };

    const updateTx = UpdateTransactionBuilder.fromTransactionRequest(txReq);

    const txBytes = updateTx.txBytes();
    const decodedTx = UpdateTransactionBuilder.decodeTxBytes(txBytes);

    expect(updateTx.txHash()).toBe(decodedTx.txHash());
  });
});
