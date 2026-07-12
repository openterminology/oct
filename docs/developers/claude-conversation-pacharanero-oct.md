<!-- conv-id:828af60e-0137-4945-af66-4ea59ef97cb7 -->
# pacharanero/oct

## Human (Apr 14, 2026, 10:07 AM):

I don't think I have an ongoing conversation with you about my project to build an Open Clinical Terminology, although I have extensive conversation history from ChatGPT which I will import.

For now, read https://github.com/openterminology/oct

I had previously been thinking in terms of https://www.crockford.com/base32.html

Someone recently pushed back on that and said do it like FHIR 'terminology' - the termID is a slugified version of the English rubric. 

Also I had some people talk to me about URIs being a good way to represent this namespace, so I'd want that to be part of the spec.

Firstly have a read and a think about where I could make it better.

---

## Claude:

[Tool call: web_fetch]
```json
{
  "url": "https://github.com/openterminology/oct",
  "html_extraction_method": "markdown"
}
```

[Tool result]
{"error_type": "RATE_LIMIT_EXCEEDED", "error_message": "There was an error while fetching: Rate limit exceeded for domain: github.com"}

[Tool call: web_fetch]
```json
{
  "url": "https://raw.githubusercontent.com/openterminology/oct/main/README.md"
}
```

[Tool result]
{"error_type": "PERMISSIONS_ERROR", "error_message": "This URL cannot be fetched because it was not provided by the user nor did it appear in any search/fetch results"}

[Tool call: web_search]
```json
{
  "query": "openterminology oct github"
}
```

[Tool call: web_fetch]
```json
{
  "url": "https://github.com/openterminology/oct",
  "html_extraction_method": "markdown"
}
```

[Tool result]
{"error_type": "RATE_LIMIT_EXCEEDED", "error_message": "There was an error while fetching: Rate limit exceeded for domain: github.com"}

[Tool call: web_fetch]
```json
{
  "url": "https://raw.githubusercontent.com/openterminology/oct/refs/heads/main/README.md"
}
```

[Tool result]
{"error_type": "PERMISSIONS_ERROR", "error_message": "This URL cannot be fetched because it was not provided by the user nor did it appear in any search/fetch results"}

[Tool call: web_search]
```json
{
  "query": "site:github.com openterminology oct README specification"
}
```

[Tool call: web_fetch]
```json
{
  "url": "https://github.com/openterminology/oct",
  "html_extraction_method": "markdown"
}
```

Now let me look at the actual term files to understand the current format:

[Tool call: web_fetch]
```json
{
  "html_extraction_method": "markdown",
  "url": "https://github.com/openterminology/oct/tree/main/terms"
}
```

[Tool result]
{"error_type": "ROBOTS_DISALLOWED", "error_message": "There was an error while fetching: URL is disallowed by robots.txt rules"}

[Tool call: web_search]
```json
{
  "query": "FHIR terminology CodeSystem slug human-readable code"
}
```

Now let me look at Crockford Base32 for context on the original approach:

[Tool call: web_fetch]
```json
{
  "url": "https://www.crockford.com/base32.html"
}
```

OK, I've now read the full README, the Crockford Base32 spec, and the FHIR terminology approach. Here's my thinking on where you could strengthen oct, incorporating the two pieces of feedback you've received.

**The identifier format question is the big one, so let's start there.**

Your current NS001-NS008 requirements are well-articulated, but the README doesn't actually specify *what format* the identifiers take. It describes the properties they should have but stops short of declaring the encoding. That's a gap - the spec needs to commit, even if as an RFC.

The tension between Crockford Base32 opaque IDs and slugified English rubrics is real, and I think both sides have a point but both are also somewhat wrong in isolation. Here's how I'd think about it:

