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

## Next Steps (After Step 0)

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
