const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, test } = require("node:test");
const { once } = require("node:events");

const Post = require("../models/post");
const BirdPost = require("../models/birdPost");
const Pic = require("../models/pic");
const Art = require("../models/art");
const { app, runtime } = require("../app");

let server;
const calls = [];
const originals = {
  postFind: Post.find,
  birdPostFind: BirdPost.find,
  picFind: Pic.find,
  artFind: Art.find,
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
  Art.find = originals.artFind;

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
