# Diagrama entidad-relación — CotiMat

```mermaid
erDiagram
    CLIENT ||--o{ QUOTE : "solicita"
    CATEGORY ||--o{ MATERIAL : "clasifica"
    MATERIAL ||--o{ QUOTE_ITEM : "se cotiza en"
    QUOTE ||--|{ QUOTE_ITEM : "contiene"
    QUOTE ||--o{ QUOTE_NOTE : "tiene bitácora"
    ADMIN_USER ||--o{ QUOTE_NOTE : "autor de"

    CLIENT {
        string id PK
        string phone UK "único, llave de seguimiento"
        string name
        string email
        string address
        datetime createdAt
    }

    ADMIN_USER {
        string id PK
        string username UK
        string passwordHash
        string role "ADMIN (VENDEDOR a futuro)"
        datetime createdAt
    }

    CATEGORY {
        string id PK
        string name UK
    }

    MATERIAL {
        string id PK
        string name
        string description
        string categoryId FK
        string unit "PIEZA | M2 | M3 | KG | SACO | LITRO | TONELADA"
        decimal unitPrice
        string imageUrl
        int stock "null = sin control de stock"
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    QUOTE {
        string id PK
        string folio UK "COT-2026-000123"
        string clientId FK
        string status "PENDIENTE | EN_SEGUIMIENTO | APROBADA | RECHAZADA | CONVERTIDA"
        decimal total
        datetime createdAt
        datetime updatedAt
    }

    QUOTE_ITEM {
        string id PK
        string quoteId FK
        string materialId FK
        decimal quantity
        decimal unitPriceAtTime "precio congelado al momento de cotizar"
        decimal subtotal
    }

    QUOTE_NOTE {
        string id PK
        string quoteId FK
        string authorId FK "AdminUser"
        string note
        string statusAtNote
        datetime createdAt
    }
```

## Notas de modelado

- **`unitPriceAtTime` en `QUOTE_ITEM`**: el precio del material se congela al momento de
  crear la cotización. Si el admin cambia `Material.unitPrice` después, las cotizaciones
  ya emitidas no cambian — es lo que el cliente vio y aceptó.
- **`QUOTE_NOTE` como bitácora append-only** en vez de un campo `notes` único: cada
  cambio de estatus o comentario de seguimiento queda como un registro nuevo, con quién
  lo hizo y cuándo. Esto cubre a la vez "notas internas de seguimiento" e "historial de
  contacto con el cliente" del prompt original sin duplicar tablas.
- **`Material.stock` nullable**: `null` significa "no se controla inventario para este
  material" (comportamiento por defecto del MVP). Un número activa control de
  disponibilidad a futuro sin migración adicional.
- **`Client` no tiene password**: el teléfono es la llave de identificación pública
  (ver decisión de no incluir OTP en el MVP, documentada en `docs/ARCHITECTURE.md`).
