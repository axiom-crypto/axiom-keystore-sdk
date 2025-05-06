import { createSignatureProverClient, Data, SignatureProverClient } from "../../src";
import { ecdsaSign } from "../../src/utils/ecdsa";
import { TEST_ACCOUNTS, CODE_HASH, AXIOM_SPONSOR_DATA_HASH, AXIOM_SPONSOR_EOA } from "../testUtils";
import {
  EXAMPLE_SIGNATURE_PROVER_URL,
  EXAMPLE_SIGNATURE_PROVER_VKEY,
  ExampleSignatureProver,
  ExampleSignatureProverAuthDataFields,
  ExampleSignatureProverAuthInputs,
  ExampleSignatureProverKeyDataFields,
} from "./exampleSignatureProver";

describe("Signature Prover Client", () => {
  let signatureProverClient: SignatureProverClient<
    ExampleSignatureProverKeyDataFields,
    ExampleSignatureProverAuthDataFields,
    ExampleSignatureProverAuthInputs
  >;

  beforeEach(() => {
    signatureProverClient = createSignatureProverClient({
      url: EXAMPLE_SIGNATURE_PROVER_URL,
      ...ExampleSignatureProver,
    });
  });

  test("Encode keyData", async () => {
    const keyData = signatureProverClient.keyDataEncoder({
      codehash: CODE_HASH,
      signersList: [AXIOM_SPONSOR_EOA],
    });
    expect(keyData).toBe(
      "0x00595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d900000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d7548a3ed8c51fa30d26ff2d7db5c33d27fd48f2",
    );
  });

  test("Encode authData", async () => {
    const authData1 = signatureProverClient.authDataEncoder({
      signatures: [],
    });
    expect(authData1).toBe("0x");

    const sigs: Data[] = [];
    for (let i = 0; i < TEST_ACCOUNTS.length; i++) {
      const sig = await ecdsaSign(TEST_ACCOUNTS[i].pk, AXIOM_SPONSOR_DATA_HASH);
      sigs.push(sig);
    }
    const authData2 = signatureProverClient.authDataEncoder({
      signatures: sigs,
    });
    expect(authData2).toBe(
      "0x124be0909939b0e4431950350bdd090c0bb03df0d2283d493b52c5b7c738c7c14210865a00470921c30295003cf84f90c756583c9fb88baa38b08df998a774de1b9fc247dd3edb2c711a2d1b63e11d8e7bfe3ea6ce38dcfd8cf528bb02fd1c61342c8b98620f27b068a615cce0fdfaf42a0def4bcc25cfe4b876fca57d0c9227891bca5ff3cad5ce27f65c643bd229d08f5b3b682ae8ba0fb21244fbd1196edfc03035190900069e8e00d57086dabcf24442e972a9bcb4321e2b586870318347e4151c",
    );
  });

  test("Make AuthInputs struct", async () => {
    const authInputs = signatureProverClient.makeAuthInputs({
      codehash: CODE_HASH,
      signatures: ["0xecf85bc51a8b47c545dad1a47e868276d0a92b7cf2716033ce77d385a6b67c1b"],
      signersList: [AXIOM_SPONSOR_EOA],
    });
    const authInputsCmp = {
      keyData:
        "0x00595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d900000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d7548a3ed8c51fa30d26ff2d7db5c33d27fd48f2",
      authData: "0xecf85bc51a8b47c545dad1a47e868276d0a92b7cf2716033ce77d385a6b67c1b",
    };
    expect(authInputs).toEqual(authInputsCmp);
  });

  test("Get RPC URL", async () => {
    expect(signatureProverClient.url).toBe(EXAMPLE_SIGNATURE_PROVER_URL);
  });

  test("Get vkey", async () => {
    expect(signatureProverClient.vkey).toBe(EXAMPLE_SIGNATURE_PROVER_VKEY);
  });

  test("Get dataHash", async () => {
    const dataHash = signatureProverClient.dataHash({
      codehash: CODE_HASH,
      signersList: [AXIOM_SPONSOR_EOA],
    });
    expect(dataHash).toBe("0xb334fe7dbb5bf8b32665547b035e2e1874239a948f2e035117944f10fbf7f1f0");
  });
});
