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
            js: "javascript" };

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
var out = asked.cases.map(function (one) {
  try {
    var got = read(one.code, one.lang);
    return { text: got.text, notes: got.notes };
  } catch (e) {
    return { error: e.message, line: e.line || 0, said: e.said || "",
             stack: e.said ? "" : String(e.stack || e) };
  }
});
fs.writeFileSync(process.argv[3], JSON.stringify(out));
