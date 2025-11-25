# POS System Blueprint

Purpose: provide a clear, framework-agnostic blueprint so the application can be reimplemented quickly in another stack (e.g., React Native, Flutter, Angular, Vue, SvelteKit).

## Goals
- Preserve business logic and data contracts independently of UI framework.
- Keep modules decoupled: Auth, RBAC, Catalog, Sales, Tables, Settings, Printing.
- Ensure printing, offline safety, and audit logging are first-class concerns.

## High-Level Architecture
- Client App (Web + Capacitor Android)
  - UI: Next.js App Router under `src/app/*`
  - State: React Contexts (`AuthContext`, `RBACContext`, `LanguageContext`)
  - UI Components: `src/components/*` with Tailwind CSS
  - Printing: Web-based dialog + native plugin (Capacitor) for ESC/POS/ZPL/network
- Backend API (Next.js API routes)
  - REST-ish endpoints under `src/app/api/*`
  - Uses Prisma ORM targeting PostgreSQL (`prisma/schema.prisma`)
  - Middleware for auth and audit
- Data Layer
  - PostgreSQL via Prisma (`DATABASE_URL`)
  - Optional Redis cache (`src/lib/redis.js`)
  - File uploads under `public/uploads`

## Domains and Entities (from `prisma/schema.prisma`)
- User: `id, email, password, name, role, createdAt, updatedAt`
- Category: `id, name, createdAt, updatedAt`
- Item: `id, name, description, price, stock, categoryId, emoji, image, imageType, createdAt, updatedAt`
- Sale: `id, total, userId, paymentMethodId, tableId?, status, createdAt, updatedAt`
- SaleItem: `id, quantity, price, saleId, itemId`
- Settings: `currency, currencySymbol, taxEnabled, taxRate, taxName, tableCount, appName, logoPath`
- PaymentMethod: `id, name, enabled, createdAt, updatedAt`
- Table: `id, name, capacity, status, createdAt, updatedAt`
- RolePermission: `role, resource, canView, canCreate, canEdit, canDelete`

## Core Use Cases
- Authentication flow: login, `auth/me`, role-based access via RBAC.
- Catalog management: categories, items CRUD, image uploads.
- Sales flow: create sale, add items, void/cancel, complete, print receipt.
- Table management: assign sales to tables, status changes.
- Settings and branding: currency, taxes, logo upload, payment methods.
- Reports: daily/period, top items, sales summary.
- Audit logs: record key actions for traceability.

## API Surface (folders in `src/app/api`)
- `auth`: `POST /api/auth` (login), `GET /api/auth/me`, `GET /api/auth/permissions`, `POST /api/auth/logout`.
- `users`: `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/[id]`, `POST /api/users/[id]/reset-password`.
- `categories`: `GET/POST /api/categories`.
- `items`: `GET/POST /api/items`, `GET/PATCH/DELETE /api/items/[id]`.
- `sales`: `GET/POST /api/sales`, `GET/PATCH /api/sales/[id]`, `GET /api/sales/active`.
- `settings`: `GET/PATCH /api/settings`, `POST /api/settings/logo`, `GET/POST/PATCH /api/settings/payment-methods`, `GET/POST /api/settings/roles`.
- `tables`: `GET/POST /api/tables`, `GET/PATCH/DELETE /api/tables/[id]`.
- `reports`: `GET /api/reports`.
- `audit`: `POST /api/audit` (or route-specific logging via middleware).
- `upload/image`: single image uploads.

## Frontend Structure (selected)
- `src/app/dashboard/*` – pages for items, categories, sales, reports, settings.
- `src/components/DashboardLayout.js` – shell layout, sidebar, header.
- `src/components/PrinterDialog.js` – printer selection; integrates native plugin.
- `src/lib/*` – API utilities, printer wrapper, settings helpers.

