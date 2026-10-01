// ---------------------------------------------------------------------------
//  code-titles.js -- what the Title box says for a program written as code
//
//  Run by tests/run.py where node is installed.  The code reader
//  (18-from-code.js) and the namer (09-names.js) are lifted straight out of
//  the page, with the words run.py hands over, and asked what each program
//  is called the way the page asks it after Build reads the code (codeTitle,
//  with the files, the folder they came in and the reader's hint).
//
//      node tests/code-titles.js words.json cases.json
//
//  cases.json is [{files: [{name, text}], lang, folder}]; what comes back is
//  the title for each, in order, as JSON.
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");

var UI = path.join(__dirname, "..", "flowchart", "ui", "js");
var TXT = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var LANG = "en";                             // as 01-start.js has it

function say(key, fill) {                    // as 01-start.js has it
  var out = TXT[key] || key;
  for (var name in (fill || {})) { out = out.split("{" + name + "}").join(fill[name]); }
  return out;
}
function shortTitle(s) {                     // as 09-build.js has it
  s = String(s).replace(/\s+/g, " ").trim();
  return s.length > 48 ? s.slice(0, 46).trim() + "…" : s;
}
eval(fs.readFileSync(path.join(UI, "09-names.js"), "utf8"));
eval(fs.readFileSync(path.join(UI, "18-from-code.js"), "utf8"));

var cases = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
process.stdout.write(JSON.stringify(cases.map(function (one) {
  try {
    var said = codeToPseudo(one.files, one.lang);    // eslint-disable-line no-undef
    return codeTitle({ files: one.files, folder: one.folder || "", hint: said.title || "" }, said.text);
  } catch (e) {
    return "ERROR " + e.message;
  }
})));
