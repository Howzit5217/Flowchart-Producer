// ---------------------------------------------------------------------------
//  03-icon-art.js -- every icon, drawn: people at work, a home from above,
//  computers, circuits, travel, space and everyday things
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ============================================================ the icons ==
  // draw.io offers a few thousand pictures beside its shapes, in sixty-odd
  // libraries.  The ones a class or a household reaches for are here, drawn
  // in the studio's own line: an outline and a fill, like every other
  // shape, so a palette paints them the way it paints a box, and black on
  // white is what they are with no palette at all (asked for, 2026-10-01:
  // "just the black and white ones").
  //
  // Each icon is a list of parts, each part a path written in its own box.
  // The letter in front says how the part is painted (paint, 02-paint.js):
  //
  //   o   an outline with the shape's fill inside it -- most of everything
  //   t   a line only, in the outline's color: folds, stitching, details
  //   k   filled with the outline's color, as ink is: hair, a tie, a wall
  //   g   the paper's own color, with no outline: the gap a doorway makes
  //       in the wall it stands in
  //
  // and after it, optionally, "-" for a dashed line, "e" for a part with
  // a hole cut in it (filled even-odd), and a number for a heavier line,
  // which grows and shrinks with the icon (the plain line stays the
  // chart's own weight at any size, as every other shape's does).
  //
  // People, devices and the like are drawn in a box 48 square and keep
  // their proportions, standing over their name the way the Person shape
  // does.  The pieces of a floor plan are drawn the size they are -- fifty
  // pixels to the metre (FLOOR_PX, 03-icons.js) -- and stretch with their
  // box: a sofa pulled longer is a longer sofa.  A room and a container are
  // drawn afresh for their size, so a wall stays as thick on a big room as
  // on a small one.
  var ICONS = (function () {
    var made = {};
    function n2(v) { return Math.round(v * 100) / 100; }
    // A circle, an ellipse and a box, as path words, so that every part is
    // a path and is stretched and moved the one way.
    function C(cx, cy, r) { return E(cx, cy, r, r); }
    function E(cx, cy, rx, ry) {
      return "M" + n2(cx - rx) + " " + n2(cy) + " A" + n2(rx) + " " + n2(ry) + " 0 1 0 " +
             n2(cx + rx) + " " + n2(cy) + " A" + n2(rx) + " " + n2(ry) + " 0 1 0 " +
             n2(cx - rx) + " " + n2(cy) + " Z";
    }
    function R(x, y, w, h, r) {
      if (!r) { return "M" + n2(x) + " " + n2(y) + " H" + n2(x + w) + " V" + n2(y + h) + " H" + n2(x) + " Z"; }
      r = Math.min(r, w / 2, h / 2);
      return "M" + n2(x + r) + " " + n2(y) + " H" + n2(x + w - r) +
             " A" + n2(r) + " " + n2(r) + " 0 0 1 " + n2(x + w) + " " + n2(y + r) +
             " V" + n2(y + h - r) + " A" + n2(r) + " " + n2(r) + " 0 0 1 " + n2(x + w - r) + " " + n2(y + h) +
             " H" + n2(x + r) + " A" + n2(r) + " " + n2(r) + " 0 0 1 " + n2(x) + " " + n2(y + h - r) +
             " V" + n2(y + r) + " A" + n2(r) + " " + n2(r) + " 0 0 1 " + n2(x + r) + " " + n2(y) + " Z";
    }
    // Points round a middle: a star (every other point drawn in), and a
    // gear (teeth with flat tops).
    function STAR(cx, cy, R1, r1, n) {
      var d = "";
      for (var i = 0; i < n * 2; i++) {
        var a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r1 : R1;
        d += (i ? " L" : "M") + n2(cx + rr * Math.cos(a)) + " " + n2(cy + rr * Math.sin(a));
      }
      return d + " Z";
    }
    function GEAR(cx, cy, R1, r1, n) {
      var d = "", step = Math.PI * 2 / n;
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + i * step;
        [[r1, -0.5], [R1, -0.28], [R1, 0.28], [r1, 0.5]].forEach(function (p, k) {
          var at = a + p[1] * step;
          d += (i || k ? " L" : "M") + n2(cx + p[0] * Math.cos(at)) + " " + n2(cy + p[0] * Math.sin(at));
        });
      }
      return d + " Z";
    }

    // Somebody, from the chest up: their head, and their shoulders.  What
    // they do for a living goes over the top -- a hat, a collar, the thing
    // they hold -- in `over`; long hair goes behind them, in `behind`.
    var HEAD = C(24, 14, 7);
    var BODY = "M9 47 V39 C9 31 15 27 24 27 C33 27 39 31 39 39 V47 Z";
    function person(over, behind) {
      return (behind || []).concat(["o " + BODY, "o " + HEAD], over || []);
    }
    var HAIR = "k M17.1 12.6 C17.4 6.2 30.6 6.2 30.9 12.6 C28.2 10.4 19.8 10.4 17.1 12.6 Z";
    var COLLAR = "t M20 27.6 L24 32 L28 27.6";
    var LAPELS = "t M19.5 27.8 L23 37 M28.5 27.8 L25 37";
    var COAT = "t M24 32 V47 M19.5 27.8 L22.5 36.5 L24 32 L25.5 36.5 L28.5 27.8";
    var TIE = "k M23 29.2 H25 L25.6 31 L24.8 40 L24 41.4 L23.2 40 L22.4 31 Z";
    var CAP = "o M17 11.6 C17 5.4 31 5.4 31 11.6 Z";
    var VISOR = "o M24 10.4 C29 10.2 35.5 10.6 35.5 12.3 C31 12.8 27 12.4 23 12 Z";
    var HARDHAT = ["o M16.4 12 C16.4 4.2 31.6 4.2 31.6 12 Z", "o M14.4 11.8 H33.6 V13.6 H14.4 Z",
                   "t M24 4.6 V9"];
    var PEAK_CAP = ["o M16.4 10 C16.4 3.6 31.6 3.6 31.6 10 Z",
                    "k M16 10 H32 C31 12.1 27 12.6 24 12.6 C21 12.6 17 12.1 16 10 Z"];
    var GLASSES = "t M18.2 14 A2.6 2.6 0 1 0 23.4 14 A2.6 2.6 0 1 0 18.2 14 Z M24.6 14 A2.6 2.6 0 1 0 29.8 14 A2.6 2.6 0 1 0 24.6 14 Z M23.4 14 H24.6";
    var MASK = "o M18 15.6 H30 V18.8 C30 21 27.4 22.6 24 22.6 C20.6 22.6 18 21 18 18.8 Z";
    var CROSS = function (x, y, s) {             // a small plus, filled
      var a = s / 3;
      return "k M" + n2(x - a / 2) + " " + n2(y - s / 2) + " H" + n2(x + a / 2) + " V" + n2(y - a / 2) +
             " H" + n2(x + s / 2) + " V" + n2(y + a / 2) + " H" + n2(x + a / 2) + " V" + n2(y + s / 2) +
             " H" + n2(x - a / 2) + " V" + n2(y + a / 2) + " H" + n2(x - s / 2) + " V" + n2(y - a / 2) +
             " H" + n2(x - a / 2) + " Z";
    };

    function figure(kind, art) { made[kind] = { box: [48, 48], fig: true, art: art }; }
    function plan(kind, w, h, art) { made[kind] = { box: [w, h], art: art }; }
    function area(kind, w, h, art) { made[kind] = { box: [w, h], area: true, art: art }; }

    // ------------------------------------------------------ people at work --
    figure("i_person", person());
    figure("i_man", person([HAIR, COLLAR]));
    figure("i_woman", person([
      "k M17.3 12.4 C17.8 6.6 30.2 6.6 30.7 12.4 C27.4 9.6 20.6 9.6 17.3 12.4 Z",
      "t M20.5 27.6 C21.5 30.5 26.5 30.5 27.5 27.6"
    ], ["k M15.8 15 C15 4.6 33 4.6 32.2 15 L33.2 25.4 C30.4 26.4 27.6 25.6 26.6 23 H21.4 C20.4 25.6 17.6 26.4 14.8 25.4 Z"]));
    figure("i_child", ["o M14 47 V41 C14 34.6 18 31 24 31 C30 31 34 34.6 34 41 V47 Z", "o " + C(24, 19.5, 6.5),
                       "k M18.6 17.6 C18.8 12 29.2 12 29.4 17.6 C27 15.8 21 15.8 18.6 17.6 Z",
                       "t M24 13 C23 10.5 25.5 9.6 26.5 11"]);
    figure("i_elder", person([
      "k M17.1 14 C16.6 9.6 18 8.6 19.2 10.2 V14 Z M30.9 14 C31.4 9.6 30 8.6 28.8 10.2 V14 Z",
      GLASSES, COLLAR, "t2.2 M40.5 31 V47", "t2.2 M40.5 31 C40.5 27.6 44.4 27.6 44.4 30.6"]));
    figure("i_team", ["o M23 45 V37 C23 30 26.8 25.6 32.5 25.6 C38.2 25.6 42.5 30 42.5 37 V45 Z",
                      "o " + C(32.5, 13.4, 5.6),
                      "o M6 47 V40.4 C6 33.4 11 29.4 18.5 29.4 C26 29.4 31 33.4 31 40.4 V47 Z",
                      "o " + C(18.5, 17.6, 6.4),
                      "k M12.4 16.6 C12.6 11 24.4 11 24.6 16.6 C22.2 14.6 14.8 14.6 12.4 16.6 Z"]);
    figure("i_doctor", person([HAIR, COAT,
      "t M17.6 29 C14.6 35.6 16.6 41 21 41 C25.4 41 27.6 37.6 27.2 33.4",
      "k " + C(27.2, 32.6, 1.4), "t M30 37 H35 V41 H30 Z", "t M31.4 37 V34.4"]));
    figure("i_nurse", person([
      "o M17 11 L18.4 4.6 H29.6 L31 11 Z", CROSS(24, 7.8, 4.4),
      "t M20.4 27.6 L24 32.6 L27.6 27.6", "t M33 33 H35 M34 32 V34"]));
    figure("i_surgeon", person([
      "o M16.8 12.6 C16.8 4.8 31.2 4.8 31.2 12.6 Z", "t M18 9.6 H30", MASK,
      "t M18 16.4 L16.6 14.2 M30 16.4 L31.4 14.2", "t M19.4 28 C21.4 31.4 26.6 31.4 28.6 28"]));
    figure("i_dentist", person([HAIR, MASK, "t M18 16.4 L16.6 14.2 M30 16.4 L31.4 14.2", COAT,
      "o M33.6 30.6 C33.6 27.8 35.8 27.2 37.6 28.4 C39.4 27.2 41.6 27.8 41.6 30.6 C41.6 33.4 40.6 34.6 40.1 37.6 C39.8 39.2 38.4 39.2 38.2 37.6 L37.6 35.4 L37 37.6 C36.8 39.2 35.4 39.2 35.1 37.6 C34.6 34.6 33.6 33.4 33.6 30.6 Z"]));
    figure("i_pharmacist", person([HAIR, COAT,
      "o " + R(32.4, 31.6, 10, 13, 1.6), "o " + R(31.8, 28.4, 11.2, 3.6, 1), "t M34.6 35.6 H40.2 M34.6 38.6 H40.2",
      CROSS(37.4, 41.4, 3.4)]));
    figure("i_paramedic", person([CAP, VISOR, "t M10.4 39 H37.6", "t M24 27 V47",
      CROSS(17, 33.6, 6)]));
    figure("i_patient", person([
      "o " + R(16.6, 8.6, 14.8, 4, 1.6), "t M20 10.6 H22 M21 9.6 V11.6",
      "t M14 30 L30 47", "o M14.6 36.4 L25.4 44.6 L23.4 47 L12.8 39 Z"]));
    var TOQUE = ["o M17.6 10 C14.2 9 13.6 3.6 18 3.6 C19 0.6 29 0.6 30 3.6 C34.4 3.6 33.8 9 30.4 10 Z",
                 "o " + R(17.6, 8.4, 12.8, 3.4, 0.6)];
    figure("i_chef", person(TOQUE.concat(["t M20 27.6 L24 30.6 L28 27.6",
      "k " + C(20.6, 34, 0.95), "k " + C(27.4, 34, 0.95), "k " + C(20.6, 39, 0.95), "k " + C(27.4, 39, 0.95)])));
    figure("i_baker", person(["o M17.6 10.2 C15 9.8 15 5.4 18.4 5.4 C19.8 2.8 28.2 2.8 29.6 5.4 C33 5.4 33 9.8 30.4 10.2 Z",
      "o " + R(17.6, 8.8, 12.8, 3, 0.6), "t M19.4 28 V47 M28.6 28 V47 M19.4 36 H28.6",
      "o M30.6 38 C30.6 33.6 43.6 33.6 43.6 38 C43.6 40.6 42.4 41.4 37.1 41.4 C31.8 41.4 30.6 40.6 30.6 38 Z",
      "t M33.6 35.6 L35 37.8 M36.6 35 L38 37.2 M39.6 35.4 L40.8 37.6"]));
    figure("i_waiter", person([HAIR, LAPELS,
      "k M20 29.2 L24 30.8 L28 29.2 V32.8 L24 31.2 L20 32.8 Z",
      "t M32.6 25 H45.4", "o M34.4 25 C34.4 19.6 43.6 19.6 43.6 25 Z", "k " + C(39, 19.4, 0.95)]));
    figure("i_farmer", person([
      "o " + E(24, 10.2, 12.4, 2.6), "o M18 10 C18 3.6 30 3.6 30 10 Z", "t M18.3 8.2 H29.7",
      "t M18 29 V36 M30 29 V36", "o " + R(18, 35, 12, 12, 0.5),
      "t M41.6 47 V25 M37.8 18.6 V25 H45.4 V18.6 M41.6 18.6 V25"]));
    figure("i_gardener", person([
      "o " + E(24, 10.6, 11.6, 2.8), "o M18.4 10.4 C18.4 4.6 29.6 4.6 29.6 10.4 Z",
      "t M18 29 V36 M30 29 V36", "o " + R(18, 35, 12, 12, 0.5),
      "o M32.4 35 H41.4 V45 H32.4 Z", "t M41.4 37.4 L46.2 32.6", "t M33.8 35 C33.8 31 40 31 40 35"]));
    figure("i_builder", person(HARDHAT.concat(["t M24 27 V47 M17 28.6 V47 M31 28.6 V47", "t M9.6 38.6 H38.4"])));
    figure("i_engineer", person(HARDHAT.concat([COLLAR, TIE,
      "o " + R(31, 30.6, 14.6, 5.4, 2.7), "t M34.4 30.6 V36", "t M41.6 30.6 V36"])));
    figure("i_electrician", person([CAP, VISOR, COLLAR,
      "k M24.4 31 L19.6 38.6 H23.4 L21.4 45.4 L28.6 36.4 H24.6 L27 31 Z"]));
    figure("i_plumber", person([CAP, VISOR, "t M18 28.6 V36 M30 28.6 V36", "o " + R(18, 35, 12, 12, 0.5),
      "o " + R(38.2, 30, 3.4, 17, 1.2), "o M36.4 24.4 H44.4 V28.4 H41.8 V30.4 H39.2 V28.4 H36.4 Z"]));
    figure("i_mechanic", person([CAP, VISOR, "t M18 28.6 V36 M30 28.6 V36", "o " + R(18, 35, 12, 12, 0.5),
      "o " + GEAR(24, 41, 4, 2.8, 8), "t3 M33 46 L41.6 32.6",
      "o M39.6 28.6 C39.2 26 42.2 24.6 44.6 25.6 L42.6 28 L43.8 29.8 L46.4 28.2 C47 30.8 44 32.8 41.4 31.8 Z"]));
    figure("i_carpenter", person([HAIR, COLLAR, "t M10 41.6 H38", "o " + R(12.6, 41.6, 6.4, 5.4, 1),
      "t2.6 M36.6 46.6 L40.4 31.6", "o M35 27.6 L44.6 30.4 L43.8 33.2 L34.2 30.4 Z"]));
    figure("i_painter", person([CAP, VISOR, "t M18 28.6 V36 M30 28.6 V36", "o " + R(18, 35, 12, 12, 0.5),
      "o " + R(32.4, 21.4, 11.6, 5.2, 1.6), "t M44 24 H45.6 V29 H38.6 V33.6", "t2.2 M38.6 33.6 V46"]));
    figure("i_cleaner", person([CAP, "t M18 28.6 V36 M30 28.6 V36", "o " + R(18, 35, 12, 12, 0.5),
      "t2 M40.4 19 V40.6", "o M35.2 40.6 H45.6 L47 47 H33.8 Z", "t M36.6 43.6 V47 M39 43.6 V47 M41.6 43.6 V47 M44.2 43.6 V47"]));
    figure("i_miner", person(HARDHAT.concat(["k " + C(24, 8, 2.2),
      "t M24 4.2 V1.2 M20.2 5.4 L18.4 3 M27.8 5.4 L29.6 3", COLLAR,
      "t2.2 M33.6 46 L42 28.6", "o M35.4 26.2 C39 23.2 44.4 24 46.6 27.2 C43.6 26.6 41.4 27.6 39.2 29.6 Z"])));
    figure("i_artist", person([
      "o M16.4 10.4 C15 5.2 22 3.4 29.2 5 C33.4 6 33.8 9.6 31.4 10.8 C27.6 9.8 20.4 9.8 16.4 10.4 Z",
      "k " + C(25.8, 3.6, 1), COLLAR,
      "o M29.6 38.6 C29.6 31.6 40 29.6 44 33.6 C46 35.8 44.6 37.8 42.2 37.4 C40.2 37.2 39.6 38.4 40.6 40.4 C41.6 42.8 38 44.4 34.6 43.4 C31.6 42.4 29.6 41 29.6 38.6 Z",
      "k " + C(33.6, 35.6, 1.1), "k " + C(37.6, 33.8, 1.1), "k " + C(41.4, 34.8, 1.1), "k " + C(34, 40, 1.1)]));
    figure("i_musician", person([HAIR, COLLAR,
      "o M12.6 40.4 C9.6 36.4 12.6 31.2 16.8 33.2 C18.8 30.2 24 31.2 23.4 35.2 C27.2 37.2 26.4 42.8 22.4 43.2 C20.4 46.8 13.8 46.4 12.6 40.4 Z",
      "k " + C(18.4, 38.6, 1.7), "t2.4 M21.4 35.4 L36.4 21.4", "o M35.2 19 L39.6 16.6 L41.4 19.6 L37.4 22.6 Z"]));
    figure("i_photographer", person([HAIR, "t M14.4 29.4 C16 25 32 25 33.6 29.4",
      "o " + R(12.4, 30.6, 23.2, 14.6, 2.2), "o " + R(15, 28.2, 5.6, 2.8, 0.6),
      "o " + C(24, 37.8, 4.8), "t " + C(24, 37.8, 2.4), "k " + C(32, 33.6, 0.9)]));
    figure("i_reporter", person([HAIR, COLLAR,
      "o M35 21.8 C35 18.8 41 18.8 41 21.8 V25.4 C41 28.4 35 28.4 35 25.4 Z", "t M35 23.2 H41",
      "o " + R(35.4, 29.2, 5.2, 3.4, 0.5), "t2.2 M38 32.6 V44"]));
    figure("i_teacher", person([HAIR, GLASSES, COLLAR,
      "o " + R(30.4, 32.4, 11.6, 13, 1), "t M36.2 32.4 V45.4", "t M32.6 36 H34.6 M37.8 36 H39.8"]));
    figure("i_student", person([HAIR, COLLAR, "t M17 28.6 V40 M31 28.6 V40",
      "o " + R(30.8, 34.6, 11, 12.4, 1.2), "t M33 38.6 H40.6"]));
    figure("i_graduate", person([
      "k M11.6 8.8 L24 3.6 L36.4 8.8 L24 14 Z", "o M18.4 10.8 V13 C21.4 15 26.6 15 29.6 13 V10.8 L24 13.2 Z",
      "t M34 9.8 V16.4", "k " + C(34, 17.2, 1.1), "t M19.4 28 L19.4 47 M28.6 28 L28.6 47"]));
    figure("i_librarian", person([HAIR, GLASSES, COLLAR,
      "o " + R(30.6, 40.6, 13.4, 4.4, 0.6), "o " + R(31.6, 36.2, 11.4, 4.4, 0.6), "o " + R(30.8, 31.8, 12.4, 4.4, 0.6),
      "t M33.4 40.6 V45 M34.4 36.2 V40.6 M41 31.8 V36.2"]));
    figure("i_scientist", person([HAIR, "o " + R(16.6, 11, 14.8, 5.2, 2.4), "t M24 11 V16.2", COAT,
      "o M34.6 27 H39.6 V31.6 L44.4 41 C45 42.6 44 44 42.4 44 H31.8 C30.2 44 29.2 42.6 29.8 41 L34.6 31.6 Z",
      "t M31.6 38.4 H42.6", "k " + C(35.4, 41, 1.1), "k " + C(39.4, 40.4, 0.8)]));
    figure("i_programmer", person([HAIR, "t M20.4 27.6 C21.4 30 26.6 30 27.6 27.6",
      "o " + R(12.4, 32.4, 23.2, 14.6, 1.6), "o " + C(24, 39.4, 2), "t M8 47 H40"]));
    figure("i_office", person([HAIR, LAPELS, TIE]));
    figure("i_manager", person([HAIR, LAPELS, TIE,
      "o " + R(31.8, 30, 11.6, 14.4, 1.2), "o " + R(34.6, 28.6, 6, 2.8, 0.8),
      "t M34 34.6 H41.2 M34 37.6 H41.2 M34 40.6 H38.6"]));
    figure("i_accountant", person([HAIR, GLASSES, LAPELS, TIE,
      "o " + R(31.6, 29, 11.6, 16, 1.2), "o " + R(33.6, 31, 7.6, 3.6, 0.5),
      "k " + C(34.8, 37.6, 0.85), "k " + C(37.4, 37.6, 0.85), "k " + C(40, 37.6, 0.85),
      "k " + C(34.8, 40.6, 0.85), "k " + C(37.4, 40.6, 0.85), "k " + C(40, 40.6, 0.85)]));
    var HEADSET = ["t2 M16.2 14 C16.2 4.4 31.8 4.4 31.8 14", "o " + R(14.4, 11.6, 3.6, 5.6, 1.6),
                   "o " + R(30, 11.6, 3.6, 5.6, 1.6), "t M16 17 C16 20.4 18.8 21.8 21.8 21.2", "k " + C(22.2, 21.1, 1.1)];
    figure("i_receptionist", person(HEADSET.concat([COLLAR,
      "o M32.6 41 C32.6 35.4 43.4 35.4 43.4 41 Z", "t M31.2 41.4 H44.8", "k " + C(38, 34.4, 1.1)])));
    figure("i_agent", person(HEADSET.concat([COLLAR,
      "o " + R(11.6, 35, 24.8, 12, 1.4), "t M16 39 H32 M16 42.6 H26"])));
    figure("i_cashier", person([HAIR, COLLAR,
      "o " + R(11, 37, 26, 10, 1), "o " + R(27, 31, 9, 6, 0.8), "t M29.4 34 H33.6",
      "k " + C(15.4, 41, 0.85), "k " + C(19, 41, 0.85), "k " + C(22.6, 41, 0.85),
      "k " + C(15.4, 44, 0.85), "k " + C(19, 44, 0.85), "k " + C(22.6, 44, 0.85)]));
    figure("i_customer", person([HAIR, COLLAR,
      "o M30.4 34.4 H43.6 L45 47 H29 Z", "t M33.4 34.4 C33.4 29.6 40.6 29.6 40.6 34.4"]));
    figure("i_police", person(PEAK_CAP.concat(["o " + STAR(24, 6.6, 2.2, 1, 5),
      LAPELS, TIE, "o M28.4 32 H33.6 V35 C33.6 37.2 31 38.6 31 38.6 C31 38.6 28.4 37.2 28.4 35 Z"])));
    figure("i_firefighter", person([
      "o M15.6 12.2 C15.6 3.6 32.4 3.6 32.4 12.2 Z",
      "o M13 12 H35 C35 14.2 33 14.6 31 14 H17 C15 14.6 13 14.2 13 12 Z",
      "o " + R(21.2, 5.4, 5.6, 5.4, 1), "t M24 3.8 V5.4",
      "t M10 37 H38 M10 41 H38", "t M24 27 V47"]));
    figure("i_soldier", person([
      "o M16 13 C15.4 3.8 32.6 3.8 32 13 Z", "t M14.8 13 H33.2", "t M17.4 13.2 L19.4 19.6 M30.6 13.2 L28.6 19.6",
      "k " + C(20, 8.6, 1.2), "k " + C(27.4, 9.4, 1), COLLAR,
      "t M12.6 33.4 L15.2 35.4 L17.8 33.4 M12.6 36.4 L15.2 38.4 L17.8 36.4"]));
    figure("i_guard", person([CAP, VISOR, LAPELS,
      "o M28.4 32 H33.6 V35 C33.6 37.2 31 38.6 31 38.6 C31 38.6 28.4 37.2 28.4 35 Z",
      "o " + R(36, 32, 6, 11, 1), "t M38 32 V26.4", "t M37.6 35.4 H40.4"]));
    figure("i_lawyer", person([HAIR, LAPELS, TIE,
      "t M38.6 25.6 V44.6 M34.2 44.6 H43 M32 28.4 H45.2",
      "t M32 28.4 L29.8 33.4 M32 28.4 L34.2 33.4 M45.2 28.4 L43 33.4 M45.2 28.4 L47.4 33.4",
      "o M29.6 33.4 C29.6 36.6 34.4 36.6 34.4 33.4 Z", "o M42.8 33.4 C42.8 36.6 47.6 36.6 47.6 33.4 Z"]));
    figure("i_judge", ["k " + BODY, "o " + HEAD,
      "k M16.6 13.2 C16.2 5.4 31.8 5.4 31.4 13.2 L32.6 20.6 C31.2 21.6 29.6 21 29.2 19.4 V14 C27 11.4 21 11.4 18.8 14 V19.4 C18.4 21 16.8 21.6 15.4 20.6 Z",
      "o M21 27.6 H27 L25.4 33.4 H22.6 Z",
      "o M33.2 25.4 L42.6 21.2 L44.4 25.2 L35 29.4 Z", "t2.2 M38.8 27.4 L43.6 38"]);
    figure("i_pilot", person(PEAK_CAP.concat([LAPELS, TIE,
      "t M19 35 C21 33.6 22.6 33.6 24 35 C25.4 33.6 27 33.6 29 35", "k " + C(24, 35, 1),
      "t M11 30.4 L16 28.6 M37 30.4 L32 28.6"])));
    figure("i_astronaut", ["o M8 47 V39 C8 30.4 14.6 26.4 24 26.4 C33.4 26.4 40 30.4 40 39 V47 Z",
      "o " + C(24, 15, 10.6),
      "k M16.8 13.6 C16.8 8.4 31.2 8.4 31.2 13.6 V16 C31.2 20 16.8 20 16.8 16 Z",
      "t M27 11 C28.4 11.4 29.2 12.2 29.4 13.4",
      "o " + R(18.6, 33.4, 10.8, 7.6, 1.2), "k " + C(21.6, 37.2, 1), "k " + C(26.4, 37.2, 1)]);
    figure("i_driver", person([CAP, VISOR, COLLAR,
      "o " + C(24, 40.4, 8.4), "o " + C(24, 40.4, 5.6), "t M18.4 40.4 H29.6 M24 40.4 V46"]));
    figure("i_delivery", person([CAP, VISOR, COLLAR,
      "o " + R(29.6, 31, 14.4, 12.4, 1), "t M36.8 31 V43.4", "t M29.6 35 H44"]));
    figure("i_postman", person([CAP, VISOR, "t M13 29.4 L31 46",
      "o " + R(30.6, 32.4, 13.4, 9.4, 1), "t M30.6 32.6 L37.3 37.6 L44 32.6"]));
    figure("i_hairdresser", person([HAIR, COLLAR,
      "t M33.2 27.6 L43.6 39.6 M43.6 27.6 L33.2 39.6", "o " + C(32.2, 41.8, 2.4), "o " + C(44.6, 41.8, 2.4)]));
    figure("i_coach", person([CAP, VISOR, "t M19 28 L24 37 L29 28",
      "o M23 37 H28.4 V40.2 H23.6 C21.8 40.2 21.4 37 23 37 Z", "t M14 36 H16 M15 35 V37"]));

    // ------------------------------------------------- a home, from above --
    area("i_room", 200, 180, function (w, h) {
      var T = Math.max(1, Math.min(6, Math.min(w, h) * 0.06));
      return ["o " + R(0, 0, w, h, 0),
              "ke " + R(0, 0, w, h, 0) + " " + R(T, T, w - 2 * T, h - 2 * T, 0)];
    });
    area("i_zone", 240, 160, function (w, h) {
      var head = Math.min(24, h * 0.3);
      return ["o- " + R(0, 0, w, h, Math.min(6, h / 4)), "t- M0 " + n2(head) + " H" + n2(w)];
    });
    plan("i_wall", 100, 10, ["k " + R(0, 0, 100, 10, 0)]);
    plan("i_door", 50, 50, ["g " + R(2.6, 43, 47.4, 14, 0), "t M0 43 V57 M50 43 V57", "t- M0 0 A50 50 0 0 1 50 50", "o " + R(0, 0, 3, 50, 0)]);
    plan("i_door2", 80, 40, ["g " + R(2.6, 33, 74.8, 14, 0), "t M0 33 V47 M80 33 V47", "t- M0 0 A40 40 0 0 1 40 40 M80 0 A40 40 0 0 0 40 40",
                             "o " + R(0, 0, 2.6, 40, 0), "o " + R(77.4, 0, 2.6, 40, 0)]);
    plan("i_slide", 80, 10, ["g " + R(0, 0, 80, 10, 0), "t M0 0 V10 M80 0 V10", "o " + R(2, 1.4, 44, 3.6, 0), "o " + R(34, 5, 44, 3.6, 0)]);
    plan("i_window", 60, 10, ["o " + R(0, 0, 60, 10, 0), "t M0 5 H60", "t M2.5 0 V10 M57.5 0 V10"]);
    // Things on the walls, seen from above: each stands with its back to
    // the wall (its top edge here) and its front to the room, put there
    // by snapToWalls (03-icons.js) and raised to its height in 3D.
    plan("i_picture", 60, 6, ["o " + R(0, 0, 60, 6, 0), "t M4 3 H56"]);
    plan("i_mirror", 50, 6, ["o " + R(0, 0, 50, 6, 0), "t M3 4 H47", "t M8 2 L12 4 M14 2 L18 4"]);
    plan("i_shelf", 80, 20, ["o " + R(0, 0, 80, 20, 0),
      "t M6 2 V14 M10 2 V14 M14 2 V14 M18 2 V14 M23 2 V14 M27 2 V14", "o " + R(52, 3, 16, 10, 1)]);
    plan("i_walltv", 90, 8, ["k " + R(0, 0, 90, 5, 1), "t M30 5 V8 H60 V5"]);
    plan("i_wallclock", 20, 6, ["o " + R(0, 0, 20, 6, 3), "t M10 1 V5"]);
    plan("i_sconce", 20, 12, ["o M0 0 H20 C20 8 15 12 10 12 C5 12 0 8 0 0 Z", "k " + C(10, 4, 1.6)]);
    plan("i_cabinet", 60, 30, ["o " + R(0, 0, 60, 30, 0), "t- M0 0 L60 30 M60 0 L0 30"]);
    plan("i_hooks", 50, 8, ["o " + R(0, 0, 50, 4, 0), "t M8 4 V7.6 M18 4 V7.6 M28 4 V7.6 M38 4 V7.6",
                            "k " + C(8, 7.6, 1) + " " + C(18, 7.6, 1) + " " + C(28, 7.6, 1) + " " + C(38, 7.6, 1)]);
    plan("i_radiator", 80, 12, ["o " + R(0, 0, 80, 12, 1.5),
      "t M8 0 V12 M16 0 V12 M24 0 V12 M32 0 V12 M40 0 V12 M48 0 V12 M56 0 V12 M64 0 V12 M72 0 V12"]);
    plan("i_stairs", 50, 150, ["o " + R(0, 0, 50, 150, 0),
      "t M0 15 H50 M0 30 H50 M0 45 H50 M0 60 H50 M0 75 H50 M0 90 H50 M0 105 H50 M0 120 H50 M0 135 H50",
      "t M25 142 V10 M19.6 17 L25 9 L30.4 17"]);
    plan("i_bed", 80, 100, ["o " + R(0, 0, 80, 100, 3), "o " + R(6, 5, 31, 16, 4), "o " + R(43, 5, 31, 16, 4),
                            "o " + R(0, 30, 80, 70, 3), "t M0 38 H80"]);
    plan("i_bed1", 50, 100, ["o " + R(0, 0, 50, 100, 3), "o " + R(8, 5, 34, 16, 4),
                             "o " + R(0, 30, 50, 70, 3), "t M0 38 H50"]);
    plan("i_crib", 40, 70, ["o " + R(0, 0, 40, 70, 2), "t " + R(3, 3, 34, 64, 1),
      "t M3 12 H0 M3 22 H0 M3 32 H0 M3 42 H0 M3 52 H0 M3 62 H0 M37 12 H40 M37 22 H40 M37 32 H40 M37 42 H40 M37 52 H40 M37 62 H40",
      "o " + R(10, 7, 20, 10, 3)]);
    plan("i_sofa", 100, 40, ["o " + R(0, 0, 100, 40, 5), "o " + R(0, 0, 100, 11, 4),
                             "o " + R(0, 0, 11, 40, 4), "o " + R(89, 0, 11, 40, 4),
                             "t M37 11 V40 M63 11 V40"]);
    plan("i_armchair", 40, 40, ["o " + R(0, 0, 40, 40, 5), "o " + R(0, 0, 40, 11, 4),
                                "o " + R(0, 0, 9, 40, 3), "o " + R(31, 0, 9, 40, 3)]);
    plan("i_chair", 30, 30, ["o " + R(3, 6, 24, 22, 3), "o " + R(2, 0, 26, 7, 2)]);
    plan("i_dining", 100, 80, ["o " + R(17, 0, 20, 14, 3), "o " + R(63, 0, 20, 14, 3),
                               "o " + R(17, 66, 20, 14, 3), "o " + R(63, 66, 20, 14, 3),
                               "o " + R(0, 30, 14, 20, 3), "o " + R(86, 30, 14, 20, 3),
                               "o " + R(9, 9, 82, 62, 2)]);
    plan("i_roundtable", 80, 80, ["o " + R(30, 0, 20, 14, 3), "o " + R(30, 66, 20, 14, 3),
                                  "o " + R(0, 30, 14, 20, 3), "o " + R(66, 30, 14, 20, 3),
                                  "o " + C(40, 40, 29)]);
    plan("i_coffee", 50, 30, ["o " + R(0, 0, 50, 30, 4), "t " + R(4, 4, 42, 22, 2)]);
    plan("i_desk", 70, 40, ["o " + R(0, 0, 70, 40, 1.5), "o " + R(24, 4, 22, 5, 1), "t " + R(22, 17, 26, 7, 1),
                            "t M55 31 H64"]);
    plan("i_officechair", 30, 30, ["o " + C(15, 17, 10.6),
      "o M3 9.6 C6 1 24 1 27 9.6 L24 11.6 C20 6.4 10 6.4 6 11.6 Z", "t M3.6 13 V22 M26.4 13 V22"]);
    plan("i_wardrobe", 60, 30, ["o " + R(0, 0, 60, 30, 0), "t M30 0 V30", "t- M3 14 H57",
                                "k " + C(27, 24, 1), "k " + C(33, 24, 1)]);
    plan("i_dresser", 50, 30, ["o " + R(0, 0, 50, 30, 0), "t M3 25 H47",
                               "k " + C(12, 27.6, 0.9), "k " + C(25, 27.6, 0.9), "k " + C(38, 27.6, 0.9)]);
    plan("i_nightstand", 30, 30, ["o " + R(0, 0, 30, 30, 2), "t " + C(15, 15, 7), "t M10 15 H20 M15 10 V20"]);
    plan("i_bookcase", 50, 20, ["o " + R(0, 0, 50, 20, 0), "t " + R(2.4, 2.4, 45.2, 15.2, 0),
      "t M7 2.4 V17.6 M10.6 2.4 V17.6 M15 2.4 V17.6 M18.4 2.4 V17.6 M23.6 2.4 V17.6 M27 2.4 V17.6 M32 2.4 V17.6 M36.4 2.4 V17.6 M40 2.4 V17.6"]);
    plan("i_tv", 60, 20, ["o " + R(18, 8, 24, 10, 2), "o " + R(0, 2, 60, 6, 1.5)]);
    plan("i_fireplace", 80, 30, ["o " + R(0, 0, 80, 30, 0), "o " + R(15, 8, 50, 22, 0),
                                 "t M22 30 V14 H58 V30", "t M28 26 L41 19 M37 26 L51 18"]);
    plan("i_piano", 80, 30, ["o " + R(0, 0, 80, 18, 1.5), "o " + R(0, 18, 80, 12, 0),
      "t M5.7 18 V30 M11.4 18 V30 M17.1 18 V30 M22.9 18 V30 M28.6 18 V30 M34.3 18 V30 M40 18 V30 M45.7 18 V30 M51.4 18 V30 M57.1 18 V30 M62.9 18 V30 M68.6 18 V30 M74.3 18 V30",
      "k M4.4 18 H7 V25 H4.4 Z M10.1 18 H12.7 V25 H10.1 Z M21.6 18 H24.2 V25 H21.6 Z M27.3 18 H29.9 V25 H27.3 Z M33 18 H35.6 V25 H33 Z M44.4 18 H47 V25 H44.4 Z M50.1 18 H52.7 V25 H50.1 Z M61.6 18 H64.2 V25 H61.6 Z M67.3 18 H69.9 V25 H67.3 Z M73 18 H75.6 V25 H73 Z"]);
    plan("i_plant", 30, 30, ["o " + C(15, 15, 13.5),
      "t M15 15 L15 3 M15 15 L26 9 M15 15 L25 23 M15 15 L6 24 M15 15 L4 9", "k " + C(15, 15, 2)]);
    plan("i_rug", 100, 70, ["o " + R(0, 0, 100, 70, 2), "t " + R(7, 7, 86, 56, 0),
                            "t M50 16 L78 35 L50 54 L22 35 Z"]);
    plan("i_lamp", 20, 20, ["o " + C(10, 10, 9.4), "t " + C(10, 10, 4), "t M10 1 V6 M10 14 V19 M1 10 H6 M14 10 H19"]);
    plan("i_toilet", 30, 40, ["o " + R(2, 0, 26, 9, 2), "o M5 9 H25 V22 C25 34 20 39.4 15 39.4 C10 39.4 5 34 5 22 Z",
                              "t M9 13 H21 V22 C21 30 18 34.6 15 34.6 C12 34.6 9 30 9 22 Z"]);
    plan("i_sink", 30, 20, ["o " + R(0, 0, 30, 20, 2), "o " + E(15, 11.4, 10.4, 6.6), "k " + C(15, 11.4, 1),
                            "t M15 1.4 V5"]);
    plan("i_bathtub", 40, 90, ["o " + R(0, 0, 40, 90, 4), "o " + R(4, 4, 32, 82, 12), "k " + C(20, 79, 1.5),
                               "t M20 4 V10"]);
    plan("i_shower", 50, 50, ["o " + R(0, 0, 50, 50, 0), "t M0 0 L50 50 M50 0 L0 50", "o " + C(25, 25, 3.4)]);
    plan("i_counter", 100, 30, ["o " + R(0, 0, 100, 30, 0), "t M0 25.6 H100"]);
    plan("i_stove", 30, 30, ["o " + R(0, 0, 30, 30, 1.5),
      "t " + C(8.6, 8.6, 5) + " " + C(21.4, 8.6, 5) + " " + C(8.6, 21.4, 5) + " " + C(21.4, 21.4, 5),
      "t " + C(8.6, 8.6, 2) + " " + C(21.4, 8.6, 2) + " " + C(8.6, 21.4, 2) + " " + C(21.4, 21.4, 2)]);
    plan("i_fridge", 40, 40, ["o " + R(0, 0, 40, 40, 1.5), "t " + R(3, 3, 34, 28, 1), "t M0 34 H40",
                              "t2 M8 36.6 H18"]);
    plan("i_kitchensink", 40, 30, ["o " + R(0, 0, 40, 30, 1.5), "o " + R(3, 6, 16, 20, 3), "o " + R(21, 6, 16, 20, 3),
                                   "k " + C(11, 16, 1) + " " + C(29, 16, 1), "t M20 1.4 V5"]);
    plan("i_washer", 30, 30, ["o " + R(0, 0, 30, 30, 2), "t " + C(15, 17, 9), "t " + C(15, 17, 5.4),
                              "t M4 4.4 H12", "k " + C(24, 4.4, 1.3)]);
    plan("i_dryer", 30, 30, ["o " + R(0, 0, 30, 30, 2), "t " + C(15, 17, 9),
                             "t M10 14 H20 M9 17 H21 M10 20 H20", "t M4 4.4 H12", "k " + C(24, 4.4, 1.3)]);
    // ---- more of a home: storeys, and what fills each kind of room ------
    // A floor of a house is a container round its rooms, named for the
    // storey it is (38-walk.js orders them and stacks them in 3D).
    area("i_floor", 520, 420, function (w, h) {
      var head = Math.min(26, h * 0.3);
      return ["o " + R(0, 0, w, h, Math.min(8, h / 4)), "t " + R(5, 5, w - 10, h - 10, Math.min(5, h / 5)),
              "t M5 " + n2(head) + " H" + n2(w - 5)];
    });
    plan("i_spiral", 60, 60, ["o " + C(30, 30, 29.5),
      "t M30 30 L30 0.5 M30 30 L50.9 9.1 M30 30 L59.5 30 M30 30 L50.9 50.9 M30 30 L30 59.5 M30 30 L9.1 50.9 M30 30 L0.5 30 M30 30 L9.1 9.1",
      "o " + C(30, 30, 4)]);
    plan("i_elevator", 50, 50, ["o " + R(0, 0, 50, 50, 0), "t " + R(4, 4, 42, 42, 0), "t M4 4 L46 46 M46 4 L4 46"]);
    // kitchen and dining
    plan("i_dishwasher", 30, 30, ["o " + R(0, 0, 30, 30, 1.5), "t M3 25 H27", "t2 M9 21 H21",
                                  "k " + C(6, 4, 1) + " " + C(10, 4, 1)]);
    plan("i_island", 120, 60, ["o " + R(0, 0, 120, 60, 2), "t " + R(4, 4, 112, 52, 1)]);
    plan("i_stool", 20, 20, ["o " + C(10, 10, 9.5), "t " + C(10, 10, 5)]);
    plan("i_trash", 20, 20, ["o " + C(10, 10, 9.5), "t M3 10 H17", "k " + C(10, 4.5, 1.2)]);
    plan("i_pantry", 60, 30, ["o " + R(0, 0, 60, 30, 0), "t M30 0 V30", "t- M3 9 H57 M3 18 H57",
                              "k " + C(27, 26, 1) + " " + C(33, 26, 1)]);
    plan("i_microwave", 30, 20, ["o " + R(0, 0, 30, 20, 1.5), "t " + R(3, 3, 17, 14, 1), "t M23 3 V17",
                                 "k " + C(26.5, 7, 1) + " " + C(26.5, 12, 1)]);
    plan("i_coffeemaker", 15, 15, ["o " + R(0, 0, 15, 15, 2), "t " + C(7.5, 9, 3.5), "t M3 3 H12"]);
    plan("i_toaster", 20, 12, ["o " + R(0, 0, 20, 12, 3), "t M4 4 H16 M4 8 H16"]);
    plan("i_kettle", 15, 15, ["o " + C(7.5, 8.5, 6), "t M12 5 L14.6 2", "t M3.5 4 C5 1.2 10 1.2 11.5 4"]);
    plan("i_fruitbowl", 20, 20, ["o " + C(10, 10, 9.5), "o " + C(7, 8, 2.6) + " " + C(12.5, 7.5, 2.4) + " " + C(10, 12.8, 2.6)]);
    // bathroom and laundry
    plan("i_vanity", 100, 50, ["o " + R(0, 0, 100, 50, 1.5), "o " + E(27, 25, 14, 10) + " " + E(73, 25, 14, 10),
                               "k " + C(27, 25, 1.2) + " " + C(73, 25, 1.2), "t M27 3 V9 M73 3 V9"]);
    plan("i_bathmat", 50, 30, ["o " + R(0, 0, 50, 30, 4), "t- " + R(3, 3, 44, 24, 3)]);
    plan("i_hamper", 25, 25, ["o " + R(1, 1, 23, 23, 4), "t M1 9 H24 M1 16 H24 M8 1 V24 M17 1 V24"]);
    plan("i_ironing", 120, 35, ["o M0 17.5 C0 6 10 0 25 0 H120 V35 H25 C10 35 0 29 0 17.5 Z", "t M30 17.5 H112",
                                "o M88 9 H106 C109 9 110 12 110 17.5 C110 23 109 26 106 26 H88 L84 17.5 Z"]);
    plan("i_dryrack", 60, 30, ["o " + R(0, 0, 60, 30, 1), "t M0 6 H60 M0 12 H60 M0 18 H60 M0 24 H60"]);
    plan("i_heater", 50, 50, ["o " + C(25, 25, 24), "t " + C(25, 25, 8), "k " + C(25, 25, 2)]);
    plan("i_utilitysink", 50, 45, ["o " + R(0, 0, 50, 45, 2), "o " + R(5, 8, 40, 32, 5), "k " + C(25, 24, 1.3), "t M25 2 V8"]);
    // bedroom
    plan("i_bedking", 100, 110, ["o " + R(0, 0, 100, 110, 3), "o " + R(6, 5, 41, 17, 4), "o " + R(53, 5, 41, 17, 4),
                                 "o " + R(0, 32, 100, 78, 3), "t M0 40 H100"]);
    plan("i_bunkbed", 50, 100, ["o " + R(0, 0, 50, 100, 3), "o " + R(8, 5, 30, 15, 4), "t- " + R(3, 3, 37, 94, 2),
                                "t M42 22 V100 M42 40 H50 M42 55 H50 M42 70 H50 M42 85 H50"]);
    plan("i_vanitytable", 60, 30, ["o " + R(0, 0, 60, 30, 1.5), "o " + E(30, 6, 13, 4.5), "t M6 25 H54"]);
    plan("i_bench", 80, 25, ["o " + R(0, 0, 80, 25, 4), "t M27 0 V25 M53 0 V25"]);
    plan("i_chest", 50, 30, ["o " + R(0, 0, 50, 30, 3), "t M0 10 H50", "k " + R(22, 13, 6, 5, 1)]);
    plan("i_sidetable", 30, 30, ["o " + C(15, 15, 14.5), "t " + C(15, 15, 10)]);
    plan("i_filing", 40, 45, ["o " + R(0, 0, 40, 45, 1), "t M3 41 H37", "t2 M14 36 H26"]);
    // living room
    plan("i_loveseat", 70, 40, ["o " + R(0, 0, 70, 40, 5), "o " + R(0, 0, 70, 11, 4),
                                "o " + R(0, 0, 11, 40, 4) + " " + R(59, 0, 11, 40, 4), "t M35 11 V40"]);
    plan("i_sectional", 120, 100, ["o M0 0 H120 V42 H42 V100 H0 Z", "o M0 0 H120 V11 H11 V100 H0 Z",
                                   "o " + R(109, 0, 11, 42, 3), "o " + R(0, 89, 42, 11, 3),
                                   "t M60 11 V42 M90 11 V42 M11 55 H42"]);
    plan("i_recliner", 45, 55, ["o " + R(0, 0, 45, 55, 6), "o " + R(0, 0, 45, 12, 5),
                                "o " + R(0, 0, 8, 40, 3) + " " + R(37, 0, 8, 40, 3), "t M0 41 H45"]);
    plan("i_ottoman", 35, 35, ["o " + R(0, 0, 35, 35, 6), "t M17.5 6 V29 M6 17.5 H29", "k " + C(17.5, 17.5, 1.2)]);
    plan("i_tvstand", 120, 40, ["o " + R(0, 0, 120, 40, 1.5), "t M40 0 V40 M80 0 V40"]);
    plan("i_aquarium", 80, 35, ["o " + R(0, 0, 80, 35, 1.5), "t " + R(3, 3, 74, 29, 1),
                                "t M30 18 C34 13 42 13 45 18 C42 23 34 23 30 18 Z M30 18 L26 14 V22 Z"]);
    plan("i_beanbag", 50, 50, ["o M25 2 C40 2 48 12 48 26 C48 40 38 48 25 48 C12 48 2 40 2 26 C2 12 10 2 25 2 Z",
                               "t M14 20 C20 16 30 16 36 20"]);
    plan("i_speaker", 20, 20, ["o " + R(0, 0, 20, 20, 2), "t " + C(10, 10, 6), "k " + C(10, 10, 2)]);
    // decor that stands on other things, plants and lights
    plan("i_tablelamp", 20, 20, ["o " + C(10, 10, 9.5), "t " + C(10, 10, 4), "k " + C(10, 10, 1.2)]);
    plan("i_desklamp", 20, 20, ["o " + C(5, 15, 4.5), "t M5 15 L13 7", "o " + C(14, 6, 5.5)]);
    plan("i_vase", 16, 16, ["o " + C(8, 8, 7.5), "o " + C(5, 6, 2) + " " + C(10.5, 5, 2) + " " + C(8, 10.5, 2), "k " + C(8, 7.5, 1)]);
    plan("i_candle", 10, 10, ["o " + C(5, 5, 4.5), "k " + C(5, 5, 1.2)]);
    plan("i_books", 25, 18, ["o " + R(0, 0, 25, 18, 1), "t M0 6 H25 M0 12 H25"]);
    plan("i_frame", 18, 8, ["o " + R(0, 0, 18, 4, 0.5), "t M4 4 L2 8 M14 4 L16 8"]);
    plan("i_basket", 22, 18, ["o " + R(0, 0, 22, 18, 6), "t M0 9 H22 M6 0 V18 M11 0 V18 M16 0 V18"]);
    plan("i_monitor", 40, 14, ["o " + R(0, 0, 40, 5, 1), "o " + R(15, 5, 10, 4, 1), "o " + R(11, 9, 18, 5, 1.5)]);
    plan("i_succulent", 14, 14, ["o " + C(7, 7, 6.5), "t M7 7 L7 1.5 M7 7 L12.2 4 M7 7 L12.2 10 M7 7 L1.8 10 M7 7 L1.8 4"]);
    plan("i_herbs", 40, 15, ["o " + R(0, 0, 40, 15, 2), "o " + C(8, 7.5, 3.6) + " " + C(20, 7.5, 3.6) + " " + C(32, 7.5, 3.6)]);
    plan("i_palm", 40, 40, ["o " + C(20, 20, 19.5),
      "t M20 20 C14 12 8 10 2 12 M20 20 C26 12 32 10 38 12 M20 20 C12 24 8 30 6 38 M20 20 C28 24 32 30 34 38 M20 20 C20 12 18 6 20 2",
      "k " + C(20, 20, 2.4)]);
    plan("i_cactus", 20, 20, ["o " + C(10, 10, 9.5), "t M10 1 V19 M1 10 H19",
                              "k " + C(6, 6, 0.7) + " " + C(14, 6, 0.7) + " " + C(6, 14, 0.7) + " " + C(14, 14, 0.7)]);
    plan("i_flowers", 24, 24, ["o " + C(12, 12, 11.5),
      "o " + C(12, 6.5, 3) + " " + C(17.2, 10.3, 3) + " " + C(15.2, 16.4, 3) + " " + C(8.8, 16.4, 3) + " " + C(6.8, 10.3, 3),
      "k " + C(12, 12, 1.8)]);
    plan("i_hanging", 30, 30, ["t- " + C(15, 15, 14.5), "o " + C(15, 15, 9),
                               "t M15 15 L15 6 M15 15 L23 12 M15 15 L20 22 M15 15 L10 22 M15 15 L7 12"]);
    plan("i_pendant", 26, 26, ["t- " + C(13, 13, 12.5), "o " + C(13, 13, 6.5), "k " + C(13, 13, 2)]);
    plan("i_chandelier", 50, 50, ["t- " + C(25, 25, 24.5),
      "t M25 25 L25 8 M25 25 L39.7 16.5 M25 25 L39.7 33.5 M25 25 L25 42 M25 25 L10.3 33.5 M25 25 L10.3 16.5",
      "o " + C(25, 8, 3.4) + " " + C(39.7, 16.5, 3.4) + " " + C(39.7, 33.5, 3.4) + " " + C(25, 42, 3.4) + " " + C(10.3, 33.5, 3.4) + " " + C(10.3, 16.5, 3.4),
      "o " + C(25, 25, 5)]);
    plan("i_ceilingfan", 70, 70, ["t- " + C(35, 35, 34.5),
      "o M35 35 C31 22 32 8 35 3 C38 8 39 22 35 35 Z M35 35 C48 31 62 32 67 35 C62 38 48 39 35 35 Z " +
      "M35 35 C39 48 38 62 35 67 C32 62 31 48 35 35 Z M35 35 C22 39 8 38 3 35 C8 32 22 31 35 35 Z",
      "o " + C(35, 35, 5.5)]);
    plan("i_arclamp", 40, 40, ["o " + C(6, 34, 5), "t M6 34 C6 12 18 4 31 6", "o " + C(32, 8, 7)]);
    // storage, on the floor and on the walls
    plan("i_cubeshelf", 80, 30, ["o " + R(0, 0, 80, 30, 0), "t M20 0 V30 M40 0 V30 M60 0 V30"]);
    plan("i_cornershelf", 30, 30, ["o M0 0 H30 A30 30 0 0 1 0 30 Z", "t M0 0 L21 21", "t M0 18 A18 18 0 0 0 18 0"]);
    plan("i_shoerack", 60, 25, ["o " + R(0, 0, 60, 25, 0),
      "o " + R(5, 5, 5, 15, 2.5) + " " + R(11, 5, 5, 15, 2.5) + " " + R(22, 5, 5, 15, 2.5) + " " + R(28, 5, 5, 15, 2.5) + " " +
             R(39, 5, 5, 15, 2.5) + " " + R(45, 5, 5, 15, 2.5)]);
    plan("i_coatrack", 25, 25, ["t M12.5 12.5 L3 3 M12.5 12.5 L22 3 M12.5 12.5 L3 22 M12.5 12.5 L22 22",
                                "o " + C(12.5, 12.5, 4), "k " + C(3, 3, 1.6) + " " + C(22, 3, 1.6) + " " + C(3, 22, 1.6) + " " + C(22, 22, 1.6)]);
    plan("i_hood", 30, 25, ["o " + R(0, 0, 30, 25, 1), "t M0 0 L15 13 L30 0 M15 13 V25"]);
    plan("i_towelrail", 50, 8, ["o " + R(0, 0, 50, 4, 1), "t M4 4 V7 M46 4 V7", "o " + R(10, 4, 30, 4, 0.5)]);
    plan("i_medicine", 40, 12, ["o " + R(0, 0, 40, 12, 0), "t M20 0 V12", CROSS(10, 6, 6)]);
    // outdoors, and the animals
    plan("i_grill", 40, 30, ["o " + R(0, 0, 40, 30, 4), "t M5 6 H35 M5 12 H35 M5 18 H35 M5 24 H35"]);
    plan("i_pool", 200, 120, ["o " + R(0, 0, 200, 120, 10), "t " + R(6, 6, 188, 108, 7),
      "t M30 50 C40 45 50 55 60 50 C70 45 80 55 90 50 M100 75 C110 70 120 80 130 75 C140 70 150 80 160 75",
      "t M178 20 V50 M186 20 V50 M178 28 H186 M178 38 H186"]);
    plan("i_patio", 80, 80, ["o " + R(30, 0, 20, 14, 3) + " " + R(30, 66, 20, 14, 3) + " " + R(0, 30, 14, 20, 3) + " " + R(66, 30, 14, 20, 3),
                             "o " + C(40, 40, 24), "t- " + C(40, 40, 34), "k " + C(40, 40, 2)]);
    plan("i_gardenbench", 80, 25, ["o " + R(0, 0, 80, 25, 2), "t M0 6 H80 M0 12 H80 M0 18 H80"]);
    plan("i_hottub", 90, 90, ["o " + R(0, 0, 90, 90, 12), "t " + R(8, 8, 74, 74, 9),
                              "k " + C(20, 20, 1.5) + " " + C(70, 20, 1.5) + " " + C(20, 70, 1.5) + " " + C(70, 70, 1.5)]);
    plan("i_dogbed", 50, 40, ["o " + E(25, 20, 24.5, 19.5), "o " + E(25, 22, 16, 12)]);
    plan("i_cattree", 40, 40, ["o " + R(0, 0, 40, 40, 2), "o " + C(12, 12, 9) + " " + C(28, 28, 9), "t M12 12 L28 28"]);
    // electronics
    plan("i_soundbar", 60, 8, ["o " + R(0, 0, 60, 8, 3), "k " + C(10, 4, 1) + " " + C(30, 4, 1) + " " + C(50, 4, 1)]);
    plan("i_console", 25, 18, ["o " + R(0, 0, 25, 18, 3), "t M5 12 H20", "k " + C(20, 5, 1)]);
    plan("i_pc", 20, 45, ["o " + R(0, 0, 20, 45, 1.5), "t M4 6 H16 M4 10 H16", "k " + C(10, 40, 1.5)]);
    plan("i_projector", 30, 25, ["t- " + R(-6, -6, 42, 37, 4), "o " + R(0, 0, 30, 25, 3), "o " + C(21, 12.5, 6), "t " + C(21, 12.5, 3)]);
    plan("i_proscreen", 160, 8, ["o " + R(0, 0, 160, 5, 1), "t M3 2.5 H157", "o " + R(0, 5, 8, 3, 1) + " " + R(152, 5, 8, 3, 1)]);
    plan("i_recordplayer", 35, 30, ["o " + R(0, 0, 35, 30, 2), "o " + C(15, 15, 11), "t " + C(15, 15, 6),
                                    "k " + C(15, 15, 1.5), "t2 M31 5 L23 19"]);
    plan("i_fan", 35, 35, ["o " + C(17.5, 17.5, 17), "t M17.5 17.5 C14 10 15 4 17.5 1.5 M17.5 17.5 C25 14 31 15 33.5 17.5 " +
                           "M17.5 17.5 C21 25 20 31 17.5 33.5 M17.5 17.5 C10 21 4 20 1.5 17.5", "k " + C(17.5, 17.5, 2.5)]);
    plan("i_ac", 80, 20, ["o " + R(0, 0, 80, 20, 4), "t M6 13 H74 M6 16.5 H74"]);
    // a house on its land: the lot it stands on, the way to it, round it
    area("i_lot", 750, 1000, function (w, h) {      // 15 m by 20 m, about 49 ft by 66 ft
      var out = ["o " + R(0, 0, w, h, 0), "t-1.6 " + R(0, 0, w, h, 0)];
      var grass = "";
      for (var gy = 30; gy < h - 20; gy += 46) {
        for (var gx = 30 + (gy % 92 ? 23 : 0); gx < w - 20; gx += 46) {
          grass += " M" + n2(gx - 3) + " " + n2(gy + 2) + " L" + n2(gx - 1) + " " + n2(gy - 3) +
                   " M" + n2(gx + 1) + " " + n2(gy + 2) + " L" + n2(gx + 3) + " " + n2(gy - 4);
        }
      }
      if (grass) { out.push("t" + grass); }
      return out;
    });
    plan("i_driveway", 100, 200, ["o " + R(0, 0, 100, 200, 2), "t M0 50 H100 M0 100 H100 M0 150 H100"]);
    plan("i_path", 40, 150, ["o " + R(0, 0, 40, 150, 2), "t M0 25 H40 M0 50 H40 M0 75 H40 M0 100 H40 M0 125 H40 M20 0 V150"]);
    plan("i_deck", 150, 100, ["o " + R(0, 0, 150, 100, 0), "t M0 10 H150 M0 20 H150 M0 30 H150 M0 40 H150 M0 50 H150 " +
                              "M0 60 H150 M0 70 H150 M0 80 H150 M0 90 H150"]);
    plan("i_fence", 150, 8, ["t2 M0 4 H150", "k " + R(0, 1, 6, 6, 0) + " " + R(48, 1, 6, 6, 0) + " " + R(96, 1, 6, 6, 0) + " " + R(144, 1, 6, 6, 0)]);
    plan("i_hedge", 100, 20, ["o M0 10 C0 3 6 0 12 2 C17 -1 24 -1 28 2 C33 -1 40 -1 44 2 C49 -1 56 -1 60 2 C65 -1 72 -1 76 2 " +
                              "C81 -1 88 -1 92 2 C98 1 100 5 100 10 C100 15 98 19 92 18 C88 21 81 21 76 18 C72 21 65 21 60 18 " +
                              "C56 21 49 21 44 18 C40 21 33 21 28 18 C24 21 17 21 12 18 C6 20 0 17 0 10 Z", "t M8 10 H92"]);
    plan("i_flowerbed", 80, 30, ["o " + R(0, 0, 80, 30, 6),
      "o " + C(14, 11, 3.6) + " " + C(28, 19, 3.6) + " " + C(42, 10, 3.6) + " " + C(55, 19, 3.6) + " " + C(68, 11, 3.6),
      "k " + C(14, 11, 1) + " " + C(28, 19, 1) + " " + C(42, 10, 1) + " " + C(55, 19, 1) + " " + C(68, 11, 1)]);
    plan("i_garagedoor", 120, 10, ["g " + R(0, -2, 120, 14, 0), "o " + R(0, 0, 120, 10, 0), "t M0 3.4 H120 M0 6.6 H120"]);
    plan("i_parked", 90, 200, ["o " + R(2, 54, 9, 8, 2), "o " + R(79, 54, 9, 8, 2),
      "o M10 20 C10 6 22 0 45 0 C68 0 80 6 80 20 V180 C80 194 68 200 45 200 C22 200 10 194 10 180 Z",
      "t M18 60 C30 51 60 51 72 60 L68 84 C55 79 35 79 22 84 Z",
      "t M22 158 C35 162 55 162 68 158 L72 176 C60 182 30 182 18 176 Z", "t " + R(22, 88, 46, 66, 6)]);
    plan("i_shrub", 80, 80, ["o M40 4 C50 2 58 8 60 14 C70 14 77 24 74 32 C80 40 78 52 70 56 C70 66 60 74 50 72 C44 78 32 78 28 72 C18 74 8 66 10 56 C2 52 0 40 6 32 C3 24 10 14 20 14 C22 8 30 2 40 4 Z",
      "t M40 40 L27 25 M40 40 L56 27 M40 40 L53 58 M40 40 L24 54", "k " + C(40, 40, 3)]);

    // ------------------------------------------------- computers, network --
    figure("i_computer", ["o " + R(5, 5, 38, 26, 2), "t " + R(8.4, 8.4, 31.2, 19.2, 1),
                          "o M21 31 H27 L28 37 H20 Z", "o " + R(14, 37, 20, 4, 1.5)]);
    figure("i_laptop", ["o " + R(9, 9, 30, 22, 2), "t " + R(12, 12, 24, 16, 1),
                        "o M4 32 H44 L41 38 H7 Z", "t M20 35 H28"]);
    figure("i_tablet", ["o " + R(12, 4, 24, 40, 3), "t " + R(15, 8, 18, 29, 1), "k " + C(24, 40.6, 1.3)]);
    figure("i_phone", ["o " + R(15, 3, 18, 42, 3.6), "t " + R(17.6, 8.6, 12.8, 28.4, 1), "t M21.4 5.8 H26.6",
                       "k " + C(24, 41, 1.3)]);
    figure("i_server", ["o " + R(10, 3, 28, 42, 2), "t M10 17 H38 M10 31 H38",
                        "k " + C(14.4, 10, 1.3) + " " + C(14.4, 24, 1.3) + " " + C(14.4, 38, 1.3),
                        "t M21 10 H34 M21 24 H34 M21 38 H34"]);
    figure("i_database", ["o M8 10 C8 3.4 40 3.4 40 10 V38 C40 44.6 8 44.6 8 38 Z",
                          "t M8 10 C8 16.6 40 16.6 40 10", "t M8 19.4 C8 26 40 26 40 19.4 M8 28.8 C8 35.4 40 35.4 40 28.8"]);
    figure("i_router", ["t1.8 M14 25 L10.6 9.4 M34 25 L37.4 9.4", "o " + R(5, 24, 38, 14, 3),
                        "k " + C(12, 31, 1.3) + " " + C(17, 31, 1.3) + " " + C(22, 31, 1.3), "t M29 31 H37"]);
    figure("i_switch", ["o " + R(3, 16, 42, 16, 2),
      "k M7 20 H11 V23.4 H7 Z M13 20 H17 V23.4 H13 Z M19 20 H23 V23.4 H19 Z M25 20 H29 V23.4 H25 Z M31 20 H35 V23.4 H31 Z M37 20 H41 V23.4 H37 Z",
      "k M7 25.6 H11 V29 H7 Z M13 25.6 H17 V29 H13 Z M19 25.6 H23 V29 H19 Z M25 25.6 H29 V29 H25 Z M31 25.6 H35 V29 H31 Z M37 25.6 H41 V29 H37 Z"]);
    figure("i_firewall", ["o " + R(5, 8, 38, 32, 1),
      "t M5 16 H43 M5 24 H43 M5 32 H43 M17 8 V16 M30 8 V16 M11 16 V24 M24 16 V24 M37 16 V24 M17 24 V32 M30 24 V32 M11 32 V40 M24 32 V40 M37 32 V40"]);
    figure("i_wifi", ["t2.2 M9.6 21.4 C17.4 13.4 30.6 13.4 38.4 21.4 M14.6 26.4 C20 21 28 21 33.4 26.4 M19.4 31.2 C22 28.6 26 28.6 28.6 31.2",
                      "k " + C(24, 34.6, 2), "o " + R(10, 38, 28, 6, 3)]);
    figure("i_printer", ["o " + R(13, 5, 22, 13, 0.5), "o " + R(5, 17, 38, 17, 2), "o M11 33 H37 L39 43 H9 Z",
                         "t M15 38 H33", "k " + C(36.4, 22.6, 1.3)]);
    figure("i_camera", ["o M7 13.6 L33 7.6 L36 18 L10 24 Z", "o M33.4 9.4 L40.4 8 L42 15.6 L35 17 Z",
                        "t M18 21.6 L20 31 H12 M12 26 V40 M8 40 H16"]);
    figure("i_internet", ["o " + C(24, 24, 18),
      "t M24 6 C14 14 14 34 24 42 C34 34 34 14 24 6 Z M6 24 H42 M8.6 15 H39.4 M8.6 33 H39.4"]);
    figure("i_tower", ["t M24 11 L15.6 45 M24 11 L32.4 45 M18.6 33.6 H29.4 M20.4 25 H27.6 M18.6 33.6 L27.6 25 M29.4 33.6 L20.4 25",
                       "o " + C(24, 10, 2.6),
                       "t M17.6 5.4 C15.6 8.4 15.6 11.6 17.6 14.6 M30.4 5.4 C32.4 8.4 32.4 11.6 30.4 14.6",
                       "t M13 2.6 C9.4 7.6 9.4 12.4 13 17.4 M35 2.6 C38.6 7.6 38.6 12.4 35 17.4"]);

    // ------------------------------------------------------------ circuits --
    figure("i_battery", ["o " + R(5, 15, 34, 18, 2), "o " + R(39, 19.6, 4.6, 8.8, 1),
                         "t M27 15 V33", "t2 M31 24 H36 M33.5 21.5 V26.5", "t2 M10 24 H15"]);
    figure("i_bulb", ["o M24 3.6 C33 3.6 38.4 10.4 38.4 17.6 C38.4 23.6 33.6 26.8 31.4 30.6 V34 H16.6 V30.6 C14.4 26.8 9.6 23.6 9.6 17.6 C9.6 10.4 15 3.6 24 3.6 Z",
                      "t M20 30.6 V24.4 L21.6 18.6 L23.2 24 L24.8 18.6 L26.4 24 L28 18.6 V30.6",
                      "o " + R(17, 34, 14, 8.6, 1.4), "t M17 37 H31 M17 39.8 H31", "k M21 42.6 H27 L25.8 45.6 H22.2 Z"]);
    figure("i_switch_on", ["t M3 32 H8.6 M39.4 32 H45", "t2 M10.6 31 L36 17.6",
                           "o " + C(11, 32, 2.8), "o " + C(37, 32, 2.8)]);
    figure("i_resistor", ["t M2 24 H9.6 M38.4 24 H46",
                          "t1.8 M9.6 24 L12 17 L16.8 31 L21.6 17 L26.4 31 L31.2 17 L36 31 L38.4 24"]);
    figure("i_capacitor", ["t M2 24 H20.4 M27.6 24 H46", "t2.6 M20.4 11 V37 M27.6 11 V37"]);
    figure("i_led", ["t M2 24 H13 M31 24 H46", "o M13 13 L31 24 L13 35 Z", "t2 M31 13 V35",
                     "t M30.6 10.4 L36 5 M33 5 H36 V8 M35.6 14.4 L41 9 M38 9 H41 V12"]);
    figure("i_motor", ["t M2 24 H9 M39 24 H46", "o " + C(24, 24, 15), "t1.8 M17.4 31 V17 L24 25.6 L30.6 17 V31"]);
    figure("i_buzzer", ["o M6 35 V23 C6 13 30 13 30 23 V35 Z", "t M6 35 H30", "t M14 35 V41 M22 35 V41",
                        "t M34.6 17 C37.6 20 37.6 26 34.6 29 M38.6 13 C43.6 18.6 43.6 27.4 38.6 33"]);
    figure("i_socket", ["o " + R(10, 5, 28, 38, 4), "k " + R(17, 13, 3.2, 8.4, 1) + " " + R(27.8, 13, 3.2, 8.4, 1),
                        "k M21 30.4 C21 27.2 27 27.2 27 30.4 V33.6 H21 Z"]);
    figure("i_solar", ["o M10 7 H38 L44.6 33 H3.4 Z", "t M8.4 16 H39.6 M6 24.6 H42 M19.4 7 L17 33 M28.6 7 L31 33",
                       "t M24 33 V44 M15 44 H33"]);
    figure("i_ground", ["t M24 5 V21", "t2 M10 21 H38", "t2 M15 28 H33", "t2 M20 35 H28"]);

    // ------------------------------------------------------ travel and city --
    figure("i_car", ["o M4 30 C4 26 7 24 10 23 L15 15 C16 13.4 18 13 20 13 H31 C33 13 34.4 14 35.4 15.6 L40 23 C43 23.6 45 26 45 29 V33 H4 Z",
                     "t M17 22.6 L20 16.2 H25 V22.6 Z M28 22.6 V16.2 H31.4 L35 22.6 Z",
                     "o " + C(13, 33.6, 4.6) + " " + C(36, 33.6, 4.6), "k " + C(13, 33.6, 1.5) + " " + C(36, 33.6, 1.5)]);
    figure("i_bus", ["o " + R(4, 9, 40, 27, 3), "t M8 13 H40 V23.6 H8 Z M16 13 V23.6 M24 13 V23.6 M32 13 V23.6",
                     "t M4 29 H44", "o " + C(13, 36.4, 4) + " " + C(35, 36.4, 4)]);
    figure("i_truck", ["o " + R(3, 10, 27, 24, 1), "o M30 16 H38 L44.6 24 V34 H30 Z", "t M33 19 H37.4 L41 23.6 H33 Z",
                       "o " + C(10, 35.6, 4.2) + " " + C(37, 35.6, 4.2)]);
    figure("i_bike", ["t1.6 " + C(11.6, 32, 8) + " " + C(36.4, 32, 8),
                      "t1.6 M11.6 32 L19.6 20.6 H32.4 L36.4 32 M19.6 20.6 L25 32 L32.4 20.6 M25 32 H11.6",
                      "t2 M17.4 17 H23 M32.4 20.6 L30.6 15.4 H35.4"]);
    figure("i_train", ["o " + R(10, 3, 28, 35, 6), "t " + R(14, 8, 20, 11.6, 2), "t M10 25 H38",
                       "k " + C(16, 31, 2) + " " + C(32, 31, 2), "t M15 38 L9 46 M33 38 L39 46 M11.6 42.6 H36.4"]);
    figure("i_plane", ["o M24 3 C26 3 27 6 27 9 V19 L44 28 V32 L27 27 V37 L32 41 V44 L24 42 L16 44 V41 L21 37 V27 L4 32 V28 L21 19 V9 C21 6 22 3 24 3 Z"]);
    figure("i_ship", ["o " + R(25.6, 9, 5.4, 9.6, 0.5), "o " + R(13.6, 17.6, 19.4, 10.4, 1),
                      "t M17.6 22.6 H19.6 M22.6 22.6 H24.6 M27.6 22.6 H29.6", "o M3.6 28 H44.4 L38 39.6 H10 Z",
                      "t M2 44.4 C6 42.4 10 46.4 14 44.4 C18 42.4 22 46.4 26 44.4 C30 42.4 34 46.4 38 44.4 C42 42.4 46 46.4 47.6 44.4"]);
    figure("i_house", ["o " + R(30.4, 8.6, 4.4, 9, 0.4), "o M7 22.6 L24 7.6 L41 22.6 V43 H7 Z",
                       "t M4.6 24.6 L24 7.4 L43.4 24.6", "o " + R(19.6, 30, 8.8, 13, 0.5), "t " + R(29.6, 26, 7, 6.4, 0) + " M33.1 26 V32.4"]);
    figure("i_building", ["o " + R(12, 3, 24, 41, 0.5), "t M12 11 H36 M12 19 H36 M12 27 H36 M12 35 H36 M20 3 V35 M28 3 V35",
                          "o " + R(20.6, 37.4, 6.8, 6.6, 0.4)]);
    figure("i_shop", ["o " + R(8, 18, 32, 25, 0.5), "o M5.6 18.4 L9.6 7.4 H38.4 L42.4 18.4 Z",
                      "t M15.4 7.4 L13.6 18.4 M21.4 7.4 L20.6 18.4 M26.6 7.4 L27.4 18.4 M32.6 7.4 L34.4 18.4",
                      "t " + R(11.4, 23, 13.4, 10.6, 0), "o " + R(28.4, 26, 8, 17, 0.4)]);
    figure("i_school", ["t M24 10.6 V2 L30.4 4 L24 6", "o M10 22 H38 V44 H10 Z", "o M6.6 22.4 L24 10.4 L41.4 22.4 Z",
                        "o " + C(24, 18.4, 2.6), "o " + R(20.6, 33.6, 6.8, 10.4, 0.4),
                        "t " + R(12.6, 26, 5, 5, 0) + " " + R(30.4, 26, 5, 5, 0)]);
    figure("i_hospital", ["o " + R(7, 12, 34, 32, 0.5), "o " + R(17, 4, 14, 14, 1), CROSS(24, 11, 9),
                          "t " + R(10.6, 22, 5.6, 5, 0) + " " + R(31.8, 22, 5.6, 5, 0) + " " + R(10.6, 32, 5.6, 5, 0) + " " + R(31.8, 32, 5.6, 5, 0),
                          "o " + R(20.4, 33, 7.2, 11, 0.4)]);
    figure("i_factory", ["o " + R(35.6, 8, 6, 36, 0.4), "o M4 44 V24 L14 17.6 V24 L24 17.6 V24 L34 17.6 V44 Z",
                         "t M37.6 5.6 C35.6 3.6 37.6 1.6 40 2.4", "t M8.6 32 H13 M18.6 32 H23 M28.6 32 H31.4",
                         "o " + R(9, 37, 7, 7, 0.4)]);
    figure("i_warehouse", ["o M4 19.6 L24 7.6 L44 19.6 V44 H4 Z", "o " + R(13.4, 27.4, 21.2, 16.6, 0.4),
                           "t M13.4 31.4 H34.6 M13.4 35.4 H34.6 M13.4 39.4 H34.6"]);
    figure("i_tree", ["o M21.4 32 H26.6 L27.6 45 H20.4 Z",
                      "o M24 3.6 C31 3.6 36 8.6 36 14.6 C40.4 16.6 41.4 24 37.2 28 C37.2 33.2 31 36 26 34 H22 C17 36 10.8 33.2 10.8 28 C6.6 24 7.6 16.6 12 14.6 C12 8.6 17 3.6 24 3.6 Z"]);
    figure("i_traffic", ["t2 M24 36 V46", "o " + R(16.6, 3, 14.8, 33, 3),
                         "t " + C(24, 10.6, 3.6) + " " + C(24, 19.6, 3.6), "k " + C(24, 28.6, 3.6)]);

    // --------------------------------------------------------------- space --
    figure("i_rocket", ["o M16 26 L9 35 V40 L16 36 Z", "o M32 26 L39 35 V40 L32 36 Z",
                        "o M24 3 C30 8 32 16 32 26 V34 H16 V26 C16 16 18 8 24 3 Z",
                        "o " + C(24, 17, 4.2), "t " + C(24, 17, 2.2), "o M19 34 H29 L27 38.6 H21 Z",
                        "t M21 41 C21 44 24 47 24 47 C24 47 27 44 27 41"]);
    figure("i_satellite", ["t M16 24 H19 M29 24 H32 M24 18 V12.6", "o " + R(2, 19.6, 14, 8.8, 0.5), "o " + R(32, 19.6, 14, 8.8, 0.5),
                           "t M6.6 19.6 V28.4 M11.4 19.6 V28.4 M36.6 19.6 V28.4 M41.4 19.6 V28.4",
                           "o " + R(19, 18, 10, 12, 1.6), "o M18.6 12.6 C18.6 7.4 29.4 7.4 29.4 12.6 Z"]);
    figure("i_planet", ["t M3.6 31 C1.6 26.4 15 18.6 27 16.4 C39 14.4 47 16.6 44.4 20.6 C42.4 24.6 30 30.4 20 32.4 C10 34.4 4.6 33.6 3.6 31 Z",
                        "o " + C(24, 24, 11), "t M13.2 26.8 C18 26.6 25 25.2 30.6 23.4 C33 22.6 34.8 21.8 35 21.4"]);
    figure("i_earth", ["o " + C(24, 24, 18),
                       "k M14 11.4 C18 10 21.6 12.6 19.6 16.6 C18 19.6 21 22.6 18 25.6 C15.4 28 11.6 26 9.6 22 C8.6 18 10 13.6 14 11.4 Z",
                       "k M28 8 C32 8.6 35 12 32.4 15.4 C30.6 17.6 33.4 20.4 36.6 19.4 C39.6 21.6 39 27.6 35.6 30.6 C32.6 33.6 28.6 32 27.6 35.6 C27 38.6 23 39.4 22.6 36 C22.4 32.6 25.6 30 26.6 27 C27.6 24 24.4 22 25.6 18 C26.6 14.6 24.6 10.6 28 8 Z"]);
    figure("i_moon", ["o M30 5 C19.6 7.4 13.6 15.6 13.6 25 C13.6 35.4 22 43.6 32.4 43.6 C36 43.6 39.4 42.6 42.2 40.6 C31.2 40.4 23 32.6 23 22.6 C23 14.6 26.4 8.6 30 5 Z",
                      "t " + C(19.6, 26, 2) + " " + C(24, 35.4, 1.6)]);
    figure("i_sun", ["o " + C(24, 24, 9.4),
                     "t1.8 M24 3 V10 M24 38 V45 M3 24 H10 M38 24 H45 M9.2 9.2 L14 14 M34 34 L38.8 38.8 M38.8 9.2 L34 14 M9.2 38.8 L14 34"]);
    figure("i_star", ["o " + STAR(24, 25.4, 20.6, 8.4, 5)]);
    figure("i_telescope", ["t M24 23 L16 45 M24 23 L32 45 M24 23 V45", "o M8.6 24.6 L35.4 11 L38.4 17.6 L11.6 31.2 Z",
                           "o M35.4 9.4 L40.4 7 L44 14.6 L39 17 Z", "o " + C(24, 22.6, 2.6)]);
    figure("i_ufo", ["t- M17.4 32 L12 45 M30.6 32 L36 45", "o M15.6 22.4 C15.6 12.6 32.4 12.6 32.4 22.4 Z",
                     "o " + E(24, 25.4, 20.4, 6.6),
                     "k " + C(11.6, 25.4, 1.4) + " " + C(19.6, 27.6, 1.4) + " " + C(28.4, 27.6, 1.4) + " " + C(36.4, 25.4, 1.4)]);

    // ---------------------------------------------------------------- things --
    figure("i_money", ["o " + R(3, 13, 42, 23, 2), "t " + C(24, 24.5, 7.2),
                       "t M26.4 21 C25.4 19.8 22 19.6 21.4 21.6 C20.8 24 26.8 24 26.6 27 C26.2 29.6 22.4 29.4 21.2 28.2 M24 18.6 V30.6",
                       "t M8.6 18 H11 M37 31 H39.4"]);
    figure("i_coins", ["o M6 34 V39 C6 42.4 24 42.4 24 39 V34", "o " + E(15, 34, 9, 3.4),
                       "o M6 28 V33 C6 36.4 24 36.4 24 33 V28", "o " + E(15, 28, 9, 3.4),
                       "o M24 30 V40 C24 43.4 42 43.4 42 40 V30", "o " + E(33, 30, 9, 3.4),
                       "o M24 22 V29 C24 32.4 42 32.4 42 29 V22", "o " + E(33, 22, 9, 3.4),
                       "o M8 14 V21 C8 24.4 26 24.4 26 21 V14", "o " + E(17, 14, 9, 3.4)]);
    figure("i_cart", ["t2 M3 7.6 H9.6 L15.6 32 H38", "o M10.6 13 H43 L38.6 27.6 H14.2 Z", "t M12.4 20.4 H41",
                      "o " + C(18, 38, 3.4) + " " + C(34, 38, 3.4)]);
    figure("i_package", ["o M24 5 L43 13.6 L24 22.2 L5 13.6 Z", "o M5 13.6 L24 22.2 V44 L5 35.4 Z",
                         "o M43 13.6 L24 22.2 V44 L43 35.4 Z", "t M14.4 9.4 L33.6 18 V25.6"]);
    figure("i_mail", ["o " + R(4, 11, 40, 27, 2), "t M4.6 12.4 L24 27 L43.4 12.4", "t M4.6 37 L18.6 23.6 M43.4 37 L29.4 23.6"]);
    figure("i_chat", ["o M14 30 C14 26 16 24 19 24 H36 C39 24 41 26 41 29 V36 C41 39 39 41 36 41 H35 V45 L30.6 41 H19 C16 41 14 39 14 36 Z",
                      "o M6 9 C6 6 8 4 11 4 H31 C34 4 36 6 36 9 V20 C36 23 34 25 31 25 H17 L10.6 30.6 V25 C8 25 6 23 6 20 Z",
                      "k " + C(14, 14.6, 1.6) + " " + C(21, 14.6, 1.6) + " " + C(28, 14.6, 1.6)]);
    figure("i_clock", ["o " + C(24, 24, 18.6), "t M24 7.4 V10 M24 38 V40.6 M7.4 24 H10 M38 24 H40.6",
                       "t1.8 M24 13 V24 L31.4 29", "k " + C(24, 24, 1.6)]);
    figure("i_calendar", ["o " + R(6, 9, 36, 34, 2), "k " + R(6, 9, 36, 8.4, 2), "t2 M15 5 V12.6 M33 5 V12.6",
      "k " + C(14, 24, 1.4) + " " + C(21.4, 24, 1.4) + " " + C(28.8, 24, 1.4) + " " + C(36, 24, 1.4) + " " +
             C(14, 30.6, 1.4) + " " + C(21.4, 30.6, 1.4) + " " + C(28.8, 30.6, 1.4) + " " + C(36, 30.6, 1.4) + " " +
             C(14, 37.2, 1.4) + " " + C(21.4, 37.2, 1.4)]);
    figure("i_gear", ["oe " + GEAR(24, 24, 19, 14.4, 10) + " " + C(24, 24, 6.4)]);
    figure("i_lock", ["t2.2 M16 22 V15.4 C16 6 32 6 32 15.4 V22", "o " + R(9.6, 21.6, 28.8, 22.4, 3),
                      "k M24 28.6 C25.8 28.6 26.6 29.8 26.6 31.2 C26.6 32.2 26.2 33 25.2 33.4 L26 38.4 H22 L22.8 33.4 C21.8 33 21.4 32.2 21.4 31.2 C21.4 29.8 22.2 28.6 24 28.6 Z"]);
    figure("i_key", ["oe " + C(13, 24, 8.6) + " " + C(13, 24, 3.4),
                     "o M21.4 21.4 H45 V26.6 H41 V31.4 H36.6 V26.6 H33.4 V30.2 H29 V26.6 H21.4 Z"]);
    figure("i_idea", ["t1.6 M24 1.6 V4.6 M9.6 7.6 L11.8 9.8 M38.4 7.6 L36.2 9.8 M4 21 H7 M44 21 H41",
                      "o M24 8.6 C31.4 8.6 35.6 14 35.6 19.6 C35.6 24.6 32 27 30 30.6 V34 H18 V30.6 C16 27 12.4 24.6 12.4 19.6 C12.4 14 16.6 8.6 24 8.6 Z",
                      "t M21 30.6 V24.6 L24 20.6 L27 24.6 V30.6", "o " + R(18.4, 34, 11.2, 7.6, 1.4), "t M18.4 37.6 H29.6",
                      "k M21.4 41.6 H26.6 L25.6 44.6 H22.4 Z"]);
    figure("i_search", ["o M28.4 31.6 L31.6 28.4 L44 40.8 C45 41.8 44.8 43.4 43.8 44 C42.8 45 41.2 45 40.2 44 Z",
                        "oe " + C(20, 20, 13) + " " + C(20, 20, 8.6)]);
    figure("i_check", ["o " + C(24, 24, 18.6), "t2.6 M15 24.6 L21.4 31 L33.6 17.4"]);
    figure("i_cross", ["o " + C(24, 24, 18.6), "t2.6 M17 17 L31 31 M31 17 L17 31"]);
    figure("i_warning", ["o M24 4.6 C25.2 4.6 26 5.2 26.6 6.2 L45 38.6 C46.2 40.6 44.8 43 42.4 43 H5.6 C3.2 43 1.8 40.6 3 38.6 L21.4 6.2 C22 5.2 22.8 4.6 24 4.6 Z",
                         "k M22.2 16.6 H25.8 L25 30.6 H23 Z", "k " + C(24, 35.6, 1.9)]);
    figure("i_flag", ["t2.2 M10 3.6 V45", "o M10 6 C17 3 22 9 29 6 C33 4.4 36 5 38.4 6 V24.4 C31 21.4 26 27.4 19 24.4 C15 22.6 12.4 23 10 24.4 Z"]);
    figure("i_heart", ["o M24 42 C14 34 5 27 5 18 C5 11 10 7 16 7 C20 7 22.6 9 24 12 C25.4 9 28 7 32 7 C38 7 43 11 43 18 C43 27 34 34 24 42 Z"]);
    figure("i_trophy", ["t2 M14 10 H8 C8 18 11.6 20.4 15 20.4 M34 10 H40 C40 18 36.4 20.4 33 20.4",
                        "o M13.6 5 H34.4 V16 C34.4 24 29.4 28.4 24 28.4 C18.6 28.4 13.6 24 13.6 16 Z",
                        "o " + R(21.4, 28.4, 5.2, 7, 0.4), "o " + R(15, 35.4, 18, 6.6, 1)]);
    figure("i_chart", ["o " + R(10.6, 26, 7.4, 16, 0.4) + " " + R(20.6, 15, 7.4, 27, 0.4) + " " + R(30.6, 21, 7.4, 21, 0.4),
                       "t2 M6 5 V42 H44"]);
    figure("i_book", ["o M9 6 H35 C37.6 6 40 8 40 10.6 V43 H13.6 C11 43 9 41 9 38.4 Z", "t M13.6 6 V38.4",
                      "t M9 38.4 C9 35.8 11 34 13.6 34 H40", "t M19 14 H34 M19 19 H30"]);
    figure("i_megaphone", ["o " + R(4.6, 18, 6.4, 12.6, 1.2), "o M11 18 L34 7.6 V41 L11 30.6 Z",
                           "t M16 31.6 L19.4 40 H23.6 L21.4 33.6", "t M38.6 17.6 C41 21.6 41 27 38.6 31 M42.6 13.6 C46.6 19.6 46.6 29 42.6 35"]);
    return made;
  })();

  // Which icons go together, and the order they are offered in -- by the
  // panel's library of them (11-hand-icons.js), and named for what a
  // drawing of them is (37-board.js).
  var ICON_SETS = [
    ["ic_people", ["i_person", "i_man", "i_woman", "i_child", "i_elder", "i_team",
                   "i_doctor", "i_nurse", "i_surgeon", "i_dentist", "i_pharmacist", "i_paramedic", "i_patient",
                   "i_chef", "i_baker", "i_waiter", "i_farmer", "i_gardener",
                   "i_builder", "i_engineer", "i_electrician", "i_plumber", "i_mechanic", "i_carpenter",
                   "i_painter", "i_cleaner", "i_miner",
                   "i_artist", "i_musician", "i_photographer", "i_reporter",
                   "i_teacher", "i_student", "i_graduate", "i_librarian", "i_scientist", "i_programmer",
                   "i_office", "i_manager", "i_accountant", "i_receptionist", "i_agent", "i_cashier", "i_customer",
                   "i_police", "i_firefighter", "i_soldier", "i_guard", "i_lawyer", "i_judge",
                   "i_pilot", "i_astronaut", "i_driver", "i_delivery", "i_postman", "i_hairdresser", "i_coach"]],
    ["ic_rooms", ["i_room", "i_floor", "i_wall", "i_door", "i_door2", "i_slide", "i_garagedoor", "i_window",
                  "i_stairs", "i_spiral", "i_elevator"]],
    ["ic_living", ["i_sofa", "i_loveseat", "i_sectional", "i_armchair", "i_recliner", "i_ottoman", "i_beanbag",
                   "i_coffee", "i_sidetable", "i_tvstand", "i_tv", "i_fireplace", "i_piano", "i_bookcase",
                   "i_aquarium", "i_speaker", "i_rug", "i_lamp", "i_arclamp"]],
    ["ic_bedroom", ["i_bed", "i_bedking", "i_bed1", "i_bunkbed", "i_crib", "i_nightstand", "i_wardrobe",
                    "i_dresser", "i_vanitytable", "i_bench", "i_chest", "i_desk", "i_officechair", "i_filing"]],
    ["ic_kitchen", ["i_counter", "i_island", "i_stove", "i_fridge", "i_kitchensink", "i_dishwasher", "i_pantry",
                    "i_dining", "i_roundtable", "i_chair", "i_stool", "i_trash", "i_microwave", "i_coffeemaker",
                    "i_toaster", "i_kettle", "i_fruitbowl"]],
    ["ic_bath", ["i_toilet", "i_sink", "i_vanity", "i_bathtub", "i_shower", "i_bathmat", "i_hamper",
                 "i_washer", "i_dryer", "i_ironing", "i_dryrack", "i_utilitysink", "i_heater"]],
    ["ic_decor", ["i_tablelamp", "i_desklamp", "i_vase", "i_candle", "i_books", "i_frame", "i_basket",
                  "i_monitor", "i_plant", "i_succulent", "i_herbs", "i_palm", "i_cactus", "i_flowers",
                  "i_hanging", "i_pendant", "i_chandelier", "i_ceilingfan"]],
    ["ic_walls", ["i_picture", "i_mirror", "i_shelf", "i_walltv", "i_wallclock", "i_sconce", "i_cabinet",
                  "i_hooks", "i_radiator", "i_hood", "i_towelrail", "i_medicine", "i_cubeshelf",
                  "i_cornershelf", "i_shoerack", "i_coatrack"]],
    ["ic_tech", ["i_tv", "i_walltv", "i_soundbar", "i_console", "i_pc", "i_monitor", "i_speaker",
                 "i_projector", "i_proscreen", "i_recordplayer", "i_fan", "i_ac"]],
    ["ic_outdoor", ["i_lot", "i_driveway", "i_path", "i_deck", "i_fence", "i_hedge", "i_flowerbed",
                    "i_parked", "i_shrub", "i_grill", "i_pool", "i_patio", "i_gardenbench", "i_hottub",
                    "i_dogbed", "i_cattree"]],
    ["ic_devices", ["i_computer", "i_laptop", "i_tablet", "i_phone", "i_server", "i_database",
                    "i_router", "i_switch", "i_firewall", "i_wifi", "i_internet", "i_tower",
                    "i_printer", "i_camera"]],
    ["ic_circuit", ["i_battery", "i_bulb", "i_switch_on", "i_resistor", "i_capacitor", "i_led",
                    "i_motor", "i_buzzer", "i_socket", "i_solar", "i_ground"]],
    ["ic_travel", ["i_car", "i_bus", "i_truck", "i_bike", "i_train", "i_plane", "i_ship",
                   "i_house", "i_building", "i_shop", "i_school", "i_hospital", "i_factory",
                   "i_warehouse", "i_tree", "i_traffic"]],
    ["ic_space", ["i_rocket", "i_satellite", "i_astronaut", "i_sun", "i_earth", "i_moon", "i_planet",
                  "i_star", "i_telescope", "i_ufo"]],
    ["ic_things", ["i_zone", "i_money", "i_coins", "i_cart", "i_package", "i_mail", "i_chat", "i_clock",
                   "i_calendar", "i_gear", "i_lock", "i_key", "i_idea", "i_search", "i_check", "i_cross",
                   "i_warning", "i_flag", "i_heart", "i_trophy", "i_chart", "i_book", "i_megaphone"]]
  ];
