import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import api from '../lib/api';

type Mode = 'loading' | 'login' | 'first-setup' | 'no-setup-token' | 'done';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('loading');
  const [senha, setSenha] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    api.get('/auth/status').then((res: any) => {
      if (res.data.hasPassword) setMode('login');
      else if (res.data.setupConfigured) setMode('first-setup');
      else setMode('no-setup-token');
    }).catch(() => setMode('login'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!senha) { setError('Digite sua senha'); return; }
    if (mode === 'first-setup' && !setupToken) { setError('Digite o token de configuração'); return; }
    setLoading(true);
    setError('');
    try {
      await login(senha, mode === 'first-setup' ? setupToken : undefined);
      navigate(from, { replace: true });
    } catch (err: any) {
      const code = err?.code;
      if (code === 'INVALID_SETUP_TOKEN') setError('Token de configuração inválido');
      else if (code === 'INVALID_PASSWORD') setError('Senha incorreta');
      else if (code === 'PASSWORD_TOO_SHORT') setError('Senha precisa ter ao menos 8 caracteres');
      else setError(err?.error || 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (mode === 'no-setup-token') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
        <div className="w-full max-w-sm rounded-2xl p-6 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-3xl text-center">⚙️</div>
          <h2 className="font-bold text-center" style={{ color: 'var(--text-primary)' }}>Configuração necessária</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            O sistema ainda não tem uma senha definida e a variável <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--bg-hover)' }}>SETUP_TOKEN</code> não está configurada no servidor.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Adicione <code className="font-mono text-xs px-1 rounded" style={{ background: 'var(--bg-hover)' }}>SETUP_TOKEN=sua-chave-secreta</code> nas variáveis de ambiente e reinicie o servidor.
          </p>
        </div>
      </div>
    );
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
            {mode === 'first-setup' ? 'Primeira configuração' : 'Acesso administrativo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {mode === 'first-setup' && (
            <>
              <div className="rounded-xl p-3 text-sm" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                Primeira vez no sistema. Use o <strong>SETUP_TOKEN</strong> configurado no servidor para definir sua senha.
              </div>
              <Input
                label="Token de configuração (SETUP_TOKEN)"
                type="password"
                value={setupToken}
                onChange={e => { setSetupToken(e.target.value); setError(''); }}
                placeholder="Cole o valor de SETUP_TOKEN"
                autoFocus
              />
            </>
          )}

          <Input
            label={mode === 'first-setup' ? 'Nova senha (mín. 8 caracteres)' : 'Senha'}
            type="password"
            value={senha}
            onChange={e => { setSenha(e.target.value); setError(''); }}
            placeholder="••••••••"
            autoFocus={mode === 'login'}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : mode === 'first-setup' ? 'Definir senha e entrar' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
