// ---------------------------------------------------------------------------
//  program.js -- running pseudocode through the page's own runner
//
//  Run by tests/run.py where node is installed.  The runner is lifted straight
//  out of flowchart/ui/js/14-run.js and 15-sums.js -- not a copy of it -- so
//  what is checked here is the code the studio actually runs.  Everything it
//  reaches for that belongs to a browser is stood in for: the tape is an
//  object that collects what was said, typing into it is a list of answers
//  handed over in turn, and nothing is drawn at all.
//
//  run.py reads the pseudocode, hands over the program as data and the words
//  in English, and says what each one ought to print.  Anything that comes
//  out different is printed here, side by side.
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");

var UI = path.join(__dirname, "..", "flowchart", "ui", "js");

function part(name) {
  return fs.readFileSync(path.join(UI, name), "utf8");
}

// ---- something to say it to --------------------------------------------
// As much of an element as the runner ever asks for, and no more.
function madeUp() {
  var nothing = function () {};
  return {
    kids: [], className: "", textContent: "", tabIndex: 0, title: "",
    dataset: {},
    style: { setProperty: nothing, removeProperty: nothing },
    classList: { add: nothing, remove: nothing, toggle: nothing,
                 contains: function () { return false; } },
    appendChild: function (k) { this.kids.push(k); return k; },
    removeChild: nothing, remove: nothing, replaceWith: nothing,
    focus: nothing, scrollTop: 0, scrollHeight: 0,
    get lastElementChild() { return this.kids[this.kids.length - 1] || null; },
    get innerHTML() { return ""; },
    set innerHTML(v) { if (!v) { this.kids.length = 0; } }
  };
}

// ---- the runner, in a room of its own ----------------------------------
// The parts of the page's script share one scope, so these two are read into
// one here as well.  Everything they lean on that is not in them is stood in
// for first, and a plain eval puts the two parts in beside the stand-ins.
function runner(WORDS) {
  var TXT = WORDS;
  var tape = madeUp();
  var faults = [];
  var chart = null;                      // eslint-disable-line no-unused-vars
  var byHand = false;                    // eslint-disable-line no-unused-vars
  var lineOf = {};                       // eslint-disable-line no-unused-vars
  var document = { createElement: function () { return madeUp(); } };

  function say(key, fill) {
    var out = TXT[key] || key;
    for (var name in (fill || {})) {
      out = out.split("{" + name + "}").join(fill[name]);
    }
    return out;
  }
  var titled = { value: "" };            // the Title box, as far as this goes
  var codeBox = null;                    // and the pseudocode box, while mending
  function el(q) {
    if (q === "#tape") { return tape; }
    if (q === "#f-title") { return titled; }
    if (q === "#code") { return codeBox; }
    return null;
  }
  function closeMenu() {}
  function all() { return []; }
  function shapesNumbered() { return []; }
  function briefly() {}
  function freshTape() {}
  function tapeShow() {}
  function tapeSays() {}
  function tapeFull() {}
  function tapeToEnd() {}
  function followNode() {}
  function lineSpan() { return null; }
  function showLine() {}
  function pickLine() {}
  function markFault() {}
  function sayFault(err, how) {
    faults.push({ how: how || "bad", message: err.message || String(err),
                  tip: err.tip || "", line: (err.at && err.at.line) || 0,
                  fix: err.fix || null,
                  trail: (err.trail || []).map(function (s) { return s.name; }) });
    var line = madeUp();
    line.className = "said blame " + (how || "bad");
    line.textContent = err.message || String(err);
    tape.appendChild(line);
  }

  eval(part("14-run.js"));               // eslint-disable-line no-eval
  eval(part("15-sums.js"));              // eslint-disable-line no-eval
  eval(part("18-ahead.js"));             // eslint-disable-line no-eval
  eval(part("18-code.js"));              // eslint-disable-line no-eval
  eval(part("18-write.js"));             // eslint-disable-line no-eval
  eval(part("27-mend.js"));              // eslint-disable-line no-eval

  var go = function (ast, typed) {
    var left = (typed || []).slice();
    AST = ast;
    // Typed into without anybody there to type: the answers were handed over
    // in advance and are given out in turn.
    ask = function () {
      return Promise.resolve(left.length ? String(left.shift()) : "");
    };
    tape.innerHTML = "";
    faults.length = 0;
    return runIt().then(function () {
      return { said: tape.kids.map(function (k) { return k.textContent; }),
               // only what the program itself printed: not the runner's
               // "Finished.", and not anything it said had gone wrong
               printed: tape.kids.filter(function (k) { return k.className === "said"; })
                                 .map(function (k) { return k.textContent; }),
               faults: faults.slice() };
    });
  };
  // The same program written out in one of the languages the studio offers.
  // The title is what a class-shaped language names its class after.
  go.written = function (ast, lang, title) {
    AST = ast;
    titled.value = title || "";
    return codeFor(lang);
  };
  // And the same program cut into a file for each of its charts.  Where
  // there is only one chart there is only one file, and what comes back is
  // the one above -- which is how written.py knows there is nothing extra
  // to run for that one.
  go.apart = function (ast, lang, title) {
    AST = ast;
    titled.value = title || "";
    return filesFor(lang);
  };
  go.languages = function () { return Object.keys(LANGS); };
  // Run for what it prints and nothing else -- the way a puzzle is marked.
  // The run above waits a quarter of a second on every step, as the studio
  // does for somebody watching; sixty programs of that is eight minutes.
  go.quietly = function (ast, typed) {
    AST = ast;
    tape.innerHTML = "";
    faults.length = 0;
    return runQuietly(typed || []).then(function (out) {
      return { printed: out.said,
               faults: out.wentWrong && !faults.length ? [{ how: "bad" }] : faults.slice() };
    });
  };
  // A fix applied to a piece of pseudocode, the way pressing the button
  // under a warning applies it.  Nothing is drawn again afterwards: what is
  // being checked is what got written into the box.
  go.mended = function (source, fix, line) {
    codeBox = { value: source, focus: function () {},
                dispatchEvent: function () {},
                setSelectionRange: function () {} };
    var at = putRight(fix, line);
    var text = codeBox.value;
    codeBox = null;
    return { at: at, text: text };
  };
  // And the whole way round: run it, take the fix off the fault it stopped
  // at, and apply that.
  go.ranAndMended = function (source, ast, typed) {
    return go(ast, typed).then(function (out) {
      var fault = out.faults[0] || {};
      if (!fault.fix) { return { fix: null, text: null }; }
      var done = go.mended(source, fault.fix, fault.line);
      return { fix: fault.fix, at: done.at, text: done.text };
    });
  };
  return go;
}

