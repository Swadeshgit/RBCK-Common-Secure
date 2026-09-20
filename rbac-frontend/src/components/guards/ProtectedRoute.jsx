import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePermission } from "../../context/PermissionContext.jsx";

/* =====================================================
   PROTECTED ROUTE
   Usage:
   - Module-based:  <ProtectedRoute module="Staff" action="view">...</ProtectedRoute>
   - SuperAdmin-only: <ProtectedRoute superAdminOnly>...</ProtectedRoute>
   - Sirf login-check: <ProtectedRoute>...</ProtectedRoute>
   Logic unchanged — only the loading state's visuals/text updated.
===================================================== */
function ProtectedRoute({
  children,
  module = null,
  action = "view",
  superAdminOnly = false,
}) {
  const { user, loading } = useAuth();
  const { can, isSuperAdmin, permLoading } = usePermission();
  const { t } = useTranslation();

  if (loading || permLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-white/10 dark:border-t-brand-400" />
          <p className="text-sm text-ink-soft">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (module && !isSuperAdmin && !can(module, action)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
