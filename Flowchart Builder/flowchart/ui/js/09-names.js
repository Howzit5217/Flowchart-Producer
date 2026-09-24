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
  // and names it by that instead: Leap Year Check.
  //
  // It is a reading of the words, not of the meaning, so it goes from the
  // most particular kind of program to the least, and when nothing
  // particular turns up it names what the program visibly works with --
  // Count from 1 to 5, Age Check, Enter a Number.  Only when there is not
  // even that does it say nothing, and the caller falls back on the first
  // line after all.
  //
  // What it says is a title, not a sentence about the program ("Checks
  // whether a year is a leap year" was one, and read like a note rather
  // than a name).  A program that names itself is not read this way at
  // all: see titleFor, below, which every caller asks.
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
    if (has(/random/) && has(/\bdie\b|\bdice\b|\broll/)) { return said("d_dice"); }
    if (has(/random/) && has(/\bheads\b|\btails\b|\bcoin\b/)) { return said("d_coin"); }
    // I, II, III ... printed one to a choice
    if (seen.shows.filter(function (s) {
          return s.said.some(function (x) { return /^\s*(?:I|II|III|IV|V|VI|VII|VIII|IX|X)\s*$/.test(x); });
        }).length >= 3) {
      return said("d_roman");
    }
    // A value that goes up or down by the same rate or step, round after
    // round: tuition, a population, what a car is worth.
    var grows = growthName(seen);
    if (grows) { return grows; }
    if (has(/\bhours\b/) && has(/\brate\b|gross|overtime/)) { return said("d_pay"); }
    if (has(/\btip\b/) && has(/bill|check|people/)) { return said("d_tip"); }
    if (has(/snack|vending/)) { return said("d_vending"); }
    if (has(/cents/) && has(/div\s+(100|25|10)\b|dimes|quarters|pennies/)) { return said("d_change"); }
    // A price cut by a share of itself: a sale.  Only when it says so -- a
    // price times 0.03 is as likely a commission as a discount.
    if (has(/\bprice\b/) && has(/percent off|% off|discount|\bsale\b/)) { return said("d_shop"); }
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
    if (has(/revers/) && has(/substring|length\s*\(|\bchar|\bletters?\b/)) { return said("d_reverse_text"); }
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
    // A converter that knows Kelvin too goes whichever way it is asked, so
    // it is not called one that goes from Celsius to Fahrenheit.
    if (has(/\*\s*9\s*\/\s*5\s*\+\s*32|fahrenheit|celsius/) && has(/kelvin|273\.15/)) {
      return said("d_temps_any");
    }
    if (has(/\*\s*9\s*\/\s*5\s*\+\s*32|fahrenheit|celsius/)) { return said("d_temps"); }
    if (has(/lowest|smallest/) && has(/highest|largest|biggest/)) { return said("d_minmax"); }
    if (has(/biggest|largest|highest|\bmax\b/)) { return said("d_biggest"); }
    if (has(/\bscores?\b/) && has(/average|total\s*\/|passes/)) { return said("d_scores"); }
    // A running total of something in particular -- bugs, rainfall -- or
    // its average, rather than of "the numbers".
    var adds = totalName(seen) || countName(seen);
    if (adds) { return adds; }
    if (has(/average|\btotal\s*\/\s*\w+/)) { return said("d_average"); }
    if (has(/mod\s+2\s*=\s*0/) && has(/total|sum/)) {
      return count ? said("d_sumevens", { a: count.a, b: count.b }) : said("d_sumevens_any");
    }
    if (has(/mod\s+2/) && has(/even|odd/)) { return said("d_oddeven"); }
    if (has(/\b(\w+)\s*=\s*(\w+)\s*\n\s*\2\s*=\s*(\w+)\s*\n\s*\3\s*=\s*\1\b/)) { return said("d_swap"); }
    if (has(/\bpi\b|3\.14/) && has(/radius|circle|\br\s*\*\s*r\b/)) { return said("d_circle"); }
    if (has(/width\s*\*\s*height|length\s*\*\s*width|\barea\b/)) { return said("d_area"); }
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
    // Two things asked for and their sum shown, and not much besides: any
    // program with two inputs and a plus sign in it anywhere used to be
    // this, a paint job estimator included.
    var sumOfTwo = inputs.length >= 2 && (has(/=\s*add\(/) || lines.some(function (l) {
      var m = /\b([A-Za-z_]\w*)\s*\+\s*([A-Za-z_]\w*)\b/.exec(l);
      return m && inputs.indexOf(m[1]) >= 0 && inputs.indexOf(m[2]) >= 0;
    }));
    if (sumOfTwo && seen.sets.length <= 2 && !looped && !ifs.length) {
      return said("d_add");
    }
    if (has(/hello|welcome|\bhi\b/) && inputs.some(function (v) { return /name/i.test(v); })) {
      return said("d_greet");
    }
    // "The date is magic." / "The date is not magic.": Magic Date.
    var state = stateName(seen);
    if (state) { return state; }

    // ---- what it visibly does, when it is no kind of program in particular ----
    // Said as a title, by what it is about rather than by the code: a
    // program that checks whether age >= 18 is an Age Check.
    var what = inputs.length ? plainNames(inputs) : "";
    if (ifs.length && !looped) {
      return said("d_checks", { what: aboutWhat(ifs[0]) });
    }
    if (loops.length) {
      var one = loops[0];
      return said(one.until ? "d_until" : "d_while", { what: aboutWhat(one.cond) });
    }
    if (count) { return said("d_repeats", { a: count.a, b: count.b }); }
    var own = names.filter(function (n) { return !/^main$/i.test(n); });
    if (own.length) { return said("d_uses", { names: titleWords(nameWords(own[0])) }); }
    // One thing worked out and shown, with a one-word name: Tax Calculator
    // says more than what was asked for does.
    var sole = soleResult(seen);
    if (sole) { return said("d_asks_shows", { what: sole }); }
    if (what) {
      // a calculator of something named; of n and x, only what it asks for
      var shows = /^(?:display|print|output|write)\s+(?!["'])/im.test(lines.join("\n")) &&
                  !inputs.every(function (v) { return v.length === 1; });
      return said(shows ? "d_asks_shows" : "d_asks", { what: what });
    }
    return "";
  }

  // "a and b" -> "two numbers"; "miles, gallons" -> "miles and gallons"
  function plainNames(vars) {
    var seen = [];
    vars.forEach(function (v) { if (seen.indexOf(v) < 0) { seen.push(v); } });
    if (seen.every(function (v) { return v.length === 1; })) {     // n, a and b ...
      return say(seen.length === 1 ? "d_one" : seen.length === 2 ? "d_two"
                 : seen.length === 3 ? "d_three" : "d_numbers", { n: seen.length });
    }
    var some = seen.slice(0, 3).map(spaced);
    return some.length > 1
      ? some.slice(0, -1).join(", ") + " " + said("d_and") + " " + some[some.length - 1]
      : some[0];
    function said(key) { return TXT[key] || "and"; }
  }

  // What a test or a loop is about, for its title: the first thing named in
  // it that says anything (age in "age >= 18", speed in "speed > limit"),
  // or plainly a number where it is all n and x.
  function aboutWhat(cond) {
    var names = String(cond || "").replace(/"[^"]*"|'[^']*'/g, " ")
      .match(/[A-Za-z_]\w*/g) || [];
    for (var i = 0; i < names.length; i++) {
      if (/^(and|or|not|mod|div|true|false|then|do|is|to)$/i.test(names[i])) { continue; }
      var words = meaningWords(nameWords(names[i]));
      if (words.length) { return titleWords(words); }
    }
    // nothing but plain names: a plain word will do (Month Check), n will not
    for (i = 0; i < names.length; i++) {
      if (names[i].length >= 3 && !/^(and|or|not|mod|div|true|false|then|num|val|var|tmp|temp|flag|idx)$/i.test(names[i])) {
        return titleWords(nameWords(names[i]));
      }
    }
    return TXT.d_number || "Number";
  }

  // Word-count, not words-count: the one of a plain plural.
  function singular(w) {
    w = String(w || "");
    if (/ies$/.test(w)) { return w.slice(0, -3) + "y"; }
    if (/(ss|us|is)$/.test(w) || w.length < 4) { return w; }
    return w.replace(/s$/, "");
  }

  // ---- a yes-or-no the program says in so many words ----------------------
  // "The date is magic." and "The date is not magic." -- printed either
  // side of one decision -- say what the program decides: Magic Date.
  function stateName(seen) {
    var said = {};
    var found = "";
    seen.shows.forEach(function (s) {
      s.said.forEach(function (x) {
        var m = /^\s*(?:the\s+|your\s+|this\s+)?([a-z]+(?:\s[a-z]+)?)\s+(?:is|are)\s+(not\s+)?(?:a\s+|an\s+)?([a-z]+)[\s.!]*$/i.exec(x);
        if (!m) { return; }
        var key = (m[1] + "|" + m[3]).toLowerCase();
        said[key] = (said[key] || 0) | (m[2] ? 2 : 1);
        if (said[key] === 3 && !found) {
          found = titleWords([m[3].toLowerCase()].concat(m[1].toLowerCase().split(" ")));
        }
      });
    });
    return found;
  }

  // The last value worked out and then shown, by a name of its own however
  // short: tax, fine.  For when nothing surer can be said.
  function soleResult(seen) {
    for (var s = seen.sets.length - 1; s >= 0; s--) {
      var one = seen.sets[s];
      if (new RegExp("\\b" + one.v + "\\b", "i").test(one.expr)) { continue; }
      if (!/[*\/+\-]/.test(one.expr) || !shownAfter(seen, one.v, one.at)) { continue; }
      var words = meaningWords(nameWords(one.v));
      if (words.length) { return titleWords(words); }
    }
    return "";
  }

  // ---- a count of one thing --------------------------------------------
  // words = words + 1, in a loop, and shown afterwards as "Number of
  // words": Word Count.
  function countName(seen) {
    for (var s = 0; s < seen.sets.length; s++) {
      var one = seen.sets[s];
      if (!one.inLoop || !new RegExp("^" + one.v + "\\s*\\+\\s*1$", "i").test(one.expr)) { continue; }
      var label = labelOf(seen, one.v, one.at);
      if (label && label.count) { return say("d_count_of", { what: titleWords(label.count) }); }
    }
    return "";
  }

  // The words a value is shown under, where the program shows it: "Your
  // average test score is " before average is Average Test Score, and
  // "Number of words:" before words is a count of words.  Up to the first
  // joining word, and only what could be a title: two to four words, or a
  // number of something.
  function labelOf(seen, name, from) {
    var low = name.toLowerCase();
    for (var d = 0; d < seen.shows.length; d++) {
      var show = seen.shows[d];
      if (show.at < from || !show.said.length ||
          !show.names.some(function (n) { return n.toLowerCase() === low; })) { continue; }
      var words = show.said[0].toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
      var of = /^(?:the\s+)?(?:number|count)\s+of\s+([a-z]+)/.exec(words.join(" "));
      if (of) { return { count: [singular(of[1])] }; }
      var label = [];
      words.some(function (w) {
        if (NAME_JOIN.test(w) || NAME_UNIT.test(w)) { return label.length > 0; }
        label.push(w);
        return false;
      });
      // and it has to be a label for this: "Occupancy rate" for rate, but
      // not "A day's worth" for average
      var own = nameWords(name);
      var names = own.length && label.some(function (w) {
        return sameStem(w, own[own.length - 1]) || sameStem(w, own[0]);
      });
      if (names && label.length >= 2 && label.length <= 4 && meaningWords(label).length) {
        return { words: label };
      }
    }
    return null;
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
  // what else one thing is converted into
  var CONVERT_UNIT = /^(acres?|hectares?|celsius|fahrenheit|kelvin|kilometers?|km|miles?|meters?|feet|inches|yards?|liters?|gallons?|pounds?|kilograms?|ounces?|grams?|bytes?|kilobytes?|megabytes?|gigabytes?|euros?|pesos?|yen|pounds?|hours?|minutes?|seconds?|days?|weeks?|years?)$/;

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
        // income from ticket sales -> ticket sales income; and the total
        // cost of the paint job -> paint job cost, the area of the circle
        // -> circle area
        if ((run[at + 1] === "from" || run[at + 1] === "of") && run.length > at + 2) {
          var whose = [];
          run.slice(at + 2, at + 6).some(function (x) {
            if (/^(the|a|an|your|this|each|every)$/.test(x) && !whose.length) { return false; }
            if (NAME_JOIN.test(x) || /ed$/.test(x)) { return true; }
            whose.push(x);
            return whose.length >= 3;
          });
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
      // mpg = miles / gallons: its name is the first letters of what it is
      var ratio = /^\(?\s*([A-Za-z_]\w*)\s*\/\s*([A-Za-z_]\w*)\s*\)?$/.exec(e);
      if (ratio) {
        var top = nameWords(ratio[1]), under = nameWords(ratio[2]);
        if (top.length && under.length &&
            low === top[0].charAt(0) + "p" + under[0].charAt(0)) {
          return say("d_per", { a: titleWords(top), b: titleWords(under.map(singular)) });
        }
      }
      // A name that says nothing (average, rate, total) is called what it
      // is shown as: "Occupancy rate:", "Your average test score is".
      var shownAs = labelOf(seen, v, one.at);
      if (!words.length) {
        if (shownAs && shownAs.words) { return titleWords(shownAs.words); }
        continue;
      }
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
      // A conversion only where one side is a unit: square feet to acres,
      // but not sales to profit, which is a profit.
      var fromWords = from.length ? nameWords(from[0]) : [];
      if (from.length === 1 && others.length === 1 &&
          fromWords.concat(words).some(function (w) { return NAME_UNIT.test(w) || CONVERT_UNIT.test(w); })) {
        // square feet, units and all: it is what was asked for
        return say("d_to", { from: titleWords(fromWords.filter(function (w) {
                               return !NAME_JOIN.test(w);
                             })),
                             to: titleWords(words) });
      }
      if (shownAs && shownAs.words) { return titleWords(shownAs.words); }
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

  // ---- a name written the way a file has to be, made into a title ----------
  // A file is called tuition_increase.txt, salesTax.txt or BMI-CALC.txt
  // because a file name cannot have much else in it, and a program is headed
  // // sales_tax for the same reason.  As a title that is Tuition Increase,
  // Sales Tax, BMI Calc: the joins made spaces, the words given capitals,
  // and "(2)", "- Copy" and "Copy of" -- which say it was copied, not what
  // it is -- left off.  A name somebody wrote out with care (Sales tax for
  // 2026, iPhone Prices) keeps the capitals they gave it.
  var NAME_SMALL = /^(a|an|and|as|at|by|for|from|in|into|of|on|or|per|the|to|vs|with)$/;
  var NAME_CAPS = /^(bmi|gpa|gcd|lcm|atm|id|pin|cpu|gpu|mph|kph|mpg|usa|uk|hw|cs|cis|csc|cse|io|ui|pc|tv|faq|diy|ok|rgb|html|css|sql|url|api|pdf|gps|dna|vat)$/;

  function tidyName(s) {
    s = String(s || "").replace(/\s+/g, " ").trim()
      .replace(/\.(txt|text|md|rtf|docx?|odt|pdf|json|pseudo|psc|pcode|fprg|flo|flow|html?|py|js|java|cpp|c|cs|vb|bas)$/i, "")
      .replace(/^copy of /i, "").replace(/( ?- ?copy)?( ?\(\d+\))?$/i, "").trim();
    var joined = !/ /.test(s) || /_/.test(s);        // written as a file or a variable is
    if (joined) {
      s = s.replace(/[_+]+/g, " ")
        // sales-tax, sales.tax -- but Program 3-1 and 2.5 are left whole
        .replace(/[.\-]+/g, function (m, at, all) {
          return /\d/.test(all.charAt(at - 1)) && /\d/.test(all.charAt(at + m.length)) ? m : " ";
        })
        .replace(/([a-z])([A-Z])/g, "$1 $2")          // salesTax
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")    // BMICalc
        .replace(/([A-Za-z]{2,})(\d)/g, "$1 $2")      // lab3, but not q4
        .replace(/(\d)(?!(?:st|nd|rd|th)(?![A-Za-z]))([A-Za-z]{2,})/g, "$1 $2")
        .replace(/\s+/g, " ").trim();
      // shipping_charges_v2, tax_final: which copy it is, not what
      var bare = s.replace(/(?: (?:v|ver|version|rev) ?\d+(?:\.\d+)*| final| draft| backup| bak| old)+$/i, "");
      if (bare) { s = bare; }
    }
    var shout = !/[a-z]/.test(s);                   // SALES_TAX
    // Not cut short here: asTitle does that, after a whole word.
    if (!joined && !shout && /[A-Z]/.test(s)) { return s; }
    return s.split(" ").map(function (w, n) {
      if (shout) { w = w.toLowerCase(); }
      if (w !== w.toLowerCase()) { return w; }     // BMI, iPhone: as it was written
      if (NAME_CAPS.test(w)) { return w.toUpperCase(); }
      if (n && NAME_SMALL.test(w)) { return w; }
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  }

  // How much a name says about the program.  0: nothing -- it is the name
  // a file gets when nobody names it (Untitled, New Text Document, test).
  // 1: which piece of work it is, not what it does (HW 3, Lab 2 Part B,
  // Chapter 5 Exercise 7, My Program).  2: something (Tuition Increase).
  var NAME_NOBODY = /^(untitled|unnamed|new|text|document|doc|file|program|prog|pseudocode|pseudo|code|flowchart|flow|chart|copy|draft|final|test|testing|temp|tmp|\d+|[a-z])$/;
  var NAME_LABEL = /^(hw|homework|lab|labs|assignment|assign|asgn|asg|project|proj|exercise|exercises|ex|exer|problem|problems|prob|question|q|part|pt|chapter|chap|ch|unit|lesson|week|wk|module|mod|activity|task|quiz|exam|midterm|practice|sample|example|my|the|of|a|and|no|num|number|set|section|sec|period|v|ver|version|rev|main|cs|cis|csc|cse|cop|programming|challenge|\d+[a-z]|[a-z]\d+|\d+(st|nd|rd|th))$/;

  function nameWorth(s) {
    var words = String(s || "").toLowerCase().match(/[a-z0-9]+/g) || [];
    if (words.every(function (w) { return NAME_NOBODY.test(w); })) { return 0; }
    return words.every(function (w) {
      return NAME_NOBODY.test(w) || NAME_LABEL.test(w);
    }) ? 1 : 2;
  }

  // ---- the title the program gives itself --------------------------------
  // Where a program is called something in so many words, that is its name,
  // and it was being missed more often than found.  A title is written down
  // a good many ways, and all of these say one:
  //
  //   // Program: Paint Job Estimator          // Program Title: Test Average
  //   // Assignment: Test Average             // Title: kinetic_energy
  //   // Programming Exercise 7: Paint Job Estimator
  //   // Chapter 3, Exercise 5 - Sales Tax    // Lab 4: Miles Per Gallon
  //   // Tuition Increase - Chapter 4, Exercise 12
  //   // Sales Tax Calculator.                /* * Program: Rainfall */
  //   Program TuitionCalculator              Algorithm: Find the Largest Number
  //   Start Sales Tax Program                Display "*** Ocean Levels ***"
  //   Display "Welcome to the Paint Job Estimator!"
  //
  // -- a comment near the top naming it outright, or labeled as the piece of
  // work it is with its name beside the label; a first line that names the
  // program; or a first Display that is a banner rather than a question.
  // What is not a name is passed over: who wrote it and when ("Name: Pat
  // Lee", "Date: 9/24", "Class: CS 101"), the steps of it ("Declare
  // variables", "Get the input"), and which piece of work it is when that
  // is all it says ("Chapter 5, Exercise 7").  "This program calculates the
  // area of a circle" says what it does, and is made a name from that --
  // Area of a Circle -- when a name can be made of it (purposeTitle).
  var NOTE_NAMED = /^(?:(?:program|project|app|application)\s+)?title$|^(?:program|project|app|application)\s+name$|^name\s+of\s+(?:the\s+)?(?:program|project|app)$|^(?:program|project|algorithm|app|application|file|file\s?name)$/i;
  var NOTE_META = /^(?:authors?|by|written\s+by|made\s+by|name|student|student\s+name|your\s+name|date|due|due\s+date|created|modified|updated|last\s+(?:modified|updated)|class|course|section|period|instructor|teacher|professor|email|e-mail|version|id|student\s+id|school|semester|term|copyright|license|inputs?|outputs?|process|processing|variables?|constants?|notes?|todo|pseudocode|language|tested|status)$/i;
  var NOTE_PURPOSE = /^(?:purpose|description|summary|about|goal|objective|overview|what\s+it\s+does|does)$/i;
  var NOTE_SPLIT = /\s*:\s*|\s+[-–—]{1,2}\s+|\s*\|\s*/;
  var NOTE_THIS = /^(?:(?:this|the|my)\s+(?:program|module|script|code|flowchart|pseudocode|algorithm|app)\s+(?:(?:will|should|is used to|is going to|is meant to|is designed to|is supposed to)\s+)?|(?:a\s+)?(?:program|module|script|flowchart|pseudocode|algorithm)\s+(?:to|that|which)\s+)(?:(?:lets?|allows?|helps?)\s+(?:the\s+)?user\s+(?:to\s+)?)?(?=[a-z])/i;
  var NOTE_STEP = /^(declare|declaring|declarations?|variables?|vars?|constants?|named|local|global|globals|initiali[sz]e|initiali[sz]ation|init|setup|get|read|input|inputs|prompt|display|print|output|outputs|show|set|call|main|start|begin|end|stop|return|loop|step|todo|note|notes|header|comments?)\b/i;
  var NOTE_DOES = /^(calculates?|computes?|determines?|finds?|works?|converts?|checks?|counts?|adds?|sums?|asks?|repeats?|keeps?|updates?|increases?|decreases?|figures?|shows?|displays?|prints?|reads?|gets?|lets?|allows?|uses?|tells?|takes?|makes?|plays?|simulates?|generates?|sorts?|searches?|tracks?|lists?|compares?|decides?|estimates?|predicts?|prompts?|accepts?)\b/i;

  // One comment, read: { text, heading } -- a heading being a name it
  // was given, the rest what it says it does -- or null for neither.
  // `labeled`: what is left once "Program:" or the like has been read off.
  function noteTitle(s, labeled) {
    s = String(s || "").replace(/^[\s*=#~_+\-\/|<>]+|[\s*=#~_+\-\/|<>]+$/g, "");
    if (!s) { return null; }
    var parts = s.split(NOTE_SPLIT).filter(function (p) { return p.trim(); });
    if (parts.length > 1) {
      var label = parts[0].trim(), rest = s.slice(s.indexOf(parts[1], label.length)).trim();
      if (NOTE_NAMED.test(label)) { return noteTitle(rest, true); }
      if (NOTE_META.test(label)) { return null; }        // who, when, for which class
      if (NOTE_PURPOSE.test(label)) { return aboutNote(rest); }
      // which piece of work it is, and then its name, as many labels deep
      // as it goes: Programming Exercise 7: Paint Job Estimator; CS 101 -
      // Homework 3 - Grade Average
      if (nameWorth(label) <= 1) {
        var named = parts.slice(1).filter(function (p) { return nameWorth(p) === 2; })[0];
        return named ? headingOf(named, true) : null;
      }
      // its name, and then which piece of work it is, or a word more about
      // it: Tuition Increase - Chapter 4; Calories Burned -- treadmill
      var first = headingOf(label, labeled);
      if (first) { return first; }
    }
    if (labeled) { return headingOf(s, true); }
    if (NOTE_THIS.test(s)) { return aboutNote(s); }
    if (NOTE_STEP.test(s)) { return null; }        // a step of it, not its name
    if (NOTE_DOES.test(s)) { return aboutNote(s); }
    return headingOf(s) || (nameWorth(s) === 2 ? aboutNote(s) : null);
  }

  // A name, if this reads as one: not a sentence, not a step of the program,
  // short -- a line in capitals Like This may run to eight words -- and
  // saying something.  `named` is when it was labeled as the name, which is
  // taken at its word as far as that goes.
  function headingOf(s, named) {
    s = String(s || "").replace(/^[\s*=#~_+\-|<>"'“”]+|[\s*=#~_+\-|<>"'“”]+$/g, "");
    if (!named) {
      // "Flowchart for tuition" is a heading for Tuition
      s = s.replace(/^(?:(?:the|a|my)\s+)?(?:flowchart|pseudocode|program|algorithm|code)\s+(?:for|of)\s+(?:(?:a|an|the)\s+)?(?=\S)/i, "");
    }
    if (/^[^.?!;]+\.$/.test(s)) { s = s.slice(0, -1); }   // every line ends in a full stop
    if (!s || /[.?!;](?=\s|$)/.test(s)) { return null; }  // a sentence, or two
    var words = s.split(/\s+/);
    var major = words.filter(function (w) { return !TITLE_SMALL.test(w.toLowerCase()); });
    var capped = major.filter(function (w) { return /^[A-Z0-9]/.test(w); });
    if (words.length > (named ? 10 : capped.length === major.length ? 8 : 6)) { return null; }
    if (!named && (NOTE_STEP.test(s) || NOTE_DOES.test(s))) { return null; }
    var t = tidyName(s);
    return nameWorth(t) === 2 ? { text: t, heading: true } : null;
  }

  // What a comment says the program does, as far as its first full stop.
  function aboutNote(s) {
    s = String(s).replace(NOTE_THIS, "");
    s = s.split(/[.;!?](?:\s|$)/)[0].replace(/[\s.:,;!?\-]+$/, "").trim();
    return s ? { text: s, heading: false } : null;
  }

  // A first line that names the program: Program TuitionCalculator,
  // Algorithm: Find the Largest Number, Title: Sales Tax, Start Sales Tax
  // Program.  (Start or Begin on its own, or Start Program, is the Start.)
  var LINE_NAMED = /^(?:program|algorithm|title|project|application|app)\s*[:\-–—]?\s+(.+?)\s*$/i;
  var LINE_STARTS = /^(?:start|begin)\s+(?!program\s*$)(?:the\s+)?(.+?)\s*$/i;

  // A first Display that is a banner, not something being said to someone:
  // "Tuition Calculator", "*** Ocean Levels ***", "Welcome to the Paint Job
  // Estimator!".  Not a question or a prompt, not "Hello world", not a
  // label with an answer to follow; in capitals, or boxed in, or welcoming.
  function bannerTitle(text) {
    var s = String(text || "").trim();
    var boxed = /^[*=#~_\-–—|<>+]{2,}|[*=#~_\-–—|<>+]{2,}$/.test(s);
    s = s.replace(/^[\s*=#~_\-–—|<>+]+|[\s*=#~_\-–—|<>+]+$/g, "");
    var welcome = /^welcome\s+to\s+(?:the\s+)?(.+?)[\s!.]*$/i.exec(s);
    if (welcome) { s = welcome[1]; }
    s = s.replace(/[\s!.]+$/, "");
    if (!s || /[?:,]$/.test(s) || /[.?!]\s/.test(s)) { return ""; }
    if (/^(enter|type|input|please|what|how|who|where|when|which|why|would|do|does|did|is|are|can|press|choose|select|pick|give|tell|hello|hi|hey|goodbye|bye|thank|thanks|the|your|you|this|that|here|result|results|done|error|invalid|total|answer|no|yes|ok|okay|good|great|sorry)\b/i.test(s)) {
      return "";
    }
    var words = s.split(/\s+/);
    if (words.length > 6) { return ""; }
    var major = words.filter(function (w) { return !TITLE_SMALL.test(w.toLowerCase()); });
    var capped = major.filter(function (w) { return /^[A-Z0-9]/.test(w); });
    var shouting = /[A-Z]{2}/.test(s) && !/[a-z]/.test(s);
    if (!(boxed || welcome || shouting || (major.length > 1 && capped.length === major.length))) {
      return "";
    }
    var t = tidyName(s);
    return nameWorth(t) === 2 ? t : "";
  }

  // The top of a program, read for a name: the one it gives itself, if it
  // gives one (heading); what its comments say it does (about); and the
  // first thing it shows (said).  Only comments above the first Display
  // count -- one further down is about that part of it, not the whole --
  // and a /* block */ is read line by line like the rest.
  function topNotes(code) {
    var lines = String(code || "").slice(0, 4000).split("\n");
    var got = { heading: "", about: "", said: "" };
    var inBlock = false, statements = 0, asked = false;
    for (var i = 0; i < lines.length && i < 60; i++) {
      var line = lines[i].trim(), text = null;
      var block = inBlock ? line : /^\/\*/.test(line) ? line.slice(2) : null;
      if (block !== null) {
        inBlock = block.indexOf("*/") < 0;
        text = block.replace(/\*\/[\s\S]*$/, "").replace(/^[\s*]+/, "");
      } else if (/^\/\//.test(line)) {
        text = line.replace(/^\/+\s*/, "");
      }
      if (text !== null) {
        if (got.said || !text) { continue; }
        var one = noteTitle(text);
        if (one && one.heading) { got.heading = one.text; return got; }
        if (one && !got.about) { got.about = one.text; }
        continue;
      }
      var bare = line.replace(/^#+\s*/, "").replace(/\s*(?:\/\/|#).*$/, "");
      if (!bare) { continue; }
      if (++statements === 1) {
        var named = LINE_NAMED.exec(bare), starts = !named && LINE_STARTS.exec(bare);
        var own = named ? headingOf(named[1], true) : starts ? headingOf(starts[1]) : null;
        if (own) { got.heading = own.text; return got; }
      }
      if (/^(?:input|read|get)\b/i.test(bare)) { asked = true; }
      if (!got.said) {
        var put = /^(?:display|print|output|write)\b\s*(["'])(.*?)\1/i.exec(bare);
        if (put && put[2].trim()) {
          got.said = put[2];
          // "This program converts miles to kilometers." said on the screen
          // is said of it as much as in a comment
          if (!got.about && NOTE_THIS.test(put[2].trim())) {
            var told = aboutNote(put[2].trim());
            if (told) { got.about = told.text; }
          }
          // a banner is the whole of its line, before anything is asked
          if (!asked && /^(?:display|print|output|write)\b\s*(["']).*\1\s*$/i.test(bare)) {
            var banner = bannerTitle(put[2]);
            if (banner) { got.heading = banner; return got; }
          }
        }
      }
    }
    return got;
  }

  // ---- what a comment says it does, as a name ----------------------------
  // "This program calculates the area of a circle" is Area of a Circle;
  // "Determines whether a number is even or odd", Even or Odd; "Convert
  // celsius to fahrenheit", Celsius to Fahrenheit.  The clause that works
  // something out is taken before one that only asks or shows, and what it
  // works out is the name, as far as the words that only say how or when
  // (for the next five years, based on, entered by the user).  Where no
  // short name comes of it, nothing is said and the program is read instead.
  // Only English is read this way; a comment in another language is used as
  // it was written, if at all.
  var PURPOSE_VERB = /^(?:calculates?|calculating|computes?|works?\s+out|figures?\s+out|determines?|finds?|converts?|counts?|totals?|averages?|estimates?|predicts?|simulates?|generates?|checks?|tests?|decides?|reverses?|sorts?|searches?\s+for|searches?|tracks?|keeps?\s+track\s+of|plays?|draws?|creates?|makes?|builds?|displays?|shows?|prints?|outputs?|lists?|gets?|reads?|asks?\s+(?:the\s+user\s+)?for|prompts?\s+(?:the\s+user\s+)?for)\s+/i;
  var PURPOSE_ONLY_SAYS = /^(?:displays?|shows?|prints?|outputs?|lists?|gets?|reads?|asks?|prompts?)\b/i;
  var PURPOSE_HOW = /\s+(?:for\s+(?:the\s+next|each|every|all|any)|based\s+on|given|using|with\s+the|that|which|who|when|if|entered|input|typed|from\s+the\s+user|by\s+the\s+user|so|in\s+order|to\s+the\s+(?:screen|user)|on\s+(?:the\s+)?screen)\b.*$/i;
  var PURPOSE_THEN = /\s*(?:;|,\s*then|,?\s+and(?:\s+then)?)\s+(?=(?:calculat|comput|work|figur|determin|find|convert|count|total|averag|estimat|predict|simulat|generat|check|test|decid|revers|sort|search|track|keep|play|draw|creat|mak|build|display|show|print|output|list|get|read|ask|prompt)\w*\s)/i;

  function purposeTitle(sentence) {
    var s = String(sentence || "").replace(NOTE_THIS, "").trim();
    var best = "";
    s.split(PURPOSE_THEN).forEach(function (clause) {
      if (!PURPOSE_VERB.test(clause)) { return; }
      if (!best || (PURPOSE_ONLY_SAYS.test(best) && !PURPOSE_ONLY_SAYS.test(clause))) { best = clause; }
    });
    if (!best) { return ""; }
    var what = best.replace(PURPOSE_VERB, "");
    // whether a year is a leap year: Leap Year; whether a number is prime:
    // Prime Number
    var whether = /^(?:whether|if)\s+(?:(?:a|an|the|your|their)\s+)?(.+?)\s+(?:is|are)\s+(?:(?:a|an|the)\s+)?(.+)$/i.exec(what);
    if (whether) {
      var state = whether[2].replace(PURPOSE_HOW, "").replace(/[\s.,;:!?]+$/, "");
      what = state.split(/\s+/).length === 1 ? state + " " + whether[1] : state;
    } else if (/^(?:how|what|when|where|why|who)\b/i.test(what)) {
      return "";
    }
    what = what.replace(PURPOSE_HOW, "")
      .replace(/^(?:(?:the|a|an|your|their|its|his|her|some|each|every)\s+)+/i, "")
      .replace(/^(?:user'?s?|user’s)\s+/i, "")
      .replace(/[\s.,;:!?]+$/, "");
    var count = /^(?:the\s+)?number\s+of\s+([a-z]+)/i.exec(what);   // Word Count
    if (count) { what = singular(count[1]) + " count"; }
    if (!what || what.split(/\s+/).length > 6 || nameWorth(what) < 2) { return ""; }
    return what;
  }

  // ---- a title, written as one -------------------------------------------
  // However a name was come by -- a comment, a file, a rule about what the
  // program does -- it is written out the one way: without the quotes and
  // the boxing and the full stop it came with, and in English in title
  // case (Area of a Circle, Miles per Gallon), where the other languages
  // give a title a capital only at the start.  What is code is left alone
  // (age >= 18, calculateTax()), and so is a word with capitals of its own
  // (BMI, iPhone).  A long one is cut after a whole word.
  var TITLE_SMALL = /^(a|an|and|as|at|but|by|for|from|in|into|nor|of|off|on|onto|or|per|the|to|vs|via|with)$/;
  function asTitle(s) {
    s = String(s || "").replace(/\s+/g, " ").trim()
      .replace(/^["'“”‘’`*=#~_|<>\s-]+|["'“”‘’`*=#~_|<>\s-]+$/g, "")
      .replace(/[\s.,;:!]+$/, "");
    if (!s) { return ""; }
    if ((typeof LANG === "string" ? LANG : "en") === "en") {
      var words = s.split(" ");
      s = words.map(function (w, n) {
        var bare = w.replace(/[,;:]+$/, "");
        // a small word is small wherever it stands but first and last,
        // however it was typed: Miles per Gallon, Tax and Commission
        if (n && n < words.length - 1 && /^[A-Z][a-z]+$/.test(bare) &&
            TITLE_SMALL.test(bare.toLowerCase())) { return w.toLowerCase(); }
        if (!/^[a-z][a-z'’\-]*$/.test(bare)) { return w; }
        if (NAME_CAPS.test(bare)) { return w.toUpperCase(); }
        if (n && n < words.length - 1 && TITLE_SMALL.test(bare)) { return w; }
        return w.replace(/(^|-)([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
      }).join(" ");
    } else {
      s = s.charAt(0).toUpperCase() + s.slice(1);
    }
    if (s.length > 56) {
      var cut = s.slice(0, 55), at = cut.lastIndexOf(" ");
      s = (at > 28 ? cut.slice(0, at) : cut).replace(/[\s,;:\-–—]+$/, "") + "…";
    }
    return s;
  }

  // The name for a program nobody has named: the one it gives itself; else
  // what its comments say it does, made a name; else what it is read to do
  // (describeProgram); else what the comments say, as they say it; else the
  // first thing it shows.  Always a title, or "" when there is nothing at all.
  function titleFor(code) {
    var notes = topNotes(code);
    return asTitle(notes.heading || purposeTitle(notes.about) || describeProgram(code) ||
                   notes.about || notes.said || "");
  }

  // What a program opened from a file is called: what the file is called,
  // made into a title, when that says something about it.  Not when the
  // program heads itself with a name of its own -- that is the better
  // name -- and not when the file's name only says which piece of work it
  // is (hw3.txt, Lab 2 Part B.txt) or nothing at all (New Text Document):
  // then "" is said, and the program is called what it says it is or what
  // it does, read afresh at every drawing (fillTitle, 09-build.js).  Only
  // when the program gives nothing to go on is "Lab 2" better than that.
  function fileTitle(file, code) {
    var called = tidyName(String(file || "").replace(/\.[A-Za-z][A-Za-z0-9]{0,7}$/, ""));
    var notes = topNotes(code);
    if (notes.heading) { return ""; }
    var worth = nameWorth(called);
    if (worth === 2) { return asTitle(called); }
    if (!worth || notes.about || notes.said || describeProgram(code)) { return ""; }
    return asTitle(called);
  }
