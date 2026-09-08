import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchMaterials, getFriendlyErrorMessage } from '../services/api';
import MaterialCard from '../components/MaterialCard';
import CategoryChips from '../components/CategoryChips';
import CartBar from '../components/CartBar';
import { SearchIcon } from '../components/icons';
import { useCartStore, cartCount } from '../store/cart.store';

const PAGE_SIZE_STEP = 24;

export default function Catalogo() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPageSize(PAGE_SIZE_STEP);
  }, [search, categoryId]);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const materialsQuery = useQuery({
    queryKey: ['materials', { search, categoryId, pageSize }],
    queryFn: () =>
      fetchMaterials({
        search: search || undefined,
        category: categoryId || undefined,
        page: 1,
        pageSize,
      }),
    placeholderData: (previous) => previous,
  });

  const cartLines = useCartStore((state) => state.lines);
  const items = materialsQuery.data?.items ?? [];
  const total = materialsQuery.data?.total ?? 0;
  const canLoadMore = items.length < total;
  const hasCartItems = cartCount(cartLines) > 0;

  return (
    <div
      className={`mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:pb-16 ${
        hasCartItems ? 'lg:pr-80' : ''
      }`}
    >
      <div className="mb-5 flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-steel" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar cemento, varilla, block…"
            className="w-full border-2 border-ink bg-paper py-2.5 pl-10 pr-3 font-sans text-sm text-ink placeholder:text-steel/70 focus:outline-none focus:ring-2 focus:ring-safety"
          />
        </div>

        {categoriesQuery.data && categoriesQuery.data.length > 0 && (
          <CategoryChips
            categories={categoriesQuery.data}
            selected={categoryId}
            onSelect={setCategoryId}
          />
        )}
      </div>

      {materialsQuery.isLoading && (
        <p className="py-10 text-center font-sans text-sm text-steel">Cargando materiales…</p>
      )}

      {materialsQuery.isError && (
        <p className="py-10 text-center font-sans text-sm text-rejected">
          {getFriendlyErrorMessage(materialsQuery.error)}
        </p>
      )}

      {materialsQuery.isSuccess && items.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-display text-2xl font-bold text-ink">Sin resultados</p>
          <p className="mt-1 font-sans text-sm text-steel">
            No encontramos materiales para "{search}". Prueba con otro término o quita el filtro de categoría.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div
            className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 ${
              hasCartItems ? '2xl:grid-cols-4' : 'lg:grid-cols-4'
            }`}
          >
            {items.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>

          {canLoadMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setPageSize((size) => size + PAGE_SIZE_STEP)}
                disabled={materialsQuery.isFetching}
                className="border-2 border-ink bg-paper px-6 py-2.5 font-sans text-sm font-semibold text-ink hover:bg-ink hover:text-paper disabled:opacity-50"
              >
                {materialsQuery.isFetching ? 'Cargando…' : 'Mostrar más materiales'}
              </button>
            </div>
          )}
        </>
      )}

      <CartBar />
    </div>
  );
}
