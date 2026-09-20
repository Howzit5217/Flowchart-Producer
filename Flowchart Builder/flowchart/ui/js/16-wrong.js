// ---------------------------------------------------------------------------
//  16-wrong.js -- where a run stopped, and why
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------- saying where it went wrong --
  // The line it was on, the line itself with the piece at fault underlined,
  // what went wrong, and what was probably meant instead.  The whole block
  // is a button: pressing it puts the cursor on that line of the pseudocode
  // and brings the shape it was drawn as into view.
  function sayFault(err, how) {
    var at = err.at || null;
    var box = document.createElement("div");
    box.className = "said blame " + (how || "bad");
    if (at && at.line) {
      var head = document.createElement("div");
      head.className = "where";
      head.textContent = say("r_at", { line: at.line });
      box.appendChild(head);
    }
    var shown = caretUnder(at, err);
    if (shown) {
      var line = document.createElement("pre");
      line.className = "bit";
      line.textContent = shown;
      box.appendChild(line);
    }
    var why = document.createElement("div");
    why.className = "why";
    why.textContent = err.message || String(err);
    box.appendChild(why);
    if (err.tip) {
      var tip = document.createElement("div");
      tip.className = "tip";
      tip.textContent = err.tip;
      box.appendChild(tip);
    }
    // And, where the tip is something the page can act on rather than only
    // say, the button that acts on it.  The tip used to be the end of the
    // help: it named the word that was probably meant and left you to go and
    // type it, on a line you then had to find.
    var mended = offerMend(box, box, err.fix, at && at.line);
    (err.trail || []).forEach(function (step) {
      var row = document.createElement("div");
      row.className = "trail";
      row.textContent = step.line
        ? say("r_in_mod", { name: step.name, line: step.line })
        : say("r_in_mod_only", { name: step.name });
      box.appendChild(row);
    });
    if (at && (at.line || at.id)) {
      box.setAttribute("role", "button");
      box.tabIndex = 0;
      box.title = [TXT.r_show_line, mended ? TXT.w_mend_tip : ""]
                  .filter(Boolean).join(" · ");
      box.onclick = function () { goToFault(at); };
      box.onkeydown = function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          goToFault(at);
        }
      };
    }
    var tape = el("#tape");
    tape.appendChild(box);
    tapeToEnd();
    return box;
  }

  // The statement, with a row of carets under the piece that failed.  What
  // failed is an expression out of the middle of the line -- "total + tally"
  // out of "Set total = total + tally" -- so it is found in the line again
  // and the carets counted from there.  Where it cannot be found, the piece
  // stands on its own rather than pointing somewhere wrong.
  function caretUnder(at, err) {
    var said = at && at.text ? String(at.text) : "";
    var bit = (err.bit === undefined || err.bit === null) ? "" : String(err.bit);
    if (!bit) { return said; }
    var base = said ? said.lastIndexOf(bit) : -1;
    var above = "", line = said;
    if (base < 0) {
      // What failed is not in the line word for word: a For's counting
      // is written out by the reading rather than typed, so "i <= top"
      // is nowhere in "For i = 1 To top".  Both are shown then -- the
      // line as it was written, and under it the piece it came to.
      above = said ? said + "\n" : "";
      line = "  " + bit;
      base = 2;
    }
    if (err.from === undefined) { return above + line; }
    var from = base + err.from;
    var wide = Math.max(1, (err.to === undefined ? err.from + 1 : err.to) - err.from);
    if (from < 0 || from >= line.length) { return above + line; }
    wide = Math.min(wide, line.length - from);
    return above + line + "\n" + new Array(from + 1).join(" ") +
           new Array(wide + 1).join("^");
  }

  // Red, and left that way.  The shape in the chart and the line in the
  // pseudocode, marked together, because either one alone leaves you
  // hunting for the other.
  function markFault(at) {
    all(".node.wrong", chart).forEach(function (g) {
      g.classList.remove("wrong");
    });
    var code = el("#code");
    if (code) { code.classList.remove("wrong"); }
    if (!at) { return; }
    if (at.id) {
      all('.node[data-i="' + at.id + '"]', chart).forEach(function (g) {
        g.classList.add("wrong");
      });
    }
    if (at.line && code) {
      var span = lineSpan(code, at.line);
      if (!span) { return; }
      code.style.setProperty("--at-top", (10 + span.top) + "px");
      code.style.setProperty("--at-tall", span.tall + "px");
      code.classList.add("at");
      code.classList.add("wrong");
      showLine(code, at.line);
    }
  }

  function goToFault(at) {
    tapeFull(false);                     // out of the full screen, if it is up
    if (at.id && chart) {
      var g = el('.node[data-i="' + at.id + '"]', chart);
      if (g) { followNode(g); }
    }
    markFault(at);
    if (at.line) { pickLine(at.id, at.line); }
  }
