# Hero Image Plates — BlueGrid Duet Hero

Production record for the four hero plates, built from the client's own utility-corridor
pair per `docs/heroDirection/heroSpecification.md` §2. The transmission tower present in
both source frames is the registration pin: it does not move between states.

Sources: `graphics/images/work.jpg` (BEFORE, overgrown corridor, 2048x1536) and
`graphics/images/work2.jpg` (AFTER, cleared corridor, 2048x1536).

---

## Plates

| File | Size | State |
|---|---|---|
| `heroBefore1920.jpg` | 1920x1080 | BEFORE, graded cool |
| `heroAfter1920.jpg` | 1920x1080 | AFTER, graded warm |
| `heroBefore2560.jpg` | 2560x1440 | BEFORE, graded cool |
| `heroAfter2560.jpg` | 2560x1440 | AFTER, graded warm |

JPEG quality 82, System.Drawing HighQualityBicubic resample. Both states in each size
share identical pixel dimensions (spec §2.7).

## Crop boxes (source pixels, both 16:9 at identical scale)

| Plate | Source | Crop x, y, w, h |
|---|---|---|
| BEFORE | work.jpg | 0, 50, 1536, 864 |
| AFTER | work2.jpg | 335, 24, 1536, 864 |

Both crops are the same 1536x864 window because the tower's apparent size matches across
the two frames to within ~3% (cap-to-crossarm spans: 18.5 / 46 / 75.5 px vs
18.5 / 47.5 / 71 px). Upscale factors: 1.25x to 1920, 1.667x to 2560.

## Tower registration

| Measurement | work.jpg (BEFORE) | work2.jpg (AFTER) |
|---|---|---|
| Mast centerline x (source) | 403 | 737.5 |
| Cap tip y (source) | 203.5 | 177.5 |
| Crossarm bars y (source) | 222 / 249.5 / 279 | 196 / 225 / 248.5 |
| Sky/land line at tower (source) | brush crest ~338 | ridge at legs ~367.5 |

In every output plate the mast sits at **26.2% from the left** and the cap tip at
**17.8% from the top** (1920 plates: x=504, y=192; 2560 plates: x=672, y=256).
A 50/50 blend flip-test shows residual ghosting under 0.4% of frame width — within the
1% tolerance. The sky/land line sits at 33.3% height in BEFORE and 39.8% in AFTER;
that difference is the brush dropping to reveal the tower's lower half, which is the
transformation itself, not a registration error.

**Deviation from spec §2.1:** the spec targets the tower at ~38% from the left. The
source framing forces 26.2%: in work.jpg the mast is only 403 px from the left edge,
so placing it at 38% would cap the crop at 1060 px wide (a 31% resolution loss) and
pull the tall busy trees into the BEFORE's right quadrant under the form card. 26.2%
is the best position/resolution/calm-right-quadrant compromise, and it is identical in
both plates, which is the law that matters. The manual Photoshop pass can outpaint
~300 px of brush and sky onto the BEFORE's left edge if the 38% composition is wanted.

## Grade (one world, diverging only in temperature and vibrance)

Applied via ColorMatrix during the resample (NTSC luminance-weighted saturation, then
per-channel temperature scaling):

| Plate | Saturation | Red scale | Blue scale | Intent |
|---|---|---|---|---|
| BEFORE | 0.90 | 0.96 | 1.04 | cooler, gently desaturated, foreboding |
| AFTER | 1.08 | 1.05 | 0.96 | warmer, more vibrant, inviting |

Flip-verified: reads as mood/time-of-day, not as a filter.

## Notes for the Motion Engineer

- **Form card quiet zone:** measured mean luminance in the right-quadrant band
  x 62–92%, y 45–85% is BEFORE 53.3% vs AFTER 51.3% — a 2.0% delta, inside the ≤10%
  law with no help. Keep the card's vertical center in that band. If the card rises to
  y 25–80% the delta becomes 11% (BEFORE bright brush vs AFTER dark treeline) and the
  card's own backdrop must absorb it.
- **Calmest zones:** lower-right dirt/brush in both plates; the left 45% is sky, wires,
  and featureless brush/dirt — safe under the charcoal scrim and headline.
- **Power lines do not register between states** (different camera spots). The wires
  converge on the same tower in both, so under a feathered luminance-led sweep they read
  as glare shift, not error. Do not use any hard-edged wipe; the spec's 18%-wide
  feathered sweep hides this by design.
- **Secondary distant tower** is faintly visible behind and right of the main tower in
  the AFTER only (source y ~335–360). It is small and reads as depth; ignore.
- The tower in BEFORE is slightly fainter (atmospheric haze) — that is genuine distance
  light and helps the before mood; do not "fix."

## Remaining manual pass (Photoshop, per spec §2) — post-launch enhancement, NOT a launch blocker

1. **One sky:** composite the AFTER frame's cleaner sky into both plates (strongest
   same-day cue; also unifies the non-registering power lines).
2. **Generative regrowth:** remove the muddy patches, even the harsh midday light, and
   add low green regrowth across the AFTER's cleared dirt so it reads as inviting
   ground. Truthfulness guardrail: enhance only what happened — no added structures or
   features.
3. **2x upscale** (Topaz / Real-ESRGAN) to ~4096 wide, then re-export these same four
   slots plus a ~1200-wide vertical mobile crop pair that keeps the tower in frame.
4. **WebP export** at q80 for all slots (the current JPEGs are the fallback format).

Standing upgrade path (spec §2): a phone-tripod matched golden-hour pair from the next
suitable job supersedes all of the above with zero motion rework.
