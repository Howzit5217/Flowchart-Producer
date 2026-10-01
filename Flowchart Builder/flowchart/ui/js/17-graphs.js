// ---------------------------------------------------------------------------
//  17-graphs.js -- what a run printed, as a chart where it wants one
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ================================================= a chart of the result ==
  // Twelve months of rainfall printed as twelve numbers are twelve numbers;
  // drawn as twelve bars they are the wet winter and the dry summer.  So a
  // run that prints something a chart says better is given one, right
  // under what it printed:
  //
  //   - a list of numbers, or a table of them (Display rainfall, Display
  //     votes) -- bars, one to an item, each named by its key;
  //   - lines of a name and a number, three or more one after another
  //     ("Ann: 90", "Year 3 = 1157.63") -- bars, named;
  //   - a number to a line, five or more one after another (a Fibonacci
  //     run, a balance paid off month by month) -- a line.
  //
  // Nothing else is: a chart of two numbers, or of words, says nothing the
  // lines above it do not.  The charts are the page's, not the program's:
  // they are not printed lines, so Copy, Save it and a save of the run
  // leave them out (tapeKind), and code written out from the program does
  // not draw them.  They are simply there, whenever what was printed wants
  // one: a switch for them was one more thing to read past to get to Run.
  var GRAPH_MOST = 4;                    // charts one run is given, at most
  var GRAPH_BARS = 40;                   // more than this, and it is a line
  var GRAPH_POINTS = 400;                // a line drawn through more is thinned to this
  var graphsMade = 0;                    // this run's

  function graphNum(v) {                 // a number as it is to be drawn, or null
    if (typeof v === "number" && isFinite(v)) { return v; }
    return null;
  }

  // 1200 as 1.2k, 0.25 as 0.25: the numbers along the side, short.
  function graphSays(v) {
    var a = Math.abs(v);
    if (a >= 1e6) { return +(v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M"; }
    if (a >= 1e4) { return +(v / 1e3).toFixed(a >= 1e5 ? 0 : 1) + "k"; }
    return String(+v.toFixed(a >= 100 ? 0 : a >= 10 ? 1 : 2));
  }

  function svgEl(name, attrs, text) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text !== undefined) { e.textContent = text; }
    return e;
  }

  // The chart itself.  `series`: [{ name, values: [number|null] }]; `names`
  // the name under each place along the bottom (bars), or none (a line,
  // counted along).  Drawn in the page's own colors, so it follows the
  // theme; sized by its box, words and all.
  function graphSvg(series, names, bars) {
    var W = 600, H = 190, left = 44, right = 12, top = 12, foot = names && bars ? 34 : 22;
    var lo = Infinity, hi = -Infinity, count = 0;
    series.forEach(function (s) {
      count = Math.max(count, s.values.length);
      s.values.forEach(function (v) {
        if (v === null) { return; }
        lo = Math.min(lo, v); hi = Math.max(hi, v);
      });
    });
    if (bars || lo > 0) { lo = Math.min(lo, 0); }
    if (hi < 0) { hi = 0; }
    if (hi === lo) { hi = lo + 1; }
    // what a screen reader says for it: each line or the bars, and their
    // values, the first thirty of them
    var spoken = series.map(function (s) {
      return (s.name ? s.name + ": " : "") + s.values.slice(0, 30).map(function (v, i) {
        return (names ? names[i] + " " : "") + (v === null ? "-" : graphSays(v));
      }).join(", ") + (s.values.length > 30 ? ", …" : "");
    }).join("; ");
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, "class": "graph",
                              role: "img", "aria-label": spoken });
    var plotW = W - left - right, plotH = H - top - foot;
    function yOf(v) { return top + plotH - (v - lo) / (hi - lo) * plotH; }
    // the ruling, and what it rules
    [lo, (lo + hi) / 2, hi].forEach(function (v) {
      var y = yOf(v).toFixed(1);
      svg.appendChild(svgEl("line", { x1: left, x2: W - right, y1: y, y2: y, "class": "graph-rule" }));
      svg.appendChild(svgEl("text", { x: left - 6, y: +y + 4, "text-anchor": "end", "class": "graph-says" },
                            graphSays(v)));
    });
    if (lo < 0 && hi > 0) {
      var z = yOf(0).toFixed(1);
      svg.appendChild(svgEl("line", { x1: left, x2: W - right, y1: z, y2: z, "class": "graph-zero" }));
    }
    if (bars) {
      var slot = plotW / count, wide = Math.max(2, Math.min(48, slot * 0.7));
      var s0 = series[0];
      s0.values.forEach(function (v, i) {
        if (v === null) { return; }
        var x = left + slot * i + (slot - wide) / 2, y0 = yOf(0), y1 = yOf(v);
        var bar = svgEl("rect", { x: x.toFixed(1), y: Math.min(y0, y1).toFixed(1), width: wide.toFixed(1),
                                  height: Math.max(1, Math.abs(y1 - y0)).toFixed(1), rx: 2, "class": "graph-bar" });
        bar.appendChild(svgEl("title", {}, (names ? names[i] + ": " : "") + graphSays(v)));
        svg.appendChild(bar);
        // the number over the bar, where there is room for it
        if (slot >= 26) {
          svg.appendChild(svgEl("text", { x: (x + wide / 2).toFixed(1), y: (Math.min(y0, y1) - 4).toFixed(1),
                                          "text-anchor": "middle", "class": "graph-value" }, graphSays(v)));
        }
        if (names && (slot >= 22 || i % Math.ceil(22 / slot) === 0)) {
          var said = String(names[i]);
          var most = Math.max(3, Math.floor(slot / 6.5));
          if (said.length > most) { said = said.slice(0, most - 1) + "…"; }
          svg.appendChild(svgEl("text", { x: (x + wide / 2).toFixed(1), y: H - foot + 16,
                                          "text-anchor": "middle", "class": "graph-says" }, said));
        }
      });
      return svg;
    }
    // lines, counted along from one
    var step = count > 1 ? plotW / (count - 1) : 0;
    series.forEach(function (s, k) {
      var pts = [];
      s.values.forEach(function (v, i) {
        if (v !== null) { pts.push((left + step * i).toFixed(1) + "," + yOf(v).toFixed(1)); }
      });
      svg.appendChild(svgEl("polyline", { points: pts.join(" "), "class": "graph-line graph-c" + (k % 4) }));
      if (count <= 30) {
        s.values.forEach(function (v, i) {
          if (v === null) { return; }
          var dot = svgEl("circle", { cx: (left + step * i).toFixed(1), cy: yOf(v).toFixed(1), r: 3,
                                      "class": "graph-dot graph-c" + (k % 4) });
          dot.appendChild(svgEl("title", {}, (s.name ? s.name + " " : "") + "#" + (i + 1) + ": " + graphSays(v)));
          svg.appendChild(dot);
        });
      }
    });
    // how far along: the first and the last, under the line
    [[0, "start"], [count - 1, "end"]].forEach(function (at) {
      if (count < 2 && at[0]) { return; }
      svg.appendChild(svgEl("text", { x: (left + step * at[0]).toFixed(1), y: H - 6,
                                      "text-anchor": at[1], "class": "graph-says" },
                            names ? String(names[at[0]]) : String(at[0] + 1)));
    });
    return svg;
  }

  // Thinned, where there are more than a line can show: every so many
  // points, and the last one always.
  function thinned(values, names) {
    if (values.length <= GRAPH_POINTS) { return { values: values, names: names }; }
    var every = values.length / GRAPH_POINTS, v = [], n = names ? [] : null;
    for (var i = 0; i < GRAPH_POINTS; i++) {
      var k = Math.min(values.length - 1, Math.round(i * every));
      v.push(values[k]);
      if (n) { n.push(names[k]); }
    }
    return { values: v, names: n };
  }

  // A chart, put in the tape after `line`, with a heading where it has one.
  // A legend under it where there is more than one line.
  function graphCard(after, series, names, bars, heading) {
    if (!after || !after.parentNode) { return null; }
    var card = document.createElement("div");
    card.className = "tape-chart";
    if (heading) {
      var h = document.createElement("div");
      h.className = "graph-head";
      h.textContent = heading;
      card.appendChild(h);
    }
    if (!bars && series[0].values.length > GRAPH_POINTS) {
      series = series.map(function (s) {
        var t = thinned(s.values, names);
        return { name: s.name, values: t.values, names: t.names };
      });
      names = series[0].names;
    }
    card.appendChild(graphSvg(series, names, bars));
    if (series.length > 1) {
      var key = document.createElement("div");
      key.className = "graph-key";
      series.forEach(function (s, k) {
        var one = document.createElement("span");
        one.className = "graph-c" + (k % 4);
        one.textContent = s.name;
        key.appendChild(one);
      });
      card.appendChild(key);
    }
    after.parentNode.insertBefore(card, after.nextSibling);
    return card;
  }

  // ---- a list or a table, displayed -----------------------------------------
  // Display scores, Display "Votes: ", votes: the last thing shown is a list
  // of three numbers or more, or a table of two or more, and anything shown
  // before it is words -- its heading.
  function graphShown(vals, line) {
    if (quiet || !vals.length || graphsMade >= GRAPH_MOST || !line) { return; }
    var last = vals[vals.length - 1];
    var before = vals.slice(0, -1);
    if (!before.every(function (v) { return typeof v === "string"; })) { return; }
    var heading = before.join("").replace(/[:\s]+$/, "");
    var values, names = null;
    if (Array.isArray(last) && last.length >= 3 && last.every(function (v) { return graphNum(v) !== null; })) {
      values = last.slice();
    } else if (isTable(last) && last.map.size >= 2) {
      values = []; names = [];
      var fine = true;
      last.map.forEach(function (e) {
        if (graphNum(e[1]) === null) { fine = false; }
        names.push(readable(e[0])); values.push(e[1]);
      });
      if (!fine) { return; }
    } else {
      return;
    }
    var bars = values.length <= GRAPH_BARS;
    if (bars && !names) { names = values.map(function (v, i) { return String(i); }); }
    if (graphCard(line, [{ name: heading, values: values }], names, bars, heading)) { graphsMade++; }
  }

  // ---- lines printed one after another ---------------------------------------
  var R_JUST_NUMBER = /^\s*[$£€]?\s*(-?\d+(?:\.\d+)?)\s*%?\s*$/;
  var R_NAMED_NUMBER = /^\s*(.{1,40}?)\s*(?::|=|\bis\b|→|->)\s*[$£€]?\s*(-?\d+(?:\.\d+)?)\s*%?\s*$/i;

  // At the end of a run: the program's own lines, in runs of the same kind,
  // and a chart under each run that is long enough to be worth one.
  // A list or a table the way the tape writes one -- "Rain: [78, 52, 61]",
  // "{'Ann': 12, 'Bo': 7}" -- read back off the line: a run put back from a
  // save, or a reload, has its lines and not the values they were made from.
  var R_LIST_SAID = /^(.*?)\[(\s*-?\d+(?:\.\d+)?(?:\s*,\s*-?\d+(?:\.\d+)?){2,}\s*)\]\s*$/;
  var R_TABLE_SAID = /^(.*?)\{((?:\s*(?:'[^']*'|-?\d+(?:\.\d+)?)\s*:\s*-?\d+(?:\.\d+)?\s*,?){2,})\}\s*$/;
  function graphSaid(line) {
    var said = line.textContent, m = R_LIST_SAID.exec(said), heading, values, names = null;
    if (m) {
      heading = m[1];
      values = m[2].split(",").map(function (v) { return parseFloat(v); });
    } else if ((m = R_TABLE_SAID.exec(said))) {
      heading = m[1];
      values = []; names = [];
      m[2].replace(/\s*('[^']*'|-?\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)/g, function (all, k, v) {
        names.push(k.replace(/^'|'$/g, "")); values.push(parseFloat(v));
        return all;
      });
      if (values.length < 2) { return false; }
    } else {
      return false;
    }
    heading = heading.replace(/[:\s]+$/, "");
    var bars = values.length <= GRAPH_BARS;
    if (bars && !names) { names = values.map(function (v, i) { return String(i); }); }
    return !!graphCard(line, [{ name: heading, values: values }], names, bars, heading);
  }

  function graphRun() {
    if (quiet || !el("#tape")) { return; }
    var lines = Array.prototype.filter.call(el("#tape").children, function (n) {
      return n.classList && n.classList.contains("said") &&
             !["typed", "good", "bad", "warn", "note", "blame", "hint-line"].some(function (c) {
               return n.classList.contains(c);
             });
    });
    lines.forEach(function (line) {      // lists and tables not charted yet
      var next = line.nextElementSibling;
      if (graphsMade >= GRAPH_MOST || (next && next.classList.contains("tape-chart"))) { return; }
      if (graphSaid(line)) { graphsMade++; }
    });
    var i = 0;
    while (i < lines.length && graphsMade < GRAPH_MOST) {
      var run = [], kind = null;
      for (var j = i; j < lines.length; j++) {
        var said = lines[j].textContent;
        var here = R_JUST_NUMBER.test(said) ? "n" : R_NAMED_NUMBER.test(said) ? "named" : null;
        // lines next to one another in the tape, not with a chart or a
        // question between them
        var next = j > i && lines[j - 1].nextElementSibling === lines[j];
        if (!here || (kind && here !== kind) || (j > i && !next)) { break; }
        kind = here;
        run.push(lines[j]);
      }
      var last = run[run.length - 1];
      var afterChart = last && last.nextElementSibling && last.nextElementSibling.classList.contains("tape-chart");
      if (kind === "n" && run.length >= 5 && !afterChart) {
        var values = run.map(function (l) { return parseFloat(R_JUST_NUMBER.exec(l.textContent)[1]); });
        if (values.some(function (v) { return v !== values[0]; })) {
          if (graphCard(last, [{ name: "", values: values }], null, false, "")) { graphsMade++; }
        }
      } else if (kind === "named" && run.length >= 3 && !afterChart) {
        var names = [], vals = [];
        run.forEach(function (l) {
          var m = R_NAMED_NUMBER.exec(l.textContent);
          names.push(m[1].replace(/\s+$/, "")); vals.push(parseFloat(m[2]));
        });
        var bars = vals.length <= GRAPH_BARS;
        if (graphCard(last, [{ name: "", values: vals }], names, bars, "")) { graphsMade++; }
      }
      i = run.length ? i + run.length : i + 1;
    }
  }

  function graphsClear() { graphsMade = 0; }

  // ---- the trace table's numbers, over the run --------------------------------
  // Each name that only ever held numbers, drawn step by step: what the
  // table says row by row, seen at once -- the total climbing, the counter
  // going round.  Four at most, the ones that changed most often.
  function traceGraph(page, rows, cols) {
    if (rows.length < 3) { return; }
    var picked = cols.map(function (c) {
      var vals = [], now = null, changes = 0, numeric = true;
      rows.forEach(function (r) {
        if (r.cells[c] !== undefined) {
          var v = parseFloat(r.cells[c]);
          if (!/^-?\d+(\.\d+)?$/.test(String(r.cells[c]).trim())) { numeric = false; }
          else { now = v; changes++; }
        }
        vals.push(now);
      });
      return { name: c, values: vals, changes: changes, numeric: numeric };
    }).filter(function (s) { return s.numeric && s.changes >= 2; });
    if (!picked.length) { return; }
    picked.sort(function (a, b) { return b.changes - a.changes; });
    var holder = document.createElement("div");
    page.appendChild(holder);
    graphCard(holder, picked.slice(0, 4), null, false, "");
    holder.remove();
  }
