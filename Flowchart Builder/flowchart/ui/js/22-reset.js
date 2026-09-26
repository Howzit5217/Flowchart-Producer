// ---------------------------------------------------------------------------
//  22-reset.js -- each card on the Style side put back the way it started
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // Reset, at the foot of the Style side, puts everything back at once --
  // a lot to lose for want of one card's worth.  So each card (but the
  // palettes, below) has a turning arrow in its heading that puts back that
  // card and nothing else, in one
  // step that Undo takes back, and is dimmed while there is nothing on it
  // to put back (asked for, 2026-09-25).
  function hasAny(o) {
    return !!o && Object.keys(o).some(function (key) {
      var v = o[key];
      return v !== undefined && v !== "" && v !== null && v !== false &&
             !(typeof v === "object" && !hasAny(v));
    });
  }

  // Two colors the same, "" and none being the same (the drawing's own).
  function sameColor(a, b) {
    return String(a || "").toLowerCase() === String(b || "").toLowerCase();
  }
  // Every kind's colors as the palette has them, and no others.
  function kindsAsPalette(kinds, base) {
    var keys = Object.keys(kinds || {}).concat(Object.keys(base));
    return keys.every(function (k) {
      var a = (kinds || {})[k] || {}, b = base[k] || {};
      return sameColor(a.fill, b.fill) && sameColor(a.line, b.line) && sameColor(a.text, b.text);
    });
  }

  // For each card: where it is, whether it is as it started, and putting
  // it back.  "As it started" is the palette that was picked (paletteBase,
  // 04-panel.js) -- a palette is a starting point, not a change to undo --
  // so under Night the shapes card is dim until a shape's color is changed,
  // and its reset puts back Night's colors, not white.  The palette card
  // has none: going back to no palette is what its Ink button already does
  // (taken off, 2026-09-25).  The words card is how the words look and
  // their color; the shapes card each kind's colors; the picked shape
  // whatever it was given of its own; and the last card the lines, the
  // paper, the grid and how heavy the lines are drawn.
  var RESETS = [
    ["#letters", function () {
       var base = paletteBase();
       return !hasAny(style.letters) && sameColor(style.words, base.words) &&
              !Object.keys(style.kinds || {}).some(function (k) { return style.kinds[k] && style.kinds[k].text; });
     }, function () {
       style.letters = {};
       style.words = paletteBase().words;
       Object.keys(style.kinds || {}).forEach(function (k) { delete style.kinds[k].text; });
     }],
    ["#kinds", function () { return kindsAsPalette(style.kinds, paletteBase().kinds); },
     function () { style.kinds = paletteBase().kinds; }],
    ["#sel-body", function () {
       var now = selectedNow();
       return !now || !hasAny(style.nodes[now.i]);
     }, function () {
       var now = selectedNow();
       if (now) { style.nodes[now.i] = {}; }
     }],
    ["#globals", function () {
       var base = paletteBase();
       return sameColor(style.ink, base.ink) && sameColor(style.sheet, base.sheet) &&
              sameColor(style.grid, base.grid) && !style.weight && !style.gridOff;
     }, function () {
       var base = paletteBase();
       style.ink = base.ink; style.sheet = base.sheet; style.grid = base.grid;
       delete style.weight;
       style.gridOff = false;
       if (el("#grid-on")) { el("#grid-on").checked = true; }
       if (el("#f-grid")) { el("#f-grid").checked = true; }
     }]
  ];

  var RESET_ART = '<svg viewBox="0 0 20 20" aria-hidden="true">' +
                  '<path d="M4.6 9.4A5.6 5.6 0 1 1 6.1 14"/><path d="M4.1 4.9v4.7h4.7"/></svg>';

  RESETS.forEach(function (one) {
    var what = el(one[0]), card = what && what.closest("section");
    var head = card && el("h2", card);
    if (!head) { return; }
    var b = document.createElement("button");
    b.type = "button";
    b.className = "icon small card-reset";
    b.dataset.wTitle = "rs_card";
    b.title = TXT.rs_card || "";
    b.setAttribute("aria-label", TXT.rs_card || "");
    b.innerHTML = RESET_ART;
    b.onclick = function (ev) {
      ev.stopPropagation();              // the heading folds the card; this does not
      if (one[1]()) { return; }
      keepUndo();
      var wasType = typeSign(style);
      one[2]();
      // Plainer words can want smaller boxes, which only drawing it again gives.
      restyled(typeSign(style) !== wasType);
      paint(); buildKinds(); buildGlobals(); drawSelection(); lightPreset();
      keep();
    };
    one.button = b;
    head.appendChild(b);
  });

  // Dimmed while there is nothing to put back, and asked again whenever the
  // colors are (paint, 02-paint.js) or the picked shape is (drawSelection).
  function dressResets() {
    if (!RESETS) { return; }             // painted before this part has run
    RESETS.forEach(function (one) {
      if (!one.button) { return; }
      var plain = one[1]();
      if (one.button.disabled !== plain) { one.button.disabled = plain; }
    });
  }
