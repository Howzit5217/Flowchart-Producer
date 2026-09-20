"""Trying a set of puzzles out before they are put in the studio.

run.py checks the puzzles the studio ships.  This checks the ones being
written: the same two questions -- does the puzzle get something wrong, and
does the mend put it right -- asked of a spec file rather than of
28-puzzles.js, so a puzzle can be argued with before anybody sees it.

    python tests/spec.py tests/specs/level1.py

A spec file is a plain list called PUZZLES, one dict per puzzle:

    PUZZLES = [
        dict(key="z_ride",
             start="Start\\n...",           what ships, with the fault in it
             mend="Start\\n...",            the same program, put right
             tries=[dict(give=["130"], want=["Enjoy the ride"])],
             b=dict(en="...", de="...", es="...", fr="...")),
    ]
"""
import io
import json
import os
import runpy
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import run as R                                      # noqa: E402


def load(where):
    got = runpy.run_path(where)
    return got["PUZZLES"]


def tried(puzzles):
    """Hand the lot to node and say what came back."""
    fb = R.builder()
    asked = {"words": fb.WORDS["en"], "cases": [], "puzzles": []}
    for n, one in enumerate(puzzles, 1):
        for field in ("key", "start", "mend", "tries", "t", "b", "s"):
            if field not in one:
                raise SystemExit("puzzle %d has no %s" % (n, field))
        # t is what it is about, b is what it must do, s is what it does
        # now.  All three in all four languages, or the card comes out with
        # a heading over a blank in whichever one was forgotten.
        for field in ("t", "b", "s"):
            for lang in ("en", "de", "es", "fr"):
                if not one[field].get(lang):
                    raise SystemExit("%s has no %s in %s" % (
                        one["key"], field, lang))
        broken = R.read_as_data(one["start"].strip())
        mended = R.read_as_data(one["mend"].strip())
        for which, data in (("start", broken), ("mend", mended)):
            if data.get("problems"):
                raise SystemExit("%s: %s does not parse: %s" % (
                    one["key"], which, data["problems"][:2]))
        asked["puzzles"].append({"name": "%s (%s)" % (n, one["key"]),
                                 "broken": broken, "fixed": mended,
                                 "tries": one["tries"]})
    handle, where = tempfile.mkstemp(suffix=".json")
    try:
        with io.open(handle, "w", encoding="utf-8") as f:
            f.write(json.dumps(asked))
        return subprocess.run(["node", os.path.join(HERE, "program.js"), where],
                              capture_output=True, text=True)
    finally:
        os.remove(where)


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    bad = 0
    for where in sys.argv[1:]:
        puzzles = load(where)
        got = tried(puzzles)
        lines = [one["start"].strip().count("\n") + 1 for one in puzzles]
        print("%s -- %d puzzles, %d to %d lines, %d sets of answers" % (
            os.path.basename(where), len(puzzles), min(lines), max(lines),
            sum(len(one["tries"]) for one in puzzles)))
        said = (got.stdout + got.stderr).strip()
        if got.returncode:
            bad += 1
            print(said)
        else:
            print("  ok -- every one of them is broken, and every mend "
                  "puts it right")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
