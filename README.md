# Preventive Health

A preventive health platform for tracking wellness, generating AI-assisted insights, and connecting users with care providers.

## Features

- Health data integration with iOS HealthKit and Android Health Connect
- Dashboard views for activity, sleep, heart rate, and hydration trends
- Risk insight workflows with explainability and audit support
- Care network features for providers, bookings, and async consultations
- Privacy-focused exports, consents, and access sharing

## Project Structure

```text
preventive-health/
|-- apps/
|   |-- api/        NestJS + Fastify API
|   |-- web/        Next.js web app
|   `-- mobile/     Expo / React Native app
|-- packages/
|   |-- shared/             Shared types, schemas, and i18n
|   |-- database/           Prisma client and database utilities
|   |-- health-connectors/  HealthKit and Health Connect helpers
|   `-- ai/                 Risk scoring and guardrails
|-- docker-compose.yml
`-- turbo.json
```

## Tech Stack

- Monorepo: Turborepo + pnpm workspaces
- API: NestJS + Fastify
- Web: Next.js 14
- Mobile: Expo + React Native
- Database: PostgreSQL / TimescaleDB
- Cache and queue: Redis

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker

### Installation

```bash
pnpm install
docker-compose up -d
pnpm dev
```

### Default Local URLs

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- API health: `http://localhost:3001/health`

## Development Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm format
```

## Docker Services

- PostgreSQL 16 on port `5432`
- Redis 7 on port `6379`

## License

This project is private and proprietary.
