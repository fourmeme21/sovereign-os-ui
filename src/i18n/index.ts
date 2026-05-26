import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// EN
import enCommon   from './locales/en/common.json';
import enChat     from './locales/en/chat.json';
import enSettings from './locales/en/settings.json';
import enPricing  from './locales/en/pricing.json';
import enMemory   from './locales/en/memory.json';
import enErrors   from './locales/en/errors.json';
import enHistory  from './locales/en/history.json';
import enConnect  from './locales/en/connect.json';

// TR
import trCommon   from './locales/tr/common.json';
import trChat     from './locales/tr/chat.json';
import trSettings from './locales/tr/settings.json';
import trPricing  from './locales/tr/pricing.json';
import trMemory   from './locales/tr/memory.json';
import trErrors   from './locales/tr/errors.json';
import trHistory  from './locales/tr/history.json';
import trConnect  from './locales/tr/connect.json';

// JA
import jaCommon   from './locales/ja/common.json';
import jaChat     from './locales/ja/chat.json';
import jaSettings from './locales/ja/settings.json';
import jaPricing  from './locales/ja/pricing.json';
import jaMemory   from './locales/ja/memory.json';
import jaErrors   from './locales/ja/errors.json';
import jaHistory  from './locales/ja/history.json';
import jaConnect  from './locales/ja/connect.json';

// DE
import deCommon   from './locales/de/common.json';
import deChat     from './locales/de/chat.json';
import deSettings from './locales/de/settings.json';
import dePricing  from './locales/de/pricing.json';
import deMemory   from './locales/de/memory.json';
import deErrors   from './locales/de/errors.json';
import deHistory  from './locales/de/history.json';
import deConnect  from './locales/de/connect.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common:   enCommon,
        chat:     enChat,
        settings: enSettings,
        pricing:  enPricing,
        memory:   enMemory,
        errors:   enErrors,
        history:  enHistory,
        connect:  enConnect,
      },
      tr: {
        common:   trCommon,
        chat:     trChat,
        settings: trSettings,
        pricing:  trPricing,
        memory:   trMemory,
        errors:   trErrors,
        history:  trHistory,
        connect:  trConnect,
      },
      ja: {
        common:   jaCommon,
        chat:     jaChat,
        settings: jaSettings,
        pricing:  jaPricing,
        memory:   jaMemory,
        errors:   jaErrors,
        history:  jaHistory,
        connect:  jaConnect,
      },
      de: {
        common:   deCommon,
        chat:     deChat,
        settings: deSettings,
        pricing:  dePricing,
        memory:   deMemory,
        errors:   deErrors,
        history:  deHistory,
        connect:  deConnect,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
