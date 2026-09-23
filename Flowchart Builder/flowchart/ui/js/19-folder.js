// ---------------------------------------------------------------------------
//  19-folder.js -- saving into a folder you picked, not the downloads
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ---------------------------------------------- where saves go --
  // Everything this page saves -- the chart as an SVG or a PNG, the work
  // as a file, the code, the pseudocode -- used to go wherever the browser
  // puts downloads, mixed in with everything else anybody ever downloaded,
  // and a class that saves twenty charts in a lesson spends the end of it
  // fishing them back out.  Files > Where saves go picks a folder instead
  // (or makes one: the window that opens has a New folder button), and from
  // then on save() in 08-save.js writes straight into it.
  //
  // Only Chrome and Edge on a computer can do this -- the others have no
  // way for a page to be handed a folder -- so everywhere else the menu
  // says so and saves go to the downloads as they always did.
  //
  // The folder is remembered from one visit to the next.  What is not is
  // leave to write in it: the browser asks again, once a visit, the first
  // time something is saved.  A file already there is never written over;
  // the new one is numbered beside it, the way the downloads number theirs.
  var CAN_FOLDER = typeof window.showDirectoryPicker === "function";
  var saveDir = null;                    // the folder picked, if one was
  var savedTimer = 0;

  // The folder is kept in the browser's database rather than with the
  // other settings: it is a handle the browser gave us, not something that
  // can be written down as words, and the database is the one place that
  // can hold one.  Given `put`, keeps it (or, given null, forgets it);
  // without, reads back what was kept.  Anything going wrong is taken as
  // there being no folder, which is where things stood before.
  function keptFolder(put) {
    return new Promise(function (done) {
      var ask;
      try { ask = indexedDB.open("flowchart-folder", 1); }
      catch (e) { done(null); return; }
      ask.onupgradeneeded = function () { ask.result.createObjectStore("kept"); };
      ask.onerror = function () { done(null); };
      ask.onsuccess = function () {
        var db = ask.result, job;
        try {
          var shelf = db.transaction("kept", put === undefined ? "readonly"
                                                               : "readwrite")
                        .objectStore("kept");
          job = put === undefined ? shelf.get("folder")
              : put === null ? shelf.delete("folder")
              : shelf.put(put, "folder");
        } catch (e) { db.close(); done(null); return; }
        job.onsuccess = function () {
          db.close();
          done(put === undefined ? (job.result || null) : null);
        };
        job.onerror = function () { db.close(); done(null); };
      };
    });
  }

  // A name the folder will take.  The browser's downloads quietly mend a
  // name with a slash or a colon in it; a folder refuses it outright.
  function fileSafe(name) {
    return String(name || "").replace(/[\\\/:*?"<>|\x00-\x1f]/g, "_")
                             .replace(/^[\s.]+|[\s.]+$/g, "") || "flowchart";
  }

  // The name, or the name numbered the way the downloads number a second
  // one -- "Sum (1).png" -- if a file of that name is there already.
  function freeName(dir, name) {
    var dot = name.lastIndexOf(".");
    var stem = dot > 0 ? name.slice(0, dot) : name;
    var ext = dot > 0 ? name.slice(dot) : "";
    function tryOne(n) {
      var each = n ? stem + " (" + n + ")" + ext : name;
      return dir.getFileHandle(each).then(function () {
        if (n >= 999) { throw new Error("full"); }
        return tryOne(n + 1);
      }, function (why) {
        if (why && why.name === "NotFoundError") { return each; }
        throw why;
      });
    }
    return tryOne(0);
  }

  // Leave to write in it.  Granted when it was picked, and again for the
  // rest of a visit once asked; the first save of a new visit asks, which
  // the browser allows because it is still answering the press that saved.
  function allowed(dir) {
    var how = { mode: "readwrite" };
    return dir.queryPermission(how).then(function (now) {
      if (now === "granted") { return true; }
      return dir.requestPermission(how).then(function (said) {
        return said === "granted";
      });
    });
  }

  // Into the folder, if there is one: true when it has taken the file on.
  // It is written a moment later, and a folder that will not have it --
  // leave refused, the folder moved or deleted since -- hands it back to
  // the downloads, so nothing saved is ever lost on the way.
  function intoFolder(blob, filename) {
    if (!saveDir) { return false; }
    var dir = saveDir, name = fileSafe(filename);
    allowed(dir).then(function (yes) {
      if (!yes) { throw new Error("not allowed"); }
      return freeName(dir, name);
    }).then(function (free) {
      return dir.getFileHandle(free, { create: true }).then(function (file) {
        return file.createWritable();
      }).then(function (pen) {
        return pen.write(blob).then(function () { return pen.close(); },
                                    function (why) {
          try { pen.abort(); } catch (e) { /* it is being given up anyway */ }
          throw why;
        });
      }).then(function () {
        savedSay(say("fd_saved", { name: free, folder: dir.name }));
      });
    }).catch(function () {
      download(blob, filename);
      savedSay(say("fd_fell", { folder: dir.name }), true);
    });
    return true;
  }

  // Said for a moment at the foot of the page.  The downloads say when
  // something has arrived; a file written into a folder arrives silently,
  // and a button that seems to do nothing gets pressed again.
  function savedSay(what, bad) {
    var box = el("#saved-to");
    if (!box) { return; }
    box.hidden = true;                   // so a second one comes in again
    box.textContent = what;
    box.classList.toggle("bad", !!bad);
    void box.offsetWidth;
    box.hidden = false;
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { box.hidden = true; }, bad ? 4600 : 2600);
  }

  // What the menu says about it, in the page's language.
  function wearFolder() {
    var where = el("#fd-where"), pick = el("#fd-pick"), off = el("#fd-off");
    if (!where) { return; }
    if (!CAN_FOLDER) {
      where.textContent = TXT.fd_cannot;
      pick.hidden = off.hidden = true;
      return;
    }
    where.textContent = saveDir ? say("fd_in", { name: saveDir.name })
                                : TXT.fd_browser;
    off.hidden = !saveDir;
  }

  var dressFolderless = dress;
  dress = function () {
    dressFolderless();
    wearFolder();
  };

  if (el("#fd-pick")) {
    el("#fd-pick").onclick = function () {
      var how = { id: "flowchart-saves", mode: "readwrite" };
      if (saveDir) { how.startIn = saveDir; }
      window.showDirectoryPicker(how).then(function (dir) {
        saveDir = dir;
        keptFolder(dir);
        wearFolder();
      }, function () { /* shut without picking: nothing changes */ });
    };
    el("#fd-off").onclick = function () {
      saveDir = null;
      keptFolder(null);
      wearFolder();
    };
    wearFolder();
    if (CAN_FOLDER) {
      keptFolder().then(function (dir) {
        if (dir && !saveDir) { saveDir = dir; wearFolder(); }
      });
    }
  }
