// ---------------------------------------------------------------------------
//  40-sheetflow.js -- Start building's questions in an order that reads, and
//  those the answers so far make no difference to switched off
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-07: "update the questions so as you pick options some become disabled because
  // they are no longer needed and to also put them in a better order so they make more sense")
  //
  // The sheet is built by many parts, each asking its own questions where it was hooked in (39-starter.js
  // and the parts after it): what the building is, then whatever each part added, in the order the parts
  // happened to be written.  Once it is built, its sections -- a heading and what is under it -- are put
  // in the order a building is thought about: what it is and how big; its shape; its rooms; how it is
  // laid out; what more it has; how it looks; what is in it; its services; round it; where it stands;
  // the street; and last, how it is drawn on the paper.  "The house" -- a heading over four things that
  // belong elsewhere -- is shared out: its roof to the style, its lot to where it stands, its outlets to
  // its services; what is left is how it is drawn.
  //
  // Then, each time anything is picked: what needs something not picked is switched off, its reason on
  // it -- the street's sides, lanes and sidewalk and the neighbors with no street; what goes over the
  // garage with no garage; how the bedrooms are arranged with one bedroom; outlets put in for you when
  // the wiring is yours to do; a skyscraper's roof and spreading out, made its own way.
  var FLOW_ORDER = [
    "ty_head", "ty_what_head", "st_rooms_head", "sk_use_head", "sk_form_head", "ty_size", "st_floors", "shp_head",
    "st_layout_head", "sup_head", "zn_head", "st_extras_head", "gd_cars_head", "hx_head", "at_head", "at_garage_head",
    "sy_head", "uf_head", "dy_head", "mp_fuel_head", "hh_head", "yd_head", "gr_head",
    "st_site_head", "tr_head", "lw_attach_head", "lw_park_head", "lw_side_head",
    "hs_outside", "sf_head", "vg_head", "ln_head", "pw_head", "st_house_head"
  ];
  // What a heading says, back to which it is.
  function flowKeyOf(text) {
    for (var i = 0; i < FLOW_ORDER.length; i++) { if (TXT[FLOW_ORDER[i]] === text) { return FLOW_ORDER[i]; } }
    return null;
  }
  // The sheet as sections: each heading and what follows it up to the next.
  function flowSections(pick) {
    var out = [], cur = { head: null, key: null, els: [] };
    Array.prototype.slice.call(pick.children).forEach(function (el) {
      if (el.classList.contains("st-head")) {
        out.push(cur);
        cur = { head: el, key: flowKeyOf(el.textContent), els: [] };
      } else { cur.els.push(el); }
    });
    out.push(cur);
    return out.filter(function (s) { return s.head || s.els.length; });
  }
  function flowSection(pick, key) { return flowSections(pick).filter(function (s) { return s.key === key; })[0] || null; }
  function flowGridOf(sec) { return sec ? sec.els.filter(function (e) { return e.classList.contains("st-tiles"); })[0] || null : null; }
  function flowTile(pick, name) { return pick.querySelector('.st-tile[data-tile="' + name + '"]'); }

  // ---- once built: in order -----------------------------------------------------------------------
  function starterFlowBuilt(pick, want, T) {
    if (!pick) { return; }
    // "The house" shared out
    var house = flowSection(pick, "st_house_head");
    if (house) {
      var move = function (name, toKey, fallback) {
        var b = flowTile(pick, name), sec = flowSection(pick, toKey) || (fallback ? flowSection(pick, fallback) : null);
        if (!b || !sec || sec === house) { return; }
        var grid = flowGridOf(sec);
        if (!grid) {
          grid = document.createElement("div");
          grid.className = "st-tiles";
          var last = sec.els.length ? sec.els[sec.els.length - 1] : sec.head;
          last.parentNode.insertBefore(grid, last.nextSibling);
        }
        grid.appendChild(b);
      };
      move("roof", "sy_head");
      move("land", "st_site_head");
      move("xr_power", "dy_head", "uf_head");
      house.head.textContent = TXT.flow_paper_head;
      house.key = "st_house_head";
    }
    // the sections in the order they are thought about (those this does not know of kept after the one
    // they came after)
    var secs = flowSections(pick), prev = -1;
    secs.forEach(function (s, i) {
      var at = house && s.head === house.head ? FLOW_ORDER.indexOf("st_house_head") : s.key ? FLOW_ORDER.indexOf(s.key) : -1;
      s.rank = at >= 0 ? at : prev + 0.001;
      s.i = i;
      prev = s.rank;
    });
    secs.sort(function (a, b) { return a.rank - b.rank || a.i - b.i; });
    secs.forEach(function (s) {
      if (s.head) { pick.appendChild(s.head); }
      s.els.forEach(function (e) { pick.appendChild(e); });
    });
    // what a type does not have, not asked: a house's yard is a house's, not a car park's
    if ((!want.type || want.type === "house" || (typeof groundsKindOf === "function" && groundsKindOf(want.type) === "home")) && typeof GROUNDS_FOR === "object") {
      var notHome = {};
      Object.keys(GROUNDS_FOR).forEach(function (k) { if (k !== "home") { GROUNDS_FOR[k].forEach(function (y) { notHome[y] = true; }); } });
      GROUNDS_FOR.home.forEach(function (y) { delete notHome[y]; });
      Object.keys(notHome).forEach(function (y) {
        var b = flowTile(pick, "yd_" + y);
        if (b && !(want.yard && want.yard[y])) { b.style.display = "none"; }
      });
    }
    starterFlowNow(pick, want);
  }

  // ---- each time anything is picked: what is not needed, off ---------------------------------------
  function flowStreet(want) { var S = want.site || {}; return S.street !== undefined ? !!S.street : !!houseOpt("street"); }
  function flowTower(want) { return want.type === "tower"; }
  // sections: whether needed, and why not
  var FLOW_SECTION_NEED = {
    at_garage_head: [function (w) { return !!w.garage; }, "flow_garage"],
    zn_head: [function (w) { return (w.beds || 1) >= 2; }, "flow_beds"],
    sf_head: [flowStreet, "hs_needs_street"],
    vg_head: [flowStreet, "hs_needs_street"],
    ln_head: [flowStreet, "hs_needs_street"]
  };
  // single choices
  var FLOW_TILE_NEED = {
    hood: [flowStreet, "hs_needs_street"],
    folk: [flowStreet, "hs_needs_street"],
    lw_pk_street: [flowStreet, "hs_needs_street"],
    roof: [function (w) { return !flowTower(w); }, "flow_not_tower"],
    spread: [function (w) { return !flowTower(w); }, "flow_not_tower"],
    gutter: [function (w) { return !flowTower(w); }, "flow_not_tower"],
    xr_power: [function (w) { return (w.services || "auto") !== "diy"; }, "flow_diy"],
    hh_each: [function (w) { return !flowTower(w) || (w.towerUse || "offices") !== "offices"; }, "flow_homes"]
  };
  function flowSet(b, on, why) {
    if (!on) {
      if (!b.disabled) { b.disabled = true; b.dataset.flowOff = "1"; b.title = why; b.setAttribute("aria-disabled", "true"); }
      else if (b.dataset.flowOff) { b.title = why; }
    } else if (b.dataset.flowOff) {
      b.disabled = false; delete b.dataset.flowOff; b.removeAttribute("aria-disabled");
      if (b.title === why || !why) { b.removeAttribute("title"); }
    }
  }
  function starterFlowNow(pick, want) {
    if (!pick || !want) { return; }
    flowSections(pick).forEach(function (s) {
      if (!s.head) { return; }
      // (a heading with nothing under it, as a cafe's "What it has": not shown)
      var shown = s.els.some(function (e) { return e.style.display !== "none" && (e.children.length || e.textContent.trim()); });
      if (!shown && !s.head.dataset.flowHid && s.head.style.display !== "none") { s.head.style.display = "none"; s.head.dataset.flowHid = "1"; }
      else if (shown && s.head.dataset.flowHid) { s.head.style.display = ""; delete s.head.dataset.flowHid; }
      var rule = s.key && FLOW_SECTION_NEED[s.key];
      if (!rule) { return; }
      var on = !!rule[0](want), why = TXT[rule[1]] || "";
      s.head.style.opacity = on ? "" : "0.45";
      s.head.title = on ? "" : why;
      s.els.forEach(function (e) {
        Array.prototype.forEach.call(e.querySelectorAll("button, input"), function (b) { flowSet(b, on, why); });
      });
    });
    Object.keys(FLOW_TILE_NEED).forEach(function (name) {
      var b = flowTile(pick, name);
      if (!b) { return; }
      var rule = FLOW_TILE_NEED[name];
      flowSet(b, !!rule[0](want), TXT[rule[1]] || "");
    });
  }
