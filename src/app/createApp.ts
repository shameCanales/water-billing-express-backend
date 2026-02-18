import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import type { Application, Request, Response, NextFunction } from "express";

import authAdminRouter from "../modules/authAdmin/authAdmin.routes.ts";
import authConsumerRouter from "../modules/authConsumer/authConsumer.routes.ts";
import consumerRouter from "../modules/consumers/consumers.routes.ts";
import connectionRouter from "../modules/connections/connections.routes.ts";
import billRouter from "../modules/bills/bills.routes.ts";
import processorRouter from "../modules/processors/processors.routes.ts";
import sharedRouter from "../modules/shared/shared.routes.ts";
import settingsRouter from "../modules/settings/settings.routes.ts";

export function createApp(): Application {
  const app: Application = express();

  // 1. CORS MUST come before routes
  app.use(
    cors({
      origin: process.env.FRONTEND_ADMIN_URL, // Explicitly allow your Frontend
      credentials: true, // Allow Cookies to travel between ports
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  const loggingMiddleware = (
    request: Request,
    response: Response,
    next: NextFunction,
  ): void => {
    console.log(`log: ${request.method} - ${request.url}`);
    next();
  };

  app.use(
    loggingMiddleware,
    (request: Request, response: Response, next: NextFunction): void => {
      console.log("finished logging...");
      next();
    },
  );

  // AUth
  app.use("/api/auth/admin", authAdminRouter);
  app.use("/api/auth/consumer", authConsumerRouter);

  // Resources
  app.use("/api/consumers", consumerRouter);
  app.use("/api/connections", connectionRouter);
  app.use("/api/bills", billRouter);
  app.use("/api/processors", processorRouter);
  app.use("/api/shared", sharedRouter);
  app.use("/api/settings", settingsRouter);

  app.get("/", (request: Request, response: Response): void => {
    response.status(200).json({
      success: true,
      message: "Water Billing API is running",
      auth: "JWT",
    });
  });

  return app;
}

// for passportjs auth
// import passport from "passport";
// import session from "express-session";
// import MongoStore from "connect-mongo";
// import "../config/strategies/local-strategy.js";
// import cookieParser from "cookie-parser";
// import mongoose from "mongoose";
// ::::::::::::::::::::::::::::::::::::::::::

// app.use(cookieParser("sfmwbs"));

// app.use(
//   session({
//     secret: "devByShame",
//     saveUninitialized: false, // don't save empty sessions
//     resave: false, // don't save unchanged sessions
//     cookie: {
//       maxAge: 1000 * 60 * 60,
//     },
//     store: MongoStore.create({
//       // to persist session
//       client: mongoose.connection.getClient(),
//     }),
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

//  app.get("/", (request: Request, response: Response): void => {
//     console.log(request.session);
//     console.log(request.sessionID);
//     request.session.visited = true;

//     request.sessionStore.get(request.sessionID, (err, sessionData) => {
//       if (err) {
//         console.log(err);
//         throw err;
//       }

//       console.log(sessionData);

//       response.status(200).json({
//         success: true,
//         session: sessionData,
//       });
//     });
//   });
