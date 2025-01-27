import { signAsync } from "@noble/secp256k1";

export const ecdsaSign = async (pk: string, msgHash: string): Promise<string> => {
  const signature = await signAsync(msgHash, pk);
  const recovery = signature.recovery.toString(16).padStart(2, '0');
  return signature.toCompactHex() + recovery;
};
