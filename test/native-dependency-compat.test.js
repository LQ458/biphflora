const assert = require("node:assert/strict");
const { test } = require("node:test");
const bcrypt = require("bcrypt");
const sharp = require("sharp");

test("bcrypt verifies a pre-existing bcrypt hash after native upgrades", async () => {
  const legacyHash = "$2b$04$jzszmk5tCZwkqDF/m8tuO./jG1Upc.A/zuzpimCUWF03Jh2aHAFk6";

  assert.equal(await bcrypt.compare("legacy-password", legacyHash), true);
  assert.equal(await bcrypt.compare("wrong-password", legacyHash), false);
});

test("sharp retains the image metadata API used by the compressor", async () => {
  const metadata = await sharp({
    create: {
      width: 4,
      height: 3,
      channels: 3,
      background: "#4f7f3f",
    },
  }).metadata();

  assert.equal(metadata.width, 4);
  assert.equal(metadata.height, 3);
  assert.equal(metadata.channels, 3);
});
