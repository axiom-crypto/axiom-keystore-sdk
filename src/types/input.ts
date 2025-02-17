import { encodeMOfNData } from "../dataHash";
import { Data, Hash, L1Address } from "./primitives";
import { concat, keccak256 } from "viem";

export type AuthInputs = {
  keyData: Data;
  authData: Data;
  vkeyHash: Hash;
}

export type SponsorAuthInputs = {
  sponsorAuth: AuthInputs;
  userAuth?: AuthInputs;
};

export function generateMOfNEcdsaAuthInputs(codeHash: Hash, signatures: Data[], eoaAddrs: L1Address[], vkey: Data): AuthInputs {
  const keyData = encodeMOfNData(codeHash, BigInt(signatures.length), eoaAddrs);
  const authData = concat(signatures);
  const vkeyHash = keccak256(vkey);
  return {
    keyData,
    authData,
    vkeyHash,
  };
}