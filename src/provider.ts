import { RequestManager, HTTPTransport, Client } from "@open-rpc/client-js";
import { AuthenticateTransactionResponse, CallResponse, EstimateGasResponse, EstimateL1DataFeeResponse, GasPriceResponse, GetAuthenticationStatusResponse, GetBalanceResponse, GetBlockByHashResponse, GetBlockByNumberResponse, GetBlockNumberByStateRootResponse, GetProofResponse, GetSponsorAuthenticationStatusResponse, GetStateAtResponse, GetTransactionByHashResponse, GetTransactionCountResponse, GetTransactionReceiptResponse, SendRawTransactionResponse, SponsorAuthenticateTransactionResponse, SyncStatusResponse } from "./types/response";
import { Data, Hash, KeystoreAddress } from "./types/primitives";
import { BlockTagOrNumber } from "./types/block";
import { AuthInputs, SponsorAuthInputs } from "./types/input";

/**
 * Provider for interacting with a keystore node.
 */
export class KeystoreNodeProvider {
  private client: Client;

  /**
   * Creates a new KeystoreNodeProvider.
   * 
   * @param url - The URL of the keystore node
   */
  constructor(url: string) {
    const transport = new HTTPTransport(url);
    this.client = new Client(new RequestManager([transport]));
  }

  async syncStatus(): Promise<SyncStatusResponse> {
    const result = await this.client.request({
      method: "keystore_syncStatus",
      params: []
    });
    return result;
  }

  async getBlockNumber(): Promise<GetBlockByNumberResponse> {
    const result = await this.client.request({
      method: "keystore_blockNumber",
      params: []
    });
    return result;
  }

  async getBalance(address: KeystoreAddress, block: BlockTagOrNumber): Promise<GetBalanceResponse> {
    const result = await this.client.request({
      method: "keystore_getBalance",
      params: [address, block]
    });
    return result;
  }

  async getStateAt(address: KeystoreAddress, block: BlockTagOrNumber): Promise<GetStateAtResponse> {
    const result = await this.client.request({
      method: "keystore_getStateAt",
      params: [address, block]
    });
    return result;
  }

  async getTransactionCount(address: KeystoreAddress, block: BlockTagOrNumber): Promise<GetTransactionCountResponse> {
    const result = await this.client.request({
      method: "keystore_getTransactionCount",
      params: [address, block]
    });
    return result;
  }

  async getProof(address: KeystoreAddress, block: BlockTagOrNumber): Promise<GetProofResponse> {
    const result = await this.client.request({
      method: "keystore_getProof",
      params: [address, block]
    });
    return result;
  }

  async call(transaction: Data, block: BlockTagOrNumber): Promise<CallResponse> {
    const result = await this.client.request({
      method: "keystore_call",
      params: [transaction, block]
    });
    return result;
  }

  async getTransactionByHash(hash: Hash): Promise<GetTransactionByHashResponse> {
    const result = await this.client.request({
      method: "keystore_getTransactionByHash",
      params: [hash]
    });
    return result;
  }

  async getTransactionReceipt(hash: Hash): Promise<GetTransactionReceiptResponse> {
    const result = await this.client.request({
      method: "keystore_getTransactionReceipt",
      params: [hash]
    });
    return result;
  }

  async getBlockNumberByStateRoot(stateRoot: Hash): Promise<GetBlockNumberByStateRootResponse> {
    const result = await this.client.request({
      method: "keystore_getBlockNumberByStateRoot",
      params: [stateRoot]
    });
    return result;
  }

  async getBlockByNumber(block: BlockTagOrNumber, fullTransactions: boolean): Promise<GetBlockByNumberResponse> {
    const result = await this.client.request({
      method: "keystore_getBlockByNumber",
      params: [block, fullTransactions]
    });
    return result;
  }

  async getBlockByHash(hash: Hash, fullTransactions: boolean): Promise<GetBlockByHashResponse> {
    const result = await this.client.request({
      method: "keystore_getBlockByHash",
      params: [hash, fullTransactions]
    });
    return result;
  }
}

/**
 * Provider for interacting with a keystore signature prover.
 */
export class KeystoreSignatureProverProvider {
  private client: Client;

  /**
   * Creates a new KeystoreSignatureProverProvider.
   * 
   * @param url - The URL of the keystore signature prover
   */
  constructor(url: string) {
    const transport = new HTTPTransport(url);
    this.client = new Client(new RequestManager([transport]));
  }

  async authenticateTransaction(transaction: Data, authInputs: AuthInputs): Promise<AuthenticateTransactionResponse> {
    const result = await this.client.request({
      method: "keystore_authenticateTransaction",
      params: [transaction, authInputs]
    });
    return result;
  }

  async getAuthenticationStatus(requestHash: Hash): Promise<GetAuthenticationStatusResponse> {
    const result = await this.client.request({
      method: "keystore_getAuthenticationStatus",
      params: [requestHash]
    });
    return result;
  }

  async sponsorAuthenticateTransaction(transaction: Data, sponsorAuthInputs: SponsorAuthInputs): Promise<SponsorAuthenticateTransactionResponse> {
    const result = await this.client.request({
      method: "keystore_sponsorAuthenticateTransaction",
      params: [transaction, sponsorAuthInputs]
    });
    return result;
  }

  async getSponsorAuthenticationStatus(requestHash: Hash): Promise<GetSponsorAuthenticationStatusResponse> {
    const result = await this.client.request({
      method: "keystore_getSponsorAuthenticationStatus",
      params: [requestHash]
    });
    return result;
  }
}

/**
 * Provider for interacting with a keystore sequencer.
 */
export class KeystoreSequencerProvider {
  private client: Client;

  /**
   * Creates a new KeystoreSequencerProvider.
   * 
   * @param url - The URL of the keystore sequencer
   */
  constructor(url: string) {
    const transport = new HTTPTransport(url);
    this.client = new Client(new RequestManager([transport]));
  }

  async sendRawTransaction(transaction: Data): Promise<SendRawTransactionResponse> {
    const result = await this.client.request({
      method: "keystore_sendRawTransaction",
      params: [transaction]
    });
    return result;
  }

  async gasPrice(): Promise<GasPriceResponse> {
    const result = await this.client.request({
      method: "keystore_gasPrice",
      params: []
    });
    return result;
  }

  async estimateGas(transaction: Data): Promise<EstimateGasResponse> {
    const result = await this.client.request({
      method: "keystore_estimateGas",
      params: [transaction]
    });
    return result;
  }

  async estimateL1DataFee(transaction: Data, block: BlockTagOrNumber): Promise<EstimateL1DataFeeResponse> {
    const result = await this.client.request({
      method: "keystore_estimateL1DataFee",
      params: [transaction, block]
    });
    return result;
  }

  async call(transaction: Data, block: BlockTagOrNumber): Promise<CallResponse> {
    const result = await this.client.request({
      method: "keystore_call",
      params: [transaction, block]
    });
    return result;
  }
}
