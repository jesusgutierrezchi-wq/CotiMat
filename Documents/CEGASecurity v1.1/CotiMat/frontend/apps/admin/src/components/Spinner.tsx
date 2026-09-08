export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-8 font-sans text-sm text-steel">
      <span className="h-4 w-4 animate-spin border-2 border-steel border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="border-[1.5px] border-rejected bg-paper px-4 py-3 font-sans text-sm font-medium text-rejected shadow-tag">
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="border-[1.5px] border-dashed border-steel/50 px-4 py-10 text-center font-sans text-sm text-steel">
      {message}
    </div>
  );
}
