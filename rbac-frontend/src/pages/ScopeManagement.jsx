import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, MapPinned } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { createScopeApi, getScopesApi } from "../api/scopeApi.js";
import Layout from "../components/common/Layout.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import Alert from "../components/common/Alert.jsx";

/* =====================================================
   SCOPE MANAGEMENT PAGE
   Logic identical to original — only presentation upgraded.
===================================================== */
function ScopeManagement() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ name: "", code: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchScopes = async () => {
    try {
      setLoading(true);
      const res = await getScopesApi(user.currentOrgId);
      setScopes(res.data.scopes || []);
    } catch (err) {
      setError("Failed to load scopes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.currentOrgId) fetchScopes();
  }, [user?.currentOrgId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Scope name is required");
      return;
    }

    setSubmitting(true);
    try {
      await createScopeApi({
        name: formData.name,
        code: formData.code,
        orgId: user.currentOrgId,
      });
      setFormData({ name: "", code: "" });
      setShowForm(false);
      fetchScopes();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create scope");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink dark:text-ink-inverse">
              {t("scopes.title")}
            </h2>
            <p className="text-sm text-ink-soft">{t("scopes.subtitle")}</p>
          </div>
          <Button onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? (
              <span className="flex items-center gap-1.5"><X size={15} />{t("common.cancel")}</span>
            ) : (
              <span className="flex items-center gap-1.5"><Plus size={15} />{t("scopes.newScope")}</span>
            )}
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
          >
            <Input
              label={t("scopes.scopeName")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={t("scopes.scopeNamePlaceholder")}
            />
            <Input
              label={t("scopes.code")}
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder={t("scopes.codePlaceholder")}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? t("scopes.creating") : t("scopes.createScope")}
            </Button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-ink-soft">{t("common.loading")}</p>
        ) : scopes.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("scopes.noScopes")}</p>
        ) : (
          <div className="space-y-2.5">
            {scopes.map((scope) => (
              <div
                key={scope._id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <MapPinned size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-medium text-ink dark:text-ink-inverse">
                      {scope.name}{" "}
                      {scope.isMain && <span className="text-xs font-normal text-success">{t("scopes.main")}</span>}
                    </p>
                    <p className="text-xs text-ink-soft">{scope.code || t("common.noCode")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ScopeManagement;
