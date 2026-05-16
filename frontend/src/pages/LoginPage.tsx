import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTranslation } from '../contexts/TranslationContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirst, setIsFirst] = useState<boolean | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!senha) { setError('Digite sua senha'); return; }
    setLoading(true);
    setError('');
    try {
      const { firstLogin } = await login(senha);
      if (firstLogin) setIsFirst(true);
      else navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.error || 'Senha incorreta');
    } finally {
      setLoading(false);
    }
  }

  function handleFirstContinue() {
    navigate(from, { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🐾</div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>
            PetStay Manager
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isFirst === null ? 'Acesso administrativo' : 'Senha definida com sucesso!'}
          </p>
        </div>

        {isFirst ? (
          <div className="rounded-2xl p-6 text-center space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-4xl">✅</div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Primeira vez! Sua senha foi definida.</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Guarde-a bem — ela não pode ser recuperada por email.</p>
            <Button className="w-full" onClick={handleFirstContinue}>Entrar no sistema</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Input
              label="Senha"
              type="password"
              value={senha}
              onChange={e => { setSenha(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Primeira vez? Digite qualquer senha para defini-la.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
