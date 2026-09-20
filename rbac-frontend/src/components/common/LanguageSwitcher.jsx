import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";

/* =====================================================
   LANGUAGE SWITCHER
   English / हिंदी / اردو — updates i18next language and
   toggles document dir="rtl" for Urdu. Preference persists
   via i18next-browser-languagedetector (localStorage).
   Purely additive UI — no existing logic touched.
===================================================== */
const LANGS = [
  { code: "en", dir: "ltr" },
  { code: "hi", dir: "ltr" },
  { code: "ur", dir: "rtl" },
];

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const current = LANGS.find((l) => l.code === i18n.language) || LANGS[0];
    document.documentElement.dir = current.dir;
    document.documentElement.lang = current.code;
  }, [i18n.language]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t("language.label")}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-muted
                   transition-all duration-150 ease-out-soft
                   hover:bg-ink/5 hover:text-ink active:scale-95
                   dark:text-ink-soft dark:hover:bg-white/5 dark:hover:text-ink-inverse"
      >
        <Globe size={16} strokeWidth={2} />
        <span>{t(`language.${i18n.language}`)}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute end-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-border
                       bg-surface shadow-card animate-[fadeIn_0.12s_ease-out]
                       dark:border-border-dark dark:bg-surface-dark-raised dark:shadow-card-dark"
          >
            {LANGS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-sm text-ink
                           transition-colors hover:bg-brand-50
                           dark:text-ink-inverse dark:hover:bg-white/5"
              >
                <span>{t(`language.${lang.code}`)}</span>
                {i18n.language === lang.code && (
                  <Check size={14} className="text-brand-600 dark:text-brand-300" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;
