---
standard: HL7 FHIR — Fast Healthcare Interoperability Resources
concern: Health data interoperability — REST APIs and resource models
field: Health & Medicine
body: Health Level Seven International (HL7)
type: formal
url: https://www.hl7.org/fhir/
current_version: R5 (2023); R4 widely deployed
last_reviewed: 2026-04-17
source: ../Research/sources/standards-health-hl7-fhir.md
---

# HL7 FHIR

**Concern:** Interoperable exchange of electronic health data via REST APIs and discrete resource types.
**Issuing body:** HL7 International.
**Scope:** ~150 resource types (Patient, Observation, Condition, MedicationRequest, Encounter, …) modelled as FHIR resources with defined schemas, search parameters, and RESTful verbs.

## When to cite

Cite when a pipeline touches electronic health records, health-app integration, or any health data exchange. Cite the specific resource type (e.g., "HL7 FHIR Observation, R4") and search parameter rather than just "FHIR".

## Notes

R4 is the most widely deployed version (US Cures Act references it); R5 is current. US Core, UK Core, and AU Core profiles layer national conformance on top.
