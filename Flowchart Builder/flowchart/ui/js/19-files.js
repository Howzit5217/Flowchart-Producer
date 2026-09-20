// ---------------------------------------------------------------------------
//  19-files.js -- saving the whole thing to a file, and opening it again
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------- keeping a copy --
  // Everything that makes this chart what it is, in one small file: the
  // pseudocode or the shapes you placed, the colors, and which shape draws
  // which kind of step.  Open it again here and you are back where you were.
  function projectJson() {
    return JSON.stringify({
      what: "flowchart-builder", version: 1,
      mode: byHand ? "hand" : "code",
      hand: hand,
      source: el("#code") ? {
        code: el("#code").value, title: el("#f-title").value,
        author: el("#f-author").value, shape: el("#f-shape").value,
        legend: el("#f-legend").checked, grid: el("#f-grid").checked,
        options: chartOptions()
      } : null,
      style: style, geom: geom
    }, null, 1);
  }

  function saveProject() {
    var name = (el("#f-title") && el("#f-title").value) || FILE || "flowchart";
    save(new Blob([projectJson()], { type: "application/json" }),
         name.replace(/[^A-Za-z0-9 _-]/g, "") + ".flowchart.json");
  }

  // Said where the button is.  A word about a file belongs beside the thing
  // that opened it, not in the runner's tape at the other end of the panel:
  // that is where "not one of these" used to go, so choosing a document the
  // button would not take looked exactly like the button doing nothing.
  function fileSays(what, bad) {
    // Its own line, not the one under the PNG sizes: that one is rewritten
    // every time the chart changes, and opening a document changes the
    // chart, so the word about the document was wiped by its own arrival.
    var note = el("#file-note");
    if (!note) { talk(what, bad ? "bad" : "note"); return; }
    note.className = bad ? "hint bad" : "hint";
    note.textContent = what;
  }

  // Whatever was picked.  Two things are worth opening: a design saved from
  // here, which comes back exactly as it was, and a plain document of
  // pseudocode, which is the obvious other thing to have on disk and which
  // this used to turn away without a word anyone could see.
  function openFile(name, text) {
    var was = null;
    try { was = JSON.parse(text); } catch (e) { was = null; }
    if (was && was.what === "flowchart-builder") {
      openProject(was);
      fileSays(say("f_opened", { name: name }));
      return;
    }
    if (was) {                           // JSON, but somebody else's
      fileSays(TXT.f_not_ours, true);
      return;
    }
    openWritten(name, text);
  }

  // A document: what is written in it is the pseudocode.
  function openWritten(name, text) {
    if (!el("#code")) { fileSays(TXT.f_not_ours, true); return; }
    if (!String(text).trim()) { fileSays(TXT.f_empty, true); return; }
    el("#code").value = String(text).replace(/\r\n?/g, "\n");
    if (el("#f-title") && !el("#f-title").value.trim()) {
      el("#f-title").value = String(name).replace(/\.[^.]*$/, "");
    }
    // Draw it, rather than put the old paper back: this is a new program,
    // not the one the pseudocode side was looking at before.
    setMode(false);
    el("#build").click();
    fileSays(say("f_opened", { name: name }));
  }

  function openProject(was) {
    // Trust the file for what it has, and fill in what it has not.  A
    // design saved from here carries the lot, but one that has been
    // hand-edited or cut short was taken at its word: a style with no
    // `kinds` in it threw the moment the page went to color a shape, which
    // stopped the opening halfway with the note underneath still saying it
    // had worked.
    if (was.style) {
      style = was.style;
      style.kinds = style.kinds || {};
      style.nodes = style.nodes || {};
    }
    if (was.geom) { geom = was.geom; drawRoles(); }
    if (was.source && el("#code")) {
      el("#code").value = was.source.code || "";
      el("#f-title").value = was.source.title || "";
      el("#f-author").value = was.source.author || "";
      if (was.source.shape && el("#f-shape")) {
        el("#f-shape").value = was.source.shape;
      }
      el("#f-legend").checked = !!was.source.legend;
      el("#f-grid").checked = was.source.grid !== false;
      // An older file carries only the one setting there used to be.
      wearOptions(was.source.options || { decide: was.source.decide });
    }
    if (was.hand && was.hand.nodes) { hand = was.hand; }
    picked = chosen = null;
    // What was open before this file is not behind it: stepping back into
    // another piece of work's colors and shapes would be a stranger thing
    // to be handed than having nothing to step back to.
    forgetUndo();
    setMode(was.mode === "hand");
    // Same again: the chart in the file is not the one that was on the
    // paper, so it is drawn.
    if (was.mode !== "hand" && el("#code").value.trim()) {
      el("#build").click();
    }
    buildGlobals();
    paint();
  }

