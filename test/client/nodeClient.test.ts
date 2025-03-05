import { createNodeClient, NodeClient } from "../../src";
import { NODE_URL } from "../testUtils";
import { runNodeClientTests } from "./sharedClientTests";

describe("Keystore Node Client", () => {
  let nodeClient: NodeClient;

  beforeEach(() => {
    nodeClient = createNodeClient({ url: NODE_URL });
  });

  describe("Run Node Client Tests", () => {
    runNodeClientTests(nodeClient);
  });
});
