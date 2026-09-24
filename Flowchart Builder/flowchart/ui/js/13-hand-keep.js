// ---------------------------------------------------------------------------
//  13-hand-keep.js -- keeping a design, and switching between the two ways
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ---- keeping a design, and switching between the two ways of working --
  function handKeep() {
    try {
      localStorage.setItem("flowchart-hand", JSON.stringify(hand));
    } catch (e) { /* no storage: it lives as long as the tab does */ }
  }
  function handRecall() {
    try {
      var was = JSON.parse(localStorage.getItem("flowchart-hand"));
      if (was && was.nodes && was.nodes.length) { hand = was; return true; }
    } catch (e) { /* nothing kept */ }
    return false;
  }

  var byHand = false;
  // The paper as the pseudocode side last left it, and what the bar said
  // about it.  Each way of working has its own paper: the by-hand one is
  // drawn afresh from the shapes every time, and this is the other.  It
  // starts as the chart the page opened with, which on a fresh page is the
  // note asking for some pseudocode.
  //
  // Putting the paper away and taking it out again is the only thing that
  // gets this right.  Redrawing instead was wrong twice over: with nothing
  // in the box there was nothing to redraw, so the hand-drawn chart stayed
  // on the paper under the other mode's panel -- and with something in the
  // box it built the whole chart again to arrive at the picture it had
  // just thrown away, which on the website means waiting for Python.
  var codePaper = el("#sheet") ? el("#sheet").innerHTML : "";
  var codeSub = el("#sub") ? el("#sub").textContent : "";

  function keepCodeSide() {              // going away: put the paper away
    if (el("#sheet")) { codePaper = el("#sheet").innerHTML; }
    if (el("#sub")) { codeSub = el("#sub").textContent; }
    keepProgram();
  }

  function showCodeSide() {              // coming back: take it out again
    if (el("#sheet")) {
      el("#sheet").innerHTML = codePaper;
      if (el("#sub")) { el("#sub").textContent = codeSub; }
      bind();
      paint();
    }
    restoreProgram();
  }
  function setMode(toHand) {
    var wasHand = byHand;
    if (toHand && !byHand) { keepCodeSide(); }
    byHand = toHand;
    // said on the page too, for what only drawing by hand has: the tools in
    // the foot bar, the bar over the paper, shapes a finger can carry
    document.body.classList.toggle("by-hand", toHand);
    el("#tab-code").classList.toggle("on", !toHand);
    el("#tab-hand").classList.toggle("on", toHand);
    el("#source").hidden = toHand;
    el("#hand").hidden = !toHand;
    // Grid and Key belong to the chart, not to the way it was made, so the
    // one pair of switches goes wherever the chart is being made: above the
    // Build button in one mode, up with the shapes in the other.  Moving the
    // same two rather than having two pairs means they cannot disagree.
    var both = el("#chart-switches");
    if (both) {
      if (toHand) { el("#hand-switches").appendChild(both); }
      else { el("#source .fields").appendChild(both); }
    }
    if (toHand) {
      // A chart drawn by hand was never a program, so nothing here is
      // runnable and the runner says so rather than offering to run the
      // one belonging to the chart that has just been put away.
      forgetProgram();
      // Nor is it a puzzle.  Those are put right in the pseudocode, so one
      // left open is put down, the way its own close button would put it
      // down, and what was typed at it is kept for when it is opened again.
      shutPuzzle();
      drawAdders();
      drawHand();
      drawHandPanel();
      showReport();
    } else if (wasHand) {
      // Only coming back from the other side.  Already here, the paper put
      // away is older than the one showing -- it was put away the last time
      // the page went to drawing by hand, or when it opened -- so taking it
      // out swapped the chart for a stale one and the program for none.
      showCodeSide();
    }
    dressPuzzleButton();                 // offered only where they are solved
    try { localStorage.setItem("flowchart-mode", toHand ? "hand" : "code"); }
    catch (e) { /* fine */ }
  }

  if (el("#tab-hand")) {
    el("#tab-code").onclick = function () { setMode(false); };
    el("#tab-hand").onclick = function () { setMode(true); };
    el("#check").onclick = function () {
      showReport();
      readyHandProgram();              // passed? then it can be run
    };
  }


