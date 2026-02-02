// import passport from "passport";
// import { Strategy } from "passport-local";
// import { Processor } from "../../modules/processors/processor.model.js";
// import { comparePassword } from "../../core/utils/helpers.js";
// import type { Types } from "mongoose";

// declare global {
//   namespace Express {
//     interface User {
//       _id: any;
//       name: string;
//       email: string;
//       role?: "staff" | "manager";
//       createdAt: Date;
//       updatedAt: Date;
//     }
//   }
// }

// passport.serializeUser((processor: Express.User, done) => {
//   console.log("Serializing processor...");
//   // console.log(processor);
//   done(null, (processor as any)._id); // use _id from MongoDB
// });

// passport.deserializeUser(async (id: Types.ObjectId, done) => {
//   console.log("Deserializing processor...");
//   console.log("Deserialized ID:", id);

//   try {
//     const findProcessor = await Processor.findById(id);
//     if (!findProcessor) {
//       throw new Error("User not found during deserialization");
//     }

//     done(null, findProcessor); // attach full processor object to req.user
//   } catch (error) {
//     done(error, null);
//   }
// });

// //this will run when we call passport.authenticate
// export default passport.use(
//   new Strategy(
//     { usernameField: "processorEmail", passwordField: "processorPassword" },
//     async (
//       processorEmail: string,
//       processorPassword: string,
//       done: (
//         error: any,
//         user?: Express.User | false,
//         options?: { message: string }
//       ) => void
//     ) => {
//       // console.log(
//       //   `Username: ${processorEmail}, Password: ${processorPassword}`
//       // );
//       try {
//         const findProcessor = await Processor.findOne({
//           email: processorEmail,
//         }).select("+password"); // password come from schema select:false meaning it is not selected by default

//         if (!findProcessor) throw new Error("User not found");

//         // if (findProcessor.password !== processorPassword) {
//         const isMatch = await comparePassword(
//           processorPassword,
//           findProcessor.password
//         );
//         if (!isMatch) throw new Error("Invalid credentials");

//         done(null, findProcessor); //successful login
//       } catch (error) {
//         done(error);
//       }
//     }
//   )
// );
