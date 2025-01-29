import { encodeAbiParameters, encodePacked, Hex, keccak256 } from "viem";

export function calcDataHash(codeHash: Hex, m: bigint, signersList: Hex[]): Hex {
  let data_hash_data = encodeDataHashData(codeHash, m, signersList);
  return keccak256(data_hash_data);
}

function encodeDataHashData(codeHash: Hex, m: bigint, signersList: Hex[]): Hex {
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