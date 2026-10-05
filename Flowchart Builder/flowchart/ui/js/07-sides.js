// ---------------------------------------------------------------------------
//  07-sides.js -- the two sides of the panel, and folding it away
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------------- panel --
  // Two sides to it -- the chart, and how it looks -- so that neither is a
  // long scroll, and a way to shut the whole thing when the chart is what
  // you want to look at.  What was open last time is how it opens.
  var side = "chart", shut = false;
  function showSide(which) {
    side = which;
    if (!el("#modes")) { which = side = "colors"; }   // nothing to build here
    el("#side-chart").classList.toggle("on", which === "chart");
    el("#side-colors").classList.toggle("on", which === "colors");
    el("#side-chart-panel").hidden = which !== "chart";
    el("#side-colors-panel").hidden = which === "chart";
    el("#rail-chart").classList.toggle("on", which === "chart");
    el("#rail-colors").classList.toggle("on", which === "colors");
    if (which === "colors") { fitStyleSide(true); }    // only what applies (below)
    // Out for a pick (styleThePicked), the side kept is the one it goes
    // back to: the page opens again on that, with nothing picked.
    var kept = sideBeforePick === null || sideBeforePick === undefined ? which : sideBeforePick;
    try { localStorage.setItem("flowchart-side", kept); } catch (e) { /* fine */ }
  }
  // On a screen too narrow to hold both, the panel lies over the chart and
  // this sits between them: tapping it puts the panel away, which is what
  // anyone who has used a drawer expects and is far easier to hit than a
  // small chevron.  On a wide screen it is never shown.
  function veil() {
    var there = el(".veil");
    if (there) { return there; }
    var sheet = document.createElement("div");
    sheet.className = "veil";
    sheet.addEventListener("pointerdown", function () { showPanel(false); });
    var room = el("main");
    if (room) { room.appendChild(sheet); }
    return sheet;
  }

  // Is the panel lying over the chart rather than sitting beside it?  On a
  // screen that narrow it hides the thing it was used to make, so anything
  // that produces a chart puts it away afterwards.
  function panelIsOver() {
    try { return matchMedia("(max-width: 899px)").matches; }
    catch (e) { return false; }
  }

  function showPanel(open) {
    veil();
    shut = !open;
    if (shut) { shutColorPopIn(el("#panel")); }
    el("#panel").classList.toggle("hide", shut);
    el("#rail").hidden = !shut;
    document.body.classList.toggle("drawer", !shut);   // room beside it on a
    document.body.classList.toggle("railed", shut);    //   narrow screen
    try { localStorage.setItem("flowchart-panel", shut ? "shut" : "open"); }
    catch (e) { /* fine */ }
  }
  // Picking a shape is somebody asking about that one shape, and how it
  // looks -- its colors, a highlighter, its words, its border, and for a
  // piece of a design what it is made of and its finish -- is all on the
  // Style side.  So a shape or a piece clicked on the paper takes the panel
  // there, unfolds the card if it had been folded away, and brings it into
  // view; let go of again (nothing picked, or several), the panel goes back
  // to the side it was on (asked for, 2026-10-05: "when you click it it goes
  // to the style menu and when you release your click it goes back to the
  // Chart tab").  A tab pressed in between is the side wanted from then on.
  //
  // Not in the middle of a run, whose tape and Stop button are on the Chart
  // side.  A panel that was put away stays away by hand, where opening it
  // under a press would shift the paper being dragged on, and on a screen
  // too narrow to hold it beside the chart, where it would cover the very
  // shape that was just picked.
  var sideBeforePick = null;             // the side to go back to, or null
  function styleThePicked() {
    if (running || !el("#modes")) { return; }
    if (sideBeforePick === null) { sideBeforePick = side; }
    if (side !== "colors") { showSide("colors"); slideSide(); }
    if (shut && !byHand && !panelIsOver()) { showPanel(true); }
    var card = el("#sel-card");
    if (!card || shut) { return; }
    var head = el("h2", card);
    if (card.classList.contains("shut") && head) { head.click(); }
    if (card.scrollIntoView) { card.scrollIntoView({ block: "nearest" }); }
  }
  // Nothing picked any more, or several at once (whose card is on the Chart
  // side): back to the side the pick took the panel from.  Asked whenever
  // the picked shape's card is put up (drawSelection, 04-panel.js).
  function sideAfterPick(picking) {
    if (sideBeforePick === null || sideBeforePick === undefined || picking) { return; }
    var back = sideBeforePick;
    sideBeforePick = null;
    if (back !== side) { showSide(back); slideSide(); }
  }
  // The side arriving comes in from the side its tab is on, as when its tab
  // is pressed (26-motion.js).
  function slideSide() {
    if (typeof briefly !== "function") { return; }
    briefly(el(side === "chart" ? "#side-chart-panel" : "#side-colors-panel"),
            side === "chart" ? "from-left" : "from-right", 340);
  }

  // Only what is wanted for what is in hand is on the Style side (asked for
  // with the above: "only show the text settings ... or any of the settings
  // if they are actually needed for the object or flowchart piece that you
  // are currently on").  A shape or piece picked: its own card and nothing
  // else -- the palette, the chart's words, the kinds and the paper are the
  // whole drawing's, and come back when it is let go of.  Nothing picked:
  // the drawing's cards, less any with nothing to say -- the words where
  // there are none, the kinds where none are on the paper, Labels and Sizes
  // where nothing on it is a plan's.  Asked whenever the picked shape's
  // card is put up or the kinds are counted again (04-panel.js), and when
  // the side comes out; a card is shown or hidden only when that changes.
  function showsWords(g) {
    if (!g) { return false; }
    var texts = g.querySelectorAll("text");
    for (var i = 0; i < texts.length; i++) {
      if (texts[i].textContent.trim()) { return true; }
    }
    return false;
  }
  function cardOf(sel) {
    var bit = el(sel);
    return bit && bit.closest ? bit.closest("section.card") : null;
  }
  var styleFitFor = null;                // fitted last for one picked, or none
  var styleFitLate = false;              // and a fit put off while in use
  function fitStyleSide(fresh) {
    try { fitStyleCards(fresh); } catch (e) { /* every card stays as it was */ }
  }
  // The side being used: the pointer over it, or the keys going about it
  // (a switch pressed with the mouse keeps the focus, but not a visible one).
  function styleInUse(panel) {
    try {
      if (panel.matches(":hover")) { return true; }
      var now = document.activeElement;
      return !!now && panel.contains(now) && now.matches(":focus-visible");
    } catch (e) { return false; }
  }
  function fitStyleCards(fresh) {
    var panel = el("#side-colors-panel");
    if (!panel) { return; }
    var one = !!selectedNow();
    // While it is being used, the cards change only as the pick does: Labels
    // switched on there would otherwise bring the Words card in above it,
    // and the switch under Labels would no longer be under the hand going
    // to press it.  What was put off is done once the hand has gone.
    if (!fresh && one === styleFitFor && side === "colors" && !shut && styleInUse(panel)) {
      styleFitLate = true;
      return;
    }
    styleFitLate = false;
    styleFitFor = one;
    // any of a plan's pieces on the paper drawn by hand
    var plan = byHand && hand.nodes.some(function (n) { return !!ICONS[n.kind]; });
    // a chart is words in boxes; a design or a plan, only the words drawn
    var words = !byHand || !(plan || designMode()) || showsWords(chart);
    var kinds = el("#kinds");
    function put(bit, on) {
      if (bit && bit.hidden === !!on) { bit.hidden = !on; }
    }
    put(cardOf("#presets"), !one);
    put(cardOf("#letters"), !one && words);
    put(cardOf("#kinds"), !one && !!(kinds && kinds.children.length));
    put(cardOf("#sel-body"), one);
    put(cardOf("#globals"), !one);
    put(cardOf("#reset"), !one);
    ["#labels-on", "#sizes-on"].forEach(function (sel) {
      var box = el(sel), row = box && box.closest(".row");
      put(row, plan);
    });
  }
  (function () {
    var panel = el("#side-colors-panel");
    if (!panel) { return; }
    function later() {
      if (styleFitLate && !styleInUse(panel)) { fitStyleSide(true); }
    }
    panel.addEventListener("pointerleave", function () { setTimeout(later, 0); });
    panel.addEventListener("focusout", function () { setTimeout(later, 0); });
  })();

  // Asked for by name -- Format shape on a shape's menu (20-menu.js), as
  // Word opens its Format pane -- the Style side comes out at the card for
  // the shape, by hand as well, and on a narrow screen over the chart too,
  // since that is what was asked for.
  function formatPicked() {
    if (!el("#modes")) { return; }
    if (sideBeforePick === null) { sideBeforePick = side; }
    if (side !== "colors") { showSide("colors"); slideSide(); }
    if (shut) { showPanel(true); }
    var card = el("#sel-card");
    if (!card) { return; }
    var head = el("h2", card);
    if (card.classList.contains("shut") && head) { head.click(); }
    if (card.scrollIntoView) { card.scrollIntoView({ block: "nearest" }); }
  }

  // A side pressed for is the side wanted: letting go of the pick no
  // longer takes the panel anywhere.
  el("#side-chart").onclick = function () { sideBeforePick = null; showSide("chart"); };
  el("#side-colors").onclick = function () { sideBeforePick = null; showSide("colors"); };
  el("#collapse").onclick = function () { showPanel(false); };
  // The panel is put away with the chevron on it and brought back with the
  // rail that takes its place, so there is no third button for it in the bar.
  el("#rail-chart").onclick = function () { sideBeforePick = null; showSide("chart"); showPanel(true); };
  el("#rail-colors").onclick = function () { sideBeforePick = null; showSide("colors"); showPanel(true); };

  // every named section folds away, and stays folded
  var folded = {};
  try { folded = JSON.parse(localStorage.getItem("flowchart-folded")) || {}; }
  catch (e) { folded = {}; }
  // Named by where they stand -- except a card that names itself, which is
  // named by that and not counted.  The card for the words came after the
  // others were already being remembered by place, and counting it would
  // have handed every card below it the folds of the one above.
  var cardsCounted = 0;
  all("#side-colors-panel section.card").forEach(function (card) {
    var head = el("h2", card);
    var name = card.dataset.fold || "s" + cardsCounted++;
    if (!head) { return; }
    card.classList.add("fold");
    if (folded[name]) { card.classList.add("shut"); }
    head.onclick = function () {
      card.classList.toggle("shut");
      folded[name] = card.classList.contains("shut");
      try { localStorage.setItem("flowchart-folded", JSON.stringify(folded)); }
      catch (e) { /* fine */ }
    };
  });

  // And the ones written to fold in the page itself rather than gathered
  // up here.  "Shape for each kind" is written `class="card fold shut"`,
  // which is enough for the styling to hide everything under the heading
  // and put a chevron on it -- and the only thing that ever handed a
  // heading something to do when it was pressed was the loop above, which
  // looks in the colours panel, and that section is in the chart one.  So
  // it sat there shut for good: a heading, a chevron that turned nothing,
  // and six shape pickers nobody could reach.  Folded by its own id, so
  // the ones above keep the names they have been saved under.
  all("section.fold[id]").forEach(function (card) {
    var head = el("h2", card);
    if (!head || head.onclick) { return; }
    var name = card.id;
    card.classList.toggle("shut", folded[name] !== false);
    head.onclick = function () {
      card.classList.toggle("shut");
      folded[name] = card.classList.contains("shut");
      try { localStorage.setItem("flowchart-folded", JSON.stringify(folded)); }
      catch (e) { /* fine */ }
    };
  });

  // Drag to move about -- which, locked, means scrolling the stage under a
  // chart that stays put.  Loose, the chart is what moves instead, and
  // 06-chart.js has that; there is nothing to scroll then, so this stands
  // aside rather than the two of them pulling at the same press.
  (function () {
    var stage = el("#stage"), from = null;
    stage.addEventListener("mousedown", function (ev) {
      if (loose) { return; }
      if (ev.target.closest && ev.target.closest(".node")) { return; }
      from = { x: ev.clientX, y: ev.clientY, l: stage.scrollLeft, t: stage.scrollTop };
      stage.classList.add("grabbing");
    });
    window.addEventListener("mousemove", function (ev) {
      if (!from) { return; }
      stage.scrollLeft = from.l - (ev.clientX - from.x);
      stage.scrollTop = from.t - (ev.clientY - from.y);
    });
    window.addEventListener("mouseup", function () {
      from = null; stage.classList.remove("grabbing");
    });
  })();

