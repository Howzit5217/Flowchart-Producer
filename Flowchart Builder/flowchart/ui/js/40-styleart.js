// ---------------------------------------------------------------------------
//  40-styleart.js -- each style's picture telling it from the rest: its
//  walls drawn in what they are made of (brick courses, siding, stone,
//  logs, half-timbering, board and batten), its roof in what covers it
//  (shingles, slate, tile, thatch, standing seams, panels), its windows
//  the shape the style has them (arched, tall, a ribbon, paper screens,
//  small and deep) -- still in lines, in the page's own ink -- and the
//  picker's pictures bigger
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "to replace the style menu selection to be
  // updated to a better design")  The pictures were a roof's outline over
  // the same box, two windows and a door -- forty of them hardly told apart.
  var SA_WINDOWS = {
    arched: { mission: 1, tuscan: 1, provencal: 1, riad: 1, arabian: 1, haveli: 1, french: 1, collegiate: 1 },
    tall: { victorian: 1, georgian: 1, colonial: 1, capecod: 1, dutchcolonial: 1, dutch: 1, tudor: 1, nzvilla: 1, queenslander: 1 },
    ribbon: { modern: 1, contemporary: 1, midcentury: 1, prairie: 1, ecohouse: 1, brazil: 1 },
    screens: { japanese: 1, hanok: 1, chinese: 1, thai: 1 },
    small: { cottage: 1, logcabin: 1, izba: 1, rondavel: 1, cycladic: 1, pueblo: 1, sahel: 1, nordic: 1, chalet: 1, balinese: 1, aframe: 1 }
  };
  var SA_PLAIN_WINDOWS = "M12 18.6 H16.4 V22.6 H12 Z M27.6 18.6 H32 V22.6 H27.6 Z";
  var saCount = 0;
  function saWindows(key) {
    var kind = Object.keys(SA_WINDOWS).filter(function (k) { return SA_WINDOWS[k][key]; })[0] || "plain";
    if (kind === "arched") { return { d: "M12 23 V20.2 A2.2 2.2 0 0 1 16.4 20.2 V23 Z M27.6 23 V20.2 A2.2 2.2 0 0 1 32 20.2 V23 Z M14.2 18 V23 M29.8 18 V23", holes: [[12, 18, 4.4, 5], [27.6, 18, 4.4, 5]] }; }
    if (kind === "tall") { return { d: "M12.4 17.4 H15.8 V24 H12.4 Z M28.2 17.4 H31.6 V24 H28.2 Z M12.4 20.7 H15.8 M28.2 20.7 H31.6", holes: [[12.4, 17.4, 3.4, 6.6], [28.2, 17.4, 3.4, 6.6]] }; }
    if (kind === "ribbon") { return { d: "M10.6 17.2 H33.4 V19.8 H10.6 Z M16.3 17.2 V19.8 M22 17.2 V19.8 M27.7 17.2 V19.8", holes: [[10.6, 17.2, 22.8, 2.6]] }; }
    if (kind === "screens") { return { d: "M11.4 18.2 H17 V23.4 H11.4 Z M27 18.2 H32.6 V23.4 H27 Z M13.3 18.2 V23.4 M15.1 18.2 V23.4 M11.4 20.8 H17 M28.9 18.2 V23.4 M30.7 18.2 V23.4 M27 20.8 H32.6", holes: [[11.4, 18.2, 5.6, 5.2], [27, 18.2, 5.6, 5.2]] }; }
    if (kind === "small") { return { d: "M12.6 19 H15.8 V22 H12.6 Z M28.2 19 H31.4 V22 H28.2 Z M14.2 19 V22 M29.8 19 V22", holes: [[12.6, 19, 3.2, 3], [28.2, 19, 3.2, 3]] }; }
    return { d: SA_PLAIN_WINDOWS + " M14.2 18.6 V22.6 M29.8 18.6 V22.6", holes: [[12, 18.6, 4.4, 4], [27.6, 18.6, 4.4, 4]] };
  }
  // A few lines a wall, by what it is made of (in the wall's box 9..35 x 16..27).
  function saWall(mat, key) {
    var out = [], y, x, i;
    if (mat === "siding") { for (y = 17.4; y < 27; y += 1.4) { out.push("M9 " + y.toFixed(1) + " H35"); } }
    else if (mat === "boards") { for (x = 10.6; x < 35; x += 2) { out.push("M" + x.toFixed(1) + " 16 V27"); } }
    else if (mat === "brick") {
      for (y = 17.2, i = 0; y < 27; y += 1.2, i++) {
        out.push("M9 " + y.toFixed(1) + " H35");
        for (x = 9 + (i % 2 ? 1.2 : 2.4); x < 35; x += 2.4) { out.push("M" + x.toFixed(1) + " " + y.toFixed(1) + " v-1.2"); }
      }
    } else if (mat === "stone") {
      var r = 1;
      for (i = 0; i < key.length; i++) { r = (r * 31 + key.charCodeAt(i)) % 9973; }
      for (y = 17.6, i = 0; y < 27; y += 1.9, i++) {
        x = 9;
        while (x < 34) { r = (r * 73 + 19) % 9973; var w = 2.2 + (r % 17) / 10; out.push("M" + x.toFixed(1) + " " + y.toFixed(1) + " h" + Math.min(w - 0.5, 35 - x).toFixed(1)); x += w; }
      }
    } else if (mat === "shakes") {
      for (y = 17.2, i = 0; y < 27; y += 1.6, i++) {
        out.push("M9 " + y.toFixed(1) + " H35");
        for (x = 9 + (i % 2 ? 0.8 : 1.6); x < 35; x += 1.6) { out.push("M" + x.toFixed(1) + " " + y.toFixed(1) + " v-1.6"); }
      }
    } else if (mat === "logs") {
      for (y = 18, i = 0; y < 27; y += 2, i++) { out.push("M9 " + y.toFixed(1) + " H35"); out.push("M8.2 " + (y - 1).toFixed(1) + " a1 1 0 1 0 0.01 0 M35.8 " + (y - 1).toFixed(1) + " a1 1 0 1 0 0.01 0"); }
    } else if (mat === "timber") {
      out.push("M9 21.4 H35 M15 16 V27 M29 16 V27 M22 16 V20.6 M9 16 L15 21.4 M35 16 L29 21.4 M15 21.4 L19.6 27 M29 21.4 L24.4 27");
    } else if (mat === "cladding") {
      for (x = 12; x < 35; x += 3.2) { out.push("M" + x.toFixed(1) + " 16 V27"); }
      out.push("M9 21.5 H35");
    } else if (mat === "concrete") { out.push("M9 21.5 H35 M17.6 16 V27 M26.4 16 V27"); }
    return out.join(" ");
  }
  // And the roof's covering.
  function saRoof(mat) {
    var out = [], y, x;
    if (mat === "shingles" || mat === "woodshakes") { for (y = 4; y < 17; y += 1.5) { out.push("M2 " + y.toFixed(1) + " H42"); } }
    else if (mat === "slate") {
      for (y = 4, x = 0; y < 17; y += 1.2, x++) {
        out.push("M2 " + y.toFixed(1) + " H42");
        for (var k = 3 + (x % 2) * 1.2; k < 42; k += 2.4) { out.push("M" + k.toFixed(1) + " " + y.toFixed(1) + " v1.2"); }
      }
    } else if (mat === "tiles") { for (x = 3; x < 42; x += 1.6) { out.push("M" + x.toFixed(1) + " 2 V17"); } for (y = 6; y < 17; y += 3) { out.push("M2 " + y + " H42"); } }
    else if (mat === "thatch") { for (x = 2; x < 42; x += 1.1) { out.push("M" + x.toFixed(1) + " 2 l0.9 15"); } }
    else if (mat === "metal") { for (x = 4; x < 42; x += 2.2) { out.push("M" + x.toFixed(1) + " 2 V17"); } }
    else if (mat === "green") { for (x = 4; x < 42; x += 2.6) { out.push("M" + x.toFixed(1) + " 12 q0.8 -1.4 1.6 0"); } }
    else if (mat === "solar") { for (x = 9; x < 36; x += 3.4) { out.push("M" + x.toFixed(1) + " 2 V17"); } out.push("M2 12.6 H42 M2 14.3 H42"); }
    return out.join(" ");
  }
  if (typeof styleArt === "function") {
    var styleArtOutline = styleArt;
    styleArt = function (key, shapeOnly) {
      var svg = styleArtOutline.apply(this, arguments);
      var S = typeof HOUSE_STYLES === "object" ? HOUSE_STYLES[key] : null;
      if (shapeOnly || !S) { return svg; }
      try {
        var id = "sa" + (++saCount), W = saWindows(key), shape = S.shape;
        var roofD = typeof STYLE_ROOF_ART === "object" ? STYLE_ROOF_ART[shape] || STYLE_ROOF_ART.hip : "";
        // the wall, its windows and door cut out of what it is made of
        var hole = W.holes.map(function (h) { return "M" + h[0] + " " + h[1] + " h" + h[2] + " v" + h[3] + " h-" + h[2] + " Z"; }).join(" ") + " M19.6 20.6 h4.8 V27 h-4.8 Z";
        var defs = '<defs><clipPath id="' + id + 'w"><path clip-rule="evenodd" d="M9 16 H35 V27 H9 Z ' + hole + '"/></clipPath>' +
                   (roofD && shape !== "aframe" && shape !== "pagoda" ? '<clipPath id="' + id + 'r"><path d="' + roofD.split(" M")[0] + '"/></clipPath>' : "") + "</defs>";
        var wall = shape === "aframe" ? "" : saWall(S.out[0], key), roof = saRoof(S.roof[0]);
        var under = defs +
          (wall ? '<path class="sa-fine" clip-path="url(#' + id + 'w)" d="' + wall + '"/>' : "") +
          (roof && roofD && shape !== "aframe" && shape !== "pagoda" ? '<path class="sa-fine" clip-path="url(#' + id + 'r)" d="' + roof + '"/>' : "");
        svg = svg.replace(/(<svg[^>]*>)/, "$1" + under);
        svg = svg.replace('<path d="' + SA_PLAIN_WINDOWS + '"/>', '<path d="' + W.d + '"/>');
        if (S.parapet) { svg = svg.replace("</svg>", '<path d="M8 12.5 V11.2 H36 V12.5"/></svg>'); }
      } catch (e) { /* the outline */ }
      return svg;
    };
  }
