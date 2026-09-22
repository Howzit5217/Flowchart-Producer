// ---------------------------------------------------------------------------
//  05-keep.js -- remembering the colors between visits
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------ keeping it all --
  // The studio opens on an empty page.  What was written last time is not
  // put back into the box: opening it is nearly always the start of
  // something, and having to clear somebody else's program -- or your own
  // from a fortnight ago -- before you can begin is a worse first minute
  // than an empty box is.  A program worth keeping is kept in a file, which
  // is what Save this to a file is for, and Open a file brings it back
  // whole: the words, the title, the colors and all.
  //
  // So the pseudocode is not written to storage either.  Keeping a copy
  // that nothing ever reads would be no kindness: it would sit there being
  // overwritten by the next empty page, out of sight and out of reach, and
  // look like a safety net while being none.
  //
  // A reload is the exception, because it is not the start of anything:
  // the page puts back what it was doing through one of those, from the
  // tab's own storage, which a new tab does not have (29-saves.js).
  //
  // How the studio is set up is still remembered -- your name, the shape to
  // aim at, whether the key and the grid are on, which shape stands for
  // which kind of step.  Those are how you like it rather than what you
  // were doing, and nobody wants to say again every morning that their name
  // is still their name.
  //
  // The title is not among them.  A title belongs to the program it is the
  // title of, and an empty page headed with the name of last week's work is
  // a stranger thing to be handed than an empty page.
  function remember() {
    try {
      localStorage.setItem("flowchart-source", JSON.stringify({
        author: el("#f-author").value, shape: el("#f-shape").value,
        legend: el("#f-legend").checked,
        grid: el("#f-grid").checked, options: chartOptions(), geom: geom
      }));
    } catch (e) { /* storage turned off: it just will not be there next time */ }
  }
  // It used to be called recallSource and hand back whether it had found a
  // program to draw.  It finds no program now, so it is named for what it
  // does do and says nothing back; what is worth drawing on opening is
  // whatever is in the box, which is a thing the page can see for itself.
  function recallSetup() {
    if (!el("#code")) { return; }
    try {
      var was = JSON.parse(localStorage.getItem("flowchart-source"));
      if (!was) { return; }
      el("#f-author").value = was.author || "";
      if (was.shape && el("#f-shape")) { el("#f-shape").value = was.shape; }
      el("#f-legend").checked = !!was.legend;
      el("#f-grid").checked = was.grid !== false;
      wearOptions(was.options || { decide: was.decide });
      if (was.geom) { geom = was.geom; drawRoles(); }
    } catch (e) { /* nothing kept, or unreadable: the defaults stand */ }
  }

  function keep() {
    try {
      localStorage.setItem("flowchart-colors:" + FILE, JSON.stringify(style));
    } catch (e) { /* a private window, or storage turned off: never mind */ }
  }
  function recall() {
    try {
      var was = JSON.parse(localStorage.getItem("flowchart-colors:" + FILE));
      if (was && was.kinds) { style = inPoints(was); }   // sizes kept in points
    } catch (e) { /* nothing kept, or unreadable */ }
  }

