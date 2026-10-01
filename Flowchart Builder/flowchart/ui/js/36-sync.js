// ---------------------------------------------------------------------------
//  36-sync.js -- one program, three tabs; and work never thrown away unasked
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ================================================ the three tabs, joined ==
  // Pseudocode and Code were always one program: code is read into the
  // pseudocode, and the pseudocode written out as code.  The Flowchart tab
  // was a paper of its own -- a chart built from pseudocode could not be
  // edited by hand, and a drawing never reached the pseudocode unless "As
  // pseudocode" was pressed.  Now wherever the work starts, any tab can be
  // gone to and edited, and what was changed goes with it:
  //
  //   leaving Flowchart   its program is written into the pseudocode
  //                       (handAsPseudocode, 12-check.js)
  //   leaving Code        the code is read into the pseudocode
  //   arriving Flowchart  the pseudocode's chart becomes the drawing --
  //                       through Mermaid (19-mermaid.js), laid out the way
  //                       Tidy up lays one out
  //   arriving Code       the pseudocode is written out as code
  //   arriving Pseudocode the chart drawn again, where the words moved on
  //
  // Only what has news is carried.  Each pair remembers the last time it
  // agreed -- `linkPH` for the pseudocode and the drawing, langFrom and
  // langMade (32-code-side.js) for the code and the pseudocode -- so going
  // back and forth without changing anything changes nothing.
  //
  // And nothing anybody made is written over without asking.  Where the
  // tab being gone to has changes of its own since the two last agreed,
  // the box asks first: save progress, keep that tab as it is, or put the
  // other in its place.  Escape, or a click outside, stays where you are.
  // A drawing that is not yet a whole program -- no Start, an arrow
  // missing -- has no program to carry, and says so.
  var linkPH = null;                     // { p: pseudocode, h: handKey() } as they last agreed
  var langWrote = null;                  // the code as it was last written out from the pseudocode
  var syncing = false;                   // a change of tab under way

  try { linkPH = JSON.parse(sessionStorage.getItem("flowchart-link")) || null; }
  catch (e) { linkPH = null; }
  function linkKeep(p, h) {
    linkPH = { p: p, h: h };
    try { sessionStorage.setItem("flowchart-link", JSON.stringify(linkPH)); }
    catch (e) { /* this visit only */ }
  }

  // ---- the box that asks ---------------------------------------------------
  // `how`: { head, said, no, yes, onYes, onNo, onDismiss }.  "Save progress
  // first" is always offered: into the first free place of Saved progress,
  // or, with every place taken, as a file.
  var keepAsked = null;
  function askKeep(how) {
    var over = el("#keep-over");
    if (!over) { how.onYes(); return; }
    keepAsked = how;
    el("#keep-head").textContent = how.head || "";
    el("#keep-said").textContent = how.said || "";
    el("#keep-no").textContent = how.no || "";
    el("#keep-yes").textContent = how.yes || "";
    el("#keep-saved").textContent = "";
    el("#keep-save").disabled = false;
    over.hidden = false;
    el("#keep-save").focus();
  }
  function keepShut(answer) {
    var over = el("#keep-over");
    if (!over || over.hidden) { return false; }
    over.hidden = true;
    var how = keepAsked;
    keepAsked = null;
    if (how) {
      var go = answer === "yes" ? how.onYes : answer === "no" ? how.onNo : (how.onDismiss || how.onNo);
      if (go) { go(); }
    }
    return true;
  }
  function keepWorkNow(said) {
    function asFile() { saveProject(); said(TXT.keep_saved_file); }
    slotsReady.then(function () {
      var at = savesNow().indexOf(null), one = null;
      if (at < 0) { asFile(); return; }
      try { one = progressNow(); } catch (e) { asFile(); return; }
      keepSlot(at, one).then(function (kept) {
        if (!kept) { asFile(); return; }
        drawSaves(at, TXT.sv_saved);
        said(say("keep_saved", { n: at + 1 }));
      });
    });
  }
  if (el("#keep-over")) {
    el("#keep-yes").onclick = function () { keepShut("yes"); };
    el("#keep-no").onclick = function () { keepShut("no"); };
    el("#keep-save").onclick = function () {
      this.disabled = true;
      keepWorkNow(function (what) { el("#keep-saved").textContent = what; });
    };
    el("#keep-over").onclick = function (ev) {
      if (ev.target === el("#keep-over")) { keepShut(null); }
    };
    window.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") { return; }
      if (keepShut(null)) { ev.stopImmediatePropagation(); }
    }, true);
  }

  // ---- work, kept from being written over --------------------------------
  // Opening an example, a puzzle, a file or a saved place puts something in
  // the place of what is here.  Where there is anything here at all, it
  // asks first -- with saving it offered before anything else.
  function guardOpen(go, onlyWords) {
    var words = el("#code") && el("#code").value.trim();
    var here = onlyWords ? words : workHere();
    if (!here || syncing) { go(); return; }
    askKeep({ head: TXT.open_head, said: TXT.open_said, no: TXT.open_no, yes: TXT.open_yes,
              onYes: go, onNo: function () {} });
  }
  if (typeof startFrom === "function") {
    var startFromPlain = startFrom;
    // an example is pseudocode: it takes the pseudocode's place only
    startFrom = function (code, name) {
      if (el("#code") && el("#code").value.trim() === String(code).trim()) { startFromPlain(code, name); return; }
      guardOpen(function () { startFromPlain(code, name); }, true);
    };
  }
  if (typeof broughtIn === "function") {
    var broughtInPlain = broughtIn;
    broughtIn = function (list, folder) {
      guardOpen(function () { broughtInPlain(list, folder); });
    };
  }
  if (typeof openPuzzle === "function") {
    var openPuzzlePlain = openPuzzle;
    // a puzzle keeps what was typed at it apart (28-puzzles.js); what is
    // asked about is the pseudocode it would be written over
    openPuzzle = function (one) {
      if (onPuzzle) { openPuzzlePlain(one); return; }
      guardOpen(function () { openPuzzlePlain(one); }, true);
    };
  }
  if (typeof loadSave === "function") {
    var loadSavePlain = loadSave;
    loadSave = function (at) {
      guardOpen(function () { loadSavePlain(at); });
    };
  }

  // ---- carrying the news ---------------------------------------------------
  // Each step comes to true where the pseudocode's words changed, and so
  // want drawing again.  A step that finds the other side has changes of
  // its own asks (decide); dismissed, the whole change of tab is called off.
  function decide(own, target, source, replace, keep) {
    if (!own) { return Promise.resolve().then(replace); }
    return new Promise(function (ok, no) {
      askKeep({
        head: TXT["sync_head_" + target], said: TXT["sync_" + target + "_from_" + source],
        no: TXT.sync_keep, yes: TXT.sync_go,
        onYes: function () { Promise.resolve().then(replace).then(ok, no); },
        onNo: function () { Promise.resolve().then(keep).then(ok, no); },
        onDismiss: function () { no("stay"); }
      });
    });
  }

  // "Keep this one": both stay as they are -- and are not taken to agree,
  // so the next change of tab between them asks again rather than writing
  // over the one that was kept the first time either of them moves.
  function keptAsIs() { return false; }

  // The pseudocode's words, put in the box the way typing would, so Ctrl+Z
  // takes them back out -- where the box is on show.  Typing goes to the
  // box that has the focus, and a box out of sight (the Flowchart tab's,
  // or Code's, where it is only read) cannot be given it: the words went
  // nowhere, or into whatever did have it.  There they are set.
  function wordsInto(text) {
    var box = el("#code");
    if (box.offsetParent !== null && !box.readOnly) {
      typeOver(box, 0, box.value.length, text);
    } else {
      box.value = text;
      box.dispatchEvent(new Event("input", { bubbles: true }));
    }
    showStarts();
  }

  // The program the pseudocode makes, as data: the one on the paper where
  // that is these words, or read afresh.
  function astFor(p) {
    if (!byHand && typeof builtText === "string" && builtText === p && AST) { return Promise.resolve(AST); }
    return askFor({ text: p, title: el("#f-title") ? el("#f-title").value : "", author: "",
                    shape: "auto", seed: "", lang: el("#f-lang") ? el("#f-lang").value : "",
                    legend: false, grid: true, shapes: geom })
      .then(function (data) { return data && data.ok ? data.ast : null; }, function () { return null; });
  }

  // The paper drawn from these words, waited for: the chart the code is
  // written out from.
  function builtFor(p) {
    if (!byHand && typeof builtText === "string" && builtText === p && AST) { return Promise.resolve(true); }
    return new Promise(function (ok) {
      var settled = false;
      function done(yes) { if (!settled) { settled = true; ok(yes); } }
      if (byHand || byLang) { setMode(false); }
      if (running) { dropRun(); }
      var build = el("#build");
      if (!build || build.disabled) { done(false); return; }
      whenBuilt.push({ at: Date.now(), go: function () { done(builtText === el("#code").value); },
                       fail: function () { done(false); } });
      setTimeout(function () { done(false); }, 60000);
      build.click();
    });
  }

  function handToPseudo() {
    if (!hand.nodes.length) { return Promise.resolve(false); }
    var hk = handKey();
    if (linkPH && linkPH.h === hk) { return Promise.resolve(false); }
    // a drawing still being made has no program to carry yet
    var text = null;
    if (!checkDesign("looks").some(function (bit) { return !bit.warn; })) {
      try { text = handAsPseudocode(); } catch (e) { text = null; }
    }
    if (!text) { syncNote(TXT.sync_unfinished); return Promise.resolve(false); }
    var p = el("#code").value;
    if (p.trim() === text.trim()) { linkKeep(p, hk); return Promise.resolve(false); }
    var own = !!p.trim() && !(linkPH && linkPH.p === p) && p !== langMade;
    return decide(own, "code", "hand", function () {
      wordsInto(text);
      seedHanded = TIDY_SEED;            // its True and False out the sides they are drawn
      linkKeep(el("#code").value, hk);
      return true;
    }, keptAsIs);
  }

  function codeIntoPseudo() {
    if (!langHasCode()) { return Promise.resolve(false); }
    var ck = langKey();
    if (ck === langFrom) { return Promise.resolve(false); }
    var said;
    try { said = codeToPseudo(langAll(), langNow()); }
    catch (e) { return Promise.resolve(false); }   // it does not read: Build says why, and puts it right
    var p = el("#code").value;
    if (p === said.text) { langFrom = ck; langMade = p; return Promise.resolve(false); }
    var own = !!p.trim() && p !== langMade;
    return decide(own, "code", "lang", function () {
      return readLangIn(false, true);
    }, keptAsIs);
  }

  function pseudoToHand() {
    var p = el("#code") ? el("#code").value : "";
    if (!p.trim() || onPuzzle) { return Promise.resolve(); }
    if (linkPH && linkPH.p === p) { return Promise.resolve(); }
    var hk = handKey();
    var own = !!hand.nodes.length && !(linkPH && linkPH.h === hk);
    return decide(own, "hand", "code", function () {
      return astFor(p).then(function (ast) {
        if (!ast || !((ast.main || []).length || (ast.modules || []).length)) { return; }
        // the colors of the shapes that were there are not these shapes'
        Object.keys(style.nodes || {}).forEach(function (k) { if (/^h\d/.test(k)) { delete style.nodes[k]; } });
        if (openMermaid("", mermaidOf(ast))) { linkKeep(p, handKey()); }
      });
    }, keptAsIs);
  }

  function pseudoToCode() {
    var p = el("#code") ? el("#code").value : "";
    if (!p.trim() || onPuzzle || langMade === p || readsOnly(langNow())) { return Promise.resolve(); }
    var own = langHasCode() && langKey() !== langWrote;
    return decide(own, "lang", "code", function () {
      return builtFor(p).then(function (ok) { if (ok) { langWriteOut(langHasCode()); } });
    }, keptAsIs);
  }

  // A word under the Build button, for the change of tab that could not
  // carry what it was asked to.
  function syncNote(what) {
    var note = el("#build-note");
    if (note) { note.className = "warn"; note.textContent = what; }
  }

  function switchTab(to) {
    if (syncing) { return; }
    var from = byHand ? "hand" : byLang ? "lang" : "code";
    if (from === to) { setMode(to === "hand", to === "lang"); return; }
    syncing = true;
    // the tab being gone to says it is on its way: a drawing made from the
    // pseudocode the first time waits for Python to start
    var tab = el(to === "hand" ? "#tab-hand" : to === "lang" ? "#tab-lang" : "#tab-code");
    if (tab) { tab.classList.add("busy"); }
    var chain = Promise.resolve(false), moved = false;
    function step(fn) { chain = chain.then(fn).then(function (b) { moved = moved || b === true; }); }
    if (from === "hand") { step(handToPseudo); }
    if (from === "lang") { step(codeIntoPseudo); }
    if (to === "hand") { step(pseudoToHand); }
    if (to === "lang") { step(pseudoToCode); }
    chain.then(function () {
      syncing = false;
      if (tab) { tab.classList.remove("busy"); }
      setMode(to === "hand", to === "lang");
      // words the paper is not drawn from: drawn now
      var words = el("#code") ? el("#code").value : "";
      if (to !== "hand" && words.trim() && (moved || builtText !== words)) {
        var build = el("#build");
        if (build && !build.disabled) { build.click(); }
      }
    }, function () {
      syncing = false;                   // asked, and told to stay
      if (tab) { tab.classList.remove("busy"); }
    });
  }

  if (typeof langWriteOut === "function") {
    var langWriteOutPlain = langWriteOut;
    langWriteOut = function (typed) {
      var wrote = langWriteOutPlain(typed);
      if (wrote) { langWrote = langKey(); }
      return wrote;
    };
  }

  if (el("#tab-hand")) {
    el("#tab-code").onclick = function () { switchTab("code"); };
    el("#tab-hand").onclick = function () { switchTab("hand"); };
    if (el("#tab-lang")) { el("#tab-lang").onclick = function () { switchTab("lang"); }; }
  }
