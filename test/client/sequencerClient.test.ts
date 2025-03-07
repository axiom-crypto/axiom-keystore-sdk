import {
  BlockTag,
  createSequencerClient,
  createUpdateTransactionClient,
  SequencerClient,
  SEQUENCER_URL,
} from "../../src";
import { TEST_TX_REQ } from "../testUtils";
import { runNodeClientTests } from "./sharedClientTests";

describe("Keystore Sequencer Client", () => {
  let sequencerClient: SequencerClient;

  beforeEach(() => {
    sequencerClient = createSequencerClient({ url: SEQUENCER_URL });
  });

  describe("Native Sequencer Requests", () => {
    test("keystore_sendRawTransaction", async () => {
      const txBytes =
        "0x0200f9124080a00000000000000000000000000000000000000000000000000000000000000064a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000001a0f2911e2c33bc82dc2444fafb6379bbc27283c55aa48ba7deddc90252d13c5b06a00000000000000000000000000000000000000000000000000000000000000001a0575b74d3b8b463c05e565bdce9f26fb36225ca0c27f9d3fde50a9037326b4b1cb901220101000000100100010001010000010000000000000000000000000000000000005e34f09e1badd1b13158510edfab5c546c5fad0bf3f432b3e30c43cd233d15073d8fba654fea9aa5752d0f2965bc43822f9c4febbed9b9ff67d7bc6d7deac62151950e7e9458e99ccdac816a57003023cb35ccb46823609e7f708ee392d207203ff53be4f960cbcf9a2d054aaa950dd27481accda50c2ee8edaa312e62c3dc06c3c7f8b93a350d854985a69bb1482a241cd0406e95cca5532b60ed4f56f43d0383ac40ea937fb5b10c5776f8f39e66a4fa0678c27cfb0ad7c4cf7eabb86ab419aa62b004534a2fecbdebcca29b7af90f5c4af931563c27afd4da97f88e20131922db6f7f31a566211c201e1480b47b4899adc95dafda721247fc096bd80a384d16b90760000000000000000000000000000000000000000000c8bdafafea6e7c3f4abac100000000000000000000000000000000000000000058132efc73c1f38ac26366000000000000000000000000000000000000000000002acd2814f05d4dcaacf000000000000000000000000000000000000000000044ff8084d2c18c14407b820000000000000000000000000000000000000000009defabb2fc04d3d0e0726f000000000000000000000000000000000000000000000a50a69e75e57953175d0000000000000000000000000000000000000000000978d8b98241950df510760000000000000000000000000000000000000000008dce8f9cee06d8f3d1fd06000000000000000000000000000000000000000000002a770d304fb6ee229006000000000000000000000000000000000000000000fe103340c7ed8b371ec6a50000000000000000000000000000000000000000002843cd51af63df76e6085f000000000000000000000000000000000000000000001b456daa1d7d416b5d3000000000000000000000000000000000575b74d3b8b463c05e565bdce9f26fb3000000000000000000000000000000006225ca0c27f9d3fde50a9037326b4b1c00000000000000000000000000000000cf9e91d77b912dcd9208faef5f8c561700000000000000000000000000000000ae631e6533e308c1aa72429c020f7fd10a296cb08b3f5e3386a1e79f8ff5763289e1785a79a18e18068ffbf9e4801e602a3facf3e5d9fbc2b0788c8979812002e7b46a7d96473a5dbd7421e5405687b300ca1749649e55dd9f9efabc6953ad00afb5c5c06ed963c58cf51398f37afe5522620b1ba965d62c67b051a10b6470822cd9ca401f03c1c1c0fa3995cb8dd32307ad3c738af1863e43a1e347ee4def665453df038ca050d0776fb63043cc88e80c6cc3378d684aa55973616e61a3b3d4521749a51adaa185ac20fbdaf7a866280ae03ce2df5c948e37b1bc00e2c8c4fae3c6e29f3681b71d9f7927933944d7cb2dd33c20783ad3e5c2b080c84978e664c134a7117ca2f09c17e18216b4e5c01e119d77086b58312ea3553e18abccfe6215d117bc56e0c6f456fa01106f0de5651f2e2830ed0e697d13b7d00a221468fd10837c0652b3fc43613384426f6c8d3e04a2ecb2b6beca5e8b92560dcc955f652409c72629c7622f019ba6169ecfb2b4155e3f0d621dc5d6606db11f2142df6240f71b60326d06b0f1579e26bdcd085c1c96937dd72d6c8139ab80c9bba2a919ef7f81e376737ea5c6aa0c747a3d0a2a1a27eeaeddca7be089b015eecea81d39aac3eeb1da52916f34e1dccc89faa8a92cfa0d5b584f01584eb9eb03cfbc92aa3302f912175525fba307e517fb4194d90d88efddc62a2ad1dd109dd6534e3007472abb497590a412c60b6b6757af2a072dae9ffb4a9445175e10938d5e1f0dc7f56e8baaff57e98a80713d5bfbd2f55307be6f9cb1b516d035caddc23dd30f93143537841d5bbc88adce7abf6b7336f22305f34142515f4e21eb081f801759fafcb572a25dcbc2dbb4847b3a480589c7135e05171da155bf5f74944fa6b80070b37bca99d40dc4bf7668e5ea6cdf4fe81d8a3c4249bc7439f8f0977bb5e9b0fb7ba4dcc7913bdcfef1532fff6f1812d9259fc4ea0ba495bf79c7d8fe761f229867decdff4f09a98cb8555f4db88a55fe06d6e614d4bfef0e34396b22427c1a32177fb5ab49f1371b47e3aa341ea74b710fc55e934bf775b123e6d5df6ff897f3dea8ba045ae9122bed37c9769c957bfb156dcc4d7c3a22591069dd818f0487597438ccfa49a55542e02a19a1d8f3d873226500fce37cb1a6ce65a710fdfbed96e1deca83f7b978a6fcfc226b7b4d6e640ca1382699b48e747369e7321e9d5a847247de34372a0b356cfb97146117ed3c0bd37719140edc4d76b3c93b8d86112a1c64b5b28b1063e9aa9135a92ec42d342dfabbdc44ce6f06c905106f6a6e27f26f95a8459cbdb13e398fdfd6496c4593296c1618f8541dcddeb72a532b73f423ef3c2cc0bad0a77224ed991c980751f52febb63608c6616525544f6e2db6d8ec7444683e37cbb542215d9ceb67e1ab4500eeff70a0e33d2e28225cc1f301280dd7ba99054a5ede9d53046952685613370b9e8fe5a8771ff80a9f2a0e84dbbb4c90cb72273801e2b358bf26bb78cba55824dd331a5fab565aee32a1d71188422650a3742f0063b47fc504b416a72193291b0398f238bca3716042cc9fc0c364bbd7b859bfb546f00eebfdf0f88be3022e2503127376c1058d35204811f902450a2ef9be98e4d85b10c890ba4a076489200b97d768fd605a9cf5b06053b0b72b48a1d11a000f573ba1fc59a65e68e7e3fb20896e4bbe0e181da4ad8625fbeab0933d8a896b04b5501a262dbbc9ac4b76481aee17617b03d2344f4a9db87e5ddf66de83485af112ef94c91fc9749e782065237b6be53302e84b3f00b03aaf892b95415c1c6b2aa3c10279a5d0cd063dd8871c00442e8f5962b52533dde6c0ab270a73f4461b329bf25041eef2ffe60ae8f9038303c0e2918a89621a33d690800823ac6e1e3a3a60cb82c1aeaf5e5610f9041acbd4d55402d5ef326064fe94f28686e9d0bf48074e54a36919dcac347d3150b9018bf90188a0c3a9b82816196f3f5692dda37ee242839ce86357dc06a205ce04da56a3651e06a00000000000000000000000000000000000000000000000000000000000000000a0ecf85bc51a8b47c545dad1a47e868276d0a92b7cf2716033ce77d385a6b67c4bb901220101000000100100010001010000010000000000000000000000000000000000005e34f09e1badd1b13158510edfab5c546c5fad0bf3f432b3e30c43cd233d15073d8fba654fea9aa5752d0f2965bc43822f9c4febbed9b9ff67d7bc6d7deac62151950e7e9458e99ccdac816a57003023cb35ccb46823609e7f708ee392d207203ff53be4f960cbcf9a2d054aaa950dd27481accda50c2ee8edaa312e62c3dc06c3c7f8b93a350d854985a69bb1482a241cd0406e95cca5532b60ed4f56f43d0383ac40ea937fb5b10c5776f8f39e66a4fa0678c27cfb0ad7c4cf7eabb86ab419aa62b004534a2fecbdebcca29b7af90f5c4af931563c27afd4da97f88e20131922db6f7f31a566211c201e1480b47b4899adc95dafda721247fc096bd80a384d16b90760000000000000000000000000000000000000000000170ba985dc340914d61c0a000000000000000000000000000000000000000000b92de8211a52f8d72d099d0000000000000000000000000000000000000000000027ffe188f642bd8988fa00000000000000000000000000000000000000000096e6bc24e536c4a5c8fbdb000000000000000000000000000000000000000000f3f1f707be62d17ad933220000000000000000000000000000000000000000000029bded7af3b8caedc79e000000000000000000000000000000000000000000114ff6211a8fd575f3f67c000000000000000000000000000000000000000000cc9a3c4f1964a1c49a57af0000000000000000000000000000000000000000000007dcd2345d7af41d1ea600000000000000000000000000000000000000000075993bdb4b0b78e02e53c1000000000000000000000000000000000000000000f04b1fae9c7daa2c8feda4000000000000000000000000000000000000000000002ec5b8e3a059d289bd2200000000000000000000000000000000ecf85bc51a8b47c545dad1a47e86827600000000000000000000000000000000d0a92b7cf2716033ce77d385a6b67c4b000000000000000000000000000000004436ab4e90fabf407b2e3ba75e5bd8d70000000000000000000000000000000076e7aff8aafeb9f11a438342b78b64300fcc2b692e9cde95dd28936d70ed4897748313154b8bd102ecb3aee716c5271e12950b1085003e985f23c9ebfdbbf0f0ca22d232d42e720641b9ef4ffbbbbb7c2452810e37c1a9919a05b8f447fa35575c63e0ab43524180a0307b31043cad1a1b6a0153d33caaa36f39a6a092056795360eec2e9d91a5d216fb623c5c1263851da63c38734707693e433c9bcfcc8812bf69bdbb185f5354541d1dc22988d4111e8b850dc0929a11f1c3bb16667d47089338b52f0675f514b71bb02ed155cb401db4186d52734419af21d017776b74ba22229c255da5d33af65ed1c14c764cbd141eb596b9ec01cec15ce478d41e60b01c3784a82d61a0481f18d6ac268acc882bc5e0e2a20899dd7a5bb738752ddc1520569e2dd4006d0eb87aa5d6b0e5204c1fc44e909b19c19219e07d9a3e1a26a201dcd8ab7c94f02184fb4c6199f1c33102aa6930e4069df855ef4b293aafffb8136802fb71ace0ffaef653b4025d79ee151274f8de403033e4c97968f3d8119fb17f242344a20605d01c8f51ec13b4db1926a736933d6ab9b7e232f4b1e7f8255b4f665f71449a94010c6ecb1739fa6a1627caeb21dc925f7902fa9153fd56fc88fd134db3b245ff258251297db5ee0726804883b13bf2abc3be1c04ef25d5966ca35452b82d2f187ab131480cd690f72a0859238be9b61c92e3e96ebab4f115a34de6059887e6959a0ab296aa131c9b05938ccdace03e224736ebc8c13177833689562fbec10f925d6905ffb9361ba5220b7d29b5463778ec3b26e5ac82a2eb41a1b89a7b6b6c201da8eea505e4c72715e7843bd5c2a7ece56a21500dddbd435b2ea12f3fd57111b942d8bc39bb340f09de02a0e2e1a80e7681bc6d408c79b74ec46cc052691c4c130b18cc2ddd97711aa9cb1477909b8264ad38350b105340528406df6c456f0a2b61340cf641fa85154d4f693e67e3dee9703c02409b16ad95de5188206b54985c0f4de8019c64ba2879cdc4bd5994804b8c02a3dd569b967130a31c810fe9d252ed061d28d2ec03047fb69d9213968115d2e47798c5332105eb018b609462742beecca1d1d07c0a2e7b2ad6a5e3af654f5dc852d5d0dc4ece6377d6fcc3f4214d0e5bdddd8edb4e224c530b0ed404fe983d6809db2959e47fc84314efe014d20987c11fc14ff85017f223e64bd85eede21d262548f099d8d26b92af36d5dcd6acca5e671d0900e122c72bcb3b6bb791d0a1bc61be3b54c68c88051b4fcc1f128b4f0bcc2fc71e9f013e6946d57c13549504b70c4cbef8db59103caa1fd7d43dbee28854d9cf3c832c3ffb2d6fb68786191045fe8d1f6ea8eaa4309bef8f1a0656a097072d3ca90523867995d83f8de94e995ad65875cf21fbfe858123c35c726082c28bd82a10c810f90cd6cf9d4f17a7220085922c5ec709042f2804fe3259eed33d45eb72bcc817cf70bbeadbd76d02462e0c6b56f28664eac9da0f18281a143f0619cef4d473268e0d4f8661faaaee795e41d67c5043315ffdb971dba6f9f9229869f79a3c572bc4480a6b930d394c298c0651c9770891ac57adb41350f2921e2629b11e8fc410072af69a1ee8efb2157077d0b8e3586cfcf65afe8ab5f88dddb27eb0d1168e059ccd87dee7ec29bb51a1bbdeae12c60d12bc2b9c3c7290abe6575f2b8da6c72bea5e582255b5dd5228b8915b559861cd3788eb3816cdafc733f3d74685b3bb070256ac9cb33775631fdabc5c32a678f1a383b83ca6ebe8930bc23192d93ce90051e7ceb1bf7828b849a6d8134a3ff077d120067d48e706651bc9f5624ee4251308bd96d70e5353c3fd8180f075bcae80bc463ec1e1e408472af03cd618119d1d4977c7ecb0a4ffb9d028ff9d70e9cf5452af585fa6a1e0bc7f8cdaf10a35371cb1e3ffbf3da62819cc171ba2531b2a41acf5527b248b940389685fe287d7c9";
      await expect(sequencerClient.sendRawTransaction({ data: txBytes })).rejects.toThrow(); // already sent
    });

    test("keystore_gasPrice", async () => {
      const gasPrice = await sequencerClient.gasPrice();
      expect(typeof gasPrice).toBe("bigint");
    });

    test("keystore_estimateGas", async () => {
      const tx = createUpdateTransactionClient(TEST_TX_REQ);
      const gasEstimate = await sequencerClient.estimateGas({ txData: tx.toBytes() });
      expect(typeof gasEstimate).toBe("bigint");
    });

    test("keystore_estimateL1DataFee", async () => {
      const tx = await createUpdateTransactionClient(TEST_TX_REQ);
      const l1FeeEstimate = await sequencerClient.estimateL1DataFee({
        txData: tx.toBytes(),
        block: BlockTag.Latest,
      });
      expect(typeof l1FeeEstimate).toBe("bigint");
    });
  });

  describe("Node-inherited Sequencer Requests", () => {
    runNodeClientTests(sequencerClient);
  });
});
