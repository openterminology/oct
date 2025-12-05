# OCT Specification Index

This folder holds specification documents for the Open Clinical Terminology (OCT) project.
It provides:

- A top-level specification covering coding style expectations and contribution patterns for OCT tooling.
- Command-level specifications for the `oct` CLI, with one file per command.

The documents are intended as living guidance for contributors and reviewers. They should be updated alongside code changes to keep the specification authoritative.

## Coding Style and Development Standards

- **Language & Tooling**: Python 3.13+ for CLI work, using [`click`](https://click.palletsprojects.com/) for command definitions and option parsing.
- **Imports**: Group standard library, third-party, and local imports separately; avoid wildcard imports; never wrap imports in `try/except`.
- **Typing**: Prefer explicit type hints for function arguments and return values. Use `Path` for filesystem paths.
- **Error Handling**: Fail fast with clear, user-focused error messages; avoid silent failures. Capture predictable exceptions and surface actionable guidance.
- **I/O & Filesystem**: Treat `tools/` as the CLI home, with `terms/` as the default data root. Keep path handling cross-platform by relying on `pathlib`.
- **Logging & UX**: Use `click.echo` for user-facing output. Keep messages concise, with details only when helpful for troubleshooting.
- **Testing & Validation**: Prefer small, deterministic functions. New behavior should be exercised by unit tests or smoke commands when feasible.
- **Documentation**: Every command should have a dedicated spec file describing purpose, inputs, outputs, and side effects. Keep examples in sync with the CLI help text.
- **Security & Integrity**: Use `secrets` for any identifier generation. Avoid writing files without explicit user intent. Check for existing artifacts before creating new ones.

## File Layout

- `docs/specifications/README.md` — This document and style expectations.
- `docs/specifications/commands/<command>.md` — One file per CLI command.

When adding new commands, create a matching spec file in `docs/specifications/commands/` and link it from relevant documentation.