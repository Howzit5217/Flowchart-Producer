// ---------------------------------------------------------------------------
//  04-panel.js -- the Style side: the palette, the words, the shape rows,
//                 and the selected shape
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------ picking a color --
  // The machine's own picker is a whole chart of color, one wash running
  // into the next, with nothing in it you can point at twice.  This one is
  // squares: a row of grays, then every color from pale to deep, then the
  // colors picked lately -- and under them a slider for how strong the
  // color is and one for how bright, for anything in between.  The shape
  // takes the color as it is chosen, square or slider, so what you see is
  // what you are choosing, and pressing anywhere else is choosing it.
  var POP_HUES = [0, 22, 42, 62, 100, 145, 175, 195, 215, 240, 270, 315];
  var POP_SHADES = [[.14, 1], [.32, 1], [.58, .97], [.85, .88], [.85, .62],
                    [.85, .38]];                    // how strong, how bright
  var POP_ACROSS = POP_HUES.length;                // squares in a row
  var POP_KEPT = "flowchart-recent-colors";
  var popNow = null;                               // the one that is open

  function hsvHex(h, s, v) {
    function part(n) {
      var k = (n + h / 60) % 6;
      var c = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
      return ("0" + Math.round(c * 255).toString(16)).slice(-2);
    }
    return "#" + part(5) + part(3) + part(1);
  }
  // A gray has no hue of its own, so it keeps the one it was given: the
  // strength slider pulled up from a gray brings back the color it was
  // near, not red every time.
  function hexHsv(hex, hue) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    var hi = Math.max(r, g, b), d = hi - Math.min(r, g, b), h = hue || 0;
    if (d) {
      h = 60 * (hi === r ? ((g - b) / d + 6) % 6 : hi === g ? (b - r) / d + 2
                                                           : (r - g) / d + 4);
    }
    return { h: h, s: hi ? d / hi : 0, v: hi };
  }
  function fullHex(text) {               // "#abc", "abc" or "#aabbcc", or ""
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(text || "").trim());
    if (!m) { return ""; }
    return "#" + (m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1]).toLowerCase();
  }

  // The colors picked lately, newest first, for making a second shape the
  // same color as the first -- which a slider on its own could not do.
  function recentColors() {
    try {
      var was = JSON.parse(localStorage.getItem(POP_KEPT));
      return Array.isArray(was) ? was.filter(fullHex).slice(0, POP_ACROSS) : [];
    } catch (e) { return []; }
  }
  function rememberColor(hex) {
    var list = recentColors().filter(function (c) { return c !== hex; });
    list.unshift(hex);
    try { localStorage.setItem(POP_KEPT, JSON.stringify(list.slice(0, POP_ACROSS))); }
    catch (e) { /* not kept, then: the squares are still all there */ }
  }

  function shutColorPop(back) {
    if (popNow) { popNow.shut(back); }
  }

  // Opened from `anchor`, below it -- or, for a row of the menu on the
  // right button, beside the menu, so the menu is still there to read.
  // Pressed again, the same anchor shuts it.
  function colorPop(anchor, value, onPick, onDone) {
    if (popNow && popNow.anchor === anchor) { shutColorPop(); return; }
    shutColorPop();
    var start = fullHex(value) || "#000000";
    var now = start, told = start;
    var hsv = hexHsv(start, 210);
    var box = document.createElement("div");
    box.className = "colorpop";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", anchor.getAttribute("aria-label") ||
                     anchor.textContent || TXT.color_of_it);

    var squares = [];
    function squareRow(colors, extra) {
      var row = document.createElement("div");
      row.className = "cp-grid" + (extra ? " " + extra : "");
      colors.forEach(function (hex) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "cp-sq";
        b.style.background = hex;
        b.dataset.hex = hex;
        b.title = hex;
        b.setAttribute("aria-label", hex);
        b.tabIndex = -1;
        b.onclick = function () { choose(hex, true); };
        row.appendChild(b);
        squares.push(b);
      });
      box.appendChild(row);
    }
    var grays = [];
    for (var g = 0; g < POP_ACROSS; g++) { grays.push(hsvHex(0, 0, 1 - g / (POP_ACROSS - 1))); }
    squareRow(grays, "cp-grays");
    POP_SHADES.forEach(function (sv) {
      squareRow(POP_HUES.map(function (h) { return hsvHex(h, sv[0], sv[1]); }));
    });
    var recent = recentColors();
    if (recent.length) {
      var head = document.createElement("div");
      head.className = "cp-head";
      head.textContent = TXT.cp_recent;
      box.appendChild(head);
      squareRow(recent, "cp-recent");
    }
    // One stop for the Tab key, and the arrows to go about the squares,
    // the way a grid of anything is gone about.  No key pressed in here is
    // for the page behind: an arrow is not a nudge for the shape, nor
    // Delete a way to lose it.
    box.addEventListener("keydown", function (ev) {
      ev.stopPropagation();
      var at = squares.indexOf(document.activeElement);
      if (at < 0) { return; }
      var to = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -POP_ACROSS,
                 ArrowDown: POP_ACROSS }[ev.key];
      if (!to) { return; }
      ev.preventDefault();
      var next = squares[Math.max(0, Math.min(squares.length - 1, at + to))];
      squares[at].tabIndex = -1;
      next.tabIndex = 0;
      next.focus();
    });

    var slides = document.createElement("div");
    slides.className = "cp-slides";
    function slider(word, part) {
      var said = document.createElement("span");
      said.textContent = word;
      var range = document.createElement("input");
      range.type = "range";
      range.min = 0; range.max = 100; range.step = 1;
      range.className = "cp-range";
      range.setAttribute("aria-label", word);
      var num = document.createElement("span");
      num.className = "cp-num";
      range.oninput = function () {
        hsv[part] = range.value / 100;
        choose(hsvHex(hsv.h, hsv.s, hsv.v));
      };
      slides.appendChild(said);
      slides.appendChild(range);
      slides.appendChild(num);
      return { range: range, num: num };
    }
    var strong = slider(TXT.cp_sat, "s"), bright = slider(TXT.cp_bright, "v");
    box.appendChild(slides);

    var foot = document.createElement("div");
    foot.className = "cp-foot";
    var chip = document.createElement("span");
    chip.className = "cp-chip";
    var code = document.createElement("input");
    code.type = "text";
    code.className = "field cp-code";
    code.maxLength = 7;
    code.spellcheck = false;
    code.setAttribute("aria-label", TXT.cp_code);
    code.oninput = function () {
      var hex = fullHex(code.value);
      if (hex) { choose(hex, true, true); }
    };
    code.onkeydown = function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); shut(true); }
    };
    code.onblur = function () { code.value = now; };
    foot.appendChild(chip);
    foot.appendChild(code);
    box.appendChild(foot);

    // `whole` is a color from outside the sliders -- a square, or typed --
    // and they are set from it; a slider moving changes only its own part.
    function choose(hex, whole, typed) {
      if (whole) { hsv = hexHsv(hex, hsv.h); }
      now = hex;
      show(typed);
      if (now !== told) { told = now; onPick(now); }
    }
    function show(typed) {
      chip.style.background = now;
      if (!typed) { code.value = now; }
      [[strong, hsv.s], [bright, hsv.v]].forEach(function (one) {
        var n = Math.round(one[1] * 100);
        if (+one[0].range.value !== n) { one[0].range.value = n; }
        one[0].num.textContent = n;
      });
      strong.range.style.background = "linear-gradient(to right, " +
        hsvHex(hsv.h, 0, hsv.v) + ", " + hsvHex(hsv.h, 1, hsv.v) + ")";
      bright.range.style.background = "linear-gradient(to right, #000, " +
        hsvHex(hsv.h, hsv.s, 1) + ")";
      // Only a square whose state changes is written to: a class set to
      // what it already was still wakes anything watching the page.
      squares.forEach(function (b) {
        var on = b.dataset.hex === now;
        if (b.classList.contains("on") !== on) {
          b.classList.toggle("on", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        }
      });
    }
    show();
    var lit = squares.filter(function (b) { return b.dataset.hex === now; })[0];
    (lit || squares[0]).tabIndex = 0;

    // Its size as laid out, not as drawn: it grows in from a little
    // smaller, and measured mid-grow it would be put a little out of place.
    function place() {
      var menu = anchor.closest ? anchor.closest(".menu") : null;
      var from = anchor.getBoundingClientRect();
      var room = { width: box.offsetWidth, height: box.offsetHeight };
      var x, y;
      if (menu) {
        var m = menu.getBoundingClientRect();
        x = m.right + 6 + room.width <= innerWidth - 8 ? m.right + 6 : m.left - 6 - room.width;
        y = from.top - 8;
      } else {
        x = from.left;
        y = from.bottom + 6 + room.height <= innerHeight - 8 ? from.bottom + 6
                                                             : from.top - 6 - room.height;
      }
      box.style.left = Math.max(8, Math.min(x, innerWidth - room.width - 8)) + "px";
      box.style.top = Math.max(8, Math.min(y, innerHeight - room.height - 8)) + "px";
    }

    // Pressing anywhere else puts it away.  What it hands on when it goes
    // waits for that press to be let go of: a card put up again under a
    // press takes away the very button it was pressing.
    function outside(ev) {
      if (box.contains(ev.target) || anchor.contains(ev.target)) { return; }
      shut(false, true);
    }
    function keys(ev) {
      if (ev.key !== "Escape") { return; }
      ev.stopImmediatePropagation();    // this, and not the menu behind it
      shut(true);
    }
    function scrolled(ev) {
      if (ev.target === document || (ev.target.contains && ev.target.contains(anchor))) {
        place();
      }
    }
    var gone = false;
    function shut(back, pressed) {
      if (gone) { return; }
      gone = true;
      if (popNow === handle) { popNow = null; }
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("keydown", keys, true);
      document.removeEventListener("scroll", scrolled, true);
      window.removeEventListener("resize", place);
      anchor.setAttribute("aria-expanded", "false");
      if (back && document.body.contains(anchor)) { anchor.focus(); }
      box.remove();
      if (now === start) { return; }
      rememberColor(now);
      if (!onDone) { return; }
      var hand = function () { setTimeout(function () { onDone(now); }, 0); };
      if (!pressed) { hand(); return; }
      var letGo = function () {
        window.removeEventListener("pointerup", letGo, true);
        window.removeEventListener("pointercancel", letGo, true);
        hand();
      };
      window.addEventListener("pointerup", letGo, true);
      window.addEventListener("pointercancel", letGo, true);
    }
    var handle = { anchor: anchor, shut: shut };
    popNow = handle;
    document.body.appendChild(box);
    place();
    anchor.setAttribute("aria-expanded", "true");
    document.addEventListener("pointerdown", outside, true);
    window.addEventListener("keydown", keys, true);
    document.addEventListener("scroll", scrolled, true);
    window.addEventListener("resize", place);
    (lit || squares[0]).focus({ preventScroll: true });
  }

  // A color picker being dragged says so many times a second, and every
  // one of those is a live preview: the chart takes the color at the next
  // frame and nothing else happens.  Anything that has to put a piece of
  // the panel up again waits for onDone -- the picker being put away --
  // because rebuilding rows in the middle of a drag takes them out from
  // under the hand that is dragging, and costs more than the painting did.
  function swatch(value, fallback, onPick, onDone) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "swatch";
    b.setAttribute("aria-haspopup", "dialog");
    b.setAttribute("aria-expanded", "false");
    // Named for whatever the row it is put in says it is for -- Fill,
    // Paper, Lines -- once it is in that row, unless it was named already.
    setTimeout(function () {
      if (b.hasAttribute("aria-label")) { return; }
      var row = b.parentNode;
      var said = row && (row.querySelector(".name") || row.querySelector("span"));
      b.setAttribute("aria-label", (said && said.textContent.trim()) || TXT.color_of_it);
    }, 0);
    var shows = document.createElement("span");
    b.appendChild(shows);
    b.value = fullHex(value) || fullHex(fallback) || "#000000";
    shows.style.background = b.value;
    b.onclick = function (ev) {
      ev.stopPropagation();             // the menus' press-anywhere-to-shut
      // One visit to the picker is one thing done, not the sixty the
      // sliders report on the way, so the copy to step back to is taken
      // once: before the first of those changes anything.
      var started = false;
      colorPop(b, b.value, function (v) {
        if (!started) { started = true; keepUndo(); }
        b.value = v;
        shows.style.background = v;
        onPick(v);
      }, onDone);
    };
    return b;
  }

  function buildKinds() {
    var box = el("#kinds");
    box.innerHTML = "";
    // Counted in one walk of the chart rather than one search of it per
    // kind: ten searches of a chart of forty thousand shapes, on every build.
    var many = {};
    all(".node[data-kind]", chart).forEach(function (g) {
      many[g.dataset.kind] = (many[g.dataset.kind] || 0) + 1;
    });
    kinds().forEach(function (pair) {
      var kind = pair[0], name = pair[1];
      var found = many[kind] || 0;
      if (!found) { return; }
      var row = document.createElement("div");
      row.className = "row";
      row.innerHTML = keyMark(kind) + '<span class="name">' + name +
                      '</span><span class="count">' + found + '</span>';
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
        tools.appendChild(sizeBox("size", chartPt(), function (to) {
          keepUndo();
          if (to === PLAIN_PT) { delete L.pt; } else { L.pt = to; }
          restyled(true);
          buildLetters();
          drawSelection();               // a shape with no size of its own shows this
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

  // How big, in points, the way a word processor has it: a box the size can
  // be typed into, the list of sizes under the arrow beside it, and a step
  // down that list and a step up it either side.  `keys` names the keys
  // that take the same steps, where there are any.
  function sizeBox(tool, now, go, keys) {
    var box = document.createElement("div");
    box.className = "step";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", TXT.t_size);
    function stepper(way, mark, word) {
      var to = nextSize(now, way);
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.tool = tool + (way > 0 ? "-up" : "-down");
      b.textContent = mark;
      b.title = word + (keys ? " (" + keys[way > 0 ? 1 : 0] + ")" : "");
      b.setAttribute("aria-label", word);
      b.disabled = to === now;
      b.onclick = function () { go(to); };
      return b;
    }
    var field = document.createElement("input");
    field.type = "text";
    field.className = "pt";
    field.inputMode = "decimal";
    field.autocomplete = "off";
    field.spellcheck = false;
    field.dataset.tool = tool + "-pt";
    field.value = ptSaid(now);
    field.title = TXT.t_size;
    field.setAttribute("aria-label", TXT.t_size);
    field.onfocus = function () { field.select(); };
    // A typed size is taken when it is finished with -- Enter, or going
    // elsewhere -- and not at every key: the 1 on the way to 16 is not a
    // size anybody asked for, and would be a drawing nobody wanted.
    function taken() {
      var want = ptFrom(field.value);
      if (want === null || want === now) { field.value = ptSaid(now); return; }
      go(want);
    }
    field.onchange = taken;
    field.onkeydown = function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); taken(); }
      else if (ev.key === "Escape") { field.value = ptSaid(now); field.select(); }
      else if (ev.key === "ArrowDown" && ev.altKey) { ev.preventDefault(); pointsList(field, now, go); }
      else if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
        ev.preventDefault();
        var to = nextSize(now, ev.key === "ArrowUp" ? 1 : -1);
        if (to !== now) { go(to); }
      }
    };
    var drop = document.createElement("button");
    drop.type = "button";
    drop.className = "pt-list";
    drop.dataset.tool = tool + "-list";
    drop.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true">' +
                     '<path d="M2.2 3.8 5 6.6l2.8-2.8"/></svg>';
    drop.title = TXT.t_size_list;
    drop.setAttribute("aria-label", TXT.t_size_list);
    drop.setAttribute("aria-haspopup", "menu");
    drop.onclick = function (ev) {
      ev.stopPropagation();              // or the click that opened it shuts it
      pointsList(field, now, go);
    };
    box.appendChild(stepper(-1, "−", TXT.t_smaller));
    box.appendChild(field);
    box.appendChild(drop);
    box.appendChild(stepper(1, "+", TXT.t_bigger));
    return box;
  }

  // The sizes on offer, dropped down under the box, the one in use ticked
  // and scrolled to so that it is where the eye already is.
  function pointsList(under, now, go) {
    var at = 0;
    var room = under.getBoundingClientRect();
    openMenu(room.left, room.bottom + 4, TYPE_POINTS.map(function (pt, n) {
      if (pt === now) { at = n; }
      return { name: ptSaid(pt),
               mark: pt === now ? tickArt() : '<span class="tick"></span>',
               go: function () { if (pt !== now) { go(pt); } } };
    }), "sizes");
    var menu = el(".menu.sizes");
    var row = menu && menu.querySelectorAll("button")[at];
    if (row) {
      menu.scrollTop = row.offsetTop - (menu.clientHeight - row.offsetHeight) / 2;
      row.focus();
    }
  }

  // A size as it is written in the page's own language -- 10.5 here, 10,5
  // in German -- and a size read back from whatever was typed, either way
  // round, with or without "pt" after it.  Nonsense is nobody's size; a
  // size past either end of the list is taken as that end.
  function ptSaid(pt) {
    try { return pt.toLocaleString(LANG); }
    catch (e) { return String(pt); }
  }
  function ptFrom(typed) {
    var n = parseFloat(String(typed).replace(",", ".").replace(/[^\d.]/g, ""));
    if (!(n > 0)) { return null; }
    var least = 6, most = TYPE_POINTS[TYPE_POINTS.length - 1];
    return roundPt(Math.max(least, Math.min(most, n)));
  }

  function nextSize(now, way) {          // the next step along, either way
    var steps = way > 0 ? TYPE_POINTS : TYPE_POINTS.slice().reverse();
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
  // Its words a size of their own, in points like the rest of the chart's.
  // Set back to the chart's size, it has no size of its own again, and goes
  // along with the chart's words when they are made bigger or smaller.
  function ownSize(i, to) {
    var mine = style.nodes[i] = style.nodes[i] || {};
    if (!CAN_REFLOW || to === shapePt(i)) { return; }
    keepUndo();
    if (to === chartPt()) { delete mine.pt; } else { mine.pt = to; }
    restyled(true);
  }
  function growWords(i, way) {
    ownSize(i, nextSize(shapePt(i), way));
  }

  // What about the words decides how big the boxes are -- and so whether a
  // change means the chart being laid out again, rather than only painted.
  function typeSign(st) {
    var L = (st && st.letters) || {}, own = {};
    Object.keys((st && st.nodes) || {}).forEach(function (i) {
      var n = st.nodes[i];
      if (n && (n.pt || n.bold !== undefined)) { own[i] = [n.pt || 0, n.bold]; }
    });
    return JSON.stringify([L.face || "", L.pt || PLAIN_PT, !!L.bold, own]);
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
  var WORD_LOOKS = ["mark", "pt", "bold", "italic", "under", "strike",
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
      var what = document.createElement("div");
      what.className = "what";
      what.textContent = name;
      // As words, not as markup: the shape's words are whatever was typed,
      // and "mark >= 70" written into markup with its brackets taken out
      // read as "mark = 70", which is a different test.
      var saidIt = document.createElement("div");
      saidIt.className = "said";
      saidIt.textContent = now.said;
      head.appendChild(what);
      head.appendChild(saidIt);
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
        tools.appendChild(sizeBox("own-size", shapePt(i), function (to) {
          ownSize(i, to);
          drawSelection();
        }, ["Ctrl+Shift+<", "Ctrl+Shift+>"]));
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
    lightPreset();
  }

  // The palette the colors are now, lit on its button.  It was only ever
  // lit by pressing it, so colors that came back any other way -- opening
  // the page again, opening a file, or the buttons being made afresh in
  // another language -- left the chart in Night with no palette chosen on
  // the Style side at all.  Lit by what the colors are, it is right however
  // they got there; colors changed by hand since are no palette, and light
  // none.
  function lightPreset() {
    var same = function (a, b) { return String(a || "").toLowerCase() === String(b || "").toLowerCase(); };
    var now = "";
    PRESETS.forEach(function (pair) {
      var p = pair[1], kinds = style.kinds || {};
      if (!same(style.sheet, p.sheet) || !same(style.ink, p.ink) ||
          !same(style.words, p.words) || !same(style.grid, p.grid)) { return; }
      var kept = Object.keys(kinds).filter(function (k) {
        return kinds[k] && (kinds[k].fill || kinds[k].line || kinds[k].text);
      });
      if (kept.length !== Object.keys(p.fills).length) { return; }
      var all6 = Object.keys(p.fills).every(function (k) {
        return kinds[k] && same(kinds[k].fill, p.fills[k]) &&
               same(kinds[k].line, p.ink) && !kinds[k].text;
      });
      if (all6) { now = pair[0]; }
    });
    all("#presets .preset").forEach(function (x) {
      x.classList.toggle("on", !!now && x.dataset.preset === now);
    });
  }

