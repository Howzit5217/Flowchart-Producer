"""Thousands of programs made up at random, written out in every language and
run, each one checked against what the runner printed.

    python tests/thousands.py                    1000 programs, levels 0 to 5
    python tests/thousands.py --count 5000 --from 20000
    python tests/thousands.py --levels 4,5       only the long, deep ones
    python tests/thousands.py --big              numbers past a 32-bit int
    python tests/thousands.py --seeds 10070,11713   just these, again
    python tests/thousands.py --keep             failing programs kept in
                                                 tests/_out_made_up_fails

The programs come from made_up.py: plain ones at level 0, and at level 5
ones nobody would write -- a dozen modules calling one another, loops seven
deep, lists of lists, words cut and joined, everything mixed with
everything.  A program is the same program every time for the same number,
so a failure can be looked at again with `python tests/made_up.py SEED LEVEL`.

A program the runner itself stops (one that runs too long for it) is
counted apart and not held against any language.  Everything else has to
print, line for line, what the runner printed -- in Python, JavaScript,
Java, C# and C++ (the last three wherever this machine can build them; see
written.py).
"""
import collections, io, json, os, re, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
sys.path.insert(0, HERE)
import made_up                  # noqa: E402
import run as R                 # noqa: E402
import written                  # noqa: E402

BATCH = 150                     # programs read and run by one node at a time
STEP_CAP = 400000               # steps before the runner calls it a loop that never ends


def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def made(start, count, levels, big, seeds=None):
    cases = []
    for seed in seeds or range(start, start + count):
        level = levels[seed % len(levels)]
        text, typed, style = made_up.big_program(seed) if big else made_up.program(seed, level)
        cases.append({"name": "seed %d %s %s" % (seed, "big" if big else "level %d" % level, style),
                      "seed": seed, "level": level, "text": text, "typed": typed,
                      "title": ("Big %05d" if big else "Made %05d") % seed})
    return cases


def run_batch(batch, folder):
    """What the runner printed for each, and its code in every language."""
    shelf = []
    for n, c in enumerate(batch):
        try:
            ast = R.read_as_data(c["text"].strip("\n"))
        except Exception as e:      # noqa: BLE001 -- a program that will not read is a failure too
            c["unread"] = str(e)[:200]
            continue
        shelf.append({"name": c["name"], "typed": c["typed"], "title": c["title"],
                      "ast": ast, "case": n})
    asked = {"words": R.builder().WORDS["en"], "cases": [], "shelf": shelf, "stepCap": STEP_CAP,
             "shelfOut": os.path.join(folder, "made.json")}
    with io.open(os.path.join(folder, "made-asked.json"), "w", encoding="utf-8") as f:
        f.write(json.dumps(asked))
    got = subprocess.run(["node", "--max-old-space-size=4000", os.path.join(HERE, "program.js"),
                          os.path.join(folder, "made-asked.json")], capture_output=True, text=True)
    if got.returncode:
        raise RuntimeError((got.stdout + got.stderr).strip()[-500:])
    with io.open(asked["shelfOut"], encoding="utf-8") as f:
        results = json.load(f)
    return shelf, results


def main():
    start = int(arg("--from", "0"))
    count = int(arg("--count", "1000"))
    levels = [int(x) for x in arg("--levels", "0,1,2,3,4,5").split(",")]
    big = "--big" in sys.argv
    keep = os.path.join(HERE, "_out_made_up_fails") if "--keep" in sys.argv else None
    if keep:
        os.makedirs(keep, exist_ok=True)
    if not R.node_there():
        print("node is not installed: nothing can be run")
        return 1
    t0 = time.time()
    seeds = [int(x) for x in arg("--seeds", "").split(",") if x.strip()]
    cases = made(start, count, levels, big, seeds)
    tally = collections.defaultdict(lambda: collections.Counter())
    wrong, stopped, unread = [], 0, 0
    for at in range(0, len(cases), BATCH):
        batch = cases[at:at + BATCH]
        folder = tempfile.mkdtemp(prefix="_out-made-", dir=HERE)
        try:
            shelf, results = run_batch(batch, folder)
            unread += sum(1 for c in batch if "unread" in c)
            wrong += ["%s: does not read: %s" % (c["name"], c["unread"]) for c in batch if "unread" in c]
            ran = [(s, r) for s, r in zip(shelf, results) if not r["faults"]]
            stopped += len(shelf) - len(ran)
            bad, counts = written.marked([s for s, r in ran], [r for s, r in ran], folder)
            for lang, n in counts.items():
                tally[lang].update(n)
            wrong += bad
            if keep:
                for line in bad:
                    seed = re.match(r"seed (\d+)", line)
                    c = next((c for c in batch if seed and c["seed"] == int(seed.group(1))), None)
                    if c:
                        name = "%d-%s" % (c["seed"], "big" if big else c["level"])
                        io.open(os.path.join(keep, name + ".txt"), "w", encoding="utf-8").write(c["text"])
        finally:
            shutil.rmtree(folder, ignore_errors=True)
        done = min(at + BATCH, len(cases))
        print("%d of %d made up and run, %.0fs" % (done, len(cases), time.time() - t0), flush=True)
    print()
    for lang in sorted(tally):
        n = tally[lang]
        print("  %-11s %5d ran the same%s" % (lang, n["right"],
              "" if not n["skip"] else " (%d not tried: nothing here to build it)" % n["skip"]))
    print("  %d stopped by the runner as too long, %d did not read" % (stopped, unread))
    print("  %d wrong" % len(wrong))
    for line in wrong[:25]:
        print("   ", line.split("\n")[0][:300])
    return 1 if wrong else 0


if __name__ == "__main__":
    sys.exit(main())
