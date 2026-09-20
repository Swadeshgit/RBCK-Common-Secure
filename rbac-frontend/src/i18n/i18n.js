import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ur from "./locales/ur.json";

/* =====================================================
   i18n SETUP
   - Sirf frontend static text translate hota hai.
   - Backend se aane wale messages (err.response.data.message,
     success messages) INTENTIONALLY translate nahi kiye jaate —
     wo jaisa server bhejta hai waisa hi dikhaya jaata hai.
   - localStorage me "appLanguage" key se preference save hoti hai.
   - Urdu RTL hai — direction switch App.jsx / LanguageSwitcher me handle hota hai.
===================================================== */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ur: { translation: ur },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "ur"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "appLanguage",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
