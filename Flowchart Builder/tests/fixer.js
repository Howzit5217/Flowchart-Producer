// ---------------------------------------------------------------------------
//  fixer.js -- the Code tab's fixer, at the size people actually hand it
//
//  Run by tests/run.py where node is installed.  The reader is lifted out of
//  flowchart/ui/js/18-from-code.js as from-code.js lifts it, and the fixer
//  (mender) is stepped the way the page's worker steps it, with a time to be
//  done by.  Programs are made here -- a long one, many files, one wrong from
//  end to end -- and broken in a few hundred places from a fixed seed, so
//  every run is the same run.  Prints one line of JSON: what each case came
//  to, and whether it is what it should be.
//
//      node tests/fixer.js
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");
Error.stackTraceLimit = 0;                     // as the worker has it
var src = fs.readFileSync(path.join(__dirname, "..", "flowchart", "ui", "js", "18-from-code.js"), "utf8");
var read = new Function("say", src + "\nreturn codeToPseudo;")(function (key) { return key; });

var seed = 1;
function rand() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
function pick(list) { return list[Math.floor(rand() * list.length)]; }

function python(n, tag) {
  var out = [];
  for (var i = 0; i < n; i++) {
    out.push("def work" + tag + i + "(items, limit):", "    total = 0", "    for x in items:",
             "        if x > limit:", "            total = total + x * 2", "        else:",
             "            print(\"small\", x, " + i + ")", "    while total > 100:",
             "        total = total - 7", "    return total", "");
  }
  out.push("def main():", "    data = [3, 9, 27, 81]");
  for (var j = 0; j < Math.min(n, 20); j++) { out.push("    print(work" + tag + j + "(data, " + j + "))"); }
  out.push("", "main()");
  return out.join("\n");
}
function java(n, tag) {
  var out = ["class Big" + tag + " {"];
  for (var i = 0; i < n; i++) {
    out.push("    static int work" + i + "(int[] items, int limit) {", "        int total = 0;",
             "        for (int x : items) {", "            if (x > limit) {", "                total = total + x * 2;",
             "            } else {", "                System.out.println(\"small \" + x);", "            }",
             "        }", "        return total;", "    }", "");
  }
  out.push("}");
  return out.join("\n");
}
function spots(code, re) { var o = [], m; re.lastIndex = 0; while ((m = re.exec(code))) { o.push(m.index); } return o; }
function broken(text, k) {
  for (var r = 0; r < k; r++) {
    var kind = pick(["drop", "drop", "double", "shift"]);
    if (kind !== "shift") {
      var at = pick(spots(text, /[;)(\]}{":,]/g));
      text = kind === "drop" ? text.slice(0, at) + text.slice(at + 1) : text.slice(0, at + 1) + text[at] + text.slice(at + 1);
    } else {
      var rows = text.split("\n"), row = 1 + Math.floor(rand() * (rows.length - 1));
      if (!rows[row].trim()) { continue; }
      var lead = /^ */.exec(rows[row])[0].length;
      rows[row] = lead >= 2 ? rows[row].slice(2) : "  " + rows[row];
      text = rows.join("\n");
    }
  }
  return text;
}
function reads(files, lang) { try { read(files, lang); return true; } catch (e) { return false; } }

// The fixer, stepped, its bar (reach) sampled against the clock.
function fix(files, lang, most) {
  var began = Date.now(), m = read.mender(files, lang, { until: began + most }), marks = [];
  while (!m.step()) { marks.push([Date.now() - began, m.reach()]); }
  var took = Date.now() - began, all = m.result(), off = 0;
  marks.forEach(function (one) { off += Math.abs(one[1] - one[0] / Math.max(1, took)); });
  return { ms: took, n: all.n, gaveUp: all.gaveUp, files: all.files, err: all.err, problems: all.problems,
           off: marks.length ? off / marks.length : 0 };
}

var out = [];
function say(name, ok, what) { out.push({ name: name, ok: !!ok, what: what }); }

// A long program, wrong in a hundred places: all put right, in a few seconds,
// the bar saying as it goes how much of the time is gone.
seed = 7;
var one = [{ name: "big.py", text: broken(python(460, ""), 100) }];
var got = fix(one, "python", 25000);
say("a long program, wrong a hundred times over", !got.gaveUp && reads(got.files, "python") && got.ms < 15000 && got.off < 0.25,
    got.n + " fixes in " + got.ms + " ms, the bar " + Math.round(got.off * 100) + "% off the clock on average");

// Twenty files, wrong a few hundred times between them.
seed = 3;
var many = [];
for (var f = 0; f < 20; f++) { many.push({ name: "part" + f + ".py", text: python(90, "f" + f + "_") }); }
many = many.map(function (one) { return { name: one.name, text: broken(one.text, 25) }; });
got = fix(many, "python", 25000);
say("twenty files, wrong five hundred times between them", !got.gaveUp && reads(got.files, "python") && got.ms < 15000,
    got.n + " fixes in " + got.ms + " ms");

// Java, wrong in forty places -- the braces among them.
seed = 7;
var jv = [{ name: "Big.java", text: broken(java(380, ""), 40) }];
got = fix(jv, "java", 25000);
say("Java with its braces wrong", !got.gaveUp && reads(got.files, "java") && got.ms < 15000,
    got.n + " fixes in " + got.ms + " ms");

// A line nothing can be done with, in among things that can: those put
// right, after it as well as before it, and the line just as it was.
seed = 5;
var rows = python(180, "").split("\n");
rows.splice(300, 0, "    class def if:");
got = fix([{ name: "", text: broken(rows.join("\n"), 20) }], "python", 25000);
var fixedRows = got.files[0].text.split("\n"), at = fixedRows.indexOf("    class def if:") + 1;
var left = read.problemsIn(got.files, "python", {});
// all that is still wrong is that line, and the block it stands in for
var near = left.list.every(function (p) { return Math.abs(p.line - at) <= 2; });
say("a line nothing puts right, held out of the way", got.n >= 15 && at > 0 && near && left.list.length &&
    got.files[0].text.indexOf("flowchart-held") < 0,
    got.n + " fixes, the line " + (at ? "as it was, at " + at : "changed") + ", " + left.list.length +
    " left" + (near ? ", all of it there" : ", some of it elsewhere"));

// Wrong from end to end: said to be too much, soon -- not after all the time
// there is -- and every problem in it listed.
seed = 3;
var mess = [{ name: "", text: broken(python(1800, ""), 2500) }];
got = fix(mess, "python", 20000);
say("wrong from end to end", got.gaveUp === "big" && got.ms < 15000 && got.problems.list.length > 50,
    "gave up (" + got.gaveUp + ") after " + got.ms + " ms, " + got.problems.list.length +
    (got.problems.more ? "+" : "") + " problems listed");

process.stdout.write(JSON.stringify(out));
