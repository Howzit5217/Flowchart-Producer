// ---------------------------------------------------------------------------
//  40-perf.js -- the 3D view kept smooth on whatever it runs on: how fast
//  each picture comes is watched, and what costs the most is eased off
//  until it comes sixty times a second, and given back when there is time
//  to spare.  Two sides of it, watched apart: the work done to make the
//  scene (how often it is made again, how often the sun's shadows are, how
//  near people are drawn in full, whether the making is spread over two
//  pictures) and the drawing itself (its resolution, its shadows).  A
//  phone starts low and works up; a fast desktop starts high.  What it
//  settles at is remembered for next time.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update this so the simulations in 3d no matter
  // what can run smoothly in the browser and older and new devices and mobile
  // devices at a stable 60fps in any condition for the most part")
  //
  // The making: `gap` the least time between one making of the scene and the
  // next (what moves on its own -- people, cars, a crane -- is made again
  // that often; the view turns every picture all the same); `shadowEvery`
  // how many pictures between drawing the sun's shadows of what moves;
  // `bodies` how much nearer people must be to be drawn in full (40-bodies.js);
  // `split` the scene made in one picture, put into its batches the next.
  var V3Q_CPU = [
    { gap: 95, shadowEvery: 12, bodies: 3, split: true },
    { gap: 62, shadowEvery: 8, bodies: 2.4, split: true },
    { gap: 45, shadowEvery: 4, bodies: 1.8, split: true },
    { gap: 30, shadowEvery: 2, bodies: 1.3, split: false },
    { gap: 0, shadowEvery: 1, bodies: 1, split: false }
  ];
  // The drawing: its pixels to a CSS pixel (the screen's own, up to `dprCap`,
  // times `scale`), and the sun's shadows or none.
  var V3Q_GPU = [
    { dprCap: 1, scale: 0.8, noShadow: true },
    { dprCap: 1, scale: 0.9 },
    { dprCap: 1.25, scale: 1 },
    { dprCap: 1.5, scale: 1 },
    { dprCap: 2, scale: 1 }
  ];
  var V3Q_KEY = "flowchart-3d-quality";
  var V3Q = { cpu: 3, gpu: 3, auto: true, win: [], bad: 0, good: 0, last: 0, drewAt: 0, vsync: 16.7, tried: null, ceil: { cpu: 9, gpu: 9 }, ceilAt: 0 };
  function v3qApply(cpu, gpu) {
    cpu = Math.max(0, Math.min(V3Q_CPU.length - 1, cpu)); gpu = Math.max(0, Math.min(V3Q_GPU.length - 1, gpu));
    var C = V3Q_CPU[cpu], D = V3Q_GPU[gpu];
    V3Q.cpu = cpu; V3Q.gpu = gpu; V3Q.name = "cpu" + cpu + "/gpu" + gpu;
    V3Q.gap = C.gap; V3Q.shadowEvery = C.shadowEvery; V3Q.bodies = C.bodies; V3Q.split = C.split;
    V3Q.dprCap = D.dprCap; V3Q.scale = D.scale; V3Q.noShadow = !!D.noShadow;
    V3Q.win = []; V3Q.bad = 0; V3Q.good = 0;
    if (typeof V3 !== "undefined" && V3) { V3.dirty = true; }
  }
  // where to start: what the device says it is, or what it settled at last time
  function v3qStart() {
    var kept = null;
    try { kept = JSON.parse(localStorage.getItem(V3Q_KEY) || "null"); } catch (e) { kept = null; }
    var phone = false, weak = false;
    try {
      phone = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 900);
      weak = !!((navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2));
    } catch (e) { phone = false; }
    var cpu = weak ? 1 : phone ? 2 : 3, gpu = weak ? 1 : phone ? 2 : 3;
    // (what it came down to last time, or one better: it is tried again from there)
    if (kept && typeof kept.cpu === "number") { cpu = Math.min(cpu + 1, kept.cpu + 1); gpu = Math.min(gpu + 1, kept.gpu + 1); }
    v3qApply(cpu, gpu);
  }
  function v3qKeep() {
    try { localStorage.setItem(V3Q_KEY, JSON.stringify({ cpu: V3Q.cpu, gpu: V3Q.gpu })); } catch (e) { /* not kept */ }
  }
  v3qStart();
  // the drawing's pixels a CSS pixel: the screen's own, up to what this level allows
  function v3RenderDpr() {
    var d = window.devicePixelRatio || 1;
    return Math.max(0.5, Math.min(d, V3Q.dprCap) * V3Q.scale);
  }
  // how far in people are drawn full (40-bodies.js)
  function v3qBodyScale() { return V3Q.bodies || 1; }
  // The scene made again: whenever what is looked at is asked to change (a
  // floor, the roof, walking into another room, a piece added ...) at once;
  // otherwise no sooner than `gap` after the last time -- the view still
  // moving every picture.  Made last picture and still to go into its
  // batches (split): not made again before it has.
  var v3qMarks = typeof WeakMap === "function" ? new WeakMap() : null, v3qMarkN = 0;
  function v3qEditMark() {
    if (typeof wasLike === "undefined" || !wasLike || !wasLike.length || !v3qMarks) { return 0; }
    var last = wasLike[wasLike.length - 1];
    if (!last || typeof last !== "object") { return wasLike.length; }
    var m = v3qMarks.get(last);
    if (m === undefined) { m = ++v3qMarkN; v3qMarks.set(last, m); }
    return m;
  }
  function v3PaceSig() {
    return [V3.mode, V3.upTo, V3.low ? 1 : 0, V3.flat ? 1 : 0, V3.flatDone ? 1 : 0, V3.roof ? 1 : 0, V3.labels ? 1 : 0,
            V3.inRoom ? V3.inRoom.id : "", V3.myLevel, hand.nodes.length, hand.links ? hand.links.length : 0,
            v3qEditMark(),
            V3.scene, V3.xrayShow || "", V3.carry ? 1 : 0, V3.sel || "", V3.flightUp === undefined ? "" : V3.flightUp].join("|");
  }
  // (the gap, and never less than three times what making the scene and putting it into its
  // batches has been taking: a big building on a slow phone was made again every other picture,
  // the making longer than the gap -- the view turned at thirteen pictures a second)
  function v3qGapNow() {
    if (!V3Q.gap) { return 0; }
    var batch = typeof V3 !== "undefined" && V3 && V3.gl && V3.gl.batchCost ? V3.gl.batchCost : 0;
    return Math.min(400, Math.max(V3Q.gap, 3 * ((V3Q.costMs || 0) + batch)));
  }
  function v3BuildPaced() {
    var now = performance.now(), sig = v3PaceSig(), K = V3.paced, G = V3.gl;
    if (K && K.sig === sig && K.model) {
      if (G && G.pending === K.model) { return K.model; }
      // (what asked for this picture -- a setting, a piece's color -- made in once the gap is up: v3Watch below)
      if (V3Q.gap && now - K.at < v3qGapNow()) { V3Q.owed = true; return K.model; }
    }
    V3Q.owed = false;
    var tb = performance.now(), m = v3Build();
    V3Q.buildMs = performance.now() - tb;      // (how long the making took: for measuring)
    V3Q.costMs = V3Q.costMs ? V3Q.costMs * 0.7 + V3Q.buildMs * 0.3 : V3Q.buildMs;
    // (whether its batches may wait a picture: the same way of looking as the last, only later)
    if (m && typeof m === "object") { m.pacedSame = !!(K && K.sig === sig); }
    V3.paced = { model: m, sig: sig, at: now };
    return m;
  }
  // How each picture is going: measured while pictures come one after another
  // (a hidden page gets no frames to measure -- not counted)
  if (typeof v3Draw === "function") {
    var v3DrawPerf = v3Draw;
    v3Draw = function () {
      V3Q.drewAt = performance.now();
      return v3DrawPerf.apply(this, arguments);
    };
  }
  if (typeof v3Watch === "function") {
    var v3WatchPerf = v3Watch;
    v3Watch = function () {
      var t = performance.now(), drewLast = V3Q.drewAt && V3Q.drewAt >= V3Q.last && V3Q.last > 0, iv = t - V3Q.last;
      V3Q.last = t;
      if (drewLast && document.visibilityState === "visible" && iv < 400 && V3) { v3qMeasure(iv, V3.drawMs || 0); }
      // a scene made and waiting for its batches, or one not made again yet that was asked for: another picture
      if (V3 && ((V3.gl && V3.gl.pending) || (V3Q.owed && V3.paced && t - V3.paced.at >= v3qGapNow()))) { V3.dirty = true; }
      return v3WatchPerf.apply(this, arguments);
    };
  }
  // A second's pictures at a time: slow (pictures late, or coming slower
  // than they should), and whether it is the making (the script's own time
  // a picture) or the drawing; then a step down on that side.  A good while
  // smooth: a step up -- the making where it has time to spare, else the
  // drawing tried one finer, and stepped back (not tried again for a minute)
  // if that is too much.
  function v3qMeasure(iv, cpuMs) {
    var W = V3Q.win;
    W.push([iv, cpuMs]);
    if (W.length < 60) { return; }
    V3Q.win = [];
    if (!V3Q.auto) { return; }
    var ivs = W.map(function (w) { return w[0]; }).sort(function (a, b) { return a - b; });
    var cpus = W.map(function (w) { return w[1]; }).sort(function (a, b) { return a - b; });
    var med = ivs[30], p90cpu = cpus[54], avgCpu = 0, avgIv = 0, late = 0;
    for (var i = 0; i < W.length; i++) { avgIv += W[i][0] / W.length; avgCpu += W[i][1] / W.length; }
    // (the screen's own pace: the quickest a second's middle picture has come)
    V3Q.vsync = Math.max(4, Math.min(V3Q.vsync, med));
    var budget = Math.max(16.7, V3Q.vsync), lateAt = Math.max(24, V3Q.vsync * 1.45);
    for (var j = 0; j < W.length; j++) { if (W[j][0] > lateAt) { late++; } }
    var now = performance.now(), bad = late > 5 || avgIv > Math.max(19.5, V3Q.vsync * 1.2), good = late <= 1 && avgIv < Math.max(18, V3Q.vsync * 1.1);
    V3Q.stats = { avgIv: Math.round(avgIv * 10) / 10, late: late, avgCpu: Math.round(avgCpu * 10) / 10, p90cpu: Math.round(p90cpu * 10) / 10, vsync: V3Q.vsync };
    if (bad) {
      V3Q.good = 0; V3Q.bad++;
      // (once a second's worth for a hiccup -- a scene opening, a pause to tidy memory -- not at once)
      if (V3Q.bad < 2 && avgIv < 40) { return; }
      V3Q.bad = 0;
      var making = p90cpu > budget * 0.8 || avgCpu > avgIv * 0.5;
      // (a step up just tried, and too much: back, and not tried again for a while)
      var tried = V3Q.tried && now - V3Q.tried.at < 4000 ? V3Q.tried.side : null;
      V3Q.tried = null;
      if (tried) { V3Q.ceil[tried] = V3Q[tried] - 1; V3Q.ceilAt = now; }
      if (tried === "cpu") { v3qApply(V3Q.cpu - 1, V3Q.gpu); }
      else if (tried === "gpu") { v3qApply(V3Q.cpu, V3Q.gpu - 1); }
      else if (making && V3Q.cpu > 0) { v3qApply(V3Q.cpu - 1, V3Q.gpu); }
      // (the making slow, and as low as it goes: a coarser picture would not help it)
      else if (making) { return; }
      else if (V3Q.gpu > 0) { v3qApply(V3Q.cpu, V3Q.gpu - 1); }
      else if (V3Q.cpu > 0) { v3qApply(V3Q.cpu - 1, V3Q.gpu); }
      else { return; }
      v3qKeep();
      return;
    }
    V3Q.bad = 0;
    if (!good) { V3Q.good = Math.max(0, V3Q.good - 1); return; }
    if (++V3Q.good < 8) { return; }
    V3Q.good = 0;
    if (now - V3Q.ceilAt > 60000) { V3Q.ceil = { cpu: 9, gpu: 9 }; }
    if (V3Q.cpu < V3Q_CPU.length - 1 && V3Q.cpu < V3Q.ceil.cpu && p90cpu < budget * 0.45) { V3Q.tried = { side: "cpu", at: now }; v3qApply(V3Q.cpu + 1, V3Q.gpu); v3qKeep(); }
    else if (V3Q.gpu < V3Q_GPU.length - 1 && V3Q.gpu < V3Q.ceil.gpu) { V3Q.tried = { side: "gpu", at: now }; v3qApply(V3Q.cpu, V3Q.gpu + 1); v3qKeep(); }
  }
