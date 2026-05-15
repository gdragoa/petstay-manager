import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-[var(--bg-hover)]"
      style={{ color: 'var(--text-secondary)' }}
      title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
