# Preventive Health App - Implementation Plan

## Overview

Building a comprehensive preventive health application with the following MVP features:
- **Health Data Integration**: iOS HealthKit + Android Health Connect
- **Dashboard**: Activity, sleep, heart rate trends with 7/30-day views
- **AI Risk Insights**: Non-diagnostic risk screening with explainability
- **Care Network**: Expert/doctor directory, booking, async chat
- **Privacy-First**: Consent management, data export/delete, audit logging

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo |
| **Mobile** | React Native + Expo |
| **Web** | Next.js 14 (App Router) |
| **API** | NestJS + Fastify |
| **Database** | PostgreSQL + TimescaleDB extension |
| **Cache/Queue** | Redis + BullMQ |
| **Package Management** | pnpm workspaces |
| **Testing** | Vitest + React Testing Library |

---

## Step 0: Repo Bootstrap

> [!IMPORTANT]
> This step establishes the foundation for all subsequent development. The monorepo structure enables shared code reuse and consistent tooling.

### Proposed Changes

#### Root Configuration

##### [NEW] [package.json](file:///d:/Projects/Preventive-Health/package.json)
Root package.json with pnpm workspaces configuration and shared scripts.

##### [NEW] [turbo.json](file:///d:/Projects/Preventive-Health/turbo.json)
Turborepo configuration for build pipeline, caching, and task dependencies.

##### [NEW] [pnpm-workspace.yaml](file:///d:/Projects/Preventive-Health/pnpm-workspace.yaml)
Workspace package definitions.

##### [NEW] [docker-compose.yml](file:///d:/Projects/Preventive-Health/docker-compose.yml)
PostgreSQL 16 + Redis 7 + TimescaleDB extension for local development.

##### [NEW] [.eslintrc.js](file:///d:/Projects/Preventive-Health/.eslintrc.js)
Shared ESLint configuration for TypeScript and React.

##### [NEW] [.prettierrc](file:///d:/Projects/Preventive-Health/.prettierrc)
Prettier formatting rules.

---

#### Apps

##### [NEW] apps/api
NestJS application with Fastify adapter:
- `src/main.ts` - Application bootstrap with Fastify
- `src/app.module.ts` - Root module with core providers
- `src/config/` - Environment configuration
- `package.json` - Dependencies including @nestjs/platform-fastify

##### [NEW] apps/web
Next.js 14 application:
- `src/app/` - App Router structure
- `src/components/` - Shared UI components
- `src/lib/` - Utility functions
- `tailwind.config.ts` - Tailwind CSS configuration

##### [NEW] apps/mobile
React Native + Expo application:
- `app/` - Expo Router file-based routing
- `components/` - Mobile UI components
- `hooks/` - Custom React hooks
- `app.json` - Expo configuration

---

#### Packages

##### [NEW] packages/shared
Shared types and Zod schemas:
- `src/types/` - TypeScript interfaces
- `src/schemas/` - Zod validation schemas for all entities
- `src/constants/` - Shared constants

##### [NEW] packages/health-connectors
Health platform abstractions:
- `src/types.ts` - Unified health data types
- `src/healthkit/` - iOS HealthKit integration
- `src/health-connect/` - Android Health Connect integration
- `src/normalizer.ts` - Data normalization utilities

##### [NEW] packages/ai
AI risk and coaching modules:
- `src/risk/` - Risk scoring logic
- `src/guardrails/` - Safety guardrails and language validation
- `src/coach/` - Coaching response templates

---

## Verification Plan

### Automated Tests

```powershell
# 1. Verify monorepo structure is created
pnpm install

# 2. Verify all workspaces are recognized
pnpm list --recursive --depth 0

# 3. Run lint across all packages
pnpm lint

# 4. Run tests (should pass with initial placeholder tests)
pnpm test

# 5. Verify Docker services start
docker-compose up -d
docker-compose ps

# 6. Verify unified dev command works
pnpm dev
```

### Manual Verification

1. **Docker Services**: After `docker-compose up -d`, verify PostgreSQL is accessible on port 5432 and Redis on port 6379
2. **API Server**: After `pnpm dev`, verify API responds at `http://localhost:3001/health`
3. **Web App**: Verify Next.js app loads at `http://localhost:3000`
4. **Mobile App**: Verify Expo dev server starts and app loads in simulator/emulator

---

## Directory Structure Preview

