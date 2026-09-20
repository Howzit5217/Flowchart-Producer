// ---------------------------------------------------------------------------
//  04-panel.js -- the palette, the shape rows, and the selected shape
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
    box.innerHTML = "";
    [[TXT.lines, "ink", "#000000"],
     [TXT.text, "words", "#000000"],
     [TXT.paper, "sheet", "#ffffff"],
     [TXT.grid, "grid", "#e7ebf0"]].forEach(function (item) {
      var row = document.createElement("div");
      row.className = "row";
      row.innerHTML = '<span class="name">' + item[0] + "</span>";
      // The kind rows below show the color each kind falls back to when it
      // has none of its own, and that is exactly what has just changed --
      // so they are put up again, once, when the picker is let go of.
      row.appendChild(swatch(style[item[1]], item[2], function (v) {
        style[item[1]] = v; paintSoon();
      }, buildKinds));
      box.appendChild(row);
    });
  }

  function said(g) {
    return all("text", g).map(function (t) { return t.textContent; }).join(" ");
  }

  function drawSelection() {
    var body = el("#sel-body");
    body.innerHTML = "";
    if (!sel) {
      body.innerHTML = '<p class="none">' + TXT.click_shape + "</p>";
      return;
    }
    var kind = sel.dataset.kind, i = sel.dataset.i;
    var name = (kinds().filter(function (p) { return p[0] === kind; })[0] || [0, kind])[1];
    var head = document.createElement("div");
    head.innerHTML = '<div class="what">' + name + '</div><div class="said">' +
                     said(sel).replace(/[<>&]/g, "") + "</div>";
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
    var go = document.createElement("div");
    go.className = "go";
    go.style.cssText = "display:flex; gap:8px; margin-top:10px";
    var spread = document.createElement("button");
    spread.className = "btn small";
    spread.textContent = say("apply_all", { n: found(kind), what: name });
    spread.onclick = function () {
      keepUndo();
      var k2 = style.kinds[kind] = style.kinds[kind] || {};
      if (mine.fill) { k2.fill = mine.fill; }
      if (mine.line) { k2.line = mine.line; }
      if (mine.text) { k2.text = mine.text; }
      style.nodes[i] = {};
      paint(); buildKinds(); drawSelection();
    };
    var clear = document.createElement("button");
    clear.className = "btn small";
    clear.textContent = TXT.clear;
    clear.onclick = function () {
      keepUndo();
      style.nodes[i] = {};
      paint(); drawSelection();
    };
    go.appendChild(spread);
    go.appendChild(clear);
    body.appendChild(go);
  }

  function found(kind) {
    return all('.node[data-kind="' + kind + '"]', chart).length;
  }

  function select(g) {
    if (sel) { sel.classList.remove("on"); }
    sel = g || null;
    if (sel) { sel.classList.add("on"); }
    drawSelection();
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
          style.kinds[k] = { fill: p.fills[k], line: p.ink, text: p.words };
        });
        all(".preset", box).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        paint(); buildKinds(); buildGlobals(); drawSelection();
      };
      box.appendChild(b);
    });
  }

