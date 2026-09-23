// ---------------------------------------------------------------------------
//  09-names.js -- a name for a program nobody named, from what it does
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A program with no title used to be called by its first line, which is
  // nearly always Declare Integer n or Display "Enter a number" -- a name
  // that says what the program starts with, not what it is for.  This reads
  // the program for the things that give its purpose away (a year tested
  // against 400, 100 and 4; a total divided by a count; a menu of choices)
  // and says that instead: "Checks whether a year is a leap year".
  //
  // It is a reading of the words, not of the meaning, so it goes from the
  // most particular kind of program to the least, and when nothing
  // particular turns up it says what the program visibly does -- counts
  // from 1 to 5, checks whether age >= 18, asks for a name and shows the
  // answer.  Only when there is not even that does it say nothing, and the
  // caller falls back on the first line after all.
  //
  // The names are words of the page's language like any other (the d_
  // keys); what is quoted from the program -- a variable, a test -- is left
  // as it was typed.
  function describeProgram(text) {
    // A leading # is how deep a line is, not a comment (see clean.py).
    var lines = String(text || "").slice(0, 20000).split("\n").map(function (l) {
      return l.replace(/^[\s#]+/, "").replace(/^(\/\/|\/\*).*$/, "").trim();
    }).filter(function (l) { return l; });
    if (!lines.length) { return ""; }
    var low = lines.join("\n").toLowerCase();
    function has(re) { return re.test(low); }
    function said(key, fill) { return TXT[key] ? say(key, fill) : ""; }

    var inputs = [], fors = [], ifs = [], names = [], loops = [];
    lines.forEach(function (l) {
      var m = /^(?:input|read|get|enter|accept|readline)\s+([A-Za-z_]\w*)/i.exec(l);
      if (m) { inputs.push(m[1]); }
      m = /^for\s+([A-Za-z_]\w*)\s*(?:=|:=|<-)\s*(\S+)\s+(?:to|downto)\s+(\S+)(?:\s+step\s+(\S+))?/i.exec(l);
      if (m) { fors.push({ v: m[1], a: m[2], b: m[3], down: /^-/.test(m[4] || "") || /downto/i.test(l) }); }
      m = /^(?:else\s*if|elseif|if)\s+(.+?)(?:\s+then)?$/i.exec(l);
      if (m) { ifs.push(m[1]); }
      m = /^(?:while|do\s+while|until|loop\s+until|loop\s+while|do\s+until)\s+(.+?)(?:\s+do)?$/i.exec(l);
      if (m) { loops.push({ cond: m[1], until: /until/i.test(l.split(/\s+/).slice(0, 2).join(" ")) }); }
      m = /^(?:module|function|sub|procedure|def)\s+(?:\w+\s+)?([A-Za-z_]\w*)\s*\(/i.exec(l);
      if (m) { names.push(m[1]); }
    });
    var looped = fors.length || loops.length || /^(do|repeat)$/m.test(low);
    var count = fors[0];
    function number(x) { return /^-?\d+(\.\d+)?$/.test(String(x)); }

    // ---- kinds of program, the most particular first ----
    if (has(/\brock\b/) && has(/scissors/)) { return said("d_rps"); }
    if (has(/saturday|monday/) && has(/\bday\b|weekday/)) { return said("d_weekday"); }
    if (has(/mod\s+400/) && has(/mod\s+100/)) { return said("d_leap"); }
    if (has(/deposit/) && has(/withdraw/)) { return said("d_bank"); }
    if (has(/interest/) && has(/payment|loan/)) { return said("d_loan"); }
    if (has(/\bhours\b/) && has(/\brate\b|gross|overtime/)) { return said("d_pay"); }
    if (has(/\btip\b/) && has(/bill|check|people/)) { return said("d_tip"); }
    if (has(/snack|vending/)) { return said("d_vending"); }
    if (has(/cents/) && has(/div\s+(100|25|10)\b|dimes|quarters|pennies/)) { return said("d_change"); }
    if (has(/\bprice\b/) && has(/percent off|discount|\*\s*0\.\d/)) { return said("d_shop"); }
    if (has(/\bprice\b/)) { return said("d_price"); }
    if (has(/kilomet|kilogram|centimet/)) { return said("d_convert"); }
    if (has(/\*\s*9\s*\/\s*5\s*\+\s*32|fahrenheit|celsius/)) { return said("d_temps"); }
    if (has(/prime/) && has(/limit|up to|found/)) { return said("d_primes"); }
    if (has(/prime|factors\s*=\s*2\b/)) { return said("d_prime"); }
    if (has(/fizz/)) { return said("d_fizz"); }
    if (has(/greatest common|\bgcd\b|\bhcf\b/) || has(/\b(\w+)\s*=\s*\1\s*-\s*(\w+)[\s\S]*\b\2\s*=\s*\2\s*-\s*\1\b/)) {
      return said("d_gcd");
    }
    if (has(/fibonacci|\bfib\b/) || has(/\bnext\s*=\s*(\w+)\s*\+\s*(\w+)[\s\S]*\b\1\s*=\s*\2\b/)) {
      return said("d_fib");
    }
    if (has(/factorial/) || has(/\b(\w+)\s*=\s*\1\s*\*\s*i\b/) && has(/\b\w+\s*=\s*1\b/)) {
      return said("d_factorial");
    }
    if (has(/\*\s*10\s*\+\s*\w+\s+mod\s+10/)) { return said("d_reverse"); }
    if (has(/div\s+10\b/) && has(/\b(\w+)\s*=\s*\1\s*\+\s*1\b/)) { return said("d_digits"); }
    if (has(/grade/) && has(/students?\b/)) { return said("d_gradebook"); }
    if (has(/"a"/) && has(/"b"/) && has(/>=\s*90\b/)) { return said("d_grades"); }
    if (has(/\bvotes?\b/) && has(/\b(\w+)\s*=\s*\1\s*\+\s*1\b/)) { return said("d_votes"); }
    if (has(/quiz/) || has(/question/) && has(/answer/)) { return said("d_quiz"); }
    if (has(/password/)) { return said("d_login"); }
    if (has(/guess/)) { return said("d_guess"); }
    if (has(/vowel/)) { return said("d_vowel"); }
    if (has(/\+\s*"\*"|"\*"\s*\+/)) { return said("d_stars"); }
    if (has(/\brow\s*\*\s*col/)) { return said("d_grid"); }
    if (has(/\btables?\b/) || fors.length && count.b === "12" && has(/\*\s*i\b/)) {
      return said("d_table");
    }
    if (has(/lowest|smallest/) && has(/highest|largest|biggest/)) { return said("d_minmax"); }
    if (has(/biggest|largest|highest|\bmax\b/)) { return said("d_biggest"); }
    if (has(/\bscores?\b/) && has(/average|total\s*\/|passes/)) { return said("d_scores"); }
    if (has(/average|\btotal\s*\/\s*\w+/)) { return said("d_average"); }
    if (has(/mod\s+2\s*=\s*0/) && has(/total|sum/)) {
      return count ? said("d_sumevens", { a: count.a, b: count.b }) : said("d_sumevens_any");
    }
    if (has(/mod\s+2/) && has(/even|odd/)) { return said("d_oddeven"); }
    if (has(/\b(\w+)\s*=\s*(\w+)\s*\n\s*\2\s*=\s*(\w+)\s*\n\s*\3\s*=\s*\1\b/)) { return said("d_swap"); }
    if (has(/width\s*\*\s*height|\barea\b/)) { return said("d_area"); }
    if (has(/select\s+case|switch/) && has(/choice|menu|pick/)) { return said("d_menu"); }
    if (has(/liftoff|countdown|count back/) || count && count.down) {
      var from = count && count.down ? count.a
               : (/\b(\w+)\s*=\s*(\d+)\s*\n\s*while\s+\1\s*>/.exec(low) || [])[2];
      return number(from) ? said("d_down_n", { n: from }) : said("d_down");
    }
    if (loops.some(function (l) { return l.until; }) && inputs.length &&
        has(/\band\b/) && has(/until\s+\w+\s*[<>]=?/)) {
      return said("d_in_range");
    }
    if (has(/\b(total|sum)\s*=\s*\1\s*\+\s*\w+/) && count) {
      return said("d_sum", { a: count.a, b: count.b });
    }
    if (has(/\b(total|sum)\s*=\s*\1\s*\+/)) { return said("d_sum_any"); }
    if (count && !ifs.length) { return said("d_count", { a: count.a, b: count.b }); }
    var upto = /\b(\w+)\s*=\s*(\d+)\s*\n\s*while\s+\1\s*<=?\s*(\d+)/.exec(low);
    if (upto && !ifs.length) { return said("d_count", { a: upto[2], b: upto[3] }); }
    if (inputs.length >= 2 && has(/display\s+\w+\s*\+\s*\w+|=\s*add\(|\+/) && !looped && !ifs.length) {
      return said("d_add");
    }
    if (has(/hello|welcome|\bhi\b/) && inputs.some(function (v) { return /name/i.test(v); })) {
      return said("d_greet");
    }

    // ---- what it visibly does, when it is no kind of program in particular ----
    var what = inputs.length ? plainNames(inputs) : "";
    if (ifs.length && !looped) {
      return shortName(said("d_checks", { cond: ifs[0] }));
    }
    if (loops.length) {
      var one = loops[0];
      return shortName(said(one.until ? "d_until" : "d_while", { cond: one.cond }));
    }
    if (count) { return said("d_repeats", { v: count.v, a: count.a, b: count.b }); }
    if (names.length) {
      return shortName(said("d_uses", { names: names.slice(0, 2).map(function (n) {
        return n + "()";
      }).join(", ") }));
    }
    if (what) {
      var shows = /^(?:display|print|output|write)\s+(?!["'])/im.test(lines.join("\n"));
      return shortName(said(shows ? "d_asks_shows" : "d_asks", { what: what }));
    }
    return "";
  }

  // "a and b" -> "two numbers"; "firstName" -> "first name"
  function plainNames(vars) {
    var seen = [];
    vars.forEach(function (v) { if (seen.indexOf(v) < 0) { seen.push(v); } });
    if (seen.every(function (v) { return v.length === 1; })) {     // n, a and b ...
      return say(seen.length === 1 ? "d_one" : seen.length === 2 ? "d_two"
                 : seen.length === 3 ? "d_three" : "d_numbers", { n: seen.length });
    }
    return seen.slice(0, 3).map(spaced).join(", ");
  }

  function spaced(name) {
    return String(name).replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  }

  function shortName(s) { return shortTitle(s || ""); }     // see 09-build.js
