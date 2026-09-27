// ---------------------------------------------------------------------------
//  13-hand-tidy.js -- a drawing by hand, laid out the way pseudocode is
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ======================================================== tidying up ==
  // The best thing this package owns is the way it lays a chart out: nothing
  // overlapping, no arrow doubling back on itself, every shape on the
  // ruling, branches given columns of their own.  A chart drawn by hand can
  // have all of it, because the drawing can be written out as pseudocode
  // (handAsPseudocode, 12-check.js).  The writing goes to the very code the
  // pseudocode side draws with, and the chart that comes back says where
  // each shape stands and which way each arrow goes.  The shapes are carried
  // there, and every arrow is laid along the line that chart drew for it:
  // merging where its branches merge, coming round into a loop the way its
  // loops do (laidRoute, 10-hand.js).  The words, the colors, the kinds of
  // shape and what joins to what are all left as they are.
  //
  // It used to take only the places, and two things went wrong with that.
  // The pseudocode side shares one box between a run of Displays, so a
  // drawing of nine Display shapes came back as two boxes: two of the nine
  // had somewhere to go and the rest stayed where they were.  And the arrows
  // found their own ways between shapes standing in a layout made for arrows
  // of its own.  So the chart is asked for with every statement a shape of
  // its own, each exactly the size it is on the paper (settings.SIZES), and
  // the arrows are taken from it as well as the places (draw/svg.py PLAN).
  var TIDY_SEED = "20260101";            // one layout, however often it is asked
  var TIDY_ASIDE = 60;                   // room beside the chart for shapes it leaves out
  var tidyAsked = false;                 // waiting on the layout

  // The line each statement of the built program came from, by its number
  // in the chart -- which is the same number the drawn shapes carry.
  function linesById(ast) {
    var found = {};
    function walk(items) {
      (items || []).forEach(function (item) {
        if (item.id && item.line) { found[item.id] = item.line; }
        ["then", "else", "body"].forEach(function (key) {
          if (item[key]) { walk(item[key]); }
        });
        (item.cases || []).forEach(function (one) { walk(one.body); });
      });
    }
    walk(ast.main);
    (ast.modules || []).forEach(function (mod) { walk(mod.body); });
    return found;
  }

  // Asked for the way the pseudocode side asks for a chart, with its
  // settings -- roomier or compressed, the outline to aim at -- so that a
  // drawing tidied here stands the way the same program built from writing
  // would.  From the one seed, so the same drawing tidies the same way
  // every time and a second press moves nothing.
  //
  // Two things are asked differently, because the shapes here are bigger
  // than the ones the layout draws for itself: more room between them
  // (TIDY_ROOM, or an arrow between two boxes was nearly all head), and
  // the True and False measured at the size they are written here, so the
  // layout leaves them room enough.
  var TIDY_ROOM = 1.5;
  function tidyAsk(text, sizes) {
    var letters = lettersAsked();
    letters.size = HAND_TYPE * chartPt() / PLAIN_PT;
    letters.own = {};                    // the pseudocode side's steps, not these
    return Object.assign(chartOptions(), {
      text: text, title: "", author: "",
      shape: el("#f-shape") ? el("#f-shape").value : "auto",
      seed: TIDY_SEED,
      lang: el("#f-lang") ? el("#f-lang").value : "",
      legend: false, grid: true, shapes: geom, letters: letters,
      everyout: true, apart: true, sizes: sizes, plan: true, room: TIDY_ROOM
    });
  }

  // What the layout says, in terms of the shapes on the paper: where each
  // one stands, and the line each arrow is laid along.  The first place a
  // shape is written wins -- a shape the flow comes back to can be written
  // out more than once, and can only stand in one of the places it was
  // given.  An arrow the layout drew no line for, from where its shape
  // stands to where the other one stands, gets none, and finds its own way.
  function tidyLayout(data, fromLine, text) {
    var plan = data.plan, lineOf = linesById(data.ast);
    var written = String(text).split("\n");
    var shapes = [], first = {}, order = [];
    (plan.shapes || []).forEach(function (s) {
      var line = lineOf[s[0]], id = line ? fromLine[line] : null;
      var one = { x: s[2], y: s[3], w: s[4], h: s[5], line: line,
                  node: id ? nodeById(+id) : null };
      shapes.push(one);
      if (one.node && !first[one.node.id]) {
        first[one.node.id] = one;
        order.push(one.node.id);
      }
    });
    var routes = (plan.routes || []).filter(function (r) { return r[0].length > 1; })
                                    .map(function (r) { return { pts: r[0], head: r[1] }; });

    function on(s, p) {                  // on a shape, or on its outline
      return Math.abs(p[0] - s.x) <= s.w / 2 + 1.5 && Math.abs(p[1] - s.y) <= s.h / 2 + 1.5;
    }
    function shapeAt(p) {
      for (var i = 0; i < shapes.length; i++) { if (on(shapes[i], p)) { return shapes[i]; } }
      return null;
    }
    function same(p, q) { return Math.abs(p[0] - q[0]) < 0.6 && Math.abs(p[1] - q[1]) < 0.6; }
    function along(p, a, b) {            // somewhere on the run from a to b, short of b
      if (same(p, b)) { return false; }
      if (Math.abs(a[0] - b[0]) < 0.6) {
        return Math.abs(p[0] - a[0]) < 0.6 && (p[1] - a[1]) * (p[1] - b[1]) <= 0.4;
      }
      return Math.abs(a[1] - b[1]) < 0.6 && Math.abs(p[1] - a[1]) < 0.6 &&
             (p[0] - a[0]) * (p[0] - b[0]) <= 0.4;
    }
    // Where a line goes on to from a point short of any shape: the line that
    // starts there, or the rest of one it has run into the side of.
    function onward(p, from) {
      var k, j;
      for (k = 0; k < routes.length; k++) {
        if (routes[k] !== from && same(routes[k].pts[0], p)) { return { r: routes[k], at: 0 }; }
      }
      for (k = 0; k < routes.length; k++) {
        if (routes[k] === from) { continue; }
        for (j = 0; j < routes[k].pts.length - 1; j++) {
          if (along(p, routes[k].pts[j], routes[k].pts[j + 1])) { return { r: routes[k], at: j }; }
        }
      }
      return null;
    }
    // A line out of a shape, followed through every point it meets another
    // until it comes to a shape: the shape, the whole way there, and how
    // much of the way is this arrow's own to draw.  That is all of it,
    // except where it carries a head in mid-air: a loop coming round points
    // into the line above its test, and that line is the one that goes on.
    function follow(r0) {
      var pts = r0.pts.map(function (p) { return [p[0], p[1]]; });
      var r = r0, drawn = 0;
      for (var hops = 0; hops < 40; hops++) {
        var end = pts[pts.length - 1];
        var hit = shapeAt(end);
        if (hit) {
          return { to: hit, full: pts, drawn: drawn ? pts.slice(0, drawn) : pts, meets: !!drawn };
        }
        if (r.head && !drawn) { drawn = pts.length; }
        var next = onward(end, r);
        if (!next) { return null; }
        next.r.pts.slice(next.at + 1).forEach(function (p) { pts.push([p[0], p[1]]); });
        r = next.r;
      }
      return null;
    }
    function wordBy(start) {             // the True or False beside a way out
      var best = null, far = 90;
      (plan.labels || []).forEach(function (l) {
        var d = Math.hypot(l[1] - start[0], l[2] - start[1]);
        if (d < far) { far = d; best = l; }
      });
      return best;
    }

    var laid = {};
    order.forEach(function (id) {
      var node = nodeById(id), from = first[id];
      var asks = asksKind(node.kind);
      var ways = routes.filter(function (r) { return on(from, r.pts[0]); })
                       .map(function (r) {
                         return { walk: follow(r), word: asks ? wordBy(r.pts[0]) : null };
                       })
                       .filter(function (w) { return w.walk; });
      var outs = [];
      hand.links.forEach(function (link, li) { if (link.from === id) { outs.push(li); } });
      // A decision's two ways out, where both go to the same shape, are
      // told apart by the word the layout put on each.  Its True is the
      // arrow the writing made the Then of it -- or, for a loop written
      // "While NOT (...)", the one that goes round.
      var yes = null;
      if (asks && outs.length === 2) {
        var both = bothWays(id);
        yes = /^\s*While NOT \(/.test(written[from.line - 1] || "") ? both[1] : both[0];
      }
      outs.forEach(function (li) {
        var link = hand.links[li], to = first[link.to];
        var fits = ways.filter(function (w) { return !w.used && w.walk.to === to; });
        if (fits.length > 1 && yes) {
          var want = link === yes ? plan.yes : plan.no;
          fits.sort(function (p, q) {
            return (q.word && q.word[0] === want ? 1 : 0) - (p.word && p.word[0] === want ? 1 : 0);
          });
        }
        if (!fits.length) { return; }
        var way = fits[0], full = tidy(way.walk.full), pts = tidy(way.walk.drawn);
        way.used = true;
        if (full.length < 2 || pts.length < 2) { return; }
        laid[li] = { full: full, pts: pts, meets: way.walk.meets,
                     word: link.label && way.word
                       ? { x: way.word[1], y: way.word[2], anchor: way.word[3] } : null };
      });
    });
    hand.nodes.forEach(function (n) {    // and the shapes it left out, after
      if (!first[n.id]) { order.push(n.id); }
    });
    return { places: first, laid: laid, order: order };
  }

  // An end of a laid line brought onto the shape as it is drawn here: the
  // layout's outline and this shape's can differ by a few pixels -- the
  // slope of a parallelogram, a shape drawn as a box where the layout drew
  // it as a document.  Only the depth changes, never which way the run goes.
  function tidyOnPort(pts, k, node, side) {
    var port = ports(node)[side], at = pts[k], next = pts[k ? k - 1 : 1];
    var axis = side < 2 ? 1 : 0, was = at[axis];
    at[axis] = Math.round((axis ? port.y : port.x) * 2) / 2;
    if ((next[axis] - at[axis]) * (next[axis] - was) <= 0) { at[axis] = was; }
  }

  // The layout, put on the paper the way the pseudocode side puts a chart
  // on its paper: in the corner, with the same wall of paper round it on
  // every side (TIDY_WALL, as MARGIN in settings.py), so the paper shrinks
  // or grows to fit it.  Its first shape lands on the ruling.  How many
  // shapes moved, or null when the layout had nowhere for any of them.
  var TIDY_WALL = 2 * HAND_RULE;
  function tidyApply(layout) {
    var ids = Object.keys(layout.places);
    if (!ids.length) { return null; }
    var now = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    var before = {};
    hand.nodes.forEach(function (n) { before[n.id] = [n.x, n.y]; });
    ids.forEach(function (id) {
      var s = layout.places[id];
      now.x0 = Math.min(now.x0, s.x - s.w / 2); now.x1 = Math.max(now.x1, s.x + s.w / 2);
      now.y0 = Math.min(now.y0, s.y - s.h / 2); now.y1 = Math.max(now.y1, s.y + s.h / 2);
    });
    // and the lines, which can go round the outside of every shape
    Object.keys(layout.laid).forEach(function (li) {
      layout.laid[li].full.forEach(function (p) {
        now.x0 = Math.min(now.x0, p[0]); now.x1 = Math.max(now.x1, p[0]);
        now.y0 = Math.min(now.y0, p[1]); now.y1 = Math.max(now.y1, p[1]);
      });
    });
    var lead = layout.places[layout.order[0]];
    // up to the ruling rather than to the nearest line of it: never nearer
    // the edge than the wall
    var dx = Math.ceil((lead.x + TIDY_WALL - now.x0) / HAND_GRID - 0.001) * HAND_GRID - lead.x;
    var dy = Math.ceil((lead.y + TIDY_WALL - now.y0) / HAND_GRID - 0.001) * HAND_GRID - lead.y;
    ids.forEach(function (id) {
      var n = nodeById(+id), s = layout.places[id];
      n.x = Math.round(s.x + dx);
      n.y = Math.round(s.y + dy);
    });
    // A shape the flow never reaches -- an arrow not drawn yet, a note off
    // to one side -- goes down the side of the chart, in the order it stood
    // in from the top, rather than being left somewhere out across the
    // paper with the chart gone from round it.
    var stray = hand.nodes.filter(function (n) { return !layout.places[n.id]; });
    stray.sort(function (p, q) { return (p.y - q.y) || (p.x - q.x); });
    var aside = now.x1 + dx + TIDY_ASIDE, down = now.y0 + dy;
    stray.forEach(function (n) {
      var t = turned(n);
      n.x = Math.round((aside + t.w / 2) / HAND_GRID) * HAND_GRID;
      n.y = Math.round((down + t.h / 2) / HAND_GRID) * HAND_GRID;
      down += t.h + CLEAR;
    });
    // Every arrow laid along its line, and the sides it leaves and meets its
    // shapes by kept as the sides it leans to, should it ever have to find
    // its own way again.  One with no line finds its own way now.
    hand.links.forEach(function (link, li) {
      var lay = layout.laid[li], a = nodeById(link.from), b = nodeById(link.to);
      delete link.laid;
      if (!lay || !a || !b) { delete link.fromSide; delete link.toSide; return; }
      function moved(p) { return [Math.round(p[0] + dx), Math.round(p[1] + dy)]; }
      var full = lay.full.map(moved), pts = lay.pts.map(moved), n = full.length - 1;
      var sides = [sideFrom(full[1][0] - full[0][0], full[1][1] - full[0][1]),
                   sideFrom(full[n][0] - full[n - 1][0], full[n][1] - full[n - 1][1], true)];
      tidyOnPort(pts, 0, a, sides[0]);
      if (!lay.meets) { tidyOnPort(pts, pts.length - 1, b, sides[1]); }
      link.fromSide = PORT_SIDES[sides[0]];
      link.toSide = PORT_SIDES[sides[1]];
      link.laid = { pts: pts, from: link.fromSide, to: link.toSide, meets: lay.meets,
                    sign: laidSign(a, b),
                    word: lay.word ? { x: lay.word.x + dx, y: lay.word.y + dy,
                                       anchor: lay.word.anchor } : null };
    });
    return hand.nodes.filter(function (n) {
      var b = before[n.id];
      return b && (Math.abs(b[0] - n.x) > 0.5 || Math.abs(b[1] - n.y) > 0.5);
    }).length;
  }

  // ---- carried there -------------------------------------------------------
  // A tidied drawing does not simply turn out to have been tidied.  The
  // arrows it had let go first, fading where they were; every shape is
  // carried from where it stood to where it goes, one after another down the
  // chart, each taking longer the further it has to go and settling as it
  // arrives; and each arrow is drawn in along its new line once both its
  // shapes are down, its head landing as the line reaches it and its word
  // after that.  The view holds still throughout.  Any press, key or turn
  // of the wheel lands everything at once, and a computer asked to keep
  // still is shown none of it.
  var TIDY_FADE = 180;                   // ms the old arrows take to go
  var TIDY_OFF = 70;                     // ms before the first shape sets off
  var TIDY_STEP = 40;                    // and between one setting off and the next,
  var TIDY_STEPS = 440;                  //   however many there are, all told
  var TIDY_SHORT = 380, TIDY_LONG = 780; // ms a move takes, nearest to furthest,
  var TIDY_PACE = 0.45;                  //   a ms for so many px of the way between
  var TIDY_PEN = 1.8;                    // px a ms an arrow is drawn at
  var TIDY_LEAST = 110, TIDY_MOST = 440; // ms, the least and the most one takes
  var TIDY_POP = 150;                    // ms a head or a word takes to land
  var TIDY_BIG = 300;                    // shapes, past which it simply arrives
  var TIDY_LIFT = 60;                    // and past which none is lifted as it goes
  var tidyMove = null;                   // the move under way, if one is

  // Starting gently and settling slowly, like a thing with some weight to
  // it being put down -- cubic-bezier(.4, 0, .15, 1), worked out by hand.
  function tidyEase(t) {
    if (t <= 0) { return 0; }
    if (t >= 1) { return 1; }
    function bez(u, a, b) { return 3 * a * u * (1 - u) * (1 - u) + 3 * b * u * u * (1 - u) + u * u * u; }
    var lo = 0, hi = 1, u = t;
    for (var i = 0; i < 24; i++) {       // where along the curve x is t
      u = (lo + hi) / 2;
      if (bez(u, 0.4, 0.15) < t) { lo = u; } else { hi = u; }
    }
    return bez(u, 0, 1);
  }

  // Where everything stood, and how the paper under it was, before the
  // drawing changes.
  function tidyLook() {
    if (!chart || !chart.isConnected || !byHand) { return null; }
    var at = {}, stage = el("#stage"), box = chart.viewBox && chart.viewBox.baseVal;
    hand.nodes.forEach(function (n) { at[n.id] = { x: n.x, y: n.y }; });
    return { svg: chart, at: at, origin: { x: handOrigin.x, y: handOrigin.y },
             w: box ? box.width : 0, h: box ? box.height : 0,
             scroll: stage ? [stage.scrollLeft, stage.scrollTop] : null, hold: [holdX, holdY] };
  }

  // A tidied chart can want a much smaller paper than the drawing it came
  // from, or a bigger one.  The paper goes from the one to the other with
  // the shapes rather than all at once -- a paper that shrank at the first
  // frame left the shapes still on their way cut off at its edge, and
  // jumped to the middle of the stage besides -- and it is never smaller
  // than the shapes on it, wherever they have got to.  A sheet and a
  // ruling big enough for both papers stand in under it while it changes.
  function tidyPaper(m, before) {
    var svg = m.svg, NS = "http://www.w3.org/2000/svg";
    var real = [el("rect.sheet", svg), el(".grid.fine", svg), el(".grid.major", svg)];
    if (real.some(function (e) { return !e; })) { return false; }
    var u = m.all;
    var paper = document.createElementNS(NS, "g");
    paper.setAttribute("class", "tidy-paper");
    var sheet = real[0].cloneNode(false);
    [["x", u.x0], ["y", u.y0], ["width", u.x1 - u.x0], ["height", u.y1 - u.y0]].forEach(function (a) {
      sheet.setAttribute(a[0], a[1]);
    });
    paper.appendChild(sheet);
    var fine = [], major = [], ruled = handOrigin.x / HAND_RULE, k;
    for (k = Math.ceil(u.x0 / HAND_RULE); k * HAND_RULE <= u.x1; k++) {   // as drawHand rules it
      ((((k - ruled) % 5) + 5) % 5 ? fine : major).push("M" + k * HAND_RULE + "," + u.y0 + "V" + u.y1);
    }
    for (k = Math.ceil(u.y0 / HAND_RULE); k * HAND_RULE <= u.y1; k++) {
      ((k % 5 + 5) % 5 ? fine : major).push("M" + u.x0 + "," + k * HAND_RULE + "H" + u.x1);
    }
    [[real[1], fine], [real[2], major]].forEach(function (pair) {
      var lines = pair[0].cloneNode(false);
      lines.setAttribute("d", pair[1].join(""));
      paper.appendChild(lines);
    });
    svg.insertBefore(paper, real[0]);
    real.forEach(function (e) { e.style.visibility = "hidden"; });
    m.paper = paper;
    m.real = real;
    // At its first frame, the paper it had, where it was on the screen.
    var stage = el("#stage"), wrap = el("#sheet");
    if (wrap) { wrap.style.transition = "none"; wrap.style.transform = ""; }
    m.sheetAt(0);
    if (loose) { holdX = before.hold[0]; holdY = before.hold[1]; holdApply(); }
    else if (stage && before.scroll) {
      stage.scrollLeft = before.scroll[0];
      stage.scrollTop = before.scroll[1];
    }
    return true;
  }

  function tidyMotion(before, order) {
    var svg = chart;
    if (!before || !svg || STILL || document.hidden || hand.nodes.length > TIDY_BIG) { return; }
    var box = svg.viewBox && svg.viewBox.baseVal;
    var layer = el("g[font-family]", svg);
    if (!box || !box.width || !before.w || !layer) { return; }
    // Where the paper it had is, in the new paper's numbers: more paper on
    // the left, or a key along the top, moves where the drawing's own 0 is.
    var ox = handOrigin.x - before.origin.x, oy = handOrigin.y - before.origin.y;
    var W1 = box.width, H1 = box.height;
    var m = { svg: svg, viewBox: svg.getAttribute("viewBox"), width: svg.style.width,
              moves: [], lines: [], end: 0, shift: 0,
              all: { x0: Math.min(0, ox), y0: Math.min(0, oy),
                     x1: Math.max(W1, ox + before.w), y1: Math.max(H1, oy + before.h) } };

    // the arrows it had, where they were
    m.ghost = document.createElementNS("http://www.w3.org/2000/svg", "g");
    m.ghost.setAttribute("class", "tidy-ghost");
    m.ghost.setAttribute("pointer-events", "none");
    m.ghost.setAttribute("transform", "translate(" + ox + " " + oy + ")");
    all(".link .flow, .link .patch, .link .label, .tips .head", before.svg).forEach(function (e) {
      m.ghost.appendChild(e.cloneNode(true));
    });
    layer.insertBefore(m.ghost, layer.firstChild);

    // the shapes, and whatever stands round one, from where they stood
    var landed = {}, count = order.length;
    var gap = Math.min(TIDY_STEP, TIDY_STEPS / Math.max(1, count - 1));
    order.forEach(function (id, k) {
      var n = nodeById(id), was = before.at[id];
      if (!n || !was) { return; }
      var t = turned(n);
      var mv = { n: n, w: t.w, h: t.h, dx: was.x - n.x, dy: was.y - n.y, p: -1 };
      m.moves.push(mv);
      var far = Math.hypot(mv.dx, mv.dy);
      if (far < 0.5) { landed[id] = 0; mv.p = 1; mv.bits = []; return; }
      mv.bits = all('.node[data-i="h' + id + '"], .rule-dot[data-hint="' + id + '"], [data-i="' + id + '"]', svg)
        .map(function (e) { return { el: e, own: e.getAttribute("transform") || "" }; });
      mv.at = TIDY_OFF + k * gap;
      mv.takes = Math.min(TIDY_LONG, TIDY_SHORT + far * TIDY_PACE);
      landed[id] = mv.at + mv.takes;
      m.shift = Math.max(m.shift, mv.at + mv.takes);
    });
    m.end = m.shift;
    m.lift = m.moves.length <= TIDY_LIFT;

    // The paper, `e` of the way from the one it had to the one it has now,
    // and big enough for every shape where it has got to.
    m.sheetAt = function (e) {
      var q = 1 - e;
      var x0 = ox * q, y0 = oy * q;
      var x1 = (ox + before.w) * q + W1 * e, y1 = (oy + before.h) * q + H1 * e;
      m.moves.forEach(function (mv) {
        var p = mv.p < 0 ? 0 : mv.p;
        var cx = mv.n.x + mv.dx * (1 - p) + handOrigin.x, cy = mv.n.y + mv.dy * (1 - p) + handOrigin.y;
        x0 = Math.min(x0, cx - mv.w / 2 - 40); x1 = Math.max(x1, cx + mv.w / 2 + 40);
        y0 = Math.min(y0, cy - mv.h / 2 - 20); y1 = Math.max(y1, cy + mv.h / 2 + 40);
      });
      x0 = Math.max(x0, m.all.x0); y0 = Math.max(y0, m.all.y0);
      x1 = Math.min(x1, m.all.x1); y1 = Math.min(y1, m.all.y1);
      svg.setAttribute("viewBox", x0.toFixed(2) + " " + y0.toFixed(2) + " " +
                       (x1 - x0).toFixed(2) + " " + (y1 - y0).toFixed(2));
      svg.style.width = ((x1 - x0) * zoom).toFixed(2) + "px";
    };

    // and the arrows it has now, each drawn once both its shapes are down
    var heads = all(".tips .head", svg), headTaken = [];
    all(".link[data-link]", svg).forEach(function (g) {
      var link = hand.links.filter(function (l) { return String(l.id) === g.dataset.link; })[0];
      var flow = el(".flow", g);
      if (!link || !flow) { return; }
      var len = flow.getTotalLength ? flow.getTotalLength() : 0;
      var end = (flow.getAttribute("d") || "").split(/[ML]/).pop().trim(), head = null;
      for (var k = 0; k < heads.length && end; k++) {
        if (headTaken.indexOf(k) < 0 &&
            (heads[k].getAttribute("points") || "").indexOf(end + " ") === 0) {
          head = heads[k];
          headTaken.push(k);
          break;
        }
      }
      var at = Math.max(landed[link.from] || 0, landed[link.to] || 0, TIDY_FADE * 0.6);
      var takes = Math.max(TIDY_LEAST, Math.min(TIDY_MOST, len / TIDY_PEN));
      m.lines.push({ flow: flow, len: len, head: head, words: all(".patch, .label", g),
                     dashed: !!flow.getAttribute("stroke-dasharray") || !len,
                     at: at, takes: takes, p: -1 });
      m.end = Math.max(m.end, at + takes + TIDY_POP);
    });
    m.end = Math.max(m.end, TIDY_FADE);

    function shown(t) {
      m.ghost.setAttribute("opacity", Math.max(0, 1 - t / TIDY_FADE).toFixed(3));
      m.moves.forEach(function (mv) {
        if (!mv.bits.length) { return; }
        var p = tidyEase((t - mv.at) / mv.takes);
        if (p === mv.p) { return; }
        mv.p = p;
        var x = (mv.dx * (1 - p)).toFixed(2), y = (mv.dy * (1 - p)).toFixed(2);
        mv.bits.forEach(function (b) {
          if (p >= 1) {
            if (b.own) { b.el.setAttribute("transform", b.own); } else { b.el.removeAttribute("transform"); }
          } else {
            b.el.setAttribute("transform", "translate(" + x + " " + y + ")" + (b.own ? " " + b.own : ""));
          }
        });
        // Lifted off the paper while it is carried, and set down again: a
        // shadow that grows as it goes and goes as it lands, which is what
        // says which of two shapes crossing is the one on its way.
        // (Not eased by the stylesheet as a shape's shadow otherwise is: set
        // afresh every frame, an eased one never caught up with itself.)
        var shape = mv.bits[0].el, lift = m.lift && p > 0 && p < 1 ? Math.sin(Math.PI * p) : 0;
        shape.style.transition = lift > 0.01 ? "none" : "";
        shape.style.filter = lift > 0.01
          ? "drop-shadow(0 " + (1 + 4 * lift).toFixed(1) + "px " + (2 + 7 * lift).toFixed(1) +
            "px rgba(16, 24, 40, " + (0.24 * lift).toFixed(3) + "))"
          : "";
      });
      m.lines.forEach(function (l) {
        var p = Math.max(0, Math.min(1, (t - l.at) / l.takes));
        var pop = Math.max(0, Math.min(1, (t - l.at - l.takes + 40) / TIDY_POP));
        var said = Math.max(0, Math.min(1, (t - l.at - l.takes) / TIDY_POP));
        if (p === l.p && said === l.said) { return; }
        l.p = p; l.said = said;
        if (l.dashed) {                  // drawn with dashes, so it fades in instead
          l.flow.style.opacity = p < 1 ? p.toFixed(3) : "";
        } else if (p < 1) {              // the round end of it kept out of sight too
          l.flow.style.strokeDasharray = l.len.toFixed(1) + " " + (l.len + 4).toFixed(1);
          l.flow.style.strokeDashoffset = ((l.len + 2) * (1 - p)).toFixed(1);
        } else {
          l.flow.style.strokeDasharray = "";
          l.flow.style.strokeDashoffset = "";
        }
        if (l.head) { l.head.style.opacity = pop < 1 ? pop.toFixed(3) : ""; }
        l.words.forEach(function (w) { w.style.opacity = said < 1 ? said.toFixed(3) : ""; });
      });
      if (t < m.shift) {
        m.sheetAt(tidyEase((t - TIDY_OFF) / Math.max(1, m.shift - TIDY_OFF)));
      } else if (!m.settled) {           // the paper as the drawing has it, exactly
        m.settled = true;
        svg.setAttribute("viewBox", m.viewBox);
        svg.style.width = m.width;
      }
    }

    function stop() { tidyDone(); }
    m.listen = function (on) {
      var how = on ? "addEventListener" : "removeEventListener";
      window[how]("pointerdown", stop, true);
      window[how]("keydown", stop, true);
      window[how]("wheel", stop, { capture: true, passive: true });
    };
    m.land = function () { shown(Infinity); };
    if (!tidyPaper(m, before)) { m.shift = 0; }   // no paper to change: it simply is the new one
    shown(0);                            // before the browser draws a frame of it
    tidyMove = m;
    m.listen(true);
    var began = performance.now();
    function frame() {
      if (tidyMove !== m) { return; }
      if (!svg.isConnected) { tidyDone(); return; }
      var t = performance.now() - began;
      shown(t);
      if (t >= m.end) { tidyDone(); return; }
      m.frame = requestAnimationFrame(frame);
    }
    m.frame = requestAnimationFrame(frame);
    // and lands however the frames go: a page put away stops drawing them
    m.safety = setTimeout(tidyDone, m.end + 800);
  }

  // Whatever is still on its way lands, at once.
  function tidyDone() {
    var m = tidyMove;
    if (!m) { return; }
    tidyMove = null;
    cancelAnimationFrame(m.frame);
    clearTimeout(m.safety);
    m.listen(false);
    m.land();
    [m.ghost, m.paper].forEach(function (e) {
      if (e && e.parentNode) { e.parentNode.removeChild(e); }
    });
    (m.real || []).forEach(function (e) { e.style.visibility = ""; });
    if (loose) { holdClamp(); }          // a smaller paper has less room to roam
  }

  // ---- the button ------------------------------------------------------------
  function tidyUp() {
    if (!byHand || tidyAsked) { return; }
    tidyDone();
    if (!hand.nodes.length) { handSays(TXT.h_tidy_none, true); return; }
    var text;
    try { text = handAsPseudocode(); }
    catch (thrown) { handSays(thrown.message || String(thrown), true); return; }
    var fromLine = {}, sizes = {};       // line -> shape, as it was written
    Object.keys(handLine).forEach(function (line) {
      var n = nodeById(+handLine[line]);
      if (!n) { return; }
      fromLine[line] = n.id;
      measure(n);
      var t = turned(n);
      sizes[line] = [t.w, t.h];
    });
    var asked = handKey();
    var button = el("#hand-tidy");
    tidyAsked = true;
    if (button) { button.disabled = true; button.classList.add("working"); }
    function done() {
      tidyAsked = false;
      if (button) { button.disabled = false; button.classList.remove("working"); }
    }
    askFor(tidyAsk(text, sizes))
      .then(function (data) {
        done();
        if (!byHand) { return; }
        if (!data || !data.ok || !data.ast || !data.plan) {
          handSays((data && data.error) || TXT.h_not_a_program, true);
          return;
        }
        // Changed while it was being laid out: laid out for another drawing.
        if (handKey() !== asked) { return; }
        var layout = tidyLayout(data, fromLine, text);
        if (!Object.keys(layout.places).length) { handSays(TXT.h_tidy_none, true); return; }
        var before = tidyLook(), was = JSON.stringify(hand);
        keepUndo();
        var moved = tidyApply(layout);
        // Tidy already: no step for Undo to take back that changes nothing.
        if (JSON.stringify(hand) === was) { wasLike.pop(); showUndo(); }
        else { wasLike[wasLike.length - 1].tidied = true; }   // Undo carries it back
        drawHand();
        drawHandPanel();
        if (moved) { tidyMotion(before, layout.order); }   // tidy already: nothing to see
        showReport();
        handSays(moved ? say("h_tidied", { n: moved }) : TXT.h_tidy_done);
      })
      .catch(function (err) {
        done();
        handSays(String(err && err.message ? err.message : err), true);
      });
  }

  if (el("#hand-tidy")) {
    el("#hand-tidy").onclick = tidyUp;
  }

  // ---- stepping back over one ----------------------------------------------
  // Undo takes a tidy back the way it came, and Redo does it again: the
  // shapes carried back, not simply found where they were, which on a
  // drawing that has just moved all over is the only way to see what went
  // where.  Only a tidy: any other step back is a shape or an arrow, and
  // snapping back is how that should look.  Each way is marked as it is
  // taken, so the way back again is carried too.
  var stepBackPlain = stepBack;
  stepBack = function (forward) {
    var from = forward ? willBeLike : wasLike, to = forward ? wasLike : willBeLike;
    var step = from[from.length - 1];
    var carried = byHand && step && step.tidied;
    tidyDone();
    var before = carried ? tidyLook() : null;
    stepBackPlain(forward);
    if (!carried) { return; }
    if (to.length) { to[to.length - 1].tidied = true; }
    var order = hand.nodes.slice().sort(function (p, q) { return (p.y - q.y) || (p.x - q.x); });
    tidyMotion(before, order.map(function (n) { return n.id; }));
  };
