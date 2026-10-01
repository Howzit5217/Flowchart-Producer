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
  // Read in whatever was there before -- a file just opened, a translation
  // asked for -- but not put right: that waits for Build to be pressed.
  var langForced = false;
  var langFiles = [{ name: "", text: "" }];   // the program's files; the box holds one
  // The rest of a big folder: kept to be found and brought in, not read --
  // { name, path, entry, lang, low } (chosen in 19-import.js).
  var langShelf = [];
  var LANG_TABS = 20;                    // tabs over the box, at most
  var LIST_ROW = 30;                     // a row of the list of every file, in pixels
  var LIST_TALL = 8e6;                   // and the list no taller than this: see paintList
  var listOpen = false, listFind = "", listRowsNow = [];
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

  // The files, most important first: the one the program starts in, then
  // what it uses, as they were found when the folder was opened (`rank`,
  // 19-import.js) -- and any added since after them, in the order they came.
  function langOrder() {
    return langFiles.map(function (one, k) { return k; }).sort(function (a, b) {
      var ra = langFiles[a].rank, rb = langFiles[b].rank;
      ra = typeof ra === "number" ? ra : Infinity;
      rb = typeof rb === "number" ? rb : Infinity;
      return (ra === rb ? 0 : ra < rb ? -1 : 1) || a - b;
    });
  }

  // The tabs: the twenty that matter most -- and the one on show, wherever
  // it comes -- with every other file a press away, in the list under them.
  function drawFiles() {
    var strip = el("#lang-files");
    if (!strip) { return; }
    var list = el("#lang-list");
    var wasAt = list ? list.querySelector(".lang-list-rows").scrollTop : 0;
    if (list) { list.remove(); }        // kept, with what was typed into it, and where it was
    strip.innerHTML = "";
    var shown = langOrder().slice(0, LANG_TABS);
    if (shown.indexOf(langAt) < 0) { shown[shown.length - 1] = langAt; }
    var hidden = langFiles.length - shown.length + langShelf.length;
    if (hidden > 0) {
      var head = document.createElement("div");
      head.className = "lang-files-head";
      head.textContent = say("lang_top", { n: shown.length, all: bigNum(langFiles.length + langShelf.length) });
      strip.appendChild(head);
    } else {
      listOpen = false;
    }
    shown.forEach(function (k) {
      var one = langFiles[k];
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "lang-file" + (k === langAt ? " on" : "");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", k === langAt ? "true" : "false");
      tab.title = [one.path, TXT.lang_file_tip].filter(Boolean).join(" \u00b7 ");
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
    if (hidden > 0) {
      var more = document.createElement("button");
      more.type = "button";
      more.className = "lang-file more" + (listOpen ? " on" : "");
      more.setAttribute("aria-expanded", listOpen ? "true" : "false");
      more.textContent = listOpen ? (TXT.lang_less || "") : say("lang_more", { n: bigNum(hidden) });
      more.title = TXT.lang_more_tip || "";
      more.onclick = function () { fileList(!listOpen); };
      strip.appendChild(more);
    }
    if (listOpen) {
      strip.appendChild(list || makeList());
      el("#lang-list .lang-list-rows").scrollTop = wasAt;
      drawList();
    }
    var keepAll = el("#lang-save-all");
    if (keepAll) { keepAll.hidden = langFiles.length < 2; }
  }

  // ---- every file, in a list that opens under the tabs --------------------
  // A folder can hold a hundred thousand files.  They are all in here: the
  // ones Build reads first, most important at the top, then the rest of
  // the folder, likeliest first -- each found by typing part of its name or
  // its folder.  Only the rows in sight are made: the list is as tall as
  // all of them, and scrolled, the few in view are written afresh, so a
  // hundred thousand files cost what thirty do.  A file from the rest of
  // the folder is read when it is picked, and from then on is one of the
  // program's, read with the others when Build is pressed.
  function fileList(on) {
    listOpen = !!on;
    drawFiles();
    var find = el("#lang-list .lang-find");
    if (on && find) { find.focus(); }
  }

  function makeList() {
    var box = document.createElement("div");
    box.id = "lang-list";
    box.className = "lang-list";
    var top = document.createElement("div");
    top.className = "lang-list-top";
    var find = document.createElement("input");
    find.type = "search";
    find.className = "field lang-find";
    find.placeholder = TXT.lang_find || "";
    find.setAttribute("aria-label", TXT.lang_find || "");
    find.spellcheck = false;
    find.autocomplete = "off";
    find.value = listFind;
    var count = document.createElement("span");
    count.className = "lang-list-count";
    top.appendChild(find);
    top.appendChild(count);
    var rows = document.createElement("div");
    rows.className = "lang-list-rows";
    rows.setAttribute("role", "listbox");
    var room = document.createElement("div");
    room.className = "lang-list-room";
    rows.appendChild(room);
    box.appendChild(top);
    box.appendChild(rows);
    var due = 0;
    find.addEventListener("input", function () {
      clearTimeout(due);
      due = setTimeout(function () { listFind = find.value; rows.scrollTop = 0; drawList(); }, 90);
    });
    find.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        clearTimeout(due);
        listFind = find.value;
        drawList();
        var first = listRowsNow.filter(function (r) { return r.kind !== "head"; })[0];
        if (first) { listPick(first); }
      }
      if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); fileList(false); }
    });
    rows.addEventListener("scroll", function () { paintList(); });
    return box;
  }

  // Which rows there are, for what has been typed: every word of it
  // somewhere in the file's name or folder.
  function drawList() {
    var box = el("#lang-list");
    if (!box) { return; }
    var words = String(listFind || "").toLowerCase().split(/\s+/).filter(Boolean);
    function fits(low) {
      for (var w = 0; w < words.length; w++) { if (low.indexOf(words[w]) < 0) { return false; } }
      return true;
    }
    var mine = [], rest = [];
    langOrder().forEach(function (k) {
      var low = (String(langFiles[k].path || "") + " " + fileLabel(k)).toLowerCase();
      if (!words.length || fits(low)) { mine.push({ kind: "file", k: k }); }
    });
    for (var i = 0; i < langShelf.length; i++) {
      if (!words.length || fits(langShelf[i].low)) { rest.push({ kind: "shelf", s: i }); }
    }
    listRowsNow = [];
    if (mine.length) {
      listRowsNow.push({ kind: "head", text: say("lang_list_read", { n: bigNum(mine.length) }) });
      listRowsNow = listRowsNow.concat(mine);
    }
    if (rest.length) {
      listRowsNow.push({ kind: "head", text: say("lang_list_rest", { n: bigNum(rest.length) }) });
      listRowsNow = listRowsNow.concat(rest);
    }
    if (!listRowsNow.length) { listRowsNow.push({ kind: "head", text: TXT.lang_list_none || "", none: true }); }
    box.querySelector(".lang-list-count").textContent =
      say("lang_count", { n: bigNum(langFiles.length + langShelf.length) });
    box.querySelector(".lang-list-room").style.height =
      Math.min(listRowsNow.length * LIST_ROW, LIST_TALL) + "px";
    paintList();
  }

  // The rows in sight, and a few either side of them.  A browser will not
  // make a box taller than some tens of millions of pixels, and a million
  // files are thirty million; past LIST_TALL the bar stands for the whole
  // list rather than for its pixels, and the rows are set where the view is.
  function paintList() {
    var rows = el("#lang-list .lang-list-rows"), room = el("#lang-list .lang-list-room");
    if (!rows || !room) { return; }
    var view = rows.clientHeight || 300, n = listRowsNow.length;
    var whole = n * LIST_ROW <= LIST_TALL;
    var first = whole ? rows.scrollTop / LIST_ROW
              : rows.scrollTop / Math.max(1, LIST_TALL - view) * Math.max(0, n - view / LIST_ROW);
    var from = Math.max(0, Math.floor(first) - 4);
    var upto = Math.min(n, from + Math.ceil(view / LIST_ROW) + 8);
    room.innerHTML = "";
    for (var i = from; i < upto; i++) {
      room.appendChild(listRow(listRowsNow[i], whole ? i * LIST_ROW : rows.scrollTop + (i - first) * LIST_ROW));
    }
  }

  function listRow(r, top) {
    if (r.kind === "head") {
      var head = document.createElement("div");
      head.className = "lang-row-head" + (r.none ? " none" : "");
      head.style.top = top + "px";
      head.textContent = r.text;
      return head;
    }
    var path = r.kind === "file" ? String(langFiles[r.k].path || "") : langShelf[r.s].path;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "lang-row" + (r.kind === "shelf" ? " shelf" : "") +
                  (r.kind === "file" && r.k === langAt ? " on" : "");
    b.setAttribute("role", "option");
    b.style.top = top + "px";
    var name = document.createElement("span");
    name.className = "lang-row-name";
    name.textContent = r.kind === "file" ? fileLabel(r.k) : langShelf[r.s].name;
    var where = document.createElement("span");
    where.className = "lang-row-where";
    where.textContent = path.replace(/[^\/]*$/, "").replace(/\/$/, "");
    b.appendChild(name);
    b.appendChild(where);
    b.title = r.kind === "shelf" ? [path, TXT.lang_list_bring].filter(Boolean).join(" \u00b7 ") : path;
    b.onclick = function () { listPick(r); };
    return b;
  }

  function listPick(r) {
    if (r.kind === "file") { if (r.k !== langAt) { showFile(r.k); } else { drawFiles(); } return; }
    bringIn(langShelf[r.s]);
  }

  // A file from the rest of the folder, read and made one of the program's.
  function bringIn(one) {
    if (!one || one.coming) { return; }
    one.coming = true;
    entryText(one.entry).then(function (text) {
      var at = langShelf.indexOf(one);
      if (at >= 0) { langShelf.splice(at, 1); }
      langKeep();
      langFiles.push({ name: one.name, path: one.path, text: text });
      showFile(langFiles.length - 1);
      translateReady();
      langDetect();
    }, function () { one.coming = false; });
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

  // ------------------------------------------------ putting it right --
  // Working out what would put the code right means reading it again for
  // every fix tried, and Fix all does that for one problem after another:
  // on a long program with a lot wrong, a great many readings.  Done on the
  // page's own thread, the page stood still until it was over -- nothing
  // painted, no button answered -- and Fix all gave up part way.  So it is
  // done on a thread of its own, as Python's drawing is (09-build.js): the
  // reader handed whole to a worker (codeReader, 18-from-code.js), and the
  // page told how far through the code it has got, on a bar like the
  // chart's.  Where a browser will not give a worker, it is done here, a
  // little at a time, the page painting in between.
  var fixHand = null;                    // null: not made yet.  false: none to be had
  var fixJobs = {}, fixNext = 1;

  // A stop, as plain words and numbers, to go between threads.
  function fixPlain(err) {
    return err ? { message: err.message, line: err.line || 0, file: err.file || 0, said: err.said || "" } : null;
  }
  // The quick job, the same in the worker and out of it: the name each call
  // that can't be run was most likely meant to have.
  function fixOnce(read, ask) {
    return { names: ask.notes.map(function (n) {
      try { return read.tryRename(ask.files, ask.lang, n); } catch (e) { return null; }
    }) };
  }

  // What runs in the worker, after the reader and say().
  function fixerBody() {
    self.onmessage = function (ev) {
      var ask = ev.data, out;
      TXT = ask.words || TXT;
      try {
        if (ask.kind === "all") {
          var m = codeToPseudo.mender(ask.files, ask.lang), until = Date.now() + 60000, said = 0;
          while (!m.step() && Date.now() < until) {
            if (Date.now() - said > 80) {
              said = Date.now();
              self.postMessage({ id: ask.id, at: m.reach() });
            }
          }
          var all = m.result();
          out = { files: all.files, n: all.n, err: fixPlain(all.err), fixes: all.fixes };
        } else {
          out = fixOnce(codeToPseudo, ask);
        }
      } catch (e) {
        out = { failed: String(e && e.message || e) };
      }
      out.id = ask.id;
      out.done = true;
      self.postMessage(out);
    };
  }

  function fixWorker() {
    if (fixHand !== null) { return fixHand; }
    fixHand = false;
    try {
      var head = "var TXT = {};\n" +
        "function say(key, fill) { var out = TXT[key] || key; for (var n in (fill || {})) " +
        "{ out = out.split('{' + n + '}').join(fill[n]); } return out; }\n";
      var blob = new Blob([head, "var codeToPseudo = (" + codeReader.toString() + ")();\n",
                           fixPlain.toString(), "\n", fixOnce.toString(), "\n",
                           "(" + fixerBody.toString() + ")();\n"], { type: "text/javascript" });
      var hand = new Worker(URL.createObjectURL(blob));
      hand.onmessage = function (ev) {
        var job = fixJobs[ev.data.id];
        if (!job) { return; }
        if (!ev.data.done) {
          if (job.step) { job.step(ev.data.at); }
          return;
        }
        delete fixJobs[ev.data.id];
        if (ev.data.failed) { job.fail(); } else { job.done(ev.data); }
      };
      // A worker that cannot run the reader: everything done here instead.
      hand.onerror = function (ev) {
        if (ev && ev.preventDefault) { ev.preventDefault(); }
        var waiting = fixJobs;
        fixJobs = {};
        try { hand.terminate(); } catch (e) { /* gone already */ }
        fixHand = false;
        Object.keys(waiting).forEach(function (id) { waiting[id].fail(); });
      };
      fixHand = hand;
    } catch (e) { fixHand = false; }
    return fixHand;
  }

  // Fix all no longer wanted -- the code changed under it -- and still
  // going: the worker put down, and a fresh one made when next it is asked.
  function fixQuit() {
    var busy = Object.keys(fixJobs).some(function (id) { return fixJobs[id].all; });
    if (!busy || !fixHand) { return; }
    try { fixHand.terminate(); } catch (e) { /* gone already */ }
    fixHand = null;
    fixJobs = {};
    buildBusy(false);                    // the job it was red for is gone
  }

  // Build, while the code is being put right: red, the way it is while a
  // chart is drawn, and not to be pressed again until it is done -- Check
  // too, in full screen, where it is the button that set it going.
  // `keep` lets go of the press but keeps the red, for the drawing that
  // follows straight on from it, which is red in its own right.
  function buildBusy(on, keep) {
    ["#build", "#lang-check"].forEach(function (q) {
      var b = el(q);
      if (!b) { return; }
      b.disabled = !!on;
      if (on) { b.classList.remove("done"); }
      if (!keep) { b.classList.toggle("working", !!on); }
    });
  }

  // A job for the fixer -- {kind, files, lang, notes} -- and a promise of
  // what it made of it.  `step(at)` hears how far through the code Fix all
  // has got, 0 to 1.
  function fixAsk(ask, step) {
    ask.words = {};
    Object.keys(TXT).forEach(function (key) { if (/^cm_/.test(key)) { ask.words[key] = TXT[key]; } });
    return new Promise(function (done) {
      function here() { fixHere(ask, step, done); }
      var hand = fixWorker();
      if (!hand) { setTimeout(here, 0); return; }
      var id = fixNext++;
      ask.id = id;
      fixJobs[id] = { step: step, done: done, fail: here, all: ask.kind === "all" };
      hand.postMessage(ask);
    });
  }

  // The same, on the page's own thread: Fix all a few fixes at a time,
  // with the page let get on between them.
  function fixHere(ask, step, done) {
    if (ask.kind !== "all") {
      var out;
      try { out = fixOnce(codeToPseudo, ask); } catch (e) { out = null; }
      done(out);
      return;
    }
    var m;
    try { m = codeToPseudo.mender(ask.files, ask.lang); } catch (e) { done(null); return; }
    var until = Date.now() + 60000;
    (function slice() {
      var stop = Date.now() + 40, over = false;
      try {
        while (!(over = m.step()) && Date.now() < stop) { /* on to the next */ }
      } catch (e) { done(null); return; }
      if (!over && Date.now() < until) {
        if (step) { step(m.reach()); }
        setTimeout(slice, 0);
        return;
      }
      var all = m.result();
      done({ files: all.files, n: all.n, err: fixPlain(all.err), fixes: all.fixes });
    })();
  }

  // ---- what the buttons go in --
  // A place in what is said under the box, filled once the fixer has
  // answered.  The words go there at once; the buttons follow, and there is
  // a copy of each over the box filling the screen (langSays), so each copy
  // gets buttons of its own.  What is said again before the answer comes --
  // the code changed, read again -- has no such place, and the answer goes
  // nowhere.
  var slotNext = 1;
  function fixSlot() {
    var slot = document.createElement("div");
    slot.className = "fix-slot";
    slot.setAttribute("data-slot", "s" + slotNext++);
    return slot;
  }
  function fillSlot(slot, make) {
    var id = typeof slot === "string" ? slot : slot.getAttribute("data-slot");
    all('[data-slot="' + id + '"]').forEach(function (one) {
      one.innerHTML = "";
      make().forEach(function (part) { one.appendChild(part); });
    });
  }

  // ---------------------------------------- put right, and said so --
  // Build reads the code in, and where it will not read -- a ; or a bracket
  // left out, one too many, a quote never closed, a line not lined up, a
  // word written wrong -- everything the reading knows how to put right is
  // put right first, in the fixer's own time with the bar showing under
  // the box, and the chart is drawn from the code as it then is.  A call
  // whose name was written wrong (pritn, Sytem.out) is put right the same
  // way.  What was put right is a button under the box, opening on the
  // list of it -- each mistake, the line it was on, and what was done --
  // to see and learn from; it is all typed in, so Ctrl+Z takes it back
  // out, and the list can put it all back too.  Check, over the code
  // filling the screen, does the same, short of drawing.  Only when asked:
  // a drawing the page asks for itself (a reload) says what is wrong and
  // leaves the code alone.
  var fixTried = null;                   // the code last put right, not tried twice
  var renameTried = null;                // and the code last looked at for names written wrong
  var fixReport = null;                  // what was put right (fixReportShow)
  var fixTyping = false;                 // the fixes going in, which is not somebody typing
  var fixOpen = false;                   // the list open under its button

  // What could not be put right, said the way it always was.
  function langStop(err) {
    var text = err.line ? say("lang_line", { n: err.line, said: err.message }) : err.message;
    langSays("bad", [err.line ? inFile(err.file, text) : text]);
    if (err.line) { langPickLine(err.line, err.file || 0); }
  }

  // The fixes typed in, a file at a time.
  function langPutIn(files) {
    var shown = langAt;
    fixTyping = true;
    try {
      files.forEach(function (one, k) {
        if (langFiles[k] && one.text !== langAll()[k].text) { langTypeIn(k, one.text); }
      });
    } finally { fixTyping = false; }
    if (langAt !== shown && langFiles[shown]) { showFile(shown); }
  }

  // The code would not read.  True where it has gone off to put it right,
  // and `again` is called once it has -- to draw, or to check, the code as
  // it then is.
  function langAutoFix(err, asked, again) {
    var key = langKey();
    if (!asked || !err.fixes || !err.fixes.length || fixTried === key) { langStop(err); return false; }
    fixTried = key;
    var before = langAll(), slot = fixSlot(), id = slot.getAttribute("data-slot"), began = Date.now();
    langSays("", [slot]);
    fillSlot(slot, function () { return [fixBar()]; });
    fixBarTo(id, 0);
    buildBusy(true);
    fixAsk({ kind: "all", files: before, lang: langNow() }, function (at) {
      fixBarTo(id, at);
    }).then(function (got) {
      // changed while it worked: that code is gone
      if (langKey() !== key) { buildBusy(false); return; }
      if (!got || !got.n) { buildBusy(false); langStop(err); return; }
      try {
        langPutIn(got.files);
        fixTried = langKey();             // what is left, if anything, is said, not tried again
        fixReportAdd(before, got.fixes || [], key);
        fixBarTo(id, 1, true);
      } catch (e) {
        // never a bar left standing: what is wrong said instead
        buildBusy(false);
        langStop(err);
        setTimeout(function () { throw e; }, 0);
        return;
      }
      // full, a moment to be seen -- and not a flash where it was quick
      setTimeout(function () { goOnFrom(again); }, Date.now() - began < 300 ? 120 : 360);
    });
    return true;
  }

  // Put right, and on to what it was put right for: the drawing, which is
  // red as well, so the button stays red into it -- or Check, which draws
  // nothing, and the red goes.
  function goOnFrom(again) {
    buildBusy(false, true);
    again();
    var build = el("#build");
    if (!build || !build.disabled) { buildBusy(false); }
  }

  // The code read, and calls in it can't be run: where that is a name
  // written wrong, it is put right, and the code read again.  True where it
  // has gone off to look.
  function langAutoRename(notes, asked, again) {
    var key = langKey(), calls = notes.filter(function (n) { return n.call; });
    if (!asked || !calls.length || renameTried === key) { return false; }
    renameTried = key;
    var before = langAll();
    buildBusy(true);
    fixAsk({ kind: "rename", files: before, lang: langNow(), notes: calls }).then(function (got) {
      if (langKey() !== key) { buildBusy(false); return; }
      var found = [];
      ((got && got.names) || []).forEach(function (one, i) {
        if (one) { found.push({ file: one.file, fix: one.fix, stop: { line: calls[i].line, file: calls[i].file || 0, text: calls[i].text } }); }
      });
      if (found.length) {
        var now = langAll();
        found.forEach(function (one) {
          now[one.file].text = codeToPseudo.mended(now[one.file].text, one.fix);
        });
        langPutIn(now);
        renameTried = langKey();
        fixReportAdd(before, found, key);
      }
      goOnFrom(again);
    });
    return true;
  }

  // ---- the list of what was put right --
  // Each fix, said where it ended up: a line put in above a mistake moves
  // the mistakes below it down one.
  function fixReportAdd(before, fixes, key) {
    var items = fixes.map(function (one) {
      var at = (one.fix.edits[0] || {}).line || one.stop.line || 0;
      return { file: one.file || 0, line: at, said: one.stop.message, note: one.stop.text, fix: one.fix };
    });
    items.forEach(function (item, i) {
      fixes.slice(i + 1).forEach(function (later) {
        if ((later.file || 0) !== item.file) { return; }
        later.fix.edits.forEach(function (e) {
          if (e.col === undefined && e.indent === undefined && e.line && e.line <= item.line) { item.line++; }
        });
      });
    });
    // more put right straight after -- a name, once the code read -- is
    // more of the same list
    if (fixReport && fixReport.after === key) {
      fixReport.items = fixReport.items.concat(items);
    } else {
      fixReport = { before: before, items: items };
      fixOpen = false;
    }
    fixReport.after = langKey();
    fixReportShow();
  }

  // Gone, once the code has moved on from what it was put right to: the
  // lines it names are not where they were.
  function fixReportDrop() {
    if (!fixReport || langKey() === fixReport.after) { return; }
    fixReport = null;
    fixReportShow();
  }

  function fixReportShow() {
    ["#lang-fixed", "#lang-full-fixed"].forEach(function (where) {
      var box = el(where);
      if (!box) { return; }
      box.innerHTML = "";
      box.hidden = !fixReport || !fixReport.items.length;
      if (box.hidden) { return; }
      var n = fixReport.items.length;
      var head = document.createElement("button");
      head.type = "button";
      head.className = "fixed-head";
      head.setAttribute("aria-expanded", fixOpen ? "true" : "false");
      head.title = TXT.lang_fixed_tip || "";
      head.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg><span></span>' +
                       '<svg class="fixed-turn" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 8l4 4 4-4"/></svg>';
      el("span", head).textContent = n === 1 ? (TXT.lang_fixed_one || "") : say("lang_fixed_many", { n: n });
      head.onclick = function () { fixOpen = !fixOpen; fixReportShow(); };
      box.appendChild(head);
      if (!fixOpen) { return; }
      var list = document.createElement("div");
      list.className = "fixed-list";
      // down the code, the way it is read
      fixReport.items.slice().sort(function (a, b) {
        return (a.file - b.file) || (a.line - b.line);
      }).forEach(function (item) {
        var row = document.createElement("button");
        row.type = "button";
        row.className = "fixed-item";
        row.title = TXT.r_show_line || "";
        var what = document.createElement("span");
        what.className = "fixed-what";
        what.textContent = inFile(item.file, item.note ||
          (item.line ? say("lang_line", { n: item.line, said: item.said }) : item.said));
        var did = document.createElement("span");
        did.className = "fixed-did";
        did.textContent = fixLabel(item.fix, item.line);
        row.appendChild(what);
        row.appendChild(did);
        row.onclick = function () { langPickLine(item.line, item.file); };
        list.appendChild(row);
      });
      var back = document.createElement("button");
      back.type = "button";
      back.className = "btn small fixed-back";
      back.textContent = TXT.lang_fixed_undo || "";
      back.onclick = function () {
        var was = fixReport && fixReport.before;
        if (!was) { return; }
        if (was.length === langFiles.length) { langPutIn(was); }
        fixTried = renameTried = langKey();   // as it was, and not put right again unasked for
        fixReport = null;
        fixReportShow();
      };
      list.appendChild(back);
      box.appendChild(list);
    });
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

  // The bar: the chart's own (09-build.js), in the place of the buttons.
  function fixBar() {
    var box = document.createElement("div");
    box.className = "fix-bar";
    box.setAttribute("role", "progressbar");
    box.setAttribute("aria-valuemin", "0");
    box.setAttribute("aria-valuemax", "100");
    box.setAttribute("aria-label", TXT.lang_fixing || "");
    box.innerHTML = '<div class="bb-top"><span class="bb-said"></span><span class="bb-pct"></span></div>' +
                    '<div class="bb-track"><div class="bb-fill"></div><div class="bb-shine"></div></div>';
    el(".bb-said", box).textContent = TXT.lang_fixing || "";
    return box;
  }
  // How far through the code it has got, on every copy of the bar; never
  // backwards.
  function fixBarTo(slot, at, full) {
    all('[data-slot="' + slot + '"] .fix-bar').forEach(function (box) {
      var was = +(box.getAttribute("aria-valuenow") || 0) / 100;
      var now = Math.max(was, Math.min(full ? 1 : 0.99, at || 0));
      el(".bb-pct", box).textContent = Math.floor(now * 100) + "%";
      el(".bb-fill", box).style.transform = "scaleX(" + now.toFixed(3) + ")";
      el(".bb-shine", box).style.clipPath = "inset(0 " + ((1 - now) * 100).toFixed(1) + "% 0 0)";
      box.setAttribute("aria-valuenow", String(Math.floor(now * 100)));
      if (full) { box.classList.add("full"); }
    });
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
  // What the code says the program is called, for the Title box
  // (codeTitle, 09-names.js): the files as they were read, the folder they
  // came in, and what the reading said the program is called (the class
  // main is kept in, or the one function main calls).
  var langNamed = null;
  var langFolder = "";                   // the folder the files were opened from
  function langNaming() { return byLang ? langNamed : null; }

  // `asked`: Build pressed, or asked for by its keys -- where what is wrong
  // with the code is put right (langAutoFix).
  // `quiet`: read in because code was put in -- a file opened, dropped or
  // pasted, a reload putting it back -- and not because anybody asked.
  // Then what is wrong with it is not said: nothing is, until Build is
  // pressed, which puts it right and says what it did.  Code that reads is
  // drawn either way.
  function readLangIn(asked, quiet) {
    if (!langBox() || !el("#code")) { return false; }
    langDetect();
    fixReportDrop();
    function again() {
      langAsked = true;
      el("#build").click();
    }
    var said;
    try {
      said = codeToPseudo(langAll(), langNow());
    } catch (err) {
      if (quiet) { langSays("", []); return false; }
      langAutoFix(err, asked, again);
      return false;
    }
    if (langAutoRename(said.notes, asked, again)) { return false; }
    langFrom = langKey();
    langMade = said.text;
    langNamed = { files: langAll(), folder: langFolder, hint: said.title || "" };
    if (el("#code").value !== said.text) {
      el("#code").value = said.text;
      newProgram();                      // named afresh from what it now says
      showStarts();
      countLines();
    }
    langSays("warn", quiet ? [] : said.notes.map(function (n) { return inFile(n.file, n.text); }));
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
      var asked = langAsked, forced = langForced;
      langAsked = false;
      langForced = false;
      var byPerson = (ev && ev.isTrusted) || asked;
      if (byLang && langBox() && (byPerson || forced || langKey() !== langFrom)) {
        // said out loud only when somebody asked: Build, its keys, or
        // Translate (forced "say"); quiet when code was only put in
        if (!readLangIn(byPerson, !byPerson && forced !== "say")) {
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
  // (Not the rest of a big folder: that is files on the disk, and a reload
  // or a save keeps the program read from it.)
  function langData() {
    if (!langBox() || !langHasCode()) { return null; }
    var pick = el("#lang-pick");
    var files = langAll();
    langFiles.forEach(function (one, k) {
      if (typeof one.rank === "number") { files[k].rank = one.rank; }
      if (one.path) { files[k].path = one.path; }
    });
    return { lang: pick ? pick.value : "auto", files: files, at: langAt,
             from: langFrom, made: langMade, folder: langFolder };
  }

  function wearLang(was) {
    var box = langBox();
    if (!box) { return; }
    was = was || {};
    var pick = el("#lang-pick");
    if (pick) { pick.value = was.lang && (langKnown(was.lang) || was.lang === "auto") ? was.lang : "auto"; }
    // saved before a program could be in several files, it is one file
    langFiles = (was.files && was.files.length ? was.files : [{ name: "", text: was.text || "" }])
      .map(function (one) {
        return { name: String(one.name || ""), text: String(one.text || ""), path: String(one.path || ""),
                 rank: typeof one.rank === "number" ? one.rank : undefined };
      });
    langShelf = [];
    listOpen = false;
    langAt = Math.min(Math.max(0, was.at || 0), langFiles.length - 1);
    box.value = langFiles[langAt].text;
    langFrom = typeof was.from === "string" ? was.from : null;
    langMade = typeof was.made === "string" ? was.made : null;
    langFolder = String(was.folder || "");
    langNamed = null;
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
  // `shelf`, where a folder was too big to read whole, is the rest of it:
  // { name, path, entry, lang }, likeliest first, read when picked from
  // the list of files.
  function openCodeFiles(list, shelf) {
    var box = langBox();
    if (!box || !list.length) { return false; }
    langFiles = list.map(function (one) {
      return { name: String(one.name || "").replace(/^.*[\\/]/, ""),
               text: String(one.text || "").replace(/\r\n?/g, "\n"),
               path: String(one.path || ""),
               rank: typeof one.rank === "number" ? one.rank : undefined };
    });
    langShelf = (shelf || []).map(function (one) {
      var path = String(one.path || one.name || "");
      return { name: String(one.name || "").replace(/^.*[\\/]/, ""), path: path,
               entry: one.entry, lang: one.lang, low: path.toLowerCase() };
    });
    listOpen = false;
    listFind = "";
    // the folder they all came in, which is as often as not what the
    // program is called (LibrarySystem/Main.java)
    var tops = list.map(function (one) {
      var parts = String(one.path || one.name || "").split(/[\\/]/);
      return parts.length > 1 ? parts[0] : "";
    });
    langFolder = tops[0] && tops.every(function (t) { return t === tops[0]; }) ? tops[0] : "";
    langNamed = null;
    langAt = langOrder()[0] || 0;        // on show: the one it starts in
    box.value = langFiles[langAt].text;
    if (el("#lang-pick")) { el("#lang-pick").value = "auto"; }
    try { localStorage.setItem("flowchart-code-pick", "auto"); } catch (e) { /* fine */ }
    langFrom = null;
    langMade = null;
    drawFiles();
    langDetect();
    setMode(false, true);
    // Read in and drawn, whatever was there -- but nothing put right: a
    // file is opened to be looked at, and what is wrong with it is said,
    // not mended, until Build is pressed.
    langForced = true;
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
      if (fixTyping) { return; }         // the fixes going in: not somebody typing
      var note = el("#lang-note");
      if (note && el(".bad, .good, .fix-bar", note)) { langSays("", []); }
      fixQuit();                         // putting right code that has gone
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
        langForced = "say";              // read in, not put right: that is Build's
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
    fixReportDrop();
    var said;
    try { said = codeToPseudo(langAll(), langNow()); }
    catch (err) { langAutoFix(err, true, langTest); return; }
    if (langAutoRename(said.notes, true, langTest)) { return; }
    langSays(said.notes.length ? "warn" : "good",
             said.notes.length ? said.notes.map(function (n) { return inFile(n.file, n.text); })
                               : [TXT.checked_good]);
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
