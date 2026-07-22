<!--
SPDX-FileCopyrightText: 2022-2026 Dr Marcus Baw and Baw Medical Ltd
SPDX-License-Identifier: CC-BY-4.0
-->

# `oct` roadmap

Domain and engineering milestones as stable, citable items. Refer to items by code (`complete R2`, `implements R4`); never renumber or reuse a code.

Legend: `[x]` done, `[~]` in progress / partial, `[ ]` not started.

## Guiding principles (not tasks)

- Permanent, stable identifiers are the one guarantee `oct` must never break (see `standard.md` NS003).
- No AI/LLM-generated clinical content; provenance is recorded, not assumed (see `populating-the-initial-release.md`).
- Namespace and ontology layers stay separate.

## Foundations

- [x] **R6 - Migrate durable design decisions into `spec/`** - this folder.
- [x] **R7 - House-style hygiene** - SHA-pinned CI actions, SPDX headers + `REUSE.toml`, `LICENSE.md` detectable by GitHub.
- [x] **R8 - Thin `AGENTS.md`** - read-first order (this `spec/`), invariants, and validation commands, with vendor-neutral `agent-instructions.md` and a `CLAUDE.md` pointer.

## Standard

- [~] **R9 - Finalise concept representation (`standard.md` §3)** - resolve one-file-per-locale vs one-file-per-concept, define the `.oct` file format, and specify per-concept provenance fields. Blocked on `Q-REPR-*`.
- [ ] **R10 - Specify identifier length/checksum/exhaustion behaviour** - close `Q-ID-*`.

## Tooling

- [~] **R2 - Port the `oct` CLI to Rust** - house `rust-cli` shape (thin `main.rs` over `lib.rs`, `clap` derive, `--format text|json`), offering a Python FFI/bindings surface. Current Python/Click `tools/oct.py` is the interim reference implementation.
- [ ] **R11 - Complete the tool's specified commands** - `validate` (duplicates, UTF-8, orphans), `build`, and `find --lang`, per `tools/.spec.md`. Applies to whichever implementation is current.
- [ ] **R4 - Conformance suite** - shared fixtures/expected outputs so the Rust port and any other implementation validate against the same behaviour rather than by hand.

## Terminology population

- [ ] **R1 - Populate the initial release** - stand up the first substantial body of terminology via the adopt + crowdsource strategy in `populating-the-initial-release.md`.
- [ ] **R5 - Provenance register** - a per-concept record of adopted-vs-crowdsourced origin and, for adopted content, the upstream source and licence. Make it a required, tested field.
- [ ] **R3 - Agentic mapping/gap-analysis pipeline** - scaled de-duplication, gap analysis, and translation triage that propose to humans and never author clinical content.

## Governance / content

- [ ] **R12 - Contributor Covenant / CLA** - formalise the contribution-licensing terms the README describes, so external content PRs (e.g. GitHub #24) have a clear provenance and licensing gate before merge.
