# Populating the initial release

How `oct` gets its first substantial tranche of concepts **without infringing the copyright of any licensable terminology**, and without breaking the project's rule that no AI/LLM-generated clinical content enters the terminology.

## The governing constraint

Two rules pull in opposite directions and must both hold:

1. **No LLM-authored clinical content** (README, `standard.md` PR003). LLM training data is assumed to contain copyrighted terminology, so an LLM cannot be the *source* of a concept or description.
2. We still want to move fast and at scale.

The resolution: **LLMs orchestrate; humans and licence-compatible corpora author.** Every concept and its canonical description must trace to either a human contributor (clean-room) or a licence-compatible source (adopted). LLMs do clustering, mapping, gap-finding, routing, and lint - never invention of clinical meaning.

## A. Licence-compatible seed corpora

Candidates to *adopt* from, each requiring a provenance record and a licence check on the **current** release before use (do not assume yesterday's licence still applies):

- **CTV3 / Read Codes** (Crown Copyright, potentially OGL) - a strong English clinical spine. Caveat: historically distributed via NHS TRUD under terms that are not automatically OGL; confirm the exact licence on the specific file before adopting.
- **NHS Data Dictionary, dm+d** (Crown / OGL) - good for the medicines and devices axis.
- **OBO Foundry ontologies** - HPO, MONDO, Uberon, DOID and others are frequently CC-BY, which is inbound-compatible with CC-BY-4.0 outbound. Take labels/descriptions, not the hierarchy (that lives in the ontology layer).
- **Wikidata** (CC0) - broad clinical labels with multilingual descriptions and no attribution burden; useful for description drafting and translation candidates.
- **ICD-10 / ICD-11** (WHO) - browsable but **not** automatically open; ICD-11 API terms need reading before any adoption.

**Not** adoptable: SNOMED CT (SNOMED International licence), and any source whose terms remain the licensor's property. These may be *mapped to* by third parties, but their content must not be copied into `oct`.

## B. Where LLMs and agents are safe (and powerful)

1. **Mapping and de-duplication at scale** - cluster candidate labels across corpora and propose "these strings denote the same concept" for human confirmation. The reference tool's `similar` command is v0 of this.
2. **Gap analysis** - "which concepts in this OGL corpus have no `oct` equivalent yet?" Massively parallel triage into a human-reviewed queue.
3. **Translation candidates** - flag concepts lacking a description in a target language and propose wording for a bilingual clinician to confirm.
4. **Consistency and QA** - UTF-8 enforcement, identifier-collision detection, orphan detection, schema lint. Pure engineering, zero copyright exposure - this is the `validate`/`build` half of the tooling.

What LLMs must **not** do: originate a concept, or write a canonical description from their own "knowledge" (that launders training data of unknown provenance). Where an LLM proposes description wording, the provenance must point at the licence-compatible source it was derived from, and a human signs off.

## C. Provenance discipline

Every adopted concept records, at minimum: source name, source identifier, source licence, retrieval date, and whether the content was taken verbatim or transformed (and how). This is what makes the CC-BY-4.0 redistribution defensible and keeps the clean-room contributions cleanly separable from adopted content (see queries Q3).

## D. Suggested sequence

1. Resolve the `.oct` schema (R7) so there is somewhere structured to put adopted concepts and their provenance.
2. Pick **one** unambiguously licence-clean corpus (most likely dm+d or a CC-BY OBO ontology - lower licence risk than CTV3) and adopt a bounded slice end-to-end as a worked example.
3. Build the agent-assisted mapping/gap pipeline against that slice, with a human review gate.
4. Only then take on CTV3, once its licence position is confirmed in writing.

The headline milestone is roadmap **R10**.
