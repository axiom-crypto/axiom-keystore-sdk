import { describe, test } from "@jest/globals";
import { ANVIL_ACCOUNTS, CODE_HASH, SIGNATURE_PROVER_URL } from "./testUtils";
import { Hex, pad } from "viem";
import { calcMOfNDataHash } from "../src/dataHash";
import {
  AXIOM_ACCOUNT,
  AXIOM_CODEHASH,
  AXIOM_EOA,
  M_OF_N_ECDSA_VKEY,
  Data,
  KeystoreAccountBuilder,
  UpdateTransactionBuilder,
  UpdateTransactionRequest,
  KeystoreSignatureProverProvider,
} from "../src";
import {
  makeMOfNEcdsaAuthInputs,
  SponsoredAuthInputs,
} from "../src/types/input";

describe("keystore prover provider", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let provider: KeystoreSignatureProverProvider;

  beforeEach(() => {
    provider = new KeystoreSignatureProverProvider(SIGNATURE_PROVER_URL);
  });

  test(
    "keystore_authenticateSponsoredTransaction",
    async () => {
      const salt = pad("0x01");
      const vk = M_OF_N_ECDSA_VKEY;

      const pk = ANVIL_ACCOUNTS[0].pk as Hex;
      const eoaAddr = ANVIL_ACCOUNTS[0].addr as Hex;

      const userCodeHash = CODE_HASH;
      const dataHash = calcMOfNDataHash(userCodeHash, 1n, [eoaAddr]);
      const userAcct = KeystoreAccountBuilder.initCounterfactual(
        salt,
        dataHash,
        vk,
      );

      const sponsorAcct = AXIOM_ACCOUNT;

      const txReq: UpdateTransactionRequest = {
        nonce: 0n,
        feePerGas: 100n,
        newUserData: pad("0x01"),
        newUserVkey: pad("0x01"),
        userAcct,
        sponsorAcct,
      };
      const updateTx = UpdateTransactionBuilder.fromTransactionRequest(txReq);
      const userSig: Data = await updateTx.sign(pk);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const sponsoredAuthInputs: SponsoredAuthInputs = {
        type: "ProveSponsored",
        userAuthInputs: makeMOfNEcdsaAuthInputs(AXIOM_CODEHASH, [], [AXIOM_EOA], vk),
        sponsorAuthInputs: makeMOfNEcdsaAuthInputs(userCodeHash, [userSig], [eoaAddr], vk),
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const txBytes = updateTx.txBytes();

      // const requestHash = await provider.authenticateSponsoredTransaction(txBytes, sponsoredAuthInputs);
      // console.log(requestHash);
    },
    120 * 1000,
  );

  test("keystore_getSponsoredAuthenticationStatus", async () => {
    // const requestHash = "0x4625e121b8f18810c44ad3377a367337f618766e02f8d7c511ae7c62cc708460";
    // let status = await provider.getSponsoredAuthenticationStatus(requestHash);
    // console.log(status.status);
    // if (status.authenticatedTransaction) {
    //   let _ = UpdateTransactionBuilder.decodeTxBytes(status.authenticatedTransaction);
    // }
  });
});
