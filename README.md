# RagaHru — Indian Wedding Invitation Template

A cinematic, bilingual (English / ಕನ್ನಡ), mobile-first wedding invitation.
No build step, no dependencies, no framework. Drop the folder on Netlify or
GitHub Pages and it runs.

Current invitation: **Dhanusha MK & Soumya**.

---

## Run it

**Locally** — any static server, because browsers block `fetch` and some
media on `file://`:

```bash
cd ragahru-wedding
python3 -m http.server 8080
# open http://localhost:8080
```

**Netlify** — drag the `ragahru-wedding` folder onto the Netlify dashboard.
No build command, no publish directory to set.

**GitHub Pages** — push the folder contents to a repo, then Settings →
Pages → deploy from branch root.

---

## Make a new invitation

Two files hold every wedding-specific word and picture. You should never
need to open anything in `js/components/`.

### 1. `data/wedding.config.js`

Names, parents, date, venue, events, gallery, maps link, RSVP, music,
Instagram. Any value written as `{ en: "...", kn: "..." }` is bilingual —
pass a plain string instead if it reads the same in both languages.

The countdown is driven by `wedding.dateTimeISO`. Keep the timezone offset
on it (`+05:30`) so the timer is correct for guests abroad. `dateLabel` and
`timeLabel` are what people actually read, so you control the wording.

### 2. `data/content.i18n.js`

The interface strings — button labels, section headings, form errors. Edit
these only if you want different wording. Every key exists in both `en` and
`kn`; if you add a key, add it to both.

### 3. Swap the assets

Replace files in place and keep the names, or point `media` in the config at
new paths.

| Path | What it is | Supplied size |
|---|---|---|
| `assets/splash/splash-door-opening.mp4` | The doors, played on the tap | 512×1030, 5s |
| `assets/hero/hero-couple-walking.mp4` | Hero scene | 512×910, 8s |
| `assets/hero/hero-poster.jpg` | Hero fallback | 512×910 |
| `assets/sections/date/indian-temple-background.jpeg` | Shared section artwork | 711×1536 |
| `assets/couple/groom-portrait.jpeg` | Circular portrait | 244×367 |
| `assets/couple/bride-portrait.jpeg` | Circular portrait | 215×324 |
| `assets/sections/gallery/*.jpg` | Seven gallery frames | varies |
| `assets/sections/events/*-medallion.jpg` | Four ceremony medallions | 280×280 |
| `assets/sections/location/venue-placeholder.jpg` | Unused — see the location notes | 800×506 |

New artwork works best at **9:16** for the videos and the section plate.
Portraits should have the face in the upper half — the circular crop is
anchored at `object-position: 50% 32%`.

### 4. Add music

Drop your track at `assets/music/wedding-music.mp3` and it plays from the
opening tap. The control is the small gold heart at top-right, kept plain
on purpose — the jewelled piece belongs on the gate, where it is the
whole screen; up here it would only compete with the couple. While the
music plays it listens to it: a ring of gold rays round the heart rises
and falls with the track (low notes at the top, high ones round to the
foot), the heart beats with the bass, and on a strong beat a small gold
note drifts off it into the page. Paused, the rays rest as a ring of
beads; it dims if no track loads. Keep the track on the same site as the
invitation — a file served from another domain without CORS cannot be
read, so the rays then fall back to an invented rhythm rather than risk
silencing it.

### 5. Set up the location section

It reads top to bottom as a way of finding the place:

1. **The seal** — `location.image` in a round at the centre, the venue's
   name (`location.venue`) running round it in a slowly turning ring, and
   a compass bezel outside that which turns as the page is scrolled.
   **Replace the image**: it ships pointing at a decorative crop of the
   temple artwork so the section looks complete; it is not a photo of a
   real place. It is cropped to a circle from its centre, and a tap opens
   the whole photograph full-screen (`js/lib/viewer.js`), grown out of the
   circle and closed back into it.
