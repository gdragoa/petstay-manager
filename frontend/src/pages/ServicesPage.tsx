import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useTranslation } from '../contexts/TranslationContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import type { Service } from '../types';

function fmtBRL(v: number) { return `R$ ${v.toFixed(2).replace('.', ',')}`; }

export default function ServicesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ nome: '', nome_en: '', valor: '' });

  function load() {
    setLoading(true);
    api.get('/services').then((r: any) => setServices(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openNew() { setForm({ nome: '', nome_en: '', valor: '' }); setEditTarget(null); setModal(true); }
  function openEdit(s: Service) { setForm({ nome: s.nome, nome_en: s.nome_en, valor: String(s.valor) }); setEditTarget(s); setModal(true); }

  async function save() {
    if (!form.nome || !form.valor) return;
    setSaving(true);
    try {
      const body = { nome: form.nome, nome_en: form.nome_en || form.nome, valor: parseFloat(form.valor) };
      if (editTarget) await api.put(`/services/${editTarget.id}`, body);
      else await api.post('/services', body);
      toast(editTarget ? 'Atualizado!' : 'Criado!');
      setModal(false);
      load();
    } catch { toast('Erro', 'error'); }
    finally { setSaving(false); }
  }

  async function del() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/services/${deleteTarget.id}`);
      toast('Removido!');
      setDeleteTarget(null);
      load();
    } catch { toast('Erro', 'error'); }
    finally { setDeleting(false); }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--text-primary)' }}>{t('service.title')}</h1>
        <Button onClick={openNew}>{t('service.new')}</Button>
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        : services.length === 0
          ? <EmptyState emoji="✂️" title={t('service.noServices')} action={{ label: t('service.new'), onClick: openNew }} />
          : (
            <div className="flex flex-col gap-2">
              {services.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-4 rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{s.nome}</p>
                    {s.nome_en && s.nome_en !== s.nome && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.nome_en}</p>}
                  </div>
                  <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{fmtBRL(s.valor)}</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>{t('common.edit')}</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(s)}>✕</Button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editTarget ? t('common.edit') : t('service.new')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>{t('common.cancel')}</Button>
            <Button loading={saving} onClick={save}>{t('common.save')}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label={t('service.fields.name')} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          <Input label={t('service.fields.name_en')} value={form.nome_en} onChange={e => setForm(f => ({ ...f, nome_en: e.target.value }))} />
          <Input label={t('service.fields.price')} type="number" min="0" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remover serviço"
        message={`Remover "${deleteTarget?.nome}"?`}
        loading={deleting}
        onConfirm={del}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
