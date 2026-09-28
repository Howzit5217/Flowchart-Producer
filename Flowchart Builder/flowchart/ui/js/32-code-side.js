// ---------------------------------------------------------------------------
//  32-code-side.js -- the Code way of working: a program written in a
//  language, read into the pseudocode, and drawn from there
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ============================================================ the Code tab ==
  // Three ways into one chart.  Pseudocode is written and drawn; a Flowchart
  // is drawn and read back as pseudocode (12-check.js); and Code is written
  // in Python, Java, C#, C++ or JavaScript and read back as pseudocode
  // (18-from-code.js).  Code has no paper of its own: Build reads the box
  // into the pseudocode card underneath it and draws that, so the chart,
  // the run and the code written out from it are the pseudocode side's,
  // and what the code amounts to is on the page to be read beside it.
  //
  // The two boxes are one program for as long as nobody changes the
  // pseudocode under the other tab.  When somebody does, this box says so
  // and offers to write the pseudocode out in the language again -- the
  // page's own writer (18-write.js), the same one Export code uses.
  //
  // Like the pseudocode, what is written here is not kept between visits,
  // only through a reload, a save or a file (19-files.js carries it); which
  // language it is written in is a preference, and is.
  var langFrom = null;                   // the code the pseudocode was last read from
  var langMade = null;                   // and the pseudocode that reading made
  var langAsked = false;                 // Build asked for by its keys, not its button

  function langBox() { return el("#lang-code"); }

  // Which language: the picker, filled from the table in 18-code.js -- so
  // whatever the page can write out, it offers to read back in.
  function langNow() {
    var pick = el("#lang-pick");
    return pick && LANGS[pick.value] ? pick.value : "python";
  }

  function dressLangPick() {
    var pick = el("#lang-pick");
    if (!pick) { return; }
    if (!pick.options.length) {
      Object.keys(LANGS).forEach(function (code) {
        var one = document.createElement("option");
        one.value = code;
        one.textContent = langName(code);
        pick.appendChild(one);
      });
    }
    try {
      var was = localStorage.getItem("flowchart-code-lang");
      if (was && LANGS[was]) { pick.value = was; }
    } catch (e) { /* storage turned off: Python, then */ }
  }

  // What the box says with nothing in it.  The words are the page's own
  // language; the box is in the one picked.
  function placeLang() {
    var box = langBox();
    if (box) { box.placeholder = TXT.lang_place || ""; }
  }

  // ------------------------------------------------ what it has to say --
  // Under the box: why the code could not be read, and on which line; or
  // what was read but will not run; or that the pseudocode has moved on
  // since, with the way back.  One at a time, and nothing when all is well.
  function langSays(how, parts) {
    var note = el("#lang-note");
    if (!note) { return; }
    note.innerHTML = "";
    (parts || []).forEach(function (part) {
      if (typeof part === "string") {
        var p = document.createElement("p");
        p.className = "hint " + (how || "");
        p.textContent = part;
        note.appendChild(p);
      } else if (part) {
        note.appendChild(part);
      }
    });
  }

  // The line a problem is on, chosen in the box -- where anybody fixing it
  // is going to look next.
  function langPickLine(line) {
    var box = langBox();
    if (!box || !line) { return; }
    var lines = box.value.split("\n"), from = 0;
    for (var i = 0; i < line - 1 && i < lines.length; i++) { from += lines[i].length + 1; }
    var to = from + (lines[line - 1] || "").length;
    box.focus();
    box.setSelectionRange(from, to);
    // roughly into view: the ruling is twenty to a line
    box.scrollTop = Math.max(0, (line - 3) * 20);
  }

  // ----------------------------------------------------- reading it in --
  // The code, read into the pseudocode box.  True when it could be; when it
  // could not, the pseudocode and the chart are left as they were and the
  // box says why.
  function readLangIn() {
    var box = langBox();
    if (!box || !el("#code")) { return false; }
    var said;
    try {
      said = codeToPseudo(box.value, langNow());
    } catch (err) {
      var text = err.line ? say("lang_line", { n: err.line, said: err.message }) : err.message;
      langSays("bad", [text]);
      if (err.line) { langPickLine(err.line); }
      return false;
    }
    langFrom = box.value;
    langMade = said.text;
    langKeepMark();
    if (el("#code").value !== said.text) {
      el("#code").value = said.text;
      newProgram();                      // named afresh from what it now says
      showStarts();
      countLines();
    }
    langSays("warn", said.notes.map(function (n) { return n.text; }));
    return true;
  }

  // Build, in the Code way of working, reads the code in first.  Pressed,
  // or asked for with Ctrl+Enter, it always does; asked for by the page
  // itself -- a reload putting things back, the language of the page
  // changed, a file opened -- it does only if the code has changed since
  // it was last read, so a pseudocode somebody went on to edit under the
  // other tab is not quietly written over by the code it came from.
  (function () {
    var build = el("#build");
    if (!build || !build.onclick) { return; }
    var pressed = build.onclick;
    build.onclick = function (ev) {
      var asked = langAsked;
      langAsked = false;
      if (byLang && langBox() &&
          ((ev && ev.isTrusted) || asked || langBox().value !== langFrom)) {
        if (!readLangIn()) { return; }
      }
      return pressed.apply(this, arguments);
    };
  })();
  if (typeof buildAsked === "function") {
    var buildAskedPlain = buildAsked;
    buildAsked = function () {
      if (byLang) { langAsked = true; }
      return buildAskedPlain.apply(this, arguments);
    };
  }

  // ------------------------------------------ and written out again --
  // The pseudocode on the paper, written in the language picked -- by the
  // writer Export code uses -- into the box.  Only while the chart on the
  // paper is the pseudocode in the box: the writer writes the chart.
  function langCanWrite() {
    return !byHand && !!AST && typeof builtText === "string" &&
           !!el("#code") && builtText === el("#code").value && !!builtText.trim();
  }

  // `typed` puts it in the way typing would, so Ctrl+Z takes it back out:
  // the button writes over somebody's code, and that ought to be undoable.
  function langWriteOut(typed) {
    var box = langBox();
    if (!box || !langCanWrite()) { return false; }
    var made;
    try { made = codeFor(langNow()); }
    catch (e) { return false; }
    if (!made || typeof made.text !== "string") { return false; }
    var text = made.text.replace(/\s+$/, "") + "\n";
    if (typed) { typeOver(box, 0, box.value.length, text); }
    else { box.value = text; }
    box.setSelectionRange(0, 0);
    box.scrollTop = 0;
    langFrom = box.value;
    langMade = el("#code").value;
    langSays("", []);
    langKeepMark();
    return true;
  }

  // Whether the code and the pseudocode still say the same thing, and if
  // not, the way to make them.  Asked on arriving here, on a new chart, and
  // on picking another language.
  function langCheck() {
    if (!byLang) { return; }
    var box = langBox();
    if (!box || !el("#code")) { return; }
    var pseudo = el("#code").value;
    // Nothing written here yet, and a chart drawn from pseudocode: that
    // program, in this language, to start from.
    if (!box.value.trim()) {
      if (pseudo.trim() && langCanWrite()) { langWriteOut(); }
      return;
    }
    var moved = langMade !== null && pseudo !== langMade && pseudo.trim();
    var other = box.dataset.lang && box.dataset.lang !== langNow() && langMade === pseudo;
    if (!(moved || other) || !langCanWrite()) { return; }
    var redo = document.createElement("button");
    redo.className = "btn small";
    redo.textContent = say("lang_rewrite", { lang: langName(langNow()) });
    redo.title = say("lang_rewrite_tip", { lang: langName(langNow()) });
    redo.onclick = function () { langWriteOut(true); };
    langSays("warn", moved ? [TXT.lang_stale, redo] : [redo]);
  }

  // Which language the box was last written or read in, so picking another
  // can offer to write it out in that one.
  function langKeepMark() {
    var box = langBox();
    if (box) { box.dataset.lang = langNow(); }
  }

  // ------------------------------------------------ the way of working --
  // Called by setMode (13-hand-keep.js) on every change of tab.  Title,
  // Your name, Options and Build go with the box being written in: up
  // here in Code, back under the pseudocode everywhere else.
  function langSide(on) {
    var source = el("#source"), slot = el("#lang-slot");
    if (!source || !slot) { return; }
    var parts = [el("#source .fields") || el("#lang-slot .fields"),
                 el(".build-row"), el("#build-note")].filter(Boolean);
    if (on) {
      parts.forEach(function (part) { slot.appendChild(part); });
    } else {
      var faults = el("#build-faults");
      parts.forEach(function (part) {
        if (part.parentNode !== source) { source.insertBefore(part, faults); }
      });
    }
    var code = el("#code");
    if (code) {
      code.readOnly = !!on;
      code.title = on ? (TXT.lang_made || "") : "";
    }
    if (on) {
      placeLang();
      setTimeout(langCheck, 0);          // once the tab has finished changing
    }
  }

  // ------------------------------------------------- keeping it with a save --
  // What the Code box holds, for a save, a file or a reload to carry: the
  // code, the language, and what it was last read into -- so it comes back
  // knowing whether the pseudocode has moved on from it.
  function langData() {
    var box = langBox();
    if (!box || !box.value.trim()) { return null; }
    return { lang: langNow(), text: box.value, from: langFrom, made: langMade };
  }

  function wearLang(was) {
    var box = langBox();
    if (!box) { return; }
    was = was || {};
    if (was.lang && LANGS[was.lang] && el("#lang-pick")) { el("#lang-pick").value = was.lang; }
    box.value = String(was.text || "");
    langFrom = typeof was.from === "string" ? was.from : null;
    langMade = typeof was.made === "string" ? was.made : null;
    langKeepMark();
    langSays("", []);
  }

  // A file of code, opened from Files: into this box, in the language its
  // name says, and drawn.
  var LANG_EXT = { py: "python", pyw: "python", java: "java", cs: "csharp",
                   cpp: "cpp", cc: "cpp", cxx: "cpp", hpp: "cpp", h: "cpp",
                   js: "javascript", mjs: "javascript", cjs: "javascript" };
  function langOfFile(name) {
    var m = /\.([A-Za-z0-9]+)$/.exec(String(name || ""));
    var lang = m ? LANG_EXT[m[1].toLowerCase()] : null;
    return lang && LANGS[lang] ? lang : null;
  }
  function openCodeFile(name, text, lang) {
    var box = langBox();
    if (!box) { return false; }
    if (el("#lang-pick")) { el("#lang-pick").value = lang; }
    box.value = String(text).replace(/\r\n?/g, "\n");
    langFrom = null;
    langMade = null;
    langKeepMark();
    setMode(false, true);
    langAsked = true;                    // read it in, whatever was there
    el("#build").click();
    return true;
  }

  // ------------------------------------------------------ the box itself --
  // Written in the way code is: Tab indents rather than leaving the box,
  // several lines move in and out together, and Enter starts the next line
  // as far in as this one -- a step further after a line that opens a
  // block, which is a colon in Python and a brace everywhere else.
  function langNewLine(box) {
    var text = box.value, at = box.selectionStart;
    var from = text.lastIndexOf("\n", at - 1) + 1;
    var before = text.slice(from, at);
    var lead = /^[ \t]*/.exec(before)[0];
    var said = before.replace(/\s*(#|\/\/).*$/, "").trim();
    if (langNow() === "python" ? /:$/.test(said) : /\{$/.test(said)) { lead += INDENT; }
    typeOver(box, at, box.selectionEnd, "\n" + lead);
  }

  if (langBox()) {
    dressLangPick();
    placeLang();
    langKeepMark();
    var framed = frameOf(langBox(), "room");
    ownSliders(langBox(), framed, { inside: false });
    langBox().addEventListener("keydown", function (ev) {
      if (ev.ctrlKey || ev.altKey || ev.metaKey || ev.isComposing) { return; }
      var box = langBox();
      if (ev.key === "Tab") {
        ev.preventDefault();
        var many = box.value.slice(box.selectionStart, box.selectionEnd).indexOf("\n") >= 0;
        if (ev.shiftKey || many) { shiftLines(box, ev.shiftKey); }
        else { typeOver(box, box.selectionStart, box.selectionEnd, INDENT); }
      } else if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        langNewLine(box);
      }
    });
    // what was wrong is about code that is not there any more
    langBox().addEventListener("input", function () {
      var note = el("#lang-note");
      if (note && el(".bad", note)) { langSays("", []); }
    });
    el("#lang-pick").addEventListener("change", function () {
      try { localStorage.setItem("flowchart-code-lang", langNow()); }
      catch (e) { /* kept for this visit only */ }
      langSays("", []);
      langCheck();
    });
  }
