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
import Client, { HTTPTransport, RequestManager } from "@open-rpc/client-js";
import { keccak256 } from "viem";

export interface CustomSignatureProver {
  url: string;
  vkey: Data;
  keyDataEncoder: (...args: unknown[]) => Data;
  authDataEncoder: (...args: unknown[]) => Data;
}

export interface SignatureProverClient extends CustomSignatureProver {
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

  dataHash: () => Data;

  waitForAuthentication: (txHash: Hash) => Promise<Data>;
}

export interface SignatureProverClientConfig extends CustomSignatureProver {
  pollingIntervalMs?: number;
  pollingRetries?: number;
}

export function createSignatureProverClient(
  signatureProver: SignatureProverClientConfig,
): SignatureProverClient {
  const {
    url,
    pollingIntervalMs = DEFAULTS.POLLING_INTERVAL_MS,
    pollingRetries = DEFAULTS.POLLING_RETRIES,
  } = signatureProver;

  const transport = new HTTPTransport(url);
  const client = new Client(new RequestManager([transport]));

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

  // TODO: fix this; we need to use the concrete values passed in for the keyDataEncoder's function args
  const dataHash = () => {
    return keccak256(signatureProver.keyDataEncoder());
  };

  const waitForAuthentication = async (txHash: Hash): Promise<Data> => {
    let attempts = 0;
    while (attempts < pollingRetries) {
      try {
        const status = await getSponsoredAuthenticationStatus({
          requestHash: txHash,
        });
        console.log("Sponsored authentication status:", status.status);

        switch (status.status) {
          case AuthenticationStatusEnum.Completed:
            if (!status.authenticatedTransaction) {
              throw new Error("No authenticated transaction found");
            }
            console.log("Sponsor authentication completed");
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
        if (attempts >= pollingRetries - 1) {
          throw error;
        }
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
      }
    }
    throw new Error(`Polling timed out after ${pollingRetries} attempts`);
  };

  return {
    ...signatureProver,
    authenticateTransaction,
    getAuthenticationStatus,
    authenticateSponsoredTransaction,
    getSponsoredAuthenticationStatus,
    dataHash,
    waitForAuthentication,
  };
}
