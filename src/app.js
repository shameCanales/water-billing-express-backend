import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import router from "./routes/index.js";
import passport from "passport";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import "./strategies/local-strategy.js";

const app = express();
const port = process.env.PORT || 3001;

mongoose
  .connect("mongodb://localhost/water_billing_system")
  .then(() => {
    console.log("Connected to WBS Database");
  })
  .catch((err) => {
    console.log("failed to connect to database", err);
  });

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

app.listen(port, () => {
  console.log(`Express Server Running on ${port}`);
});

// save Uninitialized:::::::::::::::::::
// false (recommended):
// Don’t store empty sessions — only save when something is added (like req.session.user = {...}).
// true:
// Save all sessions, even if they’re brand new and unused (empty).
// Why false is better:
// Saves database space and avoids creating useless session documents in MongoDB.
// Better performance and privacy compliance (e.g., GDPR).

// Resave:::::::::::::::::::::
// false (recommended):
// Only save the session if something changed in req.session.
// true:
// Re-save the session on every request, even if nothing changed.
// Why false is better:
// Prevents unnecessary writes to MongoDB on every HTTP request.
// Reduces I/O and improves performance.
