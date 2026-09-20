// ---------------------------------------------------------------------------
//  09-build.js -- asking for a drawing, here or from Python in the browser
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ------------------------------------------------------ the studio part --
  // Python, in the browser.  The website version has no server to ask, so
  // it loads Python itself and imports the very same builder.  One set of
  // rules for how a chart is drawn, wherever it is being drawn.
  //
  // Where it is drawn matters, though.  Pyodide runs wherever it is called
  // from, and laying out a chart of a few thousand shapes is some seconds of
  // solid arithmetic: called from the page's own thread, that is some
  // seconds with nothing painting, no button answering, no scrolling and no
  // typing -- the tab stops dead, and a browser that has stopped dead is a
  // browser that offers to close the page for you.  A chart of six thousand
  // lines froze this page for the better part of four seconds.
  //
  // So Python is given a thread of its own, and the page keeps its own.  It
  // is handed the pseudocode and hands back the drawing, and in between the
  // page is as free as it ever was: the button says what it is doing, and
  // says it in time to be seen.  Where a browser will not give us a worker
  // at all, the old way is still there underneath and still draws.
  var pyHand = null;                     // null: not asked yet.  false: no
  var pyJobs = {}, pyNext = 1;           //   worker to be had, do it in here

  // What runs in the worker.  Written as a function and sent as its own
  // source, so that it stays code an editor can read and check rather than
  // a wall of quoted strings.
  function workerBody() {
    var ready = null;

    // The modules into Python's own filesystem, under a path spelt out in
    // full.  Emscripten's mkdirTree reads a relative path against the root
    // and writeFile reads one against the working directory, so a plain
    // "flowchart/draw" made the folder in one place and looked for it in
    // another -- every write failed with a bare errno 44 and the page said
    // only that the studio was not answering.
    function putThere(py, files) {
      var home = py.runPython("import os; os.getcwd()");
      files.forEach(function (pair) {
        var folder = pair[0].split("/").slice(0, -1).join("/");
        if (folder) { py.FS.mkdirTree(home + "/" + folder); }
        py.FS.writeFile(home + "/" + pair[0], pair[1]);
      });
    }
    function start(job) {
      if (ready) { return ready; }
      ready = Promise.resolve().then(function () {
        importScripts(job.where + "pyodide.js");
        return loadPyodide({ indexURL: job.where });
      }).then(function (py) {
        // The package, fetched a module at a time and written into
        // Python's own filesystem, where importing it works exactly as it
        // does on a computer.  They go at once rather than one after the
        // other: two dozen small files over one connection is no wait at
        // all, and it is a fifth of what one joined-up file used to cost.
        return Promise.all(job.files.map(function (path) {
          return fetch(job.root + path).then(function (r) {
            if (!r.ok) { throw new Error(path + " (" + r.status + ")"); }
            return r.text();
          }).then(function (text) { return [path, text]; });
        })).then(function (got) {
          putThere(py, got);
          py.runPython([
            "import sys, json, os",
            "sys.path.insert(0, os.getcwd())",
            "from flowchart.studio.drawing import draw_for_studio",
            "def draw_json(ask):",
            "    try:",
            "        return json.dumps(draw_for_studio(json.loads(ask)))",
            "    except Exception as exc:",
            "        return json.dumps({'ok': False, 'error': str(exc)})"
          ].join("\n"));
          return py;
        });
      });
      return ready;
    }
    self.onmessage = function (ev) {
      var job = ev.data;
      var first = !ready;
      if (first) { self.postMessage({ id: job.id, note: "starting" }); }
      start(job).then(function (py) {
        if (first) { self.postMessage({ id: job.id, note: "ready" }); }
        var fn = py.globals.get("draw_json");
        var out = fn(job.ask);
        fn.destroy();
        self.postMessage({ id: job.id, out: out });
      }).catch(function (err) {
        ready = null;                    // let the next one try again
        self.postMessage({ id: job.id,
                           error: String((err && err.message) || err) });
      });
    };
  }

  function pythonHand() {
    if (pyHand !== null) { return pyHand; }
    try {
      var blob = new Blob(["(" + workerBody.toString() + ")()"],
                          { type: "text/javascript" });
      pyHand = new Worker(URL.createObjectURL(blob));
      pyHand.onmessage = function (ev) {
        var job = pyJobs[ev.data.id];
        if (!job) { return; }
        if (ev.data.note) { job.note(ev.data.note); return; }
        delete pyJobs[ev.data.id];
        if (ev.data.error) { job.no(new Error(ev.data.error)); }
        else { job.go(ev.data.out); }
      };
      pyHand.onerror = function () {
        for (var id in pyJobs) { pyJobs[id].no(new Error("worker")); }
        pyJobs = {};
      };
    } catch (e) {
      pyHand = false;                    // no worker here: the page does it
    }
    return pyHand;
  }

  // A drawing from the worker, or null where there is no worker to be had.
  function drawAside(ask) {
    var hand = pythonHand();
    if (!hand) { return null; }
    var says = el("#build-note");
    return new Promise(function (go, no) {
      var id = pyNext++;
      pyJobs[id] = { go: go, no: no, note: function (what) {
        // "Ready" is not what it is doing, it is what it has finished: the
        // wait people actually sit through is the drawing after it.
        var word = what === "ready" ? "drawing" : what;
        if (says) { says.className = ""; says.textContent = TXT[word] || word; }
      } };
      hand.postMessage({ id: id, ask: JSON.stringify(ask), where: PYODIDE,
                         root: new URL(".", location.href).href,
                         files: PYFILES });
    }).then(function (text) {
      return JSON.parse(text);
    }, function (err) {
      // The worker could not do it at all -- blocked by the page's own
      // rules, or unable to fetch what it needs.  Better a page that
      // stutters than a page with no chart on it, so it is drawn here
      // instead and the worker is not asked again.
      if (pyHand) { pyHand.terminate(); }
      pyHand = false;
      pyJobs = {};
      return drawHere(ask);
    });
  }

  function drawHere(ask) {               // the slow way: on the page's thread
    return startPython().then(function (py) {
      var fn = py.globals.get("draw_json");
      var out = JSON.parse(fn(JSON.stringify(ask)));
      fn.destroy();
      return out;
    });
  }

  var python = null;
  function startPython() {
    if (python) { return python; }
    var says = el("#build-note");
    if (says) { says.className = ""; says.textContent = TXT.starting; }
    python = new Promise(function (ready, nope) {
      var tag = document.createElement("script");
      tag.src = PYODIDE + "pyodide.js";
      tag.onload = ready;
      tag.onerror = function () { nope(new Error("pyodide.js")); };
      document.head.appendChild(tag);
    }).then(function () {
      return loadPyodide({ indexURL: PYODIDE });
    }).then(function (py) {
      return Promise.all(PYFILES.map(function (path) {
        return fetch(path).then(function (r) {
          if (!r.ok) { throw new Error(path + " (" + r.status + ")"); }
          return r.text();
        }).then(function (text) { return [path, text]; });
      })).then(function (got) {
        var home = py.runPython("import os; os.getcwd()");
        got.forEach(function (pair) {
          var folder = pair[0].split("/").slice(0, -1).join("/");
          if (folder) { py.FS.mkdirTree(home + "/" + folder); }
          py.FS.writeFile(home + "/" + pair[0], pair[1]);
        });
        py.runPython([
          "import sys, json, os",
          "sys.path.insert(0, os.getcwd())",
          "from flowchart.studio.drawing import draw_for_studio",
          "def draw_json(ask):",
          "    try:",
          "        return json.dumps(draw_for_studio(json.loads(ask)))",
          "    except Exception as exc:",
          "        return json.dumps({'ok': False, 'error': str(exc)})"
        ].join("\n"));
        if (says) { says.textContent = TXT.ready; }
        return py;
      });
    }).catch(function (err) {
      python = null;
      if (says) {
        says.className = "bad";
        says.textContent = say("boot_failed", { err: err.message || err });
      }
      throw err;
    });
    return python;
  }

  function askFor(ask) {                 // a drawing, however this page gets one
    if (MODE === "web") {
      return drawAside(ask) || drawHere(ask);
    }
    return fetch("build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ask)
    }).then(function (r) { return r.json(); });
  }

  // What the reading had to paper over, listed under the button that drew
  // it.  A chart comes out either way -- an If with no End If still draws,
  // and that is right -- but the chart it draws is then quietly not the one
  // that was meant: the If swallows every line below it.  Nothing else in
  // the page would ever say so, and the only clue is a picture that looks
  // wrong somewhere.  Each row is a button on to the line it happened at.
  function showProblems(found) {
    var box = el("#build-faults");
    if (!box) { return; }
    box.innerHTML = "";
    if (!found || !found.length) { return; }
    var head = document.createElement("p");
    head.className = "hint bad";
    head.textContent = say("w_found", { n: found.length });
    box.appendChild(head);
    found.forEach(function (bit) {
      var row = document.createElement("button");
      row.className = "fault warn";
      // Said again in the language the page is wearing now, rather than the
      // one it was drawn in -- the page can change its words without asking
      // anybody, and this should change with them.
      row.textContent = TXT[bit.why] ? say(bit.why, { line: bit.line })
                                     : (bit.says || bit.why);
      if (bit.line) {
        row.title = TXT.r_show_line || "";
        row.onclick = function () { pickLine(0, bit.line); };
      }
      box.appendChild(row);
      // What the reading worked out would put this right, where it worked
      // out anything.  The button goes beside the warning rather than in
      // it: the warning is itself a button, and a button inside a button is
      // not a thing a page may have.
      offerMend(row, box, bit.fix, bit.line);
    });
  }

  function drawRoles() {                 // which shape draws which kind
    var box = el("#role-rows");
    if (!box) { return; }
    box.innerHTML = "";
    ROLES.forEach(function (role) {
      var row = document.createElement("div");
      row.className = "row";
      row.innerHTML = keyMark(geom[role] || role) +
                      '<span class="name">' + (TXT["key_" + role] || role) + "</span>";
      var pick = document.createElement("select");
      pick.className = "field";
      SHAPE_LIST.forEach(function (kind) {
        var choice = document.createElement("option");
        choice.value = kind;
        choice.textContent = kindName(kind);
        if ((geom[role] || role) === kind) {
          choice.selected = true;
          pick.title = choice.textContent;   // in full, where the box cuts it short
        }
        pick.appendChild(choice);
      });
      pick.onchange = function () {
        geom[role] = pick.value;
        drawRoles();
        if (el("#code").value.trim()) { el("#build").click(); }
      };
      row.appendChild(pick);
      box.appendChild(row);
    });
  }

  // ------------------------------------------------ somewhere to start from --
  // Three programs short enough to read at a glance and different enough to
  // show the three things this pseudocode does: a decision, a loop, and a
  // module called from somewhere else.  The keywords are not translated --
  // they are what you type, and lookup.py says so -- so one set serves
  // every language; only their names are words.
  // ------------------------------------------------ somewhere to start from --
  // The first minute used to be an empty box and an instruction to paste
  // something into it, with nothing anywhere on the page saying what this
  // pseudocode looks like -- the keywords are in --help and in the README,
  // neither of which is in front of the person looking at the box.
  //
  // Fifteen short programs are, in three levels: the first is one idea
  // each, the second puts two of them together, and the third is modules,
  // functions and the things built out of them.  Three of the first level
  // sit under the box for the first minute; the rest are a press away.
  //
  // The programs themselves are not translated and are not meant to be:
  // the keywords are what you type, and lookup.py says in as many words
  // that they stay as they are whichever language the chart is drawn in.
  // Their names are words like any other, and those are.
  //
  // Every one of them declares what it reads into.  That is a box more on
  // the chart, and it is worth it twice over: it is how these courses
  // teach it, and it is what the code writer needs -- Java, C# and C++ are
  // handed a type by the Declare and have none to give without one, so a
  // program that skips it comes out as `age = askText();` with no `int`
  // anywhere and will not compile.
  var STARTS = [
    ["eg_l1", [
      ["e_ask", "Start\nDeclare String name\nDisplay \"What is your name?\"\nInput name\nDisplay \"Hello\"\nDisplay name\nStop"],
      ["e_decide", "Start\nDeclare Integer age\nDisplay \"How old are you?\"\nInput age\nIf age >= 18 Then\n    Display \"Old enough to vote\"\nElse\n    Display \"Not old enough yet\"\nEnd If\nStop"],
      ["e_count", "Start\nFor i = 1 To 5\n    Display i\nEnd For\nStop"],
      ["e_total", "Start\nDeclare Integer total\ntotal = 0\nFor i = 1 To 10\n    total = total + i\nEnd For\nDisplay \"The total is\"\nDisplay total\nStop"],
      ["e_while", "Start\nDeclare Integer n\nn = 1\nWhile n <= 5\n    Display n\n    n = n + 1\nEnd While\nStop"],
      ["e_add", "Start\nDeclare Integer a\nDeclare Integer b\nDisplay \"Two numbers, please\"\nInput a\nInput b\nDisplay \"They come to\"\nDisplay a + b\nStop"],
      ["e_oddeven", "Start\nDeclare Integer n\nDisplay \"Enter a number\"\nInput n\nIf n mod 2 = 0 Then\n    Display \"even\"\nElse\n    Display \"odd\"\nEnd If\nStop"],
      ["e_double", "Start\nDeclare Integer n\nDisplay \"Enter a number\"\nInput n\nDisplay \"Twice that is\"\nDisplay n * 2\nStop"],
      ["e_area", "Start\nDeclare Integer width\nDeclare Integer height\nDisplay \"How wide?\"\nInput width\nDisplay \"How tall?\"\nInput height\nDisplay \"The area is\"\nDisplay width * height\nStop"],
      ["e_bigger", "Start\nDeclare Integer a\nDeclare Integer b\nInput a\nInput b\nIf a > b Then\n    Display a\nElse\n    Display b\nEnd If\nStop"]
    ]],
    ["eg_l2", [
      ["e_grades", "Start\nDeclare Integer mark\nDisplay \"Enter the mark\"\nInput mark\nIf mark >= 70 Then\n    Display \"A\"\nElse If mark >= 60 Then\n    Display \"B\"\nElse If mark >= 50 Then\n    Display \"C\"\nElse\n    Display \"Fail\"\nEnd If\nStop"],
      ["e_biggest", "Start\nDeclare Integer a\nDeclare Integer b\nDeclare Integer c\nDeclare Integer biggest\nInput a\nInput b\nInput c\nbiggest = a\nIf b > biggest Then\n    biggest = b\nEnd If\nIf c > biggest Then\n    biggest = c\nEnd If\nDisplay \"The biggest is\"\nDisplay biggest\nStop"],
      ["e_menu", "Start\nDeclare Integer choice\nDisplay \"1 add  2 take away  3 quit\"\nInput choice\nSelect Case choice\n    Case 1\n        Display \"Adding\"\n    Case 2\n        Display \"Taking away\"\n    Case Else\n        Display \"Goodbye\"\nEnd Select\nStop"],
      ["e_keepasking", "Start\nDeclare Integer n\nDo\n    Display \"Enter a number from 1 to 10\"\n    Input n\nUntil n >= 1 And n <= 10\nDisplay \"Thank you\"\nStop"],
      ["e_tables", "Start\nFor row = 1 To 3\n    For col = 1 To 3\n        Display row * col\n    End For\nEnd For\nStop"],
      ["e_guess", "Start\nDeclare Integer secret\nDeclare Integer guess\nsecret = 7\nDo\n    Display \"Guess my number\"\n    Input guess\n    If guess < secret Then\n        Display \"Higher\"\n    End If\n    If guess > secret Then\n        Display \"Lower\"\n    End If\nUntil guess = secret\nDisplay \"You got it\"\nStop"],
      ["e_highest", "Start\nDeclare Integer n\nDeclare Integer highest\nhighest = 0\nFor i = 1 To 5\n    Display \"Enter a number\"\n    Input n\n    If n > highest Then\n        highest = n\n    End If\nEnd For\nDisplay \"The highest was\"\nDisplay highest\nStop"],
      ["e_sumevens", "Start\nDeclare Integer total\ntotal = 0\nFor i = 1 To 20\n    If i mod 2 = 0 Then\n        total = total + i\n    End If\nEnd For\nDisplay \"The evens come to\"\nDisplay total\nStop"],
      ["e_onetable", "Start\nDeclare Integer n\nDisplay \"Which table?\"\nInput n\nFor i = 1 To 12\n    Display n * i\nEnd For\nStop"],
      ["e_vowel", "Start\nDeclare String letter\nDisplay \"Enter a letter\"\nInput letter\nSelect Case letter\n    Case \"a\"\n        Display \"vowel\"\n    Case \"e\"\n        Display \"vowel\"\n    Case \"i\"\n        Display \"vowel\"\n    Case \"o\"\n        Display \"vowel\"\n    Case \"u\"\n        Display \"vowel\"\n    Case Else\n        Display \"not a vowel\"\nEnd Select\nStop"]
    ]],
    ["eg_l3", [
      ["e_module", "Start\nDeclare String name\nInput name\nCall greet(name)\nStop\n\nModule greet(who)\n    Display \"Hello\"\n    Display who\nEnd Module"],
      ["e_answers", "Start\nDeclare Integer a\nDeclare Integer b\nDeclare Integer sum\nInput a\nInput b\nsum = add(a, b)\nDisplay \"The answer is\"\nDisplay sum\nStop\n\nFunction add(x, y)\n    Return x + y\nEnd Function"],
      ["e_average", "Start\nDeclare Real total\nDeclare Real n\ntotal = 0\nFor i = 1 To 5\n    Display \"Enter a number\"\n    Input n\n    total = total + n\nEnd For\nDisplay \"The average is\"\nDisplay total / 5\nStop"],
      ["e_countdown", "Start\nDeclare Integer n\nn = 10\nWhile n > 0\n    Display n\n    If n = 5 Then\n        Display \"Halfway\"\n    End If\n    n = n - 1\nEnd While\nDisplay \"Lift off\"\nStop"],
      ["e_password", "Start\nDeclare String word\nDeclare Integer tries\ntries = 0\nDo\n    Display \"Password?\"\n    Input word\n    tries = tries + 1\nUntil word = \"open\" Or tries = 3\nIf word = \"open\" Then\n    Display \"Welcome in\"\nElse\n    Display \"Locked out\"\nEnd If\nStop"],
      ["e_swap", "Start\nDeclare Integer a\nDeclare Integer b\nDeclare Integer keep\nInput a\nInput b\nkeep = a\na = b\nb = keep\nDisplay a\nDisplay b\nStop"],
      ["e_factorial", "Start\nDeclare Integer n\nDeclare Integer answer\nDisplay \"Enter a number\"\nInput n\nanswer = 1\nFor i = 1 To n\n    answer = answer * i\nEnd For\nDisplay \"The factorial is\"\nDisplay answer\nStop"],
      ["e_leap", "Start\nDeclare Integer year\nDisplay \"Which year?\"\nInput year\nIf year mod 400 = 0 Then\n    Display \"leap year\"\nElse If year mod 100 = 0 Then\n    Display \"not a leap year\"\nElse If year mod 4 = 0 Then\n    Display \"leap year\"\nElse\n    Display \"not a leap year\"\nEnd If\nStop"],
      ["e_power", "Start\nDeclare Integer base\nDeclare Integer times\nDeclare Integer answer\nInput base\nInput times\nanswer = 1\nFor i = 1 To times\n    answer = answer * base\nEnd For\nDisplay answer\nStop"],
      ["e_backwards", "Start\nDeclare Integer n\nDisplay \"Count back from?\"\nInput n\nFor i = n To 1 Step -1\n    Display i\nEnd For\nDisplay \"Done\"\nStop"]
    ]],
    ["eg_l4", [
      ["e_fizz", "Start\nFor i = 1 To 15\n    If i mod 15 = 0 Then\n        Display \"FizzBuzz\"\n    Else If i mod 3 = 0 Then\n        Display \"Fizz\"\n    Else If i mod 5 = 0 Then\n        Display \"Buzz\"\n    Else\n        Display i\n    End If\nEnd For\nStop"],
      ["e_prime", "Start\nDeclare Integer n\nDeclare Integer factors\nDisplay \"Enter a number\"\nInput n\nfactors = 0\nFor i = 1 To n\n    If n mod i = 0 Then\n        factors = factors + 1\n    End If\nEnd For\nIf factors = 2 Then\n    Display \"prime\"\nElse\n    Display \"not prime\"\nEnd If\nStop"],
      ["e_gcd", "Start\nDeclare Integer a\nDeclare Integer b\nDisplay \"Two numbers, please\"\nInput a\nInput b\nWhile a <> b\n    If a > b Then\n        a = a - b\n    Else\n        b = b - a\n    End If\nEnd While\nDisplay \"The highest common factor is\"\nDisplay a\nStop"],
      ["e_digits", "Start\nDeclare Integer n\nDeclare Integer many\nDisplay \"Enter a whole number\"\nInput n\nmany = 0\nWhile n > 0\n    n = n div 10\n    many = many + 1\nEnd While\nDisplay \"That many digits:\"\nDisplay many\nStop"],
      ["e_reverse", "Start\nDeclare Integer n\nDeclare Integer back\nDisplay \"Enter a whole number\"\nInput n\nback = 0\nWhile n > 0\n    back = back * 10 + n mod 10\n    n = n div 10\nEnd While\nDisplay \"Backwards that is\"\nDisplay back\nStop"],
      ["e_sumdigits", "Start\nDeclare Integer n\nDeclare Integer total\nDisplay \"Enter a whole number\"\nInput n\ntotal = 0\nWhile n > 0\n    total = total + n mod 10\n    n = n div 10\nEnd While\nDisplay \"The digits come to\"\nDisplay total\nStop"],
      ["e_grid", "Start\nFor row = 1 To 5\n    For col = 1 To 5\n        Display row * col\n    End For\nEnd For\nStop"],
      ["e_triangle", "Start\nDeclare Integer n\nDeclare Integer total\nDisplay \"How far?\"\nInput n\ntotal = 0\nFor i = 1 To n\n    total = total + i\n    Display total\nEnd For\nStop"],
      ["e_minmax", "Start\nDeclare Integer n\nDeclare Integer lowest\nDeclare Integer highest\nDisplay \"Five numbers, please\"\nInput n\nlowest = n\nhighest = n\nFor i = 2 To 5\n    Input n\n    If n < lowest Then\n        lowest = n\n    End If\n    If n > highest Then\n        highest = n\n    End If\nEnd For\nDisplay \"Lowest\"\nDisplay lowest\nDisplay \"Highest\"\nDisplay highest\nStop"],
      ["e_stars", "Start\nDeclare String line\nDeclare Integer n\nDisplay \"How many rows?\"\nInput n\nFor row = 1 To n\n    line = \"\"\n    For col = 1 To row\n        line = line + \"*\"\n    End For\n    Display line\nEnd For\nStop"]
    ]],
    ["eg_l5", [
      ["e_report", "Start\nDeclare Integer mark\nDeclare Integer total\nDeclare Integer passes\nDeclare Integer best\ntotal = 0\npasses = 0\nbest = 0\nFor i = 1 To 5\n    Display \"Enter a mark\"\n    Input mark\n    total = total + mark\n    If mark >= 50 Then\n        passes = passes + 1\n    End If\n    If mark > best Then\n        best = mark\n    End If\nEnd For\nDisplay \"Passes\"\nDisplay passes\nDisplay \"Average\"\nDisplay total / 5\nDisplay \"Best\"\nDisplay best\nStop"],
      ["e_login", "Start\nDeclare String word\nDeclare Integer tries\ntries = 0\nDo\n    Display \"Password?\"\n    Input word\n    tries = tries + 1\nUntil word = \"open\" Or tries = 3\nCall verdict(word)\nStop\n\nModule verdict(said)\n    If said = \"open\" Then\n        Display \"Welcome in\"\n    Else\n        Display \"Locked out\"\n    End If\nEnd Module"],
      ["e_shop", "Start\nDeclare Integer many\nDeclare Real price\nDeclare Real total\nDisplay \"How many?\"\nInput many\nDisplay \"Price each?\"\nInput price\ntotal = many * price\nIf total > 50 Then\n    total = total * 0.9\n    Display \"Ten per cent off\"\nEnd If\nDisplay \"To pay\"\nDisplay total\nStop"],
      ["e_temps", "Start\nDeclare Real c\nFor i = 1 To 5\n    Display \"A temperature in C\"\n    Input c\n    Display \"That is in F\"\n    Display toF(c)\nEnd For\nStop\n\nFunction toF(deg)\n    Return deg * 9 / 5 + 32\nEnd Function"],
      ["e_votes", "Start\nDeclare String vote\nDeclare Integer reds\nDeclare Integer blues\nreds = 0\nblues = 0\nFor i = 1 To 5\n    Display \"red or blue?\"\n    Input vote\n    If vote = \"red\" Then\n        reds = reds + 1\n    Else\n        blues = blues + 1\n    End If\nEnd For\nDisplay \"Red\"\nDisplay reds\nDisplay \"Blue\"\nDisplay blues\nIf reds > blues Then\n    Display \"Red wins\"\nElse If blues > reds Then\n    Display \"Blue wins\"\nElse\n    Display \"A tie\"\nEnd If\nStop"],
      ["e_fib", "Start\nDeclare Integer a\nDeclare Integer b\nDeclare Integer next\na = 0\nb = 1\nFor i = 1 To 10\n    Display a\n    next = a + b\n    a = b\n    b = next\nEnd For\nStop"],
      ["e_change", "Start\nDeclare Integer pence\nDisplay \"How many pence?\"\nInput pence\nDisplay \"Pounds\"\nDisplay pence div 100\npence = pence mod 100\nDisplay \"Ten pences\"\nDisplay pence div 10\nDisplay \"Pennies\"\nDisplay pence mod 10\nStop"],
      ["e_quiz", "Start\nDeclare Integer score\nscore = 0\nscore = score + asked(\"2 plus 2?\", 4)\nscore = score + asked(\"5 times 3?\", 15)\nscore = score + asked(\"10 take 7?\", 3)\nDisplay \"You scored\"\nDisplay score\nStop\n\nFunction asked(question, answer)\n    Declare Integer said\n    Display question\n    Input said\n    If said = answer Then\n        Display \"Right\"\n        Return 1\n    Else\n        Display \"Wrong\"\n        Return 0\n    End If\nEnd Function"],
      ["e_sentinel", "Start\nDeclare Integer n\nDeclare Integer total\nDeclare Integer many\ntotal = 0\nmany = 0\nDisplay \"Numbers, please. 0 to finish.\"\nInput n\nWhile n <> 0\n    total = total + n\n    many = many + 1\n    Input n\nEnd While\nIf many > 0 Then\n    Display \"The average is\"\n    Display total / many\nElse\n    Display \"Nothing to average\"\nEnd If\nStop"],
      ["e_picktable", "Start\nDeclare Integer n\nDisplay \"Which table? 0 to stop.\"\nInput n\nWhile n > 0\n    For i = 1 To 12\n        Display n * i\n    End For\n    Display \"Which table? 0 to stop.\"\n    Input n\nEnd While\nDisplay \"Bye\"\nStop"]
    ]]
  ];

  // Put one in the box and draw it.
  function startFrom(code) {
    el("#code").value = code;
    showStarts();
    showExamples(false);
    el("#build").click();
  }

  function startButton(name, code, i) {
    var b = document.createElement("button");
    b.className = "btn small";
    b.textContent = TXT[name] || name;
    b.style.setProperty("--i", i);       // so they arrive one after another
    b.onclick = function () { startFrom(code); };
    return b;
  }

  // One line, not a block.  It began as a label and a row of four buttons
  // -- three programs and a way to the rest -- which is fifty-odd pixels
  // of the panel given over to something you need once and then never
  // again, sitting directly under the box you are trying to write in.
  // A sentence with a way in at the end of it says the same thing in a
  // fifth of the room, and every one of the twenty-one is behind it now
  // rather than three of them.
  function buildStarts() {
    var box = el("#starts");
    if (!box) { return; }
    var inner = el(".starts-in", box);
    inner.innerHTML = "";
    var said = document.createElement("span");
    said.className = "starts-said";
    said.textContent = TXT.try_short;
    var go = document.createElement("button");
    go.className = "starts-go";
    go.textContent = TXT.try_go;
    go.onclick = function () { showExamples(true); };
    inner.appendChild(said);
    inner.appendChild(go);
    buildExamples();
  }

  // All of them, in their levels, over the page.
  function buildExamples() {
    var body = el("#eg-body");
    if (!body) { return; }
    body.innerHTML = "";
    STARTS.forEach(function (level) {
      var part = document.createElement("section");
      part.className = "more-part";
      part.innerHTML = "<h3>" + (TXT[level[0]] || level[0]) + "</h3>";
      var list = document.createElement("div");
      list.className = "eg-row";
      level[1].forEach(function (pair, i) {
        list.appendChild(startButton(pair[0], pair[1], i));
      });
      part.appendChild(list);
      body.appendChild(part);
    });
  }

  function showExamples(open) {
    var over = el("#eg-over");
    if (!over) { return; }
    over.hidden = !open;
    if (open && el("#eg-done")) { el("#eg-done").focus(); }
  }

  if (el("#eg-done")) {
    el("#eg-done").onclick = function () { showExamples(false); };
  }
  if (el("#eg-over")) {
    el("#eg-over").onclick = function (ev) {
      if (ev.target === el("#eg-over")) { showExamples(false); }
    };
  }
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && el("#eg-over") && !el("#eg-over").hidden) {
      showExamples(false);
    }
  });

  // Folded away while there is anything in the box, which is nearly always:
  // it is there for the first minute and then never in the way again.
  function showStarts() {
    var box = el("#starts");
    if (!box || !el("#code")) { return; }
    if (el("#code").value.trim()) { box.classList.add("away"); }
    else { box.classList.remove("away"); }
  }

  if (el("#code")) { el("#code").addEventListener("input", showStarts); }

  // ------------------------------------ which two words a decision answers --
  // Two sides of one switch, and the chart is drawn again the moment it is
  // pressed: the words are in the drawing, so nothing else would show it.
  // ---------------------------------------------- everything else about it --
  // The switches behind the More button.  Every one of them is a thing the
  // drawing code could always be told and the studio had no way to say.
  // They are read straight off the page rather than kept in a variable
  // beside it: one place a thing is true is one place it can be wrong.
  var OPTIONS = ["o-tint", "o-everyout", "o-roomy", "o-chains", "o-columns",
                 "o-steady"];

  function optionOn(id) {
    var box = el("#" + id);
    return !!(box && box.checked);
  }

  function decideNow() {
    var on = el("#decide-seg .seg-btn.on");
    return on ? on.dataset.decide : "tf";
  }

  function forNow() {
    var on = el("#for-seg .seg-btn.on");
    return on ? on.dataset["for"] : "wide";
  }

  // What the drawing is asked for, beyond the pseudocode itself.  The
  // height to wrap at is a number rather than a switch, but nobody wants
  // to choose a number of pixels: on, it is about a page and a half deep,
  // which is where a chart stops being one anybody scrolls to the end of.
  function chartOptions() {
    return {
      decide: decideNow(),
      hexfor: forNow() === "hex",
      tint: optionOn("o-tint"),
      everyout: optionOn("o-everyout"),
      roomy: optionOn("o-roomy"),
      chains: optionOn("o-chains"),
      steady: optionOn("o-steady"),
      columns: optionOn("o-columns") ? 1400 : 0
    };
  }

  function wearOptions(was) {
    if (!was) { return; }
    wearDecide(was.decide);
    wearFor(was.hexfor ? "hex" : "wide");
    OPTIONS.forEach(function (id) {
      var box = el("#" + id);
      if (box) { box.checked = !!was[id.slice(2)]; }
    });
    dressMore();
  }

  function sideOn(seg, which, what) {
    all(seg + " .seg-btn").forEach(function (b) {
      if (b.dataset[what] === which) { b.classList.add("on"); }
      else { b.classList.remove("on"); }
    });
  }

  function wearDecide(which) {
    sideOn("#decide-seg", which === "yn" ? "yn" : "tf", "decide");
    dressMore();
  }

  function wearFor(which) {
    sideOn("#for-seg", which === "hex" ? "hex" : "wide", "for");
    dressMore();
  }

  // The button says when something behind it has been moved off what it
  // started as, with a dot rather than a word: a setting put away is not
  // the same as a setting hidden, and a panel that never shows a choice
  // has been made is a panel you have to open everything in to trust.
  function dressMore() {
    var button = el("#more");
    if (!button) { return; }
    var shape = el("#f-shape");
    var moved = decideNow() !== "tf" || forNow() !== "wide" ||
                !!(shape && shape.value && shape.value !== "auto");
    OPTIONS.forEach(function (id) { moved = moved || optionOn(id); });
    if (moved) { button.classList.add("some"); }
    else { button.classList.remove("some"); }
  }

  // ------------------------------------------------ opening the settings --
  function showMore(open) {
    var over = el("#more-over");
    if (!over) { return; }
    over.hidden = !open;
    if (el("#more")) {
      el("#more").setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (open && el("#more-done")) { el("#more-done").focus(); }
  }

  // Every switch in there draws the chart again the moment it is moved:
  // what it changes is in the drawing, so nothing else would show it, and
  // a sheet of settings that only take hold when it is shut is a sheet
  // you have to close and open again to see what you did.
  function optionChanged() {
    remember();
    dressMore();
    if (el("#code") && el("#code").value.trim()) { el("#build").click(); }
  }

  all("#more-over input[type=\"checkbox\"]").forEach(function (box) {
    box.onchange = optionChanged;
  });
  // The outline the chart aims at is a setting among the others now, so it
  // takes hold the way they all do rather than waiting for the next Build.
  if (el("#f-shape")) { el("#f-shape").onchange = optionChanged; }
  all("#decide-seg .seg-btn").forEach(function (b) {
    b.onclick = function () {
      if (b.classList.contains("on")) { return; }
      wearDecide(b.dataset.decide);
      optionChanged();
    };
  });
  all("#for-seg .seg-btn").forEach(function (b) {
    b.onclick = function () {
      if (b.classList.contains("on")) { return; }
      wearFor(b.dataset["for"]);
      optionChanged();
    };
  });
  if (el("#more-done")) {
    el("#more-done").onclick = function () { showMore(false); };
  }
  if (el("#more-over")) {
    // The dim behind it shuts it, the sheet itself does not.
    el("#more-over").onclick = function (ev) {
      if (ev.target === el("#more-over")) { showMore(false); }
    };
  }
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && el("#more-over") && !el("#more-over").hidden) {
      showMore(false);
    }
  });

  if (el("#more")) {
    el("#more").onclick = function () { showMore(true); };
  }

  var tongue = el("#f-lang");
  if (tongue) {
    tongue.onchange = function () {
      LANG = tongue.value;
      if (ALL[LANG]) {                   // the page can change its own words
        TXT = ALL[LANG];
        dress();
        buildPresets(); buildGlobals(); buildKinds(); drawSelection(); sizeList();
        buildStarts();
        if (el("#code").value.trim()) { el("#build").click(); }
      } else {
        location.search = "?lang=" + LANG;
      }
    };
  }
  var build = el("#build");
  // Drawing a new chart throws away the program that is on the paper, and a
  // run is a walk through that program.  Carrying on regardless left the
  // runner stepping through a chart nobody could see any more and printing
  // into the tape of a program that had been replaced -- so if something is
  // running when the button is pressed, it asks first.  See stopThenBuild.
  function drawItNow() {
      var says = el("#build-note");
      // The button says what it is doing by what color it is: red while it
      // is drawing, green the moment it is done, then back to blue a second
      // later, ready for the next one.
      build.disabled = true;
      build.classList.remove("done");
      build.classList.add("working");
      // A chart of a few lines is drawn faster than the eye can follow, and a
      // color that comes and goes inside a frame may as well not have been
      // there.  The red is held long enough to be seen, and everything that
      // follows waits its turn.
      var began = Date.now();
      function afterTheRed(go) {
        var left = 320 - (Date.now() - began);
        if (left > 0) { setTimeout(go, left); } else { go(); }
      }
      says.className = "";
      says.textContent = TXT.drawing;
      remember();
      askFor(Object.assign(chartOptions(), {
        text: el("#code").value,
        title: el("#f-title").value,
        author: el("#f-author").value,
        shape: el("#f-shape").value,
        seed: "",                      // a fresh one each time, unasked for
        lang: tongue ? tongue.value : "",
        legend: el("#f-legend").checked,
        grid: el("#f-grid").checked,
        shapes: geom
      })).then(function (data) {
        afterTheRed(function () {
          build.disabled = false;
          build.classList.remove("working");
          if (!data.ok) { return; }
          build.classList.add("done");
          setTimeout(function () { build.classList.remove("done"); }, 1300);
        });
        if (!data.ok) {
          says.className = "bad";
          says.textContent = data.error || TXT.failed;
          showProblems(null);
          return;
        }
        el("#sheet").innerHTML = data.svg;
        // On a narrow screen the panel is lying over the chart, so it is put
        // away: you pressed the button to see a chart, not to keep looking at
        // the button.  On a wide screen it stays where it is.
        if (panelIsOver()) { showPanel(false); }
        setTimeout(fitIfItMustBe, 0);    // never show it with its sides cut off
        FILE = data.name || FILE;
        el("#svg-link").download = FILE + ".svg";
        document.title = data.title || FILE;
        el(".brand").firstChild.textContent = data.title || FILE;
        el("#sub").textContent = TXT.flowchart + " · " + data.w + " x " +
                                 data.h + " px";
        AST = data.ast || null;
        dressRunner();                   // there is something to run now
        forgetLines();
        if (AST) {
          noteLines(AST.main);
          (AST.modules || []).forEach(function (mod) { noteLines(mod.body); });
        }
        freshTape();               // a new program: nothing of the old one
        bind();
        paint();
        showTheStart();            // wherever this one came out, begin at it
        // Nothing is said when it works.  The button goes green and the chart
        // appears, which is two ways of saying it already; a line of text
        // underneath saying it a third time is just something else to read.
        // What goes wrong is still said, because nothing else says that.
        says.textContent = "";
        showProblems(data.problems);
      }).catch(function (err) {
        afterTheRed(function () {
          build.disabled = false;
          build.classList.remove("working");
        });
        says.className = "bad";
        says.textContent = say("not_answering", { err: (err && err.message) || err });
      });
  }
  if (build) {
    build.onclick = function () { stopThenBuild(drawItNow); };
  }


