// ---------------------------------------------------------------------------
//  02-paint.js -- putting the colors on, and setting the words
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------------ painting --
  // Putting a color on an element costs next to nothing.  What costs is
  // the browser working out afresh what that element now looks like --
  // some seven millionths of a second each, and a chart of a thousand
  // shapes is near enough seven thousand elements.  Forty milliseconds,
  // two and a half frames, to answer one color; and a color picker being
  // dragged asks many times a second.  The chart fell behind the thumb on
  // the first shove and never caught up.
  //
  // Three things keep it up now.  None of them changes what the chart
  // ends up looking like, only how much work it takes to get there.
  //
  // Nothing is said twice.  Every element remembers the color it was last
  // given, and one already wearing that color costs a comparison and not
  // a thing more -- so changing one kind's fill no longer re-states the
  // color of every arrow, every word and the paper into the bargain.
  // What is remembered is kept on the elements themselves, which is what
  // makes it safe: a chart that has just been drawn again remembers
  // nothing at all, and that is right, because its elements are new ones
  // with no color on them yet.
  //
  // The asking is gathered up.  paintSoon() paints once at the next frame
  // however often it is called, so a drag costs one repaint a frame
  // instead of one for every twitch of the picker.
  //
  // And a chart too big to recolor inside one frame is recolored across
  // several, starting at the part of it you are looking at.  Whatever is
  // left over asks for another frame, so it always finishes; what it buys
  // is that the eye never waits on the parts that are off the screen.
  var ATONCE = 800;                      // elements recolored in one frame
  var daubed = 0;                        // how many have been, this time
  var leftOver = false;                  // and whether any were left over
  var paintingAll = false;               // ... unless it must all be done now

  function fillIt(e, c) { e.style.fill = c; }
  function strokeIt(e, c) { e.style.stroke = c; }
  function bothIt(e, c) { e.style.fill = c; e.style.stroke = c; }
  function showIt(e, c) { e.style.display = c; }
  function faceIt(e, c) { e.style.fontFamily = c; }
  function sizeIt(e, c) { e.style.fontSize = c; }
  function weighIt(e, c) { e.style.strokeWidth = c; }

  // ----------------------------------------------------- what a kind wears --
  // A palette gives colors to the six kinds of step, and a built chart only
  // ever draws those six, whatever shape the rules draw each of them as.
  // Drawn by hand, though, a shape can be any of thirty, and the other
  // twenty-four were given nothing: they stayed white, which on Night is a
  // white box with pale words on it.  So a shape whose kind has no color of
  // its own wears the colors of the step it stands for -- the one the
  // "Shape for each kind" rules draw as that shape, as a built chart would,
  // or else its nearest relative.  A color the kind has been given itself,
  // by Apply to all, still comes first, one color at a time.
  var KIN = { roundrect: "rect", trap: "rect", delay: "rect", parallel: "rect",
              step: "rect", cube: "rect", note: "rect", callout: "rect",
              actor: "rect", arrow: "rect", text: "rect",
              circle: "oval", offpage: "oval",
              io_back: "io", manual: "io", doc: "io", docs: "io", card: "io",
              screen: "io", store: "io", stored: "io", table: "io",
              loop: "hex", cloud: "sub" };
  function standsFor(kind) {
    if (ROLES.indexOf(kind) >= 0) { return kind; }
    for (var r = 0; r < ROLES.length; r++) {
      if (geom[ROLES[r]] === kind) { return ROLES[r]; }
    }
    return KIN[kind] || "rect";
  }
  function kindColors(kind) {
    var own = style.kinds[kind] || {}, kin = style.kinds[standsFor(kind)] || {};
    return { fill: own.fill || kin.fill || "", line: own.line || kin.line || "",
             text: own.text || kin.text || "" };
  }

  // ------------------------------------------------------- how words look --
  // What every step's words are set in, said once for the whole chart on the
  // Style side: the typeface, how big, and whether bold, slanted or
  // underlined.  An older piece of work saved before there was any such
  // thing has none of it, and is set the way it always was.
  function lettersOf() {
    if (!style.letters) { style.letters = {}; }
    return style.letters;
  }
  function typeBase() {                  // the size the words start from here
    return byHand ? HAND_TYPE : CODE_TYPE;
  }

  // How big the words are, in points: the whole chart's, and one shape's --
  // its own if it has one, the chart's if not.  Twelve is the plain size,
  // whatever that comes to in pixels in the chart being drawn, so a chart
  // at 12 is exactly the chart there was before anybody asked for a size.
  // A shape's own size is its own the way a word processor's is: it stays
  // put when the rest of the chart's words are made bigger or smaller.
  function chartPt() { return lettersOf().pt || PLAIN_PT; }
  function shapePt(i) { return (style.nodes[i] || {}).pt || chartPt(); }
  function ptPx(pt) { return typeBase() * pt / PLAIN_PT; }
  function roundPt(pt) { return Math.round(pt * 2) / 2; }  // to a half point

  // Sizes were first kept as a share of the plain size -- 1.25 for a
  // quarter bigger -- and a shape's as a share of the chart's.  They are
  // points now, and anything kept the old way is put into points as it
  // arrives (see recall and openProject), so nothing else has to know that
  // there was ever another way of keeping them.
  function inPoints(st) {
    var L = (st && st.letters) || {};
    var scale = L.size || 1;
    if (L.size !== undefined) {
      if (!L.pt && scale !== 1) { L.pt = roundPt(PLAIN_PT * scale); }
      delete L.size;
    }
    Object.keys((st && st.nodes) || {}).forEach(function (i) {
      var n = st.nodes[i];
      if (!n || n.size === undefined) { return; }
      if (!n.pt && n.size !== 1) { n.pt = roundPt(PLAIN_PT * scale * n.size); }
      delete n.size;
    });
    return st;
  }

  // How one shape looks beyond its colors: its words' own size, bold,
  // slanted, underlined or struck through, a highlighter across them, and
  // how heavy its border is and whether it is dashed.  A shape can say any
  // of those for itself; one that says nothing wears what the chart wears.
  // Its size is only its own when it has one: otherwise the words take the
  // chart's size from the group they sit in, and nothing is written on them.
  function shapeLook(i) {
    var L = lettersOf(), mine = style.nodes[i] || {};
    function either(what) {
      return mine[what] !== undefined ? !!mine[what] : !!L[what];
    }
    var own = CAN_REFLOW && mine.pt && mine.pt !== chartPt();
    return { size: own ? ptPx(mine.pt) : 0,
             bold: either("bold"), italic: either("italic"),
             under: either("under"), strike: either("strike"),
             mark: mine.mark || "",
             weight: WEIGHTS[mine.weight] ? mine.weight : "",
             dash: mine.dash ? (WEIGHTS[mine.weight] || WEIGHTS[style.weight] ||
                                WEIGHTS.normal) : 0 };
  }

  // Whether a shape has been set in anything but the plain, and which: a few
  // letters, so a shape already wearing exactly this is stepped over the
  // way one already wearing its colors is.  A highlighter is measured
  // against the words it sits behind, so a highlighted shape is redone when
  // the chart's typeface or size moves those words.
  function lookSaid(look) {
    var L = lettersOf();
    return (look.size ? look.size.toFixed(2) : "") + (look.bold ? "b" : "") +
           (look.italic ? "i" : "") + (look.under ? "u" : "") +
           (look.strike ? "s" : "") + (look.weight ? "w" + look.weight : "") +
           (look.dash ? "d" + look.dash : "") +
           (look.mark ? "@" + look.mark + (L.face || "") + chartPt() : "");
  }

  function dressShape(g, look) {
    var texts = all("text", g);
    var lines = [look.under ? "underline" : "", look.strike ? "line-through" : ""]
      .join(" ").trim();
    texts.forEach(function (t) {
      t.style.fontSize = look.size ? look.size.toFixed(2) + "px" : "";
      t.style.fontWeight = look.bold ? "bold" : "";
      t.style.fontStyle = look.italic ? "italic" : "";
      t.style.textDecoration = lines;
    });
    // The border is said on the shape's group and taken up by its outline
    // from there, rather than written on the outline itself: the outline of
    // a shape that is picked, or is the one a run is on, is drawn heavier
    // by the stylesheet, and that has to keep winning over this.
    // The dashes are as long as the line is heavy, so that a heavy dashed
    // border reads as dashed and not as a row of blobs.
    g.style.strokeWidth = look.weight ? String(WEIGHTS[look.weight]) : "";
    g.style.strokeDasharray = look.dash
      ? (look.dash * 4.5).toFixed(1) + " " + (look.dash * 3).toFixed(1) : "";
    markUp(g, texts, look.mark);
    return texts.length + 1;
  }

  // A highlighter across the words, line by line, the way one goes across a
  // page: just behind the letters and as long as each line is.  SVG words
  // have no background of their own to color, so it is drawn -- in the
  // shape's own group, behind its words, where it travels with the shape
  // into a saved SVG and a PNG and is clicked as the shape.  It is measured
  // from the words as they now are, so it comes after everything else about
  // them has been put on.
  function markUp(g, texts, color) {
    if (coatLater) { coatLater.push([g, texts, color]); return; }   // freshCoat
    var had = el(".highlights", g);
    if (had) { had.remove(); }
    if (!color || !texts.length) { return; }
    inView(g);                           // a word left out cannot be measured
    var NS = "http://www.w3.org/2000/svg";
    var pen = document.createElementNS(NS, "g");
    pen.setAttribute("class", "highlights");
    texts.forEach(function (t) {
      if (!t.textContent.trim()) { return; }
      var box;
      try { box = t.getBBox(); } catch (e) { return; }
      if (!box || !box.width) { return; }  // not on show: nothing to measure
      var r = document.createElementNS(NS, "rect");
      r.setAttribute("class", "highlight");
      r.setAttribute("x", (box.x - 2).toFixed(1));
      r.setAttribute("y", box.y.toFixed(1));
      r.setAttribute("width", (box.width + 4).toFixed(1));
      r.setAttribute("height", box.height.toFixed(1));
      r.setAttribute("rx", "2");
      r.setAttribute("fill", color);
      r.setAttribute("stroke", "none");
      pen.appendChild(r);
    });
    // Measured where the words are drawn, so drawn where they are: a block
    // moved on a built chart has each of its pieces moved (30-blocks.js),
    // the words included, and the marks go with them.
    var shifted = texts[0].getAttribute("transform");
    if (shifted) { pen.setAttribute("transform", shifted); }
    texts[0].parentNode.insertBefore(pen, texts[0]);
  }

  // One color, on one element, unless it is already wearing it.  The slot
  // is where that element keeps what it was last given; no two of the
  // sweeps below touch the same element, so no two of them share a slot.
  // A drawing arrives wearing its own colors and no styling of its own, so
  // an element nothing has been said about yet, being told to take no color,
  // is being told what it already is.  Saying so costs as much as saying
  // anything else, and a chart built with no palette chosen is every element
  // in it being told exactly that -- several frames of writing nothing.
  function putOn(e, slot, color, how) {
    if (e[slot] === color) { return; }
    if (e[slot] === undefined && color === "") { e[slot] = color; return; }
    if (daubed >= ATONCE && !paintingAll) { leftOver = true; return; }
    how(e, color);
    e[slot] = color;
    daubed += 1;
  }

  var paintWaiting = 0;
  function paintSoon() {
    if (paintWaiting) { return; }
    paintWaiting = requestAnimationFrame(function () {
      paintWaiting = 0;
      paint();
    });
  }

  // Which shape to begin at: the one nearest the top of what is on the
  // screen.  Shapes come in the order they were drawn, which down a
  // flowchart is top to bottom, so where the stage is scrolled to says
  // near enough which of them is being looked at.  It settles nothing but
  // what gets its color first, so near enough is enough.
  function eyeAt(howMany) {
    var stage = el("#stage");
    if (paintingAll || !stage || howMany < 2) { return 0; }
    var room = stage.scrollHeight - stage.clientHeight;
    if (room <= 0) { return 0; }
    return Math.min(howMany - 1,
                    Math.max(0, Math.floor(stage.scrollTop / room * (howMany - 1))));
  }

  // Who is in the chart, worked out once per drawing rather than once per
  // frame.  Asking the chart for its arrows and its words again on every
  // round of a recoloring is a tenth of the work of the recoloring itself,
  // and the answer cannot have changed: a chart is never edited in place,
  // it is drawn again from the top, and a drawing that has been done again
  // is a new element with nothing remembered on it.  The count of what is
  // directly inside it is watched all the same, in case some later part of
  // the page learns to put something in without redrawing.
  function whoIsIn() {
    if (chart._lists && chart._lists.were === chart.childElementCount) {
      return chart._lists;
    }
    chart._lists = {
      were: chart.childElementCount,
      paper: all(".sheet, .patch", chart),
      flows: all(".flow", chart),
      heads: all(".head", chart),
      said: all(".label, .heading, .title, .author", chart),
      fine: all(".grid.fine", chart),
      major: all(".grid.major", chart),
      ruled: all(".grid", chart),
      nodes: all(".node", chart),
      keyShapes: all(".key-shape", chart),   // the key of a drawing by hand
      words: el("g[font-family]", chart)     // the group every word is in
    };
    return chart._lists;
  }

  function paint() {
    if (!chart) { return; }
    daubed = 0;
    leftOver = false;
    var here = whoIsIn();
    // The shapes are done before the arrows and the words, and are done
    // starting from what is on the screen.  Order only matters when there
    // is more to do than fits in a frame, and then it matters a great
    // deal: the arrows outnumber the shapes, so filling them in first ate
    // the whole of the first frame and left every shape in the old color
    // -- the chart appeared to do nothing at all until the frame after.
    var nodes = here.nodes;
    var first = eyeAt(nodes.length);
    nodes.forEach(function (ignored, step) {
      var g = nodes[(first + step) % nodes.length];
      var k = kindColors(g.dataset.kind), n = style.nodes[g.dataset.i] || {};
      var fill = n.fill || k.fill || "";
      var line = n.line || k.line || style.ink || "";
      var word = n.text || k.text || style.words || style.ink || "";
      // and readable on what they are on, unless turned down (02-read.js)
      var fix = shapeReads(g.dataset.kind, fill, line, word, n);
      line = fix.line;
      word = fix.word;
      var look = shapeLook(g.dataset.i);
      // and a highlighter behind them that they can be read on
      fix.mark = markReads(look.mark, word, n);
      if (fix.mark) { look.mark = fix.mark.now; }
      g._read = fix.changed || fix.mark ? fix : null;
      var dress = lookSaid(look);
      // Looking inside a shape is the expensive part of this, so a shape
      // already wearing all three of its colors, and its words already set
      // the way they are meant to be, is stepped over whole and never
      // looked into at all.
      if (g._fill === fill && g._line === line && g._word === word &&
          g._dress === dress) { return; }
      if (g._fill === undefined && !fill && !line && !word && !dress) {
        g._fill = fill; g._line = line; g._word = word;   // already exactly this
        g._dress = dress;
        return;
      }
      if (daubed >= ATONCE && !paintingAll) { leftOver = true; return; }
      if (g._fill !== fill || g._line !== line) {
        // circle is the actor's head: left out, it stayed white and black.
        all("ellipse, rect, polygon, path, circle", g).forEach(function (e) {
          // .ghost is the clear pane behind a words-only box: it is there to
          // be clicked, never to be seen, so no color is put on it at all.
          // Nor on the highlighter behind the words, which has its own.
          if (e.classList.contains("ghost") || e.classList.contains("highlight")) {
            return;
          }
          if (!e.classList.contains("trim")) { e.style.fill = fill; }
          e.style.stroke = line;
          daubed += 1;
        });
        all("line", g).forEach(function (e) {
          e.style.stroke = line;
          daubed += 1;
        });
        g._fill = fill;
        g._line = line;
      }
      if (g._word !== word) {
        all("text", g).forEach(function (e) {
          e.style.fill = word;
          daubed += 1;
        });
        g._word = word;
      }
      if (g._dress !== dress) {
        daubed += dressShape(g, look);
        g._dress = dress;
      }
    });
    // The chart's typeface and the size of its words go on the group every
    // word in it sits inside, so the key, the labels on the arrows and the
    // title change with the shapes.  The size is only a first sight of it:
    // bigger words need bigger boxes, and the chart is laid out again for
    // them a moment later (see reflowSoon).  The page beside an .svg cannot
    // do that, so it is never asked to wear either.
    var L = lettersOf();
    if (here.words) {
      putOn(here.words, "_face",
            CAN_REFLOW && L.face && L.face !== "sans" && FACES[L.face]
              ? FACES[L.face] : "", faceIt);
      putOn(here.words, "_size",
            CAN_REFLOW && chartPt() !== PLAIN_PT
              ? ptPx(chartPt()).toFixed(2) + "px" : "", sizeIt);
      // And how heavy every line is drawn, the same way: said once where
      // every line takes it from, never on a line of its own.
      putOn(here.words, "_weight",
            style.weight && style.weight !== "normal" && WEIGHTS[style.weight]
              ? String(WEIGHTS[style.weight]) : "", weighIt);
    }
    var paper = style.sheet || "";
    here.paper.forEach(function (e) { putOn(e, "_paper", paper, fillIt); });
    // The paper is two things: the rectangle the drawing fills, and the
    // rounded block it is clipped to.  Only the rectangle was being
    // colored, so on any palette whose paper is not white -- Night most of
    // all -- the block's own white showed through where the corners round
    // off, as a pale curve at each corner of the chart.  They are one sheet
    // of paper, so they take one color; with no palette on, both fall back
    // to the white the stylesheet gives it.
    var block = el("#sheet");
    if (block && block._paper !== paper) {
      block.style.background = paper;
      block._paper = paper;
    }
    // The key along the top of a drawing by hand: each shape in it the
    // colors its kind wears on the paper, as a built chart's key is.
    here.keyShapes.forEach(function (g) {
      var k = kindColors(g.dataset.kind), line = k.line || style.ink || "";
      all("ellipse, rect, polygon, path, circle, line", g).forEach(function (e) {
        if (e.classList.contains("ghost")) { return; }
        if (e.tagName !== "line" && !e.classList.contains("trim")) {
          putOn(e, "_fill", k.fill, fillIt);
        }
        putOn(e, "_line", line, strokeIt);
      });
    });
    // The arrows and the words along them, readable on the paper (02-read.js).
    var readOn = chartReads(style.ink || "", style.words || style.ink || "");
    var ink = readOn.ink;
    here.flows.forEach(function (e) { putOn(e, "_ink", ink, strokeIt); });
    here.heads.forEach(function (e) { putOn(e, "_ink", ink, bothIt); });
    var said = readOn.said;
    here.said.forEach(function (e) { putOn(e, "_said", said, fillIt); });
    var ruling = style.grid || "";
    here.fine.forEach(function (e) { putOn(e, "_ruling", ruling, strokeIt); });
    var heavier = ruling ? darken(ruling, 0.9) : "";
    here.major.forEach(function (e) { putOn(e, "_ruling", heavier, strokeIt); });
    var shown = style.gridOff ? "none" : "";
    here.ruled.forEach(function (e) { putOn(e, "_shown", shown, showIt); });
    all(".keymark", document).forEach(function (mark) {
      var kind = mark.dataset.kind, k = kindColors(kind);
      all("ellipse, rect, polygon, path, circle", mark).forEach(function (e) {
        e.setAttribute("fill", k.fill || style.sheet || "#ffffff");
        e.setAttribute("stroke", k.line || style.ink || "#10151b");
      });
      all("line", mark).forEach(function (e) {
        e.setAttribute("stroke", k.line || style.ink || "#10151b");
      });
    });
    if (!leftOver) {
      readMarks();                       // what was made readable, marked (02-read.js)
      dressResets();                     // and which cards have anything to put back (22-reset.js)
    }
    keep();
    if (leftOver && !paintingAll) { paintSoon(); }
  }

  // Everything that takes a copy of the chart -- saving it, making a PNG
  // of it, handing it to a printer -- asks for this before it looks.  A
  // big chart may be a frame or two from finished when the button is
  // pressed, and a copy taken then would be a copy of a chart caught
  // half way into its new colors.  Nothing here is scheduled, and nothing
  // is held back for a later frame: the frame's allowance is for the eye,
  // and a copy has no eye, so it is all done in the one pass.  It used to
  // keep to the allowance and go round again for the rest -- every round
  // walking the whole chart to find what was left, several hundred rounds
  // on a big one.
  function paintedThrough() {
    if (paintWaiting) {
      cancelAnimationFrame(paintWaiting);
      paintWaiting = 0;
    }
    paintingAll = true;
    try {
      var rounds = 0;
      do { paint(); } while (leftOver && ++rounds < 500);
    } finally { paintingAll = false; }
  }

  // A new drawing, colored in full the moment it is on the page and
  // before anything on the page has measured it.  It arrives from the
  // drawing in plain black and white, and a big one used to be recolored
  // the way a palette change is -- a frame's allowance at a time, starting
  // wherever the view happened to be -- after the page had already laid it
  // out.  So for a moment the paper was white under a Night palette, the
  // arrows black, most of the shapes plain, and the pen was drawing them
  // like that; then every one of them faded across into its real colors,
  // because a color that changes on something already laid out is a color
  // the stylesheet fades.  Colored before it is laid out, the drawing has
  // no earlier color to fade from: the first frame of it is in the palette.
  //
  // The highlighter behind a shape's words is the one thing here that has
  // to measure, and measuring lays the drawing out, so the highlighters
  // wait until every color is on.
  var coatLater = null;                  // highlighters waiting on a fresh coat
  function freshCoat() {
    coatLater = [];
    try { paintedThrough(); }
    finally {
      var later = coatLater;
      coatLater = null;
      later.forEach(function (m) { markUp(m[0], m[1], m[2]); });
    }
  }

  // ----------------------------------------------------- the panel of it --
  // Every shape, drawn the same way the script draws it -- used for the
  // shapes you place by hand and, small, for the picture on each button, so
  // what you pick is exactly what you get.
