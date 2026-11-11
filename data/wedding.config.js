/* =============================================================
   RagaHru — WEDDING CONFIG
   The only file you edit to create a new invitation.
   Never edit anything in /js/components.

   Any value written as { en: "...", kn: "..." } is bilingual.
   A plain string is fine where both languages read the same.
   ============================================================= */

window.WEDDING = {

  /* ---------- GROOM ---------- */
  groom: {
    name:          { en: "Dhanusha MK",  kn: "ಧನುಷ ಎಂ.ಕೆ." },
    qualification: { en: "B.E.",         kn: "ಬಿ.ಇ." },
    parents:       { en: "Son of Sri Rajendra and\nSmt. Rukmini",
                     kn: "ಶ್ರೀ ರಾಜೇಂದ್ರ ಹಾಗೂ\nಶ್ರೀಮತಿ ರುಕ್ಮಿಣಿ ಅವರ ಪುತ್ರ" },
    photo: "assets/couple/groom-portrait.jpeg"
  },

  /* ---------- BRIDE ---------- */
  bride: {
    name:          { en: "Soumya",       kn: "ಸೌಮ್ಯ" },
    qualification: { en: "LLB",          kn: "ಎಲ್‌ಎಲ್.ಬಿ." },
    parents:       { en: "Daughter of Sri Gururaj and\nSmt. Rekha",
                     kn: "ಶ್ರೀ ಗುರುರಾಜ್ ಹಾಗೂ\nಶ್ರೀಮತಿ ರೇಖಾ ಅವರ ಪುತ್ರಿ" },
    photo: "assets/couple/bride-portrait.jpeg"
  },

  /* ---------- THE WEDDING ----------
     dateTimeISO drives the countdown. Keep a timezone offset on it
     so the timer stays correct for guests abroad.
     dateLabel / timeLabel are what guests actually read.          */
  wedding: {
    dateTimeISO: "2026-12-31T10:00:00+05:30",
    dateLabel: { en: "Thursday, 31 December 2026",
                 kn: "ಗುರುವಾರ, 31 ಡಿಸೆಂಬರ್ 2026" },
    timeLabel: { en: "10:00 AM",  kn: "ಬೆಳಿಗ್ಗೆ 10:00" },
    venue:     { en: "Mangala Kalyana Mantapa Lawn",
                 kn: "ಮಂಗಳ ಕಲ್ಯಾಣ ಮಂಟಪ ಲಾನ್" }
  },

  /* ---------- CELEBRATIONS ----------
     The section is a garland: a champagne cord down the page with
     one ceremony knotted to it per entry below, alternating sides,
     and a vine growing between each pair. Everything about it —
     how many blossoms, which side each falls on, how long the cord
     is — comes from the length and order of this array, so adding
     or re-ordering a ceremony needs no other change.

     `preview` is the round medallion. Use a square image — it is
     masked to a circle and cropped to fill, so keep the subject
     near the middle. The supplied ones are cut from the temple
     artwork, one detail each: a garland, the bells, the lamps, the
     gopura. Leave `preview` empty and the ceremony keeps its place
     on the cord as a small gold node instead.

     date / time / venue are what a guest reads, in that order.
     `note` is one quiet line underneath and may be left out.

     start / end are for the "Add to calendar" links under each
     ceremony: the real clock times, with the +05:30 offset, so the
     reminder lands at the right hour on a guest's phone abroad too.
     Leave `start` out and that ceremony shows no calendar links.
     `end` is a best guess for "onwards" — the calendar needs one.  */
  events: [
    {
      preview: "assets/sections/events/mehendi-medallion.jpg",
      name:  { en: "Mehendi", kn: "ಮೆಹಂದಿ" },
      date:  { en: "Tuesday, 29 December 2026",  kn: "ಮಂಗಳವಾರ, 29 ಡಿಸೆಂಬರ್ 2026" },
      time:  { en: "5:00 PM onwards",            kn: "ಸಂಜೆ 5:00 ರಿಂದ" },
      start: "2026-12-29T17:00:00+05:30",
      end:   "2026-12-29T21:00:00+05:30",
      venue: { en: "Residence of the Bride",     kn: "ವಧುವಿನ ಮನೆ" },
      note:  { en: "An evening of green palms and song.",
               kn: "ಹಸಿರು ಮೆಹಂದಿ ಹಾಗೂ ಹಾಡುಗಳ ಸಂಜೆ." }
    },
    {
      preview: "assets/sections/events/reception-medallion.jpg",
      name:  { en: "Reception", kn: "ಆರತಕ್ಷತೆ" },
      date:  { en: "Wednesday, 30 December 2026", kn: "ಬುಧವಾರ, 30 ಡಿಸೆಂಬರ್ 2026" },
      time:  { en: "7:00 PM onwards",             kn: "ಸಂಜೆ 7:00 ರಿಂದ" },
      start: "2026-12-30T19:00:00+05:30",
      end:   "2026-12-30T22:30:00+05:30",
      venue: { en: "Mangala Kalyana Mantapa Lawn", kn: "ಮಂಗಳ ಕಲ್ಯಾಣ ಮಂಟಪ ಲಾನ್" },
      note:  { en: "Dinner, and the first blessings.",
               kn: "ಭೋಜನ ಹಾಗೂ ಮೊದಲ ಆಶೀರ್ವಾದ." }
    },
    {
      preview: "assets/sections/events/muhurta-medallion.jpg",
      name:  { en: "Muhurta", kn: "ಮುಹೂರ್ತ" },
      date:  { en: "Thursday, 31 December 2026",  kn: "ಗುರುವಾರ, 31 ಡಿಸೆಂಬರ್ 2026" },
      time:  { en: "10:00 AM",                    kn: "ಬೆಳಿಗ್ಗೆ 10:00" },
      start: "2026-12-31T10:00:00+05:30",
      end:   "2026-12-31T13:00:00+05:30",
      venue: { en: "Mangala Kalyana Mantapa Lawn", kn: "ಮಂಗಳ ಕಲ್ಯಾಣ ಮಂಟಪ ಲಾನ್" },
      note:  { en: "The auspicious hour.",
               kn: "ಶುಭ ಗಳಿಗೆ." }
    },
    /* The LAGNA is not an event. It is the rising sign — the rashi
       on the eastern horizon at the auspicious hour — so it carries
       no date, time or venue, only its rashi. It hangs on the
       garland as a small rashi chakra with its sign lit.

       `rashi` is one of:
         mesha   vrishabha  mithuna  karka   simha   kanya
         tula    vrishchika dhanu    makara  kumbha  meena

       Kumbha is what rises over Bengaluru at the 10:00 AM muhurta
       on 31 December 2026 (sidereal, Lahiri ayanamsa: about 6° into
       Kumbha). Confirm it against the patrike from your purohit and
       change it here if it says otherwise. */
    {
      rashi: "kumbha",
      name:  { en: "Lagna", kn: "ಲಗ್ನ" },
      note:  { en: "The rising sign of the auspicious hour.",
               kn: "ಶುಭ ಮುಹೂರ್ತದ ಲಗ್ನ ರಾಶಿ." }
    }
  ],

  /* ---------- GALLERY ----------
     A plain array. Drop new photos into assets/sections/gallery/
     and list them here. Nothing else needs to change — the
     section is built from this list alone: one photograph hangs
     large and square to the guest, the neighbours stand turned
     away behind it, and the rule beneath is cut into as many
     spans as there are entries.

     ORDER is the order a guest meets them in, and the first one
     is what they see before touching anything — put the
     strongest picture first.

     SHAPE does not matter. Each photograph is fitted inside the
     frame's mat, never cropped to it, so a tall portrait, a wide
     seated shot and a cut-out on white all hang equally well and
     the section keeps exactly the same height either way.
       w, h  : the photo's real pixel size. These reserve the space
               before the image loads, so nothing below the gallery
               jumps as you scroll. Always fill them in.
     Every photo carries its own bilingual caption, shown small
     under the frame beside its number.                            */

  /* WHICH GALLERY the photographs are shown in. Both read the same
     list below, so switching is this one word and nothing else:
       "prints" : a pile of printed photographs, dealt onto the page;
                  throw the top one aside to see the next
       "ring"   : the original — a turning ring of temple arches
     To compare without editing: add ?gallery=ring or ?gallery=prints
     to the page address.                                           */
  galleryStyle: "prints",

  gallery: [
    { src: "assets/sections/gallery/g1-closeup.jpg", w: 292, h: 412,
      caption: { en: "Us, forever.",              kn: "ಎಂದೆಂದಿಗೂ ನಾವು" } },
    /* Re-cut to the waist: the supplied cut-out had a square bite
       taken out of the lehenga near the hem. */
    { src: "assets/sections/gallery/g2-embrace.jpg", w: 262, h: 396,
      caption: { en: "Made for each other.",      kn: "ಒಬ್ಬರಿಗೊಬ್ಬರು ಸೃಷ್ಟಿಯಾದವರು" } },
    { src: "assets/sections/gallery/g4-seated.jpg", w: 423, h: 383,
      caption: { en: "Together feels like home.", kn: "ಜೊತೆಯಿದ್ದರೆ ಅದೇ ಮನೆ" } },
    { src: "assets/sections/gallery/g3-standing.jpg", w: 273, h: 601,
      caption: { en: "Just us.",                  kn: "ನಾವಿಬ್ಬರೇ" } },
    { src: "assets/sections/gallery/g7-tender.jpg", w: 280, h: 395,
      caption: { en: "A little bit of forever.",  kn: "ಚಿರಕಾಲದ ಒಂದು ತುಣುಕು" } },
    { src: "assets/sections/gallery/g6-seated-close.jpg", w: 275, h: 395,
      caption: { en: "Our favorite chapter.",     kn: "ನಮ್ಮ ಅಚ್ಚುಮೆಚ್ಚಿನ ಅಧ್ಯಾಯ" } },
    { src: "assets/sections/gallery/g5-looking-back.jpg", w: 272, h: 588,
      caption: { en: "And so our story begins.",  kn: "ಹೀಗೆ ನಮ್ಮ ಕಥೆ ಆರಂಭ" } }
  ],

  /* ---------- LOCATION ----------
     The section reads in this order:
        1. image        the venue itself, and the largest thing here
        2. venue + address
        3. mapEmbedUrl  a live Google Maps preview
        4. mapsUrl      the "Open in Google Maps" button

     image        The picture guests see first. The file shipped
                  here is a PLACEHOLDER — swap it for a real
                  photograph of the mantapa and nothing else needs
                  to change. Landscape works best; it is cropped to
                  5:4 from the centre. Leave it empty and the slot
                  closes up cleanly, name first.
     mapEmbedUrl  any Google Maps embed URL. The default form below
                  needs no API key. For production, prefer the
                  official Maps Embed API with your own key.
     mapPreview   a static image used only if mapEmbedUrl is empty.
                  If both are empty a plain placeholder shows — this
                  never pretends to be a real map.                  */
  location: {
    venue:   { en: "Mangala Kalyana Mantapa Lawn",
               kn: "ಮಂಗಳ ಕಲ್ಯಾಣ ಮಂಟಪ ಲಾನ್" },
    address: { en: "20th Main Road, KHB Colony, 7th Block,\nKoramangala, Bengaluru, Karnataka 560095",
               kn: "20ನೇ ಮುಖ್ಯ ರಸ್ತೆ, ಕೆಎಚ್‌ಬಿ ಕಾಲನಿ, 7ನೇ ಬ್ಲಾಕ್,\nಕೋರಮಂಗಲ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ 560095" },
    image: "assets/sections/location/venue-placeholder.jpg",
    mapEmbedUrl: "https://maps.google.com/maps?q=Mangala%20Kalyana%20Mantapa%20Lawn%2C%2020th%20Main%20Rd%2C%20KHB%20Colony%2C%207th%20Block%2C%20Koramangala%2C%20Bengaluru%2C%20Karnataka%20560095&z=16&output=embed",
    mapPreview: "",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mangala%20Kalyana%20Mantapa%20Lawn%2C%20Koramangala%2C%20Bengaluru"
  },

  /* ---------- RSVP ----------
     enabled: false removes the section entirely.
     endpoint: a Formspree / Apps Script / Netlify Forms URL.
     Never put a secret key here; this file ships to the browser.  */
  rsvp: {
    enabled: true,
    /* This couple's Google Apps Script link (it ends in /exec). ONE Google
       Sheet + ONE link per wedding: see rsvp-backend/SETUP-GUIDE.md.
       Empty = demo mode: the form says thank you but saves nothing. */
    endpoint: "https://script.google.com/macros/s/AKfycbyzhglKsN6Ci8RaRUuM7NiWsMp1EQuiNNHdwDBTw3h5XMC6ETsjTgr-5ZGfICxC-iWnJw/exec"
  },

  /* ---------- MUSIC ----------
     Drop your track at assets/music/wedding-music.mp3.
     The control stays on screen and configurable even before the
     file exists — it simply reports that no track is loaded.      */
  music: {
    enabled: true,
    src: "assets/music/wedding-music.mp3",
    volume: 0.55
  },

  /* ---------- MEDIA ----------
     heroPoster is the first frame of the hero video, used only as
     a fallback while it loads or if it cannot decode.             */
  media: {
    /* The opening screen rests on entranceArt and plays splashVideo
       when the jewel is touched. Keep entranceArt as the video's
       own first frame: the cut from the still to the footage is
       then invisible, and the doors are already there to open. */
    entranceArt:  "assets/splash/splash-poster.jpg",
    splashVideo:  "assets/splash/splash-door-opening.mp4",
    heroVideo:    "assets/hero/hero-couple-walking.mp4",
    heroPoster:   "assets/hero/hero-poster.jpg",
    plate:        "assets/sections/date/indian-temple-background.jpeg",
    heroLoop:     false
  },

  /* ---------- BRANDING ---------- */
  social: {
    studio:       "RagaHru",
    /* The studio's mark, shown in the footer in place of the name set
       in type (the mark carries the name itself). Leave it out and the
       footer goes back to the name alone. */
    logo:         "assets/brand/ragahru-logo.webp",
    instagramUrl: "https://instagram.com/ragahru",

    /* ---------- LINK PREVIEW ----------
       What WhatsApp, Facebook, Telegram and iMessage draw when the link is
       pasted into a chat. After any change here run
           node tools/prepare-site.mjs <this folder>
       url    the invitation's real public address. REQUIRED: platforms cannot
              load a relative image path, so without it the picture is blank.
       image  the 1200x630 card — built for you from `card` below.
       card   how that image is made: the photo (crop = the part of it to
              show, in the photo's own pixels), the two names, a tagline.
              theme: "cream" (warm) or "ivory" (cool white).
              ornament: "lotus" | "star" | "cross" | "rings" | "none".        */
    url:   "https://wedlifyy.github.io/dhanusha-soumya-invitation/",
    image: "assets/social/share-preview.jpg",
    title: { en: "Dhanusha MK & Soumya — Wedding Invitation",
             kn: "ಧನುಷ ಎಂ.ಕೆ. & ಸೌಮ್ಯ — ವಿವಾಹ ಆಮಂತ್ರಣ" },
    description: { en: "Together with our families, we invite you to celebrate our wedding. Thursday, 31 December 2026 · Mangala Kalyana Mantapa Lawn",
             kn: "ನಮ್ಮ ಕುಟುಂಬಗಳ ಸಮ್ಮುಖದಲ್ಲಿ ನಡೆಯಲಿರುವ ನಮ್ಮ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ತಮ್ಮನ್ನು ಸಾದರವಾಗಿ ಆಹ್ವಾನಿಸುತ್ತೇವೆ. ಗುರುವಾರ, 31 ಡಿಸೆಂಬರ್ 2026 · ಮಂಗಳ ಕಲ್ಯಾಣ ಮಂಟಪ ಲಾನ್" },
    imageAlt: { en: "Dhanusha MK & Soumya — Wedding Invitation",
             kn: "ಧನುಷ ಎಂ.ಕೆ. & ಸೌಮ್ಯ — ವಿವಾಹ ಆಮಂತ್ರಣ" },
    card: {
      photo:   "assets/couple/couple-multi-gallery.jpeg",
      crop:    [0, 0, 281, 418],
      names:   ["Dhanusha MK", "Soumya"],
      kicker:  "The Wedding of",
      tagline: "Two Souls|One Journey",
      theme:   "cream",
      ornament: "lotus"
    }
  },

  /* ---------- LANGUAGES ----------
     The languages this invitation offers, in the order the switch shows
     them; the first is what a guest sees first.
        ["en", "kn"]   English + Kannada, with the switch
        ["en"]         English only — the switch is not drawn at all
     Every bilingual value in this file is { en: "...", kn: "..." }; a
     language with no text for a value falls back to English.
     A new language (Tamil, Telugu ...) is added with:
        node tools/add-language.mjs <this folder> ta                   */
  languages: ["en", "kn"],

  defaultLang: "en"
};
