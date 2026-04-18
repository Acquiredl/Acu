---
standard: OpenAPI Specification 3.1.0
concern: REST API specification and documentation
field: Engineering
body: OpenAPI Initiative (Linux Foundation)
type: formal
url: https://spec.openapis.org/oas/v3.1.0.html
current_version: 3.1.0 (renamed from Swagger in 2016)
last_reviewed: 2026-04-17
source: ../Research/sources/standards-engineering-api-specification.md
---

# OpenAPI 3.1.0

**Concern:** Language-agnostic, machine-readable description of RESTful HTTP APIs.
**Issuing body:** OpenAPI Initiative (under the Linux Foundation).
**Scope:** JSON/YAML schema covering endpoints, methods, request/response schemas, authentication, error codes. Enables code generation, mock servers, contract testing.

## When to cite

Cite when a pipeline designs, publishes, or consumes a REST API. OpenAPI defines the *contract*; pair with Richardson Maturity Model or JSON:API if you also need design guidance.

## Notes

De-facto standard at AWS, Google Cloud, Azure, Stripe, and throughout the enterprise API ecosystem. Does not prescribe API design patterns — only the contract format.
