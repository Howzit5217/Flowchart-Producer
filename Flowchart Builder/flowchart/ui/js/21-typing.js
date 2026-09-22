// ---------------------------------------------------------------------------
//  21-typing.js -- typing straight into a shape
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ---------------------------------------------- typing straight into it --
  // Double-click a shape and the words in it are there to be typed over:
  // in a chart you drew by hand, in the shape itself; in one built from
  // pseudocode, in the line of pseudocode it came from, because that is
  // where those words actually live.
  var lineOf = {};                       // shape number -> line of pseudocode
  // And the same table read the other way.  It cannot be worked out from
  // lineOf afterwards: one box can hold several lines -- a run of Displays
  // is drawn as one shape -- so lineOf keeps only the last of them, and a
  // line in the middle of such a box would find nothing.
  var shapeOf = {};                      // line of pseudocode -> shape number

  // A box being typed into closes when you go elsewhere.  Leaning on blur
  // alone is not quite enough: a box that never gets focus never loses it,
  // and one left open sits over the chart swallowing everything aimed at
  // what is underneath.  So a press anywhere outside puts it away as well.
  function closeOnOutside(pad, finish) {
    function away(ev) {
      if (ev.target === pad || pad.contains(ev.target)) { return; }
      document.removeEventListener("pointerdown", away, true);
      finish();
    }
    setTimeout(function () {
      document.addEventListener("pointerdown", away, true);
    }, 0);
    return function () { document.removeEventListener("pointerdown", away, true); };
  }

  // Both tables go together, so they are emptied together: one of them
  // left behind after the other was cleared points the two halves of the
  // page at a program that is no longer on the paper.
  function forgetLines() {
    lineOf = {};
    shapeOf = {};
  }

  function noteLines(items) {
    (items || []).forEach(function (item) {
      if (item.id && item.line) { lineOf[item.id] = item.line; }
      if (item.id && item.line) { shapeOf[item.line] = item.id; }
      ["then", "else", "body"].forEach(function (key) {
        if (item[key]) { noteLines(item[key]); }
      });
      (item.cases || []).forEach(function (one) { noteLines(one.body); });
    });
  }

  // Typing happens in the shape, not in a box floating over it.  The words
  // that were drawn there are taken away and a writing space is put in their
  // place, inside the shape's own group -- so it keeps the shape's size, its
  // middle, its colors and whatever turn it has been given, and what you see
  // while you type is what you will have when you stop.
  function typeInto(g) {
    var node = nodeById(+g.dataset.i.slice(1));
    if (!node) { return; }
    all(".edit-box").forEach(function (old) { old.remove(); });   // one at a time
    var gone = el(".typing-here", el("#chart"));
    if (gone) { gone.remove(); }

    keepUndo();
    var about = turned(node);
    var pad = Math.min(14, about.w * 0.1);
    var wide = Math.max(24, about.w - pad * 2);
    var tall = Math.max(18, about.h - 8);
    var slot = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    slot.setAttribute("class", "typing-here");
    slot.setAttribute("x", node.x - wide / 2);
    slot.setAttribute("y", node.y - tall / 2);
    slot.setAttribute("width", wide);
    slot.setAttribute("height", tall);

    var space = document.createElement("div");
    space.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    space.className = "writing";
    space.contentEditable = "true";
    space.spellcheck = false;
    space.textContent = node.text || "";
    var ink = (style.nodes["h" + node.id] || {}).text ||
              (style.kinds[node.kind] || {}).text || style.words || style.ink || "#000000";
    space.style.color = ink;
    // Typed in the words it will be drawn in, so that what is typed is the
    // size and the shape it will be when the box is let go of -- not the
    // plain words, turning bold or twice the size the moment it is done.
    var type = handType(node);
    space.style.fontFamily = type.face;
    space.style.fontSize = type.size + "px";
    space.style.fontWeight = type.bold ? "bold" : "";
    space.style.fontStyle = type.italic ? "italic" : "";
    space.style.textDecoration = [type.under ? "underline" : "",
                                  type.strike ? "line-through" : ""].join(" ").trim();
    slot.appendChild(space);

    // The words step aside for the box, and so does a highlighter across
    // them, which would otherwise be left marking words that are not there.
    all("text, .highlights", g).forEach(function (t) { t.style.display = "none"; });
    g.appendChild(slot);

    // put the cursor at the end of what is there
    var pick = document.createRange();
    pick.selectNodeContents(space);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(pick);
    space.focus();

    var shut, closing = false;
    function done() {
      // Once, however many ways it is asked.  Putting the box away takes
      // the keyboard off it, and the browser answers that by asking again
      // from inside the putting away; going along with that removed the
      // box from under the removal already under way, which then threw.
      if (closing || !slot.parentNode) { return; }  // already put away
      closing = true;
      if (shut) { shut(); }
      node.text = space.textContent.replace(/\s+$/, "");
      slot.remove();
      measure(node);
      // The drawing goes again a moment later, not now.  The box sits inside
      // the chart, so anything that pours the chart afresh while it is open
      // -- a shape added from the palette, one dragged, a design opened --
      // takes the box away with the rest, and the browser says so by taking
      // the keyboard off it first: this is called from inside that pouring.
      // Pouring the chart a second time from in there left the first
      // pouring with nothing to finish on, and it threw, halfway through
      // whatever had asked for it.  The words are kept at once, so nothing
      // typed is lost whichever way the box was closed; only the redrawing
      // waits its turn.
      setTimeout(function () {
        drawHand();
        drawHandPanel();
      }, 0);
    }
    shut = closeOnOutside(space, done);
    space.onblur = done;
    space.onkeydown = function (ev) {
      ev.stopPropagation();              // the shortcuts stay out of the way
      if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); space.blur(); }
      if (ev.key === "Escape") { space.textContent = node.text || ""; space.blur(); }
    };
  }

  // The same thing for an arrow: double-click it and the word on it -- Yes,
  // No, whatever it should say -- is there to be typed, where the arrow is,
  // rather than hunted for in the panel.
  function typeOnLink(link) {
    if (!link) { return; }
    all(".edit-box").forEach(function (old) { old.remove(); });
    var a = nodeById(link.from), b = nodeById(link.to);
    if (!a || !b) { return; }
    keepUndo();
    var pts = linkPath(a, b);
    var mid = pts[Math.floor(pts.length / 2)];
    var svg = el("#chart");
    var frame = svg.getScreenCTM();
    var spot = svg.createSVGPoint();
    spot.x = mid[0];
    spot.y = mid[1];
    spot = spot.matrixTransform(frame);
    var stage = el("#stage"), room = stage.getBoundingClientRect();
    var pad = document.createElement("input");
    pad.type = "text";
    pad.className = "edit-box on-line";
    pad.value = link.label || "";
    pad.placeholder = TXT.word_on_it || "";
    pad.style.left = (spot.x - room.left + stage.scrollLeft - 54) + "px";
    pad.style.top = (spot.y - room.top + stage.scrollTop - 15) + "px";
    pad.style.width = "108px";
    stage.appendChild(pad);
    pad.focus();
    pad.select();
    var shut, closing = false;
    function done() {
      if (closing || !pad.parentNode) { return; }   // once, as above
      closing = true;
      if (shut) { shut(); }
      link.label = pad.value.trim();
      pad.remove();
      drawHand();
      drawHandPanel();
    }
    shut = closeOnOutside(pad, done);
    pad.onblur = done;
    pad.onkeydown = function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); pad.blur(); }
      if (ev.key === "Escape") { pad.value = link.label || ""; pad.blur(); }
      ev.stopPropagation();              // the shortcuts stay out of the way
    };
  }

  // Where a line of the pseudocode actually sits in the box, and how tall it
  // is there.  Counting lines and multiplying by the height of one is wrong
  // the moment a line is too long for the column and wraps -- which, in a
  // panel this narrow, is most of them: everything under a wrapped line sits
  // a row lower than the count says, and the further down the further out.
  // It used to be worse than that again, being counted in eighteens against
  // type set on twenty.
  //
  // So the words above the line are laid out a second time, in a box of the
  // same width set in the same type, and the height that comes back is the
  // answer.  One hidden box is kept for it and used over and over; it is
  // measured a few times a second at the very worst, which is nothing.
  var ruler = null, ruled = null;

  // The ruler, set in the same type as the box it is measuring.  The type is
  // named piece by piece rather than by the `font` shorthand: what
  // getComputedStyle hands back for a shorthand is up to the browser -- some
  // serialize it, some hand back an empty string, and an empty string here
  // silently sets the ruler in whatever the page's own type is.  The box is
  // set in a monospace at 12.5/20 and the ruler would have measured it in
  // 14px Segoe UI: every line of a wrapped program measured against the
  // wrong width, so the mark on the line being run lands somewhere else
  // entirely.  The pieces are each their own property and every browser
  // gives all of them.
  function dressRuler(code) {
    var face = getComputedStyle(code);
    if (!ruler) {
      ruler = document.createElement("div");
      ruler.setAttribute("aria-hidden", "true");
      ruler.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden";
      document.body.appendChild(ruler);
    }
    ruler.style.fontFamily = face.fontFamily;
    ruler.style.fontSize = face.fontSize;
    ruler.style.fontWeight = face.fontWeight;
    ruler.style.fontStyle = face.fontStyle;
    ruler.style.lineHeight = face.lineHeight;
    ruler.style.letterSpacing = face.letterSpacing;
    ruler.style.whiteSpace = face.whiteSpace;
    ruler.style.overflowWrap = face.overflowWrap;
    ruler.style.wordBreak = face.wordBreak;
    ruler.style.tabSize = face.tabSize;
    ruler.style.width = (code.clientWidth - parseFloat(face.paddingLeft)
                                          - parseFloat(face.paddingRight)) + "px";
    return parseFloat(face.lineHeight) || 20;
  }

  // Every line of the program measured, in one pass, and remembered.
  //
  // The mark on the line being run has to know where that line sits and how
  // tall it is, and a line too long for the column takes two rows or three,
  // so it has to be measured rather than counted from a line height.
  //
  // It used to be measured by laying out everything above it all over again,
  // every time it was asked.  On a program of forty lines nobody could tell;
  // on one of ten thousand it was twenty-seven milliseconds an ask, twice a
  // step -- the mark asks, and then showing the line asks again -- with the
  // whole page stopped for the length of it.  That is what made Follow along
  // on a big program feel like wading.
  //
  // So the lines are laid out together instead, one block box each, which is
  // exactly how a textarea wraps them, and every top and height is read off
  // in a single pass.  That pass costs about what two of the old asks did,
  // and it is paid once rather than once a step: nothing is measured again
  // until the program or the width of the box changes.
  //
  // It also puts right something the old way had wrong.  Its height came out
  // of a subtraction -- lay out everything up to the line, lay out everything
  // including it, take one from the other -- and the sum took off a row too
  // many, so every wrapped line was reported as exactly one row tall.  The
  // mark over the line being run is drawn that tall, and the stylesheet asks
  // for it to "cover as many rows as they take": a line wrapping to three
  // rows had a third of it marked.  There is no sum here to get wrong, only
  // a height read off the row itself.
  function ruleLines(code) {
    if (!code || !code.clientWidth) { return null; }
    var text = code.value;
    if (ruled && ruled.text === text && ruled.width === code.clientWidth) {
      return ruled;
    }
    var one = dressRuler(code);
    var lines = text.split("\n");
    var rows = document.createDocumentFragment();
    for (var i = 0; i < lines.length; i++) {
      var row = document.createElement("div");
      // A line with nothing on it still takes up a row of its own, and an
      // empty block box would be no rows tall.
      row.textContent = lines[i] || "\u200b";
      rows.appendChild(row);
    }
    ruler.textContent = "";
    ruler.appendChild(rows);
    var kids = ruler.children;
    var tops = new Array(lines.length), talls = new Array(lines.length);
    for (var j = 0; j < lines.length; j++) {      // reads only: one layout
      tops[j] = kids[j].offsetTop;
      talls[j] = Math.max(one, kids[j].offsetHeight);
    }
    ruler.textContent = "";                       // measured: the rows can go
    ruled = { text: text, width: code.clientWidth, tops: tops, talls: talls };
    return ruled;
  }

  function lineSpan(code, at) {
    var all = ruleLines(code);
    if (!all || at < 1 || at > all.tops.length) { return null; }
    return { top: all.tops[at - 1], tall: all.talls[at - 1] };
  }

  // A line put in the middle of what can be seen of the box -- as near to the
  // middle as it can be got, there being nothing above the first line to
  // scroll out of the way.
  function showLine(code, at) {
    var span = lineSpan(code, at);
    if (!span) { return; }
    code.scrollTop = Math.max(0, span.top + span.tall / 2 - code.clientHeight / 2);
  }

  // ------------------------------------ the chart and the words, in step --
  // One shape, one line -- and until now the two halves of the page had no
  // way of pointing at each other.  Reading a chart of forty shapes meant
  // counting down the pseudocode to find which line had drawn the one you
  // were looking at, and the same walk back again to find the shape a line
  // had turned into.  The page knows both: every statement carries the
  // line it came from, and there is a test that says so.  It was simply
  // never shown to anybody.
  //
  // Marking, not selecting.  Clicking a shape is how you pick it to color
  // it, and taking the focus away to the pseudocode box in the middle of
  // that would be answering a press with something nobody asked for.

  // The band is the one a run uses, in a quieter color: there is only ever
  // one line being pointed at, so there is only ever one band.  A run owns
  // it while it is going -- markLine drops this the moment it has anything
  // of its own to say -- because where the program has got to matters more
  // than where you last clicked.
  function spotLine(at) {
    var code = el("#code");
    if (!code) { return; }
    var span = at ? lineSpan(code, at) : null;
    if (!span) { spotOff(); return; }
    code.style.setProperty("--at-top", (10 + span.top) + "px");
    code.style.setProperty("--at-tall", span.tall + "px");
    code.classList.remove("wrong");
    code.classList.add("at");
    code.classList.add("spot");
    showLine(code, at);
  }

  function spotOff() {
    var code = el("#code");
    if (!code || !code.classList.contains("spot")) { return; }
    code.classList.remove("spot");
    code.classList.remove("at");
  }

  // The other direction: the shape a line was drawn into, marked on the
  // paper.  Quietly -- it is a place-marker, not a selection and not a run.
  // Asked on every frame the cursor moves, so neither half of it searches
  // the chart: what was marked is remembered (this is the only place that
  // marks one), and the shape to mark is looked up by its number.
  var spotted = [];
  function spotShape(at) {
    if (!chart) { return; }
    spotted.forEach(function (g) { g.classList.remove("here"); });
    spotted = [];
    var id = at ? shapeOf[at] : 0;
    if (!id || byHand) { return; }
    spotted = shapesNumbered(id);
    spotted.forEach(function (g) { g.classList.add("here"); });
  }

  // Counted, not cut up: splitting everything above the cursor into lines
  // was a fresh array of every one of them on every frame the cursor moved.
  function caretLine(code) {
    var text = code.value, upTo = code.selectionStart, n = 1;
    for (var at = text.indexOf("\n"); at >= 0 && at < upTo; at = text.indexOf("\n", at + 1)) {
      n += 1;
    }
    return n;
  }

  // Once a frame, however many times it is asked for: a cursor held down on
  // the arrow keys asks on every repeat, and each one reads the chart.
  var spotDue = false;
  function spotSoon() {
    if (spotDue || byHand) { return; }
    spotDue = true;
    requestAnimationFrame(function () {
      spotDue = false;
      var code = el("#code");
      if (code) { spotShape(caretLine(code)); }
    });
  }

  if (el("#code")) {
    // A cursor moves in more ways than there are events for it -- typed
    // into, clicked into, arrowed through, dragged across, put there by
    // something else on the page -- and an arrow key held down moves it
    // over and over without ever being let go of.  The document says so
    // once, for all of them, however it moved.
    document.addEventListener("selectionchange", function () {
      if (document.activeElement === el("#code")) { spotSoon(); }
    });
    el("#code").addEventListener("focus", spotSoon);
    // Editing the words means the chart on the paper is no longer the
    // chart they describe, so the band pointing into them comes down
    // rather than stay marking a line that has since moved.
    el("#code").addEventListener("input", function () {
      spotOff();
      spotSoon();
    });
  }

  // Which line to put the cursor on.  Usually the shape says: one shape,
  // one line.  Not always, though -- a run of Displays shares a shape
  // between them -- so a caller that knows the line exactly may say so, and
  // the shape is only asked when nobody knows better.
  function pickLine(id, at) {
    var code = el("#code");
    at = at || lineOf[id];
    if (!at || !code) { return; }
    var lines = code.value.split("\n");
    var from = 0;
    for (var i = 0; i < at - 1 && i < lines.length; i++) { from += lines[i].length + 1; }
    var to = from + (lines[at - 1] || "").length;
    code.focus();
    code.setSelectionRange(from, to);
    showLine(code, at);
  }

