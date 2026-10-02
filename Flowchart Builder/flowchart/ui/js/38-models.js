// ---------------------------------------------------------------------------
//  38-models.js -- the things in a home made in 3D: a sofa of cushions on
//  its legs, a lamp turned like a vase, a bed made up with its pillows
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ============================================================== models ==
  // 38-view3d.js put each piece of furniture up as a box its own height
  // with its drawing from the plan laid on top -- a picture of a sofa on a
  // block (asked for, 2026-10-01: "update the 3d models of things ... not
  // just be flat cubes with the designs ... actually attempt to 3dify these
  // things to make them professional").  Here each is made instead, the way
  // it is built: cushions with rounded edges, legs, drawers with their
  // handles, a basin let into its counter, leaves round a stem.
  //
  // A model is made in the piece's own numbers -- x across its width, y
  // from its back (-depth/2, the wall it stands against) to its front, z up
  // from where it stands -- out of a few kinds of part: a box (its edges
  // rounded or not), a cylinder, something turned on a lathe, a tube from
  // one point to another, a ball.  Every part says what it is made of (the
  // shader in 38-view3d-gl.js gives each its look: the weave of fabric,
  // the grain of wood, the shine of steel or china) and in what color.
  // What one piece is made of is handed over as one mesh a material, its
  // normals smooth where it is round, and kept until the piece changes.
  //
  // Only WebGL draws them: the old painter, sorting faces back to front,
  // could not keep up with thousands, and the paper laid flat (2D) still
  // shows the plan's drawings.  What a body walking round bumps into is
  // the piece's own box, as before, never a chair's leg.
  var MODEL_CM = FLOOR_PX / 100;         // pixels in a centimetre
  var modelKept = new Map();             // made models, by everything they are made from

  function mRand(seed) {                 // the same numbers every time for the same piece
    var a = (seed | 0) + 0x9E3779B9;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function mMul(A, B) {                  // A, then B within it: a 3x3 turn and a move
    return [A[0] * B[0] + A[1] * B[3] + A[2] * B[6], A[0] * B[1] + A[1] * B[4] + A[2] * B[7], A[0] * B[2] + A[1] * B[5] + A[2] * B[8],
            A[3] * B[0] + A[4] * B[3] + A[5] * B[6], A[3] * B[1] + A[4] * B[4] + A[5] * B[7], A[3] * B[2] + A[4] * B[5] + A[5] * B[8],
            A[6] * B[0] + A[7] * B[3] + A[8] * B[6], A[6] * B[1] + A[7] * B[4] + A[8] * B[7], A[6] * B[2] + A[7] * B[5] + A[8] * B[8],
            A[0] * B[9] + A[1] * B[10] + A[2] * B[11] + A[9], A[3] * B[9] + A[4] * B[10] + A[5] * B[11] + A[10],
            A[6] * B[9] + A[7] * B[10] + A[8] * B[11] + A[11]];
  }
  function mUnit(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function mCross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

  // ---- a model, being made -------------------------------------------------------
  // `place` is the piece's own frame in the drawing: where it stands, which
  // way it is turned, and how high off the floor it starts.
  function modelMaker(x, y, turn, z0) {
    var a = (turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var M = { cur: [c, -s, 0, s, c, 0, 0, 0, 1, x, y, z0], stack: [], parts: {}, order: [] };
    M.push = function () { M.stack.push(M.cur); return M; };
    M.pop = function () { M.cur = M.stack.pop(); return M; };
    M.move = function (dx, dy, dz) { M.cur = mMul(M.cur, [1, 0, 0, 0, 1, 0, 0, 0, 1, dx, dy, dz || 0]); return M; };
    M.turn = function (deg) {            // round z, the way a piece turns on the plan
      var t = deg * Math.PI / 180, k = Math.cos(t), q = Math.sin(t);
      M.cur = mMul(M.cur, [k, -q, 0, q, k, 0, 0, 0, 1, 0, 0, 0]);
      return M;
    };
    M.tiltX = function (deg) {           // round x: a positive tilt leans the top back (to -y)
      var t = deg * Math.PI / 180, k = Math.cos(t), q = Math.sin(t);
      M.cur = mMul(M.cur, [1, 0, 0, 0, k, -q, 0, q, k, 0, 0, 0]);
      return M;
    };
    M.tiltY = function (deg) {           // round y: a positive tilt leans the top to +x
      var t = deg * Math.PI / 180, k = Math.cos(t), q = Math.sin(t);
      M.cur = mMul(M.cur, [k, 0, q, 0, 1, 0, -q, 0, k, 0, 0, 0]);
      return M;
    };
    // what a part is made of, and its color: one mesh each
    M.mat = function (kind, color) {
      var key = kind + "|" + color;
      if (!M.parts[key]) {
        M.parts[key] = { how: { model: true, mat: kind, color: color, glass: kind === "glass", shade: kind === "shade" },
                         p: [], n: [], uv: [], a: kind === "shade" ? [] : null };
        M.order.push(key);
      }
      return key;
    };
    function put(m, p, nn, uv, alpha) {
      var C = M.cur, b = M.parts[m];
      b.p.push(C[0] * p[0] + C[1] * p[1] + C[2] * p[2] + C[9], C[3] * p[0] + C[4] * p[1] + C[5] * p[2] + C[10],
               C[6] * p[0] + C[7] * p[1] + C[8] * p[2] + C[11]);
      b.n.push(C[0] * nn[0] + C[1] * nn[1] + C[2] * nn[2], C[3] * nn[0] + C[4] * nn[1] + C[5] * nn[2],
               C[6] * nn[0] + C[7] * nn[1] + C[8] * nn[2]);
      b.uv.push(uv ? uv[0] : 0, uv ? uv[1] : 0);
      if (b.a) { b.a.push(alpha === undefined ? 1 : alpha); }
    }
    M.tri = function (m, A, B, C, nA, nB, nC, uA, uB, uC, aA, aB, aC) {
      put(m, A, nA, uA, aA); put(m, B, nB, uB, aB); put(m, C, nC, uC, aC);
    };
    // four corners, flat, its way out worked out from them unless given
    M.quad = function (m, A, B, C, D, nn, uvs) {
      nn = nn || mUnit(mCross([B[0] - A[0], B[1] - A[1], B[2] - A[2]], [D[0] - A[0], D[1] - A[1], D[2] - A[2]]));
      uvs = uvs || [[0, 0], [1, 0], [1, 1], [0, 1]];
      M.tri(m, A, B, C, nn, nn, nn, uvs[0], uvs[1], uvs[2]);
      M.tri(m, A, C, D, nn, nn, nn, uvs[0], uvs[2], uvs[3]);
    };
    // A box from x0 to x1, y0 to y1, z0 to z1 -- its edges rounded by r.
    M.box = function (x0, x1, y0, y1, z0, z1, m, r) {
      if (x1 < x0) { var t = x0; x0 = x1; x1 = t; }
      if (y1 < y0) { var u = y0; y0 = y1; y1 = u; }
      if (z1 < z0) { var v = z0; z0 = z1; z1 = v; }
      r = Math.min(r || 0, (x1 - x0) / 2 - 0.02, (y1 - y0) / 2 - 0.02, (z1 - z0) / 2 - 0.02);
      if (r > 0.08) { roundBox(x0, x1, y0, y1, z0, z1, m, r); return M; }
      var P = FLOOR_PX;
      function uv2(a, b) { return [a / P, b / P]; }
      // each side, its grain along its longer way
      function side(A, B, C, D, nn, ua, va) {
        var lu = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]), lv = Math.hypot(D[0] - A[0], D[1] - A[1], D[2] - A[2]);
        var uvs = lu >= lv ? [uv2(0, 0), uv2(lu, 0), uv2(lu, lv), uv2(0, lv)] : [uv2(0, 0), uv2(0, lu), uv2(lv, lu), uv2(lv, 0)];
        uvs = uvs.map(function (q) { return [q[0] + ua, q[1] + va]; });
        M.quad(m, A, B, C, D, nn, uvs);
      }
      var o0 = (x0 + y0) / P, o1 = z0 / P;
      side([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], o0, 0);
      if (z0 > 0.5) { side([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [0, 0, -1], o0, 0); }
      side([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], x0 / P, o1);
      side([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0], x0 / P, o1);
      side([x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [-1, 0, 0], y0 / P, o1);
      side([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0], y0 / P, o1);
      return M;
    };
    // Rounded: every point of the box's faces pulled in to the box r inside
    // it and pushed back out r, so edges turn as cylinders and corners as
    // the corners of a ball -- its way out the way it was pushed.
    function roundBox(x0, x1, y0, y1, z0, z1, m, r) {
      var T = 0.41421356, lo = [x0 + r, y0 + r, z0 + r], hi = [x1 - r, y1 - r, z1 - r], P = FLOOR_PX;
      function steps(a0, a1) { return [a0, a0 + r * (1 - T), a0 + r, a1 - r, a1 - r * (1 - T), a1]; }
      function at(v) {
        var cx = Math.max(lo[0], Math.min(hi[0], v[0])), cy = Math.max(lo[1], Math.min(hi[1], v[1])),
            cz = Math.max(lo[2], Math.min(hi[2], v[2]));
        var d = [v[0] - cx, v[1] - cy, v[2] - cz], l = Math.hypot(d[0], d[1], d[2]);
        if (l < 1e-6) { return null; }
        var nn = [d[0] / l, d[1] / l, d[2] / l];
        return { p: [cx + nn[0] * r, cy + nn[1] * r, cz + nn[2] * r], n: nn };
      }
      var sx = steps(x0, x1), sy = steps(y0, y1), sz = steps(z0, z1);
      // each face: which axis it is fixed on and where, and its two ways along
      [[2, z1, 0, 1], [2, z0, 0, 1], [1, y0, 0, 2], [1, y1, 0, 2], [0, x0, 1, 2], [0, x1, 1, 2]].forEach(function (F) {
        if (F[0] === 2 && F[1] === z0 && z0 < 0.5) { return; }   // standing on the floor: its underside never shows
        var A = [sx, sy, sz][F[2]], B = [sx, sy, sz][F[3]];
        for (var i = 0; i + 1 < A.length; i++) {
          for (var j = 0; j + 1 < B.length; j++) {
            var corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(function (ij) {
              var v = [0, 0, 0];
              v[F[0]] = F[1]; v[F[2]] = A[ij[0]]; v[F[3]] = B[ij[1]];
              var q = at(v);
              return q ? { p: q.p, n: q.n, uv: [A[ij[0]] / P, B[ij[1]] / P] } : null;
            });
            if (corners.some(function (q) { return !q; })) { continue; }
            M.tri(m, corners[0].p, corners[1].p, corners[2].p, corners[0].n, corners[1].n, corners[2].n,
                  corners[0].uv, corners[1].uv, corners[2].uv);
            M.tri(m, corners[0].p, corners[2].p, corners[3].p, corners[0].n, corners[2].n, corners[3].n,
                  corners[0].uv, corners[2].uv, corners[3].uv);
          }
        }
      });
    }
    // Something turned: a profile [[radius, height], ...] from the foot up,
    // round x, y -- squashed to an oval by o.ry (its depth over its width).
    M.lathe = function (x, y, prof, m, o) {
      o = o || {};
      var seg = o.seg || 20, ry = o.ry || 1, P = FLOOR_PX, from = o.from || 0, to = o.to === undefined ? 360 : o.to;
      var whole = to - from >= 359.9;
      var norms = prof.map(function (q, k) {   // each ring's way out, the two sides of it averaged
        var a = prof[Math.max(0, k - 1)], b = prof[Math.min(prof.length - 1, k + 1)];
        var dr = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dr, dz) || 1;
        return [dz / l, -dr / l];
      });
      var steps = whole ? seg : Math.max(2, Math.round(seg * (to - from) / 360));
      for (var i = 0; i < steps; i++) {
        var a0 = (from + (to - from) * i / steps) * Math.PI / 180, a1 = (from + (to - from) * (i + 1) / steps) * Math.PI / 180;
        for (var k = 0; k + 1 < prof.length; k++) {
          var p = prof[k], q = prof[k + 1], np = norms[k], nq = norms[k + 1];
          if (p[0] < 0.001 && q[0] < 0.001) { continue; }
          var A = [x + Math.cos(a0) * p[0], y + Math.sin(a0) * p[0] * ry, p[1]], B = [x + Math.cos(a1) * p[0], y + Math.sin(a1) * p[0] * ry, p[1]];
          var C = [x + Math.cos(a1) * q[0], y + Math.sin(a1) * q[0] * ry, q[1]], D = [x + Math.cos(a0) * q[0], y + Math.sin(a0) * q[0] * ry, q[1]];
          function nAt(n2, ang) { return mUnit([Math.cos(ang) * n2[0] / 1, Math.sin(ang) * n2[0] / ry, n2[1]]); }
          var uA = [a0 * p[0] / P, p[1] / P], uB = [a1 * p[0] / P, p[1] / P], uC = [a1 * q[0] / P, q[1] / P], uD = [a0 * q[0] / P, q[1] / P];
          M.tri(m, A, B, C, nAt(np, a0), nAt(np, a1), nAt(nq, a1), uA, uB, uC);
          M.tri(m, A, C, D, nAt(np, a0), nAt(nq, a1), nAt(nq, a0), uA, uC, uD);
        }
      }
      var last = prof[prof.length - 1], first = prof[0];
      if (o.top && last[0] > 0.01) { M.disc(x, y, last[1], last[0], last[0] * ry, o.topMat || m, seg); }
      if (o.bottom && first[0] > 0.01) { M.disc(x, y, first[1], first[0], first[0] * ry, m, seg, true); }
      return M;
    };
    M.cyl = function (x, y, z0, z1, r, m, o) {
      o = o || {};
      var r1 = o.r1 === undefined ? r : o.r1;
      return M.lathe(x, y, [[r, z0], [r1, z1]], m, { seg: o.seg || 14, ry: o.ry, top: o.top !== false, bottom: !!o.bottom, topMat: o.topMat });
    };
    M.disc = function (x, y, z, rx, ry, m, seg, down) {
      seg = seg || 20;
      var nn = [0, 0, down ? -1 : 1], P = FLOOR_PX;
      for (var i = 0; i < seg; i++) {
        var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2;
        M.tri(m, [x, y, z], [x + Math.cos(a0) * rx, y + Math.sin(a0) * ry, z], [x + Math.cos(a1) * rx, y + Math.sin(a1) * ry, z],
              nn, nn, nn, [x / P, y / P], [(x + Math.cos(a0) * rx) / P, (y + Math.sin(a0) * ry) / P],
              [(x + Math.cos(a1) * rx) / P, (y + Math.sin(a1) * ry) / P]);
      }
      return M;
    };
    // A round rod from one point to another.
    M.tube = function (A, B, r, m, seg, ends) {
      seg = seg || 8;
      var d = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], L = Math.hypot(d[0], d[1], d[2]);
      if (L < 1e-6) { return M; }
      var w = [d[0] / L, d[1] / L, d[2] / L];
      var u = mUnit(Math.abs(w[2]) < 0.9 ? mCross(w, [0, 0, 1]) : mCross(w, [1, 0, 0])), v = mCross(w, u), P = FLOOR_PX;
      for (var i = 0; i < seg; i++) {
        var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2;
        var n0 = [u[0] * Math.cos(a0) + v[0] * Math.sin(a0), u[1] * Math.cos(a0) + v[1] * Math.sin(a0), u[2] * Math.cos(a0) + v[2] * Math.sin(a0)];
        var n1 = [u[0] * Math.cos(a1) + v[0] * Math.sin(a1), u[1] * Math.cos(a1) + v[1] * Math.sin(a1), u[2] * Math.cos(a1) + v[2] * Math.sin(a1)];
        var p0 = [A[0] + n0[0] * r, A[1] + n0[1] * r, A[2] + n0[2] * r], p1 = [A[0] + n1[0] * r, A[1] + n1[1] * r, A[2] + n1[2] * r];
        var q0 = [B[0] + n0[0] * r, B[1] + n0[1] * r, B[2] + n0[2] * r], q1 = [B[0] + n1[0] * r, B[1] + n1[1] * r, B[2] + n1[2] * r];
        M.tri(m, p0, p1, q1, n0, n1, n1, [0, a0 * r / P], [0, a1 * r / P], [L / P, a1 * r / P]);
        M.tri(m, p0, q1, q0, n0, n1, n0, [0, a0 * r / P], [L / P, a1 * r / P], [L / P, a0 * r / P]);
        if (ends) {
          M.tri(m, B, q0, q1, w, w, w);
          M.tri(m, A, p1, p0, [-w[0], -w[1], -w[2]], [-w[0], -w[1], -w[2]], [-w[0], -w[1], -w[2]]);
        }
      }
      return M;
    };
    // A ball, squashed or stretched to rx, ry, rz -- or only from latitude
    // o.lat0 to o.lat1 (degrees, -90 the bottom).
    M.ball = function (x, y, z, rx, ry, rz, m, o) {
      o = o || {};
      var rows = o.seg || 8, cols = rows * 2, la0 = (o.lat0 === undefined ? -90 : o.lat0) * Math.PI / 180,
          la1 = (o.lat1 === undefined ? 90 : o.lat1) * Math.PI / 180, P = FLOOR_PX;
      function pt(i, j) {
        var la = la0 + (la1 - la0) * i / rows, lo = j / cols * Math.PI * 2;
        var cx = Math.cos(la) * Math.cos(lo), cy = Math.cos(la) * Math.sin(lo), cz = Math.sin(la);
        return { p: [x + cx * rx, y + cy * ry, z + cz * rz], n: mUnit([cx / rx, cy / ry, cz / rz]),
                 uv: [lo * rx / P, la * rz / P] };
      }
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
          var A = pt(i, j), B = pt(i, j + 1), C = pt(i + 1, j + 1), D = pt(i + 1, j);
          M.tri(m, A.p, B.p, C.p, A.n, B.n, C.n, A.uv, B.uv, C.uv);
          M.tri(m, A.p, C.p, D.p, A.n, C.n, D.n, A.uv, C.uv, D.uv);
        }
      }
      return M;
    };
    // A flat shape stood up from z0 to z1: its sides, and a lid (a fan
    // from its middle -- for a shape round its middle).
    M.prism = function (pts, z0, z1, m, noTop) {
      var cx = 0, cy = 0, P = FLOOR_PX;
      pts.forEach(function (q) { cx += q[0] / pts.length; cy += q[1] / pts.length; });
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        var nx = b[1] - a[1], ny = a[0] - b[0], l = Math.hypot(nx, ny) || 1;
        if (nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
        var len = Math.hypot(b[0] - a[0], b[1] - a[1]) / P;
        M.quad(m, [a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1], [nx / l, ny / l, 0],
               [[0, z0 / P], [len, z0 / P], [len, z1 / P], [0, z1 / P]]);
        if (!noTop) {
          M.tri(m, [cx, cy, z1], [a[0], a[1], z1], [b[0], b[1], z1], [0, 0, 1], [0, 0, 1], [0, 0, 1],
                [cx / P, cy / P], [a[0] / P, a[1] / P], [b[0] / P, b[1] / P]);
        }
      }
      return M;
    };
    // A soft shadow on the floor under it, darkest in the middle.
    M.under = function (w, d, x, y) {
      var m = M.mat("shade", "#000000"), seg = 18, rx = w / 2 + 3, ry = d / 2 + 3, z = 0.25;
      x = x || 0; y = y || 0;
      for (var i = 0; i < seg; i++) {
        var a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2;
        // a rounded square, not an oval: furniture stands square
        function edge(a) {
          var c = Math.cos(a), s = Math.sin(a), k = Math.pow(Math.pow(Math.abs(c), 4) + Math.pow(Math.abs(s), 4), -0.25);
          return [x + c * k * rx, y + s * k * ry, z];
        }
        M.tri(m, [x, y, z], edge(a0), edge(a1), [0, 0, 1], [0, 0, 1], [0, 0, 1], null, null, null, 0.34, 0, 0);
      }
      return M;
    };
    // Every mesh as one face for 38-view3d-gl.js: its box's corners as its
    // points (what the view is fitted round), its triangles alongside.
    M.done = function () {
      var out = [];
      M.order.forEach(function (key) {
        var b = M.parts[key];
        if (!b.p.length) { return; }
        var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
        for (var i = 0; i < b.p.length; i += 3) {
          for (var k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], b.p[i + k]); hi[k] = Math.max(hi[k], b.p[i + k]); }
        }
        var pts = [[lo[0], lo[1], lo[2]], [hi[0], lo[1], lo[2]], [hi[0], hi[1], lo[2]], [lo[0], hi[1], lo[2]],
                   [lo[0], lo[1], hi[2]], [hi[0], lo[1], hi[2]], [hi[0], hi[1], hi[2]], [lo[0], hi[1], hi[2]]];
        out.push({ pts: pts, n: [0, 0, 1], how: b.how,
                   mesh: { p: new Float32Array(b.p), n: new Float32Array(b.n), uv: new Float32Array(b.uv),
                           a: b.a ? new Float32Array(b.a) : null, base: pts[0].slice() } });
      });
      return out;
    };
    return M;
  }

  // ---- what a piece is colored --------------------------------------------------
  // Each model has its own colors, the way the thing usually comes: a grey
  // sofa on dark wooden legs, a white basin, a steel fridge.  A color picked
  // for the piece on the paper is its main color (the fabric, the body), and
  // the finish picked in the panel (39-design.js) its main and its frame.
  function modelColors(n) {
    var mine = (typeof style === "object" && style && style.nodes && style.nodes["h" + n.id]) || {}, fin = n.fin || {};
    return { main: fin.main || mine.fill || null, frame: fin.frame || null };
  }
  function mPick(C, main, frame) {
    return { main: C.main || main, frame: C.frame || frame || main };
  }

  // ---- what a house is made of ------------------------------------------------------
  // (asked for, 2026-10-01: "add textures ... let you choose what walls are
  // made from the outside of the home and for other things like that")  A
  // room's floor and its walls inside are its own; the walls outside and
  // the roof are the whole house's -- set on every room, and a room drawn
  // later takes them from the rest.  Each is [the shader's pattern for it
  // (38-view3d-gl.js), its color unless one is picked], in `room.mat` as
  // { floor, floorC, wall, wallC, out, outC, roof, roofC }.
  var HOUSE_MATS = {
    floor: { boards: [2, "#b98d63"], parquet: [48, "#a77a50"], tiles: [7, "#dfe2e4"], marble: [49, "#ece9e4"],
             slate: [50, "#8f9391"], carpet: [47, "#a9a39a"], concrete: [10, "#a8a8a4"] },
    wall: { paint: [0, "#f2efe8"], wallpaper: [51, "#e6dccb"], panels: [52, "#b48a62"], tiles: [53, "#f4f4f1"],
            brick: [40, "#a65a44"], stone: [41, "#b9b1a3"] },
    out: { siding: [13, "#ede8dc"], brick: [40, "#a65a44"], stone: [41, "#b9b1a3"], stucco: [42, "#efe7d6"],
           boards: [43, "#8e6f52"], shakes: [54, "#9a7a5a"] },
    roof: { shingles: [1, "#5d6166"], tiles: [44, "#b5603f"], metal: [45, "#4f5a63"], slate: [46, "#4a4f57"] }
  };
  // The colors offered for each, the first its own.
  var HOUSE_TINTS = {
    boards: ["#b98d63", "#d8b68c", "#8a5f3c", "#5e3f27", "#c9c2b6"], parquet: ["#a77a50", "#c9a273", "#6e4a32"],
    tiles: ["#dfe2e4", "#f4f4f1", "#c9c3b6", "#7f8c93", "#2f3437"], marble: ["#ece9e4", "#d7d2c9", "#2f3135"],
    slate: ["#8f9391", "#5d6062", "#a39a8a"], carpet: ["#a9a39a", "#7f8794", "#b5a58c", "#6f7d6a", "#d4ccbf"],
    concrete: ["#a8a8a4", "#8c8c88", "#c4c1ba"],
    paint: ["#f2efe8", "#e8e4da", "#dfe7ea", "#e6ece0", "#f0e2d6", "#d9d4cc", "#5f6b73"],
    wallpaper: ["#e6dccb", "#d6e0e6", "#e6d6d6", "#dfe6d6"], panels: ["#b48a62", "#e8e2d6", "#6e4a32"],
    brick: ["#a65a44", "#8c4a3a", "#c9b9a6", "#6b5a52"], stone: ["#b9b1a3", "#8f8a80", "#d6cdbd"],
    siding: ["#ede8dc", "#c9d3d9", "#6f8592", "#e2d3b5", "#3f4a52", "#8c9c84"], stucco: ["#efe7d6", "#e6c9a8", "#d9d6cf", "#c7b49a"],
    shakes: ["#9a7a5a", "#7d6a5a", "#b9a68c"],
    roofshingles: ["#5d6166", "#3f4246", "#7a5f4c", "#5c6b5a"], rooftiles: ["#b5603f", "#8f4a34", "#c99a6b"],
    roofmetal: ["#4f5a63", "#7a2e2a", "#2f4a3c", "#c9ced3"], roofslate: ["#4a4f57", "#3a3d42"]
  };
  function houseTints(part, kind) { return HOUSE_TINTS[(part === "roof" ? "roof" : "") + kind] || [HOUSE_MATS[part][kind][1]]; }
  // What a room's part is made of, picked -- or null, and it is made of
  // what it always was (boards, or tiles where there is water; siding).
  function houseMat(room, part) {
    var mine = (room && room.mat) || {}, kind = mine[part], color = mine[part + "C"];
    if ((part === "out" || part === "roof") && !kind) {
      var other = hand.nodes.filter(function (r) { return r.kind === "i_room" && r.mat && r.mat[part]; })[0];
      if (other) { kind = other.mat[part]; color = color || other.mat[part + "C"]; }
    }
    var table = HOUSE_MATS[part];
    if (!table || !table[kind]) { return null; }
    return { kind: kind, pat: table[kind][0], color: color || table[kind][1] };
  }

  // ---- when they are drawn --------------------------------------------------------
  // By WebGL, in a home, once its walls are up (rising, the plan's drawings
  // are still what is seen).
  function modelsOn() {
    if (!V3 || V3.scene === "space") { return false; }
    if (typeof gl3Ready !== "function" || !gl3Ready()) { return false; }
    if (V3.mode === "walk") { return true; }
    if (V3.flat && V3.flatDone) { return false; }
    return (V3.rise === undefined ? 1 : V3.rise) > 0.3;
  }

  // The kinds made, and how: MODELS[kind](M, W, D, H, C, n, extra), every
  // length in pixels -- W across, D from back to front, H up.
  var MODELS = {};
  function mDef(kinds, fn) { kinds.split(" ").forEach(function (k) { MODELS[k] = fn; }); }

  // Put up in place of 38-view3d.js's box: the model, and round it the box
  // a body bumps into (unseen).  False where there is no model, or models
  // are not being drawn, and the box goes up as it did.
  function v3ModelPut(faces, n, under, ceilAt) {
    var make = MODELS[n.kind];
    if (!make || !modelsOn()) { return false; }
    var z0, H, extra = {}, P = FLOOR_PX;
    if (ON_TOP[n.kind] && V3_ON[n.kind]) {
      z0 = under(n) * P; H = pieceHigh(n) * P; extra.onTop = true;
    } else if (FROM_CEILING[n.kind]) {
      var hi = ceilAt(n) * P, drop = hangDrop(n);
      var bottom = Math.min(Math.max(hi - drop[0] * P, (under(n) + 0.08) * P), hi - 0.12 * P);
      var body = Math.min(bottom + drop[1] * P, hi - 0.03 * P);
      z0 = bottom; H = Math.max(2, body - bottom); extra.cord = hi - body; extra.hung = true;
    } else if (V3_WALL[n.kind]) {
      var hang = wallHang(n), clear = 0;
      hand.nodes.forEach(function (m) {
        if (m === n || V3_HIGH[m.kind] === undefined || LIES_FLAT[m.kind] || !boxesOverlap(m, n)) { return; }
        clear = Math.max(clear, pieceHigh(m) + 0.06);
      });
      if (clear > hang[0] && hang[1] - hang[0] + clear <= ceilAt(n) - 0.02) { hang = [clear, clear + hang[1] - hang[0]]; }
      z0 = hang[0] * P; H = (hang[1] - hang[0]) * P; extra.onWall = true;
    } else if (V3_HIGH[n.kind] !== undefined) {
      z0 = 0; H = pieceHigh(n) * P;
    } else if (n.kind === "i_fence") {
      z0 = 0; H = 1.1 * P;
    } else {
      return false;
    }
    // Made in its own numbers and kept by what it is made from -- not where
    // it stands: moved or turned, it is the same model, put somewhere else
    // as it is drawn (gl3Faces).
    var C = modelColors(n);
    var key = [n.kind, n.id, Math.round(n.w * 10), Math.round(n.h * 10), Math.round(H * 10),
               Math.round((extra.cord || 0) * 10), C.main || "", C.frame || "", n.fin ? JSON.stringify(n.fin) : ""].join("|");
    var made = modelKept.get(key);
    if (!made) {
      var M = modelMaker(0, 0, 0, 0);
      try {
        make(M, Math.max(2, n.w), Math.max(2, n.h), Math.max(1, H), C, n, extra);
        if (!extra.onTop && !extra.hung && !extra.onWall && !LIES_FLAT[n.kind] && n.kind !== "i_fence" && n.kind !== "i_pool") {
          M.under(n.w, n.h);
        }
      } catch (e) {
        if (window.console && console.warn) { console.warn("3D model of " + n.kind + ":", e && e.message); }
        return false;
      }
      made = M.done();
      if (modelKept.size > 600) { modelKept.clear(); }
      modelKept.set(key, made);
    }
    var t = (n.turn || 0) * Math.PI / 180, tc = Math.cos(t), ts = Math.sin(t);
    made.forEach(function (f) {
      var pts = f.pts.map(function (p) { return [n.x + p[0] * tc - p[1] * ts, n.y + p[0] * ts + p[1] * tc, z0 + p[2]]; });
      faces.push({ pts: pts, n: f.n, how: f.how,
                   mesh: { p: f.mesh.p, n: f.mesh.n, uv: f.mesh.uv, a: f.mesh.a, base: pts[0].slice(), xf: [n.x, n.y, tc, ts, z0] } });
    });
    // what walking bumps into: the box it stands in, sides only, unseen
    var corners = [[-n.w / 2, -n.h / 2], [n.w / 2, -n.h / 2], [n.w / 2, n.h / 2], [-n.w / 2, n.h / 2]]
      .map(function (p) { return v3Local(n, p[0], p[1]); });
    for (var i = 0; i < 4; i++) {
      var a = corners[i], b = corners[(i + 1) % 4];
      faces.push({ pts: [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z0 + H], [a[0], a[1], z0 + H]],
                   n: [0, 0, 1], how: { ghost: true }, side: true });
    }
    return true;
  }

  // ==================================================== the parts they share ==
  var cm = MODEL_CM;
  // four legs, square or round, in from the corners
  function mLegs(M, x0, x1, y0, y1, inset, z0, z1, r, m, round, taper) {
    [[x0 + inset, y0 + inset], [x1 - inset, y0 + inset], [x1 - inset, y1 - inset], [x0 + inset, y1 - inset]].forEach(function (p) {
      if (round) { M.cyl(p[0], p[1], z0, z1, taper ? r * 0.7 : r, m, { r1: r, seg: 10 }); }
      else { M.box(p[0] - r, p[0] + r, p[1] - r, p[1] + r, z0, z1, m); }
    });
  }
  // drawers or doors across a front at y, from x0 to x1 and z0 to z1, in
  // rows by cols, each a panel stood a little proud with its handle
  function mFronts(M, x0, x1, y, z0, z1, rows, cols, m, handle, how) {
    how = how || {};
    var gap = 0.35 * cm, w = (x1 - x0) / cols, h = (z1 - z0) / rows, out = how.out || 0.9 * cm;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var a = x0 + c * w + gap, b = x0 + (c + 1) * w - gap, lo = z0 + r * h + gap, hi = z0 + (r + 1) * h - gap;
        M.box(a, b, y - 0.2 * cm, y + out, lo, hi, m, 0.25 * cm);
        if (!handle) { continue; }
        var hx = (a + b) / 2, hz = (lo + hi) / 2;
        if (how.doors) {                  // a door's handle stands upright by the edge it opens from
          hx = cols === 1 ? b - 4 * cm : (c % 2 ? a + 4 * cm : b - 4 * cm);
          var len = Math.min(18 * cm, (hi - lo) * 0.3);
          hz = how.low ? lo + len / 2 + 6 * cm : how.high ? hi - len / 2 - 6 * cm : hz;
          M.box(hx - 0.6 * cm, hx + 0.6 * cm, y + out, y + out + 2.2 * cm, hz - len / 2, hz + len / 2, handle, 0.5 * cm);
        } else if (how.knobs) {
          M.ball(hx, y + out + 1.2 * cm, hz, 1.4 * cm, 1.4 * cm, 1.4 * cm, handle, { seg: 5 });
        } else {                          // a bar across the drawer
          var bar = Math.min(16 * cm, (b - a) * 0.4);
          M.box(hx - bar / 2, hx + bar / 2, y + out, y + out + 2 * cm, hz - 0.6 * cm, hz + 0.6 * cm, handle, 0.5 * cm);
        }
      }
    }
  }
  // a pot, its earth, and what grows in it starts at the top
  function mPot(M, x, y, r, h, m, soil) {
    M.lathe(x, y, [[r * 0.72, 0], [r * 0.8, h * 0.08], [r * 0.95, h * 0.85], [r, h], [r * 0.9, h]], m, { seg: 18 });
    M.disc(x, y, h * 0.93, r * 0.9, r * 0.9, M.mat("soil", soil || "#4b3a2b"), 14);
    return h * 0.93;
  }
  // a clump of leaves: a few balls, lighter and darker
  function mLeaves(M, x, y, z, r, color, rnd, count) {
    count = count || 5;
    for (var i = 0; i < count; i++) {
      var a = rnd() * Math.PI * 2, d = r * (i ? 0.45 + rnd() * 0.25 : 0);
      var s = r * (i ? 0.55 + rnd() * 0.25 : 0.75), up = i ? (rnd() - 0.3) * r * 0.5 : 0;
      M.ball(x + Math.cos(a) * d, y + Math.sin(a) * d, z + up, s, s, s * 0.85, M.mat("leaves", mShade(color, (rnd() - 0.5) * 0.25)), { seg: 5 });
    }
  }
  // a color a little lighter (k > 0) or darker (k < 0)
  function mShade(color, k) {
    var c = String(color || "#888888"), m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c.length === 4 ? "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c);
    if (!m) { return c; }
    return "#" + [1, 2, 3].map(function (i) {
      var v = parseInt(m[i], 16);
      v = k >= 0 ? v + (255 - v) * k : v * (1 + k);
      return ("0" + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2);
    }).join("");
  }
  // a gooseneck tap, rising at x, y and curving over toward +y
  function mTap(M, x, y, z, reach, m) {
    var r = 1.1 * cm, up = reach * 1.1;
    M.cyl(x, y, z, z + 3 * cm, 2.4 * cm, m, { seg: 12 });
    var last = [x, y, z + 2 * cm];
    for (var i = 1; i <= 7; i++) {
      var a = i / 7 * Math.PI;
      var p = [x, y + reach / 2 - Math.cos(a) * reach / 2, z + 2 * cm + Math.sin(a) * up * 0.5 + (i < 4 ? up * 0.5 * i / 3.5 : up * 0.5)];
      if (i === 7) { p[2] = z + up * 0.55; }
      M.tube(last, p, r, m, 8);
      last = p;
    }
    M.cyl(x - 4 * cm, y, z, z + 5 * cm, 1 * cm, m, { seg: 8 });
  }
  // a chair: back to -y, its seat at seatZ, `kind` "wood", "pad" or "metal"
  function mChair(M, x, y, deg, w, d, C, kind) {
    var seatZ = 46 * cm, top = 90 * cm, frame = M.mat(kind === "metal" ? "metal" : "wood", C.frame);
    M.push().move(x, y, 0).turn(deg);
    var x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2, leg = 1.6 * cm;
    if (kind === "metal") {
      mLegs(M, x0, x1, y0, y1, 2 * cm, 0, seatZ - 2 * cm, 1.1 * cm, frame, true);
    } else {
      mLegs(M, x0, x1, y0, y1, 1.5 * cm, 0, seatZ - 3 * cm, leg, frame, false);
      M.box(x0 + 1.5 * cm, x1 - 1.5 * cm, y0 + 1 * cm, y0 + 2.6 * cm, seatZ - 12 * cm, seatZ - 5 * cm, frame);
    }
    M.box(x0, x1, y0, y1, seatZ - 3 * cm, seatZ, frame, 0.8 * cm);
    if (kind !== "metal") { M.box(x0 + 1 * cm, x1 - 1 * cm, y0 + 2 * cm, y1 - 1 * cm, seatZ, seatZ + 3.5 * cm, M.mat("fabric", C.main), 1.6 * cm); }
    // the back, leaning a little
    M.push().move(0, y0 + 1.5 * cm, seatZ).tiltX(8);
    [x0 + leg, x1 - leg].forEach(function (px) { M.box(px - leg, px + leg, -leg, leg, 0, top - seatZ, frame); });
    M.box(x0 + 0.5 * cm, x1 - 0.5 * cm, -1.6 * cm, 1.6 * cm, top - seatZ - 16 * cm, top - seatZ, kind === "pad" ? M.mat("fabric", C.main) : frame, 1.2 * cm);
    if (kind !== "metal") { M.box(x0 + leg, x1 - leg, -1 * cm, 1 * cm, (top - seatZ) * 0.3, (top - seatZ) * 0.3 + 4 * cm, frame, 0.5 * cm); }
    M.pop();
    M.pop();
  }
  // a row of books from x0 to x1 standing on z, their backs to y0
  function mBooks(M, x0, x1, y0, y1, z, hiMost, rnd, lean) {
    var x = x0, colors = ["#8c3b2f", "#2f4f6f", "#c9a24a", "#3d5c43", "#6a4c7a", "#d8d2c4", "#1f2a33", "#b5653a"];
    while (x < x1 - 1.6 * cm) {
      var w = (2 + rnd() * 2.4) * cm, h = Math.min(hiMost, (17 + rnd() * 11) * cm), d = Math.min(y1 - y0, (14 + rnd() * 8) * cm);
      if (x + w > x1) { break; }
      M.box(x, x + w, y0, y0 + d, z, z + h, M.mat("plastic", colors[Math.floor(rnd() * colors.length)]), 0.3 * cm);
      x += w + 0.15 * cm;
      if (rnd() < 0.12) { x += (4 + rnd() * 6) * cm; }   // a gap, now and then
    }
  }
  // a screen: a dark glass face in a thin frame, facing +y
  function mScreen(M, x0, x1, y0, y1, z0, z1, frameColor) {
    M.box(x0, x1, y0, y1, z0, z1, M.mat("plastic", frameColor || "#1b1d20"), 0.4 * cm);
    M.box(x0 + 0.8 * cm, x1 - 0.8 * cm, y1 - 0.1 * cm, y1 + 0.05 * cm, z0 + 0.8 * cm, z1 - 0.8 * cm, M.mat("screen", "#0c0e12"));
  }

  // ================================================================ to sit on ==
  // A sofa: its base on short legs, an arm each end, its back, and loose
  // cushions on the seat and against the back -- as many as its width holds.
  function mSofa(M, W, D, H, C, o) {
    o = o || {};
    C = mPick(C, o.main || "#8f949b", "#4b3627");
    var fab = M.mat(o.leather ? "leather" : "fabric", C.main), leg = M.mat("wood", C.frame);
    var legH = Math.min(9 * cm, H * 0.12), seatZ = Math.max(legH + 18 * cm, H * 0.55), armZ = Math.max(seatZ + 8 * cm, H * 0.78);
    var x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
    var arm = o.noArms ? 0 : Math.min(W * (o.armK || 0.11), 22 * cm), back = Math.min(D * 0.27, 24 * cm);
    mLegs(M, x0, x1, y0, y1, 4 * cm, 0, legH + 1, 1.7 * cm, leg, true, true);
    M.box(x0 + 1, x1 - 1, y0 + 2, y1 - 1, legH, seatZ - 11 * cm, fab, 2.5 * cm);
    if (arm) {
      M.box(x0, x0 + arm, y0, y1, legH, armZ, fab, Math.min(6 * cm, arm / 2.4));
      M.box(x1 - arm, x1, y0, y1, legH, armZ, fab, Math.min(6 * cm, arm / 2.4));
    }
    M.box(x0 + arm - 1, x1 - arm + 1, y0, y0 + back, legH, H, fab, 5 * cm);
    var inner = W - 2 * arm, seats = o.seats || Math.max(1, Math.min(4, Math.round(inner / (62 * cm)))), cw = inner / seats;
    for (var i = 0; i < seats; i++) {
      var a = x0 + arm + i * cw + 0.3 * cm, b = x0 + arm + (i + 1) * cw - 0.3 * cm;
      M.box(a, b, y0 + back - 2 * cm, y1 - 0.5 * cm, seatZ - 12 * cm, seatZ, fab, 4.5 * cm);
      M.push().move((a + b) / 2, y0 + back - 1 * cm, seatZ - 1).tiltX(10);
      M.box(-(b - a) / 2, (b - a) / 2, 0, Math.min(17 * cm, D * 0.3), 0, Math.max(10 * cm, H - seatZ - 2 * cm), fab, 5 * cm);
      M.pop();
    }
    if (o.pillows !== false && inner > 90 * cm) {     // a cushion thrown in each corner
      var pil = M.mat("fabric", C.accent || mShade(C.main, 0.35));
      [x0 + arm + 14 * cm, x1 - arm - 14 * cm].forEach(function (px, k) {
        M.push().move(px, y0 + back + 16 * cm, seatZ + 1 * cm).turn(k ? -10 : 10).tiltX(14);
        M.box(-19 * cm, 19 * cm, -6 * cm, 6 * cm, 0, 34 * cm, pil, 5.5 * cm);
        M.pop();
      });
    }
  }
  mDef("i_sofa", function (M, W, D, H, C) { mSofa(M, W, D, H, C); });
  mDef("i_loveseat", function (M, W, D, H, C) { mSofa(M, W, D, H, C, { seats: 2, main: "#a59a88" }); });
  mDef("i_armchair", function (M, W, D, H, C) { mSofa(M, W, D, H, C, { seats: 1, armK: 0.2, main: "#b49a7a", pillows: false }); });
  mDef("i_recliner", function (M, W, D, H, C) {
    C = mPick(C, "#6e4f3a", "#2c2c2c");
    var fab = M.mat("leather", C.main), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
    var arm = W * 0.18, back = D * 0.22, seatZ = 46 * cm, body = y0 + D * 0.74;
    M.box(x0 + arm, x1 - arm, y0, body, 6 * cm, seatZ - 12 * cm, fab, 3 * cm);
    M.box(x0, x0 + arm, y0, body, 2 * cm, 62 * cm, fab, 6 * cm);
    M.box(x1 - arm, x1, y0, body, 2 * cm, 62 * cm, fab, 6 * cm);
    M.box(x0 + arm, x1 - arm, y0 + back - 2 * cm, body, seatZ - 12 * cm, seatZ, fab, 5 * cm);
    M.push().move(0, y0 + back, seatZ - 4 * cm).tiltX(16);
    M.box(x0 + arm, x1 - arm, -back, 2 * cm, 0, H - seatZ + 12 * cm, fab, 6 * cm);
    M.box(x0 + arm + 3 * cm, x1 - arm - 3 * cm, -2 * cm, 6 * cm, H - seatZ - 10 * cm, H - seatZ + 8 * cm, fab, 4 * cm);
    M.pop();
    // the footrest, out
    M.push().move(0, body, seatZ - 8 * cm).tiltX(-14);
    M.box(x0 + arm + 1 * cm, x1 - arm - 1 * cm, 0, y1 - body, -9 * cm, 0, fab, 3.5 * cm);
    M.pop();
    M.box(x0 + arm + 6 * cm, x1 - arm - 6 * cm, body - 2 * cm, body + 5 * cm, 14 * cm, seatZ - 12 * cm, M.mat("metal", C.frame));
  });
  mDef("i_sectional", function (M, W, D, H, C) {
    C = mPick(C, "#8a8f96", "#3b2d22");
    var fab = M.mat("fabric", C.main), leg = M.mat("wood", C.frame), sx = W / 120, sy = D / 100;
    var x0 = -W / 2, y0 = -D / 2, legH = 8 * cm, seatZ = H * 0.55, back = 11 * sy;
    var runA = [x0, W / 2, y0, y0 + 42 * sy], runB = [x0, x0 + 42 * sx, y0, D / 2];
    [[x0 + 4 * cm, y0 + 4 * cm], [W / 2 - 4 * cm, y0 + 4 * cm], [W / 2 - 4 * cm, runA[3] - 4 * cm],
     [runB[1] - 4 * cm, D / 2 - 4 * cm], [x0 + 4 * cm, D / 2 - 4 * cm]].forEach(function (p) {
      M.cyl(p[0], p[1], 0, legH + 1, 1.3 * cm, leg, { r1: 1.8 * cm, seg: 10 });
    });
    M.box(runA[0], runA[1], runA[2], runA[3], legH, seatZ - 11 * cm, fab, 2.5 * cm);
    M.box(runB[0], runB[1], runA[3] - 4 * cm, runB[3], legH, seatZ - 11 * cm, fab, 2.5 * cm);
    M.box(x0, W / 2, y0, y0 + back, legH, H, fab, 5 * cm);                 // the back, along the top
    M.box(x0, x0 + back, y0, D / 2, legH, H, fab, 5 * cm);                 // and down the side
    M.box(W / 2 - 11 * sx, W / 2, y0, runA[3], legH, H * 0.78, fab, 5 * cm);   // an arm at each end
    M.box(x0, runB[1], D / 2 - 11 * sy, D / 2, legH, H * 0.78, fab, 5 * cm);
    var a0 = x0 + back, a1 = W / 2 - 11 * sx, n = Math.max(2, Math.round((a1 - a0) / (62 * cm))), cw = (a1 - a0) / n;
    for (var i = 0; i < n; i++) {
      M.box(a0 + i * cw + 0.3 * cm, a0 + (i + 1) * cw - 0.3 * cm, y0 + back - 1 * cm, runA[3], seatZ - 12 * cm, seatZ, fab, 4.5 * cm);
      M.box(a0 + i * cw + 0.3 * cm, a0 + (i + 1) * cw - 0.3 * cm, y0 + back - 1 * cm, y0 + back + 15 * cm, seatZ, H - 3 * cm, fab, 5 * cm);
    }
    M.box(x0 + back - 1 * cm, runB[1], runA[3], D / 2 - 11 * sy, seatZ - 12 * cm, seatZ, fab, 4.5 * cm);   // the chaise
    M.box(x0 + back - 1 * cm, x0 + back + 15 * cm, runA[3], D / 2 - 11 * sy, seatZ, H - 3 * cm, fab, 5 * cm);
  });
  mDef("i_ottoman", function (M, W, D, H, C) {
    C = mPick(C, "#9c8a73", "#3b2d22");
    var fab = M.mat("fabric", C.main);
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 3 * cm, 0, 7 * cm, 1.4 * cm, M.mat("wood", C.frame), true, true);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 6 * cm, H, fab, 6 * cm);
    [[-0.22, -0.22], [0.22, -0.22], [0.22, 0.22], [-0.22, 0.22], [0, 0]].forEach(function (p) {
      M.ball(p[0] * W, p[1] * D, H - 0.5 * cm, 1.2 * cm, 1.2 * cm, 0.8 * cm, M.mat("fabric", mShade(C.main, -0.25)), { seg: 4 });
    });
  });
  mDef("i_beanbag", function (M, W, D, H, C) {
    C = mPick(C, "#c06b4a");
    var R = W / 2;
    M.lathe(0, 0, [[0, 0], [R * 0.82, 0.5 * cm], [R, H * 0.3], [R * 0.93, H * 0.6], [R * 0.68, H * 0.86], [R * 0.32, H * 0.98],
                   [R * 0.1, H * 0.9], [0, H * 0.88]], M.mat("fabric", C.main), { seg: 22, ry: D / W });
  });
  mDef("i_chair", function (M, W, D, H, C) { mChair(M, 0, 0, 0, W, D, mPick(C, "#c9b8a0", "#7a5638"), "pad"); });
  mDef("i_stool", function (M, W, D, H, C) {
    C = mPick(C, "#2f3236", "#b98a5a");
    var R = Math.min(W, D) / 2, met = M.mat("metal", C.main);
    for (var i = 0; i < 4; i++) {
      var a = (i + 0.5) / 4 * Math.PI * 2;
      M.tube([Math.cos(a) * R * 0.45, Math.sin(a) * R * 0.45, H - 3 * cm], [Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.92, 0], 1 * cm, met, 8);
    }
    var ring = [], rz = H * 0.32, rr = R * 0.78;
    for (var k = 0; k <= 16; k++) { ring.push([Math.cos(k / 16 * Math.PI * 2) * rr, Math.sin(k / 16 * Math.PI * 2) * rr, rz]); }
    for (var j = 0; j < 16; j++) { M.tube(ring[j], ring[j + 1], 0.8 * cm, met, 6); }
    M.lathe(0, 0, [[R * 0.9, H - 4 * cm], [R, H - 2 * cm], [R * 0.97, H], [0, H + 0.6 * cm]], M.mat("wood", C.frame), { seg: 20 });
  });
  mDef("i_officechair", function (M, W, D, H, C) {
    C = mPick(C, "#2b2d31", "#8a8f96");
    var fab = M.mat("fabric", C.main), met = M.mat("chrome", C.frame), seatZ = 48 * cm, R = Math.min(W, D) / 2;
    for (var i = 0; i < 5; i++) {
      var a = i / 5 * Math.PI * 2 + 0.3;
      M.tube([0, 0, 8 * cm], [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95, 5 * cm], 1.4 * cm, M.mat("plastic", "#1d1f22"), 6);
      M.ball(Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95, 2.6 * cm, 2.6 * cm, 2.6 * cm, 2.6 * cm, M.mat("rubber", "#151515"), { seg: 5 });
    }
    M.cyl(0, 0, 6 * cm, seatZ - 8 * cm, 2.6 * cm, met, { seg: 12 });
    M.box(-W * 0.42, W * 0.42, -D * 0.36, D * 0.42, seatZ - 8 * cm, seatZ, fab, 4 * cm);
    M.push().move(0, -D * 0.36, seatZ + 2 * cm).tiltX(10);
    M.box(-2 * cm, 2 * cm, -3 * cm, 1 * cm, -10 * cm, 12 * cm, met);
    M.box(-W * 0.38, W * 0.38, -6 * cm, 1 * cm, 8 * cm, H - seatZ + 6 * cm, fab, 4 * cm);
    M.pop();
    [-1, 1].forEach(function (s) {
      M.box(s * W * 0.44 - 1.2 * cm, s * W * 0.44 + 1.2 * cm, -2 * cm, 2 * cm, seatZ - 4 * cm, seatZ + 18 * cm, M.mat("plastic", "#1d1f22"));
      M.box(s * W * 0.44 - 3 * cm, s * W * 0.44 + 3 * cm, -10 * cm, 10 * cm, seatZ + 18 * cm, seatZ + 21 * cm, M.mat("plastic", "#1d1f22"), 1.2 * cm);
    });
  });
  mDef("i_bench", function (M, W, D, H, C) {
    C = mPick(C, "#7f8a7c", "#8a6240");
    var wood = M.mat("wood", C.frame);
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 2.5 * cm, 0, H - 5 * cm, 2 * cm, wood, false);
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, -D / 2 + 2.5 * cm, D / 2 - 2.5 * cm, 9 * cm, 11 * cm, wood);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 6 * cm, H - 3 * cm, wood, 0.8 * cm);
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -D / 2 + 1 * cm, D / 2 - 1 * cm, H - 3 * cm, H + 3 * cm, M.mat("fabric", C.main), 2.5 * cm);
  });
  mDef("i_gardenbench", function (M, W, D, H, C) {
    C = mPick(C, "#9a7550", "#2f3236");
    var wood = M.mat("wood", C.main), iron = M.mat("metal", C.frame), y0 = -D / 2, y1 = D / 2;
    [-W / 2 + 4 * cm, W / 2 - 4 * cm].forEach(function (x) {
      M.box(x - 2 * cm, x + 2 * cm, y1 - 6 * cm, y1 - 2 * cm, 0, H, iron);                 // front leg
      M.box(x - 2 * cm, x + 2 * cm, y0, y0 + 4 * cm, 0, H + 40 * cm, iron);                // back leg, up to the top
      M.box(x - 2 * cm, x + 2 * cm, y0, y1 - 2 * cm, H - 4 * cm, H - 1 * cm, iron);        // the seat's frame
      M.box(x - 2 * cm, x + 2 * cm, y0 + 2 * cm, y1 - 2 * cm, H + 18 * cm, H + 21 * cm, iron); // the arm
    });
    for (var i = 0; i < 4; i++) {
      var a = y0 + 2 * cm + i * (D - 6 * cm) / 4;
      M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, a, a + (D - 6 * cm) / 4 - 1 * cm, H - 1 * cm, H + 1.5 * cm, wood, 0.6 * cm);
    }
    for (var j = 0; j < 3; j++) {
      M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y0 + 0.5 * cm, y0 + 3 * cm, H + 8 * cm + j * 11 * cm, H + 16 * cm + j * 11 * cm, wood, 0.6 * cm);
    }
  });
  // ================================================================== tables ==
  // A table's top, and under it legs -- four, or one in the middle for a
  // round one -- with the chairs round it the plan draws.
  function mTableTop(M, x0, x1, y0, y1, z, thick, m, r) { M.box(x0, x1, y0, y1, z - thick, z, m, r === undefined ? 0.8 * cm : r); }
  mDef("i_dining", function (M, W, D, H, C) {
    C = mPick(C, "#c9b8a0", "#8a6240");
    var wood = M.mat("wood", C.frame), sx = W / 100, sy = D / 80;
    var tx0 = -W / 2 + 9 * sx, tx1 = W / 2 - 9 * sx, ty0 = -D / 2 + 9 * sy, ty1 = D / 2 - 9 * sy;
    mTableTop(M, tx0, tx1, ty0, ty1, H, 3.5 * cm, wood);
    M.box(tx0 + 4 * cm, tx1 - 4 * cm, ty0 + 4 * cm, ty1 - 4 * cm, H - 12 * cm, H - 3.5 * cm, wood);
    mLegs(M, tx0, tx1, ty0, ty1, 4 * cm, 0, H - 3.5 * cm, 2.6 * cm, wood, false);
    var cw = 20 * sx, cd = Math.max(cw * 0.95, 14 * sy);
    // the chairs the plan draws: two along each long side, one at each end
    [[-23 * sx, -D / 2 + cd / 2, 0], [23 * sx, -D / 2 + cd / 2, 0], [-23 * sx, D / 2 - cd / 2, 180], [23 * sx, D / 2 - cd / 2, 180],
     [-W / 2 + cd / 2, 0, -90], [W / 2 - cd / 2, 0, 90]].forEach(function (c) {
      mChair(M, c[0], c[1], c[2], cw, cd, C, "pad");
    });
  });
  mDef("i_roundtable", function (M, W, D, H, C) {
    C = mPick(C, "#c9b8a0", "#9a7550");
    var wood = M.mat("wood", C.frame), R = 29 / 80 * Math.min(W, D), cw = 20 / 80 * W, cd = Math.max(cw * 0.95, 14 / 80 * D);
    M.lathe(0, 0, [[R - 0.6 * cm, H - 3.5 * cm], [R, H - 2.6 * cm], [R, H - 0.6 * cm], [R - 0.6 * cm, H], [0, H]], wood, { seg: 28 });
    M.lathe(0, 0, [[R * 0.5, 0], [R * 0.45, 2.5 * cm], [5 * cm, 6 * cm], [4 * cm, H * 0.6], [6 * cm, H - 5 * cm], [R * 0.3, H - 3.5 * cm]],
            wood, { seg: 18 });
    [[0, -D / 2 + cd / 2, 0], [0, D / 2 - cd / 2, 180], [-W / 2 + cd / 2, 0, -90], [W / 2 - cd / 2, 0, 90]].forEach(function (c) {
      mChair(M, c[0], c[1], c[2], cw, cd, C, "pad");
    });
  });
  mDef("i_patio", function (M, W, D, H, C) {
    C = mPick(C, "#e9e4d8", "#3a3d40");
    var met = M.mat("metal", C.frame), R = 24 / 80 * Math.min(W, D), cw = 20 / 80 * W, cd = Math.max(cw * 0.95, 14 / 80 * D);
    M.cyl(0, 0, H - 1.5 * cm, H, R, M.mat("glass", "#cfe0e6"), { seg: 24 });
    M.lathe(0, 0, [[R, H - 1.6 * cm], [R, H - 0.2 * cm]], met, { seg: 24 });
    M.lathe(0, 0, [[R * 0.6, 0], [R * 0.55, 1.5 * cm], [2 * cm, 4 * cm], [1.6 * cm, H - 2 * cm]], met, { seg: 14 });
    // a parasol through its middle, open
    var top = 2.3 * FLOOR_PX, span = 34 / 80 * Math.min(W, D) * 1.15;
    M.cyl(0, 0, H, top + 6 * cm, 1.4 * cm, met, { seg: 8 });
    M.lathe(0, 0, [[span, top - 26 * cm], [span * 0.55, top - 10 * cm], [0, top + 4 * cm]], M.mat("fabric", C.main), { seg: 8 });
    [[0, -D / 2 + cd / 2, 0], [0, D / 2 - cd / 2, 180], [-W / 2 + cd / 2, 0, -90], [W / 2 - cd / 2, 0, 90]].forEach(function (c) {
      mChair(M, c[0], c[1], c[2], cw, cd, C, "metal");
    });
  });
  mDef("i_coffee", function (M, W, D, H, C) {
    C = mPick(C, "#2f3236", "#a87c52");
    var wood = M.mat("wood", C.frame), met = M.mat("metal", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 4 * cm, H, wood, 1.4 * cm);
    M.box(-W / 2 + 4 * cm, W / 2 - 4 * cm, -D / 2 + 4 * cm, D / 2 - 4 * cm, 12 * cm, 14 * cm, wood, 0.6 * cm);
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 3 * cm, 0, H - 4 * cm, 1.2 * cm, met, false);
    if (W > 60 * cm) {                    // a book and a bowl on it
      M.box(-W * 0.3, -W * 0.3 + 22 * cm, -D * 0.2, -D * 0.2 + 16 * cm, H, H + 2.5 * cm, M.mat("plastic", "#2f4f6f"), 0.3 * cm);
      M.lathe(W * 0.22, D * 0.05, [[3 * cm, H], [7 * cm, H + 4 * cm], [6.6 * cm, H + 4 * cm], [0, H + 1 * cm]], M.mat("ceramic", "#e8e2d6"), { seg: 16 });
    }
  });
  mDef("i_sidetable", function (M, W, D, H, C) {
    C = mPick(C, "#a87c52", "#2f3236");
    var R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[R - 0.5 * cm, H - 2.5 * cm], [R, H - 2 * cm], [R, H - 0.4 * cm], [0, H]], M.mat("wood", C.main), { seg: 24 });
    M.cyl(0, 0, 0, H - 2.5 * cm, 1.6 * cm, M.mat("metal", C.frame), { seg: 10 });
    M.cyl(0, 0, 0, 1.5 * cm, R * 0.6, M.mat("metal", C.frame), { seg: 20 });
  });
  mDef("i_desk", function (M, W, D, H, C) {
    C = mPick(C, "#e9e6df", "#a87c52");
    var top = M.mat("wood", C.frame), body = M.mat("plastic", C.main), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
    M.box(x0, x1, y0, y1, H - 3 * cm, H, top, 0.6 * cm);
    var ped = Math.min(42 * cm, W * 0.32);
    M.box(x1 - ped, x1 - 1 * cm, y0 + 2 * cm, y1 - 3 * cm, 0, H - 3 * cm, body);
    mFronts(M, x1 - ped, x1 - 1 * cm, y1 - 3 * cm, 4 * cm, H - 4 * cm, 3, 1, body, M.mat("metal", "#9ea3a8"));
    M.box(x0 + 2 * cm, x0 + 4.5 * cm, y0 + 2 * cm, y1 - 3 * cm, 0, H - 3 * cm, body);
    M.box(x0 + 4.5 * cm, x1 - ped, y0 + 2 * cm, y0 + 3.5 * cm, H * 0.35, H - 3 * cm, body);
    // what the plan shows on it: a screen at the back, a keyboard and a mouse
    var sw = Math.min(W * 0.36, 60 * cm), sx = (24 + 11) / 70 * W - W / 2;
    M.box(sx - 9 * cm, sx + 9 * cm, y0 + 4 * cm, y0 + 16 * cm, H, H + 1 * cm, M.mat("metal", "#2b2d31"), 0.4 * cm);
    M.box(sx - 2 * cm, sx + 2 * cm, y0 + 8 * cm, y0 + 10 * cm, H, H + 12 * cm, M.mat("metal", "#2b2d31"));
    mScreen(M, sx - sw / 2, sx + sw / 2, y0 + 9 * cm, y0 + 11.5 * cm, H + 10 * cm, H + 10 * cm + sw * 0.58);
    M.box(sx - 21 * cm, sx + 21 * cm, -D * 0.02, D * 0.12, H, H + 1.6 * cm, M.mat("plastic", "#2b2d31"), 0.5 * cm);
    M.ball(sx + 30 * cm, D * 0.07, H + 1 * cm, 3 * cm, 5 * cm, 1.8 * cm, M.mat("plastic", "#2b2d31"), { seg: 6, lat0: 0 });
  });
  mDef("i_vanitytable", function (M, W, D, H, C) {
    C = mPick(C, "#f1eee8", "#c8a35a");
    var body = M.mat("plastic", C.main), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
    M.box(x0, x1, y0, y1, H - 3 * cm, H, M.mat("wood", C.main), 0.6 * cm);
    M.box(x0 + 1 * cm, x1 - 1 * cm, y0 + 1 * cm, y1 - 2 * cm, H - 15 * cm, H - 3 * cm, body);
    mFronts(M, x0 + 1 * cm, x1 - 1 * cm, y1 - 2 * cm, H - 14 * cm, H - 3.5 * cm, 1, 2, body, M.mat("metal", C.frame), { knobs: true });
    mLegs(M, x0, x1, y0, y1, 2.5 * cm, 0, H - 15 * cm, 1.6 * cm, M.mat("wood", C.main), true, true);
    // the oval mirror standing at the back
    M.push().move(0, y0 + 4 * cm, H + 2 * cm + W * 0.3).tiltX(-90);
    M.lathe(0, 0, [[W * 0.24, -1 * cm], [W * 0.24, 1 * cm]], M.mat("metal", C.frame), { seg: 28, ry: 1.25, top: true, topMat: M.mat("chrome", "#dfe6ea") });
    M.pop();
    M.box(-1 * cm, 1 * cm, y0 + 3 * cm, y0 + 5 * cm, H, H + 6 * cm, M.mat("metal", C.frame));
  });
  // ================================================================= storage ==
  // A carcass on a plinth with its fronts: drawers, doors, shelves.
  function mCarcass(M, x0, x1, y0, y1, z0, z1, m, plinth) {
    if (plinth) {
      M.box(x0 + 1 * cm, x1 - 1 * cm, y0, y1 - 4 * cm, z0, z0 + plinth, M.mat("plastic", "#2a2b2d"));
      z0 += plinth;
    }
    M.box(x0, x1, y0, y1, z0, z1, m, 0.3 * cm);
    return z0;
  }
  mDef("i_nightstand", function (M, W, D, H, C) {
    C = mPick(C, "#b9895a", "#c8a35a");
    var wood = M.mat("wood", C.main), y1 = D / 2 - 1.5 * cm;
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 2 * cm, 0, 10 * cm, 1.2 * cm, wood, true, true);
    M.box(-W / 2, W / 2, -D / 2, y1, 10 * cm, H, wood, 0.5 * cm);
    mFronts(M, -W / 2 + 1 * cm, W / 2 - 1 * cm, y1, 12 * cm, H - 2 * cm, 2, 1, wood, M.mat("metal", C.frame), { knobs: true });
  });
  mDef("i_dresser", function (M, W, D, H, C) {
    C = mPick(C, "#f0ede6", "#a7adb3");
    var body = M.mat("wood", C.main), y1 = D / 2 - 1.5 * cm;
    var z = mCarcass(M, -W / 2, W / 2, -D / 2, y1, 0, H - 2 * cm, body, 8 * cm);
    M.box(-W / 2 - 1 * cm, W / 2 + 1 * cm, -D / 2, D / 2, H - 2.5 * cm, H, M.mat("wood", mShade(C.main, -0.08)), 0.6 * cm);
    mFronts(M, -W / 2 + 1 * cm, W / 2 - 1 * cm, y1, z + 1 * cm, H - 3 * cm, 3, W > 70 * cm ? 2 : 1, body, M.mat("metal", C.frame));
  });
  mDef("i_chest", function (M, W, D, H, C) {
    C = mPick(C, "#9a6b44", "#3a3d40");
    var wood = M.mat("wood", C.main), iron = M.mat("metal", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.72, wood, 0.8 * cm);
    M.push().move(0, 0, H * 0.72);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.28, wood, Math.min(D / 2.4, H * 0.27));
    M.pop();
    [-0.32, 0.32].forEach(function (k) {
      M.box(k * W - 1.5 * cm, k * W + 1.5 * cm, -D / 2 - 0.3 * cm, D / 2 + 0.3 * cm, 0, H * 0.72, iron);
    });
    M.box(-3 * cm, 3 * cm, D / 2, D / 2 + 1 * cm, H * 0.62, H * 0.78, iron, 0.3 * cm);
  });
  mDef("i_filing", function (M, W, D, H, C) {
    C = mPick(C, "#8e959c", "#cfd3d8");
    var met = M.mat("metal", C.main), y1 = D / 2 - 1 * cm;
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, met, 0.6 * cm);
    mFronts(M, -W / 2 + 1 * cm, W / 2 - 1 * cm, y1, 2 * cm, H - 2 * cm, 4, 1, met, M.mat("chrome", C.frame));
  });
  // tall, with doors: a wardrobe, a pantry, a closet
  function mTall(M, W, D, H, C, o) {
    o = o || {};
    var body = M.mat(o.paint ? "plastic" : "wood", C.main), y1 = D / 2 - 2 * cm;
    var z = mCarcass(M, -W / 2, W / 2, -D / 2, y1, 0, H - 4 * cm, body, 7 * cm);
    M.box(-W / 2 - 1.5 * cm, W / 2 + 1.5 * cm, -D / 2, D / 2 + 0.5 * cm, H - 4 * cm, H, M.mat(o.paint ? "plastic" : "wood", mShade(C.main, -0.06)), 0.8 * cm);
    mFronts(M, -W / 2 + 1 * cm, W / 2 - 1 * cm, y1, z + 0.5 * cm, H - 4.5 * cm, o.rows || 1, o.doors || 2, body, M.mat("metal", C.frame),
            { doors: true, low: false });
  }
  mDef("i_wardrobe", function (M, W, D, H, C) { mTall(M, W, D, H, mPick(C, "#d8c3a0", "#2f3236")); });
  mDef("i_pantry", function (M, W, D, H, C) { mTall(M, W, D, H, mPick(C, "#f2f0ea", "#a7adb3"), { paint: true, rows: 2 }); });
  mDef("i_reachin", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#c9ced3");
    var body = M.mat("plastic", C.main), y0 = -D / 2, y1 = D / 2, rnd = mRand(W * 7 + D);
    M.box(-W / 2, -W / 2 + 2 * cm, y0, y1, 0, H, body);
    M.box(W / 2 - 2 * cm, W / 2, y0, y1, 0, H, body);
    M.box(-W / 2, W / 2, y0, y0 + 1.5 * cm, 0, H, body);
    M.box(-W / 2, W / 2, y0, y1, H - 3 * cm, H, body);
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y0 + 1.5 * cm, y1 - 6 * cm, H - 32 * cm, H - 30 * cm, body);   // a shelf at the top
    M.tube([-W / 2 + 2 * cm, y0 + D * 0.38, H - 40 * cm], [W / 2 - 2 * cm, y0 + D * 0.38, H - 40 * cm], 1.2 * cm, M.mat("chrome", C.frame), 10);
    for (var x = -W / 2 + 8 * cm; x < W / 2 - 8 * cm; x += (5 + rnd() * 4) * cm) {
      var long = (70 + rnd() * 50) * cm;
      M.box(x - 1.2 * cm, x + 1.2 * cm, y0 + D * 0.38 - 22 * cm, y0 + D * 0.38 + 22 * cm, H - 42 * cm - long, H - 42 * cm,
            M.mat("fabric", ["#2f4f6f", "#d8d2c4", "#8c3b2f", "#3d5c43", "#1f2a33", "#b5653a"][Math.floor(rnd() * 6)]), 1 * cm);
    }
    // the two sliding doors across the front, one drawn a little open
    M.box(-W / 2 + 2 * cm, 4 * cm, y1 - 5 * cm, y1 - 3.5 * cm, 2 * cm, H - 3 * cm, M.mat("chrome", "#dfe6ea"), 0.3 * cm);
    M.box(W * 0.12, W / 2 - 2 * cm, y1 - 2.5 * cm, y1 - 1 * cm, 2 * cm, H - 3 * cm, body, 0.3 * cm);
  });
  mDef("i_bookcase", function (M, W, D, H, C) {
    C = mPick(C, "#c29a6b");
    var wood = M.mat("wood", C.main), rnd = mRand(Math.round(W * 13 + H)), y0 = -D / 2, y1 = D / 2, t = 1.8 * cm;
    M.box(-W / 2, -W / 2 + t, y0, y1, 0, H, wood);
    M.box(W / 2 - t, W / 2, y0, y1, 0, H, wood);
    M.box(-W / 2, W / 2, y0, y0 + 0.8 * cm, 0, H, M.mat("wood", mShade(C.main, -0.15)));
    var shelves = Math.max(2, Math.round(H / (36 * cm))), gap = (H - t) / shelves;
    for (var i = 0; i <= shelves; i++) {
      var z = i * gap;
      M.box(-W / 2 + t, W / 2 - t, y0, y1, z, z + t, wood);
      if (i < shelves) { mBooks(M, -W / 2 + t + 1 * cm, W / 2 - t - 1 * cm, y0 + 1 * cm, y1 - 1 * cm, z + t, gap - 4 * cm, rnd); }
    }
  });
  mDef("i_cubeshelf", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#b49a7a");
    var body = M.mat("plastic", C.main), t = 1.6 * cm, cols = Math.max(1, Math.round(W / (38 * cm))), rows = Math.max(1, Math.round(H / (38 * cm)));
    for (var c = 0; c <= cols; c++) { var x = -W / 2 + c * (W - t) / cols; M.box(x, x + t, -D / 2, D / 2, 0, H, body); }
    for (var r = 0; r <= rows; r++) { var z = r * (H - t) / rows; M.box(-W / 2, W / 2, -D / 2, D / 2, z, z + t, body); }
    var rnd = mRand(W * 3 + H);
    for (var cc = 0; cc < cols; cc++) {
      for (var rr = 0; rr < rows; rr++) {
        if (rnd() < 0.45) { continue; }
        var a = -W / 2 + cc * (W - t) / cols + t + 1 * cm, b = -W / 2 + (cc + 1) * (W - t) / cols - 1 * cm, z0 = rr * (H - t) / rows + t;
        M.box(a, b, -D / 2 + 2 * cm, D / 2 - 0.5 * cm, z0, z0 + (H - t) / rows - 4 * cm, M.mat("wicker", C.frame), 1.5 * cm);
      }
    }
  });
  mDef("i_cornershelf", function (M, W, D, H, C) {
    C = mPick(C, "#c29a6b");
    var wood = M.mat("wood", C.main), x0 = -W / 2, y0 = -D / 2, levels = Math.max(3, Math.round(H / (32 * cm)));
    M.box(x0, x0 + 1.6 * cm, y0, D / 2, 0, H, wood);
    M.box(x0, W / 2, y0, y0 + 1.6 * cm, 0, H, wood);
    for (var i = 0; i < levels; i++) {
      var z = i * (H - 2 * cm) / (levels - 1);
      M.push().move(x0, y0, 0);
      M.lathe(0, 0, [[W, z], [W, z + 1.8 * cm]], wood, { seg: 10, from: 0, to: 90, top: false });
      for (var k = 0; k < 8; k++) {
        var a0 = k / 8 * Math.PI / 2, a1 = (k + 1) / 8 * Math.PI / 2;
        M.tri(wood, [0, 0, z + 1.8 * cm], [Math.cos(a0) * W, Math.sin(a0) * D, z + 1.8 * cm], [Math.cos(a1) * W, Math.sin(a1) * D, z + 1.8 * cm],
              [0, 0, 1], [0, 0, 1], [0, 0, 1]);
      }
      M.pop();
    }
  });
  mDef("i_shoerack", function (M, W, D, H, C) {
    C = mPick(C, "#a87c52", "#2f3236");
    var wood = M.mat("wood", C.main), rnd = mRand(W + D * 5);
    [-W / 2, W / 2 - 1.8 * cm].forEach(function (x) { M.box(x, x + 1.8 * cm, -D / 2, D / 2, 0, H, wood); });
    [H * 0.15, H * 0.92].forEach(function (z) {
      for (var s = 0; s < 3; s++) {
        var a = -D / 2 + s * D / 3 + 0.5 * cm;
        M.box(-W / 2 + 1.8 * cm, W / 2 - 1.8 * cm, a, a + D / 3 - 1.5 * cm, z - 1.4 * cm, z, wood, 0.3 * cm);
      }
    });
    var shoes = ["#1f2a33", "#8c3b2f", "#d8d2c4", "#6b4a33"];
    for (var x = -W / 2 + 7 * cm; x < W / 2 - 7 * cm; x += 14 * cm) {
      var col = M.mat("leather", shoes[Math.floor(rnd() * shoes.length)]);
      [-2.6, 2.6].forEach(function (dx) {
        M.box(x + dx * cm - 2.3 * cm, x + dx * cm + 2.3 * cm, -D / 2 + 2 * cm, D / 2 - 2 * cm, H * 0.15, H * 0.15 + 8 * cm, col, 2 * cm);
      });
    }
  });
  mDef("i_tvstand", function (M, W, D, H, C) {
    C = mPick(C, "#3a3a3c", "#a87c52");
    var body = M.mat("wood", C.frame), y1 = D / 2 - 1.5 * cm, x0 = -W / 2, x1 = W / 2;
    mLegs(M, x0, x1, -D / 2, D / 2, 3 * cm, 0, 9 * cm, 1.3 * cm, M.mat("metal", C.main), true, true);
    M.box(x0, x1, -D / 2, y1, 9 * cm, H, body, 0.6 * cm);
    var third = W / 3;
    mFronts(M, x0 + 1 * cm, x0 + third, y1, 10 * cm, H - 1 * cm, 1, 1, body, M.mat("metal", C.main), { doors: true });
    mFronts(M, x1 - third, x1 - 1 * cm, y1, 10 * cm, H - 1 * cm, 1, 1, body, M.mat("metal", C.main), { doors: true });
    M.box(x0 + third + 1 * cm, x1 - third - 1 * cm, y1 - 0.5 * cm, y1 + 0.1 * cm, 11 * cm, H - 2 * cm, M.mat("plastic", "#1a1b1d"));
  });
  mDef("i_closetrod", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#c9ced3");
    var rnd = mRand(Math.round(W * 11 + D)), rail = M.mat("chrome", C.frame), post = M.mat("plastic", C.main);
    M.box(-W / 2, -W / 2 + 2 * cm, -2 * cm, 2 * cm, 0, H, post);
    M.box(W / 2 - 2 * cm, W / 2, -2 * cm, 2 * cm, 0, H, post);
    M.tube([-W / 2 + 2 * cm, 0, H - 5 * cm], [W / 2 - 2 * cm, 0, H - 5 * cm], 1.2 * cm, rail, 10);
    var cols = ["#2f4f6f", "#d8d2c4", "#8c3b2f", "#3d5c43", "#1f2a33", "#b5653a", "#e3c3a0", "#5d6d7e"];
    for (var x = -W / 2 + 7 * cm; x < W / 2 - 6 * cm; x += (5 + rnd() * 3) * cm) {
      var long = Math.min(H - 12 * cm, (60 + rnd() * 55) * cm), wide = Math.min(D / 2 - 2 * cm, 24 * cm);
      M.tube([x, -wide * 0.9, H - 10 * cm], [x, 0, H - 6 * cm], 0.35 * cm, rail, 4);     // the hanger
      M.tube([x, wide * 0.9, H - 10 * cm], [x, 0, H - 6 * cm], 0.35 * cm, rail, 4);
      M.box(x - 1.2 * cm, x + 1.2 * cm, -wide, wide, H - 10 * cm - long, H - 9 * cm,
            M.mat("fabric", cols[Math.floor(rnd() * cols.length)]), 1.1 * cm);
    }
  });
  mDef("i_closetshelves", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea");
    var board = M.mat("plastic", C.main), rnd = mRand(Math.round(W * 5 + H));
    M.box(-W / 2, -W / 2 + 1.6 * cm, -D / 2, D / 2, 0, H, board);
    M.box(W / 2 - 1.6 * cm, W / 2, -D / 2, D / 2, 0, H, board);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 1 * cm, 0, H, board);
    var cols = ["#2f4f6f", "#d8d2c4", "#8c3b2f", "#3d5c43", "#e3c3a0", "#5d6d7e"];
    for (var z = 0; z < H - 2 * cm; z += 40 * cm) {
      M.box(-W / 2 + 1.6 * cm, W / 2 - 1.6 * cm, -D / 2 + 1 * cm, D / 2, z, z + 1.6 * cm, board);
      if (z + 30 * cm > H) { continue; }
      [-0.24, 0.24].forEach(function (k) {
        var pile = 2 + Math.floor(rnd() * 4), zz = z + 1.6 * cm;
        for (var p = 0; p < pile; p++) {
          var h = (3.5 + rnd() * 2) * cm, wob = (rnd() - 0.5) * 1.5 * cm;
          M.box(k * W - W * 0.16 + wob, k * W + W * 0.16 + wob, -D / 2 + 4 * cm, D / 2 - 4 * cm, zz, zz + h,
                M.mat("fabric", cols[Math.floor(rnd() * cols.length)]), 1.2 * cm);
          zz += h;
        }
      });
    }
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 1.6 * cm, H, board);
  });
  mDef("i_coatrack", function (M, W, D, H, C) {
    C = mPick(C, "#6e4a32");
    var wood = M.mat("wood", C.main), R = Math.min(W, D) / 2;
    for (var i = 0; i < 4; i++) {
      var a = (i + 0.5) / 4 * Math.PI * 2;
      M.tube([0, 0, 30 * cm], [Math.cos(a) * R, Math.sin(a) * R, 0], 1.2 * cm, wood, 8);
      M.push().move(0, 0, H - 14 * cm).turn(a * 180 / Math.PI);
      M.tube([0, 0, 0], [9 * cm, 0, 8 * cm], 0.9 * cm, wood, 6);
      M.ball(9 * cm, 0, 8 * cm, 1.4 * cm, 1.4 * cm, 1.4 * cm, wood, { seg: 4 });
      M.pop();
    }
    M.cyl(0, 0, 0, H, 1.8 * cm, wood, { r1: 1.5 * cm, seg: 10 });
    M.ball(0, 0, H, 2.2 * cm, 2.2 * cm, 2.2 * cm, wood, { seg: 5 });
    M.box(-12 * cm, 12 * cm, -3 * cm, 3 * cm, H - 75 * cm, H - 12 * cm, M.mat("fabric", "#3d4a5c"), 4 * cm);   // a coat
  });
  mDef("i_hamper", function (M, W, D, H, C) {
    C = mPick(C, "#c9ad7f");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 3 * cm, M.mat("wicker", C.main), 3 * cm);
    M.box(-W / 2 - 0.5 * cm, W / 2 + 0.5 * cm, -D / 2 - 0.5 * cm, D / 2 + 0.5 * cm, H - 4 * cm, H, M.mat("wicker", mShade(C.main, -0.12)), 2 * cm);
  });
  // ==================================================================== beds ==
  // A bed: its frame on legs, a headboard against the wall, the mattress,
  // a duvet over the foot of it folded back, and the pillows the plan draws.
  function mBed(M, W, D, H, C, o) {
    o = o || {};
    C = mPick(C, "#9aa9b8", "#8a6240");
    var frame = M.mat(o.padded ? "fabric" : "wood", o.padded ? mShade(C.frame, 0.25) : C.frame);
    var x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2, top = H, matT = Math.min(22 * cm, H * 0.42);
    var linen = M.mat("linen", "#f3f1ec"), duvet = M.mat("linen", C.main);
    mLegs(M, x0, x1, y0, y1, 3 * cm, 0, 12 * cm, 2.2 * cm, M.mat("wood", C.frame), false);
    M.box(x0, x1, y0 + 4 * cm, y1, 12 * cm, top - matT, frame, 1.2 * cm);
    // the headboard
    var head = top + Math.max(35 * cm, H * 0.75);
    M.box(x0 - 1 * cm, x1 + 1 * cm, y0, y0 + 6 * cm, 6 * cm, head, frame, o.padded ? 4 * cm : 1.4 * cm);
    M.box(x0 + 1.5 * cm, x1 - 1.5 * cm, y0 + 5 * cm, y1 - 1.5 * cm, top - matT, top, linen, 6 * cm);
    // the duvet, a little over the sides, its top folded back
    var fold = y0 + D * 0.38;
    M.box(x0 + 0.5 * cm, x1 - 0.5 * cm, fold, y1 - 0.5 * cm, top - matT * 0.55, top + 3 * cm, duvet, 4 * cm);
    M.box(x0 + 1 * cm, x1 - 1 * cm, fold - 7 * cm, fold + 2 * cm, top - 1 * cm, top + 5 * cm, M.mat("linen", "#f7f5f0"), 3 * cm);
    // the pillows, where the plan has them
    var pw = o.pillows === 1 ? W * 0.68 : (W - 18 * cm) / 2;
    (o.pillows === 1 ? [0] : [-(pw / 2 + 2 * cm), pw / 2 + 2 * cm]).forEach(function (px) {
      M.push().move(px, y0 + 50 * cm, top - 1.5 * cm).tiltX(-14);
      M.box(-pw / 2, pw / 2, -42 * cm, 0, 0, 15 * cm, linen, 6.5 * cm);
      M.pop();
    });
    if (W > 120 * cm) {                   // a throw across the foot
      M.box(x0 - 0.6 * cm, x1 + 0.6 * cm, y1 - 32 * cm, y1 - 8 * cm, top + 2 * cm, top + 4.5 * cm, M.mat("fabric", C.accent || "#7b8a74"), 1.2 * cm);
    }
  }
  mDef("i_bed", function (M, W, D, H, C) { mBed(M, W, D, H, C); });
  mDef("i_bedking", function (M, W, D, H, C) { mBed(M, W, D, H, C, { padded: true }); });
  mDef("i_bed1", function (M, W, D, H, C) { mBed(M, W, D, H, mPick(C, "#c9b17a", "#b98a5a"), { pillows: 1 }); });
  mDef("i_bunkbed", function (M, W, D, H, C) {
    C = mPick(C, "#6f8fae", "#d8c3a0");
    var wood = M.mat("wood", C.frame), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2, post = 2.6 * cm;
    [[x0, y0], [x1 - 2 * post, y0], [x1 - 2 * post, y1 - 2 * post], [x0, y1 - 2 * post]].forEach(function (p) {
      M.box(p[0], p[0] + 2 * post, p[1], p[1] + 2 * post, 0, H, wood, 0.5 * cm);
    });
    [20 * cm, H - 62 * cm].forEach(function (z, k) {
      M.box(x0, x1, y0, y1, z, z + 8 * cm, wood, 0.6 * cm);
      M.box(x0 + 2 * cm, x1 - 2 * cm, y0 + 2 * cm, y1 - 2 * cm, z + 8 * cm, z + 22 * cm, M.mat("linen", "#f3f1ec"), 4 * cm);
      M.box(x0 + 1.5 * cm, x1 - 1.5 * cm, y0 + D * 0.35, y1 - 1.5 * cm, z + 14 * cm, z + 24 * cm, M.mat("linen", k ? C.main : mShade(C.main, -0.2)), 3 * cm);
      M.box(-W * 0.3, W * 0.3, y0 + 4 * cm, y0 + 20 * cm, z + 22 * cm, z + 32 * cm, M.mat("linen", "#f7f5f0"), 4 * cm);
    });
    // the top bunk's rail, and the ladder up its side (+x, as drawn)
    M.box(x0, x1, y0, y0 + 2 * cm, H - 30 * cm, H - 24 * cm, wood);
    M.box(x0, x0 + 2 * cm, y0, y1 - D * 0.3, H - 30 * cm, H - 24 * cm, wood);
    var lx = x1 - 2 * cm;
    [y0 + D * 0.24, y1 - 2 * cm].forEach(function (ly) { M.box(lx - 2 * cm, lx + 2 * cm, ly - 2 * cm, ly, 0, H - 30 * cm, wood); });
    for (var r = 1; r < 5; r++) {
      M.tube([lx, y0 + D * 0.24 - 1 * cm, r * (H - 50 * cm) / 5], [lx, y1 - 3 * cm, r * (H - 50 * cm) / 5], 1.4 * cm, wood, 8);
    }
  });
  mDef("i_crib", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#cfe0ef");
    var wood = M.mat("plastic", C.main), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
    [[x0, y0], [x1 - 4 * cm, y0], [x1 - 4 * cm, y1 - 4 * cm], [x0, y1 - 4 * cm]].forEach(function (p) {
      M.box(p[0], p[0] + 4 * cm, p[1], p[1] + 4 * cm, 0, H, wood, 1 * cm);
    });
    M.box(x0 + 2 * cm, x1 - 2 * cm, y0 + 2 * cm, y1 - 2 * cm, 30 * cm, 34 * cm, wood);
    M.box(x0 + 3 * cm, x1 - 3 * cm, y0 + 3 * cm, y1 - 3 * cm, 34 * cm, 45 * cm, M.mat("linen", C.frame), 3 * cm);
    [y0 + 1 * cm, y1 - 3 * cm].forEach(function (y) {      // the ends
      M.box(x0 + 2 * cm, x1 - 2 * cm, y, y + 2 * cm, 30 * cm, H - 4 * cm, wood, 0.8 * cm);
    });
    [x0 + 1.5 * cm, x1 - 1.5 * cm].forEach(function (x) {  // the sides: a rail, and bars down to the base
      M.box(x - 1.5 * cm, x + 1.5 * cm, y0 + 2 * cm, y1 - 2 * cm, H - 5 * cm, H - 2 * cm, wood, 0.6 * cm);
      for (var y = y0 + 8 * cm; y < y1 - 6 * cm; y += 7 * cm) { M.cyl(x, y, 34 * cm, H - 5 * cm, 0.9 * cm, wood, { seg: 6 }); }
    });
  });
  mDef("i_dogbed", function (M, W, D, H, C) {
    C = mPick(C, "#8e7a66", "#e8e1d3");
    var R = W / 2;
    M.lathe(0, 0, [[R * 0.7, 0], [R * 0.98, 2 * cm], [R, H * 0.6], [R * 0.9, H], [R * 0.74, H * 0.85], [R * 0.7, H * 0.4], [0, H * 0.35]],
            M.mat("fabric", C.main), { seg: 22, ry: D / W });
    M.ball(0, 0, H * 0.35, R * 0.66, R * 0.66 * D / W, 4 * cm, M.mat("fabric", C.frame), { seg: 8, lat0: 0 });
  });
  mDef("i_cattree", function (M, W, D, H, C) {
    C = mPick(C, "#bfb3a2", "#d6c49a");
    var carpet = M.mat("fabric", C.main), rope = M.mat("wicker", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 4 * cm, carpet, 1.5 * cm);
    [[-W * 0.2, -D * 0.2, H * 0.55], [W * 0.2, D * 0.2, H - 4 * cm]].forEach(function (p) {
      M.cyl(p[0], p[1], 4 * cm, p[2], 4.5 * cm, rope, { seg: 12 });
      M.box(p[0] - W * 0.26, p[0] + W * 0.26, p[1] - D * 0.26, p[1] + D * 0.26, p[2], p[2] + 4 * cm, carpet, 1.5 * cm);
    });
    M.box(W * 0.02, W / 2 - 1 * cm, -D / 2 + 1 * cm, -D * 0.02, 4 * cm, H * 0.4, carpet, 2 * cm);   // a little house
    M.push().move(W * 0.26, -D * 0.02, H * 0.2).tiltX(-90);           // its round way in
    M.cyl(0, 0, 0, 0.3 * cm, 6.5 * cm, M.mat("rubber", "#2a2622"), { seg: 16 });
    M.pop();
  });
  // ================================================================= kitchen ==
  // Base cabinets: a recess at the foot to stand in, doors -- or a stack
  // of drawers at one end -- and a worktop over, a little proud.
  function mBase(M, W, D, H, C, o) {
    o = o || {};
    var body = M.mat("plastic", C.frame), top = M.mat("stone", C.main), y1 = D / 2 - 2.5 * cm;
    M.box(-W / 2 + 0.5 * cm, W / 2 - 0.5 * cm, -D / 2, y1 - 6 * cm, 0, 10 * cm, M.mat("plastic", "#2a2b2d"));
    M.box(-W / 2, W / 2, -D / 2, y1, 10 * cm, H - 4 * cm, body);
    var units = Math.max(1, Math.round(W / (60 * cm))), uw = W / units, handle = M.mat("chrome", "#c9ced3");
    for (var u = 0; u < units; u++) {
      var a = -W / 2 + u * uw, b = a + uw;
      if (o.drawers && u === units - 1) { mFronts(M, a, b, y1, 10.5 * cm, H - 4.5 * cm, 3, 1, body, handle); }
      else { mFronts(M, a, b, y1, 10.5 * cm, H - 4.5 * cm, 1, uw > 50 * cm ? 2 : 1, body, handle, { doors: true, high: true }); }
    }
    if (!o.noTop) { M.box(-W / 2 - 0.5 * cm, W / 2 + 0.5 * cm, -D / 2, D / 2, H - 4 * cm, H, top, 0.5 * cm); }
    return { top: top, body: body };
  }
  mDef("i_counter", function (M, W, D, H, C) {
    C = mPick(C, "#e9e6e1", "#f2f0ea");
    mBase(M, W, D, H, C, { drawers: true });
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 1.5 * cm, H, H + 12 * cm, M.mat("ceramic", "#f4f2ee"));   // a splashback
  });
  mDef("i_island", function (M, W, D, H, C) {
    C = mPick(C, "#e4e1dc", "#3e5a6e");
    var body = M.mat("plastic", C.frame), top = M.mat("stone", C.main), over = Math.min(25 * cm, D * 0.3);
    var y0 = -D / 2 + over, y1 = D / 2 - 2.5 * cm;
    M.box(-W / 2 + 4 * cm, W / 2 - 4 * cm, y0 + 2 * cm, y1 - 6 * cm, 0, 10 * cm, M.mat("plastic", "#2a2b2d"));
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, y0, y1, 10 * cm, H - 4 * cm, body);
    var units = Math.max(1, Math.round(W / (60 * cm))), uw = (W - 2 * cm) / units;
    for (var u = 0; u < units; u++) {
      var a = -W / 2 + 1 * cm + u * uw;
      mFronts(M, a, a + uw, y1, 10.5 * cm, H - 4.5 * cm, u % 2 ? 1 : 3, 1, body, M.mat("chrome", "#c9ced3"), u % 2 ? { doors: true, high: true } : null);
    }
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 4 * cm, H, top, 0.6 * cm);   // over the overhang, to sit at
  });
  mDef("i_kitchensink", function (M, W, D, H, C) {
    C = mPick(C, "#e9e6e1", "#f2f0ea");
    mBase(M, W, D, H, C, { noTop: true });
    var top = M.mat("stone", C.main), steel = M.mat("metal", "#8f959b"), y0 = -D / 2, y1 = D / 2;
    var bx = [[-W * 0.45, -W * 0.03], [W * 0.03, W * 0.45]], by = [y0 + D * 0.2, y1 - D * 0.13], deep = 18 * cm;
    // the worktop round the two bowls, and the bowls let into it
    M.box(-W / 2 - 0.5 * cm, W / 2 + 0.5 * cm, y0, by[0], H - 4 * cm, H, top, 0.4 * cm);
    M.box(-W / 2 - 0.5 * cm, W / 2 + 0.5 * cm, by[1], y1, H - 4 * cm, H, top, 0.4 * cm);
    M.box(-W / 2 - 0.5 * cm, bx[0][0], by[0], by[1], H - 4 * cm, H, top);
    M.box(bx[0][1], bx[1][0], by[0], by[1], H - 4 * cm, H, top);
    M.box(bx[1][1], W / 2 + 0.5 * cm, by[0], by[1], H - 4 * cm, H, top);
    bx.forEach(function (b) {
      M.box(b[0], b[1], by[0], by[1], H - deep, H - deep + 0.6 * cm, steel);
      M.quad(steel, [b[0], by[0], H - deep], [b[1], by[0], H - deep], [b[1], by[0], H], [b[0], by[0], H], [0, 1, 0]);
      M.quad(steel, [b[0], by[1], H - deep], [b[1], by[1], H - deep], [b[1], by[1], H], [b[0], by[1], H], [0, -1, 0]);
      M.quad(steel, [b[0], by[0], H - deep], [b[0], by[1], H - deep], [b[0], by[1], H], [b[0], by[0], H], [1, 0, 0]);
      M.quad(steel, [b[1], by[0], H - deep], [b[1], by[1], H - deep], [b[1], by[1], H], [b[1], by[0], H], [-1, 0, 0]);
      M.cyl((b[0] + b[1]) / 2, (by[0] + by[1]) / 2, H - deep + 0.6 * cm, H - deep + 0.8 * cm, 2 * cm, M.mat("chrome", "#9aa0a6"), { seg: 10 });
    });
    mTap(M, 0, y0 + D * 0.1, H, D * 0.42, M.mat("chrome", "#dfe3e8"));
  });
  mDef("i_stove", function (M, W, D, H, C) {
    C = mPick(C, "#c9cdd1", "#1b1c1e");
    var steel = M.mat("metal", C.main), glass = M.mat("screen", C.frame), y0 = -D / 2, y1 = D / 2 - 1 * cm;
    M.box(-W / 2, W / 2, y0, y1, 0, H - 2 * cm, steel, 0.6 * cm);
    M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, y1 - 0.2 * cm, y1 + 1 * cm, 14 * cm, H - 16 * cm, steel, 0.5 * cm);       // the oven's door
    M.box(-W / 2 + 7 * cm, W / 2 - 7 * cm, y1 + 0.9 * cm, y1 + 1.2 * cm, 22 * cm, H - 30 * cm, glass);               // and its window
    M.tube([-W / 2 + 6 * cm, y1 + 4 * cm, H - 20 * cm], [W / 2 - 6 * cm, y1 + 4 * cm, H - 20 * cm], 1 * cm, M.mat("chrome", "#dfe3e8"), 8);
    [-1, 1].forEach(function (s) {
      M.box(s * (W / 2 - 6 * cm) - 1 * cm, s * (W / 2 - 6 * cm) + 1 * cm, y1 + 0.5 * cm, y1 + 4 * cm, H - 21 * cm, H - 19 * cm, M.mat("chrome", "#dfe3e8"));
    });
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y1 - 0.2 * cm, y1 + 0.6 * cm, 3 * cm, 12 * cm, M.mat("plastic", "#2a2b2d"));   // the drawer under
    M.box(-W / 2, W / 2, y0, y1, H - 2 * cm, H, glass, 0.4 * cm);                                                         // the hob
    [[-0.25, -0.22, 9], [0.25, -0.22, 7], [-0.25, 0.22, 7], [0.25, 0.22, 9]].forEach(function (b) {
      M.cyl(b[0] * W, b[1] * D, H, H + 0.15 * cm, b[2] * cm, M.mat("metal", "#3a3c40"), { seg: 18 });
      M.cyl(b[0] * W, b[1] * D, H + 0.15 * cm, H + 0.25 * cm, b[2] * 0.6 * cm, glass, { seg: 18 });
    });
    for (var k = 0; k < 4; k++) {         // the knobs, along the front
      M.push().move(-W * 0.3 + k * W * 0.2, y1 + 0.5 * cm, H - 8 * cm).tiltX(-90);
      M.cyl(0, 0, 0, 2 * cm, 1.8 * cm, M.mat("chrome", "#dfe3e8"), { seg: 10 });
      M.pop();
    }
  });
  mDef("i_fridge", function (M, W, D, H, C) {
    C = mPick(C, "#c9cdd1", "#dfe3e8");
    var steel = M.mat("metal", C.main), y0 = -D / 2, y1 = D / 2 - 3 * cm, split = H * 0.36;
    M.box(-W / 2, W / 2, y0, y1, 0, H, steel, 1.2 * cm);
    M.box(-W / 2 + 0.3 * cm, -0.25 * cm, y1 - 0.3 * cm, y1 + 2.5 * cm, split + 0.6 * cm, H - 0.8 * cm, steel, 0.8 * cm);   // two doors over
    M.box(0.25 * cm, W / 2 - 0.3 * cm, y1 - 0.3 * cm, y1 + 2.5 * cm, split + 0.6 * cm, H - 0.8 * cm, steel, 0.8 * cm);
    M.box(-W / 2 + 0.3 * cm, W / 2 - 0.3 * cm, y1 - 0.3 * cm, y1 + 2.5 * cm, 3 * cm, split - 0.6 * cm, steel, 0.8 * cm);  // the freezer drawer
    var bar = M.mat("chrome", C.frame);
    [-1.6, 1.6].forEach(function (x) {
      M.tube([x * cm, y1 + 5 * cm, split + 16 * cm], [x * cm, y1 + 5 * cm, H - 30 * cm], 1 * cm, bar, 8);
      [split + 16 * cm, H - 30 * cm].forEach(function (z) { M.tube([x * cm, y1 + 2.4 * cm, z], [x * cm, y1 + 5 * cm, z], 0.8 * cm, bar, 6); });
    });
    M.tube([-W * 0.3, y1 + 5 * cm, split - 8 * cm], [W * 0.3, y1 + 5 * cm, split - 8 * cm], 1 * cm, bar, 8);
    M.box(W * 0.12, W * 0.32, y1 + 2.4 * cm, y1 + 2.7 * cm, H * 0.66, H * 0.78, M.mat("screen", "#16181b"));   // ice and water
  });
  mDef("i_dishwasher", function (M, W, D, H, C) {
    C = mPick(C, "#c9cdd1");
    var steel = M.mat("metal", C.main), y1 = D / 2 - 2 * cm;
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, steel, 0.4 * cm);
    M.box(-W / 2 + 0.4 * cm, W / 2 - 0.4 * cm, y1, y1 + 1.5 * cm, 9 * cm, H - 1 * cm, steel, 0.5 * cm);
    M.box(-W / 2 + 0.4 * cm, W / 2 - 0.4 * cm, y1 + 1.5 * cm, y1 + 1.7 * cm, H - 8 * cm, H - 2 * cm, M.mat("screen", "#16181b"));
    M.tube([-W * 0.36, y1 + 4 * cm, H - 12 * cm], [W * 0.36, y1 + 4 * cm, H - 12 * cm], 0.9 * cm, M.mat("chrome", "#dfe3e8"), 8);
    M.box(-W / 2, W / 2, y1 - 6 * cm, y1, 0, 9 * cm, M.mat("plastic", "#2a2b2d"));
  });
  mDef("i_microwave", function (M, W, D, H, C) {
    C = mPick(C, "#2a2c30", "#c9cdd1");
    var body = M.mat("metal", C.frame), y1 = D / 2 - 1 * cm;
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, body, 1 * cm);
    M.box(-W / 2 + 1 * cm, W * 0.22, y1 - 0.2 * cm, y1 + 0.8 * cm, 1 * cm, H - 1 * cm, M.mat("plastic", C.main), 0.5 * cm);
    M.box(-W / 2 + 3 * cm, W * 0.16, y1 + 0.7 * cm, y1 + 0.9 * cm, 3 * cm, H - 3 * cm, M.mat("screen", "#0d0f12"));
    M.box(W * 0.25, W / 2 - 1 * cm, y1 - 0.2 * cm, y1 + 0.5 * cm, 1 * cm, H - 1 * cm, M.mat("plastic", "#1d1f22"));
    M.box(W * 0.28, W / 2 - 3 * cm, y1 + 0.5 * cm, y1 + 0.6 * cm, H - 7 * cm, H - 4 * cm, M.mat("glow", "#7fd7a8"));
  });
  mDef("i_coffeemaker", function (M, W, D, H, C) {
    C = mPick(C, "#232427", "#c9cdd1");
    var body = M.mat("plastic", C.main);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + D * 0.42, 0, H, body, 1.5 * cm);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, 2.5 * cm, body, 1 * cm);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 6 * cm, H, body, 1.5 * cm);
    M.lathe(0, D * 0.15, [[3.5 * cm, 2.5 * cm], [4.6 * cm, 6 * cm], [4.4 * cm, 12 * cm], [3.6 * cm, 15 * cm]], M.mat("glass", "#a8c7d8"), { seg: 14 });
    M.cyl(0, D * 0.15, 2.5 * cm, 7 * cm, 4.3 * cm, M.mat("screen", "#2b1a10"), { seg: 14 });
    M.box(-W / 2 + 1 * cm, -W / 2 + 4 * cm, D / 2 - 0.2 * cm, D / 2 + 0.2 * cm, H - 4 * cm, H - 2 * cm, M.mat("glow", "#e45b3c"));
  });
  mDef("i_toaster", function (M, W, D, H, C) {
    C = mPick(C, "#dfe3e8");
    var body = M.mat("chrome", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, body, Math.min(D / 3, 5 * cm));
    [-D * 0.18, D * 0.18].forEach(function (y) { M.box(-W * 0.36, W * 0.36, y - 0.9 * cm, y + 0.9 * cm, H - 0.6 * cm, H + 0.05 * cm, M.mat("screen", "#111214")); });
    M.box(W / 2, W / 2 + 1.5 * cm, -1 * cm, 1 * cm, H * 0.55, H * 0.7, M.mat("plastic", "#1d1f22"), 0.3 * cm);
  });
  mDef("i_kettle", function (M, W, D, H, C) {
    C = mPick(C, "#dfe3e8", "#1d1f22");
    var R = Math.min(W, D) * 0.4, body = M.mat("chrome", C.main), dark = M.mat("plastic", C.frame);
    M.cyl(0, 0, 0, 1.5 * cm, R * 1.05, dark, { seg: 18 });
    M.lathe(0, 0, [[R * 0.95, 1.5 * cm], [R, H * 0.35], [R * 0.85, H * 0.75], [R * 0.45, H * 0.92], [0, H * 0.94]], body, { seg: 18 });
    M.tube([R * 0.8, 0, H * 0.4], [R * 1.4, 0, H * 0.78], 0.9 * cm, body, 8);
    var last = [-R * 0.6, 0, H * 0.85];
    for (var i = 1; i <= 6; i++) {
      var a = i / 6 * Math.PI;
      var p = [-R * 0.6 - Math.sin(a) * R * 0.75, 0, H * 0.85 - (1 - Math.cos(a)) * H * 0.3];
      M.tube(last, p, 1 * cm, dark, 6);
      last = p;
    }
  });
  mDef("i_fruitbowl", function (M, W, D, H, C) {
    C = mPick(C, "#e8e2d6");
    var R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[R * 0.4, 0], [R * 0.75, H * 0.35], [R, H * 0.7], [R * 0.95, H * 0.72], [R * 0.7, H * 0.4], [0, H * 0.15]],
            M.mat("ceramic", C.main), { seg: 22 });
    [["#c7372f", -0.3, -0.2], ["#e8902a", 0.28, -0.15], ["#d9c43a", 0.02, 0.3], ["#7da23a", -0.05, -0.02]].forEach(function (f) {
      M.ball(f[1] * R, f[2] * R, H * 0.62, R * 0.32, R * 0.32, R * 0.3, M.mat("plastic", f[0]), { seg: 7 });
    });
  });
  mDef("i_trash", function (M, W, D, H, C) {
    C = mPick(C, "#c9cdd1", "#2a2c30");
    var R = Math.min(W, D) / 2;
    M.cyl(0, 0, 0, H - 4 * cm, R * 0.92, M.mat("metal", C.main), { r1: R, seg: 20 });
    M.lathe(0, 0, [[R, H - 4 * cm], [R, H - 2 * cm], [R * 0.7, H], [0, H + 0.5 * cm]], M.mat("chrome", "#dfe3e8"), { seg: 20 });
    M.box(-3 * cm, 3 * cm, R * 0.85, R * 0.85 + 4 * cm, 0, 2.5 * cm, M.mat("plastic", C.frame), 0.6 * cm);
  });
  // =============================================================== bathroom ==
  mDef("i_toilet", function (M, W, D, H, C) {
    C = mPick(C, "#f6f6f3", "#dfe3e8");
    var china = M.mat("ceramic", C.main), y0 = -D / 2, tankD = Math.min(18 * cm, D * 0.32), seatZ = 40 * cm;
    // the cistern against the wall, its lid and its button
    M.box(-W * 0.45, W * 0.45, y0, y0 + tankD, seatZ, H, china, 2.5 * cm);
    M.box(-W * 0.47, W * 0.47, y0 - 0.5 * cm, y0 + tankD + 0.8 * cm, H - 2 * cm, H + 1 * cm, china, 1 * cm);
    M.cyl(0, y0 + tankD / 2, H + 1 * cm, H + 1.6 * cm, 2.2 * cm, M.mat("chrome", C.frame), { seg: 12 });
    // the bowl on its foot, an oval, and the seat and lid over it
    var by = y0 + tankD + (D - tankD) * 0.42, R = W * 0.4, ry = ((D - tankD) * 0.58) / R;
    M.lathe(0, by, [[R * 0.55, 0], [R * 0.5, 8 * cm], [R * 0.62, 22 * cm], [R * 0.9, 33 * cm], [R, seatZ - 3 * cm], [R * 0.97, seatZ - 1 * cm]],
            china, { seg: 22, ry: ry * 0.8 });
    M.box(-R * 0.6, R * 0.6, y0 + tankD - 1 * cm, by, seatZ - 6 * cm, seatZ - 1 * cm, china, 1.5 * cm);
    M.lathe(0, by, [[R, seatZ - 1 * cm], [R * 1.02, seatZ + 1 * cm], [R * 0.95, seatZ + 2.5 * cm], [0, seatZ + 3 * cm]],
            M.mat("ceramic", "#fbfbf9"), { seg: 22, ry: ry * 0.82 });
  });
  mDef("i_sink", function (M, W, D, H, C) {
    C = mPick(C, "#f6f6f3", "#dfe3e8");
    var china = M.mat("ceramic", C.main), y0 = -D / 2;
    M.lathe(0, 0, [[W * 0.14, 0], [W * 0.11, H * 0.3], [W * 0.1, H * 0.6], [W * 0.18, H - 14 * cm]], china, { seg: 16 });
    // the basin: its outside up to the rim, and in, down to the drain
    var r = W / 2;
    M.lathe(0, 0, [[r * 0.3, H - 16 * cm], [r * 0.85, H - 8 * cm], [r, H - 2 * cm], [r * 0.98, H], [r * 0.88, H],
                   [r * 0.78, H - 5 * cm], [r * 0.45, H - 10 * cm], [0, H - 11 * cm]], china, { seg: 24, ry: D / W });
    M.disc(0, D * 0.05, H - 10.9 * cm, 1.6 * cm, 1.6 * cm, M.mat("chrome", "#9aa0a6"), 10);
    mTap(M, 0, y0 + 3 * cm, H, D * 0.3, M.mat("chrome", C.frame));
  });
  mDef("i_vanity", function (M, W, D, H, C) {
    C = mPick(C, "#f0ece6", "#7a5638");
    var body = M.mat("wood", C.frame), top = M.mat("stone", C.main), y1 = D / 2 - 2 * cm, basins = W > 80 * cm ? [-0.23, 0.23] : [0];
    M.box(-W / 2, W / 2, -D / 2, y1, 8 * cm, H - 4 * cm, body);
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, -D / 2, y1 - 4 * cm, 0, 8 * cm, M.mat("plastic", "#2a2b2d"));
    mFronts(M, -W / 2 + 0.5 * cm, W / 2 - 0.5 * cm, y1, 8.5 * cm, H - 4.5 * cm, 1, basins.length * 2, body, M.mat("chrome", "#c9ced3"), { doors: true, high: true });
    M.box(-W / 2 - 0.5 * cm, W / 2 + 0.5 * cm, -D / 2, D / 2, H - 4 * cm, H, top, 0.4 * cm);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + 1.5 * cm, H, H + 10 * cm, top);
    basins.forEach(function (k) {
      var r = Math.min(20 * cm, W * 0.2);
      M.lathe(k * W, D * 0.04, [[r * 0.45, H], [r * 0.85, H + 5 * cm], [r, H + 12 * cm], [r * 0.92, H + 12.5 * cm],
                                [r * 0.82, H + 8 * cm], [r * 0.4, H + 3.5 * cm], [0, H + 3 * cm]], M.mat("ceramic", "#fbfbf9"), { seg: 24, ry: 0.78 });
      mTap(M, k * W, -D / 2 + 5 * cm, H, D * 0.3 + 4 * cm, M.mat("chrome", "#dfe3e8"));
    });
  });
  mDef("i_bathtub", function (M, W, D, H, C) {
    C = mPick(C, "#f6f6f3", "#dfe3e8");
    var china = M.mat("ceramic", C.main), t = Math.min(7 * cm, W * 0.16), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
    M.box(x0, x0 + t, y0, y1, 0, H, china, 2.5 * cm);
    M.box(x1 - t, x1, y0, y1, 0, H, china, 2.5 * cm);
    M.box(x0, x1, y0, y0 + t, 0, H, china, 2.5 * cm);
    M.box(x0, x1, y1 - t, y1, 0, H, china, 2.5 * cm);
    // inside: sloping at the end you lie back against, flat under
    M.box(x0 + t - 1, x1 - t + 1, y0 + t - 1, y1 - t + 1, 0, 8 * cm, china);
    M.quad(china, [x0 + t, y1 - t, 8 * cm], [x1 - t, y1 - t, 8 * cm], [x1 - t, y1 - t - 22 * cm, H - 6 * cm], [x0 + t, y1 - t - 22 * cm, H - 6 * cm], [0, -0.7, 0.7]);
    M.disc(0, y0 + t + 10 * cm, 8.05 * cm, 2 * cm, 2 * cm, M.mat("chrome", C.frame), 10);
    // the taps at the far end (the plan's top)
    var tap = M.mat("chrome", C.frame);
    M.cyl(0, y0 + t / 2, H, H + 4 * cm, 1.8 * cm, tap, { seg: 10 });
    M.tube([0, y0 + t / 2, H + 3.5 * cm], [0, y0 + t + 9 * cm, H + 3.5 * cm], 1.2 * cm, tap, 8);
    [-7, 7].forEach(function (dx) { M.cyl(dx * cm, y0 + t / 2, H, H + 3 * cm, 2 * cm, tap, { seg: 10 }); });
  });
  mDef("i_shower", function (M, W, D, H, C) {
    C = mPick(C, "#f6f6f3", "#dfe3e8");
    var tray = Math.max(H, 4 * cm), top = 2.0 * FLOOR_PX, chrome = M.mat("chrome", C.frame), glass = M.mat("glass", "#cfe3ea");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, tray, M.mat("ceramic", C.main), 1.2 * cm);
    M.disc(0, 0, tray + 0.05 * cm, 3.5 * cm, 3.5 * cm, M.mat("chrome", "#9aa0a6"), 12);
    // glass along the front and the open side, framed at the top
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, D / 2 - 1.2 * cm, D / 2 - 0.4 * cm, tray, top, glass);
    M.box(W / 2 - 1.2 * cm, W / 2 - 0.4 * cm, -D / 2 + 1 * cm, D / 2 - 1 * cm, tray, top, glass);
    M.box(-W / 2 + 1 * cm, W / 2 - 0.4 * cm, D / 2 - 1.6 * cm, D / 2, top, top + 2 * cm, chrome);
    M.box(W / 2 - 1.6 * cm, W / 2, -D / 2 + 1 * cm, D / 2, top, top + 2 * cm, chrome);
    M.box(0, 1 * cm, D / 2 - 2.5 * cm, D / 2, 0.9 * FLOOR_PX, 1.3 * FLOOR_PX, chrome);   // the door's handle
    // the riser on the back wall, the head over, and the valve
    M.cyl(0, -D / 2 + 3 * cm, 1.0 * FLOOR_PX, top - 6 * cm, 1 * cm, chrome, { seg: 8 });
    M.tube([0, -D / 2 + 3 * cm, top - 6 * cm], [0, -D / 2 + 18 * cm, top - 4 * cm], 1 * cm, chrome, 8);
    M.cyl(0, -D / 2 + 22 * cm, top - 6 * cm, top - 4.5 * cm, 9 * cm, chrome, { seg: 20 });
    M.push().move(0, -D / 2 + 0.5 * cm, 1.05 * FLOOR_PX).tiltX(-90);
    M.cyl(0, 0, 0, 3 * cm, 4 * cm, chrome, { seg: 14 });
    M.pop();
  });
  mDef("i_bathmat", function (M, W, D, H, C) {
    C = mPick(C, "#cfd8d4");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, Math.max(1.2 * cm, H), M.mat("fabric", C.main), 2.5 * cm);
  });
  // a washer or a dryer: its round door, and the controls along the top
  function mLaundry(M, W, D, H, C, glassDoor) {
    C = mPick(C, "#f4f4f2", "#c9ced3");
    var body = M.mat("plastic", C.main), y1 = D / 2 - 1 * cm, R = Math.min(W, H) * 0.3, cz = H * 0.44;
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, body, 1.5 * cm);
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, y1 - 0.2 * cm, y1 + 0.5 * cm, H - 14 * cm, H - 2 * cm, M.mat("plastic", mShade(C.main, -0.06)), 0.4 * cm);
    M.push().move(0, y1, cz).tiltX(-90);
    M.lathe(0, 0, [[R + 2.5 * cm, 0], [R + 2.5 * cm, 2 * cm], [R + 1 * cm, 3.5 * cm], [R, 3.5 * cm]], M.mat("chrome", C.frame), { seg: 28 });
    M.lathe(0, 0, [[R, 3.5 * cm], [R * 0.6, 2.2 * cm], [0, 1.8 * cm]], glassDoor ? M.mat("screen", "#1c2a33") : body, { seg: 28 });
    M.pop();
    M.push().move(W * 0.28, y1 + 0.5 * cm, H - 8 * cm).tiltX(-90);
    M.cyl(0, 0, 0, 2 * cm, 3 * cm, M.mat("chrome", C.frame), { seg: 14 });
    M.pop();
    M.box(-W * 0.1, W * 0.12, y1 + 0.4 * cm, y1 + 0.6 * cm, H - 10 * cm, H - 6 * cm, M.mat("screen", "#12161a"));
    M.box(-W / 2 + 3 * cm, -W * 0.18, y1 + 0.4 * cm, y1 + 1.2 * cm, H - 11 * cm, H - 5 * cm, body, 0.4 * cm);
  }
  mDef("i_washer", function (M, W, D, H, C) { mLaundry(M, W, D, H, C, true); });
  mDef("i_dryer", function (M, W, D, H, C) { mLaundry(M, W, D, H, C, false); });
  mDef("i_utilitysink", function (M, W, D, H, C) {
    C = mPick(C, "#eceae6", "#dfe3e8");
    var tub = M.mat("plastic", C.main), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2, deep = 30 * cm;
    mLegs(M, x0, x1, y0, y1, 3 * cm, 0, H - deep, 2 * cm, tub, false);
    M.box(x0, x1, y0, y1, H - deep, H - deep + 3 * cm, tub, 1 * cm);
    M.box(x0, x0 + 3 * cm, y0, y1, H - deep, H, tub, 1 * cm);
    M.box(x1 - 3 * cm, x1, y0, y1, H - deep, H, tub, 1 * cm);
    M.box(x0, x1, y0, y0 + 3 * cm, H - deep, H, tub, 1 * cm);
    M.box(x0, x1, y1 - 3 * cm, y1, H - deep, H, tub, 1 * cm);
    mTap(M, 0, y0 + 1.5 * cm, H, D * 0.4, M.mat("chrome", C.frame));
  });
  mDef("i_ironing", function (M, W, D, H, C) {
    C = mPick(C, "#9fb4c8", "#c9ced3");
    var cover = M.mat("fabric", C.main), leg = M.mat("chrome", C.frame), pts = [];
    // the board's outline, as drawn: round at the nose (left), square at the end
    for (var i = 0; i <= 8; i++) {
      var a = Math.PI / 2 + i / 8 * Math.PI;
      pts.push([-W / 2 + D * 0.5 + Math.cos(a) * D * 0.5 * 1.4, Math.sin(a) * D / 2]);
    }
    pts.push([W / 2, D / 2], [W / 2, -D / 2]);
    pts = pts.map(function (p) { return [Math.max(-W / 2, p[0]), p[1]]; });
    M.prism(pts.reverse(), H - 2.5 * cm, H, cover);
    [[-W * 0.22, W * 0.25], [W * 0.25, -W * 0.22]].forEach(function (l) {
      M.tube([l[0], -D * 0.3, H - 3 * cm], [l[1], -D * 0.3, 0], 1.1 * cm, leg, 6);
      M.tube([l[0], D * 0.3, H - 3 * cm], [l[1], D * 0.3, 0], 1.1 * cm, leg, 6);
      M.tube([l[1], -D * 0.38, 0.8 * cm], [l[1], D * 0.38, 0.8 * cm], 1 * cm, M.mat("rubber", "#1d1f22"), 6);
    });
    // the iron on its rest
    M.box(W * 0.3, W * 0.42, -D * 0.25, D * 0.25, H, H + 2 * cm, M.mat("chrome", "#c9ced3"), 0.8 * cm);
    M.box(W * 0.3, W * 0.43, -6 * cm, 6 * cm, H + 2 * cm, H + 9 * cm, M.mat("plastic", "#5a7da0"), 3 * cm);
  });
  mDef("i_dryrack", function (M, W, D, H, C) {
    C = mPick(C, "#e9e9e6", "#9fb4c8");
    var rail = M.mat("plastic", C.main), x0 = -W / 2, x1 = W / 2;
    [-1, 1].forEach(function (s) {        // an A-frame each end
      [x0 + 1 * cm, x1 - 1 * cm].forEach(function (x) { M.tube([x, s * D / 2, 0], [x, s * D * 0.08, H], 1 * cm, rail, 6); });
      for (var k = 1; k <= 3; k++) {
        var f = k / 4, y = s * (D / 2 - (D / 2 - D * 0.08) * f);
        M.tube([x0 + 1 * cm, y, H * f], [x1 - 1 * cm, y, H * f], 0.6 * cm, rail, 6);
      }
    });
    M.tube([x0 + 1 * cm, 0, H], [x1 - 1 * cm, 0, H], 0.8 * cm, rail, 6);
    M.box(-W * 0.3, W * 0.05, -1 * cm, 1 * cm, H - 40 * cm, H, M.mat("fabric", C.frame), 0.8 * cm);   // a towel over it
    M.box(W * 0.1, W * 0.34, D * 0.15, D * 0.18, H * 0.75 - 30 * cm, H * 0.75, M.mat("fabric", "#d8a46a"), 0.6 * cm);
  });
  mDef("i_heater", function (M, W, D, H, C) {
    C = mPick(C, "#f2f2ef", "#c9a24a");
    var R = Math.min(W, D) / 2 * 0.9, body = M.mat("plastic", C.main), pipe = M.mat("metal", C.frame);
    M.lathe(0, 0, [[R * 0.9, 0], [R, 4 * cm], [R, H - 10 * cm], [R * 0.9, H - 3 * cm], [R * 0.4, H], [0, H]], body, { seg: 24 });
    [-0.3, 0.3].forEach(function (k) { M.cyl(k * R, 0, H - 1 * cm, H + 30 * cm, 1.4 * cm, pipe, { seg: 8 }); });
    M.box(-6 * cm, 6 * cm, R - 1 * cm, R + 2 * cm, 18 * cm, 30 * cm, M.mat("plastic", "#2a2b2d"), 1 * cm);
  });
  // ============================================================ living room ==
  mDef("i_tv", function (M, W, D, H, C) {
    C = mPick(C, "#1b1d20", "#3a3d40");
    var sh = Math.min(W * 0.58, H * 0.62), y = -D * 0.1;
    M.box(-W * 0.22, W * 0.22, -D * 0.3, D * 0.4, 0, 2 * cm, M.mat("metal", C.frame), 0.8 * cm);
    M.box(-3 * cm, 3 * cm, y - 1.5 * cm, y + 1.5 * cm, 2 * cm, H - sh + 6 * cm, M.mat("metal", C.frame));
    mScreen(M, -W / 2, W / 2, y - 2.5 * cm, y + 1 * cm, H - sh, H, C.main);
  });
  mDef("i_fireplace", function (M, W, D, H, C) {
    C = mPick(C, "#e9e4da", "#3a3027");
    var stone = M.mat("stone", C.main), y0 = -D / 2, y1 = D / 2;
    var ox = W * 0.31, top = H * 0.62;
    M.box(-W / 2, -ox, y0, y1 - 4 * cm, 0, H - 6 * cm, stone);           // the surround, round the opening
    M.box(ox, W / 2, y0, y1 - 4 * cm, 0, H - 6 * cm, stone);
    M.box(-ox, ox, y0, y1 - 4 * cm, top, H - 6 * cm, stone);
    M.box(-W / 2 - 3 * cm, W / 2 + 3 * cm, y0, y1, H - 6 * cm, H, M.mat("wood", C.frame), 0.6 * cm);   // the mantel
    M.box(-ox, ox, y0, y0 + 4 * cm, 0, top, M.mat("rubber", "#151312"));                               // the back of the fire
    M.box(-ox, -ox + 2 * cm, y0, y1 - 4 * cm, 0, top, M.mat("rubber", "#1d1a18"));
    M.box(ox - 2 * cm, ox, y0, y1 - 4 * cm, 0, top, M.mat("rubber", "#1d1a18"));
    M.box(-W / 2 - 4 * cm, W / 2 + 4 * cm, y1 - 4 * cm, y1 + 22 * cm, 0, 3 * cm, stone, 0.6 * cm);       // the hearth
    var wood = M.mat("bark", "#5b3f2a");
    M.tube([-ox * 0.6, y0 + 10 * cm, 3 * cm], [ox * 0.5, y0 + 14 * cm, 3 * cm], 3 * cm, wood, 8);
    M.tube([-ox * 0.4, y0 + 18 * cm, 3 * cm], [ox * 0.6, y0 + 9 * cm, 7 * cm], 2.6 * cm, wood, 8);
    [[-0.2, 9], [0.12, 12], [0.32, 8], [-0.05, 15]].forEach(function (f) {
      M.lathe(f[0] * ox, y0 + 13 * cm, [[4 * cm, 6 * cm], [3 * cm, 6 * cm + f[1] * cm * 0.5], [0, 6 * cm + f[1] * cm]], M.mat("glow", "#ff9a3c"), { seg: 8 });
    });
  });
  mDef("i_piano", function (M, W, D, H, C) {
    C = mPick(C, "#141416", "#f4f2ec");
    var body = M.mat("plastic", C.main), y0 = -D / 2, y1 = D / 2, keyY = y0 + D * 0.6, kz = 72 * cm;
    M.box(-W / 2, W / 2, y0, keyY, 0, H, body, 0.8 * cm);
    [-W / 2, W / 2 - 4 * cm].forEach(function (x) {
      M.box(x, x + 4 * cm, keyY, y1, kz - 6 * cm, kz + 2 * cm, body, 0.6 * cm);
      M.box(x + 0.5 * cm, x + 3.5 * cm, y1 - 6 * cm, y1 - 3 * cm, 0, kz - 6 * cm, body);
    });
    M.box(-W / 2 + 4 * cm, W / 2 - 4 * cm, keyY, y1 - 2 * cm, kz - 6 * cm, kz - 1 * cm, body);
    M.box(-W / 2 + 4 * cm, W / 2 - 4 * cm, keyY, y1 - 2 * cm, kz - 1 * cm, kz, M.mat("ceramic", C.frame));   // the keys
    var keys = Math.round((W - 8 * cm) / (2.3 * cm));
    for (var k = 0; k + 1 < keys; k++) {   // a black key after C, D, F, G and A of each octave
      if (k % 7 === 2 || k % 7 === 6) { continue; }
      var x = -W / 2 + 4 * cm + (k + 1) * (W - 8 * cm) / keys;
      M.box(x - 0.6 * cm, x + 0.6 * cm, keyY, keyY + (y1 - keyY) * 0.6, kz, kz + 1 * cm, body);
    }
    M.box(-W / 2 + 4 * cm, W / 2 - 4 * cm, keyY - 1 * cm, keyY + 2 * cm, kz + 10 * cm, kz + 30 * cm, body);   // the music rest
    M.box(-W / 2, W / 2, y0, keyY + 1 * cm, H - 2 * cm, H, body, 0.6 * cm);
    [-W * 0.15, W * 0.15].forEach(function (x) { M.box(x - 2 * cm, x + 2 * cm, y1 - 6 * cm, y1 - 2 * cm, 3 * cm, 5 * cm, M.mat("metal", "#c8a35a")); });
  });
  mDef("i_aquarium", function (M, W, D, H, C) {
    C = mPick(C, "#2a2b2d", "#4f8fb5");
    var stand = M.mat("wood", C.main), standH = Math.min(H * 0.55, 72 * cm), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
    M.box(x0, x1, y0, y1, 0, standH, stand, 0.6 * cm);
    mFronts(M, x0 + 1 * cm, x1 - 1 * cm, y1, 2 * cm, standH - 2 * cm, 1, 2, stand, M.mat("metal", "#9ea3a8"), { doors: true, high: true });
    var w0 = standH + 0.5 * cm, tank = H - 6 * cm;
    M.box(x0 + 1 * cm, x1 - 1 * cm, y0 + 1 * cm, y1 - 1 * cm, w0, w0 + 4 * cm, M.mat("stone", "#c9b48a"), 0.5 * cm);   // gravel
    M.box(x0 + 1 * cm, x1 - 1 * cm, y0 + 1 * cm, y1 - 1 * cm, w0 + 4 * cm, tank - 3 * cm, M.mat("glass", C.frame));
    M.box(x0, x1, y0, y1, w0, tank, M.mat("glass", "#d6eef7"));
    M.box(x0 - 0.5 * cm, x1 + 0.5 * cm, y0 - 0.5 * cm, y1 + 0.5 * cm, tank, H, M.mat("plastic", C.main), 0.6 * cm);   // the hood
    var rnd = mRand(W * 3);
    for (var p = 0; p < 4; p++) {
      var px = x0 + W * (0.15 + p * 0.22);
      M.tube([px, y0 + D * 0.3, w0 + 4 * cm], [px + (rnd() - 0.5) * 6 * cm, y0 + D * 0.3, w0 + (16 + rnd() * 14) * cm], 1.2 * cm, M.mat("leaves", "#3f7d46"), 6);
    }
    [["#f08a24", 0.3], ["#e8d24a", -0.2]].forEach(function (f, k) {
      M.ball(f[1] * W, D * 0.05, w0 + (14 + k * 8) * cm, 2.6 * cm, 1 * cm, 1.6 * cm, M.mat("plastic", f[0]), { seg: 5 });
    });
  });
  mDef("i_speaker", function (M, W, D, H, C) {
    C = mPick(C, "#2a2b2e", "#8a6240");
    var body = M.mat("wood", C.frame), y1 = D / 2;
    M.box(-W / 2, W / 2, -D / 2, y1 - 1 * cm, 0, H, body, 0.8 * cm);
    M.box(-W / 2 + 0.6 * cm, W / 2 - 0.6 * cm, y1 - 1.2 * cm, y1, 1 * cm, H - 1 * cm, M.mat("fabric", C.main));
    [[H * 0.25, W * 0.32], [H * 0.55, W * 0.32], [H * 0.82, W * 0.14]].forEach(function (s) {
      M.push().move(0, y1, s[0]).tiltX(-90);
      M.lathe(0, 0, [[s[1], 0], [s[1] * 0.4, -1 * cm], [0, -0.6 * cm]], M.mat("rubber", "#121314"), { seg: 18 });
      M.pop();
    });
  });
  mDef("i_rug", function (M, W, D, H, C) {
    C = mPick(C, "#b7a48a", "#7a5f48");
    var t = Math.max(0.8 * cm, H);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, t, M.mat("fabric", C.frame), 0.6 * cm);
    M.box(-W / 2 + 6 * cm, W / 2 - 6 * cm, -D / 2 + 6 * cm, D / 2 - 6 * cm, t, t + 0.12 * cm, M.mat("fabric", C.main));
    M.prism([[0, -D * 0.27], [W * 0.28, 0], [0, D * 0.27], [-W * 0.28, 0]], t + 0.12 * cm, t + 0.24 * cm, M.mat("fabric", C.frame));
  });
  // a lampshade: a drum of fabric, lit from inside
  function mLampShade(M, x, y, z, r0, r1, h, color) {
    M.lathe(x, y, [[r0, z], [r1, z + h]], M.mat("glow", color || "#f3e7cf"), { seg: 22 });
    M.lathe(x, y, [[r1 * 0.98, z + h], [r0 * 0.98, z]], M.mat("glow", "#fff1d0"), { seg: 22 });
  }
  mDef("i_lamp", function (M, W, D, H, C) {
    C = mPick(C, "#f1e6cf", "#2f3236");
    var met = M.mat("metal", C.frame), R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[R * 0.75, 0], [R * 0.75, 1.5 * cm], [R * 0.5, 2.5 * cm], [1.2 * cm, 3 * cm]], met, { seg: 20 });
    M.cyl(0, 0, 3 * cm, H - 12 * cm, 1 * cm, met, { seg: 8 });
    mLampShade(M, 0, 0, H - 30 * cm, R * 1.1, R * 0.8, 30 * cm, C.main);
  });
  mDef("i_arclamp", function (M, W, D, H, C) {
    C = mPick(C, "#dfe3e8", "#f2f0ea");
    var bx = 6 / 40 * W - W / 2, by = 34 / 40 * D - D / 2, hx = 32 / 40 * W - W / 2, hy = 8 / 40 * D - D / 2;
    M.box(bx - 9 * cm, bx + 9 * cm, by - 9 * cm, by + 9 * cm, 0, 6 * cm, M.mat("stone", C.frame), 1 * cm);   // a marble foot
    var chrome = M.mat("chrome", C.main), last = [bx, by, 6 * cm];
    for (var i = 1; i <= 14; i++) {      // the arc, up and over
      var t = i / 14, a = t * Math.PI * 0.85;
      var p = [bx + (hx - bx) * (1 - Math.cos(a)) / (1 - Math.cos(Math.PI * 0.85)), by + (hy - by) * (1 - Math.cos(a)) / (1 - Math.cos(Math.PI * 0.85)),
               6 * cm + Math.sin(a) * (H - 20 * cm) + t * 12 * cm];
      M.tube(last, p, 1 * cm, chrome, 8);
      last = p;
    }
    M.lathe(last[0], last[1], [[1.5 * cm, last[2]], [8 * cm, last[2] - 6 * cm], [16 * cm, last[2] - 18 * cm]], chrome, { seg: 22 });
    M.disc(last[0], last[1], last[2] - 17.8 * cm, 15 * cm, 15 * cm, M.mat("glow", "#fff1d0"), 18, true);
  });
  // ============================================================ electronics ==
  mDef("i_walltv", function (M, W, D, H, C) {
    C = mPick(C, "#1b1d20");
    mScreen(M, -W / 2, W / 2, -D / 2, -D / 2 + 3.5 * cm, 0, H, C.main);
  });
  mDef("i_soundbar", function (M, W, D, H, C) {
    C = mPick(C, "#232427");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("fabric", C.main), Math.min(H, D) * 0.45);
  });
  mDef("i_console", function (M, W, D, H, C) {
    C = mPick(C, "#f2f2f0", "#1d1f22");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("plastic", C.main), 1 * cm);
    M.box(-W / 2, W / 2, -D / 2 + 0.5 * cm, D / 2 - 0.5 * cm, H * 0.45, H * 0.55, M.mat("plastic", C.frame));
    M.ball(W * 0.2, D * 0.25, H + 1.5 * cm, 7 * cm, 4 * cm, 2 * cm, M.mat("plastic", C.frame), { seg: 6 });   // a controller
  });
  mDef("i_pc", function (M, W, D, H, C) {
    C = mPick(C, "#1d1f22", "#4f8fb5");
    var y1 = D / 2;
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, M.mat("plastic", C.main), 0.6 * cm);
    M.box(-W / 2 + 1.5 * cm, W / 2 - 1.5 * cm, y1, y1 + 0.3 * cm, 3 * cm, H - 6 * cm, M.mat("glass", "#2d3a48"));
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y1 + 0.3 * cm, y1 + 0.5 * cm, H - 4.5 * cm, H - 3.8 * cm, M.mat("glow", C.frame));
  });
  mDef("i_monitor", function (M, W, D, H, C) {
    C = mPick(C, "#1b1d20", "#2b2d31");
    var sh = Math.min(W * 0.58, H);
    M.box(-W * 0.25, W * 0.25, -D / 2, D / 2, 0, 1 * cm, M.mat("metal", C.frame), 0.5 * cm);
    M.box(-2 * cm, 2 * cm, -D * 0.2, -D * 0.05, 1 * cm, H * 0.4, M.mat("metal", C.frame));
    mScreen(M, -W / 2, W / 2, -D * 0.1, D * 0.05, H - sh, H, C.main);
  });
  mDef("i_recordplayer", function (M, W, D, H, C) {
    C = mPick(C, "#8a6240", "#1b1c1e");
    var px = -W / 2 + 15 / 35 * W;
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.7, M.mat("wood", C.main), 0.6 * cm);
    M.cyl(px, 0, H * 0.7, H * 0.78, D * 0.36, M.mat("metal", "#9ea3a8"), { seg: 26 });
    M.cyl(px, 0, H * 0.78, H * 0.8, D * 0.34, M.mat("plastic", C.frame), { seg: 26 });
    M.cyl(px, 0, H * 0.8, H * 0.81, D * 0.1, M.mat("plastic", "#c7372f"), { seg: 14 });
    M.tube([W / 2 - 4 * cm, -D * 0.33, H * 0.85], [px + D * 0.18, D * 0.08, H * 0.82], 0.5 * cm, M.mat("chrome", "#dfe3e8"), 6);
    M.cyl(W / 2 - 4 * cm, -D * 0.33, H * 0.7, H * 0.86, 1.6 * cm, M.mat("chrome", "#dfe3e8"), { seg: 10 });
  });
  mDef("i_projector", function (M, W, D, H, C, n, X) {
    C = mPick(C, "#eceae6", "#2b2d31");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, M.mat("plastic", C.main), 2 * cm);
    M.push().move((21 - 15) / 30 * W, D / 2, H / 2).tiltX(-90);
    M.cyl(0, 0, 0, 2 * cm, Math.min(W, H) * 0.24, M.mat("plastic", C.frame), { seg: 18 });
    M.cyl(0, 0, 2 * cm, 2.2 * cm, Math.min(W, H) * 0.15, M.mat("screen", "#1a2a3a"), { seg: 18 });
    M.pop();
    if (X && X.cord) { M.cyl(0, 0, H, H + X.cord, 1.5 * cm, M.mat("metal", C.frame), { seg: 8 }); }
  });
  mDef("i_proscreen", function (M, W, D, H, C) {
    C = mPick(C, "#f6f6f4", "#2b2d31");
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 9 * cm, H, M.mat("plastic", C.frame), 4 * cm);
    M.box(-W / 2 + 5 * cm, W / 2 - 5 * cm, -D / 2 + 1 * cm, -D / 2 + 1.4 * cm, 6 * cm, H - 9 * cm, M.mat("plastic", C.main));
    M.box(-W / 2 + 5 * cm, W / 2 - 5 * cm, -D / 2 + 0.5 * cm, -D / 2 + 2 * cm, 3 * cm, 6 * cm, M.mat("plastic", C.frame), 0.7 * cm);
  });
  mDef("i_fan", function (M, W, D, H, C) {
    C = mPick(C, "#f2f2f0", "#9ea3a8");
    var R = Math.min(W, D) / 2, body = M.mat("plastic", C.main), head = H - R * 0.8;
    M.lathe(0, 0, [[R * 0.7, 0], [R * 0.7, 1.5 * cm], [R * 0.3, 4 * cm], [1.4 * cm, 5 * cm]], body, { seg: 20 });
    M.cyl(0, 0, 5 * cm, head, 1.4 * cm, body, { seg: 10 });
    M.push().move(0, 0, head).tiltX(-90);
    M.cyl(0, 0, -10 * cm, 0, 5 * cm, body, { seg: 14 });
    for (var b = 0; b < 3; b++) {          // the blades, and the cage round them
      M.push().turn(b * 120 + 20).tiltX(18);
      M.box(-R * 0.08, R * 0.1, 0.5 * cm, R * 0.72, -0.4 * cm, 0.4 * cm, M.mat("plastic", C.frame), 0.3 * cm);
      M.pop();
    }
    for (var k = 0; k < 16; k++) {
      var a0 = k / 16 * Math.PI * 2, a1 = (k + 1) / 16 * Math.PI * 2;
      M.tube([Math.cos(a0) * R * 0.78, Math.sin(a0) * R * 0.78, 2 * cm], [Math.cos(a1) * R * 0.78, Math.sin(a1) * R * 0.78, 2 * cm], 0.5 * cm, body, 4);
      M.tube([0, 0, 5 * cm], [Math.cos(a0) * R * 0.78, Math.sin(a0) * R * 0.78, 2 * cm], 0.2 * cm, body, 3);
    }
    M.pop();
  });
  mDef("i_ac", function (M, W, D, H, C) {
    C = mPick(C, "#f4f4f2");
    var body = M.mat("plastic", C.main), y0 = -D / 2, y1 = D / 2;
    M.box(-W / 2, W / 2, y0, y1, 0, H, body, Math.min(H, D) * 0.35);
    for (var k = 0; k < 3; k++) { M.box(-W / 2 + 4 * cm, W / 2 - 4 * cm, y1 - 2 * cm, y1 + 0.2 * cm, 1 * cm + k * 1.6 * cm, 1.6 * cm + k * 1.6 * cm, M.mat("plastic", "#d9dad8")); }
    M.box(W / 2 - 9 * cm, W / 2 - 5 * cm, y1 - 0.3 * cm, y1 + 0.2 * cm, H - 4 * cm, H - 3 * cm, M.mat("glow", "#7fd7a8"));
  });
  // =========================================================== on the walls ==
  // Each with its back to the wall (-y) and its front to the room, from its
  // foot (z 0) to its top (H) where it hangs.
  mDef("i_picture", function (M, W, D, H, C, n) {
    C = mPick(C, "#c8a35a", "#2b2d31");
    var y0 = -D / 2, f = Math.min(3 * cm, W * 0.08), rnd = mRand((n && n.id) || 1);
    M.box(-W / 2, W / 2, y0, y0 + 3 * cm, 0, H, M.mat("wood", C.frame), 0.4 * cm);
    M.box(-W / 2 + f, W / 2 - f, y0 + 3 * cm, y0 + 3.2 * cm, f, H - f, M.mat("linen", "#f4f1ea"));
    // a picture: hills under a sky, in a few colors
    var x0 = -W / 2 + f * 2, x1 = W / 2 - f * 2, z0 = f * 2, z1 = H - f * 2, hues = ["#7fa7c9", "#d9a05b", "#6f9a6a", "#c7605a", "#4c5f7a"];
    M.box(x0, x1, y0 + 3.2 * cm, y0 + 3.3 * cm, z0 + (z1 - z0) * 0.45, z1, M.mat("plastic", hues[Math.floor(rnd() * 5)]));
    M.box(x0, x1, y0 + 3.2 * cm, y0 + 3.35 * cm, z0, z0 + (z1 - z0) * (0.35 + rnd() * 0.2), M.mat("plastic", hues[Math.floor(rnd() * 5)]));
    M.push().move(x0 + (x1 - x0) * (0.25 + rnd() * 0.5), y0 + 3.36 * cm, z0 + (z1 - z0) * 0.62).tiltX(-90);
    M.cyl(0, 0, 0, 0.05 * cm, Math.min(x1 - x0, z1 - z0) * 0.12, M.mat("plastic", "#f0d77a"), { seg: 14 });
    M.pop();
  });
  mDef("i_mirror", function (M, W, D, H, C) {
    C = mPick(C, "#dfe6ea", "#c8a35a");
    var y0 = -D / 2;
    M.box(-W / 2, W / 2, y0, y0 + 2.5 * cm, 0, H, M.mat("metal", C.frame), 1 * cm);
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y0 + 2.5 * cm, y0 + 2.7 * cm, 2 * cm, H - 2 * cm, M.mat("chrome", C.main));
  });
  mDef("i_shelf", function (M, W, D, H, C, n) {
    C = mPick(C, "#c29a6b", "#2f3236");
    var wood = M.mat("wood", C.main), y0 = -D / 2, y1 = D / 2, t = Math.max(2 * cm, H);
    M.box(-W / 2, W / 2, y0, y1, 0, t, wood, 0.4 * cm);
    [-W * 0.32, W * 0.32].forEach(function (x) {
      M.box(x - 1 * cm, x + 1 * cm, y0, y0 + 1.2 * cm, -12 * cm, 0, M.mat("metal", C.frame));
      M.box(x - 1 * cm, x + 1 * cm, y0, y1 - 3 * cm, -1.2 * cm, 0, M.mat("metal", C.frame));
    });
    mBooks(M, -W * 0.45, -W * 0.05, y0 + 1 * cm, y1 - 1 * cm, t, 26 * cm, mRand((n && n.id) || 3));
    M.lathe(W * 0.25, 0, [[3 * cm, t], [4.5 * cm, t + 6 * cm], [2 * cm, t + 13 * cm], [2.4 * cm, t + 15 * cm]], M.mat("ceramic", "#7d9bb0"), { seg: 14 });
  });
  mDef("i_wallclock", function (M, W, D, H, C) {
    C = mPick(C, "#f4f2ec", "#2b2d31");
    var R = Math.min(W, H) / 2, y0 = -D / 2;
    M.push().move(0, y0, H / 2).tiltX(-90);
    M.lathe(0, 0, [[R, 0], [R, 2.5 * cm], [R - 1 * cm, 3 * cm], [0, 3 * cm]], M.mat("metal", C.frame), { seg: 30 });
    M.cyl(0, 0, 2.6 * cm, 2.7 * cm, R - 1.3 * cm, M.mat("ceramic", C.main), { seg: 30 });
    for (var h = 0; h < 12; h++) {
      var a = h / 12 * Math.PI * 2;
      M.box(Math.cos(a) * R * 0.78 - 0.3 * cm, Math.cos(a) * R * 0.78 + 0.3 * cm, Math.sin(a) * R * 0.78 - 0.3 * cm, Math.sin(a) * R * 0.78 + 0.3 * cm,
            2.7 * cm, 2.8 * cm, M.mat("plastic", C.frame));
    }
    M.box(-0.4 * cm, 0.4 * cm, -R * 0.5, 0, 2.85 * cm, 3 * cm, M.mat("plastic", C.frame));
    M.box(0, R * 0.66, -0.3 * cm, 0.3 * cm, 2.9 * cm, 3.05 * cm, M.mat("plastic", C.frame));
    M.pop();
  });
  mDef("i_sconce", function (M, W, D, H, C) {
    C = mPick(C, "#f3e7cf", "#c8a35a");
    var y0 = -D / 2;
    M.box(-3 * cm, 3 * cm, y0, y0 + 1 * cm, H * 0.2, H * 0.6, M.mat("metal", C.frame), 0.5 * cm);
    M.tube([0, y0 + 1 * cm, H * 0.4], [0, 0, H * 0.4], 0.8 * cm, M.mat("metal", C.frame), 6);
    mLampShade(M, 0, D * 0.05, H * 0.3, W * 0.32, W * 0.22, H * 0.7, C.main);
  });
  mDef("i_cabinet", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#a7adb3");
    var body = M.mat("plastic", C.main), y1 = D / 2 - 2 * cm;
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, body, 0.3 * cm);
    mFronts(M, -W / 2 + 0.5 * cm, W / 2 - 0.5 * cm, y1, 0.5 * cm, H - 0.5 * cm, 1, W > 45 * cm ? 2 : 1, body, M.mat("chrome", C.frame), { doors: true, low: true });
  });
  mDef("i_hooks", function (M, W, D, H, C) {
    C = mPick(C, "#8a6240", "#2f3236");
    var y0 = -D / 2;
    M.box(-W / 2, W / 2, y0, y0 + 2 * cm, 0, H, M.mat("wood", C.main), 0.4 * cm);
    for (var k = 0; k < 4; k++) {
      var x = -W / 2 + (8 + k * 10) / 50 * W;
      M.tube([x, y0 + 2 * cm, H / 2], [x, y0 + 7 * cm, H / 2 + 3 * cm], 0.6 * cm, M.mat("metal", C.frame), 6);
    }
    M.box(-W * 0.32, -W * 0.08, y0 + 2 * cm, y0 + 8 * cm, -60 * cm, H / 2 + 2 * cm, M.mat("fabric", "#4a5d74"), 3 * cm);   // a coat on one
  });
  mDef("i_radiator", function (M, W, D, H, C) {
    C = mPick(C, "#f2f2ef");
    var paint = M.mat("plastic", C.main), cols = Math.max(4, Math.round(W / (6 * cm)));
    for (var k = 0; k < cols; k++) {
      var x = -W / 2 + (k + 0.5) * W / cols;
      M.box(x - W / cols * 0.38, x + W / cols * 0.38, -D / 2 + 1 * cm, D / 2, 0, H, paint, Math.min(1.8 * cm, W / cols * 0.3));
    }
    M.tube([-W / 2, 0, 3 * cm], [W / 2, 0, 3 * cm], 1.2 * cm, paint, 8);
    M.tube([-W / 2, 0, H - 3 * cm], [W / 2, 0, H - 3 * cm], 1.2 * cm, paint, 8);
  });
  mDef("i_hood", function (M, W, D, H, C) {
    C = mPick(C, "#c9cdd1");
    var steel = M.mat("metal", C.main), y0 = -D / 2, can = Math.min(H * 0.35, 22 * cm);
    M.lathe(0, 0, [[W / 2 * 1.414, 0], [W / 2 * 1.414, 3 * cm], [W * 0.18 * 1.414, can]], steel, { seg: 4, ry: D / W, from: 45, to: 405 });
    M.box(-W * 0.16, W * 0.16, y0, y0 + D * 0.5, can - 1 * cm, H, steel, 0.4 * cm);
    M.box(-W * 0.45, W * 0.45, -D * 0.4, D * 0.4, -0.05 * cm, 0.1 * cm, M.mat("metal", "#7d8288"));
  });
  mDef("i_towelrail", function (M, W, D, H, C) {
    C = mPick(C, "#dfe3e8", "#c7d6d2");
    var y0 = -D / 2, chrome = M.mat("chrome", C.main), z = H / 2;
    [-W / 2 + 4 * cm, W / 2 - 4 * cm].forEach(function (x) { M.tube([x, y0, z], [x, y0 + 6 * cm, z], 1 * cm, chrome, 8); });
    M.tube([-W / 2 + 3 * cm, y0 + 6 * cm, z], [W / 2 - 3 * cm, y0 + 6 * cm, z], 1 * cm, chrome, 10);
    M.box(-W * 0.3, W * 0.3, y0 + 4 * cm, y0 + 8 * cm, z - 45 * cm, z + 1.5 * cm, M.mat("fabric", C.frame), 1.5 * cm);
  });
  mDef("i_medicine", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#dfe6ea");
    var y1 = D / 2;
    M.box(-W / 2, W / 2, -D / 2, y1 - 1.5 * cm, 0, H, M.mat("plastic", C.main), 0.5 * cm);
    M.box(-W / 2 + 0.5 * cm, -0.2 * cm, y1 - 1.5 * cm, y1, 0.5 * cm, H - 0.5 * cm, M.mat("chrome", C.frame));
    M.box(0.2 * cm, W / 2 - 0.5 * cm, y1 - 1.5 * cm, y1, 0.5 * cm, H - 0.5 * cm, M.mat("chrome", C.frame));
  });
  // ======================================================= from the ceiling ==
  // From its foot (z 0) to its top (H); its cord (X.cord) on up to the ceiling.
  function mCord(M, H, X, color) {
    if (X && X.cord > 0) {
      M.cyl(0, 0, H, H + X.cord, 0.35 * cm, M.mat("rubber", "#1d1f22"), { seg: 5, top: false });
      M.cyl(0, 0, H + X.cord - 1.5 * cm, H + X.cord, 5 * cm, M.mat("metal", color || "#2b2d31"), { seg: 14 });
    }
  }
  mDef("i_pendant", function (M, W, D, H, C, n, X) {
    C = mPick(C, "#2b2d31", "#fff1d0");
    var R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[R, 0], [R * 0.92, H * 0.35], [R * 0.45, H * 0.8], [1.6 * cm, H]], M.mat("metal", C.main), { seg: 22 });
    M.ball(0, 0, H * 0.3, R * 0.32, R * 0.32, R * 0.32, M.mat("glow", C.frame), { seg: 7 });
    mCord(M, H, X, C.main);
  });
  mDef("i_chandelier", function (M, W, D, H, C, n, X) {
    C = mPick(C, "#c8a35a", "#fff1d0");
    var brass = M.mat("metal", C.main), R = Math.min(W, D) / 2 * 0.85;
    M.lathe(0, 0, [[0, 0], [3 * cm, 3 * cm], [2 * cm, H * 0.4], [4 * cm, H * 0.55], [1.2 * cm, H]], brass, { seg: 14 });
    for (var k = 0; k < 6; k++) {
      var a = k / 6 * Math.PI * 2 + Math.PI / 6, last = [0, 0, H * 0.25];
      for (var i = 1; i <= 6; i++) {
        var t = i / 6, p = [Math.cos(a) * R * t, Math.sin(a) * R * t, H * 0.25 - Math.sin(t * Math.PI) * H * 0.18 + t * t * H * 0.25];
        M.tube(last, p, 0.8 * cm, brass, 6);
        last = p;
      }
      M.cyl(last[0], last[1], last[2], last[2] + 1.5 * cm, 2.6 * cm, brass, { seg: 10 });
      M.cyl(last[0], last[1], last[2] + 1.5 * cm, last[2] + 10 * cm, 1.1 * cm, M.mat("ceramic", "#f8f6f0"), { seg: 8 });
      M.ball(last[0], last[1], last[2] + 12 * cm, 1.2 * cm, 1.2 * cm, 2.4 * cm, M.mat("glow", C.frame), { seg: 5 });
    }
    mCord(M, H, X, C.main);
  });
  mDef("i_ceilingfan", function (M, W, D, H, C, n, X) {
    C = mPick(C, "#f2f2f0", "#8a6240");
    var body = M.mat("metal", C.main), R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[0, 0], [8 * cm, 1.5 * cm], [10 * cm, H * 0.6], [6 * cm, H], [0, H]], body, { seg: 20 });
    M.ball(0, 0, 0, 8 * cm, 8 * cm, 4 * cm, M.mat("glow", "#fff6e0"), { seg: 8, lat1: 0 });
    for (var b = 0; b < 4; b++) {
      M.push().turn(b * 90 + 15).move(0, 0, H * 0.55).tiltY(-6);
      M.box(9 * cm, R, -5.5 * cm, 5.5 * cm, -0.5 * cm, 0.5 * cm, M.mat("wood", C.frame), 0.4 * cm);
      M.pop();
    }
    if (X && X.cord > 0) {
      M.cyl(0, 0, H, H + X.cord, 1.4 * cm, body, { seg: 8 });
      M.cyl(0, 0, H + X.cord - 4 * cm, H + X.cord, 6 * cm, body, { r1: 7 * cm, seg: 14 });
    }
  });
  mDef("i_hanging", function (M, W, D, H, C, n, X) {
    C = mPick(C, "#d9cdbb", "#5c8a4a");
    var R = Math.min(W, D) / 2 * 0.6, rnd = mRand((n && n.id) || 9);
    var top = mPot(M, 0, 0, R, H * 0.55, M.mat("ceramic", C.main));
    mLeaves(M, 0, 0, top + R * 0.3, R * 0.9, C.frame, rnd, 6);
    for (var v = 0; v < 5; v++) {         // trailing over the side
      var a = v / 5 * Math.PI * 2 + rnd(), last = [Math.cos(a) * R, Math.sin(a) * R, top];
      for (var s = 1; s <= 4; s++) {
        var p = [Math.cos(a) * (R + s * 1.4 * cm), Math.sin(a) * (R + s * 1.4 * cm), top - s * (5 + rnd() * 4) * cm];
        M.ball(p[0], p[1], p[2], 2.4 * cm, 2.4 * cm, 2 * cm, M.mat("leaves", mShade(C.frame, 0.1)), { seg: 4 });
        last = p;
      }
    }
    [0, 120, 240].forEach(function (d) {
      var a = d * Math.PI / 180;
      M.tube([Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95, H * 0.5], [0, 0, H + ((X && X.cord) || 0)], 0.25 * cm, M.mat("wicker", "#c9ad7f"), 4);
    });
  });
  // ============================================================== on things ==
  mDef("i_tablelamp", function (M, W, D, H, C) {
    C = mPick(C, "#f3e7cf", "#7d9bb0");
    var R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[R * 0.45, 0], [R * 0.62, H * 0.12], [R * 0.66, H * 0.28], [R * 0.38, H * 0.45], [R * 0.16, H * 0.5]],
            M.mat("ceramic", C.frame), { seg: 18 });
    M.cyl(0, 0, H * 0.5, H * 0.62, 0.6 * cm, M.mat("metal", "#c8a35a"), { seg: 6 });
    mLampShade(M, 0, 0, H * 0.58, R, R * 0.72, H * 0.42, C.main);
  });
  mDef("i_desklamp", function (M, W, D, H, C) {
    C = mPick(C, "#2b2d31");
    var met = M.mat("metal", C.main), bx = -W / 2 + 5 / 20 * W, by = -D / 2 + 15 / 20 * D, hx = -W / 2 + 14 / 20 * W, hy = -D / 2 + 6 / 20 * D;
    M.cyl(bx, by, 0, 1.5 * cm, Math.min(W, D) * 0.22, met, { seg: 16 });
    var knee = [(bx + hx) / 2 - 2 * cm, (by + hy) / 2 + 2 * cm, H * 0.75];
    M.tube([bx, by, 1.5 * cm], knee, 0.7 * cm, met, 6);
    M.tube(knee, [hx, hy, H * 0.88], 0.7 * cm, met, 6);
    M.lathe(hx, hy, [[1.4 * cm, H], [4 * cm, H * 0.82], [6 * cm, H * 0.68]], met, { seg: 16 });
    M.disc(hx, hy, H * 0.69, 5.6 * cm, 5.6 * cm, M.mat("glow", "#fff6e0"), 14, true);
  });
  mDef("i_vase", function (M, W, D, H, C, n) {
    C = mPick(C, "#7d9bb0", "#5c8a4a");
    var R = Math.min(W, D) / 2, rnd = mRand((n && n.id) || 5);
    M.lathe(0, 0, [[R * 0.5, 0], [R * 0.8, H * 0.3], [R * 0.6, H * 0.75], [R * 0.32, H * 0.9], [R * 0.4, H]], M.mat("ceramic", C.main), { seg: 18 });
    var flowers = ["#e46b6b", "#f2c94c", "#f4f2ec", "#b07cc6"];
    for (var k = 0; k < 5; k++) {
      var a = k / 5 * Math.PI * 2 + rnd(), top = [Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9, H + (8 + rnd() * 12) * cm];
      M.tube([0, 0, H * 0.7], top, 0.3 * cm, M.mat("leaves", C.frame), 4);
      M.ball(top[0], top[1], top[2], 2.2 * cm, 2.2 * cm, 1.8 * cm, M.mat("fabric", flowers[k % 4]), { seg: 5 });
    }
  });
  mDef("i_candle", function (M, W, D, H, C) {
    C = mPick(C, "#f4efe2", "#c8a35a");
    var R = Math.min(W, D) / 2;
    M.cyl(0, 0, 0, 1 * cm, R, M.mat("metal", C.frame), { seg: 16 });
    M.cyl(0, 0, 1 * cm, H, R * 0.7, M.mat("ceramic", C.main), { seg: 16 });
    M.ball(0, 0, H + 1.6 * cm, 0.7 * cm, 0.7 * cm, 1.6 * cm, M.mat("glow", "#ffb347"), { seg: 5 });
  });
  mDef("i_books", function (M, W, D, H, C) {
    var cols = ["#2f4f6f", "#8c3b2f", "#c9a24a"], h = H / 3;
    for (var k = 0; k < 3; k++) {
      M.push().move((k - 1) * 0.8 * cm, (k % 2 ? 1 : -1) * 0.5 * cm, k * h).turn((k - 1) * 4);
      M.box(-W / 2 + k * 0.6 * cm, W / 2 - k * 0.8 * cm, -D / 2 + k * 0.4 * cm, D / 2 - k * 0.4 * cm, 0, h, M.mat("plastic", cols[k]), 0.3 * cm);
      M.pop();
    }
  });
  mDef("i_frame", function (M, W, D, H, C) {
    C = mPick(C, "#c8a35a");
    M.push().move(0, 0, 0).tiltX(12);
    M.box(-W / 2, W / 2, -0.8 * cm, 0.8 * cm, 0, H, M.mat("metal", C.main), 0.3 * cm);
    M.box(-W / 2 + 1.5 * cm, W / 2 - 1.5 * cm, 0.8 * cm, 0.9 * cm, 1.5 * cm, H - 1.5 * cm, M.mat("plastic", "#8fb1c9"));
    M.pop();
  });
  mDef("i_basket", function (M, W, D, H, C) {
    C = mPick(C, "#c9ad7f");
    M.lathe(0, 0, [[W * 0.4, 0], [W * 0.5, H], [W * 0.47, H], [0, 0.5 * cm]], M.mat("wicker", C.main), { seg: 18, ry: D / W });
  });
  mDef("i_succulent", function (M, W, D, H, C, n) {
    C = mPick(C, "#e8e2d6", "#7da584");
    var R = Math.min(W, D) / 2, top = mPot(M, 0, 0, R, H * 0.55, M.mat("ceramic", C.main));
    for (var k = 0; k < 9; k++) {
      var a = k / 9 * Math.PI * 2, ring = k < 6 ? 0.55 : 0.2;
      M.push().move(Math.cos(a) * R * ring, Math.sin(a) * R * ring, top).turn(a * 180 / Math.PI).tiltY(k < 6 ? 55 : 15);
      M.ball(0, 0, R * 0.35, R * 0.18, R * 0.12, R * 0.4, M.mat("leaves", C.frame), { seg: 4 });
      M.pop();
    }
  });
  mDef("i_herbs", function (M, W, D, H, C, n) {
    C = mPick(C, "#b8673f", "#5c8a4a");
    var rnd = mRand((n && n.id) || 4);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.45, M.mat("ceramic", C.main), 1 * cm);
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -D / 2 + 1 * cm, D / 2 - 1 * cm, H * 0.43, H * 0.44, M.mat("soil", "#4b3a2b"));
    [-0.3, 0, 0.3].forEach(function (k) { mLeaves(M, k * W, 0, H * 0.7, Math.min(D * 0.45, W * 0.15), C.frame, rnd, 4); });
  });
  // ================================================================= plants ==
  mDef("i_plant", function (M, W, D, H, C, n) {
    C = mPick(C, "#e8e2d6", "#4f7d3a");
    var R = Math.min(W, D) / 2, rnd = mRand((n && n.id) || 7);
    var top = mPot(M, 0, 0, R * 0.55, Math.min(H * 0.4, 35 * cm), M.mat("ceramic", C.main));
    // stems up from the earth, each ending in a few broad leaves
    for (var s = 0; s < 7; s++) {
      var a = s / 7 * Math.PI * 2 + rnd() * 0.6, lean = 0.25 + rnd() * 0.45, len = (H - top) * (0.6 + rnd() * 0.35);
      var tip = [Math.cos(a) * R * lean * 1.4, Math.sin(a) * R * lean * 1.4, top + len];
      M.tube([0, 0, top], tip, 0.45 * cm, M.mat("leaves", mShade(C.frame, -0.2)), 4);
      M.push().move(tip[0], tip[1], tip[2]).turn(a * 180 / Math.PI).tiltY(40 + rnd() * 30);
      M.ball(0, 0, R * 0.22, R * 0.16, R * 0.07, R * 0.3, M.mat("leaves", mShade(C.frame, (rnd() - 0.5) * 0.3)), { seg: 5 });
      M.pop();
    }
    mLeaves(M, 0, 0, top + (H - top) * 0.55, R * 0.42, C.frame, rnd, 4);
  });
  mDef("i_palm", function (M, W, D, H, C, n) {
    C = mPick(C, "#d9cdbb", "#4f8a3f");
    var R = Math.min(W, D) / 2, rnd = mRand((n && n.id) || 11);
    var top = mPot(M, 0, 0, R * 0.42, 40 * cm, M.mat("ceramic", C.main));
    M.cyl(0, 0, top, H * 0.72, 2.6 * cm, M.mat("bark", "#7a6046"), { r1: 1.8 * cm, seg: 8 });
    for (var f = 0; f < 9; f++) {         // the fronds, arching out and down
      var a = f / 9 * Math.PI * 2 + rnd() * 0.4, len = R * (0.75 + rnd() * 0.3), last = [0, 0, H * 0.72];
      for (var s = 1; s <= 5; s++) {
        var t = s / 5, p = [Math.cos(a) * len * t, Math.sin(a) * len * t, H * 0.72 + Math.sin(t * Math.PI * 0.8) * H * 0.25 - t * t * H * 0.1];
        M.tube(last, p, 0.4 * cm, M.mat("leaves", mShade(C.frame, -0.2)), 4);
        M.push().move(p[0], p[1], p[2]).turn(a * 180 / Math.PI);
        M.box(-1.2 * cm, 1.2 * cm, -len * 0.16 * (1 - t * 0.5), len * 0.16 * (1 - t * 0.5), -0.25 * cm, 0.25 * cm, M.mat("leaves", C.frame));
        M.pop();
        last = p;
      }
    }
  });
  mDef("i_cactus", function (M, W, D, H, C) {
    C = mPick(C, "#b8673f", "#5f8f55");
    var R = Math.min(W, D) / 2, green = M.mat("leaves", C.frame);
    var top = mPot(M, 0, 0, R * 0.7, Math.min(H * 0.3, 20 * cm), M.mat("ceramic", C.main));
    M.lathe(0, 0, [[R * 0.32, top], [R * 0.36, top + (H - top) * 0.6], [R * 0.3, H - 3 * cm], [R * 0.12, H], [0, H]], green, { seg: 12 });
    [[1, 0.35, 0.65], [-1, 0.5, 0.8]].forEach(function (b) {
      var x = b[0] * R * 0.32, z = top + (H - top) * b[1];
      M.tube([x, 0, z], [b[0] * R * 0.75, 0, z], R * 0.13, green, 8);
      M.lathe(b[0] * R * 0.75, 0, [[R * 0.14, z - R * 0.1], [R * 0.14, top + (H - top) * b[2]], [0, top + (H - top) * b[2] + R * 0.1]], green, { seg: 10 });
    });
  });
  mDef("i_flowers", function (M, W, D, H, C, n) {
    C = mPick(C, "#e8e2d6", "#e46b6b");
    var R = Math.min(W, D) / 2, rnd = mRand((n && n.id) || 13);
    var top = mPot(M, 0, 0, R * 0.6, H * 0.45, M.mat("ceramic", C.main));
    mLeaves(M, 0, 0, top + 3 * cm, R * 0.6, "#5c8a4a", rnd, 4);
    for (var k = 0; k < 7; k++) {
      var a = rnd() * Math.PI * 2, d = rnd() * R * 0.6, p = [Math.cos(a) * d, Math.sin(a) * d, H - rnd() * 6 * cm];
      M.tube([p[0] * 0.4, p[1] * 0.4, top], p, 0.3 * cm, M.mat("leaves", "#4f7d3a"), 4);
      for (var q = 0; q < 5; q++) {
        var b = q / 5 * Math.PI * 2;
        M.ball(p[0] + Math.cos(b) * 1.6 * cm, p[1] + Math.sin(b) * 1.6 * cm, p[2], 1.4 * cm, 1.4 * cm, 0.6 * cm, M.mat("fabric", k % 3 ? C.frame : "#f2c94c"), { seg: 4 });
      }
      M.ball(p[0], p[1], p[2] + 0.3 * cm, 0.9 * cm, 0.9 * cm, 0.6 * cm, M.mat("plastic", "#f2c94c"), { seg: 4 });
    }
  });
  mDef("i_shrub", function (M, W, D, H, C, n) {
    C = mPick(C, "#4f7d3a");
    var rnd = mRand((n && n.id) || 17), R = Math.min(W, D) / 2, lumps = 9;
    for (var st = 0; st < 3; st++) {
      var sa = st / 3 * Math.PI * 2;
      M.tube([0, 0, 0], [Math.cos(sa) * R * 0.3, Math.sin(sa) * R * 0.3, H * 0.5], 1.4 * cm, M.mat("bark", "#5b4632"), 5);
    }
    for (var k = 0; k < lumps; k++) {
      var a = rnd() * Math.PI * 2, f = k / (lumps - 1), d = R * (0.55 - 0.4 * f) * (0.6 + rnd() * 0.4);
      var s = R * (0.5 - 0.15 * f + rnd() * 0.12), z = s * 0.85 + f * Math.max(0, H - s * 1.75);
      M.ball(Math.cos(a) * d, Math.sin(a) * d, z, s, s, s * 0.9, M.mat("leaves", mShade(C.main, (rnd() - 0.5) * 0.3)), { seg: 6 });
    }
  });
  mDef("i_hedge", function (M, W, D, H, C, n) {
    C = mPick(C, "#3f6f35");
    var rnd = mRand((n && n.id) || 19), count = Math.max(2, Math.round(W / (D * 0.8)));
    M.box(-W / 2 + D * 0.3, W / 2 - D * 0.3, -D * 0.35, D * 0.35, 0, H * 0.85, M.mat("leaves", C.main), D * 0.3);
    for (var k = 0; k < count; k++) {
      var x = -W / 2 + D * 0.5 + k * (W - D) / Math.max(1, count - 1);
      M.ball(x, (rnd() - 0.5) * D * 0.1, H * 0.62, D * 0.55, D * 0.52, H * 0.42, M.mat("leaves", mShade(C.main, (rnd() - 0.5) * 0.2)), { seg: 6 });
    }
  });
  mDef("i_flowerbed", function (M, W, D, H, C, n) {
    C = mPick(C, "#e46b6b", "#8a6240");
    var rnd = mRand((n && n.id) || 23), edge = M.mat("wood", C.frame), t = 3 * cm, h = Math.max(H, 12 * cm);
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + t, 0, h, edge);
    M.box(-W / 2, W / 2, D / 2 - t, D / 2, 0, h, edge);
    M.box(-W / 2, -W / 2 + t, -D / 2, D / 2, 0, h, edge);
    M.box(W / 2 - t, W / 2, -D / 2, D / 2, 0, h, edge);
    M.box(-W / 2 + t, W / 2 - t, -D / 2 + t, D / 2 - t, 0, h - 3 * cm, M.mat("soil", "#4b3a2b"));
    var hues = [C.main, "#f2c94c", "#b07cc6", "#f4f2ec"];
    for (var x = -W / 2 + 10 * cm; x < W / 2 - 8 * cm; x += 13 * cm) {
      var y = (rnd() - 0.5) * (D - 14 * cm), top = h + (10 + rnd() * 14) * cm;
      M.ball(x, y, h + 3 * cm, 6 * cm, 6 * cm, 5 * cm, M.mat("leaves", "#4f7d3a"), { seg: 5 });
      M.tube([x, y, h], [x, y, top], 0.4 * cm, M.mat("leaves", "#4f7d3a"), 4);
      M.ball(x, y, top, 3.2 * cm, 3.2 * cm, 2 * cm, M.mat("fabric", hues[Math.floor(rnd() * hues.length)]), { seg: 5 });
    }
  });
  // ============================================================ the garden ==
  mDef("i_grill", function (M, W, D, H, C) {
    C = mPick(C, "#2b2d31", "#9ea3a8");
    var body = M.mat("metal", C.main), steel = M.mat("metal", C.frame), x0 = -W * 0.32, x1 = W * 0.32, cz = H * 0.62;
    M.box(x0, x1, -D / 2, D / 2, 8 * cm, cz, body, 1 * cm);
    mFronts(M, x0 + 1 * cm, x1 - 1 * cm, D / 2, 10 * cm, cz - 4 * cm, 1, 2, body, M.mat("chrome", "#dfe3e8"), { doors: true, high: true });
    [-W / 2, x1].forEach(function (x) { M.box(x, x + W * 0.18, -D * 0.4, D * 0.4, cz - 4 * cm, cz - 2 * cm, steel, 0.4 * cm); });
    M.push().move(0, 0, cz).tiltY(90);
    M.lathe(0, 0, [[D * 0.5, x0], [D * 0.5, x1]], body, { seg: 16, from: 90, to: 270, top: false });
    M.pop();
    M.tube([x0 + 4 * cm, D * 0.5 + 4 * cm, cz + D * 0.3], [x1 - 4 * cm, D * 0.5 + 4 * cm, cz + D * 0.3], 1 * cm, M.mat("chrome", "#dfe3e8"), 8);
    [[x0, -1], [x1, 1]].forEach(function (w) {
      M.push().move(w[0], -D * 0.3, 7 * cm).tiltY(90);
      M.cyl(0, 0, -2 * cm, 2 * cm, 7 * cm, M.mat("rubber", "#151515"), { seg: 14 });
      M.pop();
    });
    mLegs(M, x0, x1, -D / 2, D / 2, 2 * cm, 0, 8 * cm, 1.5 * cm, steel, false);
  });
  mDef("i_hottub", function (M, W, D, H, C) {
    C = mPick(C, "#7a5c45", "#4fa3c7");
    var t = 12 * cm, wood = M.mat("wood", C.main), shell = M.mat("ceramic", "#e9eef0");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 6 * cm, wood, 3 * cm);
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -D / 2 + 1 * cm, D / 2 - 1 * cm, H - 6 * cm, H, shell, 4 * cm);
    M.box(-W / 2 + t, W / 2 - t, -D / 2 + t, D / 2 - t, H - 8 * cm, H - 7.8 * cm, M.mat("water", C.frame));
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (k) {
      M.box(k[0] * (W / 2 - t) - (k[0] > 0 ? 18 * cm : 0), k[0] * (W / 2 - t) + (k[0] < 0 ? 18 * cm : 0),
            k[1] * (D / 2 - t) - (k[1] > 0 ? 18 * cm : 0), k[1] * (D / 2 - t) + (k[1] < 0 ? 18 * cm : 0), H - 30 * cm, H - 14 * cm, shell, 3 * cm);
    });
  });
  mDef("i_deck", function (M, W, D, H, C) {
    C = mPick(C, "#a57a52");
    var t = Math.max(H, 6 * cm), boards = Math.max(3, Math.round(D / (14 * cm))), bd = D / boards;
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, -D / 2 + 2 * cm, D / 2 - 2 * cm, 0, t - 2.5 * cm, M.mat("wood", mShade(C.main, -0.3)));
    for (var b = 0; b < boards; b++) {
      M.box(-W / 2, W / 2, -D / 2 + b * bd + 0.4 * cm, -D / 2 + (b + 1) * bd - 0.4 * cm, t - 2.5 * cm, t, M.mat("wood", mShade(C.main, (b % 3 - 1) * 0.05)), 0.4 * cm);
    }
  });
  mDef("i_driveway", function (M, W, D, H, C) {
    C = mPick(C, "#b9b6ae");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, Math.max(H, 1.5 * cm), M.mat("concrete", C.main), 0.8 * cm);
  });
  mDef("i_path", function (M, W, D, H, C) {
    C = mPick(C, "#c8c2b6");
    var n = Math.max(2, Math.round(D / (40 * cm))), step = D / n;
    for (var k = 0; k < n; k++) {
      M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -D / 2 + k * step + 2 * cm, -D / 2 + (k + 1) * step - 2 * cm, 0, Math.max(H, 2 * cm),
            M.mat("stone", mShade(C.main, (k % 3 - 1) * 0.05)), 1.2 * cm);
    }
  });
  mDef("i_fence", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea");
    var paint = M.mat("plastic", C.main), posts = Math.max(2, Math.round(W / (180 * cm)) + 1);
    for (var p = 0; p < posts; p++) {
      var x = -W / 2 + p * (W - 8 * cm) / (posts - 1) + 4 * cm;
      M.box(x - 4 * cm, x + 4 * cm, -4 * cm, 4 * cm, 0, H + 6 * cm, paint);
      M.box(x - 5 * cm, x + 5 * cm, -5 * cm, 5 * cm, H + 6 * cm, H + 9 * cm, paint, 1 * cm);
    }
    [H * 0.25, H * 0.75].forEach(function (z) { M.box(-W / 2, W / 2, -1 * cm, 2 * cm, z - 4 * cm, z + 4 * cm, paint); });
    for (var x = -W / 2 + 6 * cm; x < W / 2 - 6 * cm; x += 12 * cm) {   // pickets, pointed
      M.box(x - 4 * cm, x + 4 * cm, 2 * cm, 4 * cm, 2 * cm, H - 6 * cm, paint);
      M.quad(paint, [x - 4 * cm, 3 * cm, H - 6 * cm], [x + 4 * cm, 3 * cm, H - 6 * cm], [x, 3 * cm, H], [x, 3 * cm, H], [0, 1, 0]);
    }
  });
  mDef("i_pool", function (M, W, D, H, C) {
    C = mPick(C, "#4fa3c7", "#d9d3c7");
    var edge = Math.min(30 * cm, W * 0.06), coping = M.mat("stone", C.frame), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
    M.box(x0, x1, y0, y0 + edge, 0, 3 * cm, coping, 0.8 * cm);
    M.box(x0, x1, y1 - edge, y1, 0, 3 * cm, coping, 0.8 * cm);
    M.box(x0, x0 + edge, y0 + edge, y1 - edge, 0, 3 * cm, coping, 0.8 * cm);
    M.box(x1 - edge, x1, y0 + edge, y1 - edge, 0, 3 * cm, coping, 0.8 * cm);
    M.box(x0 + edge, x1 - edge, y0 + edge, y1 - edge, 0, 0.5 * cm, M.mat("water", C.main));
    var lx = x1 - edge - 18 * cm, chrome = M.mat("chrome", "#dfe3e8");   // the ladder in, at the deep end
    [y0 + edge + D * 0.18, y0 + edge + D * 0.18 + 45 * cm].forEach(function (y) {
      M.tube([lx + 20 * cm, y, 3 * cm], [lx + 20 * cm, y, 85 * cm], 1.4 * cm, chrome, 8);
      M.tube([lx + 20 * cm, y, 85 * cm], [lx + 4 * cm, y, 85 * cm], 1.4 * cm, chrome, 8);
      M.tube([lx + 4 * cm, y, 85 * cm], [lx + 4 * cm, y, 0.5 * cm], 1.4 * cm, chrome, 8);
    });
  });
  mDef("i_parked", function (M, W, D, H, C) {
    C = mPick(C, "#3f5f8a", "#1b1d20");
    // along y, its nose at -y as the plan draws it; 4.5 m long here, more or less
    var paint = M.mat("metal", C.main), glass = M.mat("screen", "#1c2632"), tire = M.mat("rubber", "#141414"), rim = M.mat("chrome", "#c9ced3");
    var w = W * 0.78, y0 = -D / 2 + 2 * cm, y1 = D / 2 - 2 * cm, body = H * 0.5, R = Math.min(H * 0.24, 34 * cm);
    M.box(-w / 2, w / 2, y0, y1, R * 0.55, body, paint, 12 * cm);
    // the cabin: tapering in toward the roof
    var c0 = y0 + D * 0.3, c1 = y1 - D * 0.18, roofIn = w * 0.08;
    M.push();
    var low = body - 2 * cm, top = H;
    var P = [[-w / 2 + 3 * cm, c0, low], [w / 2 - 3 * cm, c0, low], [w / 2 - 3 * cm, c1, low], [-w / 2 + 3 * cm, c1, low],
             [-w / 2 + 3 * cm + roofIn, c0 + D * 0.12, top], [w / 2 - 3 * cm - roofIn, c0 + D * 0.12, top],
             [w / 2 - 3 * cm - roofIn, c1 - D * 0.07, top], [-w / 2 + 3 * cm + roofIn, c1 - D * 0.07, top]];
    M.quad(paint, P[4], P[5], P[6], P[7], [0, 0, 1]);
    M.quad(glass, P[0], P[1], P[5], P[4]);
    M.quad(glass, P[3], P[2], P[6], P[7]);
    M.quad(glass, P[0], P[4], P[7], P[3]);
    M.quad(glass, P[1], P[2], P[6], P[5]);
    M.pop();
    [[-1, y0 + D * 0.2], [1, y0 + D * 0.2], [-1, y1 - D * 0.18], [1, y1 - D * 0.18]].forEach(function (wh) {
      M.push().move(wh[0] * (w / 2 - 6 * cm), wh[1], R).tiltY(90);
      M.cyl(0, 0, -12 * cm, 12 * cm, R, tire, { seg: 18 });
      M.cyl(0, 0, wh[0] * 12.2 * cm, wh[0] * 12.4 * cm, R * 0.6, rim, { seg: 16 });
      M.pop();
    });
    [-1, 1].forEach(function (s) {
      M.box(s * w * 0.32 - 8 * cm, s * w * 0.32 + 8 * cm, y0 - 0.5 * cm, y0 + 1 * cm, body - 14 * cm, body - 6 * cm, M.mat("glow", "#fff6e0"));
      M.box(s * w * 0.34 - 8 * cm, s * w * 0.34 + 8 * cm, y1 - 1 * cm, y1 + 0.5 * cm, body - 14 * cm, body - 6 * cm, M.mat("glow", "#e0453a"));
    });
  });

  // ============================================================ more of it ==
  // The pieces added with the second lot of icons (03-icon-art.js).
  // A hollow made of a shape: its outside from the floor up, a rim, its
  // inside down to a floor `deep` below the rim -- a bath, a basin.
  function mHollow(M, outer, inner, H, deep, m) {
    M.prism(outer, 0, H, m, true);
    for (var i = 0; i < outer.length; i++) {
      var a = outer[i], b = outer[(i + 1) % outer.length], c = inner[(i + 1) % inner.length], d = inner[i];
      M.quad(m, [a[0], a[1], H], [b[0], b[1], H], [c[0], c[1], H], [d[0], d[1], H], [0, 0, 1]);
      M.quad(m, [d[0], d[1], H - deep], [c[0], c[1], H - deep], [c[0], c[1], H], [d[0], d[1], H]);
    }
    var cx = 0, cy = 0;
    inner.forEach(function (p) { cx += p[0] / inner.length; cy += p[1] / inner.length; });
    for (var k = 0; k < inner.length; k++) {
      var p = inner[k], q = inner[(k + 1) % inner.length];
      M.tri(m, [cx, cy, H - deep], [p[0], p[1], H - deep], [q[0], q[1], H - deep], [0, 0, 1], [0, 0, 1], [0, 0, 1]);
    }
  }
  mDef("i_consoletable", function (M, W, D, H, C) {
    C = mPick(C, "#a87c52", "#2f3236");
    var wood = M.mat("wood", C.main), met = M.mat("metal", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 3 * cm, H, wood, 0.6 * cm);
    M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, -D / 2 + 2 * cm, D / 2 - 2 * cm, 14 * cm, 16 * cm, wood, 0.4 * cm);
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 1.5 * cm, 0, H - 3 * cm, 1 * cm, met, false);
    M.lathe(W * 0.25, 0, [[3 * cm, H], [5 * cm, H + 8 * cm], [2 * cm, H + 20 * cm], [2.6 * cm, H + 22 * cm]], M.mat("ceramic", "#e8e2d6"), { seg: 14 });
  });
  mDef("i_sideboard", function (M, W, D, H, C) {
    C = mPick(C, "#8a6240", "#c8a35a");
    var wood = M.mat("wood", C.main), y1 = D / 2 - 1.5 * cm;
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 4 * cm, 0, 14 * cm, 1.4 * cm, wood, true, true);
    M.box(-W / 2, W / 2, -D / 2, y1, 14 * cm, H, wood, 0.6 * cm);
    mFronts(M, -W / 2 + 1 * cm, W / 2 - 1 * cm, y1, 15 * cm, H - 2 * cm, 1, 3, wood, M.mat("metal", C.frame), { doors: true });
  });
  mDef("i_chaise", function (M, W, D, H, C) {
    C = mPick(C, "#b49a7a", "#4b3627");
    var fab = M.mat("fabric", C.main), y0 = -D / 2, y1 = D / 2, x0 = -W / 2, x1 = W / 2, seatZ = 42 * cm, arm = 9 / 60 * W;
    mLegs(M, x0, x1, y0, y1, 3 * cm, 0, 9 * cm, 1.5 * cm, M.mat("wood", C.frame), true, true);
    M.box(x0, x1, y0, y1, 8 * cm, seatZ - 10 * cm, fab, 3 * cm);
    M.box(x0, x0 + arm, y0, y0 + D * 0.62, 8 * cm, seatZ + 20 * cm, fab, 4 * cm);
    M.box(x0 + arm - 1, x1, y0 + 6 * cm, y1, seatZ - 11 * cm, seatZ, fab, 4.5 * cm);
    M.push().move(0, y0 + 0.2 * D, seatZ - 4 * cm).tiltX(25);          // the back, reclined toward its end
    M.box(x0 + arm, x1, -18 * cm, 0, 0, H - seatZ + 30 * cm, fab, 5 * cm);
    M.pop();
  });
  mDef("i_rocker", function (M, W, D, H, C) {
    C = mPick(C, "#b98a5a", "#c9b8a0");
    var wood = M.mat("wood", C.main), seatZ = 44 * cm, x0 = -W / 2 + 5 / 60 * W, x1 = W / 2 - 5 / 60 * W;
    [x0, x1].forEach(function (x) {      // the rockers: bows along the floor
      var last = null;
      for (var i = 0; i <= 10; i++) {
        var t = i / 10, y = -D / 2 + t * D, z = 2 * cm + Math.pow(2 * t - 1, 2) * 9 * cm;
        if (last) { M.tube(last, [x, y, z], 1.4 * cm, wood, 6); }
        last = [x, y, z];
      }
      [-D * 0.25, D * 0.22].forEach(function (y) { M.tube([x, y, 3 * cm], [x, y, seatZ - 2 * cm], 1.4 * cm, wood, 6); });
      M.tube([x, -D * 0.25, seatZ + 20 * cm], [x, D * 0.24, seatZ + 20 * cm], 1.6 * cm, wood, 6);
      M.tube([x, D * 0.22, seatZ - 2 * cm], [x, D * 0.24, seatZ + 20 * cm], 1.2 * cm, wood, 6);
    });
    M.box(x0 - 1 * cm, x1 + 1 * cm, -D * 0.3, D * 0.26, seatZ - 3 * cm, seatZ, wood, 0.8 * cm);
    M.box(x0 + 1 * cm, x1 - 1 * cm, -D * 0.28, D * 0.24, seatZ, seatZ + 5 * cm, M.mat("fabric", C.frame), 2 * cm);
    M.push().move(0, -D * 0.28, seatZ).tiltX(16);
    [x0, x1].forEach(function (x) { M.box(x - 1.4 * cm, x + 1.4 * cm, -1.4 * cm, 1.4 * cm, 0, H - seatZ + 8 * cm, wood); });
    for (var s = 0; s < 5; s++) {
      var sx = x0 + (s + 1) * (x1 - x0) / 6;
      M.box(sx - 1.6 * cm, sx + 1.6 * cm, -0.8 * cm, 0.8 * cm, 6 * cm, H - seatZ, wood);
    }
    M.box(x0, x1, -1.6 * cm, 1.6 * cm, H - seatZ, H - seatZ + 7 * cm, wood, 1 * cm);
    M.pop();
  });
  mDef("i_hutch", function (M, W, D, H, C) {
    C = mPick(C, "#f0ece4", "#a7adb3");
    var body = M.mat("wood", C.main), y1 = D / 2 - 1.5 * cm, low = H * 0.45, rnd = mRand(Math.round(W));
    var z = mCarcass(M, -W / 2, W / 2, -D / 2, y1, 0, low, body, 8 * cm);
    mFronts(M, -W / 2 + 1 * cm, W / 2 - 1 * cm, y1, z + 1 * cm, low - 1 * cm, 1, 2, body, M.mat("metal", C.frame), { doors: true, high: true });
    M.box(-W / 2 - 1 * cm, W / 2 + 1 * cm, -D / 2, D / 2, low, low + 3 * cm, body, 0.5 * cm);
    // the glass cabinet over, its shelves of plates
    var up0 = low + 3 * cm, up1 = H - 4 * cm, bd = -D / 2 + D * 0.55;
    M.box(-W / 2 + 1 * cm, -W / 2 + 3 * cm, -D / 2, bd, up0, up1, body);
    M.box(W / 2 - 3 * cm, W / 2 - 1 * cm, -D / 2, bd, up0, up1, body);
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -D / 2, -D / 2 + 1 * cm, up0, up1, body);
    M.box(-W / 2, W / 2, -D / 2, bd + 1 * cm, up1, H, body, 0.6 * cm);
    for (var k = 1; k <= 2; k++) {
      var sz = up0 + k * (up1 - up0) / 3;
      M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, -D / 2 + 1 * cm, bd, sz, sz + 1.5 * cm, body);
      for (var x = -W / 2 + 10 * cm; x < W / 2 - 8 * cm; x += 9 * cm) {
        M.push().move(x, -D / 2 + 4 * cm, sz + 1.5 * cm).tiltX(-75);
        M.cyl(0, 0, 0, 0.8 * cm, 9 * cm, M.mat("ceramic", rnd() < 0.5 ? "#f4f2ec" : "#9fb4c8"), { seg: 16 });
        M.pop();
      }
    }
    M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, bd, bd + 0.5 * cm, up0, up1, M.mat("glass", "#dbeaf0"));
  });
  mDef("i_barcart", function (M, W, D, H, C) {
    C = mPick(C, "#c8a35a", "#2f3236");
    var brass = M.mat("metal", C.main), glass = M.mat("glass", "#cfe0e6");
    [[-W / 2 + 2 * cm, -D / 2 + 2 * cm], [W / 2 - 2 * cm, -D / 2 + 2 * cm], [W / 2 - 2 * cm, D / 2 - 2 * cm], [-W / 2 + 2 * cm, D / 2 - 2 * cm]].forEach(function (p) {
      M.cyl(p[0], p[1], 6 * cm, H, 1 * cm, brass, { seg: 8 });
      M.push().move(p[0], p[1], 5 * cm).tiltY(90);
      M.cyl(0, 0, -1.5 * cm, 1.5 * cm, 5 * cm, M.mat("rubber", "#1d1f22"), { seg: 12 });
      M.pop();
    });
    [20 * cm, H - 6 * cm].forEach(function (z) {
      M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -D / 2 + 1 * cm, D / 2 - 1 * cm, z, z + 1 * cm, glass);
      M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -D / 2 + 0.5 * cm, -D / 2 + 1.5 * cm, z, z + 3 * cm, brass);
      M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, D / 2 - 1.5 * cm, D / 2 - 0.5 * cm, z, z + 3 * cm, brass);
    });
    M.tube([-W / 2 - 2 * cm, -D / 2 + 4 * cm, H + 2 * cm], [-W / 2 - 2 * cm, D / 2 - 4 * cm, H + 2 * cm], 1 * cm, brass, 8);
    [["#2e4a2a", -0.25], ["#6e2a2a", -0.1], ["#c9b48a", 0.08]].forEach(function (b) {
      M.lathe(b[1] * W, -D * 0.05, [[3.5 * cm, H - 5 * cm], [3.6 * cm, H + 18 * cm], [1.2 * cm, H + 24 * cm], [1.1 * cm, H + 30 * cm]],
              M.mat("glass", b[0]), { seg: 12 });
    });
    [0.25, 0.35].forEach(function (k) { M.lathe(k * W, D * 0.1, [[2.5 * cm, H - 5 * cm], [3.5 * cm, H + 4 * cm]], glass, { seg: 12 }); });
  });
  mDef("i_highchair", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#b98a5a");
    var wood = M.mat("wood", C.frame), body = M.mat("plastic", C.main), seatZ = H * 0.62;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
      M.tube([s[0] * W * 0.45, s[1] * D * 0.45, 0], [s[0] * W * 0.25, s[1] * D * 0.18, seatZ], 1.4 * cm, wood, 6);
    });
    M.box(-W * 0.32, W * 0.32, -D * 0.3, D * 0.22, seatZ, seatZ + 3 * cm, body, 1.5 * cm);
    M.push().move(0, -D * 0.28, seatZ).tiltX(10);
    M.box(-W * 0.32, W * 0.32, -2 * cm, 1 * cm, 0, H - seatZ, body, 2 * cm);
    M.pop();
    M.box(-W * 0.42, W * 0.42, D * 0.18, D * 0.48, seatZ + 18 * cm, seatZ + 21 * cm, body, 1.4 * cm);   // the tray
    [-1, 1].forEach(function (s) { M.box(s * W * 0.32 - 1 * cm, s * W * 0.32 + 1 * cm, -D * 0.28, D * 0.2, seatZ + 3 * cm, seatZ + 18 * cm, body); });
  });
  mDef("i_daybed", function (M, W, D, H, C) {
    C = mPick(C, "#d8d2c4", "#6e4a32");
    var frame = M.mat("wood", C.frame), x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2, mat = 42 * cm;
    mLegs(M, x0, x1, y0, y1, 2 * cm, 0, 12 * cm, 1.6 * cm, frame, false);
    M.box(x0, x1, y0, y1, 12 * cm, 22 * cm, frame, 0.6 * cm);
    M.box(x0, x1, y0, y0 + 8 / 45 * D, 12 * cm, H, frame, 1 * cm);                   // the back
    M.box(x0, x0 + 8 / 100 * W, y0, y1, 12 * cm, H - 12 * cm, frame, 1 * cm);       // and an arm each end
    M.box(x1 - 8 / 100 * W, x1, y0, y1, 12 * cm, H - 12 * cm, frame, 1 * cm);
    M.box(x0 + 8 / 100 * W, x1 - 8 / 100 * W, y0 + 8 / 45 * D, y1 - 1 * cm, 22 * cm, mat, M.mat("linen", C.main), 5 * cm);
    [-0.25, 0.25].forEach(function (k) {
      M.push().move(k * W, y0 + 8 / 45 * D + 6 * cm, mat - 1 * cm).tiltX(18);
      M.box(-W * 0.11, W * 0.11, -5 * cm, 5 * cm, 0, 30 * cm, M.mat("fabric", mShade(C.main, -0.2)), 5 * cm);
      M.pop();
    });
  });
  mDef("i_floormirror", function (M, W, D, H, C) {
    C = mPick(C, "#dfe6ea", "#2f3236");
    M.push().move(0, -D / 2 + 2 * cm, 0).tiltX(6);
    M.box(-W / 2, W / 2, -1.5 * cm, 1.5 * cm, 0, H, M.mat("metal", C.frame), 0.8 * cm);
    M.box(-W / 2 + 2.5 * cm, W / 2 - 2.5 * cm, 1.5 * cm, 1.7 * cm, 2.5 * cm, H - 2.5 * cm, M.mat("chrome", C.main));
    M.pop();
  });
  mDef("i_toybox", function (M, W, D, H, C) {
    C = mPick(C, "#7fa7c9", "#f2c94c");
    var body = M.mat("plastic", C.main);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.75, body, 2 * cm);
    M.box(-W / 2 - 0.5 * cm, W / 2 + 0.5 * cm, -D / 2 - 0.5 * cm, D / 2 + 0.5 * cm, H * 0.75, H, M.mat("plastic", C.frame), 2.5 * cm);
    M.ball(-W * 0.18, D / 2 + 0.2 * cm, H * 0.4, 6 * cm, 0.6 * cm, 6 * cm, M.mat("plastic", "#e46b6b"), { seg: 6 });
    M.box(W * 0.12, W * 0.3, D / 2, D / 2 + 0.6 * cm, H * 0.28, H * 0.52, M.mat("plastic", "#5c8a4a"), 1 * cm);
  });
  mDef("i_standdesk", function (M, W, D, H, C) {
    C = mPick(C, "#e9e6df", "#2b2d31");
    var top = M.mat("wood", C.main), met = M.mat("metal", C.frame);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 2.5 * cm, H, top, 0.6 * cm);
    [-W / 2 + 7 / 70 * W, W / 2 - 7 / 70 * W].forEach(function (x) {
      M.box(x - 3 * cm, x + 3 * cm, -2.5 * cm, 2.5 * cm, 2 * cm, H - 2.5 * cm, met, 0.5 * cm);
      M.box(x - 3 * cm, x + 3 * cm, -D / 2 + 2 * cm, D / 2 - 2 * cm, 0, 2.5 * cm, met, 0.8 * cm);
    });
    M.box(-W / 2 + 7 / 70 * W, W / 2 - 7 / 70 * W, -2 * cm, 2 * cm, H - 8 * cm, H - 2.5 * cm, met);
    mScreen(M, -W * 0.18, W * 0.18, -D / 2 + 5 * cm, -D / 2 + 7.5 * cm, H + 12 * cm, H + 12 * cm + W * 0.2);
    M.box(-2 * cm, 2 * cm, -D / 2 + 3 * cm, -D / 2 + 6 * cm, H, H + 13 * cm, met);
    M.box(-W * 0.2, W * 0.2, -D * 0.02, D * 0.2, H, H + 1.5 * cm, M.mat("plastic", "#2b2d31"), 0.5 * cm);
  });
  mDef("i_lshapedesk", function (M, W, D, H, C) {
    C = mPick(C, "#c29a6b", "#2b2d31");
    var top = M.mat("wood", C.main), met = M.mat("metal", C.frame), a = 35 / 90 * D, b = 35 / 90 * W;
    M.box(-W / 2, W / 2, -D / 2, -D / 2 + a, H - 3 * cm, H, top, 0.6 * cm);
    M.box(-W / 2, -W / 2 + b, -D / 2 + a - 1, D / 2, H - 3 * cm, H, top, 0.6 * cm);
    [[W / 2 - 3 * cm, -D / 2 + 3 * cm], [W / 2 - 3 * cm, -D / 2 + a - 3 * cm], [-W / 2 + 3 * cm, D / 2 - 3 * cm],
     [-W / 2 + b - 3 * cm, D / 2 - 3 * cm], [-W / 2 + 3 * cm, -D / 2 + 3 * cm]].forEach(function (p) {
      M.box(p[0] - 2 * cm, p[0] + 2 * cm, p[1] - 2 * cm, p[1] + 2 * cm, 0, H - 3 * cm, met);
    });
    var sx = -W / 2 + 44 / 90 * W;
    mScreen(M, sx - 26 * cm, sx + 26 * cm, -D / 2 + 6 * cm, -D / 2 + 8.5 * cm, H + 10 * cm, H + 40 * cm);
    M.box(sx - 2 * cm, sx + 2 * cm, -D / 2 + 4 * cm, -D / 2 + 7 * cm, H, H + 11 * cm, met);
  });
  mDef("i_oven", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#c9cdd1");
    var body = M.mat("plastic", C.main), y1 = D / 2 - 2 * cm, steel = M.mat("metal", C.frame);
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, body, 0.4 * cm);
    [[0.32, 0.6], [0.62, 0.9]].forEach(function (b) {
      var z0 = H * b[0], z1 = H * b[1];
      M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, y1, y1 + 1.5 * cm, z0, z1, steel, 0.4 * cm);
      M.box(-W / 2 + 7 * cm, W / 2 - 7 * cm, y1 + 1.5 * cm, y1 + 1.7 * cm, z0 + 4 * cm, z1 - 9 * cm, M.mat("screen", "#14161a"));
      M.tube([-W * 0.36, y1 + 4.5 * cm, z1 - 5 * cm], [W * 0.36, y1 + 4.5 * cm, z1 - 5 * cm], 0.9 * cm, M.mat("chrome", "#dfe3e8"), 8);
    });
    mFronts(M, -W / 2 + 0.5 * cm, W / 2 - 0.5 * cm, y1, 10 * cm, H * 0.3, 2, 1, body, M.mat("chrome", "#c9ced3"));
    mFronts(M, -W / 2 + 0.5 * cm, W / 2 - 0.5 * cm, y1, H * 0.92, H - 1 * cm, 1, 1, body, M.mat("chrome", "#c9ced3"), { doors: true, low: true });
  });
  mDef("i_winecooler", function (M, W, D, H, C) {
    C = mPick(C, "#1d1f22", "#c9cdd1");
    var y1 = D / 2 - 1 * cm, rnd = mRand(Math.round(W * 7));
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, M.mat("metal", C.main), 0.6 * cm);
    for (var r = 0; r < 4; r++) {
      for (var b = 0; b < 4; b++) {
        var x = -W * 0.3 + b * W * 0.2, z = 10 * cm + r * (H - 20 * cm) / 4 + 5 * cm;
        M.push().move(x, y1 - 1 * cm, z).tiltX(-90);
        M.cyl(0, 0, -D * 0.5, 0, 3.6 * cm, M.mat("glass", ["#2e4a2a", "#6e2a2a", "#c9b48a"][Math.floor(rnd() * 3)]), { seg: 10 });
        M.pop();
      }
    }
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y1, y1 + 1.5 * cm, 8 * cm, H - 2 * cm, M.mat("glass", "#2a3a44"));
    M.box(W / 2 - 6 * cm, W / 2 - 4 * cm, y1 + 1.5 * cm, y1 + 3.5 * cm, H * 0.3, H * 0.8, M.mat("chrome", C.frame));
  });
  mDef("i_freezer", function (M, W, D, H, C) {
    C = mPick(C, "#f4f4f2", "#c9cdd1");
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H - 4 * cm, M.mat("plastic", C.main), 2 * cm);
    M.box(-W / 2, W / 2, -D / 2, D / 2 + 1 * cm, H - 4 * cm, H, M.mat("plastic", C.main), 1.5 * cm);
    M.box(-W * 0.2, W * 0.2, D / 2 + 1 * cm, D / 2 + 3 * cm, H - 6 * cm, H - 3 * cm, M.mat("chrome", C.frame), 0.8 * cm);
  });
  mDef("i_cornertub", function (M, W, D, H, C) {
    C = mPick(C, "#f6f6f3", "#dfe3e8");
    var sx = W / 75, sy = D / 75, out = [], inn = [];
    function shape(list, t) {          // the drawing's outline: square at the corner, curved across from it
      list.push([0 + t, 0 + t], [75 - t, 0 + t], [75 - t, 30]);
      for (var i = 1; i < 8; i++) { var a = i / 8 * Math.PI / 2; list.push([30 + (45 - t) * Math.cos(a), 30 + (45 - t) * Math.sin(a)]); }
      list.push([30, 75 - t], [0 + t, 75 - t]);
    }
    shape(out, 0); shape(inn, 7);
    function loc(p) { return [p[0] * sx - W / 2, p[1] * sy - D / 2]; }
    mHollow(M, out.map(loc), inn.map(loc), H, H - 10 * cm, M.mat("ceramic", C.main));
    var tap = M.mat("chrome", C.frame);
    M.cyl(-W / 2 + 10 * sx, -D / 2 + 10 * sy, H, H + 4 * cm, 1.8 * cm, tap, { seg: 10 });
    M.tube([-W / 2 + 10 * sx, -D / 2 + 10 * sy, H + 3.5 * cm], [-W / 2 + 18 * sx, -D / 2 + 18 * sy, H + 3.5 * cm], 1.2 * cm, tap, 8);
  });
  mDef("i_linencab", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#c9ced3");
    var body = M.mat("plastic", C.main), y1 = D / 2 - 1.5 * cm;
    var z = mCarcass(M, -W / 2, W / 2, -D / 2, y1, 0, H, body, 6 * cm);
    mFronts(M, -W / 2 + 0.5 * cm, W / 2 - 0.5 * cm, y1, z + 0.5 * cm, H - 0.5 * cm, 1, 2, body, M.mat("chrome", C.frame), { doors: true });
  });
  mDef("i_whiteboard", function (M, W, D, H, C) {
    C = mPick(C, "#fbfbf9", "#a7adb3");
    var y0 = -D / 2;
    M.box(-W / 2, W / 2, y0, y0 + 2 * cm, 0, H, M.mat("metal", C.frame), 0.6 * cm);
    M.box(-W / 2 + 1.5 * cm, W / 2 - 1.5 * cm, y0 + 2 * cm, y0 + 2.1 * cm, 1.5 * cm, H - 1.5 * cm, M.mat("ceramic", C.main));
    M.box(-W * 0.3, W * 0.3, y0 + 2 * cm, y0 + 6 * cm, -1 * cm, 1 * cm, M.mat("metal", C.frame));
    [["#2f6fd6", 0.22], ["#c7372f", 0.1], ["#2f2f2f", -0.02]].forEach(function (s, k) {
      M.box(-W * 0.35 + k * 4 * cm, -W * 0.35 + k * 4 * cm + W * (0.25 + s[1]), y0 + 2.1 * cm, y0 + 2.2 * cm, H * (0.72 - k * 0.12), H * (0.72 - k * 0.12) + 0.6 * cm, M.mat("plastic", s[0]));
    });
  });
  mDef("i_dartboard", function (M, W, D, H, C) {
    var R = Math.min(W, H) / 2;
    M.push().move(0, -D / 2, H / 2).tiltX(-90);
    M.cyl(0, 0, 0, 3.5 * cm, R, M.mat("plastic", "#1b1c1e"), { seg: 32 });
    [[0.82, "#c7372f"], [0.75, "#ece4cf"], [0.5, "#1b1c1e"], [0.45, "#3d7a3f"], [0.4, "#ece4cf"], [0.12, "#3d7a3f"], [0.06, "#c7372f"]].forEach(function (r, k) {
      M.cyl(0, 0, 3.5 * cm + k * 0.02 * cm, 3.52 * cm + k * 0.02 * cm, R * r[0], M.mat("fabric", r[1]), { seg: 32 });
    });
    M.pop();
  });
  mDef("i_evcharger", function (M, W, D, H, C) {
    C = mPick(C, "#f2f2f0", "#2f6fd6");
    var y0 = -D / 2;
    M.box(-W / 2, W / 2, y0, y0 + D * 0.7, H * 0.4, H, M.mat("plastic", C.main), 2 * cm);
    M.push().move(0, y0 + D * 0.7, H * 0.75).tiltX(-90);
    M.lathe(0, 0, [[4 * cm, 0], [4 * cm, 0.3 * cm], [3 * cm, 0.3 * cm]], M.mat("glow", C.frame), { seg: 20 });
    M.pop();
    for (var i = 0; i < 4; i++) {        // its cable, coiled under it
      var r = 9 * cm, z = H * 0.4 - 4 * cm - i * 1.2 * cm, last = null;
      for (var k = 0; k <= 12; k++) {
        var a = k / 12 * Math.PI * 2, p = [Math.cos(a) * r, y0 + 5 * cm + Math.sin(a) * 2 * cm, z - Math.abs(Math.sin(a)) * r * 0.9];
        if (last) { M.tube(last, p, 0.8 * cm, M.mat("rubber", "#1d1f22"), 5); }
        last = p;
      }
    }
  });
  // ----------------------------------------------------------- fitness, play --
  mDef("i_treadmill", function (M, W, D, H, C) {
    C = mPick(C, "#2b2d31", "#9ea3a8");
    var body = M.mat("plastic", C.main), met = M.mat("metal", C.frame), deck = 18 * cm, x0 = -W / 2, x1 = W / 2;
    M.box(x0 + 4 * cm, x1 - 4 * cm, -D / 2 + 14 / 95 * D, D / 2, 4 * cm, deck - 3 * cm, body, 2 * cm);
    M.box(x0 + 7 / 45 * W, x1 - 7 / 45 * W, -D / 2 + 22 / 95 * D, D / 2 - 3 * cm, deck - 3 * cm, deck - 2 * cm, M.mat("rubber", "#1b1b1b"));
    [x0 + 3 * cm, x1 - 3 * cm].forEach(function (x) {
      M.box(x - 3 * cm, x + 3 * cm, -D / 2 + 14 / 95 * D, D / 2, 4 * cm, deck, body, 1 * cm);
      M.tube([x, -D / 2 + 12 / 95 * D, deck], [x, -D / 2 + 6 / 95 * D, H - 15 * cm], 2.4 * cm, met, 8);
      M.tube([x, -D / 2 + 8 / 95 * D, H - 26 * cm], [x, -D / 2 + D * 0.38, H - 32 * cm], 1.4 * cm, met, 8);
    });
    M.box(x0 + 2 * cm, x1 - 2 * cm, -D / 2, -D / 2 + 14 / 95 * D, H - 18 * cm, H, body, 3 * cm);   // the console
    M.box(x0 + 8 * cm, x1 - 8 * cm, -D / 2 + 14 / 95 * D - 0.2 * cm, -D / 2 + 14 / 95 * D, H - 14 * cm, H - 4 * cm, M.mat("screen", "#16202a"));
  });
  mDef("i_exbike", function (M, W, D, H, C) {
    C = mPick(C, "#2b2d31", "#c7372f");
    var body = M.mat("plastic", C.main), met = M.mat("metal", "#9ea3a8");
    [-D / 2 + 6 * cm, D / 2 - 6 * cm].forEach(function (y) { M.box(-W / 2, W / 2, y - 3 * cm, y + 3 * cm, 0, 4 * cm, body, 1.5 * cm); });
    M.tube([0, D / 2 - 6 * cm, 3 * cm], [0, -D / 2 + 8 * cm, 3 * cm], 2.4 * cm, met, 8);
    M.push().move(0, -D * 0.12, 30 * cm).tiltY(90);
    M.cyl(0, 0, -3 * cm, 3 * cm, 24 * cm, M.mat("plastic", C.frame), { seg: 24 });
    M.pop();
    M.tube([0, D * 0.18, 3 * cm], [0, D * 0.3, H * 0.66], 2.4 * cm, met, 8);            // up to the saddle
    M.box(-8 * cm, 8 * cm, D * 0.24, D * 0.42, H * 0.66, H * 0.7, M.mat("leather", "#1b1b1b"), 3 * cm);
    M.tube([0, -D * 0.12, 30 * cm], [0, -D * 0.36, H - 10 * cm], 2.4 * cm, met, 8);      // up to the bars
    M.tube([-W / 2 + 1 * cm, -D * 0.38, H - 6 * cm], [W / 2 - 1 * cm, -D * 0.38, H - 6 * cm], 1.4 * cm, M.mat("rubber", "#1b1b1b"), 8);
    M.box(-7 * cm, 7 * cm, -D * 0.45, -D * 0.38, H - 14 * cm, H, body, 2 * cm);
  });
  mDef("i_weightbench", function (M, W, D, H, C) {
    C = mPick(C, "#1b1b1b", "#9ea3a8");
    var met = M.mat("metal", C.frame), pad = M.mat("leather", C.main);
    M.box(-W / 2 + 6 / 30 * W, W / 2 - 6 / 30 * W, -D / 2 + 12 / 60 * D, D / 2, H - 7 * cm, H, pad, 3 * cm);
    [-D / 2 + 16 / 60 * D, D / 2 - 6 * cm].forEach(function (y) {
      M.box(-3 * cm, 3 * cm, y - 3 * cm, y + 3 * cm, 0, H - 7 * cm, met);
      M.box(-W * 0.32, W * 0.32, y - 3 * cm, y + 3 * cm, 0, 4 * cm, met, 1 * cm);
    });
    [-W / 2 + 2 * cm, W / 2 - 2 * cm].forEach(function (x) { M.box(x - 2 * cm, x + 2 * cm, -D / 2 + 3 * cm, -D / 2 + 7 * cm, 0, H + 55 * cm, met); });
    var bar = H + 50 * cm;
    M.tube([-W / 2 - 25 * cm, -D / 2 + 7 / 60 * D, bar], [W / 2 + 25 * cm, -D / 2 + 7 / 60 * D, bar], 1.4 * cm, M.mat("chrome", "#dfe3e8"), 8);
    [-1, 1].forEach(function (s) {
      M.push().move(s * (W / 2 + 14 * cm), -D / 2 + 7 / 60 * D, bar).tiltY(90);
      M.cyl(0, 0, -3 * cm, 3 * cm, 22 * cm, M.mat("rubber", "#1b1b1b"), { seg: 20 });
      M.pop();
    });
  });
  mDef("i_yogamat", function (M, W, D, H, C) {
    C = mPick(C, "#6f8fae");
    var m = M.mat("rubber", C.main), t = 0.6 * cm;
    M.box(-W / 2, W / 2, -D / 2 + 9 / 90 * D, D / 2, 0, t, m, 0.25 * cm);
    M.push().move(0, -D / 2 + 4.5 / 90 * D, 4.5 / 90 * D).tiltY(90);
    M.cyl(0, 0, -W / 2, W / 2, 4.5 / 90 * D, m, { seg: 16 });
    M.pop();
  });
  mDef("i_pooltable", function (M, W, D, H, C) {
    C = mPick(C, "#2f6a46", "#5a3a26");
    var wood = M.mat("wood", C.frame), felt = M.mat("fabric", C.main), rail = 6 / 60 * W;
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 5 * cm, 0, H - 18 * cm, 5 * cm, wood, false);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 18 * cm, H - 6 * cm, wood, 1.2 * cm);
    M.box(-W / 2 + rail, W / 2 - rail, -D / 2 + rail, D / 2 - rail, H - 6 * cm, H - 4 * cm, felt);
    [[-W / 2, -W / 2 + rail, -D / 2, D / 2], [W / 2 - rail, W / 2, -D / 2, D / 2], [-W / 2, W / 2, -D / 2, -D / 2 + rail], [-W / 2, W / 2, D / 2 - rail, D / 2]]
      .forEach(function (r) { M.box(r[0], r[1], r[2], r[3], H - 6 * cm, H, wood, 1 * cm); });
    [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]].forEach(function (p) {
      M.cyl(p[0] * (W / 2 - rail), p[1] * (D / 2 - rail), H - 4.2 * cm, H - 4 * cm, 3.4 * cm, M.mat("rubber", "#111111"), { seg: 14 });
    });
    var balls = [["#f4f2ec", 0, -0.22], ["#f2c94c", 0, 0.2], ["#c7372f", -0.04, 0.24], ["#2f4f8f", 0.04, 0.24], ["#111111", 0, 0.28],
                 ["#3d7a3f", -0.08, 0.28], ["#6a4c7a", 0.08, 0.28]];
    balls.forEach(function (b) { M.ball(b[1] * W, b[2] * D, H - 4 * cm + 2.8 * cm, 2.8 * cm, 2.8 * cm, 2.8 * cm, M.mat("plastic", b[0]), { seg: 6 }); });
  });
  mDef("i_pingpong", function (M, W, D, H, C) {
    C = mPick(C, "#2f4f8f", "#2f3236");
    var top = M.mat("plastic", C.main), met = M.mat("metal", C.frame);
    mLegs(M, -W / 2, W / 2, -D / 2, D / 2, 12 * cm, 0, H - 3 * cm, 2 * cm, met, false);
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 3 * cm, H, top, 0.4 * cm);
    M.box(-0.4 * cm, 0.4 * cm, -D / 2 + 1 * cm, D / 2 - 1 * cm, H, H + 0.05 * cm, M.mat("plastic", "#f4f4f2"));
    [[-W / 2 + 1 * cm, -W / 2 + 2 * cm], [W / 2 - 2 * cm, W / 2 - 1 * cm]].forEach(function (x) {
      M.box(x[0], x[1], -D / 2 + 1 * cm, D / 2 - 1 * cm, H, H + 0.05 * cm, M.mat("plastic", "#f4f4f2"));
    });
    M.box(-W / 2 - 3 * cm, W / 2 + 3 * cm, -0.3 * cm, 0.3 * cm, H, H + 15 * cm, M.mat("fabric", "#f4f4f2"));
  });
  mDef("i_easel", function (M, W, D, H, C) {
    C = mPick(C, "#b98a5a", "#f4f1ea");
    var wood = M.mat("wood", C.main);
    M.tube([-W * 0.35, D * 0.3, 0], [0, -D * 0.05, H], 1.4 * cm, wood, 6);
    M.tube([W * 0.35, D * 0.3, 0], [0, -D * 0.05, H], 1.4 * cm, wood, 6);
    M.tube([0, -D * 0.45, 0], [0, -D * 0.05, H * 0.95], 1.2 * cm, wood, 6);
    M.box(-W * 0.35, W * 0.35, D * 0.1, D * 0.2, H * 0.42, H * 0.44, wood);
    M.push().move(0, D * 0.12, H * 0.44).tiltX(14);
    M.box(-W * 0.3, W * 0.3, 0, 2 * cm, 0, H * 0.45, M.mat("linen", C.frame), 0.4 * cm);
    M.box(-W * 0.2, W * 0.15, 2 * cm, 2.1 * cm, H * 0.1, H * 0.3, M.mat("plastic", "#7fa7c9"));
    M.pop();
  });
  mDef("i_trampoline", function (M, W, D, H, C) {
    C = mPick(C, "#2f6fd6", "#9ea3a8");
    var R = Math.min(W, D) / 2, met = M.mat("metal", C.frame), seg = 24, ring = [];
    for (var i = 0; i <= seg; i++) { var a = i / seg * Math.PI * 2; ring.push([Math.cos(a) * R * 0.98, Math.sin(a) * R * 0.98, H]); }
    for (var k = 0; k < seg; k++) { M.tube(ring[k], ring[k + 1], 2 * cm, M.mat("fabric", C.main), 6); }
    for (var l = 0; l < 6; l++) {
      var b = l / 6 * Math.PI * 2;
      M.tube([Math.cos(b) * R * 0.9, Math.sin(b) * R * 0.9, 0], [Math.cos(b) * R * 0.95, Math.sin(b) * R * 0.95, H], 1.6 * cm, met, 6);
    }
    M.cyl(0, 0, H - 2 * cm, H - 1.6 * cm, R * 0.86, M.mat("rubber", "#151515"), { seg: 32 });
  });
  mDef("i_swing", function (M, W, D, H, C) {
    C = mPick(C, "#c7372f", "#3a6b4a");
    var met = M.mat("metal", C.frame), beam = H;
    [-W / 2 + 8 / 150 * W, W / 2 - 8 / 150 * W].forEach(function (x) {
      M.tube([x, -D * 0.4, 0], [x, 0, beam], 2.4 * cm, met, 8);
      M.tube([x, D * 0.4, 0], [x, 0, beam], 2.4 * cm, met, 8);
    });
    M.tube([-W / 2 + 4 * cm, 0, beam], [W / 2 - 4 * cm, 0, beam], 3 * cm, met, 10);
    [-0.17, 0.17].forEach(function (k) {
      var x = k * W, seat = 45 * cm;
      [-1, 1].forEach(function (s) { M.tube([x + s * 18 * cm, 0, beam], [x + s * 18 * cm, 0, seat], 0.5 * cm, M.mat("rubber", "#1b1b1b"), 4); });
      M.box(x - 22 * cm, x + 22 * cm, -9 * cm, 9 * cm, seat - 3 * cm, seat, M.mat("plastic", C.main), 2 * cm);
    });
  });
  // ------------------------------------------------------------- the yard --
  mDef("i_firepit", function (M, W, D, H, C) {
    C = mPick(C, "#8f8a80");
    var R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[R, 0], [R, H * 0.9], [R * 0.92, H], [R * 0.68, H], [R * 0.66, H * 0.3], [0, H * 0.3]], M.mat("stone", C.main), { seg: 28 });
    M.tube([-R * 0.4, -R * 0.1, H * 0.4], [R * 0.4, R * 0.1, H * 0.4], R * 0.08, M.mat("bark", "#5b3f2a"), 8);
    M.tube([-R * 0.2, R * 0.4, H * 0.42], [R * 0.25, -R * 0.4, H * 0.48], R * 0.07, M.mat("bark", "#5b3f2a"), 8);
    [[0, 0, 20], [-0.18, 0.1, 14], [0.18, -0.08, 15]].forEach(function (f) {
      M.lathe(f[0] * R, f[1] * R, [[R * 0.16, H * 0.4], [R * 0.1, H * 0.4 + f[2] * cm * 0.5], [0, H * 0.4 + f[2] * cm]], M.mat("glow", "#ff9a3c"), { seg: 8 });
    });
  });
  mDef("i_lounger", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#8a6240");
    var wood = M.mat("wood", C.frame), pad = M.mat("fabric", C.main), y0 = -D / 2, y1 = D / 2, bend = y0 + 32 / 100 * D;
    mLegs(M, -W / 2, W / 2, bend, y1, 3 * cm, 0, H - 8 * cm, 1.8 * cm, wood, false);
    M.box(-W / 2, W / 2, bend, y1, H - 8 * cm, H - 4 * cm, wood, 0.6 * cm);
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, bend, y1 - 1 * cm, H - 4 * cm, H + 2 * cm, pad, 2.5 * cm);
    M.push().move(0, bend, H - 6 * cm).tiltX(-55);
    M.box(-W / 2, W / 2, -(bend - y0) * 1.1, 0, 0, 4 * cm, wood, 0.6 * cm);
    M.box(-W / 2 + 1 * cm, W / 2 - 1 * cm, -(bend - y0) * 1.1, 0, 4 * cm, 10 * cm, pad, 2.5 * cm);
    M.pop();
  });
  mDef("i_gazebo", function (M, W, D, H, C) {
    C = mPick(C, "#f2f0ea", "#6f5a48");
    var R = Math.min(W, D) / 2, posts = M.mat("wood", C.main), top = H * 0.78;
    M.lathe(0, 0, [[R * 0.98, 0], [R * 0.98, 12 * cm], [0, 12 * cm]], M.mat("wood", "#a57a52"), { seg: 8, from: 22.5, to: 382.5 });
    for (var k = 0; k < 8; k++) {
      var a = (k / 8 + 1 / 16) * Math.PI * 2, x = Math.cos(a) * R * 0.92, y = Math.sin(a) * R * 0.92;
      M.box(x - 4 * cm, x + 4 * cm, y - 4 * cm, y + 4 * cm, 12 * cm, top, posts);
      var b = ((k + 1) / 8 + 1 / 16) * Math.PI * 2;
      if (k !== 2) {                      // a rail between each pair, but where you go in
        M.tube([x, y, 95 * cm], [Math.cos(b) * R * 0.92, Math.sin(b) * R * 0.92, 95 * cm], 2 * cm, posts, 6);
      }
    }
    M.lathe(0, 0, [[R * 1.08, top], [R * 1.08, top + 6 * cm], [R * 0.2, H - 10 * cm], [0, H]], M.mat("plastic", C.frame), { seg: 8, from: 22.5, to: 382.5 });
  });
  mDef("i_shed", function (M, W, D, H, C) {
    C = mPick(C, "#8c9c84", "#5d6166");
    var boards = M.mat("wood", C.main), wall = H * 0.7, y0 = -D / 2, y1 = D / 2;
    M.box(-W / 2, W / 2, y0, y1, 0, wall, boards);
    // a gable roof over, its ridge along the long way
    var roof = M.mat("plastic", C.frame), o = 8 * cm;
    M.quad(roof, [-W / 2 - o, y0 - o, wall - 4 * cm], [W / 2 + o, y0 - o, wall - 4 * cm], [W / 2 + o, 0, H], [-W / 2 - o, 0, H]);
    M.quad(roof, [-W / 2 - o, y1 + o, wall - 4 * cm], [W / 2 + o, y1 + o, wall - 4 * cm], [W / 2 + o, 0, H], [-W / 2 - o, 0, H]);
    [-W / 2, W / 2].forEach(function (x) {
      M.tri(boards, [x, y0, wall], [x, y1, wall], [x, 0, H - 2 * cm], [x < 0 ? -1 : 1, 0, 0], [x < 0 ? -1 : 1, 0, 0], [x < 0 ? -1 : 1, 0, 0]);
    });
    M.box(-W * 0.12, W * 0.12, y1, y1 + 1 * cm, 0, wall * 0.85, M.mat("wood", mShade(C.main, -0.25)), 0.4 * cm);   // the door
    M.box(W * 0.22, W * 0.4, y1, y1 + 0.5 * cm, wall * 0.45, wall * 0.75, M.mat("glass", "#bcd3de"));
  });
  mDef("i_planter", function (M, W, D, H, C, n) {
    C = mPick(C, "#8a6240", "#4f7d3a");
    var rnd = mRand((n && n.id) || 29);
    M.box(-W / 2, W / 2, -D / 2, D / 2, 0, H * 0.6, M.mat("wood", C.main), 0.6 * cm);
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, -D / 2 + 2 * cm, D / 2 - 2 * cm, H * 0.55, H * 0.58, M.mat("soil", "#4b3a2b"));
    [-0.3, 0, 0.3].forEach(function (k) { mLeaves(M, k * W, 0, H * 0.75, Math.min(D * 0.5, W * 0.16), C.frame, rnd, 4); });
  });
  mDef("i_birdbath", function (M, W, D, H, C) {
    C = mPick(C, "#c9c3b6", "#7fb5d0");
    var R = Math.min(W, D) / 2, stone = M.mat("stone", C.main);
    M.lathe(0, 0, [[R * 0.45, 0], [R * 0.4, 4 * cm], [R * 0.16, 10 * cm], [R * 0.14, H - 12 * cm], [R * 0.3, H - 8 * cm]], stone, { seg: 18 });
    M.lathe(0, 0, [[R * 0.3, H - 8 * cm], [R, H - 2 * cm], [R * 0.95, H], [R * 0.85, H], [R * 0.4, H - 5 * cm], [0, H - 6 * cm]], stone, { seg: 24 });
    M.disc(0, 0, H - 2.5 * cm, R * 0.8, R * 0.8, M.mat("water", C.frame), 22);
  });
  mDef("i_lamppost", function (M, W, D, H, C) {
    C = mPick(C, "#1f2326", "#fff1d0");
    var met = M.mat("metal", C.main), R = Math.min(W, D) / 2;
    M.lathe(0, 0, [[R * 0.8, 0], [R * 0.8, 8 * cm], [R * 0.3, 14 * cm]], met, { seg: 12 });
    M.cyl(0, 0, 14 * cm, H - 40 * cm, 3 * cm, met, { seg: 10 });
    M.lathe(0, 0, [[6 * cm, H - 40 * cm], [12 * cm, H - 34 * cm], [12 * cm, H - 12 * cm]], met, { seg: 4, from: 45, to: 405 });
    M.lathe(0, 0, [[11 * cm, H - 33 * cm], [11 * cm, H - 13 * cm]], M.mat("glow", C.frame), { seg: 4, from: 45, to: 405 });
    M.lathe(0, 0, [[15 * cm, H - 12 * cm], [2 * cm, H]], met, { seg: 4, from: 45, to: 405 });
  });
  mDef("i_mailbox", function (M, W, D, H, C) {
    C = mPick(C, "#2f3236", "#c7372f");
    var met = M.mat("metal", C.main);
    M.box(-2 * cm, 2 * cm, -2 * cm, 2 * cm, 0, H - 22 * cm, M.mat("wood", "#6f5a48"));
    M.box(-W / 2, W / 2, -D / 2, D / 2, H - 22 * cm, H - 8 * cm, met, 0.5 * cm);
    M.push().move(0, 0, H - 8 * cm).tiltX(90);
    M.lathe(0, 0, [[D / 2, -W / 2], [D / 2, W / 2]], met, { seg: 12, from: 0, to: 180, top: false });
    M.pop();
    M.box(W / 2, W / 2 + 0.6 * cm, -3 * cm, -1 * cm, H - 18 * cm, H - 4 * cm, M.mat("plastic", C.frame));
    M.box(W / 2, W / 2 + 0.6 * cm, -3 * cm, 4 * cm, H - 6 * cm, H - 3 * cm, M.mat("plastic", C.frame));
  });
  mDef("i_bikerack", function (M, W, D, H, C) {
    C = mPick(C, "#3a3d40");
    var met = M.mat("metal", C.main);
    M.box(-W / 2 + 6 / 80 * W, W / 2 - 6 / 80 * W, -4 * cm, 4 * cm, 0, 3 * cm, met, 1 * cm);
    [14, 30, 46, 62].forEach(function (x0) {
      var x = -W / 2 + x0 / 80 * W, last = [x, -D / 2 + 2 * cm, 0];
      for (var i = 1; i <= 8; i++) {
        var a = i / 8 * Math.PI, p = [x, -Math.cos(a) * (D / 2 - 2 * cm), Math.sin(a) * H];
        M.tube(last, p, 1.4 * cm, met, 6);
        last = p;
      }
    });
  });
  // ------------------------------------------------------- garage, utility --
  mDef("i_workbench", function (M, W, D, H, C) {
    C = mPick(C, "#b98a5a", "#3a3d40");
    var wood = M.mat("wood", C.main), met = M.mat("metal", C.frame), y0 = -D / 2;
    mLegs(M, -W / 2, W / 2, y0 + 8 / 60 * D, D / 2, 3 * cm, 0, H - 5 * cm, 3 * cm, wood, false);
    M.box(-W / 2, W / 2, y0 + 8 / 60 * D, D / 2, H - 5 * cm, H, wood, 0.6 * cm);
    M.box(-W / 2 + 3 * cm, W / 2 - 3 * cm, y0 + 10 / 60 * D, D / 2 - 3 * cm, 15 * cm, 17 * cm, wood);
    M.box(-W / 2, W / 2, y0, y0 + 2 * cm, H, H + 80 * cm, M.mat("plastic", "#d8c9a8"));      // a pegboard, and on it tools
    [[-0.35, 22, "#c7372f"], [-0.2, 30, "#2f4f8f"], [-0.05, 18, "#3a3d40"], [0.15, 26, "#f2c94c"]].forEach(function (t) {
      M.box(t[0] * W - 1.5 * cm, t[0] * W + 1.5 * cm, y0 + 2 * cm, y0 + 4 * cm, H + 40 * cm, H + 40 * cm + t[1] * cm, M.mat("plastic", t[2]), 0.5 * cm);
    });
    M.box(-W / 2 + 6 / 120 * W, -W / 2 + 30 / 120 * W, D / 2 - 6 * cm, D / 2 + 2 * cm, H, H + 9 * cm, met, 1 * cm);   // the vise
    mFronts(M, W / 2 - 34 / 120 * W, W / 2 - 4 * cm, D / 2, 20 * cm, H - 6 * cm, 3, 1, met, M.mat("chrome", "#dfe3e8"));
  });
  mDef("i_shelving", function (M, W, D, H, C, n) {
    C = mPick(C, "#3a3d40", "#c9ad7f");
    var met = M.mat("metal", C.main), rnd = mRand((n && n.id) || 31);
    [[-W / 2, -D / 2], [W / 2 - 3 * cm, -D / 2], [-W / 2, D / 2 - 3 * cm], [W / 2 - 3 * cm, D / 2 - 3 * cm]].forEach(function (p) {
      M.box(p[0], p[0] + 3 * cm, p[1], p[1] + 3 * cm, 0, H, met);
    });
    for (var k = 0; k < 4; k++) {
      var z = 8 * cm + k * (H - 12 * cm) / 3;
      M.box(-W / 2, W / 2, -D / 2, D / 2, z, z + 2 * cm, met, 0.3 * cm);
      for (var x = -W / 2 + 4 * cm; x < W / 2 - 22 * cm; x += 26 * cm) {
        if (rnd() < 0.3) { continue; }
        var bh = (16 + rnd() * 14) * cm;
        if (z + bh > H - 4 * cm) { continue; }
        M.box(x, x + 22 * cm, -D / 2 + 3 * cm, D / 2 - 3 * cm, z + 2 * cm, z + 2 * cm + bh, M.mat(rnd() < 0.5 ? "plastic" : "wicker", rnd() < 0.5 ? C.frame : "#7f8a93"), 1 * cm);
      }
    }
  });
  mDef("i_toolchest", function (M, W, D, H, C) {
    C = mPick(C, "#c7372f", "#dfe3e8");
    var body = M.mat("metal", C.main), y1 = D / 2 - 1 * cm;
    M.box(-W / 2, W / 2, -D / 2, y1, 8 * cm, H, body, 1 * cm);
    mFronts(M, -W / 2 + 1 * cm, W / 2 - 1 * cm, y1, 10 * cm, H - 3 * cm, 6, 1, body, M.mat("chrome", C.frame));
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
      M.push().move(s[0] * (W / 2 - 5 * cm), s[1] * (D / 2 - 5 * cm), 4 * cm).tiltY(90);
      M.cyl(0, 0, -1.5 * cm, 1.5 * cm, 4 * cm, M.mat("rubber", "#1d1f22"), { seg: 12 });
      M.pop();
    });
    M.tube([W / 2 + 1 * cm, -D * 0.3, H - 10 * cm], [W / 2 + 1 * cm, D * 0.3, H - 10 * cm], 1 * cm, M.mat("chrome", C.frame), 8);
  });
  mDef("i_furnace", function (M, W, D, H, C) {
    C = mPick(C, "#e9e6e1", "#9ea3a8");
    var body = M.mat("metal", C.main), y1 = D / 2 - 1 * cm;
    M.box(-W / 2, W / 2, -D / 2, y1, 0, H, body, 0.6 * cm);
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y1, y1 + 0.8 * cm, H * 0.45, H - 3 * cm, body, 0.4 * cm);
    M.box(-W / 2 + 2 * cm, W / 2 - 2 * cm, y1, y1 + 0.8 * cm, 3 * cm, H * 0.43, body, 0.4 * cm);
    for (var k = 0; k < 5; k++) { M.box(-W * 0.3, W * 0.3, y1 + 0.8 * cm, y1 + 1 * cm, 8 * cm + k * 3 * cm, 9 * cm + k * 3 * cm, M.mat("rubber", "#3a3d40")); }
    M.cyl(0, -D * 0.2, H, H + 40 * cm, 7 * cm, M.mat("metal", C.frame), { seg: 14 });
  });
