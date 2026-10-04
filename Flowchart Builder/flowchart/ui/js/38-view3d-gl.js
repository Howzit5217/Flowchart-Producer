// ---------------------------------------------------------------------------
//  38-view3d-gl.js -- a home in 3D, drawn with WebGL: a depth buffer, the sun
//  and its shadows, a sky, grass and trees round it
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ========================================================== by the GPU ==
  // 38-view3d.js puts a house up as faces and draws them back to front, the
  // way a painter does: the furthest first, everything nearer over it.  That
  // is right for a box seen from above and wrong for a long wall beside a
  // chair, walked past -- which one is "nearer" depends on the part of each
  // you look at, so a sofa showed through the wall behind it and a wall
  // through the door in front of it.  And a picture on a face was laid on
  // by three of its corners, which is exact seen from above and wrong in
  // perspective, where a rectangle is no longer a parallelogram: the
  // pictures on the furniture slid off it as you walked (asked for,
  // 2026-10-01: "the images of stuff in 3d also warps rather than being on
  // their objects and there is still the clipping issues in the 3d walking
  // around mode").
  //
  // So a home is drawn here instead, wherever the browser has WebGL: the
  // same faces, each kept or hidden pixel by pixel by how near it really is
  // (a depth buffer), pictures carried by the faces themselves, and with the
  // room that leaves (asked for the same day: "make it so the world looks
  // better ... and to update the outside scenery too") the sun: a light from
  // the sky over everything, shadows where the house and the trees stand in
  // its way, a sky with clouds, grass running off to the hills, trees round
  // the plot and a road along its front.  The roof is shingled, the floors
  // are boards -- or tiles, in a kitchen or a bathroom -- and the pool is
  // water.  Space, and a browser without WebGL, are drawn the old way.
  //
  // It draws into a canvas of its own, off the page, and that picture is
  // laid on the view's canvas first: the names, the map and a fade between
  // two views go on over it exactly as they did.
  var GL3_NEAR = 2;                      // px: nothing nearer the eye is drawn (body is 12)
  var GL3_FAR = 26000;                   // px: the hills are well inside this
  var GL3_SUN = (function () {           // the way to the sun: up, from the north-west
    var v = [-0.42, -0.58, 0.7], l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  })();
  var GL3_SHADOW = 2048;                 // the shadow map's size, in texels a side
  var GL3_LAMP = 1024;                   // the ceiling light's, indoors
  var GL3_STRIDE = 13;                   // floats a vertex: pos 3, normal 3, color 4, uv 2, pattern 1

  // What a face is covered in, worked out in the shader from where it is.
  var PAT = { plain: 0, roof: 1, boards: 2, grass: 3, road: 4, walk: 5, lawn: 6, tiles: 7,
              leaves: 8, water: 9, concrete: 10, bark: 11, hill: 12, siding: 13, line: 99 };

  function gl3Rgb(c) {                   // a color as three numbers 0..1
    c = String(c || "").trim();
    var m;
    if ((m = /^#([0-9a-f]{3})$/i.exec(c))) { c = "#" + m[1][0] + m[1][0] + m[1][1] + m[1][1] + m[1][2] + m[1][2]; }
    if ((m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c))) {
      return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
    }
    if ((m = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c))) {
      return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
    }
    return [1, 1, 1];
  }
  function gl3Mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  // Rows of a matrix, as WebGL wants it (a column at a time).
  function gl3Mat(r0, r1, r2, r3) {
    return new Float32Array([r0[0], r1[0], r2[0], r3[0], r0[1], r1[1], r2[1], r3[1],
                             r0[2], r1[2], r2[2], r3[2], r0[3], r1[3], r2[3], r3[3]]);
  }
  // The same every time for the same numbers: where the trees stand.
  function gl3Rand(seed) {
    var a = seed | 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---- the programs ------------------------------------------------------------
  var GL3_VS = [
    "attribute vec3 aPos; attribute vec3 aNorm; attribute vec4 aColor; attribute vec2 aUv; attribute float aPat;",
    "uniform mat4 uMvp; uniform mat4 uSunMvp; uniform float uNudge; uniform mat4 uLampMvp;",
    "varying vec3 vPos; varying vec3 vNorm; varying vec4 vColor; varying vec2 vUv; varying float vPat; varying vec4 vSun; varying vec4 vLampS;",
    "void main() {",
    "  vPos = aPos; vNorm = aNorm; vColor = aColor; vUv = aUv; vPat = aPat;",
    // looked up in the sun's view a shadow-map texel or so out from the
    // surface, along its way out: no speckles of its own shadow on it, and
    // no gap where a wall meets the shadow it throws
    "  vSun = uSunMvp * vec4(aPos + aNorm * uNudge, 1.0);",
    // and in the ceiling light's, indoors (2026-10-02: "accurate shadows and depth inside")
    "  vLampS = uLampMvp * vec4(aPos + aNorm * 1.2, 1.0);",
    "  gl_Position = uMvp * vec4(aPos, 1.0);",
    "}"].join("\n");

  var GL3_FS = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec3 uSunDir; uniform vec3 uSunCol; uniform vec3 uSkyAmb; uniform vec3 uGroundAmb;",
    "uniform vec3 uEye; uniform vec3 uToward; uniform float uOrtho;",
    "uniform vec3 uFogCol; uniform float uFogNear; uniform float uFogFar;",
    "uniform sampler2D uTex; uniform float uUseTex; uniform float uDecal; uniform float uRound; uniform float uBill;",
    "uniform sampler2D uShadow; uniform float uShadowOn; uniform float uAlpha; uniform float uPx; uniform float uTime;",
    "uniform vec2 uFade; uniform vec2 uMid; uniform float uIndoor; uniform float uDress; uniform vec3 uLamp;",
    "uniform float uNight; uniform float uGlow;",       // how dark it is out (38-view3d-more.js); a window lit from in
    "uniform vec4 uRooms[24]; uniform float uRoomN;",   // after dark, each room's ceiling light: where, and how far it reaches (and the lights out of doors)
    // indoors: the room's ceiling light's own shadows, and the room's box (its
    // floor and ceiling heights) for the darker corners and edges a room has
    "uniform sampler2D uLampShadow; uniform float uLampOn; uniform vec4 uRoomBox; uniform vec2 uRoomZ;",
    "uniform float uTexOn;",                          // textures on (40-texture.js): patterns, their ridges, metal's shine
    "varying vec3 vPos; varying vec3 vNorm; varying vec4 vColor; varying vec2 vUv; varying float vPat; varying vec4 vSun; varying vec4 vLampS;",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "float unpack(vec4 c) { return dot(c, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)); }",
    "float lit(vec3 n) {",
    "  float d = dot(n, uSunDir);",
    "  if (d <= 0.0 || uShadowOn < 0.5) { return max(d, 0.0); }",
    "  vec3 s = vSun.xyz / vSun.w * 0.5 + 0.5;",
    "  if (s.x <= 0.0 || s.x >= 1.0 || s.y <= 0.0 || s.y >= 1.0 || s.z >= 1.0) { return d; }",
    // nine looks, each weighed between the four texels round it: an edge
    // as soft as one texel and as sharp, where it truly is
    "  float bias = 0.0004 + 0.0012 * (1.0 - d), sum = 0.0, N = " + GL3_SHADOW + ".0;",
    "  vec2 t = s.xy * N - 0.5, f = fract(t), c0 = floor(t) - 1.0;",
    "  for (int i = 0; i < 4; i++) { for (int j = 0; j < 4; j++) {",
    "    float wx = i == 0 ? 1.0 - f.x : (i == 3 ? f.x : 1.0), wy = j == 0 ? 1.0 - f.y : (j == 3 ? f.y : 1.0);",
    "    float near = unpack(texture2D(uShadow, (c0 + vec2(float(i), float(j)) + 0.5) / N));",
    "    sum += (s.z - bias > near ? 0.0 : 1.0) * wx * wy;",
    "  } }",
    "  return d * sum / 9.0;",
    "}",
    // how much of the ceiling light reaches here, past what stands under it
    "float lampLit() {",
    "  if (uLampOn < 0.5 || vLampS.w <= 0.0) { return 1.0; }",
    "  vec3 s = vLampS.xyz / vLampS.w * 0.5 + 0.5;",
    "  if (s.x <= 0.0 || s.x >= 1.0 || s.y <= 0.0 || s.y >= 1.0 || s.z >= 1.0 || s.z <= 0.0) { return 1.0; }",
    "  float sum = 0.0, N = " + GL3_LAMP + ".0;",
    "  vec2 t = s.xy * N - 0.5, f = fract(t), c0 = floor(t) - 1.0;",
    "  for (int i = 0; i < 4; i++) { for (int j = 0; j < 4; j++) {",
    "    float wx = i == 0 ? 1.0 - f.x : (i == 3 ? f.x : 1.0), wy = j == 0 ? 1.0 - f.y : (j == 3 ? f.y : 1.0);",
    "    float near = unpack(texture2D(uLampShadow, (c0 + vec2(float(i), float(j)) + 0.5) / N));",
    "    sum += (s.z - 0.0006 > near ? 0.0 : 1.0) * wx * wy;",
    "  } }",
    "  return sum / 9.0;",
    "}",
    "void main() {",
    "  float k = vPat, dr = uDress;",
    "  if (k > 199.5) { k -= 200.0; dr = 1.0; }",          // (dressed whatever the rest is: the furniture, flat with 3D furniture, 40-flat3d.js)
    "  if (k > 98.5) {",                                // a line: the edges, as a plan draws them
    "    float dl = uOrtho > 0.5 ? 0.0 : length(uEye - vPos);",
    "    float fl = clamp((dl - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);",
    "    gl_FragColor = vec4(vColor.rgb, vColor.a * uAlpha * (1.0 - fl)); return;",
    "  }",
    "  vec4 tex = vec4(0.0);",
    "  if (uUseTex > 0.5) {",
    "    if (uRound > 0.5 && length(vUv - 0.5) > 0.5) { discard; }",
    "    tex = texture2D(uTex, vUv);",
    "    if (uBill > 0.5 && tex.a < 0.45) { discard; }",
    "    if (uDecal > 0.5 && tex.a < 0.04) { discard; }",
    "  }",
    "  vec3 n = normalize(vNorm);",
    "  vec3 toEye = uOrtho > 0.5 ? uToward : normalize(uEye - vPos);",
    "  if (uBill < 0.5 && dot(n, toEye) < 0.0) { n = -n; }",
    "  vec3 base = vColor.rgb; float a = vColor.a; vec3 emit = vec3(0.0);",
    // how raised the pattern is here (0 to 1, or none), how deep its grooves
    // in metres, and how far it repeats: for its ridges (RELIEF, below)
    "  float bump = -1.0, deep = 0.0, per = 1.0;",
    // textures off: plain colors -- but the road's line, water, solar
    // panels, towers' windows and far hills and mountains stay what they are
    "  bool tx = uTexOn > 0.5 || (k > 3.5 && k < 4.5) || (k > 8.5 && k < 9.5) || (k > 11.5 && k < 12.5) || (k > 68.5 && k < 69.5) || (k > 73.5 && k < 79.5);",
    "  vec2 m = vPos.xy / uPx; float h = vPos.z / uPx;",
    "  float along = dot(m, normalize(vec2(-n.y, n.x) + vec2(0.0001, 0.0)));",
    "  if (!tx) {",
    "  } else if (k > 0.5 && k < 1.5) {",              // shingles, course over course, joints staggered
    "    vec2 t = normalize(vec2(-n.y, n.x) + vec2(0.0001, 0.0));",
    "    float row = h / 0.2, along = dot(m, t) / 0.32 + 0.5 * mod(floor(row), 2.0);",
    "    float course = smoothstep(0.0, 0.16, fract(row)), joint = smoothstep(0.0, 0.06, fract(along));",
    "    base *= (0.82 + 0.18 * course) * (0.9 + 0.1 * joint) * (0.93 + 0.12 * hash(floor(vec2(along, row))));",
    "    bump = (1.0 - fract(row)) * smoothstep(0.0, 0.08, fract(row)); deep = 0.012; per = 0.2;",
    "  } else if (k > 1.5 && k < 2.5) {",              // boards, along the room
    "    float plank = floor(m.y / 0.16), seam = fract(m.x / 1.4 + hash(vec2(plank, 3.0)));",
    "    float edge = smoothstep(0.0, 0.05, fract(m.y / 0.16)) * smoothstep(0.0, 0.01, seam);",
    "    base *= (0.955 + 0.045 * edge) * (0.97 + 0.05 * hash(vec2(plank, floor(m.x / 1.4 + hash(vec2(plank, 3.0))))));",
    "    bump = edge; deep = 0.0015; per = 0.16;",
    "  } else if (k > 2.5 && k < 3.5) {",              // grass, in patches
    "    vec2 q = mat2(0.8, -0.6, 0.6, 0.8) * m;",
    "    base *= 0.93 + 0.05 * noise(q * 0.23) + 0.05 * noise(q * 1.1) + 0.04 * noise(q * 4.7);",
    "  } else if (k > 3.5 && k < 4.5) {",              // the road, and its middle line
    "    base *= 0.92 + 0.12 * noise(m * 9.0);",
    "    if (abs(vUv.y) < 0.09 && fract(vUv.x / 4.0) < 0.5) { base = mix(base, vec3(0.93, 0.86, 0.55), 0.85); }",
    "  } else if (k > 4.5 && k < 5.5) {",              // the pavement, in slabs
    "    vec2 slab = fract(vUv / 1.5);",
    "    base *= 0.94 + 0.06 * smoothstep(0.0, 0.03, min(slab.x, slab.y));",
    "    bump = smoothstep(0.0, 0.03, min(slab.x, slab.y)); deep = 0.006; per = 1.5;",
    "  } else if (k > 5.5 && k < 6.5) {",              // the lawn, mown in stripes
    "    float stripe = mod(floor(vUv.x / 1.6), 2.0);",
    "    base *= (0.94 + 0.06 * stripe) * (0.96 + 0.06 * noise(mat2(0.8, -0.6, 0.6, 0.8) * m * 1.3));",
    "  } else if (k > 6.5 && k < 7.5) {",              // tiles, a kitchen's or a bathroom's
    "    vec2 tile = fract(m / 0.3);",
    "    base *= 0.93 + 0.07 * smoothstep(0.0, 0.04, min(tile.x, tile.y));",
    "    bump = smoothstep(0.0, 0.04, min(tile.x, tile.y)); deep = 0.003; per = 0.3;",
    "  } else if (k > 7.5 && k < 8.5) {",              // leaves: in clusters, the light on their tops, dark gaps between (2026-10-03)
    "    vec2 lq = vPos.xy / uPx + vPos.z / uPx * vec2(0.83, -0.61);",
    "    float c1 = noise(lq * 2.1), c2 = noise(lq * 7.3 + vec2(3.1, 1.7)), c3 = noise(lq * 21.0 - vec2(1.3, 5.2));",
    "    float lf = smoothstep(0.32, 0.78, c2 * 0.55 + c3 * 0.45);",
    "    base *= (0.66 + 0.26 * c1) * (0.8 + 0.34 * lf);",
    "    base = mix(base, base * vec3(1.1, 1.12, 0.8), clamp(n.z, 0.0, 1.0) * lf * 0.35);",
    "    bump = lf; deep = 0.05; per = 0.14;",
    "  } else if (k > 8.5 && k < 9.5) {",              // water, moving a little
    "    float w = noise(m * 3.0 + vec2(uTime * 0.4, uTime * 0.27)) + noise(m * 7.0 - vec2(uTime * 0.3, 0.0));",
    "    base = mix(base, vec3(0.86, 0.95, 1.0), smoothstep(1.15, 1.6, w) * 0.6);",
    "  } else if (k > 9.5 && k < 10.5) {",             // concrete
    "    base *= 0.94 + 0.08 * noise(m * 5.0);",
    "    bump = noise(m * 5.0); deep = 0.002; per = 0.2;",
    "  } else if (k > 10.5 && k < 11.5) {",            // bark: furrows running up the trunk, rough between (2026-10-03)
    "    float ang = atan(n.y, n.x) * 1.6 + (vPos.x + vPos.y) / uPx * 2.0;",
    "    float fur = noise(vec2(ang * 3.0, h * 1.1)) * 0.6 + noise(vec2(ang * 9.0, h * 4.0)) * 0.4;",
    "    float ridge = smoothstep(0.35, 0.65, fur);",
    "    base *= 0.68 + 0.34 * ridge + 0.08 * noise(vec2(ang * 30.0, h * 30.0));",
    "    bump = ridge; deep = 0.012; per = 0.05;",
    "  } else if (k > 11.5 && k < 12.5) {",            // far hills
    "    base *= 0.9 + 0.15 * noise(m * 0.05);",
    "  } else if (k > 12.5 && k < 13.5) {",            // boards along an outside wall
    "    float row = fract(h / 0.18);",
    "    base *= 0.9 + 0.1 * smoothstep(0.0, 0.18, row);",
    "    bump = (1.0 - row) * smoothstep(0.0, 0.08, row); deep = 0.012; per = 0.18;",
    // what the things in a home are made of (38-models.js), in their own
    // numbers (vUv, metres along and across each part)
    "  } else if (k > 19.5 && k < 20.5) {",            // fabric: a fine weave
    "    vec2 q = vUv * 260.0;",
    "    base *= 0.9 + 0.05 * (0.5 + 0.5 * sin(q.x) * sin(q.y)) + 0.07 * noise(vUv * 26.0);",
    "  } else if (k > 20.5 && k < 21.5) {",            // wood: its grain along the part
    "    float g = noise(vec2(vUv.x * 2.5, vUv.y * 55.0)) * 0.65 + noise(vec2(vUv.x * 8.0, vUv.y * 150.0)) * 0.35;",
    // (softer: its rings shading in and out, not hard stripes -- zebra-like on a wardrobe, 2026-10-03 -- and fine pores)
    "    float ring = fract(g * 3.0), band = smoothstep(0.0, 0.45, ring) * smoothstep(1.0, 0.65, ring);",
    "    base *= 0.87 + 0.08 * band + 0.04 * noise(vUv * 7.0) + 0.03 * noise(vec2(vUv.x * 40.0, vUv.y * 420.0));",
    "  } else if (k > 21.5 && k < 22.5) {",            // brushed metal
    "    base *= 0.965 + 0.035 * noise(vec2(vUv.x * 2.0, vUv.y * 160.0));",
    "  } else if (k > 24.5 && k < 25.5) {",            // stone: veined
    "    float vein = abs(sin((vUv.x * 0.7 + vUv.y * 0.4) * 6.0 + noise(vUv * 2.6) * 6.0 + noise(vUv * 11.0) * 1.4));",
    "    base *= 0.95 + 0.06 * noise(vUv * 18.0);",
    "    base = mix(base * 0.87, base, smoothstep(0.0, 0.035, vein));",
    "  } else if (k > 25.5 && k < 26.5) {",            // leather: a fine grain
    "    base *= 0.9 + 0.1 * noise(vUv * 170.0) + 0.04 * noise(vUv * 12.0);",
    "  } else if (k > 28.5 && k < 29.5) {",            // linen: soft creases
    "    base *= 0.93 + 0.06 * noise(vUv * 11.0) + 0.03 * noise(vUv * 80.0);",
    "  } else if (k > 29.5 && k < 30.5) {",            // earth
    "    base *= 0.78 + 0.32 * noise(vUv * 80.0);",
    "  } else if (k > 33.5 && k < 34.5) {",            // velvet: a soft pile, lighter where it turns away
    "    base *= 0.86 + 0.08 * noise(vUv * 140.0) + 0.04 * noise(vUv * 9.0);",
    "  } else if (k > 34.5 && k < 35.5) {",            // brass: brushed along the part
    "    base *= 0.95 + 0.06 * noise(vec2(vUv.x * 2.0, vUv.y * 140.0));",
    "  } else if (k > 32.5 && k < 33.5) {",            // wicker, woven
    "    vec2 q = vUv * 60.0; float cell = mod(floor(q.x) + floor(q.y), 2.0);",
    "    base *= 0.78 + 0.28 * sin((cell > 0.5 ? fract(q.x) : fract(q.y)) * 3.14159);",
    "    bump = sin((cell > 0.5 ? fract(q.x) : fract(q.y)) * 3.14159); deep = 0.004; per = 0.0167;",
    // what a house is made of (HOUSE_MATS, 38-models.js), by where it is
    "  } else if (k > 39.5 && k < 40.5) {",            // brick, in stretcher bond
    "    float row = h / 0.077, al = along / 0.23 + 0.5 * mod(floor(row), 2.0);",
    "    if (abs(n.z) > 0.7) { row = m.y / 0.11; al = m.x / 0.23 + 0.5 * mod(floor(row), 2.0); }",
    "    float joint = smoothstep(0.0, 0.1, fract(row)) * smoothstep(1.0, 0.9, fract(row)) * smoothstep(0.0, 0.04, fract(al)) * smoothstep(1.0, 0.96, fract(al));",
    "    vec3 brick = base * (0.8 + 0.32 * hash(floor(vec2(al, row)))) * (0.94 + 0.09 * noise(m * 37.0 + h * 21.0));",
    "    base = mix(vec3(0.79, 0.77, 0.73), brick, joint);",
    "    bump = joint; deep = 0.01; per = 0.077;",
    "  } else if (k > 40.5 && k < 41.5) {",            // stone, laid in courses
    "    float row = h / 0.21, al = along / (0.32 + 0.2 * hash(vec2(floor(row), 7.0))) + hash(vec2(floor(row), 3.0));",
    "    float joint = smoothstep(0.0, 0.07, fract(row)) * smoothstep(1.0, 0.93, fract(row)) * smoothstep(0.0, 0.035, fract(al)) * smoothstep(1.0, 0.965, fract(al));",
    "    vec3 st = base * (0.78 + 0.3 * hash(floor(vec2(al, row)))) * (0.9 + 0.14 * noise(m * 11.0 + h * 9.0));",
    "    base = mix(base * 0.55, st, joint);",
    "    bump = joint * (0.75 + 0.25 * noise(m * 11.0 + h * 9.0)); deep = 0.022; per = 0.21;",
    "  } else if (k > 41.5 && k < 42.5) {",            // stucco: rough plaster
    "    base *= 0.93 + 0.07 * noise(vec2(along, h) * 28.0) + 0.04 * noise(vec2(along, h) * 95.0);",
    "    bump = noise(vec2(along, h) * 28.0) * 0.6 + noise(vec2(along, h) * 95.0) * 0.4; deep = 0.003; per = 0.03;",
    "  } else if (k > 42.5 && k < 43.5) {",            // boards up and down, battens over the joints
    "    float j = fract(along / 0.3);",
    "    base *= 0.86 + 0.12 * smoothstep(0.0, 0.05, j) * smoothstep(1.0, 0.88, j) + 0.04 * noise(vec2(along * 3.0, h * 18.0));",
    "    bump = 1.0 - smoothstep(0.0, 0.05, j) * smoothstep(1.0, 0.88, j); deep = 0.016; per = 0.3;",
    "  } else if (k > 43.5 && k < 44.5) {",            // clay tiles, rolling across the roof
    "    float row = h / 0.24, al = along / 0.22;",
    "    base *= (0.76 + 0.24 * abs(sin(al * 3.14159))) * (0.82 + 0.18 * smoothstep(0.0, 0.22, fract(row))) * (0.94 + 0.1 * hash(floor(vec2(al, row))));",
    "    bump = abs(sin(al * 3.14159)) * 0.75 + 0.25 * smoothstep(0.0, 0.22, fract(row)); deep = 0.035; per = 0.22;",
    "  } else if (k > 44.5 && k < 45.5) {",            // a metal roof, its standing seams
    "    float sea = fract(along / 0.45);",
    "    base *= 0.9 + 0.16 * smoothstep(0.9, 0.95, sea) * smoothstep(1.0, 0.96, sea) + 0.03 * noise(vec2(along, h) * 4.0);",
    "    bump = smoothstep(0.88, 0.94, sea) * smoothstep(1.0, 0.97, sea); deep = 0.03; per = 0.45;",
    "  } else if (k > 45.5 && k < 46.5) {",            // slate, small and dark
    "    float row = h / 0.13, al = along / 0.24 + 0.5 * mod(floor(row), 2.0);",
    "    base *= (0.8 + 0.2 * smoothstep(0.0, 0.18, fract(row))) * (0.92 + 0.08 * smoothstep(0.0, 0.05, fract(al))) * (0.88 + 0.2 * hash(floor(vec2(al, row))));",
    "    bump = (1.0 - fract(row)) * smoothstep(0.0, 0.08, fract(row)); deep = 0.007; per = 0.13;",
    "  } else if (k > 46.5 && k < 47.5) {",            // carpet, its pile
    "    base *= 0.9 + 0.08 * noise(m * 190.0) + 0.05 * noise(m * 4.0);",
    "  } else if (k > 47.5 && k < 48.5) {",            // parquet, laid in a basket weave
    "    vec2 cell = floor(m / 0.45), f = fract(m / 0.45); float across = mod(cell.x + cell.y, 2.0) > 0.5 ? f.x : f.y;",
    "    float plank = floor(across * 3.0), seam = smoothstep(0.0, 0.04, fract(across * 3.0)) * smoothstep(0.0, 0.015, min(f.x, f.y));",
    "    base *= (0.88 + 0.14 * hash(cell * 3.0 + plank)) * (0.93 + 0.07 * seam);",
    "    bump = seam; deep = 0.0012; per = 0.15;",
    "  } else if (k > 48.5 && k < 49.5) {",            // marble, in big slabs
    // (2026-10-03: the veins were broad dark bands, a contour map: now fine,
    // faint and broken, each slab its own, a cloud through the stone)
    "    vec2 tile = fract(m / 0.6), slab = floor(m / 0.6); vec2 sm = m + hash(slab) * 7.0;",
    "    float v1 = abs(sin((sm.x * 2.3 + sm.y * 0.9) * 2.2 + noise(sm * 2.4) * 5.0 + noise(sm * 9.0) * 1.2));",
    "    float v2 = abs(sin((sm.y * 2.9 - sm.x * 0.6) * 3.1 + noise(sm * 3.7 + 4.0) * 4.0));",
    "    float veins = (1.0 - smoothstep(0.0, 0.035, v1)) * (0.5 + 0.5 * noise(sm * 1.3)) + (1.0 - smoothstep(0.0, 0.02, v2)) * 0.45 * noise(sm * 2.1 + 9.0);",
    "    base *= (0.95 + 0.05 * noise(sm * 1.7)) * (1.0 - 0.16 * clamp(veins, 0.0, 1.0));",
    "    base *= 0.96 + 0.04 * smoothstep(0.0, 0.006, min(tile.x, tile.y));",
    "    bump = smoothstep(0.0, 0.012, min(tile.x, tile.y)); deep = 0.002; per = 0.6;",
    "  } else if (k > 49.5 && k < 50.5) {",            // slate flags
    "    vec2 cell = floor(m / 0.4), f = fract(m / 0.4);",
    "    base *= (0.84 + 0.2 * hash(cell)) * (0.88 + 0.12 * smoothstep(0.0, 0.025, min(f.x, f.y))) * (0.95 + 0.07 * noise(m * 12.0));",
    "    bump = smoothstep(0.0, 0.025, min(f.x, f.y)) * (0.85 + 0.15 * noise(m * 12.0)); deep = 0.006; per = 0.4;",
    "  } else if (k > 50.5 && k < 51.5) {",            // wallpaper: a stripe
    "    float st = fract(along / 0.16);",
    "    base *= 0.95 + 0.05 * smoothstep(0.45, 0.5, st) * smoothstep(1.0, 0.95, st) + 0.02 * noise(vec2(along, h) * 60.0);",
    "  } else if (k > 51.5 && k < 52.5) {",            // wood panelling, upright
    "    float j = fract(along / 0.14), g = noise(vec2(along * 9.0, h * 1.5));",
    "    base *= (0.86 + 0.1 * smoothstep(0.0, 0.05, j)) * (0.9 + 0.12 * g) * (0.95 + 0.08 * hash(vec2(floor(along / 0.14), 2.0)));",
    "    bump = smoothstep(0.0, 0.05, j); deep = 0.004; per = 0.14;",
    "  } else if (k > 52.5 && k < 53.5) {",            // tiles on a wall, in a brick bond
    "    float row = h / 0.075, al = along / 0.15 + 0.5 * mod(floor(row), 2.0);",
    "    float grout = smoothstep(0.0, 0.08, fract(row)) * smoothstep(1.0, 0.92, fract(row)) * smoothstep(0.0, 0.04, fract(al)) * smoothstep(1.0, 0.96, fract(al));",
    "    base = mix(vec3(0.77, 0.77, 0.75), base, grout);",
    "    bump = grout; deep = 0.003; per = 0.075;",
    "  } else if (k > 53.5 && k < 54.5) {",            // cedar shakes, course over course
    "    float row = h / 0.18, al = along / (0.12 + 0.1 * hash(vec2(floor(row), 5.0))) + 0.5 * mod(floor(row), 2.0);",
    "    base *= (0.8 + 0.2 * smoothstep(0.0, 0.25, fract(row))) * (0.9 + 0.1 * smoothstep(0.0, 0.06, fract(al))) * (0.85 + 0.25 * hash(floor(vec2(al, row))));",
    "    bump = (1.0 - fract(row)) * smoothstep(0.0, 0.08, fract(row)); deep = 0.016; per = 0.18;",
    // (added 2026-10-01: "add more textures") floors, by where they are
    "  } else if (k > 54.5 && k < 55.5) {",            // herringbone: planks four to one, zigzag, laid on the slant
    "    vec2 q = vec2(m.x + m.y, m.y - m.x) * 0.7071 / 0.08, c = floor(q);",
    "    float d = mod(c.x - c.y, 8.0), al, side; vec2 id;",
    "    if (d < 3.5) { id = vec2(c.x - d, c.y); al = (q.x - id.x) / 4.0; side = fract(q.y); }",
    "    else { id = vec2(c.x, c.y - (7.0 - d)); al = (q.y - id.y) / 4.0; side = fract(q.x); }",
    "    float seam = smoothstep(0.0, 0.02, al) * smoothstep(1.0, 0.98, al) * smoothstep(0.0, 0.06, side) * smoothstep(1.0, 0.94, side);",
    "    base *= (0.86 + 0.16 * hash(id)) * (0.9 + 0.1 * seam) * (0.96 + 0.06 * noise(q * 0.7 + id));",
    "    bump = seam; deep = 0.0012; per = 0.08;",
    "  } else if (k > 55.5 && k < 56.5) {",            // hexagon tiles
    "    vec2 p = m / 0.11, r2 = vec2(1.0, 1.7320508), hh = r2 * 0.5;",
    "    vec2 a1 = mod(p, r2) - hh, b1 = mod(p - hh, r2) - hh, g = dot(a1, a1) < dot(b1, b1) ? a1 : b1;",
    "    vec2 aq = abs(g); float d6 = max(dot(aq, vec2(0.5, 0.8660254)), aq.x);",
    "    base = mix(base * 0.72, base * (0.95 + 0.07 * hash(floor((p - g) * 2.0))), smoothstep(0.5, 0.465, d6));",
    "    bump = smoothstep(0.5, 0.465, d6); deep = 0.003; per = 0.11;",
    "  } else if (k > 56.5 && k < 57.5) {",            // tiles in a checker: the color, and a light or a dark one
    "    vec2 cc = floor(m / 0.3), tf = fract(m / 0.3); float lum = dot(base, vec3(0.3, 0.59, 0.11));",
    "    vec3 other = lum > 0.45 ? base * 0.18 + vec3(0.03) : mix(base, vec3(0.95, 0.94, 0.92), 0.85);",
    "    if (mod(cc.x + cc.y, 2.0) > 0.5) { base = other; }",
    "    base *= 0.94 + 0.06 * smoothstep(0.0, 0.02, min(tf.x, tf.y));",
    "    bump = smoothstep(0.0, 0.02, min(tf.x, tf.y)); deep = 0.002; per = 0.3;",
    "  } else if (k > 57.5 && k < 58.5) {",            // terrazzo: chips of stone set in it
    "    vec2 cq = floor(m * 38.0); float ch = hash(cq);",
    // (its chips of stone, not confetti: greys and warm tones, set softer -- 2026-10-03)
    "    float tone = hash(cq + 1.3); vec3 chip = mix(vec3(0.42, 0.4, 0.38), vec3(0.86, 0.8, 0.7), tone) * (0.85 + 0.25 * hash(cq + 2.7));",
    "    base *= 0.95 + 0.06 * noise(m * 6.0);",
    "    if (ch > 0.8) { base = mix(base, chip, 0.45 * smoothstep(0.8, 0.88, ch)); }",
    "  } else if (k > 58.5 && k < 59.5) {",            // cork, in squares
    "    vec2 tf = fract(m / 0.3);",
    "    base *= (0.8 + 0.22 * noise(m * 70.0) + 0.1 * noise(m * 230.0)) * (0.93 + 0.07 * smoothstep(0.0, 0.012, min(tf.x, tf.y)));",
    // walls inside, by where along the wall and how high
    "  } else if (k > 59.5 && k < 60.5) {",            // plaster, smoothed by hand
    "    base *= 0.95 + 0.06 * noise(vec2(along, h) * 2.6) + 0.03 * noise(vec2(along, h) * 13.0);",
    "    bump = noise(vec2(along, h) * 2.6) * 0.5 + noise(vec2(along, h) * 13.0) * 0.5; deep = 0.0015; per = 0.08;",
    "  } else if (k > 60.5 && k < 61.5) {",            // shiplap: boards across, a shadow between
    "    float row = h / 0.15;",
    "    base *= (0.97 + 0.04 * hash(vec2(floor(row), 9.0))) * (0.8 + 0.2 * smoothstep(0.0, 0.07, fract(row)));",
    "    bump = smoothstep(0.0, 0.07, fract(row)); deep = 0.006; per = 0.15;",
    "  } else if (k > 61.5 && k < 62.5) {",            // beadboard: narrow boards up and down
    "    float j = fract(along / 0.055);",
    "    base *= 0.88 + 0.12 * smoothstep(0.0, 0.14, j) * smoothstep(1.0, 0.8, j);",
    "    bump = smoothstep(0.0, 0.14, j) * smoothstep(1.0, 0.8, j); deep = 0.003; per = 0.055;",
    "  } else if (k > 62.5 && k < 63.5) {",            // concrete cast in forms, the tie holes in rows
    "    vec2 cw = vec2(along, h), tg = fract(cw / vec2(1.2, 0.6));",
    "    base *= (0.93 + 0.08 * noise(cw * 5.0)) * (0.92 + 0.08 * smoothstep(0.0, 0.01, min(tg.x, tg.y)));",
    "    base *= 0.85 + 0.15 * smoothstep(0.02, 0.035, length(fract(cw / 0.6) - 0.5));",
    "    bump = smoothstep(0.02, 0.035, length(fract(cw / 0.6) - 0.5)) * smoothstep(0.0, 0.01, min(tg.x, tg.y)); deep = 0.008; per = 0.6;",
    // outside walls
    "  } else if (k > 63.5 && k < 64.5) {",            // logs, round, one on another
    "    float lr = fract(h / 0.24);",
    "    base *= (0.62 + 0.4 * sin(lr * 3.14159)) * (0.94 + 0.07 * noise(vec2(along * 2.0, h * 25.0)));",
    "    bump = sin(lr * 3.14159); deep = 0.08; per = 0.24;",
    "  } else if (k > 64.5 && k < 65.5) {",            // cladding panels, big, their joints
    "    vec2 pp = vec2(along / 1.2, h / 0.6), fp = fract(pp);",
    "    base *= (0.96 + 0.05 * hash(floor(pp))) * (0.86 + 0.14 * smoothstep(0.0, 0.012, min(fp.x, fp.y)));",
    "    bump = smoothstep(0.0, 0.012, min(fp.x, fp.y)); deep = 0.006; per = 0.6;",
    "  } else if (k > 65.5 && k < 66.5) {",            // corrugated metal, its ridges up and down
    "    base *= 0.84 + 0.2 * (0.5 + 0.5 * sin(along / 0.076 * 6.2831853));",
    "    bump = 0.5 + 0.5 * sin(along / 0.076 * 6.2831853); deep = 0.018; per = 0.076;",
    // roofs
    "  } else if (k > 66.5 && k < 67.5) {",            // thatch: straw, in courses
    "    vec2 tq = vec2(along, h);",
    "    base *= (0.72 + 0.3 * noise(vec2(tq.x * 40.0, tq.y * 3.0)) + 0.08 * noise(tq * 90.0)) * (0.88 + 0.12 * smoothstep(0.0, 0.3, fract(tq.y / 0.35)));",
    "    bump = noise(vec2(tq.x * 40.0, tq.y * 3.0)) * 0.7 + 0.3 * smoothstep(0.0, 0.3, fract(tq.y / 0.35)); deep = 0.03; per = 0.05;",
    "  } else if (k > 67.5 && k < 68.5) {",            // a green roof: plants, a few in flower
    "    base *= 0.72 + 0.35 * noise(m * 13.0) + 0.1 * noise(m * 41.0);",
    "    if (hash(floor(m * 22.0)) > 0.93) { base = mix(base, vec3(0.86, 0.78, 0.35), 0.5); }",
    "  } else if (k > 68.5 && k < 69.5) {",            // solar panels, framed, in cells
    "    vec2 sp = vec2(along, h / 0.55), fs = fract(sp), cg = fract(sp * vec2(6.0, 4.0));",
    "    float frame = smoothstep(0.0, 0.03, fs.x) * smoothstep(1.0, 0.97, fs.x) * smoothstep(0.0, 0.05, fs.y) * smoothstep(1.0, 0.95, fs.y);",
    "    base = mix(vec3(0.78, 0.8, 0.82), base * (0.85 + 0.15 * smoothstep(0.0, 0.06, min(cg.x, cg.y))), frame);",
    "    bump = 1.0 - frame; deep = 0.012; per = 0.55;",
    // the land round about (39-world.js), and what is built on it
    "  } else if (k > 70.5 && k < 71.5) {",            // sand: fine grains, and ripples the wind left
    "    float rip = sin(dot(m, vec2(0.8, 0.6)) * 6.0 + noise(m * 0.5) * 5.0);",
    "    base *= 0.95 + 0.03 * rip * n.z + 0.05 * noise(m * 17.0) + 0.05 * noise(m * 0.21);",
    "  } else if (k > 71.5 && k < 72.5) {",            // snow lying: soft drifts, a glint here and there
    "    base *= 0.95 + 0.04 * noise(m * 0.35) + 0.02 * noise(m * 3.0);",
    "    emit += vec3(0.5) * step(0.993, hash(floor(m * 30.0))) * max(dot(n, uSunDir), 0.0) * (1.0 - uNight);",
    "  } else if (k > 72.5 && k < 73.5) {",            // rock: in layers, cracked, darker in the cracks
    "    float layer = noise(vec2(along * 0.6, h * 3.0)) * 0.55 + noise(m * 2.3 + h) * 0.45;",
    "    base *= 0.72 + 0.4 * layer;",
    "    bump = layer; deep = 0.06; per = 0.4;",
    "  } else if (k > 73.5 && k < 74.5) {",            // a mountain far off: forest low down, then rock and scree, snow on top
    "    float rough = noise(m * 0.04) * 0.5 + noise(m * 0.13) * 0.3 + noise(vec2(along * 0.09, h * 0.35)) * 0.2;",
    "    base *= 0.72 + 0.4 * rough;",
    "    float wood = 1.0 - smoothstep(26.0, 44.0, h + 14.0 * noise(m * 0.05));",
    "    base = mix(base, vec3(0.2, 0.31, 0.22) * (0.8 + 0.4 * noise(m * 0.2)), wood * 0.85);",
    "    float cap = smoothstep(72.0, 88.0, h + 22.0 * noise(m * 0.03) - 18.0 * (1.0 - n.z));",
    "    base = mix(base, vec3(0.93, 0.95, 0.98) * (0.9 + 0.1 * noise(m * 0.3)), cap);",
    "  } else if (k > 74.5 && k < 75.5) {",            // half-timbered: plaster between dark oak posts, rails and braces
    "    vec2 cg2 = vec2(along / 1.1, h / 1.35); vec2 cf = fract(cg2); vec2 ci = floor(cg2);",
    "    float flip = step(0.5, hash(ci)); float dg = abs(mix(cf.x, 1.0 - cf.x, flip) - cf.y);",
    "    float wood = max(max(step(cf.x, 0.11), step(cf.y, 0.08)), step(dg, 0.07) * step(0.35, hash(ci + 7.0)));",
    "    base = mix(base * (0.95 + 0.05 * noise(m * 4.0)), vec3(0.21, 0.15, 0.11) * (0.9 + 0.2 * noise(m * 9.0)), wood);",
    "    bump = wood; deep = 0.015; per = 0.3;",
    "  } else if (k > 75.5 && k < 76.5) {",            // a tower's windows, floor over floor -- some lit after dark
    "    vec2 tg = vec2(along / 2.6, h / 3.3); vec2 tf = fract(tg);",
    "    float win = step(0.16, tf.x) * step(tf.x, 0.84) * step(0.22, tf.y) * step(tf.y, 0.86) * (1.0 - step(0.9, n.z));",
    "    float on = step(0.52, hash(floor(tg) + floor(vPos.xy / 211.0)));",
    "    base = mix(base, vec3(0.2, 0.25, 0.31) + 0.12 * vec3(max(dot(reflect(-toEye, n), uSunDir), 0.0)), win * 0.85);",
    "    emit += vec3(1.0, 0.84, 0.55) * win * on * uNight * 0.9;",
    // (2026-10-03, 40-towers.js) a tower's skin: glass in a grid of mullions,
    // a spandrel at every floor, the sky and the sun in it, offices lit after
    // dark -- or, a diagrid's, glass between diagonal steel
    "  } else if (k > 77.5 && k < 78.5) {",
    "    vec2 cg = vec2(along / 1.5, h / 3.6); vec2 cf = fract(cg);",
    "    float mull = 1.0 - step(0.035, cf.x) * step(cf.x, 0.965), span = step(0.78, cf.y) * (1.0 - step(0.9, n.z));",
    "    vec3 cr = reflect(-toEye, n); float cfr = pow(1.0 - abs(dot(n, toEye)), 2.0);",
    "    vec3 csky = mix(vec3(0.42, 0.5, 0.58), vec3(0.8, 0.87, 0.95), smoothstep(-0.2, 0.6, cr.z)) * (1.0 - 0.8 * uNight);",
    "    vec3 glass = mix(base * 0.75, csky, 0.4 + 0.35 * cfr) * (0.93 + 0.1 * hash(floor(cg)));",
    "    base = mix(glass, base * 0.5, max(mull, span * 0.85));",
    "    float con = step(0.5, hash(floor(cg) + floor(vPos.xy / 307.0)));",
    "    emit += vec3(1.0, 0.9, 0.72) * (1.0 - mull) * (1.0 - span) * con * uNight * 0.75;",
    "    emit += vec3(1.0, 0.97, 0.9) * pow(max(dot(cr, uSunDir), 0.0), 90.0) * 0.45 * (1.0 - uNight) * (1.0 - mull);",
    "  } else if (k > 78.5 && k < 79.5) {",
    "    vec2 dg = vec2((along + h) / 2.6, (along - h) / 2.6); vec2 df = fract(dg);",
    "    float steel = 1.0 - step(0.05, df.x) * step(df.x, 0.95) * step(0.05, df.y) * step(df.y, 0.95);",
    "    float band = step(0.66, fract(floor(dg.x) / 6.0 + floor(h / 3.6) * 0.0));",
    "    vec3 dr2 = reflect(-toEye, n); float dfr = pow(1.0 - abs(dot(n, toEye)), 2.0);",
    "    vec3 dsky = mix(vec3(0.4, 0.48, 0.56), vec3(0.8, 0.87, 0.95), smoothstep(-0.2, 0.6, dr2.z)) * (1.0 - 0.8 * uNight);",
    "    vec3 dglass = mix(base * (band > 0.5 ? 0.45 : 0.8), dsky, (band > 0.5 ? 0.25 : 0.4) + 0.35 * dfr);",
    "    base = mix(dglass, vec3(0.86, 0.88, 0.9), steel);",
    "    emit += vec3(1.0, 0.9, 0.72) * (1.0 - steel) * step(0.55, hash(floor(dg))) * uNight * 0.6;",
    "  } else if (k > 76.5 && k < 77.5) {",            // a window of a house across the way: the sky in it, a lamp behind it at night
    "    float lamp = step(0.4, hash(floor(vPos.xy / 37.0) + floor(h)));",
    "    base = mix(base, vec3(0.62, 0.72, 0.82), pow(1.0 - abs(dot(n, toEye)), 2.0) * 0.6);",
    "    emit += vec3(1.0, 0.8, 0.5) * lamp * uNight * 0.85;",
    "  }",
    // far off, a fine pattern -- brick, shingles, boards -- shimmered: it
    // fades to its own color as it goes (walking round, 39-world.js)
    "  if (uOrtho < 0.5 && ((k > 0.5 && k < 1.5) || (k > 12.5 && k < 13.5) || (k > 39.5 && k < 46.5) || (k > 53.5 && k < 54.5) || (k > 63.5 && k < 66.5))) {",
    "    base = mix(base, vColor.rgb * 0.9, smoothstep(24.0, 75.0, length(uEye - vPos) / uPx) * 0.85);",
    "  }",
    // (2026-10-02: "set textures on or off so they don't look flat ... some
    // nice metal shine or ridged design like brick")  The pattern's ridges and
    // grooves catch the light: its height, felt across the pixels round, tilts
    // the face -- where the pattern is bigger than a pixel or two, and fading
    // out where it is finer than that.  (Only where the browser can tell how
    // a value changes from pixel to pixel: see gl3MainProgram.)
    "#ifdef RELIEF",
    "  {",
    "    vec3 dpx = dFdx(vPos), dpy = dFdy(vPos);",
    "    float hb = bump > -0.5 ? bump * deep * uPx : 0.0;",
    "    float dbx = dFdx(hb), dby = dFdy(hb);",
    "    if (bump > -0.5 && uTexOn > 0.5 && dr > 0.5) {",
    "      float mpp = max(length(dpx), length(dpy)) / uPx;",
    "      float keep = 1.0 - smoothstep(per * 0.03, per * 0.12, mpp);",
    "      vec3 r1 = cross(dpy, n), r2 = cross(n, dpx); float det = dot(dpx, r1);",
    "      if (keep > 0.0 && abs(det) > 1.0e-8) {",
    "        vec3 gs = sign(det) * (dbx * r1 + dby * r2);",
    "        n = normalize(abs(det) * n - gs * keep * 1.5);",
    "      }",
    "    }",
    "  }",
    "#endif",
    "  base = mix(vColor.rgb, base, dr);",          // flat on the paper, plain as it is drawn
    "  if (uUseTex > 0.5 && uBill < 0.5) {",
    "    if (uDecal > 0.5) { base = tex.rgb; a = tex.a; } else { base = mix(base, tex.rgb, tex.a); }",
    "  }",
    "  vec3 col;",
    "  if (uBill > 0.5) { col = tex.rgb * (0.82 + 0.25 * max(uSunDir.z, 0.0)) * (1.0 - 0.55 * uNight * (1.0 - uIndoor)); a = 1.0; }",
    "  else {",
    "    float sun = lit(n);",
    "    vec3 amb = mix(uGroundAmb, uSkyAmb, n.z * 0.5 + 0.5);",
    "    vec3 toLight = uSunDir, lightCol = uSunCol * 1.5 * min(1.0, sun * 4.0);",
    "    if (uIndoor > 0.5) {",                         // indoors: light from every side, a lamp's warmth, and
    "      amb = mix(vec3(0.6, 0.58, 0.54), vec3(0.74, 0.73, 0.72), n.z * 0.5 + 0.5);",
    "      amb += vec3(0.12, 0.11, 0.1) * max(dot(n, toEye), 0.0);",   // what faces you a little brighter
    // the light in the middle of the ceiling, falling off across the room:
    // what gives the things in it their shape
    "      vec3 lv = uLamp - vPos; float ld = max(length(lv), 1.0);",
    "      toLight = lv / ld; ld /= uPx;",
    // (what stands under the light throws its shadow -- softened, light comes
    // back off the walls -- and a room is darker into its corners, along the
    // foot of its walls and up under its ceiling: 2026-10-02)
    // (not the ceiling the light hangs from: nothing under the light shades
    // it, and in the light's own plane its shadow map only made stair-steps
    // across it -- 2026-10-03, "the ceilings seem to be a bit buggy")
    "      float ls = n.z < -0.5 ? 1.0 : lampLit();",
    "      float ao = 1.0;",
    "      if (uRoomBox.z > uRoomBox.x) {",
    "        vec2 lo = (vPos.xy - uRoomBox.xy) / uPx, hi = (uRoomBox.zw - vPos.xy) / uPx;",
    "        float hz = (vPos.z - uRoomZ.x) / uPx, cz = (uRoomZ.y - vPos.z) / uPx;",
    "        if (lo.x > -0.05 && lo.y > -0.05 && hi.x > -0.05 && hi.y > -0.05 && hz > -0.05 && cz > -0.05) {",
    "          float edge = min(min(lo.x, hi.x), min(lo.y, hi.y));",
    "          if (n.z > 0.7 && hz < 0.06) { ao *= mix(0.6, 1.0, smoothstep(0.08, 0.6, edge)); }",
    "          else if (n.z < -0.7) { ao *= mix(0.72, 1.0, smoothstep(0.08, 0.55, edge)); }",
    "          else if (abs(n.z) < 0.3) {",
    "            float side = abs(n.x) > abs(n.y) ? min(lo.y, hi.y) : min(lo.x, hi.x);",
    "            ao *= mix(0.64, 1.0, smoothstep(0.0, 0.45, hz)) * mix(0.78, 1.0, smoothstep(0.0, 0.35, cz));",
    "            ao *= mix(0.72, 1.0, smoothstep(0.1, 0.55, side));",
    "          }",
    "        }",
    "      }",
    "      amb *= ao;",
    "      amb += vec3(0.4, 0.37, 0.31) * max(dot(n, toLight), 0.0) / (1.0 + ld * ld * 0.05) * mix(0.28, 1.0, ls) * mix(0.75, 1.0, ao);",
    "      lightCol = vec3(0.75, 0.7, 0.6) / (1.0 + ld * ld * 0.05) * ls;",
    // after dark the daylight goes from the room, and the lamp is all there is
    "      amb *= mix(1.0, 0.68, uNight); amb += vec3(0.1, 0.08, 0.04) * uNight * max(dot(n, toLight), 0.0);",
    "      if (uLamp.z < -1.0e5) { amb *= mix(0.8, 0.3, uNight); }",          // its light switched off: dark after dark, dimmer by day
    "      lightCol *= 1.0 + 0.3 * uNight;",
    "    }",
    "    col = mix(base, base * (amb + uSunCol * sun), dr);",
    // after dark, seen from out of doors: every room's light on
    "    if (uNight > 0.01 && uIndoor < 0.5) {",
    "      float warm = 0.0;",
    "      for (int i = 0; i < 24; i++) {",
    "        if (float(i) >= uRoomN) { break; }",
    "        vec3 rl = uRooms[i].xyz - vPos; float rd = max(length(rl), 1.0);",
    "        warm += max(dot(n, rl / rd), 0.0) * (1.0 - smoothstep(uRooms[i].w * 0.55, uRooms[i].w * 1.05, rd));",
    "      }",
    "      col += base * vec3(0.95, 0.78, 0.5) * min(warm, 1.2) * uNight * dr * 0.9;",
    "    }",
    // a shine, on what is smooth: china, steel, a screen, polished stone
    "    float gloss = 0.0, shin = 20.0;",
    "    if (k > 20.5 && k < 21.5) { gloss = 0.1; shin = 22.0; }",
    "    else if (k > 21.5 && k < 22.5) { gloss = 0.4; shin = 30.0; }",
    "    else if (k > 22.5 && k < 23.5) { gloss = 0.9; shin = 80.0; }",
    "    else if (k > 23.5 && k < 24.5) { gloss = 0.5; shin = 55.0; }",
    "    else if (k > 24.5 && k < 25.5) { gloss = 0.32; shin = 45.0; }",
    "    else if (k > 25.5 && k < 26.5) { gloss = 0.24; shin = 22.0; }",
    "    else if (k > 26.5 && k < 27.5) { gloss = 0.22; shin = 34.0; }",
    "    else if (k > 27.5 && k < 28.5) { gloss = 0.75; shin = 90.0; }",
    "    else if (k > 34.5 && k < 35.5) { gloss = 0.85; shin = 70.0; }",      // brass
    "    else if (k > 35.5 && k < 36.5) { gloss = 0.9; shin = 120.0; }",      // lacquer, high gloss
    "    else if ((k > 6.5 && k < 7.5) || (k > 52.5 && k < 53.5)) { gloss = 0.28; shin = 50.0; }",
    "    else if (k > 48.5 && k < 49.5) { gloss = 0.38; shin = 60.0; }",
    "    else if ((k > 1.5 && k < 2.5) || (k > 47.5 && k < 48.5)) { gloss = 0.1; shin = 18.0; }",
    "    else if (k > 44.5 && k < 45.5) { gloss = 0.3; shin = 26.0; }",
    "    else if (k > 68.5 && k < 69.5) { gloss = 0.6; shin = 70.0; }",     // solar glass
    "    else if (k > 65.5 && k < 66.5) { gloss = 0.35; shin = 40.0; }",    // corrugated metal
    "    else if (k > 55.5 && k < 58.5) { gloss = 0.22; shin = 48.0; }",    // glazed tiles, terrazzo
    "    if (gloss > 0.0 && uTexOn > 0.5) {",
    "      vec3 hv = normalize(toLight + toEye);",
    "      col += lightCol * gloss * pow(max(dot(n, hv), 0.0), shin) * dr;",
    "    }",
    "    if (k > 22.5 && k < 23.5 && uTexOn > 0.5) {",     // chrome: the room, or the sky, in it
    "      vec3 r = reflect(-toEye, n);",
    "      vec3 env = uIndoor > 0.5 ? mix(vec3(0.38, 0.36, 0.34), vec3(0.95, 0.94, 0.92), r.z * 0.5 + 0.5)",
    "                               : mix(uGroundAmb, vec3(0.8, 0.88, 0.97), smoothstep(-0.2, 0.6, r.z));",
    "      col = mix(col, env * (0.55 + 0.45 * base), 0.55 * dr);",
    "    }",
    "    if (k > 30.5 && k < 31.5) { col = mix(col, base * (1.08 + 0.9 * uNight), dr); }",   // a lamp's shade, lit from inside -- glowing, at night
    "    if (k > 33.5 && k < 34.5 && uTexOn > 0.5) {",     // velvet's sheen, at the edges it turns from you
    "      col += base * 0.42 * pow(1.0 - abs(dot(n, toEye)), 2.4) * dr;",
    "    }",
    "    if (k > 34.5 && k < 35.5 && uTexOn > 0.5) {",     // brass: the room, or the sky, in it -- warmed by the metal
    "      vec3 rb = reflect(-toEye, n);",
    "      vec3 envb = uIndoor > 0.5 ? mix(vec3(0.38, 0.36, 0.34), vec3(0.95, 0.94, 0.92), rb.z * 0.5 + 0.5)",
    "                                : mix(uGroundAmb, vec3(0.8, 0.88, 0.97), smoothstep(-0.2, 0.6, rb.z));",
    "      col = mix(col, envb * base * 1.25, 0.4 * dr);",
    "    }",
    "    if (k > 35.5 && k < 36.5 && uTexOn > 0.5) {",     // lacquer: a little of the room in it
    "      vec3 rl = reflect(-toEye, n);",
    "      col = mix(col, mix(uGroundAmb, vec3(0.86, 0.9, 0.95), smoothstep(-0.2, 0.6, rl.z)), 0.12 * dr);",
    "    }",
    // brushed steel, a metal roof, corrugated sheet, a solar panel's glass:
    // the sky (or the room) in it, more of it the flatter it is looked at
    "    if (uTexOn > 0.5 && ((k > 21.5 && k < 22.5) || (k > 44.5 && k < 45.5) || (k > 65.5 && k < 66.5) || (k > 68.5 && k < 69.5))) {",
    "      vec3 rm = reflect(-toEye, n); float fm = pow(1.0 - max(dot(n, toEye), 0.0), 3.0);",
    "      vec3 envm = uIndoor > 0.5 ? mix(vec3(0.36, 0.35, 0.33), vec3(0.92, 0.91, 0.9), rm.z * 0.5 + 0.5)",
    "                                : mix(uGroundAmb * 1.2, vec3(0.78, 0.86, 0.96), smoothstep(-0.25, 0.5, rm.z)) * (1.0 - 0.7 * uNight);",
    "      float mk = (k > 21.5 && k < 22.5) ? 0.24 : (k > 68.5 && k < 69.5) ? 0.2 : 0.1;",
    "      col = mix(col, envm * mix(base * 1.6, vec3(1.0), 0.25 + 0.35 * fm), min(0.5, mk + 0.28 * fm) * dr);",
    "      col += lightCol * pow(max(dot(n, normalize(toLight + toEye)), 0.0), 140.0) * 0.6 * dr;",
    "    }",
    "    if (k > 8.5 && k < 9.5) {",                     // the sky in the water
    "      vec3 r = reflect(-toEye, n); col += vec3(0.25) * pow(max(dot(r, uSunDir), 0.0), 60.0);",
    "    }",
    "  }",
    // glass: the sky in it, more of it the flatter it is looked at, the
    // sun caught in it -- and through it, what is behind it
    "  if (k > 69.5 && k < 70.5) {",
    "    float fr = pow(1.0 - abs(dot(n, toEye)), 3.0);",
    "    vec3 sky = mix(uFogCol, vec3(0.78, 0.86, 0.95), 0.35) * (1.0 - 0.75 * uNight);",
    "    col = mix(base * 0.55, sky, 0.35 + 0.5 * fr);",
    "    col += vec3(1.0, 0.97, 0.9) * pow(max(dot(reflect(-toEye, n), uSunDir), 0.0), 60.0) * 0.8 * (1.0 - uNight) * dr;",
    "    a = clamp(0.28 + 0.55 * fr, 0.0, 0.9);",
    "  }",
    "  col += emit * dr;",                         // what gives its own light: a lit window far off, a glint of snow
    "  if (uGlow > 0.0) { col = mix(col, vec3(1.0, 0.8, 0.5), uGlow); a = max(a, 0.9 * uGlow); }",   // the lights on inside
    "  float d = uOrtho > 0.5 ? 0.0 : length(uEye - vPos);",
    "  float fog = clamp((d - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);",
    "  col = mix(col, uFogCol, fog * fog * (3.0 - 2.0 * fog));",
    "  float fade = 1.0;",                              // from above: the ground thins out at its edge
    "  if (uFade.y > 0.0) { fade = 1.0 - smoothstep(uFade.x, uFade.y, length(vPos.xy - uMid)); }",
    "  gl_FragColor = vec4(col, a * uAlpha * fade);",
    "}"].join("\n");

  // The sky: by the way each pixel looks out, light at the horizon and
  // deeper overhead, the sun's glow, and clouds drifting over.  From above,
  // where there is no horizon, the same colors top to bottom.
  var GL3_SKY_VS = "attribute vec2 aXY; varying vec2 vXY; void main() { vXY = aXY; gl_Position = vec4(aXY, 0.9999, 1.0); }";
  var GL3_SKY_FS = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uAhead; uniform vec2 uTan; uniform float uFlat;",
    "uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uBelow; uniform vec3 uSunDir; uniform float uTime;",
    "uniform vec3 uSunGlow; uniform vec3 uCloud; uniform float uNight;",   // the sun's (or the moon's) light, the clouds', the stars
    "uniform float uCover;",                                              // how much of the sky is cloud (39-house.js: the weather)
    "varying vec2 vXY;",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "void main() {",
    "  if (uFlat > 0.5) {",
    "    float t = vXY.y * 0.5 + 0.5;",
    "    gl_FragColor = vec4(mix(uBelow, mix(uHorizon, uZenith, 0.5), t), 1.0); return;",
    "  }",
    "  vec3 dir = normalize(uAhead + uRight * vXY.x * uTan.x + uUp * vXY.y * uTan.y);",
    "  float up = dir.z;",
    "  vec3 col = up < 0.0 ? mix(uHorizon, uBelow, smoothstep(0.0, 0.08, -up))",
    "                      : mix(uHorizon, uZenith, pow(smoothstep(0.0, 0.6, up), 0.7));",
    "  float s = max(dot(dir, uSunDir), 0.0);",
    "  col += uSunGlow * (pow(s, 600.0) * 1.2 + pow(s, 12.0) * 0.18 * (1.0 - 0.7 * uNight));",
    "  if (up > 0.01) {",
    "    vec2 p = dir.xy / up * 1.2 + vec2(uTime * 0.01, 0.0);",
    "    float c = noise(p) * 0.55 + noise(p * 2.1) * 0.3 + noise(p * 4.3) * 0.15;",
    "    float cover = smoothstep(0.55 - 0.5 * uCover, 0.78 - 0.3 * uCover, c) * smoothstep(0.01, 0.2 - 0.15 * uCover, up);",
    "    if (uNight > 0.0) {",                            // the stars, where no cloud is over them
    // (cells of the sky's own sphere, each a point of light or not: cut
    // flat across the sky they drew out into streaks near the top)
    "      vec3 c3 = floor(dir * 300.0);",
    "      vec2 g = vec2(c3.x * 7.13 + c3.z * 1.31, c3.y * 3.71 - c3.z * 2.17);",
    "      float st = step(0.9982, hash(g)) * (0.45 + 0.55 * hash(g + 7.0));",
    "      col += vec3(st) * uNight * smoothstep(0.02, 0.3, up) * (1.0 - cover);",
    "    }",
    "    col = mix(col, uCloud, cover * (0.75 + 0.22 * uCover));",
    "  }",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"].join("\n");

  // How near the sun each point is, packed into a color (any WebGL has
  // those; not every one has depth textures).
  var GL3_DEPTH_VS = "attribute vec3 aPos; uniform mat4 uSunMvp; void main() { gl_Position = uSunMvp * vec4(aPos, 1.0); }";
  var GL3_DEPTH_FS = [
    "precision highp float;",
    "vec4 pack(float d) {",
    "  vec4 e = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * d);",
    "  return e - e.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);",
    "}",
    "void main() { gl_FragColor = pack(gl_FragCoord.z); }"].join("\n");

  function gl3Program(gl, vs, fs) {
    function one(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(s)); }
      return s;
    }
    var p = gl.createProgram();
    gl.attachShader(p, one(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, one(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { throw new Error(gl.getProgramInfoLog(p)); }
    var at = {};
    var na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES), nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < na; i++) { var a = gl.getActiveAttrib(p, i); at[a.name] = gl.getAttribLocation(p, a.name); }
    for (var j = 0; j < nu; j++) { var u = gl.getActiveUniform(p, j); at[u.name] = gl.getUniformLocation(p, u.name); }
    return { p: p, at: at };
  }

  // The main program -- with the ridges of the patterns (RELIEF), where the
  // browser can say how a value changes from one pixel to the next; flat
  // where it cannot, as before.
  function gl3MainProgram(gl) {
    try {
      var made, two = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
      if (two) {
        // (WebGL 2 tells how a value changes from pixel to pixel only in its
        // own shading language: the same program, said in that)
        var vs = "#version 300 es\n" + GL3_VS.replace(/\battribute\b/g, "in").replace(/\bvarying\b/g, "out");
        var fs = "#version 300 es\n#define RELIEF 1\n" + GL3_FS.replace(/\bvarying\b/g, "in").replace(/\btexture2D\s*\(/g, "texture(")
                   .replace(/\bgl_FragColor\b/g, "fragOut").replace(/#endif\n/, "#endif\nout vec4 fragOut;\n");
        made = gl3Program(gl, vs, fs);
      } else {
        if (!gl.getExtension("OES_standard_derivatives")) { throw new Error("no derivatives"); }
        made = gl3Program(gl, GL3_VS, "#extension GL_OES_standard_derivatives : enable\n#define RELIEF 1\n" + GL3_FS);
      }
      made.relief = true;
      return made;
    } catch (e) { return gl3Program(gl, GL3_VS, GL3_FS); }
  }

  // The view's own WebGL, made the first time a home is drawn in it -- or
  // `false`, for a browser without it, and the view is drawn the old way.
  function gl3Ready() {
    if (!V3) { return null; }
    if (V3.gl !== undefined) { return V3.gl; }
    V3.gl = false;
    try {
      var canvas = document.createElement("canvas");
      var opts = { antialias: true, alpha: false, depth: true, premultipliedAlpha: false, preserveDrawingBuffer: false };
      var gl = canvas.getContext("webgl2", opts) || canvas.getContext("webgl", opts) ||
               canvas.getContext("experimental-webgl", opts);
      if (!gl) { return false; }
      var G = { canvas: canvas, gl: gl, tex: new Map(), buf: gl.createBuffer(), skyBuf: gl.createBuffer(), scenery: null,
                main: gl3MainProgram(gl), sky: gl3Program(gl, GL3_SKY_VS, GL3_SKY_FS),
                depth: gl3Program(gl, GL3_DEPTH_VS, GL3_DEPTH_FS), t0: performance.now() };
      gl.bindBuffer(gl.ARRAY_BUFFER, G.skyBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      // the shadow map: a color target the sun's view is packed into
      G.shadowTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, G.shadowTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GL3_SHADOW, GL3_SHADOW, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      G.shadowDepth = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, G.shadowDepth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, GL3_SHADOW, GL3_SHADOW);
      G.shadowFb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, G.shadowFb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, G.shadowTex, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, G.shadowDepth);
      G.shadowOk = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      // and the ceiling light's, indoors: the same, looking down from the light
      G.lampTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, G.lampTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GL3_LAMP, GL3_LAMP, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      G.lampDepth = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, G.lampDepth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, GL3_LAMP, GL3_LAMP);
      G.lampFb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, G.lampFb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, G.lampTex, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, G.lampDepth);
      G.lampOk = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      // a white texel, for the draws that take no picture
      G.white = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, G.white);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
      canvas.addEventListener("webglcontextlost", function (ev) { ev.preventDefault(); if (V3 && V3.gl === G) { V3.gl = false; V3.dirty = true; } });
      V3.gl = G;
    } catch (e) {
      V3.gl = false;
    }
    return V3.gl;
  }

  // A picture (v3Pic, 38-view3d.js), as a texture -- once it has arrived.
  function gl3Texture(G, pic) {
    if (!pic || !pic.ok) { return null; }
    var have = G.tex.get(pic);
    if (have !== undefined) { return have; }
    var gl = G.gl, t = null;
    try {
      var w = Math.max(2, pic.img.naturalWidth || pic.w * 2), h = Math.max(2, pic.img.naturalHeight || pic.h * 2);
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(pic.img, 0, 0, w, h);
      t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    } catch (e) { t = null; }
    G.tex.set(pic, t);
    return t;
  }

  // ---- what is drawn, in batches -----------------------------------------------
  // Each batch is one draw: the same way of drawing, the same picture.
  function gl3Batches() {
    var list = {}, order = [];
    return {
      get: function (key, how) {
        if (!list[key]) { list[key] = { key: key, v: [], how: how || {} }; order.push(list[key]); }
        return list[key];
      },
      all: order
    };
  }
  function gl3Vert(v, p, n, c, a, uv, pat) {
    v.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], a, uv[0], uv[1], pat);
  }
  // A flat many-sided face, as a fan of triangles from its first corner.
  function gl3Poly(v, pts, n, c, a, uvs, pat) {
    for (var i = 1; i + 1 < pts.length; i++) {
      gl3Vert(v, pts[0], n, c, a, uvs ? uvs[0] : [0, 0], pat);
      gl3Vert(v, pts[i], n, c, a, uvs ? uvs[i] : [0, 0], pat);
      gl3Vert(v, pts[i + 1], n, c, a, uvs ? uvs[i + 1] : [0, 0], pat);
    }
  }
  function gl3Lines(v, pts, c, a) {
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], q = pts[(i + 1) % pts.length];
      gl3Vert(v, p, [0, 0, 1], c, a, [0, 0], PAT.line);
      gl3Vert(v, q, [0, 0, 1], c, a, [0, 0], PAT.line);
    }
  }
  // Where on a face's picture each corner is: the three corners the face
  // names at (0,0), (1,0) and (0,1), and the fourth across from the first.
  function gl3Uvs(f) {
    var uvs = f.pts.map(function () { return [0.5, 0.5]; });
    uvs[f.texAt[0]] = [0, 0]; uvs[f.texAt[1]] = [1, 0]; uvs[f.texAt[2]] = [0, 1];
    for (var i = 0; i < f.pts.length; i++) {
      if (i !== f.texAt[0] && i !== f.texAt[1] && i !== f.texAt[2]) { uvs[i] = [1, 1]; }
    }
    return uvs;
  }

  // What a room's floor is laid with: tiles where there is water, concrete
  // in a garage, and boards everywhere else.
  function gl3FloorPat(room) {
    if (!room) { return PAT.boards; }
    var kind = "room";
    try { kind = typeof roomKind === "function" ? roomKind(v3Ground(), room) : "room"; } catch (e) { kind = "room"; }
    if (kind === "bath" || kind === "kitchen" || kind === "laundry") { return PAT.tiles; }
    if (kind === "garage") { return PAT.concrete; }
    return PAT.boards;
  }

  // Whether a wall's face looks out on the garden: nothing but outdoors
  // just beyond it.
  function gl3Outside(f, rooms) {
    var cx = 0, cy = 0;
    f.pts.forEach(function (p) { cx += p[0] / f.pts.length; cy += p[1] / f.pts.length; });
    var x = cx + f.n[0] * 9, y = cy + f.n[1] * 9;
    // (the rooms near that spot: every wall of a big building asked every room)
    var near = rooms.near ? rooms.near.around(x, y, x, y).map(function (o) { return o.r; }) : rooms;
    return !near.some(function (r) { return insideArea(r.n, x - r.dx, y - r.dy); });
  }

  // What each part of a model is made of, as the shader's pattern.
  var GL3_MAT = { fabric: 20, wood: 21, metal: 22, chrome: 23, ceramic: 24, stone: 25, leather: 26, plastic: 27,
                  screen: 28, linen: 29, soil: 30, glow: 31, rubber: 32, wicker: 33, leaves: 8, water: 9, bark: 11,
                  concrete: 10, plain: 0,
                  // (2026-10-02, for the designs a piece comes in, 40-designs.js)
                  velvet: 34, brass: 35, lacquer: 36 };
  // A model's mesh (38-models.js), in its own numbers, put where the piece
  // stands -- and kept so, while it stays there: walking round, the house
  // is drawn sixty times a second and its furniture does not move.
  var gl3MeshKept = new WeakMap();
  function gl3Mesh(B, f) {
    var how = f.how, m = f.mesh, xf = m.xf || [0, 0, 1, 0, 0];
    var ox = f.pts[0][0] - m.base[0], oy = f.pts[0][1] - m.base[1], oz = f.pts[0][2] - m.base[2];
    var batch = how.glass ? B.get("glass", { blend: true, late: true })
              : how.shade ? B.get("shade", { blend: true, late: true, noDepthWrite: true }) : B.get("models", {});
    // (a light switched off, a screen switched on, walking round: 39-inside.js)
    var lightOff = how.mat === "glow" && f.node && typeof useLightOff === "function" && useLightOff(f.node);
    var screenOn = how.mat === "screen" && f.node && typeof useOn === "function" && useOn(f.node);
    var always = typeof flat3dNow === "function" && flat3dNow();
    var key = xf.join(",") + "|" + ox + "," + oy + "," + oz + (lightOff ? "|off" : "") + (screenOn ? "|on" : "") + (always ? "|d" : "");
    // (kept by the model's own points, which last from picture to picture -- the
    // wrapper round them is new each time it is put up, so kept on that, it never was;
    // and by where it stands: one model is every chair of its kind and size, 38-models.js)
    var byWhere = gl3MeshKept.get(m.p);
    if (!byWhere) { byWhere = new Map(); gl3MeshKept.set(m.p, byWhere); }
    var kept = byWhere.get(key);
    if (kept) { m.made = kept; }
    if (!m.made || m.made.key !== key) {
      var col = gl3Rgb(how.color), pat = how.glass ? 0 : (GL3_MAT[how.mat] || 0), alpha = how.glass ? 0.3 : 1;
      if (lightOff) { pat = 0; col = gl3Mix(col, [0.42, 0.42, 0.4], 0.55); }
      if (screenOn) { pat = 31; col = [0.34, 0.5, 0.72]; }     // a picture's blue glow, not a white sheet
      var P = m.p, N = m.n, U = m.uv, A = m.a, c = xf[2], s = xf[3], count = P.length / 3;
      var out = new Float32Array(count * GL3_STRIDE);
      for (var i = 0, o = 0; i < count; i++, o += GL3_STRIDE) {
        var lx = P[i * 3], ly = P[i * 3 + 1], nx = N[i * 3], ny = N[i * 3 + 1];
        out[o] = xf[0] + lx * c - ly * s + ox; out[o + 1] = xf[1] + lx * s + ly * c + oy; out[o + 2] = xf[4] + P[i * 3 + 2] + oz;
        out[o + 3] = nx * c - ny * s; out[o + 4] = nx * s + ny * c; out[o + 5] = N[i * 3 + 2];
        out[o + 6] = col[0]; out[o + 7] = col[1]; out[o + 8] = col[2]; out[o + 9] = A ? A[i] : alpha;
        out[o + 10] = U[i * 2]; out[o + 11] = U[i * 2 + 1]; out[o + 12] = always ? pat + 200 : pat;
      }
      m.made = { key: key, data: out };
      if (byWhere.size > 6000) {
        var drop = 0;
        byWhere.forEach(function (v, k) { if (drop++ < 600) { byWhere.delete(k); } });
      }
      byWhere.set(key, m.made);
    }
    (batch.chunks || (batch.chunks = [])).push(m.made.data);
  }
  // A batch as one array: its faces' vertices, then its models' kept ones.
  function gl3Join(x) {
    if (!x.chunks || !x.chunks.length) { return new Float32Array(x.v); }
    var total = x.v.length;
    x.chunks.forEach(function (c) { total += c.length; });
    var out = new Float32Array(total), at = x.v.length;
    out.set(x.v);
    x.chunks.forEach(function (c) { out.set(c, at); at += c.length; });
    return out;
  }

  // The model's faces, sorted into batches.
  function gl3Faces(G, model, B, ink, sheet, dress) {
    var inkC = gl3Rgb(ink), sheetC = gl3Rgb(sheet), floorPats = new Map();
    // each room with how far its floor is moved to stand over the ground floor
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room"; }).map(function (r) {
      var fl = floors.length ? floorAt(floors, r.x, r.y) : null;
      return { n: r, dx: fl ? fl.dx : 0, dy: fl ? fl.dy : 0 };
    });
    if (typeof listNear === "function") {
      rooms.near = listNear(rooms.map(function (r) {
        return { x: r.n.x + r.dx, y: r.n.y + r.dy, w: r.n.w, h: r.n.h, turn: r.n.turn, r: r };
      }));
    }
    var made = typeof houseMat === "function";
    // snow lying on what faces the sky out of doors; everything wet in the rain (39-house.js)
    var snowy = typeof houseSnow === "function" ? houseSnow() * dress : 0, wet = typeof houseWet === "function" ? houseWet() * dress : 0;
    var SNOW = [0.94, 0.95, 0.98];
    // (2026-10-03) A face of a picture kept from the last (38-view3d.js), as
    // it was, and the light and the paper as they were: its corners as they
    // were worked out then, put in again as they are.  Turning round a big
    // building, every face of it was colored and cornered again each picture.
    var lawnNow = typeof worldLawn === "function" ? worldLawn() : null;
    var same = [inkC.join(), sheetC.join(), dress, snowy, wet, lawnNow ? lawnNow.pat + "," + lawnNow.color : ""].join("|");
    var getB = B.get, rec = null, keepIt = true;
    B.get = function (key, how) {
      var b = getB(key, how);
      if (rec && rec.indexOf(b) < 0) { rec.push(b); b.mark = b.v.length; }
      return b;
    };
    model.faces.forEach(function (f) {
      var how = f.how || {};
      if (how.ghost) {                    // what walking bumps into, unseen
        // (or what only throws a shadow: drawn for the sun, not for the eye)
        if (how.caster) { gl3Poly(B.get("caster", { caster: true }).v, f.pts, f.n, [1, 1, 1], 1, null, PAT.plain); }
        return;
      }
      if (f.mesh) { gl3Mesh(B, f); return; }
      var src = f.src, was = src && gl3FaceKept ? gl3FaceKept.get(src) : null;
      if (was && was.same === same && was.pts === f.pts && was.how === f.how) {
        for (var w = 0; w < was.parts.length; w++) {
          var into = getB(was.parts[w].key, was.parts[w].how);
          (into.chunks || (into.chunks = [])).push(was.parts[w].data);
        }
        return;
      }
      rec = src && gl3FaceKept ? [] : null;
      keepIt = true;
      gl3FaceInto(f, how);
      if (rec && keepIt) {
        gl3FaceKept.set(src, { same: same, pts: f.pts, how: f.how, parts: rec.map(function (b) {
          var data = new Float32Array(b.v.slice(b.mark));
          b.v.length = b.mark;                       // (and in as kept, like the rest)
          (b.chunks || (b.chunks = [])).push(data);
          return { key: b.key, how: b.how, data: data };
        }) });
      }
      rec = null;
    });
    B.get = getB;
    function gl3FaceInto(f, how) {
      var base = gl3Rgb(how.color || sheet), edge = how.edge ? gl3Rgb(how.edge) : inkC, a = 1, pat = PAT.plain;
      if (how.wall && f.top) { base = edge; }
      else if (how.wall && f.side && f.node && f.node.kind === "i_room") {
        // painted walls: a warm white, tinted by the room's own outline;
        // the side that faces the garden boarded -- or what the house was
        // made of, picked (HOUSE_MATS, 38-models.js)
        var out = gl3Outside(f, rooms), wm = made ? houseMat(f.node, out ? "out" : "wall") : null;
        if (wm) { pat = wm.pat; base = gl3Mix(base, gl3Rgb(wm.color), dress); }
        else {
          base = gl3Mix(base, [0.97, 0.95, 0.91], 0.55 * dress);
          if (out) { pat = PAT.siding; base = gl3Mix(base, [0.93, 0.9, 0.84], 0.4 * dress); }
        }
      }
      else if (how.dark) { base = gl3Mix(edge, [0, 0, 0], 0.15); }
      else if (how.roof) {
        var rm = made && how.room ? houseMat(how.room, "roof") : null;
        pat = rm ? rm.pat : PAT.roof;
        if (rm) { base = gl3Mix(base, gl3Rgb(rm.color), dress); }
        if (wet) { base = gl3Mix(base, [0, 0, 0], 0.14 * wet); }
        if (snowy) { base = gl3Mix(base, SNOW, 0.82 * snowy * Math.max(0, Math.min(1, f.n[2] * 1.4))); }
      }
      else if (f.ground) {
        // a lawn, mown -- or what grows in a garden where the land is sand or snow (39-world.js)
        var lawn = typeof worldLawn === "function" ? worldLawn() : null;
        pat = lawn ? lawn.pat : PAT.lawn;
        base = gl3Mix(base, gl3Mix(gl3Mix(base, lawn ? lawn.color : [0.42, 0.62, 0.3], lawn ? 0.75 : 0.55), sheetC, 0.15), dress);
        if (wet) { base = gl3Mix(base, [0.12, 0.2, 0.1], 0.22 * wet); }
        if (snowy) { base = gl3Mix(base, SNOW, 0.86 * snowy); }
      } else if (how.floor && made && how.room && houseMat(how.room, "floor")) {
        var fm = houseMat(how.room, "floor");
        pat = fm.pat; base = gl3Mix(base, gl3Rgb(fm.color), dress);
      } else if (how.floor) {
        if (how.room && !floorPats.has(how.room)) { floorPats.set(how.room, gl3FloorPat(how.room)); }
        pat = how.room ? floorPats.get(how.room) : PAT.boards;
        // what the floor is made of shows through the room's own color
        base = gl3Mix(base, pat === PAT.tiles ? [0.86, 0.88, 0.9] : pat === PAT.concrete ? [0.68, 0.68, 0.66]
                                                                   : [0.78, 0.62, 0.45], 0.45 * dress);
      }
      if (how.pat) { pat = how.pat; }     // its own pattern: a lantern's glass, glowing after dark
      var seen = how.alpha === undefined ? 1 : how.alpha;
      var pic = f.tex && f.texAt ? gl3Texture(G, f.tex) : null;
      if (f.tex && f.texAt && !pic) { keepIt = false; }     // (its picture still on its way: not kept so)
      if (pic && f.tex.key && /^t\|i_pool\|/.test(f.tex.key) && dress > 0.5) {
        pic = null; pat = PAT.water; base = gl3Mix(base, [0.36, 0.66, 0.86], 0.75);
      }
      var batch;
      if (how.glass) {
        batch = B.get("glass", { blend: true, late: true });
        base = gl3Mix(sheetC, [0.5, 0.64, 0.72], 0.75); a = 0.32; pat = 70;
      } else if (seen < 0.999 || how.late) {
        batch = B.get("fading", { blend: true, late: true });
        a = seen;
      } else if (how.decal) {
        if (!pic) { return; }
        batch = B.get("decal|" + (f.tex.key || "?") + (f.clipRound ? "|round" : ""),
                      { tex: pic, decal: true, round: !!f.clipRound, blend: true });
      } else if (pic) {
        batch = B.get("tex|" + (f.tex.key || "?"), { tex: pic });
      } else {
        batch = B.get("plain", {});
      }
      var uvs = pic ? gl3Uvs(f) : null;
      if (f.ground && f.pts.length === 4) {      // the lawn's own numbers, in metres, for its stripes
        var lx = Math.hypot(f.pts[1][0] - f.pts[0][0], f.pts[1][1] - f.pts[0][1]) / FLOOR_PX;
        var ly = Math.hypot(f.pts[3][0] - f.pts[0][0], f.pts[3][1] - f.pts[0][1]) / FLOOR_PX;
        uvs = [[0, 0], [lx, 0], [lx, ly], [0, ly]];
      }
      gl3Poly(batch.v, f.pts, f.n, base, a, uvs, pat);
      // its edges, the way a plan draws them -- not round the glass, a
      // picture laid on top, or the lawn
      if (!how.glass && !how.decal && !f.ground && !how.bare) {
        var line = B.get("lines", { lines: true });
        gl3Lines(line.v, f.pts, edge, (how.floor || how.ceiling ? 0.22 : how.roof ? 0.3 : 0.42) * seen);
      }
    }
  }
  var gl3FaceKept = typeof WeakMap === "function" ? new WeakMap() : null;

  // Those standing -- people, the one walking -- a picture turned to face
  // you, and a soft shadow at their feet.
  function gl3Stand(G, model, B, right) {
    model.stand.forEach(function (s) {
      var wide;
      if (s.ringOnly) { wide = s.tall * 0.42; }          // a body drawn already: only the ring under it
      else {
        var pic = gl3Texture(G, s.img);
        if (!pic) { return; }
        var tall = s.tall;
        wide = tall * s.img.w / s.img.h;
        var rx = right[0] * wide / 2, ry = right[1] * wide / 2;
        var pts = [[s.x - rx, s.y - ry, s.z + tall], [s.x + rx, s.y + ry, s.z + tall],
                   [s.x + rx, s.y + ry, s.z], [s.x - rx, s.y - ry, s.z]];
        var b = B.get("bill|" + (s.img.key || "?"), { tex: pic, bill: true });
        gl3Poly(b.v, pts, [-right[1], right[0], 0], [1, 1, 1], 1, [[0, 0], [1, 0], [1, 1], [0, 1]], PAT.plain);
      }
      var sh = B.get("shade", { blend: true, late: true, noDepthWrite: true });
      var ring = [], r = wide * 0.3;
      for (var k = 0; k < 14; k++) {
        var t = k / 14 * Math.PI * 2;
        ring.push([s.x + Math.cos(t) * r, s.y + Math.sin(t) * r * 0.75, s.z + 0.6]);
      }
      gl3Poly(sh.v, ring, [0, 0, 1], s.walker ? [0.07, 0.38, 0.29] : [0, 0, 0], s.walker ? 0.45 : 0.22, null, PAT.plain);
    });
  }

  // ---- out of doors ------------------------------------------------------------
  // Grass to the horizon, hills along it, trees round the plot, and a road
  // along its front.  Made once for where the house is and how big it is,
  // and kept while that stays the same.
  function gl3Scenery(G, model, walk, sheet) {
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    // (measured by what stands on the ground -- the rooms' floors -- not by
    // every face: a style's eaves, porch or chimney moved the middle, and
    // every tree with it, when the style was changed, 2026-10-03)
    model.faces.forEach(function (f) {
      if (!f.node || f.node.kind !== "i_room" || !f.pts.every(function (p) { return Math.abs(p[2] || 0) < 6; })) { return; }
      f.pts.forEach(function (p) {
        x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
      });
    });
    if (x0 === Infinity) {
      model.faces.forEach(function (f) {
        f.pts.forEach(function (p) {
          x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
        });
      });
    }
    if (x0 === Infinity) { x0 = y0 = -200; x1 = y1 = 200; }
    var mid = [(x0 + x1) / 2, (y0 + y1) / 2], radius = Math.max(150, Math.hypot(x1 - x0, y1 - y0) / 2);
    // the street runs along the lot's front -- the lot drawn, or the least
    // the house stands on -- unless it is turned off (39-house.js)
    var lot = typeof houseStreetLot === "function" ? houseStreetLot()
            : hand.nodes.filter(function (n) { return n.kind === "i_lot"; })[0] || null;
    var key = [walk ? 1 : 0, Math.round(mid[0] / 20), Math.round(mid[1] / 20), Math.round(radius / 20), sheet,
               lot ? [lot.x, lot.y, lot.w, lot.h, lot.turn || 0].map(Math.round).join(",") : "",
               typeof houseSceneKey === "function" ? houseSceneKey() : "",
               hand.nodes.filter(function (n) { return WALK_DOORS[n.kind] || n.kind === "i_driveway"; })
                 .map(function (n) { return [n.x, n.y, n.turn || 0].map(Math.round).join(","); }).join(";")].join("|");
    if (G.scenery && G.scenery.key === key) { return G.scenery; }
    var sheetC = gl3Rgb(sheet), rnd = gl3Rand(Math.round(mid[0] * 7 + mid[1] * 13 + radius));
    var grass = gl3Mix([0.45, 0.63, 0.32], sheetC, 0.12), v = [], late = [];
    gl3SnowNow = typeof houseSnow === "function" ? houseSnow() : 0;
    if (gl3SnowNow) { grass = gl3Mix(grass, [0.93, 0.94, 0.97], 0.88 * gl3SnowNow); }
    else if (typeof houseWet === "function" && houseWet()) { grass = gl3Mix(grass, [0.16, 0.26, 0.12], 0.25); }
    var groundR = walk ? GL3_FAR * 0.9 : radius * 2.3 + 600;
    // (out past the lot's corners -- and, by the water, past the dock and
    // the boats -- before the ground fades: they stood in the haze, 2026-10-03)
    if (!walk && lot) {
      var lotFar = 0, lt = (lot.turn || 0) * Math.PI / 180;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
        var lx = s[0] * lot.w / 2, ly = s[1] * lot.h / 2;
        lotFar = Math.max(lotFar, Math.hypot(lot.x + lx * Math.cos(lt) - ly * Math.sin(lt) - mid[0], lot.y + lx * Math.sin(lt) + ly * Math.cos(lt) - mid[1]));
      });
      var wet = typeof worldLook === "function" && worldLook() && worldLook().water;
      groundR = Math.max(groundR, (lotFar + (wet ? 34 : 14) * FLOOR_PX) / 0.72 * 0.85);
    }
    // which spots are taken: the plot, the house, the road
    var keepOff = [];
    function lotLocal(p) {
      var a = -(lot.turn || 0) * Math.PI / 180, dx = p[0] - lot.x, dy = p[1] - lot.y;
      return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
    }
    function lotWorld(lx, ly, z) {
      var a = (lot.turn || 0) * Math.PI / 180;
      return [lot.x + lx * Math.cos(a) - ly * Math.sin(a), lot.y + lx * Math.sin(a) + ly * Math.cos(a), z];
    }
    var walkW = 1.6 * FLOOR_PX, roadW = 7 * FLOOR_PX;
    // what the land is like round about -- grass, sand, snow, the sea --
    // picked in the view's Settings (39-world.js); or a wide disc of grass
    var land = { mid: mid, groundR: groundR, grass: grass, sheetC: sheetC, walk: walk, rnd: rnd, keepOff: keepOff,
                 lot: lot, lotLocal: lot ? lotLocal : null, lotWorld: lot ? lotWorld : null,
                 hy: lot ? lot.h / 2 : 0, walkW: walkW, roadW: roadW, bounds: [x0, x1, y0, y1], radius: radius };
    if (!(typeof worldGround === "function" && worldGround(v, land))) {
      var ring = [];
      for (var k = 0; k < 64; k++) {
        var t = k / 64 * Math.PI * 2;
        ring.push([mid[0] + Math.cos(t) * groundR, mid[1] + Math.sin(t) * groundR, -3]);
      }
      gl3Poly(v, ring, [0, 0, 1], grass, 1, null, PAT.grass);
    }
    if (lot) {
      // the road along the plot's front (its foot edge), and the pavement
      // between the two, as far as can be seen each way
      var reach = walk ? GL3_FAR * 0.8 : groundR, hy = lot.h / 2;
      var pave = [lotWorld(-reach, hy, -1.5), lotWorld(reach, hy, -1.5), lotWorld(reach, hy + walkW, -1.5), lotWorld(-reach, hy + walkW, -1.5)];
      gl3Poly(v, pave, [0, 0, 1], gl3Mix([0.8, 0.79, 0.76], sheetC, 0.2), 1,
              [[-reach / FLOOR_PX, 0], [reach / FLOOR_PX, 0], [reach / FLOOR_PX, 1.6], [-reach / FLOOR_PX, 1.6]], PAT.walk);
      var road = [lotWorld(-reach, hy + walkW, -2), lotWorld(reach, hy + walkW, -2),
                  lotWorld(reach, hy + walkW + roadW, -2), lotWorld(-reach, hy + walkW + roadW, -2)];
      gl3Poly(v, road, [0, 0, 1], gl3Mix([0.3, 0.31, 0.33], sheetC, 0.08), 1,
              [[-reach / FLOOR_PX, -3.5], [reach / FLOOR_PX, -3.5], [reach / FLOOR_PX, 3.5], [-reach / FLOOR_PX, 3.5]], PAT.road);
      keepOff.push(function (p) {
        var q = lotLocal(p);
        // the street and its pavement all the way along, not only in front
        // of the lot (2026-10-01: "trees ... appearing in the middle of the
        // road or sidewalk"), and the lot itself
        if (q[1] > hy - 60 && q[1] < hy + walkW + roadW + 90) { return true; }
        return Math.abs(q[0]) < lot.w / 2 + 60 && q[1] > -lot.h / 2 - 60 && q[1] < hy;
      });
      // street lamps along the kerb, every 18 m: a post, and a lamp that
      // glows after dark (38-view3d-more.js) -- or of the design picked
      // (39-world.js)
      var post = gl3Mix([0.33, 0.34, 0.36], sheetC, 0.1), lampC = [1.0, 0.93, 0.76], every = 18 * FLOOR_PX;
      if (!(typeof worldLamps === "function" && worldLamps(v, land, reach))) {
        for (var lx = -Math.floor(reach / every) * every + every / 2; lx < reach; lx += every) {
          var foot = lotWorld(lx, hy + walkW - 0.35 * FLOOR_PX, 0);
          gl3Prism(v, foot, 0.07 * FLOOR_PX, 0.05 * FLOOR_PX, 0, 4.2 * FLOOR_PX, 6, post, PAT.plain);
          gl3Prism(v, foot, 0.05 * FLOOR_PX, 0.24 * FLOOR_PX, 4.0 * FLOOR_PX, 4.25 * FLOOR_PX, 8, post, PAT.plain);
          gl3Prism(v, foot, 0.2 * FLOOR_PX, 0.16 * FLOOR_PX, 3.95 * FLOOR_PX, 4.02 * FLOOR_PX, 8, lampC, 31);
        }
      }
      // and joined to the house: paths from its doors, its drive over the pavement
      if (typeof houseStreetBits === "function") { houseStreetBits(v, lot, lotWorld, lotLocal, hy, walkW, sheetC); }
    }
    keepOff.push(function (p) { return p[0] > x0 - 120 && p[0] < x1 + 120 && p[1] > y0 - 120 && p[1] < y1 + 120; });
    // (off a lot whose trees are its own pieces: 40-edit3d.js)
    var lotOff = typeof sceneryKeepOffLot === "function" ? sceneryKeepOffLot() : null;
    if (lotOff) { keepOff.push(lotOff); }
    // the houses next door and across the street, if wanted (39-world.js)
    if (typeof worldHood === "function") { worldHood(v, land); }
    // trees, round about, and a few bushes nearer
    var inner = Math.max(x1 - x0, y1 - y0) / 2 + 200, outer = walk ? radius + 4400 : Math.max(inner + 200, groundR - 160);
    var count = walk ? 70 : Math.round(Math.min(46, 14 + (outer - inner) / 60));
    if (typeof houseOpt === "function" && !houseOpt("trees")) { count = 0; }
    if (!(typeof worldGrow === "function" && worldGrow(v, land, inner, outer, count))) {
      for (var i = 0, tries = 0; i < count && tries < count * 12; tries++) {
        var ang = rnd() * Math.PI * 2, far = inner + Math.pow(rnd(), 0.8) * (outer - inner);
        var at = [mid[0] + Math.cos(ang) * far, mid[1] + Math.sin(ang) * far];
        if (keepOff.some(function (off) { return off(at); })) { continue; }
        gl3Tree(v, at, rnd, sheetC, rnd() < 0.3);
        i++;
      }
    }
    if (walk && typeof worldHorizon === "function" && worldHorizon(v, land)) {
      // the skyline the land picked has (39-world.js)
    } else if (walk) {
      // hills, far off, all the way round
      var hills = [], n = 72, rIn = GL3_FAR * 0.3, rOut = GL3_FAR * 0.5;
      for (var h = 0; h <= n; h++) {
        var th = h / n * Math.PI * 2;
        var rise = (0.5 + 0.5 * Math.sin(th * 3 + 1.3)) * 0.6 + (0.5 + 0.5 * Math.sin(th * 7 + 0.4)) * 0.4;
        hills.push([th, (380 + 1500 * rise * (0.6 + 0.4 * rnd()))]);
      }
      var hillC = gl3Mix([0.5, 0.62, 0.48], sheetC, 0.2);
      for (var q = 0; q < n; q++) {
        var A = hills[q], C = hills[q + 1];
        var a0 = [mid[0] + Math.cos(A[0]) * rIn, mid[1] + Math.sin(A[0]) * rIn, -3];
        var a1 = [mid[0] + Math.cos(C[0]) * rIn, mid[1] + Math.sin(C[0]) * rIn, -3];
        var b0 = [mid[0] + Math.cos(A[0]) * rOut, mid[1] + Math.sin(A[0]) * rOut, A[1]];
        var b1 = [mid[0] + Math.cos(C[0]) * rOut, mid[1] + Math.sin(C[0]) * rOut, C[1]];
        var nx = -Math.cos((A[0] + C[0]) / 2), ny = -Math.sin((A[0] + C[0]) / 2);
        gl3Poly(v, [a0, a1, b1, b0], [nx * 0.6, ny * 0.6, 0.8], hillC, 1, null, PAT.hill);
      }
    }
    G.scenery = { key: key, verts: new Float32Array(v), late: late, mid: mid, radius: radius, groundR: groundR,
                  bounds: [x0, x1, y0, y1] };
    return G.scenery;
  }

  // One tree: a trunk, and leaves in a few round lumps -- or, a third of
  // the time, a fir, in tiers.  (Snow on them, where it is snowing.)
  var gl3SnowNow = 0;
  function gl3Tree(v, at, rnd, sheetC, fir) {
    var trunkH = (1.4 + rnd() * 1.4) * FLOOR_PX, trunkR = (0.14 + rnd() * 0.08) * FLOOR_PX;
    var bark = gl3Mix([0.42, 0.32, 0.24], sheetC, 0.1);
    var leaf = gl3Mix(fir ? [0.2, 0.42, 0.28] : [0.3 + rnd() * 0.12, 0.52 + rnd() * 0.12, 0.25], sheetC, 0.08);
    if (gl3SnowNow) { leaf = gl3Mix(leaf, [0.92, 0.94, 0.97], 0.5 * gl3SnowNow); }
    gl3Prism(v, at, trunkR, trunkR * 0.75, 0, trunkH + (fir ? 0 : 0.5 * FLOOR_PX), 6, bark, PAT.bark);
    if (fir) {
      var w = (1.3 + rnd() * 0.7) * FLOOR_PX, z = trunkH * 0.45;
      for (var t = 0; t < 3; t++) {
        gl3Cone(v, at, w * (1 - t * 0.25), z, z + w * 1.15, 9, leaf);
        z += w * 0.62;
      }
      return;
    }
    var R = (1.2 + rnd() * 0.9) * FLOOR_PX;
    gl3Blob(v, [at[0], at[1], trunkH + R * 0.75], R, leaf);
    gl3Blob(v, [at[0] + R * 0.5, at[1] - R * 0.2, trunkH + R * 0.5], R * 0.68, gl3Mix(leaf, [0, 0, 0], 0.06));
    gl3Blob(v, [at[0] - R * 0.45, at[1] + R * 0.3, trunkH + R * 0.55], R * 0.62, gl3Mix(leaf, [1, 1, 1], 0.05));
  }
  function gl3Prism(v, at, r0, r1, z0, z1, sides, c, pat) {
    for (var i = 0; i < sides; i++) {
      var a = i / sides * Math.PI * 2, b = (i + 1) / sides * Math.PI * 2, m = (a + b) / 2;
      var p = [[at[0] + Math.cos(a) * r0, at[1] + Math.sin(a) * r0, z0], [at[0] + Math.cos(b) * r0, at[1] + Math.sin(b) * r0, z0],
               [at[0] + Math.cos(b) * r1, at[1] + Math.sin(b) * r1, z1], [at[0] + Math.cos(a) * r1, at[1] + Math.sin(a) * r1, z1]];
      gl3Poly(v, p, [Math.cos(m), Math.sin(m), 0], c, 1, null, pat);
    }
  }
  function gl3Cone(v, at, r, z0, z1, sides, c) {
    var tip = [at[0], at[1], z1], slope = r / (z1 - z0);
    for (var i = 0; i < sides; i++) {
      var a = i / sides * Math.PI * 2, b = (i + 1) / sides * Math.PI * 2, m = (a + b) / 2;
      var n = [Math.cos(m), Math.sin(m), slope], l = Math.hypot(n[0], n[1], n[2]);
      gl3Poly(v, [[at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r, z0], [at[0] + Math.cos(b) * r, at[1] + Math.sin(b) * r, z0], tip],
              [n[0] / l, n[1] / l, n[2] / l], c, 1, null, PAT.leaves);
      gl3Poly(v, [[at[0] + Math.cos(b) * r, at[1] + Math.sin(b) * r, z0], [at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r, z0], [at[0], at[1], z0]],
              [0, 0, -1], gl3Mix(c, [0, 0, 0], 0.3), 1, null, PAT.leaves);
    }
  }
  // A round lump: an octahedron, split twice and pushed out round.
  var GL3_BLOB = (function () {
    var tri = [[[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [[0, 0, 1], [-1, 0, 0], [0, -1, 0]],
               [[0, 0, 1], [0, -1, 0], [1, 0, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
               [[0, 0, -1], [0, -1, 0], [-1, 0, 0]], [[0, 0, -1], [1, 0, 0], [0, -1, 0]]];
    function unit(p) { var l = Math.hypot(p[0], p[1], p[2]); return [p[0] / l, p[1] / l, p[2] / l]; }
    for (var r = 0; r < 2; r++) {
      var next = [];
      tri.forEach(function (t) {
        var ab = unit([(t[0][0] + t[1][0]) / 2, (t[0][1] + t[1][1]) / 2, (t[0][2] + t[1][2]) / 2]);
        var bc = unit([(t[1][0] + t[2][0]) / 2, (t[1][1] + t[2][1]) / 2, (t[1][2] + t[2][2]) / 2]);
        var ca = unit([(t[2][0] + t[0][0]) / 2, (t[2][1] + t[0][1]) / 2, (t[2][2] + t[0][2]) / 2]);
        next.push([t[0], ab, ca], [ab, t[1], bc], [ca, bc, t[2]], [ab, bc, ca]);
      });
      tri = next;
    }
    return tri;
  })();
  function gl3Blob(v, at, R, c) {
    GL3_BLOB.forEach(function (t) {
      var n = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, (t[0][2] + t[1][2] + t[2][2]) / 3];
      var l = Math.hypot(n[0], n[1], n[2]);
      gl3Poly(v, t.map(function (p) { return [at[0] + p[0] * R, at[1] + p[1] * R, at[2] + p[2] * R * 0.85]; }),
              [n[0] / l, n[1] / l, n[2] / l], c, 1, null, PAT.leaves);
    });
  }

  // ---- the cameras ---------------------------------------------------------------
  // The same two 38-view3d.js draws with -- from above (v3Project) and from
  // the eye (v3EyeOf, v3Screen) -- as matrices, so the names it puts on
  // over the picture land on the things they name.
  function gl3Above(lo, hi) {
    var cy = Math.cos(V3.yaw), sy = Math.sin(V3.yaw), cp = Math.cos(V3.pitch), sp = Math.sin(V3.pitch);
    var rise = V3.rise === undefined ? 1 : V3.rise, s = V3.scale, w = V3.w, h = V3.h, cx = V3.cx, cyy = V3.cy;
    var lean = 0.03;                     // flattened, the higher of two things still wins
    var R = Math.max(1, hi - lo);
    var depthOff = cp * (-sy * cx - cy * cyy);
    return gl3Mat(
      [2 * s * cy / w, -2 * s * sy / w, 0, (2 / w) * (V3.panX + s * (-cy * cx + sy * cyy))],
      [-(2 / h) * s * sp * sy, -(2 / h) * s * sp * cy, (2 / h) * s * cp * rise, -(2 / h) * (V3.panY - s * sp * (sy * cx + cy * cyy))],
      [-2 * cp * sy / R, -2 * cp * cy / R, -2 * (sp * rise + lean) / R, 1 - 2 * (depthOff - lo) / R],
      [0, 0, 0, 1]);
  }
  function gl3Depth(p) {                 // the depth gl3Above sorts by, for its range
    var cy = Math.cos(V3.yaw), sy = Math.sin(V3.yaw), cp = Math.cos(V3.pitch), sp = Math.sin(V3.pitch);
    var rise = V3.rise === undefined ? 1 : V3.rise;
    var px = p[0] - V3.cx, py = p[1] - V3.cy;
    return cp * (px * sy + py * cy) + (sp * rise + 0.03) * (p[2] || 0);
  }
  function gl3Eye() {
    var m = V3.me, e = V3.eye, ch = Math.cos(m.head), sh = Math.sin(m.head), cp = Math.cos(m.pitch), sp = Math.sin(m.pitch);
    var f = (V3.w / 2) / Math.tan(V3_FOV / 2);
    var across = [-sh, ch, 0, sh * e.x - ch * e.y];
    var aheadFlat = ch * e.x + sh * e.y;
    var up = [-sp * ch, -sp * sh, cp, sp * aheadFlat - cp * e.z];
    var ahead = [cp * ch, cp * sh, sp, -cp * aheadFlat - sp * e.z];
    var A = (GL3_FAR + GL3_NEAR) / (GL3_FAR - GL3_NEAR), Bz = -2 * GL3_FAR * GL3_NEAR / (GL3_FAR - GL3_NEAR);
    return {
      mvp: gl3Mat(across.map(function (q) { return q * f / (V3.w / 2); }),
                  up.map(function (q) { return q * f / (V3.h / 2); }),
                  [A * ahead[0], A * ahead[1], A * ahead[2], A * ahead[3] + Bz],
                  ahead),
      right: [-sh, ch, 0], upv: [-sp * ch, -sp * sh, cp], ahead: [cp * ch, cp * sh, sp],
      tan: [Math.tan(V3_FOV / 2), Math.tan(V3_FOV / 2) * V3.h / V3.w]
    };
  }
  // The ceiling light's view: straight down from it, wide enough for the
  // whole room under it.
  function gl3LampView(L) {
    var f = 1 / Math.tan(70 * Math.PI / 180), n = 4, far = 9 * FLOOR_PX;
    var A = (far + n) / (n - far), Bz = 2 * far * n / (n - far);
    return gl3Mat([f, 0, 0, -f * L[0]], [0, f, 0, -f * L[1]], [0, 0, A, -A * L[2] + Bz], [0, 0, -1, L[2]]);
  }
  // The sun's own view, a box round everything that can throw a shadow.
  function gl3SunView(b, sun) {
    var L = sun || GL3_SUN, f = [-L[0], -L[1], -L[2]];
    var r = [f[1], -f[0], 0], rl = Math.hypot(r[0], r[1]) || 1;
    r = [r[0] / rl, r[1] / rl, 0];
    var u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    [b.x0, b.x1].forEach(function (x) {
      [b.y0, b.y1].forEach(function (y) {
        [b.z0, b.z1].forEach(function (z) {
          var q = [x * r[0] + y * r[1] + z * r[2], x * u[0] + y * u[1] + z * u[2], x * f[0] + y * f[1] + z * f[2]];
          for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i]); hi[i] = Math.max(hi[i], q[i]); }
        });
      });
    });
    function row(axis, i) {
      var span = Math.max(1, hi[i] - lo[i]);
      return [2 * axis[0] / span, 2 * axis[1] / span, 2 * axis[2] / span, -1 - 2 * lo[i] / span];
    }
    var m = gl3Mat(row(r, 0), row(u, 1), row(f, 2), [0, 0, 0, 1]);
    m.span = Math.max(hi[0] - lo[0], hi[1] - lo[1]);   // how wide a texel of the shadow map is, times its count
    return m;
  }

  // ---- drawing -----------------------------------------------------------------------
  function gl3Bind(gl, prog, stride) {
    var at = prog.at, F = 4;
    [["aPos", 3, 0], ["aNorm", 3, 3], ["aColor", 4, 6], ["aUv", 2, 10], ["aPat", 1, 12]].forEach(function (a) {
      var loc = at[a[0]];
      if (loc === undefined || loc < 0) { return; }
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, a[1], gl.FLOAT, false, stride * F, a[2] * F);
    });
  }

  // Draws a home into the view; false if it cannot, and the old way is used.
  // What is drawn next, onto the GPU: the house afresh every time, but the
  // land round it -- trees by the hundred in a forest -- once, and kept
  // there while it stays the same.
  function gl3Upload(G, data, key) {
    var gl = G.gl;
    if (G.scenery && data === G.scenery.verts) {
      if (!G.sceneBuf) { G.sceneBuf = gl.createBuffer(); }
      gl.bindBuffer(gl.ARRAY_BUFFER, G.sceneBuf);
      if (G.sceneBufFor !== data) { gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); G.sceneBufFor = data; }
      return;
    }
    // (2026-10-02: "update it so it works and runs better") a batch of the
    // house in a buffer of its own, sent again only when it is not what the
    // buffer already holds: it was sent afresh up to three times a picture
    // -- the sun's view, the light's, the picture -- some 28 MB a time
    if (key) {
      var slots = G.slots || (G.slots = {}), slot = slots[key];
      if (!slot) { slot = slots[key] = { buf: gl.createBuffer(), data: null }; }
      gl.bindBuffer(gl.ARRAY_BUFFER, slot.buf);
      if (slot.data !== data) { gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW); slot.data = data; }
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, G.buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  }
  // A batch as one array -- the same array as last picture where nothing in
  // it changed: its faces' numbers the same, its models the very same kept
  // arrays (gl3Mesh).  `G.same` says whether every batch was.
  function gl3Same(a, b) {
    if (a.length !== b.length) { return false; }
    for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) { return false; } }
    return true;
  }
  function gl3JoinKept(G, x) {
    var K = G.kept || (G.kept = {}), k = K[x.key], chunks = x.chunks || [];
    if (k && gl3Same(k.chunks, chunks) && gl3Same(k.v, x.v)) { return k.data; }
    G.same = false;
    var data = gl3Join(x);
    K[x.key] = { v: x.v, chunks: chunks.slice(), data: data };
    return data;
  }
  // The box round every face: each face kept from the last picture
  // (38-view3d.js) its box kept on it too.
  function gl3FacesBox(faces) {
    var b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, z0: Infinity, z1: -Infinity };
    function boxOf(pts) {
      var o = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p[0] < o[0]) { o[0] = p[0]; } if (p[0] > o[1]) { o[1] = p[0]; }
        if (p[1] < o[2]) { o[2] = p[1]; } if (p[1] > o[3]) { o[3] = p[1]; }
        if (p[2] < o[4]) { o[4] = p[2]; } if (p[2] > o[5]) { o[5] = p[2]; }
      }
      return o;
    }
    for (var i = 0; i < faces.length; i++) {
      var f = faces[i], s = f.src, o = s && s.pts === f.pts ? (s.box6 || (s.box6 = boxOf(s.pts))) : boxOf(f.pts);
      if (o[0] < b.x0) { b.x0 = o[0]; } if (o[1] > b.x1) { b.x1 = o[1]; }
      if (o[2] < b.y0) { b.y0 = o[2]; } if (o[3] > b.y1) { b.y1 = o[3]; }
      if (o[4] < b.z0) { b.z0 = o[4]; } if (o[5] > b.z1) { b.z1 = o[5]; }
    }
    return b;
  }
  function v3GlDraw(model, inside) {
    var G = gl3Ready();
    if (!G) { return false; }
    var gl = G.gl, dpr = window.devicePixelRatio || 1;
    var W = Math.max(1, Math.round(V3.w * dpr)), H = Math.max(1, Math.round(V3.h * dpr));
    if (G.canvas.width !== W || G.canvas.height !== H) { G.canvas.width = W; G.canvas.height = H; }
    var ink = simInk(), sheet = simSheet(), sheetC = gl3Rgb(sheet);
    var time = (performance.now() - G.t0) / 1000;
    // how far it is dressed as a house -- materials, sky, garden -- rather
    // than drawn as a plan: all the way walking round, and from above as
    // far as its walls are up, so it rises out of the drawing and lies
    // back down into it
    var dress = inside ? 1 : Math.max(0, Math.min(1, V3.rise === undefined ? 1 : V3.rise));
    // flat with its furniture in 3D: the plan as drawn, plain; the furniture alone dressed (gl3Mesh)
    if (typeof flat3dNow === "function" && flat3dNow()) { dress = 0; }
    // the time of day: where the sun (or the moon) is, and the light and the
    // sky it gives (38-view3d-more.js)
    var sky = gl3SkyNow(), sun = sky.sun;
    try {
      var scenery = gl3Scenery(G, model, inside, sheet);
      var B = gl3Batches();
      gl3Faces(G, model, B, ink, sheet, dress);
      // which way is "across" for those standing: across the screen
      var right = inside ? [-Math.sin(V3.me.head), Math.cos(V3.me.head)] : [Math.cos(V3.yaw), -Math.sin(V3.yaw)];
      gl3Stand(G, model, B, right);
      // people out walking, cars going by (39-world.js): drawn, but not what the view is fitted to
      if (model.passing) {
        gl3Faces(G, { faces: model.passing.faces }, B, ink, sheet, dress);
        gl3Stand(G, { stand: model.passing.stand }, B, right);
      }
      // the camera
      var mvp, eye = null, toward = [0, 0, 1], cam = null;
      if (inside) {
        cam = gl3Eye();
        mvp = cam.mvp;
        eye = [V3.eye.x, V3.eye.y, V3.eye.z];
      } else {
        toward = v3Toward();
        var lo = Infinity, hi = -Infinity, sb = scenery.bounds, R = scenery.groundR, m = scenery.mid;
        // (the land's own rise and fall too, 40-land.js)
        var land = typeof terrSpan === "function" ? terrSpan() : { lo: 0, hi: 0 };
        [[m[0] - R, m[1] - R], [m[0] + R, m[1] - R], [m[0] + R, m[1] + R], [m[0] - R, m[1] + R]].forEach(function (c) {
          [-10 + Math.min(0, land.lo), 1600 + Math.max(0, land.hi)].forEach(function (z) { var d = gl3Depth([c[0], c[1], z]); lo = Math.min(lo, d); hi = Math.max(hi, d); });
        });
        // (the corners of the box round it all, not every corner of every
        // face: as near and as far, and a big building has forty thousand)
        var all = gl3FacesBox(model.faces);
        if (all.x0 !== Infinity) {
          [all.x0, all.x1].forEach(function (x) { [all.y0, all.y1].forEach(function (y) { [all.z0, all.z1].forEach(function (z) {
            var d = gl3Depth([x, y, z]); lo = Math.min(lo, d); hi = Math.max(hi, d);
          }); }); });
        }
        var pad = (hi - lo) * 0.05 + 10;
        mvp = gl3Above(lo - pad, hi + pad);
        void sb;
      }
      G.mvp = mvp;                       // (for a press on the view, turned into a ray: 40-drag.js)
      // where the sun can throw a shadow from: the house and what is near it
      var fb = gl3FacesBox(model.faces);
      var b = { x0: fb.x0, x1: fb.x1, y0: fb.y0, y1: fb.y1, z0: Math.min(0, fb.z0), z1: Math.max(0, fb.z1) };
      var flatish = !inside && (V3.rise === undefined ? 1 : V3.rise) < 0.98;
      // (walking round inside too: the sun comes in at the windows and the
      // doors, and nowhere else -- 2026-10-01, "update the shadows so they
      // are also accurate")
      var shadows = G.shadowOk && b.x0 !== Infinity && !flatish;
      var under = typeof houseUnder === "function" && houseUnder();
      var sunMvp = gl3Mat([1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]), nudge = 0;
      if (shadows) {
        // a low sun throws long shadows: room round the house for them
        var grow = 300 + b.z1 * Math.min(4, Math.hypot(sun[0], sun[1]) / Math.max(0.15, sun[2]));
        // (down to the lowest ground near the house, where the land falls away: 40-land.js)
        var nearLo = typeof terrSpan === "function" ? terrSpan().nearLo : 0;
        var sunBox = { x0: b.x0 - grow, x1: b.x1 + grow, y0: b.y0 - grow, y1: b.y1 + grow,
                       z0: Math.min(-10, b.z0 - 10, nearLo - 10), z1: b.z1 + 50 };
        sunMvp = gl3SunView(sunBox, sun);
        nudge = 1.5 * (sunMvp.span || Math.max(sunBox.x1 - sunBox.x0, sunBox.y1 - sunBox.y0)) / GL3_SHADOW;
      }

      // the batches as arrays, once -- the same arrays as last picture where
      // nothing in them changed (gl3JoinKept), and then the GPU has them
      var batches = B.all.filter(function (x) { return x.v.length || (x.chunks && x.chunks.length); });
      G.same = true;
      batches.forEach(function (x) { x.data = gl3JoinKept(G, x); });
      var keys = batches.map(function (x) { return x.key; }).join("|");
      if (keys !== G.lastKeys) { G.same = false; G.lastKeys = keys; }

      // ---- the sun's view: everything solid, how near the sun ----------------
      // (drawn again only when something in it, or the sun, has moved: walking
      // round looking, it has not)
      var sunKey = shadows ? Array.prototype.join.call(sunMvp, ",") + "|" + (under ? 1 : 0) : "";
      var sunAgain = shadows && !(G.same && G.sunKey === sunKey && G.sunScene === scenery.verts);
      G.sunKey = shadows ? sunKey : null; G.sunScene = scenery.verts;
      if (sunAgain) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, G.shadowFb);
        gl.viewport(0, 0, GL3_SHADOW, GL3_SHADOW);
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.depthMask(true); gl.disable(gl.BLEND);
        gl.useProgram(G.depth.p);
        gl.uniformMatrix4fv(G.depth.at.uSunMvp, false, sunMvp);
        function cast(data, key) {
          gl3Upload(G, data, key);
          var loc = G.depth.at.aPos;
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, GL3_STRIDE * 4, 0);
          gl.drawArrays(gl.TRIANGLES, 0, data.length / GL3_STRIDE);
        }
        batches.forEach(function (x) { if (!x.how.lines && !x.how.blend && !x.how.bill) { cast(x.data, x.key); } });
        if (!under) { cast(scenery.verts); }
        gl.disableVertexAttribArray(G.depth.at.aPos);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      // ---- indoors, the ceiling light's view: what stands under it, how near ----
      // (2026-10-02: "accurate shadows and depth inside") and the room's box, for
      // the shading into its corners and along the foot of its walls
      var lampMvp = gl3Mat([0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 1]), lampOn = 0;
      var roomBox = [0, 0, 0, 0], roomZ = [0, 0];
      if (inside && V3.inRoom) {
        var ir = V3.inRoom, irf = typeof floorsOf === "function" ? floorAt(floorsOf(), ir.x, ir.y) : null;
        var irx = ir.x + (irf ? irf.dx : 0), iry = ir.y + (irf ? irf.dy : 0), irz = irf ? irf.z : 0, irt = (((ir.turn || 0) % 180) + 180) % 180;
        if (irt === 0 || irt === 90) {
          var hw2 = (irt ? ir.h : ir.w) / 2, hh2 = (irt ? ir.w : ir.h) / 2;
          roomBox = [irx - hw2, iry - hh2, irx + hw2, iry + hh2];
        }
        roomZ = [irz, irz + ceilOf(ir) * FLOOR_PX];
        var dark = typeof useDark === "function" && useDark(ir);
        if (G.lampOk && !dark) {
          // (the light under what hangs in the middle of the ceiling -- a fan's
          // own light is under its blades, which threw a great round shadow)
          var lampZ = irz + (ceilOf(ir) - 0.35) * FLOOR_PX;
          hand.nodes.forEach(function (m) {
            if (!FROM_CEILING[m.kind] || Math.hypot(m.x - ir.x, m.y - ir.y) > 1.3 * FLOOR_PX) { return; }
            lampZ = Math.min(lampZ, irz + (ceilOf(ir) - hangDrop(m)[0] - 0.06) * FLOOR_PX);
          });
          lampMvp = gl3LampView([irx, iry, Math.max(irz + 1.7 * FLOOR_PX, lampZ)]);
          lampOn = 1;
          var lampKey = Array.prototype.join.call(lampMvp, ",");
          var lampAgain = !(G.same && G.lampKey === lampKey);
          G.lampKey = lampKey;
        }
        if (lampOn && lampAgain) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, G.lampFb);
          gl.viewport(0, 0, GL3_LAMP, GL3_LAMP);
          gl.clearColor(1, 1, 1, 1);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.depthMask(true); gl.disable(gl.BLEND);
          gl.useProgram(G.depth.p);
          gl.uniformMatrix4fv(G.depth.at.uSunMvp, false, lampMvp);
          batches.forEach(function (x) {
            if (x.how.lines || x.how.blend || x.how.bill || x.how.caster) { return; }
            gl3Upload(G, x.data, x.key);
            gl.enableVertexAttribArray(G.depth.at.aPos);
            gl.vertexAttribPointer(G.depth.at.aPos, 3, gl.FLOAT, false, GL3_STRIDE * 4, 0);
            gl.drawArrays(gl.TRIANGLES, 0, x.data.length / GL3_STRIDE);
          });
          gl.disableVertexAttribArray(G.depth.at.aPos);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
      }

      // ---- the picture ------------------------------------------------------------
      gl.viewport(0, 0, W, H);
      var zenith = gl3Mix(sheetC, gl3Mix(sky.zenith, sheetC, 0.18 * (1 - sky.night)), dress);
      var horizon = gl3Mix(sheetC, gl3Mix(sky.horizon, sheetC, 0.25 * (1 - sky.night)), dress);
      var below = gl3Mix(sky.below, sheetC, 0.2 * (1 - sky.night));
      gl.clearColor(horizon[0], horizon[1], horizon[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // the sky
      gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.BLEND);
      gl.useProgram(G.sky.p);
      var sk = G.sky.at;
      if (cam) {
        gl.uniform3fv(sk.uRight, cam.right); gl.uniform3fv(sk.uUp, cam.upv); gl.uniform3fv(sk.uAhead, cam.ahead);
        gl.uniform2fv(sk.uTan, cam.tan); gl.uniform1f(sk.uFlat, 0);
      } else {
        gl.uniform1f(sk.uFlat, 1);
      }
      gl.uniform3fv(sk.uZenith, zenith); gl.uniform3fv(sk.uHorizon, horizon);
      gl.uniform3fv(sk.uBelow, inside ? below : gl3Mix(horizon, gl3Mix(horizon, [0.55, 0.6, 0.62], 0.3), dress));
      gl.uniform3fv(sk.uSunDir, sun); gl.uniform1f(sk.uTime, time);
      gl.uniform3fv(sk.uSunGlow, sky.glow); gl.uniform3fv(sk.uCloud, sky.cloud); gl.uniform1f(sk.uNight, sky.night * dress);
      if (sk.uCover) { gl.uniform1f(sk.uCover, typeof houseCover === "function" ? houseCover() : 0); }
      gl.bindBuffer(gl.ARRAY_BUFFER, G.skyBuf);
      gl.enableVertexAttribArray(sk.aXY);
      gl.vertexAttribPointer(sk.aXY, 2, gl.FLOAT, false, 8, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disableVertexAttribArray(sk.aXY);

      // everything else, in the one program
      var P = G.main, U = P.at;
      gl.useProgram(P.p);
      gl.uniformMatrix4fv(U.uMvp, false, mvp);
      gl.uniformMatrix4fv(U.uSunMvp, false, sunMvp);
      if (U.uNudge) { gl.uniform1f(U.uNudge, nudge); }
      gl.uniform3fv(U.uSunDir, sun);
      // indoors the sun lights only what it reaches through the windows (the
      // shadows say where); with no shadows to say so, it is dimmed all over
      var indoorDim = inside && V3.inRoom ? (shadows ? 0.85 : 0.3) : 1;
      gl.uniform3fv(U.uSunCol, [sky.sunCol[0] * indoorDim, sky.sunCol[1] * indoorDim, sky.sunCol[2] * indoorDim]);
      gl.uniform3fv(U.uSkyAmb, inside && V3.inRoom ? [0.78, 0.78, 0.8] : gl3Mix([0.58, 0.62, 0.68], sky.skyAmb, dress));
      gl.uniform3fv(U.uGroundAmb, gl3Mix([0.42, 0.42, 0.4], sky.groundAmb, dress));
      gl.uniform1f(U.uNight, sky.night * dress);
      gl.uniform1f(U.uGlow, 0);
      gl.uniform3fv(U.uEye, eye || [0, 0, 0]);
      gl.uniform3fv(U.uToward, toward);
      gl.uniform1f(U.uOrtho, inside ? 0 : 1);
      gl.uniform3fv(U.uFogCol, horizon);
      var fogBy = typeof houseFog === "function" ? houseFog() : 1;     // closer in, in the rain or a fog
      gl.uniform1f(U.uFogNear, inside ? GL3_FAR * 0.18 * fogBy * fogBy : 1e9);
      gl.uniform1f(U.uFogFar, inside ? GL3_FAR * 0.8 * fogBy : 2e9);
      gl.uniform1f(U.uPx, FLOOR_PX);
      gl.uniform1f(U.uTime, time);
      gl.uniform1f(U.uShadowOn, shadows ? 1 : 0);
      gl.uniform1f(U.uIndoor, inside && V3.inRoom ? 1 : 0);
      // the light in the room walked in: the middle of its ceiling
      var lamp = [0, 0, 0];
      if (inside && V3.inRoom) {
        var lr = V3.inRoom, lf = typeof floorsOf === "function" ? floorAt(floorsOf(), lr.x, lr.y) : null;
        lamp = [lr.x + (lf ? lf.dx : 0), lr.y + (lf ? lf.dy : 0), (lf ? lf.z : 0) + (ceilOf(lr) - 0.35) * FLOOR_PX];
        if (typeof useDark === "function" && useDark(lr)) { lamp = [lr.x, lr.y, -1e6]; }   // switched off: no lamp at all
      }
      if (U.uLamp) { gl.uniform3fv(U.uLamp, lamp); }
      // after dark, a light under every room's ceiling (the first sixteen)
      if (U["uRooms[0]"] && sky.night > 0.01) {
        var fl3 = typeof floorsOf === "function" ? floorsOf() : [], lights = new Float32Array(96), nl = 0;
        // the lights out of doors first (the first eight), then the rooms'
        (typeof houseLights === "function" ? houseLights() : []).slice(0, 8).forEach(function (L) {
          lights.set(L, nl * 4);
          nl++;
        });
        hand.nodes.forEach(function (r) {
          if (r.kind !== "i_room" || nl >= 24) { return; }
          if (typeof useDark === "function" && useDark(r)) { return; }     // its light switched off (39-inside.js)
          var rf = fl3.length ? floorAt(fl3, r.x, r.y) : null, stack = inside ? 1 : dress;
          lights.set([r.x + (rf ? rf.dx * stack : 0), r.y + (rf ? rf.dy * stack : 0),
                      (rf ? rf.z : 0) + (ceilOf(r) - 0.4) * FLOOR_PX, Math.max(r.w, r.h) * 0.62 + 30], nl * 4);
          nl++;
        });
        gl.uniform4fv(U["uRooms[0]"], lights);
        gl.uniform1f(U.uRoomN, nl);
      } else if (U.uRoomN) { gl.uniform1f(U.uRoomN, 0); }
      gl.uniform1f(U.uDress, dress);
      if (U.uTexOn) { gl.uniform1f(U.uTexOn, typeof texOn === "function" && !texOn() ? 0 : 1); }
      gl.uniform2fv(U.uMid, scenery.mid);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, G.shadowTex); gl.uniform1i(U.uShadow, 1);
      if (U.uLampShadow) {
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, lampOn ? G.lampTex : G.white); gl.uniform1i(U.uLampShadow, 2);
      }
      if (U.uLampMvp) { gl.uniformMatrix4fv(U.uLampMvp, false, lampMvp); }
      if (U.uLampOn) { gl.uniform1f(U.uLampOn, lampOn); }
      if (U.uRoomBox) { gl.uniform4fv(U.uRoomBox, roomBox); }
      if (U.uRoomZ) { gl.uniform2fv(U.uRoomZ, roomZ); }
      gl.activeTexture(gl.TEXTURE0); gl.uniform1i(U.uTex, 0);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 2);
      function draw(data, how, mode, key) {
        gl3Upload(G, data, key);
        gl3Bind(gl, P, GL3_STRIDE);
        gl.bindTexture(gl.TEXTURE_2D, how.tex || G.white);
        gl.uniform1f(U.uUseTex, how.tex ? 1 : 0);
        gl.uniform1f(U.uDecal, how.decal ? 1 : 0);
        gl.uniform1f(U.uRound, how.round ? 1 : 0);
        gl.uniform1f(U.uBill, how.bill ? 1 : 0);
        gl.uniform1f(U.uAlpha, how.alpha === undefined ? 1 : how.alpha);
        gl.uniform2fv(U.uFade, how.fade || [0, 0]);
        gl.uniform1f(U.uGlow, how.glow || 0);
        if (how.blend) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); } else { gl.disable(gl.BLEND); }
        gl.depthMask(!how.noDepthWrite);
        gl.drawArrays(mode, 0, data.length / GL3_STRIDE);
      }
      // the ground and what grows on it; from above, it thins out at the edge
      if (dress > 0.01 && !under) {
        draw(scenery.verts, { blend: !inside, alpha: dress,
                              fade: inside ? [0, 0] : [scenery.groundR * 0.72, scenery.groundR] }, gl.TRIANGLES);
      }
      // the house: solid, then pictures, then those standing
      batches.forEach(function (x) { if (!x.how.lines && !x.how.blend && !x.how.caster) { draw(x.data, x.how, gl.TRIANGLES, x.key); } });
      batches.forEach(function (x) { if (x.how.decal) { draw(x.data, x.how, gl.TRIANGLES, x.key); } });
      // the lines, on top of the faces they edge
      gl.disable(gl.POLYGON_OFFSET_FILL);
      batches.forEach(function (x) { if (x.how.lines) { draw(x.data, { blend: true, noDepthWrite: true }, gl.LINES, x.key); } });
      // and what can be seen through, last
      // (the windows lit from inside, after dark, looked at from out of doors)
      var lit = inside && V3.inRoom ? 0 : sky.night * dress * 0.85;
      batches.forEach(function (x) {
        if (x.how.blend && !x.how.decal) {
          draw(x.data, { blend: true, noDepthWrite: true, glow: x.key === "glass" ? lit : 0 }, gl.TRIANGLES, x.key);
        }
      });
      gl.depthMask(true);
      [0, 1, 2, 3, 4].forEach(function (i) { gl.disableVertexAttribArray(i); });
    } catch (e) {
      if (window.console && console.warn) { console.warn("3D view: drawing it the old way --", e && e.message); }
      V3.gl = false;
      return false;
    }
    // onto the view's canvas, under the names and the map
    V3.ctx.drawImage(G.canvas, 0, 0, V3.w, V3.h);
    return true;
  }

  // Shut, the GPU's memory goes back at once rather than when it is swept up.
  var v3CloseNoGl = v3Close;
  v3Close = function () {
    var G = V3 && V3.gl;
    if (G && G.gl) {
      var lose = G.gl.getExtension("WEBGL_lose_context");
      if (lose) { try { lose.loseContext(); } catch (e) { /* fine */ } }
    }
    return v3CloseNoGl.apply(this, arguments);
  };
