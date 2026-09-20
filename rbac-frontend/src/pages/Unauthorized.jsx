import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";

/* =====================================================
   UNAUTHORIZED PAGE
   ProtectedRoute jab permission-fail kare to yahan redirect hoga
   Logic identical to original — only presentation upgraded.
===================================================== */
function Unauthorized() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-bg text-danger dark:bg-danger-bgDark">
        <ShieldAlert size={26} strokeWidth={2} />
      </span>
      <h1 className="mb-2 text-xl font-bold tracking-tight text-ink dark:text-ink-inverse">
        {t("unauthorized.title")}
      </h1>
      <p className="mb-6 text-sm text-ink-muted dark:text-ink-soft">{t("unauthorized.message")}</p>
      <Link
        to="/dashboard"
        className="text-sm font-medium text-brand-600 transition-colors hover:underline dark:text-brand-300"
      >
        {t("unauthorized.backToDashboard")}
      </Link>
    </div>
  );
}

export default Unauthorized;
