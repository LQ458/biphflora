const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, test } = require("node:test");
const { once } = require("node:events");

const Post = require("../models/post");
const BirdPost = require("../models/birdPost");
const Pic = require("../models/pic");
const Art = require("../models/art");
const creationBottom = require("../models/creationBottom");
const FeatureHome = require("../models/featureHome");
const { app, runtime } = require("../app");

let server;
const calls = [];
const originals = {
  postFind: Post.find,
  birdPostFind: BirdPost.find,
  picFind: Pic.find,
  picAggregate: Pic.aggregate,
  artFind: Art.find,
  creationBottomFind: creationBottom.find,
  featureHomeFind: FeatureHome.find,
};

function request(pathname, { method = "GET", body, headers = {} } = {}) {
  const payload = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: "127.0.0.1",
      port: server.address().port,
      path: pathname,
      method,
      headers: {
        ...headers,
        ...(payload
          ? {
              "content-type": "application/json",
              "content-length": Buffer.byteLength(payload),
            }
          : {}),
      },
    };
    const req = http.request(requestOptions, (res) => {
      let responseBody = "";

      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseBody ? JSON.parse(responseBody) : null,
        });
      });
    });

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

before(async () => {
  Post.find = async (query) => {
    calls.push({ model: "Post", query });

    if (query.latinName) {
      return [{ latinName: query.latinName, authorization: true }];
    }

    return [{ latinName: "Acer rubrum", authorization: true }];
  };
  BirdPost.find = async (query) => {
    calls.push({ model: "BirdPost", query });

    if (query.latinName) {
      return [{ latinName: query.latinName, authorization: true }];
    }

    return [{ latinName: "Corvus corax", authorization: true }];
  };
  Pic.find = async (query) => {
    calls.push({ model: "Pic", query });
    return [{ path: "/plantspic/example.jpg", art: "photography" }];
  };
  Art.find = async (query) => {
    calls.push({ model: "Art", query });
    return [{ path: "/plantspic/example-art.jpg" }];
  };

  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
});

