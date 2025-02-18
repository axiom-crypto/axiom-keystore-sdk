import { encodeMOfNData } from "../dataHash";
import { Data, Hash, L1Address } from "./primitives";
import { concat, keccak256 } from "viem";

export type AuthInputs = {
  keyData: Data;
  authData: Data;
  vkeyHash: Hash;
};

export type SponsoredAuthInputs =
  | {
      proveSponsored: {
        userAuthInputs: AuthInputs;
        sponsorAuthInputs: AuthInputs;
      };
    }
  | {
      proveOnlySponsored: {
        userProof: Data;
        sponsorAuthInputs: AuthInputs;
      };
    }
  | {
      autoSponsor: {
        userAuthInputs: AuthInputs;
      };
    };

export function makeMOfNEcdsaAuthInputs(
  codeHash: Hash,
  signatures: Data[],
  eoaAddrs: L1Address[],
  vkey: Data,
): AuthInputs {
  const keyData = encodeMOfNData(codeHash, BigInt(signatures.length), eoaAddrs);
  const authData = signatures.length > 0 ? concat(signatures) : "0x";
  const vkeyHash = keccak256(vkey);
  return {
    keyData,
    authData,
    vkeyHash,
  };
}
