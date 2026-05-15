import { useTranslation } from '../../contexts/TranslationContext';

export default function LanguageToggle() {
  const { lang, setLang } = useTranslation();
  return (
    <button
      onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--bg-hover)]"
      style={{ color: 'var(--text-secondary)' }}
      title="Toggle language"
      aria-label="Toggle language"
    >
      {lang === 'pt' ? 'EN' : 'PT'}
    </button>
  );
}
