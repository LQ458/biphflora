const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { test } = require("node:test");

const {
  createActorSignature,
  createAuditMiddleware,
  createRequestContext,
  createRequestLogger,
} = require("../middleware/observability");

function createResponse() {
  const response = new EventEmitter();
  response.statusCode = 200;
  response.headers = {};
  response.setHeader = (name, value) => {
    response.headers[name.toLowerCase()] = value;
  };
  return response;
}

test("request context and logs expose only bounded operational fields", () => {
  const req = {
    method: "GET",
    originalUrl: "/catalog/names?private=query",
    headers: { authorization: "Bearer secret" },
    route: { path: "/catalog/names" },
    baseUrl: "",
  };
  const res = createResponse();
  const messages = [];
  const times = [1_000_000n, 3_500_000n];

  createRequestContext({ idFactory: () => "request-1" })(req, res, () => {});
  createRequestLogger({
    logger: { info: (message) => messages.push(message) },
    now: () => times.shift(),
    timestamp: () => "2026-07-22T00:00:00.000Z",
  })(req, res, () => {});
  res.emit("finish");

  assert.equal(res.headers["x-request-id"], "request-1");
  assert.deepEqual(JSON.parse(messages[0]), {
    event: "http_request",
    timestamp: "2026-07-22T00:00:00.000Z",
    requestId: "request-1",
    method: "GET",
    route: "/catalog/names",
    status: 200,
    durationMs: 2.5,
  });
  assert.equal(messages[0].includes("private=query"), false);
  assert.equal(messages[0].includes("Bearer secret"), false);
});

test("audit events are allowlisted, pseudonymous, and successful-only", async () => {
  const events = [];
  const middleware = createAuditMiddleware({
    enabled: true,
    actorHashSecret: "audit-test-secret",
    writeEvent: async (event) => events.push(event),
  });
  const req = {
    method: "POST",
    path: "/uploadPlant",
    requestId: "request-2",
    user: { username: "private-member" },
    body: { raw: "must not be retained" },
  };
  const res = createResponse();

  middleware(req, res, () => {});
  res.emit("finish");
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(events.length, 1);
  assert.equal(events[0].action, "catalog.create_requested");
  assert.equal(events[0].actorSignature, createActorSignature(
    "private-member",
    "audit-test-secret",
  ));
  assert.equal("body" in events[0], false);
  assert.equal(JSON.stringify(events[0]).includes("private-member"), false);

  res.statusCode = 500;
  middleware(req, res, () => {});
  res.emit("finish");
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(events.length, 1);
});
