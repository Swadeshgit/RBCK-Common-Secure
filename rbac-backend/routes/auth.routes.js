import express from "express";
import {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  forceLogout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  updatePassword,
  setPassword,
  forgotPasswordOtp,
  verifyOtp,
  resetPasswordWithOtp,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  setPasswordSchema,
  verifyOtpSchema,
  resetPasswordOtpSchema,
} from "../validators/authValidator.js";

const router = express.Router();

/* Public */
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google", validate(googleLoginSchema), googleLogin);
router.post("/refresh", refreshAccessToken);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

/* OTP-based flow */
router.post("/forgot-password-otp", validate(forgotPasswordSchema), forgotPasswordOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/reset-password-otp", validate(resetPasswordOtpSchema), resetPasswordWithOtp);

/* Protected */
router.post("/logout", protect, logout);
router.post("/force-logout/:userId", protect, forceLogout);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/update-password", protect, validate(updatePasswordSchema), updatePassword);
router.put("/set-password", protect, validate(setPasswordSchema), setPassword);

export default router;