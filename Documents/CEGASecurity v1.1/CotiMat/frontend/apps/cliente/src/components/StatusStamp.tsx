import type { QuoteStatus } from '../types';
import { QUOTE_STATUS_LABELS } from '../types';

const STAMP_STYLES: Record<QuoteStatus, string> = {
  PENDIENTE: 'border-steel text-steel',
  EN_SEGUIMIENTO: 'border-blueprint text-blueprint',
  APROBADA: 'border-approved text-approved',
  RECHAZADA: 'border-rejected text-rejected',
  CONVERTIDA: 'border-safety text-paper bg-safety',
};

interface StatusStampProps {
  status: QuoteStatus;
  className?: string;
}

export default function StatusStamp({ status, className = '' }: StatusStampProps) {
  return (
    <div
      className={`inline-block -rotate-2 border-2 px-3 py-1 font-display text-lg font-bold uppercase tracking-wide ${STAMP_STYLES[status]} ${className}`}
    >
      {QUOTE_STATUS_LABELS[status]}
    </div>
  );
}
