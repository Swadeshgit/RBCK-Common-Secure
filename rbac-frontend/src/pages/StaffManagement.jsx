import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, X, KeySquare, Power } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getRolesApi } from "../api/roleApi.js";
import { getScopesApi } from "../api/scopeApi.js";
import { createStaffApi, getStaffListApi, toggleStaffActiveApi } from "../api/staffApi.js";
import Layout from "../components/common/Layout.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import Alert from "../components/common/Alert.jsx";
import Can from "../components/guards/Can.jsx";

/* =====================================================
   STAFF MANAGEMENT PAGE
   Logic identical to original — only presentation upgraded.
===================================================== */
function StaffManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "", roleId: "" });
  const [selectedScopeIds, setSelectedScopeIds] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes, scopesRes] = await Promise.all([
        getStaffListApi(),
        getRolesApi(user.currentOrgId),
        getScopesApi(user.currentOrgId),
      ]);
      setStaffList(staffRes.data.staff || []);
      setRoles(rolesRes.data.roles || []);
      setScopes(scopesRes.data.scopes || []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.currentOrgId) fetchData();
  }, [user?.currentOrgId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleScope = (scopeId) => {
    setSelectedScopeIds((prev) => (prev.includes(scopeId) ? prev.filter((id) => id !== scopeId) : [...prev, scopeId]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.roleId) {
      setError("Please select a role");
      return;
    }

    setSubmitting(true);
    try {
      await createStaffApi({ ...formData, scopeIds: selectedScopeIds });
      setFormData({ name: "", email: "", password: "", phone: "", roleId: "" });
      setSelectedScopeIds([]);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (staffId) => {
    setTogglingId(staffId);
    try {
      await toggleStaffActiveApi(staffId);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update staff status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-ink dark:text-ink-inverse">{t("staff.title")}</h2>
          <Can module="Staff" action="create">
            <Button onClick={() => setShowForm((prev) => !prev)}>
              {showForm ? (
                <span className="flex items-center gap-1.5"><X size={15} />{t("common.cancel")}</span>
              ) : (
                <span className="flex items-center gap-1.5"><Plus size={15} />{t("staff.newStaff")}</span>
              )}
            </Button>
          </Can>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
          >
            <Input label={t("staff.fullName")} name="name" value={formData.name} onChange={handleChange} required />
            <Input label={t("staff.email")} name="email" type="email" value={formData.email} onChange={handleChange} required />
            <Input label={t("staff.password")} name="password" type="password" value={formData.password} onChange={handleChange} required />
            <Input label={t("staff.phone")} name="phone" value={formData.phone} onChange={handleChange} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-muted dark:text-ink-soft">
                {t("staff.role")} <span className="text-danger">*</span>
              </label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink
                           transition-all duration-150 ease-out-soft focus:border-brand-500 focus:outline-none
                           focus:ring-4 focus:ring-brand-500/15 dark:border-border-dark dark:bg-surface-dark-raised dark:text-ink-inverse"
              >
                <option value="">{t("staff.selectRole")}</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {scopes.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-medium text-ink-muted dark:text-ink-soft">
                  {t("staff.scopesBranches")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {scopes.map((scope) => (
                    <label
                      key={scope._id}
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-all duration-150 ease-out-soft ${
                        selectedScopeIds.includes(scope._id)
                          ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300"
                          : "border-border text-ink-muted hover:bg-surface-light dark:border-border-dark dark:text-ink-soft dark:hover:bg-white/5"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedScopeIds.includes(scope._id)}
                        onChange={() => toggleScope(scope._id)}
                      />
                      {scope.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? t("staff.creating") : t("staff.createStaff")}
            </Button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-ink-soft">{t("common.loading")}</p>
        ) : staffList.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("staff.noStaff")}</p>
        ) : (
          <div className="space-y-2.5">
            {staffList.map((staff) => (
              <div
                key={staff._id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    {staff.name?.[0]?.toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium text-ink dark:text-ink-inverse">{staff.name}</p>
                    <p className="text-xs text-ink-soft">
                      {staff.email} · {staff.roleId?.name || t("staff.noRole")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      staff.isActive
                        ? "bg-success-bg text-success dark:bg-success-bgDark"
                        : "bg-ink/5 text-ink-soft dark:bg-white/5"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${staff.isActive ? "bg-success" : "bg-ink-soft"}`} />
                    {staff.isActive ? t("staff.active") : t("staff.inactive")}
                  </span>
                  <Can module="Staff" action="edit">
                    <Button variant="outline" onClick={() => navigate(`/staff/${staff._id}/permissions`)}>
                      <span className="flex items-center gap-1.5"><KeySquare size={13} />{t("staff.managePermission")}</span>
                    </Button>
                    <Button variant="outline" onClick={() => handleToggle(staff._id)} disabled={togglingId === staff._id}>
                      <span className="flex items-center gap-1.5">
                        <Power size={13} />
                        {togglingId === staff._id ? "..." : staff.isActive ? t("staff.deactivate") : t("staff.activate")}
                      </span>
                    </Button>
                  </Can>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default StaffManagement;
