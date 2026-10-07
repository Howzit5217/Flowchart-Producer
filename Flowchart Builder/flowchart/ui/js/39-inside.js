// ---------------------------------------------------------------------------
//  39-inside.js -- walking round inside in 3D, using what is there: the
//  lights on and off (a room at a time, or the whole house at its breakers),
//  a screen on, a fan turning, the taps running, the hob lit, a fire in the
//  grate; sitting down, sleeping till morning, playing the piano
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "make it so E can interact with anything")
  //
  // E (or a click, the mouse held) used to open the door in front of you;
  // now it uses whatever is in front of you, near enough to reach -- the
  // door, if that is nearest.  What is on or off is the view's, kept while
  // it is open (V3.use), not the design's.
  var USE_LIGHT = { i_lamp: 1, i_tablelamp: 1, i_desklamp: 1, i_arclamp: 1, i_sconce: 1, i_pendant: 1, i_chandelier: 1,
                    i_lightswitch: 1, i_lamppost: 1, i_pathlight: 1, i_porchlight: 1, i_floodlight: 1, i_candle: 1 };
  var USE_SCREEN = { i_tv: 1, i_walltv: 1, i_monitor: 1, i_pc: 1, i_laptop: 1, i_computer: 1, i_console: 1, i_projector: 1,
                     i_proscreen: 1, i_tablet: 1, i_register: 1, i_checkout: 1 };
  var USE_FAN = { i_ceilingfan: 1, i_fan: 1 };
  var USE_WATER = { i_sink: 1, i_kitchensink: 1, i_bathtub: 1, i_shower: 1, i_utilitysink: 1, i_cornertub: 1, i_vanity: 1 };
  var USE_HEAT = { i_stove: 1, i_oven: 1, i_fireplace: 1, i_grill: 1, i_firepit: 1, i_heater: 1, i_furnace: 1 };
  var USE_SEAT = { i_sofa: 1, i_loveseat: 1, i_sectional: 1, i_armchair: 1, i_recliner: 1, i_chair: 1, i_officechair: 1, i_stool: 1,
                   i_bench: 1, i_gardenbench: 1, i_rocker: 1, i_chaise: 1, i_beanbag: 1, i_ottoman: 1, i_lounger: 1, i_schooldesk: 1,
                   i_highchair: 1, i_swing: 1 };
  var USE_BED = { i_bed: 1, i_bedking: 1, i_bed1: 1, i_bunkbed: 1, i_daybed: 1, i_crib: 1 };
  var USE_OPEN = { i_fridge: 1, i_freezer: 1, i_cooler: 1, i_winecooler: 1, i_wardrobe: 1, i_dresser: 1, i_nightstand: 1, i_chest: 1,
                   i_sideboard: 1, i_hutch: 1, i_filing: 1, i_cabinet: 1, i_medicine: 1, i_linencab: 1, i_reachin: 1, i_microwave: 1,
                   i_dishwasher: 1, i_washer: 1, i_dryer: 1, i_toolchest: 1, i_pantry: 1, i_toybox: 1, i_mailbox: 1, i_counter: 1 };
  var USE_SAYS = { i_toilet: "us_flush", i_piano: "us_play", i_plant: "us_plant", i_palm: "us_plant", i_flowers: "us_plant",
                   i_succulent: "us_plant", i_herbs: "us_plant", i_bookcase: "us_book", i_books: "us_book", i_shelf: "us_book",
                   i_checkout: "us_pay", i_register: "us_pay", i_outlet: "us_plug", i_gondola: "us_shop", i_display: "us_shop",
                   i_coffeemaker: "us_coffee", i_kettle: "us_coffee", i_treadmill: "us_exercise", i_exbike: "us_exercise",
                   i_weightbench: "us_exercise", i_pooltable: "us_game", i_pingpong: "us_game", i_dartboard: "us_game",
                   i_aquarium: "us_fish", i_recordplayer: "us_music", i_speaker: "us_music", i_whiteboard: "us_write",
                   i_breaker: "us_breaker", i_parked: "us_car", i_hottub: "us_water_on", i_pool: "us_swim" };
  function useKind(n) {
    return USE_LIGHT[n.kind] ? "light" : USE_SCREEN[n.kind] ? "screen" : USE_FAN[n.kind] ? "fan" : USE_WATER[n.kind] ? "water"
         : USE_HEAT[n.kind] ? "heat" : USE_BED[n.kind] ? "bed" : USE_SEAT[n.kind] ? "seat" : USE_OPEN[n.kind] ? "open"
         : USE_SAYS[n.kind] ? "say" : null;
  }
  function useState() {
    if (!V3.use) { V3.use = { on: {}, dark: {}, all: false }; }
    return V3.use;
  }
  // The room a thing is in, in the house as walked round.
  function useRoomOf(n) {
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(r, n.x, n.y); });
    rooms.sort(function (p, q) { return p.w * p.h - q.w * q.h; });
    return rooms[0] || null;
  }
  // Read by the drawing (38-view3d-gl.js): a room's light out; a light, a
  // screen, a fire on.
  function useDark(room) {
    if (!V3 || !V3.use || !room) { return false; }
    return !!V3.use.all || !!V3.use.dark[room.id];
  }
  function useOn(n) { return !!(V3 && V3.use && n && V3.use.on[n.id]); }
  function useLightOff(n) {
    if (!V3 || !V3.use || !n || !USE_LIGHT[n.kind] && n.kind !== "i_ceilingfan") { return false; }
    if (V3.use.all) { return true; }
    var r = useRoomOf(n);
    return r ? !!V3.use.dark[r.id] : !!V3.use.on["out" + n.id];
  }

  // What is in front of you, near enough to reach: on your floor, in the
  // way you face; a light on the ceiling from further, looking up at it.
  function useTargets() {
    var plan = v3Ground(), me = V3.me, floors = plan.floors || [], mine = floors.length ? floorAt(floors, me.x, me.y) : null;
    var out = [];
    hand.nodes.forEach(function (n) {
      var doorish = WALK_DOORS[n.kind];
      if (!doorish && !useKind(n)) { return; }
      if (floors.length && floorAt(floors, n.x, n.y) !== mine) { return; }
      var dx = n.x - me.x, dy = n.y - me.y, far = Math.hypot(dx, dy), size = Math.min(n.w, n.h) / 2;
      var reach = doorish ? 85 : FROM_CEILING[n.kind] ? 150 : 70 + size;
      if (far > reach) { return; }
      var off = Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - me.head), Math.cos(Math.atan2(dy, dx) - me.head)));
      if (off > 1.2 && far > 30 + size) { return; }
      out.push({ n: n, door: !!doorish, cost: Math.max(0, far - size) + off * 45 + (FROM_CEILING[n.kind] ? 25 : 0) });
    });
    out.sort(function (p, q) { return p.cost - q.cost; });
    return out;
  }
  function useName(n) { return String(n.text || "").split("\n")[0].trim() || kindName(n.kind); }
  function useIt(n) {
    var U = useState(), kind = useKind(n), name = useName(n), room = useRoomOf(n);
    V3.dirty = true;
    if (kind === "light") {
      if (room) { U.dark[room.id] = !U.dark[room.id]; U.all = false; v3Say(U.dark[room.id] ? TXT.us_light_off : TXT.us_light_on); }
      else { U.on["out" + n.id] = !U.on["out" + n.id]; v3Say(U.on["out" + n.id] ? TXT.us_light_off : TXT.us_light_on); }
      return;
    }
    if (n.kind === "i_breaker") {
      U.all = !U.all;
      v3Say(U.all ? TXT.us_breaker_off : TXT.us_breaker_on);
      return;
    }
    if (kind === "screen" || kind === "fan" || kind === "water" || kind === "heat") {
      U.on[n.id] = !U.on[n.id];
      if (kind === "water") { (U.since || (U.since = {}))[n.id] = performance.now(); }
      var key = { screen: "us_screen", fan: "us_fan", water: "us_water", heat: "us_heat" }[kind];
      v3Say(say(key + (U.on[n.id] ? "_on" : "_off"), { what: name }));
      if (kind === "screen" && U.on[n.id] && (n.kind === "i_register" || n.kind === "i_checkout")) { useTone([880, 1320], 0.18); }
      return;
    }
    if (kind === "seat") {
      if (V3.sitting && V3.sitting.id === n.id && !V3.sitting.up) { useStandUp(); return; }
      useSitOn(n, false);
      v3Say(TXT.us_sit);
      return;
    }
    if (kind === "bed") {
      if ((V3.todAim || 0) === 2 || (V3.todAim || 0) === 1) {
        // a night's sleep: morning
        V3.todAim = 0; if (typeof todPref === "function") { todPref(0); }
        V3.tod = 0; v3Fade(700); v3Words();
        v3Say(TXT.us_sleep);
      } else {
        useSitOn(n, true);
        v3Say(TXT.us_rest);
      }
      return;
    }
    if (kind === "open") {
      U.on[n.id] = !U.on[n.id];
      v3Say(say(U.on[n.id] ? "us_open" : "us_close", { what: name }));
      return;
    }
    if (n.kind === "i_outlet" && typeof usePlug === "function") { usePlug(n); return; }
    if (kind === "say") {
      if (n.kind === "i_piano") { useTone([261.6, 329.6, 392.0, 523.3], 0.9); }
      if (n.kind === "i_toilet") { useTone([180, 120], 0.6, "noise"); }
      v3Say(say(USE_SAYS[n.kind], { what: name }));
      return;
    }
    v3Say(name);
  }
  // A few notes (or a rush of water), quietly, where the browser plays sound.
  var useAudio = null;
  function useTone(freqs, secs, noise) {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx || (typeof STILL !== "undefined" && STILL)) { return; }
      useAudio = useAudio || new Ctx();
      var a = useAudio, t0 = a.currentTime;
      var gain = a.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + secs);
      gain.connect(a.destination);
      if (noise) {
        var buf = a.createBuffer(1, Math.floor(a.sampleRate * secs), a.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) { d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); }
        var src = a.createBufferSource(), lp = a.createBiquadFilter();
        lp.type = "lowpass"; lp.frequency.value = 900;
        src.buffer = buf; src.connect(lp); lp.connect(gain); src.start(t0);
        return;
      }
      freqs.forEach(function (f, i) {
        var o = a.createOscillator();
        o.type = "triangle"; o.frequency.value = f;
        o.connect(gain);
        o.start(t0 + i * 0.07); o.stop(t0 + secs);
      });
    } catch (e) { /* silence */ }
  }
  // E: whatever is nearest in front of you -- a door the way it always was.
  if (typeof v3UseDoor === "function") {
    var v3UseDoorPlain = v3UseDoor;
    v3UseDoor = (typeof tieWith === "function" ? tieWith : function (f) { return f; })(function () {
      if (!V3 || !V3.me) { return v3UseDoorPlain.apply(this, arguments); }
      var best = useTargets()[0];
      if (!best) { v3Say(TXT.us_nothing); return; }
      if (best.door) { return v3UseDoorPlain.apply(this, arguments); }
      useIt(best.n);
    }, 1);
  }
  // A click on a door, or on something to use, uses it: whichever within
  // reach lies the way the click points, not only what is straight ahead
  // (2026-10-03: "when I hit E or click on a door nothing happens" -- a
  // first click only took hold of the mouse to look round with).  `sx` is
  // across the view from its left, in its own pixels.  True if one was used.
  function v3ClickUse(sx) {
    if (!V3 || V3.mode !== "walk" || !V3.me || !V3.w) { return false; }
    var f = (V3.w / 2) / Math.tan(V3_FOV / 2), want = Math.atan((sx - V3.w / 2) / f), me = V3.me, best = null;
    useTargetsAround().forEach(function (t) {
      var dx = t.n.x - me.x, dy = t.n.y - me.y, ahead = dx * Math.cos(me.head) + dy * Math.sin(me.head);
      if (ahead <= 2) { return; }
      var across = -dx * Math.sin(me.head) + dy * Math.cos(me.head), ang = Math.atan2(across, ahead);
      var half = Math.atan2(Math.max(t.n.w, t.n.h) / 2 + 6, Math.hypot(dx, dy));
      var miss = Math.abs(ang - want) - half;
      if (miss > 0.04) { return; }
      var cost = Math.hypot(dx, dy) + Math.max(0, miss) * 300;
      if (!best || cost < best.cost) { best = { ang: ang, cost: cost }; }
    });
    if (!best) { return false; }
    // turned to it for the moment it takes to use it
    var was = me.head;
    me.head = was + best.ang;
    try { v3UseDoor(); } finally { me.head = was; }
    V3.dirty = true;
    return true;
  }
  // (every door and usable thing within reach, any way round: useTargets
  // keeps to what is in front)
  var useTargetsAround = (typeof tieWith === "function" ? tieWith : function (fn) { return fn; })(function () {
    var plan = v3Ground(), me = V3.me, floors = plan.floors || [], mine = floors.length ? floorAt(floors, me.x, me.y) : null, out = [];
    hand.nodes.forEach(function (n) {
      var doorish = WALK_DOORS[n.kind];
      if (!doorish && !useKind(n)) { return; }
      if (floors.length && floorAt(floors, n.x, n.y) !== mine) { return; }
      var far = Math.hypot(n.x - me.x, n.y - me.y), size = Math.min(n.w, n.h) / 2;
      if (far > (doorish ? 110 : FROM_CEILING[n.kind] ? 150 : 90 + size)) { return; }
      out.push({ n: { x: n.x, y: n.y, w: n.w, h: n.h } });
    });
    return out;
  }, 1);
  // ---- sat down on it --------------------------------------------------------------------------
  // (2026-10-07, "when you sit on something you actually turn around and sit on the thing you are
  // sitting on") Sitting used to lower the eyes where you stood, facing whichever way you were.
  // Now, over a moment, you step onto the seat (on a sofa, the place along it nearest you), turn round
  // to face the way it faces, and sit down to its height. Lying down on a bed in the day, you lie
  // along it, your head at the pillow end, looking toward its foot.
  // A step stands you up again in front of it (beside the bed), facing the way you sat. Turning the
  // view and looking about still work, sat down.
  // (V3.sitting: the seat's id, its height, where you came from and where you go, and when. 40-bodies.js
  // sits your body down; 38-view3d.js and 40-tour.js put your eyes at useSitEye().)
  var USE_SEAT_H = { i_sofa: 0.46, i_loveseat: 0.46, i_sectional: 0.46, i_armchair: 0.45, i_recliner: 0.47, i_chair: 0.47,
                     i_officechair: 0.49, i_stool: 0.66, i_bench: 0.45, i_gardenbench: 0.45, i_rocker: 0.44, i_chaise: 0.4,
                     i_beanbag: 0.3, i_ottoman: 0.42, i_lounger: 0.36, i_schooldesk: 0.45, i_highchair: 0.6, i_swing: 0.5 };
  var USE_SIT_MS = 900, USE_UP_MS = 380, USE_SIT_EYE = 0.68, USE_BED_H = 0.55;   // (eyes this far over the seat, sat up)
  function useEase(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
  function useSitOn(n, bed) {
    var me = V3.me, P = FLOOR_PX, t = (n.turn || 0) * Math.PI / 180;
    var ux = Math.cos(t), uy = Math.sin(t), fx = -Math.sin(t), fy = Math.cos(t);       // across it; the way it faces
    var dx = me.x - n.x, dy = me.y - n.y, a = dx * ux + dy * uy, b = dx * fx + dy * fy, hw = n.w / 2, hd = n.h / 2;
    var to, stand, eye, pitch = null, head = Math.atan2(fy, fx);
    if (bed) {
      // along it, head at the pillows (its back), looking toward its foot
      var mid = Math.max(-hw + 0.3 * P, Math.min(hw - 0.3 * P, a)), side = a >= 0 ? 1 : -1;
      var by = Math.max(-hd + 0.4 * P, Math.min(hd - 0.4 * P, b));
      to = { x: n.x + ux * mid - fx * (hd - 0.45 * P), y: n.y + uy * mid - fy * (hd - 0.45 * P) };
      eye = USE_BED_H + 0.16;
      pitch = 0.15;
      stand = { x: n.x + ux * side * (hw + 0.42 * P) + fx * by, y: n.y + uy * side * (hw + 0.42 * P) + fy * by };
    } else {
      // the place along it nearest you, a little in front of its back
      var room = Math.max(0, hw - 0.3 * P), across = Math.max(-room, Math.min(room, a)), into = Math.min(0.08 * P, hd * 0.2);
      to = { x: n.x + ux * across + fx * into, y: n.y + uy * across + fy * into };
      eye = (USE_SEAT_H[n.kind] || 0.46) + USE_SIT_EYE;
      pitch = Math.max(-0.1, Math.min(0.1, me.pitch || 0));        // (looking out across the room, not down at the seat)
      stand = { x: n.x + ux * across + fx * (hd + 0.38 * P), y: n.y + uy * across + fy * (hd + 0.38 * P) };
    }
    var was = V3.sitting && V3.sitting !== true && !V3.sitting.up ? V3.sitting : null;
    V3.sitting = { id: n.id, kind: n.kind, bed: !!bed, seat: bed ? USE_BED_H : (USE_SEAT_H[n.kind] || 0.46), eye: eye,
                   from: { x: me.x, y: me.y, head: me.head, pitch: me.pitch || 0, eye: was ? useSitEye() : EYE_TALL },
                   back: was ? was.back : { x: me.x, y: me.y }, to: to, head: head, pitch: pitch, stand: stand, t0: performance.now() };
    V3.dirty = true;
  }
  // How far down you are: 0 standing, 1 sat (or, getting up, back again)
  function useSitK() {
    var S = V3 && V3.sitting;
    if (!S) { return 0; }
    if (S === true) { return 1; }
    var now = performance.now();
    if (S.up) { return 1 - useEase((now - S.up) / USE_UP_MS); }
    return useEase((now - S.t0) / USE_SIT_MS * 1.6 - 0.6);         // (down once mostly round and there)
  }
  // The eyes' height, in metres over the floor
  function useSitEye() {
    var S = V3 && V3.sitting;
    if (!S) { return EYE_TALL; }
    if (S === true) { return 1.12; }
    var from = S.up ? EYE_TALL : S.from.eye, k = useSitK();
    return from + (S.eye - from) * k;
  }
  // Legs sat on a seat ("sit46": 46 cm up) once you are down, for 40-bodies.js; null otherwise.
  // Lying on a bed, no body of your own is drawn (40-tour.js).
  function useSitPose() {
    var S = V3 && V3.sitting;
    if (!S || S === true || S.up || S.bed || useSitK() < 0.45) { return null; }
    return "sit" + Math.round(S.seat * 100);
  }
  function useLying() { var S = V3 && V3.sitting; return !!(S && S !== true && S.bed && !S.up && useSitK() > 0.3); }
  // Each picture while sitting down or getting up: on the way there, and turned round (true: more to come)
  function useSitTick() {
    var S = V3 && V3.sitting;
    if (!S || S === true || !V3.me || V3.mode !== "walk") { return false; }
    var now = performance.now(), me = V3.me;
    if (S.up) {
      if (now - S.up >= USE_UP_MS) { V3.sitting = false; }
      return true;
    }
    if (!S.done) {
      var k = useEase((now - S.t0) / (USE_SIT_MS * 0.75));
      me.x = S.from.x + (S.to.x - S.from.x) * k;
      me.y = S.from.y + (S.to.y - S.from.y) * k;
      me.head = S.from.head + Math.atan2(Math.sin(S.head - S.from.head), Math.cos(S.head - S.from.head)) * k;
      if (S.pitch !== null) { me.pitch = S.from.pitch + (S.pitch - S.from.pitch) * k; }
      if (k >= 1) { S.done = true; }
    }
    return now - S.t0 < USE_SIT_MS + 50;
  }
  // Up again: in front of the seat (beside the bed), or else back where you were, facing the way you sat
  function useStandUp() {
    var S = V3 && V3.sitting, me = V3 && V3.me;
    if (!S || !me) { return; }
    if (S === true) { V3.sitting = false; V3.dirty = true; return; }
    if (S.up) { return; }
    var spot = [S.stand, S.back].filter(function (q) { return q && !v3Blocked(q.x, q.y); })[0] || S.back;
    me.x = spot.x; me.y = spot.y;
    if (S.bed) { me.head = Math.atan2(spot.y - S.to.y, spot.x - S.to.x); }
    if (S.bed) { me.pitch = 0; }
    S.done = true;
    S.up = performance.now();
    V3.dirty = true;
  }
  // A step stands you up (turning the view and looking about do not)
  if (typeof v3Stride === "function") {
    var v3StrideUse = v3Stride;
    v3Stride = function () {
      var S = V3 && V3.sitting, k = (V3 && V3.keys) || {};
      if (S && !S.up && (k.w || k.a || k.s || k.d || k.padup || k.paddown)) { useStandUp(); return true; }
      return v3StrideUse.apply(this, arguments);
    };
  }
  if (typeof v3Draw === "function") {
    var v3DrawSit = v3Draw;
    v3Draw = function () {
      var more = false;
      try { more = useSitTick(); } catch (e) { if (V3) { V3.sitting = false; } }
      var out = v3DrawSit.apply(this, arguments);
      if (more && V3) { V3.dirty = true; }      // (after the picture, which says it is done)
      return out;
    };
  }

  // ---- seen ---------------------------------------------------------------------------
  // The fans turning; water falling from the taps; the hob's rings and the
  // fire glowing -- put into the picture each time it is drawn.
  function useScene(model) {
    if (!V3 || !V3.use || V3.mode !== "walk") { return; }
    var U = V3.use, px = FLOOR_PX, t = performance.now() / 1000, floors = typeof floorsOf === "function" ? floorsOf() : [];
    var turning = false;
    model.faces.forEach(function (f) {
      var n = f.node;
      if (!n || !f.mesh || !USE_FAN[n.kind] || !U.on[n.id]) { return; }
      // turned about its own middle, in the mesh's own numbers
      var cx = 0, cy = 0;
      f.pts.forEach(function (p) { cx += p[0] / f.pts.length; cy += p[1] / f.pts.length; });
      var ox = f.pts[0][0] - f.mesh.base[0], oy = f.pts[0][1] - f.mesh.base[1], lx = cx - ox, ly = cy - oy;
      var a = (t * 4.2) % (Math.PI * 2), c = Math.cos(a), s = Math.sin(a);
      f.mesh.xf = [lx - lx * c + ly * s, ly - lx * s - ly * c, c, s, 0];
      turning = true;
    });
    V3.useMoving = turning;
    hand.nodes.forEach(function (n) {
      if (!U.on[n.id] || (!USE_WATER[n.kind] && !USE_HEAT[n.kind])) { return; }
      var f = floors.length ? floorAt(floors, n.x, n.y) : null, dx = f ? f.dx : 0, dy = f ? f.dy : 0, dz = f ? f.z : 0;
      var a = (n.turn || 0) * Math.PI / 180, bx = Math.sin(a), by = -Math.cos(a);       // toward its back (the wall)
      var high = (typeof pieceHigh === "function" ? pieceHigh(n) : 0.9) * px;
      if (USE_WATER[n.kind] && typeof useWaterDraw === "function" && useWaterDraw(model, n, dx, dy, dz, t)) { turning = true; return; }
      if (USE_WATER[n.kind]) {
        // the stream from the tap at the back, down into the basin (from the head, in a shower)
        var back = n.h * (n.kind === "i_shower" ? 0.36 : 0.3), x = n.x + bx * back + dx, y = n.y + by * back + dy;
        var top = n.kind === "i_shower" ? 2.0 * px : high + 0.22 * px, low = n.kind === "i_shower" ? 0 : high - 0.12 * px;
        var r = n.kind === "i_shower" ? 0.08 * px : 0.012 * px, ring = [];
        for (var k = 0; k < 8; k++) { var q = k / 8 * Math.PI * 2; ring.push([x + Math.cos(q) * r, y + Math.sin(q) * r]); }
        v3Prism(model.faces, ring, dz + low, dz + top, { glass: true, edge: "#9fc7e6", bare: true });
        turning = true;
        return;
      }
      // the hob's rings, a fire in the grate, coals in a grill
      var glow = { piece: true, color: "#ff8a3d", edge: "#ff8a3d", pat: 31, bare: true };
      if (n.kind === "i_stove" || n.kind === "i_oven") {
        [[-0.25, -0.22], [0.25, -0.22], [-0.25, 0.2], [0.25, 0.2]].forEach(function (o) {
          var cx2 = n.x + dx + o[0] * n.w, cy2 = n.y + dy + o[1] * n.h, rr = Math.min(n.w, n.h) * 0.14, pts = [];
          for (var j = 0; j < 12; j++) { var q2 = j / 12 * Math.PI * 2; pts.push([cx2 + Math.cos(q2) * rr, cy2 + Math.sin(q2) * rr]); }
          v3Prism(model.faces, pts, dz + high + 0.5, dz + high + 1.2, glow);
        });
      } else {
        var fx = n.x + dx + (n.kind === "i_fireplace" ? -bx * n.h * 0.05 : 0), fy = n.y + dy + (n.kind === "i_fireplace" ? -by * n.h * 0.05 : 0);
        var flick = 0.85 + 0.15 * Math.sin(t * 9 + n.id), w = Math.min(n.w, n.h) * 0.22, h = (n.kind === "i_fireplace" ? 0.35 : 0.18) * px * flick;
        var z0 = n.kind === "i_fireplace" ? 0.15 * px : n.kind === "i_firepit" ? 0.3 * px : high;
        v3Prism(model.faces, [[fx - w, fy - w], [fx + w, fy - w], [fx + w, fy + w], [fx - w, fy + w]], dz + z0, dz + z0 + h, glow);
        turning = true;
      }
    });
    V3.useMoving = turning;
  }
  if (typeof v3Build === "function") {
    var v3BuildUse = v3Build;
    v3Build = function () {
      var model = v3BuildUse.apply(this, arguments);
      try { useScene(model); } catch (e) { /* as it is */ }
      return model;
    };
  }
  if (typeof v3Watch === "function") {
    var v3WatchUse = v3Watch;
    v3Watch = function () {
      if (V3 && V3.useMoving && !(typeof STILL !== "undefined" && STILL)) {
        var now = performance.now();
        if (now - (V3.useAt || 0) > Math.max(33, (V3.drawMs || 0) * 3)) { V3.useAt = now; V3.dirty = true; }
      }
      return v3WatchUse.apply(this, arguments);
    };
  }

  // ---- walls taken out, and what then holds the house up ---------------------------------
  // (asked for, 2026-10-02: "remove walls on specific sides just not on the
  // outsides to create more open concepts ... there needs to be real things
  // that are needed to properly support the building")
  //
  // A room's walls between it and the rooms next to it can be taken out
  // (`room.open`, its sides in its own numbers: top, foot, left, right) --
  // never one with only the outdoors beyond.  Where the wall carried
  // something -- a floor over it, or the middle of the roof -- a beam goes
  // over the opening, as deep as its span needs, on a post at each end (and
  // one in the middle of a very long one).
  var WALL_EDGES = ["top", "foot", "left", "right"];
  function wallOut(room, edge) {
    var a = (room.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var l = edge === "top" ? [0, -1] : edge === "foot" ? [0, 1] : edge === "left" ? [-1, 0] : [1, 0];
    return [l[0] * c - l[1] * s, l[0] * s + l[1] * c];
  }
  function wallFacing(room, edge, other) {
    var d = wallOut(room, edge);
    return WALL_EDGES.filter(function (e2) { var q = wallOut(other, e2); return d[0] * q[0] + d[1] * q[1] < -0.9; })[0];
  }
  // How far along a room's wall a point is, from the wall's start (as v3Wall counts).
  function wallAlong(room, edge, x, y) {
    var a = -(room.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), dx = x - room.x, dy = y - room.y;
    var ux = dx * c - dy * s, uy = dx * s + dy * c;
    return edge === "top" || edge === "foot" ? ux + room.w / 2 : uy + room.h / 2;
  }
  // The rooms across one of a room's walls, on its floor, and the stretch
  // of the wall each shares -- in the house as it stands (`boxOf`).
  // (2026-10-07) The floors and the square rooms on each, kept while a picture is made or a walk is
  // planned (`wallFloorsBatch`): each wall of a tower's thousand rooms asked every room which floor
  // it was on, two minutes of it.
  var wallFloorsKept = { at: null, F: null }, wallFloorsBatch = null;
  function wallFloorsNow() {
    var at = wallFloorsBatch || (typeof V3 !== "undefined" && V3 ? V3.picture || null : null);
    if (!wallFloorsKept) { wallFloorsKept = { at: null, F: null }; }
    if (at && wallFloorsKept.at === at) { return wallFloorsKept.F; }
    // (else while no room or floor on the paper has moved: where each room is is all it asks)
    var key = at ? null : wallRoomsKey();
    if (key && wallFloorsKept.key === key && wallFloorsKept.H === hand) { return wallFloorsKept.F; }
    var floors = typeof floorsOf === "function" ? floorsOf() : [], on = new Map(), of = new Map();
    hand.nodes.forEach(function (o) {
      if (o.kind !== "i_room" || ((o.turn || 0) % 90)) { return; }
      var f = floors.length ? floorAt(floors, o.x, o.y) : null;
      of.set(o, f);
      if (!on.has(f)) { on.set(f, []); }
      on.get(f).push(o);
    });
    var F = { floors: floors, on: on, of: of };
    wallFloorsKept = { at: at, key: key, H: hand, F: F };
    return F;
  }
  // The rooms and floors drawn, kept while nothing is added or taken away; and where they are, as a number.
  var wallRoomsList = null;
  function wallRoomsKey() {
    var N = hand.nodes, k = wallRoomsList;
    if (!k || k.H !== hand || k.N !== N || k.n !== N.length || k.next !== hand.next || k.first !== N[0] || k.last !== N[N.length - 1]) {
      k = wallRoomsList = { H: hand, N: N, n: N.length, next: hand.next, first: N[0], last: N[N.length - 1],
                            list: N.filter(function (o) { return o.kind === "i_room" || o.kind === "i_floor"; }) };
    }
    var h = 0, R = k.list;
    for (var i = 0; i < R.length; i++) {
      var o = R[i];
      h = (h * 31 + o.id * 7 + o.x * 13 + o.y * 17 + o.w * 3 + o.h * 5 + (o.turn || 0) * 11) % 1000000007;
    }
    return R.length + "|" + h;
  }
  function wallAcross(room, edge, boxOf) {
    if ((room.turn || 0) % 90) { return []; }
    var B = boxOf(room), d = wallOut(room, edge), out = [], horiz = Math.abs(d[1]) > 0.5;
    var F = wallFloorsNow(), floors = F.floors, f0 = F.of.has(room) ? F.of.get(room) : floors.length ? floorAt(floors, room.x, room.y) : null;
    (F.on.get(f0) || []).forEach(function (o) {
      if (o === room) { return; }
      var Q = boxOf(o);
      var gap = horiz ? (d[1] < 0 ? B.t - Q.b : Q.t - B.b) : (d[0] < 0 ? B.l - Q.r : Q.l - B.r);
      if (Math.abs(gap) > 10) { return; }
      var lo = horiz ? Math.max(B.l, Q.l) : Math.max(B.t, Q.t), hi = horiz ? Math.min(B.r, Q.r) : Math.min(B.b, Q.b);
      if (hi - lo < 30) { return; }
      var line = horiz ? (d[1] < 0 ? B.t : B.b) : (d[0] < 0 ? B.l : B.r);
      out.push({ room: o, lo: lo, hi: hi, horiz: horiz, line: line, facing: wallFacing(room, edge, o) });
    });
    return out;
  }
  // (2026-10-04) or only the stretch it shares with one room (`room.openTo`,
  // that room's id): an open plan's living room half beside the kitchen and
  // half beside a bedroom, the one taken out and the other left standing
  function wallIsOpen(room, edge, other, facing) {
    return (room.open || []).indexOf(edge) >= 0 || (!!facing && (other.open || []).indexOf(facing) >= 0) ||
           (room.openTo || []).indexOf(other.id) >= 0 || (other.openTo || []).indexOf(room.id) >= 0;
  }
  function wallSomeOpen(o) { return o.kind === "i_room" && ((o.open && o.open.length) || (o.openTo && o.openTo.length)); }
  // The rooms a room is open to, by any stretch of its walls taken out (in the house as it stands).
  function wallOpenTo(room) {
    if (!wallSomeOpen(room) && !hand.nodes.some(function (o) { return (o.openTo || []).indexOf(room.id) >= 0 || (o.open && o.open.length); })) { return []; }
    var W = wallJoined(), out = [];
    WALL_EDGES.forEach(function (edge) {
      wallAcross(room, edge, W.box).forEach(function (it) {
        if (wallIsOpen(room, edge, it.room, it.facing) && out.indexOf(it.room) < 0) { out.push(it.room); }
      });
    });
    return out;
  }
  // (asked once a picture while one is made -- every door of a big building
  // asked it of every shape in the building)
  var wallOpenKept = { at: null, any: false };
  function wallAnyOpen() {
    var at = typeof V3 !== "undefined" && V3 ? V3.picture || null : null;
    if (!wallOpenKept) { wallOpenKept = { at: null, any: false }; }   // (asked before this part has run)
    if (at && wallOpenKept.at === at) { return wallOpenKept.any; }
    var any = hand.nodes.some(wallSomeOpen);
    if (at) { wallOpenKept.at = at; wallOpenKept.any = any; }
    return any;
  }
  // The stretches of a room's wall taken out, from the wall's start.
  // (2026-10-07) The rooms that are open to any other, by id -- or every room, where some room is open
  // a whole side (`open`): asked of each wall of a tower's thousand rooms, where a few stand open.
  var wallOpenIx = { at: null, all: false, ids: null };
  function wallOpenSome(room) {
    var at = (typeof wallFloorsBatch !== "undefined" && wallFloorsBatch) || (typeof V3 !== "undefined" && V3 ? V3.picture || null : null);
    if (!wallOpenIx) { wallOpenIx = { at: null, all: false, ids: null }; }
    if (!at) {
      // (not while a picture is made: asked as it stands, nothing kept)
      var N = hand.nodes;
      for (var i = 0; i < N.length; i++) {
        var q = N[i];
        if (q.kind !== "i_room") { continue; }
        if (q.open && q.open.length) { return true; }
        if (q.openTo && q.openTo.length && (q === room || q.openTo.indexOf(room.id) >= 0)) { return true; }
      }
      return false;
    }
    if (wallOpenIx.at !== at || !wallOpenIx.ids) {
      var ids = new Set(), all = false;
      hand.nodes.forEach(function (o) {
        if (o.kind !== "i_room") { return; }
        if (o.open && o.open.length) { all = true; }
        if (o.openTo && o.openTo.length) { ids.add(o.id); o.openTo.forEach(function (id) { ids.add(id); }); }
      });
      wallOpenIx = { at: at, all: all, ids: ids };
    }
    return wallOpenIx.all || wallOpenIx.ids.has(room.id);
  }
  function wallOpenRuns(room, edge, boxOf) {
    var runs = [];
    if (!wallAnyOpen() || !wallOpenSome(room)) { return runs; }
    boxOf = boxOf || function (n) { return tieBox(n); };
    var B = boxOf(room), ox = room.x - (B.l + B.r) / 2, oy = room.y - (B.t + B.b) / 2;
    wallAcross(room, edge, boxOf).forEach(function (it) {
      if (!wallIsOpen(room, edge, it.room, it.facing)) { return; }
      var p = it.horiz ? [[it.lo, it.line], [it.hi, it.line]] : [[it.line, it.lo], [it.line, it.hi]];
      // (in the room's own numbers: from where it is drawn, not the box asked about)
      var a = wallAlong(room, edge, p[0][0] + ox, p[0][1] + oy), b = wallAlong(room, edge, p[1][0] + ox, p[1][1] + oy);
      runs.push({ a: Math.min(a, b), b: Math.max(a, b), other: it.room, it: it });
    });
    return runs;
  }
  // For 38-view3d.js: the parts of a wall to put up -- not those taken out.
  function wallKeepOpen(room, edge, base) {
    var runs = wallOpenRuns(room, edge);
    if (!runs.length) { return base; }
    return function (e2, a, b) {
      var kept = base ? base(e2, a, b) : [[a, b]];
      runs.forEach(function (r) {
        var next = [];
        kept.forEach(function (k) {
          if (r.b <= k[0] + 0.5 || r.a >= k[1] - 0.5) { next.push(k); return; }
          if (r.a > k[0]) { next.push([k[0], r.a]); }
          if (r.b < k[1]) { next.push([r.b, k[1]]); }
        });
        kept = next;
      });
      return kept;
    };
  }
  // A door left standing in a wall taken out: not put up.
  function wallDoorGone(d, near) {       // (near: the rooms by it, where they are known)
    if (!wallAnyOpen()) { return false; }
    // (a door's box is mostly the floor it swings over, to one side of its
    // wall: its middle half a door off the wall line -- 2026-10-04, two doors
    // stood in an open plan's opening, their wall gone round them)
    var reach = Math.max(14, Math.min(d.w || 0, d.h || 0) / 2 + 8);
    return (near || hand.nodes).some(function (room) {
      if (room.kind !== "i_room" || !insideArea(room, d.x, d.y, -reach)) { return false; }
      var t = turned(room);
      return WALL_EDGES.some(function (edge) {
        var out = wallOut(room, edge), half = Math.abs(out[1]) > 0.5 ? t.h / 2 : t.w / 2;
        var off = (d.x - room.x) * out[0] + (d.y - room.y) * out[1];
        if (Math.abs(off - half) > reach) { return false; }
        var at = wallAlong(room, edge, d.x, d.y);
        return wallOpenRuns(room, edge).some(function (r) { return at > r.a - 4 && at < r.b + 4; });
      });
    });
  }
  // What a stretch taken out carried, and so the beam over it: a floor
  // over it, or the middle of the roof (the ceiling's joists bear on the
  // wall down the middle of a house).  Laminated timber (LVL), a ply for
  // every 45 mm across, as deep as a span over 16 needs under a floor (over
  // 20 under only a roof) -- and past 7 m, steel.
  var LVL_DEPTHS = [241, 302, 356, 406, 457, 508, 610];      // mm: 9 1/2", 11 7/8", 14", 16", 18", 20", 24"
  function wallStructure(room, run, boxOf) {
    boxOf = boxOf || function (n) { return tieBox(n); };
    var px = FLOOR_PX, span = (run.b - run.a) / px, it = run.it;
    var floors = typeof floorsOf === "function" ? floorsOf() : [], f = floors.length ? floorAt(floors, room.x, room.y) : null;
    var level = f ? f.level : 0, mx = it.horiz ? (it.lo + it.hi) / 2 : it.line, my = it.horiz ? it.line : (it.lo + it.hi) / 2;
    var B0 = boxOf(room), ox = room.x - (B0.l + B0.r) / 2, oy = room.y - (B0.t + B0.b) / 2;
    var floorOver = typeof houseBuilt === "function" && floors.length > 1 && houseBuilt(floors, mx + ox + (f ? f.dx : 0), my + oy + (f ? f.dy : 0), level + 1);
    // the middle of the house, along its length
    var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_room" || (floors.length && floorAt(floors, n.x, n.y) !== f)) { return; }
      var Q = boxOf(n);
      b.l = Math.min(b.l, Q.l); b.r = Math.max(b.r, Q.r); b.t = Math.min(b.t, Q.t); b.b = Math.max(b.b, Q.b);
    });
    var long = b.r - b.l >= b.b - b.t, along = it.horiz === long;
    var spine = along && Math.abs(it.line - (it.horiz ? (b.t + b.b) / 2 : (b.l + b.r) / 2)) < 1.4 * px;
    var bearing = !!floorOver || spine, steel = span > 7.0;
    var need = Math.max(200, span * 1000 / (floorOver ? 16 : 20) * (steel ? 0.8 : 1));
    var depth = LVL_DEPTHS.filter(function (d) { return d >= need; })[0] || Math.ceil(need / 25) * 25;
    return { span: span, bearing: bearing, floorOver: !!floorOver, spine: spine, steel: steel, depth: depth,
             plies: span > 4.5 ? 3 : 2, middle: span > 6.0 };
  }
  // Where its posts stand: at the ends of the stretch, and in the middle of
  // a long one -- in the house as it stands.  None where it carried nothing.
  //
  // (2026-10-04: "an open concept house ... either poles in the house or
  // metal beams in the ceiling holding things up")  A house that says how
  // it is held up (`hand.house.support`, Start building's open plans):
  // "beams" -- steel over each line where walls came out, as long as the
  // line runs, wall to wall, a post only where its end has nothing under it
  // or past 9 m; "posts" -- a post every 3 m along each line, beams over
  // them.  The stretches along one line are one beam; a beam ending on
  // another, or on a wall, is held there.
  function wallPostSpots(room, run, boxOf) {
    var it = run.it, px = FLOOR_PX, s = wallStructure(room, run, boxOf), inset = 0.12 * px, out = [];
    var how = typeof houseOpt === "function" ? houseOpt("support") : "";
    if (how !== "beams" && how !== "posts") {
      if (!s.bearing) { return out; }
      var ends = [it.lo + inset, it.hi - inset];
      if (s.middle) { ends.push((it.lo + it.hi) / 2); }
      ends.forEach(function (v) { out.push(it.horiz ? [v, it.line] : [it.line, v]); });
      return out;
    }
    boxOf = boxOf || function (n) { return tieBox(n); };
    var floors = typeof floorsOf === "function" ? floorsOf() : [], f0 = floors.length ? floorAt(floors, room.x, room.y) : null;
    var lines = wallOpenLines(boxOf, floors, f0);
    // this stretch's whole line: the open stretches along it, end to end
    var line = wallLineOf(lines, it.horiz, it.line, it.lo, it.hi);
    var bearing = s.bearing || line.runs.some(function (l) { return l.bearing; });
    if (how === "beams" && !bearing && !wallBeamsShown()) { return out; }
    function at(v) { return it.horiz ? [v, it.line] : [it.line, v]; }
    // its ends: a post where nothing holds it
    if (Math.abs(line.lo - it.lo) < 2 && !wallHeld(lines, it.horiz, it.line, line.lo, -1, boxOf, floors, f0)) { out.push(at(it.lo + inset)); }
    if (Math.abs(line.hi - it.hi) < 2 && !wallHeld(lines, it.horiz, it.line, line.hi, 1, boxOf, floors, f0)) { out.push(at(it.hi - inset)); }
    // along it: no further apart than a beam that size spans
    var steel = s.steel || (typeof structKind === "function" && structKind() === "steel");
    var each = how === "posts" ? 3.0 : bearing ? (steel ? 9.0 : 6.0) : 0;
    if (each) {
      var len = line.hi - line.lo, n = Math.ceil(len / (each * px) - 1e-6);
      for (var k = 1; k < n; k++) {
        var v = line.lo + len * k / n;
        if (v > it.lo - 1 && v <= it.hi + 1) { out.push(at(v)); }
      }
    }
    return out;
  }
  function wallBeamsShown() { var b = typeof houseOpt === "function" ? houseOpt("beams") : ""; return b === "shown" || b === "open"; }
  // Every stretch taken out on a floor, in the house's numbers: which way it
  // runs, its line, from and to, and whether it carried anything.
  function wallOpenLines(boxOf, floors, f0) {
    var out = [];
    hand.nodes.forEach(function (o) {
      if (o.kind !== "i_room" || ((o.turn || 0) % 90) || !wallSomeOpen(o)) { return; }
      if (floors.length && floorAt(floors, o.x, o.y) !== f0) { return; }
      var B = boxOf(o);
      WALL_EDGES.forEach(function (edge) {
        var horiz = edge === "top" || edge === "foot";
        wallOpenRuns(o, edge, boxOf).forEach(function (r) {
          var base = horiz ? B.l : B.t;
          out.push({ horiz: horiz, line: edge === "top" ? B.t : edge === "foot" ? B.b : edge === "left" ? B.l : B.r,
                     lo: base + r.a, hi: base + r.b, bearing: wallStructure(o, r, boxOf).bearing });
        });
      });
    });
    return out;
  }
  // The stretches along one line, touching end to end, as one.
  function wallLineOf(lines, horiz, at, lo, hi) {
    var mine = lines.filter(function (l) { return l.horiz === horiz && Math.abs(l.line - at) < 4; }), got = { lo: lo, hi: hi, runs: [] }, grew = true;
    while (grew) {
      grew = false;
      mine.forEach(function (l) {
        if (got.runs.indexOf(l) >= 0 || l.hi < got.lo - 6 || l.lo > got.hi + 6) { return; }
        got.runs.push(l);
        if (l.lo < got.lo) { got.lo = l.lo; grew = true; }
        if (l.hi > got.hi) { got.hi = l.hi; grew = true; }
      });
    }
    return got;
  }
  // Whether a beam's end at `v` along its line is held: the wall it was
  // part of goes on past it, a wall stands across it there, or another
  // beam runs across it there (and on past it both ways).
  function wallHeld(lines, horiz, line, v, dir, boxOf, floors, f0) {
    var step = 0.25 * FLOOR_PX, p = horiz ? [v, line] : [line, v];
    var past = horiz ? [v + dir * step, line] : [line, v + dir * step];
    if (wallStandsAt(past[0], past[1], horiz, boxOf, floors, f0)) { return true; }
    var n = horiz ? [0, 1] : [1, 0];
    if (wallStandsAt(p[0] + n[0] * step, p[1] + n[1] * step, !horiz, boxOf, floors, f0) ||
        wallStandsAt(p[0] - n[0] * step, p[1] - n[1] * step, !horiz, boxOf, floors, f0)) { return true; }
    // (the beam across: along the other way, through this end, and on past it both ways)
    var across = wallLineOf(lines, !horiz, v, line, line);
    return across.runs.length > 0 && across.lo < line - step && across.hi > line + step;
  }
  // Whether a wall stands through a point, running across (`horiz`) or down:
  // a room's side there -- an outside wall too -- not taken out at that spot.
  function wallStandsAt(x, y, horiz, boxOf, floors, f0) {
    return hand.nodes.some(function (o) {
      if (o.kind !== "i_room" || ((o.turn || 0) % 90)) { return false; }
      if (floors.length && floorAt(floors, o.x, o.y) !== f0) { return false; }
      var B = boxOf(o);
      return WALL_EDGES.some(function (edge) {
        if ((edge === "top" || edge === "foot") !== horiz) { return false; }
        var lineAt = edge === "top" ? B.t : edge === "foot" ? B.b : edge === "left" ? B.l : B.r;
        if (Math.abs((horiz ? y : x) - lineAt) > 3) { return false; }
        var v = horiz ? x : y, lo = horiz ? B.l : B.t, hi = horiz ? B.r : B.b;
        if (v < lo + 1 || v > hi - 1) { return false; }
        var along = v - lo;
        return !wallOpenRuns(o, edge, boxOf).some(function (r) { return along > r.a - 1 && along < r.b + 1; });
      });
    });
  }
  // The beams, drawn by one of the two rooms (the one first in the drawing).
  function wallBeams(faces, room, edge) {
    var px = FLOOR_PX, ceil = ceilOf(room) * px;
    wallOpenRuns(room, edge).forEach(function (r) {
      if (r.other.id < room.id) { return; }
      var s = wallStructure(room, r);
      if (!s.bearing) { return; }
      var depth = s.depth / 1000 * px, half = (s.steel ? 0.1 : 0.045 * s.plies) * px / 2 + 1;
      var hw = room.w / 2, hh = room.h / 2;
      var look = { piece: true, color: s.steel ? "#5d6166" : styleTrimFor("#f1eee8"), edge: "#8a8780", beam: true };
      if (edge === "top" || edge === "foot") {
        var y = edge === "top" ? -hh : hh;
        v3Box(faces, room, r.a - hw, r.b - hw, y - half, y + half, ceil - depth, ceil - 0.5, look);
      } else {
        var x = edge === "left" ? -hw : hw;
        v3Box(faces, room, x - half, x + half, r.a - hh, r.b - hh, ceil - depth, ceil - 0.5, look);
      }
    });
  }
  function styleTrimFor(plain) { return typeof styleTrim === "function" ? styleTrim(plain) : plain; }
  // Walking, the floor where a wall was is walked over.
  if (typeof walkPlan === "function") {
    var walkPlanOpen = walkPlan;
    walkPlan = function () {
      var plan = walkPlanOpen.apply(this, arguments);
      try { wallOpenCells(plan); } catch (e) { /* walls as drawn */ }
      return plan;
    };
  }
  function wallOpenCells(plan) {
    if (!plan.cells || !wallAnyOpen()) { return; }
    var was = wallFloorsBatch;
    wallFloorsBatch = wallFloorsBatch || {};
    try { wallOpenCellsAll(plan); } finally { wallFloorsBatch = was; }
  }
  function wallOpenCellsAll(plan) {
    plan.rooms.forEach(function (room) {
      WALL_EDGES.forEach(function (edge) {
        var runs = wallOpenRuns(room, edge);
        if (!runs.length) { return; }
        var t = turned(room);
        var out = wallOut(room, edge), half = Math.abs(out[1]) > 0.5 ? t.h / 2 : t.w / 2;
        // (only the strip along that wall: a tower's corridor sixty metres long was every cell of a
        // square sixty metres across, four times)
        var lo = half - 14, hi = half + 12, ax = Math.abs(out[1]) > 0.5;
        var xa = ax ? room.x - t.w / 2 - 12 : room.x + out[0] * (out[0] > 0 ? lo : hi), xb = ax ? room.x + t.w / 2 + 12 : room.x + out[0] * (out[0] > 0 ? hi : lo);
        var ya = ax ? room.y + out[1] * (out[1] > 0 ? lo : hi) : room.y - t.h / 2 - 12, yb = ax ? room.y + out[1] * (out[1] > 0 ? hi : lo) : room.y + t.h / 2 + 12;
        var c0 = Math.max(0, Math.floor((xa - plan.x0) / WALK_CELL) - 1), c1 = Math.min(plan.cols - 1, Math.ceil((xb - plan.x0) / WALK_CELL) + 1);
        var r0 = Math.max(0, Math.floor((ya - plan.y0) / WALK_CELL) - 1), r1 = Math.min(plan.rows - 1, Math.ceil((yb - plan.y0) / WALK_CELL) + 1);
        for (var row = r0; row <= r1; row++) {
          for (var col = c0; col <= c1; col++) {
            var i = row * plan.cols + col;
            if (plan.cells[i] !== 1) { continue; }
            var x = plan.x0 + (col + 0.5) * WALK_CELL, y = plan.y0 + (row + 0.5) * WALK_CELL;
            var off = (x - room.x) * out[0] + (y - room.y) * out[1];
            if (off < half - 14 || off > half + 12) { continue; }
            var at = wallAlong(room, edge, x, y);
            if (runs.some(function (r) { return at > r.a + 6 && at < r.b - 6; })) { plan.cells[i] = 0; }
          }
        }
      });
    });
  }

  // ---- on the plan -------------------------------------------------------------------------
  // A side taken out drawn as a thin dashed line, not a wall.
  if (typeof ICONS === "object" && ICONS.i_room && typeof ICONS.i_room.art === "function") {
    var roomArtWalls = ICONS.i_room.art;
    ICONS.i_room.art = function (w, h) {
      var n = typeof iconNode !== "undefined" && iconNode && iconNode.kind === "i_room" ? iconNode : null;
      if (!n || !wallAnyOpen() || ((n.turn || 0) % 90)) { return roomArtWalls(w, h); }
      // each side's stretches taken out -- toward whichever room -- as they lie on the paper
      var gaps = {}, any = false;
      WALL_EDGES.forEach(function (e) {
        gaps[e] = wallOpenRuns(n, e).map(function (r) { return [r.a, r.b]; });
        if (!gaps[e].length && (n.open || []).indexOf(e) >= 0 && !(n.w > w + 1 || n.h > h + 1)) { gaps[e] = []; }
        if (gaps[e].length) { any = true; }
      });
      if (!any) { return roomArtWalls(w, h); }
      function r(x, y, ww, hh) { return "M" + x + " " + y + " H" + (x + ww) + " V" + (y + hh) + " H" + x + " Z"; }
      var T = Math.max(1, Math.min(6, Math.min(w, h) * 0.06)), parts = ["o " + r(0, 0, w, h)], solid = [], dashed = [];
      WALL_EDGES.forEach(function (e) {
        var len = e === "top" || e === "foot" ? w : h, at = 0, cuts = gaps[e].slice().sort(function (p, q) { return p[0] - q[0]; });
        function band(a, b, open) {
          if (b - a < 0.5) { return; }
          if (e === "top") { (open ? dashed : solid).push(open ? "M" + a + " " + T / 2 + " H" + b : r(a, 0, b - a, T)); }
          else if (e === "foot") { (open ? dashed : solid).push(open ? "M" + a + " " + (h - T / 2) + " H" + b : r(a, h - T, b - a, T)); }
          else if (e === "left") { (open ? dashed : solid).push(open ? "M" + T / 2 + " " + a + " V" + b : r(0, a, T, b - a)); }
          else { (open ? dashed : solid).push(open ? "M" + (w - T / 2) + " " + a + " V" + b : r(w - T, a, T, b - a)); }
        }
        cuts.forEach(function (c) { band(at, Math.max(at, c[0]), false); band(Math.max(at, c[0]), Math.min(len, c[1]), true); at = Math.max(at, c[1]); });
        band(at, len, false);
      });
      if (solid.length) { parts.push("k " + solid.join(" ")); }
      if (dashed.length) { parts.push("t- " + dashed.join(" ")); }
      return parts;
    };
  }

  // ---- in a room's panel: its walls ---------------------------------------------------------
  // Each side: the room across it, and a switch to take the wall out -- not
  // an outside wall; what the opening then needs said under it, and its
  // posts put up for it.
  // A post where 3D puts it: moved with its room (39-join.js).
  function wallPostAt(W, n) {
    var m = W.J && W.J.moves && W.J.moves[n.id];
    if (m) { return [m.x, m.y]; }
    var holder = n.postFor ? nodeById(parseInt(n.postFor, 10)) : null;
    if (!holder) {
      holder = hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(r, n.x, n.y, 20); })
        .sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
    }
    var d = holder ? W.delta(holder) : [0, 0];
    return [n.x + d[0], n.y + d[1]];
  }
  function wallPostNear(W, p, far) {
    return hand.nodes.some(function (n) {
      if (n.kind !== "i_post") { return false; }
      var q = wallPostAt(W, n);
      return Math.hypot(q[0] - p[0], q[1] - p[1]) < far;
    });
  }
  function wallJoined() {
    var J = typeof tieLayout === "function" ? tieLayout() : null;
    return {
      J: J,
      box: function (n) { return J && J.boxes[n.id] ? J.boxes[n.id] : tieBox(n); },
      delta: function (n) { return J && J.delta[n.id] ? J.delta[n.id] : [0, 0]; }
    };
  }
  // What each opening of a room's side is, worked out in the house as it
  // stands -- the rooms where 3D puts them, the floor over each where it
  // truly is -- and handed back as numbers: how long, what it carried, and
  // where its posts go (in the house's numbers).
  var wallInfo = (typeof tieWith === "function" ? tieWith : function (f) { return f; })(function (roomId, edge) {
    var room = nodeById(roomId);
    if (!room) { return []; }
    return wallOpenRuns(room, edge).map(function (run) {
      return { other: run.other.id, a: run.a, b: run.b, s: wallStructure(room, run), spots: wallPostSpots(room, run) };
    });
  }, 1);
  function wallSides(room) {
    var W = wallJoined();
    return WALL_EDGES.map(function (edge) {
      var across = wallAcross(room, edge, W.box);
      return { edge: edge, across: across, open: (room.open || []).indexOf(edge) >= 0 ||
               across.some(function (it) { return wallIsOpen(room, edge, it.room, it.facing); }) };
    });
  }
  function wallSet(room, edge, open) {
    keepUndo();
    var W = wallJoined(), across = wallAcross(room, edge, W.box);
    function mark(n, e, on) {
      var list = (n.open || []).filter(function (x) { return x !== e; });
      if (on) { list.push(e); }
      if (list.length) { n.open = list; } else { delete n.open; }
    }
    // (this room's side only: the room across may have walls to others along it, still standing)
    mark(room, edge, open);
    if (!open) {
      across.forEach(function (it) {
        if (it.facing) { mark(it.room, it.facing, false); }
        // (and a stretch taken out to that room alone, put back)
        [[room, it.room], [it.room, room]].forEach(function (pair) {
          var to = (pair[0].openTo || []).filter(function (id) { return id !== pair[1].id; });
          if (to.length) { pair[0].openTo = to; } else { delete pair[0].openTo; }
        });
      });
    }
    // its posts: put up with the opening where the wall carried something, taken down with it
    var tag = room.id + ":" + edge;
    hand.nodes = hand.nodes.filter(function (n) { return !(n.kind === "i_post" && n.postFor === tag); });
    if (open) {
      var d = W.delta(room);
      wallInfo(room.id, edge).forEach(function (info) {
        if (!info.spots.length) { return; }        // (it carried nothing, and needs nothing under it)
        info.spots.forEach(function (p) {
          if (wallPostNear(W, p, 0.35 * FLOOR_PX)) { return; }      // one there already: where two openings meet
          var post = adviceAdd("i_post", Math.round(p[0] - d[0]), Math.round(p[1] - d[1]));
          post.postFor = tag; post.tall = ceilOf(room); post.own = true;
        });
      });
    }
    picked = room.id;
    if (typeof handKeep === "function") { handKeep(); }
    drawHand(); drawHandPanel(); showReport();
    if (typeof V3 !== "undefined" && V3) { V3.dirty = true; V3.ground = null; }
  }
  function wallSays(room, edge, info) {
    var s = info.s, span = lengthSays(info.b - info.a) + " " + (TXT.fp_unit || "m");
    if (!s.bearing) { return say("wo_free", { span: span }); }
    var beam;
    if (s.steel) { beam = say("wo_steel", { depth: wallDepthSays(s.depth) }); }
    else { beam = say("wo_lvl", { plies: s.plies, depth: wallDepthSays(s.depth) }); }
    return say(s.floorOver ? "wo_carries_floor" : "wo_carries_roof", { span: span, beam: beam }) + (s.middle ? " " + TXT.wo_mid_post : "");
  }
  function wallDepthSays(mm) {
    if (typeof feetHere === "function" && feetHere()) {
      var inch = { 241: "9½", 302: "11⅞", 356: "14", 406: "16", 457: "18", 508: "20", 610: "24" }[mm] || String(Math.round(mm / 25.4));
      return inch + "″";
    }
    return mm + " mm";
  }
  var EDGE_WORD = { top: "wo_top", foot: "wo_foot", left: "wo_left", right: "wo_right" };
  function wallSection(box, room) {
    if ((room.turn || 0) % 90) { return; }
    var sec = document.createElement("div");
    sec.className = "dz-walls";
    var head = document.createElement("div");
    head.className = "dz-small dz-sub-head";
    head.textContent = TXT.wo_head;
    sec.appendChild(head);
    wallSides(room).forEach(function (side) {
      var row = document.createElement("label");
      row.className = "switch wide dz-wall-row";
      var who = side.across.map(function (it) { return roomLabel(it.room) || roomCalled(it.room) || kindName("i_room"); });
      var outside = !side.across.length;
      row.innerHTML = '<span><b></b><small></small></span><input type="checkbox">';
      row.querySelector("b").textContent = TXT[EDGE_WORD[side.edge]];
      row.querySelector("small").textContent = outside ? TXT.wo_outside : (side.open ? say("wo_open_to", { room: who.join(", ") }) : say("wo_wall_to", { room: who.join(", ") }));
      var box2 = row.querySelector("input");
      box2.checked = side.open && !outside;
      box2.disabled = outside;
      if (outside) { row.title = TXT.wo_outside_tip; }
      box2.onchange = function () { wallSet(room, side.edge, box2.checked); };
      sec.appendChild(row);
      if (side.open && !outside) {
        wallInfo(room.id, side.edge).forEach(function (info) {
          var p = document.createElement("p");
          p.className = "dz-wall-says";
          p.textContent = wallSays(room, side.edge, info);
          sec.appendChild(p);
        });
      }
    });
    box.appendChild(sec);
  }
  // (Put in the room's card on the Chart side by designPanel, 39-design.js,
  // where its size is: what the room is made of is on the Style side.)
  // Check: an opening in a wall that carried something, with nothing under
  // the beam's ends -- its posts taken away.
  if (typeof homeAdvice === "function") {
    var homeAdviceWalls = homeAdvice;
    homeAdvice = function () {
      var tips = homeAdviceWalls.apply(this, arguments);
      var was = wallFloorsBatch;
      try {
        if (!wallAnyOpen()) { return tips; }
        wallFloorsBatch = wallFloorsBatch || {};
        var W = wallJoined(), done = {}, px = FLOOR_PX;
        hand.nodes.forEach(function (room) {
          if (!wallSomeOpen(room)) { return; }
          WALL_EDGES.forEach(function (edge) {
            wallInfo(room.id, edge).forEach(function (info) {
              var key = [Math.min(room.id, info.other), Math.max(room.id, info.other)].join("|");
              if (done[key] || !info.spots.length) { return; }
              done[key] = true;
              var d = W.delta(room);
              // a post there: any post, in the house as it stands, within half a metre
              var missing = info.spots.filter(function (p) { return !wallPostNear(W, p, 0.5 * px); });
              if (!missing.length) { return; }
              var other = nodeById(info.other), plan = walkPlan();
              tips.push({ text: say("ad_beam_posts", { a: roomName(plan, room), b: other ? roomName(plan, other) : "" }), id: room.id, warn: true,
                          key: "s_advice", fix: { auto: true, says: TXT.wo_add_posts, go: function () {
                            keepUndo();
                            missing.forEach(function (p) {
                              var post = adviceAdd("i_post", Math.round(p[0] - d[0]), Math.round(p[1] - d[1]));
                              post.postFor = room.id + ":" + edge; post.tall = ceilOf(room); post.own = true;
                            });
                            if (typeof handKeep === "function") { handKeep(); }
                            drawHand(); drawHandPanel();
                          } } });
            });
          });
        });
      } catch (e) { /* the advice as it was */ } finally { wallFloorsBatch = was; }
      return tips;
    };
  }
