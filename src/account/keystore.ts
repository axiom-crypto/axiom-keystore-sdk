import { RLP } from "@ethereumjs/rlp";
import { KeystoreAccount } from "../types/transaction";
import { keccak256, hexToBytes, Hex, pad, bytesToHex, concat } from "viem";
import { Bytes32, Data, Hash, KeystoreAddress } from "../types/primitives";

export class KeystoreAccountBuilder implements KeystoreAccount {
  keystoreAddress: `0x${string}`;
  salt: `0x${string}`;
  dataHash: `0x${string}`;
  vkey: `0x${string}`;

  constructor(
    keystoreAddress: `0x${string}`,
    salt: `0x${string}`,
    dataHash: `0x${string}`,
    vkey: `0x${string}`,
  ) {
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
  static initWithKeystoreAddress(
    keystoreAddress: KeystoreAddress,
    dataHash: Hash,
    vkey: Data,
  ) {
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
  static initCounterfactual(
    salt: Bytes32,
    dataHash: Hash,
    vkey: Data,
  ): KeystoreAccount {
    const paddedSalt = pad(salt, { size: 32 });
    const paddedDataHash = pad(dataHash, { size: 32 });

    const vkeyHash = keccak256(vkey);
    const keystoreAddress = keccak256(
      concat([paddedSalt, paddedDataHash, vkeyHash]),
    );
    return new this(keystoreAddress, paddedSalt, paddedDataHash, vkey);
  }

  static rlpDecode(hex: Hex): KeystoreAccount {
    const bytes = hexToBytes(hex);
    const rlpDecoded = RLP.decode(bytes);

    const keystoreAddress = bytesToHex(rlpDecoded[0] as Uint8Array);
    const salt = bytesToHex(rlpDecoded[1] as Uint8Array);
    const dataHash = bytesToHex(rlpDecoded[2] as Uint8Array);
    const vkey = bytesToHex(rlpDecoded[3] as Uint8Array);

    return new this(keystoreAddress, salt, dataHash, vkey);
  }

  public rlpEncode(): Hex {
    return bytesToHex(
      RLP.encode([this.keystoreAddress, this.salt, this.dataHash, this.vkey]),
    );
  }
}
