// ---------------------------------------------------------------------------
//  40-tour.js -- walking round a house in 3D: seeing it as wide as the eye
//  does, each room's size said where you stand
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "when you tour the house it is way smaller than
  // the numbers given ... so the numbers are more accurate when walking
  // around", "when you go to explore houses they are bigger than what you
  // are expecting so it is easier to walk around")
  //
  // The rooms were the size they said; the view made them look less.  It
  // saw 75 degrees across, a narrower view than an eye's, so every wall
  // came up close, as through a long lens.  It now sees about as wide as
  // a person does -- 70 degrees up and down, as wide across as the window
  // allows -- and the room you stand in is named with its size.

  // ---- as wide as an eye sees ------------------------------------------------------------
  var TOUR_UPDOWN = 70 * Math.PI / 180;
  function tourFov(w, h) {
    var across = 2 * Math.atan(Math.tan(TOUR_UPDOWN / 2) * Math.max(0.3, w / Math.max(1, h)));
    return Math.max(72 * Math.PI / 180, Math.min(105 * Math.PI / 180, across));
  }
  if (typeof v3Draw === "function") {
    var v3DrawNarrow = v3Draw;
    v3Draw = function () {
      if (V3 && V3.box) {
        var r = V3.box.getBoundingClientRect();
        if (r.width > 1 && r.height > 1) { V3_FOV = tourFov(r.width, r.height); }
      }
      return v3DrawNarrow.apply(this, arguments);
    };
  }

  // ---- the room's size, where you stand ------------------------------------------------------
  // "Living room · 19′ × 15′" -- in the units the plan's sizes are in.
  function tourSize(n) {
    var t = (((n.turn || 0) % 180) + 180) % 180 === 90, w = (t ? n.h : n.w) / FLOOR_PX, d = (t ? n.w : n.h) / FLOOR_PX;
    if (feetHere()) { return Math.round(w / 0.3048) + "′ × " + Math.round(d / 0.3048) + "′"; }
    function m(v) { var r = Math.round(v * 10) / 10; try { return r.toLocaleString(LANG, { maximumFractionDigits: 1 }); } catch (e) { return String(r); } }
    return m(w) + " × " + m(d) + " m";
  }
  if (typeof v3Map === "function") {
    var v3MapPlain = v3Map;
    v3Map = function () {
      var out = v3MapPlain.apply(this, arguments);
      try {
        var where = V3 && el(".v3-where", V3.box);
        if (where && V3.me) {
          var room = roomAt(v3Ground(), V3.me.x, V3.me.y);
          if (room) {
            var said = where.textContent + " · " + tourSize(room);
            if (where.textContent.indexOf("×") < 0) { where.textContent = said; }
          }
        }
      } catch (e) { /* named, without its size */ }
      return out;
    };
  }

  // ---- seeing yourself ----------------------------------------------------------------------
  // (asked for, 2026-10-02: "so you can actually see yourself instead of
  // being invisible")  The one walking has a body: looked down at, your
  // chest, your arms and legs and shoes, swinging as you go and throwing a
  // shadow; and with "See me" the view stands back behind you, so you watch
  // yourself walk round the house -- never back through a wall.
  var TOUR_ME = { shirt: "#3e6d9a", pants: "#2e3846", shoes: "#2b2623", skin: "#d6a689", hair: "#4a3426" };
  function tourFace(faces, pts, how) {
    var a = pts[0], b = pts[1], c = pts[2];
    var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
    faces.push({ pts: pts, n: [nx / l, ny / l, nz / l], how: how, me: true });
  }
  // A round limb from one point to another, eight sides round.
  function tourLimb(faces, a, b, r0, r1, how) {
    var ax = b[0] - a[0], ay = b[1] - a[1], az = b[2] - a[2], l = Math.hypot(ax, ay, az) || 1;
    ax /= l; ay /= l; az /= l;
    var ux = Math.abs(az) < 0.9 ? -ay : 1, uy = Math.abs(az) < 0.9 ? ax : 0, uz = 0, ul = Math.hypot(ux, uy, uz) || 1;
    ux /= ul; uy /= ul;
    var wx = ay * uz - az * uy, wy = az * ux - ax * uz, wz = ax * uy - ay * ux, S = 8;
    function ring(t, at, r) { var c = Math.cos(t) * r, s = Math.sin(t) * r; return [at[0] + ux * c + wx * s, at[1] + uy * c + wy * s, at[2] + uz * c + wz * s]; }
    for (var i = 0; i < S; i++) {
      var t0 = i / S * Math.PI * 2, t1 = (i + 1) / S * Math.PI * 2;
      tourFace(faces, [ring(t0, a, r0), ring(t1, a, r0), ring(t1, b, r1), ring(t0, b, r1)], how);
    }
  }
  // A rounded lump about a point, its three half-sizes along the body's
  // own ways (`f` forward, `s` to the side, and up).
  function tourLump(faces, c, f, s, rf, rs, ru, how) {
    GL3_BLOB.forEach(function (t) {
      tourFace(faces, t.map(function (p) {
        return [c[0] + f[0] * p[0] * rf + s[0] * p[1] * rs, c[1] + f[1] * p[0] * rf + s[1] * p[1] * rs, c[2] + p[2] * ru];
      }), how);
    });
  }
  // (k: how big, a child smaller; others: somebody else -- the faces not
  // marked as your own, so they can be taken hold of, 40-drag.js)
  function tourBody(faces, x, y, z, head, phase, look, withHead, k, others) {
    var P = FLOOR_PX * (k || 1), f = [Math.cos(head), Math.sin(head)], s = [-Math.sin(head), Math.cos(head)], f0 = faces.length;
    function at(fw, sd, up) { return [x + f[0] * fw * P + s[0] * sd * P, y + f[1] * fw * P + s[1] * sd * P, z + up * P]; }
    function how(c) { return { piece: true, color: c, edge: c, bare: true }; }
    var shirt = how(look.shirt), pants = how(look.pants), shoes = how(look.shoes), skin = how(look.skin), hair = how(look.hair);
    var swing = Math.sin(phase) * 0.42, lift = Math.max(0, Math.cos(phase)) * 0.06;
    [-1, 1].forEach(function (side) {
      // a leg: hip to knee to ankle, swung forward and back as it walks
      var sw = swing * side, hip = at(0, side * 0.1, 0.93);
      var knee = at(Math.sin(sw) * 0.42, side * 0.1, 0.93 - Math.cos(sw) * 0.42 + (side > 0 ? lift : 0));
      var bend = sw > 0 ? sw * 0.6 : 0;
      var ankle = at(Math.sin(sw) * 0.42 + Math.sin(sw - bend) * 0.42, side * 0.1, Math.max(0.08, 0.93 - Math.cos(sw) * 0.42 - Math.cos(sw - bend) * 0.42));
      if (withHead) { tourLimb(faces, hip, knee, 0.075 * P, 0.06 * P, pants); }
      else {
        // through your own eyes, from above the knee, rounded off: an open
        // leg seen end on was a dark hole
        var thigh = [hip[0] + (knee[0] - hip[0]) * 0.5, hip[1] + (knee[1] - hip[1]) * 0.5, hip[2] + (knee[2] - hip[2]) * 0.5];
        tourLimb(faces, thigh, knee, 0.067 * P, 0.06 * P, pants);
        tourLump(faces, thigh, f, s, 0.067 * P, 0.067 * P, 0.05 * P, pants);
      }
      tourLimb(faces, knee, ankle, 0.06 * P, 0.045 * P, pants);
      var toe = [ankle[0] + f[0] * 0.17 * P, ankle[1] + f[1] * 0.17 * P, ankle[2] - 0.04 * P];
      tourLimb(faces, [ankle[0] - f[0] * 0.07 * P, ankle[1] - f[1] * 0.07 * P, ankle[2] - 0.04 * P], toe, 0.05 * P, 0.045 * P, shoes);
      // an arm, swung the other way (not looked down at through your own
      // eyes: a shoulder a hand from the eye only fills the view)
      if (!withHead) { return; }
      var as = -swing * side * 0.8, sh = at(0, side * 0.21, 1.42);
      var elbow = at(Math.sin(as) * 0.3, side * 0.24, 1.42 - Math.cos(as) * 0.3);
      var wrist = at(Math.sin(as) * 0.3 + Math.sin(as + 0.25) * 0.27, side * 0.25, 1.42 - Math.cos(as) * 0.3 - Math.cos(as + 0.25) * 0.27);
      tourLimb(faces, sh, elbow, 0.055 * P, 0.045 * P, shirt);
      tourLimb(faces, elbow, wrist, 0.045 * P, 0.036 * P, skin);
      tourLump(faces, wrist, f, s, 0.05 * P, 0.03 * P, 0.06 * P, skin);
    });
    if (withHead) {
      tourLump(faces, at(0, 0, 0.96), f, s, 0.11 * P, 0.17 * P, 0.11 * P, pants);     // hips
      tourLump(faces, at(0.01, 0, 1.14), f, s, 0.12 * P, 0.17 * P, 0.17 * P, shirt);  // the middle
      tourLump(faces, at(0, 0, 1.33), f, s, 0.12 * P, 0.21 * P, 0.14 * P, shirt);     // the chest and shoulders
      tourLimb(faces, at(0, 0, 1.43), at(0, 0, 1.53), 0.05 * P, 0.048 * P, skin);     // the neck
      tourLump(faces, at(0.01, 0, 1.63), f, s, 0.1 * P, 0.085 * P, 0.115 * P, skin);
      tourLump(faces, at(-0.015, 0, 1.68), f, s, 0.1 * P, 0.09 * P, 0.085 * P, hair);
    }
    if (others) { for (var i = f0; i < faces.length; i++) { delete faces[i].me; } }
  }

  // ---- everybody else, in 3D too ------------------------------------------------------------
  // (asked for, 2026-10-03: "update the people actors to be modeled properly
  // now in 3d when walking around")  Those drawn on the plan, the one a run
  // walks round, and the people out on the street were pictures turned to
  // face the eye; now each is a body like your own -- arms, legs, a head --
  // standing as they were put, or walking with their arms and legs swinging.
  // Each their own: skin, hair and clothes picked by who they are (the
  // clothes the colors they have on the plan, where they have some).
  var PEOPLE_SKIN = ["#f3cfb3", "#e2b48f", "#c98f68", "#a26a46", "#7a4b30", "#5a3522"];
  var PEOPLE_HAIR = ["#1f1a17", "#3a2a1f", "#5b3b24", "#8a6238", "#c49a62", "#2b2b2b"];
  var PEOPLE_SHIRT = ["#7f8794", "#a65a44", "#4f7d5c", "#2f4a6a", "#c9a227", "#b03a48", "#e8e2d6", "#6a4c93", "#d9822b", "#f4f1ea",
                      "#3f4a52", "#8fb3c9", "#c46a8a", "#5b6b3a"];
  var PEOPLE_PANTS = ["#2e3846", "#3b3b3e", "#4d4033", "#25303d", "#5a5f66", "#6b5a45"];
  function peopleSize(kind) { return kind === "i_child" ? 0.66 : kind === "i_elder" ? 0.95 : 1; }
  function peopleLook(n, look, seed) {
    var r = typeof gl3Rand === "function" ? gl3Rand((seed || 1) * 7919 + 13) : Math.random;
    function pick(list) { return list[Math.floor(r() * list.length) % list.length]; }
    var out = { skin: pick(PEOPLE_SKIN), hair: pick(PEOPLE_HAIR), shirt: pick(PEOPLE_SHIRT), pants: pick(PEOPLE_PANTS),
                shoes: pick(["#2b2623", "#1d1d1f", "#5a4632", "#e9e6e0"]) };
    if (n && n.kind === "i_elder") { out.hair = pick(["#b9b6b0", "#d8d5cf", "#8f8c86"]); }
    // the clothes as colored for this one (not their kind's colors: every
    // man in the house had the one shirt), or as handed in (out on the street)
    var mine = n && n.id && style && style.nodes ? style.nodes["h" + n.id] : null;
    var wear = look && look.own ? look : mine || null, paper = simSheet();
    if (wear && wear.fill && wear.fill !== paper && wear.fill !== "#ffffff") { out.shirt = tourHex(wear.fill); }
    if (wear && wear.line && wear.line !== simInk() && wear.line !== wear.fill) { out.pants = tourHex(v3Mix(wear.line, "#2e3846", 0.5)); }
    return out;
  }
  // A person as a body: `n` the one drawn (its kind, its number, its
  // colors), facing `head`, `phase` how far through a step (0 standing).
  function peopleBody(faces, n, x, y, z, head, phase, look, fade) {
    var f0 = faces.length, id = n && n.id ? n.id : 1;
    tourBody(faces, x, y, z, head, phase, peopleLook(n, look, id), true, peopleSize(n && n.kind) * (0.97 + ((id * 37) % 7) / 100), true);
    for (var i = f0; i < faces.length; i++) {
      faces[i].person = true;
      if (fade !== undefined && fade < 0.999) { faces[i].how = Object.assign({}, faces[i].how, { alpha: fade, late: true }); }
    }
  }
  // which way one drawn on the plan faces: as a chair does, its front
  function peopleFacing(n) { var t = (n.turn || 0) * Math.PI / 180; return Math.atan2(Math.cos(t), -Math.sin(t)); }
  // In the colors of the person you are, where you started as one drawn on the plan.
  function tourHex(c) {
    var m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(String(c || ""));
    if (!m) { return c; }
    return "#" + [m[1], m[2], m[3]].map(function (v) { return ("0" + (+v).toString(16)).slice(-2); }).join("");
  }
  function tourLook() {
    var look = Object.assign({}, TOUR_ME);
    var who = V3 && V3.me && V3.me.as ? nodeById(V3.me.as) : null;
    if (who) {
      var l = simLook(who);
      if (l && l.fill) { look.shirt = l.fill; }
      if (l && l.line && l.line !== l.fill) { look.pants = tourHex(v3Mix(l.line, "#2e3846", 0.5)); }
    }
    return look;
  }
  function tourBehind() {
    try { return localStorage.getItem("flowchart-3d-me") === "behind"; } catch (e) { return false; }
  }
  // Where the view stands, behind you: as far back as the room lets it (the
  // walk's own plan of walls), a little over your head, looking at you.
  function tourStandBack(plan, me, eye) {
    var P = FLOOR_PX, dx = -Math.cos(me.head), dy = -Math.sin(me.head), want = 2.4 * P, got = want;
    if (plan.cells) {
      for (var d = 4; d <= want; d += 4) {
        var x = me.x + dx * d, y = me.y + dy * d;
        var c = Math.floor((x - plan.x0) / WALK_CELL), r = Math.floor((y - plan.y0) / WALK_CELL);
        if (c < 0 || r < 0 || c >= plan.cols || r >= plan.rows) { continue; }
        var cell = plan.cells[r * plan.cols + c];
        if (cell === 1 || cell === 2) { got = Math.max(0.5 * P, d - 0.35 * P); break; }
      }
    }
    var z = eye.z + 0.42 * P * Math.min(1, got / want);
    if (typeof terrGround === "function" && !V3.inRoom) { z = Math.max(z, terrGround(eye.x + dx * got, eye.y + dy * got) + 0.6 * P); }
    if (V3.inRoom) { z = Math.min(z, eye.z - EYE_TALL * P + (ceilOf(V3.inRoom) - 0.15) * P); }
    return { x: eye.x + dx * got, y: eye.y + dy * got, z: z };
  }
  if (typeof v3Build === "function") {
    var v3BuildBodiless = v3Build;
    v3Build = function () {
      var model = v3BuildBodiless.apply(this, arguments);
      try {
        if (V3 && V3.mode === "walk" && V3.me && V3.eye && V3.scene !== "space" && model.faces) {
          var me = V3.me, P = FLOOR_PX, behind = tourBehind();
          // how far along a step: from how far you have walked
          var moved = V3.tourAt ? Math.hypot(me.x - V3.tourAt[0], me.y - V3.tourAt[1]) : 0;
          V3.tourAt = [me.x, me.y];
          V3.tourPhase = ((V3.tourPhase || 0) + moved / (0.36 * P)) % (Math.PI * 2);
          if (!moved && Math.abs(Math.sin(V3.tourPhase)) > 0.03) {        // standing still: feet together again
            V3.tourPhase = Math.round(V3.tourPhase / Math.PI) * Math.PI * 0.3 + V3.tourPhase * 0.7;
            V3.dirty = true;
          }
          // (the eye as v3Draw put it, even if a picture is built twice)
          var eye = V3.eye.me || V3.eye, feet = eye.z - (V3.sitting ? 1.12 : EYE_TALL) * P;
          // looked down at through your own eyes, your legs and feet under
          // you; from behind, all of you
          var back = behind ? 0 : -0.06 * P;
          tourBody(model.faces, eye.x + Math.cos(me.head) * back, eye.y + Math.sin(me.head) * back, feet,
                   me.head, V3.tourPhase, tourLook(), behind);
          if (behind) { var cam = tourStandBack(v3Ground(), me, eye); cam.me = eye; V3.eye = cam; }
        }
      } catch (e) { /* walking unseen, as before */ }
      return model;
    };
  }
  // Seen from behind, the view looks down at you a little (and the names
  // over things are put where that view sees them).
  if (typeof v3EyeOf === "function") {
    var v3EyeOfLevel = v3EyeOf;
    v3EyeOf = function () {
      if (!V3 || !V3.me || V3.mode !== "walk" || !V3.eye || !V3.eye.me) { return v3EyeOfLevel.apply(this, arguments); }
      var keep = V3.me.pitch;
      V3.me.pitch = keep - 0.16;
      try { return v3EyeOfLevel.apply(this, arguments); } finally { V3.me.pitch = keep; }
    };
  }
  if (typeof gl3Eye === "function") {
    var gl3EyeLevel = gl3Eye;
    gl3Eye = function () {
      if (!V3 || !V3.me || V3.mode !== "walk" || !V3.eye || !V3.eye.me) { return gl3EyeLevel.apply(this, arguments); }
      var keep = V3.me.pitch;
      V3.me.pitch = keep - 0.16;
      try { return gl3EyeLevel.apply(this, arguments); } finally { V3.me.pitch = keep; }
    };
  }

  // ---- buttons: Back to the plan, and See me ------------------------------------------------------
  // (2026-10-02: "for it to be more straight forward and easy to go back")
  // A Back button first on the bar, walking or not -- and Esc does the same.
  // (in the groups already there: other parts count on where each group is)
  if (typeof V3_GROUPS !== "undefined") {
    V3_GROUPS[0].unshift("back");
    V3_GROUPS[1].splice(1, 0, "me");     // beside Walk through / From above
  }
  HOUSE_ICONS.back = '<path d="M8.4 4.6 3 10l5.4 5.4M3.4 10h13.6"/>';
  HOUSE_ICONS.me = '<circle cx="10" cy="4.6" r="2"/><path d="M10 6.8v5.4M10 8.4 6.8 11M10 8.4l3.2 2.6M10 12.2 7.6 17M10 12.2l2.4 4.8"/>' +
                   '<path d="M2.6 15.4c2-1 4-1.4 7.4-1.4s5.4.4 7.4 1.4" stroke-dasharray="1.4 1.4"/>';
  function tourButtons() {
    if (!V3 || !V3.box) { return; }
    var bar = el(".v3-bar", V3.box);
    if (!bar) { return; }
    var back = el('[data-v3="back"]', bar);
    if (!back) {
      back = document.createElement("button");
      back.type = "button";
      back.className = "btn small v3-back";
      back.dataset.v3 = "back";
      back.onclick = function () { v3Leave(); };
      var first = el(".v3-group", bar) || bar;
      first.insertBefore(back, first.firstChild);
    }
    if (!el(".v3-lbl", back)) { back.textContent = TXT.tr_back; }
    back.title = TXT.tr_back_tip;
    back.setAttribute("aria-label", TXT.tr_back);
    var me = el('[data-v3="me"]', bar);
    if (!me) {
      me = document.createElement("button");
      me.type = "button";
      me.className = "btn small";
      me.dataset.v3 = "me";
      me.onclick = function () { tourSwap(); };
      var mode = el('[data-v3="mode"]', bar);
      if (mode) { mode.parentNode.insertBefore(me, mode.nextSibling); } else { bar.insertBefore(me, bar.firstChild); }
    }
    var on = tourBehind(), word = on ? TXT.tr_me_off : TXT.tr_me, lbl = el(".v3-lbl", me);
    if (lbl) { if (lbl.textContent !== word) { lbl.textContent = word; } } else { me.textContent = word; }
    me.title = TXT.tr_me_tip;
    me.setAttribute("aria-label", word);
    me.setAttribute("aria-pressed", on ? "true" : "false");
    me.hidden = V3.mode !== "walk" || V3.scene === "space";
  }
  function tourSwap() {
    try { localStorage.setItem("flowchart-3d-me", tourBehind() ? "eyes" : "behind"); } catch (e) { /* this visit */ }
    if (typeof v3Fade === "function") { v3Fade(300); }
    V3.dirty = true;
    v3Words();
  }
  if (typeof v3Open === "function") {
    var v3OpenTour = v3Open;
    v3Open = function () {
      var was = V3, out = v3OpenTour.apply(this, arguments);
      try {
        if (V3 && V3 !== was) {
          tourButtons();
          V3.box.addEventListener("keydown", function (ev) {
            if (!V3 || V3.mode !== "walk" || (ev.target && ev.target.closest && ev.target.closest("input, textarea"))) { return; }
            if (ev.code === "KeyV" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) { tourSwap(); ev.preventDefault(); }
          });
          v3Words();
        }
      } catch (e) { /* the view without them */ }
      return out;
    };
  }
  if (typeof v3Words === "function") {
    var v3WordsTour = v3Words;
    v3Words = function () {
      var out = v3WordsTour.apply(this, arguments);
      try { tourButtons(); if (typeof v3DressBar === "function") { v3DressBar(); } } catch (e) { /* fine */ }
      return out;
    };
  }
