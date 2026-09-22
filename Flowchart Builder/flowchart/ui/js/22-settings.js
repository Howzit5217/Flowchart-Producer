// ---------------------------------------------------------------------------
//  22-settings.js -- the settings sheet: how it looks, which side, full screen
//
//  One part of the Flowchart Builder's script.  The parts run inside a single
//  function and share everything, in the order build.py lists them, so a name
//  made in an earlier part is in hand here.  An editor will call those names
//  undefined, which is expected and harmless.
// ---------------------------------------------------------------------------
/* eslint-disable no-undef */

  // ---------------------------------------------------- which side it sits --
  // The panel starts on the left because that is where a page's furniture
  // usually goes, but a chart is read left to right and grows to the right,
  // so on a wide screen the panel is often in the way of the thing it is
  // describing.  Moving it is one attribute; the stylesheet does the rest.
  var SIDES = ["left", "right"];
  var panelSide = "left";                // which hand the panel sits on

  function wearSide() {
    if (panelSide === "right") { document.body.setAttribute("data-side", "right"); }
    else { document.body.removeAttribute("data-side"); }
    all("#side-seg .seg-btn").forEach(function (b) {
      b.classList.toggle("on", b.dataset.side === panelSide);
    });
    try { localStorage.setItem("flowchart-panel-side", panelSide); }
    catch (e) { /* fine */ }
  }

  function setSide(want) {
    panelSide = SIDES.indexOf(want) >= 0 ? want : "left";
    wearSide();
  }

  try {
    var keptSide = localStorage.getItem("flowchart-panel-side");
    if (SIDES.indexOf(keptSide) >= 0) { panelSide = keptSide; }
  } catch (e) { /* no storage: left it is */ }

  // ------------------------------------------------------- filling the screen --
  // Browsers only grant this from something the person actually pressed, so
  // it is never asked for on the way in and never remembered: it is a thing
  // you do, not a setting you keep.  Where the browser has no full screen at
  // all -- an iPhone, mostly -- the row is taken out rather than left there
  // doing nothing.
  function fullNow() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function canFull() {
    var root = document.documentElement;
    return !!(root.requestFullscreen || root.webkitRequestFullscreen);
  }

  function wearFull() {
    var on = fullNow();
    var tick = el("#full-on");
    if (tick) { tick.checked = on; }
    var mark = el("#full-mark");
    if (mark) {
      mark.innerHTML = on
        ? '<path d="M2.5 7.5h5v-5M17.5 7.5h-5v-5M2.5 12.5h5v5M17.5 12.5h-5v5"/>'
        : '<path d="M7.5 2.5h-5v5M12.5 2.5h5v5M7.5 17.5h-5v-5M12.5 17.5h5v-5"/>';
    }
    var button = el("#full");
    if (button) {
      button.title = on ? (TXT.full_off || "") : (TXT.full_on || "");
      button.setAttribute("aria-label", button.title);
    }
  }

  function setFull(want) {
    var root = document.documentElement;
    var asked;
    try {
      if (want) {
        var go = root.requestFullscreen || root.webkitRequestFullscreen;
        if (go) { asked = go.call(root); }
      } else {
        var out = document.exitFullscreen || document.webkitExitFullscreen;
        if (out) { asked = out.call(document); }
      }
    } catch (e) { asked = null; }
    // The browser hands back a promise and turns it down whenever it feels
    // it should -- inside a frame that was never allowed full screen, or
    // without a real press behind the ask.  Left alone that refusal lands
    // in the console as an error nobody asked about, so it is caught here
    // and the switch just goes back to showing how things actually are.
    if (asked && asked.catch) { asked.catch(function () { wearFull(); }); }
  }

  ["fullscreenchange", "webkitfullscreenchange"].forEach(function (when) {
    document.addEventListener(when, function () {
      wearFull();
    });
  });

  // ----------------------------------------------------- the sheets themselves --
  // Two of them hang off the bar -- what you can save, and how things look --
  // and they behave the same way: the button opens one and shuts the other,
  // choosing inside leaves it open, anywhere else or Escape shuts it.
  var SHEETS = [["#save-open", "#save-menu"], ["#settings", "#settings-menu"]];

  // "here" is what open means, and it is the class rather than the hidden
  // attribute that says so.  The two part company for as long as a sheet
  // takes to leave: it is still in the page, being watched going, but it is
  // no longer open, and a press of its button while it is on its way out has
  // to bring it back rather than shut it a second time.
  function sheetOpen(which) {
    var sheet = el(which);
    return !!sheet && sheet.classList.contains("here");
  }
  function showSheet(which, want) {
    SHEETS.forEach(function (pair) {
      var on = want && pair[1] === which;
      var sheet = el(pair[1]);
      var button = el(pair[0]);
      if (sheet) { sheet.hidden = !on; sheet.classList.toggle("here", on); }
      if (button) { button.setAttribute("aria-expanded", on ? "true" : "false"); }
    });
  }
  function shutSheets() { showSheet(null, false); }
  function showSettings(want) { showSheet("#settings-menu", want); }

  SHEETS.forEach(function (pair) {
    var button = el(pair[0]), sheet = el(pair[1]);
    if (!button || !sheet) { return; }
    button.onclick = function (ev) {
      ev.stopPropagation();
      showSheet(pair[1], !sheetOpen(pair[1]));
    };
    sheet.addEventListener("click", function (ev) {
      ev.stopPropagation();            // choosing inside it leaves it open
    });
  });
  document.addEventListener("click", shutSheets);
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") { shutSheets(); }
  });

  if (el("#settings")) {

    all("#theme-seg .seg-btn").forEach(function (b) {
      b.onclick = function () { setTheme(b.dataset.theme); };
    });
    all("#side-seg .seg-btn").forEach(function (b) {
      b.onclick = function () { setSide(b.dataset.side); };
    });
    if (el("#full-on")) {
      el("#full-on").onchange = function () { setFull(el("#full-on").checked); };
    }
    if (!canFull() && el("#full-row")) { el("#full-row").hidden = true; }
  }

  if (el("#full")) {
    el("#full").onclick = function () { setFull(!fullNow()); };
    if (!canFull()) { el("#full").hidden = true; }
  }

  // Putting the words on the page happens after this part runs, and again
  // whenever the language changes -- and it works from data-w attributes,
  // which cannot say "whichever of these two it is right now".  So the
  // settings that word themselves are re-applied on the back of it.
  var dressAlone = dress;
  dress = function () {
    dressAlone();
    wearSide();
    wearFull();
  };

  wearSide();
  wearFull();
