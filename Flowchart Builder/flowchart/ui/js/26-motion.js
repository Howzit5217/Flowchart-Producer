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
  // again, so the same move can be made to happen twice in a row.  The
  // browser has to see it off in between, or it carries on with the move
  // already going rather than start it over.
  //
  // Seeing it off used to mean asking for the width, which lays the whole
  // page out there and then -- the chart included.  Beside a chart of five
  // thousand shapes that was four milliseconds a time, and a run that
  // declares a hundred names in one box flashes a hundred new rows in the
  // table of what it is holding: the page stopped for a third of a second.
  // A word that is not on needs no seeing off at all, and one that is only
  // needs its styling worked out again, which does not lay anything out.
  function briefly(node, name, ms) {
    if (!node || STILL) { return; }
    if (node.classList.contains(name)) {
      node.classList.remove(name);
      void getComputedStyle(node).animationName;
    }
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

  // It has to be put down before it is allowed to slide at all.  A switch
  // made again under a press is laid out by the browser the moment it goes
  // in -- the button that was pressed is handed the keyboard back straight
  // away, and that means working out where everything is -- which is
  // before this has had a chance to say anything.  Laid out then, its
  // block was at the first button, since nobody had said otherwise, and
  // it slid from the far left every time, whichever button it had been
  // on.  So the stylesheet holds the block still until this has put it
  // where it starts from, and only then lets it go.
  function tendSeg(seg) {
    if (seg.segTended) { return; }
    seg.segTended = true;
    var key = segKey(seg), was = segAt[key];
    segSlide(seg);
    if (!STILL && was !== undefined && segPressed && segPressed.key === key &&
        Date.now() - segPressed.at < 1500) {
      seg.style.setProperty("--seg-i", was);
    }
    void seg.offsetWidth;                // standing where it starts from
    seg.setAttribute("data-seg-set", "");
    segSlide(seg);                       // and on from there to where it is
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
  //
  // This is called by a watcher on the card's own classes, so it must never
  // touch them when there is nothing to change.  Taking off a class that is
  // not there still counts as a change to anybody watching, and the watcher
  // called this again, which took it off again, for ever: shutting a card
  // froze the whole page, and so did picking a shape while the card for the
  // picked shape was shut, because picking one flashes a class on that card.
  function settleFold(card) {
    var wait = card.foldSeen ? 300 : 0;  // at the start, nothing is opening
    card.foldSeen = true;
    clearTimeout(card.settleTimer);
    if (card.classList.contains("shut")) {
      if (card.classList.contains("fold-open")) { card.classList.remove("fold-open"); }
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
  openMenu = function (x, y, items, kind) {
    openMenuPlain(x, y, items, kind);    // whatever it was asked for, passed on
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
  showKeys = goingOver("#keys-over", showKeys);

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
    inkEnd();                            // a new drawing ends the last one's
    bindPlain();
    if (byHand) { return; }
    handSeen = null;                     // the paper is not a drawing by hand
    var paper = el("#sheet");
    var now = paper ? drawingSign(paper) : "";
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
      if (tooBigToSee()) { atActualSize(); }
      inkStart(paper);
    }
    drawn = now;
  };

  // What the drawing on the paper is, to tell it from the last one.  The
  // whole of it written out is exact, and for a chart of a few hundred
  // shapes costs nothing; for one of forty thousand it is twenty-odd
  // megabytes written out on every build and held until the next, only to
  // be compared once.  Past HEAVY a sign of it does: its size, how many
  // pieces it has, and how much writing there is in it.  Two different
  // drawings of one program still differ there, because every build is
  // shaken afresh -- and the worst a match could do is skip a flourish.
  function drawingSign(paper) {
    var svg = el("svg", paper);
    if (!svg || !heavy) { return paper.innerHTML; }
    return [svg.getAttribute("viewBox"), svg.getElementsByTagName("*").length,
            svg.textContent.length].join(" ");
  }

  // --------------------------------------------------------- drawn in ink --
  // A new chart is drawn onto the paper the way the pictures that open each
  // chapter of Super Paper Mario are: a pen goes round each shape, its color
  // washes in once the outline is closed, its words are written in from the
  // left, and the line leaving it is drawn on to the next shape, where its
  // arrowhead lands -- in the order the program reads, one after another.
  //
  // At one speed: a long line takes longer to draw than a short one, and the
  // speed is on the screen, so a chart shown smaller is not drawn slower.
  // A big chart is not drawn for minutes on end for it, though.  What gives
  // is how long the pen waits before beginning the next piece, not how any
  // one piece is drawn -- a wave of drawing passing down a big chart, a
  // single point crawling along a small one, each stroke of both the same
  // (how long the whole thing takes, below).
  //
  // Only what can be seen is drawn.  A chart too big for the screen is
  // shown at actual size with its Start in view, and a pen that carried on
  // below the edge of the screen for minutes would be drawing for nobody --
  // and anybody who scrolled down would find a chart still waiting to be
  // drawn.  What is off the screen is simply there, and the pen goes from
  // one thing that can be seen to the next.
  //
  // Touch anything -- a press, the wheel, a key -- and it is finished at
  // once: the drawing is there to be looked at, never to be waited on.
  //
  // Nothing is said to the paper, or to the drawing as a whole, apart from
  // hiding it for the moment it takes to plan.  A word on either has every
  // piece of the chart looked at again when it goes on and again when it
  // comes off -- nearly two seconds each way on a chart of thirty thousand
  // shapes -- so each piece the pen will draw is told so on its own, and
  // nothing else in the chart is touched at all.  Nothing is moved or
  // scaled either: a sheet two million pixels tall shrunk by one part in a
  // hundred is swept ten thousand pixels at its top, and the view is aimed
  // at the Start while it is.
  var PEN = 1500;                        // px a second a line is drawn at
  var WRITE = 520;                       // and words written at
  var WASH = 320;                        // ms a shape's color takes to wash in
  var POP = 160;                         // and an arrowhead to land

  // How long the whole drawing takes.  At the pen's own speed, one piece
  // finished before the next is begun, a chart of a dozen shapes took four
  // seconds and one of a hundred half a minute -- and nobody waits half a
  // minute to be shown a chart they have already been told is ready.
  //
  // So a big drawing is not slowed to a crawl; it is drawn by more of the
  // pen at once.  Each piece is still drawn exactly as it was -- the same
  // outline, the same wash behind it, the same words written in from the
  // left -- but the next one is begun before the last is finished, so the
  // drawing arrives as a wave passing down the chart rather than a single
  // point crawling along it.  Past what even that can bring in, the pen
  // quickens too, up to a limit: fast enough to keep the whole thing inside
  // a few seconds, never so fast that the drawing turns into a flash.
  //
  // A small chart is not touched at all.  Under EASY the wave is a single
  // pen going round one thing at a time, which is what it always was.
  var EASY = 1800;                       // ms a drawing may take before it is hurried
  var CAP = 2600;                        // and about the longest any of them takes
  var AT_ONCE = 6;                       // pieces under the pen together before it quickens
  var QUICKEST = 2.2;                    // times its own speed, at the very most
  var ink = null;                        // the drawing going on, if any
  var INK_VARS = ["--len", "--dur", "--d", "--late", "--wash", "--pop"];

  function inkStart(paper) {
    var svg = el("svg", paper);
    if (STILL || !svg || document.hidden) { return; }
    var mine = { svg: svg, pieces: [], frame: 0, timer: 0, safety: 0, total: 0 };
    ink = mine;
    // Hidden until it is known what the pen will draw.  That waits on the
    // size the chart is shown at, which the build settles a moment after
    // this -- it asked for the fitting before the drawing was bound, so a
    // timer asked for now comes after it.  A chart that appeared whole and
    // then vanished to be drawn would be the one thing an entrance must not
    // do; an empty sheet for a moment is only paper.
    svg.style.opacity = "0";
    inkListen(true);
    mine.timer = setTimeout(function () {
      if (ink !== mine) { return; }
      try { inkPlan(mine); }
      catch (e) { mine.pieces.forEach(inkOff); mine.pieces = []; }
      svg.style.opacity = "";
      if (!mine.pieces.length) { inkEnd(); return; }
      inkGo(mine);
    }, 0);
  }

  // Where every piece the pen will draw is, how long each takes, and when
  // its turn comes.
  function inkPlan(mine) {
    var svg = mine.svg, stage = el("#stage");
    if (!svg.isConnected || !stage || !W) { return; }
    var r = svg.getBoundingClientRect(), s = stage.getBoundingClientRect();
    var k = r.width / W;                 // screen px to one of the chart's own
    if (!(k > 0)) { return; }
    var edge = 24;                       // a little past the edge is drawn too
    var view = { x0: (s.left - r.left - edge) / k, y0: (s.top - r.top - edge) / k,
                 x1: (s.right - r.left + edge) / k, y1: (s.bottom - r.top + edge) / k };
    function seen(b) {
      return !!b && b.x <= view.x1 && b.x + b.w >= view.x0 &&
             b.y <= view.y1 && b.y + b.h >= view.y0;
    }
    function boxOf(bit) {
      try {
        var b = bit.getBBox();
        // A piece of a big chart the page has left out of its drawing, being
        // nowhere near the screen (showBands), is not laid out, and measures
        // as nothing at all at the chart's corner -- which is on the screen
        // whenever the Start is.  It is not there to be drawn.
        if (!b.width && !b.height) { return null; }
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      } catch (e) { return null; }
    }
    function pairsOf(text) {
      var n = (text || "").match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || [], out = [];
      for (var i = 0; i + 1 < n.length; i += 2) { out.push([+n[i], +n[i + 1]]); }
      return out;
    }
    function spanOf(pts) {
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      pts.forEach(function (p) {
        x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]);
        x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]);
      });
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    function away(b, x, y) {             // how far a point is from a box
      var dx = Math.max(b.x - x, 0, x - b.x - b.w);
      var dy = Math.max(b.y - y, 0, y - b.y - b.h);
      return Math.sqrt(dx * dx + dy * dy);
    }
    function drawMs(len) { return len * k / PEN * 1000; }
    function writeMs(wide) { return wide * k / WRITE * 1000; }
    function ms(n) { return Math.round(n) + "ms"; }

    var here = whoIsIn(), pieces = mine.pieces;
    // The shapes on the screen, in the order they come in the drawing --
    // which is the order the program reads -- and those just off it, which
    // a line on the screen may be leaving from.
    var shapes = [], near = [];
    here.nodes.forEach(function (g) {
      var b = boxOf(g);
      if (!b) { return; }
      var one = { el: g, box: b, leaving: [], coming: [], said: [] };
      if (seen(b)) { shapes.push(one); near.push(one); }
      else if (b.x <= view.x1 + 200 && b.x + b.w >= view.x0 - 200 &&
               b.y <= view.y1 + 200 && b.y + b.h >= view.y0 - 200) { near.push(one); }
    });
    function nearest(list, x, y, within, not) {
      var best = null, far = within;
      list.forEach(function (one) {
        if (one === not) { return; }
        var d = away(one.box, x, y);
        if (d <= far) { far = d; best = one; }
      });
      return best;
    }

    // Each line on the screen belongs to the shape it leaves, drawn when
    // that shape is done -- or, where it starts from somewhere that is not
    // a shape on the screen, like the middle of a join, to the shape it
    // goes into, drawn just before that one.
    var lines = [], loose = [], ends = {};
    here.flows.forEach(function (line) {
      var pts = pairsOf(line.getAttribute("d"));
      if (pts.length < 2 || !line.getTotalLength) { return; }
      if (!seen(spanOf(pts))) { return; }
      var a = pts[0], z = pts[pts.length - 1], len = 0;
      try { len = line.getTotalLength(); } catch (e) { len = 0; }
      var one = { el: line, len: len, pts: pts, dur: drawMs(len), heads: [], labels: [] };
      lines.push(one);
      // Where it leaves from first: a short stem under a diamond ends within
      // a head's length of the diamond too, and taken for a line going into
      // it, it was drawn before the diamond it leaves.
      var out = nearest(near, a[0], a[1], 3, null);
      if (out && shapes.indexOf(out) < 0) { out = null; }   // it leaves off the screen
      var into = out ? null : nearest(shapes, z[0], z[1], 16, null);
      if (out) { out.leaving.push(one); }
      else if (into) { into.coming.push(one); }
      else { loose.push(one); }
      ends[Math.round(z[0]) + " " + Math.round(z[1])] = one;
    });
    function lineEndingAt(x, y) {
      for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
          var got = ends[(Math.round(x) + dx) + " " + (Math.round(y) + dy)];
          if (got) { return got; }
        }
      }
      return null;
    }
    // An arrowhead lands as its line arrives.  A line with a head on it
    // stops at the head's broad end; a short one runs on to its point.
    var strayHeads = [];
    here.heads.forEach(function (head) {
      var p = pairsOf(head.getAttribute("points"));
      if (p.length < 3 || !seen(spanOf(p))) { return; }
      var its = lineEndingAt((p[1][0] + p[2][0]) / 2, (p[1][1] + p[2][1]) / 2) ||
                lineEndingAt(p[0][0], p[0][1]);
      if (its) { its.heads.push(head); } else { strayHeads.push(head); }
    });
    // How near a point is to a line, and how far along the line the
    // nearest place on it is, as a share of the whole.
    function alongside(line, x, y) {
      var pts = line.pts, best = Infinity, at = 0, run = 0;
      for (var i = 1; i < pts.length; i++) {
        var ax = pts[i - 1][0], ay = pts[i - 1][1];
        var dx = pts[i][0] - ax, dy = pts[i][1] - ay, seg = Math.sqrt(dx * dx + dy * dy);
        var u = seg ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (seg * seg))) : 0;
        var d = Math.sqrt(Math.pow(ax + u * dx - x, 2) + Math.pow(ay + u * dy - y, 2));
        if (d < best) { best = d; at = run + u * seg; }
        run += seg;
      }
      return { far: best, share: run ? at / run : 0 };
    }
    // The True, False or Case beside a line, and the patch of paper behind
    // it, are written as the pen passes them; a module's name with the
    // shape it heads; the chart's title and whose it is, first of all.
    var heading = [];
    here.said.forEach(function (words) {
      var b = boxOf(words);
      if (!seen(b)) { return; }
      var patch = words.previousElementSibling;
      if (!patch || !patch.classList.contains("patch")) { patch = null; }
      var one = { el: words, patch: patch, dur: writeMs(b.w), share: 0 };
      var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      if (words.classList.contains("label")) {
        var best = null, far = 40;
        lines.forEach(function (line) {
          var got = alongside(line, cx, cy);
          if (got.far < far) { far = got.far; best = line; one.share = got.share; }
        });
        if (best) { best.labels.push(one); return; }
      }
      var by = words.classList.contains("heading")
             ? nearest(shapes, b.x, b.y + b.h, 80, null)
             : words.classList.contains("label") ? nearest(shapes, cx, cy, 80, null) : null;
      if (by) { by.said.push(one); return; }
      heading.push(one);
    });

    // Every shape measured once: how long the pen takes round each stroke
    // of its outline, and how wide each line of its words is.  Measuring is
    // the dear half of all this -- each stroke asks the browser how long it
    // is and each word how wide -- so it is done here, once, and the
    // timetable below, which is arithmetic and nothing else, is free to be
    // worked out twice.
    shapes.forEach(function (one) {
      var strokes = [], fills = [], words = [];
      Array.prototype.forEach.call(one.el.children, function (bit) {
        var tag = bit.tagName.toLowerCase();
        if (tag === "text") {
          var b = boxOf(bit);
          words.push({ el: bit, wide: b ? b.w : 0 });
          return;
        }
        if (bit.classList.contains("ghost")) { return; }
        var len = 0;
        if (tag !== "g" && bit.getTotalLength) {
          try { len = bit.getTotalLength(); } catch (e) { len = 0; }
        }
        if (len > 0) { strokes.push({ el: bit, len: len }); }
        else { fills.push(bit); }
      });
      one.art = { strokes: strokes, fills: fills, words: words };
    });

    // The timetable: what is drawn when, and how long each of it takes.
    // rate is how much faster than its own speed the pen is going; squeeze
    // is how much of the wait between one piece and the next is kept.  At
    // one and one this is the plain thing -- a single pen, one piece at a
    // time -- and every piece keeps its own shape at any other pair, since
    // rate is the only thing that touches how long a piece takes.  The turns
    // are counted at the pen's own speed throughout and squeezed as each
    // piece is written down, so that what is worked out here does not
    // depend on how hurried the answer turns out to be.
    function layOut(rate, squeeze, pieces, mark) {
      var wash = Math.max(140, WASH / rate);
      var pop = Math.max(90, POP / rate);
      var hurry = rate > 1;              // the washes and the arrowheads too
      function put(bit, at, cls, vars, kids) {
        if (mark) { bit.classList.add("ink-wait"); }
        var p = { el: bit, t: at * squeeze, cls: cls, vars: vars || {},
                  kids: kids || [], lasts: 0 };
        pieces.push(p);
        return p;
      }
      function write(one, at) {
        put(one.el, at, "ink-write", { "--dur": ms(one.dur / rate) }).lasts = one.dur / rate;
        if (one.patch) { put(one.patch, at, null); }
        return at + one.dur;
      }
      function drawLine(line, at) {
        put(line.el, at, "ink-line", { "--len": (line.len + 2).toFixed(1),
                                       "--dur": ms(line.dur / rate) }).lasts = line.dur / rate;
        line.heads.forEach(function (head) {
          put(head, at + line.dur, "ink-pop", hurry ? { "--pop": ms(pop) } : null).lasts = pop;
        });
        line.labels.forEach(function (one) { write(one, at + line.dur * one.share); });
        return at + line.dur;
      }

      var t = 0;
      heading.forEach(function (one) { t = write(one, t); });
      var after = t;
      loose.forEach(function (line) { after = Math.max(after, drawLine(line, t)); });
      t = after;
      shapes.forEach(function (one) {
        var ready = t;
        one.coming.forEach(function (line) { ready = Math.max(ready, drawLine(line, t)); });
        t = ready;
        // Round the outline, every stroke of it at once; the color washes in
        // behind each once it is closed; the words are written as the pen
        // comes round to finish, one line of them after another.
        var kids = [], outline = 0;
        one.art.strokes.forEach(function (stroke) {
          var d = drawMs(stroke.len);
          outline = Math.max(outline, d);
          kids.push({ el: stroke.el, cls: "ink-line",
                      vars: { "--len": (stroke.len + 2).toFixed(1), "--dur": ms(d / rate) } });
        });
        one.art.fills.forEach(function (bit) {
          kids.push({ el: bit, cls: "ink-wash", vars: { "--d": ms(outline / rate) } });
        });
        var held = outline * 0.7, run = 0;
        one.art.words.forEach(function (words) {
          var d = writeMs(words.wide);
          kids.push({ el: words.el, cls: "ink-write",
                      vars: { "--d": ms((held + run) / rate), "--dur": ms(d / rate) } });
          run += d;
        });
        var said = held + run;           // when the last word is written
        // The wash is told to the shape rather than to each piece of it: it
        // is the same for all of them, and it is inherited, so one word on
        // the group is one style to put on and one to take off instead of
        // four or five.
        put(one.el, t, null, hurry ? { "--wash": ms(wash) } : {}, kids)
          .lasts = Math.max(outline / rate + wash, said / rate);
        one.said.forEach(function (words) { write(words, t); });
        t += Math.max(outline, said);
        var gone = t;
        one.leaving.forEach(function (line) { gone = Math.max(gone, drawLine(line, t)); });
        t = gone;
      });
      strayHeads.forEach(function (head) {
        put(head, t, "ink-pop", hurry ? { "--pop": ms(pop) } : null).lasts = pop;
      });
      var total = 0;
      pieces.forEach(function (p) { total = Math.max(total, p.t + p.lasts); });
      return total;
    }

    // Laid out once at the pen's own speed, to see how long that would be,
    // and once for real.  What is wanted is the whole of a short drawing and
    // no more than about CAP of a long one, approached rather than reached,
    // so that a chart twice the size of another still takes a little longer
    // than it rather than exactly as long.  Bringing the turns that much
    // closer together is what makes the wave; the pen is only asked to
    // quicken once the wave would otherwise have more than AT_ONCE pieces
    // going at the same time.
    var natural = layOut(1, 1, [], false);
    var want = natural <= EASY ? natural : EASY + (CAP - EASY) * (1 - EASY / natural);
    var squeeze = natural > 0 ? want / natural : 1;
    var rate = Math.min(QUICKEST, Math.max(1, 1 / (squeeze * AT_ONCE)));
    mine.total = layOut(rate, squeeze, pieces, true);
    pieces.sort(function (a, b) { return a.t - b.t; });
  }

  function inkGo(mine) {
    var pieces = mine.pieces, next = 0, began = 0, live = [];
    function frame(stamp) {
      if (ink !== mine) { return; }
      if (!began) { began = stamp; }
      var now = stamp - began;
      while (next < pieces.length && pieces[next].t <= now) {
        var p = pieces[next++];
        inkOn(p, now - p.t);
        live.push(p);
      }
      // Each piece is let go as soon as it has been drawn, so a border that
      // is dashed goes back to its dashes rather than waiting on the rest.
      live = live.filter(function (p) {
        if (p.t + p.lasts + 30 > now) { return true; }
        inkOff(p);
        return false;
      });
      if (next < pieces.length || live.length) { mine.frame = requestAnimationFrame(frame); }
      else { inkEnd(); }
    }
    mine.frame = requestAnimationFrame(frame);
    // Frames are only drawn for a window somebody can see; an ordinary
    // timer finishes it whatever happens.
    mine.safety = setTimeout(function () {
      if (ink === mine) { inkEnd(); }
    }, mine.total + 2000);
  }

  // Its turn: shown, and told how far behind its turn it already is, so
  // that a frame arriving late leaves nothing drawn slower than the rest.
  function inkOn(p, late) {
    p.el.classList.remove("ink-wait");
    if (p.cls) { p.el.classList.add(p.cls); }
    Object.keys(p.vars).forEach(function (name) { p.el.style.setProperty(name, p.vars[name]); });
    p.el.style.setProperty("--late", -Math.round(late) + "ms");
    p.kids.forEach(function (kid) {
      kid.el.classList.add(kid.cls);
      Object.keys(kid.vars).forEach(function (name) {
        kid.el.style.setProperty(name, kid.vars[name]);
      });
    });
    p.on = true;
  }

  // Drawn, or no longer wanted drawn: back to exactly what it was, so a
  // saved copy of the chart carries no trace of how it arrived.
  function inkOff(p) {
    p.el.classList.remove("ink-wait");
    if (!p.on) { return; }
    p.on = false;
    if (p.cls) { p.el.classList.remove(p.cls); }
    INK_VARS.forEach(function (name) { p.el.style.removeProperty(name); });
    p.kids.forEach(function (kid) {
      kid.el.classList.remove(kid.cls);
      INK_VARS.forEach(function (name) { kid.el.style.removeProperty(name); });
    });
  }

  function inkEnd() {
    var mine = ink;
    if (!mine) { return; }
    ink = null;
    cancelAnimationFrame(mine.frame);
    clearTimeout(mine.timer);
    clearTimeout(mine.safety);
    inkListen(false);
    mine.svg.style.opacity = "";
    mine.pieces.forEach(inkOff);
  }

  function inkStop(ev) {
    if (ev.type === "keydown" && /^(Shift|Control|Alt|Meta|CapsLock)$/.test(ev.key)) { return; }
    if (ev.type === "visibilitychange" && !document.hidden) { return; }
    inkEnd();
  }
  var INK_WHEEL = { capture: true, passive: true };
  function inkListen(on) {
    var how = on ? "addEventListener" : "removeEventListener";
    document[how]("pointerdown", inkStop, true);
    document[how]("keydown", inkStop, true);
    document[how]("visibilitychange", inkStop);
    window[how]("resize", inkStop);
    var stage = el("#stage");
    if (stage) { stage[how]("wheel", inkStop, INK_WHEEL); }
  }

  var CASCADE_MOST = 150;                // shapes, past which it is shown at actual size

  // ------------------------------------------- a chart too big to see whole --
  // A chart that fits on the stage is fitted to it and drawn where it
  // stands, as above.  One that does not -- too many shapes to follow at once, or too
  // tall to show whole at a size anybody could read -- used to rise as one
  // block, shrunk to the width of the stage, and left you to find your own
  // way to its Start.
  //
  // So it is shown at its actual size instead, with its Start in view --
  // which is where anybody reading a chart that big begins.  Nothing else:
  // it once put itself together piece by piece under a camera that chased
  // whatever was arriving and flew back to the Start at the end, and a
  // view that will not hold still is not one anybody can read.  The Start
  // is put in view by the build itself, as for any chart.
  var atFull = false;                    // this drawing stays at actual size

  // Too many shapes, or too big to show whole at a size that can
  // be read: the same line fitIfItMustBe draws, past which it gives up on
  // the whole chart and fits only its width.
  function tooBigToSee() {
    if (!chart || !W || !H) { return false; }
    if (whoIsIn().nodes.length > CASCADE_MOST) { return true; }
    var box = el("#stage");
    if (!box) { return false; }
    var face = getComputedStyle(box);
    var across = box.clientWidth - parseFloat(face.paddingLeft)
                                 - parseFloat(face.paddingRight) - 14;
    var down = box.clientHeight - parseFloat(face.paddingTop)
                                - parseFloat(face.paddingBottom) - 14;
    if (across <= 0 || down <= 0) { return false; }
    return Math.min(across / W, down / H) < 0.3;
  }

  // A drawing that is being shown at actual size is not fitted to the stage
  // when it arrives.  The build asks for the fitting before the drawing is
  // bound, so the answer is left here for it to find.
  var fitPlain = fitIfItMustBe;
  fitIfItMustBe = function () {
    if (atFull) { atFull = false; return; }
    fitPlain();
  };

  function atActualSize() {
    atFull = true;
    glideStop();
    zoom = 1;
    show();
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

  // ------------------------------------------- the same chart, moved over --
  // Words set in another face, or bigger, want boxes of another size, and
  // the chart is drawn again to make room for them (see reflowSoon).  It is
  // the same chart, shaken the same way, so every shape comes back a little
  // to one side of where it was -- and used to simply be there, the whole
  // drawing jumping at once.  Now each shape is put down where it was and
  // carried to where it goes, its words with it, and every line, arrowhead
  // and label is carried the same way, so what is seen is the chart making
  // room.  The paper grows with it, since a wider chart is a wider paper.
  //
  // Nothing is worked out about the layout here.  The old drawing is
  // measured, the new one is measured, and each piece is drawn part of the
  // way from the one to the other for as long as the move takes.  A shape
  // is matched by its place in the drawing, which the same program drawn
  // the same way keeps; a drawing with a different number of shapes, or
  // the same shapes in another order, is not the same chart and simply
  // arrives, the way it did before.  A line is matched by the shape it
  // leaves and the one it reaches, because bigger words move the shapes
  // apart and a route drawn again between them may have gained a corner or
  // lost one, or been chained with the one it used to meet: it is the same
  // arrow all the same, and goes as one.  Whatever has no match -- a route
  // that now leaves from somewhere else -- fades in where it now is.  Past
  // a few hundred shapes the chart simply arrives too: hundreds of pieces
  // rewritten sixty times a second is a stutter, not a move.
  //
  // A shape is a box and the words in it.  The box is scaled from the size
  // it was to the size it is, about its own corner; the words are only
  // moved, keeping their place in the middle of it, because words are the
  // one thing that must not be seen stretched -- and the highlighter behind
  // them goes with the words, since it was measured against them.
  var putSheetPlain = putSheet;
  var GLIDE_MOST = 400;                  // shapes, past which it simply arrives
  var GLIDE_MS = 480;                    // how long the move takes
  var carrying = null;                   // the move in progress, if any
  var NUMS = /-?\d*\.?\d+(?:e-?\d+)?/gi;
  function numsIn(s) {
    var got = (s || "").match(NUMS);
    return got ? got.map(Number) : [];
  }
  function withTheWords(e) {             // moves with the words, not the box
    return e.tagName === "text" || e.classList.contains("highlights");
  }

  // Which shape a point is on, or near, and which side of it: a line's
  // route may change, but where it leaves and where it arrives do not.
  // Where it is on none of them (a line that joins another line, say) is
  // simply that.
  function shapeAt(x, y, boxes, reach) {
    var best = -1, side = "", far = reach * reach;
    boxes.forEach(function (b, i) {
      var dx = Math.max(b.x - x, 0, x - b.x - b.w);
      var dy = Math.max(b.y - y, 0, y - b.y - b.h);
      var d = dx * dx + dy * dy;
      if (d > far) { return; }
      far = d; best = i;
      var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      side = Math.abs(x - cx) * (b.h || 1) > Math.abs(y - cy) * (b.w || 1)
             ? (x < cx ? "l" : "r") : (y < cy ? "t" : "b");
    });
    return best < 0 ? "j" : "n" + best + side;
  }

  // Everything on the paper the move can carry, where each is now, and
  // what tells it from the others.  A shape mid-move is where the move has
  // got it to, not where its numbers say: a second change of face before
  // the first has landed carries on from wherever the shapes are.
  // Nothing, if the chart is too big for this or cannot be measured (a
  // paper not on show has no sizes).
  function sheetPieces() {
    var svg = el("#sheet svg");
    if (!svg) { return null; }
    var box = numsIn(svg.getAttribute("viewBox"));
    var nodes = all(".node", svg);
    if (!nodes.length || nodes.length > GLIDE_MOST || box.length < 4) {
      return null;
    }
    var got = { svg: svg, box: svg.getAttribute("viewBox"), w: box[2], h: box[3],
                nodes: [], lines: [], heads: [], words: [], patches: [] };
    try {
      nodes.forEach(function (g) {
        var at = g.glideAt, l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
        if (!at) {
          Array.prototype.forEach.call(g.children, function (e) {
            if (withTheWords(e)) { return; }
            var m = e.getBBox();
            l = Math.min(l, m.x); t = Math.min(t, m.y);
            r = Math.max(r, m.x + m.width); b = Math.max(b, m.y + m.height);
          });
          if (l === Infinity) {
            var whole = g.getBBox();
            l = whole.x; t = whole.y; r = l + whole.width; b = t + whole.height;
          }
          at = { x: l, y: t, w: r - l, h: b - t };
        }
        got.nodes.push({ el: g, sign: (g.dataset.kind || "") + "/" + (g.dataset.i || ""),
                         x: at.x, y: at.y, w: at.w, h: at.h });
      });
    } catch (e) { return null; }
    var boxes = got.nodes;
    // A route leaves from right on a shape's edge and stops an arrowhead
    // short of the one it reaches; a head's point is on the edge.
    all(".flow", svg).forEach(function (e) {
      var n = numsIn(e.getAttribute("d"));
      if (n.length < 4) { return; }
      got.lines.push({ el: e, key: shapeAt(n[0], n[1], boxes, 3) + ">" +
                       shapeAt(n[n.length - 2], n[n.length - 1], boxes, 16) });
    });
    all(".head", svg).forEach(function (e) {
      var n = numsIn(e.getAttribute("points"));
      if (n.length < 2) { return; }
      got.heads.push({ el: e, key: shapeAt(n[0], n[1], boxes, 3) });
    });
    // A True or False sits by the side of its diamond, on a patch of paper
    // that keeps the line from running through it: the patch is put down
    // just before the words, so it is told from the others by them.
    var patches = all(".patch", svg), words = all(".label, .heading", svg);
    words.forEach(function (e, i) {
      var key = e.textContent + "@" +
                shapeAt(+e.getAttribute("x"), +e.getAttribute("y"), boxes, 60);
      got.words.push({ el: e, key: key });
      if (patches.length === words.length) {
        got.patches.push({ el: patches[i], key: key });
      }
    });
    return got;
  }

  // One piece's numbers, from the old drawing's to the new one's -- the
  // corners of a line, the points of an arrowhead, where a label sits --
  // with the text around the numbers kept as the new drawing wrote it.
  // Nothing when the two do not have the same numbers to go between.
  function attrMoves(was, now, names) {
    var attrs = [];
    for (var k = 0; k < names.length; k++) {
      var before = was.getAttribute(names[k]) || "";
      var after = now.getAttribute(names[k]) || "";
      var a = numsIn(before), b = numsIn(after);
      if (!b.length || a.length !== b.length) { return null; }
      attrs.push({ name: names[k], bits: after.split(NUMS), a: a, b: b, done: after });
    }
    return attrs;
  }

  // A route as the points along it -- its rounded corners taken as a few
  // short straights -- each with how far along the route it lies, from 0
  // at the start to 1 at the end.
  function routePoints(d) {
    var tok = (d || "").match(/[MLQ]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
    var pts = [], mode = "", k = 0;
    while (k < tok.length) {
      if (/^[MLQ]$/i.test(tok[k])) { mode = tok[k].toUpperCase(); k++; continue; }
      if (mode === "Q" && k + 3 < tok.length && pts.length) {
        var from = pts[pts.length - 1];
        var cx = +tok[k], cy = +tok[k + 1], x = +tok[k + 2], y = +tok[k + 3];
        for (var s = 1; s <= 4; s++) {
          var t = s / 4, u = 1 - t;
          pts.push([u * u * from[0] + 2 * u * t * cx + t * t * x,
                    u * u * from[1] + 2 * u * t * cy + t * t * y]);
        }
        k += 4;
      } else if (k + 1 < tok.length) {
        pts.push([+tok[k], +tok[k + 1]]);
        k += 2;
      } else { break; }
    }
    var along = [0], total = 0;
    for (var i = 1; i < pts.length; i++) {
      total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      along.push(total);
    }
    if (pts.length < 2 || !total) { return null; }
    return { pts: pts, at: along.map(function (a) { return a / total; }) };
  }
  function pointAlong(route, u) {
    var at = route.at, pts = route.pts, i = 1;
    while (i < at.length - 1 && at[i] < u) { i++; }
    var span = at[i] - at[i - 1] || 1, t = Math.max(0, Math.min(1, (u - at[i - 1]) / span));
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
            pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
  }

  // Two routes with a different number of corners, as two lines of the
  // same points: each is taken at every place along it where either has
  // a corner, so that the one at the start is the old route exactly and
  // the one at the end the new, and in between the corners slide.
  function routeMoves(was, now) {
    var a = routePoints(was.getAttribute("d")), b = routePoints(now.getAttribute("d"));
    if (!a || !b) { return null; }
    var stops = a.at.concat(b.at).sort(function (p, q) { return p - q; });
    var from = [], to = [], bits = ["M"], last = -1;
    stops.forEach(function (u) {
      if (u - last < 0.002) { return; }
      last = u;
      var p = pointAlong(a, u), q = pointAlong(b, u);
      from.push(p[0], p[1]); to.push(q[0], q[1]);
      bits.push(",", " L");
    });
    bits[bits.length - 1] = "";
    return [{ name: "d", bits: bits, a: from, b: to, done: now.getAttribute("d") }];
  }

  // Each new piece against the old piece that answers to the same name;
  // two of one name are taken in the order they come.  What has no match
  // fades in where it is.
  function matched(olds, news, names, orRoute) {
    var byKey = {};
    olds.forEach(function (o) { (byKey[o.key] = byKey[o.key] || []).push(o); });
    return news.map(function (piece) {
      var was = (byKey[piece.key] || []).shift();
      var attrs = was ? attrMoves(was.el, piece.el, names) : null;
      if (!attrs && was && orRoute) { attrs = routeMoves(was.el, piece.el); }
      return attrs ? { el: piece.el, attrs: attrs } : { el: piece.el, fade: true };
    });
  }

  // What has to move, or nothing when the new drawing is not the old one
  // with its shapes moved over.
  function piecesMoved(was, now) {
    if (!was || !now || was.nodes.length !== now.nodes.length) { return null; }
    var moves = { svg: now.svg, box: now.box, w0: was.w, h0: was.h, w1: now.w, h1: now.h,
                  nodes: [], pieces: [] };
    for (var i = 0; i < now.nodes.length; i++) {
      var a = was.nodes[i], b = now.nodes[i];
      if (a.sign !== b.sign) { return null; }
      moves.nodes.push({ el: b.el, x0: a.x, y0: a.y, w0: a.w, h0: a.h,
                         x1: b.x, y1: b.y, w1: b.w, h1: b.h });
    }
    moves.pieces = matched(was.lines, now.lines, ["d"], true)
      .concat(matched(was.heads, now.heads, ["points"]),
              matched(was.words, now.words, ["x", "y"]),
              matched(was.patches, now.patches, ["x", "y", "width", "height"]));
    return moves;
  }

  // Everything drawn `p` of the way along, from where it was (0) to where
  // it goes (1).  At 1 every number is the new drawing's own again and
  // nothing of the move is left on it.
  function drawMoves(m, p) {
    var q = 1 - p, f = function (n) { return n.toFixed(1); };
    var w = m.w0 * q + m.w1 * p, h = m.h0 * q + m.h1 * p;
    m.svg.setAttribute("viewBox", p < 1 ? "0 0 " + f(w) + " " + f(h) : m.box);
    m.svg.style.width = (w * zoom).toFixed(p < 1 ? 1 : 0) + "px";
    m.nodes.forEach(function (n) {
      var x = n.x0 * q + n.x1 * p, y = n.y0 * q + n.y1 * p;
      var wd = n.w0 * q + n.w1 * p, ht = n.h0 * q + n.h1 * p;
      var art = null, words = null;
      if (p < 1) {
        art = "translate(" + f(x) + " " + f(y) + ") scale(" +
              (n.w1 ? wd / n.w1 : 1).toFixed(4) + " " +
              (n.h1 ? ht / n.h1 : 1).toFixed(4) + ") translate(" +
              f(-n.x1) + " " + f(-n.y1) + ")";
        words = "translate(" + f(x + wd / 2 - n.x1 - n.w1 / 2) + " " +
                f(y + ht / 2 - n.y1 - n.h1 / 2) + ")";
        n.el.glideAt = { x: x, y: y, w: wd, h: ht };
      } else {
        delete n.el.glideAt;
      }
      Array.prototype.forEach.call(n.el.children, function (e) {
        var t = withTheWords(e) ? words : art;
        if (t) { e.setAttribute("transform", t); }
        else { e.removeAttribute("transform"); }
      });
    });
    m.pieces.forEach(function (piece) {
      if (piece.fade) {
        piece.el.style.opacity = p < 1 ? p.toFixed(3) : "";
        return;
      }
      piece.attrs.forEach(function (at) {
        if (p >= 1) { piece.el.setAttribute(at.name, at.done); return; }
        var s = at.bits[0];
        for (var k = 0; k < at.b.length; k++) {
          s += f(at.a[k] * q + at.b[k] * p) + at.bits[k + 1];
        }
        piece.el.setAttribute(at.name, s);
      });
    });
  }

  // Whatever is still on its way lands, at once.  Before a copy of the
  // drawing is taken, and before another drawing replaces it.
  function settleSheet() {
    if (!carrying) { return; }
    var m = carrying;
    carrying = null;
    cancelAnimationFrame(m.frame);
    if (m.svg.isConnected) { drawMoves(m, 1); }
  }

  function carryPieces(m) {
    settleSheet();
    carrying = m;
    var began = null;
    drawMoves(m, 0);
    function frame(now) {
      if (carrying !== m) { return; }
      if (began === null) { began = now; }
      var p = Math.min(1, (now - began) / GLIDE_MS);
      drawMoves(m, 1 - Math.pow(1 - p, 4));
      if (p < 1) { m.frame = requestAnimationFrame(frame); }
      else { carrying = null; }
    }
    m.frame = requestAnimationFrame(frame);
  }

  putSheet = function (svg, again) {
    var was = again && !STILL && !byHand ? sheetPieces() : null;
    settleSheet();
    putSheetPlain(svg, again);
    if (!was) { return; }
    var now = sheetPieces();
    var moves = now ? piecesMoved(was, now) : null;
    if (!moves) { return; }
    // The shapes are set back where they were only once everything else
    // about the new drawing has been done -- it has been bound, colored,
    // and the copy behind the .svg link taken from it -- and still before
    // the browser has drawn a frame of it.
    Promise.resolve().then(function () {
      if (now.svg.isConnected) { carryPieces(moves); }
    });
  };

  // A copy of the drawing -- for the .svg link, or a PNG -- is a copy of
  // where everything is going, not of where it has got to.
  var plainCopy = plain;
  plain = function (scale) { settleSheet(); return plainCopy(scale); };
