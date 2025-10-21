import passport from "passport";
import { Strategy } from "passport-local";
import { processors } from "../utils/constants.js";

passport.serializeUser((processor, done) => {
  console.log("Serializing processor...");
  console.log(processor);
  done(null, processor.processorId);
});

passport.deserializeUser((id, done) => {
  console.log("Deserializing processor...");
  console.log("Deserialized ID:", id);

  try {
    const findProcessor = processors.find((proc) => proc.processorId === id);
    if (!findProcessor)
      throw new Error("User not found during deserialization");
    done(null, findProcessor);
  } catch (error) {
    done(error, null);
  }
});

//this will run when we call passport.authenticate
export default passport.use(
  new Strategy(
    { usernameField: "processorEmail", passwordField: "processorPassword" },
    (processorEmail, processorPassword, done) => {
      console.log(
        `Username: ${processorEmail}, Password: ${processorPassword}`
      );

      try {
        const findProcessor = processors.find(
          (proc) => proc.processorEmail === processorEmail
        );

        if (!findProcessor) throw new Error("User not found");

        if (findProcessor.processorPassword !== processorPassword) {
          throw new Error("Invalid credentials");
        }

        done(null, findProcessor);
      } catch (error) {
        done(error);
      }
    }
  )
);
