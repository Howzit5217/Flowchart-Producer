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
    ["ef1", 47, "tornado"], ["ef3", 70, "tornado"], ["ef5", 92, "tornado"],
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
  // Each check: what the storm does, what holds, and whether it holds.
  function smTry(key) {
    var St = smStormOf(key), B = smBuilding();
    if (!St || !B) { return null; }
    if (!SM_WINDY[St[2]]) { return smTryHazard(St, B); }
    var V = St[1], q10 = 0.28 * V * V, qh = q10 * Math.pow(Math.max(B.H, 8) / 8, 0.2);   // Pa, at its roof
    var out = [], tornado = St[2] === "tornado", debris = (St[2] === "hurricane" && V >= 50) || (tornado && V >= 55);
    var windowsOk = smHold("impact") || B.frame === "tall";
    // the windows: flying debris breaks them, and the wind gets in under the roof
    if (debris) { out.push({ k: "windows", ok: windowsOk, said: windowsOk ? TXT.sm_win_ok : TXT.sm_win_bad, fix: "impact" }); }
    var inside = debris && !windowsOk ? 0.55 : 0.18;
    // the roof, pulled up
    var Ar = B.W * B.D * 1.1, up = qh * (0.9 + inside) * Ar / 1000;          // kN
    if (B.frame === "wood") {
      var conns = Math.round(2 * B.W / 0.61) + 2, each = smHold("straps") ? 4.5 : smHold("ties") ? 2.4 : 0.45;
      var hold = 0.6 * 0.6 * Ar + conns * each;
      out.push({ k: "roof", ok: hold >= up, need: up, have: hold, fix: smHold("ties") ? "straps" : "ties" });
    } else {
      var holdR = 0.6 * (B.frame === "tall" ? 4.0 : 2.4) * Ar + (B.frame === "tall" ? 3.0 : 1.2) * Ar;
      out.push({ k: "roof", ok: holdR >= up, need: up, have: holdR, fix: null });
    }
    // the walls, pushed over sideways (racking)
    var push = qh * 1.3 * B.W * B.wall / 1000;                                 // kN on the long side
    var perM = B.frame === "wood" ? (smHold("shear") ? 5.1 : 1.6) : B.frame === "steel" ? 22 : 90;
    var holdW = perM * 2 * B.D * (B.frame === "wood" ? 1 : Math.max(1, B.storeys * 0.6));
    out.push({ k: "walls", ok: holdW >= push, need: push, have: holdW, fix: B.frame === "wood" && !smHold("shear") ? "shear" : null });
    // the house to its foundation: slid or tipped -- or lifted off it, the
    // roof's pull up taken by the whole house, against its weight and what
    // ties it down (2026-10-03, the storm let loose: a house not anchored
    // is carried away whole)
    if (B.frame !== "tall") {
      var weight = (B.frame === "wood" ? 1.6 : 6.5) * B.W * B.D * B.storeys;  // kN
      var anchors = smHold("anchors") || B.frame !== "wood" ? Math.round(2 * (B.W + B.D) / 1.2) * 9 + 4 * 25 : 0;
      var holdA = 0.6 * weight * (anchors ? 0.45 : 0.25) + anchors;     // (a sill only nailed down slides sooner)
      var holdUp = 0.6 * weight + anchors * 1.5, lifted = up / holdUp > push / holdA;
      out.push({ k: "anchors", ok: holdA >= push && holdUp >= up, need: lifted ? up : push, have: lifted ? holdUp : holdA, lift: lifted,
                 fix: B.frame === "wood" && !smHold("anchors") ? "anchors" : null });
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
    if (hand.nodes.some(function (n) { return n.kind === "i_fireplace"; })) { return true; }
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
      sum.textContent = T.ok ? TXT.sm_all_ok : TXT.sm_not_ok;
      list.appendChild(sum);
      sheet.appendChild(list);
      if (typeof fxSection === "function") { fxSection(sheet); }
    }
    // what holds it together, as asked for
    var B = smBuilding();
    head(TXT.sm_hold_head);
    tiles((B && B.tall ? SM_HOLDS_TALL : SM_HOLDS_HOME).map(function (k) {
      return { icon: "sm_h_" + k, label: TXT["sm_h_" + k], on: smHold(k), set: function (v) { smHoldSet(k, v); } };
    }));
  }

  // ---- in 3D: the storm over the picture, and what gives way red -------------------------------
  // (debris and rain across the view, a funnel out on the land in a
  // tornado; the parts that do not hold tinted)
  var smBits = null;
  function smRun() {
    if (!V3 || !V3.box) { return; }
    var cv = el(".v3-storm", V3.box), St = V3.storm ? smStormOf(V3.storm) : null;
    if (!St || V3.scene === "space" || St[2] === "quake") { if (cv) { cv.remove(); } smBits = null; return; }
    if (!cv) {
      cv = document.createElement("canvas");
      cv.className = "v3-storm";
      cv.setAttribute("aria-hidden", "true");
      var after = el(".v3-bar", V3.box);
      V3.box.insertBefore(cv, after ? after : V3.box.firstChild);
    }
    var box = V3.box, rnd = gl3Rand(11), bits = [], still = typeof STILL !== "undefined" && STILL;
    var strong = SM_WINDY[St[2]] ? Math.min(1, (St[1] - 20) / 70) : St[2] === "hail" ? 0.45 : St[2] === "flood" ? 0.3 : 0.05;
    var snowy = St[2] === "snow", hail = St[2] === "hail";
    for (var i = 0; i < 160 + Math.round(strong * 260); i++) { bits.push({ x: rnd(), y: rnd(), s: 0.5 + rnd(), k: rnd() < 0.3 ? 1 : 0, p: rnd() * 6.28 }); }
    var me = { cv: cv, St: St, bits: bits, t0: performance.now() };
    smBits = me;
    function frame(now) {
      if (smBits !== me || !V3 || V3.box !== box || !box.isConnected) { return; }
      var dpr = window.devicePixelRatio || 1, W = Math.max(1, box.clientWidth), H = Math.max(1, box.clientHeight);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      var g = cv.getContext("2d"), t = (now - me.t0) / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      // a darker sky, and rain driven nearly flat
      g.fillStyle = "rgba(40,46,56," + (0.12 + strong * 0.2) + ")";
      g.fillRect(0, 0, W, H);
      var slant = 0.6 + strong * 2.2;
      if (snowy) {
        // (snow: flakes drifting down)
        g.fillStyle = "rgba(250,251,253,0.85)";
        me.bits.forEach(function (d) {
          var x = ((d.x + Math.sin(t * 0.7 + d.p) * 0.02 + t * 0.02 * d.s) % 1) * W, y = ((d.y + t * 0.08 * d.s) % 1) * H;
          g.beginPath(); g.arc(x, y, 1.2 + d.s * 1.4, 0, 6.29); g.fill();
        });
      } else {
        g.strokeStyle = hail ? "rgba(240,244,248,0.8)" : "rgba(205,215,228,0.45)"; g.lineWidth = hail ? 2 : 1; g.beginPath();
        me.bits.forEach(function (d) {
          if (d.k) { return; }
          var x = ((d.x + t * 0.5 * slant * d.s) % 1) * (W + 60) - 30, y = ((d.y + t * (hail ? 1.6 : 0.9) * d.s) % 1) * H;
          g.moveTo(x, y); g.lineTo(x + (hail ? 5 : 18) * slant, y + (hail ? 9 : 12));
        });
        g.stroke();
      }
      // leaves and bits blown across
      g.fillStyle = "rgba(70,62,48,0.75)";
      me.bits.forEach(function (d) {
        if (!d.k || snowy || !SM_WINDY[me.St[2]]) { return; }
        var x = ((d.x + t * 0.35 * slant * d.s) % 1) * (W + 40) - 20, y = ((d.y + Math.sin(t * 3 + d.p) * 0.02 + t * 0.05) % 1) * H;
        g.save(); g.translate(x, y); g.rotate(t * 6 * d.s + d.p); g.fillRect(-3 * d.s, -1.5 * d.s, 6 * d.s, 3 * d.s); g.restore();
      });
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
