# CotiMat

Sistema de cotizaciones para una empresa de venta de materiales de construcción:
catálogo público, carrito de cotización por teléfono (sin contraseña) y panel
administrativo para dar seguimiento a las cotizaciones y gestionar el catálogo.

Cuatro piezas independientes que solo se hablan por HTTP — ver
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para el detalle de arquitectura y las
decisiones de diseño:

| Carpeta | Qué es |
|---|---|
| [`api/`](api) | Backend Express + TypeScript + Prisma + PostgreSQL |
| [`frontend/apps/cliente/`](frontend/apps/cliente) | App pública (catálogo, cotización, historial) |
| [`frontend/apps/admin/`](frontend/apps/admin) | Panel interno (materiales, categorías, seguimiento) |
| [`database/`](database) | Documentación de referencia del modelo de datos (ERD + DDL) |

## Requisitos

- Docker + Docker Compose (forma recomendada de levantar todo)
- Node.js 20+ y npm, solo si prefieres correr alguna pieza sin Docker

## Arranque rápido (Docker)

```bash
cp .env.example .env   # opcional: ajusta puertos/credenciales si lo necesitas
docker compose up -d --build
```

Esto levanta 4 contenedores: PostgreSQL, la API (aplica migraciones y siembra datos
demo automáticamente en cada arranque), y ambos frontends con hot-reload activo.

| Servicio | URL |
|---|---|
| Frontend cliente | http://localhost:5183 |
| Frontend admin | http://localhost:5184 |
| API | http://localhost:4010/api |
| Documentación OpenAPI (Swagger) | http://localhost:4010/docs |
| PostgreSQL | `localhost:5433` (usuario/clave/BD: `cotimat`) |

**Credenciales demo del panel admin:** `admin` / `admin123`.

> Los puertos por defecto (`5433`/`4010`/`5183`/`5184`) se eligieron para no chocar
> con los puertos "de fábrica" (`5432`/`4000`/`5173`) que suele ocupar cualquier otro
> proyecto corriendo en la misma máquina. Cámbialos en tu `.env` (`DB_PORT`,
> `API_PORT`, `CLIENTE_PORT`, `ADMIN_PORT`) si tienes otro conflicto.

Para detener todo conservando los datos: `docker compose down`. Para empezar desde
cero (borra la base de datos y las imágenes subidas): `docker compose down -v`.

### Datos de ejemplo

El seed crea 6 categorías, ~15 materiales, el usuario admin y una cotización de
ejemplo (folio `COT-2026-000001`). Puedes volver a correrlo manualmente sin perder lo
demás:

```bash
docker compose exec api npx prisma db seed
```

## Desarrollo sin Docker (opcional, más rápido para iterar)

Cada pieza es un proyecto independiente con su propio `.env.example`.

```bash
# 1) Base de datos (puedes seguir usando la de Docker: docker compose up -d db)

# 2) API
cd api
cp .env.example .env        # ajusta DATABASE_URL si no usas la BD de Docker
npm install
npm run db:migrate
npm run db:seed
npm run dev                  # http://localhost:4000

# 3) Frontend cliente (otra terminal)
cd frontend
npm install                  # instala cliente y admin juntos (workspace)
npm run dev:cliente          # http://localhost:5173

# 4) Frontend admin (otra terminal)
npm run dev:admin            # http://localhost:5174
```

## Estructura del repositorio

```
CotiMat/
├── database/            # ERD + DDL de referencia (Prisma es la fuente de verdad)
├── api/                 # Backend Express + Prisma
│   └── prisma/          # schema.prisma, migraciones, seed
├── frontend/
│   ├── package.json     # workspace npm (solo para instalar juntas cliente/admin)
│   └── apps/
│       ├── cliente/     # app pública
│       └── admin/       # panel administrativo
├── docs/
│   └── ARCHITECTURE.md  # decisiones de arquitectura y roadmap
└── docker-compose.yml
```

## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arquitectura, stack, seguridad,
  esquema de puertos y roadmap de lo que quedó deliberadamente fuera del MVP (OTP,
  notificaciones reales, S3, reportes, rol de vendedor, build de producción).
- [`database/ERD.md`](database/ERD.md) — diagrama entidad-relación y notas de
  modelado.
- http://localhost:4010/docs — contrato OpenAPI interactivo (con la API corriendo).
