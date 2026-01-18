# Preventive Health App - Task Tracker

## Overview
Building a comprehensive preventive health application with MVP features including health data integration (HealthKit/Health Connect), dashboard, AI risk insights, and care network.

---

## Step 0: Repo Bootstrap
- [x] Create monorepo structure with Turborepo
- [x] Setup `apps/mobile` (React Native with Expo)
- [x] Setup `apps/web` (Next.js 14)
- [x] Setup `apps/api` (NestJS + Fastify)
- [x] Setup `packages/shared` (types + zod schemas)
- [x] Setup `packages/health-connectors` (HealthKit/Health Connect abstractions)
- [x] Setup `packages/ai` (risk + coach guardrails)
- [x] Add docker-compose for Postgres + Redis
- [x] Configure ESLint, Prettier, and Vitest
- [x] Setup unified dev command

## Step 1: Core Schema + Privacy
- [x] User, Profile, Consent entities
- [x] Device, Session, DataSource entities
- [x] Measurement, Session (sleep/workout), DailyAggregate
- [x] Goal, ReminderRule, Notification, Insight
- [x] RiskModelVersion, RiskScore, ModelEvidenceLog
- [x] Provider, Booking, ConsultationThread, Message, Attachment
- [x] ShareGrant, AuditLog
- [x] Encryption-at-rest strategy
- [x] Audit middleware
- [x] Seed data

## Step 2: Wearable Ingestion (HealthKit)
- [x] iOS HealthKit integration
- [x] Permission requests (steps, energy, workouts, HR, sleep)
- [x] Local sync queue
- [x] API upload with idempotency
- [x] Unit tests

## Step 3: Wearable Ingestion (Health Connect)
- [x] Android Health Connect integration
- [x] Permission management
- [x] Data reading (steps, HR, sleep, exercise)
- [x] Offline queue + retries
- [x] Play policy compliance docs

## Step 4: Normalization + Dashboards
- [x] API normalization services
- [x] Deduplication logic
- [x] Daily aggregates computation
- [x] Dashboard summaries (7/30-day trends)
- [x] Web + Mobile dashboard screens
- [x] Bilingual UI support

## Step 5: Goals + Reminders Engine
- [ ] Goal setting (steps, workouts, sleep, hydration)
- [ ] Reminder engine with quiet hours
- [ ] Adaptive timing based on user behavior
- [ ] Weekly summaries
- [ ] Notification preferences

## Step 6: AI Risk Insights v1
- [ ] Risk insights module (low/medium/high)
- [ ] Confidence scores + contributing factors
- [ ] Guardrails (no diagnosis language)
- [ ] Model versioning
- [ ] Monitoring + drift checks
- [ ] Explainability outputs

## Step 7: Care Network
- [ ] Provider directory
- [ ] Availability scheduling
- [ ] Booking flow
- [ ] Async chat with attachments
- [ ] ShareGrants (time-bound access)
- [ ] Revoke functionality
- [ ] Audit logs

## Step 8: Admin & Content
- [ ] Admin portal
- [ ] Coaching content management
- [ ] Provider onboarding
- [ ] Audit logs view
- [ ] AI model registry

## Step 9: Interop Export (FHIR-friendly)
- [ ] Health summary export
- [ ] FHIR Observation mapping
- [ ] JSON/PDF export
- [ ] Documentation

## Step 10: Hardening & Compliance
- [ ] Rate limiting
- [ ] PII masking in logs
- [ ] Incident runbook
- [ ] Threat model
- [ ] SaMD readiness docs
- [ ] E2E tests
