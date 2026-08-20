---
name: premium-pdf-design
description: Design, create, redesign, and audit polished non-technical PDFs with context-specific art direction, editorial hierarchy, typography, imagery, page rhythm, navigation, and render verification. Use for guides, playbooks, ebooks, proposals, brochures, portfolios, lookbooks, magazines, handbooks, event books, personal publications, and branded reports whose primary goal is communication rather than engineering evidence. Use technical-report-design for engineering or scientific reports and personal-places-services-directory-pdf for trusted-place directories.
---

# Premium PDF Design

Create a complete publication, not decorated text. Make the document feel authored for its subject, audience, and reading context while preserving factual integrity and an editable source.

Apply the `pdf` skill for PDF authoring, rendering, and page-by-page verification whenever it is available.

## Establish the publication contract

Before designing, determine from the request and supplied material:

- purpose, audience, desired action, and expected reading time;
- screen, print, or dual-use delivery;
- page size, orientation, page target, language, and deadline;
- brand assets, required colors, logos, fonts, and reference material;
- source-of-truth content, citations, legal copy, and required accessibility;
- editable source format and final deliverables.

Preserve supplied facts and wording requirements. Never invent testimonials, figures, quotations, citations, people, sponsors, or product claims. Use visible placeholders only when the missing content does not block a truthful draft.

## Choose one contextual art direction

State a one-sentence direction before authoring. Derive it from the subject rather than applying a universal luxury theme.

Read [art-directions.md](references/art-directions.md) when selecting palette, type character, image treatment, or visual motif. Use one dominant visual idea and one restrained accent system. Fancy means well composed, materially coherent, and precisely typeset; it does not mean adding gradients, ornaments, cards, or effects to every page.

If the user supplies a reference, extract general principles such as density, rhythm, typography, color relationships, cropping, and material character. Do not copy distinctive branding, artwork, composition, or text.

## Build a compact publication system

Define or reuse:

- a baseline grid and outer margins;
- display, heading, body, caption, label, and folio type roles;
- a neutral canvas, text colors, one accent, and semantic colors only when needed;
- image crop, border, rule, radius, and texture rules;
- spacing steps and section-opening rhythm;
- running headers, footers, page numbers, navigation, and link style.

Limit the system to what the document uses. Maintain readable contrast and do not treat low contrast, tiny captions, excessive whitespace, or oversized type as sophistication.

## Architect the editorial flow

Shape the content before styling individual pages:

1. Define the narrative or reference structure.
2. Group source material into sections with distinct reader goals.
3. Assign page archetypes and estimate density.
4. Place evidence, imagery, captions, and calls to action near the content they support.
5. Create deliberate quiet and high-energy moments.
6. Check that page turns and section openings make sense in sequence.

Read [page-patterns.md](references/page-patterns.md) when choosing cover, contents, opener, essay, feature, gallery, comparison, checklist, quote, profile, callout, or closing pages. Do not repeat one card or two-column template throughout the document.

## Make typography carry the hierarchy

- Keep body measure comfortable and line spacing generous enough for the chosen typeface.
- Use size, weight, spacing, alignment, and placement before decorative containers.
- Tune line breaks in display text; avoid single-word final lines where practical.
- Prevent widows, orphans, stranded headings, and captions detached from their images.
- Use all caps, italics, serif contrast, or monospace only for a defined editorial role.
- Keep page numbers, source notes, and legal copy legible at intended output size.
- Use fonts that can be embedded or distributed lawfully; provide strong fallbacks when custom fonts are unavailable.

## Integrate imagery and graphics

Use imagery when it carries information, mood, identity, or pacing.

- Prefer supplied, official, licensed, public-domain, or purpose-generated imagery.
- Record sources and rights notes when relevant.
- Crop around the focal point and preserve it across page sizes.
- Use consistent image grading, corner treatment, captioning, and credit placement.
- Reserve sufficient resolution for the final physical or screen size.
- Use exact charts or diagrams only from verified data; never fabricate decorative metrics.

One strong full-bleed image, collage, illustration, or typographic gesture can define a section. Several unrelated effects usually weaken it.

## Author in a reproducible format

Use the user's requested source format. Otherwise choose the simplest format that preserves the required layout and remains editable. Follow the active `pdf` skill's production conventions; use a deterministic PDF library or a stable HTML/LaTeX workflow when it materially improves the result.

- Keep content, styles, assets, and build steps organized.
- Reserve image dimensions and avoid accidental reflow.
- Make links clickable and visibly meaningful.
- Keep asset paths portable and do not depend on hidden local state.
- Do not rasterize text merely to preserve a look.
- Do not claim tagged-PDF accessibility unless the exported structure was actually inspected.

## Design real document states

Handle:

- long and short sections;
- missing or low-resolution imagery;
- dense tables or lists;
- empty optional fields;
- multilingual text and unsupported glyphs;
- print-safe margins, bleed, and crop marks when requested;
- hyperlinks, citations, credits, and source notes;
- a restrained fallback when a brand font or asset is unavailable.

Never hide missing content behind filler copy or decorative pages.

## Render, inspect, and iterate

Read [quality-gate.md](references/quality-gate.md) before final delivery.

1. Generate the latest PDF from the editable source.
2. Check file metadata, page count, dimensions, embedded fonts when available, and text extractability.
3. Render every page to images at a useful inspection resolution.
4. Inspect full pages for hierarchy and sequence, then inspect at full size for clipping, overlaps, broken glyphs, weak images, awkward line breaks, and inconsistent alignment.
5. Verify page numbers, contents links, external links, citations, image credits, and section transitions.
6. Correct defects in the source, rebuild, and inspect the new render.

Do not deliver a PDF that was only compiled or text-extracted. Visual verification is mandatory.

## Output

Provide:

- the final verified PDF;
- the editable source and required assets;
- a brief art-direction statement;
- the checks actually performed;
- any placeholders, licensing limits, accessibility limits, or unresolved factual gaps.

When auditing an existing PDF, lead with the highest-impact content, structure, typography, image, navigation, accessibility, and production issues. Preserve what is already distinctive and effective.

## Example prompts

- “Use $premium-pdf-design to turn these notes into an art-directed travel guide.”
- “Redesign this proposal as a polished editorial PDF without changing the claims.”
- “Create a premium event booklet with an editable source and verify every page.”
