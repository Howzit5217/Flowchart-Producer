// ---------------------------------------------------------------------------
//  40-reopen.js -- coming back: the page up first and the work put back on
//  it after, as it was left -- its view, the 3D view open on it -- and
//  sooner, what was worked out the last time kept rather than worked out
//  again
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "when there are big programs there and the tab
  // gets closed and you try to go back on to the site it takes forever to
  // load in rather loading in then loading back in the program ... make
  // sure it loads back in the same as it was before and to improve those
  // loading times")
  //
  // It was all done before the page was first painted: a design of a few
  // thousand pieces had its arrows routed and its check written out with
  // nothing on the screen -- and then, the page never having said it came
  // up whole (99-go.js returned before saying so), the guard in the head
  // (studio.html) took it for a page read half-written and loaded it all
  // over again.  Now the page says so first, is painted, says it is
  // putting the work back, and puts it back; the check written out once the
  // drawing is showing; the arrows as they were routed, and a long
  // program's chart as Python drew it, kept from the last time.
  var RO_VIEW = "flowchart-view";          // where the paper was looked at, and the 3D view (each going)
  var RO_ROUTES = "flowchart-hand-routes"; // the arrows of a drawing by hand, as routed (each going)
  var RO_DB = "flowchart-drawn";           // a long program's chart, as drawn: the last one
  var RO_TEXT = 50000;                     // characters: a program shorter than this is drawn again
  var RO_SLOW = 1200;                      // ms: a drawing quicker than this is not worth keeping
  var RO_MOST = 120000000;                 // characters of chart: past this, not kept
  var roComing = false, roReportOwed = false, roViewOwed = null;

  // ---- the page first, then the work ---------------------------------------
  // Whether there is work to put back: a reload's own place, a link with
  // a program in it, a drawing by hand left open.
  function roWorkWaiting() {
    try {
      if (sessionStorage.getItem(RELOAD_KEY)) { return true; }
      if (location.hash && location.hash.length > 3) { return true; }
      if (localStorage.getItem("flowchart-mode") === "hand") {
        var kept = localStorage.getItem("flowchart-hand");
        if (kept && kept.length > 60) { return true; }
      }
    } catch (e) { /* nothing kept */ }
    return false;
  }
  // After the page has been painted -- the frame drawn, then the next turn
  // -- or, a tab out of sight painting nothing, a moment later anyway.
  function roAfterPaint(go) {
    var done = false;
    function once() { if (!done) { done = true; go(); } }
    try { requestAnimationFrame(function () { setTimeout(once, 0); }); } catch (e) { /* no frames */ }
    setTimeout(once, 250);
  }
  // Said over the paper while it waits: the bar the drawings have, with a
  // light running along it -- moved, not painted, so it goes on moving
  // while the page is busy putting the work back.
  function roCoverShow() {
    var stage = el("#stage");
    if (!stage || !stage.parentNode || el("#ro-back")) { return; }
    var box = document.createElement("div");
    box.id = "ro-back";
    box.setAttribute("role", "status");
    box.innerHTML = '<div class="bb-top"><span class="bb-said"></span></div><div class="bb-track"><div class="ro-run"></div></div>';
    el(".bb-said", box).textContent = TXT.ro_coming || "";
    stage.parentNode.appendChild(box);
  }
  function roCoverHide() {
    var box = el("#ro-back");
    if (box) { box.remove(); }
  }
  // 99-go.js hands over the putting back.
  function roComeBack(go) {
    var kept = roKeptView();
    if (!roWorkWaiting()) {
      go();
      roAfterBack(kept);
      return;
    }
    roCoverShow();
    roAfterPaint(function () {
      roComing = true;
      try { go(); }
      finally {
        roComing = false;
        roCoverHide();
        // (a drawing on its way: its own bar at once, where the cover was -- 09-build.js)
        if (typeof drawWait !== "undefined" && drawWait && !drawWait.box && typeof barShow === "function") {
          clearTimeout(drawWait.show);
          try { barShow(); } catch (e) { /* in its own time, then */ }
        }
      }
      // the drawing showing, then what is said about it
      roAfterPaint(function () {
        if (roReportOwed) { roReportOwed = false; try { showReport(); } catch (e) { /* as it was */ } }
        roAfterBack(kept);
      });
    });
  }
  // The check, while the work is coming back: written out once it is there.
  if (typeof showReport === "function") {
    var showReportReopen = showReport;
    showReport = function () {
      if (roComing) { roReportOwed = true; return; }
      return showReportReopen.apply(this, arguments);
    };
  }

  // ---- as it was left: the view, and the 3D view --------------------------
  // What the paper holds, in brief, so a view is put back only on the work
  // it was taken of.
  function roSign() {
    if (byHand) {
      if (!hand || !hand.nodes || !hand.nodes.length) { return ""; }
      return "h" + (typeof smoothHash === "function" ? smoothHash(hand) : hand.nodes.length + "|" + hand.links.length) + "|" + (hand.making || "");
    }
    return typeof builtText === "string" && builtText ? "c" + textKey(builtText) : "";
  }
  function roKeptView() {
    try { var v = JSON.parse(localStorage.getItem(RO_VIEW)); return v && v.sign ? v : null; } catch (e) { return null; }
  }
  function roKeepView() {
    var sign = roSign();
    if (!sign) { return; }
    var v = typeof viewNow === "function" ? viewNow() : null, out = { sign: sign, at: Date.now() };
    if (v) { out.zoom = v.zoom; out.x = v.x; out.y = v.y; }
    if (typeof V3 !== "undefined" && V3 && V3.box && !V3.leaving && V3.scene !== "space") {
      var goal = function (k) { return typeof v3Goal === "function" ? v3Goal(k) : V3[k]; };
      out.v3 = { yaw: goal("yaw"), pitch: goal("pitch"), scale: goal("scale"), panX: goal("panX"), panY: goal("panY") };
    }
    localStorage.setItem(RO_VIEW, JSON.stringify(out));
  }
  function roWearView(v) {
    if (!v || !isFinite(v.zoom) || !isFinite(v.x) || !isFinite(v.y) || typeof chart === "undefined" || !chart) { return; }
    if (typeof glideStop === "function") { glideStop(); }
    zoom = Math.max(0.1, Math.min(8, v.zoom));
    show();
    centerOn(v.x, v.y);
    // Measured off the paper as it stands, which is still coming in (its
    // entrance, 26-motion.js): stood there again once it has, unless it
    // has been moved about since.
    var stage = el("#stage"), mine = chart;
    if (!stage) { return; }
    var left = function () { return stage.scrollLeft + "," + stage.scrollTop + "," + zoom + "," + (loose ? holdX + ":" + holdY : ""); }, was = left();
    var again = function () {
      if (chart !== mine || left() !== was || typeof V3 !== "undefined" && V3) { return; }
      centerOn(v.x, v.y);
      was = left();
    };
    var moving = [];
    try { moving = chart.getAnimations ? chart.getAnimations({ subtree: true }) : []; } catch (e) { moving = []; }
    Promise.race([Promise.all(moving.map(function (a) { return a.finished.catch(function () {}); })),
                  new Promise(function (go) { setTimeout(go, 3000); })]).then(function () { setTimeout(again, 30); });
    setTimeout(again, 700);
  }
  function roWear3d(c) {
    if (!c || !byHand || typeof v3Open !== "function" || (typeof V3 !== "undefined" && V3)) { return; }
    v3Open();
    if (typeof V3 === "undefined" || !V3) { return; }
    if (typeof v3Hold === "function") { v3Hold(); }
    ["yaw", "pitch", "scale", "panX", "panY"].forEach(function (k) { if (isFinite(c[k])) { V3[k] = c[k]; } });
    V3.dirty = true;
  }
  // Once the work is back: where it was looked at, and the 3D view if it
  // was open.  A program's chart is drawn in the background -- seconds --
  // so its view waits for the drawing (builtNow, below).
  function roAfterBack(kept) {
    if (!kept) { return; }
    var sign = roSign();
    if (sign && sign === kept.sign) {
      try { roWearView(kept); } catch (e) { /* where it came out */ }
      if (kept.v3) { roAfterPaint(function () { try { roWear3d(kept.v3); } catch (e) { /* the paper, then */ } }); }
      return;
    }
    if (!byHand && kept.sign.charAt(0) === "c") { roViewOwed = kept; }
  }
  if (typeof builtNow === "function") {
    var builtNowReopen = builtNow;
    builtNow = function () {
      var out = builtNowReopen.apply(this, arguments);
      var kept = roViewOwed;
      roViewOwed = null;
      try { if (kept && !byHand && roSign() === kept.sign) { roWearView(kept); } } catch (e) { /* at its Start */ }
      return out;
    };
  }

  // ---- the arrows, as they were routed --------------------------------------
  // Routing every arrow round a few thousand pieces is the longest part of
  // drawing them (10-hand.js), and the same drawing routes the same way:
  // the routes kept as it goes, under a name for the drawing they belong
  // to, and taken up the first time it is drawn again.
  var roRoutesKept;                        // undefined: not read yet; null: none, or used
  var roRoutesWritten = "";
  function roKeepRoutes() {
    var last = routedLast;
    if (!byHand || !last || !last.routes || typeof last.key !== "string") { return; }
    var name = textKey(last.key);
    if (name === roRoutesWritten) { return; }
    var text = JSON.stringify({ name: name, routes: last.routes });
    if (text.length > 3000000) { localStorage.removeItem(RO_ROUTES); return; }
    try { localStorage.setItem(RO_ROUTES, text); roRoutesWritten = name; }
    catch (e) { try { localStorage.removeItem(RO_ROUTES); } catch (e2) { /* fine */ } }
  }
  if (typeof routeAll === "function") {
    var routeAllReopen = routeAll;
    routeAll = function () {
      if (roRoutesKept === undefined) {
        roRoutesKept = null;
        try { roRoutesKept = JSON.parse(localStorage.getItem(RO_ROUTES)); } catch (e) { roRoutesKept = null; }
      }
      // (taken up by the first drawing with arrows: the empty paper the page opens on has none)
      if (roRoutesKept && hand && hand.links && hand.links.length) {
        var kept = roRoutesKept;
        roRoutesKept = null;
        try {
          var key = JSON.stringify(hand) + "|" + JSON.stringify(style);
          if (kept.name === textKey(key) && Array.isArray(kept.routes)) {
            routedLast = { key: key, routes: kept.routes, signs: routeSigns(),
                           ends: JSON.stringify(hand.links) + "|" + JSON.stringify(style) };
            roRoutesWritten = kept.name;
          }
        } catch (e) { /* routed afresh */ }
      }
      return routeAllReopen.apply(this, arguments);
    };
  }

  // ---- a long program's chart, as drawn ------------------------------------
  // Putting a long program back drew it again: Python started, the program
  // read, laid out and drawn -- for one of tens of thousands of lines, the
  // better part of a minute -- to arrive at the chart that was on the paper
  // when the page went.  Drawn again from the same words, settings and seed
  // it comes out the same, so the last long one is kept as it came, and
  // asked for again exactly, it is handed back from there.  A chart asked
  // for afresh (no seed) is always drawn: it is meant to come out new.
  var roDbNow = null, roDbAsked = null;
  function roDb() {
    if (!roDbAsked) {
      roDbAsked = new Promise(function (done) {
        var req;
        try { req = indexedDB.open(RO_DB, 1); } catch (e) { done(null); return; }
        req.onupgradeneeded = function () {
          if (!req.result.objectStoreNames.contains("drawn")) { req.result.createObjectStore("drawn"); }
        };
        req.onsuccess = function () { roDbNow = req.result; done(req.result); };
        req.onerror = req.onblocked = function () { done(null); };
      });
    }
    return roDbAsked;
  }
  // A name for one ask: everything in it, in one order, and its seed.
  function roAskName(asked, seed) {
    var flat = {};
    Object.keys(asked).sort().forEach(function (k) { if (k !== "seed") { flat[k] = asked[k]; } });
    flat.seed = String(seed || "");
    return textKey(JSON.stringify(flat));
  }
  function roLong(asked) { return !!asked && typeof asked.text === "string" && asked.text.length >= RO_TEXT && "letters" in asked; }
  // The one kept: its name read first (small), the chart only if it is the one.
  function roDrawnFor(name) {
    return roDb().then(function (db) {
      if (!db) { return null; }
      return new Promise(function (done) {
        var tx, st, k;
        try { tx = db.transaction(["drawn"], "readonly"); st = tx.objectStore("drawn"); k = st.get("name"); }
        catch (e) { done(null); return; }
        k.onsuccess = function () {
          if (!k.result || k.result.name !== name) { done(null); return; }
          var d = st.get("chart");
          d.onsuccess = function () { done(d.result && d.result.ok ? d.result : null); };
          d.onerror = function () { done(null); };
        };
        k.onerror = function () { done(null); };
      });
    }).catch(function () { return null; });
  }
  // Kept as it came, before anything on the page has had it (the database
  // copies it there and then), in place of the one before.
  function roKeepDrawn(asked, data) {
    var seed = String(asked.seed || data.seed || "");
    if (!seed || !roDbNow || (typeof data.svg === "string" && data.svg.length > RO_MOST)) { return; }
    var tx = roDbNow.transaction(["drawn"], "readwrite"), st = tx.objectStore("drawn");
    st.put(data, "chart");
    st.put({ name: roAskName(asked, seed), at: Date.now() }, "name");
  }
  if (typeof askForPlain === "function") {
    var askForPlainReopen = askForPlain;
    askForPlain = function (asked) {
      var self = this, args = arguments;
      if (!roLong(asked)) { return askForPlainReopen.apply(self, args); }
      roDb();
      function fresh() {
        var t0 = performance.now();
        return Promise.resolve(askForPlainReopen.apply(self, args)).then(function (data) {
          try { if (data && data.ok && performance.now() - t0 >= RO_SLOW) { roKeepDrawn(asked, data); } } catch (e) { /* not kept */ }
          return data;
        });
      }
      if (!asked.seed) { return fresh(); }
      return roDrawnFor(roAskName(asked, asked.seed)).then(function (data) { return data || fresh(); }, fresh);
    };
  }

  // ---- going -----------------------------------------------------------------
  function roGoing() {
    if (typeof wipedOut !== "undefined" && wipedOut) { return; }
    try { roKeepView(); } catch (e) { /* not kept */ }
    try { roKeepRoutes(); } catch (e) { /* routed again */ }
  }
  window.addEventListener("pagehide", roGoing);
  document.addEventListener("visibilitychange", function () { if (document.hidden) { roGoing(); } });
  // All cleared (35-wipe.js): these go with the work.
  if (typeof wipeAll === "function") {
    var wipeAllReopen = wipeAll;
    wipeAll = function () {
      try { localStorage.removeItem(RO_VIEW); localStorage.removeItem(RO_ROUTES); } catch (e) { /* none kept */ }
      try { if (roDbNow) { roDbNow.close(); } indexedDB.deleteDatabase(RO_DB); } catch (e) { /* none kept */ }
      return wipeAllReopen.apply(this, arguments);
    };
  }
