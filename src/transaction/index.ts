import { RLP } from "@ethereumjs/rlp";
import { KeystoreAccount, TransactionType } from "../types/transaction";
import { UpdateTransactionRequest } from "../types/transactionRequest";
import {
  keccak256,
  encodeAbiParameters,
  toBytes,
  hexToBytes,
  encodePacked,
  Hex,
  pad,
  boolToHex,
  numberToHex,
  bytesToHex,
  bytesToBigInt,
  bytesToNumber,
  hexToBigInt,
} from "viem";

// Constants
const EIP712_DOMAIN = keccak256(
  toBytes("EIP712Domain(string name,string version,uint256 chainId")
);

const CHAIN_ID = BigInt(999999999);

const DOMAIN_SEPARATOR = keccak256(
  encodeAbiParameters(
    [
      { type: 'bytes32' },
      { type: 'bytes32' },
      { type: 'bytes32' },
      { type: 'uint256' }
    ],
    [
      EIP712_DOMAIN,
      keccak256(toBytes("AxiomKeystore")),
      keccak256(toBytes("1")),
      CHAIN_ID
    ]
  )
)

const UPDATE_TYPEHASH = keccak256(
  toBytes("Update(bytes32 userKeystoreAddress,uint256 nonce,bytes feePerGas,bytes newUserData,bytes newUserVkey)")
)

const SPONSOR_TYPEHASH = keccak256(
  toBytes("Sponsor(bytes32 sponsorKeystoreAddress,bytes32 userMsgHash,bytes32 userKeystoreAddress)")
)

function encodeKeystoreAccount(acct: KeystoreAccount): Hex {
  const keystoreAddress = hexToBytes(acct.keystoreAddress, { size: 32 });
  const salt = hexToBytes(acct.salt, { size: 32 });
  const dataHash = hexToBytes(acct.dataHash, { size: 32 });
  const vkey = hexToBytes(acct.vkey);

  return bytesToHex(RLP.encode([keystoreAddress, salt, dataHash, vkey]));
}

export class KeystoreAccountBytes {
  public readonly keystoreAddress: Hex
  public readonly salt: Hex
  public readonly dataHash: Hex
  public readonly vkey: Hex

  constructor(
    keystoreAddress: Hex,
    salt: Hex,
    dataHash: Hex,
    vkey: Hex
  ) {
    this.keystoreAddress = keystoreAddress;
    this.salt = salt;
    this.dataHash = dataHash;
    this.vkey = vkey;
  }

  public static fromKeystoreAccount(acct: KeystoreAccount) {
    const keystoreAddress = pad(acct.keystoreAddress, { size: 32 });
    const salt = pad(acct.salt, { size: 32 });
    const dataHash = pad(acct.dataHash, { size: 32 });
    const vkey = acct.vkey;
    return new this(
      keystoreAddress,
      salt,
      dataHash,
      vkey
    );
  }
}

export class UpdateTransactionBytes {
  private readonly isL1Initiated: Hex
  private readonly nonce: bigint
  private readonly feePerGas: Hex
  private readonly l1InitiatedNonce: Hex
  private readonly newUserData: Hex
  private readonly newUserVkey: Hex
  private readonly userAcct: KeystoreAccountBytes
  private readonly userProof: Hex
  private readonly sponsorAcctBytes: Hex
  private readonly sponsorProof: Hex

  private _txBytes?: Hex
  private _txHash?: Hex

  constructor(
    isL1Initiated: Hex,
    nonce: bigint,
    feePerGas: Hex,
    l1InitiatedNonce: Hex,
    newUserData: Hex,
    newUserVkey: Hex,
    userAcct: KeystoreAccountBytes,
    userProof: Hex,
    sponsorAcctBytes: Hex,
    sponsorProof: Hex,
  ) {
    this.isL1Initiated = isL1Initiated;
    this.nonce = nonce;
    this.feePerGas = feePerGas;
    this.l1InitiatedNonce = l1InitiatedNonce;
    this.newUserData = newUserData;
    this.newUserVkey = newUserVkey;
    this.userAcct = userAcct;
    this.userProof = userProof;
    this.sponsorAcctBytes = sponsorAcctBytes;
    this.sponsorProof = sponsorProof;
  }

