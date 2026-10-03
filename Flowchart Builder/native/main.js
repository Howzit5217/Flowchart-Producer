// ---------------------------------------------------------------------------
//  main.js -- Flowchart Builder as a program of its own, for Windows and
//  for the Mac: the same page as the website, in a window, from the files
//  it is packed with
// ---------------------------------------------------------------------------
// (asked for, 2026-10-02: "update the site so it can also run as an app
// natively on windows and Mac")
//
// The page is served from inside the program (app://flowchart/), not from
// the disk as file:// -- a page from the disk may not fetch the Python it
// runs, keep what it saves, or start the worker it reads code in.  Python
// itself comes from the same place the website gets it (Pyodide, over the
// network) the first time, and is kept after.  What is different from the
// website: a website a program opens is shown in the run area whatever it
// says about being framed (40-web.js), and a link out opens in the
// browser.
"use strict";
const { app, BrowserWindow, protocol, net, session, shell } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const SITE = path.join(__dirname, "site");
const HOME = "app://flowchart/index.html";

protocol.registerSchemesAsPrivileged([{
  scheme: "app",
  privileges: { standard: true, secure: true, supportFetchAPI: true, allowServiceWorkers: true, corsEnabled: true, stream: true }
}]);

// One window, one program: opened again, the one already open comes forward.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) { if (win.isMinimized()) { win.restore(); } win.focus(); }
  });
}

function makeWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 360, minHeight: 480,
    title: "Flowchart Builder",
    backgroundColor: "#111827",
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
      spellcheck: true
    }
  });
  if (process.env.FLOWCHART_SMOKE) { smoke(win); } else { win.once("ready-to-show", () => win.show()); }
  // a link out of the page, or a window it opens: the browser's, not ours
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) { shell.openExternal(url); }
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith("app://flowchart/")) { return; }
    event.preventDefault();
    if (/^https?:/i.test(url)) { shell.openExternal(url); }
  });
  win.loadURL(HOME);
  return win;
}

app.whenReady().then(() => {
  // the page and what it is packed with, and nothing outside them
  protocol.handle("app", (request) => {
    const asked = new URL(request.url);
    let where = decodeURIComponent(asked.pathname);
    if (where === "/" || where === "") { where = "/index.html"; }
    const file = path.normalize(path.join(SITE, where));
    if (file !== SITE && !file.startsWith(SITE + path.sep)) {
      return new Response("Not found", { status: 404 });
    }
    return net.fetch(pathToFileURL(file).toString());
  });
  // A website shown in the run area (40-web.js): many say no page may
  // frame them, which a browser has to take their word for.  Here it is
  // the person's own program asking, so for what is opened inside the page
  // -- and only that -- the refusal is left out.
  session.defaultSession.webRequest.onHeadersReceived((details, done) => {
    if (details.resourceType !== "subFrame" || !details.responseHeaders) { done({}); return; }
    const headers = {};
    for (const [name, values] of Object.entries(details.responseHeaders)) {
      const key = name.toLowerCase();
      if (key === "x-frame-options") { continue; }
      if (key === "content-security-policy") {
        headers[name] = values.map((v) => v.split(";").filter((d) => !/^\s*frame-ancestors\b/i.test(d)).join(";"));
        continue;
      }
      headers[name] = values;
    }
    done({ responseHeaders: headers });
  });
  makeWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) { makeWindow(); } });
});

// FLOWCHART_SMOKE=1: opened unseen, the page asked whether it came up as
// it should -- and a page that will not be framed framed anyway -- the
// answers printed, and closed.  (For a build to check itself.)
function smoke(win) {
  win.webContents.once("did-finish-load", async () => {
    const out = {};
    try {
      out.page = await win.webContents.executeJavaScript(
        "({ native: typeof NATIVE_APP !== 'undefined' && NATIVE_APP === true, title: document.title," +
        " build: !!document.querySelector('#build'), saved: (function () { try { localStorage.setItem('smoke', '1'); return localStorage.getItem('smoke') === '1'; } catch (e) { return false; } })() })");
      out.python = await win.webContents.executeJavaScript(
        "fetch('flowchart/__init__.py').then(function (r) { return r.ok; }).catch(function () { return false; })");
      await win.webContents.executeJavaScript(
        "new Promise(function (done) { var f = document.createElement('iframe'); f.src = 'https://www.google.com/'; f.onload = function () { done(true); };" +
        " document.body.appendChild(f); setTimeout(function () { done(false); }, 15000); })");
      const frames = win.webContents.mainFrame.frames.map((f) => f.url);
      out.framed = frames.some((u) => /google\./.test(u)) && !frames.some((u) => /^chrome-error:/.test(u));
    } catch (e) { out.error = String(e && e.message || e); }
    console.log("SMOKE " + JSON.stringify(out));
    app.exit(0);
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") { app.quit(); }
});
