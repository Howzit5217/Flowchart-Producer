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
    var seen = readProgram(lines);         // what it works out, and about what

    // ---- kinds of program, the most particular first ----
    if (has(/\brock\b/) && has(/scissors/)) { return said("d_rps"); }
    if (has(/saturday|monday/) && has(/\bday\b|weekday/)) { return said("d_weekday"); }
    if (has(/mod\s+400/) && has(/mod\s+100/)) { return said("d_leap"); }
    if (has(/deposit/) && has(/withdraw/)) { return said("d_bank"); }
    if (has(/interest/) && has(/payment|loan/)) { return said("d_loan"); }
    if (has(/\bbudget\b/) && has(/\bover\b/) && has(/\bunder\b/)) { return said("d_budget"); }
    // A value that goes up or down by the same rate or step, round after
    // round: tuition, a population, what a car is worth.
    var grows = growthName(seen);
    if (grows) { return grows; }
    if (has(/\bhours\b/) && has(/\brate\b|gross|overtime/)) { return said("d_pay"); }
    if (has(/\btip\b/) && has(/bill|check|people/)) { return said("d_tip"); }
    if (has(/snack|vending/)) { return said("d_vending"); }
    if (has(/cents/) && has(/div\s+(100|25|10)\b|dimes|quarters|pennies/)) { return said("d_change"); }
    if (has(/\bprice\b/) && has(/percent off|discount|\*\s*0\.\d/)) { return said("d_shop"); }
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
    // What it works out and shows, called what the program itself calls it:
    // "Total sales tax: $" makes it Sales Tax.  Ahead of the rules that go
    // by a single word, so a prompt that happens to say kilograms does not
    // make a sum about energy a unit converter.
    var works = resultName(seen);
    if (works) { return works; }
    if (has(/\bprice\b/)) { return said("d_price"); }
    if (has(/kilomet|kilogram|centimet/)) { return said("d_convert"); }
    if (has(/\*\s*9\s*\/\s*5\s*\+\s*32|fahrenheit|celsius/)) { return said("d_temps"); }
    if (has(/lowest|smallest/) && has(/highest|largest|biggest/)) { return said("d_minmax"); }
    if (has(/biggest|largest|highest|\bmax\b/)) { return said("d_biggest"); }
    if (has(/\bscores?\b/) && has(/average|total\s*\/|passes/)) { return said("d_scores"); }
    // A running total of something in particular -- bugs, rainfall -- or
    // its average, rather than of "the numbers".
    var adds = totalName(seen);
    if (adds) { return adds; }
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

  // ---- what a program works out, and what it is about -----------------------
  // The rules above go by the words a program happens to contain, which is
  // right for the kinds of program that give themselves away (a year tested
  // against 400 is a leap year whatever else it says) and wrong for the rest:
  // "Average daily increase" in a prompt made a population a program that
  // works out an average, and every loop over the years a program that
  // "counts from 1 to 5".  What gives a program's purpose away is what it
  // works out -- the value it keeps changing, or the one it shows at the end
  // -- and what it calls that value: its name, the constant it starts from,
  // and the words it prints beside it.  "Set tuition = tuition * (1 +
  // INCREASE_RATE)", round after round, is Tuition Increase.
  //
  // Names that say nothing about a program (i, total, amount, year), words
  // that only join others (the, of, per), and units (inches, dollars) are
  // never what a program is about.
  var NAME_JOIN = /^(a|an|the|of|for|to|in|on|at|by|is|it|its|and|or|not|be|are|was|will|have|has|had|with|from|per|as|this|that|these|those|your|you|my|our|their|we|me|how|many|much|what|which|enter|type|please|each|all|any|so|now|then|than|there|here|into|do|does|did|can|get|give|given)$/;
  var NAME_PLAIN = /^(i|j|k|m|n|x|y|z|count|counter|index|idx|num|number|numbers|total|sum|result|results|value|values|answer|answers|choice|input|output|temp|tmp|start|starting|end|first|last|next|new|old|current|initial|final|rate|increase|decrease|percent|amount|max|min|limit|size|loop|flag|done|again|more|year|years|month|months|day|days|week|weeks|hour|hours|minute|minutes|second|seconds|time|times|round|rounds|step|steps|item|items|data|val|var|str|string|text|line|msg|message|average|avg|mean|pick|option|key|list|yes|no)$/;
  var NAME_UNIT = /^(inch|inches|foot|feet|yard|yards|mile|miles|mm|millimeters?|centimeters?|meters?|kilometers?|ounces?|pounds?|lbs?|grams?|kilograms?|kg|tons?|liters?|gallons?|cups?|dollars?|cents?|degrees?|mph|kph|joules?|newtons?|watts?)$/;
  var NAME_LEAD = /^(total|average|avg|start|starting|initial|current|new|old|final|projected|estimated|base|my|your|the)$/;

  // tuitionRate -> ["tuition", "rate"]; START_TUITION -> ["start", "tuition"]
  function nameWords(name) {
    return String(name || "").replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_\d]+/g, " ").toLowerCase().split(/\s+/).filter(Boolean);
  }

  // The words of a name that say what it is: not the qualifier in front
  // (START_TUITION is tuition), and nothing at all if every word is plain.
  function meaningWords(words) {
    var keep = words.filter(function (w) {
      return w.length > 1 && !NAME_JOIN.test(w) && !NAME_UNIT.test(w);
    });
    while (keep.length > 1 && NAME_LEAD.test(keep[0])) { keep.shift(); }
    return keep.every(function (w) { return NAME_PLAIN.test(w); }) ? [] : keep;
  }

  // Words as a title: Tuition Increase, Square Feet to Acres.
  function titleWords(words) {
    return words.map(function (w, n) {
      return n && /^(and|or|of|for|to|from|in|on|per|the|a|an)$/.test(w)
        ? w : w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  }

  // Rain and rainfall, tax and taxes: the same thing, printed.
  function sameStem(word, stem) {
    return word === stem || word === stem + "s" || stem === word + "s" ||
           stem.length >= 4 && word.indexOf(stem) === 0 && word.length - stem.length <= 4;
  }

  // Everything the rules below go on, read out of the program once: what
  // it sets and to what, what it shows, what it asks for, which of that is
  // inside a loop, and the words it prints -- each printed string cut into
  // runs of words wherever a colon, a figure or a column gap breaks it, so
  // "Hour    Distance Traveled" is two runs and not one.
  function readProgram(lines) {
    var seen = { sets: [], shows: [], asks: [], runs: [], consts: {}, starts: {},
                 loopVars: {} };
    var open = [];
    lines.forEach(function (line, at) {
      var inLoop = open.length > 0;
      var m;
      if ((m = /^for\s+([A-Za-z_]\w*)/i.exec(line))) {
        open.push("for");
        seen.loopVars[m[1].toLowerCase()] = true;
      } else if (/^(end\s*for|next)\b/i.test(line)) { open.pop(); }
      else if (/^(do|repeat)$/i.test(line)) { open.push("do"); }
      else if (/^(until|loop)\b/i.test(line)) { open.pop(); }
      else if (/^while\b/i.test(line)) {
        if (open[open.length - 1] === "do") { open.pop(); } else { open.push("while"); }
      } else if (/^end\s*while\b/i.test(line)) { open.pop(); }
      if ((m = /^(declare|constant)\s+\w+\s+([A-Za-z_]\w*)\s*=\s*(.+)$/i.exec(line))) {
        seen.starts[m[2]] = m[3].trim();
        if (/^constant$/i.test(m[1])) { seen.consts[m[2]] = true; }
      } else if ((m = /^(?:set\s+|let\s+)?([A-Za-z_]\w*)\s*(?:=|:=|<-)\s*(.+)$/i.exec(line)) &&
                 !/^(if|else|elseif|while|until|for|case|select|return|call|display|print|output|input|declare|constant)$/i.test(m[1])) {
        seen.sets.push({ v: m[1], expr: m[2].trim(), at: at, inLoop: inLoop });
      } else if ((m = /^(?:display|print|output|write)\s+(.*)$/i.exec(line))) {
        var said = [];
        var names = m[1].replace(/"[^"]*"|'[^']*'/g, function (q) {
          said.push(q.slice(1, -1));
          return " ";
        });
        seen.shows.push({ names: (names.match(/[A-Za-z_]\w*/g) || []), rest: names,
                          said: said, at: at, inLoop: inLoop });
        said.forEach(function (s) {
          s.split(/\s{2,}|[:;,.?!()$=\[\]\/]+|\d+/).forEach(function (run) {
            var words = run.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g);
            if (words) { seen.runs.push(words); }
          });
        });
      } else if ((m = /^(?:input|read|get)\s+([A-Za-z_]\w*)/i.exec(line))) {
        seen.asks.push(m[1]);
      }
    });
    return seen;
  }

  // Whether `name` is shown by a Display at or after line `from`.
  function shownAfter(seen, name, from) {
    var low = name.toLowerCase();
    return seen.shows.some(function (s) {
      return s.at > from && s.names.some(function (n) { return n.toLowerCase() === low; });
    });
  }

  // The words a program prints around one of its own: "Total sales tax:"
  // around tax, "Distance Traveled" around distance, "Income from ticket
  // sales" around income.  Up to two words in front that say which, and
  // one after that says what happened to it (traveled, collected, burned).
  // The phrase printed most often wins; of two printed as often, the longer.
  function printedPhrase(seen, stem) {
    var counts = {}, best = null;
    function count(words) {
      var key = words.join(" ");
      counts[key] = (counts[key] || 0) + 1;
    }
    seen.runs.forEach(function (run) {
      run.forEach(function (w, at) {
        if (!sameStem(w, stem)) { return; }
        for (var from = at; from >= Math.max(0, at - 2); from--) {
          if (from < at && (NAME_JOIN.test(run[from]) || NAME_LEAD.test(run[from]) ||
                            NAME_PLAIN.test(run[from]) || NAME_UNIT.test(run[from]))) { break; }
          count(run.slice(from, at + 1));
          if (/(ed|en)$/.test(run[at + 1] || "") && !NAME_JOIN.test(run[at + 1])) {
            count(run.slice(from, at + 2));
          }
        }
        // income from ticket sales -> ticket sales income
        if (run[at + 1] === "from" && run.length > at + 2) {
          var whose = run.slice(at + 2, at + 5).filter(function (x) { return !NAME_JOIN.test(x); });
          if (whose.length) { count(whose.concat([w])); }
        }
      });
    });
    Object.keys(counts).forEach(function (key) {
      if (!best || counts[key] > counts[best] ||
          counts[key] === counts[best] && key.split(" ").length > best.split(" ").length) {
        best = key;
      }
    });
    return best ? best.split(" ") : null;
  }

  // BMI, spelled out where the program says it: "Your body mass index is".
  function spelledOut(seen, short) {
    var want = short.toLowerCase(), got = null;
    if (want.length < 2 || want.length > 4) { return null; }
    seen.runs.forEach(function (run) {
      for (var at = 0; at + want.length <= run.length; at++) {
        var bit = run.slice(at, at + want.length);
        if (bit.map(function (w) { return w.charAt(0); }).join("") === want) { got = bit; }
      }
    });
    return got;
  }

  // What a value is about: its own name if that says anything, else the
  // constant it starts from (tuition = START_TUITION), else nothing.
  function subjectOf(seen, name) {
    var words = meaningWords(nameWords(name));
    var from = seen.starts[name];
    if (!words.length && from && /^[A-Za-z_]\w*$/.test(from)) {
      words = meaningWords(nameWords(from));
    }
    return words;
  }

  // ---- a value that grows or shrinks by the same rate, round after round --
  // tuition = tuition * (1 + RATE), fee = fee + fee * RISE,
  // value = value * (1 - LOSS), pay = pay * 2, level = level + RISE_PER_YEAR.
  var POPULATION = /^(population|organisms?|bacteria|cells?|colony|rabbits)$/;
  function growthName(seen) {
    for (var s = 0; s < seen.sets.length; s++) {
      var one = seen.sets[s], v = one.v, e = one.expr.replace(/\s+/g, " ").toLowerCase();
      var me = v.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var how = "", m;
      if ((m = new RegExp("^" + me + " ?\\* ?\\( ?1 ?([+-]) ?[^()]+\\)$").exec(e)) ||
          (m = new RegExp("^\\( ?1 ?([+-]) ?[^()]+\\) ?\\* ?" + me + "$").exec(e)) ||
          (m = new RegExp("^" + me + " ?([+-]) ?\\(? ?" + me + " ?\\* ?[^+\\-]+\\)?$").exec(e)) ||
          (m = new RegExp("^" + me + " ?([+-]) ?\\(? ?[^+\\-*]+ ?\\* ?" + me + " ?\\)?$").exec(e))) {
        how = m[1] === "+" ? "rise" : "fall";
      } else if ((m = new RegExp("^" + me + " ?\\* ?(\\d+(?:\\.\\d+)?)$").exec(e))) {
        var k = parseFloat(m[1]);
        how = k === 2 ? "double" : k > 1 ? "rise" : k < 1 && k > 0 ? "fall" : "";
      } else if (one.inLoop && shownAfter(seen, v, one.at - 1) &&
                 (m = new RegExp("^" + me + " ?([+-]) ?([a-z_][a-z0-9_]*|\\d+(?:\\.\\d+)?)$").exec(e))) {
        // A steady step each round: by a constant, or a figure other than 1
        // -- a count going up by one is a counter, not a rise.
        var by = one.expr.replace(/\s+/g, " ").split(/ ?[+-] ?/)[1];
        var steady = seen.consts[by] || (/^\d/.test(by) && parseFloat(by) !== 1);
        if (steady && !seen.loopVars[v.toLowerCase()]) { how = m[1] === "+" ? "rise" : "fall"; }
      }
      if (!how) { continue; }
      var words = subjectOf(seen, v);
      if (!words.length) { continue; }
      if (words.some(function (w) { return POPULATION.test(w); })) { return say("d_pop_growth"); }
      if (how === "rise" && seen.runs.some(function (run) { return run.indexOf("interest") >= 0; })) {
        return say("d_compound");
      }
      // A plain one-word subject the program never prints (level) takes the
      // first thing it does print that could be what it is about (ocean).
      if (words.length === 1 && !seen.runs.some(function (run) {
            return run.some(function (w) { return sameStem(w, words[0]); });
          })) {
        var about = null;
        seen.runs.some(function (run) {
          about = run.filter(function (w) {
            return w.length > 2 && !NAME_JOIN.test(w) && !NAME_PLAIN.test(w) &&
                   !NAME_UNIT.test(w) && !/(ed|en|ing)$/.test(w);
          })[0] || null;
          return !!about;
        });
        if (about) { words = [about].concat(words); }
      }
      return say(how === "double" ? "d_doubling" : how === "rise" ? "d_rise" : "d_fall",
                 { what: titleWords(words) });
    }
    return "";
  }

  // ---- the value it works out and shows ----------------------------------
  // The last thing it works out -- from other values, not from itself --
  // and then shows.  Named as the program prints it (Sales Tax, Kinetic
  // Energy, Distance Traveled, Body Mass Index), or by its own name when
  // that says enough (caloriesBurned, propertyTax); failing both, a single
  // word worked out of a single thing asked for is a conversion: Square
  // Feet to Acres.  Anything less sure than that says nothing, and the
  // rules after this have their turn.
  function resultName(seen) {
    for (var s = seen.sets.length - 1; s >= 0; s--) {
      var one = seen.sets[s], v = one.v;
      var low = v.toLowerCase(), e = one.expr;
      if (new RegExp("\\b" + low + "\\b", "i").test(e)) { continue; }   // grows: not a result
      if (!/[*\/+\-]|\w\s*\(/.test(e) || /^["']/.test(e)) { continue; }  // not worked out
      if (!shownAfter(seen, v, one.at)) { continue; }
      var words = meaningWords(nameWords(v));
      var said = spelledOut(seen, v);      // bmi, as body mass index
      if (said) { return titleWords(said); }
      if (!words.length) { continue; }
      // The noun the phrase is built round: calories in caloriesBurned,
      // tax in stateTax.
      var head = /(ed|en)$/.test(words[words.length - 1]) ? words[0] : words[words.length - 1];
      var printed = printedPhrase(seen, head);
      if (printed && printed.length > 1 && meaningWords(printed).length) {
        return titleWords(printed);
      }
      if (words.length > 1) { return titleWords(words); }
      // One word, from one thing asked for: a conversion.
      var from = seen.asks.filter(function (a) {
        return new RegExp("\\b" + a + "\\b").test(e) && meaningWords(nameWords(a)).length;
      });
      var others = (e.match(/[A-Za-z_]\w*/g) || []).filter(function (n) {
        return !seen.consts[n] && !/^(int|integer|round|sqrt|abs|floor|ceiling|pow)$/i.test(n);
      });
      if (from.length === 1 && others.length === 1) {
        // square feet, units and all: it is what was asked for
        return say("d_to", { from: titleWords(nameWords(from[0]).filter(function (w) {
                               return !NAME_JOIN.test(w);
                             })),
                             to: titleWords(words) });
      }
    }
    // Shown without being kept first -- Display "Shipping charges: $",
    // weight * rate -- the label it is shown under, as far as its first
    // joining word: "Average rainfall per month" is Average Rainfall.
    for (var d = seen.shows.length - 1; d >= 0; d--) {
      var show = seen.shows[d];
      if (!/[*\/+\-]/.test(show.rest) || !show.said.length) { continue; }
      var label = [];
      (show.said[0].toLowerCase().match(/[a-z]+/g) || []).some(function (w) {
        if (NAME_JOIN.test(w) || NAME_UNIT.test(w)) { return label.length > 0; }
        label.push(w);
        return false;
      });
      if (label.length >= 2 && label.length <= 3 && meaningWords(label).length) {
        return titleWords(label);
      }
    }
    return "";
  }

  // ---- a running total of one thing in particular ------------------------
  // total = total + bugs, in a loop: Bugs Collected, if that is what the
  // program prints; the average of it, if it works one out (Average
  // Rainfall); the total of it otherwise.  Only when the thing added up
  // has a name of its own -- a total of n is the rule after this one's.
  function totalName(seen) {
    for (var s = 0; s < seen.sets.length; s++) {
      var one = seen.sets[s], v = one.v;
      if (!one.inLoop) { continue; }
      var me = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var m = new RegExp("^" + me + "\\s*\\+\\s*([A-Za-z_]\\w*)$", "i").exec(one.expr) ||
              new RegExp("^([A-Za-z_]\\w*)\\s*\\+\\s*" + me + "$", "i").exec(one.expr);
      if (!m || seen.loopVars[m[1].toLowerCase()] || seen.consts[m[1]]) { continue; }
      var words = meaningWords(nameWords(v));
      if (!words.length) { words = meaningWords(nameWords(m[1])); }
      if (!words.length) { continue; }
      var stem = words[words.length - 1];
      // What happened to it, if the program says: "Bugs collected on day".
      var done = null;
      seen.runs.some(function (run) {
        var at = run.findIndex(function (x) { return sameStem(x, stem); });
        if (at >= 0 && /(ed|en)$/.test(run[at + 1] || "") && !NAME_JOIN.test(run[at + 1])) {
          done = [run[at], run[at + 1]];
        }
        return !!done;
      });
      if (done) { return titleWords(done); }
      // Printed longer than it is called -- rain printed as rainfall -- it
      // is called what is printed.
      seen.runs.some(function (run) {
        var w = run.filter(function (x) {
          return sameStem(x, stem) && x.length > stem.length + 1;
        })[0];
        if (w) { words = words.slice(0, -1).concat([w]); }
        return !!w;
      });
      var averaged = new RegExp("\\b" + me + "\\s*\\/", "i");
      var avg = seen.sets.some(function (x) { return averaged.test(x.expr); }) ||
                seen.shows.some(function (x) { return averaged.test(x.rest); });
      return say(avg ? "d_average_of" : "d_total_of", { what: titleWords(words) });
    }
    return "";
  }
