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
  // Which language it is written in is found from the code itself (unless
  // somebody picks one), and a program can be in several files -- a tab
  // each over the box -- which are read together as the one program.
  //
  // The two boxes are one program for as long as nobody changes the
  // pseudocode under the other tab.  When somebody does, this box says so
  // and offers to write the pseudocode out in the language again -- the
  // page's own writer (18-write.js), the same one Export code uses.
  //
  // Like the pseudocode, what is written here is not kept between visits,
  // only through a reload, a save or a file (19-files.js carries it); how
  // the language is chosen is a preference, and is.
  var langFrom = null;                   // the code the pseudocode was last read from
  var langMade = null;                   // and the pseudocode that reading made
  var langAsked = false;                 // Build asked for by its keys, not its button
  var langFiles = [{ name: "", text: "" }];   // the program's files; the box holds one
  var langAt = 0;                        // which one
  var langSeen = null;                   // the language the code was last found to be in

  function langBox() { return el("#lang-code"); }

  // The languages the page reads but does not write -- Kotlin, Rust and the
  // rest (codeToPseudo.dialects) -- beside the ones it does both for.
  function readsOnly(code) { return !LANGS[code] && !!(codeToPseudo.dialects || {})[code]; }
  function langKnown(code) { return !!LANGS[code] || readsOnly(code); }

  // ------------------------------------------------ which language --
  // Found from what is written (codeToPseudo.detect): the picker's first
  // choice, and the one it starts on.  Picking a language by name says
  // which one it is when the code alone cannot -- a few lines any of them
  // might have written -- and holds until it is set back.
  function langNow() {
    var pick = el("#lang-pick");
    if (pick && langKnown(pick.value)) { return pick.value; }
    if (langSeen) { return langSeen; }
    try {
      var last = localStorage.getItem("flowchart-code-seen");
      if (last && langKnown(last)) { return last; }
    } catch (e) { /* nothing kept */ }
    return "python";
  }

  function dressLangPick() {
    var pick = el("#lang-pick");
    if (!pick) { return; }
    if (!pick.options.length) {
      var auto = document.createElement("option");
      auto.value = "auto";
      auto.textContent = TXT.lang_auto || "";
      pick.appendChild(auto);
      Object.keys(LANGS).concat(Object.keys(codeToPseudo.dialects || {})).forEach(function (code) {
        var one = document.createElement("option");
        one.value = code;
        one.textContent = langName(code);
        pick.appendChild(one);
      });
    }
    pick.value = "auto";
    try {
      var was = localStorage.getItem("flowchart-code-pick");
      if (was && langKnown(was)) { pick.value = was; }
    } catch (e) { /* storage turned off: found from the code, then */ }
  }

  // Look at the code again: what it is written in, said on the picker's
  // first line, and everything that goes by the language told if it has
  // changed.  A little while after the typing stops, not at every key.
  var detectDue = null;
  function langDetect() {
    clearTimeout(detectDue);
    detectDue = null;
    var was = langNow();
    var found = langHasCode() ? codeToPseudo.detect(langAll()) : null;
    if (found) {
      langSeen = found;
      try { localStorage.setItem("flowchart-code-seen", found); }
      catch (e) { /* this visit only */ }
    }
    var auto = el('#lang-pick option[value="auto"]');
    if (auto) {
      auto.textContent = found ? say("lang_auto_is", { lang: langName(found) })
                               : (TXT.lang_auto || "");
    }
    // the tabs' made-up names follow what is in the files (a class's name),
    // unless one of them is being named by hand right now
    if (!el(".lang-file-rename")) { drawFiles(); }
    if (langNow() !== was) {
      dressTranslate();
      numberLang();
    }
  }
  function detectSoon() {
    clearTimeout(detectDue);
    detectDue = setTimeout(langDetect, 250);
  }

  // What the box says with nothing in it.  The words are the page's own
  // language; the box is in whichever the code turns out to be.
  function placeLang() {
    var box = langBox();
    if (box) { box.placeholder = TXT.lang_place || ""; }
  }

  // ------------------------------------------------------- the files --
  // A tab for each file over the one box, which holds the file on show.
  // A file's name is its own where it has one -- opened from Files, or
  // given by double-clicking its tab -- and otherwise made up from what is
  // in it: a Java or C# class's name, or main and file2 and so on.
  function langKeep() {
    var box = langBox();
    if (box && langFiles[langAt]) { langFiles[langAt].text = box.value; }
  }

  // Every file as the reader wants it: the names people gave them, which
  // are the ones that say anything (helpers.py, Receipt.java).
  function langAll() {
    langKeep();
    return langFiles.map(function (one) { return { name: one.name || "", text: one.text || "" }; });
  }
  function langHasCode() {
    langKeep();
    return langFiles.some(function (one) { return String(one.text || "").trim(); });
  }
  // The whole of it, to tell whether it has changed since it was read.
  function langKey() {
    return JSON.stringify(langAll().map(function (one) { return [one.name, one.text]; }));
  }

  function fileLabel(k) {
    var one = langFiles[k];
    if (!one) { return ""; }
    if (one.name) { return one.name; }
    var lang = langNow(), ext = (LANGS[lang] || (codeToPseudo.dialects || {})[lang] || {}).ext || "txt";
    var named = (lang === "java" || lang === "csharp") &&
                /\bclass\s+([A-Za-z_]\w*)/.exec(one.text || "");
    if (named) { return named[1] + "." + ext; }
    return (k === 0 ? "main" : "file" + (k + 1)) + "." + ext;
  }

  function drawFiles() {
    var strip = el("#lang-files");
    if (!strip) { return; }
    strip.innerHTML = "";
    langFiles.forEach(function (one, k) {
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "lang-file" + (k === langAt ? " on" : "");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", k === langAt ? "true" : "false");
      tab.title = TXT.lang_file_tip || "";
      var name = document.createElement("span");
      name.className = "lang-file-name";
      name.textContent = fileLabel(k);
      tab.appendChild(name);
      tab.onclick = function () { if (k !== langAt) { showFile(k); } };
      tab.ondblclick = function () { renameFile(k, name); };
      if (langFiles.length > 1) {
        var drop = document.createElement("span");
        drop.className = "lang-file-x";
        drop.setAttribute("role", "button");
        drop.setAttribute("aria-label", TXT.lang_file_drop || "");
        drop.title = TXT.lang_file_drop || "";
        drop.innerHTML = '<svg viewBox="0 0 20 20"><path d="M6 6l8 8M14 6l-8 8"/></svg>';
        drop.onclick = function (ev) { ev.stopPropagation(); dropFile(k); };
        tab.appendChild(drop);
      }
      strip.appendChild(tab);
    });
    var add = document.createElement("button");
    add.type = "button";
    add.className = "lang-file add";
    add.title = TXT.lang_file_add || "";
    add.setAttribute("aria-label", TXT.lang_file_add || "");
    add.innerHTML = '<svg viewBox="0 0 20 20"><path d="M10 4.5v11M4.5 10h11"/></svg>';
    add.onclick = addFile;
    strip.appendChild(add);
    var keepAll = el("#lang-save-all");
    if (keepAll) { keepAll.hidden = langFiles.length < 2; }
  }

  function showFile(k) {
    var box = langBox();
    if (!box || !langFiles[k]) { return; }
    langKeep();
    langFiles[langAt].scroll = box.scrollTop;
    langAt = k;
    box.value = langFiles[k].text || "";
    box.scrollTop = langFiles[k].scroll || 0;
    drawFiles();
    numberLang();
    box.focus();
  }

  function addFile() {
    langKeep();
    langFiles.push({ name: "", text: "" });
    showFile(langFiles.length - 1);
    translateReady();
  }

  function dropFile(k) {
    var one = langFiles[k];
    if (!one) { return; }
    function gone() {
      langKeep();
      langFiles.splice(k, 1);
      if (!langFiles.length) { langFiles = [{ name: "", text: "" }]; }
      if (k < langAt || langAt >= langFiles.length) { langAt = Math.max(0, langAt - 1); }
      langBox().value = langFiles[langAt].text || "";
      drawFiles();
      numberLang();
      translateReady();
      langDetect();
    }
    if (String(one.text || "").trim()) {
      areYouSure(say("lang_drop_ask", { name: fileLabel(k) }), TXT.lang_drop_said || "",
                 TXT.delete || "", gone);
    } else {
      gone();
    }
  }

  // Double-click a tab to name its file.  Enter or clicking away keeps the
  // name; Esc leaves it as it was; nothing at all goes back to the made-up one.
  function renameFile(k, label) {
    var tab = label.parentNode, field = document.createElement("input");
    field.type = "text";
    field.className = "lang-file-rename";
    field.value = langFiles[k].name || fileLabel(k);
    field.setAttribute("aria-label", TXT.lang_file_tip || "");
    tab.replaceChild(field, label);
    field.focus();
    field.select();
    var done = false;
    function finish(keep) {
      if (done) { return; }
      done = true;
      if (keep) {
        var name = field.value.replace(/[\\/:*?"<>|]+/g, "").trim();
        langFiles[k].name = name;
      }
      drawFiles();
      if (keep) { langDetect(); }
    }
    field.addEventListener("keydown", function (ev) {
      ev.stopPropagation();
      if (ev.key === "Enter") { ev.preventDefault(); finish(true); }
      if (ev.key === "Escape") { ev.preventDefault(); finish(false); }
    });
    field.addEventListener("click", function (ev) { ev.stopPropagation(); });
    field.addEventListener("blur", function () { setTimeout(function () { finish(true); }, 0); });
  }

  // ------------------------------------------------ what it has to say --
  // Under the box: why the code could not be read, and on which line; or
  // what was read but will not run; or that the pseudocode has moved on
  // since, with the way back.  One at a time, and nothing when all is well.
  function langSays(how, parts) {
    var note = el("#lang-note");
    if (!note) { return; }
    note.innerHTML = "";
    // and over the box filling the screen, the words of it -- a mistake
    // made there is read there, not in the panel it is covering
    var full = el("#lang-full-note");
    if (full) { full.innerHTML = ""; }
    (parts || []).forEach(function (part) {
      if (typeof part === "string") {
        var p = document.createElement("p");
        p.className = "hint " + (how || "");
        p.textContent = part;
        note.appendChild(p);
        if (full) { full.appendChild(p.cloneNode(true)); }
      } else if (part) {
        note.appendChild(part);
        // a button over the full screen too, doing the same
        if (full) {
          var twin = part.cloneNode(true);
          twin.onclick = part.onclick;
          full.appendChild(twin);
        }
      }
    });
  }

  // Why the code could not be read, on which line -- chosen in the box --
  // and, where the reading knows what would put it right (a ; or a bracket
  // left out, one too many, a quote never closed, a line not lined up, a
  // word written wrong), a button that does it.  The fixes the reading came
  // with are tried first (codeToPseudo.tryMend), and the one offered is one
  // after which the code reads further.  Typed in, so Ctrl+Z takes it back
  // out, and read again the way it was just read: `again`.  Where putting
  // that right still leaves more that can be, Fix all does the lot.
  function langTrouble(err, again) {
    var text = err.line ? say("lang_line", { n: err.line, said: err.message }) : err.message;
    var parts = [err.line ? inFile(err.file, text) : text], got = null;
    var files = langAll(), lang = langNow();
    try { got = err.fixes && err.fixes.length ? codeToPseudo.tryMend(files, lang, err) : null; }
    catch (e) { got = null; }
    if (got) {
      parts.push(langMend(err, got, again));
      // and more after it?
      var next = null;
      try {
        codeToPseudo(files.map(function (one, k) { return k === got.file ? { name: one.name, text: got.text } : one; }), lang);
      } catch (e2) { next = e2; }
      if (next && next.fixes && next.fixes.length) { parts.push(langMendAll(again)); }
    }
    langSays("bad", parts);
    if (err.line) { langPickLine(err.line, err.file || 0); }
  }

  // What a fix's button says: the fix's own words, with the line it is on
  // where that is not the line the problem was said on.
  function fixLabel(fix, line) {
    var at = (fix.edits[0] || {}).line, key = fix.says;
    var fill = {};
    Object.keys(fix.fill || {}).forEach(function (name) { fill[name] = fix.fill[name]; });
    fill.line = at;
    if (key !== "lang_fix_many" && key !== "lang_fix_indent" && at && at !== line && TXT[key + "_at"]) { key += "_at"; }
    return say(key, fill);
  }

  // A file of the program made to say `now`: only the part that changes
  // typed in, so that Ctrl+Z takes it back out, and that part chosen so it
  // can be seen -- without the space around it.
  function langTypeIn(file, now) {
    if (!langFiles[file]) { return; }
    if (file !== langAt) { showFile(file); }
    var box = langBox(), was = box.value;
    if (was === now) { return; }
    var a = 0, b = 0;
    while (a < was.length && a < now.length && was[a] === now[a]) { a++; }
    while (b < was.length - a && b < now.length - a &&
           was[was.length - 1 - b] === now[now.length - 1 - b]) { b++; }
    var put = now.slice(a, now.length - b);
    typeOver(box, a, was.length - b, put);
    var lead = /^\s*/.exec(put)[0].length, tail = /\s*$/.exec(put)[0].length;
    box.setSelectionRange(a + lead, Math.max(a + lead, a + put.length - tail));
  }

  function langMend(err, got, again) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "mend";
    button.textContent = fixLabel(got.fix, err.line);
    button.title = TXT.lang_fix_tip || "";
    var from = (langAll()[got.file] || {}).text;
    button.onclick = function (ev) {
      ev.stopPropagation();
      if (!langFiles[got.file]) { return; }
      if (langAll()[got.file].text !== from) { again(); return; }   // changed since: read it as it is
      langTypeIn(got.file, got.text);
      again();
    };
    return button;
  }

  // What was read but can't be run, said -- and where that is a name written
  // wrong (pritn, Sytem.out), the button that puts it right
  // (codeToPseudo.tryRename); and where there are several, Fix all.
  function noteParts(notes, again) {
    var parts = [], files = langAll(), lang = langNow(), fixes = [], until = Date.now() + 1500;
    notes.forEach(function (n) {
      parts.push(inFile(n.file, n.text));
      if (!n.call || Date.now() > until) { return; }
      var got = null;
      try { got = codeToPseudo.tryRename(files, lang, n); } catch (e) { got = null; }
      if (got) {
        parts.push(langMend({ line: n.line }, got, again));
        fixes.push(got);
      }
    });
    if (fixes.length > 1) {
      var every = document.createElement("button");
      every.type = "button";
      every.className = "mend mend-all";
      every.textContent = TXT.lang_fix_all || "";
      every.title = TXT.lang_fix_all_tip || "";
      every.onclick = function (ev) {
        ev.stopPropagation();
        var now = langAll(), shown = langAt;
        fixes.forEach(function (got) {
          now[got.file].text = codeToPseudo.mended(now[got.file].text, got.fix);
        });
        now.forEach(function (one, k) {
          if (langFiles[k] && one.text !== langAll()[k].text) { langTypeIn(k, one.text); }
        });
        if (langAt !== shown && langFiles[shown]) { showFile(shown); }
        again();
      };
      parts.push(every);
    }
    return parts;
  }

  // A name swapped for another in code -- whole words only, and outside its
  // quotes and comments, so the words a program prints stay as they are.
  // (A backquote and what opens a block comment are spelt out: written
  // plainly, the website's page could not tell them from the real thing,
  // and would keep every comment in this part.)
  var BACKQUOTE = String.fromCharCode(96), NOTE_OPENS = "/" + "*";
  function swapCodeWord(text, word, instead, lang) {
    var out = "", i = 0, n = text.length, hash = lang === "python";
    while (i < n) {
      var c = text[i], two = text.substr(i, 2);
      if (c === '"' || c === "'" || c === BACKQUOTE) {
        var j = i + 1;
        while (j < n && text[j] !== c && text[j] !== "\n") { j += text[j] === "\\" ? 2 : 1; }
        out += text.slice(i, j + 1);
        i = j + 1;
      } else if ((hash && c === "#") || two === "//") {
        var eol = text.indexOf("\n", i);
        if (eol < 0) { eol = n; }
        out += text.slice(i, eol);
        i = eol;
      } else if (two === NOTE_OPENS) {
        var shut = text.indexOf("*/", i + 2);
        shut = shut < 0 ? n : shut + 2;
        out += text.slice(i, shut);
        i = shut;
      } else if (/[A-Za-z_]/.test(c) && (i === 0 || !/\w/.test(text[i - 1]))) {
        var w = /^\w+/.exec(text.slice(i, i + 256))[0];
        out += w === word ? instead : w;
        i += w.length;
      } else {
        out += c;
        i++;
      }
    }
    return out;
  }

  // A run's "did you mean total?", in Code: the name changed in the code
  // the pseudocode was read from, every use of it -- where the code then
  // still reads, and the pseudocode made from it no longer has the name.
  function codeMend(fix) {
    if (!langBox() || !fix.word || !fix.instead || !langHasCode()) { return null; }
    var lang = langNow(), changed = false;
    var now = langAll().map(function (one) {
      var text = swapCodeWord(one.text, fix.word, fix.instead, lang);
      if (text !== one.text) { changed = true; }
      return { name: one.name, text: text };
    });
    if (!changed) { return null; }
    try {
      var said = codeToPseudo(now, lang);
      var plain = said.text.replace(/"[^"\n]*"/g, "");
      if (new RegExp("\\b" + fix.word.replace(/[^\w]/g, "") + "\\b").test(plain)) { return null; }
    } catch (e) { return null; }
    var button = document.createElement("button");
    button.className = "mend";
    button.type = "button";
    button.textContent = say("w_mend_change", { word: fix.word, instead: fix.instead });
    button.title = TXT.lang_fix_tip || "";
    button.onclick = function (ev) {
      ev.stopPropagation();              // not the "show me the line" underneath
      var shown = langAt;
      now.forEach(function (one, k) {
        if (langFiles[k] && one.text !== langAll()[k].text) { langTypeIn(k, one.text); }
      });
      if (langAt !== shown && langFiles[shown]) { showFile(shown); }
      tapeFull(false);
      langAsked = true;
      el("#build").click();
    };
    return button;
  }

  // Everything the reading can put right, one after another, each file
  // typed in once -- and so taken back out with a Ctrl+Z a file.
  function langMendAll(again) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "mend mend-all";
    button.textContent = TXT.lang_fix_all || "";
    button.title = TXT.lang_fix_all_tip || "";
    button.onclick = function (ev) {
      ev.stopPropagation();
      var all;
      try { all = codeToPseudo.mendAll(langAll(), langNow()); } catch (e) { all = null; }
      if (all) {
        var shown = langAt;
        all.files.forEach(function (one, k) {
          if (langFiles[k] && one.text !== langAll()[k].text) { langTypeIn(k, one.text); }
        });
        if (langAt !== shown && langFiles[shown] && !all.err) { showFile(shown); }
      }
      again();
    };
    return button;
  }

  // The line a problem is on, chosen in the box -- in the file it is in,
  // which is put on show -- where anybody fixing it is going to look next.
  function langPickLine(line, file) {
    if (file && file !== langAt && langFiles[file]) { showFile(file); }
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

  // A line number, and the file it is in where there is more than one.
  function inFile(file, said) {
    return langFiles.length > 1 ? fileLabel(file || 0) + " · " + said : said;
  }

  // ----------------------------------------------------- reading it in --
  // The code, read into the pseudocode box.  True when it could be; when it
  // could not, the pseudocode and the chart are left as they were and the
  // box says why.
  // What the code says the program is called (codeToPseudo's title): used
  // for the title where the pseudocode has no name of its own to give.
  var langHint = "";
  function langTitle() { return byLang ? langHint : ""; }

  function readLangIn() {
    if (!langBox() || !el("#code")) { return false; }
    langDetect();
    var said;
    try {
      said = codeToPseudo(langAll(), langNow());
    } catch (err) {
      langTrouble(err, function () {
        langAsked = true;
        el("#build").click();
      });
      return false;
    }
    langFrom = langKey();
    langMade = said.text;
    langHint = said.title || "";
    if (el("#code").value !== said.text) {
      el("#code").value = said.text;
      newProgram();                      // named afresh from what it now says
      showStarts();
      countLines();
    }
    langSays("warn", noteParts(said.notes, function () {
      langAsked = true;
      el("#build").click();
    }));
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
          ((ev && ev.isTrusted) || asked || langKey() !== langFrom)) {
        if (!readLangIn()) {
          langTranslating = null;        // nothing to translate from, as it stands
          return;
        }
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
  // The pseudocode on the paper, written in the code's language -- by the
  // writer Export code uses -- into the box.  Only while the chart on the
  // paper is the pseudocode in the box: the writer writes the chart.
  function langCanWrite() {
    return !byHand && !!AST && typeof builtText === "string" &&
           !!el("#code") && builtText === el("#code").value && !!builtText.trim();
  }

  // `typed` puts it in the way typing would, so Ctrl+Z takes it back out:
  // the button writes over somebody's code, and that ought to be undoable.
  // A program kept in several files is written out as several files again.
  function langWriteOut(typed) {
    var box = langBox();
    if (!box || !langCanWrite() || readsOnly(langNow())) { return false; }
    var lang = langNow(), made;
    try { made = langFiles.length > 1 ? filesFor(lang) : [codeFor(lang)]; }
    catch (e) { return false; }
    if (!made || !made.length || typeof made[0].text !== "string") { return false; }
    function tidied(one) { return one.text.replace(/\s+$/, "") + "\n"; }
    if (made.length > 1) {
      langFiles = made.map(function (one) {
        return { name: one.file + "." + one.ext, text: tidied(one) };
      });
      langAt = 0;
      box.value = langFiles[0].text;
    } else if (typed) {
      langKeep();
      langFiles = [langFiles[langAt]];
      langAt = 0;
      typeOver(box, 0, box.value.length, tidied(made[0]));
    } else {
      langFiles = [{ name: "", text: tidied(made[0]) }];
      langAt = 0;
      box.value = langFiles[0].text;
    }
    box.setSelectionRange(0, 0);
    box.scrollTop = 0;
    drawFiles();
    langFrom = langKey();
    langMade = el("#code").value;
    langSays("", []);
    langDetect();
    numberLang();
    return true;
  }

  // Whether the code and the pseudocode still say the same thing, and if
  // not, the way to make them.  Asked on arriving here.
  function langCheck() {
    if (!byLang || !langBox() || !el("#code")) { return; }
    var pseudo = el("#code").value;
    // Nothing written here yet, and a chart drawn from pseudocode: that
    // program, in the language last used, to start from.
    if (!langHasCode()) {
      if (pseudo.trim() && langCanWrite()) { langWriteOut(); }
      return;
    }
    var moved = langMade !== null && pseudo !== langMade && pseudo.trim();
    if (!moved || !langCanWrite() || readsOnly(langNow())) { return; }
    var redo = document.createElement("button");
    redo.className = "btn small";
    redo.textContent = say("lang_rewrite", { lang: langName(langNow()) });
    redo.title = say("lang_rewrite_tip", { lang: langName(langNow()) });
    redo.onclick = function () { langWriteOut(true); };
    langSays("warn", [TXT.lang_stale, redo]);
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
    } else {
      langFull(false);                   // the code's own screen goes with its tab
    }
    dressTranslate();                    // Export code, or Translate code
  }

  // ------------------------------------------------- keeping it with a save --
  // What the Code box holds, for a save, a file or a reload to carry: the
  // files, how the language is chosen, and what it was last read into -- so
  // it comes back knowing whether the pseudocode has moved on from it.
  function langData() {
    if (!langBox() || !langHasCode()) { return null; }
    var pick = el("#lang-pick");
    return { lang: pick ? pick.value : "auto", files: langAll(), at: langAt,
             from: langFrom, made: langMade };
  }

  function wearLang(was) {
    var box = langBox();
    if (!box) { return; }
    was = was || {};
    var pick = el("#lang-pick");
    if (pick) { pick.value = was.lang && (langKnown(was.lang) || was.lang === "auto") ? was.lang : "auto"; }
    // saved before a program could be in several files, it is one file
    langFiles = (was.files && was.files.length ? was.files : [{ name: "", text: was.text || "" }])
      .map(function (one) { return { name: String(one.name || ""), text: String(one.text || "") }; });
    langAt = Math.min(Math.max(0, was.at || 0), langFiles.length - 1);
    box.value = langFiles[langAt].text;
    langFrom = typeof was.from === "string" ? was.from : null;
    langMade = typeof was.made === "string" ? was.made : null;
    // what was read before files were kept is the text of the one file
    if (langFrom !== null && langFrom.charAt(0) !== "[") {
      langFrom = JSON.stringify([["", langFrom]]);
    }
    drawFiles();
    langDetect();
    langSays("", []);
  }

  // Files of code, opened from Files: into the box, a tab each, the language
  // told by their names and what is in them, and drawn.
  var LANG_EXT = { py: "python", pyw: "python", java: "java", cs: "csharp",
                   cpp: "cpp", cc: "cpp", cxx: "cpp", hpp: "cpp", h: "cpp",
                   js: "javascript", mjs: "javascript", cjs: "javascript",
                   ts: "typescript", tsx: "typescript", mts: "typescript", c: "c",
                   kt: "kotlin", kts: "kotlin", swift: "swift", go: "go", rs: "rust" };
  function langOfFile(name) {
    var m = /\.([A-Za-z0-9]+)$/.exec(String(name || ""));
    var lang = m ? LANG_EXT[m[1].toLowerCase()] : null;
    return lang && langKnown(lang) ? lang : null;
  }
  function openCodeFile(name, text) {
    return openCodeFiles([{ name: name, text: text }]);
  }
  function openCodeFiles(list) {
    var box = langBox();
    if (!box || !list.length) { return false; }
    langFiles = list.map(function (one) {
      return { name: String(one.name || "").replace(/^.*[\\/]/, ""),
               text: String(one.text || "").replace(/\r\n?/g, "\n") };
    });
    langAt = 0;
    box.value = langFiles[0].text;
    if (el("#lang-pick")) { el("#lang-pick").value = "auto"; }
    try { localStorage.setItem("flowchart-code-pick", "auto"); } catch (e) { /* fine */ }
    langFrom = null;
    langMade = null;
    drawFiles();
    langDetect();
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
    drawFiles();
    langDetect();                        // the picker's first line says so
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
    langBox().addEventListener("input", function () {
      // what was wrong -- or that nothing was -- is about code that is not
      // there any more
      var note = el("#lang-note");
      if (note && el(".bad, .good", note)) { langSays("", []); }
      langKeep();
      translateReady();
      detectSoon();
      if (el("#lang-over") && !el("#lang-over").hidden) { numberLang(); }
    });
    langBox().addEventListener("scroll", function () {
      if (el("#lang-rule")) { el("#lang-rule").scrollTop = langBox().scrollTop; }
    });
    el("#lang-pick").addEventListener("change", function () {
      try { localStorage.setItem("flowchart-code-pick", el("#lang-pick").value); }
      catch (e) { /* kept for this visit only */ }
      langSays("", []);
      langDetect();
      drawFiles();
      dressTranslate();                  // never into the language it is already in
      numberLang();
    });
  }

  // ============================================================ translating ==
  // In the Code tab the program is code already, so the card under the run
  // does not write code out: it translates it.  Its list is every language
  // but the one the code is written in, and Translate shows the program in
  // the one picked on the code screen (showCode, 18-write.js) -- Copy, Save,
  // a file each -- while the box stays exactly as it was written.  It goes
  // by way of the pseudocode, which is what the writer writes from, so code
  // changed since it was last drawn is read in and drawn first.
  var langTranslating = null;            // what to translate into once the drawing lands

  function dressTranslate() {
    var pick = el("#see-code");
    if (!pick) { return; }
    var mine = byLang ? langNow() : null, was = pick.value;
    var want = Object.keys(LANGS).filter(function (code) { return code !== mine; });
    var have = [].map.call(pick.options, function (one) { return one.value; });
    if (have.join() !== want.join()) {
      pick.innerHTML = "";
      want.forEach(function (code) {
        var one = document.createElement("option");
        one.value = code;
        one.textContent = langName(code);
        pick.appendChild(one);
      });
      pick.value = want.indexOf(was) >= 0 ? was : want[0];
    }
    var tip = byLang ? TXT.tr_pick : TXT.r_lang_pick;
    if (tip) { pick.title = tip; pick.setAttribute("aria-label", tip); }
    translateReady();
  }

  // Ready as soon as there is code to translate: it is drawn on the way if
  // it has not been.  Anywhere else the run's readiness says (dressRunner).
  function translateReady() {
    if (!byLang || !langBox()) {
      dressRunner();                     // back to what the run's readiness says
      return;
    }
    var some = langHasCode() || runnable();
    all("#see-code, #code-apart, #code-write").forEach(function (b) { b.disabled = !some; });
  }

  (function () {
    var go = el("#code-write");
    if (!go || !go.onclick) { return; }
    var plain = go.onclick;
    go.onclick = function (ev) {
      if (byLang && langBox() && langHasCode() &&
          (langKey() !== langFrom || !runnable())) {
        langTranslating = el("#see-code").value;
        langAsked = true;
        el("#build").click();            // read in and drawn; langBuilt goes on
        return;
      }
      return plain.apply(this, arguments);
    };
  })();

  // A drawing has landed (09-build.js): a translation that was waiting for
  // it is shown, and the card is made ready for what is there now.
  function langBuilt() {
    translateReady();
    if (!langTranslating) { return; }
    var into = langTranslating;
    langTranslating = null;
    // after the rest of the landing, which starts the tape afresh for the
    // new program -- and would put the code screen away again with it
    setTimeout(function () {
      if (byLang && runnable()) { showCode(into); }
    }, 0);
  }

  // ================================================ the code, full screen ==
  // The same box, carried into a sheet over the whole page and back, the
  // way the pseudocode is -- the file tabs with it: everything listening to
  // it goes on listening, and there is only ever one of it.
  function numberLang() {
    var box = langBox(), rule = el("#lang-rule");
    if (!box || !rule) { return; }
    var rows = 1;
    for (var at = box.value.indexOf("\n"); at >= 0; at = box.value.indexOf("\n", at + 1)) { rows++; }
    if (rule._rows !== rows) {
      var out = [];
      for (var i = 1; i <= rows; i++) { out.push(i); }
      rule.textContent = out.join("\n");
      rule._rows = rows;
    }
    rule.scrollTop = box.scrollTop;
    var count = el("#lang-count");
    if (count) { count.textContent = say("code_lines", { n: rows }) + " · " + langName(langNow()); }
  }

  function langFull(want) {
    var box = langBox(), over = el("#lang-over");
    if (!box || !over || want === !over.hidden) { return; }
    var going = slideHome(box);          // the box, and the bars around it
    var strip = el("#lang-files");
    if (want) {
      tapeFull(false);                   // one screen at a time
      over.hidden = false;
      if (strip) { el("#lang-over .code-sheet").insertBefore(strip, el("#lang-full-note")); }
      el("#lang-full").appendChild(going);
      numberLang();
    } else {
      over.hidden = true;
      if (strip) { el("#lang-src").insertBefore(strip, el("#lang-home")); }
      el("#lang-home").insertBefore(going, el("#lang-home").firstChild);
    }
    var button = el("#lang-big");
    if (button) {
      button.setAttribute("aria-expanded", want ? "true" : "false");
      button.title = want ? (TXT.code_small || "") : (TXT.code_big || "");
    }
    box.focus();
  }

  // Check, over the code filling the screen, where Build is out of sight:
  // the code read through the way Build reads it, and what is wrong with it
  // said -- or that nothing is -- without drawing it or touching the
  // pseudocode, which Build still does.
  function langTest() {
    if (!langBox()) { return; }
    langDetect();
    var said;
    try { said = codeToPseudo(langAll(), langNow()); }
    catch (err) { langTrouble(err, langTest); return; }
    langSays(said.notes.length ? "warn" : "good",
             said.notes.length ? noteParts(said.notes, langTest) : [TXT.checked_good]);
  }

  if (el("#lang-over")) {
    el("#lang-big").onclick = function () { langFull(el("#lang-over").hidden); };
    el("#lang-done").onclick = function () { langFull(false); };
    if (el("#lang-check")) { el("#lang-check").onclick = langTest; }
    copyButton(function () { return langBox().value; }, el("#lang-copy"));
    el("#lang-save").onclick = function () {
      save(new Blob([langBox().value], { type: "text/plain;charset=utf-8" }), fileLabel(langAt));
    };
    if (el("#lang-save-all")) {
      el("#lang-save-all").onclick = function () {
        var files = langAll().map(function (one, k) { return { name: fileLabel(k), text: one.text }; });
        save(zipOf(files), (chartFileName() || "program") + ".zip");
      };
    }
    window.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !el("#lang-over").hidden) { langFull(false); }
    });
  }
