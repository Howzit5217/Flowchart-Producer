// ---------------------------------------------------------------------------
//  40-works-gate.js -- the building site starts once everything is in: the
//  timetable worked out to its end, the view come up and settled, a big
//  building's picture made, its pictures loaded -- not while it is still
//  being made
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "update it so the stuff does not start playing for
  // the building until everything is done loading in and to make sure it does
  // stuff in the proper building order")
  //
  // The works' clock (40-works.js) began as soon as the first of the
  // timetable was made -- a few phases a picture -- so the first jobs played
  // while the rest were still being worked out, the view was still flying in
  // and the pictures still loading; and the site's calendar (40-works-day.js)
  // came into it only once it was all made, the time it had got to moving
  // under it.  Now the clock is held at its start -- the bare lot, "getting
  // the site ready" -- until all of that is done, then let go from nought.
  var WG_MOST = 12000;                   // ms: let go by then whatever is still coming (a view being turned the whole time)
  function wgLoading(plan) {
    if (!plan || !plan.done) { return "plan"; }
    if (!V3 || !V3.box) { return "view"; }
    if (V3.warming) { return "picture"; }                                // a big building's picture, made a slice at a time
    if (V3.rise !== undefined && V3.rise < 0.999) { return "rise"; }      // the walls still coming up off the paper
    if (V3.tw && Object.keys(V3.tw).length) { return "tween"; }          // the view still flying in
    if (typeof v3Pics === "object" && Object.keys(v3Pics).some(function (k) { return v3Pics[k] && !v3Pics[k].ok; })) { return "pics"; }
    return null;
  }
  function wgHold(plan) {
    var B = plan && plan.bp;
    if (!B || plan.wgFree) { return; }
    if (!plan.wgSince) { plan.wgSince = performance.now(); }
    B.start = Infinity;
  }
  function wgTry(plan) {
    var B = plan && plan.bp;
    if (!B || plan.wgFree || B.start !== Infinity) { return; }
    var why = wgLoading(plan), waited = performance.now() - (plan.wgSince || 0);
    if (why && !(plan.done && waited > WG_MOST)) { wgSay(true); return; }
    // (let go from nought, as long and as fast as the clock was left: 40-works.js, 40-works-day.js)
    plan.wgFree = true;
    B.start = performance.now();
    wgSay(false);
    if (V3) { V3.dirty = true; }
  }
  // Whether the site's clock is being held (for a seek bar, 40-works-video.js:
  // nothing to seek until it is let go; once let go, never held again)
  function wgHolding() {
    var p = WK && WK.plan;
    return !!(p && p.bp && p.bp === bpSite && !p.wgFree && p.bp.start === Infinity);
  }
  // what the phase line says while it waits
  function wgSay(on) {
    var line = V3 && V3.box ? el(".v3-phase", V3.box) : null;
    if (!line) { return; }
    if (on) { if (line.textContent !== TXT.wg_ready) { line.textContent = TXT.wg_ready || ""; } line.dataset.wg = "1"; }
    else if (line.dataset.wg) { delete line.dataset.wg; line.textContent = ""; }
  }
  // held from the moment the clock is set going ...
  if (typeof wkClockStart === "function") {
    var wkClockStartGate = wkClockStart;
    wkClockStart = function (plan) {
      var out = wkClockStartGate.apply(this, arguments);
      try { wgHold(plan); } catch (e) { /* as it was */ }
      return out;
    };
  }
  // ... through the timetable's end (its length then known) ...
  if (typeof wkMakeEnd === "function") {
    var wkMakeEndGate = wkMakeEnd;
    wkMakeEnd = function (plan) {
      var out = wkMakeEndGate.apply(this, arguments);
      try { if (plan && plan.ok !== false) { wgTry(plan); } else if (plan && plan.bp && plan.bp.start === Infinity) { plan.bp.start = performance.now(); } } catch (e) { /* as it was */ }
      return out;
    };
  }
  // ... and let go, each picture, once nothing is still coming
  if (typeof wkBuilding === "function") {
    var wkBuildingGate = wkBuilding;
    wkBuilding = function (model, t) {
      var plan = WK && WK.plan;
      try { if (plan && plan.bp === bpSite && !plan.wgFree) { wgTry(plan); } } catch (e) { /* as it was */ }
      return wkBuildingGate.apply(this, arguments);
    };
  }
