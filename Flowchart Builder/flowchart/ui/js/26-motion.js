// ---------------------------------------------------------------------------
//  26-motion.js -- the few moves the stylesheet cannot make on its own
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // Almost all of the movement on this page is in 07-motion.css, where it
  // belongs: the stylesheet can see a button being pressed or a sheet being
  // shown and needs no help to answer it.  What is left over is the handful
  // of things it cannot see -- that a panel is on its way out rather than
  // simply gone, that this drawing is a new one rather than the same one
  // redrawn, that the chosen side of a switch has moved from the second to
  // the third.  Each of those is a word for the stylesheet to work from, put
  // on here and taken off again.
  //
  // Everything in this part is wrapped around something another part already
  // does, in the same way 19-settings.js wraps dress(): the original still
  // does the work, and this only says how it should look while it happens.
  // Nothing here is required for anything to function -- switch it all off
  // and the page still builds, colors, saves and runs.
  var STILL = false;                     // told to keep still by the system
  try { STILL = matchMedia("(prefers-reduced-motion: reduce)").matches; }
  catch (e) { STILL = false; }

  // A word on something for as long as the move it names takes, and then off
  // again, so the same move can be made to happen twice in a row.  Asking for
  // the width back in the middle is what makes the browser start the run over
  // rather than carry on with the one already going.
  function briefly(node, name, ms) {
    if (!node || STILL) { return; }
    node.classList.remove(name);
    void node.offsetWidth;
    node.classList.add(name);
    clearTimeout(node.motionTimer);
    node.motionTimer = setTimeout(function () {
      node.classList.remove(name);
    }, ms);
  }

  // ---------------------------------------------- the block that slides --
  // The chosen side of a two- or three-way switch is drawn by one block
  // sitting behind all of them, and the stylesheet slides it from where it
  // was to where it is now.  All it needs told is how many there are and
  // which one is on; everything toggles that class already, so rather than
  // ask each place that does to say so, the switch watches itself.
  function segSlide(seg) {
    var buttons = all(".seg-btn", seg), at = -1;
    buttons.forEach(function (b, i) {
      if (b.classList.contains("on")) { at = i; }
    });
    seg.style.setProperty("--seg-n", buttons.length || 1);
    if (at < 0) { seg.setAttribute("data-seg-off", ""); return; }
    seg.removeAttribute("data-seg-off");
    seg.style.setProperty("--seg-i", at);
    segAt[segKey(seg)] = at;
  }

  // Some switches are not there when the page starts.  The typeface and
  // how heavy a line is are built by the script, and built again every
  // time one of their buttons is pressed -- so the watching done at the
  // start never saw them, and their block sat under the first button
  // whichever was on, at half the width it should have been, while the
  // stylesheet took the lit button's own highlight off in favour of a
  // block that was somewhere else.  So every switch is tended the moment
  // it turns up, not only the ones that were there to begin with.
  //
  // One made again because one of its own buttons was just pressed still
  // slides: it starts where the one it replaced had got to, and is then
  // told where it is now.  Made again for any other reason -- another
  // shape picked, say -- it simply is where it is, because the block
  // coming from the last shape's answer would be saying something false.
  var segAt = {};                        // where each switch's block last was
  var segPressed = null;                 // which switch was pressed, and when
  function segKey(seg) {
    if (seg.id) { return "#" + seg.id; }
    var first = el(".seg-btn", seg);
    var tool = first && first.dataset.tool
             ? first.dataset.tool.replace(/-[^-]*$/, "") : "";
    return seg.className + "|" + tool;
  }

  function tendSeg(seg) {
    if (seg.segTended) { return; }
    seg.segTended = true;
    var key = segKey(seg), was = segAt[key];
    if (!STILL && was !== undefined && segPressed && segPressed.key === key &&
        Date.now() - segPressed.at < 1500) {
      seg.style.setProperty("--seg-n", all(".seg-btn", seg).length || 1);
      seg.style.setProperty("--seg-i", was);
      void seg.offsetWidth;              // standing where the old one was
    }
    segSlide(seg);
    if (!window.MutationObserver) { return; }
    new MutationObserver(function () { segSlide(seg); })
      .observe(seg, { subtree: true, attributes: true,
                      attributeFilter: ["class"] });
  }

  function tendSegs() {
    all(".seg").forEach(tendSeg);
    document.addEventListener("click", function (ev) {
      var seg = ev.target.closest ? ev.target.closest(".seg") : null;
      segPressed = seg ? { key: segKey(seg), at: Date.now() } : null;
    }, true);
    if (!window.MutationObserver) { return; }
    // Only what is written into the page as HTML can hold a switch: a
    // drawing is poured in whole on every frame of a drag, and is passed
    // over without being looked inside.
    new MutationObserver(function (changes) {
      changes.forEach(function (change) {
        Array.prototype.forEach.call(change.addedNodes, function (bit) {
          if (bit.nodeType !== 1 || bit.namespaceURI !== document.body.namespaceURI) {
            return;
          }
          if (bit.classList.contains("seg")) { tendSeg(bit); }
          if (bit.firstElementChild) { all(".seg", bit).forEach(tendSeg); }
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ------------------------------------------------- a card folding shut --
  // A height can only be animated from something to something, and "all of
  // it" is not a number the stylesheet knows.  A grid of one row is: it can
  // go from one part of the space to none of it.  So what is in a card that
  // folds is put inside two plain boxes -- the row, and a box inside it that
  // does the hiding -- and the stylesheet does the rest.  Nothing is moved
  // out of the card, so everything that looks things up by name still finds
  // them exactly where they were.
  function wrapFolds() {
    all("section.fold").forEach(function (card) {
      if (el(".fold-body", card)) { return; }
      var head = el("h2", card);
      if (!head) { return; }
      var body = document.createElement("div");
      var inner = document.createElement("div");
      body.className = "fold-body";
      inner.className = "fold-inner";
      body.appendChild(inner);
      Array.prototype.slice.call(card.childNodes).forEach(function (bit) {
        if (bit !== head) { inner.appendChild(bit); }
      });
      card.appendChild(body);
      settleFold(card);
      if (!window.MutationObserver) { return; }
      new MutationObserver(function () { settleFold(card); })
        .observe(card, { attributes: true, attributeFilter: ["class"] });
    });
  }

  // The box that does the hiding cuts off whatever reaches past its edges,
  // which is the whole of its job while the card is folding and while it
  // is shut.  Left doing it once the card was open, it cut into everything
  // along its edges that moves under the mouse: the top row of palettes
  // lost its top edge, its shadow and the ring round the one that is on,
  // the moment it rose.  So it lets go once a card has finished opening,
  // and takes hold again the moment the card begins to shut -- before a
  // single frame of the folding is drawn, so the folding is as it was.
  function settleFold(card) {
    var wait = card.foldSeen ? 300 : 0;  // at the start, nothing is opening
    card.foldSeen = true;
    clearTimeout(card.settleTimer);
    if (card.classList.contains("shut")) {
      card.classList.remove("fold-open");
      return;
    }
    if (card.classList.contains("fold-open")) { return; }
    card.settleTimer = setTimeout(function () {
      if (!card.classList.contains("shut")) { card.classList.add("fold-open"); }
    }, wait);
  }

  // ------------------------------------------------------ the two sheets --
  // Shutting one is the awkward case: the plain one hides it the instant it
  // is asked to, and a hidden thing cannot be watched leaving.  So it is
  // left where it is for as long as the going takes and hidden at the end
  // of it -- and because the going is two states rather than a run of
  // keyframes, a sheet asked back halfway out comes back from where it got
  // to, which is all this has to do about it.
  //
  // One sheet replacing the other is not worth watching: they land in the
  // same corner, so the one going would only smear through the one coming.
  // It goes at once, and only the last one open is seen to leave.
  var showSheetPlain = showSheet;
  showSheet = function (which, want) {
    if (STILL) { return showSheetPlain(which, want); }
    SHEETS.forEach(function (pair) {
      var sheet = el(pair[1]), button = el(pair[0]);
      var on = want && pair[1] === which;
      if (button) { button.setAttribute("aria-expanded", on ? "true" : "false"); }
      if (!sheet) { return; }
      clearTimeout(sheet.goingTimer);
      if (on) {
        if (sheet.hidden) {
          sheet.hidden = false;
          aimSheet(button, sheet);     // laid out first, or there is
          void sheet.offsetWidth;      //   nothing for it to move from
        }
        sheet.classList.add("here");
      } else if (!sheet.hidden) {
        sheet.classList.remove("here");
        if (want) { sheet.hidden = true; }
        else {
          sheet.goingTimer = setTimeout(function () { sheet.hidden = true; }, 300);
        }
      }
    });
  };

  // A sheet grows out of the middle of the button that opened it.  Which
  // point that is cannot be written into the styling: it moves with the
  // width of the word on the button, and "Download" and "Herunterladen" are
  // not the same width.  So it is measured, once, as the sheet opens.
  //
  // Measured standing still, at that.  At this moment the sheet is sitting
  // shrunk and shifted, waiting to arrive, and a shrunk box does not have
  // its edges where the laid-out one does -- measure it as it stands and
  // the point comes out by however much the shrinking moved the edge, which
  // is a tenth of an inch of aiming at the wrong button.
  function aimSheet(button, sheet) {
    if (!button) { return; }
    sheet.style.transition = "none";
    sheet.style.transform = "none";
    var b = button.getBoundingClientRect(), s = sheet.getBoundingClientRect();
    sheet.style.transform = "";
    if (b.width && s.width) {
      var x = Math.round(b.left + b.width / 2 - s.left);
      sheet.style.transformOrigin =
        Math.max(0, Math.min(x, Math.round(s.width))) + "px top";
    }
    void sheet.offsetWidth;              // the state it starts from, settled
    sheet.style.transition = "";
  }

  // ------------------------------------------------------ the panel going --
  // The panel closes to nothing rather than disappearing, and what is inside
  // it has to keep its width while it narrows -- otherwise every word in it
  // re-wraps on the way out, which looks like the panel coming apart rather
  // than closing.  How wide it is depends on the screen and is decided in the
  // stylesheets; rather than repeat any of that here, the width it actually
  // has is measured as it starts to close, and given back once it is open
  // again so that resizing the window still moves it.
  var widthTimer = null;
  var showPanelPlain = showPanel;
  showPanel = function (open) {
    var panel = el("#panel");
    if (panel && !STILL) {
      clearTimeout(widthTimer);
      // Only worth noting on the way out of being open.  Asked to shut what
      // is already shut -- which happens, on a narrow screen, every time a
      // chart is drawn -- the width to note would be none, and the panel
      // would open again on nothing.
      // What is measured is the box that scrolls inside it rather than the
      // panel itself: the panel keeps a strip of its width for its slider
      // bar, and giving that width back to the words would re-wrap every
      // one of them at the moment the panel started to close.
      var inner = el(".slide-in", panel) || panel;
      if (!open && !panel.classList.contains("hide") && inner.clientWidth > 0) {
        panel.style.setProperty("--panel-w", inner.clientWidth + "px");
      } else if (open) {
        widthTimer = setTimeout(function () {
          panel.style.removeProperty("--panel-w");
        }, 320);
      }
    }
    showPanelPlain(open);
  };

  // ------------------------------------------- the menu on the right button --
  // The rows come in one after another, a sixtieth of a second apart, which
  // is enough to read as a list arriving rather than a block appearing.  The
  // menu is told to grow only after the plain one has measured it and put it
  // where it goes: measuring something mid-move measures the move.
  var openMenuPlain = openMenu;
  openMenu = function (x, y, items) {
    openMenuPlain(x, y, items);
    var here = all(".menu:not(.out)");
    var menu = here[here.length - 1];
    if (!menu) { return; }
    all("button", menu).forEach(function (row, i) {
      row.style.setProperty("--i", i);
    });
    void menu.offsetWidth;
    menu.classList.add("in");
  };

  var closeMenuPlain = closeMenu;
  closeMenu = function () {
    if (STILL) { return closeMenuPlain(); }
    all(".menu:not(.out)").forEach(function (menu) {
      menu.classList.remove("in");
      menu.classList.add("out");
      setTimeout(function () { menu.remove(); }, 140);
    });
    // The menu is on its way out rather than gone, but whatever opened it
    // has let go of it now: waiting the fade out before saying so would
    // leave the button looking pressed for a seventh of a second after it
    // had stopped being.
    letGoOfMenus();
  };

  // ------------------------------------------ the pseudocode, full screen --
  // Going out is the same trick as the sheets: the overlay is left where it
  // is until the falling is done, and only then handed to the plain one,
  // which is what hides it and carries the box back to the panel.
  var codeGoing = false;
  var codeFullPlain = codeFull;
  codeFull = function (want) {
    var over = el("#code-over");
    if (STILL || !over) { return codeFullPlain(want); }
    if (want) {
      clearTimeout(over.goingTimer);
      over.classList.remove("going");
      codeGoing = false;
      return codeFullPlain(true);
    }
    if (over.hidden || codeGoing) { return; }
    codeGoing = true;
    over.classList.add("going");
    over.goingTimer = setTimeout(function () {
      over.classList.remove("going");
      codeGoing = false;
      codeFullPlain(false);
    }, 190);
  };

  // ------------------------------------- the run and the code, full screen --
  // The same again for the runner's screen, which comes and goes the same
  // way and for the same reason.
  var tapeGoing = false;
  var tapeFullPlain = tapeFull;
  tapeFull = function (want) {
    var over = el("#tape-over");
    if (STILL || !over) { return tapeFullPlain(want); }
    if (want) {
      clearTimeout(over.goingTimer);
      over.classList.remove("going");
      tapeGoing = false;
      return tapeFullPlain(true);
    }
    if (over.hidden || tapeGoing) { return; }
    tapeGoing = true;
    over.classList.add("going");
    over.goingTimer = setTimeout(function () {
      over.classList.remove("going");
      tapeGoing = false;
      tapeFullPlain(false);
    }, 190);
  };

  // Inside that screen, the run and the code take turns in the same place,
  // so the one arriving comes up into it rather than simply being there --
  // and the buttons that change places in the bar with them do the same.
  var tapeShowPlain = tapeShow;
  tapeShow = function (what) {
    var out = el("#code-out");
    var was = out && !out.hidden ? "code" : "run";
    tapeShowPlain(what);
    if (!what || was === what) { return; }
    briefly(el(what === "code" ? "#code-out" : "#tape-slot"), "swap", 340);
    (what === "code" ? ["#tape-back", "#tape-lang"] : ["#tape-code"])
      .forEach(function (which) { briefly(el(which), "popped", 300); });
  };

  // ------------------------------------------- the other sheets, going --
  // The settings, the examples, the puzzles and the page for printing all
  // come up over the page the way the pseudocode does, and until now all
  // four simply vanished on the way out: a sheet that rose into view and
  // then blinked out of it, which is half an animation and reads as a
  // glitch.  They leave the way they came, by the same trick as above --
  // left where they are for as long as the going takes, and only then
  // handed to the plain one, which hides them and does whatever else
  // shutting means.  Asked back while still going, one simply comes back.
  function goingOver(which, plain) {
    return function (open) {
      var over = el(which), self = this, asked = arguments;
      if (STILL || !over) { return plain.apply(self, asked); }
      clearTimeout(over.goingTimer);
      if (open || over.hidden) {
        over.classList.remove("going");
        return plain.apply(self, asked);
      }
      if (over.classList.contains("going")) { return; }
      over.classList.add("going");
      over.goingTimer = setTimeout(function () {
        over.classList.remove("going");
        plain.apply(self, asked);
      }, 190);
    };
  }
  showMore = goingOver("#more-over", showMore);
  showExamples = goingOver("#eg-over", showExamples);
  showPuzzles = goingOver("#pz-over", showPuzzles);
  printFull = goingOver("#print-over", printFull);

  // The question asked before anything is thrown away goes the same way,
  // but what it was asked about is done at once rather than after the
  // going: the answer was given the moment the button was pressed, and
  // making it wait a fifth of a second on a fade would be the page
  // dawdling over something it has already been told.
  var sureShutPlain = sureShut;
  sureShut = function (andGo) {
    var over = el("#sure-over");
    if (STILL || !over || over.hidden) { return sureShutPlain(andGo); }
    if (over.classList.contains("going")) { return true; }
    var go = sureGo;
    sureGo = null;
    over.classList.add("going");
    over.goingTimer = setTimeout(function () {
      over.classList.remove("going");
      sureShutPlain(false);            // nothing left for it to go on with
    }, 170);
    if (andGo && go) { go(); }
    return true;
  };
  // and a question asked while the last one is still leaving stays
  var areYouSurePlain = areYouSure;
  areYouSure = function (head, said, yes, go) {
    var over = el("#sure-over");
    if (over) {
      clearTimeout(over.goingTimer);
      over.classList.remove("going");
    }
    return areYouSurePlain(head, said, yes, go);
  };

  // ------------------------------------------------------- the chart pane --
  // A new drawing rises out of the paper.  Only a new one: drawing by hand
  // redraws the same chart on every frame of a drag, and a chart that faded
  // in sixty times a second would be unreadable, so that way round is left
  // alone.
  var bindPlain = bind;
  var drawn = null;                      // the drawing the last rise was for
  var opening = false;                   // the build nobody asked for
  bind = function () {
    bindPlain();
    if (byHand) { return; }
    handSeen = null;                     // the paper is not a drawing by hand
    var paper = el("#sheet");
    var now = paper ? paper.innerHTML : "";
    // The studio draws the program it was opened with, without being asked.
    // That chart is already on the paper, served with the page, so letting
    // it rise in would take it away and bring it back -- the same blink,
    // one build later.  It is taken as arrived, and the next build, which
    // somebody did ask for, rises normally.
    if (opening) { opening = false; drawn = now; return; }
    // A chart rises into view when it is a new drawing.  The one the page
    // was served with is not: it is on the screen from the first paint, and
    // on the website that is seconds before this script runs, while Python
    // is still being fetched.  Making that one rise in took it away and
    // brought it back -- the one thing an entrance must not do, and exactly
    // what it looked like: everything appears, then the chart goes, then it
    // comes back.  So the flourish is kept for a drawing that is not the
    // one already on the paper -- which a built chart nearly always is,
    // since the styling is shaken afresh every time it is built.
    if (drawn !== null && now !== drawn) {
      briefly(paper, "fresh", Math.max(520, cascade(paper)));
    }
    drawn = now;
  };

  // A new chart puts itself together rather than arriving in one piece:
  // the shapes in the order the program reads, each line drawn out of the
  // shape it leaves, and its arrowhead landing as the line gets there.
  // Watching it assemble is watching the program's order laid out, which
  // is the thing the chart is for.
  //
  // It is quick -- the whole of it is under a second however long the
  // program -- and a chart past a few score shapes simply rises as one,
  // because a hundred and fifty things arriving one after another is not
  // an order anybody can follow, only a wait.
  //
  // Nothing is moved in the drawing itself.  Each part is told when its
  // turn comes, and the stylesheet does the rest while the paper is fresh;
  // when it is not, those words mean nothing.  Returns how long it takes.
  var CASCADE_MOST = 150;                // shapes, past which it rises as one
  function cascade(paper) {
    paper.classList.remove("cascade");
    var svg = el("svg", paper);
    var nodes = svg ? all(".node", svg) : [];
    if (STILL || !nodes.length || nodes.length > CASCADE_MOST) { return 0; }
    var step = Math.min(42, 480 / nodes.length);    // between two shapes
    var DRAW = 300;                                 // one line, drawn
    var last = 0;
    var boxes = nodes.map(function (g, i) {
      var b = g.getBBox(), t = Math.round(i * step);
      g.style.setProperty("--in", t + "ms");
      return { x: b.x, y: b.y, w: b.width, h: b.height, t: t };
    });
    // Whichever shape a point is on, or nearest to: a line goes when the
    // shape it leaves has arrived.
    function nearest(x, y) {
      var best = boxes[0], far = Infinity;
      boxes.forEach(function (b) {
        var dx = Math.max(b.x - x, 0, x - b.x - b.w);
        var dy = Math.max(b.y - y, 0, y - b.y - b.h);
        if (dx * dx + dy * dy < far) { far = dx * dx + dy * dy; best = b; }
      });
      return best.t;
    }
    var ends = [];
    all(".flow", svg).forEach(function (line) {
      var n = (line.getAttribute("d") || "").match(/-?\d*\.?\d+(?:e-?\d+)?/gi);
      if (!n || n.length < 4 || !line.getTotalLength) { return; }
      var t = Math.round(nearest(+n[0], +n[1]) + step * 0.6);
      // A little longer than the line itself, so the gap in the dash is
      // longer too and no rounded end peeps out at the far end of it.
      line.style.setProperty("--len", (line.getTotalLength() + 2).toFixed(1));
      line.style.setProperty("--in", t + "ms");
      ends.push({ x: +n[n.length - 2], y: +n[n.length - 1], t: t });
      last = Math.max(last, t + DRAW);
    });
    all(".head, .label, .patch", svg).forEach(function (bit) {
      var b = bit.getBBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      var t = nearest(cx, cy) + step;
      if (bit.classList.contains("head")) {
        // an arrowhead is where its line finishes, and lands as it does
        var mine = null, far = 400;       // no further off than 20
        ends.forEach(function (end) {
          var d = (end.x - cx) * (end.x - cx) + (end.y - cy) * (end.y - cy);
          if (d < far) { far = d; mine = end; }
        });
        if (mine) { t = mine.t + DRAW * 0.8; }
      }
      bit.style.setProperty("--in", Math.round(t) + "ms");
      last = Math.max(last, t + 200);
    });
    boxes.forEach(function (b) { last = Math.max(last, b.t + 420); });
    paper.classList.add("cascade");
    return Math.round(last) + 60;
  }

  // ---------------------------------------------- drawing it by hand --
  // By hand the whole drawing is poured in again on every change, so from
  // the page's point of view nothing is ever added or taken away: it is
  // all new, every time.  Which pieces really are new is worked out here,
  // by what the drawing before had in it: a shape just placed springs in,
  // a line just joined draws itself from the shape it leaves, and anything
  // just deleted shrinks away instead of vanishing -- which is also what
  // tells you, on a crowded page, which one it was.
  //
  // A drag redraws everything many times a second, and a piece that is
  // still arriving is drawn afresh with each frame.  So each one is told
  // how far through its arrival it already is -- a start in the past --
  // and carries on from there rather than starting again.
  var handSeen = null;                   // what the last drawing had in it
  var handBorn = {};                     // what has just arrived, and when
  var handGone = [];                     // what has just gone, while it goes
  var drawHandPlain = drawHand;
  drawHand = function () {
    var paper = el("#sheet");
    var old = paper ? el("svg", paper) : null;
    drawHandPlain();
    var svg = paper ? el("svg", paper) : null;
    if (STILL || !svg) { handSeen = null; return; }
    var now = Date.now(), here = {};
    all(".node[data-i], .link[data-link]", svg).forEach(function (g) {
      here[g.dataset.link ? "l" + g.dataset.link : "n" + g.dataset.i] = g;
    });
    if (handSeen) {
      Object.keys(here).forEach(function (key) {
        if (!handSeen[key]) { handBorn[key] = now; }
      });
      Object.keys(handSeen).forEach(function (key) {
        var ghost = !here[key] && old && ghostOf(old, key);
        if (ghost) {
          handGone.push({ el: ghost, at: now });
          setTimeout(function () { ghost.remove(); }, 260);
        }
      });
    }
    handSeen = {};
    Object.keys(here).forEach(function (key) { handSeen[key] = true; });

    Object.keys(handBorn).forEach(function (key) {
      var age = now - handBorn[key], g = here[key];
      if (age > 440 || !g) { delete handBorn[key]; return; }
      var line = key.charAt(0) === "l" ? el(".flow", g) : null;
      // A dashed line cannot be drawn out along its dashes -- drawing is
      // done with a dash of its own -- so it fades in instead.
      var how = line && line.getAttribute("stroke-dasharray") ? "born-soft" : "born";
      g.classList.add(how);
      g.style.setProperty("--born", -age + "ms");
      var head = line ? headOf(svg, line) : null;
      if (line && how === "born" && line.getTotalLength) {
        line.style.setProperty("--len", (line.getTotalLength() + 2).toFixed(1));
      }
      if (head) {
        head.classList.add("born");
        head.style.setProperty("--born", -age + "ms");
      }
      setTimeout(function () {
        g.classList.remove(how);
        if (head) { head.classList.remove("born"); }
      }, 440 - age);
    });

    // What is going is put back into each new drawing until it has gone,
    // on top of everything else and in the same ink.
    var layer = el("g", svg);
    handGone = handGone.filter(function (gone) {
      var age = now - gone.at;
      if (age > 240 || !layer) { return false; }
      gone.el.style.setProperty("--born", -age + "ms");
      layer.appendChild(gone.el);
      return true;
    });
  };

  // A copy of something from the drawing before, to be seen going.  It is
  // no longer a shape or a line as far as anything else on the page is
  // concerned -- nothing counts it, saves it or can click it -- only a
  // picture of one on its way out.
  function ghostOf(old, key) {
    var id = key.slice(1), NS = "http://www.w3.org/2000/svg";
    if (key.charAt(0) === "n") {
      var shape = el('.node[data-i="' + id + '"]', old);
      if (!shape) { return null; }
      var copy = shape.cloneNode(true);
      copy.setAttribute("class", "node-gone");
      copy.removeAttribute("data-i");
      return copy;
    }
    var link = el('.link[data-link="' + id + '"]', old);
    var line = link && el(".flow", link);
    if (!line) { return null; }
    var pair = document.createElementNS(NS, "g");
    pair.setAttribute("class", "link-gone");
    pair.appendChild(line.cloneNode(true));
    var head = headOf(old, line);
    if (head) { pair.appendChild(head.cloneNode(true)); }
    return pair;
  }

  // The arrowheads are drawn apart from their lines, all together, so that
  // nothing paints over one.  Each starts at the very point its line ends
  // on, written the same way, which is how one is found from the other.
  function headOf(svg, line) {
    var d = line.getAttribute("d") || "";
    var end = d.split(/[ML]/).pop().trim();
    if (!end) { return null; }
    return all(".tips .head", svg).filter(function (head) {
      return (head.getAttribute("points") || "").indexOf(end + " ") === 0;
    })[0] || null;
  }

  // Zoom glides when a button asked for it.  Not when a drag did: the chart
  // is resized on every frame of one of those, and a width that took a third
  // of a second to arrive would always be a third of a second behind.
  var glideTimer = null;
  function glideZoom() {
    var paper = el("#sheet");
    if (!paper || STILL) { return; }
    paper.classList.add("gliding");
    clearTimeout(glideTimer);
    glideTimer = setTimeout(function () {
      paper.classList.remove("gliding");
    }, 420);
  }

  ["#in", "#out", "#fit", "#actual"].forEach(function (which) {
    var button = el(which);
    if (!button || !button.onclick) { return; }
    var was = button.onclick;
    button.onclick = function (ev) { glideZoom(); return was.call(this, ev); };
  });

  // ------------------------------------------------- and the small things --
  // What is selected, when it becomes something else rather than nothing.
  var selectPlain = select;
  select = function (g) {
    var was = sel;
    selectPlain(g);
    if (sel && sel !== was) { briefly(el("#sel-card"), "swap", 340); }
  };

  // Light to dark.  Every color on the page fades rather than snaps, but
  // only for as long as the change takes: a page that transitions every
  // color all the time is a page that lags behind the mouse.
  // The word has to go on before the colors change, not after: a color
  // only fades if the page was already told to fade colors when it was
  // given the new one.  Which colors they will be is known either way --
  // wearing() answers from the setting, which has already been changed by
  // the time this is asked to put it on.
  var themeWorn = null;
  var wearThemePlain = wearTheme;
  wearTheme = function () {
    var now = wearing();
    if (themeWorn !== null && themeWorn !== now) {
      briefly(document.documentElement, "theming", 400);
    }
    themeWorn = now;
    wearThemePlain();
  };

  // The two sides of the panel, as one gives way to the other.  The side
  // arriving comes in from the side its tab is on, so the pair reads as
  // two pages next to each other rather than one page being swapped for
  // another.  Only when a tab was pressed: the page opening on the side it
  // was left on last time is not a change, and the panel is arriving then
  // anyway.
  ["#side-chart", "#side-colors", "#rail-chart", "#rail-colors"].forEach(function (which) {
    var button = el(which);
    if (!button || !button.onclick) { return; }
    var was = button.onclick;
    button.onclick = function (ev) {
      var before = side;
      var answer = was.call(this, ev);
      if (side !== before) {
        briefly(el(side === "chart" ? "#side-chart-panel" : "#side-colors-panel"),
                side === "chart" ? "from-left" : "from-right", 340);
      }
      return answer;
    };
  });

  // A highlighter going across the words, rather than the words simply
  // turning out to have been highlighted.  The marks are drawn again
  // whenever the shape is painted -- which is whenever any color on the
  // page changes -- so the stroke is kept for a mark that is really new:
  // a pen pressed a moment ago, and a shape that was not already wearing
  // that color.
  var penAt = 0;                         // when a pen was last taken up
  var markSeen = {};                     // shape -> the color it was marked in
  document.addEventListener("click", function (ev) {
    if (ev.target.closest && ev.target.closest(".pen")) { penAt = Date.now(); }
  }, true);
  document.addEventListener("input", function (ev) {
    if (ev.target.closest && ev.target.closest(".pen-other")) { penAt = Date.now(); }
  }, true);
  var markUpPlain = markUp;
  markUp = function (g, texts, color) {
    markUpPlain(g, texts, color);
    var key = g.getAttribute("data-i") || "";
    var fresh = color && markSeen[key] !== color && Date.now() - penAt < 900;
    markSeen[key] = color || "";
    var pen = fresh && !STILL ? el(".highlights", g) : null;
    if (!pen) { return; }
    all(".highlight", pen).forEach(function (r, i) { r.style.setProperty("--i", i); });
    pen.classList.add("swiped");
  };

  // The band over the line a run is on glides from one line to the next,
  // rather than jumping: a loop going round is seen going back up.  The
  // stylesheet can move it, but only once it is there -- told to glide the
  // moment it first appears, it would come sliding in from wherever it
  // was the last time, which might be the other end of the program.  So it
  // is put down first, and allowed to glide from the frame after.
  var codeBox = el("#code");
  if (codeBox && window.MutationObserver && !STILL) {
    new MutationObserver(function () {
      var on = codeBox.classList.contains("at");
      var gliding = codeBox.classList.contains("at-glide");
      if (!on && gliding) { codeBox.classList.remove("at-glide"); }
      if (on && !gliding && !codeBox.glideDue) {
        codeBox.glideDue = true;
        requestAnimationFrame(function () {
          codeBox.glideDue = false;
          if (codeBox.classList.contains("at")) { codeBox.classList.add("at-glide"); }
        });
      }
    }).observe(codeBox, { attributes: true, attributeFilter: ["class"] });
  }

  // A name the program has only just declared, in the table of what it is
  // holding.  The table is built again whenever the names change, so which
  // one is new is found by comparing with what was there a moment ago --
  // and the first names of a run are not new, the table arrives with them.
  var heldSeen = null;
  if (window.MutationObserver && el("#watch-rows")) {
    new MutationObserver(function () {
      var rows = all(".watch-row", el("#watch-rows")), now = {};
      rows.forEach(function (row) {
        var name = (el(".watch-name", row) || {}).textContent || "";
        now[name] = true;
        if (heldSeen && !heldSeen[name]) { briefly(row, "arrived", 360); }
      });
      heldSeen = rows.length ? now : null;
    }).observe(el("#watch-rows"), { childList: true });
  }

  tendSegs();
  wrapFolds();

  // What the builder is saying about itself, whenever it changes what it
  // says -- and the same for what a check found and what the runner says
  // it needs first.  An empty line is not said, so is not seen being said,
  // and the same words written over themselves have not been said again.
  function saysAgain(which) {
    var line = el(which);
    if (!line || !window.MutationObserver) { return; }
    var was = line.textContent;
    new MutationObserver(function () {
      var now = line.textContent;
      if (now && now !== was) { briefly(line, "said-in", 320); }
      was = now;
    }).observe(line, { childList: true, characterData: true, subtree: true });
  }
  ["#build-note", "#pz-mark", "#run-note"].forEach(saysAgain);
