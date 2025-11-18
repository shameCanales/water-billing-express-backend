import passport from "passport";
import type { Request, Response, NextFunction } from "express";

export const AuthController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info?: { message?: string }
      ) => {
        if (err) {
          next(err);
          return;
        }
        if (!user) {
          res
            .status(401)
            .json({ message: info?.message || "Invalid credentials" });

          return;
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            next(loginErr);
            return;
          }
          req.session.user = user; // optional: custom session reference
          res.status(200).json(user);
        });
      }
    )(req, res, next);
  },
  async authStatus(req: Request, res: Response): Promise<void> {
    req.sessionStore.get(req.session.id, (err, session) => {
      if (err) console.error("Session retrieval error:", err);
      else console.log("Current session data:", session);
    });

    if (req.isAuthenticated()) {
      res.status(200).json(req.user);
      return;
    }
    res.status(401).json({ message: "Not authenticated" });
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    req.logout((logoutErr) => {
      if (logoutErr) {
        console.error("Logout error:", logoutErr);
        next(logoutErr);
        return;
      }

      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
          res.status(500).json({ message: "Failed to destroy session" });
          return;
        }

        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logged out successfully" });
      });
    });
  },
};
