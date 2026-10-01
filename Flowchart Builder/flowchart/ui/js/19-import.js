// ---------------------------------------------------------------------------
//  19-import.js -- work brought in: a file, a folder, a zip, a drop, a paste
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // Files > Open a file takes one file or several; Open a folder takes a
  // whole folder, and a zip is opened as the folder inside it.  Any of those
  // can be dropped anywhere on the page too, and a picture pasted.
  //
  // Whatever comes is sorted by what it is -- code, pseudocode, a flowchart
  // made in another program, a picture of one, a design saved here -- and
  // opened on the tab it belongs on: code on Code, pseudocode on Pseudocode,
  // a flowchart on Flowchart.  A folder of one program's files opens as that
  // program; a folder of pseudocode whose one main program calls modules
  // kept in the other files opens as the one program they make.  A folder
  // holding several things to open -- a week of exercises, or a program and
  // a picture of its chart -- asks which, and is kept so the next one can be
  // opened from it too.
  var IN_MOST = 400;                     // files looked into from one folder
  var CODE_MOST = 80;                    // files of code read in as one program
  var inTurn = 0;                        // the opening going on; Stop moves it on
  var inBatch = null;                    // the last folder that asked which

  // ------------------------------------------------------ what came in --
  // Each file as { path, name, size, blob } -- or, out of a zip, with its
  // place in the zip instead of a blob.
  function fileEntry(f, path) {
    return { path: path || f.webkitRelativePath || f.name || "", name: f.name || "",
             size: f.size || 0, blob: f };
  }
  function entryBytes(e) {
    if (e.zip) { return unzipOne(e.zip); }
    return e.blob.arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  // As words, in whichever of the usual ways they were written down.
  function entryText(e) {
    return entryBytes(e).then(function (b) {
      if (b[0] === 0xff && b[1] === 0xfe) { return new TextDecoder("utf-16le").decode(b.subarray(2)); }
      if (b[0] === 0xfe && b[1] === 0xff) { return new TextDecoder("utf-16be").decode(b.subarray(2)); }
      return utf8Of(b).replace(/^\ufeff/, "");
    });
  }
  function entryBlob(e) {
    if (e.blob) { return Promise.resolve(e.blob); }
    return entryBytes(e).then(function (b) { return new Blob([b]); });
  }

  // Folders nobody means when they open a project: where tools keep what
  // they fetched or built, and hidden ones.
  var R_JUNK = /(^|\/)(\.[^\/]+|node_modules|__pycache__|__MACOSX|venv|env|site-packages|dist|build|target|bin|obj|out)(\/|$)/i;
  function junkPath(path) {
    return R_JUNK.test(String(path || "").replace(/\\/g, "/").replace(/[^\/]*$/, "")) ||
           /\.min\.js$/i.test(path || "");
  }

  // ------------------------------------------------------------ a zip --
  // Read here, like the one this page writes (19-files.js): the list at the
  // end of it says where each file starts.  A squeezed one is unsqueezed by
  // the browser (inflated, 19-diagrams.js).
  function unzipList(bytes) {
    var v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), n = bytes.length, end = -1;
    for (var i = n - 22; i >= Math.max(0, n - 22 - 65535); i--) {
      if (v.getUint32(i, true) === 0x06054b50) { end = i; break; }
    }
    if (end < 0) { return []; }
    var count = v.getUint16(end + 10, true), at = v.getUint32(end + 16, true), out = [];
    for (var k = 0; k < count && at + 46 <= n; k++) {
      if (v.getUint32(at, true) !== 0x02014b50) { break; }
      var flags = v.getUint16(at + 8, true), method = v.getUint16(at + 10, true);
      var packed = v.getUint32(at + 20, true), size = v.getUint32(at + 24, true);
      var nameLen = v.getUint16(at + 28, true), more = v.getUint16(at + 30, true);
      var note = v.getUint16(at + 32, true), local = v.getUint32(at + 42, true);
      var raw = bytes.subarray(at + 46, at + 46 + nameLen);
      var name = flags & 0x800 ? utf8Of(raw) : latin1Of(raw);
      at += 46 + nameLen + more + note;
      if (/\/$/.test(name) || flags & 1 || local + 30 > n || v.getUint32(local, true) !== 0x04034b50) { continue; }
      var start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
      out.push({ name: name, method: method, size: size, data: bytes.subarray(start, start + packed) });
    }
    return out;
  }
  function unzipOne(entry) {
    if (entry.method === 0) { return Promise.resolve(entry.data); }
    if (entry.method === 8) { return inflated(entry.data, "deflate-raw"); }
    return Promise.reject(new Error(TXT.in_old));
  }
  // A zip's files, as files that came in; its name is the folder they are in.
  function zipEntries(e) {
    return entryBytes(e).then(function (bytes) {
      var folder = e.name.replace(/\.zip$/i, "");
      return unzipList(bytes).map(function (z) {
        var name = z.name.replace(/^.*\//, "");
        return { path: folder + "/" + z.name, name: name, size: z.size, zip: z };
      });
    });
  }

  // ----------------------------------------------------- what each one is --
  var R_PICTURE = /\.(png|jpe?g|gif|webp|bmp|avif)$/i;
  var R_DRAWN_END = /\.(drawio|dio|excalidraw|graphml|gv|dot|puml|plantuml|pu|iuml|wsd|mmd|mermaid|svg|fprg)$/i;
  var R_WORDS_END = /\.(txt|text|pseudo|pseudocode|psc|pc|alg|algo|md|markdown|json|xml|csv)$/i;
  var R_PSEUDO_END = /\.(pseudo|pseudocode|psc|alg|algo)$/i;

  // Pseudocode, by the look of it: most of its lines begin the way a line of
  // pseudocode begins, or set something.  A README or a list of notes does not.
  var R_PSEUDO_LINE = /^(start|begin|end|stop|declare|constant|const|set|display|print|output|input|read|get|if|else|elseif|endif|then|while|endwhile|for|endfor|next|repeat|until|do|loop|call|module|function|endfunction|procedure|endprocedure|sub|subroutine|endsubroutine|return|select|case|endselect|switch|otherwise|open|close|write|wait)\b/i;
  var R_NOTE_LINE = /^(\/\/|#|'|rem\b|--|\/\*|\*)/i;
  function looksPseudo(text) {
    var lines = String(text).split(/\r?\n/).map(function (s) { return s.trim(); })
      .filter(function (s) { return s && !R_NOTE_LINE.test(s); });
    if (!lines.length) { return false; }
    var hits = lines.filter(function (s) {
      return R_PSEUDO_LINE.test(s) || /^[A-Za-z_][\w\[\]\.]*\s*(=|\u2190|<-|:=)\s*\S/.test(s);
    }).length;
    return lines.length === 1 ? hits === 1 : hits / lines.length >= 0.6;
  }

  // Whether a file of pseudocode is a program or only modules for one: a
  // line outside every module, or a module called main, is a program.
  var R_SUB_OPEN = /^((public|private)\s+)?(module|function|procedure|sub|subroutine|def|method)\b/i;
  var R_SUB_SHUT = /^(end\s*(module|function|procedure|sub|subroutine|def|method|main)|endfunction|endprocedure|endsubroutine|endmodule|endsub)\b/i;
  function pseudoShape(text) {
    var deep = 0, main = false, subs = 0;
    String(text).split(/\r?\n/).forEach(function (line) {
      var s = line.trim();
      if (!s || R_NOTE_LINE.test(s)) { return; }
      if (R_SUB_SHUT.test(s)) { deep = Math.max(0, deep - 1); return; }
      if (R_SUB_OPEN.test(s)) {
        if (/^(\w+\s+)*(module|procedure|sub|subroutine|function)\s+main\b/i.test(s)) { main = true; }
        deep++;
        subs++;
        return;
      }
      if (!deep) { main = true; }
    });
    return { main: main, subs: subs };
  }

  // -> Promise of { what, e, ... }: what is "code", "pseudo", "text" (words
  // that are not plainly pseudocode), "design", "drawing" (made in another
  // program; `kind` says which), "picture", "zip" or "skip".
  function sortEntry(e) {
    var low = e.name.toLowerCase();
    if (/\.zip$/.test(low)) { return Promise.resolve({ what: "zip", e: e }); }
    if (R_PICTURE.test(low)) { return Promise.resolve({ what: "picture", e: e }); }
    if (/\.vsdx$/.test(low)) { return Promise.resolve({ what: "drawing", kind: "visio", e: e }); }
    var lang = langOfFile(low);
    if (!lang && !R_DRAWN_END.test(low) && !R_WORDS_END.test(low)) {
      return Promise.resolve({ what: "skip", e: e });
    }
    if (e.size > 4e6) { return Promise.resolve({ what: "skip", e: e }); }
    return entryText(e).then(function (text) {
      if (lang) { return { what: "code", lang: lang, text: text, e: e }; }
      var data = null;
      if (/^\s*[\[{]/.test(text)) { try { data = JSON.parse(text); } catch (err) { data = null; } }
      if (data && data.what === "flowchart-builder") { return { what: "design", data: data, e: e }; }
      var kind = drawnIn(e.name, text);
      if (kind === "flowgorithm") {
        var written = fprgPseudo(text);
        return written ? { what: "pseudo", text: written, e: e, main: true, subs: 0, from: "Flowgorithm" }
                       : { what: "skip", e: e };
      }
      if (kind) { return { what: "drawing", kind: kind, text: text, e: e }; }
      if (data || /\.(xml|csv|json)$/.test(low)) { return { what: "skip", e: e, json: !!data }; }
      var shape = pseudoShape(text);
      return { what: looksPseudo(text) || R_PSEUDO_END.test(low) ? "pseudo" : "text", text: text, e: e,
               main: shape.main, subs: shape.subs };
    }, function () { return { what: "skip", e: e }; });
  }

  // What another program is called, for the tag beside its file.
  var DRAWN_FROM = { drawio: "draw.io", excalidraw: "Excalidraw", visio: "Visio", graphml: "yEd",
                     dot: "Graphviz", plantuml: "PlantUML", lucid: "Lucidchart", mermaid: "Mermaid",
                     markdown: "Mermaid", svg: "SVG" };

  // ------------------------------------------------ what there is to open --
  // The files, gathered into the things they are: each language's files one
  // program, pseudocode one program where it joins into one, and every
  // flowchart and picture a thing of its own.
  function unitsOf(items) {
    var code = {}, pseudo = [], texts = [], drawn = [];
    items.forEach(function (it) {
      if (it.what === "code") { (code[it.lang] = code[it.lang] || []).push(it); }
      else if (it.what === "pseudo") { pseudo.push(it); }
      else if (it.what === "text") { texts.push(it); }
      else if (/^(design|drawing|picture)$/.test(it.what)) { drawn.push({ kind: "one", item: it, part: "drawn" }); }
    });
    var units = [];
    Object.keys(code).sort().forEach(function (lang) {
      var list = code[lang].sort(byPath);
      units.push({ kind: "code", lang: lang, items: list, part: "code" });
    });
    // Words that are plainly nothing else may be programs told in plain
    // words, which the Pseudocode box reads too -- when there is nothing else.
    if (!pseudo.length && !drawn.length && !units.length) { pseudo = texts; }
    pseudo.sort(byPath);
    var joined = pseudoJoined(pseudo);
    if (joined) { units.push({ kind: "pseudo", items: pseudo, text: joined.text, name: joined.name, part: "pseudo" }); }
    else { pseudo.forEach(function (it) { units.push({ kind: "one", item: it, part: "pseudo" }); }); }
    return units.concat(drawn);
  }
  function byPath(a, b) {
    var da = a.e.path.split("/").length, db = b.e.path.split("/").length;
    return da - db || (a.e.path < b.e.path ? -1 : a.e.path > b.e.path ? 1 : 0);
  }

  // Several files of pseudocode that are one program: exactly one of them
  // is a program, and the rest only hold its modules.  The program comes
  // first, the modules after it, in the order of their names.
  function pseudoJoined(list) {
    if (list.length < 2) { return null; }
    var mains = list.filter(function (it) { return it.main; });
    if (mains.length !== 1 || list.some(function (it) { return !it.main && !it.subs; })) { return null; }
    var rest = list.filter(function (it) { return it !== mains[0]; });
    return { name: mains[0].e.name,
             text: [mains[0].text].concat(rest.map(function (it) { return it.text; }))
                     .map(function (t) { return String(t).replace(/\s+$/, ""); }).join("\n\n") + "\n" };
  }

  // ---------------------------------------------------------- opening --
  // Every way in ends here: told how it went, and on the right tab if it
  // went well -- the Files sheet is put away so the work is what is seen.
  function broughtDone(ok, said) {
    if (ok) { shutSheets(); }
    if (said) { fileSays(said, !ok); }
    againButton();
  }

  function openUnit(u) {
    if (u.kind === "code") {
      var list = u.items.slice(0, CODE_MOST);
      openCodeFiles(list.map(function (it) { return { name: it.e.name, path: it.e.path, text: it.text }; }));
      broughtDone(true, u.items.length > CODE_MOST ? say("in_many", { n: CODE_MOST })
                  : say("f_opened", { name: u.items.length > 1 ? say("in_files", { n: u.items.length })
                                                               : u.items[0].e.name }));
      return;
    }
    if (u.kind === "pseudo") {
      openWritten(u.name, u.text);
      broughtDone(true, say("f_opened", { name: say("in_files", { n: u.items.length }) }));
      return;
    }
    openItem(u.item);
  }

  function openItem(it) {
    var name = it.e.name;
    switch (it.what) {
      case "design":
        openProject(it.data);
        broughtDone(true, say("f_opened", { name: name }));
        return;
      case "code":
        openCodeFiles([{ name: name, text: it.text }]);
        broughtDone(true, say("f_opened", { name: name }));
        return;
      case "pseudo": case "text":
        if (!String(it.text || "").trim()) { broughtDone(false, TXT.f_empty); return; }
        openWritten(it.from ? name.replace(/\.[^.]+$/, ".txt") : name, it.text);
        broughtDone(true, say("f_opened", { name: name }));
        return;
      case "drawing":
        if (it.kind === "visio") {
          entryBytes(it.e).then(visioGraph).then(function (g) {
            var got = g && openGraph(g, name);
            broughtDone(!!got, got ? say("f_opened", { name: name }) : TXT.in_unread);
          }, function () { broughtDone(false, TXT.in_unread); });
          return;
        }
        openDrawn(name, it.text, it.kind, broughtDone);
        return;
      case "picture":
        entryBlob(it.e).then(function (blob) { openPicture(name, blob, broughtDone); });
        return;
    }
    broughtDone(false, TXT.in_cannot);
  }

  // One file, chosen: opened as it always was -- anything written in words
  // goes into the pseudocode, whatever it is called -- or as the drawing or
  // picture it is.
  function openOne(e) {
    sortEntry(e).then(function (it) {
      if (it.what === "zip") { return zipEntries(e).then(function (list) { broughtIn(list, e.name.replace(/\.zip$/i, "")); }); }
      if (it.what !== "skip") { openItem(it); return null; }
      if (it.json) { broughtDone(false, TXT.f_not_ours); return null; }
      // a name we do not know: words are words, anything else is not ours
      if (e.size > 2e6) { broughtDone(false, TXT.in_cannot); return null; }
      return entryBytes(e).then(function (b) {
        if (b.subarray(0, 4000).indexOf(0) >= 0) { broughtDone(false, TXT.in_cannot); return; }
        openFile(e.name, utf8Of(b).replace(/^\ufeff/, ""));
        broughtDone(true, "");
      });
    }).catch(function () { broughtDone(false, TXT.in_cannot); });
  }

  // Several files, or a folder: sorted, and opened -- or asked about.
  function broughtIn(list, folder) {
    var turn = ++inTurn;
    list = list.filter(function (e) { return !junkPath(e.path); });
    if (!list.length) { broughtDone(false, TXT.in_nothing); return; }
    if (list.length === 1 && !folder) { openOne(list[0]); return; }
    inBusy(TXT.in_looking);
    // zips inside, opened as the folders they are
    Promise.all(list.map(function (e) {
      return /\.zip$/i.test(e.name) && list.length < 50 ? zipEntries(e).catch(function () { return []; }) : [e];
    })).then(function (lists) {
      var every = [].concat.apply([], lists).filter(function (e) { return !junkPath(e.path); });
      var looked = every.slice(0, IN_MOST);
      return Promise.all(looked.map(sortEntry)).then(function (items) {
        if (turn !== inTurn) { return; }
        inDone();
        var units = unitsOf(items);
        var skipped = every.length - items.filter(function (it) {
          return it.what !== "skip" && it.what !== "zip" && (it.what !== "text" || units.some(function (u) {
            return u.item === it || (u.items && u.items.indexOf(it) >= 0);
          }));
        }).length;
        if (!units.length) { broughtDone(false, TXT.in_nothing); return; }
        if (units.length === 1) { inBatch = null; openUnit(units[0]); return; }
        inBatch = { name: folder || "", units: units, skipped: skipped };
        showBrought(inBatch);
      });
    }).catch(function () { inDone(); broughtDone(false, TXT.in_nothing); });
  }

  // ------------------------------------------------------ which of them --
  function pickButton(words, where, tag, go, primary) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "in-pick" + (primary ? " all" : "");
    var name = document.createElement("span");
    name.className = "in-name";
    name.textContent = words;
    b.appendChild(name);
    if (where) {
      var at = document.createElement("span");
      at.className = "in-where";
      at.textContent = where;
      b.appendChild(at);
    }
    if (tag) {
      var t = document.createElement("span");
      t.className = "in-tag";
      t.textContent = tag;
      b.appendChild(t);
    }
    b.onclick = function () { showBroughtSheet(false); go(); };
    return b;
  }
  function folderOf(it) {
    var parts = it.e.path.split("/");
    return parts.slice(1, -1).join("/");
  }

  function showBrought(batch) {
    var body = el("#in-body");
    if (!body) { return; }
    body.innerHTML = "";
    var called = String(batch.name || "").trim();
    el("#in-head").textContent = called ? say("in_from", { name: called }) : TXT.in_head;
    function part(title) {
      var sec = document.createElement("section");
      sec.className = "more-part";
      var h = document.createElement("h3");
      h.textContent = title;
      sec.appendChild(h);
      var list = document.createElement("div");
      list.className = "in-list";
      sec.appendChild(list);
      body.appendChild(sec);
      return list;
    }
    var parts = {};
    function listFor(key, title) { return parts[key] || (parts[key] = part(title)); }
    batch.units.forEach(function (u) {
      if (u.kind === "code") {
        var list = listFor("code-" + u.lang, TXT.mode_lang + " \u00b7 " + langName(u.lang));
        if (u.items.length > 1) {
          list.appendChild(pickButton(say("in_all", { n: u.items.length }), "", "", function () { openUnit(u); }, true));
        }
        u.items.forEach(function (it) {
          list.appendChild(pickButton(it.e.name, folderOf(it), "", function () { openItem(it); }));
        });
        return;
      }
      if (u.kind === "pseudo") {
        var plist = listFor("pseudo", TXT.mode_code);
        plist.appendChild(pickButton(say("in_all", { n: u.items.length }), "", "", function () { openUnit(u); }, true));
        u.items.forEach(function (it) {
          plist.appendChild(pickButton(it.e.name, folderOf(it), it.from || "", function () { openItem(it); }));
        });
        return;
      }
      var it = u.item;
      var home = u.part === "pseudo" ? listFor("pseudo", TXT.mode_code) : listFor("drawn", TXT.mode_hand);
      var tag = it.what === "picture" ? TXT.in_picture : it.what === "design" ? TXT.in_design
              : it.from || DRAWN_FROM[it.kind] || "";
      home.appendChild(pickButton(it.e.name, folderOf(it), tag, function () { openItem(it); }));
    });
    if (batch.skipped > 0) {
      var note = document.createElement("p");
      note.className = "hint";
      note.textContent = batch.skipped === 1 ? TXT.in_skipped_one : say("in_skipped", { n: batch.skipped });
      body.appendChild(note);
    }
    showBroughtSheet(true);
  }

  function showBroughtSheet(open) {
    var over = el("#in-over");
    if (!over) { return; }
    over.hidden = !open;
    if (open) {
      var first = el("#in-body .in-pick");
      if (first) { first.focus(); }
    }
    againButton();
  }

  // Once a folder has asked which, another from it is a press away.
  function againButton() {
    var b = el("#in-again");
    if (!b) { return; }
    b.hidden = !inBatch;
    if (inBatch) {
      var called = String(inBatch.name || "").trim();
      b.textContent = called ? say("in_again", { name: called }) : TXT.in_again_plain;
    }
  }

  if (el("#in-over")) {
    el("#in-cancel").onclick = function () { showBroughtSheet(false); };
    el("#in-over").onclick = function (ev) {
      if (ev.target === el("#in-over")) { showBroughtSheet(false); }
    };
    window.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !el("#in-over").hidden) { ev.preventDefault(); showBroughtSheet(false); }
    });
  }
  if (el("#in-again")) {
    el("#in-again").onclick = function () { if (inBatch) { showBrought(inBatch); } };
  }

  // ------------------------------------------------- saying it is busy --
  // A picture takes a few seconds to read, and a big folder a moment to go
  // through: said at the foot of the page, with a way to stop.
  function inBusy(what) {
    var box = el("#in-busy");
    if (!box) { return; }
    el("#in-busy-said").textContent = what;
    box.hidden = false;
  }
  function inDone() {
    var box = el("#in-busy");
    if (box) { box.hidden = true; }
  }
  if (el("#in-busy-stop")) {
    el("#in-busy-stop").onclick = function () { inTurn++; inDone(); };
  }

  // ---------------------------------------------------- the buttons --
  if (el("#open-folder")) {
    el("#open-folder").onclick = function () { el("#folder-in").click(); };
    el("#folder-in").onchange = function () {
      var picked = [].slice.call(el("#folder-in").files || []);
      el("#folder-in").value = "";
      if (!picked.length) { return; }
      var top = String(picked[0].webkitRelativePath || "").split("/")[0];
      broughtIn(picked.map(function (f) { return fileEntry(f); }), top || " ");
    };
  }

  // ------------------------------------------------------ dropped on it --
  // Files from outside -- never a shape being dragged about on the page,
  // which carries no files -- light the whole page up to be dropped on.
  function dragsFiles(ev) {
    var types = ev.dataTransfer && ev.dataTransfer.types;
    return !!types && Array.prototype.indexOf.call(types, "Files") >= 0;
  }
  var dragDeep = 0;
  function dropShown(on) {
    var over = el("#drop-over");
    if (over) { over.hidden = !on; }
  }
  window.addEventListener("dragenter", function (ev) {
    if (!dragsFiles(ev)) { return; }
    ev.preventDefault();
    dragDeep++;
    dropShown(true);
  }, true);
  window.addEventListener("dragover", function (ev) {
    if (!dragsFiles(ev)) { return; }
    ev.preventDefault();
    ev.stopPropagation();
    ev.dataTransfer.dropEffect = "copy";
  }, true);
  window.addEventListener("dragleave", function (ev) {
    if (!dragsFiles(ev)) { return; }
    dragDeep = Math.max(0, dragDeep - 1);
    if (!dragDeep || !ev.relatedTarget) { dragDeep = 0; dropShown(false); }
  }, true);
  window.addEventListener("drop", function (ev) {
    if (!dragsFiles(ev)) { return; }
    ev.preventDefault();
    ev.stopPropagation();
    dragDeep = 0;
    dropShown(false);
    dropped(ev.dataTransfer).then(function (got) {
      if (got.list.length) { broughtIn(got.list, got.folder); }
    });
  }, true);

  // What was dropped, folders walked into.  The walking has to be asked for
  // while the drop is still happening, so each entry is taken first.
  function dropped(dt) {
    var items = [].slice.call(dt.items || []);
    var entries = items.map(function (it) {
      return it.kind === "file" && it.webkitGetAsEntry ? it.webkitGetAsEntry() : null;
    }).filter(Boolean);
    if (!entries.length) {
      return Promise.resolve({ list: [].slice.call(dt.files || []).map(function (f) { return fileEntry(f, f.name); }),
                               folder: "" });
    }
    var out = [], folder = entries.length === 1 && entries[0].isDirectory ? entries[0].name : "";
    function walk(entry, path) {
      if (out.length >= 3000) { return Promise.resolve(); }
      if (entry.isFile) {
        return new Promise(function (ok) {
          entry.file(function (f) { out.push(fileEntry(f, path + f.name)); ok(); }, function () { ok(); });
        });
      }
      if (!entry.isDirectory || junkPath(path + entry.name + "/x")) { return Promise.resolve(); }
      var reader = entry.createReader(), kids = [];
      return new Promise(function (ok) {
        (function more() {
          reader.readEntries(function (got) {
            if (!got.length) { ok(kids); return; }
            kids = kids.concat([].slice.call(got));
            more();
          }, function () { ok(kids); });
        })();
      }).then(function (list) {
        return Promise.all(list.map(function (k) { return walk(k, path + entry.name + "/"); }));
      });
    }
    return Promise.all(entries.map(function (e) { return walk(e, ""); }))
      .then(function () { return { list: out, folder: folder || (entries.length > 1 ? " " : "") }; });
  }

  // ------------------------------------------------------------ pasted --
  // A picture on the clipboard -- a screenshot of a flowchart -- pasted
  // anywhere on the page is opened.  Words pasted into a box stay words.
  // A paste is easily made by the way (Copy the chart, and a Ctrl+V later
  // meant for something else), so where there is work on the page it asks
  // before putting the picture in its place.
  function workHere() {
    return (hand && hand.nodes && hand.nodes.length) ||
           (el("#code") && el("#code").value.trim()) || langHasCode();
  }
  document.addEventListener("paste", function (ev) {
    var cd = ev.clipboardData;
    var files = cd ? [].slice.call(cd.files || []) : [];
    if (!files.length) { return; }
    var t = ev.target, typing = t && (t.isContentEditable || /^(input|textarea)$/i.test(t.nodeName || ""));
    var words = cd.getData && cd.getData("text/plain");
    if (typing && words && words.trim()) { return; }
    ev.preventDefault();
    var list = files.map(function (f, k) {
      var name = f.name || ("picture" + (k ? " " + (k + 1) : "") + ".png");
      return fileEntry(f, name);
    });
    function go() { broughtIn(list, files.length > 1 ? " " : ""); }
    if (workHere()) { areYouSure(TXT.in_paste_head, TXT.in_paste_said, TXT.in_paste_yes, go); }
    else { go(); }
  });
