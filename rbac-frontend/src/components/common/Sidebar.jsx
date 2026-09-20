import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Building2, MapPinned, ShieldCheck, Users } from "lucide-react";
import { usePermission } from "../../context/PermissionContext.jsx";

/* =====================================================
   SIDEBAR — navigation menu
   Same visibility logic (isSuperAdmin / canAny) as before —
   only labels are now translation keys, plus icons added.
===================================================== */
const MENU_ITEMS = [
  { key: "dashboard", path: "/dashboard", module: null, icon: LayoutDashboard },
  { key: "organizations", path: "/organizations", module: null, superAdminOnly: true, icon: Building2 },
  { key: "scopes", path: "/scopes", module: null, superAdminOnly: true, icon: MapPinned },
  { key: "roles", path: "/roles", module: null, superAdminOnly: true, icon: ShieldCheck },
  { key: "staff", path: "/staff", module: "Staff", icon: Users },
];

function Sidebar() {
  const { isSuperAdmin, canAny } = usePermission();
  const { t } = useTranslation();

  const visibleItems = MENU_ITEMS.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (!item.module) return true;
    return canAny(item.module);
  });

  return (
    <aside className="min-h-[calc(100vh-57px)] w-60 border-e border-border bg-surface p-3 dark:border-border-dark dark:bg-surface-dark-raised">
      <nav className="space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out-soft ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : "text-ink-muted hover:bg-ink/5 hover:text-ink dark:text-ink-soft dark:hover:bg-white/5 dark:hover:text-ink-inverse"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-brand-600 transition-transform duration-200 ease-out-soft ${
                      isActive ? "scale-y-100" : "scale-y-0"
                    }`}
                  />
                  <Icon size={17} strokeWidth={2} className="shrink-0" />
                  {t(`sidebar.${item.key}`)}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
