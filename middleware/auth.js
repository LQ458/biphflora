function createAuthMiddleware({ User, jwt, runtime, logger = console }) {
  function getAuthorizationToken(authorization) {
    if (typeof authorization !== "string") {
      return null;
    }

    const value = authorization.trim();
    if (!value || value === "undefined") {
      return null;
    }

    const bearerMatch = value.match(/^Bearer\s+(.+)$/i);
    const token = bearerMatch ? bearerMatch[1].trim() : value;

    return token || null;
  }

  function sessionStoreUnavailable(res) {
    return res.status(503).json({
      success: false,
      message: "Authentication service unavailable",
    });
  }

  async function verifyToken(req, res, next) {
    const token = getAuthorizationToken(req.headers["authorization"]);
    req.sessionStoreUnavailable = false;

    if (!token) {
      req.user = null;
      req.token = null;
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.secret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        const expiredToken = jwt.decode(token);
        if (expiredToken?.username) {
          try {
            const sessionToken = await runtime.getSessionToken(
              expiredToken.username,
            );
            if (sessionToken === token) {
              await runtime.deleteSession(expiredToken.username);
            }
          } catch (_) {
            logger.warn("Unable to clear an expired session cache entry");
          }
        }
      }

      req.user = null;
      req.token = null;
      return next();
    }

    try {
      const sessionToken = await runtime.getSessionToken(decoded.username);

      if (sessionToken !== token) {
        req.user = null;
        req.token = null;
        return next();
      }
    } catch (_) {
      req.user = null;
      req.token = null;
      req.sessionStoreUnavailable = true;
      return next();
    }

    req.user = decoded;
    req.token = token;
    return next();
  }

  function requireAuth(req, res, next) {
    return verifyToken(req, res, async (error) => {
      if (error) {
        return next(error);
      }

      if (req.sessionStoreUnavailable) {
        return sessionStoreUnavailable(res);
      }

      if (!req.user?.username) {
        if (
          getAuthorizationToken(req.headers["authorization"]) &&
          !runtime.isSessionStoreReady()
        ) {
          return sessionStoreUnavailable(res);
        }

        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      try {
        const currentUser = await User.findOne(
          { username: req.user.username },
          { username: 1, admin: 1 },
        );

        if (!currentUser) {
          return res.status(401).json({
            success: false,
            message: "Authentication required",
          });
        }

        req.authenticatedUser = {
          username: currentUser.username,
          admin: Boolean(currentUser.admin),
        };
        return next();
      } catch (authError) {
        return next(authError);
      }
    });
  }

  function requireAdmin(req, res, next) {
    return requireAuth(req, res, (error) => {
      if (error) {
        return next(error);
      }

      if (!req.authenticatedUser?.admin) {
        return res.status(403).json({
          success: false,
          message: "Administrator access required",
        });
      }

      return next();
    });
  }

  return {
    getAuthorizationToken,
    requireAdmin,
    requireAuth,
    sessionStoreUnavailable,
    verifyToken,
  };
}

module.exports = { createAuthMiddleware };
