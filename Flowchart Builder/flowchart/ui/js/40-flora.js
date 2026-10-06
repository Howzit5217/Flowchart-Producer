// ---------------------------------------------------------------------------
//  40-flora.js -- trees, shrubs, flower beds and hedges by the hundred: each
//  its own shape and colors in 3D, picked for a piece in its panel or by
//  name in the icon search, and grown by the land itself where they grow
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "there is really only one type of tree and bush
  // and things like that ... tons of different trees, bushes, flowers to
  // place outside and for what the engine can place too depending on the
  // area")
  //
  // A tree, a shrub, a flower bed or a hedge on the paper is one piece
  // (i_tree, i_shrub, i_flowerbed, i_hedge) and its kind is `n.sp` -- the
  // field the land's own trees already carried (40-site.js, 40-edit3d.js).
  // Each kind says what it is made like (its form, below), how tall and how
  // wide it grows (metres), its leaves', bark's, flowers' and fruit's
  // colors, the landscapes it grows in (z, weighted) and where in the world
  // it is at home (r): the land plants what grows there, more of what goes
  // with the house's style (a Japanese house, its maples and cherries).

  // ---- the kinds ---------------------------------------------------------------------------------
  var FLORA_ZONE = { pl: "plains", hi: "hills", mo: "mountains", fo: "forest", la: "lake", be: "beach",
                     de: "desert", tr: "tropics", ar: "arctic", ci: "city" };
  var FLORA = {}, FLORA_ORDER = [];
  function floraZones(s) {
    var o = {};
    String(s || "").split(/\s+/).forEach(function (t) {
      var p = t.split(":");
      if (FLORA_ZONE[p[0]]) { o[FLORA_ZONE[p[0]]] = p[1] ? Number(p[1]) : 1; }
    });
    return o;
  }
  function floraAdd(kind, key, g, f, h, w, leaf, bark, z, r, x) {
    FLORA[key] = Object.assign({ key: key, kind: kind, g: g, f: f, h: h, w: w, leaf: leaf, bark: bark || "#5f4330",
                                 z: floraZones(z), r: String(r || "").split(/\s+/).filter(Boolean), o: {} }, x || {});
    FLORA_ORDER.push(key);
  }
  // trees -- shade
  floraAdd("i_tree", "broad", "shade", "old", 8, 3.5, "#4f7d3a", "#5f4330", "pl:2 hi:2 fo:2 la:2 tr ci", "");
  floraAdd("i_tree", "oak", "shade", "old", 13, 8, "#4f7d3a", "#5f4330", "pl:3 hi:3 fo:2 la ci", "na eu uk");
  floraAdd("i_tree", "maple", "shade", "old", 11, 5, "#5f8a3c", "#5f4330", "pl:2 hi:2 fo la ci:2", "na eu");
  floraAdd("i_tree", "redmaple", "shade", "round", 11, 6, "#a8452f", "#5a4a3e", "hi:2 fo pl la ci", "na japan", { o: { trunk: 0.36, reach: 0.4, clump: 0.34, limbs: 5 } });
  floraAdd("i_tree", "birch", "shade", "old", 10, 4, "#7ea24a", "#e6e2d8", "fo:2 la:2 hi mo pl ar", "nordic eu na");
  floraAdd("i_tree", "beech", "shade", "round", 16, 9, "#4a7a35", "#8e8b82", "fo:2 hi pl la", "eu uk", { o: { trunk: 0.3, reach: 0.46, clump: 0.38, limbs: 5 } });
  floraAdd("i_tree", "copperbeech", "shade", "round", 15, 9, "#6e3a33", "#8e8b82", "pl hi ci", "eu uk", { o: { trunk: 0.3, reach: 0.46, clump: 0.38, limbs: 5 } });
  floraAdd("i_tree", "elm", "shade", "vase", 16, 10, "#5a8a3c", "#5a4a3e", "pl:2 la ci", "na eu");
  floraAdd("i_tree", "ash", "shade", "round", 15, 7, "#5f8f45", "#7a746a", "pl hi fo la", "eu na", { o: { trunk: 0.38, reach: 0.34, clump: 0.32, limbs: 5 } });
  floraAdd("i_tree", "linden", "shade", "round", 14, 7, "#5c8f3e", "#6a5e52", "ci:2 pl", "eu", { o: { trunk: 0.3, reach: 0.34, clump: 0.42 } });
  floraAdd("i_tree", "chestnut", "shade", "round", 14, 9, "#4a7a35", "#5a4a3e", "pl hi ci", "eu uk", { bloom: "#f4f0e6", bloomN: 28, bloomK: "candle", o: { trunk: 0.3, reach: 0.44, clump: 0.38 } });
  floraAdd("i_tree", "plane", "shade", "round", 18, 10, "#5f8a3c", "#b8ad96", "ci:3 pl la", "eu uk na", { o: { trunk: 0.36, reach: 0.46, clump: 0.36, limbs: 5 } });
  floraAdd("i_tree", "willow", "shade", "old", 10, 8, "#7fa24a", "#6a5a48", "la:3 pl", "eu na china");
  floraAdd("i_tree", "aspen", "shade", "round", 13, 4, "#8aa84a", "#d8d4c6", "mo:2 fo hi la ar", "na nordic", { o: { trunk: 0.42, reach: 0.3, clump: 0.3, thick: 0.05 } });
  floraAdd("i_tree", "poplar", "shade", "old", 18, 3, "#5a8a3c", "#7a7468", "pl:2 la ci", "eu");
  floraAdd("i_tree", "ginkgo", "shade", "round", 12, 6, "#a3b23a", "#6a5e52", "ci:2 pl", "china japan korea", { o: { trunk: 0.36, reach: 0.32, clump: 0.3, limbs: 6 } });
  floraAdd("i_tree", "liveoak", "shade", "spread", 12, 16, "#3f6a35", "#4a3e34", "pl be ci", "na sw", { o: { trunk: 0.3, flat: 0.5, limbs: 6 } });
  floraAdd("i_tree", "eucalyptus", "shade", "euca", 22, 9, "#7f9a7a", "#d8d2c2", "pl hi be de", "aus");
  // trees -- flowering and ornamental
  floraAdd("i_tree", "cherry", "flower", "round", 7, 7, "#d99aac", "#4a3a34", "pl hi la ci", "japan korea china eu na", { bloom: "#f6c3d0", bloomN: 70, o: { trunk: 0.3, reach: 0.5, clump: 0.36 } });
  floraAdd("i_tree", "weepingcherry", "flower", "weeping", 6, 6, "#e0a8b8", "#4a3a34", "pl la ci", "japan", { bloom: "#f6c6d4", bloomN: 60 });
  floraAdd("i_tree", "magnolia", "flower", "round", 8, 6, "#5a8a44", "#7a6e64", "pl hi ci", "na china japan uk", { bloom: "#f6eaf0", bloomN: 36, bloomS: 1.8, o: { trunk: 0.26, reach: 0.4, clump: 0.34 } });
  floraAdd("i_tree", "dogwood", "flower", "layered", 6, 6, "#5f8a44", "#5a4a40", "pl hi fo", "na", { bloom: "#f8f6f0", bloomN: 60 });
  floraAdd("i_tree", "redbud", "flower", "round", 7, 7, "#b85a90", "#4a3a34", "pl hi", "na", { bloom: "#c8509a", bloomN: 70, o: { trunk: 0.28, reach: 0.48, clump: 0.34 } });
  floraAdd("i_tree", "crabapple", "flower", "round", 6, 6, "#c98a9c", "#5a4a40", "pl hi ci", "na eu", { bloom: "#f2aac2", bloomN: 60, o: { trunk: 0.3, reach: 0.44, clump: 0.36 } });
  floraAdd("i_tree", "jacaranda", "flower", "spread", 12, 10, "#8f7ad0", "#6a5a4a", "tr be pl", "aus brazil sw", { bloom: "#9a7ad8", bloomN: 60, o: { trunk: 0.38, flat: 0.55, limbs: 6 } });
  floraAdd("i_tree", "flametree", "flower", "spread", 10, 12, "#c8502e", "#6a5a48", "tr:2 be", "seasia india brazil africa", { bloom: "#e8562a", bloomN: 60, o: { trunk: 0.34, flat: 0.45, limbs: 6 } });
  floraAdd("i_tree", "frangipani", "flower", "candle", 6, 5, "#4f7f3a", "#7a7268", "tr:2 be", "seasia aus brazil india", { bloom: "#fbf4e6" });
  floraAdd("i_tree", "crapemyrtle", "flower", "multi", 6, 5, "#c8507a", "#b8a89a", "pl ci", "na sw", { bloom: "#d8508a", bloomN: 50 });
  floraAdd("i_tree", "jmaple", "flower", "layered", 5, 6, "#b0392c", "#5a4a40", "pl hi ci", "japan korea china");
  // trees -- fruit and nut
  floraAdd("i_tree", "fruit", "fruit", "old", 4.5, 4, "#5b8b3d", "#5f4330", "pl hi", "");
  floraAdd("i_tree", "apple", "fruit", "round", 6, 6, "#5b8b3d", "#5f4a3a", "pl:2 hi", "na eu uk", { fruit: "#c8332b", o: { trunk: 0.3, reach: 0.42, clump: 0.38 } });
  floraAdd("i_tree", "pear", "fruit", "round", 8, 5, "#5f8f45", "#5a4a3a", "pl hi", "eu", { fruit: "#c8c04a", o: { trunk: 0.34, reach: 0.32, clump: 0.36 } });
  floraAdd("i_tree", "orange", "fruit", "round", 6, 5, "#2f6a35", "#5a4a3a", "be:2 tr de", "med sw brazil", { fruit: "#f08a1e", o: { trunk: 0.22, reach: 0.36, clump: 0.44 } });
  floraAdd("i_tree", "lemon", "fruit", "round", 5, 4, "#3a7a3a", "#5a4a3a", "be:2 tr", "med", { fruit: "#f2d83a", o: { trunk: 0.22, reach: 0.36, clump: 0.44 } });
  floraAdd("i_tree", "olive", "fruit", "olive", 7, 7, "#8a9a72", "#6e6656", "be:2 de hi", "med mideast");
  floraAdd("i_tree", "fig", "fruit", "spread", 6, 7, "#4f8a3a", "#8a8070", "be de", "med mideast", { o: { trunk: 0.3, flat: 0.7, limbs: 5 } });
  floraAdd("i_tree", "walnut", "fruit", "round", 15, 12, "#5a8a3c", "#5a5048", "pl hi", "eu na", { o: { trunk: 0.34, reach: 0.46, clump: 0.36, limbs: 5 } });
  floraAdd("i_tree", "mango", "fruit", "round", 12, 10, "#2e5f30", "#4a3e34", "tr:2", "india seasia brazil", { fruit: "#e8a83a", o: { trunk: 0.26, reach: 0.4, clump: 0.44 } });
  // trees -- conifers
  floraAdd("i_tree", "spruce", "conifer", "old", 14, 4.5, "#2f5a3c", "#5f4330", "mo:3 fo:2 hi ar:2", "nordic alpine na eu");
  floraAdd("i_tree", "bluespruce", "conifer", "cone", 15, 6, "#6f8fa0", "#5f4a3a", "mo hi ar ci", "na", { o: { tiers: 7, bare: 0.06 } });
  floraAdd("i_tree", "fir", "conifer", "old", 9, 2.5, "#355f43", "#5f4330", "mo:3 fo:2 ar:2 hi", "nordic alpine na");
  floraAdd("i_tree", "pine", "conifer", "old", 12, 4, "#2f5a38", "#6b4a32", "mo fo be hi", "");
  floraAdd("i_tree", "scotspine", "conifer", "pine", 18, 7, "#3f6a45", "#b0704a", "fo hi mo", "eu uk nordic");
  floraAdd("i_tree", "stonepine", "conifer", "spread", 15, 11, "#3f6a40", "#8a6a50", "be:2 hi", "med", { o: { trunk: 0.62, flat: 0.42, limbs: 6 } });
  floraAdd("i_tree", "cedar", "conifer", "cedar", 18, 11, "#4f7060", "#5a4a40", "mo hi", "india mideast eu");
  floraAdd("i_tree", "hemlock", "conifer", "cone", 18, 8, "#3f6040", "#5a4a40", "fo:2 mo la", "na", { o: { tiers: 9, bare: 0.05, wide: 1.05 } });
  floraAdd("i_tree", "larch", "conifer", "cone", 18, 6, "#8fae5a", "#6a5040", "mo:2 fo ar", "nordic alpine", { o: { tiers: 7, bare: 0.12, wide: 0.9 } });
  floraAdd("i_tree", "redwood", "conifer", "old", 22, 5, "#2f5638", "#7a4330", "fo mo", "na");
  floraAdd("i_tree", "cypress", "conifer", "old", 9, 1.5, "#2f5638", "#5f4330", "be:2 de hi ci", "med mideast");
  floraAdd("i_tree", "arborvitae", "conifer", "column", 7, 1.8, "#4f7a3c", "#6a5040", "pl ci hi", "na");
  floraAdd("i_tree", "junipertree", "conifer", "column", 6, 2.5, "#4f6f5a", "#7a5a48", "de mo hi", "sw mideast", { o: { rough: 1 } });
  floraAdd("i_tree", "yew", "conifer", "round", 9, 7, "#2a4a2e", "#7a4a3a", "pl hi", "uk eu", { o: { trunk: 0.18, reach: 0.38, clump: 0.46 } });
  // trees -- palms and the tropics
  floraAdd("i_tree", "palm", "palm", "old", 9, 3, "#4f8a3f", "#8a7050", "be:3 tr:2", "");
  floraAdd("i_tree", "datepalm", "palm", "palm", 15, 7, "#5a7a4a", "#8a7050", "de:2 be", "mideast africa sw", { palm: "date" });
  floraAdd("i_tree", "fanpalm", "palm", "palm", 10, 4, "#4f7a3f", "#7a6a58", "be tr de", "sw med", { palm: "fan" });
  floraAdd("i_tree", "royalpalm", "palm", "palm", 20, 7, "#4f8a3c", "#c8c4b8", "tr:2 be", "brazil seasia", { palm: "royal" });
  floraAdd("i_tree", "banana", "palm", "old", 4.5, 3, "#5a9a3c", "#6a7a40", "tr:2", "seasia brazil india africa");
  floraAdd("i_tree", "bamboo", "palm", "bamboo", 8, 3, "#5f9a3c", "#7a9a40", "tr fo", "china japan seasia");
  floraAdd("i_tree", "treefern", "palm", "fern", 5, 5, "#4f8a3c", "#5a4030", "tr fo", "aus nz");
  // trees -- desert and dry land
  floraAdd("i_tree", "joshua", "dry", "old", 5, 3, "#6f8a4a", "#7a6a52", "de:2", "sw");
  floraAdd("i_tree", "cactus", "dry", "old", 3.5, 1.5, "#5c7d45", "#5c7d45", "de:3", "sw");
  floraAdd("i_tree", "paloverde", "dry", "spread", 7, 7, "#9ab04a", "#a8b85a", "de:2", "sw", { bloom: "#f2d83a", bloomN: 50, o: { trunk: 0.3, flat: 0.5, limbs: 5, airy: 1 } });
  floraAdd("i_tree", "mesquite", "dry", "spread", 7, 8, "#6f8a4a", "#4a3a30", "de:2", "sw", { o: { trunk: 0.25, flat: 0.55, limbs: 6, airy: 1 } });
  floraAdd("i_tree", "acacia", "dry", "spread", 9, 11, "#6a8a3a", "#5a4a3a", "de be tr", "africa aus", { o: { trunk: 0.55, flat: 0.3, limbs: 5 } });
  floraAdd("i_tree", "baobab", "dry", "baobab", 15, 10, "#6a8a3a", "#9a8a78", "de tr", "africa");
  floraAdd("i_tree", "dragontree", "dry", "candle", 7, 6, "#4f7a4a", "#a89a88", "de be", "africa mideast", { umbrella: 1 });
  // shrubs
  floraAdd("i_shrub", "bush", "ever", "old", 1.4, 1.6, "#4f7d3a", null, "pl:2 hi:2 fo:2 la:2 tr ci", "");
  floraAdd("i_shrub", "boxwood", "ever", "mound", 0.9, 1.0, "#3f6a35", null, "pl:2 hi la ci:2", "eu uk na", { dense: 1 });
  floraAdd("i_shrub", "holly", "ever", "mound", 2.0, 1.6, "#23452a", null, "pl hi fo", "uk eu na", { berry: "#c8282a" });
  floraAdd("i_shrub", "juniper", "ever", "low", 0.5, 2.0, "#5a7f6a", null, "mo de hi", "na");
  floraAdd("i_shrub", "barberry", "ever", "mound", 1.2, 1.2, "#8a3a3a", null, "pl ci", "eu na");
  floraAdd("i_shrub", "mugo", "ever", "minipine", 1.2, 1.8, "#2f5a38", "#6b4a32", "mo:2 ar", "alpine");
  floraAdd("i_shrub", "topball", "topiary", "topball", 1.1, 1.0, "#3f6a35", "#6b4a32", "ci pl", "eu uk");
  floraAdd("i_shrub", "topcone", "topiary", "topcone", 1.6, 0.8, "#3f6a35", "#6b4a32", "ci pl", "eu uk");
  floraAdd("i_shrub", "topspiral", "topiary", "topspiral", 1.8, 0.8, "#3f6a35", "#6b4a32", "ci", "eu");
  floraAdd("i_shrub", "hydrangea", "bloom", "bloom", 1.3, 1.5, "#4f7f3a", null, "pl hi la be ci", "uk na japan eu", { bloom: "#7f9ad8", bloomN: 14, bloomS: 12 });
  floraAdd("i_shrub", "hydrangeapink", "bloom", "bloom", 1.3, 1.5, "#4f7f3a", null, "pl hi la ci", "uk eu", { bloom: "#e39ac0", bloomN: 14, bloomS: 12 });
  floraAdd("i_shrub", "azalea", "bloom", "bloom", 1.0, 1.2, "#4a6f35", null, "pl hi fo", "japan na", { bloom: "#e45a8f", bloomN: 70, bloomS: 3.5 });
  floraAdd("i_shrub", "rhododendron", "bloom", "bloom", 2.0, 2.2, "#355f30", null, "fo:2 hi la", "uk nordic na", { bloom: "#a05cc0", bloomN: 22, bloomS: 9 });
  floraAdd("i_shrub", "camellia", "bloom", "bloom", 2.2, 1.6, "#2a4f2e", null, "pl la", "japan china", { bloom: "#e8708a", bloomN: 24, bloomS: 6 });
  floraAdd("i_shrub", "gardenia", "bloom", "bloom", 1.2, 1.2, "#2f5a32", null, "tr be", "seasia", { bloom: "#f8f4ea", bloomN: 20, bloomS: 5 });
  floraAdd("i_shrub", "hibiscus", "bloom", "bloom", 2.0, 1.6, "#2f6a30", null, "tr:2 be", "seasia brazil", { bloom: "#d8304a", bloomN: 16, bloomS: 8, flat: 1 });
  floraAdd("i_shrub", "bougainvillea", "bloom", "bloom", 2.2, 2.4, "#4f7a3a", null, "tr be:2 de", "med brazil sw", { bloom: "#c8287a", bloomN: 90, bloomS: 4 });
  floraAdd("i_shrub", "heather", "bloom", "low", 0.5, 0.9, "#5a6a45", null, "mo:2 hi ar", "uk nordic", { bloom: "#c87ab8", bloomN: 60, bloomS: 2 });
  floraAdd("i_shrub", "lilac", "bloom", "upright", 2.5, 2.0, "#4f7f3a", null, "pl hi", "eu na", { bloom: "#b79ad6", panicle: 1, bloomN: 16 });
  floraAdd("i_shrub", "oleander", "bloom", "upright", 2.4, 2.0, "#4a6a40", null, "be de", "med", { bloom: "#e88aa8", bloomN: 30, bloomS: 3 });
  floraAdd("i_shrub", "forsythia", "bloom", "upright", 2.2, 2.2, "#e2c83a", null, "pl hi", "eu na");
  floraAdd("i_shrub", "rose", "bloom", "rose", 1.2, 1.0, "#3f6a35", "#4f5a30", "pl hi ci la", "uk eu", { bloom: "#c8283a" });
  floraAdd("i_shrub", "rosepink", "bloom", "rose", 1.2, 1.0, "#3f6a35", "#4f5a30", "pl hi ci", "uk eu", { bloom: "#f08aa8" });
  floraAdd("i_shrub", "rosewhite", "bloom", "rose", 1.2, 1.0, "#3f6a35", "#4f5a30", "pl hi ci", "uk eu", { bloom: "#f6f2ea" });
  floraAdd("i_shrub", "lavender", "herb", "spikes", 0.6, 0.8, "#7d8f6a", null, "be:2 de hi pl", "med", { bloom: "#8f78b8" });
  floraAdd("i_shrub", "rosemary", "herb", "upright", 1.0, 1.0, "#5f7a5a", null, "be de", "med", { bloom: "#8fa0d8", bloomN: 30, bloomS: 1.5 });
  floraAdd("i_shrub", "yucca", "dry", "rosette", 1.6, 1.2, "#6f8a5a", "#7a6a52", "de:2 pl be", "sw", { rosette: "yucca", bloom: "#f4f0dc" });
  floraAdd("i_shrub", "agave", "dry", "rosette", 1.2, 1.8, "#7f9a8a", null, "de:2 be", "sw", { rosette: "agave" });
  floraAdd("i_shrub", "aloe", "dry", "rosette", 1.0, 1.0, "#6f9a6a", null, "de be", "africa", { rosette: "aloe", bloom: "#f0702a" });
  floraAdd("i_shrub", "succulents", "dry", "succulents", 0.3, 0.8, "#7aa08a", null, "de be", "sw africa");
  floraAdd("i_shrub", "pampas", "grass", "grass", 2.5, 1.8, "#8a9a5a", null, "pl be de", "brazil", { plume: "#f2ead8", tall: 1 });
  floraAdd("i_shrub", "fountaingrass", "grass", "grass", 1.0, 1.2, "#9aa060", null, "pl ci de", "", { plume: "#d8b8a8" });
  floraAdd("i_shrub", "hosta", "grass", "hosta", 0.6, 1.0, "#4f8a50", null, "fo la pl", "japan na");
  floraAdd("i_shrub", "fern", "grass", "fern", 0.8, 1.0, "#4f8a3c", null, "fo:2 la tr", "");
  floraAdd("i_shrub", "birdofparadise", "grass", "paddle", 1.5, 1.4, "#3f6f45", null, "tr be", "africa", { bloom: "#f08a2a" });
  // flower beds: what each is planted with -- how its flower is made, how tall it stands, its colors
  floraAdd("i_flowerbed", "mixed", "bed", "old", 0.3, 0, "#4f7d3a", null, "pl ci hi la", "");
  floraAdd("i_flowerbed", "tulips", "spring", "bed", 0.4, 0, "#4f8a3c", null, "pl hi la ci", "eu na", { head: "cup", stem: [0.3, 0.45], cols: ["#d8283a", "#f2c94c", "#f08aa8", "#f4f2ec", "#7a3a8a"], size: 2.6, leaves: "blade" });
  floraAdd("i_flowerbed", "bluebells", "spring", "bed", 0.3, 0, "#4f8a3c", null, "fo la hi", "uk", { head: "bell", stem: [0.25, 0.35], cols: ["#5a6ad8"], size: 1.2, leaves: "blade" });
  floraAdd("i_flowerbed", "pansies", "spring", "bed", 0.18, 0, "#4f8a3c", null, "pl ci", "eu", { head: "pansy", stem: [0.12, 0.2], cols: ["#6a3ab0", "#f2c42c", "#f6f2ea", "#3a4ab0"], size: 2.6 });
  floraAdd("i_flowerbed", "daisies", "summer", "bed", 0.45, 0, "#4f8a3c", null, "pl:2 hi la", "eu uk", { head: "disc", stem: [0.35, 0.5], cols: ["#f8f6f0"], center: "#f2c94c", size: 2.4 });
  floraAdd("i_flowerbed", "sunflowers", "summer", "bed", 1.7, 0, "#4f8a3c", null, "pl:2 de", "na eu", { head: "disc", stem: [1.3, 1.9], cols: ["#f2c42c"], center: "#5a3a1e", size: 9, big: 1 });
  floraAdd("i_flowerbed", "roses", "summer", "bed", 0.6, 0, "#3f6a35", null, "pl hi ci", "uk eu", { head: "rose", stem: [0.5, 0.7], cols: ["#c8283a", "#f08aa8"], size: 3.2 });
  floraAdd("i_flowerbed", "lavenderbed", "summer", "bed", 0.5, 0, "#7d8f6a", null, "be:2 de hi", "med", { head: "spike", stem: [0.4, 0.6], cols: ["#8f78b8"], size: 1.1 });
  floraAdd("i_flowerbed", "marigolds", "summer", "bed", 0.25, 0, "#4f8a3c", null, "pl de tr", "india sw", { head: "pom", stem: [0.2, 0.3], cols: ["#f08a1e", "#f2c42c"], size: 2.4 });
  floraAdd("i_flowerbed", "peonies", "summer", "bed", 0.7, 0, "#4f8a3c", null, "pl hi", "china eu", { head: "pom", stem: [0.6, 0.8], cols: ["#f2a6c0", "#f6f0f2", "#d84a7a"], size: 5 });
  floraAdd("i_flowerbed", "lilies", "summer", "bed", 0.8, 0, "#4f8a3c", null, "pl la", "eu japan", { head: "trumpet", stem: [0.7, 0.9], cols: ["#f6f2ea", "#f08a2a"], size: 4 });
  floraAdd("i_flowerbed", "irises", "summer", "bed", 0.6, 0, "#4f7f45", null, "pl la", "eu japan", { head: "iris", stem: [0.5, 0.7], cols: ["#5a4ab0", "#7a6ad8"], size: 3.6, leaves: "sword" });
  floraAdd("i_flowerbed", "poppies", "summer", "bed", 0.5, 0, "#5a8a40", null, "pl:2 hi", "eu", { head: "poppy", stem: [0.4, 0.6], cols: ["#d8283a"], center: "#1e1a1a", size: 3.6 });
  floraAdd("i_flowerbed", "petunias", "summer", "bed", 0.22, 0, "#4f8a3c", null, "pl ci", "na brazil", { head: "trumpet", stem: [0.15, 0.25], cols: ["#8a3ab0", "#e86aa8", "#f6f2ea"], size: 2.4, dense: 1 });
  floraAdd("i_flowerbed", "geraniums", "summer", "bed", 0.35, 0, "#4f8a3c", null, "pl ci be", "eu med", { head: "pom", stem: [0.3, 0.4], cols: ["#d8283a", "#e85a8a"], size: 3 });
  floraAdd("i_flowerbed", "zinnias", "summer", "bed", 0.5, 0, "#4f8a3c", null, "pl de", "sw", { head: "disc", stem: [0.4, 0.6], cols: ["#e8562a", "#f2c42c", "#d8288a", "#f08aa8"], center: "#c8a03a", size: 3.4 });
  floraAdd("i_flowerbed", "dahlias", "summer", "bed", 0.9, 0, "#4f8a3c", null, "pl hi", "sw eu", { head: "pom", stem: [0.7, 1.0], cols: ["#c8283a", "#f08a2a", "#e86aa8", "#f2c42c"], size: 6 });
  floraAdd("i_flowerbed", "snapdragons", "summer", "bed", 0.5, 0, "#4f8a3c", null, "pl ci", "eu med", { head: "spike", stem: [0.4, 0.6], cols: ["#e85a8a", "#f2c42c", "#f6f2ea", "#d8283a"], size: 1.8 });
  floraAdd("i_flowerbed", "foxgloves", "summer", "bed", 1.2, 0, "#4f8a3c", null, "fo hi", "uk", { head: "bell", stem: [1.0, 1.4], cols: ["#b05ac0", "#e8a8c8"], size: 1.8, spike: 1 });
  floraAdd("i_flowerbed", "coneflowers", "summer", "bed", 0.75, 0, "#4f8a3c", null, "pl:2 hi", "na", { head: "disc", stem: [0.6, 0.9], cols: ["#d878a8"], center: "#7a3a1e", size: 3.4, droop: 1 });
  floraAdd("i_flowerbed", "blackeyedsusans", "summer", "bed", 0.6, 0, "#4f8a3c", null, "pl:2", "na", { head: "disc", stem: [0.5, 0.7], cols: ["#f2b81e"], center: "#3a2a1a", size: 3 });
  floraAdd("i_flowerbed", "wildflowers", "summer", "bed", 0.45, 0, "#5a8a40", null, "pl:2 hi:2 mo", "", { head: "wild", stem: [0.3, 0.6], cols: ["#d8283a", "#f8f6f0", "#5a6ad8", "#f2c42c", "#b05ac0"], size: 2.2 });
  floraAdd("i_flowerbed", "vegetables", "edible", "bed", 0.5, 0, "#5f9a45", null, "pl hi", "", { head: "veg" });
  floraAdd("i_flowerbed", "rockgarden", "edible", "bed", 0.2, 0, "#7aa08a", null, "de:2 be mo", "sw", { head: "rock" });
  // hedges
  floraAdd("i_hedge", "privet", "hedge", "old", 1.1, 0, "#3f6f35", null, "pl hi la ci", "eu uk na");
  floraAdd("i_hedge", "boxhedge", "hedge", "boxhedge", 0.6, 0, "#3f6a35", null, "pl ci", "eu uk");
  floraAdd("i_hedge", "laurel", "hedge", "hedge", 1.8, 0, "#3f7a3a", null, "pl hi la", "uk med");
  floraAdd("i_hedge", "hollyhedge", "hedge", "hedge", 1.6, 0, "#23452a", null, "pl hi", "uk", { berry: "#c8282a" });
  floraAdd("i_hedge", "yewhedge", "hedge", "hedge", 1.4, 0, "#2a4a2e", null, "pl hi", "uk eu");
  floraAdd("i_hedge", "thuja", "hedge", "cones", 2.4, 0, "#4f7a3c", null, "pl ci", "na");
  floraAdd("i_hedge", "beechhedge", "hedge", "hedge", 1.6, 0, "#8a4a3a", null, "pl hi", "eu uk");
  floraAdd("i_hedge", "flowerhedge", "hedge", "hedge", 1.4, 0, "#4f7a3a", null, "pl la", "eu", { bloom: "#f2aac2" });

  // The kinds of each piece, and what a piece is when it has none picked.
  var FLORA_KINDS = { i_tree: "broad", i_shrub: "bush", i_flowerbed: "mixed", i_hedge: "privet" };
  // Their groups in the picker, in this order.
  var FLORA_GROUPS = { i_tree: ["shade", "flower", "fruit", "conifer", "palm", "dry"],
                       i_shrub: ["ever", "bloom", "topiary", "herb", "dry", "grass"],
                       i_flowerbed: ["bed", "spring", "summer", "edible"], i_hedge: ["hedge"] };
  function floraOf(n) {
    if (!n || !FLORA_KINDS[n.kind]) { return null; }
    var s = n.sp && FLORA[n.sp];
    return s && s.kind === n.kind ? s : FLORA[FLORA_KINDS[n.kind]];
  }
  function floraName(key) { return TXT["spc_" + key] || key; }

  // How far each grows and how tall, for the parts that read the old tables
  // (40-plants.js keeps the scenery's trees off the house and each other by
  // PLANT_SPREAD; 40-edit3d.js and 40-site.js stand a lot's trees as tall
  // as OBJ3_TREE_TALL; foundation shrubs keep PLANT_REACH off the wall).
  FLORA_ORDER.forEach(function (k) {
    var s = FLORA[k];
    if (s.kind === "i_tree") {
      if (typeof PLANT_SPREAD === "object" && PLANT_SPREAD[k] === undefined) { PLANT_SPREAD[k] = s.w; }
      if (typeof OBJ3_TREE_TALL === "object" && OBJ3_TREE_TALL[k] === undefined) { OBJ3_TREE_TALL[k] = s.h; }
    } else if (s.kind === "i_shrub") {
      if (typeof PLANT_REACH === "object" && PLANT_REACH[k] === undefined) { PLANT_REACH[k] = s.w / 2 + 0.1; }
    }
  });
  // (what kind it is is part of a model's key now, 38-models.js: kept by it)
  if (typeof MODEL_KEYED === "object") { MODEL_KEYED.sp = true; }
  // (a tree has no furniture designs -- its kind is its design)
  if (typeof DESIGN_GROUP === "object") { Object.keys(FLORA_KINDS).forEach(function (k) { DESIGN_GROUP[k] = "none"; }); }

  // ---- made in 3D ----------------------------------------------------------------------------------
  var FL_CM = FLOOR_PX / 100;
  function flSeed(n, key) {
    var h = 0;
    for (var i = 0; i < key.length; i++) { h = (h * 31 + key.charCodeAt(i)) | 0; }
    return ((n && n.id) || 41) * 7 + (h & 1023);
  }
  function flMats(M, color) {
    return typeof mFoliageMats === "function" ? mFoliageMats(M, color) : [M.mat("leaves", color), M.mat("leaves", color), M.mat("leaves", color)];
  }
  function flClump(M, x, y, z, R, sq, mat, seed) {
    if (typeof mClump === "function") { mClump(M, x, y, z, R, sq, mat, seed); }
    else { M.ball(x, y, z, R, R, R * sq, mat, { seg: 6 }); }
  }
  // flowers over a crown: little heads of petals on its outside, between z0 and z1
  function flBlooms(M, rnd, cx, cy, z0, z1, R, count, color, size, kind) {
    var mat = M.mat("fabric", color), light = M.mat("fabric", mShade(color, 0.12)), s = size * FL_CM;
    var mid = (z0 + z1) / 2, half = (z1 - z0) / 2;
    for (var i = 0; i < count; i++) {
      var a = rnd() * Math.PI * 2, el = (rnd() * 2 - 0.6) * 0.95, ce = Math.cos(el);
      var x = cx + Math.cos(a) * R * ce * (0.92 + rnd() * 0.12), y = cy + Math.sin(a) * R * ce * (0.92 + rnd() * 0.12);
      var z = mid + Math.sin(el) * half * 1.02;
      if (kind === "candle") {        // a horse chestnut's: upright spires
        M.lathe(x, y, [[s * 1.1, z], [s * 0.7, z + s * 3], [0, z + s * 5]], i % 2 ? mat : light, { seg: 5 });
      } else {
        M.ball(x, y, z, s * 1.4, s * 1.4, s * 0.9, i % 3 ? mat : light, { seg: 4, lat0: -90, lat1: 90 });
      }
    }
  }
  // fruit hanging in a crown
  function flFruit(M, rnd, R, z0, z1, color, count) {
    var mat = M.mat("plastic", color), r = 3.5 * FL_CM;
    for (var q = 0; q < (count || 16); q++) {
      var a = rnd() * Math.PI * 2, d = R * (0.5 + rnd() * 0.38), z = z0 + (z1 - z0) * (0.1 + rnd() * 0.7);
      M.ball(Math.cos(a) * d, Math.sin(a) * d, z, r, r, r * 1.05, mat, { seg: 4, lat0: -90, lat1: 90 });
    }
  }
  // An umbrella: a trunk up to where it forks, limbs out wide and up, and
  // the leaves in flat pads at their ends and over the middle (an acacia,
  // a live oak, a stone pine, a jacaranda).
  function flSpread(M, W, D, H, C, n, s) {
    var o = s.o || {}, rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), mats = flMats(M, C.main);
    var flat = o.flat || 0.45, padR = R * (o.airy ? 0.3 : 0.36), padH = padR * flat;
    var trunkTop = Math.min(H * (o.trunk || 0.42), H - padH * 2.6), tr = Math.max(5 * FL_CM, R * 0.06);
    M.cyl(0, 0, 0, trunkTop, tr * 1.25, bark, { seg: 9, r1: tr });
    var limbs = o.limbs || 5, crownZ = H - padH * 1.35;
    for (var i = 0; i < limbs; i++) {
      var a = i / limbs * Math.PI * 2 + rnd() * 0.5, out = R - padR * (1.0 + rnd() * 0.15), up = crownZ - padH * (0.3 + rnd() * 0.6);
      var tip = [Math.cos(a) * out, Math.sin(a) * out, up];
      M.tube([0, 0, trunkTop - tr], [tip[0] * 0.45, tip[1] * 0.45, trunkTop + (up - trunkTop) * 0.6], tr * 0.6, bark, 6);
      M.tube([tip[0] * 0.45, tip[1] * 0.45, trunkTop + (up - trunkTop) * 0.6], tip, tr * 0.4, bark, 5);
      flClump(M, tip[0], tip[1], up, padR * (0.9 + rnd() * 0.2), flat, mats[i % 2 ? 1 : 2], i * 1.9 + rnd());
      if (!o.airy) { flClump(M, tip[0] * 0.55, tip[1] * 0.55, up + padH * 0.3, padR * 0.85, flat, mats[0], i * 2.7 + 1); }
    }
    flClump(M, 0, 0, crownZ, padR * 1.15, flat, mats[2], 5.3);
    if (s.bloom) { flBlooms(M, rnd, 0, 0, crownZ - padH * 1.2, H - padH * 0.2, R - padR * 0.55, s.bloomN || 40, s.bloom, 2.4); }
  }
  // Weeping: a dome on a trunk, its twigs hanging down round it in a curtain.
  function flWeeping(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), mats = flMats(M, C.main);
    var trunkTop = H * 0.55, tr = Math.max(4 * FL_CM, R * 0.07);
    M.cyl(0, 0, 0, trunkTop, tr * 1.2, bark, { seg: 9, r1: tr });
    var domeR = R * 0.62;
    flClump(M, 0, 0, H - domeR * 0.62, domeR, 0.62, mats[2], 1.7);
    var hangs = 11;
    for (var i = 0; i < hangs; i++) {
      var a = i / hangs * Math.PI * 2 + rnd() * 0.3, r = R * 0.72, len = H * (0.32 + rnd() * 0.12);
      var top = H - domeR * 0.55, x = Math.cos(a) * r, y = Math.sin(a) * r;
      M.tube([Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, top + domeR * 0.1], [x, y, top - len * 0.1], tr * 0.25, bark, 4);
      flClump(M, x, y, top - len * 0.45, R * 0.24, (len * 0.55) / (R * 0.24), mats[i % 3], i * 3.1);
    }
    if (s.bloom) { flBlooms(M, rnd, 0, 0, H * 0.4, H * 0.98, R * 0.78, s.bloomN || 50, s.bloom, 2.2); }
  }
  // A column: tight to its trunk the whole way up (an arborvitae, a juniper).
  function flColumn(M, W, D, H, C, n, s) {
    var o = s.o || {}, rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), mats = flMats(M, C.main);
    M.cyl(0, 0, 0, H * 0.3, Math.max(3 * FL_CM, R * 0.1), bark, { seg: 8 });
    var k = 6;
    for (var i = 0; i < k; i++) {
      var t = (i + 0.5) / k, r = R * Math.pow(Math.sin(Math.PI * (0.12 + t * 0.85)), 0.7) * 0.82 + R * 0.08;
      var z = H * (0.1 + t * 0.78), jx = o.rough ? (rnd() - 0.5) * R * 0.35 : 0, jy = o.rough ? (rnd() - 0.5) * R * 0.35 : 0;
      flClump(M, jx, jy, z, r, 1.5, mats[i === k - 1 ? 2 : i % 2], i * 2.3 + rnd());
    }
  }
  // A cedar: wide, flat layers out from the trunk, each over a gap.
  function flCedar(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), mats = flMats(M, C.main);
    M.cyl(0, 0, 0, H * 0.96, Math.max(6 * FL_CM, R * 0.07), bark, { seg: 9, r1: 2 * FL_CM });
    var tiers = 6, bare = H * 0.12;
    for (var t = 0; t < tiers; t++) {
      var k = t / tiers, r = R * Math.pow(1 - k, 0.75) + R * 0.06, z = bare + (H - bare) * k, th = (H - bare) / tiers * 0.75;
      if (typeof mTier === "function") { mTier(M, r, z, Math.min(H, z + th), mats[t === tiers - 1 ? 2 : 1], mats[0], t * 0.8 + rnd(), 10); }
      else { M.cyl(0, 0, z, z + th, r, mats[1], { seg: 10, r1: 0 }); }
    }
  }
  // A pine of the woods: a tall bare trunk, its bark redder up high, and
  // its crown in ragged flat clumps round the top.
  function flPine(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), low = M.mat("bark", mShade(C.frame, -0.25)), mats = flMats(M, C.main);
    var lean = (rnd() - 0.5) * R * 0.3, last = [0, 0, 0], tr = Math.max(6 * FL_CM, R * 0.07), top = H * 0.86;
    for (var i = 1; i <= 5; i++) {
      var q = i / 5, p = [lean * q * q, 0, top * q];
      M.tube(last, p, tr * (1 - q * 0.45), i < 3 ? low : bark, 8);
      last = p;
    }
    var clumpR = R * 0.38;
    for (var c = 0; c < 7; c++) {
      var a = c / 7 * Math.PI * 2 + rnd() * 0.5, d = R - clumpR * 1.1 - rnd() * R * 0.15, z = H * (0.66 + rnd() * 0.2);
      var at = [lean + Math.cos(a) * d, Math.sin(a) * d, Math.min(z, H - clumpR * 0.55)];
      M.tube([lean * 0.9, 0, z - R * 0.12], at, tr * 0.28, bark, 5);
      flClump(M, at[0], at[1], at[2], clumpR * (0.85 + rnd() * 0.25), 0.42, mats[c % 3], c * 1.3 + rnd());
    }
    flClump(M, lean, 0, H - clumpR * 0.5, clumpR, 0.42, mats[2], 9.1);
  }
  // A palm frond: a stalk out from the crown, arching over, a leaf down each side of it.
  function flFrond(M, top, a, len, rise, droop, wide, mat, stalk, kind) {
    var segs = 6, last = top.slice();
    for (var i = 1; i <= segs; i++) {
      var t = i / segs, p = [top[0] + Math.cos(a) * len * t, top[1] + Math.sin(a) * len * t, top[2] + len * (rise * t - droop * t * t)];
      M.tube(last, p, 0.8 * FL_CM * (1 - t * 0.6), stalk, 4);
      var dz = p[2] - last[2], dh = len / segs, slope = Math.atan2(dz, dh) * 180 / Math.PI;
      if (kind !== "fan") {
        M.push().move((p[0] + last[0]) / 2, (p[1] + last[1]) / 2, (p[2] + last[2]) / 2).turn(a * 180 / Math.PI).tiltY(-slope);
        M.ball(0, 0, 0, dh * 0.62, wide * (1 - t * 0.55), 0.35 * FL_CM, mat, { seg: 6 });
        M.pop();
      }
      last = p;
    }
    if (kind === "fan") {                 // a fan palm's: one round, pleated fan on the stalk's end
      M.push().move(last[0], last[1], last[2]).turn(a * 180 / Math.PI).tiltY(-30);
      M.ball(wide * 0.75, 0, 0, wide * 0.85, wide, 0.5 * FL_CM, mat, { seg: 8, lat0: -90, lat1: 90 });
      M.pop();
    }
  }
  function flPalm(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, kind = s.palm || "coco", bark = M.mat("bark", C.frame);
    var dark = M.mat("bark", mShade(C.frame, -0.18)), leaf = M.mat("leaves", C.main), leaf2 = M.mat("leaves", mShade(C.main, -0.15));
    var thick = kind === "date" ? R * 0.09 : kind === "royal" ? R * 0.07 : R * 0.06, tr = Math.max(9 * FL_CM, thick);
    var top = H * (kind === "fan" ? 0.8 : 0.84), lean = kind === "royal" || kind === "date" ? 0 : (rnd() - 0.5) * R * 0.25, last = [0, 0, 0];
    for (var i = 1; i <= 8; i++) {
      var q = i / 8, p = [lean * q * q, 0, top * q], r = tr * (kind === "royal" ? (q < 0.3 ? 1.15 - q * 0.5 : 1) : 1 - q * 0.25);
      M.tube(last, p, r, i % 2 ? bark : dark, 9);
      last = p;
    }
    var crown = [lean, 0, top];
    if (kind === "royal") {               // its smooth green crownshaft, under the fronds
      M.cyl(lean, 0, top - H * 0.1, top + H * 0.02, tr * 0.95, M.mat("leaves", mShade(C.main, 0.08)), { seg: 10 });
      crown = [lean, 0, top + H * 0.02];
    }
    if (kind === "date") {                // the dead fronds hang in a skirt under the crown
      var dead = M.mat("leaves", "#8a7650");
      for (var d = 0; d < 8; d++) { flFrond(M, [lean, 0, top - H * 0.02], d / 8 * Math.PI * 2, R * 0.55, -0.2, 0.6, 4 * FL_CM, dead, dead, "coco"); }
    }
    var fronds = kind === "date" ? 16 : kind === "fan" ? 14 : kind === "royal" ? 12 : 12;
    var len = R * (kind === "fan" ? 0.45 : 0.92), rise = kind === "date" ? 0.75 : kind === "fan" ? 0.5 : 0.45, droop = kind === "date" ? 0.75 : kind === "fan" ? 0.3 : 1.0;
    var room = H - crown[2];
    for (var f = 0; f < fronds; f++) {
      var a = f / fronds * Math.PI * 2 + rnd() * 0.25, fl = len * (0.85 + rnd() * 0.2), up = rise * (0.75 + rnd() * 0.5);
      // (its arch no higher than the tree is tall: rise t - droop t^2 tops out at
      // rise^2 / 4 droop, or at its end, rise - droop, if that comes first)
      var most = Math.max(0, room - (kind === "fan" ? R * 0.2 : 0)) / fl;
      if ((up < 2 * droop ? up * up / (4 * droop) : up - droop) > most) { up = most < droop ? Math.sqrt(4 * droop * most) : most + droop; }
      flFrond(M, crown, a, fl, up, droop, (kind === "fan" ? R * 0.22 : 10 * FL_CM), f % 2 ? leaf : leaf2, dark, kind === "fan" ? "fan" : "coco");
    }
  }
  // Several trunks from one foot, each its own small crown (a crape myrtle, a birch's clump).
  function flMulti(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), mats = flMats(M, C.main);
    var stems = 4, tr = Math.max(3 * FL_CM, R * 0.05);
    for (var i = 0; i < stems; i++) {
      var a = i / stems * Math.PI * 2 + rnd() * 0.4, out = R * (0.35 + rnd() * 0.1), crownR = R * 0.42;
      var mid = [Math.cos(a) * out * 0.5, Math.sin(a) * out * 0.5, H * 0.35], tip = [Math.cos(a) * out, Math.sin(a) * out, H - crownR * 0.9];
      M.tube([0, 0, 0], mid, tr, bark, 6);
      M.tube(mid, tip, tr * 0.7, bark, 6);
      flClump(M, tip[0], tip[1], tip[2], crownR, 0.85, mats[i % 3], i * 2.2);
    }
    flClump(M, 0, 0, H - R * 0.45, R * 0.45, 0.8, mats[2], 7.7);
    if (s.bloom) { flBlooms(M, rnd, 0, 0, H * 0.55, H, R * 0.85, s.bloomN || 40, s.bloom, 2.2); }
  }
  // Layered: limbs out level at three heights, a flat pad of leaves on each (a Japanese maple, a dogwood).
  function flLayered(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), mats = flMats(M, C.main);
    var tr = Math.max(3.5 * FL_CM, R * 0.06);
    M.cyl(0, 0, 0, H * 0.75, tr, bark, { seg: 8, r1: tr * 0.6 });
    [[0.42, 0.95], [0.62, 0.8], [0.8, 0.6]].forEach(function (L, j) {
      var z = H * L[0], reach = R * L[1], arms = 4 - (j === 2 ? 1 : 0);
      for (var i = 0; i < arms; i++) {
        var a = i / arms * Math.PI * 2 + j * 0.8 + rnd() * 0.3, padR = R * 0.32, out = reach - padR * 0.9, end = [Math.cos(a) * out, Math.sin(a) * out, z + R * 0.06];
        M.tube([0, 0, z - R * 0.05], end, tr * 0.4, bark, 5);
        flClump(M, end[0], end[1], end[2] + padR * 0.18, padR, 0.45, mats[(i + j) % 3], i * 1.7 + j * 3);
      }
    });
    flClump(M, 0, 0, H - R * 0.18, R * 0.3, 0.55, mats[2], 4.4);
    if (s.bloom) { flBlooms(M, rnd, 0, 0, H * 0.4, H, R * 0.92, s.bloomN || 50, s.bloom, 2.2); }
  }
  // A baobab: a trunk like a bottle, a few stubby limbs, little leaf on them.
  function flBaobab(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), mats = flMats(M, C.main);
    var b = R * 0.34;
    M.lathe(0, 0, [[b * 1.05, 0], [b * 1.2, H * 0.12], [b * 1.12, H * 0.4], [b * 0.75, H * 0.58], [b * 0.4, H * 0.68], [0, H * 0.7]], bark, { seg: 14 });
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * Math.PI * 2 + rnd() * 0.5, out = R * (0.55 + rnd() * 0.25), up = H * (0.82 + rnd() * 0.08);
      var tip = [Math.cos(a) * out, Math.sin(a) * out, up];
      M.tube([Math.cos(a) * b * 0.4, Math.sin(a) * b * 0.4, H * 0.62], tip, b * 0.18, bark, 6);
      flClump(M, tip[0], tip[1], Math.min(H - R * 0.08, up + R * 0.05), R * 0.2, 0.6, mats[i % 3], i * 2.9);
    }
  }
  // A candelabra: a trunk forking twice and again, a tuft of leaves on each
  // end -- and on a frangipani, its flowers; a dragon tree's, an umbrella of tufts.
  function flCandle(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), leaf = M.mat("leaves", C.main);
    var tr = Math.max(5 * FL_CM, R * 0.08), fork = H * (s.umbrella ? 0.45 : 0.35);
    M.cyl(0, 0, 0, fork, tr, bark, { seg: 9 });
    var ends = [];
    function branch(from, a, len, up, r, depth) {
      var to = [from[0] + Math.cos(a) * len, from[1] + Math.sin(a) * len, from[2] + up];
      M.tube(from, to, r, bark, 6);
      if (depth > 0) { branch(to, a - 0.5, len * 0.75, up * 0.8, r * 0.72, depth - 1); branch(to, a + 0.5, len * 0.75, up * 0.8, r * 0.72, depth - 1); }
      else { ends.push(to); }
    }
    for (var i = 0; i < 3; i++) { branch([0, 0, fork], i / 3 * Math.PI * 2 + rnd(), R * 0.24, (H - fork) * 0.32, tr * 0.7, 2); }
    var tuft = s.umbrella ? R * 0.2 : R * 0.16;
    ends.forEach(function (e, k) {
      var z = Math.min(e[2], H - tuft * 0.6);
      for (var l = 0; l < 7; l++) {
        var b = l / 7 * Math.PI * 2 + k;
        M.push().move(e[0], e[1], z).turn(b * 180 / Math.PI).tiltY(-30);
        M.ball(tuft * 0.55, 0, 0, tuft * 0.6, tuft * 0.18, 0.5 * FL_CM, leaf, { seg: 5 });
        M.pop();
      }
      if (s.bloom) {
        var fm = M.mat("fabric", s.bloom), eye = M.mat("fabric", "#f2c94c");
        for (var f = 0; f < 4; f++) {
          var fa = f / 4 * Math.PI * 2 + k * 0.7, fx = e[0] + Math.cos(fa) * tuft * 0.25, fy = e[1] + Math.sin(fa) * tuft * 0.25;
          M.ball(fx, fy, z + 3 * FL_CM, 3 * FL_CM, 3 * FL_CM, 1 * FL_CM, fm, { seg: 5, lat0: -90, lat1: 90 });
          M.ball(fx, fy, z + 3.6 * FL_CM, 1 * FL_CM, 1 * FL_CM, 0.6 * FL_CM, eye, { seg: 4, lat0: -90, lat1: 90 });
        }
      }
    });
  }
  // A gum tree: a tall pale trunk forking high, its leaves hanging thin in clumps at many heights.
  function flEuca(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), mats = flMats(M, C.main);
    var tr = Math.max(8 * FL_CM, R * 0.06), fork = H * 0.48;
    M.cyl(0, 0, 0, fork, tr * 1.1, bark, { seg: 9, r1: tr });
    for (var i = 0; i < 3; i++) {
      var a = i / 3 * Math.PI * 2 + rnd() * 0.6, tip = [Math.cos(a) * R * 0.4, Math.sin(a) * R * 0.4, H * 0.82];
      M.tube([0, 0, fork - tr], tip, tr * 0.6, bark, 6);
      for (var c = 0; c < 3; c++) {
        var b = a + (rnd() - 0.5) * 1.6, d = R * (0.45 + rnd() * 0.3), z = H * (0.58 + c * 0.13 + rnd() * 0.06);
        var cr = R * (0.26 + rnd() * 0.08);
        flClump(M, Math.cos(b) * d, Math.sin(b) * d, Math.min(z, H - cr * 0.75), cr, 0.75, mats[(i + c) % 3], i * 3 + c);
      }
    }
  }
  // An olive: a short twisted trunk, its crown open, silver-green, of many small clumps.
  function flOlive(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), mats = flMats(M, C.main);
    var tr = Math.max(6 * FL_CM, R * 0.08);
    for (var t = 0; t < 3; t++) {         // three stems twisted round each other
      var last = [0, 0, 0];
      for (var i = 1; i <= 4; i++) {
        var q = i / 4, a = t * 2.1 + q * 2.4, p = [Math.cos(a) * tr * 0.9 * (1 + q), Math.sin(a) * tr * 0.9 * (1 + q), H * 0.38 * q];
        M.tube(last, p, tr * (0.7 - q * 0.2), bark, 6);
        last = p;
      }
      var out = [last[0] * 5, last[1] * 5, H * 0.55];
      M.tube(last, out, tr * 0.4, bark, 5);
    }
    for (var c = 0; c < 14; c++) {
      var b = rnd() * Math.PI * 2, d = R * (0.2 + rnd() * 0.55), cr = R * (0.2 + rnd() * 0.08);
      flClump(M, Math.cos(b) * d, Math.sin(b) * d, Math.min(H * (0.55 + rnd() * 0.3), H - cr * 0.7), cr, 0.7, mats[c % 3], c * 1.7);
    }
  }
  // Bamboo: a clump of tall green canes, ringed, leaning out, their leaves in tufts up the top.
  function flBamboo(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, cane = M.mat("leaves", C.frame), ring = M.mat("leaves", mShade(C.frame, -0.25)), leaf = M.mat("leaves", C.main);
    for (var i = 0; i < 12; i++) {
      var a = rnd() * Math.PI * 2, d = R * 0.3 * Math.sqrt(rnd()), base = [Math.cos(a) * d, Math.sin(a) * d, 0];
      var tall = H * (0.75 + rnd() * 0.25), lean = R * 0.45 * rnd(), top = [base[0] + Math.cos(a) * lean, base[1] + Math.sin(a) * lean, tall];
      M.tube(base, top, 2.2 * FL_CM, cane, 5);
      for (var k = 1; k < 6; k++) {
        var q = k / 6, p = [base[0] + (top[0] - base[0]) * q, base[1] + (top[1] - base[1]) * q, tall * q];
        M.cyl(p[0], p[1], p[2] - 1 * FL_CM, p[2] + 1 * FL_CM, 2.6 * FL_CM, ring, { seg: 5 });
        if (q > 0.5) {
          for (var l = 0; l < 3; l++) {
            var b = rnd() * Math.PI * 2;
            M.push().move(p[0], p[1], p[2]).turn(b * 180 / Math.PI).tiltY(25);
            M.ball(12 * FL_CM, 0, 0, 13 * FL_CM, 2.2 * FL_CM, 0.3 * FL_CM, leaf, { seg: 4 });
            M.pop();
          }
        }
      }
    }
  }
  // A tree fern: a furry trunk, and a crown of long lacy fronds arching out.
  function flTreeFern(M, W, D, H, C, n, s) {
    var rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2, bark = M.mat("bark", C.frame), leaf = M.mat("leaves", C.main);
    var top = H * 0.72, tr = Math.max(8 * FL_CM, R * 0.06);
    M.cyl(0, 0, 0, top, tr * 1.15, bark, { seg: 9, r1: tr });
    for (var f = 0; f < 12; f++) {
      flFrond(M, [0, 0, top], f / 12 * Math.PI * 2 + rnd() * 0.3, R * 0.9, Math.min(0.55, (H - top) / (R * 0.9) * 1.8), 0.9, 9 * FL_CM, leaf, leaf, "coco");
    }
  }
  var FL_TREE = { round: null, vase: null, spread: flSpread, weeping: flWeeping, column: flColumn, cedar: flCedar, pine: flPine,
                  palm: flPalm, multi: flMulti, layered: flLayered, baobab: flBaobab, candle: flCandle, euca: flEuca, olive: flOlive,
                  bamboo: flBamboo, fern: flTreeFern, cone: null };
  function flTree(M, W, D, H, C, n, s) {
    var C2 = mPick(C, s.leaf, s.bark), o = Object.assign({}, s.o || {});
    if (s.f === "round" || s.f === "vase") {
      if (s.f === "vase") { o = Object.assign({ trunk: 0.32, reach: 0.48, clump: 0.34, limbs: 6 }, o); }
      if (s.fruit) { o.fruit = s.fruit; }
      mBroadleaf(M, W, D, H, C2, n, o);
      if (s.bloom) {
        var rnd = mRand(flSeed(n, s.key) + 3), R = Math.min(W, D) / 2, trunkTop = H * (o.trunk || 0.36);
        flBlooms(M, rnd, 0, 0, trunkTop + (H - trunkTop) * 0.2, H, R * 0.86, s.bloomN || 40, s.bloom, (s.bloomS || 1) * 2.2, s.bloomK);
      }
      return;
    }
    if (s.f === "cone") { mConifer(M, W, D, H, C2, n, o); return; }
    var make = FL_TREE[s.f];
    if (make) { make(M, W, D, H, C2, n, s); }
  }
  // ---- shrubs ----
  function flMound(M, W, D, H, C, n, s, mats, rnd) {
    var R = Math.min(W, D) / 2, lumps = s.dense ? 11 : 9;
    for (var k = 0; k < lumps; k++) {
      var a = rnd() * Math.PI * 2, f = k / (lumps - 1), d = R * (0.55 - 0.4 * f) * (0.6 + rnd() * 0.4);
      var r = R * (0.48 - 0.14 * f + rnd() * 0.1), z = Math.min(r * 0.85 + f * Math.max(0, H - r * 1.75), H - r * 0.82);
      flClump(M, Math.cos(a) * d, Math.sin(a) * d, z, r, 0.88, mats[k % 3], k * 1.9 + rnd());
    }
    return { R: R * 0.95, z0: H * 0.3, z1: H * 0.98 };
  }
  function flShrub(M, W, D, H, C, n, s) {
    var C2 = mPick(C, s.leaf, s.bark || "#5b4632"), rnd = mRand(flSeed(n, s.key)), R = Math.min(W, D) / 2;
    var mats = flMats(M, C2.main), bark = M.mat("bark", C2.frame), shape = null;
    if (s.f === "mound" || s.f === "bloom") {
      for (var st = 0; st < 3; st++) {
        var sa = st / 3 * Math.PI * 2;
        M.tube([0, 0, 0], [Math.cos(sa) * R * 0.25, Math.sin(sa) * R * 0.25, H * 0.4], 1.2 * FL_CM, bark, 4);
      }
      shape = flMound(M, W, D, H, C2, n, s, mats, rnd);
    } else if (s.f === "low") {
      for (var l = 0; l < 7; l++) {
        var la = l / 7 * Math.PI * 2 + rnd(), ld = R * (0.25 + rnd() * 0.4), lr = R * (0.36 + rnd() * 0.1);
        flClump(M, Math.cos(la) * ld, Math.sin(la) * ld, Math.min(H * 0.5, H - lr * 0.4), lr, Math.min(0.6, H / lr * 0.8), mats[l % 3], l * 2.1);
      }
      shape = { R: R * 0.9, z0: H * 0.3, z1: H };
    } else if (s.f === "upright") {
      var stems = 7;
      for (var u = 0; u < stems; u++) {
        var ua = u / stems * Math.PI * 2 + rnd() * 0.4, out = R * (0.45 + rnd() * 0.15), cr = R * 0.32;
        var tip = [Math.cos(ua) * out, Math.sin(ua) * out, H - cr * 0.9];
        M.tube([Math.cos(ua) * R * 0.08, Math.sin(ua) * R * 0.08, 0], tip, 1.3 * FL_CM, bark, 4);
        flClump(M, tip[0], tip[1], tip[2], cr, 1.1, mats[u % 3], u * 2.3);
        flClump(M, tip[0] * 0.6, tip[1] * 0.6, H * 0.45, cr * 0.85, 1.0, mats[(u + 1) % 3], u * 3.7);
        if (s.panicle) {               // a lilac's: a cone of flowers on each stem's end
          var pm = M.mat("fabric", s.bloom);
          M.lathe(tip[0], tip[1], [[5 * FL_CM, tip[2] + cr * 0.5], [3.5 * FL_CM, tip[2] + cr * 0.5 + 12 * FL_CM], [0, Math.min(H, tip[2] + cr * 0.5 + 22 * FL_CM)]], pm, { seg: 6 });
        }
      }
      shape = { R: R * 0.9, z0: H * 0.45, z1: H };
      if (s.panicle) { shape = null; }
    } else if (s.f === "rose") {
      var bloom = M.mat("fabric", s.bloom), deep = M.mat("fabric", mShade(s.bloom, -0.15));
      for (var c = 0; c < 6; c++) {
        var ca = c / 6 * Math.PI * 2 + rnd() * 0.5, end = [Math.cos(ca) * R * 0.65, Math.sin(ca) * R * 0.65, H * (0.75 + rnd() * 0.2)];
        var mid = [end[0] * 0.4, end[1] * 0.4, end[2] * 0.6];
        M.tube([0, 0, 0], mid, 1.0 * FL_CM, bark, 4);
        M.tube(mid, end, 0.8 * FL_CM, bark, 4);
        flClump(M, mid[0], mid[1], mid[2], R * 0.3, 0.9, mats[c % 3], c * 1.3);
        flClump(M, end[0] * 0.85, end[1] * 0.85, end[2] - R * 0.15, R * 0.24, 0.9, mats[(c + 1) % 3], c * 2.9);
        // its roses: a cup of petals round a tighter heart
        [[end, 4.2], [[mid[0] * 1.2, mid[1] * 1.2, mid[2] + R * 0.25], 3.4]].forEach(function (b) {
          var p = b[0], r = b[1] * FL_CM;
          M.ball(p[0], p[1], Math.min(H - r, p[2] + r * 0.4), r, r, r * 0.75, bloom, { seg: 6, lat0: -90, lat1: 90 });
          M.ball(p[0], p[1], Math.min(H - r * 0.3, p[2] + r * 1.0), r * 0.55, r * 0.55, r * 0.5, deep, { seg: 5, lat0: -90, lat1: 90 });
        });
      }
    } else if (s.f === "spikes") {         // lavender: a grey-green mound, its flower spikes over it
      flClump(M, 0, 0, H * 0.32, R * 0.85, 0.42, mats[1], 2.2);
      var pm2 = M.mat("fabric", s.bloom), stem = M.mat("leaves", mShade(C2.main, -0.1));
      for (var k = 0; k < 34; k++) {
        var ka = rnd() * Math.PI * 2, kd = R * 0.75 * Math.sqrt(rnd()), foot = [Math.cos(ka) * kd * 0.6, Math.sin(ka) * kd * 0.6, H * 0.3];
        var top = [Math.cos(ka) * kd, Math.sin(ka) * kd, H * (0.82 + rnd() * 0.16) - 6 * FL_CM];
        M.tube(foot, top, 0.35 * FL_CM, stem, 3);
        M.ball(top[0], top[1], top[2] + 3 * FL_CM, 1.3 * FL_CM, 1.3 * FL_CM, 4 * FL_CM, pm2, { seg: 4, lat0: -90, lat1: 90 });
      }
    } else if (s.f === "topball" || s.f === "topcone" || s.f === "topspiral") {
      var clip = M.mat("leaves", C2.main), clip2 = M.mat("leaves", mShade(C2.main, 0.08));
      M.cyl(0, 0, 0, H * 0.3, 2.2 * FL_CM, bark, { seg: 6 });
      if (s.f === "topball") {
        var br = Math.min(R, H * 0.36);
        M.ball(0, 0, H - br, br, br, br, clip, { seg: 10, lat0: -90, lat1: 90 });
      } else if (s.f === "topcone") {
        M.lathe(0, 0, [[R * 0.95, H * 0.1], [R * 0.85, H * 0.2], [R * 0.12, H * 0.97], [0, H]], clip, { seg: 14 });
      } else {
        for (var q = 0; q < 14; q++) {
          var t = q / 13, ang = t * Math.PI * 5, rr = R * (1 - t) * 0.6, size = R * (0.42 - t * 0.28);
          M.ball(Math.cos(ang) * rr, Math.sin(ang) * rr, H * (0.12 + t * 0.8), size, size, size * 0.9, q % 2 ? clip : clip2, { seg: 8, lat0: -90, lat1: 90 });
        }
      }
    } else if (s.f === "minipine") {
      for (var m = 0; m < 6; m++) {
        var ma = m / 6 * Math.PI * 2 + rnd(), md = R * 0.4, top2 = [Math.cos(ma) * md, Math.sin(ma) * md, H * 0.55];
        M.tube([0, 0, 0], top2, 1.8 * FL_CM, bark, 4);
        flClump(M, top2[0], top2[1], Math.min(top2[2], H - R * 0.35 * 0.5), R * 0.38, 0.6, mats[m % 3], m * 1.9);
      }
      flClump(M, 0, 0, H - R * 0.25, R * 0.42, 0.6, mats[2], 7.1);
    } else if (s.f === "rosette") {
      var kind = s.rosette, blades = kind === "agave" ? 18 : kind === "aloe" ? 16 : 26, base = 0;
      if (kind === "yucca") {             // up on a short trunk
        base = H * 0.25;
        M.cyl(0, 0, 0, base, 7 * FL_CM, bark, { seg: 8, r1: 6 * FL_CM });
      }
      var bl = M.mat("leaves", C2.main), bl2 = M.mat("leaves", mShade(C2.main, -0.12));
      var reach = R * 0.92, up = Math.min(H * (kind === "yucca" ? 0.45 : 0.85), H - base);
      for (var b = 0; b < blades; b++) {
        var bb = b / blades * Math.PI * 2 + rnd() * 0.3, el = (kind === "yucca" ? 35 : kind === "agave" ? 30 : 45) + rnd() * 30;
        var len = Math.min(reach / Math.cos(el * Math.PI / 180), up / Math.sin(el * Math.PI / 180)) * (0.7 + rnd() * 0.3);
        var wide = kind === "agave" ? 9 * FL_CM : kind === "aloe" ? 6 * FL_CM : 2.8 * FL_CM;
        M.push().move(0, 0, base).turn(bb * 180 / Math.PI).tiltY(-el);
        M.ball(len * 0.5, 0, 0, len * 0.5, wide, kind === "aloe" ? 2.6 * FL_CM : 1 * FL_CM, b % 2 ? bl : bl2, { seg: 5 });
        M.pop();
      }
      if (s.bloom && kind !== "agave") {  // a tall stalk of flowers out of the middle
        var fm = M.mat("fabric", s.bloom), stalkTop = H * 0.98;
        M.tube([0, 0, base], [0, 0, stalkTop - 25 * FL_CM], 1.2 * FL_CM, M.mat("leaves", "#6f7a4a"), 4);
        for (var fb = 0; fb < 16; fb++) {
          var fz = stalkTop - 25 * FL_CM + fb * 1.6 * FL_CM, fa = fb * 2.4;
          M.ball(Math.cos(fa) * 3 * FL_CM, Math.sin(fa) * 3 * FL_CM, fz, 2.4 * FL_CM, 2.4 * FL_CM, 2.8 * FL_CM, fm, { seg: 4, lat0: -90, lat1: 90 });
        }
      }
    } else if (s.f === "succulents") {
      var sc = [s.leaf, "#9ab08a", "#7a8fa8", "#a87a9a", "#6f9a6a"];
      for (var g = 0; g < 7; g++) {
        var ga = g / 7 * Math.PI * 2 + rnd(), gd = g ? R * (0.4 + rnd() * 0.35) : 0, gr = R * (0.22 + rnd() * 0.1);
        var gm = M.mat("leaves", sc[g % sc.length]);
        for (var p = 0; p < 9; p++) {
          var pa = p / 9 * Math.PI * 2;
          M.push().move(Math.cos(ga) * gd, Math.sin(ga) * gd, 0).turn(pa * 180 / Math.PI).tiltY(-35);
          M.ball(gr * 0.5, 0, 0, gr * 0.5, gr * 0.22, Math.min(H * 0.25, gr * 0.14), gm, { seg: 4 });
          M.pop();
        }
      }
    } else if (s.f === "grass") {
      var gb = M.mat("leaves", C2.main), gb2 = M.mat("leaves", mShade(C2.main, -0.15)), plume = M.mat("fabric", s.plume || "#f2ead8");
      for (var e = 0; e < 40; e++) {
        var ea = rnd() * Math.PI * 2, out2 = R * (0.55 + rnd() * 0.45), hh = H * (s.tall ? 0.55 : 0.75) * (0.7 + rnd() * 0.3);
        var mid2 = [Math.cos(ea) * out2 * 0.35, Math.sin(ea) * out2 * 0.35, hh * 0.75], tip2 = [Math.cos(ea) * out2, Math.sin(ea) * out2, hh * (0.45 + rnd() * 0.4)];
        M.tube([0, 0, 0], mid2, 0.6 * FL_CM, e % 2 ? gb : gb2, 3);
        M.tube(mid2, tip2, 0.4 * FL_CM, e % 2 ? gb : gb2, 3);
      }
      for (var pl = 0; pl < (s.tall ? 9 : 12); pl++) {
        var pa2 = rnd() * Math.PI * 2, pd = R * (s.tall ? 0.25 : 0.6) * Math.sqrt(rnd()), ph = s.tall ? H * (0.8 + rnd() * 0.15) : H * (0.7 + rnd() * 0.25);
        var pt = [Math.cos(pa2) * pd, Math.sin(pa2) * pd, ph], pr = s.tall ? 7 * FL_CM : 3 * FL_CM, plen = s.tall ? 22 * FL_CM : 10 * FL_CM;
        M.tube([0, 0, 0], [pt[0], pt[1], pt[2] - plen], 0.6 * FL_CM, gb, 3);
        M.ball(pt[0], pt[1], Math.min(H - plen, pt[2] - plen * 0.4), pr, pr, plen, plume, { seg: 5, lat0: -90, lat1: 90 });
      }
    } else if (s.f === "hosta") {
      var hm = [M.mat("leaves", C2.main), M.mat("leaves", mShade(C2.main, 0.1)), M.mat("leaves", mix2(C2.main, "#e8e8c0", 0.3))];
      for (var h2 = 0; h2 < 12; h2++) {
        var ha = h2 / 12 * Math.PI * 2 + rnd() * 0.3, hl = R * (0.55 + rnd() * 0.3);
        M.push().move(0, 0, H * 0.25).turn(ha * 180 / Math.PI).tiltY(-(15 + rnd() * 35));
        M.ball(hl * 0.55, 0, 0, hl * 0.55, hl * 0.3, 1 * FL_CM, hm[h2 % 3], { seg: 6 });
        M.pop();
      }
      flClump(M, 0, 0, H * 0.3, R * 0.3, 0.8, mats[0], 1.1);
    } else if (s.f === "fern") {
      var fm2 = M.mat("leaves", C2.main), fm3 = M.mat("leaves", mShade(C2.main, -0.12));
      for (var fr = 0; fr < 12; fr++) {
        flFrond(M, [0, 0, 2 * FL_CM], fr / 12 * Math.PI * 2 + rnd() * 0.4, R * 0.95, Math.min(1.1, H / (R * 0.95) * 1.6), 0.9, 5 * FL_CM, fr % 2 ? fm2 : fm3, fm3, "coco");
      }
    } else if (s.f === "paddle") {         // a bird of paradise: paddles on long stalks, and its orange and blue birds
      var pm3 = M.mat("leaves", C2.main), stalk = M.mat("leaves", mShade(C2.main, -0.2));
      for (var pp = 0; pp < 9; pp++) {
        var pa3 = pp / 9 * Math.PI * 2 + rnd() * 0.3, lean2 = R * (0.25 + rnd() * 0.3), ht = H * (0.55 + rnd() * 0.3);
        var top3 = [Math.cos(pa3) * lean2, Math.sin(pa3) * lean2, ht];
        M.tube([0, 0, 0], top3, 1 * FL_CM, stalk, 4);
        M.push().move(top3[0], top3[1], top3[2]).turn(pa3 * 180 / Math.PI).tiltY(-70);
        M.ball(H * 0.14, 0, 0, Math.min(H * 0.15, H - ht), R * 0.14, 0.6 * FL_CM, pm3, { seg: 6 });
        M.pop();
      }
      var orange = M.mat("fabric", s.bloom), blue = M.mat("fabric", "#3a5ab0");
      for (var bd = 0; bd < 3; bd++) {
        var bda = bd * 2.1 + 0.5, bz = H * (0.62 + bd * 0.08), bx = Math.cos(bda) * R * 0.2, by = Math.sin(bda) * R * 0.2;
        M.tube([0, 0, 0], [bx, by, bz], 0.8 * FL_CM, stalk, 4);
        M.push().move(bx, by, bz).turn(bda * 180 / Math.PI);
        M.ball(6 * FL_CM, 0, 0, 7 * FL_CM, 1.5 * FL_CM, 1.5 * FL_CM, stalk, { seg: 4 });
        M.ball(5 * FL_CM, 0, 4 * FL_CM, 1.6 * FL_CM, 4 * FL_CM, 5 * FL_CM, orange, { seg: 4 });
        M.ball(7 * FL_CM, 0, 2 * FL_CM, 4 * FL_CM, 1 * FL_CM, 1 * FL_CM, blue, { seg: 4 });
        M.pop();
      }
    }
    // flowers over it, and berries
    if (shape && s.bloom && s.f !== "rose" && s.f !== "spikes") {
      flBlooms(M, rnd, 0, 0, shape.z0, shape.z1, shape.R, s.bloomN || 30, s.bloom, s.bloomS || 3, s.flat ? "flat" : "");
    }
    if (shape && s.berry) {
      var berry = M.mat("plastic", s.berry);
      for (var y = 0; y < 26; y++) {
        var ya = rnd() * Math.PI * 2, yel = rnd() * 1.1, yr = shape.R * 0.96;
        M.ball(Math.cos(ya) * Math.cos(yel) * yr, Math.sin(ya) * Math.cos(yel) * yr, shape.z0 + (shape.z1 - shape.z0) * (0.3 + Math.sin(yel) * 0.6), 1.2 * FL_CM, 1.2 * FL_CM, 1.2 * FL_CM, berry, { seg: 3, lat0: -90, lat1: 90 });
      }
    }
  }
  function mix2(a, b, k) {
    var A = floraRgb(a), B = floraRgb(b);
    return "#" + [0, 1, 2].map(function (i) { return ("0" + Math.round(Math.max(0, Math.min(1, A[i] + (B[i] - A[i]) * k)) * 255).toString(16)).slice(-2); }).join("");
  }
  function floraRgb(c) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(c || ""));
    return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0.4, 0.55, 0.3];
  }
  // ---- flower beds ----
  // One flower: its stem from z0 up to its height, and its head of the kind asked.
  function flFlower(M, x, y, z0, tall, s, color, rnd, mats) {
    var stem = mats.stem, head = M.mat("fabric", color), size = (s.size || 2.5) * FL_CM, top = z0 + tall;
    var lean = s.droop ? 0.5 : 0.15, tx = x + (rnd() - 0.5) * tall * lean * 0.3, ty = y + (rnd() - 0.5) * tall * lean * 0.3;
    var kind = s.head === "wild" ? ["disc", "poppy", "bell", "pom"][Math.floor(rnd() * 4)] : s.head;
    M.tube([x, y, z0], [tx, ty, top], (s.big ? 1.6 : 0.35) * FL_CM, stem, s.big ? 5 : 3);
    if (s.big) {                          // a sunflower's big leaves up its stem
      for (var l = 0; l < 3; l++) {
        var la = rnd() * Math.PI * 2, lz = z0 + tall * (0.3 + l * 0.18);
        M.push().move(x + (tx - x) * (lz - z0) / tall, y + (ty - y) * (lz - z0) / tall, lz).turn(la * 180 / Math.PI).tiltY(-10);
        M.ball(9 * FL_CM, 0, 0, 10 * FL_CM, 7 * FL_CM, 0.5 * FL_CM, mats.leaf, { seg: 5 });
        M.pop();
      }
    }
    if (kind === "disc") {                // petals round a middle
      var petals = s.big ? 18 : 10, droop = s.droop ? -25 : -5;
      for (var p = 0; p < petals; p++) {
        var pa = p / petals * Math.PI * 2;
        M.push().move(tx, ty, top).turn(pa * 180 / Math.PI).tiltY(droop);
        M.quad(M.mat("fabric", color), [size * 0.2, -size * 0.18, 0], [size * 1.1, -size * 0.22, 0], [size * 1.1, size * 0.22, 0], [size * 0.2, size * 0.18, 0], [0, 0, 1]);
        M.pop();
      }
      M.ball(tx, ty, top + size * 0.12, size * (s.big ? 0.62 : 0.4), size * (s.big ? 0.62 : 0.4), size * (s.droop ? 0.45 : 0.22), M.mat("fabric", s.center || "#f2c94c"), { seg: 5, lat0: -90, lat1: 90 });
    } else if (kind === "cup") {          // a tulip: a cup of petals on its stem
      M.lathe(tx, ty, [[size * 0.35, top], [size * 0.95, top + size * 0.7], [size * 0.85, top + size * 1.7], [size * 0.55, top + size * 2.1]], head, { seg: 7, bottom: true });
    } else if (kind === "pom") {          // a ball of petals: a marigold, a peony, a dahlia, a geranium's head
      M.ball(tx, ty, top + size * 0.6, size, size, size * 0.8, head, { seg: 5, lat0: -90, lat1: 90 });
      M.ball(tx, ty, top + size * 1.1, size * 0.55, size * 0.55, size * 0.45, M.mat("fabric", mShade(color, 0.12)), { seg: 3, lat0: -90, lat1: 90 });
    } else if (kind === "spike") {        // little flowers up the top of the stem
      for (var k = 0; k < 4; k++) {
        var kz = top - size * 4 + k * size * 1.3;
        M.ball(tx, ty, kz, size * (1.1 - k * 0.14), size * (1.1 - k * 0.14), size * 0.9, head, { seg: 3, lat0: -90, lat1: 90 });
      }
    } else if (kind === "trumpet") {      // a lily, a petunia: a flared trumpet looking out
      M.push().move(tx, ty, top).turn(rnd() * 360).tiltY(-50);
      M.lathe(0, 0, [[size * 0.15, 0], [size * 0.35, size * 1.2], [size * 1.1, size * 2.0], [size * 1.25, size * 2.15]], head, { seg: 7 });
      M.pop();
    } else if (kind === "bell") {         // bells hanging down an arching stem
      var bells = s.spike ? 6 : 4;
      for (var b = 0; b < bells; b++) {
        var bz = top - b * size * (s.spike ? 3.0 : 1.9), ba = b * 2.3;
        var bx = tx + Math.cos(ba) * size * 0.9, by = ty + Math.sin(ba) * size * 0.9;
        M.lathe(bx, by, [[size * 0.85, bz - size * 1.4], [size * 0.5, bz - size * 0.4], [0, bz]], head, { seg: 5 });
      }
    } else if (kind === "rose") {
      M.ball(tx, ty, top + size * 0.6, size, size, size * 0.8, head, { seg: 5, lat0: -90, lat1: 90 });
      M.ball(tx, ty, top + size * 1.05, size * 0.55, size * 0.55, size * 0.5, M.mat("fabric", mShade(color, -0.15)), { seg: 3, lat0: -90, lat1: 90 });
      M.ball(tx, ty, top - size * 1.5, size * 1.6, size * 1.6, size * 1.0, mats.leaf, { seg: 4, lat0: -90, lat1: 90 });
    } else if (kind === "iris") {         // three falls drooping, three standards up
      for (var f = 0; f < 6; f++) {
        var fa = f / 6 * Math.PI * 2, up = f % 2 ? -60 : 35;
        M.push().move(tx, ty, top).turn(fa * 180 / Math.PI).tiltY(up);
        M.ball(size * 0.8, 0, 0, size * 0.85, size * 0.45, 0.4 * FL_CM, f % 2 ? head : M.mat("fabric", mShade(color, 0.15)), { seg: 3 });
        M.pop();
      }
      M.ball(tx, ty, top, size * 0.2, size * 0.2, size * 0.2, M.mat("fabric", "#f2c94c"), { seg: 3, lat0: -90, lat1: 90 });
    } else if (kind === "poppy") {        // an open bowl, its dark heart
      M.lathe(tx, ty, [[size * 0.2, top], [size * 1.0, top + size * 0.5], [size * 1.2, top + size * 0.9]], head, { seg: 7, bottom: true });
      M.ball(tx, ty, top + size * 0.35, size * 0.32, size * 0.32, size * 0.3, M.mat("fabric", s.center || "#1e1a1a"), { seg: 4, lat0: -90, lat1: 90 });
    } else if (kind === "pansy") {        // a flat face, two-toned
      M.ball(tx, ty, top, size, size, size * 0.18, head, { seg: 5, lat0: -90, lat1: 90 });
      M.ball(tx, ty, top + size * 0.12, size * 0.45, size * 0.45, size * 0.1, M.mat("fabric", "#2a1a3a"), { seg: 3, lat0: -90, lat1: 90 });
    }
  }
  function flBed(M, W, D, H, C, n, s) {
    var C2 = mPick(C, "#e46b6b", "#8a6240"), rnd = mRand(flSeed(n, s.key)), edge = M.mat("wood", C2.frame), t = 3 * FL_CM, h = Math.max(H, 12 * FL_CM);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + t, 0, h, edge);
    M.box(-W / 2, W / 2, D / 2 - t, D / 2, 0, h, edge);
    M.box(-W / 2, -W / 2 + t, -D / 2, D / 2, 0, h, edge);
    M.box(W / 2 - t, W / 2, -D / 2, D / 2, 0, h, edge);
    var soil = h - 3 * FL_CM, ground = s.head === "rock" ? M.mat("stone", "#b8b0a2") : M.mat("soil", "#4b3a2b");
    M.box(-W / 2 + t, W / 2 - t, -D / 2 + t, D / 2 - t, 0, soil, ground);
    var mats = { stem: M.mat("leaves", mShade(s.leaf, -0.08)), leaf: M.mat("leaves", s.leaf) };
    var iw = W - 2 * t - 6 * FL_CM, id = D - 2 * t - 6 * FL_CM;
    if (iw < 4 * FL_CM || id < 4 * FL_CM) { return; }
    if (s.head === "veg") {               // rows: lettuces, cabbages, a row of tomatoes on their canes, carrot tops
      var rows = Math.max(1, Math.round(id / (25 * FL_CM)));
      for (var r = 0; r < rows; r++) {
        var ry = -id / 2 + (r + 0.5) * id / rows, crop = r % 4;
        for (var x = -iw / 2 + 10 * FL_CM; x < iw / 2 - 5 * FL_CM; x += crop === 2 ? 30 * FL_CM : 18 * FL_CM) {
          if (crop === 0) { flClump(M, x, ry, soil + 6 * FL_CM, 8 * FL_CM, 0.7, M.mat("leaves", "#8ac05a"), x); }
          else if (crop === 1) { M.ball(x, ry, soil + 8 * FL_CM, 10 * FL_CM, 10 * FL_CM, 8 * FL_CM, M.mat("leaves", "#7aa0a0"), { seg: 6, lat0: -90, lat1: 90 }); }
          else if (crop === 2) {
            M.cyl(x, ry, soil, soil + 90 * FL_CM, 0.8 * FL_CM, M.mat("wood", "#a8865a"), { seg: 4 });
            flClump(M, x, ry, soil + 50 * FL_CM, 14 * FL_CM, 2.2, M.mat("leaves", "#4f8a3c"), x * 0.3);
            for (var tm = 0; tm < 5; tm++) { M.ball(x + (rnd() - 0.5) * 16 * FL_CM, ry + (rnd() - 0.5) * 16 * FL_CM, soil + (25 + rnd() * 50) * FL_CM, 3 * FL_CM, 3 * FL_CM, 3 * FL_CM, M.mat("plastic", "#d8352a"), { seg: 4, lat0: -90, lat1: 90 }); }
          } else {
            for (var cb = 0; cb < 5; cb++) { M.tube([x, ry, soil], [x + (rnd() - 0.5) * 8 * FL_CM, ry + (rnd() - 0.5) * 8 * FL_CM, soil + 18 * FL_CM], 0.4 * FL_CM, M.mat("leaves", "#5f9a45"), 3); }
          }
        }
      }
      return;
    }
    if (s.head === "rock") {              // a rock garden: stones, and rosettes between them
      for (var st = 0; st < 6; st++) {
        var sx = (rnd() - 0.5) * iw, sy = (rnd() - 0.5) * id, sr = (6 + rnd() * 8) * FL_CM;
        M.ball(sx, sy, soil, sr, sr * 0.8, sr * 0.55, M.mat("stone", rnd() < 0.5 ? "#a8a094" : "#8f887e"), { seg: 5, lat0: -90, lat1: 90 });
      }
      var sc = ["#7aa08a", "#9ab08a", "#a87a9a", "#7a8fa8"];
      for (var g = 0; g < 10; g++) {
        var gx = (rnd() - 0.5) * iw * 0.9, gy = (rnd() - 0.5) * id * 0.9, gm = M.mat("leaves", sc[g % 4]);
        for (var p = 0; p < 7; p++) {
          M.push().move(gx, gy, soil).turn(p / 7 * 360).tiltY(-30);
          M.ball(3 * FL_CM, 0, 0, 3 * FL_CM, 1.4 * FL_CM, 0.8 * FL_CM, gm, { seg: 4 });
          M.pop();
        }
      }
      return;
    }
    // flowers in rows, staggered, as close as each grows -- but no more than about ninety to a bed
    // (thirty sunflowers), further apart in a big one: planted 8 cm apart however big the bed,
    // a bed of lavender was 200,000 corners, and took the page half a second to make (2026-10-06)
    var gap = Math.max(8, (s.size || 2.5) * (s.big ? 3 : s.dense ? 3.2 : 4.6)) * FL_CM;
    gap = Math.max(gap, Math.sqrt(iw * id / (s.big ? 30 : 90)));
    var cols = s.cols || ["#e46b6b"];
    for (var yy = -id / 2 + gap / 2, row = 0; yy <= id / 2 - gap * 0.3; yy += gap, row++) {
      for (var xx = -iw / 2 + gap / 2 + (row % 2) * gap / 2; xx <= iw / 2 - gap * 0.3; xx += gap) {
        var fx = xx + (rnd() - 0.5) * gap * 0.3, fy = yy + (rnd() - 0.5) * gap * 0.3;
        var tall = ((s.stem || [0.3, 0.4])[0] + rnd() * ((s.stem || [0.3, 0.4])[1] - (s.stem || [0.3, 0.4])[0])) * FLOOR_PX;
        // leaves at its foot: two broad blades, a tuft, or swords
        if (s.leaves === "blade" || s.leaves === "sword") {
          for (var lb = 0; lb < 2; lb++) {
            var la2 = rnd() * Math.PI * 2;
            M.push().move(fx, fy, soil).turn(la2 * 180 / Math.PI).tiltY(s.leaves === "sword" ? -75 : -55);
            M.ball(tall * (s.leaves === "sword" ? 0.35 : 0.2), 0, 0, tall * (s.leaves === "sword" ? 0.35 : 0.2), (s.leaves === "sword" ? 1.2 : 2.2) * FL_CM, 0.4 * FL_CM, mats.leaf, { seg: 3 });
            M.pop();
          }
        } else if (!s.big) {
          M.ball(fx, fy, soil + 2 * FL_CM, Math.min(gap * 0.38, 9 * FL_CM), Math.min(gap * 0.38, 9 * FL_CM), Math.min(tall * 0.3, 5 * FL_CM), mats.leaf, { seg: 4, lat0: -90, lat1: 90 });
        }
        flFlower(M, fx, fy, soil, tall, s, cols[Math.floor(rnd() * cols.length)], rnd, mats);
      }
    }
  }
  // ---- hedges ----
  function flHedge(M, W, D, H, C, n, s) {
    var C2 = mPick(C, s.leaf), rnd = mRand(flSeed(n, s.key)), leaf = M.mat("leaves", C2.main);
    if (s.f === "boxhedge") {             // clipped low and square
      M.box(-W / 2 + 1 * FL_CM, W / 2 - 1 * FL_CM, -D / 2, D / 2, 0, H, leaf, Math.min(D, H) * 0.18);
      return;
    }
    if (s.f === "cones") {                // a row of arborvitae, shoulder to shoulder
      var count = Math.max(1, Math.round(W / (D * 0.9))), step = W / count;
      for (var k = 0; k < count; k++) {
        var x = -W / 2 + step * (k + 0.5), r = Math.min(step, D) * 0.55;
        M.lathe(x, 0, [[r * 0.7, 0], [r, H * 0.25], [r * 0.85, H * 0.65], [r * 0.25, H * 0.96], [0, H]], k % 2 ? leaf : M.mat("leaves", mShade(C2.main, 0.08)), { seg: 10 });
      }
      return;
    }
    var bumps = Math.max(2, Math.round(W / (D * 0.8)));
    M.box(-W / 2 + D * 0.3, W / 2 - D * 0.3, -D * 0.35, D * 0.35, 0, H * 0.85, leaf, D * 0.3);
    for (var b = 0; b < bumps; b++) {
      var bx = -W / 2 + D * 0.5 + b * (W - D) / Math.max(1, bumps - 1);
      M.ball(bx, (rnd() - 0.5) * D * 0.1, H * 0.62, D * 0.55, D * 0.52, H * 0.38, M.mat("leaves", mShade(C2.main, (rnd() - 0.5) * 0.2)), { seg: 6 });
    }
    var dots = s.berry || s.bloom;
    if (dots) {
      var mat = M.mat(s.berry ? "plastic" : "fabric", dots), n2 = Math.round(W / FL_CM / 6);
      for (var d = 0; d < n2; d++) {
        var side = rnd() < 0.5 ? -1 : 1;
        M.ball((rnd() - 0.5) * (W - D * 0.6), side * D * 0.5, H * (0.25 + rnd() * 0.6), (s.berry ? 1.2 : 2.6) * FL_CM, (s.berry ? 1.2 : 2.6) * FL_CM, (s.berry ? 1.2 : 1.6) * FL_CM, mat, { seg: 3, lat0: -90, lat1: 90 });
      }
    }
  }
  // Each piece made as its kind -- the kinds made before this keep the
  // makers they had (38-models.js, 40-things3d.js, 40-foliage.js).
  [["i_tree", flTree], ["i_shrub", flShrub], ["i_flowerbed", flBed], ["i_hedge", flHedge]].forEach(function (pair) {
    var kind = pair[0], make = pair[1], before = typeof MODELS === "object" ? MODELS[kind] : null;
    if (!before || typeof mDef !== "function") { return; }
    mDef(kind, function (M, W, D, H, C, n) {
      var s = n && n.sp && FLORA[n.sp];
      if (!s || s.kind !== kind || s.f === "old") { return before.apply(this, arguments); }
      return make(M, W, D, H, C, n, s);
    });
  });

  // ---- where in the world --------------------------------------------------------------------------
  // The house's style says where it is (39-styles.js): its own trees grow
  // round it most -- and those of the lands next to it -- the rest less.
  var FLORA_STYLE_AT = { japanese: "japan", chinese: "china", hanok: "korea", thai: "seasia", balinese: "seasia", haveli: "india",
                         provencal: "med", tuscan: "med", cycladic: "med", mediterranean: "med", mission: "sw", pueblo: "sw",
                         nordic: "nordic", izba: "nordic", scandi: "nordic", chalet: "alpine", tudor: "uk", georgian: "uk",
                         cottage: "uk", sahel: "africa", rondavel: "africa", riad: "mideast", arabian: "mideast",
                         queenslander: "aus", nzvilla: "nz", brazil: "brazil", french: "eu", dutch: "eu", haussmann: "eu", bistro: "eu" };
  var FLORA_AT = { americas: "na", europe: "eu", asia: "china", mideast: "mideast", oceania: "aus" };
  var FLORA_NEAR = { na: ["sw"], sw: ["na", "mideast"], eu: ["uk", "med", "alpine", "nordic"], uk: ["eu"], nordic: ["eu", "alpine"],
                     alpine: ["eu", "nordic"], med: ["eu", "mideast"], mideast: ["med", "africa"], africa: ["mideast"],
                     india: ["seasia"], seasia: ["india", "china"], china: ["japan", "korea"], japan: ["china", "korea"],
                     korea: ["china", "japan"], aus: ["nz"], nz: ["aus", "uk"], brazil: [] };
  function floraRegion() {
    var k = typeof houseOpt === "function" ? houseOpt("style") : "", S = typeof HOUSE_STYLES === "object" ? HOUSE_STYLES[k] : null;
    return FLORA_STYLE_AT[k] || (S && FLORA_AT[S.at]) || "";
  }
  function floraScapes() {
    if (typeof worldScapes === "function") { return worldScapes(); }
    return [typeof worldScape === "function" ? worldScape() : "plains"];
  }
  // How much at home a kind is where the house is: 3 in its own lands, 1 next
  // door (or a kind that grows anywhere), a quarter elsewhere.
  function floraHome(s, region) {
    if (!s.r.length) { return 1; }
    if (!region) { return 0.6; }
    if (s.r.indexOf(region) >= 0) { return 3; }
    return (FLORA_NEAR[region] || []).some(function (r) { return s.r.indexOf(r) >= 0; }) ? 1 : 0.25;
  }
  // How well each kind of a piece grows here: its landscapes', the first one's in full.
  function floraWeights(kind, scapes, region) {
    var out = {};
    FLORA_ORDER.forEach(function (k) {
      var s = FLORA[k], z = 0;
      if (s.kind !== kind) { return; }
      scapes.forEach(function (sc, i) { z += (s.z[sc] || 0) * (i ? 0.75 : 1); });
      if (z > 0) { out[k] = z * floraHome(s, region); }
    });
    return out;
  }
  // (a house of no style of any land: whatever grows in its landscape -- not only the kinds
  // that are at home everywhere, which was two trees)
  function floraGrowsHere(s) {
    var region = floraRegion();
    return floraScapes().some(function (sc) { return (s.z[sc] || 0) > 0; }) && (!region || floraHome(s, region) >= 1);
  }

  // ---- the land's own planting --------------------------------------------------------------------
  // What the scenery grows (WORLD_LOOK[..].grow, 40-plants.js): the kinds
  // it always had, and as much again of the rest that grow there, shared
  // out by how well each does -- trees by trees, shrubs by shrubs, beds of
  // flowers where it had wildflowers.
  var FLORA_LOW = { bush: 1, flowering: 1, box: 1, agave: 1, fern: 1, dry: 1, grass: 1 };
  var floraGrowKept = {};
  function floraGrow(base, scapes, region) {
    var key = scapes.join("+") + "|" + region, kept = floraGrowKept[key];
    if (kept && kept.base === base) { return kept.out; }
    var out = Object.assign({}, base || {}), trees = 0, low = 0, beds = (base && base.flowers) || 0;
    Object.keys(out).forEach(function (k) {
      if (FLORA[k] && FLORA[k].kind === "i_tree") { trees += out[k]; } else if (FLORA_LOW[k]) { low += out[k]; }
    });
    [["i_tree", trees * 0.9], ["i_shrub", low * 0.5], ["i_flowerbed", beds * 0.8]].forEach(function (p) {
      if (!(p[1] > 0)) { return; }
      var w = floraWeights(p[0], scapes, region), sum = 0;
      // (a bed of vegetables, or of stones, is not something the land grows wild)
      Object.keys(w).forEach(function (k) {
        if (out[k] !== undefined || k === FLORA_KINDS[p[0]] || FLORA[k].head === "veg" || FLORA[k].head === "rock") { delete w[k]; } else { sum += w[k]; }
      });
      Object.keys(w).forEach(function (k) { out[k] = Math.round(w[k] / sum * p[1] * 1000) / 1000; });
    });
    // (each sort -- trees, what grows low, flowers -- as much of the land as it was, its new kinds
    // taking their share of it, not added on top: the trees grew by nine tenths over the grass and
    // the stones, and a beach's scenery to two and a half times as many corners, 2026-10-06)
    function sortOf(k) { return FLORA[k] && FLORA[k].kind === "i_tree" ? "t" : FLORA_LOW[k] || (FLORA[k] && FLORA[k].kind === "i_shrub") ? "l" : k === "flowers" || (FLORA[k] && FLORA[k].kind === "i_flowerbed") ? "f" : ""; }
    var was = { t: trees, l: low, f: beds }, now = { t: 0, l: 0, f: 0 };
    Object.keys(out).forEach(function (k) { var so = sortOf(k); if (so) { now[so] += out[k]; } });
    Object.keys(out).forEach(function (k) {
      var so = sortOf(k);
      if (so && now[so] > 0 && was[so] > 0) { out[k] = Math.round(out[k] * was[so] / now[so] * 1000) / 1000; }
    });
    floraGrowKept[key] = { base: base, out: out };
    return out;
  }
  if (typeof worldLook === "function") {
    var worldLookFlora = worldLook;
    worldLook = function () {
      var look = worldLookFlora.apply(this, arguments);
      if (!look || !look.grow) { return look; }
      var grow = floraGrow(look.grow, floraScapes(), floraRegion());
      if (look.floraOf === look.grow && look.flora === grow) { return look.floraLook; }
      var out = Object.assign({}, look, { grow: grow });
      look.floraOf = look.grow; look.flora = grow; look.floraLook = out;
      return out;
    };
  }
  // A yard's shade trees, and what is planted along the front of the house
  // (40-plants.js, 40-edit3d.js): the land's own, and the most at home here.
  var floraYardKept = {};
  function floraYard(scape, kind, base) {
    var region = floraRegion(), key = scape + "|" + kind + "|" + region;
    if (floraYardKept[key]) { return floraYardKept[key]; }
    var w = floraWeights(kind, [scape], region), keys = Object.keys(w).filter(function (k) { return base.indexOf(k) < 0 && FLORA[k].f !== "old"; });
    keys.sort(function (a, b) { return w[b] - w[a] || FLORA_ORDER.indexOf(a) - FLORA_ORDER.indexOf(b); });
    keys = keys.slice(0, kind === "i_tree" ? 8 : 7);
    var top = keys.length ? w[keys[0]] : 1, out = base.slice();
    keys.forEach(function (k) { for (var i = 0; i < Math.max(1, Math.round(w[k] / top * 2)); i++) { out.push(k); } });
    floraYardKept[key] = out;
    return out;
  }
  if (typeof PLANT_YARD === "object") {
    Object.keys(PLANT_YARD).forEach(function (sc) {
      var y = PLANT_YARD[sc], big0 = (y.big || []).slice(), low0 = (y.low || []).slice();
      Object.defineProperty(y, "big", { configurable: true, enumerable: true, get: function () { return floraYard(sc, "i_tree", big0); } });
      Object.defineProperty(y, "low", { configurable: true, enumerable: true, get: function () { return low0.length ? floraYard(sc, "i_shrub", low0) : low0; } });
    });
  }
  // A landscaped garden's trees (40-site.js), by its kind of garden -- what
  // of them grows here, or else what it always had.
  var FLORA_GARDEN = {
    formal: ["linden", "plane", "maple", "beech", "copperbeech", "magnolia", "yew"],
    cottage: ["apple", "cherry", "crabapple", "pear", "birch", "magnolia", "dogwood"],
    modern: ["birch", "ginkgo", "aspen", "jmaple", "crapemyrtle", "arborvitae", "olive"],
    mixed: ["maple", "oak", "redmaple", "ash", "elm", "broad", "linden"],
    xeric: ["paloverde", "mesquite", "datepalm", "fanpalm", "olive", "joshua", "acacia"],
    med: ["cypress", "olive", "stonepine", "orange", "lemon", "fig", "fanpalm"],
    zen: ["jmaple", "cherry", "pine", "ginkgo", "weepingcherry", "bamboo"],
    tropical: ["palm", "royalpalm", "frangipani", "flametree", "banana", "mango", "jacaranda"],
    woodland: ["spruce", "birch", "fir", "hemlock", "larch", "aspen", "scotspine"]
  };
  if (typeof LW_PLANT === "object") {
    Object.keys(LW_PLANT).forEach(function (g) {
      var P0 = LW_PLANT[g], old = (P0.trees || []).slice(), want = FLORA_GARDEN[g];
      if (!want) { return; }
      Object.defineProperty(P0, "trees", { configurable: true, enumerable: true, get: function () {
        var sc = floraScapes(), region = floraRegion();
        var fit = want.filter(function (k) { var s = FLORA[k]; return s && (sc.some(function (x) { return (s.z[x] || 0) > 0; }) || floraHome(s, region) >= 3); });
        return fit.length >= 2 ? fit : old;
      } });
    });
  }
  // The scenery is made again when the house's part of the world changes.
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyFlora = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyFlora.apply(this, arguments) + "|fl" + floraRegion(); };
  }

  // ---- in the scenery -----------------------------------------------------------------------------
  // The land draws thousands of plants, not models: each new kind is made
  // as the land's nearest one is (40-plants.js, 39-world.js), stretched to
  // its own height and spread, in its own leaves, bark and flowers, and
  // stood whole on the ground where it grows.
  var FLORA_LIKE = { vase: "oak", spread: "oak", weeping: "willow", olive: "oak", euca: "maple", layered: "maple", multi: "maple",
                     candle: "joshua", baobab: "oak", cone: "spruce", column: "cypress", cedar: "spruce", pine: "pine", palm: "palm",
                     fern: "palm", bamboo: "bamboo", mound: "box", bloom: "flowering", low: "bush", upright: "bush", rose: "flowering",
                     spikes: "flowering", topball: "box", topcone: "box", topspiral: "box", minipine: "bush", rosette: "agave",
                     succulents: "agave", grass: "grass", hosta: "fern", paddle: "fern", bed: "flowers" };
  var FLORA_WORLD_OWN = { broad: 1, fir: 1, birch: 1, palm: 1, cactus: 1, rock: 1, bush: 1, dune: 1, dry: 1 };
  function floraLike(s) {
    if (s.kind === "i_tree" && s.f === "round") { return s.w / s.h > 0.75 ? "oak" : "maple"; }
    return FLORA_LIKE[s.f] || (s.kind === "i_tree" ? "broad" : "bush");
  }
  function floraLum(r, g, b) { return 0.3 * r + 0.59 * g + 0.11 * b; }
  var FLORA_MIDS = [[0.96, 0.78, 0.22], [0.45, 0.28, 0.12]];       // a flower's middle (40-foliage.js): kept
  function floraScenery(v, s, at, rnd, sheetC, plant) {
    var P = FLOOR_PX, tmp = [], T = terrScene && typeof TERR === "object" && TERR && TERR.mesh ? TERR : null, was = terrScene;
    terrScene = false;                    // (made flat, then lifted whole: not each corner on its own)
    try { plant(tmp, floraLike(s), at, rnd, sheetC); } finally { terrScene = was; }
    if (!tmp.length) { return; }
    var i, zTop = 0, reach = 0, anyLeaf = false, lumL = 0, nL = 0, lumB = 0, nB = 0, leafP = PAT.leaves, barkP = PAT.bark;
    for (i = 0; i < tmp.length; i += 13) { if (tmp[i + 12] === leafP) { anyLeaf = true; break; } }
    for (i = 0; i < tmp.length; i += 13) {
      var lum = floraLum(tmp[i + 6], tmp[i + 7], tmp[i + 8]);
      zTop = Math.max(zTop, tmp[i + 2]);
      if (!anyLeaf || tmp[i + 12] === leafP) { reach = Math.max(reach, Math.hypot(tmp[i] - at[0], tmp[i + 1] - at[1])); }
      if (tmp[i + 12] === leafP) { lumL += lum; nL++; } else if (tmp[i + 12] === barkP) { lumB += lum; nB++; }
    }
    if (zTop <= 0) { return; }
    var grow = 0.85 + rnd() * 0.3, bed = s.kind === "i_flowerbed";
    var kz = Math.max(0.15, Math.min(5, s.h * P * grow / zTop));
    var kxy = bed || !(reach > 0) ? 1 : Math.max(0.25, Math.min(4, s.w * P * grow / 2 / reach));
    var lift = T ? terrMeshAt(T, at[0], at[1]) : 0, snow = typeof gl3SnowNow === "number" ? gl3SnowNow : 0;
    var leaf = gl3Mix(floraRgb(s.leaf), sheetC, 0.08), bark = gl3Mix(floraRgb(s.bark), sheetC, 0.08);
    var bloom = s.bloom ? gl3Mix(floraRgb(s.bloom), sheetC, 0.05) : null, cols = s.cols ? s.cols.map(function (c) { return gl3Mix(floraRgb(c), sheetC, 0.05); }) : null;
    var avgL = nL ? lumL / nL : 1, avgB = nB ? lumB / nB : 1, tone = 0.94 + rnd() * 0.12, petal = false, petalC = null;
    function white(c, k) { return snow ? gl3Mix(c, [0.93, 0.95, 0.98], k * snow) : c; }
    var leafAt = [];
    for (i = 0; i < tmp.length; i += 39) {          // three corners at a time: a face's color is the face's
      for (var j = i; j < i + 39 && j < tmp.length; j += 13) {
        var pat = tmp[j + 12], c = [tmp[j + 6], tmp[j + 7], tmp[j + 8]], k;
        if (pat === leafP) {
          k = floraLum(c[0], c[1], c[2]) / avgL * tone;
          c = white([Math.min(1, leaf[0] * k), Math.min(1, leaf[1] * k), Math.min(1, leaf[2] * k)], 0.5);
        } else if (pat === barkP) {
          k = floraLum(c[0], c[1], c[2]) / avgB;
          c = white([Math.min(1, bark[0] * k), Math.min(1, bark[1] * k), Math.min(1, bark[2] * k)], 0.3);
        } else if ((bloom || cols) && pat === PAT.plain && !FLORA_MIDS.some(function (m) { return Math.abs(m[0] - c[0]) + Math.abs(m[1] - c[1]) + Math.abs(m[2] - c[2]) < 0.02; })) {
          if (j === i && !petal) { petalC = cols ? cols[Math.floor(rnd() * cols.length)] : bloom; }
          var lk = floraLum(c[0], c[1], c[2]) > 0.75 ? 0.12 : 0;
          c = lk ? gl3Mix(petalC, [1, 1, 1], lk) : petalC;
        }
        var nx = tmp[j + 3] / kxy, ny = tmp[j + 4] / kxy, nz = tmp[j + 5] / kz, nl = Math.hypot(nx, ny, nz) || 1;
        var p = [at[0] + (tmp[j] - at[0]) * kxy, at[1] + (tmp[j + 1] - at[1]) * kxy, tmp[j + 2] * kz + lift];
        gl3Vert(v, p, [nx / nl, ny / nl, nz / nl], c, tmp[j + 9], [tmp[j + 10], tmp[j + 11]], pat);
        if (pat === leafP && nz / nl > -0.2 && (j - i) === 0) { leafAt.push([p, [nx / nl, ny / nl, nz / nl]]); }
      }
      var wasPetal = tmp[i + 12] === PAT.plain;
      petal = wasPetal && !!petalC;
    }
    // a tree's flowers and fruit, out on its leaves
    if (s.kind === "i_tree" && leafAt.length && (s.bloom || s.fruit) && typeof foliageBloom === "function") {
      var count = Math.round(s.bloom ? (s.bloomN || 40) * 0.6 : 14), size = (s.bloom ? 0.09 : 0.06) * P * Math.sqrt(kxy);
      terrScene = false;                  // (lifted already, with the tree)
      try {
        for (var b = 0; b < count; b++) {
          var o = leafAt[Math.floor(rnd() * leafAt.length)], nn = o[1];
          foliageBloom(v, [o[0][0] + nn[0] * 0.04 * P, o[0][1] + nn[1] * 0.04 * P, o[0][2] + nn[2] * 0.04 * P], size, nn,
                       white(s.bloom ? bloom : gl3Mix(floraRgb(s.fruit), sheetC, 0.05), 0.3), rnd);
        }
      } finally { terrScene = was; }
    }
  }
  if (typeof worldPlant === "function") {
    var worldPlantFlora = worldPlant;
    worldPlant = function (v, kind, at, rnd, sheetC) {
      var s = FLORA[kind];
      if (!s || FLORA_WORLD_OWN[kind] || (typeof PLANT_KINDS === "object" && PLANT_KINDS[kind])) { return worldPlantFlora.apply(this, arguments); }
      return floraScenery(v, s, at, rnd, sheetC, worldPlantFlora);
    };
  }

  // ---- picked for a piece --------------------------------------------------------------------------
  // A tree as tall and as wide as its kind grows, a shrub as wide, a hedge as
  // high; its name under it on the paper, if it still had the plain one.
  function floraPut(n, key) {
    var s = FLORA[key];
    if (!s || s.kind !== n.kind) { return; }
    var plain = !n.text || n.text === kindName(n.kind) || FLORA_ORDER.some(function (k) { return floraName(k) === n.text; });
    if (key === FLORA_KINDS[n.kind]) { delete n.sp; } else { n.sp = key; }
    var P = FLOOR_PX;
    if (n.kind === "i_tree") {
      n.tall = s.h; n.crown = s.w;
      var size = Math.round(Math.max(20, Math.min(140, s.w / 3.6 * 48)));
      n.w = size; n.h = size;
      if (plain && n.text) { n.text = key === FLORA_KINDS.i_tree ? kindName("i_tree") : floraName(key); }
    } else if (n.kind === "i_shrub") {
      n.tall = s.h;
      n.w = Math.max(16, Math.round(s.w * P)); n.h = n.w;
    } else if (n.kind === "i_hedge") {
      n.tall = s.h;
    }
    if (n.kind !== "i_tree" && plain && n.text) { n.text = floraName(key); }
  }
  // The kinds, in the panel: a tile for each, under the group picked --
  // and first, what grows where the house is.
  var floraGroupAt = {};
  function floraSection(box, n) {
    if (!FLORA_KINDS[n.kind]) { return; }
    var sec = document.createElement("div");
    sec.className = "dz-fin dz-design dz-flora";
    function set(key) {
      keepUndo();
      floraPut(n, key);
      if (typeof handKeep === "function") { handKeep(); }
      if (V3) { V3.dirty = true; }
      try { drawHand(); } catch (e) { /* the paper later */ }
      if (typeof drawHandPanel === "function") { drawHandPanel(); } else { draw(); }
    }
    function draw() {
      var now = floraOf(n), keys = FLORA_ORDER.filter(function (k) { return FLORA[k].kind === n.kind; });
      var here = keys.filter(function (k) { return floraGrowsHere(FLORA[k]); });
      var groups = (here.length ? ["here"] : []).concat(FLORA_GROUPS[n.kind]);
      var g = floraGroupAt[n.kind];
      if (groups.indexOf(g) < 0) { g = groups.length > 1 && now.key !== FLORA_KINDS[n.kind] ? now.g : groups[0]; }
      sec.innerHTML = '<div class="dz-fin-head"><span class="dz-small dz-sub-head"></span><span class="dz-design-n"></span></div>';
      sec.querySelector(".dz-sub-head").textContent = TXT["spc_head_" + n.kind] || TXT.spc_head;
      sec.querySelector(".dz-design-n").textContent = say("spc_count", { n: keys.length });
      if (groups.length > 1) {
        var row = document.createElement("div");
        row.className = "dz-flora-groups";
        groups.forEach(function (key) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "dz-fgroup" + (key === g ? " on" : "");
          b.setAttribute("aria-pressed", key === g ? "true" : "false");
          b.textContent = TXT["spg_" + key] || key;
          b.onclick = function () { floraGroupAt[n.kind] = key; draw(); };
          row.appendChild(b);
        });
        sec.appendChild(row);
      }
      var grid = document.createElement("div");
      grid.className = "dz-design-grid";
      (g === "here" ? here : keys.filter(function (k) { return FLORA[k].g === g; })).forEach(function (k) {
        var b = document.createElement("button"), on = k === now.key;
        b.type = "button";
        b.className = "dz-dtile" + (on ? " on" : "");
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.innerHTML = floraTile(FLORA[k]) + "<span></span>";
        b.lastChild.textContent = floraName(k);
        b.title = floraName(k);
        b.onclick = function () { set(k); };
        grid.appendChild(b);
      });
      sec.appendChild(grid);
    }
    draw();
    box.appendChild(sec);
  }
  if (typeof finishSection === "function") {
    var finishSectionFlora = finishSection;
    finishSection = function (box, n) {
      try { if (n && FLORA_KINDS[n.kind]) { floraSection(box, n); } } catch (e) { /* the finish alone */ }
      return finishSectionFlora.apply(this, arguments);
    };
  }
  // A tile's picture: the kind in its own colors, small.
  function floraTile(s) {
    var L = s.leaf, B = s.bark || "#6b4a32", F = s.bloom || s.fruit || s.berry, dk = mShade(L, -0.25), out = "", i;
    function dots(list, c, r) { return list.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r || 1.3) + '" fill="' + c + '"/>'; }).join(""); }
    var art = floraArtKey(s);
    if (s.kind === "i_tree") {
      if (art === "cone") {
        out = '<rect x="19" y="21" width="2" height="6" fill="' + B + '"/><path d="M20 1 L27 9 H24 L30 16 H26.5 L33 23 H7 L13.5 16 H10 L16 9 H13 Z" fill="' + L + '"/>' +
              '<path d="M20 1 L27 9 H24 L30 16 H26.5 L33 23 H20 Z" fill="' + dk + '" opacity=".35"/>';
      } else if (art === "column") {
        out = '<rect x="19" y="22" width="2" height="5" fill="' + B + '"/><ellipse cx="20" cy="12.5" rx="5" ry="11" fill="' + L + '"/><path d="M20 1.5 A5 11 0 0 1 20 23.5 Z" fill="' + dk + '" opacity=".35"/>';
      } else if (art === "palm") {
        out = '<path d="M19 27 C19.5 20 21 14 23.5 8 H25 C23 14 21.6 20 21.4 27 Z" fill="' + B + '"/>' +
              '<g fill="none" stroke="' + L + '" stroke-width="2.2" stroke-linecap="round"><path d="M24 8 C19 3 12 4 8 9"/><path d="M24 8 C29 3 35 4 38 9"/>' +
              '<path d="M24 8 C18 9 14 12 12 17"/><path d="M24 8 C30 9 34 12 36 17"/><path d="M24 8 C24 4 26 2 29 1"/></g>';
      } else if (art === "weeping") {
        out = '<rect x="19" y="14" width="2.2" height="13" fill="' + B + '"/><path d="M5 22 C5 9 12 3 20 3 C28 3 35 9 35 22 C33 20 31 24 29 21 C27 24 25 21 23 24 C21 21 19 24 17 21 C15 24 13 20 11 23 C9 20 7 24 5 22 Z" fill="' + L + '"/>' +
              '<g stroke="' + dk + '" stroke-width="1" fill="none"><path d="M11 9 C9 14 9 18 10 22M16 6 C14 12 14 17 15 22M24 6 C26 12 26 17 25 22M29 9 C31 14 31 18 30 22"/></g>';
      } else if (art === "spread") {
        out = '<path d="M19 27 L19.5 18 L14 13 H16 L20 16.5 L24 13 H26 L21 18 L21.4 27 Z" fill="' + B + '"/><path d="M3 12 C3 8 8 5 13 6 C16 2 24 2 27 6 C32 5 37 8 37 12 C37 14.5 34 15 32 14 H8 C6 15 3 14.5 3 12 Z" fill="' + L + '"/>';
      } else if (art === "cactus") {
        out = '<path d="M17.5 27 V5 C17.5 2 22.5 2 22.5 5 V27 Z M17.5 17 H13 C11.5 17 11 16 11 15 V9 C11 7.5 14 7.5 14 9 V14 H17.5 Z M22.5 13 H26 V7 C26 5.5 29 5.5 29 7 V14.5 C29 15.5 28.5 16 27 16 H22.5 Z" fill="' + L + '"/>';
      } else if (art === "bamboo") {
        out = '<g fill="' + B + '"><rect x="13" y="6" width="2.6" height="21" rx="1"/><rect x="18.7" y="2" width="2.6" height="25" rx="1"/><rect x="24.4" y="8" width="2.6" height="19" rx="1"/></g>' +
              '<g fill="' + L + '"><path d="M15.6 9 C19 7 22 8 24 5 C21 10 18 10 15.6 9 Z"/><path d="M21.3 5 C17 3 14 4 11 2 C14 6 18 7 21.3 5 Z"/><path d="M27 12 C30 10 33 11 35 8 C32 13 29 13 27 12 Z"/></g>';
      } else if (art === "candle") {
        out = '<path d="M19 27 V16 L13 10 L14.4 8.8 L19.6 13.6 V6 H21 V14 L25.6 9 L27 10.2 L21.4 16.4 V27 Z" fill="' + B + '"/><g fill="' + L + '"><circle cx="13.6" cy="8" r="4.2"/><circle cx="20.3" cy="5" r="4.2"/><circle cx="26.6" cy="8.6" r="4.2"/></g>';
      } else if (art === "baobab") {
        out = '<path d="M14 27 C13 20 15 15 18 12 H22 C25 15 27 20 26 27 Z" fill="' + B + '"/><path d="M8 11 C8 7 14 6 20 6.6 C26 6 32 7 32 11 C32 13 29 13.5 27 13 H13 C11 13.5 8 13 8 11 Z" fill="' + L + '"/>';
      } else {
        out = '<path d="M18.8 27 L19.2 17 H20.8 L21.2 27 Z" fill="' + B + '"/><path d="M20 2 C25 2 28.5 5 28.5 8.5 C31.5 9.6 32.4 14 29.6 16.4 C29.6 20 25.4 21.6 21.8 20.4 H18.2 C14.6 21.6 10.4 20 10.4 16.4 C7.6 14 8.5 9.6 11.5 8.5 C11.5 5 15 2 20 2 Z" fill="' + L + '"/>' +
              '<path d="M20 2 C25 2 28.5 5 28.5 8.5 C31.5 9.6 32.4 14 29.6 16.4 C29.6 20 25.4 21.6 21.8 20.4 H20 Z" fill="' + dk + '" opacity=".3"/>';
      }
      if (F && art !== "cactus") { out += dots([[14, 8], [24, 6], [27, 13], [16, 15], [21, 11], [12, 12.5], [25, 17.5]], F, s.fruit ? 1.5 : 1.3); }
    } else if (s.kind === "i_shrub") {
      if (art === "rosette") {
        for (i = 0; i < 9; i++) { var a = Math.PI * (0.08 + i / 8 * 0.84); out += '<path d="M20 24 L' + (20 - Math.cos(a) * 15).toFixed(1) + " " + (24 - Math.sin(a) * 18).toFixed(1) + '" stroke="' + (i % 2 ? L : dk) + '" stroke-width="2.4" stroke-linecap="round"/>'; }
        if (s.bloom) { out += '<path d="M20 22 V3" stroke="#6f7a4a" stroke-width="1.2"/>' + dots([[20, 3], [20, 5.5], [20, 8]], s.bloom, 1.6); }
      } else if (art === "grass") {
        for (i = 0; i < 11; i++) { var g2 = Math.PI * (0.12 + i / 10 * 0.76); out += '<path d="M20 26 Q' + (20 - Math.cos(g2) * 6).toFixed(1) + " 12 " + (20 - Math.cos(g2) * 15).toFixed(1) + " " + (25 - Math.sin(g2) * 20).toFixed(1) + '" fill="none" stroke="' + (i % 2 ? L : dk) + '" stroke-width="1.3"/>'; }
        if (s.plume) { out += '<g fill="' + s.plume + '"><ellipse cx="14" cy="6" rx="2" ry="4.5"/><ellipse cx="20" cy="4" rx="2" ry="4.5"/><ellipse cx="26" cy="6.5" rx="2" ry="4.5"/></g>'; }
      } else if (art === "topiary") {
        out = '<rect x="19.2" y="18" width="1.6" height="9" fill="' + B + '"/>' +
              (s.f === "topcone" ? '<path d="M20 1 L27 19 H13 Z" fill="' + L + '"/>' : s.f === "topspiral" ? '<path d="M20 1 L25 6 L15 9 L26 12 L14 16 L27 19 H13 Z" fill="' + L + '"/>'
                                 : '<circle cx="20" cy="11" r="8" fill="' + L + '"/>');
      } else {
        out = '<path d="M5 26 C3 19 7 13 12 13 C13 7 19 5 23 8 C28 6 34 10 33 15 C37 17 37 24 34 26 Z" fill="' + L + '"/><path d="M23 8 C28 6 34 10 33 15 C37 17 37 24 34 26 H22 Z" fill="' + dk + '" opacity=".3"/>';
        if (F) { out += dots([[11, 17], [16, 12], [22, 11], [28, 14], [31, 20], [19, 18], [25, 21], [13, 23]], F, s.berry ? 1 : 1.7); }
      }
    } else if (s.kind === "i_flowerbed") {
      out = '<rect x="2" y="15" width="36" height="11" rx="2" fill="' + (s.head === "rock" ? "#b8b0a2" : "#6b4f38") + '"/>';
      if (s.head === "veg") { out += '<g fill="#7aa04a"><circle cx="8" cy="14" r="3"/><circle cx="16" cy="14" r="3"/><circle cx="24" cy="14" r="3"/><circle cx="32" cy="14" r="3"/></g><g fill="#d8352a"><circle cx="12" cy="10" r="1.3"/><circle cx="28" cy="9" r="1.3"/></g>'; }
      else if (s.head === "rock") { out += '<g fill="#8f887e"><ellipse cx="11" cy="16" rx="5" ry="3.4"/><ellipse cx="27" cy="17" rx="6" ry="3.8"/></g><g fill="' + L + '"><circle cx="19" cy="15" r="2.4"/><circle cx="33" cy="14" r="2"/></g>'; }
      else {
        var cs = s.cols || ["#e46b6b", "#f2c94c", "#b07cc6", "#f4f2ec"], tall = s.h > 1 ? 4 : s.h > 0.5 ? 8 : 11;
        for (i = 0; i < 7; i++) {
          var x = 5 + i * 5, y = tall + (i % 2) * 2.5;
          out += '<path d="M' + x + " 16 V" + y + '" stroke="' + mShade(L, -0.1) + '" stroke-width="0.9"/><circle cx="' + x + '" cy="' + y + '" r="' + (s.big ? 3 : 2) + '" fill="' + cs[i % cs.length] + '"/>' +
                 (s.center ? '<circle cx="' + x + '" cy="' + y + '" r="' + (s.big ? 1.2 : 0.7) + '" fill="' + s.center + '"/>' : "");
        }
      }
    } else {
      out = '<rect x="2" y="9" width="36" height="17" rx="5" fill="' + L + '"/><path d="M2 14 C6 9 10 11 14 9 C18 11 22 9 26 10 C30 9 34 11 38 14" fill="none" stroke="' + mShade(L, 0.15) + '" stroke-width="1.2"/>';
      if (s.f === "cones") { out = '<g fill="' + L + '"><path d="M7 3 L12 26 H2 Z"/><path d="M20 2 L25 26 H15 Z"/><path d="M33 3 L38 26 H28 Z"/></g>'; }
      if (s.f === "boxhedge") { out = '<rect x="2" y="15" width="36" height="11" rx="1.5" fill="' + L + '"/>'; }
      if (F) { out += dots([[7, 15], [13, 20], [19, 14], [26, 19], [32, 15], [35, 22]], F, s.berry ? 1 : 1.6); }
    }
    return '<svg viewBox="0 0 40 28" aria-hidden="true">' + out + "</svg>";
  }

  // ---- on the paper: each tree drawn as its kind grows ---------------------------------------------
  // (black and white, the palette's own line, as every icon is)
  function floraArtKey(s) {
    if (!s) { return ""; }
    if (s.kind === "i_tree") {
      var old = { willow: "weeping", poplar: "column", cypress: "column", spruce: "cone", fir: "cone", redwood: "cone", pine: "cone",
                  palm: "palm", banana: "palm", joshua: "candle", cactus: "cactus", fruit: "fruit" };
      if (s.f === "old") { return old[s.key] || "round"; }
      var art = { spread: "spread", weeping: "weeping", column: "column", cone: "cone", cedar: "cone", pine: "cone", palm: "palm", fern: "palm",
                  bamboo: "bamboo", baobab: "baobab", candle: "candle" }[s.f];
      return art || (s.fruit ? "fruit" : s.bloom ? "blossom" : "round");
    }
    if (s.kind === "i_shrub") {
      if (s.f === "rosette" || s.f === "succulents") { return "rosette"; }
      if (s.f === "grass" || s.f === "fern" || s.f === "hosta" || s.f === "paddle") { return "grass"; }
      if (/^top/.test(s.f) || s.key === "boxwood") { return "topiary"; }
      return s.bloom || s.berry ? "bloom" : "";
    }
    return "";
  }
  var FLORA_FIG = {
    blossom: null, fruit: null,
    cone: ["o M22.4 38 H25.6 V45 H22.4 Z", "o M24 2.6 L32.6 14.6 H28.4 L35.6 25.6 H30.6 L38.6 38 H9.4 L17.4 25.6 H12.4 L19.6 14.6 H15.4 Z"],
    column: ["o M22.4 40 H25.6 V45 H22.4 Z", "o M24 2.4 C29.6 6 31 16 30.4 26 C29.8 34 27.6 40 24 40.6 C20.4 40 18.2 34 17.6 26 C17 16 18.4 6 24 2.4 Z",
             "t M24 8 V34"],
    palm: ["o M21.6 45 C22 36 23.6 28 26.6 19.6 H29 C26.4 28 25.2 36 25.4 45 Z",
           "o M27.8 18.4 C22 10.6 13.6 10.4 7.4 16 C14 13.6 21 14.4 27.8 18.4 Z", "o M27.8 18.4 C33.6 10.6 41.4 10.4 46 16 C40 13.6 34.4 14.4 27.8 18.4 Z",
           "o M27.8 18.4 C24.6 11.4 25.4 5.4 30.4 2.4 C28.4 7.4 28 12.4 27.8 18.4 Z", "o M27.8 18.4 C21 18.4 15.4 22.4 12.4 28.4 C18 23 23 21 27.8 18.4 Z",
           "o M27.8 18.4 C34.6 18.4 40.4 22.4 43 28.4 C38 23 33 21 27.8 18.4 Z"],
    weeping: ["o M22 30 H26 L26.8 45 H21.2 Z",
              "o M8 30 C8 14 15 4 24 4 C33 4 40 14 40 30 C37 27 35 32 32 28 C30 32 27 28 24 31 C21 28 18 32 16 28 C13 32 11 27 8 30 Z",
              "t M14 14 C12 20 12 25 13 29 M20 9.6 C18.4 18 18.4 24 19 30 M28 9.6 C29.6 18 29.6 24 29 30 M34 14 C36 20 36 25 35 29"],
    spread: ["o M22.6 45 L23 31 L16.6 23.6 H19.4 L24 28.6 L28.6 23.6 H31.4 L25.2 31 L25.6 45 Z",
             "o M3.6 21 C3.6 15.6 9.6 12 16.6 13 C19.6 7.6 28.4 7.6 31.4 13 C38.4 12 44.4 15.6 44.4 21 C44.4 24 41 25 38 24 H10 C7 25 3.6 24 3.6 21 Z"],
    cactus: ["o M20.6 45 V8.4 C20.6 4.6 27.4 4.6 27.4 8.4 V45 Z", "o M20.6 30.6 H15.4 C13.4 30.6 12.4 29.4 12.4 27.4 V17.6 C12.4 15.4 16.4 15.4 16.4 17.6 V26 H20.6 Z",
             "o M27.4 24 H31.6 V14.4 C31.6 12.4 35.6 12.4 35.6 14.4 V25.6 C35.6 27.6 34.6 28.4 32.6 28.4 H27.4 Z"],
    bamboo: ["o " + "M14.4 45 V9 C14.4 7.6 18 7.6 18 9 V45 Z M22.2 45 V4 C22.2 2.6 25.8 2.6 25.8 4 V45 Z M30 45 V12 C30 10.6 33.6 10.6 33.6 12 V45 Z",
             "t M14.4 19 H18 M14.4 31 H18 M22.2 15 H25.8 M22.2 28 H25.8 M30 22 H33.6 M30 34 H33.6",
             "o M18 13 C22 9.4 26.6 11 29.6 7 C26 13.4 22 13.6 18 13 Z", "o M14.4 22 C10 19 6.6 20.4 4 17 C7 22 10.6 23.4 14.4 22 Z"],
    candle: ["o M22.6 45 V26.6 L15.6 18.6 L17.4 17 L23.4 23.6 V14 H25.6 V24 L31 17.6 L32.8 19 L25.8 27 V45 Z",
             "o M11.8 15.4 A5 5 0 1 0 21.8 15.4 A5 5 0 1 0 11.8 15.4 Z M19.4 10.6 A5 5 0 1 0 29.4 10.6 A5 5 0 1 0 19.4 10.6 Z M27.2 16 A5 5 0 1 0 37.2 16 A5 5 0 1 0 27.2 16 Z"],
    baobab: ["o M16.6 45 C15.6 36 17.6 28 21.4 21.6 H26.6 C30.4 28 32.4 36 31.4 45 Z",
             "o M8.4 19.6 C8.4 14.4 15.4 12.4 24 13 C32.6 12.4 39.6 14.4 39.6 19.6 C39.6 22.6 35.6 23.6 31.6 22.6 H16.4 C12.4 23.6 8.4 22.6 8.4 19.6 Z"]
  };
  // flowers: rings inside the crown; fruit: dots of ink
  var FLORA_RING = function (cx, cy, r) { return "M" + (cx - r) + " " + cy + " A" + r + " " + r + " 0 1 0 " + (cx + r) + " " + cy + " A" + r + " " + r + " 0 1 0 " + (cx - r) + " " + cy + " Z"; };
  var FLORA_SPOTS = [[18, 13], [28, 11], [31, 22], [20, 25], [24.6, 18], [15, 20.6], [33.4, 16.4]];
  var FLORA_SHRUB = {
    bloom: ["t " + [[28, 26], [52, 24], [40, 40], [24, 50], [56, 52], [40, 62], [62, 36], [18, 36]].map(function (p) { return FLORA_RING(p[0], p[1], 4); }).join(" ")],
    rosette: ["t " + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var a = i / 8 * Math.PI * 2; return "M40 40 L" + (40 + Math.cos(a) * 30).toFixed(1) + " " + (40 + Math.sin(a) * 30).toFixed(1); }).join(" ")],
    grass: ["t " + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { var a = i / 12 * Math.PI * 2; return "M40 40 L" + (40 + Math.cos(a) * 26).toFixed(1) + " " + (40 + Math.sin(a) * 26).toFixed(1); }).join(" ")],
    topiary: ["t " + FLORA_RING(40, 40, 22) + " " + FLORA_RING(40, 40, 10)]
  };
  var floraPartsKept = {};
  function floraParts(kind, art) {
    var key = kind + ":" + art;
    if (floraPartsKept[key]) { return floraPartsKept[key]; }
    var base = ICONS[kind].art, list = null;
    if (kind === "i_tree") {
      if (art === "blossom") { list = base.concat(["t " + FLORA_SPOTS.map(function (p) { return FLORA_RING(p[0], p[1], 1.8); }).join(" ")]); }
      else if (art === "fruit") { list = base.concat(["k " + FLORA_SPOTS.map(function (p) { return FLORA_RING(p[0], p[1], 1.7); }).join(" ")]); }
      else { list = FLORA_FIG[art]; }
    } else if (kind === "i_shrub" && FLORA_SHRUB[art]) {
      list = base.concat(FLORA_SHRUB[art]);
    }
    floraPartsKept[key] = list ? iconParts(list) : null;
    return floraPartsKept[key];
  }
  var floraArtFor = null;                 // (a library tile drawn as a kind: 11-hand-icons.js)
  if (typeof iconArt === "function") {
    var iconArtFlora = iconArt;
    iconArt = function (kind) {
      if ((kind !== "i_tree" && kind !== "i_shrub") || !ICONS[kind] || typeof ICONS[kind].art === "function") { return iconArtFlora.apply(this, arguments); }
      var sp = floraArtFor && floraArtFor.kind === kind ? floraArtFor.sp : (iconNode && iconNode.kind === kind ? iconNode.sp : null);
      var s = sp && FLORA[sp], art = s && s.kind === kind ? floraArtKey(s) : "", parts = art && art !== "round" ? floraParts(kind, art) : null;
      if (!parts) { return iconArtFlora.apply(this, arguments); }
      var icon = iconMade(kind), keep = icon.parts;
      icon.parts = parts;
      try { return iconArtFlora.apply(this, arguments); } finally { icon.parts = keep; }
    };
  }

  // ---- asked for by name, in the icon search ---------------------------------------------------------
  // "cherry tree", "tulips", "lavender", "japanese maple": the kinds whose
  // names say so come up as tiles of their own, named and drawn as they
  // are, and the one picked is put down as that kind.
  var floraHit = {}, floraNext = null;
  function floraNameWords(k) {
    var en = (typeof ALL === "object" && ALL.en) || {};
    return (floraName(k) + " " + (en["spc_" + k] || "") + " " + k).toLowerCase();
  }
  if (typeof iconFits === "function") {
    var iconFitsFlora = iconFits;
    iconFits = function (kind, words) {
      var plain = iconFitsFlora.apply(this, arguments);
      delete floraHit[kind];
      if (!FLORA_KINDS[kind] || !words || !words.length) { return plain; }
      var said = typeof iconAnswers === "function" ? iconAnswers(kind) : "", list = [];
      FLORA_ORDER.forEach(function (k) {
        if (FLORA[k].kind !== kind || k === FLORA_KINDS[kind]) { return; }
        var name = floraNameWords(k), own = false;
        var ok = words.every(function (w) {
          if (name.indexOf(w) >= 0) { if (said.indexOf(w) < 0) { own = true; } return true; }
          return said.indexOf(w) >= 0;
        });
        if (ok && own) { list.push(k); }
      });
      if (!list.length) { return plain; }
      floraHit[kind] = { list: list, plain: plain, at: Date.now() };
      return true;
    };
  }
  if (typeof iconTileButton === "function") {
    var iconTileButtonFlora = iconTileButton;
    iconTileButton = function (kind, pick, shown, card) {
      var hit = floraHit[kind];
      delete floraHit[kind];                // (once: the tiles the search was for)
      if (!hit || Date.now() - hit.at > 400) { return iconTileButtonFlora.apply(this, arguments); }
      var out = document.createDocumentFragment(), self = this;
      if (hit.plain) { out.appendChild(iconTileButtonFlora.apply(this, arguments)); }
      hit.list.slice(0, 16).forEach(function (sp) {
        floraArtFor = { kind: kind, sp: sp };
        var cell;
        try {
          cell = iconTileButtonFlora.call(self, kind, function (k) { floraNext = { kind: k, sp: sp, at: Date.now() }; pick(k); }, shown, card);
        } finally { floraArtFor = null; }
        var name = floraName(sp);
        cell.title = name;
        cell.setAttribute("aria-label", name);
        cell.dataset.sp = sp;
        var label = cell.querySelector(".icon-name");
        if (label) { label.textContent = name; }
        // carried onto the paper: that kind, where it lands (and nothing left waiting if it is not let go there)
        var lent = cell.ondragstart, ended = cell.ondragend;
        cell.ondragstart = function (ev) { floraNext = { kind: kind, sp: sp, at: Date.now() }; if (lent) { lent.call(cell, ev); } };
        cell.ondragend = function (ev) { floraNext = null; if (ended) { ended.call(cell, ev); } };
        out.appendChild(cell);
      });
      return out;
    };
  }
  if (typeof addNode === "function") {
    var addNodeFlora = addNode;
    addNode = function (kind) {
      var id = hand.next, out = addNodeFlora.apply(this, arguments), next = floraNext;
      floraNext = null;
      try {
        var n = nodeById(id);
        if (n && next && next.kind === n.kind && Date.now() - next.at < 60000) {
          floraPut(n, next.sp);
          if (typeof handKeep === "function") { handKeep(); }
          drawHand();
          if (typeof drawHandPanel === "function") { drawHandPanel(); }
        }
      } catch (e) { /* put down plain */ }
      return out;
    };
  }
