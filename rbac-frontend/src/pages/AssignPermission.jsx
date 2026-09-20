import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getModulesApi } from "../api/moduleApi.js";
import { getScopesApi } from "../api/scopeApi.js";
import { getPermissionByUserApi, assignPermissionApi } from "../api/staffApi.js";
import Layout from "../components/common/Layout.jsx";
import Button from "../components/common/Button.jsx";
import Alert from "../components/common/Alert.jsx";

const ACTIONS = ["view", "create", "edit", "delete"];

/* =====================================================
   ASSIGN PERMISSION PAGE
   Logic identical to original — only presentation upgraded.
===================================================== */
function AssignPermission() {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [modules, setModules] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [selectedScopeIds, setSelectedScopeIds] = useState([]);
  const [permissionsMap, setPermissionsMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [modulesRes, scopesRes, permRes] = await Promise.all([
          getModulesApi(),
          getScopesApi(user.currentOrgId),
          getPermissionByUserApi(staffId),
        ]);

        setModules(modulesRes.data.modules || []);
        setScopes(scopesRes.data.scopes || []);

        const existingAccess = permRes.data.permission?.access || [];
        const firstBlock = existingAccess[0];
        if (firstBlock) {
          setSelectedScopeIds((firstBlock.scopeIds || []).map(String));

          const prefilledMap = {};
          firstBlock.permissions?.forEach((p) => {
            prefilledMap[p.module] = { ...p.actions };
          });
          setPermissionsMap(prefilledMap);
        }
      } catch (err) {
        setError("Failed to load permission data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.currentOrgId) loadData();
  }, [staffId, user?.currentOrgId]);

  const toggleScope = (scopeId) => {
    setSelectedScopeIds((prev) => (prev.includes(scopeId) ? prev.filter((id) => id !== scopeId) : [...prev, scopeId]));
  };

  const toggleAction = (moduleName, action) => {
    setPermissionsMap((prev) => ({
      ...prev,
      [moduleName]: { ...prev[moduleName], [action]: !prev[moduleName]?.[action] },
    }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const permissions = Object.entries(permissionsMap)
      .filter(([, actions]) => Object.values(actions).some((v) => v))
      .map(([module, actions]) => ({ module, actions }));

    if (permissions.length === 0) {
      setError("Select at least one permission");
      return;
    }

    setSaving(true);
    try {
      await assignPermissionApi(staffId, { access: [{ scopeIds: selectedScopeIds, permissions }] });
      setSuccess("Permissions updated successfully. User will need to login again.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-sm text-ink-soft">{t("common.loading")}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink dark:text-ink-inverse">
              {t("assignPermission.title")}
            </h2>
            <p className="text-sm text-ink-soft">{t("assignPermission.subtitle")}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/staff")}>
            <span className="flex items-center gap-1.5"><ArrowLeft size={14} />{t("assignPermission.backToStaff")}</span>
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark">
          {scopes.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-muted dark:text-ink-soft">
                {t("assignPermission.whichScopes")}
              </label>
              <div className="flex flex-wrap gap-2">
                {scopes.map((scope) => (
                  <button
                    key={scope._id}
                    type="button"
                    onClick={() => toggleScope(scope._id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-all duration-150 ease-out-soft ${
                      selectedScopeIds.includes(scope._id)
                        ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300"
                        : "border-border text-ink-muted hover:bg-surface-light dark:border-border-dark dark:text-ink-soft dark:hover:bg-white/5"
                    }`}
                  >
                    {scope.name}
                  </button>
                ))}
              </div>
              {selectedScopeIds.length === 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
                  <AlertTriangle size={13} />
                  {t("assignPermission.noScopeWarning")}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-ink-muted dark:text-ink-soft">
              {t("assignPermission.whatCanTheyDo")}
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

          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("assignPermission.saving") : t("assignPermission.savePermissions")}
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default AssignPermission;
