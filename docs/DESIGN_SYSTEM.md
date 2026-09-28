# Design system and design process

## Design intent

Trustworthy, youthful, academically suitable. The primary visual concept is a calm editorial learning space: large left-aligned headline, an example question with its source alongside it, and generous whitespace. Initials avoid invented portraits. Thin compass orbits illustrate direction; no national flags or decorative cultural patterns are used.

## Process evidence

1. Translate requirements into visitor, student and administrator journeys (PROJECT_SPEC).
2. Prioritise collection discovery and question-to-source inspection; sketch the major layouts (WIREFRAMES).
3. Define semantic colour/type/spacing tokens below.
4. Build reusable wordmark, status badge, expert card, disclosure, answer, form and empty-state components.
5. Verify a desktop and narrow mobile rendering, filters, citations, keyboard interaction, and overflow. Record checks in VERIFICATION.

These are implementation design decisions, not claims of completed user research. Future usability testing should recruit the stated research population with consent.

## Tokens

| Token | Value | Use |
|---|---|---|
| Navy | #0B1F3A | Headings, primary actions, question example |
| Gold | #D4A72C | Accents, focus rings; dark text on gold buttons |
| Emerald | #0F766E | Source links, trust signals, emphasis |
| Cream | #FAF7F0 | Hero and learning sections |
| White | #FFFFFF | Surfaces |
| Charcoal | #1F2937 | Body text |
| Muted grey | #6B7280 | Secondary copy |
| Border | #E5E7EB | Separators and form boundaries |

Manrope headings; Inter body; next/font self-hosts fetched font assets in the build. H1 scales 34–65 px; H2 28–37 px; regular body 13–15 px. Compact metadata is smaller and never the only label for an action. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 72. Main content max width 1200 px. Cards 8–12 px radii; no glass effects or unnecessary animation.

## Interaction/accessibility

Primary action: navy fill/white text. Secondary: outline. Gold is an accent, not small body text on white. Native controls retain keyboard support. Skip link, landmarks, aria-current navigation, aria-live status, labelled inputs, visible focus rings, details/summary source expansion. Collection status uses text as well as colour. Breakpoints at 1020 and 780 px; desktop grids collapse, mobile navigation becomes a labelled menu with expanded state. Test zoom and real assistive technology before public research release.
