"""The website: the page, written beside the package that runs it."""
import hashlib
import io
import json
import os
import re
import shutil

from .. import settings
from ..page import empty_chart, to_page
from ..parts import read_ui
from ..studio.web import ICONS, PYODIDE, needed
from ..words.lookup import word


# ------------------------------------------------------------ as an app --
# The website can be installed like an app -- on a phone's home screen, in
# a computer's Start menu or dock -- with no app store in between: a
# browser asks only for a manifest saying what the app is called and what
# it looks like, and a service worker that keeps it for when there is no
# connection.  Both are written here, beside the page.  The icons are
# files in ui/app/ and are simply pointed at where they are.
APP_FILES = [ICONS + name for name in
             ("icon-192.png", "icon-512.png", "icon-maskable-512.png",
              "apple-touch-icon.png")]

MANIFEST = {
    "name": "Flowchart Builder",
    "short_name": "Flowchart",
    "description": "Paste pseudocode, get a flowchart. Style it, run it, "
                   "and save it as a picture or as code -- it works "
                   "offline too.",
    "id": "./",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "background_color": "#eceff3",       # --bg, while it opens
    "theme_color": "#ffffff",            # --panel, the bar across the top
    "categories": ["education", "productivity"],
    "icons": [
        {"src": ICONS + "icon-192.png", "sizes": "192x192",
         "type": "image/png", "purpose": "any"},
        {"src": ICONS + "icon-512.png", "sizes": "512x512",
         "type": "image/png", "purpose": "any"},
        # Phones cut an icon to their own shape -- a circle, a squircle --
        # so this one is the same tile to the very edge, with the mark
        # kept well inside the part any of those shapes leaves standing.
        {"src": ICONS + "icon-maskable-512.png", "sizes": "512x512",
         "type": "image/png", "purpose": "maskable"},
    ],
}


def service_worker():
    """ui/app/sw.js with its marks filled in: what to keep, and which
    version of it this is.

    The version is the worker's own text, so it changes when what it keeps
    changes -- a module added, a new Python -- and not every time the page
    is written.  The page and modules need no version to be fresh: the
    worker asks the network for them first every time.
    """
    home = ["./", "manifest.webmanifest"] + APP_FILES + needed()
    at = re.search(r"/v([\w.]+)/", PYODIDE)
    body = (read_ui("app/sw.js")
            .replace("__HOME__", json.dumps(home, indent=2))
            .replace("__PYODIDE__", PYODIDE)
            .replace("__PYVERSION__", at.group(1) if at else
                     hashlib.sha1(PYODIDE.encode()).hexdigest()[:10]))
    return body.replace("__VERSION__",
                        hashlib.sha1(body.encode("utf-8")).hexdigest()[:10])


def write_site(where):
    """Write the whole thing out as a website that needs no server at all.

    A page, a readme, and the package itself -- and the page loads Python
    into the browser (Pyodide, from a CDN), fetches those modules and runs
    them there.  The drawing is done by the very same code that draws it
    here: there is one flowchart builder, not two, and a chart made on the
    website is the chart this package makes.

    That is what lets it go on GitHub Pages, which serves files and runs
    nothing: everything happens in whoever's browser is looking at it.

    Written into the folder the package already lives in -- which is what
    `--site .` does, and what the repository is set up to publish -- the
    page simply lands beside it and nothing is copied.  Written anywhere
    else, the package goes too, because a website is one folder and has to
    carry everything it needs inside it.
    """
    where = os.path.abspath(where)
    os.makedirs(where, exist_ok=True)
    home = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    beside = os.path.abspath(os.path.join(where, "flowchart")) != home

    page = to_page(empty_chart(), word("flowchart"), "flowchart",
                   source={"code": "", "title": "", "author": "",
                           "shape": settings.SHAPE}, web=True)
    # The readme goes with a site written somewhere else, to say what the
    # folder is and how to put it online.  Written into the package's own
    # home there is a readme there already -- the project's -- and writing
    # over somebody's readme is not what anybody meant by --site .
    written = []
    for name, body in ([(os.path.join(where, "index.html"), page)] +
                       ([(os.path.join(where, "README.md"), SITE_README)]
                        if beside else []) +
                       [(os.path.join(where, "manifest.webmanifest"),
                         json.dumps(MANIFEST, indent=2) + "\n"),
                        (os.path.join(where, "sw.js"), service_worker()),
                        (os.path.join(where, ".nojekyll"), "")]):
        with io.open(name, "w", encoding="utf-8", newline="\n") as f:
            f.write(body)
        written.append(name)
        print(word("wrote", path=name))

    if beside:
        for part in needed() + APP_FILES:   # only what the browser uses
            to = os.path.join(where, part.replace("/", os.sep))
            os.makedirs(os.path.dirname(to), exist_ok=True)
            shutil.copyfile(os.path.join(os.path.dirname(home), part), to)
            written.append(to)
        print(word("copied", n=len(needed()), dir=os.path.join(where, "flowchart")))
    else:
        print(word("already", path=os.path.join(where, "flowchart")))
    print(word("site_done", dir=where))
    return written


SITE_README = """# Flowchart Builder

Paste textbook-style pseudocode, get a flowchart. Color it in, then save it
as an SVG or a PNG.

This folder is the whole website, and it needs no server. The page loads
Python into your browser (Pyodide), fetches the `flowchart/` package beside
it and runs it there -- the same code that runs on a computer, running in
the browser. Nothing you type is sent anywhere.

## Putting it online with GitHub Pages

1. Make a repository on GitHub -- the free kind is fine.
2. Put these files in it. Either drag them onto the web page GitHub shows
   for an empty repository, or, in this folder:

       git init
       git add .
       git commit -m "Flowchart builder"
       git branch -M main
       git remote add origin https://github.com/<you>/<repo>.git
       git push -u origin main

3. On GitHub: **Settings -> Pages**. Under *Build and deployment*, set
   *Source* to **Deploy from a branch**, pick branch **main** and folder
   **/ (root)**, and press Save.
4. Wait a minute, then open `https://<you>.github.io/<repo>/`.

If you keep the files in a folder inside a bigger repository, pick that
folder in step 3 instead -- but the `flowchart/` package has to sit beside
`index.html` wherever it goes, because that is where the page looks for
it.

Any other static host works the same way -- Netlify, Cloudflare Pages,
GitLab Pages, or a folder on a school web server. There is nothing to
install and nothing to run.

## Installing it as an app

Anyone who wants it can install the site like an app, with no app store:
**Settings -> Install as an app** on the page, or the browser's own
*Install* button (on an iPhone or iPad: *Share -> Add to Home Screen*). It
then opens in a window of its own and works with no connection at all.
`manifest.webmanifest` and `sw.js` are what make that work; they need the
site served over `https`, which every host above does.

## Running it on your own computer

The `flowchart/` folder here is the builder itself -- the same code the page
above runs in your browser. Run it and you get the same studio, served from
your machine:

    python -m flowchart

Give it a file instead and it writes the .svg and .html straight out:

    python -m flowchart mycode.txt -t "My chart"

`--help` lists the rest: the shape to aim at, the language, the seed, and so
on.
"""

