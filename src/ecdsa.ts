import { signAsync } from "@noble/secp256k1";

/// @dev ECDSA sign a message hash with a private key
/// @param pk The private key to sign with
/// @param msgHash The message hash to sign
/// @returns The signature as a 65-byte hex string (r || s || recoveryBit)
export const ecdsaSign = async (pk: string, msgHash: string): Promise<string> => {
  const signature = await signAsync(msgHash, pk);
  const recovery = signature.recovery.toString(16).padStart(2, '0');
  return signature.toCompactHex() + recovery;
};