```
preventive-health/
├── apps/
│   ├── api/                 # NestJS + Fastify API
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   └── config/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── web/                 # Next.js 14 Web App
│   │   ├── src/
│   │   │   ├── app/
│   │   │   └── components/
│   │   ├── package.json
│   │   └── tailwind.config.ts
│   └── mobile/              # React Native + Expo
│       ├── app/
│       ├── components/
│       ├── app.json
│       └── package.json
├── packages/
│   ├── shared/              # Types + Zod schemas
│   │   ├── src/
│   │   │   ├── types/
│   │   │   └── schemas/
│   │   └── package.json
│   ├── health-connectors/   # HealthKit/Health Connect
│   │   ├── src/
│   │   │   ├── healthkit/
│   │   │   └── health-connect/
│   │   └── package.json
│   └── ai/                  # Risk + Coach modules
│       ├── src/
│       │   ├── risk/
│       │   └── guardrails/
│       └── package.json
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .eslintrc.js
├── .prettierrc
└── .gitignore
```

---

## Step 8: Admin & Content

> [!IMPORTANT]
> This step introduces the administrative interface and functionality required to manage the platform's content, providers, AI models, and view audit logs for compliance.

### Proposed Changes

#### Shared Packages (Schemas)

##### [NEW] [packages/shared/src/schemas/content.schema.ts](file:///d:/Projects/Preventive-Health/packages/shared/src/schemas/content.schema.ts)
- Schemas for `CoachingContent`, `Article`, and `Template` management.
- Zod validations for creating/updating rich text content and associating tags.

##### [MODIFY] [packages/shared/src/schemas/risk-insights.schema.ts](file:///d:/Projects/Preventive-Health/packages/shared/src/schemas/risk-insights.schema.ts)
- Add `RiskModelVersionSchema` to represent AI models in the registry (id, version, description, isActive, mappings).

##### [MODIFY] [packages/shared/src/schemas/care-network.schema.ts](file:///d:/Projects/Preventive-Health/packages/shared/src/schemas/care-network.schema.ts)
- Add provider approval status schemas if not fully covered by `isVerified` and `isActive`.

#### API Endpoints (apps/api)

##### [NEW] [apps/api/src/admin/admin.module.ts](file:///d:/Projects/Preventive-Health/apps/api/src/admin/admin.module.ts)
- Aggregation endpoints for the admin dashboard (e.g., total users, system health stats).

##### [NEW] [apps/api/src/content/content.module.ts](file:///d:/Projects/Preventive-Health/apps/api/src/content/content.module.ts)
- CRUD endpoints for managing coaching content and guidelines.

##### [NEW] [apps/api/src/risk-insights/model-registry.controller.ts](file:///d:/Projects/Preventive-Health/apps/api/src/risk-insights/model-registry.controller.ts)
- Endpoints to register, deprecate, and activate `RiskModelVersion` records.

##### [NEW] [apps/api/src/audit/audit.controller.ts](file:///d:/Projects/Preventive-Health/apps/api/src/audit/audit.controller.ts)
- Secure endpoints specifically for retrieving, filtering, and exporting `AuditLogs`.

##### [MODIFY] [apps/api/src/care-network/provider.controller.ts](file:///d:/Projects/Preventive-Health/apps/api/src/care-network/provider.controller.ts)
- Add admin-only routes to review, approve, and verify provider profiles.

#### Web Application (apps/web/src/app/admin)

##### [NEW] [apps/web/src/app/admin/layout.tsx](file:///d:/Projects/Preventive-Health/apps/web/src/app/admin/layout.tsx)
- Dedicated admin layout with sidebar navigation, separate from the main user web app structure.

##### [NEW] [apps/web/src/app/admin/page.tsx](file:///d:/Projects/Preventive-Health/apps/web/src/app/admin/page.tsx)
- Admin dashboard displaying key metrics.

##### [NEW] [apps/web/src/app/admin/providers/page.tsx](file:///d:/Projects/Preventive-Health/apps/web/src/app/admin/providers/page.tsx)
- Provider onboarding and approval view. A data table showing pending applications with actions to verify.

##### [NEW] [apps/web/src/app/admin/content/page.tsx](file:///d:/Projects/Preventive-Health/apps/web/src/app/admin/content/page.tsx)
- Interface for managing coaching articles and content templates.

##### [NEW] [apps/web/src/app/admin/ai-models/page.tsx](file:///d:/Projects/Preventive-Health/apps/web/src/app/admin/ai-models/page.tsx)
- AI model registry. View all model versions, select active models, and view model configuration.

