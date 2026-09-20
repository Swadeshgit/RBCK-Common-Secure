import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useTranslation } from "react-i18next";

/* =====================================================
   THEME TOGGLE — animated light/dark switch
===================================================== */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={t(`theme.${isDark ? "light" : "dark"}`)}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg
                 text-ink-muted transition-all duration-150 ease-out-soft
                 hover:bg-ink/5 hover:text-ink active:scale-90
                 dark:text-ink-soft dark:hover:bg-white/5 dark:hover:text-ink-inverse"
    >
      <span className="relative block h-4 w-4">
        <Sun
          size={16}
          strokeWidth={2}
          className={`absolute inset-0 transition-all duration-300 ease-out-soft ${
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        />
        <Moon
          size={16}
          strokeWidth={2}
          className={`absolute inset-0 transition-all duration-300 ease-out-soft ${
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}

export default ThemeToggle;
