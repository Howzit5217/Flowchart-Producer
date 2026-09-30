// ---------------------------------------------------------------------------
//  19-picture.js -- a picture of a flowchart, read back into a drawing
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A flowchart handed in as a picture -- a screenshot, a PNG saved from
  // some website, a photo of the board -- is read here into a drawing on
  // the Flowchart tab: its shapes, the kind each one is, the arrows and the
  // way they point, the words, and the colors.
  //
  // First the picture is looked at, which needs nothing from anywhere
  // (pictureRead).  A shape is a patch of one color closed in by its
  // outline: white inside a black border, or pale blue filling a box.  Each
  // patch big enough and plump enough is measured against the shapes a
  // flowchart is made of -- a box, a rounded box, an oval, a diamond, a
  // slanted box, a hexagon -- by how its edge runs from top to bottom and
  // from side to side (shapeFit).  What is left over, line-like and
  // touching the shapes, is the arrows, and the end of an arrow with more
  // ink crowded at it than the line alone would have is the end with the
  // head.
  //
  // Then the words, which need a reader of letters.  There is not one in a
  // browser, so Tesseract -- the free one -- is fetched the first time a
  // picture is opened, the way Python is, and kept for next time.  Each
  // shape's words are read on their own, cleaned of its outline and turned
  // to dark on light; then what is written beside the arrows (Yes, No).
  // With no connection the shapes and arrows are still made, and the words
  // are left to be typed in.
  //
  // A picture saved from draw.io, Excalidraw or this page carries its
  // drawing inside it, and is opened from that instead (openPicture).

  // =================================================== what a shape is ==
  // A shape's outline as the share of its width each row starts and ends at
  // (L, R), and the share of its height each column starts and ends at (T,
  // B) -- NaN where there is nothing -- against each kind of shape.  `aspect`
  // is its width over its height, which the rounding of a corner needs.
  var FITS = [
    { kind: "round", ps: [0, 0.06, 0.12, 0.2, 0.3, 0.42, 0.5], lr: function (t, p, a) {
      var r = Math.min(p, 0.5, a / 2), e = Math.min(t, 1 - t);
      if (r <= 0 || e >= r) { return [0, 1]; }
      var dy = r - e, dx = (r - Math.sqrt(Math.max(0, r * r - dy * dy))) / a;
      return [dx, 1 - dx];
    } },
    { kind: "oval", ps: [0], lr: function (t) {
      var v = 2 * t - 1, h = 0.5 * Math.sqrt(Math.max(0, 1 - v * v));
      return [0.5 - h, 0.5 + h];
    } },
    { kind: "diamond", ps: [0], lr: function (t) {
      var h = 0.5 - Math.abs(t - 0.5);
      return [0.5 - h, 0.5 + h];
    } },
    // (the slants and points as shallow as a wide one of Mermaid's: its
    // hexagon's points are a quarter of its height, on a box four times as
    // wide as it is tall; a plain box still fits best as a plain box)
    { kind: "io", ps: [0.04, 0.06, 0.1, 0.15, 0.2, 0.27, 0.35], lr: function (t, p) {
      return [p * (1 - t), 1 - p * t];
    } },
    { kind: "io_back", ps: [0.04, 0.06, 0.1, 0.15, 0.2, 0.27, 0.35], lr: function (t, p) {
      return [p * t, 1 - p * (1 - t)];
    } },
    { kind: "hex", ps: [0.03, 0.045, 0.06, 0.08, 0.12, 0.17, 0.23, 0.3, 0.38], lr: function (t, p) {
      var l = p * Math.abs(2 * t - 1);
      return [l, 1 - l];
    } },
    { kind: "trap", ps: [0.08, 0.14, 0.2, 0.28], lr: function (t, p) {   // narrow at the top
      return [p * (1 - t), 1 - p * (1 - t)];
    } },
    { kind: "trap_down", ps: [0.08, 0.14, 0.2, 0.28], lr: function (t, p) {
      return [p * t, 1 - p * t];
    } },
    { kind: "manual", ps: [0.12, 0.2, 0.3, 0.4], lr: function (t, p) {  // the top slopes up
      return t < p ? [1 - t / p, 1] : [0, 1];
    } }
  ];

  function shapeFit(L, R, T, B, aspect) {
    var rows = [], cols = [], step, k;
    step = Math.max(1, Math.floor(L.length / 48));
    for (k = 0; k < L.length; k += step) {
      if (isFinite(L[k]) && isFinite(R[k])) { rows.push([(k + 0.5) / L.length, L[k], R[k]]); }
    }
    step = Math.max(1, Math.floor(T.length / 24));
    for (k = 0; k < T.length; k += step) {
      if (isFinite(T[k]) && isFinite(B[k])) { cols.push([(k + 0.5) / T.length, T[k], B[k]]); }
    }
    if (rows.length < 3 || cols.length < 3) { return null; }
    var best = null;
    FITS.forEach(function (fit) {
      fit.ps.forEach(function (p) {
        var er = 0, ec = 0;
        rows.forEach(function (r) {
          var lr = fit.lr(r[0], p, aspect);
          er += Math.abs(r[1] - lr[0]) + Math.abs(r[2] - lr[1]);
        });
        // the columns, from the rows: where the first and last row covering
        // each column are
        var tops = [], S = 60;
        for (var s = 0; s < S; s++) {
          var lr2 = fit.lr((s + 0.5) / S, p, aspect);
          tops.push(lr2);
        }
        cols.forEach(function (c) {
          var u = c[0], top = NaN, foot = NaN;
          for (var s2 = 0; s2 < S; s2++) {
            if (tops[s2][0] <= u && u <= tops[s2][1]) {
              if (isNaN(top)) { top = s2 / S; }
              foot = (s2 + 1) / S;
            }
          }
          if (isNaN(top)) { ec += 1; return; }
          ec += Math.abs(c[1] - top) + Math.abs(c[2] - foot);
        });
        var err = (er / rows.length + ec / cols.length) / 2;
        if (!best || err < best.err) { best = { fit: fit.kind, p: p, err: err }; }
      });
    });
    var kind = best.fit;
    if (kind === "round") { kind = best.p <= 0.06 ? "rect" : best.p >= 0.42 && aspect >= 1.25 ? "oval" : "roundrect"; }
    if (kind === "trap_down") { kind = "trap"; }
    if (kind === "oval" && aspect >= 0.8 && aspect <= 1.25) { kind = "circle"; }
    return { kind: kind, err: best.err, p: best.p };
  }

  // =================================================== looking at it ==
  // The picture, as rows of colors, read into shapes and arrows.  Nothing
  // here reads a letter: the words are read afterwards (pictureWords), from
  // what this says about where they are.
  function pictureRead(px) {
    var W = px.width, H = px.height, N = W * H, src = px.data, i, j, x, y, p, q;
    var R = new Uint8Array(N), G = new Uint8Array(N), B = new Uint8Array(N);
    for (i = 0, j = 0; i < N; i++, j += 4) {  // see-through is the paper: flattened onto white
      var a = src[j + 3];
      if (a === 255) { R[i] = src[j]; G[i] = src[j + 1]; B[i] = src[j + 2]; }
      else {
        var f = a / 255, w = 255 * (1 - f);
        R[i] = src[j] * f + w; G[i] = src[j + 1] * f + w; B[i] = src[j + 2] * f + w;
      }
    }
    var paper = pictureGround(R, G, B, W, H);
    var photo = paper.photo;
    function far(k, c) {
      return Math.max(Math.abs(R[k] - c[0]), Math.abs(G[k] - c[1]), Math.abs(B[k] - c[2]));
    }
    var pc = paper.c;

    // ---- which pixels are ink, and which are flat enough to fill from
    var ink = new Uint8Array(N), open = new Uint8Array(N);
    if (photo) {
      // A photo has light falling unevenly across it, so ink is what is
      // darker than the paper around it rather than than one paper color.
      var lum = new Float32Array(N), sum = new Float64Array((W + 1) * (H + 1));
      for (i = 0; i < N; i++) { lum[i] = 0.299 * R[i] + 0.587 * G[i] + 0.114 * B[i]; }
      var dark = 0.299 * pc[0] + 0.587 * pc[1] + 0.114 * pc[2] < 110;
      if (dark) { for (i = 0; i < N; i++) { lum[i] = 255 - lum[i]; } }
      for (y = 0; y < H; y++) {
        var run = 0;
        for (x = 0; x < W; x++) {
          run += lum[y * W + x];
          sum[(y + 1) * (W + 1) + x + 1] = sum[y * (W + 1) + x + 1] + run;
        }
      }
      var r0 = Math.max(7, Math.round(Math.min(W, H) / 50));
      for (y = 0; y < H; y++) {
        var ya = Math.max(0, y - r0), yb = Math.min(H, y + r0 + 1);
        for (x = 0; x < W; x++) {
          var xa = Math.max(0, x - r0), xb = Math.min(W, x + r0 + 1);
          var mean = (sum[yb * (W + 1) + xb] - sum[ya * (W + 1) + xb] - sum[yb * (W + 1) + xa] +
                      sum[ya * (W + 1) + xa]) / ((yb - ya) * (xb - xa));
          p = y * W + x;
          if (lum[p] < mean - Math.max(10, mean * 0.08)) { ink[p] = 1; } else { open[p] = 1; }
        }
      }
    } else {
      // (written out longhand: this is every pixel of the picture, several
      // times over, and it is most of the time looking at one takes)
      var pr = pc[0], pg = pc[1], pb = pc[2];
      for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++) {
          p = y * W + x;
          var r1 = R[p], g1 = G[p], b1 = B[p];
          var dr = r1 - pr, dg = g1 - pg, db = b1 - pb;
          if (dr > 48 || dr < -48 || dg > 48 || dg < -48 || db > 48 || db < -48) { ink[p] = 1; }
          var right = x + 1 < W ? p + 1 : p - 1, down = y + 1 < H ? p + W : p - W;
          dr = r1 - R[right]; dg = g1 - G[right]; db = b1 - B[right];
          if (dr > 14 || dr < -14 || dg > 14 || dg < -14 || db > 14 || db < -14) { continue; }
          dr = r1 - R[down]; dg = g1 - G[down]; db = b1 - B[down];
          if (dr > 14 || dr < -14 || dg > 14 || dg < -14 || db > 14 || db < -14) { continue; }
          open[p] = 1;
        }
      }
    }

    // ---- patches of one color, each numbered
    var label = new Int32Array(N).fill(-1), stack = new Int32Array(N);
    var cap = 4096, count = 0;
    var RN = new Int32Array(cap), RX0 = new Int32Array(cap), RY0 = new Int32Array(cap);
    var RX1 = new Int32Array(cap), RY1 = new Int32Array(cap), REDGE = new Uint8Array(cap);
    var RR = new Float64Array(cap), RG = new Float64Array(cap), RB = new Float64Array(cap);
    function bigger(arr) { var b = new arr.constructor(cap); b.set(arr); return b; }
    var TOL = 30;
    for (p = 0; p < N; p++) {
      if (!open[p] || label[p] >= 0) { continue; }
      if (count === cap) {
        cap *= 2;
        RN = bigger(RN); RX0 = bigger(RX0); RY0 = bigger(RY0); RX1 = bigger(RX1); RY1 = bigger(RY1);
        REDGE = bigger(REDGE); RR = bigger(RR); RG = bigger(RG); RB = bigger(RB);
      }
      var id = count++, sr = R[p], sg = G[p], sb = B[p], top = 0;
      var n = 0, x0 = W, y0 = H, x1 = -1, y1 = -1, tr = 0, tg = 0, tb = 0, edge = 0;
      stack[top++] = p;
      label[p] = id;
      while (top) {
        q = stack[--top];
        var qx = q % W, qy = (q - qx) / W;
        n++; tr += R[q]; tg += G[q]; tb += B[q];
        if (qx < x0) { x0 = qx; } if (qx > x1) { x1 = qx; }
        if (qy < y0) { y0 = qy; } if (qy > y1) { y1 = qy; }
        if (qx === 0 || qy === 0 || qx === W - 1 || qy === H - 1) { edge = 1; }
        for (var d = 0; d < 4; d++) {
          var nb = d === 0 ? (qx > 0 ? q - 1 : -1) : d === 1 ? (qx < W - 1 ? q + 1 : -1)
                 : d === 2 ? (qy > 0 ? q - W : -1) : (qy < H - 1 ? q + W : -1);
          if (nb < 0 || !open[nb] || label[nb] >= 0) { continue; }
          if (!photo) {
            var er = R[nb] - sr, eg = G[nb] - sg, eb = B[nb] - sb;
            if (er > TOL || er < -TOL || eg > TOL || eg < -TOL || eb > TOL || eb < -TOL) { continue; }
          }
          label[nb] = id;
          stack[top++] = nb;
        }
      }
      RN[id] = n; RX0[id] = x0; RY0[id] = y0; RX1[id] = x1; RY1[id] = y1; REDGE[id] = edge;
      RR[id] = tr / n; RG[id] = tg / n; RB[id] = tb / n;
    }

    // ---- which patches might be a shape, or a part of one
    var least = Math.max(100, N * 0.0003);
    var parts = [];
    for (var r = 0; r < count; r++) {
      var rw = RX1[r] - RX0[r] + 1, rh = RY1[r] - RY0[r] + 1, mine = [RR[r], RG[r], RB[r]];
      var ground = RN[r] > 0.3 * N ||
                   (REDGE[r] && (photo || Math.max(Math.abs(mine[0] - pc[0]), Math.abs(mine[1] - pc[1]),
                                                   Math.abs(mine[2] - pc[2])) <= 40));
      if (ground || RN[r] < least / 4 || rh < 6 || rw < 3) { continue; }
      parts.push({ id: r, n: RN[r], x0: RX0[r], y0: RY0[r], x1: RX1[r], y1: RY1[r], w: rw, h: rh,
                   fill: mine });
    }
    parts.forEach(function (s) { patchEdges(s, label, W); });
    parts.forEach(function (s) {
      s.box = s.n / (s.w * s.h);
      s.solid = s.filled ? s.n / s.filled : 0;
      s.fit = s.n >= least / 2 && s.w >= 8 ? shapeFit(s.nL, s.nR, s.nT, s.nB, s.w / s.h) : null;
    });

    // ---- shapes of more than one patch: a store (a lid on a can) and a
    // call (a box with a bar down each side)
    var used = {}, shapes = [];
    parts.forEach(function (lid) {
      // a lid is a flat ellipse, a few pixels tall, which no fit measures
      // finely: near enough an oval, and about as full of its box as one is
      if (used[lid.id] || !lid.fit || lid.fit.err > 0.3 || lid.box < 0.6 || lid.box > 0.9 ||
          !/^(oval|circle|hex|roundrect)$/.test(lid.fit.kind) || lid.w < 1.8 * lid.h) { return; }
      // under it, as wide as it (a lid's thin ends are lost to the softening
      // of its edge, so it reads a little narrower), and starting inside it
      var can = parts.filter(function (b) {
        return b !== lid && !used[b.id] && Math.abs((b.x0 + b.x1) - (lid.x0 + lid.x1)) <= 8 &&
               lid.w >= 0.7 * b.w && lid.w <= 1.1 * b.w &&
               b.y0 >= lid.y0 - 2 && b.y0 <= lid.y1 + 3 && b.y1 > lid.y1 && b.h >= lid.h * 0.8;
      })[0];
      if (!can) { return; }
      used[lid.id] = used[can.id] = true;
      shapes.push(joinParts([lid, can], can, "store"));
    });
    parts.forEach(function (mid) {
      if (used[mid.id] || !mid.fit || mid.fit.err > 0.12 || !/^(rect|roundrect)$/.test(mid.fit.kind)) { return; }
      var lean = Math.max(3, mid.h * 0.08);
      function bar(side) {
        return parts.filter(function (b) {
          if (b === mid || used[b.id] || b.box < 0.7 || b.w > mid.h * 0.35 + 4) { return false; }
          if (Math.abs(b.y0 - mid.y0) > lean || Math.abs(b.y1 - mid.y1) > lean) { return false; }
          var gap = side < 0 ? mid.x0 - b.x1 : b.x0 - mid.x1;
          return gap >= 1 && gap <= 9;
        })[0];
      }
      var left = bar(-1), right = bar(1);
      if (!left || !right) { return; }
      used[mid.id] = used[left.id] = used[right.id] = true;
      shapes.push(joinParts([left, mid, right], mid, "sub"));
    });
    parts.forEach(function (s) {
      if (used[s.id] || !s.fit || s.n < least || s.w < 12 || s.h < 8 || s.box < 0.25) { return; }
      if (s.convex < 0.85 || s.solid < 0.35 || s.fit.err > 0.16) { return; }
      shapes.push(joinParts([s], s, s.fit.kind));
    });

    // ---- one shape to a place.  A box round others (a lane, a frame) goes,
    // and so does the space a loop's arrow closes in beside a shape: of two
    // that lie across each other the truer shape stays.
    shapes.sort(function (a, b) { return a.err - b.err || a.area - b.area; });
    var kept = [];
    shapes.forEach(function (s) {
      var clash = kept.filter(function (k) {
        var ix = Math.min(s.x1, k.x1) - Math.max(s.x0, k.x0), iy = Math.min(s.y1, k.y1) - Math.max(s.y0, k.y0);
        if (ix <= 0 || iy <= 0) { return false; }
        return ix * iy > 0.2 * Math.min(s.w * s.h, k.w * k.h);
      });
      if (!clash.length) { kept.push(s); return; }
      // lying wholly inside what is kept: a shape inside a frame.  The frame goes.
      var inside = clash.every(function (k) {
        return s.x0 >= k.x0 - 2 && s.x1 <= k.x1 + 2 && s.y0 >= k.y0 - 2 && s.y1 <= k.y1 + 2 &&
               s.w * s.h < 0.6 * k.w * k.h;
      });
      if (inside) {
        kept = kept.filter(function (k) { return clash.indexOf(k) < 0; });
        kept.push(s);
      }
    });
    shapes = kept.sort(function (a, b) { return a.y0 - b.y0 || a.x0 - b.x0; });

    // ---- each shape's colors: inside, its border, its words
    shapes.forEach(function (s) { shapeColors(s, R, G, B, W, H, label, pc); });

    // ---- the ground each shape covers, spread by its border and a little
    // more, so what is left touching it is what joins it
    var owner = new Int16Array(N).fill(-1);
    shapes.forEach(function (s, k) {
      var D = Math.max(2, Math.round(s.border)) + 2;
      for (var yy = Math.max(0, s.y0 - D); yy <= Math.min(H - 1, s.y1 + D); yy++) {
        var lo = Infinity, hi = -Infinity;
        for (var y2 = yy - D; y2 <= yy + D; y2++) {
          var row = y2 - s.y0;
          if (row < 0 || row >= s.h || !isFinite(s.L[row])) { continue; }
          lo = Math.min(lo, s.L[row]); hi = Math.max(hi, s.R[row]);
        }
        if (lo > hi) { continue; }
        for (var xx = Math.max(0, lo - D); xx <= Math.min(W - 1, hi + D); xx++) {
          if (owner[yy * W + xx] < 0) { owner[yy * W + xx] = k; }
        }
      }
    });

    // ---- the lines: ink that no shape owns, in joined-up pieces
    var wire = new Int32Array(N).fill(-1), pieces = [];
    var order = new Int32Array(N), filledTo = 0;
    for (p = 0; p < N; p++) {
      if (!ink[p] || owner[p] >= 0 || wire[p] >= 0) { continue; }
      var pid = pieces.length, from = filledTo, t2 = 0;
      stack[t2++] = p;
      wire[p] = pid;
      var bx0 = W, by0 = H, bx1 = -1, by1 = -1;
      while (t2) {
        q = stack[--t2];
        order[filledTo++] = q;
        var cx = q % W, cy = (q - cx) / W;
        if (cx < bx0) { bx0 = cx; } if (cx > bx1) { bx1 = cx; }
        if (cy < by0) { by0 = cy; } if (cy > by1) { by1 = cy; }
        for (var ny = Math.max(0, cy - 1); ny <= Math.min(H - 1, cy + 1); ny++) {
          for (var nx = Math.max(0, cx - 1); nx <= Math.min(W - 1, cx + 1); nx++) {
            var m2 = ny * W + nx;
            if (!ink[m2] || owner[m2] >= 0 || wire[m2] >= 0) { continue; }
            wire[m2] = pid;
            stack[t2++] = m2;
          }
        }
      }
      pieces.push({ id: pid, from: from, to: filledTo, x0: bx0, y0: by0, x1: bx1, y1: by1 });
    }
    pieces.forEach(function (c) {
      c.n = c.to - c.from;
      c.len = Math.max(c.x1 - c.x0, c.y1 - c.y0) + 1;
      c.lw = pieceWidth(c, order, wire, W, H);
    });
    var thickest = Math.max(6, Math.max(W, H) * 0.012);
    var wires = pieces.filter(function (c) { return c.len >= 8 && c.lw <= thickest; });

    // ---- where each piece touches a shape
    wires.forEach(function (c) {
      var touch = {};
      var AROUND = [[-1, 0], [1, 0], [0, -1], [0, 1], [-2, 0], [2, 0], [0, -2], [0, 2],
                    [-1, -1], [1, -1], [-1, 1], [1, 1]];
      for (var k2 = c.from; k2 < c.to; k2++) {
        var s0 = order[k2], sx = s0 % W, sy = (s0 - sx) / W;
        for (var a2 = 0; a2 < AROUND.length; a2++) {
          var ax = sx + AROUND[a2][0], ay = sy + AROUND[a2][1];
          if (ax < 0 || ay < 0 || ax >= W || ay >= H) { continue; }
          var o = owner[ay * W + ax];
          if (o < 0) { continue; }
          (touch[o] = touch[o] || []).push(s0);
          break;
        }
      }
      c.touches = [];
      Object.keys(touch).forEach(function (o) {
        clustered(touch[o], W, 12).forEach(function (spot) {
          c.touches.push({ shape: +o, x: spot.x, y: spot.y, piece: c });
        });
      });
      c.touches.forEach(function (t) { t.head = headAt(c, t, order, W); });
    });

    // ---- pieces an arrow was broken into -- by the words written across
    // it, or a gap in the drawing -- joined back up, loose end to loose end
    var loose = [];
    wires.forEach(function (c) {
      if (c.touches.length === 1 && c.len >= 12) {
        loose.push({ piece: c, at: farthest(c, order, W, c.touches[0]) });
      } else if (!c.touches.length && c.len >= 16 && c.n <= 5 * Math.max(1, c.lw) * (c.x1 - c.x0 + c.y1 - c.y0 + 2)) {
        var one = farthest(c, order, W, { x: (c.x0 + c.x1) / 2, y: (c.y0 + c.y1) / 2 });
        var two = farthest(c, order, W, one);
        loose.push({ piece: c, at: one }, { piece: c, at: two });
      }
    });
    // A line that stops a little short of a shape -- a few pixels of paper
    // between its head and the border, as many websites draw them, or the
    // head aimed at a slanted box's corner rather than its sloping side --
    // still meets it: near enough the box round the shape is near enough.
    loose = loose.filter(function (end) {
      var got = -1, gotD = Infinity;
      shapes.forEach(function (s, k) {
        var dx = Math.max(0, s.x0 - end.at.x, end.at.x - s.x1);
        var dy = Math.max(0, s.y0 - end.at.y, end.at.y - s.y1);
        var dd = Math.sqrt(dx * dx + dy * dy);
        if (dd < gotD && dd <= Math.max(10, s.border + 8)) { gotD = dd; got = k; }
      });
      if (got < 0 || end.piece.touches.some(function (t) { return t.shape === got; })) { return true; }
      var meet = { shape: got, x: end.at.x, y: end.at.y, piece: end.piece };
      meet.head = headAt(end.piece, meet, order, W);
      end.piece.touches.push(meet);
      return false;
    });
    var reach = Math.max(30, 0.06 * Math.max(W, H));
    var joined = pieces.map(function (c, k) { return k; });
    function rootOf(k) { while (joined[k] !== k) { joined[k] = joined[joined[k]]; k = joined[k]; } return k; }
    var gaps = [], pairs = [];
    for (var a1 = 0; a1 < loose.length; a1++) {
      for (var b1 = a1 + 1; b1 < loose.length; b1++) {
        if (loose[a1].piece === loose[b1].piece) { continue; }
        var gd = Math.hypot(loose[a1].at.x - loose[b1].at.x, loose[a1].at.y - loose[b1].at.y);
        if (gd <= reach) { pairs.push([gd, a1, b1]); }
      }
    }
    pairs.sort(function (u, v) { return u[0] - v[0]; });
    var spent = {};
    pairs.forEach(function (pr) {
      if (spent[pr[1]] || spent[pr[2]]) { return; }
      var A = loose[pr[1]], Bq = loose[pr[2]];
      var mid = { x: (A.at.x + Bq.at.x) / 2, y: (A.at.y + Bq.at.y) / 2 };
      if (owner[Math.round(mid.y) * W + Math.round(mid.x)] >= 0) { return; }
      spent[pr[1]] = spent[pr[2]] = true;
      joined[rootOf(A.piece.id)] = rootOf(Bq.piece.id);
      gaps.push({ a: A.at, b: Bq.at, x: mid.x, y: mid.y, net: -1, piece: A.piece });
    });

    // ---- the arrows: each joined-up line, from the ends without heads to
    // the ends with
    var nets = {};
    wires.forEach(function (c) {
      var k3 = rootOf(c.id);
      var net = nets[k3] = nets[k3] || { pieces: [], touches: [], links: [] };
      net.pieces.push(c);
      net.touches = net.touches.concat(c.touches);
    });
    gaps.forEach(function (g2) { g2.net = rootOf(g2.piece.id); });
    var netList = Object.keys(nets).map(function (k) { nets[k].key = +k; return nets[k]; });
    netList.forEach(function (net) {
      var ends = net.touches;
      if (ends.length < 2) { return; }
      var heads = ends.filter(function (t) { return t.head; });
      var tails = ends.filter(function (t) { return !t.head; });
      if (!heads.length || !tails.length) {
        // no way to tell from the ink: the flow goes down the page, then across
        var sorted = ends.slice().sort(function (u, v) {
          return Math.abs(u.y - v.y) > 6 ? u.y - v.y : u.x - v.x;
        });
        if (!heads.length) {
          tails = sorted.slice(0, sorted.length - 1);
          heads = sorted.slice(sorted.length - 1);
        } else {
          tails = sorted.slice(0, 1);
          heads = sorted.slice(1);
        }
      }
      var made = [];
      if (tails.length >= 2 && heads.length >= 2) {
        // two arrows crossing: each tail to the head straightest on from it
        var options = [];
        tails.forEach(function (t) {
          heads.forEach(function (h) {
            options.push([Math.min(Math.abs(t.x - h.x), Math.abs(t.y - h.y)), t, h]);
          });
        });
        options.sort(function (u, v) { return u[0] - v[0]; });
        var tUsed = [], hUsed = [];
        options.forEach(function (o) {
          if (tUsed.indexOf(o[1]) >= 0 || hUsed.indexOf(o[2]) >= 0) { return; }
          tUsed.push(o[1]); hUsed.push(o[2]);
          made.push([o[1], o[2]]);
        });
      } else {
        tails.forEach(function (t) { heads.forEach(function (h) { made.push([t, h]); }); });
      }
      made.forEach(function (m) {
        if (m[0].shape === m[1].shape) { return; }
        if (net.links.some(function (l) { return l.from === m[0].shape && l.to === m[1].shape; })) { return; }
        net.links.push({ from: m[0].shape, to: m[1].shape, tail: m[0], head: m[1] });
      });
    });

    // ---- the color the arrows are drawn in: the strongest of their ink,
    // which is the middle of each line rather than its softened edges
    var inkSeen = [];
    netList.forEach(function (net) {
      if (!net.links.length) { return; }
      net.pieces.forEach(function (c) {
        for (var k4 = c.from; k4 < c.to; k4 += Math.max(1, Math.floor(c.n / 60))) {
          inkSeen.push([far(order[k4], pc), order[k4]]);
        }
      });
    });
    inkSeen.sort(function (u, v) { return v[0] - u[0]; });
    inkSeen = inkSeen.slice(0, Math.max(1, Math.ceil(inkSeen.length / 4)));
    var inkC = inkSeen.length && inkSeen[0] ? [0, 1, 2].map(function (ch) {
      return inkSeen.reduce(function (s, v) { return s + [R, G, B][ch][v[1]]; }, 0) / inkSeen.length;
    }) : null;
    return {
      W: W, H: H, paper: pc, photo: photo, shapes: shapes, nets: netList, gaps: gaps,
      owner: owner, wire: wire, order: order, pieces: pieces, label: label, ink: inkC
    };
  }

  // The paper: the color most of the picture's edge is, looked for a few
  // pixels in as well, so a frame drawn round the picture is not taken for
  // it.  A photo's edge is many colors, never quite one.
  function pictureGround(R, G, B, W, H) {
    var bins = {}, total = 0, i;
    function take(k) {
      var key = (R[k] >> 3) << 10 | (G[k] >> 3) << 5 | (B[k] >> 3);
      bins[key] = (bins[key] || 0) + 1;
      total++;
    }
    [0, 3, 6].forEach(function (inset) {
      if (inset * 2 >= Math.min(W, H)) { return; }
      for (var x = inset; x < W - inset; x++) { take(inset * W + x); take((H - 1 - inset) * W + x); }
      for (var y = inset + 1; y < H - 1 - inset; y++) { take(y * W + inset); take(y * W + W - 1 - inset); }
    });
    var best = 0, most = -1;
    Object.keys(bins).forEach(function (k) { if (bins[k] > most) { most = bins[k]; best = +k; } });
    var br = best >> 10, bg = (best >> 5) & 31, bb = best & 31, near = 0;
    Object.keys(bins).forEach(function (k) {
      k = +k;
      if (Math.abs((k >> 10) - br) <= 1 && Math.abs(((k >> 5) & 31) - bg) <= 1 && Math.abs((k & 31) - bb) <= 1) {
        near += bins[k];
      }
    });
    // its color, as the pixels of that kind actually are
    var sum = [0, 0, 0], n = 0;
    for (i = 0; i < W; i++) {
      [i, (H - 1) * W + i, Math.min(H - 1, 3) * W + i].forEach(function (k) {
        if ((R[k] >> 3) === br && (G[k] >> 3) === bg && (B[k] >> 3) === bb) {
          sum[0] += R[k]; sum[1] += G[k]; sum[2] += B[k]; n++;
        }
      });
    }
    var c = n ? [sum[0] / n, sum[1] / n, sum[2] / n] : [br * 8 + 4, bg * 8 + 4, bb * 8 + 4];
    return { c: c, photo: near / total < 0.7 };
  }

  // A patch's edges, row by row and column by column: where each starts and
  // stops, as pixels (L, R, T, B) and as shares of its size (nL ...); how
  // much a box drawn round each row's ends would hold (filled); and how
  // nearly that is the whole of the ground inside its corners (convex).
  function patchEdges(s, label, W) {
    var L = new Array(s.h), Rr = new Array(s.h), T = new Array(s.w), Bt = new Array(s.w);
    var x, y, filled = 0;
    for (y = 0; y < s.h; y++) { L[y] = Infinity; Rr[y] = -Infinity; }
    for (x = 0; x < s.w; x++) { T[x] = Infinity; Bt[x] = -Infinity; }
    for (y = 0; y < s.h; y++) {
      var row = (s.y0 + y) * W;
      for (x = 0; x < s.w; x++) {
        if (label[row + s.x0 + x] !== s.id) { continue; }
        if (x < L[y]) { L[y] = x; } if (x > Rr[y]) { Rr[y] = x; }
        if (y < T[x]) { T[x] = y; } if (y > Bt[x]) { Bt[x] = y; }
      }
    }
    var corners = [];
    s.L = []; s.R = []; s.nL = []; s.nR = []; s.nT = []; s.nB = [];
    for (y = 0; y < s.h; y++) {
      if (L[y] === Infinity) { s.L.push(NaN); s.R.push(NaN); s.nL.push(NaN); s.nR.push(NaN); continue; }
      s.L.push(s.x0 + L[y]); s.R.push(s.x0 + Rr[y]);
      s.nL.push(L[y] / s.w); s.nR.push((Rr[y] + 1) / s.w);
      filled += Rr[y] - L[y] + 1;
      corners.push([L[y], y], [Rr[y] + 1, y], [L[y], y + 1], [Rr[y] + 1, y + 1]);
    }
    for (x = 0; x < s.w; x++) {
      if (T[x] === Infinity) { s.nT.push(NaN); s.nB.push(NaN); continue; }
      s.nT.push(T[x] / s.h); s.nB.push((Bt[x] + 1) / s.h);
    }
    s.filled = filled;
    var hull = hullArea(corners);
    s.convex = hull ? Math.min(1, filled / hull) : 0;
  }

  function hullArea(pts) {
    if (pts.length < 3) { return 0; }
    pts = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lower = [], upper = [], i;
    for (i = 0; i < pts.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) { lower.pop(); }
      lower.push(pts[i]);
    }
    for (i = pts.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0) { upper.pop(); }
      upper.push(pts[i]);
    }
    var hull = lower.slice(0, -1).concat(upper.slice(0, -1)), area = 0;
    for (i = 0; i < hull.length; i++) {
      var a = hull[i], b = hull[(i + 1) % hull.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    return Math.abs(area) / 2;
  }

  // A shape of one or more patches: its box, its edges row by row (each
  // row the widest the parts make it), and the patch its words are in.
  function joinParts(list, main, kind) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, area = 0, err = 0;
    list.forEach(function (s) {
      x0 = Math.min(x0, s.x0); y0 = Math.min(y0, s.y0);
      x1 = Math.max(x1, s.x1); y1 = Math.max(y1, s.y1);
      area += s.n;
      err = Math.max(err, s.fit ? s.fit.err : 0);
    });
    var h = y1 - y0 + 1, L = [], R = [];
    for (var y = 0; y < h; y++) {
      var lo = Infinity, hi = -Infinity;
      list.forEach(function (s) {
        var row = y0 + y - s.y0;
        if (row < 0 || row >= s.h || !isFinite(s.L[row])) { return; }
        lo = Math.min(lo, s.L[row]); hi = Math.max(hi, s.R[row]);
      });
      L.push(lo === Infinity ? NaN : lo);
      R.push(hi === -Infinity ? NaN : hi);
    }
    return { kind: kind, parts: list, main: main, x0: x0, y0: y0, x1: x1, y1: y1,
             w: x1 - x0 + 1, h: h, L: L, R: R, area: area, err: err,
             cx: (x0 + x1 + 1) / 2, cy: (y0 + y1 + 1) / 2 };
  }

  // Inside: the patch's own color.  The border: walked out to from the
  // patch's edge at a few places on each side, to where the paper begins.
  // The words: the marks inside the patch least like it.
  function shapeColors(s, R, G, B, W, H, label, pc) {
    var main = s.main, fill = main.fill;
    function far(k, c) {
      return Math.max(Math.abs(R[k] - c[0]), Math.abs(G[k] - c[1]), Math.abs(B[k] - c[2]));
    }
    // How far a color is from being only the fill and the paper blended --
    // which is all the softened edge of a shape with no border is.
    var span = [pc[0] - fill[0], pc[1] - fill[1], pc[2] - fill[2]];
    var spanLen = span[0] * span[0] + span[1] * span[1] + span[2] * span[2];
    function unmixed(k) {
      var v = [R[k] - fill[0], G[k] - fill[1], B[k] - fill[2]];
      var t = spanLen ? Math.max(0, Math.min(1, (v[0] * span[0] + v[1] * span[1] + v[2] * span[2]) / spanLen)) : 0;
      return Math.hypot(v[0] - t * span[0], v[1] - t * span[1], v[2] - t * span[2]);
    }
    var widths = [], cols = [];
    function probe(x, y, dx, dy) {
      var best = -1, bestFar = -1, width = 0, k = 0;
      for (; k < 16; k++) {
        var px = x + dx * k, py = y + dy * k;
        if (px < 0 || py < 0 || px >= W || py >= H) { return; }
        var at = py * W + px, u = unmixed(at);
        if (u > 26) {
          width++;
          if (u > bestFar) { bestFar = u; best = at; }
        } else if (width || k >= 3) {
          break;                           // past the border, or there is none
        }
      }
      if (k >= 16) { return; }             // ran into something else: not a clean look
      widths.push(width);
      if (best >= 0) { cols.push([R[best], G[best], B[best]]); }
    }
    for (var t = 0.3; t <= 0.71; t += 0.1) {
      var row = Math.round(t * (main.h - 1)), col = Math.round(t * (main.w - 1));
      if (isFinite(main.L[row])) {
        probe(main.L[row] - 1, main.y0 + row, -1, 0);
        probe(main.R[row] + 1, main.y0 + row, 1, 0);
      }
      var cx = main.x0 + col, topY = -1, footY = -1;
      for (var y = main.y0; y <= main.y1; y++) {
        if (label[y * W + cx] === main.id) { if (topY < 0) { topY = y; } footY = y; }
      }
      if (topY >= 0) { probe(cx, topY - 1, 0, -1); probe(cx, footY + 1, 0, 1); }
    }
    s.border = middleOf(widths);
    s.line = cols.length >= 3 && s.border >= 1 ? [0, 1, 2].map(function (c) {
      return middleOf(cols.map(function (v) { return v[c]; }));
    }) : null;
    s.fill = fill;
    // the words: marks inside, kept off the border by a pixel or two
    var inset = Math.max(1, Math.round(s.border / 2)), marks = [], rowsWith = [];
    for (var yy = main.y0; yy <= main.y1; yy++) {
      var r2 = yy - main.y0, any = false;
      if (!isFinite(main.L[r2])) { rowsWith.push(false); continue; }
      for (var xx = main.L[r2] + inset; xx <= main.R[r2] - inset; xx++) {
        var at2 = yy * W + xx;
        if (label[at2] === main.id) { continue; }
        var d = far(at2, fill);
        if (d > 40) { marks.push([d, at2]); any = true; }
      }
      rowsWith.push(any);
    }
    s.marks = marks.length;
    if (marks.length >= 12) {
      marks.sort(function (a, b) { return b[0] - a[0]; });
      var take = marks.slice(0, Math.max(6, Math.floor(marks.length * 0.35))), sum = [0, 0, 0];
      take.forEach(function (m) { sum[0] += R[m[1]]; sum[1] += G[m[1]]; sum[2] += B[m[1]]; });
      s.words = [sum[0] / take.length, sum[1] / take.length, sum[2] / take.length];
    }
    // how tall a line of its words is, for how much to enlarge it to read
    var bands = [], run = 0;
    rowsWith.concat([false]).forEach(function (on) {
      if (on) { run++; } else if (run) { bands.push(run); run = 0; }
    });
    s.lineH = bands.length ? middleOf(bands) : 0;
  }

  // How thick a line is: the shorter of the runs across and down through a
  // few of its pixels.
  function pieceWidth(c, order, wire, W, H) {
    var runs = [], step = Math.max(1, Math.floor(c.n / 40));
    for (var k = c.from; k < c.to; k += step) {
      var p = order[k], x = p % W, y = (p - x) / W, a = 0, b = 0, id = wire[p];
      var l = x; while (l > 0 && wire[p - (x - l) - 1] === id) { l--; }
      var r = x; while (r < W - 1 && wire[p + (r - x) + 1] === id) { r++; }
      a = r - l + 1;
      var u = y; while (u > 0 && wire[p - (y - u + 1) * W] === id) { u--; }
      var d = y; while (d < H - 1 && wire[p + (d - y + 1) * W] === id) { d++; }
      b = d - u + 1;
      runs.push(Math.min(a, b));
    }
    return middleOf(runs) || 1;
  }

  // Touching pixels gathered into the few spots they are.
  function clustered(list, W, within) {
    var spots = [];
    list.forEach(function (p) {
      var x = p % W, y = (p - x) / W;
      for (var i = 0; i < spots.length; i++) {
        var s = spots[i];
        if (Math.abs(s.x - x) <= within && Math.abs(s.y - y) <= within) {
          s.sx += x; s.sy += y; s.n++;
          s.x = s.sx / s.n; s.y = s.sy / s.n;
          return;
        }
      }
      spots.push({ x: x, y: y, sx: x, sy: y, n: 1 });
    });
    return spots;
  }

  // The head of an arrow is ink crowded at its end: more of it near where
  // the line meets the shape than along the same length of line further
  // back.
  function headAt(c, t, order, W) {
    var near = Math.max(6, 4 * c.lw + 3), n1 = 0, n2 = 0;
    for (var k = c.from; k < c.to; k++) {
      var p = order[k], x = p % W, y = (p - x) / W;
      var d = Math.hypot(x - t.x, y - t.y);
      if (d < near) { n1++; } else if (d >= 2 * near && d < 3 * near) { n2++; }
    }
    var line = Math.max(n2, near * c.lw * 0.8);
    t.crowd = n1 / line;
    return n1 > 1.9 * line;
  }

  function farthest(c, order, W, from) {
    var best = null, bestD = -1;
    for (var k = c.from; k < c.to; k++) {
      var p = order[k], x = p % W, y = (p - x) / W, d = (x - from.x) * (x - from.x) + (y - from.y) * (y - from.y);
      if (d > bestD) { bestD = d; best = { x: x, y: y }; }
    }
    return best;
  }

  // ================================================== reading the words ==
  // Tesseract, fetched the first time and kept: its script, the program it
  // runs, and what it knows of the page's language, all from the one place
  // Python comes from.  One reader is started and reused.
  var OCR_AT = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
  var OCR_LANGS = { en: "eng", de: "deu", es: "spa", fr: "fra" };
  var ocrWaiting = null;
  function ocrReady() {
    if (ocrWaiting) { return ocrWaiting; }
    ocrWaiting = new Promise(function (ok, no) {
      if (window.Tesseract) { ok(window.Tesseract); return; }
      var tag = document.createElement("script");
      tag.src = OCR_AT;
      tag.async = true;
      tag.onload = function () { if (window.Tesseract) { ok(window.Tesseract); } else { no(new Error("ocr")); } };
      tag.onerror = function () { no(new Error("ocr")); };
      document.head.appendChild(tag);
    }).then(function (T) {
      return T.createWorker(OCR_LANGS[LANG] || "eng", 1);
    });
    ocrWaiting.catch(function () { ocrWaiting = null; });   // asked again next time
    return ocrWaiting;
  }

  // A canvas, handed to the reader as the picture it holds.  Handed the
  // canvas itself, Tesseract asks it for a file of itself, which some
  // browsers take a whole second to write however small it is; written
  // out here, it is ready at once.
  function ocrImage(canvas) { return canvas.toDataURL("image/png"); }

  // A shape's words, tidied of what the reading gets wrong at the edges: a
  // bar read from a stray line, curly quotes, a stray dot.
  function ocrTidy(text) {
    return flatWords(String(text || "")
      .replace(/[\u201c\u201d\u201e]/g, '"').replace(/[\u2018\u2019]/g, "'")
      .replace(/^[\s|_~\-\u2014.,:;'\x60\/\\\u00a6]+/, "")
      .replace(/[\s|_~\-\u2014,;'\x60\/\\\u00a6]+$/, "")
      .split(/\n/).filter(function (line) { return /[A-Za-z0-9\u00c0-\u024f]/.test(line); }).join(" "));
  }

  // The size Tesseract reads a line of words best at: its letters about
  // fourteen pixels from the top of a capital to the foot of the line.
  // Tried from eleven to twenty-six: larger reads the question mark after
  // a number as "7?" (n > 0? is n > 07?), and smaller loses the spaces
  // round the signs -- and the question and the signs are what a decision
  // is made of.
  var READ_AT = 15;
  function readGrow(lineH) { return Math.max(0.4, Math.min(4, READ_AT / Math.max(4, lineH))); }

  // A shape's words, read at that size -- and, where the reading is unsure
  // of them, a little smaller and half as big again as well: a size that
  // reads one line best can run the words of another together ("Inputn"),
  // read a question mark after a number as "7?", or read nothing at all.
  // The letters most of the readings agree on win (the first reading's if
  // none agree), written the way that has the spaces between its words.
  // The reader's own sureness is no guide: it was surer of "n > 07?" than
  // of "n > 0?", and sure of nothing at all about one it read right.
  function readShape(worker, big, seen, s) {
    var grow = readGrow(s.lineH ? s.lineH / seen.scale : READ_AT);
    function read(g) {
      return worker.recognize(ocrImage(shapeCrop(big, seen, s, g))).then(function (got) {
        return { text: ocrTidy(got.data.text), sure: got.data.confidence || 0 };
      });
    }
    return read(grow).then(function (first) {
      if (first.text && first.sure >= 90) { return first.text; }   // sure of it: once is enough
      return read(grow * 0.8).then(function (less) {
        return read(grow * 1.5).then(function (more) {
          var readings = [first, less, more].filter(function (r) { return r.text; });
          if (!readings.length) { return ""; }
          var votes = {};
          readings.forEach(function (r) {
            var key = r.text.replace(/\s+/g, "");
            votes[key] = (votes[key] || 0) + 1;
          });
          var best = first.text ? first.text.replace(/\s+/g, "") : readings[0].text.replace(/\s+/g, "");
          Object.keys(votes).forEach(function (key) { if (votes[key] > votes[best]) { best = key; } });
          return readings.filter(function (r) { return r.text.replace(/\s+/g, "") === best; })
            .sort(function (a, b) { return b.text.split(" ").length - a.text.split(" ").length; })[0].text;
        });
      });
    });
  }

  // The signs in a sum spaced the way they are written: "total =0" and
  // "n>0?" are read letter for letter, and "total = 0" and "n > 0?" are
  // what was drawn.  Not inside quotes, which say exactly what they say.
  function spacedSigns(s) {
    return String(s || "").split(/("[^"]*"|'[^']*')/).map(function (part, k) {
      return k % 2 ? part
        : part.replace(/\s*(<=|>=|<>|<-|->|!=|==|:=|=|<|>|\u2264|\u2265|\u2260|\u2190)\s*/g, " $1 ");
    }).join("").replace(/\s+/g, " ").trim();
  }

  // The inside of a shape, alone: the picture at its own size, everything
  // but the patch and the marks in it painted over with its fill, turned to
  // dark words on white whatever colors they were, and sized to be read.
  function shapeCrop(big, seen, s, grow) {
    var k = seen.scale, main = s.main, W = seen.W;
    var ox = Math.floor(main.x0 / k), oy = Math.floor(main.y0 / k);
    var ow = Math.max(1, Math.ceil((main.x1 + 1) / k) - ox), oh = Math.max(1, Math.ceil((main.y1 + 1) / k) - oy);
    grow = grow || readGrow(s.lineH ? s.lineH / k : READ_AT);
    var pad = 16;
    var src = big.getContext("2d").getImageData(ox, oy, ow, oh), d = src.data;
    var fill = s.fill, most = 1, i;
    var far = new Float32Array(ow * oh);
    for (var y = 0; y < oh; y++) {
      var wy = Math.min(seen.H - 1, Math.floor((oy + y) * k)), row = wy - main.y0;
      var lo = isFinite(main.L[row]) ? main.L[row] + 1 : Infinity, hi = isFinite(main.R[row]) ? main.R[row] - 1 : -Infinity;
      for (var x = 0; x < ow; x++) {
        var wx = Math.floor((ox + x) * k), at = (y * ow + x) * 4;
        if (wx < lo || wx > hi) { far[y * ow + x] = 0; continue; }
        var v = Math.max(Math.abs(d[at] - fill[0]), Math.abs(d[at + 1] - fill[1]), Math.abs(d[at + 2] - fill[2]));
        far[y * ow + x] = v;
        if (v > most) { most = v; }
      }
    }
    void W;
    for (i = 0; i < far.length; i++) {
      var g = 255 - Math.min(255, Math.max(0, (far[i] - 18) * 255 / Math.max(40, most - 18)));
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = g;
      d[i * 4 + 3] = 255;
    }
    var flat = document.createElement("canvas");
    flat.width = ow; flat.height = oh;
    flat.getContext("2d").putImageData(src, 0, 0);
    var out = document.createElement("canvas");
    out.width = Math.round(ow * grow) + pad * 2;
    out.height = Math.round(oh * grow) + pad * 2;
    var pen = out.getContext("2d");
    pen.fillStyle = "#ffffff";
    pen.fillRect(0, 0, out.width, out.height);
    pen.imageSmoothingQuality = "high";
    pen.drawImage(flat, pad, pad, out.width - pad * 2, out.height - pad * 2);
    return out;
  }

  // The lines outside the shapes, as runs of ink longer than a letter is
  // tall, across and down.  What is left when they are taken away is the
  // words -- even words an arrow's line runs straight through, as Mermaid
  // draws its arrows' words.
  function lineRuns(seen, textH) {
    var W = seen.W, H = seen.H, x, y, p, s;
    var longRun = Math.max(10, (textH || 14) * 1.3), gone = new Uint8Array(W * H);
    for (y = 0; y < H; y++) {
      s = 0;
      for (x = 0; x <= W; x++) {
        p = y * W + x;
        if (x < W && seen.wire[p] >= 0) { continue; }
        if (x - s >= longRun) { for (var a = s; a < x; a++) { gone[y * W + a] = 1; } }
        s = x + 1;
      }
    }
    for (x = 0; x < W; x++) {
      s = 0;
      for (y = 0; y <= H; y++) {
        p = y * W + x;
        if (y < H && seen.wire[p] >= 0) { continue; }
        if (y - s >= longRun) { for (var b = s; b < y; b++) { gone[b * W + x] = 1; } }
        s = y + 1;
      }
    }
    return gone;
  }

  // The rest of the picture, for the words beside the arrows: the shapes
  // and the lines painted out, and what is left turned to dark on white,
  // however far from white the paper was -- light words on a dark page read
  // the same as dark on light.
  function outsideCrop(big, seen, gone) {
    var k = seen.scale, W = seen.W, H = seen.H, x, y;
    var bw = big.width, bh = big.height;
    var img = big.getContext("2d").getImageData(0, 0, bw, bh), d = img.data;
    var pc = seen.paper, far = new Float32Array(bw * bh), most = 1;
    for (y = 0; y < bh; y++) {
      var wy = Math.min(H - 1, Math.floor(y * k));
      for (x = 0; x < bw; x++) {
        var wp = wy * W + Math.min(W - 1, Math.floor(x * k)), at = (y * bw + x) * 4;
        if (seen.owner[wp] >= 0 || gone[wp]) { continue; }
        var v = Math.max(Math.abs(d[at] - pc[0]), Math.abs(d[at + 1] - pc[1]), Math.abs(d[at + 2] - pc[2]));
        far[y * bw + x] = v;
        if (v > most) { most = v; }
      }
    }
    for (var i2 = 0; i2 < far.length; i2++) {
      var gray = 255 - Math.min(255, Math.max(0, (far[i2] - 18) * 255 / Math.max(40, most - 18)));
      d[i2 * 4] = d[i2 * 4 + 1] = d[i2 * 4 + 2] = gray;
      d[i2 * 4 + 3] = 255;
    }
    var flat = document.createElement("canvas");
    flat.width = bw; flat.height = bh;
    flat.getContext("2d").putImageData(img, 0, 0);
    return flat;
  }

  // Where the words outside the shapes are, without reading them: the
  // little pieces of ink -- letters -- gathered with their neighbours along
  // a line into the boxes of the few things written there ("Yes", "No").
  // Each box is then read as the one line it is, which reads a short word
  // far more surely than asking the reader to find it in the whole page.
  function letterBoxes(seen, gone) {
    var heights = seen.shapes.map(function (s) { return s.lineH; }).filter(Boolean);
    var lh = middleOf(heights) || 12;
    // the ink left once the lines are gone, in joined-up pieces; a piece
    // against a shape is an arrow's head, not a letter
    var W = seen.W, H = seen.H, N = W * H, mark = new Int32Array(N).fill(-1), stack = [], found = [];
    for (var p = 0; p < N; p++) {
      if (seen.wire[p] < 0 || gone[p] || mark[p] >= 0) { continue; }
      var c = { x0: W, y0: H, x1: -1, y1: -1, n: 0, near: false };
      mark[p] = found.length;
      stack.push(p);
      while (stack.length) {
        var q = stack.pop(), qx = q % W, qy = (q - qx) / W;
        c.n++;
        if (qx < c.x0) { c.x0 = qx; } if (qx > c.x1) { c.x1 = qx; }
        if (qy < c.y0) { c.y0 = qy; } if (qy > c.y1) { c.y1 = qy; }
        for (var ny = Math.max(0, qy - 2); ny <= Math.min(H - 1, qy + 2); ny++) {
          for (var nx = Math.max(0, qx - 2); nx <= Math.min(W - 1, qx + 2); nx++) {
            var m = ny * W + nx;
            if (seen.owner[m] >= 0) { c.near = true; continue; }
            if (Math.abs(nx - qx) > 1 || Math.abs(ny - qy) > 1) { continue; }
            if (seen.wire[m] < 0 || gone[m] || mark[m] >= 0) { continue; }
            mark[m] = found.length;
            stack.push(m);
          }
        }
      }
      found.push(c);
    }
    var letters = found.filter(function (c) {
      return c.n >= 3 && !c.near && Math.max(c.x1 - c.x0, c.y1 - c.y0) + 1 <= Math.max(2.2 * lh, 24);
    }).sort(function (a, b) { return a.x0 - b.x0; });
    var up = letters.map(function (c, k) { return k; });
    function top(k) { while (up[k] !== k) { up[k] = up[up[k]]; k = up[k]; } return k; }
    for (var i = 0; i < letters.length; i++) {
      for (var j = i + 1; j < letters.length; j++) {
        var a = letters[i], b = letters[j];
        if (b.x0 - a.x1 > 0.9 * lh) { break; }  // sorted along: nothing further is nearer
        var over = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (over > -0.25 * lh) { up[top(j)] = top(i); }
      }
    }
    var boxes = {};
    letters.forEach(function (c, k) {
      var r = top(k), bx = boxes[r] || (boxes[r] = { x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1, n: 0 });
      bx.x0 = Math.min(bx.x0, c.x0); bx.y0 = Math.min(bx.y0, c.y0);
      bx.x1 = Math.max(bx.x1, c.x1); bx.y1 = Math.max(bx.y1, c.y1);
      bx.n++;
    });
    // Each box grown along its own line while there is ink beside it: the
    // letters of a word that an arrow's curve runs through belong to the
    // curve's piece, not to any letter's, and a box of the letters that
    // were found is only part of the word ("ne" of "done").
    function inkAt(x, y0, y1) {
      for (var y = y0; y <= y1; y++) {
        var at = y * W + x;
        if (seen.wire[at] >= 0 && !gone[at] && seen.owner[at] < 0) { return true; }
      }
      return false;
    }
    function grown(bx) {
      var h = bx.y1 - bx.y0 + 1, gap = Math.max(3, Math.round(0.7 * h)), most = 8 * h;
      [-1, 1].forEach(function (way) {
        var x = way < 0 ? bx.x0 - 1 : bx.x1 + 1, miss = 0, went = 0;
        while (x >= 0 && x < W && miss <= gap && went < most) {
          if (inkAt(x, bx.y0, bx.y1)) {
            if (way < 0) { bx.x0 = x; } else { bx.x1 = x; }
            miss = 0;
          } else { miss++; }
          x += way;
          went++;
        }
      });
      return bx;
    }
    var list = Object.keys(boxes).map(function (k) { return boxes[k]; }).filter(function (bx) {
      var h = bx.y1 - bx.y0 + 1, w = bx.x1 - bx.x0 + 1;
      return h >= 0.5 * lh && h <= 3 * lh && w >= 0.4 * lh;
    }).map(grown).sort(function (a, b) { return a.x0 - b.x0; });
    // two parts of one word, grown into each other, are the one word
    var out = [];
    list.forEach(function (bx) {
      var same = out.filter(function (o) {
        var over = Math.min(o.y1, bx.y1) - Math.max(o.y0, bx.y0);
        return over > 0.5 * Math.min(o.y1 - o.y0, bx.y1 - bx.y0) && bx.x0 <= o.x1 + 1;
      })[0];
      if (!same) { out.push(bx); return; }
      same.x0 = Math.min(same.x0, bx.x0); same.y0 = Math.min(same.y0, bx.y0);
      same.x1 = Math.max(same.x1, bx.x1); same.y1 = Math.max(same.y1, bx.y1);
    });
    return out;
  }

  // One of those boxes, cut out of the page made dark on white, and sized
  // to be read.
  function boxCrop(flat, seen, bx) {
    var k = seen.scale, pad = 3, side = 4;
    var x0 = Math.max(0, Math.floor((bx.x0 - side) / k)), y0 = Math.max(0, Math.floor((bx.y0 - pad) / k));
    var x1 = Math.min(flat.width, Math.ceil((bx.x1 + side + 1) / k)), y1 = Math.min(flat.height, Math.ceil((bx.y1 + pad + 1) / k));
    var grow = readGrow((bx.y1 - bx.y0 + 1) / k), margin = 14;
    var out = document.createElement("canvas");
    out.width = Math.max(1, Math.round((x1 - x0) * grow)) + margin * 2;
    out.height = Math.max(1, Math.round((y1 - y0) * grow)) + margin * 2;
    var pen = out.getContext("2d");
    pen.fillStyle = "#ffffff";
    pen.fillRect(0, 0, out.width, out.height);
    pen.imageSmoothingQuality = "high";
    pen.drawImage(flat, x0, y0, x1 - x0, y1 - y0, margin, margin, out.width - margin * 2, out.height - margin * 2);
    return out;
  }

  // Words beside one another on a line, and lines under one another,
  // gathered into the few things written: "Yes", "No", "x > 10".
  function wordsGathered(words) {
    var items = words.map(function (w) {
      return { text: w.text, x0: w.x0, y0: w.y0, x1: w.x1, y1: w.y1 };
    }).sort(function (a, b) { return a.y0 - b.y0 || a.x0 - b.x0; });
    var out = [];
    items.forEach(function (w) {
      var h = w.y1 - w.y0;
      var home = out.filter(function (o) {
        var oh = o.lineH;
        var sameLine = Math.min(o.y1, w.y1) - Math.max(o.lastY0, w.y0) > 0.5 * Math.min(oh, h) &&
                       w.x0 - o.lastX1 < 1.4 * Math.max(oh, h) && w.x0 > o.lastX0;
        var under = w.y0 - o.y1 < 0.7 * Math.max(oh, h) && w.y0 >= o.y1 - 2 &&
                    Math.min(o.x1, w.x1) - Math.max(o.x0, w.x0) > -0.5 * h;
        return sameLine || under;
      })[0];
      if (!home) {
        out.push({ text: w.text, x0: w.x0, y0: w.y0, x1: w.x1, y1: w.y1, lineH: h,
                   lastX0: w.x0, lastX1: w.x1, lastY0: w.y0 });
        return;
      }
      home.text += " " + w.text;
      home.x0 = Math.min(home.x0, w.x0); home.y0 = Math.min(home.y0, w.y0);
      home.x1 = Math.max(home.x1, w.x1); home.y1 = Math.max(home.y1, w.y1);
      home.lastX0 = w.x0; home.lastX1 = w.x1; home.lastY0 = w.y0;
    });
    return out;
  }

  // Every shape's words and the words beside the arrows.  `given` is words
  // already known with their places (an SVG says its own), which need no
  // reading.  -> Promise of { texts: [per shape], labels: [...], read }
  function pictureWords(big, seen, given, turn) {
    var shapes = seen.shapes, k = seen.scale;
    if (given && given.length) {
      var texts = shapes.map(function () { return []; }), loose = [];
      given.forEach(function (w) {
        var cx = (w.x0 + w.x1) / 2 * k, cy = (w.y0 + w.y1) / 2 * k;
        var home = -1;
        shapes.forEach(function (s, i) {
          var row = Math.round(cy) - s.y0;
          if (row >= 0 && row < s.h && cx >= s.L[row] - 2 && cx <= s.R[row] + 2) { home = i; }
        });
        if (home >= 0) { texts[home].push(w); } else { loose.push(w); }
      });
      return Promise.resolve({
        texts: texts.map(function (list) {
          return flatWords(wordsGathered(list).map(function (g) { return g.text; }).join(" "));
        }),
        labels: wordsGathered(loose).map(function (g) {
          return { text: flatWords(g.text), x: (g.x0 + g.x1) / 2 * k, y: (g.y0 + g.y1) / 2 * k,
                   h: (g.y1 - g.y0) * k };
        }),
        read: true
      });
    }
    return ocrReady().then(function (worker) {
      var texts = [], total = shapes.length, chain = worker.setParameters({ tessedit_pageseg_mode: "6" });
      shapes.forEach(function (s, i) {
        chain = chain.then(function () {
          if (turn !== inTurn) { throw new Error("stopped"); }
          inBusy(say("pic_words", { n: i + 1, m: total }));
          if (s.marks < 12) { texts[i] = ""; return null; }
          return readShape(worker, big, seen, s).then(function (text) {
            texts[i] = spacedSigns(text);
          });
        });
      });
      return chain.then(function () {
        if (turn !== inTurn) { throw new Error("stopped"); }
        inBusy(TXT.pic_labels);
        var heights = shapes.map(function (s) { return s.lineH; }).filter(Boolean);
        var gone = lineRuns(seen, middleOf(heights));
        var flat = outsideCrop(big, seen, gone);
        var labels = [], more = worker.setParameters({ tessedit_pageseg_mode: "7" });
        letterBoxes(seen, gone).slice(0, 60).forEach(function (bx) {
          more = more.then(function () {
            if (turn !== inTurn) { throw new Error("stopped"); }
            return worker.recognize(ocrImage(boxCrop(flat, seen, bx))).then(function (got) {
              var t = spacedSigns(ocrTidy(got.data.text));
              if (!/[A-Za-z0-9\u00c0-\u024f]/.test(t)) { return; }
              if (t.length === 1 && !/^[YyNnTtFf0-9]$/.test(t)) { return; }
              if ((got.data.confidence || 0) < (t.length <= 2 ? 60 : 40)) { return; }
              labels.push({ text: t, x: (bx.x0 + bx.x1) / 2, y: (bx.y0 + bx.y1) / 2, h: bx.y1 - bx.y0 + 1 });
            });
          });
        });
        return more.then(function () {
          return worker.setParameters({ tessedit_pageseg_mode: "6" });
        }).then(function () { return { texts: texts, labels: labels, read: true }; });
      });
    }, function () {
      return { texts: shapes.map(function () { return ""; }), labels: [], read: false };
    });
  }

  // ================================================== into a graph ==
  // A word on an arrow out of a question is nearly always an answer to it,
  // and a word of two or three letters read alone is easily read a letter
  // wrong ("Yer", "Wo"): one letter from an answer is that answer.
  function editGap(a, b) {
    var row = [], i, j;
    for (j = 0; j <= b.length; j++) { row.push(j); }
    for (i = 1; i <= a.length; i++) {
      var prev = row[0];
      row[0] = i;
      for (j = 1; j <= b.length; j++) {
        var was = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        prev = was;
      }
    }
    return row[b.length];
  }
  function answerMended(word) {
    var w = String(word || "").trim();
    if (w.length < 2 || w.length > 6) { return w; }
    var answers = ["Yes", "No", "True", "False", TXT.yes, TXT.no, TXT.yes_plain, TXT.no_plain]
      .filter(function (a) { return a && a.length >= 2; });
    if (answers.some(function (a) { return a.toLowerCase() === w.toLowerCase(); })) { return w; }
    var near = answers.filter(function (a) { return editGap(a.toLowerCase(), w.toLowerCase()) === 1; });
    return near.length ? near[0] : w;
  }

  // What was seen and what was read, as the graph the drawing is made from.
  function pictureGraph(seen, said) {
    var shapes = seen.shapes, k = seen.scale;
    var areas = shapes.map(function (s) { return s.w * s.h; });
    var usual = middleOf(areas) || 1;
    var widths = shapes.map(function (s) { return s.border; }).filter(Boolean);
    var usualBorder = middleOf(widths) || 1;
    var nodes = shapes.map(function (s, i) {
      var text = said.texts[i] || "";
      var kind = s.kind;
      if ((kind === "oval" || kind === "circle") && s.w / s.h >= 0.8 && s.w / s.h <= 1.25 &&
          (!text || s.w * s.h < 0.5 * usual)) { kind = "circle"; }
      else if (kind === "circle") { kind = "oval"; }
      var look = { fill: hexRgb(s.fill[0], s.fill[1], s.fill[2]) };
      look.line = s.line ? hexRgb(s.line[0], s.line[1], s.line[2]) : look.fill;
      if (s.words) { look.text = hexRgb(s.words[0], s.words[1], s.words[2]); }
      if (s.border >= usualBorder * 1.7 && s.border >= 3) { look.weight = "thick"; }
      return { key: "p" + i, kind: kind, text: text, x: s.cx / k, y: s.cy / k,
               w: s.w / k, h: s.h / k, look: look, area: s.w * s.h };
    });
    var links = [];
    seen.nets.forEach(function (net) {
      net.links.forEach(function (l) {
        links.push({ from: "p" + l.from, to: "p" + l.to, label: "", net: net, tail: l.tail, head: l.head });
      });
    });
    // A little box of words on an arrow (Mermaid draws Yes and No that way)
    // is the arrow's words, not a step: the arrow runs on through it.  One
    // beside an arrow rather than on it is words for the arrow nearest.
    // Such a box is a plain box, small beside the steps, and either says
    // an answer or has no border of its own; an oval saying Start, or a
    // small bordered step (i = i + 1), is a step.
    var gone = {}, bridges = [], loose = said.labels.slice();
    nodes.forEach(function (n, i) {
      if (!n.text || n.area > 0.45 * usual || n.text.length > 14) { return; }
      if (!/^(rect|roundrect)$/.test(shapes[i].kind)) { return; }
      var answer = /^(yes|no|true|false|y|n|t|f|ok|else|other|default)$/i.test(n.text);
      var bare = !shapes[i].line || shapes[i].border < 1;
      var ins = links.filter(function (l) { return l.to === n.key; });
      var outs = links.filter(function (l) { return l.from === n.key; });
      if (!answer && !(bare && ins.length && outs.length)) { return; }
      gone[n.key] = true;
      if (ins.length && outs.length) {
        ins.forEach(function (a) {
          outs.forEach(function (b) {
            if (a.from !== b.to) { bridges.push({ from: a.from, to: b.to, label: n.text }); }
          });
        });
        return;
      }
      var s = shapes[i];
      loose.push({ text: n.text, x: s.cx, y: s.cy, h: Math.min(s.h, 24) });
    });
    links = links.filter(function (l) { return !gone[l.from] && !gone[l.to]; });
    // The words beside an arrow go on it: the nearest arrow's line, and of
    // its arrows the one leaving nearest them.
    loose.forEach(function (lb) {
      if (!lb.text) { return; }
      var best = null, bestD = Infinity;
      seen.nets.forEach(function (net) {
        if (!net.links.length) { return; }
        net.pieces.forEach(function (c) {
          var step = Math.max(1, Math.floor(c.n / 200));
          for (var q = c.from; q < c.to; q += step) {
            var p = seen.order[q], x = p % seen.W, y = (p - x) / seen.W;
            var d = Math.hypot(x - lb.x, y - lb.y);
            if (d < bestD) { bestD = d; best = net; }
          }
        });
      });
      seen.gaps.forEach(function (gp) {
        var d = Math.hypot(gp.x - lb.x, gp.y - lb.y) * 0.5;
        var net = seen.nets.filter(function (n) { return n.key === gp.net; })[0];
        if (net && net.links.length && d < bestD) { bestD = d; best = net; }
      });
      if (!best || bestD > Math.max(20, 2.5 * lb.h)) { return; }
      var mine = links.filter(function (l) { return l.net === best; });
      mine.sort(function (a, b) {
        return Math.hypot(a.tail.x - lb.x, a.tail.y - lb.y) - Math.hypot(b.tail.x - lb.x, b.tail.y - lb.y);
      });
      if (mine[0] && !mine[0].label) { mine[0].label = lb.text; }
    });
    var kindOf = {};
    nodes.forEach(function (n) { kindOf[n.key] = n.kind; });
    links.concat(bridges).forEach(function (l) {
      if (kindOf[l.from] === "diamond" && l.label) { l.label = answerMended(l.label); }
    });
    return {
      nodes: nodes.filter(function (n) { return !gone[n.key]; }),
      links: links.concat(bridges).map(function (l) { return { from: l.from, to: l.to, label: l.label }; }),
      placed: true, from: "picture",
      paper: hexRgb(seen.paper[0], seen.paper[1], seen.paper[2]),
      ink: seen.ink ? hexRgb(seen.ink[0], seen.ink[1], seen.ink[2]) : ""
    };
  }

  // ================================================== opening one ==
  // The picture at its own size (for the words), and a copy of it at a
  // size that is quick to look at: about fourteen hundred pixels at its
  // longest, and no smaller than seven hundred.
  function pictureOf(blob) {
    if (typeof createImageBitmap === "function") {
      return createImageBitmap(blob).catch(function () { return pictureByImg(blob); });
    }
    return pictureByImg(blob);
  }
  function pictureByImg(blob) {
    return new Promise(function (ok, no) {
      var url = URL.createObjectURL(blob), img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); ok(img); };
      img.onerror = function () { URL.revokeObjectURL(url); no(new Error(TXT.pic_bad)); };
      img.src = url;
    });
  }
  function canvasOf(img, w, h) {
    var c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    var pen = c.getContext("2d", { willReadFrequently: true });
    pen.fillStyle = "#ffffff";
    pen.fillRect(0, 0, c.width, c.height);
    pen.imageSmoothingQuality = "high";
    pen.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  // Read and opened.  `done(ok, said)` is told how it went.
  function readPicture(name, img, done, given) {
    var turn = ++inTurn;
    inBusy(TXT.pic_looking);
    var iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    if (!iw || !ih) { inDone(); done(false, TXT.pic_bad); return; }
    // the words are read from the picture no smaller than it came
    var cap = Math.min(1, Math.sqrt(16e6 / (iw * ih)));
    var big = canvasOf(img, iw * cap, ih * cap);
    if (given) {
      given = given.map(function (w) {
        return { text: w.text, x0: w.x0 * cap, y0: w.y0 * cap, x1: w.x1 * cap, y1: w.y1 * cap };
      });
    }
    var long = Math.max(big.width, big.height);
    var fit = Math.min(1400, Math.max(700, long)) / long;
    var work = canvasOf(big, big.width * fit, big.height * fit);
    // looked at after a frame, so the words saying so are on the screen first
    setTimeout(function () {
      var seen;
      try {
        seen = pictureRead(work.getContext("2d").getImageData(0, 0, work.width, work.height));
      } catch (e) {
        inDone();
        done(false, TXT.pic_bad);
        return;
      }
      if (turn !== inTurn) { return; }
      if (!seen.shapes.length) { inDone(); done(false, TXT.pic_none); return; }
      seen.scale = fit;
      pictureWords(big, seen, given, turn).then(function (said) {
        if (turn !== inTurn) { return; }
        var got = openGraph(pictureGraph(seen, said), name);
        inDone();
        if (!got) { done(false, TXT.pic_none); return; }
        done(true, say(said.read ? "pic_read" : "pic_unread", { name: name, n: got.shapes, m: got.arrows }));
      }).catch(function () {
        if (turn === inTurn) { inDone(); }
      });
    }, 30);
  }

  // A picture file: the drawing inside it, where it carries one; read by
  // eye otherwise.
  function openPicture(name, blob, done) {
    done = done || function () {};
    var bytes;
    blob.arrayBuffer().then(function (buf) {
      bytes = new Uint8Array(buf);
      return pngNotes(bytes);
    }).then(function (notes) {
      if (notes["flowchart-builder"]) {
        var was = null;
        try { was = JSON.parse(outOfLink(notes["flowchart-builder"])); } catch (e) { was = null; }
        if (was && was.what === "flowchart-builder") {
          openProject(was);
          done(true, say("f_opened", { name: name }));
          return;
        }
      }
      var dio = notes.mxfile || notes.mxGraphModel;
      if (dio) {
        if (!/^\s*</.test(dio)) { try { dio = decodeURIComponent(dio); } catch (e) { /* as it is */ } }
        openDrawn(name, dio, "drawio", done);
        return;
      }
      var ex = notes["application/vnd.excalidraw+json"];
      if (ex) {
        excalidrawScene(ex).then(function (scene) {
          var got = scene && openGraph(excalidrawGraph(scene), name);
          if (got) { done(true, drawnSaid(name, got)); return; }
          byEye();
        });
        return;
      }
      byEye();
    }).catch(byEye);
    function byEye() {
      pictureOf(blob).then(function (img) { readPicture(name, img, done); },
                           function () { done(false, TXT.pic_bad); });
    }
  }

  // ------------------------------------------------------------- SVG --
  // An SVG is a picture written as words.  draw.io's carries its drawing in
  // an attribute, Excalidraw's in a note; anything else is drawn, and read
  // like any picture -- except for its words, which it says itself.
  function openSvg(name, text, done) {
    done = done || function () {};
    var root = xmlFirst(xmlTree(text), "svg");
    var inside = root && root.at.content;
    if (inside && isDrawio(inside)) { openDrawn(name, inside, "drawio", done); return; }
    var pay = /payload-start\s*-->\s*([A-Za-z0-9+\/=\s]+?)\s*<!--\s*payload-end/.exec(text);
    if (pay) {
      var said = "";
      try { said = atob(pay[1].replace(/\s+/g, "")); } catch (e) { said = ""; }
      excalidrawScene(said).then(function (scene) {
        if (!scene) {                      // written as UTF-8 by an older Excalidraw
          try { return excalidrawScene(utf8Of(bytesOf64(pay[1]))); } catch (e) { return null; }
        }
        return scene;
      }).then(function (scene) {
        var got = scene && openGraph(excalidrawGraph(scene), name);
        if (got) { done(true, drawnSaid(name, got)); } else { svgByEye(name, text, done); }
      });
      return;
    }
    svgByEye(name, text, done);
  }

  // What an SVG from anywhere may not do when it is put on this page to be
  // measured: run anything, or fetch anything.
  function svgCleaned(text) {
    var doc = new DOMParser().parseFromString(text, "image/svg+xml");
    var svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== "svg" || doc.getElementsByTagName("parsererror").length) {
      return null;
    }
    Array.prototype.slice.call(svg.querySelectorAll("script, iframe, object, embed, audio, video, a"))
      .forEach(function (el) {
        if (el.nodeName.toLowerCase() === "a") {
          while (el.firstChild) { el.parentNode.insertBefore(el.firstChild, el); }
        }
        el.parentNode.removeChild(el);
      });
    [svg].concat(Array.prototype.slice.call(svg.querySelectorAll("*"))).forEach(function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (at) {
        var n = at.name.toLowerCase(), v = String(at.value || "");
        if (/^on/.test(n)) { el.removeAttribute(at.name); return; }
        if (/href$/.test(n) && !/^(#|data:image\/)/i.test(v.trim())) { el.removeAttribute(at.name); }
      });
    });
    Array.prototype.slice.call(svg.querySelectorAll("style")).forEach(function (st) {
      st.textContent = st.textContent.replace(/@import[^;]*;?/gi, "").replace(/url\((?!\s*['"]?\s*(#|data:))[^)]*\)/gi, "none");
    });
    return svg;
  }

  function svgByEye(name, text, done) {
    var svg = svgCleaned(text);
    if (!svg) { done(false, TXT.pic_bad); return; }
    // its size: what it says, or what its viewBox says, made about 1400 across
    var box = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    var w = parseFloat(svg.getAttribute("width")) || box[2] || 800;
    var h = parseFloat(svg.getAttribute("height")) || box[3] || 600;
    if (/%$/.test(svg.getAttribute("width") || "") && box[2]) { w = box[2]; h = box[3]; }
    var grow = Math.min(4, Math.max(1, 1400 / Math.max(w, h)));
    svg.setAttribute("width", String(w * grow));
    svg.setAttribute("height", String(h * grow));
    if (!svg.getAttribute("viewBox")) { svg.setAttribute("viewBox", "0 0 " + w + " " + h); }
    // the size it is drawn at, whatever its own style says (Mermaid's says
    // max-width), so the words are measured where they are drawn
    svg.style.maxWidth = "none";
    svg.style.width = (w * grow) + "px";
    svg.style.height = (h * grow) + "px";
    // its words, from where the browser puts them
    var holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-30000px;top:0;visibility:hidden;pointer-events:none;";
    holder.appendChild(document.importNode(svg, true));
    document.body.appendChild(holder);
    var shown = holder.firstChild, frame = shown.getBoundingClientRect(), words = [];
    Array.prototype.slice.call(shown.querySelectorAll("text, foreignObject")).forEach(function (el) {
      if (el.nodeName.toLowerCase() === "text" && el.closest("foreignObject")) { return; }
      var said = flatWords(el.textContent);
      if (!said) { return; }
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) { return; }
      words.push({ text: said, x0: r.left - frame.left, y0: r.top - frame.top,
                   x1: r.right - frame.left, y1: r.bottom - frame.top });
    });
    document.body.removeChild(holder);
    // drawn: without its HTML labels if the browser will not let a
    // picture with them be looked into
    function draw(markup) {
      return new Promise(function (ok, no) {
        var url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
        var img = new Image();
        img.onload = function () {
          URL.revokeObjectURL(url);
          try {
            var c = canvasOf(img, w * grow, h * grow);
            c.getContext("2d").getImageData(0, 0, 1, 1);
            ok(c);
          } catch (e) { no(e); }
        };
        img.onerror = function () { URL.revokeObjectURL(url); no(new Error(TXT.pic_bad)); };
        img.src = url;
      });
    }
    var markup = new XMLSerializer().serializeToString(svg);
    draw(markup).catch(function () {
      Array.prototype.slice.call(svg.querySelectorAll("foreignObject")).forEach(function (f) {
        f.parentNode.removeChild(f);
      });
      return draw(new XMLSerializer().serializeToString(svg));
    }).then(function (canvas) {
      readPicture(name, canvas, done, words.length ? words : null);
    }, function () { done(false, TXT.pic_bad); });
  }
