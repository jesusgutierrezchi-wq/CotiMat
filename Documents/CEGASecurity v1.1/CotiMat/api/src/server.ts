import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function main() {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`CotiMat API escuchando en http://localhost:${env.PORT}`);
    console.log(`Documentación OpenAPI en http://localhost:${env.PORT}/docs`);
  });
}

main().catch((err) => {
  console.error("Error fatal al iniciar la API:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