// ---- and the checking --------------------------------------------------
var asked = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var go = runner(asked.words);
var bad = [];

function fill(text, into) {
  var out = text;
  for (var name in (into || {})) {
    out = out.split("{" + name + "}").join(into[name]);
  }
  return out;
}

function wanted(one) {                   // what run.py said it should print
  return (one.want || []).map(function (line) {
    return typeof line === "string" ? line
         : fill(asked.words[line.key] || line.key, line.fill || {});
  });
}

(async function () {
  for (var i = 0; i < asked.cases.length; i++) {
    var one = asked.cases[i];
    var got;
    try {
      got = await go(one.ast, one.typed);
    } catch (blew) {
      bad.push(one.name + ": it threw -- " + (blew && blew.stack || blew));
      continue;
    }
    var want = wanted(one);
    var said = got.said;
    if (said.length !== want.length ||
        want.some(function (line, n) { return said[n] !== line; })) {
      bad.push(one.name + ":\n      wanted " + JSON.stringify(want) +
               "\n      got    " + JSON.stringify(said));
      continue;
    }
    if (one.trail && JSON.stringify((got.faults[0] || {}).trail || []) !==
                     JSON.stringify(one.trail)) {
      bad.push(one.name + ": the trail said " +
               JSON.stringify((got.faults[0] || {}).trail || []) +
               ", not " + JSON.stringify(one.trail));
    }
  }
  // ---- a fix applied to the pseudocode -------------------------------
  (asked.mends || []).forEach(function (one) {
    var got = go.mended(one.source, one.fix, one.line || 0);
    if (got.text !== one.want) {
      bad.push(one.name + ":\n      wanted " + JSON.stringify(one.want) +
               "\n      got    " + JSON.stringify(got.text));
    }
  });

  // ---- and the whole way round, from a run that stopped --------------
  for (var m = 0; m < (asked.ran || []).length; m++) {
    var each = asked.ran[m];
    var end = await go.ranAndMended(each.source, each.ast, each.typed);
    if (JSON.stringify(end.fix) !== JSON.stringify(each.fix)) {
      bad.push(each.name + ": the fault offered " + JSON.stringify(end.fix) +
               ", not " + JSON.stringify(each.fix));
    } else if (end.text !== each.want) {
      bad.push(each.name + ":\n      wanted " + JSON.stringify(each.want) +
               "\n      got    " + JSON.stringify(end.text));
    }
  }

  // ---- the puzzles: each one broken, each fix mending it -------------
  // A puzzle is only a puzzle if it gets something wrong, and only fair if
  // there is a way to put it right.  Neither is true by looking: both are
  // true by running.  So each one is run twice over -- as it is shipped,
  // which has to come out wrong somewhere, and as tests/puzzles/<key>.txt
  // mends it, which has to come out right everywhere.  The mends live here
  // and not beside the puzzles because a page that carries the answers has
  // given the game away to anybody who opens it.
  function same(said, want) {
    return said.length === want.length &&
           want.every(function (line, n) { return said[n] === line; });
  }

  for (var p = 0; p < (asked.puzzles || []).length; p++) {
    var pz = asked.puzzles[p], wrongSomewhere = false;
    for (var t = 0; t < pz.tries.length; t++) {
      var each = pz.tries[t], where = pz.name + " try " + (t + 1);

      // The mend has to answer for every set of answers, not just one.
      // A puzzle handed over without one -- the same puzzle in another
      // language, say -- is only asked whether it is broken.
      var mended = null;
      try { mended = pz.fixed ? await go.quietly(pz.fixed, each.give.slice()) : null; }
      catch (blew) {
        bad.push(where + ": the mend threw -- " + (blew && blew.message || blew));
      }
      if (mended) {
        if (mended.faults.length) {
          bad.push(where + ": the mend stopped -- " + mended.faults[0].say);
        } else if (!same(mended.printed, each.want)) {
          bad.push(where + ": the mend is wrong\n      wanted " +
                   JSON.stringify(each.want) + "\n      got    " +
                   JSON.stringify(mended.printed));
        }
      }

      // The puzzle itself.  Throwing, stopping or printing the wrong thing
      // all count as broken -- a loop that never ends is a fault to find
      // like any other.
      var asShipped = null;
      try { asShipped = await go.quietly(pz.broken, each.give.slice()); }
      catch (blew) { wrongSomewhere = true; }
      if (asShipped &&
          (asShipped.faults.length || !same(asShipped.printed, each.want))) {
        wrongSomewhere = true;
      }
    }
    if (!wrongSomewhere) {
      bad.push(pz.name + ": nothing is wrong with it -- it already prints " +
               "what every try asks for, so there is no puzzle to solve");
    }
  }

  // ---- and the same programs, written out as code --------------------
  (asked.written || []).forEach(function (one) {
    var text;
    try {
      // `apart` asks for it as a file each, and then all of them are read
      // as one, each under the name of the file it is in: what is being
      // checked is how the files were written, not which of them a line
      // landed in.
      text = one.apart
           ? go.apart(one.ast, one.lang).map(function (file) {
               return "---- " + file.file + "." + file.ext + "\n" + file.text;
             }).join("\n")
           : go.written(one.ast, one.lang).text;
    } catch (blew) {
      bad.push(one.name + ": writing it out threw -- " + (blew && blew.message || blew));
      return;
    }
    (one.has || []).forEach(function (want) {
      if (text.indexOf(want) < 0) {
        bad.push(one.name + " (" + one.lang + "): nowhere in it is " +
                 JSON.stringify(want) + "\n      it wrote:\n" + text);
      }
    });
    // And what must not be anywhere in it.  Some of what the writer is
    // asked for cannot be checked by running the program: code that shares
    // a For's counter between two files runs perfectly well and is simply
    // not what anybody would have written.
    (one.lacks || []).forEach(function (no) {
      if (text.indexOf(no) >= 0) {
        bad.push(one.name + " (" + one.lang + "): " + JSON.stringify(no) +
                 " is in it, and should not be\n      it wrote:\n" + text);
      }
    });
    (one.before || []).forEach(function (pair) {
      var a = text.indexOf(pair[0]), b = text.indexOf(pair[1]);
      if (a < 0 || b < 0 || a > b) {
        bad.push(one.name + " (" + one.lang + "): " + JSON.stringify(pair[0]) +
                 " does not come before " + JSON.stringify(pair[1]) +
                 "\n      it wrote:\n" + text);
      }
    });
  });

  // ---- and a shelf of them, written out to be really run --------------
  // tests/written.py does the running.  What it needs from here is what
  // the runner printed for each program, and the program in every language
  // there is -- handed back in a file, since it is far too much to print.
  if (asked.shelf) {
    var shelf = [];
    for (var s = 0; s < asked.shelf.length; s++) {
      var book = asked.shelf[s], ran = await go.quietly(book.ast, book.typed);
      var code = {}, apart = {};
      go.languages().forEach(function (lang) {
        try { code[lang] = go.written(book.ast, lang, book.title); }
        catch (blew) { code[lang] = { error: String(blew && blew.stack || blew) }; }
        try { apart[lang] = go.apart(book.ast, lang, book.title); }
        catch (blew) { apart[lang] = { error: String(blew && blew.stack || blew) }; }
      });
      shelf.push({ said: ran.printed, faults: ran.faults,
                   code: code, apart: apart });
    }
    fs.writeFileSync(asked.shelfOut, JSON.stringify(shelf));
  }

  bad.forEach(function (line) { console.error("  " + line); });
  console.log(asked.cases.length + " programs run, " +
              (asked.written || []).length + " written out, " +
              ((asked.mends || []).length + (asked.ran || []).length) +
              " put right: " + (bad.length ? bad.length + " wrong" : "ok"));
  process.exit(bad.length ? 1 : 0);
})();
