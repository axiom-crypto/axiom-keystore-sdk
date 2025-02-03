import { Hash, L1Address } from "../primitives";
import { AuthenticationStatus } from "../response";
import { AccountState, ImtProof } from "../state";
import { TransactionStatus } from "../transaction";
import { L1BlockRefRpc, L2BlockRefRpc } from "./block";
import { HexQuantity } from "./primitives";
import { StateTransitionsRpc } from "./state";
import { L2TransactionRpc } from "./transaction";

export type SyncStatusResponseRpc = {
  preconfirmedL2?: L2BlockRefRpc;
  committedL2: L2BlockRefRpc;
  finalizedL2: L2BlockRefRpc;
  currentL1?: L1BlockRefRpc;
  safeL1?: L1BlockRefRpc;
  finalizedL1?: L1BlockRefRpc;
}

export type VersionResponseRpc = string;

export type BlockNumberResponseRpc = HexQuantity;

export type GetBalanceResponseRpc = HexQuantity;

export type GetStateAtResponseRpc = AccountState;

export type GetProofResponseRpc = {
  state: AccountState;
  proof: ImtProof;
}

export type GetWithdrawalProofResponseRpc = {
  to: L1Address;
  amt: HexQuantity;
  proof: ImtProof;
}

export type GetTransactionCountResponseRpc = HexQuantity;

export type CallResponseRpc = {
  success: boolean;
  stateTransitions?: StateTransitionsRpc;
}

export type EstimateGasResponseRpc = HexQuantity;

export type EstimateL1DataFeeResponseRpc = HexQuantity;

export type GetBlockTransactionCountByHashResponseRpc = HexQuantity;

export type GetBlockTransactionCountByNumberResponseRpc = HexQuantity;

export type GetBlockByHashResponseRpc = L2BlockRefRpc;

export type GetBlockByNumberResponseRpc = L2BlockRefRpc;

export type GetTransactionByHashResponseRpc = L2TransactionRpc;

export type GetTransactionByBlockHashAndIndexResponseRpc = L2TransactionRpc;

export type GetTransactionByBlockNumberAndIndexResponseRpc = L2TransactionRpc;

export type GetTransactionReceiptResponseRpc = {
  transactionHash: Hash;
  blockHash: Hash;
  blockNumber: HexQuantity;
  transactionIndex?: HexQuantity;
  status: TransactionStatus;
  gas?: HexQuantity;
  gasPrice?: HexQuantity;
  l1DataFee?: HexQuantity;
  amount?: HexQuantity;
}

export type GetBlockNumberByStateRootResponseRpc = HexQuantity;

export type GasPriceResponseRpc = HexQuantity;

export type SendRawTransactionResponseRpc = Hash;

export type AuthenticateTransactionResponseRpc = Hash;

export type GetAuthenticationStatusResponseRpc = AuthenticationStatus;

export type SponsorAuthenticateTransactionResponseRpc = Hash;

export type GetSponsorAuthenticationStatusResponseRpc = AuthenticationStatus;