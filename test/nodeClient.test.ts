import { createNodeClient, NodeClient } from "../src";
import { NODE_URL } from "./testUtils";

describe("Keystore Node Client", () => {
  let nodeClient: NodeClient;

  beforeEach(() => {
    nodeClient = createNodeClient({ url: NODE_URL });
  });

  test("keystore_syncStatus", async () => {
    const resp = await nodeClient.syncStatus();
    expect(resp.committedL2).toBeDefined();
    expect(resp.finalizedL2).toBeDefined();
  });

  test("keystore_blockNumber", async () => {
    const resp = await nodeClient.blockNumber();
    console.log(resp);
    expect(typeof resp).toBe("bigint");
  });
});
