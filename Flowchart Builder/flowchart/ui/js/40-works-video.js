// ---------------------------------------------------------------------------
//  40-works-video.js -- the building site played like a video: a bar along
//  the foot of the 3D view with the time gone and how long the whole of it
//  takes, its chapters (the jobs), dragged or clicked to go back or on,
//  paused and played
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "make it like a video so there is a video progress
  // bar with a time on the end for how long it will take and you can skip a
  // head or go back to a portion of the video")
  //
  // The site's clock is the building's start and length (bpSite.start, .ms:
  // 40-blueprint.js), and everything on the site is worked out from the time
  // it gives each picture (40-works.js) -- so going back is putting the start
  // later, going on putting it earlier, and paused, keeping it where it was
  // each picture.  Its length is as long as it takes at the speed chosen (the
  // speed buttons: 40-works.js), so the time at the end follows them.  The
  // chapters are the jobs (plan.say), put on the site's clock through its
  // calendar (40-works-day.js).  Held while the site is still getting ready
  // (40-works-gate.js); once the building is done, a click on the bar watches
  // it again from there.
  var WV_STEP = 5;                       // s of the video an arrow key moves
  var WV_END = 0.9985;                   // as far on as a seek goes (all the way is the end: the building done)
  var WV_KEEP = 12000;                   // ms the bar stays once it has played to its end
  var WV_ICONS = {
    play: '<path d="M3.2 1.9 10.4 6 3.2 10.1z"/>',
    pause: '<path d="M2.8 2h2.3v8H2.8zM6.9 2h2.3v8H6.9z"/>',
    again: '<path d="M2.4 6a3.6 3.6 0 1 0 1.1-2.6" fill="none"/><path d="M1.9 1.6v2.6h2.6"/>'
  };
  var wvNow = null;                      // the bar showing: { me (its bpSite), box, root, ... }
  var wvPending = null;                  // where to go once a building watched again is ready (0..1)

  function wvPlanOf(me) { var p = typeof WK === "object" && WK ? WK.plan : null; return p && p.bp === me ? p : null; }
  // still getting ready: no timetable yet (the site's), or it held at its start (40-works-gate.js)
  function wvHeld(me) {
    if (!me || !me.ms || !isFinite(me.start)) { return true; }
    if (typeof wgHolding === "function") { try { if (wgHolding()) { return true; } } catch (e) { /* not held */ } }
    var plan = wvPlanOf(me);
    return me.wk ? !plan || (!plan.done && plan.ok !== false) : false;
  }
  function wvFrac(me) { return Math.max(0, Math.min(1, bpFracOf(me))); }
  // (2026-10-05: "the time to be formatted in the d h m s format") -- 1d 2h 3m 4s, from the
  // biggest unit there is down to the seconds; a unit in between kept at nought (1h 0m 5s)
  function wvTime(sec) {
    sec = Math.max(0, Math.round(sec));
    var U = String(TXT.wv_units || "d h m s").split(" "), parts = [sec / 86400, (sec % 86400) / 3600, (sec % 3600) / 60, sec % 60].map(Math.floor), out = [];
    for (var i = 0; i < 4; i++) { if (parts[i] || out.length || i === 3) { out.push(parts[i] + (U[i] || "")); } }
    return out.join(" ");
  }
  // the site's clock at a moment of the work, and back (the calendar's, or the same)
  function wvShowOf(plan, w) {
    var J = typeof jcOf === "function" ? jcOf(plan) : null;
    if (!J || !J.segs.length) { return w; }
    var segs = J.segs, lo = 0, hi = segs.length - 1;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (segs[mid].w1 >= w) { hi = mid; } else { lo = mid + 1; } }
    while (lo < segs.length - 1 && segs[lo].w1 <= segs[lo].w0) { lo++; }
    var g = segs[lo];
    return g.s0 + (g.s1 - g.s0) * Math.max(0, Math.min(1, g.w1 > g.w0 ? (w - g.w0) / (g.w1 - g.w0) : 0));
  }
  // what is being done at a share of the way, the day and the date then
  function wvAt(me, f) {
    var plan = wvPlanOf(me), out = { what: "", day: "" };
    if (!plan || !plan.done || !me.T) { return out; }
    var s = f * me.T, w = typeof wkCalWork === "function" ? wkCalWork(s, plan) : s;
    out.what = typeof wkPhaseAt === "function" ? wkPhaseAt(plan, w) : "";
    var J = typeof jcOf === "function" ? jcOf(plan) : null, a = J && typeof jcAt === "function" ? jcAt(J, s) : null;
    if (a) {
      var date = new Date(J.start.getTime() + jcCal(a) * 1000), loc = typeof jcLocale === "function" ? jcLocale() : "en-US";
      out.day = say("jc_day", { n: a.seg.day, d: J.D }) + " · " + date.toLocaleDateString(loc, { weekday: "short", month: "short", day: "numeric" });
    }
    return out;
  }
  // the chapters: where each job begins (the first of each), close ones as one
  function wvChapters(me) {
    var plan = wvPlanOf(me);
    if (!plan || !plan.done || !me.T || !plan.say) { return []; }
    var seen = {}, out = [];
    plan.say.slice().sort(function (a, b) { return a.t0 - b.t0; }).forEach(function (q) {
      if (seen[q.key] || !TXT[q.key]) { return; }
      seen[q.key] = true;
      var f = wvShowOf(plan, q.t0) / me.T;
      if (f <= 0.004 || f >= 0.996) { return; }
      if (out.length && f - out[out.length - 1].f < 0.008) { return; }
      out.push({ f: f, key: q.key });
    });
    return out;
  }

  // ---- going to a place in it -------------------------------------------------------------------------
  function wvSeek(f) {
    var W = wvNow, me = W && W.me;
    if (!me || bpSite !== me || wvHeld(me)) { return; }
    f = Math.max(0, Math.min(WV_END, f));
    me.start = performance.now() - f * me.ms;
    if (W.paused) { W.at = f; me.heldAt = f; }
    if (V3) { V3.dirty = true; }
    wvShow(W, true);
  }
  function wvPlay(on) {
    var W = wvNow, me = W && W.me;
    if (!W) { return; }
    if (W.ended) { wvAgain(0); return; }
    if (!me || bpSite !== me || wvHeld(me)) { return; }
    W.paused = !on;
    if (W.paused) { W.at = Math.min(WV_END, wvFrac(me)); me.heldAt = W.at; }
    else {
      // (played on from the very place it was held: 40-blueprint.js bpFracOf)
      me.heldAt = undefined; me.start = performance.now() - W.at * me.ms;
      if (W.at >= WV_END - 1e-4) { W.at = 0; me.start = performance.now(); }       // (played from the start again)
    }
    wvShow(W, true);
  }
  // Done: the building watched again (40-blueprint.js's Watch), from where the bar was clicked.
  function wvAgain(f) {
    if (typeof bpWatch !== "function") { return; }
    wvPending = f > 0.002 ? Math.min(WV_END, f) : null;
    bpWatch();
  }

  // ---- the bar --------------------------------------------------------------------------------------
  function wvBar(box) {
    var root = document.createElement("div");
    root.className = "v3-vid";
    root.innerHTML =
      '<button type="button" class="wv-play"><svg viewBox="0 0 12 12" aria-hidden="true"></svg></button>' +
      '<div class="wv-track" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100">' +
        '<div class="wv-rail"><div class="wv-fill"></div><div class="wv-hover"></div></div><div class="wv-marks"></div><div class="wv-knob"></div>' +
        '<div class="wv-tip" hidden><b class="wv-tip-what"></b><span class="wv-tip-day"></span><span class="wv-tip-time"></span></div>' +
      '</div>' +
      '<span class="wv-time" aria-hidden="true"><span class="wv-gone">0s</span><span class="wv-of"> / </span><span class="wv-all">–</span></span>';
    box.appendChild(root);
    return root;
  }
  function wvStart(me) {
    var box = V3 && V3.box;
    if (!box || !me) { return; }
    wvStop();
    var root = wvBar(box), W = { me: me, box: box, root: root, paused: false, at: 0, ended: false, chapters: null, last: {} };
    W.play = el(".wv-play", root); W.track = el(".wv-track", root); W.fill = el(".wv-fill", root); W.knob = el(".wv-knob", root);
    W.hover = el(".wv-hover", root); W.marks = el(".wv-marks", root); W.tip = el(".wv-tip", root);
    W.gone = el(".wv-gone", root); W.all = el(".wv-all", root);
    W.track.setAttribute("aria-label", TXT.wv_bar);
    W.track.title = "";
    wvNow = W;
    W.play.onclick = function (ev) { ev.stopPropagation(); wvPlay(W.paused || W.ended); };
    wvDrag(W);
    wvKeys(W);
    wvShow(W, true);
    (function tick() {
      if (wvNow !== W || !V3 || V3.box !== box || !root.isConnected) { if (wvNow === W) { wvStop(); } return; }
      if (!W.ended) {
        if (bpSite !== me) {
          // finished: played to its end, the bar kept a while to watch it again from; skipped or shut, gone
          if ((W.last.f || 0) >= 0.97) { wvEnd(W); } else { wvStop(); return; }
        } else {
          if (W.paused && !wvHeld(me)) { me.start = performance.now() - W.at * me.ms; me.heldAt = W.at; }
          else if (me.heldAt !== undefined) { me.heldAt = undefined; }
          if (wvPending !== null && !wvHeld(me)) {
            var go = wvPending; wvPending = null; wvSeek(go);
          }
          wvShow(W, false);
        }
      }
      requestAnimationFrame(tick);
    })();
  }
  function wvEnd(W) {
    W.ended = true; W.paused = false;
    W.root.classList.add("wv-ended");
    wvShow(W, true);
    // (gone after a while -- not from under the pointer)
    W.endTimer = setTimeout(function () {
      if (wvNow !== W) { return; }
      if (W.root.matches(":hover, :focus-within")) { W.root.addEventListener("pointerleave", function () { if (wvNow === W) { wvStop(); } }, { once: true }); }
      else { wvStop(); }
    }, WV_KEEP);
  }
  function wvStop() {
    var W = wvNow;
    wvNow = null;
    if (!W) { return; }
    clearTimeout(W.endTimer);
    if (W.root && W.root.parentNode) { W.root.remove(); }
  }
  // Shown as it is: how far, the time gone and the whole, the chapters once known, the buttons.
  function wvShow(W, force) {
    var me = W.me, held = W.ended ? false : wvHeld(me), f = W.ended ? 1 : held ? 0 : W.paused ? W.at : wvFrac(me);
    var total = me && me.ms ? me.ms / 1000 : 0, L = W.last;
    // room for Skip and what is beside it, on the right
    var skip = el(".v3-skip", W.box), right = skip && !W.ended ? skip.offsetWidth + 24 : 14;
    if (L.right !== right) { L.right = right; W.root.style.right = right + "px"; }
    if (force || L.held !== held) { L.held = held; W.root.classList.toggle("wv-held", held); W.track.setAttribute("aria-disabled", held ? "true" : "false"); }
    var icon = W.ended ? "again" : W.paused ? "play" : "pause";
    if (force || L.icon !== icon) {
      L.icon = icon;
      el("svg", W.play).innerHTML = WV_ICONS[icon];
      var tip = TXT[icon === "again" ? "wv_again" : icon === "play" ? "wv_play" : "wv_pause"];
      W.play.title = tip; W.play.setAttribute("aria-label", tip);
      W.play.disabled = held;
    }
    var pct = Math.round(f * 10000) / 100;
    if (force || L.pct !== pct) {
      L.pct = pct; L.f = f;
      W.fill.style.width = pct + "%";
      W.knob.style.left = pct + "%";
    }
    var gone = held ? wvTime(0) : wvTime(f * total), all = held || !total ? "–" : wvTime(total);
    if (L.gone !== gone) { L.gone = gone; W.gone.textContent = gone; }
    if (L.all !== all) { L.all = all; W.all.textContent = all; W.root.title = held ? TXT.wv_wait : ""; }
    if (force || L.val !== gone + all) {
      L.val = gone + all;
      W.track.setAttribute("aria-valuenow", String(Math.round(f * 100)));
      W.track.setAttribute("aria-valuetext", held ? TXT.wv_wait : say("wv_value", { gone: gone, all: all }) + (W.ended ? "" : " · " + (wvAt(me, f).what || "")));
    }
    // the chapters, once the timetable is known (and again if the length changes with it)
    if (!W.chapters && !held && !W.ended) {
      W.chapters = wvChapters(me);
      W.marks.innerHTML = W.chapters.map(function (c) { return '<i style="left:' + (c.f * 100).toFixed(2) + '%"></i>'; }).join("");
    }
  }

  // ---- clicked, dragged, hovered ----------------------------------------------------------------------
  function wvDrag(W) {
    var t = W.track, drag = null;
    function at(ev) { var r = t.getBoundingClientRect(); return Math.max(0, Math.min(1, (ev.clientX - r.left) / Math.max(1, r.width))); }
    function tip(f, ev) {
      var me = W.me, total = me && me.ms ? me.ms / 1000 : 0, a = W.ended ? { what: TXT.wv_again, day: "" } : wvAt(me, f);
      el(".wv-tip-what", W.tip).textContent = a.what || "";
      el(".wv-tip-day", W.tip).textContent = a.day || "";
      el(".wv-tip-time", W.tip).textContent = total && !W.ended ? wvTime(f * total) : "";
      W.tip.hidden = !(a.what || a.day);
      var r = t.getBoundingClientRect(), w = W.tip.offsetWidth || 160, x = f * r.width;
      W.tip.style.left = Math.max(w / 2 - 6, Math.min(r.width - w / 2 + 6, x)) + "px";
      W.hover.style.width = (f * 100).toFixed(2) + "%";
      void ev;
    }
    t.addEventListener("pointerdown", function (ev) {
      if (ev.button !== 0 || (W.root.classList.contains("wv-held") && !W.ended)) { return; }
      ev.preventDefault(); ev.stopPropagation();
      var f = at(ev);
      if (W.ended) { wvAgain(f); return; }
      drag = { was: W.paused, id: ev.pointerId };
      try { t.setPointerCapture(ev.pointerId); } catch (e) { /* as it is */ }
      W.root.classList.add("wv-drag");
      W.paused = true; W.at = Math.min(WV_END, f);       // (held still under the finger, played on when let go)
      wvSeek(f); tip(f, ev);
      t.focus({ preventScroll: true });
    });
    t.addEventListener("pointermove", function (ev) {
      var f = at(ev);
      if (drag && ev.pointerId === drag.id) { W.at = Math.min(WV_END, f); wvSeek(f); }
      if (ev.pointerType === "mouse" || drag) { tip(f, ev); }
    });
    function up(ev) {
      if (!drag || ev.pointerId !== drag.id) { return; }
      var was = drag.was;
      drag = null;
      W.root.classList.remove("wv-drag");
      W.paused = was;
      if (!was && W.me && bpSite === W.me) { W.me.start = performance.now() - W.at * W.me.ms; W.me.heldAt = undefined; }
      wvShow(W, true);
      if (ev.pointerType !== "mouse") { W.tip.hidden = true; }
    }
    t.addEventListener("pointerup", up);
    t.addEventListener("pointercancel", up);
    t.addEventListener("pointerleave", function () { if (!drag) { W.tip.hidden = true; W.hover.style.width = "0"; } });
    // (the view's own dragging and zooming never started from it)
    ["pointerdown", "mousedown", "touchstart", "wheel", "click", "dblclick", "contextmenu"].forEach(function (k) { W.root.addEventListener(k, function (ev) { ev.stopPropagation(); }); });
  }
  function wvKeys(W) {
    W.track.addEventListener("keydown", function (ev) {
      var me = W.me;
      if (W.ended || !me || bpSite !== me || wvHeld(me) || ev.altKey || ev.ctrlKey || ev.metaKey) { return; }
      var total = me.ms / 1000, f = W.paused ? W.at : wvFrac(me), to = null;
      if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") { to = f - WV_STEP / total; }
      else if (ev.key === "ArrowRight" || ev.key === "ArrowUp") { to = f + WV_STEP / total; }
      else if (ev.key === "PageDown") { to = f - 0.1; }
      else if (ev.key === "PageUp") { to = f + 0.1; }
      else if (ev.key === "Home") { to = 0; }
      else if (ev.key === "End") { to = WV_END; }
      else if (ev.key === " " || ev.key === "k" || ev.key === "K") { ev.preventDefault(); ev.stopPropagation(); wvPlay(W.paused); return; }
      if (to === null) { return; }
      ev.preventDefault(); ev.stopPropagation();
      wvSeek(to);
    });
  }

  // ---- with each building going up ---------------------------------------------------------------------
  if (typeof bpGo === "function") {
    var bpGoVideo = bpGo;
    bpGo = function () {
      var out = bpGoVideo.apply(this, arguments);
      try { if (bpSite && V3 && V3.box) { wvStart(bpSite); } } catch (e) { /* no bar */ }
      return out;
    };
  }
