const express = require("express");

function createAuthRouter({
  User,
  bcrypt,
  getAuthorizationToken,
  jwt,
  runtime,
  sessionStoreUnavailable,
  verifyToken,
}) {
  const router = express.Router();

  router.post("/login", verifyToken, async (req, res) => {
    var passwordMatch = false;
    if (req.sessionStoreUnavailable) {
      return sessionStoreUnavailable(res);
    }

    if (req.user) {
      return res.json({
        success: true,
        message: "Already logged in",
        user: req.user,
        token: req.token,
      });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");

    if (user) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      return res.json({ success: false, message: "User not found" });
    }

    if (passwordMatch) {
      if (!runtime.isSessionStoreReady()) {
        return sessionStoreUnavailable(res);
      }

      var token = jwt.sign(
        { username: user.username, admin: user.admin },
        process.env.secret,
        { expiresIn: "180d" },
      );

      try {
        const redisToken = await runtime.getSessionToken(username);
        let hasUsableSession = false;

        if (redisToken) {
          try {
            const sessionPayload = jwt.verify(redisToken, process.env.secret);
            hasUsableSession = sessionPayload?.username === username;
          } catch (_) {
            hasUsableSession = false;
          }
        }

        if (hasUsableSession) {
          token = redisToken;
        } else {
          await runtime.deleteSession(username);
          await runtime.setSessionToken(username, token);
        }

        return res.json({
          success: true,
          message: "Login successful",
          user: (({ username, admin }) => ({ username, admin }))(user),
          token,
        });
      } catch (_) {
        console.warn("Unable to create a login session");
        return sessionStoreUnavailable(res);
      }
    } else {
      return res.json({
        success: false,
        message: "Invalid username or password",
      });
    }
  });

  router.get("/refresh", verifyToken, async (req, res) => {
    if (req.sessionStoreUnavailable) {
      return sessionStoreUnavailable(res);
    }

    if (!req.user) {
      return res.json({ success: false, message: "Token not valid" });
    }

    return res.json({
      success: true,
      message: "Token refreshed",
      user: req.user,
    });
  });

  router.post("/logout", verifyToken, async (req, res) => {
    if (!req.user) {
      if (
        req.sessionStoreUnavailable ||
        (getAuthorizationToken(req.headers["authorization"]) &&
          !runtime.isSessionStoreReady())
      ) {
        return sessionStoreUnavailable(res);
      }

      return res.json({ success: true, message: "Logout successful" });
    }

    try {
      await runtime.deleteSession(req.user.username);
    } catch (_) {
      console.warn("Unable to remove login session");
      return sessionStoreUnavailable(res);
    }

    return res.json({ success: true, message: "Logout successful" });
  });

  router.post("/register", async (req, res) => {
    const { username } = req.body;
    const password = await bcrypt.hash(req.body.password, 10);
    try {
      await User.create({
        username,
        password: password,
        admin: false,
      });
      return res.json({ success: true, message: "Register successful" });
    } catch (error) {
      if (error.code === 11000) {
        return res.json({ success: false, message: "Username already exists" });
      }
      console.warn("Unable to register user");
      return res.status(500).json({
        success: false,
        message: "Unable to register user",
      });
    }
  });

  return router;
}

module.exports = { createAuthRouter };
