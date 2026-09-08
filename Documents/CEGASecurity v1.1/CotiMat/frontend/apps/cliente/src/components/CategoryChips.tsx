import type { Category } from '../types';

interface CategoryChipsProps {
  categories: Category[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export default function CategoryChips({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`shrink-0 border-2 px-3 py-1.5 font-sans text-sm font-semibold ${
          selected === null
            ? 'border-ink bg-ink text-paper'
            : 'border-steel/50 bg-paper text-steel hover:border-ink hover:text-ink'
        }`}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`shrink-0 border-2 px-3 py-1.5 font-sans text-sm font-semibold ${
            selected === category.id
              ? 'border-ink bg-ink text-paper'
              : 'border-steel/50 bg-paper text-steel hover:border-ink hover:text-ink'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
