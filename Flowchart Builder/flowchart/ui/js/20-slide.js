// ---------------------------------------------------------------------------
//  20-slide.js -- a finger drawn along a row of buttons
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A finger put down on one button of a menu, or of a row of them, and
  // drawn along to another lit only the one it went down on: the browser
  // goes on pressing whatever a touch began on, and a finger that has moved
  // is not a tap, so lifting it did nothing at all.  Here the button under
  // the finger is the one lit, all the way along, and lifting the finger
  // presses it -- the way a phone's own menus answer a finger.  Lifted over
  // nothing, nothing is pressed, which is how to change your mind.
  //
  // A mouse lights what it is over already.  In a menu, pressing on one
  // row and letting go on another picks the other, as a menu on the
  // desktop does; anywhere else a mouse is left alone.

  // What counts as a row of buttons.  The menus are one family, so that a
  // finger can go on from a menu into the one opened beside it, or into
  // the colors a row opens.
  var SLIDE_ROWS = ".menu, .colorpop, .seg, .tabs, .adders, .sel-bar, .presets, " +
                   ".type-row, .line-up-row, .sheet-menu";
  var SLIDE_FLOATS = ".menu:not(.out), .colorpop";
  var SLIDE_BUTTONS = "button, a.btn";
  var SLIDE_TAP = 8;                     // how far a tap can wander, in pixels
  var slide = null;                      // the finger being followed, if any
  var slidClickAt = 0;

  function slideRowOf(b) {
    var row = b && b.closest ? b.closest(SLIDE_ROWS) : null;
    if (!row) { return null; }
    return row.matches(".menu, .colorpop") ? "floats" : row;
  }

  // The button of the row that is under a point, if it is one to press.
  function slideButtonAt(row, x, y) {
    var hit = document.elementFromPoint(x, y);
    var b = hit && hit.closest ? hit.closest(SLIDE_BUTTONS) : null;
    if (!b || b.disabled || b.getAttribute("aria-disabled") === "true") { return null; }
    if (row === "floats") { return b.closest(SLIDE_FLOATS) ? b : null; }
    return row.contains(b) ? b : null;
  }

  // Lit, and every other one not.  Written only when it changes: a class
  // written over with itself still wakes whatever watches the page.
  function underFinger(b) {
    all(".under-finger").forEach(function (one) {
      if (one !== b) { one.classList.remove("under-finger"); }
    });
    if (b && !b.classList.contains("under-finger")) { b.classList.add("under-finger"); }
  }

  document.addEventListener("pointerdown", function (ev) {
    slide = null;
    underFinger(null);
    if (!ev.isPrimary) { return; }
    var finger = ev.pointerType !== "mouse";
    if (!finger && ev.button !== 0) { return; }
    var b = ev.target.closest ? ev.target.closest(SLIDE_BUTTONS) : null;
    var row = b && !b.disabled ? slideRowOf(b) : null;
    if (!finger && row !== "floats") { return; }
    // A finger that went down anywhere else is followed too: held still on
    // the paper, it opens a menu under itself (pressHold, 11-hand-many.js),
    // and drawn on from there it goes along that menu.
    slide = { id: ev.pointerId, finger: finger, row: row, from: row ? b : null,
              at: null, x: ev.clientX, y: ev.clientY, moved: false, since: Date.now() };
    if (row && finger) { slide.at = b; underFinger(b); }
  }, true);

  window.addEventListener("pointermove", function (ev) {
    if (!slide || ev.pointerId !== slide.id) { return; }
    if (!slide.moved) {
      if (Math.abs(ev.clientX - slide.x) + Math.abs(ev.clientY - slide.y) < SLIDE_TAP) {
        return;
      }
      slide.moved = true;
    }
    if (!slide.finger) { return; }       // the mouse's own hover shows it
    if (!slide.row) {
      // only a menu this same finger opened, by holding still
      if (!heldLong || pressMenuAt < slide.since || !el(".menu:not(.out)")) { return; }
      slide.row = "floats";
    }
    var b = slideButtonAt(slide.row, ev.clientX, ev.clientY);
    if (b === slide.at) { return; }
    slide.at = b;
    underFinger(b);
    // Resting on a row with more behind it opens that, as a mouse does.
    if (b && b.closest(".menu")) { menuRowOver(b); }
  }, true);

  window.addEventListener("pointerup", function (ev) {
    if (!slide || ev.pointerId !== slide.id) { return; }
    var was = slide;
    slide = null;
    underFinger(null);
    if (!was.moved || !was.row) { return; }   // a tap: the button's own click
    var b = slideButtonAt(was.row, ev.clientX, ev.clientY);
    if (!b) { return; }
    // Pressed and let go on the one row, a mouse clicks it itself.
    if (!was.finger && b === was.from) { return; }
    slidClickAt = Date.now();
    b.click();
  }, true);

  window.addEventListener("pointercancel", function (ev) {
    if (!slide || ev.pointerId !== slide.id) { return; }
    slide = null;                        // the page took it, to scroll
    underFinger(null);
  }, true);

  // The press has been made.  Whatever click the browser sends after it is
  // the same press over again, and lands on whatever holds both buttons --
  // which, for a menu and the one beside it, is the page, and would shut
  // them both.
  document.addEventListener("click", function (ev) {
    if (ev.isTrusted && Date.now() - slidClickAt < 400) {
      slidClickAt = 0;
      ev.stopPropagation();
      ev.preventDefault();
    }
  }, true);
