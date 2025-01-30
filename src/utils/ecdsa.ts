import { signAsync } from "@noble/secp256k1";
import { Data, Hash } from "../types/primitives";

/// @dev ECDSA sign a message hash with a private key
/// @param pk The private key to sign with
/// @param msgHash The message hash to sign
/// @returns The signature as a 65-byte hex string (r || s || recoveryBit)
export const ecdsaSign = async (pk: Hash, msgHash: Hash): Promise<Data> => {
  const signature = await signAsync(msgHash.toString().slice(2), pk.toString().slice(2));
  const recovery = signature.recovery.toString(16).padStart(2, '0');
  return `0x${signature.toCompactHex()}${recovery}`;
};
