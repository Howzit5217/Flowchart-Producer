// ---------------------------------------------------------------------------
//  39-circuit.js -- a circuit, worked out and switched on
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ============================================================ circuits ==
  // A battery, bulbs, a switch, joined up with arrows for wires, is run by
  // switching it on: the circuit is worked out the way a physics lesson
  // works it out -- Ohm's law at every part, Kirchhoff's at every join
  // (nodal analysis, solved as one set of equations) -- and then shown:
  // current going round the wires as a stream of dots, as fast as there is
  // current, bulbs lit as bright as they are, a motor turning, a buzzer
  // buzzing.  A switch pressed while it runs opens or closes, and it is
  // all worked out again.
  //
  // Every part has two ends.  A wire drawn out of a part leaves from its
  // second end and one drawn into it arrives at its first, so a battery's
  // + is the end its arrows leave from; a part with one wire in and one
  // out, or two the same way, has one on each end, whichever way they
  // were drawn.  Anything else the wires meet -- a box, a dot -- is a join.
  // Values come from the words: "9 V" on a battery, "220 Ω" or "4.7k" on a
  // resistor; a switch that says "off" or "open" starts open.
  var CIRCUIT_PARTS = {
    i_battery:  { source: 9, inner: 0.3 },
    i_solar:    { source: 5, inner: 12 },
    i_socket:   { source: 120, inner: 0.5 },
    i_resistor: { ohms: 100 },
    i_bulb:     { ohms: 30, light: 2.7 },        // lit full at 2.7 W
    i_led:      { diode: 2, ohms: 25, light: 0.06 },
    i_motor:    { ohms: 10, turn: 0.9 },
    i_buzzer:   { ohms: 40, buzz: 0.1 },
    i_capacitor: { open: true },
    i_switch_on: { swtch: true },
    // (added 2026-10-01) one cell; a diode that lets current one way only;
    // a fuse that melts past its amps ("2 A") and opens the circuit; a meter
    // of current, put in the wire, and one of volts, put across a part; and
    // a dimmer, a resistance its words set like a resistor's
    i_cell:      { source: 1.5, inner: 0.2 },
    i_diode:     { diode: 0.7, ohms: 0.5 },
    i_fuse:      { ohms: 0.05, fuse: 2 },
    i_ammeter:   { ohms: 0.01, meter: "a" },
    i_voltmeter: { ohms: 1e7, meter: "v" },
    i_dimmer:    { ohms: 50, valued: true }
  };
  var SHORT_AMPS = 15;                   // past this, it is a short circuit
  var circuitOpen = {};                  // switches opened while it runs
  var circuitBlown = {};                 // fuses melted while it runs

  // A number from the words on a part, with k (thousand), M (million) or
  // m (thousandth) after it.
  function circuitValue(text, fallback) {
    var m = /(-?\d+(?:[.,]\d+)?)\s*([kKMm]?)/.exec(String(text || ""));
    if (!m) { return fallback; }
    var v = parseFloat(m[1].replace(",", "."));
    if (m[2] === "k" || m[2] === "K") { v *= 1e3; }
    else if (m[2] === "M") { v *= 1e6; }
    else if (m[2] === "m") { v *= 1e-3; }
    return isFinite(v) && v > 0 ? v : fallback;
  }

  var OFF_WORDS = /\b(off|open|aus|offen|apagado|abierto|éteint|eteint|ouvert)\b/i;
  function switchShut(n) {
    if (circuitOpen[n.id] !== undefined) { return !circuitOpen[n.id]; }
    return !OFF_WORDS.test(String(n.text || ""));
  }

  // ---- the circuit, read -----------------------------------------------------
  function circuitRead() {
    var parts = [], byId = {}, ends = {};
    hand.nodes.forEach(function (n) {
      ends[n.id] = [];
      if (CIRCUIT_PARTS[n.kind]) { byId[n.id] = parts.length; parts.push({ n: n, is: CIRCUIT_PARTS[n.kind] }); }
    });
    hand.links.forEach(function (l, k) {
      if (ends[l.from]) { ends[l.from].push({ link: k, out: true }); }
      if (ends[l.to]) { ends[l.to].push({ link: k, out: false }); }
    });
    // each end of each wire, to a terminal: a part's first (0) or second
    // (1) end, or a join's only one
    var term = {}, count = 0, joinAt = {}, ground = -1;
    function key(link, out) { return link + (out ? "o" : "i"); }
    hand.nodes.forEach(function (n) {
      var list = ends[n.id];
      if (byId[n.id] === undefined) {
        // a join: every wire meeting it on one terminal; all grounds are one
        var t;
        if (n.kind === "i_ground") { if (ground < 0) { ground = count++; } t = ground; }
        else { t = count++; }
        joinAt[n.id] = t;
        list.forEach(function (e) { term[key(e.link, e.out)] = t; });
        return;
      }
      var p = parts[byId[n.id]];
      p.a = count++; p.b = count++;
      p.wires = list.length;
      var outs = list.filter(function (e) { return e.out; }), ins = list.filter(function (e) { return !e.out; });
      if (list.length === 2 && (outs.length === 2 || ins.length === 2)) {
        term[key(list[0].link, list[0].out)] = p.a;
        term[key(list[1].link, list[1].out)] = p.b;
      } else {
        list.forEach(function (e) { term[key(e.link, e.out)] = e.out ? p.b : p.a; });
      }
    });
    // terminals joined by wires are one point in the circuit
    var up = [];
    for (var i = 0; i < count; i++) { up.push(i); }
    function top(i) { while (up[i] !== i) { up[i] = up[up[i]]; i = up[i]; } return i; }
    hand.links.forEach(function (l, k) {
      var a = term[key(k, true)], b = term[key(k, false)];
      if (a !== undefined && b !== undefined) { up[top(a)] = top(b); }
    });
    var point = {}, points = 0;
    for (var j = 0; j < count; j++) { if (point[top(j)] === undefined) { point[top(j)] = points++; } }
    function at(t) { return point[top(t)]; }
    parts.forEach(function (p) { p.pa = at(p.a); p.pb = at(p.b); });
    return { parts: parts, points: points, ground: ground >= 0 ? at(ground) : -1, term: term, key: key, at: at };
  }

  // ---- worked out ---------------------------------------------------------------
  // Nodal analysis: a conductance between points for every resistance,
  // and for every source a current of its own to be found, then all of it
  // solved at once.  A diode is a source of its own voltage while it
  // conducts and nothing while it does not, so the sum is done again with
  // each one that came out backwards left out.
  function circuitSolve(c) {
    var sources = c.parts.filter(function (p) { return p.is.source; });
    if (!sources.length) { return { none: true, parts: c.parts }; }
    var ref = sources[0].pa;             // the first battery's minus is nought volts
    var off = {};
    for (var round = 0; round < 4; round++) {
      var live = [], vsrc = [];
      c.parts.forEach(function (p) {
        p.amps = 0; p.volts = 0;
        if (p.wires < 2 || p.pa === p.pb && !p.is.source) { return; }
        if (p.is.open) { return; }
        if (p.is.swtch) { if (switchShut(p.n)) { live.push({ p: p, g: 1 / 0.01 }); } return; }
        if (p.is.fuse && circuitBlown[p.n.id]) { return; }
        if (p.is.source) { vsrc.push({ p: p, v: circuitValue(p.n.text, p.is.source), r: p.is.inner }); return; }
        if (p.is.diode) {
          if (off[p.n.id]) { return; }
          vsrc.push({ p: p, v: -p.is.diode, r: p.is.ohms, diode: true });
          return;
        }
        var ohms = p.n.kind === "i_resistor" || p.is.valued ? circuitValue(p.n.text, p.is.ohms) : p.is.ohms;
        live.push({ p: p, g: 1 / Math.max(1e-6, ohms) });
      });
      // unknowns: every point but the reference, then every source's current
      var idx = {}, n = 0;
      for (var k = 0; k < c.points; k++) { if (k !== ref) { idx[k] = n++; } }
      var size = n + vsrc.length;
      var A = [], z = [];
      for (var r = 0; r < size; r++) { A.push(new Float64Array(size)); z.push(0); }
      for (var q = 0; q < n; q++) { A[q][q] += 1e-9; }     // a point joined to nothing floats
      function stamp(a, b, g) {
        if (a !== ref) { A[idx[a]][idx[a]] += g; }
        if (b !== ref) { A[idx[b]][idx[b]] += g; }
        if (a !== ref && b !== ref) { A[idx[a]][idx[b]] -= g; A[idx[b]][idx[a]] -= g; }
      }
      live.forEach(function (e) { stamp(e.p.pa, e.p.pb, e.g); });
      vsrc.forEach(function (s, m) {
        // a source in series with its own resistance: its plus end (b) is v
        // above its minus end (a), less what the resistance takes
        var row = n + m;
        if (s.p.pb !== ref) { A[idx[s.p.pb]][row] += 1; A[row][idx[s.p.pb]] += 1; }
        if (s.p.pa !== ref) { A[idx[s.p.pa]][row] -= 1; A[row][idx[s.p.pa]] -= 1; }
        A[row][row] -= s.r;
        z[row] = s.v;
      });
      var x = circuitGauss(A, z);
      if (!x) { return { none: true, parts: c.parts }; }
      function volts(pt) { return pt === ref ? 0 : x[idx[pt]]; }
      var again = false;
      live.forEach(function (e) {
        e.p.volts = volts(e.p.pa) - volts(e.p.pb);
        e.p.amps = e.p.volts * e.g;                  // from its first end to its second
        // more through a fuse than it is made for: it melts, and the sum
        // is done again without it
        if (e.p.is.fuse && Math.abs(e.p.amps) > circuitValue(e.p.n.text, e.p.is.fuse)) {
          circuitBlown[e.p.n.id] = true; again = true;
        }
      });
      vsrc.forEach(function (s, m) {
        // the current out of the plus end, round, and back in at the minus
        // (x is the current through it from its plus end to its minus,
        // so the current going through it from first end to second -- out
        // of a battery's plus -- is the other way)
        s.p.amps = -x[n + m];
        s.p.volts = volts(s.p.pb) - volts(s.p.pa);
        if (s.diode && s.p.amps < -1e-6) { off[s.p.n.id] = true; s.p.amps = 0; again = true; }
      });
      if (!again) { break; }
    }
    var biggest = 0;
    sources.forEach(function (s) { biggest = Math.max(biggest, Math.abs(s.amps)); });
    return { parts: c.parts, short: biggest > SHORT_AMPS, flows: biggest > 1e-6 };
  }

  function circuitGauss(A, z) {
    var n = z.length, M = A.map(function (row, i) { var r = Array.prototype.slice.call(row); r.push(z[i]); return r; });
    for (var col = 0; col < n; col++) {
      var best = col;
      for (var r = col + 1; r < n; r++) { if (Math.abs(M[r][col]) > Math.abs(M[best][col])) { best = r; } }
      if (Math.abs(M[best][col]) < 1e-12) { return null; }
      var tmp = M[col]; M[col] = M[best]; M[best] = tmp;
      for (var r2 = 0; r2 < n; r2++) {
        if (r2 === col) { continue; }
        var f = M[r2][col] / M[col][col];
        if (!f) { continue; }
        for (var k = col; k <= n; k++) { M[r2][k] -= f * M[col][k]; }
      }
    }
    return M.map(function (row, i) { return row[n] / row[i]; });
  }

  // What a part is called in what is said: its words, unless all they
  // say is its value ("9 V"), when it is called what it is.
  var JUST_VALUE = /^\s*-?\d+(?:[.,]\d+)?\s*[kKMm]?\s*(?:v|volts?|Ω|ohms?|w|watts?)?\s*$/i;
  function partName(n) {
    return JUST_VALUE.test(String(n.text || "")) ? kindName(n.kind) : simName(n);
  }

  function amps(v) {
    var a = Math.abs(v);
    return a >= 1 ? a.toFixed(2) + " A" : (a * 1000).toFixed(a * 1000 >= 10 ? 0 : 1) + " mA";
  }

  // ---- shown ----------------------------------------------------------------------
  async function circuitRun() {
    circuitOpen = {};
    circuitBlown = {};
    var c = circuitRead();
    if (!c.parts.some(function (p) { return p.is.source; })) { simSay(TXT.ec_no_source, "warn"); return; }
    var solved = null, flows = [], marks = {};
    function workOut(saying) {
      solved = circuitSolve(c);
      // A stream of dots along every wire there is current in.  A wire
      // carries the current of the part whose end it alone is joined to
      // -- out of a part's second end as much as goes through it forwards
      // -- and where both its ends are shared, it is left dark.
      flows.forEach(function (f) { simDrop(f.g); });
      flows = [];
      var onEnd = {}, partOf = {};
      Object.keys(c.term).forEach(function (k) { onEnd[c.term[k]] = (onEnd[c.term[k]] || 0) + 1; });
      c.parts.forEach(function (p) { partOf[p.n.id] = p; });
      hand.links.forEach(function (l, k) {
        var tf = c.term[c.key(k, true)], tt = c.term[c.key(k, false)];
        var pf = partOf[l.from], pt = partOf[l.to], along = null;
        if (pf && onEnd[tf] === 1) { along = tf === pf.b ? pf.amps : -pf.amps; }
        else if (pt && onEnd[tt] === 1) { along = tt === pt.a ? pt.amps : -pt.amps; }
        if (along === null || Math.abs(along) < 1e-5) { return; }
        var pts = simRoute(l);
        if (along < 0) { pts = pts.slice().reverse(); }
        var len = simLength(pts), dots = Math.max(2, Math.floor(len / 18)), out = "";
        for (var d = 0; d < dots; d++) { out += '<circle r="2.4" fill="' + simInk() + '"/>'; }
        var g = simAdd(out, "sim-current");
        flows.push({ g: g, pts: pts, len: len, speed: Math.min(240, 30 + Math.abs(along) * 260), t: 0 });
      });
      // the parts: lit, turning, buzzing -- or not
      c.parts.forEach(function (p) {
        var n = p.n, mark = marks[n.id];
        if (mark) { simDrop(mark.g); delete marks[n.id]; }
        var watts = Math.abs(p.amps * p.volts), on = Math.abs(p.amps) > 1e-4;
        if (p.is.light && on) {
          var bright = Math.min(1, watts / p.is.light);
          simLight(n.id, bright > 0.15 ? "now" : null);
          var r = Math.max(turned(n).w, turned(n).h) * 0.42, rays = "";
          for (var k = 0; k < 8; k++) {
            var t = k * Math.PI / 4;
            rays += "M" + (Math.cos(t) * r).toFixed(1) + " " + (Math.sin(t) * r).toFixed(1) +
                    " L" + (Math.cos(t) * r * 1.35).toFixed(1) + " " + (Math.sin(t) * r * 1.35).toFixed(1);
          }
          var at = iconFrame(n.kind, n.x, n.y, n.w, n.h, shownLines(n), handType(n).line);
          marks[n.id] = { g: simAdd('<path d="' + rays + '" stroke="' + simInk() + '" stroke-width="1.6" opacity="' +
                                    (0.25 + bright * 0.75).toFixed(2) + '"/>', "sim-rays") };
          simPut(marks[n.id].g, at.ox + 24 * at.sx, at.oy + 17 * at.sy);
        } else if (p.is.turn && on) {
          simLight(n.id, "now");
          marks[n.id] = { g: simAdd('<path d="M-9 -9 A12.7 12.7 0 0 1 9 -9 M9 -9 l-4 -1 M9 -9 l-1 4" fill="none" stroke="' +
                                    simInk() + '" stroke-width="1.6"/>', "sim-turn"), spin: Math.abs(p.amps) * 600 };
          marks[n.id].a = 0;
        } else if (p.is.buzz && on) {
          simLight(n.id, "now");
          marks[n.id] = { g: null, buzz: true };
        } else if (!p.is.source) {
          simLight(n.id, null);
        }
      });
      if (saying) { circuitSays(solved); }
    }
    workOut(true);
    // A switch pressed while it runs: opened or closed, and worked out again.
    var stage = el("#stage");
    function press(ev) {
      var g = ev.target.closest && ev.target.closest(".node");
      var n = g && nodeById(+String(g.dataset.i).replace(/^h/, ""));
      if (!n || n.kind !== "i_switch_on" || !simNow) { return; }
      ev.preventDefault();
      ev.stopPropagation();
      circuitOpen[n.id] = switchShut(n);
      simSay(say(circuitOpen[n.id] ? "ec_opened" : "ec_closed", { who: partName(n) }));
      workOut(true);
    }
    if (stage) { stage.addEventListener("pointerdown", press, true); }
    simNow.ending = function () {
      if (stage) { stage.removeEventListener("pointerdown", press, true); }
      circuitOpen = {};
    };
    simSay(TXT.ec_press);
    var buzzed = 0;
    await simLoop(function (dt, secs) {
      flows.forEach(function (f) {
        f.t = (f.t + dt * f.speed) % 18;
        var kids = f.g ? f.g.childNodes : [];
        for (var i = 0; i < kids.length; i++) {
          var p = simAlong(f.pts, ((i * 18 + f.t) % f.len) / f.len);
          kids[i].setAttribute("cx", p.x.toFixed(1));
          kids[i].setAttribute("cy", p.y.toFixed(1));
        }
      });
      Object.keys(marks).forEach(function (id) {
        var m = marks[id], n = nodeById(+id);
        if (!n) { return; }
        if (m.spin) {
          m.a = (m.a + dt * m.spin) % 360;
          var at = iconFrame(n.kind, n.x, n.y, n.w, n.h, shownLines(n), handType(n).line);
          simPut(m.g, at.ox + 24 * at.sx, at.oy + 24 * at.sy, m.a);
        }
        if (m.buzz && secs - buzzed > 0.9) {
          buzzed = secs;
          simBubble(n.x, n.y - turned(n).h / 2, TXT.ec_buzz, 600);
        }
      });
      return !simFast();                 // All at once: worked out, said, and done
    });
  }

  function circuitSays(solved) {
    if (solved.none) { simSay(TXT.ec_no_source, "warn"); return; }
    if (solved.short) { simSay(TXT.ec_short, "bad"); }
    else if (!solved.flows) { simSay(TXT.ec_open, "warn"); }
    solved.parts.forEach(function (p) {
      var on = Math.abs(p.amps) > 1e-4, who = partName(p.n);
      if (p.is.source) {
        simSay(say("ec_source", { who: who, v: circuitValue(p.n.text, p.is.source), a: amps(p.amps) }));
      } else if (p.is.light) {
        var watts = Math.abs(p.amps * p.volts);
        simSay(say(!on ? "ec_dark" : watts > p.is.light * 4 ? "ec_too_bright" :
                   watts < p.is.light * 0.15 ? "ec_dim" : "ec_lit",
                   { who: who, a: amps(p.amps) }), on ? "good" : "");
      } else if (p.is.turn) {
        simSay(say(on ? "ec_turns" : "ec_still", { who: who, a: amps(p.amps) }));
      } else if (p.is.buzz) {
        simSay(say(on ? "ec_buzzes" : "ec_quiet", { who: who, a: amps(p.amps) }));
      } else if (p.is.swtch) {
        simSay(say(switchShut(p.n) ? "ec_closed" : "ec_opened", { who: who }));
      } else if (p.is.fuse) {
        simSay(say(circuitBlown[p.n.id] ? "ec_blown" : "ec_fuse_ok", { who: who, a: amps(p.amps) }),
               circuitBlown[p.n.id] ? "bad" : "");
      } else if (p.is.meter) {
        simSay(p.is.meter === "v" ? say("ec_reads_v", { who: who, v: Math.abs(p.volts).toFixed(2) })
                                  : say("ec_reads_a", { who: who, a: amps(p.amps) }));
      } else if (p.is.diode) {
        simSay(say(on ? "ec_conducts" : "ec_blocks", { who: who, a: amps(p.amps) }));
      } else if ((p.n.kind === "i_resistor" || p.is.valued) && on) {
        simSay(say("ec_drop", { who: who, v: Math.abs(p.volts).toFixed(2), a: amps(p.amps) }));
      }
    });
  }

  function circuitCheck() {
    circuitBlown = {};
    var c = circuitRead(), found = [];
    if (!c.parts.some(function (p) { return p.is.source; })) { found.push({ text: TXT.ec_no_source }); }
    c.parts.forEach(function (p) {
      if (p.wires < 2) { found.push({ text: say("ec_loose", { who: partName(p.n) }), id: p.n.id }); }
    });
    var solved = circuitSolve(c);
    if (solved.short) { found.push({ text: TXT.ec_short, warn: false }); }
    return found;
  }
  function circuitSum() {
    var c = circuitRead();
    return say("ec_sum", { parts: c.parts.length, wires: hand.links.length });
  }

  SCENES.circuit = { run: circuitRun, check: circuitCheck, sum: circuitSum };
