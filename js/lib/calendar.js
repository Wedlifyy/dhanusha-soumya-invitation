/* =============================================================
   RagaHru — ADD TO CALENDAR, AND THE INVITATION'S OWN ADDRESS

   Two small things every guest needs and nobody should have to
   type: the ceremony in their calendar, and the link to pass on.

   CALENDAR
   Each ceremony with a `start` in wedding.config.js gets two
   links, because no single one works on every phone:

     Google          a calendar.google.com link. Opens the Google
                     Calendar app on Android, the web page elsewhere.
     Apple · Outlook an .ics file. iPhone, Mac and Outlook read it;
                     it carries a reminder the evening before.

   Times are written in UTC (the trailing Z), converted from the
   +05:30 in the config, so a guest in Dubai or Toronto is
   reminded at the right hour for them.

   No library and no network: the .ics is a data: link built here.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  /* The invitation's public address. `social.url` is the real one
     once it is set; until then (the shipped placeholder, or a
     preview host) it is wherever the page is being read. */
  RH.siteUrl = function () {
    var s = (RH.config.social && RH.config.social.url) || '';
    if (s && !/your-domain\.com/i.test(s)) return s;
    return window.location.origin + window.location.pathname;
  };

  /* 2026-12-29T17:00:00+05:30  ->  20261229T113000Z */
  function utc(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  /* Text inside an .ics line: commas, semicolons, backslashes and
     newlines are escaped, as RFC 5545 asks. */
  function icsText(s) {
    return String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/([,;])/g, '\\$1');
  }

  /* Lines longer than 75 octets are folded. Kannada is three bytes
     a letter, so the fold is counted in bytes, never characters. */
  function fold(line) {
    var out = '', len = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line.charAt(i);
      var code = line.charCodeAt(i);
      var bytes = code < 0x80 ? 1 : code < 0x800 ? 2 :
                  (code >= 0xD800 && code <= 0xDBFF) ? 4 : 3;
      if (code >= 0xDC00 && code <= 0xDFFF) bytes = 0;  /* 2nd half of a pair */
      if (len + bytes > 74) { out += '\r\n '; len = 1; }
      out += ch;
      len += bytes;
    }
    return out;
  }

  /* What one ceremony says in a calendar, in the language being
     read when the link is tapped. */
  function describe(ev) {
    var cfg    = RH.config;
    var couple = RH.L(cfg.groom.name) + ' & ' + RH.L(cfg.bride.name);
    var loc    = cfg.location || {};
    var venue  = RH.L(ev.venue);

    /* The mantapa's full address goes with any ceremony held there,
       so the phone can offer directions from the reminder itself. */
    var place = venue;
    if (loc.venue && ev.venue && RH.L(loc.venue) === venue && loc.address) {
      place = venue + ', ' + RH.L(loc.address).replace(/,?\s*\n\s*/g, ', ');
    }

    var details = [RH.L(ev.note), couple, RH.siteUrl()]
      .filter(Boolean).join('\n');

    return {
      title:   RH.L(ev.name) + ' — ' + couple,
      start:   utc(ev.start),
      end:     utc(ev.end || ev.start),
      place:   place,
      details: details
    };
  }

  RH.calendar = {
    has: function (ev) { return !!(ev && ev.start && utc(ev.start)); },

    google: function (ev) {
      var d = describe(ev);
      return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        '&text='     + encodeURIComponent(d.title) +
        '&dates='    + d.start + '/' + d.end +
        '&details='  + encodeURIComponent(d.details) +
        '&location=' + encodeURIComponent(d.place);
    },

    ics: function (ev) {
      var d = describe(ev);
      var uid = d.start + '-' + String(RH.L(ev.name)).replace(/[^\w]/g, '') +
                '@' + (window.location.hostname || 'invitation');
      var lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//RagaHru//Wedding Invitation//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:' + uid,
        'DTSTAMP:' + utc(new Date().toISOString()),
        'DTSTART:' + d.start,
        'DTEND:' + d.end,
        'SUMMARY:' + icsText(d.title),
        'LOCATION:' + icsText(d.place),
        'DESCRIPTION:' + icsText(d.details),
        'URL:' + RH.siteUrl(),
        /* a reminder the evening before */
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:' + icsText(d.title),
        'TRIGGER:-PT15H',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ];
      return 'data:text/calendar;charset=utf-8,' +
             encodeURIComponent(lines.map(fold).join('\r\n') + '\r\n');
    },

    /* A file name a guest will recognise in their downloads. */
    filename: function (ev) {
      var name = (ev.name && ev.name.en) || RH.L(ev.name) || 'event';
      return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.ics';
    }
  };
})();
