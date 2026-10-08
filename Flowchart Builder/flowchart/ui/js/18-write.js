// ---------------------------------------------------------------------------
//  18-write.js -- the writer, which knows no language by name
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ============================================================ the writer ==
  // 18-ahead.js has read the program through and knows what every name is.
  // 18-code.js knows what each language does about it.  This walks the
  // program and asks the one about the other, a statement at a time.

  function quoted(text) {                // words, as every language here quotes them
    return '"' + String(text).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }

  // What a Case asks of what was picked: that it is the Case's one value --
  // or, where it names several (2, 3) or a run of them (1 TO 5: see
  // choice_pieces, parse/data.py), any one of those.
  function caseTest(subject, one) {
    if (!one.any) { return { op: "=", left: subject, right: tree(one.match) }; }
    var test = null;
    one.any.forEach(function (piece) {
      var t = piece.is !== undefined
        ? { op: "=", left: subject, right: tree(piece.is) }
        : { op: "and", left: { op: "<=", left: tree(piece.from), right: subject },
            right: { op: "<=", left: subject, right: tree(piece.to) } };
      test = test ? { op: "or", left: test, right: t } : t;
    });
    return test;
  }

  // A record the program laid out field by field (TYPE, RECORD: see
  // 18-ahead.js), by its name, or null.
  function laidRecord(prog, kind) {
    var rec = prog && prog.records && prog.records[kind];
    if (!rec && prog && prog.records) {
      var low = lowered(kind);
      Object.keys(prog.records).forEach(function (k) { if (lowered(k) === low) { rec = prog.records[k]; } });
    }
    return rec && rec.laid ? rec : null;
  }

  // The values handed to one -- New Car("Ford", 1.8) -- each fitted to the
  // field it goes into, in the order the fields were written.
  function recordArgs(node, w) {
    if (!node.args || !node.args.length) { return null; }
    var rec = laidRecord(w.prog, node.record);
    return node.args.map(function (a, i) {
      var f = rec && rec.fields[rec.laid[i]];
      return f && f.kind ? w.fitIn(a, f.kind) : asCode(a, w);
    });
  }

  // An expression, written out.  The kinds are what make it more than a
  // change of spelling: 7 / 2 is three and a half in the chart, so where
  // both sides are whole numbers a language that would make it three is
  // told not to; two Strings are compared with equals() where == would
  // compare something else; a number joined to words is made into words
  // first where the language will not do that for itself.
  function asCode(node, w, want) {
    var L = w.L;
    if (node.lit !== undefined) {
      // a whole number past what an int holds: Java wants it said to be a long
      if (L.longSuffix && /^-?\d+$/.test(node.lit) && Math.abs(Number(node.lit)) > 2147483647) { return node.lit + L.longSuffix; }
      return node.lit;
    }
    if (node.str !== undefined) { return quoted(node.str); }
    if (node.bool !== undefined) { return node.bool ? L.yes : L.no; }
    if (node.name && !node.field) {
      // NewLine, Tab and Infinity, where no name of the program's is called that
      if (!w.entry(node.name) && /^(newline|tab|infinity)$/i.test(node.name) &&
          !w.prog.byName[lowered(node.name)]) {
        return L.constant(lowered(node.name), w);
      }
      // a built-in handed over to be called: sorted(words, length)
      if (!w.entry(node.name) && !w.prog.byName[lowered(node.name)] && L.lists[lowered(node.name)] &&
          (holds(BUILT_KIND, lowered(node.name)) || builtKind(lowered(node.name), []) !== null)) {
        var low0 = lowered(node.name);
        if (L.builtRef && L.builtRef[low0]) { return L.builtRef[low0]; }
        var v0 = L.lambdaName || "v";
        return L.lambda(v0, w.calling({ call: node.name, args: [{ name: v0 }] }));
      }
      // a module handed over to be called: sort(people, byAge)
      if (!w.entry(node.name) && w.prog.byName[lowered(node.name)]) {
        return L.fnRef(w.called(w.prog.byName[lowered(node.name)]), w.prog.byName[lowered(node.name)], w);
      }
      return w.named(node.name);
    }
    // A list or a table written where what it is going into is known is
    // written as one of those: [] into a list of words is a list of words.
    if (node.list) {
      var lk = isListKind(want) ? want : w.kind(node);
      w.nest = (w.nest || 0) + 1;
      var items = node.list.map(function (one) { return w.fitIn(one, elemOf(lk)); });
      w.nest--;
      if (node.tuple && L.tupleOf) { return L.tupleOf(items, lk, w); }
      return L.listOf(items, lk, w);
    }
    if (node.table) {
      var kk = isTableKind(want) ? want : w.kind(node);
      w.nest = (w.nest || 0) + 1;
      var pairs = node.table.map(function (pair) {
        return [asCode(pair[0], w), w.fitIn(pair[1], tableValue(kk))];
      });
      w.nest--;
      return L.tableOf(pairs, kk, w);
    }
    if (node.record) { return L.newRecord(node.record, w, recordArgs(node, w)); }
    if (node.index) {
      var holder = w.kind(node.index), at = asCode(node.at, w);
      if (L.bigInt && L.narrow && w.isWide(node.at)) { at = L.narrow(at); }
      var negative = node.at.unary === "-" && node.at.of.lit !== undefined;
      if (negative && !L.negatives) {
        at = L.lengthOf(held(asCode(node.index, w)), holder, w) + " - " + node.at.of.lit;
      }
      if (holder === "text") { return L.charAt(asCode(node.index, w), at, w); }
      if (isTableKind(holder)) {
        var looked = L.lookUp(asCode(node.index, w), at, holder, w);
        var table = node.index.name && !node.index.field && !node.index.index && !node.index.call ? w.entry(node.index.name) : null;
        return w.wideTable(table) ? looked.replace(/^\(int\) ?/, "(" + L.bigInt + ") ") : looked;
      }
      return L.itemAt(asCode(node.index, w), at, holder, w);
    }
    if (node.field) {
      var of = w.kind(node.field);
      if (/^(length|size|count)$/i.test(node.name) && (isListKind(of) || of === "text")) {
        return L.lengthOf(held(asCode(node.field, w)), of, w);
      }
      if (isTableKind(of)) { return L.lookUp(asCode(node.field, w), quoted(node.name), of, w); }
      return L.partOf(asCode(node.field, w), w.fieldName(node.name), of, w);
    }
    if (node.group) { return "(" + asCode(node.group, w) + ")"; }
    if (node.unary) {
      if (node.unary === "not") {
        var told = w.truth(node.of);
        return L.not + (told === asCode(node.of, w) || R_SIMPLE.test(told) ? told : "(" + told + ")");
      }
      var of = asCode(node.of, w);
      // -x where x is of no one kind: a number first, where the language asks
      if (node.unary === "-" && L.anyNum && w.kind(node.of) === "any") { of = L.anyNum(of); }
      // - -x, not --x: the second of those takes one away from x.
      return node.unary + (of.charAt(0) === node.unary ? "(" + of + ")" : of);
    }
    if (node.call) { return w.calling(node, want); }

    var op = node.op;
    var a = asCode(node.left, w), b = asCode(node.right, w);
    var ka = w.kind(node.left), kb = w.kind(node.right);
    // Something of no one kind met with a number is taken to be one.
    if (L.anyNum && /^(-|\*|\/|mod|%|div|\^|\+)$/.test(op)) {
      if (ka === "any" && (kb === "int" || kb === "real" || kb === "any")) { a = L.anyNum(a); ka = "real"; }
      if (kb === "any" && (ka === "int" || ka === "real")) { b = L.anyNum(b); kb = "real"; }
    }
    var whole = ka === "int" && kb === "int";
    var words = ka === "text" || kb === "text";
    // `not x = 9` is (not x) = 9 to the runner and not (x = 9) to Python.
    if (L.not === "not ") {
      if (node.left.unary === "not") { a = "(" + a + ")"; }
      if (node.right.unary === "not") { b = "(" + b + ")"; }
    }
    switch (op) {
      case "^":
        // 2 ^ 2 ^ 3 is sixty-four to the runner, which works from the left;
        // ** works from the right and makes it two hundred and fifty-six.
        // And -a ** 2 is not the square of minus a anywhere: in Python it
        // is minus the square, and in JavaScript it is a syntax error.
        // 10 ^ -2: a hundredth, not a whole number
        if (node.right && (node.right.unary === "-" || (node.right.lit !== undefined && Number(node.right.lit) < 0))) { whole = false; }
        if (!L.pow) {
          // 2 ^ 40 is past an int: made a long instead
          if (whole && L.bigInt && w.isWide(node)) {
            return "(" + L.bigInt + ") " + L.power(a, b, false, w);
          }
          return L.power(a, b, whole, w);
        }
        return ((node.left.unary || node.left.op === "^") ? "(" + a + ")" : a) +
               " " + L.pow + " " + b;
      case "/":
        return (whole && L.over) ? L.over(a, b, w) : a + " / " + b;
      case "div":
        return L.into(a, b, whole, w);
      case "mod": case "%":
        // Python's % goes the other way from the runner's below nought: its
        // own % only where neither side can ever be less than nought
        if (L.towardNought && (L.floorsMod ? !(w.nonNeg(node.left) && w.nonNeg(node.right))
                                           : (minusIn(node.left) || minusIn(node.right)))) {
          return L.towardNought(a, b, whole, w);
        }
        return (!whole && L.rest && (ka === "real" || kb === "real"))
               ? L.rest(a, b, w) : a + " " + L.mod + " " + b;
      case "=": case "==": case "!=": case "<>":
        var differ = op === "!=" || op === "<>";
        // found = 0: a yes-or-no met with a nought or a one, as the runner meets it
        if ((ka === "bool") !== (kb === "bool")) {
          var flag = ka === "bool" ? a : b, other = ka === "bool" ? node.right : node.left;
          if (other.lit === "0" || other.lit === "1") {
            return (other.lit === "1") !== differ ? flag : L.not + held(flag);
          }
        }
        // node <> "": where "" was nothing-yet, it is null
        if (L.nullValue && (node.left.str === "" || node.right.str === "")) {
          var side = node.left.str === "" ? kb : ka, none = w.nothingFor(side);
          var asked = node.left.str === "" ? node.right : node.left, askedOne = null;
          if (asked.name && !asked.field && !asked.index && !asked.call) { askedOne = w.entry(asked.name); }
          else if (asked.call && !asked.field) { askedOne = w.prog.byName[lowered(asked.call)] || null; }
          if (askedOne && (askedOne.nullable || askedOne.givesNone) && L.boxedKind && L.boxedKind[side]) {
            return (node.left.str === "" ? b : a) + " " + (differ ? L.ne : L.eq) + " " + L.nullValue;
          }
          // a number never set to nothing is always something
          var named = node.left.str === "" ? node.right : node.left;
          if (/^(int|real|bool)$/.test(side || "") && named.name && !named.field && !named.index && !named.call &&
              !w.everNothing(named.name)) {
            return differ ? L.yes : L.no;
          }
          if (none) {
            return (node.left.str === "" ? b : a) + " " + (differ ? L.ne : L.eq) + " " + none;
          }
        }
        // it.qty = 1 where the table holds all sorts: the same number, however it is held
        if ((ka === "any" || kb === "any") && !words && !compoundKind(ka) && !compoundKind(kb) && L.anyOrder) {
          return L.anyOrder(a, differ ? "!=" : "==", b, w);
        }
        // "YES" = "yes": the runner lets capitals go between words (== does not)
        if ((op === "=" || op === "<>") && ka === "text" && kb === "text" && L.sameText) {
          return L.sameText(a, b, differ, node.left, node.right, w);
        }
        if ((words || compoundKind(ka) || compoundKind(kb)) && L.alike) { return L.alike(a, b, differ); }
        if ((compoundKind(ka) || compoundKind(kb)) && L.sameItems) { return L.sameItems(a, b, differ, w); }
        return a + " " + (differ ? L.ne : L.eq) + " " + b;
      case "<": case "<=": case ">": case ">=":
        if ((ka === "any" || kb === "any") && L.anyOrder) { return L.anyOrder(a, op, b, w); }
        if (ka === "text" && kb === "text" && L.orderedText) { return L.orderedText(a, op, b, node.left, node.right, w); }
        if (words && L.ordered) { return L.ordered(a, op, b); }
        return a + " " + op + " " + b;
      case "*":
        // [0] * 8, Python's way of making eight noughts, and "-" * 20:
        // that many over, the way each language says it (Python as it is)
        var lt = (isListKind(ka) || ka === "text") && kb === "int";
        var rt = (isListKind(kb) || kb === "text") && ka === "int";
        if ((lt || rt) && L.ext !== "py" && L.lists && L.lists.repeat) {
          var many = lt ? node.left : node.right, count = lt ? b : a;
          var mk = lt ? ka : kb;
          if (isListKind(mk) && isListKind(want)) { mk = want; }
          if (many.list && many.list.length === 1 && isListKind(mk) && !compoundKind(elemOf(mk)) && L.lists.newlist) {
            return L.lists.newlist.call(L, [count, w.fitIn(many.list[0], elemOf(mk))], ["int", elemOf(mk)], w,
                                        [lt ? node.right : node.left, many.list[0]]);
          }
          return L.lists.repeat.call(L, [lt ? a : b, count], [mk, "int"], w, [many, lt ? node.right : node.left]);
        }
        if (L.bigInt && ka === "int" && kb === "int" && w.isWide(node) && !w.isWide(node.left) && !w.isWide(node.right)) {
          return "(" + L.bigInt + ") " + a + " * " + b;
        }
        return a + " * " + b;
      case "+":
        if (isListKind(ka) && isListKind(kb) && L.listPlus) { return L.listPlus(a, b, w); }
        if (words && L.shown) {
          if (compoundKind(ka)) { a = L.shown(a, w); ka = "text"; }
          if (compoundKind(kb)) { b = L.shown(b, w); kb = "text"; }
        }
        // "a" + True: yes and no joined on as the chart says them
        if (words && L.flagText) {
          if (ka === "bool") { a = L.flagText(a); ka = "text"; }
          if (kb === "bool") { b = L.flagText(b); kb = "text"; }
        }
        if (words && L.worded) {
          if (ka !== "text") { a = L.worded(a); }
          if (kb !== "text") { b = L.worded(b); }
        }
        if (words && L.words && node.left.str !== undefined &&
            (node.right.str !== undefined || kb !== "text")) { a = L.words(a); }
        return a + " + " + b;
      // 100 in scores: contains(scores, 100), each language's way
      case "in": case "not in":
        var held1 = w.calling({ call: "contains", args: [node.right, node.left] });
        return op === "in" ? held1 : L.not + held(held1);
      case "and": case "&&": return a + " " + L.and + " " + b;
      case "or": case "||": return a + " " + L.or + " " + b;
      default: return a + " " + op + " " + b;
    }
  }

  // The built-ins that walk what they are given item by item: a table's
  // keys, the letters of some words.
  var ITEMS_OF = { sorted: 1, unique: 1, shuffled: 1, union: 1, intersection: 1, any: 1, all: 1,
                   zip: 1, enumerate: 1 };
  // What classOf() says, where the kind alone already says it.
  function staticClass(kind) {
    if (isListKind(kind)) { return "List"; }
    if (isTableKind(kind)) { return "Table"; }
    if (isRecKind(kind)) { return kind.slice(4); }
    return kind === "text" ? "String" : kind === "bool" ? "Boolean" : kind === "int" ? "Integer" : "";
  }

  // Something with a minus in it, which may come to less than nought.
  function minusIn(node) {
    while (node && node.group) { node = node.group; }
    if (!node) { return false; }
    if (node.unary === "-") { return true; }
    if (node.lit !== undefined) { return /^-/.test(node.lit); }
    if (node.op === "-") { return true; }
    if (node.op === "+" || node.op === "*") { return minusIn(node.left) || minusIn(node.right); }
    return false;
  }

  // The bits of a Display, joined up.  A piece that is itself words joined
  // with a plus -- Display "Total: " + total -- is taken apart into its
  // pieces first, so that it is written the way the comma form is.  Whether
  // a bit is money can depend on the bit before it -- the sign in
  // "Total: $" is what says so -- which is why the text is gathered as it
  // goes.
  function saying(parts, w) {
    var L = w.L, said = "", nodes = [];
    function apart(node) {
      if (node.op === "+" && w.kind(node) === "text") {
        apart(node.left); apart(node.right);
      } else { nodes.push(node); }
    }
    pieces(parts || "").forEach(function (bit) { apart(tree(bit)); });
    var bits = nodes.map(function (node) {
      var kind = w.kind(node), number = kind === "int" || kind === "real";
      var one = { code: asCode(node, w), kind: kind, text: node.str !== undefined,
                  loose: !!node.op && RANK[node.op] <= 5,
                  cash: number && (w.cash(node) || R_CASH_SIGN.test(said)) };
      // A list printed the way the chart prints one: ['a', 1], not a,1.
      if ((compoundKind(kind) || (kind === "any" && L.kinds)) && L.shown) {
        one.code = L.shown(one.code, w); one.kind = "text"; one.loose = false;
      }
      // a number that may be nothing-yet: printed as nothing, where the
      // language would print null
      if (number && L.nothingText && w.mayBeNothing(node)) { one.code = L.nothingText(one.code); one.kind = "text"; one.loose = false; }
      // yes and no, printed True and False the way the chart prints them,
      // where the language itself would print 1 and 0
      if (kind === "bool" && L.flagText) { one.code = L.flagText(one.code); one.kind = "text"; one.loose = false; }
      said += node.str !== undefined ? node.str : "0";
      return one;
    });
    return bits.length ? L.join(bits, w) : '""';
  }

  // The names that would shadow something a class-shaped file is built on.
  var R_TAKEN_FILE = /^(Math|String|System|Scanner|Console|Random|Object|Integer|Double|Boolean|Environment)$/;

  // ---------------------------------------- one chart, cut into parts --
  // A program drawn as a single flow has no modules to make files out of,
  // and a long single flow is exactly where a file each would help most.
  // What it does have is shape: a top-level loop or decision with real
  // work inside it is a piece of the program you could give a name to, and
  // giving it one is the first thing anybody is told to do with a program
  // that has got too long to read.
  //
  // So those are lifted -- each into a chart of its own, in the order they
  // were written -- and main is left as the statements between them with a
  // call where each one stood.
  //
  // Which leaves the names.  A name two charts use has to be somewhere
  // both can reach, so it becomes one the program shares and is read as
  // shared.total from everywhere; that is the cost of the cut, and it is
  // why a name is only made shared when it really is.  Declaring a name is
  // not using it -- the declarations all sit at the top of a program
  // whether or not the line below uses them -- so a name declared up there
  // and then used by one part alone is that part's, declaration and all,
  // and travels into the file with it.
  //
  // It is not always worth doing, and where it is not it is not done: a
  // short program reads worse cut up than whole, and a part holding two
  // lines is a file holding two lines.  Nothing is cut where the program
  // is small, where no part is big enough to carry a file of its own, or
  // where a part would carry a Return -- a Return in main ends the
  // program, and the same line inside a routine only ends the routine.
  var CUT_WHOLE = 40;                    // statements before cutting at all
  var CUT_PART = 6;                      // statements in a part worth a file
  var R_BLOCK = /^(if|while|dowhile|for|select)$/;

  function deepCount(items) {
    var n = 0;
    eachStep(items || [], function () { n++; });
    return n;
  }

  function anyReturn(items) {
    var found = false;
    eachStep(items || [], function (item) {
      if (item.op === "return") { found = true; }
    });
    return found;
  }

  // Every name these statements use, lowered, against how it was first
  // spelled.  Names only: `sqrt` in two of them is not something the
  // program shares, it is arithmetic.  And a Declare is not a use -- it is
  // where the name is kept, which is the thing being worked out here.
  function wordsIn(items) {
    var got = Object.create(null);
    function mark(said) {
      var low = lowered(bareName(said));
      if (low && !got[low]) { got[low] = bareName(said); }
    }
    function look(node) {
      if (!node) { return; }
      if (node.name && !node.field) { mark(node.name); }
      kidsOf(node).forEach(look);
    }
    eachStep(items || [], function (item) {
      sumsOf(item).forEach(function (src) { look(tree(src)); });
      targetsOf(item, null).forEach(mark);
    });
    return got;
  }

  // Worked out once for each program built, because it is asked for twice
  // over -- by the note under the card, which says what a file each would
  // come to before you ask for it, and then by the asking.  Reading a long
  // program through to see which of its names two charts share is not
  // something to do twice for the same answer.
  var cutKeep = { ast: null, got: null };

  function cutUp(ast) {
    if (cutKeep.ast !== ast) { cutKeep = { ast: ast, got: cutInto(ast) }; }
    return cutKeep.got;
  }

  // How often each name is mentioned in a run of statements, and how many
  // of those mentions are inside a For that counts with it.  A name whose
  // two counts are equal is only ever a counter there.
  function tally(items) {
    var all = Object.create(null), loops = Object.create(null);
    eachStep(items || [], function (item) {
      wordsOf(item, null).forEach(function (low) {
        all[low] = (all[low] || 0) + 1;
      });
    });
    // A For is walked for its own counter and then walked into, because
    // the For inside it counts with a name of its own and that one has to
    // be found as well.  `done` is the counters already accounted for on
    // the way down, so that a For nested in another counting with the same
    // name is not counted twice over.
    (function counted(list, done) {
      (list || []).forEach(function (item) {
        var low = item.op === "for"
                ? lowered(statementOf(item.init || "").var) : "";
        var inner = done;
        if (low && !done[low]) {
          eachStep([item], function (one) {
            wordsOf(one, null).forEach(function (word) {
              if (word === low) { loops[low] = (loops[low] || 0) + 1; }
            });
          });
          inner = Object.create(done);
          inner[low] = true;
        }
        blocksOf(item).forEach(function (block) { counted(block, inner); });
      });
    })(items || [], Object.create(null));
    return { all: all, loops: loops };
  }

  function cutInto(ast) {
    var main = ast.main || [];
    if ((ast.modules || []).length || deepCount(main) < CUT_WHOLE) { return null; }

    // The cut: every top-level block with enough in it to be worth a file.
    var parts = [], items = [], n = 0;
    main.forEach(function (item) {
      if (!R_BLOCK.test(item.op || "") || deepCount([item]) < CUT_PART ||
          anyReturn([item])) {
        items.push(item);
        return;
      }
      var name = "part" + (++n);
      parts.push({ name: name, params: "", returns: "", body: [item],
                   said: String(item.text || "").trim() });
      items.push({ op: "call", name: name, args: "", id: item.id,
                   line: item.line, text: "Call " + name + "()" });
    });
    if (!parts.length) { return null; }

    // Which charts use each name.  Main is the first of them; the parts
    // follow in the order they were lifted.
    var bodies = [items].concat(parts.map(function (one) { return one.body; }));
    var whose = Object.create(null), spelt = Object.create(null);
    bodies.forEach(function (body, at) {
      var words = wordsIn(body);
      Object.keys(words).forEach(function (low) {
        spelt[low] = spelt[low] || words[low];
        if (!whose[low]) { whose[low] = []; }
        if (whose[low].indexOf(at) < 0) { whose[low].push(at); }
      });
    });

    // Except that a For's counter is the For's own business.  Two parts
    // that each count with `i` are not sharing anything -- they are each
    // counting -- and a name like that belongs to neither of them: each
    // chart declares its own where it counts, and the Declare at the top
    // of the program that used to serve them all has nothing left to do.
    //
    // Which names those are is worked out in one pass over each chart
    // rather than one pass for each name.  Asked the second way, a program
    // cut into three hundred parts reads every one of them through again
    // for every name that turns up in two of them, and the reading is the
    // whole of the work.
    var tallies = bodies.map(tally);
    var loose = Object.create(null);
    Object.keys(whose).forEach(function (low) {
      if (whose[low].length < 2) { return; }
      var counting = whose[low].every(function (at) {
        return (tallies[at].all[low] || 0) === (tallies[at].loops[low] || 0);
      });
      if (counting) { delete whose[low]; loose[low] = true; }
    });

    // Where each one is declared, if it is declared at all.  A declaration
    // inside a block -- an If, a loop, anywhere inside a part -- cannot be
    // moved without changing when it is set, so a program that has one
    // there is left whole rather than written out as something that does
    // not do the same thing.
    function shares(low) { return !!whose[low] && whose[low].length > 1; }

    var spots = Object.create(null), nested = false;
    eachStep(items, function (item, deep) {
      if (item.op !== "declare") { return; }
      var low = lowered(bareName(item.var));
      if (deep) { nested = nested || shares(low); }
      else { spots[low] = item; }
    });
    parts.forEach(function (one) {
      eachStep(one.body, function (item) {
        if (item.op !== "declare") { return; }
        nested = nested || shares(lowered(bareName(item.var)));
      });
    });
    if (nested) { return null; }

    // A name one part alone uses goes into that part, declaration and all.
    // A name two charts use is the program's, and its declaration moves
    // out to where every file can see it -- but what it started its name
    // off as stays where it stood, as the setting it always was, so that a
    // program which gives a name its value halfway down goes on doing it
    // there.  A Constant travels with its value: it is the value.
    var mine = Object.create(null), sends = Object.create(null);
    Object.keys(whose).forEach(function (low) {
      if (shares(low)) { mine[low] = true; }
      else if (whose[low][0] > 0) { sends[low] = whose[low][0] - 1; }
    });

    var out = [], top = [];
    items.forEach(function (item) {
      var low = item.op === "declare" ? lowered(bareName(item.var)) : "";
      if (!low) { out.push(item); return; }
      if (loose[low]) { return; }         // nobody's: every chart counts its own
      if (sends[low] !== undefined) {     // it is one part's, and goes with it
        // ...as the part's own: a Constant written above everything is the
        // program's, and left so it would be read from the shared file
        // while its value was set in the part
        var owned = Object.assign({}, item);
        delete owned.scope;
        parts[sends[low]].body.unshift(owned);
        return;
      }
      if (!mine[low]) { out.push(item); return; }
      top.push({ op: "declare", scope: "global", const: !!item.const,
                 type: item.type, var: item.var,
                 expr: item.const ? item.expr : "",
                 id: item.id, line: item.line, text: item.text });
      if (!item.const && item.expr) {
        out.push({ op: "set", var: item.var, expr: item.expr,
                   id: item.id, line: item.line, text: item.text });
      }
    });
    // And a shared name nobody declared anywhere is given a declaration,
    // because a file cannot read what is written down nowhere.
    Object.keys(mine).forEach(function (low) {
      if (spots[low]) { return; }
      top.push({ op: "declare", scope: "global", const: false, type: "",
                 var: spelt[low], expr: "", id: 0, line: 0,
                 text: "Declare " + spelt[low] });
    });
    return { main: top.concat(out), modules: parts, problems: ast.problems };
  }

  // The same program, in one file or in several.  `apart` asks for several,
  // and gets them where the language knows how and the program has anything
  // to split -- a chart with no modules in it is one chart and one file.
  // What comes back is always a list, because one file is a list of one and
  // everything downstream would rather not be asked which it has.
  function writeOut(lang, apart, prog) {
    var L = LANGS[lang], out = [];
    var name = (el("#f-title").value || "").replace(/[^A-Za-z0-9]/g, "") || "Program";
    // A class cannot be called 2ndTry, or for, or Math.
    if (/^[0-9]/.test(name) || L.kept[name] || L.kept[name.toLowerCase()]) {
      name = "Program" + name;
    }
    if (R_TAKEN_FILE.test(name)) { name += "Program"; }
    if (L.named) { name = L.named(name); }

    // Which built-ins the program calls, for the names that are only in the
    // way if it does.
    var used = Object.create(null);
    prog.scopes.forEach(function (scope) {
      eachStep(scope.items, function (item) {
        var trees = sumsOf(item).map(tree);
        if (item.op === "call") { trees.push(callOf(item)); }
        if (item.op === "wait") { used["@wait"] = true; }
        trees.forEach(function (node) {
          eachCall(node, function (call) { used[lowered(call.call)] = true; });
        });
      });
    });
    // what brings in Python's random: a name called random is in its way
    // only then -- and its time only where the program waits
    if (used.random || used.shuffle || used.shuffled || used.choice) { used["@random"] = true; }

    // Where the program is written out in several files, the names of
    // those files are names too: `import shared` puts `shared` into the
    // file, and a variable of the program spelled shared would be standing
    // exactly where the file has to be.  Filled in below, once the files
    // have been named, and left empty for one file and for the languages
    // whose files do not bring a name in with them.
    //
    // A module is the one thing a file cannot be in the way of -- the file
    // is named after the module, and nothing imports itself.  The file
    // holding what the program shares is another matter: a module called
    // shared would be a `def shared` in a file that has just said `import
    // shared`.  So that one is marked apart from the rest.
    var homes = Object.create(null);

    // A record's kind and the Function that makes one are often called the
    // same -- Account, and Account(owner, balance) -- which is one name for
    // two things in every language here.  The Function is newAccount.
    var recLow = Object.create(null);
    Object.keys(recordsIn(prog)).forEach(function (kind) { recLow[lowered(kind)] = true; });

    function safe(said, mine, entry) {   // a name this language will accept
      var soft = L.soft && holds(L.soft, said) && used[L.soft[said]];
      var home = mine ? homes[said] === "shared" : !!homes[said];
      // what the C library puts in every file's way is only in the way of
      // what the whole file shares: a variable inside a function can be
      // called time or index, and is
      var kept = L.kept[said] && !(L.keptShared && L.keptShared[said] && entry && !entry.shared);
      return (kept || soft || home) ? said + "_" : said;
    }

    var w = {
      L: L,
      prog: prog,
      mods: prog.mods,
      file: name,
      title: el("#f-title").value || TXT.untitled,
      needs: {},                         // what the top of the file must bring
      scope: prog.main,                  // the chart being written
      where: null,                       //   and the module it is, if it is one
      boxes: {},
      // Put in front of whatever is written next, and put back straight
      // afterwards.  It is how a class-shaped file marks the few lines that
      // are fields of the class rather than statements inside a method,
      // without the writer itself having to know what a field is.
      infront: "",

      // ---- which file this is, where there is more than one --------------
      // Written out in several files, a name the whole program shares is
      // written down in one of them and read from the rest, so the rest
      // have to say where they are reading it from: shared.total,
      // Shared.total.  `reach` is that much, put in front of a shared name
      // while a file that does not hold it is being written, and nothing at
      // all the rest of the time -- which is why one file goes on coming
      // out exactly as it always did.
      apart: false,                      // several files, not one
      reach: "",                         //   and how this one reaches them
      files: null,                       //   and what each module's is called
      sharedFile: "",                    //   and what the one holding them is
      need: function (what) { w.needs[what] = true; },
      line: function (deep, text) {
        out.push(text === "" ? "" : L.tab.repeat(deep) + w.infront + text);
      },
      count: function () { return out.length; },
      unline: function () { out.pop(); },
      // Written now, put in later: the top of a file depends on what the
      // rest of it turned out to need.
      aside: function (fn) {
        var keep = out;
        out = [];
        fn();
        var got = out;
        out = keep;
        return got;
      },
      pour: function (lines) { lines.forEach(function (row) { out.push(row); }); },

      // ---- names ---------------------------------------------------------
      entry: function (who) { return lookUp(w.scope, bareName(who)); },
      spelled: function (entry) { return safe(entry.name, false, entry); },
      named: function (who) {            // a name, as this chart knows it
        var entry = lookUp(w.scope, who);
        if (!entry) { return safe(who); }
        var boxed = entry.param && w.boxes[lowered(entry.name)];
        return (entry.shared ? w.reach : "") + safe(entry.name, false, entry) +
               (boxed ? "[0]" : "");
      },
      called: function (one) {
        return safe(recLow[lowered(one.name)] ? "new" + one.name : one.name, true);
      },
      // A kind of record, as a class of this language: never one of the
      // names the language or the file already has a use for.
      recName: function (kind) {
        return L.kept[kind] || R_TAKEN_FILE.test(kind) || lowered(kind) === lowered(name) ? kind + "_" : kind;
      },
      // What goes in front of a module's name where it is *called*.  In one
      // file, nothing: it is written a few lines further up.  In several,
      // it is wherever its own file puts it, which each language answers
      // for itself -- Java reaches it through the class, Python and
      // JavaScript through the module they imported it as, C++ not at all
      // because the include has already brought the name itself in.
      //
      // A module calling itself is calling something written a few lines
      // above it in its own file, so it is named the way it always was.
      // Reached through the file it lives in instead, `fact` inside fact.py
      // would be the module rather than the def, and Python would say so.
      reachMod: function (one) {
        if (!w.apart || !L.reachMod || one === w.where) { return ""; }
        return L.reachMod(w, one);
      },
      // What a file holding this chart is about, for the line at the top
      // of it.  Its name, which for a real module is what somebody called
      // it -- and, for a part lifted out of a single flow, which is only
      // called part2 because it came second, the statement it was lifted
      // from as well, so the file says what it is before anybody opens it.
      about: function (one) {
        var said = one.mod && one.mod.said;
        return one.name + (said ? ": " + said : "");
      },
      // What this module's file is called, without the ending.
      fileOf: function (one) {
        return (w.files && w.files[lowered(one.name)]) || safe(one.name, true);
      },

      // Everything the whole program shares, and what it starts off as: the
      // Constants and Declares written above the charts, in the order they
      // were written, and then the names nobody declared anywhere that more
      // than one chart uses.  A file of its own is made out of these, so
      // each language asks for the list rather than walking main itself
      // looking for the lines that are not main's.
      sharing: function () {
        var seen = Object.create(null), list = [];
        prog.main.items.forEach(function (item) {
          if (!globalItem(item, prog) || item.op !== "declare") { return; }
          var entry = lookUp(prog.shared, bareName(item.var));
          if (!entry || seen[lowered(entry.name)]) { return; }
          seen[lowered(entry.name)] = true;
          list.push({ entry: entry, name: safe(entry.name), fixed: !!item.const && !entry.setAgain,
                      plain: isLiteral(tree(item.expr || "0")),
                      code: w.withWide(entry, function () {
                        return w.sizedList(item, entry) ||
                               (item.expr ? w.fitted(item.expr, entry.kind, entry) : w.zero(entry.kind, entry));
                      }) });
        });
        Object.keys(prog.shared.names).forEach(function (low) {
          var entry = prog.shared.names[low];
          if (seen[low] || entry.param) { return; }
          list.push({ entry: entry, name: safe(entry.name), fixed: false,
                      plain: true, code: w.withWide(entry, function () { return w.zero(entry.kind, entry); }) });
        });
        return list;
      },
      // Main's own statements: what happens inside main, as against the
      // Constants and Declares written above every chart, which belong to
      // the program rather than to main and go in the shared file.
      mains: function () {
        return prog.main.items.filter(function (item) {
          return !(globalItem(item, prog) && item.op === "declare");
        });
      },
      // Does this chart touch a name the whole program shares?  A file that
      // does has to bring in the file that holds them.
      touching: function (scope, items) {
        var found = false;
        eachStep(items || [], function (item) {
          if (found) { return; }
          wordsOf(item, prog).forEach(function (low) {
            var entry = lookUp(scope, low);
            if (entry && entry.shared) { found = true; }
          });
        });
        return found;
      },
      // A file of its own starts with nothing brought into it: what goes at
      // the top of one is what the rest of that one turned out to want, not
      // what some other file wanted.
      alone: function () { w.needs = {}; },
      // Which modules these statements call, each named once and in the
      // order they are first called.  It is what a file of its own has to
      // say it is bringing in.  `mine` is the module being written, which
      // is in the file already and so is never brought into it.
      leaning: function (items, mine) {
        var list = [], seen = Object.create(null);
        function add(who) {
          if (!who || who === mine || seen[lowered(who.name)]) { return; }
          seen[lowered(who.name)] = true;
          list.push(who);
        }
        function look(node) {
          if (!node) { return; }
          eachCall(node, function (call) { add(prog.byName[lowered(call.call)]); });
          (function handed(n) {
            if (!n || typeof n !== "object") { return; }
            if (n.name && !n.field && !n.call && !lookUp(w.scope, n.name)) { add(prog.byName[lowered(n.name)]); }
            kidsOf(n).forEach(handed);
          })(node);
        }
        eachStep(items || [], function (item) {
          sumsOf(item).forEach(function (src) { look(tree(src)); });
          if (item.op === "call") { look(callOf(item)); }
        });
        return list;
      },
      kind: function (node) { return kindIn(node, w.scope, prog); },
      // The same question the runner asks: does this work out to money?
      // Declared Currency, or named in something that was.
      cash: function (node) {
        var found = false;
        (function look(n) {
          if (!n || found) { return; }
          var entry = n.name && !n.field ? lookUp(w.scope, n.name) : null;
          if (entry && entry.cash) { found = true; }
          look(n.group); look(n.of); look(n.left); look(n.right);
          (n.args || []).forEach(look);
        })(node);
        return found;
      },

      // ---- expressions ---------------------------------------------------
      write: function (node) { return asCode(node, w); },
      code: function (src) { return asCode(tree(src), w); },
      // What goes into a whole-number name has to be a whole number, in the
      // languages that check.  Two whole numbers divided is the one case
      // that needs nothing doing: left alone, it already is one.
      fitted: function (src, into, entry) {
        var node = tree(src);
        // C#: an int? going where only an int goes, once it is known to be one
        if (L.nullableList && L.boxedKind && L.boxedKind[into] && !(entry && (entry.nullable || entry.givesNone)) &&
            node.str !== "" && w.mayBeNothing(node)) {
          return "(" + w.typeOf(into) + ")(" + asCode(node, w, into) + ")";
        }
        if (node.list && entry && entry.elemNullable && L.nullableList && isListKind(into) && L.boxedKind && L.boxedKind[elemOf(into)]) {
          return "new " + L.nullableList(elemOf(into)) + " { " + node.list.map(function (one) { return w.fitIn(one, elemOf(into)); }).join(", ") + " }";
        }
        if (node.str === "" && entry && (entry.nullable || entry.givesNone) && L.boxedKind && L.boxedKind[into]) { return L.nullValue; }
        if (node.str === "" && w.nothingFor(into)) { return w.nothingFor(into); }
        if (L.fromAny && into && into !== "any" && w.kind(node) === "any") { return L.fromAny(asCode(node, w, into), into, w); }
        // Set middle = (first + last) / 2 into an Integer: Python and
        // JavaScript divide into a fraction, so the whole part of it is
        // taken, the way the others' / takes it (and the runner: keptWhole)
        var top = node;
        while (top.group) { top = top.group; }
        if (into === "int" && L.wholeOver && top.op === "/") {
          return L.wholeOver(asCode(top.left, w), asCode(top.right, w),
                             w.nonNeg(top.left) && w.nonNeg(top.right) &&
                             w.kind(top.left) === "int" && w.kind(top.right) === "int");
        }
        if (!L.narrow || into !== "int" || w.kind(node) !== "real") {
          return asCode(node, w, into);
        }
        if (node.op === "/" && w.kind(node.left) === "int" &&
            w.kind(node.right) === "int") {
          return asCode(node.left, w) + " / " + asCode(node.right, w);
        }
        if (entry && entry.wide && L.bigInt) { return "(" + L.bigInt + ") " + held(asCode(node, w)); }
        return L.narrow(asCode(node, w));
      },
      // A test.  `While n` is fine by the runner, and by Python; the typed
      // languages want to be told that what is meant is "while n is not 0".
      tested: function (src) { return w.truth(tree(src)); },
      // The opposite of a test, as anybody would write it: price > 0
      // rather than not (price <= 0), done rather than not (not done)
      negated: function (src) {
        var node = tree(src);
        while (node && node.group) { node = node.group; }
        if (node && node.unary === "not" && w.kind(node.of) === "bool") { return w.write(node.of); }
        var flip = node && NEGATED[node.op];
        if (flip) {
          var ka = w.kind(node.left), kb = w.kind(node.right);
          var order = !/^(=|==|<>|!=)$/.test(node.op);
          var ok = order ? /^(int|real|text)$/.test(ka) && /^(int|real|text)$/.test(kb) && (ka === "text") === (kb === "text")
                         : /^(int|real|text|bool)$/.test(ka) && /^(int|real|text|bool)$/.test(kb);
          if (ok) { return w.write({ op: flip, left: node.left, right: node.right }); }
        }
        return L.not + "(" + w.code(src) + ")";
      },
      // Whether something counts as yes, the way the runner counts: a
      // number that is not nought, words that are not empty, a list with
      // something in it, a record that is there at all.
      truth: function (node) {
        var code = asCode(node, w), kind = w.kind(node);
        if (L.truthOf && kind !== "bool") { return L.truthOf(code, kind, w) || code; }
        return (L.kinds && (kind === "int" || kind === "real"))
               ? held(code) + " " + L.ne + " 0" : code;
      },
      // "" given to something that is not words: it was standing for
      // nothing-yet, and in these languages that is null, or nought.
      // whether this name might hold "", its nothing-yet: anything but a name
      // only ever set to a number written out, and never handed one
      everNothing: function (name) {
        var low = lowered(name);
        if (!w.nothingSet) {
          w.nothingSet = Object.create(null);
          prog.scopes.forEach(function (scope) {
            eachStep(scope.items, function (it) {
              if (!it["var"]) { return; }
              var who = lowered(bareName(String(it["var"]).trim()));
              var plainNumber = /^\s*-?\d+(\.\d+)?\s*$/.test(String(it.expr || ""));
              if (!((it.op === "set" && plainNumber) || (it.op === "declare" && (plainNumber || !String(it.expr || "").trim())))) {
                w.nothingSet[who] = true;
              }
            });
          });
          prog.mods.forEach(function (one) {
            one.params.forEach(function (p) { w.nothingSet[lowered(p.name)] = true; });
          });
        }
        return !!w.nothingSet[low];
      },
      // whether this can come to nothing-yet: a name that can hold it, a
      // Function that can hand it back
      mayBeNothing: function (node) {
        if (!node) { return false; }
        if (node.group) { return w.mayBeNothing(node.group); }
        if (node.name && !node.field && !node.index && !node.call) { var e0 = w.entry(node.name); return !!(e0 && e0.nullable); }
        if (node.call && !node.field) { var m0 = prog.byName[lowered(node.call)]; return !!(m0 && m0.givesNone); }
        if (node.op && /^(\+|-|\*|\/|mod|%|div|\^)$/.test(node.op)) { return w.mayBeNothing(node.left) || w.mayBeNothing(node.right); }
        if (node.unary === "-") { return w.mayBeNothing(node.of); }
        return false;
      },
      // the kind each one of a list is, as a type -- boxed where the list can hold nothing-yet
      elemType: function (overSrc, elem) {
        var over = tree(overSrc), held = over.name && !over.field && !over.index ? w.entry(over.name) : null;
        if (held && held.elemNullable && L.boxedKind && L.boxedKind[elem]) { return L.boxedKind[elem]; }
        if (elem === "int" && w.wideList(held)) { return L.bigInt; }
        return w.typeOf(elem || "real");
      },
      nothingFor: function (kind) {
        if (!L.nullValue || kind === "text" || kind === "any") { return null; }
        return compoundKind(kind) ? L.nullValue : w.zero(kind);
      },

      // ---- calls ---------------------------------------------------------
      // How a module is going to give back what it was handed by reference:
      //   own   the language has references, and says so itself
      //   back  it returns them, and the call puts them where they came from
      //   box   they go in and come out in a one-slot array each
      //   ""    nothing is handed by reference, or nothing can be done
      plan: function (one) {
        if (!one.refs.length) { return ""; }
        if (L.refs === "own") { return "own"; }
        if (!one.answers && (L.refs === "back" || one.refs.length === 1)) { return "back"; }
        return L.refs === "box" ? "box" : "";
      },
      // One thing handed to a module, as the module needs it handed.
      handed: function (one, i, node) {
        var p = one.params[i];
        // memo = {} handed to a module that keeps longs in it: made as one
        var code = w.withWide(p && p.entry, function () { return asCode(node, w, p && p.entry.kind); });
        if (p && node.str === "" && w.nothingFor(p.entry.kind)) { code = w.nothingFor(p.entry.kind); }
        if (!p) { return code; }
        var how = p.ref ? w.plan(one) : "";
        if (how === "own" && (node.name || (node.index && L.asArrays && L.asArrays(w)))) { return L.refArg(code); }
        if (how === "box") { return L.boxArg(code, p.entry.kind); }
        // C++: a list or table made on the spot, handed to a module that
        // changes the one it is given (and so takes it by reference)
        if (L.refTemp && !how && p.entry.changed && compoundKind(p.entry.kind) &&
            !(node.name || node.index || node.field)) { return L.refTemp(code, w); }
        if (L.narrow && p.entry.kind === "int" && w.kind(node) === "real") {
          return L.narrow(code);
        }
        return code;
      },
      statement: false,                  // a Call on a line of its own, not a sum
      // sort(words, length), sort(people, byAge): what the second is, as a
      // way of turning an item into what it is sorted by -- or null where
      // it is a comparison of two, or nothing this can call.
      keyFn: function (node, elem) {
        if (!node || !node.name || node.field || w.entry(node.name)) { return null; }
        var one = prog.byName[lowered(node.name)];
        if (one) {
          return one.params.length === 2 ? null
               : function (arg) { return w.reachMod(one) + w.called(one) + "(" + arg + ")"; };
        }
        var low = lowered(node.name);
        if (!L.lists[low] && !holds(BUILT_KIND, low)) { return null; }
        return function (arg) { return w.calling({ call: node.name, args: [{ name: arg, kindIs: elem }] }); };
      },
      calling: function (node, want) {   // a call in the middle of a sum
        var low = lowered(node.call), one = prog.byName[low];
        // sort(xs, compare): compare is the order things are put in anyway
        if (!one && /^(sort|sorted)$/.test(low) && node.args.length === 2 && node.args[1].name &&
            !node.args[1].field && lowered(node.args[1].name) === "compare" &&
            !prog.byName.compare && !w.entry(node.args[1].name)) {
          node = Object.assign({}, node, { args: node.args.slice(0, 1) });
        }
        if (one) {
          var given = node.args.map(function (arg, i) { return w.handed(one, i, arg); });
          // a default the heading could not say is handed over by the call
          for (var gi = given.length; gi < one.params.length && one.params[gi].dflt; gi++) {
            if (L.paramDefault && L.paramDefault("", one.params[gi].dflt, one.params[gi].entry && one.params[gi].entry.kind)) { break; }
            given.push(w.handed(one, gi, tree(one.params[gi].dflt)));
          }
          return w.reachMod(one) + w.called(one) + "(" + given.join(", ") + ")";
        }
        var codes = node.args.map(function (arg) { return asCode(arg, w); });
        var kinds = node.args.map(function (arg) { return w.kind(arg); });
        // newList(3, []) going into a list of lists of numbers: its [] a list of numbers
        if (low === "newlist" && node.args.length > 1 && isListKind(want)) {
          var fillKind = want;
          for (var fk = 0; fk < node.args.length - 1 && fillKind; fk++) { fillKind = elemOf(fillKind); }
          if (fillKind && (isListKind(fillKind) || isTableKind(fillKind))) {
            codes[codes.length - 1] = asCode(node.args[node.args.length - 1], w, fillKind);
            kinds[kinds.length - 1] = fillKind;
          }
        }
        // get(x, "town", "") where x may hold anything: x is a table, looked up by words
        if (low === "get" && (kinds[0] === "any" || !kinds[0]) && (kinds[1] === "text" || kinds[1] === "int")) {
          kinds[0] = kinds[1] === "text" ? "table:text:any" : "list:any";
          if (L.fromAny) { codes[0] = L.fromAny(codes[0], kinds[0], w); }
        }
        // toLower(p["name"]) where the table holds all sorts: words, said so
        if (L.fromAny && kinds[0] === "any" &&
            /^(toupper|tolower|trim|startswith|endswith|replace|split|substring|isdigit|isalpha|isupper|islower|isspace|padleft|padright|ord)$/.test(low)) {
          codes[0] = L.fromAny(codes[0], "text", w);
          kinds[0] = "text";
        }
        if (ITEMS_OF[low] && kinds[0] && (isTableKind(kinds[0]) || kinds[0] === "text") && L.lists.tolist) {
          codes[0] = L.lists.tolist.call(L, [codes[0]], [kinds[0]], w, [node.args[0]]);
          kinds[0] = isTableKind(kinds[0]) ? "list:" + tableKey(kinds[0]) : "list:text";
        }
        // sorted(words, length): length of a word, said as such
        if (/^(sort|sorted)$/.test(low) && node.args[1] && L.lambda && node.args[1].name &&
            !prog.byName[lowered(node.args[1].name)] && !w.entry(node.args[1].name) &&
            !(L.builtRef && L.builtRef[lowered(node.args[1].name)])) {
          var byKey = w.keyFn(node.args[1], elemOf(kinds[0]));
          var v1 = L.lambdaName || "v";
          if (byKey) { codes[1] = L.lambda(v1, byKey(v1)); }
        }
        if (PUTS_IN[low] && node.args[PUTS_IN[low]] && isListKind(kinds[0])) {
          codes[PUTS_IN[low]] = w.fitIn(node.args[PUTS_IN[low]], elemOf(kinds[0]));
          var intoOne = node.args[0].name && !node.args[0].field && !node.args[0].index ? w.entry(node.args[0].name) : null;
          if (L.nullableList && L.boxedKind && L.boxedKind[elemOf(kinds[0])] && !(intoOne && intoOne.elemNullable) &&
              w.mayBeNothing(node.args[PUTS_IN[low]])) {
            codes[PUTS_IN[low]] = "(" + w.typeOf(elemOf(kinds[0])) + ")(" + codes[PUTS_IN[low]] + ")";
          }
        }
        if (low === "classof" && staticClass(kinds[0])) { return quoted(staticClass(kinds[0])); }
        // "aeiou".find(c): words written down are not a string in C++ until
        // they are made one, and have nothing to call
        if (L.madeText && kinds[0] === "text" && node.args[0] && node.args[0].str !== undefined) {
          codes[0] = L.madeText(codes[0]);
        }
        // what lists, tables and words have done to them
        if (L.lists[low] && (!holds(BUILT_KIND, low) || !L.calls[low] ||
                             kinds.some(function (k) { return isListKind(k) || isTableKind(k); }) ||
                             (low === "length" && kinds[0] !== "text") || (low === "round" && codes.length > 1))) {
          return L.lists[low].call(L, codes, kinds, w, node.args);
        }
        if (holds(BUILT_KIND, low) && L.calls[low] && codes.length) {
          // Rounding a whole number is the whole number, and some of these
          // languages cannot decide which Round was meant if asked.
          if (/^(round|floor|ceiling|ceil|int|integer)$/.test(low) && kinds[0] === "int") {
            return codes[0];
          }
          if (/^(int|integer)$/.test(low) && kinds[0] === "text" && L.parseInt) { return L.parseInt(codes[0]); }
          return L.calls[low].call(L, codes, kinds, w, node.args);
        }
        if (low === "random" && L.calls.random) { return L.calls.random.call(L, [], [], w); }
        // a function kept in a name: called through the name, wherever it is kept
        if (w.entry(node.call)) {
          return L.callFn ? L.callFn(w.named(node.call), codes, w) : w.named(node.call) + "(" + codes.join(", ") + ")";
        }
        return safe(node.call) + "(" + codes.join(", ") + ")";
      },

      // ---- a module's first line -----------------------------------------
      signature: function (one) {
        var how = w.plan(one);
        return one.params.map(function (p) {
          var said = L.param(w, p, p.ref && (how === "own" || how === "box") ? how : "");
          // Function f(x, by = 1): by is 1 unless it is handed one
          if (L.paramDefault && p.dflt && !p.ref) { said += L.paramDefault(w.code(p.dflt), p.dflt, p.entry && p.entry.kind) || ""; }
          return said;
        }).join(", ");
      },
      // A Module returns nothing and a Function returns something.  The
      // fallback used to be the same "double" a plain variable gets, so
      // every Module came out `static double greet(...)` with a bare
      // `return;` in it -- which is not Java, and will not compile.
      returns: function (one) {
        if (!L.kinds) { return ""; }
        if (w.plan(one) === "back") { return L.typed(one.refs[0].entry, w).trim(); }
        if (one.givesNone && L.boxedKind && L.boxedKind[one.gives]) { return L.boxedKind[one.gives]; }
        if (one.wide && one.gives === "int" && L.bigInt) { return L.bigInt; }
        return one.gives ? w.typeOf(one.gives) : "void";
      },
      // Is what this comes to past what an int holds (wideNames)?
      isWide: function (node) { return !!L.bigInt && wideIn(node, w.scope, prog); },
      // A list of longs: memo[] holding Fibonacci numbers.  Java's lists
      // will not take an int added to a list of Longs, so there it is one
      // only where the program's lists are arrays.
      wideList: function (entry) {
        return !!(entry && entry.elemWide && L.bigInt && entry.kind === "list:int" &&
                  (L.ext !== "java" || (L.asArrays && L.asArrays(w))));
      },
      // A table of longs: memo[n] = fib(n - 1) + fib(n - 2)
      wideTable: function (entry) {
        return !!(entry && entry.elemWide && L.bigInt && isTableKind(entry.kind) && tableValue(entry.kind) === "int");
      },
      // its type, as it would be and as it is: Dictionary<int, long>
      tableTypes: function (entry) {
        var plain = typeOfKind(L, entry.kind, w);
        var one = L.ext === "java" ? "Integer" : "int", wide = L.ext === "java" ? "Long" : L.bigInt;
        return { plain: plain, wide: plain.replace(new RegExp(one + ">$"), wide + ">") };
      },
      // ...and whatever is written about one, written with long for int
      withWide: function (entry, fn) {
        if (w.wideTable(entry)) {
          var said = fn(), t = w.tableTypes(entry);
          return typeof said === "string" ? said.split(t.plain).join(t.wide) : said;
        }
        if (!w.wideList(entry)) { return fn(); }
        var keep = L.kinds;
        L.kinds = Object.assign({}, keep, { "int": L.bigInt });
        try { return fn(); } finally { L.kinds = keep; }
      },

      zero: function (kind, entry) {     // what a name holds before it is given anything
        // a list that can hold nothing-yet among its numbers: List<int?>
        if (entry && entry.elemNullable && L.nullableList && isListKind(kind) && L.boxedKind && L.boxedKind[elemOf(kind)]) {
          return "new " + L.nullableList(elemOf(kind)) + "()";
        }
        // a record laid out field by field: declared, it is one, ready to fill in
        if (isRecKind(kind) && laidRecord(w.prog, kind.slice(4))) {
          return L.newRecord(laidRecord(w.prog, kind.slice(4)).name, w);
        }
        if (isListKind(kind) || isTableKind(kind) || isRecKind(kind)) { return L.emptyOf(kind, w); }
        if (kind === "any" && L.anyZero) { return L.anyZero; }
        if (kind === "fn" || kind === "any") { return L.nullValue || (L.yes === "True" ? "None" : "null"); }
        return kind === "text" ? '""' : kind === "bool" ? L.no : "0";
      },
      // ---- lists, tables and records -------------------------------------
      typeOf: function (kind) { return typeOfKind(L, kind, w); },
      fieldName: function (name) { return safe(name); },
      // A value going into a place that holds `kind`: made whole where the
      // place holds whole numbers, as fitted() does for a name.
      fitIn: function (node, kind) {
        if (node.str === "" && w.nothingFor(kind)) { return w.nothingFor(kind); }
        var code = asCode(node, w, kind);
        if (L.fromAny && kind && kind !== "any" && w.kind(node) === "any") { return L.fromAny(code, kind, w); }
        if (L.narrow && kind === "int" && w.kind(node) === "real") { return L.narrow(code); }
        if (L.widen && kind === "real" && w.kind(node) === "int") { return L.widen(code); }
        return code;
      },
      // A Set or an Input into a place: grid[y][x], prices["tea"], p.x.
      // `code` is what goes there already written; else `src`, to be.
      store: function (said, src, code) {
        var node = tree(said);
        var into = w.kind(node);
        var put = code !== undefined ? code : w.fitted(src, into);
        if (code === undefined && L.widen && into === "real" && w.kind(tree(src)) === "int") { put = L.widen(put); }
        if (node.index) {
          var hk = w.kind(node.index), holder = asCode(node.index, w), at = asCode(node.at, w);
          if (L.bigInt && L.narrow && w.isWide(node.at)) { at = L.narrow(at); }
          // a long put into a list of ints
          if (code === undefined && into === "int" && L.bigInt && L.narrow && !w.wideList(listEntryOf(node)) &&
              !w.wideTable(listEntryOf(node)) && w.isWide(tree(src))) {
            put = L.narrow(put);
          }
          // Java's table of Longs takes no int
          if (code === undefined && L.ext === "java" && w.wideTable(listEntryOf(node)) && !w.isWide(tree(src))) {
            put = "(" + L.bigInt + ") " + held(put);
          }
          if (isTableKind(hk)) { return L.putIn(holder, at, put, hk, w); }
          if (hk === "text" && L.setChar) { return L.setChar(holder, at, put, w); }
          return L.setAt(holder, at, put, hk, w);
        }
        if (node.field) {
          var fk = w.kind(node.field);
          if (isTableKind(fk)) { return L.putIn(asCode(node.field, w), quoted(node.name), put, fk, w); }
          return L.partOf(asCode(node.field, w), w.fieldName(node.name), fk, w) + " = " + put;
        }
        return asCode(node, w) + " = " + put;
      },
      // Declare Boolean seen[h][w] = True: h lists of w, each filled with
      // what it says (or what a name of that type starts off as) -- and
      // nothing, where the Declare gives no sizes or is given a whole list.
      sizedList: function (item, entry) {
        var sizes = [];
        for (var d = 0; d < (item.dims || []).length; d++) {
          if (!String(item.dims[d]).trim()) { break; }
          sizes.push(item.dims[d]);
        }
        if (!sizes.length) { return ""; }
        if (item.expr && isListKind(w.kind(tree(item.expr)))) { return ""; }
        var inner = entry.kind;
        sizes.forEach(function () { inner = elemOf(inner) || inner; });
        var fill = item.expr ? w.fitIn(tree(item.expr), inner) : w.zero(inner);
        if (!item.expr && inner === "real" && L.widen) { fill = L.widen(fill); }
        var nodes = sizes.map(tree);
        return L.lists.newlist.call(L, nodes.map(function (n) { return asCode(n, w); }).concat([fill]),
                                    nodes.map(function () { return "int"; }).concat([inner]), w,
                                    nodes.concat([item.expr ? tree(item.expr) : { lit: fill }]));
      },
      // Does working these out call a module that prints or asks?
      speaksIn: function (srcs) {
        if (!prog.speakers) {
          var talk = Object.create(null), more = true;
          prog.mods.forEach(function (one) {
            eachStep(one.body, function (st) { if (st.op === "display" || st.op === "input") { talk[lowered(one.name)] = true; } });
          });
          while (more) {
            more = false;
            prog.mods.forEach(function (one) {
              if (talk[lowered(one.name)]) { return; }
              eachStep(one.body, function (st) {
                var trees = sumsOf(st).map(tree);
                if (st.op === "call") { trees.push(callOf(st)); }
                trees.forEach(function (node) {
                  eachCall(node, function (c) {
                    if (talk[lowered(c.call)] && !talk[lowered(one.name)]) { talk[lowered(one.name)] = true; more = true; }
                  });
                });
              });
            });
          }
          prog.speakers = talk;
        }
        var said = false;
        srcs.forEach(function (src) {
          eachCall(tree(src), function (c) { if (prog.speakers[lowered(c.call)] && !w.entry(c.call)) { said = true; } });
        });
        return said;
      },
      // What a For Each's own body does to the list it goes round: "grow"
      // where it adds, takes away, reorders or hands it to a module, "set"
      // where it only puts into its places, "" where it leaves it be.
      listChangedIn: function (item) {
        var over = tree(item.over || "");
        if (!over.name || over.field || over.call || !isListKind(w.kind(over))) { return ""; }
        var low = lowered(over.name), said = "";
        function rootIs(node) {
          while (node && (node.index || node.group)) { node = node.index || node.group; }
          return !!node && !!node.name && !node.field && lowered(node.name) === low;
        }
        eachStep(item.body, function (one) {
          if ((one.op === "set" || one.op === "input") && one["var"] && !R_JUST_A_NAME.test(one["var"]) &&
              rootIs(tree(one["var"]))) { said = said || "set"; }
          var trees = sumsOf(one).map(tree);
          if (one.op === "call") { trees.push(callOf(one)); }
          trees.forEach(function (node) {
            eachCall(node, function (call) {
              var name = lowered(call.call), own = prog.byName[name];
              if ((own || CHANGES_ITS_FIRST[name]) && (call.args || []).some(function (a, i) {
                return (own || i === 0) && rootIs(a);
              })) { said = "grow"; }
            });
          });
        });
        return said;
      },
      // Is this sure never to come to less than nought (18-ahead, signsOf)?
      nonNeg: function (node) { return nonNegIn(node, w.scope, prog); },
      // A name of main's that the whole program shares as well -- the same
      // name set above every module and declared again inside Module main
      // -- in a language that writes main's lines where the shared names
      // are: one name there, declared once.
      sharedToo: function (entry) {
        if (!L.mainAtTop || w.scope !== prog.main || !entry) { return false; }
        var other = prog.shared.names[lowered(entry.name)];
        return !!other && other !== entry;
      },
      // x = x + 1 as x++ (x += 1 in Python), total = total + price as
      // total += price: the same sum, said the way anybody says it.  Only
      // for a number or some words -- a list added to with += is changed in
      // place, where any other name for it would see the change -- and only
      // where the place costs nothing to work out twice.
      shorter: function (line, node, kind) {
        var op = node && node.op, cut = line.indexOf(" = ");
        if (cut < 1 || !(op === "+" || op === "-" || op === "*") || !/^(int|real|text)$/.test(kind) ||
            (kind === "text" && op !== "+") || !node.left) { return line; }
        var place = line.slice(0, cut), code = line.slice(cut + 3), head = place + " " + op + " ";
        if (/[()"'\x60]/.test(place) || code.indexOf(head) !== 0 || w.write(node.left) !== place) { return line; }
        var rest = code.slice(head.length);
        if (!rest) { return line; }
        if (rest === "1" && op === "*") { return line; }
        if (rest === "1" && L.semi && kind !== "text") { return place + op + op; }
        if (wrappedWhole(rest)) { rest = rest.slice(1, -1); }
        return place + " " + op + "= " + rest;
      },
      // Does this statement declare the name, as the first to give it
      // something (tightNames)?  And does this loop declare its own counter?
      declaresHere: function (item, entry) {
        var mine = entry && entry.tight && prog.declares && prog.declares.get(item);
        return !!mine && mine.indexOf(entry) >= 0;
      },
      bareDeclare: function (entry) {    // int total -- no value, none needed
        return L.lead(false, false) + L.typed(entry, w) + w.spelled(entry);
      },
      ownLoop: function (item, entry) {
        return !!entry && (!!entry.perLoop || w.declaresHere(item, entry));
      },
      // The names the whole program shares that nobody declared.
      sharedLines: function (deep) {
        if (!L.hoists) { return; }
        Object.keys(prog.shared.names).forEach(function (low) {
          var entry = prog.shared.names[low];
          if (entry.hoist) {
            w.line(deep, L.declare(w, entry, w.zero(entry.kind, entry), false, true) + L.semi);
          }
        });
      },

      // ---- one chart: main's statements, or a module's -------------------
      inside: function (one, deep, items) {
        var wasScope = w.scope, wasWhere = w.where, wasBoxes = w.boxes;
        w.scope = one ? one.scope : prog.main;
        w.where = one || null;
        w.boxes = {};
        items = items || w.scope.items;
        var how = one ? w.plan(one) : "";
        if (how === "box") {
          one.refs.forEach(function (p) { w.boxes[lowered(p.name)] = true; });
        }
        var started = out.length;
        if (one && one.refs.length && !how) {
          w.line(deep, L.note + one.refs.map(function (p) { return p.name; }).join(", ") +
                 ": handed over by value here -- " + L.name +
                 " cannot give it back as well as an answer");
        }
        // Python's `global`, where a module writes to a name the whole
        // program shares.  Split into files there is no such name here to
        // say it about: what is shared is an attribute of the file that
        // holds it, and setting one of those never made a local anyway.
        if (one && L.shares && !w.apart) {
          var mine = [];
          eachStep(items, function (item) {
            targetsOf(item, prog).forEach(function (who) {
              var entry = lookUp(w.scope, who);
              if (entry && entry.shared && mine.indexOf(safe(entry.name)) < 0) {
                mine.push(safe(entry.name));
              }
            });
          });
          if (mine.length) { w.line(deep, L.shares(mine)); }
        }
        if (L.hoists) {
          Object.keys(w.scope.names).forEach(function (low) {
            var entry = w.scope.names[low];
            if (entry.hoist && !w.sharedToo(entry)) {
              w.line(deep, w.withWide(entry, function () {
                return entry.bare ? w.bareDeclare(entry) : L.declare(w, entry, w.zero(entry.kind, entry), false, true);
              }) + L.semi);
            }
          });
        }
        var tail = "";
        if (how === "back" && !w.leaves(items)) {
          tail = "return " + L.handBack(one.refs.map(function (p) {
            return w.named(p.name);
          }));
        } else if (one && one.gives && L.kinds && !w.leaves(items)) {
          // A Function that can reach its end without returning anything
          // does not compile.  The runner hands back nothing at all there.
          tail = "return " + w.zero(one.gives);
        }
        w.block(items, deep, !!tail || out.length > started);
        if (tail) { w.line(deep, tail + L.semi); }
        w.scope = wasScope; w.where = wasWhere; w.boxes = wasBoxes;
      },

      // Does this run of statements always leave, so that nothing written
      // after it could ever be reached?  An End inside a module stops the
      // program without being a `return`, so it does not count there.
      // Any one of them that always leaves is enough: what follows it is
      // never reached.
      leaves: function (items) {
        return (items || []).some(function (last) {
          if (last.op === "end") { return !w.where; }
          if (last.op === "return") { return true; }
          if (last.op === "if") {
            return w.leaves(last.then) && w.leaves(last["else"] || []);
          }
          if (last.op === "select") {
            return last.cases.some(function (one) {
                     return OTHERWISE.test(String(one.match || "").trim());
                   }) && last.cases.every(function (one) { return w.leaves(one.body); });
          }
          return false;
        });
      },

      block: function (items, deep, quietly) {
        var started = out.length;
        for (var i = 0; i < (items || []).length; i++) {
          w.before = i ? items[i - 1] : null;  // what an Input may take as its question
          var placed = L.hoists && prog.before && prog.before.get(items[i]);
          (placed || []).forEach(function (entry) {
            if (w.sharedToo(entry)) { return; }
            w.line(deep, (entry.bare ? w.bareDeclare(entry)
                          : L.declare(w, entry, w.zero(entry.kind, entry), false, true)) + L.semi);
          });
          each(items[i], deep);
          // Whatever follows a Return can never run, and Java will not
          // compile a line that can never run.
          if (items[i].op === "return" || items[i].op === "end") { break; }
          if (L.kinds && items[i].op === "if" && w.leaves([items[i]])) { break; }
        }
        // A block with nothing in it -- or nothing but a remark -- is not a
        // block at all in Python, and wants saying so in the others.
        var real = out.slice(started).some(function (row) {
          return row.trim() && row.trim().indexOf(L.note.trim()) !== 0;
        });
        if (!real && !quietly) { w.line(deep, L.nothing); }
      },
      each: function (item, deep) { each(item, deep); },

      // A Select Case as a chain of ifs, for the languages and the cases a
      // switch will not take.
      chain: function (item, deep) {
        var subject = tree(item.expr), rest = null, other = null;
        item.cases.forEach(function (one) {
          if (OTHERWISE.test(String(one.match || "").trim())) { other = one; }
        });
        var tests = item.cases.filter(function (one) { return one !== other; });
        if (!tests.length) {
          if (other) { w.block(other.body, deep, true); }
          return;
        }
        // Select abs(roll()) MOD 4 is worked out once, as the runner works it
        // out, and not again for every Case -- each of which would roll
        // again, and do the sum again.  It goes in a name of its own first.
        var looks = 0, kind = w.kind(subject), held = null, braced = false;
        tests.forEach(function (one) {
          looks += one.any ? one.any.reduce(function (n, piece) { return n + (piece.is !== undefined ? 1 : 2); }, 0) : 1;
        });
        if (looks > 1 && workedOut(subject) && /^(int|real|text|bool)$/.test(kind)) {
          held = { name: w.spare("choice"), kind: kind, wide: kind === "int" && w.isWide(subject) };
          w.scope.names[lowered(held.name)] = held;
          // straight inside a switch's case, a C++ declaration would be
          // jumped over by the next case, which the compiler refuses
          braced = !!L.shut && w.caseDeep === deep;
          if (braced) { w.line(deep, "{"); deep++; }
          w.line(deep, L.declare(w, held, w.write(subject), true, false) + L.semi);
          subject = tree(held.name);
        }
        for (var i = tests.length - 1; i >= 0; i--) {
          rest = { op: "if", chained: i > 0,
                   test: caseTest(subject, tests[i]),
                   then: tests[i].body,
                   "else": rest ? [rest] : (other ? other.body : []) };
        }
        each(rest, deep);
        if (held) { delete w.scope.names[lowered(held.name)]; }
        if (braced) { w.line(deep - 1, "}"); }
      },

      // A name for something the writer holds on to that the program never
      // named: choice, choice2 -- never one the program, the language or
      // another of these in the same module already has.
      spared: {},
      spare: function (base) {
        var home = (w.where ? lowered(w.where.name) : "") + ":";
        for (var n = 1; ; n++) {
          var said = n > 1 ? base + n : base, low = lowered(said);
          if (!lookUp(w.scope, said) && !prog.byName[low] && !(prog.records && prog.records[said]) &&
              !L.kept[said] && safe(said) === said && !w.spared[home + low]) {
            w.spared[home + low] = true;
            return said;
          }
        }
      }
    };

    var NEGATED = { "<": ">=", "<=": ">", ">": "<=", ">=": "<", "=": "<>", "<>": "=", "==": "!=", "!=": "==" };

  // "(a + b)", in brackets that close at its very end, and not "(a) + (b)"
    function wrappedWhole(code) {
      if (code.charAt(0) !== "(" || code.charAt(code.length - 1) !== ")") { return false; }
      var depth = 0, quote = "";
      for (var i = 0; i < code.length; i++) {
        var c = code.charAt(i);
        if (quote) { if (c === "\\") { i++; } else if (c === quote) { quote = ""; } continue; }
        if (c === '"' || c === "'") { quote = c; continue; }
        if (c === "(") { depth++; }
        if (c === ")") { depth--; if (!depth && i < code.length - 1) { return false; } }
      }
      return depth === 0;
    }

    // memo[n]: the name of the list it is a place in
    function listEntryOf(node) {
      var at = node && node.index;
      return at && at.name && !at.field && !at.index && !at.call ? w.entry(at.name) : null;
    }

    // Does working this out call one of the program's own modules?
    function callsMine(node) {
      var hit = false;
      eachCall(node, function (c) { if (prog.byName[lowered(c.call)] && !w.entry(c.call)) { hit = true; } });
      return hit;
    }

    // Worth working out only once: anything more than a name, a number or
    // a place in a list or record.
    function workedOut(node) {
      if (!node) { return false; }
      if (node.call || node.op || node.unary) { return true; }
      if (node.group) { return workedOut(node.group); }
      if (node.index) { return workedOut(node.index) || workedOut(node.at); }
      if (node.field) { return workedOut(node.field); }
      return false;
    }

    function shut(deep) { if (L.shut) { w.line(deep, L.shut); } }

    // An If, and whatever answers it.  An "Else If" in the pseudocode is
    // another answer to the same question, not a fresh question inside the
    // Else -- so it is written as one: elif, else if.  It used to open a
    // whole new block for each, and a five-way grade check came out indented
    // five deep, which is nobody's idea of the code they meant to write.  An
    // If that really is inside an Else still nests, because it really is.
    function question(item, deep, open) {
      open(L.test(item.test ? asCode(item.test, w) : w.tested(item.cond)) + L.open);
      w.block(item.then, deep + 1);
      var other = item["else"] || [];
      if (!other.length) { shut(deep); return; }
      if (other.length === 1 && other[0].op === "if" && other[0].chained) {
        question(other[0], deep, function (rest) {
          L.chain(w, deep, L.elseIf + rest);
        });
        return;
      }
      L.chain(w, deep, "else" + L.open);
      w.block(other, deep + 1);
      shut(deep);
    }

    // swap(array[i], array[i + 1]), the textbook's bubble sort: a place in a
    // list or a record handed to a module to change, which is put back into
    // afterwards the way a Set puts into it.  (A letter of some words is no
    // such place, and nor is a place in a table.)
    w.refPlace = function (src) {
      src = String(src || "").trim();
      if (!src || R_JUST_A_NAME.test(src)) { return null; }
      var node = tree(src), at = node;
      if (!node.index && !node.field) { return null; }
      while (at.index || at.field) {
        var holder = w.kind(at.index || at.field);
        if (at.index ? !isListKind(holder) : !isRecKind(holder) && holder !== "") { return null; }
        at = at.index || at.field;
      }
      return at.name && !at.call ? node : null;
    };

    // For Each i In range(0, n) -- Python's own for, read in -- as the count
    // it is: from, to (not reached) and by how much, or null where it is
    // not a count a counted `for` goes through the same way.  `exact` is
    // for a language whose own loop is range()'s: it only needs the call
    // to be the built-in one.
    w.rangeOf = function (item, exact) {
      var node = tree(item.over || "");
      if (!node.call || node.field || lowered(node.call) !== "range" ||
          prog.byName.range || w.entry("range")) { return null; }
      var a = node.args || [];
      if (!a.length || a.length > 3) { return null; }
      if (a.some(function (one) { return w.kind(one) !== "int"; })) { return null; }
      var by = 1;
      if (a.length === 3) {
        var s = a[2], n = s.lit !== undefined ? Number(s.lit)
              : s.unary === "-" && s.of.lit !== undefined ? -Number(s.of.lit) : NaN;
        if (!n || n !== Math.trunc(n)) { return exact ? {} : null; }
        by = n;
      }
      var out = { from: a.length > 1 ? w.write(a[0]) : "0", to: w.write(a[a.length > 1 ? 1 : 0]),
                  by: by, down: by < 0, codes: a.map(function (one) { return w.write(one); }) };
      if (exact) { return out; }
      // a counted for leaves its counter one past where For Each did, goes
      // round as often as the counter says rather than once a number, and
      // looks at where it stops every time round
      var ends = [];
      a.forEach(function (one) {
        tokens(w.write(one)).forEach(function (tok) { if (tok.t === "name") { ends.push(tok.v); } });
      });
      if (counterReadAfter(prog, item, item["var"]) ||
          setInside(item.body, [item["var"]].concat(ends), prog)) { return null; }
      return out;
    };

    // A Call.  Most are a line; one that hands something over by reference
    // may need the answer putting back where it came from afterwards.
    function call(item, deep) {
      var one = prog.byName[lowered(item.name)];
      var given = pieces(item.args || "");
      var how = one ? w.plan(one) : "";
      if (how === "box") { L.boxCall(w, one, given, deep); return; }
      if (how === "own" && L.refTemps && !(L.asArrays && L.asArrays(w)) &&
          one.params.some(function (p, i) { return p.ref && w.refPlace(given[i]); })) {
        L.refTemps(w, one, given, deep);
        return;
      }
      w.statement = true;
      var code = w.calling(callOf(item));
      w.statement = false;
      // pop(xs) on a line of its own: what it hands back is thrown away,
      // and a cast in front of a call that nothing reads is not a statement
      if (L.kinds) { code = code.replace(/^\((?:int|double|boolean|bool)\)\s*/, ""); }
      if (how === "back") {
        var any = false, first = null, places = [];
        var targets = one.params.map(function (p, i) {
          if (!p.ref) { return undefined; }
          var mine = R_JUST_A_NAME.test(given[i] || "") ? given[i].trim() : "";
          if (mine) { any = true; first = first || { mine: w.entry(mine), p: p }; }
          if (mine) { return w.named(mine); }
          var place = w.refPlace(given[i]);
          if (place) { any = true; places.push({ src: given[i].trim(), node: place, p: p }); return asCode(place, w); }
          return null;
        }).filter(function (t) { return t !== undefined; });
        if (any && targets.length === 1 && places.length === 1) {
          // one answer, going into a place: put there the way a Set puts it
          var put = places[0];
          if (L.narrow && w.kind(put.node) === "int" && put.p.entry.kind === "real") { code = L.narrow(code); }
          code = w.store(put.src, undefined, code);
        } else if (any) {
          if (L.narrow && targets.length === 1 && first && first.mine &&
              first.mine.kind === "int" && first.p.entry.kind === "real") {
            code = L.narrow(code);
          }
          code = L.takeBack(targets) + " = " + code;
        }
      }
      w.line(deep, code + L.semi);
    }

    function each(item, deep) {
      var entry, code;
      switch (item.op) {
        case "declare":
          entry = lookUp(globalItem(item, prog) ? prog.shared : w.scope, item.var);
          // declared where it is first given something (tightNames), or
          // here without a value, since nothing reads the one it would have
          if (entry && entry.tight) { break; }
          if ((w.wideList(entry) || w.wideTable(entry)) && !item.wideDone) {
            item.wideDone = true;
            try {
              var wideLines = w.aside(function () { w.withWide(entry, function () { each(item, deep); }); });
              w.pour(wideLines.map(function (row) { return w.withWide(entry, function () { return row; }); }));
            } finally { item.wideDone = false; }
            break;
          }
          if (entry && entry.bare && !globalItem(item, prog) && !w.sharedToo(entry)) {
            if (L.hoists) { w.line(deep, w.bareDeclare(entry) + L.semi); }
            break;
          }
          code = w.sizedList(item, entry) ||
                 (item.expr ? w.fitted(item.expr, entry.kind, entry) : w.zero(entry.kind, entry));
          if (L.hoists && entry.hoist) {
            // Declared already, at the top of the chart.  What is left of a
            // Declare then is what it starts the name off as -- which only
            // matters where it said, or where it is gone round again.
            var spot = entry.spots.filter(function (s) { return s.item === item; })[0];
            if (item.expr || (spot && spot.deep > 0)) {
              w.line(deep, w.named(item.var) + " = " + code + L.semi);
              if (L.afterDeclare) { L.afterDeclare(w, w.named(item.var), code, deep); }
            }
            break;
          }
          if (w.sharedToo(entry) && item.scope !== "global") {
            w.line(deep, w.named(item.var) + " = " + code + L.semi);
            break;
          }
          w.line(deep, L.declare(w, entry, code, (!!item.const && !(entry && entry.setAgain)) ||
                                 !!(L.constLocals && entry && entry.writes === 0 && !entry.shared),
                                 isLiteral(tree(item.expr || "0"))) + L.semi);
          if (L.afterDeclare) { L.afterDeclare(w, w.named(item.var), code, deep); }
          break;
        case "set":
          // Set scores[pick()] = mark(): the runner works out what goes in
          // before where it goes, as Python and C++ do, and JavaScript, Java
          // and C# the other way round.  Where both call a module of the
          // program's, what goes in is worked out first, into a name.
          if (L.leftFirst && !R_JUST_A_NAME.test(item["var"] || "") &&
              callsMine(tree(item["var"])) && callsMine(tree(item.expr))) {
            var into = w.kind(tree(item["var"]));
            if (/^(int|real|text|bool)$/.test(into)) {
              var heldValue = { name: w.spare("value"), kind: into };
              w.line(deep, L.declare(w, heldValue, w.fitted(item.expr, into), false, false) + L.semi);
              w.line(deep, w.store(item["var"], undefined, w.spelled(heldValue)) + L.semi);
              break;
            }
          }
          if (!R_JUST_A_NAME.test(item["var"] || "")) {
            w.line(deep, w.shorter(w.store(item["var"], item.expr), tree(item.expr),
                                   w.kind(tree(item["var"]))) + L.semi);
            break;
          }
          entry = w.entry(item.var);
          code = w.withWide(entry, function () { return w.fitted(item.expr, entry ? entry.kind : "", entry); });
          if (L.hoists && entry && (entry.born === item || w.declaresHere(item, entry))) {
            w.line(deep, L.declare(w, entry, code, !!(L.constLocals &&
                   (entry.tight ? entry.once : entry.writes === 1)), false) + L.semi);
          } else {
            w.line(deep, w.shorter(w.named(bareName(item.var)) +
                   String(item.var).slice(bareName(item.var).length).trim() +
                   " = " + code, tree(item.expr), entry ? entry.kind : "") + L.semi);
          }
          break;
        case "display":
          // Display "Total: ", total(xs) where total() prints as well: the
          // line is worked out first and then printed, as the runner does --
          // a C++ stream would have "Total: " out before total() spoke
          if (L.sayLater && w.speaksIn(pieces(item.parts || ""))) { L.sayLater(w, saying(item.parts, w), deep); break; }
          w.line(deep, L.say(saying(item.parts, w)) + L.semi);
          break;
        case "input":
          entry = R_JUST_A_NAME.test(item.var || "") ? w.entry(item.var) : null;
          if (!entry && item["var"]) {
            // into a place: what is typed, made what the place holds
            var placeKind = w.kind(tree(item["var"]));
            var ask0 = w.before && w.before.op === "display" ? "" : quoted(say("code_ask", { name: item["var"].trim() }));
            if (ask0 && L.hint) { w.line(deep, L.hint(ask0) + L.semi); ask0 = ""; }
            w.line(deep, w.store(item["var"], null,
                   L.ask(placeKind === "int" ? "whole" : placeKind === "real" ? "real"
                         : placeKind === "bool" ? "flag" : "text", w, ask0)) + L.semi);
            break;
          }
          if (!entry) { w.line(deep, L.note + item.text); break; }
          // The runner puts a box on the tape to type into.  The program on
          // its own used to ask for nothing out loud at all: run in a
          // terminal it printed not a word and sat there waiting, which
          // looks exactly like a program that never started.  A Display just
          // before is already the question; without one it asks by name, as
          // the box does.  Some languages ask inside the read itself --
          // input("Enter n: ") -- and the rest print the question first.
          var asking = w.before && w.before.op === "display" ? ""
                     : quoted(say("code_ask", { name: item.var.trim() }));
          if (asking && L.hint) {
            w.line(deep, L.hint(asking) + L.semi);
            asking = "";
          }
          code = L.ask(entry.kind === "int" ? "whole" : entry.kind === "real" ? "real"
                     : entry.kind === "bool" ? "flag" : "text", w, asking);
          if (L.hoists && (entry.born === item || w.declaresHere(item, entry))) {
            w.line(deep, L.declare(w, entry, code, !!(L.constLocals &&
                   (entry.tight ? entry.once : entry.writes === 1)), false) + L.semi);
          } else {
            w.line(deep, w.named(item.var.trim()) + " = " + code + L.semi);
          }
          break;
        case "wait":
          // The chart can be run at the program's own timing, so the code
          // written from it waits too -- the promise everywhere else here
          // is that what you read is what you just watched.
          if (L.pause) { L.pause(w, item, deep); }
          else { w.line(deep, L.note + item.text); }
          break;
        case "call": call(item, deep); break;
        case "return":
          // Main has nothing to return to: leaving it is ending the program.
          if (!w.where) { w.line(deep, L.quit(w, true) + L.semi); break; }
          if (w.plan(w.where) === "back") {
            code = " " + L.handBack(w.where.refs.map(function (p) { return w.named(p.name); }));
          } else if (item.expr) {
            code = " " + w.fitted(item.expr, w.where.gives, w.where);
          } else {
            code = (w.where.gives && L.kinds) ? " " + w.zero(w.where.gives) : "";
          }
          w.line(deep, "return" + code + L.semi);
          break;
        case "end":
          w.line(deep, L.quit(w, !w.where) + L.semi);
          break;
        case "if":
          question(item, deep, function (rest) { w.line(deep, "if " + rest); });
          break;
        case "while":
          if (!item.cond) { w.line(deep, L.note + item.text); break; }
          code = item.until ? w.negated(item.cond) : w.tested(item.cond);
          w.line(deep, "while " + L.test(code) + L.open);
          w.block(item.body, deep + 1);
          shut(deep);
          break;
        case "dowhile": L.repeat(w, item, deep); break;
        case "foreach":
          var counted = L.countRange && w.rangeOf(item, L.countRange.exact);
          if (counted && counted.codes) { L.countRange(w, item, counted, deep); break; }
          // a list the loop itself changes: gone round by its places, as
          // the runner goes round it, where the language's own for would
          // stop on it (C# on any change, Java and C++ on one that adds or
          // takes away)
          var changes = L.walkByIndex && w.listChangedIn(item);
          if (changes && L.walkByIndex(w, item, changes)) {
            L.indexLoop(w, item, deep);
            break;
          }
          L.forEach(w, item, deep);
          break;
        case "for": L.count(w, item, deep); break;
        case "select": L.pick(w, item, deep); break;
        case "start": break;
        // Exit While, Exit For, Break: out of the loop it is in, the one
        // word every language here has for it
        case "exit": w.line(deep, "break" + L.semi); break;
        default:
          w.line(deep, L.note + item.text);
      }
    }

    // Several files, where there is more than one chart to put in them and
    // this language has an answer for what that looks like.  Each one comes
    // back as its own run of lines, written in w.aside so that none of them
    // lands in `out` -- which is the one file's, and is still there to fall
    // back on if the split turns out to be a split into one.
    if (apart && L.apart && prog.mods.length && !Object.keys(recordsIn(prog)).length) {
      // What each file is called: the module's own name, spelled the way
      // this language spells the file that holds one -- and never the same
      // as another, because two names that differ only in their capitals
      // are one file on most disks, and because the main file and the
      // shared one are already called something.
      var taken = Object.create(null);
      w.sharedFile = L.fileName ? L.fileName(L.sharedName) : L.sharedName;
      taken[lowered(name)] = taken[lowered(w.sharedFile)] = true;
      w.files = Object.create(null);
      // nor another module's name: Calc2's class called Calc22, beside a
      // module Calc22, is a method there and not the class at all
      var modNames = Object.create(null);
      prog.mods.forEach(function (one) { modNames[lowered(one.name)] = true; });
      prog.mods.forEach(function (one) {
        var base = L.fileName ? L.fileName(safe(one.name)) : safe(one.name);
        var file = base, n = 2;
        while (taken[lowered(file)] || L.kept[file] || L.kept[lowered(file)] ||
               R_TAKEN_FILE.test(file) || (L.ownName && file === safe(one.name, true)) ||
               (modNames[lowered(file)] && lowered(file) !== lowered(one.name))) {
          file = base + n++;
        }
        taken[lowered(file)] = true;
        w.files[lowered(one.name)] = file;
      });
      // And now that they have names, those names are taken.  Only where
      // the file's name is a name inside the program -- Python's import,
      // JavaScript's require, the class Java and C# reach through.  C++
      // includes a file without learning its name, so nothing there is in
      // anybody's way.
      if (L.reachMod) {
        homes[w.sharedFile] = "shared";
        Object.keys(w.files).forEach(function (low) {
          if (!homes[w.files[low]]) { homes[w.files[low]] = true; }
        });
      }
      w.apart = true;
      var many = L.apart(w);
      if (many.length > 1) {
        return many.map(function (one) {
          return { text: one.lines.join("\n"), file: one.name,
                   ext: one.ext || L.ext, head: one.head || "" };
        });
      }
      w.apart = false;
    }
    L.whole(w);
    return [{ text: out.join("\n"), file: name, ext: L.ext }];
  }

  // One file, which is what everything that only ever wanted one asks for --
  // the screen with a program on it, and tests/written.py, which runs what
  // this writes in every language it can find a compiler for.
  // ------------------------------------- writing it out, a piece at a time --
  // Asking for the code used to be one statement that did everything and
  // handed the program back: read the whole thing through to work out what
  // every name holds, then write it out in the language asked for.  On a
  // chart of twenty thousand shapes that is most of a second, and it was
  // spent with the page stopped dead -- no scroll, no button, nothing
  // drawn -- which reads as the thing having crashed rather than as it
  // working.
  //
  // So the work is handed back as a run of pieces instead, and whoever
  // asked runs them.  The page runs one a frame and draws in between, so
  // the screen is up and saying what it is doing the whole way through;
  // written() below runs the lot in one go, which is what tests/run.py
  // wants and what everything that has no page to keep answering wants.
  //
  // None of the pieces is the whole of the work, and none of them knows it
  // is being run this way: they are the passes that were always there.

  // The reading, kept against the program it was of.  It is the same
  // reading whichever language comes out of it, so changing the language
  // -- or asking for the same program twice -- finds it rather than doing
  // it again.  Two are kept, because a program cut into parts is a second
  // program made out of the first and both are read.
  //
  // Nothing is kept until the last of the passes has run: a reading that
  // was interrupted halfway is not a reading, and handing one back later
  // as though it were would be worse than doing it again.
  var readKeep = [];

  function readAhead(ast) {
    for (var i = 0; i < readKeep.length; i++) {
      if (readKeep[i].ast === ast) {
        return { prog: readKeep[i].prog, steps: [] };
      }
    }
    var it = studying(ast);
    return { prog: it.prog, steps: it.steps.concat([function () {
      readKeep.unshift({ ast: ast, prog: it.prog });
      if (readKeep.length > 2) { readKeep.pop(); }
    }]) };
  }

  // And the programs already written out, against the chart they came from.
  // Opening the code a second time -- the same language, the same
  // one-file-or-several -- is finding it rather than writing it again,
  // which is the difference between half a second and none.  A new build
  // is a new chart and throws the lot away by simply not being it.
  var wroteKeep = { ast: null, by: null, chars: 0 };
  var WROTE_MOST = 8000000;              // characters kept, over all of them

  function wroteFound(key) {
    if (wroteKeep.ast !== AST) { wroteKeep = { ast: AST, by: {}, chars: 0 }; }
    return wroteKeep.by[key] || null;
  }

  function wroteKept(key, files) {
    var chars = files.reduce(function (n, one) { return n + one.text.length; }, 0);
    if (wroteKeep.chars + chars > WROTE_MOST) {
      wroteKeep = { ast: AST, by: {}, chars: 0 };
    }
    wroteKeep.by[key] = files;
    wroteKeep.chars += chars;
  }

  // One program, written out, as a run of pieces.  `files` is filled in by
  // the last of them.
  function writing(lang, apart) {
    var key = lang + (apart ? " apart" : " whole");
    var job = { files: wroteFound(key), left: 0, step: null };
    if (job.files) { job.step = function () { return false; }; return job; }

    var steps = [], at = 0;
    steps.push(function () {
      // A program that is one chart is cut into parts first, where there
      // is enough of it to be worth cutting; what comes back is a program
      // with charts in it, which is one this knows how to write out.
      var cut = apart ? cutUp(AST) : null;
      var read = readAhead(cut || AST);
      read.steps.forEach(function (one) { steps.push(one); });
      steps.push(function () {
        job.files = writeOut(lang, apart, read.prog);
        wroteKept(key, job.files);
      });
      job.left = steps.length - at;
    });
    job.left = 1;
    job.step = function () {             // one piece; whether any are left
      if (at >= steps.length) { return false; }
      steps[at++]();
      job.left = steps.length - at;
      return at < steps.length;
    };
    return job;
  }

  // The whole of it, in one go.
  function written(lang, apart) {
    var job = writing(lang, apart);
    while (job.step()) { /* on to the next piece */ }
    return job.files;
  }

  // One file, which is what everything that only ever wanted one asks for --
  // tests/written.py, which runs what this writes in every language it can
  // find a compiler for, and the screen when it is not asked for several.
  function codeFor(lang) { return written(lang, false)[0]; }
  function filesFor(lang) { return written(lang, true); }

  // The picker is the table above, so a language added there turns up in it
  // without anybody having to remember the list in the HTML as well.
  function listLanguages() {
    var pick = el("#see-code");
    if (pick) {
      Object.keys(LANGS).forEach(function (code) {
        for (var i = 0; i < pick.options.length; i++) {
          if (pick.options[i].value === code) { return; }
        }
        var one = document.createElement("option");
        one.value = code;
        one.textContent = LANGS[code].name;
        pick.appendChild(one);
      });
    }
    // The one in the bar over the code.  Pseudocode is not among them:
    // it is the thing the code was written out of, and picking it there
    // would be asking to leave rather than to change languages.
    var bar = el("#tape-lang");
    if (bar && !bar.options.length) {
      Object.keys(LANGS).forEach(function (code) {
        var one = document.createElement("option");
        one.value = code;
        one.textContent = LANGS[code].name;
        bar.appendChild(one);
      });
      bar.onchange = function () {
        showCode(bar.value);
      };
    }
  }
  listLanguages();

  function langName(lang) {              // Python, C# -- as the table says it
    // (and Rust, Kotlin -- the ones the page reads but does not write)
    return (LANGS[lang] || (typeof codeToPseudo !== "undefined" && codeToPseudo.dialects || {})[lang] || {}).name || lang;
  }

  // Whether the program is being asked for as one file or as a file for
  // each chart.  The card in the panel is where that is said, and it is
  // said once: changing the language in the bar over the code, or coming
  // in from the run, keeps whichever was asked for.
  function wantsApart() {
    var pick = el("#code-apart");
    return !!(pick && pick.value === "apart");
  }

  // What asking for a file each would get you, said under the card before
  // you ask.  A program drawn as modules is a file for each of them and
  // needs no saying.  One drawn as a single flow is cut into parts where
  // there is enough of it to be worth cutting, and comes out as the one
  // file where there is not -- and either way it says which, rather than
  // handing back one file as though what was asked for had happened.
  function codeNote() {
    var says = el("#code-note");
    if (!says) { return; }
    if (!wantsApart() || !AST || (AST.modules || []).length) {
      says.textContent = "";
      return;
    }
    var cut = null;
    try { cut = cutUp(AST); } catch (thrown) { cut = null; }
    says.textContent = cut ? say("c_cut_into", { n: cut.modules.length })
                           : TXT.c_one_chart;
  }

  // The way in from the run, where there is no card to read: it shows
  // whatever the card was left set to, and the picker in the bar over the
  // code changes the language without going back out to it.
  function askWhichCode() {
    if (!AST || !(AST.main || []).length) {
      tapeShow("run");                   // it is said in the tape, so show it
      talkOnce(TXT.r_nothing, "warn");
      return;
    }
    showCode(nowLang());
  }

  // Which language the code is being written out in: what the bar over
  // the code says if it is up, what the card in the panel is set to
  // otherwise, and failing both the first one the table offers.
  function nowLang() {
    var bar = el("#tape-lang"), pick = el("#see-code");
    if (bar && !bar.hidden && bar.value) { return bar.value; }
    if (pick && pick.value) { return pick.value; }
    return Object.keys(LANGS)[0];
  }

  // --------------------------------------- a program, on a screen of its own --
  // Code is the thing the panel has least room for: `pre` does not wrap, so
  // a line of Java in a column that narrow is read sideways a word at a
  // time.  Asking for a program is therefore taken as asking to read it,
  // and it is put where it can be read.  Esc or Done gives the panel back.
  //
  // Two things are read on this screen: the code a chart is written out as,
  // and the pseudocode a drawing amounts to.  They are the same thing to
  // read -- a program, a line at a time -- so they are read in the same
  // place rather than on two screens that would have to be kept alike.

  // Copying, whichever way this browser has.  navigator.clipboard is only
  // there on a page served over https or from localhost: open the studio on
  // a machine's own address over http -- which is exactly what serving it
  // to the tablet in the next room looks like -- and the whole of
  // navigator.clipboard is missing, so this threw before it could even
  // reach the promise, and the button did nothing and said nothing.  The
  // old way still works everywhere, and where even that will not, the
  // button says so rather than pretending it worked.
  //
  // The pseudocode screen hands over a button of its own and a way to read
  // the box rather than the text in it, because that box is still being
  // written in: what is copied is what it says at the press.
  function copyButton(text, copy) {
    copy = copy || document.createElement("button");
    copy.className = "btn small";
    copy.textContent = TXT.r_copy;
    copy.onclick = function () {
      var said = typeof text === "function" ? text() : text;
      function well() {
        copy.textContent = TXT.r_copied;
        setTimeout(function () { copy.textContent = TXT.r_copy; }, 1400);
      }
      function badly() {
        copy.textContent = TXT.r_copy_no || TXT.r_copy;
        setTimeout(function () { copy.textContent = TXT.r_copy; }, 2200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(said).then(well, function () {
          if (!oldCopy(said)) { badly(); } else { well(); }
        });
        return;
      }
      if (oldCopy(said)) { well(); } else { badly(); }
    };
    return copy;
  }

  // The buttons under a program start where its lines do, not where its
  // numbers do: in from the row's own edge by as far as the writing is.
  // The sheet may still be rising into place, a hair smaller than it will
  // be, so the distance is measured and then put back to full size.
  //
  // It may not be laid out yet: the code screen's frame is put away until
  // the bars have measured it again (24-scroll.js), a frame after the code
  // arrived.  Then it is lined up the moment it has a size, which is after
  // the layout and before anything is painted.
  function underLines(row, text) {
    if (!row || !text) { return; }
    if (!row.offsetWidth) {
      if (!window.ResizeObserver) { return; }
      var wait = new ResizeObserver(function () {
        if (!row.offsetWidth) { return; }
        wait.disconnect();
        underLines(row, text);
      });
      wait.observe(row);
      return;
    }
    var box = row.getBoundingClientRect();
    var scale = box.width / row.offsetWidth || 1;
    var at = (text.getBoundingClientRect().left - box.left) / scale +
             (parseFloat(getComputedStyle(text).paddingLeft) || 0);
    row.style.paddingLeft = Math.max(0, Math.round(at)) + "px";
  }

  // A file of whatever is on the screen, named after the chart.
  function saveButton(text, named, ext) {
    var down = document.createElement("button");
    down.className = "btn small";
    down.textContent = TXT.r_save_code;
    down.onclick = function () {
      save(new Blob([text], { type: "text/plain;charset=utf-8" }),
           named + "." + ext);
    };
    return down;
  }

  // ------------------------------------------- a program, written in --
  // Putting one on the screen used to be a single statement: the whole
  // program into one element, laid out and painted in one frame.  For the
  // thirty lines a lesson is usually about, that is nothing at all.  For
  // the program a chart of ten thousand shapes writes out to, it is the
  // best part of a second in which the page answers nothing -- the scroll
  // will not move, a button pressed is not seen, the bar above it does not
  // so much as blink -- and what the person is waiting to read is the first
  // twenty lines of it.
  //
  // So it is written in instead, a slice to a frame: steadily while it is
  // still filling the part of the box somebody is reading, and then in
  // bigger armfuls once it has run off the bottom where nobody is looking.
  // No one frame does much, so the page stays alive the whole way through,
  // and the top of a long program can be read while the rest of it is still
  // arriving.  What it looks like is a program being written out, which is
  // what it is; 07-motion.css fades each slice in as it lands.
  //
  // The numbers and the lines are cut into the same slices, so the two
  // columns cannot drift apart however far down it goes.  A slice is a
  // plain span inside the `pre` the code was always in, carrying the
  // newline that joins it to the next: what is in the box is the program,
  // in one piece, cut up only in the order it was put there.  Nothing else
  // has to know it arrived in slices -- reading it back gives the program,
  // so does dragging over it and copying, and the sideways slider that
  // 24-scroll.js hangs on pre.code still finds the pre it hangs on.
  var WRITE_RATE = 110;                  // lines a second, while it is in view
  var WRITE_MOST = 400;                  // lines in one frame, once it is not
  var filling = null;                    // the one going on, if one is

  function stopWriting() {
    if (filling) { cancelAnimationFrame(filling.frame); }
    filling = null;
  }

  function slice(text) {
    var part = document.createElement("span");
    part.className = "code-part";
    part.textContent = text;
    return part;
  }

  // One slice into both columns.  Every slice but the last carries the
  // newline that joins it to the one after it.
  function writeOn(job, many) {
    var to = Math.min(job.lines.length, job.at + many);
    var numbers = [];
    for (var n = job.at; n < to; n++) { numbers.push(n + 1); }
    var tail = to < job.lines.length ? "\n" : "";
    job.nums.appendChild(slice(numbers.join("\n") + tail));
    job.code.appendChild(slice(job.lines.slice(job.at, to).join("\n") + tail));
    job.at = to;
  }

  // The box goes down the page with the writing.  A program longer than
  // the screen used to fill the first screenful and then carry on out of
  // sight, which looks exactly like it having stopped -- so the view
  // follows the last line written, and what is being done is something
  // anybody can see happening rather than something they are told about.
  //
  // It follows only for as long as the box has been left at the end.
  // Scroll up to read a line again and it stays where it was put, the way
  // a terminal does: the scroll we set is remembered, and a scroll that is
  // not the one we set is somebody else's.
  //
  // And when there is no more to write it goes back to the top, because
  // the top is where a program is read from.  Following it down was to
  // show it being written; it was never where anybody wanted to be left.
  function follow(job, ended) {
    var out = el("#code-out");
    if (!out || !job.follow) { return; }
    if (out.scrollTop !== job.top) { job.follow = false; return; }
    out.scrollTop = ended ? 0 : out.scrollHeight;
    job.top = out.scrollTop;
  }

  function writeIn(nums, code, lines, room) {
    stopWriting();
    // How many lines the box can show at once, and so how much of this is
    // being read rather than poured into the dark below.  A line is as tall
    // as the stylesheet says; asked for once here rather than once a frame.
    // A box with no height to report -- one being measured before the
    // screen it is on has been laid out, in a window nobody is looking at
    // -- would say nothing is in view and pour the lot in at once.  A
    // screenful is never fewer lines than this.
    var high = parseFloat(getComputedStyle(code).lineHeight) || 22;
    var job = { nums: nums, code: code, lines: lines, at: 0, frame: 0,
                shown: Math.max(24, Math.ceil((room || 0) / high) + 2),
                took: 0, last: 0, follow: true, top: 0 };
    filling = job;
    function step(now) {
      if (filling !== job) { return; }
      // Written over, thrown away by a fresh build, or left behind by going
      // back to the run: whatever is being written into is not on the screen
      // any more, and the next program asked for is written out afresh.
      if (!code.isConnected || (el("#code-out") || {}).hidden) {
        filling = null;
        return;
      }
      var gap = job.last ? Math.min(0.1, (now - job.last) / 1000) : 0;
      job.last = now;
      // Told to keep still, there is nothing to watch and no reason to go
      // slowly -- but it is still cut into slices, because the point of the
      // slicing is a page that answers while it happens, not the look of it.
      var many = (STILL || job.at >= job.shown)
               ? Math.min(WRITE_MOST, Math.max(24, job.took * 2))
               : Math.max(1, Math.round(WRITE_RATE * gap));
      writeOn(job, many);
      job.took = many;
      var ended = job.at >= lines.length;
      follow(job, ended);
      if (!ended) { job.frame = requestAnimationFrame(step); }
      else { filling = null; }
    }
    job.frame = requestAnimationFrame(step);
  }

  // One watcher for the row of buttons under the code, handed each new row
  // as the page is written again, so the old ones are not kept watched.
  // Made the first time it is wanted, since this part is also read where
  // there is no page at all.
  var goRowHigh = null;
  function watchGoRow(row) {
    if (!goRowHigh) {
      if (!window.ResizeObserver) { return; }
      goRowHigh = new ResizeObserver(function (seen) {
        seen.forEach(function (one) {
          var at = one.target, out = at.parentNode;
          if (out && at.offsetHeight) {
            out.style.setProperty("--go-high", at.offsetHeight + "px");
          }
        });
      });
    }
    goRowHigh.disconnect();
    goRowHigh.observe(row);
  }

  // Numbered down the side and ruled under each line, the way the
  // pseudocode box is.  The numbers are a column of their own, so a long
  // line takes the program sideways and leaves them where they are.
  function codePage(text, name, more, files) {
    var out = el("#code-out");
    if (!out) { return; }
    stopWriting();
    out.innerHTML = "";
    // The strip saying which file is showing is built again by whoever
    // wants one, so it starts empty however this page was asked for.
    var strip = el("#code-files");
    if (strip) { strip.innerHTML = ""; strip.hidden = true; }
    var page = document.createElement("div");
    page.className = "code-page";
    var nums = document.createElement("pre");
    nums.className = "code-nums";
    nums.setAttribute("aria-hidden", "true");
    var pre = document.createElement("pre");
    pre.className = "code";
    page.appendChild(nums);
    page.appendChild(pre);
    out.appendChild(page);
    // Under the last line while the program is short enough to show whole,
    // and held at the foot of the screen while a longer one scrolls under
    // it (05-chart.css), so they are never a scroll to the end away.
    var row = document.createElement("div");
    row.className = "go";
    // Copying and saving are handed the text, not the page, so they are
    // the whole program from the first frame -- there is nothing to wait
    // for and nothing half-written to be given.
    row.appendChild(copyButton(text));
    (more || []).forEach(function (one) { row.appendChild(one); });
    out.appendChild(row);
    // The code's sideways bar is held just above this row (05-chart.css),
    // so it is told how tall the row is -- more than one line of buttons on
    // a narrow screen, and a different one again in another language.
    watchGoRow(row);
    tapeFull(true);
    tapeShow("code");
    var lines = text.split("\n");
    // The numbers' column as wide as its last number from the start, so
    // it does not widen at line 10,000 and leave the buttons out of line.
    // (The 11px is its padding and rule, which a min-width counts here.)
    nums.style.minWidth = "max(32px, " + String(lines.length).length +
                          "ch + 11px)";
    underLines(row, pre);
    tapeSays("", name, say("code_lines", { n: lines.length }) +
             (files > 1 ? " · " + say("c_files", { n: files }) : ""));
    // The screen is up and the box has its size before the writing starts,
    // so how much of it is in view is known rather than guessed.
    writeIn(nums, pre, lines, out.clientHeight);
  }

  function chartFileName() {
    return ((el("#f-title") && el("#f-title").value) || "flowchart")
           .replace(/[^A-Za-z0-9 _-]/g, "");
  }

  // Every file of a program, in one file, because a browser will hand over
  // a file and not a folder.  19-files.js writes the zip.
  function saveAllButton(files) {
    var down = document.createElement("button");
    down.className = "btn small";
    down.textContent = TXT.c_save_all;
    down.onclick = function () {
      save(zipOf(files.map(function (one) {
        return { name: one.file + "." + one.ext, text: one.text };
      })), (chartFileName() || "flowchart") + ".zip");
    };
    return down;
  }

  // One program and the files it came out as, with one of them on the
  // screen.  All of them were written out together, so the strip above the
  // code only changes which is being read -- nothing is written again, and
  // Save them all has every one of them whichever is showing.
  //
  // One file is the same thing with the strip put away, which is what a
  // program of a single chart always gets.
  function showFiles(files, name, lang, at) {
    var one = files[at || 0], many = files.length > 1;
    // Java and C# want a file named after the class inside it; the others
    // take the chart's name -- except where the program came out as
    // several, and every one of them is named after the chart it holds.
    var more = [saveButton(one.text,
                           (many || LANGS[lang].kinds) ? one.file : chartFileName(),
                           one.ext)];
    if (many) { more.push(saveAllButton(files)); }
    codePage(one.text, name, more, many ? files.length : 0);

    var strip = el("#code-files");
    if (!strip) { return; }
    strip.hidden = !many;
    if (!many) { return; }
    files.forEach(function (each, n) {
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "code-file" + (n === (at || 0) ? " on" : "");
      tab.textContent = each.file + "." + each.ext;
      tab.onclick = function () { showFiles(files, name, lang, n); };
      strip.appendChild(tab);
    });
    // The one being read, brought into view: a program of forty files has
    // a strip wider than the screen, and picking the last of them used to
    // leave the lit tab off the end of it.
    var lit = el(".code-file.on", strip);
    if (lit && lit.scrollIntoView) {
      lit.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  // The screen with nothing on it yet, and a word saying why.  Only for a
  // program big enough to take a moment: one that is written out before
  // the page has drawn once would show this and take it away again inside
  // a frame, which is a flicker rather than a word.
  function codeWaiting(name) {
    var out = el("#code-out");
    if (!out) { return; }
    stopWriting();
    out.innerHTML = "";
    var strip = el("#code-files");
    if (strip) { strip.innerHTML = ""; strip.hidden = true; }
    var line = document.createElement("p");
    line.className = "hint code-waiting";
    line.textContent = TXT.c_writing;
    out.appendChild(line);
    tapeFull(true);
    tapeShow("code");
    tapeSays("", name, "");
  }

  // Whether the screen is up and showing the code rather than the run.
  function tapeCovered() {
    var over = el("#tape-over"), out = el("#code-out");
    if (!over || over.hidden) { return ""; }
    return out && !out.hidden ? "code" : "run";
  }

  var penning = null;                    // the writing-out going on, if one is

  function showCode(want) {
    var lang = want || nowLang();
    if (!AST || !(AST.main || []).length) {
      tapeShow("run");
      talkOnce(TXT.r_nothing, "warn");
      return;
    }
    if (lang === "pseudo" || !LANGS[lang]) {
      tapeShow("run");
      talkOnce(TXT.r_pseudo_only, "note");
      return;
    }
    // Into its own box, not over the top of the run.  The tape keeps what
    // the program did; this is only what it says.
    // The picker in the bar says what is under it, however the code was
    // asked for -- from the run, from the panel, or by changing it here.
    if (el("#tape-lang")) { el("#tape-lang").hidden = false; }
    if (el("#tape-lang")) { el("#tape-lang").value = lang; }

    var job = writing(lang, wantsApart());
    penning = job;
    function wrong(thrown) {
      penning = null;
      tapeShow("run");
      talkOnce(thrown.message || String(thrown), "bad");
    }
    function done() {
      penning = null;
      showFiles(job.files, langName(lang), lang, 0);
    }
    // A moment's work first, before anything is said about waiting: most
    // programs are written out inside it and never show the screen empty.
    var until = performance.now() + 30;
    try {
      while (job.step()) {
        if (performance.now() > until) { break; }
      }
    } catch (thrown) { wrong(thrown); return; }
    if (job.files) { done(); return; }

    // And the rest a piece at a time, with the screen up and saying so.
    codeWaiting(langName(lang));
    (function onward() {
      requestAnimationFrame(function () {
        // Asked for something else since, or the screen it was going to be
        // put on has been shut: either way nobody is waiting for this, and
        // finishing it would throw the screen back up over a page somebody
        // has gone back to.
        if (penning !== job || tapeCovered() !== "code") {
          if (penning === job) { penning = null; }
          return;
        }
        var more;
        try { more = job.step(); }
        catch (thrown) { wrong(thrown); return; }
        if (more) { onward(); } else { done(); }
      });
    })();
  }

  // And the drawing, written out as the pseudocode it amounts to.
  //
  // The page has always known how to do this -- pressing Check works it
  // out, hands it over to be built into a program that can be run, and
  // throws it away.  Nobody had ever been shown it, which is a strange
  // thing to withhold: the writing is what a class is usually marked on,
  // and a chart drawn by hand is otherwise a drawing and nothing else.
  //
  // The language picker goes for this one.  What is on the screen is the
  // pseudocode itself, not one of the languages it can be turned into.
  function showHandCode() {
    var text;
    try { text = handAsPseudocode(); }
    catch (thrown) {
      handSays(thrown.message || String(thrown), true);
      return;
    }
    var more = [saveButton(text, chartFileName(), "txt")];
    if (el("#code")) {
      // The way across.  The drawing stays exactly where it is -- each way
      // of working keeps its own paper and is handed it back on returning
      // -- so this gives the writing somewhere to be edited and run
      // without taking the drawing away.  What was in the box is written
      // over, which is what the button is for and what its tooltip says.
      var into = document.createElement("button");
      into.className = "btn small primary";
      into.textContent = TXT.h_into_box;
      into.title = TXT.h_into_box_tip;
      into.onclick = function () {
        el("#code").value = text;
        newProgram();
        showStarts();
        tapeFull(false);
        setMode(false);
        // laid out from the seed Tidy up uses, so its True and False go
        // out the sides they go out of the drawing tidied up
        seedHanded = TIDY_SEED;
        el("#build").click();
      };
      more.unshift(into);
    }
    codePage(text, TXT.pseudocode, more);
    if (el("#tape-lang")) { el("#tape-lang").hidden = true; }
  }