2. `location.venue` and `location.address`, set beneath it.
3. **The live map** — `location.mapEmbedUrl`, a live Google Maps embed.
   It lies back on the page and stands up as it is scrolled to; once up,
   a gold pin drops onto its centre (the place the embed was asked for),
   rings go out from it and a route is drawn in toward it. The route is a
   flourish, not directions. The default embed form
   (`maps.google.com/maps?q=…&output=embed`) needs no API key; for
   production, prefer the official Maps Embed API with your own key.
4. `location.mapsUrl` — the **Open in Google Maps** button, beside a
   **Copy address** button that puts the venue and address on the
   clipboard.

If `mapEmbedUrl` is empty the slot falls back to the static
`location.mapPreview` image, and failing that to a plainly-labelled
placeholder. It is never dressed up as a real map. A live embed needs a
connection, so if your guests may be offline, a static `mapPreview` is the
more reliable choice.

### 6. Turn RSVP into a real inbox

`rsvp.endpoint` accepts any URL that takes a JSON `POST` — Formspree, a
Google Apps Script web app, Netlify Forms. Leave it empty and the form still
gives the guest a proper thank-you, it just doesn't send. **Never put a
secret key in the config**; this file ships to the browser.

---

## How the artwork drives the layout

Decisions here were taken from the supplied images, not guessed.

- **The pillars are never covered.** The temple plate has carved pillars at
  0–13% and 87–100%, with garlands reaching in to 17% and 83%. All content
  sits inside `--safe-inset: 17%`, so the ornament stays clear.
- **The invitation keeps a card's proportion.** The shell is capped at 480px
  and centred, so a 9:16 asset is never stretched or letterboxed, on a phone
  or a desktop monitor.
- **The couple are never covered.** The hero video is anchored to
  `object-position: 50% 100%`, keeping the walking figures in frame while
  type stays in the cream arch above them.
- **The hero plays once and holds.** It ends with the couple together;
  looping would cut them apart mid-scene. Set `media.heroLoop: true` if you
  prefer the loop.
- **The hero is set to be read, not admired.** Three faces do the work and
  each has one job: Cinzel for the two names and the date, EB Garamond for
  the invitation and the venue — a text serif with the x-height to survive
  13px over moving footage — and one script word, `Weds`, in Great Vibes
  between two hairlines. Only the names are tracked out, and only to .07em.
  Each line carries the millisecond it waits for in `data-rv-delay`.
- **The names are written in gold dust.** When the doors open, a cloud of
  gold dust swirls in and draws together into the two names, letter by
  letter from the left, and the engraved type comes up underneath as the
  last of it lands. The shapes are the real ones: each letter is drawn at
  the exact place and size the page set it, in the same face, onto a
  hidden canvas, and the dust is aimed at that — so English, Kannada, a
  long name or a short one all form exactly where the type will stand
  (Kannada a word at a time, so no conjunct is split). Then the seam
  strikes, a point of light writes `Weds` like a pen, the invitation
  arrives a word at a time and the date closes in from wide tracking.
  Each line's beat is in `data-dust-delay` in `hero.js`; a language
  switch forms the new names out of the dust again. Reduced motion skips
  the dust and the lines simply arrive.
- **Kannada gets its own metrics.** Kannada stacks vowel signs above the
  line and conjunct consonants below it, so every line-height tuned for
  Latin clips or collides once the script changes. `:root.lang-kn` in
  `components.css` carries measured corrections for every text style —
  the hero names alone needed 1.14 → 1.42, and drop a size with it.
- **The way in is a piece of jewellery.** Not an icon in a circle: a heart
  cut in gold with a second line engraved a hair inside it, six seed pearls
  set along that line and a faceted stone at its centre, left open in the
  middle so the doors behind show through the metal. It breathes —
  two beats and a rest — compresses under a finger the way metal gives,
  and a band of light is drawn through the gold on every touch. It is used
  in one place only: the gate. The music control stays a plain engraved
  heart, so the piece is the way in and nothing else.
