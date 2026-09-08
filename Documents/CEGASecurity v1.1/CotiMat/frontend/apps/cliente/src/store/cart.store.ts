import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Material } from '../types';

export interface CartLine {
  materialId: string;
  name: string;
  unit: Material['unit'];
  unitPrice: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  addMaterial: (material: Material, quantity: number) => void;
  setQuantity: (materialId: string, quantity: number) => void;
  removeLine: (materialId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addMaterial: (material, quantity) =>
        set((state) => {
          const existing = state.lines.find(
            (line) => line.materialId === material.id
          );
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.materialId === material.id
                  ? { ...line, quantity: line.quantity + quantity }
                  : line
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                materialId: material.id,
                name: material.name,
                unit: material.unit,
                unitPrice: material.unitPrice,
                imageUrl: material.imageUrl,
                quantity,
              },
            ],
          };
        }),
      setQuantity: (materialId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.materialId !== materialId)
              : state.lines.map((line) =>
                  line.materialId === materialId
                    ? { ...line, quantity }
                    : line
                ),
        })),
      removeLine: (materialId) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.materialId !== materialId),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: 'cotimat-cart',
    }
  )
);

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
