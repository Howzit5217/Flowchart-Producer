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
  //
  // They began as the stage's own and are the whole page's now: the panel,
  // the box the pseudocode is written in, the tape, the sheets that come up
  // over the page, the print preview.  Two kinds of bar on one page -- ours
  // down the chart and the machine's down the panel beside it, a different
  // width, a different shape and a different gray -- read as two programs
  // sharing a window rather than one program with a panel in it.
  //
  // A bar belongs to a frame rather than to the box it scrolls.  Put it in
  // the row the box sits in and it runs the width of everything else in
  // that row as well, and the grip comes out the wrong length because it is
  // measuring the wrong thing.  So every box that gets bars gets a frame to
  // hang them in -- wrapped around it, or, where the box carries too much
  // of the page's own layout to be wrapped, made out of the box itself.

  // A class or three, given as one string the way the stylesheets write them.
  function slideMark(node, names) {
    (names || "").split(" ").forEach(function (name) {
      if (name) { node.classList.add(name); }
    });
  }

  // The wrapped kind: a frame put around the box where it stands.
  function frameOf(box, extra) {
    var frame = box.parentNode;
    if (frame && frame.classList.contains("slide-frame")) { return frame; }
    frame = document.createElement("div");
    frame.className = "slide-frame";
    slideMark(frame, extra);
    box.parentNode.insertBefore(frame, box);
    frame.appendChild(box);
    return frame;
  }

  // The other kind, which the panel needs.  How wide the panel is, where it
  // sits, how it closes to nothing and what becomes of it on a narrow
  // screen are settled by four stylesheets between them, every one of them
  // naming #panel; wrapping it would mean saying all of that over again
  // about the wrapper.  So the panel stays exactly where it is and the
  // scrolling moves inward instead, into a box put around what was in it.
  function slideIn(host, extra) {
    if (host.classList.contains("slide-frame")) { return el(".slide-in", host); }
    var inner = document.createElement("div");
    inner.className = "slide-in";
    while (host.firstChild) { inner.appendChild(host.firstChild); }
    host.appendChild(inner);
    host.classList.add("slide-frame");
    slideMark(host, extra);
    return inner;
  }

  // What to move when a box moves.  The pseudocode and the tape are each
  // one box with two homes -- the panel, and a sheet over the whole page --
  // and it is the very same box that is carried between them, so whatever
  // is writing into it carries on writing into the one there is.  Now that
  // it has bars hung around it, the frame is what makes the journey.
  function slideHome(box) {
    var up = box.parentNode;
    return up && up.classList.contains("slide-frame") ? up : box;
  }

  function slider(box, frame, which) {
    var across = which === "x";
    var bar = document.createElement("div");
    bar.className = "slider none " + which;
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
    frame.appendChild(bar);             // measured against its own box alone

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
    // Whether there is anything to scroll at all.  Asked of both bars before
    // either is drawn, because showing one takes room away from the box and
    // that room may be what settles the other.
    //
    // A box that is not allowed to scroll this way gets no bar this way,
    // however much is hanging over the edge.  Hidden is not the same as
    // fitting: the panel keeps its words from spilling sideways rather
    // than offering a way to go and look at them, and a bar along the foot
    // of it was a bar that scrolled nothing.
    var look = null;
    function need() {
      look = look || getComputedStyle(box);
      var way = across ? look.overflowX : look.overflowY;
      if (way !== "auto" && way !== "scroll") { return false; }
      var all = span();
      return all[0] - all[1] >= 2;
    }
    function draw() {
      if (bar.classList.contains("none")) { return; }
      var all = span(), whole = all[0], seen = all[1], at = all[2];
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

    // Taking hold of a bar is not pressing what the bar happens to be
    // drawn on: one of these stands inside the block that says where a run
    // stopped, and that whole block is a button that jumps to the line.
    grip.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var edge = grip.getBoundingClientRect();
      var hold = across ? ev.clientX - edge.left : ev.clientY - edge.top;
      // The page is told a bar is being dragged, so nothing on it gets
      // selected along the way; the grip being dragged is told that it is
      // the one.  Lit from the page alone, every bar on it lit up at once.
      document.body.classList.add("sliding");
      grip.classList.add("held");
      function move(e) { slideTo(across ? e.clientX : e.clientY, hold); }
      function drop() {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", drop);
        document.body.classList.remove("sliding");
        grip.classList.remove("held");
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", drop);
    });

    track.addEventListener("pointerdown", function (ev) {
      if (ev.target === grip) { return; }
      ev.stopPropagation();
      var room = across ? track.clientWidth : track.clientHeight;
      var all = span(), whole = all[0], seen = all[1];
      slideTo(across ? ev.clientX : ev.clientY,
              Math.max(28, room * seen / whole) / 2);
    });

    return { bar: bar, need: need, draw: draw };
  }

  // One box, its two bars, and everything that has to tell them to measure
  // again.  `how.after` is whatever else wants doing on the same
  // measurement; `how.deep` is for a box whose own size never changes while
  // what is inside it does -- the panel is a column of a fixed height
  // whatever has been folded away in it.
  // Some of them are written fresh every time: a program written out in
  // Java, the line a run stopped on.  Those get their bars as they arrive
  // rather than once at the start, and they are given up again with the
  // box they belong to -- which is what `brief` is for below.
  function slideAlso(root) {
    all("pre.code, pre.bit", root).forEach(function (box) {
      if (!box.classList.contains("own-sliders")) {
        ownSliders(box, frameOf(box, "room"), { brief: true });
      }
    });
  }

  function ownSliders(box, frame, how) {
    how = how || {};
    box.classList.add("own-sliders");
    var across = slider(box, frame, "x");
    var down = slider(box, frame, "y");
    var look = null, settle = 0;

    function refresh() {
      // A box told to hold nothing has nothing to scroll: the tape before a
      // program has printed anything, the code screen while it is the run
      // being shown.  Its bars go with it, and so does the frame, which
      // would otherwise keep the room they stand in.  It is the box's own
      // styling that is asked, not what it looks like on the page, so that
      // a box inside a frame we have just put away can still say it is back.
      look = look || getComputedStyle(box);
      var gone = look.display === "none";
      frame.classList.toggle("slide-gone", gone);
      if (gone) { return; }
      if (how.inside) { slideAlso(box); }   // and whatever has just arrived
      var wantAcross = across.need(), wantDown = down.need();
      var moved = frame.classList.contains("has-x") !== wantAcross ||
                  frame.classList.contains("has-y") !== wantDown;
      frame.classList.toggle("has-x", wantAcross);
      frame.classList.toggle("has-y", wantDown);
      across.bar.classList.toggle("none", !wantAcross);
      down.bar.classList.toggle("none", !wantDown);
      // A bar shown takes the strip it stands in away from the box, and
      // that strip can be exactly what the other bar was waiting on: what
      // fits until the width of a bar is taken out of it does not fit once
      // it is.  So a change is measured again on the next frame.  Two
      // rounds settle it -- each bar can ask for the other once -- and the
      // count is what keeps a box balanced on the edge from asking forever.
      if (moved) { if (settle < 2) { settle++; refreshSoon(); } }
      else { settle = 0; }
      across.draw();
      down.draw();
      if (how.after) { how.after(); }
    }

    // Once a frame, however many times it is asked for.
    //
    // Everything below wants the bars measured again: every scroll event,
    // every resize, every redraw.  Measuring means reading how big what is
    // inside has grown, and a read straight after a write makes the browser
    // stop and lay the whole thing out there and then.  On a chart of a few
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
    box.addEventListener("scroll", refreshSoon, { passive: true });
    // Typing into a box makes what is in it longer without anything else on
    // the page moving at all, which none of the watchers below would see.
    box.addEventListener("input", refreshSoon);
    // A box that is thrown away and written again every run gets no share
    // of the window's: the window would hold on to it, and through it to
    // the box, and a morning's work would leave a few hundred boxes that
    // nobody can see still being measured.  Its own resize watcher tells
    // it everything a window resize would, and goes when it goes.
    if (!how.brief) { window.addEventListener("resize", refreshSoon); }
    var sizes = window.ResizeObserver ? new ResizeObserver(refreshSoon) : null;
    if (sizes) { sizes.observe(box); }
    // A box of a fixed height -- the panel -- never changes size itself
    // while what is in it grows and shrinks, so it is what is in it that is
    // watched.  The writing below only says a change has begun: a card
    // folding away loses its height over a quarter of a second after its
    // class has changed, and measured then, the panel was still as long as
    // it had been.  So the bar stayed up over a panel with nothing left to
    // scroll, or stayed down over one that had just grown too long, until
    // something else happened to have it measured again.  Watching the
    // size of what is inside, it is measured all the way through.
    function watchInside(node) {
      if (sizes && how.deep && node.nodeType === 1) { sizes.observe(node); }
    }
    Array.prototype.forEach.call(box.children, watchInside);
    // A box put away or brought back says so in an attribute rather than by
    // changing size, and a box being written into is written into before it
    // has a new size for anybody to notice.  Neither reaches a resize
    // watcher, so the writing itself is watched as well.
    if (window.MutationObserver) {
      new MutationObserver(function (changes) {
        changes.forEach(function (change) {
          if (change.target === box) { Array.prototype.forEach.call(change.addedNodes, watchInside); }
        });
        refreshSoon();
      }).observe(box, {
        childList: true, subtree: !!how.deep, attributes: true,
        attributeFilter: ["class", "hidden", "style"]
      });
    }
    // And once anything inside has finished moving, measured once more.
    if (how.deep) { box.addEventListener("transitionend", refreshSoon); }
    return refreshSoon;
  }

  // ------------------------------------------------ and where they all go --
  // The stage, which had them before anything else did.  Its bars lie over
  // the edges of the chart rather than standing beside it: the chart sits on
  // a wide margin already, so a bar there covers paper, where the same bar
  // in the panel would cover words.
  if (el("#stage")) {
    var stage = el("#stage");
    // The same watchers serve the loose chart: a chart that has just been
    // redrawn, or zoomed, may be sitting somewhere it is no longer allowed
    // to sit, and this is where that is noticed.
    var stageSoon = ownSliders(stage, frameOf(stage, "stage-frame"),
                               { after: holdClamp });
    // The chart changes size whenever it is redrawn or zoomed, and the bars
    // have to know.  A resize watcher sees both: a zoom resizes the paper,
    // and so does a redraw that comes out a different size.
    var paper = el("#sheet");
    if (window.ResizeObserver && paper) {
      new ResizeObserver(stageSoon).observe(paper);
    }
    // And one for a redraw that comes out exactly the same size, which the
    // resize watcher would not see.  Only the sheet's own children: it used
    // to watch every attribute of every shape in the chart as well, so
    // putting the colors on -- which writes a style to every one of a
    // thousand-odd elements -- handed this a thousand-odd reasons to
    // measure the chart again, every single time.
    if (window.MutationObserver && paper) {
      new MutationObserver(stageSoon).observe(paper, { childList: true });
    }
  }

  // The panel, from the inside, watching what is in it as well as the box
  // itself: a card folded away changes how far there is to scroll without
  // changing the size of the panel by a pixel.
  if (el("#panel")) {
    ownSliders(slideIn(el("#panel"), "room"), el("#panel"), { deep: true });
  }

  // And the rest of them, each wrapped where it stands.  "room" is a bar
  // given a strip of its own to stand in, which is what anything holding
  // words wants: a bar laid over the last fifteen pixels of a panel is a
  // bar laid over the ends of the words in it.  Without it the bar lies
  // over the box, which is right for the one that holds a sheet of paper.
  // The tape and the code screen are written into rather than laid out
  // once, so they keep an eye on what turns up inside them as well.
  [["#code", "room", 0], ["#tape", "room", 1], ["#code-out", "room", 1],
   ["#watch-rows", "room", 0],
   ["#pz-body", "room", 0], ["#eg-body", "room", 0], ["#keys-body", "room", 0],
   ["#more-over .more-body", "room", 0],
   [".print-side", "room", 0], ["#print-paper-area", "", 0]]
    .forEach(function (one) {
      var box = el(one[0]);
      if (box) { ownSliders(box, frameOf(box, one[1]), { inside: !!one[2] }); }
    });

  // -------------------------------------------- pseudocode, filling the screen --
  // Anything longer than a few lines is miserable to write in a box the width
  // of the panel, so the same box can be thrown up over the whole page.  It is
  // the very same textarea moved into an overlay and moved back again, so
  // nothing has to be copied about and there is only ever one of it.
  // The numbers down the side, and the count in the bar.  They are drawn from
  // the text itself and scrolled with it, so a long line that wraps does not
  // put them out of step -- each number sits against the line it belongs to.
  //
  // This runs on every key pressed.  On a program of forty-five thousand
  // lines, writing out every number again each time was a quarter of a
  // megabyte of text laid out afresh for a letter typed in the middle of a
  // line -- so the lines are counted without cutting the text up, and a
  // rule's numbers are only written again when it holds a different count.
  function countLines() {
    var box = el("#code");
    if (!box) { return; }
    var text = box.value, rows = 1;
    for (var at = text.indexOf("\n"); at >= 0; at = text.indexOf("\n", at + 1)) {
      rows += 1;
    }
    var rules = all(".code-rule").filter(function (rule) { return rule._rows !== rows; });
    if (rules.length) {
      var out = [];
      for (var i = 1; i <= rows; i++) { out.push(i); }
      var numbers = out.join("\n");
      // whichever of the two boxes is on screen, and the count in the big
      // one's bar -- the numbers are the same numbers either way
      rules.forEach(function (rule) { rule.textContent = numbers; rule._rows = rows; });
    }
    var says = el("#code-count");
    if (says) { says.textContent = say("code_lines", { n: rows }); }
  }

  function codeFull(want) {
    var box = el("#code"), over = el("#code-over");
    if (!box || !over) { return; }
    var home = el("#code-home");
    var going = slideHome(box);          // the box, and the bars around it
    if (want) {
      tapeFull(false);                   // one screen at a time
      over.hidden = false;
      el("#code-slot").appendChild(going);
      document.body.classList.add("code-full");
      countLines();
    } else {
      over.hidden = true;
      home.insertBefore(going, home.firstChild);
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

  // ------------------------------------------------ writing with indents --
  // Pseudocode is written with indents, and this box is where it is written,
  // so it keeps them the way a code editor does.  Tab puts four spaces in
  // rather than jumping out of the box; with several lines chosen it moves
  // all of them in, and Shift+Tab moves them back out.  Enter starts the
  // next line as far in as this one, and a step further under a line that
  // opens a block -- an If ... Then, an Else, a loop, a Case, a module.
  //
  // Every change goes through typeOver (27-mend.js), which types it in
  // rather than writing over the box.  Tab used to set the box's value
  // itself, which quietly emptied the browser's own record of what had been
  // typed: one Tab and Ctrl+Z could no longer take anything back.  And with
  // three lines chosen, Tab put four spaces where those three lines had been.
  var INDENT = "    ";
  // The same words parse/keywords.py reads a block's opening line by.  An
  // If with something after its Then is the whole of itself on one line,
  // and opens nothing.
  var OPENS_BLOCK = new RegExp("^(?:" + [
    "(?:if|else\\s*if|elseif|elif|otherwise\\s+if)\\b(?!.*\\bthen\\s+\\S).*",
    "else", "otherwise", "while\\b.*", "for\\b.*", "do\\b.*", "repeat",
    "(?:select|switch)\\b.*", "case\\b.*", "default",
    "(?:module|function|sub|procedure|def|method|subroutine)\\b.*"
  ].join("|") + ")$", "i");

  // A While straight under a Do, as far in as it, is the Do's test, and
  // closes the loop rather than opening one.
  function closesDo(text, from, lead) {
    var above = text.slice(0, Math.max(0, from - 1)).split("\n");
    for (var i = above.length - 1; i >= 0; i--) {
      var line = above[i];
      if (!line.trim()) { continue; }
      var its = /^[ \t]*/.exec(line)[0];
      if (its.length > lead.length) { continue; }
      return its === lead && /^(do|repeat)$/i.test(line.trim());
    }
    return false;
  }

  // The start of the line `at` is on, and the end of the line `to` is on.
  function linesAround(text, at, to) {
    var from = text.lastIndexOf("\n", at - 1) + 1;
    // a choice that stops at the very start of a line does not take that line
    if (to > at && text.charAt(to - 1) === "\n") { to -= 1; }
    var end = text.indexOf("\n", to);
    return { from: from, to: end < 0 ? text.length : end };
  }

  function shiftLines(box, out) {
    var text = box.value;
    var at = box.selectionStart, to = box.selectionEnd;
    var span = linesAround(text, at, to);
    var lines = text.slice(span.from, span.to).split("\n");
    var firstGone = 0, gone = 0;
    var moved = lines.map(function (line, i) {
      if (!out) { return line.trim() ? INDENT + line : line; }
      var lead = /^( {1,4}|\t)/.exec(line);
      var cut = lead ? lead[0].length : 0;
      if (i === 0) { firstGone = cut; }
      gone += cut;
      return line.slice(cut);
    }).join("\n");
    if (moved === text.slice(span.from, span.to)) { return; }
    typeOver(box, span.from, span.to, moved);
    if (at === to && lines.length === 1) {
      // Just a cursor: it stays with the words it was beside.
      var by = out ? -Math.min(firstGone, at - span.from) : INDENT.length;
      box.setSelectionRange(at + by, at + by);
    } else {
      box.setSelectionRange(span.from, span.from + moved.length);
    }
  }

  function newLineIndented(box) {
    var text = box.value, at = box.selectionStart;
    var from = text.lastIndexOf("\n", at - 1) + 1;
    var before = text.slice(from, at);
    var lead = /^[ \t]*/.exec(before)[0];
    // What the line says, without the comment it may end in: the reading
    // ignores //, # and /* */ comments, and so does this.
    var said = before.trim().replace(/\s*(\/\/|#|\/\*).*$/, "");
    if (OPENS_BLOCK.test(said) &&
        !(/^while\b/i.test(said) && closesDo(text, from, lead))) {
      lead += INDENT;
    }
    typeOver(box, at, box.selectionEnd, "\n" + lead);
  }

  if (el("#code")) {
    countLines();                        // the panel's box is numbered too
    // A program put there by anything other than typing -- one remembered
    // from last time, one opened from a file -- raises no keystroke, so the
    // numbers are counted again when the page has settled.
    setTimeout(countLines, 0);
    el("#code").addEventListener("input", countLines);
    el("#code").addEventListener("scroll", followRule);
    el("#code").addEventListener("keydown", function (ev) {
      if (ev.ctrlKey || ev.altKey || ev.metaKey || ev.isComposing) { return; }
      var box = el("#code");
      if (ev.key === "Tab") {
        ev.preventDefault();
        var many = box.value.slice(box.selectionStart, box.selectionEnd).indexOf("\n") >= 0;
        if (ev.shiftKey || many) { shiftLines(box, ev.shiftKey); }
        else { typeOver(box, box.selectionStart, box.selectionEnd, INDENT); }
      } else if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        newLineIndented(box);
      }
    });
  }

  if (el("#code-big")) {
    el("#code-big").onclick = function () { codeFull(el("#code-over").hidden); };
    el("#code-done").onclick = function () { codeFull(false); };
    // What the box says at the press, since it is still being written in;
    // saved as plain text under the chart's name, which Files > Open reads
    // straight back into the box.
    copyButton(function () { return el("#code").value; }, el("#code-copy"));
    el("#code-save").onclick = function () {
      save(new Blob([el("#code").value], { type: "text/plain;charset=utf-8" }),
           (chartFileName() || "flowchart") + ".txt");
    };
    window.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && el("#code-over") && !el("#code-over").hidden) {
        codeFull(false);
      }
    });
  }
