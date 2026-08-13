# BlueGrid Hero Specification — THE DUET HERO

Technical Director's unified direction, synthesized from the Art Direction report (image research: 43 verified queries across Pexels / Openverse / Wikimedia / Unsplash; Pixabay blocked automated access) and the UX / Motion Direction report. Status: **approved direction, ready for an implementation pass.** No code exists yet for this hero; the current Ken Burns hero remains live until this replaces it.

---

## 1. The verdict

**Imagery:** No stock pair passes as the same Appalachian property before and after mulching — the best pure-stock pair capped at 7.5/10, and its "after" is portrait-orientation (unusable wide). The winning move is the Art Director's Workflow #1: **manufacture the hero from the client's own utility-corridor pair** (`workJacksonOH.jpg` → `work2JacksonOH.jpg`), which contain **the same transmission tower in both frames** — a truth cue no stock combination can offer. The tower is the registration pin of the entire illusion.

**Motion:** The UX Director's **Duet Hero** pattern (*Claim & Clear*) is adopted in full: line 1 "TAKE BACK" fixed forever; line 2 a human-typed rotating claim; image transformations ride the deletion beats; the estimate mini-form is a protected, permanently still conversion anchor.

**One sentence:** *Typing is claiming, deletion is clearing — and the land answers over the client's own corridor.*

---

## 2. Image production workflow (exact steps)

Source plates: `graphics/images/workJacksonOH.jpg` (BEFORE — overgrown corridor) and `graphics/images/work2JacksonOH.jpg` (AFTER — cleared corridor), both 2048×1536. *(Renamed from `work.jpg` / `work2.jpg` on 2026-08-13 when the project photos gained their location suffixes; same files, byte for byte.)*

1. **Register.** Crop both to 16:9-safe frames (target 4096×2304 after upscale) with the transmission tower at the **same x-position (~38% from left)** and the horizon on the **same line (upper third)**. The tower must not move a pixel between states.
2. **One sky.** Copy the AFTER frame's cleaner sky into BOTH frames. A shared sky is the strongest "same day, same place" cue.
3. **Clean the AFTER** (Photoshop Generative Fill / Firefly — commercially safe licensing): remove the muddy foreground, even out the harsh midday light, add low green regrowth across the cleared corridor so the result reads *inviting ground*, not raw dirt.
   - **Truthfulness guardrail:** generative edits may enhance what happened (light, regrowth, sky) but must not fabricate outcomes that didn't (no added structures, food plots, or features not on this property). The corridor was genuinely cleared by BlueGrid; keep it that way.
4. **Grade as one world.** Normalize both to ~5600K. BEFORE: pull 150–200K cooler, desaturate greens toward olive (foreboding). AFTER: push +200K warmer, +10 vibrance in greens/earth tones (invitation). Same curve family — diverge only in temperature and vibrance.
5. **Upscale** both plates 2× (Topaz / Real-ESRGAN) to ~4096 wide.
6. **Unify at the container, not the image:** ONE film-grain layer and ONE gentle vignette live on the hero container *above* the cross-transition — never per-image, or grain "pops" at every transformation.
7. **Export** WebP q80 at 2560 and 1920 widths (desktop), plus a ~1200-wide vertical-crop pair for mobile that keeps the tower in frame. Both states in each size must share identical pixel dimensions.

Effort ~3–6 hrs, tooling ~$25/mo. Quality ceiling: 9/10.

**Standing upgrade path (supersedes these plates when available):** on the next suitable job, the owner locks a phone-tripod position with ground markers and shoots matched horizontal before/after frames at golden hour. That real pair (10/10) drops into the same slots with zero motion rework.

**Stock fallback** (only if the client rejects using their own corridor): Pexels pair `33266525` (weedy abandoned field) → `59517` (gravel pasture lane), both Pexels License, HEAD-verified — requires the same-sky composite treatment and will never out-convert the tower.

---

## 3. Final motion timeline (authoritative)

The UX Director's timeline is adopted; the Art Director's shorter holds are superseded. One merge: the forward sweep travels **left→right along the corridor's uphill diagonal** — reading simultaneously as light moving across the land and as the mulcher's actual path, and delivering the eye to the form card.

### Entrance (first paint → 5.3 s)

| ms | Event |
|---|---|
| 0 | BEFORE visible (LCP asset). Constant left scrim in place. Form card runs its one `slideRight` entrance; never animates again. |
| 200 | Kicker fades up. |
| 400–1,000 | "TAKE BACK" clip-reveal (600 ms). |
| 1,050 | Cursor fades in on empty line 2; blinks once. |
| 1,450–2,900 | Types "your property." (~85 ms/char, one 250 ms mid-word hesitation). |
| 2,900 | **Ignition:** the period lands → forward light-sweep begins (1,600 ms, entrance-only duration). |
| 4,300 | Primary CTA fades in (500 ms); secondary +120 ms. Into pre-reserved space. |
| 4,500 | AFTER settled. **Transformation proven < 5 s.** |
| 5,300 | Trust stats fade up. Steady-state begins. |

### Steady-state stanza (repeats; ~16.3 s each; 3-stanza super-loop ≈ 49 s)

| t (ms) | Headline | Image |
|---|---|---|
| 0–1,450 | Type phrase A (problem-claim) | BEFORE holds (1.5% slow scale drift) |
| 1,450–3,850 | Hold 2,400 | BEFORE |
| 3,850–4,500 | Delete (tap, tap, then key-repeat) | **Forward sweep fires (1,400 ms)** |
| 4,500–5,050 | Empty-line breath (550 ms) | Sweep midpoint lands in the silence |
| 5,050–9,250 | Type phrase B + hold 2,400 | AFTER |
| 9,250–10,450 | Delete + breath | AFTER persists |
| 10,450–15,100 | Type phrase C + stanza-final hold 3,200 | AFTER |
| 15,100–16,300 | Delete + breath | **Reverse luminance dissolve (1,800 ms)** — dusk, not un-mulching |
| 16,300 | Next stanza types | BEFORE settles under the first keystrokes |

