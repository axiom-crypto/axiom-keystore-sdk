import {
  Data,
  Hash,
  AuthInputs,
  SponsoredAuthInputs,
  AuthenticateTransactionResponse,
  GetAuthenticationStatusResponse,
  AuthenticateSponsoredTransactionResponse,
  GetSponsoredAuthenticationStatusResponse,
} from "@/types";

export interface CustomSignatureProver<KD, AD, AI> {
  url: string;
  vkey: Data;
  keyDataEncoder: (fields: KD) => Data;
  authDataEncoder: (fields: AD) => Data;
  makeAuthInputs: (fields: AI) => AuthInputs;
}

export interface SignatureProverClient<KD, AD, AI> extends CustomSignatureProver<KD, AD, AI> {
  dataHash: (fields: KD) => Data;

  waitForAuthentication: ({ hash }: { hash: Hash }) => Promise<Data>;

  authenticateTransaction: ({
    transaction,
    authInputs,
  }: {
    transaction: Data;
    authInputs: AuthInputs;
  }) => Promise<AuthenticateTransactionResponse>;

  getAuthenticationStatus: ({
    requestHash,
  }: {
    requestHash: Hash;
  }) => Promise<GetAuthenticationStatusResponse>;

  authenticateSponsoredTransaction: ({
    transaction,
    sponsoredAuthInputs,
  }: {
    transaction: Data;
    sponsoredAuthInputs: SponsoredAuthInputs;
  }) => Promise<AuthenticateSponsoredTransactionResponse>;

  getSponsoredAuthenticationStatus: ({
    requestHash,
  }: {
    requestHash: Hash;
  }) => Promise<GetSponsoredAuthenticationStatusResponse>;
}

export interface SignatureProverClientConfig<KD, AD, AI> extends CustomSignatureProver<KD, AD, AI> {
  pollingIntervalMs?: number;
  pollingRetries?: number;
}
