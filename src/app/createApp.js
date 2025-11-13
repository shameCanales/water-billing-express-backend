import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";

import mongoose from "mongoose";
import "../config/strategies/local-strategy.js"; // important
import dotenv from "dotenv";

import authRouter from "../modules/auth/auth.routes.js";
import consumerRouter from "../modules/consumers/consumers.routes.js";
import connectionRouter from "../modules/connections/connections.routes.js";
import billRouter from "../modules/bills/bills.routes.js";
import processorRouter from "../modules/processors/processors.routes.js";

dotenv.config();

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser("sfmwbs"));

  app.use(
    session({
      secret: "devByShame",
      saveUninitialized: false, // don't save empty sessions
      resave: false, // don't save unchanged sessions
      cookie: {
        maxAge: 1000 * 60 * 60,
      },
      store: MongoStore.create({
        // to persist session
        client: mongoose.connection.getClient(),
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const loggingMiddleware = (request, response, next) => {
    console.log(`log: ${request.method} - ${request.url}`);
    next();
  };

  app.use(loggingMiddleware, (request, response, next) => {
    console.log("finished logging...");
    next();
  });

  app.use("/api/auth", authRouter);
  app.use("/api/consumers", consumerRouter);
  app.use("/api/connections", connectionRouter);
  app.use("/api/bills", billRouter);
  app.use("/api/processors", processorRouter);

  app.get("/", (request, response) => {
    console.log(request.session);
    console.log(request.sessionID);
    request.session.visited = true;

    request.sessionStore.get(request.sessionID, (err, sessionData) => {
      if (err) {
        console.log(err);
        throw err;
      }

      console.log(sessionData);

      response.status(200).json({
        success: true,
        session: sessionData,
      });
    });
  });

  return app;
}
