import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, Building2, ArrowLeftRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { createOrganizationApi, getMyOrganizationsApi, switchOrganizationApi } from "../api/organizationApi.js";
import Layout from "../components/common/Layout.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import Alert from "../components/common/Alert.jsx";

/* =====================================================
   ORGANIZATION SETUP PAGE
   Logic identical to original — only presentation upgraded.
===================================================== */
function OrganizationSetup() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [organizations, setOrganizations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ name: "", code: "", domain: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [switchingId, setSwitchingId] = useState(null);

  const fetchOrganizations = async () => {
    try {
      setLoadingList(true);
      const res = await getMyOrganizationsApi();
      setOrganizations(res.data.organizations || []);
    } catch (err) {
      setError("Failed to load organizations");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await createOrganizationApi(formData);

      if (res.data.token) {
        const updatedUser = {
          ...user,
          mainOrgId: res.data.organization._id,
          currentOrgId: res.data.organization._id,
        };
        refreshUser(updatedUser, res.data.token);
      }

      setFormData({ name: "", code: "", domain: "" });
      setShowForm(false);
      fetchOrganizations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitch = async (orgId) => {
    setSwitchingId(orgId);
    try {
      const res = await switchOrganizationApi(orgId);
      const updatedUser = { ...user, currentOrgId: res.data.currentOrgId };
      refreshUser(updatedUser, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to switch organization");
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-ink dark:text-ink-inverse">
            {t("organizations.title")}
          </h2>
          <Button onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? (
              <span className="flex items-center gap-1.5"><X size={15} />{t("common.cancel")}</span>
            ) : (
              <span className="flex items-center gap-1.5"><Plus size={15} />{t("organizations.newOrganization")}</span>
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
              label={t("organizations.orgName")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={t("organizations.orgNamePlaceholder")}
            />
            <Input
              label={t("organizations.code")}
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder={t("organizations.codePlaceholder")}
            />
            <Input
              label={t("organizations.domain")}
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              placeholder={t("organizations.domainPlaceholder")}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? t("organizations.creating") : t("organizations.createOrganization")}
            </Button>
          </form>
        )}

        {loadingList ? (
          <p className="text-sm text-ink-soft">{t("common.loading")}</p>
        ) : organizations.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("organizations.noOrganizations")}</p>
        ) : (
          <div className="space-y-2.5">
            {organizations.map((org) => {
              const isCurrent = String(org._id) === String(user?.currentOrgId);
              return (
                <div
                  key={org._id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-card transition-shadow hover:shadow-md dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                      <Building2 size={16} strokeWidth={2} />
                    </span>
                    <div>
                      <p className="font-medium text-ink dark:text-ink-inverse">
                        {org.name}{" "}
                        {isCurrent && (
                          <span className="text-xs font-normal text-success">{t("organizations.current")}</span>
                        )}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {org.code || t("common.noCode")} · {org.domain || t("common.noDomain")}
                      </p>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="outline"
                      onClick={() => handleSwitch(org._id)}
                      disabled={switchingId === org._id}
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowLeftRight size={14} />
                        {switchingId === org._id ? t("organizations.switching") : t("organizations.switch")}
                      </span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default OrganizationSetup;
