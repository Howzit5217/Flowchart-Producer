// ---------------------------------------------------------------------------
//  29-saves.js -- a few places to keep your progress, and picking it up again
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ================================================== keeping your place ==
  // A file is how a piece of work leaves this page.  This is how it stays
  // on it: a few places in the browser's own storage, each holding what it
  // takes to put you back where you were -- the pseudocode or the shapes,
  // the colors, the chart as it was drawn, and the run, down to the answers
  // that were typed into it and the step it was standing on.
  //
  // A run cannot be written down as it is.  It is a walk through the
  // program held on the page's own stack, halfway round a loop inside a
  // module inside an If, and there is no taking a copy of that.  What can
  // be written down is everything that made it go the way it went: the
  // answers typed into it, the seed its random numbers came from, and how
  // far it had got.  Handed the same of those, the runner does the same
  // thing every time -- so picking a run up again is running it again, at
  // full speed and without lighting anything up, feeding it the same
  // answers, until it arrives at the step it was on.  Then it is handed
  // back, and goes on at the pace it was going.
  var SAVE_ROOM = 3;                     // a few, and no more
  var SAVES_KEY = "flowchart-saves";

  // ---- what a run needs to be run again ----------------------------------
  // `spot` is where it has got to: how many steps it has taken, how many
  // times it has stood waiting since the last of them, and whether it is
  // standing waiting now.  Steps alone do not say it -- a step is lit,
  // waited on, and only then done, so a run waiting for Next and the same
  // run halfway through doing that step have taken the same number.
  var runLog = null;                     // the run on the tape, as a record
  var replay = null;                     // a record being caught up with
  var replayLit = null;                  // the shape the catching up is on
  var runDraw = null;                    // where random() gets its numbers

  // Numbers that look random and are not: the same seed gives the same
  // numbers in the same order, which is what lets a run that drew some be
  // run again and draw the same ones.  Mulberry32 -- small, quick, and
  // plenty for dice and guessing games.
  function drawsFrom(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function beginLog(seed, answers) {
    runLog = { seed: seed, answers: answers || [],
               spot: { steps: 0, holds: 0, holding: false } };
    runDraw = drawsFrom(seed);
  }

  // The runner's own pieces, each wrapped so that a run watched on the
  // page writes down what it does, and a run being caught up with does it
  // without waiting on anyone.  Runs that only mark a puzzle are quiet, and
  // pass straight through.
  //
  // A run begins at its first step: runIt has just set the count back to
  // nothing, and every run takes a step before it does anything else.  One
  // answered from a puzzle's own list rather than by somebody typing is
  // not one that can be picked up again, so it keeps no record.
  var tickPlain = tick;
  tick = function () {
    if (quiet) { return tickPlain(); }
    if (!replay && stepsUsed === 0) {
      if (ask === askLogged) { beginLog(Math.floor(Math.random() * 4294967296)); }
      else { runLog = null; runDraw = null; }
    }
    // About to take a step the saved run never took: caught up.
    if (replay && stepsUsed >= replay.spot.steps) { catchUp(); }
    if (runLog && !stopping) {
      runLog.spot.steps = stepsUsed + 1;
      runLog.spot.holds = 0;
      runLog.spot.holding = false;
    }
    return tickPlain();
  };

  var holdPlain = hold;
  hold = function () {
    if (quiet) { return holdPlain(); }
    var spot = runLog ? runLog.spot : null;
    if (spot) { spot.holds++; }
    if (replay) {
      var was = replay.spot;
      var here = was.holding && spot && stepsUsed === was.steps &&
                 spot.holds === was.holds;
      if (!here || !catchUp()) { return Promise.resolve(); }
    }
    if (!spot) { return holdPlain(); }
    spot.holding = true;
    return holdPlain().then(function () {
      // Let go by Stop, it stays standing here: this is where it ended.
      if (!stopping) { spot.holding = false; }
    });
  };

  var askPlain = ask;
  function askLogged(prompt) {
    if (replay) {
      if (replay.given < replay.answers.length) {
        var typed = String(replay.answers[replay.given++]);
        talk("> " + typed, "typed");     // the line the box leaves behind it
        return Promise.resolve(typed);
      }
      // Out of answers, so this is the question it was waiting on.
      if (!catchUp()) { return Promise.resolve(""); }
    }
    var log = runLog;
    return askPlain(prompt).then(function (typed) {
      if (log && log === runLog && !stopping) { log.answers.push(typed); }
      return typed;
    });
  }
  ask = askLogged;

  var lightUpPlain = lightUp;
  lightUp = function (item) {
    if (replay) { replayLit = item; return; }
    return lightUpPlain(item);
  };

  var napsPlain = naps;
  naps = function (many, unit) {
    return replay ? Promise.resolve() : napsPlain(many, unit);
  };

  // random() works its numbers out exactly as 15-sums.js always has, with
  // the run's own draws standing in for Math.random for the one call.
  var randomPlain = BUILT.random;
  BUILT.random = function () {
    if (!runDraw || quiet) { return randomPlain.apply(null, arguments); }
    var real = Math.random;
    Math.random = runDraw;
    try { return randomPlain.apply(null, arguments); }
    finally { Math.random = real; }
  };

  // A tape wiped clean is a run gone: there is nothing left to pick up.
  var freshTapePlain = freshTape;
  freshTape = function () {
    runLog = null;
    runDraw = null;
    return freshTapePlain();
  };

  // Arrived.  The record is let go of, the shape it is on is lit, and the
  // run goes on as the one it was -- or, if it had already finished or been
  // stopped when it was saved, stops here as it did then.
  function catchUp() {
    var was = replay;
    replay = null;
    if (!was.live) { stopping = true; return false; }
    if (replayLit) { lightUp(replayLit); }
    replayLit = null;
    talk(TXT.sv_back, "note");
    return true;
  }

  // The run on the tape, as something to keep.  Still being caught up
  // with, it is the record it is catching up with: what has been done so
  // far is only the part of it that has been done again.
  function runNow() {
    if (replay) { return replay.record; }
    if (!runLog || !runnable()) { return null; }
    var spot = runLog.spot;
    return {
      seed: runLog.seed,
      answers: runLog.answers.slice(),
      spot: { steps: spot.steps, holds: spot.holds, holding: spot.holding },
      live: running && !stopping,
      waits: !running ? "" : stepOn ? "next"
           : (waiting && waiting !== napOff) ? "answer" : ""
    };
  }

  async function resumeRun(record) {
    if (!record || !runnable() || running) { return; }
    beginLog(record.seed, (record.answers || []).slice());
    replay = { record: record, answers: record.answers || [], given: 0,
               spot: record.spot || { steps: 0, holds: 0, holding: false },
               live: !!record.live };
    replayLit = null;
    try { await runIt(); }
    finally { replay = null; replayLit = null; }
  }

  // ---- the drawing a load is waiting on ----------------------------------
  // Putting a save back draws its chart, and on the website a drawing is
  // Python working in the background, seconds away.  Nothing can be run
  // until it lands.  Every drawing is asked for through askFor, so that is
  // where a load waits: the next one asked for is its own, drawn from the
  // seed it was drawn from before -- a chart is shaken a little every time
  // it is drawn, and the one put back should be the one that was saved.
  var loadWaiting = null;
  var askForPlain = askFor;
  askFor = function (asked) {
    var mine = loadWaiting;
    loadWaiting = null;
    if (mine && mine.seed && !asked.seed) {
      asked = Object.assign({}, asked, { seed: mine.seed });
    }
    var got = askForPlain(asked);
    if (mine) {
      // Whoever asked for it is handed it first, so the page has done with
      // the new chart before the load goes on.
      Promise.resolve(got).then(function (data) {
        setTimeout(function () { mine.done(data); }, 0);
      }, function () {
        setTimeout(function () { mine.done(null); }, 0);
      });
    }
    return got;
  };

  // A promise of the drawing that `start` asks for, or null if it asked
  // for none.
  function drawnAfter(seed, start) {
    var done = null;
    var drawn = new Promise(function (go) { done = go; });
    loadWaiting = { seed: seed, done: done };
    start();
    if (loadWaiting) { loadWaiting = null; return null; }
    return drawn;
  }

  // ---- the places themselves ---------------------------------------------
  function savesNow() {
    var list = [];
    try {
      var was = JSON.parse(localStorage.getItem(SAVES_KEY));
      if (was && Array.isArray(was.slots)) { list = was.slots; }
    } catch (e) { list = []; }
    list = list.slice(0, SAVE_ROOM).map(function (one) {
      return one && one.project && one.project.what === "flowchart-builder"
             ? one : null;
    });
    while (list.length < SAVE_ROOM) { list.push(null); }
    return list;
  }

  function keepSaves(list) {
    try {
      localStorage.setItem(SAVES_KEY, JSON.stringify(
        { what: "flowchart-saves", version: 1, slots: list }));
      return true;
    } catch (e) { return false; }      // full, or storage turned off
  }

  function aughtToSave() {
    if (byHand) { return !!(hand && hand.nodes && hand.nodes.length); }
    return !!(el("#code") && el("#code").value.trim());
  }

  // What a save is called: the title, or failing that the puzzle it is,
  // or failing that the first line that says anything.
  function titleNow() {
    var named = el("#f-title") ? el("#f-title").value.trim() : "";
    if (named) { return named; }
    if (!byHand && onPuzzle) {
      return say("pz_one", { n: onPuzzle.no }) +
             (TXT[onPuzzle.key + "_t"] ? " · " + TXT[onPuzzle.key + "_t"] : "");
    }
    var lines = byHand
      ? (hand.nodes || []).map(function (n) { return n.kind === "oval" ? "" : n.text; })
      : el("#code").value.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = String(lines[i] || "").trim();
      if (line && !/^(start|begin|main|stop|end)$/i.test(line)) {
        return line.length > 48 ? line.slice(0, 46) + "…" : line;
      }
    }
    return TXT.untitled;
  }

  // Into place `at`, or the first empty one.
  function saveProgress(at) {
    var list = savesNow();
    if (at === undefined) { at = list.indexOf(null); }
    if (at < 0 || !aughtToSave()) { drawSaves(); return; }
    var one;
    try {
      var box = el("#code") ? el("#code").value : "";
      one = JSON.parse(JSON.stringify({
        at: Date.now(),
        name: titleNow(),
        project: projectData(),
        // The words the chart was drawn from, if the box has moved on
        // since: the chart put back is the one that was on the paper, and
        // the box gets what was being written.
        built: !byHand && typeof builtText === "string" && builtText !== box
               ? builtText : null,
        seed: String(lastLaid.seed || ""),
        run: runNow(),
        pace: pace(),
        big: tapeCovers(),
        puzzle: onPuzzle ? onPuzzle.key : ""
      }));
    } catch (e) { savedSays(TXT.sv_no_room, true); return; }
    list[at] = one;
    if (!keepSaves(list)) { savedSays(TXT.sv_no_room, true); return; }
    drawSaves(at, TXT.sv_saved);
  }

  function forgetSave(at) {
    var list = savesNow();
    list[at] = null;
    if (!keepSaves(list)) { savedSays(TXT.sv_no_room, true); return; }
    drawSaves();
  }

  // ---- putting one back ---------------------------------------------------
  function loadSave(at) {
    var one = savesNow()[at];
    if (!one) { drawSaves(); return; }
    shutSheets();
    stopThen(function () { putBack(one); });
  }

  // Loading over a run that is still going is somebody's work ending early,
  // so it asks first, the way building over one does.
  function stopThen(go) {
    if (!running) { go(); return; }
    areYouSure(TXT.s_stop_head, TXT.sv_stop_said, TXT.sv_stop_yes, function () {
      runIt();                          // pressed while running, this stops it
      var waited = 0;
      (function ready() {
        if (!running || ++waited > 200) { go(); return; }
        setTimeout(ready, 20);
      })();
    });
  }

  function wearPace(want) {
    var pick = el("#r-pace");
    if (!pick || !want) { return; }
    var had = pick.value;
    pick.value = want;
    if (pick.value !== want) { pick.value = had; return; }
    try { localStorage.setItem("flowchart-pace", want); }
    catch (e) { /* storage turned off: it is set for now */ }
  }

  function wearPuzzle(key) {
    var found = null;
    PUZZLES.forEach(function (level) {
      level[1].forEach(function (one) { if (one.key === key) { found = one; } });
    });
    onPuzzle = found;
    if (found) { lastPuzzle = found; }
    dressPuzzle();
  }

  function putBack(one) {
    var was = JSON.parse(JSON.stringify(one.project));
    var toHand = was.mode === "hand";
    var box = was.source ? String(was.source.code || "") : "";
    if (!toHand && was.source && typeof one.built === "string") {
      was.source.code = one.built;
    }
    // The pace first: how often the run stood waiting depends on it, and
    // the catching up counts those.
    wearPace(one.pace);
    var drawing = drawnAfter(toHand ? "" : one.seed, function () {
      openProject(was);
    });
    // Put back, not asked for: it is simply there, the way a chart opened
    // from a link is, rather than drawn in while the run is picked up.
    if (drawing && !toHand) { opening = true; }
    function thenRun(data) {
      // A drawing that did not come out never reached the paper, so the
      // next one somebody asks for is still owed its entrance.
      if (drawing && !(data && data.ok)) { opening = false; }
      if (!toHand && el("#code")) {
        el("#code").value = box;
        showStarts();
        countLines();
        wearPuzzle(one.puzzle);
      }
      if (one.big) { tapeFull(true); }
      var run = one.run;
      if (!run) { return; }
      if (toHand) {
        // A drawing by hand is run from the program read out of it, which
        // is read afresh, the way Check reads it.
        var reading = drawnAfter("", readyHandProgram);
        if (!reading) { talk(TXT.sv_no_draw, "bad"); return; }
        reading.then(function () {
          if (runnable()) { resumeRun(run); }
          else { talk(TXT.sv_no_draw, "bad"); }
        });
        return;
      }
      if (!data || !data.ok || !runnable()) { talk(TXT.sv_no_draw, "bad"); return; }
      resumeRun(run);
    }
    if (drawing) { drawing.then(thenRun); }
    else { thenRun(null); }
  }

  // ---- the tab they are kept in -------------------------------------------
  function savedSays(what, bad) {
    var note = el("#kept-note");
    if (!note) { return; }
    note.className = bad ? "hint bad" : "hint";
    note.textContent = what || "";
  }

  function statusOf(run) {
    if (!run) { return TXT.sv_st_none; }
    if (!run.live) { return TXT.sv_st_over; }
    if (run.waits === "answer") { return TXT.sv_st_ask; }
    if (run.waits === "next") { return TXT.sv_st_next; }
    return TXT.sv_st_going;
  }

  function whenSaid(at) {
    var then = new Date(at);
    if (isNaN(then.getTime())) { return ""; }
    var clock = { hour: "numeric", minute: "2-digit" };
    try {
      if (then.toDateString() === new Date().toDateString()) {
        return TXT.sv_today + ", " + then.toLocaleTimeString(LANG, clock);
      }
      return then.toLocaleString(LANG, Object.assign(
        { day: "numeric", month: "short" }, clock));
    } catch (e) { return then.toLocaleString(); }
  }

  function keptBit(tag, cls, text) {
    var bit = document.createElement(tag);
    if (cls) { bit.className = cls; }
    if (text !== undefined) { bit.textContent = text; }
    return bit;
  }

  // Asked where the buttons were, rather than in a sheet over the page:
  // the sheet would shut the menu this is in, and the answer is wanted
  // right here.
  function keptAsk(does, question, yes, danger, go) {
    var had = Array.prototype.slice.call(does.childNodes);
    does.textContent = "";
    does.classList.add("asking");
    var no = keptBit("button", "btn small", TXT.s_no);
    var ok = keptBit("button", "btn small primary" + (danger ? " danger" : ""), yes);
    no.onclick = function () {
      does.classList.remove("asking");
      does.textContent = "";
      had.forEach(function (bit) { does.appendChild(bit); });
      if (had[0]) { had[0].focus(); }
    };
    ok.onclick = go;
    does.appendChild(keptBit("span", "kept-q", question));
    does.appendChild(no);
    does.appendChild(ok);
    no.focus();
  }

  var BIN_ART = '<svg viewBox="0 0 20 20" aria-hidden="true">' +
                '<path d="M4 6h12M8 6V4.2h4V6M5.8 6l.8 10.3h6.8L14.2 6"/></svg>';

  function savedRow(one, at) {
    var row = keptBit("li", "kept" + (one ? "" : " empty"));
    var top = keptBit("div", "kept-top");
    top.appendChild(keptBit("span", "kept-no", String(at + 1)));
    var name = keptBit(one ? "strong" : "span", "kept-name",
                       one ? (one.name || TXT.untitled) : TXT.sv_empty);
    top.appendChild(name);
    row.appendChild(top);
    if (!one) { return row; }
    name.title = name.textContent;
    var bin = keptBit("button", "icon small kept-del");
    bin.title = TXT.delete;
    bin.setAttribute("aria-label", TXT.delete);
    bin.innerHTML = BIN_ART;
    top.appendChild(bin);
    var how = one.project.mode === "hand" ? TXT.mode_hand : TXT.mode_code;
    row.appendChild(keptBit("p", "kept-what", how + " · " + statusOf(one.run)));
    row.appendChild(keptBit("p", "kept-when", whenSaid(one.at)));
    var does = keptBit("div", "kept-do");
    var load = keptBit("button", "btn small primary", TXT.sv_load);
    var over = keptBit("button", "btn small", TXT.sv_over);
    load.onclick = function () { loadSave(at); };
    over.disabled = !aughtToSave();
    over.onclick = function () {
      keptAsk(does, TXT.sv_over_ask, TXT.sv_over_yes, false,
              function () { saveProgress(at); });
    };
    bin.onclick = function () {
      keptAsk(does, TXT.sv_del_ask, TXT.delete, true,
              function () { forgetSave(at); });
    };
    does.appendChild(load);
    does.appendChild(over);
    row.appendChild(does);
    return row;
  }

  // The list, drawn afresh each time it is looked at, and the one just
  // saved into lit up for a moment.  The note under the button says what
  // was just done, if anything was, and otherwise why the button cannot be
  // pressed, when it cannot.
  function drawSaves(fresh, said) {
    var list = el("#kept-list");
    if (!list) { return; }
    var saves = savesNow();
    var room = saves.indexOf(null) >= 0, can = aughtToSave();
    if (el("#kept-about")) {
      el("#kept-about").textContent = say("sv_about", { n: SAVE_ROOM });
    }
    if (el("#kept-save")) { el("#kept-save").disabled = !room || !can; }
    savedSays(said || (!can ? TXT.sv_nothing
                     : !room ? say("sv_full", { n: SAVE_ROOM }) : ""));
    list.textContent = "";
    saves.forEach(function (one, at) { list.appendChild(savedRow(one, at)); });
    if (fresh !== undefined && list.children[fresh]) {
      briefly(list.children[fresh], "just", 900);
    }
  }

  var filesTab = "out";                  // which half of Files is showing
  function showFilesTab(which) {
    filesTab = which === "kept" ? "kept" : "out";
    var kept = filesTab === "kept";
    el("#files-out").hidden = kept;
    el("#files-kept").hidden = !kept;
    [["#files-tab-out", !kept], ["#files-tab-kept", kept]].forEach(function (pair) {
      var tab = el(pair[0]);
      tab.classList.toggle("on", pair[1]);
      tab.setAttribute("aria-selected", pair[1] ? "true" : "false");
    });
    if (kept) { drawSaves(); }
  }

  if (el("#files-tabs")) {
    // A page with no program on it -- the viewer written beside an .svg --
    // has no run and no work to keep, only the files.
    if (!el("#runner")) { el("#files-tabs").hidden = true; }
    el("#files-tab-out").onclick = function () { showFilesTab("out"); };
    el("#files-tab-kept").onclick = function () { showFilesTab("kept"); };
    el("#kept-save").onclick = function () { saveProgress(); };
    // Opened again, it says how things are now: the times, and whether
    // there is anything on the page to save.
    el("#save-open").addEventListener("click", function () {
      if (filesTab === "kept") { drawSaves(); }
    });
  }

  // The rows are written by the script, so a change of language writes
  // them again.
  var dressBeforeSaves = dress;
  dress = function () {
    dressBeforeSaves();
    drawSaves();
  };
