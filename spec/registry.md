<!--
SPDX-FileCopyrightText: 2022-2026 Dr Marcus Baw and Baw Medical Ltd
SPDX-License-Identifier: CC-BY-4.0
-->

# Registry and package manager for Clinical Knowledge Artefacts

> Status: design notes for roadmap `R14`, not normative. This elaborates the "package manager and registry" idea from [snomed-convergence.md](snomed-convergence.md) into a 2026-era architecture. The guiding question throughout: *what would a developer expect from crates.io/PyPI/npm, and what does clinical safety additionally require?*

## 1. Scope: Clinical Knowledge Artefacts, not just codelists

The registry distributes **Clinical Knowledge Artefacts (CKAs)**: versioned, reviewable units of clinical knowledge intended for machine consumption. `.codelist` files (roadmap `R13`) are the founding artefact type, but the registry is deliberately type-plural:

- **Codelists** - the founding type; nestable, namespace-agnostic (`oct` ids, SCTIDs, dm+d, ICD).
- **FHIR artefacts** - ValueSets, CodeSystems, ConceptMaps, and potentially PlanDefinitions/Questionnaires. Note FHIR already distributes Implementation Guides as npm-format packages (packages.fhir.org, Simplifier) - interop with that ecosystem, don't compete with it (see §3).
- **openEHR artefacts** - archetypes and templates. The openEHR CKM is the incumbent here; same posture, interoperate.
- **Maps and crosswalks** - e.g. Read-to-SNOMED, SNOMED-to-ICD, local-to-national.
- **Calculator/decision-support inputs** - the QRISK-style use case: the exact numerator/denominator codelists a calculator or audit was validated against.

Each artefact type is a plugin to the registry with its own schema and validators, not a fork of the registry. One trust, provenance, and distribution model; many payload formats.

## 2. Design principles

1. **Least developer surprise.** Behave like the registries developers already know. Every deviation from npm/PyPI/crates.io conventions must be justified by a clinical-safety need, not taste.
2. **Immutable, reproducible, forever.** A published version is never modified or deleted. Research reproducibility and medico-legal audit both demand that `resolve(name, version)` returns bit-identical content in 2046.
3. **Yank, never delete - and add a recall channel.** Like crates.io yank, a bad release can be withdrawn from *new* resolution while remaining fetchable for reproduction. Clinically we need one step more: a **safety notice** mechanism (think MHRA field-safety notice) where a yank carries a machine-readable reason and severity, and installed clients surface it (`audit` command, CI failure, registry banner).
4. **Provenance is not optional.** Every artefact carries who published it, from what source repository, reviewed by whom, derived from which upstream corpora under which licences (continuous with `populating-the-initial-release.md` §C and roadmap `R5`).
5. **Free to read, accountable to write.** Anonymous, unauthenticated, rate-limited-generously download; authenticated, attributable, signed publishing.
6. **Boring infrastructure.** Static-file-first distribution that survives on a CDN and can be mirrored with `rsync`. The registry must be cheap enough to run forever and simple enough to be mirrored by national health systems that don't trust anyone's cloud.

## 3. Prior art to steal from (2026 state of the art)

| Feature | Steal from | Note |
| --- | --- | --- |
| Sparse HTTP index, no DB needed to resolve | crates.io sparse index / Go module proxy | Resolution metadata as static JSON files by name prefix; CDN-cacheable |
| Trusted publishing via OIDC | PyPI (pioneer), now npm/RubyGems | No long-lived API tokens; CI proves its identity per-publish |
| Keyless signing + transparency log | Sigstore (cosign, Rekor) | Every publish signed and logged in an append-only public log |
| Build provenance attestations | SLSA / npm provenance | "This artefact was built from commit X of repo Y by workflow Z" |
| Scoped namespaces | npm `@scope/name` | Solves name-squatting and org identity in one move |
| Yank semantics | crates.io | Extended with safety notices, §2.3 |
| Package format for health IG content | FHIR npm packages | Where an artefact *is* FHIR, publish in FHIR-package-compatible form so existing FHIR tooling consumes it unchanged |
| Community curation of codelists | OpenCodelists (OpenSAFELY), LambdaConsult, CALIBER | Prior art for codelist metadata and review workflow, not for distribution |
| DOI per release | Zenodo/DataCite | Makes artefacts citable in research; citations become a quality signal |

