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
  // expected text.  That matters because there is more than one way to put
  // nearly all of these right, and every one of them counts.
  //
  // They belong to the pseudocode side.  A puzzle arrives as a program in
  // the box and is put right there, so drawing by hand puts it down, and
  // the button that offers them is not in the bar while you draw.
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
        start: "Start\nDeclare Integer score\nInput score\nIf score > 60 Then\n    Display \"pass\"\nElse\n    Display \"fail\"\nEnd If\nStop",
        tries: [{ give: ["60"], want: ["pass"] },
                { give: ["59"], want: ["fail"] },
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
        start: "Start\nDeclare Integer score\nDeclare Integer total\ntotal = 0\nFor i = 1 To 5\n    Input score\n    total = total + score\nEnd For\nDisplay total / 6\nStop",
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
        start: "Start\nDeclare Integer cents\nInput cents\nDisplay cents div 100\nDisplay cents div 10\nDisplay cents mod 10\nStop",
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
  var lastPuzzle = null;                 // the one worked on last, shut or not
  var checking = false;                  // a check is under way

  function recallSolved() {
    try { solved = JSON.parse(localStorage.getItem("flowchart-solved")) || {}; }
    catch (e) { solved = {}; }
    try { work = JSON.parse(localStorage.getItem("flowchart-puzzle-work")) || {}; }
    catch (e) { work = {}; }
  }

  function keepSolved() {
    try { localStorage.setItem("flowchart-solved", JSON.stringify(solved)); }
    catch (e) { /* storage turned off: it just will not be there next time */ }
  }

  // ---- what has been typed at each one ----------------------------------
  // The studio does not keep your pseudocode between visits, and says why:
  // it opens on an empty page because opening it is nearly always the
  // start of something, and clearing last fortnight's work before you can
  // begin is a worse first minute than a blank box.
  //
  // None of that is true of a puzzle.  A puzzle you are halfway through is
  // exactly what you were doing, you did not choose the program in the box
  // and cannot get it back by typing, and there is a particular sting in
  // losing a fix you had nearly got to a reload or a closed tab.  So these
  // are kept -- one draft per puzzle, under its own key, put back when you
  // open that puzzle again.
  var work = {};

  function keepWork() {
    try { localStorage.setItem("flowchart-puzzle-work", JSON.stringify(work)); }
    catch (e) { /* storage turned off: it lasts as long as the tab does */ }
  }

  function noteWork() {
    if (!onPuzzle || !el("#code")) { return; }
    var said = el("#code").value;
    // Back to how it arrived is nothing to keep: it is what opening the
    // puzzle puts there anyway.
    if (said === onPuzzle.start) { delete work[onPuzzle.key]; }
    else { work[onPuzzle.key] = said; }
    keepWork();
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

  function lockArt() {
    return '<svg class="lock" viewBox="0 0 16 16" fill="none" ' +
           'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" ' +
           'stroke-linejoin="round"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5"/>' +
           '<path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>';
  }

  function buildPuzzles() {
    var body = el("#pz-body");
    if (!body) { return; }
    body.innerHTML = "";
    var count = puzzlesDone();
    var tally = el("#pz-count");
    if (tally) { tally.textContent = say("pz_done", count); }
    PUZZLES.forEach(function (level, i) {
      var open = levelOpen(i);
      var part = document.createElement("section");
      part.className = "more-part";
      // The name of the level and how far through it you are, on one line.
      // A level not open yet says what opens it in the same place, and
      // still shows its puzzles underneath, dimmed: a line of text where
      // the puzzles should be said less about what was coming than the
      // puzzles themselves do.
      var top = document.createElement("div");
      top.className = "pz-level-top";
      var head = document.createElement("h3");
      head.textContent = TXT[level[0]] || level[0];
      var tally = document.createElement("span");
      var got = solvedIn(level), of = level[1].length;
      tally.className = "pz-tally" + (open && got === of ? " full" : "");
      // Only the next level to open says how many it wants.  The ones past
      // it wait on a level that is itself shut, where "solve 4 more" would
      // be counting the wrong puzzles; they wear a lock and nothing else.
      if (open) { tally.textContent = got + " / " + of; }
      else if (levelOpen(i - 1)) {
        tally.textContent = say("pz_locked",
                                { n: TO_OPEN - solvedIn(PUZZLES[i - 1]) });
      } else { tally.innerHTML = lockArt(); }
      top.appendChild(head);
      top.appendChild(tally);
      part.appendChild(top);
      var list = document.createElement("div");
      list.className = "pz-grid" + (open ? "" : " shut");
      level[1].forEach(function (one, j) {
        var b = document.createElement("button");
        b.className = "btn small pz" + (solved[one.key] ? " won" : "") +
                      (one === lastPuzzle ? " here" : "");
        b.innerHTML = (solved[one.key] ? tickArt() : "") +
                      "<span>" + one.no + "</span>";
        b.style.setProperty("--i", j);
        if (open) {
          b.title = TXT[one.key + "_b"] || "";
          b.onclick = function () { openPuzzle(one); };
        } else {
          b.disabled = true;
        }
        list.appendChild(b);
      });
      part.appendChild(list);
      body.appendChild(part);
    });
  }

  function showPuzzles(open) {
    var over = el("#pz-over");
    if (!over) { return; }
    if (open) {
      buildPuzzles();
      // Looked at, so no longer new.  The dot goes out here rather than on
      // the way back out, because the sheet is open in front of you: being
      // told again, once you are standing in it, that there is something
      // to come and see is the thing that made it meaningless.
      noteSeen();
      dressPuzzleButton();
    }
    over.hidden = !open;
    if (el("#puzzles")) {
      el("#puzzles").setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (open && el("#pz-done")) { el("#pz-done").focus(); }
  }

  // ------------------------------------------------ working on one of them --
  // The program goes in the box and is drawn, and the brief sits above the
  // Build button for as long as it is being worked on -- which is as long
  // as the pseudocode side is open: drawing by hand shuts it.
  function openPuzzle(one) {
    onPuzzle = lastPuzzle = one;
    showPuzzles(false);
    // The brief and the Check button are both in the panel, so a puzzle
    // opened with the panel put away was a chart and nothing saying what
    // to do with it.  It comes out -- except on a narrow screen, where it
    // would lie over the chart that is being drawn.
    if (!panelIsOver()) { showPanel(true); }
    if (el("#code")) {
      setMode(false);
      // Where you left it, if you left it anywhere.
      el("#code").value = work[one.key] || one.start;
      showStarts();
      el("#build").click();
    }
    dressPuzzle();
    // The card is at the top of the panel; take the panel back up to it.
    var card = el("#pz-card");
    if (card && card.scrollIntoView) { card.scrollIntoView({ block: "nearest" }); }
  }

  // Back to the program as it arrived, with what was typed at it thrown
  // away.  It goes in the box as typing would, so Undo can bring the
  // attempt back if that was not what was meant.
  function resetPuzzle() {
    if (!onPuzzle || !el("#code")) { return; }
    var box = el("#code");
    box.focus();
    box.select();
    var put = false;
    try { put = document.execCommand("insertText", false, onPuzzle.start); }
    catch (e) { put = false; }
    if (!put) {
      box.value = onPuzzle.start;
      box.dispatchEvent(new Event("input", { bubbles: true }));
    }
    delete work[onPuzzle.key];
    keepWork();
    el("#build").click();
    var mark = el("#pz-mark");
    if (mark && !solved[onPuzzle.key]) { mark.className = "hint"; mark.textContent = ""; }
  }

  function shutPuzzle() {
    onPuzzle = null;
    dressPuzzle();
  }

  // Which level a puzzle belongs to, and where to go when it is beaten.
  function levelIndexOf(one) {
    for (var i = 0; i < PUZZLES.length; i++) {
      if (PUZZLES[i][1].indexOf(one) >= 0) { return i; }
    }
    return -1;
  }

  // The next one worth opening: the next unsolved puzzle in this level,
  // then the first unsolved one in the next level that solving this has
  // opened, and failing both, anything skipped further back.  Finishing a
  // puzzle should hand you the next thing to do rather than the sheet you
  // came from -- the sheet is still a click away, and nobody who has just
  // fixed something wants to be sent back to a menu to find out what is
  // next.
  function nextAfter(one) {
    var at = levelIndexOf(one), i, j;
    if (at < 0) { return null; }
    var here = PUZZLES[at][1];
    for (j = here.indexOf(one) + 1; j < here.length; j++) {
      if (!solved[here[j].key]) { return here[j]; }
    }
    for (i = at + 1; i < PUZZLES.length; i++) {
      if (!levelOpen(i)) { break; }
      for (j = 0; j < PUZZLES[i][1].length; j++) {
        if (!solved[PUZZLES[i][1][j].key]) { return PUZZLES[i][1][j]; }
      }
    }
    for (i = 0; i < PUZZLES.length; i++) {
      if (!levelOpen(i)) { break; }
      for (j = 0; j < PUZZLES[i][1].length; j++) {
        if (!solved[PUZZLES[i][1][j].key]) { return PUZZLES[i][1][j]; }
      }
    }
    return null;
  }

  // Run is the button that marks it, so Run is what it has to say it does.
  // It goes back to saying Run the moment the puzzle is shut.  The runner
  // puts its own word back on the button at the end of every run, so this
  // is said again after each check as well as on opening.
  function dressRunButton() {
    var run = el("#run");
    if (run && !running) {
      run.textContent = onPuzzle ? (TXT.pz_check || "Check")
                                 : (TXT.r_run || "Run");
    }
  }

  function dressPuzzle() {
    dressRunButton();
    var card = el("#pz-card");
    var mark = el("#pz-mark");
    var on = el("#pz-next");
    if (!card) { return; }
    if (!onPuzzle) {
      card.hidden = true;
      if (mark) { mark.className = "hint"; mark.textContent = ""; }
      if (on) { on.hidden = true; }
      return;
    }
    card.hidden = false;
    // Numbered, and named after the thing it is about -- a car park sign,
    // a library fine.  Naming it after the fault would be handing over the
    // answer in the title, which is why these are named after the job.
    var named = TXT[onPuzzle.key + "_t"] || "";
    el("#pz-name").textContent = say("pz_one", { n: onPuzzle.no }) +
                                 (named ? " · " + named : "");
    var job = TXT[onPuzzle.key + "_b"] || "";
    var now = TXT[onPuzzle.key + "_s"] || "";
    el("#pz-said").textContent = job;
    el("#pz-now").textContent = now;
    // Either half stands down if it has nothing to say, heading and all,
    // rather than leaving a heading over a blank.
    if (el("#pz-job-head")) { el("#pz-job-head").hidden = !job; }
    if (el("#pz-now-head")) { el("#pz-now-head").hidden = !now; }
    if (el("#pz-now")) { el("#pz-now").hidden = !now; }
    mark.className = "hint";
    mark.textContent = "";
    var done = !!solved[onPuzzle.key];
    var badge = el("#pz-won");
    if (badge) {
      badge.hidden = !done;
      badge.innerHTML = done ? tickArt() + "<span>" + TXT.pz_right + "</span>" : "";
    }
    if (done) {
      mark.className = "good";
      mark.textContent = TXT.pz_right;
    }
    if (on) {
      var after = done ? nextAfter(onPuzzle) : null;
      on.hidden = !after;
      if (after) {
        on.textContent = levelIndexOf(after) === levelIndexOf(onPuzzle)
                       ? (TXT.pz_next || "Next puzzle")
                       : (TXT.pz_next_level || "Next level");
      }
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
    if (!onPuzzle || checking) { return; }
    var mark = el("#pz-mark");
    checking = true;
    try { await markingIt(mark); }
    finally {
      checking = false;
      stoppedCheck = false;
      dressRunButton();
    }
  }

  // Pressing Check while the check is still walking down the chart stops
  // it, the way pressing Run while a run is going stops that.  A puzzle
  // whose fault is a loop that never ends, watched a step at a time, would
  // otherwise go on until the step cap -- with the button that could have
  // stopped it switched off.
  var stoppedCheck = false;

  async function markingIt(mark) {
    // The puzzle this check is marking.  It can be put down while the check
    // is still going -- shut, or left for drawing by hand -- and a check
    // whose puzzle has gone has nothing left to mark.
    var one = onPuzzle;
    // Checked against what is in the box, not against whatever was last
    // drawn.  Fixing the program and pressing Check marked the chart from
    // before the fix -- "Not there yet" for a program that was right -- so
    // the words are drawn first whenever they have changed since.
    if (el("#code") && el("#code").value !== builtText) {
      await drawItNow();
      if (onPuzzle !== one) { return; }
      // It would not draw: what is wrong with the words is said under the
      // Build button, and said here too, rather than marking the old chart.
      if (el("#code").value !== builtText) {
        mark.className = "hint bad";
        mark.textContent = (el("#build-note") && el("#build-note").textContent) ||
                           TXT.pz_none;
        return;
      }
    }
    // There has to be a chart drawn before there is anything to run, and
    // the runner is the thing that says whether there is.
    if (!runnable()) {
      mark.className = "hint bad";
      mark.textContent = TXT.pz_none;
      return;
    }
    mark.className = "hint";
    mark.textContent = "";
    var beaten = true, why = null;
    for (var i = 0; i < one.tries.length; i++) {
      var go = one.tries[i];
      // The first set of answers is run where it can be watched: down the
      // chart, a shape at a time, printing as it goes, with the answers
      // typed in for you.  The rest are run out of sight -- it is the same
      // program, and watching it go round five times says nothing the
      // first time round did not.
      var got = i === 0 ? await runWatched(go.give)
                        : await runQuietly(go.give);
      // Stopped on purpose, or the puzzle put down: nothing to say.
      if (stoppedCheck || onPuzzle !== one) { return; }
      if (got.wentWrong || !readsSame(got.said, go.want)) {
        beaten = false;
        why = { go: go, got: got };
        break;
      }
    }
    if (beaten) {
      solved[one.key] = true;
      keepSolved();
      briefly(el("#pz-card"), "won", 900);
      dressPuzzleButton();
      dressPuzzle();                     // says it is solved, offers the next
      return;
    }
    // What it should have said is not said back.  Being told the answer is
    // the one thing that stops a puzzle being one, and "it should say 6.60"
    // is the answer to a puzzle about working out change.  What it was
    // given and what it did with it are both fair: they are what anybody
    // watching the run just saw for themselves.
    mark.className = "hint bad";
    mark.textContent = say(why.got.wentWrong ? "pz_broke" : "pz_wrong", {
      give: listed(why.go.give),
      said: listed(why.got.said)
    });
  }

  // The button in the bar wears a dot while there is anything left to
  // solve, and stops wearing it when there is not.
  // Which levels have been looked at since they opened.
  function seenLevels() {
    try { return JSON.parse(localStorage.getItem("flowchart-pz-seen")) || {}; }
    catch (e) { return {}; }
  }

  function noteSeen() {
    var seen = seenLevels();
    PUZZLES.forEach(function (level, i) {
      if (levelOpen(i)) { seen["l" + i] = true; }
    });
    try { localStorage.setItem("flowchart-pz-seen", JSON.stringify(seen)); }
    catch (e) { /* storage turned off: the dot comes back next time */ }
  }

  // Is there a level open that has not been looked at yet?
  function anythingNew() {
    var seen = seenLevels(), found = false;
    PUZZLES.forEach(function (level, i) {
      if (levelOpen(i) && !seen["l" + i]) { found = true; }
    });
    return found;
  }

  function dressPuzzleButton() {
    var button = el("#puzzles");
    if (!button) { return; }
    // Not there while drawing by hand.  Opening a puzzle takes you back to
    // the pseudocode, so from here the button was a way out dressed as
    // something to do.
    button.hidden = byHand;
    var count = puzzlesDone();
    // The dot was on from the first puzzle solved until all fifty were,
    // which is a progress bar wearing a notification's clothes: it looks
    // like something to go and see, and going and seeing it did nothing,
    // so after the first solve it was on for good and said nothing at all.
    // It marks a level that has opened and not been looked at now, which
    // is the one thing here worth being told about -- and looking at it is
    // what puts it out.
    button.classList.toggle("some", anythingNew());
    button.classList.toggle("won", count.all > 0 && count.done === count.all);
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
  // Run does the marking while a puzzle is open, and goes on being Run the
  // rest of the time.  The handler it already has is kept and called: this
  // part of the script is not the one that knows how to run a program.
  if (el("#run")) {
    var runAnyway = el("#run").onclick;
    el("#run").onclick = function (ev) {
      if (onPuzzle && checking && running) { stoppedCheck = true; }
      if (onPuzzle && !running) { return markPuzzle(); }
      return runAnyway ? runAnyway.call(this, ev) : undefined;
    };
  }
  if (el("#pz-next")) {
    el("#pz-next").onclick = function () {
      var after = onPuzzle && nextAfter(onPuzzle);
      if (after) { openPuzzle(after); }
    };
  }
  if (el("#code")) { el("#code").addEventListener("input", noteWork); }
  if (el("#pz-shut")) { el("#pz-shut").onclick = shutPuzzle; }
  if (el("#pz-reset")) { el("#pz-reset").onclick = resetPuzzle; }
  if (el("#pz-list")) { el("#pz-list").onclick = function () { showPuzzles(true); }; }
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && el("#pz-over") && !el("#pz-over").hidden) {
      showPuzzles(false);
    }
  });
