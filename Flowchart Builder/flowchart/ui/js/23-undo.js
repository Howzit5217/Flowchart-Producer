// ---------------------------------------------------------------------------
//  23-undo.js -- stepping back, and stepping forward again
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------

  // A copy of everything a hand can change is taken before anything
  // changes it, and the copies are kept in a pile.  Ctrl+Z puts the top
  // one back; Ctrl+Y, or Ctrl+Shift+Z, takes it off again.
  //
  // It used to be called only from the keyboard, which meant a nudge with
  // an arrow key could be undone but dragging the same shape across the
  // paper could not.  Every by-hand move goes through keepUndo() now.
  //
  // And a copy used to be the by-hand design and nothing else, so nothing
  // about a color could be taken back at all -- in the mode where there is
  // no design to speak of, Ctrl+Z did nothing whatever.  A color is the
  // easier of the two to lose: one press of a palette throws away every
  // fill and outline that was ever set by hand, and Put every color back
  // puts back the plain ones rather than the ones that were there a moment
  // ago.  So a copy is both, and which palette was lit up as well.  A step
  // that changed only one of them puts the other back exactly as it was,
  // which costs nothing and means neither mode has to know about the pile.
  function undoable() {
    try {
      var lit = el("#presets .preset.on");
      return {
        hand: JSON.parse(JSON.stringify(hand)),
        style: JSON.parse(JSON.stringify(style)),
        preset: lit ? lit.dataset.preset : ""
      };
    } catch (e) { return null; }
  }
  var wasLike = [], willBeLike = [];     // where we came from, and went back from

  // The two buttons in the bar are hidden while their pile is empty, the
  // way the faults and the tape are: a button for stepping back before
  // anything has been done is one more thing to read and nothing else.
  function showUndo() {
    if (el("#undo")) { el("#undo").hidden = !wasLike.length; }
    if (el("#redo")) { el("#redo").hidden = !willBeLike.length; }
  }

  function keepUndo() {
    var now = undoable();
    if (!now) { return; }
    wasLike.push(now);
    if (wasLike.length > 60) { wasLike.shift(); }
    willBeLike.length = 0;               // a new move ends the old redo trail
    showUndo();
  }

  function forgetUndo() {                // a fresh start has nothing behind it
    wasLike.length = 0;
    willBeLike.length = 0;
    showUndo();
  }

  function stepBack(forward) {
    var from = forward ? willBeLike : wasLike;
    var to = forward ? wasLike : willBeLike;
    if (!from.length) { return; }
    var now = undoable();
    if (now) { to.push(now); }
    var back = from.pop();
    hand = back.hand;
    style = back.style;
    picked = chosen = null;
    // The two switches that say whether the ruling shows are showing a
    // part of what has just been put back, so they are put back with it.
    if (el("#grid-on")) { el("#grid-on").checked = !style.gridOff; }
    if (el("#f-grid")) { el("#f-grid").checked = !style.gridOff; }
    all("#presets .preset").forEach(function (x) {
      if (x.dataset.preset === back.preset && back.preset) { x.classList.add("on"); }
      else { x.classList.remove("on"); }
    });
    if (byHand) {
      drawHand();                        // which binds the chart and paints it
      drawHandPanel();
      showReport();
    } else {
      paint();
    }
    buildKinds();
    buildGlobals();
    drawSelection();
    showUndo();
  }

  if (el("#undo")) { el("#undo").onclick = function () { stepBack(false); }; }
  if (el("#redo")) { el("#redo").onclick = function () { stepBack(true); }; }

