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
    try { localStorage.setItem("flowchart-side", which); } catch (e) { /* fine */ }
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
    el("#panel").classList.toggle("hide", shut);
    el("#rail").hidden = !shut;
    document.body.classList.toggle("drawer", !shut);   // room beside it on a
    document.body.classList.toggle("railed", shut);    //   narrow screen
    try { localStorage.setItem("flowchart-panel", shut ? "shut" : "open"); }
    catch (e) { /* fine */ }
  }
  // Picking a shape on a chart drawn from pseudocode is somebody asking
  // about that one shape, and everything there is to say about one shape --
  // its three colors, a highlighter, its words, its border -- is on the
  // Style side.  The Chart side has nothing of it at all, so a press that
  // lit a shape up used to answer with a card nobody could see.  So the
  // panel goes there, unfolds the card if it had been folded away, and
  // brings it into view.
  //
  // Not by hand, where a shape's words, its joins and its size are on the
  // Chart side and that is where the press is answered; and not in the
  // middle of a run, whose tape and Stop button are on the Chart side too.
  // A panel that was put away stays away on a screen too narrow to hold it
  // beside the chart, where opening it would cover the very shape that was
  // just picked.
  function styleThePicked() {
    if (byHand || running || !el("#modes")) { return; }
    showSide("colors");
    if (shut && !panelIsOver()) { showPanel(true); }
    var card = el("#sel-card");
    if (!card || shut) { return; }
    var head = el("h2", card);
    if (card.classList.contains("shut") && head) { head.click(); }
    if (card.scrollIntoView) { card.scrollIntoView({ block: "nearest" }); }
  }

  el("#side-chart").onclick = function () { showSide("chart"); };
  el("#side-colors").onclick = function () { showSide("colors"); };
  el("#collapse").onclick = function () { showPanel(false); };
  // The panel is put away with the chevron on it and brought back with the
  // rail that takes its place, so there is no third button for it in the bar.
  el("#rail-chart").onclick = function () { showSide("chart"); showPanel(true); };
  el("#rail-colors").onclick = function () { showSide("colors"); showPanel(true); };

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

