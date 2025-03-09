import { createNodeClient, NODE_URL } from "../../src";
import { runNodeClientTests } from "./sharedClientTests";

describe("Keystore Node Client", () => {
  describe("Run Node Client Tests", () => {
    runNodeClientTests(() => createNodeClient({ url: NODE_URL }));
  });
});
