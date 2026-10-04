// ---------------------------------------------------------------------------
//  40-storm.js -- the building tried against a storm: strong winds, a
//  hurricane, a tornado, each as fast as such winds are; what holds the
//  roof down, the walls up, the house to its foundation, the windows in,
//  the people safe -- and, a tall building, how far it sways and whether
//  that is felt; what to put in to hold it together; and the storm drawn
//  over the view, what gives way shown red
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "implement weather like strong winds, tornados
  // and other things like that so you can choose between different options
  // and test it against accurate weather and choose what you want to hold
  // the building together or things for like anti swaying for taller
  // buildings")
  //
  // Each storm by its 3-second gust (m/s): a gale and a severe thunderstorm,
  // hurricanes by their Saffir-Simpson category, tornadoes by their
  // Enhanced Fujita rating.  The sums are the design codes', rounded: the
  // wind's pressure for checking what holds, 0.613 V^2 Pa with open
  // country's height factor (0.9 at a house's roof, more higher up), its
  // direction factor (0.85) and the 0.6 the codes take wind at against
  // rated strengths -- about 0.28 V^2; the roof pulled up by that over its
  // area (wind over it and, a window broken, into it), the walls pushed by
  // 1.3 times it over the side the wind meets; each held as the connectors,
  // sheathing and anchors are rated.
  var SM_STORMS = [
    ["gale", 25, "wind"], ["severe", 36, "wind"], ["cat1", 42, "hurricane"], ["cat3", 58, "hurricane"], ["cat5", 78, "hurricane"],
    // (each tornado near the top of its rating's range, 2026-10-04 -- every rating now:
    // EF0 65-85 mph, EF1 86-110, EF2 111-135, EF3 136-165, EF4 166-200, EF5 over 200)
    ["ef0", 38, "tornado"], ["ef1", 47, "tornado"], ["ef2", 58, "tornado"], ["ef3", 70, "tornado"], ["ef4", 84, "tornado"], ["ef5", 92, "tornado"],
    // (2026-10-03, the other things a building is tried by: an earthquake by
    // how hard the ground shakes (g), a flood by how deep the water stands
    // (m), snow by its weight on the ground (kPa), hail by its stones (cm))
    ["quake1", 0.2, "quake"], ["quake2", 0.45, "quake"], ["quake3", 0.8, "quake"],
    ["flood1", 0.6, "flood"], ["flood2", 1.5, "flood"], ["flood3", 3, "flood"],
    ["snow1", 1.5, "snow"], ["snow2", 3, "snow"], ["snow3", 5, "snow"],
    ["hail1", 2.5, "hail"], ["hail2", 5, "hail"], ["hail3", 10, "hail"]
  ];
  var SM_WINDY = { wind: 1, hurricane: 1, tornado: 1 };
  // what can be put in, and what each is worth
  var SM_HOLDS_HOME = ["ties", "straps", "shear", "anchors", "impact", "saferoom", "raised", "rafters", "roofing"];
  var SM_HOLDS_TALL = ["impact", "brace", "outrigger", "damper"];
  function smStormOf(k) { return SM_STORMS.filter(function (s) { return s[0] === k; })[0] || null; }
  function smHold(k) { var h = houseOpt("hold"); return !!(h && typeof h === "object" && h[k]); }
  function smHoldSet(k, v) {
    var h = Object.assign({}, houseOpt("hold") && typeof houseOpt("hold") === "object" ? houseOpt("hold") : {});
    if (v) { h[k] = true; } else { delete h[k]; }
    houseSetOpt("hold", Object.keys(h).length ? h : undefined);
  }
  if (typeof HOUSE_PLAIN === "object") { HOUSE_PLAIN.hold = undefined; }

  // ---- the building, measured --------------------------------------------------------------
  function smBuilding() {
    var P = FLOOR_PX, floors = typeof floorsOf === "function" ? floorsOf() : [], rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    if (!rooms.length) { return null; }
    var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity }, top = 0, levels = {};
    rooms.forEach(function (r) {
      var f = floors.length ? floorAt(floors, r.x, r.y) : null, q = tieBox(r);
      if (!f || f.level === 0) { b.l = Math.min(b.l, q.l); b.r = Math.max(b.r, q.r); b.t = Math.min(b.t, q.t); b.b = Math.max(b.b, q.b); }
      if (!f || f.level >= 0) { top = Math.max(top, (f ? f.z : 0) + ceilOf(r) * P); levels[f ? f.level : 0] = 1; }
    });
    if (b.l === Infinity) { return null; }
    var W = (b.r - b.l) / P, D = (b.b - b.t) / P, S = typeof styleNow === "function" ? styleNow() : null;
    var marks = hand.nodes.filter(function (n) { return n.madeWith; }).sort(function (a, c) { return c.id - a.id; });
    var type = marks.length ? marks[0].madeWith.type || "house" : "house", use = marks.length ? marks[0].madeWith.towerUse || "" : "";
    var storeys = Object.keys(levels).length, wall = top / P;
    var pitch = S && S.pitch && (typeof styleRoofShape !== "function" || styleRoofShape() !== "flat") ? S.pitch : 0;
    var rise = Math.min(W, D) / 2 * Math.tan(pitch * Math.PI / 180);
    var frame = type === "tower" ? "tall" : type === "house" || type === "cabin" || type === "duplex" || type === "townhouses" ? "wood" : "steel";
    if (frame === "wood" && storeys > 4) { frame = "steel"; }
    return { W: Math.max(W, D), D: Math.min(W, D), H: wall + rise, wall: wall, rise: rise, storeys: storeys, type: type, use: use, frame: frame, tall: wall > 40 };
  }

  // ---- tried --------------------------------------------------------------------------------
  // (2026-10-04, asked: "80mph winds are destroying houses when in reality
  // it needs to be a lot stronger than that" -- "do your research on
  // tornados, their wind speeds and the damage caused by them ... for these
  // houses and other buildings and how they were built")  The checks below
  // used to set the wind as the codes take it for design (six tenths of it)
  // against what each part is rated for -- a margin of two or three over
  // what breaks it -- and the storm let loose broke each part there: a long
  // ranch's walls at 80 mph.  Now each is what the wind really does against
  // what really breaks it, and then kept within what the damage surveys
  // find for that kind of building: the Enhanced Fujita scale's degrees of
  // damage (Texas Tech for the National Weather Service, 2006, as the Storm
  // Prediction Center gives them), the 3-second gust at 10 m in mph, from
  // the least it was seen at to the most.
  //   A house of wood (FR12): windows broken 79-114 (expected 96); the roof's
  //   deck lifted 81-116 (97) to large parts of the roof gone 104-142 (122);
  //   shifted off its foundation 103-141 (121); its outside walls down
  //   113-153 (132); most walls 127-178 (152); all 142-198 (170); the slab
  //   swept clean 165-220 (200).  Apartments, condos (ACT): the roof's deck
  //   107-146, its structure 120-158, the top storey's walls 138-184, the
  //   top two storeys 155-205.  A small shop or cafe (SRB): glass 72-103,
  //   the roof's deck 81-119 to the whole roof 101-140, its outside walls
  //   120-159, all of it 143-193.  A strip mall (SM): glass 72-105, deck
  //   84-122, roof 103-143, walls 117-165, all 147-198.  A school (ES):
  //   windows 71-106, deck 82-121, roof 108-148, walls 117-180, all 152-203.
  //   An office, up to four storeys (LRB): glass 83-122, deck 83-120, roof
  //   114-157, walls 122-167, all 161-221.  Five storeys and up (MROB,
  //   HROB): glass low down 83-120, the curtain wall's anchors 110-157.
  // What each is built with puts it in that range: a house's roof held by
  // toenails, by hurricane clips or by straps (Reed et al. 1997: toenails
  // give at about 1.9 kN each; clips, straps about 5.5 and 9), its walls
  // braced by sheathing or not, its sill bolted down or anchored -- the way
  // Prevatt's surveys of Tuscaloosa and Joplin found houses come apart.
  var SM_DOD = {
    wood: { windows: [79, 114], roof: [81, 142], walls: [113, 153], shear: [113, 178], shift: [103, 141], held: [141, 220] },
    act: { windows: [79, 114], roof: [107, 158], walls: [138, 184], held: [155, 205] },
    srb: { windows: [72, 103], roof: [81, 140], walls: [120, 159], held: [143, 193] },
    sm: { windows: [72, 105], roof: [84, 143], walls: [117, 165], held: [147, 198] },
    es: { windows: [71, 106], roof: [82, 148], walls: [117, 180], held: [152, 203] },
    lrb: { windows: [83, 122], roof: [83, 157], walls: [122, 167], held: [161, 221] },
    // (and, as they are not torn apart here, the roof's structure lifted and
    // the curtain walls and the walls inside broken through)
    mrob: { windows: [83, 120], skin: [110, 150], roof: [118, 158], walls: [120, 167] },
    hrob: { windows: [83, 120], skin: [110, 157], roof: [123, 183], walls: [123, 172] }
  };
  var SM_MPH = 0.44704;
  function smClass(B) {
    if (B.frame === "wood") { return "wood"; }
    if (B.frame === "tall") { return B.storeys > 20 ? "hrob" : "mrob"; }
    var t = B.type;
    return t === "apartments" || t === "condos" ? "act" : t === "school" ? "es" : t === "mall" ? "sm"
         : t === "shop" || t === "boutique" || t === "cafe" ? "srb" : "lrb";
  }
  // a part's range, m/s; and a speed kept within it
  function smBand(B, part) { var r = SM_DOD[smClass(B)][part]; return r ? [r[0] * SM_MPH, r[1] * SM_MPH] : null; }
  function smWithin(v, band) { return band ? Math.max(band[0], Math.min(band[1], v)) : v; }
  // Each check: what the storm does, what holds, and whether it holds --
  // and `at`, the gust (m/s) it gives way at, which the storm let loose
  // (40-stormfx.js) breaks it at too.
  function smTry(key) {
    var St = smStormOf(key), B = smBuilding();
    if (!St || !B) { return null; }
    if (!SM_WINDY[St[2]]) { return smTryHazard(St, B); }
    var V = St[1], hf = Math.pow(Math.max(B.H, 8) / 8, 0.2), qh = 0.47 * V * V * hf;      // Pa, at its roof, as the wind is
    var out = [], tornado = St[2] === "tornado", wood = B.frame === "wood";
    // (what is flying: a tornado's from EF0 up, a hurricane's from category 1)
    var debris = (St[2] === "hurricane" && V >= 42) || (tornado && V >= 38);
    // a speed as a row: what it needs and has at this storm's speed, both going as the speed squared
    function row(k, at, need, more) {
      var r = Object.assign({ k: k, ok: V < at, at: at }, more || {});
      if (need !== undefined) { r.need = need; r.have = need * (at / V) * (at / V); }
      return r;
    }
    // where a building that is not wood stands in its range: about where the surveys expect it
    function mid(part, k) { var b = smBand(B, part); return b ? b[0] + (b[1] - b[0]) * k : null; }
    // the windows: flying debris breaks them, and the wind gets in under the roof
    var winBand = smBand(B, "windows"), atWin = smHold("impact") ? smBand(B, wood ? "walls" : "windows")[1] : winBand[0] + (winBand[1] - winBand[0]) * 0.45;
    var broken = debris && V >= atWin;
    if (debris) { out.push(row("windows", atWin, undefined, { said: smHold("impact") ? TXT.sm_win_ok : TXT.sm_win_bad, fix: smHold("impact") ? null : "impact" })); }
    // the roof, pulled up -- shut, and with the wind in through a broken window
    var Ar = B.W * B.D * 1.1, upPer = function (inside) { return qh * (0.9 + inside) * Ar / 1000; };   // kN
    if (wood) {
      var conns = Math.round(2 * B.W / 0.61) + 2, each = smHold("straps") ? 9 : smHold("ties") ? 5.5 : 1.9;
      var hold = 0.9 * 0.6 * Ar + conns * each, band = smBand(B, "roof");
      var atShut = smWithin(V * Math.sqrt(hold / upPer(0.18)), band), atOpen = smWithin(V * Math.sqrt(hold / upPer(0.55)), band);
      out.push(row("roof", broken ? atOpen : atShut, upPer(broken ? 0.55 : 0.18), { shut: atShut, open: atOpen, fix: smHold("straps") ? null : smHold("ties") ? "straps" : "ties" }));
    } else {
      out.push(row("roof", mid("roof", 0.3), upPer(broken ? 0.55 : 0.18), { fix: null }));
    }
    // the walls, pushed over sideways (racking): a wood house braced by its
    // walls along the wind and the rooms' walls inside -- plaster and siding
    // (about 3.3 kN a metre where they break), or sheathing nailed to hold (11)
    var push = qh * 1.3 * B.W * B.wall / 1000;                                   // kN on the long side
    if (wood) {
      var holdW = (smHold("shear") ? 11 : 3.3) * 3 * B.D;
      out.push(row("walls", smWithin(V * Math.sqrt(holdW / push), smBand(B, smHold("shear") ? "shear" : "walls")), push,
                   { fix: smHold("shear") ? null : "shear" }));
    } else {
      out.push(row("walls", mid("walls", 0.4), push, { fix: null }));
    }
    // the house to its foundation: slid, or lifted off it by its roof -- its
    // weight and the bolts in its sill (pulled through it at about 3 kN
    // each, sheared at 8) against it; anchored, plate washers and straps
    // to the studs (15) -- and a building of steel or concrete built into
    // its foundation, gone with it only when all of it goes
    if (B.frame !== "tall") {
      var weight = (wood ? 1.6 : 6.5) * B.W * B.D * B.storeys, bolts = Math.round(2 * (B.W + B.D) / 1.8);   // kN
      if (wood) {
        var anch = smHold("anchors"), up = upPer(broken ? 0.55 : 0.18);
        var holdUp = 0.9 * weight + bolts * (anch ? 15 : 3), holdA = 0.9 * weight * 0.5 + bolts * (anch ? 15 : 8);
        var atUp = V * Math.sqrt(holdUp / up), atSlide = V * Math.sqrt(holdA / push), lifted = atUp < atSlide;
        // (and each on its own for the storm let loose: lifted by its roof only while the roof is on it)
        var atAnch = smWithin(Math.min(atUp, atSlide), smBand(B, anch ? "held" : "shift"));
        out.push(row("anchors", atAnch, lifted ? up : push,
                     { lift: lifted, up: Math.max(atAnch, Math.min(atUp, atAnch * 1.5)), slide: Math.max(atAnch, atSlide), fix: anch ? null : "anchors" }));
      } else {
        out.push(row("anchors", mid("held", 0.4), push, { lift: false, fix: null }));
      }
    }
    // a tall building: how far its top moves, and whether that is felt --
    // built to sway no more than its height over 400 in a strong wind of
    // 40 m/s, as towers are; in a hurricane or a tornado held to what it
    // can stand (height over 200), what is felt then beside the point
    if (B.tall) {
      var stiff = 1 + (smHold("brace") ? 0.35 : 0) + (smHold("outrigger") ? 0.6 : 0), damp = 1 - (smHold("damper") ? 0.45 : 0);
      var drift = 0.0024 * (V * V) / (40 * 40) / stiff, sway = drift * B.H * 100;      // its top, cm
      var storm = St[2] !== "wind", lim = storm ? 1 / 200 : 1 / 400;
      var feet = typeof feetHere === "function" && feetHere();
      out.push({ k: "sway", ok: drift <= lim, said: say("sm_sway", { move: feet ? Math.round(sway / 2.54) + " in" : Math.round(sway) + " cm", limit: feet ? Math.round(B.H * 100 * lim / 2.54) + " in" : Math.round(B.H * 100 * lim) + " cm" }),
                 fix: smHold("outrigger") ? (smHold("brace") ? null : "brace") : "outrigger" });
      if (!storm) {
        var feel = 14 * Math.pow(V / 30, 2.2) / Math.sqrt(stiff) * damp;          // milli-g
        var limit = B.type === "office" || B.use === "offices" ? 25 : 15;           // (offices take more than homes)
        out.push({ k: "feel", ok: feel <= limit, said: say(feel <= 5 ? "sm_feel_none" : feel <= limit ? "sm_feel_some" : "sm_feel_bad", { mg: Math.round(feel) }), fix: smHold("damper") ? null : "damper" });
      }
    }
    // the people: through the worst tornadoes only in a room built for it
    if (tornado && V >= 60 && B.frame === "wood") {
      out.push({ k: "people", ok: smHold("saferoom"), said: smHold("saferoom") ? TXT.sm_safe_ok : TXT.sm_safe_bad, fix: "saferoom" });
    }
    return { storm: St, V: V, q: qh, list: out, B: B, ok: out.every(function (c) { return c.ok; }) };
  }
  // ---- the other hazards ------------------------------------------------------------------------
  // An earthquake: the building's weight thrown sideways as hard as the
  // ground shakes, two and a half times over (a building swings with it),
  // less as far as it can give without breaking -- against its walls and
  // what holds it to its foundation; a brick chimney falls at a quarter of
  // g, tall narrow furniture at a fifth.  A flood: the water pushing on the
  // walls as deep as it stands (to about a metre over the floor, when it
  // comes in) and running past, and lifting the house by as much water as
  // it keeps out under its floor; inside, if it is over the floor.  Snow:
  // seven tenths of the ground's weight on the roof (less on a steep one it
  // slides off), against what its rafters carry.  Hail: glass broken from
  // stones of 4 cm, roofing from 3 cm (an impact-rated roof to 5.5 cm),
  // solar panels from 4.5 cm.
  function smTryHazard(St, B) {
    var k = St[2], a = St[1], out = [], weight = (B.frame === "wood" ? 1.6 : 6.5) * B.W * B.D * B.storeys;
    var anchors = smHold("anchors") || B.frame !== "wood" ? Math.round(2 * (B.W + B.D) / 1.2) * 9 + 4 * 25 : 0;
    var wood = B.frame === "wood";
    if (k === "quake") {
      // (what a frame carries sideways before it breaks, as a share of its
      // own weight: a light wood house braced by its sheathing half of it, a
      // steel or concrete frame a little less, an old house without the
      // sheathing under a third)
      var R = wood ? (smHold("shear") ? 3 : 1.5) : B.frame === "steel" ? 4 : 5, base = a * 2.5 * weight / R;
      var holdW = weight * (wood ? (smHold("shear") ? 0.5 : 0.3) : B.frame === "steel" ? 0.45 : 0.4);
      out.push({ k: "walls", ok: holdW >= base, need: base, have: holdW, fix: wood && !smHold("shear") ? "shear" : null });
      // (a steel or concrete frame is built into its foundation)
      if (wood) {
        var holdA = 0.6 * weight * (anchors ? 0.45 : 0.25) + anchors;
        out.push({ k: "anchors", ok: holdA >= base, need: base, have: holdA, fix: wood && !smHold("anchors") ? "anchors" : null });
      }
      if (smChimneys()) { out.push({ k: "chimney", ok: a < 0.25, said: a < 0.25 ? TXT.sm_chim_ok : TXT.sm_chim_bad, fix: null }); }
      out.push({ k: "contents", ok: a < 0.2, said: a < 0.2 ? TXT.sm_shelf_ok : TXT.sm_shelf_bad, fix: null });
    } else if (k === "flood") {
      var floorH = smHold("raised") ? 2.6 : 0.45, over = a - floorH, v = a >= 2.5 ? 3 : 1.5, d = Math.min(a, floorH + 0.9);
      var push = (0.5 * 9.81 * d * d + 0.5 * 1.25 * v * v * a) * B.W, lift = 9.81 * B.W * B.D * Math.max(0, Math.min(a, floorH)) * 0.35;
      if (B.frame !== "tall") {
        var holdA2 = 0.6 * weight * (anchors ? 0.45 : 0.25) + anchors, holdUp = 0.6 * weight + anchors * 1.5, lifted = lift / holdUp > push / holdA2;
        out.push({ k: "anchors", ok: holdA2 >= push && holdUp >= lift, need: lifted ? lift : push, have: lifted ? holdUp : holdA2, lift: lifted,
                   fix: wood && !smHold("anchors") ? "anchors" : null });
      }
      // the walls bent in by the water against them (studs take about 9 kPa)
      var head = Math.max(0, Math.min(over, 1.2)), span = Math.max(0.01, head);
      if (wood) { out.push({ k: "walls", ok: head * 9.81 <= 9, need: head * 9.81 * B.W * span, have: 9 * B.W * span, fix: smHold("raised") ? null : "raised" }); }
      out.push({ k: "contents", ok: over <= 0, said: over <= 0 ? TXT.sm_wet_ok : say("sm_wet_bad", { deep: smDepth(over) }), fix: smHold("raised") ? null : "raised" });
    } else if (k === "snow") {
      var S = typeof styleNow === "function" ? styleNow() : null;
      var pitch = S && S.pitch && (typeof styleRoofShape !== "function" || styleRoofShape() !== "flat") ? S.pitch : 0;
      var load = 0.7 * a * (pitch <= 30 ? 1 : Math.max(0, 1 - (pitch - 30) / 40)), Ar = B.W * B.D * 1.1;
      var carry = wood ? (smHold("rafters") ? 3.8 : 1.9) : B.frame === "steel" ? 2.4 : 4.0;
      out.push({ k: "roof", ok: carry >= load, need: load * Ar, have: carry * Ar, fix: wood && !smHold("rafters") ? "rafters" : null });
    } else if (k === "hail") {
      var glassOk = smHold("impact") || a < 4, roofOk = smHold("roofing") ? a < 5.5 : a < 3;
      out.push({ k: "windows", ok: glassOk, said: glassOk ? TXT.sm_win_ok : TXT.sm_hail_win, fix: smHold("impact") ? null : "impact" });
      out.push({ k: "cover", ok: roofOk, said: roofOk ? TXT.sm_cover_ok : TXT.sm_cover_bad, fix: smHold("roofing") ? null : "roofing" });
      if (houseOpt("solar")) { out.push({ k: "solar", ok: a < 4.5, said: a < 4.5 ? TXT.sm_pv_ok : TXT.sm_pv_bad, fix: null }); }
    }
    return { storm: St, V: a, q: 0, list: out, B: B, ok: out.every(function (c) { return c.ok; }) };
  }
  // whether the house has a brick or stone chimney (40-outside.js, the style's own)
  function smChimneys() {
    // (a chimney only over a fireplace, 40-outside.js: brick or stone in a style that has one, steel flues otherwise)
    if (!hand.nodes.some(function (n) { return n.kind === "i_fireplace"; })) { return false; }
    var S = typeof styleNow === "function" ? styleNow() : null;
    return !!(S && S.chimney && S.chimney !== "none");
  }
  function smDepth(m) {
    var feet = typeof feetHere === "function" && feetHere();
    return feet ? Math.round(m * 39.37) + " in" : (m < 1 ? Math.round(m * 100) + " cm" : m.toFixed(1) + " m");
  }
  // each by its own measure
  function smMeasure(s) {
    var feet = typeof feetHere === "function" && feetHere();
    if (SM_WINDY[s[2]]) { return smSpeed(s[1]); }
    if (s[2] === "quake") { return s[1] + " g"; }
    if (s[2] === "flood") { return smDepth(s[1]); }
    if (s[2] === "snow") { return feet ? Math.round(s[1] * 20.885) + " psf" : s[1] + " kPa"; }
    return feet ? (s[1] / 2.54).toFixed(1).replace(/\.0$/, "") + " in" : s[1] + " cm";
  }
  function smSpeed(V) {
    var feet = typeof feetHere === "function" && feetHere();
    return feet ? Math.round(V * 2.23694) + " mph" : Math.round(V * 3.6) + " km/h";
  }
  function smForce(kN) {
    var feet = typeof feetHere === "function" && feetHere();
    return feet ? Math.round(kN * 224.809).toLocaleString() + " lbf" : Math.round(kN).toLocaleString() + " kN";
  }

  // ---- asked: on the Weather tab, under the weather --------------------------------------------
  function stormSection(sheet, head, tiles, draw) {
    head(TXT.sm_head);
    var grid = document.createElement("div");
    grid.className = "hs-weather hs-pick";
    grid.setAttribute("role", "radiogroup");
    var now = V3 && V3.storm, kindWas = null;
    [["", null]].concat(SM_STORMS).forEach(function (s) {
      // (each kind of hazard under its own name)
      var group = !s[2] ? null : SM_WINDY[s[2]] ? "wind" : s[2];
      if (group && group !== kindWas) {
        kindWas = group;
        var gh = document.createElement("div");
        gh.className = "sm-group";
        gh.textContent = TXT["sm_g_" + group];
        grid.appendChild(gh);
      }
      var k = s[0], b = document.createElement("button"), on = (now || "") === k;
      b.type = "button";
      b.className = "hs-wx" + (on ? " on" : "");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.innerHTML = houseIcon(k ? "sm_" + s[2] : "sm_none") + "<span></span>";
      b.lastChild.textContent = k ? TXT["sm_" + k] + " · " + smMeasure(s) : TXT.sm_none;
      b.onclick = function () { V3.storm = k || null; smRun(); V3.dirty = true; if (typeof houseFresh === "function") { houseFresh(); } draw(); };
      grid.appendChild(b);
    });
    sheet.appendChild(grid);
    var T = now ? smTry(now) : null;
    if (T) {
      var list = document.createElement("div");
      list.className = "sm-list";
      T.list.forEach(function (c) {
        var row = document.createElement("div");
        row.className = "sm-row " + (c.ok ? "sm-ok" : "sm-bad");
        var said = c.said || say(c.ok ? "sm_holds" : "sm_gives", { need: smForce(c.need), have: smForce(c.have) });
        // (and the gust it gives way at, by the damage surveys: the storm let loose breaks it there)
        if (c.at && SM_WINDY[T.storm[2]] && TXT.sm_at_ok) { said += " · " + say(c.ok ? "sm_at_ok" : "sm_at_bad", { speed: smSpeed(c.at) }); }
        row.innerHTML = '<b class="sm-mark" aria-hidden="true">' + (c.ok ? "✓" : "✕") + '</b><span><em></em> <span class="sm-said"></span></span>';
        row.querySelector("em").textContent = TXT["sm_k_" + c.k];
        row.querySelector(".sm-said").textContent = said;
        if (!c.ok && c.fix) {
          var fix = document.createElement("button");
          fix.type = "button";
          fix.className = "btn small";
          fix.textContent = say("sm_add", { what: TXT["sm_h_" + c.fix] });
          fix.onclick = function () { smHoldSet(c.fix, true); draw(); };
          row.appendChild(fix);
        }
        list.appendChild(row);
      });
      var sum = document.createElement("p");
      sum.className = "hs-note sm-sum";
      var own = T.storm && (T.storm[2] === "fire" ? "wf" : T.storm[2] === "drill" ? "ev" : null);
      sum.textContent = own && TXT[own + "_all_ok"] ? (T.ok ? TXT[own + "_all_ok"] : TXT[own + "_not_ok"]) : (T.ok ? TXT.sm_all_ok : TXT.sm_not_ok);
      list.appendChild(sum);
      sheet.appendChild(list);
      if (typeof fxSection === "function") { fxSection(sheet); }
    }
    // what holds it together, as asked for
    var B = smBuilding();
    head(TXT.sm_hold_head);
    // (a wildfire's own, chosen: 40-wildfire.js)
    var holdsNow = (typeof wfHolds === "function" && wfHolds()) || (typeof evHolds === "function" && evHolds()) || (B && B.tall ? SM_HOLDS_TALL : SM_HOLDS_HOME);
    tiles(holdsNow.map(function (k) {
      return { icon: "sm_h_" + k, label: TXT["sm_h_" + k], on: smHold(k), set: function (v) { smHoldSet(k, v); } };
    }));
  }

  // ---- in 3D: the storm over the picture, and what gives way red -------------------------------
  // (debris and rain across the view, a funnel out on the land in a
  // tornado; the parts that do not hold tinted)
  var smBits = null;
  // (the storm's own time: stopped or slowed with it, 40-damage.js)
  function smNow(t) { return typeof dmClock === "function" ? dmClock(t) : t; }
  function smRun() {
    if (!V3 || !V3.box) { return; }
    var cv = el(".v3-storm", V3.box), St = V3.storm ? smStormOf(V3.storm) : null;
    if (!St || V3.scene === "space" || St[2] === "quake" || St[2] === "drill") { if (cv) { cv.remove(); } smBits = null; return; }
    if (!cv) {
      cv = document.createElement("canvas");
      cv.className = "v3-storm";
      cv.setAttribute("aria-hidden", "true");
      var after = el(".v3-bar", V3.box);
      V3.box.insertBefore(cv, after ? after : V3.box.firstChild);
    }
    var box = V3.box, rnd = gl3Rand(11), bits = [], still = typeof STILL !== "undefined" && STILL;
    var strong = SM_WINDY[St[2]] ? Math.min(1, (St[1] - 20) / 70) : St[2] === "hail" ? 0.45 : St[2] === "flood" ? 0.3 : 0.05;
    var snowy = St[2] === "snow", hail = St[2] === "hail", wet = !snowy;
    // (2026-10-03: "update the look for the different weather events too so
    // they have better texturing and look better")  Rain in three depths --
    // far off fine and faint, close by long and bright -- driven the way the
    // wind blows across the view, in curtains that sweep past in the gusts;
    // splashes where it lands; hail bouncing; snow near and far, streaming
    // flat in a wind; forked lightning in a storm, the sky lit by it.
    var count = snowy ? 520 : 260 + Math.round(strong * 520) + (St[2] === "hurricane" ? 260 : 0);
    for (var i = 0; i < count; i++) { bits.push({ x: rnd(), y: rnd(), s: 0.5 + rnd(), k: rnd() < 0.12 ? 1 : 0, p: rnd() * 6.28, l: rnd() }); }
    var me = { cv: cv, St: St, bits: bits, t0: smNow(performance.now()), bolt: null, flash: 0, next: 1.5 + rnd() * 3, rnd: rnd };
    smBits = me;
    var thunder = SM_WINDY[St[2]] && St[1] >= 33 || hail;
    function frame(now) {
      if (smBits !== me || !V3 || V3.box !== box || !box.isConnected) { return; }
      now = smNow(now);
      var dpr = window.devicePixelRatio || 1, W = Math.max(1, box.clientWidth), H = Math.max(1, box.clientHeight);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      var g = cv.getContext("2d"), t = (now - me.t0) / 1000, dt = Math.min(0.05, me.last ? (now - me.last) / 1000 : 1 / 60);
      me.last = now;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      var wind = smWindOnScreen(St), side = wind.side, gust = wind.k, walking = V3.mode === "walk";
      // a little darker over all (the sky itself is the storm's, 40-stormfx.js)
      g.fillStyle = "rgba(30,36,44," + (0.05 + strong * 0.12) + ")";
      g.fillRect(0, 0, W, H);
      if (St[2] === "fire" && typeof wfOverlay === "function") {
        // a wildfire: ash and embers, a warm haze (40-wildfire.js)
        wfOverlay(g, W, H, t, me, side);
      } else if (snowy) {
        // snow: far flakes small and slow, near ones large; in a wind, streaming
        var drift = side * (0.04 + gust * 0.5);
        me.bits.forEach(function (d) {
          var near = d.l, r = 0.6 + near * near * 3.2, fall = 0.035 + near * 0.09;
          var x = ((d.x + Math.sin(t * 0.7 + d.p) * 0.012 + t * drift * (0.4 + near)) % 1 + 1) % 1 * W, y = ((d.y + t * fall * d.s) % 1) * H;
          g.fillStyle = "rgba(250,251,253," + (0.35 + near * 0.55) + ")";
          if (gust > 0.3) { g.fillRect(x, y - r * 0.4, r * (1 + gust * 3) * Math.sign(side || 1), r * 0.8); }
          else { g.beginPath(); g.arc(x, y, r, 0, 6.29); g.fill(); }
        });
      } else {
        var slant = side * (0.18 + gust * 1.5);
        // the curtains: soft sheets of heavier rain sweeping across in the gusts
        if (strong > 0.15) {
          for (var c = 0; c < 4; c++) {
            var cx = ((c * 0.29 + t * (0.05 + gust * 0.12) * (side >= 0 ? 1 : -1)) % 1.4 + 1.4) % 1.4 - 0.2, cw = W * (0.18 + 0.1 * Math.sin(c * 2.1));
            var cg = g.createLinearGradient(cx * W - cw, 0, cx * W + cw, 0), ca = (0.04 + 0.08 * strong) * (0.6 + 0.4 * Math.sin(t * 0.9 + c * 1.7));
            cg.addColorStop(0, "rgba(190,198,208,0)"); cg.addColorStop(0.5, "rgba(190,198,208," + ca.toFixed(3) + ")"); cg.addColorStop(1, "rgba(190,198,208,0)");
            g.fillStyle = cg; g.fillRect(cx * W - cw, 0, cw * 2, H);
          }
        }
        // the streaks, in three depths
        var layers = [[0.0, 0.45, 9, 0.6, 0.22, 1.9], [0.45, 0.85, 17, 1.0, 0.36, 1.35], [0.85, 1.01, 32, 1.7, 0.5, 1.0]];
        layers.forEach(function (L) {
          g.strokeStyle = hail ? "rgba(236,241,246," + (L[4] + 0.25) + ")" : "rgba(200,210,224," + L[4] + ")";
          g.lineWidth = L[3] * (hail ? 1.6 : 1);
          g.beginPath();
          me.bits.forEach(function (d) {
            if (d.k || d.l < L[0] || d.l >= L[1]) { return; }
            var len = L[2] * (hail ? 0.35 : 1) * (0.7 + 0.3 * d.s), v = (hail ? 1.7 : 1.15) * L[5] * d.s;
            var y = ((d.y + t * v) % 1) * (H + len) - len, x = (((d.x + t * slant * 0.12 * L[5]) % 1) + 1) % 1 * (W + 80) - 40;
            g.moveTo(x, y); g.lineTo(x + len * slant, y + len);
          });
          g.stroke();
        });
        // where it lands: splashes on the ground in front of you (walking), hail bouncing
        if (walking) {
          g.strokeStyle = hail ? "rgba(240,244,248,0.7)" : "rgba(214,222,232,0.45)";
          g.lineWidth = 1;
          g.beginPath();
          me.bits.forEach(function (d, i) {
            if (i % 3 || d.k) { return; }
            var life = ((t * (1.6 + d.s) + d.p) % 1), x = d.x * W, y = H * (0.68 + d.y * 0.3), r = (2 + d.l * 5) * life;
            if (hail) { var hop = Math.sin(life * Math.PI) * (6 + d.l * 10); g.moveTo(x + 2, y - hop); g.arc(x, y - hop, 1.5 + d.l * 1.5, 0, 6.29); }
            else { g.moveTo(x - r, y); g.quadraticCurveTo(x, y - r * 0.9, x + r, y); }
          });
          g.stroke();
        }
      }
      // leaves and bits blown across, turning over
      if (SM_WINDY[me.St[2]] && !snowy) {
        me.bits.forEach(function (d) {
          if (!d.k) { return; }
          var x = (((d.x + t * (0.08 + gust * 0.3) * (side >= 0 ? 1 : -1) * d.s) % 1) + 1) % 1 * (W + 40) - 20;
          var y = ((d.y + Math.sin(t * 3 + d.p) * 0.03 + t * 0.04) % 1) * H, sz = (2 + d.l * 5) * d.s;
          g.fillStyle = d.l < 0.5 ? "rgba(92,82,60,0.75)" : "rgba(62,76,48,0.7)";
          g.save(); g.translate(x, y); g.rotate(t * 6 * d.s + d.p); g.fillRect(-sz, -sz * 0.45, sz * 2, sz * 0.9); g.restore();
        });
      }
      // lightning: a forked bolt down from the cloud now and then, the sky lit by it
      if (thunder && !still) {
        me.next -= dt;
        if (me.next <= 0) { me.bolt = smBolt(me.rnd, W, H); me.flash = 1; me.next = 2.5 + me.rnd() * (6 - strong * 3); }
        if (me.flash > 0.02) {
          g.fillStyle = "rgba(225,232,255," + (me.flash * 0.35).toFixed(3) + ")"; g.fillRect(0, 0, W, H);
          if (me.bolt && me.flash > 0.25) {
            g.save(); g.lineJoin = "round"; g.lineCap = "round";
            [[7, "rgba(170,190,255,0.25)"], [3, "rgba(225,232,255,0.7)"], [1.2, "rgba(255,255,255,0.95)"]].forEach(function (st) {
              g.lineWidth = st[0] * (0.6 + me.flash * 0.4); g.strokeStyle = st[1];
              me.bolt.forEach(function (line) { g.beginPath(); line.forEach(function (q, j) { if (j) { g.lineTo(q[0], q[1]); } else { g.moveTo(q[0], q[1]); } }); g.stroke(); });
            });
            g.restore();
          }
          me.flash *= Math.pow(0.04, dt);
        }
      }
      // a tornado: its funnel on the land, off to one side, turning
      // (its funnel out on the land in 3D instead, while the storm is let loose there: 40-stormfx.js)
      if (me.St[2] === "tornado" && !(typeof fxFunnelOn === "function" && fxFunnelOn())) {
        var fx = W * 0.18 + Math.sin(t * 0.3) * W * 0.03, top = H * 0.02, foot = H * 0.62, wide = W * (0.05 + strong * 0.07);
        var grd = g.createLinearGradient(fx - wide, 0, fx + wide, 0);
        grd.addColorStop(0, "rgba(70,72,78,0)"); grd.addColorStop(0.5, "rgba(70,72,78,0.85)"); grd.addColorStop(1, "rgba(70,72,78,0)");
        g.fillStyle = grd;
        g.beginPath(); g.moveTo(fx - wide, top);
        for (var y = top; y <= foot; y += 8) {
          var k = (y - top) / (foot - top), w = wide * (1 - k * 0.85), sway = Math.sin(t * 2 + k * 5) * W * 0.012 * k;
          g.lineTo(fx - w + sway, y);
        }
        for (var y2 = foot; y2 >= top; y2 -= 8) {
          var k2 = (y2 - top) / (foot - top), w2 = wide * (1 - k2 * 0.85), sway2 = Math.sin(t * 2 + k2 * 5) * W * 0.012 * k2;
          g.lineTo(fx + w2 + sway2, y2);
        }
        g.closePath(); g.fill();
        g.fillStyle = "rgba(90,80,64,0.5)";
        for (var j = 0; j < 30; j++) {
          var a = t * 4 + j * 0.7, rr = wide * (0.3 + (j % 5) * 0.12);
          g.fillRect(fx + Math.cos(a) * rr * 1.6, foot - 10 - Math.abs(Math.sin(a * 0.7)) * 40 - (j % 7) * 6, 3, 3);
        }
      }
      if (!still) { requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }
  // The wind as it crosses the view: which way across the screen (-1 left,
  // 1 right) and how hard (0 to about 1.4) -- the storm's own wind where it
  // is let loose (40-stormfx.js), else the storm's measure from the west.
  function smWindOnScreen(St) {
    var V = St[1], dir = [1, 0];
    try {
      if (typeof fxOn === "function" && fxOn() && FX.plan && FX.H) {
        var w = fxWind(FX, FX.H[0], FX.H[1], 10, [0, 0, 0]), l = Math.hypot(w[0], w[1]);
        if (l > 0.5) { dir = [w[0] / l, w[1] / l]; V = l; }
      }
    } catch (e) { /* from the west */ }
    var right = V3.mode === "walk" && V3.me ? [-Math.sin(V3.me.head), Math.cos(V3.me.head)] : [Math.cos(V3.yaw || 0), -Math.sin(V3.yaw || 0)];
    var side = dir[0] * right[0] + dir[1] * right[1];
    return { side: Math.abs(side) < 0.15 ? (side < 0 ? -0.15 : 0.15) : side, k: SM_WINDY[St[2]] ? Math.max(0, Math.min(1.4, (V - 8) / 55)) : 0.1 };
  }
  // A bolt: from the cloud down, wandering, forking now and then.
  function smBolt(rnd, W, H) {
    var lines = [], x = W * (0.15 + rnd() * 0.7), y = -4, bottom = H * (0.35 + rnd() * 0.25), main = [[x, y]];
    while (y < bottom) {
      x += (rnd() - 0.5) * 34; y += 10 + rnd() * 18; main.push([x, y]);
      if (rnd() < 0.18) {
        var bx = x, by = y, fork = [[bx, by]], n = 3 + Math.floor(rnd() * 5), dirx = rnd() < 0.5 ? -1 : 1;
        for (var k = 0; k < n; k++) { bx += dirx * (6 + rnd() * 18); by += 8 + rnd() * 14; fork.push([bx, by]); }
        lines.push(fork);
      }
    }
    lines.unshift(main);
    return lines;
  }
  // what gives way, tinted: the roof red where it would lift, the walls where they would rack
  if (typeof v3Build === "function") {
    var v3BuildStorm = v3Build;
    v3Build = function () {
      var model = v3BuildStorm.apply(this, arguments);
      try {
        // (not while the storm is let loose on it: what gives way is seen going, 40-stormfx.js)
        if (model && V3 && V3.storm && !(typeof fxOn === "function" && fxOn())) {
          var T = smTry(V3.storm), bad = {};
          if (T) { T.list.forEach(function (c) { if (!c.ok) { bad[c.k] = true; } }); }
          if (bad.roof || bad.walls || bad.anchors) {
            // (a red skin a hair over each part that gives way: the roof's own
            // material is what the picture paints it with, not its color)
            var red = { piece: true, color: "#d9473f", edge: "#a8332c", alpha: 0.42, late: true, bare: true, xray: true };
            var amber = { piece: true, color: "#e08a3a", edge: "#b0682a", alpha: 0.34, late: true, bare: true, xray: true };
            var add = [];
            model.faces.forEach(function (f) {
              var h = f.how;
              if (!h || h.xray || f.mesh || !f.pts || !f.n) { return; }
              var look = (h.roof || f.roof) && bad.roof ? red : h.wall && (bad.walls || bad.anchors) ? amber : null;
              if (!look) { return; }
              var n = f.n, off = 1.2;
              add.push({ pts: f.pts.map(function (p) { return [p[0] + n[0] * off, p[1] + n[1] * off, (p[2] || 0) + n[2] * off]; }), n: n, how: look, node: f.node });
            });
            Array.prototype.push.apply(model.faces, add);
          }
        }
      } catch (e) { /* as it is */ }
      return model;
    };
  }
  if (typeof v3Open === "function") {
    var v3OpenStorm = v3Open;
    v3Open = function () {
      var out = v3OpenStorm.apply(this, arguments);
      try { if (V3 && V3.storm) { smRun(); } } catch (e) { /* calm */ }
      return out;
    };
  }
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      sm_none: '<circle cx="10" cy="10" r="6.4"/><path d="M5.6 14.4l8.8-8.8"/>',
      sm_wind: '<path d="M2.6 7.4h9.6a2.4 2.4 0 1 0-2.4-2.4M2.6 11h12.6a2.4 2.4 0 1 1-2.4 2.4M2.6 14.6h6"/>',
      sm_hurricane: '<circle cx="10" cy="10" r="2.2"/><path d="M10 7.8C10 4 13 2.6 16 3.4 13.6 4.2 12.4 6 12.2 8M10 12.2c0 3.8-3 5.2-6 4.4 2.4-.8 3.6-2.6 3.8-4.6"/>',
      sm_tornado: '<path d="M2.6 4h14.8M4.2 7.2h11M6 10.4h7.4M7.6 13.6h4.4M9.2 16.6h1.8"/>',
      sm_h_ties: '<path d="M3 13.4 10 6.6l7 6.8"/><path d="M8.4 9.6v3.2h3.2V9.6"/>',
      sm_h_straps: '<path d="M10 2.6v14.8M6.4 4.6h7.2M6.4 15.4h7.2M7.6 8.4h4.8M7.6 11.6h4.8"/>',
      sm_h_shear: '<rect x="3.4" y="3.4" width="13.2" height="13.2" rx="1"/><path d="M3.4 16.6 16.6 3.4"/>',
      sm_h_anchors: '<path d="M10 2.8v10.4M6 13.2a4 4 0 0 0 8 0M7.6 5.2h4.8M3 17.2h14"/>',
      sm_h_impact: '<rect x="4" y="3" width="12" height="14" rx="1"/><path d="M4 10h12M10 3v14M6.4 5.6l2 2M12 12.4l1.6 1.6"/>',
      sm_h_saferoom: '<path d="M10 2.6 16.4 5v4.6c0 4-2.8 6.8-6.4 7.8-3.6-1-6.4-3.8-6.4-7.8V5z"/><path d="M7.2 10l2 2 3.8-4"/>',
      sm_h_brace: '<path d="M5 17.4V2.6M15 17.4V2.6M5 2.6l10 14.8M15 2.6 5 17.4M5 10h10"/>',
      sm_h_outrigger: '<path d="M10 2.6v14.8M3 8.4h14M3 8.4l7-3M17 8.4l-7-3M4 17.4V8.4M16 17.4V8.4"/>',
      sm_quake: '<path d="M2 10h3l1.6-4 2.4 9 2.4-11 2 8 1.4-2H18"/>',
      sm_flood: '<path d="M2.6 12.4c1.2 0 1.8-1 3-1s1.8 1 3 1 1.8-1 3-1 1.8 1 3 1 1.4-.6 2.8-.8M2.6 16c1.2 0 1.8-1 3-1s1.8 1 3 1 1.8-1 3-1 1.8 1 3 1 1.4-.6 2.8-.8M5.4 9V5.4L10 2.6l4.6 2.8V9"/>',
      sm_snow: '<path d="M10 2.6v14.8M3.6 6.3l12.8 7.4M3.6 13.7l12.8-7.4M8.2 3.8 10 5.6l1.8-1.8M8.2 16.2 10 14.4l1.8 1.8"/>',
      sm_hail: '<path d="M5 8.6a3.4 3.4 0 0 1 1.2-6.4 4.6 4.6 0 0 1 8.6 1.4A2.8 2.8 0 0 1 15 9.2H5z"/><circle cx="6.4" cy="12.8" r="1.2"/><circle cx="10.4" cy="15.6" r="1.2"/><circle cx="13.6" cy="12" r="1.2"/>',
      sm_h_raised: '<path d="M3.4 9.4 10 3.6l6.6 5.8M5 8v4.4h10V8M6.4 12.4v5M13.6 12.4v5M2.6 17.4h14.8"/>',
      sm_h_rafters: '<path d="M2.6 12.6 10 4.4l7.4 8.2M5.4 9.4v3.2M10 4.4v8.2M14.6 9.4v3.2M2.6 12.6h14.8M5.4 9.4 10 12.6l4.6-3.2"/>',
      sm_h_roofing: '<path d="M2.6 10.4 10 3.4l7.4 7"/><path d="M4.6 8.6v8.4h10.8V8.6"/><path d="M7.4 11.4l2 2 3.4-3.6"/>',
      sm_h_damper: '<rect x="6" y="6" width="8" height="6" rx="1"/><path d="M10 2.6V6M4 17.4l2-5.4M16 17.4l-2-5.4M8 12v2.6M12 12v2.6"/>'
    });
  }
