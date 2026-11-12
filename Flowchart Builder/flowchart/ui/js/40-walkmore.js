// ---------------------------------------------------------------------------
//  40-walkmore.js -- more to do walking round in 3D: small things picked up,
//  carried in your hands and put down where you look (on a table, a
//  counter, the floor); crouching down, under what a body standing cannot
//  get under; what you look at, or where you are, read out; and in a
//  building of many rooms, a sign by each door saying what is through it
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-11-12: "more things to do in 3D ... pick up and carry
  // small objects ... read room labels")
  //
  // E (or F) on something small -- a vase, a lamp, a stool, a kettle -- picks
  // it up: it is held in front of you as you walk, turned as you turn.  E (or
  // F) again puts it down where you are looking, as far as you can reach: on
  // what it would stand on (a kettle on a counter, a lamp on a table), else
  // on the floor; where there is no room for it, it stays in your hands.  Put
  // down, the drawing has it there -- one step to Undo -- as a piece moved in
  // 3D always has (40-edit3d.js).  C crouches (and C again stands, where
  // there is room over you): eyes at 1.1 m, the body no taller than 1.3 m,
  // as slow as a crouch (40-collide.js keeps what is in the way to that
  // height).  R reads out what is looked at, or the room you are in.
  var WM_TAKE = { i_vase: 1, i_candle: 1, i_books: 1, i_frame: 1, i_basket: 1, i_succulent: 1, i_herbs: 1, i_cactus: 1, i_flowers: 1,
                  i_plant: 1, i_tablelamp: 1, i_desklamp: 1, i_speaker: 1, i_fruitbowl: 1, i_kettle: 1, i_toaster: 1, i_coffeemaker: 1,
                  i_microwave: 1, i_monitor: 1, i_stool: 1, i_chair: 1, i_ottoman: 1, i_beanbag: 1, i_trash: 1, i_hamper: 1, i_toybox: 1,
                  i_dogbed: 1, i_fan: 1, i_heater: 1, i_recordplayer: 1, i_highchair: 1, i_sidetable: 1, i_officechair: 1, i_laptop: 1,
                  i_radio: 1, i_clock: 1, i_lantern: 1, i_bin: 1, i_cushion: 1, i_toy: 1, i_bucket: 1, i_watering: 1, i_planter: 1 };
  var WM_MOST = 1.0;                     // metres: no wider or deeper than this (a stool, not a sofa)
  var WM_AHEAD = 0.48, WM_UNDER = 0.48;  // metres: where it is held -- ahead of the eyes, and under them
  var WM_REACH = 2.3;                    // metres: as far off as it is put down
  var WM_EYE = 1.1, WM_TOP = 1.32;       // metres: the eyes crouched, and the top of the head
  var WM_CROUCH_MS = 240;
  var WM = { held: null, crouch: 0, to: 0, from: 0, t0: 0, eye: null, heldAt: null };

  function wmOn() { return typeof V3 !== "undefined" && V3 && V3.mode === "walk" && V3.me && V3.scene !== "space"; }
  function wmCanTake(n) {
    if (!n || !WM_TAKE[n.kind] || typeof nodeById !== "function") { return false; }
    if (n.w > WM_MOST * FLOOR_PX || n.h > WM_MOST * FLOOR_PX) { return false; }
    var real = nodeById(n.id);
    return !!real && !real.wired;
  }

  // ---- held ------------------------------------------------------------------------------------------
  // Its faces as they were drawn, kept; each picture drawn again where your hands are: turned by how far
  // you have turned since, about its middle, put ahead of your eyes and under them.
  function wmTake(n) {
    var model = V3.dragModel, P = FLOOR_PX;
    if (!model || !model.faces) { return false; }
    var mine = model.faces.filter(function (f) { return f.node && f.node.id === n.id && !(f.how && f.how.ghost) && f.pts && f.pts.length; });
    if (!mine.length) { return false; }
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    var kept = mine.map(function (f) {
      f.pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); z0 = Math.min(z0, p[2] || 0); z1 = Math.max(z1, p[2] || 0); });
      var c = Object.assign({}, f, { pts: f.pts.map(function (p) { return p.slice(); }) });
      if (f.mesh) { c.mesh = Object.assign({}, f.mesh, { xf: (f.mesh.xf || [0, 0, 1, 0, 0]).slice(), base: (f.mesh.base || [0, 0, 0]).slice() }); }
      delete c.src;
      return c;
    });
    WM.held = { id: n.id, kind: n.kind, name: typeof useName === "function" ? useName(n) : kindName(n.kind), faces: kept,
                c: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], half: Math.max(1, (z1 - z0) / 2), r: Math.max(x1 - x0, y1 - y0) / 2,
                head: V3.me.head };
    if (typeof useTone === "function") { try { useTone([520, 660], 0.06, false); } catch (e) { /* quiet */ } }
    v3Say(say("wm_took", { what: WM.held.name }));
    if (V3.paced) { V3.paced.sig = null; }      // (made again at once, without it where it stood: 40-perf.js paces that)
    V3.dirty = true;
    return true;
  }
  // where the hands are, in the picture's numbers
  function wmHands() {
    var eye = (V3.eye && V3.eye.me) || V3.eye, P = FLOOR_PX, h = V3.me.head, H = WM.held;
    if (!eye || !H) { return null; }
    var ahead = (WM_AHEAD + Math.min(0.35, H.r / P)) * P;
    return [eye.x + Math.cos(h) * ahead, eye.y + Math.sin(h) * ahead, eye.z - WM_UNDER * P + Math.min(0, 0.25 * P - H.half)];
  }
  function wmHeldFaces() {
    var H = WM.held, at = wmHands();
    if (!H || !at) { return []; }
    var d = V3.me.head - H.head, cd = Math.cos(d), sd = Math.sin(d), C = H.c;
    function move(p) {
      var dx = p[0] - C[0], dy = p[1] - C[1];
      return [at[0] + dx * cd - dy * sd, at[1] + dx * sd + dy * cd, (p[2] || 0) - C[2] + at[2]];
    }
    return H.faces.map(function (f) {
      var c = Object.assign({}, f, { pts: f.pts.map(move), moves: true, wmHeld: true });
      if (f.n) { c.n = [f.n[0] * cd - f.n[1] * sd, f.n[0] * sd + f.n[1] * cd, f.n[2]]; }
      if (f.mesh) {
        var m = f.mesh, xf = m.xf || [0, 0, 1, 0, 0], b = m.base || [0, 0, 0], P0 = f.pts[0];
        // where its own middle was (gl3Mesh: turned by xf's cos and sin, then put at xf plus its first corner's way from where it was made)
        var O = [xf[0] + P0[0] - b[0], xf[1] + P0[1] - b[1], xf[4] + (P0[2] || 0) - (b[2] || 0)], O2 = move(O);
        var c2 = xf[2] * cd - xf[3] * sd, s2 = xf[3] * cd + xf[2] * sd;
        c.mesh = Object.assign({}, m, { xf: [O2[0], O2[1], c2, s2, O2[2]], base: c.pts[0].slice() });
      }
      return c;
    });
  }
  // Put down where it is looked at: on what it stands on, or the floor -- in reach, and with room for it.
  function wmPut() {
    var H = WM.held, P = FLOOR_PX;
    if (!H) { return false; }
    var real = nodeById(H.id);
    if (!real) { WM.held = null; V3.dirty = true; return true; }
    var R = typeof o3RayAt === "function" ? o3RayAt(0, 0) : null;
    if (!R) { return false; }
    var plan = v3Ground(), floors = plan.floors || [], f = floors.length ? floorAt(floors, V3.me.x, V3.me.y) : null;
    var floorZ = (f ? f.z : 0) + (V3.stairZ || 0), far = WM_REACH * P, spot = null;
    var hit = typeof o3Look === "function" ? o3Look(R, far) : null;
    var tFloor = Math.abs(R.d[2]) > 0.02 ? (floorZ - R.o[2]) / R.d[2] : Infinity;
    if (hit && hit.t <= far && (!(tFloor > 0) || hit.t < tFloor) && hit.n && hit.n.id !== H.id) {
      var p = [R.o[0] + R.d[0] * hit.t, R.o[1] + R.d[1] * hit.t];
      // (what stands on things, on it; anything else on the floor just this side of it)
      if (ON_TOP[H.kind]) { spot = p; }
      else {
        var back = H.r + 4, dl = Math.hypot(R.d[0], R.d[1]) || 1;
        spot = [p[0] - R.d[0] / dl * back, p[1] - R.d[1] / dl * back];
      }
    } else if (tFloor > 0 && tFloor <= far * 1.4) {
      spot = [R.o[0] + R.d[0] * tFloor, R.o[1] + R.d[1] * tFloor];
    }
    if (!spot || Math.hypot(spot[0] - V3.eye.x, spot[1] - V3.eye.y) > far) { v3Say(TXT.wm_far); return true; }
    // into the plan's numbers (the floor you are on), and the drawing's (the rooms drawn apart, 39-join.js)
    var at = [spot[0] - (f ? f.dx : 0), spot[1] - (f ? f.dy : 0)];
    var paper = typeof o3ToPaper === "function" ? o3ToPaper()(at) : at;
    var was = { x: real.x, y: real.y, turn: real.turn || 0 }, undoAt = wasLike.length;
    var turn = ((was.turn + (V3.me.head - H.head) * 180 / Math.PI) % 360 + 360) % 360;
    keepUndo();
    real.turn = Math.round(turn / 15) * 15 % 360;
    if (!real.turn) { delete real.turn; }
    // where it is looked at -- or, no room there (against a wall, by a cupboard), a little nearer you, up to 0.75 m
    var toMe = [V3.me.x - at[0], V3.me.y - at[1]], tl = Math.hypot(toMe[0], toMe[1]) || 1, put = false;
    for (var tryAt = 0; tryAt <= 3 && !put; tryAt++) {
      var back = Math.min(tryAt * 0.25 * P, Math.max(0, tl - H.r - HB_R));
      var pp = typeof o3ToPaper === "function" ? o3ToPaper()([at[0] + toMe[0] / tl * back, at[1] + toMe[1] / tl * back]) : [at[0] + toMe[0] / tl * back, at[1] + toMe[1] / tl * back];
      real.x = Math.round(pp[0]); real.y = Math.round(pp[1]);
      put = !(typeof edit3dClash === "function" && edit3dClash(real));
      if (ON_TOP[H.kind] && hit && hit.n && tryAt === 0 && !put) { break; }      // (on a table: there, or not at all)
    }
    if (!put) {
      real.x = was.x; real.y = was.y;
      if (was.turn) { real.turn = was.turn; } else { delete real.turn; }
      if (wasLike.length > undoAt) { wasLike.length = undoAt; if (typeof showUndo === "function") { showUndo(); } }
      v3Say(TXT.wm_no_room);
      return true;
    }
    WM.held = null;
    if (typeof edit3dSaved === "function") { edit3dSaved(); } else { V3.dirty = true; }
    if (typeof useTone === "function") { try { useTone([440, 330], 0.06, false); } catch (e) { /* quiet */ } }
    v3Say(say("wm_put", { what: H.name }));
    V3.dirty = true;
    return true;
  }
  // gone from where it stood while it is held: its faces out of each picture made, and (40-collide.js) not bumped into
  if (typeof v3Build === "function") {
    var v3BuildWm = v3Build;
    v3Build = function () {
      var model = v3BuildWm.apply(this, arguments);
      try {
        if (WM.held && model && model.faces) {
          if (!wmOn()) { WM.held = null; }
          else {
            var id = WM.held.id;
            model.faces = model.faces.filter(function (f) { return !(f.node && f.node.id === id && !f.wmHeld); });
            // (nor its name, left hanging where it stood)
            if (model.labels) { model.labels = model.labels.filter(function (l) { return l.of !== id; }); }
          }
        }
      } catch (e) { WM.held = null; }
      return model;
    };
  }
  // ... and drawn in your hands, every picture -- not only when the scene is made again (40-perf.js paces that)
  if (typeof v3GlDraw === "function") {
    var v3GlDrawWm = v3GlDraw;
    v3GlDraw = function (model, inside) {
      try {
        if (model && model.faces) {
          var I = WM.heldAt;
          if (I && I.model === model && I.at <= model.faces.length) { model.faces.length = I.at; }
          else if (I && I.model !== model) { WM.heldAt = null; }
          if (WM.held && inside && wmOn()) {
            // (what the parts after this one put in for it too -- a plant's own leaves, 40-flora.js -- out
            // of where it stood, once a scene)
            if (WM.held.out !== model) {
              var hid = WM.held.id;
              model.faces = model.faces.filter(function (f) { return !(f.node && f.node.id === hid && !f.wmHeld); });
              WM.held.out = model;
            }
            var at = model.faces.length;
            Array.prototype.push.apply(model.faces, wmHeldFaces());
            WM.heldAt = { model: model, at: at };
            V3.dirty = true;               // (it goes where you go: drawn again next picture)
          } else { WM.heldAt = null; }
        }
      } catch (e) { WM.held = null; WM.heldAt = null; }
      return v3GlDrawWm.apply(this, arguments);
    };
  }
  // what is held is not walked into
  if (typeof hbSolidFace === "function") {
    var hbSolidFaceWm = hbSolidFace;
    hbSolidFace = function (f) { return !(WM.held && f && f.node && f.node.id === WM.held.id) && hbSolidFaceWm.apply(this, arguments); };
  }

  // ---- E: picked up, put down ---------------------------------------------------------------------------
  if (typeof o3Aim === "function") {
    var o3AimWm = o3Aim;
    o3Aim = function (R) {
      if (WM.held && wmOn()) { return { n: nodeById(WM.held.id) || { id: WM.held.id, kind: WM.held.kind }, usable: true, near: true, put: true, front: -1, R: R, t: 0 }; }
      var a = o3AimWm.apply(this, arguments);
      if (a && a.n && !a.door && wmCanTake(a.n)) {
        a.take = true;
        if (!a.usable) { a.usable = true; a.takeOnly = true; }
      }
      return a;
    };
  }
  if (typeof o3Verb === "function") {
    var o3VerbWm = o3Verb;
    o3Verb = function (a) {
      if (a && a.put) { return TXT.wm_put_do; }
      if (a && a.takeOnly) { return TXT.wm_take_do; }
      return o3VerbWm.apply(this, arguments);
    };
  }
  if (typeof o3Act === "function") {
    var o3ActWm = o3Act;
    o3Act = function (a) {
      try {
        if (WM.held && wmOn()) { return wmPut(); }
        if (a && a.takeOnly && a.near) { return wmTake(a.n); }
      } catch (e) { if (window.console && console.warn) { console.warn("carrying:", e && e.message); } }
      return o3ActWm.apply(this, arguments);
    };
  }
  // F: picked up whatever it is (a lamp, whose E is its switch) -- or put down
  function wmTakeKey() {
    if (WM.held) { return wmPut(); }
    var a = V3.o3Aim || (typeof o3Aim === "function" && typeof o3RayAt === "function" ? o3Aim(o3RayAt(0, 0)) : null);
    if (!a || !a.take) { v3Say(TXT.wm_nothing); return false; }
    if (!a.near) { v3Say(TXT.o3_closer); return false; }
    return wmTake(a.n);
  }

  // ---- C: crouched ------------------------------------------------------------------------------------------
  function wmCrouchK() {
    if (!WM.t0) { return WM.to; }
    var k = Math.min(1, (performance.now() - WM.t0) / WM_CROUCH_MS);
    if (typeof STILL !== "undefined" && STILL) { k = 1; }
    if (k >= 1) { WM.t0 = 0; return WM.to; }
    k = k * k * (3 - 2 * k);
    return WM.from + (WM.to - WM.from) * k;
  }
  function wmCrouchTo(down) {
    var to = down ? 1 : 0;
    if (to === WM.to) { return; }
    // standing up, room over your head for it
    if (!down && typeof hbLive === "function" && hbLive() && typeof hbNearAt === "function") {
      var was = HB.hi;
      HB.hi = HB_HI;
      var room = true;
      try { room = !(hbNearAt(V3.me.x, V3.me.y, HB_R).d < HB_R * 0.7); } finally { HB.hi = was; }
      if (!room) { v3Say(TXT.wm_no_stand); return; }
    }
    WM.from = wmCrouchK(); WM.to = to; WM.t0 = performance.now();
    v3Say(down ? TXT.wm_crouched : TXT.wm_stood);
    V3.dirty = true;
  }
  // each picture: the eyes as low as the crouch, the body as short, the pace as slow
  var WM_EYE_UP = typeof EYE_TALL === "number" ? EYE_TALL : 1.6;
  function wmCrouchTick() {
    var k = wmOn() ? wmCrouchK() : 0;
    if (!wmOn() && WM.to) { WM.to = 0; WM.t0 = 0; }
    WM.crouch = k;
    EYE_TALL = WM_EYE_UP - (WM_EYE_UP - WM_EYE) * k;
    if (typeof HB === "object" && HB) { HB.hi = HB_HI - (HB_HI - WM_TOP * FLOOR_PX) * k; }
    if (WM.t0 && V3) { V3.dirty = true; }
  }
  if (typeof v3Watch === "function") {
    var v3WatchWm = v3Watch;
    v3Watch = function () {
      try { if (V3) { wmCrouchTick(); } } catch (e) { WM.to = 0; WM.t0 = 0; }
      return v3WatchWm.apply(this, arguments);
    };
  }
  if (typeof v3Move === "function") {
    var v3MoveWm = v3Move;
    v3Move = function (me, mx, my) {
      var slow = 1 - 0.5 * (WM.crouch || 0);
      return v3MoveWm.call(this, me, mx * slow, my * slow);
    };
  }
  // crouched, your own legs bent under you (40-bodies.js's kneel; sat, the seat's own)
  if (typeof useSitPose === "function") {
    var useSitPoseWm = useSitPose;
    useSitPose = function () { var s = useSitPoseWm.apply(this, arguments); return s || (WM.crouch > 0.5 && !(V3 && V3.sitting) ? "kneel" : s); };
  }

  // ---- R: read out ------------------------------------------------------------------------------------------
  // The room a door goes to from where you are; what a piece is and the room it is in; or where you are.
  function wmBeyond(plan, d) {
    var here = roomAt(plan, V3.me.x, V3.me.y), j = (plan.joins || []).filter(function (q) { return q.door.id === d.id; })[0];
    if (!j) { return null; }
    var other = j.rooms.filter(function (r) { return r !== here; })[0] || null;
    if (!other) { return j.rooms.length === 1 && here ? TXT.v3_outside : null; }
    return roomLabel(other) || roomName(plan, other);
  }
  function wmSaid() {
    var plan = v3Ground(), a = V3.o3Aim || (typeof o3Aim === "function" && typeof o3RayAt === "function" ? o3Aim(o3RayAt(0, 0)) : null);
    if (a && a.put && WM.held) { return say("wm_holding", { what: WM.held.name }); }
    if (a && a.n && a.door) {
      var to = wmBeyond(plan, a.n);
      if (to) { return say("wm_door_to", { room: to }); }
    }
    if (a && a.n && !a.door && a.n.kind !== "i_room") {
      var room = roomAt(plan, a.n.x, a.n.y);
      return room ? say("wm_thing_in", { what: useName(a.n), room: roomLabel(room) || roomName(plan, room) }) : useName(a.n);
    }
    var mine = roomAt(plan, V3.me.x, V3.me.y), f = floorAt(plan.floors || [], V3.me.x, V3.me.y);
    var said = mine ? roomLabel(mine) || roomName(plan, mine) : TXT.v3_outside;
    if (f && (plan.floors || []).length > 1) { said += ", " + floorName(f); }
    return said;
  }
  function wmRead() {
    var words = wmSaid();
    if (!words) { return; }
    v3Say(words);
    try {
      if (window.speechSynthesis && typeof SpeechSynthesisUtterance === "function") {
        var u = new SpeechSynthesisUtterance(words);
        u.lang = { de: "de-DE", es: "es-ES", fr: "fr-FR" }[typeof LANG === "string" ? LANG : ""] || "en-US";
        u.rate = 1.02;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch (e) { /* said on the screen */ }
  }
  // A door looked at says where it goes (under its verb, where a piece's name is)
  if (typeof o3Show === "function") {
    var o3ShowWm = o3Show;
    o3Show = function (a) {
      var out = o3ShowWm.apply(this, arguments);
      try {
        var B = typeof o3Bits === "function" ? o3Bits() : null;
        if (B && a && a.door && a.near && !B.tip.hidden) {
          var to = wmBeyond(v3Ground(), a.n), what = el(".o3-what", B.tip), want = to ? say("wm_to", { room: to }) : useName(a.n);
          if (what && what.textContent !== want) { what.textContent = want; }
        }
        if (B && a && a.put && WM.held && !B.tip.hidden) {
          var w2 = el(".o3-what", B.tip);
          if (w2 && w2.textContent !== WM.held.name) { w2.textContent = WM.held.name; }
        }
      } catch (e) { /* the tip as it was */ }
      return out;
    };
  }

  // ---- the keys ---------------------------------------------------------------------------------------------
  if (typeof v3Open === "function") {
    var v3OpenWm = v3Open;
    v3Open = function () {
      var was = typeof V3 !== "undefined" ? V3 : null, out = v3OpenWm.apply(this, arguments);
      try {
        if (V3 && V3 !== was && V3.box) {
          WM.held = null; WM.heldAt = null; WM.to = 0; WM.t0 = 0; WM.crouch = 0;
          V3.box.addEventListener("keydown", function (ev) {
            if (!wmOn() || ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) { return; }
            if (ev.target && ev.target.closest && ev.target.closest("input, textarea, button")) { return; }
            var did = true;
            if (ev.code === "KeyF") { wmTakeKey(); }
            else if (ev.code === "KeyC") { wmCrouchTo(!WM.to); }
            else if (ev.code === "KeyR") { wmRead(); }
            else { did = false; }
            if (did) { ev.preventDefault(); ev.stopPropagation(); V3.dirty = true; }
          });
        }
      } catch (e) { /* the view without them */ }
      return out;
    };
  }
  // the hint the walk starts with says them too (38-view3d.js's v3_walk_hint, under the bar)
  if (typeof v3Words === "function") {
    var v3WordsWm = v3Words;
    v3Words = function () {
      var out = v3WordsWm.apply(this, arguments);
      try {
        var hint = V3 && V3.box ? el(".v3-hint", V3.box) : null;
        if (hint && V3.mode === "walk" && TXT.wm_keys && hint.textContent.indexOf(TXT.wm_keys) < 0 && hint.textContent) {
          hint.textContent = hint.textContent + " · " + TXT.wm_keys;
        }
      } catch (e) { /* as it was */ }
      return out;
    };
  }

  // ---- signs by the doors --------------------------------------------------------------------------------------
  // In a building of many rooms (not a house: an office, a school, a block of flats, a mall, a tower), a
  // plate on the wall by each door, on the side of the hall or the corridor it opens off, naming the room
  // it goes to -- by its latch, at the height of the eyes.  Made with the rest, kept while nothing changes.
  var WM_SIGN = { piece: true, color: "#2b3036", edge: "#171a1e" };
  var WM_HOMES = { house: 1, cabin: 1, townhouses: 1, duplex: 1 };
  function wmSignsWanted() {
    if (!wmOn() || typeof adrPic !== "function" || typeof adrPlate !== "function") { return false; }
    var type = typeof lwTypeNow === "function" ? lwTypeNow() : "house";
    return !WM_HOMES[type];
  }
  function wmSigns(faces) {
    var plan = v3Ground(), floors = plan.floors || [], P = FLOOR_PX, made = 0;
    function hallish(r) { var k = typeof roomKind === "function" ? roomKind(plan, r) : ""; return k === "hall" || /lobby|landing|corridor|hall/.test(String(r.starter || r.use || "")); }
    (plan.joins || []).forEach(function (j) {
      if (made > 1500 || j.rooms.length !== 2 || j.locked) { return; }
      var d = j.door;
      if (d.kind === "i_garagedoor" || (d.turn || 0) % 90) { return; }
      [0, 1].forEach(function (side) {
        var from = j.rooms[side], to = j.rooms[1 - side];
        if ((from.turn || 0) % 90 || !hallish(from) || hallish(to)) { return; }
        var name = roomLabel(to) || String(to.text || "").split("\n")[0].trim();
        if (!name) { return; }
        var f = floors.length ? floorAt(floors, d.x, d.y) : null, dx = f ? f.dx : 0, dy = f ? f.dy : 0, z = (f ? f.z : 0) + 1.55 * P;
        // the hall's wall the door is in: its inside face, and which way it faces
        var t = turned(from), l = from.x - t.w / 2, r = from.x + t.w / 2, top = from.y - t.h / 2, foot = from.y + t.h / 2;
        var wall = Math.max(1, Math.min(6, Math.min(from.w, from.h) * 0.06));
        // (where the door meets its wall: a swinging door's threshold is half its swing off its middle)
        var ta = (d.turn || 0) * Math.PI / 180, hh = d.h / 2, spots = [[d.x, d.y], [d.x - Math.sin(ta) * hh, d.y + Math.cos(ta) * hh], [d.x + Math.sin(ta) * hh, d.y - Math.cos(ta) * hh]];
        function gap(fn) { return Math.min.apply(null, spots.map(fn)); }
        var edges = [[gap(function (p) { return Math.abs(p[1] - top); }), [0, 1], "y", top + wall], [gap(function (p) { return Math.abs(p[1] - foot); }), [0, -1], "y", foot - wall],
                     [gap(function (p) { return Math.abs(p[0] - l); }), [1, 0], "x", l + wall], [gap(function (p) { return Math.abs(p[0] - r); }), [-1, 0], "x", r - wall]].sort(function (p, q) { return p[0] - q[0]; });
        var e = edges[0];
        if (e[0] > 20) { return; }
        var along = e[2] === "y" ? [1, 0] : [0, 1], dw = (WALK_DOORS[d.kind] ? turned(d) : d), half = (e[2] === "y" ? dw.w : dw.h) / 2;
        var off = half + 0.12 * P + 0.18 * P;
        var c = e[2] === "y" ? [d.x + along[0] * off, e[3] + e[1][1] * 0.6] : [e[3] + e[1][0] * 0.6, d.y + along[1] * off];
        var pic = adrPic(name, 0.36, 0.11, "#f4f1e8", "#2b3036", false);
        adrPlate(faces, [c[0] + dx, c[1] + dy], e[1], 0.36 * P, 0.11 * P, z, pic, WM_SIGN, false);
        made++;
      });
    });
  }
  if (typeof v3Build === "function") {
    var v3BuildSigns = v3Build;
    v3Build = function () {
      var model = v3BuildSigns.apply(this, arguments);
      try {
        if (model && model.faces && wmSignsWanted()) {
          if (typeof v3Added === "function") { v3Added("wmSigns", model.faces, "walk", function () { wmSigns(model.faces); }); }
          else { wmSigns(model.faces); }
        }
      } catch (e) { /* no signs */ }
      return model;
    };
  }
