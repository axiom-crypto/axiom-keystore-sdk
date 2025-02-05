import { RequestManager, HTTPTransport, Client } from "@open-rpc/client-js";
import {
  AuthenticateTransactionResponse,
  BlockNumberResponse,
  CallResponse,
  EstimateGasResponse,
  EstimateL1DataFeeResponse,
  GasPriceResponse,
  GetAuthenticationStatusResponse,
  GetBalanceResponse,
  GetBlockByHashResponse,
  GetBlockByNumberResponse,
  GetBlockNumberByStateRootResponse,
  GetProofResponse,
  GetSponsorAuthenticationStatusResponse,
  GetStateAtResponse,
  GetTransactionByHashResponse,
  GetTransactionCountResponse,
  GetTransactionReceiptResponse,
  SendRawTransactionResponse,
  SponsorAuthenticateTransactionResponse,
  SyncStatusResponse,
} from "./types/response";
import { Data, Hash, KeystoreAddress } from "./types/primitives";
import { BlockTagOrNumber, BlockTransactionsKind } from "./types/block";
import { AuthInputs, SponsorAuthInputs } from "./types/input";
import {
  AuthenticateTransactionResponseRpc,
  BlockNumberResponseRpc,
  CallResponseRpc,
  EstimateGasResponseRpc,
  GasPriceResponseRpc,
  GetAuthenticationStatusResponseRpc,
  GetBalanceResponseRpc,
  GetBlockByHashResponseRpc,
  GetBlockByNumberResponseRpc,
  GetBlockNumberByStateRootResponseRpc,
  GetProofResponseRpc,
  GetSponsorAuthenticationStatusResponseRpc,
  GetStateAtResponseRpc,
  GetTransactionByHashResponseRpc,
  GetTransactionCountResponseRpc,
  GetTransactionReceiptResponseRpc,
  SendRawTransactionResponseRpc,
  SponsorAuthenticateTransactionResponseRpc,
  SyncStatusResponseRpc,
} from "./types/rpc";
import {
  formatBlockNumberResponse,
  formatBlockTagOrNumber,
  formatBlockTransactionKind,
  formatCallResponse,
  formatEstimateGasResponse,
  formatEstimateL1DataFeeResponse,
  formatGasPriceResponse,
  formatGetBalanceResponse,
  formatGetBlockByHashResponse,
  formatGetBlockByNumberResponse,
  formatGetBlockNumberByStateRootResponse,
  formatGetTransactionByHashResponse,
  formatGetTransactionCountResponse,
  formatGetTransactionReceiptResponse,
  formatSyncStatusResponse,
} from "./types/formatters";

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
    const rpcResp: SyncStatusResponseRpc = await this.client.request({
      method: "keystore_syncStatus",
      params: [],
    });
    return formatSyncStatusResponse(rpcResp);
  }

  async blockNumber(): Promise<BlockNumberResponse> {
    const rpcResp: BlockNumberResponseRpc = await this.client.request({
      method: "keystore_blockNumber",
      params: [],
    });
    return formatBlockNumberResponse(rpcResp);
  }

  async getBalance(
    address: KeystoreAddress,
    block: BlockTagOrNumber,
  ): Promise<GetBalanceResponse> {
    const rpcResp: GetBalanceResponseRpc = await this.client.request({
      method: "keystore_getBalance",
      params: [address, formatBlockTagOrNumber(block)],
    });
    return formatGetBalanceResponse(rpcResp);
  }

  async getStateAt(
    address: KeystoreAddress,
    block: BlockTagOrNumber,
  ): Promise<GetStateAtResponse> {
    const rpcResp: GetStateAtResponseRpc = await this.client.request({
      method: "keystore_getStateAt",
      params: [address, formatBlockTagOrNumber(block)],
    });
    return rpcResp;
  }

  async getTransactionCount(
    address: KeystoreAddress,
    block: BlockTagOrNumber,
  ): Promise<GetTransactionCountResponse> {
    const rpcResp: GetTransactionCountResponseRpc = await this.client.request({
      method: "keystore_getTransactionCount",
      params: [address, formatBlockTagOrNumber(block)],
    });
    return formatGetTransactionCountResponse(rpcResp);
  }

  async getProof(
    address: KeystoreAddress,
    block: BlockTagOrNumber,
  ): Promise<GetProofResponse> {
    const rpcResp: GetProofResponseRpc = await this.client.request({
      method: "keystore_getProof",
      params: [address, formatBlockTagOrNumber(block)],
    });
    return rpcResp;
  }

  async call(
    transaction: Data,
    block: BlockTagOrNumber,
  ): Promise<CallResponse> {
    const rpcResp: CallResponseRpc = await this.client.request({
      method: "keystore_call",
      params: [transaction, formatBlockTagOrNumber(block)],
    });
    return formatCallResponse(rpcResp);
  }

  async getTransactionByHash(
    hash: Hash,
  ): Promise<GetTransactionByHashResponse> {
    const rpcResp: GetTransactionByHashResponseRpc = await this.client.request({
      method: "keystore_getTransactionByHash",
      params: [hash],
    });
    return formatGetTransactionByHashResponse(rpcResp);
  }

  async getTransactionReceipt(
    hash: Hash,
  ): Promise<GetTransactionReceiptResponse> {
    const rpcResp: GetTransactionReceiptResponseRpc = await this.client.request(
      {
        method: "keystore_getTransactionReceipt",
        params: [hash],
      },
    );
    return formatGetTransactionReceiptResponse(rpcResp);
  }

  async getBlockNumberByStateRoot(
    stateRoot: Hash,
  ): Promise<GetBlockNumberByStateRootResponse> {
    const rpcResp: GetBlockNumberByStateRootResponseRpc =
      await this.client.request({
        method: "keystore_getBlockNumberByStateRoot",
        params: [stateRoot],
      });
    return formatGetBlockNumberByStateRootResponse(rpcResp);
  }

  async getBlockByNumber(
    block: BlockTagOrNumber,
    txKind: BlockTransactionsKind,
  ): Promise<GetBlockByNumberResponse> {
    const rpcResp: GetBlockByNumberResponseRpc = await this.client.request({
      method: "keystore_getBlockByNumber",
      params: [
        formatBlockTagOrNumber(block),
        formatBlockTransactionKind(txKind),
      ],
    });
    return formatGetBlockByNumberResponse(rpcResp);
  }

  async getBlockByHash(
    hash: Hash,
    txKind: BlockTransactionsKind,
  ): Promise<GetBlockByHashResponse> {
    const rpcResp: GetBlockByHashResponseRpc = await this.client.request({
      method: "keystore_getBlockByHash",
      params: [hash, formatBlockTransactionKind(txKind)],
    });
    return formatGetBlockByHashResponse(rpcResp);
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

  async authenticateTransaction(
    transaction: Data,
    authInputs: AuthInputs,
  ): Promise<AuthenticateTransactionResponse> {
    const rpcResp: AuthenticateTransactionResponseRpc =
      await this.client.request({
        method: "keystore_authenticateTransaction",
        params: [transaction, authInputs],
      });
    return rpcResp;
  }

  async getAuthenticationStatus(
    requestHash: Hash,
  ): Promise<GetAuthenticationStatusResponse> {
    const rpcResp: GetAuthenticationStatusResponseRpc =
      await this.client.request({
        method: "keystore_getAuthenticationStatus",
        params: [requestHash],
      });
    return rpcResp;
  }

  async sponsorAuthenticateTransaction(
    transaction: Data,
    sponsorAuthInputs: SponsorAuthInputs,
  ): Promise<SponsorAuthenticateTransactionResponse> {
    const rpcResp: SponsorAuthenticateTransactionResponseRpc =
      await this.client.request({
        method: "keystore_sponsorAuthenticateTransaction",
        params: [transaction, sponsorAuthInputs],
      });
    return rpcResp;
  }

  async getSponsorAuthenticationStatus(
    requestHash: Hash,
  ): Promise<GetSponsorAuthenticationStatusResponse> {
    const rpcResp: GetSponsorAuthenticationStatusResponseRpc =
      await this.client.request({
        method: "keystore_getSponsorAuthenticationStatus",
        params: [requestHash],
      });
    return rpcResp;
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

  async sendRawTransaction(
    transaction: Data,
  ): Promise<SendRawTransactionResponse> {
    const rpcResp: SendRawTransactionResponseRpc = await this.client.request({
      method: "keystore_sendRawTransaction",
      params: [transaction],
    });
    return rpcResp;
  }

  async gasPrice(): Promise<GasPriceResponse> {
    const rpcResp: GasPriceResponseRpc = await this.client.request({
      method: "keystore_gasPrice",
      params: [],
    });
    return formatGasPriceResponse(rpcResp);
  }

  async estimateGas(transaction: Data): Promise<EstimateGasResponse> {
    const rpcResp: EstimateGasResponseRpc = await this.client.request({
      method: "keystore_estimateGas",
      params: [transaction],
    });
    return formatEstimateGasResponse(rpcResp);
  }

  async estimateL1DataFee(
    transaction: Data,
    block: BlockTagOrNumber,
  ): Promise<EstimateL1DataFeeResponse> {
    const rpcResp: EstimateGasResponseRpc = await this.client.request({
      method: "keystore_estimateL1DataFee",
      params: [transaction, formatBlockTagOrNumber(block)],
    });
    return formatEstimateL1DataFeeResponse(rpcResp);
  }

  async call(
    transaction: Data,
    block: BlockTagOrNumber,
  ): Promise<CallResponse> {
    const rpcResp = await this.client.request({
      method: "keystore_call",
      params: [transaction, formatBlockTagOrNumber(block)],
    });
    return formatCallResponse(rpcResp);
  }
}
