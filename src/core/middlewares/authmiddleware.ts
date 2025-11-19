import type { Request, Response, NextFunction } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  next();
};

export const requireAuthAndStaffOrManager = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in first",
      });

      return;
    }

    const user = req.user as any;
    console.log(user);

    if (user.role !== "manager" && user.role !== "staff") {
      res.status(403).json({
        success: false,
        message: "Access denied. Staff or Manager privileges required",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Auth and Staff or manager error", error);

    res.status(500).json({
      success: false,
      message: "Internal Server error during authentication check",
    });
  }
};

export const requireAuthAndManager = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1️⃣ Check if user session exists

    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in first.",
      });

      return;
    }

    // 2️⃣ Get user from req.user (where Passport stores it)
    const user = req.user as any; // Type assertion
    console.log(user);

    // 2️⃣ Validate role
    if (user.role !== "manager") {
      res.status(403).json({
        success: false,
        message: "Access denied. Manager privileges required.",
      });

      return;
    }

    // 3️⃣ Attach user to request for downstream use (optional but best practice)
    req.user = user;

    // 4️⃣ Continue to next middleware or route
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication check.",
    });
  }
};
