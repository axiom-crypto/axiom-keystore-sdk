import { encodeAbiParameters, encodePacked, Hex, keccak256 } from "viem";

/**
 * Functions for calculating data hashes used in keystore accounts.
 * Data hash is computed as:
 * ```
 * data_hash = keccak256(abi.encodePacked(0x00, abi.encode(codehash, m, signersList[])))
 * ``` 
 * 
 * @param codeHash - Hash of the keystore contract code
 * @param m - Threshold number of required signers
 * @param signersList - List of authorized signer addresses
 * @returns The data hash
 */
export function calcDataHash(codeHash: Hex, m: bigint, signersList: Hex[]): Hex {
  const data_hash_data = encodeMOfNData(codeHash, m, signersList);
  return keccak256(data_hash_data);
}

/**
 * Encodes the data hash data for the keystore account.
 * 
 * @param codeHash - Hash of the keystore contract code
 * @param m - Threshold number of required signers
 * @param signersList - List of authorized signer addresses
 * @returns The encoded data hash data
 */
export function encodeMOfNData(codeHash: Hex, m: bigint, signersList: Hex[]): Hex {
  const encoded = encodeAbiParameters(
    [
      { name: 'codeHash', type: 'bytes32' },
      { name: 'm', type: 'uint256' },
      { name: 'signerList', type: 'address[]' }
    ],
    [
      codeHash, m, signersList
    ]
  );

  const packedEncoded = encodePacked(
    ['bytes1', 'bytes'],
    ['0x00', encoded]
  );

  return packedEncoded;
}