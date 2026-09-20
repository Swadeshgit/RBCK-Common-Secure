import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenHelper.js";
import { sendResetPasswordEmail, sendOtpEmail } from "../utils/emailHelper.js";
import { emitToUser } from "../sockets/index.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const REFRESH_COOKIE_NAME = "refreshToken";

/* =====================================================
   Refresh token ko httpOnly cookie me set karta hai —
   JavaScript se access nahi ho sakta (XSS-safe), aur sirf
   /api/auth path pe hi bheja jaata hai
===================================================== */
const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
};

/* =====================================================
   REGISTER
===================================================== */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, userType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, password required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      userType: userType === "superAdmin" ? "superAdmin" : "subAdmin",
      authProvider: "local",
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType, mainOrgId: user.mainOrgId },
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   LOGIN
===================================================== */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google Sign-In. Please login with Google, or set a password from your account settings first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    user.lastActivity = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    const hasOrg = Boolean(user.mainOrgId);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        authProvider: user.authProvider,
        hasPassword: Boolean(user.password),
        mainOrgId: user.mainOrgId,
        currentOrgId: user.currentOrgId,
        currentScopeId: user.currentScopeId,
        roleId: user.roleId,
      },
      hasOrg,
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GOOGLE LOGIN
===================================================== */
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "idToken is required" });
    }

    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select("+password");

    if (user && user.authProvider === "local") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please login with password.",
      });
    }

    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
        authProvider: "google",
        userType: "superAdmin",
      });
    } else {
      user.lastActivity = new Date();
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    const hasOrg = Boolean(user.mainOrgId);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        authProvider: user.authProvider,
        hasPassword: Boolean(user.password),
        mainOrgId: user.mainOrgId,
        currentOrgId: user.currentOrgId,
        currentScopeId: user.currentScopeId,
        roleId: user.roleId,
      },
      hasOrg,
      token: accessToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid Google token" });
  }
};

/* =====================================================
   REFRESH ACCESS TOKEN
   POST /api/auth/refresh   (cookie se refresh-token uthata hai)
   Naya Access Token deta hai — refresh-token bhi rotate
   karta hai (security best-practice: har use pe naya refresh-token)
===================================================== */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token", code: "NO_REFRESH_TOKEN" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.isDeleted || !user.isActive) {
      return res.status(401).json({ success: false, message: "Account not accessible" });
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Session revoked. Please login again.",
        code: "TOKEN_VERSION_MISMATCH",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({ success: true, token: newAccessToken });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   FORGOT PASSWORD — LINK
===================================================== */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select("+password");

    if (!user || !user.password) {
      return res.status(200).json({
        success: true,
        message: "If an account with this email exists, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    try {
      await sendResetPasswordEmail(user.email, resetLink);
    } catch (emailError) {
      console.error("EMAIL SEND ERROR:", emailError);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ success: false, message: "Failed to send reset email. Please try again." });
    }

    return res.status(200).json({
      success: true,
      message: "If an account with this email exists, a reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   RESET PASSWORD — LINK
===================================================== */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      isDeleted: false,
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.tokenVersion += 1;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully. Please login." });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   FORGOT PASSWORD — OTP
===================================================== */
export const forgotPasswordOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select("+password");

    if (!user || !user.password) {
      return res.status(200).json({
        success: true,
        message: "If an account with this email exists, an OTP has been sent.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.otpCode = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailError) {
      console.error("OTP EMAIL SEND ERROR:", emailError);
      user.otpCode = null;
      user.otpExpires = null;
      await user.save();
      return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
    }

    return res.status(200).json({
      success: true,
      message: "If an account with this email exists, an OTP has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   VERIFY OTP
===================================================== */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      otpCode: hashedOtp,
      otpExpires: { $gt: Date.now() },
      isDeleted: false,
    }).select("+otpCode +otpExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   RESET PASSWORD — OTP
===================================================== */
export const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase(),
      otpCode: hashedOtp,
      otpExpires: { $gt: Date.now() },
      isDeleted: false,
    }).select("+otpCode +otpExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpCode = null;
    user.otpExpires = null;
    user.tokenVersion += 1;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully. Please login." });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   UPDATE PASSWORD
===================================================== */
export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Old and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: "Password update not available for this account" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.tokenVersion += 1;
    await user.save();

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({ success: true, message: "Password updated successfully", token: newAccessToken });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   SET PASSWORD
===================================================== */
export const setPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.password) {
      return res.status(400).json({
        success: false,
        message: "This account already has a password. Use Update Password instead.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password set successfully. You can now also login with email/password.",
    });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   LOGOUT
===================================================== */
export const logout = async (req, res, next) => {
  try {
    const io = req.app.get("io");
    if (io) emitToUser(io, req.user.id, "auth:loggedOut", {});
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   FORCE LOGOUT
===================================================== */
export const forceLogout = async (req, res, next) => {
  try {
    const targetId = req.params.userId;

    if (req.user.userType !== "superAdmin" && req.user.id !== targetId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const user = await User.findByIdAndUpdate(targetId, { $inc: { tokenVersion: 1 } }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const io = req.app.get("io");
    if (io) emitToUser(io, targetId, "auth:forceLoggedOut", { reason: "Session revoked" });

    return res.status(200).json({ success: true, message: "User logged out from all sessions" });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   GET ME
===================================================== */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password").populate("roleId", "name");

    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hasPassword = Boolean(user.password);
    user.password = undefined;

    return res.status(200).json({ success: true, user, hasOrg: Boolean(user.mainOrgId), hasPassword });
  } catch (error) {
    next(error);
  }
};

/* =====================================================
   UPDATE PROFILE
===================================================== */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, phone, avatar } },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};