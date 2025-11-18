import "express-session";

declare module "express-session" {
  interface SessionData {
    visited?: boolean;
    passport?: {
      user?: string;
    };
  }
}

declare global {
  namespace Express {
    interface User {
      _id: string;
      email: string;
      role?: string;
      // Add other user fields as needed
    }

    interface Request {
      user?: User;
    }
  }
}
