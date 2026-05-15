import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useTranslation } from '../contexts/TranslationContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PhoneInput from '../components/ui/PhoneInput';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { isValidEmail, isValidPhone } from '../lib/masks';
import type { Tutor } from '../types';

export default function TutorsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', endereco: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function load() {
    setLoading(true);
    const q = search ? `?q=${search}` : '';
    api.get(`/tutors${q}`).then((r: any) => setTutors(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search]);

  function openModal() {
    setForm({ nome: '', telefone: '', email: '', endereco: '' });
    setErrors({});
    setModal(true);
  }

  async function save() {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = t('errors.required');
    if (!form.telefone) e.telefone = t('errors.required');
    else if (!isValidPhone(form.telefone)) e.telefone = 'Telefone inválido';
    if (form.email && !isValidEmail(form.email)) e.email = 'E-mail inválido';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await api.post('/tutors', form);
      toast('Tutor cadastrado!');
      setModal(false);
      load();
    } catch { toast('Erro ao cadastrar', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>{t('tutor.title')}</h1>
        <Button onClick={openModal}>{t('tutor.new')}</Button>
      </div>

      <Input placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} />

      {loading
        ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        : tutors.length === 0
          ? <EmptyState emoji="👥" title={t('tutor.noTutors')} action={{ label: t('tutor.new'), onClick: openModal }} />
          : (
            <div className="flex flex-col gap-2">
              {tutors.map(t2 => (
                <div
                  key={t2.id}
                  className="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                  onClick={() => navigate(`/tutors/${t2.id}`)}
                >
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'var(--bg-hover)', color: 'var(--color-primary)' }}>
                    {t2.nome[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{t2.nome}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t2.telefone}{t2.email ? ` · ${t2.email}` : ''}</p>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              ))}
            </div>
          )
      }

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={t('tutor.new')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>{t('common.cancel')}</Button>
            <Button loading={saving} onClick={save}>{t('common.save')}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label={t('tutor.fields.name')}
            value={form.nome}
            onChange={e => { setForm(f => ({ ...f, nome: e.target.value })); setErrors(e2 => ({ ...e2, nome: '' })); }}
            error={errors.nome}
          />
          <PhoneInput
            label={t('tutor.fields.phone')}
            value={form.telefone}
            onChange={v => { setForm(f => ({ ...f, telefone: v })); setErrors(e => ({ ...e, telefone: '' })); }}
            error={errors.telefone}
          />
          <Input
            label={t('tutor.fields.email')}
            type="email"
            inputMode="email"
            placeholder="nome@email.com"
            value={form.email}
            onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
            error={errors.email}
          />
          <Input
            label={t('tutor.fields.address')}
            value={form.endereco}
            onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
