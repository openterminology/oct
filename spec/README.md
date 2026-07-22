# `oct` specification

This folder holds the durable design decisions for Open Clinical Terminology (`oct`) - the things that need to outlive any single chat, issue, or pull request. If you are new to the project, read this folder before touching code or terminology.

## Reading order

1. [standard.md](standard.md) - the normative specification: what a concept is, the identifier scheme, and the namespace/hierarchy separation. Requirements carry stable codes (`NS001` etc.).
2. [ubiquitous-language.md](ubiquitous-language.md) - the canonical vocabulary. Use these exact terms in code, CLI, docs, and discussion.
3. [roadmap.md](roadmap.md) - what is built, in progress, and planned, with stable `R<n>` item codes.
4. [populating-the-initial-release.md](populating-the-initial-release.md) - how the first tranche of terminology is sourced without infringing anyone's copyright.
5. [queries.md](queries.md) - open questions awaiting a human decision (the RFCs).

## How this folder relates to the rest of the repo

- The normative rules that were historically embedded in the root `README.md` (the `NS0xx` requirements) are migrated here. The README remains the public-facing overview; `spec/standard.md` is the source of truth for the specification itself.
- Behaviour that must hold across implementations (the Rust reference tool and any bindings) is defined as conformance data, not prose. See the roadmap for the conformance-suite item.
- When code and spec disagree, that is a bug in one of them. Fix it in the same change, or record the divergence in [queries.md](queries.md).
