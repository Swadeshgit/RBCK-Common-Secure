import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, User2, Mail, Tag } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { usePermission } from "../context/PermissionContext.jsx";
import { connectSocket, disconnectSocket } from "../sockets/socket.js";
import Layout from "../components/common/Layout.jsx";

/* =====================================================
   DASHBOARD PAGE
   Logic identical to original (sockets, force-logout,
   permission-updated listeners) — only presentation upgraded.
===================================================== */
function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSuperAdmin, role, access, permLoading, refetchPermissions } = usePermission();
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.id) connectSocket(user.id);
    return () => disconnectSocket();
  }, [user?.id]);

  useEffect(() => {
    const handleForceLogout = () => navigate("/login");
    window.addEventListener("force-logout", handleForceLogout);
    return () => window.removeEventListener("force-logout", handleForceLogout);
  }, [navigate]);

  useEffect(() => {
    const handlePermissionUpdate = () => refetchPermissions();
    window.addEventListener("permission-updated", handlePermissionUpdate);
    return () => window.removeEventListener("permission-updated", handlePermissionUpdate);
  }, [refetchPermissions]);

  const infoRows = [
    { icon: User2, label: t("dashboard.name"), value: user?.name },
    { icon: Mail, label: t("dashboard.email"), value: user?.email },
    { icon: Tag, label: t("dashboard.userType"), value: user?.userType },
    ...(!isSuperAdmin && role ? [{ icon: ShieldCheck, label: t("dashboard.role"), value: role.name }] : []),
  ];

  return (
    <Layout>
      <div className="max-w-2xl space-y-5">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark">
          <h2 className="mb-4 text-base font-bold tracking-tight text-ink dark:text-ink-inverse">
            {t("dashboard.accountOverview")}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-surface-light px-3.5 py-3 dark:bg-white/[0.03]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon size={15} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-ink-soft">{label}</p>
                  <p className="truncate text-sm font-medium text-ink dark:text-ink-inverse">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark">
          <h3 className="mb-3 text-sm font-bold tracking-tight text-ink dark:text-ink-inverse">
            {t("dashboard.permissionSummary")}
          </h3>

          {permLoading ? (
            <p className="text-sm text-ink-soft">{t("dashboard.loadingPermissions")}</p>
          ) : isSuperAdmin ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-sm font-medium text-success dark:bg-success-bgDark">
              <ShieldCheck size={14} />
              {t("dashboard.fullAccess")}
            </span>
          ) : access.length === 0 ? (
            <p className="text-sm text-ink-soft">{t("dashboard.noPermissions")}</p>
          ) : (
            <div className="space-y-2.5">
              {access.map((block, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border p-3.5 dark:border-border-dark"
                >
                  <p className="mb-1.5 text-xs text-ink-soft">
                    {t("dashboard.scopes")}: {block.scopeIds?.length || 0}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {block.permissions?.map((p, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      >
                        {p.module}:{" "}
                        {Object.entries(p.actions || {})
                          .filter(([, v]) => v)
                          .map(([k]) => k)
                          .join(", ") || t("dashboard.noActions")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
