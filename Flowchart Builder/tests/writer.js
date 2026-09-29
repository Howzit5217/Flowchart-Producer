// ---------------------------------------------------------------------------
//  writer.js -- a drawing by hand, written out as pseudocode
//
//  Run by tests/run.py where node is installed.  The writer is lifted
//  straight out of flowchart/ui/js/12-check.js (handAsPseudocode), so what is
//  checked here is the code that runs when a drawing is checked, run, shown
//  As pseudocode or tidied up.  Each drawing below is written out and has to
//  come out as the program under it, line for line.
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");
var src = fs.readFileSync(path.join(__dirname, "..", "flowchart", "ui", "js",
                                    "12-check.js"), "utf8");
var from = src.indexOf("var R_YES = ");
var to = src.indexOf("// Reading the design as a program");
if (from < 0 || to < 0) {
  console.error("could not find the writer in 12-check.js");
  process.exit(1);
}
var hand = { nodes: [], links: [] };
function nodeById(id) { return hand.nodes.filter(function (n) { return n.id === id; })[0] || null; }
function outOf(id) { return hand.links.filter(function (l) { return l.from === id; }); }
function intoOf(id) { return hand.links.filter(function (l) { return l.to === id; }); }
function asksKind(kind) { return kind === "diamond"; }
function endsKind(kind) { return kind === "oval"; }
var TXT = { h_no_start: "no start", h_tangled: "tangled" };
eval(src.slice(from, to));                    // eslint-disable-line no-eval

function drawing(shapes, arrows) {
  hand = {
    nodes: shapes.map(function (s, i) { return { id: i + 1, kind: s[0], text: s[1] }; }),
    links: arrows.map(function (a) { return { from: a[0], to: a[1], label: a[2] || "" }; })
  };
}

var CASES = [
  ["an If and its Else", [
    ["oval", "Start"], ["io", "Input x"], ["diamond", "x > 3"], ["io", 'Display "big"'],
    ["io", 'Display "small"'], ["io", 'Display "done"'], ["oval", "End"]],
   [[1, 2], [2, 3], [3, 4, "Yes"], [3, 5, "No"], [4, 6], [5, 6], [6, 7]],
   ["Start", "Input x", "If x > 3 Then", '    Display "big"', "Else", '    Display "small"',
    "End If", 'Display "done"', "End"]],
  ["a loop", [
    ["oval", "Start"], ["rect", "Set n = 3"], ["diamond", "n > 0"], ["io", "Display n"],
    ["rect", "Set n = n - 1"], ["oval", "End"]],
   [[1, 2], [2, 3], [3, 4, "Yes"], [4, 5], [5, 3], [3, 6, "No"]],
   ["Start", "Set n = 3", "While n > 0", "    Display n", "    Set n = n - 1", "End While", "End"]],
  ["a loop kept going on its No", [
    ["oval", "Start"], ["io", "Input guess"], ["diamond", "guess = 7"], ["io", "Input guess"],
    ["oval", "End"]],
   [[1, 2], [2, 3], [3, 4, "No"], [4, 3], [3, 5, "Yes"]],
   ["Start", "Input guess", "While NOT (guess = 7)", "    Input guess", "End While", "End"]],
  // Everywhere in a loop comes back round to everywhere else in it, so an
  // If inside one was taken for a loop of its own, and both of its ways
  // for a tangle that could not be written out at all.
  ["an If inside a loop", [
    ["oval", "Start"], ["rect", "Set i = 1"], ["diamond", "i <= 10"], ["diamond", "i mod 2 = 0"],
    ["io", "Display i"], ["rect", "Set i = i + 1"], ["oval", "End"]],
   [[1, 2], [2, 3], [3, 4, "Yes"], [4, 5, "Yes"], [4, 6, "No"], [5, 6], [6, 3], [3, 7, "No"]],
   ["Start", "Set i = 1", "While i <= 10", "    If i mod 2 = 0 Then", "        Display i",
    "    End If", "    Set i = i + 1", "End While", "End"]],
  ["an If inside a loop, one way going straight round", [
    ["oval", "Start"], ["rect", "Set i = 0"], ["diamond", "i < 5"], ["rect", "Set i = i + 1"],
    ["diamond", "i = 3"], ["io", "Display i"], ["oval", "End"]],
   [[1, 2], [2, 3], [3, 4, "Yes"], [4, 5], [5, 3, "Yes"], [5, 6, "No"], [6, 3], [3, 7, "No"]],
   ["Start", "Set i = 0", "While i < 5", "    Set i = i + 1", "    If i = 3 Then", "    Else",
    "        Display i", "    End If", "End While", "End"]],
  ["a loop inside a loop", [
    ["oval", "Start"], ["diamond", "i < 3"], ["diamond", "j < 3"], ["io", "Display j"],
    ["rect", "Set i = i + 1"], ["oval", "End"]],
   [[1, 2], [2, 3, "Yes"], [3, 4, "Yes"], [4, 3], [3, 5, "No"], [5, 2], [2, 6, "No"]],
   ["Start", "While i < 3", "    While j < 3", "        Display j", "    End While",
    "    Set i = i + 1", "End While", "End"]],
  // A loop tested at its foot was written as a While at the test, which
  // said everything above the test twice: Input guess twice for the one
  // shape, and Tidy up gave the second one a place nothing stood in.
  ["a loop tested at its foot, going round on its No", [
    ["oval", "Start"], ["io", "Input guess"], ["diamond", "guess = 7"], ["io", 'Display "yes"'],
    ["oval", "End"]],
   [[1, 2], [2, 3], [3, 2, "No"], [3, 4, "Yes"], [4, 5]],
   ["Start", "Do", "    Input guess", "Until guess = 7", 'Display "yes"', "End"]],
  ["a loop tested at its foot, going round on its Yes", [
    ["oval", "Start"], ["rect", "Set n = 0"], ["rect", "Set n = n + 1"], ["io", "Display n"],
    ["diamond", "n < 5"], ["oval", "End"]],
   [[1, 2], [2, 3], [3, 4], [4, 5], [5, 3, "Yes"], [5, 6, "No"]],
   ["Start", "Set n = 0", "Do", "    Set n = n + 1", "    Display n", "Loop While n < 5", "End"]],
  // Both ways of the If came back to it round the loop: once a tangle.
  ["a loop tested at its foot with an If at its top", [
    ["oval", "Start"], ["diamond", "a"], ["io", "Display 1"], ["diamond", "d"], ["oval", "End"]],
   [[1, 2], [2, 3, "Yes"], [2, 4, "No"], [3, 4], [4, 2, "Yes"], [4, 5, "No"]],
   ["Start", "Do", "    If a Then", "        Display 1", "    End If", "Loop While d", "End"]],
  ["a loop tested at its foot inside a While", [
    ["oval", "Start"], ["diamond", "i < 3"], ["rect", "Set j = j + 1"], ["diamond", "j < 3"],
    ["rect", "Set i = i + 1"], ["oval", "End"]],
   [[1, 2], [2, 3, "Yes"], [3, 4], [4, 3, "Yes"], [4, 5, "No"], [5, 2], [2, 6, "No"]],
   ["Start", "While i < 3", "    Do", "        Set j = j + 1", "    Loop While j < 3",
    "    Set i = i + 1", "End While", "End"]],
  // A shape nothing leads into that leads nowhere either -- a note put
  // down first -- is not where the flow starts.
  ["a note standing on its own", [
    ["note", "About this"], ["oval", "Start"], ["io", "Display 1"], ["oval", "End"]],
   [[2, 3], [3, 4]],
   ["Start", "Display 1", "End"]],
  // A shape with no way on out of it kept its words, not just an End.
  ["a shape the flow stops at", [
    ["oval", "Start"], ["io", "Input x"], ["io", "Display x"]],
   [[1, 2], [2, 3]],
   ["Start", "Input x", "Display x", "End"]]
];

