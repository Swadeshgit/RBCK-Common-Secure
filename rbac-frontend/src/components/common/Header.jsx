import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { disconnectSocket } from "../../sockets/socket.js";
import ThemeToggle from "./ThemeToggle.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

/* =====================================================
   HEADER — logic identical to original: same handleLogout,
   same hasPassword branch for Update/Set Password.
   Only the presentation layer is upgraded, plus the new
   ThemeToggle / LanguageSwitcher additions.
===================================================== */
function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    disconnectSocket();
    navigate("/login");
  };

  return (
    <header className="relative flex items-center justify-between border-b border-border bg-surface px-6 py-3.5 dark:border-border-dark dark:bg-surface-dark-raised">
      <h1 className="text-base font-bold tracking-tight text-ink dark:text-ink-inverse">
        {t("header.dashboardTitle")}
      </h1>

      <div className="flex items-center gap-1.5">
        <LanguageSwitcher />
        <ThemeToggle />

        <div className="relative ms-2">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg py-1.5 ps-1 pe-2.5 text-sm font-medium text-ink
                       transition-colors hover:bg-ink/5 dark:text-ink-inverse dark:hover:bg-white/5"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </span>
            <span className="max-w-[10rem] truncate">
              {user?.name} <span className="text-ink-soft">({user?.userType})</span>
            </span>
            <ChevronDown
              size={14}
              className={`text-ink-soft transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute end-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-border
                           bg-surface py-1 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
              >
                {user?.hasPassword ? (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/update-password");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition-colors
                               hover:bg-brand-50 dark:text-ink-inverse dark:hover:bg-white/5"
                  >
                    <KeyRound size={15} className="text-ink-soft" />
                    {t("header.updatePassword")}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/set-password");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition-colors
                               hover:bg-brand-50 dark:text-ink-inverse dark:hover:bg-white/5"
                  >
                    <KeyRound size={15} className="text-ink-soft" />
                    {t("header.setPassword")}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition-colors
                             hover:bg-danger-bg dark:hover:bg-danger-bgDark"
                >
                  <LogOut size={15} />
                  {t("header.logout")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
