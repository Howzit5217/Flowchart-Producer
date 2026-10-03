// ---------------------------------------------------------------------------
//  40-flat3d.js -- the plan, flat as drawn, with its furniture in 3D: lit,
//  shaded and throwing its shadows, the walls cut low
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "to also have a mode where you are in the 2d
  // mode but all the furniture is in 3d in the 3d mode")
  //
  // The view's 2D (v3Flat, 38-view3d.js) lays the house down onto the paper:
  // nothing stands up (V3.rise 0), the furniture is its pictures, the colors
  // plain, as drawn.  With 3D furniture on, it is laid out the same -- each
  // floor beside the next, each room where it is drawn, looked straight down
  // on -- but stands up: the real models (38-models.js), lit by the sun,
  // shaded and shadowed, the walls cut off at the height a plan cuts them
  // (as Low walls, 38-view3d.js).  Kept in the browser, like the time of day.
  function flat3dPref() { try { return localStorage.getItem("flowchart-3d-flat3d") === "1"; } catch (e) { return false; } }
  function flat3dNow() { return !!(V3 && V3.flat && V3.flatDone && V3.scene !== "space" && V3.mode !== "walk" && flat3dPref()); }
  function flat3dSet(on) {
    try { localStorage.setItem("flowchart-3d-flat3d", on ? "1" : "0"); } catch (e) { /* this visit only */ }
    if (!V3) { return; }
    if (V3.flat && V3.flatDone) {
      v3Fade(250);
      v3Tween("rise", on ? 1 : 0, 450);
    }
    V3.dirty = true;
    v3Words();
  }
  // the real models, flat
  if (typeof modelsOn === "function") {
    var modelsOnFlat = modelsOn;
    modelsOn = function () {
      if (flat3dNow() && typeof gl3Ready === "function" && gl3Ready()) { return true; }
      return modelsOnFlat.apply(this, arguments);
    };
  }
  // the walls cut low, while it is put up
  if (typeof v3Build === "function") {
    var v3BuildFlat = v3Build;
    v3Build = function () {
      if (!flat3dNow()) { return v3BuildFlat.apply(this, arguments); }
      var was = V3.low;
      V3.low = true;
      try { return v3BuildFlat.apply(this, arguments); } finally { V3.low = was; }
    };
  }
  // laid flat with it on: the walls go down only as far as a plan cuts them
  if (typeof v3Flat === "function") {
    var v3FlatPlain = v3Flat;
    v3Flat = function (on) {
      var out = v3FlatPlain.apply(this, arguments);
      if (on && flat3dPref() && V3 && V3.tw && V3.tw.rise) { V3.tw.rise.to = 1; }
      return out;
    };
  }

  // ---- its button, beside 2D, while the view is flat ---------------------------------------
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.furn3d = '<path d="M4 9.5 10 6.5l6 3-6 3z"/><path d="M4 9.5v3.8l6 3 6-3V9.5M10 12.5v3.8"/><path d="M6.4 8.3V4.6M13.6 8.3V4.6"/>';
  }
  if (typeof V3_GROUPS !== "undefined") {
    var flatAt = V3_GROUPS[1].indexOf("flat");
    V3_GROUPS[1].splice(flatAt >= 0 ? flatAt + 1 : V3_GROUPS[1].length, 0, "furn3d");
  }
  function flat3dButton() {
    if (!V3 || !V3.box) { return; }
    var bar = el(".v3-bar", V3.box);
    if (!bar) { return; }
    var b = el('[data-v3="furn3d"]', bar);
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.className = "btn small";
      b.dataset.v3 = "furn3d";
      b.onclick = function () { flat3dSet(!flat3dPref()); };
      var flat = el('[data-v3="flat"]', bar);
      (flat ? flat.parentNode : bar).insertBefore(b, flat ? flat.nextSibling : null);
    }
    var lbl = el(".v3-lbl", b);
    if (lbl) { if (lbl.textContent !== TXT.f3_on) { lbl.textContent = TXT.f3_on; } } else { b.textContent = TXT.f3_on; }
    b.title = TXT.f3_tip;
    b.setAttribute("aria-label", TXT.f3_on);
    b.setAttribute("aria-pressed", flat3dPref() ? "true" : "false");
    var home = typeof tieHomeLike === "function" ? tieHomeLike() : true;
    b.hidden = !V3.flat || V3.scene === "space" || V3.mode === "walk" || !home;
  }
  if (typeof v3Words === "function") {
    var v3WordsFlat = v3Words;
    v3Words = function () {
      var out = v3WordsFlat.apply(this, arguments);
      try { flat3dButton(); if (typeof v3DressBar === "function") { v3DressBar(); } } catch (e) { /* fine */ }
      return out;
    };
  }
