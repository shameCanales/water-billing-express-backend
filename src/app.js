import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import router from "./routes/index.js";
import passport from "passport";
import "./strategies/local-strategy.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser("sfmwbs"));

app.use(
  session({
    secret: "devByShame",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
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
});

app.listen(port, () => {
  console.log(`Express Server Running on ${port}`);
});
