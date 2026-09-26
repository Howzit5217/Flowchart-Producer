// ---------------------------------------------------------------------------
//  02-read.js -- colors kept readable on what they are on
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // Light words on a shape given a light fill could not be read, and a pale
  // border on pale paper left a shape with no edge.  Now a color that would
  // be lost on what it is on is drawn a darker shade of itself (or a
  // lighter one, on a dark ground) -- the same color, only as far darker as
  // it takes to read -- and an amber mark off the shape's top right corner,
  // like the one the shape rules put there (13-hand-rules.js), says so: it
  // offers to keep the new color, or to ignore it and draw the color as it
  // was chosen.  The same goes for the arrows and the words on them against
  // the paper, marked at the paper's own top right corner (asked for,
  // 2026-09-25).
  //
  // How much is enough is the usual measure of two colors against each
  // other: 4.5 to 1 for words, 3 to 1 for lines.  Every palette on the
  // Style side is well past both, so nothing is changed until a color is.
  var WORDS_NEED = 4.5, LINES_NEED = 3;

  function rgbOf(hex) {
    var m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(fullHex(hex) || "");
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
  }
  function lightOf(rgb) {                // how much light, as the eye takes it
    var c = rgb.map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrastOf(a, b) {
    var x = rgbOf(a), y = rgbOf(b);
    if (!x || !y) { return 21; }         // not a color we can read: leave it be
    var p = lightOf(x), q = lightOf(y);
    return (Math.max(p, q) + 0.05) / (Math.min(p, q) + 0.05);
  }

  // Asked of every shape on every round of painting, a chart of thousands
  // asks the same few pairs of colors over and over: each answer is kept.
  var readKnown = {}, readCount = 0;
  function readableOn(color, under, need) {
    var key = color + "/" + under + "/" + need;
    if (key in readKnown) { return readKnown[key]; }
    if (++readCount > 2000) { readKnown = {}; readCount = 1; }   // never without end
    return (readKnown[key] = readableWorked(color, under, need));
  }

  // The color, darker or lighter, and nothing else about it changed: its
  // hue and how much of it there is kept, and only as far as `need` takes.
  // Nothing, if it can be read as it is.
  function readableWorked(color, under, need) {
    var rgb = rgbOf(color), ground = rgbOf(under);
    if (!rgb || !ground || contrastOf(color, under) >= need) { return null; }
    var toDark = contrastOf("#000000", under) >= contrastOf("#ffffff", under);
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    var hi = Math.max(r, g, b), lo = Math.min(r, g, b), l = (hi + lo) / 2;
    var s = 0, h = 0, d = hi - lo;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = hi === r ? ((g - b) / d) % 6 : hi === g ? (b - r) / d + 2 : (r - g) / d + 4;
    }
    function at(light) {                 // this hue and strength at a lightness
      var c = (1 - Math.abs(2 * light - 1)) * s, x = c * (1 - Math.abs(h % 2 - 1));
      var m = light - c / 2, k = Math.floor(((h % 6) + 6) % 6);
      var p = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][k];
      return "#" + p.map(function (v) {
        return ("0" + Math.round(Math.max(0, Math.min(1, v + m)) * 255).toString(16)).slice(-2);
      }).join("");
    }
    // Halved towards black (or white) until it reads, then back towards
    // where it was for as long as it still does.
    var near = l, far = toDark ? 0 : 1;
    if (contrastOf(at(far), under) < need) { return at(far); }
    for (var i = 0; i < 18; i++) {
      var mid = (near + far) / 2;
      if (contrastOf(at(mid), under) >= need) { far = mid; } else { near = mid; }
    }
    return at(far);
  }

  // One shape's colors, made readable where they need it: its words on its
  // fill (a words-only box's words on the paper), and its border on the
  // paper where the fill is lost on the paper as well, so that there would
  // be no edge to the shape at all.  `fill`, `line` and `word` are what
  // paint() has worked out, "" meaning the drawing's own white and black.
  // A shape turned down (Ignore) keeps what it was given.
  function shapeReads(kind, fill, line, word, mine) {
    var out = { line: line, word: word, words: null, edge: null };
    if (mine.readAsIs) { return out; }
    var paper = style.sheet || "#ffffff";
    var loose = kind === "text";
    var under = loose ? paper : (fill || "#ffffff");
    var w = word || "#000000", better = readableOn(w, under, WORDS_NEED);
    if (better) { out.word = better; out.words = { was: w, now: better }; }
    if (!loose) {
      var edge = line || "#000000";
      // (asked as readableOn is, so the answer is kept: null means it reads)
      if (readableOn(under, paper, LINES_NEED) !== null) {
        var shown = readableOn(edge, paper, LINES_NEED);
        if (shown) { out.line = shown; out.edge = { was: edge, now: shown }; }
      }
    }
    out.changed = !!(out.words || out.edge);
    return out;
  }

  // A highlighter the words can still be read on.  The pens are pale, which
  // is right behind dark words -- but on a dark palette the words are
  // light, and a pale yellow behind light words hid them.  So the pen is
  // drawn a darker shade of itself there (a lighter one behind dark words
  // it is too dark for), only as far as the words need (asked for,
  // 2026-09-25).  `word` is the words' color as drawn, "" being black.
  function markReads(mark, word, mine) {
    if (!mark || mine.readAsIs) { return null; }
    var better = readableOn(mark, word || "#000000", WORDS_NEED);
    return better ? { was: mark, now: better } : null;
  }

  // The chart's own: the arrows, and the words along them, on the paper.
  var chartRead = null;                  // what was changed, for its mark
  function chartReads(ink, said) {
    var out = { ink: ink, said: said, lines: null, words: null };
    if (style.readAsIs) { chartRead = null; return out; }
    var paper = style.sheet || "#ffffff";
    var lines = readableOn(ink || "#000000", paper, LINES_NEED);
    if (lines) { out.ink = lines; out.lines = { was: ink || "#000000", now: lines }; }
    var words = readableOn(said || "#000000", paper, WORDS_NEED);
    if (words) { out.said = words; out.words = { was: said || "#000000", now: words }; }
    chartRead = out.lines || out.words ? out : null;
    return out;
  }

  // ------------------------------------------------------------ the marks --
  // Put up once the chart is painted: one off the top right corner of each
  // shape that had a color changed -- beside the shape rules' mark, if it
  // has one -- and one in the paper's own corner for the arrows.  Only put
  // up again when what they say about has changed.
  function readMarks() {
    if (!chart) { return; }
    var list = whoIsIn().nodes.filter(function (g) { return g._read; });
    var sign = list.map(function (g) { return g.dataset.i; }).join(",") +
               (chartRead ? "|paper" : "") + "|" + (byHand ? handOrigin.x + "," + handOrigin.y : "");
    if (chart._readShown === sign) { return; }
    all(".read-dot", chart).forEach(function (m) { m.remove(); });
    chart._readShown = sign;
    var NS = "http://www.w3.org/2000/svg";
    var r = COARSE ? 10 : 8, off = COARSE ? 15 : 11;
    function put(key, x, y) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "read-dot");
      g.setAttribute("data-read", key);
      g.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")");
      // the mark the shape rules wear, with half a circle in it for light
      // against dark
      g.innerHTML = "<title></title>" +
        '<circle r="' + r + '" fill="#d98a04" stroke="#ffffff" stroke-width="1.5"/>' +
        '<circle r="' + (r * 0.52).toFixed(2) + '" fill="none" stroke="#ffffff" stroke-width="1.3"/>' +
        '<path d="M0,' + (-r * 0.52).toFixed(2) + "A" + (r * 0.52).toFixed(2) + "," +
        (r * 0.52).toFixed(2) + " 0 0 1 0," + (r * 0.52).toFixed(2) + 'Z" fill="#ffffff" stroke="none"/>';
      g.firstChild.textContent = TXT.rd_tip || "";
      chart.appendChild(g);
    }
    list.forEach(function (g) {
      var x, y;
      if (byHand) {
        var n = nodeById(+String(g.dataset.i).slice(1));
        if (!n) { return; }
        var about = turned(n);
        x = n.x + handOrigin.x + about.w / 2 + off;
        y = Math.max(r + 1, n.y + handOrigin.y - about.h / 2 - off);
        // beside the shape rules' mark, not on it
        if (el('.rule-dot[data-hint="' + n.id + '"]', chart)) { x -= 2 * r + 5; }
      } else {
        var shape = el(":scope > :is(rect, ellipse, polygon, path)", g), box = null;
        try { box = shape && shape.getBBox(); } catch (e) { box = null; }
        if (!box || !box.width) { return; }
        x = box.x + box.width + off * 0.6;
        y = Math.max(r + 1, box.y - off * 0.6);
      }
      put(g.dataset.i, x, y);
    });
    if (chartRead) { put("paper", W - r - 6, r + 6); }
  }

  // Pressed: what was changed and why, and the two ways to answer it --
  // keep the new color (it becomes the color, and the mark goes), or
  // ignore it (the color chosen is drawn as it is, and not asked about
  // again).  One step back undoes either.
  function readMenu(key, x, y) {
    var said = [], take, ignore;         // (not `keep`: that is the saving, 05-keep.js)
    function way(one, dark, light) {
      return TXT[contrastOf(one.now, "#000000") < contrastOf(one.was, "#000000") ? dark : light];
    }
    if (key === "paper") {
      var got = chartRead;
      if (!got) { return; }
      if (got.lines) { said.push(way(got.lines, "rd_lines_dark", "rd_lines_light")); }
      if (got.words) { said.push(way(got.words, "rd_said_dark", "rd_said_light")); }
      take = function () {
        keepUndo();
        if (got.lines) { style.ink = got.lines.now; }
        if (got.words) { style.words = got.words.now; }
        paint(); buildGlobals(); keep();
      };
      ignore = function () { keepUndo(); style.readAsIs = true; paint(); keep(); };
    } else {
      var g = el('.node[data-i="' + key + '"]', chart), fix = g && g._read;
      if (!fix) { return; }
      if (byHand) {                      // the shape is picked, as its menu picks it
        picked = +String(key).slice(1); chosen = null; many = []; joining = false;
        drawHand(); drawHandPanel();
      } else { select(g); }
      if (fix.words) { said.push(way(fix.words, "rd_words_dark", "rd_words_light")); }
      if (fix.edge) { said.push(way(fix.edge, "rd_edge_dark", "rd_edge_light")); }
      if (fix.mark) { said.push(way(fix.mark, "rd_mark_dark", "rd_mark_light")); }
      var mine = function () { return (style.nodes[key] = style.nodes[key] || {}); };
      take = function () {
        keepUndo();
        if (fix.words) { mine().text = fix.words.now; }
        if (fix.edge) { mine().line = fix.edge.now; }
        if (fix.mark) { mine().mark = fix.mark.now; }
        paint(); drawSelection(); keep();
      };
      ignore = function () { keepUndo(); mine().readAsIs = true; paint(); drawSelection(); keep(); };
    }
    var words = document.createElement("p");
    words.className = "rule-says";
    words.textContent = said.join(" ");
    var now = key === "paper" ? (chartRead.lines || chartRead.words).now
                              : ((fix.words || fix.edge || fix.mark).now);
    openMenu(x, y, [
      { head: TXT.rd_head },
      { bit: words },
      { swatch: now, name: TXT.rd_keep, go: take },
      { icon: "plain", name: TXT.rd_ignore, go: ignore }
    ], "rule-menu");
  }

  // Taken before the paper sees it, as the shape rules' mark is: a press on
  // it is not the start of a drag, nor a click on the paper or the shape.
  function readDotAt(ev) {
    return ev.target && ev.target.closest ? ev.target.closest("#chart .read-dot") : null;
  }
  document.addEventListener("pointerdown", function (ev) {
    if (readDotAt(ev)) { ev.stopPropagation(); }
  }, true);
  document.addEventListener("click", function (ev) {
    var dot = readDotAt(ev);
    if (!dot) { return; }
    ev.stopPropagation();
    ev.preventDefault();
    readMenu(dot.dataset.read, ev.clientX, ev.clientY);
  }, true);
