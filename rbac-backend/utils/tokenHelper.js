import jwt from "jsonwebtoken";

/* =====================================================
   ACCESS TOKEN — short-lived (15 min default).
   Har API request ke saath jaata hai. Chori hone pe bhi
   attacker ke paas sirf thodi der ka access hota hai.
===================================================== */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userType: user.userType,
      orgId: user.currentOrgId || user.mainOrgId || null,
      scopeId: user.currentScopeId || null,
      tokenVersion: user.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" },
  );
};

/* =====================================================
   REFRESH TOKEN — long-lived (7 din default).
   Sirf naya Access Token maangne ke liye use hota hai —
   API calls me kabhi nahi jaata, httpOnly cookie me rehta hai
   (JavaScript se access hi nahi ho sakta, XSS-safe).
===================================================== */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion || 0 },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" },
  );
};

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

/* Backward-compatibility alias — Organization/Scope/Staff controllers
   me jahan "generateToken" use ho raha hai, wo access-token hi maanenge */
export const generateToken = generateAccessToken;