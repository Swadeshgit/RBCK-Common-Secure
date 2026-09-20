import { useState } from "react";
import { useTranslation } from "react-i18next";
import { updatePasswordApi, forgotPasswordApi } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/common/Layout.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import Alert from "../components/common/Alert.jsx";

/* =====================================================
   UPDATE PASSWORD PAGE
   - Normal flow: old-password verify karke naya set karo
   - "Forgot your current password?" — logged-in user ko bhi
     apne registered email pe reset-link bhej sakte hain
   Logic identical to original — only presentation upgraded.
===================================================== */
function UpdatePassword() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await updatePasswordApi(formData.oldPassword, formData.newPassword);
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      refreshUser(currentUser, res.data.token);
      setSuccess("Password updated successfully");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  /* ========== FORGOT CURRENT PASSWORD (logged-in user ke liye) ========== */
  const handleForgotClick = async () => {
    setForgotMessage("");
    setForgotLoading(true);
    try {
      const res = await forgotPasswordApi(user.email);
      setForgotMessage(res.data.message);
    } catch (err) {
      setForgotMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-sm">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-ink dark:text-ink-inverse">
          {t("updatePassword.title")}
        </h2>

        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
        >
          <Input
            label={t("updatePassword.currentPassword")}
            name="oldPassword"
            type="password"
            value={formData.oldPassword}
            onChange={handleChange}
            required
          />
          <Input
            label={t("updatePassword.newPassword")}
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <Input
            label={t("updatePassword.confirmPassword")}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("updatePassword.updating") : t("updatePassword.updatePassword")}
          </Button>
        </form>

        {/* ========== FORGOT CURRENT PASSWORD SECTION ========== */}
        <div className="mt-4 text-center">
          {forgotMessage ? (
            <p className="text-sm text-success">{forgotMessage}</p>
          ) : (
            <button
              type="button"
              onClick={handleForgotClick}
              disabled={forgotLoading}
              className="text-sm font-medium text-brand-600 transition-colors hover:underline disabled:opacity-50 dark:text-brand-300"
            >
              {forgotLoading ? t("updatePassword.sending") : t("updatePassword.forgotCurrent")}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UpdatePassword;
