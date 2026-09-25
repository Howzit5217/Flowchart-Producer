// ---------------------------------------------------------------------------
//  19-files.js -- saving the whole thing to a file, and opening it again
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------- keeping a copy --
  // Everything that makes this chart what it is, in one small thing: the
  // pseudocode or the shapes you placed, the colors, and which shape draws
  // which kind of step.  Open it again here and you are back where you were.
  //
  // One object, two ways out of here.  A file writes it spread over lines
  // to be read; a link writes it squeezed flat.  It is the same work
  // either way, so there is one description of what the work is and both
  // go through it -- and one reader, openProject, that takes back
  // whichever of them arrives.
  function projectData() {
    return {
      what: "flowchart-builder", version: 1,
      mode: byHand ? "hand" : "code",
      hand: hand,
      source: el("#code") ? {
        code: el("#code").value, title: el("#f-title").value,
        author: el("#f-author").value, shape: el("#f-shape").value,
        legend: el("#f-legend").checked, grid: el("#f-grid").checked,
        options: chartOptions()
      } : null,
      style: style, geom: geom,
      moves: movesNow()                  // blocks moved on the built chart (30-blocks.js)
    };
  }

  function projectJson() {
    return JSON.stringify(projectData(), null, 1);
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
    showStarts();                        // there is pseudocode now: fold the offer away
    // Called what the file is called, made into a title (tuition_increase
    // is Tuition Increase) -- unless the program heads itself with a name,
    // or the file is called nothing much (New Text Document, hw3): then
    // what it says it is, or what it does, is the better name (fileTitle,
    // 09-names.js).
    var called = fileTitle(name, el("#code").value);
    if (called) { titleComesFrom({ text: called }); } else { newProgram(); }
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
      style = inPoints(was.style);     // sizes saved as shares, read as points
      style.kinds = style.kinds || {};
      style.nodes = style.nodes || {};
      lightPreset();                   // its palette, if it is one, lit
    }
    if (was.geom) { geom = was.geom; drawRoles(); }
    if (was.source && el("#code")) {
      el("#code").value = was.source.code || "";
      showStarts();
      el("#f-title").value = was.source.title || "";
      titleKept();
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
    many = [];                           // numbers that mean other shapes now
    // What was open before this file is not behind it: stepping back into
    // another piece of work's colors and shapes would be a stranger thing
    // to be handed than having nothing to step back to.
    forgetUndo();
    setMode(was.mode === "hand");
    // Same again: the chart in the file is not the one that was on the
    // paper, so it is drawn -- from the seed its moved blocks were moved
    // on, where it has any, so they go back on it (30-blocks.js).
    pendingMoves = was.moves || null;
    if (was.mode !== "hand" && el("#code").value.trim()) {
      el("#build").click();
    }
    buildGlobals();
    paint();
  }

  // ------------------------------------------- several files, in one file --
  // A program written out as a file for each chart is a folder of small
  // files, and a browser will not hand a folder over.  It will hand over
  // one file, so they go into a zip -- written here rather than fetched
  // from anywhere, because a page that loads nothing from anywhere goes on
  // working when the network does not, which is the whole of what this
  // page is.
  //
  // Nothing in it is squeezed.  The format calls that "stored", every
  // unzipper on every machine has understood it since 1989, and a program
  // is a few kilobytes of text that squeezing would save nothing worth
  // having on.
  var CRC = null;
  function crcOf(bytes) {
    if (!CRC) {
      CRC = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) {
          c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        CRC[n] = c >>> 0;
      }
    }
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      crc = CRC[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  // The day and the time, in the two sixteen-bit words a zip keeps them in.
  // Seconds go in two at a time, and the year counts from 1980, because
  // that is how much room there was for them.
  function zipWhen() {
    var now = new Date();
    return {
      time: (now.getHours() << 11) | (now.getMinutes() << 5) |
            (now.getSeconds() >> 1),
      date: ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) |
            now.getDate()
    };
  }

  // [{ name, text }] -> a Blob that unzips to those files.
  function zipOf(files) {
    var encode = new TextEncoder(), when = zipWhen();
    var pieces = [], listed = [], at = 0;
    function block(size) {
      var bytes = new Uint8Array(size);
      var view = new DataView(bytes.buffer);
      return { bytes: bytes, view: view };
    }
    files.forEach(function (one) {
      var name = encode.encode(one.name);
      var data = encode.encode(one.text);
      var crc = crcOf(data);
      var head = block(30);
      head.view.setUint32(0, 0x04034b50, true);
      head.view.setUint16(4, 20, true);        // what it takes to read this
      head.view.setUint16(6, 0x0800, true);    // the names are in UTF-8
      head.view.setUint16(8, 0, true);         // stored, not squeezed
      head.view.setUint16(10, when.time, true);
      head.view.setUint16(12, when.date, true);
      head.view.setUint32(14, crc, true);
      head.view.setUint32(18, data.length, true);
      head.view.setUint32(22, data.length, true);
      head.view.setUint16(26, name.length, true);
      listed.push({ name: name, crc: crc, size: data.length, at: at });
      pieces.push(head.bytes, name, data);
      at += 30 + name.length + data.length;
    });
    // And then the list of them at the end, which is what an unzipper
    // reads first: it says the same things over again, and where each
    // file began.
    var start = at;
    listed.forEach(function (one) {
      var row = block(46);
      row.view.setUint32(0, 0x02014b50, true);
      row.view.setUint16(4, 20, true);
      row.view.setUint16(6, 20, true);
      row.view.setUint16(8, 0x0800, true);
      row.view.setUint16(10, 0, true);
      row.view.setUint16(12, when.time, true);
      row.view.setUint16(14, when.date, true);
      row.view.setUint32(16, one.crc, true);
      row.view.setUint32(20, one.size, true);
      row.view.setUint32(24, one.size, true);
      row.view.setUint16(28, one.name.length, true);
      row.view.setUint32(42, one.at, true);
      pieces.push(row.bytes, one.name);
      at += 46 + one.name.length;
    });
    var end = block(22);
    end.view.setUint32(0, 0x06054b50, true);
    end.view.setUint16(8, listed.length, true);
    end.view.setUint16(10, listed.length, true);
    end.view.setUint32(12, at - start, true);
    end.view.setUint32(16, start, true);
    pieces.push(end.bytes);
    return new Blob(pieces, { type: "application/zip" });
  }

  // ------------------------------------------------------- the work, in a link --
  // There is no server behind this page -- it is a folder of files that
  // runs entirely in whoever's browser is looking at it -- so a link
  // cannot point at a copy kept somewhere.  It carries the work itself,
  // after the # where a browser keeps what it never sends anywhere.  Open
  // the link and the same chart is there: the program, the title, the
  // colors, the shapes.  Which is what a class wants and a file is a
  // clumsy way to do: here is the program, have a look.
  //
  // What a URL is allowed to carry is a narrow set of letters, and what is
  // being carried is text in whatever language the program was written in.
  // So it goes as bytes, and the bytes as base64 -- in the spelling of it
  // that uses - and _ , because + and / mean something else in a URL.
  function intoLink(text) {
    var bytes = new TextEncoder().encode(text);
    var raw = "";
    // In armfuls: apply() takes its arguments on the stack, and a program
    // of any size handed over in one go is more arguments than there is
    // stack to put them on.
    for (var at = 0; at < bytes.length; at += 0x8000) {
      raw += String.fromCharCode.apply(null, bytes.subarray(at, at + 0x8000));
    }
    return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function outOfLink(packed) {
    var raw = atob(String(packed).replace(/-/g, "+").replace(/_/g, "/"));
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) { bytes[i] = raw.charCodeAt(i); }
    return new TextDecoder().decode(bytes);
  }

  function shareLink() {
    return location.href.split("#")[0] +
           "#p=" + intoLink(JSON.stringify(projectData()));
  }

  // Said under the button, the way the note about a file is.  A link that
  // has come out very long is worth a word: nothing here will refuse it,
  // but chat apps and mail clients cut long ones short, and a link cut
  // short is a link that opens nothing.
  function linkSays(what, bad) {
    var note = el("#link-note");
    if (!note) { return; }
    note.className = bad ? "hint bad" : "hint";
    note.textContent = what || "";
  }

  if (el("#link-copy")) {
    var linkButton = el("#link-copy");
    linkButton.onclick = function () {
      var link;
      try { link = shareLink(); }
      catch (e) { linkSays(TXT.l_bad, true); return; }
      function well() {
        linkButton.textContent = TXT.l_copied;
        var over = link.length > 8000;
        linkSays(over ? say("l_long", { n: link.length }) : "", over);
        setTimeout(function () { linkButton.textContent = TXT.l_copy; }, 1400);
      }
      function badly() {
        linkSays(TXT.l_copy_no, true);
        setTimeout(function () { linkButton.textContent = TXT.l_copy; }, 2200);
      }
      // The same two ways round as everywhere else on this page: the new
      // one where the browser has it, and the old one -- which is all
      // there is on a page served over plain http, and serving this to the
      // tablet in the next room is exactly that.
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(well, function () {
          if (oldCopy(link)) { well(); } else { badly(); }
        });
        return;
      }
      if (oldCopy(link)) { well(); } else { badly(); }
    };
  }

  // A link, opened.  It goes through openProject, which is the same reader
  // a saved file goes through, so there is one answer to what opening
  // somebody's work does.
  //
  // The link is then taken out of the address bar.  Left there, every
  // reload would put the sender's program back and quietly throw away an
  // afternoon of whatever was done to it -- so the link hands the work
  // over once, and after that the page is yours.
  function openLink() {
    var got = /^#p=([A-Za-z0-9\-_]+)$/.exec(String(location.hash || ""));
    if (!got) { return false; }
    var was = null;
    try { was = JSON.parse(outOfLink(got[1])); } catch (e) { was = null; }
    try {
      history.replaceState(null, "", location.pathname + location.search);
    } catch (e) { /* older browser: the # stays, and does no harm */ }
    if (!was || was.what !== "flowchart-builder") {
      linkSays(TXT.l_bad, true);
      return false;
    }
    opening = true;                      // opened, not asked for
    openProject(was);
    fileSays(TXT.l_opened);
    return true;
  }

  // And one pasted into the address bar of a page that is already open,
  // which is a thing people do and which would otherwise sit there doing
  // nothing at all.
  window.addEventListener("hashchange", function () {
    if (/^#p=/.test(String(location.hash || ""))) { openLink(); }
  });

