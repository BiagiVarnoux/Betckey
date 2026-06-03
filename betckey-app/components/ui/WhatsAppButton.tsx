import { MessageCircle } from 'lucide-react';

interface Props {
  href: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-7 py-4 text-lg',
};

export default function WhatsAppButton({ href, label = 'Pedir por WhatsApp', size = 'md', className = '' }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-[var(--color-whatsapp)] text-white font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all ${sizes[size]} ${className}`}
    >
      <MessageCircle size={size === 'lg' ? 22 : 18} />
      {label}
    </a>
  );
}
