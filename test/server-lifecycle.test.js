const assert = require("node:assert/strict");
const http = require("node:http");
const { once } = require("node:events");
const { test } = require("node:test");

const { startServer } = require("../server");

test("server startup connects dependencies and graceful shutdown closes both layers", async () => {
  let connectCalls = 0;
  let disconnectCalls = 0;
  let drainCalls = 0;
  const runtime = {
    async connect() {
      connectCalls += 1;
      return { ready: true };
    },
    async disconnect() {
      disconnectCalls += 1;
    },
  };
  const app = {
    listen(port, host, callback) {
      const server = http.createServer((req, res) => {
        res.statusCode = 204;
        res.end();
      });

      return server.listen(port, host, callback);
    },
  };
  const logger = {
    info() {},
    error() {},
  };

  const { server, shutdown } = startServer({
    appInstance: app,
    runtimeInstance: runtime,
    port: 0,
    host: "127.0.0.1",
    logger,
    registerSignalHandlers: false,
    drainBackgroundTasks: async () => {
      drainCalls += 1;
    },
  });

  await once(server, "listening");
  await new Promise((resolve) => setImmediate(resolve));
  await shutdown("test");

  assert.equal(connectCalls, 1);
  assert.equal(disconnectCalls, 1);
  assert.equal(drainCalls, 1);
  assert.equal(server.listening, false);
});
