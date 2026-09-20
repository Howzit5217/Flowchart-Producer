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
  }

  function tendSegs() {
    all(".seg").forEach(function (seg) {
      segSlide(seg);
      if (!window.MutationObserver) { return; }
      new MutationObserver(function () { segSlide(seg); })
        .observe(seg, { subtree: true, attributes: true,
                        attributeFilter: ["class"] });
    });
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
    });
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
      if (!open && !panel.classList.contains("hide") && panel.clientWidth > 0) {
        panel.style.setProperty("--panel-w", panel.clientWidth + "px");
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
    if (drawn !== null && now !== drawn) { briefly(paper, "fresh", 520); }
    drawn = now;
  };

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

  tendSegs();
  wrapFolds();

  // What the builder is saying about itself, whenever it changes what it says
  if (window.MutationObserver && el("#build-note")) {
    new MutationObserver(function () {
      briefly(el("#build-note"), "said-in", 320);
    }).observe(el("#build-note"),
               { childList: true, characterData: true, subtree: true });
  }
