// ---------------------------------------------------------------------------
//  14-run.js -- running the program the chart was built from
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
//  14-run.js -- running the program the chart was built from
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ============================================================== running ==
  // A flowchart that draws nicely can still be wrong.  This runs it: it goes
  // through the program the chart was made from, one statement at a time,
  // lighting up the shape it is on, asking for whatever the program asks a
  // person for, and printing what it prints.  If it never stops, it says so
  // rather than hanging.  That is the test: not "does it look like a
  // flowchart" but "does it do what it is supposed to do".
  var AST = null;                        // the program, as data
  var running = false, stopping = false, waiting = null;
  var stepOn = null;                     // set while it stands waiting to be
                                         //   asked for the next step
  // Running a program to find out what it prints, rather than to watch it
  // happen.  A puzzle is marked by running it against a few sets of
  // answers and reading what came out, and none of the watching is wanted
  // for that: no tape, no camera, no red marks, no pacing, and nobody to
  // type into it.  The run itself is the same run.
  var quiet = false;
  var STEP_CAP = 200000;                 // past this, it is not going to stop
  var DEEP_CAP = 400;                    // calls inside calls, before it is a
                                         //   module going round and round
  var BREATH = 250;                      // steps between letting the page back in
  var breaths = 0;
  var stepsUsed = 0;                     // steps taken, the whole program over
  var callsDeep = 0;                     // how many calls in the run is
  var GLOBALS = {};                      // the names every chart can see

  // Letting go, properly.  Everything in here is async, but awaiting a value
  // that is already there only yields a microtask -- and the browser does not
  // look at the mouse between microtasks.  So a loop with nothing to type into
  // it used to run flat out with the page frozen: the Stop button had been
  // pressed, the click was sitting in the queue, and nothing read it until the
  // step cap was reached minutes later.  A timeout is a real turn of the loop,
  // which is what gives the click its chance.
  function breathe() {
    return new Promise(function (go) { setTimeout(go, 0); });
  }

  // One step of the program: count it, stop if asked, and every so often hand
  // the page back so it can answer for itself.  The count is the whole
  // program's, not one chart's: a module that goes round for ever is a
  // program that goes round for ever, and while each call kept a tally of
  // its own it was handed a fresh two hundred thousand steps every time it
  // was called, so the one thing the cap is for never happened.
  async function tick() {
    if (stopping) { throw new Stop(); }
    stepsUsed++;
    if (stepsUsed > STEP_CAP) { throw new Error(TXT.r_forever); }
    if (++breaths >= BREATH) {
      breaths = 0;
      await breathe();
      if (stopping) { throw new Stop(); }
    }
  }

  // Whether there is a program to run, said on the buttons rather than
  // found out by pressing them.  A chart drawn by hand is shapes and
  // arrows: nobody wrote a program behind it, so there is nothing here to
  // walk.  A chart built from pseudocode has one, until the pseudocode is
  // put away again.
  // Something to run: a main flow, or -- for a page holding nothing but a
  // module somebody is trying out -- a module to walk into instead.
  function runnable() {
    return !!(AST && ((AST.main || []).length || (AST.modules || []).length));
  }

  function dressRunner() {
    var ready = runnable();
    all("#run, #see-code, #tape-run, #tape-code").forEach(function (b) {
      b.disabled = !ready;
    });
    var says = el("#run-note");
    if (says) {
      says.textContent = ready ? ""
                       : (byHand ? TXT.r_by_hand : TXT.r_build_first);
    }
  }

  // Let go of the program.  The runner follows the chart that is on the
  // paper, and switching the way the chart is made puts a different chart
  // there.  Before this it kept whatever had last been built from
  // pseudocode: pressing Run while drawing by hand ran a chart you were not
  // looking at, printing its output and lighting up shapes that were not on
  // the paper -- and As code wrote out that same absent program.
  // Put away, rather than let go of.  The pseudocode side keeps its
  // program while the other way of working has the paper, and is handed it
  // back when it returns -- so the chart that comes back is the one that
  // can be run, without being built all over again.
  var keptAST = null, keptLines = null, keptShapes = null;

  function keepProgram() {
    keptAST = AST;
    keptLines = lineOf;
    keptShapes = shapeOf;
  }

  function restoreProgram() {
    AST = keptAST;
    lineOf = keptLines || {};
    shapeOf = keptShapes || {};
    dressRunner();
  }

  function forgetProgram() {
    AST = null;
    forgetLines();
    lightUp(null);
    freshTape();
    dressRunner();
  }

  function talk(what, how) {
    var line = document.createElement("div");
    line.className = "said" + (how ? " " + how : "");
    line.textContent = what;
    var box = el("#tape");
    box.appendChild(line);
    tapeToEnd();
    return line;
  }

  // Saying it once.  A button pressed when there is nothing for it to work
  // on answers with a line in the tape -- and pressing it again is the same
  // question asked again, not a second question, so it does not get a second
  // copy of the same answer written underneath the first.  Press As code six
  // times on an empty page and you used to get six identical lines, which
  // reads as six things having gone wrong.  The line that is already there
  // is shaken instead, so the press is still felt.
  function talkOnce(what, how) {
    var box = el("#tape");
    var last = box ? box.lastElementChild : null;
    if (last && last.textContent === what) {
      briefly(last, "again", 420);
      tapeToEnd();
      return last;
    }
    return talk(what, how);
  }

  // The Run button is in two places at once -- in the panel, and in the bar
  // of the full screen -- and they are the one button: whichever was
  // pressed, both say Stop for as long as it runs.
  function runSays(word) {
    all("#run, #tape-run").forEach(function (b) { b.textContent = word; });
  }

  // The statement being done, not just the shape it is drawn in: a run of
  // Displays shares one shape between them, so the shape says which box and
  // only the statement says which of its lines.
  // The shapes lit last, so that putting them out is not a search of the
  // whole chart at every step of a run.  This is the only place that lights
  // one, so the list is the whole of what is lit.
  var litNow = [];
  function lightUp(item) {
    var id = item ? item.id : 0;
    litNow.forEach(function (g) { g.classList.remove("now"); });
    litNow = [];
    var lit = null;
    shapesNumbered(id).forEach(function (g) {
      g.classList.add("now");
      litNow.push(g);
      if (!lit) { lit = g; }
    });
    // The line is marked after the shapes are lit, not between putting the
    // last one out and lighting the next.  Marking it measures the page,
    // and a page measured halfway through a change is laid out for the
    // half, then laid out again for the rest the moment the camera asks
    // where the shape is -- twice a step, beside a chart of thousands.
    markLine(id, item ? item.line : 0);
    if (!id) { return; }
    // Not while the run fills the screen.  The chart is under the sheet
    // then, where nobody can watch it be followed -- but they could watch
    // it through the dimmed page on either side, zooming in on every
    // shape and out again, so that the white of the paper came and went
    // behind the sheet at every step.  It picks up again the moment the
    // sheet is put away.
    if (lit && following() && !tapeCovers()) { followNode(lit); }
  }

  // The line of pseudocode the shape was drawn from, marked where it is
  // written.  Marked, not selected: selecting a line in a box means focusing
  // the box, and focus during a run belongs to whatever the program is
  // sitting there asking to be typed.
  function markLine(id, line) {
    var code = el("#code");
    if (!code) { return; }
    // There is one band, and a run outranks a click: where the program has
    // got to matters more than the shape somebody last picked.
    code.classList.remove("spot");
    var at = (id && following()) ? (line || (lineOf || {})[id]) : 0;
    var span = at ? lineSpan(code, at) : null;
    if (!span) {
      code.classList.remove("at");
      code.classList.remove("wrong");
      return;
    }
    code.classList.remove("wrong");
    // Where the line is and how tall it is, both measured -- a line too long
    // for the column takes two rows or three, and the mark has to be as tall
    // as the line it is marking.  The ten is the box's own top padding, which
    // is where its ruling starts from as well.
    code.style.setProperty("--at-top", (10 + span.top) + "px");
    code.style.setProperty("--at-tall", span.tall + "px");
    code.classList.add("at");
    showLine(code, at);
  }

  // ---- what it is holding -------------------------------------------------
  // The tape says what a program printed.  It never said what the program
  // had in its hands, and that is the thing a lesson actually spends its
  // time arguing about: the total that comes out one too many, the counter
  // that never moves, the name that is still empty because the Input went
  // into a different box.  All of it was here already -- every chart runs
  // in its own set of names, and has since modules arrived -- and none of
  // it had ever been shown to anybody.
  //
  // What is shown is the chart the run is standing in: that chart's own
  // names, and the ones declared outside every module, which every chart
  // can see.  A module's names are the module's, which is most of the
  // reason for writing one, so showing main's while the run is inside
  // average() would be showing the wrong tin.
  var watchAt = null;                    // the chart whose names are shown
  var watchDue = false;
  var watchCell = {};                    // name -> the box its value is in
  var watchRow = {};                     // name, and whose it is -> its row
  var watchList = "";                    // the names, as they were last built
  var watchFor = null;                   // the chart they were built for

  function watchClear() {
    watchAt = null;
    watchList = "";
    watchFor = null;
    watchCell = {};
    watchRow = {};
    if (el("#watch")) { el("#watch").hidden = true; }
    if (el("#watch-rows")) { el("#watch-rows").textContent = ""; }
    if (el("#watch-where")) { el("#watch-where").textContent = ""; }
  }

  // A value written down the way the pseudocode writes it, so that 12 and
  // "12" do not look alike on the way past -- they behave quite differently
  // the moment anything is added to either, and telling them apart is half
  // of what somebody is looking at this for.
  function watchSays(v) {
    if (v === null || v === undefined) { return TXT.held_none; }
    if (typeof v === "string") { return '"' + v + '"'; }
    if (typeof v === "boolean") { return v ? TXT.yes : TXT.no; }
    if (Array.isArray(v)) { return "[" + v.map(watchSays).join(", ") + "]"; }
    return String(v);
  }

  // Once a frame, however many steps go by.  A program at full speed does
  // thousands of them a second and nobody can read thousands of anything;
  // what is wanted is the latest, which is what this shows.
  //
  // This is called after every single statement of a run that may be two
  // hundred thousand statements long, so it looks the box up once and
  // remembers it -- the box moves about the page, between the panel and
  // the screen it fills, but it is always the same box.  A page with no
  // panel at all -- the viewer written beside an .svg -- remembers that
  // there is none, rather than asking the document afresh every step.
  var watchBox;                          // undefined until first asked
  function watchNow(where) {
    if (quiet) { return; }
    if (watchBox === undefined) { watchBox = el("#watch") || null; }
    if (!watchBox) { return; }
    watchAt = where;
    if (watchDue) { return; }
    watchDue = true;
    requestAnimationFrame(function () { watchDue = false; watchDraw(); });
  }

  function watchDraw() {
    var box = el("#watch"), rows = el("#watch-rows");
    if (!box || !rows || !watchAt) { return; }
    var mine = watchAt.vars || {};
    var names = Object.keys(mine);
    var shared = {};
    Object.keys(GLOBALS).forEach(function (name) {
      // A name the chart has of its own hides the shared one, which is
      // what holderOf does when the program reads it, so it is what the
      // list has to say as well.
      if (!Object.prototype.hasOwnProperty.call(mine, name)) {
        names.push(name);
        shared[name] = true;
      }
    });
    if (!names.length) { box.hidden = true; return; }
    box.hidden = false;
    var says = el("#watch-where");
    if (says) {
      says.textContent = (watchAt.name && watchAt.name !== "main")
        ? say("held_in", { name: watchAt.name + "()" }) : "";
    }
    // The rows change only when the names change -- a name is declared, or
    // the run walks into another chart.  A value arriving in a name that is
    // already there is written into the box it is already in, so that the
    // row can be marked as having just changed rather than being thrown
    // away and made afresh, which marks nothing.
    //
    // A name declared is one row more, not a new table.  A program that
    // keeps every item, clue and lock in a name of its own declares five
    // hundred of them, and making every row over again for each one was a
    // hundred thousand rows made before the game had even begun.  So the
    // rows already there stay, values and all, and only the new one is made
    // and put in its place.  Another chart is another set of names
    // altogether, and is made afresh.
    var now = names.join("|");
    if (now !== watchList) {
      if (watchFor !== watchAt) {
        watchRow = {};
        rows.textContent = "";
      }
      var had = watchRow, at = rows.firstChild;
      watchList = now;
      watchFor = watchAt;
      watchCell = {};
      watchRow = {};
      names.forEach(function (name) {
        var key = (shared[name] ? "shared " : "own ") + name;
        var row = had[key];
        if (!row) {
          row = document.createElement("div");
          row.className = "watch-row" + (shared[name] ? " shared" : "");
          var who = document.createElement("span");
          who.className = "watch-name";
          who.textContent = name;
          if (shared[name]) { who.title = TXT.held_shared; }
          var val = document.createElement("span");
          val.className = "watch-val";
          row.appendChild(who);
          row.appendChild(val);
        }
        // Where it goes in the list: already there, or put there.
        if (row === at) { at = at.nextSibling; }
        else { rows.insertBefore(row, at); }
        watchRow[key] = row;
        watchCell[name] = row.lastChild;
      });
      while (at) {                       // names no longer to be seen
        var gone = at;
        at = at.nextSibling;
        rows.removeChild(gone);
      }
    }
    names.forEach(function (name) {
      var cell = watchCell[name];
      if (!cell) { return; }
      var said = watchSays(shared[name] ? GLOBALS[name] : mine[name]);
      if (cell.textContent === said) { return; }
      var first = cell.textContent === "";
      cell.textContent = said;
      if (!first) { briefly(cell.parentNode, "just", 520); }
    });
  }

  // Ticked unless somebody has said otherwise, and remembered once they
  // have: it is a way of teaching with the page, not a thing that changes
  // from one run to the next.  Unticked, the table folds up under its
  // heading in the panel and is left out of the full screen -- but the run
  // goes on keeping it up to date, so ticking it again in the middle of a
  // run shows what is being held now rather than an empty table.
  var showHeld = true;
  try {
    if (localStorage.getItem("flowchart-held") === "off") { showHeld = false; }
  } catch (e) { /* no storage: shown it is */ }

  function wearHeld() {
    if (el("#watch")) { el("#watch").classList.toggle("shut", !showHeld); }
    var tick = el("#held-on");
    if (tick) { tick.checked = showHeld; }
    try { localStorage.setItem("flowchart-held", showHeld ? "on" : "off"); }
    catch (e) { /* fine */ }
  }

  if (el("#held-on")) {
    el("#held-on").onchange = function () {
      showHeld = el("#held-on").checked;
      wearHeld();
    };
  }
  wearHeld();

  // ---- the run itself ---------------------------------------------------
  function ask(prompt) {                 // what a person has to type in
    if (stopping) { return Promise.resolve(""); }
    return new Promise(function (answer) {
      var row = document.createElement("div");
      row.className = "asking";
      var field = document.createElement("input");
      field.className = "field";
      field.placeholder = prompt || "";
      var go = document.createElement("button");
      go.className = "btn small primary";
      go.textContent = TXT.r_enter;
      function done() {
        var typed = field.value;
        row.replaceWith(Object.assign(document.createElement("div"),
                        { className: "said typed", textContent: "> " + typed }));
        waiting = null;
        answer(typed);
      }
      // Stopped while it sat here waiting to be typed into.  Nothing else
      // would ever settle this promise, so the program hung there with the
      // button still saying Stop: the box goes, and the runner is let go to
      // find that it has been stopped.
      function quit() {
        row.remove();
        waiting = null;
        answer("");
      }
      go.onclick = done;
      field.onkeydown = function (ev) { if (ev.key === "Enter") { done(); } };
      row.appendChild(field);
      row.appendChild(go);
      el("#tape").appendChild(row);
      tapeToEnd();
      field.focus();
      waiting = quit;
    });
  }

  function Stop() { this.kind = "stop"; }
  function Returned(v) { this.kind = "return"; this.value = v; }

  // ---- what went wrong, and where -----------------------------------------
  // The statement the runner has in hand.  Kept because the thing that
  // fails is an expression, which knows nothing about statements, and
  // because a module needs to be able to say where it was called from.
  var doingNow = null;
  var stepped = {};                      // lines it could not do, once each

  // Which statement was being done when it went wrong.  The innermost frame
  // to see the error writes itself on it and every frame above leaves it
  // alone, so a fault inside a module points into the module rather than at
  // the line that called it -- and the trail says how it got there.
  function blame(err, item) {
    if (!err || err instanceof Stop || err instanceof Returned) { return err; }
    if (!err.at && item) { err.at = item; }
    return err;
  }

  // Every word the pseudocode knows, for telling a typo from a sentence.
  var KEYWORDS = ["Display", "Print", "Output", "Input", "Read", "Get", "Set",
                  "Declare", "Constant", "If", "Else", "End If", "While",
                  "End While", "Do", "Repeat", "Until", "For", "End For",
                  "Select", "Case", "Call", "Return", "Module", "Function",
                  "Start", "End"];

  // A line nobody could make sense of.  The reading gives it a box so the
  // chart still draws, and the runner used to step straight over it without
  // a word -- which is how a program runs to the end, prints the wrong
  // answer, and leaves nothing at all to say why.  Now it says which line
  // it could not do, once each, and carries on.
  function cannotDo(item) {
    var key = "k" + (item.id || 0) + ":" + (item.line || 0) + ":" + (item.text || "");
    if (stepped[key]) { return; }
    stepped[key] = true;
    var first = String(item.text || "").split(/[\s(]/)[0];
    var meant = first ? nearest(first, KEYWORDS) : null;
    // A keyword of two words -- End If, End While -- cannot be swapped for
    // one word the way a name can, so those are said and not offered.  The
    // one that is nearly always meant here is a single word misspelt:
    // Dispay, Whlie, Retrun.
    var swap = meant && meant.indexOf(" ") < 0
             ? { how: "change", word: first, instead: meant } : null;
    sayFault({ at: item, message: TXT.r_no_idea, fix: swap,
               tip: meant ? say("r_mean", { name: meant }) : "" }, "warn");
  }

  // ---- where a name lives ------------------------------------------------
  // Every chart runs in its own set of names: what a module calls total is
  // the module's own and not main's, which is most of the reason for writing
  // one.  What they share is whatever was declared outside every module --
  // a Constant at the top of the page is the program's, and the reading
  // marks it so, because it is put up there precisely to be read from
  // inside the modules underneath it.
  function holderOf(where, name) {
    var low = String(name).toLowerCase();
    var boxes = [where.vars, GLOBALS], i;
    for (i = 0; i < boxes.length; i++) {
      if (Object.prototype.hasOwnProperty.call(boxes[i], name)) { return boxes[i]; }
    }
    for (i = 0; i < boxes.length; i++) {     // typed in another case
      if (sameName(boxes[i], name) !== name) { return boxes[i]; }
    }
    return null;
  }

  // The spelling the box knows a name by.  Pseudocode is written by people,
  // and Total on one line and total on the next mean the same tin.
  function sameName(box, name) {
    if (Object.prototype.hasOwnProperty.call(box, name)) { return name; }
    var low = String(name).toLowerCase();
    return Object.keys(box).filter(function (k) {
      return k.toLowerCase() === low;
    })[0] || name;
  }

  function seenNames(where) {            // every name this chart can see
    return Object.keys(where.vars).concat(Object.keys(GLOBALS));
  }

  function putIn(where, name, v, global) {
    var box = holderOf(where, name) || (global ? GLOBALS : where.vars);
    box[sameName(box, name)] = v;
  }

  function declareIn(where, name, v, global) {
    var box = global ? GLOBALS : where.vars;
    box[sameName(box, name)] = v;
  }

  // ---- a call: the run walks into another chart --------------------------
  // A program is not one flowchart.  Every module is a chart of its own,
  // drawn beside the main one, and a call is the run walking into it: the
  // same walker, the same shape lit up, the same Step slowly, the same Stop
  // button -- so what there is to watch is the flow leaving one chart and
  // arriving in the next, which is what the picture says happens.
  //
  // It used to be a second walker, a much smaller one, that knew Display and
  // Set and nothing else.  An If inside a module was stepped over, a loop in
  // one never went round at all, and what came back was quietly wrong: the
  // charts were drawn, and only the first of them was ever really run.
  var R_REF = /^(ref|reference|byref)$/i;

  async function runModule(mod, args, outer, given) {
    var names = [], refs = [];
    String(mod.params || "").split(",").forEach(function (p) {
      var bits = p.trim().split(/\s+/).filter(Boolean);
      if (!bits.length) { return; }
      var name = bits[bits.length - 1];
      // a parameter says what it is the same way a Declare does
      if (bits.length > 1) { noteCash(name, bits[0]); }
      names.push(name);
      refs.push(bits.some(function (b) { return R_REF.test(b); }));
    });
    // Counted, rather than quietly filled in.  A module handed one thing
    // when it asks for two used to run with the second one empty, and the
    // blame landed on whichever line inside it used that name first.
    if (args.length !== names.length) {
      throw new Error(say("r_args", { name: mod.name + "()",
                                      want: names.length, got: args.length }));
    }
    var where = { vars: {}, name: mod.name };
    names.forEach(function (name, i) { where.vars[name] = args[i]; });
    var from = doingNow;                 // the statement that called it
    if (++callsDeep > DEEP_CAP) {
      callsDeep--;
      throw new Error(say("r_too_deep", { name: mod.name + "()" }));
    }
    try {
      await runSteps(mod.body, where);
      return "";
    } catch (thrown) {
      if (thrown instanceof Returned) { return thrown.value; }
      if (thrown && !(thrown instanceof Stop)) {
        (thrown.trail = thrown.trail || []).push(
          { name: mod.name + "()", line: from ? from.line : 0 });
      }
      throw thrown;
    } finally {
      callsDeep--;
      // What was handed over by reference goes home again.  A module given a
      // variable rather than a value is meant to be able to change it -- that
      // is the whole of what Ref says -- and the change used to be thrown
      // away with the module's own names the moment it ended.  Only a plain
      // variable can be handed back into: there is nowhere to put an answer
      // if what was passed was a sum.
      refs.forEach(function (isRef, i) {
        if (isRef && outer && /^[A-Za-z_]\w*$/.test(String((given || [])[i] || ""))) {
          putIn(outer, given[i], where.vars[names[i]]);
        }
      });
    }
  }

  function pieces(parts) {               // Display "a: ", x  ->  the bits of it
    var out = [], deep = 0, quote = null, now = "";
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i];
      if (quote) { now += c; if (c === quote) { quote = null; } continue; }
      if (c === '"' || c === "'") { quote = c; now += c; continue; }
      if (c === "(") { deep++; }
      if (c === ")") { deep--; }
      if (c === "," && !deep) { out.push(now); now = ""; continue; }
      now += c;
    }
    if (now.trim()) { out.push(now); }
    return out;
  }

  // ---- money --------------------------------------------------------
  // A number is money when the program says it is, and there are two ways
  // of saying it: declaring it Currency, or putting a currency sign right
  // in front of it in the Display.  Nothing else is touched -- a Real that
  // holds an average, a temperature or a percentage is not money, and
  // printing it with two places after the point would be saying something
  // about it that the program never said.
  var CASH = {};                         // the names this program calls money
  var R_CASH_TYPE = /^(currency|money)$/i;
  var R_CASH_SIGN = /[$\u00a3\u20ac\u00a5\u20b9]\s*$/;

  // The names declared to hold a number, and what a number typed in looks
  // like.  A price is the value most likely to be typed with both places --
  // 23.50, not 23.5 -- and what is typed is text until something decides
  // otherwise.  Deciding by how the number reads keeps 23.50 as the text
  // "23.50", and text is joined by + rather than added, so a bill of 23.50
  // and a tip of 4.23 came to "23.504.23".  What the program declared the
  // name to hold is the thing to go by instead: Currency, Real and Integer
  // all said, before anything was typed, that a number is what belongs
  // there.  Anything undeclared is left as it was -- an order number with
  // a leading zero is not improved by being turned into a number.
  var NUMERIC = {};                      // the names declared to hold numbers
  var R_NUM_TYPE = /^(int|integer|real|num|number|float|double|currency|money|decimal)$/i;
  var R_READS_NUM = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

  function noteCash(name, type) {
    var kind = String(type || "").trim();
    if (R_CASH_TYPE.test(kind)) { CASH[name] = true; }
    if (R_NUM_TYPE.test(kind)) { NUMERIC[name] = true; }
  }

  function cashy(src) {                  // does this expression handle money?
    var names = String(src).match(/[A-Za-z_]\w*/g);
    for (var i = 0; names && i < names.length; i++) {
      if (CASH[names[i]]) { return true; }
    }
    return false;
  }

  // The pieces of a Display are joined as they are worked out, because
  // whether one of them is money can depend on the piece before it: the
  // sign in "Total: $" is what says the next piece is a price.
  async function displayed(item, where) {     // what a Display puts on the tape
    var said = "", bits = pieces(item.parts);
    for (var i = 0; i < bits.length; i++) {
      said += readable(await value(bits[i], where),
                       cashy(bits[i]) || R_CASH_SIGN.test(said));
    }
    talk(said);
  }

  function readable(v, money) {
    if (typeof v === "number") {
      // Money keeps both places whatever the sum came to: 1.8 is 1.80 and
      // 12 is 12.00, because a price with one figure after the point, or
      // none, is not a price anybody would write down.
      if (money) { return v.toFixed(2); }
      return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v))
                                                : String(Math.round(v * 1e6) / 1e6);
    }
    if (typeof v === "boolean") { return v ? TXT.yes : TXT.no; }
    return String(v);
  }

  // ---- the walk ----------------------------------------------------------
  // One walker, and every chart comes through it.  Whatever the runner can
  // do -- a loop, a Select Case, stopping to be typed into, lighting up the
  // shape it is on -- it can now do anywhere in the program, because there
  // is nowhere in the program it does something else.
  async function runSteps(items, where) {
    for (var i = 0; i < items.length; i++) {
      await tick();
      var item = items[i];
      // One box is one step, whatever was written into it.  The declares
      // at the top of a program are drawn as a single tall box, and so is
      // a run of Displays, because each is one thing the program does --
      // but they arrive here as one entry per line, and every line was
      // being lit and waited on in its own right.  Six declares in one box
      // meant six waits on a box that never changed: a second and a half
      // of watching the top of the chart before the program did anything
      // at all, and the longer the box the longer the wait.  The shape is
      // what is being followed, so the shape is what is waited on.
      var inside = i > 0 && item.id && item.id === items[i - 1].id;
      if (item.id && !inside) { lightUp(item); }
      if (slow() && !inside) { await hold(); }
      if (stopping) { throw new Stop(); }
      await doStep(item, where);
      watchNow(where);                   // and what it is holding now
    }
  }

  // One statement, of whatever kind, in whichever chart it was written in.
  async function doStep(item, where) {
    var was = doingNow;
    doingNow = item;
    try {
      switch (item.op) {
        case "declare":
          noteCash(item.var, item.type);
          declareIn(where, item.var,
                    item.expr ? await value(item.expr, where)
                              : (/int|real|num|float|double|currency|money|decimal/i
                                 .test(item.type) ? 0 : ""),
                    item.scope === "global");
          break;
        case "set":
          putIn(where, item.var, await value(item.expr, where),
                item.scope === "global");
          break;
        case "display":
          await displayed(item, where);
          break;
        case "input":
          var typed = await ask(item.text);
          if (stopping) { throw new Stop(); }
          var said = typed.trim(), asNum = parseFloat(said);
          // A name declared to hold a number holds one, however it was
          // written down; anything else has to read back exactly as it was
          // typed before it stops being text.
          var isNum = said !== "" && !isNaN(asNum) &&
                      (NUMERIC[item.var] ? R_READS_NUM.test(said)
                                         : String(asNum) === said);
          putIn(where, item.var, isNum ? asNum : typed,
                item.scope === "global");
          break;
        case "call":
          await value(item.text.replace(/^call\s+/i, ""), where);
          break;
        case "return":
          throw new Returned(item.expr ? await value(item.expr, where) : "");
        case "end": throw new Stop();
        case "start": break;               // a way in, not something to do
        case "if":
          if (truthy(await value(item.cond, where))) { await runSteps(item.then, where); }
          else { await runSteps(item["else"] || [], where); }
          break;
        case "while":
          while (truthy(await value(item.cond, where)) !== !!item.until) {
            await tick();
            lightUp(item);
            if (slow()) { await hold(); }
            await runSteps(item.body, where);
          }
          break;
        case "dowhile":
          do {
            await tick();
            await runSteps(item.body, where);
            lightUp(item);
            if (slow()) { await hold(); }
          } while (truthy(await value(item.cond, where)) !== !!item.until);
          break;
        case "for":
          if (item.init) { await doStep(statementOf(item.init, item), where); }
          while (!item.cond || truthy(await value(item.cond, where))) {
            await tick();
            await runSteps(item.body, where);
            if (item.step) { await doStep(statementOf(item.step, item), where); }
            if (!item.step) { break; }
          }
          break;
        case "select":
          var pick = await value(item.expr, where), went = false;
          for (var c = 0; c < item.cases.length; c++) {
            var label = String(item.cases[c].match || "");
            if (/^(default|case else|else)$/i.test(label.trim())) { continue; }
            if (same(pick, await value(label, where))) {
              await runSteps(item.cases[c].body, where);
              went = true;
              break;
            }
          }
          if (!went) {
            for (var d = 0; d < item.cases.length; d++) {
              if (/^(default|case else|else)$/i
                  .test(String(item.cases[d].match || "").trim())) {
                await runSteps(item.cases[d].body, where);
                break;
              }
            }
          }
          break;
        default: cannotDo(item); break;
      }
    } catch (thrown) {
      throw blame(thrown, item);
    } finally {
      doingNow = was;
    }
  }

  // "Set i = i + 1" as something to do.  A For's counting is written out by
  // the reading rather than typed by anybody, so what it belongs to is
  // handed in with it: an error in the step of a For should point at the
  // For, not at a line nobody can find.
  function statementOf(text, from) {
    var m = /^(?:set\s+|let\s+)?([A-Za-z_]\w*)\s*(?:=|:=|<-)\s*(.+)$/i.exec(text);
    var out = m ? { op: "set", var: m[1], expr: m[2] }
                : { op: "other", text: text };
    if (from) { out.id = from.id; out.line = from.line; }
    return out;
  }

  // How fast it goes: straight through, a step every quarter second, or a
  // step each time it is asked for one.  It used to be a switch, so there
  // were only the first two, and the one a class actually wants -- stop on
  // this decision, talk about it, carry on -- could not be asked for at all.
  function pace() {
    var pick = el("#r-pace");
    return pick ? pick.value : "slow";
  }
  function slow() { return pace() !== "fast"; }
  function byStep() { return pace() === "press"; }
  // Only while it is stepping slowly.  At full speed the chart would be a
  // blur of shapes flying past, which is worse to watch than not moving at
  // all -- so a run at full speed simply does not follow, and one that is
  // being stepped through always does.
  //
  // It used to be a switch of its own, sitting beside the pace with the
  // pace deciding whether it was allowed to be on.  Nobody turns it off:
  // watching the chart is the whole reason for stepping through, and a
  // switch that is on every time it is able to be on is a switch that only
  // ever had one answer.  So it is not asked any more.
  function following() {
    return !quiet && slow();
  }
  if (el("#r-pace")) {
    el("#r-pace").onchange = function () {
      // Changed to a timer in the middle of a run that was waiting to be
      // asked for the next step: let it go, or it would sit there for good
      // with nothing left on the page to release it.
      if (stepOn) { stepOn(); }
      // Gone to full speed: the band on the line it was on is stale the
      // moment it stops being followed.
      if (!slow()) { markLine(null); }
      try { localStorage.setItem("flowchart-pace", pace()); }
      catch (e) { /* storage turned off: it starts on Step slowly */ }
    };
  }
  // A quarter of a second, or however long it takes somebody to press the
  // button -- which is the same promise either way, so nothing that steps
  // through the program has to know which of the two it is waiting on.
  function hold() {
    if (quiet) { return Promise.resolve(); }
    if (!byStep()) {
      return new Promise(function (go) { setTimeout(go, 260); });
    }
    return new Promise(function (go) {
      stepOn = function () { stepOn = null; showNext(false); go(); };
      showNext(true);
    });
  }

  // The panel's button and the one in the full screen's bar are the same
  // button, the way Run and Stop are.  The bar's is put away between steps
  // and so loses the keyboard each time it goes; pressed from the keyboard
  // it is handed the keyboard back when it returns, so a class can be
  // stepped through with the space bar without reaching for the mouse.
  var nextHeld = false;
  function showNext(here) {
    var row = el("#next-row"), bar = el("#tape-next");
    if (row) {
      if (here) { row.classList.add("here"); }
      else { row.classList.remove("here"); }
    }
    if (!bar) { return; }
    if (!here && document.activeElement === bar) { nextHeld = true; }
    bar.hidden = !here;
    if (here && nextHeld && tapeCovers()) { bar.focus(); }
    if (here || !running) { nextHeld = false; }
  }

  all("#next, #tape-next").forEach(function (b) {
    b.onclick = function () { if (stepOn) { stepOn(); } };
  });

  async function runIt() {
    if (running) {
      stopping = true;
      if (waiting) { waiting(); }        // let go of an Input it is sat at
      if (stepOn) { stepOn(); }          // and of a step it is waiting to take
      return;
    }
    if (!runnable()) { talkOnce(TXT.r_nothing, "bad"); return; }
    running = true; stopping = false; breaths = 0;
    stepsUsed = 0; callsDeep = 0;
    CASH = {};                           // a fresh run, a fresh set of names
    GLOBALS = {};                        //   and a fresh set of shared ones
    stepped = {};
    doingNow = null;
    if (!quiet) {
      markFault(null);                   // last time's red, gone
      tapeShow("run");                   // whatever was being read, watch this
      tapeSays("r_head", TXT.r_head, "");
      if (following()) { keepView(); }   // to give back at the end of it
      runSays(TXT.r_stop);
      el("#tape").innerHTML = "";
      watchClear();                      // nothing held yet, this time round
    }
    var where = { vars: {}, name: "main" };
    var broke = null;
    try {
      if ((AST.main || []).length) {
        await runSteps(AST.main, where);
      } else {
        // Nothing but modules: there is no main flow to start in.  Rather
        // than refuse to run a page somebody has only just written, it
        // walks into the first chart there is, and says that is what it did.
        talk(say("r_no_main", { name: AST.modules[0].name + "()" }), "warn");
        await runModule(AST.modules[0], [], where, []);
      }
      talk(TXT.r_done, "good");
    } catch (thrown) {
      if (thrown instanceof Stop || thrown instanceof Returned) {
        talk(TXT.r_done, "good");
      } else {
        broke = thrown;
      }
    }
    if (!quiet) {
      lightUp(null);
      backToView();
    }
    if (broke) { sayFault(broke, "bad"); }
    var over = false;
    for (var key in stepped) { if (stepped[key]) { over = true; } }
    if (over) { talk(TXT.r_stepped_over, "warn"); }
    // Left showing where it stopped.  An error you have to catch as it
    // flies past is not much better than no error at all: the shape stays
    // red in the chart and the line stays red in the pseudocode until the
    // next run, so there is something to go and look at afterwards.
    if (!quiet) { markFault(broke ? broke.at : null); }
    running = false; stopping = false;
    stepOn = null;
    if (!quiet) {
      showNext(false);                   // however it ended, nothing is waiting
      runSays(TXT.r_run);
    }
  }

  // One run, with the answers written out in advance and nothing drawn.
  // What comes back is the lines the program printed -- only its own, not
  // the runner's "Finished." or its warnings, which is what `how` tells
  // them apart -- and whether it fell over on the way.
  async function runQuietly(feed) {
    var said = [], wentWrong = false;
    var wasTalk = talk, wasAsk = ask, wasLit = lightUp, wasCap = STEP_CAP;
    var given = (feed || []).slice();
    quiet = true;
    // A marking run is only ever asked one question -- did the right thing
    // come out -- and a program that has not answered it in a few thousand
    // steps is not going to.  The cap that keeps a watched run from hanging
    // is two hundred thousand steps, and a puzzle whose fault is a loop
    // that never ends spent four seconds reaching it before the page would
    // say so.  Marking stops far earlier; the run you watch does not.
    STEP_CAP = 8000;
    talk = function (what, how) {
      if (!how) { said.push(String(what)); }
      if (how === "bad") { wentWrong = true; }
      return document.createElement("div");
    };
    ask = function () {
      return Promise.resolve(given.length ? String(given.shift()) : "");
    };
    lightUp = function () { /* nothing to light up: nobody is watching */ };
    try {
      await runIt();
    } catch (e) {
      wentWrong = true;
    } finally {
      quiet = false;
      talk = wasTalk; ask = wasAsk; lightUp = wasLit;
      STEP_CAP = wasCap;
      running = false; stopping = false;
    }
    return { said: said, wentWrong: wentWrong };
  }

  // The same thing, watched.  Marking a puzzle used to happen out of
  // sight: you pressed a button and were told yes or no, which is a
  // verdict rather than a run, and a verdict teaches nothing about the
  // program that earned it.  This runs the program the way pressing Run
  // runs it -- down the chart, a shape at a time, printing as it goes --
  // and only answers the questions for you, so what you watch is the
  // thing being marked rather than a report on it.
  async function runWatched(feed) {
    var said = [], wentWrong = false;
    var wasAsk = ask, wasTalk = talk;
    var given = (feed || []).slice();
    ask = function () {
      return Promise.resolve(given.length ? String(given.shift()) : "");
    };
    talk = function (what, how) {
      if (!how) { said.push(String(what)); }
      if (how === "bad") { wentWrong = true; }
      return wasTalk(what, how);         // and still put it on the tape
    };
    try {
      await runIt();
    } catch (e) {
      wentWrong = true;
    } finally {
      ask = wasAsk; talk = wasTalk;
      running = false; stopping = false;
    }
    return { said: said, wentWrong: wentWrong };
  }
