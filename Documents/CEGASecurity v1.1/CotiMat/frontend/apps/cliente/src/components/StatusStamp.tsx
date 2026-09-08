import { useEffect, useRef, useState } from 'react';
import type { QuoteStatus } from '../types';
import { QUOTE_STATUS_LABELS } from '../types';

const STATUS_STYLES: Record<QuoteStatus, string> = {
  PENDIENTE: 'bg-canvas text-muted',
  EN_SEGUIMIENTO: 'bg-blue-50 text-progress',
  APROBADA: 'bg-green-50 text-approved',
  RECHAZADA: 'bg-red-50 text-rejected',
  CONVERTIDA: 'bg-accent text-white',
};

interface StatusStampProps {
  status: QuoteStatus;
  className?: string;
}

export default function StatusStamp({ status, className = '' }: StatusStampProps) {
  const [justChanged, setJustChanged] = useState(false);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (prevStatusRef.current !== status) {
      setJustChanged(true);
      const timeout = setTimeout(() => setJustChanged(false), 320);
      prevStatusRef.current = status;
      return () => clearTimeout(timeout);
    }
    prevStatusRef.current = status;
    return undefined;
  }, [status]);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
        justChanged ? 'status-pop' : ''
      } ${STATUS_STYLES[status]} ${className}`}
    >
      {QUOTE_STATUS_LABELS[status]}
    </span>
  );
}
