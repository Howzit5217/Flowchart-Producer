// ---------------------------------------------------------------------------
//  40-units.js -- sizes in feet and inches or in metres, whichever is
//  asked for, in any language
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "to also let you measure things in Metric too
  // rather than just standard")
  //
  // A language came with its own way of measuring (fp_unit: feet in US
  // English, metres elsewhere), and every size said -- a room's, a lot's,
  // what is typed into a piece's width, the room you are in on a walk --
  // asks feetHere() or that word.  Picked in More (Measure in), the words
  // of every language are made to say it the way picked; not picked, each
  // its own.  Kept in the browser.
  var UNIT_OWN = {};                     // each language's own: its unit, and how it says an area
  function unitsPref() {
    try { var u = localStorage.getItem("flowchart-units"); return u === "ft" || u === "m" ? u : ""; } catch (e) { return ""; }
  }
  function unitsApply() {
    var pref = unitsPref();
    Object.keys(ALL).forEach(function (l) {
      var w = ALL[l];
      if (!w || typeof w !== "object") { return; }
      if (!UNIT_OWN[l]) { UNIT_OWN[l] = { unit: w.fp_unit || "m", area: w.fp_area || "{n} m²" }; }
      var u = pref || UNIT_OWN[l].unit;
      w.fp_unit = u;
      w.fp_area = u === UNIT_OWN[l].unit ? UNIT_OWN[l].area : u === "ft" ? (l === "en" ? "{n} sq ft" : "{n} ft²") : "{n} m²";
    });
  }
  function unitsShow() {
    var now = feetHere() ? "ft" : "m";
    all("#units-seg .seg-btn").forEach(function (b) {
      var on = b.dataset.units === now;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function unitsSet(u) {
    try { localStorage.setItem("flowchart-units", u); } catch (e) { /* this visit only */ }
    unitsApply();
    unitsShow();
    // every size said again: the rooms on the paper, the panel, the 3D view
    try { if (typeof drawHand === "function" && typeof hand !== "undefined" && hand && hand.nodes.length) { drawHand(); } } catch (e) { /* as it was */ }
    try { if (typeof drawHandPanel === "function") { drawHandPanel(); } } catch (e) { /* as it was */ }
    if (typeof V3 !== "undefined" && V3) {
      V3.dirty = true;
      var sheet = V3.box && el(".v3-set", V3.box);
      if (sheet && !sheet.hidden && sheet.redraw) { sheet.redraw(); }
    }
  }
  unitsApply();
  // (another language picked, and nothing picked here: that language's own way)
  if (typeof dress === "function") {
    var dressUnits = dress;
    dress = function () {
      var out = dressUnits.apply(this, arguments);
      try { unitsShow(); } catch (e) { /* as it was */ }
      return out;
    };
  }
  all("#units-seg .seg-btn").forEach(function (b) {
    b.addEventListener("click", function () { unitsSet(b.dataset.units); });
  });
  unitsShow();
