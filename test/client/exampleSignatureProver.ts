import { CustomSignatureProver, Data, L1Address, AuthInputs } from "../../src";
import { concat, encodeAbiParameters, encodePacked } from "viem";

export const EXAMPLE_SIGNATURE_PROVER_URL = "https://example-signatureprover.abc.xyz";
export const EXAMPLE_SIGNATURE_PROVER_VKEY =
  "0x01010000001001000100010100000100000000000000000000000000000000009171ded76cb8d446b69cb901fe413fe380886240549feb11014fec000a7eb1280750a550988ceaef9a37f6794af0d9bf472445bc9dfacf89b9f4a6130c2b0eb42ef05dfd54c6d765973c1b3e0c15885e1307bedc893a3474103a065e7a032d04078f64fde979db4eea6692dbde7d161c3e6c3ae99f2e7cf9c58229f8d1a5bb97056fb20596873754a862cbe247b25315399d7be7a8bfe72942564c469d6a95e141a2f3c0bb526ad5ded741e9c10d6920cd28a10f108b0d1f2b22688b67a32c4055f6d42ed1d1c3eb767c513d8aa832c470b29a9dc7afb33fdcfeda198b820f724d13a24c6d1123d95b1124cf08c4aaf9531dd819011b9a13b6151d5ab83225fe4517";

export interface ExampleSignatureProverKeyDataFields {
  codehash: Data;
  signersList: L1Address[];
}

export interface ExampleSignatureProverAuthDataFields {
  signatures: Data[];
}

export interface ExampleSignatureProverAuthInputs {
  codehash: Data;
  signatures: Data[];
  signersList: L1Address[];
}

export const ExampleSignatureProver: CustomSignatureProver<
  ExampleSignatureProverKeyDataFields,
  ExampleSignatureProverAuthDataFields,
  ExampleSignatureProverAuthInputs
> = {
  vkey: EXAMPLE_SIGNATURE_PROVER_VKEY,
  keyDataEncoder: (fields: ExampleSignatureProverKeyDataFields): Data => {
    const encoded = encodeAbiParameters(
      [
        { name: "codehash", type: "bytes32" },
        { name: "signersList", type: "address[]" },
      ],
      [fields.codehash, fields.signersList],
    );
    return encodePacked(["bytes1", "bytes"], ["0x00", encoded]);
  },
  authDataEncoder: (fields: ExampleSignatureProverAuthDataFields): Data => {
    return fields.signatures.length > 0 ? concat(fields.signatures) : "0x";
  },
  makeAuthInputs: (inputs: ExampleSignatureProverAuthInputs): AuthInputs => {
    const keyData = ExampleSignatureProver.keyDataEncoder({
      codehash: inputs.codehash,
      signersList: inputs.signersList,
    });
    const authData = ExampleSignatureProver.authDataEncoder({
      signatures: inputs.signatures,
    });
    return {
      keyData,
      authData,
    };
  },
};
