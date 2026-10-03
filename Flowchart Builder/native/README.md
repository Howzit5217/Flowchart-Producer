# Flowchart Builder for the desktop

The website, as a program of its own for Windows and macOS (Electron). It is
the same page, packed with the files it needs; Python still comes from the
network the first time, as on the website. Two differences: a website a
program opens shows in the run area even when the site says it may not be
framed, and links out open in your browser.

## Windows

```
npm install
node node_modules/electron/install.js
npm run dist:win
```

The installer is `dist/Flowchart-Builder-Setup-<version>.exe`. It is not
signed, so Windows asks before the first run: **More info**, then **Run
anyway**.

(`node node_modules/electron/install.js` fetches Electron itself; newer npm
versions skip that step during `npm install`.)

## macOS

A Mac build has to be made on a Mac. The workflow
`.github/workflows/desktop-app.yml` does it on GitHub: open the **Actions**
tab, pick **Desktop app**, **Run workflow**. The `.dmg` files (Intel and
Apple silicon) are under the run's **Artifacts**. They are not signed:
the first time, right-click the app and choose **Open**.

## Trying it without packing

```
npm start
```

`FLOWCHART_SMOKE=1` runs it unseen and prints whether the page came up,
saves, reaches its Python files and can frame a site that refuses framing.

Write the website first (`write_site` in `flowchart/studio/site.py`):
`npm start` and the builds copy it in from the folder above.
