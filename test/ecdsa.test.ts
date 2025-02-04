import { describe, test, expect } from '@jest/globals';
import { ecdsaSignMsg } from "../src/utils/ecdsa";
import { ANVIL_ACCOUNTS } from "./testUtils";
import { UpdateTransactionRequest } from '../src/types/transactionRequest';
import { AXIOM_ACCOUNT, M_OF_N_ECDSA_VKEY, calcDataHash, KeystoreAccountBuilder, SAMPLE_USER_CODE_HASH, UpdateTransactionBuilder } from '../src';
import { pad, hexToBigInt } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { DOMAIN, UPDATE_TYPES } from '../src/transaction/descriptors';

describe("ecdsa", () => {
  test("should sign a message", async () => {
    const acct = ANVIL_ACCOUNTS[0];
    const pk = acct.pk;
    const msg = "message";
    const signature = await ecdsaSignMsg(pk, msg);
    expect(signature).toBe("0x63fde9fec5d1924c8837bae8f19c632291725fb94bb03fb3e8d89bf6de17f52014e402e5769d27989a73e889c9aa35c7ace790d2b239d8e1d9d07046ae2d44f51c");
  });

  test("compare EIP-712 signed message with viem signTypedData", async () => {
    const acct = ANVIL_ACCOUNTS[0];
    const pk = acct.pk;
    const salt = pad("0x01", { size: 32 });
    const dataHash = calcDataHash(SAMPLE_USER_CODE_HASH, 1n, [acct.addr]);
    const userAcct = KeystoreAccountBuilder.initCounterfactual(salt, dataHash, M_OF_N_ECDSA_VKEY);

    const nonce = 1n;
    const feePerGas = pad("0x64", { size: 32 });
    const newUserData = "0x0101010101010101";
    const txReq: UpdateTransactionRequest = {
      nonce,
      feePerGas: hexToBigInt(feePerGas),
      newUserData,
      newUserVkey: M_OF_N_ECDSA_VKEY,
      userAcct,
      sponsorAcct: AXIOM_ACCOUNT,
    };
    const updateTx = UpdateTransactionBuilder.fromTransactionRequest(txReq);
    const signature = await updateTx.sign(pk);
    
    let account = privateKeyToAccount(pk);
    let sigCmp = await account.signTypedData({
      domain: DOMAIN,
      types: UPDATE_TYPES,
      primaryType: "Update",
      message: {
        userKeystoreAddress: userAcct.keystoreAddress,
        nonce,
        feePerGas,
        newUserData,
        newUserVkey: M_OF_N_ECDSA_VKEY,
      }
    });
    expect(signature).toEqual(sigCmp);
  });
});
