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
  // were written, in `said.uml`; this draws them, as an SVG like the chart's,
  // to be saved as SVG or PNG or copied, and writes them as Mermaid, whose
  // classDiagram GitHub, GitLab and Notion draw.

  var UML_MARK = { "private": "-", "protected": "#", "public": "+", "package": "~", "internal": "~" };
  var UML_FACE = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
  var UML_SIZE = 13, UML_LINE = 18, UML_PAD = 10, UML_EDGE = 24, UML_GAP = 48, UML_ROWS = 64;
  var UML_INK = "#1f2328", UML_SOFT = "#57606a", UML_HEAD = "#eaf0f7", UML_PAPER = "#ffffff";

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

  // How wide some words come out.  On the page the browser measures them
  // in the typeface they are drawn in; with no page about (the tests), a
  // fair guess at it.
  var umlPen = null;
  function umlWide(text, bold) {
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
      umlPen.font = (bold ? "bold " : "") + UML_SIZE + "px " + UML_FACE;
      return umlPen.measureText(text).width;
    }
    return String(text).length * UML_SIZE * (bold ? 0.62 : 0.56);
  }

  // -------------------------------------------------------------- the boxes --
  // Each class as a box: its rows of words, how wide and tall, and where
  // its compartments meet.  A class the code builds on but does not have
  // -- Exception, JFrame, Comparable -- is a box with only its name (a stub).
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
    var w = 0;
    head.forEach(function (r) { w = Math.max(w, umlWide(r.text, r.bold) + 2 * UML_PAD); });
    body.forEach(function (rows) {
      rows.forEach(function (r) { w = Math.max(w, umlWide(r.text, false) + 2 * UML_PAD); });
    });
    w = Math.ceil(Math.max(w, c.stub ? 90 : 130));
    var headH = head.length * UML_LINE + 10;
    var parts = c.stub ? [] : body.map(function (rows) { return rows.length ? rows.length * UML_LINE + 10 : 12; });
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
  function umlLaidOut(model) {
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
    // where a line joins them, for the name of the field it is.
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
      return Math.ceil(Math.max(UML_GAP, most));
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
    var rowY = [], y = UML_EDGE;
    for (var r = 0; r < rowH.length; r++) { rowY[r] = y; y += rowH[r] + UML_ROWS; }
    function place(b, x0) {
      b.x = Math.round(x0 + (b.span - b.w) / 2);
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
    var w = Math.max(x + UML_EDGE, 160);
    var h = Math.max(y - UML_ROWS + UML_EDGE, 80);
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

  // A hollow triangle with its point at (x, y), pointing the way (dx, dy) goes.
  function umlTriangle(x, y, dx, dy) {
    var len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len;
    var bx = x - ux * 14, by = y - uy * 14, px = -uy * 8, py = ux * 8;
    return '<path d="M' + umlNum(x) + " " + umlNum(y) + " L" + umlNum(bx + px) + " " + umlNum(by + py) +
           " L" + umlNum(bx - px) + " " + umlNum(by - py) + ' Z" fill="' + UML_PAPER + '" stroke="' + UML_INK +
           '" stroke-width="1.3" stroke-linejoin="round"/>';
  }
  // An open arrowhead, the same way.
  function umlArrowHead(x, y, dx, dy) {
    var len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len;
    var bx = x - ux * 11, by = y - uy * 11, px = -uy * 6, py = ux * 6;
    return '<path d="M' + umlNum(bx + px) + " " + umlNum(by + py) + " L" + umlNum(x) + " " + umlNum(y) +
           " L" + umlNum(bx - px) + " " + umlNum(by - py) + '" fill="none" stroke="' + UML_INK +
           '" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>';
  }

  function umlText(x, y, text, how) {
    how = how || {};
    return '<text x="' + umlNum(x) + '" y="' + umlNum(y) + '"' +
           (how.anchor ? ' text-anchor="' + how.anchor + '"' : "") +
           (how.bold ? ' font-weight="bold"' : "") + (how.italic ? ' font-style="italic"' : "") +
           (how.under ? ' text-decoration="underline"' : "") +
           ' fill="' + (how.soft ? UML_SOFT : UML_INK) + '"' +
           (how.small ? ' font-size="' + (UML_SIZE - 1) + '"' : "") + ">" + umlEsc(text) + "</text>";
  }

  // ------------------------------------------------------------ the drawing --
  // The whole diagram as an SVG, white paper and dark ink, to be shown on
  // the page and saved as it is.  `scale` makes it bigger (for a PNG);
  // `said` may hold a title and who made it, written at the top the way the
  // chart has them.
  function umlSvg(model, scale, said) {
    scale = scale || 1;
    said = said || {};
    var laid = umlLaidOut(model), out = [];
    var title = String(said.title || "").trim(), by = String(said.by || "").trim();
    var top = title || by ? 36 : 0;
    var W = Math.max(laid.w, title || by ? Math.ceil(umlWide(title + "   " + by, true) * 15 / UML_SIZE) + 2 * UML_EDGE : 0);
    var H = laid.h + top;
    out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.ceil(W * scale) + '" height="' +
             Math.ceil(H * scale) + '" viewBox="0 0 ' + W + " " + H + '" font-family="' + umlEsc(UML_FACE) +
             '" font-size="' + UML_SIZE + '">');
    out.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="' + UML_PAPER + '"/>');
    if (top) {
      out.push('<text x="' + UML_EDGE + '" y="' + (UML_EDGE + 4) + '" font-size="15" fill="' + UML_INK + '">' +
               (title ? '<tspan font-weight="bold">' + umlEsc(title) + "</tspan>" : "") +
               (by ? '<tspan fill="' + UML_SOFT + '"' + (title ? ' dx="12"' : "") + ">" + umlEsc(by) + "</tspan>" : "") +
               "</text>");
      out.push('<g transform="translate(0 ' + top + ')">');
    }
    var lines = [], marks = [], words = [];
    // built on: each parent's own drawn as one tree, the triangle at the parent
    laid.boxes.forEach(function (up) {
      if (!up.kids.length) { return; }
      var px = up.x + up.w / 2, py = up.y + up.h;
      var bus = laid.rowY[up.row + 1] - UML_ROWS / 2;
      var dashedAll = up.kids.every(function (k) { return k.upKind === "implements"; });
      var dash = dashedAll ? ' stroke-dasharray="6 4"' : "";
      var xs = up.kids.map(function (k) { return k.x + k.w / 2; }).concat([px]);
      lines.push('<path d="M' + umlNum(px) + " " + umlNum(py + 14) + " V" + umlNum(bus) + '" fill="none" stroke="' +
                 UML_INK + '" stroke-width="1.3"' + dash + "/>");
      if (up.kids.length > 1 || Math.abs(xs[0] - px) > 0.5) {
        lines.push('<path d="M' + umlNum(Math.min.apply(null, xs)) + " " + umlNum(bus) + " H" +
                   umlNum(Math.max.apply(null, xs)) + '" fill="none" stroke="' + UML_INK + '" stroke-width="1.3"' + dash + "/>");
      }
      up.kids.forEach(function (k) {
        var kx = k.x + k.w / 2;
        lines.push('<path d="M' + umlNum(kx) + " " + umlNum(bus) + " V" + umlNum(k.y) + '" fill="none" stroke="' +
                   UML_INK + '" stroke-width="1.3"' + (k.upKind === "implements" ? ' stroke-dasharray="6 4"' : "") + "/>");
      });
      marks.push(umlTriangle(px, py, 0, -1));
    });
    // built on, or saying it does, away from its own tree: a line of its own
    laid.ups.forEach(function (u) {
      if (u.kid.up === u.up) { return; }
      var to = { x: u.up.x + u.up.w / 2, y: u.up.y + u.up.h / 2 };
      var a = umlEdgeOf(u.kid, to.x, to.y), z = umlEdgeOf(u.up, a.x, a.y);
      lines.push('<path d="M' + umlNum(a.x) + " " + umlNum(a.y) + " L" + umlNum(z.x) + " " + umlNum(z.y) +
                 '" fill="none" stroke="' + UML_INK + '" stroke-width="1.3"' +
                 (u.kind === "implements" ? ' stroke-dasharray="6 4"' : "") + "/>");
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
        var rx = a0.x + a0.w, ty = a0.y + 14 + shift;
        lines.push('<path d="M' + umlNum(rx) + " " + umlNum(ty) + " h26 v26 h-26" + '" fill="none" stroke="' +
                   UML_INK + '" stroke-width="1.3"/>');
        marks.push(umlArrowHead(rx, ty + 26, -1, 0));
        words.push(umlText(rx + 30, ty + 17, l.label + (l.many ? " *" : ""), { soft: true, small: true }));
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
      lines.push('<path d="M' + pts.map(function (p) { return umlNum(p.x) + " " + umlNum(p.y); }).join(" L") +
                 '" fill="none" stroke="' + UML_INK + '" stroke-width="1.3" stroke-linejoin="round"/>');
      marks.push(umlArrowHead(z.x, z.y, z.x - a.x, z.y - a.y));
      // the field's name and how many, at the end it points to, the way
      // UML names an end: * by the arrow, the name just past it, on one
      // side of the line (a second line between the same two, the other)
      var len = Math.sqrt(Math.pow(z.x - a.x, 2) + Math.pow(z.y - a.y, 2)) || 1;
      var ux = (z.x - a.x) / len, uy = (z.y - a.y) / len, side = nth % 2 ? 1 : -1;
      // across the line: upwards where it runs sideways, rightwards where it runs up or down
      var px = uy, py = -ux;
      if (Math.abs(ux) > 0.7 ? py > 0 : px < 0) { px = -px; py = -py; }
      px *= side; py *= side;
      var nameW = umlWide(l.label, false) * (UML_SIZE - 1) / UML_SIZE;
      var flat = Math.abs(ux) > 0.7, star = l.many ? 12 : 0;
      var back = flat ? 16 + star + nameW / 2 : 26 + star;
      var nx = z.x - ux * back + px * (flat ? 9 : 8 + nameW / 2), ny = z.y - uy * back + py * 9;
      words.push(umlText(nx, ny + 4, l.label, { anchor: "middle", soft: true, small: true }));
      if (l.many) {
        var sx = z.x - ux * 16 + px * (flat ? 9 : 12), sy = z.y - uy * 16 + py * 9;
        words.push(umlText(sx, sy + 5, "*", { anchor: "middle", soft: true }));
      }
    });
    out.push(lines.join(""));
    // the boxes over the lines
    laid.boxes.forEach(function (b) {
      var g = ['<g data-class="' + umlEsc(b.name) + '">'];
      g.push('<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="' + UML_PAPER +
             '" stroke="' + UML_INK + '" stroke-width="1.3"' + (b.cls.stub ? ' stroke-dasharray="5 3"' : "") + "/>");
      g.push('<rect x="' + (b.x + 0.65) + '" y="' + (b.y + 0.65) + '" width="' + (b.w - 1.3) + '" height="' +
             (b.headH - 1.3) + '" fill="' + UML_HEAD + '"/>');
      var y = b.y + 5;
      b.head.forEach(function (r) {
        y += UML_LINE;
        g.push(umlText(b.x + b.w / 2, y - 5, r.text, { anchor: "middle", bold: r.bold, italic: r.italic, soft: r.soft, small: r.soft }));
      });
      var top = b.y + b.headH;
      b.body.forEach(function (rows, k) {
        g.push('<path d="M' + b.x + " " + top + " H" + (b.x + b.w) + '" stroke="' + UML_INK + '" stroke-width="1.3"/>');
        var yy = top + 5;
        rows.forEach(function (r) {
          yy += UML_LINE;
          g.push(umlText(b.x + UML_PAD, yy - 5, r.text, { under: r.under, italic: r.italic }));
        });
        top += b.parts[k];
      });
      g.push("</g>");
      out.push(g.join(""));
    });
    out.push(marks.join(""));
    out.push(words.join(""));
    if (top) { out.push("</g>"); }
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
  // Options' "Draw the code as: Class diagram" (#o-classes, the Code tab
  // only).  Build reads the code and runs it as it always does; what goes
  // on the paper is the class diagram in the flowchart's place, so the
  // Files buttons -- SVG, PNG, PDF, Copy, Print -- take it as they take a
  // chart, and Mermaid text writes it as Mermaid's classDiagram.  Code with
  // no classes is drawn as a flowchart still, and Build says why.
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
    var drawn = umlSvg(model, 1, { title: el("#f-title") ? el("#f-title").value : "",
                                   by: el("#f-author") ? el("#f-author").value : "" });
    umlOnPaper = { model: model, w: drawn.w, h: drawn.h };
    return drawn.svg;
  }
