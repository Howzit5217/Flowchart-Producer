// ---------------------------------------------------------------------------
//  39-flows.js -- work passed from hand to hand, data sent round a
//  network, vehicles driven on their routes, and any arrows followed
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // Four drawings that are all things going along arrows, each run as
  // what goes along them (SCENES, 37-board.js):
  //
  //   people    the work: a card carried from one person to the next, each
  //             doing what they do for a living with it -- the waiter takes
  //             the order, the chef cooks it.  Arrows that only branch out
  //             (an organisation chart) share the work out and bring it
  //             back; arrows that come round again are taken each in turn.
  //   network   data: from every device to the nearest server, through the
  //             routers and firewalls between, and the answer back.
  //   travel    the vehicles: each along the arrows that leave it, stopping
  //             at every place on the way.
  //   anything  a token, from where the arrows start, along every one.
  var FLOW_STEP = 220;                   // pixels a second, along an arrow
  var NET_SERVERS = { i_server: true, i_database: true, i_internet: true, cloud: true, store: true };
  var NET_CLIENTS = { i_computer: true, i_laptop: true, i_tablet: true, i_phone: true, i_camera: true };
  var VEHICLES = { i_car: 160, i_bus: 120, i_truck: 120, i_bike: 80, i_train: 200, i_plane: 320, i_ship: 90,
                   i_taxi: 160, i_tram: 130, i_helicopter: 260, i_scooter: 90 };

  function flowGraph() {
    var outs = {}, ins = {};
    hand.nodes.forEach(function (n) { outs[n.id] = []; ins[n.id] = []; });
    hand.links.forEach(function (l) {
      if (outs[l.from] && ins[l.to]) { outs[l.from].push(l); ins[l.to].push(l); }
    });
    return { outs: outs, ins: ins };
  }

  // Whether the arrows come back round anywhere.
  function flowLoops(g) {
    var state = {}, round = false;
    function visit(id) {
      state[id] = 1;
      (g.outs[id] || []).forEach(function (l) {
        if (state[l.to] === 1) { round = true; }
        else if (!state[l.to]) { visit(l.to); }
      });
      state[id] = 2;
    }
    hand.nodes.forEach(function (n) { if (!state[n.id]) { visit(n.id); } });
    return round;
  }

  // Something carried along an arrow, from its start to its end (or back,
  // `back`), in `ms` -- or at FLOW_STEP where none is given.
  async function flowCarry(link, sprite, back, speed) {
    var pts = simRoute(link);
    if (back) { pts = pts.slice().reverse(); }
    var len = simLength(pts);
    await simAnimate(Math.max(320, len / (speed || FLOW_STEP) * 1000), function (t) {
      var p = simAlong(pts, t);
      simPut(sprite, p.x, p.y);
    });
  }

  // A little clock over the top corner of a shape, going round while it
  // works at something.
  async function flowWork(n, ms) {
    var r = 7, x = n.x + turned(n).w / 2 - 2, y = n.y - turned(n).h / 2 + 2, round = 2 * Math.PI * r;
    var ring = simAdd('<circle r="' + (r + 2.5) + '" fill="' + simSheet() + '" stroke="' + simInk() + '" stroke-width="1"/>' +
                      '<circle class="sim-clock" r="' + r + '" fill="none" stroke="' + simInk() +
                      '" stroke-width="3" stroke-dasharray="0 ' + round + '" transform="rotate(-90)"/>', "sim-work");
    simPut(ring, x, y);
    var arc = ring && ring.lastChild;
    await simAnimate(ms, function (t) {
      if (arc) { arc.setAttribute("stroke-dasharray", (round * t).toFixed(1) + " " + round.toFixed(1)); }
    });
    simDrop(ring);
  }

  function flowCard() {                  // the work itself: a sheet with writing on it
    return simAdd('<rect x="-8" y="-10" width="16" height="20" rx="1.5" fill="' + simSheet() + '" stroke="' +
                  simInk() + '" stroke-width="1.2"/><path d="M-4.5 -5 H4.5 M-4.5 -1 H4.5 M-4.5 3 H2" stroke="' +
                  simInk() + '" stroke-width="1"/>', "sim-token");
  }

  // ---- people: the work passed on ------------------------------------------
  function teamPeople() { return hand.nodes.filter(function (n) { return isPerson(n); }); }

  function teamDoes(n) {
    if (isPerson(n)) { return TXT["vb_" + (n.kind === "actor" ? "i_person" : n.kind)] || TXT.vb_i_person; }
    return simName(n);                   // a step in the work, saying what it is
  }

  async function teamRun() {
    var g = flowGraph(), people = teamPeople();
    var busy = {}, hands = 0;
    function worked(n) { busy[n.id] = (busy[n.id] || 0) + 1; }
    if (!hand.links.length) {
      // nobody passes anything on: each does their own job, in turn
      if (!people.length) { simSay(TXT.tw_alone, "warn"); return; }
      simSay(TXT.tw_alone, "warn");
      for (var k = 0; k < people.length; k++) {
        var p = people[k];
        simLight(p.id, "now");
        simSay(say("tw_works", { who: simName(p), does: teamDoes(p) }));
        simBubble(p.x, p.y - turned(p).h / 2, teamDoes(p), 1100);
        await flowWork(p, 900);
        simLight(p.id, null);
        await simStep();
      }
      return;
    }
    var starts = hand.nodes.filter(function (n) { return !g.ins[n.id].length && g.outs[n.id].length; });
    // a customer or a patient is where the work comes from, if there is one
    var from = hand.nodes.filter(function (n) {
      return (n.kind === "i_customer" || n.kind === "i_patient") && g.outs[n.id].length;
    });
    if (!starts.length) { starts = from.length ? from.slice(0, 1) : [nodeById(hand.links[0].from)]; }
    var splits = !flowLoops(g) && hand.nodes.some(function (n) { return g.outs[n.id].length > 1; });

    var visits = {};
    // The first time the work reaches somebody they do their job; brought
    // back to them later, they do what the arrow they pass it on by says
    // (a waiter takes the order, and later serves it).
    async function doWork(n, next) {
      simLight(n.id, "now");
      visits[n.id] = (visits[n.id] || 0) + 1;
      var does = visits[n.id] > 1 ? (next && next.label ? next.label : TXT.tw_again) : teamDoes(n);
      simSay(say("tw_works", { who: simName(n), does: does }));
      simBubble(n.x, n.y - turned(n).h / 2, does, 1000);
      worked(n);
      await flowWork(n, 700 + Math.random() * 500);
      simLight(n.id, "sim-used");
    }

    if (splits) {
      // shared out down the arrows, every branch at once, and brought back
      async function share(n) {
        await doWork(n);
        var outs = g.outs[n.id];
        if (!outs.length) { return; }
        simSay(say("tw_shares", { who: simName(n), to: outs.map(function (l) { return simName(nodeById(l.to)); }).join(", ") }));
        await simStep();
        await Promise.all(outs.map(async function (l) {
          var card = flowCard();
          hands++;
          await flowCarry(l, card);
          simDrop(card);
          await share(nodeById(l.to));
          var back = flowCard();
          await flowCarry(l, back, true);
          simDrop(back);
        }));
        simLight(n.id, "now");
        simSay(say("tw_back", { who: simName(n) }));
        await simWait(500);
        simLight(n.id, "sim-used");
      }
      for (var s = 0; s < starts.length; s++) { await share(starts[s]); }
    } else {
      // passed on, one arrow at a time, each arrow once
      var taken = {};
      for (var s2 = 0; s2 < starts.length; s2++) {
        var at = starts[s2], card = flowCard(), steps = 0;
        simPut(card, at.x, at.y);
        while (at && steps++ < 80) {
          var next = g.outs[at.id].filter(function (l) { return !taken[hand.links.indexOf(l)]; })[0];
          await doWork(at, next);
          if (!next) { break; }
          taken[hand.links.indexOf(next)] = true;
          var to = nodeById(next.to);
          simSay(next.label ? say("tw_hands_what", { who: simName(at), to: simName(to), what: next.label })
                            : say("tw_hands", { who: simName(at), to: simName(to) }));
          await simStep();
          hands++;
          simLight(at.id, "sim-used");
          await flowCarry(next, card);
          at = to;
        }
        simDrop(card);
      }
    }
    var most = null;
    Object.keys(busy).forEach(function (id) { if (!most || busy[id] > busy[most]) { most = id; } });
    simSay(say("tw_done", { hands: hands, people: Object.keys(busy).length,
                           who: most ? simName(nodeById(+most) || nodeById(most)) : "-" }), "good");
  }

  function teamCheck() {
    var g = flowGraph(), found = [];
    teamPeople().forEach(function (p) {
      if (!g.outs[p.id].length && !g.ins[p.id].length && hand.links.length) {
        found.push({ text: say("tw_loose", { who: simName(p) }), id: p.id });
      }
    });
    return found;
  }
  function teamSum() {
    return say("tw_sum", { people: teamPeople().length, arrows: hand.links.length });
  }

  // ---- a network: data sent ---------------------------------------------------
  function netKind(n) {
    if (NET_SERVERS[n.kind]) { return "server"; }
    if (NET_CLIENTS[n.kind] || isPerson(n)) { return "client"; }
    return "between";
  }

  // Cables go both ways: the way from one device to the nearest of some
  // others, as the arrows between them, each with the end it is crossed from.
  function netWay(fromId, wanted) {
    var near = {}, back = {}, todo = [fromId];
    near[fromId] = true;
    while (todo.length) {
      var id = todo.shift();
      if (id !== fromId && wanted[id]) {
        var legs = [];
        for (var at = id; at !== fromId; at = back[at].from) { legs.unshift(back[at]); }
        return legs;
      }
      hand.links.forEach(function (l) {
        var other = l.from === id ? l.to : l.to === id ? l.from : null;
        if (other === null || near[other] || !nodeById(other)) { return; }
        near[other] = true;
        back[other] = { link: l, from: id, to: other, back: l.to === id };
        todo.push(other);
      });
    }
    return null;
  }

  function netPacket(answer) {
    return simAdd('<rect x="-5" y="-5" width="10" height="10" rx="2" fill="' + (answer ? simSheet() : simInk()) +
                  '" stroke="' + simInk() + '" stroke-width="1.3"/>', "sim-token");
  }

  async function netRun() {
    var devices = hand.nodes.filter(function (n) { return !isArea(n.kind) && !BOARD_NEUTRAL[n.kind]; });
    var servers = {}, clients = [];
    devices.forEach(function (n) {
      var k = netKind(n);
      if (k === "server") { servers[n.id] = true; }
      if (k === "client") { clients.push(n); }
    });
    var pinging = !Object.keys(servers).length;
    if (!clients.length) { clients = devices.filter(function (n) { return !servers[n.id]; }); }
    if (!hand.links.length || !clients.length) { simSay(TXT.nw_cables, "warn"); return; }
    var got = 0;
    await Promise.all(clients.map(async function (c, k) {
      await simWait(k * 280);
      var wanted = {};
      if (pinging) {
        clients.forEach(function (o) { if (o !== c) { wanted[o.id] = true; } });
      } else { wanted = servers; }
      var legs = netWay(c.id, wanted);
      if (!legs) { simSay(say("nw_none", { who: simName(c) }), "warn"); return; }
      simLight(c.id, "now");
      var packet = netPacket(false), ms = 0;
      for (var i = 0; i < legs.length; i++) {
        await flowCarry(legs[i].link, packet, legs[i].back, 260);
        ms += 4 + Math.round(Math.random() * 9);
        var on = nodeById(legs[i].to);
        if (on.kind === "i_firewall") { simBubble(on.x, on.y - turned(on).h / 2, TXT.nw_allowed, 700); }
        simLight(on.id, "now");
        setTimeout(function (id) { return function () { if (simNow) { simLight(id, null); } }; }(on.id), 400);
      }
      simDrop(packet);
      var end = nodeById(legs[legs.length - 1].to);
      simBubble(end.x, end.y - turned(end).h / 2, TXT.nw_reply, 700);
      var answer = netPacket(true);
      for (var j = legs.length - 1; j >= 0; j--) {
        await flowCarry(legs[j].link, answer, !legs[j].back, 260);
        ms += 4 + Math.round(Math.random() * 9);
      }
      simDrop(answer);
      simLight(c.id, null);
      got++;
      var path = [simName(c)].concat(legs.map(function (l) { return simName(nodeById(l.to)); })).join(" → ");
      simSay(say("nw_route", { path: path, ms: ms }));
    }));
    simSay(say("nw_ok", { n: got, all: clients.length }), got === clients.length ? "good" : "warn");
  }

  function netCheck() {
    var found = [], joined = {};
    hand.links.forEach(function (l) { joined[l.from] = joined[l.to] = true; });
    hand.nodes.forEach(function (n) {
      if (!joined[n.id] && !isArea(n.kind) && !BOARD_NEUTRAL[n.kind]) {
        found.push({ text: say("nw_loose", { who: simName(n) }), id: n.id });
      }
    });
    return found;
  }
  function netSum() {
    var devices = hand.nodes.filter(function (n) { return !isArea(n.kind) && !BOARD_NEUTRAL[n.kind]; }).length;
    return say("nw_sum", { devices: devices, cables: hand.links.length });
  }

  // ---- travel: vehicles on their routes --------------------------------------
  // A vehicle goes along the arrows that leave it, and on from each place
  // along the arrows that leave that, each arrow once -- so a bus drawn
  // round a loop of stops goes round it once and is back where it began.
  function cityRoute(v, g) {
    var legs = [], taken = {}, at = v;
    for (var k = 0; k < 24 && at; k++) {
      var next = (g.outs[at.id] || []).filter(function (l) { return !taken[hand.links.indexOf(l)]; })[0];
      if (!next) { break; }
      taken[hand.links.indexOf(next)] = true;
      legs.push(next);
      at = nodeById(next.to);
      if (VEHICLES[at.kind]) { break; }   // another vehicle's: that one takes it from there
    }
    return legs;
  }

  async function cityRun() {
    var g = flowGraph();
    var vehicles = hand.nodes.filter(function (n) { return VEHICLES[n.kind]; });
    if (!vehicles.length) { return flowRun(); }
    var lights = hand.nodes.filter(function (n) { return n.kind === "i_traffic"; });
    // where each light's three lamps are: as the icon draws them (03-icon-art.js)
    var blink = lights.map(function (n) {
      var at = iconFrame(n.kind, n.x, n.y, n.w, n.h, shownLines(n), handType(n).line);
      var lamp = simAdd('<circle r="' + (3.6 * at.sx).toFixed(1) + '" fill="' + simInk() + '" stroke="' +
                        simSheet() + '" stroke-width="1"/>', "sim-lamp");
      return { n: n, lamp: lamp, at: at };
    });
    var routes = vehicles.map(function (v) { return { v: v, legs: cityRoute(v, g) }; });
    if (!routes.some(function (r) { return r.legs.length; })) { simSay(TXT.cy_none, "warn"); return; }
    var going = true;
    // the traffic lights going through their three while everything drives
    (async function () {
      var k = 0;
      while (going && simNow) {
        blink.forEach(function (b) {
          var rows = [28.6, 10.6, 19.6];   // go, stop, get ready: the lamps' heights in the icon
          simPut(b.lamp, b.at.ox + 24 * b.at.sx, b.at.oy + rows[k % 3] * b.at.sy);
        });
        k++;
        try { await simWait(900); } catch (e) { return; }
      }
    })();
    await Promise.all(routes.map(async function (r, k) {
      if (!r.legs.length) { simSay(say("cy_still", { who: simName(r.v) }), "warn"); return; }
      await simWait(k * 300);
      simLight(r.v.id, "sim-off");
      var size = Math.max(28, Math.min(turned(r.v).w, 56));
      var car = simAdd(simIcon(r.v.kind, size, undefined, undefined, simLook(r.v)), "sim-vehicle");
      simPut(car, r.v.x, r.v.y);
      var stops = [];
      for (var i = 0; i < r.legs.length; i++) {
        await flowCarry(r.legs[i], car, false, VEHICLES[r.v.kind]);
        var place = nodeById(r.legs[i].to);
        stops.push(simName(place));
        simLight(place.id, "now");
        simBubble(place.x, place.y - turned(place).h / 2, say("cy_stop", { place: simName(place) }), 800);
        await simWait(600);
        simLight(place.id, null);
        await simStep();
      }
      simDrop(car);
      simLight(r.v.id, null);
      simSay(say("cy_route", { who: simName(r.v), stops: stops.join(" → ") }));
    }));
    going = false;
    blink.forEach(function (b) { simDrop(b.lamp); });
  }

  function cityCheck() {
    var g = flowGraph(), found = [];
    hand.nodes.forEach(function (n) {
      if (VEHICLES[n.kind] && !g.outs[n.id].length) {
        found.push({ text: say("cy_still", { who: simName(n) }), id: n.id });
      }
    });
    return found;
  }
  function citySum() {
    var vehicles = hand.nodes.filter(function (n) { return VEHICLES[n.kind]; }).length;
    return say("cy_sum", { vehicles: vehicles, places: hand.nodes.length - vehicles });
  }

  // ---- anything: the arrows followed ------------------------------------------
  async function flowRun() {
    var g = flowGraph();
    if (!hand.links.length) { simSay(TXT.fw_none, "warn"); return; }
    var starts = hand.nodes.filter(function (n) { return !g.ins[n.id].length && g.outs[n.id].length; });
    if (!starts.length) { starts = [nodeById(hand.links[0].from)]; }
    var taken = {}, count = 0;
    for (var s = 0; s < starts.length; s++) {
      var at = starts[s], dot = simAdd('<circle r="6" fill="' + simInk() + '" stroke="' + simSheet() +
                                       '" stroke-width="2"/>', "sim-token");
      simPut(dot, at.x, at.y);
      for (var k = 0; at && k < 120; k++) {
        simLight(at.id, "now");
        simSay(say("fw_at", { what: simName(at) }));
        await simWait(450);
        await simStep();
        var outs = g.outs[at.id].filter(function (l) { return !taken[hand.links.indexOf(l)]; });
        if (!outs.length) { simLight(at.id, null); break; }
        // a question: one way, picked as a coin would pick it
        var next = asksKind(at.kind) ? outs[Math.floor(Math.random() * outs.length)] : outs[0];
        taken[hand.links.indexOf(next)] = true;
        if (next.label) { simBubble(at.x, at.y - turned(at).h / 2, next.label, 700); }
        simLight(at.id, "sim-used");
        await flowCarry(next, dot);
        count++;
        at = nodeById(next.to);
      }
      simDrop(dot);
    }
    simSay(say("fw_done", { n: count }), "good");
  }
  function flowSum() {
    return say("fw_sum", { shapes: hand.nodes.length, arrows: hand.links.length });
  }

  SCENES.team = { run: teamRun, check: teamCheck, sum: teamSum };
  SCENES.network = { run: netRun, check: netCheck, sum: netSum };
  SCENES.city = { run: cityRun, check: cityCheck, sum: citySum };
  SCENES.flow = { run: flowRun, sum: flowSum };
