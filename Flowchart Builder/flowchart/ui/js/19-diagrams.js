// ---------------------------------------------------------------------------
//  19-diagrams.js -- flowcharts made in other programs, opened as drawings
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A flowchart made somewhere else is not only a picture of one.  Saved from
  // draw.io, Excalidraw, Visio (which is also how Lucidchart hands its work
  // over), yEd, Graphviz, PlantUML or Lucidchart's own list of shapes, it is
  // a file that says which shapes there are, what each one says, which arrow
  // joins which, and what color everything is.  Each of those is read here
  // into the same plain list of shapes and arrows -- a graph -- and the graph
  // becomes a drawing on the Flowchart tab, colors and all, to be moved,
  // checked and run like one drawn here.
  //
  // Flowgorithm is the odd one out: its file is a program, statement by
  // statement, so it is written out as pseudocode and opened on the
  // Pseudocode tab, where it runs.
  //
  // A graph:
  //   { nodes: [{ key, kind, text, x, y, w, h, look }],
  //     links: [{ from, to, label, pts }],
  //     placed,          -- whether x and y say where things were put
  //     paper, ink,      -- the colors of the page and of the arrows
  //     face, from }     -- the typeface, and the program it came from
  // where `look` is a shape's own { fill, line, text, bold, italic, under,
  // weight, dash }, the way the Style side keeps one (style.nodes).
  //
  // Nothing here reaches out to the internet.  The files are read by the few
  // small readers below, and what comes squeezed -- a zip, a packed draw.io
  // page -- is unsqueezed by the browser itself.

  // ------------------------------------------------------ a small XML reader --
  // Most of these files are XML.  The browser reads XML, but only inside a
  // page, and these readers are checked outside one too (tests/brought.js),
  // so they read it with this: elements, their attributes, and the words
  // between them in order.  Nothing else XML can say is used by any of them.
  var XML_NAMED = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'", nbsp: "\u00a0",
                    ndash: "\u2013", mdash: "\u2014", hellip: "\u2026", laquo: "\u00ab",
                    raquo: "\u00bb", ldquo: "\u201c", rdquo: "\u201d", lsquo: "\u2018",
                    rsquo: "\u2019", times: "\u00d7", divide: "\u00f7", le: "\u2264",
                    ge: "\u2265", ne: "\u2260", larr: "\u2190", rarr: "\u2192" };
  function xmlSaid(s) {
    return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, function (all, name) {
      if (name.charAt(0) === "#") {
        var code = /^#x/i.test(name) ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
        try { return String.fromCodePoint(code); } catch (e) { return ""; }
      }
      var said = XML_NAMED[name.toLowerCase()];
      return said === undefined ? all : said;
    });
  }

  function xmlTree(text) {
    var s = String(text || ""), at = 0, n = s.length;
    var root = { tag: "#root", at: {}, kids: [] }, open = [root];
    function words(t) {
      if (t) { open[open.length - 1].kids.push({ tag: "#text", text: xmlSaid(t) }); }
    }
    while (at < n) {
      var lt = s.indexOf("<", at);
      if (lt < 0) { words(s.slice(at)); break; }
      words(s.slice(at, lt));
      if (s.substr(lt, 4) === "<!--") {
        var shut = s.indexOf("-->", lt + 4);
        at = shut < 0 ? n : shut + 3;
        continue;
      }
      if (s.substr(lt, 9) === "<![CDATA[") {
        var end = s.indexOf("]]>", lt + 9);
        open[open.length - 1].kids.push({ tag: "#text", text: s.slice(lt + 9, end < 0 ? n : end) });
        at = end < 0 ? n : end + 3;
        continue;
      }
      var next = s.charAt(lt + 1);
      if (next === "?" || next === "!") {          // <?xml ...?>, <!DOCTYPE [...]>
        var deep = 0, i = lt + 1;
        for (; i < n; i++) {
          var c = s.charAt(i);
          if (c === "[") { deep++; } else if (c === "]") { deep--; }
          else if (c === ">" && deep <= 0) { break; }
        }
        at = i + 1;
        continue;
      }
      if (next === "/") {
        var gt = s.indexOf(">", lt);
        var name = s.slice(lt + 2, gt < 0 ? n : gt).trim();
        for (var k = open.length - 1; k > 0; k--) {
          if (open[k].tag === name) { open.length = k; break; }
        }
        at = gt < 0 ? n : gt + 1;
        continue;
      }
      // An element: its name, then its attributes, quoted either way.
      var j = lt + 1;
      while (j < n && !/[\s\/>]/.test(s.charAt(j))) { j++; }
      var one = { tag: s.slice(lt + 1, j), at: {}, kids: [] }, alone = false;
      while (j < n) {
        while (j < n && /\s/.test(s.charAt(j))) { j++; }
        var ch = s.charAt(j);
        if (ch === ">") { j++; break; }
        if (ch === "/") { alone = true; j++; continue; }
        var from = j;
        while (j < n && !/[\s=\/>]/.test(s.charAt(j))) { j++; }
        var key = s.slice(from, j), value = "";
        while (j < n && /\s/.test(s.charAt(j))) { j++; }
        if (s.charAt(j) === "=") {
          j++;
          while (j < n && /\s/.test(s.charAt(j))) { j++; }
          var q = s.charAt(j);
          if (q === '"' || q === "'") {
            var close = s.indexOf(q, j + 1);
            if (close < 0) { close = n; }
            value = xmlSaid(s.slice(j + 1, close));
            j = close + 1;
          } else {
            var v0 = j;
            while (j < n && !/[\s>]/.test(s.charAt(j))) { j++; }
            value = xmlSaid(s.slice(v0, j));
          }
        }
        if (key) { one.at[key] = value; }
        if (j === from) { j++; }           // a stray mark: stepped over
      }
      open[open.length - 1].kids.push(one);
      if (!alone) { open.push(one); }
      at = j;
    }
    return root;
  }

  // Names are matched without the part before a colon and in any case:
  // yEd writes <y:ShapeNode>, Visio <Shape>, and neither minds.
  function xmlLocal(tag) {
    var c = tag.indexOf(":");
    return (c < 0 ? tag : tag.slice(c + 1)).toLowerCase();
  }
  function xmlKids(node, name) {         // its own elements, of one name if given
    var want = name ? name.toLowerCase() : "";
    return ((node && node.kids) || []).filter(function (k) {
      return k.tag !== "#text" && (!want || xmlLocal(k.tag) === want);
    });
  }
  function xmlAll(node, name, out) {     // every element under it of that name
    out = out || [];
    var want = name.toLowerCase();
    ((node && node.kids) || []).forEach(function (k) {
      if (k.tag === "#text") { return; }
      if (xmlLocal(k.tag) === want) { out.push(k); }
      xmlAll(k, name, out);
    });
    return out;
  }
  function xmlFirst(node, name) {        // the first of them, in reading order
    var want = name.toLowerCase(), kids = (node && node.kids) || [];
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.tag === "#text") { continue; }
      if (xmlLocal(k.tag) === want) { return k; }
      var deeper = xmlFirst(k, name);
      if (deeper) { return deeper; }
    }
    return null;
  }
  function xmlWords(node) {              // all the words in it, in order
    if (!node) { return ""; }
    if (node.tag === "#text") { return node.text; }
    return (node.kids || []).map(xmlWords).join("");
  }

  // Words written as a little HTML, the way draw.io keeps a shape's label:
  // a line break is a space here, and the markup goes.
  function htmlWords(s) {
    return xmlSaid(String(s || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|p|li|h\d|tr)>/gi, "\n")
      .replace(/<[^>]*>/g, ""));
  }

  // One line of words, the way a shape here holds them: shapes wrap their own
  // words, so the line breaks another program put in are spaces.
  function flatWords(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/[\u00a0\s]+/g, " ").trim();
  }

  // ------------------------------------------------------------- colors --
  // Colors come written every way there is: #abc, #aabbcc, #aabbccdd,
  // rgb(1, 2, 3), or by name.  They are all kept as #rrggbb, which is what
  // the Style side keeps; see-through is no color at all.
  var COLOR_NAMES = {
    white: "#ffffff", black: "#000000", red: "#ff0000", green: "#008000",
    blue: "#0000ff", yellow: "#ffff00", orange: "#ffa500", purple: "#800080",
    pink: "#ffc0cb", gray: "#808080", grey: "#808080", lightgray: "#d3d3d3",
    lightgrey: "#d3d3d3", darkgray: "#a9a9a9", darkgrey: "#a9a9a9",
    lightblue: "#add8e6", lightgreen: "#90ee90", lightyellow: "#ffffe0",
    lightpink: "#ffb6c1", cyan: "#00ffff", magenta: "#ff00ff", navy: "#000080",
    teal: "#008080", brown: "#a52a2a", gold: "#ffd700", beige: "#f5f5dc",
    lavender: "#e6e6fa", salmon: "#fa8072", khaki: "#f0e68c", violet: "#ee82ee",
    skyblue: "#87ceeb", palegreen: "#98fb98", orchid: "#da70d6", tomato: "#ff6347",
    wheat: "#f5deb3", ivory: "#fffff0", silver: "#c0c0c0", maroon: "#800000",
    olive: "#808000", lime: "#00ff00", aqua: "#00ffff", coral: "#ff7f50",
    darkblue: "#00008b", darkgreen: "#006400", darkred: "#8b0000",
    lightcyan: "#e0ffff", lightsalmon: "#ffa07a", lightsteelblue: "#b0c4de",
    lightgoldenrodyellow: "#fafad2", honeydew: "#f0fff0", mintcream: "#f5fffa",
    aliceblue: "#f0f8ff", mistyrose: "#ffe4e1", whitesmoke: "#f5f5f5",
    gainsboro: "#dcdcdc", steelblue: "#4682b4", royalblue: "#4169e1",
    dodgerblue: "#1e90ff", tan: "#d2b48c", peachpuff: "#ffdab9",
    lemonchiffon: "#fffacd", thistle: "#d8bfd8", plum: "#dda0dd",
    darkorange: "#ff8c00", indigo: "#4b0082", crimson: "#dc143c",
    forestgreen: "#228b22", seagreen: "#2e8b57", slategray: "#708090",
    slategrey: "#708090", dimgray: "#696969", dimgrey: "#696969" };
  function colorHex(said) {
    var s = String(said || "").trim().toLowerCase();
    if (!s || /^(none|transparent|default|inherit|auto|currentcolor|themed)$/.test(s)) { return ""; }
    var m = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s) ||
            /^([0-9a-f]{6})$/.exec(s);
    if (m) {
      var h = m[1];
      if (h.length <= 4) { h = h.replace(/./g, "$&$&"); }
      if (h.length === 8 && h.slice(6) === "00") { return ""; }
      return "#" + h.slice(0, 6);
    }
    m = /^rgba?\(\s*([\d.]+)(%?)[\s,]+([\d.]+)(%?)[\s,]+([\d.]+)(%?)(?:[\s,\/]+([\d.]+)(%?))?\s*\)$/.exec(s);
    if (m) {
      if (m[7] !== undefined && parseFloat(m[7]) === 0) { return ""; }
      return "#" + [1, 3, 5].map(function (k) {
        var v = parseFloat(m[k]) * (m[k + 1] ? 2.55 : 1);
        return ("0" + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2);
      }).join("");
    }
    if (COLOR_NAMES[s]) { return COLOR_NAMES[s]; }
    // Any other name a browser knows, asked of the browser.
    if (/^[a-z]+$/.test(s) && typeof document !== "undefined") {
      var pen = colorHex.pen || (colorHex.pen = document.createElement("canvas").getContext("2d"));
      pen.fillStyle = "#010203";
      pen.fillStyle = s;
      var got = String(pen.fillStyle).toLowerCase();
      if (got !== "#010203" && /^#[0-9a-f]{6}$/.test(got)) { return got; }
    }
    return "";
  }
  function hexRgb(r, g, b) {
    return "#" + [r, g, b].map(function (v) {
      return ("0" + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2);
    }).join("");
  }
  function hexParts(hex) {
    var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || "");
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
  }
  // Black, white or a gray: the colors a drawing has when nobody colored it.
  function plainInk(hex) {
    var c = hexParts(hex);
    return !c || (Math.max.apply(null, c) - Math.min.apply(null, c) <= 14 &&
                  c[0] + c[1] + c[2] <= 3 * 96);
  }
  function plainPaper(hex) {
    var c = hexParts(hex);
    return !c || (Math.max.apply(null, c) - Math.min.apply(null, c) <= 12 &&
                  c[0] + c[1] + c[2] >= 3 * 238);
  }

  // ------------------------------------------------------------ unpacking --
  // Squeezed with the zip squeeze -- "deflate-raw" as it is in a zip or a
  // draw.io page, "deflate" with its little header as in a PNG or an
  // Excalidraw picture.  The browser has done this itself since 2023.
  function inflated(bytes, how) {
    if (typeof DecompressionStream !== "function") {
      return Promise.reject(new Error(TXT.in_old || "unpack"));
    }
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(how));
    return new Response(stream).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  function bytesOf64(text) {
    var clean = String(text).replace(/[^A-Za-z0-9+\/=_-]/g, "")
                            .replace(/-/g, "+").replace(/_/g, "/");
    while (clean.length % 4) { clean += "="; }
    var raw = atob(clean), bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) { bytes[i] = raw.charCodeAt(i); }
    return bytes;
  }
  function latin1Of(bytes) {
    var out = "";
    for (var at = 0; at < bytes.length; at += 0x8000) {
      out += String.fromCharCode.apply(null, bytes.subarray(at, at + 0x8000));
    }
    return out;
  }
  function utf8Of(bytes) { return new TextDecoder().decode(bytes); }

  // The notes a PNG carries beside its picture, by name.  draw.io keeps its
  // whole drawing in one (mxfile), Excalidraw its scene in another, and this
  // page the work itself (flowchart-builder, 08-save.js) -- so a picture
  // saved from any of them opens as the thing it is a picture of.
  function isPng(bytes) {
    return bytes.length > 8 && bytes[0] === 137 && bytes[1] === 80 &&
           bytes[2] === 78 && bytes[3] === 71;
  }
  function pngNotes(bytes) {
    var out = {}, waits = [];
    if (!isPng(bytes)) { return Promise.resolve(out); }
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), at = 8;
    function inflateInto(key, data, utf8) {
      waits.push(inflated(data, "deflate").then(function (b) {
        out[key] = utf8 ? utf8Of(b) : latin1Of(b);
      }, function () { /* a note that will not open is no note */ }));
    }
    while (at + 12 <= bytes.length) {
      var size = view.getUint32(at), type = latin1Of(bytes.subarray(at + 4, at + 8));
      var data = bytes.subarray(at + 8, Math.min(bytes.length, at + 8 + size));
      var zero = data.indexOf(0);
      if (zero > 0 && (type === "tEXt" || type === "zTXt" || type === "iTXt")) {
        var key = latin1Of(data.subarray(0, zero));
        if (type === "tEXt") {
          out[key] = latin1Of(data.subarray(zero + 1));
        } else if (type === "zTXt") {
          inflateInto(key, data.subarray(zero + 2), false);
        } else {
          var packed = data[zero + 1], p = zero + 3;
          p = data.indexOf(0, p) + 1;        // past the language
          p = data.indexOf(0, p) + 1;        // and the translated name
          if (p > 0) {
            if (packed) { inflateInto(key, data.subarray(p), true); }
            else { out[key] = utf8Of(data.subarray(p)); }
          }
        }
      }
      if (type === "IEND") { break; }
      at += 12 + size;
    }
    return Promise.all(waits).then(function () { return out; });
  }

  // ------------------------------------------------------ shapes, by name --
  // What another program calls a shape, and the shape it is here.  One list
  // for all of them: they borrow their names from the same old flowchart
  // stencil -- Decision, Terminator, Predefined process, Manual input --
  // written as draw.io's mxgraph.flowchart.manual_input, yEd's
  // com.yworks.flowchart.manualInput or Visio's "Manual input".  The first
  // that fits is the one.
  var NAMED_KINDS = [
    [/\bdecision\b|\bdiamond\b|\brhombus\b|\bchoice\b/, "diamond"],
    [/\bterminator\b|\bterminal\b|\bstart ?\/? ?end\b|\bstart ?1\b|\bellipse\b|\boval\b|\begg\b|\bpill\b|\bstadium\b/, "oval"],
    [/\bpredefined process\b|\bsub ?process\b|\bsubroutine\b|\bcomponent\b/, "sub"],
    [/\bpreparation\b|\bhexagon\b|\boctagon\b/, "hex"],
    [/\bmulti(ple)? ?documents?\b/, "docs"],
    [/\bdocument\b|\bpaper type\b|\bpaper tape\b/, "doc"],
    [/\binternal storage\b/, "stored"],
    [/\bdata ?base\b|\bstored data\b|\bdirect (data|access)\b|\bcylinder\b|\bsequential\b|\bdatastore\b/, "store"],
    [/\bmanual input\b/, "manual"],
    [/\bmanual operation\b|\btrapezo|\btrapezium\b/, "trap"],
    [/\bdelay\b/, "delay"],
    [/\bdisplay\b/, "screen"],
    [/\boff ?page\b/, "offpage"],
    [/\bon ?page\b|\bconnector\b|\bcircle\b|\bstart ?2\b|\bjunction\b|\bsumming\b|(^| )or$/, "circle"],
    [/\bdata\b|\binput ?\/? ?output\b|\bparallelogram\b|\bi ?\/ ?o\b/, "io"],
    [/\bcard\b/, "card"],
    [/\bloop limit\b/, "loop"],
    [/\bannotation\b|\bnote\b|\bcomment\b/, "note"],
    [/\bcloud\b/, "cloud"],
    [/\bcube\b|\b3d\b/, "cube"],
    [/\bsingle arrow\b|\bdouble arrow\b|\bfat arrow\b/, "arrow"],
    [/\bactor\b|\bstick ?figure\b/, "actor"],
    [/\btext\b|\blabel\b/, "text"],
    [/\brounded\b|\bround ?rect/, "roundrect"],
    [/\bprocess\b|\brect(angle)?\b|\bbox\b|\bsquare\b|\bstep\b/, "rect"]
  ];
  function namedKind(name) {
    var said = String(name || "")
      .replace(/([a-z])([A-Z0-9])/g, "$1 $2").replace(/([0-9])([A-Za-z])/g, "$1 $2")
      .replace(/[_.\-]+/g, " ").toLowerCase().trim();
    for (var i = 0; i < NAMED_KINDS.length; i++) {
      if (NAMED_KINDS[i][0].test(said)) { return NAMED_KINDS[i][1]; }
    }
    return "";
  }

  // A shape known only by the outline it is drawn with -- a polygon in an
  // SVG, a Visio shape nobody named -- told by the same measure a picture's
  // shapes are (shapeFit, 19-picture.js).  The corners are shares of the
  // shape's width and height, 0 to 1.
  function polygonKind(pts) {
    if (!pts || pts.length < 3) { return ""; }
    var rows = 40, cols = 40, L = [], R = [], T = [], B = [];
    for (var y = 0; y < rows; y++) {
      var t = (y + 0.5) / rows, lo = Infinity, hi = -Infinity;
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= t && b[1] > t) || (b[1] <= t && a[1] > t)) {
          var x = a[0] + (t - a[1]) / (b[1] - a[1]) * (b[0] - a[0]);
          lo = Math.min(lo, x); hi = Math.max(hi, x);
        }
      }
      L.push(lo === Infinity ? NaN : lo);
      R.push(hi === -Infinity ? NaN : hi);
    }
    for (var c = 0; c < cols; c++) {
      var u = (c + 0.5) / cols, top = Infinity, foot = -Infinity;
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k], q = pts[(k + 1) % pts.length];
        if ((p[0] <= u && q[0] > u) || (q[0] <= u && p[0] > u)) {
          var v = p[1] + (u - p[0]) / (q[0] - p[0]) * (q[1] - p[1]);
          top = Math.min(top, v); foot = Math.max(foot, v);
        }
      }
      T.push(top === Infinity ? NaN : top);
      B.push(foot === -Infinity ? NaN : foot);
    }
    var fit = shapeFit(L, R, T, B, 1);
    return fit && fit.err < 0.2 ? fit.kind : "";
  }

  // The shape nearest a spot -- an arrow's loose end, a word on its own --
  // within `reach`, and never a word itself.
  function nearestNode(nodes, p, reach) {
    var best = null, bestD = reach;
    nodes.forEach(function (n) {
      if (n.kind === "text" || !isFinite(n.x)) { return; }
      var dx = Math.max(0, Math.abs(p.x - n.x) - (n.w || 0) / 2);
      var dy = Math.max(0, Math.abs(p.y - n.y) - (n.h || 0) / 2);
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d <= bestD) { bestD = d; best = n; }
    });
    return best;
  }

  // The color most of the arrows are drawn in.
  function mostOf(votes) {
    var best = "", most = 0;
    Object.keys(votes).forEach(function (k) {
      if (votes[k] > most) { most = votes[k]; best = k; }
    });
    return best;
  }

  // ------------------------------------------------------------- draw.io --
  // draw.io -- diagrams.net, and the draw.io inside Confluence, Google Drive
  // and VS Code -- keeps a drawing as <mxfile>: a <diagram> for each page,
  // either written out or packed (squeezed, then base64), and in it every
  // shape and arrow a <mxCell> whose style says what it is and how it looks:
  // "rhombus;fillColor=#fff2cc;strokeColor=#d6b656".  Its PNG and SVG
  // pictures carry the same file inside them.
  function isDrawio(text) {
    return /<mxfile[\s>]|<mxGraphModel[\s>]/.test(String(text).slice(0, 5000));
  }

  function drawioModels(text) {          // -> Promise of each page's model
    var tree = xmlTree(text);
    var pages = xmlAll(tree, "diagram");
    if (!pages.length) {
      var only = xmlFirst(tree, "mxGraphModel");
      return Promise.resolve(only ? [only] : []);
    }
    return Promise.all(pages.map(function (page) {
      var model = xmlFirst(page, "mxGraphModel");
      if (model) { return model; }
      var packed = xmlWords(page).trim();
      if (!packed) { return null; }
      return inflated(bytesOf64(packed), "deflate-raw").then(function (bytes) {
        var xml = latin1Of(bytes);
        try { xml = decodeURIComponent(xml); } catch (e) { /* written plain */ }
        return xmlFirst(xmlTree(xml), "mxGraphModel");
      }).catch(function () { return null; });
    })).then(function (models) { return models.filter(Boolean); });
  }

  function drawioStyle(said) {
    var st = { _: [] };
    String(said || "").split(";").forEach(function (part) {
      part = part.trim();
      if (!part) { return; }
      var eq = part.indexOf("=");
      if (eq < 0) { st._.push(part); }
      else { st[part.slice(0, eq).trim()] = part.slice(eq + 1).trim(); }
    });
    return st;
  }

  // null: not a step of the flow at all -- a swimlane or a group holding
  // others, a picture, a line drawn for looks.
  function drawioKind(st) {
    var names = [st.shape || ""].concat(st._).join(" ");
    var low = names.toLowerCase();
    if (/\b(swimlane|group|table|tablerow|image|line|partialrectangle)\b/.test(low) ||
        st.container === "1" || /^(image|line)$/i.test(st.shape || "")) { return null; }
    if (/(^|\s)text(\s|$)/.test(low)) { return "text"; }
    // draw.io's plain "Process" is the box with a bar down each side: the
    // one the flowchart set calls predefined process.
    if (st.shape === "process") { return "sub"; }
    if (st.shape === "hexagon" || /\bhexagon\b/.test(low)) { return "hex"; }
    var kind = namedKind(names);
    if (kind && kind !== "rect" && kind !== "text") { return kind; }
    if (st.rounded === "1") {
      var arc = parseFloat(st.arcSize || "");
      return st.absoluteArcSize !== "1" && arc >= 40 ? "oval" : "roundrect";
    }
    return "rect";
  }

  function drawioLook(st) {
    var look = {}, fill = colorHex(st.fillColor), line = colorHex(st.strokeColor);
    if (fill) { look.fill = fill; }
    if (st.strokeColor === "none") { if (fill) { look.line = fill; } }
    else if (line) { look.line = line; }
    if (colorHex(st.fontColor)) { look.text = colorHex(st.fontColor); }
    var bits = parseInt(st.fontStyle || "0", 10) || 0;
    if (bits & 1) { look.bold = true; }
    if (bits & 2) { look.italic = true; }
    if (bits & 4) { look.under = true; }
    var width = parseFloat(st.strokeWidth || "");
    if (width >= 2) { look.weight = "thick"; } else if (width > 0 && width < 1) { look.weight = "thin"; }
    if (st.dashed === "1") { look.dash = true; }
    return look;
  }

  function drawioGraph(model) {
    var cells = {}, list = [];
    var root = xmlFirst(model, "root") || model;
    xmlKids(root).forEach(function (el) {
      var cell = el, value = el.at.value;
      if (xmlLocal(el.tag) !== "mxcell") {   // <UserObject label="..."><mxCell/></UserObject>
        cell = xmlFirst(el, "mxCell");
        if (!cell) { return; }
        value = el.at.label;
      }
      var geo = xmlFirst(cell, "mxGeometry"), st = drawioStyle(cell.at.style);
      var one = { id: el.at.id, parent: cell.at.parent, vertex: cell.at.vertex === "1",
                  edge: cell.at.edge === "1", source: cell.at.source, target: cell.at.target,
                  st: st, words: flatWords(st.html === "1" || /</.test(value || "") ? htmlWords(value) : value),
                  x: geo ? +geo.at.x || 0 : 0, y: geo ? +geo.at.y || 0 : 0,
                  w: geo ? +geo.at.width || 0 : 0, h: geo ? +geo.at.height || 0 : 0,
                  ends: {}, bends: [] };
      if (geo) {
        xmlKids(geo, "mxPoint").forEach(function (p) {
          if (p.at.as) { one.ends[p.at.as] = { x: +p.at.x || 0, y: +p.at.y || 0 }; }
        });
        var bends = xmlKids(geo, "Array")[0];
        if (bends) {
          one.bends = xmlKids(bends, "mxPoint").map(function (p) {
            return { x: +p.at.x || 0, y: +p.at.y || 0 };
          });
        }
      }
      cells[one.id] = one;
      list.push(one);
    });
    // Where a cell is on the page: a shape inside a group is placed from
    // the group's corner, and groups sit inside groups.
    function offset(one) {
      var at = { x: 0, y: 0 }, up = cells[one.parent], guard = 0;
      while (up && up.vertex && guard++ < 64) {
        at.x += up.x; at.y += up.y;
        up = cells[up.parent];
      }
      return at;
    }
    var g = { nodes: [], links: [], placed: true, from: "draw.io",
              paper: colorHex(model.at.background) }, known = {}, said = {}, ink = {};
    list.forEach(function (one) {
      if (!one.vertex) { return; }
      var up = cells[one.parent];
      if (up && up.edge) {                // words standing on an arrow
        if (one.words) { (said[up.id] = said[up.id] || []).push(one.words); }
        return;
      }
      var kind = drawioKind(one.st);
      if (!kind || (kind === "text" && !one.words)) { return; }
      var off = offset(one);
      var node = { key: one.id, kind: kind, text: one.words,
                   x: off.x + one.x + one.w / 2, y: off.y + one.y + one.h / 2,
                   w: one.w, h: one.h, look: drawioLook(one.st) };
      g.nodes.push(node);
      known[one.id] = node;
    });
    list.forEach(function (one) {
      if (!one.edge) { return; }
      var off = offset(one);
      function loose(end) {
        var p = one.ends[end];
        return p ? nearestNode(g.nodes, { x: p.x + off.x, y: p.y + off.y }, 24) : null;
      }
      var a = known[one.source] || loose("sourcePoint");
      var b = known[one.target] || loose("targetPoint");
      if (!a || !b || a === b) { return; }
      var st = one.st;
      var back = st.endArrow === "none" && st.startArrow && st.startArrow !== "none";
      var words = [one.words].concat(said[one.id] || []).filter(Boolean).join(" ");
      var path = [{ x: a.x, y: a.y }].concat(one.bends.map(function (p) {
        return { x: p.x + off.x, y: p.y + off.y };
      }), [{ x: b.x, y: b.y }]);
      g.links.push({ from: (back ? b : a).key, to: (back ? a : b).key, label: words, pts: path });
      var line = colorHex(st.strokeColor);
      if (line) { ink[line] = (ink[line] || 0) + 1; }
    });
    g.ink = mostOf(ink);
    return g;
  }

  // ----------------------------------------------------------- Excalidraw --
  // Excalidraw keeps a scene: every element with its place, size, colors and
  // what it is bound to -- words to the shape they are written in, arrows to
  // the shapes they join.  A PNG or SVG saved from it with "embed scene" on
  // carries the scene too, squeezed.
  function isExcalidraw(text) {
    return /"type"\s*:\s*"excalidraw(\/clipboard)?"/.test(String(text).slice(0, 2000));
  }

  // The scene from whatever it came in: the file itself, or the wrapper a
  // picture carries -- { encoding: "bstring", compressed, encoded }, the
  // bytes written one letter each.
  function excalidrawScene(said) {
    var data = said;
    if (typeof said === "string") {
      try { data = JSON.parse(said); } catch (e) { return Promise.resolve(null); }
    }
    if (!data || typeof data !== "object") { return Promise.resolve(null); }
    if (Array.isArray(data.elements)) { return Promise.resolve(data); }
    if (typeof data.encoded === "string") {
      var bytes = new Uint8Array(data.encoded.length);
      for (var i = 0; i < bytes.length; i++) { bytes[i] = data.encoded.charCodeAt(i) & 255; }
      return (data.compressed ? inflated(bytes, "deflate") : Promise.resolve(bytes))
        .then(function (b) { return excalidrawScene(utf8Of(b)); }, function () { return null; });
    }
    return Promise.resolve(null);
  }

  var EXCALIDRAW_WEIGHT = { 1: "thin", 4: "thick" };
  function excalidrawLook(e) {
    var look = {};
    if (colorHex(e.backgroundColor)) { look.fill = colorHex(e.backgroundColor); }
    if (colorHex(e.strokeColor)) { look.line = colorHex(e.strokeColor); }
    if (EXCALIDRAW_WEIGHT[e.strokeWidth]) { look.weight = EXCALIDRAW_WEIGHT[e.strokeWidth]; }
    else if (e.strokeWidth > 2) { look.weight = "thick"; }
    if (e.strokeStyle === "dashed" || e.strokeStyle === "dotted") { look.dash = true; }
    return look;
  }

  function excalidrawGraph(scene) {
    var els = (scene.elements || []).filter(function (e) { return e && !e.isDeleted; });
    var app = scene.appState || {};
    var g = { nodes: [], links: [], placed: true, from: "Excalidraw",
              paper: colorHex(app.viewBackgroundColor) }, known = {}, said = {}, ink = {}, faces = {};
    var SHAPE = { rectangle: "rect", diamond: "diamond", ellipse: "oval" };
    els.forEach(function (e) {
      var kind = SHAPE[e.type];
      if (!kind) { return; }
      if (kind === "rect" && e.roundness) { kind = "roundrect"; }
      var w = Math.abs(e.width || 0), h = Math.abs(e.height || 0);
      var node = { key: e.id, kind: kind, text: "", w: w, h: h, look: excalidrawLook(e),
                   x: (e.width < 0 ? e.x + e.width : e.x) + w / 2,
                   y: (e.height < 0 ? e.y + e.height : e.y) + h / 2 };
      g.nodes.push(node);
      known[e.id] = node;
    });
    els.forEach(function (e) {
      if (e.type !== "text") { return; }
      var words = flatWords(e.originalText || e.text);
      if (!words) { return; }
      faces[e.fontFamily] = (faces[e.fontFamily] || 0) + words.length;
      var home = e.containerId && known[e.containerId];
      if (home) {
        home.text = flatWords(home.text + " " + words);
        if (colorHex(e.strokeColor)) { home.look.text = colorHex(e.strokeColor); }
        if (e.fontFamily === 3 || e.fontFamily === 8) { home.mono = true; }
        return;
      }
      if (e.containerId) { (said[e.containerId] = said[e.containerId] || []).push(words); return; }
      g.nodes.push({ key: e.id, kind: "text", text: words, w: e.width || 0, h: e.height || 0,
                     x: (e.x || 0) + (e.width || 0) / 2, y: (e.y || 0) + (e.height || 0) / 2,
                     look: colorHex(e.strokeColor) ? { text: colorHex(e.strokeColor) } : {} });
    });
    els.forEach(function (e) {
      if (e.type !== "arrow" && e.type !== "line") { return; }
      var pts = (e.points && e.points.length ? e.points : [[0, 0]]).map(function (p) {
        return { x: (e.x || 0) + p[0], y: (e.y || 0) + p[1] };
      });
      var a = (e.startBinding && known[e.startBinding.elementId]) || nearestNode(g.nodes, pts[0], 30);
      var b = (e.endBinding && known[e.endBinding.elementId]) || nearestNode(g.nodes, pts[pts.length - 1], 30);
      if (!a || !b || a === b) { return; }
      // A line joined to nothing was drawn for how it looks, not as a step.
      if (e.type === "line" && !e.startBinding && !e.endBinding) { return; }
      var back = !e.endArrowhead && !!e.startArrowhead;
      g.links.push({ from: (back ? b : a).key, to: (back ? a : b).key,
                     label: (said[e.id] || []).join(" "), pts: pts });
      var line = colorHex(e.strokeColor);
      if (line) { ink[line] = (ink[line] || 0) + 1; }
    });
    g.ink = mostOf(ink);
    // Drawn in Excalidraw's own handwriting (Virgil, and Excalifont after
    // it), the words here are set in the hand typeface too.
    var hand = (faces[1] || 0) + (faces[5] || 0), code = (faces[3] || 0) + (faces[8] || 0);
    var rest = Object.keys(faces).reduce(function (s, k) { return s + faces[k]; }, 0) - hand - code;
    g.face = hand > code && hand > rest ? "hand" : code > hand && code > rest ? "mono" : "";
    return g;
  }

  // --------------------------------------------- Visio, and Lucidchart's --
  // A .vsdx is a zip of XML.  Each page is visio/pages/pageN.xml: its shapes,
  // each with its cells -- PinX and PinY for its middle, Width, Height, the
  // colors -- and at the foot <Connects>, which says which end of which
  // connector is glued to which shape.  What a shape is comes from the
  // master it was dragged from, named in visio/masters/masters.xml.
  // Lucidchart's "Download as Visio" writes one the same way.
  function visioGraph(bytes) {           // -> Promise of a graph
    var files = unzipList(bytes);
    function textOf(name) {
      var f = files.filter(function (x) { return x.name.toLowerCase() === name; })[0];
      return f ? unzipOne(f).then(utf8Of) : Promise.resolve("");
    }
    var pages = files.filter(function (f) { return /^visio\/pages\/page\d+\.xml$/i.test(f.name); })
                     .sort(function (a, b) {
                       return +/(\d+)\.xml$/i.exec(a.name)[1] - +/(\d+)\.xml$/i.exec(b.name)[1];
                     });
    if (!pages.length) { return Promise.resolve(null); }
    return textOf("visio/masters/masters.xml").then(function (masters) {
      var names = {};
      xmlAll(xmlTree(masters), "Master").forEach(function (m) {
        names[m.at.ID] = m.at.NameU || m.at.Name || "";
      });
      return unzipOne(pages[0]).then(utf8Of).then(function (xml) {
        return visioPage(xmlTree(xml), names);
      });
    });
  }

  function visioCells(shape) {           // its own cells, by name
    var out = {};
    xmlKids(shape, "Cell").forEach(function (c) { out[c.at.N] = c.at.V; });
    return out;
  }
  function visioSection(shape, name) {
    return xmlKids(shape, "Section").filter(function (s) { return s.at.N === name; })[0] || null;
  }

  function visioLook(shape, cells) {
    var look = {};
    if (cells.FillPattern !== "0" && colorHex(cells.FillForegnd)) { look.fill = colorHex(cells.FillForegnd); }
    if (cells.LinePattern !== "0" && colorHex(cells.LineColor)) { look.line = colorHex(cells.LineColor); }
    if (+cells.LinePattern > 1) { look.dash = true; }
    if (+cells.LineWeight >= 0.02) { look.weight = "thick"; }
    var chars = visioSection(shape, "Character");
    var row = chars && xmlKids(chars, "Row")[0];
    if (row) {
      var c = visioCells(row);
      if (colorHex(c.Color)) { look.text = colorHex(c.Color); }
      var bits = +c.Style || 0;
      if (bits & 1) { look.bold = true; }
      if (bits & 2) { look.italic = true; }
      if (bits & 4) { look.under = true; }
    }
    return look;
  }

  // A shape nobody named, told by the outline its geometry draws.
  function visioOutlineKind(shape, w, h) {
    var geo = visioSection(shape, "Geometry");
    if (!geo || !w || !h) { return ""; }
    var pts = [], curved = false, round = false;
    xmlKids(geo, "Row").forEach(function (r) {
      var c = visioCells(r), t = r.at.T || "";
      if (t === "Ellipse") { round = true; }
      if (/Arc|Spline|NURBS|Polyline/.test(t)) { curved = true; }
      if (/MoveTo|LineTo/.test(t) && c.X !== undefined) {
        var x = +c.X, y = +c.Y;
        if (/^Rel/.test(t)) { x *= w; y *= h; }
        pts.push([x / w, 1 - y / h]);
      }
    });
    if (round) { return "oval"; }
    if (curved) { return ""; }
    if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) {
      pts.pop();
    }
    return polygonKind(pts);
  }

  function visioPage(tree, masters) {
    var INCH = 96;                        // cells are in inches; the page is read in pixels
    var g = { nodes: [], links: [], placed: true, from: "Visio" };
    var nodes = {}, owner = {}, joins = {}, ink = {};
    function walk(list, dx, dy) {
      xmlKids(list, "Shape").forEach(function (sh) {
        var c = visioCells(sh), id = sh.at.ID;
        var name = (masters[sh.at.Master] || sh.at.NameU || sh.at.Name || "").replace(/\.\d+$/, "");
        var textEl = xmlKids(sh, "Text")[0];
        var words = flatWords(xmlWords(textEl));
        var w = +c.Width || 0, h = +c.Height || 0;
        var px = dx + (+c.PinX || 0), py = dy + (+c.PinY || 0);
        var oned = (c.BeginX !== undefined && c.EndX !== undefined) || /connector/i.test(name);
        if (oned) {
          joins[id] = { cells: c, words: words, dx: dx, dy: dy };
          return;
        }
        var inner = xmlKids(sh, "Shapes")[0];
        var kind = namedKind(name);
        // A group of parts with nothing of its own to say: the parts are
        // the shapes, placed from the group's own corner.
        if (sh.at.Type === "Group" && inner && !words && !kind) {
          walk(inner, px - (c.LocPinX !== undefined ? +c.LocPinX : w / 2),
                      py - (c.LocPinY !== undefined ? +c.LocPinY : h / 2));
          return;
        }
        if (!kind) { kind = visioOutlineKind(sh, w, h) || "rect"; }
        if (!words && inner) { words = flatWords(xmlAll(inner, "Text").map(xmlWords).join(" ")); }
        var node = { key: "v" + id, kind: kind, text: words, x: px * INCH, y: -py * INCH,
                     w: w * INCH, h: h * INCH, look: visioLook(sh, c) };
        g.nodes.push(node);
        nodes[id] = node;
        if (inner) {                      // arrows glued to a part are glued to the whole
          xmlAll(inner, "Shape").forEach(function (part) { owner[part.at.ID] = node; });
        }
      });
    }
    walk(xmlFirst(tree, "Shapes") || tree, 0, 0);
    var ends = {};
    xmlAll(tree, "Connect").forEach(function (c) {
      var j = c.at.FromSheet, to = nodes[c.at.ToSheet] || owner[c.at.ToSheet];
      if (!joins[j] || !to) { return; }
      ends[j] = ends[j] || {};
      if (/^Begin/i.test(c.at.FromCell)) { ends[j].a = to; }
      else if (/^End/i.test(c.at.FromCell)) { ends[j].b = to; }
    });
    Object.keys(joins).forEach(function (j) {
      var one = joins[j], c = one.cells, e = ends[j] || {};
      if (!e.a && c.BeginX !== undefined) {
        e.a = nearestNode(g.nodes, { x: (one.dx + +c.BeginX) * INCH, y: -(one.dy + +c.BeginY) * INCH }, 24);
      }
      if (!e.b && c.EndX !== undefined) {
        e.b = nearestNode(g.nodes, { x: (one.dx + +c.EndX) * INCH, y: -(one.dy + +c.EndY) * INCH }, 24);
      }
      if (!e.a || !e.b || e.a === e.b) { return; }
      var back = +c.BeginArrow > 0 && !(+c.EndArrow > 0);
      g.links.push({ from: (back ? e.b : e.a).key, to: (back ? e.a : e.b).key, label: one.words });
      var line = colorHex(c.LineColor);
      if (line) { ink[line] = (ink[line] || 0) + 1; }
    });
    g.ink = mostOf(ink);
    return g;
  }

  // ------------------------------------------------------------ GraphML --
  // yEd saves GraphML: <node>s and <edge>s, with yEd's own <y:ShapeNode> or
  // <y:GenericNode> inside each saying where it is, its colors, its words
  // and its shape -- com.yworks.flowchart.decision and the rest of the old
  // stencil.  GraphML from anywhere else is the bare nodes and edges, with
  // the words in a <data> whose key is called label or name.
  function isGraphml(text) { return /<graphml[\s>]/.test(String(text).slice(0, 3000)); }

  function graphmlLook(shape) {
    var look = {};
    var fill = xmlFirst(shape, "Fill"), border = xmlFirst(shape, "BorderStyle");
    var label = xmlFirst(shape, "NodeLabel");
    if (fill && fill.at.hasColor !== "false" && colorHex(fill.at.color)) { look.fill = colorHex(fill.at.color); }
    if (border && border.at.hasColor !== "false" && colorHex(border.at.color)) { look.line = colorHex(border.at.color); }
    if (border && /dash|dot/i.test(border.at.type || "")) { look.dash = true; }
    if (border && +border.at.width >= 2) { look.weight = "thick"; }
    if (label && colorHex(label.at.textColor)) { look.text = colorHex(label.at.textColor); }
    if (label && /bold/i.test(label.at.fontStyle || "")) { look.bold = true; }
    if (label && /italic/i.test(label.at.fontStyle || "")) { look.italic = true; }
    return look;
  }

  function graphmlGraph(text) {
    var tree = xmlTree(text), keys = {};
    xmlAll(tree, "key").forEach(function (k) {
      keys[k.at.id] = (k.at["attr.name"] || k.at["yfiles.type"] || "").toLowerCase();
    });
    function dataWords(el) {
      var words = "";
      xmlKids(el, "data").forEach(function (d) {
        var k = keys[d.at.key] || String(d.at.key || "").toLowerCase();
        if (!words && /label|name|text|description|title/.test(k) && !xmlKids(d).length) {
          words = xmlWords(d);
        }
      });
      return flatWords(words);
    }
    var g = { nodes: [], links: [], placed: true, from: "GraphML" }, known = {}, ink = {};
    xmlAll(tree, "node").forEach(function (nd) {
      if (xmlKids(nd, "graph").length) { return; }   // a group: its own nodes are the steps
      var shape = xmlFirst(nd, "ShapeNode") || xmlFirst(nd, "GenericNode") ||
                  xmlFirst(nd, "SVGNode") || xmlFirst(nd, "ImageNode");
      var node = { key: nd.at.id, kind: "rect", text: "", look: {} };
      if (shape) {
        var geo = xmlFirst(shape, "Geometry");
        node.text = flatWords(xmlKids(shape, "NodeLabel").map(xmlWords).join(" "));
        var form = xmlFirst(shape, "Shape");
        node.kind = namedKind((form && form.at.type) || shape.at.configuration || "") || "rect";
        node.look = graphmlLook(shape);
        if (geo) {
          node.w = +geo.at.width || 0;
          node.h = +geo.at.height || 0;
          node.x = (+geo.at.x || 0) + node.w / 2;
          node.y = (+geo.at.y || 0) + node.h / 2;
        }
      }
      if (!node.text) { node.text = dataWords(nd) || (shape ? "" : nd.at.id); }
      if (!isFinite(node.x)) { g.placed = false; }
      g.nodes.push(node);
      known[nd.at.id] = node;
    });
    xmlAll(tree, "edge").forEach(function (e) {
      var a = known[e.at.source], b = known[e.at.target];
      if (!a || !b || a === b) { return; }
      var label = flatWords(xmlAll(e, "EdgeLabel").map(xmlWords).join(" ")) || dataWords(e);
      var heads = xmlFirst(e, "Arrows");
      var back = heads && heads.at.target === "none" && heads.at.source && heads.at.source !== "none";
      g.links.push({ from: (back ? b : a).key, to: (back ? a : b).key, label: label });
      var line = xmlFirst(e, "LineStyle");
      if (line && colorHex(line.at.color)) { ink[colorHex(line.at.color)] = (ink[colorHex(line.at.color)] || 0) + 1; }
    });
    g.ink = mostOf(ink);
    return g;
  }

  // ------------------------------------------------------------ Graphviz --
  // A .dot or .gv file: nodes, and edges written a -> b -> c, each with a
  // list of [attributes] -- its shape, label and colors -- and defaults set
  // for everything after them by node [...] and edge [...].  There is no
  // layout in it; Graphviz works that out when it draws, and so does this.
  function isDot(text) {
    return /^\s*(\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*|#[^\n]*\n\s*)*(strict\s+)?(di)?graph\b[^{\n;]*\{/i
      .test(String(text).slice(0, 3000));
  }

  function dotTokens(text) {
    var s = String(text), at = 0, n = s.length, out = [];
    while (at < n) {
      var c = s.charAt(at);
      if (/\s/.test(c)) { at++; continue; }
      if ((c === "/" && s.charAt(at + 1) === "/") ||
          (c === "#" && (at === 0 || s.charAt(at - 1) === "\n"))) {
        var eol = s.indexOf("\n", at);
        at = eol < 0 ? n : eol;
        continue;
      }
      if (c === "/" && s.charAt(at + 1) === "*") {
        var shut = s.indexOf("*/", at + 2);
        at = shut < 0 ? n : shut + 2;
        continue;
      }
      if (c === "-" && (s.charAt(at + 1) === ">" || s.charAt(at + 1) === "-")) {
        out.push({ op: s.substr(at, 2) });
        at += 2;
        continue;
      }
      if ("{}[];,=:".indexOf(c) >= 0) { out.push({ op: c }); at++; continue; }
      if (c === '"') {                    // "quoted", and "joined" + "like this"
        var val = "", j = at;
        while (s.charAt(j) === '"') {
          j++;
          while (j < n && s.charAt(j) !== '"') {
            if (s.charAt(j) === "\\" && j + 1 < n) {
              var nx = s.charAt(j + 1);
              val += nx === '"' ? '"' : nx === "\n" ? "" : "\\" + nx;
              j += 2;
              continue;
            }
            val += s.charAt(j++);
          }
          j++;
          var k = j;
          while (k < n && /\s/.test(s.charAt(k))) { k++; }
          if (s.charAt(k) !== "+") { break; }
          k++;
          while (k < n && /\s/.test(s.charAt(k))) { k++; }
          if (s.charAt(k) !== '"') { break; }
          j = k;
        }
        at = j;
        out.push({ id: val, quoted: true });
        continue;
      }
      if (c === "<") {                    // an HTML label: <...> with <...> inside
        var deep = 0, e = at;
        for (; e < n; e++) {
          if (s.charAt(e) === "<") { deep++; }
          else if (s.charAt(e) === ">" && !--deep) { break; }
        }
        out.push({ id: s.slice(at + 1, e), html: true });
        at = e + 1;
        continue;
      }
      var m = /^(-?(?:\.\d+|\d+(?:\.\d*)?)|[A-Za-z_\u0080-\uffff][\w\u0080-\uffff]*)/.exec(s.slice(at, at + 400));
      if (m) { out.push({ id: m[0] }); at += m[0].length; continue; }
      at++;
    }
    return out;
  }

  var DOT_KINDS = {
    box: "rect", rect: "rect", rectangle: "rect", square: "rect", record: "rect",
    mrecord: "roundrect", ellipse: "oval", oval: "oval", egg: "oval",
    circle: "circle", doublecircle: "circle", point: "circle", mcircle: "circle",
    diamond: "diamond", mdiamond: "diamond", parallelogram: "io",
    hexagon: "hex", octagon: "hex", doubleoctagon: "hex", tripleoctagon: "hex",
    trapezium: "trap", invtrapezium: "trap", house: "offpage", invhouse: "offpage",
    cylinder: "store", note: "note", tab: "doc", folder: "doc", box3d: "cube",
    component: "sub", cds: "arrow", rarrow: "arrow", larrow: "arrow",
    plaintext: "text", plain: "text", none: "text", underline: "text" };
  var R_ENDS_WORDS = /^(start|begin|end|stop|finish|done|exit|halt)\b/i;

  function dotGraph(text) {
    var t = dotTokens(text), i = 0;
    function tok(k) { return t[i + (k || 0)] || {}; }
    function isOp(one, op) { return one.op === op; }
    while (i < t.length && !isOp(tok(), "{")) { i++; }
    if (!isOp(tok(), "{")) { return null; }
    i++;
    var known = {}, list = [], edges = [], top = {};
    function attrs() {                    // [a=b, c=d][e=f]
      var out = {};
      while (isOp(tok(), "[")) {
        i++;
        while (i < t.length && !isOp(tok(), "]")) {
          var key = tok().id;
          i++;
          if (isOp(tok(), "=")) { i++; if (key !== undefined) { out[String(key).toLowerCase()] = tok(); } i++; }
          else if (key !== undefined) { out[String(key).toLowerCase()] = { id: "true" }; }
          if (isOp(tok(), ",") || isOp(tok(), ";")) { i++; }
        }
        i++;
      }
      return out;
    }
    function named(id, defaults) {
      var one = known[id];
      if (!one) {
        one = known[id] = { key: id, at: Object.assign({}, defaults) };
        list.push(one);
      }
      return one;
    }
    function statements(outer, depth) {   // -> the nodes named in it
      var mine = [];
      var def = { node: Object.assign({}, outer.node), edge: Object.assign({}, outer.edge) };
      function end() {                    // one end of an edge: a node, or a { group }
        var one = tok(), word = String(one.id || "").toLowerCase();
        if (isOp(one, "{") || (word === "subgraph" && !one.quoted)) {
          if (!isOp(one, "{")) { i++; if (!isOp(tok(), "{")) { i++; } }
          if (!isOp(tok(), "{")) { return null; }
          i++;
          var inside = depth < 40 ? statements(def, depth + 1) : [];
          mine.push.apply(mine, inside);
          return { nodes: inside };
        }
        if (one.id === undefined) { return null; }
        i++;
        while (isOp(tok(), ":")) { i += 2; }   // a port on the node: the same node
        var node = named(one.id, def.node);
        mine.push(node);
        return { nodes: [node], single: true };
      }
      while (i < t.length && !isOp(tok(), "}")) {
        var one = tok(), word = String(one.id || "").toLowerCase();
        if (isOp(one, ";") || isOp(one, ",")) { i++; continue; }
        if (!one.quoted && /^(node|edge|graph)$/.test(word) && isOp(tok(1), "[")) {
          i++;
          var set = attrs();
          if (word === "graph") { if (!depth) { Object.assign(top, set); } }
          else { Object.assign(def[word], set); }
          continue;
        }
        if (one.id !== undefined && isOp(tok(1), "=")) {
          if (!depth) { top[word] = tok(2); }
          i += 3;
          continue;
        }
        var left = end();
        if (!left) { i++; continue; }
        var chain = [left];
        while (isOp(tok(), "->") || isOp(tok(), "--")) {
          i++;
          var right = end();
          if (!right) { break; }
          chain.push(right);
        }
        var said = attrs();
        if (chain.length === 1) {
          if (left.single) { Object.assign(left.nodes[0].at, said); }
          continue;
        }
        for (var k = 0; k + 1 < chain.length; k++) {
          chain[k].nodes.forEach(function (a) {
            chain[k + 1].nodes.forEach(function (b) {
              edges.push({ a: a, b: b, at: Object.assign({}, def.edge, said) });
            });
          });
        }
      }
      i++;
      return mine;
    }
    statements({ node: {}, edge: {} }, 0);
    function val(one) { return one ? String(one.id === undefined ? "" : one.id) : ""; }
    function words(one, id) {
      if (!one) { return id; }
      var s = one.html ? htmlWords(one.id) : val(one);
      return s.replace(/\\N/g, id).replace(/\\[nlr]/g, " ").replace(/\\(.)/g, "$1");
    }
    function first(color) { return colorHex(val(color).split(":")[0].split(";")[0]); }
    var g = { nodes: [], links: [], placed: false, from: "Graphviz",
              paper: first(top.bgcolor) }, ink = {};
    list.forEach(function (one) {
      var at = one.at, shape = val(at.shape).toLowerCase(), styles = val(at.style).toLowerCase();
      var text = flatWords(words(at.label, one.key));
      var kind = DOT_KINDS[shape] || (shape ? "rect" : "");
      if (!kind || kind === "oval") {
        // Graphviz draws everything as an oval unless told otherwise; here
        // an oval means the start or the end, so only those stay one.
        kind = R_ENDS_WORDS.test(text) ? "oval" : kind === "oval" && !shape ? "rect" : kind || "rect";
      }
      if (kind === "rect" && /rounded/.test(styles)) { kind = "roundrect"; }
      var look = {};
      var fill = first(at.fillcolor) || (/filled/.test(styles) ? first(at.color) : "");
      if (fill) { look.fill = fill; }
      if (first(at.color)) { look.line = first(at.color); }
      if (first(at.fontcolor)) { look.text = first(at.fontcolor); }
      if (/dashed|dotted/.test(styles)) { look.dash = true; }
      if (/bold/.test(styles) || +val(at.penwidth) >= 2) { look.weight = "thick"; }
      g.nodes.push({ key: one.key, kind: kind, text: text, look: look });
    });
    edges.forEach(function (e) {
      var back = /^back$/i.test(val(e.at.dir));
      g.links.push({ from: (back ? e.b : e.a).key, to: (back ? e.a : e.b).key,
                     label: flatWords(words(e.at.label || e.at.xlabel, "")) });
      var line = first(e.at.color);
      if (line) { ink[line] = (ink[line] || 0) + 1; }
    });
    g.ink = mostOf(ink);
    return g;
  }

  // ------------------------------------------------------------ PlantUML --
  // A PlantUML activity diagram is written the way a program is -- start,
  // :a step;, if (...) then (yes) ... else (no) ... endif, while, repeat,
  // switch, stop -- so it is read into blocks first, and the blocks are
  // laid down as shapes and arrows the way the chart of a program is.
  // A step can carry a color of its own: #pink:Mix the batter;
  function isPlantuml(text) {
    return /^\s*@start(uml|activity)\b/im.test(String(text).slice(0, 2000));
  }

  var R_ASKS_TELLS = /^(input|read|get|enter|ask|prompt|display|print|output|write|show|say|tell)\b/i;

  // A line in words and (bracketed parts), the brackets matched so that a
  // test with brackets of its own -- if (len(s) > 3) then (yes) -- is one
  // part: ["if", "(len(s) > 3)", "then", "(yes)"].
  function umlParts(line) {
    var out = [], i = 0, s = String(line);
    while (i < s.length) {
      var c = s.charAt(i);
      if (/\s/.test(c)) { i++; continue; }
      if (c === "(") {
        var deep = 0, j = i;
        for (; j < s.length; j++) {
          if (s.charAt(j) === "(") { deep++; }
          else if (s.charAt(j) === ")" && !--deep) { break; }
        }
        out.push({ said: s.slice(i + 1, j) });
        i = j + 1;
        continue;
      }
      var m = /^[^\s(]+/.exec(s.slice(i));
      out.push({ word: m[0].toLowerCase() });
      i += m[0].length;
    }
    return out;
  }
  // The bracketed part after a word, in a line read by umlParts: "yes" for
  // "then" in if (...) then (yes).
  function umlAfter(parts, word) {
    for (var k = 0; k + 1 < parts.length; k++) {
      if (parts[k].word === word && parts[k + 1].said !== undefined) { return parts[k + 1].said; }
    }
    return "";
  }
  function umlFirst(parts) {
    for (var k = 0; k < parts.length; k++) { if (parts[k].said !== undefined) { return parts[k].said; } }
    return "";
  }

  function umlBlocks(text) {
    var lines = String(text).replace(/\r\n?/g, "\n").split("\n");
    var root = [], stack = [{ list: root, block: null }], title = "";
    function list() { return stack[stack.length - 1].list; }
    function block() { return stack[stack.length - 1].block; }
    function popTo(type) {
      for (var k = stack.length - 1; k > 0; k--) {
        if (stack[k].block && stack[k].block.t === type) { stack.length = k; return; }
      }
    }
    function inner(s) { return flatWords(String(s || "").replace(/<[^>]+>/g, "").replace(/\\n/g, " ")); }
    var quiet = false;
    for (var k = 0; k < lines.length; k++) {
      var line = lines[k].trim(), m;
      if (quiet) { if (/'\/\s*$/.test(line)) { quiet = false; } continue; }
      if (/^\/'/.test(line)) { if (!/'\/\s*$/.test(line)) { quiet = true; } continue; }
      if (!line || /^'/.test(line) || /^@(start|end)/i.test(line)) { continue; }
      if ((m = /^(#[^:]*)?:([\s\S]*)$/.exec(line))) {
        var said = m[2], j = k;
        while (!/[;|<>\/\]}]\s*$/.test(said) && j + 1 < lines.length) {
          j++;
          said += " " + lines[j].trim();
        }
        k = j;
        var mark = said.replace(/\s+$/, "").slice(-1);
        var color = m[1] ? colorHex(m[1].slice(1).split(/[\/\\|-]/)[0]) : "";
        list().push({ t: "act", text: inner(said.replace(/\s*[;|<>\/\]}]\s*$/, "")), mark: mark, color: color });
        continue;
      }
      if (/^start$/i.test(line)) { list().push({ t: "start" }); continue; }
      if (/^(stop|end)$/i.test(line)) { list().push({ t: "stop" }); continue; }
      if (/^(kill|detach)$/i.test(line)) { list().push({ t: "kill" }); continue; }
      if (/^break$/i.test(line)) { list().push({ t: "break" }); continue; }
      if ((m = /^-+(?:\[[^\]]*\])?-*>\s*(.*?);?\s*$/.exec(line))) {
        list().push({ t: "say", text: inner(m[1]) });
        continue;
      }
      var parts = /^(if|else|elseif|end|while|endwhile|repeat|switch|case)\b/i.test(line) ? umlParts(line) : [];
      if (/^if\s*\(/i.test(line)) {
        var b = { t: "if", ways: [{ cond: inner(umlFirst(parts)), body: [],
                                    label: inner(umlAfter(parts, "then") || umlAfter(parts, "is") ||
                                                 umlAfter(parts, "equals")) }],
                  other: null, otherLabel: "" };
        list().push(b);
        stack.push({ list: b.ways[0].body, block: b });
        continue;
      }
      if (/^else\s*if\s*\(/i.test(line) && block() && block().t === "if") {
        var way = { cond: inner(umlFirst(parts)), body: [],
                    label: inner(umlAfter(parts, "then") || umlAfter(parts, "is") || umlAfter(parts, "equals")) };
        block().ways.push(way);
        stack[stack.length - 1].list = way.body;
        continue;
      }
      if (/^else\b/i.test(line) && block() && block().t === "if") {
        block().other = [];
        block().otherLabel = inner(umlFirst(parts));
        stack[stack.length - 1].list = block().other;
        continue;
      }
      if (/^end\s*if\b/i.test(line)) { popTo("if"); continue; }
      if (/^while\s*\(/i.test(line)) {
        var w = { t: "while", cond: inner(umlFirst(parts)), yes: inner(umlAfter(parts, "is")), no: "", body: [] };
        list().push(w);
        stack.push({ list: w.body, block: w });
        continue;
      }
      if (/^end\s*while\b/i.test(line)) {
        for (var s1 = stack.length - 1; s1 > 0; s1--) {
          if (stack[s1].block && stack[s1].block.t === "while") { stack[s1].block.no = inner(umlFirst(parts)); break; }
        }
        popTo("while");
        continue;
      }
      if (/^repeat\s*while\b/i.test(line)) {
        for (var s2 = stack.length - 1; s2 > 0; s2--) {
          var rb = stack[s2].block;
          if (rb && rb.t === "repeat") {
            rb.cond = inner(umlFirst(parts));
            rb.yes = inner(umlAfter(parts, "is"));
            rb.no = inner(umlAfter(parts, "not"));
            break;
          }
        }
        popTo("repeat");
        continue;
      }
      if ((m = /^repeat\b\s*(?::(.*?)[;|<>\/\]}]?\s*)?$/i.exec(line))) {
        var r = { t: "repeat", cond: "", yes: "", no: "", body: [] };
        list().push(r);
        if (m[1]) { r.body.push({ t: "act", text: inner(m[1]), mark: ";", color: "" }); }
        stack.push({ list: r.body, block: r });
        continue;
      }
      if (/^backward\b/i.test(line)) { continue; }
      if (/^switch\s*\(/i.test(line)) {
        var sw = { t: "switch", expr: inner(umlFirst(parts)), cases: [] };
        list().push(sw);
        stack.push({ list: [], block: sw });
        continue;
      }
      if (/^case\s*\(/i.test(line) && block() && block().t === "switch") {
        var cs = { label: inner(umlFirst(parts)), body: [] };
        block().cases.push(cs);
        stack[stack.length - 1].list = cs.body;
        continue;
      }
      if (/^end\s*switch\b/i.test(line)) { popTo("switch"); continue; }
      if ((m = /^(fork|split)(\s+again)?\s*$/i.exec(line))) {
        if (m[2] && block() && block().t === "fork") {
          var more = [];
          block().ways.push(more);
          stack[stack.length - 1].list = more;
        } else if (!m[2]) {
          var f = { t: "fork", ways: [[]] };
          list().push(f);
          stack.push({ list: f.ways[0], block: f });
        }
        continue;
      }
      if (/^end\s*(fork|split|merge)\b/i.test(line)) { popTo("fork"); continue; }
      if ((m = /^title\s+(.+)$/i.exec(line))) { title = inner(m[1]); continue; }
      if (/^(floating\s+)?note\b/i.test(line) && !/:/.test(line)) {
        while (k + 1 < lines.length && !/^end\s*note\b/i.test(lines[k + 1].trim())) { k++; }
        k++;
        continue;
      }
      if (/^(legend|header|footer)\b/i.test(line) && !/:/.test(line)) {
        var until = new RegExp("^end\\s*" + line.split(/\s/)[0], "i");
        while (k + 1 < lines.length && !until.test(lines[k + 1].trim())) { k++; }
        k++;
        continue;
      }
      if (/^skinparam\b.*\{\s*$/i.test(line)) {
        while (k + 1 < lines.length && !/^\}/.test(lines[k + 1].trim())) { k++; }
        k++;
        continue;
      }
      // Anything else -- partitions and lanes, notes on one line, settings,
      // the old (*) --> "step" way of writing -- is stepped over.
    }
    return { list: root, title: title };
  }

  function umlGraph(text) {
    var read = umlBlocks(text);
    var yn = yesNoWords();
    var g = { nodes: [], links: [], placed: false, from: "PlantUML", title: read.title };
    var made = 0, pending = "", breaks = [];
    function shape(kind, words, look) {
      var key = "u" + (++made);
      g.nodes.push({ key: key, kind: kind, text: words, look: look || {} });
      return key;
    }
    function into(ins, to) {
      ins.forEach(function (w) { g.links.push({ from: w[0], to: to, label: w[1] || pending }); });
      pending = "";
    }
    function run(items, ins) {
      items.forEach(function (it) {
        if (!ins) { return; }
        switch (it.t) {
          case "start": var s = shape("oval", TXT.start || "Start"); into(ins, s); ins = [[s, ""]]; break;
          case "stop": into(ins, shape("oval", TXT.end || "End")); ins = []; break;
          case "kill": ins = []; break;
          case "break": if (breaks.length) { breaks[breaks.length - 1] = breaks[breaks.length - 1].concat(ins); } ins = []; break;
          case "say": pending = it.text; break;
          case "act":
            var kind = /[<>\/]/.test(it.mark) ? "io" : it.mark === "]" ? "doc"
                     : R_ASKS_TELLS.test(it.text) ? "io" : "rect";
            var a = shape(kind, it.text, it.color ? { fill: it.color } : null);
            into(ins, a);
            ins = [[a, ""]];
            break;
          case "if":
            var outs = [], last = null;
            it.ways.forEach(function (way, k) {
              var d = shape("diamond", way.cond);
              into(k ? [[last, ""]] : ins, d);
              outs = outs.concat(run(way.body, [[d, way.label || yn[0]]]));
              last = d;
            });
            ins = outs.concat(it.other ? run(it.other, [[last, it.otherLabel || yn[1]]])
                                       : [[last, it.otherLabel || yn[1]]]);
            break;
          case "while":
            var wd = shape("diamond", it.cond);
            into(ins, wd);
            breaks.push([]);
            into(run(it.body, [[wd, it.yes || yn[0]]]), wd);
            ins = [[wd, it.no || yn[1]]].concat(breaks.pop());
            break;
          case "repeat":
            var rd = shape("diamond", it.cond);
            breaks.push([]);
            into(run(it.body, ins.concat([[rd, it.yes || yn[0]]])), rd);
            ins = [[rd, it.no || yn[1]]].concat(breaks.pop());
            break;
          case "switch":
            var sd = shape("diamond", it.expr), all = [];
            into(ins, sd);
            it.cases.forEach(function (c) { all = all.concat(run(c.body, [[sd, c.label]])); });
            ins = all;
            break;
          case "fork":
            var from = ins, joined = [];
            it.ways.forEach(function (way) { joined = joined.concat(run(way, from)); });
            ins = joined;
            break;
        }
      });
      return ins || [];
    }
    run(read.list, []);
    return g;
  }

  // The two words the chart's decisions are labelled with (Chart options).
  function yesNoWords() {
    var plain = typeof decideNow === "function" && decideNow() === "yn";
    return plain ? [TXT.yes_plain || "Yes", TXT.no_plain || "No"] : [TXT.yes || "True", TXT.no || "False"];
  }

  // ------------------------------------------------ a Lucidchart CSV --
  // Lucidchart's "Export as CSV of shape data": a row for each shape and
  // each line, the line's rows saying which shapes it runs between.  No
  // places or colors are in it, so it is laid out here.
  function csvRows(text) {
    var rows = [], row = [], cell = "", quoted = false, s = String(text);
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (quoted) {
        if (c === '"') {
          if (s.charAt(i + 1) === '"') { cell += '"'; i++; } else { quoted = false; }
        } else { cell += c; }
        continue;
      }
      if (c === '"') { quoted = true; continue; }
      if (c === ",") { row.push(cell); cell = ""; continue; }
      if (c === "\n" || c === "\r") {
        if (c === "\r" && s.charAt(i + 1) === "\n") { i++; }
        row.push(cell); rows.push(row); row = []; cell = "";
        continue;
      }
      cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  function isLucidCsv(text) {
    var head = String(text).slice(0, 800).split(/\r?\n/)[0].toLowerCase();
    return head.indexOf("line source") >= 0 && head.indexOf("line destination") >= 0;
  }
  function lucidGraph(text) {
    var rows = csvRows(text);
    var head = (rows.shift() || []).map(function (h) { return h.trim().toLowerCase(); });
    function col(name) { return head.indexOf(name); }
    var cId = col("id"), cName = col("name"), cSrc = col("line source"), cDst = col("line destination");
    var cSA = col("source arrow"), cDA = col("destination arrow");
    var texts = head.map(function (h, k) { return /^text area \d+$/.test(h) ? k : -1; })
                    .filter(function (k) { return k >= 0; });
    var g = { nodes: [], links: [], placed: false, from: "Lucidchart" }, known = {}, lines = [];
    rows.forEach(function (r) {
      if (r.length < 2) { return; }
      var name = String(r[cName] || "").trim();
      var words = flatWords(texts.map(function (k) { return r[k] || ""; }).join(" "));
      if (/^(page|document)$/i.test(name)) { return; }
      if (/^line$/i.test(name) || r[cSrc] || r[cDst]) { lines.push({ r: r, words: words }); return; }
      var node = { key: String(r[cId]), kind: namedKind(name) || "rect", text: words };
      g.nodes.push(node);
      known[node.key] = node;
    });
    lines.forEach(function (one) {
      var r = one.r, a = known[r[cSrc]], b = known[r[cDst]];
      if (!a || !b || a === b) { return; }
      var tail = String(r[cSA] || ""), head2 = String(r[cDA] || "");
      var back = tail && !/none/i.test(tail) && (!head2 || /none/i.test(head2));
      g.links.push({ from: (back ? b : a).key, to: (back ? a : b).key, label: one.words });
    });
    return g;
  }

  // --------------------------------------------------------- Flowgorithm --
  // A .fprg is a program kept as XML: a <function> for Main and for each of
  // the rest, each a list of statements -- declare, assign, output, input,
  // if, while, for, do, call.  They are the statements the pseudocode here
  // has, so it is written out as pseudocode, to be built and run.
  // Flowgorithm joins words with &, which here is +.
  function isFlowgorithm(text) { return /<flowgorithm[\s>]/.test(String(text).slice(0, 2000)); }

  function fprgSum(e) {
    return String(e || "").split(/("[^"]*"|'[^']*')/).map(function (part, k) {
      return k % 2 ? part : part.replace(/&&/g, "\u0000").replace(/&/g, "+").replace(/\u0000/g, "&&");
    }).join("").trim();
  }

  function fprgPseudo(text) {
    var top = xmlFirst(xmlTree(text), "flowgorithm");
    if (!top) { return null; }
    var out = [], deep = 0;
    function put(s) { out.push(new Array(deep + 1).join("    ") + s); }
    function block(body) {
      xmlKids(body).forEach(function (st) {
        var a = st.at;
        switch (xmlLocal(st.tag)) {
          case "body": block(st); break;
          case "declare":
            String(a.name || "").split(",").forEach(function (name) {
              name = name.trim();
              if (name) {
                put("Declare " + (a.type || "") + " " + name +
                    (/^true$/i.test(a.array || "") ? "[" + fprgSum(a.size) + "]" : ""));
              }
            });
            break;
          case "assign": put(a.variable + " = " + fprgSum(a.expression)); break;
          case "output": put("Display " + fprgSum(a.expression)); break;
          case "input": put("Input " + a.variable); break;
          case "call": put("Call " + fprgSum(a.expression)); break;
          case "comment": put("// " + flatWords(a.text)); break;
          case "if":
            put("If " + fprgSum(a.expression) + " Then");
            deep++; block(xmlKids(st, "then")[0]); deep--;
            var other = xmlKids(st, "else")[0];
            if (other && xmlKids(other).length) { put("Else"); deep++; block(other); deep--; }
            put("End If");
            break;
          case "while":
            put("While " + fprgSum(a.expression));
            deep++; block(st); deep--;
            put("End While");
            break;
          case "for":
            var step = fprgSum(a.step || "1");
            if (/^dec/i.test(a.direction || "")) { step = /^[\d.]+$/.test(step) ? "-" + step : "-(" + step + ")"; }
            put("For " + a.variable + " = " + fprgSum(a.start) + " To " + fprgSum(a.end) +
                (step === "1" ? "" : " Step " + step));
            deep++; block(st); deep--;
            put("End For");
            break;
          case "do":
            put("Do");
            deep++; block(st); deep--;
            put("Loop While " + fprgSum(a.expression));
            break;
        }
      });
    }
    var fns = xmlKids(top, "function");
    var main = fns.filter(function (f) { return /^main$/i.test(f.at.name || ""); })[0] || fns[0];
    if (!main) { return null; }
    function params(f) {
      return xmlAll(f, "parameter").map(function (p) {
        return (p.at.type ? p.at.type + " " : "") + p.at.name + (/^true$/i.test(p.at.array || "") ? "[]" : "");
      }).join(", ");
    }
    put("Start");
    block(xmlKids(main, "body")[0] || main);
    put("Stop");
    fns.forEach(function (f) {
      if (f === main) { return; }
      var gives = f.at.type && !/^none$/i.test(f.at.type);
      out.push("");
      put((gives ? "Function " + f.at.type + " " : "Module ") + f.at.name + "(" + params(f) + ")");
      deep++;
      block(xmlKids(f, "body")[0] || f);
      if (gives && f.at.variable) { put("Return " + f.at.variable); }
      deep--;
      put(gives ? "End Function" : "End Module");
    });
    return out.join("\n") + "\n";
  }

  // ------------------------------------------------ Mermaid in Markdown --
  // A README with a flowchart in it: the first ```mermaid block that is one.
  function mermaidInMarkdown(text) {
    var re = /^[ \t]*(\x60\x60\x60|~~~)[ \t]*mermaid[^\n]*\n([\s\S]*?)^[ \t]*\1/gm, m;
    while ((m = re.exec(String(text)))) {
      if (isMermaid(m[2])) { return m[2]; }
    }
    return null;
  }

  // --------------------------------------------------- which one is it --
  // What a file of words is, told by its name and then by what it says, so a
  // drawing saved with the wrong ending, or pasted into a .txt, still opens.
  function drawnIn(name, text) {
    var s = String(text || ""), low = String(name || "").toLowerCase();
    if (/\.(drawio|dio)$/.test(low) || isDrawio(s)) { return "drawio"; }
    if (/\.excalidraw$/.test(low) || isExcalidraw(s)) { return "excalidraw"; }
    if (/\.graphml$/.test(low) || isGraphml(s)) { return "graphml"; }
    if (/\.fprg$/.test(low) || isFlowgorithm(s)) { return "flowgorithm"; }
    if (/\.(puml|plantuml|pu|iuml|wsd)$/.test(low) || isPlantuml(s)) { return "plantuml"; }
    if (/\.(mmd|mermaid)$/.test(low) || isMermaid(s)) { return "mermaid"; }
    if (/\.(gv|dot)$/.test(low) || isDot(s)) { return "dot"; }
    if (isLucidCsv(s)) { return "lucid"; }
    if (/\.svg$/.test(low) || /^\s*(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(s.slice(0, 3000))) {
      return "svg";
    }
    if (/\.(md|markdown)$/.test(low) && mermaidInMarkdown(s)) { return "markdown"; }
    return "";
  }

  // The words of a file of that kind, read into a graph.
  function graphOf(kind, text) {         // -> Promise of a graph, or of null
    try {
      switch (kind) {
        case "drawio":
          return drawioModels(text).then(function (models) {
            for (var i = 0; i < models.length; i++) {
              var g = drawioGraph(models[i]);
              if (g.nodes.length) { return g; }
            }
            return null;
          });
        case "excalidraw":
          return excalidrawScene(text).then(function (scene) { return scene ? excalidrawGraph(scene) : null; });
        case "graphml": return Promise.resolve(graphmlGraph(text));
        case "plantuml": return Promise.resolve(umlGraph(text));
        case "dot": return Promise.resolve(dotGraph(text));
        case "lucid": return Promise.resolve(lucidGraph(text));
      }
    } catch (e) {
      return Promise.resolve(null);
    }
    return Promise.resolve(null);
  }

  // ====================================================== graph -> drawing ==
  // The graph made tidy before it is drawn: its words one line each, arrows
  // that join nothing dropped, a word standing loose beside an arrow put on
  // the arrow (draw.io and Excalidraw drawings are often labelled that way),
  // and a decision with one answer written on its two arrows given the
  // other.
  function graphCleaned(graph) {
    var g = { nodes: [], links: [], placed: !!graph.placed, paper: graph.paper || "",
              ink: graph.ink || "", face: graph.face || "", title: graph.title || "",
              from: graph.from || "" }, byKey = {};
    (graph.nodes || []).forEach(function (n) {
      if (!n || !n.kind || byKey[String(n.key)]) { return; }
      var one = { key: String(n.key), kind: ROOM[n.kind] ? n.kind : "rect",
                  text: flatWords(n.text), look: n.look || {},
                  x: +n.x, y: +n.y, w: Math.abs(+n.w) || 0, h: Math.abs(+n.h) || 0 };
      if (one.kind === "text" && !one.text) { return; }
      if (one.kind === "oval" && !one.text) { one.kind = "circle"; }   // a join, not an end
      if (!isFinite(one.x) || !isFinite(one.y)) { g.placed = false; }
      byKey[one.key] = one;
      g.nodes.push(one);
    });
    var seen = {};
    (graph.links || []).forEach(function (l) {
      var a = byKey[String(l.from)], b = byKey[String(l.to)];
      if (!a || !b || a === b) { return; }
      var label = flatWords(l.label), sign = a.key + "\u0000" + b.key + "\u0000" + label;
      if (seen[sign]) { return; }
      seen[sign] = true;
      g.links.push({ from: a.key, to: b.key, label: label, pts: l.pts || null });
    });
    if (g.placed) {
      var linked = {};
      g.links.forEach(function (l) { linked[l.from] = linked[l.to] = true; });
      g.nodes = g.nodes.filter(function (n) {
        if (n.kind !== "text" || linked[n.key] || n.text.length > 30) { return true; }
        var best = null, bestD = Infinity;
        g.links.forEach(function (l) {
          var path = l.pts && l.pts.length > 1 ? l.pts
                   : [{ x: byKey[l.from].x, y: byKey[l.from].y }, { x: byKey[l.to].x, y: byKey[l.to].y }];
          var d = pathGap({ x: n.x, y: n.y }, path);
          if (d < bestD) { bestD = d; best = l; }
        });
        if (best && !best.label && bestD <= Math.max(40, (n.h || 20) * 2)) {
          best.label = n.text;
          return false;
        }
        return true;
      });
    }
    var yn = yesNoWords();
    g.nodes.forEach(function (n) {
      if (n.kind !== "diamond") { return; }
      var outs = g.links.filter(function (l) { return l.from === n.key; });
      if (outs.length !== 2) { return; }
      var bare = outs.filter(function (l) { return !l.label; });
      var worded = outs.filter(function (l) { return l.label; })[0];
      if (bare.length !== 1 || !worded) { return; }
      var plain = /^(y|yes|n|no)$/i.test(worded.label);
      if (answerYes(worded.label)) { bare[0].label = plain ? (TXT.no_plain || "No") : yn[1]; }
      else if (answerNo(worded.label)) { bare[0].label = plain ? (TXT.yes_plain || "Yes") : yn[0]; }
    });
    return g;
  }
  function answerYes(word) {
    return typeof isYes === "function" ? isYes(word) : /^(y|yes|true|t|1)$/i.test(String(word).trim());
  }
  function answerNo(word) {
    return typeof isNo === "function" ? isNo(word) : /^(n|no|false|f|0)$/i.test(String(word).trim());
  }

  // How far a spot is from a path of straight lines.
  function pathGap(p, path) {
    var best = Infinity;
    for (var i = 0; i + 1 < path.length; i++) {
      var a = path[i], b = path[i + 1], dx = b.x - a.x, dy = b.y - a.y;
      var len = dx * dx + dy * dy;
      var t = len ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len)) : 0;
      var x = a.x + t * dx - p.x, y = a.y + t * dy - p.y;
      best = Math.min(best, Math.sqrt(x * x + y * y));
    }
    return best;
  }

  // Colored at all: a fill that is not white, a line or words not black or
  // gray.  A drawing nobody colored takes the palette chosen here; one that
  // was colored keeps its own colors, shape by shape.
  function graphColored(g) {
    return (g.paper && !plainPaper(g.paper)) || g.nodes.some(function (n) {
      var L = n.look || {};
      return (L.fill && !plainPaper(L.fill)) || (L.line && !plainInk(L.line)) ||
             (L.text && !plainInk(L.text));
    });
  }

  function middleOf(list) {
    if (!list.length) { return 0; }
    var s = list.slice().sort(function (a, b) { return a - b; });
    return s[Math.floor(s.length / 2)];
  }
  function onGrid(v) { return Math.round(v / (HAND_GRID * 2)) * (HAND_GRID * 2); }

  // Where they were put, kept: the whole drawing scaled until shapes the
  // size they are here -- sized to their words -- have the room between
  // them they had there.
  function graphKeepsPlaces(nodes, src) {
    var ws = [], hs = [];
    nodes.forEach(function (n, k) {
      var s = src[k];
      if (s.kind !== "text" && s.w > 2 && s.h > 2) { ws.push(n.w / s.w); hs.push(n.h / s.h); }
    });
    var scale = Math.max(middleOf(ws) || 1, middleOf(hs) || 1);
    scale = Math.min(Math.max(scale, 0.02), 50);
    var GAP = 24;
    function crowded(k) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = Math.abs(src[i].x - src[j].x), dy = Math.abs(src[i].y - src[j].y);
          if (dx * k >= (nodes[i].w + nodes[j].w) / 2 + GAP ||
              dy * k >= (nodes[i].h + nodes[j].h) / 2 + GAP) { continue; }
          // lying over each other there too -- a word on a shape -- is not
          // something more room would put right
          if (dx < (src[i].w + src[j].w) / 2 && dy < (src[i].h + src[j].h) / 2) { continue; }
          return true;
        }
      }
      return false;
    }
    for (var tries = 0; tries < 18 && crowded(scale); tries++) { scale *= 1.12; }
    var x0 = Infinity, y0 = Infinity;
    nodes.forEach(function (n, k) {
      n.x = src[k].x * scale;
      n.y = src[k].y * scale;
      x0 = Math.min(x0, n.x - n.w / 2);
      y0 = Math.min(y0, n.y - n.h / 2);
    });
    nodes.forEach(function (n) {
      n.x = onGrid(n.x - x0 + 60);
      n.y = onGrid(n.y - y0 + 60);
    });
  }

  // No places at all (Graphviz, PlantUML, a CSV): rows down the page, a
  // row to each step from where the flow begins, arrows that go back up to
  // a loop's test left out of the counting, and each row put in the order
  // of the shapes that lead into it.
  function graphInRows(made) {
    var nodes = made.nodes, byId = {}, outs = {}, ins = {};
    nodes.forEach(function (n) { byId[n.id] = n; outs[n.id] = []; ins[n.id] = []; });
    made.links.forEach(function (l) { outs[l.from].push(l.to); ins[l.to].push(l.from); });
    var state = {}, back = {}, order = [];
    function walk(first) {                // depth first, without the call stack
      var todo = [[first, 0]];
      state[first] = 1;
      while (todo.length) {
        var top = todo[todo.length - 1], id = top[0], list = outs[id];
        if (top[1] < list.length) {
          var to = list[top[1]++];
          if (state[to] === 1) { back[id + ">" + to] = true; }
          else if (!state[to]) { state[to] = 1; todo.push([to, 0]); }
          continue;
        }
        state[id] = 2;
        order.push(id);
        todo.pop();
      }
    }
    var heads = nodes.filter(function (n) { return !ins[n.id].length; });
    heads.sort(function (a, b) {
      return (endsKind(b.kind) ? 1 : 0) - (endsKind(a.kind) ? 1 : 0) || a.id - b.id;
    });
    heads.concat(nodes).forEach(function (n) { if (!state[n.id]) { walk(n.id); } });
    order.reverse();
    var row = {};
    order.forEach(function (id) {
      row[id] = row[id] || 0;
      outs[id].forEach(function (to) {
        if (!back[id + ">" + to]) { row[to] = Math.max(row[to] || 0, row[id] + 1); }
      });
    });
    var rows = [];
    order.forEach(function (id) { (rows[row[id]] = rows[row[id]] || []).push(id); });
    rows = rows.filter(Boolean);
    var at = {};
    rows.forEach(function (r) { r.forEach(function (id, k) { at[id] = k; }); });
    for (var sweep = 0; sweep < 4; sweep++) {
      rows.forEach(function (r, ri) {
        if (!ri) { return; }
        var pull = {};
        r.forEach(function (id) {
          var feed = ins[id].filter(function (f) { return row[f] < row[id]; });
          pull[id] = feed.length ? feed.reduce(function (s, f) { return s + at[f]; }, 0) / feed.length : at[id];
        });
        r.sort(function (a, b) { return pull[a] - pull[b]; });
        r.forEach(function (id, k) { at[id] = k; });
      });
    }
    var GAP_X = 50, GAP_Y = 70, widest = 0;
    rows.forEach(function (r) {
      var w = r.reduce(function (s, id) { return s + byId[id].w; }, 0) + GAP_X * (r.length - 1);
      widest = Math.max(widest, w);
    });
    var y = 60;
    rows.forEach(function (r) {
      var tall = 0, w = GAP_X * (r.length - 1);
      r.forEach(function (id) { tall = Math.max(tall, byId[id].h); w += byId[id].w; });
      var x = 60 + (widest - w) / 2;
      r.forEach(function (id) {
        var n = byId[id];
        n.x = onGrid(x + n.w / 2);
        n.y = onGrid(y + tall / 2);
        x += n.w + GAP_X;
      });
      y += tall + GAP_Y;
    });
  }

  // The looks a drawing brings in, before it is drawn.  The looks of the
  // drawing that was here go with it -- they are kept by shape number, and
  // the numbers are the new shapes' now.  The page's own colors and
  // typeface are the drawing's where it had its own; what the last drawing
  // brought in is remembered, and put back to the plain one when this one
  // has none of its own -- unless it has been changed since, when it is
  // somebody's choice and stays.
  function broughtLooks(g, colored) {
    Object.keys(style.nodes).forEach(function (k) {
      if (/^h\d+$/.test(k)) { delete style.nodes[k]; }
    });
    var was = style.brought || {}, put = {}, L = lettersOf();
    var sheet = colored && g.paper && !plainPaper(g.paper) ? g.paper : "";
    if (sheet) { style.sheet = put.sheet = sheet; }
    else if (was.sheet && style.sheet === was.sheet) { style.sheet = ""; }
    var ink = colored && g.ink && !plainInk(g.ink) ? g.ink : "";
    if (ink) { style.ink = put.ink = ink; }
    else if (was.ink && style.ink === was.ink) { style.ink = ""; }
    if (g.face && FACES[g.face]) {
      if (g.face === "sans") { delete L.face; } else { L.face = g.face; }
      put.face = g.face;
    } else if (was.face && L.face === was.face) { delete L.face; }
    style.brought = put;
  }

  // The drawing made from it, in place of the one there was, on the
  // Flowchart tab, called what its file is called (or what it calls
  // itself) rather than keeping the name of the work before it.  What
  // comes back says how much was made, for the note.
  function openGraph(graph, name) {
    var g = graphCleaned(graph || {});
    if (!g.nodes.length) { return null; }
    drawnTitle(name, g.title);
    var ids = {}, made = { nodes: [], links: [], next: 1, nextLink: 0 };
    g.nodes.forEach(function (n) { ids[n.key] = made.next++; });
    // Its looks, before anything is measured: bold words make a wider box.
    var colored = graphColored(g);
    broughtLooks(g, colored);
    g.nodes.forEach(function (n) {
      var src = n.look || {}, look = {};
      if (colored) {
        look.fill = src.fill || (n.kind === "text" ? "" : g.paper || "#ffffff");
        look.line = src.line || g.ink || "#000000";
        if (src.text) { look.text = src.text; }
        if (!look.fill) { delete look.fill; }
        // the colors it was drawn in, as it was drawn -- not made darker
        // for reading (02-read.js), which a color picked here would be
        look.readAsIs = true;
      }
      ["bold", "italic", "under", "dash"].forEach(function (k) { if (src[k]) { look[k] = true; } });
      if (src.weight === "thin" || src.weight === "thick") { look.weight = src.weight; }
      if (Object.keys(look).length) { style.nodes["h" + ids[n.key]] = look; }
    });
    made.nodes = g.nodes.map(function (n) {
      var node = { id: ids[n.key], kind: n.kind, text: n.text, x: 0, y: 0 };
      measure(node);
      return node;
    });
    made.links = g.links.map(function (l) {
      return { id: ++made.nextLink, from: ids[l.from], to: ids[l.to], label: l.label };
    });
    if (g.placed) { graphKeepsPlaces(made.nodes, g.nodes); } else { graphInRows(made); }
    hand = made;
    picked = chosen = null;
    many = [];
    forgetUndo();
    setMode(true);
    drawHand();
    drawHandPanel();
    paint();
    buildKinds();
    buildGlobals();
    // Laid out by nobody: laid out the way Tidy up lays out a drawing, where
    // it reads as a program at all.  Rows are all it gets otherwise.
    if (!g.placed) {
      var reads = false;
      try { handWriting(true); reads = true; } catch (e) { reads = false; }
      if (reads) { tidyUp(tidyHowKept()); }
    }
    return { shapes: made.nodes.length, arrows: made.links.length, from: g.from, colored: colored };
  }

  // A file of words that is a flowchart from somewhere: read, and opened
  // where it belongs -- a drawing on the Flowchart tab, or, for Flowgorithm,
  // pseudocode on the Pseudocode tab.  `done` is told how it went.
  function openDrawn(name, text, kind, done) {
    done = done || function () {};
    kind = kind || drawnIn(name, text);
    if (kind === "flowgorithm") {
      var pseudo = fprgPseudo(text);
      if (!pseudo) { done(false, TXT.in_unread); return; }
      openWritten(name.replace(/\.fprg$/i, ".txt"), pseudo);
      done(true, say("f_opened", { name: name }));
      return;
    }
    if (kind === "mermaid" || kind === "markdown") {
      var mm = kind === "markdown" ? mermaidInMarkdown(text) : text;
      if (mm && isMermaid(mm)) { broughtLooks({}, false); }
      if (mm && openMermaid("", mm)) {
        drawnTitle(name, "");
        done(true, say("f_opened", { name: name }));
      }
      else { done(false, TXT.mm_bad); }
      return;
    }
    if (kind === "svg") { openSvg(name, text, done); return; }
    graphOf(kind, text).then(function (graph) {
      var got = graph && openGraph(graph, name);
      if (!got) { done(false, TXT.in_unread); return; }
      done(true, drawnSaid(name, got));
    }, function () { done(false, TXT.in_unread); });
  }

  // What was made, said in a few words.
  function drawnSaid(name) {
    return say("f_opened", { name: name });
  }

  // The title a drawing brought in is given: the one it gives itself, or
  // its file's name made into one (fileTitle, 09-names.js) -- nothing, for
  // a name that says nothing (image.png, a pasted screenshot).
  function drawnTitle(name, own) {
    if (!el("#f-title")) { return; }
    // what a pasted or saved screenshot is called by whatever made it
    if (/^(image|picture|screenshot|screen ?shot|untitled|download|img|clipboard|capture)\b/i.test(name || "")) {
      name = "";
    }
    var called = flatWords(own) || (name ? fileTitle(name, "") : "");
    titleComesFrom({ text: called });
  }
