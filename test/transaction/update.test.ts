import { pad } from "viem";
import {
  createNodeClient,
  createUpdateTransactionClient,
  initAccountCounterfactual,
  initAccountFromAddress,
  UpdateTransactionClient,
} from "../../src";
import {
  EXAMPLE_SPONSOR_ADDRESS,
  EXAMPLE_SPONSOR_DATA_HASH,
  M_OF_N_ECDSA_VKEY,
  TEST_ACCOUNTS,
} from "../testUtils";

describe("Update Transaction", () => {
  let updateTx: UpdateTransactionClient;

  beforeEach(() => {
    const nodeClient = createNodeClient({
      url: "https://keystore-rpc-node.axiom.xyz",
    });
    const userAcct = initAccountCounterfactual({
      salt: pad("0x1234567890ababab", { size: 32 }),
      dataHash: pad("0x1234567890", { size: 32 }),
      vkey: "0x1234abcd",
      nodeClient,
    });
    const sponsorAcct = initAccountFromAddress({
      address: EXAMPLE_SPONSOR_ADDRESS,
      dataHash: EXAMPLE_SPONSOR_DATA_HASH,
      vkey: M_OF_N_ECDSA_VKEY,
      nodeClient,
    });
    updateTx = createUpdateTransactionClient({
      nonce: 0n,
      newUserData: "0x1234",
      newUserVkey: "0x1234",
      userAcct,
      sponsorAcct,
    });
  });

  test("Create Update Transaction", () => {
    const txBytes = updateTx.toBytes();
    expect(txBytes).toEqual(
      "0x0200f902008000821234821234a0dafd7a698501896eefef0a3893d88ca07bc07a09888ee54ab60a4b079baa2179a00000000000000000000000000000000000000000000000001234567890abababa00000000000000000000000000000000000000000000000000000001234567890841234abcd80b9018bf90188a0b5ce21832ca3bbf53de610c6dda13d6a735b0a8ea3422aeaab678a01e298269da00000000000000000000000000000000000000000000000000000000000000000a0ecf85bc51a8b47c545dad1a47e868276d0a92b7cf2716033ce77d385a6b67c4bb9012201010000001001000100010100000100000000000000000000000000000000009171ded76cb8d446b69cb901fe413fe380886240549feb11014fec000a7eb1280750a550988ceaef9a37f6794af0d9bf472445bc9dfacf89b9f4a6130c2b0eb42ef05dfd54c6d765973c1b3e0c15885e1307bedc893a3474103a065e7a032d04078f64fde979db4eea6692dbde7d161c3e6c3ae99f2e7cf9c58229f8d1a5bb97056fb20596873754a862cbe247b25315399d7be7a8bfe72942564c469d6a95e141a2f3c0bb526ad5ded741e9c10d6920cd28a10f108b0d1f2b22688b67a32c4055f6d42ed1d1c3eb767c513d8aa832c470b29a9dc7afb33fdcfeda198b820f724d13a24c6d1123d95b1124cf08c4aaf9531dd819011b9a13b6151d5ab83225fe451780",
    );
  });

  test("Get EIP712 Typed Data", () => {
    const typedData = updateTx.toTypedData();
    expect(typedData).toEqual({
      domain: {
        chainId: 999999999n,
        name: "AxiomKeystore",
        version: "1",
      },
      message: {
        feePerGas: "0x0",
        newUserData: "0x1234",
        newUserVkey: "0x1234",
        nonce: 0n,
        userKeystoreAddress: "0xdafd7a698501896eefef0a3893d88ca07bc07a09888ee54ab60a4b079baa2179",
      },
      primaryType: "Update",
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
        Update: [
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
            name: "newUserData",
            type: "bytes",
          },
          {
            name: "newUserVkey",
            type: "bytes",
          },
        ],
      },
    });
  });

  test("Get Transaction Hash", () => {
    const txHash = updateTx.txHash();
    expect(txHash).toEqual("0xc2cc175cabd6f3f13e3a9646155d56cff7126d0a89653cdfbbc4fbaece6cd82e");
  });

  test("Get User Message Hash", () => {
    const userMsgHash = updateTx.userMsgHash();
    expect(userMsgHash).toEqual(
      "0x4afeda84d70e7b2dfc9729221ae6a906b95fabecb41f1893af9d61bd8f20e4a7",
    );
  });

  test("Sign Transaction", async () => {
    const signature = await updateTx.sign(TEST_ACCOUNTS[0].pk);
    expect(signature).toEqual(
      "0xb425c9cad5d4af5b656af589d13ae6e92527f8c9d5d1862e2f3da9145031617726b4695e009a069147d1e1437019fee560388ac17c184a1d1e5b6c935dcc47961b",
    );
  });
});
