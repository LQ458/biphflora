const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, test } = require("node:test");
const { once } = require("node:events");
const express = require("express");

const Post = require("../models/post");
const BirdPost = require("../models/birdPost");
const catalogRouter = require("../routes/catalog");

const NAME_DIRECTORY_PROJECTION = {
  _id: 1,
  latinName: 1,
  chineseName: 1,
  commonName: 1,
  otherNames: 1,
};

const originals = {
  postFind: Post.find,
  birdPostFind: BirdPost.find,
};
const calls = [];
let server;

function queryWith(entries) {
  return {
    lean: async () => entries,
  };
}

function request(pathname, { method = "GET" } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: server.address().port,
        path: pathname,
        method,
      },
      (res) => {
        let responseBody = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          let body = null;
          if (responseBody) {
            try {
              body = JSON.parse(responseBody);
            } catch (_) {
              body = responseBody;
            }
          }

          resolve({
            status: res.statusCode,
            body,
          });
        });
      },
    );

    req.on("error", reject);
    req.end();
  });
}

before(async () => {
  Post.find = (query, projection) => {
    calls.push({ model: "Post", query, projection });
    return queryWith([
      {
        _id: "plant-1",
        latinName: "Acer rubrum",
        chineseName: "红花槭",
        commonName: "red maple",
        otherNames: ["swamp maple"],
        authorization: true,
        internalNotes: "must not be returned",
      },
    ]);
  };
  BirdPost.find = (query, projection) => {
    calls.push({ model: "BirdPost", query, projection });
    return queryWith([
      {
        _id: "bird-1",
        latinName: "Corvus corax",
        chineseName: "渡鸦",
        commonName: "common raven",
        otherNames: ["northern raven"],
        authorization: true,
        internalNotes: "must not be returned",
      },
    ]);
  };

  const app = express();
  app.use(catalogRouter);
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
});

after(async () => {
  Post.find = originals.postFind;
  BirdPost.find = originals.birdPostFind;

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("name directory validates type and returns only projected plant or bird names", async () => {
  const plant = await request("/catalog/names?type=plant");
  const bird = await request("/catalog/names?type=bird");
  const missingType = await request("/catalog/names");
  const invalidType = await request("/catalog/names?type=fungi");
  const repeatedType = await request(
    "/catalog/names?type=plant&type=bird",
  );
  const wrongMethod = await request("/catalog/names?type=plant", {
    method: "POST",
  });

  assert.equal(plant.status, 200);
  assert.deepEqual(plant.body, {
    success: true,
    type: "plant",
    names: [
      {
        _id: "plant-1",
        latinName: "Acer rubrum",
        chineseName: "红花槭",
        commonName: "red maple",
        otherNames: ["swamp maple"],
      },
    ],
  });
  assert.equal(bird.status, 200);
  assert.deepEqual(bird.body, {
    success: true,
    type: "bird",
    names: [
      {
        _id: "bird-1",
        latinName: "Corvus corax",
        chineseName: "渡鸦",
        commonName: "common raven",
        otherNames: ["northern raven"],
      },
    ],
  });
  assert.equal(missingType.status, 400);
  assert.deepEqual(missingType.body, {
    success: false,
    message: "Type must be either plant or bird",
  });
  assert.deepEqual(invalidType, missingType);
  assert.deepEqual(repeatedType, missingType);
  assert.equal(wrongMethod.status, 404);
  assert.deepEqual(calls, [
    {
      model: "Post",
      query: { authorization: true },
      projection: NAME_DIRECTORY_PROJECTION,
    },
    {
      model: "BirdPost",
      query: { authorization: true },
      projection: NAME_DIRECTORY_PROJECTION,
    },
  ]);
});

test("name directory failures use a generic response", async () => {
  Post.find = () => ({
    lean: async () => {
      throw new Error("mongodb://private-host/catalog-secret");
    },
  });

  const response = await request("/catalog/names?type=plant");

  assert.equal(response.status, 500);
  assert.deepEqual(response.body, {
    success: false,
    message: "Unable to load name directory",
  });
  assert.equal(JSON.stringify(response.body).includes("private-host"), false);
  assert.equal(JSON.stringify(response.body).includes("catalog-secret"), false);
});
