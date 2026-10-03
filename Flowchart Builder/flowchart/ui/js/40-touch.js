// ---------------------------------------------------------------------------
//  40-touch.js -- the 3D view on a phone: its sheets opening under its bar
//  however many rows that takes, and what to do said in fingers
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "Update this so the menus do not clip weirdly
  // when on mobile in the house menu and to also make it so the 3d mode
  // works on mobile for dragging around")
  //
  // On a narrow screen the view's bar wraps to two rows or three, and its
  // sheets (Materials, Settings) opened at one bar's height, over the rows
  // below -- over the very button that closes them.  They open under the
  // bar now, as tall as is left.  (Start a house's picture of the plan no
  // longer stays pinned over its choices on a phone: 10-starter.css.  Two
  // fingers move and turn the view: v3Hands, 38-view3d.js.)
  function touchFirst() {
    try { return matchMedia("(pointer: coarse)").matches && !matchMedia("(pointer: fine)").matches; } catch (e) { return false; }
  }
  function touchSheetTop() {
    if (typeof V3 === "undefined" || !V3 || !V3.box) { return; }
    var bar = el(".v3-bar", V3.box);
    if (!bar) { return; }
    var top = Math.round(bar.getBoundingClientRect().bottom - V3.box.getBoundingClientRect().top + 8);
    if (top > 20 && V3.box.style.getPropertyValue("--v3-top") !== top + "px") { V3.box.style.setProperty("--v3-top", top + "px"); }
  }
  if (typeof v3Words === "function") {
    var v3WordsTouch = v3Words;
    v3Words = function () {
      var out = v3WordsTouch.apply(this, arguments);
      try {
        if (V3 && V3.box && touchFirst()) {
          var hint = el(".v3-hint", V3.box);
          if (hint) { hint.textContent = V3.mode === "walk" ? TXT.v3_hint_walk_touch : V3.flat ? TXT.v3_hint_flat_touch : TXT.v3_hint_touch; }
        }
        touchSheetTop();
      } catch (e) { /* as it was */ }
      return out;
    };
  }
  if (typeof v3Open === "function") {
    var v3OpenTouch = v3Open;
    v3Open = function () {
      var was = V3, out = v3OpenTouch.apply(this, arguments);
      try {
        if (V3 && V3 !== was && V3.box) {
          touchSheetTop();
          var bar = el(".v3-bar", V3.box);
          // (the bar's height only: writing the box's variable never changes it, so this cannot feed itself)
          if (bar && typeof ResizeObserver === "function") { new ResizeObserver(function () { touchSheetTop(); }).observe(bar); }
        }
      } catch (e) { /* as it was */ }
      return out;
    };
  }
