import { useState } from "react";
import { useTranslation } from "react-i18next";
import { setPasswordApi } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/common/Layout.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import Alert from "../components/common/Alert.jsx";

/* Logic identical to original — only presentation upgraded. */
function SetPassword() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await setPasswordApi(formData.newPassword);
      refreshUser({ ...user, hasPassword: true });
      setSuccess("Password set successfully! You can now also login with email/password.");
      setFormData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-sm">
        <h2 className="mb-1 text-lg font-bold tracking-tight text-ink dark:text-ink-inverse">
          {t("setPassword.title")}
        </h2>
        <p className="mb-5 text-sm text-ink-muted dark:text-ink-soft">{t("setPassword.subtitle")}</p>

        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
        >
          <Input
            label={t("setPassword.newPassword")}
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <Input
            label={t("setPassword.confirmPassword")}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("setPassword.saving") : t("setPassword.setPassword")}
          </Button>
        </form>
      </div>
    </Layout>
  );
}

export default SetPassword;
