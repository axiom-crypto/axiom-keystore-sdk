import {
  Data,
  Hash,
  AuthInputs,
  AuthenticateTransactionResponse,
  GetAuthenticationStatusResponse,
  AuthenticateSponsoredTransactionResponse,
  GetSponsoredAuthenticationStatusResponse,
  SponsoredTransactionSponsoredAuthInputs,
} from "@/types";

export interface CustomSignatureProver<KD, AD, AI> {
  vkey: Data;
  keyDataEncoder: (fields: KD) => Data;
  authDataEncoder: (fields: AD) => Data;
  makeAuthInputs: (fields: AI) => AuthInputs;
}

export interface SignatureProverClientConfig<KD, AD, AI> extends CustomSignatureProver<KD, AD, AI> {
  pollingIntervalMs?: number;
  pollingRetries?: number;
  url: string;
}

export interface SignatureProverClient<KD, AD, AI> extends SignatureProverClientConfig<KD, AD, AI> {
  dataHash: (fields: KD) => Data;

  waitForAuthentication: ({ hash }: { hash: Hash }) => Promise<Data>;

  waitForSponsoredAuthentication: ({ hash }: { hash: Hash }) => Promise<Data>;

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
    sponsoredAuthInputs: SponsoredTransactionSponsoredAuthInputs;
  }) => Promise<AuthenticateSponsoredTransactionResponse>;

  getSponsoredAuthenticationStatus: ({
    requestHash,
  }: {
    requestHash: Hash;
  }) => Promise<GetSponsoredAuthenticationStatusResponse>;
}
