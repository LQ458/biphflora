const crypto = require("node:crypto");

const AUDITED_ROUTES = new Map([
  ["POST /uploadPlant", "catalog.create_requested"],
  ["POST /uploadBird", "catalog.create_requested"],
  ["POST /updateText", "catalog.edit_requested"],
  ["POST /birdUpdateText", "catalog.edit_requested"],
  ["POST /uploadCreation", "creation.uploaded"],
  ["POST /uploadPic", "media.uploaded"],
  ["POST /uploadBirdPic", "media.uploaded"],
  ["POST /uploadArt", "media.uploaded"],
  ["POST /newPostAuth", "catalog.reviewed"],
  ["POST /newBirdPostAuth", "catalog.reviewed"],
  ["POST /newCreationAuth", "creation.reviewed"],
  ["PUT /handleEditDecision", "catalog.edit_reviewed"],
  ["PUT /handleBirdEditDecision", "catalog.edit_reviewed"],
  ["POST /adminToggle", "user.role_changed"],
  ["POST /adminMakeAdminUser", "user.role_changed"],
  ["POST /adminDeleteUser", "user.deleted"],
  ["POST /makeFeatured", "feature.changed"],
  ["POST /featureToHome", "feature.changed"],
  ["POST /makePicFeatured", "feature.changed"],
  ["POST /uploadFeatureSingle", "feature.changed"],
  ["POST /uploadFeatureArtSingle", "feature.changed"],
  ["POST /unFeatureHome", "feature.changed"],
  ["POST /unFeatureCreation", "feature.changed"],
  ["POST /editPageDelete", "media.deleted"],
  ["DELETE /editPageDeletePlant", "catalog.deleted"],
]);

function createRequestContext({ idFactory = crypto.randomUUID } = {}) {
  return function requestContext(req, res, next) {
    req.requestId = idFactory();
    res.setHeader("X-Request-Id", req.requestId);
    next();
  };
}

function getMatchedRoute(req) {
  if (!req.route || typeof req.route.path !== "string") {
    return "unmatched";
  }

  return `${req.baseUrl || ""}${req.route.path}` || "/";
}

function createRequestLogger({
  logger = console,
  now = process.hrtime.bigint,
  timestamp = () => new Date().toISOString(),
} = {}) {
  return function requestLogger(req, res, next) {
    const startedAt = now();

    res.once("finish", () => {
      const durationMs = Number(now() - startedAt) / 1_000_000;
      const entry = {
        event: "http_request",
        timestamp: timestamp(),
        requestId: req.requestId,
        method: req.method,
        route: getMatchedRoute(req),
        status: res.statusCode,
        durationMs: Number(durationMs.toFixed(3)),
      };
      const write = logger.info || logger.log;
      write.call(logger, JSON.stringify(entry));
    });

    next();
  };
}

function createActorSignature(username, secret) {
  if (!username || !secret) {
    return undefined;
  }

  return crypto.createHmac("sha256", secret).update(username).digest("hex");
}

function createAuditMiddleware({
  enabled = false,
  writeEvent,
  actorHashSecret,
  logger = console,
} = {}) {
  if (!enabled) {
    return function auditDisabled(req, res, next) {
      next();
    };
  }

  if (typeof writeEvent !== "function") {
    throw new TypeError("writeEvent is required when audit events are enabled");
  }

  return function auditRequest(req, res, next) {
    const routeKey = `${req.method} ${req.path}`;
    const action = AUDITED_ROUTES.get(routeKey);

    if (action) {
      res.once("finish", async () => {
        if (res.statusCode < 200 || res.statusCode >= 400) {
          return;
        }

        try {
          await writeEvent({
            action,
            method: req.method,
            route: req.path,
            status: res.statusCode,
            requestId: req.requestId,
            actorSignature: createActorSignature(
              req.user?.username,
              actorHashSecret,
            ),
            occurredAt: new Date(),
          });
        } catch (_) {
          const warn = logger.warn || logger.log;
          warn.call(logger, "Unable to append audit event");
        }
      });
    }

    next();
  };
}

module.exports = {
  AUDITED_ROUTES,
  createActorSignature,
  createAuditMiddleware,
  createRequestContext,
  createRequestLogger,
  getMatchedRoute,
};
