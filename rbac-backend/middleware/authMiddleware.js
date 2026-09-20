import { verifyAccessToken } from "../utils/tokenHelper.js";
import { User } from "../models/index.js";

/* =====================================================
   PROTECT — ab Access Token verify karta hai.
   Expiry ko alag se identify karta hai (code: ACCESS_TOKEN_EXPIRED)
   taaki frontend samajh sake ki ye "refresh karo" wala case hai,
   na ki "seedha logout karo" wala.
===================================================== */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated", code: "NO_TOKEN" });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
          code: "ACCESS_TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({ success: false, message: "Invalid token", code: "INVALID_TOKEN" });
    }

    const user = await User.findById(decoded.id).select("tokenVersion isActive isDeleted userType");

    if (!user || user.isDeleted || !user.isActive) {
      return res.status(401).json({ success: false, message: "Account not accessible", code: "INVALID_TOKEN" });
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session expired due to permission change. Please login again.",
        code: "TOKEN_VERSION_MISMATCH",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user || !allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};