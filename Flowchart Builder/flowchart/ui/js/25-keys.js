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

  // ------------------------------------------------------ the list of them --
  // Every key below, said in one place.  There were twenty-odd and nothing
  // on the page mentioned any of them, so Ctrl+Enter to build was a thing
  // you found by accident or not at all.  Each row is the keys -- any one of
  // the combinations will do -- and the word for what they do; a group can
  // name the part of the page it needs, and is left out where that is not
  // there (a chart saved beside its .svg has no pseudocode to write in).
  var ON_MAC = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");
  var KEY_LIST = [
    ["k_any", "", [
      [[["ctrl", "enter"]], "k_build", "#build"],
      [[["ctrl", "Z"], ["ctrl", "Y"]], "k_undo"],
      [[["ctrl", "S"]], "f_save"],
      [[["ctrl", "O"]], "f_open"],
      [[["ctrl", "+"], ["ctrl", "−"], ["ctrl", "0"]], "k_zoom"],
      [[["Esc"]], "k_close"],
      [[["?"]], "k_keys"]
    ]],
    ["k_code", "#code", [
      [[["Tab"], ["shift", "Tab"]], "k_indent"],
      [[["enter"]], "k_enter"]
    ]],
    ["k_shape", "", [
      [[["ctrl", "B"], ["ctrl", "I"], ["ctrl", "U"]], "k_look"],
      [[["ctrl", "shift", ">"], ["ctrl", "shift", "<"]], "k_size"]
    ]],
    ["k_hand", "#tab-hand", [
      [[["Tab"], ["shift", "Tab"]], "k_next"],
      [[["← ↑ → ↓"]], "k_nudge"],
      [[["enter"]], "m_type"],
      [[["drag"]], "k_lasso"],
      [[["shift", "click"], ["ctrl", "click"]], "k_add"],
      [[["ctrl", "A"]], "k_all"],
      [[["ctrl", "C"], ["ctrl", "X"], ["ctrl", "V"]], "k_clip"],
      [[["ctrl", "D"]], "m_copy"],
      [[["del"]], "delete"],
      [[["space", "drag"]], "k_pan"],
      [[["Esc"]], "k_drop"]
    ]]
  ];

  // The Command key where there is one; the rest by the name the keyboard
  // in this language gives them.
  function keyName(key) {
    if (key === "ctrl") { return ON_MAC ? "⌘" : (TXT.kn_ctrl || "Ctrl"); }
    var named = { shift: "kn_shift", enter: "kn_enter", del: "kn_del",
                  space: "kn_space", click: "kn_click", drag: "kn_drag" }[key];
    return named ? (TXT[named] || key) : key;
  }

  function writeKeys() {
    var body = el("#keys-body");
    if (!body) { return; }
    body.innerHTML = "";
    KEY_LIST.forEach(function (group) {
      if (group[1] && !el(group[1])) { return; }
      var part = document.createElement("section");
      part.className = "more-part";
      var head = document.createElement("h3");
      head.textContent = TXT[group[0]] || group[0];
      part.appendChild(head);
      group[2].forEach(function (row) {
        if (row[2] && !el(row[2])) { return; }
        var line = document.createElement("div");
        line.className = "key-row";
        var what = document.createElement("span");
        what.className = "key-what";
        what.textContent = TXT[row[1]] || row[1];
        var keys = document.createElement("span");
        keys.className = "key-keys";
        // Keys held for every one of them are said once, in front:
        // Ctrl + B / I / U, rather than Ctrl three times over.
        var combos = row[0], held = combos[0].slice(0, -1);
        var shared = combos.length > 1 && held.length && combos.every(function (c) {
          return c.length === held.length + 1 && c.slice(0, -1).join() === held.join();
        });
        if (shared) {
          combos = combos.map(function (c) { return c.slice(-1); });
          combos[0] = held.concat(combos[0]);
        }
        combos.forEach(function (combo, i) {
          if (i) {
            var or = document.createElement("span");
            or.className = "key-or";
            or.textContent = "/";
            keys.appendChild(or);
          }
          var together = document.createElement("span");
          together.className = "key-combo";
          combo.forEach(function (key, j) {
            if (j) { together.appendChild(document.createTextNode("+")); }
            var cap = document.createElement("kbd");
            cap.textContent = keyName(key);
            together.appendChild(cap);
          });
          keys.appendChild(together);
        });
        line.appendChild(what);
        line.appendChild(keys);
        part.appendChild(line);
      });
      body.appendChild(part);
    });
  }

  // Written afresh every time it opens, so it is in whatever language the
  // page has been changed to since.
  function showKeys(open) {
    var over = el("#keys-over");
    if (!over) { return; }
    if (open) {
      writeKeys();
      shutSheets();                      // the settings it was opened from
    }
    over.hidden = !open;
    if (open && el("#keys-done")) { el("#keys-done").focus(); }
  }

  if (el("#keys-over")) {
    if (el("#keys-open")) {
      el("#keys-open").onclick = function () { showKeys(true); };
    }
    el("#keys-done").onclick = function () { showKeys(false); };
    el("#keys-over").onclick = function (ev) {    // the dim behind it shuts it
      if (ev.target === el("#keys-over")) { showKeys(false); }
    };
    window.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !el("#keys-over").hidden) { showKeys(false); }
    });
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

    // The list of them all.  A question mark is what asks for help on
    // almost every site that has keys at all.
    if (ev.key === "?" && !ctrl && !ev.altKey) {
      ev.preventDefault();
      showKeys(true);
      return;
    }

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
    // Whatever shapes are taken up, one or several (11-hand-many.js).
    var lot = takenIds(), key = String(ev.key).toLowerCase();

    if (ctrl && !ev.altKey && key === "a") {     // every shape on the paper
      if (!hand.nodes.length) { return; }
      ev.preventDefault();
      selectAll();
      return;
    }
    // Copy and cut are the shapes' only when shapes are taken up and no
    // words on the page are: words picked out with the mouse are copied
    // the way they always were.
    if (ctrl && !ev.altKey && (key === "c" || key === "x") && lot.length &&
        !String(window.getSelection ? window.getSelection() : "")) {
      ev.preventDefault();
      copyShapes(lot, key === "x");
      return;
    }
    if (ctrl && !ev.altKey && key === "v") {
      if (pasteShapes()) { ev.preventDefault(); }
      return;
    }
    if (ctrl && key === "d" && lot.length) {
      ev.preventDefault();               // another one like each of these
      duplicateShapes(lot);
      return;
    }

    if (ev.key === "Delete" || ev.key === "Backspace") {
      if (many.length > 1) {
        ev.preventDefault();
        keepUndo();
        dropShapes(many.slice());
        drawHand();
        drawHandPanel();
        showReport();
        return;
      }
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
      many = [];
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
    if (WAYS[ev.key] && many.length > 1) {
      ev.preventDefault();
      keepUndo();
      nudgeMany(many, WAYS[ev.key][0] * keyStep(ev), WAYS[ev.key][1] * keyStep(ev));
      drawHand();
      drawHandPanel();
      return;
    }
    if (WAYS[ev.key] && node) {
      ev.preventDefault();
      keepUndo();
      var by = keyStep(ev);
      node.x += WAYS[ev.key][0] * by;    // the paper grows to the left too
      node.y = Math.max(node.h / 2 + 20, node.y + WAYS[ev.key][1] * by);
      drawHand();
      drawHandPanel();
    }
  });
