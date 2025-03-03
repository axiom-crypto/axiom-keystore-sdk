import { createSequencerClient, SequencerClient } from "../src";
import { SEQUENCER_URL } from "./testUtils";

describe("Keystore Sequencer Client", () => {
  let sequencerClient: SequencerClient;

  beforeEach(() => {
    sequencerClient = createSequencerClient({ url: SEQUENCER_URL });
  });

  test("keystore_syncStatus", async () => {
    const resp = await sequencerClient.syncStatus();
    expect(resp.committedL2).toBeDefined();
    expect(resp.finalizedL2).toBeDefined();
  });

  test("keystore_blockNumber", async () => {
    const resp = await sequencerClient.blockNumber();
    console.log(resp);
    expect(typeof resp).toBe("bigint");
  });
});
