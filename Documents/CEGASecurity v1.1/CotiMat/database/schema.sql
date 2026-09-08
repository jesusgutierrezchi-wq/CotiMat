-- CotiMat — DDL de referencia (espejo de api/prisma/schema.prisma)
-- Este archivo es solo documentación/auditoría. Las migraciones reales viven en
-- api/prisma/migrations y se aplican con `npx prisma migrate deploy`.
-- Motor objetivo: PostgreSQL 16.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE admin_role AS ENUM ('ADMIN');

CREATE TYPE material_unit AS ENUM ('PIEZA', 'M2', 'M3', 'KG', 'SACO', 'LITRO', 'TONELADA');

CREATE TYPE quote_status AS ENUM ('PENDIENTE', 'EN_SEGUIMIENTO', 'APROBADA', 'RECHAZADA', 'CONVERTIDA');

CREATE TABLE clients (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    phone       VARCHAR(20) NOT NULL UNIQUE,
    name        VARCHAR(150),
    email       VARCHAR(150),
    address     VARCHAR(300),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_users (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username       VARCHAR(60) NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    role           admin_role NOT NULL DEFAULT 'ADMIN',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name  VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE materials (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name         VARCHAR(150) NOT NULL,
    description  TEXT,
    category_id  TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    unit         material_unit NOT NULL,
    unit_price   NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    image_url    TEXT,
    stock        INTEGER,
    active       BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_materials_category ON materials(category_id);
CREATE INDEX idx_materials_active ON materials(active);

CREATE TABLE quotes (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    folio       VARCHAR(30) NOT NULL UNIQUE,
    client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    status      quote_status NOT NULL DEFAULT 'PENDIENTE',
    total       NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);

-- Contador transaccional para el folio consecutivo (COT-YYYY-000123)
CREATE TABLE quote_folio_counters (
    year          INTEGER PRIMARY KEY,
    last_number   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE quote_items (
    id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quote_id             TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    material_id          TEXT NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
    quantity             NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
    unit_price_at_time   NUMERIC(10,2) NOT NULL,
    subtotal             NUMERIC(10,2) NOT NULL
);
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX idx_quote_items_material ON quote_items(material_id);

CREATE TABLE quote_notes (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quote_id        TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    author_id       TEXT NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
    note            TEXT NOT NULL,
    status_at_note  quote_status NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quote_notes_quote ON quote_notes(quote_id);
