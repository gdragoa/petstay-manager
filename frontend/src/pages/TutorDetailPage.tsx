import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useTranslation } from '../contexts/TranslationContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PhoneInput from '../components/ui/PhoneInput';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';
import { isValidEmail, isValidPhone } from '../lib/masks';
import type { Tutor, Animal, Booking } from '../types';

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('pt-BR'); }
function fmtBRL(v: number) { return `R$ ${v.toFixed(2).replace('.', ',')}`; }

export default function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<Partial<Tutor>>({});
  const [animalModal, setAnimalModal] = useState(false);
  const [animalForm, setAnimalForm] = useState({ nome: '', especie: 'cachorro', raca: '' });
  const [savingAnimal, setSavingAnimal] = useState(false);

  function load() {
    Promise.all([
      api.get(`/tutors/${id}`),
      api.get(`/bookings?q=`),
    ]).then(([tRes, bRes]: any[]) => {
      setTutor(tRes.data);
      setAnimals(tRes.data.animals || []);
      setForm(tRes.data);
      setBookings((bRes.data as Booking[]).filter(b => b.tutor_id === id));
    }).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function saveAnimal() {
    if (!animalForm.nome.trim()) return;
    setSavingAnimal(true);
    try {
      await api.post('/animals', { ...animalForm, tutor_id: id });
      toast('Animal cadastrado!');
      setAnimalModal(false);
      setAnimalForm({ nome: '', especie: 'cachorro', raca: '' });
      load();
    } catch { toast('Erro ao cadastrar animal', 'error'); }
    finally { setSavingAnimal(false); }
  }

  async function save() {
    if (form.telefone && !isValidPhone(form.telefone)) { return; }
    if (form.email && !isValidEmail(form.email)) { return; }
    setSaving(true);
    try {
      await api.put(`/tutors/${id}`, form);
      toast('Salvo!');
      setEditing(false);
      load();
    } catch { toast('Erro', 'error'); }
    finally { setSaving(false); }
  }

  async function deleteTutor() {
    setDeleting(true);
    try {
      await api.delete(`/tutors/${id}`);
      toast('Tutor removido');
      navigate('/tutors');
    } catch (err: any) {
      toast(err?.error || 'Erro ao remover', 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!tutor) return <p style={{ color: 'var(--text-muted)' }}>Tutor não encontrado.</p>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tutors')}>← {t('common.back')}</Button>
      </div>

      <Card>
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ background: 'var(--bg-hover)', color: 'var(--color-primary)' }}>
            {tutor.nome[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            {editing
              ? (
                <div className="flex flex-col gap-3">
                  <Input label="Nome" value={form.nome || ''} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                  <PhoneInput label="Telefone" value={form.telefone || ''} onChange={v => setForm(f => ({ ...f, telefone: v }))} />
                  <Input
                    label="Email"
                    type="email"
                    inputMode="email"
                    placeholder="nome@email.com"
                    value={form.email || ''}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    error={form.email && !isValidEmail(form.email) ? 'E-mail inválido' : undefined}
                  />
                  <Input label="Endereço" value={form.endereco || ''} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />
                  <div className="flex gap-2">
                    <Button size="sm" loading={saving} onClick={save}>{t('common.save')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
                  </div>
                </div>
              )
              : (
                <>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{tutor.nome}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>📞 {tutor.telefone}</p>
                  {tutor.email && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>✉️ {tutor.email}</p>}
                  {tutor.endereco && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>📍 {tutor.endereco}</p>}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>{t('common.edit')}</Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>{t('common.delete')}</Button>
                  </div>
                </>
              )
            }
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('tutor.animals')}</p>
          <Button size="sm" variant="outline" onClick={() => setAnimalModal(true)}>+ {t('animal.new')}</Button>
        </div>
        {animals.length === 0
          ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum animal cadastrado</p>
          : (
            <div className="flex flex-col gap-2">
              {animals.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-[var(--bg-hover)]" style={{ borderColor: 'var(--border)' }} onClick={() => navigate(`/animals/${a.id}`)}>
                  <Avatar species={a.especie} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.nome}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.especie}{a.raca ? ` · ${a.raca}` : ''}</p>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </div>
              ))}
            </div>
          )
        }
      </Card>

      <Card>
        <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t('tutor.history')}</p>
        {bookings.length === 0
          ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhuma reserva</p>
          : bookings.map(b => (
            <div key={b.id} className="flex justify-between items-center py-2 border-b last:border-0 cursor-pointer hover:bg-[var(--bg-hover)] px-2 rounded-lg" style={{ borderColor: 'var(--border)' }} onClick={() => navigate(`/bookings/${b.id}`)}>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{fmtDate(b.data_entrada)} → {fmtDate(b.data_saida)}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{b.status_presenca}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{fmtBRL(b.valor_total)}</p>
            </div>
          ))
        }
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Remover tutor"
        message="Tem certeza? Esta ação é irreversível."
        confirmLabel="Remover"
        loading={deleting}
        onConfirm={deleteTutor}
        onCancel={() => setConfirmDelete(false)}
      />

      <Modal
        open={animalModal}
        onClose={() => setAnimalModal(false)}
        title={t('animal.new')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAnimalModal(false)}>{t('common.cancel')}</Button>
            <Button loading={savingAnimal} onClick={saveAnimal} disabled={!animalForm.nome.trim()}>{t('common.save')}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label={t('animal.fields.name')}
            value={animalForm.nome}
            onChange={e => setAnimalForm(f => ({ ...f, nome: e.target.value }))}
          />
          <Select
            label={t('animal.fields.species')}
            options={[
              { value: 'cachorro', label: '🐶 Cachorro' },
              { value: 'gato', label: '🐱 Gato' },
              { value: 'outro', label: '🐾 Outro' },
            ]}
            value={animalForm.especie}
            onChange={e => setAnimalForm(f => ({ ...f, especie: e.target.value }))}
          />
          <Input
            label={t('animal.fields.breed')}
            value={animalForm.raca}
            onChange={e => setAnimalForm(f => ({ ...f, raca: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