**Against pure opaque IDs (Crockford Base32):** Your NS002 says "non-semantic", which Crockford Base32 nails. But it directly conflicts with NS005 "human-communicatable". Yes, Crockford is *pronounceable* in the sense that you can read out "4G7H" on the phone, but in a clinical setting someone saying "acute-appendicitis" is dramatically more useful than "4G7H". Non-semantic IDs also make the barrier to contribution higher - contributors can't easily browse or reason about the terminology without tooling.

**Against pure slugified English rubrics:** The person who pushed back with "do it like FHIR" has a point about developer ergonomics, but FHIR's own internal code systems are quite small (tens to hundreds of concepts, not hundreds of thousands). Slugified English rubrics are inherently English-centric, which clashes with your internationalisation goal. They're also fragile - if you rename a concept, do you keep the old slug? You end up with `acute-abdominal-pain` pointing to something that later gets refined to a slightly different clinical meaning, and now the slug is misleading. SNOMED tried to encode meaning in identifiers and it caused decades of pain.

**What I'd actually recommend: both, with the opaque ID as the canonical identifier.** Keep Crockford Base32 (or similar) as the primary concept identifier - it satisfies NS001-NS004, NS006-NS008 cleanly. But add a formal `slug` field (a slugified version of the preferred English-language rubric) as a *secondary lookup key* that is explicitly non-stable and can change when the preferred term changes. This gives you the FHIR-style developer ergonomics without coupling your namespace permanence to English language strings. Your spec would then say something like: "The canonical identifier is the opaque `oct` ID. The English slug is a convenience alias, MUST NOT be used for persistence, and MAY change across releases."

**On URIs as namespace identifiers:** This is entirely compatible with either approach and you should absolutely adopt it. FHIR's model here is solid - every code system is identified by a canonical URL that resolves to something useful. For oct, something like:

```
https://openterminology.org/oct/          -- the code system URI
https://openterminology.org/oct/4G7H      -- a specific concept by ID
https://openterminology.org/oct/s/acute-appendicitis  -- slug-based lookup
```

This gives you a URI-based namespace that works in FHIR Coding.system, in RDF, in JSON-LD, and in any system that uses URIs for concept identification. The `/s/` prefix (or similar) makes slug-based lookups unambiguous from ID-based lookups. You'd want to register `https://openterminology.org/oct` as your CodeSystem.url in FHIR terms.

**Other improvements I'd suggest to the spec:**

The README conflates specification, project governance, and getting-started documentation into a single file. As you're building out with Zensical (I see the mkdocs.yml and docs directory), consider moving the specification proper into the docs site and keeping the README as a concise orientation doc. The numbered requirements (NS001 etc.) are good practice but they're currently buried in a long markdown file where governance, licensing, and technical spec are interleaved.

The "Use of AI/LLMs" section is important and well-reasoned for terminology content, but it's quite absolute. You might want to address the case where AI is used for *translation* - if a human clinician verifies an AI-assisted translation of a term description from English to, say, Swahili, is that permissible? The current wording could be read either way.

The licensing section uses Apache 2.0 for code and CC-BY 4.0 for data, which is a solid combination. But the CLA section says "contributors relinquish any and all claims" - that's very strong language that goes well beyond a typical CLA and might put off institutional contributors. A standard Apache-style CLA (grant of license, not assignment of copyright) would be more conventional and achieve the same protection.

The namespace-hierarchy separation principle is the strongest and most original part of the design, and I think it deserves more prominence. It's the thing that genuinely distinguishes oct from just being "SNOMED but open" - it's a fundamentally different architectural choice. I'd make this the lead in the design philosophy section.

Want me to draft a concrete spec section for the identifier format, incorporating the dual ID/slug approach and URI scheme?

---

## Human (Apr 14, 2026, 12:08 PM):

please write these notes as an improvements.md which I can feed into the LLM which codes the project

---

## Claude:

