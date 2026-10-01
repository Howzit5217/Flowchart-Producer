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
  //
  // A folder can be a whole project: hundreds of thousands of files.  Each
  // is sorted by its name alone, with nothing read, and only what has to be
  // is read -- the words that might be pseudocode or a drawing, a few
  // hundred at most, and of the code, the program itself: the file it starts
  // in and the files that one uses, followed from one to the next, up to
  // CODE_MOST.  Everything else is kept, unread, in the Code tab's list of
  // files, to be found there and brought in (32-code-side.js).  Reading is
  // a few files at a time, said at the foot of the page, and Stop stops it.
  var IN_MOST = 400;                     // files looked into for what they are
  var CODE_MOST = 80;                    // files of code read in as one program
  var CODE_BYTES = 6e6;                  // and their words, at most
  var WALK_MOST = 1000000;               // files a dropped folder is walked for
  var LIST_MOST = 20;                    // files listed under each heading of "which"
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
  // program; `kind` says which), "picture", "zip" or "skip".  Code is not
  // read here: its name says what it is, and its words are read when it is
  // opened (`text` is null until then).
  function sortEntry(e) {
    var known = sortByName(e);
    if (known) { return Promise.resolve(known); }
    var low = e.name.toLowerCase();
    return entryText(e).then(function (text) {
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

  // What a file is by its name alone, where that is enough -- which is all
  // but words that might be pseudocode or a drawing.  Null: read it to see.
  function sortByName(e) {
    var low = e.name.toLowerCase();
    if (/\.zip$/.test(low)) { return { what: "zip", e: e }; }
    if (R_PICTURE.test(low)) { return { what: "picture", e: e }; }
    if (/\.vsdx$/.test(low)) { return { what: "drawing", kind: "visio", e: e }; }
    var lang = langOfFile(low);
    if (!lang && !R_DRAWN_END.test(low) && !R_WORDS_END.test(low)) { return { what: "skip", e: e }; }
    if (e.size > 4e6) { return { what: "skip", e: e }; }
    if (lang) { return { what: "code", lang: lang, text: null, e: e }; }
    return null;
  }

  // `fn` over a list a few at a time, rather than all at once -- a hundred
  // thousand files read at once is a hundred thousand reads waiting on the
  // disk together -- with `step(done, all)` told as each one finishes.
  // -> Promise of the answers, in the list's order (null where one failed).
  function eachFew(list, many, fn, step) {
    var out = new Array(list.length), next = 0, done = 0;
    return new Promise(function (ok) {
      if (!list.length) { ok(out); return; }
      function one() {
        if (next >= list.length) { return; }
        var i = next++;
        Promise.resolve().then(function () { return fn(list[i], i); })
          .then(function (v) { out[i] = v; }, function () { out[i] = null; })
          .then(function () {
            done++;
            if (step) { step(done, list.length); }
            if (done === list.length) { ok(out); } else { one(); }
          });
      }
      for (var k = 0; k < Math.min(many, list.length); k++) { one(); }
    });
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
    var da = depthOf(a.e), db = depthOf(b.e);
    return da - db || (a.e.path < b.e.path ? -1 : a.e.path > b.e.path ? 1 : 0);
  }
  // How far down the folder a file is, worked out once rather than at
  // every comparison of a sort through a hundred thousand of them.
  function depthOf(e) {
    if (e.depth === undefined) { e.depth = String(e.path || "").split("/").length; }
    return e.depth;
  }
  function stemOf(name) { return String(name || "").replace(/\.[^.\/]+$/, ""); }
  function dirOf(path) { return String(path || "").replace(/[^\/]*$/, ""); }

  // ------------------------------------------------- what matters most --
  // Of a folder of code, the files the program is: the one it starts in,
  // then what that one uses -- a file named in it, as Python imports a
  // module, Java names a class, C includes a header or JavaScript a path --
  // and what those use, and so on, nearest first.  A Go program's package
  // is its folder, so the files beside its main come too.  Test, example
  // and vendored folders are where a program is least likely to start.
  var R_MAIN_FILE = /^(main|app|application|index|program|__main__|run|start|cli|server|game|demo)$/i;
  var R_SIDE_PATH = /(^|\/)(tests?|specs?|__tests__|__mocks__|examples?|samples?|docs?|vendor|third[_-]?party|external|benchmarks?|fixtures?|migrations?|generated)(\/|$)/i;
  var R_TEST_FILE = /(^test_|_test$|\.test$|\.spec$|Tests?$|Spec$)/;
  var R_HAS_MAIN = /\bdef\s+main\s*\(|__name__\s*==\s*["']__main__["']|\bstatic\s+(?:async\s+)?(?:void|int|Task(?:<int>)?)\s+Main\s*\(|\bpublic\s+static\s+void\s+main\s*\(|\bint\s+main\s*\(|\bfunc\s+main\s*\(\s*\)|\bfn\s+main\s*\(\s*\)|\bfun\s+main\s*\(|@main\b/;

  // How much a file's name and place say it matters, before it is read.
  function nameWeight(it) {
    var stem = stemOf(it.e.name), w = 0;
    if (R_MAIN_FILE.test(stem)) { w += 40; }
    if (R_SIDE_PATH.test(dirOf(it.e.path))) { w -= 30; }
    if (R_TEST_FILE.test(stem)) { w -= 30; }
    if (it.e.size > 3e5) { w -= 10; }
    return w - 4 * depthOf(it.e);
  }

  function readTexts(items, turn, step) {
    var want = items.filter(function (it) { return it.text === null || it.text === undefined; });
    return eachFew(want, 12, function (it) {
      if (turn !== inTurn) { return null; }
      return entryText(it.e).then(function (text) { it.text = text; }, function () { it.text = ""; });
    }, step);
  }

  // The files a file uses, of those there are: each word in it that is
  // another file's name, the nearest of that name -- the same folder
  // first, then the one sharing most of its path.
  function usesOf(it, stems, items) {
    var words = {}, found = [];
    var own = stemOf(it.e.name).toLowerCase(), dir = dirOf(it.e.path);
    (String(it.text || "").match(/[A-Za-z_][A-Za-z0-9_]*/g) || []).forEach(function (w) {
      words[w.toLowerCase()] = true;
    });
    function shared(other) {
      var a = dirOf(other.e.path), n = 0;
      while (n < a.length && n < dir.length && a.charAt(n) === dir.charAt(n)) { n++; }
      return n;
    }
    Object.keys(words).forEach(function (w) {
      if (w === own || w.length < 2) { return; }
      var list = stems[w];
      if (!list) { return; }
      var near = list.length === 1 ? list : list.slice().sort(function (a, b) {
        return shared(b) - shared(a) || depthOf(a.e) - depthOf(b.e);
      }).slice(0, 3);
      found.push.apply(found, near);
    });
    if (it.lang === "go") {
      items.forEach(function (o) { if (o !== it && dirOf(o.e.path) === dir) { found.push(o); } });
    }
    return found;
  }

  // -> Promise of { read: the program, nearest the start first, each with
  // its words; rest: everything else, likeliest first, unread } -- or null
  // where Stop was pressed.  A folder small enough to read whole is read
  // whole, in the same order of what matters.
  function chooseProgram(items, turn) {
    var all = items.length <= CODE_MOST;
    var weighed = items.map(function (it, i) { return { it: it, w: nameWeight(it), i: i }; })
      .sort(function (a, b) { return b.w - a.w || a.i - b.i; });
    var stems = {};
    items.forEach(function (it) {
      var key = stemOf(it.e.name).toLowerCase();
      (stems[key] = stems[key] || []).push(it);
    });
    var told = 0;
    function reading(n) {
      told = Math.max(told, n);
      inBusy(say("in_reading", { n: bigNum(told), of: bigNum(Math.min(items.length, CODE_MOST)) }));
    }
    var first = all ? items : weighed.slice(0, 40).map(function (x) { return x.it; });
    return readTexts(first, turn, function (n) { if (all) { reading(n); } }).then(function () {
      if (turn !== inTurn) { return null; }
      var start = weighed.map(function (x) { return x.it; }).filter(function (it) {
        return it.text !== null && it.text !== undefined && R_HAS_MAIN.test(it.text);
      })[0] || weighed[0].it;
      var picked = [], seen = new Set([start]), queue = [start], bytes = 0;
      function step() {
        if (turn !== inTurn) { return Promise.resolve(); }
        if (!queue.length || picked.length >= CODE_MOST || bytes > CODE_BYTES) { return Promise.resolve(); }
        var batch = queue.splice(0, 12);
        return readTexts(batch, turn).then(function () {
          batch.forEach(function (it) {
            if (picked.length >= CODE_MOST || bytes > CODE_BYTES) { return; }
            picked.push(it);
            bytes += String(it.text || "").length;
            if (!all) { reading(picked.length); }
            usesOf(it, stems, items).forEach(function (other) {
              if (!seen.has(other)) { seen.add(other); queue.push(other); }
            });
          });
          return step();
        });
      }
      return step().then(function () {
        if (turn !== inTurn) { return null; }
        // read whole: what the start never reaches is still the program's
        if (all) {
          weighed.forEach(function (x) { if (!seen.has(x.it)) { seen.add(x.it); picked.push(x.it); } });
        }
        picked.forEach(function (it, k) { it.rank = k; });
        var inIt = new Set(picked);
        return { read: picked, rest: weighed.map(function (x) { return x.it; })
                                            .filter(function (it) { return !inIt.has(it); }) };
      });
    });
  }

  // 1234567 as 1,234,567, the way the page's language writes it.
  function bigNum(n) {
    try { return Number(n).toLocaleString(LANG); } catch (e) { return String(n); }
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
      var turn = ++inTurn;
      inBusy(TXT.in_looking);
      chooseProgram(u.items, turn).then(function (pick) {
        if (!pick || turn !== inTurn) { return; }
        inDone();
        // in the folder's own order, which is the order the reader is used
        // to; how much each matters goes with it, for the tabs
        var read = pick.read.slice().sort(byPath);
        openCodeFiles(read.map(function (it) {
          return { name: it.e.name, path: it.e.path, text: it.text, rank: it.rank };
        }), pick.rest.map(function (it) {
          return { name: it.e.name, path: it.e.path, entry: it.e, lang: it.lang };
        }));
        broughtDone(true, pick.rest.length
          ? say("in_most", { n: bigNum(read.length), all: bigNum(u.items.length) })
          : say("f_opened", { name: u.items.length > 1 ? say("in_files", { n: bigNum(u.items.length) })
                                                       : u.items[0].e.name }));
      }, function () { inDone(); broughtDone(false, TXT.in_cannot); });
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
        entryText(it.e).then(function (text) {
          openCodeFiles([{ name: name, path: it.e.path, text: text }]);
          broughtDone(true, say("f_opened", { name: name }));
        }, function () { broughtDone(false, TXT.in_cannot); });
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
    inBusy(list.length > 1000 ? say("in_sorting", { n: bigNum(list.length) }) : TXT.in_looking);
    // zips inside, opened as the folders they are -- in a folder of a few
    (list.length < 50 ? Promise.all(list.map(function (e) {
      return /\.zip$/i.test(e.name) ? zipEntries(e).catch(function () { return []; }) : [e];
    })) : Promise.resolve([list])).then(function (lists) {
      var every = [].concat.apply([], lists).filter(function (e) { return !junkPath(e.path); });
      // what each is, by its name; and of the rest, the first few hundred
      // read to see whether they are pseudocode or a drawing
      var named = every.map(sortByName), unknown = [];
      named.forEach(function (it, i) { if (!it) { unknown.push(i); } });
      var looked = unknown.slice(0, IN_MOST);
      return eachFew(looked, 12, function (i) { return sortEntry(every[i]); }).then(function (got) {
        if (turn !== inTurn) { return; }
        looked.forEach(function (i, k) { named[i] = got[k] || { what: "skip", e: every[i] }; });
        var items = named.filter(Boolean);
        inDone();
        var units = unitsOf(items);
        var used = new Set();
        units.forEach(function (u) {
          if (u.item) { used.add(u.item); }
          (u.items || []).forEach(function (it) { used.add(it); });
        });
        var skipped = every.length - items.filter(function (it) {
          return it.what !== "skip" && it.what !== "zip" && (it.what !== "text" || used.has(it));
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
    // A few of each, and how many more: a folder of ten thousand pictures
    // is not ten thousand buttons.  Every file of code is still a press
    // away -- the program opens with all of them in its list of files.
    var parts = {}, counts = {};
    function listFor(key, title) { return parts[key] || (parts[key] = part(title)); }
    function room(key, list) {
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] <= LIST_MOST) { return true; }
      if (counts[key] === LIST_MOST + 1) {
        var more = document.createElement("p");
        more.className = "hint in-more";
        list.appendChild(more);
        list.moreNote = more;
      }
      list.moreNote.textContent = say("in_more_items", { n: bigNum(counts[key] - LIST_MOST) });
      return false;
    }
    batch.units.forEach(function (u) {
      if (u.kind === "code") {
        var key = "code-" + u.lang;
        var list = listFor(key, TXT.mode_lang + " \u00b7 " + langName(u.lang));
        if (u.items.length > 1) {
          list.appendChild(pickButton(say("in_all", { n: bigNum(u.items.length) }), "", "", function () { openUnit(u); }, true));
        }
        u.items.slice(0, LIST_MOST + 1).forEach(function (it) {
          if (room(key, list)) { list.appendChild(pickButton(it.e.name, folderOf(it), "", function () { openItem(it); })); }
        });
        if (u.items.length > LIST_MOST + 1) {
          list.moreNote.textContent = say("in_more_items", { n: bigNum(u.items.length - LIST_MOST) });
        }
        return;
      }
      if (u.kind === "pseudo") {
        var plist = listFor("pseudo", TXT.mode_code);
        plist.appendChild(pickButton(say("in_all", { n: bigNum(u.items.length) }), "", "", function () { openUnit(u); }, true));
        u.items.forEach(function (it) {
          if (room("pseudo", plist)) { plist.appendChild(pickButton(it.e.name, folderOf(it), it.from || "", function () { openItem(it); })); }
        });
        return;
      }
      var it = u.item;
      var where = u.part === "pseudo" ? "pseudo" : "drawn";
      var home = where === "pseudo" ? listFor("pseudo", TXT.mode_code) : listFor("drawn", TXT.mode_hand);
      if (!room(where, home)) { return; }
      var tag = it.what === "picture" ? TXT.in_picture : it.what === "design" ? TXT.in_design
              : it.from || DRAWN_FROM[it.kind] || "";
      home.appendChild(pickButton(it.e.name, folderOf(it), tag, function () { openItem(it); }));
    });
    if (batch.skipped > 0) {
      var note = document.createElement("p");
      note.className = "hint";
      note.textContent = batch.skipped === 1 ? TXT.in_skipped_one : say("in_skipped", { n: bigNum(batch.skipped) });
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
      if (got.list.length) { broughtIn(got.list, got.folder); } else { inDone(); }
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
    // Walked a folder at a time, a few at once, rather than every folder of
    // a big project opened together; and how many files it has found so
    // far said as it goes, with Stop to stop it.
    var out = [], folder = entries.length === 1 && entries[0].isDirectory ? entries[0].name : "";
    var turn = ++inTurn, said = 0;
    function found() {
      if (out.length - said >= 500) {
        said = out.length;
        inBusy(say("in_found", { n: bigNum(out.length) }));
      }
    }
    function walk(entry, path) {
      if (out.length >= WALK_MOST || turn !== inTurn) { return Promise.resolve([]); }
      if (entry.isFile) {
        return new Promise(function (ok) {
          entry.file(function (f) { out.push(fileEntry(f, path + f.name)); found(); ok([]); }, function () { ok([]); });
        });
      }
      if (!entry.isDirectory || junkPath(path + entry.name + "/x")) { return Promise.resolve([]); }
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
        var inner = path + entry.name + "/";
        // the files in it now; the folders in it go on the list to walk
        return eachFew(list.filter(function (k) { return k.isFile; }), 16, function (k) { return walk(k, inner); })
          .then(function () {
            return list.filter(function (k) { return k.isDirectory; }).map(function (k) { return [k, inner]; });
          });
      });
    }
    var todo = entries.map(function (e) { return [e, ""]; });
    function next() {
      if (!todo.length || out.length >= WALK_MOST || turn !== inTurn) { return Promise.resolve(); }
      var now = todo.splice(0, 8);
      return eachFew(now, 8, function (pair) { return walk(pair[0], pair[1]); }).then(function (got) {
        got.forEach(function (more) { if (more) { todo.push.apply(todo, more); } });
        return next();
      });
    }
    if (entries.length > 1 || entries[0].isDirectory) { inBusy(TXT.in_looking); }
    return next().then(function () {
      if (turn !== inTurn) { inDone(); return { list: [], folder: "" }; }
      return { list: out, folder: folder || (entries.length > 1 ? " " : "") };
    });
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
    // asked about first where there is work here, with saving it offered
    // (36-sync.js), the way every opening is
    broughtIn(list, files.length > 1 ? " " : "");
  });
