import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../contexts/TranslationContext';
import { useAuth } from '../../contexts/AuthContext';

interface Props { onNavigate?: () => void }

const navItems = [
  { to: '/', label: 'dashboard', icon: '📊', exact: true },
  { to: '/bookings', label: 'bookings', icon: '📋' },
  { to: '/animals', label: 'animals', icon: '🐾' },
  { to: '/tutors', label: 'tutors', icon: '👥' },
  { to: '/services', label: 'services', icon: '✂️' },
  { to: '/calendar', label: 'calendar', icon: '📅' },
  { to: '/settings', label: 'settings', icon: '⚙️' },
];

function formatExpiry(date: Date | null) {
  if (!date) return null;
  const diff = date.getTime() - Date.now();
  const days = Math.ceil(diff / 86_400_000);
  if (days <= 0) return 'Sessão expirada';
  if (days === 1) return 'Sessão expira hoje';
  return `Sessão expira em ${days}d`;
}

export default function Sidebar({ onNavigate }: Props) {
  const { t } = useTranslation();
  const { logout, expiresAt } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="flex flex-col h-full py-4" style={{ background: 'var(--bg-sidebar)' }}>
      <div className="px-4 mb-6">
        <span className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--color-primary)' }}>
          🐾 PetStay
        </span>
      </div>

      <ul className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.exact}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'text-white' : 'hover:bg-[var(--bg-hover)]'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'var(--color-primary)', color: '#fff' } : { color: 'var(--text-secondary)' }}
            >
              <span className="text-base">{item.icon}</span>
              {t(`nav.${item.label}`)}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="px-4 pt-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
        {expiresAt && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatExpiry(expiresAt)}</p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>🚪</span> Sair
        </button>
      </div>
    </nav>
  );
}
