# Preventive Health Applications - Unified Threat Model

## Approach
This Threat Model aligns with the **STRIDE** methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) evaluating risk strictly from an infrastructure and workflow perspective.

---

### Scope
- Monorepo APIs (NestJS Fastify)
- Primary Database (PostgreSQL + TimescaleDB)
- External Integrations (Apple HealthKit / Google Health Connect)

### Identified Threats & Mitigations

#### 1. Identity Spoofing
-   **Threat**: Adversaries mimicking active user sessions or intercepting network requests to export endpoints (`/export/*`).
-   **Mitigation**: Bearer token authentication verified on every API hit via stateless JWT. Strong password schema requirements and enforced TLS (HTTPS) across the stack.

#### 2. Tampering & Man-in-the-Middle
-   **Threat**: Compromising wearable ingestion pipeline data between the mobile OS payload and the backend REST services.
-   **Mitigation**: Zero-trust pipeline configurations. Use payload hashing/signatures. Rest API strictly validates `zod` schemas filtering unexpected/malicious variables instantly.

#### 3. Information Disclosure
-   **Threat**: Accidental output of PII (Names, DOBS, SSNs) or PHI via application error logs or database leakages.
-   **Mitigation**: 
    - Database is natively isolated in a private VPC.
    - Application-level `PiiMaskingLogger` overrides all outputs actively masking `[email, firstName, lastName, phone, birthDate]`.
    - Encryption-at-rest configured for attachment/message persistence.

#### 4. Denial of Service (DoS)
-   **Threat**: Rapid looping mechanisms pinging `Risk Calculation` models or `FHIR exports` exhausting operational memory arrays.
-   **Mitigation**: Implemented `@nestjs/throttler` guarding the root architecture restricting requests to isolated API thresholds (e.g. 100 Req / Min / IP).

#### 5. Elevation of Privilege
-   **Threat**: Standard users accessing admin routing arrays (`/admin/*`) or `ShareGrant` unauthorized pathways.
-   **Mitigation**: Role-Based Access Control (RBAC) validations verified firmly at the infrastructure scope rather than merely the UI level.
