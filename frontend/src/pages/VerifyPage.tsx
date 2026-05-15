import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import Spinner from '../components/ui/Spinner';

interface VerifyData {
  valid: boolean;
  estabelecimento?: string;
  pet?: string;
  assinado_por?: string;
  signed_at?: string;
}

export default function VerifyPage() {
  const [params] = useSearchParams();
  const hash = params.get('h') || '';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerifyData | null>(null);

  useEffect(() => {
    if (!hash) { setLoading(false); return; }
    api.get(`/contracts/verify/${hash}`)
      .then((r: any) => setData(r.data))
      .catch(() => setData({ valid: false }))
      .finally(() => setLoading(false));
  }, [hash]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm rounded-2xl shadow-sm p-8 flex flex-col items-center gap-5" style={{ background: 'var(--bg-card)' }}>
        <span className="text-5xl">{data?.valid ? '✅' : '❌'}</span>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>
            {data?.valid ? 'Contrato Autêntico' : 'Hash não encontrado'}
          </h1>
        </div>

        {data?.valid && (
          <div className="w-full flex flex-col gap-2">
            {[
              { label: 'Estabelecimento', value: data.estabelecimento },
              { label: 'Pet', value: data.pet },
              { label: 'Assinado por', value: data.assinado_por },
              { label: 'Data', value: data.signed_at ? new Date(data.signed_at).toLocaleString('pt-BR') : undefined },
            ].map(row => row.value ? (
              <div key={row.label} className="flex flex-col">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ) : null)}

            <div className="mt-2 p-3 rounded-xl text-center text-xs" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
              Este documento foi assinado digitalmente e seus dados são autênticos.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
