// ---------------------------------------------------------------------------
//  40-mix.js -- landscapes mixed: the land picked, and up to two more
//  blended in with it -- a forest in the mountains by a lake
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "let you mix sceneries like forest, mountain,
  // and lakeside for instance like there needs to be Millions and Billions
  // of different combinations that are possible for all of these external
  // things")
  //
  // The landscape picked (houseOpt "scape", 39-world.js) is the main one:
  // its ground, its garden, its neighbors' houses.  Mixed in with it
  // (houseOpt "mix", "+" between them): what grows of each, as thickly as
  // the thickest; the skyline of the highest (peaks over hills over
  // plains); the water of whichever has some; snow if any is snowfield; and
  // the land as rough as the roughest, the bumps of all of them in it
  // (40-land.js, terrShapeNow).  With the land's own seed (New land), its
  // relief, the foundation, the street, the lamps, the weather, the time of
  // day and the house's style, the ways it can all go together run to
  // billions.
  HOUSE_PLAIN.mix = "";
  var MIX_MOST = 2;
  var MIX_SKY = ["peaks", "volcano", "mesas", "towers", "woods", "hills", "sea", "plains"];
  function worldMix() {
    var main = worldScape();
    return String(houseOpt("mix") || "").split("+").filter(function (k, i, all) {
      return WORLD_SCAPES.indexOf(k) >= 0 && k !== main && all.indexOf(k) === i;
    }).slice(0, MIX_MOST);
  }
  function worldScapes() { return [worldScape()].concat(worldMix()); }
  var mixKept = { key: null, look: null };
  if (typeof worldLook === "function") {
    var worldLookOne = worldLook;
    worldLook = function () {
      var keys = worldScapes();
      if (keys.length < 2) { return worldLookOne.apply(this, arguments); }
      var key = keys.join("+");
      if (mixKept.key === key) { return mixKept.look; }
      var base = WORLD_LOOK[keys[0]], look = Object.assign({}, base), grow = {};
      keys.forEach(function (k, i) {
        var L = WORLD_LOOK[k];
        if (!L) { return; }
        Object.keys(L.grow || {}).forEach(function (g) { grow[g] = (grow[g] || 0) + L.grow[g] * (i ? 0.75 : 1); });
        look.dense = Math.max(look.dense || 0, L.dense || 0);
        if (L.snow) { look.snow = true; }
        if (!look.water && L.water) { look.water = L.water; }
      });
      look.grow = grow;
      look.sky = MIX_SKY.filter(function (s) { return keys.some(function (k) { return WORLD_LOOK[k] && WORLD_LOOK[k].sky === s; }); })[0] || base.sky;
      mixKept = { key: key, look: look };
      return look;
    };
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyMix = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyMix.apply(this, arguments) + "|m" + worldMix().join("+"); };
  }
  function mixSet(list) { houseSetOpt("mix", list.join("+")); }
  // A landscape mixed in, or taken out again: the oldest given up for a
  // third, and one water at a time (a lake or the sea).
  function mixToggle(k) {
    var now = worldMix(), at = now.indexOf(k);
    if (at >= 0) { now.splice(at, 1); mixSet(now); return; }
    var wet = WORLD_LOOK[k] && WORLD_LOOK[k].water;
    if (wet) { now = now.filter(function (o) { return !(WORLD_LOOK[o] && WORLD_LOOK[o].water); }); }
    now.push(k);
    while (now.length > MIX_MOST) { now.shift(); }
    mixSet(now);
  }
  // On the Land tab, under the landscape: the others, to mix in.
  function mixSection(sheet, redraw) {
    var head = document.createElement("div");
    head.className = "v3-mats-head";
    head.textContent = TXT.mx_head;
    sheet.appendChild(head);
    var main = worldScape(), mainWet = WORLD_LOOK[main] && WORLD_LOOK[main].water, now = worldMix();
    var grid = document.createElement("div");
    grid.className = "hs-weather hs-pick";
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", TXT.mx_head);
    WORLD_SCAPES.forEach(function (k) {
      if (k === main) { return; }
      var b = document.createElement("button"), on = now.indexOf(k) >= 0;
      b.type = "button";
      b.className = "hs-wx" + (on ? " on" : "");
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.innerHTML = houseIcon("ws_" + k) + "<span></span>";
      b.lastChild.textContent = TXT["ws_" + k] || k;
      if (mainWet && WORLD_LOOK[k] && WORLD_LOOK[k].water) { b.disabled = true; b.title = TXT.mx_one_water; }
      b.onclick = function () { mixToggle(k); redraw(); };
      grid.appendChild(b);
    });
    sheet.appendChild(grid);
    if (now.length) {
      var p = document.createElement("p");
      p.className = "hs-note";
      p.innerHTML = houseIcon("ws_" + main) + "<span></span>";
      p.lastChild.textContent = [main].concat(now).map(function (k) { return TXT["ws_" + k] || k; }).join(" · ");
      sheet.appendChild(p);
    }
  }
  if (typeof worldPicker === "function") {
    var worldPickerMix = worldPicker;
    worldPicker = function (sheet, keys, now, prefix) {
      var out = worldPickerMix.apply(this, arguments);
      if (prefix === "ws_" && keys === WORLD_SCAPES) {
        try {
          var redraw = sheet.redraw || (V3 && V3.box && el(".v3-set", V3.box) && el(".v3-set", V3.box).redraw);
          mixSection(sheet, function () { if (redraw) { redraw(); } });
        } catch (e) { /* the sheet without it */ }
      }
      return out;
    };
  }
