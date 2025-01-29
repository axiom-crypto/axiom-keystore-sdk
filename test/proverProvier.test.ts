import { describe, test } from '@jest/globals';
import { KeystoreSignatureProverProvider } from "../src/provider";
import { ANVIL_ACCOUNTS, CODE_HASH, SIGNATURE_PROVER_URL } from './testUtils';
import { Hex, pad } from 'viem';
import { AXIOM_ACCOUNT, AXIOM_CODEHASH, AXIOM_EOA, AXIOM_VKEY, ecdsaSign } from "../src";
import { calcDataHash } from "../src/dataHash";
import { KeystoreAccountBuilder, UpdateTransactionRequest } from '../src/types/transactionRequest';
import { UpdateTransactionBytes } from '../src/transaction';
import { SponsorAuthInputs } from '../src/types/input';

describe('keystore prover provider', () => {
  let provider: KeystoreSignatureProverProvider;

  beforeEach(() => {
    provider = new KeystoreSignatureProverProvider(SIGNATURE_PROVER_URL);
  });

  test('keystore_sponsorAuthenticateTransaction', async () => {
    const salt = pad("0x01");
    const vk = AXIOM_VKEY;

    const pk: Hex = `0x${ANVIL_ACCOUNTS[0].pk}`;
    const eoaAddr: Hex = `0x${ANVIL_ACCOUNTS[0].addr}`;

    const userCodeHash = CODE_HASH;
    const dataHash = calcDataHash(userCodeHash, 1n, [eoaAddr]);
    const userAcct = KeystoreAccountBuilder.withSalt(salt, dataHash, vk);

    const sponsorAcct = AXIOM_ACCOUNT;

    const txReq: UpdateTransactionRequest = {
      nonce: 0n,
      feePerGas: 100n,
      newUserData: pad("0x01"),
      newUserVkey: pad("0x01"),
      userAcct,
      sponsorAcct,
    };
    const updateTx = UpdateTransactionBytes.fromTransactionRequest(txReq);

    const userMsgHash = updateTx.userMsgHash().replace('0x', '');
    const pk2 = pk.replace('0x', '');
    const userSig: Hex = `0x${await ecdsaSign(pk2, userMsgHash)}`;

    const sponsorAuthInputs: SponsorAuthInputs = {
      sponsorAuth: {
        codeHash: AXIOM_CODEHASH,
        signatures: [],
        eoaAddrs: [AXIOM_EOA]
      },
      userAuth: {
        codeHash: userCodeHash,
        signatures: [userSig],
        eoaAddrs: [eoaAddr]
      }
    };

    const txBytes = updateTx.txBytes();

    const requestHash = await provider.sponsorAuthenticateTransaction(txBytes, sponsorAuthInputs);
    console.log(requestHash);
  });

  test('keystore_getSponsorAuthenticationStatus', async () => {
    const requestHash = "0x4625e121b8f18810c44ad3377a367337f618766e02f8d7c511ae7c62cc708460";
    let status = await provider.getSponsorAuthenticationStatus(requestHash);

    let updateTx = status.authenticatedTransaction ? UpdateTransactionBytes.decodeTxBytes(status.authenticatedTransaction) : undefined;
  });
});