The gap in 2026: nothing combines package-registry ergonomics with clinical provenance. OpenCodelists has curation but no dependency resolution, lockfiles, or signing; FHIR packages have distribution but weak trust signals and no cross-standard scope. That combination is the product.

## 4. Identity, namespaces, and the registration happy path

### Namespaces

npm-style scopes: `@nhs-england/diabetes-qof`, `@opensafely/covid-shielding`, `@bawmedical/eczema-triggers`. Unscoped names either don't exist or are reserved for the registry operator (SNOMED-owned canonical lists, e.g. the reborn hierarchy chunks). Scopes are claimed first-come with anti-squatting rules (verified orgs can dispute cybersquatted scopes matching their legal/domain name).

### Happy path (target: first publish in under 15 minutes)

1. Sign in with GitHub/GitLab OIDC or email. Individual accounts are first-class - a lone GP researcher must not need an "organisation".
2. Claim a scope. Instant for individuals; org scopes require only a second maintainer confirmation (bus-factor floor of 2 for org scopes).
3. `init` a manifest in an existing Git repo, or use the repository template.
4. Configure trusted publishing (point the registry at repo + workflow, one form) *or* mint a short-lived publish token for a first manual push.
5. `publish`. Artefact is validated (schema, identifier resolution, licence field present), signed, logged, live.

### Verification: tiered, optional at first

- **Tier 0 - unverified**: anyone. Clearly labelled, fully functional. Obligatory verification at launch would kill the community contribution model.
- **Tier 1 - domain-verified**: DNS TXT or `.well-known` proof that the scope owner controls e.g. `nhs.uk`/`rcpch.ac.uk`. Automatic, free, Bluesky-style.
- **Tier 2 - endorsed**: a named endorsing body (SNOMED International, a national release centre, a royal college) attests to the org's clinical governance. This is the "blue tick" and it is an *attestation on the record*, machine-readable, revocable, and shown provenance-style ("endorsed by X on date Y") - not a mere badge.

Trust tiers gate nothing initially except display and search ranking defaults. Downstream consumers can set policy: `policy: require-tier >= 1 for production` in the manifest is a consumer choice, not a registry mandate.

## 5. Artefact model

- **Coordinates**: `@scope/name@version`. Content-addressed too: every release has a SHA-256 digest, and lockfiles pin digests, not just versions.
- **Versioning**: SemVer, with the clinical meaning of the axes *defined in the spec* rather than left to intuition. Proposed: **major** = membership or meaning changes that could alter downstream clinical/analytic results (codes removed, inclusion criteria changed); **minor** = additive, meaning-preserving (new codes for the same concept set, new translations); **patch** = metadata/description-only. This mapping needs clinical review - it is the single most consequential convention in the design, because it is what lets a consumer say "auto-take minors, review majors".
- **Immutability + yank + safety notices**: per §2.
- **Deprecation with successor**: an artefact can be marked deprecated with a machine-readable pointer to its replacement (`superseded-by: @nhs-england/diabetes-qof-v2`), so tooling can propose migrations.
- **Review-by dates**: clinical content rots. An optional `review_by` date, surfaced by `audit` when passed ("this codelist has not been reviewed since the 2027 SNOMED edition"), makes staleness visible without pretending the registry can enforce freshness.
- **Jurisdiction and namespace tags**: which identifier namespaces the artefact draws on (SNOMED edition, dm+d release, `oct`) and which jurisdictions it was authored/validated for.

## 6. Distribution architecture

- **Static index + blob store.** Resolution metadata as sparse-index JSON over HTTPS; artefact blobs (tarballs) content-addressed on a CDN-fronted object store. The dynamic service handles only auth, publish, search, and the web UI. Everything a *consumer* needs at install time is static and mirrorable.
- **Signing and transparency.** Publishes are signed via Sigstore keyless flow tied to the publisher's OIDC identity, recorded in a transparency log. Clients verify by default; failure is an error, not a warning.
- **Mirrors.** A national health service must be able to run a full or partial mirror (air-gapped hospitals exist). The static-first design makes a mirror an `rsync` + policy file, and the lockfile's digests make a mirror untrusted-by-construction (content is verified, not the transport).
- **API.** Boring REST + JSON for search/metadata; the install path never requires it.

## 7. Tooling

### CLI (the task runner)

One binary (Rust, per house style and the `R2` direction), acting as both package manager and task runner:

