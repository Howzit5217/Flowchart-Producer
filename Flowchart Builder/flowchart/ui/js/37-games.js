// ---------------------------------------------------------------------------
//  37-games.js -- games to play, and to read as a flowchart while you do
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // The examples show what the pseudocode looks like, and the puzzles are
  // programs to put right.  These are programs to play: ten games, from a
  // coin toss you can read in one look to a sea battle with two fleets on
  // it.  They run like any other program -- your moves are typed into the
  // box the run asks with -- and the chart beside them is the game, so what
  // you watch while you play is how it is made.
  //
  // Each is written in modules: a board drawn by one, a hand of cards added
  // up by another.  That is a chart to each module, beside the main one,
  // which is how a program that size is written -- or, with Options'
  // "Modules and functions in one chart", one flowchart with every module
  // drawn where it is called.  The games are written so that both read
  // well, and the sheet and the card say which it is with a switch of their
  // own.  It is the same switch as the one in Options, not a second one: a
  // setting kept in two places is a setting that can disagree with itself.
  //
  // Like the examples, the programs are words: each language writes every
  // game out for itself (g_coin_p for g_coin), with its name (g_coin), a
  // line saying what it is (g_coin_d) and how to play it (g_coin_h).  They
  // come smallest first, the last four being the big ones.
  var GAMES = ["g_coin", "g_highlow", "g_sticks", "g_dice", "g_hangman", "g_codebreak",
               "g_dungeon", "g_connect", "g_blackjack", "g_battleship"];
  var BIG_GAMES = 4;

  // One of them, in the language the page is in.
  function gameText(key) { return TXT[key + "_p"] || ""; }

  // How big it is, the way the examples say it: lines of program -- and
  // how many charts that comes to, drawn the way the switch says.
  function gameSize(key) {
    var text = gameText(key);
    var lines = text.split("\n").filter(function (l) { return l.trim(); }).length;
    var mods = text.split("\n").filter(function (l) {
      return /^\s*(module|function)\s+\w/i.test(l);
    }).length;
    var charts = oneChartOn() ? 1 : 1 + mods;
    return say("gm_size", { n: lines, charts: charts === 1 ? TXT.gm_chart_one
                                                         : say("gm_charts_n", { n: charts }) });
  }

  var gameOn = null;                     // the game being played, by key
  var gameLast = null;                   // and the one played last, shut or not

  // ---------------------------------------- one flowchart, or a chart each --
  function oneChartOn() {
    var box = el("#o-onechart");
    return !!(box && box.checked);
  }

  // Pressed on the sheet or the card: Options' own box is ticked or not,
  // remembered, and the chart drawn again the way any option draws it.
  function chartsChosen(one) {
    var box = el("#o-onechart");
    if (box && box.checked !== one) {
      box.checked = one;
      optionChanged();
    }
    dressGameCharts();
  }

  function dressGameCharts() {
    var one = oneChartOn();
    all(".gm-charts .seg-btn").forEach(function (b) {
      var on = (b.dataset.charts === "one") === one;
      if (b.classList.contains("on") !== on) { b.classList.toggle("on", on); }
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    all("#gm-list .gm").forEach(function (b) {
      var size = el(".gm-size", b);
      if (size) { size.textContent = gameSize(b.dataset.game); }
    });
  }

  all(".gm-charts .seg-btn").forEach(function (b) {
    b.onclick = function () { chartsChosen(b.dataset.charts === "one"); };
  });
  // Ticked in Options, the switches here follow.
  if (el("#o-onechart")) { el("#o-onechart").addEventListener("change", dressGameCharts); }

  // ------------------------------------------------------------ the sheet --
  function gameButton(key, i) {
    var b = document.createElement("button");
    b.className = "btn gm" + (key === gameLast ? " here" : "");
    b.dataset.game = key;
    [["gm-name", TXT[key] || key], ["gm-what", TXT[key + "_d"] || ""],
     ["gm-size", gameSize(key)]].forEach(function (bit) {
      var span = document.createElement("span");
      span.className = bit[0];
      span.textContent = bit[1];
      b.appendChild(span);
    });
    b.style.setProperty("--i", i);      // so they arrive one after another
    b.onclick = function () { openGame(key); };
    return b;
  }

  // Two parts, the quick games and the big ones, a grid each.
  function buildGames() {
    var list = el("#gm-list");
    if (!list) { return; }
    list.innerHTML = "";
    var n = 0;
    [["gm_small", GAMES.slice(0, GAMES.length - BIG_GAMES), "quick"],
     ["gm_big", GAMES.slice(GAMES.length - BIG_GAMES), "big"]].forEach(function (part) {
      var sec = document.createElement("section");
      sec.className = "more-part";
      var head = document.createElement("h3");
      head.textContent = TXT[part[0]] || "";
      sec.appendChild(head);
      var grid = document.createElement("div");
      grid.className = "gm-grid " + part[2];
      part[1].forEach(function (key) { grid.appendChild(gameButton(key, n++)); });
      sec.appendChild(grid);
      list.appendChild(sec);
    });
  }

  function showGames(open) {
    var over = el("#gm-over");
    if (!over) { return; }
    if (open) {
      buildGames();
      dressGameCharts();
    }
    over.hidden = !open;
    if (el("#games")) { el("#games").setAttribute("aria-expanded", open ? "true" : "false"); }
    if (open && el("#gm-done")) { el("#gm-done").focus(); }
  }
  // It leaves the way the other sheets leave (26-motion.js).
  showGames = goingOver("#gm-over", showGames);

  if (el("#games")) { el("#games").onclick = function () { showGames(true); }; }
  if (el("#gm-done")) { el("#gm-done").onclick = function () { showGames(false); }; }
  if (el("#gm-over")) {
    el("#gm-over").onclick = function (ev) {
      if (ev.target === el("#gm-over")) { showGames(false); }
    };
  }
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && el("#gm-over") && !el("#gm-over").hidden) { showGames(false); }
  });

  // ------------------------------------------------------ playing one --
  // Into the pseudocode box and drawn, the way an example is; and the card
  // at the top of the panel says how to play it for as long as it is the
  // program on the page.  A puzzle open is put down: its card and its
  // Check button belong to a program that is not there any more.
  //
  // The panel comes out even on a phone, where a puzzle leaves it shut so
  // as not to lie over its chart: a game is played in the panel -- Play
  // is on its card, and the moves are typed under Run -- and a game
  // opened with nowhere to play it was a chart and a closed drawer.
  function openGameNow(key) {
    if (onPuzzle) { shutPuzzle(); }
    showGames(false);
    showPanel(true);
    var box = el("#code");
    if (!box) { return; }
    box.value = gameText(key);
    titleComesFrom({ key: key });
    gameOn = gameLast = key;
    showStarts();
    if (byLang || byHand) { setMode(false); }
    // A chart drawn on a narrow screen puts the panel away, to show it
    // (09-build.js); a game wants it back out once its chart is up.
    whenBuilt.push({ at: Date.now(), go: function () {
      if (gameOn === key && panelIsOver()) { showPanel(true); }
    } });
    el("#build").click();
    dressGame();
    var card = el("#gm-card");
    if (card && card.scrollIntoView) { card.scrollIntoView({ block: "nearest" }); }
  }

  // Work on the page is asked about first, as an example asks (36-sync.js).
  function openGame(key) {
    var box = el("#code");
    if (!box || box.value.trim() === gameText(key).trim()) { openGameNow(key); return; }
    guardOpen(function () { openGameNow(key); }, true);
  }

  function shutGame() {
    if (!gameOn) { return; }
    gameOn = null;
    dressGame();
  }

  function dressGame() {
    var card = el("#gm-card");
    if (!card) { return; }
    card.hidden = !gameOn;
    if (!gameOn) { return; }
    el("#gm-name").textContent = TXT[gameOn] || gameOn;
    el("#gm-how").textContent = TXT[gameOn + "_h"] || "";
    dressGameCharts();
    dressPlay();
  }

  // Anything else arriving in the box is not the game any more: an
  // example, a puzzle, a file, saved progress, or most of the box pasted
  // over.  Typing into it is still playing with it, and leaves it alone.
  var titleComesFromPlain = titleComesFrom;
  titleComesFrom = function (from) {
    if (!from || GAMES.indexOf(from.key) < 0) { shutGame(); }
    return titleComesFromPlain.apply(this, arguments);
  };
  var newProgramPlain = newProgram;
  newProgram = function () {
    shutGame();
    return newProgramPlain.apply(this, arguments);
  };
  var titleKeptPlain = titleKept;
  titleKept = function () {
    shutGame();
    return titleKeptPlain.apply(this, arguments);
  };

  // In another language the card says it in that language (the program
  // itself goes over with the rest, 09-build.js).
  if (el("#f-lang")) { el("#f-lang").addEventListener("change", dressGame); }

  if (el("#gm-shut")) { el("#gm-shut").onclick = shutGame; }
  if (el("#gm-all")) { el("#gm-all").onclick = function () { showGames(true); }; }

  // ------------------------------------------------------------ Play --
  // A game is for playing, and Step slowly takes a quarter of a second over
  // every step -- the thousand steps between two shots at sea were four
  // minutes of watching.  Play runs it All at once, this run only: the
  // pace under Run is put back to what it was when the run ends, so Run
  // still steps through a game for anybody who wants to watch it work.
  var paceWas = null;                    // the pace to go back to, while Play has it
  var playWaits = false;                 // Play pressed, the chart still on its way

  function playGame() {
    var run = el("#run"), box = el("#code"), build = el("#build");
    if (!run) { return; }
    if (running) { run.click(); return; }  // a second press stops it, as Run's does
    // What is played is what is in the box, not whatever was drawn before
    // it: a game opened a moment ago can still be on its way to the paper,
    // and Play pressed then played the program before it.  It waits for
    // the drawing, or asks for one, and plays once that is up.
    if (box && box.value !== builtText) {
      if (playWaits) { return; }
      playWaits = true;
      whenBuilt.push({ at: Date.now(),
        go: function () { playWaits = false; dressPlay(); if (box.value === builtText) { playGame(); } },
        fail: function () { playWaits = false; dressPlay(); } });
      if (build && !build.disabled) { build.click(); }
      dressPlay();
      return;
    }
    if (run.disabled) { return; }
    var pick = el("#r-pace");
    if (pick && pick.value !== "fast") {
      paceWas = pick.value;
      pick.value = "fast";
    }
    run.click();
    // And over to where it is played: what the game says, and the box it
    // asks for your move in, are a long way down the panel under Run.
    var tape = el("#tape");
    if (tape && tape.scrollIntoView) {
      tape.scrollIntoView({ block: "nearest", behavior: STILL ? "auto" : "smooth" });
    }
  }

  function dressPlay() {
    var play = el("#gm-play");
    if (!running && paceWas !== null) {
      var pick = el("#r-pace");
      if (pick) { pick.value = paceWas; }
      paceWas = null;
    }
    if (!play) { return; }
    play.textContent = running ? TXT.r_stop : TXT.gm_play;
    play.disabled = playWaits || (!running && !runnable());
  }

  // Chosen by hand in the middle of a Play, the pace is theirs to keep.
  if (el("#r-pace")) { el("#r-pace").addEventListener("change", function () { paceWas = null; }); }
  if (el("#gm-play")) { el("#gm-play").onclick = playGame; }

  // Run and Play are said together: Stop on both while a run goes, and
  // neither pressable while there is nothing drawn to run.
  var runSaysPlain = runSays;
  runSays = function () {
    var out = runSaysPlain.apply(this, arguments);
    dressPlay();
    return out;
  };
  var dressRunnerPlain = dressRunner;
  dressRunner = function () {
    var out = dressRunnerPlain.apply(this, arguments);
    dressPlay();
    return out;
  };
