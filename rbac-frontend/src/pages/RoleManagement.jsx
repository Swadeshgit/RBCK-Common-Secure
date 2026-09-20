import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X, ShieldCheck, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getModulesApi } from "../api/moduleApi.js";
import { createRoleApi, getRolesApi, updateRoleApi, deleteRoleApi } from "../api/roleApi.js";
import Layout from "../components/common/Layout.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import Alert from "../components/common/Alert.jsx";

const ACTIONS = ["view", "create", "edit", "delete"];

/* =====================================================
   ROLE MANAGEMENT PAGE
   Logic identical to original — only presentation upgraded.
===================================================== */
function RoleManagement() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [modules, setModules] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);

  const [roleName, setRoleName] = useState("");
  const [permissionsMap, setPermissionsMap] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modulesRes, rolesRes] = await Promise.all([getModulesApi(), getRolesApi(user.currentOrgId)]);
      setModules(modulesRes.data.modules || []);
      setRoles(rolesRes.data.roles || []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.currentOrgId) fetchData();
  }, [user?.currentOrgId]);

  const toggleAction = (moduleName, action) => {
    setPermissionsMap((prev) => ({
      ...prev,
      [moduleName]: { ...prev[moduleName], [action]: !prev[moduleName]?.[action] },
    }));
  };

  const openCreateForm = () => {
    setEditingRoleId(null);
    setRoleName("");
    setPermissionsMap({});
    setShowForm(true);
  };

  const openEditForm = (role) => {
    setEditingRoleId(role._id);
    setRoleName(role.name);

    const prefilledMap = {};
    role.defaultPermissions?.forEach((p) => {
      prefilledMap[p.module] = { ...p.actions };
    });
    setPermissionsMap(prefilledMap);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRoleId(null);
    setRoleName("");
    setPermissionsMap({});
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!roleName.trim()) {
      setError("Role name is required");
      return;
    }

    const defaultPermissions = Object.entries(permissionsMap)
      .filter(([, actions]) => Object.values(actions).some((v) => v))
      .map(([module, actions]) => ({ module, actions }));

    if (defaultPermissions.length === 0) {
      setError("Select at least one permission");
      return;
    }

    setSubmitting(true);
    try {
      if (editingRoleId) {
        await updateRoleApi(editingRoleId, { name: roleName, defaultPermissions });
      } else {
        await createRoleApi({ name: roleName, orgId: user.currentOrgId, defaultPermissions });
      }
      closeForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      await deleteRoleApi(roleId);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete role");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-ink dark:text-ink-inverse">{t("roles.title")}</h2>
          <Button onClick={showForm ? closeForm : openCreateForm}>
            {showForm ? (
              <span className="flex items-center gap-1.5"><X size={15} />{t("common.cancel")}</span>
            ) : (
              <span className="flex items-center gap-1.5"><Plus size={15} />{t("roles.newRole")}</span>
            )}
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
          >
            <p className="text-sm font-medium text-ink-soft">
              {editingRoleId ? t("roles.editingRole") : t("roles.creatingRole")}
            </p>

            <Input
              label={t("roles.roleName")}
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
              placeholder={t("roles.roleNamePlaceholder")}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-muted dark:text-ink-soft">
                {t("roles.permissions")}
              </label>
              <div className="overflow-hidden rounded-xl border border-border dark:border-border-dark">
                <table className="w-full text-sm">
                  <thead className="bg-surface-light dark:bg-white/[0.03]">
                    <tr>
                      <th className="px-3.5 py-2.5 text-start font-semibold text-ink-muted dark:text-ink-soft">
                        {t("roles.module")}
                      </th>
                      {ACTIONS.map((action) => (
                        <th key={action} className="px-3 py-2.5 text-center font-semibold text-ink-muted dark:text-ink-soft">
                          {t(`roles.${action}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((mod) => (
                      <tr
                        key={mod._id}
                        className="border-t border-border transition-colors hover:bg-brand-50/50 dark:border-border-dark dark:hover:bg-white/[0.03]"
                      >
                        <td className="px-3.5 py-2.5 text-ink dark:text-ink-inverse">{mod.label || mod.name}</td>
                        {ACTIONS.map((action) => (
                          <td key={action} className="px-3 py-2.5 text-center">
                            {mod.actions.includes(action) ? (
                              <input
                                type="checkbox"
                                checked={Boolean(permissionsMap[mod.name]?.[action])}
                                onChange={() => toggleAction(mod.name, action)}
                                className="h-4 w-4 cursor-pointer accent-brand-600"
                              />
                            ) : (
                              <span className="text-ink-soft/40">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? t("roles.saving") : editingRoleId ? t("roles.updateRole") : t("roles.createRole")}
            </Button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-ink-soft">{t("common.loading")}</p>
        ) : roles.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("roles.noRoles")}</p>
        ) : (
          <div className="space-y-2.5">
            {roles.map((role) => (
              <div
                key={role._id}
                className="rounded-xl border border-border bg-surface p-4 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
              >
                <div className="mb-2.5 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                      <ShieldCheck size={15} strokeWidth={2} />
                    </span>
                    <p className="font-medium text-ink dark:text-ink-inverse">{role.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openEditForm(role)}>
                      <span className="flex items-center gap-1.5"><Pencil size={13} />{t("roles.edit")}</span>
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(role._id)}>
                      <span className="flex items-center gap-1.5"><Trash2 size={13} />{t("roles.delete")}</span>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {role.defaultPermissions?.map((p, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-surface-light px-2 py-1 text-xs text-ink-muted dark:bg-white/[0.05] dark:text-ink-soft"
                    >
                      {p.module}:{" "}
                      {Object.entries(p.actions || {})
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join(", ")}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default RoleManagement;
