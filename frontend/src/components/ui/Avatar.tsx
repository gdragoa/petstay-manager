type Species = 'cachorro' | 'gato' | 'outro';

const emojis: Record<Species, string> = {
  cachorro: '🐶',
  gato: '🐱',
  outro: '🐾',
};

interface Props { species?: Species; name?: string; size?: 'sm' | 'md' | 'lg' }

const sizes = { sm: 'h-8 w-8 text-lg', md: 'h-12 w-12 text-2xl', lg: 'h-16 w-16 text-3xl' };

export default function Avatar({ species = 'outro', size = 'md' }: Props) {
  return (
    <div
      className={`flex items-center justify-center rounded-full ${sizes[size]}`}
      style={{ background: 'var(--bg-hover)' }}
    >
      {emojis[species] || '🐾'}
    </div>
  );
}
