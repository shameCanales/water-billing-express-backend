import passport from "passport";

export const AuthController = {
  async login(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        req.session.user = user; // optional: custom session reference
        res.status(200).json(user);
      });
    })(req, res, next);
  },
  async authStatus(req, res) {
    req.sessionStore.get(req.session.id, (err, session) => {
      if (err) console.error("Session retrieval error:", err);
      else console.log("Current session data:", session);
    });

    if (req.isAuthenticated()) {
      return res.status(200).json(req.user);
    }
    res.status(401).json({ message: "Not authenticated" });
  },

  async logout(req, res, next) {
    req.logout((logoutErr) => {
      if (logoutErr) {
        console.error("Logout error:", logoutErr);
        return next(logoutErr);
      }

      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
          return res.status(500).json({ message: "Failed to destroy session" });
        }

        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  },
};

