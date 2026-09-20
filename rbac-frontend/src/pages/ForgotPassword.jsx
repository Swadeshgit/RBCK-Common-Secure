import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forgotPasswordApi } from "../api/authApi.js";
import AuthShell from "../components/common/AuthShell.jsx";
import Alert from "../components/common/Alert.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";

/* =====================================================
   FORGOT PASSWORD PAGE
   Email daalo, reset-link inbox me aayega
   Logic identical to original — only presentation upgraded.
===================================================== */
function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await forgotPasswordApi(email);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("forgotPassword.title")}
      subtitle={t("forgotPassword.subtitle")}
      footer={
        <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          {t("auth.backToLogin")}
        </Link>
      }
    >
      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("auth.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("forgotPassword.sending") : t("forgotPassword.sendResetLink")}
        </Button>
      </form>
    </AuthShell>
  );
}

export default ForgotPassword;
