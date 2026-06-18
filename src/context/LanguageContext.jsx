import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const STORAGE_KEY = 'temtem_lang';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ms', label: 'Melayu', flag: '🇲🇾' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
];

const SUPPORTED = ['en', 'ms', 'zh-CN', 'zh-TW'];

/** Map browser language codes → our supported codes */
function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch {}

  // Browser language(s) — first match wins
  const candidates = navigator.languages || [navigator.language || 'en'];
  for (const raw of candidates) {
    const code = raw.split('-')[0]; // 'en-US' → 'en'
    if (code === 'zh' || code === 'yue') {
      // zh-CN, zh-SG, zh → Simplified Chinese
      // zh-TW, zh-HK, zh-MO → Traditional Chinese
      const full = raw.toLowerCase();
      if (full.includes('tw') || full.includes('hk') || full.includes('mo')) return 'zh-TW';
      return 'zh-CN';
    }
    if (code === 'ms') return 'ms';
    if (code === 'en') return 'en';
  }
  return 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLang);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key, fallback = '') => {
    if (!key) return fallback;
    if (typeof key === 'string') return key;
    return key[lang] || key.en || fallback;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
