import { useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import TouchRipple from "@mui/material/ButtonBase";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Span } from "components/Typography";
import BazaarMenu from "components/BazaarMenu";
import Script from "next/script";

const CustomTranslate = () => {
  const [lng, setLng] = useState("English");

  useEffect(() => {
    const localLang = localStorage.getItem("weblng") || "English";
    setLng(localLang);

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=TranslateInit";
    script.async = true;
    document.body.appendChild(script);

    window.TranslateInit = () => {
      const googleTranslateConfig = { lang: "en" };
      const code = TranslateGetCode();

      new window.google.translate.TranslateElement(
        { pageLanguage: googleTranslateConfig.lang, autoDisplay: false },
        "google_translate_element"
      );

      document.querySelectorAll("[data-google-lang]").forEach((el) => {
        el.addEventListener("click", () => {
          TranslateSetCookie(el.getAttribute("data-google-lang"));
          window.location.reload();// Reload without cache issues
        });
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const TranslateGetCode = () => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("googtrans="))
      ?.split("=")[1];
    return cookieValue ? cookieValue.split("/").pop() : "en"; 
  };

  const TranslateClearCookie = () => {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.imgglobal.in;";
  };
  

  const TranslateSetCookie = (code) => {
    document.cookie = `googtrans=/auto/${code}; path=/; domain=${window.location.hostname};`;
  };

  const languageOptions = {
    af: { title: "Afrikaans", value: "af" },
    ar: { title: "Arabic", value: "ar" },
    "zh-CN": { title: "Chinese", value: "zh-CN" },
    da: { title: "Danish", value: "da" },
    de: { title: "German", value: "de" },
    en: { title: "English", value: "en" },
    fr: { title: "French", value: "fr" },
    hi: { title: "Hindi", value: "hi" },
    it: { title: "Italian", value: "it" },
    ja: { title: "Japanese", value: "ja" },
    ko: { title: "Korean", value: "ko" },
    nl: { title: "Dutch", value: "nl" },
    ru: { title: "Russian", value: "ru" },
    es: { title: "Spanish", value: "es" },
    sv: { title: "Swedish", value: "sv" },
    th: { title: "Thai", value: "th" },
  };

  const handleLanguageChange = (languageCode, languageTitle) => {
    TranslateClearCookie();
    setLng(languageTitle);
    localStorage.setItem("weblng", languageTitle);
    TranslateSetCookie(languageCode);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <>
      <Script src="https://translate.google.com/translate_a/element.js?cb=TranslateInit" strategy="afterInteractive" />
      <style>{`
        .skiptranslate { display: none !important; }
      `}</style>

      <div id="google_translate_element" />

      <BazaarMenu
        handler={(e) => (
          <TouchRipple className="handler marginRight" onClick={e}>
            <Span className="menuTitle">{lng}</Span>
            <ExpandMore fontSize="inherit" />
          </TouchRipple>
        )}
        options={(onClose) =>
          Object.keys(languageOptions).map((language) => (
            <MenuItem
              key={language}
              className="menuItem notranslate"
              onClick={() => {
                handleLanguageChange(languageOptions[language].value, languageOptions[language].title);
                onClose();
              }}
            >
              <Span className="menuTitle">{languageOptions[language].title}</Span>
            </MenuItem>
          ))
        }
      />
    </>
  );
};

export default CustomTranslate;
