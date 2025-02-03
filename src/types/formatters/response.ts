import { BlockNumberResponse, CallResponse, EstimateGasResponse, EstimateL1DataFeeResponse, GasPriceResponse, GetBalanceResponse, GetBlockByHashResponse, GetBlockByNumberResponse, GetBlockNumberByStateRootResponse, GetBlockTransactionCountByHashResponse, GetBlockTransactionCountByNumberResponse, GetStateAtResponse, GetTransactionByBlockHashAndIndexResponse, GetTransactionByBlockNumberAndIndexResponse, GetTransactionByHashResponse, GetTransactionCountResponse, GetTransactionReceiptResponse, GetWithdrawalProofResponse, SyncStatusResponse } from "../response";
import { BlockNumberResponseRpc, CallResponseRpc, EstimateGasResponseRpc, EstimateL1DataFeeResponseRpc, GasPriceResponseRpc, GetBalanceResponseRpc, GetBlockByHashResponseRpc, GetBlockByNumberResponseRpc, GetBlockNumberByStateRootResponseRpc, GetBlockTransactionCountByHashResponseRpc, GetBlockTransactionCountByNumberResponseRpc, GetStateAtResponseRpc, GetTransactionByBlockHashAndIndexResponseRpc, GetTransactionByBlockNumberAndIndexResponseRpc, GetTransactionByHashResponseRpc, GetTransactionCountResponseRpc, GetTransactionReceiptResponseRpc, GetWithdrawalProofResponseRpc, SyncStatusResponseRpc } from "../rpc";
import { formatL1BlockRef, formatL2BlockRef } from "./block";
import { formatStateTransitions } from "./state";
import { formatL2Transaction } from "./transaction";

export function formatSyncStatusResponse(rpcObj: SyncStatusResponseRpc): SyncStatusResponse {
  return {
    preconfirmedL2: rpcObj.preconfirmedL2 ? formatL2BlockRef(rpcObj.preconfirmedL2) : undefined,
    committedL2: formatL2BlockRef(rpcObj.committedL2),
    finalizedL2: formatL2BlockRef(rpcObj.finalizedL2),
    currentL1: rpcObj.currentL1 ? formatL1BlockRef(rpcObj.currentL1) : undefined,
    safeL1: rpcObj.safeL1 ? formatL1BlockRef(rpcObj.safeL1) : undefined,
    finalizedL1: rpcObj.finalizedL1 ? formatL1BlockRef(rpcObj.finalizedL1) : undefined,
  }
}

export function formatBlockNumberResponse(rpcObj: BlockNumberResponseRpc): BlockNumberResponse {
  return BigInt(rpcObj);
}

export function formatGetBalanceResponse(rpcObj: GetBalanceResponseRpc): GetBalanceResponse {
  return BigInt(rpcObj);
}

export function formatGetStateAtResponse(rpcObj: GetStateAtResponseRpc): GetStateAtResponse {
  return rpcObj;
}

export function formatGetWithdrawalProofResponse(rpcObj: GetWithdrawalProofResponseRpc): GetWithdrawalProofResponse {
  return {
    to: rpcObj.to,
    amt: BigInt(rpcObj.amt),
    proof: rpcObj.proof,
  }
}

export function formatGetTransactionCountResponse(rpcObj: GetTransactionCountResponseRpc): GetTransactionCountResponse {
  return BigInt(rpcObj);
}

export function formatCallResponse(rpcObj: CallResponseRpc): CallResponse {
  return {
    success: rpcObj.success,
    stateTransitions: rpcObj.stateTransitions ? formatStateTransitions(rpcObj.stateTransitions) : undefined,
  }
}

export function formatEstimateGasResponse(rpcObj: EstimateGasResponseRpc): EstimateGasResponse {
  return BigInt(rpcObj);
}

export function formatEstimateL1DataFeeResponse(rpcObj: EstimateL1DataFeeResponseRpc): EstimateL1DataFeeResponse {
  return BigInt(rpcObj);
}

export function formatGetBlockTransactionCountByHashResponse(rpcObj: GetBlockTransactionCountByHashResponseRpc): GetBlockTransactionCountByHashResponse {
  return BigInt(rpcObj);
}

export function formatGetBlockTransactionCountByNumberResponse(rpcObj: GetBlockTransactionCountByNumberResponseRpc): GetBlockTransactionCountByNumberResponse {
  return BigInt(rpcObj);
}

export function formatGetBlockByHashResponse(rpcObj: GetBlockByHashResponseRpc): GetBlockByHashResponse {
  return formatL2BlockRef(rpcObj);
}

export function formatGetBlockByNumberResponse(rpcObj: GetBlockByNumberResponseRpc): GetBlockByNumberResponse {
  return formatL2BlockRef(rpcObj);
}

export function formatGetTransactionByHashResponse(rpcObj: GetTransactionByHashResponseRpc): GetTransactionByHashResponse {
  return formatL2Transaction(rpcObj);
}

export function formatGetTransactionByBlockHashAndIndexResponse(rpcObj: GetTransactionByBlockHashAndIndexResponseRpc): GetTransactionByBlockHashAndIndexResponse {
  return formatL2Transaction(rpcObj);
}

export function formatGetTransactionByBlockNumberAndIndexResponse(rpcObj: GetTransactionByBlockNumberAndIndexResponseRpc): GetTransactionByBlockNumberAndIndexResponse {
  return formatL2Transaction(rpcObj);
}

export function formatGetTransactionReceiptResponse(rpcObj: GetTransactionReceiptResponseRpc): GetTransactionReceiptResponse {
  return {
    transactionHash: rpcObj.transactionHash,
    blockHash: rpcObj.blockHash,
    blockNumber: BigInt(rpcObj.blockNumber),
    transactionIndex: rpcObj.transactionIndex ? BigInt(rpcObj.transactionIndex) : undefined,
    status: rpcObj.status,
    gas: rpcObj.gas ? BigInt(rpcObj.gas) : undefined,
    gasPrice: rpcObj.gasPrice ? BigInt(rpcObj.gasPrice) : undefined,
    l1DataFee: rpcObj.l1DataFee ? BigInt(rpcObj.l1DataFee) : undefined,
    amount: rpcObj.amount ? BigInt(rpcObj.amount) : undefined,
  }
}

export function formatGetBlockNumberByStateRootResponse(rpcObj: GetBlockNumberByStateRootResponseRpc): GetBlockNumberByStateRootResponse {
  return BigInt(rpcObj);
}

export function formatGasPriceResponse(rpcObj: GasPriceResponseRpc): GasPriceResponse {
  return BigInt(rpcObj);
}
