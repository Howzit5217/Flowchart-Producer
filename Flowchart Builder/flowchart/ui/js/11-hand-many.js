// ---------------------------------------------------------------------------
//  11-hand-many.js -- several shapes at once: taken up, carried, copied
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // =============================================== several shapes at once ==
  // A chart drawn by hand could only ever be worked on a shape at a time, so
  // moving the bottom half of it down to make room was a dozen drags, each
  // one lined up by eye with the last, and there was no copying a piece of
  // it at all.  Every drawing program does this the same way, and this does
  // it that way too: drag across empty paper and every shape wholly inside
  // the box is taken up; Shift or Ctrl and a click takes one more up, or
  // lets one go; Ctrl+A takes up the lot.  Take hold of any of them and they
  // all move, and Ctrl+C, Ctrl+X and Ctrl+V copy, cut and paste them --
  // with the arrows between them, and with the colors each was given.
  //
  // What is taken up is `many` (10-hand.js), two or more shapes' numbers.
  // One shape is still `picked`, with its dots and corners and its own
  // panel, as it always was; the two are never both in use at once.

  function inMany(id) { return many.indexOf(id) >= 0; }

  // What is taken up, whichever way: the several, the one, or nothing.
  function takenIds() {
    if (many.length > 1) { return many.slice(); }
    return picked ? [picked] : [];
  }

  // Take up exactly these.  One of them is the ordinary picked shape; two or
  // more are taken up together; none is nothing in hand at all.
  function takeUp(ids) {
    var mine = [];
    ids.forEach(function (id) {
      if (mine.indexOf(id) < 0 && nodeById(id)) { mine.push(id); }
    });
    chosen = null;
    joining = false;
    joinFrom = null;
    if (mine.length > 1) { many = mine; picked = null; }
    else { many = []; picked = mine[0] || null; }
  }

  // Kept true to the paper, before every drawing.  Picking one shape or an
  // arrow -- which a dozen things do, from Tab to the Check list -- is
  // letting the rest go; and a shape deleted or stepped back out of
  // existence is no longer one of them.
  function tidyMany() {
    if (picked || chosen) { many = []; return; }
    many = many.filter(function (id) { return !!nodeById(id); });
    if (many.length === 1) { picked = many[0]; many = []; }
  }

  // ---------------------------------------------------- a box round them --
  // Pressed on bare paper and dragged: a box is drawn from the press to the
  // mouse, and every shape wholly inside it lights up as it comes in.  Let
  // go, and those are taken up -- added to what was taken up already, if
  // Shift or Ctrl is held.  A press let go where it was is still a click on
  // the paper (or on the arrow under it), and does what a click did.
  //
  // A finger is left to scroll, as it always was: a touch screen has no
  // other way to move about the paper, and two fingers already zoom.
  var lassoDone = false;                 // the click that ends a box is no click

  function lasso(svg) {
    svg.addEventListener("pointerdown", function (ev) {
      lassoDone = false;
      if (ev.button || ev.pointerType === "touch" || pinched) { return; }
      if (ev.target.closest && ev.target.closest(".node, .knob, .spot, .grip")) { return; }
      var from = onPaper(ev);
      if (!from) { return; }
      // Not a drag of the stage, locked or loose: this is drawing a box.
      ev.preventDefault();
      ev.stopPropagation();
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* mouse: fine */ }
      var adding = ev.shiftKey || ev.ctrlKey || ev.metaKey;
      var had = adding ? takenIds() : [];
      var at = { x: ev.clientX, y: ev.clientY };
      var frame = null, inside = [];

      function reach() {
        if (!frame && Math.abs(at.x - ev.clientX) + Math.abs(at.y - ev.clientY) < NUDGE) {
          return;
        }
        var here = onPaper({ clientX: at.x, clientY: at.y });
        if (!here) { return; }
        if (!frame) {
          frame = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          frame.setAttribute("class", "lasso-box");
          svg.appendChild(frame);
          svg.classList.add("lassoing");  // the one shape's dots put away
        }
        var x0 = Math.min(from.x, here.x), x1 = Math.max(from.x, here.x);
        var y0 = Math.min(from.y, here.y), y1 = Math.max(from.y, here.y);
        frame.setAttribute("x", (x0 + handOrigin.x).toFixed(1));
        frame.setAttribute("y", (y0 + handOrigin.y).toFixed(1));
        frame.setAttribute("width", (x1 - x0).toFixed(1));
        frame.setAttribute("height", (y1 - y0).toFixed(1));
        inside = hand.nodes.filter(function (n) {
          var t = turned(n);
          return t.x - t.w / 2 >= x0 && t.x + t.w / 2 <= x1 &&
                 t.y - t.h / 2 >= y0 && t.y + t.h / 2 <= y1;
        }).map(function (n) { return n.id; });
        all(".node[data-i]", svg).forEach(function (g) {
          var id = +g.dataset.i.slice(1);
          var on = had.indexOf(id) >= 0 || inside.indexOf(id) >= 0;
          if (g.classList.contains("on") !== on) { g.classList.toggle("on", on); }
        });
      }
      function move(e) {
        if (pinched) { return; }
        at = { x: e.clientX, y: e.clientY };
        reach();
        if (frame) { chase(at, reach); }   // out past the edge, the view follows
      }
      function drop() {
        chaseStop();
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", drop);
        window.removeEventListener("pointercancel", drop);
        if (!frame) { return; }            // no box: the click says what it was
        frame.remove();
        svg.classList.remove("lassoing");
        lassoDone = true;
        takeUp(had.concat(inside));
        drawHand();
        drawHandPanel();
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", drop);
      window.addEventListener("pointercancel", drop);
    });
  }

  // ------------------------------------------------------ carrying the lot --
  // Where each of them was when it was taken hold of.
  function crowdOf(ids) {
    return ids.map(function (id) {
      var n = nodeById(id);
      return n && { node: n, x: n.x, y: n.y };
    }).filter(Boolean);
  }

  // The one taken hold of settles on the grid and lines up with the shapes
  // outside the lot, exactly as it would alone; the rest move by just what
  // it moved, so the lot keeps its own shape.  Carried up against the top
  // of the paper the lot stops there together, rather than each shape
  // stopping on its own and the lot squashing flat.
  function carryCrowd(crowd, held, wasX, wasY, dx, dy) {
    held.x = Math.round((wasX + dx) / HAND_GRID) * HAND_GRID;
    held.y = Math.round((wasY + dy) / HAND_GRID) * HAND_GRID;
    lineUp(held, crowd.map(function (c) { return c.node.id; }));
    var byX = held.x - wasX, byY = held.y - wasY;
    crowd.forEach(function (c) {
      byY = Math.max(byY, turned(c.node).h / 2 + 20 - c.y);
    });
    crowd.forEach(function (c) {
      c.node.x = c.x + byX;
      c.node.y = c.y + byY;
    });
  }

  // An arrow key moves the lot a step, as it moves one shape.
  function nudgeMany(ids, dx, dy) {
    var lot = crowdOf(ids);
    lot.forEach(function (c) { dy = Math.max(dy, turned(c.node).h / 2 + 20 - c.y); });
    lot.forEach(function (c) { c.node.x += dx; c.node.y += dy; });
  }

  // Gone, and every arrow into or out of them with them.
  function dropShapes(ids) {
    hand.nodes = hand.nodes.filter(function (n) { return ids.indexOf(n.id) < 0; });
    hand.links = hand.links.filter(function (l) {
      return ids.indexOf(l.from) < 0 && ids.indexOf(l.to) < 0;
    });
    picked = chosen = null;
    many = [];
    joining = false;
  }

  // ------------------------------------------------ copying and pasting --
  // A copy is the shapes, the arrows that run between two of them (an arrow
  // with only one end in the copy has nowhere to go), and each shape's own
  // look off the Style side.  It is kept in the browser's storage as well as
  // here, so a piece of one chart can be pasted into another tab's.
  var CLIP_KEY = "flowchart-hand-clip";
  var clipHeld = null;                   // for when storage will not keep it
  var pasteRound = { stamp: 0, n: 0 };   // which copy of the same clip is next

  function clipOf(ids) {
    return {
      what: "flowchart-shapes", stamp: Date.now(),
      nodes: hand.nodes.filter(function (n) { return ids.indexOf(n.id) >= 0; })
        .map(function (n) {
          var one = JSON.parse(JSON.stringify(n));
          var look = style.nodes["h" + n.id];
          if (look && Object.keys(look).length) { one.look = JSON.parse(JSON.stringify(look)); }
          return one;
        }),
      links: hand.links.filter(function (l) {
        return ids.indexOf(l.from) >= 0 && ids.indexOf(l.to) >= 0;
      }).map(function (l) {
        var one = JSON.parse(JSON.stringify(l));
        delete one.id;                   // each pasted arrow is numbered afresh
        return one;
      })
    };
  }

  function clipNow() {
    try {
      var kept = JSON.parse(localStorage.getItem(CLIP_KEY) || "null");
      if (kept && kept.what === "flowchart-shapes" && kept.nodes && kept.nodes.length) {
        return kept;
      }
    } catch (e) { /* storage turned off: the copy made here, then */ }
    return clipHeld;
  }

  // Copied, and -- cut -- taken off the paper as well.
  function copyShapes(ids, cut) {
    if (!ids.length) { return false; }
    var clip = clipOf(ids);
    clip.cut = !!cut;
    clipHeld = clip;
    try { localStorage.setItem(CLIP_KEY, JSON.stringify(clip)); }
    catch (e) { /* kept here only, which is this tab */ }
    if (cut) {
      keepUndo();
      dropShapes(ids);
      drawHand();
      drawHandPanel();
      showReport();
    }
    return true;
  }

  // Put copies down, moved by dx, dy from where the originals stood, and
  // take them up -- so the next thing done is done to the copies.
  function placeCopies(clip, dx, dy) {
    keepUndo();
    clip.nodes.forEach(function (one) {  // none above the top of the paper
      dy = Math.max(dy, turned(one).h / 2 + 20 - one.y);
    });
    var to = {}, made = [], looked = false;
    clip.nodes.forEach(function (one) {
      var node = JSON.parse(JSON.stringify(one));
      var look = node.look;
      delete node.look;
      node.id = hand.next++;
      node.x += dx;
      node.y += dy;
      hand.nodes.push(node);
      if (look) { style.nodes["h" + node.id] = JSON.parse(JSON.stringify(look)); looked = true; }
      to[one.id] = node.id;
      made.push(node.id);
    });
    clip.links.forEach(function (one) {
      var link = JSON.parse(JSON.stringify(one));
      link.from = to[link.from];
      link.to = to[link.to];
      if (link.from && link.to) { hand.links.push(link); }
    });
    takeUp(made);
    drawHand();
    drawHandPanel();
    showReport();
    if (looked) { keep(); }              // their colors are the chart's now too
    return made;
  }

  // The box round a copy's shapes, on the design.
  function clipBox(nodes) {
    var box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    nodes.forEach(function (n) {
      var t = turned(n);
      box.x0 = Math.min(box.x0, t.x - t.w / 2); box.x1 = Math.max(box.x1, t.x + t.w / 2);
      box.y0 = Math.min(box.y0, t.y - t.h / 2); box.y1 = Math.max(box.y1, t.y + t.h / 2);
    });
    return box;
  }

  // What part of the design the stage is showing.
  function viewOnDesign() {
    var stage = el("#stage");
    if (!stage || !chart) { return null; }
    var s = stage.getBoundingClientRect();
    var a = onPaper({ clientX: s.left, clientY: s.top });
    var b = onPaper({ clientX: s.right, clientY: s.bottom });
    return a && b ? { x0: a.x, y0: a.y, x1: b.x, y1: b.y } : null;
  }

  // Pasted a step down and across from the last paste of the same copy, so
  // one paste never lands exactly on another -- except the first paste of
  // something cut, which goes back where it came from.  Asked for at a spot
  // (the menu on the paper), it goes there instead.  And wherever it would
  // go, if that is nowhere the stage is showing, it comes to the middle of
  // what is: a paste nobody can see looks like a paste that did not work.
  function pasteShapes(spot) {
    var clip = clipNow();
    if (!clip || !clip.nodes || !clip.nodes.length) { return false; }
    if (pasteRound.stamp !== clip.stamp) {
      pasteRound = { stamp: clip.stamp, n: clip.cut ? -1 : 0 };
    }
    pasteRound.n++;
    var box = clipBox(clip.nodes);
    var midX = (box.x0 + box.x1) / 2, midY = (box.y0 + box.y1) / 2;
    var dx = pasteRound.n * HAND_RULE, dy = pasteRound.n * HAND_RULE;
    var view = spot ? null : viewOnDesign();
    if (spot) {
      dx = spot.x - midX;
      dy = spot.y - midY;
    } else if (view && (box.x1 + dx < view.x0 || box.x0 + dx > view.x1 ||
                        box.y1 + dy < view.y0 || box.y0 + dy > view.y1)) {
      dx = (view.x0 + view.x1) / 2 - midX;
      dy = (view.y0 + view.y1) / 2 - midY;
    }
    dx = Math.round(dx / HAND_GRID) * HAND_GRID;
    dy = Math.round(dy / HAND_GRID) * HAND_GRID;
    placeCopies(clip, dx, dy);
    return true;
  }

  // Another of each, beside them, and the clipboard left as it was.
  function duplicateShapes(ids) {
    if (!ids.length) { return; }
    placeCopies(clipOf(ids), 30, 30);
  }

  function selectAll() {
    takeUp(hand.nodes.map(function (n) { return n.id; }));
    drawHand();
    drawHandPanel();
  }

  // --------------------------------------------- what can be done to them --
  // The right button on any of them: the same things as for one shape, done
  // to them all -- their colors included, since recoloring a whole branch
  // one shape at a time is most of what taking several up is for.
  function groupMenu(x, y) {
    var ids = many.slice();
    function shared(key) {                // what they all have, if they agree
      var first = (style.nodes["h" + ids[0]] || {})[key];
      return ids.every(function (id) {
        return (style.nodes["h" + id] || {})[key] === first;
      }) ? first : undefined;
    }
    function allPaint(key, name, fallback) {
      var first = true;
      return paintRow(name, shared(key), fallback, function (v) {
        if (first) { first = false; keepUndo(); }   // one step for one choice
        ids.forEach(function (id) {
          var mine = style.nodes["h" + id] = style.nodes["h" + id] || {};
          mine[key] = v;
        });
        paint();
        keep();
      });
    }
    openMenu(x, y, [
      { name: TXT.m_clip_copy, go: function () { copyShapes(ids); } },
      { name: TXT.m_clip_cut, go: function () { copyShapes(ids, true); } },
      { name: TXT.m_copy, go: function () { duplicateShapes(ids); } },
      "-",
      allPaint("fill", TXT.c_fill || "Fill", "#ffffff"),
      allPaint("line", TXT.c_line || "Border", style.ink || "#000000"),
      allPaint("text", TXT.c_words || "Words", style.words || style.ink || "#000000"),
      "-",
      { name: TXT.delete, go: function () {
          keepUndo();
          dropShapes(ids);
          drawHand(); drawHandPanel(); showReport();
        } }
    ]);
  }

  // And in the panel, where one shape's words and sizes would be.
  function groupPanel(box) {
    var head = document.createElement("div");
    head.className = "what";
    head.style.cssText = "font-weight:600; margin:10px 0 6px";
    head.textContent = say("many_head", { n: many.length });
    box.appendChild(head);
    var hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = TXT.many_hint;
    box.appendChild(hint);
    var go = document.createElement("div");
    go.style.cssText = "display:flex; gap:8px; margin-top:10px; flex-wrap:wrap";
    [[TXT.m_clip_copy, function () { copyShapes(many.slice()); }],
     [TXT.m_copy, function () { duplicateShapes(many.slice()); }],
     [TXT.delete, function () {
        keepUndo();
        dropShapes(many.slice());
        drawHand(); drawHandPanel(); showReport();
      }]].forEach(function (pair) {
      var b = document.createElement("button");
      b.className = "btn small";
      b.textContent = pair[0];
      b.onclick = pair[1];
      go.appendChild(b);
    });
    box.appendChild(go);
  }

  // ------------------------------------------------ moving about the paper --
  // Dragging across bare paper draws a box now, where it used to scroll the
  // view.  So moving about is done as it is in every drawing program: hold
  // the Space bar and drag, or drag with the wheel pressed in -- anywhere,
  // shapes included.  Dragging the stage round the paper still scrolls, and
  // so do the wheel and the bars.  Only by hand: from pseudocode a plain
  // drag has always moved about, and still does.
  var spaceHeld = false;

  // Space means this only with nothing else to press: in a box it is a
  // space, and on a button it is the button.
  function spaceIsOurs() {
    var on = document.activeElement;
    return !on || on === document.body || on === document.documentElement ||
           !!(el("#stage") && el("#stage").contains(on));
  }

  (function () {
    var stage = el("#stage");
    if (!stage) { return; }
    function spaceUp() {
      spaceHeld = false;
      stage.classList.remove("can-pan");
    }
    window.addEventListener("keydown", function (ev) {
      if (ev.key !== " " || !byHand || !spaceIsOurs() || typingNow()) { return; }
      ev.preventDefault();               // or the page scrolls a screenful
      if (!spaceHeld) { spaceHeld = true; stage.classList.add("can-pan"); }
    });
    window.addEventListener("keyup", function (ev) { if (ev.key === " ") { spaceUp(); } });
    window.addEventListener("blur", spaceUp);

    // Caught on the way down, before a shape or the box above can take it.
    stage.addEventListener("pointerdown", function (ev) {
      if (!byHand || !(ev.button === 1 || (ev.button === 0 && spaceHeld))) { return; }
      ev.preventDefault();               // and no scrolling by itself on the wheel
      ev.stopPropagation();
      glideStop();
      var fromX = ev.clientX, fromY = ev.clientY;
      var wasL = stage.scrollLeft, wasT = stage.scrollTop, wasX = holdX, wasY = holdY;
      try { stage.setPointerCapture(ev.pointerId); } catch (e) { /* mouse: fine */ }
      stage.classList.add("grabbing");
      function move(e) {
        if (loose) {
          holdX = wasX + (e.clientX - fromX);
          holdY = wasY + (e.clientY - fromY);
          holdClamp();
        } else {
          stage.scrollLeft = wasL - (e.clientX - fromX);
          stage.scrollTop = wasT - (e.clientY - fromY);
        }
      }
      function done() {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", done);
        window.removeEventListener("pointercancel", done);
        stage.classList.remove("grabbing");
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", done);
      window.addEventListener("pointercancel", done);
    }, true);
    // A wheel pressed in on Windows starts the browser's own scrolling,
    // which would run on under the drag; that is its mouse press.
    stage.addEventListener("mousedown", function (ev) {
      if (byHand && ev.button === 1) { ev.preventDefault(); }
    }, true);
  })();
