<!--
SPDX-FileCopyrightText: 2022-2026 Dr Marcus Baw and Baw Medical Ltd
SPDX-License-Identifier: CC-BY-4.0
-->

# `oct` standard

The normative specification for Open Clinical Terminology. Requirement codes (`NS001` etc.) are stable and may be cited from commits, issues, and discussion. Sections still under active RFC are marked; where this document and the root `README.md` disagree on detail, this document is authoritative.

## 1. Concept identifiers (namespace)

One core function of `oct` is to provide a namespace of concept identifiers. Each concept has exactly one identifier that can be referenced from clinical systems and from separate ontology layers.

- **NS001 Unique** - each identifier uniquely identifies a single concept within the terminology.
- **NS002 Non-semantic** - the identifier conveys no meaning about the concept it represents.
- **NS003 Persistent** - once assigned, an identifier is never reused for a different concept and is never deleted. Inactive concepts are marked inactive but retain their identifiers.
- **NS004 Short** - the identifier is as short as is compatible with the other requirements.
- **NS005 Human-communicatable** - it can be spoken aloud without ambiguity.
- **NS006 URL- and filename-safe** - usable in URLs and filenames with no special encoding.
- **NS007 Future-proof** - the identifier space is large enough to accommodate a very large number of concepts.
- **NS008 Recognisable** - the format is recognisable as belonging to `oct`.

### 1.1 Identifier format

Identifiers use the **Crockford Base32** alphabet in lowercase (`0123456789abcdefghjkmnpqrstvwxyz`), which excludes `i`, `l`, `o`, and `u` to avoid visual and spoken confusion. This satisfies NS005 and NS006 directly.

The current implementation mints **6-character** identifiers, giving 32^6 ~= 1.07 billion values. Identifiers are generated randomly (not sequentially) so they carry no ordering or issuance information, reinforcing NS002.

Open questions on length, checksums, and exhaustion behaviour are tracked in [queries.md](queries.md) (`Q-ID-*`).

## 2. Namespace/hierarchy separation `RFC`

Trying to hold both a permanent namespace **and** a comprehensive evolving hierarchy in one artefact has proven intractable for existing terminologies. `oct` separates them:

- The **namespace** (this project) owns identifiers and their internationalised descriptions, and guarantees their permanence.
- One or more **ontology layers** express hierarchy and relationships by *referencing* `oct` identifiers. They may be maintained by `oct` or by third parties, may disagree with one another, and may evolve freely without threatening namespace stability.

This keeps the guarantee `oct` most needs to make (permanent, stable identifiers) decoupled from the part that must be free to change (clinical hierarchy).

## 3. Concept representation

> Status: partly implemented, partly `RFC`. This section documents current behaviour and flags the decisions still open in [queries.md](queries.md) (`Q-REPR-*`).

Concepts are stored as files under `terms/`. The present layout is:

```text
terms/
`-- <locale>/
    `-- <identifier>.oct
```

for example `terms/en-GB/r9j3jq.oct`. A running creation log is appended to `terms/terms`.

Known open decisions before this is normative:

- Whether a concept is one file per locale (current) or one file per concept holding all locales. Filing the identifier *under* a locale directory currently implies the same identifier would be duplicated across locale directories, which needs resolving against NS001/NS003.
- The internal format of a `.oct` file (fields, encoding of descriptions, active/inactive status, provenance for adopted content).
- How provenance (adopted vs crowdsourced, and the upstream licence for adopted content) is recorded per concept.

## 4. Encoding

All terminology files are **UTF-8**. Tooling MUST verify this and MUST reject or flag non-UTF-8 content.

## 5. Reference implementation and tooling `RFC`

The `oct` CLI is the reference implementation of operations over the terminology (mint identifier, search, similarity, validate, build, find-by-language). Per the project's wider move to Rust, the CLI target is a **Rust** binary following house `rust-cli` conventions (thin `main.rs` over a reusable `lib.rs`, `clap` derive, `--format text|json`), with a **Python FFI / bindings** surface offered for the existing Python ecosystem and for contributors who prefer Python. The current Python/Click implementation in `tools/oct.py` is the interim reference until the Rust port lands (roadmap `R2`).

The behaviour the tool must guarantee is defined as a conformance suite (roadmap `R4`) so the Rust implementation and any other can be validated against shared fixtures rather than by hand.