  public static fromTransactionRequest(txReq: UpdateTransactionRequest) {
    const isL1Initiated = boolToHex(false, { size: 1 });
    const nonce = txReq.nonce;
    const feePerGas = numberToHex(txReq.feePerGas, { size: 32 });
    const l1InitiatedNonce = "0x";
    const newUserData = txReq.newUserData;
    const newUserVkey = txReq.newUserVkey;
    const userAcct = KeystoreAccountBytes.fromKeystoreAccount(txReq.userAcct);
    const userProof = "0x";
    const sponsorAcctBytes = txReq.sponsorAcct
      ? encodeKeystoreAccount(txReq.sponsorAcct)
      : "0x";
    const sponsorProof = "0x";

    return new this(
      isL1Initiated,
      nonce,
      feePerGas,
      l1InitiatedNonce,
      newUserData,
      newUserVkey,
      userAcct,
      userProof,
      sponsorAcctBytes,
      sponsorProof,
    );
  }

  public txBytes(): Hex {
    if (!this._txBytes) {
      const rlpEncoded = RLP.encode([
        this.nonce,
        this.feePerGas,
        this.newUserData,
        this.newUserVkey,
        this.userAcct.keystoreAddress,
        this.userAcct.salt,
        this.userAcct.dataHash,
        this.userAcct.vkey,
        this.userProof,
        this.sponsorAcctBytes,
        this.sponsorProof
      ]);
      console.log(bytesToHex(rlpEncoded));

      this._txBytes = encodePacked(
        ['bytes1', 'bytes1', 'bytes', 'bytes'],
        [
          TransactionType.Update,
          this.isL1Initiated,
          this.l1InitiatedNonce,
          bytesToHex(rlpEncoded),
        ]
      );
    }
    return this._txBytes;
  }

  public txHash(): Hex {
    if (!this._txHash) {
      this._txHash = keccak256(this.txBytes());
    }
    return this._txHash;
  }

  public userMsgHash(): Hex {
    const toHash1 = encodeAbiParameters(
      [
        { name: 'UPDATE_TYPEHASH', type: 'bytes32' },
        { name: 'userKeystoreAddr', type: 'bytes32' },
        { name: 'nonce', type: 'uint256' },
        { name: 'feePerGas', type: 'bytes' },
        { name: 'newUserDataHash', type: 'bytes32' },
        { name: 'newUserVkeyHash', type: 'bytes32' },
      ],
      [
        UPDATE_TYPEHASH,
        this.userAcct.keystoreAddress,
        this.nonce,
        this.feePerGas,
        keccak256(this.newUserData),
        keccak256(this.newUserVkey),
      ]
    );
    console.log(toHash1);

    const toHash2 = encodePacked(
      ['bytes2', 'bytes32', 'bytes32'],
      ['0x1901', DOMAIN_SEPARATOR, keccak256(toHash1)]
    );
    return keccak256(toHash2);
  }

  public static decodeTxBytes(hex: Hex) {
    const bytes = hexToBytes(hex);

    if (bytes.length < 2) {
      throw new Error("Invalid length of transaction bytes");
    }

    const txType = bytes[0];
    if (numberToHex(txType, { size: 1 }) !== TransactionType.Update) {
      throw new Error("Invalid transaction type");
    }

    let isL1Initiated = bytes[1] != 0;
    if (isL1Initiated) {
      throw new Error("cannot decode L1 initiated transaction");
    }

    const rlpEncoded = bytes.slice(2);
    const rlpDecoded = RLP.decode(rlpEncoded);

    const nonce = rlpDecoded[0] as Uint8Array;
    const feePerGas = rlpDecoded[1] as Uint8Array;
    const newUserData = rlpDecoded[2] as Uint8Array;
    const newUserVkey = rlpDecoded[3] as Uint8Array;
    const userAcctKeystoreAddress = rlpDecoded[4] as Uint8Array;
    const userAcctSalt = rlpDecoded[5] as Uint8Array;
    const userAcctDataHash = rlpDecoded[6] as Uint8Array;
    const userAcctVkey = rlpDecoded[7] as Uint8Array;
    const userProof = rlpDecoded[8] as Uint8Array;
    const sponsorAcctBytes = rlpDecoded[9] as Uint8Array;
    const sponsorProof = rlpDecoded[10] as Uint8Array;

    const userAcct = new KeystoreAccountBytes(bytesToHex(userAcctKeystoreAddress), bytesToHex(userAcctSalt), bytesToHex(userAcctDataHash), bytesToHex(userAcctVkey));

    const nonceHex = bytesToHex(nonce);
    const nonceBigInt = nonceHex == '0x' ? 0n : hexToBigInt(nonceHex);

    return new UpdateTransactionBytes(
      boolToHex(isL1Initiated, { size: 1 }),
      nonceBigInt,
      bytesToHex(feePerGas),
      "0x",
      bytesToHex(newUserData),
      bytesToHex(newUserVkey),
      userAcct,
      bytesToHex(userProof),
      bytesToHex(sponsorAcctBytes),
      bytesToHex(sponsorProof),
    );
  }
}
