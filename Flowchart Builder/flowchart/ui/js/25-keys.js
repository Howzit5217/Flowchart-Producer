// ---------------------------------------------------------------------------
//  25-keys.js -- the keys people already know
//
//  One part of the Flowchart Builder's script.  The parts run inside a single
//  function and share everything, in the order build.py lists them, so a name
//  made in an earlier part is in hand here.  An editor will call those names
//  undefined, which is expected and harmless.
// ---------------------------------------------------------------------------
/* eslint-disable no-undef */

  // Nothing here is new to learn: they are the keys these things use
  // everywhere else.  They stay out of the way while something is being
  // typed into, which is most of what this page is.
  function typingNow() {
    var on = document.activeElement;
    if (!on) { return false; }
    var tag = (on.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" ||
           on.isContentEditable;
  }

  function keyStep(ev) {                 // a nudge, or a shove with Shift
    return ev.shiftKey ? HAND_GRID * 5 : HAND_GRID;
  }

  window.addEventListener("keydown", function (ev) {
    var ctrl = ev.ctrlKey || ev.metaKey;

    // Ctrl+Enter builds, wherever you are -- including from the pseudocode
    // box, which is exactly where you want it.
    if (ctrl && ev.key === "Enter") {
      ev.preventDefault();
      if (el("#build") && !byHand) { el("#build").click(); }
      else if (el("#check")) { el("#check").click(); }
      return;
    }
    if (ctrl && (ev.key === "s" || ev.key === "S")) {
      ev.preventDefault();               // save the design, not the web page
      if (el("#save-file")) { el("#save-file").click(); }
      return;
    }
    if (ctrl && (ev.key === "o" || ev.key === "O")) {
      ev.preventDefault();
      if (el("#open-file")) { el("#open-file").click(); }
      return;
    }
    if (ctrl && (ev.key === "0" || ev.key === ")")) {
      ev.preventDefault();
      if (el("#actual")) { el("#actual").click(); }
      return;
    }
    if (ctrl && (ev.key === "=" || ev.key === "+")) {
      ev.preventDefault();
      if (el("#in")) { el("#in").click(); }
      return;
    }
    if (ctrl && ev.key === "-") {
      ev.preventDefault();
      if (el("#out")) { el("#out").click(); }
      return;
    }

    if (typingNow()) { return; }         // the rest are for the chart itself

    // Stepping back is not by-hand only any more: what it puts back is the
    // colors as well as the design, and the colors are changed in both
    // modes.  In the one built from pseudocode this used to do nothing at
    // all, which read as the page having no undo rather than as there
    // being nothing it was willing to undo.
    if (ctrl && (ev.key === "z" || ev.key === "Z")) {
      ev.preventDefault();
      stepBack(ev.shiftKey);
      return;
    }
    if (ctrl && (ev.key === "y" || ev.key === "Y")) {
      ev.preventDefault();
      stepBack(true);
      return;
    }

    // The keys every word processor uses, for the words of the shape that
    // is picked: bold, italic, underline, and a size bigger or smaller.
    // Either mode can have a shape picked, so both answer them.  With none
    // picked they are left to the browser, which has uses of its own for
    // them, rather than being swallowed for nothing.
    var picking = ctrl && !ev.altKey ? selectedNow() : null;
    if (picking) {
      var byKey = { b: "bold", i: "italic", u: "under" };
      var look = !ev.shiftKey && byKey[String(ev.key).toLowerCase()];
      if (look) {
        ev.preventDefault();
        flipLook(picking.i, look);
        drawSelection();
        return;
      }
      if (ev.shiftKey && (ev.key === ">" || ev.key === "<")) {
        ev.preventDefault();
        growWords(picking.i, ev.key === ">" ? 1 : -1);
        drawSelection();
        return;
      }
    }
    if (!byHand) { return; }

    var node = nodeById(picked), link = linkById(chosen);

    if (ctrl && (ev.key === "d" || ev.key === "D") && node) {
      ev.preventDefault();               // another one like this one
      keepUndo();
      var twin = JSON.parse(JSON.stringify(node));
      twin.id = hand.next++;
      twin.x += 30;
      twin.y += 30;
      hand.nodes.push(twin);
      picked = twin.id;
      drawHand();
      drawHandPanel();
      return;
    }

    if (ev.key === "Delete" || ev.key === "Backspace") {
      if (!node && !link) { return; }
      ev.preventDefault();
      keepUndo();
      if (link) {
        hand.links = hand.links.filter(function (l) { return l !== link; });
        chosen = null;
      } else {
        hand.nodes = hand.nodes.filter(function (n) { return n.id !== node.id; });
        hand.links = hand.links.filter(function (l) {
          return l.from !== node.id && l.to !== node.id;
        });
        picked = null;
      }
      drawHand();
      drawHandPanel();
      showReport();
      return;
    }

    if (ev.key === "Enter" && node) {    // type in the shape in hand
      ev.preventDefault();
      var g = el('.node[data-i="h' + node.id + '"]', el("#chart"));
      if (g) { typeInto(g); }
      return;
    }
    if (ev.key === "Enter" && link) {
      ev.preventDefault();
      typeOnLink(link);
      return;
    }
    if (ev.key === "Escape") {
      picked = chosen = null;
      joining = false;
      drawHand();
      drawHandPanel();
      return;
    }
    if (ev.key === "Tab") {              // around the shapes, one at a time
      if (!hand.nodes.length) { return; }
      ev.preventDefault();
      var order = hand.nodes.map(function (n) { return n.id; });
      var at = order.indexOf(picked);
      var next = ev.shiftKey ? at - 1 : at + 1;
      picked = order[(next + order.length) % order.length];
      chosen = null;
      drawHand();
      drawHandPanel();
      return;
    }

    var WAYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0],
                 ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (WAYS[ev.key] && node) {
      ev.preventDefault();
      keepUndo();
      var by = keyStep(ev);
      node.x = Math.max(node.w / 2 + 20, node.x + WAYS[ev.key][0] * by);
      node.y = Math.max(node.h / 2 + 20, node.y + WAYS[ev.key][1] * by);
      drawHand();
      drawHandPanel();
    }
  });