- **Controls sit out of the artwork.** The jewel is fixed top-right,
  language fixed bottom-left, so neither covers a face, the hero type, or
  the carved pillars.
- **The opening screen rests on the doors it opens.** `entranceArt` is the
  video's own first frame, so the still a guest reads and the footage that
  plays are the same picture: the cut between them cannot be seen. A soft
  warm pool is laid through the middle band, where the names and the jewel
  are read against carved wood, and thins at the top so the garlands and
  the hanging lamps stay visible. Touching the jewel beats the piece once,
  steps the writing back, lifts that pool and hands the screen over to the
  footage; when the doors have finished opening the whole gate fades off
  the invitation behind it.
- **The gate is lit, written and drawn, in that order.** The courtyard
  arrives unlit and the lamps come up; the kicker closes in from wide
  tracking; each name is written in one letter at a time (Kannada one
  word at a time — a conjunct is never split); and a sikku kolam is drawn
  round the jewel — two continuous lines from the top, one each way,
  braiding through sixteen eyes and meeting at the foot, with a dot set in
  every eye and one point of lamplight walking the outer ring. The hint
  only appears once there is something to touch, about three seconds in.
- **The doors open on a seam of light.** The footage holds the doors shut
  for most of a second, so that second is filled: a line of light opens
  down the join from the height of the jewel, widens as the doors part,
  and a warm bloom floods through. The names come forward and soften as
  the guest walks past them, the kolam opens outward as a ring of light,
  and the still and the footage push in together, so the gate is walked
  through rather than faded.
- **The gallery is a mantapa.** The photographs stand in a ring of temple
  arches that turns in depth, like the pillars of a mantapa round the
  couple: the arch facing the guest is large and lit, its neighbours turn
  away into a warm haze, and a gold base ring with a string of beads turns
  under them. Swipe to turn it (it carries on with the flick and settles,
  with a little give, on the nearest arch); tap the front arch to open it
  full-screen, or a side one to bring it round; the arrows, the beads and
  the arrow keys work too. Left alone in view it turns on its own,
  smoothly and without stopping at each arch; a finger held on it stops
  it on the spot, and it eases back into its turn after a couple of
  seconds with nothing touched. The first time it is reached, the arches fan out of a closed
  deck into the ring. Opened, a photograph grows out of its own arch over
  a darkened page, swipes to the next, and goes back into the right arch.
  The photographs are cut-outs on white, and that is used: each is
  *multiplied* onto a lit niche, so the white becomes the inside of the
  arch and there is no photo edge anywhere — the couple stand in the arch.
  They are contained, never cropped, so a full-length shot, a seated pair
  and a waist-length portrait all fit unaltered. **For best results keep
  new gallery photos as cut-outs on a plain white background**; a
  photograph with its own scenery still works, it simply shows as a
  picture inside the arch.
- **Events are a garland, not cards.** No box is drawn anywhere in the
  section. A champagne cord runs down a feathered wash of cream that fades
  into the artwork, and each ceremony is knotted to it: a large round
  medallion on one side, its writing on the other, the sides alternating
  down the page, with a small vine of leaves growing on the cord between
  one ceremony and the next. The scroll writes it — a blossom travels the
  cord, the gold fills in behind it, and the ceremony it is standing on
  lifts and lights. The cord is measured from the first medallion's centre
  to the last, so it is strung between the blossoms rather than ruled
  across the section. Nothing is on the cord until the blossom gets
  there: each vine grows as it is reached (bead, then stems, then leaves)
  and is taken back in if the guest scrolls up. The ceremony the blossom
  stands on has a string of jasmine tied round its medallion — wound from
  the knot both ways at once, buds set in the order the thread reaches
  them — while the knot flares and its photograph slowly leans in.
  On a phone narrower than 360px the garland moves to the side: the
  cord runs down the left edge through every medallion and the writing
  sits to its right, so the cord never crosses the text. Each medallion is a detail cut from the temple
  photograph — the garland for Mehendi, the bells for the Reception, the
  lamps for Muhurta. No stock photography was invented.
