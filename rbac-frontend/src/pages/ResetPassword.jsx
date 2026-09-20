import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetPasswordApi } from "../api/authApi.js";
import AuthShell from "../components/common/AuthShell.jsx";
import Alert from "../components/common/Alert.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";

/* =====================================================
   RESET PASSWORD PAGE
   URL se token milta hai (/reset-password/:token) — email
   wale link se yahan aate hain
   Logic identical to original — only presentation upgraded.
===================================================== */
function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi(token, newPassword);
      setSuccess(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("resetPassword.title")}
      subtitle={t("resetPassword.subtitle")}
      footer={
        <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          {t("auth.backToLogin")}
        </Link>
      }
    >
      {success && (
        <Alert type="success">
          {success} {t("resetPassword.redirecting")}
        </Alert>
      )}
      {error && <Alert type="error">{error}</Alert>}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("resetPassword.newPassword")}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
          />
          <Input
            label={t("resetPassword.confirmPassword")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("resetPassword.resetting") : t("resetPassword.resetPassword")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default ResetPassword;