// Tidy up's writing (handWriting(true)): every shape once, where the flow
// first comes to it, and a line for a shape with nothing in it.  The
// numbers are the shapes each line came from.
var ONCE = [
  ["a loop tested part way down", [
    ["oval", "Start"], ["io", "Input x"], ["diamond", "x = 0"], ["io", "Display x"], ["oval", "End"]],
   [[1, 2], [2, 3], [3, 5, "Yes"], [3, 4, "No"], [4, 2]],
   ["Start", "Input x", "While NOT (x = 0)", "    Display x", "End While", "End"],
   { 1: 1, 2: 2, 3: 3, 4: 4, 6: 5 }],
  ["a circle where two ways meet", [
    ["oval", "Start"], ["diamond", "a > 1"], ["io", "Display 1"], ["io", "Display 2"],
    ["circle", ""], ["oval", "End"]],
   [[1, 2], [2, 3, "Yes"], [2, 4, "No"], [3, 5], [4, 5], [5, 6]],
   ["Start", "If a > 1 Then", "    Display 1", "Else", "    Display 2", "End If", "…", "End"],
   { 1: 1, 2: 2, 3: 3, 5: 4, 7: 5, 8: 6 }]
];

var bad = [];
CASES.forEach(function (c) {
  drawing(c[1], c[2]);
  var got;
  try { got = handAsPseudocode().split("\n"); }
  catch (e) { got = ["(" + e.message + ")"]; }
  if (got.join("\n") !== c[3].join("\n")) {
    bad.push(c[0] + ": " + JSON.stringify(got));
  }
});
ONCE.forEach(function (c) {
  drawing(c[1], c[2]);
  var got;
  try { got = handWriting(true); }
  catch (e) { got = { text: "(" + e.message + ")", lines: {} }; }
  if (got.text !== c[3].join("\n") || JSON.stringify(got.lines) !== JSON.stringify(c[4])) {
    bad.push(c[0] + " (tidying): " + JSON.stringify(got));
  }
});
var all = CASES.length + ONCE.length;
console.log(all - bad.length + " of " + all + " drawings written out right" +
            (bad.length ? " -- " + bad.join("; ") : ""));
process.exit(bad.length ? 1 : 0);
