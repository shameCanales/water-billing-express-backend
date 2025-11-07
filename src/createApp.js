import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import router from "./routes/index.js";
import passport from "passport";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

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

  app.use(router);

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
