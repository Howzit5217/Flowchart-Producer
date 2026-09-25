// ---------------------------------------------------------------------------
//  13-hand-turn.js -- turning a shape by the handle over it
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A shape used to turn a quarter at a time, from its menu.  Now the picked
  // shape wears a round handle over its top, as a shape does in Word, and
  // dragging it round turns the shape to any angle: whole degrees, with a
  // pull towards square so upright is easy to find again, and steps of
  // fifteen with Shift held.  The handle turns with the shape, and the
  // angle is shown beside it while it turns.  Arrows meet a turned shape
  // where its sides have gone (slantPorts, 10-hand.js).
  var SPIN_OFF = 28;                     // how far over its top the handle stands
  var SPIN_R = COARSE ? 13 : 9;          // how big it is -- a fingertip on a touch screen
  var SPIN_SNAP = 4;                     // degrees from square that count as square
  var turning = false;                   // a shape is being turned right now

  // The handle, over the top of the picked shape -- straight up from its
  // middle, the shape's own way up -- drawn by drawHand beside its corners.
  // `at` is where the shape stands on the paper.
  function spinMark(n, at) {
    if (joining || many.length > 1) { return ""; }
    var a = (n.turn || 0) * Math.PI / 180, reach = n.h / 2 + SPIN_OFF;
    var x = at.x + Math.sin(a) * reach, y = at.y - Math.cos(a) * reach;
    // while it turns, how far, beside it -- in its own ink, not the words'
    var said = turning ? '<text class="spin-says" x="' + (x + SPIN_R + 6).toFixed(1) +
                         '" y="' + (y + 4).toFixed(1) + '" font-size="12" font-weight="bold" ' +
                         'fill="#14427c" stroke="#ffffff" stroke-width="3" paint-order="stroke">' +
                         Math.round(n.turn || 0) + "°</text>" : "";
    return '<g class="spin" data-i="' + n.id + '" transform="translate(' +
           x.toFixed(1) + "," + y.toFixed(1) + ')">' +
           "<title>" + escaped(TXT.hm_turn || "") + "</title>" +
           '<circle r="' + SPIN_R + '" fill="#ffffff" stroke="#14427c" stroke-width="1.6"/>' +
           '<path d="M3.6,-2.2A4.2,4.2 0 1 0 4.1,1.2M4.6,-5V-1.9H1.5" fill="none" ' +
           'stroke="#14427c" stroke-width="1.5" stroke-linecap="round" ' +
           'stroke-linejoin="round" transform="scale(' + (SPIN_R / 9).toFixed(2) + ')"/>' +
           "</g>" + said;
  }

  // Which way the pointer is from the shape's middle: 0 straight up, and
  // on round the way a clock goes.
  function spinAngle(node, ev) {
    var p = onPaper(ev);
    return p ? Math.atan2(p.x - node.x, node.y - p.y) * 180 / Math.PI : 0;
  }

  // Taken before the paper sees it: a press on the handle is not the start
  // of a drag about the paper, nor of carrying the shape, nor a click on
  // it -- and a finger held on it is not asking for the shape's menu.
  function spinAt(ev) {
    return byHand && ev.target && ev.target.closest ? ev.target.closest("#chart .spin") : null;
  }
  document.addEventListener("click", function (ev) {
    if (spinAt(ev)) { ev.stopPropagation(); ev.preventDefault(); }
  }, true);
  document.addEventListener("pointerdown", function (ev) {
    var spin = spinAt(ev);
    if (!spin) { return; }
    ev.stopPropagation();
    ev.preventDefault();
    var node = nodeById(+spin.dataset.i);
    if (!node || ev.button) { return; }
    var from = spinAngle(node, ev), was = node.turn || 0, noted = false, waiting = false;
    turning = true;
    function move(e) {
      if (e.pointerId !== ev.pointerId) { return; }
      var to = was + spinAngle(node, e) - from;
      to = ((to % 360) + 360) % 360;
      if (e.shiftKey) { to = Math.round(to / 15) * 15; }
      else {
        var square = Math.round(to / 90) * 90;
        to = Math.abs(to - square) <= SPIN_SNAP ? square : Math.round(to);
      }
      to %= 360;
      if (to === (node.turn || 0)) { return; }
      if (!noted) { noted = true; keepUndo(); }
      node.turn = to;
      if (waiting) { return; }
      waiting = true;
      requestAnimationFrame(function () { waiting = false; drawHand(); });
    }
    function up(e) {
      if (e.pointerId !== ev.pointerId) { return; }
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      turning = false;
      drawHand();                        // and room made round it (keepApart)
      drawHandPanel();
      if (noted) { showReport(); }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    drawHand();                          // the angle, shown from the start
  }, true);
