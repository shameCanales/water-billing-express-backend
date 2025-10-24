export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};


export function requireAuthAndStaffOrManager(req, res, next) {
  try {
    const user = req.session.user;
    console.log(user);

    if (!req.session?.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in first",
      });
    }

    if (user.role !== "manager" && user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Staff or Manager privileges required",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Auth and Staff or manager error", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error during authentication check",
    });
  }
}

export function requireAuthAndManager(req, res, next) {
  try {
    // 1️⃣ Check if user session exists
    const user = req.session.user;
    console.log(user);

    if (!req.session?.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in first.",
      });
    }

    // 2️⃣ Validate role
    if (user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Manager privileges required.",
      });
    }

    // 3️⃣ Attach user to request for downstream use (optional but best practice)
    req.user = user;

    // 4️⃣ Continue to next middleware or route
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication check.",
    });
  }
}
