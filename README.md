# OCT - An open clinical terminology

## Overview

This is an open source clinical terminology project. It is not yet ready to use, but feel free to contribute.

There are already a number of other clinical terminologies available, but none of them are open and free to use without restrictions. This project aims to create a clinical terminology that is open, free to use, and community-driven.

The terminology will be developed using a 'clean-room' open-source approach, with contributions from clinicians, developers, and other stakeholders constituting the entire terminology. The goal is to create a terminology that is comprehensive, accurate, and easy to use.

## Design Philosophy

Each of the following decisions is open for discussion and debate:

* **Open and Free**: The terminology will be licensed under an open license, allowing anyone to use, modify, and distribute it without restrictions.

* **Clinically Relevant**: The terminology will focus on concepts that are relevant to clinical practice, ensuring that it meets the needs of healthcare professionals.

* **Namespace-Hierarchy Separation**: OCT will focus on defining a namespace of concept identifiers and internationalised descriptions. The hierarchical relationships between concepts will be managed by separate ontologies that reference OCT concept identifiers.

* **Community-Owned**: The development of the terminology will be driven by the community, with contributions from a diverse group of stakeholders.

## Strategy

I have been told that creating a new clinical terminology is impossible, or just pointless because of the dominance of some existing terminologies. 

However, I believe that an open and free terminology can fill a gap in the current landscape. The strategy for developing OCT is:

0. **If we don't start, it will never happen.** Hence, we are starting **now**.

1. **Crowdsource**: Anyone may contribute to the terminology, following a transparent and open process.

2. **Adopt**: Existing open works which have a compatible license may be incorporated into the OCT.

## Getting Involved

To discuss any of the core ideas, please use the **Discussions** section of this repository.

If things need to be changed, raise this as an **Issue**, including as much clarity and reasoning around the proposed change as possible.

Proposals for changes or additions to the terminology should be made via **Pull Requests**.



# Specification

## Namespace

One of the key functions of a clinical terminology is to provide a namespace of concept identifiers. Each concept in the terminology will have a unique identifier, which can be used to reference the concept in clinical systems. Below are some of the key properties of the concept identifiers in OCT, which have led to the choice of the identifier format used.

* **Unique**

* **Non-semantic**

* **Persistent** - once assigned, an identifier will never be reused for a different concept, and will never be deleted. Inactive concepts will be marked as such, but their identifiers will remain in use.

* **Short**

* **Human-pronounceable**

* **URL and filename-safe**

* **Large** - the identifier space should be large enough to accommodate a vast number of concepts, to avoid running out of identifiers in the future.