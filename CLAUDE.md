# JRT — Jersey Round Table Website

Project context for the Jersey Round Table site build.

---

# Design Research — Jersey Round Table site

Working assumption: `JRT` = Jersey Round Table, a chapter under [Round Table Great Britain & Ireland](https://www.roundtable.co.uk). It is listed as a member of the Association of Jersey Charities but I couldn't confirm an existing standalone site for the Jersey chapter.

---

## 1. The parent brand — Round Table GB&I

Strong starting point, but limitations to be aware of.

**Brand assets you'll likely inherit / align with:**
- **Logo:** 2024 refresh — wordmark with a stylised "T".
- **Palette:** Bold **yellow** + **dark navy/near-black**, white space heavy. High-contrast, energetic.
- **Type:** Modern sans-serif, large declarative headings ("DO MORE WITH ROUND TABLE").
- **Tone:** Aspirational, inclusive ("Make new friends"), service-focused.

**Strengths of the parent site to inherit:**
- Clear value proposition repeated through the page.
- Statistics as social proof (3,000 members · 300 clubs · £4M raised · 160k volunteer hrs).
- "Table Finder" geo-lookup pattern.

**Weaknesses to *not* inherit:**
- CTAs are text-styled, not visually distinct buttons.
- Light on real photography — mostly logo/graphic placeholders.
- No testimonials / member stories.
- Magazine archive (2021→) feels neglected.
- Footer-buried social icons.

---

## 2. Best comparables to study

| Site | Why it's worth borrowing from |
|---|---|
| [Rotary International](https://www.rotary.org/en) | Gold-standard service-org site. "People of Action" hero, impact metrics, cause-driven nav, segmented audiences (prospective / current / donors). Replace lifestyle photos with thematic icons + data viz for credibility. |
| [WaterAid](https://www.wateraid.org/) | Hero video + storytelling + hard stats + clear donation CTAs with "what £X buys" — pattern any charity/membership site benefits from. |
| [Farm Africa](https://www.farmafrica.org/) | 2025 Webby nominee — scroll-driven hero zoom focusing on the word "solution". Editorial polish without being heavy. |
| [The Obama Foundation](https://www.obama.org/) | Bold hero banner + video, exceptional typography hierarchy. |
| [Awwwards Nonprofit Collection](https://www.awwwards.com/awwwards/collections/nonprofit-websites/) | Curated reference set — bookmark this. |
| [Numiko: Best non-profit sites 2026](https://numiko.com/insights/the-best-non-profit-websites-2026) | Excellent annual roundup with critique. |
| [25 Membership Site Examples 2026](https://joinit.com/blog/membership-site-examples) | Specifically community/membership patterns. |

I'd also point you at **regional Round Table chapter sites** (Henley, St Albans, Guildford etc. — search `"<town> round table" site:roundtable.co.uk`) to see what other chapters typically do well/badly. Most are quite tired — there's an opportunity to make Jersey's stand out.

---

## 3. Best-practice patterns for this kind of site

Service-club + charity + members club is a three-in-one audience problem. Solve each entry path explicitly:

**a) Hero**
- One sentence that says *what RT is, who it's for, and why it matters in Jersey* — not a generic GB&I rehash.
- Background: real photo or short looping video of a Jersey event (charity bash, beach clean, bonfire night, Battle of Flowers float).
- Two CTAs side-by-side: **"Join us"** (primary, yellow) and **"What we do"** (secondary, navy outline).

**b) Three-track navigation**
Cribbed from Rotary — segment audiences immediately:
- *Thinking of joining?* — eligibility, what membership looks like, social calendar.
- *Need help / a charity grant?* — application path for local causes.
- *Existing members* — login / events / inner pages.

**c) Proof block**
Localised stats — "£X raised for Jersey causes since YYYY · N events this year · N members". Specific is more persuasive than generic.

**d) Stories, not slogans**
Two or three short member testimonials with faces and names. Single biggest credibility lever a service-club site can pull, and the parent site fails at this.

**e) Events / calendar**
The thing most chapter sites get wrong. Treat it as the *primary* recurring reason a member or prospect returns. Calendar feed (ICS) + Eventbrite-style page per event.

**f) Charity application path**
If Jersey RT funds local causes, give the application a real page — what you fund, criteria, how to apply, recent grants. Demonstrates impact without bragging.

**g) Brand discipline**
- Yellow (RT brand) used *sparingly* — for CTAs and accents only, not large blocks. Big yellow flats date fast and reduce CTA salience.
- Navy + warm off-white background. Add one secondary accent (a warm coral or sea-green nods to Jersey without being twee).
- Editorial sans for body (Inter / Söhne / GT America). Display serif or geometric sans for hero (e.g. Söhne Breit, Tiempos, GT Sectra).

**h) Non-negotiables given your CISO lens**
- Static-first stack (Astro / Next.js static export) — minimal attack surface.
- Members area, if any, behind a real auth provider (Clerk / Auth0), not bolted-on.
- CSP, HSTS, SRI for any third-party scripts. No Facebook pixel without a reason.
- Forms hit a serverless function with rate limiting + a honeypot or Turnstile — not mailto links.
- All images served as AVIF/WebP with proper alt text. Hit all three Core Web Vitals (see §7), not just LCP.

