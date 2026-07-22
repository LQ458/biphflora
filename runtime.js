function createRuntime({
  mongoose,
  redis,
  env = process.env,
  logger = console,
}) {
  if (!mongoose || !redis) {
    throw new Error("Mongoose and Redis clients are required");
  }

  const redisOptions = { pingInterval: 1000 };

  if (env.REDIS_URL) {
    redisOptions.url = env.REDIS_URL;
  }

  const redisClient = redis.createClient(redisOptions);
  let mongoReady = false;
  let redisReady = false;
  let mongoOwned = false;
  let connectionPromise = null;

  const log = (level, message) => {
    if (typeof logger[level] === "function") {
      logger[level](message);
    }
  };

  redisClient.on("ready", () => {
    redisReady = true;
    log("info", "Redis connection is ready");
  });

  redisClient.on("end", () => {
    redisReady = false;
    log("warn", "Redis connection ended");
  });

  redisClient.on("error", () => {
    redisReady = false;
    log("error", "Redis connection error");
  });

  const getReadiness = () => {
    const mongodb =
      mongoReady && mongoose.connection && mongoose.connection.readyState === 1;
    const redis = redisReady && redisClient.isReady;

    return {
      ready: Boolean(mongodb && redis),
      dependencies: {
        mongodb: Boolean(mongodb),
        redis: Boolean(redis),
      },
    };
  };

  const connectMongo = async () => {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      mongoReady = true;
      return;
    }

    if (!env.MONGODB_URL) {
      mongoReady = false;
      log("warn", "MongoDB configuration is unavailable");
      return;
    }

    try {
      await mongoose.connect(env.MONGODB_URL);
      mongoOwned = true;
      mongoReady = true;
      log("info", "MongoDB connection is ready");
    } catch (_) {
      mongoReady = false;
      log("error", "MongoDB connection failed");
    }
  };

  const connectRedis = async () => {
    if (redisClient.isReady) {
      redisReady = true;
      return;
    }

    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }

      redisReady = redisClient.isReady;
    } catch (_) {
      redisReady = false;
      log("error", "Redis connection failed");
    }
  };

  const connect = async () => {
    if (!connectionPromise) {
      connectionPromise = Promise.all([connectMongo(), connectRedis()]).finally(
        () => {
          connectionPromise = null;
        },
      );
    }

    await connectionPromise;
    return getReadiness();
  };

  const disconnect = async () => {
    const tasks = [];

    if (redisClient.isOpen) {
      tasks.push(
        redisClient.quit().catch(() => {
          log("error", "Redis shutdown failed");
        }),
      );
    }

    if (
      mongoOwned &&
      mongoose.connection &&
      mongoose.connection.readyState !== 0
    ) {
      tasks.push(
        mongoose.disconnect().catch(() => {
          log("error", "MongoDB shutdown failed");
        }),
      );
    }

    await Promise.all(tasks);
    mongoReady = false;
    redisReady = false;
  };

  return {
    redisClient,
    connect,
    disconnect,
    getReadiness,
  };
}

module.exports = { createRuntime };
