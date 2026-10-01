// ---------------------------------------------------------------------------
//  from-code.js -- code in a language, read back into pseudocode
//
//  Run by tests/run.py where node is installed.  The reader is lifted
//  straight out of flowchart/ui/js/18-from-code.js, so what is checked is the
//  code the Code way of working runs.  run.py hands over programs in Python,
//  Java, C#, C++ and JavaScript; each is read and what came of it -- the
//  pseudocode, the notes beside it, or why it could not be read and on which
//  line -- is written back as JSON for run.py to parse, run and compare.
//
//      node tests/from-code.js asked.json answers.json
//
//  With only one argument, a file of code, it prints the pseudocode:
//      node tests/from-code.js program.py
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");

var src = fs.readFileSync(path.join(__dirname, "..", "flowchart", "ui", "js",
                                    "18-from-code.js"), "utf8");

function reader(words) {
  var TXT = words || {};
  function say(key, fill) {                    // eslint-disable-line no-unused-vars
    var out = TXT[key] || key;
    for (var name in (fill || {})) {
      out = out.split("{" + name + "}").join(fill[name]);
    }
    return out;
  }
  eval(src);                                   // eslint-disable-line no-eval
  return codeToPseudo;                         // eslint-disable-line no-undef
}

var EXT = { py: "python", java: "java", cs: "csharp", cpp: "cpp", cc: "cpp",
            js: "javascript", ts: "typescript", c: "c", kt: "kotlin", swift: "swift", go: "go", rs: "rust" };

if (process.argv.length === 3) {
  var file = process.argv[2];
  var lang = EXT[path.extname(file).slice(1)] || "python";
  try {
    var got = reader({})(fs.readFileSync(file, "utf8"), lang);
    process.stdout.write(got.text);
    got.notes.forEach(function (n) { console.error("note: " + n.text); });
  } catch (e) {
    console.error("line " + (e.line || "?") + ": " + e.message);
    if (!e.said) { console.error(e.stack); }
    process.exit(1);
  }
  process.exit(0);
}

var asked = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var read = reader(asked.words);
// A case is {lang, code} or {lang, files: [{name, text}]} -- a program in
// several files -- and with no lang the reader is asked which it is too.
var out = asked.cases.map(function (one) {
  var src = one.files || one.code;
  var lang = one.lang || read.detect(src);
  try {
    var got = read(src, lang), renamed = [];
    // a call that can't be run, and the name the Code tab would change it to
    if (one.mend) {
      got.notes.forEach(function (n) {
        var r = null;
        try { r = read.tryRename(src, lang, n); } catch (e3) { r = null; }
        renamed.push(r ? r.text : null);
      });
    }
    return { text: got.text, notes: got.notes, detected: read.detect(src), renamed: renamed };
  } catch (e) {
    // and what the Code tab's Fix button would make of it, if it offers one,
    // and what Fix all would
    var mended = null, all = null;
    try { mended = read.tryMend(src, lang, e); } catch (e2) { mended = null; }
    if (one.mend) {
      try { all = read.mendAll(src, lang); } catch (e4) { all = null; }
    }
    return { error: e.message, line: e.line || 0, file: e.file || 0, said: e.said || "",
             detected: read.detect(src), stack: e.said ? "" : String(e.stack || e),
             mended: mended ? mended.text : null,
             all: all ? { text: all.files[0].text, reads: !all.err } : null };
  }
});
fs.writeFileSync(process.argv[3], JSON.stringify(out));
