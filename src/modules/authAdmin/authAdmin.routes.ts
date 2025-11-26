import { Router } from "express";
import { AuthAdminController } from "./authAdmin.controller.ts";
// import { requireAdminAuth } from "../../core/middlewares/adminAuth.middleware.ts";
import { AdminAuthMiddleware } from "../../core/middlewares/adminAuth.middleware.ts";

const router = Router();

router.post("/login", AuthAdminController.login);
router.post(
  "/refresh",
  AdminAuthMiddleware.requireAuth,
  AuthAdminController.refresh
);
router.get(
  "/status",
  AdminAuthMiddleware.requireAuth,
  AuthAdminController.status
);
router.post(
  "/logout",
  AdminAuthMiddleware.requireAuth,
  AuthAdminController.logout
);

export default router;

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
// export default router;
