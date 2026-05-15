import { createContext, useContext, useState, ReactNode } from 'react';
import { pt } from '../i18n/pt';
import { en } from '../i18n/en';

export type Lang = 'pt' | 'en';

const dicts = { pt, en };

function getVal(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj as unknown) as string ?? path;
}

function interpolate(str: string, params: Record<string, string>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] ?? k);
}

interface TranslationCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const TranslationContext = createContext<TranslationCtx | null>(null);

export function TranslationProvider({ children, initial }: { children: ReactNode; initial?: Lang }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('lang') as Lang;
    if (stored === 'pt' || stored === 'en') return stored;
    return initial || 'pt';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const val = getVal(dicts[lang] as unknown as Record<string, unknown>, key)
      || getVal(dicts.pt as unknown as Record<string, unknown>, key)
      || key;
    return params ? interpolate(val, params) : val;
  };

  return (
    <TranslationContext.Provider value={{ lang, setLang, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslation must be inside TranslationProvider');
  return ctx;
}
