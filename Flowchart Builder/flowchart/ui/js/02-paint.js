// ---------------------------------------------------------------------------
//  02-paint.js -- putting the colors on
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
    if (daubed >= ATONCE) { leftOver = true; return; }
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
      nodes: all(".node", chart)
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
      var k = style.kinds[g.dataset.kind] || {}, n = style.nodes[g.dataset.i] || {};
      var fill = n.fill || k.fill || "";
      var line = n.line || k.line || style.ink || "";
      var word = n.text || k.text || style.words || style.ink || "";
      // Looking inside a shape is the expensive part of this, so a shape
      // already wearing all three of its colors is stepped over whole and
      // never looked into at all.
      if (g._fill === fill && g._line === line && g._word === word) { return; }
      if (g._fill === undefined && !fill && !line && !word) {
        g._fill = fill; g._line = line; g._word = word;   // already exactly this
        return;
      }
      if (daubed >= ATONCE) { leftOver = true; return; }
      if (g._fill !== fill || g._line !== line) {
        all("ellipse, rect, polygon, path", g).forEach(function (e) {
          // .ghost is the clear pane behind a words-only box: it is there to
          // be clicked, never to be seen, so no color is put on it at all
          if (e.classList.contains("ghost")) { return; }
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
    });
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
    var ink = style.ink || "";
    here.flows.forEach(function (e) { putOn(e, "_ink", ink, strokeIt); });
    here.heads.forEach(function (e) { putOn(e, "_ink", ink, bothIt); });
    var said = style.words || style.ink || "";
    here.said.forEach(function (e) { putOn(e, "_said", said, fillIt); });
    var ruling = style.grid || "";
    here.fine.forEach(function (e) { putOn(e, "_ruling", ruling, strokeIt); });
    var heavier = ruling ? darken(ruling, 0.9) : "";
    here.major.forEach(function (e) { putOn(e, "_ruling", heavier, strokeIt); });
    var shown = style.gridOff ? "none" : "";
    here.ruled.forEach(function (e) { putOn(e, "_shown", shown, showIt); });
    all(".keymark", document).forEach(function (mark) {
      var kind = mark.dataset.kind, k = style.kinds[kind] || {};
      all("ellipse, rect, polygon, path, circle", mark).forEach(function (e) {
        e.setAttribute("fill", k.fill || style.sheet || "#ffffff");
        e.setAttribute("stroke", k.line || style.ink || "#10151b");
      });
      all("line", mark).forEach(function (e) {
        e.setAttribute("stroke", k.line || style.ink || "#10151b");
      });
    });
    keep();
    if (leftOver && !paintingAll) { paintSoon(); }
  }

  // Everything that takes a copy of the chart -- saving it, making a PNG
  // of it, handing it to a printer -- asks for this before it looks.  A
  // big chart may be a frame or two from finished when the button is
  // pressed, and a copy taken then would be a copy of a chart caught
  // half way into its new colors.  Nothing here is scheduled: it goes
  // round until there is nothing left over, however many rounds that is.
  function paintedThrough() {
    if (paintWaiting) {
      cancelAnimationFrame(paintWaiting);
      paintWaiting = 0;
    }
    paintingAll = true;
    var rounds = 0;
    do { paint(); } while (leftOver && ++rounds < 500);
    paintingAll = false;
  }

  // ----------------------------------------------------- the panel of it --
  // Every shape, drawn the same way the script draws it -- used for the
  // shapes you place by hand and, small, for the picture on each button, so
  // what you pick is exactly what you get.
