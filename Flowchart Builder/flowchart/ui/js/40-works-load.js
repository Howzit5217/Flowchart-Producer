// ---------------------------------------------------------------------------
//  40-works-load.js -- the building site getting ready, shown: how far along,
//  on the video bar's own rail, the page free all the while and Skip there
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "the site freezing when loading in the video
  // rather than showing a progress bar and it needs to let you skip that
  // process of that operation because it can not freeze the site and loading
  // bars are your friends")
  //
  // Held at its start (40-works-gate.js) while its timetable is worked out a
  // few phases a picture (40-works.js), the 3D view's programs are made on
  // the side (38-view3d-gl.js) and the view settles, the video bar
  // (40-works-video.js) said "–:––" and no more.  Now its rail fills as that
  // goes and the time says how far; Skip, beside it from the start, leaves
  // it at once for the building as it stands done.
  var WL_AFTER = { gl: 0.82, view: 0.84, picture: 0.88, rise: 0.92, tween: 0.95, pics: 0.97 };
  // how far along getting ready is, 0..1: the timetable most of it, the rest the view coming up
  function wlFrac(me) {
    var plan = typeof wvPlanOf === "function" ? wvPlanOf(me) : null;
    var gl = !!(V3 && V3.gl && V3.gl.making);
    if (!plan) { return gl ? 0.02 : 0.04; }
    if (!plan.done) { return 0.05 + 0.75 * Math.min(1, (plan.next || 0) / Math.max(1, WK_PHASES.length)); }
    var why = null;
    if (typeof wgLoading === "function") { try { why = wgLoading(plan); } catch (e) { why = null; } }
    return why && WL_AFTER[why] !== undefined ? WL_AFTER[why] : 0.99;
  }
  // On the bar while it is held: the rail filled that far, the time its hundredths -- never
  // going back; let go, the bar its own again.
  function wlShow(W) {
    var on = !W.ended && W.root.classList.contains("wv-held");
    if (!on) {
      if (W.wl) {
        W.wl = null;
        W.root.classList.remove("wv-loading");
        W.last.gone = W.last.all = W.last.pct = W.last.val = null;
        wvShowLoad(W, true);
      }
      return;
    }
    if (!W.wl) { W.wl = { f: 0, pct: -1 }; W.root.classList.add("wv-loading"); }
    var f = Math.max(W.wl.f, wlFrac(W.me)), pct = Math.floor(f * 100);
    W.wl.f = f;
    if (W.wl.pct === pct) { return; }
    W.wl.pct = pct;
    W.fill.style.width = (f * 100).toFixed(1) + "%";
    W.gone.textContent = pct + "%";
    W.all.textContent = "";
    W.track.setAttribute("aria-valuenow", String(pct));
    W.track.setAttribute("aria-valuetext", (TXT.wg_ready || "") + " · " + pct + "%");
  }
  if (typeof wvShow === "function") {
    var wvShowLoad = wvShow;
    wvShow = function (W) {
      var out = wvShowLoad.apply(this, arguments);
      try { wlShow(W); } catch (e) { /* the bar as it is */ }
      return out;
    };
  }
  // (the view's programs still being made: still getting ready, as the gate sees it)
  if (typeof wgLoading === "function") {
    var wgLoadingGl = wgLoading;
    wgLoading = function () {
      if (V3 && V3.gl && V3.gl.making) { return "gl"; }
      return wgLoadingGl.apply(this, arguments);
    };
  }
