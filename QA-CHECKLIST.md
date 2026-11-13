# QA Checklist — staging build

## PRE-PUBLISH BLOCKERS (hard)
- [ ] Real Whop checkout URL set; one-time $24.97 USD plan created; purchase + delivery test done
- [ ] Legal review of `privacy-policy.html` and `refund-policy.html` (implemented from supplied drafts, NOT approved); set `LEGAL_EFFECTIVE_DATE`; see `LEGAL_REVIEW_CHECKLIST.md`. No Terms of Service page by design.
- [ ] Contact form delivery configured (`RESEND_API_KEY`, `CONTACT_FROM` on the host) and a real test message received at the support inbox (see README, "Contact form")
- [x] Previews (Assets 02 A/B, 03 A/B): owner confirmed they were checked and exported from Gamma screenshots; the on-page QA notice was removed.
- [ ] Section 2 categories (chicken, seafood, beef, vegetarian, cakes, cookies, fruit desserts, frozen treats) confirmed in the final books
- [ ] U.S. measurements confirmed → then restore benefit #3 ("Familiar U.S. measurements.") and FAQ Q6. Currently the neutral variant is live and Q6 is omitted.
- [ ] Delivery/access FAQ copy verified after a real Whop test (file type, timing)
- [ ] Domain, canonical, og:url, og:image; remove noindex tags; approved business name in footer
- [ ] Disclosure review for the fictional-character presentation (Sarah Miller)

## Pricing & purchase-benefit blockers (added with the $35.67 / 30% OFF presentation)
- [ ] **Reference price $35.67 / "30% OFF" must be a genuine, supportable offer** before launch (e.g. a real list price or a real, honestly described introductory discount). It must not be presented as a price previously charged unless that is true. Check U.S. FTC/state reference-pricing rules. The page shows no wording like "was" or "limited time".
- [ ] 30-day money-back guarantee configured and honored in Whop; Refund Policy page and FAQ answer must say the same thing (the FAQ links to `/refund-policy`).
- [ ] "Instant access to your digital cookbook" verified with a real Whop delivery test (and the FAQ "How do I receive my cookbook?" kept consistent).
- [ ] Whop plan priced exactly $24.97 USD one-time. Displayed pricing lives in `SITE_CONFIG.PRICING` (display only; nothing is calculated or sent to checkout). The static HTML holds the same values.
- Note: the hero no longer says "No physical book shipped"; "digital cookbook" remains in the hero, the box, the offer panel and FAQ #1.

## Assets used
| Alias | Exact source file | Section | Ratio | Status |
|---|---|---|---|---|
| hero-transparent | Asset 01 A — Mockup 3D da capa principal fundo transparente.png | Hero (all sizes) | 792×990 | Real alpha channel; clean edges checked over navy and cream |
| hero-portrait / hero-square | Asset 01 A / C — Mockup 3D da capa principal.png | not used since the transparent hero | 792×990 / 1024×1024 | Kept as originals, no longer referenced |
| tablet-meal / tablet-dessert | Asset 02 — A / B Mockup do livro… | Inside | 4:3 | Checked by owner (Gamma export) |
| preview-meal / preview-dessert | Asset 03 — A / B … | Inside | 1344×752 | Checked by owner (Gamma export) |
| sarah-portrait | Asset 04 — Retrato da Sarah Miller.png | Meet Sarah | 3:2 | OK (object-position 50% 30% on mobile crop) |
| meal-feature / dessert-feature | Asset 05 — 1 Lemon-Oregano… / Asset 05 —  86 Strawberry Banana Nice Cream.png | Collections | 16:9 | OK, uncropped |
| gallery-meal-1..3, gallery-dessert-1..3 | Asset 05 — 028 / 52 / 62 / 87 / 96 / 97 | Gallery | 16:9 | OK, uncropped |

Reserved, never rendered: Assets 06, 07 (×4), 08, 9 foto1–4, 10 (three-book bundle). Verified by grep: none is referenced in HTML/CSS/JS.

## Verified so far (actually run)
- ZIP extracted: 26 PNG, all RGB, no alpha; both hero variants inspected visually — cream surround, no checkerboard.
- Local server render at 320, 390, 768, 1280, 1440px: no horizontal overflow; no broken images; hero variant switches correctly (square <900px, portrait ≥900px). Spot-checked visually at 390 (hero, Inside, Meet Sarah, offer) and 1280/1440 (hero, gallery 3×2, offer panel).
- With empty `WHOP_CHECKOUT_URL`, all 4 purchase buttons are disabled; with a test `https://whop.com/...` URL all 4 became anchors and the pending note hid (config then restored to empty).

## Visual refinement pass (density) — measured
Backup of pre-refinement files: `../_backup_sarah_pre_refinement/` (outside the site folder).
| Viewport | Doc height before → after | Hero CTA position (top of page) |
|---|---|---|
| 390 mobile | 10,480 → 6,128 px | y 1016 → 561 |
| 1440 desktop | 8,360 → 5,676 px | visible in first 900px screen (y 622) |
After-refinement overflow check (no horizontal scroll): 320, 360, 390, 428, 768, 1024, 1440.
Rails (gallery, Inside previews) are horizontal scroll-snap on <640px and become grids above; the scroller gets `tabindex=0` only while it overflows. Preview collages link to the full-size WebP for readability.
The preview QA notice was removed after the owner confirmed the previews are checked Gamma exports. Not provided in the folder: "análise do site" PDFs, so before/after comparison used live measurements, not those captures. Competitor PDFs (REF SITES.zip) were not opened.

## Not yet run / still to do
- [ ] Remaining widths (360, 375, 428, 1024, 1920) and a full visual pass of every section
- [ ] Keyboard-only pass, FAQ toggling, screen-reader labels
- [ ] Lighthouse / axe (not run; no scores claimed)
- [ ] Valid Whop URL → buttons become anchors (test with a real URL)
- [ ] Slow-network check
