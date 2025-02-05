import { Data, Hash } from "../types/primitives";
import { privateKeyToAccount } from "viem/accounts";

/// @dev Generate an ECDSA signature for a message hash with a private key
/// @param pk The private key to sign with
/// @param msgHash The hash of the message to sign
/// @returns The signature as a 65-byte hex string (r || s || v)
export const ecdsaSign = async (pk: Hash, msgHash: Hash): Promise<Data> => {
  const account = privateKeyToAccount(pk);
  const signature = await account.sign({
    hash: msgHash,
  });
  return signature;
};

/// @dev Generate an ECDSA signature for a message with a private key
/// @param pk The private key to sign with
/// @param msg The message to sign
/// @returns The signature as a 65-byte hex string (r || s || v)
export const ecdsaSignMsg = async (pk: Hash, msg: string): Promise<Data> => {
  const account = privateKeyToAccount(pk);
  const signature = await account.signMessage({
    message: msg,
  });
  return signature;
};
