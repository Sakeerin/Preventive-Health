# Incident Response Runbook

## Scope & Objective
Defines procedure to identify, contain, and recover from service-level or system-wide disruptions while safeguarding internal and external PII constraints.

---

### Triage Levels
-   **SEV-1 (Critical)**: Total system downtime; Massive database breach; Health data manipulation.
-   **SEV-2 (High)**: Core features disabled (i.e. Apple Health Integration broken, AI Models failing calculations).
-   **SEV-3 (Medium)**: Latency issues; minor data missing; email sending failures.

### Standard Response Procedure

#### 1. Identification
- Utilize Datadog/Sentry dashboard to recognize spikes in 500 Responses / `ThrottlerException` / Crash Dumps.
- Validate severity thresholds via Customer Support.

#### 2. Containment
- **For Data Breaches**: Automatically revoke all un-expired App access tokens via Redis caching blocks. Shut down database external connections focusing solely on Private network bounds. 
- **For DoS**: Ramp up `@nestjs/throttler` constraints (drop baseline to 10 requests / min for unauthenticated channels), auto-scale Fastify clusters if merely high-traffic.

#### 3. Eradication & Recovery
- Nullify compromised user endpoints. Re-run local CI/CD checks.
- Utilize the `apps/api/test/app.e2e-spec.ts` routines to definitively certify operational state is fully restored internally prior to public lift.
- Scale services.

#### 4. Post-Mortem
-   Draft RCA (Root Cause Analysis).
-   Document compliance failures (if PHI access, instigate 72-hour GDPR / HIPAA notification clauses).
