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
  all("#side-colors-panel section.card").forEach(function (card, i) {
    var head = el("h2", card);
    if (!head) { return; }
    card.classList.add("fold");
    var name = "s" + i;
    if (folded[name]) { card.classList.add("shut"); }
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

