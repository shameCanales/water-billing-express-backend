import passport from "passport";
import { Strategy } from "passport-local";
// import { processors } from "../utils/constants.js";
import { Processor } from "../mongoose/schemas/processor.js";

passport.serializeUser((processor, done) => {
  console.log("Serializing processor...");
  console.log(processor);
  done(null, processor._id); // use _id from MongoDB
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing processor...");
  console.log("Deserialized ID:", id);

  try {
    const findProcessor = await Processor.findById(id);
    if (!findProcessor)
      throw new Error("User not found during deserialization");
    done(null, findProcessor); // attach full processor object to req.user
  } catch (error) {
    done(error, null);
  }
});

//this will run when we call passport.authenticate
export default passport.use(
  new Strategy(
    { usernameField: "processorEmail", passwordField: "processorPassword" },
    async (processorEmail, processorPassword, done) => {
      // console.log(
      //   `Username: ${processorEmail}, Password: ${processorPassword}`
      // );
      try {
        const findProcessor = await Processor.findOne({
          email: processorEmail,
        }).select("+password"); // password come from schema select:false meaning it is not selected by default

        if (!findProcessor) throw new Error("User not found");

        if (findProcessor.password !== processorPassword) {
          throw new Error("Invalid credentials");
        }

        done(null, findProcessor); //successful login
      } catch (error) {
        done(error);
      }
    }
  )
);
