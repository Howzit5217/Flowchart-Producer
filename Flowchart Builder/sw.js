// ---------------------------------------------------------------------------
//  sw.js -- the website, kept on the phone or computer that opened it
//
//  What lets the website be installed as an app and still open, and still
//  draw, with no connection at all.  studio/site.py fills in the marks and
//  writes it out beside index.html; this copy under ui/app/ is the one to
//  edit.
// ---------------------------------------------------------------------------
"use strict";

// Two stores, because they change at very different rates.  Ours -- the
// page, our Python, the icons -- changes whenever the site is put up again.
// Python itself is ten megabytes that only change when PYODIDE points at a
// new version, and is kept across every other change so nobody fetches it
// twice.  The names are what tell an old store from the current one.
var OURS = "flowchart-builder-site-e035e90b89";
var PYTHON = "flowchart-builder-python-0.27.7";
var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
var HOME = [
  "./",
  "manifest.webmanifest",
  "flowchart/ui/app/icon-192.png",
  "flowchart/ui/app/icon-512.png",
  "flowchart/ui/app/icon-maskable-512.png",
  "flowchart/ui/app/apple-touch-icon.png",
  "flowchart/__init__.py",
  "flowchart/draw/__init__.py",
  "flowchart/draw/arrows.py",
  "flowchart/draw/grid.py",
  "flowchart/draw/outlines.py",
  "flowchart/draw/svg.py",
  "flowchart/layout/__init__.py",
  "flowchart/layout/blocks.py",
  "flowchart/layout/branches.py",
  "flowchart/layout/cases.py",
  "flowchart/layout/columns.py",
  "flowchart/layout/loops.py",
  "flowchart/make/__init__.py",
  "flowchart/make/chart.py",
  "flowchart/make/fit.py",
  "flowchart/make/legend.py",
  "flowchart/make/shake.py",
  "flowchart/measure.py",
  "flowchart/parse/__init__.py",
  "flowchart/parse/clean.py",
  "flowchart/parse/data.py",
  "flowchart/parse/keywords.py",
  "flowchart/parse/nodes.py",
  "flowchart/parse/read.py",
  "flowchart/parse/statements.py",
  "flowchart/parse/trouble.py",
  "flowchart/progress.py",
  "flowchart/settings.py",
  "flowchart/shapes.py",
  "flowchart/studio/__init__.py",
  "flowchart/studio/drawing.py",
  "flowchart/words/__init__.py",
  "flowchart/words/de.py",
  "flowchart/words/en.py",
  "flowchart/words/es.py",
  "flowchart/words/fr.py",
  "flowchart/words/lookup.py"
];                     // our files, beside this one
var PY_PARTS = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm",
                "python_stdlib.zip", "pyodide-lock.json"];
// How long to wait on the network for the page before opening the copy
// kept here.  A phone on one bar of signal will get there in the end, and
// the copy it fetches is kept for next time, but it should not sit on a
// white screen while it does.
var WAIT = 4000;

// Everything, at once, the first time.  The page starts Python the moment
// it opens, so most of this is already in the browser's own cache and
// comes from there.  Our files are asked for afresh rather than taken from
// that cache, which may be holding the version before last.
self.addEventListener("install", function (ev) {
  ev.waitUntil(Promise.all([
    caches.open(OURS).then(function (box) {
      return box.addAll(HOME.map(function (path) {
        return new Request(path, { cache: "reload" });
      }));
    }),
    caches.open(PYTHON).then(function (box) {
      return Promise.all(PY_PARTS.map(function (part) {
        var url = PYODIDE + part;
        return box.match(url, { ignoreVary: true }).then(function (had) {
          return had || fetch(url, { mode: "cors", credentials: "omit" })
            .then(function (got) {
              if (!got.ok) { throw new Error(url + " (" + got.status + ")"); }
              return box.put(url, got);
            });
        });
      }));
    })
  ]).then(function () { return self.skipWaiting(); }));
});

// The stores a new version no longer uses go, and this one takes over the
// page that is open now rather than waiting for it to be opened again.
self.addEventListener("activate", function (ev) {
  ev.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.filter(function (name) {
      return name.indexOf("flowchart-builder-") === 0 &&
             name !== OURS && name !== PYTHON;
    }).map(function (name) { return caches.delete(name); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (ev) {
  var ask = ev.request;
  if (ask.method !== "GET") { return; }
  if (ask.url.indexOf(PYODIDE) === 0) { ev.respondWith(pythonPart(ask)); return; }
  if (ask.url.indexOf(self.registration.scope) !== 0) { return; }   // not ours
  ev.respondWith(freshest(ask));
});

// Where a file is kept.  The page is one page however it was reached --
// with a program in its link, or as index.html by name -- so every way of
// opening it shares the one copy.
function keyFor(ask) {
  var url = new URL(ask.url);
  url.hash = "";
  if (ask.mode === "navigate") {
    url.search = "";
    url.pathname = url.pathname.replace(/\/index\.html$/, "/");
  }
  return url.href;
}

// Ours: the network first, and the copy kept here when there is no
// network or it is too slow.  The other way round -- the copy first, the
// network behind it -- opens a little sooner but opens the version before
// last every time the site changes, and the page and its Python have to
// be the same version: new buttons over an old drawing was a bug here
// once already (see the fetches in 09-build.js).
function freshest(ask) {
  var key = keyFor(ask);
  return caches.open(OURS).then(function (box) {
    return new Promise(function (answer, fail) {
      var done = false;
      function give(res) {
        if (!done && res) { done = true; answer(res); }
      }
      function kept() { return box.match(key, { ignoreVary: true }); }
      fetch(ask).then(function (got) {
        if (got.ok && got.type === "basic") {
          box.put(key, got.clone()).catch(function () { /* full: next time */ });
        }
        give(got);
      }, function (err) {
        kept().then(function (had) {
          if (had) { give(had); }
          else if (!done) { done = true; fail(err); }
        });
      });
      setTimeout(function () { kept().then(give); }, WAIT);
    });
  });
}

// Python: the copy kept here, always.  Its address has the version in it,
// so what is kept under that address can never be out of date.  Fetched
// the open way (cors) rather than the way a script tag asks, because what
// comes back the closed way is a sealed box the browser counts as several
// megabytes whatever is in it.
function pythonPart(ask) {
  return caches.open(PYTHON).then(function (box) {
    return box.match(ask.url, { ignoreVary: true }).then(function (had) {
      if (had) { return had; }
      return fetch(ask.url, { mode: "cors", credentials: "omit" }).then(function (got) {
        if (got.ok) {
          box.put(ask.url, got.clone()).catch(function () { /* full */ });
        }
        return got;
      }, function () { return fetch(ask); });
    });
  });
}
