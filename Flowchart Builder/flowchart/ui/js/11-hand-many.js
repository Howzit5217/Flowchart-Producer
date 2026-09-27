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
  // it that way too: drag across empty paper and every shape mostly inside
  // the box is taken up; Shift or Ctrl and a click takes one more up, or
  // lets one go; Ctrl+A takes up the lot.  Take hold of any of them and they
  // all move, and Ctrl+C, Ctrl+X and Ctrl+V copy, cut and paste them --
  // with the arrows between them, and with the colors each was given.
  //
  // What is taken up is `many` (10-hand.js), two or more shapes' numbers.
  // One shape is still `picked`, with its dots and corners and its own
  // panel, as it always was; the two are never both in use at once.

  // Asked for every shape and arrow drawn, so it is looked up rather than
  // searched for: `many` is only ever replaced, never changed in place.
  var manySeen = { list: null, size: -1, has: {} };
  function inMany(id) {
    if (manySeen.list !== many || manySeen.size !== many.length) {
      var has = {};
      many.forEach(function (one) { has[typeof one + ":" + one] = true; });
      manySeen = { list: many, size: many.length, has: has };
    }
    return manySeen.has[typeof id + ":" + id] === true;
  }

  // What is taken up, whichever way: the several, the one, or nothing.
  function takenIds() {
    if (many.length > 1) { return many.slice(); }
    return picked ? [picked] : [];
  }

  // Take up exactly these.  One of them is the ordinary picked shape; two or
  // more are taken up together; none is nothing in hand at all.
  function takeUp(ids) {
    var mine = [], had = {};
    ids.forEach(function (id) {
      var key = typeof id + ":" + id;
      if (!had[key] && nodeById(id)) { had[key] = true; mine.push(id); }
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
  // mouse, and every shape mostly inside it lights up as it comes in.  Let
  // go, and those are taken up -- added to what was taken up already, if
  // Shift or Ctrl is held.  A press let go where it was is still a click on
  // the paper (or on the arrow under it), and does what a click did.
  //
  // Which drag this is depends on the tool in the foot bar.  With Move --
  // how the page starts -- a drag on bare paper moves about it, as it always
  // did, and only Shift or Ctrl makes it a box.  With Select, a plain drag
  // is a box, a finger's too; a touch screen has no Shift to hold.
  var lassoDone = false;                 // the click that ends a box is no click
  var toolBusy = false;                  // a drag that lent a tool is going

  // "Inside" is only a little of the way in, not all of it: a shape was left
  // out for a corner the box fell a few pixels short of, so boxing a row
  // meant overshooting every edge of it.  It was most of the way in (three
  // fifths) for a while, and that still meant dragging well over every
  // shape; asked for again (2026-09-26), a box that reaches a little way
  // into a shape takes it -- a sixth or so of it, as it stands, turned or
  // not -- while one that only grazes a neighbour's edge leaves it out.
  var BOX_COVER = 0.15;

  function mostlyIn(n, x0, x1, y0, y1) {
    var t = turned(n);
    var l = t.x - t.w / 2, r = t.x + t.w / 2, top = t.y - t.h / 2, foot = t.y + t.h / 2;
    var w = Math.min(r, x1) - Math.max(l, x0), h = Math.min(foot, y1) - Math.max(top, y0);
    if (w <= 0 || h <= 0) { return false; }
    return w * h >= BOX_COVER * t.w * t.h;
  }

  function lasso(svg) {
    svg.addEventListener("pointerdown", function (ev) {
      lassoDone = false;
      if (ev.button || pinched) { return; }
      var boxing = handTool === "select";
      if (!boxing && (ev.pointerType === "touch" ||
                      !(ev.shiftKey || ev.ctrlKey || ev.metaKey))) { return; }
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
          if (!boxing) {                  // a key made it a box: Select, for now
            toolBusy = true;
            lendTool("select");
          }
        }
        var x0 = Math.min(from.x, here.x), x1 = Math.max(from.x, here.x);
        var y0 = Math.min(from.y, here.y), y1 = Math.max(from.y, here.y);
        frame.setAttribute("x", (x0 + handOrigin.x).toFixed(1));
        frame.setAttribute("y", (y0 + handOrigin.y).toFixed(1));
        frame.setAttribute("width", (x1 - x0).toFixed(1));
        frame.setAttribute("height", (y1 - y0).toFixed(1));
        inside = hand.nodes.filter(function (n) {
          return mostlyIn(n, x0, x1, y0, y1);
        }).map(function (n) { return n.id; });
        all(".node[data-i]", svg).forEach(function (g) {
          var id = +g.dataset.i.slice(1);
          var on = had.indexOf(id) >= 0 || inside.indexOf(id) >= 0;
          if (g.classList.contains("on") !== on) { g.classList.toggle("on", on); }
        });
      }
      function move(e) {
        if (pinched || heldLong || e.pointerId !== ev.pointerId) { return; }
        at = { x: e.clientX, y: e.clientY };
        reach();
        if (frame) { chase(at, reach); }   // out past the edge, the view follows
      }
      function drop(e) {
        if (e && e.pointerId !== ev.pointerId) { return; }
        chaseStop();
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", drop);
        window.removeEventListener("pointercancel", drop);
        if (!frame) { return; }            // no box: the click says what it was
        frame.remove();
        svg.classList.remove("lassoing");
        lassoDone = true;
        // the key already let go of while the box was drawn: Move again now
        if (toolBusy) { dragLent(e); }
        // A second finger made it a pinch, and a pinch chooses nothing.
        if (pinched || heldLong) { drawHand(); return; }
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
  // stopping on its own and the lot squashing flat.  Over other shapes as
  // it goes: let go, the lot is moved clear of them together (settleClear,
  // 13-hand-apart.js).
  function carryCrowd(crowd, held, wasX, wasY, dx, dy) {
    var ids = crowd.map(function (c) { return c.node.id; });
    held.x = Math.round((wasX + dx) / HAND_GRID) * HAND_GRID;
    held.y = Math.round((wasY + dy) / HAND_GRID) * HAND_GRID;
    lineUp(held, ids);
    var byX = held.x - wasX, byY = held.y - wasY;
    crowd.forEach(function (c) {
      byY = Math.max(byY, turned(c.node).h / 2 + 20 - c.y);
    });
    crowd.forEach(function (c) {
      c.node.x = c.x + byX;
      c.node.y = c.y + byY;
    });
  }

  // An arrow key moves the lot a step, as it moves one shape -- and not
  // onto anything outside the lot.
  function nudgeMany(ids, dx, dy) {
    var lot = crowdOf(ids), near = shapesNear(ids);   // 10-hand.js
    lot.forEach(function (c) { dy = Math.max(dy, turned(c.node).h / 2 + 20 - c.y); });
    function hits(x, y) {
      return lot.some(function (c) { return near.meets(c.node, c.x + x, c.y + y, SHAPE_GAP); });
    }
    if (hits(dx, dy) && !hits(0, 0)) { return; }
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
  var pasteRound = { stamp: 0, last: null };   // where the last paste of this clip went

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
    } else {
      drawSelBar();                      // it has something to paste now
    }
    return true;
  }

  // A copy of everything, pasted, doubles the chart: Ctrl+A, Ctrl+C, Ctrl+V
  // a dozen times over is tens of thousands of shapes, which no page can
  // draw, keep or step back through.  So copies stop going down past this
  // many shapes, and the check's list says why.
  var MOST_SHAPES = 2000;
  function tooManyShapes() {
    var box = el("#report");
    if (!box) { return; }
    var line = el(".too-many", box) || document.createElement("p");
    line.className = "hint bad too-many";
    line.textContent = say("h_too_many", { n: MOST_SHAPES });
    box.insertBefore(line, box.firstChild);
  }

  // Put copies down, moved by dx, dy from where the originals stood, and
  // take them up -- so the next thing done is done to the copies.  Landing
  // on something, they go on along `way` (moveClear) if one is given.
  function placeCopies(clip, dx, dy, way) {
    if (hand.nodes.length + clip.nodes.length > MOST_SHAPES) {
      tooManyShapes();
      return [];
    }
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
    // Landing on anything, the copies go on together to the nearest place
    // clear of it all (13-hand-apart.js).
    made.forEach(function (id) { measure(nodeById(id)); });
    moveClear(made, way);
    takeUp(made);
    drawHand();
    drawHandPanel();
    showReport();
    if (looked) { keep(); }              // their colors are the chart's now too
    copiesInSight(made);
    return made;
  }

  // Moved clear of everything, a big copy can end up further off than the
  // stage reaches -- below the whole chart, when nowhere nearer is clear --
  // and a paste nobody can see looks like one that did not work, and gets
  // pressed again.  So if none of it is showing, the view goes to it: its
  // first shape to the middle of the stage, the stage scrolled -- or,
  // Unlocked, the chart carried (holdBy, 06-chart.js).
  function copiesInSight(made) {
    var view = viewOnDesign(), nodes = made.map(nodeById).filter(Boolean);
    var stage = el("#stage");
    if (!view || !nodes.length || !stage) { return; }
    var box = clipBox(nodes);
    if (box.x1 >= view.x0 && box.x0 <= view.x1 && box.y1 >= view.y0 && box.y0 <= view.y1) { return; }
    var g = chart && el('.node[data-i="h' + nodes[0].id + '"]', chart);
    if (!g) { return; }
    var s = stage.getBoundingClientRect(), r = g.getBoundingClientRect();
    var dx = r.left + r.width / 2 - (s.left + s.width / 2);
    var dy = r.top + r.height / 2 - (s.top + s.height / 2);
    if (loose) { holdBy(-dx, -dy); }
    else { stage.scrollLeft += dx; stage.scrollTop += dy; }
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

  // Copies go in a row, to the right: the first beside what was copied, each
  // after it beside the paste before, their tops level -- and, landing on
  // something, on along the row till clear (moveClear), never off wherever
  // happened to be nearest.  The first paste of something cut goes back
  // where it came from.  Asked for at a spot (the menu on the paper), it
  // goes there, and the row goes on from there.  A row running off the
  // stage is followed (copiesInSight); but if the last paste -- or, the
  // first time, what was copied -- is nowhere the stage is showing, the
  // view was taken elsewhere, and the row starts again in the middle of it.
  function rowStep(box) {
    return Math.ceil((box.x1 - box.x0 + HAND_RULE * 2) / HAND_GRID) * HAND_GRID;
  }

  function pasteShapes(spot) {
    var clip = clipNow();
    if (!clip || !clip.nodes || !clip.nodes.length) { return false; }
    var box = clipBox(clip.nodes);
    var step = rowStep(box);
    if (pasteRound.stamp !== clip.stamp) {
      pasteRound = { stamp: clip.stamp, last: null };
    }
    // where the row goes on from: the last paste, or else the originals
    var from = pasteRound.last || box;
    var dx = from.x0 - box.x0 + step, dy = from.y0 - box.y0;
    if (!pasteRound.last && clip.cut) { dx = 0; dy = 0; }
    var view = spot ? null : viewOnDesign();
    if (spot) {
      dx = spot.x - (box.x0 + box.x1) / 2;
      dy = spot.y - (box.y0 + box.y1) / 2;
    } else if (view && (from.x1 < view.x0 || from.x0 > view.x1 ||
                        from.y1 < view.y0 || from.y0 > view.y1)) {
      dx = (view.x0 + view.x1) / 2 - (box.x0 + box.x1) / 2;
      dy = (view.y0 + view.y1) / 2 - (box.y0 + box.y1) / 2;
    }
    dx = Math.round(dx / HAND_GRID) * HAND_GRID;
    dy = Math.round(dy / HAND_GRID) * HAND_GRID;
    var made = placeCopies(clip, dx, dy, [step, 0]);
    if (made.length) {
      // where the originals' corner went, so the next is beside this one
      // even if this one was moved on along the row
      var one = nodeById(made[0]), was = clip.nodes[0];
      var mx = one.x - was.x, my = one.y - was.y;
      pasteRound.last = { x0: box.x0 + mx, y0: box.y0 + my, x1: box.x1 + mx, y1: box.y1 + my };
    }
    return true;
  }

  // Another of each, beside them in a row to the right, and the clipboard
  // left as it was.
  function duplicateShapes(ids) {
    if (!ids.length) { return; }
    var clip = clipOf(ids), step = rowStep(clipBox(clip.nodes));
    placeCopies(clip, step, 0, [step, 0]);
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
      { icon: "copy", name: TXT.m_clip_copy, keys: keyHint(["ctrl", "C"]),
        go: function () { copyShapes(ids); } },
      { icon: "cut", name: TXT.m_clip_cut, keys: keyHint(["ctrl", "X"]),
        go: function () { copyShapes(ids, true); } },
      { icon: "another", name: TXT.m_copy, keys: keyHint(["ctrl", "D"]),
        go: function () { duplicateShapes(ids); } },
      "-",
      // lining them up and coloring them in, a menu each beside this one
      { icon: "lineup", name: TXT.hl_head,
        sub: function () { return [lineUpTools(ids)]; } },   // 13-hand-more.js
      { icon: "colors", name: TXT.m_colors, sub: function () {
          return [
            allPaint("fill", TXT.c_fill || "Fill", "#ffffff"),
            allPaint("line", TXT.c_line || "Border", style.ink || "#000000"),
            allPaint("text", TXT.c_words || "Words", style.words || style.ink || "#000000")
          ];
        } },
      "-",
      { icon: "drop", name: TXT.delete, danger: true, go: function () {
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
    box.appendChild(lineUpRow(many.slice()));   // 13-hand-more.js
  }

  // ------------------------------------------------------------ two tools --
  // Move and Select, side by side in the foot bar while drawing by hand.
  // A drag across bare paper can only be one thing: moving about the paper,
  // which is what it always was and what the page starts with, or drawing a
  // box to take shapes up.  With a mouse, Shift or Ctrl makes a box under
  // Move, so the tool hardly matters; on a touch screen it is the only way
  // to choose, so it is said in the page rather than kept in a key.  Under
  // Select a tap on a shape adds it to those taken up, or lets it go,
  // which is what Shift and a click do with a mouse.
  var handTool = "move";
  try { if (localStorage.getItem("flowchart-tool") === "select") { handTool = "select"; } }
  catch (e) { /* storage turned off: Move, as the page starts */ }

  function setTool(which) {
    toolLent = "";
    handTool = which === "select" ? "select" : "move";
    showTool(handTool);
    try { localStorage.setItem("flowchart-tool", handTool); } catch (e) { /* fine */ }
  }

  // The foot bar lit, and the paper's cursor, for a tool.
  function showTool(which) {
    document.body.classList.toggle("tool-select", which === "select");
    [["#tool-move", "move"], ["#tool-select", "select"]].forEach(function (pair) {
      var b = el(pair[0]);
      if (!b) { return; }
      b.classList.toggle("on", which === pair[1]);
      b.setAttribute("aria-pressed", which === pair[1] ? "true" : "false");
    });
  }

  // A key can lend the other tool for as long as it is held.  Ctrl (or
  // Shift, or Cmd) and a box drawn under Move is selecting, so the foot bar
  // says Select and the cursor is Select's; Ctrl and a shape dragged under
  // Select is moving (06-chart.js), so it says Move.  Let go of the key once
  // the drag is done and the chosen tool comes back.  Only lent: the lent
  // one pressed while it is lent is chosen, and kept (asked for, 2026-09-26).
  var toolLent = "";                     // the tool a key has lent, if any

  function lendTool(which) {
    if (handTool === which || toolLent) { return; }
    toolLent = which;
    showTool(which);
  }

  function giveToolBack() {
    if (!toolLent) { return; }
    toolLent = "";
    showTool(handTool);
  }

  // The drag that borrowed it is over: given back, unless the key is still
  // down, and then when it comes up.
  function dragLent(e) {
    toolBusy = false;
    if (!(e && (e.shiftKey || e.ctrlKey || e.metaKey))) { giveToolBack(); }
  }

  if (el("#tool-move")) {
    el("#tool-move").onclick = function () { setTool("move"); };
    el("#tool-select").onclick = function () { setTool("select"); };
    setTool(handTool);
  }
  window.addEventListener("keyup", function (ev) {
    if (toolLent && !toolBusy && !(ev.shiftKey || ev.ctrlKey || ev.metaKey)) { giveToolBack(); }
  });
  // (a key let go of in another window never comes up here)
  window.addEventListener("blur", function () { if (!toolBusy) { giveToolBack(); } });

  // ------------------------------------------------ moving about the paper --
  // Besides a plain drag under Move, the way every drawing program has: hold
  // the Space bar and drag, or drag with the wheel pressed in -- anywhere,
  // shapes included, and under either tool.  Dragging the stage round the
  // paper scrolls too, and so do the wheel and the bars.  Only by hand: from
  // pseudocode a plain drag has always moved about, and still does.
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

  // A press that turned out to be something else -- a drag about the paper,
  // a long press for a menu -- can still end in a click where it lifts,
  // which would pick or let go of whatever is under it.  That one click is
  // eaten -- only that one: a click from a press or a finger, straight
  // after, and never one made by a key or by the page itself, which no
  // press comes before to call the eating off.
  var clickEaten = 0;                    // when it was asked for
  function eatClick() { clickEaten = Date.now(); }
  document.addEventListener("pointerdown", function () { clickEaten = 0; }, true);
  document.addEventListener("click", function (ev) {
    var due = clickEaten && Date.now() - clickEaten < 800;
    clickEaten = 0;
    if (!due || !ev.isTrusted || !ev.detail) { return; }
    if (ev.target.closest && ev.target.closest(".menu, .colorpop")) { return; }
    ev.stopPropagation();
    ev.preventDefault();
  }, true);

  // ------------------------------------------- one finger on a touch screen --
  // The chart takes every touch on it for itself (touch-action: none), so a
  // finger can carry a shape and two can zoom -- which left one finger on
  // bare paper doing nothing at all: on a phone, the only way about a chart
  // was with two.  Now one finger anywhere on the paper that is not taking
  // hold of something moves about it, from pseudocode too; and a flick
  // carries on a little way after the finger lifts, the way everything else
  // on a phone does.  Under Select, one finger draws a box instead, and two
  // move about.  Unlocked, a finger already carries the chart (06-chart.js).
  (function () {
    var stage = el("#stage");
    if (!stage) { return; }
    var coast = 0;
    stage.addEventListener("pointerdown", function (ev) {
      if (coast) { cancelAnimationFrame(coast); coast = 0; }   // a finger stops it
      if (ev.pointerType !== "touch" || ev.button || pinched || loose) { return; }
      var paper = el("#chart");
      if (!paper || !paper.contains(ev.target)) { return; }   // round it, the stage scrolls
      if (byHand && (handTool === "select" ||
                     (ev.target.closest && ev.target.closest(".node, .knob, .spot, .grip")))) {
        return;
      }
      glideStop();
      var fromX = ev.clientX, fromY = ev.clientY;
      var wasL = stage.scrollLeft, wasT = stage.scrollTop;
      var going = false, trail = [];
      function place(dx, dy) {
        stage.scrollLeft = wasL - dx;
        stage.scrollTop = wasT - dy;
      }
      function move(e) {
        if (e.pointerId !== ev.pointerId) { return; }
        if (pinched || heldLong) { done(); return; }   // a pinch, or a menu, took it
        var dx = e.clientX - fromX, dy = e.clientY - fromY;
        if (!going && Math.abs(dx) + Math.abs(dy) < 8) { return; }
        going = true;
        place(dx, dy);
        trail.push([performance.now(), dx, dy]);
        if (trail.length > 6) { trail.shift(); }
      }
      function done(e) {
        if (e && e.pointerId !== ev.pointerId) { return; }
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", done);
        window.removeEventListener("pointercancel", done);
        if (!going) { return; }
        eatClick();                      // the lift after a drag is not a tap
        var a = trail[0], b = trail[trail.length - 1];
        var dt = b && a ? b[0] - a[0] : 0;
        if (!e || e.type !== "pointerup" || pinched || STILL || dt <= 0 ||
            performance.now() - b[0] > 80) { return; }
        var vx = (b[1] - a[1]) / dt, vy = (b[2] - a[2]) / dt;   // pixels a millisecond
        var dx = b[1], dy = b[2], last = performance.now();
        (function glide(now) {
          var step = Math.min(40, (now || performance.now()) - last);
          last = now || performance.now();
          vx *= Math.pow(0.994, step);
          vy *= Math.pow(0.994, step);
          if (Math.abs(vx) + Math.abs(vy) < 0.02) { coast = 0; return; }
          dx += vx * step;
          dy += vy * step;
          place(dx, dy);
          coast = requestAnimationFrame(glide);
        })(last);
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", done);
      window.addEventListener("pointercancel", done);
    });
  })();

  // ------------------------------------------------------- a long press --
  // What the right button does with a mouse, a finger held still does on a
  // touch screen: the menu for the shape, the arrow or the paper under it.
  // Some phones say a long press is a right click and some say nothing, so
  // it is timed here; where the phone says so as well (chart.oncontextmenu),
  // that is taken as this same press, not a second one.
  var heldLong = false;                  // this press opened a menu: it is done
  var pressTimer = 0, pressMenuAt = 0, touchIsDown = false;
  var HOLD_MS = 520;

  function pressHold(svg) {
    svg.addEventListener("pointerdown", function (ev) {
      heldLong = false;
      clearTimeout(pressTimer);
      if (ev.pointerType !== "touch" || ev.button) { return; }
      if (ev.target.closest && ev.target.closest(".knob, .spot, .grip")) { return; }
      touchIsDown = true;
      var x = ev.clientX, y = ev.clientY, under = ev.target;
      function stop(e) {
        if (e && e.pointerId !== ev.pointerId) { return; }
        clearTimeout(pressTimer);
        window.removeEventListener("pointermove", moved);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
        touchIsDown = false;
        if (heldLong) { eatClick(); }      // however long it was held, the lift is no tap
      }
      function moved(e) {
        if (e.pointerId !== ev.pointerId) { return; }
        if (pinched || Math.abs(e.clientX - x) + Math.abs(e.clientY - y) > 10) {
          clearTimeout(pressTimer);
        }
      }
      pressTimer = setTimeout(function () {
        if (pinched) { return; }
        heldLong = true;
        eatClick();
        pressMenuAt = Date.now();
        menuAt(under, x, y);
      }, HOLD_MS);
      window.addEventListener("pointermove", moved);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
    });
  }

  // The phone's own long press, heard as a right click: the same press as
  // the one being timed, so it is not timed any further.
  function pressTaken() {
    if (!touchIsDown) { return; }
    clearTimeout(pressTimer);
    heldLong = true;
    eatClick();
    pressMenuAt = Date.now();
  }

  // The menu for whatever is at a point: a shape, an arrow (or near enough
  // to one), or the bare paper.
  function menuAt(under, x, y) {
    var g = under && under.closest ? under.closest(".node") : null;
    var arrow = under && under.closest ? under.closest(".link") : null;
    if (g) {
      var node = nodeById(+g.dataset.i.slice(1));
      if (node) { shapeMenu(node, x, y); }
      return;
    }
    var link = arrow ? linkById(+arrow.dataset.link) : null;
    if (!link) {
      var spot = onPaper({ clientX: x, clientY: y });
      link = spot && linkNear(spot.x, spot.y, 24);
    }
    if (link) { arrowMenu(link, x, y); } else { paperMenu(x, y); }
  }

  // ---------------------------------------------------------- the bar --
  // What can be done to what is taken up, in a row of buttons over the foot
  // of the paper.  With a mouse and a keyboard all of it is on the right
  // button and the keys as well; on a phone there are no keys and no right
  // button, and the panel that has the rest lies over the very chart it is
  // about.  So the things done most -- write in it, join it up, copy, cut,
  // paste, another like it, delete -- are here, where the thumb is.
  var TOUCHY = (function () {
    try { return matchMedia("(any-pointer: coarse)").matches; }
    catch (e) { return false; }
  })();
  var BAR_ICONS = {
    type: '<path d="M4 16l.9-3.6 8.4-8.4 2.7 2.7-8.4 8.4z"/><path d="M11.6 5.7l2.7 2.7"/>',
    join: '<circle cx="4.5" cy="10" r="2"/><path d="M6.5 10h9M12.5 7l3 3-3 3"/>',
    copy: '<rect x="7" y="7" width="9" height="9" rx="1.5"/>' +
          '<path d="M4.5 12.5v-7a1.5 1.5 0 0 1 1.5-1.5h7"/>',
    cut: '<circle cx="6" cy="14.5" r="2.2"/><circle cx="14" cy="14.5" r="2.2"/>' +
         '<path d="M7.4 12.8 14 4M12.6 12.8 6 4"/>',
    paste: '<rect x="4.5" y="4.5" width="11" height="12" rx="1.5"/>' +
           '<path d="M7.5 4.5V3.2h5v1.3M7.5 9h5M7.5 12h3"/>',
    another: '<rect x="3.5" y="3.5" width="13" height="13" rx="2"/><path d="M10 7v6M7 10h6"/>',
    drop: '<path d="M4 6h12M8 6V4h4v2M5.8 6l.9 10h6.6l.9-10"/>',
    all: '<rect x="3" y="3" width="14" height="14" rx="1.5" stroke-dasharray="2.4 2"/>',
    turn: '<path d="M4 7.5h11l-3-3M16 12.5H5l3 3"/>'
  };

  function drawSelBar() {
    var stage = el("#stage");
    if (!stage) { return; }
    var bar = el("#sel-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "sel-bar";
      bar.className = "sel-bar";
      bar.setAttribute("role", "toolbar");
      stage.parentNode.appendChild(bar);   // over the stage, not scrolled with it
    }
    bar.setAttribute("aria-label", TXT.sel_bar || "");
    var items = [];
    function add(icon, name, go) { items.push([icon, name, go]); }
    var lot = byHand ? takenIds() : [], link = byHand ? linkById(chosen) : null;
    var canPaste = byHand && !!clipNow();
    if (link) {
      add("type", TXT.m_type, function () { typeOnLink(link); });
      add("turn", TXT.turn_it_round, function () {
        keepUndo();
        turnLink(link);
        drawHand(); drawHandPanel(); showReport();
      });
      add("drop", TXT.delete, function () {
        keepUndo();
        hand.links = hand.links.filter(function (l) { return l !== link; });
        chosen = null;
        drawHand(); drawHandPanel(); showReport();
      });
    } else if (lot.length) {
      if (lot.length === 1) {
        add("type", TXT.m_type, function () {
          var g = el('.node[data-i="h' + lot[0] + '"]', el("#chart"));
          if (g) { typeInto(g); }
        });
        add("join", TXT.connect, function () {
          joining = true; joinFrom = null;
          drawHand(); drawHandPanel();
        });
      }
      add("copy", TXT.m_clip_copy, function () { copyShapes(lot); });
      add("cut", TXT.m_clip_cut, function () { copyShapes(lot, true); });
      if (canPaste) { add("paste", TXT.m_clip_paste, function () { pasteShapes(); }); }
      add("another", TXT.m_copy, function () { duplicateShapes(lot); });
      add("drop", TXT.delete, function () {
        keepUndo();
        dropShapes(lot);
        drawHand(); drawHandPanel(); showReport();
      });
    } else if (canPaste && TOUCHY) {
      // nothing taken up, but something copied, on a screen with no keys
      add("paste", TXT.m_clip_paste, function () { pasteShapes(); });
      add("all", TXT.m_all, selectAll);
    }
    bar.hidden = !items.length;
    bar.innerHTML = "";
    items.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "bar-btn";
      b.title = item[1];
      b.setAttribute("aria-label", item[1]);
      b.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true">' + BAR_ICONS[item[0]] +
                    "</svg><span></span>";
      b.lastChild.textContent = item[1];
      b.onclick = function (ev) { ev.stopPropagation(); item[2](); };
      bar.appendChild(b);
    });
  }
