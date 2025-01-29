import { signAsync } from "@noble/secp256k1";
import { Hex } from "viem";

/// @dev ECDSA sign a message hash with a private key
/// @param pk The private key to sign with
/// @param msgHash The message hash to sign
/// @returns The signature as a 65-byte hex string (r || s || recoveryBit)
export const ecdsaSign = async (pk: Hex, msgHash: Hex): Promise<Hex> => {
  let cleanPk = pk.replace('0x', '');
  let cleanMsgHash = msgHash.replace('0x', '');

  const signature = await signAsync(cleanMsgHash, cleanPk);
  const recovery = signature.recovery.toString(16).padStart(2, '0');
  const result = signature.toCompactHex() + recovery;
  return `0x${result}`;
};
