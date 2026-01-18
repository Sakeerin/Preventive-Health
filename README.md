# Preventive Health 🏥

A comprehensive preventive health application that helps users track their wellness, gain AI-driven insights, and connect with healthcare professionals.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)

## ✨ Features

- **Health Data Integration** — Sync with iOS HealthKit and Android Health Connect
- **Smart Dashboard** — View activity, sleep, and heart rate trends (7/30-day views)
- **AI Risk Insights** — Non-diagnostic risk screening with explainability
- **Care Network** — Connect with experts, schedule appointments, async chat
- **Privacy-First** — Consent management, data export/delete, audit logging

## 🏗️ Project Structure

```
preventive-health/
├── apps/
│   ├── api/                 # NestJS + Fastify API
│   ├── web/                 # Next.js 14 Web App
│   └── mobile/              # React Native + Expo
├── packages/
│   ├── shared/              # Types + Zod schemas
│   ├── health-connectors/   # HealthKit/Health Connect
│   └── ai/                  # Risk scoring + guardrails
├── docker-compose.yml       # PostgreSQL + Redis
└── turbo.json               # Turborepo config
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Turborepo + pnpm workspaces |
| Mobile | React Native + Expo |
| Web | Next.js 14 (App Router) |
| API | NestJS + Fastify |
| Database | PostgreSQL + TimescaleDB |
| Cache/Queue | Redis + BullMQ |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **Docker** (for local database)

### Installation

```bash
# Clone the repository
git clone https://github.com/Sakeerin/Preventive-Health.git
cd Preventive-Health

# Install dependencies
pnpm install

# Start database services
docker-compose up -d

# Start all dev servers
pnpm dev
```

### Access Points

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API | http://localhost:3001 |
| API Health Check | http://localhost:3001/health |

## 📦 Workspaces

### Apps

| Package | Description |
|---------|-------------|
| `@preventive-health/api` | NestJS backend API with Fastify |
| `@preventive-health/web` | Next.js 14 web application |
| `@preventive-health/mobile` | React Native + Expo mobile app |

### Packages

| Package | Description |
|---------|-------------|
| `@preventive-health/shared` | Shared TypeScript types and Zod schemas |
| `@preventive-health/health-connectors` | HealthKit and Health Connect integrations |
| `@preventive-health/ai` | Risk scoring models and safety guardrails |

## 🧪 Development

```bash
# Run all dev servers
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Run tests
pnpm test

# Format code
pnpm format
```

## 🐳 Docker Services

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services:**
- **PostgreSQL 16** with TimescaleDB (port 5432)
- **Redis 7** (port 6379)


## 📄 License

This project is private and proprietary.

---

Built with ❤️ for preventive wellness
