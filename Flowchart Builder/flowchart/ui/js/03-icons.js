// ---------------------------------------------------------------------------
//  03-icons.js -- the icons, drawn at any size, and where their words go
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // An icon is a shape like any other as far as the rest of the page is
  // concerned: a kind (i_doctor, i_sofa...), a box, some words.  shapeArt
  // (03-shapes.js) hands any kind it does not draw itself to iconArt here,
  // wordsAt and wordsNeed ask iconWordsAt and iconNeed, and measure
  // (10-hand.js) asks iconMeasure -- so everything that knows about shapes
  // (dragging, turning, arrows, colors, saving, undo) knows about these.
  //
  // Three sorts, by how they grow:
  //   figures  -- people, devices, vehicles -- keep their proportions and
  //               stand over their name, as the Person shape does;
  //   pieces   -- of a floor plan -- are as big as the thing is, fifty
  //               pixels to the metre, and stretch with their box;
  //   areas    -- a room, a container -- are drawn afresh for their size
  //               and hold other shapes: those may stand on them, and go
  //               with them when they are carried (37-board.js).
  var FLOOR_PX = 50;                     // pixels to a metre, on a floor plan
  var ICON_FIG = 48;                     // how tall a figure stands, unstretched
  var ICON_SET_OF = {};                  // kind -> the set it is offered in
  ICON_SETS.forEach(function (set) {
    set[1].forEach(function (kind) { if (!ICON_SET_OF[kind]) { ICON_SET_OF[kind] = set[0]; } });
  });

  function isIcon(kind) { return !!ICONS[kind]; }
  function isFigure(kind) { return !!(ICONS[kind] && ICONS[kind].fig); }
  function isArea(kind) { return !!(ICONS[kind] && ICONS[kind].area); }
  // A piece of a floor plan, or a room: free to stand on top of one
  // another, as a chair stands half under a table and a door in a wall.
  function isLoose(kind) { return !!(ICONS[kind] && !ICONS[kind].fig); }
  // What stands on the floor and takes up the room it stands in -- a sofa, a
  // table, a car, the stairs -- and so shares it with nothing else that
  // does: not on the paper (13-hand-apart.js), not walked through, and not
  // standing inside another in 3D (asked for, 2026-10-02: "make sure the 3d
  // models do not clip into one another").  What lies flat, hangs, stands
  // on something, or goes in a wall shares its spot as it would in a house.
  function isSolid(kind) {
    var icon = ICONS[kind];
    return !!icon && !icon.area && !icon.fig && !ON_TOP[kind] && !LIES_FLAT[kind] && !FROM_CEILING[kind] &&
           !ON_THE_WALL[kind] && !SNAP_IN_WALL[kind] && kind !== "i_wall" && kind !== "i_fence";
  }

  // ------------------------------------------------- reading the drawings --
  // Each part's path, read once into its commands and their numbers, so
  // drawing one is moving and stretching numbers and nothing more.  Only
  // the capital (absolute) commands are used in the art.
  var ICON_PART = /^([otkg])(\S*)\s+([\s\S]*)$/;
  var ICON_TAKES = { M: 2, L: 2, T: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, A: 7, Z: 0 };

  function iconSegs(d) {
    var bits = String(d).match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
    var segs = [], cmd = null, nums = [];
    function flush() {
      if (!cmd) { return; }
      var take = ICON_TAKES[cmd];
      if (!take) { segs.push([cmd]); return; }
      for (var i = 0; i + take <= nums.length; i += take) {
        // A move's extra pairs are lines, as the SVG rules have it.
        segs.push([i && cmd === "M" ? "L" : cmd].concat(nums.slice(i, i + take)));
      }
    }
    bits.forEach(function (bit) {
      if (/[A-Za-z]/.test(bit)) { flush(); cmd = bit.toUpperCase(); nums = []; }
      else { nums.push(parseFloat(bit)); }
    });
    flush();
    return segs;
  }

  function iconParts(list) {
    return list.map(function (one) {
      var got = ICON_PART.exec(one) || [null, "o", "", one];
      var how = got[2] || "", wide = parseFloat(how.replace(/[^\d.]/g, ""));
      return { cls: got[1], dash: how.indexOf("-") >= 0, odd: how.indexOf("e") >= 0,
               wide: isNaN(wide) ? 0 : wide, segs: iconSegs(got[3]) };
    });
  }

  function iconR(v) { return Math.round(v * 10) / 10; }

  // A path, stretched by sx across and sy down and moved to ox, oy.
  function iconPathAt(segs, sx, sy, ox, oy) {
    var out = [];
    segs.forEach(function (s) {
      var c = s[0];
      function X(v) { return iconR(ox + v * sx); }
      function Y(v) { return iconR(oy + v * sy); }
      switch (c) {
        case "Z": out.push("Z"); break;
        case "H": out.push("H" + X(s[1])); break;
        case "V": out.push("V" + Y(s[1])); break;
        case "A":
          out.push("A" + iconR(s[1] * Math.abs(sx)) + " " + iconR(s[2] * Math.abs(sy)) + " " + s[3] +
                   " " + s[4] + " " + s[5] + " " + X(s[6]) + " " + Y(s[7]));
          break;
        default: {
          var p = [];
          for (var i = 1; i < s.length; i += 2) { p.push(X(s[i]) + " " + Y(s[i + 1])); }
          out.push(c + p.join(" "));
        }
      }
    });
    return out.join("");
  }

  function iconMade(kind) {
    var icon = ICONS[kind];
    if (!icon.parts && typeof icon.art !== "function") { icon.parts = iconParts(icon.art); }
    return icon;
  }

  function saidSomething(words) {
    return !!(words && words.some(function (one) { return String(one).trim(); }));
  }

  // Where in its box an icon is drawn, and how much it is stretched.
  function iconFrame(kind, cx, cy, w, h, words, line) {
    var icon = ICONS[kind], l = cx - w / 2, t = cy - h / 2;
    var bw = icon.box[0], bh = icon.box[1];
    if (icon.area) { return { sx: 1, sy: 1, ox: l, oy: t }; }
    if (!icon.fig) { return { sx: w / bw, sy: h / bh, ox: l, oy: t }; }
    var named = saidSomething(words) ? nameRoom(words, line) : 0;
    var room = Math.max(8, h - named);
    var s = Math.min(w / bw, room / bh);
    return { sx: s, sy: s, ox: cx - bw * s / 2, oy: t + (room - bh * s) / 2 };
  }

  // The drawing, in the box w by h round cx, cy, its fill `fill` -- what
  // shapeArt returns for any other shape.
  function iconArt(kind, cx, cy, w, h, fill, words, line) {
    var icon = iconMade(kind), paint = fill || "#ffffff";
    var l = cx - w / 2, t = cy - h / 2;
    var at = iconFrame(kind, cx, cy, w, h, words, line);
    var parts = icon.parts || iconParts(icon.art(w, h));
    // A pane of clear glass over the whole box, as a words-only shape has,
    // so the space round a figure or inside a door's swing takes a click.
    var out = ['<rect class="ghost" x="' + iconR(l) + '" y="' + iconR(t) + '" width="' + iconR(w) +
               '" height="' + iconR(h) + '" fill="none" stroke="none" pointer-events="all"/>'];
    var heavier = Math.min(at.sx, at.sy);
    parts.forEach(function (p) {
      var d = iconPathAt(p.segs, at.sx, at.sy, at.ox, at.oy);
      var bits = p.cls === "t" ? ' class="trim" fill="none"'
               : p.cls === "k" ? ' class="inked" fill="#000000"'
               : p.cls === "g" ? ' class="gap" fill="' + (style.sheet || "#ffffff") + '" stroke="none"'
               : ' fill="' + paint + '"';
      if (p.wide) { bits += ' stroke-width="' + Math.round(Math.max(0.6, p.wide * heavier) * 100) / 100 + '"'; }
      if (p.dash) { bits += ' stroke-dasharray="5 4"'; }
      if (p.odd) { bits += ' fill-rule="evenodd"'; }
      out.push('<path d="' + d + '"' + bits + "/>");
    });
    // A room says how big it is under its name, the way a plan does -- and,
    // labeled and given no name, what it is by what is in it.
    var mine = iconNode && iconNode.kind === kind ? iconNode : null, said = saidSomething(words);
    var called = kind === "i_room" && mine && !said && planLabelsOn() ? roomLabel(mine) : null;
    if (called && w >= 70 && h >= 50) {
      out.push(labelArt(called, cx, cy - 4, mine.turn, "tag room-tag"));
    }
    if (kind === "i_room" && w >= 90 && h >= 70) {
      var below = said ? words.length * line / 2 + 13 : called ? 14 : 4;
      out.push('<text class="sized" x="' + iconR(cx) + '" y="' + iconR(cy + below) +
               '" text-anchor="middle" font-size="80%" opacity="0.6" stroke="none" fill="#000000">' +
               escaped(floorSays(w, h)) + "</text>");
      if (mine && planSizesOn() && w >= 120 && h >= 90) {
        out.push('<text class="sized" x="' + iconR(cx) + '" y="' + iconR(cy + below + 12) +
                 '" text-anchor="middle" font-size="68%" opacity="0.55" stroke="none" fill="#000000">' +
                 escaped(planDims(mine)) + "</text>");
      }
    }
    // Furniture and the rest of a plan named, so a plan reads without
    // knowing every drawing in it (asked for, 2026-10-01: "make sure that
    // things are labeled too and you can turn it off").
    if (mine && !said && !icon.fig && !icon.area && !NO_LABEL[kind] && planLabelsOn()) {
      out.push(labelArt(labelName(kind), cx, cy + (ON_TOP[kind] ? -10 : FROM_CEILING[kind] ? 11 : 0), mine.turn, "tag"));
      // its size under its name, upright as the name is -- where it fits
      if (planSizesOn() && !ON_TOP[kind] && !FROM_CEILING[kind] && Math.max(w, h) >= 40 && Math.min(w, h) >= 22) {
        var tr = (mine.turn || 0) * Math.PI / 180;
        out.push(labelArt(planDims(mine), cx + 9 * Math.sin(tr), cy + 9 * Math.cos(tr), mine.turn, "tag size-tag"));
      }
    }
    // A lot, on the paper, says what it comes to (not in the library).
    if (kind === "i_lot" && iconNode && iconNode.kind === "i_lot") { out.push(lotArt(iconNode, cx, cy, w, h)); }
    return out.join("");
  }

  // ---- labels ------------------------------------------------------------------
  // A name over a piece of a plan: upright however the piece is turned, on
  // a rim of the paper's color so it reads over the drawing under it.  The
  // Labels switch on the Style side (11-hand-icons.js) takes them all off.
  // Doors, windows and walls say what they are by being where they are.
  var NO_LABEL = { i_door: true, i_door2: true, i_slide: true, i_bifold: true, i_window: true, i_wall: true, i_garagedoor: true };

  function planLabelsOn() { return !(style && style.noLabels); }
  // Sizes written on a plan -- a room's length, width and ceiling under its
  // area, a piece's width, depth and height under its name (planDims,
  // 39-design.js): on unless switched off beside Labels.
  function planSizesOn() { return !(style && style.noSizes) && typeof planDims === "function"; }

  // A thing's name as a label: what it is, without how it is drawn --
  // "Car", not "Car (from above)".
  function labelName(kind) {
    var name = String(kindName(kind) || "");
    return name.replace(/\s*\([^)]*\)/g, "").trim() || name;
  }

  function labelArt(words, x, y, turn, cls) {
    var spin = turn ? ' transform="rotate(' + iconR(-turn) + " " + iconR(x) + " " + iconR(y) + ')"' : "";
    return '<text class="' + cls + '" x="' + iconR(x) + '" y="' + iconR(y) + '" dy="0.35em" text-anchor="middle" ' +
           'font-size="' + (cls.indexOf("room-tag") >= 0 ? "92%" : cls.indexOf("size-tag") >= 0 ? "55%" : "68%") + '" fill="#000000" ' +
           'stroke="' + (style.sheet || "#ffffff") + '" stroke-width="2.6" stroke-linejoin="round" ' +
           'paint-order="stroke"' + spin + ">" + escaped(words) + "</text>";
  }

  // How big a room is, in the units this language measures rooms in.
  function floorSays(w, h) {
    var m2 = (w / FLOOR_PX) * (h / FLOOR_PX);
    var feet = (TXT.fp_unit || "m") === "ft";
    var v = feet ? Math.round(m2 * 10.7639) : Math.round(m2 * 10) / 10, n;
    try {
      n = v.toLocaleString(typeof LANG === "string" ? LANG : "en",
                           { minimumFractionDigits: feet ? 0 : 1, maximumFractionDigits: feet ? 0 : 1 });
    } catch (e) { n = feet ? String(v) : v.toFixed(1); }
    return say("fp_area", { n: n });
  }

  // A length, in the units this language measures rooms in: feet in US
  // English, metres elsewhere (to a tenth).
  function feetHere() { return (TXT.fp_unit || "m") === "ft"; }
  function lengthSays(px) {
    var m = px / FLOOR_PX, v = feetHere() ? Math.round(m / 0.3048) : Math.round(m * 10) / 10;
    try { return v.toLocaleString(typeof LANG === "string" ? LANG : "en", { maximumFractionDigits: 1 }); }
    catch (e) { return String(v); }
  }
  function areaSays(px2) { return floorSays(px2 / FLOOR_PX, FLOOR_PX); }

  // ---- a lot ------------------------------------------------------------------
  // The land a house stands on (asked for, 2026-10-01: "input the amount
  // of space you have and it show the size of the place you can have and
  // yard space too").  Its size is its box; how far a house must keep from
  // its edges -- the setbacks, in metres -- is its own (`lot` on the node,
  // set in the panel, 11-hand-icons.js), the front being its foot, where
  // the street is.  Inside the setbacks is the room there is to build on,
  // drawn dashed on it; the house is the rooms on it at ground level, and
  // the yard is the rest.
  var LOT_SETBACK = { front: 6, side: 1.5, back: 4.5 };
  var LOT_SETBACK_FT = { front: 20 * 0.3048, side: 5 * 0.3048, back: 15 * 0.3048 };
  var iconNode = null;                   // the node an icon is being drawn for, on the paper

  function lotSetbacks(lot) {
    var own = (lot && lot.lot) || {};
    var plain = feetHere() ? LOT_SETBACK_FT : LOT_SETBACK;
    function one(k) { return own[k] >= 0 ? +own[k] : plain[k]; }
    return { front: one("front"), side: one("side"), back: one("back") };
  }

  function lotMeasure(lot) {
    var sb = lotSetbacks(lot), P = FLOOR_PX;
    var env = { l: -lot.w / 2 + sb.side * P, r: lot.w / 2 - sb.side * P,
                t: -lot.h / 2 + sb.back * P, b: lot.h / 2 - sb.front * P };
    env.w = Math.max(0, env.r - env.l); env.h = Math.max(0, env.b - env.t);
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var a = -(lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    function local(x, y) { var dx = x - lot.x, dy = y - lot.y; return [dx * c - dy * s, dx * s + dy * c]; }
    // the rooms on the ground: on the lot, not in a room of their own, and
    // on the ground floor where a house is drawn a floor at a time
    var rooms = hand.nodes.filter(function (n) {
      if (n.kind !== "i_room" || !insideArea(lot, n.x, n.y)) { return false; }
      var f = floors.length ? floorAt(floors, n.x, n.y) : null;
      if (f && f.level !== 0) { return false; }
      return !hand.nodes.some(function (m) {
        return m !== n && m.kind === "i_room" && m.w * m.h > n.w * n.h && insideArea(m, n.x, n.y);
      });
    });
    var house = 0, box = null, over = [];
    rooms.forEach(function (r) {
      house += r.w * r.h;
      var ra = (r.turn || 0) * Math.PI / 180, rc = Math.cos(ra), rs = Math.sin(ra);
      var pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (k) {
        return local(r.x + k[0] * r.w / 2 * rc - k[1] * r.h / 2 * rs, r.y + k[0] * r.w / 2 * rs + k[1] * r.h / 2 * rc);
      });
      var x0 = Math.min.apply(null, pts.map(function (p) { return p[0]; })), x1 = Math.max.apply(null, pts.map(function (p) { return p[0]; }));
      var y0 = Math.min.apply(null, pts.map(function (p) { return p[1]; })), y1 = Math.max.apply(null, pts.map(function (p) { return p[1]; }));
      box = box ? { l: Math.min(box.l, x0), r: Math.max(box.r, x1), t: Math.min(box.t, y0), b: Math.max(box.b, y1) }
                : { l: x0, r: x1, t: y0, b: y1 };
      [["side", env.l - x0], ["side", x1 - env.r], ["back", env.t - y0], ["front", y1 - env.b]].forEach(function (o) {
        if (o[1] > 2) { over.push({ room: r, side: o[0], by: o[1] }); }
      });
    });
    return { sb: sb, env: env, area: lot.w * lot.h, build: env.w * env.h, house: house,
             yard: Math.max(0, lot.w * lot.h - house), rooms: rooms, box: box, over: over };
  }

  // On the lot itself: the dashed line it can be built up to, and what it
  // all comes to along its foot.
  function lotArt(lot, cx, cy, w, h) {
    var m = lotMeasure(lot);
    var l = cx - w / 2, t = cy - h / 2, out = [];
    if (m.env.w > 4 && m.env.h > 4) {
      out.push('<rect class="trim" x="' + iconR(cx + m.env.l) + '" y="' + iconR(cy + m.env.t) + '" width="' + iconR(m.env.w) +
               '" height="' + iconR(m.env.h) + '" fill="none" stroke-dasharray="7 5" opacity="0.55"/>');
    }
    if (w > 220 && h > 120) {
      var said = say("lot_says", { w: lengthSays(w), d: lengthSays(h), unit: TXT.fp_unit || "m", area: areaSays(m.area) });
      if (m.rooms.length) {
        said += " \u00b7 " + say("lot_house", { area: areaSays(m.house) }) + " \u00b7 " + say("lot_yard", { area: areaSays(m.yard) });
      }
      var lines = [say("lot_build", { w: lengthSays(m.env.w), d: lengthSays(m.env.h), unit: TXT.fp_unit || "m",
                                      area: areaSays(m.build) }), said];
      lines.forEach(function (one, k) {
        out.push('<text class="sized" x="' + iconR(l + 10) + '" y="' + iconR(t + h - 10 - (lines.length - 1 - k) * 15) +
                 '" font-size="75%" opacity="0.6" stroke="none" fill="#000000">' + escaped(one) + "</text>");
      });
    }
    return out.join("");
  }

  // The middle of an icon's words: under a figure, at the top of a room,
  // in a container's head, and in the middle of anything else.
  function iconWordsAt(kind, cx, cy, w, h, words, line) {
    var icon = ICONS[kind], t = cy - h / 2;
    var lines = words && words.length ? words.length : 1;
    if (icon.fig) {
      var named = nameRoom(words && words.length ? words : [""], line);
      return { x: cx, y: t + (h - named) + named / 2 };
    }
    if (kind === "i_room") { return { x: cx, y: cy - 6 }; }   // in the middle, as plans name rooms
    if (kind === "i_zone") { return { x: cx, y: t + Math.min(24, h * 0.3) / 2 }; }
    if (kind === "i_floor") { return { x: cx, y: t + Math.min(26, h * 0.3) / 2 + 2 }; }
    if (kind === "i_lot") { return { x: cx, y: t + 18 }; }
    return { x: cx, y: cy };
  }

  // The least box that holds these words on this icon (wordsNeed).
  function iconNeed(kind, words, line, across) {
    var icon = ICONS[kind], wide = 0;
    words.forEach(function (one) { wide = Math.max(wide, across(one)); });
    if (icon.fig) {
      return { w: wide + 16, h: ICON_FIG + (saidSomething(words) ? nameRoom(words, line) : 0) };
    }
    if (icon.area) { return { w: wide + 24, h: words.length * line + 28 }; }
    return { w: wide + 8, h: words.length * line + 8 };
  }

  // Sized by hand, unless sized by hand: a figure as wide as its name and
  // as tall as itself and its name; a piece of a plan the size the thing
  // it is; a room or a container the size it was drawn, or wider for a
  // long name.
  function iconMeasure(node) {
    var icon = ICONS[node.kind], type = handType(node);
    var lines = shownLines(node, type), said = saidSomething(lines);
    var pen = measure.pen || (measure.pen = document.createElement("canvas").getContext("2d"));
    pen.font = type.font;
    var wide = 0;
    if (said) { lines.forEach(function (one) { wide = Math.max(wide, pen.measureText(one).width); }); }
    var w, h;
    if (icon.fig) {
      w = Math.max(60, wide + 16);
      h = ICON_FIG + (said ? nameRoom(lines, type.line) : 0);
    } else {
      w = Math.max(icon.box[0], icon.area && said ? wide + 24 : 0);
      h = icon.box[1];
    }
    // A figure's size comes from its words, and settles on the ruling the
    // way a box's does; a piece of a plan is the size the thing is, even a
    // picture six pixels deep, and is left that size.
    var STEP = HAND_GRID * 2, exact = !icon.fig && w === icon.box[0] && h === icon.box[1];
    node.w = exact ? w : Math.ceil(w / STEP) * STEP;
    node.h = exact ? h : Math.ceil(h / STEP) * STEP;
    node.own = false;
  }

  // The least size a corner may pull one to is half of this (06-chart.js),
  // so every icon is given its own, not a box's.
  function iconRooms(room) {
    Object.keys(ICONS).forEach(function (kind) {
      var icon = ICONS[kind];
      room[kind] = icon.fig ? [60, ICON_FIG] : [icon.box[0], icon.box[1]];
    });
  }

  // What a new one says: its name, under a figure or along a room's top --
  // a battery its voltage and a resistor its resistance, which is what a
  // circuit is worked out from (39-circuit.js) -- and nothing on the
  // pieces of a plan, which a plan does not label.
  function iconFirstWords(kind) {
    if (kind === "i_battery") { return "9 V"; }
    if (kind === "i_resistor") { return "100 Ω"; }
    if (kind === "i_room") { return ""; }   // named by what is put in it (38-walk.js), till it is named
    if (isFigure(kind) || isArea(kind)) { return kindName(kind); }
    return "";
  }

  // The order shapes are drawn in, floors first: rooms and containers --
  // the biggest under the rest -- then rugs, then the other pieces of a
  // plan, then everything else as it stands.  Drawn in the order they were
  // added, a room put down round furniture already there covered it.
  function floorFirst(list) {
    function rank(n) {
      var icon = ICONS[n.kind];
      return !icon ? 3 : icon.area ? 0 : LIES_FLAT[n.kind] || n.kind === "i_pool" ? 1 :
             icon.fig || ON_TOP[n.kind] || FROM_CEILING[n.kind] ? 3 : 2;
    }
    if (!list.some(function (n) { return rank(n) < 3; })) { return list; }
    return list.map(function (n, at) { return { n: n, at: at, r: rank(n) }; })
      .sort(function (p, q) {
        return p.r - q.r || (p.r === 0 ? q.n.w * q.n.h - p.n.w * p.n.h : 0) || p.at - q.at;
      })
      .map(function (one) { return one.n; });
  }

  // ------------------------------------------------- doors into walls --
  // A door put down near a room's wall goes into it: turned along it, its
  // threshold on the wall's outside line, and opening into the room it was
  // put down in (or out of it, put down outside).  A window or a sliding
  // door sits in the middle of the wall's thickness.  Only rooms standing
  // square are walls to snap to; a door nowhere near one is left be.
  var SNAP_IN_WALL = { i_door: "swing", i_door2: "swing", i_slide: "in", i_bifold: "in", i_window: "in", i_garagedoor: "in",
                       i_picture: "face", i_mirror: "face", i_shelf: "face", i_walltv: "face",
                       i_wallclock: "face", i_sconce: "face", i_cabinet: "face", i_hooks: "face",
                       i_radiator: "face", i_hood: "face", i_towelrail: "face", i_medicine: "face",
                       i_proscreen: "face", i_ac: "face", i_whiteboard: "face", i_dartboard: "face", i_evcharger: "face" };
  // Hung on a wall, up out of the way: walked under, not round (38-walk.js).
  var ON_THE_WALL = { i_picture: true, i_mirror: true, i_shelf: true, i_walltv: true,
                      i_wallclock: true, i_sconce: true, i_cabinet: true, i_hooks: true,
                      i_hood: true, i_towelrail: true, i_medicine: true, i_proscreen: true, i_ac: true,
                      i_whiteboard: true, i_dartboard: true, i_evcharger: true };
  // What stands on top of something else -- a lamp on a table, a kettle on
  // the counter -- and is raised to stand on it in 3D (38-view3d.js).
  var ON_TOP = { i_microwave: true, i_coffeemaker: true, i_toaster: true, i_kettle: true, i_fruitbowl: true,
                 i_tablelamp: true, i_desklamp: true, i_vase: true, i_candle: true, i_books: true,
                 i_frame: true, i_basket: true, i_monitor: true, i_succulent: true, i_herbs: true,
                 i_soundbar: true, i_console: true, i_recordplayer: true };
  // What hangs from the ceiling (drawn dashed, the way a plan shows what
  // is overhead), and what lies flat on the ground and is walked over.
  var FROM_CEILING = { i_hanging: true, i_pendant: true, i_chandelier: true, i_ceilingfan: true, i_projector: true };
  var LIES_FLAT = { i_rug: true, i_bathmat: true, i_driveway: true, i_path: true, i_deck: true, i_flowerbed: true, i_yogamat: true };
  // Ways from one floor of a house to another (38-walk.js).
  var BETWEEN_FLOORS = { i_stairs: true, i_spiral: true, i_elevator: true };

  // ---- how tall, and how high up ---------------------------------------------
  // (asked for, 2026-10-02: "a way to edit the heights of things")  A thing
  // is as tall as it was made (`n.tall`, metres), or else as such a thing
  // usually is (the tables in 38-view3d.js); something hung on a wall
  // starts `n.lift` metres up; something hung from the ceiling hangs
  // `n.drop` metres down from it.  Both ways of drawing in 3D read heights
  // through these, so a height typed in is the height drawn.
  function pieceHigh(n) {
    if (!n) { return 0; }
    if (n.tall > 0) { return +n.tall; }
    var k = n.kind;
    if (typeof V3_ON === "object" && ON_TOP[k] && V3_ON[k]) { return V3_ON[k]; }
    if (typeof V3_DROP === "object" && FROM_CEILING[k]) { return (V3_DROP[k] || [0.5, 0.25])[1]; }
    if (typeof V3_WALL === "object" && V3_WALL[k]) { return V3_WALL[k][1] - V3_WALL[k][0]; }
    if (typeof V3_HIGH === "object" && V3_HIGH[k] !== undefined) { return V3_HIGH[k]; }
    if (ICONS[k] && ICONS[k].fig) { return ICON_SET_OF[k] === "ic_people" ? 1.7 : 1.0; }
    if (k === "actor") { return 1.7; }
    return 0.8;
  }
  // Whether two things' boxes (upright, or a quarter round) cover any of
  // the same floor.
  function boxesOverlap(a, b) {
    var p = turned(a), q = turned(b);
    return Math.abs(a.x - b.x) * 2 < p.w + q.w - 1 && Math.abs(a.y - b.y) * 2 < p.h + q.h - 1;
  }
  // [from, to] metres up the wall, for what hangs on one
  function wallHang(n) {
    var base = (typeof V3_WALL === "object" && V3_WALL[n.kind]) || [1.2, 1.8];
    var lift = n.lift >= 0 && n.lift !== null && n.lift !== "" ? +n.lift : base[0];
    return [lift, lift + (n.tall > 0 ? +n.tall : base[1] - base[0])];
  }
  // [down from the ceiling to its foot, its own height], for what hangs from it
  function hangDrop(n) {
    var base = (typeof V3_DROP === "object" && V3_DROP[n.kind]) || [0.5, 0.25];
    var tall = n.tall > 0 ? +n.tall : base[1];
    return [Math.max(tall, n.drop > 0 ? +n.drop : base[0]), tall];
  }

  function roomWallOf(room) {
    return Math.max(1, Math.min(6, Math.min(room.w, room.h) * 0.06));
  }

  function snapToWalls(ids) {
    var moved = false;
    ids.forEach(function (id) {
      var n = nodeById(id);
      if (!n || !SNAP_IN_WALL[n.kind]) { return; }
      var swing = SNAP_IN_WALL[n.kind] === "swing", face = SNAP_IN_WALL[n.kind] === "face", best = null;
      hand.nodes.forEach(function (room) {
        if (room.kind !== "i_room" || ((room.turn || 0) % 90)) { return; }
        var q = turned(room), T = roomWallOf(room);
        var l = room.x - q.w / 2, r = room.x + q.w / 2, t = room.y - q.h / 2, b = room.y + q.h / 2;
        var half = n.w / 2, deep = swing ? n.h / 2 : 0;
        [["top", t, l, r], ["foot", b, l, r], ["left", l, t, b], ["right", r, t, b]].forEach(function (wall) {
          var across = wall[0] === "top" || wall[0] === "foot";
          var line = wall[1], at = across ? n.x : n.y, off = across ? n.y : n.x;
          if (at < wall[2] - 10 || at > wall[3] + 10) { return; }
          var into = wall[0] === "top" || wall[0] === "left" ? 1 : -1;   // the way into the room
          if (face) {
            // against the inside of the wall, its front to the room
            var inner = line + into * T, fd = Math.abs(off - (inner + into * n.h / 2));
            if (fd > n.h / 2 + 22 || (off - line) * into < 0 || (best && fd >= best.d)) { return; }
            var fa = Math.max(wall[2] + T + half, Math.min(wall[3] - T - half, at));
            best = across ? { d: fd, x: fa, y: inner + into * n.h / 2, turn: into > 0 ? 0 : 180 }
                          : { d: fd, y: fa, x: inner + into * n.h / 2, turn: into > 0 ? 270 : 90 };
            return;
          }
          var mid = swing ? line : line + into * T / 2;
          var d = Math.abs(off - mid);
          if (d > (swing ? n.h * 0.9 + 6 : 22) || (best && d >= best.d)) { return; }
          var along = Math.max(wall[2] + half, Math.min(wall[3] - half, at));
          var side = swing ? ((off - line) * into >= 0 ? into : -into) : into;
          var spot = { d: d };
          // turned so its swing (its own up) points the way it opens
          if (across) {
            spot.x = along; spot.y = mid + side * deep;
            spot.turn = swing ? (side > 0 ? 180 : 0) : 0;
          } else {
            spot.y = along; spot.x = mid + side * deep;
            spot.turn = swing ? (side > 0 ? 90 : 270) : 90;
          }
          best = spot;
        });
      });
      if (best) {
        n.x = Math.round(best.x * 2) / 2; n.y = Math.round(best.y * 2) / 2; n.turn = best.turn;
        moved = true;
      }
    });
    return moved;
  }

  // What shows through the gap a doorway makes in its wall: the floor of
  // the room the door opens into -- its own color, where it was given one
  // -- or the paper.
  function gapFill(g) {
    var paper = style.sheet || "#ffffff";
    if (!byHand || !g || !g.dataset) { return paper; }
    var door = nodeById(+String(g.dataset.i || "").replace(/^h/, ""));
    if (!door) { return paper; }
    var room = hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(r, door.x, door.y); })
      .sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
    if (!room) { return paper; }
    var mine = style.nodes["h" + room.id] || {};
    return mine.fill || kindColors("i_room").fill || paper;
  }

  // Whether the point x, y is inside an area's box, turned as it is turned.
  function insideArea(area, x, y, inset) {
    var a = -(area.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var dx = x - area.x, dy = y - area.y;
    var ux = dx * c - dy * s, uy = dx * s + dy * c, pad = inset || 0;
    return Math.abs(ux) <= area.w / 2 - pad && Math.abs(uy) <= area.h / 2 - pad;
  }

  // What stands in a room or a container: every shape whose middle is
  // inside it, other than an area as big as it or bigger (the house a
  // room is in is not in the room).  Carried with it, and walked through
  // with it (38-walk.js).
  function heldIn(area) {
    var big = area.w * area.h;
    return hand.nodes.filter(function (n) {
      if (n === area || (isArea(n.kind) && n.w * n.h >= big)) { return false; }
      return insideArea(area, n.x, n.y);
    }).map(function (n) { return n.id; });
  }

  // An icon on its own, the size of a tile in the library, in the colors
  // its kind wears (kindColors, 02-paint.js) -- or plain, with no palette.
  function iconTile(kind, size) {
    var icon = ICONS[kind], k = kindColors(kind);
    var fill = k.fill || style.sheet || "#ffffff", line = k.line || style.ink || "#10151b";
    var w = size, h = size;
    if (!icon.fig) {                     // a plan piece keeps its own shape
      var s = Math.min((size - 4) / icon.box[0], (size - 4) / icon.box[1]);
      w = icon.box[0] * s; h = icon.box[1] * s;
    }
    var art = iconArt(kind, size / 2, size / 2, w, h, fill)
      .replace(/class="inked" fill="#000000"/g, 'class="inked" fill="' + line + '"')
      .replace(/<text[\s\S]*?<\/text>/g, "");
    return '<svg class="keymark icon-tile" data-kind="' + kind + '" width="' + size + '" height="' + size +
           '" viewBox="0 0 ' + size + " " + size + '" stroke="' + line + '" stroke-width="1.2" fill="none" ' +
           'stroke-linecap="round" stroke-linejoin="round">' + art + "</svg>";
  }
