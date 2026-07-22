<!--
SPDX-FileCopyrightText: 2022-2026 Dr Marcus Baw and Baw Medical Ltd
SPDX-License-Identifier: CC-BY-4.0
-->

# Open queries

Questions that need a human decision before the affected part of the spec becomes normative. Each has a stable code so a decision can be recorded against it. Many correspond to `RFC`-tagged sections of the root `README.md`.

## Identifiers (`Q-ID-*`)

- **Q-ID-1** - Is 6 characters the right length, given random (non-sequential) minting and the birthday-collision rate as the namespace grows? At what fill factor do collisions force a length increase, and how is that migration handled without breaking NS003?
- **Q-ID-2** - Should identifiers carry a check character (Crockford supports one) to catch transcription errors, at the cost of one character of entropy?
- **Q-ID-3** - What is the defined behaviour on namespace exhaustion or on lengthening - are longer identifiers simply added, and is length ever significant?

## Concept representation (`Q-REPR-*`)

- **Q-REPR-1** - One file per locale (current: `terms/<locale>/<id>.oct`) or one file per concept holding all locales? The current layout implies the same identifier is duplicated across locale directories; reconcile with NS001/NS003.
- **Q-REPR-2** - What is the internal `.oct` file format? Fields for descriptions, active/inactive status, and provenance.
- **Q-REPR-3** - Is `terms/terms` (the creation log) the intended long-term record, or should creation/provenance live inside the concept file and/or Git history?

## Population and provenance (`Q-POP-*`)

- **Q-POP-1** - Confirm the actual, current licence of any CTV3/Read Codes distribution before ingestion. Does the specific release grant OGL terms for the code file itself, or is OGL only assumed from Crown Copyright?
- **Q-POP-2** - Is adopted-vs-crowdsourced provenance a *required, tested* per-concept field (see roadmap `R5`)?
- **Q-POP-3** - Where CTV3 is adopted, is that acknowledged as an "adopt" path distinct from the clean-room crowdsourced content, so the clean-room claim remains precise?

## Licensing and governance (`Q-GOV-*`)

- **Q-GOV-1** - Confirm the outbound split stays Apache-2.0 (code) + CC-BY-4.0 (data/docs). This deliberately diverges from the house default (AGPL + CC-BY-SA) because copyleft/share-alike would obstruct embedding a terminology in clinical systems. Recorded here so the divergence is intentional, not drift.
- **Q-GOV-2** - When does custodianship move from Baw Medical Ltd to the proposed `oct` Foundation, and what triggers it?