- **The lagna is a rashi, not an event.** The last blossom on the garland
  is the lagna — the rising sign of the muhurta — so it carries no date,
  time or venue, only its rashi, shown as a small rashi chakra: the
  twelve signs round the edge, the lagna's sector lit, its sign drawn
  large at the centre. When the blossom reaches it the chakra turns the
  lagna up to the top. Set it with `rashi` in the last `events` entry
  (`mesha` … `meena`); it ships as **Kumbha**, which is what rises over
  Bengaluru at the 10:00 AM muhurta on 31 December 2026 — confirm it
  against your patrike.
- **The palette is sampled from the art.** `#FDF2DE` cream, `#A06B24`
  antique gold, `#4E2E10` warm ink — see `css/tokens.css`.

### Reveal types

Eight reusable reveals, chosen per element with `data-rv`. Sections share
the language without repeating the same move:

| type | what it does | used for |
|---|---|---|
| `soft` | opacity + blur + rise | body copy, details |
| `ink` | a feathered mask soaks upward, blur to sharp | headings, names |
| `mask` | clip-path wipe | images, preview bands |
| `line` | an ornamental rule draws out from its centre | dividers |
| `scale` | settles from slightly oversize | portraits, centred photographs |
| `unfold` | opens from the spine outward | the map, the closing names |
| `drift` | arrives from the side it sits on (`--rv-x`) | gallery frames |
| `seal` | a medallion settles with a quarter turn | event medallions, closing mark |
| `words` | one word at a time, via `RH.reveal.words()` | the closing blessing |

`ink` is a soft mask sweep, not a grain or glitch effect — it reads like
ink taking to paper. Only `mask` and `unfold` close their clip-path once
they arrive; any other type left with an `inset(0)` clip would crop
whatever it casts past its own box — shadows, halos, outer rings. Put `data-seq="140"` on any parent and its `data-rv`
descendants fire in DOM order, 140ms apart, when that parent is reached.
One IntersectionObserver drives the whole page.

### The date reveal

The date is under gold foil, in a heart, and it is rubbed off. Before it
is touched the foil catches a travelling light and the rim glows, so the
heart reads as something to be handled rather than looked at; under the
foil is a deep kumkum red set with sparks, with the day printed across it
in bold.

The shape is declared once as a unit-box `clipPath` and used twice: it
clips everything in the window — red bed, sparks, day, foil, gloss — and
the same outline is stroked over the join as the glowing rim, so the foil
and the red beneath share one edge.

The rubbing is a canvas with `globalCompositeOperation = 'destination-out'`,
which makes the strokes one composited layer over the answer rather than
anything being drawn, measured or laid out per frame. Two things about it
are worth keeping in mind if you touch this code:

- **the erase stroke must be opaque.** Under `destination-out` it is the
  SOURCE alpha that decides how much of the foil comes away, so the
  translucent stroke used for the tooling in the metal has to be reset to
  `rgba(0,0,0,1)` before any rubbing — otherwise every stroke takes off
  about a sixth of what it should and the card feels broken;
- **progress is sampled, never counted per move.** One `getImageData` over
  every twenty-fourth pixel, at most six times a second, is enough to know
  when about 42% is gone; past that the rest lets go on its own.

A plain tap still opens it, and so do Enter and Space: not everyone will
drag, and not everyone has a pointer at all. The countdown does not start
until the whole sequence has finished.

Around that mechanism:

