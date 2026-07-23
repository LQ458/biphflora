const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { after, before, beforeEach, test } = require("node:test");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

process.env.secret = "phase-two-test-secret";

const User = require("../models/user");
const Post = require("../models/post");
const Pic = require("../models/pic");
const { UPLOAD_TEMP_DIR } = require("../models/uploadPolicy");
const { app, runtime } = require("../app");

let server;
let sessionStoreAvailable = true;
const sessions = new Map();
const originals = {
  userCreate: User.create,
  userFind: User.find,
  userFindOne: User.findOne,
  postFind: Post.find,
  picFind: Pic.find,
  deleteSession: runtime.deleteSession,
  getSessionToken: runtime.getSessionToken,
  isSessionStoreReady: runtime.isSessionStoreReady,
  setSessionToken: runtime.setSessionToken,
};

function request(
  pathname,
  { method = "GET", body, payload: suppliedPayload, headers = {} } = {},
) {
  const payload = suppliedPayload ?? (body ? JSON.stringify(body) : null);
  const payloadLength = Buffer.isBuffer(payload)
    ? payload.length
    : Buffer.byteLength(payload || "");

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: server.address().port,
        path: pathname,
        method,
        headers: {
          ...headers,
          ...(payload
            ? {
                ...(suppliedPayload ? {} : { "content-type": "application/json" }),
                "content-length": payloadLength,
              }
            : {}),
        },
      },
      (res) => {
        let responseBody = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          let parsedBody = null;
          if (responseBody) {
            try {
              parsedBody = JSON.parse(responseBody);
            } catch (_) {
              parsedBody = responseBody;
            }
          }

          resolve({
            status: res.statusCode,
            body: parsedBody,
          });
        });
      },
    );

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

before(async () => {
  runtime.getSessionToken = async (username) =>
    sessionStoreAvailable ? sessions.get(username) || null : null;
  runtime.setSessionToken = async (username, token) => {
    if (!sessionStoreAvailable) {
      throw new Error("session store unavailable");
    }
    sessions.set(username, token);
  };
  runtime.deleteSession = async (username) => {
    if (!sessionStoreAvailable) {
      throw new Error("session store unavailable");
    }
    return sessions.delete(username);
  };
  runtime.isSessionStoreReady = () => sessionStoreAvailable;

  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
});

beforeEach(() => {
  sessionStoreAvailable = true;
  sessions.clear();
  User.create = originals.userCreate;
  User.find = originals.userFind;
  User.findOne = originals.userFindOne;
  Post.find = originals.postFind;
  Pic.find = originals.picFind;
});

