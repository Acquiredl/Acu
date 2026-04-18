# References Index

Canonical standards catalog for the Acu framework. One file per **concern**, filename is the standard slug. Used by both `/Brainstorming` and `/Learning` workspaces (and any pipeline that reaches for it).

Sourced from the Canonical Standards Catalog research (see the `source:` frontmatter field on each stub for lineage).

## How to use

1. Identify the **concern** your decision touches (accessibility, data-privacy, climate-baselines, etc.) — not the field.
2. Look up the concern in the field tables below.
3. Open the referenced stub; it has canonical URL, citable criterion, and when-to-cite guidance.
4. If no concern fits, say so explicitly: "No canonical standard exists for {concern} — decision grounded in {regulatory / contractual / academic / pragmatic basis}." This is a first-class valid outcome, not a failure.

## Existing Acu defaults (called out in workspace CLAUDE.md files, not re-filed here)

| Concern | Standard |
|---------|----------|
| Web accessibility | WCAG 2.1 AA |
| Cloud-native app architecture | 12-Factor |
| Cybersecurity framework | NIST CSF |
| Game mechanics / dynamics / aesthetics | MDA |

## Arts

| Concern | Standard | Stub |
|---------|----------|------|
| Museum / heritage documentation | CIDOC CRM (ISO 21127) | [cidoc-crm.md](cidoc-crm.md) |
| Cross-domain resource metadata | Dublin Core | [dublin-core.md](dublin-core.md) |
| Audio production / archival metadata | AES60 | [aes60.md](aes60.md) |
| Cultural heritage conservation | Venice Charter 1964 | [venice-charter.md](venice-charter.md) |
| Professional video/audio IP transport | SMPTE ST 2110 | [smpte-st2110.md](smpte-st2110.md) |

## Science

| Concern | Standard | Stub |
|---------|----------|------|
| Measurement units & traceability | SI Units (BIPM) | [si-units.md](si-units.md) |
| Fundamental physical constants | CODATA Recommended Values | [codata-constants.md](codata-constants.md) |
| Scientific data stewardship | FAIR Principles | [fair-principles.md](fair-principles.md) |
| Randomized trial reporting | CONSORT 2025 | [consort.md](consort.md) |
| Systematic review / meta-analysis reporting | PRISMA 2020 | [prisma.md](prisma.md) |

## Engineering

| Concern | Standard | Stub |
|---------|----------|------|
| Requirements engineering | ISO/IEC/IEEE 29148 | [iso-iec-ieee-29148.md](iso-iec-ieee-29148.md) |
| Software quality model | ISO/IEC 25010 | [iso-iec-25010.md](iso-iec-25010.md) |
| REST API specification | OpenAPI 3.1.0 | [openapi.md](openapi.md) |
| Release version numbering | Semantic Versioning 2.0.0 | [semver.md](semver.md) |
| Secure software development practices | NIST SP 800-218 SSDF | [nist-ssdf.md](nist-ssdf.md) |

## Health & Medicine

| Concern | Standard | Stub |
|---------|----------|------|
| Health data interoperability | HL7 FHIR | [hl7-fhir.md](hl7-fhir.md) |
| Disease classification | WHO ICD-11 | [who-icd11.md](who-icd11.md) |
| Medical research ethics | Declaration of Helsinki | [declaration-of-helsinki.md](declaration-of-helsinki.md) |
| Clinical trial conduct | ICH E6(R3) Good Clinical Practice | [ich-e6-gcp.md](ich-e6-gcp.md) |
| Clinical trial reporting | CONSORT 2025 | [consort.md](consort.md) |
| Clinical terminology | SNOMED CT | [snomed-ct.md](snomed-ct.md) |

## Law

| Concern | Standard | Stub |
|---------|----------|------|
| Privacy & data protection | GDPR | [gdpr.md](gdpr.md) |
| Business & human rights due diligence | UN Guiding Principles (UNGP) | [ungp.md](ungp.md) |
| International commercial arbitration | UNCITRAL Model Law | [uncitral-arbitration.md](uncitral-arbitration.md) |
| AI governance | OECD AI Principles | [oecd-ai-principles.md](oecd-ai-principles.md) |
| Anti-bribery / anti-corruption | ISO 37001 | [iso-37001.md](iso-37001.md) |

**No single global canonical exists for:** contract formation, intellectual property, labour & employment, legal citation style. These are jurisdiction-bound.

## Education

| Concern | Standard | Stub |
|---------|----------|------|
| Language proficiency | CEFR | [cefr.md](cefr.md) |
| Education-level classification | ISCED 2011 | [isced.md](isced.md) |
| Inclusive instructional design | UDL 3.0 | [udl.md](udl.md) |
| Learning experience tracking | xAPI 2.0 / IEEE 9274.1.1 | [xapi.md](xapi.md) |

## Environment

| Concern | Standard | Stub |
|---------|----------|------|
| Climate science consensus / baselines | IPCC AR6 | [ipcc-ar6.md](ipcc-ar6.md) |
| GHG emissions accounting | GHG Protocol Corporate Standard | [ghg-protocol.md](ghg-protocol.md) |
| Environmental management system | ISO 14001 | [iso-14001.md](iso-14001.md) |
| Energy management system | ISO 50001 | [iso-50001.md](iso-50001.md) |
| Science-based net-zero targets | SBTi Corporate Net-Zero | [sbti-net-zero.md](sbti-net-zero.md) |

## Maths

| Concern | Standard | Stub |
|---------|----------|------|
| Mathematical notation & symbols | ISO 80000-2:2019 | [iso-80000-2.md](iso-80000-2.md) |
| Floating-point arithmetic | IEEE 754-2019 | [ieee-754.md](ieee-754.md) |
| Mathematical literature classification | MSC 2020 | [msc-2020.md](msc-2020.md) |
| Mathematical markup / semantics | MathML 4.0 | [mathml.md](mathml.md) |
| Special functions reference | NIST DLMF | [nist-dlmf.md](nist-dlmf.md) |

**No single canonical exists for:** general mathematical writing style (AMS Style Guide is de-facto), pedagogical presentation, proof formalization (Coq / Isabelle / Lean are competing), numerical algorithm correctness. These are legitimately canonical-free territory.

## Domains not covered by this catalog

- **Affiliate / content-marketing:** regulatory and contractual (FTC 16 CFR Part 255, Amazon Associates Operating Agreement, AI-content labelling rules) — a separate "regulatory references" shelf would suit.
- **Game design beyond MDA:** narrative design, in-game accessibility (beyond WCAG), monetization ethics — no research done yet.

## Versions & currency

Entries are current as of 2026-04-17. When an issuing body publishes a new edition, update the `current_version:` frontmatter field and the relevant citable-criterion examples.
