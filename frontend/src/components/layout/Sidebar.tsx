import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../contexts/TranslationContext';

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

export default function Sidebar({ onNavigate }: Props) {
  const { t } = useTranslation();

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
                  isActive
                    ? 'text-white'
                    : 'hover:bg-[var(--bg-hover)]'
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
    </nav>
  );
}