after(async () => {
  User.create = originals.userCreate;
  User.find = originals.userFind;
  User.findOne = originals.userFindOne;
  Post.find = originals.postFind;
  Pic.find = originals.picFind;
  runtime.deleteSession = originals.deleteSession;
  runtime.getSessionToken = originals.getSessionToken;
  runtime.isSessionStoreReady = originals.isSessionStoreReady;
  runtime.setSessionToken = originals.setSessionToken;

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("protected write and administration routes reject requests without a token", async () => {
  const responses = await Promise.all([
    request("/uploadPic", { method: "POST", body: {} }),
    request("/newPostAuth", { method: "POST", body: {} }),
    request("/adminDataGet"),
    request("/editPageDelete", { method: "POST", body: {} }),
  ]);

  for (const response of responses) {
    assert.equal(response.status, 401);
    assert.deepEqual(response.body, {
      success: false,
      message: "Authentication required",
    });
  }
});

test("a non-admin token cannot access administration data", async () => {
  User.findOne = async () => ({ username: "member", admin: false });
  const token = jwt.sign(
    { username: "member", admin: false },
    process.env.secret,
  );
  sessions.set("member", token);

  const response = await request("/adminInfo", {
    headers: { authorization: `Bearer ${token}` },
  });

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, {
    success: false,
    message: "Administrator access required",
  });
});

test("raw and Bearer JWTs work while admin user responses exclude secret fields", async () => {
  const memberToken = jwt.sign(
    { username: "member", admin: false },
    process.env.secret,
  );
  sessions.set("member", memberToken);
  const refresh = await request("/refresh", {
    headers: { authorization: memberToken },
  });
  assert.equal(refresh.status, 200);
  assert.equal(refresh.body.success, true);
  assert.equal(refresh.body.user.username, "member");

  User.findOne = async (query, projection) => {
    assert.deepEqual(query, { username: "admin" });
    assert.deepEqual(projection, { username: 1, admin: 1 });
    return { username: "admin", admin: true };
  };
  User.find = async (query, projection) => {
    assert.deepEqual(query, {});
    assert.deepEqual(projection, { username: 1, admin: 1 });
    return [
      {
        _id: "user-1",
        username: "member",
        admin: false,
        password: "bcrypt-hash",
        originalPassword: "plaintext",
      },
    ];
  };
  Post.find = async () => [];
  Pic.find = async () => [];

  const adminToken = jwt.sign(
    { username: "admin", admin: false },
    process.env.secret,
  );
  sessions.set("admin", adminToken);
  const response = await request("/adminInfo", {
    headers: { authorization: `Bearer ${adminToken}` },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.users, [
    { _id: "user-1", username: "member", admin: false },
  ]);
  assert.equal("password" in response.body.users[0], false);
  assert.equal("originalPassword" in response.body.users[0], false);
});

test("logout and removed accounts lose protected access", async () => {
  const token = jwt.sign(
    { username: "member", admin: false },
    process.env.secret,
  );
  sessions.set("member", token);

  const logout = await request("/logout", {
    method: "POST",
    headers: { authorization: token },
  });
  assert.equal(logout.status, 200);
  assert.equal(sessions.has("member"), false);

  const afterLogout = await request("/updateText", {
    method: "POST",
    body: {},
    headers: { authorization: token },
  });
  assert.equal(afterLogout.status, 401);

  sessions.set("member", token);
  User.findOne = async () => null;
  const removedAccount = await request("/updateText", {
    method: "POST",
    body: {},
    headers: { authorization: token },
  });
  assert.equal(removedAccount.status, 401);
});

test("login and logout report a session-store outage", async () => {
  const password = "correct-password";
  const passwordHash = await bcrypt.hash(password, 4);
  User.findOne = () => ({
    select: async () => ({
      username: "member",
      admin: false,
      password: passwordHash,
    }),
  });
  sessionStoreAvailable = false;

  const login = await request("/login", {
    method: "POST",
    body: { username: "member", password },
  });
  assert.equal(login.status, 503);
  assert.deepEqual(login.body, {
    success: false,
    message: "Authentication service unavailable",
  });

  const token = jwt.sign(
    { username: "member", admin: false },
    process.env.secret,
  );
  const logout = await request("/logout", {
    method: "POST",
    headers: { authorization: token },
  });
  assert.equal(logout.status, 503);
  assert.deepEqual(logout.body, {
    success: false,
    message: "Authentication service unavailable",
  });

  const protectedWrite = await request("/updateText", {
    method: "POST",
    body: {},
    headers: { authorization: token },
  });
  assert.equal(protectedWrite.status, 503);
  assert.deepEqual(protectedWrite.body, {
    success: false,
    message: "Authentication service unavailable",
  });
});

test("registration retains its public response and stored user shape", async () => {
  const createdUsers = [];
  User.create = async (user) => {
    createdUsers.push(user);
    return user;
  };

  const registered = await request("/register", {
    method: "POST",
    body: { username: "new-member", password: "registration-password" },
  });

  assert.equal(registered.status, 200);
  assert.deepEqual(registered.body, {
    success: true,
    message: "Register successful",
  });
  assert.equal(createdUsers.length, 1);
  assert.equal(createdUsers[0].username, "new-member");
  assert.equal(createdUsers[0].admin, false);
  assert.equal("originalPassword" in createdUsers[0], false);
  assert.equal(
    await bcrypt.compare("registration-password", createdUsers[0].password),
    true,
  );

  User.create = async () => {
    const error = new Error("duplicate key");
    error.code = 11000;
    throw error;
  };
  const duplicate = await request("/register", {
    method: "POST",
    body: { username: "new-member", password: "registration-password" },
  });
  assert.deepEqual(duplicate.body, {
    success: false,
    message: "Username already exists",
  });
});

test("spoofed multipart images are rejected and removed without path traversal", async () => {
  const token = jwt.sign(
    { username: "member", admin: false },
    process.env.secret,
  );
  sessions.set("member", token);
  User.findOne = async () => ({ username: "member", admin: false });
  Post.findOne = async () => ({ latinName: "Acer rubrum" });

  const uploadDirectoryExisted = await fs
    .stat(UPLOAD_TEMP_DIR)
    .then(() => true)
    .catch(() => false);
  await fs.mkdir(UPLOAD_TEMP_DIR, { recursive: true });
  const before = new Set(await fs.readdir(UPLOAD_TEMP_DIR));
  const boundary = "biphflora-test-boundary";
  const payload = Buffer.from(
    `--${boundary}\r\n` +
      'Content-Disposition: form-data; name="picEnglishName"\r\n\r\n' +
      "Acer rubrum\r\n" +
      `--${boundary}\r\n` +
      'Content-Disposition: form-data; name="files"; filename="../../escape.png"\r\n' +
      "Content-Type: image/png\r\n\r\n" +
      "not-a-real-image\r\n" +
      `--${boundary}--\r\n`,
  );

  const response = await request("/uploadPic", {
    method: "POST",
    payload,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": `multipart/form-data; boundary=${boundary}`,
    },
  });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: "Invalid image upload",
  });

  Post.findOne = async () => null;
  const validPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL0QgAAAABJRU5ErkJggg==",
    "base64",
  );
  const missingPlantPayload = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\n` +
        'Content-Disposition: form-data; name="picEnglishName"\r\n\r\n' +
        "Missing plant\r\n" +
        `--${boundary}\r\n` +
        'Content-Disposition: form-data; name="files"; filename="../../missing.png"\r\n' +
        "Content-Type: image/png\r\n\r\n",
    ),
    validPng,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const missingPlant = await request("/uploadPic", {
    method: "POST",
    payload: missingPlantPayload,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": `multipart/form-data; boundary=${boundary}`,
    },
  });
  assert.equal(missingPlant.status, 404);
  assert.equal(missingPlant.body, "Plant not found");

  assert.deepEqual(new Set(await fs.readdir(UPLOAD_TEMP_DIR)), before);
  assert.equal(
    await fs
      .stat(path.join(process.cwd(), "escape.png"))
      .then(() => true)
      .catch(() => false),
    false,
  );

  if (!uploadDirectoryExisted) {
    await fs.rmdir(UPLOAD_TEMP_DIR);
  }
});

test("session lookup errors do not masquerade as an invalid token or successful logout", async () => {
  const token = jwt.sign(
    { username: "member", admin: false },
    process.env.secret,
  );
  const getSessionToken = runtime.getSessionToken;
  runtime.getSessionToken = async () => {
    throw new Error("transient Redis read failure");
  };

  try {
    const responses = await Promise.all([
      request("/login", {
        method: "POST",
        body: { username: "member", password: "ignored" },
        headers: { authorization: `Bearer ${token}` },
      }),
      request("/logout", {
        method: "POST",
        headers: { authorization: token },
      }),
      request("/updateText", {
        method: "POST",
        body: {},
        headers: { authorization: token },
      }),
    ]);

    for (const response of responses) {
      assert.equal(response.status, 503);
      assert.deepEqual(response.body, {
        success: false,
        message: "Authentication service unavailable",
      });
    }
  } finally {
    runtime.getSessionToken = getSessionToken;
  }
});
