import { ecdsaSignMsg } from "../../src/utils/ecdsa";
import { TEST_ACCOUNTS } from "../testUtils";

describe("ecdsa", () => {
  test("should sign a message", async () => {
    const acct = TEST_ACCOUNTS[0];
    const pk = acct.pk;
    const msg = "message";
    const signature = await ecdsaSignMsg(pk, msg);
    expect(signature).toBe(
      "0x63fde9fec5d1924c8837bae8f19c632291725fb94bb03fb3e8d89bf6de17f52014e402e5769d27989a73e889c9aa35c7ace790d2b239d8e1d9d07046ae2d44f51c",
    );
  });
});
