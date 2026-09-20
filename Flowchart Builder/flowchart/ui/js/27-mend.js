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

  // Do it.  Hands back the line to look at afterwards, or 0 where there was
  // nothing it could do -- the pseudocode having been edited since the
  // warning was written, most likely, in which case the warning is stale and
  // the right answer is to leave the box alone.
  function putRight(fix, line) {
    var code = el("#code");
    if (!code || !fix || !fix.how) { return 0; }
    var at = fix.at || line || 0;
    var here = lineEnds(code.value, at);

    if (fix.how === "change") {
      if (!here || !fix.word || !fix.instead) { return 0; }
      var now = swapWord(here.text, fix.word, fix.instead);
      if (now === here.text) { return 0; }
      typeOver(code, here.from, here.to, now);
      return at;
    }

    if (fix.how === "drop") {
      if (!here) { return 0; }
      // The line and the newline that ends it, so there is no blank left
      // standing where it was.  The last line of all has no newline after
      // it, so the one in front of it goes instead.
      if (here.last && here.from > 0) {
        typeOver(code, here.from - 1, here.to, "");
      } else {
        typeOver(code, here.from, Math.min(here.to + 1, code.value.length), "");
      }
      return Math.max(1, at - 1);
    }

    if (fix.how === "insert") {
      if (!fix.text) { return 0; }
      // Set in as far as the line it closes, not as far as the line it goes
      // in front of: End If belongs under its own If.
      var opener = lineEnds(code.value, fix.like);
      var lead = opener ? (/^[ \t]*/.exec(opener.text) || [""])[0] : "";
      if (!here) {                       // past the end: on a line of its own
        typeOver(code, code.value.length, code.value.length,
                 "\n" + lead + fix.text);
        return code.value.split("\n").length;
      }
      typeOver(code, here.from, here.from, lead + fix.text + "\n");
      return at;
    }
    return 0;
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
    return "";
  }

  // The button, where there is anything to press it for -- and nothing at
  // all where there is not, which is most of the time.
  function mendable(fix, line) {
    if (!el("#code") || !fixSays(fix, line)) { return null; }
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
    var at = putRight(fix, line);
    if (!at) { return; }
    tapeFull(false);                     // out of the full screen, if it is up
    pickLine(0, at);
    var build = el("#build");
    if (build && !build.disabled) { build.click(); }
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
