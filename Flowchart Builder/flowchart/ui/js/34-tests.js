// ---------------------------------------------------------------------------
//  34-tests.js -- tests a program is given: what goes in, what comes out
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ======================================================== tests of its own ==
  // A teacher sets an exercise with the answers it has to give: type in 7,
  // it should say "Odd"; type in 12, "Even".  A student writes the program
  // and runs it once, sees it work, and hands it in -- and the 12 was never
  // tried.  So a program can carry tests of its own: for each, the answers
  // typed into it, one to a line, and what it should print, a line for each.
  // Run the tests and every one is run the way a puzzle is marked (quietly,
  // the answers typed in for you), and each says whether it passed, and
  // where it did not, the first line that came out different.
  //
  // Each way of working keeps its own -- the pseudocode side's and the
  // drawing's -- in this browser, and a saved document carries them.
  var TESTS_KEPT = "flowchart-tests";
  var testSets = { code: [], hand: [] };
  try {
    var keptTests = JSON.parse(localStorage.getItem(TESTS_KEPT) || "null");
    if (keptTests && typeof keptTests === "object") {
      testSets.code = Array.isArray(keptTests.code) ? keptTests.code : [];
      testSets.hand = Array.isArray(keptTests.hand) ? keptTests.hand : [];
    }
  } catch (e) { /* none kept */ }

  function testsHere() { return testSets[byHand ? "hand" : "code"]; }
  function keepTests() {
    try {
      localStorage.setItem(TESTS_KEPT, JSON.stringify({
        code: testSets.code.map(testSaid), hand: testSets.hand.map(testSaid)
      }));
    } catch (e) { /* fine */ }
  }
  function testSaid(t) { return { typed: t.typed || "", want: t.want || "" }; }
  // What a document carries, and what one opened puts back (19-files.js).
  function testsData() {
    return { code: testSets.code.map(testSaid), hand: testSets.hand.map(testSaid) };
  }
  function wearTests(was) {
    testSets.code = (was && Array.isArray(was.code) ? was.code : []).map(testSaid);
    testSets.hand = (was && Array.isArray(was.hand) ? was.hand : []).map(testSaid);
    keepTests();
  }

  function linesOf(text) {
    var out = String(text || "").replace(/\r\n?/g, "\n").split("\n");
    while (out.length && !out[out.length - 1].trim()) { out.pop(); }   // a blank at the end is nothing
    return out;
  }

  function drawTests() {
    var body = el("#tests-body");
    if (!body) { return; }
    var list = testsHere();
    if (!list.length) { list.push({ typed: "", want: "" }); }
    body.innerHTML = "";
    list.forEach(function (t, k) {
      var card = document.createElement("section");
      card.className = "test-card" + (t.result ? (t.result.ok ? " pass" : " fail") : "");
      var head = document.createElement("div");
      head.className = "test-head";
      var name = document.createElement("strong");
      name.textContent = say("tests_one", { n: k + 1 });
      head.appendChild(name);
      if (t.result) {
        var verdict = document.createElement("span");
        verdict.className = "test-verdict";
        verdict.textContent = t.result.ok ? TXT.tests_pass : TXT.tests_fail;
        head.appendChild(verdict);
      }
      var drop = document.createElement("button");
      drop.className = "btn small test-drop";
      drop.textContent = TXT.tests_drop;
      drop.onclick = function () {
        list.splice(k, 1);
        keepTests();
        drawTests();
      };
      head.appendChild(drop);
      card.appendChild(head);
      var cols = document.createElement("div");
      cols.className = "test-cols";
      [["typed", "tests_typed"], ["want", "tests_want"]].forEach(function (pair) {
        var box = document.createElement("label");
        box.className = "test-box";
        var said = document.createElement("span");
        said.textContent = TXT[pair[1]];
        var area = document.createElement("textarea");
        area.className = "field test-text";
        area.rows = 4;
        area.spellcheck = false;
        area.value = t[pair[0]] || "";
        area.oninput = function () {
          t[pair[0]] = area.value;
          t.result = null;
          card.classList.remove("pass", "fail");
          keepTests();
        };
        box.appendChild(said);
        box.appendChild(area);
        cols.appendChild(box);
      });
      card.appendChild(cols);
      if (t.result && !t.result.ok) {
        var why = document.createElement("p");
        why.className = "hint bad test-why";
        why.textContent = t.result.why;
        card.appendChild(why);
      }
      body.appendChild(card);
    });
  }

  function showTests(open) {
    var over = el("#tests-over");
    if (!over) { return; }
    if (open) { drawTests(); }
    over.hidden = !open;
    if (el("#tests-count")) { el("#tests-count").textContent = ""; }
    if (open) {
      var first = el("#tests-body textarea");
      if (first) { first.focus(); }
    }
  }

  // Why one did not pass: the first line that came out different, or how
  // many it printed where so many more or fewer were wanted.
  function testWhy(got, want) {
    if (got.wentWrong) { return TXT.tests_broke; }
    var said = got.said;
    for (var i = 0; i < Math.min(said.length, want.length); i++) {
      if (String(said[i]).trim() !== String(want[i]).trim()) {
        return say("tests_diff", { n: i + 1, got: said[i], want: want[i] });
      }
    }
    return say(said.length < want.length ? "tests_short" : "tests_long",
               { n: said.length, m: want.length });
  }

  var testing = false;
  async function runTests() {
    if (testing || running) { return; }
    var list = testsHere().filter(function (t) { return (t.typed || "").trim() || (t.want || "").trim(); });
    var count = el("#tests-count");
    if (!list.length) { if (count) { count.textContent = TXT.tests_none; } return; }
    if (!runnable()) { if (count) { count.textContent = TXT.r_nothing; } return; }
    testing = true;
    var go = el("#tests-go");
    if (go) { go.disabled = true; }
    var passed = 0;
    try {
      for (var i = 0; i < list.length; i++) {
        var t = list[i], want = linesOf(t.want);
        var got = await runQuietly(linesOf(t.typed));
        var ok = !got.wentWrong && got.said.length === want.length &&
                 got.said.every(function (line, k) { return String(line).trim() === String(want[k]).trim(); });
        t.result = { ok: ok, why: ok ? "" : testWhy(got, want) };
        if (ok) { passed++; }
      }
    } finally {
      testing = false;
      if (go) { go.disabled = false; }
    }
    drawTests();
    if (count) { count.textContent = say("tests_all", { pass: passed, n: list.length }); }
  }

  if (el("#tests-open")) { el("#tests-open").onclick = function () { showTests(true); }; }
  if (el("#tests-done")) { el("#tests-done").onclick = function () { showTests(false); }; }
  if (el("#tests-go")) { el("#tests-go").onclick = runTests; }
  if (el("#tests-add")) {
    el("#tests-add").onclick = function () {
      testsHere().push({ typed: "", want: "" });
      keepTests();
      drawTests();
      var boxes = all("#tests-body textarea");
      if (boxes.length > 1) { boxes[boxes.length - 2].focus(); }
    };
  }
  if (el("#tests-over")) {
    el("#tests-over").onclick = function (ev) {       // the dim behind it shuts it
      if (ev.target === el("#tests-over")) { showTests(false); }
    };
    window.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !el("#tests-over").hidden) { showTests(false); }
    });
  }
