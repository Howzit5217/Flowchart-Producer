// ---------------------------------------------------------------------------
//  39-orbit.js -- space, set going: orbits, and the rocket's trip
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ============================================================== space ==
  // A sun with planets drawn round it is a solar system, and running it
  // sets it going: every planet round the sun at the distance it was drawn,
  // the nearer the faster, as Kepler found -- a year that goes as the
  // distance to the power one and a half -- and each moon and satellite
  // round the planet it was drawn nearest.  A rocket with arrows from it
  // flies them, planet to planet, catching each up where it has got to;
  // one with none takes off from the planet it is on and goes round it.
  // Stars twinkle.  It goes on until it is stopped, and the 3D view
  // (38-view3d.js) shows the same sky as it goes.
  var ORBIT_BODIES = { i_sun: true, i_earth: true, i_planet: true, i_moon: true };
  var ORBIT_YEAR = 9;                    // seconds round, for a planet 200 pixels out
  var orbitAt = {};                      // id -> where it is now, while it runs
  var orbitTick = 0;                     // goes up as it moves, for the 3D view

  // What goes round what: the sun (or else the biggest body) in the
  // middle; planets round it; a moon, and anything man-made, round the
  // planet nearest it.
  function orbitPlan() {
    var bodies = hand.nodes.filter(function (n) { return ORBIT_BODIES[n.kind]; });
    var others = hand.nodes.filter(function (n) {
      return isIcon(n.kind) && !ORBIT_BODIES[n.kind] && !isArea(n.kind) && ICON_SET_OF[n.kind] === "ic_space" ||
             n.kind === "i_astronaut";
    });
    function size(n) { return Math.max(turned(n).w, turned(n).h); }
    var middle = bodies.filter(function (n) { return n.kind === "i_sun"; })
                       .sort(function (p, q) { return size(q) - size(p); })[0] ||
                 bodies.slice().sort(function (p, q) { return size(q) - size(p); })[0] || null;
    var planets = bodies.filter(function (n) { return n !== middle && n.kind !== "i_moon" && n.kind !== "i_sun"; });
    function nearest(n, among) {
      var best = null, d = Infinity;
      among.forEach(function (m) {
        var dist = Math.hypot(m.x - n.x, m.y - n.y);
        if (m !== n && dist < d) { d = dist; best = m; }
      });
      return best;
    }
    var out = bodies.map(function (n) {
      var around = null;
      if (n !== middle) {
        around = n.kind === "i_moon" ? nearest(n, planets.length ? planets : [middle]) || middle :
                 n.kind === "i_sun" ? null : middle;
      }
      return { n: n, r: size(n) * (n.kind === "i_sun" ? 0.42 : 0.36), sun: n.kind === "i_sun",
               around: around, dist: around ? Math.hypot(n.x - around.x, n.y - around.y) : 0 };
    });
    return { bodies: out, others: others, middle: middle, planets: planets, nearest: nearest };
  }

  // How fast round: Kepler's third law, scaled so a body 200 pixels out
  // takes ORBIT_YEAR seconds -- a moon round its planet a good deal faster.
  function orbitSpeed(b) {
    var period = ORBIT_YEAR * Math.pow(Math.max(30, b.dist) / 200, 1.5);
    if (b.n.kind === "i_moon") { period = Math.max(2.5, period); }   // slow enough to watch
    return 2 * Math.PI / period;         // radians a second
  }

  async function orbitRun() {
    var sky = orbitPlan();
    orbitAt = {};
    if (!sky.bodies.length && !sky.others.length) { simSay(TXT.os_empty, "warn"); return; }
    var sprites = {}, earth = sky.bodies.filter(function (b) {
      return b.n.kind === "i_earth" || /^(earth|erde|tierra|terre)$/i.test(String(b.n.text || "").trim());
    })[0];
    // everything that moves is lifted off the paper and moved as a copy
    function lift(n) {
      simLight(n.id, "sim-off");
      var size = Math.min(turned(n).w, turned(n).h - (isFigure(n.kind) ? 14 : 0));
      sprites[n.id] = simAdd(simIcon(n.kind, Math.max(18, size), undefined, undefined, simLook(n)), "sim-body");
      simPut(sprites[n.id], n.x, n.y);
      orbitAt[n.id] = { x: n.x, y: n.y };
    }
    var moving = sky.bodies.filter(function (b) { return b.around; });
    moving.forEach(function (b) {
      lift(b.n);
      b.angle = Math.atan2(b.n.y - b.around.y, b.n.x - b.around.x);
      b.speed = orbitSpeed(b);
      // say how long its year is, against the Earth's where there is one
      if (earth && b !== earth && b.around === earth.around) {
        simSay(say("os_year_vs", { who: simName(b.n), around: simName(b.around),
                                  n: (Math.pow(b.dist / Math.max(1, earth.dist), 1.5)).toFixed(2) }));
      } else {
        simSay(say("os_year", { who: simName(b.n), around: simName(b.around),
                               n: (2 * Math.PI / b.speed).toFixed(1) }));
      }
    });
    if (sky.middle) { orbitAt[sky.middle.id] = { x: sky.middle.x, y: sky.middle.y }; }
    // paper enough under every path round, so nothing goes off its edge
    var reach = { x0: Infinity, x1: -Infinity, y1: -Infinity };
    moving.forEach(function (b) {
      var mid = b.around, far = b.dist + b.r + 30;
      if (b.n.kind === "i_moon") {         // round a planet that is itself going round
        var outer = sky.bodies.filter(function (o) { return o.n === b.around; })[0];
        if (outer && outer.around) { mid = outer.around; far += outer.dist; }
      }
      reach.x0 = Math.min(reach.x0, mid.x - far); reach.x1 = Math.max(reach.x1, mid.x + far);
      reach.y1 = Math.max(reach.y1, mid.y + far);
    });
    if (reach.x0 < Infinity) { simReach = reach; drawHand(); }
    // craft: a rocket flies its arrows; a satellite goes round the
    // planet nearest it; a UFO wanders; the rest stand where they are
    var craft = sky.others.map(function (n) {
      var c = { n: n, legs: hand.links.filter(function (l) { return l.from === n.id; }) };
      if (n.kind === "i_satellite" || (n.kind === "i_rocket" && !c.legs.length)) {
        var home = sky.nearest(n, sky.bodies.map(function (b) { return b.n; }));
        if (home) {
          c.around = home;
          c.dist = Math.max(turned(home).w * 0.7, Math.hypot(n.x - home.x, n.y - home.y));
          c.angle = Math.atan2(n.y - home.y, n.x - home.x);
          c.speed = 2 * Math.PI / 4;
        }
      }
      if (n.kind === "i_ufo") { c.wander = { x: n.x, y: n.y, t: Math.random() * 10 }; }
      if (c.around || c.legs.length || c.wander) { lift(n); }
      return c;
    });
    var rocket = craft.filter(function (c) { return c.legs.length; })[0] || null;
    if (rocket) {
      rocket.leg = 0; rocket.t = 0; rocket.from = { x: rocket.n.x, y: rocket.n.y };
      simSay(say("os_launch", { who: simName(rocket.n) }));
    }
    craft.forEach(function (c) {
      if (c.around) { simSay(say("os_orbit", { who: simName(c.n), around: simName(c.around) })); }
    });
    var stars = hand.nodes.filter(function (n) { return n.kind === "i_star"; });
    var twinkle = stars.map(function (n) {
      return simAdd('<path d="M0 -10 V10 M-10 0 H10 M-5 -5 L5 5 M5 -5 L-5 5" stroke="' + simInk() +
                    '" stroke-width="1.2"/>', "sim-twinkle");
    });
    if (simFast()) { return; }           // All at once: what it would do, said
    await simLoop(function (dt, secs) {
      orbitTick++;
      // the bodies, the middle ones first so their moons can follow them
      moving.sort(function (p, q) { return (p.n.kind === "i_moon") - (q.n.kind === "i_moon"); })
            .forEach(function (b) {
              b.angle += b.speed * dt;
              var mid = orbitAt[b.around.id] || { x: b.around.x, y: b.around.y };
              var at = { x: mid.x + Math.cos(b.angle) * b.dist, y: mid.y + Math.sin(b.angle) * b.dist };
              orbitAt[b.n.id] = at;
              simPut(sprites[b.n.id], at.x, at.y);
            });
      craft.forEach(function (c) {
        var at = null;
        if (c === rocket && c.leg < c.legs.length) {
          var aim = nodeById(c.legs[c.leg].to);
          var to = aim ? (orbitAt[aim.id] || { x: aim.x, y: aim.y }) : c.from;
          c.t = Math.min(1, c.t + dt / 2.6);
          var e = c.t < 0.5 ? 2 * c.t * c.t : 1 - Math.pow(-2 * c.t + 2, 2) / 2;
          // a curve out and round, not a straight line, the way a transfer goes
          var mx = (c.from.x + to.x) / 2 - (to.y - c.from.y) * 0.25;
          var my = (c.from.y + to.y) / 2 + (to.x - c.from.x) * 0.25;
          at = { x: (1 - e) * (1 - e) * c.from.x + 2 * (1 - e) * e * mx + e * e * to.x,
                 y: (1 - e) * (1 - e) * c.from.y + 2 * (1 - e) * e * my + e * e * to.y };
          var ahead = { x: 2 * (1 - e) * (mx - c.from.x) + 2 * e * (to.x - mx), y: 2 * (1 - e) * (my - c.from.y) + 2 * e * (to.y - my) };
          simPut(sprites[c.n.id], at.x, at.y, Math.atan2(ahead.y, ahead.x) * 180 / Math.PI + 90);
          orbitAt[c.n.id] = at;
          if (c.t >= 1) {
            if (aim) {
              simSay(say("os_arrive", { who: simName(c.n), where: simName(aim) }), "good");
              simBubble(to.x, to.y - turned(aim).h / 2, say("os_landed", { where: simName(aim) }), 1200);
            }
            c.from = { x: to.x, y: to.y }; c.t = 0; c.leg++;
          }
          return;
        }
        if (c === rocket) {
          // arrived: carried along with where it landed
          var last = nodeById(c.legs[c.legs.length - 1].to);
          if (last && orbitAt[last.id]) {
            at = { x: orbitAt[last.id].x, y: orbitAt[last.id].y - turned(last).h * 0.45 };
            simPut(sprites[c.n.id], at.x, at.y);
            orbitAt[c.n.id] = at;
          }
          return;
        }
        if (c.around) {
          c.angle += c.speed * dt;
          var mid = orbitAt[c.around.id] || { x: c.around.x, y: c.around.y };
          at = { x: mid.x + Math.cos(c.angle) * c.dist, y: mid.y + Math.sin(c.angle) * c.dist };
          simPut(sprites[c.n.id], at.x, at.y, c.angle * 180 / Math.PI + 180);
          orbitAt[c.n.id] = at;
        } else if (c.wander) {
          c.wander.t += dt;
          at = { x: c.wander.x + Math.sin(c.wander.t * 0.9) * 40, y: c.wander.y + Math.sin(c.wander.t * 1.7) * 14 };
          simPut(sprites[c.n.id], at.x, at.y);
          orbitAt[c.n.id] = at;
        }
      });
      stars.forEach(function (n, k) {
        var s = 0.6 + 0.5 * Math.abs(Math.sin(secs * 2.2 + k * 1.7));
        simPut(twinkle[k], n.x, n.y - (isFigure(n.kind) && saidSomething(shownLines(n)) ? 8 : 0), secs * 20 + k * 30, s);
      });
      return true;
    });
  }

  function orbitCheck() {
    var sky = orbitPlan(), found = [];
    if (sky.planets.length && !sky.bodies.some(function (b) { return b.sun; })) {
      found.push({ text: TXT.os_no_sun });
    }
    return found;
  }
  function orbitSum() {
    var sky = orbitPlan();
    return say("os_sum", { bodies: sky.bodies.length, craft: sky.others.length });
  }

  // Put back where they were when it stops: the copies go with the layer,
  // and the 3D view goes back to where everything is drawn.
  var simEndOrbits = simEnd;
  simEnd = function () {
    simEndOrbits.apply(this, arguments);
    orbitAt = {};
    if (typeof V3 !== "undefined" && V3) { V3.dirty = true; }
  };

  SCENES.space = { run: orbitRun, check: orbitCheck, sum: orbitSum };
