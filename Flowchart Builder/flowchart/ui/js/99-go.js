// ---------------------------------------------------------------------------
//  19-go.js -- and off it goes
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------------- go on --
  recall();
  recallSetup();                       // how it was left set up, not what was in it
  dress();
  drawRoles();
  try {
    showSide(localStorage.getItem("flowchart-side") === "colors" ? "colors" : "chart");
    showPanel(localStorage.getItem("flowchart-panel") !== "shut");
  } catch (e) { showSide("chart"); showPanel(true); }
  if (!el("#modes")) { el("#side-tabs").hidden = true; }
  recallSolved();
  dressPuzzleButton();
  buildPresets();
  buildGlobals();
  buildStarts();
  showStarts();
  el("#grid-on").checked = !style.gridOff;
  bind();
  paint();
  dressRunner();
  try { setLoose(localStorage.getItem("flowchart-hold") === "loose"); }
  catch (e) { setLoose(false); }
  if (el("#r-pace")) {                   // however it was left running
    try {
      var howFast = localStorage.getItem("flowchart-pace");
      if (howFast) { el("#r-pace").value = howFast; }
    } catch (e) { /* storage turned off: it starts on Step slowly */ }
  }
  if (el("#tab-hand")) {
    var lastMode = "code";
    try { lastMode = localStorage.getItem("flowchart-mode") || "code"; }
    catch (e) { /* fine */ }
    if (handRecall() && lastMode === "hand") {
      setMode(true);
      return;                            // by hand: nothing to draw from code
    }
  }
  // Whatever is in the box on arrival is drawn.  Nothing is, ordinarily --
  // the box opens empty and stays empty until somebody writes in it -- but
  // a program handed to --serve on the command line arrives already in it,
  // and that was asked for, so it is drawn without being asked for twice.
  if (el("#code")) {
    if (el("#code").value.trim()) {
      opening = true;                    // drawn on opening, not asked for
      el("#build").click();
    }
    else if (MODE === "web") { startPython(); }  // warm it up while they type
  }
})();
