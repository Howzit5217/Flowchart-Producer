// ---------------------------------------------------------------------------
//  40-designs.js -- every piece in many designs: fourteen styles of
//  furniture, each in three colorways, and finishes for appliances,
//  electronics, plant pots, bath fittings and what stands outdoors
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "I need also a couple thousand items but I need
  // items to have multiple designs rather than full new ones so you can get
  // the exact design the person is looking for")
  //
  // A design is a piece's look as a whole, picked in its panel (or asked
  // for in the icon search: "mid-century sofa"): the legs it stands on --
  // tapered, turned, hairpin, block, a sled, bun feet, a plinth -- its
  // handles, how soft its edges are, what it is covered in (linen, leather,
  // velvet) and in what colors, what its metal is (black, chrome, brass).
  // The models (38-models.js) are made through a few shared parts, so a
  // design changes all of them: mPick (its colors), M.mat (its materials),
  // M.box (its edges), mLegs, mFronts and mPot.  It is kept with the piece
  // as `fin.look` -- the finish (39-design.js) -- so the model is made again
  // when it changes, and saved with the drawing.
  var DESIGN_FAMILIES = {
    //            legs       handles   edges  covered in  legs of   hardware   wood finish
    classic:     { legs: "turned", handle: "knob", round: 1.0, fabric: "fabric", legKind: "wood", hardware: "brass",
                   ways: [["cream", "#e3d6bf", "#5b3a26", "#b8954a"], ["sage", "#a3b18a", "#5b3a26", "#b8954a"], ["navy", "#2f3e5c", "#4a2e1e", "#b8954a"]] },
    modern:      { legs: "block", handle: "long", round: 0.5, fabric: "fabric", legKind: "metal", hardware: "metal", wood: "lacquer",
                   ways: [["grey", "#8d9096", "#ece9e4", "#2b2b2b"], ["charcoal", "#4a4d52", "#2f2f31", "#2b2b2b"], ["white", "#e8e6e1", "#f2f1ee", "#9aa0a6"]] },
    midcentury:  { legs: "taper", handle: "bar", round: 0.8, fabric: "fabric", legKind: "wood", hardware: "brass",
                   ways: [["mustard", "#c7953a", "#9a5b33", "#b8954a"], ["teal", "#3f7a78", "#8a5230", "#b8954a"], ["rust", "#b65a3c", "#7a4a2c", "#2b2b2b"]] },
    scandi:      { legs: "taper", handle: "none", round: 1.2, fabric: "linen", legKind: "wood", hardware: "chrome",
                   ways: [["oat", "#e3dccd", "#d2b48c", "#c9ccd0"], ["fog", "#c9cdd0", "#e2cfae", "#c9ccd0"], ["blush", "#e2c4bb", "#d2b48c", "#c9ccd0"]] },
    industrial:  { legs: "hairpin", handle: "bar", round: 0.3, fabric: "leather", legKind: "metal", hardware: "metal",
                   ways: [["cognac", "#8a5530", "#6b4a33", "#2e2e2e"], ["black", "#2e2c2b", "#5a4030", "#2e2e2e"], ["olive", "#5e5f3e", "#6b4a33", "#2e2e2e"]] },
    farmhouse:   { legs: "turned", handle: "knob", round: 0.9, fabric: "linen", legKind: "wood", hardware: "metal",
                   ways: [["linen", "#dcd4c2", "#f1ede4", "#2b2b2b"], ["oak", "#c9b99a", "#c9a26b", "#2b2b2b"], ["blue", "#8ea3b8", "#efe9dc", "#2b2b2b"]] },
    glam:        { legs: "taper", handle: "long", round: 1.3, fabric: "velvet", legKind: "brass", hardware: "brass", wood: "lacquer",
                   ways: [["emerald", "#2f6b52", "#1f1f22", "#c9a14a"], ["blush", "#d8a6a0", "#f2eee9", "#c9a14a"], ["sapphire", "#2b4c8c", "#1f1f22", "#c9a14a"]] },
    coastal:     { legs: "taper", handle: "knob", round: 1.1, fabric: "linen", legKind: "wood", hardware: "chrome",
                   ways: [["sand", "#e6dccb", "#e9e4d8", "#c9ccd0"], ["navy", "#3d5a80", "#e9e4d8", "#c9ccd0"], ["seafoam", "#a7cfc4", "#d9cbb2", "#c9ccd0"]] },
    rustic:      { legs: "block", handle: "knob", round: 0.6, fabric: "leather", legKind: "wood", hardware: "metal",
                   ways: [["saddle", "#8c5a35", "#5a3d28", "#3a3634"], ["barn", "#7a3a2c", "#6b4a33", "#3a3634"], ["moss", "#5d6b45", "#4f3524", "#3a3634"]] },
    japandi:     { legs: "block", handle: "none", round: 0.7, fabric: "linen", legKind: "wood", hardware: "metal",
                   ways: [["ash", "#d8cfc0", "#c8b49a", "#4a4a48"], ["charcoal", "#4a4a48", "#a88f6e", "#2b2b2b"], ["clay", "#b98b6e", "#c8b49a", "#4a4a48"]] },
    artdeco:     { legs: "bun", handle: "long", round: 1.0, fabric: "velvet", legKind: "brass", hardware: "brass", wood: "lacquer",
                   ways: [["jade", "#2e6b5e", "#1d1d1f", "#c9a14a"], ["plum", "#5e2d4f", "#1d1d1f", "#c9a14a"], ["ivory", "#ece4d4", "#2b2420", "#c9a14a"]] },
    boho:        { legs: "turned", handle: "knob", round: 1.4, fabric: "linen", legKind: "wood", hardware: "brass",
                   ways: [["terracotta", "#c26a4a", "#c49a64", "#b8954a"], ["ochre", "#c9953e", "#a77a50", "#b8954a"], ["plum", "#7d4b5e", "#c49a64", "#b8954a"]] },
    minimal:     { legs: "plinth", handle: "none", round: 0.4, fabric: "fabric", legKind: "wood", hardware: "chrome", wood: "lacquer",
                   ways: [["white", "#f2f2f0", "#f4f4f2", "#cfcfcf"], ["stone", "#cfc9be", "#e6e2da", "#9aa0a6"], ["black", "#2a2a2b", "#1f1f20", "#6b6b6b"]] },
    traditional: { legs: "turned", handle: "knob", round: 1.0, fabric: "fabric", legKind: "wood", hardware: "brass",
                   ways: [["burgundy", "#7d2f35", "#6e2f22", "#b8954a"], ["hunter", "#2f4a3c", "#5b3a26", "#b8954a"], ["gold", "#c9a75a", "#4a2e1e", "#b8954a"]] }
  };
  // Finishes, for what is not furniture: [name, what it is made of, its color, its trim]
  var DESIGN_FINISHES = {
    appliance: [["stainless", "metal", "#c9cdd1", "#dfe3e8"], ["blackss", "metal", "#3a3b3d", "#2b2c2e"], ["white", "plastic", "#f2f2ef", "#d9dcdf"],
                ["matte", "plastic", "#232426", "#1a1b1c"], ["retrocream", "ceramic", "#efe3c4", "#d6d9dc"], ["retromint", "ceramic", "#a8d5c2", "#d6d9dc"],
                ["retrored", "ceramic", "#b8322f", "#d6d9dc"], ["bronze", "metal", "#6b5643", "#b8954a"], ["panel", "wood", "#c9a26b", "#2b2b2b"]],
    electronic: [["black", "plastic", "#1d1e20", "#2b2c2e"], ["silver", "metal", "#b8bcc0", "#dfe3e8"], ["white", "plastic", "#f2f2f0", "#d9dcdf"],
                 ["walnut", "wood", "#6b4a33", "#2b2b2b"], ["graphite", "metal", "#4a4d52", "#2b2c2e"]],
    pot: [["terracotta", "ceramic", "#c46f4a"], ["white", "ceramic", "#f2f0ea"], ["matteblack", "ceramic", "#2a2a2b"], ["woven", "wicker", "#c49a64"],
          ["concrete", "concrete", "#a8a8a4"], ["glazedblue", "ceramic", "#2f5f8a"], ["brass", "brass", "#c9a14a"], ["sage", "ceramic", "#a3b18a"]],
    outdoor: [["cedar", "wood", "#b07a52", "#5b4636"], ["teak", "wood", "#9a6a42", "#5b4636"], ["white", "lacquer", "#f1efe9", "#cfcfcf"],
              ["blackmetal", "metal", "#2b2b2b", "#1f1f1f"], ["composite", "plastic", "#8e8b85", "#5c5a56"], ["stone", "stone", "#a59f95", "#6b665e"],
              ["green", "lacquer", "#3f5a3c", "#2b2b2b"], ["redbarn", "wood", "#8c2f28", "#e9e4d8"]]
  };
  var DESIGN_GROUP = {};
  [["appliance", "i_fridge i_stove i_dishwasher i_microwave i_coffeemaker i_toaster i_kettle i_washer i_dryer i_oven i_winecooler i_freezer i_hood i_heater i_ac i_fan i_trash"],
   ["electronic", "i_tv i_walltv i_soundbar i_console i_pc i_monitor i_speaker i_recordplayer i_projector i_proscreen i_treadmill i_exbike i_register i_display i_cooler i_checkout i_gondola"],
   ["pot", "i_succulent i_herbs i_plant i_palm i_cactus i_flowers i_hanging i_planter"],
   ["outdoor", "i_grill i_hottub i_deck i_fence i_pool i_patio i_gardenbench i_lounger i_gazebo i_shed i_firepit i_birdbath i_mailbox i_bikerack i_swing i_trampoline i_pathlight i_lamppost i_porchlight i_floodlight"],
   ["bath", "i_toilet i_sink i_bathtub i_shower i_cornertub i_towelrail i_kitchensink i_utilitysink"],
   ["soft", "i_sofa i_loveseat i_armchair i_recliner i_sectional i_ottoman i_beanbag i_chaise i_daybed i_bed i_bedking i_bed1 i_bunkbed i_crib i_dogbed i_rocker i_bench i_chair i_stool i_officechair i_highchair i_rug i_bathmat i_lamp i_arclamp i_tablelamp i_desklamp i_pendant i_chandelier i_sconce i_ceilingfan i_yogamat"],
   ["none", "i_outlet i_lightswitch i_garagebtn i_breaker i_post i_vent i_smoke i_thermostat i_waterheater i_exhaustfan i_closetrod i_closetshelves i_reachin i_furnace i_driveway i_path i_parked i_evcharger i_shrub i_hedge i_flowerbed i_cattree i_fruitbowl i_books"]
  ].forEach(function (g) { g[1].split(" ").forEach(function (k) { DESIGN_GROUP[k] = g[0]; }); });
  // Which styles a bath fitting comes in (a toilet is china whatever it is)
  var DESIGN_BATH = ["modern", "classic", "minimal", "glam", "farmhouse", "industrial", "japandi", "artdeco"];
  function designGroup(kind) {
    if (!MODELS[kind]) { return "none"; }
    return DESIGN_GROUP[kind] || "hard";
  }
  // Every design a kind comes in: { id, fam (or finish), way, group }
  var designLists = {};
  function designList(kind) {
    if (designLists[kind]) { return designLists[kind]; }
    var g = designGroup(kind), out = [];
    if (DESIGN_FINISHES[g]) {
      DESIGN_FINISHES[g].forEach(function (f) { out.push({ id: f[0], fin: f, group: g }); });
    } else if (g !== "none") {
      Object.keys(DESIGN_FAMILIES).forEach(function (fam) {
        if (g === "bath" && DESIGN_BATH.indexOf(fam) < 0) { return; }
        DESIGN_FAMILIES[fam].ways.forEach(function (w, i) { out.push({ id: fam + ":" + i, fam: fam, way: w, group: g }); });
      });
    }
    designLists[kind] = out;
    return out;
  }
  // How many designs there are, over every piece.
  function designTotal() {
    var n = 0;
    Object.keys(MODELS).forEach(function (k) { n += designList(k).length; });
    return n;
  }
  function designOf(n) {
    var id = n && n.fin && n.fin.look;
    if (!id) { return null; }
    var got = designList(n.kind).filter(function (d) { return d.id === id; })[0];
    if (!got) { return null; }
    var D = { id: id, group: got.group };
    if (got.fin) {
      D.finish = got.fin; D.main = got.fin[2]; D.frame = got.fin[3] || got.fin[2]; D.mat = got.fin[1];
      return D;
    }
    var F = DESIGN_FAMILIES[got.fam], w = got.way;
    D.fam = got.fam; D.F = F; D.round = F.round;
    D.fabricC = w[1]; D.woodC = w[2]; D.metalC = w[3];
    if (got.group === "soft") { D.main = w[1]; D.frame = F.legKind === "wood" ? w[2] : w[3]; }
    else if (got.group === "bath") { D.main = null; D.frame = w[3]; }
    else { D.main = w[2]; D.frame = w[3]; }
    return D;
  }

  // ---- the models, made in the design asked for --------------------------------------------------
  var DESIGN_NOW = null;
  if (typeof v3ModelPut === "function") {
    var v3ModelPutPlainLook = v3ModelPut;
    v3ModelPut = function (faces, n) {
      var was = DESIGN_NOW;
      DESIGN_NOW = designOf(n);
      try { return v3ModelPutPlainLook.apply(this, arguments); } finally { DESIGN_NOW = was; }
    };
  }
  // A design's colors over the color the piece has on the paper -- but a
  // color picked in its finish over the design's.
  if (typeof modelColors === "function") {
    var modelColorsPlainLook = modelColors;
    modelColors = function (n) {
      var C = modelColorsPlainLook.apply(this, arguments), D = designOf(n);
      if (!D) { return C; }
      var fin = n.fin || {};
      return { main: fin.main || D.main || C.main, frame: fin.frame || D.frame || C.frame };
    };
  }
  if (typeof mPick === "function") {
    var mPickPlainLook = mPick;
    mPick = function (C, main, frame) {
      var D = DESIGN_NOW;
      if (!D) { return mPickPlainLook.apply(this, arguments); }
      return mPickPlainLook({ main: C.main || D.main || null, frame: C.frame || D.frame || null }, main, frame);
    };
  }
  if (typeof modelMaker === "function") {
    var modelMakerPlainLook = modelMaker;
    modelMaker = function () {
      var M = modelMakerPlainLook.apply(this, arguments), D = DESIGN_NOW;
      if (!D) { return M; }
      var mat = M.mat, box = M.box;
      M.mat = function (kind, color) {
        var c = String(color || "").toLowerCase();
        if (D.finish) {
          // the body of an appliance, a pot, a bench: what the finish is made of
          if (D.main && c === String(D.main).toLowerCase() && D.mat) { kind = D.mat; }
        } else {
          if (kind === "fabric" && D.F.fabric !== "fabric") { kind = D.F.fabric; }
          else if (kind === "metal" || kind === "chrome") {
            if (D.F.hardware === "brass") { kind = "brass"; color = D.metalC; }
            else if (D.F.hardware === "chrome" && kind === "metal" && c === String(D.frame).toLowerCase()) { kind = "chrome"; }
          } else if (kind === "wood" && D.F.wood && c === String(D.woodC).toLowerCase()) { kind = D.F.wood; }
        }
        return mat.call(M, kind, color);
      };
      if (D.round && D.round !== 1) {
        M.box = function (x0, x1, y0, y1, z0, z1, m, r) { return box.call(M, x0, x1, y0, y1, z0, z1, m, r ? r * D.round : r); };
      }
      return M;
    };
  }
  // The legs a design stands on.
  if (typeof mLegs === "function") {
    var mLegsPlainLook = mLegs;
    mLegs = function (M, x0, x1, y0, y1, inset, z0, z1, r, m, round, taper) {
      var D = DESIGN_NOW;
      if (!D || !D.F || !D.F.legs) { return mLegsPlainLook.apply(this, arguments); }
      var F = D.F, h = z1 - z0, legM = F.legKind === "wood" ? M.mat("wood", D.woodC) : M.mat(F.legKind === "brass" ? "brass" : "metal", D.metalC);
      var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      var feet = [[x0 + inset, y0 + inset], [x1 - inset, y0 + inset], [x1 - inset, y1 - inset], [x0 + inset, y1 - inset]];
      if (F.legs === "plinth") {               // a base set back under it
        M.box(x0 + inset, x1 - inset, y0 + inset, y1 - inset, z0, z1, M.mat("wood", mShade(D.woodC, -0.25)));
        return;
      }
      if (F.legs === "sled") {                 // a bent bar down each side
        [x0 + inset, x1 - inset].forEach(function (x) {
          M.tube([x, y0 + inset, z0 + r * 0.6], [x, y1 - inset, z0 + r * 0.6], r * 0.6, legM, 8);
          M.tube([x, y0 + inset, z0 + r * 0.6], [x, y0 + inset, z1], r * 0.6, legM, 8);
          M.tube([x, y1 - inset, z0 + r * 0.6], [x, y1 - inset, z1], r * 0.6, legM, 8);
        });
        return;
      }
      feet.forEach(function (p) {
        var ox = Math.sign(p[0] - cx), oy = Math.sign(p[1] - cy);
        if (F.legs === "taper") {              // splayed out a little, thinning to the floor
          M.tube([p[0] + ox * h * 0.09, p[1] + oy * h * 0.09, z0], [p[0], p[1], z1], r * 0.72, legM, 10);
          M.ball(p[0] + ox * h * 0.09, p[1] + oy * h * 0.09, z0 + r * 0.3, r * 0.5, r * 0.5, r * 0.35, legM, { seg: 6 });
        } else if (F.legs === "turned") {      // turned on a lathe: a baluster
          M.push().move(0, 0, z0);
          M.lathe(p[0], p[1], [[r * 0.75, 0], [r * 0.95, h * 0.06], [r * 0.6, h * 0.16], [r * 1.05, h * 0.36], [r * 0.55, h * 0.56],
                               [r * 0.7, h * 0.78], [r * 1.05, h * 0.9], [r * 1.05, h], [0, h]], legM, { seg: 12 });
          M.pop();
        } else if (F.legs === "hairpin") {     // two rods to a point, a V
          var ax = Math.abs(p[0] - cx) > Math.abs(p[1] - cy);
          var a = ax ? [p[0], p[1] - oy * r * 3] : [p[0] - ox * r * 3, p[1]];
          var b = ax ? [p[0], p[1] + oy * r * 0.2] : [p[0] + ox * r * 0.2, p[1]];
          M.tube([p[0], p[1], z0], [a[0], a[1], z1], r * 0.28, legM, 6);
          M.tube([p[0], p[1], z0], [b[0], b[1], z1], r * 0.28, legM, 6);
        } else if (F.legs === "bun") {         // round feet, a short neck over each
          M.ball(p[0], p[1], z0 + r * 1.5, r * 1.8, r * 1.8, r * 1.5, legM, { seg: 10 });
          M.cyl(p[0], p[1], z0 + r * 2.6, z1, r * 0.8, legM, { seg: 10 });
        } else {                               // block: square and solid
          M.box(p[0] - r * 1.5, p[0] + r * 1.5, p[1] - r * 1.5, p[1] + r * 1.5, z0, z1, legM, r * 0.3);
        }
      });
    };
  }
  // Its handles: knobs, a bar, a long pull up the front -- or none, pressed to open.
  if (typeof mFronts === "function") {
    var mFrontsPlainLook = mFronts;
    mFronts = function (M, x0, x1, y, z0, z1, rows, cols, m, handle, how) {
      var D = DESIGN_NOW;
      if (!D || !D.F || !handle) { return mFrontsPlainLook.apply(this, arguments); }
      var hw = D.F.hardware === "brass" ? M.mat("brass", D.metalC) : M.mat(D.F.hardware === "chrome" ? "chrome" : "metal", D.metalC);
      var h2 = Object.assign({}, how || {});
      if (D.F.handle === "none") { return mFrontsPlainLook.call(this, M, x0, x1, y, z0, z1, rows, cols, m, null, h2); }
      if (D.F.handle === "knob") { h2.knobs = true; h2.doors = false; }
      if (D.F.handle === "long") { h2.doors = true; }
      return mFrontsPlainLook.call(this, M, x0, x1, y, z0, z1, rows, cols, m, hw, h2);
    };
  }
  // A plant's pot, in the finish asked for.
  if (typeof mPot === "function") {
    var mPotPlainLook = mPot;
    mPot = function (M, x, y, r, h, m, soil) {
      var D = DESIGN_NOW;
      if (!D || !D.finish || D.group !== "pot") { return mPotPlainLook.apply(this, arguments); }
      return mPotPlainLook.call(this, M, x, y, r, h, M.mat(D.finish[1], D.finish[2]), soil);
    };
  }

  // ---- in a piece's panel ---------------------------------------------------------------------------
  // A tile a style, its legs and colors drawn small; under the style picked,
  // its colorways; the finishes of what is not furniture, a tile each.
  function designArt(d) {
    var F = d.fam ? DESIGN_FAMILIES[d.fam] : null, w = d.way;
    if (!F) {
      var f = d.fin;
      return '<svg viewBox="0 0 40 28" aria-hidden="true"><circle cx="20" cy="14" r="10" fill="' + f[2] + '" stroke="rgba(0,0,0,.25)"/>' +
             '<path d="M12 14a8 8 0 0 0 16 0" fill="none" stroke="' + (f[3] || "rgba(255,255,255,.5)") + '" stroke-width="2.4"/></svg>';
    }
    var fab = w[1], wood = w[2], metal = w[3], legC = F.legKind === "wood" ? wood : metal, s = "";
    if (d.group === "soft") {
      s += '<rect x="5" y="6" width="30" height="13" rx="' + (2 + F.round * 2.5) + '" fill="' + fab + '"/>';
      s += '<rect x="9" y="10" width="22" height="6" rx="' + (1 + F.round) + '" fill="rgba(255,255,255,.18)"/>';
    } else {
      s += '<rect x="6" y="4" width="28" height="15" rx="' + (0.5 + F.round) + '" fill="' + wood + '"/>';
      s += '<path d="M6 11.5h28" stroke="rgba(0,0,0,.25)"/>';
      if (F.handle === "knob") { s += '<circle cx="20" cy="8" r="1.2" fill="' + metal + '"/><circle cx="20" cy="15" r="1.2" fill="' + metal + '"/>'; }
      else if (F.handle === "bar") { s += '<path d="M16 8h8M16 15h8" stroke="' + metal + '" stroke-width="1.4"/>'; }
      else if (F.handle === "long") { s += '<path d="M31 6v11" stroke="' + metal + '" stroke-width="1.4"/>'; }
    }
    var L = { taper: '<path d="M9 19l-2 6M31 19l2 6"/>', turned: '<path d="M9 19c1.5 2-1.5 3 0 6M31 19c-1.5 2 1.5 3 0 6"/>',
              hairpin: '<path d="M8 19l2 6 2-6M28 19l2 6 2-6"/>', block: '<path d="M7.5 19h3.5v6H7.5zM29 19h3.5v6H29z" fill="' + legC + '"/>',
              bun: '<circle cx="9" cy="22.5" r="2.4" fill="' + legC + '"/><circle cx="31" cy="22.5" r="2.4" fill="' + legC + '"/>',
              plinth: '<path d="M9 19h22v4H9z" fill="' + mShade(wood, -0.25) + '"/>', sled: '<path d="M8 19v5h24v-5"/>' }[F.legs] || "";
    return '<svg viewBox="0 0 40 28" aria-hidden="true"><g fill="none" stroke="' + legC + '" stroke-width="1.6" stroke-linecap="round">' + L + "</g>" + s + "</svg>";
  }
  function lookName(d) {
    if (d.fin) { return TXT["dgf_" + d.fin[0]] || d.fin[0]; }
    return (TXT["dg_" + d.fam] || d.fam) + " · " + (TXT["dgc_" + d.way[0]] || d.way[0]);
  }
  function designSection(box, n) {
    var list = designList(n.kind);
    if (!list.length) { return; }
    var sec = document.createElement("div");
    sec.className = "dz-fin dz-design";
    function set(id) {
      keepUndo();
      var fin = Object.assign({}, n.fin || {});
      if (id) { fin.look = id; delete fin.main; delete fin.frame; } else { delete fin.look; }
      if (Object.keys(fin).length) { n.fin = fin; } else { delete n.fin; }
      if (typeof handKeep === "function") { handKeep(); }
      if (V3) { V3.dirty = true; }
      // the panel again, the finish under it showing the design's colors
      if (typeof drawHandPanel === "function") { drawHandPanel(); } else { draw(); }
    }
    function draw() {
      var now = (n.fin && n.fin.look) || "", fam = now.indexOf(":") > 0 ? now.split(":")[0] : "";
      sec.innerHTML = '<div class="dz-fin-head"><span class="dz-small dz-sub-head"></span><span class="dz-design-n"></span></div>';
      sec.querySelector(".dz-sub-head").textContent = TXT.dg_head;
      sec.querySelector(".dz-design-n").textContent = say("dg_count", { n: list.length });
      if (now) {
        var plain = document.createElement("button");
        plain.type = "button";
        plain.className = "dz-link";
        plain.textContent = TXT.mt_plain;
        plain.onclick = function () { set(""); };
        sec.firstChild.appendChild(plain);
      }
      var grid = document.createElement("div");
      grid.className = "dz-design-grid";
      // a tile a style (its first colorway, or the one picked) -- or a finish
      var tiles = [];
      list.forEach(function (d) {
        if (d.fam) { if (!tiles.some(function (t) { return t.fam === d.fam; })) { tiles.push(d); } } else { tiles.push(d); }
      });
      tiles.forEach(function (d) {
        var shown = d.fam && d.fam === fam ? list.filter(function (x) { return x.id === now; })[0] || d : d;
        var b = document.createElement("button");
        b.type = "button";
        var on = d.fam ? d.fam === fam : d.id === now;
        b.className = "dz-dtile" + (on ? " on" : "");
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.innerHTML = designArt(shown) + "<span></span>";
        b.lastChild.textContent = d.fam ? TXT["dg_" + d.fam] || d.fam : lookName(d);
        b.title = lookName(shown);
        b.onclick = function () { set(d.fam && d.fam === fam ? now : d.id); };
        grid.appendChild(b);
      });
      sec.appendChild(grid);
      // the colorways of the style picked
      if (fam) {
        var row = document.createElement("div");
        row.className = "dz-fin-row dz-design-ways";
        row.innerHTML = '<span class="dz-fin-name"></span><div class="dz-mat-tints"></div>';
        row.firstChild.textContent = TXT.dg_colorway;
        list.filter(function (d) { return d.fam === fam; }).forEach(function (d) {
          var chip = document.createElement("button");
          chip.type = "button";
          chip.className = "dz-chip dz-way" + (d.id === now ? " on" : "");
          chip.style.background = "linear-gradient(135deg, " + d.way[1] + " 0 55%, " + d.way[2] + " 55% 100%)";
          chip.title = lookName(d);
          chip.setAttribute("aria-label", lookName(d));
          chip.onclick = function () { set(d.id); };
          row.lastChild.appendChild(chip);
        });
        sec.appendChild(row);
      }
    }
    draw();
    box.appendChild(sec);
  }
  if (typeof finishSection === "function") {
    var finishSectionPlainLook = finishSection;
    finishSection = function (box, n) {
      try { designSection(box, n); } catch (e) { /* the finish alone */ }
      return finishSectionPlainLook.apply(this, arguments);
    };
  }

  // ---- asked for by name, in the icon search ---------------------------------------------------------
  // "mid-century sofa", "brass lamp", "retro red fridge": the style's words
  // are not part of what is looked for, and the next piece put down from
  // the search comes in that design.
  var designAsked = null;
  function designWords(kind) {
    var out = [];
    designList(kind).forEach(function (d) {
      var names = d.fam ? [TXT["dg_" + d.fam] || d.fam, d.fam] : [TXT["dgf_" + d.fin[0]] || d.fin[0], d.fin[0]];
      names.forEach(function (nm) { out.push({ d: d, words: String(nm).toLowerCase().split(/\s+/).filter(Boolean) }); });
    });
    return out;
  }
  if (typeof iconFits === "function") {
    var iconFitsPlainLook = iconFits;
    iconFits = function (k, words) {
      if (iconFitsPlainLook.apply(this, arguments)) { return true; }
      if (!words || words.length < 2) { return false; }
      var best = null;
      designWords(k).forEach(function (o) {
        if (o.words.every(function (w) { return words.indexOf(w) >= 0; }) && (!best || o.words.length > best.words.length)) { best = o; }
      });
      if (!best) { return false; }
      var rest = words.filter(function (w) { return best.words.indexOf(w) < 0; });
      if (!rest.length || !iconFitsPlainLook.call(this, k, rest)) { return false; }
      designAsked = { words: best.words, at: Date.now() };
      return true;
    };
  }
  if (typeof addNode === "function") {
    var addNodePlainLook = addNode;
    addNode = function () {
      var id = hand.next, out = addNodePlainLook.apply(this, arguments);
      try {
        var asked = designAsked, n = nodeById(id);
        if (asked && Date.now() - asked.at < 60000 && n) {
          designAsked = null;                // once: the piece the search was for
          var d = designWords(n.kind).filter(function (o) { return o.words.join(" ") === asked.words.join(" "); })[0];
          if (d) {
            n.fin = Object.assign({}, n.fin || {}, { look: d.d.id });
            if (typeof handKeep === "function") { handKeep(); }
            if (typeof drawHandPanel === "function") { drawHandPanel(); }
          }
        }
      } catch (e) { /* put down plain */ }
      return out;
    };
  }
  // The library says how many designs there are, beside how many pieces.
  if (typeof iconLibrary === "function") {
    var iconLibraryPlainLook = iconLibrary;
    iconLibrary = function () {
      var box = iconLibraryPlainLook.apply(this, arguments);
      try {
        var find = el(".icon-find", box);
        if (find) { find.placeholder = say("dg_find", { n: iconTotal(), d: designTotal().toLocaleString(typeof LANG === "string" ? LANG : "en") }); }
      } catch (e) { /* as it was */ }
      return box;
    };
  }
