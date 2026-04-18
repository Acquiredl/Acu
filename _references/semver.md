---
standard: Semantic Versioning 2.0.0 (SemVer)
concern: Release version numbering for dependency compatibility
field: Engineering
body: Community (de-facto); authored by Tom Preston-Werner
type: de-facto
url: https://semver.org/
current_version: 2.0.0 (stable)
last_reviewed: 2026-04-17
source: ../Research/sources/standards-engineering-semver.md
---

# Semantic Versioning 2.0.0

**Concern:** MAJOR.MINOR.PATCH version scheme that communicates backward-compatibility of a release.
**Issuing body:** Community specification (de-facto — no formal standards body).
**Scope:** Rules for incrementing MAJOR (breaking changes), MINOR (backward-compatible features), PATCH (bug fixes); pre-release and build-metadata syntax.

## When to cite

Cite when a pipeline defines a release cadence for any library or package. Adopted by npm, PyPI, RubyGems, Cargo, Maven-central conventions, and most language package managers.

## Notes

Does not prescribe release cadence or changelog format (pair with Conventional Commits or Keep a Changelog for that). De-facto despite the absence of formal standardization — universally interpreted.
