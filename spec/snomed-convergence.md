<!--
SPDX-FileCopyrightText: 2022-2026 Dr Marcus Baw and Baw Medical Ltd
SPDX-License-Identifier: CC-BY-4.0
-->

# SNOMED convergence and the GPS development

> Status: strategic notes, not normative. Records the implications for `oct` of (a) the release of the SNOMED Global Patient Set (GPS) and (b) a 2026-09 conversation between Marcus Baw, Rory Davidson (SNOMED CT CTO), and Ed Cheetham (NHS England) about a simpler, SNOMED-compatible terminology built from a namespace + codelists + a package registry. Open decisions arising from this are tracked in [queries.md](queries.md) (`Q-GOV-3`, `Q-GOV-4`).

## What changed

Two developments since `oct` was started:

1. **SNOMED GPS exists.** The Global Patient Set publishes every active SNOMED CT concept identifier with its FSN and US English preferred term, under **CC BY-ND 4.0**. Format shifting is explicitly permitted under ND (per the Creative Commons FAQ), but derivatives - including adding new concepts or descriptions - are not. So the GPS is a freely redistributable *namespace* with no hierarchy, synonyms, refsets, or translations. Detailed analysis: <https://pacharanero.github.io/sct/gps-ips/>.
2. **SNOMED International is receptive**, at CTO level, to the idea of a simpler "new thing" built *within* SNOMED: GPS-style namespace + curated codelists + a package manager and registry (a "PyPI for codelists", e.g. `packages.snomed.org`). Working within SNOMED would remove the ND barrier, because SNOMED can make derivatives of its own content - including minting new concepts into the namespace.

## Why this matters to `oct`

The proposal discussed with SNOMED is structurally **the `oct` architecture** (`standard.md` §2): a permanent, stable namespace decoupled from the part that must be free to change, with hierarchy demoted from a single canonical DAG to a plurality of curated, versioned lists. "What is a DAG if not a list of lists of lists?" This is independent convergent validation of the namespace/hierarchy separation, from inside the incumbent.

It also validates the simplification stance: postcoordination is replaced by "mint a new precoordinated term" (exactly `oct`'s model), and ECL by published deterministic codelists (an ECL expression can silently change membership across SNOMED editions; a versioned codelist cannot). The heuristic from the conversation - *anything you can't explain to a normal clinician in under half an hour is out* - is a good candidate design principle for `oct` itself.

## The strategic fork

The GPS development creates two possible futures for `oct`, and they differ mainly in **who owns the namespace**:

- **Independent path** (status quo): `oct` mints its own identifiers (`standard.md` §1) and remains a fully open, CC-BY namespace with no dependency on SNOMED International's permission or governance.
- **Convergence path**: an official SNOMED project uses GPS as the namespace. `oct`'s own identifier scheme becomes redundant *for that project*, but everything else `oct` is building - the codelist/ontology-layer model, registry design, provenance discipline, tooling - is exactly what such a project needs.

### Governance context: why SNOMED moves slowly

Rory described SNOMED International's constitution as "like the UN", with a **General Assembly** of member nations. That structure plausibly explains the internal tension visible in the GPS/IPS artefacts: individual leaders (evidently including the CTO) can want greater openness, but assembly-style governance implies a high need for consensus and possibly effective vetoes, so openness advances only as fast as the most reluctant members allow. Terms of reference for the General Assembly have not been reviewed; that would clarify what a sanctioned "new thing" would actually need approved, and by whom.

### The FHIR precedent

The most encouraging analogy: **FHIR emerged from within HL7** as a new lightweight standard under a fully open licence (CC0), at a moment when HL7v3 had become so complex nobody could understand it and HL7v2 was adopted but incomplete. The structural parallel is close: SNOMED's hierarchy, ECL, and postcoordination play the role of v3's complexity; the GPS plays the role of v2's partial adoption. FHIR shows that an incumbent SDO can host a radically simpler, radically more open sibling without destroying itself - and that the sibling can become the main event. "All of `oct` inside SNOMED" is the FHIR play. It also shows what made that work: a small motivated team, a genuinely open licence from day one, and developer-first ergonomics - which is exactly what the registry design ([registry.md](registry.md)) must deliver.

Cautions on the convergence path, so enthusiasm doesn't obscure them:

- **GPS is CC BY-ND, not CC BY-NC** (this is occasionally misremembered). ND means the community cannot extend the namespace independently; every new concept requires SNOMED International (or an officially sanctioned project) to mint it. That is a governance dependency `oct`'s independent namespace deliberately avoids.
- An official SNOMED project is subject to SNOMED governance, priorities, and institutional pace. The GPS/IPS history (see the openwashing analysis in the linked page) suggests internal tension between openness and licensing revenue; a convergence project could stall or be constrained by that tension.
- GPS is US English only, with one term per concept. `oct`'s multilingual descriptions remain a differentiator on either path.

## The hedge: invest in the namespace-agnostic parts

The correct response to the fork is not to pick a side now but to notice which `oct` work retains full value in **both** futures:

1. **The codelist format** - a specified, versioned, nestable codelist artefact (codelists that contain codelists) that references identifiers from *any* stable namespace (`oct` ids, SCTIDs via GPS, or both). A `.codelist` spec already exists in embryonic form in the `sct` project; `oct` should converge on one format rather than fork two.
2. **The registry and package-manager model** - publisher accounts, versioned releases, declarative resolvable dependency manifests, and crowdsourced quality signals (downloads, citations, maintainer count, last-updated). This is the genuinely novel piece from the conversation and is entirely namespace-agnostic.
3. **Provenance discipline** (`R5`, `populating-the-initial-release.md`) - required per-artefact provenance applies identically to codelists as to concepts, and is what makes a registry trustworthy rather than merely popular.
4. **Tooling** (`R2`, `R11`) - validate/build/find over concepts and codelists, regardless of whose identifiers appear inside.

Work that is namespace-*specific* (identifier length/checksum decisions, `Q-ID-*`; minting) continues, but should be recognised as the part at risk of being superseded if the convergence path wins - and as the insurance policy if it doesn't.

## What `oct` must not do

- Do not ingest GPS content into `oct`'s own terms: CC BY-ND prohibits derivatives, and `populating-the-initial-release.md` already excludes SNOMED CT as an adoption source. Mapping *to* SCTIDs, or building codelists that *reference* SCTIDs, is different from copying content and is fine.
- Do not present `oct` to SNOMED as a competitor. The framing that worked in the conversation is the Mike Mulligan/Mary Anne one: reverent of the existing technology, taking it with us, not "move fast and break stuff".
