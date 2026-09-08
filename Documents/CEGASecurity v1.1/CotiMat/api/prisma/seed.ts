import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = ["Cemento", "Varilla", "Block", "Tubería", "Pintura", "Agregados"] as const;

const MATERIALS: Array<{
  category: (typeof CATEGORIES)[number];
  name: string;
  description: string;
  unit: "PIEZA" | "M2" | "M3" | "KG" | "SACO" | "LITRO" | "TONELADA";
  unitPrice: number;
  stock: number;
}> = [
  { category: "Cemento", name: "Cemento gris CPC 30R", description: "Saco de 50 kg, uso general", unit: "SACO", unitPrice: 215, stock: 500 },
  { category: "Cemento", name: "Cemento blanco", description: "Saco de 42.5 kg, para acabados", unit: "SACO", unitPrice: 320, stock: 150 },
  { category: "Cemento", name: "Mortero premezclado", description: "Saco de 40 kg", unit: "SACO", unitPrice: 165, stock: 200 },
  { category: "Varilla", name: "Varilla corrugada 3/8\"", description: "Varilla de 9 m, grado 42", unit: "PIEZA", unitPrice: 145, stock: 800 },
  { category: "Varilla", name: "Varilla corrugada 1/2\"", description: "Varilla de 9 m, grado 42", unit: "PIEZA", unitPrice: 255, stock: 600 },
  { category: "Varilla", name: "Alambre recocido", description: "Rollo de 1 kg", unit: "KG", unitPrice: 32, stock: 300 },
  { category: "Block", name: "Block hueco 15x20x40", description: "Concreto estándar", unit: "PIEZA", unitPrice: 12.5, stock: 5000 },
  { category: "Block", name: "Block macizo 10x20x40", description: "Alta resistencia", unit: "PIEZA", unitPrice: 15.8, stock: 3000 },
  { category: "Block", name: "Tabique rojo recocido", description: "Tabique de barro tradicional", unit: "PIEZA", unitPrice: 6.2, stock: 8000 },
  { category: "Tubería", name: "Tubo PVC hidráulico 1/2\"", description: "Tramo de 6 m, cédula 40", unit: "PIEZA", unitPrice: 68, stock: 400 },
  { category: "Tubería", name: "Tubo PVC sanitario 4\"", description: "Tramo de 6 m", unit: "PIEZA", unitPrice: 245, stock: 200 },
  { category: "Pintura", name: "Pintura vinílica blanca", description: "Cubeta de 19 L, interior/exterior", unit: "PIEZA", unitPrice: 780, stock: 120 },
  { category: "Pintura", name: "Impermeabilizante acrílico", description: "Cubeta de 19 L, 5 años", unit: "PIEZA", unitPrice: 950, stock: 90 },
  { category: "Agregados", name: "Arena de río", description: "Cribada, para mezcla", unit: "M3", unitPrice: 380, stock: 50 },
  { category: "Agregados", name: "Grava 3/4\"", description: "Triturada, para concreto", unit: "M3", unitPrice: 420, stock: 50 },
];

async function main() {
  console.log("Sembrando categorías...");
  const categoryByName = new Map<string, string>();
  for (const name of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    categoryByName.set(name, category.id);
  }

  console.log("Sembrando materiales...");
  for (const material of MATERIALS) {
    const categoryId = categoryByName.get(material.category)!;
    const existing = await prisma.material.findFirst({
      where: { name: material.name, categoryId },
    });
    if (!existing) {
      await prisma.material.create({
        data: {
          name: material.name,
          description: material.description,
          unit: material.unit,
          unitPrice: material.unitPrice,
          stock: material.stock,
          categoryId,
        },
      });
    }
  }

  const seedUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const seedPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  console.log(`Sembrando usuario admin "${seedUsername}"...`);
  const passwordHash = await bcrypt.hash(seedPassword, 10);
  const admin = await prisma.adminUser.upsert({
    where: { username: seedUsername },
    create: { username: seedUsername, passwordHash },
    update: {},
  });

  console.log("Sembrando cliente y cotización de ejemplo...");
  const demoClient = await prisma.client.upsert({
    where: { phone: "5555550123" },
    create: { phone: "5555550123", name: "Cliente Demo", email: "demo@cotimat.test" },
    update: {},
  });

  const existingDemoQuote = await prisma.quote.findFirst({ where: { clientId: demoClient.id } });
  if (!existingDemoQuote) {
    const cemento = await prisma.material.findFirst({ where: { name: "Cemento gris CPC 30R" } });
    const block = await prisma.material.findFirst({ where: { name: "Block hueco 15x20x40" } });

    if (cemento && block) {
      const items = [
        { materialId: cemento.id, quantity: 20, unitPriceAtTime: cemento.unitPrice, subtotal: Number(cemento.unitPrice) * 20 },
        { materialId: block.id, quantity: 300, unitPriceAtTime: block.unitPrice, subtotal: Number(block.unitPrice) * 300 },
      ];
      const total = items.reduce((sum, i) => sum + i.subtotal, 0);

      await prisma.quote.create({
        data: {
          folio: "COT-2026-000001",
          clientId: demoClient.id,
          total,
          items: { create: items },
          notes: {
            create: {
              authorId: admin.id,
              note: "Cotización de ejemplo generada por el seed.",
              statusAtNote: "PENDIENTE",
            },
          },
        },
      });
      await prisma.quoteFolioCounter.upsert({
        where: { year: 2026 },
        create: { year: 2026, lastNumber: 1 },
        update: { lastNumber: 1 },
      });
    }
  }

  console.log("Seed completado.");
  console.log(`Credenciales admin demo: ${seedUsername} / ${seedPassword}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
