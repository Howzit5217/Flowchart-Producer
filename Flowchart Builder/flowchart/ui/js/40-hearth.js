// ---------------------------------------------------------------------------
//  40-hearth.js -- how many fireplaces a building has: none, the house's
//  one, or one in every home of a duplex, a row or a block -- asked when it
//  is started and in the 3D view's settings; a chimney over each one only
//  (40-outside.js)
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "it really should just be 1 chimney unless you
  // are designing an apartment with fireplaces which should be optional
  // settings too")
  //
  // The setting is the house's own (hearths: auto, none, one, each); auto is
  // one for a house in a style with a chimney, none for anything else
  // (ybFireMode).  Changed in the view, the fireplaces put in for the house
  // (n.hearth) are taken out and put in again as asked; one put down by hand
  // stays where it is.
  var HH_KINDS = ["none", "one", "each"];
  function hhHomes(type) { return type === "house" || type === "cabin" || !type ? 1 : typeof YB_MANY === "object" && YB_MANY[type] ? 2 : 0; }

  // ---- asked when it is started: with what is out of doors (40-street.js) ----------------------------
  if (typeof RD_SITE === "object" && RD_SITE.indexOf("hearths") < 0) { RD_SITE.push("hearths"); }
  if (typeof siteAsk === "function") {
    var siteAskHearth = siteAsk;
    siteAsk = function (ui, want) {
      var out = siteAskHearth.apply(this, arguments);
      try {
        var type = want.type || "house", homes = hhHomes(type);
        if (!homes) { return out; }
        var S = want.site || (want.site = {});
        var key = want.style !== undefined ? want.style : (typeof typeOf === "function" ? typeOf(want).style || "" : "");
        var St = key && typeof HOUSE_STYLES === "object" ? HOUSE_STYLES[key] : null;
        ui.head(TXT.hh_head);
        ui.tiles();
        HH_KINDS.forEach(function (k) {
          if (k === "each" && homes < 2) { return; }
          ui.tile(TXT["hh_" + k], "hh_" + k, function () { return ybFireMode(S.hearths !== undefined ? S.hearths : houseOpt("hearths"), type, St) === k; },
                  function () { S.hearths = k; }, true);
        });
      } catch (e) { /* asked as it was */ }
      return out;
    };
  }

  // ---- in the view's settings, the house's tab ---------------------------------------------------
  if (typeof HOUSE_TAB_MORE === "object") {
    HOUSE_TAB_MORE.push(function (sheet, head, tiles, draw) {
      if (typeof groundsNow === "function" && groundsNow() !== "home") { return; }
      var type = typeof lwTypeNow === "function" ? lwTypeNow() : "house", homes = hhHomes(type);
      if (!homes || typeof worldPicker !== "function") { return; }
      head(TXT.hh_head);
      worldPicker(sheet, homes > 1 ? HH_KINDS : ["none", "one"], ybFireNow(null), "hh_", function (k) { hhSet(k); if (draw) { draw(); } });
    });
  }
  function hhSet(k) {
    houseSetOpt("hearths", k);                                 // (its undo step)
    hand.nodes = hand.nodes.filter(function (n) { return !(n.kind === "i_fireplace" && n.hearth); });
    try { ybHearths(0, null); } catch (e) { /* none put in */ }
    picked = null; chosen = null; many = [];
    if (typeof handKeep === "function") { handKeep(); }
    drawHand(); drawHandPanel(); showReport();
    if (typeof V3 !== "undefined" && V3) { V3.kept = null; V3.xrayKept = null; V3.ground = null; V3.dirty = true; if (V3.gl) { V3.gl.scenery = null; } }
  }
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      hh_none: '<path d="M3 17V8h14v9M6.2 17v-5.4h7.6V17M2 8h16"/><path d="M3.4 3.6l13.2 13.2"/>',
      hh_one: '<path d="M3 17V8h14v9M6.2 17v-5.4h7.6V17M2 8h16M6.4 8V3.4h2.8V8"/><path d="M10 16.2c-1.1 0-1.7-.9-1.3-1.9.3-.8 1.3-1.1 1.3-2.2.9.6 1.7 1.5 1.3 2.6-.2.9-.7 1.5-1.3 1.5z"/>',
      hh_each: '<path d="M2 17V9.2l4-3.2 4 3.2V17M10 17V9.2l4-3.2 4 3.2V17"/><path d="M3.4 8.1V4.4h1.5v2.5M11.4 8.1V4.4h1.5v2.5M4.6 17v-3h2.8v3M12.6 17v-3h2.8v3"/>'
    });
  }
