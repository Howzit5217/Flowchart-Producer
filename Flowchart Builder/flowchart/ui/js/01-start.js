// ---------------------------------------------------------------------------
//  01-start.js -- the words, the theme, and the small helpers
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
(function () {
  "use strict";
  // Everything below is about looking at the chart and coloring it in.  The
  // drawing itself came out of the script; nothing here can change what it
  // says, only what it looks like.
  var MODE = "__MODE__";                 // "page" beside a file, "studio" served
  var FILE = __JSNAME__;
  var ALL = __ALLWORDS__;                // every word, in every language
  var LANG = "__LANG__";
  var SHAPE_LIST = __SHAPELIST__;        // every shape that can be drawn
  var ROLES = ["oval", "rect", "io", "diamond", "hex", "sub"];
  var geom = {};                         // which shape draws which kind
  var PYODIDE = "__PYODIDE__";           // where the browser gets Python
  var PYFILES = __PYFILES__;             // and the modules it runs there
  var TXT = ALL[LANG] || ALL.en;         // the ones this page is using
  function say(key, fill) {              // ... with {things} filled in
    var out = TXT[key] || key;
    for (var name in (fill || {})) {
      out = out.split("{" + name + "}").join(fill[name]);
    }
    return out;
  }
  function kinds() {                     // named in the language of the day
    return [["oval", TXT.key_oval], ["rect", TXT.key_rect],
            ["io", TXT.key_io], ["diamond", TXT.key_diamond],
            ["hex", TXT.key_hex], ["sub", TXT.key_sub]];
  }
  var PRESETS = [
    ["p_ink", { sheet: "#ffffff", ink: "#000000", words: "#000000",
              grid: "#e7ebf0",
              fills: { oval: "#ffffff", rect: "#ffffff", io: "#ffffff",
                       diamond: "#ffffff", hex: "#ffffff", sub: "#ffffff" } }],
    ["p_classic", { sheet: "#ffffff", ink: "#111827", words: "#111827",
                  grid: "#e7ebf0",
                  fills: { oval: "#dbeafe", rect: "#ffffff", io: "#eaf5ff",
                           diamond: "#fff4d6", hex: "#fff4d6", sub: "#f1e7ff" } }],
    ["p_slate", { sheet: "#f8fafc", ink: "#334155", words: "#0f172a",
                grid: "#e2e8f0",
                fills: { oval: "#e2e8f0", rect: "#ffffff", io: "#e0f2fe",
                         diamond: "#ede9fe", hex: "#ede9fe", sub: "#f1f5f9" } }],
    ["p_meadow", { sheet: "#ffffff", ink: "#14532d", words: "#14532d",
                 grid: "#e3efe6",
                 fills: { oval: "#dcfce7", rect: "#ffffff", io: "#ecfccb",
                          diamond: "#fef9c3", hex: "#fef9c3", sub: "#e0f2fe" } }],
    ["p_sunset", { sheet: "#fffdf9", ink: "#7c2d12", words: "#7c2d12",
                 grid: "#f2e9df",
                 fills: { oval: "#ffedd5", rect: "#ffffff", io: "#fee2e2",
                          diamond: "#fef3c7", hex: "#fef3c7", sub: "#fae8ff" } }],
    ["p_night", { sheet: "#0f172a", ink: "#cbd5e1", words: "#e2e8f0",
                grid: "#1e293b",
                fills: { oval: "#1e293b", rect: "#111c30", io: "#152744",
                         diamond: "#3a2e17", hex: "#3a2e17", sub: "#2b1b46" } }]
  ];

  // ----------------------------------------------------------- the words --
  // Four typefaces rather than the computer's whole font menu.  Each is a
  // list, because a page cannot know which fonts the computer looking at it
  // has: it gets the first one there is, and the last is the kind of thing
  // to fall back on when there is none of them.  Plain is the face the
  // drawing measures its words in, and every chart is set in it until
  // somebody asks for another.
  var FACES = {
    sans: "Arial, Helvetica, sans-serif",
    serif: "Georgia, 'Times New Roman', Times, serif",
    mono: "Consolas, 'Courier New', Courier, monospace",
    hand: "'Comic Sans MS', 'Comic Neue', 'Chalkboard SE', 'Segoe Print', cursive"
  };
  // How much bigger or smaller the words can be made, a press at a time.
  var TYPE_STEPS = [0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6, 1.8, 2];
  // The highlighter pens, in the colors every stationer sells them in.
  var MARKERS = [["#fff176", "m_yellow"], ["#b9f6ca", "m_green"],
                 ["#ffc1e3", "m_pink"], ["#b3e5fc", "m_blue"],
                 ["#ffd8a8", "m_orange"]];
  var CODE_TYPE = 11;                    // the size the drawing sets its words
                                         //   at: FONT_SIZE, in measure.py
  // How heavy a line is drawn.  Normal is what the drawing itself draws
  // with, so a chart nobody has asked about is never written on for it.
  var WEIGHTS = { thin: 0.8, normal: 1.3, thick: 2.2 };

  function el(q, root) { return (root || document).querySelector(q); }
  function has(q) { return !!document.querySelector(q); }
  function all(q, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(q));
  }
  // Copying the old way: a box off the side of the screen, selected, and
  // cut.  Every browser still has this, including the ones that have no
  // navigator.clipboard to offer -- which is any page not served over https
  // or from localhost, so serving the studio to another machine on the
  // house's own network is enough to lose the new way entirely.  Says
  // whether it worked, so whatever asked can say so too.
  function oldCopy(text) {
    var box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.setAttribute("aria-hidden", "true");
    // Off the side rather than hidden: a box that is not being displayed
    // cannot be selected, and one that is has to not scroll the page to
    // itself when it takes the focus.
    box.style.cssText = "position:fixed; top:0; left:-9999px; opacity:0";
    document.body.appendChild(box);
    var done = false;
    try {
      box.focus();
      box.select();
      box.setSelectionRange(0, box.value.length);   // iOS wants telling twice
      done = !!document.execCommand && document.execCommand("copy");
    } catch (e) { done = false; }
    box.remove();
    return done;
  }
  // Light or dark: whatever the computer is set to, unless the page has
  // been told otherwise, which it remembers.
  var THEMES = ["auto", "light", "dark"];
  var theme = "auto";

  function nightOutside() {             // what the computer itself is set to
    try { return matchMedia("(prefers-color-scheme: dark)").matches; }
    catch (e) { return false; }
  }
  function wearing() {                  // what the page is actually showing
    return theme === "auto" ? (nightOutside() ? "dark" : "light") : theme;
  }

  function wearTheme() {
    if (theme === "auto") { document.documentElement.removeAttribute("data-theme"); }
    else { document.documentElement.setAttribute("data-theme", theme); }
    var now = wearing();
    var mark = el("#theme-mark");
    if (mark) {
      // The button shows the way it would go, not the way it is: a moon to
      // turn the lights off, a sun to turn them back on.
      mark.innerHTML = now === "light"
        ? '<path d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9z"/>'
        : '<circle cx="10" cy="10" r="4"/><path d="M10 1v2M10 17v2M1 10h2M17 ' +
          '10h2M3.6 3.6l1.4 1.4M15 15l1.4 1.4M16.4 3.6L15 5M5 15l-1.4 1.4"/>';
      mark.style.opacity = "1";
    }
    var button = el("#theme");
    if (button) {
      button.title = (TXT.theme || "") + " · " +
                     (TXT["theme_" + theme] || theme);
    }
    all("#theme-seg .seg-btn").forEach(function (b) {
      b.classList.toggle("on", b.dataset.theme === theme);
    });
    try { localStorage.setItem("flowchart-theme", theme); } catch (e) { /* fine */ }
  }

  function setTheme(want) {
    theme = THEMES.indexOf(want) >= 0 ? want : "auto";
    wearTheme();
  }

  try {
    var kept = localStorage.getItem("flowchart-theme");
    if (THEMES.indexOf(kept) >= 0) { theme = kept; }
  } catch (e) { /* no storage: auto it is */ }

  // Every press has to change the picture.  Cycling auto -> light -> dark
  // did not: on a computer already set to light, the first press moved from
  // auto to light and nothing on the screen moved at all, so the button
  // looked broken every third press.  So the button is a straight switch --
  // whatever is on screen now, show the other one -- and "auto" stays as the
  // setting it starts on and can be put back to in Settings.
  el("#theme").onclick = function () {
    setTheme(wearing() === "dark" ? "light" : "dark");
  };

  // Following the computer while on auto.  A media query is watched two
  // different ways depending on how old the browser is: the plain
  // addEventListener everything has now, and the addListener that Safari
  // had on its own until 14.  Asking for the first inside a try and
  // stopping there meant that on those the page simply never noticed the
  // computer going dark -- it sat in whatever it had been wearing when it
  // opened.  Both are tried, in that order, so it follows either way.
  function watchQuery(query, told) {
    try {
      var watch = matchMedia(query);
      if (watch.addEventListener) { watch.addEventListener("change", told); }
      else if (watch.addListener) { watch.addListener(told); }
    } catch (e) { /* no matchMedia at all: it catches up on the next press */ }
  }
  watchQuery("(prefers-color-scheme: dark)", function () {
    if (theme === "auto") { wearTheme(); }
  });

  function dress() {                     // put the words on the page
    all("[data-w]").forEach(function (e) {
      if (TXT[e.dataset.w]) { e.textContent = TXT[e.dataset.w]; }
    });
    all("[data-w-title]").forEach(function (e) {
      if (TXT[e.dataset.wTitle]) { e.title = TXT[e.dataset.wTitle]; }
    });
    all("[data-w-ph]").forEach(function (e) {
      if (TXT[e.dataset.wPh]) { e.placeholder = TXT[e.dataset.wPh]; }
    });
    // The two sides of the decision switch are not words of their own:
    // they are the words the chart itself will use, shown as a pair.  Built
    // from those rather than written out again, they cannot drift from what
    // pressing them actually does, in any language.
    var formal = el("#decide-tf"), plain = el("#decide-yn");
    if (formal) { formal.textContent = TXT.yes + " / " + TXT.no; }
    if (plain) { plain.textContent = TXT.yes_plain + " / " + TXT.no_plain; }
    dressMore();
    document.documentElement.lang = LANG;
    wearTheme();
  }

  function darken(hex, by) {
    var m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || "");
    if (!m) { return hex; }
    return "#" + [1, 2, 3].map(function (i) {
      var v = Math.round(parseInt(m[i], 16) * by);
      return ("0" + Math.max(0, Math.min(255, v)).toString(16)).slice(-2);
    }).join("");
  }

  var style = { sheet: "", ink: "", words: "", grid: "", gridOff: false,
                kinds: {}, nodes: {}, letters: {} };
  var chart = null, sel = null, W = 0, H = 0, zoom = 1;
  // Whether a chart can be drawn again here.  The studio and the website can:
  // they have the drawing behind them.  The page written beside an .svg has
  // only the drawing it was written with, so anything that would need boxes
  // of another size -- bigger words, a wider typeface -- is not offered on it.
  var CAN_REFLOW = has("#build");

