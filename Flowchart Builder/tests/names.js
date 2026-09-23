// ---------------------------------------------------------------------------
//  names.js -- what the page calls a program nobody named
//
//  Run by tests/run.py where node is installed.  describeProgram is lifted
//  straight out of flowchart/ui/js/09-names.js, with the words handed over
//  by run.py, and asked about every example and every puzzle the page
//  offers.  What it said comes back as JSON, one [key, name] pair apiece.
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");

var UI = path.join(__dirname, "..", "flowchart", "ui", "js");
var TXT = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

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

// A list the page writes out as a literal, read the way the page reads it.
function literal(file, name) {
  var src = fs.readFileSync(path.join(UI, file), "utf8");
  var at = src.indexOf("var " + name + " = [");
  var end = src.indexOf("\n  ];", at);
  return eval("(" + src.slice(at + ("var " + name + " = ").length, end + 4) + ")");
}

var out = [];
literal("09-build.js", "STARTS").forEach(function (level) {
  level[1].forEach(function (pair) { out.push([pair[0], describeProgram(pair[1])]); });
});
literal("28-puzzles.js", "PUZZLES").forEach(function (level) {
  level[1].forEach(function (one) { out.push([one.key, describeProgram(one.start)]); });
});
process.stdout.write(JSON.stringify(out));
