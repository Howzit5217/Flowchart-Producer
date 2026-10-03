// ---------------------------------------------------------------------------
//  40-rooms.js -- more rooms a house may have, asked for in Start
//  building: a pantry by the kitchen, a mudroom by the way in from the
//  garage, a playroom, a media room, a home gym, a library, a sunroom --
//  each furnished as such a room is
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "More rooms per building type")
  //
  // Each a kind of room as Start building's own are (39-starter.js: how wide
  // in a band, how wide it may grow, what stands along its walls and in its
  // middle, what hangs over it); where it goes, its plan says: the rooms by
  // day downstairs, along the front with the living rooms; the pantry after
  // the kitchen; the mudroom at the end by the garage; a playroom, a library
  // and a gym upstairs in a house of two floors.
  var ROOMS_MORE = ["pantry", "mudroom", "playroom", "media", "gym", "library", "sunroom"];
  var ROOMS_UP = { playroom: 1, library: 1, gym: 1 };
  if (typeof STARTER_ROOMS === "object") {
    Object.assign(STARTER_ROOMS, {
      pantry: { w: 2.2, h: 2.4, bw: 2.2, max: 2.8, wall: ["i_shelving", "i_shelf"], mid: [] },
      mudroom: { w: 2.4, h: 2.4, bw: 2.4, max: 3.0, wall: ["i_bench", "i_hooks", "i_shoerack"], mid: [] },
      playroom: { w: 4.0, h: 3.8, bw: 4.0, max: 5.4, wall: ["i_toybox", "i_shelving", "i_beanbag", "i_easel", "i_bookcase"], mid: ["i_rug"] },
      media: { w: 4.6, h: 4.2, bw: 4.6, max: 6.0, wall: ["i_walltv", "i_speaker", "i_speaker"], mid: ["i_sectional|i_sofa"] },
      library: { w: 3.8, h: 3.8, bw: 3.8, max: 5.0, wall: ["i_bookcase", "i_bookcase", "i_bookcase", "i_armchair", "i_lamp"], mid: ["i_rug", "i_armchair"] },
      sunroom: { w: 4.2, h: 3.6, bw: 4.2, max: 5.4, wall: ["i_plant", "i_loveseat", "i_armchair", "i_plant", "i_plant"], mid: ["i_coffee"] }
    });
    if (!STARTER_ROOMS.gym) {
      STARTER_ROOMS.gym = { w: 5.4, h: 4.6, bw: 5.4, max: 9, wall: ["i_treadmill", "i_treadmill|i_exbike", "i_exbike", "i_weightbench"], mid: ["i_yogamat"] };
    }
  }
  if (typeof STARTER_LABEL === "object") {
    Object.assign(STARTER_LABEL, { pantry: "hx_pantry", mudroom: "hx_mudroom", playroom: "hx_playroom", media: "hx_media", library: "hx_library", sunroom: "hx_sunroom" });
    if (!STARTER_LABEL.gym) { STARTER_LABEL.gym = "hx_gym"; }
  }
  if (typeof STARTER_ZONE === "object") {
    Object.assign(STARTER_ZONE, { pantry: "wet", mudroom: "wet", playroom: "day", media: "day", library: "day", sunroom: "day" });
    if (!STARTER_ZONE.gym) { STARTER_ZONE.gym = "day"; }
  }
  if (typeof STARTER_FLOOR_OF === "object") {
    Object.assign(STARTER_FLOOR_OF, { pantry: "kitchen", mudroom: "wet", playroom: "bed", media: "bed", library: "living", sunroom: "living" });
    if (!STARTER_FLOOR_OF.gym) { STARTER_FLOOR_OF.gym = "garage"; }
  }
  if (typeof STARTER_CEILING === "object") {
    Object.assign(STARTER_CEILING, { pantry: "i_pendant", mudroom: "i_pendant", playroom: "i_ceilingfan", media: "i_projector", library: "i_pendant", sunroom: "i_ceilingfan" });
    if (!STARTER_CEILING.gym) { STARTER_CEILING.gym = "i_pendant"; }
  }
  if (typeof STARTER_VENTED === "object") {
    ROOMS_MORE.forEach(function (k) { STARTER_VENTED[k] = 1; });
  }
  if (typeof STARTER_WALLS === "object") {
    Object.assign(STARTER_WALLS, { library: [["i_picture", null]], sunroom: [["i_picture", null]], playroom: [["i_picture", null], ["i_wallclock", null]],
                                   media: [["i_picture", null], ["i_sconce", null], ["i_sconce", null]], mudroom: [["i_mirror", "i_bench"]] });
  }
  // (rooms that want daylight: on an outside wall when a long house is folded, 39-starter.js)
  var STARTER_OUTER = { playroom: 1, media: 1, library: 1, sunroom: 1, gym: 1 };
  if (typeof STARTER_DAY === "object") { STARTER_DAY.sunroom = 1; STARTER_DAY.playroom = 1; STARTER_DAY.library = 1; }

  // The house's extra rooms, from what was asked: [by day, upstairs].
  function roomsMore(want, it) {
    var EX = want.extras || {}, day = [], up = [];
    ROOMS_MORE.forEach(function (k) {
      if (!EX[k] || !STARTER_ROOMS[k]) { return; }
      var r = it(k, TXT[STARTER_LABEL[k]] || "");
      (ROOMS_UP[k] ? up : day).push(r);
    });
    return { day: day, up: up };
  }
  // Asked in Start building, with the house's extras (39-starter.js).
  function roomsAsk(ui, want) {
    want.extras = Object.assign({}, want.extras && typeof want.extras === "object" ? want.extras : {});
    ui.head(TXT.hx_head);
    ui.tiles();
    ROOMS_MORE.forEach(function (k) {
      ui.tile(TXT[STARTER_LABEL[k]] || k, "hx_" + k, function () { return !!want.extras[k]; }, function () { want.extras[k] = !want.extras[k]; });
    });
  }
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      hx_pantry: '<rect x="4.4" y="2.8" width="11.2" height="14.4" rx="1"/><path d="M4.4 7.6h11.2M4.4 12.4h11.2M7 5.2h2M11 5.2h2M7 10h1.6M10.4 10h2.4M7.4 14.8h5.2"/>',
      hx_mudroom: '<path d="M3 11.4h14M4 11.4v4.8M16 11.4v4.8M5 4.4v2.4M10 4.4v2.4M15 4.4v2.4M3 4.4h14"/><path d="M6.4 16.4h3.2v-1.6l-1.6-.8M11.6 16.4h3.2v-1.6l-1.6-.8"/>',
      hx_playroom: '<rect x="3" y="10" width="5.6" height="5.6" rx=".8"/><path d="M13.4 15.6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5.8 10V7.4M3.6 4.4l2.2 3 2.2-3z"/>',
      hx_media: '<rect x="2.6" y="3.6" width="14.8" height="8.4" rx="1"/><path d="M8.6 6.2v3.2l2.8-1.6zM6 16.4h8M10 12v4.4"/>',
      hx_gym: '<path d="M2.6 10h14.8M4.4 7v6M6.6 6v8M13.4 6v8M15.6 7v6"/>',
      hx_library: '<path d="M3.4 16.6V3.4M3.4 16.6h13.2M5.8 16.6V5.4h2.2v11.2M8 16.6V4.2h2.2v12.4M11 16.4l2.2-10.6 2.1.4-2.2 10.6"/>',
      hx_sunroom: '<circle cx="14" cy="5.4" r="2"/><path d="M14 1.8v1M17.6 5.4h-1M2.6 17.4V9.4l5.6-3.6 5.6 3.6v8M2.6 13.4h11.2M8.2 5.8v11.6"/>'
    });
  }
  // A media room by its name: a room for watching, kept dark -- not a
  // living room wanting a window (38-advice.js)
  if (typeof ROOM_CALLED === "object" && !ROOM_CALLED.some(function (c) { return c[0] === "media"; })) {
    ROOM_CALLED.unshift(["media", /media room|home theat|heimkino|sala de cine|home cin|hx_media/i]);
  }
