// ---------------------------------------------------------------------------
//  17-tape.js -- the tape at the foot of the panel, and the screen it fills
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------- the tape, filling the screen --
  // Everything the runner has to show lands in the tape at the foot of the
  // panel: what the program prints, what it stops to be told, and the same
  // program written out in Python or Java.  That box is about three hundred
  // pixels wide and a few lines tall, which is fine for "Finished." and no
  // good at all for either of the other two -- a line of Java is read
  // sideways a word at a time, and a program that asks four questions has
  // scrolled the first one out of sight by the time it asks the fourth.
  //
  // So the tape can be thrown up over the whole page, the same way the
  // pseudocode can, and by the same means: the very same box is moved into
  // the overlay and moved back again afterwards.  Nothing is copied, so
  // whatever was writing into the tape carries on writing into the one tape
  // there is, whichever side of the screen it is sitting on.

  // Kept at its foot, once a frame however many lines arrive.
  //
  // Reading how tall the tape has grown is a measurement, and a measurement
  // taken straight after adding a line to it makes the browser lay the page
  // out there and then -- the whole page, the chart included, which on a
  // chart of ten thousand shapes is ten milliseconds.  Every line a program
  // printed paid that, so a program that prints a thousand lines paid it a
  // thousand times over.  Asked for once a frame instead, it is one
  // measurement a frame however fast the lines come, and the tape still ends
  // up where it belongs.
  var tapeDue = false;
  function tapeToEnd() {
    if (tapeDue) { return; }
    tapeDue = true;
    requestAnimationFrame(function () {
      tapeDue = false;
      var box = el("#tape");
      if (box) { box.scrollTop = box.scrollHeight; }
    });
  }

  // What the bar says it is showing.  A word of ours is given by its key as
  // well, so that changing the page's language changes it too; a name that
  // is not ours -- Python, JavaScript -- is given without one, and the key
  // is taken off so nothing later writes over it.
  function tapeSays(key, text, count) {
    var head = el("#tape-title"), says = el("#tape-count");
    if (head) {
      if (key) { head.dataset.w = key; }
      else { delete head.dataset.w; }
      head.textContent = text;
    }
    if (says) { says.textContent = count || ""; }
  }

  // Which of the two the sheet is showing.  The run and the code are two
  // boxes, not one box written over twice: going to the code leaves the run
  // exactly where it was, and coming back finds it still there -- the lines
  // it printed, the answers that were typed into it, the point it stopped
  // at.  Before this, asking for the code threw all of that away, and the
  // only way back to it was to run the program again and type the same
  // answers in a second time.
  function tapeShow(what) {
    var slot = el("#tape-slot"), out = el("#code-out"), back = el("#tape-back");
    if (!slot || !out) { return; }
    var code = what === "code";
    slot.hidden = code;
    out.hidden = !code;
    if (back) { back.hidden = !code; }
    // As code is how you get here from the run, and once here it has
    // nowhere left to go: it sat in the bar over the code it had already
    // shown you, doing nothing when pressed.  So it stands down here and
    // the language picker takes its place.
    if (el("#tape-code")) { el("#tape-code").hidden = code; }
    if (el("#tape-lang")) { el("#tape-lang").hidden = !code; }
    // The strip saying which file of the program is showing goes with the
    // code it belongs to -- and is not there at all for a program that
    // came out as one file, which has no file to choose between.
    var strip = el("#code-files");
    if (strip) { strip.hidden = !code || !strip.firstChild; }
  }

  // A newly built chart is a new program: neither what the last one printed
  // nor the code the last one was written out as belongs to it.
  function freshTape() {
    if (el("#tape")) { el("#tape").innerHTML = ""; }
    if (el("#code-out")) { el("#code-out").innerHTML = ""; }
    watchClear();                        // a new program holds nothing yet
    tapeShow("run");
    tapeSays("r_head", TXT.r_head, "");
  }

  function tapeFull(want) {
    var box = el("#tape"), over = el("#tape-over"), home = el("#runner");
    if (!box || !over || !home) { return; }
    var going = slideHome(box);          // the box, and the bars around it
    // What the program is holding travels with what it printed: they are
    // two halves of watching the same run, and leaving one of them behind
    // in a panel nobody can see while the other fills the screen is
    // leaving behind the half that answers "why".
    var held = el("#watch");
    if (want && over.hidden) {
      codeFull(false);                   // one screen at a time
      el("#tape-slot").insertBefore(going, el("#tape-keep"));
      if (held) { el("#tape-slot").insertBefore(held, going); }
      over.hidden = false;
      document.body.classList.add("tape-full");
      // An empty screen with a bar across the top and nothing under it
      // looks broken rather than ready, so it says what it is for.  The
      // line goes again the moment anything real is put there, and is not
      // left behind in the panel afterwards.
      if (!box.firstChild) { talk(TXT.r_hint, "note").classList.add("hint-line"); }
      if (!el("#tape-keep").hidden) { underLines(el("#tape-keep"), box); }
    } else if (!want && !over.hidden) {
      all(".hint-line", box).forEach(function (line) { line.remove(); });
      // The tape is what goes back to the panel, so the tape is what the
      // screen is left on: open it again and you find what the panel was
      // showing, not a page of code you had finished with.  The code is a
      // press away and is written out afresh each time anyway.
      tapeShow("run");
      tapeSays("r_head", TXT.r_head, "");
      over.hidden = true;
      home.appendChild(going);
      if (held) { home.insertBefore(held, going); }
      document.body.classList.remove("tape-full");
    }
    // A box taken out of the page and put back somewhere else forgets how
    // far down it was scrolled, and comes back at its top: opening the
    // screen on a long run showed the first lines it printed rather than
    // the ones it was printing, and closing it did the same to the panel.
    tapeToEnd();
    var button = el("#run-big");
    if (button) {
      button.setAttribute("aria-expanded", want ? "true" : "false");
      button.title = want ? (TXT.code_small || "") : (TXT.code_big || "");
    }
  }

  // Whether the screen is up, and so covering the chart.
  function tapeCovers() {
    var over = el("#tape-over");
    return !!over && !over.hidden;
  }

  // ---------------------------------------------- the run, to copy or keep --
  // What the run said, as text: each line it printed or was told, the word
  // it finished on, and what went wrong if something did, in the order the
  // screen has them.  Not the numbers down the side, which are the page's
  // count rather than anything the program said; not a question still
  // waiting for its answer; and not the line saying what the screen is for.
  function tapeText() {
    var box = el("#tape"), said = [];
    if (!box) { return ""; }
    Array.prototype.forEach.call(box.children, function (one) {
      if (!tapeKind(one)) { return; }
      if (one.classList.contains("blame")) {
        Array.prototype.forEach.call(one.children, function (row) {
          if (row.tagName !== "BUTTON") { said.push(row.textContent); }
        });
        return;
      }
      said.push(one.textContent);
    });
    return said.join("\n");
  }

  // A numbered line of the run, a card saying what went wrong, or neither.
  // The line saying what the screen is for is marked as such the moment it
  // is written, before anything counting it could look.
  function tapeKind(node) {
    if (node.nodeType !== 1 || !node.classList.contains("said") ||
        node.classList.contains("hint-line")) { return ""; }
    return node.classList.contains("blame") ? "card" : "line";
  }

  // How much it has said, kept count of as it is written rather than
  // counted afresh -- a program printing ten thousand lines would count the
  // first line ten thousand times.  The count says whether there is
  // anything for Copy and Save it to take, and how many figures the
  // numbers down the side run to, which is how wide their column is.
  var tapeLines = 0, tapeCards = 0, tapeFigures = 0;
  function tapeTally(node, by) {
    var kind = tapeKind(node);
    if (kind === "line") { tapeLines += by; }
    if (kind === "card") { tapeCards += by; }
  }

  function tapeCounted() {
    var box = el("#tape"), keep = el("#tape-keep");
    var was = keep.hidden;
    keep.hidden = !(tapeLines || tapeCards);
    // The numbers' edge, drawn only once there is a number beside it: the
    // line saying what the screen is for stands alone.
    if (box.classList.contains("lined") !== tapeLines > 0) {
      box.classList.toggle("lined", tapeLines > 0);
    }
    var figures = String(Math.max(1, tapeLines)).length;
    var wider = figures !== tapeFigures;
    if (wider) {
      tapeFigures = figures;
      box.style.setProperty("--figures", figures);
    }
    if (!keep.hidden && (wider || was) && tapeCovers()) { underLines(keep, box); }
  }

  if (el("#tape") && el("#tape-keep") && window.MutationObserver) {
    // Watched rather than told: the tape is written into from half a dozen
    // places, and only what is put in it or taken out is watched -- never
    // what this writes back, which is on the tape's style, not its lines.
    new MutationObserver(function (changes) {
      changes.forEach(function (change) {
        Array.prototype.forEach.call(change.addedNodes, function (n) { tapeTally(n, 1); });
        Array.prototype.forEach.call(change.removedNodes, function (n) { tapeTally(n, -1); });
      });
      tapeCounted();
    }).observe(el("#tape"), { childList: true });
    copyButton(tapeText, el("#tape-copy"));
    el("#tape-save").onclick = function () {
      save(new Blob([tapeText()], { type: "text/plain;charset=utf-8" }),
           say("r_file", { name: chartFileName() || "flowchart" }) + ".txt");
    };
  }

  if (el("#run-big")) {
    el("#run-big").onclick = function () { tapeFull(el("#tape-over").hidden); };
    el("#tape-done").onclick = function () { tapeFull(false); };
    el("#tape-back").onclick = function () {
      tapeShow("run");
      tapeSays("r_head", TXT.r_head, "");
    };
    el("#tape-run").onclick = runIt;
    el("#tape-code").onclick = function (ev) {
      ev.stopPropagation();              // or the same click shuts the menu
      askWhichCode(el("#tape-code"));
    };
    // Escape belongs to the menu while there is one: the language list is
    // opened from this very bar, and pulling the screen out from under it
    // would take away the thing that was being answered.  This part runs
    // before the menu's own part does, so it is this one that stands aside.
    window.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape" || el(".menu:not(.out)")) { return; }
      if (el("#tape-over") && !el("#tape-over").hidden) { tapeFull(false); }
    });
  }
