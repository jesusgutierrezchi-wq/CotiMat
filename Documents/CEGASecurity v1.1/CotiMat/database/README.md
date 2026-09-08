# Base de datos — CotiMat

La base de datos es **PostgreSQL 16**. La fuente de verdad ejecutable del esquema es
[Prisma](../api/prisma/schema.prisma): las migraciones versionadas viven en
`api/prisma/migrations/` y se generan/aplican con Prisma CLI (ver `api/package.json`,
scripts `db:migrate` y `db:seed`).

Esta carpeta (`database/`) **no contiene migraciones**; es documentación de referencia
para quien necesite entender o auditar el modelo sin levantar el proyecto Node:

- [`schema.sql`](./schema.sql) — DDL equivalente al esquema Prisma actual (tablas,
  tipos enumerados, llaves foráneas, índices). Debe mantenerse en sincronía manualmente
  cada vez que cambie `schema.prisma`; en caso de discrepancia, **Prisma manda**.
- [`ERD.md`](./ERD.md) — diagrama entidad-relación (mermaid) de las mismas tablas.

## Por qué ninguno de los frontends toca la base de datos directamente

Por diseño, `frontend/apps/cliente` y `frontend/apps/admin` **no tienen credenciales de
base de datos ni cliente Prisma**. Todo acceso a datos pasa por `api/`, que es el único
proceso con `DATABASE_URL`. Esto permite:

- Cambiar de PostgreSQL a otro motor sin tocar ningún frontend.
- Centralizar validaciones de negocio, rate-limiting y auditoría en un solo lugar.
- Desplegar cada capa como contenedor independiente (ver `docker-compose.yml` en la raíz).

## Arrancar la base de datos localmente

```bash
docker-compose up -d db
cd api
npm run db:migrate   # aplica migraciones (prisma migrate dev)
npm run db:seed       # datos demo: categorías, materiales, admin, cotizaciones
```
