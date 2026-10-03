// ---------------------------------------------------------------------------
//  40-texture.js -- textures in 3D, on or off: what things are made of in
//  their patterns, with the ridges and grooves of them catching the light
//  (brick standing proud of its mortar, siding course over course, logs
//  round) and metal and glass shining; or plain colors
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "Update the designs too so you can set textures
  // on or off so they don't look flat and they have some nice metal shine or
  // ridged design like brick")
  //
  // The shader (38-view3d-gl.js) does the work: each pattern says how high
  // it stands where (`bump`), the face is tilted by how that changes from
  // pixel to pixel, and brushed steel, a metal roof, corrugated sheet and a
  // solar panel have the sky in them.  Here is the switch -- kept in the
  // browser, like the weather: it is how the view is seen, not the house.
  // Off, everything is its plain color, and quicker to draw.
  function texOn() {
    try { return localStorage.getItem("flowchart-3d-textures") !== "0"; } catch (e) { return true; }
  }
  function texSet(on) {
    try { localStorage.setItem("flowchart-3d-textures", on ? "1" : "0"); } catch (e) { /* this visit only */ }
    if (typeof V3 !== "undefined" && V3) { V3.dirty = true; }
  }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.texture = '<rect x="3" y="3.5" width="14" height="13" rx="1"/><path d="M3 7.8h14M3 12.2h14M8.2 3.5v4.3M12.4 7.8v4.4M7.6 12.2v4.3"/>';
  }
  // In the view's Settings, on the House tab (39-house.js), under the style.
  function texSection(sheet, head, draw) {
    head(TXT.tx_head);
    var grid = document.createElement("div"), on = texOn();
    grid.className = "hs-tiles";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "hs-tile";
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.innerHTML = houseIcon("texture") + '<span class="hs-tile-name"></span><span class="hs-tile-tick" aria-hidden="true">' +
                  '<svg viewBox="0 0 16 16"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg></span>';
    b.querySelector(".hs-tile-name").textContent = TXT.tx_on;
    b.title = TXT.tx_tip;
    b.onclick = function () { texSet(!texOn()); draw(); };
    grid.appendChild(b);
    sheet.appendChild(grid);
  }
  if (typeof styleSection === "function") {
    var styleSectionTex = styleSection;
    styleSection = function (sheet, head) {
      var out = styleSectionTex.apply(this, arguments);
      try { texSection(sheet, head, arguments[2]); } catch (e) { /* the sheet without it */ }
      return out;
    };
  }
