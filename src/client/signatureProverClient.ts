import { DEFAULTS } from "@/constants";
import {
  AuthenticateSponsoredTransactionResponse,
  AuthenticateTransactionResponse,
  AuthenticationStatusEnum,
  AuthInputs,
  Data,
  GetAuthenticationStatusResponse,
  GetSponsoredAuthenticationStatusResponse,
  Hash,
  SponsoredAuthInputs,
} from "@/types";
import { Client, HTTPTransport, RequestManager } from "@open-rpc/client-js";
import { keccak256 } from "viem";

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

export function createSignatureProverClient<KD, AD, AI>(
  signatureProver: SignatureProverClientConfig<KD, AD, AI>,
): SignatureProverClient<KD, AD, AI> {
  const {
    url,
    pollingIntervalMs = DEFAULTS.POLLING_INTERVAL_MS,
    pollingRetries = DEFAULTS.POLLING_RETRIES,
  } = signatureProver;

  const transport = new HTTPTransport(url);
  const client = new Client(new RequestManager([transport]));

  const dataHash = (fields: KD) => {
    return keccak256(signatureProver.keyDataEncoder(fields));
  };

  const waitForAuthentication = async ({ hash }: { hash: Hash }): Promise<Data> => {
    console.log("Waiting for authentication, this may take serveral minutes...");
    let attempts = 0;
    while (attempts < pollingRetries) {
      try {
        const status = await getSponsoredAuthenticationStatus({
          requestHash: hash,
        });
        switch (status.status) {
          case AuthenticationStatusEnum.Completed:
            if (!status.authenticatedTransaction) {
              throw new Error("No authenticated transaction found");
            }
            console.log("Sponsored authentication completed");
            return status.authenticatedTransaction;
          case AuthenticationStatusEnum.Failed:
            throw new Error("Transaction authentication failed");
          case AuthenticationStatusEnum.Pending:
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
            continue;
          default:
            throw new Error("Invalid authentication status");
        }
      } catch (error) {
        throw new Error(`Error waiting for authentication: ${error}`);
      }
    }
    throw new Error(`Timed out after ${(pollingRetries * pollingIntervalMs) / 1000} seconds`);
  };

  const authenticateTransaction = async ({
    transaction,
    authInputs,
  }: {
    transaction: Data;
    authInputs: AuthInputs;
  }): Promise<AuthenticateTransactionResponse> => {
    return await client.request({
      method: "keystore_authenticateTransaction",
      params: [transaction, authInputs],
    });
  };

  const getAuthenticationStatus = async ({
    requestHash,
  }: {
    requestHash: Hash;
  }): Promise<GetAuthenticationStatusResponse> => {
    return await client.request({
      method: "keystore_getAuthenticationStatus",
      params: [requestHash],
    });
  };

  const authenticateSponsoredTransaction = async ({
    transaction,
    sponsoredAuthInputs,
  }: {
    transaction: Data;
    sponsoredAuthInputs: SponsoredAuthInputs;
  }): Promise<AuthenticateSponsoredTransactionResponse> => {
    return await client.request({
      method: "keystore_authenticateSponsoredTransaction",
      params: [transaction, sponsoredAuthInputs],
    });
  };

  const getSponsoredAuthenticationStatus = async ({
    requestHash,
  }: {
    requestHash: Hash;
  }): Promise<GetSponsoredAuthenticationStatusResponse> => {
    return await client.request({
      method: "keystore_getSponsoredAuthenticationStatus",
      params: [requestHash],
    });
  };

  return {
    ...signatureProver,
    dataHash,
    waitForAuthentication,
    authenticateTransaction,
    getAuthenticationStatus,
    authenticateSponsoredTransaction,
    getSponsoredAuthenticationStatus,
  };
}
