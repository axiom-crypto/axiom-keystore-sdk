import { Data, Hash, L1Address } from "./primitives";

export interface AuthInputs {
  codeHash: Hash,
  signatures: Data[],
  eoaAddrs: L1Address[],
}

export interface SponsorAuthInputs {
  sponsorAuth: AuthInputs,
  userAuth?: AuthInputs,
}