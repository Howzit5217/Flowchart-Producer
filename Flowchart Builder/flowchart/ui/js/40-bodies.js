// ---------------------------------------------------------------------------
//  40-bodies.js -- people made whole: a man's body or a woman's (a child's,
//  smaller, its head bigger for it), closed at every end -- no open tube at
//  a shoulder or a shoe -- with a face, ears and hair cut to a hairline; and
//  dressed: a tee shirt and jeans, a shirt and trousers, a hoodie, shorts, a
//  jacket, a suit, a blouse, a dress, a skirt; at work a hi-vis vest, a white
//  coat, scrubs, a chef's whites, a uniform and cap, the movers' polo shirts
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update the people models so they look better
  // with no weird openings in their shoulders and feet so they look proper
  // and to add males and females too and to have multiple different outfits
  // these people can wear")
  //
  // 40-tour.js drew each body as eight-sided tubes and lumps, face by face,
  // every picture: an arm's tube ended in a hole at the shoulder, a shoe's
  // tube was open at both ends.  Here every part is a closed shape -- arms
  // and legs as capsules, the body lofted from rings, the head an egg with
  // a face -- and a body in a pose (a step cut into BD_STEPS) is made once
  // and kept, drawn as the furniture is (38-view3d-gl.js's gl3Mesh): put
  // where it stands, not made again each picture.  tourBody keeps what it
  // was asked: the same joints, the same arms carrying or hammering
  // (40-crew.js draws its hammer from the right hand and its hard hat round
  // the head), only the body round them is new.
  var BD_STEPS = 24;                     // poses to a stride
  var BD_ARMS = { carry: 1, hammer: 1, shoulder: 1, up: 1, climb: 1 };    // what the hands can be doing
  var BD_ARMQ = 32;                      // heights of a hammer's swing
  var BD_KEPT = new Map(), BD_KEPT_MAX = 1500;
  var BD_ZERO = new Float32Array(2 * 24000);
  var BD_EYES = "#2a211c";
  // What each outfit is cut as.  sleeves: long/short; legs: long, shorts,
  // skirt or dress; jacket: down to the hip or the knee; vest: hi-vis over a
  // tee (the tee in top2); and the bits -- collar, tie, belt, hood, hat.
  var BD_OUTFITS = {
    tee: { sleeves: "short", legs: "long", shoes: "sneaker" },
    shirt: { sleeves: "long", legs: "long", shoes: "shoe", collar: true, belt: true },
    hoodie: { sleeves: "long", legs: "long", shoes: "sneaker", hood: true },
    shorts: { sleeves: "short", legs: "shorts", shoes: "sneaker" },
    jacket: { sleeves: "long", legs: "long", shoes: "boot", jacket: "hip", collar: true },
    suit: { sleeves: "long", legs: "long", shoes: "shoe", jacket: "hip", shirtFront: true, tie: true },
    skirtsuit: { sleeves: "long", legs: "skirt", shoes: "flat", jacket: "hip", shirtFront: true },
    blouse: { sleeves: "long", legs: "long", shoes: "flat", collar: true },
    dress: { sleeves: "short", legs: "dress", shoes: "flat" },
    skirt: { sleeves: "short", legs: "skirt", shoes: "flat" },
    vest: { sleeves: "short", legs: "long", shoes: "boot", vest: true },
    coat: { sleeves: "long", legs: "long", shoes: "shoe", jacket: "knee", shirtFront: true },
    scrubs: { sleeves: "short", legs: "long", shoes: "sneaker" },
    chef: { sleeves: "long", legs: "long", shoes: "shoe", collar: true, hat: "toque" },
    uniform: { sleeves: "long", legs: "long", shoes: "boot", collar: true, belt: true, hat: "cap" },
    polo: { sleeves: "short", legs: "long", shoes: "boot", collar: true, belt: true }
  };
  var BD_CASUAL = { m: ["tee", "shirt", "hoodie", "shorts", "jacket", "suit", "tee", "shirt", "hoodie"],
                    f: ["tee", "blouse", "dress", "skirt", "hoodie", "jacket", "dress", "skirtsuit", "suit", "skirt"] };
  var BD_HAIRS = { m: ["short", "short", "buzz", "quiff", "short", "buzz"], f: ["long", "bob", "pony", "bun", "long", "pixie", "pony"],
                   me: ["fringe", "short", "buzz", "fringe"], fe: ["bob", "bun", "pixie", "bob"] };
  // what a trade wears (its colors, where its own were not given)
  var BD_WORK = {
    i_builder: "vest", i_engineer: "vest", i_electrician: "vest", i_plumber: "vest", i_mechanic: "vest", i_carpenter: "vest",
    i_painter: "vest", i_miner: "vest", i_gardener: "vest", i_farmer: "jacket",
    i_doctor: "coat", i_scientist: "coat", i_pharmacist: "coat", i_dentist: "coat",
    i_nurse: "scrubs", i_surgeon: "scrubs", i_paramedic: "scrubs", i_patient: "scrubs",
    i_chef: "chef", i_baker: "chef", i_waiter: "shirt",
    i_police: "uniform", i_guard: "uniform", i_soldier: "uniform", i_firefighter: "uniform", i_pilot: "uniform",
    i_postman: "uniform", i_driver: "uniform", i_delivery: "polo", i_cashier: "polo", i_coach: "polo",
    i_office: "suit", i_manager: "suit", i_accountant: "suit", i_lawyer: "suit", i_judge: "suit", i_agent: "suit",
    i_receptionist: "shirt", i_teacher: "shirt", i_librarian: "shirt", i_student: "hoodie", i_programmer: "hoodie",
    i_graduate: "suit", i_artist: "tee", i_musician: "jacket", i_photographer: "jacket", i_reporter: "jacket",
    i_hairdresser: "tee", i_customer: null, i_astronaut: "uniform"
  };
  var BD_WEAR = {
    vest: { shirt: ["#f08a24", "#d9e84a"], pants: ["#3d4a5c", "#4d4033"], top2: ["#d8d8d0", "#8f959b"], shoes: ["#5a4632"] },
    coat: { shirt: ["#f4f4f2"], top2: ["#8fb3c9", "#e8e2d6"] },
    scrubs: { shirt: ["#4f9a94", "#3f6fa8", "#6a8fc7", "#5b8a6e"], same: true, shoes: ["#e9e6e0"] },
    chef: { shirt: ["#f4f2ee"], pants: ["#2b2b2e", "#3b3b3e"], hat: ["#f7f6f2"] },
    suit: { shirt: ["#2b3242", "#2f3236", "#3d3f44", "#1f2430", "#4a4d52"], same: true, shoes: ["#1d1d1f", "#3a2a1f"], top2: ["#f4f2ee", "#dfe6ef"] },
    skirtsuit: { shirt: ["#2b3242", "#3d3f44", "#5a3b4a", "#2f4a6a"], same: true, top2: ["#f4f2ee"] }
  };
  var BD_UNIFORM = {
    i_police: { shirt: "#2b3a55", pants: "#232c3d", hat: "#1f2838" }, i_guard: { shirt: "#2e2e33", pants: "#26262a", hat: "#26262a" },
    i_soldier: { shirt: "#5b6342", pants: "#4e5638", hat: "#4e5638" }, i_firefighter: { shirt: "#2f3338", pants: "#2f3338", hat: "#b8262b" },
    i_pilot: { shirt: "#f4f2ee", pants: "#1f2838", hat: "#1f2838" }, i_postman: { shirt: "#8fb3d9", pants: "#2b3a55", hat: "#2b3a55" },
    i_driver: { shirt: "#3f4a52", pants: "#2e3846", hat: "#2e3846" }, i_astronaut: { shirt: "#e9e8e4", pants: "#e9e8e4", hat: "#e9e8e4" }
  };
  var BD_TIES = ["#8c2f3a", "#2f4f8f", "#3d5c43", "#6a4c93", "#b5653a", "#1f2a33"];
  var BD_SKIRTS = ["#2e3846", "#5a3b4a", "#8c3b2f", "#3d5c43", "#c9a24a", "#25303d", "#7a4b30"];
  var BD_MAT = { skin: "plain", lips: "plain", hair: "fabric", eyes: "plastic", top: "fabric", top2: "fabric", bottom: "fabric", skirt: "fabric",
                 shoes: "leather", belt: "leather", white: "fabric", tie: "fabric", hat: "fabric" };

  // ---- shapes, in metres, the body's own way round (x forward, y to the side, z up) ---------------
  function bdMaker() {
    var G = { slots: {}, order: [], xf: null };
    G.slot = function (name) {
      var s = G.slots[name];
      if (!s) { s = G.slots[name] = { p: [], n: [] }; G.order.push(name); }
      return s;
    };
    return G;
  }
  function bdUnit(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function bdCross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function bdSame(a, b) { return Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7 && Math.abs(a[2] - b[2]) < 1e-7; }
  // rings of {p, n}, each joined to the next, all round
  function bdRings(G, slot, R) {
    var S = G.slot(slot), xf = G.xf;
    function put(v) {
      var p = xf ? xf(v.p) : v.p;
      S.p.push(p[0], p[1], p[2]); S.n.push(v.n[0], v.n[1], v.n[2]);
    }
    for (var i = 0; i + 1 < R.length; i++) {
      var A = R[i], B = R[i + 1], m = A.length;
      for (var j = 0; j < m; j++) {
        var a = A[j], b = A[(j + 1) % m], c = B[(j + 1) % m], d = B[j];
        if (!bdSame(a.p, b.p) && !bdSame(a.p, c.p)) { put(a); put(b); put(c); }
        if (!bdSame(c.p, d.p) && !bdSame(a.p, d.p)) { put(a); put(c); put(d); }
      }
    }
  }
  // A capsule from A to B, its ends rounded: an arm, a leg, a hand, a shoe.
  function bdCapsule(G, slot, A, B, rA, rB, seg) {
    seg = seg || 6;
    var d = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], L = Math.hypot(d[0], d[1], d[2]);
    if (L < 1e-6) { return; }
    var w = [d[0] / L, d[1] / L, d[2] / L];
    var u = bdUnit(Math.abs(w[2]) < 0.9 ? bdCross(w, [0, 0, 1]) : bdCross(w, [1, 0, 0])), v = bdCross(w, u);
    var spec = [[A, rA, -1], [A, rA, -0.62], [A, rA, 0], [B, rB, 0], [B, rB, 0.62], [B, rB, 1]];
    bdRings(G, slot, spec.map(function (q) {
      var C = q[0], r = q[1], s = q[2], c = Math.sqrt(Math.max(0, 1 - s * s)), ring = [];
      for (var i = 0; i < seg; i++) {
        var t = i / seg * Math.PI * 2, rx = u[0] * Math.cos(t) + v[0] * Math.sin(t), ry = u[1] * Math.cos(t) + v[1] * Math.sin(t), rz = u[2] * Math.cos(t) + v[2] * Math.sin(t);
        var n = [w[0] * s + rx * c, w[1] * s + ry * c, w[2] * s + rz * c];
        ring.push({ p: [C[0] + n[0] * r, C[1] + n[1] * r, C[2] + n[2] * r], n: n });
      }
      return ring;
    }));
  }
  // An egg, rx forward, ry across, rz up -- or the part of it `keep` says
  // (lat, lon in degrees and radians, lon 0 straight ahead): hair to a hairline.
  function bdBall(G, slot, C, rx, ry, rz, rows, cols, keep, lat0, lat1) {
    var R = [], la0 = lat0 === undefined ? -90 : lat0, la1 = lat1 === undefined ? 90 : lat1;
    for (var i = 0; i <= rows; i++) {
      var la = (la0 + (la1 - la0) * i / rows) * Math.PI / 180, ring = [];
      for (var j = 0; j < cols; j++) {
        var lo = j / cols * Math.PI * 2, cx = Math.cos(la) * Math.cos(lo), cy = Math.cos(la) * Math.sin(lo), cz = Math.sin(la);
        ring.push({ p: [C[0] + cx * rx, C[1] + cy * ry, C[2] + cz * rz], n: bdUnit([cx / rx, cy / ry, cz / rz]), la: la * 180 / Math.PI, lo: lo > Math.PI ? lo - Math.PI * 2 : lo });
      }
      R.push(ring);
    }
    if (!keep) { bdRings(G, slot, R); return; }
    // (only the quads whose middle is kept)
    var S = G.slot(slot), xf = G.xf;
    function put(q) { var p = xf ? xf(q.p) : q.p; S.p.push(p[0], p[1], p[2]); S.n.push(q.n[0], q.n[1], q.n[2]); }
    for (var a = 0; a < rows; a++) {
      for (var b = 0; b < cols; b++) {
        var A = R[a][b], B = R[a][(b + 1) % cols], Cq = R[a + 1][(b + 1) % cols], D = R[a + 1][b];
        var mla = (A.la + D.la) / 2, mlo = (b + 0.5) / cols * Math.PI * 2;
        if (mlo > Math.PI) { mlo -= Math.PI * 2; }
        if (!keep(mla, mlo)) { continue; }
        if (!bdSame(A.p, B.p)) { put(A); put(B); put(Cq); }
        if (!bdSame(Cq.p, D.p)) { put(A); put(Cq); put(D); }
      }
    }
  }
  // Lofted through rings {z, w (half across), d (half front to back), x
  // (forward of the middle)}, bottom to top; closed at either end if asked.
  function bdLoft(G, slot, rings, seg, closeBottom, closeTop) {
    seg = seg || 12;
    function at(k, t) { var q = rings[k]; return [q.x + q.d * Math.cos(t), q.w * Math.sin(t), q.z]; }
    function reach(k, t) { var q = rings[k]; return q.x * Math.cos(t) + Math.hypot(q.d * Math.cos(t), q.w * Math.sin(t)); }
    var R = [];
    if (closeBottom) {
      var b0 = rings[0], pole = [];
      for (var j0 = 0; j0 < seg; j0++) { pole.push({ p: [b0.x, 0, b0.z - Math.min(b0.w, b0.d) * 0.35], n: [0, 0, -1] }); }
      R.push(pole);
    }
    for (var k = 0; k < rings.length; k++) {
      var ring = [], kA = Math.max(0, k - 1), kB = Math.min(rings.length - 1, k + 1), dz = rings[kB].z - rings[kA].z || 1;
      for (var j = 0; j < seg; j++) {
        var t = j / seg * Math.PI * 2, q = rings[k];
        var nh = bdUnit([Math.cos(t) / Math.max(0.01, q.d), Math.sin(t) / Math.max(0.01, q.w), 0]);
        var slope = (reach(kB, t) - reach(kA, t)) / dz;
        ring.push({ p: at(k, t), n: bdUnit([nh[0], nh[1], -slope]) });
      }
      R.push(ring);
    }
    if (closeTop) {
      var tN = rings[rings.length - 1], cap = [];
      for (var j1 = 0; j1 < seg; j1++) { cap.push({ p: [tN.x, 0, tN.z + Math.min(tN.w, tN.d) * 0.35], n: [0, 0, 1] }); }
      R.push(cap);
    }
    bdRings(G, slot, R);
  }
  // An open end folded in under what it covers (a vest's hem, a jacket's top,
  // a skirt's waist): its inside never seen as a dark ring round the body.
  function bdTuck(rings, bottom, top) {
    var out = rings.slice(), a = rings[0], b = rings[rings.length - 1];
    if (bottom) { out.unshift({ z: a.z - 0.02, w: a.w * 0.8, d: a.d * 0.78, x: a.x }); }
    if (top) { out.push({ z: b.z + 0.02, w: b.w * 0.8, d: b.d * 0.78, x: b.x }); }
    return out;
  }
  // A flat piece laid on: corners in order, one side out (both drawn).
  function bdFlat(G, slot, pts) {
    var S = G.slot(slot), n = bdUnit(bdCross([pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]],
                                             [pts[2][0] - pts[0][0], pts[2][1] - pts[0][1], pts[2][2] - pts[0][2]]));
    if (n[0] < 0) { n = [-n[0], -n[1], -n[2]]; }                 // (facing forward)
    for (var i = 1; i + 1 < pts.length; i++) {
      [pts[0], pts[i], pts[i + 1]].forEach(function (p) { S.p.push(p[0], p[1], p[2]); S.n.push(n[0], n[1], n[2]); });
    }
  }
  // How far forward the body's front is at a height (its rings, between).
  function bdFront(rings, z) {
    for (var i = 0; i + 1 < rings.length; i++) {
      var a = rings[i], b = rings[i + 1];
      if (z >= a.z && z <= b.z) { var k = (z - a.z) / ((b.z - a.z) || 1); return a.x + a.d + (b.x + b.d - a.x - a.d) * k; }
    }
    var e = z < rings[0].z ? rings[0] : rings[rings.length - 1];
    return e.x + e.d;
  }
  function bdLerp(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }

  // ---- the body's rings --------------------------------------------------------------------------------
  var BD_TORSO = {
    m: { hips: [{ z: 0.83, w: 0.08, d: 0.065, x: 0 }, { z: 0.87, w: 0.15, d: 0.1, x: 0 }, { z: 0.93, w: 0.166, d: 0.107, x: -0.004 },
                { z: 1.0, w: 0.161, d: 0.104, x: 0 }, { z: 1.045, w: 0.158, d: 0.102, x: 0 }],
         chest: [{ z: 0.985, w: 0.164, d: 0.107, x: 0 }, { z: 1.08, w: 0.166, d: 0.108, x: 0.004 }, { z: 1.18, w: 0.177, d: 0.111, x: 0.007 },
                 { z: 1.28, w: 0.194, d: 0.111, x: 0.008 }, { z: 1.35, w: 0.202, d: 0.106, x: 0.006 }, { z: 1.405, w: 0.2, d: 0.098, x: 0.002 },
                 { z: 1.44, w: 0.183, d: 0.087, x: 0 }, { z: 1.465, w: 0.12, d: 0.07, x: 0 }, { z: 1.48, w: 0.06, d: 0.05, x: 0 }],
         shoulder: 0.21, hip: 0.1 },
    f: { hips: [{ z: 0.83, w: 0.08, d: 0.065, x: 0 }, { z: 0.87, w: 0.158, d: 0.104, x: -0.004 }, { z: 0.93, w: 0.177, d: 0.112, x: -0.008 },
                { z: 1.0, w: 0.164, d: 0.103, x: -0.003 }, { z: 1.045, w: 0.146, d: 0.097, x: 0 }],
         chest: [{ z: 0.985, w: 0.162, d: 0.103, x: -0.002 }, { z: 1.07, w: 0.138, d: 0.095, x: 0 }, { z: 1.16, w: 0.148, d: 0.1, x: 0.008 },
                 { z: 1.24, w: 0.163, d: 0.108, x: 0.013 }, { z: 1.3, w: 0.17, d: 0.107, x: 0.013 }, { z: 1.355, w: 0.18, d: 0.096, x: 0.005 },
                 { z: 1.4, w: 0.179, d: 0.088, x: 0.001 }, { z: 1.435, w: 0.164, d: 0.078, x: 0 }, { z: 1.46, w: 0.11, d: 0.064, x: 0 },
                 { z: 1.475, w: 0.055, d: 0.045, x: 0 }],
         shoulder: 0.19, hip: 0.094 }
  };
  function bdGrow(rings, by, from, to) {
    return rings.filter(function (q) { return q.z >= (from === undefined ? -1 : from) && q.z <= (to === undefined ? 9 : to); })
      .map(function (q) { return { z: q.z, w: q.w + by, d: q.d + by, x: q.x }; });
  }
  // Where the hairline is (degrees up from the middle of the head): in front, at the side, behind.
  var BD_HAIRLINE = { short: [28, -6, -40], buzz: [30, -2, -34], quiff: [28, -6, -40], pixie: [26, -10, -44], crop: [28, -8, -42],
                      long: [30, -62, -80], bob: [30, -46, -58], pony: [30, -10, -38], bun: [30, -10, -38], fringe: [-2, -10, -42] };
  function bdHairKeep(style) {
    var H = BD_HAIRLINE[style] || BD_HAIRLINE.short;
    return function (lat, lon) {
      var a = Math.abs(lon), line = a < Math.PI / 2 ? H[0] + (H[1] - H[0]) * a / (Math.PI / 2) : H[1] + (H[2] - H[1]) * (a - Math.PI / 2) / (Math.PI / 2);
      if (style === "fringe") { return lat > line && lat < 12 && a > 1.05; }
      return lat > line;
    };
  }

  // ---- a body, in a pose ------------------------------------------------------------------------------
  // The joints as 40-tour.js had them: hips at 0.93, the step swinging the
  // legs; shoulders at 1.42, the arms swinging the other way -- or out in
  // front carrying, or one raised with a hammer (40-crew.js's own numbers).
  function bdJoints(sp, phase, arms, armK, legs) {
    var T = BD_TORSO[sp.sex], swing = Math.sin(phase) * 0.42, lift = Math.max(0, Math.cos(phase)) * 0.06, J = { legs: [], arms: [] };
    [-1, 1].forEach(function (side) {
      var sw = swing * side, hy = side * T.hip, bend = sw > 0 ? sw * 0.6 : 0;
      var hip = [0, hy, 0.93];
      var knee = [Math.sin(sw) * 0.42, hy, 0.93 - Math.cos(sw) * 0.42 + (side > 0 ? lift : 0)];
      var ankle = [Math.sin(sw) * 0.42 + Math.sin(sw - bend) * 0.42, hy, Math.max(0.08, 0.93 - Math.cos(sw) * 0.42 - Math.cos(sw - bend) * 0.42)];
      J.legs.push({ side: side, hip: hip, knee: knee, ankle: ankle });
      var as = -swing * side * 0.8, sh = [0, side * T.shoulder, 1.42];
      var elbow = [Math.sin(as) * 0.3, side * 0.24, 1.42 - Math.cos(as) * 0.3];
      var wrist = [Math.sin(as) * 0.3 + Math.sin(as + 0.25) * 0.27, side * 0.25, 1.42 - Math.cos(as) * 0.3 - Math.cos(as + 0.25) * 0.27];
      if (arms === "carry" || (arms === "hammer" && side < 0)) {
        elbow = [0.17, side * 0.25, 1.19]; wrist = [0.43, side * 0.21, 1.13];
      } else if (arms === "hammer") {
        elbow = [0.2, side * 0.27, 1.22 + armK * 0.26]; wrist = [0.42 - armK * 0.14, side * 0.23, 1.16 + armK * 0.48];
      } else if (arms === "shoulder" && side > 0) {
        // (40-works.js: timber on the right shoulder, steadied by that hand)
        elbow = [0.12, side * 0.3, 1.3]; wrist = [0.06, side * 0.24, 1.56];
      } else if (arms === "up") {
        // both up over the head: a sheet held to the ceiling, a truss guided in
        elbow = [0.1, side * 0.25, 1.68]; wrist = [0.2, side * 0.2, 1.96];
      } else if (arms === "climb") {
        // hand over hand up a ladder
        var u = Math.sin(phase + (side > 0 ? 0 : Math.PI)) * 0.14;
        elbow = [0.2, side * 0.23, 1.5 + u * 0.5]; wrist = [0.3, side * 0.19, 1.74 + u];
      }
      J.arms.push({ side: side, sh: sh, elbow: elbow, wrist: wrist });
    });
    // (on the move, the body as low as puts the lower foot on the ground: mid
    // stride both feet were in the air; it dips as the legs part, rises as they pass)
    // (never with a hammer: 40-crew.js draws it from the hand where it was asked to be)
    J.drop = phase && arms !== "hammer" ? Math.max(0, Math.min(J.legs[0].ankle[2], J.legs[1].ankle[2]) - 0.08) : 0;
    if (legs === "kneel") {
      // down on one knee (laying a floor, a form board): the left knee on the
      // ground, the right foot flat, the body that much lower
      J.legs.forEach(function (L) {
        var hy = L.hip[1];
        if (L.side > 0) { L.knee = [0.42, hy, 0.93]; L.ankle = [0.42, hy, 0.5]; }
        else { L.knee = [0.04, hy, 0.51]; L.ankle = [-0.38, hy, 0.5]; }
      });
      J.drop = 0.43;
    }
    return J;
  }
  function bdMake(sp, phase, arms, armK, withHead, scale, legs) {
    var G = bdMaker(), O = sp.O, T = BD_TORSO[sp.sex], J = bdJoints(sp, phase, arms, armK, legs);
    G.dz = -J.drop;
    var bare = O.legs === "skirt" || O.legs === "dress";
    var topSlot = O.vest ? "top2" : "top", legSlot = bare ? "skin" : "bottom";
    // the legs: thigh, shin, shoe -- each closed
    J.legs.forEach(function (L) {
      var hip = withHead ? L.hip : bdLerp(L.hip, L.knee, 0.5);      // (through your own eyes: from above the knee)
      if (O.legs === "shorts") {
        bdCapsule(G, "bottom", hip, bdLerp(L.hip, L.knee, 0.56), 0.086, 0.079, 7);
        bdCapsule(G, "skin", hip, L.knee, 0.068, 0.056, 6);
        bdCapsule(G, "skin", L.knee, L.ankle, 0.054, 0.04, 6);
      } else {
        bdCapsule(G, legSlot, hip, L.knee, bare ? 0.068 : 0.078, bare ? 0.055 : 0.063, 7);
        bdCapsule(G, legSlot, L.knee, L.ankle, bare ? 0.052 : 0.059, bare ? 0.038 : 0.047, 6);
      }
      var shoe = O.shoes, r0 = shoe === "boot" ? 0.053 : shoe === "flat" ? 0.04 : shoe === "shoe" ? 0.046 : 0.05;
      var heel = [L.ankle[0] - 0.055, L.ankle[1], L.ankle[2] - 0.08 + r0], toe = [L.ankle[0] + (shoe === "flat" ? 0.14 : 0.152), L.ankle[1], L.ankle[2] - 0.08 + r0 * 0.88];
      bdCapsule(G, "shoes", heel, toe, r0, r0 * 0.88, 7);
      if (shoe === "boot") { bdCapsule(G, "shoes", [L.ankle[0], L.ankle[1], L.ankle[2] - 0.03], [L.ankle[0] - 0.005, L.ankle[1], L.ankle[2] + 0.07], 0.056, 0.054, 7); }
    });
    if (!withHead) { return bdDone(G, scale); }
    // hips and body
    bdLoft(G, O.legs === "dress" ? "top" : O.legs === "skirt" ? "skirt" : "bottom", T.hips, 12, true, false);
    bdLoft(G, topSlot, T.chest, 12, false, true);
    if (O.vest) { bdLoft(G, "top", bdTuck(bdGrow(T.chest, 0.007, 1.0, 1.42), true, true), 12, false, false); }
    if (O.jacket) {
      var low = O.jacket === "knee"
        ? [{ z: 0.5, w: 0.205, d: 0.165, x: 0.0 }, { z: 0.7, w: 0.193, d: 0.142, x: 0 }, { z: 0.9, w: 0.18, d: 0.124, x: 0 }, { z: 1.03, w: 0.172, d: 0.116, x: 0 }]
        : [{ z: 0.8, w: 0.183, d: 0.124, x: 0 }, { z: 0.9, w: 0.178, d: 0.12, x: 0 }, { z: 1.03, w: 0.172, d: 0.116, x: 0 }];
      if (sp.sex === "f") { low = low.map(function (q) { return { z: q.z, w: q.w + (q.z < 1 ? 0.01 : -0.004), d: q.d, x: q.x }; }); }
      bdLoft(G, "top", bdTuck(low, false, true), 12, false, false);
    }
    if (O.legs === "skirt" || O.legs === "dress") {
      var sk = [{ z: 1.035, w: (sp.sex === "f" ? 0.15 : 0.16), d: 0.103, x: 0 }, { z: 0.93, w: 0.188, d: 0.128, x: -0.004 },
                { z: 0.76, w: 0.205, d: 0.148, x: 0 }, { z: 0.57, w: 0.222, d: 0.166, x: 0.004 }];
      bdLoft(G, O.legs === "dress" ? "top" : "skirt", bdTuck(sk, false, true), 14, false, false);
    }
    if (O.belt && !O.jacket) { bdBall(G, "belt", [0, 0, 1.0], (sp.sex === "f" ? 0.106 : 0.11), (sp.sex === "f" ? 0.169 : 0.166), 0.019, 2, 14); }
    if (O.hood) { bdBall(G, topSlot, [-0.083, 0, 1.47], 0.055, 0.11, 0.052, 4, 10); }
    if (O.collar) { bdBall(G, "top", [0.003, 0, 1.458], 0.074, 0.08, 0.027, 3, 12); }
    if (O.shirtFront) {
      // the shirt in the V of the jacket, and its collar
      var vTop = sp.sex === "f" ? 1.432 : 1.44, vLow = sp.sex === "f" ? 1.31 : 1.29, vW = sp.sex === "f" ? 0.042 : 0.048;
      var fT = bdFront(T.chest, vTop) + 0.006, fL = bdFront(T.chest, vLow) + 0.005;
      bdFlat(G, "top2", [[fT, -vW, vTop], [fL, 0, vLow], [fT, vW, vTop]]);
      bdBall(G, "top2", [0.003, 0, 1.458], 0.07, 0.076, 0.024, 3, 12);
    }
    if (O.tie) {
      var tz0 = 1.415, tz1 = 1.18;
      bdCapsule(G, "tie", [bdFront(T.chest, tz0) + 0.01, 0, tz0], [bdFront(T.chest, tz1) + 0.012, 0, tz1], 0.013, 0.018, 5);
    }
    // the arms: the upper arm from inside the shoulder -- its round end the
    // shoulder's own curve, level with the body's, not a pad stood on it --
    // the forearm, the hand
    var fem = sp.sex === "f", rU = fem ? [0.045, 0.04] : [0.05, 0.044], rF = fem ? [0.039, 0.032] : [0.043, 0.035];
    J.arms.forEach(function (A) {
      var root = [A.sh[0], A.sh[1] - A.side * (fem ? 0.013 : 0.015), fem ? 1.385 : 1.39];
      if (O.sleeves === "long") {
        bdCapsule(G, topSlot, root, A.elbow, rU[0] + 0.004, rU[1] + 0.003, 7);
        bdCapsule(G, topSlot, A.elbow, A.wrist, rF[0] + 0.003, rF[1] + 0.003, 7);
      } else {
        bdCapsule(G, topSlot, root, bdLerp(root, A.elbow, 0.5), rU[0] + 0.006, rU[1] + 0.008, 7);
        bdCapsule(G, "skin", root, A.elbow, rU[0] - 0.002, rU[1] - 0.002, 6);
        bdCapsule(G, "skin", A.elbow, A.wrist, rF[0], rF[1], 6);
      }
      var d = bdUnit([A.wrist[0] - A.elbow[0], A.wrist[1] - A.elbow[1], A.wrist[2] - A.elbow[2]]);
      bdCapsule(G, "skin", A.wrist, [A.wrist[0] + d[0] * 0.075, A.wrist[1] + d[1] * 0.075, A.wrist[2] + d[2] * 0.075], 0.031, 0.026, 6);
    });
    // the neck, and the head -- a child's bigger for its body
    bdCapsule(G, "skin", [0, 0, 1.43], [0.008, 0, 1.56], 0.05, 0.047, 7);
    var hk = sp.child ? 1.18 : 1, N = [0, 0, 1.53];
    if (hk !== 1) { G.xf = function (p) { return [N[0] + (p[0] - N[0]) * hk, N[1] + (p[1] - N[1]) * hk, N[2] + (p[2] - N[2]) * hk]; }; }
    var H = [0.012, 0, 1.635];
    bdBall(G, "skin", H, 0.098, 0.082, 0.112, 7, 12);
    bdBall(G, "skin", [H[0] + 0.092, 0, H[2] - 0.012], 0.02, 0.013, 0.025, 3, 6);                       // the nose
    [-1, 1].forEach(function (s) {
      bdBall(G, "eyes", [H[0] + 0.083, s * 0.031, H[2] + 0.017], 0.011, 0.013, 0.011, 3, 6);
      bdBall(G, "hair", [H[0] + 0.088, s * 0.032, H[2] + 0.039], 0.008, 0.022, 0.006, 2, 6);           // a brow
      if (sp.hair !== "long" && sp.hair !== "bob") { bdBall(G, "skin", [H[0] - 0.004, s * 0.08, H[2]], 0.016, 0.012, 0.027, 3, 6); }
    });
    bdBall(G, "lips", [H[0] + 0.087, 0, H[2] - 0.05], 0.007, 0.021, 0.006, 2, 6);
    // the hair, to its hairline, and what is done with it
    if (sp.hair !== "bald") {
      var thick = sp.hair === "buzz" ? 0.004 : sp.hair === "long" || sp.hair === "bob" || sp.hair === "bun" || sp.hair === "pony" ? 0.013 : 0.009;
      bdBall(G, "hair", [H[0] - 0.006, 0, H[2] + 0.006], 0.098 + thick, 0.082 + thick, 0.112 + thick, 8, 14, bdHairKeep(sp.hair));
    }
    if (sp.hair === "quiff") { bdBall(G, "hair", [H[0] + 0.045, 0, H[2] + 0.093], 0.056, 0.068, 0.034, 3, 10); }
    if (sp.hair === "long") { bdBall(G, "hair", [H[0] - 0.056, 0, H[2] - 0.13], 0.056, 0.094, 0.16, 5, 10); }
    if (sp.hair === "pony") {
      bdBall(G, "hair", [H[0] - 0.104, 0, H[2] + 0.02], 0.036, 0.036, 0.036, 3, 8);
      bdCapsule(G, "hair", [H[0] - 0.118, 0, H[2] + 0.0], [H[0] - 0.136, 0, H[2] - 0.17], 0.031, 0.019, 6);
    }
    if (sp.hair === "bun") { bdBall(G, "hair", [H[0] - 0.072, 0, H[2] + 0.1], 0.047, 0.047, 0.042, 4, 8); }
    if (sp.beard) {
      bdBall(G, "hair", [H[0] + 0.003, 0, H[2] - 0.004], 0.104, 0.087, 0.118, 8, 14, function (lat, lon) {
        var a = Math.abs(lon);
        return (lat < -14 && a < 1.72) || (lat < 14 && a > 1.28 && a < 1.72);
      });
      bdBall(G, "hair", [H[0] + 0.092, 0, H[2] - 0.035], 0.012, 0.03, 0.008, 2, 6);                     // the moustache
    }
    if (O.hat === "hard") {
      bdBall(G, "hat", [H[0] - 0.002, 0, H[2] + 0.028], 0.116, 0.104, 0.1, 4, 14, null, 0, 90);
      bdBall(G, "hat", [H[0] + 0.012, 0, H[2] + 0.03], 0.152, 0.136, 0.011, 2, 14);
    } else if (O.hat === "cap") {
      bdBall(G, "hat", [H[0] - 0.004, 0, H[2] + 0.03], 0.11, 0.095, 0.092, 4, 14, null, 0, 90);
      bdBall(G, "hat", [H[0] + 0.106, 0, H[2] + 0.034], 0.066, 0.08, 0.01, 3, 10);
    } else if (O.hat === "toque") {
      bdCapsule(G, "hat", [H[0] - 0.006, 0, H[2] + 0.07], [H[0] - 0.006, 0, H[2] + 0.2], 0.101, 0.112, 12);
    }
    G.xf = null;
    return bdDone(G, scale);
  }
  // In the drawing's numbers, as typed arrays, each slot's box with it.
  function bdDone(G, scale) {
    var out = { order: [], slots: {} };
    G.order.forEach(function (name) {
      var S = G.slots[name];
      if (!S.p.length) { return; }
      var p = new Float32Array(S.p.length), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity], dz = G.dz || 0;
      for (var i = 0; i < S.p.length; i++) {
        var k = i % 3, v = (S.p[i] + (k === 2 ? dz : 0)) * scale;
        p[i] = v;
        if (v < lo[k]) { lo[k] = v; } if (v > hi[k]) { hi[k] = v; }
      }
      out.order.push(name);
      out.slots[name] = { p: p, n: new Float32Array(S.n), lo: lo, hi: hi, views: null };
    });
    return out;
  }
  function bdKept(key, make) {
    var got = BD_KEPT.get(key);
    if (got) { BD_KEPT.delete(key); BD_KEPT.set(key, got); return got; }
    got = make();
    BD_KEPT.set(key, got);
    if (BD_KEPT.size > BD_KEPT_MAX) { BD_KEPT.delete(BD_KEPT.keys().next().value); }
    return got;
  }
  function bdSpec(L) {
    var sex = L && L.sex === "f" ? "f" : "m", outfit = L && BD_OUTFITS[L.outfit] ? L.outfit : "tee";
    var hair = L && L.hairStyle ? L.hairStyle : sex === "f" ? "long" : "short";
    var O = BD_OUTFITS[outfit];
    if (L && L.hardhat) { O = Object.assign({}, O, { hat: "hard" }); }        // (on a building site, 40-works.js)
    return { sex: sex, outfit: outfit, O: O, hair: hair, beard: !!(L && L.beard), child: !!(L && L.child),
             key: [sex, outfit, hair, L && L.beard ? 1 : 0, L && L.child ? 1 : 0, L && L.hardhat ? "hh" : ""].join(",") };
  }
  function bdColor(L, slot) {
    switch (slot) {
      case "skin": return L.skin || "#d6a689";
      case "lips": return v3Mix(L.skin || "#d6a689", "#8a3b36", 0.32);
      case "hair": return L.hair || "#4a3426";
      case "eyes": return BD_EYES;
      case "top": return L.shirt || "#3e6d9a";
      case "top2": return L.top2 || "#f2f0ea";
      case "bottom": return L.pants || "#2e3846";
      case "skirt": return L.skirt || L.pants || "#2e3846";
      case "shoes": return L.shoes || "#2b2623";
      case "belt": return "#2b2623";
      case "tie": return L.tie || "#8c2f3a";
      case "hat": return L.hardhat ? L.hardhatColor || "#f2c230" : L.hat || L.pants || "#2e3846";
      default: return "#f2f0ea";
    }
  }
  // Drawn: each slot of the body as one mesh, put where they stand, facing
  // `head`.  Standing still, the same numbers picture to picture (kept by
  // gl3Mesh); on the move, a fresh view of them, so none is kept for every
  // spot passed.  (Its first point where its feet are, the same for every
  // slot: what is laid on the land or bent along the street moves the body
  // as one -- 40-land.js, 40-street.js.)
  function bdDraw(faces, x, y, z, head, phase, look, withHead, k, others, fade) {
    var L = look || {}, sp = bdSpec(L), P = FLOOR_PX * (k || 1);
    var b = phase ? (((Math.round(phase / (Math.PI * 2) * BD_STEPS)) % BD_STEPS) + BD_STEPS) % BD_STEPS : 0;
    var arms = withHead && BD_ARMS[L.arms] ? L.arms : "", legs = L.legs === "kneel" ? "kneel" : "";
    var aq = arms === "hammer" ? Math.round(Math.max(0, Math.min(1, L.armK || 0)) * BD_ARMQ) : 0, kq = Math.round(P * 10) / 10;
    if (legs) { b = 0; }
    var key = [sp.key, withHead ? 1 : 0, b, arms, aq, kq, legs].join("|");
    var made = bdKept(key, function () { return bdMake(sp, b / BD_STEPS * Math.PI * 2, arms, aq / BD_ARMQ, withHead, kq, legs); });
    var moving = !!phase || arms === "hammer", c = Math.cos(head), s = Math.sin(head), fa = fade !== undefined && fade < 0.999 ? Math.max(0, fade) : -1;
    made.order.forEach(function (slot) {
      var g = made.slots[slot], color = bdColor(L, slot);
      var how = { model: true, piece: true, mat: BD_MAT[slot] || "fabric", color: color };
      if (fa >= 0) { how.alpha = fa; how.late = true; }
      var pts = [[x, y, z]];
      [[g.lo[0], g.lo[1]], [g.hi[0], g.lo[1]], [g.hi[0], g.hi[1]], [g.lo[0], g.hi[1]]].forEach(function (q) {
        var wx = x + q[0] * c - q[1] * s, wy = y + q[0] * s + q[1] * c;
        pts.push([wx, wy, z + g.lo[2]]); pts.push([wx, wy, z + g.hi[2]]);
      });
      var p = g.p;
      if (moving) { p = new Float32Array(g.p.buffer, g.p.byteOffset, g.p.length); }
      else {
        // (one view of them for each color: gl3Mesh keeps what it worked out by the numbers and where, not the color)
        var vk = color + "|" + fa;
        g.views = g.views || {};
        p = g.views[vk] || (g.views[vk] = new Float32Array(g.p.buffer, g.p.byteOffset, g.p.length));
      }
      var f = { pts: pts, n: [0, 0, 1], how: how, mesh: { p: p, n: g.n, uv: BD_ZERO, a: null, base: [x, y, z], xf: [x, y, c, s, z] } };
      if (!others) { f.me = true; }
      faces.push(f);
    });
  }

  // ---- who wears what ------------------------------------------------------------------------------
  // The colors picked as 40-tour.js picked them (so each keeps the skin,
  // the hair, the shirt they had), then whether a man or a woman, the
  // outfit, the hair -- a trade dressed for its work.
  if (typeof peopleLook === "function") {
    peopleLook = function (n, look, seed) {
      var r = typeof gl3Rand === "function" ? gl3Rand((seed || 1) * 7919 + 13) : Math.random;
      function pick(list) { return list[Math.floor(r() * list.length) % list.length]; }
      var out = { skin: pick(PEOPLE_SKIN), hair: pick(PEOPLE_HAIR), shirt: pick(PEOPLE_SHIRT), pants: pick(PEOPLE_PANTS),
                  shoes: pick(["#2b2623", "#1d1d1f", "#5a4632", "#e9e6e0"]) };
      var kind = n && n.kind, elder = kind === "i_elder";
      if (elder) { out.hair = pick(["#b9b6b0", "#d8d5cf", "#8f8c86"]); }
      // (after the colors, so a body keeps its old ones)
      var r2 = typeof gl3Rand === "function" ? gl3Rand((seed || 1) * 104729 + 71) : Math.random;
      function pick2(list) { return list[Math.floor(r2() * list.length) % list.length]; }
      out.sex = kind === "i_man" ? "m" : kind === "i_woman" ? "f" : look && (look.sex === "m" || look.sex === "f") ? look.sex : r2() < 0.5 ? "m" : "f";
      out.child = kind === "i_child";
      var work = BD_WORK[kind], outfit = look && look.outfit && BD_OUTFITS[look.outfit] ? look.outfit : work || pick2(BD_CASUAL[out.sex]);
      if (out.sex === "f" && outfit === "shirt") { outfit = "blouse"; }
      if (out.sex === "m" && (outfit === "skirt" || outfit === "dress" || outfit === "skirtsuit" || outfit === "blouse")) { outfit = outfit === "blouse" ? "shirt" : "tee"; }
      if (out.sex === "f" && outfit === "suit" && !work && r2() < 0.5) { outfit = "skirtsuit"; }
      if (out.child && (outfit === "suit" || outfit === "skirtsuit" || outfit === "coat")) { outfit = out.sex === "f" ? "dress" : "tee"; }
      out.outfit = outfit;
      out.hairStyle = look && look.hairStyle ? look.hairStyle : pick2(elder ? BD_HAIRS[out.sex + "e"] : BD_HAIRS[out.sex]);
      out.beard = out.sex === "m" && !out.child && r2() < (elder ? 0.4 : 0.26);
      out.tie = pick2(BD_TIES); out.skirt = pick2(BD_SKIRTS); out.top2 = pick2(["#f4f2ee", "#d8d2c4", "#c9ced3", "#3f4a52"]);
      // dressed for the work, or as one of a kind (a suit's jacket and trousers the one cloth)
      var W = BD_WEAR[outfit];
      if (W) {
        if (W.shirt) { out.shirt = pick2(W.shirt); }
        if (W.pants) { out.pants = pick2(W.pants); }
        if (W.same) { out.pants = out.shirt; }
        if (W.top2) { out.top2 = pick2(W.top2); }
        if (W.shoes) { out.shoes = pick2(W.shoes); }
        if (W.hat) { out.hat = pick2(W.hat); }
      }
      if (outfit === "dress") { out.skirt = out.shirt; }
      var U = BD_UNIFORM[kind];
      if (U) { out.shirt = U.shirt; out.pants = U.pants; out.hat = U.hat; out.shoes = "#1d1d1f"; }
      // the clothes as colored for this one, or as handed in (out on the street, at work)
      var mine = n && n.id && style && style.nodes ? style.nodes["h" + n.id] : null;
      var wear = look && look.own ? look : mine || null, paper = simSheet();
      if (wear && wear.fill && wear.fill !== paper && wear.fill !== "#ffffff") { out.shirt = tourHex(wear.fill); if (outfit === "dress") { out.skirt = out.shirt; } }
      if (wear && wear.line && wear.line !== simInk() && wear.line !== wear.fill) {
        out.pants = tourHex(v3Mix(wear.line, "#2e3846", 0.5));
        if (W && W.same && !(look && look.own)) { out.pants = out.shirt; }
      }
      if (look && look.arms) { out.arms = look.arms; out.armK = look.armK || 0; }
      if (look && look.legs) { out.legs = look.legs; }
      if (look && look.hardhat) { out.hardhat = true; out.hardhatColor = look.hardhatColor; }
      return out;
    };
  }
  // The one walking: as before, and as the person you walk as, if you are one drawn on the plan.
  if (typeof tourLook === "function") {
    var tourLookPlain = tourLook;
    tourLook = function () {
      var look = tourLookPlain.apply(this, arguments);
      try {
        var who = V3 && V3.me && V3.me.as ? nodeById(V3.me.as) : null;
        if (who) {
          var L = peopleLook(who, null, who.id);
          look.sex = L.sex; look.outfit = L.outfit; look.hairStyle = L.hairStyle; look.beard = L.beard; look.child = L.child;
          look.top2 = L.top2; look.tie = L.tie; look.skirt = L.skirt; look.hat = L.hat; look.skin = L.skin; look.hair = L.hair;
        }
      } catch (e) { /* as you were */ }
      return look;
    };
  }
  if (typeof tourBody === "function") {
    tourBody = function (faces, x, y, z, head, phase, look, withHead, k, others) {
      bdDraw(faces, x, y, z, head, phase, look, withHead, k || 1, others);
    };
  }
  if (typeof peopleBody === "function") {
    peopleBody = function (faces, n, x, y, z, head, phase, look, fade) {
      var f0 = faces.length, id = n && n.id ? n.id : 1;
      bdDraw(faces, x, y, z, head, phase, peopleLook(n, look, id), true, peopleSize(n && n.kind) * (0.97 + ((id * 37) % 7) / 100), true, fade);
      for (var i = f0; i < faces.length; i++) { faces[i].person = true; }
    };
  }
