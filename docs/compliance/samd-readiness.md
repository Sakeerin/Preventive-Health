# SaMD Readiness & Posture Declaration

Software as a Medical Device (SaMD) classifications dramatically restrict the behavior available to digital applications without rigorous clinical FDA equivalence pathways. 

## Platform Boundary Declaration
The Preventive Health platform explicitly operates as a **Wellness and Non-Diagnostic App**.

### 1. Claims Definition
We **DO NOT**:
- Diagnose any medical conditions (e.g., "You have sleep apnea" or "Your heart indicates Afib").
- Tell a patient to alter prescribed medication schedules based on risk insight computations.
- Attempt to substitute the directive of a primary healthcare provider.

We **DO**:
- Present aggregated health data trends over a 7-to-30 day normalized period.
- Suggest "generalized" risk factors using correlative non-diagnostic markers ("Sleep pattern suggests lower baseline metrics today").
- Facilitate an asynchronous line of communication to Licensed Providers.

### 2. Disclaimers & Guardrails
- **Guardrail Interceptors**: All `RiskModelVersion` generations pass through our AI guardrails library ensuring output strictly removes diagnostic/treatment framing.
- **Constant Transparency**: All predictive results have a `disclaimer` appended, enforcing that outputs are merely references based on generalized activity statistics, incapable of functioning as a medical assessment.

Adherence stringently to these guidelines keeps the architecture positioned cleanly outside intensive ongoing SaMD regulations while maximizing clinical value via provider loopbacks.
