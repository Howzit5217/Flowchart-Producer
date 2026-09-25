// ---------------------------------------------------------------------------
//  27-mend.js -- putting right what a warning or a fault already worked out
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ======================================================= putting it right ==
  // Every warning under the Build button and every fault a run stops at
  // already knew more than it was saying.  "Nothing has been put in tally
  // yet", and underneath it "Did you mean total?" -- the page had worked the
  // answer out and then left the typing to you.  So the answer is a button
  // now: it says in words what it would change, pressing it changes the
  // pseudocode and draws the chart again, and double-clicking the warning
  // itself does the same thing.
  //
  // Nothing here guesses.  A fix is offered only where there is one right
  // answer -- a name that is one letter out, a closer with nothing to close,
  // a block whose own indentation says where it ends.  A Do with no test
  // needs a test somebody has to write, and an Until with no Do above it
  // could be mended two ways, so neither is offered one.  A wrong fix
  // applied in one click is worse than a warning that waits.
  //
  // A fix is a small piece of data, and it comes from two places.  The
  // reading puts one on a problem (parse/trouble.py); the runner puts one on
  // an error beside the "did you mean" it was already saying.  Both are the
  // same three shapes:
  //
  //    {how: "change", word: "tally", instead: "total"}   on the fault's line
  //    {how: "drop",   at: 9}                             take that line out
  //    {how: "insert", text: "End If", at: 14, like: 6}   put that line in
  //    {how: "close",  bit: 'sqrt(a + b', text: ")"}      shut what is open,
  //                                                       after that piece
  //
  // A puzzle is the one place none of this is offered.  Its program is
  // broken on purpose and putting it right is the puzzle: a button that
  // did it for you would be handing over the answer.  What is wrong is
  // still said, in the same colors -- only the button is kept back.
  function mendsOff() {
    return !byHand && !!onPuzzle;
  }

  // Where line `at` starts and ends in the box, counted in characters.
  function lineEnds(text, at) {
    var lines = String(text).split("\n");
    if (!at || at < 1 || at > lines.length) { return null; }
    var from = 0;
    for (var i = 0; i < at - 1; i++) { from += lines[i].length + 1; }
    return { from: from, to: from + lines[at - 1].length,
             text: lines[at - 1], last: at === lines.length };
  }

  // Typed in, rather than written over.  Setting a textarea's value empties
  // the browser's own record of what you have done, so a fix applied that way
  // could not be taken back with Ctrl+Z -- which is the very first thing
  // anybody reaches for when the fix was not the one they wanted.  Going
  // through the editing commands puts it on that record like anything typed
  // by hand, and where a browser will not have them the plain way still
  // works; only the taking back is lost.
  function typeOver(code, from, to, text) {
    code.focus();
    code.setSelectionRange(from, to);
    var went = false;
    try {
      went = text ? document.execCommand("insertText", false, text)
                  : document.execCommand("delete");
    } catch (e) { went = false; }
    if (went) { return; }
    var was = code.value;
    code.value = was.slice(0, from) + text + was.slice(to);
    code.setSelectionRange(from + text.length, from + text.length);
    code.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // One word swapped for another -- but only where it is a whole word, and
  // only outside quotation marks.  `Display "tally: ", tally` holds the same
  // five letters twice and only the second is the name: the first is text the
  // program prints, and changing that would change what the program says
  // rather than what it does.
  function swapWord(line, word, instead) {
    var out = "", quote = null, i = 0, changed = false;
    var same = String(word).toLowerCase();
    while (i < line.length) {
      var c = line[i];
      if (quote) {
        out += c;
        if (c === quote) { quote = null; }
        i++;
      } else if (c === '"' || c === "'") {
        quote = c;
        out += c;
        i++;
      } else if (/[A-Za-z_]/.test(c)) {
        var name = /^[A-Za-z_]\w*/.exec(line.slice(i))[0];
        if (name.toLowerCase() === same) {
          out += instead;
          changed = true;
        } else {
          out += name;
        }
        i += name.length;
      } else {
        out += c;
        i++;
      }
    }
    return changed ? out : line;
  }

  // What it would do, worked out without doing it: the stretch of the box
  // it would write over, what it would write there, and the line to look
  // at afterwards -- or null where there is nothing it could do, the
  // pseudocode having been edited since the warning was written, most
  // likely, in which case the warning is stale and the right answer is to
  // leave the box alone.  Worked out first so that a button is only ever
  // offered for a change that can really be made: a button that did
  // nothing when pressed would be worse than none.
  function planRight(fix, line) {
    var code = el("#code");
    if (!code || !fix || !fix.how) { return null; }
    var text = code.value;
    var at = fix.at || line || 0;
    var here = lineEnds(text, at);

    if (fix.how === "change") {
      if (!here || !fix.word || !fix.instead) { return null; }
      var now = swapWord(here.text, fix.word, fix.instead);
      if (now === here.text) { return null; }
      return { from: here.from, to: here.to, text: now, back: at };
    }

    if (fix.how === "drop") {
      if (!here) { return null; }
      // The line and the newline that ends it, so there is no blank left
      // standing where it was.  The last line of all has no newline after
      // it, so the one in front of it goes instead.
      if (here.last && here.from > 0) {
        return { from: here.from - 1, to: here.to, text: "", back: Math.max(1, at - 1) };
      }
      return { from: here.from, to: Math.min(here.to + 1, text.length), text: "",
               back: Math.max(1, at - 1) };
    }

    if (fix.how === "insert") {
      if (!fix.text) { return null; }
      // Set in as far as the line it closes, not as far as the line it goes
      // in front of: End If belongs under its own If.
      var opener = lineEnds(text, fix.like);
      var lead = opener ? (/^[ \t]*/.exec(opener.text) || [""])[0] : "";
      if (!here) {                       // past the end: on a line of its own
        return { from: text.length, to: text.length, text: "\n" + lead + fix.text,
                 back: text.split("\n").length + 1 };
      }
      return { from: here.from, to: here.from, text: lead + fix.text + "\n", back: at };
    }

    // A quote mark or a bracket still open when the piece ends.  All on its
    // own line, it is shut where the piece ends, which is where the reading
    // already took it to stop -- unless more was written after the bracket,
    // "(a b", which could be shut in more than one place.
    //
    // But a line left open is a line the reading carries on to the next
    // one, looking for the close (parse/clean.py), so `Display "Hello` with
    // `Stop` under it is read as `Display "Hello Stop`.  Then the close
    // belongs at the end of the line it was left open on -- as long as
    // that line is exactly one close short, and does not end in a comma or
    // an operator, which would say it was meant to go on.
    if (fix.how === "close") {
      if (!here || !fix.bit || !fix.text) { return null; }
      var bit = String(fix.bit).replace(/\s+$/, "");
      var spot = here.text.lastIndexOf(bit);
      if (bit && spot >= 0) {
        if (fix.rest) { return null; }
        var end = here.from + spot + bit.length;
        return { from: end, to: end, text: fix.text, back: at };
      }
      var line = here.text.replace(/\s+$/, "");
      if (!gluedOn(line, bit)) { return null; }
      var open = stillOpen(line);
      var short = fix.text.charAt(0) === ")"
                ? !open.quote && open.depth === fix.text.length &&
                  !/(,|\+|-|\*|\/|=|&|\(|\bor|\band|\|\||&&)$/i.test(line)
                : open.quote === fix.text;
      if (!short) { return null; }
      return { from: here.from + line.length, to: here.from + line.length,
               text: fix.text, back: at };
    }
    return null;
  }

  // Whether a piece starts on this line and was carried on past its end:
  // the line ends with the piece's beginning, cut where the reading put a
  // space to join the next line on.
  function gluedOn(line, bit) {
    for (var k = Math.min(line.length, bit.length - 1); k > 0; k--) {
      if (bit.charAt(k) === " " && line.slice(line.length - k) === bit.slice(0, k)) {
        return true;
      }
    }
    return false;
  }

  // What a line leaves open: a quote mark, and how many brackets --
  // counted outside quotes, the way the reading counts them.
  function stillOpen(text) {
    var depth = 0, quote = null;
    for (var i = 0; i < text.length; i++) {
      var c = text.charAt(i);
      if (quote) { if (c === quote) { quote = null; } }
      else if (c === '"' || c === "'") { quote = c; }
      else if (c === "(") { depth++; }
      else if (c === ")") { depth--; }
    }
    return { quote: quote, depth: depth };
  }

  // Do it.  Hands back the line to look at afterwards, or 0 where there was
  // nothing it could do.
  function putRight(fix, line) {
    var plan = planRight(fix, line);
    if (!plan) { return 0; }
    typeOver(el("#code"), plan.from, plan.to, plan.text);
    return plan.back;
  }

  // What the button says.  It says what it would do rather than "fix it",
  // because a button that will edit what you wrote should tell you what it
  // is about to write before you press it, not after.
  function fixSays(fix, line) {
    if (!fix) { return ""; }
    if (fix.how === "change" && fix.word && fix.instead) {
      return say("w_mend_change", { word: fix.word, instead: fix.instead });
    }
    if (fix.how === "drop" && (fix.at || line)) {
      return say("w_mend_drop", { line: fix.at || line });
    }
    if (fix.how === "insert" && fix.text && fix.at) {
      return say("w_mend_insert", { text: fix.text, line: fix.at });
    }
    if (fix.how === "close" && fix.text) {
      return say("w_mend_close", { text: fix.text });
    }
    return "";
  }

  // The button, where there is anything to press it for -- and nothing at
  // all where there is not, which is most of the time.
  function mendable(fix, line) {
    if (mendsOff() || !el("#code") || !fixSays(fix, line) || !planRight(fix, line)) {
      return null;
    }
    var button = document.createElement("button");
    button.className = "mend";
    button.type = "button";
    button.textContent = fixSays(fix, line);
    button.title = TXT.w_mend_tip || "";
    button.onclick = function (ev) {
      ev.stopPropagation();              // not the "show me the line" underneath
      mendNow(fix, line);
    };
    return button;
  }

  // Put it right, show which line moved, and draw the chart again.  A fix you
  // have to go and press Build after is a fix you have to be told about, and
  // not having to be told is the whole of the point.
  function mendNow(fix, line) {
    if (mendsOff()) { return; }          // a warning left over from before the puzzle
    var at = putRight(fix, line);
    if (!at) { return; }
    tapeFull(false);                     // out of the full screen, if it is up
    pickLine(0, at);
    buildAsked();                        // asks first if blocks were moved
  }

  // Both places that show a warning hang it on the same two things: a button
  // saying what would put it right, and a double-click on the warning itself.
  // Where the two live is not the same, though -- the fault on the tape is a
  // box with rows in it and the button is one more row, while the warning
  // under Build is itself a button and nothing may be put inside one -- so
  // the caller says where the button goes.
  function offerMend(row, into, fix, line) {
    var button = mendable(fix, line);
    if (!button) { return null; }
    (into || row).appendChild(button);
    row.ondblclick = function () { mendNow(fix, line); };
    row.title = [row.title, TXT.w_mend_tip].filter(Boolean).join(" · ");
    return button;
  }

  // Everything the list can put right, in one press, and the chart drawn
  // once afterwards rather than once a fix.  They are done from the foot of
  // the box upward, so that a line put in or taken out low down leaves the
  // line numbers of every fix above it still true.  Two fixes on the same
  // line: what comes out goes before what goes in, or the line put in
  // would be the one taken out.  Two End lines for the same spot go in the
  // order the reading lists them, outermost first: each goes in above the
  // one before it -- even at the very foot, where the first is added as a
  // last line and the second then finds a line there to go in above -- so
  // the End While lands inside the End If round it rather than after it.
  function mendAll(list) {
    if (mendsOff()) { return; }
    var code = el("#code");
    if (!code) { return; }
    var order = { drop: 0, change: 1, close: 1, insert: 2 };
    var jobs = list.map(function (pair, i) {
      var fix = pair[0], line = pair[1];
      return { fix: fix, line: line, at: (fix && (fix.at || line)) || 0, i: i };
    }).filter(function (job) { return planRight(job.fix, job.line); });
    jobs.sort(function (a, b) {
      if (a.at !== b.at) { return b.at - a.at; }
      var ka = order[a.fix.how] || 0, kb = order[b.fix.how] || 0;
      if (ka !== kb) { return ka - kb; }
      return a.i - b.i;
    });
    var first = 0;
    jobs.forEach(function (job) {
      var at = putRight(job.fix, job.line);
      if (at && (!first || at < first)) { first = at; }
    });
    if (!first) { return; }
    tapeFull(false);
    pickLine(0, first);
    buildAsked();                        // asks first if blocks were moved
  }

  // The button for it, over the list, where there are two or more that it
  // could put right -- with one, the button on the one says the same.
  function offerMendAll(box, list, before) {
    if (mendsOff()) { return null; }
    var can = list.filter(function (pair) {
      return fixSays(pair[0], pair[1]) && planRight(pair[0], pair[1]);
    });
    if (can.length < 2) { return null; }
    var button = document.createElement("button");
    button.className = "mend mend-all";
    button.type = "button";
    button.textContent = say("w_mend_all", { n: can.length });
    button.onclick = function (ev) {
      ev.stopPropagation();
      mendAll(can);
    };
    box.insertBefore(button, before || null);
    return button;
  }
