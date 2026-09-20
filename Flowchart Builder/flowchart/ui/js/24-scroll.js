// ---------------------------------------------------------------------------
//  24-scroll.js -- slider bars of our own, and the pseudocode filling the screen
//
//  One part of the Flowchart Builder's script.  The parts run inside a single
//  function and share everything, in the order build.py lists them, so a name
//  made in an earlier part is in hand here.  An editor will call those names
//  undefined, which is expected and harmless.
// ---------------------------------------------------------------------------
/* eslint-disable no-undef */

  // ------------------------------------------------------- the slider bars --
  // The browser's own bars can be given a color and not much else, and what
  // each browser then does with that is its own business: Firefox takes a
  // width and ignores the shape, Windows draws arrow buttons on the ends,
  // and the one along the bottom -- the one that gets the most use here,
  // since a chart is usually wider than the room it has -- came out looking
  // like nothing else on the page.  So the real ones are put away and these
  // are drawn instead, out of the same colors as everything else.
  // The bars belong to the stage, not to the row the stage sits in -- put
  // them in the row and they run the width of the panel as well, and the
  // grip comes out the wrong length because it is measuring the wrong thing.
  // So the stage gets a frame of its own to hang them in.
  function frameOf(box) {
    if (box.parentNode.classList.contains("stage-frame")) { return box.parentNode; }
    var frame = document.createElement("div");
    frame.className = "stage-frame";
    box.parentNode.insertBefore(frame, box);
    frame.appendChild(box);
    return frame;
  }

  function slider(box, which) {
    var across = which === "x";
    var bar = document.createElement("div");
    bar.className = "slider " + which;
    var less = document.createElement("button");
    var more = document.createElement("button");
    less.type = more.type = "button";
    less.className = "slider-step less";
    more.className = "slider-step more";
    less.tabIndex = more.tabIndex = -1;
    less.innerHTML = more.innerHTML =
      '<svg viewBox="0 0 10 10"><path d="M3.2 1.6 L6.8 5 L3.2 8.4"/></svg>';
    less.setAttribute("aria-label", across ? (TXT.slide_left || "") : (TXT.slide_up || ""));
    more.setAttribute("aria-label", across ? (TXT.slide_right || "") : (TXT.slide_down || ""));
    var track = document.createElement("div");
    track.className = "slider-track";
    var grip = document.createElement("div");
    grip.className = "slider-grip";
    track.appendChild(grip);
    bar.appendChild(less);
    bar.appendChild(track);
    bar.appendChild(more);
    frameOf(box).appendChild(bar);      // measured against the stage alone

    // The buttons at the ends: one press is one step, held down it keeps
    // going, the way these have always worked.
    var STEP = 56;
    [[less, -1], [more, 1]].forEach(function (pair) {
      pair[0].addEventListener("pointerdown", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var going = null, faster = null;
        function nudge() {
          if (across) { box.scrollLeft += pair[1] * STEP; }
          else { box.scrollTop += pair[1] * STEP; }
        }
        nudge();
        faster = setTimeout(function () { going = setInterval(nudge, 50); }, 330);
        function letGo() {
          clearTimeout(faster);
          if (going) { clearInterval(going); }
          window.removeEventListener("pointerup", letGo);
        }
        window.addEventListener("pointerup", letGo);
      });
    });

    function span() {
      return across ? [box.scrollWidth, box.clientWidth, box.scrollLeft]
                    : [box.scrollHeight, box.clientHeight, box.scrollTop];
    }
    function show() {
      var all = span(), whole = all[0], seen = all[1], at = all[2];
      if (whole - seen < 2) { bar.classList.add("none"); return; }
      bar.classList.remove("none");
      var room = across ? track.clientWidth : track.clientHeight;
      var long = Math.max(28, room * seen / whole);
      var far = (room - long) * (at / (whole - seen));
      if (across) {
        grip.style.width = long + "px";
        grip.style.transform = "translateX(" + far + "px)";
      } else {
        grip.style.height = long + "px";
        grip.style.transform = "translateY(" + far + "px)";
      }
    }

    function slideTo(point, hold) {
      var edge = track.getBoundingClientRect();
      var room = across ? track.clientWidth : track.clientHeight;
      var all = span(), whole = all[0], seen = all[1];
      var long = Math.max(28, room * seen / whole);
      var from = (across ? point - edge.left : point - edge.top) - hold;
      var part = Math.min(1, Math.max(0, from / (room - long)));
      var to = part * (whole - seen);
      if (across) { box.scrollLeft = to; } else { box.scrollTop = to; }
    }

    grip.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      var edge = grip.getBoundingClientRect();
      var hold = across ? ev.clientX - edge.left : ev.clientY - edge.top;
      document.body.classList.add("sliding");
      function move(e) { slideTo(across ? e.clientX : e.clientY, hold); }
      function drop() {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", drop);
        document.body.classList.remove("sliding");
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", drop);
    });

    track.addEventListener("pointerdown", function (ev) {
      if (ev.target === grip) { return; }
      var room = across ? track.clientWidth : track.clientHeight;
      var all = span(), whole = all[0], seen = all[1];
      slideTo(across ? ev.clientX : ev.clientY,
              Math.max(28, room * seen / whole) / 2);
    });

    return show;                       // when to call it is settled below
  }

  if (el("#stage")) {
    var stage = el("#stage");
    stage.classList.add("own-sliders");
    var showAcross = slider(stage, "x");
    var showDown = slider(stage, "y");
    // The same watchers serve the loose chart: a chart that has just been
    // redrawn, or zoomed, may be sitting somewhere it is no longer allowed
    // to sit, and this is where that is noticed.
    var refresh = function () { showAcross(); showDown(); holdClamp(); };

    // Once a frame, however many times it is asked for.
    //
    // Everything below wants the bars measured again: every scroll event,
    // every resize, every redraw.  Measuring means reading how big the
    // chart is, and a read straight after a write makes the browser stop
    // and lay the whole thing out there and then.  On a chart of a few
    // hundred shapes that is not cheap, and a drag across it asks for one
    // on every scroll event it causes -- so the second is spent laying the
    // chart out over and over, and the chart drags along behind the mouse.
    // Asked for once a frame, it is one measurement a frame however hard
    // the mouse is moved.
    var due = false;
    function refreshSoon() {
      if (due) { return; }
      due = true;
      requestAnimationFrame(function () { due = false; refresh(); });
    }

    refresh();
    stage.addEventListener("scroll", refreshSoon, { passive: true });
    window.addEventListener("resize", refreshSoon);
    // The chart changes size whenever it is redrawn or zoomed, and the bars
    // have to know.  A resize watcher sees both: a zoom resizes the paper,
    // and so does a redraw that comes out a different size.
    var paper = el("#sheet");
    if (window.ResizeObserver) {
      var watcher = new ResizeObserver(refreshSoon);
      watcher.observe(stage);
      if (paper) { watcher.observe(paper); }
    }
    // And one for a redraw that comes out exactly the same size, which the
    // resize watcher would not see.  Only the sheet's own children: it used
    // to watch every attribute of every shape in the chart as well, so
    // putting the colors on -- which writes a style to every one of a
    // thousand-odd elements -- handed this a thousand-odd reasons to
    // measure the chart again, every single time.
    if (window.MutationObserver && paper) {
      new MutationObserver(refreshSoon).observe(paper, { childList: true });
    }
  }

  // -------------------------------------------- pseudocode, filling the screen --
  // Anything longer than a few lines is miserable to write in a box the width
  // of the panel, so the same box can be thrown up over the whole page.  It is
  // the very same textarea moved into an overlay and moved back again, so
  // nothing has to be copied about and there is only ever one of it.
  // The numbers down the side, and the count in the bar.  They are drawn from
  // the text itself and scrolled with it, so a long line that wraps does not
  // put them out of step -- each number sits against the line it belongs to.
  function countLines() {
    var box = el("#code");
    if (!box) { return; }
    var rows = box.value.split("\n").length;
    var out = [];
    for (var i = 1; i <= rows; i++) { out.push(i); }
    var numbers = out.join("\n");
    // whichever of the two boxes is on screen, and the count in the big
    // one's bar -- the numbers are the same numbers either way
    all(".code-rule").forEach(function (rule) { rule.textContent = numbers; });
    var says = el("#code-count");
    if (says) { says.textContent = say("code_lines", { n: rows }); }
  }

  function codeFull(want) {
    var box = el("#code"), over = el("#code-over");
    if (!box || !over) { return; }
    var home = el("#code-home");
    if (want) {
      tapeFull(false);                   // one screen at a time
      over.hidden = false;
      el("#code-slot").appendChild(box);
      document.body.classList.add("code-full");
      countLines();
    } else {
      over.hidden = true;
      home.insertBefore(box, home.firstChild);
      document.body.classList.remove("code-full");
      countLines();
    }
    var button = el("#code-big");
    if (button) {
      button.setAttribute("aria-expanded", want ? "true" : "false");
      button.title = want ? (TXT.code_small || "") : (TXT.code_big || "");
    }
    box.focus();
  }

  function followRule() {
    var box = el("#code");
    if (!box) { return; }
    all(".code-rule").forEach(function (rule) { rule.scrollTop = box.scrollTop; });
  }

  // Tab puts four spaces in rather than jumping out of the box, because
  // pseudocode is written with indents and this is where it gets written.
  if (el("#code")) {
    countLines();                        // the panel's box is numbered too
    // A program put there by anything other than typing -- one remembered
    // from last time, one opened from a file -- raises no keystroke, so the
    // numbers are counted again when the page has settled.
    setTimeout(countLines, 0);
    el("#code").addEventListener("input", countLines);
    el("#code").addEventListener("scroll", followRule);
    el("#code").addEventListener("keydown", function (ev) {
      if (ev.key !== "Tab" || ev.ctrlKey || ev.altKey) { return; }
      ev.preventDefault();
      var box = el("#code");
      var from = box.selectionStart, to = box.selectionEnd;
      box.value = box.value.slice(0, from) + "    " + box.value.slice(to);
      box.selectionStart = box.selectionEnd = from + 4;
      countLines();
    });
  }

  if (el("#code-big")) {
    el("#code-big").onclick = function () { codeFull(el("#code-over").hidden); };
    el("#code-done").onclick = function () { codeFull(false); };
    window.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && el("#code-over") && !el("#code-over").hidden) {
        codeFull(false);
      }
    });
  }
