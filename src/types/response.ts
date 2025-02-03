import { L1BlockRef, L2BlockRef } from "./block";
import { AccountState, ImtProof, StateTransitions } from "./state";
import { L1Address, Hash, Data, Quantity } from "./primitives";
import { L2Transaction, TransactionStatus } from "./transaction";

/** 
 * Sync status response with L2 and L1 references. 
 */
export type SyncStatusResponse = {
  preconfirmedL2?: L2BlockRef;
  committedL2: L2BlockRef;
  finalizedL2: L2BlockRef;
  currentL1?: L1BlockRef;
  safeL1?: L1BlockRef;
  finalizedL1?: L1BlockRef;
}

/** Just a type alias for a version string. */
export type VersionResponse = string;

/** A direct alias for a block number response. */
export type BlockNumberResponse = Quantity;

/** A direct alias for a getBalance response. */
export type GetBalanceResponse = Quantity;

/** A direct alias for retrieving an account state. */
export type GetStateAtResponse = AccountState;

/** 
 * GetProofResponse includes the account state plus the IMT proof. 
 */
export type GetProofResponse = {
  state: AccountState;
  proof: ImtProof;
}

/**
 * GetWithdrawalProofResponse includes the L1 target address, amount, and the IMT proof.
 */
export type GetWithdrawalProofResponse = {
  to: L1Address;
  amt: Quantity;
  proof: ImtProof;
}

/** A direct alias for retrieving a transaction count. */
export type GetTransactionCountResponse = Quantity;

/**
 * Represents the result of a call simulation (success plus optional state transitions).
 */
export type CallResponse = {
  success: boolean;
  stateTransitions?: StateTransitions;
}

export type EstimateGasResponse = Quantity;

export type EstimateL1DataFeeResponse = Quantity;

export type GetBlockTransactionCountByHashResponse = Quantity;

export type GetBlockTransactionCountByNumberResponse = Quantity;

export type GetBlockByHashResponse = L2BlockRef;

export type GetBlockByNumberResponse = L2BlockRef;

export type GetTransactionByHashResponse = L2Transaction;

export type GetTransactionByBlockHashAndIndexResponse = L2Transaction;

export type GetTransactionByBlockNumberAndIndexResponse = L2Transaction;

/** 
 * The transaction receipt structure.
 */
export type GetTransactionReceiptResponse = {
  transactionHash: Hash;
  blockHash: Hash;
  blockNumber: Quantity;
  transactionIndex?: Quantity;
  status: TransactionStatus;
  gas?: Quantity;
  gasPrice?: Quantity;
  l1DataFee?: Quantity;
  amount?: Quantity;
}

export type GetBlockNumberByStateRootResponse = Quantity;
export type GasPriceResponse = Quantity;
export type SendRawTransactionResponse = Hash;
export type AuthenticateTransactionResponse = Hash;

/**
 * Authentication status for a transaction request can be null or a status object.
 */
export type GetAuthenticationStatusResponse = AuthenticationStatus;

/**
 * Authentication status object.
 */
export type AuthenticationStatus = {
  status: AuthenticationStatusEnum;
  authenticatedTransaction?: Data;
  error?: string;
}

/** 
 * Authentication status enum (pending, completed, failed).
 */
export enum AuthenticationStatusEnum {
  Pending = "Pending",
  Completed = "Completed",
  Failed = "Failed",
}

/** A direct alias for sponsor authentication request hash. */
export type SponsorAuthenticateTransactionResponse = Hash;

/**
 * Sponsor authentication status can be null or a status object.
 */
export type GetSponsorAuthenticationStatusResponse = AuthenticationStatus;