after(async () => {
  Post.find = originals.postFind;
  BirdPost.find = originals.birdPostFind;
  Pic.find = originals.picFind;
  Pic.aggregate = originals.picAggregate;
  Art.find = originals.artFind;
  creationBottom.find = originals.creationBottomFind;
  FeatureHome.find = originals.featureHomeFind;

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test("importing the application does not make dependencies ready", () => {
  assert.deepEqual(runtime.getReadiness(), {
    ready: false,
    dependencies: {
      mongodb: false,
      redis: false,
    },
  });
});

test("health endpoints expose liveness separately from dependency readiness", async () => {
  const live = await request("/health/live");
  const ready = await request("/health/ready");

  assert.equal(live.status, 200);
  assert.deepEqual(live.body, { status: "live" });
  assert.equal(ready.status, 503);
  assert.deepEqual(ready.body, {
    status: "not_ready",
    dependencies: {
      mongodb: false,
      redis: false,
    },
  });
});

test("public read routes retain search, detail, count, refresh, and CORS contracts", async () => {
  const search = await request("/searchNames", {
    headers: { origin: "https://www.biphflora.com" },
  });
  const birdSearch = await request("/searchBirdNames");
  const plantDetail = await request("/syncPlantInfo", {
    method: "POST",
    body: { postName: "Acer rubrum" },
  });
  const birdDetail = await request("/syncBirdInfo", {
    method: "POST",
    body: { postName: "Corvus corax" },
  });
  const plantCount = await request("/numOfPlants");
  const birdCount = await request("/numOfBirds");
  const refresh = await request("/refresh");

  assert.equal(search.status, 200);
  assert.equal(
    search.headers["access-control-allow-origin"],
    "https://www.biphflora.com",
  );
  assert.deepEqual(search.body, {
    success: true,
    returnNames: [{ latinName: "Acer rubrum", authorization: true }],
    numOfPlants: 1,
  });
  assert.deepEqual(birdSearch.body, {
    success: true,
    returnNames: [{ latinName: "Corvus corax", authorization: true }],
    numOfPlants: 1,
  });
  assert.deepEqual(plantDetail.body, {
    resultPost: [{ latinName: "Acer rubrum", authorization: true }],
    photographs: [{ path: "/plantspic/example.jpg", art: "photography" }],
    arts: [{ path: "/plantspic/example-art.jpg" }],
  });
  assert.deepEqual(birdDetail.body, {
    resultPost: [{ latinName: "Corvus corax", authorization: true }],
    photographs: [{ path: "/plantspic/example.jpg", art: "photography" }],
    arts: [{ path: "/plantspic/example-art.jpg" }],
  });
  assert.deepEqual(plantCount.body, { numOfPlants: 1 });
  assert.deepEqual(birdCount.body, { numOfPlants: 1 });
  assert.deepEqual(refresh.body, {
    success: false,
    message: "Token not valid",
  });
  assert.deepEqual(calls, [
    { model: "Post", query: { authorization: true } },
    { model: "BirdPost", query: { authorization: true } },
    {
      model: "Post",
      query: { latinName: "Acer rubrum", authorization: true },
    },
    {
      model: "Pic",
      query: { art: "photography", plant: "Acer rubrum" },
    },
    { model: "Art", query: { plant: "Acer rubrum" } },
    {
      model: "BirdPost",
      query: { latinName: "Corvus corax", authorization: true },
    },
    {
      model: "Pic",
      query: { art: "photography", plant: "Corvus corax" },
    },
    { model: "Art", query: { plant: "Corvus corax" } },
    { model: "Post", query: { authorization: true } },
    { model: "BirdPost", query: { authorization: true } },
  ]);
});

test("public content routes retain documentary, glossary, media, and feature contracts", async () => {
  Post.find = async (query) => {
    calls.push({ model: "Post", query });
    return [
      {
        latinName: "Acer rubrum",
        chineseName: "红花槭",
        authorization: true,
      },
    ];
  };
  BirdPost.find = async (query) => {
    calls.push({ model: "BirdPost", query });
    return [
      {
        latinName: "Corvus corax",
        chineseName: "渡鸦",
        authorization: true,
      },
    ];
  };
  Pic.find = async (query) => {
    calls.push({ model: "Pic", query });
    return [
      { path: "/plantspic/spring.jpg", season: "spring" },
      { path: "/plantspic/winter.jpg", season: "winter" },
    ];
  };
  Pic.aggregate = async (pipeline) => {
    calls.push({ model: "Pic", pipeline });
    return [{ path: "/plantspic/random.jpg" }];
  };
  Art.find = async (query) => {
    calls.push({ model: "Art", query });
    return [{ path: "/plantspic/art.jpg" }];
  };
  creationBottom.find = async (query) => {
    calls.push({ model: "creationBottom", query });
    return [{ plant: "Acer rubrum", auth: true }];
  };
  FeatureHome.find = () => ({
    lean: async () => [{ plant: "Acer rubrum" }],
  });

  const documentary = await request("/creationDocumentary");
  const userInfo = await request("/userInfo");
  const plantGlossary = await request("/userInfoGlossary");
  const birdGlossary = await request("/userInfoGlossaryBird");
  const seasonalPics = await request("/getPics", {
    method: "POST",
    body: { plant: "Acer rubrum" },
  });
  const randomPics = await request("/getDb2Pic");
  const randomBirdPics = await request("/getDb2PicBird");
  const randomAlt = await request("/db2Alt");
  const randomBirdAlt = await request("/db2AltBird");
  const media = await request("/getPicsAndArts", {
    method: "POST",
    body: { plant: "Acer rubrum" },
  });

  assert.deepEqual(documentary.body, {
    success: true,
    allDisplays: [{ plant: "Acer rubrum", auth: true }],
  });
  assert.deepEqual(userInfo.body, {
    success: false,
    featureLists: [{ plant: "Acer rubrum" }],
  });
  assert.equal(plantGlossary.body.success, false);
  assert.deepEqual(plantGlossary.body.glossary.a, ["Acer rubrum"]);
  assert.deepEqual(plantGlossary.body.cnNames.a, ["红花槭"]);
  assert.equal(birdGlossary.body.success, false);
  assert.deepEqual(birdGlossary.body.glossary.c, ["Corvus corax"]);
  assert.deepEqual(birdGlossary.body.cnNames.c, ["渡鸦"]);
  assert.deepEqual(seasonalPics.body, {
    success: true,
    springPics: [{ path: "/plantspic/spring.jpg", season: "spring" }],
    summerPics: [],
    autumnPics: [],
    winterPics: [{ path: "/plantspic/winter.jpg", season: "winter" }],
  });
  assert.deepEqual(randomPics.body, {
    success: true,
    pics: [{ path: "/plantspic/random.jpg" }],
  });
  assert.deepEqual(randomBirdPics.body, randomPics.body);
  assert.deepEqual(randomAlt.body, {
    success: true,
    pic: [{ path: "/plantspic/random.jpg" }],
  });
  assert.deepEqual(randomBirdAlt.body, randomAlt.body);
  assert.deepEqual(media.body, {
    success: true,
    pics: [
      { path: "/plantspic/spring.jpg", season: "spring" },
      { path: "/plantspic/winter.jpg", season: "winter" },
    ],
    arts: [{ path: "/plantspic/art.jpg" }],
  });
});
