// ---------------------------------------------------------------------------
//  names.js -- what the page calls a program nobody named
//
//  Run by tests/run.py where node is installed.  titleFor is lifted straight
//  out of flowchart/ui/js/09-names.js, with the words handed over by run.py
//  (and the language they are in, as NAMES_LANG), and asked about every
//  example and every puzzle the page offers.  What it said comes back as
//  JSON, one [key, name] pair apiece.  With --files it names programs
//  opened from files instead (see below).
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");

var UI = path.join(__dirname, "..", "flowchart", "ui", "js");
var TXT = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
var LANG = process.env.NAMES_LANG || "en";   // as 01-start.js has it

function say(key, fill) {                 // as 01-start.js has it
  var out = TXT[key] || key;
  for (var name in (fill || {})) { out = out.split("{" + name + "}").join(fill[name]); }
  return out;
}
function shortTitle(s) {                  // as 09-build.js has it
  s = String(s).replace(/\s+/g, " ").trim();
  return s.length > 48 ? s.slice(0, 46).trim() + "…" : s;
}
eval(fs.readFileSync(path.join(UI, "09-names.js"), "utf8"));

// Or, given --files, what the Title box says for programs opened from
// files: [file name, program] pairs in, [file name, title] pairs out --
// the file's name made a title, or else what the program is read as
// (titleFromWords in 09-build.js, less the examples and puzzles).
if (process.argv[3] === "--files") {
  process.stdout.write(JSON.stringify(
    JSON.parse(fs.readFileSync(process.argv[4], "utf8")).map(function (one) {
      return [one[0], fileTitle(one[0], one[1]) || titleFor(one[1])];
    })));
  process.exit(0);
}

// A list the page writes out as a literal, read the way the page reads it.
function literal(file, name) {
  var src = fs.readFileSync(path.join(UI, file), "utf8");
  var at = src.indexOf("var " + name + " = [");
  var end = src.indexOf("\n  ];", at);
  return eval("(" + src.slice(at + ("var " + name + " = ").length, end + 4) + ")");
}

// The lists name them; the programs themselves are words, written out in
// each language (e_ask_p), so they come from the words handed over.
var out = [];
literal("09-build.js", "STARTS").forEach(function (level) {
  level[1].forEach(function (key) { out.push([key, titleFor(TXT[key + "_p"])]); });
});
literal("28-puzzles.js", "PUZZLES").forEach(function (level) {
  level[1].forEach(function (one) { out.push([one.key, titleFor(TXT[one.key + "_p"])]); });
});
// And any others run.py hands over, as [key, program] pairs in a file.
if (process.argv[3]) {
  JSON.parse(fs.readFileSync(process.argv[3], "utf8")).forEach(function (one) {
    out.push([one[0], titleFor(one[1])]);
  });
}
process.stdout.write(JSON.stringify(out));
