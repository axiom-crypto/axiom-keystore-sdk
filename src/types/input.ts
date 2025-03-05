import { Data } from "./primitives";

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

export type AuthenticateSponsoredTransactionSponsoredAuthInputs = {
  userAuthInputs?: AuthInputs;
  sponsorAuthInputs?: AuthInputs;
  userProof?: Data;
};
