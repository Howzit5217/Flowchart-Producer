// ---------------------------------------------------------------------------
//  19-uml.js -- a class diagram of the code's own classes
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A flowchart says what a program does, a step at a time.  A program
  // written with classes is also a set of things -- a Car holding its year,
  // its make and its speed, and able to speed up and slow down -- and the
  // picture of that is a class diagram: a box for each class, its name at
  // the top, then what it holds, then what it does, each line saying who
  // may use it (- its own, # its own and those built on it, + anybody, ~
  // the rest of its package) and the kind of thing it is.  Lines between
  // the boxes say which class is built on which (a hollow triangle at the
  // one built on), which says it does what an interface says (the same,
  // dashed), and which holds one or a list of another (an open arrow).
  //
  // The reading of the code (18-from-code.js) hands over the classes as they
  // were written, in `said.uml`; this draws them and writes them as Mermaid,
  // whose classDiagram GitHub, GitLab and Notion draw.
  //
  // The drawing is made the way the chart's own drawing is (draw/svg.py):
  // the paper a .sheet, the ruling .grid lines, every word inside the one
  // group that carries the typeface, each class a .node, each line a .flow
  // and each name along one a .label.  So whatever the Style side says --
  // the palette, a box's own colors, its border, the typeface and size of
  // the words, how heavy the lines are, the grid, Depth -- paint() (02-paint.js)
  // puts on a class diagram exactly as it puts it on a flowchart, a box can
  // be picked and styled on its own, and a saved SVG or PNG is what is shown.

  var UML_MARK = { "private": "-", "protected": "#", "public": "+", "package": "~", "internal": "~" };
  var UML_STEP = 20;                    // the ruling, as the chart's (GRID_STEP)
  var UML_EDGE = 40, UML_GAP = 60, UML_ROWS = 80;   // two, three and four squares
  var UML_INK = "#000000", UML_SOFT = "#57606a", UML_PAPER = "#ffffff";
  var UML_FINE = "#e7ebf0", UML_MAJOR = "#d8dfe8";  // the ruling, before any palette
  // How the words are set while a drawing is made: the chart's typeface, its
  // size in pixels, whether all of it is bold, and the height of a line.
  var umlType = { face: "Arial, Helvetica, sans-serif", px: 11, bold: false, line: 17, pad: 9 };

  // ------------------------------------------------------- what each says --
  // One field or method as a line of its box, the way UML writes it:
  //   - __year : int        + getYear() : int        + __init__(year : int, make : str)
  function umlMember(m, method) {
    var mark = UML_MARK[m.vis] || "+";
    if (!method) { return mark + " " + m.name + (m.type ? " : " + m.type : ""); }
    var params = (m.params || []).map(function (p) { return p.name + (p.type ? " : " + p.type : ""); });
    return mark + " " + m.name + "(" + params.join(", ") + ")" + (m.type ? " : " + m.type : "");
  }

  // What kind of class it is, said above its name: <<interface>>
  function umlKindWord(c) {
    if (c.stub) { return c.kind === "interface" ? "«interface»" : ""; }
    return c.kind === "interface" ? "«interface»" : c.kind === "enum" ? "«enumeration»"
         : c.kind === "struct" ? "«struct»" : c.kind === "record" ? "«record»"
         : c.abstract ? "«abstract»" : "";
  }

  // How wide some words come out, in the typeface and size they are drawn
  // in.  On the page the browser measures them; with no page about (the
  // tests), a fair guess at it.
  var umlPen = null;
  function umlWide(text, bold, px) {
    px = px || umlType.px;
    if (umlPen === null) {
      umlPen = false;
      try {
        if (typeof document !== "undefined" && document.createElement) {
          var canvas = document.createElement("canvas");
          if (canvas && typeof canvas.getContext === "function") { umlPen = canvas.getContext("2d") || false; }
        }
      } catch (e) { umlPen = false; }
    }
    if (umlPen) {
      umlPen.font = (bold || umlType.bold ? "bold " : "") + px + "px " + umlType.face;
      return umlPen.measureText(text).width;
    }
    return String(text).length * px * (bold || umlType.bold ? 0.62 : 0.56);
  }
  function umlSnap(n) { return Math.round(n / UML_STEP) * UML_STEP; }

  // -------------------------------------------------------------- the boxes --
  // Each class as a box: its rows of words, how wide and tall, and where
  // its compartments meet -- as wide as a whole number of squares, so that
  // both its sides stand on the ruling.  A class the code builds on but does
  // not have -- Exception, JFrame, Comparable -- is a box with only its name.
  function umlBox(c) {
    var head = [], body = [[], []];
    var kindWord = umlKindWord(c);
    if (kindWord) { head.push({ text: kindWord, soft: true }); }
    head.push({ text: c.name, bold: true, italic: !!c.abstract || c.kind === "interface" });
    if (!c.stub) {
      if (c.kind === "enum") {
        (c.values || []).forEach(function (v) { body[0].push({ text: v }); });
      }
      (c.fields || []).forEach(function (f) {
        body[0].push({ text: umlMember(f, false), under: f.statik });
      });
      (c.methods || []).forEach(function (m) {
        body[1].push({ text: umlMember(m, true), under: m.statik, italic: m.abstract });
      });
    }
    var w = 0, pad = umlType.pad;
    head.forEach(function (r) { w = Math.max(w, umlWide(r.text, r.bold, r.soft ? umlType.px - 1 : 0) + 2 * pad); });
    body.forEach(function (rows) {
      rows.forEach(function (r) { w = Math.max(w, umlWide(r.text, false) + 2 * pad); });
    });
    w = Math.max(UML_STEP * Math.ceil(w / UML_STEP), c.stub ? 100 : 120);
    var L = umlType.line;
    var headH = head.length * L + 10;
    var parts = c.stub ? [] : body.map(function (rows) { return rows.length ? rows.length * L + 10 : 12; });
    var h = headH + parts.reduce(function (a, b) { return a + b; }, 0);
    return { cls: c, name: c.name, head: head, body: c.stub ? [] : body, w: w, h: h, headH: headH, parts: parts,
             kids: [], up: null, x: 0, y: 0, row: 0 };
  }

  // ------------------------------------------------------------- laid out --
  // Built-on classes above those built on them, the way a family tree is
  // drawn: each class's own above the ones made from it, centred over
  // them, each generation a row.  What a class is built on is its parent;
  // with none of the program's own, the interface it says it has; with
  // neither, it starts a tree of its own.  Trees side by side, in the order
  // the code has them -- except that a class another one holds goes just
  // after the first that holds it, so the line between them is short.
  // `top` is the room the title takes above it all.
  function umlLaidOut(model, top) {
    var boxes = [], byName = Object.create(null);
    function add(c) {
      var b = umlBox(c);
      boxes.push(b);
      byName[c.name] = b;
      return b;
    }
    (model.classes || []).forEach(add);
    // what is built on that the code does not have: a stub for it
    (model.links || []).forEach(function (l) {
      if ((l.kind === "extends" || l.kind === "implements") && !byName[l.to]) {
        add({ name: l.to, stub: true, kind: l.kind === "implements" ? "interface" : "class" });
      }
    });
    // each one's place in its tree
    var ups = [];
    (model.links || []).forEach(function (l) {
      if (l.kind !== "extends" && l.kind !== "implements") { return; }
      var kid = byName[l.from], up = byName[l.to];
      if (!kid || !up || kid === up) { return; }
      ups.push({ kid: kid, up: up, kind: l.kind });
    });
    boxes.forEach(function (b) {
      var mine = ups.filter(function (u) { return u.kid === b; });
      var pick = mine.filter(function (u) { return u.kind === "extends" && !u.up.cls.stub; })[0] ||
                 mine.filter(function (u) { return !u.up.cls.stub; })[0] || mine[0];
      if (!pick) { return; }
      // never a tree going round on itself
      for (var a = pick.up; a; a = a.up) { if (a === b) { return; } }
      b.up = pick.up;
      b.upKind = pick.kind;
      pick.up.kids.push(b);
    });
    function rootOf(b) { while (b.up) { b = b.up; } return b; }
    var roots = [];
    boxes.forEach(function (b) {
      var r = rootOf(b);
      if (roots.indexOf(r) < 0) { roots.push(r); }
    });
    // a tree holding another: the held one just after it
    (model.links || []).forEach(function (l) {
      if (l.kind !== "has" || !byName[l.from] || !byName[l.to]) { return; }
      var from = rootOf(byName[l.from]), to = rootOf(byName[l.to]);
      var fi = roots.indexOf(from), ti = roots.indexOf(to);
      if (from === to || ti === fi + 1 || ti < fi) { return; }
      roots.splice(ti, 1);
      roots.splice(fi + 1, 0, to);
    });
    // Room between two trees side by side, or two branches of one: more
    // where a line joins them, for the name of the field it is -- a whole
    // number of squares, like the boxes, so they all stay on the ruling.
    var held = (model.links || []).filter(function (l) { return l.kind === "has" && byName[l.from] && byName[l.to]; });
    function under(b, into) { into.push(b); b.kids.forEach(function (k) { under(k, into); }); return into; }
    function gapAfter(a, b) {
      var left = under(a, []), right = under(b, []), most = 0;
      held.forEach(function (l) {
        var f = byName[l.from], t = byName[l.to];
        if ((left.indexOf(f) >= 0 && right.indexOf(t) >= 0) || (left.indexOf(t) >= 0 && right.indexOf(f) >= 0)) {
          most = Math.max(most, umlWide(l.label + (l.many ? "  *" : ""), false) + 56);
        }
      });
      return UML_STEP * Math.ceil(Math.max(UML_GAP, most) / UML_STEP);
    }
    function kidsWide(b) {
      return b.kids.reduce(function (s, k, i) { return s + k.span + (i ? gapAfter(b.kids[i - 1], k) : 0); }, 0);
    }
    // how wide each tree is, and where each box goes in it
    function wide(b) {
      b.kids.forEach(wide);
      b.span = Math.max(b.w, kidsWide(b));
      return b.span;
    }
    function rows(b, row) { b.row = row; b.kids.forEach(function (k) { rows(k, row + 1); }); }
    roots.forEach(function (r) { wide(r); rows(r, 0); });
    var rowH = [];
    boxes.forEach(function (b) { rowH[b.row] = Math.max(rowH[b.row] || 0, b.h); });
    var rowY = [], y = UML_EDGE + (top || 0);
    for (var r = 0; r < rowH.length; r++) {
      rowY[r] = y;
      y = umlSnap(y + rowH[r] + UML_ROWS);
    }
    function place(b, x0) {
      b.x = umlSnap(x0 + (b.span - b.w) / 2);
      b.y = rowY[b.row];
      var x = x0 + (b.span - kidsWide(b)) / 2;
      b.kids.forEach(function (k, i) {
        if (i) { x += gapAfter(b.kids[i - 1], k); }
        place(k, x);
        x += k.span;
      });
    }
    var x = UML_EDGE;
    roots.forEach(function (rt, i) {
      if (i) { x += gapAfter(roots[i - 1], rt); }
      place(rt, x);
      x += rt.span;
    });
    var foot = 0;
    boxes.forEach(function (b) { foot = Math.max(foot, b.y + b.h); });
    var w = Math.max(x + UML_EDGE, 160);
    var h = Math.max(umlSnap(foot + UML_EDGE + UML_STEP / 2), 120);
    return { boxes: boxes, byName: byName, ups: ups, w: Math.ceil(w), h: Math.ceil(h), rowY: rowY, rowH: rowH };
  }

  // ------------------------------------------------------------- the lines --
  // Where a line from a box's middle towards (tx, ty) leaves its edge.
  function umlEdgeOf(b, tx, ty) {
    var cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = tx - cx, dy = ty - cy;
    if (!dx && !dy) { return { x: cx, y: cy }; }
    var sx = dx ? (b.w / 2) / Math.abs(dx) : Infinity, sy = dy ? (b.h / 2) / Math.abs(dy) : Infinity;
    var s = Math.min(sx, sy);
    return { x: cx + dx * s, y: cy + dy * s };
  }

  function umlNum(n) { return String(Math.round(n * 10) / 10); }

  function umlEsc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // A line between the boxes: the color, weight and dashes of the chart's
  // arrows (.flow), unless it is one of UML's dashed ones.
  function umlFlow(d, dashed) {
    return '<path class="flow" d="' + d + '" fill="none"' + (dashed ? ' stroke-dasharray="6 4"' : "") + "/>";
  }
  // A hollow triangle with its point at (x, y), pointing the way (dx, dy)
  // goes: drawn in the arrows' ink and filled with the paper (.sheet), so it
  // stays hollow whatever color the paper is.
  function umlTriangle(x, y, dx, dy) {
    var len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len;
    var bx = x - ux * 14, by = y - uy * 14, px = -uy * 8, py = ux * 8;
    return '<polygon class="flow sheet" points="' + umlNum(x) + "," + umlNum(y) + " " + umlNum(bx + px) + "," +
           umlNum(by + py) + " " + umlNum(bx - px) + "," + umlNum(by - py) + '" fill="' + UML_PAPER + '"/>';
  }
  // An open arrowhead, the same way.
  function umlArrowHead(x, y, dx, dy) {
    var len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len;
    var bx = x - ux * 11, by = y - uy * 11, px = -uy * 6, py = ux * 6;
    return umlFlow("M" + umlNum(bx + px) + " " + umlNum(by + py) + " L" + umlNum(x) + " " + umlNum(y) +
                   " L" + umlNum(bx - px) + " " + umlNum(by - py), false);
  }

  // Words.  `cls` names what they are to the page: "label" along a line,
  // "title" and "author" at the top, nothing inside a box (the box's own).
  function umlText(x, y, text, how) {
    how = how || {};
    return '<text' + (how.cls ? ' class="' + how.cls + '"' : "") + ' x="' + umlNum(x) + '" y="' + umlNum(y) + '"' +
           (how.anchor ? ' text-anchor="' + how.anchor + '"' : "") +
           (how.bold ? ' font-weight="bold"' : "") + (how.italic ? ' font-style="italic"' : "") +
           (how.under ? ' text-decoration="underline"' : "") +
           (how.size ? ' font-size="' + umlNum(how.size) + '"' : "") +
           ' stroke="none" fill="' + (how.soft ? UML_SOFT : UML_INK) + '">' + umlEsc(text) + "</text>";
  }

  // The ruling, as the chart's: a fine line every square, a darker one
  // every fifth, from the corner of the sheet.
  function umlRuling(W, H) {
    var fine = [], major = [], n, at;
    for (n = 0, at = 0; at <= W + 0.01; n++, at += UML_STEP) {
      (n % 5 ? fine : major).push("M" + at + ",0V" + H);
    }
    for (n = 0, at = 0; at <= H + 0.01; n++, at += UML_STEP) {
      (n % 5 ? fine : major).push("M0," + at + "H" + W);
    }
    return '<path class="grid fine" d="' + fine.join("") + '" fill="none" stroke="' + UML_FINE +
           '" stroke-width="0.7" stroke-linecap="butt"/>\n' +
           '<path class="grid major" d="' + major.join("") + '" fill="none" stroke="' + UML_MAJOR +
           '" stroke-width="1" stroke-linecap="butt"/>';
  }

  // ------------------------------------------------------------ the drawing --
  // The whole diagram as an SVG made the way the chart is, to be put on the
  // paper, painted by the Style side and saved as it is.  `scale` makes it
  // bigger.  `said` says how: `title` and `by` (who made it), written at
  // the top as the chart has them; `face`, `px` and `bold`, how the words are
  // set; `grid`, whether the paper is ruled.
  function umlSvg(model, scale, said) {
    scale = scale || 1;
    said = said || {};
    var px = said.px > 0 ? said.px : 11;
    umlType = { face: said.face || "Arial, Helvetica, sans-serif", px: px, bold: !!said.bold,
                line: Math.max(14, Math.round(px * 1.5)), pad: Math.max(6, Math.round(px * 0.8)) };
    var title = String(said.title || "").trim(), by = String(said.by || "").trim();
    var top = title && by ? 40 : title || by ? 20 : 0;
    var laid = umlLaidOut(model, top), out = [];
    var W = Math.max(laid.w, title || by ? UML_STEP * Math.ceil((Math.max(umlWide(title, true, 16) * 1.1,
                                                                            umlWide(by, false)) + 2 * UML_EDGE) / UML_STEP) : 0);
    var H = laid.h;
    var names = (model.classes || []).map(function (c) { return c.name; }).join(", ");
    out.push('<?xml version="1.0" encoding="UTF-8"?>');
    out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.ceil(W * scale) + '" height="' +
             Math.ceil(H * scale) + '" viewBox="0 0 ' + W + " " + H + '" aria-label="' +
             umlEsc(title || names) + '">');
    out.push("<desc>" + umlEsc("Class diagram: " + names) + "</desc>");
    out.push('<rect class="sheet" width="100%" height="100%" fill="' + UML_PAPER + '"/>');
    if (said.grid) { out.push(umlRuling(W, H)); }
    // every word and every line inside the one group, as on the chart: the
    // page sets the typeface, the size and how heavy the lines are on it
    out.push('<g font-family="' + umlEsc(umlType.face) + '" font-size="' + umlNum(px) + '" fill="none" stroke="' +
             UML_INK + '" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">');
    if (title) {
      out.push(umlText(UML_EDGE, UML_EDGE + 12, title, { cls: "title", bold: true, size: 16 }));
    }
    if (by) { out.push(umlText(UML_EDGE, UML_EDGE + (title ? 29 : 12), by, { cls: "author" })); }
    var lines = [], marks = [], words = [];
    var small = px - 1;
    // built on: each parent's own drawn as one tree, the triangle at the parent
    laid.boxes.forEach(function (up) {
      if (!up.kids.length) { return; }
      var tx = up.x + up.w / 2, ty = up.y + up.h;
      var bus = laid.rowY[up.row + 1] - UML_ROWS / 2;
      var dashedAll = up.kids.every(function (k) { return k.upKind === "implements"; });
      var xs = up.kids.map(function (k) { return k.x + k.w / 2; }).concat([tx]);
      lines.push(umlFlow("M" + umlNum(tx) + " " + umlNum(ty + 14) + " V" + umlNum(bus), dashedAll));
      if (up.kids.length > 1 || Math.abs(xs[0] - tx) > 0.5) {
        lines.push(umlFlow("M" + umlNum(Math.min.apply(null, xs)) + " " + umlNum(bus) + " H" +
                           umlNum(Math.max.apply(null, xs)), dashedAll));
      }
      up.kids.forEach(function (k) {
        lines.push(umlFlow("M" + umlNum(k.x + k.w / 2) + " " + umlNum(bus) + " V" + umlNum(k.y),
                           k.upKind === "implements"));
      });
      marks.push(umlTriangle(tx, ty, 0, -1));
    });
    // built on, or saying it does, away from its own tree: a line of its own
    laid.ups.forEach(function (u) {
      if (u.kid.up === u.up) { return; }
      var to = { x: u.up.x + u.up.w / 2, y: u.up.y + u.up.h / 2 };
      var a = umlEdgeOf(u.kid, to.x, to.y), z = umlEdgeOf(u.up, a.x, a.y);
      lines.push(umlFlow("M" + umlNum(a.x) + " " + umlNum(a.y) + " L" + umlNum(z.x) + " " + umlNum(z.y),
                         u.kind === "implements"));
      marks.push(umlTriangle(z.x, z.y, z.x - a.x, z.y - a.y));
    });
    // holds: an open arrow to what it holds, the field's name beside it,
    // and * where it holds a list of them
    var pairs = Object.create(null);
    (model.links || []).forEach(function (l) {
      if (l.kind !== "has") { return; }
      var a0 = laid.byName[l.from], z0 = laid.byName[l.to];
      if (!a0 || !z0) { return; }
      var key = [l.from, l.to].sort().join("\n"), nth = pairs[key] = (pairs[key] || 0) + 1;
      var shift = (nth - 1) * 16;
      var a, z;
      if (a0 === z0) {
        // a field holding one of its own kind: a loop off its right side
        var rx = a0.x + a0.w, ry = a0.y + 14 + shift;
        lines.push(umlFlow("M" + umlNum(rx) + " " + umlNum(ry) + " h26 v26 h-26", false));
        marks.push(umlArrowHead(rx, ry + 26, -1, 0));
        words.push(umlText(rx + 30, ry + 17, l.label + (l.many ? " *" : ""), { cls: "label", soft: true, size: small }));
        return;
      }
      var ay0 = a0.y, ay1 = a0.y + a0.h, zy0 = z0.y, zy1 = z0.y + z0.h;
      var ax0 = a0.x, ax1 = a0.x + a0.w, zx0 = z0.x, zx1 = z0.x + z0.w;
      if (Math.max(ay0, zy0) + 12 < Math.min(ay1, zy1)) {
        // side by side: straight across, where both are, under their names
        var both = Math.min(ay1, zy1) - Math.max(ay0, zy0);
        var yy = Math.max(ay0, zy0) + Math.min(both / 2, Math.max(a0.headH, z0.headH) + 14) + shift;
        a = { x: ax1 <= zx0 ? ax1 : ax0, y: yy };
        z = { x: ax1 <= zx0 ? zx0 : zx1, y: yy };
      } else if (Math.max(ax0, zx0) + 12 < Math.min(ax1, zx1)) {
        // one over the other: straight up or down
        var xx = (Math.max(ax0, zx0) + Math.min(ax1, zx1)) / 2 + shift;
        a = { x: xx, y: ay1 <= zy0 ? ay1 : ay0 };
        z = { x: xx, y: ay1 <= zy0 ? zy0 : zy1 };
      }
      // neither: out of the side facing it, across to halfway between
      // them, up or down to where it is, and in at its side -- so that it
      // arrives the way it would side by side, room for its name and all
      var pts;
      if (a) {
        pts = [a, z];
      } else {
        var rightwards = ax1 <= zx0, mid = (rightwards ? (ax1 + zx0) / 2 : (zx1 + ax0) / 2) + shift;
        var fy = a0.y + Math.min(a0.h / 2, a0.headH + 14) + shift, ty = z0.y + Math.min(z0.h / 2, z0.headH + 14) + shift;
        pts = [{ x: rightwards ? ax1 : ax0, y: fy }, { x: mid, y: fy }, { x: mid, y: ty },
               { x: rightwards ? zx0 : zx1, y: ty }];
        a = pts[2];
        z = pts[3];
      }
      lines.push(umlFlow("M" + pts.map(function (p) { return umlNum(p.x) + " " + umlNum(p.y); }).join(" L"), false));
      marks.push(umlArrowHead(z.x, z.y, z.x - a.x, z.y - a.y));
      // the field's name and how many, at the end it points to, the way
      // UML names an end: * by the arrow, the name just past it, on one
      // side of the line (a second line between the same two, the other)
      var len = Math.sqrt(Math.pow(z.x - a.x, 2) + Math.pow(z.y - a.y, 2)) || 1;
      var ux = (z.x - a.x) / len, uy = (z.y - a.y) / len, side = nth % 2 ? 1 : -1;
      // across the line: upwards where it runs sideways, rightwards where it runs up or down
      var cx = uy, cy = -ux;
      if (Math.abs(ux) > 0.7 ? cy > 0 : cx < 0) { cx = -cx; cy = -cy; }
      cx *= side; cy *= side;
      var nameW = umlWide(l.label, false, small);
      var flat = Math.abs(ux) > 0.7, star = l.many ? 12 : 0;
      var back = flat ? 16 + star + nameW / 2 : 26 + star;
      var nx = z.x - ux * back + cx * (flat ? 9 : 8 + nameW / 2), ny = z.y - uy * back + cy * 9;
      words.push(umlText(nx, ny + 4, l.label, { cls: "label", anchor: "middle", soft: true, size: small }));
      if (l.many) {
        var sx = z.x - ux * 16 + cx * (flat ? 9 : 12), sy = z.y - uy * 16 + cy * 9;
        words.push(umlText(sx, sy + 5, "*", { cls: "label", anchor: "middle", soft: true }));
      }
    });
    out.push(lines.join("\n"));
    // The boxes over the lines, each a shape of the chart's (.node), drawn
    // in the colors a module wears on a flowchart (the kind "sub", Call a
    // module), which is what a class nearest is -- or, for one the program
    // only builds on, a plain step's (the kind "rect"): its outline,
    // a band across its name in a wash of the outline's own color (.inked,
    // filled with it by the page, faintly), so it shows on dark paper as on
    // light, and the lines between its parts.
    laid.boxes.forEach(function (b) {
      var g = ['<g class="node" data-kind="' + (b.cls.stub ? "rect" : "sub") + '" data-i="cls-' + umlEsc(b.name) +
               '" data-class="' + umlEsc(b.name) + '">'];
      g.push('<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="' + UML_PAPER + '"' +
             (b.cls.stub ? ' stroke-dasharray="5 3"' : "") + "/>");
      if (!b.cls.stub) {
        g.push('<rect class="inked" x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.headH +
               '" fill="' + UML_INK + '" fill-opacity="0.08"/>');
      }
      var y = b.y + 5;
      b.head.forEach(function (r) {
        y += umlType.line;
        g.push(umlText(b.x + b.w / 2, y - 5, r.text, { anchor: "middle", bold: r.bold, italic: r.italic,
                                                       soft: r.soft, size: r.soft ? small : 0 }));
      });
      var at = b.y + b.headH;
      b.body.forEach(function (rows, k) {
        g.push('<path d="M' + b.x + " " + at + " H" + (b.x + b.w) + '"/>');
        var yy = at + 5;
        rows.forEach(function (r) {
          yy += umlType.line;
          g.push(umlText(b.x + umlType.pad, yy - 5, r.text, { under: r.under, italic: r.italic }));
        });
        at += b.parts[k];
      });
      g.push("</g>");
      out.push(g.join(""));
    });
    out.push(marks.join("\n"));
    out.push(words.join("\n"));
    out.push("</g>");
    out.push("</svg>");
    return { svg: out.join("\n"), w: W, h: H, laid: laid };
  }

  // ------------------------------------------------------------ as Mermaid --
  // The same classes as Mermaid writes them: each class's members as
  // "Type name" lines, generics with ~ for < and >, $ after what belongs to
  // the class and * after what is only said, then the lines between them.
  function umlMermaid(model) {
    var rows = ["classDiagram"];
    function generic(t) { return String(t || "").replace(/[<>]/g, "~"); }
    function name(n) { return /^[A-Za-z_][\w]*$/.test(n) ? n : "`" + n + "`"; }
    (model.classes || []).forEach(function (c) {
      rows.push("    class " + name(c.name) + " {");
      var kindWord = c.kind === "interface" ? "interface" : c.kind === "enum" ? "enumeration"
                   : c.kind === "struct" ? "struct" : c.kind === "record" ? "record" : c.abstract ? "abstract" : "";
      if (kindWord) { rows.push("        <<" + kindWord + ">>"); }
      (c.values || []).forEach(function (v) { rows.push("        " + v); });
      (c.fields || []).forEach(function (f) {
        rows.push("        " + (UML_MARK[f.vis] || "+") + (f.type ? generic(f.type) + " " : "") + f.name + (f.statik ? "$" : ""));
      });
      (c.methods || []).forEach(function (m) {
        var params = (m.params || []).map(function (p) { return (p.type ? generic(p.type) + " " : "") + p.name; });
        rows.push("        " + (UML_MARK[m.vis] || "+") + m.name + "(" + params.join(", ") + ")" +
                  (m.abstract ? "*" : m.statik ? "$" : "") + (m.type ? " " + generic(m.type) : ""));
      });
      rows.push("    }");
    });
    (model.links || []).forEach(function (l) {
      if (l.kind === "extends") { rows.push("    " + name(l.to) + " <|-- " + name(l.from)); }
      else if (l.kind === "implements") { rows.push("    " + name(l.to) + " <|.. " + name(l.from)); }
      else if (l.kind === "has") {
        rows.push("    " + name(l.from) + " --> " + (l.many ? '"*" ' : "") + name(l.to) + (l.label ? " : " + l.label : ""));
      }
    });
    return rows.join("\n") + "\n";
  }

  // ---------------------------------------------------------- on the paper --
  // Options' "Draw as: Class diagram" (#o-classes, the Code tab only).
  // Build reads the code and runs it as it always does; what goes on the
  // paper is the class diagram in the flowchart's place, so the Files
  // buttons -- SVG, PNG, PDF, Copy, Print -- take it as they take a chart,
  // and Mermaid text writes it as Mermaid's classDiagram.  Code with no
  // classes is drawn as a flowchart still, and Build says why.
  var umlOnPaper = null;            // { model, w, h } while one is on the paper
  var umlNone = false;              // asked for, and the code had no classes

  function classesAsked() {
    return !!(byLang && !byHand && optionOn("o-classes"));
  }

  // The classes the code was last read into -- read again where the code
  // has moved on since (a page put back, a file opened), unless it is big
  // enough that reading it here would hold the page still.
  function classesNow() {
    if (langUml && langFrom === langKey()) { return langUml; }
    if (langBig()) { return langUml; }
    try { langUml = codeToPseudo(langAll(), langNow()).uml || null; }
    catch (e) { /* the code does not read: the flowchart says why */ }
    return langUml;
  }

  // How the chart's words are set now, as the Style side has them: the
  // typeface and size paint() will put on the drawing, so the boxes are
  // measured in what they will be drawn in.  A new typeface or size has the
  // chart drawn again (reflowSoon), and this again with it.
  function classesLook() {
    var L = lettersOf();
    return { face: CAN_REFLOW && L.face && FACES[L.face] ? FACES[L.face] : FACES.sans,
             px: CAN_REFLOW && chartPt() !== PLAIN_PT ? ptPx(chartPt()) : typeBase(),
             bold: !!L.bold };
  }

  // What Build puts on the paper: `svg`, the flowchart, or the class
  // diagram in its place.
  function classesInstead(svg) {
    umlOnPaper = null;
    umlNone = false;
    if (!classesAsked()) { return svg; }
    var model = classesNow();
    if (!model || !model.classes || !model.classes.length) {
      umlNone = true;
      return svg;
    }
    var look = classesLook();
    var drawn = umlSvg(model, 1, { title: el("#f-title") ? el("#f-title").value : "",
                                   by: el("#f-author") ? el("#f-author").value : "",
                                   face: look.face, px: look.px, bold: look.bold,
                                   grid: el("#f-grid") ? el("#f-grid").checked : true });
    umlOnPaper = { model: model, w: drawn.w, h: drawn.h };
    return drawn.svg;
  }
