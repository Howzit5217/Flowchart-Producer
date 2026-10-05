// ---------------------------------------------------------------------------
//  40-mirrors.js -- mirrors that are mirrors: what each near one sees --
//  the room, whoever stands in it, the light at the window -- drawn into a
//  picture of its own each time the view is drawn, and laid on its glass
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "and while you are here to also update the
  // mirrors so they work")
  //
  // A mirror shows the room as it would be seen from the eye's reflection in
  // it, through it: the scene drawn again from there (38-view3d-gl.js lends
  // the drawing of it, mirrorPass), its frustum cut to the mirror's own
  // rectangle -- the "generalised perspective" of a window onto a scene,
  // its near plane the mirror's, so nothing behind the glass is in it --
  // and that picture laid on the glass, left and right the other way round
  // as a mirror's are.  The nearest few that face the eye, each a picture
  // of 512 pixels; the rest stay as they were made.  Glass from above, the
  // roof off, the eye far off over the house.
  var MR_MOST = 3, MR_SIZE = 512, MR_NEAR = 14;              // mirrors at once, a picture's pixels, metres they are drawn within
  // Where on each model its glass is, in its own numbers (38-models.js):
  // [x half-width less, y of its face, z from, z to less] in cm, and its lean.
  var MR_GLASS = {
    i_mirror: function (W, D, H, cm) { return { hw: W / 2 - 2 * cm, y: -D / 2 + 2.7 * cm, z0: 2 * cm, z1: H - 2 * cm, tilt: 0 }; },
    i_medicine: function (W, D, H, cm) { return { hw: W / 2 - 0.5 * cm, y: D / 2, z0: 0.5 * cm, z1: H - 0.5 * cm, tilt: 0 }; },
    i_floormirror: function (W, D, H, cm) { return { hw: W / 2 - 2.5 * cm, y: -D / 2 + 3.7 * cm, z0: 2.5 * cm, z1: H - 2.5 * cm, tilt: 6 }; },
    i_vanitytable: function (W, D, H, cm) { return { hw: W * 0.2, y: -D / 2 + 5 * cm, z0: H + 2 * cm + W * 0.06, z1: H + 2 * cm + W * 0.54, tilt: 0, top: H }; }
  };
  function mrSub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mrAdd(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function mrDot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function mrCross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function mrUnit(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  // Each mirror in the picture: its glass's corners as seen from in front
  // (bl, br, tl), its middle, which way it faces -- from its model's faces.
  function mrFind(model) {
    // (the same scene as last picture -- the view only turned -- its mirrors as found then)
    if (mrFound.model === model) { return mrFound.out; }
    var out = mrFindAll(model);
    mrFound = { model: model, out: out };
    return out;
  }
  var mrFound = { model: null, out: [] };
  function mrFindAll(model) {
    var P = FLOOR_PX, cm = P / 100, seen = new Map(), out = [];
    (model.faces || []).forEach(function (f) {
      var n = f.node;
      if (!n || !f.mesh || !MR_GLASS[n.kind] || seen.has(n)) { return; }
      var m = f.mesh, xf = m.xf || [0, 0, 1, 0, 0];
      var ox = f.pts[0][0] - m.base[0], oy = f.pts[0][1] - m.base[1], oz = f.pts[0][2] - m.base[2];
      // (as tall as it was made, 38-models.js v3ModelPut: on a wall, its hanging's height; standing, its own)
      var hang = V3_WALL[n.kind] && typeof wallHang === "function" ? wallHang(n) : null;
      var Wd = n.w, Dd = n.h, H = hang ? (hang[1] - hang[0]) * P : pieceHigh(n) * P;
      var g = MR_GLASS[n.kind](Wd, Dd, H, cm), c = xf[2], s = xf[3];
      function W(lx, ly, lz) { return [xf[0] + lx * c - ly * s + ox, xf[1] + lx * s + ly * c + oy, xf[4] + lz + oz]; }
      // (a mirror leaning back: its top further toward the wall, 38-models.js tiltX)
      var lean = Math.sin((g.tilt || 0) * Math.PI / 180);
      var bl = W(g.hw, g.y - lean * g.z0, g.z0), br = W(-g.hw, g.y - lean * g.z0, g.z0), tl = W(g.hw, g.y - lean * g.z1, g.z1);
      // (from in front, its left the model's +x: the model's +y is toward the room)
      var right = mrSub(br, bl), up = mrSub(tl, bl), face = mrUnit(mrCross(right, up));
      if (mrDot(face, mrSub(W(0, g.y + 50, (g.z0 + g.z1) / 2), W(0, g.y, (g.z0 + g.z1) / 2))) < 0) {
        // (the other way about: the face toward the room is the other side)
        var t0 = bl; bl = br; br = t0; tl = W(-g.hw, g.y - lean * g.z1, g.z1);
        right = mrSub(br, bl); up = mrSub(tl, bl); face = mrUnit(mrCross(right, up));
      }
      seen.set(n, true);
      out.push({ n: n, bl: bl, br: br, tl: tl, mid: mrAdd(mrAdd(bl, right, 0.5), up, 0.5), face: face, area: Math.hypot(right[0], right[1]) * Math.hypot(up[0], up[1], up[2]) });
    });
    return out;
  }
  // The frustum from an eye through a rectangle (bl, br, tl) -- its near
  // plane the rectangle's (Kooima, "Generalized Perspective Projection").
  function mrMvp(pe, pa, pb, pc, far) {
    var vr = mrUnit(mrSub(pb, pa)), vu = mrUnit(mrSub(pc, pa)), vn = mrUnit(mrCross(vr, vu));
    var va = mrSub(pa, pe), vb = mrSub(pb, pe), vc = mrSub(pc, pe), d = -mrDot(va, vn);
    if (!(d > 0.5)) { return null; }
    // (its near plane a hair past the glass, into the room: neither the glass nor the wall behind it in the picture)
    var n = d + 0.3, f = Math.max(far, d * 4), k = n / d;
    var l = mrDot(vr, va) * k, r = mrDot(vr, vb) * k, b = mrDot(vu, va) * k, t = mrDot(vu, vc) * k;
    var Pm = [[2 * n / (r - l), 0, (r + l) / (r - l), 0], [0, 2 * n / (t - b), (t + b) / (t - b), 0], [0, 0, -(f + n) / (f - n), -2 * f * n / (f - n)], [0, 0, -1, 0]];
    var Mv = [[vr[0], vr[1], vr[2], -mrDot(vr, pe)], [vu[0], vu[1], vu[2], -mrDot(vu, pe)], [vn[0], vn[1], vn[2], -mrDot(vn, pe)], [0, 0, 0, 1]];
    var o = [[], [], [], []];
    for (var i = 0; i < 4; i++) { for (var j = 0; j < 4; j++) { var sum = 0; for (var q = 0; q < 4; q++) { sum += Pm[i][q] * Mv[q][j]; } o[i][j] = sum; } }
    return gl3Mat(o[0], o[1], o[2], o[3]);
  }
  // Its picture: a frame buffer, its color a texture, a depth buffer with it.
  function mrTarget(G, key) {
    var gl = G.gl, all = G.mirrorTargets || (G.mirrorTargets = {}), T = all[key];
    if (T) { T.used = performance.now(); return T; }
    var keys = Object.keys(all);
    if (keys.length >= MR_MOST + 2) {
      // (the one longest unused, let go)
      var old = keys.sort(function (a, b) { return all[a].used - all[b].used; })[0], o = all[old];
      gl.deleteFramebuffer(o.fb); gl.deleteTexture(o.tex); gl.deleteRenderbuffer(o.depth); delete all[old];
    }
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, MR_SIZE, MR_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, MR_SIZE, MR_SIZE);
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
    var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindTexture(gl.TEXTURE_2D, null);
    if (!ok) { gl.deleteFramebuffer(fb); gl.deleteTexture(tex); gl.deleteRenderbuffer(depth); return null; }
    T = all[key] = { fb: fb, tex: tex, depth: depth, used: performance.now() };
    return T;
  }
  // Called from the drawing of the view (38-view3d-gl.js), its program set
  // up for the picture: each near mirror's picture drawn, and its glass put
  // in with the house's batches to be drawn with them.
  function mirrorPass(X) {
    var gl = X.gl, G = X.G, U = X.U, P = FLOOR_PX;
    // (2026-10-04, "a stable 60fps") the glasses' pictures from the picture before taken
    // off first: a picture's batches kept from the last (40-perf.js) had them put on again
    // each time, one more each picture
    for (var bi = X.batches.length - 1; bi >= 0; bi--) { if (X.batches[bi].mirror) { X.batches.splice(bi, 1); } }
    if (!X.model || X.dress < 0.98 || (typeof V3 !== "undefined" && V3 && V3.flat)) { return; }
    // (every mirror is indoors: from outside, the roof on, none can be seen -- each was
    // the whole house drawn again into it, every picture)
    if (!X.inside && typeof V3 !== "undefined" && V3 && V3.roof && (V3.roofV === undefined || V3.roofV > 0.98)) { return; }
    var all = mrFind(X.model);
    if (!all.length) { return; }
    // (a slow device: the glasses' pictures drawn again every few pictures, as the sun's shadows are)
    var every = typeof V3Q === "object" && V3Q.shadowEvery ? Math.min(4, V3Q.shadowEvery) : 1, R = G.mrLast;
    if (every > 1 && R && R.model === X.model && (G.frameN || 0) - R.at < every) { mrPut(X, R.made); return; }
    // the eye: walking, where it is; from above, far off the way the view looks from
    var far = X.inside ? GL3_FAR : 6000 * P / 50;
    var picks = all.map(function (m) {
      var eye = X.inside && X.eye ? X.eye : mrAdd(m.mid, X.toward, 4000);
      var to = mrSub(eye, m.mid), dist = Math.hypot(to[0], to[1], to[2]);
      if (mrDot(to, m.face) <= 1) { return null; }                     // looked at from behind, or along it
      if (X.inside && dist > MR_NEAR * P) { return null; }
      if (X.inside && X.ahead && mrDot(mrUnit(mrSub(m.mid, eye)), X.ahead) < 0.2) { return null; }
      return { m: m, eye: eye, dist: dist, score: X.inside ? dist : -m.area };
    }).filter(Boolean).sort(function (a, b) { return a.score - b.score; }).slice(0, MR_MOST);
    if (!picks.length) { return; }
    var D = X.D, normalK = [Math.pow(2, -19), -1, 0], mainK = X.depthK;
    var made = [];
    try {
      if (D) { D.cc.clipControlEXT(D.cc.LOWER_LEFT_EXT, D.cc.NEGATIVE_ONE_TO_ONE_EXT); }
      gl.clearDepth(1);
      gl.depthFunc(gl.LEQUAL); gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 2);
      X.setDepthK(normalK);
      gl.uniform1f(U.uOrtho, 0);
      if (U.uDepthK) { gl.uniform1f(U.uOrthoV, 0); }
      picks.forEach(function (pk) {
        var m = pk.m, E = pk.eye;
        // the eye's reflection in the glass's plane
        var off = mrDot(mrSub(E, m.mid), m.face), Er = mrAdd(E, m.face, -2 * off);
        // (from behind the glass, its left is the other corner)
        var mvp = mrMvp(Er, m.br, m.bl, mrAdd(m.br, mrSub(m.tl, m.bl), 1), far);
        var T = mvp && mrTarget(G, m.n.id);
        if (!T) { return; }
        gl.bindFramebuffer(gl.FRAMEBUFFER, T.fb);
        gl.viewport(0, 0, MR_SIZE, MR_SIZE);
        gl.clearColor(X.horizon[0], X.horizon[1], X.horizon[2], 1);
        // (its depth written as it is cleared: the sky, drawn just before, leaves the writing of it off)
        gl.depthMask(true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(U.uMvp, false, mvp);
        gl.uniform3fv(U.uEye, Er);
        if (U.uDepthK) { gl.uniform3fv(U.uEyeV, Er); }
        if (!X.under) { X.draw(X.scenery.verts, { alpha: 1 }, gl.TRIANGLES); }
        X.batches.forEach(function (x) { if (!x.how.lines && !x.how.blend && !x.how.caster && !x.mirror) { X.draw(x.data, x.how, gl.TRIANGLES, x.key); } });
        X.batches.forEach(function (x) { if (x.how.blend && !x.how.decal && !x.mirror) { X.draw(x.data, { blend: true, noDepthWrite: true }, gl.TRIANGLES, x.key); } });
        gl.depthMask(true);
        made.push({ m: m, T: T });
      });
    } finally {
      // the picture's own way of drawing, back as it was
      gl.bindFramebuffer(gl.FRAMEBUFFER, D ? D.fb : null);
      if (D) { D.cc.clipControlEXT(D.cc.LOWER_LEFT_EXT, D.cc.ZERO_TO_ONE_EXT); gl.clearDepth(0); }
      gl.viewport(0, 0, X.W, X.H);
      gl.depthFunc(D ? gl.GEQUAL : gl.LEQUAL);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(D ? -1 : 1, D ? -2 : 2);
      X.setDepthK(mainK);
      gl.uniformMatrix4fv(U.uMvp, false, X.mainMvp);
      gl.uniform3fv(U.uEye, X.eye || [0, 0, 0]);
      gl.uniform1f(U.uOrtho, X.inside ? 0 : 1);
      if (U.uDepthK) { gl.uniform3fv(U.uEyeV, X.eye || [0, 0, 0]); gl.uniform1f(U.uOrthoV, X.inside ? 0 : 1); }
    }
    if (typeof V3 !== "undefined" && V3) { V3.mirrorsDrawn = made.length; V3.mirrorsSeen = picks.length; }
    G.mrLast = { model: X.model, at: G.frameN || 0, made: made };
    mrPut(X, made);
  }
  // each glass, its picture on it -- just in front of the model's own
  function mrPut(X, made) {
    made.forEach(function (o) {
      var m = o.m, lift = m.face, k = 0.35;
      var bl = mrAdd(m.bl, lift, k), br = mrAdd(m.br, lift, k), tl = mrAdd(m.tl, lift, k), tr = mrAdd(br, mrSub(tl, bl), 1);
      var v = [];
      // (as seen from in front its left is the picture's right: the picture drawn from behind)
      gl3Poly(v, [bl, br, tr, tl], m.face, [1, 1, 1], 1, [[1, 0], [0, 0], [0, 1], [1, 1]], 0);
      X.batches.push({ key: "mirror|" + m.n.id, v: v, data: new Float32Array(v), how: { tex: o.T.tex, bill: true }, mirror: true });
    });
  }
