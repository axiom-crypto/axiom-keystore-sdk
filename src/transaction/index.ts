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
  hexToBigInt,
  concat,
} from "viem";
import { Bytes32, Data, Hash, KeystoreAddress } from "../types/primitives";
import { ecdsaSign } from "../utils/ecdsa";
import { KEYSTORE_CHAIN_ID } from "../constants";

const EIP712_DOMAIN = keccak256(
  toBytes("EIP712Domain(string name,string version,uint256 chainId")
);

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
      BigInt(KEYSTORE_CHAIN_ID)
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

export class KeystoreAccountBuilder implements KeystoreAccount {
  keystoreAddress: `0x${string}`;
  salt: `0x${string}`;
  dataHash: `0x${string}`;
  vkey: `0x${string}`;

  constructor(keystoreAddress: `0x${string}`, salt: `0x${string}`, dataHash: `0x${string}`, vkey: `0x${string}`) {
    this.keystoreAddress = pad(keystoreAddress, { size: 32 });
    this.salt = pad(salt, { size: 32 });
    this.dataHash = pad(dataHash, { size: 32 });
    this.vkey = vkey;
  }

  /**
   * Initializes a keystore account with an existing keystore address.
   * This is useful when you already have a keystore address and want to create
   * the corresponding account object. Salt is set to `bytes32(0)`.
   * 
   * @param keystoreAddress - The existing keystore address
   * @param dataHash - Hash of the user's data
   * @param vkey - Verification key for the account
   * @returns KeystoreAccount with provided keystore address and parameters
   */
  static initWithKeystoreAddress(keystoreAddress: KeystoreAddress, dataHash: Hash, vkey: Data) {
    const salt = pad("0x", { size: 32 });
    return new this(keystoreAddress, salt, dataHash, vkey);
  }

  /**
   * Initializes a counterfactual keystore account with the given salt, data hash and vkey.
   * The keystore address is derived by hashing the concatenation of the salt,
   * data hash and vkey hash.
   * 
   * @param salt - A 32 bytes value to enable address uniqueness.
   * @param dataHash - Hash of the user's data
   * @param vkey - Verification key for the account
   * @returns KeystoreAccount with derived keystore address and provided parameters
   */
  static initCounterfactual(salt: Bytes32, dataHash: Hash, vkey: Data): KeystoreAccount {
    const paddedSalt = pad(salt, { size: 32 });
    const paddedDataHash = pad(dataHash, { size: 32 });

    const vkeyHash = keccak256(vkey);
    const keystoreAddress = keccak256(concat([paddedSalt, paddedDataHash, vkeyHash]));
    return new this(keystoreAddress, paddedSalt, paddedDataHash, vkey);
  }
}

export class UpdateTransactionBuilder {
  private readonly isL1Initiated: Hex
  private readonly nonce: bigint
  private readonly feePerGas: Hex
  private readonly l1InitiatedNonce: Hex
  private readonly newUserData: Hex
  private readonly newUserVkey: Hex
  private readonly userAcct: KeystoreAccount
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
    userAcct: KeystoreAccount,
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

  /**
   * Creates a new UpdateTransactionBuilder from an UpdateTransactionRequest.
   * 
   * @param txReq - The transaction request object
   * @returns UpdateTransactionBuilder with the provided transaction request
   */
  public static fromTransactionRequest(txReq: UpdateTransactionRequest) {
    const isL1Initiated = boolToHex(false, { size: 1 });
    const nonce = txReq.nonce;
    const feePerGas = numberToHex(txReq.feePerGas, { size: 32 });
    const l1InitiatedNonce = "0x";
    const newUserData = txReq.newUserData;
    const newUserVkey = txReq.newUserVkey;
    const userAcct = new KeystoreAccountBuilder(txReq.userAcct.keystoreAddress, txReq.userAcct.salt, txReq.userAcct.dataHash, txReq.userAcct.vkey);
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

  /**
   * Returns the transaction bytes for the update transaction.
   * 
   * @returns The transaction bytes
   */
  public txBytes(): Data {
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

  /**
   * Returns the transaction hash for the update transaction.
   * 
   * @returns The transaction hash
   */
  public txHash(): Hash {
    if (!this._txHash) {
      this._txHash = keccak256(this.txBytes());
    }
    return this._txHash;
  }

  /**
   * Returns the user message hash for the update transaction.
   * 
   * @returns The user message hash
   */
  public userMsgHash(): Hash {
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

    const toHash2 = encodePacked(
      ['bytes2', 'bytes32', 'bytes32'],
      ['0x1901', DOMAIN_SEPARATOR, keccak256(toHash1)]
    );
    return keccak256(toHash2);
  }

  /**
   * Signs the user message hash for the update transaction.
   * 
   * @param pk - The private key to sign with
   * @returns The signature
   */
  public async sign(pk: Hash): Promise<Data> {
    let hash = this.userMsgHash();
    let signature = await ecdsaSign(pk, hash);
    return signature;
  }

  /**
   * Decodes the transaction bytes for an update transaction.
   * 
   * @param hex - The transaction bytes
   * @returns UpdateTransactionBuilder with the decoded transaction
   */
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

    const userAcct = new KeystoreAccountBuilder(bytesToHex(userAcctKeystoreAddress), bytesToHex(userAcctSalt), bytesToHex(userAcctDataHash), bytesToHex(userAcctVkey));

    const nonceHex = bytesToHex(nonce);
    const nonceBigInt = nonceHex == '0x' ? 0n : hexToBigInt(nonceHex);

    return new UpdateTransactionBuilder(
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
