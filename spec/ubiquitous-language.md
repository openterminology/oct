# Ubiquitous language

The canonical vocabulary for `oct`. Use these exact terms in code identifiers, CLI commands, documentation, tests, and discussion. Where a term has tempting-but-wrong alternatives, they are listed under "avoid".

| Canonical term | Definition | Avoid |
| --- | --- | --- |
| **concept** | A single unit of clinical meaning, identified by one concept identifier and described by one or more descriptions. | term, code (when you mean the concept itself) |
| **concept identifier** | The permanent, non-semantic handle for a concept (6-char Crockford Base32 today). | code, ID number, SCTID |
| **description** | Language-tagged human-readable text naming a concept. A concept may have many. | term, label, name |
| **preferred description** | The single description marked preferred for a given language. | preferred term, FSN |
| **namespace** | The set of `oct` concept identifiers and their descriptions. `oct` owns this. | code system (imprecise) |
| **ontology** | A separate artefact that asserts relationships between `oct` concept identifiers. `oct` does not own hierarchy. | hierarchy (when you mean the artefact), graph |
| **hierarchy** | The relational/subsumption structure over concepts, expressed by an ontology, never by the namespace. | tree |
| **adopted content** | Terminology imported from an external, licence-compatible source, with recorded provenance. | import, borrowed terms |
| **provenance** | The recorded origin and licence of adopted content. | source (alone), attribution (alone) |
| **the reference tool** | The Rust `oct` command-line implementation - the authoritative implementation of the spec. | the script, the CLI (ambiguous once bindings exist) |

## Note on "term"

The project is named Open Clinical Terminology, but within the model the precise unit is the **concept**, named by **descriptions**. Reserve "term" for informal prose and the project name; do not use it as a modelled entity.
