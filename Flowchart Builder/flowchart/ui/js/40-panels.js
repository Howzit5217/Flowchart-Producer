// ---------------------------------------------------------------------------
//  40-panels.js -- the 3D view's panels kept from piling up: the newest one
//  open wins the space it needs, each sheet has its own close button, the
//  "inside the walls" key can be put away with the walls still seen
//  through, and Escape shuts what is open before it leaves the view
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-03: "there seems to be some issues with menus
  // overlaying on top of one another and other menus appearing with no way
  // of dismissing them while keeping the feature active and working")
  //
  // The panels over the view: two sheets opened from the bar (Materials,
  // Settings), shut by their buttons; and the key to what is seen inside
  // the walls, there while X-ray is on -- put away to a small tab, never
  // shut, so X-ray stays on.
  var PN_SHEETS = [{ sel: ".v3-mats:not(.v3-set)", btn: '[data-v3="mats"]' }, { sel: ".v3-set", btn: '[data-v3="set"]' }];
  var PN_KEYS = [{ sel: ".v3-xray", flag: "xrayMin" }];
  var pnOrder = [];                          // which opened last: the sheets' and keys' selectors, newest last
  function pnShown(e) {
    if (!e || e.hidden || e.classList.contains("pn-min")) { return false; }
    var cs = getComputedStyle(e);
    return cs.display !== "none" && cs.visibility !== "hidden";
  }
  function pnMeet(a, b) {
    var p = a.getBoundingClientRect(), q = b.getBoundingClientRect();
    return p.left < q.right - 2 && p.right > q.left + 2 && p.top < q.bottom - 2 && p.bottom > q.top + 2;
  }
  function pnShut(one) {
    if (!V3 || !V3.box) { return; }
    var e = el(one.sel, V3.box);
    if (!pnShown(e)) { return; }
    if (one.btn) { var b = el(one.btn, V3.box); if (b) { b.click(); } else { e.hidden = true; } return; }
    pnMin(one, true);
  }
  // The key put away (a tab with its name, to bring it back) or out again.
  function pnMin(one, min) {
    var e = el(one.sel, V3.box);
    if (!e) { return; }
    V3[one.flag] = !!min;
    e.classList.toggle("pn-min", !!min);
    var t = el(".pn-tuck", e);
    if (t) { t.setAttribute("aria-expanded", min ? "false" : "true"); t.title = min ? TXT.pn_show : TXT.pn_hide; t.setAttribute("aria-label", t.title); }
  }
  // The one opened now keeps its place: any other it lands on is shut (a
  // sheet) or put away (a key).
  function pnTidy(newest) {
    if (!V3 || !V3.box) { return; }
    var all = PN_SHEETS.concat(PN_KEYS), now = all.filter(function (o) { return o.sel === newest; })[0];
    if (!now) { return; }
    var mine = el(now.sel, V3.box);
    if (!pnShown(mine)) { return; }
    pnOrder = pnOrder.filter(function (s) { return s !== newest; }).concat([newest]);
    all.forEach(function (o) {
      if (o === now) { return; }
      var e = el(o.sel, V3.box);
      if (!pnShown(e)) { return; }
      // (two sheets: one at a time, wherever they are)
      if ((o.btn && now.btn) || pnMeet(e, mine)) { pnShut(o); }
    });
  }
  // The bar's buttons, heard before their own handlers: which was opened.
  document.addEventListener("click", function (ev) {
    if (typeof V3 === "undefined" || !V3 || !V3.box || !ev.target || !ev.target.closest) { return; }
    var b = ev.target.closest(".v3-bar [data-v3]");
    if (!b || !V3.box.contains(b)) { return; }
    var k = b.dataset.v3, sel = k === "mats" ? PN_SHEETS[0].sel : k === "set" ? PN_SHEETS[1].sel : k === "xray" ? PN_KEYS[0].sel : null;
    if (!sel) { return; }
    // (X-ray turned on: its key out again, whatever it was left as)
    if (k === "xray") { V3.xrayMin = false; }
    setTimeout(function () { try { pnTidy(sel); } catch (e) { /* as they are */ } }, 0);
  }, true);
  // Escape: the newest open shut (a key put away), then the next -- only
  // with nothing open does it go back to the plan (38-view3d.js).
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape" || typeof V3 === "undefined" || !V3 || !V3.box) { return; }
    var t = ev.target;
    if (t && t.closest && (t.closest("input, textarea, select, [contenteditable]") || !V3.box.contains(t) && t !== document.body)) { return; }
    var all = PN_SHEETS.concat(PN_KEYS), open = all.filter(function (o) { return pnShown(el(o.sel, V3.box)); });
    if (!open.length) { return; }
    open.sort(function (a, b) { return pnOrder.indexOf(a.sel) - pnOrder.indexOf(b.sel); });
    pnShut(open[open.length - 1]);
    ev.preventDefault(); ev.stopPropagation();
  }, true);
  // A sheet's own close button, at the top of it (39-house.js, 39-design.js).
  function pnCloser(btnSel) {
    var x = document.createElement("button");
    x.type = "button";
    x.className = "pn-close";
    x.title = TXT.pn_close; x.setAttribute("aria-label", TXT.pn_close);
    x.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
    x.onclick = function (ev) { ev.stopPropagation(); var b = V3 && V3.box ? el(btnSel, V3.box) : null; if (b) { b.click(); } };
    // (its row told it holds one, for room beside it: no :has() in the page's rules, a big drawing restyled slowly)
    setTimeout(function () { if (x.parentNode) { x.parentNode.classList.add("pn-closable"); } }, 0);
    return x;
  }
  // The key: a button in its head to put it away and bring it back.
  if (typeof xrayPanel === "function") {
    var xrayPanelWhole = xrayPanel;
    xrayPanel = function () {
      var out = xrayPanelWhole.apply(this, arguments);
      try {
        var box = V3 && V3.box ? el(".v3-xray", V3.box) : null, head = box ? el(".v3-xray-head", box) : null;
        if (head && !el(".pn-tuck", head)) {
          var t = document.createElement("button");
          t.type = "button";
          t.className = "pn-tuck";
          t.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 10l4-4 4 4"/></svg>';
          t.onclick = function (ev) { ev.stopPropagation(); pnMin(PN_KEYS[0], !V3.xrayMin); if (!V3.xrayMin) { pnTidy(PN_KEYS[0].sel); } };
          head.appendChild(t);
          // (the head itself, put away, brings it back)
          head.onclick = function (ev) { if (V3.xrayMin && ev.target === head) { pnMin(PN_KEYS[0], false); pnTidy(PN_KEYS[0].sel); } };
        }
        if (box) { pnMin(PN_KEYS[0], !!V3.xrayMin); }
      } catch (e) { /* as it was */ }
      return out;
    };
  }
