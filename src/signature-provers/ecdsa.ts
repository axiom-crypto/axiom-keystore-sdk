import { AuthInputs, Data, L1Address } from "@/types";
import { concat, encodeAbiParameters, encodePacked } from "viem";

export const M_OF_N_ECDSA_VKEY =
  "0x01010000001001000100010100000100000000000000000000000000000000009171ded76cb8d446b69cb901fe413fe380886240549feb11014fec000a7eb1280750a550988ceaef9a37f6794af0d9bf472445bc9dfacf89b9f4a6130c2b0eb42ef05dfd54c6d765973c1b3e0c15885e1307bedc893a3474103a065e7a032d04078f64fde979db4eea6692dbde7d161c3e6c3ae99f2e7cf9c58229f8d1a5bb97056fb20596873754a862cbe247b25315399d7be7a8bfe72942564c469d6a95e141a2f3c0bb526ad5ded741e9c10d6920cd28a10f108b0d1f2b22688b67a32c4055f6d42ed1d1c3eb767c513d8aa832c470b29a9dc7afb33fdcfeda198b820f724d13a24c6d1123d95b1124cf08c4aaf9531dd819011b9a13b6151d5ab83225fe4517";

/**
 * m-of-n ECDSA fields necessary to encode the authentication rule's KeyData
 * @param codehash - Hash of the keystore contract code
 * @param m - Threshold number of required signatures
 * @param signersList - List of authorized signer addresses
 */
export interface MOfNEcdsaKeyDataFields {
  codehash: Data;
  m: bigint;
  signersList: L1Address[];
}

/**
 * m-of-n ECDSA fields necessary to encode the authentication rule's AuthData
 * @param signatures - List of signatures
 */
export interface MOfNEcdsaAuthDataFields {
  signatures: Data[];
}

/**
 * m-of-n ECDSA inputs necessary to make the authentication rule's AuthInputs
 * @param codehash - Hash of the keystore contract code
 * @param signatures - List of signatures
 * @param signersList - List of authorized signer addresses
 */
export interface MOfNEcdsaAuthInputs {
  codehash: Data;
  signatures: Data[];
  signersList: L1Address[];
}

/**
 * Encodes the KeyData for the m-of-n ECDSA authentication rule
 * @param fields - MOfNEcdsaKeyDataFields
 * @returns The encoded KeyData as a hex string
 */
export const keyDataEncoder = (fields: MOfNEcdsaKeyDataFields): Data => {
  const encoded = encodeAbiParameters(
    [
      { name: "codehash", type: "bytes32" },
      { name: "m", type: "uint256" },
      { name: "signersList", type: "address[]" },
    ],
    [fields.codehash, fields.m, fields.signersList],
  );
  return encodePacked(["bytes1", "bytes"], ["0x00", encoded]);
};

/**
 * Encodes the AuthData for the m-of-n ECDSA authentication rule
 * @param fields - MOfNEcdsaAuthDataFields
 * @returns The encoded AuthData as a hex string
 */
export const authDataEncoder = (fields: MOfNEcdsaAuthDataFields): Data => {
  return fields.signatures.length > 0 ? concat(fields.signatures) : "0x";
};

/**
 * Encodes keyData and authData from inputs to make an AuthInputs struct
 * @param inputs - MOfNEcdsaAuthInputs
 * @returns The AuthInputs struct
 */
export const makeAuthInputs = (inputs: MOfNEcdsaAuthInputs): AuthInputs => {
  const keyData = keyDataEncoder({
    codehash: inputs.codehash,
    m: BigInt(inputs.signatures.length),
    signersList: inputs.signersList,
  });
  const authData = authDataEncoder({
    signatures: inputs.signatures,
  });
  return {
    keyData,
    authData,
  };
};
