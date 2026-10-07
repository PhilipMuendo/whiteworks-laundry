# Whiteworks: commercial laundry website

A cinematic, single-page marketing site for a commercial laundry and linen service.
**Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lenis**, plus a hand-written WebGL linen shader.

> "Whiteworks" is a placeholder brand. Every client-specific value lives in **`config/site.ts`**.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

---

## Replacing content (client handover)

| What | Where |
|---|---|
| Name, wordmark, logo, URL | `config/site.ts` → `name`, `wordmark`, `logo`, `url` |
| Phone, email, address, hours | `config/site.ts` → `contact` |
| Brand colours (ink, bone, ash, **one accent**) | `config/site.ts` → `brand` (injected as CSS variables) |
| Statistics | `config/site.ts` → `stats` |
| Industries, services, process steps | `config/site.ts` → `industries`, `services`, `process` |
| Case studies & testimonials | `config/site.ts` → `caseStudies` |
| Quote form options | `config/site.ts` → `quote` |
| SEO title/description/keywords | `config/site.ts` → `seo` |
| Photography | `assets/images/`; see `IMAGES.md` |

### Placeholders
Demo statistics and case studies carry `placeholder: true`. While any are present the site shows
small, honest "Demo figure" / "Illustrative · placeholder" labels. Replace the value, remove the flag,
and the label disappears. **Do not launch with placeholder figures.**

### Photography
All images are graded stock placeholders, chosen to avoid laundromat clichés. Swap in the client's own
plant photography (same filename = no code change). Run new photos through
`python scripts/grade.py <raw> assets/images` to keep the monochrome grade consistent.

### Quote delivery
`app/api/quote/route.ts` validates briefs server-side (with a honeypot for bots). Set
`QUOTE_WEBHOOK_URL` (Zapier / Make / Slack / CRM) to forward each brief as JSON. Without it, briefs are
only logged to the server console.

---

## The page, section by section

| # | Section | Idea |
|---|---|---|
| 00 | **Hero** | A real-time WebGL sheet of linen drifts through a dark plant. "BEHIND" sits literally behind the cloth. On scroll the words part, the camera pushes into the fabric and the sheet *becomes* the page. |
| 01 | **Clean at scale** | Editorial composition; statistics roll in on mechanical odometers. |
| — | **Claims strip** | Two scroll-linked rows of brand lines drifting in opposite directions. |
| 02 | **Who we serve** | Pinned chapter sequence: each industry's photograph opens like an aperture over the last. |
| 03 | **Services** | Oversized typographic index. Hover floods the section to ink; the photo trails the cursor and skews with velocity. Touch: rows expand. |
| 04 | **From dirty to ready** | Horizontal run through seven stations. An orange garment tag rides one continuous line from a dark "soiled" zone into a bone "clean" zone; all type inverts automatically. Vertical on mobile. |
| 05 | **This is what scale looks like** | Pinned dolly-in through a constellation of plant photographs. |
| 06 | **Engineered for consistency** | Spec-sheet layout: dimensioned drum drawing + six self-drawing line diagrams. |
| 07 | **Case studies** | Full-screen editorial spreads that stack over one another. |
| 08 | **Quote** | Conversational 5-step brief; answers assemble into a sentence as you go. Keyboard: 1–6 to pick, Enter to continue. |
| 09 | **Finale** | "You run the business. We'll run the laundry." over the linen, now at rest. |

## Architecture

```
app/            layout (fonts, metadata, JSON-LD), page, api/quote, sitemap, robots, OG image, icon
components/     one file per section + LinenCanvas (WebGL) + ui/ (Reveal, Magnetic, Arrow)
config/site.ts  all client content
lib/            smooth scroll (Lenis + MotionConfig), media/viewport hooks, utils
assets/images/  graded photography (statically imported → blur placeholders, responsive sizes)
scripts/        grade.py (photo grading)
```

## Performance & accessibility notes
- WebGL linen is raw WebGL (no three.js); it renders only while on screen and the tab is visible, caps DPR, and falls back to a photo.
- Images are statically imported (`next/image`): responsive `sizes`, WebP, lazy by default, blur placeholders.
- `prefers-reduced-motion`: Lenis off, Motion transforms skipped, horizontal/zoom sequences replaced by static layouts, WebGL frozen.
- Semantic landmarks, one `h1`, labelled sections, skip link, visible focus, focus-trapped mobile menu (Esc closes),
  native radio/checkbox inputs in the quote flow, live regions for changing content.
- Homepage is statically prerendered; only `/api/quote` is dynamic.
