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
  // (TIDY_ROOM, and never less than TIDY_GAP from one shape down to the
  // next -- an arrow between two boxes was nearly all head, and hard to
  // follow), and the True and False measured at the size they are written
  // here, so the layout leaves them room enough.
  // The least, that is: an arrow the layout needs longer -- one carrying a
  // True or False down beside it, the two sides of an If coming home, a
  // loop coming round -- is as long as it needs.
  // How much room, how long the arrows and the outline to aim at are what
  // the Tidy up sheet was set to (`how`, below): its own, not the chart
  // options', because a drawing by hand wants its own -- the arrow length
  // above all, which is in squares of the ruling (1.5 unless asked).
  var TIDY_ROOM = 1.5;
  var TIDY_GAP = 1.5 * HAND_RULE;        // a square and a half of the ruling
  function tidyAsk(text, sizes, how) {
    var letters = lettersAsked();
    letters.size = HAND_TYPE * chartPt() / PLAIN_PT;
    letters.own = {};                    // the pseudocode side's steps, not these
    return Object.assign(chartOptions(), {
      text: text, title: "", author: "",
      shape: how.shape || "auto",
      seed: TIDY_SEED,
      lang: el("#f-lang") ? el("#f-lang").value : "",
      legend: false, grid: true, shapes: geom, letters: letters,
      everyout: true, apart: true, sizes: sizes, plan: true,
      roomy: how.space === "roomy", tight: how.space === "tight",
      chains: !!how.chains, columns: how.columns ? 1400 : 0,
      decide: tidyDecide(how),
      room: TIDY_ROOM, gap: (+how.arrows || TIDY_GAP / HAND_RULE) * HAND_RULE
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
  // on its paper: with the same wall of paper round it on every side
  // (TIDY_WALL, as MARGIN in settings.py), so the paper shrinks or grows
  // to fit it -- and in the middle of the paper, where the paper is bigger
  // than that anyway.  How many shapes moved, or null when the layout had
  // nowhere for any of them.
  //
  // Asked to keep the chart where it is (`how.stay`), its top left corner
  // goes where the drawing's was -- never nearer the edge than the wall.
  var TIDY_WALL = 2 * HAND_RULE;
  function tidyApply(layout, how) {
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
    // A shape the flow never reaches -- an arrow not drawn yet, a note off
    // to one side -- goes down the side of the chart, in the order it stood
    // in from the top, rather than being left somewhere out across the
    // paper with the chart gone from round it.
    var stray = hand.nodes.filter(function (n) { return !layout.places[n.id]; });
    stray.sort(function (p, q) { return (p.y - q.y) || (p.x - q.x); });
    var strayW = 0, strayH = 0;
    stray.forEach(function (n) {
      var t = turned(n);
      strayW = Math.max(strayW, t.w);
      strayH += (strayH ? CLEAR : 0) + t.h;
    });
    // A chart smaller than the least paper a drawing is given (drawHand)
    // stands in the middle of it, rather than in its corner beside a
    // stretch of bare paper; a bigger one has the wall round it and no more.
    var wide = now.x1 - now.x0 + (stray.length ? TIDY_ASIDE + strayW : 0);
    var tall = Math.max(now.y1 - now.y0, strayH);
    var spareX = Math.max(0, HAND_LEAST_W + HAND_PAD - wide - 2 * TIDY_WALL) / 2;
    var spareY = Math.max(0, HAND_LEAST_H + HAND_PAD - tall - 2 * TIDY_WALL) / 2;
    // Its first shape on the ruling: up to it, never nearer the edge than
    // the wall; or, standing in the middle, to the nearest line of it.
    var lead = layout.places[layout.order[0]];
    function onRuling(at, spare) {
      return (spare ? Math.round(at / HAND_GRID) : Math.ceil(at / HAND_GRID - 0.001)) * HAND_GRID;
    }
    var dx = onRuling(lead.x + TIDY_WALL + spareX - now.x0, spareX) - lead.x;
    var dy = onRuling(lead.y + TIDY_WALL + spareY - now.y0, spareY) - lead.y;
    if (how && how.stay) {
      var x0 = Infinity, y0 = Infinity;
      hand.nodes.forEach(function (n) {
        var t = turned(n);
        x0 = Math.min(x0, n.x - t.w / 2); y0 = Math.min(y0, n.y - t.h / 2);
      });
      dx = onRuling(lead.x + Math.max(x0, TIDY_WALL) - now.x0, 0) - lead.x;
      dy = onRuling(lead.y + Math.max(y0, TIDY_WALL) - now.y0, 0) - lead.y;
    }
    ids.forEach(function (id) {
      var n = nodeById(+id), s = layout.places[id];
      n.x = Math.round(s.x + dx);
      n.y = Math.round(s.y + dy);
    });
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
    hand.nodes.forEach(function (n) { at[n.id] = { x: n.x, y: n.y, turn: n.turn || 0, w: n.w, h: n.h }; });
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

  // A shape, and whatever stands round it on the paper: its rule mark, and
  // the dots, corners and handles it has while it is picked.
  function tidyFollowers(svg, id) {
    return all('.node[data-i="h' + id + '"], .rule-dot[data-hint="' + id + '"], [data-i="' + id + '"]', svg)
      .map(function (e) {
        var own = e.getAttribute("transform") || "";
        // the shape itself, and whatever is turned along with it
        return { el: e, own: own, spins: e.classList.contains("node") || /rotate\(/.test(own) };
      });
  }

  // How far a shape turns on its way, the short way round: from `was` to
  // where it is turned now.
  function tidySpin(was, n) {
    var d = ((((was || 0) - (n.turn || 0)) % 360) + 540) % 360 - 180;
    return Math.abs(d) < 0.05 ? 0 : d;
  }

  // Each arrow's head, by the arrow's number.  The heads are drawn apart
  // from their lines, all together, each starting at the very point its line
  // ends on (drawHand); two lines ending on one point -- the two sides of an
  // If coming home -- take the two heads there in turn.
  function tidyHeads(svg) {
    var heads = all(".tips .head", svg), taken = [], out = {};
    all(".link[data-link]", svg).forEach(function (g) {
      var flow = el(".flow", g);
      var end = flow ? (flow.getAttribute("d") || "").split(/[ML]/).pop().trim() : "";
      for (var k = 0; k < heads.length && end; k++) {
        if (taken.indexOf(k) < 0 && (heads[k].getAttribute("points") || "").indexOf(end + " ") === 0) {
          out[g.dataset.link] = heads[k];
          taken.push(k);
          return;
        }
      }
    });
    return out;
  }

  // Where the paper it had is, in the new paper's numbers -- more paper on
  // the left, or a key along the top, moves where the drawing's own 0 is --
  // and the least paper that holds both, for the sheet that stands in under
  // it while it changes (tidyPaper).
  function tidyStart(svg, before) {
    var box = svg.viewBox && svg.viewBox.baseVal;
    var ox = handOrigin.x - before.origin.x, oy = handOrigin.y - before.origin.y;
    var W1 = box.width, H1 = box.height;
    var m = { svg: svg, viewBox: svg.getAttribute("viewBox"), width: svg.style.width,
              moves: [], lines: [], end: 0, shift: 0, ox: ox, oy: oy,
              same: ox === 0 && oy === 0 && W1 === before.w && H1 === before.h,
              all: { x0: Math.min(0, ox), y0: Math.min(0, oy),
                     x1: Math.max(W1, ox + before.w), y1: Math.max(H1, oy + before.h) } };
    // The paper, `e` of the way from the one it had to the one it has now,
    // and big enough for every shape where it has got to.
    m.sheetAt = function (e) {
      var q = 1 - e;
      var x0 = ox * q, y0 = oy * q;
      var x1 = (ox + before.w) * q + W1 * e, y1 = (oy + before.h) * q + H1 * e;
      m.moves.forEach(function (mv) {
        var p = mv.p < 0 ? 0 : mv.p;
        var cx = mv.x + mv.dx * (1 - p) + handOrigin.x, cy = mv.y + mv.dy * (1 - p) + handOrigin.y;
        x0 = Math.min(x0, cx - mv.w / 2 - 40); x1 = Math.max(x1, cx + mv.w / 2 + 40);
        y0 = Math.min(y0, cy - mv.h / 2 - 20); y1 = Math.max(y1, cy + mv.h / 2 + 40);
      });
      x0 = Math.max(x0, m.all.x0); y0 = Math.max(y0, m.all.y0);
      x1 = Math.min(x1, m.all.x1); y1 = Math.min(y1, m.all.y1);
      svg.setAttribute("viewBox", x0.toFixed(2) + " " + y0.toFixed(2) + " " +
                       (x1 - x0).toFixed(2) + " " + (y1 - y0).toFixed(2));
      svg.style.width = ((x1 - x0) * zoom).toFixed(2) + "px";
    };
    return m;
  }

  // One step of a shape's way, `p` of it, on it and all that goes with it.
  function tidyGrew(was, now) {          // how much bigger it was, if it was
    return typeof was === "number" && Math.abs(was - now) >= 0.5 ? was - now : 0;
  }

  // A shape made bigger or smaller on the way -- fitted to its words, made
  // as wide as the rest, a size taken back -- grows or shrinks as it goes,
  // rather than being the new size from the first frame (or the old one
  // until the last).  Its outline is drawn again at the size it has got to:
  // the numbers that place it (points, d, rx, width ...) taken from
  // shapeArt at that size and put on the very elements the drawing made,
  // so their colors and lines stay theirs.  Not scaled: a scaled shape
  // stretched its words and thinned or thickened its line.  The words stay
  // where they are, in the middle of it.
  var TIDY_GEOM = ["points", "d", "cx", "cy", "rx", "ry", "r", "x", "y", "width", "height",
                   "x1", "y1", "x2", "y2"];
  function tidyGrow(b, mv, p) {
    var n = mv.n, g = b.el;
    if (!b.art) {
      var outline = Array.prototype.filter.call(g.children, function (e) { return !withTheWords(e); });
      b.art = outline.map(function (e) {
        return { el: e, was: TIDY_GEOM.map(function (name) { return e.getAttribute(name); }) };
      });
    }
    if (p >= 1) {                        // exactly as the drawing drew it
      b.art.forEach(function (one) {
        TIDY_GEOM.forEach(function (name, k) {
          if (one.was[k] === null) { one.el.removeAttribute(name); } else { one.el.setAttribute(name, one.was[k]); }
        });
      });
      return;
    }
    var type = handType(n);
    var made = document.createElementNS("http://www.w3.org/2000/svg", "g");
    made.innerHTML = shapeArt(n.kind, mv.x + handOrigin.x, mv.y + handOrigin.y,
                              Math.max(4, n.w + mv.dw * (1 - p)), Math.max(4, n.h + mv.dh * (1 - p)),
                              "#ffffff", shownLines(n, type), type.line);
    var fresh = made.children;
    if (fresh.length !== b.art.length) { return; }
    b.art.forEach(function (one, k) {
      if (fresh[k].tagName !== one.el.tagName) { return; }
      TIDY_GEOM.forEach(function (name) {
        var v = fresh[k].getAttribute(name);
        if (v !== null) { one.el.setAttribute(name, v); }
      });
    });
  }

  function tidyCarry(mv, p) {
    var x = (mv.dx * (1 - p)).toFixed(2), y = (mv.dy * (1 - p)).toFixed(2);
    // Turned as well (Tidy up standing it upright, a turn taken back): the
    // rest of the turn, about where the shape's middle is now.
    var spin = mv.dturn ? " rotate(" + (mv.dturn * (1 - p)).toFixed(2) + " " +
                          (mv.x + handOrigin.x).toFixed(1) + " " + (mv.y + handOrigin.y).toFixed(1) + ")" : "";
    mv.bits.forEach(function (b) {
      if ((mv.dw || mv.dh) && b.el.classList.contains("node")) { tidyGrow(b, mv, p); }
      if (p >= 1) {
        if (b.own) { b.el.setAttribute("transform", b.own); } else { b.el.removeAttribute("transform"); }
      } else {
        b.el.setAttribute("transform", "translate(" + x + " " + y + ")" + (b.spins ? spin : "") +
                                       (b.own ? " " + b.own : ""));
      }
    });
  }

  // The loop every carrying goes round: `shown(t)` for each frame, until
  // `m.end`; landed at once by tidyDone, by whatever `m.listen` listens for,
  // and however the frames go (a page put away stops drawing them).
  //
  // Its clock can be turned round (m.turn): Undo pressed while a move is
  // still going -- or Redo while an Undo is -- plays it backwards from
  // where it has got to, rather than landing it and starting another from
  // the far end.  Played all the way back, it is where it started from,
  // and the drawing of that is put down (tidyDone).  Undo and Redo, by key
  // or by button, are therefore not among what lands it.
  function tidyUndoKey(ev) {
    if (ev.type === "keydown") {
      var k = String(ev.key || "").toLowerCase();
      return (ev.ctrlKey || ev.metaKey) && (k === "z" || k === "y");
    }
    return !!(ev.target && ev.target.closest && ev.target.closest("#undo, #redo"));
  }
  function tidyRun(m, shown, stops) {
    function stop(ev) { if (!tidyUndoKey(ev)) { tidyDone(); } }
    m.listen = function (on) {
      var how = on ? "addEventListener" : "removeEventListener";
      stops.forEach(function (what) {
        window[how](what, stop, what === "wheel" ? { capture: true, passive: true } : true);
      });
    };
    m.land = function () { shown(Infinity); };
    m.dir = 1;                           // forwards; -1 backwards
    m.base = 0;                          // where the clock stood at `since`
    m.since = performance.now();
    m.now = function () {
      return Math.max(0, Math.min(m.end, m.base + m.dir * (performance.now() - m.since)));
    };
    m.turn = function (way) {
      m.base = m.now();
      m.since = performance.now();
      m.dir = -m.dir;
      m.way = way;
      clearTimeout(m.safety);
      m.safety = setTimeout(tidyDone, (m.dir > 0 ? m.end - m.base : m.base) + 800);
    };
    shown(0);                            // before the browser draws a frame of it
    tidyMove = m;
    m.listen(true);
    function frame() {
      if (tidyMove !== m) { return; }
      if (!m.svg.isConnected) { tidyDone(true); return; }
      var t = m.now();
      shown(t);
      if (m.dir > 0 ? t >= m.end : t <= 0) { tidyDone(); return; }
      m.frame = requestAnimationFrame(frame);
    }
    m.frame = requestAnimationFrame(frame);
    m.safety = setTimeout(tidyDone, m.end + 800);
  }

  // `way`: "fore" for a tidy or a Redo, "back" for an Undo -- which way on
  // the steps it went, so the step the other way can play it backwards.
  function tidyMotion(before, order, way) {
    var svg = chart;
    if (!before || !svg || STILL || document.hidden || hand.nodes.length > TIDY_BIG) { return; }
    var box = svg.viewBox && svg.viewBox.baseVal;
    var layer = el("g[font-family]", svg);
    if (!box || !box.width || !before.w || !layer) { return; }
    var m = tidyStart(svg, before), ox = m.ox, oy = m.oy;
    m.way = way || "fore";
    m.from = before.at;
    m.to = tidyWhere();

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
      var mv = { n: n, x: n.x, y: n.y, w: t.w, h: t.h, dx: was.x - n.x, dy: was.y - n.y,
                 dturn: tidySpin(was.turn, n), dw: tidyGrew(was.w, n.w), dh: tidyGrew(was.h, n.h),
                 p: -1, bits: [] };
      m.moves.push(mv);
      var far = Math.max(Math.hypot(mv.dx, mv.dy), Math.abs(mv.dturn), Math.abs(mv.dw), Math.abs(mv.dh));
      if (far < 0.5) { landed[id] = 0; mv.p = 1; return; }
      mv.bits = tidyFollowers(svg, id);
      mv.at = TIDY_OFF + k * gap;
      mv.takes = Math.min(TIDY_LONG, TIDY_SHORT + far * TIDY_PACE);
      landed[id] = mv.at + mv.takes;
      m.shift = Math.max(m.shift, mv.at + mv.takes);
    });
    m.end = m.shift;
    m.lift = m.moves.length <= TIDY_LIFT;

    // and the arrows it has now, each drawn once both its shapes are down
    var heads = tidyHeads(svg);
    all(".link[data-link]", svg).forEach(function (g) {
      var link = hand.links.filter(function (l) { return String(l.id) === g.dataset.link; })[0];
      var flow = el(".flow", g);
      if (!link || !flow) { return; }
      var len = flow.getTotalLength ? flow.getTotalLength() : 0;
      var head = heads[g.dataset.link] || null;
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
        tidyCarry(mv, p);
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

    if (!tidyPaper(m, before)) { m.shift = 0; }   // no paper to change: it simply is the new one
    tidyRun(m, shown, ["pointerdown", "keydown", "wheel"]);
  }

  // Whatever is still on its way lands, at once.  Played backwards, it
  // is back where it started instead, and the drawing of the design as it
  // now is -- which is how everything looks at that moment -- is put down
  // in its place.  `quiet`: another drawing is about to replace it anyway,
  // so it is only stopped where it is.
  function tidyDone(quiet) {
    var m = tidyMove;
    if (!m) { return; }
    tidyMove = null;
    cancelAnimationFrame(m.frame);
    clearTimeout(m.safety);
    m.listen(false);
    var back = m.dir < 0;
    if (!quiet && !back) { m.land(); }
    if (m.cleanup) { m.cleanup(); }
    [m.ghost, m.paper].forEach(function (e) {
      if (e && e.parentNode) { e.parentNode.removeChild(e); }
    });
    (m.real || []).forEach(function (e) { e.style.visibility = ""; });
    if (!quiet && back) {
      glideHeld++;
      try { drawHand(); } finally { glideHeld--; }
    }
    if (loose) { holdClamp(); }          // a smaller paper has less room to roam
  }

  // Is this step the move being shown, taken back?  The step would put back
  // where the move set out from -- or, played backwards already, where it
  // was going -- shape for shape; anything else is a step of its own.
  function tidyTurns(m, forward, step) {
    if (!m || !m.way || m.way === (forward ? "fore" : "back") || !step || !step.hand ||
        m.svg !== chart || !m.svg.isConnected) { return false; }
    var want = m.dir > 0 ? m.from : m.to, nodes = step.hand.nodes || [];
    if (!want || nodes.length !== Object.keys(want).length) { return false; }
    return nodes.every(function (n) {
      var w = want[n.id];
      return w && Math.abs(w.x - n.x) < 0.5 && Math.abs(w.y - n.y) < 0.5;
    });
  }

  function tidyWhere() {                 // every shape's place, as the design has it
    var at = {};
    hand.nodes.forEach(function (n) { at[n.id] = { x: n.x, y: n.y }; });
    return at;
  }

  // ---- how, asked first -------------------------------------------------------
  // The button asks before it tidies (#tidy-over, studio.html): the room
  // and the arrows and the outline, as the chart options ask them of a
  // chart built from pseudocode, and what only a drawing by hand has to be
  // asked -- whether a turned shape stays turned, whether a size set by
  // hand stays, whether the shapes all take the one width, how its
  // decisions are labelled, and whether it stays where it is on the paper.
  // What was chosen is kept for the next time.
  var TIDY_KEPT = "flowchart-tidy";
  var TIDY_HOW = { space: "plain", arrows: TIDY_GAP / HAND_RULE, shape: "auto",
                   chains: false, columns: false, turns: true, fit: false,
                   even: false, decide: "keep", stay: false };
  var TIDY_BOXES = { chains: "t-chains", columns: "t-columns", turns: "t-turns",
                     fit: "t-fit", even: "t-even", stay: "t-stay" };
  var TIDY_SEGS = { space: "#t-space", arrows: "#t-arrows", decide: "#t-decide" };

  function tidyHowKept() {
    var how = Object.assign({}, TIDY_HOW);
    try { Object.assign(how, JSON.parse(localStorage.getItem(TIDY_KEPT) || "{}")); } catch (e) {}
    return how;
  }

  function tidyWear(how) {               // the sheet, set the way `how` is
    Object.keys(TIDY_SEGS).forEach(function (k) {
      var seg = TIDY_SEGS[k], want = String(how[k]);
      if (!el(seg + ' .seg-btn[data-v="' + want + '"]')) { want = String(TIDY_HOW[k]); }
      sideOn(seg, want, "v");
    });
    Object.keys(TIDY_BOXES).forEach(function (k) {
      var box = el("#" + TIDY_BOXES[k]);
      if (box) { box.checked = !!how[k]; }
    });
    var shape = el("#t-shape");
    if (shape) {
      shape.value = how.shape;
      if (shape.value !== how.shape) { shape.value = "auto"; }
    }
    // Its decisions offered in the words they would be given, as the chart
    // options offer them.
    if (el("#t-decide-tf")) { el("#t-decide-tf").textContent = TXT.yes + " / " + TXT.no; }
    if (el("#t-decide-yn")) { el("#t-decide-yn").textContent = TXT.yes_plain + " / " + TXT.no_plain; }
  }

  function tidyRead() {                  // what the sheet is set to
    var how = {};
    Object.keys(TIDY_SEGS).forEach(function (k) {
      var on = el(TIDY_SEGS[k] + " .seg-btn.on");
      how[k] = on ? on.dataset.v : TIDY_HOW[k];
    });
    how.arrows = +how.arrows || TIDY_HOW.arrows;
    Object.keys(TIDY_BOXES).forEach(function (k) { how[k] = optionOn(TIDY_BOXES[k]); });
    how.shape = el("#t-shape") ? el("#t-shape").value : "auto";
    return how;
  }

  function showTidy(open) {
    var over = el("#tidy-over"), button = el("#hand-tidy");
    if (!over) { return; }
    if (open) { tidyWear(tidyHowKept()); }
    over.hidden = !open;
    if (button) { button.setAttribute("aria-expanded", open ? "true" : "false"); }
    if (open && el("#tidy-go")) { el("#tidy-go").focus(); }
  }

  // The words a decision is labelled with, asked for: its own (as the
  // drawing has them -- told from the first decision in it), or the pair
  // chosen.
  function tidyDecide(how) {
    if (how.decide === "tf" || how.decide === "yn") { return how.decide; }
    var plain = false, seen = false;
    hand.links.forEach(function (l) {
      var from = nodeById(l.from), word = String(l.label || "").trim().toLowerCase();
      if (seen || !from || !asksKind(from.kind) || !word) { return; }
      seen = true;
      plain = word === String(TXT.yes_plain).toLowerCase() || word === String(TXT.no_plain).toLowerCase();
    });
    return seen ? (plain ? "yn" : "tf") : chartOptions().decide;
  }

  // What each shape will be once tidied, by `how`: turned or stood upright,
  // at its own size or fitted to its words, and the one width as the
  // widest where they all share it (a small circle, a join, keeps its own).
  // Worked out on the shapes and put back, since the layout is asked for
  // before anything changes.
  function tidyShapes(how) {
    var out = {}, widest = 0;
    hand.nodes.forEach(function (n) {
      var was = { w: n.w, h: n.h, own: n.own };
      measure(n, !!how.fit);
      out[n.id] = { turn: how.turns ? (n.turn || 0) : 0, w: n.w, h: n.h, own: n.own };
      n.w = was.w; n.h = was.h; n.own = was.own;
      if (n.kind !== "circle") { widest = Math.max(widest, out[n.id].w); }
    });
    if (how.even) {
      hand.nodes.forEach(function (n) {
        var one = out[n.id];
        if (n.kind === "circle" || one.w === widest) { return; }
        one.w = widest;
        one.own = true;                  // set, not grown to its words
      });
    }
    return out;
  }

  // ... and made so, with the decisions' words.
  function tidyReshape(plan, how) {
    hand.nodes.forEach(function (n) {
      var one = plan[n.id];
      if (!one) { return; }
      n.w = one.w; n.h = one.h; n.own = one.own;
      if (one.turn) { n.turn = one.turn; } else { delete n.turn; }
    });
    if (how.decide !== "tf" && how.decide !== "yn") { return; }
    var yes = how.decide === "yn" ? TXT.yes_plain : TXT.yes;
    var no = how.decide === "yn" ? TXT.no_plain : TXT.no;
    hand.links.forEach(function (l) {
      var from = nodeById(l.from);
      if (!from || !asksKind(from.kind)) { return; }
      if (isYes(l.label)) { l.label = yes; } else if (isNo(l.label)) { l.label = no; }
    });
  }

  function tidyLooks() {                 // every shape, as the eye sees it
    var out = {};
    hand.nodes.forEach(function (n) {
      out[n.id] = [n.x, n.y, n.turn || 0, n.w, n.h].join(",");
    });
    return out;
  }

  all("#t-space .seg-btn, #t-arrows .seg-btn, #t-decide .seg-btn").forEach(function (b) {
    b.onclick = function () { sideOn("#" + b.parentNode.id, b.dataset.v, "v"); };
  });
  if (el("#tidy-go")) {
    el("#tidy-go").onclick = function () {
      var how = tidyRead();
      try { localStorage.setItem(TIDY_KEPT, JSON.stringify(how)); } catch (e) {}
      showTidy(false);
      tidyUp(how);
    };
  }
  if (el("#tidy-no")) { el("#tidy-no").onclick = function () { showTidy(false); }; }
  if (el("#tidy-over")) {
    // The dim behind it shuts it, the sheet itself does not.
    el("#tidy-over").onclick = function (ev) {
      if (ev.target === el("#tidy-over")) { showTidy(false); }
    };
  }
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && el("#tidy-over") && !el("#tidy-over").hidden) {
      ev.preventDefault();
      showTidy(false);
    }
  });

  // ---- the button ------------------------------------------------------------
  function tidyAskHow() {
    if (!byHand || tidyAsked) { return; }
    if (!hand.nodes.length) { handSays(TXT.h_tidy_none, true); return; }
    showTidy(true);
  }

  function tidyUp(how) {
    if (!byHand || tidyAsked) { return; }
    how = how || tidyHowKept();
    tidyDone();
    if (!hand.nodes.length) { handSays(TXT.h_tidy_none, true); return; }
    var text;
    try { text = handAsPseudocode(); }
    catch (thrown) { handSays(thrown.message || String(thrown), true); return; }
    var plan = tidyShapes(how);
    var fromLine = {}, sizes = {};       // line -> shape, as it was written
    Object.keys(handLine).forEach(function (line) {
      var n = nodeById(+handLine[line]);
      if (!n) { return; }
      fromLine[line] = n.id;
      var t = turned(plan[n.id]);        // at the size and turn it will have
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
    askFor(tidyAsk(text, sizes, how))
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
        var before = tidyLook(), was = JSON.stringify(hand), looked = tidyLooks();
        keepUndo();
        tidyReshape(plan, how);
        tidyApply(layout, how);
        var now = tidyLooks();           // moved, turned or resized
        var moved = Object.keys(now).filter(function (id) { return now[id] !== looked[id]; }).length;
        // Tidy already: no step for Undo to take back that changes nothing.
        if (JSON.stringify(hand) === was) { wasLike.pop(); showUndo(); }
        else { wasLike[wasLike.length - 1].tidied = true; }   // Undo carries it back
        glideHeld++;                     // it carries itself (tidyMotion)
        try { drawHand(); } finally { glideHeld--; }
        drawHandPanel();
        if (moved) { tidyMotion(before, layout.order, "fore"); }   // tidy already: nothing to see
        showReport();
        handSays(moved ? say("h_tidied", { n: moved }) : TXT.h_tidy_done);
      })
      .catch(function (err) {
        done();
        handSays(String(err && err.message ? err.message : err), true);
      });
  }

  if (el("#hand-tidy")) {
    el("#hand-tidy").onclick = tidyAskHow;
    el("#hand-tidy").setAttribute("aria-haspopup", "dialog");
  }

  // ---- stepping back over one ----------------------------------------------
  // Undo takes a tidy back the way it came, and Redo does it again, the way
  // a tidy goes: one shape after another down the chart, the arrows let go
  // and drawn in again.  Each way is marked as it is taken, so the way back
  // again goes like that too.  Any other step back or forward glides, like
  // every other move (below).
  //
  // And whatever move is still going when the step the other way is asked
  // for -- Undo straight after a tidy, a fix, a nudge or a Redo; Redo
  // straight after an Undo -- is played backwards from where it has got to
  // (tidyTurns, m.turn), rather than landed and started again from the far
  // end.  The design is put back at once, as a step always puts it back;
  // only its drawing waits (glideDefer) until the move is back where it
  // began, when it looks exactly as that drawing does.
  var stepBackPlain = stepBack;
  stepBack = function (forward) {
    var from = forward ? willBeLike : wasLike, to = forward ? wasLike : willBeLike;
    var step = from[from.length - 1];
    var way = forward ? "fore" : "back";
    var m = tidyMove;
    if (byHand && tidyTurns(m, forward, step)) {
      glideDefer++;
      try { stepBackPlain(forward); } finally { glideDefer--; }
      if (step.tidied && to.length) { to[to.length - 1].tidied = true; }
      if (glideLast) { glideLast.ref = hand; }   // the same drawing, still
      m.turn(way);
      return;
    }
    var carried = byHand && step && step.tidied;
    if (!carried) {
      glideAcross = true;                // another copy of the design: the same drawing
      glideWay = way;
      try { stepBackPlain(forward); } finally { glideAcross = false; glideWay = "fore"; }
      return;
    }
    // From where everything is seen, if something is still on its way.
    var seen = tidyMove && glideLast ? glideSeen() : null;
    tidyDone(true);
    var before = tidyLook();
    if (seen) { before.at = seen; }
    glideHeld++;                         // it carries itself
    try { stepBackPlain(forward); } finally { glideHeld--; }
    if (to.length) { to[to.length - 1].tidied = true; }
    var order = hand.nodes.slice().sort(function (p, q) { return (p.y - q.y) || (p.x - q.x); });
    tidyMotion(before, order.map(function (n) { return n.id; }), way);
  };

  // ======================================================== every move ==
  // A shape moved by anything but a hand on it -- Undo and Redo, a fix from
  // the check, the arrow keys, lining up and spacing out, one pushed off
  // another it was put down on -- used to simply be somewhere else, the
  // whole drawing jumping at once.  Now every one is carried from where it
  // was seen to where it goes, all together, its arrows bending with it and
  // the paper growing or shrinking under it.  How long it takes goes with
  // how far: a nudge is a blink, a long way a little longer.
  //
  // Three things are left alone.  A shape under the mouse or a finger
  // follows it, as it always has (nothing glides while a pointer is down).
  // Another drawing -- one opened, loaded, put back from a reload -- simply
  // arrives: only the design the last drawing was of, or a copy of it put
  // back by Undo, glides.  And a tidy carries itself (tidyMotion).
  //
  // A move made while the last is still going -- Ctrl+Z held down, the
  // arrow keys -- goes on from where everything is seen, not from where it
  // was bound for, so it never jumps; a press, or the wheel, lands it.
  var GLIDE_SHORT = 170, GLIDE_LONG = 420;   // ms, a nudge to a long way
  var GLIDE_PACE = 0.6;                  // and a ms more for so many px between
  var glideHeld = 0;                     // drawings that carry themselves
  var glideAcross = false;               // a step back: a copy of the same drawing
  var glideDefer = 0;                    // a move played backwards: drawn when it is back
  var glideWay = "fore";                 // which way on the steps this move goes
  var glideLast = null;                  // the drawing as it was last drawn
  var glidePress = false;                // a pointer is down

  window.addEventListener("pointerdown", function () { glidePress = true; }, true);
  ["pointerup", "pointercancel", "blur"].forEach(function (what) {
    window.addEventListener(what, function () { glidePress = false; }, true);
  });

  function glideSnap() {                 // the drawing just drawn
    var at = {}, box = chart && chart.viewBox && chart.viewBox.baseVal;
    hand.nodes.forEach(function (n) { at[n.id] = { x: n.x, y: n.y, turn: n.turn || 0, w: n.w, h: n.h }; });
    return { ref: hand, at: at, origin: { x: handOrigin.x, y: handOrigin.y },
             w: box ? box.width : 0, h: box ? box.height : 0 };
  }

  // Where each shape is seen now: where it was drawn -- or, part way along
  // being carried, part way.
  function glideSeen() {
    var at = {};
    Object.keys(glideLast.at).forEach(function (id) {
      var was = glideLast.at[id];
      at[id] = { x: was.x, y: was.y, turn: was.turn, w: was.w, h: was.h };
    });
    var m = tidyMove;
    if (m && m.svg === chart) {
      m.moves.forEach(function (mv) {
        if (!mv.bits.length || mv.p >= 1) { return; }
        var p = mv.p < 0 ? 0 : mv.p;
        at[mv.n.id] = { x: mv.x + mv.dx * (1 - p), y: mv.y + mv.dy * (1 - p),
                        turn: (mv.n.turn || 0) + (mv.dturn || 0) * (1 - p),
                        w: mv.n.w + (mv.dw || 0) * (1 - p), h: mv.n.h + (mv.dh || 0) * (1 - p) };
      });
    }
    return at;
  }

  // Every arrow's line, head and words, as they are seen now, by number.
  function glideLines(svg) {
    var out = {}, heads = tidyHeads(svg);
    all(".link[data-link]", svg).forEach(function (g) {
      var flow = el(".flow", g);
      if (!flow) { return; }
      out[g.dataset.link] = {
        d: flow.getAttribute("d"),
        head: heads[g.dataset.link] ? heads[g.dataset.link].getAttribute("points") : null,
        words: all(".label", g).map(function (e) { return [+e.getAttribute("x"), +e.getAttribute("y")]; }),
        patches: all(".patch", g).map(function (e) {
          return ["x", "y", "width", "height"].map(function (a) { return +e.getAttribute(a); });
        })
      };
    });
    return out;
  }

  var drawHandAsked = drawHand;
  drawHand = function () {
    if (glideDefer) { return; }          // tidyDone draws it, once the move is back
    var last = glideLast, was = chart, before = null;
    if (last && !glideHeld && !glidePress && !STILL && !document.hidden && byHand &&
        was && was.isConnected && handPaper === was && (hand === last.ref || glideAcross) &&
        hand.nodes.length <= TIDY_BIG) {
      var stage = el("#stage");
      before = { svg: was, at: glideSeen(), lines: glideLines(was), origin: last.origin,
                 w: last.w, h: last.h, hold: [holdX, holdY],
                 scroll: stage ? [stage.scrollLeft, stage.scrollTop] : null };
    }
    tidyDone(true);                      // replaced below: nothing of it to land
    drawHandAsked();
    glideLast = glideSnap();
    if (before) { glideMotion(before, glideWay); }
  };

  // One line of an arrow as the same line at another place.  An arrow that
  // keeps its shape -- as many corners, each run still going the same way
  // -- has each corner slid from where it was to where it goes, so its runs
  // stay square and its corners eased the whole way.  One that has taken
  // another shape (a corner more or less, a run turned) is not bent from the
  // one into the other, which could only go through slants no arrow here
  // ever has: the old line fades as the new one comes in.  The old one is in
  // the old paper's numbers.
  function glidePath(was, now, ox, oy) {
    var a = cornersOf(was), b = cornersOf(now);
    if (a.length < 2 || a.length !== b.length) { return null; }
    function ways(pts) {
      return pts.slice(1).map(function (p, i) {
        return Math.abs(p[0] - pts[i][0]) < 0.5 ? "|" : Math.abs(p[1] - pts[i][1]) < 0.5 ? "-" : "/";
      }).join("");
    }
    if (ways(a) !== ways(b)) { return null; }
    return { from: a.map(function (p) { return [p[0] + ox, p[1] + oy]; }), to: b };
  }

  function glideNums(was, now, shift) {  // numbers, the old ones moved by `shift`
    var a = was.map(function (v, i) { return v + (shift[i % shift.length] || 0); });
    return a.length === now.length ? { from: a, to: now } : null;
  }

  function glideMotion(before, way) {
    var svg = chart, box = svg.viewBox && svg.viewBox.baseVal;
    if (!box || !box.width || !before.w) { return; }
    var m = tidyStart(svg, before), ox = m.ox, oy = m.oy, far = 0;
    m.way = way || "fore";               // so the step the other way plays it back
    m.from = before.at;
    m.to = tidyWhere();
    hand.nodes.forEach(function (n) {
      var was = before.at[n.id];
      if (!was) { return; }
      var t = turned(n);
      var mv = { n: n, x: n.x, y: n.y, w: t.w, h: t.h, dx: was.x - n.x, dy: was.y - n.y,
                 dturn: tidySpin(was.turn, n), dw: tidyGrew(was.w, n.w), dh: tidyGrew(was.h, n.h),
                 p: -1, bits: [] };
      m.moves.push(mv);
      var d = Math.max(Math.hypot(mv.dx, mv.dy), Math.abs(mv.dturn), Math.abs(mv.dw), Math.abs(mv.dh));
      if (d < 0.5) { mv.p = 1; return; }
      far = Math.max(far, d);
      mv.bits = tidyFollowers(svg, n.id);
    });
    if (!far) { return; }                // nothing moved: nothing to carry
    m.end = m.shift = Math.min(GLIDE_LONG, GLIDE_SHORT + far * GLIDE_PACE);

    // The arrows that were there, from how they were seen to how they are.
    var heads = tidyHeads(svg);
    all(".link[data-link]", svg).forEach(function (g) {
      var was = before.lines[g.dataset.link], flow = el(".flow", g);
      if (!was || !flow) { return; }
      var line = { flow: flow, done: flow.getAttribute("d"), path: glidePath(was.d, flow.getAttribute("d"), ox, oy),
                   bits: [], fades: [] };
      var head = heads[g.dataset.link];
      if (!line.path) {                  // another shape of arrow: the old one fades
        var old = flow.cloneNode(false);
        old.setAttribute("d", was.d);
        old.setAttribute("transform", "translate(" + ox + " " + oy + ")");
        old.removeAttribute("class");
        g.insertBefore(old, flow);
        line.fades.push({ el: old, out: true }, { el: flow });
        if (head && was.head) {
          var oldHead = head.cloneNode(false);
          oldHead.setAttribute("points", was.head);
          oldHead.setAttribute("transform", "translate(" + ox + " " + oy + ")");
          oldHead.removeAttribute("class");
          head.parentNode.insertBefore(oldHead, head);
          line.fades.push({ el: oldHead, out: true }, { el: head });
        }
      } else if (head && was.head) {
        line.bits.push({ el: head, name: "points", done: head.getAttribute("points"), pairs: true,
                         nums: glideNums(numsIn(was.head), numsIn(head.getAttribute("points")), [ox, oy]) });
      }
      all(".label", g).forEach(function (e, i) {
        if (!was.words[i]) { return; }
        ["x", "y"].forEach(function (name, k) {
          line.bits.push({ el: e, name: name, done: e.getAttribute(name),
                           nums: glideNums([was.words[i][k]], [+e.getAttribute(name)], [k ? oy : ox]) });
        });
      });
      all(".patch", g).forEach(function (e, i) {
        if (!was.patches[i]) { return; }
        ["x", "y", "width", "height"].forEach(function (name, k) {
          line.bits.push({ el: e, name: name, done: e.getAttribute(name),
                           nums: glideNums([was.patches[i][k]], [+e.getAttribute(name)],
                                           [k === 0 ? ox : k === 1 ? oy : 0]) });
        });
      });
      m.lines.push(line);
    });

    function between(nums, p) {
      return nums.from.map(function (v, i) { return v + (nums.to[i] - v) * p; });
    }
    function shown(t) {
      var p = tidyEase(t / m.end);
      m.moves.forEach(function (mv) {
        if (!mv.bits.length || p === mv.p) { return; }
        mv.p = p;
        tidyCarry(mv, p);
      });
      m.lines.forEach(function (line) {
        if (p >= 1 || !line.path) {
          line.flow.setAttribute("d", line.done);
        } else {
          line.flow.setAttribute("d", easedPath(line.path.from.map(function (a, i) {
            var b = line.path.to[i];
            return [+(a[0] + (b[0] - a[0]) * p).toFixed(1), +(a[1] + (b[1] - a[1]) * p).toFixed(1)];
          })));
        }
        line.fades.forEach(function (f) {
          if (p >= 1) {
            if (f.out) { if (f.el.parentNode) { f.el.parentNode.removeChild(f.el); } }
            else { f.el.style.opacity = ""; }
          } else {
            f.el.style.opacity = (f.out ? 1 - p : p).toFixed(3);
          }
        });
        line.bits.forEach(function (bit) {
          if (p >= 1 || !bit.nums) { bit.el.setAttribute(bit.name, bit.done); return; }
          var v = between(bit.nums, p).map(function (n) { return n.toFixed(1); });
          if (bit.pairs) {
            var pts = [];
            for (var k = 0; k + 1 < v.length; k += 2) { pts.push(v[k] + "," + v[k + 1]); }
            bit.el.setAttribute(bit.name, pts.join(" "));
          } else {
            bit.el.setAttribute(bit.name, v[0]);
          }
        });
      });
      if (m.same) { return; }            // the paper stays as it is
      if (p < 1) { m.sheetAt(p); }
      else if (!m.settled) {
        m.settled = true;
        svg.setAttribute("viewBox", m.viewBox);
        svg.style.width = m.width;
      }
    }

    // The old lines that were fading, gone however it ends.
    m.cleanup = function () {
      m.lines.forEach(function (line) {
        line.fades.forEach(function (f) {
          if (f.out && f.el.parentNode) { f.el.parentNode.removeChild(f.el); }
        });
      });
    };
    if (!m.same && !tidyPaper(m, before)) { m.same = true; }
    tidyRun(m, shown, ["pointerdown", "wheel"]);
  }
