// ---------------------------------------------------------------------------
//  35-wipe.js -- clearing everything, for a clean slate
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ======================================================== starting over ==
  // Everything this page keeps, gone: the pseudocode and the chart, the
  // flowchart drawn by hand, the code and its files, the run, the tests --
  // and, unless asked not to, saved progress and solved puzzles, and the
  // colors, shapes and settings -- and the page opened again as it was the
  // very first time.
  //
  // It is the one thing on the page that cannot be taken back, so it is
  // kept a long way from a slip of the hand.  It lives at the foot of
  // Settings, not in a toolbar; it asks twice -- first what is to go, then
  // whether to save a copy before it does -- and the second time it will
  // not go on until a word is typed: CLEAR, in the page's own language.
  // Enter, Escape and a click outside all mean "no".
  //
  // What the page keeps is all under names beginning "flowchart-": the
  // browser's storage for this site (13-hand-keep.js, 05-keep.js and the
  // rest), the tab's own storage that a reload puts back (29-saves.js), the
  // database saved progress is in, and the one the folder to save into is
  // remembered in (19-folder.js).  The work is cleared by opening the page
  // afresh, so nothing held in memory can outlive it -- and `wipedOut`
  // stops the going from writing the work down again on its way out.
  var wipedOut = false;
  var WIPE_WORK = /^flowchart-(hand|hand-clip|tests|puzzle-work)$/;   // always
  var WIPE_KEPT = /^flowchart-(saves|solved|pz-seen)$/;              // saved progress

  function wipeWord() { return String(TXT.wipe_word || "CLEAR"); }

  function wipeShow(step) {
    var over = el("#wipe-over");
    if (!over) { return; }
    over.hidden = false;
    el("#wipe-one").hidden = step !== 1;
    el("#wipe-two").hidden = step !== 2;
    el("#wipe-title").textContent = step === 1 ? TXT.wipe_title1 : TXT.wipe_title2;
    if (step === 1) {
      el("#wipe-no1").focus();          // the safe answer under the hand
      return;
    }
    // The word to type, in the words around it, standing out from them.
    var label = el("#wipe-type-label"), parts = String(TXT.wipe_type || "").split("{word}");
    label.textContent = "";
    parts.forEach(function (bit, i) {
      if (i) {
        var b = document.createElement("b");
        b.textContent = wipeWord();
        label.appendChild(b);
      }
      label.appendChild(document.createTextNode(bit));
    });
    var word = el("#wipe-word");
    word.value = "";
    word.setAttribute("aria-label", label.textContent);
    el("#wipe-go").disabled = true;
    el("#wipe-saved").textContent = "";
    el("#wipe-save").focus();           // saving is the first thing offered
  }

  function wipeShut() {
    var over = el("#wipe-over");
    if (!over || over.hidden || wipedOut) { return false; }
    over.hidden = true;
    var open = el("#wipe-open");
    if (open) { open.focus(); }
    return true;
  }

  // The file a copy is saved as -- what saveProject calls it (19-files.js).
  function wipeCopyName() {
    var name = (el("#f-title") && el("#f-title").value) || FILE || "flowchart";
    return name.replace(/[^A-Za-z0-9 _-]/g, "") + ".flowchart.json";
  }

  // A database emptied or dropped, or as near as the browser will let it
  // be in a moment: a page with it open in another tab keeps it from going
  // until that tab does, and the clearing does not wait on that for ever.
  function dropDb(name) {
    return new Promise(function (done) {
      try {
        var ask = indexedDB.deleteDatabase(name);
        ask.onsuccess = ask.onerror = ask.onblocked = function () { done(); };
      } catch (e) { done(); }
    });
  }

  function wipeStorage(how) {
    try { sessionStorage.clear(); } catch (e) { /* nothing kept there, then */ }
    try {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) { keys.push(localStorage.key(i)); }
      keys.forEach(function (k) {
        if (!/^flowchart-/.test(String(k))) { return; }
        var go = WIPE_WORK.test(k) || (WIPE_KEPT.test(k) ? how.saves : how.settings);
        if (go) { localStorage.removeItem(k); }
      });
    } catch (e) { /* storage turned off: there is nothing in it to clear */ }
  }

  function wipeAll(how) {
    wipedOut = true;
    var go = el("#wipe-go");
    go.disabled = true;
    go.textContent = TXT.wipe_going || "";
    var waits = [];
    if (how.saves) {
      waits.push(inDb(["slots", "texts"], "readwrite", function (tx) {
        tx.objectStore("slots").clear();
        tx.objectStore("texts").clear();
      }).catch(function () { return dropDb(SAVES_KEY); }));
    } else if (typeof tabKeys !== "undefined" && tabKeys.length) {
      // the long words a reload was to fetch back belong to the work
      waits.push(inDb(["texts"], "readwrite", function (tx) {
        tabKeys.forEach(function (key) { tx.objectStore("texts")["delete"](key); });
      }).catch(function () {}));
    }
    if (how.settings) { waits.push(dropDb("flowchart-folder")); }
    var late = new Promise(function (done) { setTimeout(done, 2500); });
    Promise.race([Promise.all(waits), late]).then(function () {
      wipeStorage(how);
      // opened again with nothing in it -- not even a link's #p= work
      if (location.hash) { location.replace(location.pathname + location.search); }
      else { location.reload(); }
    });
  }

  if (el("#wipe-over")) {
    el("#wipe-open").onclick = function () {
      shutSheets();
      wipeShow(1);
    };
    el("#wipe-no1").onclick = wipeShut;
    el("#wipe-next").onclick = function () { wipeShow(2); };
    el("#wipe-back").onclick = function () { wipeShow(1); };
    el("#wipe-save").onclick = function () {
      saveProject();
      el("#wipe-saved").textContent = say("wipe_saved", { name: wipeCopyName() });
      el("#wipe-word").focus();
    };
    el("#wipe-word").addEventListener("input", function () {
      el("#wipe-go").disabled =
        this.value.trim().toLocaleUpperCase() !== wipeWord().toLocaleUpperCase();
    });
    el("#wipe-word").addEventListener("keydown", function (ev) {
      ev.stopPropagation();             // typed here, not keys for the page
      if (ev.key === "Escape") { ev.preventDefault(); wipeShut(); }
      // Enter does nothing here: the red button is pressed, not reached
    });
    el("#wipe-go").onclick = function () {
      if (this.disabled || wipedOut) { return; }
      if (el("#wipe-word").value.trim().toLocaleUpperCase() !== wipeWord().toLocaleUpperCase()) { return; }
      wipeAll({ saves: el("#wipe-saves").checked, settings: el("#wipe-settings").checked });
    };
    el("#wipe-over").onclick = function (ev) {
      if (ev.target === el("#wipe-over")) { wipeShut(); }
    };
    window.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") { return; }
      if (wipeShut()) { ev.stopImmediatePropagation(); }
    }, true);
  }