- **engraved, then gilded.** As the section arrives the outline is cut
  first, from the tip round both lobes, and only then is the foil laid in.
  Nothing of the date shows before the foil is down. The rim is stroked in
  its own 100-unit box rather than with `non-scaling-stroke`: Chromium
  measures a dash against `pathLength` in one space and draws it in the
  other, and the engraving would stop part-way round.
- **the foil comes away as leaf.** A second canvas, hung over and below the
  heart, sheds tumbling flakes of gold under the finger in proportion to
  the ground covered. Each flake turns on its own axis, flashing as it
  faces the light. Its loop runs only while a flake is in the air.
- **the rest crumbles.** When the heart lets go, the foil still on it is
  read back from the canvas and shed as leaf from exactly where it was, so
  a heart rubbed half bare only crumbles where it was still covered. Its
  outline goes out from it twice, it beats once — lub, dub — and one pass
  of light crosses the red.
- **the countdown runs up.** The four cells arrive left to right while the
  numbers run up from nothing to the time that is left; after that every
  numeral that changes drops into place from just above.

The petals answer the touch, not the finished sentence: 120ms after the
tap, about twenty of them — jasmine, rose and ivory — are already in the
air, so the first of them arrives while the seal is still going. They fall
once across the viewport, drift sideways, flutter, and fade near the
bottom, and the layer is removed from the document when it is done. Under
reduced motion it is replaced by five petals that simply breathe once at
the centre.

### Hints and the one showcase

Two controls do nothing until they are touched — the jewel on the gate
and the heart on the date — so each carries a **hand that taps** for three
seconds: a pointing hand with two ripple rings, lamplight on the gate and
gold on the plate. The seal only starts its three seconds once it is
actually on screen. Touching the control retires the hint early; a guest
who already knows should not be told twice. The hand is a hint, not a
control: it sits inside the button and never takes a pointer event.

For the same reason the idle **showcase runs at most once per visit**. If
nobody touches anything for ten seconds after the gate opens, the page
walks itself down and back to the top. Any touch — before it, during it or
after — retires it for good. Somebody already reading should never have
the page taken out of their hands, and nobody should have it happen twice.

---

## Structure

```
index.html                  mount slots only, no content
data/
  wedding.config.js         ← every wedding-specific value
  content.i18n.js           ← every interface string, en + kn
css/
  tokens.css                palette, type scale, Kannada overrides
  base.css                  shell, plate system, reveal engine
  components.css            per-component styling
js/
  lib/state.js              language switching, t() and L()
  lib/reveal.js             IntersectionObserver + capped parallax
  components/               splash, music-button, language-switch,
                            hero, couple-intro, date-reveal, countdown,
                            events, gallery, location, rsvp, blessing,
                            footer
  app.js                    mounts components in reading order
assets/
```

Each component is self-contained: it builds its own markup, fills itself
from config, and registers a repaint for language changes. A component that
throws is logged and skipped — one broken section cannot take the
invitation down.

---

## Kannada

The translation is written the way a Karnataka wedding card is printed, not
word-for-word: ವರ / ವಧು for groom and bride, ವಿವಾಹ between them, and
"ಬನ್ನಿ, ನಮ್ಮನ್ನು ಆಶೀರ್ವದಿಸಿ" for the closing blessing.

Kannada glyphs carry no case and read badly when tracked out, so
`:root.lang-kn` switches off uppercasing and wide letter-spacing and drops
to Noto Serif Kannada. Language choice is offered on the splash, before the
the gate opens, and persists for the session.

Switching language repaints text in place — the splash, a broken seal and
the running countdown all keep their state.

---

## Accessibility and performance

- `prefers-reduced-motion` respected: reveals resolve instantly, parallax is
  off, the door video is skipped and the gate resolves instantly, the jewel
  stops breathing, and the petals are replaced by a single quiet bloom.
- Visible keyboard focus on every control; the language switch and RSVP
  attendance use `aria-pressed`.
- No `localStorage` — language is held in `sessionStorage` and fails soft in
  private mode.