```text
init            scaffold manifest in current repo
add @scope/name[@range]
install         resolve manifest -> write/obey lockfile -> fetch + verify
update          re-resolve within ranges; --major to cross majors (prints clinical-change summary)
audit           report yanks, safety notices, passed review-by dates, licence conflicts
validate        schema + identifier-resolution checks on local artefacts (maps to oct validate / R11)
diff a b        semantic diff of two codelist versions: codes added/removed/moved, not text diff
build           expand nested codelists to a flat, deduplicated set for consumption
publish         validate, sign, push
yank --reason   withdraw from new resolution, with machine-readable reason
login / whoami
```

`diff` and `audit` are the clinically novel commands and should be first-class, not afterthoughts: "what exactly changed in my QOF diabetes codelist between the version my calculator was validated on and today" is *the* question this infrastructure exists to answer.

### Manifest and lockfile

- **Manifest** (name TBC with the project name, see §9 - e.g. `formulary.toml`): declarative dependencies with SemVer ranges, plus consumer policy (minimum trust tier, allowed licences, allowed identifier namespaces).
- **Lockfile** (`*.lock`): fully resolved graph with exact versions **and digests**, committed to the consumer's repo. The lockfile is the reproducibility artefact: a research paper or a deployed calculator cites its lockfile.

### Ready-made CI

- A **GitHub Action** (and GitLab component) for publishers: on tag push, validate -> build -> publish via trusted publishing, no secrets to configure. Pin by SHA per house style.
- A consumer-side action: `audit` in CI so a yanked or safety-noticed dependency fails the build - this is how safety notices actually reach running systems.
- A repository template: manifest, sample codelist, review checklist as PR template, publish workflow. The GitHub PR review flow *is* the clinical review workflow for small publishers; the registry records the merged reviewers as attestations.

## 8. Trust and quality signals

Crowdsourced signals ranked roughly by how hard they are to game: research citations (via per-release DOIs) > dependents count (who builds *on* this) > endorsements (tier 2) > maintainer count and identity > freshness/review-by compliance > downloads > stars. The UI should lead with the hard-to-game end. All signals are display and search-ranking inputs; none gate installation except by explicit consumer policy.

## 9. Naming

Requirements: meaningful to clinicians *and* developers, short CLI-friendly form, not already a major package/registry name, no trademark landmines (avoid "SNOMED" in the community name; if it becomes official it can live at `packages.snomed.org` regardless of branding).

Shortlist:

- **Formulary** (CLI `formulary`, manifest `formulary.toml`, lockfile `formulary.lock`) - *recommended*. A formulary is exactly this object: a curated, versioned, governed list of approved items that clinicians already trust and consult daily. The metaphor explains the product in one word to a clinician, and "a formulary of codelists" reads naturally. Generic dictionary word, so trademark risk is low and a distinctive registry hostname (e.g. `formulary.health`) does the branding work.
- **Vademecum** (CLI `vade`) - the pocket handbook clinicians carry; charming, international (Latin), but harder to spell and say.
- **Dispensary** (CLI `dispense`) - the place you get exactly what was prescribed; good verb form, slightly long.
- **Compendium** (CLI `comp`) - BNF-ish resonance ("Compendium of Clinical Knowledge Artefacts"); `comp` is a crowded abbreviation.
- **Mary Anne** - homage to the steam shovel from the meeting's analogy; lovely story, too obscure to self-explain.

Whatever the choice, check the name against crates.io/PyPI/npm/GitHub orgs and domain availability before committing; that check has not been done yet.

## 10. Open questions

- **Q-REG-1** - Governance of the registry itself: who operates it, and what happens to the namespace if the operator fails? (Escrow of the static index + transparency log makes community resurrection possible; say so explicitly.)
- **Q-REG-2** - Is the SemVer-for-clinical-meaning mapping in §5 right? Needs review by working clinicians and analysts, not just developers.
- **Q-REG-3** - Relationship to FHIR package registries and openEHR CKM: publish adapters, federate, or ingest? Interop posture per §3, but the mechanics are undecided.
- **Q-REG-4** - Licence floor for published artefacts: require an OSI/CC licence field always; do we *mandate* openness (e.g. CC-BY or freer) or merely surface the licence and let policy filter?
- **Q-REG-5** - Moderation and clinical-harm reporting: who can trigger a safety notice on someone else's artefact, and by what due process?
