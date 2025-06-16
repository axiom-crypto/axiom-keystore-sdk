import { pad } from "viem";
import {
  createNodeClient,
  createWithdrawTransactionRequestClient,
  initAccountCounterfactual,
  WithdrawTransactionRequestClient,
} from "../../src";
import { TEST_ACCOUNTS } from "../testUtils";

describe("Withdraw Transaction", () => {
  let withdrawTx: WithdrawTransactionRequestClient;

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
    withdrawTx = await createWithdrawTransactionRequestClient({
      nonce: 0n,
      feePerGas: 10000000n,
      to: "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
      amt: 20000n,
      userAcct,
    });
  });

  test("Get Transaction Bytes", () => {
    const txBytes = withdrawTx.rawSequencerTransaction();
    expect(txBytes).toEqual(
      "0x0100f8a380a0000000000000000000000000000000000000000000000000000000000098968094a5cc3c03994db5b0d9a5eedd10cabab0813678ac824e20a0dafd7a698501896eefef0a3893d88ca07bc07a09888ee54ab60a4b079baa2179a00000000000000000000000000000000000000000000000001234567890abababa00000000000000000000000000000000000000000000000000000001234567890841234abcd80",
    );
  });

  test("Get EIP712 Typed Data", () => {
    const typedData = withdrawTx.toTypedData();
    expect(typedData).toEqual({
      domain: {
        chainId: 999999999n,
        name: "AxiomKeystore",
        version: "1",
      },
      message: {
        userKeystoreAddress: "0xdafd7a698501896eefef0a3893d88ca07bc07a09888ee54ab60a4b079baa2179",
        nonce: 0n,
        feePerGas: pad("0x989680", { size: 32 }),
        to: "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
        amt: 20000n,
      },
      primaryType: "Withdraw",
      types: {
        EIP712Domain: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "version",
            type: "string",
          },
          {
            name: "chainId",
            type: "uint256",
          },
        ],
        Withdraw: [
          {
            name: "userKeystoreAddress",
            type: "bytes32",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "feePerGas",
            type: "bytes",
          },
          {
            name: "to",
            type: "address",
          },
          {
            name: "amt",
            type: "uint256",
          },
        ],
      },
    });
  });

  test("Get User Message Hash", () => {
    const userMsgHash = withdrawTx.userMsgHash();
    expect(userMsgHash).toEqual(
      "0x5a39e6dfaeac7043c97e0c510564c7ee61d4a45b46591fe66627cee1bcca49bf",
    );
  });

  test("Sign Transaction", async () => {
    const signature = await withdrawTx.sign(TEST_ACCOUNTS[0].pk);
    expect(signature).toEqual(
      "0xa1815d23d87daeae2d3ebeac888f8d14d4104d301f7aa0a5fd52563a3f24e5f72b838c6faacbcdd329c43adbead8123079cfc746f0879277eb75df896bd56cd21b",
    );
  });
});