## Printing Subsystem
- Web: `window.print()` for system dialog.
- Native (Android): Capacitor plugin `Printer` with:
  - Bluetooth discovery (paired devices), USB enumeration, network raw socket.
  - ESC/POS: send Base64-encoded bytes to `host:port` (default 9100).
  - ZPL: send ASCII commands to `host:port`.
  - Status stub and job queue scaffold.
- Future: add IPP discovery and PrintDocumentAdapter for PDF.

### ESC/POS Receipt Composition (framework-agnostic)
- Inputs: `sale`, `items[]`, `settings`, `paymentMethod`.
- Steps:
  - Header: app name/logo, date/time, cashier, table.
  - Line items: name qty x price, totals.
  - Taxes: conditional by `settings.taxEnabled` and `taxRate`.
  - Footer: thanks message, QR/barcode if needed.
- Output: byte array per printer spec; send via native plugin.

## RBAC Policy
- Resources: dashboard, items, sales, categories, users, settings, tables.
- Roles: `ADMIN`, `CASHIER` with boolean permissions for CRUD.
- Enforce on API routes and UI navigation.

## Configuration
- Environment:
  - `DATABASE_URL` (PostgreSQL via Prisma)
  - Optional `REDIS_URL`
  - Capacitor server URL (`capacitor.config.ts`) for production web origin.
- Android build:
  - Java 17, R8 enabled, conditional release signing via `android/gradle.properties`.

## Migration Blueprint (to another framework)
1) Extract Domain Contracts
   - Reuse the Prisma schema as a source of truth; convert models to DTOs.
   - Define REST contracts per endpoint (request/response JSON).
2) Rebuild Data Access Layer
   - Choose ORM (TypeORM/Sequelize/Drizzle or platform-native) mapping to same models.
   - Keep migrations aligned; seed scripts for audit/users.
3) Implement Services
   - Auth service: session/JWT, password hashing, permissions check.
   - Catalog service: items/categories CRUD, image storage.
   - Sales service: cart, totals, status transitions, print.
   - Tables service: seating and assignment.
   - Settings service: app branding, taxes, payment methods.
   - Audit service: structured logs.
4) Build UI
   - Keep component hierarchy: layout/shell, list/detail forms, dialogs.
   - Portable styling tokens: Tailwind config → design tokens for new UI.
5) Printing
   - Provide native modules for ESC/POS/ZPL or use server-side printing proxy.
   - Abstract a `Printer` interface with platform-specific implementations.
6) Cross-Cutting Concerns
   - Error handling, i18n, responsiveness, accessibility.
   - Caching (client/server), optimistic updates.

## Suggested Folder Structure (generic)
- `apps/web` or `app/` – UI application
- `server/` – API services
- `packages/core` – domain models, DTOs, business rules
- `packages/printer` – printer abstractions and platform adapters
- `packages/ui` – reusable UI components
- `packages/utils` – shared utilities (validation, formatting)

## Data Contracts (Examples)
- ItemDTO
  - `{ id, name, description?, price, stock, categoryId, emoji?, image?, imageType? }`
- SaleDTO
  - `{ id, items: SaleItemDTO[], total, status, userId, paymentMethodId, tableId?, createdAt }`
- SettingsDTO
  - `{ currency, currencySymbol, taxEnabled, taxRate, taxName, tableCount, appName, logoPath }`

## Build & Deployment Notes
- Web: Next.js with Turbopack dev, static asset hosting, API routes.
- Android: Gradle build, R8, conditional signing; APK moved to repo root for CI artifact.
- CI: lint/tests → build web → build apk → upload artifacts.

## Troubleshooting
- Blank screen in WebView: ensure `server.url` points to production origin; allow navigation for subdomains.
- Scrolling issues: use `scroll-touch` classes (`-webkit-overflow-scrolling: touch`).
- Printing discovery limits in browsers: rely on native plugin for full support.

## Next Steps
- Finalize printer plugin features (status monitoring, IPP discovery, PDF printing).
- Add integration tests for sales flow, printing outputs, and RBAC enforcement.
- Document endpoint contracts in OpenAPI for easier backend rewrites.

