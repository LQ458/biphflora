const { app, drainImageVariantQueue, runtime } = require("./app");

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function startServer({
  appInstance = app,
  runtimeInstance = runtime,
  port = Number(process.env.PORT || 3001),
  host = process.env.HOST || "0.0.0.0",
  logger = console,
  registerSignalHandlers = true,
  drainBackgroundTasks = drainImageVariantQueue,
} = {}) {
  const server = appInstance.listen(port, host, () => {
    logger.info("HTTP server is listening");
  });
  let shutdownPromise = null;

  const shutdown = async (signal = "shutdown") => {
    if (!shutdownPromise) {
      shutdownPromise = (async () => {
        logger.info("Graceful shutdown requested: " + signal);
        await closeServer(server);
        await drainBackgroundTasks();
        await runtimeInstance.disconnect();
      })();
    }

    return shutdownPromise;
  };

  runtimeInstance.connect().then((readiness) => {
    logger.info(
      readiness.ready
        ? "Application dependencies are ready"
        : "Application dependencies are not ready",
    );
  });

  if (registerSignalHandlers) {
    const exitAfterShutdown = (signal) => {
      shutdown(signal)
        .then(() => {
          process.exitCode = 0;
        })
        .catch(() => {
          process.exitCode = 1;
        });
    };

    process.once("SIGINT", () => exitAfterShutdown("SIGINT"));
    process.once("SIGTERM", () => exitAfterShutdown("SIGTERM"));
    process.once("uncaughtException", () =>
      exitAfterShutdown("uncaughtException"),
    );
    process.once("unhandledRejection", () =>
      exitAfterShutdown("unhandledRejection"),
    );
  }

  return { server, shutdown };
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
