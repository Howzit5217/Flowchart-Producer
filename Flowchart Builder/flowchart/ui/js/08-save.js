// ---------------------------------------------------------------------------
//  08-save.js -- saving the SVG and the PNG, and printing it
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------------ saving it --
  function plain(scale) {
    // A big chart is recolored across several frames, so it may be a frame
    // or two from finished at the moment the button is pressed.  A copy
    // taken then would be a copy of a chart caught half way into its new
    // colors, and that copy is the thing somebody keeps.
    paintedThrough();
    var copy = chart.cloneNode(true);
    copy.removeAttribute("style");
    copy.removeAttribute("id");
    all(".node.on", copy).forEach(function (g) { g.classList.remove("on"); });
    wholeCopy(copy);
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copy.setAttribute("width", Math.round(W * (scale || 1)));
    copy.setAttribute("height", Math.round(H * (scale || 1)));
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
           new XMLSerializer().serializeToString(copy);
  }
  // A copy of the chart is the whole of it.  The page leaves the bands of a
  // big chart that are nowhere near the screen out of its own drawing (see
  // showBands), and says so with a word on the chart and on each band it
  // shows; a copy away from the page has nothing to leave out for, so the
  // words come off it and every band is in it.
  function wholeCopy(copy) {
    copy.classList.remove("culled");
    all(".stretch.seen", copy).forEach(function (b) { b.classList.remove("seen"); });
    if (!copy.getAttribute("class")) { copy.removeAttribute("class"); }
  }
  var svgUrl = null;
  function linkSvg(ev) {
    if (svgUrl) { URL.revokeObjectURL(svgUrl); }
    var blob = new Blob([plain(1)], { type: "image/svg+xml;charset=utf-8" });
    svgUrl = URL.createObjectURL(blob);
    el("#svg-link").href = svgUrl;
    // With a folder picked in Files the link is not followed: the drawing
    // goes where everything else saved from here goes (19-folder.js).
    if (ev && intoFolder(blob, el("#svg-link").download || "flowchart.svg")) {
      ev.preventDefault();
    }
  }
  el("#svg-link").addEventListener("click", linkSvg);   // always the latest
  // Nothing made yet: the press above makes the copy, before the browser
  // follows the link.  What is let go is the copy of the last chart, which
  // is a whole drawing held for nothing.
  function linkLater() {
    if (svgUrl) { URL.revokeObjectURL(svgUrl); }
    svgUrl = null;
    el("#svg-link").href = "#";
  }

  // Every file this page hands over comes through here: into the folder
  // picked in Files if there is one, and the browser's downloads if not.
  function save(blob, filename) {
    if (!intoFolder(blob, filename)) { download(blob, filename); }
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
  }

  var MAX_SIDE = 16000, MAX_AREA = 120e6;
  function capped(want) {
    return Math.max(0.25, Math.min(want, MAX_SIDE / W, MAX_SIDE / H,
                                   Math.sqrt(MAX_AREA / (W * H))));
  }
  // Grouped the way the page's own language groups its numbers, not the
  // way the browser happens to: a German page saying 4.664 and an
  // English one saying 4,664 is the point of it having a language.
  function px(n) {
    n = Math.round(n);
    try { return n.toLocaleString(LANG); }
    catch (e) { return n.toLocaleString(); }
  }
  var scaleSel = el("#scale"), note = el("#note");

  // ------------------------------------------------------ how big the PNG --
  // The sizes on offer are settled in Python, which knows what they are;
  // what they come to is settled here, which is the only place that knows
  // what the chart is.  A multiplier on its own says nothing -- four times
  // what? -- and the answer changes every time the chart is drawn again, so
  // the list is written out afresh whenever that happens.
  //
  // A size this browser cannot hold is grayed rather than dropped or
  // quietly saved smaller.  Dropping it leaves no sign of why the biggest
  // sizes are missing from a big chart; saving it smaller means the PNG is
  // not the size that was asked for, which was only ever explained after
  // the fact, by which time the file had already been written.
  var SIZES = [];                        // the values, as Python listed them
  all("option", scaleSel).forEach(function (o) { SIZES.push(o.value); });

  function sizeLabel(value, over) {
    var frame = /^(\d+)x(\d+)$/.exec(value);
    if (frame) { return px(+frame[1]) + " × " + px(+frame[2]); }
    var n = parseFloat(value);
    return n + "× · " + (over ? TXT.png_over
                              : px(W * n) + " × " + px(H * n));
  }

  function sizeList() {
    if (!scaleSel || !W || !H) { return; }
    var was = scaleSel.value, keep = "", biggest = "", anyOf = "";
    var scales = document.createElement("optgroup");
    var frames = document.createElement("optgroup");
    scales.label = TXT.dl_scale;
    frames.label = TXT.dl_frame;
    SIZES.forEach(function (value) {
      var frame = /^\d+x\d+$/.test(value);
      var over = !frame && capped(parseFloat(value)) < parseFloat(value) - 0.005;
      var o = document.createElement("option");
      o.value = value;
      o.textContent = sizeLabel(value, over);
      o.disabled = over;
      if (!over) {
        anyOf = anyOf || value;
        if (!frame) { biggest = value; }
        if (value === was) { keep = value; }
      }
      (frame ? frames : scales).appendChild(o);
    });
    scaleSel.textContent = "";
    if (scales.firstChild) { scaleSel.appendChild(scales); }
    if (frames.firstChild) { scaleSel.appendChild(frames); }
    // A chart redrawn bigger can put what was chosen out of reach.  The
    // biggest that still works is the nearest thing to what was meant; a
    // box left showing a size it will not save at is not.
    scaleSel.value = keep || biggest || anyOf;
    sizeNote();
  }
  function plan() {
    var frame = /^(\d+)x(\d+)$/.exec(scaleSel.value);
    if (frame) {
      var fw = +frame[1], fh = +frame[2], s = Math.min(fw / W, fh / H);
      var dw = Math.round(W * s), dh = Math.round(H * s);
      return { cw: fw, ch: fh, dx: Math.round((fw - dw) / 2),
               dy: Math.round((fh - dh) / 2), dw: dw, dh: dh, scale: s, want: s };
    }
    var want = parseFloat(scaleSel.value), got = capped(want);
    var w = Math.round(W * got), h = Math.round(H * got);
    return { cw: w, ch: h, dx: 0, dy: 0, dw: w, dh: h, scale: got, want: want };
  }
  // The sizes are in the list now, so the tooltip is left to say what the
  // control is for -- it used to be overwritten with the pixel count, which
  // both said it where nobody looks and threw away the wording that the
  // language picker puts back.
  function sizeNote() {
    var p = plan();
    note.className = "hint";             // whatever went wrong last time, did
    note.textContent = (p.scale < p.want - 0.05)
      ? say("png_capped", { want: p.want, got: Math.round(p.scale * 10) / 10,
                            w: px(p.cw), h: px(p.ch) })
      : "";
  }
  // A PNG that would not be made, said under the button that was pressed
  // for it.  The class is the line's own -- it used to be set to "grow bad",
  // which threw away `hint` and with it the rule that hides the line while
  // it is empty, so once anything had gone wrong the line stayed a red-
  // margined gap under the button for the rest of the visit.
  function sizeBad(what) {
    note.className = "hint bad";
    note.textContent = what;
  }
  scaleSel.onchange = sizeNote;

  // The chart, drawn onto a canvas at whatever size is chosen, as a PNG.
  // Both buttons below want exactly this and differ only in what they do
  // with what comes out of it, so it is asked for once.
  function asPng(p) {
    return new Promise(function (ready, sorry) {
      var url = URL.createObjectURL(
          new Blob([plain(p.scale)], { type: "image/svg+xml;charset=utf-8" }));
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = p.cw;
        canvas.height = p.ch;
        var pen = canvas.getContext("2d");
        pen.fillStyle = style.sheet || "#ffffff";
        pen.fillRect(0, 0, canvas.width, canvas.height);
        pen.drawImage(img, p.dx, p.dy, p.dw, p.dh);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          if (blob) { ready(blob); } else { sorry(new Error(TXT.png_big)); }
        }, "image/png");
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        sorry(new Error(TXT.png_fail));
      };
      img.src = url;
    });
  }

  var button = el("#png");
  button.onclick = function () {
    var p = plan();
    button.disabled = true;
    button.textContent = TXT.rendering;
    function done() { button.disabled = false; button.textContent = TXT.dl_png; }
    asPng(p).then(function (blob) {
      done();
      save(blob, FILE + ".png");
    }, function (why) {
      done();
      sizeBad(why.message);
    });
  };

  // ------------------------------------------ the chart, on the clipboard --
  // Downloading a picture and then going and inserting the file is three
  // steps where the thing anybody actually wants -- the chart, in the
  // document they are writing -- is one.
  //
  // The awkward part is that a browser only lets a page reach the clipboard
  // while it is still dealing with the press, and drawing the chart onto a
  // canvas takes longer than that.  So the clipboard is handed the promise
  // of a picture rather than a picture: the write is asked for inside the
  // press, and what it is writing arrives afterwards.  Safari counts the
  // press as over otherwise and refuses, which looked exactly like the
  // button doing nothing.
  var copyPng = el("#png-copy");
  if (copyPng) {
    copyPng.onclick = function () {
      var p = plan();
      function back(word, bad) {
        copyPng.disabled = false;
        copyPng.textContent = word;
        if (bad) { sizeBad(bad); }
        setTimeout(function () { copyPng.textContent = TXT.dl_copy; },
                   bad ? 2200 : 1400);
      }
      if (!(window.ClipboardItem && navigator.clipboard &&
            navigator.clipboard.write)) {
        back(TXT.dl_copy, TXT.dl_copy_no);
        return;
      }
      copyPng.disabled = true;
      copyPng.textContent = TXT.rendering;
      note.textContent = "";             // whatever went wrong last time, did
      var why = null;
      var shot = asPng(p).catch(function (e) { why = e; throw e; });
      navigator.clipboard.write([new ClipboardItem({ "image/png": shot })])
        .then(function () { back(TXT.dl_copied); },
              function () { back(TXT.dl_copy, why ? why.message : TXT.dl_copy_no); });
    };
  }

  // Delete and Escape used to be answered here as well as in the keyboard
  // part.  Two handlers for one key is one handler too many: this one ran
  // first, did the deleting itself, and left nothing for the other to undo,
  // so Ctrl+Z after a Delete quietly did nothing.  The keys all live in one
  // place now.

  if (el("#run")) {
    el("#run").onclick = runIt;
  }
  // The Code card.  Picking a language used to be the asking as well as
  // the choosing, because the dropdown was the only control there was --
  // which meant there was no way to say "Java, in a file each" without
  // first being handed the Java, and no way at all to ask again for the
  // language you were already on.  Two dropdowns and a button now: what it
  // is written in, whether it is one file or a file for each chart, and
  // the asking.
  if (el("#code-write")) {
    el("#code-write").onclick = function () {
      showCode(el("#see-code") ? el("#see-code").value : "");
    };
  }
  if (el("#code-apart")) {
    el("#code-apart").onchange = codeNote;
  }
  if (el("#save-file")) {
    el("#save-file").onclick = saveProject;
    el("#open-file").onclick = function () { el("#file-in").click(); };
    el("#file-in").onchange = function () {
      var one = el("#file-in").files[0];
      if (!one) { return; }
      var reader = new FileReader();
      reader.onload = function () {
        openFile(one.name, String(reader.result));
      };
      reader.readAsText(one);
      el("#file-in").value = "";
    };
  }

  el("#reset").onclick = function () {
    keepUndo();                          // it puts back the plain style, not
                                         // the one that was there a moment ago
    var wasType = typeSign(style);
    style = { sheet: "", ink: "", words: "", grid: "", gridOff: !el("#grid-on").checked,
              kinds: {}, nodes: {}, letters: {} };
    all(".preset").forEach(function (x) { x.classList.remove("on"); });
    // Plain words may want smaller boxes than the ones on the paper, which
    // only drawing the chart again can give them.
    restyled(typeSign(style) !== wasType);
    paint(); buildKinds(); buildGlobals(); drawSelection();
  };
  // Two switches, one thing: the one on the chart card and the one in the
  // colors are the same question asked in two places, so they answer
  // together.  Hiding the ruling that is already drawn works in either mode
  // and does not need the chart made again.
  function showTheGrid(on) {
    style.gridOff = !on;
    if (el("#grid-on")) { el("#grid-on").checked = on; }
    if (el("#f-grid")) { el("#f-grid").checked = on; }
    paint();
    keep();
  }
  if (el("#f-grid")) {
    el("#f-grid").onchange = function () { showTheGrid(el("#f-grid").checked); };
  }
  if (el("#f-legend")) {
    // By hand the key is drawn here and there, so the chart is simply drawn
    // again.  From pseudocode it is a setting the drawing is made with, so it
    // takes effect the next time the chart is built.
    el("#f-legend").onchange = function () {
      if (byHand) { drawHand(); }
    };
  }
  el("#grid-on").onchange = function () {
    style.gridOff = !el("#grid-on").checked;
    if (el("#f-grid")) { el("#f-grid").checked = el("#grid-on").checked; }
    paint();
  };

  // ------------------------------------------------------------ printing --
  // A chart is a thing people put on paper, and a chart printed the way it
  // is shown -- pale fills on a dark page, or a palette chosen for a screen
  // -- comes out costing a cartridge and reading worse than the plain one.
  // So printing is always plain: the paper white, the lines and the words
  // black, the fills left clear.  What is chosen here is the paper and how
  // the chart sits on it.
  //
  // What cannot be replaced is the last step.  A page in a browser has no
  // way to reach a printer itself; window.print() hands over to the
  // browser, and the browser asks.  That is a line no web page is allowed
  // over, so rather than pretend, the panel says so.
  var PAPERS = { a4: [210, 297], letter: [215.9, 279.4], legal: [215.9, 355.6] };
  var MARGIN = 12;                       // mm, and what the @page below says
  var MM = 25.4 / 96;                    // a CSS pixel, in millimetres

  function printRoom() {                 // the room on the sheet, in mm
    var paper = PAPERS[el("#print-paper") ? el("#print-paper").value : "a4"]
              || PAPERS.a4;
    var wide = el("#print-wide") && el("#print-wide").checked;
    var w = wide ? paper[1] : paper[0], h = wide ? paper[0] : paper[1];
    return { w: w, h: h, inW: w - MARGIN * 2, inH: h - MARGIN * 2, wide: wide };
  }

  function printPaperRule() {
    var sheet = el("#print-size");
    if (!sheet) { return; }
    var which = el("#print-paper") ? el("#print-paper").value : "a4";
    var room = printRoom();
    sheet.textContent = "@page { size: " + which +
                        (room.wide ? " landscape" : " portrait") +
                        "; margin: " + MARGIN + "mm; }";
  }

  function drawPrint() {
    var page = el("#print-page");
    if (!page || !chart) { return; }
    var room = printRoom();
    var copy = chart.cloneNode(true);
    copy.removeAttribute("style");
    copy.removeAttribute("id");
    all(".node.on, .node.now", copy).forEach(function (g) {
      g.classList.remove("on");
      g.classList.remove("now");
    });
    wholeCopy(copy);                     // every band, on paper
    // Millimetres, so the drawing arrives on the sheet the size it says it
    // is rather than at whatever a pixel turns out to be on this printer.
    var w = W * MM, h = H * MM;
    if (el("#print-fit") && el("#print-fit").checked) {
      var by = Math.min(room.inW / w, room.inH / h, 1);
      w *= by;
      h *= by;
    }
    copy.setAttribute("width", w.toFixed(2) + "mm");
    copy.setAttribute("height", h.toFixed(2) + "mm");
    page.innerHTML = "";
    page.appendChild(copy);
    page.classList.toggle("show-grid",
                          !!(el("#print-grid") && el("#print-grid").checked));
    // the sheet behind it, shown at a size the screen can hold
    var area = el("#print-paper-area");
    if (area) {
      area.style.setProperty("--page-w", room.w + "mm");
      area.style.setProperty("--page-h", room.h + "mm");
      area.style.setProperty("--page-pad", MARGIN + "mm");
    }
    printPaperRule();
  }

  function printFull(want) {
    var over = el("#print-over");
    if (!over) { return; }
    if (want) {
      over.hidden = false;
      drawPrint();
    } else {
      over.hidden = true;
    }
  }

  if (el("#print-open")) {
    el("#print-open").onclick = function (ev) {
      ev.stopPropagation();
      shutSheets();
      printFull(true);
    };
    el("#print-done").onclick = function () { printFull(false); };
    // The printer is handed the page itself, not a copy, so the chart has
    // to have finished changing color before it is asked for.
    el("#print-now").onclick = function () { paintedThrough(); window.print(); };
    all("#print-paper, #print-wide, #print-fit, #print-grid").forEach(function (one) {
      one.onchange = drawPrint;
    });
    window.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape" || el(".menu:not(.out)")) { return; }
      if (el("#print-over") && !el("#print-over").hidden) { printFull(false); }
    });
  }
