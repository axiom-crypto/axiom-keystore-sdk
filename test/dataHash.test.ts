import { describe, test, expect } from "@jest/globals";
import { calcMOfNDataHash } from "../src/dataHash";

describe("dataHash", () => {
  test("calcMOfNDataHash", () => {
    const userCodeHash =
      "0x595b7552e60f6430c898abc2b292aa805e94834a576f57969406940f6d12d4d9";
    const eoaAddr = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

    const dataHash = calcMOfNDataHash(userCodeHash, 1n, [eoaAddr]);
    expect(dataHash).toBe(
      "0x575b74d3b8b463c05e565bdce9f26fb36225ca0c27f9d3fde50a9037326b4b1c",
    );
  });
});
