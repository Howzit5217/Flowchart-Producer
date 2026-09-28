// ---------------------------------------------------------------------------
//  33-told.js -- a program told as a story, and the pseudocode it was read as
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ========================================================= told, retold ==
  // The pseudocode box takes plain words as well as pseudocode: "Ask the
  // user for their age.  If they are 18 or older, tell them they can vote."
  // The reading makes pseudocode of it (parse/story.py) and draws that, and
  // the box is left exactly as it was written -- nothing typed is ever
  // replaced.  What it was read as comes back with the chart, and is shown
  // here: under the box in the panel, and filling the screen as a second
  // column beside the words, which is where the two are read against each
  // other.  Running the chart lights the sentence each step came from.
  var toldText = "";                     // what the last Build read the story as

  function showTold(text) {
    var had = !!toldText;
    toldText = String(text || "");
    var has = !!toldText.trim() && !byLang && !byHand;
    // Named by what it was read as.  The name the chart was just drawn with
    // was guessed before the reading, from the words or from the story as
    // it was last time; when the reading names it otherwise, the chart is
    // drawn again where it stands, under the right name.
    if ((has || had) && typeof builtText === "string" && el("#f-title") && !titleOwned()) {
      var was = el("#f-title").value;
      fillTitle(builtText);
      if (el("#f-title").value !== was) { setTimeout(function () { drawItNow(true); }, 0); }
    }
    var told = el("#told"), col = el("#told-col"), over = el("#code-over");
    if (told) { told.hidden = !has; told.classList.remove("stale"); }
    if (col) { col.hidden = !has; col.classList.remove("stale"); }
    if (el("#own-head")) { el("#own-head").hidden = !has; }
    if (over) { over.classList.toggle("two", has); }
    var text2 = toldText.replace(/\s+$/, "");
    if (el("#told-box")) { el("#told-box").value = has ? text2 : ""; }
    if (el("#told-full")) { el("#told-full").value = has ? text2 : ""; }
    numberTold();
  }

  // The numbers down the side of the second column, as the first has.
  function numberTold() {
    var rule = el("#told-rule"), box = el("#told-full");
    if (!rule || !box) { return; }
    var rows = box.value ? box.value.split("\n").length : 1, out = [];
    for (var i = 1; i <= rows; i++) { out.push(i); }
    rule.textContent = out.join("\n");
    rule.scrollTop = box.scrollTop;
  }

  if (el("#told")) {
    ownSliders(el("#told-box"), frameOf(el("#told-box"), "room"), { inside: false });
    copyButton(function () { return toldText; }, el("#told-copy"));
    // Written into since the last Build: shown, but as what it was.
    el("#code").addEventListener("input", function () {
      if (!el("#code").value.trim()) { showTold(""); return; }
      if (toldText) {
        el("#told").classList.add("stale");
        if (el("#told-col")) { el("#told-col").classList.add("stale"); }
      }
    });
  }
  if (el("#told-full")) {
    copyButton(function () { return toldText; }, el("#told-full-copy"));
    el("#told-full-save").onclick = function () {
      save(new Blob([toldText], { type: "text/plain;charset=utf-8" }),
           (chartFileName() || "flowchart") + ".txt");
    };
    el("#told-full").addEventListener("scroll", function () {
      el("#told-rule").scrollTop = el("#told-full").scrollTop;
    });
  }
