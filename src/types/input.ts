import { encodeMOfNData } from "../dataHash";
import { Data, Hash, L1Address } from "./primitives";
import { concat } from "viem";

export type AuthInputs = {
  keyData: Data;
  authData: Data;
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
      sponsorAndProve: {
        userAuthInputs: AuthInputs;
      };
    };

export function makeMOfNEcdsaAuthInputs(
  codeHash: Hash,
  signatures: Data[],
  eoaAddrs: L1Address[],
): AuthInputs {
  const keyData = encodeMOfNData(codeHash, BigInt(signatures.length), eoaAddrs);
  const authData = signatures.length > 0 ? concat(signatures) : "0x";
  return {
    keyData,
    authData,
  };
}
