import { describe, test, expect } from '@jest/globals';
import { ecdsaSignMsg } from "../src/utils/ecdsa";
import { ANVIL_ACCOUNTS } from "./testUtils";
import { keccak256, stringToHex } from 'viem';
import { UpdateTransactionRequest } from '../src/types/transactionRequest';
import { AXIOM_ACCOUNT, M_OF_N_ECDSA_VKEY, calcDataHash, KeystoreAccountBuilder, SAMPLE_USER_CODE_HASH, UpdateTransactionBuilder } from '../src';
import { pad } from 'viem';

describe("ecdsa", () => {
  test("should sign a message", async () => {
    const acct = ANVIL_ACCOUNTS[0];
    const pk = acct.pk;
    const msg = "message";
    const signature = await ecdsaSignMsg(pk, msg);
    expect(signature).toBe("0x63fde9fec5d1924c8837bae8f19c632291725fb94bb03fb3e8d89bf6de17f52014e402e5769d27989a73e889c9aa35c7ace790d2b239d8e1d9d07046ae2d44f51c");
  });

  test("should sign EIP-712 message", async () => {
    const acct = ANVIL_ACCOUNTS[0];
    const pk = acct.pk;
    const salt = pad("0x1", { size: 32 });
    const dataHash = calcDataHash(SAMPLE_USER_CODE_HASH, 1n, [acct.addr]);
    const userAcct = KeystoreAccountBuilder.initCounterfactual(salt, dataHash, M_OF_N_ECDSA_VKEY);
    const txReq: UpdateTransactionRequest = {
      nonce: 0n,
      feePerGas: 100n,
      newUserData: stringToHex("newUserData"), // placeholder
      newUserVkey: M_OF_N_ECDSA_VKEY,
      userAcct,
      sponsorAcct: AXIOM_ACCOUNT,
    };
    const updateTx = UpdateTransactionBuilder.fromTransactionRequest(txReq);
    let msgHash = updateTx.userMsgHash();
    const signature = await ecdsaSignMsg(pk, msgHash);
    expect(signature).toBe("0x46aec0e756ab98c4e7c1fc86fd39d5bb9587517299eab471c46422bb8a516a046976f4129d0d47933e2f353c3fd9fd4dec65eefd1c20e49bf391d8ea9653142a1c");
  });
});
