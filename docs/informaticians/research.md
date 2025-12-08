# Terminology Research

`oct` is developed through the experience of our contributors and informed by publications in clinical terminology, health informatics, and related fields.

## References

A list of resources and references that have informed the development of `oct` includes:

1. _Desiderata for Controlled Medical Vocabularies in the Twenty-First Century_. JamesJ Cimino, Methods Inf Med. 1998 Nov;37(4-5):394–403. https://pmc.ncbi.nlm.nih.gov/articles/PMC3415631/

2. _Clinical terminology: why is it so hard?_ A L Rector, Methods Inf Med 1999 Dec;38(4-5):239-52. https://pubmed.ncbi.nlm.nih.gov/10805008/

3. Discussions on the Open Health Hub forum: https://openhealthhub.org/c/oct

4. Discussions on the openEHR forum: https://discourse.openehr.org/t/oct-a-new-open-clinical-terminology


## Desiderata for Controlled Medical Vocabularies in the Twenty-First Century (1996)

This is regarded as an important paper, and much of what is discussed has formed part of the design of existing clinical terminologies.

Here is a summary of my (Marcus Baw) notes on *Desiderata*, and how `oct` addresses each point:

### Multipurpose
A terminology should be designed to support multiple uses, including clinical documentation, decision support, research, and administrative reporting.

### Concept Orientation
A terminology should be concept-oriented, meaning that each term represents a distinct clinical concept. A term should have at least one meaning but not more than one meaning.

### Permanence
Concepts can never be deleted from a terminology; they can only be deprecated. This ensures that historical data remains interpretable. `oct` implemets this by adding all terms to a very large namespace of identifiers, and never reusing or deleting them.

### Nonsemantic Identifiers
The identifier of a term should have no linguistic meaning, and no part of the identified should determine the term's place in a hierarchy. `oct` uses 6-digit random Crockford Base32 strings as identifiers for all terms.

### Polyhierarchy
There is no such thing as a single 'correct' hierarchy that can work for all contexts, and remain correct over time as medicine evolves. `oct` is designed to support multiple, composable Graphs which can classify terms in different ways for different purposes.

### No 'Catch-All' Terms
Terms like 'Other', 'Miscellaneous', or NOS ('Not Otherwise Specified'), NEC ('Not Elsewhere Classified') are problematic because they create ambiguity and reduce data quality. `oct` avoids the use of such terms.

### Formal Definitions
*Desiderata* states that terms should have formal definitions to support computational processing. However, this is an area which seems to have resulted in excessive complexity in other terminologies, and is perhaps the dividing line where ordinary clinicians stop being able to understand and use the terminology effectively. Therefore, `oct` at this time focuses on human-readable definitions and clear clinician-understandable relationships.

### Multiple Granularities
A terminology should support multiple levels of granularity to accommodate different clinical scenarios. `oct` allows for terms at varying levels of detail, enabling users to select the appropriate level of specificity for their needs.

### Context Representation
*Desiderata* states that  terminology should be able to represent the context in which a term is used, such as clinical setting, patient demographics, or temporal factors. `oct` incorporates mechanisms to capture and represent such contextual information, enhancing the relevance and accuracy of term usage. I believe that this is the point where the terminology **should give way to the structured data model** (eg openEHR or FHIR) which captures context more effectively.

### Graceful Evolution
A terminology should be able to evolve over time without disrupting existing data. `oct` is designed to accommodate changes, additions, and deprecations in a way that maintains the integrity of historical data. The `oct` namespace is vast and immutable. `oct` graphs are versioned and computable. `oct` tools will support programmatic 'migrations' similar to database schema migrations, to help users update their implementations as the terminology evolves.