// ---------------------------------------------------------------------------
//  38-view3d-more.js -- the 3D view's time of day, and its picture saved
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-01: "add more things icons and features ... to make
  // it better")  A house looks its best at more than one time of day: the
  // Day button goes round Day, Evening and Night.  The evening sun is low
  // and gold, out of the west, and throws long shadows; at night the sky is
  // dark and full of stars, the moon is up, the lamps glow, the windows are
  // lit from inside and so are the street lamps.  It eases from one to the
  // next, and the view remembers which was last chosen.  Save picture puts
  // what the view shows into a picture to keep.
  var TOD_NAMES = ["day", "evening", "night"];
  // Each time of day: where the light comes from, its color, the sky's, and
  // how dark it is (0 day, 1 night) -- eased between in gl3SkyNow.
  var TOD_LOOK = [
    { sun: [-0.42, -0.58, 0.7], sunCol: [0.62, 0.6, 0.55], skyAmb: [0.58, 0.62, 0.68], groundAmb: [0.42, 0.42, 0.4],
      zenith: [0.36, 0.58, 0.86], horizon: [0.82, 0.88, 0.93], below: [0.46, 0.6, 0.38],
      glow: [1.0, 0.95, 0.82], cloud: [1, 1, 1], night: 0 },
    { sun: [-0.86, -0.18, 0.3], sunCol: [0.8, 0.52, 0.3], skyAmb: [0.5, 0.45, 0.5], groundAmb: [0.36, 0.31, 0.28],
      zenith: [0.28, 0.32, 0.58], horizon: [0.98, 0.68, 0.46], below: [0.38, 0.4, 0.28],
      glow: [1.0, 0.62, 0.3], cloud: [1.0, 0.8, 0.68], night: 0.25 },
    { sun: [0.32, -0.46, 0.83], sunCol: [0.13, 0.15, 0.24], skyAmb: [0.14, 0.16, 0.25], groundAmb: [0.07, 0.08, 0.11],
      zenith: [0.015, 0.025, 0.07], horizon: [0.07, 0.09, 0.17], below: [0.05, 0.07, 0.05],
      glow: [0.78, 0.82, 0.92], cloud: [0.13, 0.14, 0.2], night: 1 }
  ];
  function todMix(a, b, k) {
    if (typeof a === "number") { return a + (b - a) * k; }
    return a.map(function (v, i) { return v + (b[i] - v) * k; });
  }
  // The sky and the light as they are now: V3.tod runs 0 (day) to 2 (night).
  function gl3SkyNow() {
    var t = typeof V3 !== "undefined" && V3 && V3.tod > 0 ? Math.min(2, V3.tod) : 0;
    var i = Math.min(1, Math.floor(t)), k = t - i, A = TOD_LOOK[i], B = TOD_LOOK[i + 1], out = {};
    Object.keys(A).forEach(function (key) { out[key] = todMix(A[key], B[key], k); });
    var l = Math.hypot(out.sun[0], out.sun[1], out.sun[2]) || 1;
    out.sun = [out.sun[0] / l, out.sun[1] / l, out.sun[2] / l];
    return out;
  }

  function todPref(value) {
    try {
      if (value === undefined) { var got = +localStorage.getItem("flowchart-3d-time"); return got >= 0 && got <= 2 ? got : 0; }
      localStorage.setItem("flowchart-3d-time", String(value));
    } catch (e) { /* this visit only */ }
    return value || 0;
  }

  // ---- the two buttons, in the view's own bar ------------------------------------
  function v3MoreBar() {
    if (!V3 || !V3.box || el('[data-v3="time"]', V3.box)) { return; }
    var bar = el(".v3-bar", V3.box), hint = el(".v3-hint", V3.box);
    if (!bar) { return; }
    var time = document.createElement("button");
    time.className = "btn small";
    time.type = "button";
    time.dataset.v3 = "time";
    time.onclick = function () {
      V3.todAim = ((V3.todAim || 0) + 1) % 3;
      todPref(V3.todAim);
      // round from night to day again by way of the morning, not back through the evening
      if (V3.todAim === 0) { V3.tod = 0; v3Fade(400); } else { v3Tween("tod", V3.todAim, 900); }
      V3.dirty = true;
      v3Words();
    };
    var save = document.createElement("button");
    save.className = "btn small";
    save.type = "button";
    save.dataset.v3 = "save";
    save.onclick = v3SavePicture;
    bar.insertBefore(time, hint);
    bar.insertBefore(save, hint);
  }
  function v3MoreWords() {
    if (!V3 || !V3.box) { return; }
    var time = el('[data-v3="time"]', V3.box), save = el('[data-v3="save"]', V3.box);
    var home = V3.scene !== "space", gl = V3.gl !== false;   // (false: no WebGL, painted the old way)
    if (time) {
      time.textContent = TXT["v3_" + TOD_NAMES[V3.todAim || 0]];
      time.title = TXT.v3_time_tip;
      time.setAttribute("aria-label", TXT.v3_time_tip + ": " + time.textContent);
      // the sky is the sky's own in space, and a plan laid flat has none
      time.hidden = !home || !!V3.flat || !gl;
    }
    if (save) {
      save.textContent = TXT.v3_save;
      save.title = TXT.v3_save_tip;
    }
  }

  // What the view shows, names and all, as a picture file named for the
  // drawing.
  function v3SavePicture() {
    if (!V3 || !V3.canvas) { return; }
    v3Draw();                            // fresh: a WebGL picture is gone once shown
    var name = (typeof designName === "function" && designName()) ||
               (el(".brand") && el(".brand").textContent.split("\n")[0]) || "3D";
    name = String(name).replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || "3D";
    function keep(blob) {
      if (!blob) { v3Say(TXT.v3_save_failed); return; }
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name + " (3D).png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      v3Say(TXT.v3_saved);
    }
    try { V3.canvas.toBlob(keep, "image/png"); } catch (e) { keep(null); }
  }

  // The 3D button pressed again while the view is still going back down
  // onto the paper: it comes straight back up, rather than the press being
  // lost to the closing.
  if (el("#view3d-open") && typeof v3Close === "function") {
    var v3ButtonPlain = el("#view3d-open").onclick;
    el("#view3d-open").onclick = function () {
      if (typeof V3 !== "undefined" && V3 && V3.leaving) { v3Close(); v3Open(); return; }
      return v3ButtonPlain ? v3ButtonPlain.apply(this, arguments) : undefined;
    };
  }

  if (typeof v3Open === "function") {
    var v3OpenPlainDay = v3Open;
    v3Open = function () {
      var was = V3;
      var out = v3OpenPlainDay.apply(this, arguments);
      if (V3 && V3 !== was) {
        V3.todAim = todPref();
        V3.tod = V3.todAim;
        v3MoreBar();
        v3MoreWords();
      }
      return out;
    };
    var v3WordsPlainDay = v3Words;
    v3Words = function () {
      var out = v3WordsPlainDay.apply(this, arguments);
      v3MoreBar();
      v3MoreWords();
      return out;
    };
  }
