import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forgotPasswordOtpApi, verifyOtpApi, resetPasswordOtpApi } from "../api/authApi.js";
import AuthShell from "../components/common/AuthShell.jsx";
import Alert from "../components/common/Alert.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";

/* =====================================================
   FORGOT PASSWORD — OTP FLOW (3 steps in one page)
   Step 1: Email daalo → OTP bhejo
   Step 2: OTP daalo → verify karo
   Step 3: Verify ho jaaye to naya password set karo
   Logic identical to original — only presentation upgraded.
===================================================== */
function ForgotPasswordOtp() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState("email"); // email | otp | password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const STEPS = ["email", "otp", "password"];
  const stepIndex = STEPS.indexOf(step);

  /* ========== STEP 1 — SEND OTP ========== */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await forgotPasswordOtpApi(email);
      setMessage(res.data.message);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ========== STEP 2 — VERIFY OTP ========== */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtpApi(email, otp);
      setStep("password");
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ========== STEP 3 — SET NEW PASSWORD ========== */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordOtpApi(email, otp, newPassword);
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const stepSubtitle =
    step === "email"
      ? t("forgotPasswordOtp.stepEmail")
      : step === "otp"
        ? t("forgotPasswordOtp.stepOtp")
        : t("forgotPasswordOtp.stepPassword");

  return (
    <AuthShell
      title={t("forgotPasswordOtp.title")}
      subtitle={stepSubtitle}
      footer={
        <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          {t("auth.backToLogin")}
        </Link>
      }
    >
      {/* ========== STEP PROGRESS DOTS ========== */}
      <div className="mb-5 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ease-out-soft ${
              i === stepIndex ? "w-6 bg-brand-600" : i < stepIndex ? "w-1.5 bg-brand-300" : "w-1.5 bg-border dark:bg-border-dark"
            }`}
          />
        ))}
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      {/* ========== STEP 1: EMAIL ========== */}
      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("forgotPasswordOtp.sending") : t("forgotPasswordOtp.sendOtp")}
          </Button>
        </form>
      )}

      {/* ========== STEP 2: OTP ========== */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            placeholder={t("forgotPasswordOtp.otpPlaceholder")}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-center text-sm tracking-[0.5em] text-ink
                       transition-all duration-150 ease-out-soft placeholder:tracking-normal placeholder:text-ink-soft/70
                       focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15
                       dark:border-border-dark dark:bg-surface-dark-raised dark:text-ink-inverse"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("forgotPasswordOtp.verifying") : t("forgotPasswordOtp.verifyOtp")}
          </Button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full text-center text-xs font-medium text-ink-soft transition-colors hover:text-ink dark:hover:text-ink-inverse"
          >
            {t("forgotPasswordOtp.changeEmail")}
          </button>
        </form>
      )}

      {/* ========== STEP 3: NEW PASSWORD ========== */}
      {step === "password" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder={t("forgotPasswordOtp.newPassword")}
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder={t("forgotPasswordOtp.confirmPassword")}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("forgotPasswordOtp.resetting") : t("forgotPasswordOtp.resetPassword")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default ForgotPasswordOtp;