---

## 4. Recommended direction

A modern, photo-led, editorial site — *not* a brochure clone of roundtable.co.uk. Closer in spirit to a small charity site (WaterAid energy, Rotary credibility) than to a clubby members site. Use the parent brand's yellow/navy but with restraint.

Stack suggested given the project size and preferences:
- **Astro** (content collections for events/stories/grants) + **Tailwind**.
- **Decap CMS** or **Sanity** if non-technical committee members need to update content.
- **Cloudflare Pages** hosting (free, fast, CSP-friendly).
- **Resend / Postmark** for the contact form backend via a Cloudflare Worker.

---

## 5. Design system tokens (starter set)

Pick once, reuse everywhere — stops AI-generated CSS from drifting.

**Colour** (OKLCH for perceptual uniformity; hex for tooling that doesn't speak OKLCH yet)
- `--rt-yellow` `#FFCD00` / `oklch(0.85 0.17 96)` — primary CTA, accents only, never large blocks
- `--rt-navy`   `#0B1F3A` / `oklch(0.23 0.06 260)` — headings, body text on light bg, secondary CTA outline
- `--rt-paper`  `#FAF7F2` / `oklch(0.97 0.01 90)` — warm off-white background (not pure `#FFF` — easier on the eye)
- `--rt-ink`    `#111418` / `oklch(0.16 0 0)`   — body text on paper
- `--rt-mute`   `#5B6471` / `oklch(0.50 0.02 250)` — secondary text, metadata
- `--rt-sea`    `#3B7A78` / `oklch(0.51 0.08 195)` — Jersey-nod accent, used sparingly
- Semantic success/warning/danger as needed — muted, not bright system reds/greens.

Every foreground/background pairing must clear **4.5:1** (body) or **3:1** (large text + UI components) — WCAG 2.2 AA. Yellow on white fails; yellow needs navy text on it.

**Typography**
- Body: 17–18px desktop, 16px mobile. Line-height 1.55–1.6. Measure 60–75ch.
- Fluid scale (1.25 ratio, `clamp()` so it scales without media queries):
  - h1 `clamp(2.25rem, 1rem + 4vw, 4rem)`
  - h2 `clamp(1.75rem, 1rem + 2.5vw, 2.75rem)`
  - h3 `clamp(1.35rem, 1rem + 1.5vw, 1.75rem)`
- Variable fonts only (one file, multiple weights). `font-display: swap`, `<link rel="preload">` the hero weight, `size-adjust` the system fallback to minimise CLS on swap.

**Spacing** (4px base) — `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128`. No freelance `13px` margins.

**Radii** `0 / 4 / 8 / 16 / full`. Buttons + inputs `8`. Cards `12–16`.

**Shadows** two only — `sm` (subtle hover lift) and `md` (card). No heavy drop shadows.

**Container** content max ~1200–1280px. Prose max ~70ch (~640px).

---

## 6. Accessibility (WCAG 2.2 AA — non-negotiable)

A charity site that excludes disabled users is failing its own mission. Treat this as load-bearing, not a polish task.

- **Contrast** 4.5:1 body, 3:1 large text and UI/icons.
- **Keyboard** every interactive element reachable by Tab in logical order. Visible `:focus-visible` ring — never `outline: none` without a replacement.
- **Skip link** "Skip to main content" as the first focusable element.
- **Semantics** real `<button>`, `<a>`, `<nav>`, `<main>`, `<article>`. ARIA only when HTML can't express it.
- **Forms** every input has a real `<label>`; errors announced via `aria-live="polite"`; `autocomplete` attrs on name/email/tel/postal.
- **Motion** wrap non-essential animation in `@media (prefers-reduced-motion: reduce)`.
- **Images** meaningful alt text; `alt=""` for purely decorative. For member photos describe the context, not "person smiling".
- **Touch targets** 44×44px minimum (WCAG 2.2 SC 2.5.8).
- **Validate** axe DevTools + Lighthouse + a keyboard-only walkthrough before ship. Spot-check with VoiceOver (already on the M2).

---

## 7. Performance budget (Core Web Vitals)

Aim for "good" thresholds. INP replaced FID in March 2024 — it's the one most sites still miss.

- **LCP** < 2.5s — hero image AVIF, preloaded, with explicit `width`/`height`.
- **INP** < 200ms — keep main-thread work small, defer non-critical JS.
- **CLS** < 0.1 — reserve space for images, embeds, fonts.
- **JS budget** < 100KB compressed on first load. Astro defaults to zero JS — keep static pages static; island-hydrate only what's interactive.
- **Images** AVIF first, WebP fallback; `srcset` at 640/960/1280/1920; `loading="lazy"` below the fold, `fetchpriority="high"` on the LCP image.
- **Fonts** subset to Latin; preload the hero weight only; `size-adjust` on the fallback.

---

## 8. SEO, metadata & schema

Cheap, high-leverage wins for a charity site — and they help local discovery in Jersey.

- **Per-page** unique `<title>` (≤60 chars), `<meta description>` (≤155 chars), canonical URL.
- **OG + Twitter cards** every page has a 1200×630 OG image. Generate per event/story at build time (Satori works well with Astro).
- **Schema.org JSON-LD**
  - Site: `Organization` (or `NGO`) — logo, sameAs (socials), location.
  - Events: `Event` — location, start/end, organiser. Earns Google rich results.
  - Stories: `Article` — author + datePublished.
- **Sitemap** auto-generated, submitted via Search Console. `robots.txt` allows crawling, disallows `/admin`, `/api`.
- **Local SEO** "Jersey", "Channel Islands" naturally in H1s and meta. Embed location on contact page.

---

## 9. Privacy, analytics & cookies (CISO lens)

Default to zero cookies — removes the cookie-banner UX problem entirely and signals trust to a security-conscious audience.

- **Analytics** Plausible or Fathom (cookieless, GDPR/PECR-friendly, no banner needed). Self-host Plausible on OpenClaw if you want to dogfood your infra.
- **No** Google Analytics, Meta Pixel, Hotjar, Intercom — each one triggers a banner, leaks data, and bloats the CSP.
- **Embeds** YouTube, Maps, etc. loaded via click-to-load shim — never on initial page load.
- **Forms** explicit consent checkbox if you'll email people back; retention statement linked to a real privacy policy. Channel Islands GDPR via the **Jersey Office of the Information Commissioner** applies — not UK GDPR.
- **Headers** `Strict-Transport-Security`, strict `Content-Security-Policy` (no `unsafe-inline`), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera/mic/geo by default.

---

## 10. Component inventory (build once, reuse everywhere)

- **Button** — primary (navy text on yellow), secondary (navy outline), ghost (text-only, underline on hover). All three with `:hover` / `:focus-visible` / disabled / loading states.
- **Card** — image + meta + heading + body + optional CTA. One radius, one shadow, one padding token.
- **Nav** — top bar, logo left, primary links right; mobile = bottom-sheet drawer, not a full-screen hamburger overlay.
- **Event card** — date chip (day + month), title, location, "Add to calendar" emitting `.ics`.
- **Form input** — label above, helper text below, error state inline with icon, `aria-invalid` + `aria-describedby` wired.
- **Empty state** — small illustration + headline + one CTA. Never a blank page.
- **Loading state** — skeleton, not spinner, for content-shaped waits. Spinner only for sub-1s actions.
- **Error state** — friendly tone, what happened, what to do next, contact link.

---

## 11. Motion

- **Durations** 150–200ms for micro (hover, focus), 300–400ms for content transitions, 500–700ms only for hero / scroll-driven storytelling.
- **Easing** `cubic-bezier(0.32, 0.72, 0, 1)` (out-quint) for entering UI; `ease-out` for hover. Never `linear` for visual motion.
- **View Transitions API** — Astro ships this; gets you soft cross-fades between pages with one line. Feels premium for almost no cost.
- Respect `prefers-reduced-motion: reduce` everywhere. Wrap, don't strip — swap movement for opacity.

---

## 12. Dark mode — open question

Recommend **light-only for v1**:
- Charity sites are read in daytime / on shared screens; warm-paper light theme reads as friendly and trustworthy.
- Halves the visual testing surface for a solo builder.
- Revisit if analytics show users on dark-mode systems bouncing.

If you do add it later: use `[data-theme]` (so users can override) rather than `prefers-color-scheme` alone, and re-test all contrast pairings in both modes.

---

## Sources

- [Round Table Great Britain & Ireland](https://www.roundtable.co.uk)
- [Round Table International — the organisation](https://round-table.org/the-organisation/)
- [Association of Jersey Charities](https://www.jerseycharities.org/)
- [Rotary International](https://www.rotary.org/en)
- [Numiko — Best non-profit websites 2026](https://numiko.com/insights/the-best-non-profit-websites-2026)
- [Awwwards Nonprofit Collection](https://www.awwwards.com/awwwards/collections/nonprofit-websites/)
- [JoinIt — 25 Membership Site Examples 2026](https://joinit.com/blog/membership-site-examples)
- [SiteBuilderReport — 20+ Membership Websites 2026](https://www.sitebuilderreport.com/inspiration/membership-websites)
- [WCAG 2.2 (W3C Recommendation)](https://www.w3.org/TR/WCAG22/) — the accessibility bar referenced in §6
- [web.dev — Core Web Vitals (LCP / INP / CLS)](https://web.dev/articles/vitals) — performance targets in §7
- [Schema.org — Event](https://schema.org/Event) and [Organization](https://schema.org/Organization) — for §8 JSON-LD
- [Jersey Office of the Information Commissioner](https://jerseyoic.org/) — Channel Islands data protection guidance for §9
