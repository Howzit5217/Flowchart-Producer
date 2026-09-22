// ---------------------------------------------------------------------------
//  06-chart.js -- the chart pane: binding, zoom, dragging about
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------- the chart pane --
  // Where a mouse event lands on the paper, in the chart's own numbers --
  // which is what the shapes and arrows are kept in, whatever the zoom.
  function onPaper(ev) {
    if (!chart || !chart.getScreenCTM) { return null; }
    var frame = chart.getScreenCTM();
    if (!frame) { return null; }
    var spot = chart.createSVGPoint();
    spot.x = ev.clientX;
    spot.y = ev.clientY;
    spot = spot.matrixTransform(frame.inverse());
    // The paper's corner is the origin -- except by hand, where the paper
    // can reach out past where the design's own numbers start.
    return byHand ? onHand(spot) : { x: spot.x, y: spot.y };
  }

  // How much chart there is to shift about.  A chart of a few dozen shapes
  // slides under the eye at sixty frames a second; one of ten thousand does
  // not, and trying is worse than not trying.  Every frame of a glide scrolls
  // the stage, every scroll has the bars measure the chart again, and the
  // browser repaints half a million pixels of paper -- fifteen times over,
  // for one step of a run.  Past a few hundred shapes the camera cuts
  // straight to where it is going instead: one move, one repaint, and a page
  // that answers the mouse while a program is running.
  var HEAVY = 600;                       // shapes, past which it cuts
  var heavy = false;

  function bind() {
    chart = el("#sheet svg");
    if (!chart) { return; }
    chart.id = "chart";
    var box = (chart.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    W = box[2] || 800; H = box[3] || 600;
    readBands();         // before anything has the page lay the chart out
    heavy = chart.querySelectorAll(".node").length > HEAVY;
    sizeList();          // what a PNG of it comes to, now the chart is known
    chart.onclick = function (ev) {
      var g = ev.target.closest ? ev.target.closest(".node") : null;
      if (byHand) {
        var arrow = ev.target.closest ? ev.target.closest(".link") : null;
        var spot = ev.target.closest ? ev.target.closest(".spot") : null;
        if (spot) { handClick(+spot.dataset.i, +spot.dataset.side); return; }
        if (g) { handClick(+g.dataset.i.slice(1)); }
        else if (arrow) { pickLink(+arrow.dataset.link); }
        else {
          var spot = onPaper(ev);        // near enough to an arrow to count?
          var meant = spot && linkNear(spot.x, spot.y, 16);
          if (meant) { pickLink(meant.id); return; }
          picked = chosen = null; joining = false;
          drawHand(); drawHandPanel();
        }
        return;
      }
      select(g);
      if (g) { styleThePicked(); }     // and the side that has its styling
    };
    if (byHand) { joinDrag(chart); dragging(chart); }
    chart.oncontextmenu = function (ev) {
      if (!byHand) { return; }
      var g = ev.target.closest ? ev.target.closest(".node") : null;
      var arrow = ev.target.closest ? ev.target.closest(".link") : null;
      ev.preventDefault();
      if (g) { shapeMenu(nodeById(+g.dataset.i.slice(1)), ev.clientX, ev.clientY); }
      else if (arrow) { arrowMenu(linkById(+arrow.dataset.link), ev.clientX, ev.clientY); }
      else {
        var spot = onPaper(ev);
        var meant = spot && linkNear(spot.x, spot.y, 16);
        if (meant) { arrowMenu(meant, ev.clientX, ev.clientY); }
        else { paperMenu(ev.clientX, ev.clientY); }
      }
    };
    chart.ondblclick = function (ev) {
      var g = ev.target.closest ? ev.target.closest(".node") : null;
      if (g) {
        if (byHand) { typeInto(g); }
        else { pickLine(+g.dataset.i); }
        return;
      }
      if (!byHand) { return; }
      var arrow = ev.target.closest ? ev.target.closest(".link") : null;
      var link = arrow ? linkById(+arrow.dataset.link) : null;
      if (!link) {                       // near enough to it counts as on it
        var spot = onPaper(ev);
        link = spot && linkNear(spot.x, spot.y, 16);
      }
      if (link) { chosen = link.id; typeOnLink(link); }
    };
    sel = null;
    show();
    buildKinds();
    drawSelection();
    // The saved .svg is a copy of the whole drawing, written out.  Made on
    // every build, a chart of some thousands of shapes stopped the page for
    // a second or more each time -- every color finished at once, the lot
    // copied, the copy written out -- for a file most builds never save.
    // The link makes its copy on the press in any case, so a heavy chart is
    // left to that.
    if (heavy) { linkLater(); } else { linkSvg(); }
    sizeNote();
  }

  // Every shape on the paper by its number, found once per drawing rather
  // than once per ask.  A run lights a shape at every step, and the cursor
  // in the pseudocode marks one on every frame it moves; each of those used
  // to search the whole chart for it, which on a chart of forty thousand
  // shapes is a quarter of a million elements searched, over and over.  A
  // drawing is never changed in place -- a new one is a new element with
  // nothing remembered on it -- so the list is kept on the chart itself.
  function shapesNumbered(id) {
    if (!chart || !id) { return []; }
    var seen = chart._numbered;
    if (!seen) {
      seen = chart._numbered = {};
      all(".node[data-i]", chart).forEach(function (g) {
        (seen[g.dataset.i] = seen[g.dataset.i] || []).push(g);
      });
    }
    return (seen[id] || []).filter(function (g) { return g.isConnected; });
  }

  // ---------------------------------------------- only what can be seen --
  // A browser lays out every word of a drawing, on the screen or not, and
  // lays every one of them out again whenever the zoom changes.  On a chart
  // of thirty thousand shapes that was a second and a half on arrival and
  // half a second for every step of the zoom, spent on words thousands of
  // screens away.  So the drawing of a chart that big comes in bands, each
  // a stretch of its height (draw/svg.py), and only the bands near what is
  // on the stage are drawn at all: the rest are left out until the view
  // comes near them.  Nothing is taken out of the chart -- every shape is
  // still there to be found, colored, counted, saved and printed, and a
  // copy of the chart carries every band -- it is only not laid out.
  //
  // Anything about to measure a shape asks for its band first (inView), so
  // that nothing is measured while it is left out.
  var bands = [];                        // this drawing's bands, if any
  function readBands() {
    bands = [];
    all(".stretch", chart).forEach(function (g) {
      var y = (g.getAttribute("data-y") || "").split(" ").map(Number);
      var sure = y.length === 2 && isFinite(y[0]) && isFinite(y[1]);
      bands.push({ el: g, on: false, top: sure ? y[0] : -Infinity,
                   foot: sure ? y[1] : Infinity });
    });
    if (bands.length) { chart.classList.add("culled"); }
  }

  // The bands a screen and a half either side of what the stage shows.
  // Measured off the page, like the camera, so that it is right however the
  // chart got where it is: scrolled, carried, zoomed or drawn again.
  function showBands() {
    if (!chart || !bands.length || !zoom) { return; }
    var stage = el("#stage");
    if (!stage) { return; }
    var r = chart.getBoundingClientRect(), s = stage.getBoundingClientRect();
    var top = (s.top - r.top) / zoom, foot = (s.bottom - r.top) / zoom;
    var pad = Math.max(600, (foot - top) * 1.5);
    top -= pad;
    foot += pad;
    bands.forEach(function (b) {
      var on = b.foot >= top && b.top <= foot;
      if (on !== b.on) { b.on = on; b.el.classList.toggle("seen", on); }
    });
  }

  function inView(g) {
    var band = g && g.closest ? g.closest(".stretch") : null;
    if (!band || band.classList.contains("seen")) { return; }
    band.classList.add("seen");
    bands.forEach(function (b) { if (b.el === band) { b.on = true; } });
  }

  if (el("#stage")) {
    el("#stage").addEventListener("scroll", showBands, { passive: true });
  }
  window.addEventListener("resize", showBands);

  // Carrying something towards the edge takes the view with it.  Without
  // this, dragging a shape to where there is no room yet means letting go,
  // scrolling, picking it up again, and again -- when what you meant was
  // simply to put it further over.  The nearer the edge the mouse gets, the
  // faster the view follows, and it stops the moment you let go.
  var chaseOn = null;

  function chase(at, each) {
    var stage = el("#stage");
    if (!stage) { return; }
    var edge = stage.getBoundingClientRect();
    var REACH = 56, MOST = 22;           // how near, and how fast at most
    var dx = 0, dy = 0;
    if (at.x < edge.left + REACH) { dx = -(REACH - (at.x - edge.left)); }
    else if (at.x > edge.right - REACH) { dx = REACH - (edge.right - at.x); }
    if (at.y < edge.top + REACH) { dy = -(REACH - (at.y - edge.top)); }
    else if (at.y > edge.bottom - REACH) { dy = REACH - (edge.bottom - at.y); }
    dx = Math.max(-MOST, Math.min(MOST, dx / REACH * MOST));
    dy = Math.max(-MOST, Math.min(MOST, dy / REACH * MOST));
    if (!dx && !dy) { chaseStop(); return; }
    if (chaseOn) { chaseOn.dx = dx; chaseOn.dy = dy; chaseOn.each = each; return; }
    chaseOn = { dx: dx, dy: dy, going: true, each: each };
    (function keepUp() {
      if (!chaseOn || !chaseOn.going) { return; }
      // Locked, the view is moved by scrolling it.  Loose, there is no
      // scrolling to do, so the chart is moved the other way instead, which
      // comes to the same thing on screen.
      if (loose) { holdBy(-chaseOn.dx, -chaseOn.dy); }
      else {
        stage.scrollLeft += chaseOn.dx;
        stage.scrollTop += chaseOn.dy;
      }
      // the mouse is standing still while the view moves under it, so what
      // is being carried has to be worked out again each frame
      if (chaseOn.each) { chaseOn.each(); }
      requestAnimationFrame(keepUp);
    })();
  }

  function chaseStop() {
    if (chaseOn) { chaseOn.going = false; }
    chaseOn = null;
  }

  function joinDrag(svg) {               // drag from the handle to a shape
    svg.addEventListener("pointerdown", function (ev) {
      var knob = ev.target.closest && ev.target.closest(".knob");
      if (!knob) { return; }
      ev.preventDefault();
      ev.stopPropagation();
      var from = nodeById(+knob.dataset.i);
      if (!from) { return; }
      // The dot it was drawn from is the side it leaves by, from now on.
      var side = +knob.dataset.side;
      var start = ports(from)[side] || from;
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* mouse: fine */ }
      keepUndo();                        // joining two up can be stepped back
      // What is being drawn is an arrow, so it is drawn as one: a solid line
      // with a point on the end that follows the mouse.  A dotted thread gave
      // no sense of which way round the join was going to be.
      var band = document.createElementNS("http://www.w3.org/2000/svg", "g");
      band.setAttribute("class", "band");
      var wire = document.createElementNS("http://www.w3.org/2000/svg", "path");
      wire.setAttribute("class", "band-line");
      wire.setAttribute("fill", "none");
      var tip = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      tip.setAttribute("class", "band-tip");
      band.appendChild(wire);
      band.appendChild(tip);
      // Every other shape puts its dots out while the line is drawn, the way
      // they do for click a dot, click a dot, so that a line dragged can be
      // let go on the side it should come in by as well as be drawn from the
      // side it leaves by.  The dot the point comes near lights up, the
      // point goes to it, and that is the side the arrow keeps.
      var aims = document.createElementNS("http://www.w3.org/2000/svg", "g");
      aims.setAttribute("class", "aims");
      hand.nodes.forEach(function (n) {
        if (n.id === from.id) { return; }
        ports(n).forEach(function (port, s) {
          var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("class", "spot");
          dot.setAttribute("data-i", n.id);
          dot.setAttribute("data-side", s);
          dot.setAttribute("cx", port.x + handOrigin.x + port.dx * 1.5);
          dot.setAttribute("cy", port.y + handOrigin.y + port.dy * 1.5);
          dot.setAttribute("r", DOT_SPOT);
          aims.appendChild(dot);
        });
      });
      svg.appendChild(aims);
      svg.appendChild(band);
      var aimed = null;                  // the dot it would go to, let go now
      var box = svg.getBoundingClientRect();
      var scale = (box.width || W) / W;
      var at = { x: ev.clientX, y: ev.clientY };
      // Drawn on the paper, so from where the dot is on the paper.
      var fromX = start.x + handOrigin.x, fromY = start.y + handOrigin.y;
      function reach() {
        box = svg.getBoundingClientRect();   // the view may have moved under us
        var toX = (at.x - box.left) / scale, toY = (at.y - box.top) / scale;
        var near = null, nearest = Math.pow(18 / scale, 2);
        Array.prototype.forEach.call(aims.childNodes, function (dot) {
          var far = Math.pow(dot.getAttribute("cx") - toX, 2) +
                    Math.pow(dot.getAttribute("cy") - toY, 2);
          if (far < nearest) { nearest = far; near = dot; }
        });
        if (near !== aimed) {
          if (aimed) { aimed.classList.remove("aimed"); aimed.setAttribute("r", DOT_SPOT); }
          if (near) { near.classList.add("aimed"); near.setAttribute("r", DOT_SPOT + 2); }
          aimed = near;
        }
        if (aimed) { toX = +aimed.getAttribute("cx"); toY = +aimed.getAttribute("cy"); }
        wire.setAttribute("d", "M" + fromX + "," + fromY + "L" + toX + "," + toY);
        var dx = toX - fromX, dy = toY - fromY;
        var run = Math.hypot(dx, dy) || 1;
        var ux = dx / run, uy = dy / run;
        var back = 11, wide = 4.5;
        var cx = toX - ux * back, cy = toY - uy * back;
        tip.setAttribute("points",
          toX + "," + toY + " " +
          (cx - uy * wide) + "," + (cy + ux * wide) + " " +
          (cx + uy * wide) + "," + (cy - ux * wide));
        tip.style.display = run > back + 2 ? "" : "none";
      }
      function move(e) {
        at = { x: e.clientX, y: e.clientY };
        chase(at, reach);
        reach();
      }
      function drop(e) {
        chaseStop();
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", drop);
        band.remove();
        aims.remove();
        var went = Math.abs(e.clientX - ev.clientX) + Math.abs(e.clientY - ev.clientY);
        if (went < 5) {
          // Pressed and let go on the spot: take it as a click, and wait for
          // the shape it should go to rather than asking for a drag.
          picked = from.id;
          joining = true;
          joinFrom = { id: from.id, side: side };   // and it leaves from here
          drawHand();
          drawHandPanel();
          return;
        }
        var under = document.elementFromPoint(e.clientX, e.clientY);
        var g = under && under.closest ? under.closest(".node") : null;
        var dot = aimed || (under && under.closest ? under.closest(".spot") : null);
        // Let go on a dot, it goes in there; anywhere else on the shape, it
        // goes in whichever side is free and suits it.
        if (dot) { joinUp(from.id, +dot.dataset.i, side, +dot.dataset.side); return; }
        if (g) { joinUp(from.id, +g.dataset.i.slice(1), side); return; }
        // Let go over nothing.  The shape you were drawing from stays the one
        // in hand, so you can simply try again rather than hunt for it.
        picked = from.id;
        drawHand();
        drawHandPanel();
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", drop);
    });
  }

  // Moving a shape, and making one bigger or smaller.
  //
  // Picking one up and putting it down again has to be the same thing as
  // clicking it.  It was not: the first pixel of movement redrew the chart,
  // which threw away the very element the press had landed on, so the browser
  // had nothing left to raise a click against and the shape was never taken
  // up.  You could shove a shape about all day and never once select it.
  // So the press is remembered, the chart is left alone until the mouse has
  // really gone somewhere, and letting go without having moved counts as a
  // click -- which is what makes clicking a shape a second time work.
  var NUDGE = 4;                         // movement below this is a click

  function dragging(svg) {
    svg.addEventListener("pointerdown", function (ev) {
      if (ev.button) { return; }
      if (ev.target.closest &&
          (ev.target.closest(".knob") || ev.target.closest(".spot"))) { return; }
      var grip = ev.target.closest && ev.target.closest(".grip");
      var g = ev.target.closest && ev.target.closest(".node");
      if (!g && !grip) { return; }
      var node = nodeById(+(grip || g).dataset.i.toString().replace(/^h/, ""));
      if (!node) { return; }
      ev.preventDefault();
      var scale = (svg.getBoundingClientRect().width || W) / W;
      var fromX = ev.clientX, fromY = ev.clientY;
      var wasX = node.x, wasY = node.y, wasW = node.w, wasH = node.h;
      var least = ROOM[node.kind] || ROOM.rect;
      var stirred = false, waiting = false;
      // Taking hold of a shape takes it up, whether it then gets moved or
      // not.  It is only noted here; the chart is not redrawn until the
      // mouse has actually gone somewhere, because redrawing under a press
      // is what used to lose the press.
      // Follow this finger or pen wherever it goes, even off the shape and
      // off the chart, and keep the browser from scrolling the page with it.
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* mouse: fine */ }
      var pickedBefore = picked;
      var noted = false;                 // a copy is kept the moment it moves
      if (g) { picked = node.id; chosen = null; }

      function paint() {
        if (waiting) { return; }
        waiting = true;
        requestAnimationFrame(function () { waiting = false; drawHand(); });
      }
      var stage = el("#stage");
      var wasLeft = stage ? stage.scrollLeft : 0;
      var wasDown = stage ? stage.scrollTop : 0;
      var wasHoldX = holdX, wasHoldY = holdY;
      var at = { x: ev.clientX, y: ev.clientY };
      var pressed = onPaper(ev);         // where on the design it was taken up

      function move(e) {
        at = { x: e.clientX, y: e.clientY };
        carry();
      }
      function carry() {
        // How far it has been carried, on the design: where the mouse is on
        // it now against where it was pressed, asked of the page.  Adding up
        // how far the view had travelled since the press -- scrolled one way,
        // or, on a loose chart, carried the other -- counted the view being
        // put back while the paper grew (keepStill) as the view moving, and
        // pushed the shape on by that much again.
        var here = pressed && onPaper({ clientX: at.x, clientY: at.y });
        var dx, dy;
        if (here) {
          dx = here.x - pressed.x;
          dy = here.y - pressed.y;
        } else {                         // a drawing the page will not place
          dx = (at.x - fromX) / scale + ((stage ? stage.scrollLeft - wasLeft : 0)
                                         - (holdX - wasHoldX)) / scale;
          dy = (at.y - fromY) / scale + ((stage ? stage.scrollTop - wasDown : 0)
                                         - (holdY - wasHoldY)) / scale;
        }
        if (!stirred && Math.abs(dx) < NUDGE && Math.abs(dy) < NUDGE) { return; }
        if (!noted) { noted = true; keepUndo(); }
        stirred = true;
        shapeCarried = true;                // the view is kept still under it
        chase(at, carry);
        if (grip) {
          // The corner opposite the one being held stays where it is, so the
          // shape grows and shrinks from the corner in hand rather than from
          // its middle.  Working from that fixed corner keeps it exact even
          // when the size runs into its smallest.
          var toward = grip.dataset.corner || "se";
          var ax = toward.indexOf("e") >= 0 ? 1 : -1;
          var ay = toward.indexOf("s") >= 0 ? 1 : -1;
          var heldX = wasX - ax * wasW / 2;      // the corner that stays put
          var heldY = wasY - ay * wasH / 2;
          // Sizes go in steps of two quarters, so that half of them is a
          // whole quarter: that is what puts a shape's sides on the ruling
          // rather than only its middle.
          var STEP = HAND_GRID * 2;
          node.w = Math.max(least[0] * 0.5,
                            Math.round((wasW + ax * dx) / STEP) * STEP);
          node.h = Math.max(least[1] * 0.5,
                            Math.round((wasH + ay * dy) / STEP) * STEP);
          if (node.kind === "circle") { node.w = node.h = Math.max(node.w, node.h); }
          node.x = heldX + ax * node.w / 2;
          node.y = heldY + ay * node.h / 2;
          node.own = true;               // a size set by hand, so keep it
        } else {
          node.x = Math.round((wasX + dx) / HAND_GRID) * HAND_GRID;
          node.y = Math.round((wasY + dy) / HAND_GRID) * HAND_GRID;
          lineUp(node);                  // and settle onto anything it is near
        }
        paint();
      }
      function drop() {
        chaseStop();
        guides = [];                     // the red lines go with the holding
        shapeCarried = false;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", drop);
        if (!stirred && g) {
          // Clicking a shape that is already the one in hand starts typing
          // in it, the way it does everywhere else -- one press to take it
          // up, another to write in it.  A double-click still works too.
          var was = pickedBefore;
          var id = +g.dataset.i.slice(1);
          handClick(id);
          if (was === id) {
            var now = el('.node[data-i="h' + id + '"]', el("#chart"));
            if (now) { typeInto(now); }
          }
        }
        else { drawHand(); drawHandPanel(); letGo(); }
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", drop);
    });
  }

  // A chart wider than the room it has is shown at a size that fits.  On a
  // phone that is nearly always, and a chart with its sides cut off is no
  // use to anybody; on a wide screen it only happens to charts that really
  // are too big, which is exactly when it is wanted.
  function fitIfItMustBe() {
    var box = el("#stage");
    if (!chart || !box || !W || !H) { return; }
    var face = getComputedStyle(box);
    var across = box.clientWidth - parseFloat(face.paddingLeft)
                                 - parseFloat(face.paddingRight) - 14;
    var down = box.clientHeight - parseFloat(face.paddingTop)
                                - parseFloat(face.paddingBottom) - 14;
    if (across <= 0) { return; }
    if (W * zoom <= across && H * zoom <= down) { return; }   // it already fits
    // Fit whichever way is the tight one, so the whole chart is there to see.
    // On a screen short enough that fitting the height would shrink it past
    // reading, fit the width instead and let it be scrolled -- a chart too
    // small to read is no better than one with its foot cut off.
    var byWidth = across / W;
    var whole = Math.min(byWidth, down > 0 ? down / H : byWidth);
    zoom = Math.max(0.1, Math.min(4, whole < 0.3 ? byWidth : whole));
    show();
  }

  function show() {
    if (!chart) { return; }
    chart.style.width = (W * zoom).toFixed(0) + "px";
    chart.removeAttribute("height");
    el("#pct").textContent = Math.round(zoom * 100) + "%";
    holdClamp();                         // a bigger chart has less room to roam
    showBands();                         // closer in, or further out
  }
  // A step that would carry the zoom past actual size stops there instead.
  // Every zoom set by something other than these two buttons -- Fit, or a
  // chart shrunk on opening to the room it had -- leaves it on a number the
  // steps then never meet: from 77% they go 96%, 120%, 150%, and 100%, the
  // one place anybody is trying to get back to, is stepped straight over
  // every time.  So the step that crosses it lands on it, and the next one
  // carries on from there.
  function zoomLands(want) {
    var to = Math.min(8, Math.max(0.1, want));
    var already = Math.abs(zoom - 1) < 0.001;        // standing on it already
    if (!already && (zoom < 1) !== (to < 1)) { to = 1; }
    return to;
  }

  function step(by) {
    glideStop();
    zoom = zoomLands(zoom * by);
    show();
  }
  // Zooming about a point rather than about the middle: whatever is under
  // that spot on the screen is still under it afterwards.  That is what the
  // wheel wants -- you point at the bit you mean and lean in on it -- and
  // the middle would send it sliding off instead.
  //
  // Measured off the page, not worked out from the numbers, for the same
  // reason the camera below is: the chart may be held or loose, scrolled or
  // carried, and the two keep their position in different places.  Where it
  // is now is one question with one answer; putting it back takes a scroll
  // or a carry, and that is the only line that has to know which.
  function zoomAt(x, y, want) {
    var stage = el("#stage");
    if (!chart || !stage || !zoom) { return; }
    var r = chart.getBoundingClientRect();
    if (!r.width) { return; }
    var onX = (x - r.left) / zoom;       // the spot, in the chart's own numbers
    var onY = (y - r.top) / zoom;
    // A button pressed a moment ago leaves the width gliding to where it
    // was told to go.  Measuring against a width that is still on its way
    // would put the spot back wrong, and a wheel wants the size it asked
    // for at once in any case, so the glide comes off first.
    var paper = el("#sheet");
    if (paper) { paper.classList.remove("gliding"); }
    zoom = want;
    show();
    r = chart.getBoundingClientRect();   // it has only just changed size
    var dx = (r.left + onX * zoom) - x;
    var dy = (r.top + onY * zoom) - y;
    if (loose) { holdBy(-dx, -dy); }
    else { stage.scrollLeft += dx; stage.scrollTop += dy; }
  }

  el("#in").onclick = function () { step(1.25); };
  el("#out").onclick = function () { step(1 / 1.25); };
  el("#actual").onclick = function () { glideStop(); zoom = 1; show(); };
  el("#fit").onclick = function () {
    var box = el("#stage"), face = getComputedStyle(box);
    glideStop();
    var room = box.clientWidth - parseFloat(face.paddingLeft)
                               - parseFloat(face.paddingRight) - 14;
    zoom = Math.max(0.1, Math.min(4, room / W));
    show();
  };

  // ---------------------------------------------------------- the camera --
  // Following the program as it runs.  The view is carried to whatever shape
  // is being done and stood at a distance that suits it, so that watching a
  // program step is watching one thing at a time rather than hunting for the
  // glowing shape somewhere in a chart eight feet long.
  //
  // Everything here is done by measuring the page rather than by arithmetic
  // on the numbers that put it there.  The chart can be scrolled, dragged,
  // zoomed, redrawn or switched between held and loose by half a dozen other
  // things in this file, and each of those keeps its position somewhere
  // different; a camera that remembered its own would be wrong after any of
  // them.  Measured, there is only one thing to be right about.
  var glide = null;                      // the move in progress, if any

  // Where the middle of the stage is, in the chart's own numbers.
  function viewNow() {
    var stage = el("#stage");
    if (!chart || !stage || !zoom) { return null; }
    var r = chart.getBoundingClientRect(), s = stage.getBoundingClientRect();
    if (!r.width) { return null; }
    return { zoom: zoom,
             x: (s.left + stage.clientWidth / 2 - r.left) / zoom,
             y: (s.top + stage.clientHeight / 2 - r.top) / zoom };
  }

  // Put a point of the chart in the middle of the stage, at once.  Held,
  // that is the stage scrolling; loose, it is the chart being carried.  The
  // measurement is the same either way, which is the whole reason for doing
  // it this way round.
  function centerOn(x, y) {
    var stage = el("#stage");
    if (!chart || !stage) { return; }
    var r = chart.getBoundingClientRect(), s = stage.getBoundingClientRect();
    var dx = (r.left + x * zoom) - (s.left + stage.clientWidth / 2);
    var dy = (r.top + y * zoom) - (s.top + stage.clientHeight / 2);
    if (loose) { holdBy(-dx, -dy); }
    else { stage.scrollLeft += dx; stage.scrollTop += dy; }
    showBands();                         // before anything looks at it
  }

  // Where the flow begins, put where it can be seen.  The stage keeps
  // whatever it was scrolled to from one drawing to the next, which is
  // right while you are looking about a chart and wrong the moment a new
  // one arrives: a chart of a few hundred shapes is several screens tall,
  // and a build could leave you looking at the middle of it with no way of
  // telling whether the Start was above you or below.
  //
  // Not centered.  A Start in the middle of the stage has half a screen of
  // bare paper over it and the flow leaving at the bottom edge; set a
  // little above the middle, the shape you are looking for is there and so
  // is what happens after it.
  function showTheStart() {
    var stage = el("#stage");
    if (!chart || !stage) { return; }
    var first = el('.node[data-kind="oval"]', chart) || el(".node", chart);
    if (!first || !first.getBBox) { return; }
    inView(first);
    var box;
    try { box = first.getBBox(); } catch (e) { return; }
    var down = stage.clientHeight * 0.35 / Math.max(zoom, 0.01);
    centerOn(box.x + box.width / 2, box.y + box.height / 2 + down);
  }

  function glideStop() {
    if (!glide) { return; }
    cancelAnimationFrame(glide.frame);
    clearTimeout(glide.last);
    glide = null;
  }

  // The move itself.  How close it stands and where it stands travel over
  // the same short moment, which is what makes it read as a camera rather
  // than as two things happening near each other.  Each frame sets the zoom
  // first and centers afterwards, because centering is measured off a chart
  // whose size has only just changed.
  function glideTo(x, y, want, ms) {
    var from = viewNow();
    if (!from) { return; }
    glideStop();
    want = Math.max(0.1, Math.min(8, want || from.zoom));
    if (STILL || !ms || heavy) {         // told to keep still, or too big to
      zoom = want; show(); centerOn(x, y);   //   move smoothly: simply be there
      return;
    }
    var mine = { frame: 0, last: 0 }, began = 0;
    glide = mine;
    function move(now) {
      if (glide !== mine) { return; }    // something else took the wheel
      if (!began) { began = now; }
      var t = Math.min(1, (now - began) / ms);
      var e = 1 - Math.pow(1 - t, 3);    // off quickly, settling at the end
      zoom = from.zoom + (want - from.zoom) * e;
      show();
      centerOn(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
      if (t < 1) { mine.frame = requestAnimationFrame(move); }
      else { glideStop(); }
    }
    mine.frame = requestAnimationFrame(move);
    // Frames are only drawn for a window somebody can see.  Left behind
    // another one -- or on a tab in the background, which a slow run is a
    // fine reason to leave a page on -- the clock above never ticks at all,
    // and the camera would stop wherever it had got to and stay there for
    // the rest of the program.  So the end of the move is waited for on an
    // ordinary timer as well, and whichever arrives first finishes it.
    mine.last = setTimeout(function () {
      if (glide !== mine) { return; }
      glideStop();
      zoom = want;
      show();
      centerOn(x, y);
    }, ms + 60);
  }

  // How close to stand to one shape.  A fixed zoom would be wrong both ways:
  // a Start oval is a few dozen units across and wants going right in on,
  // while a Process carrying six lines of declarations is wider than some
  // whole charts and would end up with its sides off the screen.  So the
  // shape is given a share of the stage and the distance follows from that
  // -- which is what does the zooming in and out as the program moves
  // between its big steps and its small ones.
  //
  // The share is well under half on purpose.  Filling the stage with the one
  // shape would say what is being done and nothing about where it sits, and
  // where it sits -- what led into it, what waits under it -- is most of
  // what there is to learn from watching a chart run.
  var SHARE_X = 0.40, SHARE_Y = 0.32;    // of the stage, across and down
  var CLOSEST = 2.4, FURTHEST = 0.35;

  function followNode(node) {
    var stage = el("#stage"), box = null;
    if (!stage || !node || !node.getBBox) { return; }
    inView(node);
    try { box = node.getBBox(); } catch (e) { return; }
    if (!box || !box.width || !box.height) { return; }
    var across = stage.clientWidth - 52, down = stage.clientHeight - 52;
    if (across < 40 || down < 40) { return; }
    var want = Math.min(across * SHARE_X / box.width,
                        down * SHARE_Y / box.height);
    glideTo(box.x + box.width / 2, box.y + box.height / 2,
            Math.max(FURTHEST, Math.min(CLOSEST, want)), 240);
  }

  // Where it was before the program took the wheel, so it can be given back
  // afterwards.  A run that ends leaving the chart somewhere in the middle
  // of itself at some zoom nobody chose is a run that has to be tidied up
  // after by hand, every time.
  var wasView = null;
  function keepView() { wasView = viewNow(); }
  function backToView() {
    var was = wasView;
    wasView = null;
    if (was) { glideTo(was.x, was.y, was.zoom, 300); }
  }

  // ------------------------------------- held in place, or loose upon it --
  // Two ways to have the chart, and a padlock to say which.
  //
  // Locked -- the way it has always been -- the chart sits in the stage and
  // scrolls inside it.  It cannot be put anywhere the stage is not, which is
  // exactly right for reading one: there is no way to lose it, and the bars
  // always say where in it you are.
  //
  // Loose, it is picked up and set down wherever it is dragged: shoved off
  // to one side to read what was under it, or carried out past the edge to
  // leave room in front of it.  Nothing scrolls then -- the chart is simply
  // moved, by a translation on the block that holds it -- so the stage's
  // bars are put away for as long as it lasts.
  //
  // The one rule is that it cannot be lost.  A chart dragged clean off the
  // stage would be gone for good: nothing left on screen to take hold of,
  // and no bar to bring it back with.  So every move is clamped to leave a
  // strip of it showing, and that strip is always enough to grab and drag
  // back with.
  var loose = false, holdX = 0, holdY = 0;
  var KEEP = 72;                         // how much has to stay in sight

  function holdApply() {
    var wrap = el("#stage .wrap");
    if (!wrap) { return; }
    wrap.style.setProperty("--hold-x", holdX.toFixed(1) + "px");
    wrap.style.setProperty("--hold-y", holdY.toFixed(1) + "px");
    showBands();                         // carried, not scrolled: no event says so
  }

  // Where the offset is allowed to be, given how big the chart is right now
  // and how much room the stage has.  Zooming in, drawing it again, turning
  // the phone on its side -- any of those can leave a position that was
  // legal no longer so, which is why this is asked again afterwards and not
  // only while something is being dragged.
  function holdRoom() {
    var stage = el("#stage"), paper = el("#sheet");
    if (!stage || !paper) { return null; }
    var edge = stage.getBoundingClientRect();
    var box = paper.getBoundingClientRect();
    var left = box.left - holdX;         // where it would sit at no offset
    var top = box.top - holdY;
    // A chart smaller than the strip cannot spare the whole strip, so what
    // it has to keep in sight is however much of it there is.
    var keepX = Math.min(KEEP, box.width), keepY = Math.min(KEEP, box.height);
    return {
      x: [edge.left + keepX - left - box.width, edge.right - keepX - left],
      y: [edge.top + keepY - top - box.height, edge.bottom - keepY - top]
    };
  }

  // The numbers go on the page before anything is measured off it.  Left
  // the other way round, what came back was the chart's old position paired
  // with its new offset, and the difference between the two -- a whole
  // drag's worth -- came off the room it was allowed: one good shove and
  // the chart went clean over the edge the strip was there to stop.
  function holdClamp() {
    if (!loose) { return; }
    holdApply();
    var room = holdRoom();
    if (!room) { return; }
    var x = Math.max(room.x[0], Math.min(room.x[1], holdX));
    var y = Math.max(room.y[0], Math.min(room.y[1], holdY));
    if (x === holdX && y === holdY) { return; }
    holdX = x;
    holdY = y;
    holdApply();
  }

  function holdBy(dx, dy) {
    holdX += dx;
    holdY += dy;
    holdClamp();
  }

  // Keeping the view still while the paper changes size under it.  Drawn
  // by hand, the paper grows to take whatever is put near its edge -- on
  // either side -- and what is on it would move with it: more paper on the
  // left pushes everything right, and a paper narrower than the stage sits
  // in the middle of it, so it moves by half of whatever it grows by, on
  // whichever side.  `dx` is how far the drawing has just moved across the
  // screen; this moves it back.  Loose, the chart is carried back; held,
  // the stage is scrolled back, as far as it can be.
  //
  // What scrolling cannot take -- all of it, while the paper is narrower
  // than the stage and has no scrolling to do -- the paper is pushed back
  // for instead, for as long as a shape is being carried, so the one being
  // carried stays under the mouse and nothing else moves at all.  Let go,
  // and it settles back into the middle of the stage.
  var shapeCarried = false;               // a shape is being dragged about
  var drift = 0;                         // how far the paper is pushed across

  function keepStill(dx) {
    var stage = el("#stage"), paper = el("#sheet");
    if (!stage || !paper || !(Math.abs(dx) >= 0.05)) { return; }
    if (loose) { holdBy(-dx, 0); return; }
    // Still settling back from the last time?  Then from where it has got to.
    if (paper.style.transition.indexOf("transform") >= 0) {
      var now = /matrix\(([^)]+)\)/.exec(getComputedStyle(paper).transform);
      drift = now ? parseFloat(now[1].split(",")[4]) || 0 : 0;
    }
    var was = stage.scrollLeft;
    stage.scrollLeft = was + dx - drift;   // and what was pushed, if it can
    drift += stage.scrollLeft - was - dx;
    if (Math.abs(drift) < 0.5) { drift = 0; }
    paper.style.transition = "";
    paper.style.transform = drift ? "translateX(" + drift.toFixed(1) + "px)" : "";
    if (!shapeCarried) { letGo(); }
  }

  function letGo() {
    var stage = el("#stage"), paper = el("#sheet");
    if (!paper || !drift) { drift = 0; return; }
    var was = stage ? stage.scrollLeft : 0;
    if (stage) { stage.scrollLeft = was - drift; }
    var rest = drift + (stage ? stage.scrollLeft - was : 0);
    drift = 0;
    paper.style.transition = "none";
    paper.style.transform = "";
    if (Math.abs(rest) < 0.5 || STILL) { paper.style.transition = ""; return; }
    paper.style.transform = "translateX(" + rest.toFixed(1) + "px)";
    void paper.offsetWidth;              // from there, not from nothing
    paper.style.transition = "transform .3s var(--ease)";
    paper.style.transform = "";
    var mine = letGo.last = (letGo.last || 0) + 1;
    setTimeout(function () {             // and the paper's own transitions back
      if (mine === letGo.last && !drift) { paper.style.transition = ""; }
    }, 340);
  }

  // Switching either way leaves the chart looking exactly where it was.
  // Unlocking hands the scroll over to the offset; locking hands it back,
  // as far as the stage can take it -- which is what makes the padlock a
  // padlock rather than a button that jumps the chart about.
  function setLoose(want) {
    var stage = el("#stage");
    loose = !!want;
    if (loose) {
      holdX = stage ? -stage.scrollLeft : 0;
      holdY = stage ? -stage.scrollTop : 0;
      document.body.classList.add("chart-loose");
      if (stage) { stage.scrollLeft = stage.scrollTop = 0; }
      holdClamp();
    } else {
      var wasX = holdX, wasY = holdY;
      holdX = holdY = 0;
      holdApply();
      document.body.classList.remove("chart-loose");
      if (stage) { stage.scrollLeft = -wasX; stage.scrollTop = -wasY; }
    }
    el("#hold-lock").classList.toggle("on", !loose);
    el("#hold-loose").classList.toggle("on", loose);
    try { localStorage.setItem("flowchart-hold", loose ? "loose" : "locked"); }
    catch (e) { /* storage turned off: it just starts locked next time */ }
  }

  el("#hold-lock").onclick = function () { setLoose(false); };
  el("#hold-loose").onclick = function () { setLoose(true); };

  // Carrying the chart about while it is loose.  Pointer events rather than
  // mouse ones, so a finger works too: loose, the stage does no scrolling of
  // its own, so a touch has nothing else left to drag.
  (function () {
    var stage = el("#stage");
    if (!stage) { return; }
    stage.addEventListener("pointerdown", function (ev) {
      if (!loose || ev.button) { return; }
      // A shape being moved is not the chart being moved.
      if (ev.target.closest &&
          ev.target.closest(".node, .knob, .spot, .grip")) { return; }
      var fromX = ev.clientX, fromY = ev.clientY;
      var wasX = holdX, wasY = holdY;
      glideStop();                       // a hand on it beats a camera
      try { stage.setPointerCapture(ev.pointerId); } catch (e) { /* mouse: fine */ }
      stage.classList.add("grabbing");
      function move(e) {
        holdX = wasX + (e.clientX - fromX);
        holdY = wasY + (e.clientY - fromY);
        holdClamp();
      }
      function drop() {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", drop);
        stage.classList.remove("grabbing");
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", drop);
    });
    // The wheel, which does one of two things over the chart.
    //
    // Held down with Ctrl it zooms, in on the spot it is pointing at -- the
    // way a wheel zooms anything you can zoom, and the way a trackpad's
    // pinch arrives here too, since a browser sends that as a Ctrl wheel.
    // The page's own Ctrl-zoom is turned away for the chart alone; anywhere
    // else on the page it still works as it always did.
    //
    // On its own it scrolls -- except that loose there is no scrolling left
    // to do, so it carries the chart instead, or the mode would feel broken.
    // A wheel that counts in lines or pages rather than pixels is asking
    // for about this much of each.
    var CLICK = 1.0015;                  // what a notch of wheel is worth
    stage.addEventListener("wheel", function (ev) {
      var by = ev.deltaMode === 1 ? 16 : (ev.deltaMode === 2 ? 320 : 1);
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault();
        glideStop();
        var want = zoomLands(zoom * Math.pow(CLICK, -ev.deltaY * by));
        if (want !== zoom) { zoomAt(ev.clientX, ev.clientY, want); }
        return;
      }
      if (!loose) { return; }
      ev.preventDefault();
      glideStop();
      holdBy(-ev.deltaX * by, -ev.deltaY * by);
    }, { passive: false });
  })();
