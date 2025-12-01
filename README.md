# Open Clinical Terminology (`oct`) - An open clinical terminology

<!-- UNHIDE THIS WHEN WE HAVE MORE THAN 0 SPONSORS :-) <img alt="GitHub Sponsors" src="https://img.shields.io/github/sponsors/bawmedical">
 -->

If you believe in what we are trying to achieve with Open Clinical Terminology (`oct`) please consider [sponsoring](https://github.com/sponsors/bawmedical) the project so that we can have team members working on the project full-time. 

## Overview

This is an open source clinical terminology project. It is not yet ready to use, but feel free to contribute.

There are already a number of other clinical terminologies available, but none of them are open and free to use without restrictions. This project aims to create a clinical terminology that is open, free to use, and community-driven.

The terminology will be developed using a 'clean-room' open-source approach, with contributions from clinicians, developers, and other stakeholders constituting the entire terminology. The goal is to create a terminology that is comprehensive, accurate, and easy to use.


## Design Philosophy <kbd>[RFC](#rfcs)</kbd>

Each of the following decisions is open for discussion and debate:

- **Open and Free**: The terminology will be licensed under an open license, allowing anyone to use, modify, and distribute it without restrictions.

- **Clinically Relevant**: The terminology will focus on concepts that are relevant to clinical practice, ensuring that it meets the needs of healthcare professionals.

- **Namespace-Hierarchy Separation**: `oct` will focus on defining a namespace of concept identifiers and internationalised descriptions. The hierarchical relationships between concepts will be managed by separate ontologies that reference `oct` concept identifiers.

- **Community-Owned**: The development of the terminology will be driven by the community, with contributions from a diverse group of stakeholders.

## Strategy <kbd>[RFC](#rfcs)</kbd>

I have been told that creating a new clinical terminology is impossible, or just pointless because of the dominance of some existing terminologies.

However, I believe that an open and free terminology can fill a gap in the current landscape. The strategy for developing `oct` is:

0. **If we don't start, it will never happen.** Hence, we are starting **now**.

1. **Crowdsource**: Anyone may contribute to the terminology, following a transparent and open process.

2. **Adopt**: Existing open works which have a compatible license may be incorporated into `oct`.


## Getting Involved

To discuss anything about `oct` please use the [`oct` Category of openhealthhub.org](https://openhealthhub.org/c/oct/58) - this is a good starting point for discussions, questions, and suggestions as well as learning about the project and connecting with existing contributors.

If things need to be changed, raise this as an **Issue**, including as much clarity and reasoning around the proposed change as possible. Ideally, link to relevant discussions on openhealthhub.org, and/or relevant sections of the terminology itself

Proposals for changes or additions to the terminology should be made via **Pull Requests**.


# Specification

For ease of referring to specific parts of the specification, each requirement is given a code eg NS001.


## Namespace

Discussion: https://github.com/pacharanero/open-terminology/issues/1

One of the key functions of a clinical terminology is to provide a namespace of concept identifiers. Each concept in the terminology will have a unique identifier, which can be used to reference the concept in clinical systems. Below are some of the key properties of the concept identifiers in `oct`, which have led to the choice of the identifier format used.

#### NS001 **Unique** - each identifier must uniquely identify a single concept within the terminology.

#### NS002 **Non-semantic** - the identifier does not convey any meaning about the concept it represents.

#### NS003 **Persistent** - once assigned, an identifier will never be reused for a different concept, and will never be deleted. Inactive concepts will be marked as such, but their identifiers will remain in use.

#### NS004 **Short** - the identifier should be as short as possible, to make it easy to use and remember.

#### NS005 **Human-communicatable** - it should be possible for humans to communicate the identifier verbally without ambiguity or confusion.

#### NS006 **URL and filename-safe** - the identifier should be safe to use in URLs and filenames without requiring special encoding.

#### NS007 **Future-proof** - the identifier namespace should be large enough to accommodate a vast number of concepts, to avoid running out of identifiers in the future.

#### NS008 **Recognisable** - the identifier format should be recognisable as belonging to `oct`, to avoid confusion with identifiers from other terminologies.


## Namespace-Hierarchy Separation <kbd>[RFC](#rfcs)</kbd>

Trying to achieve both a permanent namespace **and** a comprehensive logical hierarchy over time has proven to be an intractable problem for existing clinical terminologies. `oct` aims to address this by separating the namespace of concept identifiers from the hierarchical relationships between concepts.


## Licensing <kbd>[RFC](#rfcs)</kbd>

The licensing model is subject to community discussion and agreement. The initial RFC proposal is as follows:

- `oct` is designed as open public infrastructure.

- `oct` is composed of several types of work: software, data, documentation, and branding.

Licenses have been selected to balance openness, protection of contributors, and sustainability.

| Component                                                        | License                                                                                                    | Description                                                                                                                         |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Software code**                                                | [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)                                          | A permissive open-source license providing patent protection and compatibility with commercial and open projects.                   |
| **Terminology data**                                             | [Creative Commons Attribution 4.0 International (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/) | Allows full reuse of the `oct` terminology content, including commercial use, provided proper attribution is given.                 |
| **Documentation & specifications**                               | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)                                                  | Ensures educational materials and technical documents remain open and citable.                                                      |
| **Project name and logo (“Open Clinical Terminology”, “`oct`”)** | Trademark protection                                                                                       | The `oct` name and logo will be trademarked to prevent misleading forks or impersonation. Forks must use a different name and logo. |

---

## Attribution <kbd>[RFC](#rfcs)</kbd>

When redistributing or building on `oct` materials under CC-BY 4.0, attribution must include:

- The project name: **Open Clinical Terminology (`oct`)**
- A link to the canonical repository or website
- A statement of any modifications made

#### Example

> “This work includes content from the Open Clinical Terminology (`oct`) project (https://github.com/openclinicalterminology/oct), licensed under CC-BY 4.0.”

## Community Contributions <kbd>[RFC](#rfcs)</kbd>

All contributions — whether terminology entries, code, or documentation — are made under the same licenses as the corresponding component (Apache 2.0 for code, CC-BY 4.0 for data).

In order to safeguard the project and its overall licensing terms, contributors relinquish any and all claims to their contributions, and agree that their contributions may be redistributed and incorporated under these licenses. A Contributor Covenant will be established to clarify expectations and responsibilities.

## Decision-Making <kbd>[RFC](#rfcs)</kbd>

`oct` values open, consensus-driven decision-making.  
In case of disputes, decisions default to the principle of **maximising openness and interoperability**. Final decisions rest with the BDFL (Benevolent Dictator For Life).

## Protection Against Hostile Forks

`oct` welcomes forks for innovation and experimentation, but reserves the right to defend the **`oct` name and identity**.

- Forks may not use the names _“Open Clinical Terminology”_, _“`oct`”_, or the official logo without written permission, which can be obtained by contacting the maintainers.

- The canonical version is maintained under the `openclinicalterminology` organisation and represented by the Steering Committee.

- Transparent governance and visible contributor credit ensure the community recognises the authentic lineage of the project.

## Commercial Use <kbd>[RFC](#rfcs)</kbd>

Commercial organisations are encouraged to build upon `oct` data and software.  
They must:

- Preserve attribution under CC-BY 4.0
- Avoid using the `oct` trademarks in ways that imply official endorsement

Collaborations that benefit the open ecosystem are actively encouraged through open governance participation. We welcome contributions from commercial entities that align with `oct`'s open principles.

## Future Foundation <kbd>[RFC](#rfcs)</kbd>

The long-term intention is to establish a non-profit **`oct` Foundation** to act as the legal vehicle for all intellectual property - clinical terms, code, graphs, trademarks, domain names, and governance documents. Until then, these are managed collectively by the project’s founding contributors, led by Dr Marcus Baw as BDFL.

## Use of AI/LLMs <kbd>[RFC](#rfcs)</kbd>

For reasons of copyright liability, absolutely no AI or Large Language Model-generated clinical content is to be included in `oct`. All contributions must be created by human authors. It is likely that all Large Language Model training data includes copyrighted material, and so any content generated by AI/LLMs may infringe copyright. To avoid any risk of copyright infringement, no AI/LLM-generated content is allowed in `oct`.

Within `oct` it **is** permissible to use AI/LLMs in a responsible and human-supervised way to assist with generating library code, creation of tools, building graphs, documentation and similar tasks, provided that there is no risk of copyright or license infringement.

## References

A list of resources and references that have informed the development of `oct`:

1. _Desiderata for Controlled Medical Vocabularies in the Twenty-First Century_. JamesJ Cimino, Methods Inf Med. 1998 Nov;37(4-5):394–403. https://pmc.ncbi.nlm.nih.gov/articles/PMC3415631/

2. _Clinical terminology: why is it so hard?_ A L Rector, Methods Inf Med 1999 Dec;38(4-5):239-52. https://pubmed.ncbi.nlm.nih.gov/10805008/

3. Discussions on the Open Health Hub forum: https://openhealthhub.org/c/oct

4. Discussions on the openEHR forum: https://discourse.openehr.org/t/oct-a-new-open-clinical-terminology

## Contact

For questions, discussions, or to get involved, please visit the [Open Health Hub `oct` Category](https://openhealthhub.org/c/oct/58) or contact the maintainers (info@openterminology.org).


## RFCs

A number of aspects of the project are still under discussion, these are labelled <kbd>[RFC](#rfcs)</kbd>. GitHub Issues or [openhealthhub.org](https://openhealthhub.org/c/oct) may be used for discussion, and when consensus is reached these sections will be updated accordingly.
