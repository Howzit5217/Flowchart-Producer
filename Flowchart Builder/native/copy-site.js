// node copy-site.js -- the website, as the program packs it: the page,
// the Python it runs, its icons and its worker, copied in from the folder
// above (written there by write_site, flowchart/studio/site.py).
"use strict";
const fs = require("fs");
const path = require("path");

const FROM = path.join(__dirname, "..");
const TO = path.join(__dirname, "site");
const SKIP = new Set(["__pycache__", ".pytest_cache", "tests"]);

function copy(from, to) {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) {
      if (SKIP.has(name) || name.endsWith(".pyc")) { continue; }
      copy(path.join(from, name), path.join(to, name));
    }
    return;
  }
  fs.copyFileSync(from, to);
}

if (!fs.existsSync(path.join(FROM, "index.html"))) {
  console.error("No index.html in " + FROM + ": write the website first (flowchart.studio.site.write_site).");
  process.exit(1);
}
fs.rmSync(TO, { recursive: true, force: true });
fs.mkdirSync(TO, { recursive: true });
for (const name of ["index.html", "manifest.webmanifest", "sw.js", "flowchart"]) {
  const from = path.join(FROM, name);
  if (fs.existsSync(from)) { copy(from, path.join(TO, name)); }
}
// the program's own icon: the website's, at its largest
fs.mkdirSync(path.join(__dirname, "build"), { recursive: true });
fs.copyFileSync(path.join(FROM, "flowchart", "ui", "app", "icon-512.png"), path.join(__dirname, "build", "icon.png"));
console.log("Copied the website into " + TO);
