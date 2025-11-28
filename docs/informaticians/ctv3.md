# UK Read Codes Clinical Terms Version 3 (CTV3) licensing review

## Source
- NHS TRUD item: UK Read Codes Clinical Terms Version 3 (CTV3) [licences page](https://isd.digital.nhs.uk/trud/users/guest/filters/0/categories/9/items/19/licences).

## Licence statements from TRUD
- The TRUD page lists **"Open Government Licence for TRUD"** as the applied licence and links to the National Archives Open Government Licence (OGL). It notes that an open TRUD account is needed to use the content and recommends notifying NHS Digital of errors and tracking uses for updates.
- The OGL v3.0 terms provide a worldwide, royalty-free, perpetual, non-exclusive licence to copy, publish, distribute, transmit, adapt, and commercially or non-commercially exploit the information, provided the source is acknowledged.
- OGL obligations require attribution to the information provider and inclusion of a link to the licence, with a default statement (“Contains public sector information licensed under the Open Government Licence v3.0”) when none is supplied.
- Exemptions include personal data, logos/crests, third-party rights the provider cannot license, and non-endorsement requirements.

## Compatibility with `oct`
- `oct` terminology data is licensed under CC BY 4.0. Both OGL v3.0 and CC BY 4.0 are attribution licences that permit copying, adaptation, redistribution, and commercial use with proper credit. The permissions and obligations align closely, making OGL v3.0 content suitable for incorporation into a CC BY 4.0 dataset when attribution is preserved.
- Additional TRUD usage guidance (maintaining an open account, reporting errors) does not restrict downstream reuse of OGL-licensed content once obtained. However, we should maintain provenance records and preferred attribution supplied by NHS Digital to satisfy OGL requirements.
- OGL’s non-endorsement and logo exclusions match `oct`’s existing stance on trademarks; we must avoid implying NHS endorsement and omit any protected branding.

## Recommendation
- CTV3’s OGL v3.0 licence is compatible with `oct`’s open-terminology goals. We can use CTV3 as a seed source provided we:
  - capture and display NHS Digital/National Archives attribution alongside any imported terms;
  - exclude any content outside OGL scope (e.g., logos, personal data, third-party inserts if present);
  - keep provenance records to honour update and error-reporting guidance.
- Subject to those practices, CTV3 can form part of the `oct` open terminology without conflicting with `oct`’s CC BY 4.0 licensing.
