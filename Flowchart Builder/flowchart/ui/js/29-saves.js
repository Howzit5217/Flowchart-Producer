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
  // A run is written down as it stands: where it is in the program -- the
  // trail the runner keeps, of which statement of which loop of which
  // branch it is on (14-run.js) -- and what it is holding, every name and
  // what is in it, with the last of what it has said.  Put back, the runner
  // walks straight down the trail and carries on from the statement it was
  // on, holding what it held.  However long the program, and however long
  // it has been running, that is a few thousand words to keep and no time
  // at all to put back.
  //
  // It used to be kept as everything that had made the run go the way it
  // went -- every answer ever typed into it, and the seed its random
  // numbers came from -- and put back by running the whole thing again from
  // the start.  That is still how a run is kept in the one place a trail
  // cannot say where it is: inside a function that was called from the
  // middle of a sum, Set x = f(3) + 1, where half of the sum is lost the
  // moment the walk is let go of.  There it is caught up with, from the last
  // place it was put back at if it was.
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

  // `from` is the place the run was put back at, if it was: the answers
  // and steps are counted from there, and catching up starts there.
  function beginLog(seed, answers, from) {
    runLog = { seed: seed, answers: answers || [], from: from || null,
               spot: { steps: 0, holds: 0, holding: false } };
    runDraw = drawsFrom(seed);
  }
  var pickedUpFrom = null;               // the place a run is being put back at

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
      if (ask === askLogged) {
        beginLog(Math.floor(Math.random() * 4294967296), [], pickedUpFrom);
      }
      else { runLog = null; runDraw = null; }
      pickedUpFrom = null;
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
        sinceAsked = 0;                  // somebody did answer it, once
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
    runWhere = null;
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
    talk(TXT.sv_back, "note").classList.add("back-here");
    return true;
  }

  // ---- a run, written down as it stands ----------------------------------
  // What a run holds is numbers, words and Trues and Falses, which write
  // down as they are -- all but the numbers that are not numbers, 0/0 and
  // the like, which JSON has no way to hold and so are kept as their names.
  function packVars(box) {
    var out = {};
    Object.keys(box || {}).forEach(function (name) {
      var v = box[name];
      out[name] = typeof v === "number" && !isFinite(v) ? { odd: String(v) } : v;
    });
    return out;
  }

  function unpackVars(box) {
    var out = {};
    Object.keys(box || {}).forEach(function (name) {
      var v = box[name];
      out[name] = v && typeof v === "object" ? Number(v.odd) : v;
    });
    return out;
  }

  // The last of what the run said, so that picking it up again shows what
  // it was showing: the room you were standing in, the question it asked.
  // Enough of it to read back up a way, not the whole of an evening.  The
  // word a load leaves on the tape is not part of it, or every load would
  // add one more.
  var TAPE_KEPT = 2000, TAPE_CHARS = 200000;
  function tapeNow() {
    var box = el("#tape"), out = [], chars = 0;
    for (var n = box ? box.lastElementChild : null;
         n && out.length < TAPE_KEPT && chars < TAPE_CHARS; n = n.previousElementSibling) {
      var kind = tapeKind(n);
      if (!kind || n.classList.contains("back-here")) { continue; }
      var text = kind === "card"
        ? Array.prototype.filter.call(n.children, function (row) {
            return row.tagName !== "BUTTON";
          }).map(function (row) { return row.textContent; }).join("\n")
        : n.textContent;
      var how = kind === "card" ? "bad"
        : ["typed", "good", "bad", "warn", "note"].filter(function (c) {
            return n.classList.contains(c);
          })[0] || "";
      out.push([how, text]);
      chars += text.length;
    }
    return out.reverse();
  }

  function putTape(lines) {
    (lines || []).forEach(function (one) { talk(String(one[1]), one[0] || ""); });
  }

  // The trail as a path from the top of the program down: each step the
  // statement it is on, and how it got into the list that statement is in
  // -- the Then or the Else of the If above it, the body of the loop above
  // it, a case of a Select, the module a Call walked into.  Each step says
  // what the statement it points at is, and on which line, so a path that
  // no longer fits its program is known for one rather than followed into
  // the wrong place.
  //
  // Null where the trail cannot be written down: inside a module called
  // from the middle of a sum (see plainCall in 14-run.js).
  function snapNow() {
    if (!running || stopping || !trail.length || !AST) { return null; }
    var path = [];
    for (var f = 0; f < trail.length; f++) {
      var fr = trail[f], item = fr.list[fr.i];
      if (!item) { return null; }
      var step = { i: fr.i, op: item.op, line: item.line || 0 };
      if (f === 0) {
        if (fr.list !== AST.main) {      // no main flow: the first module is it
          if (!(AST.modules || [])[0] || fr.list !== AST.modules[0].body) { return null; }
          step.vars = packVars(fr.where.vars);
        }
      } else {
        var up = trail[f - 1], from = up.list[up.i];
        if (fr.where !== up.where) {
          var call = fr.where.call;
          if (!call || !call.plain || from.op !== "call") { return null; }
          step["in"] = "call";
          step.mod = call.mod;
          step.given = call.given;
          step.vars = packVars(fr.where.vars);
        } else if (from.then === fr.list) { step["in"] = "then"; }
        else if (from["else"] === fr.list) { step["in"] = "else"; }
        else if (from.body === fr.list) { step["in"] = "body"; }
        else {
          var c = (from.cases || []).map(function (k) { return k.body; }).indexOf(fr.list);
          if (c < 0) { return null; }
          step["in"] = "case";
          step.c = c;
        }
      }
      path.push(step);
    }
    return { path: path, phase: trail[trail.length - 1].phase || "",
             main: packVars(runWhere ? runWhere.vars : {}),
             globals: packVars(GLOBALS),
             cash: Object.keys(CASH), numeric: Object.keys(NUMERIC),
             tape: tapeNow() };
  }

  // Whether a path still leads where it led in the program on the page.
  function fitsProgram(snap) {
    if (!snap || !Array.isArray(snap.path) || !snap.path.length || !AST) { return false; }
    var item = null;
    for (var j = 0; j < snap.path.length; j++) {
      var step = snap.path[j], list = null;
      if (j === 0) {
        list = step.vars ? ((AST.modules || [])[0] || {}).body : AST.main;
      } else if (step["in"] === "call") {
        var mod = (AST.modules || []).filter(function (m) {
          return m.name.toLowerCase() === String(step.mod).toLowerCase();
        })[0];
        list = item.op === "call" && mod ? mod.body : null;
      } else if (step["in"] === "case") {
        list = item.op === "select" && (item.cases || [])[step.c]
             ? item.cases[step.c].body : null;
      } else if (/^(then|else)$/.test(step["in"])) {
        list = item.op === "if" ? (item[step["in"]] || []) : null;
      } else if (step["in"] === "body") {
        list = /^(while|dowhile|for)$/.test(item.op) ? item.body : null;
      }
      if (!Array.isArray(list)) { return false; }
      item = list[step.i];
      if (!item || item.op !== step.op || (item.line || 0) !== step.line) { return false; }
    }
    if (snap.phase === "dotest") { return item.op === "dowhile"; }
    if (snap.phase === "forbody") { return item.op === "for"; }
    return !snap.phase;
  }

  function nameSet(list) {
    var out = {};
    (list || []).forEach(function (name) { out[name] = true; });
    return out;
  }

  // A written-down run as the runner takes one back (resumeTo, 14-run.js):
  // what it holds, the path to walk down, and what it had said, put back
  // on the tape the moment the run begins.  `noted` says so on the tape as
  // well; a run still to be caught up with says so when it has been.
  function backFrom(snap, noted) {
    return {
      path: snap.path.map(function (step) {
        return step.vars ? Object.assign({}, step, { vars: unpackVars(step.vars) }) : step;
      }),
      at: 0, phase: snap.phase || "",
      main: unpackVars(snap.main), globals: unpackVars(snap.globals),
      cash: nameSet(snap.cash), numeric: nameSet(snap.numeric),
      start: function (where) {
        putTape(snap.tape);
        if (noted) { talk(TXT.sv_back, "note").classList.add("back-here"); }
        watchNow(where);
      }
    };
  }

  // A run that had finished, or been stopped, when it was kept: nothing to
  // go on with, only what it said and what it was left holding.
  function showKept(snap) {
    tapeShow("run");
    el("#tape").innerHTML = "";
    watchClear();
    putTape(snap.tape);
    GLOBALS = unpackVars(snap.globals);
    runWhere = { vars: unpackVars(snap.main), name: "main" };
    watchNow(runWhere);
  }

  function waitsNow() {
    return !running ? "" : stepOn ? "next"
         : (waiting && waiting !== napOff) ? "answer" : "";
  }

  // The run on the tape, as something to keep: where it stands, written
  // down, or -- inside a function called from a sum -- what it takes to
  // catch up with it.  Still being caught up with, it is the record it is
  // catching up with.  Over, it is what it said and what it was left with.
  function runNow() {
    if (replay) { return replay.record; }
    if (!runnable()) { return null; }
    if (running && !stopping) {
      var snap = snapNow();
      if (snap) { return { live: true, waits: waitsNow(), snap: snap }; }
      if (!runLog) { return null; }
      var spot = runLog.spot;
      return {
        live: true, waits: waitsNow(),
        from: runLog.from, seed: runLog.seed, answers: runLog.answers.slice(),
        spot: { steps: spot.steps, holds: spot.holds, holding: spot.holding }
      };
    }
    if (!runWhere) { return null; }      // not run since this chart was drawn
    return { live: false, waits: "",
             snap: { done: true, main: packVars(runWhere.vars),
                     globals: packVars(GLOBALS), tape: tapeNow() } };
  }

  async function resumeRun(record) {
    if (!record || !runnable() || running) { return; }
    var snap = record.snap;
    if (snap && snap.done) { showKept(snap); return; }
    var base = snap || record.from || null;
    if (base && !fitsProgram(base)) {
      tapeShow("run");
      talk(TXT.sv_moved, "bad");
      return;
    }
    if (snap) {
      resumeTo = backFrom(snap, true);
      pickedUpFrom = snap;
      await runIt();
      return;
    }
    // Kept the long way: from the start, or from where it was last put
    // back, run again with the same answers until it is where it was.
    beginLog(record.seed, (record.answers || []).slice(), base);
    replay = { record: record, answers: record.answers || [], given: 0,
               spot: record.spot || { steps: 0, holds: 0, holding: false },
               live: !!record.live };
    replayLit = null;
    if (base) { resumeTo = backFrom(base, false); }
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
    // A program too long for the tab's own storage is kept in the database
    // as soon as it is drawn, so that a reload can find it (keepForReload).
    if (asked && typeof asked.text === "string" && asked.text.length >= BIG_TEXT) {
      var text = asked.text;
      Promise.resolve(got).then(function (data) {
        if (data && data.ok) { keepTextForTab(text); }
      }, function () { /* not drawn: nothing to keep */ });
    }
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

  // ---- where they are kept ------------------------------------------------
  // In the browser's database, not the small store the rest of the page's
  // settings go in.  That one holds five million characters for the whole
  // site, and a program can be longer than that on its own -- a text
  // adventure of a hundred thousand lines is seven -- so a save of one was
  // refused before anything else about it mattered.  The database holds
  // hundreds of times as much.
  //
  // And the words of a program are kept once, however many places hold a
  // run of it: each place holds where its run is and what it is holding,
  // and names the program it is a run of (`codeRef`, `builtRef`), which is
  // kept beside the places under that name.  Words no place names any more
  // are let go of.
  //
  // A browser with no database to give -- a page opened from a file in
  // some of them -- keeps them where they always were, whole, as far as
  // there is room.
  var BIG_TEXT = 500000;                 // characters: past this, by name only
  var SLOTS = null;                      // the places, once they are read
  var slotsIn = "";                      // "db", or "local" with no database
  var knownTexts = {};                   // the names of the words kept
  var tabKeys = [];                      // the words this tab's reload needs

  function localSlots() {
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

  // As they stand -- or, in the moment before the database has been read,
  // as the old store has them.
  function savesNow() {
    return (SLOTS || localSlots()).slice();
  }

  var dbAsked = null;
  function savesDb() {
    if (!dbAsked) {
      dbAsked = new Promise(function (done) {
        var req;
        try { req = indexedDB.open(SAVES_KEY, 1); }
        catch (e) { done(null); return; }
        req.onupgradeneeded = function () {
          ["slots", "texts"].forEach(function (name) {
            if (!req.result.objectStoreNames.contains(name)) {
              req.result.createObjectStore(name);
            }
          });
        };
        req.onsuccess = function () { done(req.result); };
        req.onerror = req.onblocked = function () { done(null); };
      });
    }
    return dbAsked;
  }

  // One piece of work on the database, all of it or none: `work` is handed
  // the transaction, and what it returns is what the promise comes to once
  // the whole of it has gone through -- read out, if it is a request.
  function inDb(stores, mode, work) {
    return savesDb().then(function (db) {
      if (!db) { throw new Error("no database"); }
      return new Promise(function (done, fail) {
        var tx, out;
        try { tx = db.transaction(stores, mode); out = work(tx); }
        catch (e) { fail(e); return; }
        tx.oncomplete = function () { done(out instanceof IDBRequest ? out.result : out); };
        tx.onerror = tx.onabort = function () { fail(tx.error || new Error("not kept")); };
      });
    });
  }

  // A name for a program's words, the same every time for the same words:
  // how long they are, and a hash of them.  Worked out from seven million
  // characters in a few hundredths of a second, and remembered for the last
  // couple asked about, since it is the same one or two over and over.
  var keyed = [];
  function textKey(text) {
    for (var k = 0; k < keyed.length; k++) {
      if (keyed[k].text === text) { return keyed[k].key; }
    }
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    var key = "t" + text.length.toString(36) + "-" +
              (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
    keyed = [{ text: text, key: key }].concat(keyed).slice(0, 2);
    return key;
  }

  // A place, with the words it would carry taken out and named instead.
  // A place that has already had them taken out keeps the names it has.
  function splitTexts(place) {
    var texts = {}, src = place.project && place.project.source;
    var bare = Object.assign({}, place, { built: null, project: Object.assign(
      {}, place.project, { source: src ? Object.assign({}, src, { code: "" }) : null }) });
    bare = JSON.parse(JSON.stringify(bare));   // a copy of its own, small now
    if (src && !place.codeRef) {
      bare.codeRef = textKey(String(src.code || ""));
      texts[bare.codeRef] = String(src.code || "");
    }
    if (typeof place.built === "string") {
      bare.builtRef = textKey(place.built);
      texts[bare.builtRef] = place.built;
    }
    return { place: bare, texts: texts };
  }

  // And back, whole, with its words read out of the database.
  function fullPlace(one) {
    if (!one || (!one.codeRef && !one.builtRef)) { return Promise.resolve(one); }
    var keys = [one.codeRef, one.builtRef].filter(Boolean);
    return inDb(["texts"], "readonly", function (tx) {
      var store = tx.objectStore("texts");
      return keys.map(function (key) { return store.get(key); });
    }).then(function (asked) {
      var texts = {};
      asked.forEach(function (req, n) {
        if (req.result && typeof req.result.text === "string") { texts[keys[n]] = req.result.text; }
      });
      if (keys.some(function (key) { return !(key in texts); })) { throw new Error("lost"); }
      var whole = JSON.parse(JSON.stringify(one));
      if (whole.codeRef && whole.project.source) { whole.project.source.code = texts[whole.codeRef]; }
      whole.built = whole.builtRef ? texts[whole.builtRef] : null;
      delete whole.codeRef;
      delete whole.builtRef;
      return whole;
    });
  }

  // Words into the database that are not in it already.
  function putTexts(texts) {
    var keys = Object.keys(texts).filter(function (key) { return !knownTexts[key]; });
    if (!keys.length) { return Promise.resolve(true); }
    return inDb(["texts"], "readwrite", function (tx) {
      keys.forEach(function (key) {
        tx.objectStore("texts").put({ text: texts[key], at: Date.now() }, key);
      });
    }).then(function () {
      keys.forEach(function (key) { knownTexts[key] = true; });
      return true;
    }, function () { return false; });
  }

  // A long program just drawn in this tab, kept for its reload.  The one it
  // replaces is let go of, if no place names it.
  function keepTextForTab(text) {
    var key = textKey(text);
    if (tabKeys.length === 1 && tabKeys[0] === key) { return; }
    tabKeys = [key];
    var one = {};
    one[key] = text;
    putTexts(one).then(sweepTexts);
  }

  // Words that no place names, and that this tab would not need after a
  // reload, let go of.  (Another tab's reload may have needed them; it
  // opens empty, as a reload of a program this long always used to.)
  function sweepTexts() {
    if (slotsIn !== "db") { return; }
    var keep = {};
    (SLOTS || []).forEach(function (one) {
      if (one && one.codeRef) { keep[one.codeRef] = true; }
      if (one && one.builtRef) { keep[one.builtRef] = true; }
    });
    tabKeys.forEach(function (key) { keep[key] = true; });
    var gone = Object.keys(knownTexts).filter(function (key) { return !keep[key]; });
    if (!gone.length) { return; }
    inDb(["texts"], "readwrite", function (tx) {
      gone.forEach(function (key) { tx.objectStore("texts")["delete"](key); });
    }).then(function () {
      gone.forEach(function (key) { delete knownTexts[key]; });
    }, function () { /* kept a while longer, then */ });
  }

  // A place into slot `at` -- or, given null, the slot emptied.
  function keepSlot(at, place) {
    if (slotsIn !== "db") {
      var list = savesNow();
      list[at] = place ? JSON.parse(JSON.stringify(place)) : null;
      if (!keepSaves(list)) { return Promise.resolve(false); }
      SLOTS = list;
      return Promise.resolve(true);
    }
    var split = place ? splitTexts(place) : null;
    var fresh = split ? Object.keys(split.texts).filter(function (key) {
      return !knownTexts[key];
    }) : [];
    return inDb(["slots", "texts"], "readwrite", function (tx) {
      fresh.forEach(function (key) {
        tx.objectStore("texts").put({ text: split.texts[key], at: Date.now() }, key);
      });
      if (split) { tx.objectStore("slots").put(split.place, at); }
      else { tx.objectStore("slots")["delete"](at); }
    }).then(function () {
      fresh.forEach(function (key) { knownTexts[key] = true; });
      SLOTS[at] = split ? split.place : null;
      sweepTexts();
      return true;
    }, function () { return false; });
  }

  // Read once, as the page opens.  Places kept in the old store, from
  // before there was a database here, are moved into it the first time.
  var slotsReady = inDb(["slots", "texts"], "readonly", function (tx) {
    return { slots: tx.objectStore("slots").getAll(),
             at: tx.objectStore("slots").getAllKeys(),
             texts: tx.objectStore("texts").getAllKeys() };
  }).then(function (got) {
    var list = [];
    while (list.length < SAVE_ROOM) { list.push(null); }
    got.at.result.forEach(function (at, n) {
      var one = got.slots.result[n];
      if (at >= 0 && at < SAVE_ROOM && one && one.project) { list[at] = one; }
    });
    got.texts.result.forEach(function (key) { knownTexts[key] = true; });
    SLOTS = list;
    slotsIn = "db";
    var old = localSlots();
    if (list.some(Boolean) || !old.some(Boolean)) { return; }
    return Promise.all(old.map(function (one, at) {
      return one ? keepSlot(at, one) : true;
    })).then(function (kept) {
      if (kept.every(Boolean)) {
        try { localStorage.removeItem(SAVES_KEY); } catch (e) { /* it stays */ }
      }
    });
  }).catch(function () {
    SLOTS = localSlots();
    slotsIn = "local";
  }).then(function () {
    if (filesTab === "kept") { drawSaves(); }
  });

  function aughtToSave() {
    if (byHand) { return !!(hand && hand.nodes && hand.nodes.length); }
    return !!(el("#code") && el("#code").value.trim());
  }

  // What a save is called: the title, or failing that the puzzle it is, or
  // failing that what the program does (see 09-names.js) -- and only when
  // there is nothing to tell that from, the first line that says anything.
  // A drawing by hand is read the same way, its questions asked as Ifs.
  function titleNow() {
    var named = el("#f-title") ? el("#f-title").value.trim() : "";
    if (named) { return named; }
    if (!byHand && onPuzzle) {
      return say("pz_one", { n: onPuzzle.no }) +
             (TXT[onPuzzle.key + "_t"] ? " · " + TXT[onPuzzle.key + "_t"] : "");
    }
    // Only the top of a program is read for this (describeProgram reads
    // twenty thousand characters), so only the top is cut into lines: all
    // of one a hundred thousand lines long was being cut up to read the
    // first few, every time the tab was put away.
    var lines = byHand
      ? (hand.nodes || []).map(function (n) {
          return n.kind === "oval" ? "" : (n.kind === "diamond" ? "If " : "") + n.text;
        })
      : el("#code").value.slice(0, 20000).split("\n");
    var does = describeProgram(lines.join("\n"));
    if (does) { return does; }
    for (var i = 0; i < lines.length; i++) {
      var line = String(lines[i] || "").trim();
      if (line && !/^(start|begin|main|stop|end)$/i.test(line)) {
        return line.length > 48 ? line.slice(0, 46) + "…" : line;
      }
    }
    return TXT.untitled;
  }

  // What goes into a place: the page as it stands, and the run on it.
  function progressNow() {
    var box = el("#code") ? el("#code").value : "";
    return {
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
    };
  }

  // Into place `at`, or the first empty one.  Written down the moment it
  // is asked for -- that is the moment being kept -- and then put away.
  function saveProgress(at) {
    slotsReady.then(function () {
      var list = savesNow();
      if (at === undefined) { at = list.indexOf(null); }
      if (at < 0 || !aughtToSave()) { drawSaves(); return; }
      var one;
      try { one = progressNow(); }
      catch (e) { savedSays(TXT.sv_no_room, true); return; }
      keepSlot(at, one).then(function (kept) {
        if (kept) { drawSaves(at, TXT.sv_saved); }
        else { savedSays(TXT.sv_no_room, true); }
      });
    });
  }

  function forgetSave(at) {
    slotsReady.then(function () {
      keepSlot(at, null).then(function (kept) {
        if (kept) { drawSaves(); }
        else { savedSays(TXT.sv_no_room, true); }
      });
    });
  }

  // ---- putting one back ---------------------------------------------------
  function loadSave(at) {
    var one = savesNow()[at];
    if (!one) { drawSaves(); return; }
    shutSheets();
    stopThen(function () {
      fullPlace(one).then(putBack, function () {
        tapeShow("run");
        talk(TXT.sv_lost, "bad");
      });
    });
  }

  // Whether the page is that place already, all but the run: the same
  // program drawn on the paper, the same colors and shapes and settings.
  // Then there is nothing to draw again -- which, for a program a hundred
  // thousand lines long, is nearly all of the wait -- and only the run
  // is put back.  Any difference at all and it is put back the whole way.
  function samePage(one) {
    if (byHand || !runnable() || typeof builtText !== "string" ||
        !one.project || one.project.mode === "hand" || !one.project.source) {
      return false;
    }
    var drawn = typeof one.built === "string" ? one.built : String(one.project.source.code || "");
    if (drawn.length !== builtText.length || textKey(drawn) !== textKey(builtText)) {
      return false;
    }
    function withoutCode(project) {
      return Object.assign({}, project, { source: Object.assign({}, project.source, { code: "" }) });
    }
    return JSON.stringify(withoutCode(projectData())) === JSON.stringify(withoutCode(one.project));
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

  // A place that is still on its way back.  Until its chart has landed the
  // page is only half of it -- the box holds the words the chart is being
  // drawn from, and the run has not been started -- so the place itself is
  // the truth about where things stand.
  var puttingBack = null;
  function putBackDone(one) {
    if (puttingBack === one) { puttingBack = null; }
  }

  function putBack(one) {
    puttingBack = one;
    if (samePage(one)) {
      wearPace(one.pace);
      var box = String(one.project.source.code || "");
      if (el("#code").value !== box) {
        el("#code").value = box;
        showStarts();
        countLines();
      }
      wearPuzzle(one.puzzle);
      if (one.big) { tapeFull(true); }
      putBackDone(one);
      if (one.run) { resumeRun(one.run); }
      return;
    }
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
      // A drawing by hand with a run on it is not back until the program
      // has been read out of it, which is further on.
      if (!(toHand && one.run)) { putBackDone(one); }
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
        if (!reading) { putBackDone(one); talk(TXT.sv_no_draw, "bad"); return; }
        reading.then(function () {
          putBackDone(one);
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

  // ---- through a reload ---------------------------------------------------
  // A reload is not a new visit.  It is the same person in the middle of
  // the same thing -- it is what anybody presses when a page looks stuck
  // -- and it used to hand them an empty page and nothing else.  So the
  // tab keeps one more place of its own, filled as the page goes and put
  // back as it comes again: the program, the chart, the colors, the run.
  //
  // It is kept in the tab's own storage, which a reload keeps and a new
  // tab never has, so a page that is opened rather than reloaded still
  // opens on an empty box, for the reasons 05-keep.js gives.  And it is
  // kept against the address it was written at: other pages here run this
  // same script, and a place from one is nothing to put back on another.
  var RELOAD_KEY = "flowchart-reload";

  //
  // A program too long for the tab's storage is named in the place rather
  // than carried in it; its words went into the database when it was drawn
  // (see askFor above), and are read back from there.
  function keepForReload() {
    try {
      var one = puttingBack || (aughtToSave() ? progressNow() : null);
      if (!one) { sessionStorage.removeItem(RELOAD_KEY); return; }
      var src = one.project && one.project.source;
      var long = (src ? String(src.code || "").length : 0) +
                 (typeof one.built === "string" ? one.built.length : 0);
      if (long >= BIG_TEXT || one.codeRef) {
        var split = splitTexts(one);
        tabKeys = Object.keys(split.texts);
        if (one.codeRef) { tabKeys.push(one.codeRef); }
        putTexts(split.texts);           // there already, as a rule
        one = split.place;
      }
      sessionStorage.setItem(RELOAD_KEY, JSON.stringify(
        { where: location.pathname, place: one }));
    } catch (e) { /* storage turned off, or full: the reload starts afresh */ }
  }

  // Whether there was a place to go back to, and it was put back.
  function backFromReload() {
    if (!el("#code")) { return false; }
    var kept = null;
    try { kept = JSON.parse(sessionStorage.getItem(RELOAD_KEY)); }
    catch (e) { kept = null; }
    var one = kept && kept.where === location.pathname ? kept.place : null;
    if (!one || !one.project || one.project.what !== "flowchart-builder") {
      return false;
    }
    if (one.codeRef || one.builtRef) {
      // Its words are in the database: the place is this tab's until they
      // are read, and put back when they have been.
      tabKeys = [one.codeRef, one.builtRef].filter(Boolean);
      puttingBack = one;
      fullPlace(one).then(function (whole) {
        if (puttingBack === one) { putBack(whole); }
      }, function () { putBackDone(one); });
      return true;
    }
    try { putBack(one); }
    catch (e) {
      // Unreadable: the page opens as usual, and the next going writes down
      // what is on it rather than this again.
      puttingBack = null;
      return false;
    }
    return true;
  }

  // Going: a reload, a closed tab, or another page in this one.  Hidden is
  // said as well, because a phone that has put the browser away may end it
  // without saying anything more.
  window.addEventListener("pagehide", keepForReload);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { keepForReload(); }
  });

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
