// ---------------------------------------------------------------------------
//  40-condos.js -- condos: a building of homes owned one by one, bigger
//  than apartments -- one bedroom or two, a bathroom for the second --
//  a lobby and a gym on the ground floor, stairs and a lift
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "change the Build House button to Start Building
  // so you can have Homes, Apartments, Condos, Stores of different sizes")
  //
  // Laid out as the apartments are (39-types.js): a stairwell climbing the
  // building, the homes either side of a corridor, the floors one over
  // another; but each home a condo's size, and the ground floor the
  // building's own -- its lobby, and a gym for the people who live there.
  // (Three bedrooms would want a hall of its own inside each home: two at most.)
  Object.assign(STARTER_ROOMS, {
    gym: { w: 5.4, h: 4.6, bw: 5.4, max: 9, wall: ["i_treadmill", "i_treadmill|i_exbike", "i_exbike", "i_weightbench"], mid: ["i_yogamat"] }
  });
  Object.assign(STARTER_LABEL, { gym: "tr_gym" });
  Object.assign(STARTER_ZONE, { gym: "day" });
  Object.assign(STARTER_FLOOR_OF, { gym: "garage" });
  if (typeof STARTER_CEILING === "object") { STARTER_CEILING.gym = "i_pendant"; }
  if (typeof STARTER_VENTED === "object") { STARTER_VENTED.gym = 1; }
  if (typeof BUILDING_TYPES === "object") {
    BUILDING_TYPES.condos = {
      icon: "flats", style: "contemporary", ceil: 2.8,
      plan: function (want) {
        var S = Math.max(2, Math.min(TYPE_MOST.storeys, want.storeys || 4)), K = Math.max(1, Math.min(TYPE_MOST.side, want.condosSide || 1)), B = want.condoBeds === 1 ? 1 : 2;
        var floors = [], W = 0;
        for (var k = 0; k < S; k++) {
          var ground = k === 0;
          var f = { level: k, back: typeCore(k, S - 1, true), front: ground ? [R("lobby", 5.2, { entry: true }), R("gym", 5.4, { label: TXT.tr_gym })] : [R("landing", 4.8)],
                    H: 1.8, Db: 4.8, Df: 4.8 };
          ["back", "front"].forEach(function (side, si) {
            // (the ground floor's front is the building's own)
            if (ground && side === "front") { return; }
            for (var u = 0; u < K; u++) {
              var id = "c" + k + side + u, name = say("ty_condo_n", { n: (k + 1) + String.fromCharCode(65 + si * K + u) });
              var flat = R("flat", 7.2, { id: id, label: name }), main = R("flatbed", 4.2, { id: id + "b", via: id, label: TXT.st_main });
              // (a home's rooms off its living room, which has two sides: a
              // second bedroom with its bathroom over it, or one bedroom and
              // its bathroom beyond it)
              var two = B > 1 ? { kind: "suite", w: 4.6, parts: [R("flatbed2", 4.6, { id: id + "c", via: id }), R("flatbath", 4.6, { via: id + "c" })] }
                              : R("flatbath", 2.6, { via: id + "b" });
              if (B < 2) { main.label = ""; }
              var unit = B > 1 ? ((u + si) % 2 ? [two, flat, main] : [main, flat, two]) : ((u + si) % 2 ? [two, main, flat] : [flat, main, two]);
              Array.prototype.push.apply(f[side], unit);
            }
          });
          floors.push(f);
        }
        floors.forEach(function (f) { W = Math.max(W, typeWidth(f.back), typeWidth(f.front)); });
        floors.forEach(function (f) { typeFill(f.back, W, ["flat"]); typeFill(f.front, W, ["flat", "lobby", "gym", "landing"]); });
        return { floors: floors, W: W, two: S > 1, noGarage: true };
      },
      ask: function (ui) {
        ui.stepper("storeys", TXT.ty_storeys, "flats", 2, TYPE_MOST.storeys);
        ui.stepper("condosSide", TXT.ty_condos_side, "door", 1, TYPE_MOST.side);
        ui.stepper("condoBeds", TXT.ty_flat_beds, "bed", 1, 2);
      }
    };
    if (typeof TYPE_ORDER !== "undefined" && TYPE_ORDER.indexOf("condos") < 0) {
      var at = TYPE_ORDER.indexOf("apartments");
      TYPE_ORDER.splice(at >= 0 ? at + 1 : TYPE_ORDER.length, 0, "condos");
    }
    if (typeof starterWant === "object") {
      if (starterWant.condosSide === undefined) { starterWant.condosSide = 1; }
      if (starterWant.condoBeds === undefined) { starterWant.condoBeds = 2; }
    }
  }
