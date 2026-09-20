import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext.jsx";
import { googleLoginApi } from "../api/authApi.js";
import AuthShell from "../components/common/AuthShell.jsx";
import Alert from "../components/common/Alert.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";

/* =====================================================
   LOGIN PAGE
   - Email/password login
   - Google Sign-In button
   - "Forgot password?" link
   Logic identical to original — only presentation upgraded.
===================================================== */
function Login() {
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      navigate(data.hasOrg ? "/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  /* ========== GOOGLE LOGIN SUCCESS ========== */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const res = await googleLoginApi(credentialResponse.credential);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      refreshUser(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || t("auth.googleLoginFailed"));
    }
  };

  return (
    <AuthShell
      title={t("auth.welcomeBack")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <Link to="/forgot-password-otp" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          {t("auth.resetWithOtp")}
        </Link>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <div className="mb-4 flex justify-center">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError(t("auth.googleLoginFailed"))} />
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border dark:bg-border-dark" />
        <span className="text-xs font-medium text-ink-soft">{t("common.or")}</span>
        <div className="h-px flex-1 bg-border dark:bg-border-dark" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("auth.email")}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="you@example.com"
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-ink-muted dark:text-ink-soft">{t("auth.password")}</label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink
                       transition-all duration-150 ease-out-soft placeholder:text-ink-soft/70
                       focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15
                       dark:border-border-dark dark:bg-surface-dark-raised dark:text-ink-inverse"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("auth.loggingIn") : t("auth.login")}
        </Button>
      </form>
    </AuthShell>
  );
}

export default Login;
