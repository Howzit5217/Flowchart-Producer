// ---------------------------------------------------------------------------
//  04-panel.js -- the Style side: the palette, the words, the shape rows,
//                 and the selected shape
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A color picker being dragged says so many times a second, and every
  // one of those is a live preview: the chart takes the color at the next
  // frame and nothing else happens.  Anything that has to put a piece of
  // the panel up again waits for onDone -- the picker being let go of --
  // because rebuilding rows in the middle of a drag takes them out from
  // under the hand that is dragging, and costs more than the painting did.
  function swatch(value, fallback, onPick, onDone) {
    var input = document.createElement("input");
    input.type = "color";
    input.className = "swatch";
    input.value = value || fallback;
    // One drag of a picker is one thing done, not the sixty the picker
    // reports on the way to it, so the copy to step back to is taken once:
    // before the first of those changes anything.  Starting again is
    // noticed at the picker being opened as well as at its being let go
    // of, because a picker closed without choosing need not say so.
    var started = false;
    input.onfocus = function () { started = false; };
    input.oninput = function () {
      if (!started) { started = true; keepUndo(); }
      onPick(input.value);
    };
    input.onchange = function () {
      started = false;
      if (onDone) { onDone(input.value); }
    };
    return input;
  }

  function buildKinds() {
    var box = el("#kinds");
    box.innerHTML = "";
    kinds().forEach(function (pair) {
      var kind = pair[0], name = pair[1];
      var found = all('.node[data-kind="' + kind + '"]', chart);
      if (!found.length) { return; }
      var row = document.createElement("div");
      row.className = "row";
      row.innerHTML = keyMark(kind) + '<span class="name">' + name +
                      '</span><span class="count">' + found.length + '</span>';
      var k = style.kinds[kind] = style.kinds[kind] || {};
      row.appendChild(swatch(k.fill, "#ffffff", function (v) {
        k.fill = v; paintSoon();
      }));
      row.appendChild(swatch(k.line, style.ink || "#000000", function (v) {
        k.line = v; paintSoon();
      }));
      box.appendChild(row);
    });
  }

  function buildGlobals() {
    var box = el("#globals");
    keepFocus(box, function () {
      [[TXT.lines, "ink", "#000000"],
       [TXT.paper, "sheet", "#ffffff"],
       [TXT.grid, "grid", "#e7ebf0"]].forEach(function (item) {
        var row = document.createElement("div");
        row.className = "row";
        row.innerHTML = '<span class="name">' + item[0] + "</span>";
        // The kind rows below show the color each kind falls back to when
        // it has none of its own, and that is exactly what has just changed
        // -- so they are put up again, once, when the picker is let go of.
        row.appendChild(swatch(style[item[1]], item[2], function (v) {
          style[item[1]] = v; paintSoon();
        }, buildKinds));
        box.appendChild(row);
      });
      // How heavy every line is drawn: the arrows and every shape's border,
      // unless a shape has been given a border of its own.  Heavier lines
      // are what a chart wants on a projector at the back of a classroom.
      var weigh = document.createElement("div");
      weigh.className = "row";
      weigh.innerHTML = '<span class="name">' + TXT.t_weight + "</span>";
      weigh.appendChild(weightSeg("weight", WEIGHTS[style.weight] ? style.weight : "normal",
                                  function (to) {
        keepUndo();
        if (to === "normal") { delete style.weight; } else { style.weight = to; }
        paintSoon();
        buildGlobals();
        drawSelection();                 // what "like the rest" means has moved
      }));
      box.appendChild(weigh);
    });
    // The words have a card of their own now -- what they are set in and
    // how they look, as well as their color -- and it is as chart-wide as
    // these rows are, so it is put up again whenever they are.
    buildLetters();
  }

  // ------------------------------------------------------------ the words --
  // Everything about the whole chart's words, on one card: the typeface,
  // how big, bold, slanted or underlined, and their color.  Any one shape
  // can say otherwise on the card for the shape that is picked.
  function buildLetters() {
    var box = el("#letters");
    if (!box) { return; }
    keepFocus(box, function () {
      var L = lettersOf();
      // Which typeface, and how big: both change how much room the words
      // take, so neither is offered where the chart cannot be drawn again.
      if (CAN_REFLOW) {
        var faces = document.createElement("div");
        faces.className = "seg face-seg";
        faces.setAttribute("role", "group");
        faces.setAttribute("aria-label", TXT.t_face);
        Object.keys(FACES).forEach(function (face) {
          var on = (L.face || "sans") === face;
          var b = document.createElement("button");
          b.type = "button";
          b.className = "seg-btn" + (on ? " on" : "");
          b.dataset.tool = "face-" + face;
          b.style.fontFamily = FACES[face];    // each one written in itself
          b.textContent = TXT["t_" + face];
          b.setAttribute("aria-pressed", on ? "true" : "false");
          b.onclick = function () {
            if ((L.face || "sans") === face) { return; }
            keepUndo();
            if (face === "sans") { delete L.face; } else { L.face = face; }
            restyled(true);
            buildLetters();
          };
          faces.appendChild(b);
        });
        box.appendChild(faces);
      }
      var tools = document.createElement("div");
      tools.className = "type-row";
      lookButtons(function (what) { return !!L[what]; }, function (what) {
        keepUndo();
        if (L[what]) { delete L[what]; } else { L[what] = true; }
        restyled(what === "bold");
        buildLetters();
        drawSelection();                 // what "like the rest" means has moved
      }).forEach(function (b) { tools.appendChild(b); });
      if (CAN_REFLOW) {
        tools.appendChild(sizeStepper("size", L.size || 1, function (to) {
          keepUndo();
          if (to === 1) { delete L.size; } else { L.size = to; }
          restyled(true);
          buildLetters();
        }));
      }
      box.appendChild(tools);
      var row = document.createElement("div");
      row.className = "row";
      row.innerHTML = '<span class="name">' + TXT.t_color + "</span>";
      row.appendChild(swatch(style.words, style.ink || "#000000", function (v) {
        style.words = v;
        // A palette used to hand every kind of shape the words' color as
        // well as the chart, so once one had been chosen this changed the
        // arrows' labels and not a single shape.  It is the color of the
        // chart's words, so that is what it is; one shape can still have
        // a color of its own, below.
        Object.keys(style.kinds).forEach(function (k) {
          delete style.kinds[k].text;
        });
        paintSoon();
      }, function () { drawSelection(); }));
      box.appendChild(row);
    });
  }

  // A card put up again under the hand that pressed something on it keeps
  // that hand's place.  The button pressed has been replaced by a new one,
  // but the focus goes to the new one, so a keyboard can press Bigger four
  // times running without having to find it again after every press.
  function keepFocus(box, build) {
    var was = document.activeElement;
    var tool = was && was.dataset && box.contains(was) ? was.dataset.tool : "";
    box.innerHTML = "";
    build();
    if (tool) {
      var again = el('[data-tool="' + tool + '"]', box);
      if (again && !again.disabled) { again.focus(); }
    }
  }

  // B, I, U and S, drawn the way every word processor draws them, each one
  // lit while it is on, and named with the key that does it where there is
  // one.
  var LOOK_KEYS = [["bold", "t_bold", "B", "Ctrl+B"],
                   ["italic", "t_italic", "I", "Ctrl+I"],
                   ["under", "t_under", "U", "Ctrl+U"],
                   ["strike", "t_strike", "S", ""]];
  function lookButtons(isOn, flip) {
    return LOOK_KEYS.map(function (one) {
      var on = isOn(one[0]);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tog tog-" + one[0] + (on ? " on" : "");
      b.dataset.tool = one[0];
      b.textContent = one[2];
      b.title = TXT[one[1]] + (one[3] ? " (" + one[3] + ")" : "");
      b.setAttribute("aria-label", TXT[one[1]]);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.onclick = function () { flip(one[0]); };
      return b;
    });
  }

  // Smaller, how big, bigger.  In steps rather than a box to type a number
  // into, because a size is a thing you nudge until it looks right.
  function sizeStepper(tool, now, go) {
    var box = document.createElement("div");
    box.className = "step";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", TXT.t_size);
    box.title = TXT.t_size;
    [[-1, "−", TXT.t_smaller], [0], [1, "+", TXT.t_bigger]].forEach(function (one) {
      if (!one[0]) {
        var shown = document.createElement("output");
        shown.textContent = Math.round(now * 100) + "%";
        box.appendChild(shown);
        return;
      }
      var to = nextSize(now, one[0]);
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.tool = tool + (one[0] > 0 ? "-up" : "-down");
      b.textContent = one[1];
      b.title = one[2];
      b.setAttribute("aria-label", one[2]);
      b.disabled = to === now;
      b.onclick = function () { go(to); };
      box.appendChild(b);
    });
    return box;
  }

  function nextSize(now, way) {          // the next step along, either way
    var steps = way > 0 ? TYPE_STEPS : TYPE_STEPS.slice().reverse();
    for (var i = 0; i < steps.length; i++) {
      if (way > 0 ? steps[i] > now + 1e-6 : steps[i] < now - 1e-6) {
        return steps[i];
      }
    }
    return now;
  }

  // The highlighter pens, a way to take one off, and any other color at all.
  function markerRow(now, go) {
    var row = document.createElement("div");
    row.className = "row";
    row.innerHTML = '<span class="name">' + TXT.t_mark + "</span>";
    var pens = document.createElement("div");
    pens.className = "pens";
    pens.setAttribute("role", "group");
    pens.setAttribute("aria-label", TXT.t_mark);
    now = now || "";
    var mine = !!now;                    // not one of the pens, as far as we know
    function pen(color, word, tool) {
      var on = now === color;
      if (on) { mine = false; }
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pen" + (color ? "" : " none") + (on ? " on" : "");
      b.dataset.tool = tool;
      if (color) { b.style.background = color; }
      b.title = word;
      b.setAttribute("aria-label", word);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.onclick = function () { if (!on) { go(color); } };
      pens.appendChild(b);
    }
    pen("", TXT.t_mark_none, "mark-none");
    MARKERS.forEach(function (m) { pen(m[0], TXT[m[1]], "mark-" + m[1]); });
    // Any other color is the machine's own picker, on a pen of its own that
    // shows the color when it is the one in use.  Dragged about in, it only
    // paints -- the card is put up again when it is let go of, not under
    // the hand still holding it.
    var other = swatch(mine ? now : "", MARKERS[0][0], function (v) {
      go(v, true);
    }, function () { drawSelection(); });
    other.className = "swatch pen-other" + (mine ? " on" : "");
    other.title = TXT.t_mark_own;
    other.setAttribute("aria-label", TXT.t_mark_own);
    pens.appendChild(other);
    row.appendChild(pens);
    return row;
  }

  // ------------------------------------------------ one shape's own words --
  // Its words made bold, slanted or underlined -- and pressed again, put
  // back to however the rest of the chart's are.  That is also how a shape
  // comes to be the one plain one on a chart set in bold.
  function lookOn(i, what) {
    var mine = style.nodes[i] || {};
    return mine[what] !== undefined ? !!mine[what] : !!lettersOf()[what];
  }
  function flipLook(i, what) {
    var to = !lookOn(i, what);
    var mine = style.nodes[i] = style.nodes[i] || {};
    keepUndo();
    if (to === !!lettersOf()[what]) { delete mine[what]; } else { mine[what] = to; }
    restyled(what === "bold");
    return to;
  }
  // Its words bigger or smaller than the rest of the chart's, in the same
  // steps; the whole chart's size is the hundred per cent it is measured by.
  function ownSize(i, to) {
    var mine = style.nodes[i] = style.nodes[i] || {};
    if (!CAN_REFLOW || to === (mine.size || 1)) { return; }
    keepUndo();
    if (to === 1) { delete mine.size; } else { mine.size = to; }
    restyled(true);
  }
  function growWords(i, way) {
    ownSize(i, nextSize((style.nodes[i] || {}).size || 1, way));
  }

  // What about the words decides how big the boxes are -- and so whether a
  // change means the chart being laid out again, rather than only painted.
  function typeSign(st) {
    var L = (st && st.letters) || {}, own = {};
    Object.keys((st && st.nodes) || {}).forEach(function (i) {
      var n = st.nodes[i];
      if (n && ((n.size && n.size !== 1) || n.bold !== undefined)) {
        own[i] = [n.size || 1, n.bold];
      }
    });
    return JSON.stringify([L.face || "", L.size || 1, !!L.bold, own]);
  }

  // After anything about the words has changed.  How they look is painted
  // on.  How big they are decides how big the boxes are as well, so a
  // change to that has the chart laid out again around them -- which by
  // hand, where every box measures its own words, is drawing it again.
  function restyled(layout) {
    if (layout && byHand) { drawHand(); return; }
    paintSoon();
    if (layout) { reflowSoon(); }
  }

  // Which shape the Style side is about.  From pseudocode that is the one
  // clicked; by hand it is the one picked, which is how a click there is
  // answered -- and which, before this, left this card saying "click a
  // shape" whatever was clicked.
  function selectedNow() {
    if (byHand) {
      var node = nodeById(picked);
      return node ? { i: "h" + node.id, kind: node.kind,
                      name: kindName(node.kind), said: String(node.text || "") }
                  : null;
    }
    if (!sel) { return null; }
    var kind = sel.dataset.kind;
    return { i: sel.dataset.i, kind: kind,
             name: (kinds().filter(function (p) { return p[0] === kind; })[0] ||
                    [0, kind])[1],
             said: said(sel) };
  }

  function said(g) {
    return all("text", g).map(function (t) { return t.textContent; }).join(" ");
  }

  // How heavy a border is, as three buttons each showing a line that heavy:
  // a picture of the thing says it in every language at once, and the name
  // is on the button for anybody who wants it said.
  function weightSeg(tool, now, go) {
    var seg = document.createElement("div");
    seg.className = "seg weight-seg";
    seg.setAttribute("role", "group");
    seg.setAttribute("aria-label", TXT.t_weight);
    ["thin", "normal", "thick"].forEach(function (w) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "seg-btn" + (now === w ? " on" : "");
      b.dataset.tool = tool + "-" + w;
      b.title = TXT["t_" + w];
      b.setAttribute("aria-label", TXT["t_" + w]);
      b.setAttribute("aria-pressed", now === w ? "true" : "false");
      b.innerHTML = '<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M3 6h18" ' +
                    'stroke-width="' + (WEIGHTS[w] * 1.3).toFixed(2) + '"/></svg>';
      b.onclick = function () { if (now !== w) { go(w); } };
      seg.appendChild(b);
    });
    return seg;
  }

  // One shape's border: how heavy, and whether it is dashed -- the step that
  // is only sometimes taken, say, or the one still to be written.
  function borderRow(i) {
    var mine = style.nodes[i] || {};
    var chartWeight = WEIGHTS[style.weight] ? style.weight : "normal";
    var row = document.createElement("div");
    row.className = "row";
    row.innerHTML = '<span class="name">' + TXT.t_border + "</span>";
    row.appendChild(weightSeg("border", WEIGHTS[mine.weight] ? mine.weight : chartWeight,
                              function (to) {
      keepUndo();
      var m = style.nodes[i] = style.nodes[i] || {};
      if (to === chartWeight) { delete m.weight; } else { m.weight = to; }
      paintSoon();
      drawSelection();
    }));
    var dash = document.createElement("button");
    dash.type = "button";
    dash.className = "tog tog-dash" + (mine.dash ? " on" : "");
    dash.dataset.tool = "dash";
    dash.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true">' +
                     '<path d="M2.5 10h3.5M8.25 10h3.5M14 10h3.5"/></svg>';
    dash.title = TXT.t_dashed;
    dash.setAttribute("aria-label", TXT.t_dashed);
    dash.setAttribute("aria-pressed", mine.dash ? "true" : "false");
    dash.onclick = function () {
      keepUndo();
      var m = style.nodes[i] = style.nodes[i] || {};
      if (m.dash) { delete m.dash; } else { m.dash = true; }
      paintSoon();
      drawSelection();
    };
    row.appendChild(dash);
    return row;
  }

  function smallButton(words, tool) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn small";
    b.dataset.tool = tool;
    b.textContent = words;
    return b;
  }

  // Everything about how a shape looks besides the three colors a kind can
  // hold -- which is what has to be carried over shape by shape when one
  // shape's look is spread to others.
  var WORD_LOOKS = ["mark", "size", "bold", "italic", "under", "strike",
                    "weight", "dash"];
  var heldLook = null;                   // one shape's look, copied to paste

  // The shape that is picked, and everything about how it looks: its three
  // colors, a highlighter, its words' own size and emphasis, its border --
  // and the ways of handing all of that on to other shapes, or taking it
  // off this one again.
  function drawSelection() {
    var body = el("#sel-body");
    if (!body) { return; }
    var now = selectedNow();
    keepFocus(body, function () {
      if (!now) {
        body.innerHTML = '<p class="none">' + TXT.click_shape + "</p>";
        return;
      }
      var kind = now.kind, i = now.i, name = now.name;
      var head = document.createElement("div");
      head.innerHTML = '<div class="what">' + name + '</div><div class="said">' +
                       now.said.replace(/[<>&]/g, "") + "</div>";
      body.appendChild(head);
      var mine = style.nodes[i] = style.nodes[i] || {};
      var k = style.kinds[kind] || {};
      [[TXT.fill, "fill", k.fill || "#ffffff"],
       [TXT.outline, "line", k.line || style.ink || "#000000"],
       [TXT.text, "text", k.text || style.words || style.ink || "#000000"]]
        .forEach(function (item) {
          var row = document.createElement("div");
          row.className = "row";
          row.innerHTML = '<span class="name">' + item[0] + "</span>";
          row.appendChild(swatch(mine[item[1]], item[2], function (v) {
            mine[item[1]] = v; paintSoon();
          }));
          body.appendChild(row);
        });
      // A pen picked is one thing done, so it can be stepped back from; a
      // color being dragged about in the picker is only a preview, and the
      // picker takes its own copy to step back to (see swatch above).
      body.appendChild(markerRow(mine.mark, function (color, live) {
        if (!live) { keepUndo(); }
        if (color) { mine.mark = color; } else { delete mine.mark; }
        paintSoon();
        if (!live) { drawSelection(); }
      }));
      var tools = document.createElement("div");
      tools.className = "type-row";
      lookButtons(function (what) { return lookOn(i, what); }, function (what) {
        flipLook(i, what);
        drawSelection();
      }).forEach(function (b) { tools.appendChild(b); });
      if (CAN_REFLOW) {
        tools.appendChild(sizeStepper("own-size", mine.size || 1, function (to) {
          ownSize(i, to);
          drawSelection();
        }));
      }
      body.appendChild(tools);
      body.appendChild(borderRow(i));

      // The look of one shape, onto another: copy it here, pick the other,
      // paste.  All of it goes -- the colors as well as the words and the
      // border -- because that is what "the way that one looks" means.
      var carry = document.createElement("div");
      carry.className = "go";
      var copy = smallButton(TXT.t_copy_look, "copy-look");
      copy.onclick = function () {
        heldLook = JSON.parse(JSON.stringify(style.nodes[i] || {}));
        drawSelection();                 // Paste has something to paste now
      };
      var paste = smallButton(TXT.t_paste_look, "paste-look");
      paste.disabled = !heldLook;
      paste.onclick = function () {
        if (!heldLook) { return; }
        keepUndo();
        var was = typeSign(style);
        style.nodes[i] = JSON.parse(JSON.stringify(heldLook));
        restyled(typeSign(style) !== was);
        drawSelection();
      };
      carry.appendChild(copy);
      carry.appendChild(paste);
      body.appendChild(carry);

      var go = document.createElement("div");
      go.className = "go";
      var spread = smallButton(say("apply_all", { n: found(kind), what: name }),
                               "spread");
      spread.onclick = function () {
        keepUndo();
        var was = typeSign(style);
        var k2 = style.kinds[kind] = style.kinds[kind] || {};
        if (mine.fill) { k2.fill = mine.fill; }
        if (mine.line) { k2.line = mine.line; }
        if (mine.text) { k2.text = mine.text; }
        // How it looks beyond its colors goes onto every other shape of the
        // kind as well.  A kind keeps colors and nothing else, so that is
        // done a shape at a time -- and this one keeps it: its colors are
        // the kind's now, but the rest of how it looks is still its own.
        var looks = {};
        WORD_LOOKS.forEach(function (w) {
          if (mine[w] !== undefined) { looks[w] = mine[w]; }
        });
        all('.node[data-kind="' + kind + '"]', chart).forEach(function (g) {
          var theirs = g.dataset.i;
          if (theirs === i || !el("text", g)) { return; }  // the key's swatches
          var them = style.nodes[theirs] = style.nodes[theirs] || {};
          WORD_LOOKS.forEach(function (w) {
            if (looks[w] !== undefined) { them[w] = looks[w]; } else { delete them[w]; }
          });
        });
        style.nodes[i] = looks;
        restyled(typeSign(style) !== was);
        buildKinds();
        drawSelection();
      };
      var clear = smallButton(TXT.clear, "clear");
      clear.onclick = function () {
        keepUndo();
        var was = typeSign(style);
        style.nodes[i] = {};
        restyled(typeSign(style) !== was);
        drawSelection();
      };
      go.appendChild(spread);
      go.appendChild(clear);
      body.appendChild(go);
    });
  }

  function found(kind) {
    return all('.node[data-kind="' + kind + '"]', chart).length;
  }

  function select(g) {
    if (sel) { sel.classList.remove("on"); }
    sel = g || null;
    if (sel) { sel.classList.add("on"); }
    drawSelection();
    // And the line it was written on, marked over in the panel.  Picking a
    // shape is the moment somebody is asking what this one is, and the
    // answer to that is the line of pseudocode that drew it.
    if (!byHand) {
      spotLine(sel ? lineOf[+sel.dataset.i] : 0);
    }
  }

  function buildPresets() {
    var box = el("#presets");
    box.innerHTML = "";
    PRESETS.forEach(function (pair) {
      var name = TXT[pair[0]] || pair[0], p = pair[1];
      var b = document.createElement("button");
      b.className = "preset";
      b.dataset.preset = pair[0];        // so stepping back can light it again
      b.innerHTML = '<span class="chips">' +
        ["oval", "io", "diamond"].map(function (k) {
          return '<span class="chip" style="background:' + p.fills[k] + '"></span>';
        }).join("") + "</span><span>" + name + "</span>";
      b.onclick = function () {
        // A palette throws away every color set by hand, which is the
        // most that can be lost in one press anywhere on this page.
        keepUndo();
        style.sheet = p.sheet; style.ink = p.ink;
        style.words = p.words; style.grid = p.grid;
        style.kinds = {};
        Object.keys(p.fills).forEach(function (k) {
          style.kinds[k] = { fill: p.fills[k], line: p.ink };
        });
        all(".preset", box).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        paint(); buildKinds(); buildGlobals(); drawSelection();
      };
      box.appendChild(b);
    });
  }

