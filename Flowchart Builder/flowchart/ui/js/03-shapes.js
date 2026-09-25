// ---------------------------------------------------------------------------
//  03-shapes.js -- every shape, full size and in miniature
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A person and a table are drawn round their words, so those two are
  // handed the lines and how far apart they are (see wordsAt, below).
  // Handed none, as in the key, each is drawn the way it looks on its own.
  function shapeArt(kind, cx, cy, w, h, fill, words, line) {
    var l = cx - w / 2, r = cx + w / 2, t = cy - h / 2, b = cy + h / 2;
    var lean = Math.min(12, w / 4), paint = fill || "#ffffff";
    var box = 'fill="' + paint + '"';
    function poly(pts) { return '<polygon points="' + pts.join(" ") + '" ' + box + '/>'; }
    function P(x, y) { return round(x) + "," + round(y); }
    function round(v) { return Math.round(v * 10) / 10; }
    switch (kind) {
      case "oval": case "circle":
        return '<ellipse cx="' + round(cx) + '" cy="' + round(cy) + '" rx="' +
               round(w / 2) + '" ry="' + round(h / 2) + '" ' + box + '/>';
      case "rect": case "sub": {
        var art = '<rect x="' + round(l) + '" y="' + round(t) + '" width="' +
                  round(w) + '" height="' + round(h) + '" rx="3" ' + box + '/>';
        if (kind === "sub") {
          art += '<line x1="' + round(l + 6) + '" y1="' + round(t) + '" x2="' +
                 round(l + 6) + '" y2="' + round(b) + '"/><line x1="' +
                 round(r - 6) + '" y1="' + round(t) + '" x2="' + round(r - 6) +
                 '" y2="' + round(b) + '"/>';
        }
        return art;
      }
      case "roundrect":
        return '<rect x="' + round(l) + '" y="' + round(t) + '" width="' + round(w) +
               '" height="' + round(h) + '" rx="' + round(Math.min(14, h / 2.4)) +
               '" ' + box + '/>';
      case "io": return poly([P(l + lean, t), P(r, t), P(r - lean, b), P(l, b)]);
      case "io_back": return poly([P(l, t), P(r - lean, t), P(r, b), P(l + lean, b)]);
      case "trap": return poly([P(l + lean, t), P(r - lean, t), P(r, b), P(l, b)]);
      case "hex": return poly([P(l + lean, t), P(r - lean, t), P(r, cy),
                               P(r - lean, b), P(l + lean, b), P(l, cy)]);
      case "manual": {
        var slope = Math.min(11, h * 0.28);
        return poly([P(l, t + slope), P(r, t), P(r, b), P(l, b)]);
      }
      case "card": {
        var nick = Math.min(14, h * 0.34);
        return poly([P(l + nick, t), P(r, t), P(r, b), P(l, b), P(l, t + nick)]);
      }
      case "note": {
        var fold = Math.min(14, h * 0.34);
        return '<path d="M' + P(l, t) + "H" + round(r - fold) + "L" + P(r, t + fold) +
               "V" + round(b) + "H" + round(l) + 'Z" ' + box + '/>' +
               '<path class="trim" d="M' + P(r - fold, t) + "V" + round(t + fold) +
               "H" + round(r) + '" fill="none"/>';
      }
      case "doc": {
        var wave = Math.min(10, h * 0.18);
        return '<path d="M' + P(l, t) + "H" + round(r) + "V" + round(b - wave) +
               "C" + P(r - w * 0.25, b - wave * 2.2) + " " + P(r - w * 0.4, b + wave * 0.9) +
               " " + P(cx, b - wave * 0.2) +
               "C" + P(l + w * 0.32, b - wave * 1.6) + " " + P(l + w * 0.18, b + wave * 0.7) +
               " " + P(l, b - wave) + 'Z" ' + box + '/>';
      }
      case "docs": {
        var step = Math.min(5, h * 0.12), art = "";
        [2, 1].forEach(function (back) {
          art += '<rect x="' + round(l + back * step) + '" y="' + round(t) +
                 '" width="' + round(w - back * step) + '" height="' +
                 round(h - back * step * 2) + '" rx="2" ' + box + '/>';
        });
        return art + shapeArt("doc", cx - step, cy + step, w - 2 * step, h - 2 * step, paint);
      }
      case "store": {
        var lip = Math.min(11, h * 0.24);
        return '<path d="M' + P(l, t + lip) + "V" + round(b - lip) +
               "A" + round(w / 2) + "," + round(lip) + " 0 0 0 " + P(r, b - lip) +
               "V" + round(t + lip) + "A" + round(w / 2) + "," + round(lip) +
               " 0 0 0 " + P(l, t + lip) + 'Z" ' + box + '/>' +
               '<path class="trim" d="M' + P(l, t + lip) + "A" + round(w / 2) + "," +
               round(lip) + " 0 0 0 " + P(r, t + lip) + '" fill="none"/>';
      }
      case "delay": {
        var bulge = Math.min(h / 2, w / 2);
        return '<path d="M' + P(l, t) + "H" + round(r - bulge) + "A" + round(bulge) +
               "," + round(h / 2) + " 0 0 1 " + P(r - bulge, b) + "H" + round(l) +
               'Z" ' + box + '/>';
      }
      case "screen": {
        // The round end no deeper than the pointed one: a half circle stood
        // out past the box on anything over two lines tall.
        var bow = Math.min(16, w * 0.16);
        return '<path d="M' + P(l + bow, t) + "H" + round(r - bow) +
               "A" + round(bow) + "," + round(h / 2) + " 0 0 1 " + P(r - bow, b) +
               "H" + round(l + bow) + "C" + P(l, cy + h * 0.28) + " " +
               P(l, cy - h * 0.28) + " " + P(l + bow, t) + 'Z" ' + box + '/>';
      }
      case "offpage":                     // carries on somewhere else
        return poly([P(l, t), P(r, t), P(r, b - Math.min(18, h * 0.42)),
                     P(cx, b), P(l, b - Math.min(18, h * 0.42))]);
      case "loop": {                      // a loop's limit: For, mostly
        var cut = Math.min(14, h * 0.34, w / 5);
        return poly([P(l + cut, t), P(r - cut, t), P(r, t + cut), P(r, b),
                     P(l, b), P(l, t + cut)]);
      }
      case "parallel": {                  // things happening side by side
        var bar = Math.max(2.5, Math.min(5, h * 0.11));
        return '<rect x="' + round(l) + '" y="' + round(t) + '" width="' + round(w) +
               '" height="' + round(h) + '" rx="2" ' + box + '/>' +
               '<path class="trim" d="M' + P(l, t + bar * 2) + "H" + round(r) +
               "M" + P(l, b - bar * 2) + "H" + round(r) + '" fill="none"/>';
      }
      case "stored": {                    // held somewhere inside
        var rule = Math.min(11, w * 0.14);
        return '<rect x="' + round(l) + '" y="' + round(t) + '" width="' + round(w) +
               '" height="' + round(h) + '" rx="2" ' + box + '/>' +
               '<path class="trim" d="M' + P(l + rule, t) + "V" + round(b) +
               "M" + P(l, t + rule) + "H" + round(r) + '" fill="none"/>';
      }
      case "cloud": {
        // Drawn so that it touches its box at the middle of all four sides,
        // which is where a line joining it expects to meet it.
        var qw = w / 2, qh = h / 2;
        return '<path d="M' + P(l, cy) +
               "C" + P(l, cy - qh * 0.75) + " " + P(cx - qw * 0.72, t - qh * 0.18) +
               " " + P(cx - qw * 0.34, t + qh * 0.16) +
               "C" + P(cx - qw * 0.1, t - qh * 0.2) + " " + P(cx + qw * 0.34, t - qh * 0.2) +
               " " + P(cx + qw * 0.42, t + qh * 0.2) +
               "C" + P(cx + qw * 0.85, t + qh * 0.02) + " " + P(r, cy - qh * 0.7) +
               " " + P(r, cy) +
               "C" + P(r, cy + qh * 0.72) + " " + P(cx + qw * 0.5, b) + " " + P(cx, b) +
               "C" + P(cx - qw * 0.55, b) + " " + P(l, cy + qh * 0.75) + " " + P(l, cy) +
               'Z" ' + box + '/>';
      }
      case "text":                       // words on their own, no outline
        // Nothing is drawn but something has to be there to take hold of,
        // so the words sit on a pane of clear glass.
        return '<rect class="ghost" x="' + round(l) + '" y="' + round(t) +
               '" width="' + round(w) + '" height="' + round(h) +
               '" fill="none" pointer-events="all"/>';
      case "actor": {                    // somebody, rather than something
        // Standing over their name, in their own proportions: a long name
        // makes a wide box, and a person as wide as it was all arms.
        var fig = figureH(h, nameRoom(words, line));
        var head = Math.min(fig * 0.17, w * 0.17);
        var neck = t + head * 2;
        var hip = t + fig * 0.62;
        var arm = Math.min(fig * 0.34, w * 0.45), leg = Math.min(fig * 0.3, w * 0.42);
        return '<circle cx="' + round(cx) + '" cy="' + round(t + head) + '" r="' +
               round(head) + '" ' + box + '/>' +
               '<path class="trim" d="M' + P(cx, neck) + "V" + round(hip) +
               "M" + P(cx - arm, neck + fig * 0.12) + "H" + round(cx + arm) +
               "M" + P(cx, hip) + "L" + P(cx - leg, t + fig) +
               "M" + P(cx, hip) + "L" + P(cx + leg, t + fig) + '" fill="none"/>';
      }
      case "callout": {                  // something said about it
        var tail = Math.min(16, h * 0.28);
        var sill = b - tail;
        var rnd = Math.min(10, h / 4);
        return '<path d="M' + P(l + rnd, t) + "H" + round(r - rnd) +
               "Q" + P(r, t) + " " + P(r, t + rnd) + "V" + round(sill - rnd) +
               "Q" + P(r, sill) + " " + P(r - rnd, sill) +
               "H" + round(l + w * 0.34) + "L" + P(l + w * 0.2, b) +
               "L" + P(l + w * 0.24, sill) + "H" + round(l + rnd) +
               "Q" + P(l, sill) + " " + P(l, sill - rnd) + "V" + round(t + rnd) +
               "Q" + P(l, t) + " " + P(l + rnd, t) + 'Z" ' + box + '/>';
      }
      case "cube": {
        var lip = Math.min(14, h * 0.26, w * 0.14);
        return '<path d="M' + P(l, t + lip) + "L" + P(l + lip, t) + "H" + round(r) +
               "V" + round(b - lip) + "L" + P(r - lip, b) + "H" + round(l) +
               'Z" ' + box + '/>' +
               '<path class="trim" d="M' + P(l, t + lip) + "H" + round(r - lip) +
               "V" + round(b) + "M" + P(r - lip, t + lip) + "L" + P(r, t) +
               '" fill="none"/>';
      }
      case "step": {                     // one step of several, in a row
        var notch = Math.min(22, w * 0.16);
        return poly([P(l, t), P(r - notch, t), P(r, cy), P(r - notch, b),
                     P(l, b), P(l + notch, cy)]);
      }
      case "table": {                    // ruled round its words, if it has any
        var plan = words && words.length ? tablePlan(words, line, h)
                 : { headH: Math.min(16, h * 0.3), cols: TABLE_COLS, rows: [{}] };
        var rules = "M" + P(l, t + plan.headH) + "H" + round(r);
        plan.rows.slice(1).forEach(function (row) {
          rules += "M" + P(l, t + row.y) + "H" + round(r);
        });
        for (var k = 1; k < plan.cols; k++) {
          rules += "M" + P(l + w * k / plan.cols, t + plan.headH) + "V" + round(b);
        }
        return '<rect x="' + round(l) + '" y="' + round(t) + '" width="' + round(w) +
               '" height="' + round(h) + '" rx="2" ' + box + '/>' +
               '<path class="trim" d="' + rules + '" fill="none"/>';
      }
      case "arrow": {
        var head = arrowParts(w, h).head, wing = arrowParts(w, h).wing;
        return poly([P(l, t + wing), P(r - head, t + wing), P(r - head, t), P(r, cy),
                     P(r - head, b), P(r - head, b - wing), P(l, b - wing)]);
      }
      default: return poly([P(cx, t), P(r, cy), P(cx, b), P(l, cy)]);
    }
  }

  // --------------------------------------------- shapes with parts to them --
  // Where the words go in a shape, and how much room its parts leave them --
  // what shapes.py and draw/outlines.py say for a chart built from
  // pseudocode, said again for the shapes drawn here, so a shape holds its
  // words the same way however it got onto the paper.  Most are happy with
  // their middle.  Some step their words aside from something in the way of
  // it: a lip, a point, a wave, a slope, a tail, a side, a ruled corner.
  // And three are drawn round them, where the middle is the one place the
  // words cannot go: a person stands over their name, an arrow carries its
  // words along the shaft rather than out into the head, and a table has
  // its first line across the head row and a cell for each line after it.
  var ARROW_WING = 12;                   // an arrow's head past its shaft, at most
  var ARROW_AIR = 4;                     // its words clear of the shaft's edges
  var TABLE_COLS = 3;                    // the columns of a table with no cells
  var CELL_AIR = 6;                      // a cell's words clear of its rules
  var NAME_AIR = 8;                      // above and below a person's name,
                                         //   and round a table's head and cells
  // What each outline takes off its words' room over a plain box's 40 across
  // and 24 up and down (SHAPES in shapes.py: side and top).
  var WORD_ROOM = { step: [52, 0], cloud: [44, 12], store: [0, 16],
                    doc: [0, 9], docs: [0, 14], manual: [0, 10], offpage: [0, 18],
                    parallel: [0, 14], stored: [0, 8], callout: [0, 16],
                    cube: [0, 14], card: [0, 4], note: [0, 4], loop: [0, 8],
                    circle: [0, 4] };

  function arrowParts(w, h) {            // an arrow's head, and its reach
    return { head: Math.min(26, w * 0.3), wing: Math.min(h * 0.26, ARROW_WING) };
  }
  function arrowTall(shaft) {            // how tall, for a shaft this tall
    return Math.min(shaft / 0.48, shaft + 2 * ARROW_WING);
  }
  function nameRoom(words, line) {       // what a person's name takes
    return words && words.length ? words.length * line + 2 * NAME_AIR : 0;
  }
  // The person is what the name leaves: drawn by hand, a shape made bigger
  // is a bigger person, not the same one with more room round the name.
  function figureH(h, below) {
    return below > 0 ? Math.max(Math.min(h, 16), h - below) : h;
  }

  // Where everything in a table goes, down from the top of its box: the
  // head row, then the cells a row at a time, across as many columns as
  // there are cells, up to three -- or one empty row of three with none.
  // With no h, the height the words want; with one, what the box has over
  // that shared out, so the head and every row breathe the same.
  function tablePlan(words, line, h) {
    var cells = words.slice(1), cols = Math.min(cells.length, TABLE_COLS) || TABLE_COLS;
    var rows = [];
    for (var i = 0; i < cells.length; i += cols) { rows.push(cells.slice(i, i + cols)); }
    if (!rows.length) { rows.push([]); }
    var headH = line + 2 * NAME_AIR, rowH = line + NAME_AIR;
    var want = headH + rows.length * rowH;
    if (h === undefined) { return want; }
    if (h >= want) {
      var spare = (h - want) / (rows.length + 1);
      headH += spare; rowH += spare;
    } else {
      headH *= h / want; rowH *= h / want;
    }
    return { head: words.slice(0, 1), headH: headH, cols: cols,
             rows: rows.map(function (cells, k) {
               return { y: headH + k * rowH, h: rowH, cells: cells };
             }) };
  }

  // The middle of a shape's words (the numbers are shapeArt's, above).
  function wordsAt(kind, cx, cy, w, h, words, line) {
    var dx = 0, dy = 0;
    switch (kind) {
      case "store": dy = Math.min(11, h * 0.24) / 2; break;          // under the lip
      case "offpage": dy = -Math.min(18, h * 0.42) / 2; break;       // above the point
      case "doc": dy = -Math.min(10, h * 0.18) * 0.6; break;         // above the wave
      case "docs": {                                                  // on the front page
        var step = Math.min(5, h * 0.12);
        return wordsAt("doc", cx - step, cy + step, w - 2 * step, h - 2 * step);
      }
      case "manual": dy = Math.min(11, h * 0.28) * 0.45; break;      // under the slope
      case "card": dy = Math.min(14, h * 0.34) * 0.3; break;         // clear of the nick
      case "note": dy = Math.min(14, h * 0.34) * 0.25; break;        // and of the fold
      case "loop": dy = Math.min(14, h * 0.34, w / 5) * 0.3; break;  // under the corners
      case "stored": dx = dy = Math.min(11, w * 0.14) / 2; break;    // in the ruled corner
      case "cube": {                                                  // on the front of it
        var lip = Math.min(14, h * 0.26, w * 0.14);
        dx = -lip / 2; dy = lip / 2; break;
      }
      case "callout": dy = -Math.min(16, h * 0.28) / 2; break;       // above the tail
      case "arrow": dx = -arrowParts(w, h).head / 2; break;          // along the shaft
      case "actor": {                                                 // under the person
        var below = nameRoom(words, line);
        dy = figureH(h, below) + below / 2 - h / 2; break;
      }
      default: break;
    }
    return { x: cx + dx, y: cy + dy };
  }

  // The words of a shape, drawn where it holds them: a line to each line,
  // as far apart as `type` says, the lot centered on wordsAt -- or, in a
  // table, the first across the head and the rest in a cell each.
  function wordsArt(kind, cx, cy, w, h, words, type) {
    var out = [];
    function lay(lines, x, y) {
      var y0 = y - (lines.length - 1) * type.line / 2 + type.size * 0.35;
      lines.forEach(function (one, k) {
        out.push('<text x="' + (Math.round(x * 10) / 10) + '" y="' +
                 (y0 + k * type.line).toFixed(1) + '" text-anchor="middle" ' +
                 'stroke="none" fill="#000000">' + escaped(one) + "</text>");
      });
    }
    if (kind === "table") {
      var plan = tablePlan(words, type.line, h), l = cx - w / 2, t = cy - h / 2;
      lay(plan.head, cx, t + plan.headH / 2);
      plan.rows.forEach(function (row) {
        row.cells.forEach(function (cell, k) {
          lay([cell], l + w * (k + 0.5) / plan.cols, t + row.y + row.h / 2);
        });
      });
      return out;
    }
    var at = wordsAt(kind, cx, cy, w, h, words, type.line);
    lay(words, at.x, at.y);
    return out;
  }

  // The least box that holds these words in this shape, `across` measuring
  // one line: the words' own room and whatever the shape's parts take.
  function wordsNeed(kind, words, line, across) {
    var wide = 0;
    words.forEach(function (one) { wide = Math.max(wide, across(one)); });
    var more = WORD_ROOM[kind] || [0, 0];
    if (kind === "diamond") {
      return { w: wide + 84, h: words.length * line + 38 };
    }
    if (kind === "table") {
      var cells = words.slice(1), cols = Math.min(cells.length, TABLE_COLS) || TABLE_COLS;
      var cell = 0;
      cells.forEach(function (one) { cell = Math.max(cell, across(one)); });
      return { w: Math.max(across(words[0] || "") + 40,
                           cells.length ? cols * (cell + 2 * CELL_AIR) : 0),
               h: tablePlan(words, line) };
    }
    if (kind === "arrow") {
      return { w: wide + 40, h: arrowTall(words.length * line + 2 * ARROW_AIR) };
    }
    if (kind === "actor") {
      return { w: wide + 24, h: nameRoom(words, line) + 50 };
    }
    return { w: wide + Math.max(40, more[0]), h: words.length * line + 24 + more[1] };
  }

  function keyMark(kind) {               // the same shape, in miniature
    // Text draws no outline -- that is the whole point of it on the paper,
    // where it is words and nothing else -- so in miniature it came out as
    // an empty square: a button in the row with all the others that nobody
    // could see, and no way to tell it apart from a gap.  Here it is shown
    // as what it holds instead.
    var art = kind === "text"
            ? '<path d="M3.5 4.5h17M3.5 8.5h13M3.5 12.5h8"/>'
            : shapeArt(kind, 12, 8.5, 21, 14);
    return '<span class="legendkey"><svg class="keymark" data-kind="' + kind +
           '" width="24" height="17" viewBox="0 0 24 17" stroke="#10151b" ' +
           'stroke-width="1.2" fill="none">' + art + "</svg></span>";
  }

