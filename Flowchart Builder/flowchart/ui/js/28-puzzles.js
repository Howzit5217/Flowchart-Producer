// ---------------------------------------------------------------------------
//  28-puzzles.js -- programs with something wrong with them, and the marking
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // Reading a chart and writing one are two different things, and neither
  // of them is the thing a class is actually being marked on: whether the
  // program does what it was asked to do.  A puzzle is a program that does
  // not, and the work is finding out why.
  //
  // They are marked by running them.  Each one carries a few sets of
  // answers to type in and what should come out for each -- so a puzzle is
  // solved by the program behaving, not by the pseudocode matching some
  // expected text.  That matters twice over: there is more than one way to
  // put nearly all of these right, and every one of them counts; and the
  // marking works exactly the same on a chart drawn by hand, because by
  // then it is a program either way.
  //
  // Nothing here knows the answers.  It knows what the program should say,
  // which is a different thing and the only thing worth checking.
  var PUZZLES = [
    ["pz_l1", [
      { key: "z_else",
        start: "Start\nDeclare Integer age\nInput age\nIf age >= 18 Then\n    Display \"in\"\nEnd If\nStop",
        tries: [{ give: ["20"], want: ["in"] },
                { give: ["9"], want: ["out"] }] },
      { key: "z_swap",
        start: "Start\nDeclare Integer n\nInput n\nIf n > 10 Then\n    Display \"small\"\nElse\n    Display \"big\"\nEnd If\nStop",
        tries: [{ give: ["12"], want: ["big"] },
                { give: ["3"], want: ["small"] }] },
      { key: "z_count",
        start: "Start\nFor i = 1 To 4\n    Display i\nEnd For\nStop",
        tries: [{ give: [], want: ["1", "2", "3", "4", "5"] }] },
      { key: "z_greet",
        start: "Start\nDeclare String name\nDisplay \"Hello\"\nDisplay name\nInput name\nStop",
        tries: [{ give: ["Sam"], want: ["Hello", "Sam"] }] },
      { key: "z_range",
        start: "Start\nDeclare Integer n\nInput n\nIf n > 0 Or n < 10 Then\n    Display \"in range\"\nElse\n    Display \"out of range\"\nEnd If\nStop",
        tries: [{ give: ["5"], want: ["in range"] },
                { give: ["50"], want: ["out of range"] },
                { give: ["-3"], want: ["out of range"] }] },
      { key: "z_double",
        start: "Start\nDeclare Integer n\nInput n\nDisplay n\nStop",
        tries: [{ give: ["4"], want: ["8"] },
                { give: ["10"], want: ["20"] }] },
      { key: "z_sign",
        start: "Start\nDeclare Integer n\nInput n\nIf n > 0 Then\n    Display \"positive\"\nElse\n    Display \"negative\"\nEnd If\nStop",
        tries: [{ give: ["5"], want: ["positive"] },
                { give: ["0"], want: ["zero"] },
                { give: ["-2"], want: ["negative"] }] },
      { key: "z_twice",
        start: "Start\nDeclare String word\nInput word\nDisplay word\nStop",
        tries: [{ give: ["hi"], want: ["hi", "hi"] }] },
      { key: "z_minus",
        start: "Start\nDeclare Integer a\nDeclare Integer b\nInput a\nInput b\nDisplay a + b\nStop",
        tries: [{ give: ["10", "4"], want: ["6"] },
                { give: ["9", "9"], want: ["0"] }] },
      { key: "z_early",
        start: "Start\nDeclare Integer n\nDeclare Integer answer\nInput n\nDisplay answer\nanswer = n * 3\nStop",
        tries: [{ give: ["4"], want: ["12"] },
                { give: ["10"], want: ["30"] }] }
    ]],
    ["pz_l2", [
      { key: "z_forever",
        start: "Start\nDeclare Integer n\nn = 3\nWhile n > 0\n    Display n\nEnd While\nDisplay \"go\"\nStop",
        tries: [{ give: [], want: ["3", "2", "1", "go"] }] },
      { key: "z_total",
        start: "Start\nDeclare Integer total\nFor i = 1 To 4\n    total = 0\n    total = total + i\nEnd For\nDisplay total\nStop",
        tries: [{ give: [], want: ["10"] }] },
      { key: "z_two",
        start: "Start\nDeclare Integer a\nDeclare Integer b\nInput a\nDisplay a + b\nStop",
        tries: [{ give: ["3", "4"], want: ["7"] },
                { give: ["10", "5"], want: ["15"] }] },
      { key: "z_order",
        start: "Start\nDeclare Integer total\ntotal = 0\nFor i = 1 To 3\n    total = total + i\n    Display total\nEnd For\nStop",
        tries: [{ give: [], want: ["6"] }] },
      { key: "z_until",
        start: "Start\nDeclare Integer n\nn = 0\nDo\n    n = n + 1\n    Display n\nUntil n > 0\nStop",
        tries: [{ give: [], want: ["1", "2", "3"] }] },
      { key: "z_nested",
        start: "Start\nFor row = 1 To 2\n    For col = 1 To 1\n        Display row * col\n    End For\nEnd For\nStop",
        tries: [{ give: [], want: ["1", "2", "2", "4"] }] },
      { key: "z_never",
        start: "Start\nDeclare Integer n\nn = 5\nWhile n > 5\n    Display n\n    n = n - 1\nEnd While\nStop",
        tries: [{ give: [], want: ["5", "4", "3", "2", "1"] }] },
      { key: "z_odds",
        start: "Start\nDeclare Integer total\ntotal = 0\nFor i = 1 To 10\n    If i mod 2 = 1 Then\n        total = total + i\n    End If\nEnd For\nDisplay total\nStop",
        tries: [{ give: [], want: ["30"] }] },
      { key: "z_asked",
        start: "Start\nDeclare Integer n\nDeclare Integer total\ntotal = 0\nInput n\nFor i = 1 To 3\n    total = total + n\nEnd For\nDisplay total\nStop",
        tries: [{ give: ["1", "2", "3"], want: ["6"] },
                { give: ["5", "5", "5"], want: ["15"] }] },
      { key: "z_onemore",
        start: "Start\nDeclare Integer total\ntotal = 0\nFor i = 1 To 11\n    total = total + i\nEnd For\nDisplay total\nStop",
        tries: [{ give: [], want: ["55"] }] }
    ]],
    ["pz_l3", [
      { key: "z_grade",
        start: "Start\nDeclare Integer mark\nInput mark\nIf mark > 50 Then\n    Display \"pass\"\nElse\n    Display \"fail\"\nEnd If\nStop",
        tries: [{ give: ["50"], want: ["pass"] },
                { give: ["49"], want: ["fail"] },
                { give: ["80"], want: ["pass"] }] },
      { key: "z_evens",
        start: "Start\nFor i = 1 To 10\n    Display i\nEnd For\nStop",
        tries: [{ give: [], want: ["2", "4", "6", "8", "10"] }] },
      { key: "z_return",
        start: "Start\nDeclare Integer n\nInput n\nDisplay twice(n)\nStop\n\nFunction twice(x)\n    x = x * 2\nEnd Function",
        tries: [{ give: ["5"], want: ["10"] },
                { give: ["11"], want: ["22"] }] },
      { key: "z_param",
        start: "Start\nDeclare Integer n\nInput n\nCall show(n)\nStop\n\nModule show(x)\n    Display \"x\"\nEnd Module",
        tries: [{ give: ["7"], want: ["7"] },
                { give: ["2"], want: ["2"] }] },
      { key: "z_many",
        start: "Start\nDeclare Integer n\nDeclare Integer many\nFor i = 1 To 5\n    many = 0\n    Input n\n    If n > 10 Then\n        many = many + 1\n    End If\nEnd For\nDisplay many\nStop",
        tries: [{ give: ["4", "20", "30", "1", "50"], want: ["3"] }] },
      { key: "z_divide",
        start: "Start\nDeclare Real total\nDeclare Real n\ntotal = 0\nFor i = 1 To 4\n    Input n\n    total = total + n\nEnd For\nDisplay total / 5\nStop",
        tries: [{ give: ["2", "4", "6", "8"], want: ["5"] }] },
      { key: "z_valid",
        start: "Start\nDeclare Integer n\nDo\n    Input n\nUntil n > 0\nDisplay \"ok\"\nDisplay n\nStop",
        tries: [{ give: ["50", "-1", "7"], want: ["ok", "7"] }] },
      { key: "z_smallest",
        start: "Start\nDeclare Integer n\nDeclare Integer best\nbest = 0\nFor i = 1 To 4\n    Input n\n    If n < best Then\n        best = n\n    End If\nEnd For\nDisplay best\nStop",
        tries: [{ give: ["3", "9", "2", "7"], want: ["9"] }] },
      { key: "z_short",
        start: "Start\nDeclare Integer a\nDeclare Integer b\nInput a\nInput b\nDisplay add(a)\nStop\n\nFunction add(x, y)\n    Return x + y\nEnd Function",
        tries: [{ give: ["3", "4"], want: ["7"] },
                { give: ["10", "5"], want: ["15"] }] },
      { key: "z_stops",
        start: "Start\nDeclare Integer n\nn = 5\nWhile n > 1\n    Display n\n    n = n - 1\nEnd While\nDisplay \"go\"\nStop",
        tries: [{ give: [], want: ["5", "4", "3", "2", "1", "go"] }] }
    ]],
    ["pz_l4", [
      { key: "z_fizz",
        start: "Start\nFor i = 1 To 15\n    If i mod 3 = 0 Then\n        Display \"Fizz\"\n    Else If i mod 5 = 0 Then\n        Display \"Buzz\"\n    Else If i mod 15 = 0 Then\n        Display \"FizzBuzz\"\n    Else\n        Display i\n    End If\nEnd For\nStop",
        tries: [{ give: [], want: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] }] },
      { key: "z_prime",
        start: "Start\nDeclare Integer n\nDeclare Integer factors\nInput n\nfactors = 0\nFor i = 1 To n\n    If n mod i = 0 Then\n        factors = factors + 1\n    End If\nEnd For\nIf factors < 3 Then\n    Display \"prime\"\nElse\n    Display \"not prime\"\nEnd If\nStop",
        tries: [{ give: ["1"], want: ["not prime"] },
                { give: ["7"], want: ["prime"] },
                { give: ["9"], want: ["not prime"] }] },
      { key: "z_digits",
        start: "Start\nDeclare Integer n\nDeclare Integer many\nInput n\nmany = 1\nWhile n > 0\n    n = n div 10\n    many = many + 1\nEnd While\nDisplay many\nStop",
        tries: [{ give: ["7"], want: ["1"] },
                { give: ["123"], want: ["3"] }] },
      { key: "z_revzero",
        start: "Start\nDeclare Integer n\nDeclare Integer back\nInput n\nback = 0\nWhile n > 0\n    back = back + n mod 10\n    n = n div 10\nEnd While\nDisplay back\nStop",
        tries: [{ give: ["123"], want: ["321"] },
                { give: ["70"], want: ["7"] }] },
      { key: "z_sumd",
        start: "Start\nDeclare Integer n\nDeclare Integer total\nInput n\ntotal = 0\nWhile n > 0\n    total = total + n div 10\n    n = n div 10\nEnd While\nDisplay total\nStop",
        tries: [{ give: ["123"], want: ["6"] },
                { give: ["45"], want: ["9"] }] },
      { key: "z_gridrow",
        start: "Start\nFor row = 1 To 3\n    For col = 1 To 3\n        Display row * row\n    End For\nEnd For\nStop",
        tries: [{ give: [], want: ["1", "2", "3", "2", "4", "6", "3", "6", "9"] }] },
      { key: "z_tri",
        start: "Start\nDeclare Integer total\ntotal = 0\nFor i = 1 To 4\n    total = total + i\nEnd For\nDisplay total\nStop",
        tries: [{ give: [], want: ["1", "3", "6", "10"] }] },
      { key: "z_lowhigh",
        start: "Start\nDeclare Integer n\nDeclare Integer lowest\nDeclare Integer highest\nlowest = 0\nhighest = 0\nFor i = 1 To 4\n    Input n\n    If n < lowest Then\n        lowest = n\n    End If\n    If n > highest Then\n        highest = n\n    End If\nEnd For\nDisplay lowest\nDisplay highest\nStop",
        tries: [{ give: ["5", "9", "3", "7"], want: ["3", "9"] },
                { give: ["2", "2", "2", "2"], want: ["2", "2"] }] },
      { key: "z_starsrow",
        start: "Start\nDeclare String line\nFor row = 1 To 3\n    line = \"\"\n    For col = 1 To 3\n        line = line + \"*\"\n    End For\n    Display line\nEnd For\nStop",
        tries: [{ give: [], want: ["*", "**", "***"] }] },
      { key: "z_factloop",
        start: "Start\nDeclare Integer n\nDeclare Integer answer\nInput n\nanswer = 0\nFor i = 1 To n\n    answer = answer * i\nEnd For\nDisplay answer\nStop",
        tries: [{ give: ["4"], want: ["24"] },
                { give: ["1"], want: ["1"] }] }
    ]],
    ["pz_l5", [
      { key: "z_report",
        start: "Start\nDeclare Integer mark\nDeclare Integer total\ntotal = 0\nFor i = 1 To 5\n    Input mark\n    total = total + mark\nEnd For\nDisplay total / 6\nStop",
        tries: [{ give: ["10", "20", "30", "40", "50"], want: ["30"] }] },
      { key: "z_tries",
        start: "Start\nDeclare String word\nDeclare Integer tries\ntries = 0\nDo\n    Input word\n    tries = tries + 1\nUntil word = \"open\" Or tries = 2\nIf word = \"open\" Then\n    Display \"in\"\nElse\n    Display \"out\"\nEnd If\nStop",
        tries: [{ give: ["a", "b", "open"], want: ["in"] },
                { give: ["a", "b", "c"], want: ["out"] }] },
      { key: "z_discount",
        start: "Start\nDeclare Real total\nInput total\nIf total > 100 Then\n    total = total * 0.9\nEnd If\nDisplay total\nStop",
        tries: [{ give: ["60"], want: ["54"] },
                { give: ["40"], want: ["40"] }] },
      { key: "z_convert",
        start: "Start\nDeclare Real c\nInput c\nDisplay c * 9 / 5\nStop",
        tries: [{ give: ["100"], want: ["212"] },
                { give: ["0"], want: ["32"] }] },
      { key: "z_tie",
        start: "Start\nDeclare Integer reds\nDeclare Integer blues\nInput reds\nInput blues\nIf reds > blues Then\n    Display \"Red wins\"\nElse\n    Display \"Blue wins\"\nEnd If\nStop",
        tries: [{ give: ["3", "1"], want: ["Red wins"] },
                { give: ["1", "3"], want: ["Blue wins"] },
                { give: ["2", "2"], want: ["A tie"] }] },
      { key: "z_fibstep",
        start: "Start\nDeclare Integer a\nDeclare Integer b\na = 0\nb = 1\nFor i = 1 To 5\n    Display a\n    a = b\n    b = a + b\nEnd For\nStop",
        tries: [{ give: [], want: ["0", "1", "1", "2", "3"] }] },
      { key: "z_coins",
        start: "Start\nDeclare Integer pence\nInput pence\nDisplay pence div 100\nDisplay pence div 10\nDisplay pence mod 10\nStop",
        tries: [{ give: ["132"], want: ["1", "3", "2"] },
                { give: ["205"], want: ["2", "0", "5"] }] },
      { key: "z_score",
        start: "Start\nDeclare Integer score\nscore = 0\nscore = score + asked(4)\nscore = score + asked(15)\nDisplay score\nStop\n\nFunction asked(answer)\n    Declare Integer said\n    Input said\n    If said = answer Then\n        Return 0\n    Else\n        Return 1\n    End If\nEnd Function",
        tries: [{ give: ["4", "15"], want: ["2"] },
                { give: ["4", "1"], want: ["1"] },
                { give: ["1", "1"], want: ["0"] }] },
      { key: "z_sent",
        start: "Start\nDeclare Integer n\nDeclare Integer total\nDeclare Integer many\ntotal = 0\nmany = 0\nInput n\nWhile n <> 0\n    total = total + n\n    many = many + 1\n    Input n\nEnd While\nDisplay total / (many + 1)\nStop",
        tries: [{ give: ["2", "4", "6", "0"], want: ["4"] },
                { give: ["10", "20", "0"], want: ["15"] }] },
      { key: "z_menu0",
        start: "Start\nDeclare Integer n\nDisplay \"Pick a number, 0 to stop\"\nInput n\nWhile n <> 1\n    Display n\n    Display \"Pick a number, 0 to stop\"\n    Input n\nEnd While\nDisplay \"Bye\"\nStop",
        tries: [{ give: ["5", "0"], want: ["Pick a number, 0 to stop", "5", "Pick a number, 0 to stop", "Bye"] }] }
    ]]
  ];

  // Numbered rather than named.  A name for a puzzle is most of the answer
  // to it -- "The missing Else" is the whole of what is wrong with that one,
  // read before the program it is wrong in -- so they are told apart by
  // where they come instead, straight through from one to fifty.  What each
  // one is for is still said, in full, the moment it is opened: that is the
  // brief, and the brief is the part you are supposed to have.
  (function () {
    var n = 0;
    PUZZLES.forEach(function (level) {
      level[1].forEach(function (one) { one.no = ++n; });
    });
  })();

  // How many of the level before it have to be solved before a level opens.
  // Not all of them: one puzzle nobody can see the trick of should not be a
  // wall across the rest of it.
  var TO_OPEN = 4;

  var solved = {};                       // which have been, between visits
  var onPuzzle = null;                   // the one being worked on, if any

  function recallSolved() {
    try { solved = JSON.parse(localStorage.getItem("flowchart-solved")) || {}; }
    catch (e) { solved = {}; }
  }

  function keepSolved() {
    try { localStorage.setItem("flowchart-solved", JSON.stringify(solved)); }
    catch (e) { /* storage turned off: it just will not be there next time */ }
  }

  function solvedIn(level) {
    return level[1].filter(function (one) { return solved[one.key]; }).length;
  }

  function levelOpen(i) {
    return i === 0 || solvedIn(PUZZLES[i - 1]) >= TO_OPEN;
  }

  function puzzlesDone() {
    var done = 0, all = 0;
    PUZZLES.forEach(function (level) {
      all += level[1].length;
      done += solvedIn(level);
    });
    return { done: done, all: all };
  }

  // ------------------------------------------------------------ the sheet --
  function tickArt() {
    return '<svg class="tick" viewBox="0 0 16 16" fill="none" ' +
           'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
           'stroke-linejoin="round"><path d="M3 8.5 6.5 12 13 4.5"/></svg>';
  }

  function buildPuzzles() {
    var body = el("#pz-body");
    if (!body) { return; }
    body.innerHTML = "";
    var count = puzzlesDone();
    var tally = el("#pz-count");
    if (tally) { tally.textContent = say("pz_done", count); }
    PUZZLES.forEach(function (level, i) {
      var part = document.createElement("section");
      part.className = "more-part";
      part.innerHTML = "<h3>" + (TXT[level[0]] || level[0]) + "</h3>";
      if (!levelOpen(i)) {
        var shut = document.createElement("p");
        shut.className = "hint pz-shut";
        shut.textContent = say("pz_locked",
                               { n: TO_OPEN - solvedIn(PUZZLES[i - 1]) });
        part.appendChild(shut);
        body.appendChild(part);
        return;
      }
      var list = document.createElement("div");
      list.className = "pz-grid";
      level[1].forEach(function (one, j) {
        var b = document.createElement("button");
        b.className = "btn small pz" + (solved[one.key] ? " won" : "");
        b.innerHTML = (solved[one.key] ? tickArt() : "") +
                      "<span>" + one.no + "</span>";
        b.title = TXT[one.key + "_b"] || "";
        b.style.setProperty("--i", j);
        b.onclick = function () { openPuzzle(one); };
        list.appendChild(b);
      });
      part.appendChild(list);
      body.appendChild(part);
    });
  }

  function showPuzzles(open) {
    var over = el("#pz-over");
    if (!over) { return; }
    if (open) { buildPuzzles(); }
    over.hidden = !open;
    if (el("#puzzles")) {
      el("#puzzles").setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (open && el("#pz-done")) { el("#pz-done").focus(); }
  }

  // ------------------------------------------------ working on one of them --
  // The program goes in the box and is drawn, and the brief sits above the
  // Build button for as long as it is being worked on.  From pseudocode or
  // by hand: the card is the same, and so is the marking.
  function openPuzzle(one) {
    onPuzzle = one;
    showPuzzles(false);
    if (el("#code")) {
      setMode(false);
      el("#code").value = one.start;
      showStarts();
      el("#build").click();
    }
    dressPuzzle();
  }

  function shutPuzzle() {
    onPuzzle = null;
    dressPuzzle();
  }

  function dressPuzzle() {
    var card = el("#pz-card");
    if (!card) { return; }
    if (!onPuzzle) { card.hidden = true; return; }
    card.hidden = false;
    el("#pz-name").textContent = say("pz_one", { n: onPuzzle.no });
    el("#pz-said").textContent = TXT[onPuzzle.key + "_b"] || "";
    var mark = el("#pz-mark");
    mark.className = "hint";
    mark.textContent = "";
    if (solved[onPuzzle.key]) {
      mark.className = "good";
      mark.textContent = TXT.pz_right;
    }
  }

  // What a run printed, said back.  A program stuck in a loop prints the
  // same line thousands of times, and a marker that reads all of them back
  // is a wall of text where a sentence was wanted: the first few are
  // enough to see what it is doing wrong.
  function listed(what) {
    if (!what.length) { return TXT.pz_nothing; }
    // A program can print an empty line -- a function that was asked for a
    // value and never gave one prints exactly that -- and "it said ." is
    // not a sentence anybody can act on.
    var said = what.map(function (one) {
      return String(one).trim() ? one : TXT.pz_nothing;
    });
    if (said.length <= 6) { return said.join(", "); }
    return said.slice(0, 6).join(", ") + ", …";
  }

  // Two answers are the same answer if they read the same.  A program that
  // prints 10 and one that prints " 10 " have both got it right, and a
  // class told otherwise by a marker learns the marker rather than the
  // programming.
  function readsSame(said, want) {
    if (said.length !== want.length) { return false; }
    for (var i = 0; i < said.length; i++) {
      if (String(said[i]).trim().toLowerCase() !==
          String(want[i]).trim().toLowerCase()) { return false; }
    }
    return true;
  }

  async function markPuzzle() {
    if (!onPuzzle) { return; }
    var mark = el("#pz-mark");
    // By hand, the design has to read as a program before it can be run at
    // all; from pseudocode, there has to be one drawn.  Either way the
    // runner is the thing that says so.
    if (!runnable()) {
      mark.className = "hint bad";
      mark.textContent = TXT.pz_none;
      return;
    }
    var button = el("#pz-check");
    button.disabled = true;
    mark.className = "hint";
    mark.textContent = TXT.rendering;
    var beaten = true, why = null;
    for (var i = 0; i < onPuzzle.tries.length; i++) {
      var go = onPuzzle.tries[i];
      var got = await runQuietly(go.give);
      if (got.wentWrong || !readsSame(got.said, go.want)) {
        beaten = false;
        why = { go: go, got: got };
        break;
      }
    }
    button.disabled = false;
    if (beaten) {
      solved[onPuzzle.key] = true;
      keepSolved();
      mark.className = "good";
      mark.textContent = TXT.pz_right;
      briefly(el("#pz-card"), "won", 900);
      dressPuzzleButton();
      return;
    }
    mark.className = "hint bad";
    mark.textContent = say(why.got.wentWrong ? "pz_broke" : "pz_wrong", {
      give: listed(why.go.give),
      want: listed(why.go.want),
      said: listed(why.got.said)
    });
  }

  // The button in the bar wears a dot while there is anything left to
  // solve, and stops wearing it when there is not.
  function dressPuzzleButton() {
    var button = el("#puzzles");
    if (!button) { return; }
    var count = puzzlesDone();
    if (count.done && count.done < count.all) { button.classList.add("some"); }
    else { button.classList.remove("some"); }
    if (count.done === count.all) { button.classList.add("won"); }
    else { button.classList.remove("won"); }
  }

  if (el("#puzzles")) {
    el("#puzzles").onclick = function () { showPuzzles(true); };
  }
  if (el("#pz-done")) {
    el("#pz-done").onclick = function () { showPuzzles(false); };
  }
  if (el("#pz-over")) {
    el("#pz-over").onclick = function (ev) {
      if (ev.target === el("#pz-over")) { showPuzzles(false); }
    };
  }
  if (el("#pz-check")) { el("#pz-check").onclick = markPuzzle; }
  if (el("#pz-shut")) { el("#pz-shut").onclick = shutPuzzle; }
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && el("#pz-over") && !el("#pz-over").hidden) {
      showPuzzles(false);
    }
  });