**Transition grammar:** forward = feathered directional light-sweep (edge ≈ 18% frame width, faint warm bloom, luminance-led — never a hard seam, never resembling a slider). Reverse = plain slow dissolve. *Work has direction; memory doesn't.*

**Phrase stanzas (fixed sequence):**
- Stanza A: your property. → your hunting land. → your trails.
- Stanza B: your pasture. → your food plots. → your homesite.
- Stanza C: access to your land. → your weekends. → your freedom. *(super-loop rests on "your freedom." over reclaimed land at the longest hold)*

Problem-claims type over BEFORE; enjoyment-claims type over AFTER. AFTER out-dwells BEFORE ≈ 2:1.

### Micro-timing

| Parameter | Value |
|---|---|
| Typing | 70–110 ms/char, Gaussian jitter ~85 ms; +30 ms after spaces; one 180–350 ms hesitation per phrase |
| Deletion | 2 discrete backspaces ~95 ms, then key-repeat ~38 ms/char |
| Holds | 2,400 ms standard; 3,200 ms stanza-final |
| Empty-line breath | 550 ms (transformation midpoint anchor) |
| Cursor | 530 ms/phase blink, 120 ms soft edge fades; solid while typing/deleting; resumes blinking ~350 ms after last keystroke |
| Bar cursor | thin vertical bar ~3 px, sky blue, faint glow — never a block, never a pipe character |

---

## 4. Layout, typography, contrast

- Two-column architecture retained. Left ≈ 55–60%: kicker → TAKE BACK → typed line → **one** short support line (trim the current 4-line paragraph; the duet now does its work) → CTAs → stats. Right ≈ 35–40%: the estimate mini-form, untouched.
- "TAKE BACK": Barlow Condensed 700, uppercase, near-white, fluid ~44→84 px, tracking +1–2%.
- Typed line: Barlow Condensed 500, lowercase as authored, sky blue #5B9BD5, ~0.82× line 1.
- **Anti-jitter law:** typed line lives in a fixed-height, left-aligned reservation sized to the longest phrase ("access to your land."). Two line-heights reserved at narrow viewports. Nothing below the headline ever moves with phrase length.
- **Scrim:** constant brand-charcoal left gradient (strongest under the text block, feathered out) tuned so the sky-blue typed line holds ≥ 4.5:1 against the worst frame of either image and every mid-transition frame. (TD ruling: brand charcoal `#101214`-family, not the Art Director's proposed green-black — one palette, sitewide.) Plus one tight dark text-shadow.
- **Retire the dust-particle layer in this hero** — the duet is the motion budget.
- The existing topo SVG accent may stay at very low emphasis.

## 5. Interaction contracts

- **Form quiet zone:** luminance under the card never shifts > ~10%; no animated element originates/terminates within 24 px of it; the card animates exactly once (entrance) and never again; zero layout shift anywhere, ever.
- **Slow connection:** transformations never fire against an unloaded plate — holds extend invisibly until the asset arrives. If BEFORE itself is late, the hero runs as a typographic hero over the charcoal gradient with full dignity.
- **Scroll-away / tab-unfocus:** pause the loop below ~1/3 visibility or on blur. Typing may freeze anywhere (a blinking resting cursor is natural); an in-flight image transition always completes first. Resume after a 400–600 ms breath, never instantly.
- **Reduced motion (dignified fallback):** composed still — AFTER as the base (sell the outcome), small bordered BEFORE inset bottom-left captioned "Before", line 2 set statically to "your property." with a solid non-blinking cursor bar. Everything present immediately, no choreography.

## 6. Why (one line each — full rationale in the UX report)

- Transformation = the product demo; without it the hero is a claim, with it it's evidence.
- Typed line = converts a service into a possession; nine buyer identities each hear their own reason.
- Fixed "TAKE BACK" = the spine; one thing must never change or the hero is a slot machine.
- Deletion-coupling = the cause-and-effect illusion that makes it one experience, not two loops.
- Cursor = the heartbeat that certifies the typing as human.
- CTA delay = problem, promise, proof, *then* ask (the form is visible from 200 ms regardless).
- Still form = surrounded by a living scene, the motionless object reads as solid ground — the exit from the show.

## 7. Reusable pattern registration — Nulo Studio

**Pattern: THE DUET HERO (Claim & Clear).** Swap variables per project: `imageStatePair`, `phrasePool + stanzaMap`, `brandAccent + scrimRecipe`, `timingScale` (global multiplier, default 1.0), `forwardTransitionFlavor` (light-sweep default), `conversionAnchor`. Pattern law that always travels: transformation rides deletion; entrance fires once on sentence completion (< 5 s proof); AFTER out-dwells BEFORE ~2:1; the anchor never animates; reduced motion gets the composed still, never a blank.

## 8. Implementation acceptance criteria (for the build pass)

- [ ] Transformation visibly completes within 5,000 ms of first paint on a mid-range connection.
- [ ] Tower position identical in both plates; no visible jump at any transition frame.
- [ ] No layout shift from typing, CTAs, or image swaps (CLS 0 in the hero).
- [ ] Form card luminance delta ≤ ~10% across all states; card never re-animates.
- [ ] Typed-line contrast ≥ 4.5:1 on worst-case frames.
- [ ] Loop pauses off-screen and on tab blur; transitions never freeze mid-flight.
- [ ] Reduced-motion serves the composed still with BEFORE inset.
- [ ] All 9 phrases sequenced per stanza map; super-loop rests on "your freedom." over AFTER.
