// ---------------------------------------------------------------------------
//  31-app.js -- the website as an app: installed, and working offline
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ----------------------------------------------------- an app of its own --
  // The website can be installed like an app -- an icon on a phone's home
  // screen or in a computer's Start menu, opening in a window of its own
  // with no address bar -- without going anywhere near an app store.  All
  // a browser asks of the page is a manifest saying what the app is called
  // (studio/site.py writes it) and a service worker (ui/app/sw.js) that
  // keeps the page, our Python and Python itself, so that the app opens and
  // draws with no connection at all.
  //
  // Only the website does this.  The studio served from a computer has that
  // computer behind it and nothing worth keeping; a page kept beside an
  // .svg is a file, and a file is not installed.
  var appAsk = null;                     // the browser's install prompt, kept

  function appAlone() {                  // opened as the app, not in a tab
    try {
      if (matchMedia("(display-mode: standalone)").matches) { return true; }
    } catch (e) { /* no matchMedia: a tab, then */ }
    return navigator.standalone === true;          // an iPhone's own word
  }

  // Apple's browsers never offer the prompt.  Each has its own way in, which
  // the page cannot press for anybody, so the most it can do is say where it
  // is.  An iPad says it is a Mac, and is told apart by its touch screen.
  function appleWay() {
    var ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/.test(ua) ||
        (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) { return "app_ios"; }
    if (/Macintosh/.test(ua) && /Version\/(1[7-9]|[2-9]\d)[.\d]* Safari/.test(ua) &&
        !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua)) { return "app_mac"; }
    return "";
  }

  function appSay(key) {                 // under the button, in any language
    var note = el("#app-note");
    if (!note) { return; }
    if (key) { note.dataset.w = key; note.textContent = TXT[key] || ""; }
    else { delete note.dataset.w; note.textContent = ""; }
  }

  // The button is there when there is something it can do: the browser has
  // offered to install the page, or it is one of Apple's and can be told
  // how.  Nowhere else -- a browser with no way to install anything, or the
  // app already open as the app.
  function dressApp() {
    var button = el("#app-install");
    if (!button) { return; }
    button.hidden = MODE !== "web" || appAlone() || !(appAsk || appleWay());
  }

  if (MODE === "web") {
    // Chrome, Edge and Android offer it on their own, as a bar along the
    // bottom of the screen.  Kept for Settings instead: nothing here springs
    // itself on anybody who came to draw a chart.  The browser's own menu
    // and address bar still offer it too.
    window.addEventListener("beforeinstallprompt", function (ev) {
      ev.preventDefault();
      appAsk = ev;
      dressApp();
    });
    window.addEventListener("appinstalled", function () {
      appAsk = null;
      dressApp();
      appSay("app_done");
    });
    if (el("#app-install")) {
      el("#app-install").onclick = function () {
        if (appAsk) {
          var asked = appAsk;
          appAsk = null;                 // a prompt can be shown only once
          appSay("");
          try {
            asked.prompt();
            asked.userChoice.then(dressApp, dressApp);
          } catch (e) { dressApp(); }
          return;
        }
        appSay(appleWay());
      };
    }
    dressApp();
    // Installed from a computer, the tab it was installed from moves into a
    // window of its own and carries on as the app.
    watchQuery("(display-mode: standalone)", dressApp);

    // Kept for when there is no connection.  Registered once the page has
    // finished loading, so it never competes with the page for the network
    // on the way in; and quietly given up on wherever it cannot be done --
    // a page opened from a file, or a browser that says no -- which leaves
    // the website working exactly as it always has.
    var keepApp = function () {
      try {
        if (!("serviceWorker" in navigator) || !window.isSecureContext) { return; }
        navigator.serviceWorker.register("sw.js").catch(function () { /* fine */ });
      } catch (e) { /* fine */ }
    };
    if (document.readyState === "complete") { keepApp(); }
    else { window.addEventListener("load", keepApp); }
  }
