import { processors } from "../utils/constants.js";
import { Router } from "express";
import passport from "passport";

const router = Router();

router.post("/api/auth/login", (req, res, next) => {
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
});

router.get("/api/auth/status", (req, res) => {
  req.sessionStore.get(req.session.id, (err, session) => {
    if (err) console.error("Session retrieval error:", err);
    else console.log("Current session data:", session);
  });

  if (req.isAuthenticated()) {
    return res.status(200).json(req.user);
  }
  res.status(401).json({ message: "Not authenticated" });
});

router.post("/api/auth/logout", (req, res, next) => {
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
});

// Previous implementation with cookies and session without Passport.js
// router.post("/api/auth/login", (request, response) => {
//   const {
//     body: { username, password },
//   } = request;

//   const findProcessor = processors.find(
//     (processor) => processor.username === username
//   );

//   if (!findProcessor || findProcessor.password !== password) {
//     return response
//       .status(401)
//       .send({ message: "BAD Credentials, Cannot find Processor" });
//   }

//   request.session.user = findProcessor;
//   return response.status(200).send(findProcessor);
// });

// router.get("/api/auth/status", (request, response) => {
//   request.sessionStore.get(request.session.id, (err, session) => {
//     console.log(session);
//   });

//   return request.session.user
//     ? response.status(200).send(request.session.user)
//     : response.status(401).send({ message: "Not authenticated" });
// });

// router.post("/api/auth/logout", (request, response) => {
//   if (request.session.user) {
//     request.session.destroy((err) => {
//       if (err) {
//         console.error("Logout error: ", err);
//         return response.status(500).send({ message: "Failed to logout" });
//       }

//       response.clearCookie("connect.sid");

//       return response.status(200).send({ message: "Logged out successfully" });
//     });
//   } else {
//     return response.status(400).send({ message: "No active session" });
//   }
// });

export default router;
