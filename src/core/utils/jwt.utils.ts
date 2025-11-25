import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export interface AdminJWTPayload {
  id: string;
  email: string;
  role: "staff" | "manager";
  type: "admin";
}

export interface ConsumerJWTPayload {
  id: string;
  email: string;
  type: "consumer";
}

export type JWTPayload = AdminJWTPayload | ConsumerJWTPayload;

/**
 * Generate a JWT Token
 * Uses HMAC-SHA256 algorithm
 */

export const generateToken = (payload: JWTPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN as string | number,
    algorithm: "HS256",
  } as jwt.SignOptions;

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify and decode a JWT token
 * Returns null if token is invalid or expired
 */

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JWTPayload;

    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      console.log("Token expired");
    } else if (err instanceof jwt.JsonWebTokenError) {
      console.log("Invalid token");
    }

    return null;
  }
};

/**
 * Extract token from Authorization header
 * Expected format: "Bearer <token>"
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); //Remove "Bearer " prefix
};

/**
 * Decode token without verifying (useful for getting payload without validation)
 * WARNING: Don't use this for authentication! Only for reading non-sensitive data
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (err) {
    return null;
  }
};
