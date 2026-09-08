import { useEffect, useRef, useState } from 'react';
import type { QuoteStatus } from '../types';
import { QUOTE_STATUS_LABELS } from '../types';

const STATUS_STYLES: Record<QuoteStatus, string> = {
  PENDIENTE: 'bg-gray-100 text-pending',
  EN_SEGUIMIENTO: 'bg-blue-50 text-progress',
  APROBADA: 'bg-green-50 text-approved',
  RECHAZADA: 'bg-red-50 text-rejected',
  CONVERTIDA: 'bg-accent text-white',
};

interface StatusStampProps {
  status: QuoteStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * The status pill used throughout the admin to represent a quote's status.
 * When `status` changes while the component stays mounted, it re-plays a
 * short fade + scale transition (scale-95/opacity-0 settling into scale-100/opacity-100).
 */
export function StatusStamp({ status, className = '', size = 'md' }: StatusStampProps) {
  const isFirstRender = useRef(true);
  const prevStatus = useRef(status);
  const [justStamped, setJustStamped] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevStatus.current = status;
      return;
    }
    if (prevStatus.current !== status) {
      prevStatus.current = status;
      setJustStamped(true);
      const t = setTimeout(() => setJustStamped(false), 240);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [status]);

  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm';

  return (
    <span
      className={[
        'inline-flex select-none items-center whitespace-nowrap rounded-full font-medium transition-all duration-300 ease-out',
        sizeClasses,
        STATUS_STYLES[status],
        justStamped ? 'scale-95 opacity-0' : 'scale-100 opacity-100',
        className,
      ].join(' ')}
    >
      {QUOTE_STATUS_LABELS[status]}
    </span>
  );
}
