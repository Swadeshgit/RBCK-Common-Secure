import { ShieldCheck } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

/* =====================================================
   AUTH SHELL — shared visual frame for pre-login pages
   (Login, Forgot/Reset Password, OTP flow, etc). Purely
   presentational — each page keeps its own state/handlers
   and just renders its form inside this shell's children.
===================================================== */
function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-light px-4 py-10 dark:bg-surface-dark">
      <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Subtle brand backdrop accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/15" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
            <ShieldCheck size={22} strokeWidth={2.25} />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-ink dark:text-ink-inverse">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted dark:text-ink-soft">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-7 shadow-card dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark">
          {children}
        </div>

        {footer && <div className="mt-5 text-center text-sm text-ink-muted dark:text-ink-soft">{footer}</div>}
      </div>
    </div>
  );
}

export default AuthShell;
