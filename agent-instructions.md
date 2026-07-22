<!--
SPDX-FileCopyrightText: 2022-2026 Dr Marcus Baw and Baw Medical Ltd
SPDX-License-Identifier: CC-BY-4.0
-->

# Agent instructions

Open Clinical Terminology (`oct`) is an open, community-driven clinical terminology: a permanent namespace of concept identifiers plus internationalised descriptions. It is **not** a hierarchy or ontology (those are separate layers that reference `oct` identifiers), and it is **not** a clinical decision tool. The project is early and on a deliberate slow burn.

This file is the entry point for AI coding agents. Read it before changing anything.

## Read first

- [README.md](README.md) - public overview, governance, and licensing (much of it RFC-tagged).
- [spec/README.md](spec/README.md) - the durable design decisions and reading order. Start here for anything substantive.
- [spec/ubiquitous-language.md](spec/ubiquitous-language.md) - use these exact terms (concept, identifier, description, namespace, ontology layer, adopt, crowdsource).
- [spec/standard.md](spec/standard.md) - normative `NS` requirements and concept representation.
- [spec/roadmap.md](spec/roadmap.md) - current work as stable `R<n>` items; cite them in commits.
- `~/code/house-style/AGENTS.md` - cross-repo standards.

## Core invariants

- **Identifiers are permanent.** Once assigned, a concept identifier is never reused for a different concept and never deleted (NS003). Inactive concepts are marked inactive, not removed.
- **No AI/LLM-generated clinical content.** LLMs and agents may orchestrate, map, de-duplicate, gap-analyse, translate-suggest, and lint - but must never be the *source* of a concept or description. Clinical content traces to a licence-compatible human source with recorded provenance. See [spec/populating-the-initial-release.md](spec/populating-the-initial-release.md).
- **Namespace and ontology layers stay separate.** Do not fold hierarchy into the namespace.
- **All terminology files are UTF-8.**
- **The licensing split is deliberate.** Code is Apache-2.0, data/docs are CC-BY-4.0. This intentionally diverges from the house default (AGPL + CC-BY-SA) because copyleft/share-alike would obstruct embedding a terminology in clinical systems. Do not "correct" it - see `spec/queries.md` `Q-GOV-1`.
- **New source files carry an SPDX header** (Apache-2.0 for code, `#`/`//` comment syntax); content that cannot carry one is covered in bulk by `REUSE.toml`.
- **GitHub Actions are pinned to full commit SHAs** with a `# vX.Y.Z` comment.

## Workflow

The current tooling is interim Python (`tools/oct.py`, exposed via the `./oct` wrapper); the target is a Rust port with a Python FFI (roadmap `R2`).

- `./oct new` / `./oct search` / `./oct similar` - current CLI commands.
- `s/up` / `s/down` - run the Zensical docs server via Docker Compose (or `zensical serve` directly).
- There is no test suite or `validate`/`build` command yet - that is roadmap `R11`/`R4`. Do not claim validation that does not exist.

## Before every commit

There is no Rust toolchain or test gate yet. Until `R2`/`R11` land, the applicable checks are:

```sh
reuse lint            # licensing/SPDX coverage, if REUSE is installed
zensical build --clean # docs build succeeds
```

When the Rust CLI lands, the usual `cargo fmt --all --check`, `cargo clippy --all-targets -- -D warnings`, and `cargo test` become mandatory and CI-enforced.

## Assurance

- Review the diff and run the applicable checks after agent changes; a green build is not evidence a terminology decision is correct.
- Terminology content is high-consequence: validate provenance and licence compatibility against an authoritative human source, never against model output. External content contributions need the `R12` Contributor Covenant/CLA gate before merge.

## Approval required

Ask before publishing releases, deleting branches, force-pushing, changing secrets, merging external content PRs, or any externally visible action.
