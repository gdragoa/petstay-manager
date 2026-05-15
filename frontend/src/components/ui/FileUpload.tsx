import { useRef, DragEvent, ChangeEvent, useState } from 'react';

interface Props {
  accept?: string;
  maxMB?: number;
  label?: string;
  hint?: string;
  onFile: (file: File) => void;
}

export default function FileUpload({ accept = 'image/*', maxMB = 5, label = 'Arraste ou clique', hint, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  function handleFile(file: File) {
    setError('');
    if (file.size > maxMB * 1024 * 1024) {
      setError(`Arquivo muito grande (máx. ${maxMB}MB)`);
      return;
    }
    onFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all"
        style={{
          borderColor: dragging ? 'var(--color-primary)' : 'var(--border)',
          background: dragging ? 'var(--bg-hover)' : 'transparent',
        }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {hint && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{error}</p>}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onChange} />
    </div>
  );
}
