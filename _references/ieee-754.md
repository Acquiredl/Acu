---
standard: IEEE 754-2019 — Standard for Floating-Point Arithmetic
concern: Floating-point arithmetic semantics
field: Maths
body: IEEE
type: formal
url: https://standards.ieee.org/standard/754-2019.html
current_version: IEEE 754-2019
last_reviewed: 2026-04-17
source: ../Research/sources/standards-maths-ieee754.md
---

# IEEE 754-2019

**Concern:** Uniform semantics for floating-point computation — formats, rounding, exceptions, and special values.
**Issuing body:** IEEE.
**Scope:** Binary and decimal interchange formats, four rounding modes, five exception classes (overflow, underflow, invalid, divide-by-zero, inexact), and required arithmetic operations.

## When to cite

Cite when a pipeline touches numerical computation where reproducibility or portability matters. Cite the specific format or rounding mode (e.g., "IEEE 754 binary64, round-to-nearest-ties-to-even").

## Notes

De-facto standard for all numerical computing systems. Defines operational semantics; does not prescribe algorithm design or numerical-stability analysis.