- Videos are `playsinline` and muted; the hero preloads metadata only.
- Reveals animate opacity, transform and blur only, so nothing shifts
  layout. Parallax drift is capped at 18px and runs in one `rAF` loop.

---

## Verified

Checked in a browser at 360×800, 375×812 and 1280×880, in both languages:

1. Touch the jewel → it beats, the writing steps back, the doors fade up
   and swing open, then the gate fades: body unlocks, header appears.
2. Music starts from that same tap. The control stays on screen and
   configurable when no track file exists — it reports that, rather than
   silently deleting itself.
3. Hero video plays once, does not loop, first frame falls back cleanly.
   `hero-couple-still.jpeg` is not used anywhere and has been removed.
4. Hero typography stays in the arch above the couple.
5. Portraits are circular and cropped only vertically.
6. A hand taps beside the jewel and beside the seal for three seconds,
   and retires the moment the control is touched.
7. The heart rubs off under a finger anywhere on it, opens on its own once
   about 42% is gone, and still opens on a plain tap or on Enter/Space.
   The day is already bold under the foil; the rule draws and the hour
   lands beneath it.
8. Petals are in the air 120ms after the tap, fall once, and the layer is
   removed from the document afterwards.
9. Countdown starts only after the whole reveal has finished; days/hours/
   minutes/seconds computed from the ISO timestamp with its offset.
10. Past wedding date switches to "Today is the day".
11. Events reveal one ceremony at a time as the garland is scrolled, the
    blossom travelling the cord and lighting the ceremony it reaches;
    count, order and sides driven by config.
12. Gallery frames match config — count, order and captions — the reel
    turns by drag, arrow, rule or arrow key, and every caption switches
    language with the rest of the page.
13. Location renders in order: map preview, venue, address, button — with
    honest fallbacks when no embed URL is set, and the venue-photo slot
    above the map whenever `location.image` is filled in.
14. Maps button opens the configured URL.
15. Nothing below the gallery shifts once lazy images load.
16. `rsvp.enabled: false` removes the section, page stays intact.
17. English ↔ Kannada changes every visible string, including placeholders,
    ARIA labels and the document title.
18. The jewel toggles the music, its stone lit only while it plays, and
    pauses when the tab is hidden.
19. The idle showcase runs once if nobody reacts, never runs at all if they
    do, stops on the first touch, and never restarts.
20. Reconfiguring names, event count and gallery count needs no code change.
21. No console errors on any path.
22. All asset references resolve on disk.
23. No horizontal scrolling at 360×800, 390×844, 412×915 or desktop.
24. Reduced motion: splash resolves instantly, reveals are already in
    place, parallax is off, and the celebration is a single quiet bloom.

---

## Notes on the supplied pack

- The splash video carried a watermark in the lower right. It has been
  cropped off (1086 → 1030px tall) and the video re-encoded. Its poster
  frame is what the gate rests on (`media.entranceArt`) and the video
  itself is what plays when the jewel is touched (`media.splashVideo`).
- `couple-multi-gallery.jpeg` was a contact sheet of seven poses. Panels were
  detected and cut into individual files in `assets/sections/gallery/`; the
  original collage is kept at `assets/couple/` as the source.
- `hero-couple-still.jpeg` is deliberately **not shipped**. The hero is the
  walking video and nothing else, so the still was removed rather than left
  in the folder to be picked up by mistake.
- The four event medallions were cut from the temple background, one detail
  each. The older 640×139 preview bands are left in the folder, unused.
- `g2-embrace.jpg` was re-cut to the waist: the supplied cut-out had a
  square bite taken out of the lehenga near the hem.
- `location.image` is empty on purpose — the only venue picture available
  was a crop of the same artwork the section already sits on. Point it at a
  real photograph of the mantapa and the slot reappears above the map.
- Venue, address and event times in the config are **placeholders**. Replace
  them before sending.

---

RagaHru