##### [NEW] [apps/web/src/app/admin/audit-logs/page.tsx](file:///d:/Projects/Preventive-Health/apps/web/src/app/admin/audit-logs/page.tsx)
- Real-time or paginated table to review system events and audit information.

## Verification Plan

### Automated Tests
- Execute `pnpm test --filter=api` to verify admin endpoints.
- Validate role-based access control (RBAC) tests so only admins can successfully call these endpoints.
- Validate `content.schema.ts` structure and ensure proper validation of payload inputs.

### Manual Verification
- **Admin UI**: Ensure `/admin` layout is fully functional, separate from `/dashboard`. Check sidebar navigation on web.
- **Provider Onboarding**: Manually toggle the verification state of a provider and verify the update propagates correctly.
- **Audit Logs**: Perform a user action (e.g. read risk scores) and verify the event surfaces correctly in the `/admin/audit-logs` table.
- **Content Management**: Create a test coaching content piece and verify it stores and fetches via the API.
- **AI Models**: Add a new Dummy Risk Model version and successfully switch the active flag.

---

## Step 9: Interop Export (FHIR-friendly)

> [!IMPORTANT]
> This step introduces FHIR-compliant export functionalities. The platform will support mapping its internal domain entities into standardized FHIR representations (primarily `Patient` and `Observation`) and generating an extract in JSON or a summarized PDF format.

### Proposed Changes

#### Shared Packages (Schemas)

##### [NEW] [packages/shared/src/schemas/fhir.schema.ts](file:///d:/Projects/Preventive-Health/packages/shared/src/schemas/fhir.schema.ts)
- Base Zod definitions for FHIR `Patient` and `Observation` structures (R4 schema subset).

##### [MODIFY] [packages/shared/src/schemas/index.ts](file:///d:/Projects/Preventive-Health/packages/shared/src/schemas/index.ts)
- Export the newly created `fhir.schema` definitions.

#### API Engine (apps/api/src/export)

##### [NEW] [apps/api/src/export/export.module.ts](file:///d:/Projects/Preventive-Health/apps/api/src/export/export.module.ts)
- Main module handling interoperable export logic.

##### [NEW] [apps/api/src/export/export.controller.ts](file:///d:/Projects/Preventive-Health/apps/api/src/export/export.controller.ts)
- Endpoints offering `/export/fhir` (JSON FHIR Bundle) and `/export/pdf` endpoints.

##### [NEW] [apps/api/src/export/fhir.service.ts](file:///d:/Projects/Preventive-Health/apps/api/src/export/fhir.service.ts)
- Logic component dedicated to translating our internal schemas (`Measurement`, `Profile`) to the mapped FHIR structure.

##### [NEW] [apps/api/src/export/pdf.service.ts](file:///d:/Projects/Preventive-Health/apps/api/src/export/pdf.service.ts)
- Service responsible for assembling the mapped data into a synthesized document (Mock implementation for MVP phase).

##### [MODIFY] [apps/api/src/app.module.ts](file:///d:/Projects/Preventive-Health/apps/api/src/app.module.ts)
- Wire `ExportModule` to the main backend application array.

## Verification Plan

### Automated Tests
- Validate mock outputs of `/export/fhir` against `fhir.schema.ts` structures to ensure conformance.
- Verify controller response types match `application/fhir+json` headers where applicable.

### Manual Verification
- Access the `http://localhost:3001/export/fhir?userId=test` endpoint manually, verifying that a well-formed FHIR Bundle JSON structure is produced.
- Call the `/export/pdf` equivalent and ensure a structured buffer or base64 PDF stream is responded.

---

## Next Steps (After Step 9)

| Step | Description | Dependencies |
|------|-------------|--------------|
| 1 | Core Schema + Privacy | Step 0 |
| 2 | HealthKit Integration | Steps 0, 1 |
| 3 | Health Connect Integration | Steps 0, 1 |
| 4 | Normalization + Dashboards | Steps 1, 2, 3 |
| 5 | Goals + Reminders | Steps 1, 4 |
| 6 | AI Risk Insights | Steps 1, 4 |
| 7 | Care Network | Steps 1, 6 |
| 8 | Admin Portal | Steps 1, 7 |
| 9 | FHIR Export | Steps 4, 7 |
| 10 | Hardening | All previous |
