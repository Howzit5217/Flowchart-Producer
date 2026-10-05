// ---------------------------------------------------------------------------
//  40-works-late.js -- what is put into the picture after the building has
//  been taken back to how far it has gone up (40-blueprint.js, 40-works.js):
//  a house's number, its signs, a fence, a ramp's rails ... each in when its
//  part of the work is done, not standing on the empty lot from the first day
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (2026-10-05: things floating over the site while it goes up -- each part
  // that adds to the picture after 40-blueprint.js's step added them to what
  // was already cut back to how far the work has gone, so they were there,
  // whole, from the start.)  Each face the works have seen is marked as the
  // picture is cut back; whatever is put in after, unmarked, is sorted into
  // the part of the work it belongs to (wkGroupOf: the wall line it is on,
  // the room, the lot -- 40-works-site.js's WK.classifyMore) and left out
  // until that part is begun.
  var WK_LATE = { n: 0 };
  if (typeof bpBuilding === "function") {
    var bpBuildingLate = bpBuilding;
    bpBuilding = function (model, t) {
      var got = bpBuildingLate.apply(this, arguments);
      try {
        if (got && got !== model && got.faces && WK.plan && WK.plan.ok && WK.plan.done && bpSite === WK.plan.bp) {
          var st = ++WK_LATE.n;
          for (var i = 0; i < got.faces.length; i++) { got.faces[i].wkSeen = st; }
          got.wkSeen = st;
        }
      } catch (e) { /* as it was */ }
      return got;
    };
  }
  if (typeof v3Build === "function") {
    var v3BuildLate = v3Build;
    v3Build = function () {
      var model = v3BuildLate.apply(this, arguments);
      try { if (model && model.wkSeen && model.faces) { wkLate(model); } } catch (e) { /* as it was */ }
      return model;
    };
  }
  function wkLate(model) {
    var plan = WK.plan;
    if (!plan || !plan.ok || !plan.done || bpSite !== plan.bp || typeof plan.now !== "number") { return; }
    var st = model.wkSeen, T = plan.now, site = plan.site, faces = model.faces, out = null;
    for (var i = 0; i < faces.length; i++) {
      var f = faces[i], keep = true;
      if (f.wkSeen !== st) {
        var g = wkGroupOf(site, f);
        if (g) {
          var R = plan.rv[g.key] || plan.lateR || WK_NOT_YET;
          keep = T >= R.t0;
        }
      }
      if (!keep && !out) { out = faces.slice(0, i); }
      if (keep && out) { out.push(f); }
    }
    if (out) { model.faces = out; }
  }
