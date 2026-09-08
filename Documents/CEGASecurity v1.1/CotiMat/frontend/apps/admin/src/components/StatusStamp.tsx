import { useEffect, useRef, useState } from 'react';
import type { QuoteStatus } from '../types';
import { QUOTE_STATUS_LABELS } from '../types';

const STAMP_STYLES: Record<QuoteStatus, string> = {
  PENDIENTE: 'border-steel text-steel bg-paper',
  EN_SEGUIMIENTO: 'border-blueprint text-blueprint bg-paper',
  APROBADA: 'border-approved text-approved bg-paper',
  RECHAZADA: 'border-rejected text-rejected bg-paper',
  CONVERTIDA: 'border-safety text-paper bg-safety',
};

interface StatusStampProps {
  status: QuoteStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * The "sello" used throughout the admin to represent a quote's status.
 * When `status` changes while the component stays mounted, it re-plays a
 * short stamp-hit animation (scale 0.9 -> 1 settling into its resting tilt).
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
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm';

  return (
    <span
      className={[
        'inline-block select-none whitespace-nowrap border-2 -rotate-2 font-display font-bold uppercase tracking-wide',
        sizeClasses,
        STAMP_STYLES[status],
        justStamped ? 'animate-stamp' : '',
        className,
      ].join(' ')}
      style={{ ['--stamp-rot' as string]: '-2deg' }}
    >
      {QUOTE_STATUS_LABELS[status]}
    </span>
  );
}
