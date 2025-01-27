import { describe, test, expect } from '@jest/globals';
import { ecdsaSign } from "../src/ecdsa";
import { keccak256 } from "../src/keccak";
import { ANVIL_ACCOUNTS } from "./testUtils";

describe("ecdsa", () => {
  test("should sign a message", async () => {
    const acct = ANVIL_ACCOUNTS[0];
    const pk = acct.pk;
    const msg = "message";
    const msgHash = keccak256(msg);
    expect(msgHash).toBe("c2baf6c66618acd49fb133cebc22f55bd907fe9f0d69a726d45b7539ba6bbe08");
    const signature = await ecdsaSign(pk, msgHash);
    expect(signature).toBe("8eaafbfa489264d48377de32bd1ba0c63eb6630e9002879e3bff8f4847fb86b80e4207a30c107906cc064e3a35b342d3ce28c27429cb6f7f755e5dd3695606c301");
  });
});