[Tool call: create_file]
```json
{
  "description": "Creating improvements.md with actionable recommendations for the oct project, structured for use as LLM coding agent input",
  "path": "/mnt/user-data/outputs/improvements.md",
  "file_text": "# oct - Improvements and Spec Recommendations\n\nThis document contains actionable improvements for the Open Clinical Terminology (oct) project. It is intended to be fed into a coding agent working on the repository.\n\n## 1. Identifier Format - Adopt Dual ID/Slug Architecture\n\nThe current spec (NS001-NS008) describes the *properties* concept identifiers should have but does not commit to a concrete encoding. This needs resolving.\n\n### Decision: Opaque ID as canonical, English slug as convenience alias\n\n- **Canonical identifier**: Use Crockford Base32 encoding (https://www.crockford.com/base32.html) as the primary, permanent concept identifier. This satisfies NS001 (unique), NS002 (non-semantic), NS003 (persistent), NS004 (short), NS005 (human-communicatable - Crockford is designed for phone readability), NS006 (URL/filename-safe), NS007 (future-proof - huge keyspace), NS008 (recognisable - a consistent format with optional check digit).\n- **Slug**: Add a `slug` field to each concept, which is a kebab-case slugified version of the preferred English-language rubric (e.g. `acute-appendicitis`). The slug is a secondary lookup key, explicitly non-stable, and MAY change across releases when preferred terms are updated.\n- **Spec language to add**: \"The canonical identifier is the opaque oct ID. The English slug is a convenience alias provided for developer ergonomics. Slugs MUST NOT be used for data persistence or long-term referencing. Slugs MAY change between releases when the preferred English rubric changes. Systems storing oct-coded data MUST use the canonical ID.\"\n\n### Rationale\n\n- Pure opaque IDs (Crockford Base32) satisfy the namespace permanence requirements but have poor developer ergonomics for browsing, contributing, and casual use.\n- Pure slugified English rubrics (the \"do it like FHIR\" suggestion) work well for small code systems (FHIR's internal code systems have tens to hundreds of concepts) but are English-centric (conflicting with internationalisation goals), fragile under renaming, and risk repeating the SNOMED mistake of encoding meaning in identifiers.\n- The dual approach gives you the best of both: permanent namespace via opaque IDs, developer-friendly browsing via slugs.\n\n### Implementation notes\n\n- Add a new spec requirement (e.g. NS009) for the slug field.\n- Add a spec requirement (e.g. NS010) stating that slug uniqueness is enforced at any given point in time, but slugs are not guaranteed stable across versions.\n- Define the slug format: lowercase ASCII, hyphens as separators, no special characters, max length TBD (suggest 80 chars).\n- The Crockford Base32 ID should include a check symbol (mod 37) as per the Crockford spec - this helps catch transcription errors, which matters in clinical settings.\n- Consider a prefix or format convention for recognisability (NS008). For example, a fixed prefix like `oct-` before the Crockford Base32 string, or a fixed length. e.g. `oct-4G7H` or a longer padded form for larger keyspaces.\n\n## 2. URI Namespace - Add a Formal URI Scheme\n\nEvery concept should be addressable via a URI. This is essential for FHIR interoperability, RDF/linked data use, and is what the \"use URIs\" feedback was pointing at.\n\n### Proposed URI structure\n\n```\nhttps://openterminology.org/oct/                    -- CodeSystem URI (use as FHIR Coding.system)\nhttps://openterminology.org/oct/{id}                -- Concept by canonical ID\nhttps://openterminology.org/oct/s/{slug}            -- Concept by slug (convenience, redirects to canonical)\n```\n\n### Spec additions needed\n\n- Add a new section (e.g. \"URI Scheme\") with requirements:\n  - **URI001**: The oct code system SHALL be identified by the canonical URL `https://openterminology.org/oct/`\n  - **URI002**: Each concept SHALL be addressable at `https://openterminology.org/oct/{id}` where `{id}` is the Crockford Base32 canonical identifier.\n  - **URI003**: Each concept MAY be looked up at `https://openterminology.org/oct/s/{slug}` where `{slug}` is the current English slug. This URL SHOULD redirect (HTTP 302) to the canonical URI.\n  - **URI004**: The canonical URL SHOULD resolve to a human-readable description of the code system or concept when accessed via a web browser, and to a FHIR CodeSystem or concept resource when accessed with FHIR media types (content negotiation).\n- Register `https://openterminology.org/oct/` as the CodeSystem.url if/when publishing a FHIR CodeSystem resource.\n\n### Implementation notes\n\n- This can start as documentation-only (specifying the URI pattern) before any resolution infrastructure exists.\n- The `/s/` prefix disambiguates slug lookups from ID lookups without needing to inspect the string format.\n- Consider also supporting a FHIR-native representation: a CodeSystem resource at `https://openterminology.org/oct/fhir/CodeSystem/oct` or similar.\n\n## 3. Repository Structure - Separate Spec from Governance from README\n\nThe README currently interleaves technical specification, project governance, licensing terms, and contributor onboarding. As the Zensical docs site is being built out, restructure as follows:\n\n### Proposed structure\n\n- **README.md**: Concise orientation document only. What is oct, why does it exist, how to get involved, link to docs site. No more than ~100 lines.\n- **docs/spec/**: The formal specification, broken into sections:\n  - `docs/spec/namespace.md` - NS001-NS010+ requirements\n  - `docs/spec/uri-scheme.md` - URI001+ requirements\n  - `docs/spec/identifier-format.md` - Crockford Base32 encoding details, slug format\n  - `docs/spec/internationalisation.md` - How multilingual descriptions work\n- **docs/governance/**: Licensing, CLA, decision-making, BDFL role, foundation plans, hostile fork policy\n- **docs/contributing/**: How to contribute terms, code, translations\n\n### Action\n\n- Move the specification sections (Namespace, Namespace-Hierarchy Separation) out of README.md into `docs/spec/`.\n- Move governance sections (Licensing, Attribution, Community Contributions, Decision-Making, Protection Against Hostile Forks, Commercial Use, Future Foundation) into `docs/governance/`.\n- Keep the README as a signpost document.\n- Update mkdocs.yml nav accordingly.\n\n## 4. Namespace-Hierarchy Separation - Elevate This\n\nThe namespace-hierarchy separation is the strongest and most original architectural decision in the project. It is the thing that genuinely distinguishes oct from \"SNOMED but open\". Currently it is a short paragraph buried mid-way through the README.\n\n### Action\n\n- Make this the *first* item in the Design Philosophy section.\n- Expand it with a brief explanation of why this matters - reference the historical pain caused by SNOMED's attempt to combine permanent namespacing with evolving hierarchical classification in a single identifier structure.\n- Add a new spec section `docs/spec/hierarchy-separation.md` that formally specifies:\n  - oct concept identifiers are flat (no hierarchy encoded).\n  - Hierarchical relationships are expressed in separate, versioned ontology files/resources that reference oct IDs.\n  - Multiple competing or complementary hierarchies may coexist, referencing the same oct namespace.\n  - This separation means the namespace can be permanent even as clinical understanding evolves.\n\n## 5. CLA Language - Soften to Standard Practice\n\nThe current text says \"contributors relinquish any and all claims to their contributions\". This goes beyond a typical CLA - it reads more like a full copyright assignment than a license grant. This may deter institutional contributors (e.g. NHS trusts, universities) who need to retain copyright for their own compliance reasons.\n\n### Action\n\n- Replace with an Apache-style CLA model: contributors grant a perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute their contributions under the project's stated licenses.\n- Contributors retain copyright but grant the project an irrevocable license.\n- Consider using the standard Apache ICLA (Individual Contributor License Agreement) as a template.\n- Reference the CLA in CONTRIBUTING.md (to be created).\n\n## 6. AI/LLM Policy - Clarify Translation Use Case\n\nThe current blanket prohibition on AI-generated clinical content is well-reasoned for copyright liability. However, it does not address the specific case of AI-assisted translation.\n\n### Action\n\n- Add a clarification paragraph: AI/LLMs MAY be used as a tool to assist with translation of term descriptions between languages, provided that:\n  - Every AI-assisted translation is reviewed and approved by a qualified human translator or clinician fluent in the target language.\n  - The contribution is attributed to the human reviewer, not the AI.\n  - The review process is documented.\n- This is consistent with the existing permission to use AI for tooling and documentation.\n\n## 7. FHIR Interoperability - Add a Section\n\nGiven that oct will need to coexist with FHIR-based systems, add a section (or a separate doc) addressing:\n\n- How oct maps to the FHIR CodeSystem resource.\n- That `Coding.system` should be set to `https://openterminology.org/oct/` and `Coding.code` to the canonical Crockford Base32 ID.\n- That `Coding.display` should be the preferred rubric in the relevant language.\n- That oct does not define its own ValueSets - these are the responsibility of implementers or separate projects.\n- How oct's hierarchy-separation principle maps to FHIR's ConceptMap and supplement mechanisms.\n\n## 8. Term File Format - Document It\n\nThe `terms/` directory exists in the repo but the format of term files is not documented in the README or spec. Whatever format is used (YAML, JSON, CSV, custom), it needs a formal specification covering:\n\n- Required fields: canonical ID, preferred rubric (English), slug, status (active/inactive/deprecated)\n- Optional fields: descriptions, synonyms, multilingual rubrics, provenance/contributor info\n- Versioning: how changes to terms are tracked\n- Validation: a schema or linting tool that enforces the format\n\n## 9. Recognisability (NS008) - Define Concretely\n\nNS008 says the identifier format should be \"recognisable as belonging to oct\" but does not specify how. Options to consider:\n\n- A fixed prefix: `oct-` followed by the Crockford Base32 string (e.g. `oct-4G7HK`). Simple, effective, but adds 4 characters to every ID.\n- A fixed length with padding: all IDs are zero-padded to a fixed width (e.g. 8 characters), making the format visually distinctive.\n- Relying solely on the URI namespace for recognisability (i.e. the `https://openterminology.org/oct/` prefix is what makes it recognisable, not the bare ID string).\n\nRecommend the `oct-` prefix approach for maximum recognisability in contexts where the full URI is not present (e.g. in spreadsheets, printouts, verbal communication). This is analogous to how SNOMED CT concept IDs are recognisable by their length and numeric-only format.\n\n## Summary of New Spec Requirements to Draft\n\n| Code   | Summary |\n|--------|---------|\n| NS009  | Each concept SHALL have a slug field: kebab-case ASCII slugification of the preferred English rubric |\n| NS010  | Slugs are unique at any point in time but MAY change between versions; they MUST NOT be used for persistence |\n| URI001 | Code system canonical URL is `https://openterminology.org/oct/` |\n| URI002 | Concept canonical URI is `https://openterminology.org/oct/{id}` |\n| URI003 | Slug-based lookup at `https://openterminology.org/oct/s/{slug}` with redirect to canonical |\n| URI004 | URIs SHOULD support content negotiation (HTML for browsers, FHIR for FHIR clients) |\n"
}
```

[Tool result]
File created successfully: /mnt/user-data/outputs/improvements.md

[Tool call: present_files]
```json
{
  "filepaths": [
    "/mnt/user-data/outputs/improvements.md"
  ]
}
```

There you go. The key architectural recommendation in there is the dual ID/slug approach - opaque Crockford Base32 as the canonical identifier, slugified English rubric as a non-stable convenience alias. That threads the needle between the two camps of feedback you've had without repeating SNOMED's mistakes.

The document is structured so a coding agent can work through it section by section. The summary table at the end gives concrete spec requirement codes to draft against. A few things I'd flag for your own judgement before handing it over:

The `oct-` prefix question (section 9) is worth thinking about before coding starts, because it affects every ID ever minted. It's a one-way door.

The URI scheme assumes `openterminology.org` as the base domain - worth confirming you have that registered and intend to keep it long-term, since these URIs become part of other people's data once they start using oct in FHIR Coding elements.

---
