import { Data, Hash, L1Address } from "./primitives";

export type AuthInputs = {
  codeHash: Hash,
  signatures: Data[],
  eoaAddrs: L1Address[],
}

export type SponsorAuthInputs = {
  sponsorAuth: AuthInputs,
  userAuth?: AuthInputs,
}