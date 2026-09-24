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
  var pyReady = false;                   // Python in the worker has started

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
    // How far Python has got with starting, for the bar a build shows
    // while it waits on it.  Python itself is most of the wait and says
    // nothing while it loads, so the fetching of our own files is the only
    // part counted as it goes.
    function booting(id, part) {
      self.postMessage({ id: id, step: "boot", part: part });
    }
    // How much memory Python has taken, which it never gives back (see
    // letPythonGo).
    function heapOf(py) {
      try { return py._module.HEAPU8.length; } catch (e) { return 0; }
    }
    function start(job) {
      if (ready) { return ready; }
      ready = Promise.resolve().then(function () {
        importScripts(job.where + "pyodide.js");
        booting(job.id, 0.08);
        return loadPyodide({ indexURL: job.where });
      }).then(function (py) {
        booting(job.id, 0.75);
        // The package, fetched a module at a time and written into
        // Python's own filesystem, where importing it works exactly as it
        // does on a computer.  They go at once rather than one after the
        // other: two dozen small files over one connection is no wait at
        // all, and it is a fifth of what one joined-up file used to cost.
        //
        // Each is checked with the server rather than taken from the
        // browser's cache on trust.  Taken on trust, a page that had just
        // been put up again ran the Python it had kept from the last visit
        // -- new buttons, old drawing -- for hours afterwards, a file being
        // kept for longer the longer it had gone unchanged before.  A file
        // that has not changed still comes from the cache, after a reply
        // that says so.
        var fetched = 0;
        return Promise.all(job.files.map(function (path) {
          return fetch(job.root + path, { cache: "no-cache" }).then(function (r) {
            if (!r.ok) { throw new Error(path + " (" + r.status + ")"); }
            return r.text();
          }).then(function (text) {
            fetched += 1;
            booting(job.id, 0.75 + 0.1 * fetched / job.files.length);
            return [path, text];
          });
        })).then(function (got) {
          putThere(py, got);
          // draw_json is handed a function to tell how far each drawing
          // has got (see progress.py), and lets go of it when done.
          //
          // What it hands back is bytes, not a string.  Python's string,
          // made into the browser's, was three seconds and two gigabytes
          // for the eighty megabytes a program of a hundred thousand lines
          // draws; the same as bytes is a copy, handed over as it stands
          // (see the postMessage below) and read on the page in a blink.
          py.runPython([
            "import sys, json, os",
            "sys.path.insert(0, os.getcwd())",
            "from flowchart import progress",
            "from flowchart.studio.drawing import draw_for_studio",
            "def draw_json(ask, hear=None):",
            "    progress.listen(hear)",
            "    try:",
            "        out = json.dumps(draw_for_studio(json.loads(ask)))",
            "    except Exception as exc:",
            "        out = json.dumps({'ok': False,",
            "                          'error': str(exc) or type(exc).__name__})",
            "    finally:",
            "        progress.listen(None)",
            "    return out.encode()"
          ].join("\n"));
          booting(job.id, 1);
          return py;
        });
      });
      return ready;
    }
    self.onmessage = function (ev) {
      var job = ev.data;
      var first = !ready;
      var drawing = false;               // Python up, and drawing this one
      if (first) { self.postMessage({ id: job.id, note: "starting" }); }
      start(job).then(function (py) {
        if (first) { self.postMessage({ id: job.id, note: "ready" }); }
        if (job.warm) { self.postMessage({ id: job.id, out: "" }); return; }
        var fn = py.globals.get("draw_json");
        drawing = true;
        var got = fn(job.ask, function (stage, part) {
          self.postMessage({ id: job.id, step: stage, part: part });
        });
        fn.destroy();
        var bytes = got.toJs();          // out of Python's memory, once
        got.destroy();
        self.postMessage({ id: job.id, bytes: bytes, heap: heapOf(py) },
                         [bytes.buffer]);
      }).catch(function (err) {
        ready = null;                    // let the next one try again
        self.postMessage({ id: job.id, lost: drawing,
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
        // How far a drawing has got, or Python with starting, goes to the
        // bar whichever job it came with: starting is done once, for
        // whichever job happened to be first, and the build waits on it.
        if (ev.data.step) { barStep(ev.data.step, ev.data.part); return; }
        if (ev.data.note === "ready" || ev.data.out !== undefined || ev.data.bytes) {
          pyReady = true;
        }
        var job = pyJobs[ev.data.id];
        if (!job) { return; }
        if (ev.data.note) { job.note(ev.data.note); return; }
        delete pyJobs[ev.data.id];
        pyHeap = Math.max(pyHeap, ev.data.heap || 0);
        // Let go before the drawing goes onto the page, not after: the two
        // of them together are what the page could not hold.
        if (pyHeap > HEAP_MOST && !Object.keys(pyJobs).length) { letPythonGo(); }
        if (ev.data.error) {
          var err = new Error(ev.data.error);
          err.lost = !!ev.data.lost;
          job.no(err);
        }
        else if (ev.data.bytes) { job.go(new TextDecoder().decode(ev.data.bytes)); }
        else { job.go(ev.data.out); }
      };
      // A worker falling over once Python was up fell over drawing, and
      // is not one that could not start (see drawAside).
      pyHand.onerror = function () {
        for (var id in pyJobs) {
          var err = new Error("worker");
          err.lost = pyReady;
          pyJobs[id].no(err);
        }
        pyJobs = {};
      };
    } catch (e) {
      pyHand = false;                    // no worker here: the page does it
    }
    return pyHand;
  }

  // Python never hands back memory it has taken, and its worker lives off
  // the same allowance as the page.  A program of a hundred thousand lines
  // left three quarters of a gigabyte in it, held for as long as the page
  // was open, beside a chart of half a million pieces that needs a good
  // gigabyte of its own.  So a Python that has had to grow that big is let
  // go once it has handed its drawing over, and the next build starts a
  // fresh one -- a second or two, against a drawing of a minute or more.
  var HEAP_MOST = 512 * 1048576;         // bytes, past which Python is let go
  var pyHeap = 0;                        // the most this Python has taken
  function letPythonGo() {
    if (!pyHand) { return; }
    pyHand.terminate();
    pyHand = null;                       // asked for again when next wanted
    pyReady = false;
    pyHeap = 0;
    var left = pyJobs;                   // nothing still waiting on it waits
    pyJobs = {};                         //   for ever
    for (var id in left) {
      var err = new Error("worker");
      err.lost = true;
      left[id].no(err);
    }
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
      return barToPage(text.length).then(function () { return JSON.parse(text); });
    }, function (err) {
      // Python started and then fell over part way through the drawing --
      // out of memory, on a very long program.  Drawing it again on the
      // page's own thread, as below, would fall over the same way and take
      // the page down with it, so it is said instead, and the next build
      // gets a fresh Python.
      if (err && err.lost) {
        letPythonGo();
        var said = new Error(say("py_gave_out", { err: err.message }));
        said.plain = true;
        throw said;
      }
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

  // Python, started in the worker while the program is still being written,
  // so that the first build finds it ready.  It used to be started on the
  // page's own thread instead: a whole second Python that no build ever
  // used, since every build is drawn in the worker.  The first build still
  // waited for the worker's Python to start from nothing, and the page went
  // on holding both of them -- memory a program of forty thousand lines
  // needs for itself.  Where there is no worker, it is the old way still.
  function warmAside() {
    var hand = pythonHand();
    if (!hand) { startPython(); return; }
    var says = el("#build-note");
    var id = pyNext++;
    function unsaid() {                  // "starting", once it no longer is
      if (says && says.textContent === TXT.starting) { says.textContent = TXT.ready; }
    }
    pyJobs[id] = {
      go: unsaid,
      no: function () {                  // the build will try again, and say so
        if (says && says.textContent === TXT.starting) { says.textContent = ""; }
      },
      note: function (what) {
        if (what === "starting" && says && !says.textContent) {
          says.className = "";
          says.textContent = TXT.starting;
        }
      }
    };
    hand.postMessage({ id: id, warm: true, where: PYODIDE,
                       root: new URL(".", location.href).href, files: PYFILES });
  }

  function drawHere(ask) {               // the slow way: on the page's thread
    return startPython().then(function (py) {
      var fn = py.globals.get("draw_json");
      var got = fn(JSON.stringify(ask));  // bytes, as in the worker
      fn.destroy();
      var text = new TextDecoder().decode(got.toJs());
      got.destroy();
      return JSON.parse(text);
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
        return fetch(path, { cache: "no-cache" }).then(function (r) {   // as above
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
          "        out = json.dumps(draw_for_studio(json.loads(ask)))",
          "    except Exception as exc:",
          "        out = json.dumps({'ok': False,",
          "                          'error': str(exc) or type(exc).__name__})",
          "    return out.encode()"
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
    }).then(function (r) { return r.text(); }).then(function (text) {
      return barToPage(text.length).then(function () { return JSON.parse(text); });
    });
  }

  // ------------------------------------------ how far a drawing has got --
  // A chart of a few dozen lines is drawn before the button has finished
  // going red.  One of thousands is seconds of it -- more on the website,
  // where Python runs in the browser, and more again the first time, when
  // Python itself has to be started -- and seconds of a button that says
  // only "Drawing..." are seconds of wondering whether it has stuck.
  //
  // So a drawing still going after BAR_AFTER gets a bar over the stage,
  // saying which stage it is at and how far through.  On the website the
  // drawing itself says so as it goes (progress.py, through the worker);
  // the served studio answers all at once, so there the bar creeps on its
  // own, never quite reaching the end of the stage it is in until the
  // drawing arrives.  The last stage is the page's own: a drawing of tens
  // of thousands of shapes takes a moment to be put on the paper, and the
  // page cannot paint while it does that, so the bar says so first.
  //
  // The bar says how much of the wait is over.  The stages had fixed
  // shares of it -- a fifth for laying out, half for drawing -- that were
  // nothing like the time: laying out, the long part, filled its fifth and
  // sat at thirty percent; drawing, the short part, leapt from there to
  // eighty; and putting the chart on the page, as long as the rest put
  // together on a big one, had the last seventh and stood still for all of
  // it.  Now it is the time gone over the time gone and the time still to
  // come (barTick), with how long each stage takes for every line of
  // pseudocode learnt from the drawings this browser has had, and kept
  // between visits.
  var BAR_AFTER = 400;                   // ms before anything is shown
  var BAR_SAID = { boot: "b_boot", read: "b_read", lay: "b_lay",
                   draw: "b_draw", whole: "b_draw", send: "b_draw",
                   page: "b_page" };
  // The stages, in order.  The served studio's Python answers all at once,
  // so there reading, laying out and drawing are one stage.
  var BAR_STAGES = MODE === "web" ? ["read", "lay", "draw", "send", "page"]
                                  : ["whole", "page"];
  // Milliseconds for every line of pseudocode, beyond BAR_FIXED -- a first
  // guess, measured, until this browser has had a drawing of its own to go
  // by.  A chart asked for in a shape is laid out several times over, so
  // its laying out is timed apart from the rest (layFit).
  var barPace = MODE === "web"
    ? { read: 0.01, lay: 0.015, layFit: 0.08, draw: 0.06, send: 0.02, page: 0.065 }
    : { whole: 0.03, page: 0.065 };
  var BAR_PACE_KEY = "flowchart-bar-pace:" + MODE;
  try {
    var paceWas = JSON.parse(localStorage.getItem(BAR_PACE_KEY));
    Object.keys(barPace).forEach(function (k) {
      if (paceWas && paceWas[k] > 0) { barPace[k] = paceWas[k]; }
    });
  } catch (e) { /* nothing kept: the first guess it is */ }
  var BAR_FIXED = 30;                    // ms any stage costs, however short
  var BOOT_TAKES = 2500;                 // Python starting, give or take
  var drawWait = null;                   // the drawing being waited on

  function barBegin(text) {
    barEnd(false);
    var boot = MODE === "web" && pyHand !== false && !pyReady;
    var lines = String(text || "").split("\n").length;
    var shape = el("#f-shape") ? el("#f-shape").value : "auto";
    var fit = shape !== "auto" && shape !== "tall";
    drawWait = { boot: boot, stage: null, part: 0, at: 0, drawn: -1,
                 said: "", box: null, show: 0, creep: 0, since: Date.now(),
                 t0: Date.now(), lines: lines, fit: fit, began: {},
                 plan: barPlan(lines, boot, fit) };
    barStep(boot ? "boot" : BAR_STAGES[0], 0);
    drawWait.show = setTimeout(barShow, BAR_AFTER);
  }

  function barKey(stage, fit) { return stage === "lay" && fit ? "layFit" : stage; }

  // How long each stage of this drawing ought to take.  Python starting,
  // on a first visit, is timed on its own.
  function barPlan(lines, boot, fit) {
    var order = (boot ? ["boot"] : []).concat(BAR_STAGES);
    var ms = {};
    order.forEach(function (s) {
      ms[s] = s === "boot" ? BOOT_TAKES : BAR_FIXED + barPace[barKey(s, fit)] * lines;
    });
    return { order: order, ms: ms };
  }

  function barTakes(one) { return Math.max(120, one.plan.ms[one.stage] || 400); }

  // How far along the wait it is: the time gone, over the time gone and
  // the time still to come.  What has gone is measured, not guessed, so
  // the only thing that can put the bar out is the guess about what is
  // left -- the rest of this stage and the whole of the ones after it --
  // and that is put right as each stage finishes.  It was a share of the
  // bar per stage instead, fixed before anything had happened: a stage
  // that came in early left the bar short for good, and the last stage
  // was made to carry all of it.
  //
  // What is left of this stage is worked out from how fast it is really
  // going, once it has said how far it has got; from the clock otherwise,
  // and never quite nothing while it is still going on.
  function barLeft(one, now) {
    var ms = barTakes(one), took = now - one.since, part = one.part;
    if (part >= 0.15 && took > 60) {
      return Math.max(took * (1 - part) / part, ms * 0.03);
    }
    return Math.max(ms - took, ms * 0.12 * (1 - part));
  }

  // And the guess about the stages to come is put right by how the ones
  // already over came out against theirs: a program that has read and
  // laid out a fifth faster than expected, on this machine, will most
  // likely draw a fifth faster too.  Only partly trusted, and within
  // bounds, so that one odd stage cannot throw the rest.
  function barSpeed(one) {
    var plan = one.plan, took = 0, meant = 0;
    plan.order.slice(0, plan.order.indexOf(one.stage)).forEach(function (s, i, done) {
      if (s === "boot" || !one.began[s]) { return; }
      var next = i + 1 < done.length ? one.began[done[i + 1]] : one.since;
      if (!next) { return; }
      took += next - one.began[s];
      meant += plan.ms[s];
    });
    if (meant < 150 || took <= 0) { return 1; }
    return Math.min(1.8, Math.max(0.55, Math.pow(took / meant, 0.7)));
  }

  function barTick(one) {
    if (!one || !one.stage) { return; }
    var now = Date.now(), plan = one.plan, after = 0;
    plan.order.slice(plan.order.indexOf(one.stage) + 1).forEach(function (s) {
      after += plan.ms[s];
    });
    after *= barSpeed(one);
    var gone = now - one.t0;
    var at = gone / Math.max(1, gone + barLeft(one, now) + after);
    one.at = Math.max(one.at, Math.min(0.99, at));
    barPaint(one);
  }

  // Never backwards: a report from a stage before the one under way --
  // Python still starting, heard after the drawing has begun -- is old
  // news, and is left out.
  function barStep(stage, part) {
    if (!drawWait || !BAR_SAID[stage]) { return; }
    var order = drawWait.plan.order, here = order.indexOf(stage);
    if (here < 0 || here < order.indexOf(drawWait.stage)) { return; }
    if (stage !== drawWait.stage) {
      drawWait.stage = stage;
      drawWait.part = 0;
      drawWait.since = Date.now();
      drawWait.began[stage] = drawWait.since;     // what it took, to learn from
    }
    drawWait.part = Math.max(drawWait.part, Math.min(1, Math.max(0, part || 0)));
    barTick(drawWait);
  }

  function barShow() {
    if (!drawWait || drawWait.box) { return; }
    var stage = el("#stage");
    if (!stage || !stage.parentNode) { return; }
    var old = el("#build-bar");          // the last one, still on its way out
    if (old) { old.remove(); }
    var box = document.createElement("div");
    box.id = "build-bar";
    box.setAttribute("role", "progressbar");
    box.setAttribute("aria-valuemin", "0");
    box.setAttribute("aria-valuemax", "100");
    box.setAttribute("aria-label", TXT.b_about || "");
    box.innerHTML = '<div class="bb-top"><span class="bb-said"></span>' +
                    '<span class="bb-pct"></span></div>' +
                    '<div class="bb-track"><div class="bb-fill"></div>' +
                    '<div class="bb-shine"></div></div>';
    // In the frame the stage hangs its slider bars in, which is the
    // stage's own size whatever the stage has scrolled to.
    stage.parentNode.appendChild(box);
    drawWait.box = box;
    barPaint(drawWait);
    // Between reports -- and all the way, where nothing reports -- it is
    // worked out again as the time goes by (barTick), so it moves on
    // steadily and never looks finished before it is.
    drawWait.creep = setInterval(function () { barTick(drawWait); }, 120);
  }

  // Only what changed is written: this is called a dozen times a second
  // beside a page that may be holding a very large chart.
  function barPaint(one) {
    if (!one || !one.box) { return; }
    var pct = Math.floor(one.at * 100);
    var said = TXT[BAR_SAID[one.stage]] || "";
    if (said !== one.said) {
      el(".bb-said", one.box).textContent = said;
      one.said = said;
    }
    if (pct !== one.drawn) {
      el(".bb-pct", one.box).textContent = pct + "%";
      // Not while it coasts (barCoast): the fill is already on its way to
      // further than this, and would be pulled back to it.
      if (!one.box.classList.contains("coasting")) {
        el(".bb-fill", one.box).style.transform = "scaleX(" + one.at.toFixed(3) + ")";
        // the light, cut off where the fill ends (see .bb-shine)
        el(".bb-shine", one.box).style.clipPath =
          "inset(0 " + ((1 - one.at) * 100).toFixed(1) + "% 0 0)";
      }
      one.box.setAttribute("aria-valuenow", String(pct));
      one.drawn = pct;
    }
  }

  // The drawing has come back and is about to go onto the paper, which
  // holds the page still for as long as it takes.  If the bar is up, or a
  // drawing this big is sure to want one, it says so and gets painted
  // first; otherwise nothing waits for it.
  function barToPage(size) {
    if (!drawWait) { return Promise.resolve(); }
    if (!drawWait.box && size > 1500000) { clearTimeout(drawWait.show); barShow(); }
    barStep("page", 0);                  // timed, whether or not it is shown
    if (!drawWait.box) { return Promise.resolve(); }
    barCoast(drawWait);
    return new Promise(function (go) {
      var gone = false;
      function once() { if (!gone) { gone = true; go(); } }
      // A frame, then out of it, so the bar has been painted -- and a
      // plain timer as well, because a tab out of sight has no frames.
      requestAnimationFrame(function () { setTimeout(once, 0); });
      setTimeout(once, 80);
    });
  }

  // Putting the chart on the page holds the page up from start to finish:
  // nothing on it moves until the chart is there, the bar included, and on
  // a big chart that is the longest wait of all.  The one thing a page that
  // busy can still move is a slide it handed over beforehand -- the
  // browser runs that on its own -- so the fill is sent on towards the end
  // over as long as this stage ought to take, and the frame barToPage waits
  // for is what hands it over.  The number cannot follow it, so it is put
  // away until the end rather than left saying a figure the bar has passed.
  var COAST = [0.3, 0.55, 0.6, 1];       // the curve it coasts along
  function barCoast(one) {
    if (!one || !one.box || one.stage !== "page") { return; }
    var fill = el(".bb-fill", one.box);
    var to = one.at + (1 - one.at) * 0.96;
    var ms = Math.round(barTakes(one));
    // It sets off from wherever the last slide has got the fill to, which
    // may well be short of where that slide was going.
    var was = /^matrix\(([^,]+)/.exec(getComputedStyle(fill).transform);
    var from = was ? Math.min(one.at, +was[1]) : one.at;
    fill.style.transition = "transform " + ms + "ms cubic-bezier(" + COAST.join(", ") + ")";
    fill.style.transform = "scaleX(" + to.toFixed(3) + ")";
    // And with the next frame, which on a busy page is a while coming, and
    // it has not set off at all if the page got busy first.
    var coast = one.coast = { from: from, to: to, ms: ms, t0: 0 };
    requestAnimationFrame(function (frame) { coast.t0 = frame; });
    one.box.classList.add("coasting");
  }

  // Where the coasting fill has got to on the screen, worked out from the
  // clock.  The page cannot be asked: its own clock for what it animates
  // only moves on between frames, and the whole of the coast happens inside
  // the one long stretch of work that puts the chart on the page -- so to
  // the page, the fill is still where the coast began.  The last step to the
  // end was taken from there, and a bar the browser had already carried
  // nearly to the end on its own jumped back to where the coast began and
  // filled up all over again.
  function coastAt(c) {
    if (!c.t0) { return c.from; }        // never set off (see barCoast)
    var x = Math.min(1, Math.max(0, (performance.now() - c.t0) / c.ms));
    function along(a, b, t) {
      return 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
    }
    var lo = 0, hi = 1;                  // the point on the curve that far across
    for (var i = 0; i < 30; i++) {
      if (along(COAST[0], COAST[2], (lo + hi) / 2) < x) { lo = (lo + hi) / 2; }
      else { hi = (lo + hi) / 2; }
    }
    return c.from + (c.to - c.from) * along(COAST[1], COAST[3], (lo + hi) / 2);
  }

  // What this drawing's stages really took teaches the next one what to
  // expect -- each stage from when it began to when the next one did, the
  // last to now.  Only from a program long enough for its lines to be most
  // of the wait: a ten-line one is all fixed cost, and learnt from, it
  // would have the next long one expecting minutes.  Half the old guess
  // and half the new, so one odd drawing does not throw the next.
  function barLearn(one) {
    if (one.lines < 200) { return; }
    var order = one.plan.order, now = Date.now();
    order.forEach(function (s, i) {
      if (s === "boot" || !one.began[s]) { return; }
      var next = null;
      for (var j = i + 1; j < order.length && next === null; j++) {
        if (one.began[order[j]]) { next = one.began[order[j]]; }
      }
      if (next === null && i < order.length - 1) { return; }  // never saw it end
      var per = Math.max(0, (next === null ? now : next) - one.began[s] - BAR_FIXED) / one.lines;
      var key = barKey(s, one.fit);
      barPace[key] = Math.min(20, Math.max(0.001, barPace[key] * 0.5 + per * 0.5));
    });
    try { localStorage.setItem(BAR_PACE_KEY, JSON.stringify(barPace)); }
    catch (e) { /* storage turned off: it learns again next visit */ }
  }

  // Done: filled to the end and then gone.  Not done -- it failed, or it
  // was superseded -- it goes at once, and the note under the button says
  // what went wrong.
  function barEnd(ok) {
    if (!drawWait) { return; }
    var was = drawWait;
    drawWait = null;
    clearTimeout(was.show);
    clearInterval(was.creep);
    if (ok) { barLearn(was); }
    var box = was.box;
    if (!box) { return; }
    if (ok) {
      var fill = el(".bb-fill", box);
      if (was.coast) {
        // Set down where the screen shows it, and taken as it stands, so
        // that the last step starts from there (see coastAt).
        fill.style.transition = "none";
        fill.style.transform = "scaleX(" + coastAt(was.coast).toFixed(3) + ")";
        getComputedStyle(fill).transform;
      }
      was.at = 1;
      fill.style.transition = "";        // the quick one again, to the end
      box.classList.remove("coasting");
      barPaint(was);
      box.classList.add("full");
      setTimeout(function () { box.classList.add("going"); }, 260);
      setTimeout(function () { box.remove(); }, 520);
    } else {
      box.remove();
    }
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
  // Fifty programs are, in five sections of ten, each named for what is in
  // it: the basics one idea at a time, decisions and loops together,
  // numbers and patterns, everyday programs, and then bigger projects --
  // whole programs of thirty to seventy lines, most of them split into
  // modules and functions, the size a course works up to.  All of them
  // are a press away from the line under the box.
  //
  // They are written in US English, down to the money: dollars, dimes and
  // cents, and a letter grade on the 90 / 80 / 70 / 60 scale.
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
      ["e_add", "Start\nDeclare Integer a\nDeclare Integer b\nDisplay \"Two numbers, please\"\nInput a\nInput b\nDisplay \"They come to\"\nDisplay a + b\nStop"],
      ["e_swap", "Start\nDeclare Integer a\nDeclare Integer b\nDeclare Integer keep\nInput a\nInput b\nkeep = a\na = b\nb = keep\nDisplay a\nDisplay b\nStop"],
      ["e_decide", "Start\nDeclare Integer age\nDisplay \"How old are you?\"\nInput age\nIf age >= 18 Then\n    Display \"Old enough to vote\"\nElse\n    Display \"Not old enough yet\"\nEnd If\nStop"],
      ["e_oddeven", "Start\nDeclare Integer n\nDisplay \"Enter a number\"\nInput n\nIf n mod 2 = 0 Then\n    Display \"even\"\nElse\n    Display \"odd\"\nEnd If\nStop"],
      ["e_count", "Start\nFor i = 1 To 5\n    Display i\nEnd For\nStop"],
      ["e_while", "Start\nDeclare Integer n\nn = 1\nWhile n <= 5\n    Display n\n    n = n + 1\nEnd While\nStop"],
      ["e_total", "Start\nDeclare Integer total\ntotal = 0\nFor i = 1 To 10\n    total = total + i\nEnd For\nDisplay \"The total is\"\nDisplay total\nStop"],
      ["e_module", "Start\nDeclare String name\nInput name\nCall greet(name)\nStop\n\nModule greet(who)\n    Display \"Hello\"\n    Display who\nEnd Module"],
      ["e_answers", "Start\nDeclare Integer a\nDeclare Integer b\nDeclare Integer sum\nInput a\nInput b\nsum = add(a, b)\nDisplay \"The answer is\"\nDisplay sum\nStop\n\nFunction add(x, y)\n    Return x + y\nEnd Function"]
    ]],
    ["eg_l2", [
      ["e_grades", "Start\nDeclare Integer score\nDisplay \"Enter the score\"\nInput score\nIf score >= 90 Then\n    Display \"A\"\nElse If score >= 80 Then\n    Display \"B\"\nElse If score >= 70 Then\n    Display \"C\"\nElse If score >= 60 Then\n    Display \"D\"\nElse\n    Display \"F\"\nEnd If\nStop"],
      ["e_biggest", "Start\nDeclare Integer a\nDeclare Integer b\nDeclare Integer c\nDeclare Integer biggest\nInput a\nInput b\nInput c\nbiggest = a\nIf b > biggest Then\n    biggest = b\nEnd If\nIf c > biggest Then\n    biggest = c\nEnd If\nDisplay \"The biggest is\"\nDisplay biggest\nStop"],
      ["e_menu", "Start\nDeclare Integer choice\nDisplay \"1 add  2 subtract  3 quit\"\nInput choice\nSelect Case choice\n    Case 1\n        Display \"Adding\"\n    Case 2\n        Display \"Subtracting\"\n    Case Else\n        Display \"Goodbye\"\nEnd Select\nStop"],
      ["e_vowel", "Start\nDeclare String letter\nDisplay \"Enter a letter\"\nInput letter\nSelect Case letter\n    Case \"a\"\n        Display \"vowel\"\n    Case \"e\"\n        Display \"vowel\"\n    Case \"i\"\n        Display \"vowel\"\n    Case \"o\"\n        Display \"vowel\"\n    Case \"u\"\n        Display \"vowel\"\n    Case Else\n        Display \"not a vowel\"\nEnd Select\nStop"],
      ["e_leap", "Start\nDeclare Integer year\nDisplay \"Which year?\"\nInput year\nIf year mod 400 = 0 Then\n    Display \"leap year\"\nElse If year mod 100 = 0 Then\n    Display \"not a leap year\"\nElse If year mod 4 = 0 Then\n    Display \"leap year\"\nElse\n    Display \"not a leap year\"\nEnd If\nStop"],
      ["e_keepasking", "Start\nDeclare Integer n\nDo\n    Display \"Enter a number from 1 to 10\"\n    Input n\nUntil n >= 1 And n <= 10\nDisplay \"Thank you\"\nStop"],
      ["e_backwards", "Start\nDeclare Integer n\nDisplay \"Count back from?\"\nInput n\nFor i = n To 1 Step -1\n    Display i\nEnd For\nDisplay \"Done\"\nStop"],
      ["e_sumevens", "Start\nDeclare Integer total\ntotal = 0\nFor i = 1 To 20\n    If i mod 2 = 0 Then\n        total = total + i\n    End If\nEnd For\nDisplay \"The evens come to\"\nDisplay total\nStop"],
      ["e_countdown", "Start\nDeclare Integer n\nn = 10\nWhile n > 0\n    Display n\n    If n = 5 Then\n        Display \"Halfway\"\n    End If\n    n = n - 1\nEnd While\nDisplay \"Liftoff\"\nStop"],
      ["e_guess", "Start\nDeclare Integer secret\nDeclare Integer guess\nsecret = 7\nDo\n    Display \"Guess my number\"\n    Input guess\n    If guess < secret Then\n        Display \"Higher\"\n    End If\n    If guess > secret Then\n        Display \"Lower\"\n    End If\nUntil guess = secret\nDisplay \"You got it\"\nStop"]
    ]],
    ["eg_l3", [
      ["e_fizz", "Start\nFor i = 1 To 15\n    If i mod 15 = 0 Then\n        Display \"FizzBuzz\"\n    Else If i mod 3 = 0 Then\n        Display \"Fizz\"\n    Else If i mod 5 = 0 Then\n        Display \"Buzz\"\n    Else\n        Display i\n    End If\nEnd For\nStop"],
      ["e_prime", "Start\nDeclare Integer n\nDeclare Integer factors\nDisplay \"Enter a number\"\nInput n\nfactors = 0\nFor i = 1 To n\n    If n mod i = 0 Then\n        factors = factors + 1\n    End If\nEnd For\nIf factors = 2 Then\n    Display \"prime\"\nElse\n    Display \"not prime\"\nEnd If\nStop"],
      ["e_gcd", "Start\nDeclare Integer a\nDeclare Integer b\nDisplay \"Two numbers, please\"\nInput a\nInput b\nWhile a <> b\n    If a > b Then\n        a = a - b\n    Else\n        b = b - a\n    End If\nEnd While\nDisplay \"The greatest common factor is\"\nDisplay a\nStop"],
      ["e_digits", "Start\nDeclare Integer n\nDeclare Integer many\nDisplay \"Enter a whole number\"\nInput n\nmany = 0\nWhile n > 0\n    n = n div 10\n    many = many + 1\nEnd While\nDisplay \"That many digits:\"\nDisplay many\nStop"],
      ["e_reverse", "Start\nDeclare Integer n\nDeclare Integer back\nDisplay \"Enter a whole number\"\nInput n\nback = 0\nWhile n > 0\n    back = back * 10 + n mod 10\n    n = n div 10\nEnd While\nDisplay \"Backwards that is\"\nDisplay back\nStop"],
      ["e_fib", "Start\nDeclare Integer a\nDeclare Integer b\nDeclare Integer next\na = 0\nb = 1\nFor i = 1 To 10\n    Display a\n    next = a + b\n    a = b\n    b = next\nEnd For\nStop"],
      ["e_factorial", "Start\nDeclare Integer n\nDeclare Integer answer\nDisplay \"Enter a number\"\nInput n\nanswer = 1\nFor i = 1 To n\n    answer = answer * i\nEnd For\nDisplay \"The factorial is\"\nDisplay answer\nStop"],
      ["e_minmax", "Start\nDeclare Integer n\nDeclare Integer lowest\nDeclare Integer highest\nDisplay \"Five numbers, please\"\nInput n\nlowest = n\nhighest = n\nFor i = 2 To 5\n    Input n\n    If n < lowest Then\n        lowest = n\n    End If\n    If n > highest Then\n        highest = n\n    End If\nEnd For\nDisplay \"Lowest\"\nDisplay lowest\nDisplay \"Highest\"\nDisplay highest\nStop"],
      ["e_grid", "Start\nFor row = 1 To 5\n    For col = 1 To 5\n        Display row * col\n    End For\nEnd For\nStop"],
      ["e_stars", "Start\nDeclare String line\nDeclare Integer n\nDisplay \"How many rows?\"\nInput n\nFor row = 1 To n\n    line = \"\"\n    For col = 1 To row\n        line = line + \"*\"\n    End For\n    Display line\nEnd For\nStop"]
    ]],
    ["eg_l4", [
      ["e_area", "Start\nDeclare Integer width\nDeclare Integer height\nDisplay \"How wide?\"\nInput width\nDisplay \"How tall?\"\nInput height\nDisplay \"The area is\"\nDisplay width * height\nStop"],
      ["e_change", "Start\nDeclare Integer cents\nDisplay \"How many cents?\"\nInput cents\nDisplay \"Dollars\"\nDisplay cents div 100\ncents = cents mod 100\nDisplay \"Dimes\"\nDisplay cents div 10\nDisplay \"Pennies\"\nDisplay cents mod 10\nStop"],
      ["e_temps", "Start\nDeclare String fromScale\nDeclare String toScale\nDeclare Real degrees\nDeclare Real celsius\nDeclare Real result\nDeclare String again\nDo\n    fromScale = askScale(\"Convert from C, F or K?\")\n    toScale = askScale(\"Convert to C, F or K?\")\n    Display \"The temperature?\"\n    Input degrees\n    celsius = toCelsius(degrees, fromScale)\n    result = round(fromCelsius(celsius, toScale) * 100) / 100\n    Display degrees, \" \", fromScale, \" is \", result, \" \", toScale\n    Display \"Another one? y or n\"\n    Input again\nUntil toupper(again) <> \"Y\"\nStop\n\nFunction askScale(question)\n    Declare String scale\n    Display question\n    Input scale\n    scale = toupper(scale)\n    While scale <> \"C\" And scale <> \"F\" And scale <> \"K\"\n        Display \"Please type C, F or K\"\n        Input scale\n        scale = toupper(scale)\n    End While\n    Return scale\nEnd Function\n\nFunction toCelsius(deg, scale)\n    If scale = \"F\" Then\n        Return (deg - 32) * 5 / 9\n    Else If scale = \"K\" Then\n        Return deg - 273.15\n    Else\n        Return deg\n    End If\nEnd Function\n\nFunction fromCelsius(deg, scale)\n    If scale = \"F\" Then\n        Return deg * 9 / 5 + 32\n    Else If scale = \"K\" Then\n        Return deg + 273.15\n    Else\n        Return deg\n    End If\nEnd Function"],
      ["e_shop", "Start\nDeclare Integer many\nDeclare Real price\nDeclare Real total\nDisplay \"How many?\"\nInput many\nDisplay \"Price each?\"\nInput price\ntotal = many * price\nIf total > 50 Then\n    total = total * 0.9\n    Display \"Ten percent off\"\nEnd If\nDisplay \"Amount due: $\", total\nStop"],
      ["e_report", "Start\nDeclare Integer score\nDeclare Integer total\nDeclare Integer passes\nDeclare Integer best\ntotal = 0\npasses = 0\nbest = 0\nFor i = 1 To 5\n    Display \"Enter a score\"\n    Input score\n    total = total + score\n    If score >= 60 Then\n        passes = passes + 1\n    End If\n    If score > best Then\n        best = score\n    End If\nEnd For\nDisplay \"Passes\"\nDisplay passes\nDisplay \"Average\"\nDisplay total / 5\nDisplay \"Best\"\nDisplay best\nStop"],
      ["e_votes", "Start\nDeclare String vote\nDeclare Integer reds\nDeclare Integer blues\nreds = 0\nblues = 0\nFor i = 1 To 5\n    Display \"red or blue?\"\n    Input vote\n    If vote = \"red\" Then\n        reds = reds + 1\n    Else\n        blues = blues + 1\n    End If\nEnd For\nDisplay \"Red\"\nDisplay reds\nDisplay \"Blue\"\nDisplay blues\nIf reds > blues Then\n    Display \"Red wins\"\nElse If blues > reds Then\n    Display \"Blue wins\"\nElse\n    Display \"A tie\"\nEnd If\nStop"],
      ["e_quiz", "Start\nDeclare Integer score\nscore = 0\nscore = score + asked(\"2 plus 2?\", 4)\nscore = score + asked(\"5 times 3?\", 15)\nscore = score + asked(\"10 minus 7?\", 3)\nDisplay \"You scored\"\nDisplay score\nStop\n\nFunction asked(question, answer)\n    Declare Integer said\n    Display question\n    Input said\n    If said = answer Then\n        Display \"Right\"\n        Return 1\n    Else\n        Display \"Wrong\"\n        Return 0\n    End If\nEnd Function"],
      ["e_login", "Start\nDeclare String word\nDeclare Integer tries\ntries = 0\nDo\n    Display \"Password?\"\n    Input word\n    tries = tries + 1\nUntil word = \"open\" Or tries = 3\nCall verdict(word)\nStop\n\nModule verdict(said)\n    If said = \"open\" Then\n        Display \"Welcome in\"\n    Else\n        Display \"Locked out\"\n    End If\nEnd Module"],
      ["e_sentinel", "Start\nDeclare Integer n\nDeclare Integer total\nDeclare Integer many\ntotal = 0\nmany = 0\nDisplay \"Numbers, please. 0 to finish.\"\nInput n\nWhile n <> 0\n    total = total + n\n    many = many + 1\n    Input n\nEnd While\nIf many > 0 Then\n    Display \"The average is\"\n    Display total / many\nElse\n    Display \"Nothing to average\"\nEnd If\nStop"],
      ["e_picktable", "Start\nDeclare Integer n\nDisplay \"Which table? 0 to stop.\"\nInput n\nWhile n > 0\n    For i = 1 To 12\n        Display n * i\n    End For\n    Display \"Which table? 0 to stop.\"\n    Input n\nEnd While\nDisplay \"Bye\"\nStop"]
    ]],
    ["eg_l5", [
      ["e_bank", "Start\nDeclare Real balance\nDeclare Integer choice\nbalance = 0\nDo\n    Display \"1 deposit  2 withdraw  3 balance  4 quit\"\n    Input choice\n    Select Case choice\n        Case 1\n            Call deposit(balance)\n        Case 2\n            Call withdraw(balance)\n        Case 3\n            Display \"Your balance is $\", balance\n        Case 4\n            Display \"Goodbye\"\n        Case Else\n            Display \"Pick 1, 2, 3 or 4\"\n    End Select\nUntil choice = 4\nStop\n\nModule deposit(Real Ref money)\n    Declare Real amount\n    Display \"How much to deposit?\"\n    Input amount\n    If amount <= 0 Then\n        Display \"A deposit has to be more than zero\"\n    Else\n        money = money + amount\n        Display \"Deposited $\", amount\n    End If\nEnd Module\n\nModule withdraw(Real Ref money)\n    Declare Real amount\n    Display \"How much to withdraw?\"\n    Input amount\n    If amount <= 0 Then\n        Display \"A withdrawal has to be more than zero\"\n    Else If amount > money Then\n        Display \"Not enough money. You have $\", money\n    Else\n        money = money - amount\n        Display \"Withdrew $\", amount\n    End If\nEnd Module"],
      ["e_gradebook", "Start\nDeclare Integer students\nDeclare Integer score\nDeclare Integer total\nDeclare Integer highest\nDeclare Integer lowest\nDeclare Integer passed\nDeclare String grade\ntotal = 0\npassed = 0\nhighest = 0\nlowest = 100\nDisplay \"How many students?\"\nInput students\nWhile students < 1\n    Display \"There has to be at least one student\"\n    Input students\nEnd While\nFor i = 1 To students\n    Display \"Score for student \", i\n    Input score\n    While score < 0 Or score > 100\n        Display \"A score is from 0 to 100. Try again\"\n        Input score\n    End While\n    grade = letterGrade(score)\n    Display \"That is a grade of \", grade\n    total = total + score\n    If grade <> \"F\" Then\n        passed = passed + 1\n    End If\n    If score > highest Then\n        highest = score\n    End If\n    If score < lowest Then\n        lowest = score\n    End If\nEnd For\nDisplay \"Class average: \", total / students\nDisplay \"Highest score: \", highest\nDisplay \"Lowest score: \", lowest\nDisplay \"Students who passed: \", passed\nStop\n\nFunction String letterGrade(Integer points)\n    If points >= 90 Then\n        Return \"A\"\n    Else If points >= 80 Then\n        Return \"B\"\n    Else If points >= 70 Then\n        Return \"C\"\n    Else If points >= 60 Then\n        Return \"D\"\n    Else\n        Return \"F\"\n    End If\nEnd Function"],
      ["e_paycheck", "Start\nConstant Real TAX_RATE = 0.15\nDeclare String name\nDeclare Real hours\nDeclare Real rate\nDeclare Real gross\nDeclare Real tax\nDeclare Integer paid\npaid = 0\nDisplay \"Employee name? Type done to finish\"\nInput name\nWhile name <> \"done\"\n    Display \"Hours worked this week?\"\n    Input hours\n    Display \"Hourly pay rate?\"\n    Input rate\n    gross = grossPay(hours, rate)\n    tax = gross * TAX_RATE\n    Display name, \" earned $\", gross\n    Display \"Taxes withheld: $\", tax\n    Display \"Take-home pay: $\", gross - tax\n    paid = paid + 1\n    Display \"Employee name? Type done to finish\"\n    Input name\nEnd While\nDisplay \"Paychecks written: \", paid\nStop\n\nFunction Real grossPay(Real worked, Real hourly)\n    Declare Real overtime\n    If worked <= 40 Then\n        Return worked * hourly\n    Else\n        overtime = worked - 40\n        Return 40 * hourly + overtime * hourly * 1.5\n    End If\nEnd Function"],
      ["e_convert", "Start\nDeclare Integer choice\nDeclare Real amount\nDo\n    Display \"1 miles to kilometers\"\n    Display \"2 pounds to kilograms\"\n    Display \"3 Fahrenheit to Celsius\"\n    Display \"4 inches to centimeters\"\n    Display \"5 quit\"\n    Input choice\n    If choice >= 1 And choice <= 4 Then\n        Display \"How many?\"\n        Input amount\n        Call convert(choice, amount)\n    Else If choice <> 5 Then\n        Display \"Pick a number from 1 to 5\"\n    End If\nUntil choice = 5\nDisplay \"Goodbye\"\nStop\n\nModule convert(Integer which, Real amount)\n    Select Case which\n        Case 1\n            Display amount, \" miles is \", amount * 1.609, \" kilometers\"\n        Case 2\n            Display amount, \" pounds is \", amount * 0.4536, \" kilograms\"\n        Case 3\n            Display amount, \" F is \", (amount - 32) * 5 / 9, \" C\"\n        Case Else\n            Display amount, \" inches is \", amount * 2.54, \" centimeters\"\n    End Select\nEnd Module"],
      ["e_splitcheck", "Start\nDeclare Real bill\nDeclare Real percent\nDeclare Integer people\nDeclare Real tip\nDisplay \"How much is the check?\"\nInput bill\nWhile bill <= 0\n    Display \"The check has to be more than zero\"\n    Input bill\nEnd While\nDisplay \"What percent tip? 15, 18 or 20 is usual\"\nInput percent\nWhile percent < 0 Or percent > 100\n    Display \"Pick a percent from 0 to 100\"\n    Input percent\nEnd While\nDisplay \"How many people are splitting it?\"\nInput people\nWhile people < 1\n    Display \"At least one person has to pay\"\n    Input people\nEnd While\ntip = bill * percent / 100\nCall receipt(bill, tip, people)\nStop\n\nModule receipt(Real food, Real extra, Integer many)\n    Declare Real total\n    total = food + extra\n    Display \"Food and drinks: $\", food\n    Display \"Tip: $\", extra\n    Display \"Total: $\", total\n    If many = 1 Then\n        Display \"You pay it all: $\", total\n    Else\n        Display \"Each of the \", many, \" people pays $\", total / many\n    End If\nEnd Module"],
      ["e_vending", "Start\nDeclare Integer price\nDeclare Integer paid\nDeclare Integer coin\nDisplay \"What does the snack cost, in cents?\"\nInput price\nWhile price <= 0 Or price mod 5 <> 0\n    Display \"Prices here go up in steps of 5 cents\"\n    Input price\nEnd While\npaid = 0\nWhile paid < price\n    Display \"Still owed: \", price - paid, \" cents. Put in 5, 10 or 25\"\n    Input coin\n    Select Case coin\n        Case 5\n            paid = paid + coin\n        Case 10\n            paid = paid + coin\n        Case 25\n            paid = paid + coin\n        Case Else\n            Display \"This machine only takes nickels, dimes and quarters\"\n    End Select\nEnd While\nDisplay \"Enjoy your snack\"\nIf paid > price Then\n    Call giveChange(paid - price)\nEnd If\nStop\n\nModule giveChange(Integer cents)\n    Display \"Your change is \", cents, \" cents\"\n    Display \"Quarters: \", cents div 25\n    cents = cents mod 25\n    Display \"Dimes: \", cents div 10\n    cents = cents mod 10\n    Display \"Nickels: \", cents div 5\nEnd Module"],
      ["e_primelist", "Start\nDeclare Integer limit\nDeclare Integer found\nDeclare Integer total\nDisplay \"Find the primes up to what number?\"\nInput limit\nWhile limit < 2\n    Display \"Pick a number that is 2 or more\"\n    Input limit\nEnd While\nfound = 0\ntotal = 0\nFor n = 2 To limit\n    If isPrime(n) Then\n        Display n\n        found = found + 1\n        total = total + n\n    End If\nEnd For\nDisplay \"Primes found: \", found\nDisplay \"They add up to \", total\nStop\n\nFunction Boolean isPrime(Integer number)\n    Declare Integer d\n    d = 2\n    While d * d <= number\n        If number mod d = 0 Then\n            Return False\n        End If\n        d = d + 1\n    End While\n    Return True\nEnd Function"],
      ["e_weekday", "Start\nDeclare Integer year\nDeclare Integer month\nDeclare Integer day\nDisplay \"Year?\"\nInput year\nDisplay \"Month, from 1 to 12?\"\nInput month\nWhile month < 1 Or month > 12\n    Display \"A month is from 1 to 12\"\n    Input month\nEnd While\nDisplay \"Day of the month?\"\nInput day\nWhile day < 1 Or day > daysIn(month, year)\n    Display \"That month has \", daysIn(month, year), \" days\"\n    Input day\nEnd While\nDisplay month, \"/\", day, \"/\", year, \" is a \", dayName(weekday(year, month, day))\nStop\n\nFunction Integer daysIn(Integer m, Integer y)\n    Select Case m\n        Case 2\n            If isLeap(y) Then\n                Return 29\n            Else\n                Return 28\n            End If\n        Case 4\n            Return 30\n        Case 6\n            Return 30\n        Case 9\n            Return 30\n        Case 11\n            Return 30\n        Case Else\n            Return 31\n    End Select\nEnd Function\n\nFunction Boolean isLeap(Integer y)\n    Return (y mod 4 = 0 And y mod 100 <> 0) Or y mod 400 = 0\nEnd Function\n\nFunction Integer weekday(Integer y, Integer m, Integer d)\n    Declare Integer k\n    Declare Integer j\n    If m < 3 Then\n        m = m + 12\n        y = y - 1\n    End If\n    k = y mod 100\n    j = y div 100\n    Return (d + 13 * (m + 1) div 5 + k + k div 4 + j div 4 + 5 * j) mod 7\nEnd Function\n\nFunction String dayName(Integer h)\n    Select Case h\n        Case 0\n            Return \"Saturday\"\n        Case 1\n            Return \"Sunday\"\n        Case 2\n            Return \"Monday\"\n        Case 3\n            Return \"Tuesday\"\n        Case 4\n            Return \"Wednesday\"\n        Case 5\n            Return \"Thursday\"\n        Case Else\n            Return \"Friday\"\n    End Select\nEnd Function"],
      ["e_loan", "Start\nDeclare Real balance\nDeclare Real rate\nDeclare Real payment\nDeclare Real interest\nDeclare Real paidInterest\nDeclare Integer months\nDisplay \"How much is the loan?\"\nInput balance\nDisplay \"Yearly interest rate, as a percent?\"\nInput rate\nDisplay \"Monthly payment?\"\nInput payment\ninterest = balance * rate / 100 / 12\nIf payment <= interest Then\n    Display \"That never pays it off. Pay more than $\", interest\nElse\n    months = 0\n    paidInterest = 0\n    While balance > 0\n        interest = balance * rate / 100 / 12\n        paidInterest = paidInterest + interest\n        balance = balance + interest - payment\n        months = months + 1\n        If months mod 12 = 0 And balance > 0 Then\n            Display \"After year \", months div 12, \" you still owe $\", balance\n        End If\n    End While\n    Display \"Paid off in \", months, \" months\"\n    Display \"The last payment is only $\", payment + balance\n    Display \"Interest paid in all: $\", paidInterest\nEnd If\nStop"],
      ["e_rps", "Start\nDeclare Integer player\nDeclare Integer computer\nDeclare Integer result\nDeclare Integer wins\nDeclare Integer losses\nwins = 0\nlosses = 0\nFor game = 1 To 5\n    Display \"Game \", game, \": 1 rock, 2 paper, 3 scissors\"\n    Input player\n    While player < 1 Or player > 3\n        Display \"Pick 1, 2 or 3\"\n        Input player\n    End While\n    computer = random(1, 3)\n    Display \"You: \", nameOf(player), \"   Computer: \", nameOf(computer)\n    result = winner(player, computer)\n    If result = 1 Then\n        Display \"You win this one\"\n        wins = wins + 1\n    Else If result = 2 Then\n        Display \"The computer wins this one\"\n        losses = losses + 1\n    Else\n        Display \"A tie\"\n    End If\nEnd For\nDisplay \"You won \", wins, \" and lost \", losses\nIf wins > losses Then\n    Display \"You beat the computer!\"\nElse If losses > wins Then\n    Display \"The computer beat you\"\nElse\n    Display \"It is a tie overall\"\nEnd If\nStop\n\nFunction String nameOf(Integer pick)\n    Select Case pick\n        Case 1\n            Return \"rock\"\n        Case 2\n            Return \"paper\"\n        Case Else\n            Return \"scissors\"\n    End Select\nEnd Function\n\nFunction Integer winner(Integer a, Integer b)\n    If a = b Then\n        Return 0\n    Else If (a - b + 3) mod 3 = 1 Then\n        Return 1\n    Else\n        Return 2\n    End If\nEnd Function"]
    ]]
  ];

  // ---------------------------------------------------- what it is called --
  // A new program in the box names itself in the Title box, so a chart is
  // headed with what it is without anybody stopping to type it.  An example
  // is called what its button says; a puzzle is only numbered, for the
  // reason the puzzles give (its name is most of the answer); and anything
  // else is called by the comment it opens with, or failing that by what
  // it does (see 09-names.js), or failing even that by the first thing it
  // says.  A title somebody typed is theirs and is never written over: only
  // an empty one, or one put there by this, is.
  //
  // Where the name came from is kept, not the name, so it is said in the
  // language of the page at each drawing -- and so an example with a line
  // or two changed is still that example.  Pasting or dropping a program
  // in, emptying the box, or opening a file lets it go.  A name read off
  // the words is not kept at all: it is read again at every drawing, so a
  // program that grows into something else is called what it has become.
  var titleFrom = null;                 // { key } / { puzzle } / { text }
  var titlePut = "";                    // what was last written into the box

  function titleOfFrom(from) {
    if (from.key) { return TXT[from.key] || from.key; }
    if (from.puzzle) { return say("pz_one", { n: from.puzzle }); }
    return from.text || "";
  }

  // The words themselves, when nothing says where they came from.
  function titleFromWords(code) {
    var eg = null;
    STARTS.forEach(function (level) {
      level[1].forEach(function (pair) { if (pair[1] === code) { eg = pair[0]; } });
    });
    if (eg) { return { key: eg }; }
    if (typeof PUZZLES !== "undefined") {
      var pz = null;
      PUZZLES.forEach(function (level) {
        level[1].forEach(function (one) { if (one.start === code) { pz = one.no; } });
      });
      if (pz) { return { puzzle: pz }; }
    }
    // Only the top of it is read: a chart of a hundred thousand lines is
    // named by its first few, like any other.
    var lines = code.slice(0, 4000).split("\n");
    var said = "";
    for (var i = 0; i < lines.length && i < 60; i++) {
      var line = lines[i].trim();
      var note = /^(?:\/\/+|\/\*+)\s*(.*?)\s*(?:\*+\/)?$/.exec(line);
      if (note) {
        if (note[1] && !said) { return { text: shortTitle(note[1]), guess: true }; }
        continue;
      }
      if (!said) {
        var put = /^(?:display|print|output|write)\b\s*(["'])(.*?)\1/i.exec(line);
        if (put && put[2].trim()) { said = put[2]; }
      }
    }
    var does = describeProgram(code);
    if (does) { return { text: does, guess: true }; }
    return said ? { text: shortTitle(said.replace(/[\s.:,;!?-]+$/, "")), guess: true } : null;
  }

  function shortTitle(s) {
    s = String(s).replace(/\s+/g, " ").trim();
    return s.length > 48 ? s.slice(0, 46).trim() + "…" : s;
  }

  // Anything but what this put there is somebody's own -- an empty box
  // they emptied included -- and stays until the program itself changes.
  function titleOwned() {
    var box = el("#f-title");
    return !box || box.value.trim() !== titlePut.trim();
  }

  // Just before a drawing: the name, if the box is free to take one.
  function fillTitle(code) {
    if (titleOwned()) { return; }
    if (!code.trim()) { titleFrom = null; }
    var from = titleFrom || (code.trim() ? titleFromWords(code) : null);
    titleFrom = from && !from.guess ? from : null;
    el("#f-title").value = titlePut = from ? titleOfFrom(from) : "";
  }

  // Told where a name comes from: an example, a puzzle, a file.  That is a
  // new program, and the title of the one before goes with it.
  function titleComesFrom(from) {
    titleFrom = from;
    if (el("#f-title")) { el("#f-title").value = titlePut = titleOfFrom(from); }
  }

  // Or that the box holds another program altogether now, name unknown.
  function newProgram() {
    titleFrom = null;
    if (el("#f-title")) { titlePut = el("#f-title").value; }
  }

  // A title put back from a save is the one it had, whoever gave it.
  function titleKept() { titleFrom = null; titlePut = ""; }

  // Typing into a program leaves its name alone; pasting or dropping in
  // most of what is in the box now is a program of its own.
  if (el("#code")) {
    var codeWas = 0;
    el("#code").addEventListener("beforeinput", function () {
      var c = el("#code");
      codeWas = c.value.length - Math.abs(c.selectionEnd - c.selectionStart);
    });
    el("#code").addEventListener("input", function (ev) {
      var now = el("#code").value;
      var pasted = /^insertFrom(Paste|Drop)/.test(ev.inputType || "") &&
                   now.length - codeWas >= now.length * 0.6;
      if (!now.trim() || pasted) { newProgram(); }
    });
  }

  // Put one in the box and draw it.
  function startFrom(code, name) {
    el("#code").value = code;
    if (name) { titleComesFrom({ key: name }); }
    showStarts();
    showExamples(false);
    el("#build").click();
  }

  function startButton(name, code, i) {
    var b = document.createElement("button");
    b.className = "btn small";
    b.textContent = TXT[name] || name;
    b.style.setProperty("--i", i);       // so they arrive one after another
    b.onclick = function () { startFrom(code, name); };
    return b;
  }

  // One line, not a block.  It began as a label and a row of four buttons
  // -- three programs and a way to the rest -- which is fifty-odd pixels
  // of the panel given over to something you need once and then never
  // again, sitting directly under the box you are trying to write in.
  // A sentence with a way in at the end of it says the same thing in a
  // fifth of the room, and every one of the fifty is behind it now
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
  var OPTIONS = ["o-tint", "o-everyout", "o-roomy", "o-tight", "o-chains",
                 "o-columns", "o-steady"];

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
      tight: optionOn("o-tight"),
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
  // Roomier and compressed are the two ends of one thing, so turning one
  // on turns the other off, rather than leaving both ticked and one of
  // them quietly doing nothing.
  [["o-roomy", "o-tight"], ["o-tight", "o-roomy"]].forEach(function (pair) {
    var box = el("#" + pair[0]), other = el("#" + pair[1]);
    if (!box || !other) { return; }
    box.onchange = function () {
      if (box.checked) { other.checked = false; }
      optionChanged();
    };
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
  // The words the chart on the paper was last drawn from, so a check can
  // tell whether what is in the box has moved on since.
  var builtText = null;
  // The drawing goes onto the paper here and nowhere else.  Drawn `again`
  // (see drawItNow) it is the same chart with its shapes moved over a
  // little to make room, and 26-motion.js wraps this to carry each of them
  // from where it was to where it now goes, rather than have the whole
  // chart jump.
  function putSheet(svg, again) {
    el("#sheet").innerHTML = svg;
    // In the palette from its first frame, before bind() or anything else
    // measures it (see freshCoat).  bind() takes it up again after this.
    chart = el("#sheet svg");
    if (chart) { chart.id = "chart"; freshCoat(); }
  }
  // Drawing a new chart throws away the program that is on the paper, and a
  // run is a walk through that program.  Carrying on regardless left the
  // runner stepping through a chart nobody could see any more and printing
  // into the tape of a program that had been replaced -- so if something is
  // running when the button is pressed, it asks first.  See stopThenBuild.
  //
  // Asked `again`, it is the same program drawn again because its words have
  // changed size (see reflowSoon): shaken the same way as last time, so it
  // comes out the same chart with room made for the words rather than a new
  // drawing of it, and left where it was -- nothing rises in, the view does
  // not move, the tape keeps what the run printed, and the shape that was
  // picked is still picked.
  function drawItNow(again) {
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
      var asked = el("#code").value;
      if (!again) { fillTitle(asked); }
      barBegin(asked);                   // a bar, if it turns out to be a long one
      return askFor(Object.assign(chartOptions(), {
        text: asked,
        title: el("#f-title").value,
        author: el("#f-author").value,
        shape: el("#f-shape").value,
        seed: again ? lastLaid.seed : "",   // fresh each time, unless drawn again
        lang: tongue ? tongue.value : "",
        legend: el("#f-legend").checked,
        grid: el("#f-grid").checked,
        shapes: geom,
        letters: lettersAsked()
      })).then(function (data) {
        afterTheRed(function () {
          build.disabled = false;
          build.classList.remove("working");
          if (!data.ok) { return; }
          build.classList.add("done");
          setTimeout(function () { build.classList.remove("done"); }, 1300);
        });
        if (!data.ok) {
          barEnd(false);
          says.className = "bad";
          says.textContent = data.error === "MemoryError"
            ? say("py_gave_out", { err: data.error }) : data.error || TXT.failed;
          showProblems(null);
          return;
        }
        var keepSel = again && sel ? sel.dataset.i : null;
        putSheet(data.svg, again);
        // On a narrow screen the panel is lying over the chart, so it is put
        // away: you pressed the button to see a chart, not to keep looking at
        // the button.  On a wide screen it stays where it is.
        if (!again && panelIsOver()) { showPanel(false); }
        // A new chart opens at actual size, 100%, whatever the last one was
        // left at, and showTheStart below puts its Start in view.  It used
        // to be shrunk to fit whenever it was wider or taller than the stage
        // -- and otherwise kept the zoom of the chart before it -- so the
        // same program opened at 40% one time and 100% the next, and the
        // shrinking came after the Start had been found, leaving the view
        // wherever that put it.  Fit is still a press away for the whole.
        if (!again) { glideStop(); zoom = 1; }   // bind() shows it at that
        FILE = data.name || FILE;
        el("#svg-link").download = FILE + ".svg";
        document.title = data.title || FILE;
        el(".brand").firstChild.textContent = data.title || FILE;
        el("#sub").textContent = TXT.flowchart + " · " + data.w + " x " +
                                 data.h + " px";
        AST = data.ast || null;
        builtText = asked;
        dressRunner();                   // there is something to run now
        forgetLines();
        if (AST) {
          noteLines(AST.main);
          (AST.modules || []).forEach(function (mod) { noteLines(mod.body); });
        }
        lastLaid = { seed: String(data.seed || ""), text: asked };
        if (!again) { freshTape(); }   // a new program: nothing of the old one
        if (again) { opening = true; } // the same chart, not a new one rising
        bind();
        if (keepSel) {
          sel = el('.node[data-i="' + keepSel + '"]', chart);
          if (sel) { sel.classList.add("on"); }
          drawSelection();
        }
        paint();
        if (!again) { showTheStart(); }  // wherever this one came out, begin at it
        // Nothing is said when it works.  The button goes green and the chart
        // appears, which is two ways of saying it already; a line of text
        // underneath saying it a third time is just something else to read.
        // What goes wrong is still said, because nothing else says that.
        says.textContent = "";
        showProblems(data.problems);
        barEnd(true);
      }).catch(function (err) {
        barEnd(false);
        afterTheRed(function () {
          build.disabled = false;
          build.classList.remove("working");
        });
        says.className = "bad";
        says.textContent = err && err.plain ? err.message
          : say("not_answering", { err: (err && err.message) || err });
      });
  }
  if (build) {
    build.onclick = function () { stopThenBuild(drawItNow); };
  }

  // ---------------------------------------------- room for the words again --
  // Words set bigger, or bold, or in a wider typeface want bigger boxes, and
  // only the drawing can say how much bigger: it is the same arithmetic that
  // sized them the first time.  So the chart is drawn again, a moment after
  // the last press -- five presses of Bigger are one drawing, not five --
  // from the same program and shaken the same way (see drawItNow).  Until it
  // arrives the words are already showing at their new size, spilling out
  // of the old boxes for as long as it takes.
  //
  // Not over a run: that is somebody's work, and it waits until the run is
  // done.  Not over a drawing either, which it waits behind.  And not when
  // what is in the box is no longer the program on the paper: then there is
  // no "same chart" to draw, and it is drawn the ordinary way, as a new one.
  var lastLaid = { seed: "", text: null };   // what the paper was drawn from
  var reflowTimer = 0;
  function reflowSoon() {
    if (!CAN_REFLOW || byHand || !build) { return; }
    clearTimeout(reflowTimer);
    reflowTimer = setTimeout(function whenFree() {
      if (byHand || !AST || !el("#code").value.trim()) { return; }
      if (running || build.disabled) {
        reflowTimer = setTimeout(whenFree, 400);
        return;
      }
      drawItNow(el("#code").value === lastLaid.text);
    }, 300);
  }

  // What the drawing is told about the words: the whole chart's size and
  // whether it is bold, the typeface's widths when it is not the one the
  // drawing knows, and every step whose words have been set apart from the
  // rest -- by the number the drawing gave it, which is how the page and the
  // drawing agree about which shape is which.  A shape placed by hand is
  // numbered h1, h2 and so on, and is none of the drawing's business.
  // Sizes go as the pixels the drawing sets its words in, not as points:
  // the drawing knows nothing of points, only that its plain words are
  // CODE_TYPE pixels, which is what 12 points means here.
  function lettersAsked() {
    var L = lettersOf();
    var asked = { size: CODE_TYPE * chartPt() / PLAIN_PT, bold: !!L.bold, own: {} };
    if (L.face && L.face !== "sans" && FACES[L.face]) {
      asked.widths = faceWidths(L.face);
    }
    Object.keys(style.nodes).forEach(function (i) {
      var mine = style.nodes[i];
      if (!/^\d+$/.test(i) || !mine) { return; }
      if (!mine.pt && mine.bold === undefined) { return; }
      asked.own[i] = { size: CODE_TYPE * shapePt(i) / PLAIN_PT,
                       bold: mine.bold !== undefined ? !!mine.bold : !!L.bold };
    });
    return asked;
  }

  // A typeface's widths, measured here, because this is the only place that
  // knows which font the computer really has: the first of the list it has
  // is the one the words will be drawn in.  The drawing carries Arial's
  // widths and measures everything against them; handed these, it measures
  // against the face the words will actually be shown in.  Thousandths of
  // an em, the way the drawing keeps Arial's -- measured at a hundred pixels
  // so that the rounding is well below anything a box would notice.
  var widthsOf = {};
  function faceWidths(face) {
    if (widthsOf[face]) { return widthsOf[face]; }
    var pen = document.createElement("canvas").getContext("2d");
    var got = { n: [], b: [] };
    [["n", ""], ["b", "bold "]].forEach(function (how) {
      pen.font = how[1] + "100px " + FACES[face];
      for (var c = 32; c < 127; c++) {
        got[how[0]].push(Math.round(pen.measureText(String.fromCharCode(c)).width * 10));
      }
    });
    widthsOf[face] = got;
    return got;
  }


