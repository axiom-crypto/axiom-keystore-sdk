import {
  AuthenticateSponsoredTransactionResponse,
  AuthenticateTransactionResponse,
  AuthenticationStatus,
  AuthenticationStatusEnum,
  AuthInputs,
  Data,
  GetAuthenticationStatusResponse,
  GetSponsoredAuthenticationStatusResponse,
  Hash,
  SignatureProverClient,
  SignatureProverClientConfig,
  SponsoredAuthInputs,
  SponsoredTransactionSponsoredAuthInputs,
} from "@/types";
import { DEFAULTS } from "@/config";
import { Client, HTTPTransport, RequestManager } from "@open-rpc/client-js";
import { keccak256 } from "viem";

export function createSignatureProverClient<KD, AD, AI>(
  signatureProver: SignatureProverClientConfig<KD, AD, AI>,
): SignatureProverClient<KD, AD, AI> {
  const {
    url,
    pollingIntervalMs = DEFAULTS.POLLING_INTERVAL_MS,
    pollingRetries = DEFAULTS.POLLING_RETRIES,
  } = signatureProver;

  const transport = new HTTPTransport(url, {
    fetcher: globalThis.fetch,
  });
  const client = new Client(new RequestManager([transport]));

  const dataHash = (fields: KD) => {
    return keccak256(signatureProver.keyDataEncoder(fields));
  };

  const waitForAuthentication = async ({ hash }: { hash: Hash }): Promise<Data> => {
    return await waitForAuthenticationGeneric(
      {
        hash,
        pollingRetries,
        pollingIntervalMs,
        authStatusFn: getAuthenticationStatus,
      },
      false,
    );
  };

  const waitForSponsoredAuthentication = async ({ hash }: { hash: Hash }): Promise<Data> => {
    return await waitForAuthenticationGeneric(
      {
        hash,
        pollingRetries,
        pollingIntervalMs,
        authStatusFn: getSponsoredAuthenticationStatus,
      },
      true,
    );
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
    sponsoredAuthInputs: SponsoredTransactionSponsoredAuthInputs;
  }): Promise<AuthenticateSponsoredTransactionResponse> => {
    const { userAuthInputs, sponsorAuthInputs, userProof } = sponsoredAuthInputs;
    let finalSponsoredAuthInputs: SponsoredAuthInputs;

    // Case 1: proveSponsored - both user and sponsor auth inputs
    if (userAuthInputs && sponsorAuthInputs && !userProof) {
      finalSponsoredAuthInputs = {
        proveSponsored: {
          userAuthInputs,
          sponsorAuthInputs,
        },
      };
    }
    // Case 2: proveOnlySponsored - user proof and sponsor auth inputs
    else if (userProof && sponsorAuthInputs && !userAuthInputs) {
      finalSponsoredAuthInputs = {
        proveOnlySponsored: {
          userProof,
          sponsorAuthInputs,
        },
      };
    }
    // Case 3: sponsorAndProve - only user auth inputs
    else if (userAuthInputs && !sponsorAuthInputs && !userProof) {
      finalSponsoredAuthInputs = {
        sponsorAndProve: {
          userAuthInputs,
        },
      };
    }
    // Invalid combination
    else {
      throw new Error(
        "Invalid combination of inputs. Must provide either: " +
          "[1: proveSponsored] userAuthInputs and sponsorAuthInputs, or " +
          "[2: proveOnlySponsored] userProof and sponsorAuthInputs, or " +
          "[3: sponsorAndProve] only userAuthInputs",
      );
    }

    return await client.request({
      method: "keystore_authenticateSponsoredTransaction",
      params: [transaction, finalSponsoredAuthInputs],
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
    waitForSponsoredAuthentication,
    authenticateTransaction,
    getAuthenticationStatus,
    authenticateSponsoredTransaction,
    getSponsoredAuthenticationStatus,
  };
}

async function waitForAuthenticationGeneric(
  {
    hash,
    pollingRetries,
    pollingIntervalMs,
    authStatusFn,
  }: {
    hash: Hash;
    pollingRetries: number;
    pollingIntervalMs: number;
    authStatusFn: ({ requestHash }: { requestHash: Hash }) => Promise<AuthenticationStatus>;
  },
  isSponsored: boolean,
): Promise<Data> {
  console.log("Waiting for authentication, this may take serveral minutes...");
  let attempts = 0;
  while (attempts < pollingRetries) {
    try {
      const status = await authStatusFn({
        requestHash: hash,
      });
      switch (status.status) {
        case AuthenticationStatusEnum.Completed:
          if (!status.authenticatedTransaction) {
            throw new Error("No authenticated transaction found");
          }
          console.log(`${isSponsored ? "Sponsored authentication" : "Authentication"} completed`);
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
}
